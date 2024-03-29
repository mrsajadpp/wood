// import the required libraries and modules
const express = require('express');
const webData = require('../database/web_data');
const router = express.Router();
const path = require('path');
const axios = require('axios');
const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
  apiKey: process.env.API
});
const openai = new OpenAIApi(configuration);

router.get('/', async (req, res, next) => {
  try {
    const response = await axios.get('https://specialday.spotitinc.repl.co/');
    // deliver the search page
    res.render('search', { title: 'Search anything in wood', description: 'World number 1 search engine powered by Spotit inc', style: 'search', status: false, special: response.data.color.replace(/#/g, "") })
  } catch (err) {
    // handle errors
    console.error(err)
  }
});

router.post('/suggestion', async (req, res, next) => {
  let result = await webData.searchSuggestions(req.body.q);
  res.json({ result });
})

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
 
router.post('/sendchat', async (req, res, next) => {
  if (req.body.content) {
    const completion = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: req.body.content.toLowerCase(),
      n: 1,
      max_tokens: 2049,
      stop: null,
      temperature: 0.7
    });
    if (completion.status !== 200 || !completion.data.choices[0].text) {
      res.json({ status: 500, content: "i'm sorry, I don't understand please add more context to improve my answers!." });
    } else {
      res.json({ status: 200, content: completion.data.choices[0].text.toLowerCase() });
    }
  } else {
    res.json({ status: 404, content: 'Please enter something before sending.' })
  }
})


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
