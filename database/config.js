const MongoClient = require('mongodb').MongoClient;
const COLLECTIONS = require('./collections.js')
const state = {
  db: null
};

function connect(done) {
  try {
    const url = process.env.STRING;
    const dbname = 'wood';

    MongoClient.connect(url, (err, client) => {
      if (err) return done(err);
      state.db = client.db(dbname);

      // Call createIndex after the MongoDB connection has been established
      state.db.collection(COLLECTIONS.INDEX).createIndex({ title: "text", description: "text" }, (err, result) => {
        if (err) return done(err);
        console.log("Index created successfully!");
        done();
      });

    });
  } catch (err) {
    console.error(err);
    done(err);
  }
}


function get() {
  return state.db;
}

connect((err) => {
  if (err) {
    console.log('Database connection error: ' + err);
  } else {
    console.log('Database connected!');
  }
});

module.exports = {
  get
};
