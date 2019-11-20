# DB

Used by the some service to store subscriptions and send subscription alerts.

## Installation

```
npm install
```

[You will also need to have MongoDB Community Server installed.](https://www.mongodb.com/download-center/community)

## Usage

You can modify the server's location and sendGrid's configuration through the config file.

Email alerts use sendGrid's API, you can create a free account and generate an API key [on their site](https://app.sendgrid.com/)

```npm start``` to start the subscription database.

```npm buildTest``` to build the databases used when testing.

```npm sendAlerts``` to process and send pending alerts.
