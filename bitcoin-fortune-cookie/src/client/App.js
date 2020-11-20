import React, { useState } from "react";
import "./App.css";
import logo from "../assets/logo.png";
import Waiting from "./components/Waiting.js";
import Buying from "./components/Buying.js";
import Sending from "./components/Sending";
import closedCookie from "../assets/closed-cookie.png";

function App() {
  const [mode, setMode] = useState("waiting");

  // 53 seems like a good max maybe 50

  const reset = () => {
    setMode("waiting");
  };

  return (
    <div className="container">
      <img src={closedCookie} alt="" style={{ display: "none" }} />
      <img className="logo" onClick={reset} src={logo} alt="Logo" />
      {mode === "waiting" ? <Waiting setMode={setMode} /> : null}
      {mode === "buying" ? <Buying setMode={setMode} /> : null}
      {mode === "sending" ? <Sending setMode={setMode} /> : null}
      {mode === "termsofservice" ? (
        <div>
          <p>It's simple don't be a jerk</p>
        </div>
      ) : null}

      <div className="footer">
        <a
          className="twitter-icon-link"
          href="https://twitter.com/intent/user?screen_name=Bitcoin_Cookie"
        >
          <img className="twitter-icon" src="/twitter-icon.png" alt="" />
        </a>
        <a href="https://twitter.com/Bitcoin_Cookie">Contact</a>
        <a href="https://twitter.com/Bitcoin_Cookie">Report a Bug</a>
        <a href="#" onClick={() => setMode("termsofservice")}>
          Terms of Service
        </a>
      </div>
    </div>
  );
}

export default App;
