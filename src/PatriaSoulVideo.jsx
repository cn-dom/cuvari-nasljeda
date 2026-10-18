import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Bookmark, ChevronDown, Clock3, Film, Heart, History, Info, Play, Plus, Search, ShieldCheck, SlidersHorizontal, Trash2, Tv, X } from "lucide-react";
import { supabase } from "./lib/supabase";
import "./PatriaSoulVideo.css";

const STORAGE_KEY = "patriasoul-video-library-v1";
const YOUTUBE_SEARCH_ENDPOINT = import.meta.env.VITE_YOUTUBE_SEARCH_ENDPOINT || "/api/youtube-search";
const CATEGORIES = ["Sve", "Domovinski rat", "Vukovar", "Stradanja i žrtve", "Branitelji", "Dokumentarci", "Svjedočanstva", "Povijesni zapisi"];
const EMPTY_LIBRARY = [];

function readStoredArray(key) {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch { return []; }
}

function readLibrary() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    return Array.isArray(parsed) ? parsed : EMPTY_LIBRARY;
  } catch { return EMPTY_LIBRARY; }
}

function getYouTubeId(raw) {
  try {
    const url = new URL(raw.trim());
    if (["youtu.be"].includes(url.hostname.replace(/^www\./, ""))) return url.pathname.split("/").filter(Boolean)[0] || null;
    if (["youtube.com", "m.youtube.com", "www.youtube.com", "youtube-nocookie.com", "www.youtube-nocookie.com"].includes(url.hostname)) {
      if (url.pathname === "/watch") return url.searchParams.get("v");
      const match = url.pathname.match(/^\/(?:embed|shorts|live)\/([\w-]+)/);
      return match?.[1] || null;
    }
  } catch {}
  return null;
}

function safeText(value, max = 160) {
  return String(value || "").replace(/[<>]/g, "").trim().slice(0, max);
}

function formatDate(value) {
  if (!value) return "Datum nije naveden";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Datum nije naveden" : date.toLocaleDateString("hr-HR", { day: "numeric", month: "long", year: "numeric" });
}

function VideoCard({ video, onOpen, favorite, saved, onFavorite, onSave }) {
  return <article className="psv-video-card">
    <button className="psv-thumb" onClick={() => onOpen(video)} aria-label={`Pusti video: ${video.title}`}>
      <img src={`https://i.ytimg.com/vi/${video.youtubeId}/hqdefault.jpg`} alt="" loading="lazy" onError={(e) => { e.currentTarget.style.opacity = "0"; }} />
      <span className="psv-play"><Play size={22} fill="currentColor" /></span>
      <span className="psv-thumb-label"><Film size={13} /> YouTube video</span>
    </button>
    <div className="psv-card-copy">
      <div className="psv-card-category">{video.category}</div>
      <button className="psv-card-title" onClick={() => onOpen(video)}>{video.title}</button>
      <p>{video.description || "Opis ovog zapisa još nije dodan."}</p>
      <div className="psv-card-meta"><span>{video.source || "Izvor nije naveden"}</span><span>{formatDate(video.date)}</span></div>
      <div className="psv-card-actions">
        <button className={favorite ? "is-active" : ""} onClick={() => onFavorite(video.id)} aria-label={favorite ? "Ukloni iz omiljenih" : "Dodaj u omiljene"}><Heart size={16} fill={favorite ? "currentColor" : "none"} /> Omiljeno</button>
        <button className={saved ? "is-active" : ""} onClick={() => onSave(video.id)} aria-label={saved ? "Ukloni iz gledanja kasnije" : "Spremi za kasnije"}><Bookmark size={16} fill={saved ? "currentColor" : "none"} /> Kasnije</button>
      </div>
    </div>
  </article>;
}

export default function PatriaSoulVideo() {
  const [videos, setVideos] = useState(readLibrary);
  const [categoryResults, setCategoryResults] = useState([]);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [categoryError, setCategoryError] = useState("");
  const [activeVideo, setActiveVideo] = useState(null);
  const [session, setSession] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [commentsError, setCommentsError] = useState("");
  const [commentsNotice, setCommentsNotice] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Sve");
  const [view, setView] = useState("all");
  const [sort, setSort] = useState("newest");
  const [layout, setLayout] = useState("grid");
  const [addOpen, setAddOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const [discoveryQuery, setDiscoveryQuery] = useState("Domovinski rat Hrvatska dokumentarni film");
  const [discoveryResults, setDiscoveryResults] = useState([]);
  const [discoveryLoading, setDiscoveryLoading] = useState(false);
  const [discoveryError, setDiscoveryError] = useState("");
  const [favorites, setFavorites] = useState(() => readStoredArray("patriasoul-video-favorites-v1"));
  const [saved, setSaved] = useState(() => readStoredArray("patriasoul-video-saved-v1"));
  const [history, setHistory] = useState(() => readStoredArray("patriasoul-video-history-v1"));
  const librarySearchRef = useRef(null);
  const [form, setForm] = useState({ url: "", title: "", category: "Domovinski rat", description: "", source: "", date: "" });

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(videos)); }, [videos]);
  useEffect(() => { localStorage.setItem("patriasoul-video-favorites-v1", JSON.stringify(favorites)); }, [favorites]);
  useEffect(() => { localStorage.setItem("patriasoul-video-saved-v1", JSON.stringify(saved)); }, [saved]);
  useEffect(() => { localStorage.setItem("patriasoul-video-history-v1", JSON.stringify(history)); }, [history]);

  useEffect(() => {
    if (!supabase) return undefined;
    let alive = true;
    supabase.auth.getSession().then(({ data, error }) => {
      if (alive && !error) setSession(data?.session ?? null);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession ?? null);
    });
    return () => {
      alive = false;
      data.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!activeVideo?.youtubeId) {
      setComments([]);
      setCommentsError("");
      setCommentsNotice("");
      setCommentText("");
      return undefined;
    }
    let cancelled = false;
    async function loadComments() {
      setCommentsLoading(true);
      setCommentsError("");
      try {
        if (!supabase || !session?.user?.id) {
          if (!cancelled) setComments([]);
          return;
        }
        const { data, error } = await supabase
          .from("video_archive_comments")
          .select("id, video_id, user_id, content, created_at, profiles(display_name)")
          .eq("video_id", activeVideo.youtubeId)
          .order("created_at", { ascending: true })
          .limit(100);
        if (error) throw error;
        if (!cancelled) setComments(data || []);
      } catch {
        if (!cancelled) setCommentsError("Komentare trenutačno nije moguće učitati. Provjeri je li nova tablica primijenjena u Supabaseu.");
      } finally {
        if (!cancelled) setCommentsLoading(false);
      }
    }
    loadComments();
    return () => { cancelled = true; };
  }, [activeVideo?.youtubeId, session?.user?.id]);

  async function submitVideoComment(event) {
    event.preventDefault();
    const content = commentText.trim();
    if (!content || !session?.user?.id || !supabase || commentSubmitting) return;
    setCommentSubmitting(true);
    setCommentsError("");
    setCommentsNotice("");
    try {
      const { error } = await supabase.from("video_archive_comments").insert({
        video_id: activeVideo.youtubeId,
        user_id: session.user.id,
        content,
      });
      if (error) throw error;
      setCommentText("");
      setCommentsNotice("Komentar je objavljen.");
      const { data, error: loadError } = await supabase
        .from("video_archive_comments")
        .select("id, video_id, user_id, content, created_at, profiles(display_name)")
        .eq("video_id", activeVideo.youtubeId)
        .order("created_at", { ascending: true })
        .limit(100);
      if (loadError) throw loadError;
      setComments(data || []);
    } catch {
      setCommentsError("Komentar nije spremljen. Provjeri vezu i je li tablica komentara aktivirana u Supabaseu.");
    } finally {
      setCommentSubmitting(false);
    }
  }

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        if (addOpen) setAddOpen(false);
        else if (activeVideo) setActiveVideo(null);
      }
      if (event.key === "/" && !addOpen && !activeVideo && !["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement?.tagName)) {
        event.preventDefault();
        librarySearchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [addOpen, activeVideo]);

  useEffect(() => {
    const modalOpen = Boolean(addOpen || activeVideo);
    document.body.classList.toggle("psv-modal-open", modalOpen);
    return () => document.body.classList.remove("psv-modal-open");
  }, [addOpen, activeVideo]);

  const visibleVideos = useMemo(() => {
    const query = search.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("hr");
    const combined = [...videos, ...categoryResults.filter((result) => !videos.some((video) => video.youtubeId === result.youtubeId))];
    return combined.filter((video) => {
      const text = [video.title, video.description, video.category, video.source].join(" ").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("hr");
      return (!query || text.includes(query))
        && (category === "Sve" || video.category === category)
        && (view === "all" || (view === "favorites" && favorites.includes(video.id)) || (view === "saved" && saved.includes(video.id)) || (view === "history" && history.includes(video.id)));
    }).sort((a, b) => sort === "oldest" ? String(a.date).localeCompare(String(b.date)) : sort === "title" ? a.title.localeCompare(b.title, "hr") : String(b.addedAt).localeCompare(String(a.addedAt)));
  }, [videos, categoryResults, search, category, view, sort, favorites, saved, history]);

  function toggle(setter, values, id) { setter(values.includes(id) ? values.filter((item) => item !== id) : [id, ...values]); }
  function openVideo(video) {
    setActiveVideo(video);
    setHistory((items) => [video.id, ...items.filter((id) => id !== video.id)].slice(0, 50));
  }
  function addVideo(event) {
    event.preventDefault();
    const youtubeId = getYouTubeId(form.url);
    if (!youtubeId) { setNotice("Unesi valjanu YouTube poveznicu (youtube.com ili youtu.be)."); return; }
    if (videos.some((item) => item.youtubeId === youtubeId)) { setNotice("Ovaj video već postoji u tvojoj biblioteci."); return; }
    const video = {
      id: `video-${Date.now()}`, youtubeId, url: `https://www.youtube.com/watch?v=${youtubeId}`,
      title: safeText(form.title, 120) || "Video bez naslova",
      category: CATEGORIES.includes(form.category) && form.category !== "Sve" ? form.category : "Dokumentarci",
      description: safeText(form.description, 3000), source: safeText(form.source, 120),
      date: form.date || "", addedAt: new Date().toISOString()
    };
    setVideos((items) => [video, ...items]);
    setForm({ url: "", title: "", category: "Domovinski rat", description: "", source: "", date: "" });
    setAddOpen(false); setNotice("Video je dodan u ovu lokalnu biblioteku.");
  }
  async function loadCategoryVideos(nextCategory) {
    const queries = {
      "Sve": "Domovinski rat Hrvatska dokumentarni svjedočanstva",
      "Domovinski rat": "Domovinski rat Hrvatska dokumentarni film svjedočanstva",
      "Vukovar": "Vukovar 1991 Domovinski rat svjedočanstva",
      "Stradanja i žrtve": "Domovinski rat hrvatske žrtve stradanja dokumentarni",
      "Branitelji": "hrvatski branitelji Domovinski rat svjedočanstva",
      "Dokumentarci": "Domovinski rat Hrvatska dokumentarni film",
      "Svjedočanstva": "svjedočanstva hrvatskih branitelja Domovinski rat",
      "Povijesni zapisi": "Domovinski rat Hrvatska arhivski snimci povijesni zapisi",
    };
    const query = queries[nextCategory] || queries.Sve;
    setCategoryLoading(true);
    setCategoryError("");
    try {
      const response = await fetch(`${YOUTUBE_SEARCH_ENDPOINT}${YOUTUBE_SEARCH_ENDPOINT.includes("?") ? "&" : "?"}q=${encodeURIComponent(query)}`);
      let payload;
      try {
        payload = await response.json();
      } catch {
        throw new Error(`Poslužitelj je vratio neispravan odgovor (${response.status}).`);
      }
      if (!response.ok) {
        throw new Error(payload.error || `YouTube pretraga nije uspjela (${response.status}).`);
      }
      const items = Array.isArray(payload.items) ? payload.items : Array.isArray(payload.results) ? payload.results : [];
      const results = items.map((item) => {
        const snippet = item.snippet || item;
        const youtubeId = item.id?.videoId || item.youtubeId || item.videoId;
        if (!youtubeId) return null;
        return {
          id: `video-${youtubeId}`,
          youtubeId,
          url: `https://www.youtube.com/watch?v=${youtubeId}`,
          title: safeText(snippet.title || item.title, 120) || "Video bez naslova",
          description: safeText(snippet.description || item.description, 3000),
          source: safeText(snippet.channelTitle || item.channelTitle || item.source, 120) || "YouTube",
          date: (snippet.publishedAt || item.publishedAt || "").slice(0, 10),
          addedAt: snippet.publishedAt || item.publishedAt || new Date().toISOString(),
          category: nextCategory === "Sve" ? "Domovinski rat" : nextCategory,
        };
      }).filter(Boolean);
      setCategoryResults(results.filter((item) => !videos.some((video) => video.youtubeId === item.youtubeId)));
      if (!results.length) setCategoryError("YouTube nije pronašao videozapise za ovu kategoriju. Pokušaj ponovno.");
    } catch (error) {
      setCategoryResults([]);
      setCategoryError(error.message || "Videozapise za ovu kategoriju trenutačno nije moguće učitati.");
    } finally {
      setCategoryLoading(false);
    }
  }

  async function discoverVideos(event) {
    event?.preventDefault();
    const query = safeText(discoveryQuery, 180);
    if (!query) { setDiscoveryError("Upiši temu koju želiš pronaći."); return; }
    if (!YOUTUBE_SEARCH_ENDPOINT) {
      setDiscoveryError("Pretraživanje nije konfigurirano. Potrebno je postaviti YOUTUBE_API_KEY kao tajnu na Cloudflareu.");
      setDiscoveryResults([]);
      return;
    }
    setDiscoveryLoading(true); setDiscoveryError("");
    try {
      const response = await fetch(`${YOUTUBE_SEARCH_ENDPOINT}${YOUTUBE_SEARCH_ENDPOINT.includes("?") ? "&" : "?"}q=${encodeURIComponent(query)}`);
      let payload;
      try {
        payload = await response.json();
      } catch {
        throw new Error(`Poslužitelj je vratio neispravan odgovor (${response.status}). Provjeri objavu Cloudflare Workera.`);
      }
      if (!response.ok) {
        const detail = [payload.error, payload.reason, payload.detail].filter(Boolean).join(" — ");
        throw new Error(detail || `Pretraživanje nije uspjelo (${response.status}).`);
      }
      const items = Array.isArray(payload.items) ? payload.items : Array.isArray(payload.results) ? payload.results : [];
      setDiscoveryResults(items.map((item) => {
        const snippet = item.snippet || item;
        const youtubeId = item.id?.videoId || item.youtubeId || item.videoId;
        if (!youtubeId) return null;
        return { youtubeId, url: `https://www.youtube.com/watch?v=${youtubeId}`, title: safeText(snippet.title || item.title, 120), description: safeText(snippet.description || item.description, 3000), source: safeText(snippet.channelTitle || item.channelTitle || item.source, 120), date: (snippet.publishedAt || item.publishedAt || "").slice(0, 10), thumbnail: snippet.thumbnails?.high?.url || snippet.thumbnails?.medium?.url || "" };
      }).filter(Boolean).filter((item) => !videos.some((video) => video.youtubeId === item.youtubeId)));
      if (!items.length) setDiscoveryError("Nema rezultata za ovu pretragu. Pokušaj s drugom temom.");
    } catch (error) {
      setDiscoveryError(error.message || "Pretraživanje trenutačno nije dostupno.");
    } finally { setDiscoveryLoading(false); }
  }
  useEffect(() => { loadCategoryVideos("Sve"); }, []);

  function addDiscoveredVideo(candidate) {
    if (videos.some((item) => item.youtubeId === candidate.youtubeId)) { setNotice("Ovaj video već postoji u tvojoj biblioteci."); return; }
    const video = { id: `video-${Date.now()}-${candidate.youtubeId}`, youtubeId: candidate.youtubeId, url: candidate.url, title: candidate.title || "Video bez naslova", category: "Domovinski rat", description: candidate.description || "", source: candidate.source || "", date: candidate.date || "", addedAt: new Date().toISOString() };
    setVideos((items) => [video, ...items]);
    setDiscoveryResults((items) => items.filter((item) => item.youtubeId !== candidate.youtubeId));
    setNotice("Video je dodan u tvoju lokalnu biblioteku. Provjeri izvor i povijesni kontekst prije dijeljenja.");
  }

  function addAllDiscoveredVideos() {
    const existingIds = new Set(videos.map((video) => video.youtubeId));
    const candidates = discoveryResults.filter((item) => item.youtubeId && !existingIds.has(item.youtubeId));
    if (!candidates.length) {
      setNotice("Nema novih rezultata za dodavanje.");
      return;
    }
    const addedAt = new Date().toISOString();
    const imported = candidates.map((candidate) => ({
      id: `video-${Date.now()}-${candidate.youtubeId}`,
      youtubeId: candidate.youtubeId,
      url: candidate.url,
      title: candidate.title || "Video bez naslova",
      category: "Domovinski rat",
      description: candidate.description || "",
      source: candidate.source || "YouTube",
      date: candidate.date || "",
      addedAt,
    }));
    setVideos((items) => [...imported, ...items]);
    setDiscoveryResults([]);
    setNotice(`Dodano ${imported.length} videozapisa u tvoju lokalnu biblioteku. Pregledaj naslove i kategorije prije korištenja.`);
  }

  function removeVideo(id) {
    setVideos((items) => items.filter((item) => item.id !== id));
    setFavorites((items) => items.filter((item) => item !== id));
    setSaved((items) => items.filter((item) => item !== id));
    setHistory((items) => items.filter((item) => item !== id));
    if (activeVideo?.id === id) setActiveVideo(null);
  }

  const recommendedVideos = useMemo(() => {
    if (!activeVideo) return [];
    return videos
      .filter((video) => video.id !== activeVideo.id)
      .sort((a, b) => {
        const aSame = a.category === activeVideo.category ? 1 : 0;
        const bSame = b.category === activeVideo.category ? 1 : 0;
        if (aSame !== bSame) return bSame - aSame;
        return String(b.addedAt || "").localeCompare(String(a.addedAt || ""));
      })
      .slice(0, 8);
  }, [videos, activeVideo]);

  const currentTitle = ({all:"Svi videozapisi", favorites:"Omiljeni videozapisi", saved:"Popis za kasnije", history:"Nedavno gledano"})[view];

  return <main className="psv-app">
    <header className="psv-topbar">
      <a href="/" className="psv-brand"><img src="/assets/images/1000000982.png" alt="PatriaSoul" /><span><strong>PatriaSoul</strong><small>VIDEO ARHIVA SJEĆANJA</small></span></a>
      <div className="psv-top-actions">
        <a className="psv-back-link" href="/"><ArrowLeft size={16} /> Zajednica</a>
        <button className="psv-add-button" onClick={() => setAddOpen(true)}><Plus size={17} /> Dodaj video</button>
      </div>
    </header>

    <section className="psv-hero">
      <div className="psv-hero-copy">
        <div className="psv-eyebrow"><span /> ČUVAMO SJEĆANJE · ČINJENICE · SVJEDOČANSTVA</div>
        <h1>Priče koje <em>ne smiju nestati.</em></h1>
        <p>Videoarhiva Domovinskog rata, hrvatskih branitelja, žrtava i mjesta stradanja. Svaki zapis zaslužuje izvor, kontekst i dostojanstvo.</p>
        <div className="psv-hero-actions"><button onClick={() => { setView("all"); setCategory("Sve"); document.getElementById("psv-library")?.scrollIntoView({ behavior: "smooth" }); }}><Play size={16} fill="currentColor" /> Istraži arhivu</button><button className="psv-secondary-button" onClick={() => setAddOpen(true)}><Plus size={16} /> Dodaj zapis</button></div>
      </div>
      <div className="psv-hero-art" role="img" aria-label="Vukovarski vodotoranj kao simbol sjećanja na Domovinski rat"><div className="psv-art-caption"><span>DOMOVINSKI RAT</span><strong>Sjećanje je odgovornost.</strong></div></div>
    </section>

    <section className="psv-stat-row" aria-label="Pregled biblioteke">
      <div><Film /><span><strong>{videos.length}</strong><small>zapisa u biblioteci</small></span></div>
      <div><Heart /><span><strong>{favorites.length}</strong><small>omiljenih</small></span></div>
      <div><Bookmark /><span><strong>{saved.length}</strong><small>za pogledati</small></span></div>
      <div><History /><span><strong>{history.length}</strong><small>nedavno gledanih</small></span></div>
    </section>

    <section className="psv-discovery" aria-labelledby="psv-discovery-title">
      <div className="psv-discovery-heading"><div><span className="psv-eyebrow">PRONAĐI NOVE ZAPISE</span><h2 id="psv-discovery-title">Istraži YouTube</h2><p>Pronađi javne videozapise, pregledaj rezultate i ručno odaberi što želiš dodati u svoju arhivu. Rezultati se ne objavljuju automatski.</p></div><span className="psv-discovery-badge"><ShieldCheck size={15} /> Odabir prije dodavanja</span></div>
      <form className="psv-discovery-form" onSubmit={discoverVideos}><label className="psv-search"><Search size={18} /><input value={discoveryQuery} onChange={(e) => setDiscoveryQuery(e.target.value)} placeholder="Npr. Vukovar svjedočanstva branitelja" /><button type="submit" disabled={discoveryLoading}>{discoveryLoading ? "Tražim…" : "Pretraži"}</button></label></form>
      {discoveryError && <p className="psv-discovery-message" role="status"><Info size={16} />{discoveryError}</p>}
      {discoveryResults.length > 0 && <><div className="psv-discovery-bulk"><span>Pronađeno {discoveryResults.length} novih videozapisa</span><button type="button" onClick={addAllDiscoveredVideos}><Plus size={15} /> Dodaj sve rezultate</button></div><div className="psv-discovery-results">{discoveryResults.map((item) => <article className="psv-discovery-result" key={item.youtubeId}><img src={item.thumbnail || `https://i.ytimg.com/vi/${item.youtubeId}/mqdefault.jpg`} alt="" loading="lazy" /><div><strong>{item.title}</strong><span>{item.source || "YouTube"}{item.date ? ` · ${formatDate(item.date)}` : ""}</span><p>{item.description || "Opis nije dostupan."}</p><div className="psv-discovery-actions"><a href={item.url} target="_blank" rel="noreferrer">Provjeri izvor ↗</a><button type="button" onClick={() => addDiscoveredVideo(item)}><Plus size={15} /> Dodaj u arhivu</button></div></div></article>)}</div></>}
    </section>

    <section className="psv-library" id="psv-library">
      <div className="psv-section-heading"><div><span className="psv-eyebrow">DIGITALNA ZBIRKA</span><h2>{currentTitle}</h2><p>Pretraži, razvrstaj i otvori video bez napuštanja PatriaSoul sučelja.</p></div><div className="psv-layout-switch"><button className={layout === "grid" ? "selected" : ""} onClick={() => setLayout("grid")}>Kartice</button><button className={layout === "list" ? "selected" : ""} onClick={() => setLayout("list")}>Popis</button></div></div>

      <div className="psv-toolbar">
        <label className="psv-search"><Search size={18} /><input ref={librarySearchRef} value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Pretraži naslove, mjesta, svjedoke…" aria-label="Pretraži videoarhivu" /><kbd aria-hidden="true">/</kbd></label>
        <label className="psv-sort"><SlidersHorizontal size={16} /><span>Sortiraj</span><select value={sort} onChange={(e) => setSort(e.target.value)}><option value="newest">Najnovije dodano</option><option value="oldest">Najstariji datum</option><option value="title">Naslov A–Ž</option></select><ChevronDown size={14} /></label>
      </div>

      <div className="psv-category-row" aria-label="Kategorije">{CATEGORIES.map((item) => <button key={item} className={category === item ? "selected" : ""} onClick={() => { setView("all"); setCategory(item); loadCategoryVideos(item); }}>{item}</button>)}</div>
      <div className="psv-quick-filters">
        <button className={view === "all" ? "selected" : ""} onClick={() => setView("all")}><Tv size={15} /> Sve</button>
        <button className={view === "favorites" ? "selected" : ""} onClick={() => setView("favorites")}><Heart size={15} /> Omiljeno</button>
        <button className={view === "saved" ? "selected" : ""} onClick={() => setView("saved")}><Bookmark size={15} /> Za kasnije</button>
        <button className={view === "history" ? "selected" : ""} onClick={() => setView("history")}><Clock3 size={15} /> Povijest gledanja</button>
      </div>

      {notice && <div className="psv-notice" role="status"><Info size={17} /><span>{notice}</span><button onClick={() => setNotice("")} aria-label="Zatvori obavijest"><X size={16} /></button></div>}

      {categoryLoading && view === "all" && <p className="psv-discovery-message" role="status"><Info size={16} /> Učitavam videozapise za kategoriju „{category}”…</p>}
      {categoryError && view === "all" && <p className="psv-discovery-message" role="status"><Info size={16} /> {categoryError}</p>}
      {visibleVideos.length ? <div className={`psv-video-grid ${layout === "list" ? "list-layout" : ""}`}>{visibleVideos.map((video) => <VideoCard key={video.id} video={video} onOpen={openVideo} favorite={favorites.includes(video.id)} saved={saved.includes(video.id)} onFavorite={(id) => toggle(setFavorites, favorites, id)} onSave={(id) => toggle(setSaved, saved, id)} />)}</div> : categoryLoading && view === "all" ? null : <div className="psv-empty-state"><div className="psv-empty-icon"><Film size={30} /></div><span className="psv-eyebrow">ARHIVA SE GRADI</span><h3>{videos.length ? "Nema rezultata za odabrani prikaz" : "Prvi zapis počinje ovdje"}</h3><p>{videos.length ? "Promijeni pojam pretrage ili kategoriju." : "Dodaj provjerenu YouTube poveznicu na dokumentarac, svjedočanstvo ili povijesni zapis. Naslov, izvor i kontekst ostaju uz video."}</p><button className="psv-add-button" onClick={() => setAddOpen(true)}><Plus size={17} /> Dodaj prvi video</button></div>}
    </section>

    <footer className="psv-footer"><div className="psv-footer-mark">✦</div><div><strong>PatriaSoul · Čuvari nasljeđa</strong><p>Čuvati sjećanje znači čuvati dostojanstvo i istinu.</p></div><span className="psv-footer-note"><ShieldCheck size={15} /> Izvor i kontekst uz svaki zapis</span></footer>

    {activeVideo && <div className="psv-player-overlay" role="dialog" aria-modal="true" aria-label={activeVideo.title}>
      <div className="psv-player-shell"><div className="psv-player-head"><div className="psv-player-heading-copy"><span className="psv-eyebrow">{activeVideo.category}</span><h2>{activeVideo.title}</h2></div><div className="psv-player-head-actions"><button className="psv-player-back" onClick={() => { setActiveVideo(null); document.getElementById("psv-library")?.scrollIntoView({ behavior: "smooth" }); }}><ArrowLeft size={16} /> Natrag na arhivu</button><button className="psv-player-close" onClick={() => setActiveVideo(null)} aria-label="Zatvori player"><X size={19} /><span>Zatvori</span></button></div></div>
        <div className="psv-player-frame"><iframe src={`https://www.youtube-nocookie.com/embed/${activeVideo.youtubeId}?autoplay=1&controls=1&rel=0&modestbranding=1`} title={activeVideo.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen /></div>
        <div className="psv-player-details"><div><span>IZVOR</span><strong>{activeVideo.source || "YouTube · izvor nije dodat"}</strong><p className="psv-full-description">{activeVideo.description || "Opis i povijesni kontekst nisu uneseni."}</p><small className="psv-player-control-hint">Za glasnoću, isključenje zvuka i pauzu koristi kontrole unutar videozapisa.</small>{activeVideo.date && <small>Datum događaja/zapisa: {formatDate(activeVideo.date)}</small>}</div><div className="psv-player-buttons"><button className={favorites.includes(activeVideo.id) ? "is-active" : ""} onClick={() => toggle(setFavorites, favorites, activeVideo.id)}><Heart size={16} /> Omiljeno</button><button className={saved.includes(activeVideo.id) ? "is-active" : ""} onClick={() => toggle(setSaved, saved, activeVideo.id)}><Bookmark size={16} /> Kasnije</button><a href={activeVideo.url} target="_blank" rel="noreferrer">Otvori na YouTubeu ↗</a><button className="psv-delete-button" onClick={() => removeVideo(activeVideo.id)}><Trash2 size={15} /> Ukloni iz moje biblioteke</button></div></div>
        <section className="psv-comments" aria-labelledby="psv-comments-title">
          <div className="psv-comments-heading">
            <div><span className="psv-eyebrow">RAZGOVOR ZAJEDNICE</span><h3 id="psv-comments-title">Komentari na video</h3><p>Podijeli sjećanje, kontekst ili pitanje uz poštovanje prema temi i drugim članovima.</p></div>
            {session?.user && <span className="psv-comments-count">{comments.length} {comments.length === 1 ? "komentar" : "komentara"}</span>}
          </div>
          {!session?.user ? <div className="psv-comments-signin"><Info size={18} /><div><strong>Prijavi se za sudjelovanje</strong><p>Komentari su dostupni prijavljenim članovima PatriaSoula.</p><a href="/#prijava">Prijava / registracija ↗</a></div></div> : <>
            <form className="psv-comment-form" onSubmit={submitVideoComment}>
              <label htmlFor="psv-comment-text">Napiši komentar</label>
              <textarea id="psv-comment-text" maxLength={1500} rows={3} value={commentText} onChange={(event) => setCommentText(event.target.value)} placeholder="Napiši komentar uz poštovanje, činjenice i izvor gdje je potrebno…" required />
              <div className="psv-comment-form-footer"><small>{commentText.length}/1500 znakova</small><button type="submit" disabled={commentSubmitting || !commentText.trim()}>{commentSubmitting ? "Objavljujem…" : "Objavi komentar"}</button></div>
            </form>
            {commentsNotice && <p className="psv-comments-status" role="status">{commentsNotice}</p>}
            {commentsError && <p className="psv-comments-error" role="alert">{commentsError}</p>}
            {commentsLoading ? <p className="psv-comments-empty">Učitavam komentare…</p> : comments.length ? <div className="psv-comment-list">{comments.map((comment) => <article className="psv-comment" key={comment.id}><div className="psv-comment-avatar">{(comment.profiles?.display_name || "Č").trim().charAt(0).toLocaleUpperCase("hr")}</div><div className="psv-comment-content"><div className="psv-comment-meta"><strong>{comment.profiles?.display_name?.trim() || "Čuvar nasljeđa"}</strong><time dateTime={comment.created_at}>{new Date(comment.created_at).toLocaleString("hr-HR", { dateStyle: "medium", timeStyle: "short" })}</time></div><p>{comment.content}</p></div></article>)}</div> : <p className="psv-comments-empty">Još nema komentara. Budi prvi koji će podijeliti svoje mišljenje ili dodatni povijesni kontekst.</p>}
          </>}
        </section>
        <aside className="psv-player-sidebar" aria-label="Sljedeći i preporučeni videozapisi">
          <div className="psv-sidebar-heading"><span className="psv-eyebrow">NASTAVI GLEDATI</span><h3>Sljedeći video</h3><p>Preporuke iz tvoje arhive, prvo iz iste kategorije.</p></div>
          {recommendedVideos.length > 0 ? <>
            <button className="psv-next-feature" onClick={() => openVideo(recommendedVideos[0])}>
              <span className="psv-mini-thumb"><img src={`https://i.ytimg.com/vi/${recommendedVideos[0].youtubeId}/mqdefault.jpg`} alt="" loading="lazy" /><span><Play size={16} fill="currentColor" /></span></span>
              <span className="psv-next-copy"><small>SLJEDEĆI ZA GLEDANJE</small><strong>{recommendedVideos[0].title}</strong><em>{recommendedVideos[0].category}</em></span>
            </button>
            <div className="psv-recommend-list">{recommendedVideos.slice(1).map((video) => <button className="psv-recommend-item" key={video.id} onClick={() => openVideo(video)}>
              <span className="psv-mini-thumb"><img src={`https://i.ytimg.com/vi/${video.youtubeId}/mqdefault.jpg`} alt="" loading="lazy" /><span><Play size={13} fill="currentColor" /></span></span>
              <span><strong>{video.title}</strong><small>{video.category}</small></span>
            </button>)}</div>
          </> : <div className="psv-sidebar-empty"><Film size={24} /><strong>Još nema preporuka</strong><p>Dodaj još videozapisa u arhivu i ovdje će se pojaviti sljedeći prijedlozi.</p></div>}
        </aside>
        <p className="psv-embed-note">Video se reproducira putem ugrađenog YouTube playera. Neki autori ne dopuštaju ugrađivanje; takav video možda se neće moći reproducirati ovdje.</p>
      </div>
    </div>}

    {addOpen && <div className="psv-modal-backdrop" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) setAddOpen(false); }}><section className="psv-add-modal" role="dialog" aria-modal="true" aria-labelledby="psv-add-title"><div className="psv-modal-heading"><div><span className="psv-eyebrow">DOPUNI ZBIRKU</span><h2 id="psv-add-title">Dodaj video zapis</h2><p>Dodaj samo sadržaj koji je relevantan i za koji postoji dopuštenje za ugrađivanje ili povezivanje.</p></div><button className="psv-icon-button" onClick={() => setAddOpen(false)} aria-label="Zatvori"><X /></button></div>
      <form className="psv-add-form" onSubmit={addVideo}><label>YouTube poveznica *<input autoFocus type="url" required placeholder="https://www.youtube.com/watch?v=…" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} /></label><label>Naslov zapisa *<input required maxLength={120} placeholder="Npr. naslov dokumentarnog filma" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></label><label>Kategorija<select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>{CATEGORIES.filter((item) => item !== "Sve").map((item) => <option key={item}>{item}</option>)}</select></label><label>Izvor / autor<input maxLength={120} placeholder="Produkcija, ustanova, autor…" value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} /></label><label>Datum događaja ili zapisa<input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></label><label>Opis i povijesni kontekst<textarea maxLength={3000} rows={6} placeholder="Što gledatelj treba znati? Navedi provjerljive podatke." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label><div className="psv-form-note"><ShieldCheck size={17} /><span>Navedi izvor i provjeri naslov, opis i kontekst. Ova prva verzija sprema zapise samo u ovom pregledniku.</span></div><div className="psv-modal-actions"><button type="button" className="psv-cancel-button" onClick={() => setAddOpen(false)}>Odustani</button><button type="submit" className="psv-add-button"><Plus size={16} /> Spremi zapis</button></div></form>
    </section></div>}
  </main>;
}
