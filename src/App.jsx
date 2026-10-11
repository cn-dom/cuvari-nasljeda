import { useEffect, useMemo, useRef, useState } from "react";
import { isSupabaseConfigured, supabase } from "./lib/supabase.js";
import { Picker } from "emoji-mart";
import emojiData from "@emoji-mart/data";

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
  { icon: "♧", label: "Obavijesti" },
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
  const emojiPickerHost = useRef(null);
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
  const [profileBusy, setProfileBusy] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");
  const [reportPost, setReportPost] = useState(null);
  const [reportReason, setReportReason] = useState("spam");
  const [reportDetails, setReportDetails] = useState("");
  const [reportBusy, setReportBusy] = useState(false);
  const [blockedMembers, setBlockedMembers] = useState([]);
  const [blockBusyId, setBlockBusyId] = useState(null);
  const [memberDirectory, setMemberDirectory] = useState([]);
  const [memberDirectoryQuery, setMemberDirectoryQuery] = useState("");
  const [memberDirectoryBusy, setMemberDirectoryBusy] = useState(false);
  const [mentionMembers, setMentionMembers] = useState([]);
  const [mentionBusy, setMentionBusy] = useState(false);
  const [messages, setMessages] = useState([]);
  const [messageReactions, setMessageReactions] = useState([]);
  const [groupChats, setGroupChats] = useState([]);
  const [activeGroupId, setActiveGroupId] = useState("");
  const [groupMessages, setGroupMessages] = useState([]);
  const [groupDraftName, setGroupDraftName] = useState("");
  const [groupSelectedMembers, setGroupSelectedMembers] = useState([]);
  const [groupMessageDraft, setGroupMessageDraft] = useState("");
  const [groupBusy, setGroupBusy] = useState(false);
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
      if (!supabase || !session?.user?.id) {
        setPosts(initialPosts);
        return;
      }
      const { data: blockRows, error: blockError } = await supabase
        .from("blocked_users")
        .select("blocked_id")
        .eq("blocker_id", session.user.id);
      if (cancelled) return;
      const blockedIds = !blockError ? (blockRows || []).map((row) => row.blocked_id) : [];
      setBlockedMembers(blockedIds.map((id) => ({ id, name: id })));
      if (blockedIds.length) {
        const { data: blockedProfiles } = await supabase.from("profiles").select("id, display_name, username").in("id", blockedIds);
        if (!cancelled && blockedProfiles) {
          const byId = Object.fromEntries(blockedProfiles.map((profile) => [profile.id, profile]));
          setBlockedMembers(blockedIds.map((id) => ({ id, name: byId[id]?.display_name || byId[id]?.username || id, username: byId[id]?.username || "" })));
        }
      }
      const { data, error } = await supabase
        .from("posts")
        .select("id, author_id, body, image_path, created_at, profiles(display_name, username)")
        .order("created_at", { ascending: false })
        .limit(50);
      if (cancelled) return;
      if (error) {
        setNotice("Zid nije učitan iz baze. Provjeri postoji li tablica posts i jesu li RLS pravila primijenjena. Prikazuju se samo ogledne objave.");
        setPosts(initialPosts);
        return;
      }
      const rows = await Promise.all((data || []).filter((row) => !blockedIds.includes(row.author_id)).map(async (row) => {
        const profile = row.profiles || {};
        const name = profile.display_name || "Čuvar nasljeđa";
        const username = profile.username || "clan";
        let imageUrl = "";
        if (row.image_path) {
          const { data: signedImage } = await supabase.storage
            .from("community-images")
            .createSignedUrl(row.image_path, 60 * 60);
          imageUrl = signedImage?.signedUrl || "";
        }
        return {
          id: row.id,
          authorId: row.author_id,
          initials: name.split(/\s+/).slice(0, 2).map((part) => part[0] || "").join("").toLocaleUpperCase("hr") || "ČN",
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
          owner: row.author_id === session.user.id,
        };
      }));
      setPosts(rows);
      if (rows.length) {
        const postIds = rows.map((post) => post.id);
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
        const { data: commentRows, error: commentsError } = await supabase
          .from("comments")
          .select("id, post_id, author_id, body, created_at, profiles(display_name, username)")
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
              text: row.body || "",
              owner: row.author_id === session.user.id,
            });
          });
          setCommentsByPost(grouped);
          setNotice("");
        }
      } else {
        setCommentsByPost({});
        setNotice("");
      }
    }
    loadCommunityFeed();
    return () => { cancelled = true; };
  }, [session?.user?.id]);

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
        setNotice("Član je odblokiran. Osvježi zid kako bi se njegove objave ponovno učitale.");
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
      setNotice("Član je odblokiran. Osvježi zid kako bi se njegove objave ponovno učitale.");
    }
    setBlockBusyId(null);
  }

  useEffect(() => {
    let cancelled = false;
    async function loadMemberDirectory() {
      if (!["Čuvari nasljeđa", "Poruke"].includes(activeNav) || !supabase || !session?.user?.id) return;
      setMemberDirectoryBusy(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("id, display_name, username, bio, created_at")
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
      setMemberDirectoryBusy(false);
    }
    loadMemberDirectory();
    return () => { cancelled = true; };
  }, [activeNav, session?.user?.id, blockedMembers]);

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
        .select("id, group_id, sender_id, body, created_at")
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
    const membershipRows = [{ group_id: group.id, user_id: session.user.id, role: "admin" },
      ...members.map((user_id) => ({ group_id: group.id, user_id, role: "member" }))];
    const { error: membersError } = await supabase.from("group_chat_members").insert(membershipRows);
    if (membersError) {
      setNotice("Grupa je stvorena, ali članove nije moguće dodati. Provjeri SQL nacrt; možda će trebati ukloniti nedovršenu grupu.");
      setGroupBusy(false);
      return;
    }
    setGroupChats((current) => [{ ...group, members: membershipRows }, ...current]);
    setActiveGroupId(group.id);
    setGroupDraftName("");
    setGroupSelectedMembers([]);
    setNotice("Grupni razgovor je stvoren.");
    setGroupBusy(false);
  }

  async function sendGroupMessage(event) {
    event.preventDefault();
    const body = groupMessageDraft.trim();
    if (!supabase || !session?.user?.id || !activeGroupId || !body) return;
    if (body.length > 2000) { setNotice("Poruka grupe može imati najviše 2000 znakova."); return; }
    const { data, error } = await supabase.from("group_chat_messages")
      .insert({ group_id: activeGroupId, sender_id: session.user.id, body })
      .select("id, group_id, sender_id, body, created_at").single();
    if (error) { setNotice("Grupna poruka nije poslana. Provjeri tablice i RLS pravila."); return; }
    setGroupMessages((current) => [...current.filter((item) => item.id !== data.id), data]);
    setGroupMessageDraft("");
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
      setNotice(error?.code === "42P01" || error?.code === "PGRST205"
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
      .select("id, author_id, body, image_path, created_at, profiles(display_name, username)")
      .single();
    if (error) {
      if (imagePath) await supabase.storage.from("community-images").remove([imagePath]);
      setNotice("Objava nije spremljena: " + (error.message || "provjeri tablicu posts i RLS pravila."));
      return;
    }
    let uploadedImageUrl = "";
    if (imagePath) {
      const { data: signedImage } = await supabase.storage.from("community-images").createSignedUrl(imagePath, 60 * 60);
      uploadedImageUrl = signedImage?.signedUrl || "";
    }
    const profile = data.profiles || {};
    const author = profile.display_name || session.user.email || "Čuvar nasljeđa";
    const username = profile.username || "clan";
    setPosts((current) => [{
      id: data.id,
      initials: author.split(/\s+/).slice(0, 2).map((part) => part[0] || "").join("").toLocaleUpperCase("hr") || "ČN",
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
    if (!supabase || !session?.user?.id) {
      setNotice("Za spremanje reakcije potrebno je prijaviti se.");
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
    if (!supabase || !session?.user?.id) {
      setNotice("Za slanje komentara koji se trajno sprema potrebno je prijaviti se.");
      return;
    }
    const { data, error } = await supabase
      .from("comments")
      .insert({ post_id: id, author_id: session.user.id, body: text })
      .select("id, post_id, author_id, body, created_at, profiles(display_name, username)")
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
        text: data.body || "",
        owner: data.author_id === session.user.id,
      }],
    }));
    setCommentDrafts((current) => ({ ...current, [id]: "" }));
    setNotice("Komentar je spremljen u bazu zajednice.");
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

  return (
    <div className="app-shell">
      <div className="preview-ribbon">
        <span className="status-dot" /> RAZVOJNI PREGLED
        <span>Zajednica je u razvoju · povezivanje i pojedine funkcije još se provjeravaju.</span>
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
                <div><strong>{postCount}</strong><span>objava na zidu</span></div>
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
                {item.label === "Poruke" && <span className="side-count">✉</span>}
                {item.label === "Obavijesti" && <span className="side-count">{notifications.filter((notification) => !notification.read_at).length || ""}</span>}
              </button>
            ))}
          </section>

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
                      {memberDirectory.filter((member) => !blockedMembers.some((blocked) => blocked.id === member.id)).map((member) => <option key={member.id} value={member.id}>{member.display_name || member.username || "Čuvar nasljeđa"}{member.username ? " · @" + member.username : ""}</option>)}
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
                          const displayName = member?.display_name || member?.username || "Čuvar nasljeđa";
                          return <button type="button" key={memberId} className={messageRecipient === memberId ? "message-conversation selected" : "message-conversation"} onClick={() => setMessageRecipient(memberId)}>
                            <Avatar initials={displayName.split(/\\s+/).slice(0, 2).map((part) => part[0] || "").join("").toLocaleUpperCase("hr") || "ČN"} />
                            <span className="message-conversation-copy"><strong>{displayName}</strong><small>{latest.sender_id === session.user.id ? "Ti: " : ""}{latest.body}</small></span>
                            <time>{new Date(latest.created_at).toLocaleDateString("hr-HR")}</time>
                          </button>;
                        })}
                      </div>
                    ) : <p className="directory-empty">{messageSearch.trim() ? "Nema razgovora koji odgovaraju pretrazi." : "Razgovori će se pojaviti ovdje nakon prve poslane ili primljene poruke."}</p>}
                    {messageSearch.trim() && searchedMessages.length > 0 && <div className="message-search-results"><h3>Pronađene poruke</h3>{searchedMessages.slice(0, 30).map((message) => { const otherId = message.sender_id === session.user.id ? message.recipient_id : message.sender_id; const member = memberDirectory.find((item) => item.id === otherId); const displayName = member?.display_name || member?.username || "Čuvar nasljeđa"; return <button type="button" className="message-search-result" key={message.id} onClick={() => { setMessageRecipient(otherId); setMessageSearch(""); setNotice("Otvoren razgovor s " + displayName + "."); }}><strong>{displayName}</strong><small>{new Date(message.created_at).toLocaleString("hr-HR", { dateStyle: "medium", timeStyle: "short" })}</small><p>{message.body}</p></button>; })}{searchedMessages.length > 30 && <small className="message-search-limit">Prikazano je prvih 30 rezultata. Suzi pretragu za preciznije rezultate.</small>}</div>}
                  </div>
                  <section className="group-chat-panel" aria-labelledby="group-chat-title">
                    <div className="message-search-heading"><h3 id="group-chat-title">Grupni razgovori</h3><span>{groupChats.length} grupa</span></div>
                    <form className="group-chat-create" onSubmit={createGroupChat}>
                      <label htmlFor="group-chat-name">Naziv nove grupe</label>
                      <input id="group-chat-name" value={groupDraftName} onChange={(event) => setGroupDraftName(event.target.value)} maxLength={60} placeholder="Npr. Čuvari povijesti Dalmacije" required />
                      <label htmlFor="group-chat-members">Dodaj članove (odaberi jednog ili više)</label>
                      <select id="group-chat-members" multiple value={groupSelectedMembers} onChange={(event) => setGroupSelectedMembers(Array.from(event.target.selectedOptions, (option) => option.value))} size={Math.min(5, Math.max(3, memberDirectory.length))}>
                        {memberDirectory.filter((member) => member.id !== session.user.id && !blockedMembers.some((blocked) => blocked.id === member.id)).map((member) => <option key={member.id} value={member.id}>{member.display_name || member.username || "Čuvar nasljeđa"}{member.username ? " · @" + member.username : ""}</option>)}
                      </select>
                      <div className="private-message-actions"><small>{groupSelectedMembers.length} odabranih članova</small><button className="primary-button" type="submit" disabled={groupBusy}>{groupBusy ? "Stvaram grupu…" : "＋ Stvori grupu"}</button></div>
                    </form>
                    {groupChats.length > 0 && <div className="message-conversation-list group-chat-list">
                      {groupChats.map((group) => <button type="button" key={group.id} className={activeGroupId === group.id ? "message-conversation selected" : "message-conversation"} onClick={() => setActiveGroupId(group.id)}>
                        <Avatar initials="👥" /><span className="message-conversation-copy"><strong>{group.name}</strong><small>{group.members?.length || 0} članova</small></span>
                      </button>)}
                    </div>}
                    {activeGroupId && <div className="group-chat-thread">
                      <h4>{groupChats.find((group) => group.id === activeGroupId)?.name || "Grupni razgovor"}</h4>
                      <div className="group-chat-messages">{groupMessages.map((message) => {
                        const sender = memberDirectory.find((member) => member.id === message.sender_id);
                        const outgoing = message.sender_id === session.user.id;
                        return <article key={message.id} className={outgoing ? "group-chat-message outgoing" : "group-chat-message"}>
                          <strong>{outgoing ? "Ti" : (sender?.display_name || sender?.username || "Čuvar nasljeđa")}</strong>
                          <p>{message.body}</p><small>{new Date(message.created_at).toLocaleString("hr-HR", { dateStyle: "short", timeStyle: "short" })}</small>
                        </article>;
                      })}{!groupMessages.length && <p className="directory-empty">Ovo je početak grupnog razgovora. Pošalji prvu poruku.</p>}</div>
                      <form className="group-chat-compose" onSubmit={sendGroupMessage}>
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
                  <label className="sr-only" htmlFor="member-directory-search">Pretraži članove</label>
                  <input id="member-directory-search" className="feed-search" type="search" value={memberDirectoryQuery} onChange={(event) => setMemberDirectoryQuery(event.target.value)} placeholder="Pretraži ime, korisničko ime ili interese…" />
                  {memberDirectoryBusy ? <p className="directory-empty">Učitavam članove…</p> : (() => {
                    const q = memberDirectoryQuery.trim().toLocaleLowerCase("hr");
                    const filtered = memberDirectory.filter((member) => `${member.display_name || ""} ${member.username || ""} ${member.bio || ""}`.toLocaleLowerCase("hr").includes(q));
                    return filtered.length ? <div className="member-directory-grid">{filtered.map((member) => {
                      const displayName = member.display_name || member.username || "Čuvar nasljeđa";
                      const initials = displayName.split(/\s+/).slice(0, 2).map((part) => part[0] || "").join("").toLocaleUpperCase("hr") || "ČN";
                      return <article className="member-directory-card" key={member.id}>
                        <Avatar initials={initials} />
                        <div className="member-directory-info"><strong>{displayName}</strong><span>@{member.username || "clan"}</span><p>{member.bio || "Ovaj član još nije dodao opis profila."}</p></div>
                        <button type="button" className="post-menu-button danger" disabled={blockBusyId === member.id} onClick={() => toggleBlockMember({ authorId: member.id, author: displayName, handle: "@" + (member.username || "clan") })}>{blockedMembers.some((blocked) => blocked.id === member.id) ? "Odblokiraj" : "Blokiraj"}</button>
                      </article>;
                    })}</div> : <p className="directory-empty">Nema članova koji odgovaraju pretrazi.</p>;
                  })()}
                </>
              )}
            </section>
          )}

          <section className="composer card">
            <div className="composer-top">
              <Avatar initials={comment.initials || comment.author.split(/\s+/).slice(0, 2).map((part) => part[0] || "").join("").toLocaleUpperCase("hr") || "ČN"} variant={comment.owner ? "avatar-you" : ""} />
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
                          const name = member.display_name || member.username || "Čuvar nasljeđa";
                          const handle = "@" + (member.username || "clan");
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
                    )) : <p className="comments-empty">Još nema komentara uz ovu objavu.</p>}
                  </div>
                  <form className="comment-form" onSubmit={(event) => { event.preventDefault(); addComment(post.id); }}>
                    <label className="sr-only" htmlFor={"comment-" + post.id}>Napiši komentar</label>
                    <input id={"comment-" + post.id} value={commentDrafts[post.id] || ""} onChange={(event) => setCommentDrafts((current) => ({ ...current, [post.id]: event.target.value }))} placeholder="Napiši komentar…" />
                    <button className="primary-button" type="submit">Pošalji</button>
                  </form>
                  <p className="local-only-note">Komentari se spremaju u zajednicu nakon uspješnog slanja.</p>
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