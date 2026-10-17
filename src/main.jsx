import React, { Suspense, lazy } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
const Admin = lazy(() => import("./Admin.jsx"));
const Forum = lazy(() => import("./Forum.jsx"));
const Pages = lazy(() => import("./Pages.jsx"));
const Events = lazy(() => import("./Events.jsx"));
const AICenter = lazy(() => import("./AICenter.jsx"));
const VirtualMuseum = lazy(() => import("./VirtualMuseum.jsx"));
const HrvatskaPamti = lazy(() => import("./HrvatskaPamti.jsx"));
const HrvatskaPamtiMjesto = lazy(() => import("./HrvatskaPamtiMjesto.jsx"));
const HrvatskaPamtiGrobnice = lazy(() => import("./HrvatskaPamtiGrobnice.jsx"));
const PatriaSoulVideo = lazy(() => import("./PatriaSoulVideo.jsx"));
const HrvatskiVal = lazy(() => import("./HrvatskiVal.jsx"));
import "./index.css";

const route = window.location.pathname.replace(/\/$/, "");
const Screen = route === "/hrvatska-pamti-grobnice.html"
  ? HrvatskaPamtiGrobnice
  : route === "/hrvatska-pamti-mjesto.html"
  ? HrvatskaPamtiMjesto
  : route === "/hrvatska-pamti.html"
  ? HrvatskaPamti
  : route === "/video-arhiva.html"
  ? PatriaSoulVideo
  : (route === "/hrvatski-val.html" || route === "/hrvatski-val")
  ? HrvatskiVal
  : route === "/virtualni-muzej.html"
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
