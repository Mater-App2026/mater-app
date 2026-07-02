// Service Worker básico para Mater — Coaching Espiritual
// Este archivo hace que la app sea instalable y funcione offline

const CACHE_NAME = 'mater-cache-v1';

// Archivos esenciales que se guardan para que la app cargue sin internet
const ARCHIVOS_ESENCIALES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

// Cuando se instala el service worker, guarda los archivos esenciales
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ARCHIVOS_ESENCIALES);
    })
  );
  self.skipWaiting();
});

// Limpia caches viejos cuando se activa una nueva versión
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((nombres) => {
      return Promise.all(
        nombres
          .filter((nombre) => nombre !== CACHE_NAME)
          .map((nombre) => caches.delete(nombre))
      );
    })
  );
  self.clients.claim();
});

// Intercepta las peticiones: si hay internet, trae de la red;
// si no hay internet, usa lo guardado en cache
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((respuesta) => {
        // Guarda una copia actualizada en cache
        const respuestaClonada = respuesta.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, respuestaClonada);
        });
        return respuesta;
      })
      .catch(() => {
        // Sin internet: usa lo que haya en cache
        return caches.match(event.request);
      })
  );
});
