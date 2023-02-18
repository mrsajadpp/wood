const db = require('./config.js')
const COLLECTIONS = require('./collections.js');
const ObjectId = require('mongodb').ObjectID;

module.exports = {
    addIndex: (data) => {
        try {
            return new Promise(async (resolve, reject) => {
                let index = await db.get().collection(COLLECTIONS.INDEX).findOne({ url: data.url })
                if (!index) {
                    db.get().collection(COLLECTIONS.INDEX).insertOne(data).then((res) => {
                        resolve({ status: false })
                    })
                } else {
                    reject({ status: true })
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