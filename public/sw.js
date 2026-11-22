const CACHE = "life-world-shell-v2";
const RUNTIME = "life-world-runtime-v2";
const SHELL = ["/", "/manifest.webmanifest", "/icon.svg", "/offline.html"];
self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => ![CACHE, RUNTIME].includes(k)).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", event => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.pathname.startsWith("/api/")) return;
  if (req.mode === "navigate") {
    event.respondWith(fetch(req).then(response => {
      const copy = response.clone(); caches.open(CACHE).then(cache => cache.put("/", copy)); return response;
    }).catch(async () => (await caches.match("/") || await caches.match("/offline.html"))));
    return;
  }
  event.respondWith(caches.match(req).then(cached => {
    if (cached) return cached;
    return fetch(req).then(response => {
      if (response && (response.ok || response.type === "opaque")) {
        const copy = response.clone(); caches.open(RUNTIME).then(cache => cache.put(req, copy));
      }
      return response;
    }).catch(() => cached);
  }));
});
