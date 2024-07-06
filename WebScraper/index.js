const PORT = 3000;
const axios = require('axios');
const cheerio = require('cheerio');
const express = require('express');

const app = express();
const url = 'https://www.serebii.net/';

const fetchArticles = async () => {
    try {
        const response = await axios.get(url);
        const html = response.data;
        const $ = cheerio.load(html);
        const articles = [];

        $('.post', html).each(function () {
            const title = $(this).text().trim(); // Trim to remove unnecessary whitespace
            const url = $(this).find('a').attr('href');
            articles.push({ title, url });
        });

        return articles;
    } catch (error) {
        console.error(`Error fetching articles: ${error.message}`);
        return [];
    }
};

const logArticles = async () => {
    const articles = await fetchArticles();
    console.log(articles);
};

logArticles();

app.listen(PORT, () => console.log(`Server running on PORT ${PORT}`));
