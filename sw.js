// Service Worker - Esporte Sao Pedro
var CACHE_NAME = 'esporte-sp-v2';
var urlsToCache = [
    './',
    './index.html',
    './style.min.css',
    './app.min.js',
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

self.addEventListener('push', function (e) {
    var data = {};
    try { data = e.data ? e.data.json() : {}; } catch (x) { data = { title: 'Esporte Sao Pedro' }; }
    var title = data.title || 'Esporte Sao Pedro';
    var options = {
        body: data.body || 'Nova atualizacao no portal esportivo',
        icon: data.icon || '/og-image.svg',
        badge: '/og-image.svg',
        vibrate: [200, 100, 200],
        data: { url: data.url || '/' }
    };
    e.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function (e) {
    e.notification.close();
    var url = e.notification.data && e.notification.data.url ? e.notification.data.url : '/';
    e.waitUntil(clients.matchAll({ type: 'window' }).then(function (clientList) {
        for (var i = 0; i < clientList.length; i++) {
            var c = clientList[i];
            if (c.url.indexOf(self.location.origin) === 0 && 'focus' in c) return c.focus();
        }
        if (clients.openWindow) return clients.openWindow(url);
    }));
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
