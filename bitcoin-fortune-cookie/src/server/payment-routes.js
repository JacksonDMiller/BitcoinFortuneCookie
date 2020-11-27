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

  //remove any fortunes that are too long.
  fortunes = fortunes.filter((fortune) => {
    return fortune.length < 75;
  });
});

//listen for payments and mark invoices as paid in the database
sub.on("invoice_updated", async (invoice) => {
  try {
    console.log("Inovice_update");
    if (invoice.is_confirmed === true) {
      console.log("Inovice_Confirmed");
      const doc = await Cookies.findOne({
        invoice: invoice.request,
      });
      if (doc.recipient) {
        console.log("database lookup complete");
        // Fortune cookie with a recipient has been paid for so send them a tweet.
        // put the the fortune text on the open cookie image
        const font = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);
        const fontCanvas = await Jimp.create(1200, 675).catch((err) => {
          console.error(err);
        });
        const destImage = await Jimp.read("./src/assets/opened-cookie.png");
        fontCanvas
          .print(
            font,
            120,
            155,
            {
              text: doc.fortune,
              alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
              alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE,
            },
            420
          )
          .rotate(-19);
        destImage
          .blit(fontCanvas, 0, 0)
          .writeAsync(`${doc._id}.png`)
          .then(async () => {
            console.log("image created");
            const cookieImage = await fs.readFileSync(`./${doc._id}.png`);
            client.post(
              "media/upload",
              { media: cookieImage },
              function (error, media, response) {
                if (error) {
                  console.log(error);
                } else {
                  const status = {
                    status: `Hey ${doc.recipient}, \n${doc.sender} sent you a fortune cookie.\n\nSend a cookie back at BitcoinFortuneCookie.com`,
                    media_ids: media.media_id_string,
                  };
                  client.post(
                    "statuses/update",
                    status,
                    function (error, tweet, response) {
                      if (error) {
                        console.log(error);
                      } else {
                        console.log("Successfully tweeted an image!");
                        fs.unlinkSync(`./${doc._id}.png`);
                      }
                    }
                  );
                }
              }
            );
          });
      }
      doc.paid = true;
      doc.save();
    }
  } catch (err) {
    console.log(err + "catch me");
    res.send({ message: err });
  }
});

module.exports = function (app) {
  //request a cookie returns an invoice

  app.get("/cookies-sold", (req, res) => {
    Cookies.countDocuments({ paid: "true" }, (err, c) => {
      if (err) {
        console.log(err);
        res.send({ numberOfCookies: 200 });
      } else {
        res.send({ numberOfCookies: c });
      }
    });
  });

  app.get("/pay/:invoice", async (req, res) => {
    const doc = await Cookies.findOne({
      invoice: req.params.invoice,
    });
    doc.paid = true;
    doc.save();
    res.status(200).send();
  });

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

  app.post("/request-cookie-delivery/", async (req, res) => {
    let isCookieCustom = false;
    let price = 100;
    console.log(req.body);
    if (req.body.customFortune) {
      price = 1100;
      isCookieCustom = true;
    }
    const invoice = await createInvoice({
      lnd,
      tokens: price,
      description: "Buy a cookie",
    });
    // checking for swear words in the sender field. This library is very easy to trick and should probably be replaced
    if (filter.isProfane(req.body.sender)) {
      req.body.sender = "Someone";
    }
    // making sure that the sender is captialized
    req.body.sender =
      req.body.sender.charAt(0).toUpperCase() + req.body.sender.slice(1);

    const cookie = new Cookies({
      recipient: req.body.recipient,
      date: new Date(),
      fortune:
        req.body.customFortune ||
        fortunes[Math.floor(Math.random() * fortunes.length)],
      invoice: invoice.request,
      paid: false,
      sender: req.body.sender || "Someone",
      custom: isCookieCustom,
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
      fortune: "1 Satoshi = 1 Satoshi 1 Satoshi = 1 Satoshi 1 Satoshi",
      _id: 1654655555,
    };
    const font = await Jimp.loadFont("http://192.168.0.33:3000/roboto.fnt");
    const fontCanvas = await Jimp.create(1200, 675);
    const destImage = await Jimp.read("./src/assets/opened-cookie.png");
    fontCanvas
      .print(
        font,
        120,
        155,
        {
          text: doc.fortune,
          alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
          alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE,
        },
        420
      )
      .rotate(-19);
    destImage
      .blit(fontCanvas, 0, 0)
      .writeAsync(`${doc._id}.png`)
      .then(async () => {
        setTimeout(async () => {}, 5000);
      });
  };
  // test();
};
