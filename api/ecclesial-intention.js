// Devuelve un titular de noticia REAL y VERIFICADO (via GNews.io) sobre la
// Iglesia Católica en el mundo (Vaticano, Papa, obispos, sínodos, etc.), para
// que el frontend le pida a Claude que redacte la intención de oración SOLO a
// partir de ese titular verificado (nunca inventado).
//
// Cachea el resultado del día en Supabase (tabla daily_intentions), compartido
// entre TODOS los usuarios, para no agotar la cuota gratuita de GNews cuando
// cada visitante dispararía su propia llamada. Solo se cachea un éxito; si
// GNews falla, no se guarda nada y se reintenta en la próxima visita.
//
// Requiere las variables de entorno GNEWS_API_KEY, REACT_APP_SUPABASE_URL y
// SUPABASE_SERVICE_ROLE_KEY.

import { createClient } from "@supabase/supabase-js";

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

    const apiKey = process.env.GNEWS_API_KEY;
    if (!apiKey) throw new Error("GNEWS_API_KEY no configurada");

    // GNews no tiene categoria "religion" en top-headlines, asi que usamos
    // busqueda por palabras clave centradas en la Iglesia Catolica universal.
    const query = lang === "en"
      ? '"Catholic Church" OR Vatican OR "Pope Leo"'
      : '"Iglesia Católica" OR Vaticano OR "Papa León"';
    const url = `https://gnews.io/api/v4/search?q=${encodeURIComponent(query)}&lang=${lang}&sortby=publishedAt&max=10&apikey=${apiKey}`;
    const newsRes = await fetch(url);
    if (!newsRes.ok) throw new Error("Error al consultar GNews: " + newsRes.status);
    const data = await newsRes.json();
    const articles = data.articles || [];

    // El titular #1 (mas reciente/relevante).
    const article = articles.length ? articles[0] : null;

    if (!article) {
      res.status(200).json({ found: false });
      return;
    }

    const result = {
      found: true,
      titulo: article.title,
      resumen_original: article.description || "",
      fuente: article.source?.name || "",
      url: article.url || "",
      fecha: article.publishedAt || "",
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
