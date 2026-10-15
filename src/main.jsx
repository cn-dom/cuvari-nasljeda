import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import Admin from "./Admin.jsx";
import Forum from "./Forum.jsx";
import Pages from "./Pages.jsx";
import Events from "./Events.jsx";
import AICenter from "./AICenter.jsx";
import Museum from "./Museum.jsx";
import "./index.css";

const route = window.location.pathname.replace(/\/$/, "");
const Screen = route === "/virtualni-muzej.html"
  ? Museum
  : route === "/ai-centar.html"
  ? AICenter
  : route === "/administracija.html"
  ? Admin
  : route === "/forum.html"
    ? Forum
    : route === "/stranice.html"
      ? Pages
      : route === "/dogadaji.html"
        ? Events
        : App;

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Screen />
  </React.StrictMode>
);
