// Config File
const config = require('../config/config.json');
const testConfig = config.testing;

const mongo = require('mongodb');
const MongoClient = require('mongodb').MongoClient;
const testVals = require('./testDB.js/index.js');
const testAlertVals = require('./testAlerts.js');

const dbName = testConfig.subsDBName;
const alertDBName = testConfig.alertDBName;
let alertDB;
let db;
const url = testConfig.targetURL;

MongoClient.connect(url, (err, database) => {
  // ... Start mongo server...
  if (err) return console.log(err);

  console.log('First value from testdb: ' + testVals[0].docID );

  // store a ref to db for later
  alertDB = database.db(alertDBName);
  db = database.db(dbName);
  console.log(`Connected MongoDB: ${url}`);
  console.log(`Database: ${dbName}`);

  alertDB.createCollection(alertDBName, (err, res) => {
    if (err) throw err;

    console.log('No errors on collection creation: ' + res);
  })

  db.createCollection(dbName, (err, res) => {
    if (err) throw err;

    console.log('No errors on collection creation: ' + res);
  });

  // Clear out the old stuff.
  alertDB.collection(alertDBName).remove({});
  db.collection(dbName).remove({});

  // Rebuild test collections.

  db.collection(dbName).insertMany(testVals, (err, res) => {
    if (err) throw err;
    console.log("TestDB Created(subs): " + res);
  });
  alertDB.collection(alertDBName).insertMany(testAlertVals, (err, res) =>{
    if (err) throw err;
    console.log("TestDB Created(alerts): " + res);
  });
  //process.exit();
  // Not a function!?
  // Need to put in an exit here...
  // MongoClient.close();
});
