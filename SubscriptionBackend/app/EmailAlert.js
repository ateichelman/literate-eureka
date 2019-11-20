const config = require('../config/config.js');
const releaseConfig = config.release;
const testConfig = config.testing;

const finalConfig = releaseConfig;

var nodemailer = require("nodemailer");
var sgTransport = require("nodemailer-sendgrid-transport");

// Connect to alerts DB

const mongo = require("mongodb");
const MongoClient = require("mongodb").MongoClient;
const alertDBName = finalConfig.alertDBName;

let db;
const url = finalConfig.targetURL;
var alertsFinal;

// Email variables
const sgKey = finalConfig.sendGridKey;
const sendersAddr = finalConfig.alertSender;

var options = {
  auth: {
    api_key: sgKey
  }
};

var transporter = nodemailer.createTransport(sgTransport(options));

main();

async function main() {
  MongoClient.connect(url, async (err, database) => {
    // ... Start mongo server...
    if (err) return console.log(err);

    // store a ref to db for later
    db = database.db(alertDBName);

    // group documents under email address, return array of objects with a field for id and for an array of each unique matched document under that email address.

    alertsFinal = await db
      .collection(alertDBName)
      .aggregate([
        {
          $group: {
            _id: "$subscribedTo.subscriber.email",
            mergedTitles: { $addToSet: "$matchedName" }
          }
        }
      ])
      .toArray();

    console.log(JSON.stringify(alertsFinal));

  // Format and Send email
    sendMail(alertsFinal);
  });

    // Clean up: Empty collection.
    console.log(await db.collection(alertDBName).remove({}));

}

function sendMail(alertContent){
  for (let obj of alertContent) {
    console.log(JSON.stringify(obj._id));
    var mailOptions = {
      from: sendersAddr,
      to: obj._id,
      subject: "New Matched Documents",
      //text: ''
      html:
        "<h1>Recent uploads to docsim have matched your subscribed documents!</h1><body>" +
        obj.mergedTitles.toString() +
        "</body>"
    };

    console.log(mailOptions.html);

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.log(err);
      } else {
        console.log("Email sent: " + info.response);
      }
    });
  }
}
