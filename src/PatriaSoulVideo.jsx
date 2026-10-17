import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Bookmark, ChevronDown, Clock3, Film, Heart, History, Info, Play, Plus, Search, ShieldCheck, SlidersHorizontal, Trash2, Tv, X } from "lucide-react";
import "./PatriaSoulVideo.css";

const STORAGE_KEY = "patriasoul-video-library-v1";
const CATEGORIES = ["Sve", "Domovinski rat", "Vukovar", "Stradanja i žrtve", "Branitelji", "Dokumentarci", "Svjedočanstva", "Povijesni zapisi"];
const EMPTY_LIBRARY = [];

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
  const [activeVideo, setActiveVideo] = useState(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Sve");
  const [view, setView] = useState("all");
  const [sort, setSort] = useState("newest");
  const [layout, setLayout] = useState("grid");
  const [addOpen, setAddOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const [favorites, setFavorites] = useState(() => JSON.parse(localStorage.getItem("patriasoul-video-favorites-v1") || "[]"));
  const [saved, setSaved] = useState(() => JSON.parse(localStorage.getItem("patriasoul-video-saved-v1") || "[]"));
  const [history, setHistory] = useState(() => JSON.parse(localStorage.getItem("patriasoul-video-history-v1") || "[]"));
  const [form, setForm] = useState({ url: "", title: "", category: "Domovinski rat", description: "", source: "", date: "" });

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(videos)); }, [videos]);
  useEffect(() => { localStorage.setItem("patriasoul-video-favorites-v1", JSON.stringify(favorites)); }, [favorites]);
  useEffect(() => { localStorage.setItem("patriasoul-video-saved-v1", JSON.stringify(saved)); }, [saved]);
  useEffect(() => { localStorage.setItem("patriasoul-video-history-v1", JSON.stringify(history)); }, [history]);

  const visibleVideos = useMemo(() => {
    const query = search.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("hr");
    return videos.filter((video) => {
      const text = [video.title, video.description, video.category, video.source].join(" ").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("hr");
      return (!query || text.includes(query))
        && (category === "Sve" || video.category === category)
        && (view === "all" || (view === "favorites" && favorites.includes(video.id)) || (view === "saved" && saved.includes(video.id)) || (view === "history" && history.includes(video.id)));
    }).sort((a, b) => sort === "oldest" ? String(a.date).localeCompare(String(b.date)) : sort === "title" ? a.title.localeCompare(b.title, "hr") : String(b.addedAt).localeCompare(String(a.addedAt)));
  }, [videos, search, category, view, sort, favorites, saved, history]);

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
      description: safeText(form.description, 500), source: safeText(form.source, 120),
      date: form.date || "", addedAt: new Date().toISOString()
    };
    setVideos((items) => [video, ...items]);
    setForm({ url: "", title: "", category: "Domovinski rat", description: "", source: "", date: "" });
    setAddOpen(false); setNotice("Video je dodan u ovu lokalnu biblioteku.");
  }
  function removeVideo(id) {
    setVideos((items) => items.filter((item) => item.id !== id));
    setFavorites((items) => items.filter((item) => item !== id));
    setSaved((items) => items.filter((item) => item !== id));
    setHistory((items) => items.filter((item) => item !== id));
    if (activeVideo?.id === id) setActiveVideo(null);
  }

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
      <div className="psv-hero-art" aria-hidden="true"><div className="psv-art-glow" /><div className="psv-art-cross">✦</div><div className="psv-art-line" /><div className="psv-art-caption"><span>DOMOVINSKI RAT</span><strong>Sjećanje je odgovornost.</strong></div></div>
    </section>

    <section className="psv-stat-row" aria-label="Pregled biblioteke">
      <div><Film /><span><strong>{videos.length}</strong><small>zapisa u biblioteci</small></span></div>
      <div><Heart /><span><strong>{favorites.length}</strong><small>omiljenih</small></span></div>
      <div><Bookmark /><span><strong>{saved.length}</strong><small>za pogledati</small></span></div>
      <div><History /><span><strong>{history.length}</strong><small>nedavno gledanih</small></span></div>
    </section>

    <section className="psv-library" id="psv-library">
      <div className="psv-section-heading"><div><span className="psv-eyebrow">DIGITALNA ZBIRKA</span><h2>{currentTitle}</h2><p>Pretraži, razvrstaj i otvori video bez napuštanja PatriaSoul sučelja.</p></div><div className="psv-layout-switch"><button className={layout === "grid" ? "selected" : ""} onClick={() => setLayout("grid")}>Kartice</button><button className={layout === "list" ? "selected" : ""} onClick={() => setLayout("list")}>Popis</button></div></div>

      <div className="psv-toolbar">
        <label className="psv-search"><Search size={18} /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Pretraži naslove, mjesta, svjedoke…" /><kbd>/</kbd></label>
        <label className="psv-sort"><SlidersHorizontal size={16} /><span>Sortiraj</span><select value={sort} onChange={(e) => setSort(e.target.value)}><option value="newest">Najnovije dodano</option><option value="oldest">Najstariji datum</option><option value="title">Naslov A–Ž</option></select><ChevronDown size={14} /></label>
      </div>

      <div className="psv-category-row" aria-label="Kategorije">{CATEGORIES.map((item) => <button key={item} className={category === item ? "selected" : ""} onClick={() => setCategory(item)}>{item}</button>)}</div>
      <div className="psv-quick-filters">
        <button className={view === "all" ? "selected" : ""} onClick={() => setView("all")}><Tv size={15} /> Sve</button>
        <button className={view === "favorites" ? "selected" : ""} onClick={() => setView("favorites")}><Heart size={15} /> Omiljeno</button>
        <button className={view === "saved" ? "selected" : ""} onClick={() => setView("saved")}><Bookmark size={15} /> Za kasnije</button>
        <button className={view === "history" ? "selected" : ""} onClick={() => setView("history")}><Clock3 size={15} /> Povijest gledanja</button>
      </div>

      {notice && <div className="psv-notice" role="status"><Info size={17} /><span>{notice}</span><button onClick={() => setNotice("")} aria-label="Zatvori obavijest"><X size={16} /></button></div>}

      {visibleVideos.length ? <div className={`psv-video-grid ${layout === "list" ? "list-layout" : ""}`}>{visibleVideos.map((video) => <VideoCard key={video.id} video={video} onOpen={openVideo} favorite={favorites.includes(video.id)} saved={saved.includes(video.id)} onFavorite={(id) => toggle(setFavorites, favorites, id)} onSave={(id) => toggle(setSaved, saved, id)} />)}</div> : <div className="psv-empty-state"><div className="psv-empty-icon"><Film size={30} /></div><span className="psv-eyebrow">ARHIVA SE GRADI</span><h3>{videos.length ? "Nema rezultata za odabrani prikaz" : "Prvi zapis počinje ovdje"}</h3><p>{videos.length ? "Promijeni pojam pretrage ili kategoriju." : "Dodaj provjerenu YouTube poveznicu na dokumentarac, svjedočanstvo ili povijesni zapis. Naslov, izvor i kontekst ostaju uz video."}</p><button className="psv-add-button" onClick={() => setAddOpen(true)}><Plus size={17} /> Dodaj prvi video</button></div>}
    </section>

    <footer className="psv-footer"><div className="psv-footer-mark">✦</div><div><strong>PatriaSoul · Čuvari nasljeđa</strong><p>Čuvati sjećanje znači čuvati dostojanstvo i istinu.</p></div><span className="psv-footer-note"><ShieldCheck size={15} /> Izvor i kontekst uz svaki zapis</span></footer>

    {activeVideo && <div className="psv-player-overlay" role="dialog" aria-modal="true" aria-label={activeVideo.title}>
      <div className="psv-player-shell"><div className="psv-player-head"><div><span className="psv-eyebrow">{activeVideo.category}</span><h2>{activeVideo.title}</h2></div><button className="psv-icon-button" onClick={() => setActiveVideo(null)} aria-label="Zatvori player"><X /></button></div>
        <div className="psv-player-frame"><iframe src={`https://www.youtube-nocookie.com/embed/${activeVideo.youtubeId}?autoplay=1&rel=0&modestbranding=1`} title={activeVideo.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen /></div>
        <div className="psv-player-details"><div><span>IZVOR</span><strong>{activeVideo.source || "YouTube · izvor nije dodat"}</strong><p>{activeVideo.description || "Opis i povijesni kontekst nisu uneseni."}</p>{activeVideo.date && <small>Datum događaja/zapisa: {formatDate(activeVideo.date)}</small>}</div><div className="psv-player-buttons"><button className={favorites.includes(activeVideo.id) ? "is-active" : ""} onClick={() => toggle(setFavorites, favorites, activeVideo.id)}><Heart size={16} /> Omiljeno</button><button className={saved.includes(activeVideo.id) ? "is-active" : ""} onClick={() => toggle(setSaved, saved, activeVideo.id)}><Bookmark size={16} /> Kasnije</button><a href={activeVideo.url} target="_blank" rel="noreferrer">Otvori na YouTubeu ↗</a><button className="psv-delete-button" onClick={() => removeVideo(activeVideo.id)}><Trash2 size={15} /> Ukloni iz moje biblioteke</button></div></div>
        <p className="psv-embed-note">Video se reproducira putem ugrađenog YouTube playera. Neki autori ne dopuštaju ugrađivanje; takav video možda se neće moći reproducirati ovdje.</p>
      </div>
    </div>}

    {addOpen && <div className="psv-modal-backdrop" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) setAddOpen(false); }}><section className="psv-add-modal" role="dialog" aria-modal="true" aria-labelledby="psv-add-title"><div className="psv-modal-heading"><div><span className="psv-eyebrow">DOPUNI ZBIRKU</span><h2 id="psv-add-title">Dodaj video zapis</h2><p>Dodaj samo sadržaj koji je relevantan i za koji postoji dopuštenje za ugrađivanje ili povezivanje.</p></div><button className="psv-icon-button" onClick={() => setAddOpen(false)} aria-label="Zatvori"><X /></button></div>
      <form className="psv-add-form" onSubmit={addVideo}><label>YouTube poveznica *<input autoFocus type="url" required placeholder="https://www.youtube.com/watch?v=…" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} /></label><label>Naslov zapisa *<input required maxLength={120} placeholder="Npr. naslov dokumentarnog filma" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></label><label>Kategorija<select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>{CATEGORIES.filter((item) => item !== "Sve").map((item) => <option key={item}>{item}</option>)}</select></label><label>Izvor / autor<input maxLength={120} placeholder="Produkcija, ustanova, autor…" value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} /></label><label>Datum događaja ili zapisa<input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></label><label>Opis i povijesni kontekst<textarea maxLength={500} rows={3} placeholder="Što gledatelj treba znati? Navedi provjerljive podatke." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label><div className="psv-form-note"><ShieldCheck size={17} /><span>Navedi izvor i provjeri naslov, opis i kontekst. Ova prva verzija sprema zapise samo u ovom pregledniku.</span></div><div className="psv-modal-actions"><button type="button" className="psv-cancel-button" onClick={() => setAddOpen(false)}>Odustani</button><button type="submit" className="psv-add-button"><Plus size={16} /> Spremi zapis</button></div></form>
    </section></div>}
  </main>;
}
