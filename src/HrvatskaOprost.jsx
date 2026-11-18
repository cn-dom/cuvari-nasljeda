import React, { useMemo, useState } from "react";
import SiteChrome, { SiteFooter } from "./SiteChrome.jsx";
import "./HrvatskaOprost.css";

const dossiers = [
  { category: "Zločini nad civilima", title: "Vukovar i Ovčara", place: "Vukovar", period: "1991.", summary: "Dokumentiranje stradanja civila i zarobljenika, sudbina nestalih, svjedočanstva preživjelih i sudski utvrđene činjenice.", status: "Dosje za sustavnu obradu" },
  { category: "Zločini nad civilima", title: "Škabrnja", place: "Škabrnja", period: "1991.", summary: "Sjećanje na ubijene civile i branitelje te dokumentiranje posljedica napada i stradanja mjesta.", status: "Dosje za sustavnu obradu" },
  { category: "Zločini nad civilima", title: "Lovas", place: "Lovas", period: "1991.", summary: "Svjedočanstva, dokumenti i sudski postupci o zločinima počinjenima nad stanovnicima Lovasa.", status: "Dosje za sustavnu obradu" },
  { category: "Zločini nad civilima", title: "Baćin", place: "Baćin", period: "1991.", summary: "Prikupljanje potvrđenih podataka o žrtvama, okolnostima zločina i postupcima za utvrđivanje odgovornosti.", status: "Dosje za sustavnu obradu" },
  { category: "Zločini nad civilima", title: "Voćin", place: "Voćin", period: "1991.", summary: "Dokumentiranje stradanja stanovnika, uništenja mjesta i dostupnih pravosudnih i povijesnih izvora.", status: "Dosje za sustavnu obradu" },
  { category: "Nestali i grobišta", title: "Nestali u Domovinskom ratu", place: "Hrvatska", period: "1991. – 1995.", summary: "Potraga za nestalima, ekshumacije, identifikacije i povratak posmrtnih ostataka obiteljima.", status: "Živi registar — podaci se provjeravaju" },
  { category: "Logori i zatočenja", title: "Zatočeništvo i logori", place: "Hrvatska i inozemstvo", period: "1991. – 1995.", summary: "Dokumentirana mjesta zatočenja, iskazi bivših zatočenika, uvjeti zatočenja i sudski utvrđene činjenice.", status: "Dosje za sustavnu obradu" },
  { category: "Prognani i uništena mjesta", title: "Progonstvo i razaranje", place: "Područja zahvaćena ratom", period: "1991. – 1995.", summary: "Sudbine prognanih obitelji, uništeni domovi, povratak i dugoročne posljedice rata.", status: "Dosje za sustavnu obradu" },
  { category: "Pravda i odgovornost", title: "Sudske presude i neriješeni slučajevi", place: "Hrvatska i međunarodni sudovi", period: "1991. – danas", summary: "Pregled postupaka, pravomoćnih presuda, oslobađajućih odluka i slučajeva u kojima odgovornost nije utvrđena.", status: "Pravni izvori obvezni" },
];
const categories = ["Sve teme", ...new Set(dossiers.map((item) => item.category))];

function EvidenceNote() {
  return <aside className="ho-evidence-note"><span className="ho-note-mark">!</span><div><strong>Činjenice prije zaključaka</strong><p>Svaki dosje mora navesti izvor i status podatka. Razlikujemo dokumentiranu činjenicu, sudski utvrđenu činjenicu, svjedočenje, povijesnu procjenu i okolnost koja još nije potvrđena. Ne objavljujemo neprovjerena imena, brojke ni optužbe.</p></div></aside>;
}

export default function HrvatskaOprost() {
  const [category, setCategory] = useState("Sve teme");
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => dossiers.filter((item) => (category === "Sve teme" || item.category === category) && (query.trim() === "" || [item.title, item.place, item.summary, item.period].join(" ").toLocaleLowerCase("hr").includes(query.toLocaleLowerCase("hr")))), [category, query]);
  return <div className="ho-page">
    <SiteChrome section="Domovina" />
    <main>
      <section className="ho-hero">
        <div className="ho-hero-grain" aria-hidden="true" />
        <div className="ho-hero-inner">
          <p className="ho-eyebrow">DOMOVINA · SJEĆANJE · DOKUMENTI</p>
          <h1>Kako oprostiti,<br/><em>kako zaboraviti?</em></h1>
          <p className="ho-lead">Postoji li oprost bez istine? Postoji li pomirenje bez pravde? I smijemo li zaboraviti one koji se nikada nisu vratili?</p>
          <div className="ho-hero-rule" />
          <p className="ho-thesis">Oprost može biti osobni izbor.<br/><strong>Zaborav ne smije biti naša obveza.</strong></p>
          <a className="ho-scroll-link" href="#dosjei">Istraži dokumentirane teme <span>↓</span></a>
        </div>
        <div className="ho-hero-side" aria-hidden="true"><span>ISTINA</span><span>SJEĆANJE</span><span>DOSTOJANSTVO</span></div>
      </section>

      <section className="ho-intro ho-wrap">
        <div className="ho-section-kicker">ZAŠTO OVA STRANICA POSTOJI</div>
        <div className="ho-intro-grid">
          <h2>Ne tražimo osvetu.<br/><em>Tražimo istinu.</em></h2>
          <div><p>Ne želimo da naša djeca odrastaju u mržnji. Ali ne smiju odrastati ni u neznanju. Žrtve imaju pravo na ime, obitelji na istinu, a povijest na činjenice.</p><p>Ovdje ćemo bilježiti zločine počinjene nad Hrvatima tijekom Domovinskog rata, sudbine nestalih, zatočenih i prognanih, razaranja domova te put do pravde. Svaka osoba bila je nečiji roditelj, dijete, supružnik, prijatelj ili susjed — nikada samo broj.</p></div>
        </div>
        <EvidenceNote />
      </section>

      <section className="ho-topics ho-wrap" id="dosjei">
        <div className="ho-section-heading"><div><div className="ho-section-kicker">MEMORIJALNI ARHIV</div><h2>Mjesta, ljudi i <em>istina</em></h2></div><p>Početni pregled tema za sustavnu obradu. Svaki dosje dobiva vlastitu kronologiju, izvore i jasno označen status provjere.</p></div>
        <div className="ho-filters">
          <label className="ho-search"><span aria-hidden="true">⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Pretraži mjesto, temu ili razdoblje…" aria-label="Pretraži dosjee"/></label>
          <div className="ho-category-list" aria-label="Filtriraj po kategoriji">{categories.map((item) => <button key={item} className={category === item ? "active" : ""} onClick={() => setCategory(item)}>{item}</button>)}</div>
        </div>
        <div className="ho-results-label">{filtered.length} {filtered.length === 1 ? "tema" : "tema"} u prikazu</div>
        <div className="ho-dossier-grid">{filtered.map((item, index) => <article className="ho-dossier" key={item.title}><div className="ho-dossier-top"><span>{String(index + 1).padStart(2, "0")}</span><span>{item.period}</span></div><div className="ho-dossier-category">{item.category}</div><h3>{item.title}</h3><div className="ho-place">{item.place}</div><p>{item.summary}</p><div className="ho-dossier-status"><span className="ho-status-dot"/>{item.status}</div></article>)}</div>
        {filtered.length === 0 && <p className="ho-empty">Nema rezultata za odabrani pojam. Pokušaj s drugim izrazom.</p>}
      </section>

      <section className="ho-method">
        <div className="ho-wrap ho-method-grid"><div><div className="ho-section-kicker">UREDNIČKI STANDARD</div><h2>Svjedočanstvo je važno.<br/><em>Dokaz je obveza.</em></h2></div><div className="ho-method-list">
          <div><b>01</b><p><strong>Izvori uz svaku tvrdnju</strong><br/>Arhivski dokumenti, službene evidencije, sudske presude, relevantna historiografija i vjerodostojna svjedočanstva.</p></div>
          <div><b>02</b><p><strong>Precizno imenovanje</strong><br/>Počinitelje, postrojbe i zapovjednu odgovornost navodimo samo kada ih pouzdani izvori utvrđuju.</p></div>
          <div><b>03</b><p><strong>Poštovanje prema žrtvama</strong><br/>Bez senzacionalizma, uznemirujućih prikaza i objave privatnih podataka koji nisu javno potvrđeni.</p></div>
          <div><b>04</b><p><strong>Ispravci i transparentnost</strong><br/>Ako se pojavi nova dokumentacija ili se utvrdi pogreška, zapis se jasno ažurira.</p></div>
        </div></div>
      </section>

      <section className="ho-closing ho-wrap"><div className="ho-closing-mark">✳</div><p>Ne želimo nasljeđe mržnje.<br/>Želimo nasljeđe istine, dostojanstva i odgovornosti.</p><h2>Da se zna.<br/><em>Da se pamti.</em><br/>Da se nikada ne zaboravi.</h2></section>
    </main>
    <SiteFooter />
  </div>;
}
