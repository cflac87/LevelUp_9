// Level Up Service Worker — Network First (immer aktuelle Version).
// Bewusst minimal im install-Schritt: kein Vorab-Caching (cache.addAll),
// das durch einen einzelnen fehlerhaften Pfad die komplette Registrierung
// scheitern lassen könnte. Chrome verlangt für Installierbarkeit nur einen
// erfolgreich registrierten Service Worker mit fetch-Handler.
const CACHE = "levelup-v2";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE).then((cache) => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
