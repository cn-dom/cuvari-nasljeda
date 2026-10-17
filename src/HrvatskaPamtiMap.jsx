import { useEffect, useRef, useState } from "react";

/**
 * Interactive prototype map for Hrvatska pamti.
 * MapLibre is loaded on demand so the main social-network bundle stays lean.
 * Place descriptions remain explicitly marked as preparation, not verified records.
 */
const MAPLIBRE_MODULE = "https://unpkg.com/maplibre-gl@6.14.0/dist/maplibre-gl.mjs";
const MAP_STYLE = "https://demotiles.maplibre.org/style.json";

const mapPoints = [
  { name: "Vukovar", coordinates: [18.9994, 45.3511] },
  { name: "Škabrnja", coordinates: [15.455, 44.087] },
  { name: "Dubrovnik", coordinates: [18.0944, 42.6507] },
  { name: "Lika i Krbava", coordinates: [15.375, 44.546] },
];

export default function HrvatskaPamtiMap({ places, selectedPlace, onSelect }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const [mapError, setMapError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let mapInstance;

    const loadMap = async () => {
      try {
        if (!document.querySelector('link[data-hp-maplibre="true"]')) {
          const stylesheet = document.createElement("link");
          stylesheet.rel = "stylesheet";
          stylesheet.href = "https://unpkg.com/maplibre-gl@6.14.0/dist/maplibre-gl.css";
          stylesheet.dataset.hpMaplibre = "true";
          document.head.appendChild(stylesheet);
        }

        const maplibregl = await import(/* @vite-ignore */ MAPLIBRE_MODULE);
        if (cancelled || !containerRef.current) return;

        mapInstance = new maplibregl.Map({
          container: containerRef.current,
          style: MAP_STYLE,
          center: [16.4, 45.25],
          zoom: 5.7,
          minZoom: 5,
          maxZoom: 13,
          maxBounds: [[12.5, 41.8], [20.8, 47.2]],
          attributionControl: true,
          cooperativeGestures: true,
        });
        mapRef.current = mapInstance;

        mapInstance.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");

        mapPoints.forEach((point, index) => {
          const place = places.find((item) => item.name === point.name);
          if (!place) return;
          const markerElement = document.createElement("button");
          markerElement.type = "button";
          markerElement.className = place.name === selectedPlace?.name ? "hp-real-map-marker selected" : "hp-real-map-marker";
          markerElement.setAttribute("aria-label", "Odaberi " + place.name);
          markerElement.innerHTML = '<span aria-hidden="true">✦</span>';
          markerElement.addEventListener("click", () => onSelect(place));
          const marker = new maplibregl.Marker({ element: markerElement, anchor: "center" })
            .setLngLat(point.coordinates)
            .addTo(mapInstance);
          markersRef.current.push({ marker, place, index });
        });

        mapInstance.on("error", (event) => {
          if (event?.error && !cancelled) setMapError(true);
        });
      } catch {
        if (!cancelled) setMapError(true);
      }
    };

    loadMap();
    return () => {
      cancelled = true;
      markersRef.current.forEach(({ marker }) => marker.remove());
      markersRef.current = [];
      if (mapInstance) mapInstance.remove();
      mapRef.current = null;
    };
  }, [places, onSelect]);

  useEffect(() => {
    markersRef.current.forEach(({ marker, place }) => {
      const element = marker.getElement();
      const active = place.name === selectedPlace?.name;
      element.classList.toggle("selected", active);
      if (active && mapRef.current) {
        mapRef.current.easeTo({ center: marker.getLngLat(), zoom: Math.max(mapRef.current.getZoom(), 7.2), duration: 550 });
      }
    });
  }, [selectedPlace]);

  return (
    <div className="hp-map-art hp-real-map-wrap" aria-label="Interaktivna karta Hrvatske">
      <div ref={containerRef} className="hp-real-map" />
      <div className="hp-map-caption">
        <span className="hp-map-live-dot" /> INTERAKTIVNA KARTA HRVATSKE
        <small>POČETNI PREGLED</small>
      </div>
      {mapError && (
        <div className="hp-map-error" role="status">
          Karta se trenutačno ne može učitati. Provjeri internetsku vezu ili pokušaj ponovno.
        </div>
      )}
    </div>
  );
}
