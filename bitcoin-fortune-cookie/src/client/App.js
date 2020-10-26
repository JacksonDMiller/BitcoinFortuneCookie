import React, { useState } from "react";
import "./App.css";
import logo from "../assets/logo.png";
import closedCookie from "../assets/closed-cookie.gif";
import openingCookie from "../assets/opening-cookie.gif";
import sendingCookie from "../assets/send-cookie-animation.gif";
var QRCode = require("qrcode.react");
let checkForPaymentInterval = null;

function App() {
  const [mode, setMode] = useState("waiting");
  const [invoice, setInvoice] = useState("");
  // 53 seems like a good max maybe 50
  const [fortune, setFortune] = useState("");
  const [sent, setSent] = useState(false);
  const [readyToSend, setReadyToSend] = useState(false);
  const [recipient, setRecipeint] = useState("");
  const [sender, setSender] = useState("");

  const validTwitteUser = (sn) => {
    return /^@(?=.*\w)[\w]{1,15}$/.test(sn);
  };

  const requestCookie = async () => {
    setMode("buying");
    const res = await fetch(`/request-cookie/`);
    let data = await res.json();
    setInvoice(data.cookie.invoice);
    setTimeout(() => {
      checkForPayment(data.cookie._id);
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
        setFortune(data.fortune);
        clearInterval(checkForPaymentInterval);
      }
    }, 1000);
  };

  const handleChange = (e) => {
    if (e.target.name === "recipient") {
      setRecipeint(e.target.value);
    }
    if (e.target.name === "sender") {
      setSender(e.target.value);
    }
  };

  const reset = () => {
    clearInterval(checkForPaymentInterval);
    setMode("waiting");
    setInvoice("");
    setFortune("");
    setSent(false);
    setRecipeint("");
    setSender("");
    setReadyToSend(false);
  };

  return (
    <div className="container">
      <img className="logo" src={logo} alt="Logo" />
      {mode === "waiting" ? (
        <div>
          <button className="button" onClick={requestCookie}>
            Buy a cookie
          </button>
          <button className="button" onClick={() => setMode("sending")}>
            Send a cookie
          </button>
        </div>
      ) : null}
      {mode === "buying" ? (
        <div>
          {fortune ? (
            <div className="cookie-container">
              <img src={openingCookie} style={{ width: "500px" }} alt="" />
              <div className="fortune-box">
                <p className="fortune">{fortune}</p>
              </div>
            </div>
          ) : (
            <img src={closedCookie} style={{ width: "500px" }} alt="" />
          )}

          {invoice ? (
            <div>
              <QRCode
                value={invoice}
                size={300}
                style={{ background: "white", padding: "20px" }}
              />
              <p>Please pay this invoice to open the cookie</p>
            </div>
          ) : null}
        </div>
      ) : null}

      {mode === "sending" ? (
        <div>
          {!sent ? (
            <img src={closedCookie} style={{ width: "500px" }} alt="" />
          ) : (
            <div>
              <img src={sendingCookie} style={{ width: "500px" }} alt="" />
              <p>A cookie was sent to {recipient}</p>
            </div>
          )}

          {!readyToSend ? (
            <form action="">
              <p>Who do you want to send it to?</p>
              <input
                name="recipient"
                value={recipient}
                onChange={handleChange}
                type="text"
              />
              <p>Who is it from?</p>
              <input
                name="sender"
                value={sender}
                onChange={handleChange}
                type="text"
              />
              <button onClick={requestCookieDelivery}>Submit</button>
            </form>
          ) : (
            <div>
              {invoice ? (
                <div>
                  <QRCode
                    value={invoice}
                    size={300}
                    style={{ background: "white", padding: "20px" }}
                  />
                  <p>Please pay this invoice to send a cookie to {recipient}</p>
                </div>
              ) : null}
            </div>
          )}
        </div>
      ) : null}

      {mode !== "waiting" ? (
        <button className="button" onClick={reset}>
          Reset
        </button>
      ) : null}
    </div>
  );
}

export default App;
