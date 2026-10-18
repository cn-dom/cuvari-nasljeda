import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, AudioLines, Heart, MessageCircle, Music2, Pause, Play, Search, SkipBack, SkipForward, Volume2, X, ChevronDown, ChevronUp, ListMusic, Clock3, Bookmark, Radio } from "lucide-react";
import { supabase } from "./lib/supabase";
import "./HrvatskiVal.css";
import SiteChrome from "./SiteChrome.jsx";

const ENDPOINT = import.meta.env.VITE_YOUTUBE_SEARCH_ENDPOINT || "/api/youtube-search";
const CATEGORIES = [
  ["Sve", "Glazba Hrvatska domoljubne pjesme klape"],
  ["Domoljubne pjesme", "hrvatske domoljubne pjesme"],
  ["Branitelji i sloboda", "hrvatski branitelji domovinski rat pjesme"],
  ["Klape i tradicija", "hrvatske klape tradicionalne pjesme"],
  ["Zavičaj i dom", "hrvatske pjesme zavičaj domovina"],
  ["Duhovne pjesme", "hrvatske duhovne pjesme"],
  ["Hrvatski rock", "hrvatski rock domoljubne pjesme"],
];
const FAV_KEY = "patriasoul-val-favorites-v1";
const HISTORY_KEY = "patriasoul-val-history-v1";
const CURRENT_TRACK_KEY = "patriasoul-val-current-track-v1";
const clean = (v, max = 240) => String(v || "").replace(/[<>]/g, "").trim().slice(0, max);
const normalize = (v) => String(v || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("hr");
const readList = (key) => { try { const x = JSON.parse(localStorage.getItem(key) || "[]"); return Array.isArray(x) ? x : []; } catch { return []; } };

export default function HrvatskiVal() {
  const [tracks, setTracks] = useState([]);
  const [active, setActive] = useState(() => { try { return JSON.parse(localStorage.getItem(CURRENT_TRACK_KEY) || "null"); } catch { return null; } });
  const [category, setCategory] = useState("Sve");
  const [query, setQuery] = useState("");
  const [favorites, setFavorites] = useState(() => readList(FAV_KEY));
  const [history, setHistory] = useState(() => readList(HISTORY_KEY));
  const [view, setView] = useState("all");
  const [session, setSession] = useState(null);
  const [likes, setLikes] = useState([]);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [commentBusy, setCommentBusy] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [playerVisible, setPlayerVisible] = useState(true);
  const [volume, setVolume] = useState(80);
  const playerIframeRef = useRef(null);
  const playerRef = useRef(null);
  const volumeRef = useRef(80);

  useEffect(() => {
    if (!active?.id || !playerIframeRef.current) return undefined;
    let player = null;
    let saveTimer = null;
    let cancelled = false;
    const previousReady = window.onYouTubeIframeAPIReady;
    const savePosition = (seconds) => {
      if (!Number.isFinite(seconds) || seconds < 0) return;
      try {
        const stored = JSON.parse(localStorage.getItem(CURRENT_TRACK_KEY) || "null");
        if (stored && stored.id === active.id) {
          stored.currentTime = Math.floor(seconds);
          localStorage.setItem(CURRENT_TRACK_KEY, JSON.stringify(stored));
        }
      } catch { /* Storage may be unavailable. */ }
    };
    let advancing = false;
    const mapSearchItems = (items, categoryName = "Hrvatska glazba") => (Array.isArray(items) ? items : []).map((item) => {
      const snippet = item.snippet || item;
      const id = item.id?.videoId || item.youtubeId || item.videoId;
      if (!id) return null;
      return {
        id,
        title: clean(snippet.title || item.title, 160) || "Pjesma bez naslova",
        artist: clean(snippet.channelTitle || item.channelTitle || item.artist || "YouTube", 120),
        description: clean(snippet.description || item.description, 500),
        thumbnail: snippet.thumbnails?.high?.url || snippet.thumbnails?.medium?.url || `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
        category: categoryName,
        url: `https://www.youtube.com/watch?v=${id}`
      };
    }).filter(Boolean);
    const findFallbackTrack = async (current) => {
      const searches = [
        current?.artist && current.artist !== "YouTube" ? `${current.artist} hrvatske pjesme` : "",
        "hrvatske domoljubne pjesme klape hrvatska glazba"
      ].filter(Boolean);
      for (const term of searches) {
        try {
          const response = await fetch(`${ENDPOINT}${ENDPOINT.includes("?") ? "&" : "?"}q=${encodeURIComponent(term)}`);
          if (!response.ok) continue;
          const payload = await response.json();
          const candidates = mapSearchItems(payload.items || payload.results).filter(item => item.id !== current?.id);
          if (candidates.length) {
            const sameArtist = candidates.filter(item => normalize(item.artist) === normalize(current?.artist));
            const pool = sameArtist.length ? sameArtist : candidates;
            return { ...pool[Math.floor(Math.random() * pool.length)], queue: pool, queueIndex: 0, currentTime: 0 };
          }
        } catch { /* Try the next fallback search. */ }
      }
      return null;
    };
    const advanceNext = async () => {
      if (advancing || cancelled) return;
      advancing = true;
      try {
        const stored = JSON.parse(localStorage.getItem(CURRENT_TRACK_KEY) || "null") || active;
        if (stored?.id && stored.id !== active.id) return;
        const queue = Array.isArray(stored?.queue) ? stored.queue : [];
        const currentIndex = Number.isInteger(Number(stored?.queueIndex))
          ? Number(stored.queueIndex)
          : queue.findIndex(item => item?.id === stored?.id);
        if (currentIndex >= 0 && currentIndex + 1 < queue.length) {
          const nextIndex = currentIndex + 1;
          const nextTrack = { ...queue[nextIndex], queue, queueIndex: nextIndex, currentTime: 0 };
          localStorage.setItem(CURRENT_TRACK_KEY, JSON.stringify(nextTrack));
          setActive(nextTrack);
          setHistory(old => [nextTrack.id, ...old.filter(id => id !== nextTrack.id)].slice(0, 100));
          return;
        }
        const fallback = await findFallbackTrack(stored || active);
        if (fallback && !cancelled) {
          localStorage.setItem(CURRENT_TRACK_KEY, JSON.stringify(fallback));
          setActive(fallback);
          setHistory(old => [fallback.id, ...old.filter(id => id !== fallback.id)].slice(0, 100));
        }
      } catch { /* Ignore malformed queue data or unavailable search. */ }
      finally { advancing = false; }
    };
    const attachPlayer = () => {
      if (cancelled || !window.YT || !window.YT.Player || !playerIframeRef.current) return;
      try {
        player = new window.YT.Player(playerIframeRef.current, {
          events: {
            onReady: (event) => {
              playerRef.current = event.target;
              if (volumeRef.current === 0) event.target.mute?.();
              else { event.target.unMute?.(); event.target.setVolume?.(volumeRef.current); }
              const resumeAt = Math.max(0, Number(active.currentTime) || 0);
              if (resumeAt > 0) event.target.seekTo(resumeAt, true);
              event.target.playVideo();
              saveTimer = window.setInterval(() => {
                try { savePosition(event.target.getCurrentTime()); } catch { /* Ignore player teardown. */ }
              }, 1000);
            },
            onStateChange: (event) => {
              // YouTube's ENDED state is numeric 0; use the literal as a resilient fallback.
              if (event.data === (window.YT?.PlayerState?.ENDED ?? 0)) void advanceNext();
            }
          }
        });
      } catch (error) {
        console.warn("Hrvatski Val: spremanje vremena reprodukcije nije dostupno", error);
      }
    };
    const readyHandler = () => {
      if (typeof previousReady === "function") previousReady();
      attachPlayer();
    };
    if (window.YT && window.YT.Player) attachPlayer();
    else {
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
      if (playerRef.current === player) playerRef.current = null;
      if (window.onYouTubeIframeAPIReady === readyHandler) window.onYouTubeIframeAPIReady = previousReady;
    };
  }, [active?.id]);

  function changeVolume(value) {
    const nextVolume = Math.max(0, Math.min(100, Number(value) || 0));
    volumeRef.current = nextVolume;
    setVolume(nextVolume);
    try {
      if (nextVolume === 0) playerRef.current?.mute?.();
      else { playerRef.current?.unMute?.(); playerRef.current?.setVolume?.(nextVolume); }
    } catch { /* YouTube player may still be loading. */ }
  }

  useEffect(() => { localStorage.setItem(FAV_KEY, JSON.stringify(favorites)); }, [favorites]);
  useEffect(() => { localStorage.setItem(HISTORY_KEY, JSON.stringify(history)); }, [history]);

  useEffect(() => {
    if (!supabase) return;
    let alive = true;
    supabase.auth.getSession().then(({ data }) => { if (alive) setSession(data?.session || null); });
    const { data } = supabase.auth.onAuthStateChange((_event, next) => setSession(next || null));
    return () => { alive = false; data.subscription.unsubscribe(); };
  }, []);

  async function searchTracks(nextCategory = category, customQuery = query) {
    const cat = CATEGORIES.find(([name]) => name === nextCategory);
    const q = clean(customQuery, 180) || cat?.[1] || CATEGORIES[0][1];
    setLoading(true); setError(""); setMessage("");
    try {
      const response = await fetch(`${ENDPOINT}${ENDPOINT.includes("?") ? "&" : "?"}q=${encodeURIComponent(q)}`);
      let payload;
      try { payload = await response.json(); } catch { throw new Error(`Poslužitelj je vratio neispravan odgovor (${response.status}).`); }
      if (!response.ok) throw new Error(payload.error || `Pretraživanje nije uspjelo (${response.status}).`);
      const items = Array.isArray(payload.items) ? payload.items : Array.isArray(payload.results) ? payload.results : [];
      const mapped = items.map((item) => {
        const snippet = item.snippet || item;
        const id = item.id?.videoId || item.youtubeId || item.videoId;
        if (!id) return null;
        return { id, title: clean(snippet.title || item.title, 160) || "Pjesma bez naslova", artist: clean(snippet.channelTitle || item.channelTitle || item.artist || "YouTube", 120), description: clean(snippet.description || item.description, 500), thumbnail: snippet.thumbnails?.high?.url || snippet.thumbnails?.medium?.url || `https://i.ytimg.com/vi/${id}/hqdefault.jpg`, category: nextCategory === "Sve" ? "Hrvatska glazba" : nextCategory, url: `https://www.youtube.com/watch?v=${id}` };
      }).filter(Boolean);
      setTracks(mapped);
      if (!mapped.length) setMessage("Nema rezultata za ovu pretragu. Pokušaj drugu riječ ili kategoriju.");
    } catch (e) { setError(e.message || "Glazbu trenutačno nije moguće učitati."); }
    finally { setLoading(false); }
  }

  useEffect(() => { searchTracks("Sve", ""); }, []);

  useEffect(() => {
    if (!active || !supabase) { setLikes([]); setComments([]); return; }
    let cancelled = false;
    (async () => {
      const [likeRes, commentRes] = await Promise.all([
        supabase.from("music_track_likes").select("user_id").eq("track_id", active.id),
        supabase.from("music_track_comments").select("id, track_id, user_id, content, created_at").eq("track_id", active.id).order("created_at", { ascending: false }).limit(100)
      ]);
      if (cancelled) return;
      if (!likeRes.error) setLikes(likeRes.data || []);
      if (!commentRes.error) {
        const userIds = [...new Set((commentRes.data || []).map(comment => comment.user_id).filter(Boolean))];
        let profileById = {};
        if (userIds.length) {
          const { data: profiles } = await supabase.from("profiles").select("id, display_name").in("id", userIds);
          profileById = Object.fromEntries((profiles || []).map(profile => [profile.id, profile.display_name]));
        }
        if (cancelled) return;
        setComments((commentRes.data || []).map(comment => ({
          ...comment,
          profiles: { display_name: profileById[comment.user_id] || "Član PatriaSoula" }
        })));
      }
      if (likeRes.error || commentRes.error) {
        console.error("Hrvatski Val likes/comments:", likeRes.error || commentRes.error);
        setError("Lajkovi ili komentari trenutačno nisu dostupni. Pokušaj ponovno.");
      }
    })();
    return () => { cancelled = true; };
  }, [active?.id, session?.user?.id]);

  const visible = useMemo(() => {
    const q = normalize(query);
    return tracks.filter(t => (!q || normalize([t.title, t.artist, t.description, t.category].join(" ")).includes(q)) &&
      (view !== "favorites" || favorites.includes(t.id)) && (view !== "history" || history.includes(t.id)));
  }, [tracks, query, view, favorites, history]);

  function play(track) {
    const queue = tracks.length ? tracks : [track];
    const foundIndex = queue.findIndex(item => item.id === track.id);
    const queueIndex = foundIndex >= 0 ? foundIndex : 0;
    const preparedTrack = { ...track, queue, queueIndex, currentTime: 0 };
    setActive(preparedTrack);
    try { localStorage.setItem(CURRENT_TRACK_KEY, JSON.stringify(preparedTrack)); } catch { /* Storage may be unavailable. */ }
    setPlayerVisible(true); setMinimized(false);
    setHistory(old => [track.id, ...old.filter(id => id !== track.id)].slice(0, 100));
  }

  async function goToNextTrack(direction = 1) {
    const stored = (() => { try { return JSON.parse(localStorage.getItem(CURRENT_TRACK_KEY) || "null"); } catch { return null; } })();
    const queue = Array.isArray(stored?.queue) && stored.queue.length ? stored.queue : tracks;
    const currentIndex = Math.max(0, queue.findIndex(item => item?.id === active?.id));
    const targetIndex = currentIndex + direction;
    if (direction < 0 && targetIndex >= 0 && queue[targetIndex]) {
      playFromQueue(queue, targetIndex);
      return;
    }
    if (direction > 0 && targetIndex >= 0 && queue[targetIndex]) {
      playFromQueue(queue, targetIndex);
      return;
    }
    if (direction < 0) return;
    setMessage("Tražim sljedeću pjesmu…");
    const searches = [
      active?.artist && active.artist !== "YouTube" ? `${active.artist} hrvatske pjesme` : "",
      "hrvatske domoljubne pjesme klape hrvatska glazba"
    ].filter(Boolean);
    for (const term of searches) {
      try {
        const response = await fetch(`${ENDPOINT}${ENDPOINT.includes("?") ? "&" : "?"}q=${encodeURIComponent(term)}`);
        const payload = await response.json();
        if (!response.ok) continue;
        const items = (Array.isArray(payload.items) ? payload.items : Array.isArray(payload.results) ? payload.results : []).map(item => {
          const snippet = item.snippet || item;
          const id = item.id?.videoId || item.youtubeId || item.videoId;
          if (!id || id === active?.id) return null;
          return { id, title: clean(snippet.title || item.title, 160) || "Pjesma bez naslova", artist: clean(snippet.channelTitle || item.channelTitle || item.artist || "YouTube", 120), description: clean(snippet.description || item.description, 500), thumbnail: snippet.thumbnails?.high?.url || snippet.thumbnails?.medium?.url || `https://i.ytimg.com/vi/${id}/hqdefault.jpg`, category: "Hrvatska glazba", url: `https://www.youtube.com/watch?v=${id}` };
        }).filter(Boolean);
        if (!items.length) continue;
        const sameArtist = items.filter(item => normalize(item.artist) === normalize(active?.artist));
        const pool = sameArtist.length ? sameArtist : items;
        const chosenIndex = Math.floor(Math.random() * pool.length);
        const chosen = { ...pool[chosenIndex], queue: pool, queueIndex: chosenIndex, currentTime: 0 };
        play(chosen);
        setMessage("");
        return;
      } catch { /* Try general Croatian music search. */ }
    }
    setMessage("Nisam uspio pronaći sljedeću pjesmu. Pokušaj ponovno.");
  }

  function playFromQueue(queue, index) {
    const selected = queue[index];
    if (!selected?.id) return;
    const prepared = { ...selected, queue, queueIndex: index, currentTime: 0 };
    setActive(prepared);
    try { localStorage.setItem(CURRENT_TRACK_KEY, JSON.stringify(prepared)); } catch { /* Storage may be unavailable. */ }
    setPlayerVisible(true);
    setHistory(old => [prepared.id, ...old.filter(id => id !== prepared.id)].slice(0, 100));
  }
  function toggleFavorite(id) { setFavorites(old => old.includes(id) ? old.filter(x => x !== id) : [id, ...old]); }
  const likedByMe = likes.some(x => x.user_id === session?.user?.id);

  async function toggleLike() {
    if (!session?.user?.id || !supabase) { setError("Za lajkanje pjesama prijavi se u PatriaSoul."); return; }
    setError("");
    const result = likedByMe
      ? await supabase.from("music_track_likes").delete().eq("track_id", active.id).eq("user_id", session.user.id)
      : await supabase.from("music_track_likes").insert({ track_id: active.id, user_id: session.user.id });
    if (result.error) { setError("Lajk nije spremljen. Provjeri Supabase pravila pristupa."); return; }
    setLikes(old => likedByMe ? old.filter(x => x.user_id !== session.user.id) : [...old, { user_id: session.user.id }]);
  }

  async function submitComment(event) {
    event.preventDefault();
    const content = clean(commentText, 1200);
    if (!content || !session?.user?.id || !supabase || commentBusy) return;
    setCommentBusy(true); setError("");
    const { error: insertError } = await supabase.from("music_track_comments").insert({ track_id: active.id, user_id: session.user.id, content });
    if (insertError) setError("Komentar nije objavljen. Pokušaj ponovno.");
    else {
      setCommentText("");
      const { data, error: fetchError } = await supabase.from("music_track_comments").select("id, track_id, user_id, content, created_at, profiles(display_name)").eq("track_id", active.id).order("created_at", { ascending: false }).limit(100);
      if (!fetchError) setComments(data || []);
    }
    setCommentBusy(false);
  }

  return <main className="hv-app">
    <SiteChrome section="Mediji" links={[{"label":"Glazbena zbirka","href":"#hv-library"},{"label":"Trenutno svira","href":"#hv-library"},{"label":"PatriaSoul","href":"/"}]}/>
    

    <section className="hv-hero">
      <div className="hv-hero-copy"><span className="hv-eyebrow"><AudioLines size={15}/> HRVATSKA U SVAKOM TONU</span><h1>Glazba koja nosi <em>dušu Hrvatske.</em></h1><p>Domoljubne pjesme, klapska tradicija, zavičaj i glazba koja povezuje naraštaje.</p><button onClick={() => document.getElementById("hv-library")?.scrollIntoView({ behavior: "smooth", block: "start" })}><Play size={17} fill="currentColor"/> Istraži glazbu</button></div>
      <div className="hv-hero-art" aria-hidden="true"><div className="hv-wave"><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/></div><div className="hv-art-flag"><span/><span/><span/></div><div className="hv-art-copy"><small>GLAS NAŠE DOMOVINE</small><strong>HRVATSKI VAL PLAYER</strong><em>Hrvatska u svakom tonu.</em></div></div>
    </section>

    <section className="hv-content" id="hv-library">
      <div className="hv-section-title"><div><span className="hv-eyebrow">GLAZBENA ZBIRKA</span><h2>Pronađi svoju pjesmu</h2><p>Odaberi pjesmu i nastavi istraživati cijeli PatriaSoul bez prekida.</p></div><span className="hv-live"><Radio size={14}/> YouTube glazba</span></div>
      <label className="hv-search"><Search size={18}/><input value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => { if (e.key === "Enter") searchTracks(category, query); }} placeholder="Pretraži pjesmu, izvođača ili temu…"/><button onClick={() => searchTracks(category, query)} disabled={loading}>{loading ? "Tražim…" : "Pretraži"}</button></label>
      <div className="hv-categories">{CATEGORIES.map(([name]) => <button key={name} className={category === name ? "active" : ""} onClick={() => { setCategory(name); setView("all"); searchTracks(name, ""); }}>{name}</button>)}</div>
      <div className="hv-filters"><button className={view === "all" ? "active" : ""} onClick={() => setView("all")}><Music2 size={15}/> Sve pjesme</button><button className={view === "favorites" ? "active" : ""} onClick={() => setView("favorites")}><Heart size={15}/> Omiljeno ({favorites.length})</button><button className={view === "history" ? "active" : ""} onClick={() => setView("history")}><Clock3 size={15}/> Nedavno slušano</button></div>
      {error && <div className="hv-message error" role="status">{error}<button onClick={() => setError("")} aria-label="Zatvori"><X size={15}/></button></div>}
      {message && <div className="hv-message" role="status">{message}</div>}
      {loading && <div className="hv-empty"><AudioLines size={26}/><p>Tražim glazbu za Hrvatski Val Player…</p></div>}
      {!loading && visible.length > 0 && <div className="hv-track-grid">{visible.map(track => <article className="hv-track" key={track.id}>
        <button className="hv-cover" onClick={() => play(track)} aria-label={`Pusti ${track.title}`}><img src={track.thumbnail} alt="" loading="lazy" onError={e => { e.currentTarget.style.opacity = ".15"; }}/><span><Play size={23} fill="currentColor"/></span></button>
        <div className="hv-track-info"><small>{track.category}</small><button className="hv-track-title" onClick={() => play(track)}>{track.title}</button><p>{track.artist}</p><div className="hv-track-actions"><button className={favorites.includes(track.id) ? "selected" : ""} onClick={() => toggleFavorite(track.id)} aria-label="Omiljeno"><Heart size={16} fill={favorites.includes(track.id) ? "currentColor" : "none"}/> Spremi</button><button onClick={() => play(track)}><Play size={15}/> Pusti</button></div></div>
      </article>)}</div>}
      {!loading && !visible.length && <div className="hv-empty"><Music2 size={28}/><strong>{view === "favorites" ? "Još nema omiljenih pjesama" : view === "history" ? "Još nema povijesti slušanja" : "Nema pronađenih pjesama"}</strong><p>Odaberi kategoriju ili upiši pojam za pretraživanje.</p></div>}
      <p className="hv-source-note">Dostupnost reprodukcije ovisi o izvornom YouTube videozapisu i njegovim postavkama.</p>
    </section>

    

    {active && playerVisible && <aside className={`hv-dock ${minimized ? "minimized" : ""}`} aria-label="Glazbeni player">
      {!minimized && <div className="hv-dock-expanded"><div className="hv-now-playing"><img src={active.thumbnail} alt=""/><div><small>SADA SVIRA</small><strong>{active.title}</strong><span>{active.artist}</span></div></div><div className="hv-controls"><button onClick={() => { void goToNextTrack(-1); }} aria-label="Prethodna pjesma"><SkipBack size={18}/></button><button className="hv-main-play" onClick={() => setMinimized(true)} aria-label="Smanji player"><Pause size={19}/></button><button onClick={() => { void goToNextTrack(1); }} aria-label="Sljedeća pjesma"><SkipForward size={18}/></button></div><label className="hv-volume"><Volume2 size={16}/><input aria-label="Glasnoća" type="range" min="0" max="100" value={volume} onChange={e => changeVolume(e.target.value)}/></label><div className="hv-social-controls"><button className={likedByMe ? "selected" : ""} onClick={toggleLike} title="Lajkaj pjesmu"><Heart size={17} fill={likedByMe ? "currentColor" : "none"}/><span>{likes.length}</span></button><button onClick={() => setMinimized(false)} title="Komentari"><MessageCircle size={17}/><span>{comments.length}</span></button><button onClick={() => { setPlayerVisible(false); localStorage.removeItem(CURRENT_TRACK_KEY); }} title="Zatvori player"><X size={17}/></button></div><button className="hv-collapse" onClick={() => setMinimized(true)} aria-label="Smanji player"><ChevronDown size={17}/></button></div>}
      {minimized && <div className="hv-dock-mini"><button className="hv-mini-open" onClick={() => setMinimized(false)}><img src={active.thumbnail} alt=""/><span><strong>{active.title}</strong><small>{active.artist}</small></span><ChevronUp size={17}/></button><button onClick={() => setMinimized(false)} aria-label="Otvori player"><Play size={18}/></button><button onClick={() => setPlayerVisible(false)} aria-label="Zatvori player"><X size={17}/></button></div>}
      <div className="hv-player-embed"><iframe key={active.id} title={`Reprodukcija: ${active.title}`} src={`https://www.youtube-nocookie.com/embed/${active.id}?autoplay=1&playsinline=1&rel=0&enablejsapi=1`} ref={playerIframeRef} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen/></div>
      {!minimized && <section className="hv-comments"><div className="hv-comments-heading"><div><strong><MessageCircle size={17}/> Razgovor o pjesmi</strong><small>Lajkovi i komentari zajednice</small></div><button onClick={() => setMinimized(true)} aria-label="Smanji player"><ChevronDown size={17}/></button></div>
        {!session?.user?.id && <p className="hv-login-note">Za lajkanje i komentiranje prijavi se u PatriaSoul.</p>}
        {session?.user?.id && <form className="hv-comment-form" onSubmit={submitComment}><textarea value={commentText} onChange={e => setCommentText(e.target.value)} maxLength={1200} placeholder="Napiši komentar uz ovu pjesmu…" required/><button disabled={commentBusy || !commentText.trim()}>{commentBusy ? "Objavljujem…" : "Objavi komentar"}</button></form>}
        <div className="hv-comment-list">{comments.map(c => <article key={c.id}><div className="hv-avatar">{(c.profiles?.display_name || "Č").slice(0,1).toUpperCase()}</div><div><strong>{c.profiles?.display_name || "Član PatriaSoula"}</strong><small>{new Date(c.created_at).toLocaleString("hr-HR")}</small><p>{c.content}</p></div></article>)}{!comments.length && <p className="hv-login-note">Još nema komentara. Budi prvi koji će podijeliti dojam.</p>}</div>
      </section>}
    </aside>}
    {active && !playerVisible && <button className="hv-reopen-player" onClick={() => setPlayerVisible(true)}><Play size={16}/> Nastavi: {active.title}</button>}
  </main>;
}
