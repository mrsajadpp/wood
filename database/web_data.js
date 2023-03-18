const db = require('./config.js'); // Import the configuration file for the database
const COLLECTIONS = require('./collections.js'); // Import the collections from the database
const Fuse = require('fuse.js'); // Import the Fuse.js library for searching and filtering data
let request = require('request');
const http = require('http');
const https = require('https');
const axios = require("axios");
const validator = require('validator');
const util = require('util');
const requestPromise = util.promisify(request);
const ObjectId = require('mongodb').ObjectID; // Import the ObjectId method from the MongoDB library

module.exports = {
    searchIndex: async (query) => { // Method to search the indexed pages
        try {
            const indexCollection = db.get().collection(COLLECTIONS.INDEX);

            // Search for pages with the given query in title or description fields
            const results = await indexCollection.find({
                $text: { $search: query }
            }, {
                score: { $meta: "textScore" }
            }).sort({ score: { $meta: "textScore" } }).toArray();

            if (results.length === 0) {
                throw { error: 'No search results found.' };
            }

            return results; // Return the search results as an array of pages
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
