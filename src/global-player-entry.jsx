import React from "react";
import { createRoot } from "react-dom/client";
import PersistentMusicPlayer from "./PersistentMusicPlayer.jsx";

// Video arhiva namjerno ostaje bez glazbenog mini-playera.
// Hrvatski Val već ima svoj puni player na zasebnoj stranici.
if (!window.location.pathname.startsWith("/video-arhiva") &&
    !window.location.pathname.startsWith("/hrvatski-val")) {
  const mount = document.createElement("div");
  mount.id = "patriasoul-global-music-player";
  document.body.appendChild(mount);
  createRoot(mount).render(React.createElement(PersistentMusicPlayer));
}
