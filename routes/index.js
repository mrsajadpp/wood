let webData = require('../database/web_data')
let userData = require('../database/user_data')
let modules = require('../modules/modules')
let http = require('url');
let express = require('express');
let path = require('path');
let fs = require('fs');
let request = require('request');
let cheerio = require('cheerio');
let elasticlunr = require('elasticlunr');
let router = express.Router();

router.get('/', (req, res, next) => {
  try {
    // Search page delivery
    res.render('search', { title: 'Search anything in wood', description: 'World number 1 search engine powered by Trace inc', style: 'search', status: false })
  } catch (err) {
    // Error handling
    console.error(err)
  }
})

router.get('/search', async (req, res, next) => {
  try {
    if (req.query.q.startsWith('http://') || req.query.q.startsWith('https://')) {
      let url = new URL(req.query.q)
      res.redirect(url.href)
      await modules.addIndex(url.origin, url.pathname).then((stat) = {}).catch((err) => { })
    } else {
      await webData.getIndex().then((indexData) => {
        let index = elasticlunr(function () {
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
        let results = index.search(req.query.q);
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

router.post('/index', async (req, res, next) => {
  try {
    if (req.body.url) {
      let url = await new URL(req.body.url);
      webData.addIndex(url).then((response) => {
        res.redirect('/index')
      }).catch((err) => {
        if (err.error == 'Url is not valid!.') {
          res.render('index', { title: 'Index your pages in wood', description: 'Index your pages in wood', style: 'search', status: true, err: "Sorry this page is not exist." })
        } else {
          res.render('index', { title: 'Index your pages in wood', description: 'Index your pages in wood', style: 'search', status: true, err: "Sorry this page is already indexed you cant index this page." })
        }
      })
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
