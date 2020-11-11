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

  const requestCookie = async () => {
    setMode("buying");
    const res = await fetch(`/request-cookie/`);
    let data = await res.json();
    setInvoice(data.cookie.invoice);
    setTimeout(() => {
      checkForPayment(data.cookie._id);
    }, 1000);
  };

  useEffect(() => {
    requestCookie();
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
        let data = await res.json();
        setInvoice("");
        setFortune(data.fortune);
        clearInterval(checkForPaymentInterval);
        setTimeout(() => {
          setShowForutne("block");
        }, 400);
      }
    }, 1000);
  };

  const pay = () => {
    fetch(`/pay/${invoice}`);
  };

  return (
    <div className="mode-container">
      {/* preloading the cookie animation so it's ready to play when the user pays. the random number is so that it dosent get cached */}
      <img src={openingCookie} alt="" style={{ display: "none" }} />
      {fortune ? (
        <div className="cookie-fortune-container">
          <img
            // onLoad={() => setShowForutne("block")}
            className="cookie-image"
            src={openingCookie}
            alt=""
          />
          <div className="fortune-box">
            <p style={{ display: showFortune }} className="fortune">
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
      <button onClick={pay}>pay</button>
    </div>
  );
}
