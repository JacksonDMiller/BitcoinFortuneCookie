import React, { useState } from "react";
import "./App.css";
import logo from "../assets/logo.png";
import closedCookie from "../assets/closed-cookie.gif";
import openingCookie from "../assets/opening-cookie.gif";
import sendingCookie from "../assets/send-cookie-animation.gif";
var QRCode = require("qrcode.react");

export default function App() {
  const [mode, setMode] = useState("waiting");
  const [invoice, setInvoice] = useState(null);
  const [fortune, setFortune] = useState(null);
  const [message, setMessage] = useState(null);
  const [send, setSend] = useState(false);
  const [recipient, setRecipeint] = useState("");
  const [sender, setSender] = useState("");
  const [sent, setSent] = useState(false);

  const handleChange = (e) => {
    if (e.target.name === "recipient") {
      setRecipeint(e.target.value);
    }
    if (e.target.name === "sender") {
      setSender(e.target.value);
    }
  };

  const requestCookie = async () => {
    setActive(true);
    setFortune(null);
    setInvoice(null);
    setMessage(null);
    if (recipient === "") {
      recipient = null;
    }
    if (sender === "") {
      sender = null;
    }
    const data = await fetch(`/request-cookie/${recipient}/${sender}`);
    let cookie = await data.json();
    setInvoice(cookie.invoice);
    checkForPayment(cookie._id);
  };

  const sendCookie = async () => {
    setActive(true);
    setSend(true);
  };

  const enterRecipient = (e, handle) => {
    e.preventDefault();
    requestCookie();
    setSend(false);
  };

  function checkForPayment(id) {
    setTimeout(async () => {
      const data = await fetch("/check-for-payment/" + id);
      let response = await data.json();
      if (response.message) {
        setMessage(response.message);
        if (response.message === "Waiting for payment") {
          checkForPayment(id);
        } else {
          setInvoice(null);
          setSent(true);
        }
        return;
      }
      setMessage(null);
      setInvoice(null);
      setFortune(response.fortune);
    }, 1000);
  }

  const reset = () => {
    setActive(false);
    setInvoice(null);
    setFortune(null);
    setMessage(null);
    setSend(false);
    setRecipeint(null);
  };

  return (
    <div>
      <img src={logo} alt="" />
      {invoice ? (
        <div>
          <img src={closedCookie} style={{ width: "500px" }} alt="" />
          {recipient ? (
            <p>Pay the invoice to send a cookie to {recipient}</p>
          ) : (
            <p>Pay the invoice to open your cookie</p>
          )}
        </div>
      ) : null}

      {fortune ? (
        <div>
          <img src={openingCookie} style={{ width: "500px" }} alt="" />
          <p>{fortune}</p>
        </div>
      ) : null}
      {active ? null : (
        <div>
          <button onClick={requestCookie}>Open a cookie</button>
          <button onClick={sendCookie}>Send a cookie</button>{" "}
        </div>
      )}

      {sent ? (
        <div>
          <img src={sendingCookie} style={{ width: "500px" }} alt="" />
          <p>{fortune}</p>
        </div>
      ) : null}

      {send ? (
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
          <button onClick={enterRecipient}>Submit</button>
        </form>
      ) : null}

      {invoice ? (
        <QRCode value={invoice} size={300} style={{ margin: "20px" }} />
      ) : null}
      {message ? <p>{message}</p> : null}

      {active ? <button onClick={reset}>Reset</button> : null}
    </div>
  );
}
