import { useMemo, useState } from "react";

const initialPosts = [
  {
    id: 1,
    initials: "ČN",
    author: "Čuvari nasljeđa",
    handle: "@cuvari_nasljeda",
    time: "Istaknuta objava",
    tag: "BAŠTINA",
    text: "Dobro došli u PatriaSoul – Čuvari nasljeđa. Ovdje čuvamo priče naših obitelji, mjesta, običaja i ljudi koji su oblikovali Hrvatsku. Svaka uspomena vrijedna je čuvanja i prenošenja novim naraštajima.",
    likes: 18,
    comments: 4,
    icon: "🏛️",
  },
  {
    id: 2,
    initials: "MK",
    author: "Marija K.",
    handle: "@marija_prica",
    time: "Prije 24 min",
    tag: "OBITELJSKE PRIČE",
    text: "Danas sam od bake zapisala recept koji se u našoj obitelji prenosi generacijama. Voljela bih da ovdje s vremenom skupimo ovakve male priče iz svih krajeva Hrvatske. Što se u vašoj obitelji čuva i prenosi?",
    likes: 12,
    comments: 7,
    icon: "🧵",
  },
  {
    id: 3,
    initials: "IP",
    author: "Ivan P.",
    handle: "@ivan_povijest",
    time: "Prije 1 h",
    tag: "POVIJEST",
    text: "Poziv zajednici: podijelite fotografiju starog predmeta, obiteljske isprave ili mjesta koje ima posebno značenje za vaš kraj. Ako znate priču iza predmeta, napišite je uz fotografiju i navedite izvor kad je poznat.",
    likes: 9,
    comments: 2,
    icon: "📜",
  },
];

const navItems = [
  { icon: "⌂", label: "Zid zajednice" },
  { icon: "♧", label: "Čuvari nasljeđa" },
  { icon: "▦", label: "Grupe" },
  { icon: "▣", label: "Događaji" },
  { icon: "✉", label: "Poruke" },
];

function BrandMark() {
  return (
    <div className="brand-mark" aria-hidden="true">
      <span className="brand-red" />
      <span className="brand-white" />
      <span className="brand-blue" />
      <span className="brand-checker">▦</span>
    </div>
  );
}

function Avatar({ initials, variant = "" }) {
  return <div className={`avatar ${variant}`}>{initials}</div>;
}

function App() {
  const [posts, setPosts] = useState(initialPosts);
  const [draft, setDraft] = useState("");
  const [activeNav, setActiveNav] = useState("Zid zajednice");
  const [liked, setLiked] = useState([]);
  const [notice, setNotice] = useState("");
  const [feedFilter, setFeedFilter] = useState("Sve objave");
  const [feedSearch, setFeedSearch] = useState("");

  const postCount = useMemo(() => posts.length, [posts]);
  const visiblePosts = useMemo(() => posts.filter((post) => {
    const matchesFilter = feedFilter === "Sve objave" || post.tag.toLocaleLowerCase("hr").includes(feedFilter.toLocaleLowerCase("hr"));
    const query = feedSearch.trim().toLocaleLowerCase("hr");
    const matchesSearch = !query || `${post.author} ${post.handle} ${post.tag} ${post.text}`.toLocaleLowerCase("hr").includes(query);
    return matchesFilter && matchesSearch;
  }), [posts, feedFilter, feedSearch]);

  function publishPost() {
    const text = draft.trim();
    if (!text) {
      setNotice("Napiši nekoliko riječi prije objave.");
      return;
    }
    setPosts((current) => [
      {
        id: Date.now(),
        initials: "TI",
        author: "Ti — probni profil",
        handle: "@probni_clan",
        time: "Upravo sada",
        tag: "NOVA OBJAVA",
        text,
        likes: 0,
        comments: 0,
        icon: "💬",
      },
      ...current,
    ]);
    setDraft("");
    setNotice("Objava je dodana samo u ovaj lokalni prikaz. Još se ne sprema u bazu.");
  }

  function toggleLike(id) {
    setLiked((current) => current.includes(id)
      ? current.filter((item) => item !== id)
      : [...current, id]);
  }

  return (
    <div className="app-shell">
      <div className="preview-ribbon">
        <span className="status-dot" /> RAZVOJNI PREGLED
        <span>Objave su zasad probne i ne spremaju se na poslužitelj.</span>
      </div>

      <header className="topbar">
        <a className="brand" href="#pocetna" onClick={() => setActiveNav("Zid zajednice")}>
          <BrandMark />
          <span className="brand-copy">
            <strong>PatriaSoul</strong>
            <small>ČUVARI NASLJEĐA</small>
          </span>
        </a>
        <nav className="topnav" aria-label="Glavna navigacija">
          {navItems.slice(0, 4).map((item) => (
            <button
              className={activeNav === item.label ? "topnav-link active" : "topnav-link"}
              key={item.label}
              onClick={() => setActiveNav(item.label)}
            >
              {item.label}
            </button>
          ))}
        </nav>
        <div className="top-actions">
          <button className="icon-button" aria-label="Pretraživanje" onClick={() => setNotice("Pretraživanje će biti povezano u sljedećoj fazi.")}>⌕</button>
          <button className="login-button" onClick={() => setNotice("Prijava i registracija bit će dodane nakon postavljanja Supabase testnog okruženja.")}>Prijava</button>
        </div>
      </header>

      <main className="page-layout" id="pocetna">
        <aside className="left-sidebar">
          <div className="community-card">
            <div className="community-banner"><span>HRVATSKA · POVIJEST · ZAJEDNIŠTVO</span></div>
            <div className="community-body">
              <div className="community-emblem"><BrandMark /></div>
              <h2>Čuvari nasljeđa</h2>
              <p>Mjesto za ljude koji čuvaju priče, običaje i uspomene.</p>
              <div className="community-stats">
                <div><strong>—</strong><span>članova</span></div>
                <div><strong>{postCount}</strong><span>probnih objava</span></div>
              </div>
            </div>
          </div>

          <section className="side-section">
            <h3>ZAJEDNICA</h3>
            {navItems.map((item) => (
              <button
                key={item.label}
                className={activeNav === item.label ? "side-link selected" : "side-link"}
                onClick={() => setActiveNav(item.label)}
              >
                <span className="side-icon">{item.icon}</span>{item.label}
                {item.label === "Poruke" && <span className="side-count">0</span>}
              </button>
            ))}
          </section>

          <section className="side-section values-card">
            <h3>NAŠA TRI TEMELJA</h3>
            <p><span>✦</span> Vjera</p>
            <p><span>✦</span> Obitelj</p>
            <p><span>✦</span> Domovina</p>
          </section>
          <p className="sidebar-foot">PatriaSoul · Znanje. Ponos. Nasljeđe.</p>
        </aside>

        <section className="feed-column" aria-label="Zid zajednice">
          <div className="welcome-panel">
            <div className="welcome-copy">
              <span className="eyebrow">DOBRO DOŠLI U ZAJEDNICU</span>
              <h1>Priče koje nas povezuju.<br /><em>Nasljeđe koje čuvamo.</em></h1>
              <p>Dijelimo uspomene, učimo jedni od drugih i prenosimo hrvatsko nasljeđe budućim naraštajima.</p>
            </div>
            <div className="welcome-symbol" aria-hidden="true">
              <span className="symbol-sun">✦</span>
              <span className="symbol-letters">PS</span>
              <span className="symbol-caption">ČUVARI<br />NASLJEĐA</span>
            </div>
          </div>

          {notice && (
            <div className="notice" role="status">
              <span>{notice}</span>
              <button aria-label="Zatvori obavijest" onClick={() => setNotice("")}>×</button>
            </div>
          )}

          <section className="composer card">
            <div className="composer-top">
              <Avatar initials="TI" variant="avatar-you" />
              <label className="sr-only" htmlFor="post-draft">Napiši objavu</label>
              <textarea
                id="post-draft"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Koju priču, uspomenu ili zanimljivost želiš podijeliti?"
                rows="3"
              />
            </div>
            <div className="composer-bottom">
              <div className="composer-tools" aria-label="Opcije objave">
                <button onClick={() => setNotice("Dodavanje fotografija povezujemo sa Supabase Storageom u sljedećoj fazi.")}>▧ <span>Fotografija</span></button>
                <button onClick={() => setDraft((value) => value + (value ? " " : "") + "🇭🇷")}>⚑ <span>Emoji</span></button>
                <button onClick={() => setNotice("Označavanje članova bit će dostupno nakon uvođenja profila.")}>@ <span>Označi člana</span></button>
              </div>
              <button className="primary-button" onClick={publishPost}>Objavi <span>↗</span></button>
            </div>
          </section>

          <div className="feed-heading">
            <div>
              <span className="eyebrow">ŽIVOT ZAJEDNICE</span>
              <h2>{activeNav === "Zid zajednice" ? "Zid zajednice" : activeNav}</h2>
            </div>
            <span className="feed-total">{visiblePosts.length} objava</span>
          </div>

          <section className="feed-controls card" aria-label="Pretraživanje i filtriranje zida">
            <label className="sr-only" htmlFor="feed-search">Pretraži objave</label>
            <input id="feed-search" className="feed-search" type="search" value={feedSearch} onChange={(event) => setFeedSearch(event.target.value)} placeholder="Pretraži priče, članove i teme…" />
            <div className="feed-filter-list" aria-label="Filtriraj objave">
              {["Sve objave", "BAŠTINA", "OBITELJSKE PRIČE", "POVIJEST"].map((filter) => (
                <button key={filter} type="button" className={feedFilter === filter ? "feed-filter active" : "feed-filter"} onClick={() => setFeedFilter(filter)} aria-pressed={feedFilter === filter}>{filter}</button>
              ))}
            </div>
          </section>

          {visiblePosts.length ? visiblePosts.map((post) => (
            <article className="post-card card" key={post.id}>
              <div className="post-header">
                <Avatar initials={post.initials} variant={post.id === 1 ? "avatar-community" : ""} />
                <div className="post-author">
                  <strong>{post.author}</strong>
                  <span>{post.handle} <b>·</b> {post.time}</span>
                </div>
                <button className="more-button" aria-label="Više opcija" onClick={() => setNotice("Prijava objave i izbornik vlasničkih radnji bit će povezani u fazi sigurnosti.")}>•••</button>
              </div>
              <div className="post-tag"><span>{post.icon}</span> {post.tag}</div>
              <p className="post-text">{post.text}</p>
              {post.id === 1 && (
                <div className="heritage-art" role="img" aria-label="Dekorativni motiv hrvatske baštine">
                  <div className="heritage-art-grid" />
                  <span className="heritage-art-small">HRVATSKA · POVIJEST · IDENTITET</span>
                  <strong>Čuvaj priču.<br /><em>Sačuvaj nasljeđe.</em></strong>
                  <span className="heritage-art-bottom">PATRIA SOUL</span>
                </div>
              )}
              <div className="post-metrics">
                <span>♥ {post.likes + (liked.includes(post.id) ? 1 : 0)} podrške</span>
                <span>{post.comments} komentara</span>
              </div>
              <div className="post-actions">
                <button className={liked.includes(post.id) ? "post-action liked" : "post-action"} onClick={() => toggleLike(post.id)}>
                  <span>♡</span> Podržavam
                </button>
                <button className="post-action" onClick={() => setNotice("Komentari i odgovori bit će povezani u fazi zida zajednice.")}><span>▢</span> Komentiraj</button>
                <button className="post-action" onClick={() => setNotice("Dijeljenje objava bit će dostupno nakon povezivanja profila.")}><span>↗</span> Podijeli</button>
              </div>
            </article>
          )) : <div className="empty-feed card"><strong>Nema pronađenih objava.</strong><p>Pokušaj drugu riječ ili odaberi „Sve objave”.</p><button className="outline-button" onClick={() => { setFeedSearch(""); setFeedFilter("Sve objave"); }}>Poništi filtre</button></div>}
          <div className="end-of-feed"><span>✦</span><p>Svaka priča čuva dio našeg zajedničkog nasljeđa.</p></div>
        </section>

        <aside className="right-sidebar">
          <section className="right-card card">
            <div className="right-card-title"><h3>U FOKUSU</h3><span>✦</span></div>
            <a href="#nasljede" className="focus-link" onClick={(event) => { event.preventDefault(); setNotice("Tematske zbirke priča bit će dodane kao posebna funkcija."); }}>
              <span className="focus-icon red">⌂</span><span><strong>Obiteljske priče</strong><small>Uspomene koje se prenose generacijama</small></span><b>›</b>
            </a>
            <a href="#povijest" className="focus-link" onClick={(event) => { event.preventDefault(); setNotice("Povijesne teme bit će povezane s PatriaSoul člancima i kvizovima."); }}>
              <span className="focus-icon blue">▤</span><span><strong>Povijest i baština</strong><small>Znanje, izvori i lokalne priče</small></span><b>›</b>
            </a>
            <a href="#domovina" className="focus-link" onClick={(event) => { event.preventDefault(); setNotice("Zbirke hrvatskih krajeva bit će dodane u daljnjoj fazi."); }}>
              <span className="focus-icon gold">✥</span><span><strong>Naši krajevi</strong><small>Mjesta, običaji i ljudi</small></span><b>›</b>
            </a>
          </section>

          <section className="right-card card">
            <div className="right-card-title"><h3>PRIDRUŽI SE RAZGOVORU</h3><span>↗</span></div>
            <div className="group-row"><span className="group-icon">🏰</span><span><strong>Ljubitelji hrvatske povijesti</strong><small>Grupa zajednice · u pripremi</small></span></div>
            <div className="group-row"><span className="group-icon">🌿</span><span><strong>Običaji i tradicija</strong><small>Grupa zajednice · u pripremi</small></span></div>
            <div className="group-row"><span className="group-icon">📷</span><span><strong>Stare fotografije Hrvatske</strong><small>Grupa zajednice · u pripremi</small></span></div>
            <button className="outline-button full-width" onClick={() => setActiveNav("Grupe")}>Istraži grupe <span>→</span></button>
          </section>

          <section className="principle-card">
            <span className="principle-quote">“</span>
            <p>Nasljeđe ne čuvamo samo za sebe, nego i za one koji dolaze poslije nas.</p>
            <span className="principle-rule" />
            <strong>NAČELO ZAJEDNICE</strong>
          </section>

          <footer className="right-footer">
            <span>O PatriaSoulu</span><span>Pravila zajednice</span><span>Privatnost</span>
            <p>© PatriaSoul – Čuvari nasljeđa</p>
          </footer>
        </aside>
      </main>
    </div>
  );
}

export default App;