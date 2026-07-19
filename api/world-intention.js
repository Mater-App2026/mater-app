// Devuelve un titular de noticia REAL y VERIFICADO (via GNews.io) de actualidad
// mundial general (no limitado a desastres/crisis), para que el frontend le pida
// a Claude que redacte la intención de oración SOLO a partir de ese titular
// verificado (nunca inventado).
//
// Cachea el resultado del día en Supabase (tabla daily_intentions), compartido
// entre TODOS los usuarios, para no agotar la cuota gratuita de GNews cuando
// cada visitante dispararía su propia llamada. Solo se cachea un éxito; si
// GNews falla, no se guarda nada y se reintenta en la próxima visita.
//
// Requiere las variables de entorno GNEWS_API_KEY, REACT_APP_SUPABASE_URL y
// SUPABASE_SERVICE_ROLE_KEY.

import { createClient } from "@supabase/supabase-js";

// Medios estatales del regimen cubano: son organos de propaganda del Partido
// Comunista de Cuba, no prensa independiente, y no deben tratarse como
// fuente "verificada" para una intencion de oracion. Se filtran de raiz.
const CUBAN_STATE_MEDIA = [
  "granma.cu", "prensa-latina.cu", "prensa-latina.com", "cubadebate.cu",
  "jrebelde.cu", "acn.cu", "radioreloj.cu", "radiorebelde.cu", "cubasi.cu",
  "cubaminrex.cu", "trabajadores.cu", "tvcubana.icrt.cu",
];

function isCubanStateMedia(article) {
  const url = (article.url || "").toLowerCase();
  const source = (article.source?.name || article.source?.url || "").toLowerCase();
  return CUBAN_STATE_MEDIA.some(domain => url.includes(domain) || source.includes(domain));
}

// Cualquier titular sobre Cuba (venga de donde venga) se reemplaza por esta
// intencion fija: pedido explicito del autor de la app, dada la naturaleza
// del regimen y la persecucion religiosa historica en la isla. No pretende
// resumir la noticia real del dia — es una intencion de oracion permanente,
// asi que no se atribuye a ninguna fuente periodistica.
const CUBA_INTENTION = {
  es: {
    titulo: "Por la libertad de Cuba",
    resumen_original: "Cuba continúa bajo el régimen comunista de partido único vigente desde 1959, con una larga historia de represión política y restricciones a la libertad religiosa.",
  },
  en: {
    titulo: "For the freedom of Cuba",
    resumen_original: "Cuba remains under the one-party communist regime in power since 1959, with a long history of political repression and restrictions on religious freedom.",
  },
};

function isCubaRelated(article) {
  const text = ((article.title || "") + " " + (article.description || "")).toLowerCase();
  return /\bcuba\b/.test(text) || isCubanStateMedia(article);
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
        .eq("type", "world")
        .eq("lang", lang)
        .eq("date", today)
        .maybeSingle();
      if (cached) {
        res.status(200).json(cached.data);
        return;
      }
    }

    const apiKey = process.env.GNEWS_API_KEY;
    if (!apiKey) throw new Error("GNEWS_API_KEY no configurada");

    // Top-headlines generales de la categoria "world" (politica, economia,
    // relaciones internacionales, sociedad, etc.) en vez de una busqueda
    // acotada a palabras clave de desastres/crisis humanitarias.
    // Algunos idiomas/categorias tienen cobertura mas escasa en GNews en
    // ciertos momentos del dia; si "world" no trae nada, probamos "general"
    // antes de rendirnos. Tambien reintentamos una vez ante fallos de red o
    // errores transitorios del lado de GNews (p. ej. 429/5xx).
    async function fetchHeadlines(category) {
      const url = `https://gnews.io/api/v4/top-headlines?category=${category}&lang=${lang}&max=10&apikey=${apiKey}`;
      let lastErr = null;
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          const newsRes = await fetch(url);
          if (!newsRes.ok) { lastErr = new Error("Error al consultar GNews: " + newsRes.status); continue; }
          const data = await newsRes.json();
          return data.articles || [];
        } catch (e) {
          lastErr = e;
        }
      }
      if (lastErr) throw lastErr;
      return [];
    }

    let articles = await fetchHeadlines("world");
    if (!articles.length) articles = await fetchHeadlines("general");

    // Los medios estatales cubanos nunca cuentan como fuente verificada,
    // sea cual sea el pais o tema del articulo.
    articles = articles.filter(a => !isCubanStateMedia(a));

    // El titular #1 (mas prominente/relevante).
    const article = articles.length ? articles[0] : null;

    if (!article) {
      res.status(200).json({ found: false });
      return;
    }

    // Cualquier titular sobre Cuba se reemplaza por la intencion fija de
    // libertad para Cuba, en vez de redactar a partir del titular real.
    const result = isCubaRelated(article) ? {
      found: true,
      titulo: CUBA_INTENTION[lang].titulo,
      resumen_original: CUBA_INTENTION[lang].resumen_original,
      fuente: "",
      url: "",
      fecha: new Date().toISOString(),
    } : {
      found: true,
      titulo: article.title,
      resumen_original: article.description || "",
      fuente: article.source?.name || "",
      url: article.url || "",
      fecha: article.publishedAt || "",
    };

    if (admin) {
      await admin.from("daily_intentions").upsert(
        { type: "world", lang, date: today, data: result },
        { onConflict: "type,lang,date" }
      );
    }

    res.status(200).json(result);
  } catch (err) {
    res.status(200).json({ found: false, error: err.message });
  }
}
