// Devuelve un titular de noticia REAL y VERIFICADO (via GNews.io) relacionado con
// crisis humanitarias / desastres, para que el frontend le pida a Claude que redacte
// la intención de oración SOLO a partir de ese titular verificado (nunca inventado).
//
// Requiere la variable de entorno GNEWS_API_KEY (cuenta gratuita en https://gnews.io).

export default async function handler(req, res) {
  try {
    const apiKey = process.env.GNEWS_API_KEY;
    if (!apiKey) throw new Error("GNEWS_API_KEY no configurada");

    const lang = req.query.lang === "en" ? "en" : "es";
    const queryEs = "(terremoto OR huracán OR inundación OR hambruna OR refugiados OR \"crisis humanitaria\" OR desplazados OR conflicto)";
    const queryEn = "(earthquake OR hurricane OR flood OR famine OR refugees OR \"humanitarian crisis\" OR displaced OR conflict)";
    const q = lang === "en" ? queryEn : queryEs;

    const url = `https://gnews.io/api/v4/search?q=${encodeURIComponent(q)}&lang=${lang}&max=5&sortby=publishedAt&apikey=${apiKey}`;
    const newsRes = await fetch(url);
    if (!newsRes.ok) throw new Error("Error al consultar GNews: " + newsRes.status);
    const data = await newsRes.json();
    const article = (data.articles || [])[0];

    if (!article) {
      res.status(200).json({ found: false });
      return;
    }

    res.status(200).json({
      found: true,
      titulo: article.title,
      resumen_original: article.description || "",
      fuente: article.source?.name || "",
      url: article.url || "",
      fecha: article.publishedAt || "",
    });
  } catch (err) {
    res.status(200).json({ found: false, error: err.message });
  }
}
