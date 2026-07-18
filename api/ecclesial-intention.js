// Devuelve un titular de noticia REAL y VERIFICADO tomado directamente del
// feed RSS OFICIAL de Vatican News (el medio de comunicación propio del
// Vaticano, gestionado por el Dicasterio para la Comunicación), para que el
// frontend le pida a Claude que redacte la intención de oración SOLO a
// partir de ese titular verificado (nunca inventado).
//
// Antes esto usaba una busqueda generica en GNews ("Catholic Church" OR
// Vatican OR ...), que podia traer cobertura de medios no catolicos o poco
// fiables. Vatican News es una fuente oficial y no requiere API key ni
// cuota, asi que tambien es mas confiable que depender de GNews aqui.
//
// Cachea el resultado del dia en Supabase (tabla daily_intentions),
// compartido entre TODOS los usuarios, para no golpear el feed en cada
// visita. Solo se cachea un exito; si el feed falla, no se guarda nada y se
// reintenta en la proxima visita.
//
// Requiere las variables de entorno REACT_APP_SUPABASE_URL y
// SUPABASE_SERVICE_ROLE_KEY (el feed de Vatican News es publico, sin key).

import { createClient } from "@supabase/supabase-js";

const VATICAN_NEWS_RSS = {
  en: "https://www.vaticannews.va/en.rss.xml",
  es: "https://www.vaticannews.va/es.rss.xml",
};

function decodeXmlEntities(str) {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;|&apos;/g, "'")
    .replace(/&nbsp;/g, " ");
}

function stripHtmlTags(str) {
  return decodeXmlEntities(str.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ")).trim();
}

function extractTag(xml, tag) {
  const m = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`));
  if (!m) return "";
  const raw = m[1];
  const cdata = raw.match(/<!\[CDATA\[([\s\S]*?)\]\]>/);
  return stripHtmlTags(cdata ? cdata[1] : raw)
    .replace(/\s*(Read all|Leer todo)\s*$/i, "")
    .trim();
}

async function fetchFirstVaticanNewsItem(lang) {
  const res = await fetch(VATICAN_NEWS_RSS[lang], {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; MaterApp/1.0)" },
  });
  if (!res.ok) throw new Error("Error al consultar Vatican News: " + res.status);
  const xml = await res.text();
  const itemMatch = xml.match(/<item>([\s\S]*?)<\/item>/);
  if (!itemMatch) return null;
  const itemXml = itemMatch[1];

  const title = extractTag(itemXml, "title");
  const description = extractTag(itemXml, "description");
  const linkMatch = itemXml.match(/<link>([\s\S]*?)<\/link>/);
  const pubDateMatch = itemXml.match(/<pubDate>([\s\S]*?)<\/pubDate>/);

  if (!title) return null;

  return {
    title,
    description,
    link: linkMatch ? linkMatch[1].trim() : "",
    pubDate: pubDateMatch ? pubDateMatch[1].trim() : "",
  };
}

export default async function handler(req, res) {
  const lang = req.query.lang === "en" ? "en" : "es";
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD (UTC)

  const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const admin = supabaseUrl && serviceRoleKey ? createClient(supabaseUrl, serviceRoleKey) : null;

  try {
    if (admin) {
      const { data: cached } = await admin
        .from("daily_intentions")
        .select("data")
        .eq("type", "ecclesial")
        .eq("lang", lang)
        .eq("date", today)
        .maybeSingle();
      if (cached) {
        res.status(200).json(cached.data);
        return;
      }
    }

    const item = await fetchFirstVaticanNewsItem(lang);

    if (!item) {
      res.status(200).json({ found: false });
      return;
    }

    const result = {
      found: true,
      titulo: item.title,
      resumen_original: item.description || "",
      fuente: "Vatican News",
      url: item.link || "",
      fecha: item.pubDate || "",
    };

    if (admin) {
      await admin.from("daily_intentions").upsert(
        { type: "ecclesial", lang, date: today, data: result },
        { onConflict: "type,lang,date" }
      );
    }

    res.status(200).json(result);
  } catch (err) {
    res.status(200).json({ found: false, error: err.message });
  }
}
