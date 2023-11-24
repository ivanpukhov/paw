const cors = require('cors');
const express = require('express');
const app = express();
const port = 3000;
app.use(cors())
// Моковые данные новостей
const news = {
    "items": [
        {
            "id": 10,
            "title": "A Look at the Latest Innovations in AI Technology",
            "publicationDate": "2023-08-01T12:58:04Z",
            "author": "Celine Gordon",
            "imageUrl": "http://localhost:3000/images/10.jpg"
        },
        {
            "id": 12,
            "title": "A Look at the Latest Innovations in AI Technology",
            "publicationDate": "2023-08-01T12:58:04Z",
            "author": "Celine Gordon",
            "imageUrl": "http://localhost:3000/images/10.jpg"
        },
        {
            "id": 12,
            "title": "A Look at the Latest Innovations in AI Technology",
            "publicationDate": "2023-08-01T12:58:04Z",
            "author": "Celine Gordon",
            "imageUrl": "http://localhost:3000/images/10.jpg"
        },
        // ... другие новостные статьи ...
    ]
};

// Middleware для обслуживания статических файлов из папки 'public'
app.use(express.static('public'));

// Маршрут для получения новостей
app.get('/api/news', (req, res) => {
    res.json(news);
});
app.post('/api/news', (req, res) => {
    news.items.push(
        {
            "id": 12,
            "title": "A Look at the Latest Innovations in AI Technology",
            "publicationDate": "2023-08-01T12:58:04Z",
            "author": "Celine Gordon",
            "imageUrl": "http://localhost:3000/images/10.jpg"
        },
    )
});
const HOST = '0.0.0.0';
// Запуск сервера
app.listen(port, HOST, () => {
    console.log(`Сервер запущен на http://localhost:${port}`);
});
