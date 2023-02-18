const webData = require('../database/web_data')
const userData = require('../database/user_data')
var express = require('express');
let path = require('path');
let fs = require('fs');
let request = require('request');
const cheerio = require('cheerio');
const elasticlunr = require('elasticlunr');
var router = express.Router();

router.get('/', (req, res, next) => {
  try {
    // Search page delivery
    res.render('search', { title: 'Search anything in wood', description: 'World number 1 search engine powered by Trace inc', style: 'search', status: false })
  } catch (err) {
    // Error handling
    console.error(err)
  }
})

router.get('/index', (req, res, next) => {
  try {
    res.render('index', { title: 'Index your pages in wood', description: 'Index your pages in wood', style: 'search', status: false })
  } catch (err) {
    // Error handling
    console.error(err)
  }
})

router.post('/index', (req, res, next) => {
  try {
    if (req.body.url) {
      const url = req.body.url;
      // Send HTTP request to URL
      request(url, (error, response, body) => {
        if (error) {
          console.error(`Error crawling ${url}: ${error}`);
          return;
        }
        // Load HTML content into Cheerio
        const $ = cheerio.load(body);
        let data = {
          url: url,
          title: $('title').text(),
          description: $('meta[name="description"]').attr('content'),
          links: $('a').map((i, el) => $(el).attr('href')).get()
        }
        webData.addIndex(data).then((response) => {
          res.redirect('/index')
        }).catch((err) => {
          res.render('index', { title: 'Index your pages in wood', description: 'Index your pages in wood', style: 'search', status: true, err: "Sorry this page is already indexed you cant index this page." })
        })
        for (let i = 0; i < data.links.length; i++) {
          if (data.links[i].startsWith('https')) {
            setTimeout(() => {
              let url = data.links[i]
              request(data.links[i], (error, response, body) => {
                if (error) {
                  console.error(`Error crawling ${url}: ${error}`);
                  return;
                }
                // Load HTML content into Cheerio
                const $ = cheerio.load(body);
                let data = {
                  url: url,
                  title: $('title').text(),
                  description: $('meta[name="description"]').attr('content'),
                  links: $('a').map((i, el) => $(el).attr('href')).get()
                }
                webData.addIndex(data).then((response) => {}).catch((err) =>{})
              })
            }, 3000);
          }
        }
      });
    }
  } catch (err) {
    // Error handling
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
