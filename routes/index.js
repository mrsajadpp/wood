// import the required libraries and modules
const express = require('express');
const webData = require('../database/web_data');
const router = express.Router();
const path = require('path');

router.get('/', async (req, res, next) => {
  try {
    // deliver the search page
    res.render('search', { title: 'Search anything in wood', description: 'World number 1 search engine powered by Trace inc', style: 'search', status: false })
  } catch (err) {
    // handle errors
    console.error(err)
  }
});

router.get('/search', async (req, res, next) => {
  try {
    // extract the query from the request
    const query = req.query.q;

    if (query.startsWith('http://') || query.startsWith('https://')) {
      // if the query is a URL, redirect to it and add it to the index
      const url = new URL(query);
      res.redirect(`${url.origin}${url.pathname}`);
      await webData.addIndex(url);
    } else {
      // if the query is not a URL, search the index and deliver the results
      webData.searchIndex(query).then((results) => {
        res.render('result', { title: query, description: `Found '${results.length}' results for '${query}'`, style: 'result', status: false, pages: results, q: query });
      }).catch((err) => {
        res.render('result', { title: query, description: `No results found for '${query}'`, style: 'result', status: false, pages: false, q: query });
      });
    }
  } catch (err) {
    console.error(err);
  }
});

router.get('/index', async (req, res, next) => {
  try {
    // deliver the index page
    res.render('index', { title: 'Index your pages in wood', description: 'Index your pages in wood', style: 'search', status: false })
  } catch (err) {
    // handle errors
    console.error(err)
  }
});

router.post('/index', async (req, res, next) => {
  try {
    if (req.body.url) {
      // if the request contains a URL to index, add it to the index
      let url = await new URL(req.body.url);
      webData.addIndex(url).then((response) => {
        res.redirect('/index')
      }).catch((err) => {
        // handle errors based on the type of error
        if (err.error == 'Page is already indexed!') {
          res.render('index', { title: 'Index your pages in wood', description: 'Index your pages in wood', style: 'search', status: true, err: "Sorry this page is already indexed you can't index this page." })
        } else if (err.error == "You can't index this page!") {
          res.render('index', { title: 'Index your pages in wood', description: 'Index your pages in wood', style: 'search', status: true, err: "Sorry you can't index this page." })
        } else {
          res.render('index', { title: 'Index your pages in wood', description: 'Index your pages in wood', style: 'search', status: true, err: "Sorry this page is not exist." })
        }
      })
    }
  } catch (err) {
    // handle errors
    console.error(err)
  }
});

router.get('/robots.txt', (req, res, next) => {
  try {
    // deliver the robots.txt file
    res.sendFile(path.resolve(__dirname, 'seo', 'robots.txt'));
  } catch (err) {
    console.error(err)
  }
});

router.get('/sitemap.xml', (req, res, next) => {
  try {
    // deliver the sitemap.xml file
    res.sendFile(path.resolve(__dirname, 'seo', 'sitemap.xml'));
  } catch (err) {
    console.error(err)
  }
});

// export the router
module.exports = router;
