// Версия кэша
const CACHE_NAME = 'news-pwa-cache-v1';
// URL-адреса для кэширования
const urlsToCache = [
    '/',
    '/index.html',
    '/styles.css',
    '/script.js',
    '/favicon.ico'
];

// Установка сервис-воркера и кэширование ресурсов
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
    );
});

// Ответ из кэша или загрузка свежих данных
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Возвращаем ответ из кэша или загружаем из сети
                return response || fetch(event.request).then(fetchResponse => {
                    return caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, fetchResponse.clone());
                        return fetchResponse;
                    });
                });
            })
            .catch(() => caches.match('/offline.html')) // Показать оффлайн страницу, если нет сети
    );
});

// Активация Service Worker и очистка старого кэша
self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Обработка фонового синхронизации
self.addEventListener('sync', event => {
    if (event.tag === 'news-fetch') {
        event.waitUntil(fetchAndCacheNews());
    }
});

// Функция для получения и кэширования новостей
async function fetchAndCacheNews() {
    const response = await fetch('https://ix-web.site/api/news');
    if (response.ok) {
        const newsData = await response.json();
        const cache = await caches.open(CACHE_NAME);
        await cache.put('https://ix-web.site/api/news', new Response(JSON.stringify(newsData)));
    }
}

// Отслеживаем push уведомления
self.addEventListener('push', event => {
    const data = event.data.json();
    const title = 'New Article: ' + data.title;
    const options = {
        body: 'Tap to open the article.',
        icon: 'images/icon.png',
        badge: 'images/badge.png'
    };
    event.waitUntil(self.registration.showNotification(title, options));
});
