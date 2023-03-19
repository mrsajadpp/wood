// import the required libraries and modules
const express = require('express');
const webData = require('../database/web_data');
const router = express.Router();
const path = require('path');
const axios = require('axios');

router.get('/', async (req, res, next) => {
  try {
    const response = await axios.get('https://specialday.spotitinc.repl.co/');
    console.log(response.data)
    // deliver the search page
    res.render('search', { title: 'Search anything in wood', description: 'World number 1 search engine powered by Spotit inc', style: 'search', status: false, special: response.data.color.replace(/#/g, "") })
  } catch (err) {
    // handle errors
    console.error(err)
  }
});

router.get('/search', async (req, res, next) => {
  try {
    // extract the query from the request
    const query = req.query.q;
    const response = await axios.get('https://specialday.spotitinc.repl.co/');

    if (query.startsWith('http://') || query.startsWith('https://')) {
      // if the query is a URL, redirect to it and add it to the index
      const url = new URL(query);
      res.redirect(`${url.origin}${url.pathname}`);
    } else {
      if (req.query.img) {
        // if the query is not a URL, search the index and deliver the results
        webData.searchImage(query).then((results) => {
          res.render('image', { title: query, description: `Found '${results.length}' results for '${query}'`, style: 'result', status: false, images: results, q: query, id: 'b', special: response.data.color.replace(/#/g, "") });
        }).catch((err) => {
          res.render('image', { title: query, description: `No results found for '${query}'`, style: 'result', status: false, images: false, q: query, id: 'b', special: response.data.color.replace(/#/g, "") });
        });
      } else {
        // if the query is not a URL, search the index and deliver the results
        webData.searchIndex(query).then((results) => {
          res.render('result', { title: query, description: `Found '${results.length}' results for '${query}'`, style: 'result', status: false, pages: results, q: query, id: 'a', special: response.data.color.replace(/#/g, "") });
        }).catch((err) => {
          res.render('result', { title: query, description: `No results found for '${query}'`, style: 'result', status: false, pages: false, q: query, id: 'a', special: response.data.color.replace(/#/g, "") });
        });
      }
    }
  } catch (err) {
    console.error(err);
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
