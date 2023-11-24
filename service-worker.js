const CACHE_NAME = 'ai-news-cache-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/main.js',
    '/styles.css',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png',
    '/manifest.json'
];
let latestArticleId = 0;

self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open(CACHE_NAME).then(function(cache) {
            console.log('Opened cache');
            return cache.addAll(urlsToCache);
        })
    );
});

self.addEventListener('fetch', function(event) {
    if (event.request.url.includes('/api/news')) {
        event.respondWith(
            fetch(event.request).then(function(response) {
                return caches.open(CACHE_NAME).then(function(cache) {
                    cache.put(event.request.url, response.clone());
                    return response;
                });
            }).catch(function() {
                return caches.match(event.request);
            })
        );
    } else {
        event.respondWith(
            caches.match(event.request).then(function(response) {
                return response || fetch(event.request);
            })
        );
    }
});

self.addEventListener('activate', function(event) {
    var cacheWhitelist = [CACHE_NAME];

    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.map(function(cacheName) {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );

    self.clients.claim();

    event.waitUntil(
        checkForNewArticles()
    );
});

self.addEventListener('sync', function(event) {
    if (event.tag === 'update-news') {
        event.waitUntil(checkForNewArticles());
    }
});

self.addEventListener('notificationclick', function(event) {
    // Пример простой обработки клика на уведомление
    event.notification.close();
    event.waitUntil(clients.openWindow('/'));
});

function showMessage(title) {
    self.registration.showNotification('New Article!', {
        body: title,
        icon: '/icons/icon-192x192.png'
    });
}

async function checkForNewArticles() {
    try {
        const response = await fetch('/api/news');
        const newsData = await response.json();
        const newArticles = newsData.items;
        const newLatestArticleId = Math.max(...newArticles.map(article => article.id));

        if (newLatestArticleId > latestArticleId) {
            latestArticleId = newLatestArticleId;
            showMessage(newArticles[0].title);
        }
    } catch (error) {
        // В продакшене добавить обработку случаев, когда клиент не может связаться с сервером
        console.error('Error checking for new articles:', error);
    }
}

setInterval(() => {
    self.registration.sync.register('update-news');
}, 10000);
