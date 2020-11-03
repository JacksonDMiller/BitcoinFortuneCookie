import React, { useState, useEffect } from "react";
import openingCookie from "../../assets/opening-cookie.gif";
import closedCookie from "../../assets/closed-cookie.png";
var QRCode = require("qrcode.react");
let checkForPaymentInterval = null;
export default function Sending(props) {
  const { setMode } = props;
  const [invoice, setInvoice] = useState("");
  const [fortune, setFortune] = useState("");
  const [showFortune, setShowForutne] = useState("none");

  useEffect(() => {
    requestCookie();
  }, []);

  const requestCookie = async () => {
    setMode("buying");
    const res = await fetch(`/request-cookie/`);
    let data = await res.json();
    setInvoice(data.cookie.invoice);
    setTimeout(() => {
      checkForPayment(data.cookie._id);
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
        setFortune(data.fortune);
        clearInterval(checkForPaymentInterval);
      }
    }, 1000);
  };

  return (
    <div className="mode-container">
      {fortune ? (
        <div className="cookie-fortune-container">
          <img
            // onLoad={() => setShowForutne("block")}
            className="cookie-image"
            src={openingCookie}
            alt=""
          />
          <div className="fortune-box">
            <p style={{ display: { showFortune } }} className="fortune">
              {fortune}
            </p>
          </div>
        </div>
      ) : (
        <img className="cookie-image" src={closedCookie} alt="" />
      )}

      {invoice ? (
        <div>
          <p>Please pay this invoice to open the cookie</p>
          <QRCode
            value={invoice}
            size={200}
            style={{ background: "white", padding: "10px" }}
          />
          <p>
            <a href={`lightning:${invoice}`}>Open your wallet</a>
          </p>
        </div>
      ) : null}
    </div>
  );
}
