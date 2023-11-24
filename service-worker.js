const CACHE_NAME = 'ai-news-cache-v1';
const DATA_CACHE_NAME = 'ai-news-data-cache-v1';
const URLS_TO_CACHE = [
    '/',
    '/index.html',
    '/style.css',
    '/index.js',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Открыт кеш:', cache);
                return cache.addAll(URLS_TO_CACHE);
            })
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.filter(cacheName => cacheName !== CACHE_NAME && cacheName !== DATA_CACHE_NAME)
                    .map(cacheName => caches.delete(cacheName))
            );
        })
    );
});

self.addEventListener('fetch', event => {
    const { request } = event;

    // Если запрос к API, сохраняем данные в отдельный кеш
    if (request.url.includes('/api/')) {
        event.respondWith(
            caches.open(DATA_CACHE_NAME)
                .then(cache => {
                    return fetch(request)
                        .then(response => {
                            // Проверяем, успешный ли запрос
                            if (response.status === 200) {
                                cache.put(request, response.clone());
                            }
                            return response;
                        })
                        .catch(error => {
                            // Если запрос не удался, возвращаем данные из кеша
                            return cache.match(request);
                        });
                })
        );
    } else {
        // Если запрос к статическим ресурсам, возвращаем из основного кеша
        event.respondWith(
            caches.match(request)
                .then(response => {
                    return response || fetch(request);
                })
        );
    }
});

self.addEventListener('message', event => {
    if (event.data && event.data.type === 'get-cached-news') {
        serveCachedNews(event);
    }
});

function serveCachedNews(event) {
    const newsApiUrl = '/api/news';
    caches.match(newsApiUrl)
        .then(response => {
            if (response) {
                return response.json();
            }
            return null;
        })
        .then(data => {
            if (data) {
                event.source.postMessage({ type: 'cached-news', articles: data.items });
            } else {
                event.source.postMessage({ type: 'cached-news', articles: [] });
            }
        })
        .catch(error => console.error('Ошибка при получении кешированных новостей:', error));
}
