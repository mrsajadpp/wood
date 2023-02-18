const db = require('./config.js')
const COLLECTIONS = require('./collections.js');
const ObjectId = require('mongodb').ObjectID;

module.exports = {
    addIndex: (data) => {
        try {
            return new Promise((resolve, reject) => {
                console.log(data)
                db.get().collection(COLLECTIONS.INDEX).insertOne(data).then((res) => {
                    resolve({ status: true })
                })
            })
        } catch (err) {
            // Error handling
            console.error(err)
        }
    }
}