const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const NodeCache = require('node-cache');

const app = express();
const PORT = process.env.PORT || 3000;
const cache = new NodeCache({ stdTTL: 600 }); // Cache for 10 minutes
const url = 'https://www.serebii.net/';

// Function to fetch articles
const fetchArticles = async () => {
    try {
        // Check if articles are cached
        const cachedArticles = cache.get('articles');
        if (cachedArticles) {
            return cachedArticles;
        }

        // Fetch and parse the HTML
        const response = await axios.get(url);
        const html = response.data;
        const $ = cheerio.load(html);
        const articles = [];

        // Extract articles from the HTML
        $('.post', html).each(function () {
            const title = $(this).text().trim();
            const articleUrl = $(this).find('a').attr('href');
            if (title && articleUrl) {
                articles.push({ title, url: articleUrl });
            }
        });

        // Cache the articles
        cache.set('articles', articles);
        return articles;
    } catch (error) {
        console.error(`Error fetching articles: ${error.message}`);
        return [];
    }
};

// Endpoint to get articles
app.get('/articles', async (req, res) => {
    try {
        const articles = await fetchArticles();
        res.json(articles);
    } catch (error) {
        console.error(`Failed to fetch articles: ${error.message}`);
        res.status(500).json({ error: 'Failed to fetch articles' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on PORT ${PORT}`);
});
