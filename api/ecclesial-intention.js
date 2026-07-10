// Devuelve un titular de noticia REAL y VERIFICADO (via GNews.io) sobre la
// Iglesia Católica en el mundo (Vaticano, Papa, obispos, sínodos, etc.), para
// que el frontend le pida a Claude que redacte la intención de oración SOLO a
// partir de ese titular verificado (nunca inventado).
//
// Requiere la variable de entorno GNEWS_API_KEY (cuenta gratuita en https://gnews.io).

export default async function handler(req, res) {
  try {
    const apiKey = process.env.GNEWS_API_KEY;
    if (!apiKey) throw new Error("GNEWS_API_KEY no configurada");

    const lang = req.query.lang === "en" ? "en" : "es";

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

    // El titular #1 (mas reciente/relevante); el frontend lo cachea en localStorage
    // por fecha para que sea el mismo durante todo el dia en cada dispositivo.
    const article = articles.length ? articles[0] : null;

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
