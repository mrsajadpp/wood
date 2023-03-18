const db = require('./config.js'); // Import the configuration file for the database
const COLLECTIONS = require('./collections.js'); // Import the collections from the database
const axios = require("axios");
const cheerio = require('cheerio');
const validator = require('validator');
const ObjectId = require('mongodb').ObjectID; // Import the ObjectId method from the MongoDB library
const { google } = require('googleapis');
const customsearch = google.customsearch('v1');
const API_KEY = 'AIzaSyAaU1iEQS7A3qXAuBBhi6dg63YBnJ0KsZo';
const SEARCH_ENGINE_ID = 'f45d4e3e5a9004036';

module.exports = {
    searchIndex: async (query) => {
        try {
            const indexCollection = db.get().collection(COLLECTIONS.INDEX);

            // Search for pages with the given query in title or description fields
            const results = await indexCollection.find({
                $text: { $search: query }
            }, {
                score: { $meta: "textScore" }
            }).sort({ score: { $meta: "textScore" } }).toArray();


            // Retrieve Google indexed data for each result
            const searchParams = {
                q: query,
                cx: SEARCH_ENGINE_ID,
                auth: API_KEY
            };
            const searchResult = await customsearch.cse.list(searchParams);
            pages = searchResult.data.items;
            for (const page of pages) {
                const data = {
                    url: page.link,
                    url_data: new URL(page.link),
                    title: page.title,
                    description: page.snippet
                };
                results.push(data)
            }

            if (results.length === 0) {
                throw { error: 'No search results found.' };
            }
            
            // Shuffle the search results randomly
            for (let i = results.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [results[i], results[j]] = [results[j], results[i]];
            }

            return results; // Return the search results as an array of pages with Google indexed data added
        } catch (err) {
            console.error(err); // Log any errors
            throw err; // Throw the error
        }
    },

    searchImage: async (query) => {
        try {
            const indexCollection = db.get().collection(COLLECTIONS.INDEX);

            const results = await indexCollection.find({
                $or: [
                    { "images.value": { $regex: new RegExp(query, 'i') } },
                    { title: { $regex: new RegExp(query, 'i') } },
                    { description: { $regex: new RegExp(query, 'i') } }
                ]
            }).toArray();

            if (results.length === 0) {
                throw { error: 'No search results found.' };
            }

            const images = [];

            for (const result of results) {
                for (const image of result.images) {
                    if (image.startsWith('http') && (image.endsWith('.jpg') || image.endsWith('.png') || image.endsWith('.jpeg'))) {
                        if (validator.isURL(image)) {
                            images.push(image);
                        }
                    }
                }
            }

            return images;
        } catch (err) {
            console.error(err);
            throw err;
        }
    }
};
