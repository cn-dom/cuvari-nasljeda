import { useEffect, useRef, useState } from "react";

const STORAGE_KEY = "patriasoul-val-current-track-v1";
const ENDPOINT = import.meta.env.VITE_YOUTUBE_SEARCH_ENDPOINT || "/api/youtube-search";
const clean = (value, max = 240) => String(value || "").replace(/[<>]/g, "").trim().slice(0, max);

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
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [position, setPosition] = useState(null);
  const dragRef = useRef(null);
  const iframeRef = useRef(null);

  useEffect(() => {
    let player = null;
    let saveTimer = null;
    let cancelled = false;
    const previousReady = window.onYouTubeIframeAPIReady;
    const advanceNext = () => {
      try {
        const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "null");
        const queue = Array.isArray(stored?.queue) ? stored.queue : [];
        const nextIndex = Number(stored?.queueIndex ?? -1) + 1;
        if (nextIndex >= 0 && nextIndex < queue.length) {
          const nextTrack = { ...queue[nextIndex], queue, queueIndex: nextIndex, currentTime: 0 };
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextTrack));
          setTrack(nextTrack);
        }
      } catch { /* Ignore malformed queue data. */ }
    };
    const savePosition = (seconds) => {
      if (!Number.isFinite(seconds) || seconds < 0) return;
      try {
        const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "null");
        if (stored && stored.id === track.id) {
          stored.currentTime = Math.floor(seconds);
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
        }
      } catch { /* Storage may be unavailable. */ }
    };
    const attachPlayer = () => {
      if (cancelled || !window.YT || !window.YT.Player || !iframeRef.current) return;
      try {
        player = new window.YT.Player(iframeRef.current, {
          events: {
            onReady: (event) => {
              const resumeAt = Math.max(0, Number(track.currentTime) || 0);
              if (resumeAt > 0) event.target.seekTo(resumeAt, true);
              event.target.playVideo();
              saveTimer = window.setInterval(() => {
                try { savePosition(event.target.getCurrentTime()); } catch { /* Ignore player teardown. */ }
              }, 1000);
            },
            onStateChange: (event) => {
              if (event.data === window.YT.PlayerState.ENDED) advanceNext();
            }
          }
        });
      } catch (error) {
        console.warn("Hrvatski Val: nastavak reprodukcije nije dostupan", error);
      }
    };
    const readyHandler = () => {
      if (typeof previousReady === "function") previousReady();
      attachPlayer();
    };
    if (window.YT && window.YT.Player) {
      attachPlayer();
    } else {
      window.onYouTubeIframeAPIReady = readyHandler;
      if (!document.querySelector("script[data-patriasoul-youtube-api]")) {
        const script = document.createElement("script");
        script.src = "https://www.youtube.com/iframe_api";
        script.async = true;
        script.dataset.patriasoulYoutubeApi = "true";
        document.head.appendChild(script);
      }
    }
    return () => {
      cancelled = true;
      if (saveTimer) window.clearInterval(saveTimer);
      try { if (player && player.getCurrentTime) savePosition(player.getCurrentTime()); } catch { /* Ignore page transition. */ }
      if (window.onYouTubeIframeAPIReady === readyHandler) window.onYouTubeIframeAPIReady = previousReady;
    };
  }, [track?.id]);

  function closePlayer() {
    window.localStorage.removeItem(STORAGE_KEY);
    setTrack(null);
  }

  function startDrag(event) {
    if (event.button !== 0 || event.target.closest("button, a, input")) return;
    const panel = event.currentTarget.closest("aside");
    const rect = panel.getBoundingClientRect();
    dragRef.current = { pointerId: event.pointerId, offsetX: event.clientX - rect.left, offsetY: event.clientY - rect.top };
    event.currentTarget.setPointerCapture?.(event.pointerId);
    event.preventDefault();
  }

  function moveDrag(event) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const width = Math.min(380, window.innerWidth - 24);
    const height = event.currentTarget.closest("aside").getBoundingClientRect().height;
    setPosition({
      x: Math.max(8, Math.min(window.innerWidth - width - 8, event.clientX - drag.offsetX)),
      y: Math.max(8, Math.min(window.innerHeight - Math.min(height, window.innerHeight - 16) - 8, event.clientY - drag.offsetY)),
    });
  }

  function endDrag() {
    dragRef.current = null;
  }

  function playTrack(nextTrack, searchQueue = [nextTrack]) {
    const queue = searchQueue.length ? searchQueue : [nextTrack];
    const queueIndex = Math.max(0, queue.findIndex((item) => item.id === nextTrack.id));
    const preparedTrack = { ...nextTrack, queue, queueIndex, currentTime: 0 };
    setTrack(preparedTrack);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(preparedTrack));
    } catch {
      // Storage may be unavailable; the current-page player still works.
    }
    setResults([]);
    setQuery("");
    setSearchError("");
    setSearchOpen(false);
    setMinimized(false);
  }

  async function searchTracks(event) {
    event?.preventDefault();
    const term = clean(query, 180);
    if (!term || searching) return;
    setSearching(true);
    setSearchError("");
    setSearchOpen(true);
    try {
      const response = await fetch(`${ENDPOINT}${ENDPOINT.includes("?") ? "&" : "?"}q=${encodeURIComponent(term)}`);
      let payload;
      try {
        payload = await response.json();
      } catch {
        throw new Error(`Poslužitelj je vratio neispravan odgovor (${response.status}).`);
      }
      if (!response.ok) throw new Error(payload.error || `Pretraživanje nije uspjelo (${response.status}).`);
      const items = Array.isArray(payload.items) ? payload.items : Array.isArray(payload.results) ? payload.results : [];
      const mapped = items.map((item) => {
        const snippet = item.snippet || item;
        const id = item.id?.videoId || item.youtubeId || item.videoId;
        if (!id) return null;
        return {
          id,
          title: clean(snippet.title || item.title, 160) || "Pjesma bez naslova",
          artist: clean(snippet.channelTitle || item.channelTitle || item.artist || "YouTube", 120),
          thumbnail: snippet.thumbnails?.medium?.url || snippet.thumbnails?.high?.url || `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
        };
      }).filter(Boolean);
      setResults(mapped.slice(0, 6));
      if (!mapped.length) setSearchError("Nema rezultata. Pokušaj drugi naziv pjesme ili izvođača.");
    } catch (error) {
      setSearchError(error.message || "Pretraživanje trenutačno nije dostupno.");
      setResults([]);
    } finally {
      setSearching(false);
    }
  }


  const panelStyle = {
    position: "fixed", zIndex: 10000,
    ...(position ? { left: position.x, top: position.y, right: "auto", bottom: "auto" } : { right: 18, bottom: 18 }),
    width: minimized ? "min(300px, calc(100vw - 24px))" : "min(380px, calc(100vw - 24px))",
    maxHeight: "min(82vh, 680px)", overflowY: "auto", padding: 12, display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) auto", gap: 10, alignItems: "start",
    color: "#fff", background: "linear-gradient(145deg, #071b35, #12345a)",
    border: "1px solid rgba(255,255,255,.18)", borderRadius: 16,
    boxShadow: "0 12px 40px rgba(0,0,0,.38)", touchAction: "auto"
  };

  return (
    <aside aria-label="Hrvatski Val Player — nastavi slušanje" style={panelStyle}>
      <div style={{ minWidth: 0 }}>
        <div
          onPointerDown={startDrag}
          onPointerMove={moveDrag}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: minimized ? 0 : 8, cursor: "move", touchAction: "none", userSelect: "none" }}
          title="Povuci za pomicanje playera"
        >
          <img src="/assets/images/1000000982.png" alt="" style={{ width: 28, height: 28, objectFit: "contain", pointerEvents: "none" }} />
          <div style={{ minWidth: 0, flex: 1, pointerEvents: "none" }}>
            <strong style={{ display: "block", fontSize: 11, letterSpacing: ".08em" }}>HRVATSKI VAL PLAYER</strong>
            <span style={{ display: "block", fontSize: 12, opacity: .82, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{track?.title || "Odaberi pjesmu"}</span>
          </div>
          <span aria-hidden="true" style={{ fontSize: 12, opacity: .6 }}>⠿</span>
        </div>

        {!minimized && <>
          <form onSubmit={searchTracks} style={{ display: "flex", gap: 6, marginBottom: 9 }}>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onFocus={() => setSearchOpen(true)}
              placeholder="Pronađi pjesmu ili izvođača…"
              aria-label="Pretraži pjesme"
              style={{ minWidth: 0, width: "100%", padding: "9px 10px", borderRadius: 9, border: "1px solid rgba(255,255,255,.22)", background: "rgba(255,255,255,.1)", color: "#fff", fontSize: 12, outlineOffset: 2 }}
            />
            <button type="submit" disabled={searching || !query.trim()} style={{ flexShrink: 0, padding: "0 10px", border: 0, borderRadius: 9, color: "#fff", background: "#c52d3a", fontWeight: 700, fontSize: 12, cursor: searching ? "wait" : "pointer", opacity: searching || !query.trim() ? .65 : 1 }}>
              {searching ? "…" : "Traži"}
            </button>
          </form>

          {searchOpen && (results.length > 0 || searchError || searching) && (
            <div style={{ display: "grid", gap: 6, marginBottom: 9 }}>
              {searching && <span style={{ fontSize: 12, opacity: .8 }}>Tražim pjesme…</span>}
              {searchError && <span role="status" style={{ fontSize: 12, color: "#ffd2d6" }}>{searchError}</span>}
              {results.map((result) => (
                <button key={result.id} type="button" onClick={() => playTrack(result, results)} style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", minWidth: 0, padding: 6, textAlign: "left", border: "1px solid rgba(255,255,255,.13)", borderRadius: 9, background: "rgba(255,255,255,.07)", color: "#fff", cursor: "pointer" }}>
                  <img src={result.thumbnail} alt="" style={{ width: 54, height: 34, flexShrink: 0, objectFit: "cover", borderRadius: 5, background: "#000" }} />
                  <span style={{ minWidth: 0, flex: 1 }}>
                    <strong style={{ fontSize: 11, lineHeight: 1.35, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{result.title}</strong>
                    <small style={{ display: "block", marginTop: 2, fontSize: 10, opacity: .7, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{result.artist}</small>
                  </span>
                  <span aria-hidden="true" style={{ color: "#ffb8c0", fontSize: 16 }}>▶</span>
                </button>
              ))}
            </div>
          )}

          {track && <iframe
            key={track.id}
            title={`Hrvatski Val Player — ${track.title}`}
            src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(track.id)}?autoplay=1&playsinline=1&rel=0&enablejsapi=1`}
            ref={iframeRef}
            allow="autoplay; encrypted-media; picture-in-picture"
            referrerPolicy="strict-origin-when-cross-origin"
            style={{ display: "block", width: "100%", aspectRatio: "16 / 9", border: 0, borderRadius: 9, background: "#000" }}
          />}
          {track ? <p style={{ margin: "9px 0 0", fontSize: 11, opacity: .72 }}>Povuci gornju traku za pomicanje. Smanji player da ne smeta čitanju.</p> : <p style={{ margin: "9px 0 0", fontSize: 11, opacity: .72 }}>Player je spreman. Pretraži pjesmu i slušaj dok pregledavaš PatriaSoul.</p>}
        </>}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <button type="button" onClick={() => setMinimized((value) => !value)} aria-label={minimized ? "Proširi player" : "Smanji player"} title={minimized ? "Proširi player" : "Smanji player"} style={{ cursor: "pointer", border: "1px solid rgba(255,255,255,.25)", borderRadius: 9, color: "#fff", background: "rgba(255,255,255,.1)", width: 32, height: 32, fontSize: 16 }}>{minimized ? "□" : "−"}</button>
        <button type="button" onClick={closePlayer} aria-label="Zaustavi i zatvori player" title="Zaustavi glazbu" style={{ cursor: "pointer", border: "1px solid rgba(255,255,255,.25)", borderRadius: 9, color: "#fff", background: "rgba(255,255,255,.1)", width: 32, height: 32, fontSize: 19 }}>×</button>
        <a href="/hrvatski-val.html" title="Otvori Hrvatski Val Player" style={{ display: "grid", placeItems: "center", width: 32, height: 32, borderRadius: 9, color: "#fff", background: "#c52d3a", textDecoration: "none", fontWeight: 700 }}>♫</a>
      </div>
    </aside>
  );
}
