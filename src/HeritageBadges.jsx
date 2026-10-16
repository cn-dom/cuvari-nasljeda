import React from "react";
import "./heritage-badges.css";

export const BADGE_CATALOG = [
  { key: "quiz_beginner", name: "PatriaSoul početnik", group: "Kviz i znanje", icon: "✦", condition: "Pridružiti se kvizu i započeti svoj put znanja." },
  { key: "quiz_badge_10", name: "Čuvar početaka", group: "Kviz i znanje", icon: "🌱", condition: "Dosegnuti 10. razinu u postojećem sustavu XP-a." },
  { key: "quiz_badge_20", name: "Istraživač Hrvatske", group: "Kviz i znanje", icon: "🧭", condition: "Dosegnuti 20. razinu." },
  { key: "quiz_badge_30", name: "Čuvar baštine", group: "Kviz i znanje", icon: "🏺", condition: "Dosegnuti 30. razinu." },
  { key: "quiz_badge_40", name: "Čuvar Domovine", group: "Kviz i znanje", icon: "🇭🇷", condition: "Dosegnuti 40. razinu." },
  { key: "quiz_badge_50", name: "PatriaSoul znalac", group: "Kviz i znanje", icon: "📚", condition: "Dosegnuti 50. razinu." },
  { key: "quiz_badge_60", name: "Čuvar znanja", group: "Kviz i znanje", icon: "🛡️", condition: "Dosegnuti 60. razinu." },
  { key: "quiz_badge_70", name: "PatriaSoul učitelj", group: "Kviz i znanje", icon: "🎓", condition: "Dosegnuti 70. razinu." },
  { key: "quiz_badge_80", name: "Čuvar identiteta", group: "Kviz i znanje", icon: "⚜️", condition: "Dosegnuti 80. razinu." },
  { key: "quiz_badge_90", name: "PatriaSoul legenda", group: "Kviz i znanje", icon: "🏆", condition: "Dosegnuti 90. razinu." },
  { key: "quiz_badge_100", name: "Čuvar nasljeđa", group: "Kviz i znanje", icon: "👑", condition: "Dosegnuti 100. razinu." },
  { key: "museum_first_visit", name: "Prvi posjetitelj", group: "Virtualni muzej", icon: "🏛️", condition: "Otvoriti prvi muzejski predmet u 3D galeriji." },
  { key: "museum_3_exhibits", name: "Istraživač dvorane", group: "Virtualni muzej", icon: "🔎", condition: "Istražiti najmanje 3 različita muzejska predmeta." },
  { key: "museum_all_exhibits", name: "Otkrivač zbirke", group: "Virtualni muzej", icon: "🗝️", condition: "Istražiti svih 5 predmeta stalne izložbe." },
  { key: "museum_archaeology", name: "Tragovi prapovijesti", group: "Virtualni muzej", icon: "🏺", condition: "Istražiti vučedolski arheološki predmet." },
  { key: "museum_glagolitic", name: "Čuvar glagoljice", group: "Virtualni muzej", icon: "🔤", condition: "Istražiti Bašćansku ploču i glagoljicu." },
  { key: "museum_ornament", name: "Poznavatelj pletera", group: "Virtualni muzej", icon: "❖", condition: "Istražiti primjer hrvatske pleterne ornamentike." },
  { key: "museum_numismatics", name: "Tragom starog novca", group: "Virtualni muzej", icon: "🪙", condition: "Istražiti predmet iz numizmatičke zbirke." },
  { key: "museum_ethnography", name: "Čuvar tradicije", group: "Virtualni muzej", icon: "🧵", condition: "Istražiti predmet iz etnografske baštine." },
  { key: "contribution_first", name: "Prvi prilog", group: "Doprinos zajednici", icon: "✍️", condition: "Prvi javni prilog prihvaćen nakon uredničke provjere." },
  { key: "contribution_photo", name: "Darovatelj fotografije", group: "Doprinos zajednici", icon: "📷", condition: "Fotografija prihvaćena u zbirku uz potvrđena prava korištenja." },
  { key: "contribution_family_story", name: "Obiteljski pripovjedač", group: "Doprinos zajednici", icon: "📜", condition: "Obiteljska priča pregledana i prihvaćena." },
  { key: "contribution_source", name: "Tragač za izvorima", group: "Doprinos zajednici", icon: "🔍", condition: "Dostaviti izvore koji su provjereni i povezani sa zapisom." },
  { key: "contribution_curator", name: "Suradnik zbirke", group: "Doprinos zajednici", icon: "🗂️", condition: "Više priloga prihvaćeno u muzejsku zbirku." },
  { key: "contribution_memory", name: "Čuvar živog sjećanja", group: "Doprinos zajednici", icon: "🕯️", condition: "Svjedočanstvo dokumentirano uz jasno označavanje osobnog sjećanja." },
  { key: "heritage_archaeology", name: "Poznavatelj arheologije", group: "Tematska baština", icon: "⛏️", condition: "Potvrđena aktivnost u arheološkoj zbirci." },
  { key: "heritage_glagolitic", name: "Poznavatelj glagoljice", group: "Tematska baština", icon: "ᚁ", condition: "Potvrđena aktivnost u zbirci glagoljice." },
  { key: "heritage_history", name: "Poznavatelj hrvatske povijesti", group: "Tematska baština", icon: "📖", condition: "Potvrđeno istraživanje više povijesnih zbirki." },
  { key: "heritage_tradition", name: "Istraživač običaja", group: "Tematska baština", icon: "🪡", condition: "Potvrđeno istraživanje tradicijskih običaja." },
  { key: "heritage_sacred", name: "Čuvar sakralne baštine", group: "Tematska baština", icon: "⛪", condition: "Potvrđeno istraživanje sakralne baštine." },
  { key: "heritage_monuments", name: "Čuvar spomenika", group: "Tematska baština", icon: "🏰", condition: "Doprinos dokumentiranju kulturnog spomenika." },
  { key: "heritage_nature", name: "Čuvar krajolika", group: "Tematska baština", icon: "🌿", condition: "Prihvaćen zapis o prirodnoj baštini Hrvatske." },
  { key: "heritage_islands", name: "Čuvar otoka", group: "Tematska baština", icon: "🏝️", condition: "Prihvaćen zapis o otočnoj baštini." },
  { key: "heritage_diaspora", name: "Veza s iseljeništvom", group: "Tematska baština", icon: "🌍", condition: "Dokumentiran doprinos pričama hrvatskog iseljeništva." },
  { key: "heritage_faith", name: "Čuvar duhovne baštine", group: "Tematska baština", icon: "🕊️", condition: "Prihvaćen i izvorima potkrijepljen zapis o duhovnoj baštini." },
  { key: "community_first_post", name: "Prvi glas zajednice", group: "Zajednica i druženje", icon: "💬", condition: "Objaviti prvu objavu na zidu zajednice." },
  { key: "community_10_posts", name: "Aktivni čuvar", group: "Zajednica i druženje", icon: "📣", condition: "Objaviti 10 objava na zidu zajednice." },
  { key: "community_first_topic", name: "Pokretač razgovora", group: "Zajednica i druženje", icon: "🗣️", condition: "Otvoriti prvu temu na forumu." },
  { key: "community_first_forum_reply", name: "Graditelj rasprave", group: "Zajednica i druženje", icon: "🧩", condition: "Napisati prvi odgovor na forumu." },
  { key: "community_first_comment", name: "Prijateljska riječ", group: "Zajednica i druženje", icon: "🤝", condition: "Napisati prvi komentar u zajednici." },
  { key: "community_first_event", name: "Čuvar susreta", group: "Zajednica i druženje", icon: "📅", condition: "Organizirati prvi događaj zajednice." },
  { key: "community_helper", name: "Ruka zajedništva", group: "Zajednica i druženje", icon: "🫶", condition: "Potvrđen doprinos članu zajednice kroz oglasnik pomoći." },
  { key: "community_storyteller", name: "Pripovjedač zajednice", group: "Zajednica i druženje", icon: "📖", condition: "Priča koju je zajednica istaknula zbog kvalitete i vrijednosti." },
  { key: "community_mentor", name: "Mentor čuvara", group: "Zajednica i druženje", icon: "🧑‍🏫", condition: "Potvrđena pomoć novim članovima i suradnicima." },
  { key: "special_pioneer", name: "Muzejski pionir", group: "Posebne značke", icon: "✨", condition: "Posebna značka za prve provjerene sudionike muzeja." },
  { key: "special_exhibition", name: "Sudionik posebne izložbe", group: "Posebne značke", icon: "🎟️", condition: "Sudjelovati u posebnoj izložbi ili događaju." },
  { key: "special_annual", name: "Čuvar godine", group: "Posebne značke", icon: "🌟", condition: "Godišnje priznanje za potvrđen doprinos." },
  { key: "special_researcher", name: "Iznimni istraživač", group: "Posebne značke", icon: "🧭", condition: "Izvanredan doprinos istraživanju i provjeri izvora." },
  { key: "special_legend", name: "Legenda PatriaSoul", group: "Posebne značke", icon: "🏅", condition: "Posebno priznanje za dugotrajan i značajan doprinos." }
];

export function getBadge(key) {
  return BADGE_CATALOG.find((badge) => badge.key === key) || null;
}

export function BadgeRow({ badgeKeys = [], compact = false, limit = 3 }) {
  const badges = [...new Set(badgeKeys)].map(getBadge).filter(Boolean);
  if (!badges.length) return <div className={compact ? "heritage-badges-empty compact" : "heritage-badges-empty"}>Značke još nisu osvojene</div>;
  const visible = compact ? badges.slice(0, limit) : badges;
  return <div className={compact ? "heritage-badge-row compact" : "heritage-badge-row"}>
    {visible.map((badge) => <span className="heritage-badge-pill" data-badge-key={badge.key} key={badge.key} title={badge.condition} aria-label={badge.name}>
      <span className="heritage-badge-icon" aria-hidden="true">{badge.icon}</span><span className="heritage-badge-name">{badge.name}</span>
    </span>)}
    {compact && badges.length > visible.length && <span className="heritage-badge-more" title={`${badges.length - visible.length} dodatnih znački`}>+{badges.length - visible.length}</span>}
  </div>;
}

export default function BadgeShowcase({ earnedKeys = [], showLocked = false }) {
  const earned = new Set(earnedKeys);
  const groups = [...new Set(BADGE_CATALOG.map((badge) => badge.group))];
  return <section className="heritage-badge-showcase" aria-labelledby="heritage-badges-title">
    <div className="heritage-badge-heading"><div><span className="eyebrow">PATRIASOUL · POSTIGNUĆA</span><h2 id="heritage-badges-title">Značke čuvara nasljeđa</h2><p>3D priznanja za znanje, istraživanje baštine i doprinos zajednici. Napredak se povezuje s tvojim računom.</p></div><span className="heritage-badge-total"><strong>{earned.size}</strong><small>od {BADGE_CATALOG.length}</small></span></div>
    {groups.map((group) => {
      const items = BADGE_CATALOG.filter((badge) => badge.group === group && (showLocked || earned.has(badge.key)));
      if (!items.length) return null;
      return <section className="heritage-badge-group" key={group}><h3>{group}</h3><div className="heritage-badge-grid">
        {items.map((badge) => <article className={earned.has(badge.key) ? "heritage-badge-card earned" : "heritage-badge-card locked"} data-badge-key={badge.key} key={badge.key}>
          <span className="heritage-badge-medallion" aria-hidden="true"><span>{badge.icon}</span></span><div className="heritage-badge-copy"><strong>{badge.name}</strong><p>{badge.condition}</p><small>{earned.has(badge.key) ? "✓ Osvojena značka" : "Zaključano · ispuni uvjet"}</small></div>
        </article>)}
      </div></section>;
    })}
  </section>;
}
