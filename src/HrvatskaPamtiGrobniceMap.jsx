import { useEffect, useRef, useState } from "react";

const MAPLIBRE_MODULE = "https://unpkg.com/maplibre-gl@6.14.0/dist/maplibre-gl.mjs";
const MAP_STYLE = "https://tiles.openfreemap.org/styles/fiord";

// Približne točke naselja odvojene su od točnih koordinata grobnica.
const APPROXIMATE_LOCALITIES = {
  // Sve točke u ovom popisu označavaju naselje ili šire područje, ne točnu jamu.
  "ovcara-individual-2025": { lat:45.2958, lng:19.0589, label:"Ovčara, Vukovar", precision:"Približno područje — nije točka pojedinačne grobnice" },
  "ovcara-2025": { lat:45.2958, lng:19.0589, label:"Ovčara, Vukovar", precision:"Približno područje — nije točka grobnice iz 2025." },
  "sarviz-dola": { lat:45.3890, lng:18.9700, label:"Područje Berka", precision:"Približno područje lokaliteta — nije točka grobnice" },
  "novo-groblje-vukovar": { lat:45.3500, lng:19.0020, label:"Vukovar — Novo groblje", precision:"Približna lokacija groblja; nije točka iskopa" },
  "lesce": { lat:45.8580, lng:16.0600, label:"Šuma Lešće, Zagreb", precision:"Približno područje — nije točka grobnice" },
  "cucerje": { lat:45.8790, lng:16.0630, label:"Čučerje, Zagreb", precision:"Približna lokacija naselja — nije točka grobnice" },
  "bobotsko-mrciniste": { lat:45.4219, lng:18.8572, label:"Bobota", precision:"Približna lokacija naselja — nije točka grobnice" },
  "bogdanovci-lipica": { lat:45.3400, lng:18.9500, label:"Bogdanovci", precision:"Približna lokacija naselja — nije točka grobnice" },
  "gređani": { lat:45.1800, lng:15.9800, label:"Gređani, Topusko", precision:"Približna lokacija naselja — nije točka grobnice" },
  "vasic-bare": { lat:45.2050, lng:16.4500, label:"Srednja Meminska, Majur", precision:"Približno područje naselja — nije točka grobnice" },
  "biokovo-zagvozd": { lat:43.4000, lng:17.0500, label:"Biokovo kod Zagvozda", precision:"Približno šire područje — nije točka jame" },
  "oporovecki-vinogradi": { lat:45.8500, lng:16.0800, label:"Oporovečki vinogradi, Zagreb", precision:"Približno područje — nije točka grobnice" },
  "jama-golubinka": { lat:43.8000, lng:15.6500, label:"Brdo Sopanj, Tisno", precision:"Približno područje — nije točka jame" },
  "komarevo": { lat:45.4700, lng:16.3500, label:"Komarevo", precision:"Približna lokacija naselja — nije točka grobnice" },
  "medvidja-jama": { lat:43.4000, lng:17.0500, label:"Biokovo kod Zagvozda", precision:"Približno šire područje — nije točka jame" },
  "vrgorac-imotski": { lat:43.2050, lng:17.3700, label:"Područje Vrgorca i Imotskog", precision:"Približno područje dvaju gradova — ne označava pojedinačne grobnice" },
  "granesiski-novaki": { lat:45.8500, lng:16.0800, label:"Granešinski Novaki, Zagreb", precision:"Približno područje — nije točka grobnice" },
  "gracani": { lat:45.8700, lng:15.9900, label:"Gračani, Zagreb", precision:"Približna lokacija naselja — nije točka grobnice" },
  "tuskanac": { lat:45.8190, lng:15.9700, label:"Tuškanac, Zagreb", precision:"Približno područje — nije točka grobnice" },
  "pescenka": { lat:45.8000, lng:16.0200, label:"Peščenica, Zagreb", precision:"Približno područje — nije točka grobnice" },
  "savska-cesta": { lat:45.8000, lng:15.9600, label:"Savska cesta, Zagreb", precision:"Približno područje — nije točka grobnice" },
  "obernjak-medvednica": { lat:45.9000, lng:15.9700, label:"Medvednica", precision:"Približno šire područje — nije točka grobnice" },
  "ljubijska-ulica": { lat:45.8300, lng:16.0400, label:"Ljubijska ulica, Zagreb", precision:"Približno područje ulice — nije točka grobnice" },
  "macesnova-gorica": { lat:45.6500, lng:14.8500, label:"Kočevski Rog, Slovenija", precision:"Približno šire područje — nije točka jame" },
  "tezno-maribor": { lat:46.5300, lng:15.6800, label:"Tezno, Maribor", precision:"Približno područje — nije točka grobnice" },
  "huda-jama": { lat:46.1500, lng:15.2000, label:"Huda Jama, Laško", precision:"Približno područje — nije točka rudnika" },
  "tomasica": { lat:44.9800, lng:16.7000, label:"Tomašica, Prijedor", precision:"Približna lokacija naselja — nije točka grobnice" },
  "koricanske-stijene": { lat:44.2800, lng:17.6000, label:"Korićanske stijene, Vlašić", precision:"Približno šire područje — nije točka stratišta" },
  "srebrenica-potocari": { lat:44.1500, lng:19.3000, label:"Srebrenica i Potočari", precision:"Približno područje — obuhvaća više lokacija" },
  "glogova": { lat:44.1800, lng:19.2000, label:"Glogova, Bratunac", precision:"Približna lokacija naselja — nije točka grobnice" },
  "branjevo": { lat:44.4000, lng:19.1000, label:"Branjevo, Zvornik", precision:"Približna lokacija područja — nije točka grobnice" },
  "petkovci": { lat:44.4000, lng:19.1000, label:"Petkovci, Zvornik", precision:"Približna lokacija naselja — nije točka brane/grobnice" },
  "kozluk": { lat:44.3500, lng:19.1300, label:"Kozluk, Zvornik", precision:"Približna lokacija naselja — nije točka grobnice" },
  "loibacher-feld": { lat:46.5900, lng:14.7800, label:"Loibacher Feld, Austrija", precision:"Približno područje polja — nije točka pojedinačnog groba" },
  "inzenjerijski-poligon": { lat:45.3500, lng:19.0000, label:"Vukovar — inženjerijski poligon", precision:"Približno područje — nije točka iskopa" },
  "balenica-pasnjak": { lat:45.3500, lng:19.0000, label:"Vukovar — Balenica", precision:"Približno područje — nije točka iskopa" },
  "gradska-trznica-vukovar": { lat:45.3500, lng:19.0000, label:"Vukovar — gradska tržnica", precision:"Približno područje — nije točka grobnice" },
  "sotin-atar-vinogradi-2013": { lat:45.2700, lng:19.1000, label:"Sotin", precision:"Približna lokacija naselja — nije točka grobnice" },
  "sotin-sekundarna-klaonica-1996": { lat:45.2700, lng:19.1000, label:"Sotin", precision:"Približna lokacija naselja — nije točka grobnice" },
  "sotin-primarna-sekundarna-2013": { lat:45.2700, lng:19.1000, label:"Sotin", precision:"Približna lokacija naselja — ne razdvaja dvije grobnice" },
  "sotin-nalaz-2019": { lat:45.2700, lng:19.1000, label:"Sotin", precision:"Približna lokacija naselja — nije točka grobnice" },
  "sotin-vukovar": { lat:45.2700, lng:19.1000, label:"Sotin", precision:"Približna lokacija naselja — obuhvaća područja pretraživanja" },
  "priljevo-vukovar": { lat:45.3500, lng:19.0000, label:"Priljevo, Vukovar", precision:"Približno područje — nije točka grobnice" },
  "velepromet-tri-grobnice": { lat:45.3500, lng:19.0000, label:"Velepromet, Vukovar", precision:"Približno područje — tri točke nisu pojedinačno locirane" },
  "velepromet-probna-iskapanja": { lat:45.3500, lng:19.0000, label:"Velepromet, Vukovar", precision:"Približno područje — nije točka iskopa" },
  "sloga-vukovar": { lat:45.3500, lng:19.0000, label:"Stadion Sloga, Vukovar", precision:"Približno područje stadiona — nije točka grobnice" },
  "staro-katolicko-groblje-vukovar": { lat:45.3500, lng:19.0000, label:"Staro katoličko groblje, Vukovar", precision:"Približno područje groblja — nije točka iskopa" },
  "petrovacka-dola": { lat:45.3500, lng:19.0000, label:"Petrovačka dola, Vukovar", precision:"Približno područje odlagališta — ne označava točnu lokaciju svih nalaza" },
  "marinci": { lat:45.3000, lng:18.9200, label:"Marinci", precision:"Približna lokacija naselja — nije točka grobnice" },
  "skabrnja-mass-grave": { lat:44.0900, lng:15.6300, label:"Škabrnja", precision:"Približna lokacija naselja — nije točka grobnice kod škole" },
  "skabrnja-ambar": { lat:44.0900, lng:15.6300, label:"Ambar, Škabrnja", precision:"Približna lokacija područja — nije točka grobnice" },
  "daljski-atar-glogovac": { lat:45.4900, lng:18.9800, label:"Daljski Atar — Glogovac", precision:"Približno područje — nije točka grobnice" },
  "tovarnik-masovna-grobnica": { lat:45.1600, lng:19.1500, label:"Tovarnik", precision:"Približna lokacija naselja — nije točka grobnice" },
  "suma-jelas": { lat:45.2300, lng:19.1800, label:"Šuma Jelaš, Tompojevci", precision:"Približno područje — nije točka grobnice" },
  "mala-solina": { lat:45.3400, lng:16.0500, label:"Mala Solina, Glina", precision:"Približna lokacija naselja — nije točka grobnice" },
  "komogovina": { lat:45.2400, lng:16.3000, label:"Komogovina", precision:"Približna lokacija naselja — nije točka grobnice" },
  "dragovic": { lat:45.4700, lng:17.1900, label:"Dragović, Pakrac", precision:"Približna lokacija naselja — nije točka grobnice" },
  "velika-solina": { lat:45.3400, lng:16.0500, label:"Velika Solina, Glina", precision:"Približna lokacija naselja — nije točka grobnice" },
  "mohovo": { lat:45.4000, lng:19.2500, label:"Mohovo", precision:"Približna lokacija naselja — nije točka grobnice" },
  "sveta-nedelja-lipje-trebez": { lat:45.8000, lng:15.7800, label:"Sveta Nedelja — Lipje i Trebež-Pakovica", precision:"Približno područje — dvije grobnice nisu pojedinačno locirane" },
  "betin-dvor": { lat:45.5500, lng:18.7400, label:"Betin Dvor kod Tenje", precision:"Približno područje — nije točka grobnice" },
  "stari-seles-domovinski-rat": { lat:45.5200, lng:18.7000, label:"Stari Seleš", precision:"Približno područje — nije točka grobnice" },
};

function getMapLocation(site) {
  if (Number.isFinite(site.coordinates?.lat) && Number.isFinite(site.coordinates?.lng)) {
    return { ...site.coordinates, approximate: String(site.coordinates.precision || "").toLowerCase().includes("približ"), approximateLabel: site.coordinates.label || site.name };
  }
  const approximate = APPROXIMATE_LOCALITIES[site.id];
  return approximate ? { ...approximate, approximate: true } : null;
}

export default function HrvatskaPamtiGrobniceMap({ sites = [] }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const [mapError, setMapError] = useState(false);
  const mappedSites = sites
     .filter((site) => site.certainty === "confirmed" && getMapLocation(site))
    .map((site) => ({ ...site, mapLocation: getMapLocation(site) }));

  useEffect(() => {
    let cancelled = false;
    let mapInstance;
    let focusMarker;

    async function loadMap() {
      try {
        if (!document.querySelector('link[data-hp-grave-maplibre="true"]')) {
          const stylesheet = document.createElement("link");
          stylesheet.rel = "stylesheet";
          stylesheet.href = "https://unpkg.com/maplibre-gl@6.14.0/dist/maplibre-gl.css";
          stylesheet.dataset.hpGraveMaplibre = "true";
          document.head.appendChild(stylesheet);
        }
        const maplibregl = await import(/* @vite-ignore */ MAPLIBRE_MODULE);
        if (cancelled || !containerRef.current) return;
        mapInstance = new maplibregl.Map({
          container: containerRef.current,
          style: MAP_STYLE,
          center: [17.9, 44.8],
          zoom: 5.8,
          minZoom: 4.5,
          maxZoom: 17,
          attributionControl: true,
          cooperativeGestures: true,
        });
        mapRef.current = mapInstance;
        mapInstance.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");

        mappedSites.forEach((site) => {
          const markerElement = document.createElement("button");
          markerElement.type = "button";
          markerElement.className = site.mapLocation.approximate
            ? "hp-grave-map-marker hp-grave-map-marker-approximate"
            : "hp-grave-map-marker";
          markerElement.setAttribute("aria-label", "Otvori zapis: " + site.name);
          markerElement.innerHTML = '<span aria-hidden="true">✦</span>';

          const popupContent = document.createElement("div");
          popupContent.className = "hp-grave-map-popup";
          const heading = document.createElement("strong");
          heading.textContent = site.name;
          const area = document.createElement("p");
          area.textContent = site.area + " · " + site.period;
          const status = document.createElement("p");
          status.textContent = site.foundLabel || "Broj pronađenih osoba nije zasebno potvrđen u ovom zapisu.";
          const precision = document.createElement("small");
          precision.textContent = site.mapLocation.label + " — " + site.mapLocation.precision;
          const actions = document.createElement("div");
          actions.className = "hp-grave-map-popup-actions";
          const recordLink = document.createElement("button");
          recordLink.type = "button";
          recordLink.textContent = "Otvori evidencijski zapis";
          recordLink.addEventListener("click", () => {
            document.getElementById("hp-site-" + site.id)?.scrollIntoView({ behavior: "smooth", block: "center" });
          });
          actions.appendChild(recordLink);
          if (site.mapLocation.sourceUrl) {
            const sourceLink = document.createElement("a");
            sourceLink.href = site.mapLocation.sourceUrl;
            sourceLink.target = "_blank";
            sourceLink.rel = "noreferrer";
            sourceLink.textContent = "Provjeri izvor ↗";
            actions.appendChild(sourceLink);
          }
          popupContent.append(heading, area, status, precision, actions);
          const popup = new maplibregl.Popup({ offset: 18, maxWidth: "320px" }).setDOMContent(popupContent);
          const marker = new maplibregl.Marker({ element: markerElement, anchor: "center" })
            .setLngLat([site.mapLocation.lng, site.mapLocation.lat])
            .setPopup(popup)
            .addTo(mapInstance);
          markersRef.current.push({ siteId: site.id, marker, popup });
        });

        focusMarker = (event) => {
          const siteId = event?.detail?.siteId;
          if (!siteId || !mapInstance || cancelled) return;
          const entry = markersRef.current.find((item) => item.siteId === siteId);
          const site = mappedSites.find((item) => item.id === siteId);
          if (!entry || !site) return;
          mapInstance.flyTo({
            center: [site.mapLocation.lng, site.mapLocation.lat],
            zoom: Math.max(mapInstance.getZoom(), 12),
            essential: true,
            duration: 900,
          });
          window.setTimeout(() => {
            if (!cancelled && entry.marker && !entry.marker.getPopup()?.isOpen()) entry.marker.togglePopup();
          }, 950);
        };
        window.addEventListener("hp-focus-grave-map", focusMarker);

        mapInstance.on("error", (event) => {
          if (event?.error && !cancelled) setMapError(true);
        });
        if (mappedSites.length > 1) {
          const bounds = new maplibregl.LngLatBounds();
          mappedSites.forEach((site) => bounds.extend([site.mapLocation.lng, site.mapLocation.lat]));
          mapInstance.fitBounds(bounds, { padding: 70, maxZoom: 7.5, duration: 0 });
        } else if (mappedSites.length === 1) {
          mapInstance.setCenter([mappedSites[0].mapLocation.lng, mappedSites[0].mapLocation.lat]);
          mapInstance.setZoom(8);
        }
      } catch {
        if (!cancelled) setMapError(true);
      }
    }

    loadMap();
    return () => {
      cancelled = true;
      if (focusMarker) window.removeEventListener("hp-focus-grave-map", focusMarker);
      markersRef.current.forEach((entry) => entry.marker.remove());
      markersRef.current = [];
      if (mapInstance) mapInstance.remove();
      mapRef.current = null;
    };
  }, [sites]);

  return (
    <section className="hp-grave-map-section" aria-labelledby="hp-grave-map-title">
      <div className="hp-grave-map-heading">
        <div><span className="hp-section-kicker">GEOGRAFSKI PREGLED</span><h2 id="hp-grave-map-title">Grobnice na <em>karti</em></h2></div>
        <p>Odaberi oznaku za pregled zapisa, broja pronađenih ostataka i izvora lokacije. Pune oznake su provjerene koordinate grobnica; isprekidane su približne lokacije naselja ili područja.</p>
      </div>
      <div className="hp-grave-map-shell">
        <div ref={containerRef} className="hp-grave-map-canvas" aria-label="Interaktivna karta masovnih grobnica hrvatskih žrtava" />
        {mapError && <div className="hp-grave-map-error" role="status">Karta se trenutačno ne može učitati. Evidencijski zapisi i njihove izvorne poveznice ostaju dostupni ispod.</div>}
        <div className="hp-grave-map-caption"><span /> KARTA TEMELJENA NA PODACIMA OPENSTREETMAPA <small>© OpenStreetMap contributors · OpenFreeMap</small></div>
      </div>
      <p className="hp-grave-map-note"><strong>{mappedSites.length}</strong> {mappedSites.length === 1 ? "lokacija" : "lokacije"} prikazane su na karti. Puna oznaka znači da je potvrđena javna koordinata grobnice. Isprekidana oznaka pokazuje približno naselje ili šire područje, a ne točku iskopa. Više zapisa na istom području može dijeliti približnu oznaku; to nije dokaz da je riječ o istoj grobnici.</p>
    </section>
  );
}
