const keys = require("./config/keys");
const {
  authenticatedLndGrpc,
  subscribeToInvoices,
  createInvoice,
} = require("ln-service");
const Cookies = require("./models/user-model");
const { lnd } = authenticatedLndGrpc(keys.lnd);
const sub = subscribeToInvoices({ lnd });
fs = require("fs");
let fortunes = "";

fs.readFile(`./src/server/fortunes.txt`, "utf8", (err, data) => {
  if (err) throw err;
  fortunes = data.split("\n");
});

//listen for payments and mark invoices as paid in the database
sub.on("invoice_updated", async (invoice) => {
  // console.log(invoice);
  if (invoice.is_confirmed === true) {
    const doc = await Cookies.findOne({
      invoice: invoice.request,
    });
    doc.paid = true;
    doc.save();
  }
});

module.exports = function (app) {
  //request a cookie returns an invoice

  app.get("/request-cookie", async (req, res) => {
    const invoice = await createInvoice({
      lnd,
      tokens: 100,
      description: "Buy a cookie",
    });
    const cookie = new Cookies({
      date: new Date(),
      fortune: fortunes[Math.floor(Math.random() * fortunes.length)],
      invoice: invoice.request,
      paid: false,
    });
    cookie.save();
    res.send(cookie);
  });

  // check if a payment has been made
  app.get("/check-for-payment/:id", async (req, res) => {
    let cookie = await Cookies.findById(req.params.id);
    if (cookie.paid === true) {
      res.send({ fortune: cookie.fortune });
      return;
    }
    res.send({ error: "Waiting for payment" });
  });
};
