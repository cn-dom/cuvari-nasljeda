import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import Admin from "./Admin.jsx";
import Forum from "./Forum.jsx";
import Pages from "./Pages.jsx";
import "./index.css";

const route = window.location.pathname.replace(/\/$/, "");
const Screen = route === "/administracija.html"
  ? Admin
  : route === "/forum.html"
    ? Forum
    : route === "/stranice.html"
      ? Pages
      : App;

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Screen />
  </React.StrictMode>
);
