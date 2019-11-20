/**
 * An alert is composed of the matched documents ID and title, and the subscribed document it matched.
 */

var alerts = [{
  matchedDocID: "0000001",
  matchedName: "The First New Document",
  subscribedTo: {
    docID: "385a6",
    name: "Dont worry about it",
    subscriber: {
      username: "steve",
      email: "steve@mail.com",
      minSimilarity: "0.7"
    }
  }
},{
  matchedDocID: "101010",
  matchedName: "Neat New Document",
  subscribedTo: {
    docID: "123",
    name: "TestDoc1",
    subscriber: {
      username: "demo",
      email: "demo@mail.com",
      minSimilarity: "0.7"
    }
  }
},{
  matchedDocID: "123125",
  matchedName: "Something about Space",
  subscribedTo: {
    docID: "789",
    name: "HelloWorld:AnEmotionalJourney",
    subscriber: {
      username: "demo",
      email: "demo@mail.com",
      minSimilarity: "0.9"
    }
  }
},{
  matchedDocID: "123125",
  matchedName: "Something about Space",
  subscribedTo: {
    docID: "147",
    name: "TESTING",
    subscriber: {
      username: "demo",
      email: "demo@mail.com",
      minSimilarity: "0.6"
    }
  }
}]

module.exports = alerts;