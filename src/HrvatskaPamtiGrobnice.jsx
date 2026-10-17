import { useMemo, useState } from "react";
import "./HrvatskaPamti.css";

const sites = [
  { id:"ovcara", name:"Ovčara", area:"Vukovar, Vukovarsko-srijemska županija", period:"Domovinski rat", year:"1991.", status:"Potvrđeno mjesto masovne grobnice", certainty:"confirmed", detail:"Mjesto masovne grobnice povezano s ubojstvom ranjenika i zarobljenika odvedenih iz vukovarske bolnice u studenome 1991. Podatke o broju žrtava i identifikacijama treba vezati uz pojedinačne službene evidencije.", source:"Memorijalni centar Domovinskog rata Vukovar; Ministarstvo hrvatskih branitelja", publicLocation:"Javno poznato memorijalno mjesto" },
  { id:"novo-groblje-vukovar", name:"Nova ulica i Novo groblje", area:"Vukovar, Vukovarsko-srijemska županija", period:"Domovinski rat", year:"1991. / ekshumacije od 1998.", status:"Službeno dokumentirana lokacija", certainty:"confirmed", detail:"Službena memorijalna dokumentacija opisuje ekshumacije i identifikacije žrtava iz masovne grobnice na Novom groblju. Broj pronađenih posmrtnih ostataka na pojedinoj lokaciji ne smije se poistovjetiti s ukupnim brojem žrtava grada.", source:"Ministarstvo hrvatskih branitelja; Memorijalni centar Domovinskog rata Vukovar", publicLocation:"Javno poznato memorijalno područje" },
  { id:"lesce", name:"Šuma Lešće", area:"Gornja Dubrava, Grad Zagreb", period:"Drugi svjetski rat i poraće", year:"Istraživanja objavljena 24. travnja 2026.", status:"Pronalazak dviju masovnih grobnica objavljen službeno", certainty:"confirmed", detail:"Ministarstvo hrvatskih branitelja objavilo je da su u šumi Lešće pronađene dvije masovne grobnice s posmrtnim ostacima najmanje 23 žrtve. Broj i okolnosti ovdje se prenose kao podatak iz objave o pronalasku; konačne identifikacije i daljnji nalazi vode se zasebno.", source:"Ministarstvo hrvatskih branitelja, objava od 24. travnja 2026.", publicLocation:"Područje navedeno u službenoj objavi; ne označavamo točku iskopa bez provjerenog javnog podatka" },
  { id:"cucerje", name:"Čučerje", area:"Gornja Dubrava, Grad Zagreb", period:"Drugi svjetski rat i poraće", year:"Istraživanja objavljena u travnju 2026.", status:"Pronalazak posmrtnih ostataka objavljen službeno", certainty:"confirmed", detail:"U službenoj objavi Ministarstva naveden je pronalazak posmrtnih ostataka triju žrtava u Čučerju. Ne označavamo nalaz kao masovnu grobnicu jer objava opisuje tri pronađene žrtve, a ne potvrđuje takvu klasifikaciju.", source:"Ministarstvo hrvatskih branitelja, objava od 24. travnja 2026.", publicLocation:"Naselje navedeno u službenoj objavi; precizna točka nije javno prikazana ovdje" }
];

const filters = ["Sve lokacije", "Domovinski rat", "Drugi svjetski rat i poraće"];
export default function HrvatskaPamtiGrobnice() {
  const [query, setQuery] = useState("");
  const [period, setPeriod] = useState("Sve lokacije");
  const [expanded, setExpanded] = useState("");
  const results = useMemo(() => sites.filter((site) => {
    const matchesPeriod = period === "Sve lokacije" || site.period === period;
    const haystack = [site.name, site.area, site.period, site.status, site.detail, site.source].join(" ").toLocaleLowerCase("hr");
    return matchesPeriod && haystack.includes(query.trim().toLocaleLowerCase("hr"));
  }), [query, period]);
  return <main className="hp-page hp-register-page">
    <header className="hp-topline">
      <a className="hp-brand" href="/hrvatska-pamti.html"><img src="/assets/images/1000000982.png" alt="" /><span>PatriaSoul <small>ČUVARI NASLJEĐA</small></span></a>
      <nav aria-label="Navigacija registra"><a href="/hrvatska-pamti.html">Hrvatska pamti</a><a href="#registar">Registar lokacija</a><a className="hp-return" href="/">← Povratak u zajednicu</a></nav>
    </header>
    <section className="hp-register-hero">
      <span className="hp-section-kicker">DOKUMENTIRANJE · DOSTOJANSTVO · ISTINA</span>
      <h1>Mjesta stradanja.<br/><em>Imena koja čekaju.</em></h1>
      <p>Jedinstveno kazalo lokacija povezanih sa žrtvama Drugog svjetskog rata i poraća te Domovinskog rata. Svaka lokacija mora imati jasno označen status dokaza — potvrđeno nalazište, službeno objavljeno istraživanje ili podatak koji tek treba provjeriti.</p>
      <div className="hp-register-stats"><div><strong>{sites.length.toString().padStart(2,"0")}</strong><span>početnih zapisa</span></div><div><strong>02</strong><span>povijesna razdoblja</span></div><div><strong>0</strong><span>neprovjerenih koordinata prikazanih kao točne</span></div></div>
    </section>
    <section className="hp-register-content" id="registar">
      <div className="hp-section-heading"><div><span className="hp-section-kicker">RADNI REGISTAR</span><h2>Pronađi <em>lokaciju</em></h2></div><p>Ovo je početni skup javno dokumentiranih primjera, a ne potpuni nacionalni popis. Registar ćemo proširivati prema službenim evidencijama, arhivskoj građi i provjerenim istraživanjima.</p></div>
      <div className="hp-register-controls"><label>Pretraži naziv, područje ili opis<input type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Npr. Vukovar, Zagreb, ekshumacija…"/></label><div className="hp-register-filter" role="group" aria-label="Filtriraj po razdoblju">{filters.map(item=><button type="button" key={item} className={period===item?"active":""} onClick={()=>setPeriod(item)}>{item}</button>)}</div></div>
      <p className="hp-register-count" aria-live="polite">Prikazano zapisa: {results.length}</p>
      <div className="hp-register-list">{results.map(site=><article className="hp-register-card" key={site.id}>
        <div className="hp-register-card-top"><span>{site.period}</span><span className="hp-register-status">{site.status}</span></div>
        <h3>{site.name}</h3><p className="hp-register-area">⌖ {site.area}</p><p>{site.detail}</p>
        <div className="hp-register-meta"><span><small>RAZDOBLJE / GODINA</small><strong>{site.year}</strong></span><span><small>TRAG IZVORA</small><strong>{site.source}</strong></span></div>
        <button className="hp-register-expand" type="button" aria-expanded={expanded===site.id} onClick={()=>setExpanded(expanded===site.id?"":site.id)}>{expanded===site.id?"Sakrij napomene":"Prikaži status i napomene"} <span>{expanded===site.id?"−":"+"}</span></button>
        {expanded===site.id&&<div className="hp-register-detail"><strong>Kako čitati ovaj zapis</strong><p>{site.publicLocation}</p><p>Točnost mjesta i povijesna klasifikacija provjeravaju se zasebno. Ne objavljujemo neprovjerene koordinate, identitete žrtava ni pretpostavke kao potvrđene činjenice.</p></div>}
      </article>)}</div>
      {!results.length&&<div className="hp-catalog-empty"><strong>Nema pronađenih zapisa</strong><p>Promijeni pojam ili odaberi drugo razdoblje.</p></div>}
      <aside className="hp-register-principle"><span>✦</span><div><h3>Ne postoji žrtva drugog reda.</h3><p>Ovaj registar ne rangira patnju niti pretvara stradanje u natjecanje. Povijesno razdoblje, pripadnost i okolnosti navodimo precizno; odgovornost za zločine opisujemo na temelju dokaza, a ne kolektivne krivnje.</p></div></aside>
      <p className="hp-register-disclaimer">Napomena o potpunosti: zapisi su početni i nisu potpuni popis svih masovnih ili pojedinačnih grobnica u Hrvatskoj. Lokacije, broj posmrtnih ostataka i status istraživanja mijenjaju se s novim službenim nalazima. U ovom prikazu nema interaktivnih koordinata iskopa. Izvori su navedeni bibliografski, bez vanjskih poveznica.</p>
    </section>
    <footer className="hp-footer"><a className="hp-brand" href="/hrvatska-pamti.html"><img src="/assets/images/1000000982.png" alt=""/><span>PatriaSoul <small>ČUVARI NASLJEĐA</small></span></a><p>Čuvamo sjećanje. Poštujemo izvore.</p><a href="/hrvatska-pamti.html">Povratak na Hrvatska pamti ↗</a></footer>
  </main>;
}
