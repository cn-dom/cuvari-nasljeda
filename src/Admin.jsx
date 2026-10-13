import { useEffect, useState } from "react";
import { supabase, isSupabaseConfigured } from "./lib/supabase.js";

const OWNER_EMAIL = "patriasoul@protonmail.com";

const modules = [
  { id: "overview", title: "Pregled sustava", group: "NADZOR", description: "Sažetak stanja mreže i najvažnijih aktivnosti.", icon: "▦", status: "Dostupno" },
  { id: "members", title: "Članovi mreže", group: "ZAJEDNICA", description: "Pregled registriranih članova i osnovnih podataka profila.", icon: "♙", status: "Pregled" },
  { id: "posts", title: "Objave na zidu", group: "SADRŽAJ", description: "Pretraživanje objava i uklanjanje sadržaja koji krši pravila.", icon: "▤", status: "Pregled i moderacija" },
  { id: "reports", title: "Prijave sadržaja", group: "MODERACIJA", description: "Pregled prijava članova, odluke i praćenje obrade.", icon: "⚑", status: "Moderacija" },
  { id: "comments", title: "Komentari", group: "SADRŽAJ", description: "Pregled komentara i uklanjanje sadržaja koji krši pravila.", icon: "☷", status: "Pregled i moderacija" },
  { id: "groups", title: "Grupe i zajednice", group: "ZAJEDNICA", description: "Pregled grupnih razgovora, članstva i aktivnosti.", icon: "♧", status: "Pregled" },
  { id: "events", title: "Događaji", group: "ZAJEDNICA", description: "Pregled objavljenih događaja i otkazivanje sadržaja koji krši pravila.", icon: "▣", status: "Pregled i moderacija" },
  { id: "quiz", title: "PatriaSoul kviz", group: "PATRiASOUL KVIZ", description: "Upravljanje kvizom, rezultatima, pitanjima i prijavama igrača.", icon: "🧠", status: "Povezivanje" },
  { id: "forum", title: "Domoljubni forum", group: "RAZGOVORI", description: "Pregled tema i početnih poruka na forumu.", icon: "▤", status: "Pregled" },
  { id: "pages", title: "Stranice zajednice", group: "ZAJEDNICA", description: "Pregled javnih tematskih stranica.", icon: "▣", status: "Pregled" },
  { id: "security", title: "Sigurnost i pravila", group: "SUSTAV", description: "Pravila zajednice, privatnost i provjera pristupa.", icon: "⬡", status: "Pregled" },
  { id: "audit", title: "Zapisnik administracije", group: "SUSTAV", description: "Vremenski zapis važnih moderatorskih radnji.", icon: "◷", status: "Pregled" },
];

function dateLabel(value) {
  if (!value) return "—";
  return new Date(value).toLocaleString("hr-HR", { dateStyle: "medium", timeStyle: "short" });
}

export default function Admin() {
  const [session, setSession] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [activeModule, setActiveModule] = useState("overview");
  const [rows, setRows] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [notice, setNotice] = useState("");
  const [dbStatus, setDbStatus] = useState("provjera");
  const [refreshKey, setRefreshKey] = useState(0);
  const [reportStatusFilter, setReportStatusFilter] = useState("all");
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groupMembers, setGroupMembers] = useState([]);
  const [groupMembersBusy, setGroupMembersBusy] = useState(false);
  const [groupMembersError, setGroupMembersError] = useState("");

  useEffect(() => {
    if (!supabase) { setAuthReady(true); return undefined; }
    supabase.auth.getSession().then(({ data }) => {
      setSession(data?.session ?? null);
      setAuthReady(true);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => setSession(nextSession));
    return () => data.subscription.unsubscribe();
  }, []);

  const isOwner = (session?.user?.email || "").trim().toLowerCase() === OWNER_EMAIL;

  useEffect(() => {
    let cancelled = false;
    async function loadModule() {
      setRows([]);
      setError("");
      setNotice("");
      if (!isOwner || !supabase) { setDbStatus("nije"); return; }
      setDbStatus("provjera");
      if (activeModule === "overview") {
        setBusy(true);
        const results = await Promise.all([
          supabase.from("profiles").select("id", { count: "exact", head: true }),
          supabase.from("posts").select("id", { count: "exact", head: true }),
          supabase.from("comments").select("id", { count: "exact", head: true }),
          supabase.from("content_reports").select("id", { count: "exact", head: true }).eq("status", "pending"),
          supabase.from("community_events").select("id", { count: "exact", head: true }).eq("status", "published").gte("starts_at", new Date().toISOString()),
          supabase.from("forum_topics").select("id", { count: "exact", head: true }),
          supabase.from("community_pages").select("id", { count: "exact", head: true }),
        ]);
        if (!cancelled) {
          setDbStatus(results.some((result) => result.error) ? "greska" : "povezano");
          setRows([
            { id: "members-count", title: "Članovi mreže", value: results[0].count ?? "—", detail: results[0].error ? "Podaci ili prava nisu dostupni" : "Ukupno profila" },
            { id: "posts-count", title: "Objave na zidu", value: results[1].count ?? "—", detail: results[1].error ? "Podaci ili prava nisu dostupni" : "Ukupno objava" },
            { id: "comments-count", title: "Komentari", value: results[2].count ?? "—", detail: results[2].error ? "Podaci ili prava nisu dostupni" : "Ukupno komentara" },
            { id: "reports-count", title: "Otvorene prijave", value: results[3].count ?? "—", detail: results[3].error ? "Podaci ili prava nisu dostupni" : "Čekaju pregled moderatora" },
            { id: "events-count", title: "Budući događaji", value: results[4].count ?? "—", detail: results[4].error ? "Podaci ili prava nisu dostupni" : "Objavljeni događaji koji tek dolaze" },
            { id: "forum-count", title: "Forum teme", value: results[5].count ?? "—", detail: results[5].error ? "Podaci ili prava nisu dostupni" : "Ukupno tema" },
            { id: "pages-count", title: "Stranice zajednice", value: results[6].count ?? "—", detail: results[6].error ? "Podaci ili prava nisu dostupni" : "Ukupno stranica" },
          ]);
          setBusy(false);
        }
        return;
      }
      if (activeModule === "groups") {
        setBusy(true);
        const { data, error: loadError } = await supabase.rpc("admin_group_chat_overview");
        if (cancelled) return;
        if (loadError) {
          setDbStatus("greska");
          setError("Pregled grupa nije dostupan. Provjeri je li administratorska SQL funkcija postavljena u testnoj bazi.");
          setBusy(false);
          return;
        }
        setDbStatus("povezano");
        setRows((data || []).map(row => ({ ...row, id: row.group_id })));
        setBusy(false);
        return;
      }
      const configs = {
        members: { table: "profiles", select: "id, display_name, username, created_at", order: "created_at" },
        posts: { table: "posts", select: "id, author_id, body, created_at", order: "created_at" },
        comments: { table: "comments", select: "id, post_id, author_id, body, created_at", order: "created_at" },
        events: { table: "community_events", select: "id, title, description, location, starts_at, ends_at, created_by, status, created_at", order: "starts_at" },
        reports: { table: "content_reports", select: "id, reporter_id, post_id, reason, details, status, created_at", order: "created_at" },
        audit: { table: "admin_audit_log", select: "id, actor_id, action, entity_type, entity_id, summary, created_at", order: "created_at" },
        forum: { table: "forum_topics", select: "id, title, body, user_id, category_id, status, created_at", order: "created_at" },
        pages: { table: "community_pages", select: "id, name, slug, description, category, created_by, created_at", order: "created_at" },
      };
      const config = configs[activeModule];
      if (!config) return;
      setBusy(true);
      const { data, error: loadError } = await supabase.from(config.table).select(config.select).order(config.order, { ascending: false }).limit(200);
      if (cancelled) return;
      if (loadError) {
        setDbStatus("greska");
        setError("Podaci se ne mogu učitati. Provjeri postoji li tablica i jesu li za vlasnika postavljena odgovarajuća RLS pravila.");
        setBusy(false);
        return;
      }
      setDbStatus("povezano");
      setRows(data || []);
      setBusy(false);
    }
    loadModule();
    return () => { cancelled = true; };
  }, [activeModule, isOwner, refreshKey]);

  async function recordAdminAction(action, entityType, entityId, summary) {
    const { error: auditError } = await supabase.rpc("admin_log_event", {
      p_action: action, p_entity_type: entityType, p_entity_id: String(entityId), p_summary: summary,
    });
    return !auditError;
  }

  async function viewGroupMembers(row) {
    setSelectedGroup(row);
    setGroupMembers([]);
    setGroupMembersError("");
    setGroupMembersBusy(true);
    const { data, error: loadError } = await supabase.rpc("admin_group_chat_members", { p_group_id: row.group_id || row.id });
    if (loadError) {
      setGroupMembersError("Članove nije moguće učitati. Provjeri je li SQL funkcija primijenjena u testnoj bazi.");
    } else {
      setGroupMembers(data || []);
    }
    setGroupMembersBusy(false);
  }

  async function removeGroupMember(member) {
    if (!selectedGroup) return;
    if (member.role === "admin" || member.user_id === selectedGroup.created_by) {
      setGroupMembersError("Administratori i osnivač zaštićeni su ovom radnjom.");
      return;
    }
    if (!window.confirm("Ukloniti " + (member.display_name || "ovog člana") + " iz grupe „" + selectedGroup.name + "“? Povijest poruka neće se prikazivati ovdje.")) return;
    const { data, error: removeError } = await supabase.rpc("admin_remove_group_chat_member", {
      p_group_id: selectedGroup.group_id || selectedGroup.id,
      p_user_id: member.user_id,
    });
    if (removeError || data !== true) {
      setGroupMembersError("Člana nije moguće ukloniti. Provjeri ulogu i vlasnička pravila baze.");
      return;
    }
    setGroupMembers(current => current.filter(item => item.user_id !== member.user_id));
    setRows(current => current.map(item => item.id === (selectedGroup.group_id || selectedGroup.id)
      ? { ...item, member_count: Math.max(0, Number(item.member_count || 0) - 1) }
      : item));
    setSelectedGroup(current => current ? { ...current, member_count: Math.max(0, Number(current.member_count || 0) - 1) } : current);
    const logged = await recordAdminAction("group_member_removed", "group_member", member.user_id, "Uklonjen član iz grupe: " + selectedGroup.name);
    setNotice("Član je uklonjen iz grupe." + (logged ? "" : " Napomena: zapisnik radnje nije spremljen."));
  }

  async function setReportStatus(row, status) {
    const { data, error: updateError } = await supabase.from("content_reports").update({ status }).eq("id", row.id).select("id,status").maybeSingle();
    if (updateError || !data) { setNotice("Promjena nije spremljena. Provjeri vlasnička pravila baze."); return; }
    setRows(current => current.map(item => item.id === row.id ? { ...item, status: data.status } : item));
    const logged = await recordAdminAction("report_status_changed", "report", row.id, "Status prijave promijenjen u: " + data.status);
    setNotice("Status prijave je spremljen." + (logged ? "" : " Napomena: zapisnik radnje nije spremljen."));
  }

  async function deletePost(row) {
    if (!window.confirm("Trajno ukloniti ovu objavu? Ova radnja se ne može poništiti.")) return;
    const { error: deleteError } = await supabase.from("posts").delete().eq("id", row.id);
    if (deleteError) { setNotice("Objava nije uklonjena. Provjeri vlasnička pravila i povezane tablice."); return; }
    setRows(current => current.filter(item => item.id !== row.id));
    const logged = await recordAdminAction("post_deleted", "post", row.id, "Vlasnik je uklonio objavu.");
    setNotice("Objava je uklonjena." + (logged ? "" : " Napomena: zapisnik radnje nije spremljen."));
  }

  async function cancelEvent(row) {
    if (row.status === "cancelled") { setNotice("Ovaj događaj već je otkazan."); return; }
    if (!window.confirm("Otkazati događaj „" + row.title + "“? Ostat će u bazi, ali više neće biti prikazan kao objavljen.")) return;
    const { data, error: updateError } = await supabase.from("community_events").update({ status: "cancelled" }).eq("id", row.id).select("id,status").maybeSingle();
    if (updateError || !data) { setNotice("Događaj nije otkazan. Provjeri vlasničku RLS politiku za događaje."); return; }
    setRows(current => current.map(item => item.id === row.id ? { ...item, status: "cancelled" } : item));
    const logged = await recordAdminAction("event_cancelled", "event", row.id, "Otkazan događaj: " + row.title);
    setNotice("Događaj je otkazan i više se neće prikazivati članovima." + (logged ? "" : " Napomena: zapisnik radnje nije spremljen."));
  }

  async function deleteComment(row) {
    if (!window.confirm("Trajno ukloniti ovaj komentar? Ova radnja se ne može poništiti.")) return;
    const { data, error: deleteError } = await supabase.from("comments").delete().eq("id", row.id).select("id").maybeSingle();
    if (deleteError || !data) { setNotice("Komentar nije uklonjen. Provjeri vlasničku RLS politiku za komentare."); return; }
    setRows(current => current.filter(item => item.id !== row.id));
    const logged = await recordAdminAction("comment_deleted", "comment", row.id, "Vlasnik je uklonio komentar.");
    setNotice("Komentar je uklonjen iz zajednice." + (logged ? "" : " Napomena: zapisnik radnje nije spremljen."));
  }

  async function deleteReportedPost(report) {
    if (!window.confirm("Trajno ukloniti prijavljenu objavu i označiti prijavu kao obrađenu?")) return;
    const { error: deleteError } = await supabase.from("posts").delete().eq("id", report.post_id);
    if (deleteError) { setNotice("Objava nije uklonjena. Provjeri vlasnička pravila i povezane tablice."); return; }
    const { data, error: statusError } = await supabase.from("content_reports").update({ status: "actioned" }).eq("id", report.id).select("id,status").maybeSingle();
    if (statusError || !data) {
      setNotice("Objava je uklonjena, ali status prijave nije ažuriran. Prijava je ostavljena u tablici radi naknadne provjere.");
      setRows(current => current.map(item => item.id === report.id ? { ...item, post_id: null } : item));
      return;
    }
    setRows(current => current.map(item => item.id === report.id ? { ...item, status: "actioned" } : item));
    const logged = await recordAdminAction("reported_post_deleted", "report", report.id, "Uklonjena prijavljena objava; prijava označena obrađenom.");
    setNotice("Objava je uklonjena, a prijava označena kao obrađena." + (logged ? "" : " Napomena: zapisnik radnje nije spremljen."));
  }

  const current = modules.find(item => item.id === activeModule) || modules[0];
  const filteredRows = rows.filter(row => {
    const matchesQuery = JSON.stringify(row).toLowerCase().includes(query.toLowerCase());
    const matchesReportStatus = activeModule !== "reports" || reportStatusFilter === "all" || row.status === reportStatusFilter;
    return matchesQuery && matchesReportStatus;
  });

  if (!authReady) return <main className="admin-page"><div className="admin-loading">Provjeravam pristup vlasnika…</div></main>;
  if (!isOwner) return <main className="admin-page"><section className="admin-access-denied"><span className="admin-eyebrow">PATRiASOUL · SIGURNOST</span><h1>Pristup odbijen</h1><p>Ova stranica dostupna je samo vlasniku mreže.</p><a className="admin-button" href="/">Povratak na mrežu</a></section></main>;

  return <main className="admin-page">
    <header className="admin-topbar">
      <a className="admin-brand" href="/" aria-label="Povratak na Čuvare nasljeđa"><img src="/assets/images/1000000982.png" alt="" /><span><strong>PatriaSoul</strong><small>ČUVARI NASLJEĐA · ADMINISTRACIJA</small></span></a>
      <div className="admin-top-actions"><span className="admin-owner-pill">✓ VLASNIK</span><span className="admin-owner-email">{session?.user?.email}</span><a href="/" className="admin-back-link">← Povratak na mrežu</a></div>
    </header>
    <div className="admin-layout">
      <aside className="admin-sidebar"><span className="admin-eyebrow">UPRAVLJANJE MREŽOM</span><h2>Administracija</h2><p>Odaberi jednu stavku. Detalji se otvaraju u radnom prostoru, bez gomilanja sadržaja na jednoj stranici.</p><div className="admin-side-nav">{modules.map(item => <button key={item.id} type="button" onClick={() => { setActiveModule(item.id); setQuery(""); setReportStatusFilter("all"); }} className={activeModule === item.id ? "selected" : ""}><span>{item.icon}</span><span>{item.title}</span><small>{item.status === "Sljedeća faza" ? "U pripremi" : "Otvori"}</small></button>)}</div><div className="admin-sidebar-foot">Prijavljen vlasnik<br/><strong>{session?.user?.email}</strong></div></aside>
      <section className="admin-workspace">
        <div className="admin-page-heading"><div><span className="admin-eyebrow">{current.group}</span><h1>{current.title}</h1><p>{current.description}</p></div><div className="admin-heading-actions"><button type="button" className="admin-button secondary" onClick={() => setRefreshKey(value => value + 1)}>↻ Osvježi</button><button type="button" className="admin-button secondary" onClick={() => { setActiveModule("overview"); setQuery(""); setReportStatusFilter("all"); }}>Pregled sustava</button></div></div>
        {notice && <div className="admin-notice" role="status">{notice}<button type="button" onClick={() => setNotice("")} aria-label="Zatvori poruku">×</button></div>}
        {activeModule === "members" && <div className="admin-notice" role="note">Ovaj modul trenutačno omogućuje siguran pregled i pretraživanje profila. Zaključavanje ili brisanje korisničkog računa nije aktivirano jer to mora prolaziti kroz provjereni poslužiteljski postupak, a ne samo kroz sučelje preglednika.</div>}
        {activeModule === "security" && (
          <section className="admin-security-grid">
            <article className="admin-security-card">
              <span className="admin-security-icon">✓</span><div><h2>Zaštita administracije</h2><p>Administracijska stranica provjerava vlasničku e-poštu, a osjetljive grupne i zapisničke operacije dodatno provjeravaju ovlasti u Supabaseu.</p><span className="admin-security-status">Zaštita na više razina</span></div>
            </article>
            <article className="admin-security-card">
              <span className="admin-security-icon">✓</span><div><h2>Prijave i zapisnik</h2><p>Prijave su ograničene pravilima baze. Zapisnik bilježi podržane moderatorske radnje i dostupan je samo vlasniku.</p><button type="button" className="admin-button secondary" onClick={() => setActiveModule("audit")}>Otvori zapisnik →</button></div>
            </article>
            <article className="admin-security-card warning">
              <span className="admin-security-icon">!</span><div><h2>Zaključavanje računa</h2><p>Zaključavanje i brisanje korisničkih računa još nisu aktivirani. Nećemo ih simulirati samo skrivanjem sadržaja u pregledniku; potrebna je sigurna poslužiteljska procedura i provjera pravila svih tablica.</p><span className="admin-security-status pending">Nije aktivirano</span></div>
            </article>
            <article className="admin-security-card warning">
              <span className="admin-security-icon">!</span><div><h2>Povezivanje kviza</h2><p>Kviz je uključen u aplikaciju i koristi zajednički Supabase klijent, ali testna baza trenutačno nema tablice za pitanja i rezultate ni administratorske RPC funkcije kviza. Zato ovdje još ne prikazujemo brojke niti nudimo brisanje rezultata.</p><button type="button" className="admin-button secondary" onClick={() => setActiveModule("quiz")}>Pogledaj status kviza →</button></div>
            </article>
            <article className="admin-security-card">
              <span className="admin-security-icon">i</span><div><h2>Obvezna završna provjera</h2><p>GitHub Actions provjerava izgradnju koda. Prijavu, RLS pravila, moderaciju i pristup s drugim računom potrebno je ručno testirati.</p><a className="admin-button secondary" href="https://github.com/cn-dom/cuvari-nasljeda/blob/main/docs/TESTIRANJE.md" target="_blank" rel="noreferrer">Otvori kontrolni popis →</a></div>
            </article>
          </section>
        )}
        {activeModule === "quiz" && (
          <section className="admin-table-card admin-module-status-card">
            <div className="admin-table-heading"><div><h2>PatriaSoul kviz</h2><p>Modul je pripremljen kao administracijska stavka, ali nije još povezan s podacima kviza.</p></div><span className="admin-live-mark admin-connection-warning">● ČEKA POVEZIVANJE</span></div>
            <div className="admin-security-grid">
              <article className="admin-security-card"><span className="admin-security-icon">✓</span><div><h2>Kviz sučelje</h2><p>Ugrađeni kviz nalazi se u mapi <code>/kviz/</code> i dijeli Supabase klijent sa društvenom mrežom.</p><a className="admin-button secondary" href="/kviz/">Otvori kviz →</a></div></article>
              <article className="admin-security-card warning"><span className="admin-security-icon">!</span><div><h2>Nedostaju podaci kviza</h2><p>U testnoj bazi nisu pronađene tablice <code>quiz_questions</code> i <code>quiz_results</code>, ni RPC funkcije <code>admin_dashboard_stats</code>, <code>admin_list_users</code> i <code>admin_list_quiz_results</code>.</p><span className="admin-security-status pending">Potrebna provjera baze</span></div></article>
              <article className="admin-security-card warning"><span className="admin-security-icon">!</span><div><h2>Kompatibilnost profila</h2><p>Kvizni kod očekuje polja profila poput <code>role</code> i <code>avatar_url</code>, dok društvena shema koristi drugačija polja. Prije spajanja treba uskladiti prikaz imena i ovlasti bez slabljenja RLS zaštite.</p><span className="admin-security-status pending">Nije usklađeno</span></div></article>
              <article className="admin-security-card"><span className="admin-security-icon">i</span><div><h2>Sljedeći siguran korak</h2><p>Uskladiti SQL shemu i administratorske funkcije s postojećim kviznim kodom, zatim provjeriti da samo vlasnik može pregledavati i brisati rezultate.</p><a className="admin-button secondary" href="https://github.com/cn-dom/cuvari-nasljeda/tree/main/kviz/src/lib" target="_blank" rel="noreferrer">Pregledati kvizne funkcije →</a></div></article>
            </div>
            <a className="admin-button secondary" href="https://github.com/Patriasoul/kviz" target="_blank" rel="noreferrer">Otvori izvorni repozitorij kviza →</a>
          </section>
        )}
        {activeModule === "overview" ? (
          <section className="admin-table-card">
            <div className="admin-table-heading">
              <div><h2>Stanje mreže</h2><p>Sažetak se učitava iz Supabase baze.</p></div>
              <span className={"admin-live-mark " + (dbStatus === "povezano" ? "" : "admin-connection-warning")}>{dbStatus === "povezano" ? "● POVEZANO" : dbStatus === "greska" ? "● PROVJERI BAZU" : dbStatus === "nije" ? "● NIJE POVEZANO" : "● PROVJERAVAM"}</span>
            </div>
            {busy ? <p className="admin-empty">Učitavam podatke…</p> : (
              <table className="admin-table">
                <thead><tr><th>Područje</th><th>Vrijednost</th><th>Napomena</th></tr></thead>
                <tbody>{rows.map(row => <tr key={row.id}><td><strong>{row.title}</strong></td><td className="admin-count-cell">{row.value}</td><td>{row.detail}</td></tr>)}</tbody>
              </table>
            )}
          </section>
        ) : ["members", "posts", "reports", "comments", "events", "forum", "pages", "groups", "audit"].includes(activeModule) ? (
          <section className="admin-table-card">
            <div className="admin-table-heading">
              <div><h2>{current.title}</h2><p>{rows.length} zapisa učitano · najviše 200 prikazanih</p></div>
              <div className="admin-table-tools">
                {activeModule === "reports" && <label className="admin-filter-label"><span>Status</span><select value={reportStatusFilter} onChange={event => setReportStatusFilter(event.target.value)}><option value="all">Svi statusi</option><option value="pending">Na čekanju</option><option value="reviewed">Pregledano</option><option value="dismissed">Odbačeno</option><option value="actioned">Obrađeno</option></select></label>}
                <label className="admin-search"><span>⌕</span><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Pretraži tablicu…" /></label>
              </div>
            </div>
            {error ? <p className="admin-error">{error}</p> : busy ? <p className="admin-empty">Učitavam podatke…</p> : filteredRows.length ? (
              <div className="admin-table-scroll">
                <table className="admin-table">
                  <thead><tr>{activeModule === "members" ? <><th>Član</th><th>Korisničko ime</th><th>ID računa</th><th>Registriran</th></> : activeModule === "posts" ? <><th>Objava</th><th>ID autora</th><th>Datum</th><th>Radnja</th></> : activeModule === "comments" ? <><th>Komentar</th><th>ID objave</th><th>ID autora</th><th>Datum</th><th>Radnja</th></> : activeModule === "events" ? <><th>Događaj</th><th>Mjesto</th><th>Početak</th><th>Status</th><th>Radnja</th></> : activeModule === "groups" ? <><th>Grupa</th><th>Osnivač ID</th><th>Članovi</th><th>Poruke</th><th>Osnovana</th><th>Radnje</th></> : activeModule === "reports" ? <><th>Razlog</th><th>Status</th><th>ID objave</th><th>ID prijavitelja</th><th>Zaprimljeno</th><th>Radnje</th></> : activeModule === "audit" ? <><th>Vrijeme</th><th>Radnja</th><th>Vrsta</th><th>ID zapisa</th><th>Sažetak</th><th>Vlasnik</th></> : activeModule === "forum" ? <><th>Naslov teme</th><th>Početna poruka</th><th>ID autora</th><th>Status</th><th>Datum</th></> : <><th>Stranica</th><th>Kategorija</th><th>Opis</th><th>ID osnivača</th><th>Datum</th></>}</tr></thead>
                  <tbody>
                    {filteredRows.map(row => <tr key={row.id}>
                      {activeModule === "members" ? (
                        <><td><strong>{row.display_name || "Čuvar nasljeđa"}</strong></td><td>{row.username ? "@" + row.username : "—"}</td><td><code>{row.id}</code></td><td>{dateLabel(row.created_at)}</td></>
                      ) : activeModule === "posts" ? (
                        <><td className="admin-post-body">{row.body || "Objava bez teksta"}</td><td><code>{row.author_id}</code></td><td>{dateLabel(row.created_at)}</td><td><button className="admin-row-action danger" type="button" onClick={() => deletePost(row)}>Ukloni</button></td></>
                      ) : activeModule === "comments" ? (
                        <><td className="admin-post-body">{row.body || "Komentar bez teksta"}</td><td><code>{row.post_id}</code></td><td><code>{row.author_id}</code></td><td>{dateLabel(row.created_at)}</td><td><button className="admin-row-action danger" type="button" onClick={() => deleteComment(row)}>Ukloni</button></td></>
                      ) : activeModule === "events" ? (
                        <><td><strong>{row.title}</strong>{row.description && <p className="admin-report-details">{row.description}</p>}</td><td>{row.location || "—"}</td><td>{dateLabel(row.starts_at)}</td><td><span className={"admin-status status-" + row.status}>{row.status === "published" ? "Objavljeno" : "Otkazano"}</span></td><td>{row.status === "published" ? <button className="admin-row-action danger" type="button" onClick={() => cancelEvent(row)}>Otkazati</button> : "—"}</td></>
                      ) : activeModule === "groups" ? (
                        <><td><strong>{row.name}</strong><small className="admin-report-details">{row.id}</small></td><td><code>{row.created_by || "—"}</code></td><td className="admin-count-cell">{row.member_count ?? 0}</td><td className="admin-count-cell">{row.message_count ?? 0}</td><td>{dateLabel(row.created_at)}</td></>
                      ) : activeModule === "audit" ? (
                        <><td>{dateLabel(row.created_at)}</td><td><span className="admin-status">{({ post_deleted: "Objava uklonjena", comment_deleted: "Komentar uklonjen", event_cancelled: "Događaj otkazan", report_status_changed: "Status prijave", reported_post_deleted: "Obrada prijave", group_member_removed: "Uklonjen član grupe" })[row.action] || row.action}</span></td><td>{row.entity_type}</td><td><code>{row.entity_id}</code></td><td className="admin-post-body">{row.summary}</td><td><code>{row.actor_id || "—"}</code></td></>
                      ) : activeModule === "reports" ? (
                        <><td><strong>{row.reason || "Drugi razlog"}</strong>{row.details && <p className="admin-report-details">{row.details}</p>}</td><td><span className={"admin-status status-" + row.status}>{({ pending: "Na čekanju", reviewed: "Pregledano", dismissed: "Odbijeno", actioned: "Obrađeno" })[row.status] || row.status}</span></td><td><code>{row.post_id || "—"}</code></td><td><code>{row.reporter_id || "—"}</code></td><td>{dateLabel(row.created_at)}</td><td><div className="admin-row-actions"><button className="admin-row-action" type="button" disabled={row.status === "reviewed" || row.status === "actioned"} onClick={() => setReportStatus(row, "reviewed")}>Pregledano</button><button className="admin-row-action" type="button" disabled={row.status === "dismissed" || row.status === "actioned"} onClick={() => setReportStatus(row, "dismissed")}>Odbaci</button>{row.post_id && <button className="admin-row-action danger" type="button" onClick={() => deleteReportedPost(row)}>Ukloni objavu</button>}</div></td></>
                      ) : activeModule === "forum" ? (
                        <><td><strong>{row.title}</strong></td><td className="admin-post-body">{row.body}</td><td><code>{row.user_id}</code></td><td><span className={"admin-status status-" + row.status}>{row.status === "published" ? "Objavljeno" : row.status}</span></td><td>{dateLabel(row.created_at)}</td></>
                      ) : (
                        <><td><strong>{row.name}</strong><small className="admin-report-details">/{row.slug}</small></td><td>{row.category}</td><td className="admin-post-body">{row.description || "—"}</td><td><code>{row.created_by}</code></td><td>{dateLabel(row.created_at)}</td></>
                      )}
                    </tr>)}
                  </tbody>
                </table>
              </div>
            ) : <p className="admin-empty">Nema zapisa za prikaz u ovoj tablici.</p>}
          </section>
        ) : (
          <section className="admin-table-card admin-module-placeholder">
            <span className="admin-placeholder-icon">{current.icon}</span>
            <h2>Modul je predviđen, ali još nije aktiviran</h2>
            <p>Ovaj dio ostaje u istoj administracijskoj strukturi. Prije uključivanja povezujemo ga s odgovarajućim tablicama i pravilima pristupa kako bi svaka radnja bila stvarna i sigurna.</p>
            <div className="admin-placeholder-meta"><span>STATUS</span><strong>U pripremi</strong></div>
            <button type="button" className="admin-button secondary" onClick={() => setActiveModule("overview")}>← Natrag na pregled</button>
          </section>
        )}
        {activeModule === "groups" && selectedGroup && (
          <div className="admin-modal-backdrop" role="presentation" onClick={(event) => { if (event.target === event.currentTarget) setSelectedGroup(null); }}>
            <section className="admin-table-card admin-group-members-modal" role="dialog" aria-modal="true" aria-labelledby="admin-group-members-title">
              <div className="admin-table-heading">
                <div><h2 id="admin-group-members-title">Članovi grupe: {selectedGroup.name}</h2><p>{groupMembers.length} članova · uvid vlasnika</p></div>
                <button className="admin-button secondary" type="button" onClick={() => setSelectedGroup(null)}>Zatvori</button>
              </div>
              {groupMembersBusy ? <p className="admin-empty">Učitavam članove…</p> : groupMembersError ? <p className="admin-error">{groupMembersError}</p> : groupMembers.length ? (
                <div className="admin-table-scroll"><table className="admin-table"><thead><tr><th>Član</th><th>Korisničko ime</th><th>ID računa</th><th>Uloga</th><th>Pridružio se</th><th>Radnja</th></tr></thead><tbody>
                  {groupMembers.map(member => <tr key={member.user_id}><td><strong>{member.display_name || "Čuvar nasljeđa"}</strong></td><td>{member.username ? "@" + member.username : "—"}</td><td><code>{member.user_id}</code></td><td><span className="admin-status">{member.role || "član"}</span></td><td>{dateLabel(member.joined_at)}</td><td>{member.role === "admin" || member.user_id === selectedGroup.created_by ? <span className="admin-report-details">Zaštićen račun</span> : <button className="admin-row-action danger" type="button" onClick={() => removeGroupMember(member)}>Ukloni iz grupe</button>}</td></tr>)}
                </tbody></table></div>
              ) : <p className="admin-empty">Ova grupa trenutačno nema članova.</p>}
            </section>
          </div>
        )}
        <footer className="admin-workspace-footer"><span>PatriaSoul · Čuvari nasljeđa</span><span>Vlasnički pristup · Aktivna sesija</span></footer>
      </section>
    </div>
  </main>;
}
