import React, { useEffect, useState } from "react";
import CountUp from "react-countup";

export default function Waiting(props) {
  const { setMode } = props;
  const [cookiesSold, setCookiesSold] = useState(null);

  useEffect(() => {
    getCookiesSold();
  }, []);

  const getCookiesSold = async () => {
    const res = await fetch("/cookies-sold");
    const data = await res.json();
    setCookiesSold(data.numberOfCookies);
  };
  return (
    <div className="waiting-page-button-container">
      <p>Open a digital fortune cookie. Powered by Bitcoin!</p>
      <button className="button" onClick={() => setMode("buying")}>
        Buy a cookie
      </button>
      {/* <button className="button" onClick={() => setMode("sending")}>
        Send a cookie
      </button> */}
      {cookiesSold ? (
        <p>
          <CountUp start={10} end={cookiesSold} /> cookies sold
        </p>
      ) : (
        <p>
          <CountUp end={10} /> cookies sold
        </p>
      )}
      <div className="contact-info">
        <p>
          Developed & designed by:{" "}
          <a href="https://twitter.com/JacksonDMiller">@JacksonDMiller</a> &{" "}
          <a href="https://twitter.com/artdesignbySF">@artdesignbySF</a>
        </p>
      </div>
    </div>
  );
}
