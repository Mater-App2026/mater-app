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
    ];
    let endIdx = rest.length;
    for (const marker of endMarkers) {
      const m = rest.match(marker);
      if (m && m.index < endIdx) endIdx = m.index;
    }
    let section = rest.slice(0, endIdx);

    // 3) Convertir HTML a texto plano preservando separación de párrafos.
    function htmlToText(fragment) {
      return fragment
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<\/(p|div|li)>/gi, "\n\n")
        .replace(/<[^>]+>/g, "")
        .replace(/&nbsp;/g, " ")
        .replace(/&aacute;/g, "á").replace(/&eacute;/g, "é").replace(/&iacute;/g, "í")
        .replace(/&oacute;/g, "ó").replace(/&uacute;/g, "ú").replace(/&ntilde;/g, "ñ")
        .replace(/&Aacute;/g, "Á").replace(/&Eacute;/g, "É").replace(/&Iacute;/g, "Í")
        .replace(/&Oacute;/g, "Ó").replace(/&Uacute;/g, "Ú").replace(/&Ntilde;/g, "Ñ")
        .replace(/&iexcl;/g, "¡").replace(/&iquest;/g, "¿")
        .replace(/&ldquo;|&rdquo;/g, "\u201c")
        .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
        .replace(/&#39;/g, "'").replace(/&quot;/g, '"')
        .replace(/[ \t]+/g, " ")
        .replace(/\n{3,}/g, "\n\n")
        .trim();
    }

    const plain = htmlToText(section);

    if (!plain) {
      throw new Error("No se pudo extraer el texto del evangelio");
    }

    // 4) La primera línea suele ser la referencia (ej. "Mateo 8, 28-34"),
    //    el resto es el texto completo del evangelio.
    const lines = plain.split("\n\n").map(l => l.trim()).filter(Boolean);
    let referenciaLinea = "";
    let textoLineas = lines;
    const refPattern = /^[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(\s+\d+)?[,\s\d\-.]*$/;
    if (lines.length > 1 && refPattern.test(lines[0]) && lines[0].length < 40) {
      referenciaLinea = lines[0];
      textoLineas = lines.slice(1);
    }

    const texto = textoLineas.join("\n\n").trim();
    const referencia = referenciaLinea
      ? `Evangelio según San ${referenciaLinea}`
      : "Evangelio del día";

    // Extraer tiempo litúrgico del resto de la página (fuera de la sección ya cortada)
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
