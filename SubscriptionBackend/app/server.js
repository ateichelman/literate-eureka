const config = require('../config/config.json');
const releaseConfig = config.release;
const testConfig = config.testing;

const finalConfig = releaseConfig;

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongo = require("mongodb");
const MongoClient = require("mongodb").MongoClient;

main();

async function main() {
  const app = express();
  const dbName = finalConfig.subsDBName;
  const alertDBName = finalConfig.alertDBName;
  let db;
  let alertDB;
  const url = finalConfig.targetURL;

  var corsOptions = {
    origin: "http://example.com",
    optionsSuccessStatus: 200 // Some legacy browsers choke on 204!
  };

  app.use(cors(corsOptions));

  MongoClient.connect(url, (err, database) => {
    // ... Start mongo server...
    if (err) return console.log(err);

    // store a ref to db for later
    alertDB = database.db(alertDBName);
    db = database.db(dbName);
    console.log(`Connected MongoDB: ${url}`);
    console.log(`Database: ${dbName}`);
    db.createCollection(dbName, (err, res) => {
      if (err) throw err;

      console.log("No errors on collection creation: " + res);
    });
    //Only bother creating app if mongo is also up.
    app.listen(finalConfig.listenPort, () => {
      console.log("Server started!");
    });
  });

  // Generic Response
  app.route("/").get((req, res) => {
    res.sendFile(__dirname + "/index.html");
  });

  // Send ALL Subscriptions
  app.route("/aw/api/subscriptions").get((req, response) => {
    db.collection(dbName)
      .find({})
      .toArray((err, result) => {
        if (err) throw err;

        response.send({
          result
        });
      });
  });

  // Responds with collection of subs under that user name.
  app.route("/aw/api/subscriptions/:targetUser").get((req, res) => {
    var targetUser = req.params.targetUser;
    db.collection(dbName)
      .find({ "subscriber.username": targetUser }, { projection:{ '_id': 0 } })
      .toArray((err, result) => {
        if (err) throw err;

        console.log("Found vals: " + result);

        res.type('json');

        res.json(
          result
        );
      });
  });

  // Responds with collection of subs under that docID.
  app.route("/aw/api/subscriptions/all/:targetDoc").get((req, res) => {
    var targetDoc = req.params.targetDoc;
    db.collection(dbName)
      .find({ docID: targetDoc })
      .toArray((err, result) => {
        if (err) throw err;

        res.send({
          result
        });
      });
  });

  // Insert new subscription into database.
  app.use(bodyParser.json());
  app.route("/aw/api/subscriptions").post((req, res) => {

    // Is this user already subscribed to this document? If no, then subscribe.
    db.collection(dbName).save(req.body, (err, result) => {
      if (err) return console.log(err);

      console.log("Saved to DB!" + result);
      res.send({result});
    });
  });

  // Remove subscriptions with specific id and subscriber.user.
  app.route("/aw/api/subscriptions/:user/:docID").delete((req, res) => {
    var targetDoc = req.params.docID;
    var targetUser = req.params.user;

    db.collection(dbName).deleteOne(
      { "docID": targetDoc , "subscriber.username": targetUser },
      (err, result) => {
        if (err) throw err;

        console.log("Deleted Count: " + result.deletedCount);

        res.send({
          result
        });
      }
    );
  });

  // Update a specific subscription belonging to a target user.
  app.route("/aw/api/subscriptions/:user/:docID").put((req, res) => {
    var targetDoc = req.params.docID;
    var targetUser = req.params.user;
    db.collection(dbName).replaceOne(
      { "docID": targetDoc , "subscriber.username": targetUser },
      req.body,
      (err, result) => {
        if (err) return console.log(err);

        console.log("Update Completed!" + result);
        res.send({result});
      }
    );
  });

  // Send email to the address contained in the target subscription, alerting user to
  // a new upload matching their subscription settings.
  app.route("/aw/api/subscriptions/alert").post((req, res) => {

    alertDB.collection(alertDBName).save(req.body, (err, result) => {
      if (err) return console.log(err);

      console.log("Queued another alert: " + result);
      res.send({result});
    });
  });
}
