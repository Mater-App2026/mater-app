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

    // Extraer el evangelio del HTML de la USCCB
    // El evangelio está en una sección <h3> con "Evangelio" seguido del texto
    const evangelioMatch = html.match(/### Evangelio[\s\S]*?(?=###|$)/) ||
      html.match(/<h3[^>]*>Evangelio<\/h3>([\s\S]*?)(?=<h3|<\/main|$)/i);

    // Extraer la referencia del evangelio (ej: Mateo 8, 1-4)
    const refMatch = html.match(/Evangelio\s*\n\n([A-Za-záéíóúÁÉÍÓÚñÑ]+\s+\d+[,\s\d-]+)/m) ||
      html.match(/<h3[^>]*>Evangelio<\/h3>\s*<p[^>]*>([^<]+)/i);

    // Extraer el texto del evangelio — buscar "En aquel tiempo" o el inicio típico
    const textoMatch = html.match(/(En aquel tiempo[\s\S]*?)(?=\n\n###|\n\n## |<\/div|Aclamación|Salmo|oración|R\.|Dijo el Señor)/im);

    if (!textoMatch) {
      throw new Error("No se pudo extraer el evangelio");
    }

    // Limpiar el texto
    let texto = textoMatch[1]
      .replace(/<[^>]+>/g, "") // quitar HTML tags
      .replace(/\n{3,}/g, "\n\n") // normalizar espacios
      .replace(/R\.\s*\*\*[^*]+\*\*/g, "") // quitar respuestas del salmo
      .replace(/\*\*/g, "") // quitar markdown bold
      .trim();

    // Extraer la referencia
    let referencia = "Evangelio del día";
    const dateMatch = url.match(/(\d{2})(\d{2})(\d{2})\.cfm/);
    if (dateMatch) {
      const [, mm, dd, yy] = dateMatch;
      const months = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
      // buscar referencia en el HTML
      const refSearch = html.match(/Evangelio\s*\n+([A-Za-záéíóú]+\s+\d+[,\s\d-]+)/m);
      if (refSearch) referencia = `Evangelio según ${refSearch[1].trim()}`;
    }

    // Extraer tiempo litúrgico
    let tiempo = "Tiempo Ordinario";
    const tiempoMatch = html.match(/(Tiempo ordinario|Adviento|Cuaresma|Pascua|Navidad|Tiempo pascual)/i);
    if (tiempoMatch) tiempo = tiempoMatch[1];

    return res.status(200).json({
      referencia,
      tiempo,
      textoCompleto: texto,
    });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
