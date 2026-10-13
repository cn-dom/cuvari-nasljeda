import { useEffect, useState } from "react";
import { isSupabaseConfigured, supabase } from "./lib/supabase.js";
import "./community-sections.css";

const displayName = (profile) => profile?.display_name || profile?.username || "Čuvar nasljeđa";
const dateLabel = (value) => value ? new Date(value).toLocaleString("hr-HR", { dateStyle: "medium", timeStyle: "short" }) : "";
const slugify = (value) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export default function Pages() {
  const [session, setSession] = useState(null);
  const [pages, setPages] = useState([]);
  const [selectedPage, setSelectedPage] = useState(null);
  const [pagePosts, setPagePosts] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Zajednica");
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => setSession(data?.session ?? null));
    const { data } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => data.subscription.unsubscribe();
  }, []);

  async function loadPages() {
    if (!supabase) return;
    setBusy(true); setError("");
    const { data, error: loadError } = await supabase.from("community_pages").select("id,slug,name,description,category,created_by,created_at,profiles:profiles!community_pages_created_by_fkey(display_name,username)").eq("is_published", true).order("created_at", { ascending: false });
    if (loadError) setError("Stranice se ne mogu učitati. Provjeri povezanost baze i RLS pravila.");
    else setPages(data || []);
    setBusy(false);
  }

  useEffect(() => { loadPages(); }, []);

  async function loadPagePosts(page) {
    setSelectedPage(page); setNotice(""); setError(""); setBusy(true);
    const { data, error: loadError } = await supabase.from("community_page_posts").select("id,page_id,author_id,body,created_at,profiles(display_name,username)").eq("page_id", page.id).order("created_at", { ascending: false }).limit(100);
    if (loadError) setError("Objave ove stranice nisu dostupne.");
    else setPagePosts(data || []);
    setBusy(false);
  }

  async function createPage(event) {
    event.preventDefault();
    if (!session?.user?.id) { setNotice("Za izradu stranice potrebno je prijaviti se."); return; }
    const cleanName = name.trim();
    const cleanDescription = description.trim();
    if (cleanName.length < 3 || cleanName.length > 80) { setError("Naziv stranice mora imati od 3 do 80 znakova."); return; }
    if (cleanDescription.length > 1000) { setError("Opis može imati najviše 1.000 znakova."); return; }
    setBusy(true); setError(""); setNotice("");
    const baseSlug = slugify(cleanName);
    const { data, error: saveError } = await supabase.from("community_pages").insert({ slug: baseSlug + "-" + Math.random().toString(36).slice(2, 7), name: cleanName, description: cleanDescription, category, created_by: session.user.id }).select("id,slug,name,description,category,created_by,created_at").single();
    if (saveError) setError(saveError.message || "Stranica nije spremljena.");
    else { const created = { ...data, profiles: { display_name: session.user.user_metadata?.display_name || session.user.email } }; setPages(current => [created, ...current]); setName(""); setDescription(""); setNotice("Stranica je stvorena."); }
    setBusy(false);
  }

  async function createPagePost(event) {
    event.preventDefault();
    if (!session?.user?.id) { setNotice("Za objavu se prvo prijavi."); return; }
    const cleanDraft = draft.trim();
    if (!selectedPage) return;
    if (!cleanDraft || cleanDraft.length > 5000) { setError("Objava je obavezna i može imati najviše 5.000 znakova."); return; }
    setBusy(true); setError("");
    const { data, error: saveError } = await supabase.from("community_page_posts").insert({ page_id: selectedPage.id, author_id: session.user.id, body: cleanDraft }).select("id,page_id,author_id,body,created_at").single();
    if (saveError) setError(saveError.message || "Objava nije spremljena.");
    else setPagePosts(current => [{ ...data, profiles: { display_name: session.user.user_metadata?.display_name || session.user.email } }, ...current]);
    setDraft(""); setBusy(false);
  }

  return <main className="community-section-page">
    <header className="community-section-header"><a href="/" className="community-section-brand">← Čuvari nasljeđa</a><span className="community-section-eyebrow">PATRiASOUL · ZAJEDNICA</span><h1>Stranice zajednice</h1><p>Okupljaj ljude oko zavičaja, povijesti, obitelji, običaja i drugih tema.</p><a className="community-section-home" href="/">Povratak na zid</a></header>
    {!isSupabaseConfigured && <div className="community-section-alert">Baza nije konfigurirana u ovoj verziji aplikacije. Postavi javni URL i publishable ključ testnog projekta.</div>}
    {error && <div className="community-section-alert">{error}</div>}{notice && <div className="community-section-notice">{notice}</div>}
    {selectedPage ? <section className="community-section-card"><button className="community-section-back" onClick={() => setSelectedPage(null)}>← Sve stranice</button><span className="community-section-eyebrow">{selectedPage.category}</span><h2>{selectedPage.name}</h2><p>{selectedPage.description}</p><p className="community-section-meta">Stranicu pokrenuo/la {displayName(selectedPage.profiles)}</p>
      <form className="community-section-form" onSubmit={createPagePost}><label htmlFor="page-post-draft">Objavi na stranici</label><textarea id="page-post-draft" value={draft} onChange={e => setDraft(e.target.value)} maxLength={5000} required placeholder="Podijeli novost, priču ili pitanje…" /><button className="community-section-primary" disabled={busy}>{busy ? "Spremam…" : "Objavi na stranici"}</button>{!session && <small>Za objavu je potrebna prijava.</small>}</form>
      <h3>Objave stranice</h3>{busy && <p>Učitavam objave…</p>}{!busy && !pagePosts.length && <p className="community-section-empty">Još nema objava na ovoj stranici.</p>}
      {pagePosts.map(post => <article className="community-page-post" key={post.id}><strong>{displayName(post.profiles)}</strong><small>{dateLabel(post.created_at)}</small><p>{post.body}</p></article>)}
    </section> : <div className="community-section-layout pages-layout"><section className="community-section-card"><div className="community-section-title-row"><div><h2>Otkrij stranice</h2><p>{pages.length} aktivnih stranica</p></div><button className="community-section-secondary" onClick={loadPages}>Osvježi</button></div>
      {busy && <p>Učitavam stranice…</p>}{!busy && !pages.length && <p className="community-section-empty">Još nema stranica. Pokreni prvu zajednicu.</p>}
      <div className="community-pages-grid">{pages.map(page => <button key={page.id} className="community-page-tile" onClick={() => loadPagePosts(page)}><span className="community-page-symbol">▣</span><strong>{page.name}</strong><small>{page.category} · {displayName(page.profiles)}</small><p>{page.description || "Tematska stranica zajednice Čuvari nasljeđa."}</p><span className="community-page-open">Otvori stranicu →</span></button>)}</div>
    </section><section className="community-section-card"><h2>Stvori novu stranicu</h2><p className="community-section-subtitle">Za lokalnu zajednicu, udrugu, zavičaj, temu ili projekt baštine.</p><form className="community-section-form" onSubmit={createPage}><label htmlFor="page-name">Naziv stranice</label><input id="page-name" value={name} onChange={e => setName(e.target.value)} minLength={3} maxLength={80} required placeholder="Npr. Baština Sinjske krajine" /><label htmlFor="page-category">Kategorija</label><select id="page-category" value={category} onChange={e => setCategory(e.target.value)}><option>Zajednica</option><option>Povijest</option><option>Zavičaj</option><option>Obitelj i običaji</option><option>Vjera</option><option>Branitelji i sjećanje</option><option>Kultura i baština</option><option>Udruga</option></select><label htmlFor="page-description">Opis</label><textarea id="page-description" value={description} onChange={e => setDescription(e.target.value)} maxLength={1000} placeholder="Čemu je stranica posvećena?" /><button className="community-section-primary" disabled={busy}>{busy ? "Spremam…" : "Stvori stranicu"}</button>{!session && <small>Za stvaranje stranice potrebna je prijava.</small>}</form></section></div>}
  </main>;
}
