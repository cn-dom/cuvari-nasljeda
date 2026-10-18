import React from "react";
import "./SiteChrome.css";

const primary = [
  { label: "Zid", href: "/" },
  { label: "Domovina", href: "/hrvatska-pamti.html", children: [
    { label: "Hrvatska pamti", href: "/hrvatska-pamti.html" },
    { label: "Registar grobišta", href: "/hrvatska-pamti-grobnice.html" },
    { label: "Video arhiva", href: "/video-arhiva.html" },
  ]},
  { label: "Zajednica", href: "/forum.html", children: [
    { label: "Forum", href: "/forum.html" }, { label: "Grupe", href: "/#grupe" }, { label: "Događaji", href: "/dogadaji.html" },
  ]},
  { label: "Kultura i znanje", href: "/virtualni-muzej.html", children: [
    { label: "Virtualni muzej", href: "/virtualni-muzej.html" }, { label: "Kviz", href: "/kviz/" }, { label: "Vjera", href: "/vjera-hrvata.html" },
  ]},
  { label: "Mediji", href: "/video-arhiva.html", children: [
    { label: "Video arhiva", href: "/video-arhiva.html" }, { label: "Hrvatski Val Player", href: "/hrvatski-val.html" },
  ]},
];

export function SiteFooter() {
  return (
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
  );
}

export default function SiteChrome({ section = "Domovina", links = [], rightContent = null }) {
  const active = primary.find((item) => item.label === section) || primary[1];
  const sublinks = links.length ? links : (active.children || []);
  return <>
    <header className="ps-site-header">
      <a className="ps-site-brand" href="/" aria-label="PatriaSoul — povratak na zid">
        <img src="/assets/images/1000000982.png" alt="" />
        <span><strong>PatriaSoul</strong><small>ČUVARI NASLJEĐA</small></span>
      </a>
      <nav className="ps-site-primary" aria-label="Glavna navigacija">
        {primary.map((item) => <a key={item.label} className={item.label === section ? "active" : ""} href={item.href}>{item.label}</a>)}
      </nav>
      <div className="ps-site-actions">{rightContent}<a className="ps-site-wall-link" href="/">Zid zajednice <span aria-hidden="true">↗</span></a></div>
    </header>
    {sublinks.length > 0 && <nav className="ps-site-subnav" aria-label={active.label + " — podnavigacija"}>
      <span className="ps-site-subnav-label">{active.label}</span>
      {sublinks.map((item) => <a key={item.label} href={item.href}>{item.label}</a>)}
    </nav>}

  </>;
}
