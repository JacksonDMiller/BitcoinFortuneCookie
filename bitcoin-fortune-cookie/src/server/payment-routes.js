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
var Twitter = require("twitter");
var Jimp = require("jimp");

var Filter = require("bad-words"),
  filter = new Filter();

var client = new Twitter({
  consumer_key: keys.twitter.consumer_key,
  consumer_secret: keys.twitter.consumer_secret,
  access_token_key: keys.twitter.access_token_key,
  access_token_secret: keys.twitter.access_token_secret,
});

fs.readFile(`./src/server/fortunes.txt`, "utf8", (err, data) => {
  if (err) throw err;
  fortunes = data.split("\n");
});

//listen for payments and mark invoices as paid in the database
sub.on("invoice_updated", async (invoice) => {
  if (invoice.is_confirmed === true) {
    const doc = await Cookies.findOne({
      invoice: invoice.request,
    });
    if (doc.recipient) {
      // put the the fortune text on the open cookie image
      const font = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);
      const fontCanvas = await Jimp.create(1054, 597);
      const destImage = await Jimp.read("./src/assets/open-cookie.png");
      fontCanvas.print(font, 100, 50, doc.fortune, 410).rotate(-27);
      destImage
        .blit(fontCanvas, 0, 0)
        .writeAsync(`${doc._id}.png`)
        .then(async () => {
          const cookieImage = await fs.readFileSync(`./${doc._id}.png`);

          // there is a recepient so send them a tweet to tell them about the cookie
          client.post("media/upload", { media: cookieImage }, function (
            error,
            media,
            response
          ) {
            if (error) {
              console.log(error);
            } else {
              const status = {
                status: `Hey ${doc.recipient}, \n${doc.sender} sent you a fortune cookie.\n\nSend a cookie back at BitcoinCookie.com`,
                media_ids: media.media_id_string,
              };

              client.post("statuses/update", status, function (
                error,
                tweet,
                response
              ) {
                if (error) {
                  console.log(error);
                } else {
                  console.log("Successfully tweeted an image!");
                  fs.unlinkSync(`./${doc._id}.png`);
                }
              });
            }
          });
        });
    }
    doc.paid = true;
    doc.save();
  }
});

module.exports = function (app) {
  //request a cookie returns an invoice

  app.get("/request-cookie/", async (req, res) => {
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
    await cookie.save();
    cookie.fortune = undefined;
    res.send({ cookie });
  });

  app.get("/request-cookie-delivery/:recipient/:sender", async (req, res) => {
    console.log(req.params.recipient);
    const invoice = await createInvoice({
      lnd,
      tokens: 100,
      description: "Buy a cookie",
    });
    if (filter.isProfane(req.params.sender)) {
      req.params.sender = "Someone";
      console.log("changed");
    }

    req.params.sender =
      req.params.sender.charAt(0).toUpperCase() + req.params.sender.slice(1);

    const cookie = new Cookies({
      recipient: req.params.recipient,
      date: new Date(),
      fortune: fortunes[Math.floor(Math.random() * fortunes.length)],
      invoice: invoice.request,
      paid: false,
      sender: req.params.sender,
    });
    cookie.save();
    res.send(cookie);
  });

  // check if a payment has been made
  app.get("/check-for-payment/:id", async (req, res) => {
    let cookie = await Cookies.findById(req.params.id);
    if (cookie.paid === true) {
      if (cookie.recipient) {
        res.send({ message: `a cookie was sent to ${cookie.recipient}` });
        return;
      }
      res.send({ fortune: cookie.fortune });
      return;
    }
    res.status(402).send();
  });

  const test = async () => {
    doc = {
      fortune:
        "Hello this is a long fortune this is even longer and this is even longer",
      _id: 1654655555,
    };
    const font = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);
    const fontCanvas = await Jimp.create(1054, 597);
    const destImage = await Jimp.read("./src/assets/open-cookie.png");

    fontCanvas.print(font, 100, 50, doc.fortune, 410).rotate(-27);

    // fontCanvas.print(font, 120, 100, doc.fortune).rotate(-27);

    destImage.blit(fontCanvas, 0, 0).writeAsync(`${doc._id}.png`);
  };
  // test();
};