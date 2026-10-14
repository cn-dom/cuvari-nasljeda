import { useCallback, useEffect, useMemo, useState } from "react";
import "./FloatingGlobalChat.css";

const MAX_MESSAGE_LENGTH = 1500;

function initialsFor(profile) {
  const label = profile?.display_name || profile?.username || "Čuvar nasljeđa";
  return label.split(/\s+/).slice(0, 2).map((part) => part[0] || "").join("").toLocaleUpperCase("hr") || "ČN";
}

export default function FloatingGlobalChat({ supabase, session, onLoginRequest }) {
  const [open, setOpen] = useState(false);
  const [muted, setMuted] = useState(false);
  const [settingsReady, setSettingsReady] = useState(false);
  const [messages, setMessages] = useState([]);
  const [profiles, setProfiles] = useState({});
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState("");
  const [friendRequests, setFriendRequests] = useState([]);
  const [isModerator, setIsModerator] = useState(false);
  const [adminReportsOpen, setAdminReportsOpen] = useState(false);
  const [adminReports, setAdminReports] = useState([]);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [reportingId, setReportingId] = useState("");
  const [reportReason, setReportReason] = useState("spam");
  const [reportDetails, setReportDetails] = useState("");
  const userId = session?.user?.id || "";

  useEffect(() => {
    let cancelled = false;
    async function checkModerator() {
      if (!supabase || !userId) { setIsModerator(false); return; }
      const email = String(session?.user?.email || "").toLowerCase();
      if (email === "patriasoul@protonmail.com") { setIsModerator(true); return; }
      const { data } = await supabase.from("profiles").select("role").eq("id", userId).maybeSingle();
      if (!cancelled) setIsModerator(data?.role === "admin");
    }
    checkModerator();
    return () => { cancelled = true; };
  }, [supabase, userId, session?.user?.email]);

  const loadMessages = useCallback(async () => {
    if (!supabase || !userId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("community_global_chat_messages")
      .select("id, sender_id, body, created_at, edited_at")
      .order("created_at", { ascending: false })
      .limit(80);
    if (error) {
      setNotice(error.code === "42P01" || error.code === "PGRST205"
        ? "Zajednički chat čeka aktivaciju baze. Potrebno je primijeniti migraciju community_global_chat."
        : "Poruke se trenutačno ne mogu učitati. Provjeri pristup chatu.");
      setLoading(false);
      return;
    }
    const rows = (data || []).reverse();
    setMessages(rows);
    const ids = [...new Set(rows.map((row) => row.sender_id))];
    if (ids.length) {
      const { data: memberRows } = await supabase.from("profiles")
        .select("id, display_name, username, avatar_url")
        .in("id", ids);
      const nextProfiles = {};
      (memberRows || []).forEach((profile) => { nextProfiles[profile.id] = profile; });
      setProfiles((current) => ({ ...current, ...nextProfiles }));
    }
    setLoading(false);
  }, [supabase, userId]);

  const loadFriendRequests = useCallback(async () => {
    if (!supabase || !userId) return;
    const { data } = await supabase.from("community_friend_requests")
      .select("id, sender_id, recipient_id, status, created_at")
      .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
      .order("created_at", { ascending: false }).limit(100);
    setFriendRequests(data || []);
    const ids = [...new Set((data || []).flatMap((row) => [row.sender_id, row.recipient_id]))];
    if (ids.length) {
      const { data: memberRows } = await supabase.from("profiles")
        .select("id, display_name, username, avatar_url").in("id", ids);
      const nextProfiles = {};
      (memberRows || []).forEach((profile) => { nextProfiles[profile.id] = profile; });
      setProfiles((current) => ({ ...current, ...nextProfiles }));
    }
  }, [supabase, userId]);

  useEffect(() => {
    if (!supabase || !userId) {
      setMessages([]);
      setFriendRequests([]);
      setSettingsReady(false);
      return undefined;
    }
    let alive = true;
    async function loadPreferences() {
      const { data, error } = await supabase.from("community_chat_preferences")
        .select("muted").eq("user_id", userId).maybeSingle();
      if (alive) {
        if (!error && data) setMuted(Boolean(data.muted));
        setSettingsReady(true);
      }
    }
    loadPreferences();
    loadMessages();
    loadFriendRequests();
    const channel = supabase.channel("community-global-chat-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "community_global_chat_messages" }, () => {
        if (alive) loadMessages();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "community_friend_requests" }, () => {
        if (alive) loadFriendRequests();
      })
      .subscribe();
    return () => {
      alive = false;
      supabase.removeChannel(channel);
    };
  }, [supabase, userId, loadMessages, loadFriendRequests]);

  const unreadCount = useMemo(() => {
    if (!messages.length || !userId) return 0;
    const lastRead = Number(sessionStorage.getItem("ps-global-chat-last-read") || 0);
    return messages.filter((message) => message.sender_id !== userId && new Date(message.created_at).getTime() > lastRead).length;
  }, [messages, userId, open]);

  useEffect(() => {
    if (open && userId) sessionStorage.setItem("ps-global-chat-last-read", String(Date.now()));
  }, [open, userId, messages.length]);

  async function toggleMuted() {
    if (!supabase || !userId || !settingsReady || busy) return;
    const nextMuted = !muted;
    setBusy(true);
    const { error } = await supabase.from("community_chat_preferences").upsert({
      user_id: userId, muted: nextMuted, updated_at: new Date().toISOString(),
    }, { onConflict: "user_id" });
    if (error) setNotice("Postavku utišavanja nije moguće spremiti. Provjeri migraciju community_global_chat.");
    else {
      setMuted(nextMuted);
      setNotice(nextMuted ? "Domoljubni chat je utišan. Možeš ga otvoriti kad god želiš." : "Domoljubni chat ponovno je aktivan.");
    }
    setBusy(false);
  }

  async function sendMessage(event) {
    event.preventDefault();
    const body = draft.trim();
    if (!body || body.length > MAX_MESSAGE_LENGTH || busy) return;
    if (!userId) { onLoginRequest?.(); return; }
    setBusy(true);
    const { error } = await supabase.from("community_global_chat_messages").insert({ sender_id: userId, body });
    if (error) setNotice("Poruka nije poslana. Pokušaj ponovno za trenutak.");
    else setDraft("");
    setBusy(false);
  }

  async function sendFriendRequest(message) {
    if (!userId) { onLoginRequest?.(); return; }
    if (message.sender_id === userId) return;
    const prior = friendRequests.find((row) =>
      (row.sender_id === userId && row.recipient_id === message.sender_id) ||
      (row.sender_id === message.sender_id && row.recipient_id === userId));
    if (prior?.status === "accepted") { setNotice("Već ste prijatelji."); return; }
    if (prior?.status === "pending") { setNotice(prior.sender_id === userId ? "Zahtjev za prijateljstvo već je poslan." : "Ovaj član ti je već poslao zahtjev."); return; }
    setBusy(true);
    const { error } = await supabase.from("community_friend_requests").insert({ sender_id: userId, recipient_id: message.sender_id });
    if (error) setNotice(error.code === "23505" ? "Zahtjev za prijateljstvo već postoji." : "Zahtjev nije poslan. Pokušaj ponovno.");
    else {
      setNotice("Zahtjev za prijateljstvo je poslan.");
      loadFriendRequests();
    }
    setBusy(false);
  }

  async function respondToFriendRequest(request, status) {
    setBusy(true);
    const { error } = await supabase.from("community_friend_requests").update({ status }).eq("id", request.id);
    if (error) setNotice("Zahtjev nije moguće ažurirati. Provjeri prava pristupa.");
    else {
      setNotice(status === "accepted" ? "Zahtjev prihvaćen. Sada ste prijatelji." : "Zahtjev je odbijen.");
      loadFriendRequests();
    }
    setBusy(false);
  }

  async function reportMessage(event, message) {
    event.preventDefault();
    if (!userId) { onLoginRequest?.(); return; }
    setReportingId(message.id + ":sending");
    const { error } = await supabase.from("community_global_chat_reports").insert({
      message_id: message.id,
      reporter_id: userId,
      reason: reportReason,
      details: reportDetails.trim().slice(0, 500) || null,
    });
    setNotice(error ? (error.code === "23505" ? "Ovu si poruku već prijavio." : "Prijavu nije moguće poslati.") : "Hvala. Poruka je prijavljena moderatorima.");
    setReportingId("");
    setReportDetails("");
    setReportReason("spam");
  }

  const pendingIncoming = friendRequests.filter((row) => row.recipient_id === userId && row.status === "pending");

  async function loadAdminReports() {
    if (!supabase || !userId || !isModerator) return;
    setReportsLoading(true);
    const { data, error } = await supabase
      .from("community_global_chat_reports")
      .select("id, message_id, reporter_id, reason, details, status, created_at, message:community_global_chat_messages(body, sender_id, created_at)")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) setNotice("Prijave se ne mogu učitati. Provjeri administratorska prava i migraciju.");
    else setAdminReports(data || []);
    setReportsLoading(false);
  }

  async function updateReportStatus(report, status) {
    if (!isModerator || busy) return;
    setBusy(true);
    const { error } = await supabase.from("community_global_chat_reports")
      .update({ status }).eq("id", report.id);
    if (error) setNotice("Status prijave nije moguće spremiti.");
    else {
      setAdminReports((current) => current.map((item) => item.id === report.id ? { ...item, status } : item));
      setNotice("Status prijave ažuriran.");
    }
    setBusy(false);
  }

  return (
    <div className="floating-global-chat-root">
      {open && (
        <section className="floating-global-chat-panel" aria-label="Domoljubni chat">
          <header className="fgc-header">
            <div className="fgc-brand-icon"><img src="/assets/images/logo%20Patriasoul.png" alt="PatriaSoul" /></div>
            <div className="fgc-heading">
              <strong>Domoljubni chat</strong>
              <span><i className={muted ? "fgc-status-dot muted" : "fgc-status-dot"} />{muted ? "Utišan na ovom računu" : "Zajednički razgovor članova"}</span>
            </div>
            <button type="button" className="fgc-icon-button" onClick={() => setOpen(false)} aria-label="Minimiziraj chat">−</button>
          </header>
          {!userId ? (
            <div className="fgc-login-state"><span>✦</span><h3>Razgovor zajednice</h3><p>Prijavi se kako bi se pridružio razgovoru s ostalim Čuvarima nasljeđa.</p><button type="button" onClick={onLoginRequest}>Prijava / Registracija</button></div>
          ) : (
            <>
              <div className="fgc-toolbar">
                <span><i className={muted ? "fgc-status-dot muted" : "fgc-status-dot"} />{muted ? "Obavijesti utišane" : "Chat aktivan"}</span>
                {isModerator && <button type="button" onClick={() => {
                  const nextOpen = !adminReportsOpen;
                  setAdminReportsOpen(nextOpen);
                  if (nextOpen) loadAdminReports();
                }}>{adminReportsOpen ? "Natrag na chat" : "Prijave poruka"}</button>}
                {!adminReportsOpen && <button type="button" onClick={toggleMuted} disabled={busy || !settingsReady}>{muted ? "Uključi chat" : "Utišaj chat"}</button>}
              </div>
              {pendingIncoming.length > 0 && <div className="fgc-requests"><strong>Zahtjevi za prijateljstvo · {pendingIncoming.length}</strong>{pendingIncoming.slice(0, 3).map((request) => {
                const sender = profiles[request.sender_id];
                return <div className="fgc-request-row" key={request.id}><span>{sender?.display_name || sender?.username || "Čuvar nasljeđa"}</span><button type="button" disabled={busy} onClick={() => respondToFriendRequest(request, "accepted")}>Prihvati</button><button type="button" className="quiet" disabled={busy} onClick={() => respondToFriendRequest(request, "declined")}>Odbij</button></div>;
              })}</div>}
              {adminReportsOpen && isModerator ? (
                <section className="fgc-admin-reports" aria-label="Administratorski pregled prijava poruka">
                  <div className="fgc-admin-reports-heading"><strong>Prijave poruka</strong><button type="button" onClick={loadAdminReports} disabled={reportsLoading}>Osvježi</button></div>
                  {reportsLoading ? <p className="fgc-empty">Učitavam prijave…</p> : adminReports.length ? adminReports.map((report) => (
                    <article className="fgc-admin-report" key={report.id}>
                      <div className="fgc-admin-report-top"><strong>{report.reason}</strong><span>{report.status}</span></div>
                      <p>{report.message?.body || "Izvorna poruka više nije dostupna."}</p>
                      {report.details && <small>Napomena: {report.details}</small>}
                      <small>Prijavljeno: {new Date(report.created_at).toLocaleString("hr-HR")}</small>
                      <div className="fgc-admin-report-actions">
                        {report.status !== "reviewing" && <button type="button" disabled={busy} onClick={() => updateReportStatus(report, "reviewing")}>U obradi</button>}
                        {report.status !== "resolved" && <button type="button" disabled={busy} onClick={() => updateReportStatus(report, "resolved")}>Riješeno</button>}
                        {report.status !== "dismissed" && <button type="button" className="quiet" disabled={busy} onClick={() => updateReportStatus(report, "dismissed")}>Odbaci</button>}
                        {report.status !== "open" && <button type="button" className="quiet" disabled={busy} onClick={() => updateReportStatus(report, "open")}>Ponovno otvori</button>}
                      </div>
                    </article>
                  )) : <p className="fgc-empty">Trenutačno nema prijava poruka.</p>}
                </section>
              ) : <>
              <div className="fgc-messages" role="log" aria-live="polite" aria-label="Poruke Domoljubnog chata">
                {loading && !messages.length ? <p className="fgc-empty">Učitavam razgovor…</p> : messages.length ? messages.map((message) => {
                  const author = profiles[message.sender_id] || {};
                  const own = message.sender_id === userId;
                  const request = friendRequests.find((row) =>
                    (row.sender_id === userId && row.recipient_id === message.sender_id) ||
                    (row.sender_id === message.sender_id && row.recipient_id === userId));
                  const actionLabel = request?.status === "accepted" ? "Prijatelji" : request?.status === "pending" ? (request.sender_id === userId ? "Zahtjev poslan" : "Odgovori na zahtjev") : "Dodaj prijatelja";
                  return <article className={own ? "fgc-message own" : "fgc-message"} key={message.id}>
                    {!own && <div className="fgc-avatar">{author.avatar_url ? <img src={author.avatar_url} alt="" /> : initialsFor(author)}</div>}
                    <div className="fgc-message-body">
                      <div className="fgc-message-author"><strong>{own ? "Ti" : author.display_name || author.username || "Čuvar nasljeđa"}</strong><time>{new Date(message.created_at).toLocaleTimeString("hr-HR", { hour: "2-digit", minute: "2-digit" })}</time></div>
                      <p>{message.body}</p>
                      {!own && <div className="fgc-message-actions">
                        {request?.status === "pending" && request.recipient_id === userId ? <button type="button" onClick={() => setNotice("Zahtjev možeš prihvatiti u gornjem dijelu chata.")}>Zahtjev primljen</button> : <button type="button" disabled={busy || request?.status === "accepted" || (request?.status === "pending" && request.sender_id === userId)} onClick={() => sendFriendRequest(message)}>{actionLabel}</button>}
                        <button type="button" className="quiet" disabled={reportingId === message.id + ":sending"} onClick={() => { setReportingId((current) => current === message.id ? "" : message.id); setReportReason("spam"); setReportDetails(""); }}>Prijavi</button>
                      </div>}
                      {reportingId === message.id && <form className="fgc-report-form" onSubmit={(event) => reportMessage(event, message)}>
                        <label htmlFor={"fgc-report-reason-" + message.id}>Razlog prijave</label>
                        <select id={"fgc-report-reason-" + message.id} value={reportReason} onChange={(event) => setReportReason(event.target.value)}>
                          <option value="spam">Spam ili oglašavanje</option><option value="insult">Uvreda ili uznemiravanje</option><option value="threat">Prijetnja</option><option value="hate">Govor mržnje</option><option value="other">Drugo</option>
                        </select>
                        <textarea value={reportDetails} onChange={(event) => setReportDetails(event.target.value)} maxLength={500} rows={2} placeholder="Dodatno objašnjenje (nije obavezno)" />
                        <div><button type="button" className="quiet" onClick={() => setReportingId("")}>Odustani</button><button type="submit" disabled={reportingId === message.id + ":sending"}>Pošalji prijavu</button></div>
                      </form>}
                    </div>
                  </article>;
                }) : <p className="fgc-empty">Još nema poruka. Pozdravi zajednicu i započni razgovor.</p>}
              </div>
              {notice && <div className="fgc-notice" role="status"><span>{notice}</span><button type="button" onClick={() => setNotice("")} aria-label="Zatvori obavijest">×</button></div>}
              <form className="fgc-compose" onSubmit={sendMessage}>
                <label className="sr-only" htmlFor="fgc-draft">Napiši poruku u Domoljubni chat</label>
                <textarea id="fgc-draft" value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Napiši poruku zajednici…" maxLength={MAX_MESSAGE_LENGTH} rows={2} />
                <div className="fgc-compose-bottom"><small>{draft.length}/{MAX_MESSAGE_LENGTH}</small><button type="submit" disabled={busy || !draft.trim()}>Pošalji <span>↗</span></button></div>
              </form>
              </>}
            </>
          )}
        </section>
      )}
      <button type="button" className={muted ? "fgc-launcher muted" : "fgc-launcher"} onClick={() => { if (!userId) { onLoginRequest?.(); return; } setOpen((value) => !value); }} aria-expanded={open} aria-label={open ? "Zatvori Domoljubni chat" : "Otvori Domoljubni chat"} title={muted ? "Domoljubni chat · utišan" : "Domoljubni chat · aktivan"}>
        <span className="fgc-launcher-icon"><img src="/assets/images/logo%20Patriasoul.png" alt="" /></span><span className="fgc-launcher-copy"><strong>Domoljubni chat</strong><small>{muted ? "Utišan" : "Zajedno smo jači"}</small></span><i className={muted ? "fgc-status-dot muted" : "fgc-status-dot"} aria-label={muted ? "Chat je utišan" : "Chat je aktivan"} />
        {unreadCount > 0 && !open && <b className="fgc-unread">{unreadCount > 99 ? "99+" : unreadCount}</b>}
      </button>
    </div>
  );
}
