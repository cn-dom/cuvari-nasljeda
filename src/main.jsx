import React, { Suspense, lazy } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
const Admin = lazy(() => import("./Admin.jsx"));
const Forum = lazy(() => import("./Forum.jsx"));
const Pages = lazy(() => import("./Pages.jsx"));
const Events = lazy(() => import("./Events.jsx"));
const AICenter = lazy(() => import("./AICenter.jsx"));
const VirtualMuseum = lazy(() => import("./VirtualMuseum.jsx"));
import "./index.css";

const route = window.location.pathname.replace(/\/$/, "");
const Screen = route === "/virtualni-muzej.html"
  ? VirtualMuseum
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
    <Suspense fallback={<main className="route-loading" role="status" aria-live="polite">Učitavanje PatriaSoula…</main>}>
      <Screen />
    </Suspense>
  </React.StrictMode>
);
