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
            const indexCollection = await db.get().collection(COLLECTIONS.INDEX);

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
            const searchResult = await customsearch.cse.list(searchParams).catch((err) => {
                console.error(err)
            });

            if (!searchResult) {
                if (results.length === 0) {
                    throw { error: 'No search results found.' };
                }
                return results;
            }
            let pages = searchResult.data.items;
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
            /* for (let i = results.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [results[i], results[j]] = [results[j], results[i]];
            } */

            return results; // Return the search results as an array of pages with Google indexed data added
        } catch (err) {
            console.error(err); // Log any errors
            throw err; // Throw the error
        }
    },

    searchImage: async (query) => {
        try {
            const indexCollection = await db.get().collection(COLLECTIONS.INDEX);

            const results = await indexCollection.find({
                $or: [
                    { "images.value": { $regex: new RegExp(query, 'i') } },
                    { title: { $regex: new RegExp(query, 'i') } },
                    { description: { $regex: new RegExp(query, 'i') } }
                ]
            }).toArray();

            // Retrieve Google indexed data for each result
            const searchParams = {
                q: query,
                cx: SEARCH_ENGINE_ID,
                auth: API_KEY,
                searchType: 'image',
            };

            const searchResult = await customsearch.cse.list(searchParams).catch((err) => {
                console.error(err)
            });

            if (!searchResult) {
                if (results.length === 0) {
                    throw { error: 'No search results found.' };
                }

                const images = [];

                for (const result of results) {
                    if (result.images && Array.isArray(result.images)) { // added check for images property
                        for (const image of result.images) {
                            if (image.startsWith('http')) {
                                if (validator.isURL(image)) {
                                    images.push(image);
                                }
                            }
                        }
                    }
                }
                return images;
            }
            let pages = searchResult.data.items;
            for (const page of pages) {
                const data = {
                    url: page.link,
                    url_data: new URL(page.link),
                    title: page.title,
                    description: page.snippet,
                    images: [page.image.thumbnailLink]
                };
                results.push(data)
            }

            if (results.length === 0) {
                throw { error: 'No search results found.' };
            }

            const images = [];

            for (const result of results) {
                if (result.images && Array.isArray(result.images)) { // added check for images property
                    for (const image of result.images) {
                        if (image.startsWith('http')) {
                            if (validator.isURL(image)) {
                                images.push(image);
                            }
                        }
                    }
                }
            }

            // Shuffle the search results randomly
            /* for (let i = images.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [images[i], images[j]] = [images[j], images[i]];
            } */

            return images;
        } catch (err) {
            console.error(err);
            throw err;
        }
    },
    searchSuggestions: async (query) => {
        try {
            const indexCollection = await db.get().collection(COLLECTIONS.INDEX);

            // Search for pages with the given query in title or description fields
            const results = await indexCollection.find({
                $text: { $search: query }
            }, {
                score: { $meta: "textScore" }
            }).sort({ score: { $meta: "textScore" } }).toArray();

            // Extract the search terms from the query
            const searchTerms = query.split(/\s+/);

            // Search for suggestions based on each search term
            const suggestions = [];
            for (const term of searchTerms) {
                const suggestionResult = await indexCollection.distinct("title", {
                    keywords: { $regex: new RegExp(term, 'i') }
                });
                suggestions.push(...suggestionResult);
            }

            let suggestio = []

            suggestions.forEach(suggest => {
                suggestio.push(suggest.slice(0, 10));
            })

            // Remove duplicates from the suggestion array
            const uniqueSuggestions = [...new Set(suggestio)];

            return uniqueSuggestions; // Return the search suggestions as an array of strings
        } catch (err) {
            console.error(err); // Log any errors
            throw err; // Throw the error
        }
    }
};
