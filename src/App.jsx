import { useEffect, useMemo, useState } from "react";
import { isSupabaseConfigured, supabase } from "./lib/supabase.js";

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
    owner: false,
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
    owner: false,
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
    owner: false,
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
  const [reactionsByPost, setReactionsByPost] = useState({});
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const [feedFilter, setFeedFilter] = useState("Sve objave");
  const [feedSearch, setFeedSearch] = useState("");
  const [openComments, setOpenComments] = useState([]);
  const [commentsByPost, setCommentsByPost] = useState({});
  const [commentDrafts, setCommentDrafts] = useState({});
  const [editingPostId, setEditingPostId] = useState(null);
  const [editDraft, setEditDraft] = useState("");
  const [memberPickerOpen, setMemberPickerOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authBusy, setAuthBusy] = useState(false);
  const [authMessage, setAuthMessage] = useState("");
  const [session, setSession] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [profileUsername, setProfileUsername] = useState("");
  const [profileBio, setProfileBio] = useState("");
  const [profileBusy, setProfileBusy] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");

  useEffect(() => {
    if (!supabase) return undefined;
    supabase.auth.getSession().then(({ data, error }) => {
      if (error) setAuthMessage("Sesiju nije moguće učitati. Pokušaj ponovno.");
      setSession(data?.session ?? null);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  async function submitAuth(event) {
    event.preventDefault();
    if (!supabase || !isSupabaseConfigured) {
      setAuthMessage("Prijava još nije aktivna. Najprije treba postaviti zasebni testni Supabase projekt.");
      return;
    }
    if (authMode !== "reset" && authPassword.length < 8) {
      setAuthMessage("Lozinka mora imati najmanje 8 znakova.");
      return;
    }
    setAuthBusy(true);
    setAuthMessage("");
    try {
      if (authMode === "reset") {
        const { error } = await supabase.auth.resetPasswordForEmail(authEmail.trim(), {
          redirectTo: window.location.origin,
        });
        if (error) throw error;
        setAuthMessage("Ako je račun povezan s ovom adresom, poslana je uputa za obnovu lozinke.");
      } else if (authMode === "register") {
        const { data, error } = await supabase.auth.signUp({
          email: authEmail.trim(),
          password: authPassword,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        setAuthMessage(data.session
          ? "Registracija je uspješna. Sada si prijavljen/a."
          : "Registracija je zaprimljena. Ako je potvrda e-pošte uključena, otvori poruku za potvrdu računa.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: authEmail.trim(),
          password: authPassword,
        });
        if (error) throw error;
        setAuthMessage("Uspješna prijava.");
      }
    } catch (error) {
      setAuthMessage(error?.message || "Prijava nije uspjela. Provjeri podatke i pokušaj ponovno.");
    } finally {
      setAuthBusy(false);
    }
  }

  async function signOut() {
    if (!supabase) return;
    const { error } = await supabase.auth.signOut();
    setAuthMessage(error ? "Odjava nije uspjela. Pokušaj ponovno." : "Uspješno si odjavljen/a.");
    if (!error) setAuthOpen(false);
  }

  useEffect(() => {
    let cancelled = false;
    async function loadProfile() {
      const metadata = session?.user?.user_metadata || {};
      setProfileName(metadata.display_name || "");
      setProfileUsername(metadata.username || "");
      setProfileBio(metadata.bio || "");
      if (!supabase || !session?.user?.id) return;
      const { data, error } = await supabase
        .from("profiles")
        .select("username, display_name, bio")
        .eq("id", session.user.id)
        .maybeSingle();
      if (cancelled) return;
      if (error) {
        // Keep the account metadata as an editing fallback, but never claim the DB profile loaded.
        setProfileMessage("Profilna tablica nije dostupna ili nema dopušten pristup. Provjeri primijenjeni SQL nacrt i RLS pravila.");
        return;
      }
      if (data) {
        setProfileName(data.display_name || "");
        setProfileUsername(data.username || "");
        setProfileBio(data.bio || "");
        setProfileMessage("");
      }
    }
    loadProfile();
    return () => { cancelled = true; };
  }, [session?.user?.id]);

  async function saveProfile(event) {
    event.preventDefault();
    if (!supabase || !session?.user) return;
    const cleanUsername = profileUsername.trim().replace(/^@/, "");
    if (cleanUsername && !/^[a-zA-Z0-9_.-]{3,24}$/.test(cleanUsername)) {
      setProfileMessage("Korisničko ime mora imati 3–24 znaka: slova, brojeve, točku, crticu ili podvlaku.");
      return;
    }
    if (profileName.trim().length > 60 || profileBio.trim().length > 240) {
      setProfileMessage("Ime može imati do 60, a opis do 240 znakova.");
      return;
    }
    setProfileBusy(true);
    setProfileMessage("");
    try {
      const { error } = await supabase.from("profiles").upsert({
        id: session.user.id,
        display_name: profileName.trim(),
        username: cleanUsername || null,
        bio: profileBio.trim(),
        updated_at: new Date().toISOString(),
      }, { onConflict: "id" });
      if (error) throw error;
      setProfileMessage("Profil je spremljen u bazi zajednice.");
    } catch (error) {
      setProfileMessage(error?.message || "Profil nije spremljen. Pokušaj ponovno.");
    } finally {
      setProfileBusy(false);
    }
  }

  const postCount = useMemo(() => posts.length, [posts]);
  const visiblePosts = useMemo(() => posts.filter((post) => {
    const matchesFilter = feedFilter === "Sve objave" || post.tag.toLocaleLowerCase("hr").includes(feedFilter.toLocaleLowerCase("hr"));
    const query = feedSearch.trim().toLocaleLowerCase("hr");
    const matchesSearch = !query || `${post.author} ${post.handle} ${post.tag} ${post.text}`.toLocaleLowerCase("hr").includes(query);
    return matchesFilter && matchesSearch;
  }), [posts, feedFilter, feedSearch]);

  function publishPost() {
    const text = draft.trim();
    if (!text && !selectedImage) {
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
        imageUrl: selectedImage,
        likes: 0,
        comments: 0,
        icon: "💬",
        owner: true,
      },
      ...current,
    ]);
    setDraft("");
    setSelectedImage("");
    setMemberPickerOpen(false);
    setNotice("Objava je dodana samo u ovaj lokalni prikaz. Trajno spremanje zida bit će aktivirano nakon povezivanja baze.");
  }

  function toggleLike(id) {
    setLiked((current) => current.includes(id)
      ? current.filter((item) => item !== id)
      : [...current, id]);
  }

  function toggleReaction(id, reaction) {
    setReactionsByPost((current) => {
      const selected = current[id] || "";
      return { ...current, [id]: selected === reaction ? "" : reaction };
    });
  }

  function toggleComments(id) {
    setOpenComments((current) => current.includes(id)
      ? current.filter((item) => item !== id)
      : [...current, id]);
  }

  function addComment(id) {
    const text = (commentDrafts[id] || "").trim();
    if (!text) {
      setNotice("Napiši komentar prije slanja.");
      return;
    }
    setCommentsByPost((current) => ({ ...current, [id]: [...(current[id] || []), { id: Date.now(), author: "Ti — probni profil", text }] }));
    setCommentDrafts((current) => ({ ...current, [id]: "" }));
    setNotice("Komentar je dodan samo u lokalni prikaz; trajno spremanje komentara još nije povezano.");
  }

  function startEdit(post) {
    if (!post.owner) return;
    setEditingPostId(post.id);
    setEditDraft(post.text);
  }

  function saveEdit(id) {
    const text = editDraft.trim();
    if (!text) {
      setNotice("Objava ne može biti prazna.");
      return;
    }
    setPosts((current) => current.map((post) => post.id === id ? { ...post, text, time: "Uređeno upravo sada" } : post));
    setEditingPostId(null);
    setEditDraft("");
    setNotice("Objava je uređena samo u lokalnom prikazu; trajno uređivanje još nije povezano.");
  }

  function deletePost(id) {
    setPosts((current) => current.filter((post) => post.id !== id || !post.owner));
    setCommentsByPost((current) => {
      const next = { ...current };
      delete next[id];
      return next;
    });
    setOpenComments((current) => current.filter((item) => item !== id));
    setNotice("Vlastita probna objava i njezini komentari uklonjeni su iz lokalnog prikaza; brisanje iz baze još nije povezano.");
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
          {session ? (
            <div className="auth-session-actions">
              <button className="profile-open-button" onClick={() => { setProfileOpen(true); setProfileMessage(""); }}><span className="profile-mini-avatar">{(session.user?.user_metadata?.display_name || session.user?.email || "Č").slice(0, 1).toLocaleUpperCase("hr")}</span><span className="auth-user-label">{session.user?.user_metadata?.display_name || session.user?.email || "Moj profil"}</span><span className="profile-open-label">Moj profil</span></button>
              <button className="login-button" onClick={signOut}>Odjava</button>
            </div>
          ) : (
            <button className="login-button" onClick={() => { setAuthOpen(true); setAuthMessage(""); }}>Prijava / Registracija</button>
          )}
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

          {profileOpen && session && (
            <section className="profile-panel card" aria-labelledby="profile-title">
              <div className="auth-panel-heading">
                <div>
                  <span className="eyebrow">MOJ RAČUN</span>
                  <h2 id="profile-title">Korisnički profil</h2>
                  <p className="profile-email">{session.user?.email}</p>
                </div>
                <button type="button" className="auth-close" aria-label="Zatvori profil" onClick={() => setProfileOpen(false)}>×</button>
              </div>
              <form className="auth-form" onSubmit={saveProfile}>
                <label htmlFor="profile-name">Ime za prikaz</label>
                <input id="profile-name" value={profileName} onChange={(event) => setProfileName(event.target.value)} maxLength={60} placeholder="Kako da te zajednica oslovljava?" />
                <label htmlFor="profile-username">Korisničko ime</label>
                <input id="profile-username" value={profileUsername} onChange={(event) => setProfileUsername(event.target.value)} maxLength={24} autoComplete="username" placeholder="npr. cuvar_bastine" />
                <small className="profile-hint">3–24 znaka; slova, brojevi, točka, crtica ili podvlaka.</small>
                <label htmlFor="profile-bio">O meni</label>
                <textarea id="profile-bio" className="profile-bio-input" value={profileBio} onChange={(event) => setProfileBio(event.target.value)} maxLength={240} rows={3} placeholder="Napiši nekoliko riječi o svojim interesima…" />
                <small className="profile-hint">{profileBio.length}/240 znakova</small>
                <button className="auth-submit" type="submit" disabled={profileBusy}>{profileBusy ? "Spremanje…" : "Spremi profil"}</button>
              </form>
              {profileMessage && <p className="auth-message" role="status">{profileMessage}</p>}
              <p className="auth-footnote">Ovi podaci služe za prikaz profila. Korisnički metapodaci nisu dokaz ovlasti; prava pristupa moraju se provoditi pravilima baze.</p>
            </section>
          )}

          {authOpen && (
            <section className="auth-panel card" aria-labelledby="auth-title">
              <div className="auth-panel-heading">
                <div>
                  <span className="eyebrow">ČUVARI NASLJEĐA</span>
                  <h2 id="auth-title">{authMode === "register" ? "Izradi račun" : authMode === "reset" ? "Obnova lozinke" : "Dobro došao natrag"}</h2>
                </div>
                <button type="button" className="auth-close" aria-label="Zatvori prijavu" onClick={() => setAuthOpen(false)}>×</button>
              </div>
              {!isSupabaseConfigured && (
                <div className="auth-config-notice" role="status">
                  <strong>Testna veza još nije postavljena.</strong>
                  <span>Obrazac je pripremljen, ali prijava neće slati podatke dok se ne postave VITE_SUPABASE_URL i VITE_SUPABASE_PUBLISHABLE_KEY za zasebni testni projekt.</span>
                </div>
              )}
              <form className="auth-form" onSubmit={submitAuth}>
                <label htmlFor="auth-email">E-pošta</label>
                <input id="auth-email" type="email" autoComplete="email" value={authEmail} onChange={(event) => setAuthEmail(event.target.value)} required placeholder="ime@primjer.hr" />
                {authMode !== "reset" && (
                  <>
                    <label htmlFor="auth-password">Lozinka</label>
                    <input id="auth-password" type="password" autoComplete={authMode === "register" ? "new-password" : "current-password"} value={authPassword} onChange={(event) => setAuthPassword(event.target.value)} required minLength={8} placeholder="Najmanje 8 znakova" />
                  </>
                )}
                <button className="auth-submit" type="submit" disabled={!isSupabaseConfigured || authBusy}>{authBusy ? "Molimo pričekaj…" : authMode === "register" ? "Registriraj se" : authMode === "reset" ? "Pošalji upute" : "Prijavi se"}</button>
              </form>
              {authMessage && <p className="auth-message" role="status">{authMessage}</p>}
              {authMode === "login" && (
                <p className="auth-switch"><button type="button" onClick={() => { setAuthMode("reset"); setAuthMessage(""); }}>Zaboravljena lozinka?</button></p>
              )}
              <p className="auth-switch">
                {authMode === "register" ? "Već imaš račun?" : authMode === "reset" ? "Sjetio/la si se lozinke?" : "Nemaš račun?"}{" "}
                <button type="button" onClick={() => { setAuthMode(authMode === "register" || authMode === "reset" ? "login" : "register"); setAuthMessage(""); }}>
                  {authMode === "register" || authMode === "reset" ? "Prijava" : "Registracija"}
                </button>
              </p>
              <p className="auth-footnote">Koristi samo testni račun dok ne provjerimo postavke i pravila pristupa.</p>
            </section>
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
            {selectedImage && (
              <div className="composer-image-preview">
                <img src={selectedImage} alt="Pregled odabrane fotografije" />
                <button type="button" onClick={() => setSelectedImage("")}>Ukloni fotografiju</button>
                <small>Privremeni pregled samo u ovom pregledniku · najviše 5 MB</small>
              </div>
            )}
            <div className="composer-bottom">
              <div className="composer-tools" aria-label="Opcije objave">
                <label className="composer-file-button">▧ <span>Fotografija</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    aria-label="Odaberi fotografiju"
                    onChange={(event) => {
                      const file = event.target.files && event.target.files[0];
                      if (!file) return;
                      if (!file.type.startsWith("image/") || file.size > 5 * 1024 * 1024) {
                        setNotice("Odaberi sliku do 5 MB (JPG, PNG, WebP ili GIF).");
                        event.target.value = "";
                        return;
                      }
                      const reader = new FileReader();
                      reader.onload = () => setSelectedImage(typeof reader.result === "string" ? reader.result : "");
                      reader.onerror = () => setNotice("Fotografiju nije bilo moguće učitati u pregled.");
                      reader.readAsDataURL(file);
                    }}
                  />
                </label>
                <div className="emoji-tool-wrap">
                  <button type="button" aria-expanded={emojiPickerOpen} onClick={() => setEmojiPickerOpen((open) => !open)}>☺ <span>Emoji</span></button>
                  {emojiPickerOpen && (
                    <div className="emoji-picker" aria-label="Odaberi emoji">
                      {["🇭🇷", "❤️", "🙏", "👏", "😊", "🌿", "🏛️", "📜", "🕯️", "🌊", "🌞", "🕊️"].map((emoji) => (
                        <button type="button" key={emoji} aria-label={"Dodaj emoji " + emoji} onClick={() => { setDraft((value) => value + emoji); setEmojiPickerOpen(false); }}>{emoji}</button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="mention-tool-wrap">
                  <button type="button" aria-expanded={memberPickerOpen} onClick={() => setMemberPickerOpen((open) => !open)}>@ <span>Označi člana</span></button>
                  {memberPickerOpen && (
                    <div className="mention-picker" aria-label="Probni izbor članova">
                      <strong>Označi člana</strong>
                      <p>Primjer izgleda · profili još nisu povezani</p>
                      {[
                        { name: "Marija K.", handle: "@marija_prica" },
                        { name: "Ivan P.", handle: "@ivan_povijest" },
                        { name: "Čuvari nasljeđa", handle: "@cuvari_nasljeda" },
                      ].map((member) => (
                        <button type="button" key={member.handle} onClick={() => {
                          setDraft((value) => value + (value && !value.endsWith(" ") ? " " : "") + member.handle + " ");
                          setMemberPickerOpen(false);
                        }}>
                          <span>{member.name}</span><small>{member.handle}</small>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
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
                <div className="post-menu">
                  {post.owner ? (
                    <>
                      <button className="post-menu-button" onClick={() => startEdit(post)}>Uredi</button>
                      <button className="post-menu-button danger" onClick={() => deletePost(post.id)}>Izbriši</button>
                    </>
                  ) : (
                    <button className="more-button" aria-label="Prijavi objavu" onClick={() => setNotice("Prijava objave bit će spojena s pravilima i administratorskim alatima.")}>•••</button>
                  )}
                </div>
              </div>
              <div className="post-tag"><span>{post.icon}</span> {post.tag}</div>
              {editingPostId === post.id ? (
                <div className="edit-post-box">
                  <label className="sr-only" htmlFor={"edit-post-" + post.id}>Uredi svoju objavu</label>
                  <textarea id={"edit-post-" + post.id} value={editDraft} onChange={(event) => setEditDraft(event.target.value)} rows="4" />
                  <div className="inline-form-actions">
                    <button className="outline-button" onClick={() => { setEditingPostId(null); setEditDraft(""); }}>Odustani</button>
                    <button className="primary-button" onClick={() => saveEdit(post.id)}>Spremi izmjene</button>
                  </div>
                </div>
              ) : post.text ? <p className="post-text">{post.text}</p> : null}
              {post.imageUrl && <img className="post-user-image" src={post.imageUrl} alt="Fotografija uz objavu" />}
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
                <span>{post.comments + (commentsByPost[post.id] || []).length} komentara</span>
              </div>
              <div className="post-reactions" aria-label="Reakcije na objavu">
                {[
                  { emoji: "❤️", label: "Sviđa mi se" },
                  { emoji: "🇭🇷", label: "Domoljublje" },
                  { emoji: "🙏", label: "Zahvalnost" },
                  { emoji: "👏", label: "Podrška" },
                ].map((reaction) => (
                  <button key={reaction.emoji} type="button" className={reactionsByPost[post.id] === reaction.emoji ? "reaction-chip selected" : "reaction-chip"} aria-pressed={reactionsByPost[post.id] === reaction.emoji} aria-label={reaction.label} onClick={() => toggleReaction(post.id, reaction.emoji)}>
                    <span>{reaction.emoji}</span><small>{reaction.label}</small>
                  </button>
                ))}
              </div>
              <div className="post-actions">
                <button className={liked.includes(post.id) ? "post-action liked" : "post-action"} onClick={() => toggleLike(post.id)}>
                  <span>♡</span> Podržavam
                </button>
                <button className={openComments.includes(post.id) ? "post-action liked" : "post-action"} onClick={() => toggleComments(post.id)}><span>▢</span> Komentiraj</button>
                <button className="post-action" onClick={() => setNotice("Dijeljenje objava bit će dostupno nakon povezivanja profila.")}><span>↗</span> Podijeli</button>
              </div>
              {openComments.includes(post.id) && (
                <section className="comments-panel" aria-label={"Komentari uz objavu: " + post.author}>
                  <div className="comments-list">
                    {(commentsByPost[post.id] || []).length ? (commentsByPost[post.id] || []).map((comment) => (
                      <div className="comment-item" key={comment.id}>
                        <Avatar initials="TI" variant="avatar-you" />
                        <div className="comment-bubble"><strong>{comment.author}</strong><p>{comment.text}</p></div>
                      </div>
                    )) : <p className="comments-empty">Još nema komentara dodanih u ovom probnom prikazu.</p>}
                  </div>
                  <form className="comment-form" onSubmit={(event) => { event.preventDefault(); addComment(post.id); }}>
                    <label className="sr-only" htmlFor={"comment-" + post.id}>Napiši komentar</label>
                    <input id={"comment-" + post.id} value={commentDrafts[post.id] || ""} onChange={(event) => setCommentDrafts((current) => ({ ...current, [post.id]: event.target.value }))} placeholder="Napiši komentar…" />
                    <button className="primary-button" type="submit">Pošalji</button>
                  </form>
                  <p className="local-only-note">Probna funkcija · komentari se zasad ne spremaju na poslužitelj.</p>
                </section>
              )}
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