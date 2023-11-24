if ('serviceWorker' in navigator) {
	window.addEventListener('load', () => {
		navigator.serviceWorker.register('/service-worker.js').then(registration => {
			console.log('ServiceWorker registration successful with scope: ', registration.scope);
		}, err => {
			console.log('ServiceWorker registration failed: ', err);
		});
	});
}

function updateNewsList(items) {
	const newsList = document.getElementById('news-list');
	newsList.innerHTML = items.map(item => `<li>${item.title}</li>`).join('');
}

function checkForNewArticle(items) {
	// Здесь можно добавить логику по определению новых статей
}

// Запрос новостей с сервера или из кеша
function fetchNews() {
	fetch('https://ix-web.site/api/news')
		.then(response => {
			if (response.ok) return response.json();
			throw new Error('Network response was not ok.');
		})
		.then(data => {
			if (data.items.length > 0) {
				updateNewsList(data.items);
				checkForNewArticle(data.items);
			}
		})
		.catch(error => {
			// Обработка случая, когда нет доступа к сети
			console.log('Fetch failed, trying to retrieve from cache: ', error);
			caches.match('https://ix-web.site/api/news').then(response => {
				if (!response) throw new Error('No cached data');
				return response.json();
			})
				.then(data => {
					if (data.items) updateNewsList(data.items);
				})
				.catch(error => {
					console.error('Failed to retrieve cached data: ', error);
				});
		});
}

// Проверка каждые 10 секунд
setInterval(() => {
	fetchNews();
}, 10000);

document.addEventListener('DOMContentLoaded', () => {
	fetchNews(); // Загружаем новости при загрузке страницы
});
