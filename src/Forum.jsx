import { useEffect, useState } from "react";
import { isSupabaseConfigured, supabase } from "./lib/supabase.js";
import "./community-sections.css";
import SiteChrome from "./SiteChrome.jsx";

const normalizeUsername = (value) => String(value || "").trim().replace(/^@/, "").toLowerCase();
const label = (profile) => profile?.display_name || normalizeUsername(profile?.username) || "Čuvar nasljeđa";
const dateLabel = (value) => value ? new Date(value).toLocaleString("hr-HR", { dateStyle: "medium", timeStyle: "short" }) : "";

export default function Forum() {
  const [session, setSession] = useState(null);
  const [categories, setCategories] = useState([]);
  const [topics, setTopics] = useState([]);
  const [activeCategory, setActiveCategory] = useState("");
  const [activeTopic, setActiveTopic] = useState(null);
  const [replies, setReplies] = useState([]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [reply, setReply] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => setSession(data?.session ?? null));
    const { data } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => data.subscription.unsubscribe();
  }, []);

  async function loadTopics(categoryId = activeCategory) {
    if (!supabase) return;
    setBusy(true); setError("");
    let request = supabase.from("forum_topics").select("id,category_id,user_id,title,body,status,is_pinned,created_at,profiles(display_name,username),forum_categories(name,slug)").eq("status", "published").order("is_pinned", { ascending: false }).order("created_at", { ascending: false }).limit(100);
    if (categoryId) request = request.eq("category_id", categoryId);
    const { data, error: loadError } = await request;
    if (loadError) setError("Teme se ne mogu učitati. Provjeri vezu s testnom bazom i RLS pravila.");
    else setTopics(data || []);
    setBusy(false);
  }

  useEffect(() => {
    if (!supabase) return;
    let cancelled = false;
    supabase.from("forum_categories").select("id,slug,name,description,sort_order").eq("is_active", true).order("sort_order").then(({ data, error: loadError }) => {
      if (cancelled) return;
      if (loadError) setError("Forumske tablice još nisu dostupne u povezanoj bazi.");
      else { setCategories(data || []); if (data?.length) { setActiveCategory(data[0].id); } }
    });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => { if (activeCategory) loadTopics(activeCategory); }, [activeCategory]);

  useEffect(() => {
    if (!supabase || !activeTopic) { setReplies([]); return; }
    let cancelled = false;
    supabase.from("forum_posts").select("id,user_id,content,parent_id,created_at,profiles(display_name,username)").eq("topic_id", activeTopic.id).eq("status", "published").order("created_at", { ascending: true }).then(({ data, error: loadError }) => {
      if (cancelled) return;
      if (loadError) setError("Odgovori se ne mogu učitati.");
      else setReplies(data || []);
    });
    return () => { cancelled = true; };
  }, [activeTopic?.id]);

  async function createTopic(event) {
    event.preventDefault();
    if (!session?.user?.id) { setNotice("Za otvaranje teme prijavi se računom Čuvari nasljeđa."); return; }
    if (!activeCategory) return;
    const cleanTitle = title.trim();
    const cleanBody = body.trim();
    if (cleanTitle.length < 5 || cleanTitle.length > 160) { setError("Naslov teme mora imati od 5 do 160 znakova."); return; }
    if (!cleanBody || cleanBody.length > 10000) { setError("Prva poruka je obavezna i može imati najviše 10.000 znakova."); return; }
    setBusy(true); setError(""); setNotice("");
    const { data, error: saveError } = await supabase.from("forum_topics").insert({ category_id: activeCategory, user_id: session.user.id, title: cleanTitle, body: cleanBody }).select("id").single();
    if (saveError) { setError(saveError.message || "Tema nije spremljena."); setBusy(false); return; }
    const { data: created, error: fetchError } = await supabase.from("forum_topics").select("id,category_id,user_id,title,body,status,is_pinned,created_at,profiles(display_name,username),forum_categories(name,slug)").eq("id", data.id).single();
    if (fetchError) { setNotice("Tema je spremljena. Osvježi popis kako bi se prikazala."); await loadTopics(activeCategory); }
    else { setTopics(current => [created, ...current]); setActiveTopic(created); }
    setTitle(""); setBody(""); setBusy(false);
  }

  async function addReply(event) {
    event.preventDefault();
    if (!session?.user?.id) { setNotice("Za odgovor se prvo prijavi."); return; }
    const cleanReply = reply.trim();
    if (!activeTopic) return;
    if (!cleanReply || cleanReply.length > 5000) { setError("Odgovor je obavezan i može imati najviše 5.000 znakova."); return; }
    setBusy(true); setError("");
    const { data, error: saveError } = await supabase.from("forum_posts").insert({ topic_id: activeTopic.id, user_id: session.user.id, content: cleanReply }).select("id,user_id,content,parent_id,created_at").single();
    if (saveError) setError(saveError.message || "Odgovor nije spremljen.");
    else setReplies(current => [...current, { ...data, profiles: { display_name: session.user.user_metadata?.display_name || session.user.email } }]);
    setReply(""); setBusy(false);
  }

  return <main className="community-section-page">
    <SiteChrome section="Zajednica" links={[{"label":"Forum","href":"/forum.html"},{"label":"Grupe","href":"/#grupe"},{"label":"Članovi","href":"/"},{"label":"Događaji","href":"/dogadaji.html"}]}/>
    {!isSupabaseConfigured && <div className="community-section-alert">Baza nije konfigurirana u ovoj verziji aplikacije. Postavi javni URL i publishable ključ testnog projekta.</div>}
    {error && <div className="community-section-alert">{error}</div>}{notice && <div className="community-section-notice">{notice}</div>}
    {activeTopic ? <section className="community-section-card">
      <button className="community-section-back" onClick={() => setActiveTopic(null)}>← Sve teme</button>
      <span className="community-section-eyebrow">{activeTopic.forum_categories?.name || "Forum"}</span><h2>{activeTopic.title}</h2><p className="community-section-meta">{label(activeTopic.profiles)} · {dateLabel(activeTopic.created_at)}</p><p className="community-section-body">{activeTopic.body}</p>
      <h3>Odgovori ({replies.length})</h3>
      {replies.map(item => <article className="community-reply" key={item.id}><strong>{label(item.profiles)}</strong><small>{dateLabel(item.created_at)}</small><p>{item.content}</p></article>)}
      <form className="community-section-form" onSubmit={addReply}><label htmlFor="forum-reply">Napiši odgovor</label><textarea id="forum-reply" value={reply} onChange={e => setReply(e.target.value)} maxLength={5000} required placeholder="Tvoj odgovor…" /><small className="community-character-count">{reply.length} / 5.000 znakova</small><button disabled={busy} className="community-section-primary">{busy ? "Spremam…" : "Pošalji odgovor"}</button></form>
    </section> : <div className="community-section-layout">
      <aside className="community-section-card"><h2>Forumske rubrike</h2>{categories.map(cat => <button key={cat.id} className={"community-category " + (activeCategory === cat.id ? "active" : "")} onClick={() => setActiveCategory(cat.id)}><strong>{cat.name}</strong><small>{cat.description}</small></button>)}</aside>
      <div className="community-section-main"><section className="community-section-card"><div className="community-section-title-row"><div><h2>Teme razgovora</h2><p>{topics.length} tema u odabranoj rubrici</p></div><button className="community-section-secondary" onClick={() => loadTopics()}>Osvježi</button></div>
        {busy && <p>Učitavam teme…</p>}{!busy && !topics.length && <p className="community-section-empty">Još nema tema u ovoj rubrici. Pokreni prvi razgovor.</p>}
        {topics.map(topic => <button className="community-topic" key={topic.id} onClick={() => setActiveTopic(topic)}><span className="community-topic-pin">{topic.is_pinned ? "📌" : "▤"}</span><span><strong>{topic.title}</strong><small>{topic.forum_categories?.name || "Forum"} · {label(topic.profiles)} · {dateLabel(topic.created_at)}</small><p>{topic.body}</p></span><span>→</span></button>)}
      </section><section className="community-section-card"><h2>Otvori novu temu</h2><form className="community-section-form" onSubmit={createTopic}><label htmlFor="forum-title">Naslov teme</label><input id="forum-title" value={title} onChange={e => setTitle(e.target.value)} minLength={5} maxLength={160} required placeholder="O čemu želiš razgovarati?" /><small className="community-character-count">{title.length} / 160 znakova</small><label htmlFor="forum-body">Prva poruka</label><textarea id="forum-body" value={body} onChange={e => setBody(e.target.value)} maxLength={10000} required placeholder="Napiši pitanje ili pokreni razgovor…" /><small className="community-character-count">{body.length} / 10.000 znakova</small><button className="community-section-primary" disabled={busy}>{busy ? "Spremam…" : "Objavi temu"}</button>{!session && <small>Za objavu teme potrebna je prijava.</small>}</form></section></div>
    </div>}
  </main>;
}
