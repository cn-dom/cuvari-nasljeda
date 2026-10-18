import { useEffect, useState } from "react";
import { isSupabaseConfigured, supabase } from "./lib/supabase.js";
import "./community-sections.css";
import SiteChrome from "./SiteChrome.jsx";

const normalizeUsername = (value) => String(value || "").trim().replace(/^@/, "").toLowerCase();
const displayName = (profile) => profile?.display_name || normalizeUsername(profile?.username) || "Čuvar nasljeđa";
const dateLabel = (value) => value ? new Date(value).toLocaleString("hr-HR", { weekday: "long", day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "";

export default function Events() {
  const [session, setSession] = useState(null);
  const [events, setEvents] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (!supabase) return undefined;
    supabase.auth.getSession().then(({ data }) => setSession(data?.session ?? null));
    const { data } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => data.subscription.unsubscribe();
  }, []);

  async function loadEvents() {
    if (!supabase) return;
    setBusy(true); setError("");
    const { data, error: loadError } = await supabase
      .from("community_events")
      .select("id,title,description,location,starts_at,ends_at,created_by,created_at,status,profiles:profiles!community_events_created_by_fkey(display_name,username)")
      .eq("status", "published")
      .gte("starts_at", new Date().toISOString())
      .order("starts_at", { ascending: true })
      .limit(100);
    if (loadError) {
      setError("Događaji se ne mogu učitati. Provjeri vezu s testnom bazom.");
      setEvents([]);
    } else {
      setEvents(data || []);
      const ids = (data || []).map((event) => event.id);
      if (session?.user?.id && ids.length) {
        const { data: rows } = await supabase.from("community_event_attendees").select("event_id,user_id,status").in("event_id", ids);
        setAttendance(rows || []);
      } else setAttendance([]);
    }
    setBusy(false);
  }

  useEffect(() => { loadEvents(); }, [session?.user?.id]);

  async function createEvent(event) {
    event.preventDefault();
    if (!session?.user?.id) { setNotice("Za stvaranje događaja prvo se prijavi."); return; }
    if (!startsAt || new Date(startsAt).getTime() < Date.now() - 60000) {
      setError("Početak događaja mora biti u budućnosti.");
      return;
    }
    if (endsAt && new Date(endsAt) < new Date(startsAt)) {
      setError("Završetak ne može biti prije početka.");
      return;
    }
    setBusy(true); setError(""); setNotice("");
    const payload = {
      title: title.trim(),
      description: description.trim(),
      location: location.trim(),
      starts_at: new Date(startsAt).toISOString(),
      ends_at: endsAt ? new Date(endsAt).toISOString() : null,
      created_by: session.user.id,
    };
    const { error: saveError } = await supabase.from("community_events").insert(payload);
    if (saveError) setError(saveError.message || "Događaj nije spremljen.");
    else {
      setTitle(""); setDescription(""); setLocation(""); setStartsAt(""); setEndsAt("");
      setShowCreate(false); setNotice("Događaj je objavljen.");
      await loadEvents();
    }
    setBusy(false);
  }

  async function toggleAttendance(eventItem) {
    if (!session?.user?.id) { setNotice("Prijavi se kako bi potvrdio/la dolazak."); return; }
    const existing = attendance.find((row) => row.event_id === eventItem.id && row.user_id === session.user.id);
    if (existing) {
      const { error: saveError } = await supabase.from("community_event_attendees").delete().eq("event_id", eventItem.id).eq("user_id", session.user.id);
      if (saveError) { setError("Promjena prijave nije spremljena."); return; }
      setAttendance((rows) => rows.filter((row) => !(row.event_id === eventItem.id && row.user_id === session.user.id)));
      setNotice("Odjava s događaja je spremljena.");
    } else {
      const { data, error: saveError } = await supabase.from("community_event_attendees").insert({ event_id: eventItem.id, user_id: session.user.id, status: "attending" }).select("event_id,user_id,status").single();
      if (saveError) { setError("Prijava nije spremljena. Provjeri prava pristupa."); return; }
      setAttendance((rows) => [...rows, data]);
      setNotice("Potvrdio/la si dolazak.");
    }
  }

  return <main className="community-section-page">
    <SiteChrome section="Zajednica" links={[{"label":"Događaji","href":"/dogadaji.html"},{"label":"Forum","href":"/forum.html"},{"label":"Grupe","href":"/#grupe"},{"label":"Članovi","href":"/"}]}/>
    {!isSupabaseConfigured && <div className="community-section-alert">Testna baza nije povezana. Događaji se trenutačno ne mogu spremati.</div>}
    {error && <div className="community-section-alert">{error}</div>}
    {notice && <div className="community-section-notice">{notice}</div>}
    <section className="community-section-card events-card">
      <div className="community-section-title-row">
        <div><h2>Nadolazeći događaji</h2><p>{events.length} objavljenih događaja</p></div>
        <button className="community-section-primary" type="button" onClick={() => { setShowCreate((value) => !value); setError(""); }} disabled={!isSupabaseConfigured}>{showCreate ? "Zatvori obrazac" : "＋ Stvori događaj"}</button>
      </div>
      {showCreate && <form className="community-section-form events-form" onSubmit={createEvent}>
        <label htmlFor="event-title">Naziv događaja</label>
        <input id="event-title" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} required placeholder="Npr. Večer zavičajnih priča" />
        <label htmlFor="event-description">Opis</label>
        <textarea id="event-description" value={description} onChange={(e) => setDescription(e.target.value)} maxLength={5000} rows={4} placeholder="Što će se događati i kome je susret namijenjen?" />
        <label htmlFor="event-location">Mjesto ili poveznica</label>
        <input id="event-location" value={location} onChange={(e) => setLocation(e.target.value)} maxLength={240} placeholder="Grad, adresa ili poveznica na online susret" />
        <div className="events-date-grid">
          <div><label htmlFor="event-start">Početak</label><input id="event-start" type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} required /></div>
          <div><label htmlFor="event-end">Završetak (nije obvezno)</label><input id="event-end" type="datetime-local" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} /></div>
        </div>
        <button className="community-section-primary" type="submit" disabled={busy}>{busy ? "Spremam…" : "Objavi događaj"}</button>
        {!session && <small>Za objavu događaja potrebna je prijava.</small>}
      </form>}
      {busy && <p>Učitavam događaje…</p>}
      {!busy && events.length === 0 && <div className="community-section-empty events-empty"><span aria-hidden="true">✦</span><strong>Još nema najavljenih događaja.</strong><p>Pokreni prvi susret i pozovi zajednicu.</p></div>}
      <div className="events-list">{events.map((item) => {
        const ownAttendance = attendance.find((row) => row.event_id === item.id && row.user_id === session?.user?.id);
        const attendeeCount = attendance.filter((row) => row.event_id === item.id && row.status === "attending").length;
        return <article className="community-event-card" key={item.id}>
          <div className="community-event-date"><span>{new Date(item.starts_at).toLocaleDateString("hr-HR", { day: "2-digit" })}</span><small>{new Date(item.starts_at).toLocaleDateString("hr-HR", { month: "short" })}</small></div>
          <div className="community-event-content"><h3>{item.title}</h3><p className="community-section-meta">{dateLabel(item.starts_at)}{item.ends_at ? " – " + new Date(item.ends_at).toLocaleTimeString("hr-HR", { hour: "2-digit", minute: "2-digit" }) : ""}</p>
            {item.location && <p className="community-event-location">⌖ {item.location}</p>}
            {item.description && <p className="community-event-description">{item.description}</p>}
            <small className="community-event-organizer">Organizira: {displayName(item.profiles)}</small>
            <div className="community-event-actions"><span>{session ? attendeeCount + " potvrđenih dolazaka" : "Prijavi se za potvrdu dolaska"}</span><button type="button" className={ownAttendance ? "community-section-secondary" : "community-section-primary"} onClick={() => toggleAttendance(item)}>{ownAttendance ? "Neću doći" : "Dolazim"}</button></div>
          </div>
        </article>;
      })}</div>
    </section>
  </main>;
}
