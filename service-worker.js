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

    // Попытка получить данные из кеша
    event.respondWith(
        caches.match(request)
            .then(response => {
                if (response) {
                    return response;
                }

                // Если данных нет в кеше, делаем сетевой запрос
                return fetch(request)
                    .then(fetchResponse => {
                        // Проверяем, успешный ли запрос
                        if (!fetchResponse || fetchResponse.status !== 200) {
                            return fetchResponse;
                        }

                        // Если запрос к API, сохраняем данные в отдельный кеш
                        if (request.url.includes('/api/')) {
                            const responseToCache = fetchResponse.clone();
                            caches.open(DATA_CACHE_NAME)
                                .then(cache => {
                                    cache.put(request, responseToCache);
                                });
                        }

                        return fetchResponse;
                    })
                    .catch(error => {
                        // Если запрос не удался, и данных в кеше нет, возвращаем ошибку
                        if (!response) {
                            throw error;
                        }
                        return response;
                    });
            })
    );
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
