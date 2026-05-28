// Service Worker - Esporte Sao Pedro
var CACHE_NAME = 'esporte-sp-v2';
var urlsToCache = [
    './',
    './index.html',
    './style.css',
    './app.js',
    './supabase.js',
    './upload.js',
    './manifest.json',
    './og-image.svg'
];

self.addEventListener('install', function (e) {
    e.waitUntil(
        caches.open(CACHE_NAME).then(function (cache) {
            return cache.addAll(urlsToCache);
        })
    );
    self.skipWaiting();
});

self.addEventListener('activate', function (e) {
    e.waitUntil(
        caches.keys().then(function (names) {
            return Promise.all(
                names.filter(function (n) { return n !== CACHE_NAME; })
                    .map(function (n) { return caches.delete(n); })
            );
        })
    );
    self.clients.claim();
});

self.addEventListener('fetch', function (e) {
    if (e.request.method !== 'GET') return;
    e.respondWith(
        fetch(e.request).then(function (response) {
            var sameOrigin = new URL(e.request.url).origin === self.location.origin;
            if (sameOrigin && response && response.status === 200) {
                var clone = response.clone();
                caches.open(CACHE_NAME).then(function (cache) {
                    cache.put(e.request, clone);
                });
            }
            return response;
        }).catch(function () {
            return caches.match(e.request);
        })
    );
});
