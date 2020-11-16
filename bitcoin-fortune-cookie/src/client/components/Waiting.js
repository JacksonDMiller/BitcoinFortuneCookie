import React from "react";

export default function waiting(props) {
  const { setMode } = props;
  return (
    <div className="waiting-page-button-container">
      <button className="button" onClick={() => setMode("buying")}>
        Buy a cookie
      </button>
      <button className="button" onClick={() => setMode("sending")}>
        Send a cookie
      </button>
    </div>
  );
}
