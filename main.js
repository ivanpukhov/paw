document.addEventListener('DOMContentLoaded', function() {
    loadLatestArticles();
});

// Request permission for showing notifications on load
if (window.Notification && Notification.permission !== 'denied') {
    Notification.requestPermission(function(status) {
        console.log('Notification permission status:', status);
    });
}

function displayArticles(articles) {
    const articlesContainer = document.getElementById('articles');
    articlesContainer.innerHTML = ''; // Clear existing articles

    articles.forEach(article => {
        const articleElement = document.createElement('article');
        articleElement.innerHTML = `
            <h2>${article.title}</h2>
            <img src="${article.imageUrl}" alt="Article Image">
            <p>Published on: ${article.publicationDate}</p>
            <p>Author: ${article.author}</p>
        `;
        articlesContainer.appendChild(articleElement);
    });
}

// Fetch latest articles from the API
async function loadLatestArticles() {
    try {
        const response = await fetch('/api/news');
        if (!response.ok) {
            throw new Error('Network response was not ok.');
        }
        const articlesData = await response.json();
        displayArticles(articlesData.items);
    } catch (error) {
        console.error('There has been a problem with your fetch operation:', error);
        // Show cached news here if available
    }
}

// Register the service worker
if ('serviceWorker' in navigator && 'SyncManager' in window) {
    navigator.serviceWorker.register('service-worker.js').then(function(registration) {
        console.log('Service Worker registered with scope:', registration.scope);
    }).catch(function(error) {
        console.log('Service Worker registration failed:', error);
    });
}

// Listen for updates to the articles from the Service Worker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', function(event) {
        console.log('Received message from service worker:', event.data);
        loadLatestArticles();
    });
}
