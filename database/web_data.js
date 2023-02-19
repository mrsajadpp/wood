const db = require('./config.js')
const COLLECTIONS = require('./collections.js');
const ObjectId = require('mongodb').ObjectID;

module.exports = {
    addIndex: (data) => {
        try {
            return new Promise(async (resolve, reject) => {
                if (data.url && data.title && data.description) {
                    let index = await db.get().collection(COLLECTIONS.INDEX).findOne({ url: data.url })
                    if (index) {
                        if (data.url !== index.url && data.title !== index.title) {
                            db.get().collection(COLLECTIONS.INDEX).insertOne(data).then((res) => {
                                resolve({ status: false })
                            })
                        } else {
                            reject({ status: 404 })
                        }
                    } else {
                        db.get().collection(COLLECTIONS.INDEX).insertOne(data).then((res) => {
                            resolve({ status: false })
                        })
                    }
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