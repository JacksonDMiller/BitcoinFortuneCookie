import React, { useState } from "react";
import "./App.css";
import logo from "../assets/logo.png";
import closedCookie from "../assets/closed-cookie.gif";
import openingCookie from "../assets/opening-cookie.gif";
var QRCode = require("qrcode.react");

export default function App() {
  const [invoice, setInvoice] = useState(null);
  const [fortune, setFortune] = useState(null);
  const [error, setError] = useState(null);

  const requestCookie = async () => {
    setFortune(null);
    setInvoice(null);
    setError(null);
    const data = await fetch("/request-cookie");
    let cookie = await data.json();
    setInvoice(cookie.invoice);
    checkForPayment(cookie._id);
  };

  function checkForPayment(id) {
    setTimeout(async () => {
      const data = await fetch("/check-for-payment/" + id);
      let response = await data.json();
      if (response.error) {
        setError(response.error);
        checkForPayment(id);
        return;
      }
      setError(null);
      setInvoice(null);
      setFortune(response.fortune);
    }, 1000);
  }

  return (
    <div>
      <img src={logo} alt="" />
      {invoice ? (
        <div>
          <img src={closedCookie} style={{ width: "500px" }} alt="" />
          <p>Pay the invoice to open your cookie</p>
        </div>
      ) : null}

      {fortune ? (
        <div>
          <img src={openingCookie} style={{ width: "500px" }} alt="" />
          <p>{fortune}</p>
        </div>
      ) : null}

      <button onClick={requestCookie}>buy a cookie</button>
      {invoice ? <QRCode value={invoice} size={300} /> : null}
      {error ? <p>{error}</p> : null}
    </div>
  );
}
