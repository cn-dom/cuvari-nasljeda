import { useEffect, useRef, useState } from "react";

const MAPLIBRE_MODULE = "https://unpkg.com/maplibre-gl@6.14.0/dist/maplibre-gl.mjs";
const MAP_STYLE = "https://tiles.openfreemap.org/styles/fiord";

// Približne točke naselja odvojene su od točnih koordinata grobnica.
const APPROXIMATE_LOCALITIES = {
  "ilaca-domovinski-rat": { lat: 45.19, lng: 18.93, label: "Ilača", precision: "Približna lokacija naselja — nije koordinata grobnice" },
  "negoslavci-masovna-2024": { lat: 45.28, lng: 18.99, label: "Negoslavci", precision: "Približna lokacija naselja — nije koordinata grobnice" },
  "miklusevci": { lat: 45.23, lng: 19.05, label: "Mikluševci", precision: "Približna lokacija naselja — nije koordinata grobnice" },
  "bobota-ekonomija-2025": { lat: 45.37, lng: 18.85, label: "Bobota", precision: "Približna lokacija naselja — nije koordinata grobnice" },
  "gornje-jame": { lat: 45.34, lng: 15.99, label: "Gornje Jame", precision: "Približna lokacija naselja — nije koordinata grobnice" },
  "stari-seles": { lat: 45.27, lng: 18.92, label: "Stari Seleš", precision: "Približna lokacija područja — nije koordinata grobnice" },
};

function getMapLocation(site) {
  if (Number.isFinite(site.coordinates?.lat) && Number.isFinite(site.coordinates?.lng)) {
    return { ...site.coordinates, approximate: false };
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
    .filter((site) => site.croatianVictimsConfirmed === true && getMapLocation(site))
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
        <p>Odaberi oznaku za pregled zapisa, broja pronađenih ostataka i izvora lokacije. Oznake se prikazuju samo kada postoje javno provjerljive koordinate.</p>
      </div>
      <div className="hp-grave-map-shell">
        <div ref={containerRef} className="hp-grave-map-canvas" aria-label="Interaktivna karta masovnih grobnica hrvatskih žrtava" />
        {mapError && <div className="hp-grave-map-error" role="status">Karta se trenutačno ne može učitati. Evidencijski zapisi i njihove izvorne poveznice ostaju dostupni ispod.</div>}
        <div className="hp-grave-map-caption"><span /> KARTA TEMELJENA NA PODACIMA OPENSTREETMAPA <small>© OpenStreetMap contributors · OpenFreeMap</small></div>
      </div>
      <p className="hp-grave-map-note"><strong>{mappedSites.length}</strong> {mappedSites.length === 1 ? "lokacija" : "lokacije"} prikazane su na karti. Oznake s punom bojom imaju javno potvrđene koordinate grobnice; oznake s isprekidanim rubom prikazuju samo približno područje naselja, ne mjesto iskopa. Ostale potvrđene grobnice ostaju u registru dok se ne pronađu pouzdani podaci o lokaciji.</p>
    </section>
  );
}
