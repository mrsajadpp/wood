let http = require('url');
let request = require('request');
let cheerio = require('cheerio');
let path = require('path');
let fs = require('fs');

module.exports = {
    crawl: async (urlData) => {
        try {
            // Send HTTP request to URL
            const response = await new Promise((resolve, reject) => {
                request(urlData.href, (error, response, body) => {
                    if (error) reject(error); // reject promise if there is an error
                    else resolve(response); // resolve promise with the response object
                });
            });

            if (response.statusCode == 200) {
                // Load HTML content into Cheerio
                let $ = cheerio.load(response.body);
                let webData = require('../database/web_data')
                let data = {
                    "url": urlData.href,
                    "url_data": urlData,
                    "title": $('title').text(),
                    "favicon": $('link[rel="icon"]').attr('href') || $('link[rel="shortcut icon"]').attr('href'),
                    "description": $('meta[name="description"]').attr('content') || $('h1').text() || $('h2').text(),
                    "html": $.html(),
                    "links": $('a').map((i, el) => $(el).attr('href')).get()
                }
                /*data.links.forEach(link => {
                    if (!link.startsWith('http')) {
                        if (!link.startsWith('//')) {
                            request(urlData.origin + link, (error, response, body) => {
                                try {
                                    if (!error && response.statusCode == 200) {
                                        webData.addIndex(new URL(urlData.origin + link)).then((res) => { }).catch((err) => { })
                                    }
                                } catch (err) {
                                    console.error(err)
                                }
                            })
                        }
                    }
                })*/
                return data; // return data object
            } else {
                throw new Error('Url is not valid!'); // throw error if URL is not valid
            }
        } catch (err) {
            console.error(err);
            throw err; // throw any errors encountered
        }
    }
}
