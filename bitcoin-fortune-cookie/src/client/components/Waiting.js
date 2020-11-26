import React, { useEffect, useState } from "react";

export default function Waiting(props) {
  const { setMode } = props;
  const [cookiesSold, setCookiesSold] = useState(100);

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

      <p>{cookiesSold} cookies sold</p>
    </div>
  );
}
