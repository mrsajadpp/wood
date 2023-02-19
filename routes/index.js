const webData = require('../database/web_data')
const userData = require('../database/user_data')
const modules = require('../modules/modules')
const http = require('url');
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

router.get('/search', (req, res, next) => {
  try {
    if (req.query.q.startsWith('http://') || req.query.q.startsWith('https://')) {
      let url = new URL(req.query.q)
      res.redirect(url.href)
      modules.addIndex(url.origin, url.pathname).then((stat) = {}).catch((err) => { })
    } else {
      webData.getIndex().then((indexData) => {
        const index = elasticlunr(function () {
          this.addField('title');
          this.addField('description');
          this.setRef('url');
        });
        indexData.forEach(page => {
          index.addDoc({
            url: page.url,
            title: page.title,
            description: page.description
          });
        });
        const results = index.search(req.query.q);
        let resul = [];
        results.forEach(result => {
          indexData.forEach(page => {
            if (page.url == result.ref) {
              resul.push(page)
            }
          })
        });
        res.render('result', { title: req.query.q, description: `Found ${results.length} results for '${req.query.q}'`, style: 'result', status: false, pages: resul, q: req.query.q })
      })
    }
  } catch (err) {
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
      const url = new URL(req.body.url);
      const origin = url.origin;
      // Send HTTP request to URL
      request(url.href, (error, response, body) => {
        if (error) {
          console.error(`Error crawling ${url.href}: ${error}`);
          res.render('index', { title: 'Index your pages in wood', description: 'Index your pages in wood', style: 'search', status: true, err: "Sorry facing a error in indexing this page." })
          return;
        }
        // Load HTML content into Cheerio
        const $ = cheerio.load(body);
        let data = {
          "url": url.href,
          "origin": url.origin,
          "protocol": url.protocol,
          "title": $('title').text(),
          "description": $('meta[name="description"]').attr('content'),
          "links": $('a').map((i, el) => $(el).attr('href')).get()
        }
        webData.addIndex(data).then((response) => {
          res.redirect('/index')
        }).catch((err) => {
          res.render('index', { title: 'Index your pages in wood', description: 'Index your pages in wood', style: 'search', status: true, err: "Sorry this page is already indexed you cant index this page." })
        })
        for (let i = 0; i < data.links.length; i++) {
          if (data.links[i].startsWith('https://') || data.links[i].startsWith('http://')) {
            modules.addIndex(origin, new URL(data.links[i]).pathname).then((stat) => { }).catch((err) => { })
          } else {
            modules.addIndex(origin, data.links[i]).then((stat) => { }).catch((err) => { })
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
