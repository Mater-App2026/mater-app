// La API externa calapi.inadiutorium.cz tiene algunas entradas desactualizadas
// que no reflejan decretos litúrgicos posteriores. Corregimos aquí los casos
// conocidos en vez de confiar ciegamente en el dato de terceros.
// Clave: "mes-dia" (fijo cada año). Ej: 29 de julio, tras el decreto de 2021,
// pasó a ser "Saints Martha, Mary and Lazarus" y su color correcto es blanco
// (ninguno de los tres fue mártir), pero calapi todavía la marca como roja.
const KNOWN_CALAPI_CORRECTIONS = {
  "7-29": { title: "Saints Martha, Mary and Lazarus", colour: "white" },
};

export default async function handler(req, res) {
  try {
    // Preferimos la fecha local del cliente (year/month/day en query) para evitar
    // que el huso horario UTC del servidor muestre el santo del dia siguiente
    // varias horas antes de medianoche en la zona horaria del usuario.
    const today = new Date();
    const y = req.query.year ? parseInt(req.query.year, 10) : today.getFullYear();
    const m = req.query.month ? parseInt(req.query.month, 10) : today.getMonth() + 1;
    const d = req.query.day ? parseInt(req.query.day, 10) : today.getDate();

    const calRes = await fetch(`http://calapi.inadiutorium.cz/api/v0/en/calendars/general-en/${y}/${m}/${d}`);
    if (!calRes.ok) throw new Error("No se pudo obtener el calendario litúrgico");
    const calData = await calRes.json();

    // Elegimos la celebración de mayor prioridad que tenga un título real
    // (rank_num más bajo = mayor prioridad; algunas entradas son solo "feria" sin santo)
    const conTitulo = (calData.celebrations || []).filter(c => c.title && c.title.trim() !== "");
    let elegida = conTitulo.sort((a, b) => a.rank_num - b.rank_num)[0] || null;

    const correccion = KNOWN_CALAPI_CORRECTIONS[`${m}-${d}`];
    if (elegida && correccion) {
      elegida = { ...elegida, title: correccion.title, colour: correccion.colour };
    }

    res.status(200).json({
      fecha: calData.date,
      titulo_en: elegida ? elegida.title : null,
      rank: elegida ? elegida.rank : null,
      color: elegida ? elegida.colour : null,
      rank_num: elegida ? elegida.rank_num : null,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
