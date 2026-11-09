const CACHE = "just-for-you-v1"
self.addEventListener("install", event => event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(["/", "/offline.html", "/icon.svg"]))))
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return
  event.respondWith(fetch(event.request).catch(() => caches.match(event.request).then(response => response || caches.match("/offline.html"))))
})
