// Devuelve un titular de noticia REAL y VERIFICADO (via GNews.io) de actualidad
// mundial general (no limitado a desastres/crisis), para que el frontend le pida
// a Claude que redacte la intención de oración SOLO a partir de ese titular
// verificado (nunca inventado).
//
// Requiere la variable de entorno GNEWS_API_KEY (cuenta gratuita en https://gnews.io).

export default async function handler(req, res) {
  try {
    const apiKey = process.env.GNEWS_API_KEY;
    if (!apiKey) throw new Error("GNEWS_API_KEY no configurada");

    const lang = req.query.lang === "en" ? "en" : "es";

    // Top-headlines generales de la categoria "world" (politica, economia,
    // relaciones internacionales, sociedad, etc.) en vez de una busqueda
    // acotada a palabras clave de desastres/crisis humanitarias.
    const url = `https://gnews.io/api/v4/top-headlines?category=world&lang=${lang}&max=10&apikey=${apiKey}`;
    const newsRes = await fetch(url);
    if (!newsRes.ok) throw new Error("Error al consultar GNews: " + newsRes.status);
    const data = await newsRes.json();
    const articles = data.articles || [];

    // Elegimos una noticia distinta cada dia (no siempre la misma #1) para variar
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
    const article = articles.length ? articles[dayOfYear % articles.length] : null;

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
