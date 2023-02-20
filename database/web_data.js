let db = require('./config.js')
let modules = require('../modules/modules')
let COLLECTIONS = require('./collections.js');
let ObjectId = require('mongodb').ObjectID;

module.exports = {
    addIndex: (urlData) => {
        return new Promise((resolve, reject) => {
            try {
                db.get().collection(COLLECTIONS.INDEX).findOne({ url: urlData.href }).then((page) => {
                    if (!page) {
                        modules.crawl(urlData).then(async (pageData) => {
                            if (pageData.title && pageData.description) {
                                db.get().collection(COLLECTIONS.INDEX).findOne({ title: pageData.title }).then((Page) => {
                                    if (!Page) {
                                        db.get().collection(COLLECTIONS.INDEX).insertOne(pageData).then((insertData) => {
                                            resolve({ message: 'Page indexed succesfully.' })
                                        }).catch((err) => {
                                            reject({ error: err.error })
                                        })
                                    } else {
                                        reject({ error: 'Page is already indexed!.' })
                                    }
                                }).catch((err) => {
                                    reject({ error: err.error })
                                })
                            } else {
                                reject({ error: "You can't index this page!." })
                            }
                        }).catch((err) => {
                            reject({ error: err.error })
                        })
                    } else {
                        reject({ error: 'Page is already indexed!.' })
                    }
                })
            } catch (err) {
                // Error handling
                console.error(err)
            }
        })
    },
    getIndex: () => {
        try {
            return new Promise(async (resolve, reject) => {
                let index = await db.get().collection(COLLECTIONS.INDEX).find().toArray();
                resolve(index)
            })
        } catch (err) {
            // Error handling
            console.error(err)
        }
    }
}