const CACHE_NAME = 'ai-news-cache-v1';
const STATIC_CACHE_URLS = [
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
                return cache.addAll(STATIC_CACHE_URLS);
            })
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.filter(cacheName => cacheName !== CACHE_NAME)
                    .map(cacheName => caches.delete(cacheName))
            );
        })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                return response || fetch(event.request).then(fetchResponse => {
                    if (event.request.url.startsWith('/api/news')) {
                        return caches.open(CACHE_NAME).then(cache => {
                            cache.put(event.request, fetchResponse.clone());
                            return fetchResponse;
                        });
                    } else {
                        return fetchResponse;
                    }
                });
            })
    );
});

self.addEventListener('message', event => {
    if (event.data && event.data.type === 'get-cached-news') {
        serveCachedNews(event);
        navigator.serviceWorker.controller.postMessage({ type: 'get-cached-news' });
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
