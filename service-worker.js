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
// Обработчик fetch, который всегда загружает свежие данные из сети
self.addEventListener('fetch', event => {
    event.respondWith(
        fetch(event.request)
            .catch(() => {
                // Если запрос не удался, попробуем получить данные из кеша
                return caches.match(event.request).then(response => {
                    if (response) {
                        return response;
                    } else {
                        // Здесь можно вставить логику для возвращения запасной страницы (например, оффлайн-страницы)
                        // Важно иметь запасной план на случай полного отсутствия интернета и отсутствия кешированных данных
                    }
                });
            })
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
    const response = await fetch('/api/news');
    if (response.ok) {
        const newsData = await response.json();
        const cache = await caches.open(CACHE_NAME);
        await cache.put('/api/news', new Response(JSON.stringify(newsData)));
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
