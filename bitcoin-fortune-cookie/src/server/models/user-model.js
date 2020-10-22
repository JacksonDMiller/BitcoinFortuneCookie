const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const cookieSchema = new Schema({
  date: Date,
  fortune: String,
  invoice: String,
  paid: Boolean,
  recipient: String,
  sender: String,
});

const Cookies = mongoose.model("Cookies", cookieSchema);

module.exports = Cookies;
