const db = require('./config.js')
const COLLECTIONS = require('./collections.js');
const ObjectId = require('mongodb').ObjectID;

module.exports = {
    addIndex: (data) => {
        try {
            return new Promise(async (resolve, reject) => {
                if (data.url && data.title && data.description) {
                    let index = await db.get().collection(COLLECTIONS.INDEX).find().toArray()
                    index.forEach(page => {
                        if (page.url !== data.url && page.title !== data.title) {
                            if (data.title && data.description && data.url) {
                                db.get().collection(COLLECTIONS.INDEX).insertOne(data).then((res) => {
                                    resolve({ status: false })
                                })
                            }
                        }
                    });
                }
            })
        } catch (err) {
            // Error handling
            console.error(err)
        }
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