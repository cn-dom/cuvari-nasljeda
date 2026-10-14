import { useEffect, useMemo, useRef, useState } from "react";
import { isSupabaseConfigured, supabase } from "./lib/supabase.js";
import { Picker } from "emoji-mart";
import FloatingGlobalChat from "./FloatingGlobalChat.jsx";
import emojiData from "@emoji-mart/data";

const navItems = [
  { icon: "⌂", label: "PatriaSoul" },
  { icon: "🧠", label: "Kviz" },
  { icon: "▤", label: "Forum" },
  { icon: "▣", label: "Stranice" },
  { icon: "👥", label: "Čuvari nasljeđa" },
  { icon: "▦", label: "Grupe" },
  { icon: "▣", label: "Događaji" },
  { icon: "✉", label: "Poruke" },
  { icon: "🔔", label: "Obavijesti" },
];

const OWNER_EMAIL = "patriasoul@protonmail.com";
const normalizeUsername = (value) => String(value || "").trim().replace(/^@/, "").toLowerCase();

function BrandMark() {
  return <img className="brand-mark" src="/assets/images/1000000982.png" alt="" aria-hidden="true" />;
}

function Avatar({ initials, variant = "", src = "" }) {
  return <div className={`avatar ${variant}`}>
    {src ? <img src={src} alt="" loading="lazy" onError={(event) => { event.currentTarget.parentElement.textContent = initials; }} /> : initials}
  </div>;
}

function WeatherSidebar() {
  const [weather, setWeather] = useState({ loading: true, temp: null, code: null, city: "Zagreb" });
  useEffect(() => {
    let cancelled = false;
    async function loadWeather() {
      try {
        const response = await fetch("https://api.open-meteo.com/v1/forecast?latitude=45.815&longitude=15.982&current=temperature_2m,weather_code&timezone=Europe%2FZagreb", { cache: "no-store" });
        if (!response.ok) throw new Error("Weather request failed");
        const data = await response.json();
        if (!cancelled) setWeather({ loading: false, temp: Math.round(data.current.temperature_2m), code: data.current.weather_code, city: "Zagreb" });
      } catch {
        if (!cancelled) setWeather({ loading: false, temp: null, code: null, city: "Zagreb" });
      }
    }
    loadWeather();
    return () => { cancelled = true; };
  }, []);
  const descriptions = {0:"Vedro",1:"Pretežno vedro",2:"Djelomično oblačno",3:"Oblačno",45:"Magla",48:"Magla",51:"Rosulja",53:"Rosulja",55:"Jaka rosulja",61:"Slaba kiša",63:"Kiša",65:"Jaka kiša",71:"Slab snijeg",73:"Snijeg",75:"Jak snijeg",80:"Pljuskovi",81:"Pljuskovi",82:"Jaki pljuskovi",95:"Grmljavina",96:"Grmljavina i tuča",99:"Jaka grmljavina i tuča"};
  const symbols = {0:"☀️",1:"🌤️",2:"⛅",3:"☁️",45:"🌫️",48:"🌫️",51:"🌦️",53:"🌦️",55:"🌧️",61:"🌦️",63:"🌧️",65:"🌧️",71:"🌨️",73:"❄️",75:"❄️",80:"🌦️",81:"🌧️",82:"⛈️",95:"⛈️",96:"⛈️",99:"⛈️"};
  return <section className="right-card card weather-sidebar-card">
    <div className="right-card-title"><h3>VRIJEME U HRVATSKOJ</h3><span>☀</span></div>
    <div className="weather-sidebar-main">
      <span className="weather-sidebar-symbol" aria-hidden="true">{weather.loading ? "…" : (symbols[weather.code] || "🌦️")}</span>
      <div><strong>{weather.temp === null ? (weather.loading ? "Učitavanje…" : "Podaci nedostupni") : `${weather.temp}°C`}</strong><small>{weather.city} · {weather.loading ? "Dohvaćam prognozu" : (descriptions[weather.code] || "Trenutačni uvjeti")}</small></div>
    </div>
    <a className="weather-sidebar-link" href="/vrijeme.html">Cijela prognoza <span aria-hidden="true">→</span></a>
    <small className="weather-sidebar-source">Podaci: Open-Meteo</small>
  </section>;
}

function FaithSidebar() {
  const dailyWords = [
    { verse: "Bog je ljubav.", reference: "1 Iv 4, 8", reflection: "Ljubav se vidi u strpljenju, pažnji i djelima kojima drugome olakšamo dan." },
    { verse: "Gospodin je pastir moj: ni u čem ja ne oskudijevam.", reference: "Ps 23, 1", reflection: "Kad ne znamo kojim putem krenuti, zastanimo, pomolimo se i učinimo sljedeći dobar korak." },
    { verse: "Blago mirotvorcima: oni će se sinovima Božjim zvati.", reference: "Mt 5, 9", reflection: "Mir počinje u načinu na koji slušamo, govorimo i rješavamo nesporazume." },
    { verse: "Ne boj se, jer ja sam s tobom.", reference: "Iz 41, 10", reflection: "Hrabrost ne znači da nemamo straha, nego da u teškoći ne odustanemo od dobra." },
    { verse: "Sve mogu u Onome koji me jača.", reference: "Fil 4, 13", reflection: "Snagu tražimo za vjernost, strpljivost i ljubav, čak i kad okolnosti nisu lake." },
    { verse: "Budite jedni drugima dobrostivi, milosrdni.", reference: "Ef 4, 32", reflection: "Dobrota se često sastoji od malih djela koja nitko ne vidi, ali nekome mnogo znače." },
    { verse: "Uvijek se radujte! Bez prestanka molite!", reference: "1 Sol 5, 16–17", reflection: "Kratka molitva usred svakodnevnih obveza može nas vratiti zahvalnosti i miru." },
  ];
  const today = new Date();
  const dayNumber = Math.floor(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()) / 86400000);
  const word = dailyWords[((dayNumber % dailyWords.length) + dailyWords.length) % dailyWords.length];
  return <section className="right-card card faith-sidebar-card">
    <div className="right-card-title"><h3>VJERA HRVATA</h3><span aria-hidden="true">✦</span></div>
    <div className="faith-sidebar-date">{today.toLocaleDateString("hr-HR", { weekday: "long", day: "numeric", month: "long" })}</div>
    <div className="faith-sidebar-verse">„{word.verse}”</div>
    <div className="faith-sidebar-reference">{word.reference}</div>
    <p className="faith-sidebar-reflection">{word.reflection}</p>
    <a className="faith-sidebar-link" href="/vjera-hrvata.html">Dnevna vjera i molitve <span aria-hidden="true">→</span></a>
    <small className="faith-sidebar-source">Biblijska misao i razmatranje; liturgijska čitanja provjeri u izvorima.</small>
  </section>;
}

function App() {
  const [posts, setPosts] = useState([]);
  const [draft, setDraft] = useState("");
  const [communityActionTitle, setCommunityActionTitle] = useState("");
  const [communityActionDetails, setCommunityActionDetails] = useState("");
  const [communityActionCategory, setCommunityActionCategory] = useState("Savjet i preporuka");
  const [communityActionLocation, setCommunityActionLocation] = useState("");
  const [communityActionAds, setCommunityActionAds] = useState([]);
  const [communityActionLoading, setCommunityActionLoading] = useState(false);
  const [communityActionBusy, setCommunityActionBusy] = useState(false);
  const [communityHelpReportAd, setCommunityHelpReportAd] = useState(null);
  const [communityHelpReportReason, setCommunityHelpReportReason] = useState("spam");
  const [communityHelpReportDetails, setCommunityHelpReportDetails] = useState("");
  const [communityHelpReportBusy, setCommunityHelpReportBusy] = useState(false);
  const [communityHelpAdReports, setCommunityHelpAdReports] = useState([]);
  const [communityHelpAdReportsLoading, setCommunityHelpAdReportsLoading] = useState(false);
  const communityActionPage = new URLSearchParams(window.location.search).get("zajedno");
  const [activeNav, setActiveNav] = useState("PatriaSoul");
  const [liked, setLiked] = useState([]);
  const [reactionsByPost, setReactionsByPost] = useState({});
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const emojiPickerHost = useRef(null);
  const [notice, setNotice] = useState("");
  const [brandImageOpen, setBrandImageOpen] = useState(false);
  const [feedFilter, setFeedFilter] = useState("Sve objave");
  const [feedSearch, setFeedSearch] = useState("");
  const [shareMenuPostId, setShareMenuPostId] = useState(null);
  const [openComments, setOpenComments] = useState([]);
  const [commentsByPost, setCommentsByPost] = useState({});
  const [commentDrafts, setCommentDrafts] = useState({});
  const [editingPostId, setEditingPostId] = useState(null);
  const [editDraft, setEditDraft] = useState("");
  const [memberPickerOpen, setMemberPickerOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");
  const [selectedImageFile, setSelectedImageFile] = useState(null);
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
  const [profileAvatarUrl, setProfileAvatarUrl] = useState("");
  const [profileBusy, setProfileBusy] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");
  const [reportPost, setReportPost] = useState(null);
  const [reportReason, setReportReason] = useState("spam");
  const [reportDetails, setReportDetails] = useState("");
  const [reportBusy, setReportBusy] = useState(false);
  const [blockedMembers, setBlockedMembers] = useState([]);
  const [feedRefreshKey, setFeedRefreshKey] = useState(0);
  const [blockBusyId, setBlockBusyId] = useState(null);
  const [memberDirectory, setMemberDirectory] = useState([]);
  const [memberDirectoryQuery, setMemberDirectoryQuery] = useState("");
  const [memberDirectoryBusy, setMemberDirectoryBusy] = useState(false);
  const [memberPresence, setMemberPresence] = useState([]);
  const [showActivity, setShowActivity] = useState(true);
  const [presenceBusy, setPresenceBusy] = useState(false);
  const [mentionMembers, setMentionMembers] = useState([]);
  const [mentionBusy, setMentionBusy] = useState(false);
  const [messages, setMessages] = useState([]);
  const [messageReactions, setMessageReactions] = useState([]);
  const [groupChats, setGroupChats] = useState([]);
  const [activeGroupId, setActiveGroupId] = useState("");
  const [groupMessages, setGroupMessages] = useState([]);
  const [groupMessageReactions, setGroupMessageReactions] = useState([]);
  const [groupMessageReads, setGroupMessageReads] = useState([]);
  const [groupUnreadCounts, setGroupUnreadCounts] = useState({});
  const [groupReactionBusy, setGroupReactionBusy] = useState("");
  const [groupDraftName, setGroupDraftName] = useState("");
  const [groupSelectedMembers, setGroupSelectedMembers] = useState([]);
  const [groupMessageDraft, setGroupMessageDraft] = useState("");
  const [replyingToGroupMessage, setReplyingToGroupMessage] = useState(null);
  const [groupEditingMessageId, setGroupEditingMessageId] = useState(null);
  const [groupMessageEditDraft, setGroupMessageEditDraft] = useState("");
  const [groupMessageActionBusyId, setGroupMessageActionBusyId] = useState(null);
  const [groupBusy, setGroupBusy] = useState(false);
  const [groupNameDraft, setGroupNameDraft] = useState("");
  const [groupMemberToAdd, setGroupMemberToAdd] = useState("");
  const [messageRecipient, setMessageRecipient] = useState("");
  const [messageSearch, setMessageSearch] = useState("");
  const [messageDraft, setMessageDraft] = useState("");
  const [replyingToMessage, setReplyingToMessage] = useState(null);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [messageEditDraft, setMessageEditDraft] = useState("");
  const [messageActionBusyId, setMessageActionBusyId] = useState(null);
  const [messagesBusy, setMessagesBusy] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationsBusy, setNotificationsBusy] = useState(false);
  const [adminReports, setAdminReports] = useState([]);
  const [adminBusy, setAdminBusy] = useState(false);
  const [adminError, setAdminError] = useState("");
  const isOwner = (session?.user?.email || "").trim().toLowerCase() === OWNER_EMAIL;

  function navigateToSection(label) {
    if (!session?.user?.id && label !== "PatriaSoul") {
      setAuthMode("login");
      setAuthMessage("Prijavi se ili izradi račun kako bi pristupio/la sadržaju zajednice.");
      setAuthOpen(true);
      return;
    }
    setActiveNav(label);
  }

  useEffect(() => {
    if (!["trebam-pomoc", "pruzi-ruku"].includes(communityActionPage)) return undefined;
    let cancelled = false;
    async function loadCommunityActionAds() {
      setCommunityActionLoading(true);
      if (!supabase) {
        if (!cancelled) { setCommunityActionAds([]); setCommunityActionLoading(false); }
        return;
      }
      const adType = communityActionPage === "trebam-pomoc" ? "seeking" : "offering";
      const { data, error } = await supabase
        .from("community_help_ads")
        .select("id, author_id, ad_type, title, description, category, location, status, created_at")
        .eq("ad_type", adType)
        .or(session?.user?.id ? `status.eq.open,author_id.eq.${session.user.id}` : "status.eq.open")
        .order("created_at", { ascending: false })
        .limit(50);
      if (!cancelled) {
        setCommunityActionAds(error ? [] : (data || []));
        setCommunityActionLoading(false);
        if (error) setNotice("Oglasnik se ne može učitati. Provjeri je li migracija community_help_ad_board_and_reports primijenjena u Supabaseu.");
      }
      if (isOwner && !cancelled) {
        setCommunityHelpAdReportsLoading(true);
        const { data: reportRows, error: reportError } = await supabase
          .from("community_help_ad_reports")
          .select("id, ad_id, reporter_id, reason, details, status, created_at, community_help_ads(title, ad_type, author_id)")
          .order("created_at", { ascending: false })
          .limit(100);
        if (!cancelled) {
          setCommunityHelpAdReports(error || reportError ? [] : (reportRows || []));
          setCommunityHelpAdReportsLoading(false);
          if (reportError) setNotice("Prijave oglasa nisu dostupne vlasniku. Provjeri RLS pravila za community_help_ad_reports.");
        }
      }
    }
    loadCommunityActionAds();
    return () => { cancelled = true; };
  }, [communityActionPage, isOwner, session?.user?.id]);

  useEffect(() => {
    if (!emojiPickerOpen || !emojiPickerHost.current) return undefined;
    const picker = new Picker({
      data: emojiData,
      theme: "light",
      set: "native",
      locale: "en",
      categories: ["frequent", "people", "nature", "foods", "activity", "places", "objects", "symbols", "flags"],
      previewPosition: "none",
      navPosition: "top",
      searchPosition: "sticky",
      perLine: 8,
      dynamicWidth: true,
      onEmojiSelect: (emoji) => {
        if (emoji?.native) setDraft((value) => value + emoji.native);
        setEmojiPickerOpen(false);
      },
      onClickOutside: () => setEmojiPickerOpen(false),
    });
    emojiPickerHost.current.replaceChildren(picker);
    return () => {
      picker.remove();
      if (emojiPickerHost.current) emojiPickerHost.current.replaceChildren();
    };
  }, [emojiPickerOpen]);

  useEffect(() => {
    const contactId = new URLSearchParams(window.location.search).get("contact");
    if (!contactId || !session?.user?.id || contactId === session.user.id) return;
    setMessageRecipient(contactId);
    setActiveNav("Poruke");
    setNotice("Odabran je član iz oglasnika. Možeš mu poslati privatnu poruku.");
    window.history.replaceState({}, "", window.location.pathname + window.location.hash);
  }, [session?.user?.id]);

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
    async function loadCommunityFeed() {
      if (!supabase) {
        setPosts([]);
        setCommentsByPost({});
        setNotice("Zid je u probnom prikazu, ali baza još nije povezana. Poveži zasebni testni Supabase projekt prije testiranja objava i interakcija.");
        return;
      }
      let blockedIds = [];
      if (session?.user?.id) {
        const { data: blockRows, error: blockError } = await supabase
          .from("blocked_users")
          .select("blocked_id")
          .eq("blocker_id", session.user.id);
        if (cancelled) return;
        blockedIds = !blockError ? (blockRows || []).map((row) => row.blocked_id) : [];
        setBlockedMembers(blockedIds.map((id) => ({ id, name: id })));
        if (blockedIds.length) {
          const { data: blockedProfiles } = await supabase.from("profiles").select("id, display_name, username").in("id", blockedIds);
          if (!cancelled && blockedProfiles) {
            const byId = Object.fromEntries(blockedProfiles.map((profile) => [profile.id, profile]));
            setBlockedMembers(blockedIds.map((id) => ({ id, name: byId[id]?.display_name || byId[id]?.username || id, username: byId[id]?.username || "" })));
          }
        }
      } else {
        setBlockedMembers([]);
      }
      const { data, error } = await supabase
        .from("posts")
        .select("id, author_id, body, image_path, created_at, profiles:profiles!posts_author_id_fkey(display_name, username, avatar_url)")
        .order("created_at", { ascending: false })
        .limit(50);
      if (cancelled) return;
      if (error) {
        setNotice("Zid nije učitan iz baze. Prikaz oglednih objava je isključen kako se testni podaci ne bi zamijenili stvarnim sadržajem. Provjeri tablicu posts i RLS pravila.");
        setPosts([]);
        setCommentsByPost({});
        return;
      }
      const rows = await Promise.all((data || []).filter((row) => !blockedIds.includes(row.author_id)).map(async (row) => {
        const profile = row.profiles || {};
        const name = profile.display_name || "Čuvar nasljeđa";
        const username = normalizeUsername(profile.username) || "clan";
        let imageUrl = "";
        if (row.image_path) {
          const { data: publicImage } = supabase.storage
            .from("community-images")
            .getPublicUrl(row.image_path);
          imageUrl = publicImage?.publicUrl || "";
        }
        return {
          id: row.id,
          authorId: row.author_id,
          initials: name.split(/\s+/).slice(0, 2).map((part) => part[0] || "").join("").toLocaleUpperCase("hr") || "ČN",
          avatarUrl: profile.avatar_url || "",
          author: name,
          handle: "@" + username,
          time: new Date(row.created_at).toLocaleString("hr-HR", { dateStyle: "medium", timeStyle: "short" }),
          tag: "ZAJEDNICA",
          text: row.body || "",
          imageUrl,
          imagePath: row.image_path || "",
          likes: 0,
          comments: 0,
          icon: "💬",
          owner: Boolean(session?.user?.id && row.author_id === session.user.id),
        };
      }));
      setPosts(rows);
      if (rows.length) {
        const postIds = rows.map((post) => post.id);
        if (session?.user?.id) {
          const { data: reactionRows, error: reactionsError } = await supabase
            .from("post_reactions")
            .select("post_id, user_id, reaction")
            .in("post_id", postIds);
          if (cancelled) return;
          if (!reactionsError) {
            const reactionCounts = {};
            const ownReactions = {};
            (reactionRows || []).forEach((row) => {
              if (!reactionCounts[row.post_id]) reactionCounts[row.post_id] = 0;
              if (row.reaction === "like") reactionCounts[row.post_id] += 1;
              if (row.user_id === session.user.id) {
                ownReactions[row.post_id] = ({ like: "❤️", patriotism: "🇭🇷", gratitude: "🙏", support: "👏" })[row.reaction] || "";
              }
            });
            setPosts((current) => current.map((post) => ({ ...post, likes: reactionCounts[post.id] || 0 })));
            setLiked(Object.keys(ownReactions).filter((postId) => ownReactions[postId] === "❤️"));
            setReactionsByPost(ownReactions);
          } else {
            setNotice("Objave su učitane, ali reakcije nisu dostupne. Provjeri tablicu post_reactions i njezina RLS pravila.");
          }
        }
        const { data: commentRows, error: commentsError } = await supabase
          .from("comments")
          .select("id, post_id, author_id, body, created_at, profiles:profiles!comments_author_id_fkey(display_name, username, avatar_url)")
          .in("post_id", postIds)
          .order("created_at", { ascending: true });
        if (cancelled) return;
        if (commentsError) {
          setCommentsByPost({});
          setNotice("Objave su učitane, ali komentari nisu dostupni. Provjeri tablicu comments i njezina RLS pravila.");
        } else {
          const grouped = {};
          (commentRows || []).forEach((row) => {
            const profile = row.profiles || {};
            const author = profile.display_name || profile.username || "Čuvar nasljeđa";
            if (!grouped[row.post_id]) grouped[row.post_id] = [];
            grouped[row.post_id].push({
              id: row.id,
              author,
              initials: author.split(/\s+/).slice(0, 2).map((part) => part[0] || "").join("").toLocaleUpperCase("hr") || "ČN",
              avatarUrl: profile.avatar_url || "",
              text: row.body || "",
              owner: Boolean(session?.user?.id && row.author_id === session.user.id),
            });
          });
          setCommentsByPost(grouped);
          setPosts((current) => current.map((post) => ({
            ...post,
            comments: (grouped[post.id] || []).length,
          })));
          setNotice("");
        }
      } else {
        setCommentsByPost({});
        setNotice("");
      }
    }
    loadCommunityFeed();
    return () => { cancelled = true; };
  }, [session?.user?.id, feedRefreshKey]);

  useEffect(() => {
    let cancelled = false;
    async function loadProfile() {
      const metadata = session?.user?.user_metadata || {};
      setProfileName(metadata.display_name || "");
      setProfileUsername(normalizeUsername(metadata.username));
      setProfileBio(metadata.bio || "");
      setProfileAvatarUrl("");
      if (!supabase || !session?.user?.id) return;
      const { data, error } = await supabase
        .from("profiles")
        .select("username, display_name, bio, avatar_url")
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
        setProfileUsername(normalizeUsername(data.username));
        setProfileBio(data.bio || "");
        setProfileAvatarUrl(data.avatar_url || "");
        setProfileMessage("");
      }
    }
    loadProfile();
    return () => { cancelled = true; };
  }, [session?.user?.id]);

  async function saveProfile(event) {
    event.preventDefault();
    if (!supabase || !session?.user) return;
    const cleanUsername = profileUsername.trim().replace(/^@/, "").toLowerCase();
    const cleanDisplayName = profileName.trim();
    if (cleanUsername && !/^[a-z0-9_.-]{3,24}$/.test(cleanUsername)) {
      setProfileMessage("Korisničko ime mora imati 3–24 znaka: slova, brojeve, točku, crticu ili podvlaku.");
      return;
    }
    if (!cleanDisplayName) {
      setProfileMessage("Upiši prikazno ime koje će drugi članovi vidjeti.");
      return;
    }
    if (cleanDisplayName.length > 60 || profileBio.trim().length > 240) {
      setProfileMessage("Ime može imati do 60, a opis do 240 znakova.");
      return;
    }
    setProfileBusy(true);
    setProfileMessage("");
    try {
      // Brza provjera daje razumljivu poruku prije spremanja; jedinstveni indeksi u bazi ostaju konačna zaštita.
      if (cleanUsername) {
        const { data: usernameMatches, error: usernameCheckError } = await supabase
          .from("profiles")
          .select("id")
          .ilike("username", cleanUsername.replace(/[\\%_]/g, (character) => "\\" + character))
          .neq("id", session.user.id)
          .limit(1);
        if (usernameCheckError) throw usernameCheckError;
        if (usernameMatches?.length) {
          setProfileMessage("Ovo korisničko ime već se koristi. Odaberi drugo korisničko ime.");
          return;
        }
      }
      const { data: nameMatches, error: nameCheckError } = await supabase
        .from("profiles")
        .select("id")
        .ilike("display_name", cleanDisplayName.replace(/[\\%_]/g, (character) => "\\" + character))
        .neq("id", session.user.id)
        .limit(1);
      if (nameCheckError) throw nameCheckError;
      if (nameMatches?.length) {
        setProfileMessage("Ovo prikazno ime već se koristi. Odaberi drugo prikazno ime.");
        return;
      }

      const { error } = await supabase.from("profiles").upsert({
        id: session.user.id,
        display_name: cleanDisplayName,
        username: cleanUsername || null,
        bio: profileBio.trim(),
        updated_at: new Date().toISOString(),
      }, { onConflict: "id" });
      if (error) throw error;
      setProfileUsername(cleanUsername);
      setProfileName(cleanDisplayName);
      setProfileMessage("Profil je spremljen u bazi zajednice.");
    } catch (error) {
      const constraint = String(error?.message || "") + " " + String(error?.details || "") + " " + String(error?.hint || "");
      if (error?.code === "23505" || /profiles_(username|display_name)_unique_ci_idx/i.test(constraint)) {
        if (/profiles_username_unique_ci_idx/i.test(constraint)) {
          setProfileMessage("Ovo korisničko ime već se koristi. Odaberi drugo korisničko ime.");
        } else if (/profiles_display_name_unique_ci_idx/i.test(constraint)) {
          setProfileMessage("Ovo prikazno ime već se koristi. Odaberi drugo prikazno ime.");
        } else {
          setProfileMessage("Korisničko ime ili prikazno ime već se koristi. Odaberi drugo.");
        }
      } else {
        setProfileMessage("Profil nije spremljen. Provjeri podatke i pokušaj ponovno.");
      }
    } finally {
      setProfileBusy(false);
    }
  }

  async function toggleBlockMember(post) {
    const memberId = post?.authorId;
    if (!supabase || !session?.user?.id) {
      setAuthOpen(true);
      setAuthMessage("Prijavi se kako bi mogao/la blokirati člana.");
      return;
    }
    if (!memberId || memberId === session.user.id) {
      setNotice("Ovu oglednu objavu ili vlastiti profil nije moguće blokirati.");
      return;
    }
    const existing = blockedMembers.some((member) => member.id === memberId);
    const action = existing ? "odblokirati" : "blokirati";
    if (!window.confirm("Želiš li " + action + " člana " + post.author + "? " + (existing ? "Njegove objave ponovno će se prikazivati." : "Njegove objave bit će skrivene s tvog zida."))) return;
    setBlockBusyId(memberId);
    try {
      const result = existing
        ? await supabase.from("blocked_users").delete().eq("blocker_id", session.user.id).eq("blocked_id", memberId)
        : await supabase.from("blocked_users").insert({ blocker_id: session.user.id, blocked_id: memberId });
      if (result.error) throw result.error;
      if (existing) {
        setBlockedMembers((current) => current.filter((member) => member.id !== memberId));
        setFeedRefreshKey((current) => current + 1);
        setNotice("Član je odblokiran. Zid se ponovno učitava.");
      } else {
        setBlockedMembers((current) => [...current, { id: memberId, name: post.author, username: post.handle }]);
        setPosts((current) => current.filter((item) => item.authorId !== memberId));
        setNotice("Član je blokiran. Njegove objave skrivene su s tvog zida.");
      }
    } catch (error) {
      setNotice(error?.code === "42P01" || error?.code === "PGRST205"
        ? "Blokiranje još nije aktivirano u testnoj bazi. Potrebno je pregledati i primijeniti SQL nacrt."
        : "Promjena blokiranja nije spremljena. Provjeri tablicu blocked_users i njezina RLS pravila.");
    } finally {
      setBlockBusyId(null);
    }
  }

  async function unblockMember(member) {
    if (!supabase || !session?.user?.id) return;
    setBlockBusyId(member.id);
    const { error } = await supabase.from("blocked_users").delete()
      .eq("blocker_id", session.user.id).eq("blocked_id", member.id);
    if (error) {
      setNotice("Člana nije moguće odblokirati. Provjeri tablicu blocked_users i RLS pravila.");
    } else {
      setBlockedMembers((current) => current.filter((item) => item.id !== member.id));
      setFeedRefreshKey((current) => current + 1);
      setNotice("Član je odblokiran. Zid se ponovno učitava.");
    }
    setBlockBusyId(null);
  }

  function getPresenceStatus(lastSeenAt) {
    if (!lastSeenAt) return { label: "Izvan mreže", state: "offline" };
    const elapsed = Date.now() - new Date(lastSeenAt).getTime();
    if (elapsed <= 2 * 60 * 1000) return { label: "Na mreži", state: "online" };
    if (elapsed <= 5 * 60 * 1000) return { label: "Nedavno aktivan", state: "recent" };
    return { label: "Izvan mreže", state: "offline" };
  }

  async function saveActivityVisibility(visible) {
    if (!supabase || !session?.user?.id) return;
    setPresenceBusy(true);
    const { error } = await supabase.from("member_presence").upsert({
      user_id: session.user.id,
      last_seen_at: new Date().toISOString(),
      show_activity: visible,
    }, { onConflict: "user_id" });
    if (error) {
      setNotice("Postavka privatnosti aktivnosti nije spremljena. Provjeri SQL nacrt member-presence.sql.");
    } else {
      setShowActivity(visible);
      setMemberPresence((current) => {
        const next = current.filter((row) => row.user_id !== session.user.id);
        return [...next, { user_id: session.user.id, last_seen_at: new Date().toISOString(), show_activity: visible }];
      });
      setNotice(visible ? "Status aktivnosti vidljiv je članovima." : "Sakrili smo tvoj status aktivnosti od drugih članova.");
    }
    setPresenceBusy(false);
  }

  useEffect(() => {
    if (!supabase || !session?.user?.id) return undefined;
    let cancelled = false;
    const userId = session.user.id;
    const updatePresence = async () => {
      const { error } = await supabase.from("member_presence").upsert({
        user_id: userId, last_seen_at: new Date().toISOString(),
      }, { onConflict: "user_id" });
      if (error && !cancelled) setNotice("Status aktivnosti još nije aktivan. Pregledaj SQL nacrt member-presence.sql.");
    };
    updatePresence();
    const intervalId = window.setInterval(updatePresence, 60 * 1000);
    const onVisible = () => { if (document.visibilityState === "visible") updatePresence(); };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", updatePresence);
    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", updatePresence);
    };
  }, [session?.user?.id]);

  useEffect(() => {
    let cancelled = false;
    async function loadMemberDirectory() {
      if (!["Čuvari nasljeđa", "Poruke"].includes(activeNav) || !supabase || !session?.user?.id) return;
      setMemberDirectoryBusy(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("id, display_name, username, bio, avatar_url, created_at")
        .neq("id", session.user.id)
        .order("display_name", { ascending: true })
        .limit(100);
      if (cancelled) return;
      if (error) {
        setNotice("Imenik članova nije dostupan. Provjeri postoji li tablica profiles i jesu li RLS pravila primijenjena.");
        setMemberDirectory([]);
      } else {
        setMemberDirectory((data || []).filter((member) => !blockedMembers.some((blocked) => blocked.id === member.id)));
      }
      const { data: presenceRows, error: presenceError } = await supabase
        .from("member_presence").select("user_id, last_seen_at, show_activity");
      if (cancelled) return;
      if (!presenceError) setMemberPresence(presenceRows || []);
      const { data: ownPresence } = await supabase.from("member_presence")
        .select("user_id, last_seen_at, show_activity").eq("user_id", session.user.id).maybeSingle();
      if (!cancelled && ownPresence) setShowActivity(ownPresence.show_activity !== false);
      setMemberDirectoryBusy(false);
    }
    loadMemberDirectory();
    return () => { cancelled = true; };
  }, [activeNav, session?.user?.id, blockedMembers]);

  useEffect(() => {
    if (!supabase || !session?.user?.id) return undefined;
    const channel = supabase.channel("patriasoul-presence")
      .on("postgres_changes", { event: "*", schema: "public", table: "member_presence" }, (payload) => {
        const row = payload.new;
        if (row?.user_id) setMemberPresence((current) => [...current.filter((item) => item.user_id !== row.user_id), row]);
        else if (payload.old?.user_id) setMemberPresence((current) => current.filter((item) => item.user_id !== payload.old.user_id));
      }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [session?.user?.id]);

  useEffect(() => {
    let cancelled = false;
    async function loadMentionMembers() {
      if (!memberPickerOpen) return;
      if (!supabase || !session?.user?.id) {
        setMentionMembers([]);
        return;
      }
      setMentionBusy(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("id, display_name, username")
        .neq("id", session.user.id)
        .order("display_name", { ascending: true })
        .limit(100);
      if (cancelled) return;
      if (error) {
        setMentionMembers([]);
        setNotice("Popis članova za označavanje nije dostupan. Provjeri tablicu profiles i RLS pravila.");
      } else {
        setMentionMembers((data || []).filter((member) => !blockedMembers.some((blocked) => blocked.id === member.id)));
      }
      setMentionBusy(false);
    }
    loadMentionMembers();
    return () => { cancelled = true; };
  }, [memberPickerOpen, session?.user?.id, blockedMembers]);

  useEffect(() => {
    let cancelled = false;
    async function loadMessages() {
      if (activeNav !== "Poruke" || !supabase || !session?.user?.id) return;
      setMessagesBusy(true);
      const { data, error } = await supabase
        .from("private_messages")
        .select("id, sender_id, recipient_id, body, created_at, updated_at, reply_to_id")
        .or("sender_id.eq." + session.user.id + ",recipient_id.eq." + session.user.id)
        .order("created_at", { ascending: true })
        .limit(200);
      if (cancelled) return;
      if (error) {
        setMessages([]);
        setNotice("Privatne poruke još nisu dostupne. Potrebno je pregledati i primijeniti SQL nacrt u testnoj bazi.");
      } else {
        const loadedMessages = data || [];
        setMessages(loadedMessages);
        if (loadedMessages.length) {
          const { data: reactionRows, error: reactionError } = await supabase
            .from("private_message_reactions")
            .select("id, message_id, user_id, emoji, created_at")
            .in("message_id", loadedMessages.map((message) => message.id));
          if (cancelled) return;
          if (reactionError) {
            setMessageReactions([]);
            setNotice("Poruke su učitane, ali emoji reakcije još nisu dostupne. Pregledaj SQL nacrt private-message-reactions.sql.");
          } else {
            setMessageReactions(reactionRows || []);
          }
        } else {
          setMessageReactions([]);
        }
      }
      setMessagesBusy(false);
    }
    loadMessages();
    return () => { cancelled = true; };
  }, [activeNav, session?.user?.id]);

  useEffect(() => {
    let cancelled = false;
    async function loadNotifications() {
      if (activeNav !== "Obavijesti" || !supabase || !session?.user?.id) return;
      setNotificationsBusy(true);
      const { data, error } = await supabase
        .from("notifications")
        .select("id, actor_id, type, title, body, reference_id, created_at, read_at")
        .eq("recipient_id", session.user.id)
        .order("created_at", { ascending: false })
        .limit(100);
      if (cancelled) return;
      if (error) {
        setNotifications([]);
        setNotice("Obavijesti još nisu dostupne. Potrebno je pregledati i primijeniti SQL nacrt u testnoj bazi.");
      } else {
        setNotifications(data || []);
      }
      setNotificationsBusy(false);
    }
    loadNotifications();
    return () => { cancelled = true; };
  }, [activeNav, session?.user?.id]);

  useEffect(() => {
    let cancelled = false;
    async function loadAdminReports() {
      if (activeNav !== "Administracija" || !isOwner || !supabase) { setAdminReports([]); setAdminError(""); return; }
      setAdminBusy(true);
      const { data, error } = await supabase.from("content_reports")
        .select("id, reporter_id, post_id, reason, details, status, created_at")
        .order("created_at", { ascending: false }).limit(100);
      if (cancelled) return;
      if (error) {
        setAdminReports([]);
        setAdminError("Prijave se ne mogu učitati. Potrebno je pregledati i primijeniti docs/sql/community-core.sql u potvrđenoj testnoj bazi.");
      } else { setAdminReports(data || []); setAdminError(""); }
      setAdminBusy(false);
    }
    loadAdminReports();
    return () => { cancelled = true; };
  }, [activeNav, isOwner]);

  async function updateReportStatus(report, status) {
    if (!isOwner || !supabase || !report?.id) return;
    const { data, error } = await supabase.from("content_reports").update({ status })
      .eq("id", report.id).select("id, status").maybeSingle();
    if (error || !data) { setNotice("Status prijave nije promijenjen. Provjeri vlasničke RLS politike."); return; }
    setAdminReports((current) => current.map((item) => item.id === report.id ? { ...item, status: data.status } : item));
    setNotice("Status prijave je ažuriran.");
  }

  async function removeReportedPost(report) {
    if (!isOwner || !supabase || !report?.post_id) return;
    if (!window.confirm("Kao vlasnik mreže, želiš li ukloniti prijavljenu objavu? Ova radnja je trajna.")) return;
    const { error } = await supabase.from("posts").delete().eq("id", report.post_id);
    if (error) { setNotice("Objavu nije moguće ukloniti. Provjeri vlasničke RLS politike i povezane tablice."); return; }
    const { data: updated, error: statusError } = await supabase.from("content_reports").update({ status: "actioned" }).eq("id", report.id).select("id, status").maybeSingle();
    setAdminReports((current) => current.map((item) => item.id === report.id ? { ...item, status: updated?.status || (statusError ? item.status : "actioned") } : item));
    setNotice(statusError ? "Objava je uklonjena, ali status prijave nije ažuriran." : "Objava je uklonjena, a prijava označena kao obrađena.");
  }

  async function markNotificationRead(notification) {
    if (!supabase || !session?.user?.id || !notification?.id || notification.read_at) return false;
    const readAt = new Date().toISOString();
    const { error } = await supabase.from("notifications")
      .update({ read_at: readAt })
      .eq("id", notification.id)
      .eq("recipient_id", session.user.id);
    if (error) {
      setNotice("Obavijest nije označena kao pročitana. Provjeri RLS pravila.");
      return false;
    }
    setNotifications((current) => current.map((item) => item.id === notification.id ? { ...item, read_at: readAt } : item));
    return true;
  }

  async function openNotification(notification) {
    if (notification?.type === "private_message") {
      if (!notification.read_at) await markNotificationRead(notification);
      if (notification.actor_id && notification.actor_id !== session?.user?.id) {
        setMessageRecipient(notification.actor_id);
      }
      setActiveNav("Poruke");
      setNotice("Otvorene su privatne poruke. Odabran je pošiljatelj obavijesti ako je još dostupan u imeniku.");
      return;
    }
    if (!notification?.read_at) await markNotificationRead(notification);
  }

  useEffect(() => {
    let cancelled = false;
    async function loadGroupChats() {
      if (activeNav !== "Poruke" || !supabase || !session?.user?.id) return;
      const { data: memberships, error: membershipError } = await supabase
        .from("group_chat_members").select("group_id, role").eq("user_id", session.user.id);
      if (cancelled) return;
      if (membershipError) {
        setGroupChats([]);
        setNotice("Grupni razgovori još nisu aktivirani. Potrebno je pregledati i primijeniti SQL nacrt group-chats.sql na testnoj bazi.");
        return;
      }
      const ids = (memberships || []).map((row) => row.group_id);
      if (!ids.length) { setGroupChats([]); setGroupMessages([]); setActiveGroupId(""); return; }
      const { data: groups, error: groupsError } = await supabase
        .from("group_chats").select("id, name, created_by, created_at").in("id", ids).order("created_at", { ascending: false });
      if (cancelled) return;
      if (groupsError) { setNotice("Popis grupnih razgovora nije dostupan."); return; }
      const { data: memberRows } = await supabase
        .from("group_chat_members").select("group_id, user_id, role").in("group_id", ids);
      if (cancelled) return;
      const enriched = (groups || []).map((group) => ({
        ...group,
        members: (memberRows || []).filter((row) => row.group_id === group.id),
      }));
      setGroupChats(enriched);
      setActiveGroupId((current) => current && ids.includes(current) ? current : (enriched[0]?.id || ""));
    }
    loadGroupChats();
    return () => { cancelled = true; };
  }, [activeNav, session?.user?.id]);

  useEffect(() => {
    let cancelled = false;
    async function loadGroupMessages() {
      if (!activeGroupId || activeNav !== "Poruke" || !supabase || !session?.user?.id) { setGroupMessages([]); return; }
      const { data, error } = await supabase.from("group_chat_messages")
        .select("id, group_id, sender_id, body, created_at, reply_to_id")
        .eq("group_id", activeGroupId).order("created_at", { ascending: true }).limit(200);
      if (cancelled) return;
      if (error) {
        setGroupMessages([]);
        setNotice("Poruke grupe nisu dostupne. Provjeri SQL nacrt i RLS pravila.");
      } else setGroupMessages(data || []);
    }
    loadGroupMessages();
    return () => { cancelled = true; };
  }, [activeGroupId, activeNav, session?.user?.id]);

  useEffect(() => {
    let cancelled = false;
    async function loadGroupMessageReactions() {
      if (!activeGroupId || activeNav !== "Poruke" || !supabase || !session?.user?.id) {
        setGroupMessageReactions([]);
        return;
      }
      const { data, error } = await supabase.from("group_chat_message_reactions")
        .select("id, message_id, group_id, user_id, reaction")
        .eq("group_id", activeGroupId);
      if (cancelled) return;
      if (error) {
        setGroupMessageReactions([]);
        setNotice("Reakcije grupnih poruka nisu dostupne. Provjeri SQL nacrt i RLS pravila.");
      } else setGroupMessageReactions(data || []);
    }
    loadGroupMessageReactions();
    return () => { cancelled = true; };
  }, [activeGroupId, activeNav, session?.user?.id]);

  async function createGroupChat(event) {
    event.preventDefault();
    if (!supabase || !session?.user?.id) return;
    const name = groupDraftName.trim();
    const members = [...new Set(groupSelectedMembers.filter((id) => id !== session.user.id))];
    if (name.length < 2 || name.length > 60 || members.length < 1) {
      setNotice("Unesi naziv grupe (2–60 znakova) i odaberi barem jednog člana.");
      return;
    }
    setGroupBusy(true);
    const { data: group, error } = await supabase.from("group_chats")
      .insert({ name, created_by: session.user.id }).select("id, name, created_by, created_at").single();
    if (error) {
      setNotice("Grupu nije moguće stvoriti. Provjeri SQL nacrt group-chats.sql i RLS pravila.");
      setGroupBusy(false);
      return;
    }
    const creatorMembership = { group_id: group.id, user_id: session.user.id, role: "admin" };
    const { error: creatorError } = await supabase.from("group_chat_members").insert(creatorMembership);
    if (creatorError) {
      setNotice("Grupa je stvorena, ali nije moguće postaviti administratora. Provjeri SQL nacrt; možda će trebati ukloniti nedovršenu grupu.");
      setGroupBusy(false);
      return;
    }
    const selectedMemberships = members.map((user_id) => ({ group_id: group.id, user_id, role: "member" }));
    const { data: insertedMembers, error: membersError } = selectedMemberships.length
      ? await supabase.from("group_chat_members").insert(selectedMemberships).select("group_id, user_id, role")
      : { data: [], error: null };
    if (membersError) {
      setNotice("Grupa je stvorena, ali neke članove nije moguće dodati. Provjeri administratorska RLS pravila.");
      setGroupBusy(false);
      return;
    }
    const membershipRows = [creatorMembership, ...(insertedMembers || selectedMemberships)];
    setGroupChats((current) => [{ ...group, members: membershipRows }, ...current]);
    setActiveGroupId(group.id);
    setGroupDraftName("");
    setGroupSelectedMembers([]);
    setNotice("Grupni razgovor je stvoren.");
    setGroupBusy(false);
  }

  async function saveGroupName(event) {
    event.preventDefault();
    const group = groupChats.find((item) => item.id === activeGroupId);
    const name = groupNameDraft.trim();
    if (!group || name.length < 2 || name.length > 60 || !supabase) return;
    setGroupBusy(true);
    const { error } = await supabase.from("group_chats").update({ name }).eq("id", group.id);
    if (error) setNotice("Naziv grupe nije promijenjen. Provjeri administratorska RLS pravila.");
    else {
      setGroupChats((current) => current.map((item) => item.id === group.id ? { ...item, name } : item));
      setGroupNameDraft("");
      setNotice("Naziv grupnog razgovora je promijenjen.");
    }
    setGroupBusy(false);
  }

  async function addGroupMember() {
    const group = groupChats.find((item) => item.id === activeGroupId);
    const userId = groupMemberToAdd;
    if (!group || !userId || !supabase || group.members?.some((item) => item.user_id === userId)) return;
    setGroupBusy(true);
    const { data, error } = await supabase.from("group_chat_members")
      .insert({ group_id: group.id, user_id: userId, role: "member" })
      .select("group_id, user_id, role").single();
    if (error) setNotice("Člana nije moguće dodati. Provjeri je li tvoj račun administrator grupe i primijeni SQL nacrt.");
    else {
      setGroupChats((current) => current.map((item) => item.id === group.id ? { ...item, members: [...(item.members || []), data] } : item));
      setGroupMemberToAdd("");
      setNotice("Član je dodan u grupu.");
    }
    setGroupBusy(false);
  }

  async function removeGroupMember(member) {
    const group = groupChats.find((item) => item.id === activeGroupId);
    if (!group || !member || !supabase) return;
    if (member.user_id === session?.user?.id) {
      setNotice("Za sada ne možeš sam/a napustiti grupu kroz ovu kontrolu; administrator mora upravljati članstvom.");
      return;
    }
    const profile = memberDirectory.find((item) => item.id === member.user_id);
    if (!window.confirm("Ukloniti člana " + (profile?.display_name || profile?.username || "iz grupe") + "?")) return;
    setGroupBusy(true);
    const { error } = await supabase.from("group_chat_members").delete().eq("group_id", group.id).eq("user_id", member.user_id);
    if (error) setNotice("Člana nije moguće ukloniti. Provjeri administratorska RLS pravila.");
    else {
      setGroupChats((current) => current.map((item) => item.id === group.id ? { ...item, members: item.members.filter((row) => row.user_id !== member.user_id) } : item));
      setNotice("Član je uklonjen iz grupe.");
    }
    setGroupBusy(false);
  }

  async function transferGroupAdmin(member) {
    const group = groupChats.find((item) => item.id === activeGroupId);
    if (!group || !member || !supabase || member.role === "admin") return;
    if (!window.confirm("Prenijeti administratorsku ulogu na odabranog člana? Nakon toga tvoj račun više neće biti administrator.")) return;
    setGroupBusy(true);
    const { error } = await supabase.rpc("transfer_group_chat_admin", { target_group_id: group.id, new_admin_user_id: member.user_id });
    if (error) setNotice("Prijenos administratorske uloge nije uspio. Provjeri je li SQL nacrt group-chats.sql ažuriran.");
    else {
      setGroupChats((current) => current.map((item) => item.id === group.id ? { ...item, members: item.members.map((row) => ({ ...row, role: row.user_id === member.user_id ? "admin" : (row.role === "admin" ? "member" : row.role) })) } : item));
      setNotice("Administratorska uloga je prenesena.");
    }
    setGroupBusy(false);
  }

  async function leaveGroupChat() {
    const group = groupChats.find((item) => item.id === activeGroupId);
    if (!group || !supabase || !session?.user?.id) return;
    if (!window.confirm("Napustiti grupu „" + group.name + "”? Nakon izlaska više nećeš vidjeti njezine poruke.")) return;
    setGroupBusy(true);
    const { error } = await supabase.rpc("leave_group_chat", { target_group_id: group.id });
    if (error) {
      const detail = String(error.message || "");
      setNotice(detail.includes("last admin") || detail.includes("last administrator")
        ? "Ne možeš napustiti grupu dok si njezin jedini administrator. Najprije prenesi administratorsku ulogu drugom članu."
        : "Grupu nije moguće napustiti. Provjeri je li ažurirani SQL nacrt group-chats.sql primijenjen na testnoj bazi.");
    } else {
      setGroupChats((current) => current.filter((item) => item.id !== group.id));
      setGroupMessages((current) => current.filter((item) => item.group_id !== group.id));
      setActiveGroupId((current) => current === group.id ? "" : current);
      setNotice("Napustio/la si grupu „" + group.name + "”.");
    }
    setGroupBusy(false);
  }

  async function deleteGroupChat() {
    const group = groupChats.find((item) => item.id === activeGroupId);
    const myMembership = group?.members?.find((item) => item.user_id === session?.user?.id);
    if (!group || !supabase || myMembership?.role !== "admin") return;
    if (!window.confirm("Trajno izbrisati grupu „" + group.name + "” i sve njezine poruke? Ova radnja ne može se poništiti.")) return;
    if (!window.confirm("Potvrdi još jednom: zaista želiš trajno izbrisati ovu grupu za sve članove?")) return;
    setGroupBusy(true);
    const { error } = await supabase.rpc("delete_group_chat", { target_group_id: group.id });
    if (error) {
      setNotice("Grupu nije moguće izbrisati. Provjeri je li ažurirani SQL nacrt group-chats.sql primijenjen na testnoj bazi.");
    } else {
      setGroupChats((current) => current.filter((item) => item.id !== group.id));
      setGroupMessages((current) => current.filter((item) => item.group_id !== group.id));
      setActiveGroupId((current) => current === group.id ? "" : current);
      setNotice("Grupa „" + group.name + "” i njezine poruke trajno su izbrisane.");
    }
    setGroupBusy(false);
  }

  async function saveGroupMessageEdit(event) {
    event.preventDefault();
    const message = groupMessages.find((item) => item.id === groupEditingMessageId);
    const body = groupMessageEditDraft.trim();
    if (!supabase || !session?.user?.id || !message || message.sender_id !== session.user.id || !body) return;
    if (body.length > 2000) { setNotice("Poruka grupe može imati najviše 2000 znakova."); return; }
    setGroupMessageActionBusyId(message.id);
    const { data, error } = await supabase.from("group_chat_messages").update({ body })
      .eq("id", message.id).eq("sender_id", session.user.id)
      .select("id, group_id, sender_id, body, created_at, reply_to_id").single();
    if (error) setNotice("Uređivanje poruke nije uspjelo. Provjeri SQL/RLS pravila grupnih razgovora.");
    else {
      setGroupMessages((current) => current.map((item) => item.id === data.id ? data : item));
      setGroupEditingMessageId(null);
      setGroupMessageEditDraft("");
      setNotice("Grupna poruka je uređena.");
    }
    setGroupMessageActionBusyId(null);
  }

  async function deleteGroupMessage(message) {
    if (!supabase || !session?.user?.id || !message || message.sender_id !== session.user.id) return;
    if (!window.confirm("Izbrisati ovu poruku iz grupnog razgovora?")) return;
    setGroupMessageActionBusyId(message.id);
    const { error } = await supabase.from("group_chat_messages").delete()
      .eq("id", message.id).eq("sender_id", session.user.id);
    if (error) setNotice("Brisanje poruke nije uspjelo. Provjeri SQL/RLS pravila grupnih razgovora.");
    else {
      setGroupMessages((current) => current.filter((item) => item.id !== message.id));
      if (groupEditingMessageId === message.id) {
        setGroupEditingMessageId(null);
        setGroupMessageEditDraft("");
      }
      setNotice("Grupna poruka je izbrisana.");
    }
    setGroupMessageActionBusyId(null);
  }

  async function toggleGroupMessageReaction(message, reaction) {
    if (!supabase || !session?.user?.id || !message?.id || !activeGroupId) return;
    const existing = groupMessageReactions.find((item) =>
      item.message_id === message.id && item.user_id === session.user.id && item.reaction === reaction
    );
    const busyKey = message.id + ":" + reaction;
    setGroupReactionBusy(busyKey);
    const result = existing
      ? await supabase.from("group_chat_message_reactions").delete().eq("id", existing.id).eq("user_id", session.user.id)
      : await supabase.from("group_chat_message_reactions").insert({
          message_id: message.id, group_id: message.group_id, user_id: session.user.id, reaction,
        }).select("id, message_id, group_id, user_id, reaction").single();
    if (result.error) {
      setNotice("Reakcija nije spremljena. Provjeri SQL nacrt i RLS pravila grupnih razgovora.");
    } else if (existing) {
      setGroupMessageReactions((current) => current.filter((item) => item.id !== existing.id));
    } else if (result.data) {
      setGroupMessageReactions((current) => current.some((item) => item.id === result.data.id) ? current : [...current, result.data]);
    }
    setGroupReactionBusy("");
  }

  useEffect(() => {
    let cancelled = false;
    async function loadGroupUnreadCounts() {
      if (!supabase || !session?.user?.id || activeNav !== "Poruke") { setGroupUnreadCounts({}); return; }
      const { data, error } = await supabase.rpc("get_group_unread_counts");
      if (cancelled) return;
      if (error) { setGroupUnreadCounts({}); return; }
      setGroupUnreadCounts(Object.fromEntries((data || []).map((row) => [row.group_id, Number(row.unread_count) || 0])));
    }
    loadGroupUnreadCounts();
    return () => { cancelled = true; };
  }, [activeNav, groupChats, groupMessages, groupMessageReads, session?.user?.id]);

  useEffect(() => {
    let cancelled = false;
    async function loadGroupMessageReads() {
      if (!supabase || !session?.user?.id || !activeGroupId || activeNav !== "Poruke") { setGroupMessageReads([]); return; }
      const { data, error } = await supabase.from("group_chat_message_reads").select("message_id, group_id, user_id, read_at").eq("group_id", activeGroupId);
      if (cancelled) return;
      if (error) { setGroupMessageReads([]); return; }
      setGroupMessageReads(data || []);
    }
    loadGroupMessageReads();
    return () => { cancelled = true; };
  }, [activeGroupId, activeNav, session?.user?.id]);

  useEffect(() => {
    if (!supabase || !session?.user?.id || !activeGroupId || activeNav !== "Poruke") return;
    const unreadIds = groupMessages.filter((message) => message.sender_id !== session.user.id).map((message) => message.id);
    if (!unreadIds.length) return;
    supabase.rpc("mark_group_messages_read", { target_group_id: activeGroupId, target_message_ids: unreadIds })
      .then(({ error }) => { if (error) console.warn("Grupne poruke nisu označene kao pročitane."); });
  }, [activeGroupId, activeNav, groupMessages, session?.user?.id]);

  async function sendGroupMessage(event) {
    event.preventDefault();
    const body = groupMessageDraft.trim();
    if (!supabase || !session?.user?.id || !activeGroupId || !body) return;
    if (body.length > 2000) { setNotice("Poruka grupe može imati najviše 2000 znakova."); return; }
    const { data, error } = await supabase.from("group_chat_messages")
      .insert({ group_id: activeGroupId, sender_id: session.user.id, body, reply_to_id: replyingToGroupMessage?.id || null })
      .select("id, group_id, sender_id, body, created_at, reply_to_id").single();
    if (error) { setNotice("Grupna poruka nije poslana. Provjeri tablice i RLS pravila."); return; }
    setGroupMessages((current) => [...current.filter((item) => item.id !== data.id), data]);
    setGroupMessageDraft("");
    setReplyingToGroupMessage(null);
  }

  async function sendPrivateMessage(event) {
    event.preventDefault();
    const body = messageDraft.trim();
    if (!supabase || !session?.user?.id) {
      setAuthOpen(true);
      setAuthMessage("Prijavi se za slanje privatnih poruka.");
      return;
    }
    if (!messageRecipient || messageRecipient === session.user.id || !body) return;
    if (body.length > 2000) {
      setNotice("Poruka može imati najviše 2000 znakova.");
      return;
    }
    const { data, error } = await supabase.from("private_messages").insert({
      sender_id: session.user.id,
      recipient_id: messageRecipient,
      body,
      reply_to_id: replyingToMessage?.id || null,
    }).select("id, sender_id, recipient_id, body, created_at, updated_at, reply_to_id").single();
    if (error) {
      setNotice("Poruka nije poslana. Provjeri postoji li tablica private_messages i jesu li RLS pravila primijenjena.");
      return;
    }
    setMessages((current) => [...current.filter((message) => message.id !== data.id), data]);
    setMessageDraft("");
    setReplyingToMessage(null);
    setNotice("Privatna poruka je poslana.");
  }

  async function togglePrivateMessageReaction(message, emoji) {
    if (!supabase || !session?.user?.id || !message?.id) return;
    const existing = messageReactions.find((reaction) =>
      reaction.message_id === message.id && reaction.user_id === session.user.id && reaction.emoji === emoji
    );
    if (existing) {
      const { error } = await supabase.from("private_message_reactions").delete()
        .eq("id", existing.id).eq("user_id", session.user.id);
      if (error) {
        setNotice("Reakcija nije uklonjena. Provjeri SQL nacrt i RLS pravila za reakcije.");
        return;
      }
      setMessageReactions((current) => current.filter((reaction) => reaction.id !== existing.id));
      return;
    }
    const { data, error } = await supabase.from("private_message_reactions").insert({
      message_id: message.id, user_id: session.user.id, emoji,
    }).select("id, message_id, user_id, emoji, created_at").single();
    if (error) {
      setNotice("Reakcija nije spremljena. Provjeri postoji li tablica private_message_reactions i jesu li RLS pravila primijenjena.");
      return;
    }
    setMessageReactions((current) => current.some((reaction) => reaction.id === data.id) ? current : [...current, data]);
  }

  function beginEditPrivateMessage(message) {
    setEditingMessageId(message.id);
    setMessageEditDraft(message.body || "");
    setNotice("");
  }

  async function savePrivateMessageEdit(message) {
    const body = messageEditDraft.trim();
    if (!supabase || !session?.user?.id || message.sender_id !== session.user.id) return;
    if (!body || body.length > 2000) {
      setNotice("Uređena poruka mora sadržavati 1–2000 znakova.");
      return;
    }
    setMessageActionBusyId(message.id);
    const { data, error } = await supabase.from("private_messages")
      .update({ body, updated_at: new Date().toISOString() })
      .eq("id", message.id).eq("sender_id", session.user.id)
      .select("id, sender_id, recipient_id, body, created_at, updated_at, reply_to_id").maybeSingle();
    if (error || !data) {
      setNotice("Poruka nije uređena. Provjeri SQL nacrt i dopuštenja vlasnika poruke.");
    } else {
      setMessages((current) => current.map((item) => item.id === data.id ? data : item));
      setEditingMessageId(null);
      setMessageEditDraft("");
      setNotice("Poruka je uređena.");
    }
    setMessageActionBusyId(null);
  }

  async function deletePrivateMessage(message) {
    if (!supabase || !session?.user?.id || message.sender_id !== session.user.id) return;
    if (!window.confirm("Želiš li trajno izbrisati ovu poruku iz razgovora?")) return;
    setMessageActionBusyId(message.id);
    const { error } = await supabase.from("private_messages")
      .delete().eq("id", message.id).eq("sender_id", session.user.id);
    if (error) {
      setNotice("Poruka nije izbrisana. Provjeri SQL nacrt i dopuštenja vlasnika poruke.");
    } else {
      setMessages((current) => current.filter((item) => item.id !== message.id));
      if (replyingToMessage?.id === message.id) setReplyingToMessage(null);
      if (editingMessageId === message.id) {
        setEditingMessageId(null);
        setMessageEditDraft("");
      }
      setNotice("Poruka je izbrisana.");
    }
    setMessageActionBusyId(null);
  }

  async function submitReport(event) {
    event.preventDefault();
    if (!supabase || !session?.user?.id) {
      setReportPost(null);
      setAuthOpen(true);
      setAuthMessage("Za prijavu sadržaja potrebno je prijaviti se.");
      return;
    }
    if (!reportPost?.id || typeof reportPost.id !== "string") {
      setNotice("Ova ogledna objava nema zapis u bazi i ne može se prijaviti.");
      setReportPost(null);
      return;
    }
    setReportBusy(true);
    try {
      const { data: existingReport, error: lookupError } = await supabase
        .from("content_reports")
        .select("id")
        .eq("reporter_id", session.user.id)
        .eq("post_id", reportPost.id)
        .eq("status", "pending")
        .limit(1)
        .maybeSingle();
      if (lookupError) throw lookupError;
      if (existingReport) {
        setReportPost(null);
        setNotice("Već si prijavio/la ovu objavu. Prijava je na čekanju pregleda moderatora.");
        return;
      }

      const { error } = await supabase.from("content_reports").insert({
        reporter_id: session.user.id,
        post_id: reportPost.id,
        reason: reportReason,
        details: reportDetails.trim() || null,
      });
      if (error) throw error;
      setReportPost(null);
      setReportReason("spam");
      setReportDetails("");
      setNotice("Prijava je poslana moderatorima. Hvala što pomažeš čuvati sigurnost zajednice.");
    } catch (error) {
      setNotice(error?.code === "23505"
        ? "Već postoji tvoja prijava ove objave na čekanju pregleda moderatora."
        : error?.code === "42P01" || error?.code === "PGRST205"
          ? "Prijave još nisu aktivirane u testnoj bazi. Najprije treba pregledati i primijeniti ažurirani SQL nacrt."
          : "Prijava nije spremljena. Provjeri postoji li tablica content_reports i jesu li RLS pravila primijenjena.");
    } finally {
      setReportBusy(false);
    }
  }

  useEffect(() => {
    const userId = session?.user?.id;
    if (!supabase || !userId) return undefined;

    const mergeMessage = (incoming) => {
      if (!incoming?.id || (incoming.sender_id !== userId && incoming.recipient_id !== userId)) return;
      setMessages((current) => {
        const exists = current.some((message) => message.id === incoming.id);
        const next = exists
          ? current.map((message) => message.id === incoming.id ? incoming : message)
          : [...current, incoming];
        return next.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      });
    };
    const mergeMessageReaction = (incoming) => {
      if (!incoming?.id || !incoming.message_id) return;
      setMessageReactions((current) => current.some((reaction) => reaction.id === incoming.id) ? current : [...current, incoming]);
    };
    const removeMessageReaction = (oldReaction) => {
      if (oldReaction?.id) setMessageReactions((current) => current.filter((reaction) => reaction.id !== oldReaction.id));
    };
    const mergeNotification = (incoming) => {
      if (!incoming?.id || incoming.recipient_id !== userId) return;
      setNotifications((current) => {
        const exists = current.some((notification) => notification.id === incoming.id);
        const next = exists
          ? current.map((notification) => notification.id === incoming.id ? incoming : notification)
          : [incoming, ...current];
        return next.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 100);
      });
    };

    const channel = supabase.channel("patriasoul-live-" + userId)
      .on("postgres_changes", {
        event: "INSERT", schema: "public", table: "private_messages", filter: "recipient_id=eq." + userId,
      }, (payload) => mergeMessage(payload.new))
      .on("postgres_changes", {
        event: "INSERT", schema: "public", table: "private_messages", filter: "sender_id=eq." + userId,
      }, (payload) => mergeMessage(payload.new))
      .on("postgres_changes", {
        event: "UPDATE", schema: "public", table: "private_messages", filter: "recipient_id=eq." + userId,
      }, (payload) => mergeMessage(payload.new))
      .on("postgres_changes", {
        event: "UPDATE", schema: "public", table: "private_messages", filter: "sender_id=eq." + userId,
      }, (payload) => mergeMessage(payload.new))
      .on("postgres_changes", {
        event: "DELETE", schema: "public", table: "private_messages", filter: "recipient_id=eq." + userId,
      }, (payload) => { if (payload.old?.id) setMessages((current) => current.filter((message) => message.id !== payload.old.id)); })
      .on("postgres_changes", {
        event: "DELETE", schema: "public", table: "private_messages", filter: "sender_id=eq." + userId,
      }, (payload) => { if (payload.old?.id) setMessages((current) => current.filter((message) => message.id !== payload.old.id)); })
      .on("postgres_changes", {
        event: "INSERT", schema: "public", table: "private_message_reactions",
      }, (payload) => mergeMessageReaction(payload.new))
      .on("postgres_changes", {
        event: "DELETE", schema: "public", table: "private_message_reactions",
      }, (payload) => removeMessageReaction(payload.old))
      .on("postgres_changes", {
        event: "INSERT", schema: "public", table: "group_chat_messages",
      }, (payload) => {
        const incoming = payload.new;
        if (!incoming?.id || !incoming.group_id) return;
        setGroupMessages((current) => {
          if (current.some((message) => message.id === incoming.id)) return current;
          return incoming.group_id === activeGroupId ? [...current, incoming].sort((x, y) => new Date(x.created_at) - new Date(y.created_at)) : current;
        });
        supabase.rpc("get_group_unread_counts").then(({ data, error }) => {
          if (!error) setGroupUnreadCounts(Object.fromEntries((data || []).map((row) => [row.group_id, Number(row.unread_count) || 0])));
        });
      })
      .on("postgres_changes", {
        event: "INSERT", schema: "public", table: "group_chat_message_reads", filter: "group_id=eq." + activeGroupId,
      }, (payload) => {
        const incoming = payload.new;
        if (incoming?.message_id && incoming.group_id === activeGroupId) setGroupMessageReads((current) => current.some((item) => item.message_id === incoming.message_id && item.user_id === incoming.user_id) ? current : [...current, incoming]);
      })
      .on("postgres_changes", {
        event: "INSERT", schema: "public", table: "group_chat_message_reactions",
      }, (payload) => {
        const incoming = payload.new;
        if (incoming?.id && incoming.group_id === activeGroupId) setGroupMessageReactions((current) => current.some((item) => item.id === incoming.id) ? current : [...current, incoming]);
      })
      .on("postgres_changes", {
        event: "DELETE", schema: "public", table: "group_chat_message_reactions",
      }, (payload) => {
        if (payload.old?.id) setGroupMessageReactions((current) => current.filter((item) => item.id !== payload.old.id));
      })
      .on("postgres_changes", {
        event: "INSERT", schema: "public", table: "notifications", filter: "recipient_id=eq." + userId,
      }, (payload) => mergeNotification(payload.new))
      .on("postgres_changes", {
        event: "UPDATE", schema: "public", table: "notifications", filter: "recipient_id=eq." + userId,
      }, (payload) => mergeNotification(payload.new))
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session?.user?.id, activeGroupId]);

  const messageConversations = useMemo(() => {
    if (!session?.user?.id) return [];
    const latestByMember = new Map();
    messages.forEach((message) => {
      const otherId = message.sender_id === session.user.id ? message.recipient_id : message.sender_id;
      if (!otherId) return;
      const current = latestByMember.get(otherId);
      if (!current || new Date(message.created_at).getTime() > new Date(current.created_at).getTime()) {
        latestByMember.set(otherId, { memberId: otherId, latest: message });
      }
    });
    return [...latestByMember.values()].sort((a, b) => new Date(b.latest.created_at) - new Date(a.latest.created_at));
  }, [messages, session?.user?.id]);
  const activeConversationMessages = useMemo(() => {
    if (!session?.user?.id || !messageRecipient) return [];
    return messages.filter((message) =>
      (message.sender_id === session.user.id && message.recipient_id === messageRecipient) ||
      (message.sender_id === messageRecipient && message.recipient_id === session.user.id)
    );
  }, [messages, messageRecipient, session?.user?.id]);
  const searchedMessages = useMemo(() => {
    const query = messageSearch.trim().toLocaleLowerCase("hr");
    if (!query) return messages;
    return messages.filter((message) => {
      const otherId = message.sender_id === session?.user?.id ? message.recipient_id : message.sender_id;
      const member = memberDirectory.find((item) => item.id === otherId);
      const haystack = [
        message.body,
        member?.display_name,
        member?.username,
        message.sender_id === session?.user?.id ? "poslano" : "primljeno",
      ].filter(Boolean).join(" ").toLocaleLowerCase("hr");
      return haystack.includes(query);
    });
  }, [messages, messageSearch, memberDirectory, session?.user?.id]);
  const searchedConversations = useMemo(() => {
    if (!messageSearch.trim()) return messageConversations;
    const ids = new Set(searchedMessages.flatMap((message) => {
      const otherId = message.sender_id === session?.user?.id ? message.recipient_id : message.sender_id;
      return otherId ? [otherId] : [];
    }));
    return messageConversations.filter((conversation) => ids.has(conversation.memberId));
  }, [messageConversations, messageSearch, searchedMessages, session?.user?.id]);


  const postCount = useMemo(() => posts.length, [posts]);
  const visiblePosts = useMemo(() => posts.filter((post) => {
    const matchesFilter = feedFilter === "Sve objave" || post.tag.toLocaleLowerCase("hr").includes(feedFilter.toLocaleLowerCase("hr"));
    const query = feedSearch.trim().toLocaleLowerCase("hr");
    const matchesSearch = !query || `${post.author} ${post.handle} ${post.tag} ${post.text}`.toLocaleLowerCase("hr").includes(query);
    return matchesFilter && matchesSearch;
  }), [posts, feedFilter, feedSearch]);

  async function publishPost() {
    const text = draft.trim();
    if (!text && !selectedImage) {
      setNotice("Napiši nekoliko riječi prije objave.");
      return;
    }
    if (!supabase || !session?.user?.id) {
      setNotice("Za objavu koja se trajno sprema potrebno je prijaviti se. Trenutačni ogledni zid ne sprema sadržaj na poslužitelj.");
      return;
    }
    let imagePath = "";
    if (selectedImageFile) {
      const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
      if (!allowedTypes.includes(selectedImageFile.type) || selectedImageFile.size > 10 * 1024 * 1024) {
        setNotice("Fotografija mora biti JPG, PNG, WebP ili GIF i ne smije biti veća od 10 MB.");
        return;
      }
      const extensionByType = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif" };
      imagePath = session.user.id + "/" + crypto.randomUUID() + "." + extensionByType[selectedImageFile.type];
      const { error: uploadError } = await supabase.storage
        .from("community-images")
        .upload(imagePath, selectedImageFile, { contentType: selectedImageFile.type, upsert: false });
      if (uploadError) {
        setNotice("Fotografija nije učitana. Provjeri je li privatni spremnik community-images postavljen i jesu li njegova RLS pravila primijenjena.");
        return;
      }
    }
    const { data, error } = await supabase
      .from("posts")
      .insert({ author_id: session.user.id, body: text, image_path: imagePath || null })
      .select("id, author_id, body, image_path, created_at, profiles:profiles!posts_author_id_fkey(display_name, username, avatar_url)")
      .single();
    if (error) {
      if (imagePath) await supabase.storage.from("community-images").remove([imagePath]);
      setNotice("Objava nije spremljena: " + (error.message || "provjeri tablicu posts i RLS pravila."));
      return;
    }
    let uploadedImageUrl = "";
    if (imagePath) {
      const { data: publicImage } = supabase.storage.from("community-images").getPublicUrl(imagePath);
      uploadedImageUrl = publicImage?.publicUrl || "";
    }
    const profile = data.profiles || {};
    const author = profile.display_name || session.user.email || "Čuvar nasljeđa";
    const username = normalizeUsername(profile.username) || "clan";
    setPosts((current) => [{
      id: data.id,
      initials: author.split(/\s+/).slice(0, 2).map((part) => part[0] || "").join("").toLocaleUpperCase("hr") || "ČN",
      avatarUrl: profile.avatar_url || "",
      author,
      handle: "@" + username,
      time: new Date(data.created_at).toLocaleString("hr-HR", { dateStyle: "medium", timeStyle: "short" }),
      tag: "ZAJEDNICA",
      text: data.body || "",
      imageUrl: uploadedImageUrl,
      imagePath: data.image_path || "",
      likes: 0,
      comments: 0,
      icon: "💬",
      owner: data.author_id === session.user.id,
    }, ...current]);
    setDraft("");
    setSelectedImage("");
    setSelectedImageFile(null);
    setMemberPickerOpen(false);
    setNotice("Objava je spremljena u bazu zajednice.");
  }

  async function toggleLike(id) {
    await toggleReaction(id, "❤️");
  }

  async function toggleReaction(id, reaction) {
    if (!session?.user?.id) {
      setAuthOpen(true);
      setAuthMode("login");
      setAuthMessage("Prijavi se ili izradi račun kako bi lajkao/la i reagirao/la na objave.");
      return;
    }
    if (!supabase) {
      setNotice("Reakcije će biti dostupne nakon povezivanja testne baze zajednice.");
      return;
    }
    const reactionToDb = { "❤️": "like", "🇭🇷": "patriotism", "🙏": "gratitude", "👏": "support" };
    const dbReaction = reactionToDb[reaction];
    if (!dbReaction) return;
    const currentReaction = reactionsByPost[id] || "";
    const { error } = currentReaction === reaction
      ? await supabase.from("post_reactions").delete().eq("post_id", id).eq("user_id", session.user.id)
      : await supabase.from("post_reactions").upsert(
          { post_id: id, user_id: session.user.id, reaction: dbReaction },
          { onConflict: "post_id,user_id" }
        );
    if (error) {
      setNotice("Reakcija nije spremljena. Provjeri tablicu post_reactions i RLS pravila.");
      return;
    }
    const nextReaction = currentReaction === reaction ? "" : reaction;
    setReactionsByPost((current) => ({ ...current, [id]: nextReaction }));
    setLiked((current) => nextReaction === "❤️"
      ? (current.includes(id) ? current : [...current, id])
      : current.filter((item) => item !== id));
    setPosts((current) => current.map((post) => {
      if (post.id !== id) return post;
      const wasLike = currentReaction === "❤️";
      const isLike = nextReaction === "❤️";
      return { ...post, likes: Math.max(0, post.likes + (isLike ? 1 : 0) - (wasLike ? 1 : 0)) };
    }));
    setNotice("Reakcija je spremljena.");
  }

  function toggleComments(id) {
    setOpenComments((current) => current.includes(id)
      ? current.filter((item) => item !== id)
      : [...current, id]);
  }

  async function addComment(id) {
    const text = (commentDrafts[id] || "").trim();
    if (!text) {
      setNotice("Napiši komentar prije slanja.");
      return;
    }
    if (!session?.user?.id) {
      setAuthOpen(true);
      setAuthMode("login");
      setAuthMessage("Prijavi se ili izradi račun kako bi komentirao/la objave.");
      return;
    }
    if (!supabase) {
      setNotice("Komentari će biti dostupni nakon povezivanja testne baze zajednice.");
      return;
    }
    const { data, error } = await supabase
      .from("comments")
      .insert({ post_id: id, author_id: session.user.id, body: text })
      .select("id, post_id, author_id, body, created_at, profiles:profiles!comments_author_id_fkey(display_name, username, avatar_url)")
      .single();
    if (error) {
      setNotice("Komentar nije spremljen: " + (error.message || "provjeri tablicu comments i RLS pravila."));
      return;
    }
    const profile = data.profiles || {};
    const author = profile.display_name || profile.username || session.user.email || "Čuvar nasljeđa";
    setCommentsByPost((current) => ({
      ...current,
      [id]: [...(current[id] || []), {
        id: data.id,
        author,
        initials: author.split(/\s+/).slice(0, 2).map((part) => part[0] || "").join("").toLocaleUpperCase("hr") || "ČN",
        avatarUrl: profile.avatar_url || "",
        text: data.body || "",
        owner: data.author_id === session.user.id,
      }],
    }));
    setPosts((current) => current.map((post) => (
      post.id === id ? { ...post, comments: (post.comments || 0) + 1 } : post
    )));
    setCommentDrafts((current) => ({ ...current, [id]: "" }));
    setNotice("Komentar je spremljen u bazu zajednice.");
  }

  async function deleteOwnComment(postId, comment) {
    if (!supabase || !session?.user?.id || !comment?.id || !comment.owner) return;
    if (!window.confirm("Trajno izbrisati svoj komentar?")) return;
    const { data, error } = await supabase
      .from("comments")
      .delete()
      .eq("id", comment.id)
      .eq("author_id", session.user.id)
      .select("id")
      .maybeSingle();
    if (error || !data) {
      setNotice("Komentar nije izbrisan. Provjeri vlasništvo nad komentarom i RLS pravila.");
      return;
    }
    setCommentsByPost((current) => ({
      ...current,
      [postId]: (current[postId] || []).filter((item) => item.id !== comment.id),
    }));
    setPosts((current) => current.map((post) => (
      post.id === postId ? { ...post, comments: Math.max(0, (post.comments || 0) - 1) } : post
    )));
    setNotice("Tvoj komentar je izbrisan.");
  }

  function startEdit(post) {
    if (!post.owner) return;
    setEditingPostId(post.id);
    setEditDraft(post.text);
  }

  async function saveEdit(id) {
    const text = editDraft.trim();
    if (!text) {
      setNotice("Objava ne može biti prazna.");
      return;
    }
    if (!supabase || !session?.user?.id) {
      setNotice("Za trajno uređivanje objave potrebno je prijaviti se.");
      return;
    }
    const { data, error } = await supabase
      .from("posts")
      .update({ body: text, updated_at: new Date().toISOString() })
      .eq("id", id)
      .eq("author_id", session.user.id)
      .select("id, body, updated_at")
      .maybeSingle();
    if (error || !data) {
      setNotice("Objava nije uređena u bazi. Provjeri vlasništvo nad objavom i RLS pravila.");
      return;
    }
    setPosts((current) => current.map((post) => post.id === id
      ? { ...post, text: data.body || "", time: "Uređeno " + new Date(data.updated_at || Date.now()).toLocaleString("hr-HR", { dateStyle: "medium", timeStyle: "short" }) }
      : post));
    setEditingPostId(null);
    setEditDraft("");
    setNotice("Vlastita objava uspješno je uređena i spremljena.");
  }

  async function deletePost(id) {
    if (!supabase || !session?.user?.id) {
      setNotice("Za trajno brisanje objave potrebno je prijaviti se.");
      return;
    }
    if (!window.confirm("Želiš li trajno izbrisati ovu svoju objavu?")) return;
    const { data, error } = await supabase
      .from("posts")
      .delete()
      .eq("id", id)
      .eq("author_id", session.user.id)
      .select("id")
      .maybeSingle();
    if (error || !data) {
      setNotice("Objava nije izbrisana. Možeš brisati samo vlastite objave; provjeri RLS pravila.");
      return;
    }
    setPosts((current) => current.filter((post) => post.id !== id));
    setCommentsByPost((current) => {
      const next = { ...current };
      delete next[id];
      return next;
    });
    setOpenComments((current) => current.filter((item) => item !== id));
    if (editingPostId === id) {
      setEditingPostId(null);
      setEditDraft("");
    }
    setNotice("Vlastita objava izbrisana je iz baze zajednice.");
  }

  async function reportCommunityHelpAd(event) {
    event.preventDefault();
    if (!supabase || !session?.user?.id || !communityHelpReportAd?.id) {
      setAuthMode("login");
      setAuthMessage("Za prijavu oglasa potrebno je prijaviti se.");
      setAuthOpen(true);
      return;
    }
    setCommunityHelpReportBusy(true);
    const { error } = await supabase.from("community_help_ad_reports").insert({
      ad_id: communityHelpReportAd.id,
      reporter_id: session.user.id,
      reason: communityHelpReportReason,
      details: communityHelpReportDetails.trim() || null
    });
    setCommunityHelpReportBusy(false);
    if (error) {
      setNotice(error.code === "23505"
        ? "Ovaj oglas već si prijavio/la."
        : "Prijava nije spremljena. Pokušaj ponovno ili provjeri vezu s bazom.");
      return;
    }
    setCommunityHelpReportAd(null);
    setCommunityHelpReportReason("spam");
    setCommunityHelpReportDetails("");
    setNotice("Prijava oglasa poslana je moderatorima. Hvala što čuvaš sigurnost zajednice.");
  }

  async function updateCommunityHelpAdStatus(ad, status) {
    if (!supabase || !session?.user?.id || ad?.author_id !== session.user.id) return;
    const label = status === "closed" ? "označiti oglas kao riješen" : "ponovno otvoriti oglas";
    if (!window.confirm("Želiš li " + label + "?")) return;
    const { data, error } = await supabase.from("community_help_ads")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", ad.id).eq("author_id", session.user.id)
      .select("id, status").maybeSingle();
    if (error || !data) {
      setNotice("Status oglasa nije promijenjen. Provjeri vezu i prava pristupa.");
      return;
    }
    setCommunityActionAds((current) => status === "open"
      ? current.map((item) => item.id === ad.id ? { ...item, status } : item)
      : current.filter((item) => item.id !== ad.id));
    setNotice(status === "closed" ? "Oglas je označen kao riješen." : "Oglas je ponovno otvoren.");
  }

  async function deleteCommunityHelpAd(ad) {
    if (!supabase || !session?.user?.id || ad?.author_id !== session.user.id) return;
    if (!window.confirm("Trajno izbrisati ovaj oglas? Ovu radnju nije moguće poništiti.")) return;
    const { data, error } = await supabase.from("community_help_ads")
      .delete().eq("id", ad.id).eq("author_id", session.user.id).select("id").maybeSingle();
    if (error || !data) {
      setNotice("Oglas nije izbrisan. Provjeri vezu i prava pristupa.");
      return;
    }
    setCommunityActionAds((current) => current.filter((item) => item.id !== ad.id));
    setNotice("Oglas je trajno izbrisan.");
  }

  async function updateCommunityHelpReport(report, status) {
    if (!isOwner || !supabase || !report?.id) return;
    const { data, error } = await supabase.from("community_help_ad_reports")
      .update({ status }).eq("id", report.id).select("id, status").maybeSingle();
    if (error || !data) {
      setNotice("Status prijave oglasa nije promijenjen.");
      return;
    }
    setCommunityHelpAdReports((current) => current.map((item) => item.id === report.id ? { ...item, status: data.status } : item));
    setNotice("Status prijave oglasa je ažuriran.");
  }

  async function submitCommunityAction(event) {
    event.preventDefault();
    if (!communityActionTitle.trim() || !communityActionDetails.trim()) {
      setNotice("Ispuni naslov i opis oglasa.");
      return;
    }
    if (!session?.user?.id) {
      setAuthMode("login");
      setAuthMessage("Prijavi se ili izradi račun kako bi objavio/la oglas.");
      setAuthOpen(true);
      return;
    }
    if (!supabase || !["trebam-pomoc", "pruzi-ruku"].includes(communityActionPage)) {
      setNotice("Oglasnik trenutačno nije dostupan.");
      return;
    }
    setCommunityActionBusy(true);
    const adType = communityActionPage === "trebam-pomoc" ? "seeking" : "offering";
    const { data, error } = await supabase.from("community_help_ads").insert({
      author_id: session.user.id,
      ad_type: adType,
      title: communityActionTitle.trim(),
      description: communityActionDetails.trim(),
      category: communityActionCategory,
      location: communityActionLocation.trim() || null
    }).select("id, author_id, ad_type, title, description, category, location, created_at").single();
    setCommunityActionBusy(false);
    if (error) {
      setNotice(error.message?.includes("community_help_ads")
        ? "Oglasnik još nije postavljen u bazi. Primijeni docs/sql/community-help-ads.sql u Supabaseu."
        : "Oglas nije spremljen: " + (error.message || "provjeri vezu i prava pristupa."));
      return;
    }
    setCommunityActionAds((current) => [data, ...current]);
    setCommunityActionTitle("");
    setCommunityActionDetails("");
    setCommunityActionLocation("");
    setCommunityActionCategory("Savjet i preporuka");
    setNotice("Oglas je objavljen i sada je vidljiv članovima zajednice.");
  }

  return (
    <div className="app-shell">
      {["trebam-pomoc", "pruzi-ruku"].includes(communityActionPage) && (
        <section className="community-action-page" aria-labelledby="community-action-heading">
          <div className="community-action-topbar">
            <a className="community-action-brand" href="/" aria-label="Povratak na Čuvare nasljeđa"><BrandMark /><span><strong>Čuvari nasljeđa</strong><small>ZAJEDNO MOŽEMO VIŠE</small></span></a>
            <a className="community-action-back" href="/">← Povratak na zajednicu</a>
          </div>
          <div className="community-action-content">
            <span className={communityActionPage === "trebam-pomoc" ? "community-action-symbol help" : "community-action-symbol offer"} aria-hidden="true">{communityActionPage === "trebam-pomoc" ? "🤝" : "🫶"}</span>
            <p className="community-action-eyebrow">ČUVARI NASLJEĐA · ZAJEDNO MOŽEMO VIŠE</p>
            <h1 id="community-action-heading">{communityActionPage === "trebam-pomoc" ? "Trebaš pomoć?" : "Pruži ruku"}</h1>
            <p className="community-action-intro">{communityActionPage === "trebam-pomoc" ? "Napiši što ti treba. Netko iz zajednice možda ima savjet, iskustvo ili mogućnost pomoći." : "Podijeli što možeš ponuditi — svoje znanje, vještinu, vrijeme ili praktičnu pomoć drugom članu."}</p>
            <div className="community-action-type-switch" aria-label="Vrsta oglasa">
              <a className={communityActionPage === "trebam-pomoc" ? "selected" : ""} href="/?zajedno=trebam-pomoc">Tražim pomoć</a>
              <a className={communityActionPage === "pruzi-ruku" ? "selected" : ""} href="/?zajedno=pruzi-ruku">Nudim pomoć</a>
            </div>
            <div className="community-action-guidance"><strong>{communityActionPage === "trebam-pomoc" ? "Objavi oglas za pomoć" : "Objavi oglas s ponudom pomoći"}</strong><p>{communityActionPage === "trebam-pomoc" ? "Opiši što ti treba. Nemoj javno objavljivati adresu, broj telefona, bankovne podatke ili druge osjetljive podatke." : "Napiši koju pomoć nudiš, kome može koristiti i postoje li ograničenja. Objavljuj samo ono što zaista možeš ponuditi."}</p></div>
            <form className="community-action-form" onSubmit={submitCommunityAction}>
              <label htmlFor="community-action-title">Naslov oglasa</label>
              <input id="community-action-title" value={communityActionTitle} onChange={(event) => setCommunityActionTitle(event.target.value)} maxLength={120} placeholder={communityActionPage === "trebam-pomoc" ? "Npr. Trebam savjet oko…" : "Npr. Mogu pomoći s računalima…"} required />
              <label htmlFor="community-action-category">Kategorija</label>
              <select id="community-action-category" value={communityActionCategory} onChange={(event) => setCommunityActionCategory(event.target.value)} required>
                <option>Savjet i preporuka</option>
                <option>Kućanstvo i popravci</option>
                <option>Prijevoz i pratnja</option>
                <option>Računala i tehnologija</option>
                <option>Učenje i poduka</option>
                <option>Obitelj i svakodnevica</option>
                <option>Volontiranje i zajednica</option>
                <option>Razmjena stvari</option>
                <option>Ostalo</option>
              </select>
              <label htmlFor="community-action-location">Mjesto ili područje (neobavezno)</label>
              <input id="community-action-location" value={communityActionLocation} onChange={(event) => setCommunityActionLocation(event.target.value)} maxLength={100} placeholder="Npr. Sinj, Trilj ili online" />
              <label htmlFor="community-action-details">Opis oglasa</label>
              <textarea id="community-action-details" value={communityActionDetails} onChange={(event) => setCommunityActionDetails(event.target.value)} maxLength={4000} rows={6} placeholder={communityActionPage === "trebam-pomoc" ? "Opiši što ti treba i kakav bi ti odgovor pomogao…" : "Opiši što nudiš, kome može biti korisno i kako…"} required />
              <p className="community-action-privacy">Oglas će biti vidljiv prijavljenim članovima. Dogovore sklapajte oprezno i ne objavljujte osobne ni financijske podatke.</p>
              {notice && <p className="community-action-notice" role="status">{notice}</p>}
              <button className="community-action-submit" type="submit" disabled={communityActionBusy}>{communityActionBusy ? "Objavljujem…" : communityActionPage === "trebam-pomoc" ? "Objavi zahtjev za pomoć" : "Objavi ponudu pomoći"} <span aria-hidden="true">→</span></button>
              {!session?.user?.id && <p className="community-action-login-note">Za objavu se potrebno prijaviti ili izraditi račun.</p>}
            </form>
            <section className="community-action-listing" aria-labelledby="community-action-listing-title">
              <div className="community-action-listing-heading"><div><p className="community-action-eyebrow">OGLASNIK ZAJEDNICE</p><h2 id="community-action-listing-title">{communityActionPage === "trebam-pomoc" ? "Članovi koji traže pomoć" : "Članovi koji nude pomoć"}</h2></div><span>{communityActionAds.length}</span></div>
              {communityActionLoading ? <p className="community-action-empty">Učitavam oglase…</p> : communityActionAds.length ? <div className="community-action-ad-list">{communityActionAds.map((ad) => {
                const member = memberDirectory.find((item) => item.id === ad.author_id);
                const authorLabel = ad.author_id === session?.user?.id ? (profileName || "Ti") : (member?.display_name || member?.username || "Čuvar nasljeđa");
                return <article className="community-action-ad" key={ad.id}>
                  <div className="community-action-ad-meta"><span>{ad.status === "closed" ? "RIJEŠENO" : ad.ad_type === "seeking" ? "TRAŽI POMOĆ" : "NUDI POMOĆ"}</span><time dateTime={ad.created_at}>{new Date(ad.created_at).toLocaleDateString("hr-HR", {day:"numeric",month:"short",year:"numeric"})}</time></div>
                  <h3>{ad.title}</h3><p>{ad.description}</p>
                  <div className="community-action-ad-tags"><span>{ad.category}</span>{ad.location && <span>⌖ {ad.location}</span>}</div>
                  <small className="community-action-ad-author">Objavio/la: {authorLabel}</small>
                  <div className="community-action-ad-actions">
                    {session?.user?.id && ad.author_id !== session.user.id && <button type="button" onClick={() => { window.location.href = "/?contact=" + encodeURIComponent(ad.author_id); }}>✉ Kontaktiraj člana</button>}
                    {session?.user?.id && ad.author_id === session.user.id && ad.status === "open" && <button type="button" onClick={() => updateCommunityHelpAdStatus(ad, "closed")}>✓ Označi riješeno</button>}
                    {session?.user?.id && ad.author_id === session.user.id && ad.status === "closed" && <button type="button" onClick={() => updateCommunityHelpAdStatus(ad, "open")}>↻ Ponovno otvori</button>}
                    {session?.user?.id && ad.author_id !== session.user.id && <button type="button" className="community-action-report-button" onClick={() => { setCommunityHelpReportAd(ad); setCommunityHelpReportReason("spam"); setCommunityHelpReportDetails(""); }}>⚑ Prijavi oglas</button>}
                    {session?.user?.id && ad.author_id === session.user.id && <button type="button" className="community-action-report-button" onClick={() => deleteCommunityHelpAd(ad)}>Izbriši</button>}
                  </div>
                </article>;
              })}</div> : <p className="community-action-empty">{communityActionPage === "trebam-pomoc" ? "Još nema aktivnih oglasa za pomoć. Možeš biti prvi/a i objaviti što ti treba." : "Još nema aktivnih ponuda pomoći. Možeš biti prvi/a i ponuditi ono što znaš."}</p>}
            </section>
            {isOwner && <section className="community-action-listing" aria-labelledby="community-help-reports-title">
              <div className="community-action-listing-heading"><div><p className="community-action-eyebrow">MODERACIJA</p><h2 id="community-help-reports-title">Prijave oglasa</h2></div><span>{communityHelpAdReports.filter((item) => item.status === "open" || item.status === "reviewing").length}</span></div>
              {communityHelpAdReportsLoading ? <p className="community-action-empty">Učitavam prijave…</p> : communityHelpAdReports.length ? <div className="community-action-ad-list">{communityHelpAdReports.map((report) => <article className="community-action-ad" key={report.id}>
                <div className="community-action-ad-meta"><span>{report.status.toLocaleUpperCase("hr")}</span><time>{new Date(report.created_at).toLocaleDateString("hr-HR")}</time></div>
                <h3>{report.community_help_ads?.title || "Oglas je uklonjen"}</h3><p>Razlog: {({spam:"Spam",scam:"Sumnja na prijevaru",harassment:"Uznemiravanje ili prijetnje",hate:"Govor mržnje",privacy:"Povreda privatnosti",other:"Drugo"})[report.reason] || report.reason}</p>
                {report.details && <p>{report.details}</p>}
                <div className="community-action-ad-actions"><button type="button" onClick={() => updateCommunityHelpReport(report, "reviewing")}>U pregledu</button><button type="button" onClick={() => updateCommunityHelpReport(report, "resolved")}>Riješeno</button><button type="button" onClick={() => updateCommunityHelpReport(report, "dismissed")}>Odbaci</button></div>
              </article>)}</div> : <p className="community-action-empty">Trenutačno nema prijava oglasa.</p>}
            </section>}
          </div>
          {communityHelpReportAd && <div className="community-action-modal-backdrop" role="presentation" onClick={(event) => { if (event.target === event.currentTarget && !communityHelpReportBusy) setCommunityHelpReportAd(null); }}>
            <section className="community-action-report-modal" role="dialog" aria-modal="true" aria-labelledby="community-help-report-title">
              <button type="button" className="community-action-modal-close" aria-label="Zatvori" onClick={() => setCommunityHelpReportAd(null)}>×</button>
              <p className="community-action-eyebrow">SIGURNOST ZAJEDNICE</p><h2 id="community-help-report-title">Prijavi oglas</h2><p>Prijavljuješ: <strong>{communityHelpReportAd.title}</strong></p>
              <form className="community-action-form" onSubmit={reportCommunityHelpAd}>
                <label htmlFor="community-help-report-reason">Razlog prijave</label>
                <select id="community-help-report-reason" value={communityHelpReportReason} onChange={(event) => setCommunityHelpReportReason(event.target.value)} required>
                  <option value="spam">Spam ili neželjeni sadržaj</option><option value="scam">Sumnja na prijevaru</option><option value="harassment">Uznemiravanje ili prijetnje</option><option value="hate">Govor mržnje</option><option value="privacy">Povreda privatnosti</option><option value="other">Drugo</option>
                </select>
                <label htmlFor="community-help-report-details">Dodatni detalji (neobavezno)</label>
                <textarea id="community-help-report-details" rows={4} maxLength={2000} value={communityHelpReportDetails} onChange={(event) => setCommunityHelpReportDetails(event.target.value)} placeholder="Objasni zašto je oglas problematičan…" />
                <button className="community-action-submit" type="submit" disabled={communityHelpReportBusy}>{communityHelpReportBusy ? "Šaljem prijavu…" : "Pošalji prijavu"} <span aria-hidden="true">→</span></button>
              </form>
            </section>
          </div>}
        </section>
      )}
      <div className="preview-ribbon">
        <span className="status-dot" /> RAZVOJNI PREGLED
        <span>Zajednica je u razvoju · povezivanje i pojedine funkcije još se provjeravaju.</span>
      </div>

      <header className="topbar">
        <a className="brand" href="#pocetna" onClick={() => setActiveNav("PatriaSoul")}>
          <BrandMark />
          <span className="brand-copy">
            <strong>PatriaSoul</strong>
            <small>ČUVARI NASLJEĐA</small>
          </span>
        </a>
        <div className="global-search-wrap">
          <span className="global-search-icon" aria-hidden="true">⌕</span>
          <input
            className="global-search"
            type="search"
            aria-label="Pretraži objave i članove"
            placeholder="Pretraži objave, članove i grupe…"
            value={feedSearch}
            onChange={(event) => { setFeedSearch(event.target.value); setActiveNav("PatriaSoul"); }}
          />
          {feedSearch && <button className="global-search-clear" type="button" aria-label="Očisti pretragu" onClick={() => setFeedSearch("")}>×</button>}
        </div>
        <nav className="topnav" aria-label="Brza navigacija">
          <button className={activeNav === "PatriaSoul" ? "topnav-link active" : "topnav-link"} onClick={() => setActiveNav("PatriaSoul")} aria-label="Početna">⌂</button>
          <button className={activeNav === "Čuvari nasljeđa" ? "topnav-link active" : "topnav-link"} onClick={() => navigateToSection("Čuvari nasljeđa")} aria-label="Članovi">👥</button>
          <button className={activeNav === "Poruke" ? "topnav-link active" : "topnav-link"} onClick={() => navigateToSection("Poruke")} aria-label="Poruke">✉</button>
          <button className={activeNav === "Obavijesti" ? "topnav-link active" : "topnav-link"} onClick={() => navigateToSection("Obavijesti")} aria-label="Obavijesti">🔔</button>
        </nav>
        <div className="top-actions">
          {session ? (
            <div className="auth-session-actions">
              <button className="profile-open-button" onClick={() => { setProfileOpen(true); setProfileMessage(""); }}><span className="profile-mini-avatar">{profileAvatarUrl ? <img src={profileAvatarUrl} alt="" /> : (session.user?.user_metadata?.display_name || session.user?.email || "Č").slice(0, 1).toLocaleUpperCase("hr")}</span><span className="auth-user-label">{session.user?.user_metadata?.display_name || session.user?.email || "Moj profil"}</span><span className="profile-open-label">Moj profil</span></button>
              <button className="login-button" onClick={signOut}>Odjava</button>
            </div>
          ) : (
            <button className="login-button" onClick={() => navigateToSection("PatriaSoul")}>PatriaSoul</button>
          )}
        </div>
      </header>

      <main className="page-layout" id="pocetna">
        <aside className="left-sidebar">
          <section className="community-card community-profile-card">
            <div className="community-banner"><span>HRVATSKA · POVIJEST · ZAJEDNIŠTVO</span><span className="community-status"><i /> ZAJEDNICA</span></div>
            <div className="community-body">
              <div className="community-emblem"><BrandMark /></div>
              <div className="community-profile-title"><h2>Čuvari nasljeđa</h2><span className="community-verified" title="Službena zajednica PatriaSoul" aria-label="Službena zajednica">✓</span></div>
              <p>Mjesto za ljude koji čuvaju priče, običaje i uspomene — i prenose ih novim naraštajima.</p>
              <div className="community-topic-tags"><span>Baština</span><span>Povijest</span><span>Zajedništvo</span></div>
              <div className="community-stats">
                <div><strong>{postCount}</strong><span>objava</span></div>
                <div><strong>{groupChats.length}</strong><span>grupa</span></div>
              </div>
              <button type="button" className="community-profile-action" onClick={() => { setActiveNav("PatriaSoul"); if (session?.user?.id) { document.getElementById("post-draft")?.focus(); } else { setAuthOpen(true); setAuthMode("login"); setAuthMessage("Prijavi se ili izradi račun kako bi podijelio/la svoju priču."); } }}>＋ Podijeli priču</button>
            </div>
          </section>

          <a className="quiz-sidebar-link" href="/kviz/" aria-label="Otvori PatriaSoul kviz">
            <span className="quiz-sidebar-mark"><img src="/assets/images/1000000982.png" alt="" /></span>
            <span className="quiz-sidebar-copy"><strong>PatriaSoul kviz</strong><small>Znanje · Ponos · Nasljeđe</small></span>
            <span className="quiz-sidebar-arrow">↗</span>
          </a>
          <section className="side-section sidebar-nav-section">
            <h3>MOJA ZAJEDNICA</h3>
            {navItems.filter((item) => ["PatriaSoul", "Kviz", "Forum", "Stranice", "Čuvari nasljeđa", "Grupe"].includes(item.label)).map((item) => (
              <button key={item.label} className={activeNav === item.label ? "side-link selected" : "side-link"} onClick={() => item.label === "Kviz" ? (window.location.href = "/kviz/") : item.label === "Forum" ? (window.location.href = "/forum.html") : item.label === "Stranice" ? (window.location.href = "/stranice.html") : setActiveNav(item.label)}>
                <span className="side-icon">{item.icon}</span><span className="side-link-label">{item.label}</span>
                {item.label === "Čuvari nasljeđa" && <span className="side-count">{memberDirectory.length || ""}</span>}
                {item.label === "Grupe" && <span className="side-count">{groupChats.length || ""}</span>}
              </button>
            ))}
          </section>
          <section className="side-section sidebar-nav-section today-sidebar-section">
            <h3>ISTRAŽI HRVATSKU</h3>
            <a className="side-link today-sidebar-link" href="/na-danasnji-dan.html" title="Otvori povijesne događaje za odabrani datum">
              <span className="side-icon" aria-hidden="true">📅</span><span className="side-link-label">Na današnji dan</span><span className="today-sidebar-arrow" aria-hidden="true">↗</span>
            </a>
          </section>

          <section className="side-section sidebar-nav-section">
            <h3>RAZGOVORI</h3>
            {navItems.filter((item) => ["Poruke", "Obavijesti"].includes(item.label)).map((item) => {
              const unreadNotifications = notifications.filter((notification) => !notification.read_at);
              const unreadMessages = unreadNotifications.filter((notification) => notification.type === "private_message").length;
              const unreadGroups = Object.values(groupUnreadCounts).reduce((sum, count) => sum + (Number(count) || 0), 0);
              const badgeCount = item.label === "Poruke" ? unreadMessages : unreadNotifications.length;
              const badgeLabel = item.label === "Poruke" ? "nepročitanih obavijesti o porukama" : "nepročitanih obavijesti";
              return <button key={item.label} className={activeNav === item.label ? "side-link selected" : "side-link"} onClick={() => navigateToSection(item.label)}>
                <span className="side-icon">{item.icon}</span><span className="side-link-label">{item.label}</span>
                {item.label === "Poruke" && unreadGroups > 0 && <span className="side-count group-side-count" title={unreadGroups + " nepročitanih grupnih poruka"}>＋{unreadGroups > 99 ? "99+" : unreadGroups}</span>}
                {badgeCount > 0 && <span className="side-count side-count-badge" aria-label={badgeCount + " " + badgeLabel}>{badgeCount > 99 ? "99+" : badgeCount}</span>}
              </button>;
            })}
            {navItems.filter((item) => item.label === "Događaji").map((item) => <button key={item.label} className="side-link" onClick={() => { window.location.href = "/dogadaji.html"; }}><span className="side-icon">{item.icon}</span><span className="side-link-label">{item.label}</span><span className="side-count">Kalendar</span></button>)}
          </section>

          {isOwner && <section className="side-section sidebar-nav-section owner-admin-nav"><h3>VLASNIK MREŽE</h3><button type="button" className={activeNav === "Administracija" ? "side-link selected" : "side-link"} onClick={() => { window.location.href = "/administracija.html"; }}><span className="side-icon">⚙</span><span className="side-link-label">Administracija</span><span className="owner-admin-badge">VLASNIK</span></button></section>}

          {session && blockedMembers.length > 0 && (
            <section className="side-section blocked-members-section">
              <h3>BLOKIRANI ČLANOVI</h3>
              {blockedMembers.map((member) => (
                <div className="blocked-member-row" key={member.id}>
                  <span title={member.id}>{member.name}</span>
                  <button type="button" disabled={blockBusyId === member.id} onClick={() => unblockMember(member)}>{blockBusyId === member.id ? "…" : "Odblokiraj"}</button>
                </div>
              ))}
            </section>
          )}

          <section className="quiz-promo-card" aria-label="PatriaSoul kviz">
            <div className="quiz-promo-top">
              <span className="quiz-promo-icon" aria-hidden="true">🧠</span>
              <span className="quiz-promo-kicker">PATRIASOUL KVIZ</span>
              <span className="quiz-promo-flag" aria-hidden="true">🇭🇷</span>
            </div>
            <h3>Koliko poznaješ Hrvatsku?</h3>
            <p>Provjeri znanje o povijesti, gradovima i hrvatskoj baštini.</p>
            <a className="quiz-promo-action" href="/kviz/">
              <span>Pokreni kviz</span><span aria-hidden="true">↗</span>
            </a>
            <span className="quiz-promo-note">Znanje. Ponos. Nasljeđe.</span>
          </section>

          <section className="side-section values-card">
            <h3>NAŠA TRI TEMELJA</h3>
            <p><span>✦</span> Vjera</p>
            <p><span>✦</span> Obitelj</p>
            <p><span>✦</span> Domovina</p>
          </section>
          <p className="sidebar-foot">PatriaSoul · Znanje. Ponos. Nasljeđe.</p>
        </aside>

        <section className="feed-column" aria-label="PatriaSoul – Čuvari nasljeđa">
          <section className="welcome-panel" aria-label="Dobrodošlica u PatriaSoul">
            <div className="welcome-photo-layer" aria-hidden="true">
              <img
                className="welcome-hero-image"
                src="/assets/images/hrvatska-sahovnica%20domovina%20hero.jpg"
                alt=""
                fetchPriority="high"
              />
            </div>
            <div className="welcome-copy">
              <span className="eyebrow">VJERA · OBITELJ · DOMOVINA</span>
              <h1>Zajedno čuvamo<br />našu povijest,<br /><em>naše nasljeđe.</em></h1>
              <p>Priče, fotografije i uspomene koje povezuju Hrvatsku i njezine ljude.</p>
              <button type="button" className="welcome-cta" onClick={() => { if (session?.user?.id) { document.getElementById("post-draft")?.focus(); } else { setAuthOpen(true); setAuthMode("login"); setAuthMessage("Prijavi se ili izradi račun kako bi podijelio/la svoju priču."); } }}>Podijeli svoju priču <span aria-hidden="true">↗</span></button>
            </div>
            <button
              type="button"
              className="welcome-image-trigger"
              onClick={() => setBrandImageOpen(true)}
              aria-label="Otvori sliku znaka Čuvari nasljeđa"
              title="Otvori sliku"
            >
              <img src="/assets/images/PATRIA_SOUL_ORIGINAL_ISPRAVLJEN_GRB.png" alt="Izvorni ispravljeni grb PatriaSoul" />
              <span aria-hidden="true">Pogledaj sliku</span>
            </button>
          </section>

          <section className="community-hub-links" aria-label="Istraži PatriaSoul sadržaje">
            <div className="community-hub-heading">
              <span className="eyebrow">SVE NA JEDNOM MJESTU</span>
              <h2>Istraži zajednicu</h2>
              <p>Kviz, razgovori i stranice zajednice povezani su s glavnim zidom.</p>
            </div>
            <div className="community-hub-grid">
              <a className="community-hub-card quiz-hub-card" href="/kviz/">
                <span className="community-hub-icon">🧠</span><span className="community-hub-copy"><strong>PatriaSoul kviz</strong><small>Provjeri znanje i podijeli svoj rezultat.</small></span><span className="community-hub-arrow">↗</span>
              </a>
              <a className="community-hub-card" href="/forum.html">
                <span className="community-hub-icon">▤</span><span className="community-hub-copy"><strong>Domoljubni forum</strong><small>Rubrike, teme i odgovori na jednom mjestu.</small></span><span className="community-hub-arrow">↗</span>
              </a>
              <a className="community-hub-card" href="/stranice.html">
                <span className="community-hub-icon">▣</span><span className="community-hub-copy"><strong>Stranice zajednice</strong><small>Otkrij stranice, pokreni svoju i objavljuj.</small></span><span className="community-hub-arrow">↗</span>
              </a>
              <a className="community-hub-card ai-hub-card" href="/ai-centar.html">
                <span className="community-hub-icon">✦</span><span className="community-hub-copy"><strong>PatriaSoul Centar</strong><small>Središte znanja, hrvatske baštine i pametnih alata.</small></span><span className="community-hub-arrow">↗</span>
              </a>
            </div>
          </section>

          {brandImageOpen && (
            <div className="image-viewer-backdrop" role="presentation" onClick={() => setBrandImageOpen(false)}>
              <div className="image-viewer-dialog" role="dialog" aria-modal="true" aria-label="Slika znaka Čuvari nasljeđa" onClick={(event) => event.stopPropagation()}>
                <button type="button" className="image-viewer-close" onClick={() => setBrandImageOpen(false)} aria-label="Zatvori sliku">×</button>
                <img src="/assets/images/PATRIA_SOUL_ORIGINAL_ISPRAVLJEN_GRB.png" alt="Izvorni ispravljeni grb PatriaSoul" />
              </div>
            </div>
          )}

          {notice && (
            <div className="notice" role="status">
              <span>{notice}</span>
              <button aria-label="Zatvori obavijest" onClick={() => setNotice("")}>×</button>
            </div>
          )}

          {activeNav === "Administracija" && (isOwner ? (
            <section className="owner-admin-panel card" aria-labelledby="owner-admin-title">
              <div className="auth-panel-heading"><div><span className="eyebrow">PATRiASOUL · SIGURNOST</span><h2 id="owner-admin-title">Administracija mreže</h2><p className="profile-email">Prijavljen vlasnik: {session?.user?.email}</p></div><span className="owner-admin-badge">VLASNIK</span></div>
              <div className="owner-admin-notice"><strong>Pristup vlasnika</strong><p>Račun vlasnika prepoznat je. Prijave sadržaja prikazuju se ovdje kada ih članovi pošalju; vlasničke ovlasti provode se i pravilima baze.</p></div>
              <div className="owner-admin-summary"><div><strong>{adminReports.filter((item) => item.status === "pending").length}</strong><span>otvorenih prijava</span></div><div><strong>{adminReports.length}</strong><span>učitanih prijava</span></div></div>
              {adminError && <p className="auth-message" role="alert">{adminError}</p>}
              {adminBusy ? <p className="directory-empty">Učitavam prijave…</p> : adminReports.length ? <div className="owner-report-list">{adminReports.map((report) => <article className="owner-report-card" key={report.id}>
                <div className="owner-report-heading"><strong>Prijava · {report.reason}</strong><span className={"report-status status-" + report.status}>{({pending:"Na čekanju", reviewed:"Pregledano", dismissed:"Odbijeno", actioned:"Obrađeno"})[report.status] || report.status}</span></div>
                <p><strong>ID objave:</strong> <code>{report.post_id}</code></p>{report.details && <p><strong>Objašnjenje:</strong> {report.details}</p>}
                <small>{new Date(report.created_at).toLocaleString("hr-HR", {dateStyle:"medium",timeStyle:"short"})} · ID prijave: {report.id}</small>
                <div className="inline-form-actions"><button type="button" className="outline-button" disabled={report.status === "reviewed"} onClick={() => updateReportStatus(report,"reviewed")}>Označi pregledano</button><button type="button" className="outline-button" disabled={report.status === "dismissed"} onClick={() => updateReportStatus(report,"dismissed")}>Odbaci prijavu</button><button type="button" className="primary-button" disabled={report.status === "actioned"} onClick={() => removeReportedPost(report)}>Ukloni objavu</button></div>
              </article>)}</div> : <p className="directory-empty">Trenutačno nema prijava sadržaja. Kada član prijavi objavu, prijava će se pojaviti ovdje.</p>}
              <div className="owner-admin-links"><a href="/pravila-koristenja.html">Pravila korištenja</a><a href="/pravila-zajednice.html">Pravila zajednice</a><a href="/privatnost.html">Privatnost i sigurnost</a></div>
            </section>
          ) : <section className="owner-admin-panel card"><h2>Pristup odbijen</h2><p>Administracija je dostupna samo vlasniku mreže.</p></section>)}

          {reportPost && (
            <section className="report-panel card" aria-labelledby="report-title">
              <div className="auth-panel-heading">
                <div>
                  <span className="eyebrow">SIGURNOST ZAJEDNICE</span>
                  <h2 id="report-title">Prijavi objavu</h2>
                  <p className="profile-email">Prijava je povjerljiva i dostupna samo ovlaštenim moderatorima.</p>
                </div>
                <button type="button" className="auth-close" aria-label="Zatvori prijavu" onClick={() => setReportPost(null)}>×</button>
              </div>
              <p className="report-target">Prijavljuješ objavu korisnika <strong>{reportPost.author}</strong>.</p>
              <form className="auth-form" onSubmit={submitReport}>
                <label htmlFor="report-reason">Razlog prijave</label>
                <select id="report-reason" value={reportReason} onChange={(event) => setReportReason(event.target.value)}>
                  <option value="spam">Neželjeni sadržaj ili spam</option>
                  <option value="harassment">Uznemiravanje ili prijetnje</option>
                  <option value="hate">Govor mržnje</option>
                  <option value="misinformation">Obmanjujući ili lažni sadržaj</option>
                  <option value="privacy">Povreda privatnosti</option>
                  <option value="copyright">Moguća povreda autorskih prava</option>
                  <option value="other">Drugi razlog</option>
                </select>
                <label htmlFor="report-details">Dodatno objašnjenje (neobavezno)</label>
                <textarea id="report-details" className="profile-bio-input" value={reportDetails} onChange={(event) => setReportDetails(event.target.value)} maxLength={1000} rows={3} placeholder="Objasni što bi moderatori trebali provjeriti…" />
                <small className="profile-hint">{reportDetails.length}/1000 znakova</small>
                <div className="inline-form-actions">
                  <button type="button" className="outline-button" onClick={() => setReportPost(null)}>Odustani</button>
                  <button className="auth-submit" type="submit" disabled={reportBusy}>{reportBusy ? "Slanje…" : "Pošalji prijavu"}</button>
                </div>
              </form>
              <p className="auth-footnote">Prijava ne skriva niti automatski briše objavu. Odluku donosi moderator nakon pregleda.</p>
            </section>
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

          {activeNav === "Obavijesti" && (
            <section className="notifications-panel card" aria-labelledby="notifications-title">
              <div className="member-directory-heading">
                <div><span className="eyebrow">NOVOSTI ZA TEBE</span><h2 id="notifications-title">Obavijesti</h2><p>Ovdje se prikazuju obavijesti povezane s aktivnostima na PatriaSoul zajednici.</p></div>
                <span className="member-directory-count">{notifications.filter((item) => !item.read_at).length} nepročitanih</span>
              </div>
              {!session?.user?.id ? (
                <div className="directory-empty"><p>Prijavi se kako bi pregledao/la svoje obavijesti.</p><button className="primary-button" onClick={() => { setAuthOpen(true); setAuthMessage(""); }}>Prijava / Registracija</button></div>
              ) : notificationsBusy ? <p className="directory-empty">Učitavam obavijesti…</p> : notifications.length ? (
                <div className="notification-list">
                  {notifications.map((notification) => (
                    <article className={notification.read_at ? "notification-item" : "notification-item unread"} key={notification.id}>
                      <span className="notification-mark" aria-hidden="true">{notification.type === "private_message" ? "✉" : "•"}</span>
                      <div className="notification-copy">
                        <strong>{notification.title || "Nova obavijest"}</strong>
                        <p>{notification.body || "Imaš novu aktivnost u zajednici."}</p>
                        <small>{new Date(notification.created_at).toLocaleString("hr-HR", { dateStyle: "medium", timeStyle: "short" })}</small>
                      </div>
                      <div className="notification-actions">
                        {notification.type === "private_message" && <button type="button" className="post-menu-button" onClick={() => openNotification(notification)}>Otvori poruke</button>}
                        {!notification.read_at && <button type="button" className="post-menu-button" onClick={() => markNotificationRead(notification)}>Označi pročitano</button>}
                      </div>
                    </article>
                  ))}
                </div>
              ) : <p className="directory-empty">Još nema obavijesti. Kad stigne nova privatna poruka, pojavit će se ovdje.</p>}
            </section>
          )}

          {activeNav === "Poruke" && (
            <section className="private-messages card" aria-labelledby="private-messages-title">
              <div className="member-directory-heading">
                <div><span className="eyebrow">RAZGOVORI ČLANOVA</span><h2 id="private-messages-title">Privatne poruke</h2><p>Poruke su vidljive samo pošiljatelju i primatelju kada su sigurnosna pravila baze pravilno primijenjena.</p></div>
              </div>
              {!session?.user?.id ? (
                <div className="directory-empty"><p>Prijavi se za privatne razgovore.</p><button className="primary-button" onClick={() => { setAuthOpen(true); setAuthMessage(""); }}>Prijava / Registracija</button></div>
              ) : (
                <>
                  <form className="private-message-compose" onSubmit={sendPrivateMessage}>
                    <label htmlFor="message-recipient">Primatelj</label>
                    <select id="message-recipient" value={messageRecipient} onChange={(event) => { setMessageRecipient(event.target.value); setReplyingToMessage(null); }} required>
                      <option value="">Odaberi člana…</option>
                      {memberDirectory.filter((member) => !blockedMembers.some((blocked) => blocked.id === member.id)).map((member) => <option key={member.id} value={member.id}>{member.display_name || member.username || "Čuvar nasljeđa"}{member.username ? " · @" + normalizeUsername(member.username) : ""}</option>)}
                    </select>
                    {replyingToMessage && <div className="message-reply-compose"><div><strong>Odgovor na poruku</strong><p>{replyingToMessage.body}</p></div><button type="button" onClick={() => setReplyingToMessage(null)} aria-label="Odustani od odgovora">×</button></div>}
                    <label htmlFor="private-message-draft">Poruka</label>
                    <textarea id="private-message-draft" value={messageDraft} onChange={(event) => setMessageDraft(event.target.value)} maxLength={2000} rows="3" placeholder="Napiši privatnu poruku…" required />
                    <div className="private-message-actions"><small>{messageDraft.length}/2000 znakova</small><button className="primary-button" type="submit">Pošalji poruku ↗</button></div>
                  </form>
                  <div className="message-conversations">
                    <div className="message-search-heading"><h3>Pretraži poruke i razgovore</h3><span>{searchedMessages.length} poruka</span></div>
                    <label className="message-search-field" htmlFor="private-message-search"><span aria-hidden="true">⌕</span><input id="private-message-search" type="search" value={messageSearch} onChange={(event) => setMessageSearch(event.target.value)} placeholder="Traži tekst poruke ili ime člana…" autoComplete="off" /><button type="button" onClick={() => setMessageSearch("")} disabled={!messageSearch} aria-label="Očisti pretragu">Očisti</button></label>
                    {messageSearch.trim() && <p className="message-search-summary">Pronađeno {searchedMessages.length} poruka u {searchedConversations.length} razgovora.</p>}
                    <h3>Razgovori</h3>
                    {messagesBusy ? <p className="directory-empty">Učitavam razgovore…</p> : searchedConversations.length ? (
                      <div className="message-conversation-list">
                        {searchedConversations.map(({ memberId, latest }) => {
                          const member = memberDirectory.find((item) => item.id === memberId);
                          const displayName = member?.display_name || normalizeUsername(member?.username) || "Čuvar nasljeđa";
                          return <button type="button" key={memberId} className={messageRecipient === memberId ? "message-conversation selected" : "message-conversation"} onClick={() => setMessageRecipient(memberId)}>
                            <Avatar initials={displayName.split(/\\s+/).slice(0, 2).map((part) => part[0] || "").join("").toLocaleUpperCase("hr") || "ČN"} />
                            <span className="message-conversation-copy"><strong>{displayName}</strong><small>{latest.sender_id === session.user.id ? "Ti: " : ""}{latest.body}</small></span>
                            <time>{new Date(latest.created_at).toLocaleDateString("hr-HR")}</time>
                          </button>;
                        })}
                      </div>
                    ) : <p className="directory-empty">{messageSearch.trim() ? "Nema razgovora koji odgovaraju pretrazi." : "Razgovori će se pojaviti ovdje nakon prve poslane ili primljene poruke."}</p>}
                    {messageSearch.trim() && searchedMessages.length > 0 && <div className="message-search-results"><h3>Pronađene poruke</h3>{searchedMessages.slice(0, 30).map((message) => { const otherId = message.sender_id === session.user.id ? message.recipient_id : message.sender_id; const member = memberDirectory.find((item) => item.id === otherId); const displayName = member?.display_name || normalizeUsername(member?.username) || "Čuvar nasljeđa"; return <button type="button" className="message-search-result" key={message.id} onClick={() => { setMessageRecipient(otherId); setMessageSearch(""); setNotice("Otvoren razgovor s " + displayName + "."); }}><strong>{displayName}</strong><small>{new Date(message.created_at).toLocaleString("hr-HR", { dateStyle: "medium", timeStyle: "short" })}</small><p>{message.body}</p></button>; })}{searchedMessages.length > 30 && <small className="message-search-limit">Prikazano je prvih 30 rezultata. Suzi pretragu za preciznije rezultate.</small>}</div>}
                  </div>
                  <section className="group-chat-panel" aria-labelledby="group-chat-title">
                    <div className="message-search-heading"><h3 id="group-chat-title">Grupni razgovori</h3><span>{groupChats.length} grupa</span></div>
                    <form className="group-chat-create" onSubmit={createGroupChat}>
                      <label htmlFor="group-chat-name">Naziv nove grupe</label>
                      <input id="group-chat-name" value={groupDraftName} onChange={(event) => setGroupDraftName(event.target.value)} maxLength={60} placeholder="Npr. Čuvari povijesti Dalmacije" required />
                      <label htmlFor="group-chat-members">Dodaj članove (odaberi jednog ili više)</label>
                      <select id="group-chat-members" multiple value={groupSelectedMembers} onChange={(event) => setGroupSelectedMembers(Array.from(event.target.selectedOptions, (option) => option.value))} size={Math.min(5, Math.max(3, memberDirectory.length))}>
                        {memberDirectory.filter((member) => member.id !== session.user.id && !blockedMembers.some((blocked) => blocked.id === member.id)).map((member) => <option key={member.id} value={member.id}>{member.display_name || normalizeUsername(member.username) || "Čuvar nasljeđa"}{member.username ? " · @" + normalizeUsername(member.username) : ""}</option>)}
                      </select>
                      <div className="private-message-actions"><small>{groupSelectedMembers.length} odabranih članova</small><button className="primary-button" type="submit" disabled={groupBusy}>{groupBusy ? "Stvaram grupu…" : "＋ Stvori grupu"}</button></div>
                    </form>
                    {groupChats.length > 0 && <div className="message-conversation-list group-chat-list">
                      {groupChats.map((group) => <button type="button" key={group.id} className={activeGroupId === group.id ? "message-conversation selected" : "message-conversation"} onClick={() => setActiveGroupId(group.id)}>
                        <Avatar initials="👥" /><span className="message-conversation-copy"><strong>{group.name}</strong><small>{group.members?.length || 0} članova</small></span>{(groupUnreadCounts[group.id] || 0) > 0 && <span className="group-unread-badge" aria-label={(groupUnreadCounts[group.id] || 0) + " nepročitanih poruka"}>{groupUnreadCounts[group.id] > 99 ? "99+" : groupUnreadCounts[group.id]}</span>}
                      </button>)}
                    </div>}
                    {activeGroupId && <div className="group-chat-thread">
                      {(() => {
                        const selectedGroup = groupChats.find((group) => group.id === activeGroupId);
                        const myMembership = selectedGroup?.members?.find((item) => item.user_id === session.user.id);
                        const isAdmin = myMembership?.role === "admin";
                        const eligibleMembers = memberDirectory.filter((member) => member.id !== session.user.id && !selectedGroup?.members?.some((item) => item.user_id === member.id));
                        return <>
                          <div className="group-chat-admin-heading"><h4>{selectedGroup?.name || "Grupni razgovor"}</h4><span>{isAdmin ? "Administrator" : "Član"}</span></div>
                          {isAdmin && <>
                            <form className="group-chat-admin-form" onSubmit={saveGroupName}>
                              <label htmlFor="group-name-edit">Promijeni naziv grupe</label>
                              <div><input id="group-name-edit" value={groupNameDraft} onChange={(event) => setGroupNameDraft(event.target.value)} placeholder={selectedGroup?.name || "Novi naziv"} maxLength={60} required /><button className="post-menu-button" type="submit" disabled={groupBusy || groupNameDraft.trim().length < 2}>Spremi</button></div>
                            </form>
                            <div className="group-chat-admin-form">
                              <label htmlFor="group-member-add">Dodaj člana</label>
                              <div><select id="group-member-add" value={groupMemberToAdd} onChange={(event) => setGroupMemberToAdd(event.target.value)}><option value="">Odaberi člana…</option>{eligibleMembers.map((member) => <option key={member.id} value={member.id}>{member.display_name || member.username || "Čuvar nasljeđa"}</option>)}</select><button className="post-menu-button" type="button" onClick={addGroupMember} disabled={groupBusy || !groupMemberToAdd}>Dodaj</button></div>
                            </div>
                            <div className="group-chat-admin-form"><label>Upravljanje članovima</label>
                              <div className="group-chat-member-admin-list">{(selectedGroup?.members || []).map((member) => {
                                const profile = memberDirectory.find((item) => item.id === member.user_id);
                                const memberName = member.user_id === session.user.id ? "Ti" : (profile?.display_name || normalizeUsername(profile?.username) || "Čuvar nasljeđa");
                                return <div className="group-chat-member-admin" key={member.user_id}><span>{memberName}<small>{member.role === "admin" ? "Administrator" : "Član"}</small></span>{member.user_id !== session.user.id && <span className="group-chat-member-actions">{member.role !== "admin" && <button type="button" className="post-menu-button" disabled={groupBusy} onClick={() => transferGroupAdmin(member)}>Postavi admina</button>}<button type="button" className="post-menu-button danger" disabled={groupBusy || member.role === "admin"} onClick={() => removeGroupMember(member)}>Ukloni</button></span>}</div>;
                              })}</div>
                            </div>
                          </>}
                          <div className="group-chat-admin-form group-chat-danger-actions">
                            <label>Radnje za grupu</label>
                            <div>
                              <button type="button" className="post-menu-button" onClick={leaveGroupChat} disabled={groupBusy}>Napusti grupu</button>
                              {isAdmin && <button type="button" className="post-menu-button danger" onClick={deleteGroupChat} disabled={groupBusy}>Trajno izbriši grupu</button>}
                            </div>
                            <small>Grupu može izbrisati samo administrator. Brisanje uklanja i sve poruke grupe.</small>
                          </div>
                        </>;
                      })()}
                      <div className="group-chat-messages">{groupMessages.map((message) => {
                        const sender = memberDirectory.find((member) => member.id === message.sender_id);
                        const outgoing = message.sender_id === session.user.id;
                        const editing = groupEditingMessageId === message.id;
                        return <article key={message.id} className={outgoing ? "group-chat-message outgoing" : "group-chat-message"}>
                          <strong>{outgoing ? "Ti" : (sender?.display_name || sender?.username || "Čuvar nasljeđa")}</strong>
                          {message.reply_to_id && <div className="group-message-reply-quote"><small>Odgovor na poruku</small><p>{groupMessages.find((item) => item.id === message.reply_to_id)?.body || "Izvorna poruka nije dostupna u učitanom razgovoru."}</p></div>}
                          {editing ? <form className="group-message-edit-form" onSubmit={saveGroupMessageEdit}>
                            <textarea value={groupMessageEditDraft} onChange={(event) => setGroupMessageEditDraft(event.target.value)} maxLength={2000} rows="3" required />
                            <div><button type="submit" className="post-menu-button" disabled={groupMessageActionBusyId === message.id || !groupMessageEditDraft.trim()}>Spremi</button><button type="button" className="post-menu-button" disabled={groupMessageActionBusyId === message.id} onClick={() => { setGroupEditingMessageId(null); setGroupMessageEditDraft(""); }}>Odustani</button></div>
                          </form> : <p>{message.body}</p>}
                          <div className="group-message-reactions" aria-label="Reakcije na poruku">
                            {["❤️", "👍", "😂", "🙏", "🇭🇷"].map((emoji) => {
                              const matching = groupMessageReactions.filter((item) => item.message_id === message.id && item.reaction === emoji);
                              const selected = matching.some((item) => item.user_id === session.user.id);
                              return <button key={emoji} type="button" className={selected ? "group-reaction selected" : "group-reaction"} aria-pressed={selected} title={matching.length + " reakcija"} disabled={groupReactionBusy === message.id + ":" + emoji} onClick={() => toggleGroupMessageReaction(message, emoji)}>{emoji}<span>{matching.length || ""}</span></button>;
                            })}
                          </div>
                          {outgoing && (() => { const readers = groupMessageReads.filter((read) => read.message_id === message.id && read.user_id !== session.user.id); const names = readers.map((read) => { const member = memberDirectory.find((item) => item.id === read.user_id); return member?.display_name || member?.username; }).filter(Boolean); return readers.length ? <div className="group-message-read-status" title={names.join(", ")}>Pročitano{names.length ? ": " + names.join(", ") : " · " + readers.length + (readers.length === 1 ? " član" : " članova")}</div> : null; })()}
                          <div className="group-message-meta"><small>{new Date(message.created_at).toLocaleString("hr-HR", { dateStyle: "short", timeStyle: "short" })}</small>
                            <span className="group-message-actions"><button type="button" className="post-menu-button" onClick={() => setReplyingToGroupMessage({ id: message.id, body: message.body, sender: outgoing ? "Ti" : (sender?.display_name || sender?.username || "Čuvar nasljeđa") })}>Odgovori</button>{outgoing && !editing && <><button type="button" className="post-menu-button" disabled={groupMessageActionBusyId === message.id} onClick={() => { setGroupEditingMessageId(message.id); setGroupMessageEditDraft(message.body); }}>Uredi</button><button type="button" className="post-menu-button danger" disabled={groupMessageActionBusyId === message.id} onClick={() => deleteGroupMessage(message)}>Izbriši</button></>}</span>
                          </div>
                        </article>;
                      })}{!groupMessages.length && <p className="directory-empty">Ovo je početak grupnog razgovora. Pošalji prvu poruku.</p>}</div>
                      <form className="group-chat-compose" onSubmit={sendGroupMessage}>
                        {replyingToGroupMessage && <div className="group-replying-banner"><div><small>Odgovaraš članu: {replyingToGroupMessage.sender}</small><p>{replyingToGroupMessage.body}</p></div><button type="button" className="post-menu-button" onClick={() => setReplyingToGroupMessage(null)}>Odustani</button></div>}
                        <textarea value={groupMessageDraft} onChange={(event) => setGroupMessageDraft(event.target.value)} maxLength={2000} rows="2" placeholder="Poruka za grupu…" required />
                        <div className="private-message-actions"><small>{groupMessageDraft.length}/2000</small><button type="submit" className="primary-button">Pošalji u grupu ↗</button></div>
                      </form>
                    </div>}
                  </section>
                  <div className="private-message-list">
                    <h3>{messageRecipient ? "Razgovor" : "Odaberi razgovor"}</h3>
                    {messagesBusy ? <p className="directory-empty">Učitavam poruke…</p> : !messageRecipient ? <p className="directory-empty">Odaberi člana u polju „Primatelj” ili postojeći razgovor iznad.</p> : activeConversationMessages.length ? activeConversationMessages.map((message) => {
                      const outgoing = message.sender_id === session.user.id;
                      const otherId = outgoing ? message.recipient_id : message.sender_id;
                      const member = memberDirectory.find((item) => item.id === otherId);
                      const repliedMessage = message.reply_to_id ? activeConversationMessages.find((item) => item.id === message.reply_to_id) : null;
                      return <article className={outgoing ? "private-message outgoing" : "private-message"} key={message.id}>
                        <strong>{outgoing ? "Ti" : (member?.display_name || member?.username || "Čuvar nasljeđa")}</strong>
                        {message.reply_to_id && <div className="private-message-reply-quote"><small>Odgovor na poruku</small><p>{repliedMessage?.body || "Izvorna poruka nije dostupna u učitanom razgovoru."}</p></div>}
                        {editingMessageId === message.id ? (
                          <div className="private-message-edit-form">
                            <textarea value={messageEditDraft} onChange={(event) => setMessageEditDraft(event.target.value)} maxLength={2000} rows="3" aria-label="Uredi privatnu poruku" />
                            <div className="private-message-footer"><small>{messageEditDraft.length}/2000</small><span><button type="button" className="private-message-reply-button" disabled={messageActionBusyId === message.id} onClick={() => savePrivateMessageEdit(message)}>Spremi</button><button type="button" className="private-message-reply-button" onClick={() => { setEditingMessageId(null); setMessageEditDraft(""); }}>Odustani</button></span></div>
                          </div>
                        ) : (
                          <>
                            <p>{message.body}</p>
                            {(() => {
                              const reactionsForMessage = messageReactions.filter((reaction) => reaction.message_id === message.id);
                              const counts = new Map();
                              reactionsForMessage.forEach((reaction) => counts.set(reaction.emoji, (counts.get(reaction.emoji) || 0) + 1));
                              const commonEmojis = ["👍", "❤️", "😂", "😮", "😢", "🙏"];
                              return <div className="private-message-reactions" aria-label="Emoji reakcije">
                                <div className="private-message-reaction-summary">
                                  {[...counts.entries()].map(([emoji, count]) => {
                                    const own = reactionsForMessage.some((reaction) => reaction.user_id === session.user.id && reaction.emoji === emoji);
                                    return <button type="button" key={emoji} className={own ? "message-reaction-chip selected" : "message-reaction-chip"} aria-label={`${emoji}, ${count} reakcija${own ? ", tvoja reakcija" : ""}`} aria-pressed={own} onClick={() => togglePrivateMessageReaction(message, emoji)}>{emoji}<small>{count}</small></button>;
                                  })}
                                </div>
                                <div className="private-message-reaction-quick">
                                  {commonEmojis.map((emoji) => <button type="button" key={emoji} className={reactionsForMessage.some((reaction) => reaction.user_id === session.user.id && reaction.emoji === emoji) ? "message-reaction-quick selected" : "message-reaction-quick"} aria-label={`Reagiraj s ${emoji}`} aria-pressed={reactionsForMessage.some((reaction) => reaction.user_id === session.user.id && reaction.emoji === emoji)} onClick={() => togglePrivateMessageReaction(message, emoji)}>{emoji}</button>)}
                                </div>
                              </div>;
                            })()}
                            <div className="private-message-footer"><small>{new Date(message.created_at).toLocaleString("hr-HR", { dateStyle: "medium", timeStyle: "short" })}{message.updated_at && new Date(message.updated_at).getTime() > new Date(message.created_at).getTime() + 1000 ? " · uređeno" : ""}</small><span className="private-message-actions-inline"><button type="button" className="private-message-reply-button" onClick={() => { setReplyingToMessage(message); setMessageRecipient(otherId); setEditingMessageId(null); }}>Odgovori</button>{outgoing && <><button type="button" className="private-message-reply-button" disabled={messageActionBusyId === message.id} onClick={() => beginEditPrivateMessage(message)}>Uredi</button><button type="button" className="private-message-reply-button danger" disabled={messageActionBusyId === message.id} onClick={() => deletePrivateMessage(message)}>Izbriši</button></>}</span></div>
                          </>
                        )}
                      </article>;
                    }) : <p className="directory-empty">Još nema poruka u ovom razgovoru.</p>}
                  </div>
                </>
              )}
            </section>
          )}

          {activeNav === "Čuvari nasljeđa" && (
            <section className="member-directory card" aria-labelledby="member-directory-title">
              <div className="member-directory-heading">
                <div><span className="eyebrow">LJUDI U ZAJEDNICI</span><h2 id="member-directory-title">Čuvari nasljeđa</h2><p>Upoznaj članove, njihove interese i priče koje žele sačuvati.</p></div>
                <span className="member-directory-count">{memberDirectory.length} članova</span>
              </div>
              {!session?.user?.id ? (
                <div className="directory-empty"><p>Prijavi se za pregled imenika članova zajednice.</p><button className="primary-button" onClick={() => { setAuthOpen(true); setAuthMessage(""); }}>Prijava / Registracija</button></div>
              ) : (
                <>
                  <div className="member-presence-preferences">
                    <label><input type="checkbox" checked={showActivity} disabled={presenceBusy} onChange={(event) => saveActivityVisibility(event.target.checked)} /> Prikaži moj status aktivnosti drugim članovima</label>
                    <small>{showActivity ? "Članovi mogu vidjeti jesi li na mreži ili kada si nedavno bio/la aktivan/na." : "Tvoj status aktivnosti skriven je od drugih članova."}</small>
                  </div>
                  <label className="sr-only" htmlFor="member-directory-search">Pretraži članove</label>
                  <input id="member-directory-search" className="feed-search" type="search" value={memberDirectoryQuery} onChange={(event) => setMemberDirectoryQuery(event.target.value)} placeholder="Pretraži ime, korisničko ime ili interese…" />
                  {memberDirectoryBusy ? <p className="directory-empty">Učitavam članove…</p> : (() => {
                    const q = memberDirectoryQuery.trim().toLocaleLowerCase("hr");
                    const filtered = memberDirectory.filter((member) => `${member.display_name || ""} ${member.username || ""} ${member.bio || ""}`.toLocaleLowerCase("hr").includes(q));
                    return filtered.length ? <div className="member-directory-grid">{filtered.map((member) => {
                      const displayName = member.display_name || member.username || "Čuvar nasljeđa";
                      const initials = displayName.split(/\s+/).slice(0, 2).map((part) => part[0] || "").join("").toLocaleUpperCase("hr") || "ČN";
                      return <article className="member-directory-card" key={member.id}>
                        <Avatar initials={initials} src={member.avatar_url} />
                        <div className="member-directory-info"><strong>{displayName}</strong><span>@{normalizeUsername(member.username) || "clan"}</span><span className={"member-presence-status " + getPresenceStatus(memberPresence.find((row) => row.user_id === member.id)?.last_seen_at).state}><i aria-hidden="true" />{getPresenceStatus(memberPresence.find((row) => row.user_id === member.id)?.last_seen_at).label}</span><p>{member.bio || "Ovaj član još nije dodao opis profila."}</p></div>
                        <button type="button" className="post-menu-button danger" disabled={blockBusyId === member.id} onClick={() => toggleBlockMember({ authorId: member.id, author: displayName, handle: "@" + (normalizeUsername(member.username) || "clan") })}>{blockedMembers.some((blocked) => blocked.id === member.id) ? "Odblokiraj" : "Blokiraj"}</button>
                      </article>;
                    })}</div> : <p className="directory-empty">Nema članova koji odgovaraju pretrazi.</p>;
                  })()}
                </>
              )}
            </section>
          )}

          {session?.user?.id ? <>
          <section className="composer card" aria-label="Izradi objavu">
            <div className="composer-heading">
              <span className="composer-heading-mark" aria-hidden="true">✎</span>
              <div><strong>Što želiš podijeliti?</strong><small>Tvoja priča može sačuvati dio nasljeđa.</small></div>
            </div>
            <div className="composer-top">
              <Avatar initials={(profileName || session?.user?.email?.split("@")[0] || "Čuvar nasljeđa").split(/\s+/).slice(0, 2).map((part) => part[0] || "").join("").toLocaleUpperCase("hr") || "ČN"} src={profileAvatarUrl} variant="avatar-you" />
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
                <button type="button" onClick={() => { setSelectedImage(""); setSelectedImageFile(null); }}>Ukloni fotografiju</button>
                <small>Privatna fotografija · najviše 10 MB · učitat će se tek nakon slanja objave</small>
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
                      if (!file.type.startsWith("image/") || file.size > 10 * 1024 * 1024) {
                        setNotice("Odaberi sliku do 10 MB (JPG, PNG, WebP ili GIF).");
                        setSelectedImageFile(null);
                        setSelectedImage("");
                        event.target.value = "";
                        return;
                      }
                      setSelectedImageFile(file);
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
                    <div className="emoji-picker-host" ref={emojiPickerHost} aria-label="Odaberi emoji" />
                  )}
                </div>
                <div className="mention-tool-wrap">
                  <button type="button" aria-expanded={memberPickerOpen} onClick={() => setMemberPickerOpen((open) => !open)}>@ <span>Označi člana</span></button>
                  {memberPickerOpen && (
                    <div className="mention-picker" aria-label="Izbor članova za označavanje">
                      <strong>Označi člana</strong>
                      {!session?.user?.id ? (
                        <p>Prijavi se kako bi mogao/la označiti stvarnog člana zajednice.</p>
                      ) : mentionBusy ? (
                        <p>Učitavam članove…</p>
                      ) : mentionMembers.length ? (
                        mentionMembers.map((member) => {
                          const name = member.display_name || normalizeUsername(member.username) || "Čuvar nasljeđa";
                          const handle = "@" + (normalizeUsername(member.username) || "clan");
                          return (
                            <button type="button" key={member.id} onClick={() => {
                              setDraft((value) => value + (value && !value.endsWith(" ") ? " " : "") + handle + " ");
                              setMemberPickerOpen(false);
                            }}>
                              <span>{name}</span><small>{handle}</small>
                            </button>
                          );
                        })
                      ) : (
                        <p>Nema dostupnih članova za označavanje. Provjeri jesu li profili spremljeni i dostupni.</p>
                      )}
                      <small className="mention-note">Oznaka umeće korisničko ime u tekst objave; obavijesti označenom članu još nisu povezane.</small>
                    </div>
                  )}
                </div>
              </div>
              <button className="primary-button" onClick={publishPost}>Objavi <span>↗</span></button>
            </div>
          </section>

          </> : (
            <section className="composer card wall-login-prompt" aria-label="Prijava za PatriaSoul – Čuvari nasljeđa">
              <div className="composer-heading"><span className="composer-heading-mark" aria-hidden="true">✦</span><div><strong>Podijeli svoju priču</strong><small>Čitanje zida je javno; za objavu i interakcije trebaš račun.</small></div></div>
              <p className="post-text">Prijavi se ili izradi račun kako bi objavljivao/la, komentirao/la i podržao/la priče drugih članova.</p>
              <button type="button" className="primary-button" onClick={() => { setAuthOpen(true); setAuthMode("login"); setAuthMessage("Prijavi se ili izradi račun kako bi objavljivao/la, komentirao/la i reagirao/la na objave."); }}>Prijava / Registracija ↗</button>
            </section>
          )}

          <div className="feed-heading">
            <div>
              <span className="eyebrow">ŽIVOT ZAJEDNICE</span>
              <h2>{activeNav === "PatriaSoul" ? "PatriaSoul – Čuvari nasljeđa" : activeNav}</h2>
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
            <article className="post-card card" id={"objava-" + post.id} key={post.id}>
              <div className="post-header">
                {post.id === 1 ? (
                  <button type="button" className="avatar avatar-community avatar-community-image" onClick={() => setBrandImageOpen(true)} aria-label="Otvori grb PatriaSoul">
                    <img src="/assets/images/PATRIA_SOUL_ORIGINAL_ISPRAVLJEN_GRB.png" alt="" />
                  </button>
                ) : <Avatar initials={post.initials} src={post.avatarUrl} />}
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
                    <div className="post-menu-actions">
                      <button className="post-menu-button" disabled={blockBusyId === post.authorId} onClick={() => toggleBlockMember(post)}>{blockedMembers.some((member) => member.id === post.authorId) ? "Odblokiraj" : "Blokiraj"}</button>
                      <button className="post-menu-button danger" aria-label="Prijavi objavu" title="Prijavi objavu" onClick={() => { if (!session?.user?.id) { setAuthOpen(true); setAuthMessage("Prijavi se kako bi mogao/la prijaviti sadržaj."); return; } setReportPost(post); setReportReason("spam"); setReportDetails(""); }}>Prijavi</button>
                    </div>
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
                <span>♥ {post.likes} podrške</span>
                <span>{post.comments || 0} komentara</span>
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
                <button type="button" className={shareMenuPostId === post.id ? "post-action liked" : "post-action"} aria-expanded={shareMenuPostId === post.id} aria-controls={"share-menu-" + post.id} onClick={() => setShareMenuPostId((current) => current === post.id ? null : post.id)}><span>↗</span> Podijeli</button>
              </div>
              {shareMenuPostId === post.id && (() => {
                const shareUrl = window.location.origin + window.location.pathname + "#objava-" + encodeURIComponent(post.id);
                const shareText = (post.text || "PatriaSoul – Čuvari nasljeđa").slice(0, 240);
                const encodedUrl = encodeURIComponent(shareUrl);
                const encodedText = encodeURIComponent(shareText);
                const openShare = (url) => { window.open(url, "_blank", "noopener,noreferrer"); setShareMenuPostId(null); };
                const copyShareLink = async () => {
                  try {
                    await navigator.clipboard.writeText(shareUrl);
                    setNotice("Poveznica na objavu kopirana je u međuspremnik. Zalijepi je u objavu ili poruku na drugoj mreži.");
                  } catch {
                    setNotice("Preglednik nije dopustio kopiranje. Kopiraj poveznicu ručno: " + shareUrl);
                  }
                  setShareMenuPostId(null);
                };
                const nativeShare = async () => {
                  if (!navigator.share) { await copyShareLink(); return; }
                  try {
                    await navigator.share({ title: "PatriaSoul – Čuvari nasljeđa", text: shareText, url: shareUrl });
                    setShareMenuPostId(null);
                  } catch (error) {
                    if (error?.name !== "AbortError") setNotice("Dijeljenje nije uspjelo. Pokušaj drugu mogućnost.");
                    setShareMenuPostId(null);
                  }
                };
                return <div className="post-share-menu" id={"share-menu-" + post.id} aria-label="Mogućnosti dijeljenja ove objave">
                  <p>Podijeli poveznicu na ovu objavu</p>
                  <div className="post-share-options">
                    {typeof navigator !== "undefined" && typeof navigator.share === "function" && <button type="button" onClick={nativeShare}>📲 Podijeli aplikacijom</button>}
                    <button type="button" onClick={copyShareLink}>🔗 Kopiraj poveznicu</button>
                    <button type="button" onClick={() => openShare("https://www.facebook.com/sharer/sharer.php?u=" + encodedUrl)}>ⓕ Facebook</button>
                    <button type="button" onClick={() => openShare("https://twitter.com/intent/tweet?text=" + encodedText + "&url=" + encodedUrl)}>𝕏 X</button>
                    <button type="button" onClick={() => openShare("https://wa.me/?text=" + encodedText + "%20" + encodedUrl)}>☏ WhatsApp</button>
                    <button type="button" onClick={() => openShare("https://t.me/share/url?url=" + encodedUrl + "&text=" + encodedText)}>➤ Telegram</button>
                    <button type="button" onClick={() => { window.location.href = "mailto:?subject=" + encodeURIComponent("PatriaSoul – Čuvari nasljeđa") + "&body=" + encodedText + "%0A%0A" + encodedUrl; setShareMenuPostId(null); }}>✉ E-pošta</button>
                  </div>
                  <small>Ovo dijeli poveznicu na izvornu objavu. Izravno objavljivanje sadržaja na drugim računima dodaje se zasebno uz službene API-je.</small>
                </div>;
              })()}
              {openComments.includes(post.id) && (
                <section className="comments-panel" aria-label={"Komentari uz objavu: " + post.author}>
                  <div className="comments-list">
                    {(commentsByPost[post.id] || []).length ? (commentsByPost[post.id] || []).map((comment) => (
                      <div className="comment-item" key={comment.id}>
                        <Avatar initials={comment.initials} src={comment.avatarUrl} variant={comment.owner ? "avatar-you" : ""} />
                        <div className="comment-bubble"><strong>{comment.author}</strong><p>{comment.text}</p>{comment.owner && <button type="button" className="comment-delete-button" onClick={() => deleteOwnComment(post.id, comment)}>Izbriši svoj komentar</button>}</div>
                      </div>
                    )) : <p className="comments-empty">Još nema komentara uz ovu objavu.</p>}
                  </div>
                  {session?.user?.id ? (
                    <form className="comment-form" onSubmit={(event) => { event.preventDefault(); addComment(post.id); }}>
                      <label className="sr-only" htmlFor={"comment-" + post.id}>Napiši komentar</label>
                      <input id={"comment-" + post.id} value={commentDrafts[post.id] || ""} onChange={(event) => setCommentDrafts((current) => ({ ...current, [post.id]: event.target.value }))} maxLength={5000} required placeholder="Napiši komentar…" />
                      <button className="primary-button" type="submit">Pošalji</button>
                    </form>
                  ) : (
                    <div className="comment-form">
                      <span className="comments-empty">Prijavi se kako bi dodao komentar.</span>
                      <button className="primary-button" type="button" onClick={() => { setAuthMode("login"); setAuthMessage("Prijavi se ili izradi račun kako bi komentirao/la objave."); setAuthOpen(true); }}>Prijava</button>
                    </div>
                  )}
                  <p className="local-only-note">Komentari su javno vidljivi; za pisanje komentara potrebna je prijava.</p>
                </section>
              )}
            </article>
          )) : <div className="empty-feed card"><strong>Nema pronađenih objava.</strong><p>Pokušaj drugu riječ ili odaberi „Sve objave”.</p><button className="outline-button" onClick={() => { setFeedSearch(""); setFeedFilter("Sve objave"); }}>Poništi filtre</button></div>}
          <div className="end-of-feed"><span>✦</span><p>Svaka priča čuva dio našeg zajedničkog nasljeđa.</p></div>
        </section>

        <aside className="right-sidebar">
          <section className="right-card card patriasoul-promo-card">
            <a className="patriasoul-promo-brand" href="/" aria-label="PatriaSoul — početna stranica">
              <img src="/assets/images/1000000982.png" alt="PatriaSoul — Čuvari nasljeđa" />
              <span><strong>PatriaSoul</strong><small>Čuvari nasljeđa</small></span>
            </a>
            <p className="patriasoul-promo-tagline">Hrvatska · povijest · znanje · identitet.</p>
            <p className="patriasoul-promo-copy">Prostor za učenje, igru i čuvanje priča koje čine naše nasljeđe.</p>
            <strong className="patriasoul-promo-motto">Znanje · Ponos · Nasljeđe</strong>
            <div className="patriasoul-promo-links">
              <a href="https://www.tiktok.com/@patriasoul" target="_blank" rel="noreferrer"><strong>Prati nas na TikToku</strong><span>Prati kratke priče, zanimljivosti i kvizove o Hrvatskoj. ↗</span></a>
              <a href="https://www.tiktok.com/@hajdi331?lang=hr" target="_blank" rel="noreferrer"><strong>Vjera · Yeshua</strong><span>Vjera, nada i istina kroz priču o Yeshui — Isusu Kristu. ↗</span></a>
            </div>
          </section>
          <section className="right-card card community-focus-card">
            <div className="right-card-title"><h3>ZAJEDNO MOŽEMO VIŠE</h3><span>✦</span></div>
            <a href="/?zajedno=trebam-pomoc" className="focus-link help-focus-link">
              <span className="focus-icon red">🤝</span><span><strong>Trebaš pomoć?</strong><small>Zatraži savjet, preporuku ili pomoć zajednice.</small></span><b>›</b>
            </a>
            <a href="/?zajedno=pruzi-ruku" className="focus-link offer-focus-link">
              <span className="focus-icon blue">🫶</span><span><strong>Pruži ruku</strong><small>Ponudi svoje znanje, vrijeme ili vještine.</small></span><b>›</b>
            </a>
          </section>

          <WeatherSidebar />
          <FaithSidebar />

          <section className="right-card card">
            <div className="right-card-title"><h3>ČLANOVI NA MREŽI</h3><span>{memberPresence.filter((item) => item.show_activity !== false && Date.now() - new Date(item.last_seen_at).getTime() <= 120000).length}</span></div>
            {(() => {
              const online = memberDirectory.filter((member) => memberPresence.some((presence) => presence.user_id === member.id && presence.show_activity !== false && Date.now() - new Date(presence.last_seen_at).getTime() <= 120000)).slice(0, 5);
              return online.length ? <div className="online-member-list">{online.map((member) => <button type="button" className="online-member" key={member.id} onClick={() => { setMemberDirectoryQuery(member.display_name || member.username || ""); setActiveNav("Čuvari nasljeđa"); }}><span className="online-avatar">{(member.display_name || member.username || "Č").split(/\s+/).slice(0, 2).map((part) => part[0] || "").join("").toLocaleUpperCase("hr")}</span><span className="online-member-copy"><strong>{member.display_name || member.username || "Čuvar nasljeđa"}</strong><small><i /> Na mreži</small></span></button>)}</div> : <p className="sidebar-empty">{isSupabaseConfigured ? "Prikaz članova pojavit će se kada se učita imenik i njihova aktivnost." : "Poveži testni Supabase za prikaz stvarnih članova na mreži."}</p>;
            })()}
            <button className="outline-button full-width" onClick={() => navigateToSection("Čuvari nasljeđa")}>Prikaži članove <span>→</span></button>
          </section>

          <section className="right-card card">
            <div className="right-card-title"><h3>GRUPE ZAJEDNICE</h3><span>{groupChats.length}</span></div>
            {groupChats.length ? <div className="sidebar-group-list">{groupChats.slice(0, 4).map((group) => <button type="button" className="sidebar-group-row" key={group.id} onClick={() => { if (!session?.user?.id) { navigateToSection("Grupe"); return; } setActiveNav("Grupe"); setActiveGroupId(group.id); }}><span className="group-icon">♧</span><span><strong>{group.name}</strong><small>{group.members?.length || 0} članova</small></span>{(groupUnreadCounts[group.id] || 0) > 0 && <b className="group-unread-badge">{groupUnreadCounts[group.id] > 99 ? "99+" : groupUnreadCounts[group.id]}</b>}</button>)}</div> : <p className="sidebar-empty">Ovdje će se prikazati tvoji grupni razgovori nakon što budu učitani.</p>}
            <button className="outline-button full-width" onClick={() => navigateToSection("Grupe")}>Otvori grupe <span>→</span></button>
          </section>

          <section className="principle-card">
            <span className="principle-quote">“</span>
            <p>Nasljeđe ne čuvamo samo za sebe, nego i za one koji dolaze poslije nas.</p>
            <span className="principle-rule" />
            <strong>NAČELO ZAJEDNICE</strong>
          </section>


        </aside>
      </main>

      <FloatingGlobalChat supabase={supabase} session={session} onLoginRequest={() => { setAuthOpen(true); setAuthMessage(""); }} />

      <footer className="community-site-footer">
        <div className="community-site-footer-grid">
          <section className="community-footer-brand">
            <a href="/" className="community-footer-logo" aria-label="PatriaSoul — Čuvari nasljeđa">
              <img src="/assets/images/1000000982.png" alt="PatriaSoul" />
              <span><strong>PatriaSoul</strong><small>ČUVARI NASLJEĐA</small></span>
            </a>
            <p>Hrvatska · povijest · znanje · identitet.</p>
            <p>Prostor za učenje, igru i čuvanje priča koje čine naše nasljeđe.</p>
            <strong className="community-footer-motto">Znanje · Ponos · Nasljeđe</strong>
            <a className="community-footer-return" href="/">Povratak na PatriaSoul <span aria-hidden="true">→</span></a>
          </section>
          <section>
            <h2>Brzi izbornik</h2>
            <nav aria-label="Brza navigacija podnožja">
              <a href="/">PatriaSoul – Čuvari nasljeđa</a>
              <a href="/kviz/">PatriaSoul kviz</a>
              <a href="/kviz/?mode=croatian">Hrvatski kviz</a>
              <a href="/kviz/?mode=city">Brani svoj grad</a>
              <a href="/kviz/?mode=daily">Dnevni kviz</a>
              <a href="/kviz/?mode=leaderboard">Rang-lista</a>
              <a href="/forum.html">Forum zajednice</a>
              <a href="/stranice.html">Stranice zajednice</a>
              <a href="/dogadaji.html">Događaji</a>
            </nav>
          </section>
          <section>
            <h2>Prati nas</h2>
            <div className="community-footer-social">
              <strong>PatriaSoul</strong>
              <p>Prati kratke priče, zanimljivosti i kvizove o Hrvatskoj.</p>
              <a href="https://www.tiktok.com/@patriasoul" target="_blank" rel="noreferrer">Prati nas na TikToku <span aria-hidden="true">↗</span></a>
            </div>
            <div className="community-footer-social faith">
              <strong>Vjera · Yeshua</strong>
              <p>Vjera, nada i istina kroz priču o Yeshui — Isusu Kristu.</p>
              <a href="https://www.tiktok.com/@hajdi331?lang=hr" target="_blank" rel="noreferrer">Prati vjerski kanal <span aria-hidden="true">↗</span></a>
            </div>
          </section>
          <div className="community-footer-legal">
            <nav aria-label="Pravne informacije">
              <a href="/pravila-koristenja.html">Pravila korištenja</a>
              <a href="/pravila-zajednice.html">Pravila zajednice</a>
              <a href="/kviz/rules.html">Pravilnik o igranju kviza</a>
              <a href="/kviz/terms.html">Uvjeti korištenja</a>
              <a href="/privatnost.html">Politika privatnosti</a>
              <a href="/kviz/about.html">O PatriaSoul</a>
              <a href="/kviz/contact.html">Kontakt</a>
            </nav>
            <p>© 2026 PatriaSoul. Sva prava pridržana.</p>
            <small>Hrvatska · Povijest · Znanje · Identitet</small>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;