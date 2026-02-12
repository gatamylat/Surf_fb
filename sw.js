// Surf Service Worker — network-first (из уроков Firebase_Instruction_v2)
// ВАЖНО: при каждом обновлении кода менять CACHE_NAME!

const CACHE_NAME = 'surf-v2';
const URLS_TO_CACHE = [
    './',
    './index.html',
    './manifest.json'
];

// Установка — кешируем основные файлы
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(URLS_TO_CACHE))
            .then(() => self.skipWaiting())
    );
});

// Активация — удаляем старые кеши
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys.filter(k => k !== CACHE_NAME)
                    .map(k => caches.delete(k))
            )
        ).then(() => self.clients.claim())
    );
});

// Fetch — СЕТЬ ПЕРВАЯ (network-first)
// Сначала пробуем сеть, если нет — берём из кеша
// Это решает проблему «SW держит старый кеш» (ошибка 9)
self.addEventListener('fetch', event => {
    event.respondWith(
        fetch(event.request)
            .then(response => {
                // Успешный ответ от сети — обновляем кеш
                if (response.ok) {
                    const clone = response.clone();
                    caches.open(CACHE_NAME)
                        .then(cache => cache.put(event.request, clone));
                }
                return response;
            })
            .catch(() => {
                // Сеть недоступна — берём из кеша
                return caches.match(event.request);
            })
    );
});
