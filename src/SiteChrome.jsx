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
    <footer className="ps-site-footer">
      <a className="ps-site-footer-brand" href="/"><img src="/assets/images/1000000982.png" alt="" /><span><strong>PatriaSoul</strong><small>ČUVARI NASLJEĐA</small></span></a>
      <p>Upoznaj Hrvatsku. Čuvaj baštinu. Prenesi priču.</p>
      <nav aria-label="Informacije i pravila"><a href="/pravila-koristenja.html">Pravila korištenja</a><a href="/privatnost.html">Privatnost</a><a href="/pravila-zajednice.html">Pravila zajednice</a><a href="mailto:patriasoul@protonmail.com">Kontakt</a></nav>
    </footer>
  </>;
}
