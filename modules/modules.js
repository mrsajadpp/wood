const http = require('url');
const webData = require('../database/web_data')
let request = require('request');
const cheerio = require('cheerio');
let path = require('path');
let fs = require('fs');

module.exports = {
    addIndex: (origin, pathname) => {
        return new Promise(async (resolve, reject) => {
            try {
                let url = new URL(origin + pathname);
                request(url.href, (error, response, body) => {
                    if (error) {
                        console.error(`Error crawling ${url.href}: ${error}`);
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
                    webData.addIndex(data).then((response) => { }).catch((err) => {})
                })
            } catch (err) {
                console.error(err)
            }
        })
    }
}