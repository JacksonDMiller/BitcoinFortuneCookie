import React, { useState } from "react";
// import "./App.css";
import logo from "../assets/logo.png";
import Waiting from "./components/Waiting.js";
import Buying from "./components/Buying.js";
import Sending from "./components/Sending";
import closedCookie from "../assets/closed-cookie.png";
import openingCookie from "../assets/opening-cookie.gif";
import sendingCookie from "../assets/send-cookie-animation.gif";

function App() {
  const [mode, setMode] = useState("waiting");

  // 53 seems like a good max maybe 50

  const reset = () => {
    setMode("waiting");
  };

  return (
    <div className="container">
      <img src={closedCookie} alt="" style={{ display: "none" }} />
      <img src={openingCookie} alt="" style={{ display: "none" }} />
      <img src={sendingCookie} alt="" style={{ display: "none" }} />
      <img className="logo" src={logo} alt="Logo" />
      {mode === "waiting" ? <Waiting setMode={setMode} /> : null}
      {mode === "buying" ? <Buying setMode={setMode} /> : null}
      {mode === "sending" ? <Sending setMode={setMode} /> : null}
      {mode !== "waiting" ? (
        <button className="button" onClick={reset}>
          Reset
        </button>
      ) : null}
    </div>
  );
}

export default App;
