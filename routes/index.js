var express = require('express');
let path = require('path');
let fs = require('fs');
let request = require('request');
const cheerio = require('cheerio');
const elasticlunr = require('elasticlunr');
var router = express.Router();

router.get('/', (req, res, next) => {
  try {
    res.render('search', { title: 'Search anything in wood', description: 'World number 1 search engine powered by Trace inc', style: 'search' })
  } catch (err) {
    console.error(err)
  }
})

router.get('/index', (req, res, next) => {
  try {
    const url = 'https://google.com';
    // Send HTTP request to URL
    request(url, (error, response, body) => {
      if (error) {
        console.error(`Error crawling ${url}: ${error}`);
        return;
      }
      // Load HTML content into Cheerio
      const $ = cheerio.load(body);
      // Extract data from HTML using Cheerio selectors
      const title = $('title').text();
      const links = $('a').map((i, el) => $(el).attr('href')).get();
      // Log results
      console.log(`Title: ${title}`);
      console.log(`Links: ${links}`);
    });
  } catch (err) {
    console.error(err)
  }
})

router.get('/robots.txt', (req, res, next) => {
  try {
    res.sendFile(path.resolve(__dirname, 'seo', 'robots.txt'));
  } catch (err) {
    console.error(err)
  }
})


module.exports = router;
