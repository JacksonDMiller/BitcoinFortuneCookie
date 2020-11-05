import React, { useState } from "react";
import closedCookie from "../../assets/closed-cookie.png";
import sendingCookie from "../../assets/send-cookie-animation.gif";
var QRCode = require("qrcode.react");
let checkForPaymentInterval = null;

export default function Sending(props) {
  const { setMode } = props;

  const [readyToSend, setReadyToSend] = useState(false);
  const [sent, setSent] = useState(false);
  const [recipient, setRecipeint] = useState("");
  const [sender, setSender] = useState("");
  const [invoice, setInvoice] = useState("");

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
        let data = await res.json();
        setInvoice("");
        setSent(true);
        clearInterval(checkForPaymentInterval);
      }
    }, 1000);
  };

  const requestCookieDelivery = async (e) => {
    if (sender) {
      setSender("Someone");
    }
    e.preventDefault();
    if (!validTwitteUser(recipient)) {
      alert(`that's not a twitter handle`);
      return;
    }
    setReadyToSend(true);
    const res = await fetch(`/request-cookie-delivery/${recipient}/${sender}`);
    let data = await res.json();
    setInvoice(data.invoice);
    setTimeout(() => {
      checkForPayment(data._id);
    }, 1000);
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
  };

  const pay = () => {
    fetch(`/pay/${invoice}`);
  };

  return (
    <div>
      {!sent ? (
        <img className="cookie-image" src={closedCookie} alt="" />
      ) : (
        <div>
          <img className="cookie-image" src={sendingCookie} alt="" />
          <p>A cookie was sent to {recipient}</p>
        </div>
      )}

      {!readyToSend ? (
        <form action="">
          <p>Who do you want to send it to?</p>
          <input
            className="sending-text-input"
            name="recipient"
            value={recipient}
            onChange={handleChange}
            type="text"
          />
          <p>Who is it from?</p>
          <input
            className="sending-text-input"
            name="sender"
            value={sender}
            onChange={handleChange}
            type="text"
          />
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
                size={300}
                style={{ background: "white", padding: "20px" }}
              />
              <p>
                <a href={`lightning:${invoice}`}>Open your wallet</a>
              </p>
              <button onClick={pay}>pay</button>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
