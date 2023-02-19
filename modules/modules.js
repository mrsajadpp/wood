let http = require('url');
let request = require('request');
let webData = require('../database/web_data')
let cheerio = require('cheerio');
let path = require('path');
let fs = require('fs');

module.exports = {
    addIndex: (origin, pathname) => {
        return new Promise(async (resolve, reject) => {
            try {
                let url = new URL(origin + pathname);
                request(url.href, (error, response, body) => {
                    if (!error && response.statusCode == 200) {
                        // Load HTML content into Cheerio
                        let $ = cheerio.load(body);
                        let data = {
                            "url": url,
                            "title": $('title').text(),
                            "description": $('meta[name="description"]').attr('content'),
                            "links": $('a').map((i, el) => $(el).attr('href')).get()
                        }
                        webData.addIndex(data).then((res) => { }).catch((err) => { })
                    }
                })
            } catch (err) {
                console.error(err)
            }
        })
    },
    crawl: (urlData) => {
        return new Promise((resolve, reject) => {
            try {
                // Send HTTP request to URL
                request(urlData.href, (error, response, body) => {
                    if (!error && response.statusCode == 200) {
                        // Load HTML content into Cheerio
                        let $ = cheerio.load(body);
                        let data = {
                            "url": urlData.href,
                            "url_data": urlData,
                            "title": $('title').text(),
                            "favicon": $('link[rel="icon"]').attr('href') || $('link[rel="shortcut icon"]').attr('href'),
                            "description": $('meta[name="description"]').attr('content') || $('h1').text() || $('h2').text(),
                            "html": $.html(),
                            "links": $('a').map((i, el) => $(el).attr('href')).get()
                        }
                        resolve(data)
                        data.links.forEach(link => {
                            if (!link.startsWith('http')) {
                                if (!link.startsWith('//')) {
                                    request(urlData.origin + link, (error, response, body) => {
                                        if (!error && response.statusCode == 200) {
                                            webData.addIndex(new URL(urlData.origin + link)).then((res) => { }).catch((err) => { })
                                        }
                                    })
                                }
                            }
                        })
                    } else {
                        reject({ error: 'Url is not valid!.' })
                    }
                })
            } catch (err) {
                console.error(err)
            }
        })
    }
}