const express = require("express");
var bodyParser = require("body-parser");
const path = require("path");
const mongoose = require("mongoose");
const fs = require("fs");
const keys = require("./config/keys");

// setting up express
var app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

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

app.listen(process.env.PORT || 8080);
console.log("Yip Yip! Listening on port 8080");
