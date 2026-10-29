const CACHE = 'meal-v1';
const FILES = ['/', '/index.html', '/manifest.json'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);

  // 급식 데이터는 항상 최신이 필요하니까 캐시 안 씀
  if (url.pathname.startsWith('/api/')) return;

  // 나머지는 네트워크 먼저, 실패하면 캐시
  e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
});