// Servidor local de desarrollo SOLO para /api/*, evita depender de `vercel dev`
// (que tenia un conflicto de precedencia de variables de entorno con el proyecto
// de Vercel enlazado). Lee .env.local directamente y ejecuta los mismos handlers
// que se usan en produccion (api/chat.js, api/santo-del-dia.js, etc.)
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// --- Cargar .env.local manualmente (sin dependencias externas) ---
const envPath = path.join(__dirname, ".env.local");
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, "utf8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    let value = trimmed.slice(idx + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
}

const routes = {
  "/api/chat": "./api/chat.js",
  "/api/santo-del-dia": "./api/santo-del-dia.js",
  "/api/world-intention": "./api/world-intention.js",
  "/api/delete-account": "./api/delete-account.js",
};

const handlers = {};
for (const [route, file] of Object.entries(routes)) {
  const mod = await import(file);
  handlers[route] = mod.default;
}

const PORT = 3001;

function makeRes(res) {
  res.status = (code) => { res.statusCode = code; return res; };
  res.json = (obj) => { res.setHeader("Content-Type", "application/json"); res.end(JSON.stringify(obj)); return res; };
  return res;
}

const server = http.createServer(async (req, res) => {
  makeRes(res);
  const url = new URL(req.url, "http://localhost");
  const pathname = url.pathname;
  const handler = handlers[pathname];
  if (!handler) {
    res.status(404).json({ error: "not found: " + pathname });
    return;
  }

  req.query = Object.fromEntries(url.searchParams.entries());

  if (req.method === "POST" || req.method === "PUT") {
    let body = "";
    req.on("data", (chunk) => { body += chunk; });
    req.on("end", async () => {
      try {
        req.body = body ? JSON.parse(body) : {};
      } catch {
        req.body = {};
      }
      try {
        await handler(req, res);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });
  } else {
    try {
      await handler(req, res);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
});

server.listen(PORT, () => {
  console.log(`[dev-api-server] Escuchando en http://localhost:${PORT} (rutas: ${Object.keys(routes).join(", ")})`);
});
