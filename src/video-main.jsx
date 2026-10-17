import React from "react";
import { createRoot } from "react-dom/client";
import PatriaSoulVideo from "./PatriaSoulVideo.jsx";

createRoot(document.getElementById("video-root")).render(
  <React.StrictMode><PatriaSoulVideo /></React.StrictMode>
);
