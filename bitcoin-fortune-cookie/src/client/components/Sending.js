import React, { useState, useEffect } from "react";
import closedCookie from "../../assets/closed-cookie.png";
import Loader from "react-loader-spinner";
var QRCode = require("qrcode.react");
let checkForPaymentInterval = null;

export default function Sending(props) {
  const [readyToSend, setReadyToSend] = useState(false);
  const [sent, setSent] = useState(false);
  const [recipient, setRecipeint] = useState("");
  const [sender, setSender] = useState("");
  const [invoice, setInvoice] = useState("");
  const [customFortune, setCustomFortune] = useState("");
  const [displayCustomMessageInput, setDisplayCustomMessageInput] = useState(
    false
  );
  const [src, setSrc] = useState("/sending-cookie.gif?a=" + Math.random());

  useEffect(() => {
    return () => {
      // Stoping the browser from checking for payments
      clearInterval(checkForPaymentInterval);
    };
  }, []);
  const checkForPayment = (id) => {
    var counter = 0;
    checkForPaymentInterval = setInterval(async () => {
      console.log("checked");
      counter = counter + 1;
      if (counter === 300) {
        clearInterval(checkForPaymentInterval);
      }
      const res = await fetch("/check-for-payment/" + id);
      if (res.status !== 402) {
        setInvoice("");
        setSent(true);
        clearInterval(checkForPaymentInterval);
      }
    }, 1000);
  };

  const requestCookieDelivery = async (e) => {
    e.preventDefault();
    if (!validTwitteUser(recipient)) {
      alert(`that's not a twitter handle`);
      return;
    }
    setReadyToSend(true);
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        recipient: recipient,
        sender: sender,
        customFortune: customFortune,
      }),
    };
    fetch("/request-cookie-delivery", requestOptions)
      .then((response) => response.json())
      .then((data) => {
        setInvoice(data.invoice);
        setTimeout(() => {
          checkForPayment(data._id);
        }, 1000);
      });
  };

  const validTwitteUser = (sn) => {
    return /^@(?=.*\w)[\w]{1,15}$/.test(sn);
  };

  const handleChange = (e) => {
    if (e.target.name === "recipient") {
      setRecipeint(e.target.value);
    }
    if (e.target.name === "sender") {
      setSender(e.target.value);
    }
    if (e.target.name === "custom-fortune") {
      setCustomFortune(e.target.value);
    }
    if (e.target.name === "custom") {
      console.log(e.target.checked);
      setDisplayCustomMessageInput(e.target.checked);
    }
  };

  const pay = () => {
    fetch(`/pay/${invoice}`);
  };

  return (
    <div>
      {/* preloading the cookie animation so it's ready to play when the user pays.*/}
      <img src={src} alt="" style={{ display: "none" }} />

      {!sent ? (
        <img className="cookie-image" src={closedCookie} alt="" />
      ) : (
        <div>
          <img className="cookie-image" src={src} alt="" />
          <p>A cookie was sent to {recipient}</p>
        </div>
      )}

      {!readyToSend ? (
        <form action="">
          <p>Who do you want to send it to?</p>
          <input
            placeholder="Twitter Handle"
            className="sending-text-input"
            name="recipient"
            value={recipient}
            onChange={handleChange}
            type="text"
            maxLength="20"
          />
          <p>Who is it from?</p>
          <input
            placeholder="Feel free to leave this blank"
            className="sending-text-input"
            name="sender"
            value={sender}
            onChange={handleChange}
            type="text"
            maxLength="20"
          />
          <div>
            <input
              type="checkbox"
              name="custom"
              checked={displayCustomMessageInput}
              onChange={handleChange}
            />
            <label htmlFor="custom">
              Write a custom message for +1000 sats
            </label>
          </div>
          {displayCustomMessageInput ? (
            <textarea
              placeholder="a kind and polite fortune"
              className="sending-text-input custom-fortune-input"
              name="custom-fortune"
              value={customFortune}
              onChange={handleChange}
              maxLength="80"
              type="textbox"
            />
          ) : null}

          <div>
            <button
              className="button submit-button"
              onClick={requestCookieDelivery}
            >
              Submit
            </button>
          </div>
        </form>
      ) : (
        <div>
          {invoice ? (
            <div>
              <p>Please pay this invoice to send a cookie to {recipient}</p>
              <QRCode
                value={invoice}
                size={200}
                style={{ background: "white", padding: "10px" }}
              />
              <p>
                <a href={`lightning:${invoice}`}>Open your wallet</a>
              </p>
              <button style={{ position: "absolute", left: 0 }} onClick={pay}>
                pay
              </button>
            </div>
          ) : (
            <span>
              {" "}
              {!sent ? (
                <Loader type="Rings" color="#00BFFF" height={200} width={200} />
              ) : null}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
