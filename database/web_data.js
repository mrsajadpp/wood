const db = require('./config.js'); // Import the configuration file for the database
const modules = require('../modules/modules'); // Import the modules for web crawling
const COLLECTIONS = require('./collections.js'); // Import the collections from the database
const Fuse = require('fuse.js'); // Import the Fuse.js library for searching and filtering data
const ObjectId = require('mongodb').ObjectID; // Import the ObjectId method from the MongoDB library

module.exports = {
    addIndex: async (urlData) => { // Method to add a new page to the index
        try {
            const page = await db.get().collection(COLLECTIONS.INDEX).findOne({ url: urlData.href + urlData.pathname }); // Check if the page is already in the index

            if (page) { // If the page is already in the index, throw an error
                throw { error: 'Page is already indexed!' };
            }

            const pageData = await modules.crawl(urlData); // Get the page data by crawling the URL

            if (!pageData.title && !pageData.description) { // If the page data does not contain a title or description, throw an error
                throw { error: "You can't index this page!" };
            }

            const Page = await db.get().collection(COLLECTIONS.INDEX).findOne({ title: pageData.title }); // Check if a page with the same title already exists in the index

            if (Page) { // If a page with the same title already exists in the index, throw an error
                throw { error: 'Page is already indexed!' };
            }

            const insertData = await db.get().collection(COLLECTIONS.INDEX).insertOne(pageData); // Insert the page data into the index

            return { message: 'Page indexed successfully.' }; // Return a success message
        } catch (err) {
            console.error(err); // Log any errors
            throw err; // Throw the error
        }
    },

    getIndex: async () => { // Method to get all the indexed pages
        try {
            const index = await db.get().collection(COLLECTIONS.INDEX).find().toArray(); // Find all the documents in the index collection

            return index; // Return the index array
        } catch (err) {
            console.error(err); // Log any errors
            throw err; // Throw the error
        }
    },

    searchIndex: async (query) => { // Method to search the indexed pages
        try {
            const indexData = await db.get().collection(COLLECTIONS.INDEX).find().toArray(); // Find all the documents in the index collection

            const fuse = new Fuse(indexData, { // Create a new Fuse object
                keys: ['title', 'description', 'keywords'], // Specify the keys to search in
                includeScore: true, // Include the search score in the results
                threshold: 0.4, // Adjust the search result relevance
            });

            const results = fuse.search(query); // Search the index for the query string

            if (results.length === 0) {
                throw { error: 'No search results found.' };
            }

            return results.map((result) => result.item); // Return the search results as an array of pages
        } catch (err) {
            console.error(err); // Log any errors
            throw err; // Throw the error
        }
    }
};
