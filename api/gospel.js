// VERSION-ROBUSTA-2 — si ves este comentario en el archivo desplegado, la
// extracción robusta está activa. Si no aparece, alguien pisó este archivo
// con una versión vieja.
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { url } = req.body;
    if (!url || !url.includes("usccb.org")) {
      return res.status(400).json({ error: "Invalid URL" });
    }

    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; MaterApp/1.0)",
        "Accept": "text/html",
      },
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const html = await response.text();

    // 1) Localizar el encabezado real "Evangelio" (h1-h6), sin depender de
    //    markdown ni de que la palabra "Evangelio" no aparezca antes en otro
    //    lugar (p. ej. en la Aclamación, que también menciona "Evangelio").
    const headingRegex = /<h[1-6][^>]*>\s*Evangelio\s*<\/h[1-6]>/i;
    const headingMatch = html.match(headingRegex);
    if (!headingMatch) {
      throw new Error("No se encontró la sección Evangelio en la página");
    }
    const startIdx = headingMatch.index + headingMatch[0].length;

    // 2) Cortar hasta el siguiente encabezado h1-h6, o hasta marcadores de
    //    pie de página conocidos que siempre aparecen después del texto.
    const rest = html.slice(startIdx);
    const endMarkers = [
      /<h[1-6][^>]*>/i,
      /Los textos de la Sagrada Escritura/i,
      /In English/i,
      /Ver Calendario/i,
      /Suscribase/i,

