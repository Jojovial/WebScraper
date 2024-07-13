const PORT = process.env.PORT || 3000;
const axios = require('axios');
const cheerio = require('cheerio');
const express = require('express');
const NodeCache = require('node-cache');

const app = express();
const cache = new NodeCache({ stdTTL: 600 }); // Cache for 10 minutes
const url = 'https://www.serebii.net/';

const fetchArticles = async () => {
    try {
        const cachedArticles = cache.get('articles');
        if (cachedArticles) {
            return cachedArticles;
        }

        const response = await axios.get(url);
        const html = response.data;
        const $ = cheerio.load(html);
        const articles = [];

        $('.post', html).each(function () {
            const title = $(this).text().trim(); // Trim to remove unnecessary whitespace
            const url = $(this).find('a').attr('href');
            if (title && url) {
                articles.push({ title, url });
            }
        });

        cache.set('articles', articles);
        return articles;
    } catch (error) {
        console.error(`Error fetching articles: ${error.message}`);
        return [];
    }
};

app.get('/articles', async (req, res) => {
    try {
        const articles = await fetchArticles();
        res.json(articles);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch articles' });
    }
});

app.listen(PORT, () => console.log(`Server running on PORT ${PORT}`));
