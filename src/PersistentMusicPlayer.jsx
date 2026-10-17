import { useState } from "react";

const STORAGE_KEY = "patriasoul-val-current-track-v1";

function readTrack() {
  try {
    const value = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "null");
    return value && value.id && value.title ? value : null;
  } catch {
    return null;
  }
}

export default function PersistentMusicPlayer() {
  const [track, setTrack] = useState(readTrack);

  function closePlayer() {
    window.localStorage.removeItem(STORAGE_KEY);
    setTrack(null);
  }

  if (!track) return null;

  return (
    <aside
      aria-label="Hrvatski Val Player — nastavi slušanje"
      style={{
        position: "fixed", zIndex: 10000, right: 18, bottom: 18,
        width: "min(360px, calc(100vw - 24px))", padding: 12,
        display: "grid", gridTemplateColumns: "minmax(0, 1fr) auto",
        gap: 10, alignItems: "start", color: "#fff",
        background: "linear-gradient(145deg, #071b35, #12345a)",
        border: "1px solid rgba(255,255,255,.18)", borderRadius: 16,
        boxShadow: "0 12px 40px rgba(0,0,0,.38)"
      }}
    >
      <div style={{ minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <img src="/assets/images/1000000982.png" alt="" style={{ width: 28, height: 28, objectFit: "contain" }} />
          <div style={{ minWidth: 0 }}>
            <strong style={{ display: "block", fontSize: 11, letterSpacing: ".08em" }}>HRVATSKI VAL PLAYER</strong>
            <span style={{ display: "block", fontSize: 12, opacity: .82, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{track.title}</span>
          </div>
        </div>
        <iframe
          key={track.id}
          title={`Hrvatski Val Player — ${track.title}`}
          src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(track.id)}?autoplay=1&playsinline=1&rel=0`}
          allow="autoplay; encrypted-media; picture-in-picture"
          referrerPolicy="strict-origin-when-cross-origin"
          style={{ display: "block", width: "100%", aspectRatio: "16 / 9", border: 0, borderRadius: 9, background: "#000" }}
        />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <button type="button" onClick={closePlayer} aria-label="Zaustavi i zatvori player" title="Zaustavi glazbu" style={{ cursor: "pointer", border: "1px solid rgba(255,255,255,.25)", borderRadius: 9, color: "#fff", background: "rgba(255,255,255,.1)", width: 32, height: 32, fontSize: 19 }}>×</button>
        <a href="/hrvatski-val.html" title="Otvori Hrvatski Val Player" style={{ display: "grid", placeItems: "center", width: 32, height: 32, borderRadius: 9, color: "#fff", background: "#c52d3a", textDecoration: "none", fontWeight: 700 }}>♫</a>
      </div>
      <p style={{ gridColumn: "1 / -1", margin: 0, fontSize: 11, opacity: .72 }}>Glazba se nastavlja na Zidu zajednice. Ako preglednik blokira automatsku reprodukciju, pritisni Play u playeru.</p>
    </aside>
  );
}
