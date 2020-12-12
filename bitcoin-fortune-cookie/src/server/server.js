const express = require("express");
var bodyParser = require("body-parser");
const path = require("path");
const mongoose = require("mongoose");
const fs = require("fs");
const keys = require("./config/keys");
const https = require("https");
var http = express();
// setting up express
var app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// redirecting requests that come in on http
// app.use(function (req, res, next) {
//   if (req.secure) {
//     // request was via https, so do no special handling
//     next();
//   } else {
//     // request was via http, so redirect to https
//     res.redirect("https://" + req.headers.host + req.url);
//   }
// });

require("./payment-routes")(app);

const dbSetup = async () => {
  await mongoose.connect(keys.mongodb.uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
  });
};

dbSetup();

app.use(express.static(path.join(__dirname, "../", "../", "build")));

app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname, "../", "../", "build", "index.html"));
});

// const options = {
//   key: fs.readFileSync(
//     "/etc/letsencrypt/live/bitcoinfortunecookie.com/privkey.pem",
//     "utf8"
//   ),
//   cert: fs.readFileSync(
//     "/etc/letsencrypt/live/bitcoinfortunecookie.com/fullchain.pem",
//     "utf8"
//   ),
// };
// https.createServer(options, app).listen(443);

app.listen(80);
console.log("Yip Yip! Listening on port 80");
