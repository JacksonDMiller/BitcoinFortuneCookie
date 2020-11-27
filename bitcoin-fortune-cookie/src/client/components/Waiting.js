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
      <button className="button" onClick={() => setMode("buying")}>
        Buy a cookie
      </button>
      <button className="button" onClick={() => setMode("sending")}>
        Send a cookie
      </button>
      {cookiesSold ? (
        <p>
          <CountUp start={200} end={cookiesSold} /> cookies sold
        </p>
      ) : (
        <p>
          <CountUp end={200} /> cookies sold
        </p>
      )}
      <p>
        Developed by:{" "}
        <a href="https://twitter.com/JacksonDMiller">@JacksonDMiller</a>
      </p>
      <p>
        Designed by:{" "}
        <a href="https://twitter.com/artdesignbySF">@artdesignbySF</a>
      </p>
    </div>
  );
}
