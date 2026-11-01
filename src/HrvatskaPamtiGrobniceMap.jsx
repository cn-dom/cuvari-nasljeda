import { useEffect, useRef, useState } from "react";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
const MAP_STYLE = {
  version: 8,
  sources: {
    "osm-raster": {
      type: "raster",
      tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
      tileSize: 256,
      attribution: "© OpenStreetMap contributors",
    },
  },
  layers: [{ id: "osm-raster-layer", type: "raster", source: "osm-raster", minzoom: 0, maxzoom: 19 }],
};

// Približne točke naselja odvojene su od točnih koordinata grobnica.
const APPROXIMATE_LOCALITIES = {
  // Sve točke u ovom popisu označavaju naselje ili šire područje, ne točnu jamu.
  "ilaca-domovinski-rat": { lat:45.18241, lng:19.09501, label:"Ilača", precision:"Približna lokacija naselja — nije koordinata grobnice" },
  "negoslavci-masovna-2024": { lat:45.2800, lng:18.9900, label:"Negoslavci", precision:"Približna lokacija naselja — nije koordinata grobnice" },
  "miklusevci": { lat:45.25125, lng:19.08465, label:"Mikluševci", precision:"Približna lokacija naselja — nije koordinata grobnice" },
  "bobota-ekonomija-2025": { lat:45.42195, lng:18.85723, label:"Bobota", precision:"Približna lokacija naselja — nije koordinata grobnice" },
  "gornje-jame": { lat:45.40664, lng:16.12150, label:"Gornje Jame", precision:"Približna lokacija naselja — nije koordinata grobnice" },
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
  "mostisce-sudovac": { lat:46.1319959, lng:16.3629416, label:"Mostišće, Sudovec", precision:"Koordinata zaseoka Mostišće iz javnog zemljopisnog izvora — nije točka pojedinačne grobne jame" },
  "krasic-hrzenik": { lat:45.65627, lng:15.48728, label:"Hrženik, Krašić", precision:"Približna lokacija naselja — nije točka grobnice" },
  "betin-dvor": { lat:45.5500, lng:18.7400, label:"Betin Dvor kod Tenje", precision:"Približno područje — nije točka grobnice" },
  "stari-seles-domovinski-rat": { lat:45.5200, lng:18.7000, label:"Stari Seleš", precision:"Približno područje — nije točka grobnice" },
  // Približne koordinate naselja ili memorijalnog područja — nikada točka grobnice.
  "kampor-spomen-groblje": { lat:44.775, lng:14.71861, label:"Kampor, otok Rab — spomen-groblje", precision:"Približna lokacija naselja i memorijalnog područja — nije točka pojedinačnog groba", sourceUrl:"https://mapcarta.com/18781478" },
  "jama-grijalice": { lat:45.40083, lng:14.79972, label:"Delnice — šire područje", precision:"Približna lokacija grada Delnica — nije koordinata jame Grijalice", sourceUrl:"https://www.geodatos.net/en/coordinates/croatia/delnice" },
  "trebce-slovenija": { lat:46.0476, lng:15.63266, label:"Trebče, Bistrica ob Sotli", precision:"Približna lokacija naselja — nije koordinata masovne grobnice", sourceUrl:"https://mapcarta.com/18723484" },
  "rugarski-klanci-podstenice": { lat:45.71638, lng:15.01553, label:"Podstenice, Slovenija", precision:"Približna lokacija naselja — nije koordinata jame u Rugarskim klancima", sourceUrl:"https://en.wikipedia.org/wiki/Podstenice" },
  "kosnica-pri-celju": { lat:46.217475, lng:15.2425139, label:"Košnica pri Celju, Slovenija", precision:"Približna lokacija naselja — nije koordinata masovne grobnice", sourceUrl:"https://en.wikipedia.org/wiki/Ko%C5%A1nica_pri_Celju" },
  "cerklje-na-krki": { lat:45.8844417, lng:15.5202444, label:"Cerklje ob Krki, Slovenija", precision:"Približna lokacija naselja — nije koordinata grobnice na aerodromu", sourceUrl:"https://en.wikipedia.org/wiki/Cerklje_ob_Krki" },
  "macelj-zajednicki-ukop-2026": { lat:46.223, lng:15.845, label:"Donji Macelj — Spomen-crkva Muke Isusove", precision:"Približna lokacija naselja/memorijalnog područja — nije koordinata pojedinačnog groba", sourceUrl:"https://www.djurmanec.hr/donji-macelj/" },
  "krizanov-jarek-macelj": { lat:46.223, lng:15.845, label:"Maceljska gora — područje Križanovog jareka", precision:"Približno područje Donjeg Maclja — nije točka masovne grobnice", sourceUrl:"https://branitelji.gov.hr/vijesti/ekshumirani-posmrtni-ostaci-na-maceljskoj-gori/3696" },
    "kamenjarka-radasinovci": { lat:43.9000, lng:15.5800, label:"Radašinovci — područje Kamenjarke", precision:"Približno područje naselja i Parka prirode Vransko jezero — nije koordinata ulaza u jamu", sourceUrl:"https://branitelji.gov.hr/vijesti/u-jami-kamenjarka-pronadjeni-posmrtni-ostaci-zrtava-iz-drugog-svjetskog-rata/5290" },
  "dobrava-memorijalni-park": { lat:46.5184, lng:15.6963, label:"Memorijalno groblje Dobrava, Maribor", precision:"Lokacija memorijalnog groblja prema Vijeću Europe; nije primarno mjesto stradanja niti točka pojedinačne grobnice", sourceUrl:"https://www.coe.int/en/web/cultural-routes/-/maribor-funerary-company-d-d-" },
  "lepa-bukva-macelj": { lat:46.223, lng:15.845, label:"Maceljska gora — područje Lepe Bukve", precision:"Približno područje Donjeg Maclja — nije točka sekundarne grobnice", sourceUrl:"https://branitelji.gov.hr/vijesti/zavrsena-terenska-istrazivanja-na-podrucju-maceljske-gore/3707" },

  "jazovka": { lat:45.7350, lng:15.4140, label:"Jama Jazovka — šire područje Sošica", precision:"Približno područje naselja i šume — nije koordinata ulaza u jamu", sourceUrl:"https://branitelji.gov.hr/vijesti/odrzan-posljednji-ispracaj-i-ukop-814-zrtava-iz-masovne-grobnice-jame-jazovke/5025" },
  "gospic-sv-marija-magdalena": { lat:44.5458, lng:15.3735, label:"Gospić — groblje sv. Marije Magdalene", precision:"Približna lokacija groblja i okolnog područja — nije točka iskopa", sourceUrl:"https://branitelji.gov.hr/vijesti/zavrsena-ekshumacija-posmrtnih-ostataka-zrtava-drugog-svjetskog-rata-i-poslijeratnog-razdoblja-u-gospicu/4480" },
  "prudnice-brdovec": { lat:45.8650, lng:15.7380, label:"Prudnice, Brdovec", precision:"Približna lokacija naselja/područja — nije točka grobne jame", sourceUrl:"https://branitelji.gov.hr/vijesti/u-laducu-pokopane-133-zrtve-poslijeratnog-razdoblja-drugog-svjetskog-rata/4116" },
  "francikovac-senj": { lat:44.9890, lng:14.9050, label:"Senj — šire područje", precision:"Približna lokacija grada/područja — nije točka grobnice", sourceUrl:"https://vlada.gov.hr/hrvatska-preuzela-od-slovenije-posmrtne-ostatke-500-hrvatskih-zrtava-iz-drugog-svjetskog-rata-i-poslijeratnog-razdoblja/46678" },
  "tomasica-garesnica": { lat:45.5750, lng:16.9300, label:"Tomašica kod Garešnice", precision:"Približna lokacija naselja — nije točka grobnice", sourceUrl:"https://branitelji.gov.hr/print.aspx?id=3629&url=print" },

  "crngrob-mikrolokacije-1-2-5": { lat:46.19998, lng:14.30734, label:"Crngrob — šire šumsko područje", precision:"Približna lokacija sela i šumskog područja — nije točka grobišta 1, 2 ili 5", sourceUrl:"https://branitelji.gov.hr/vijesti/u-sloveniji-u-tijeku-terenska-istrazivanja-grobista-iz-drugog-svjetskog-rata-i-poslijeratnog-razdoblja/5180" },
  "celje-klukec": { lat:46.2300, lng:15.2600, label:"Golovec, Celje", precision:"Približno područje Golovca — nije točka iskopa kod Klukeca", sourceUrl:"https://hrcak.srce.hr/file/423862" },
  "celje-zgornja-hudinja": { lat:46.2450, lng:15.2750, label:"Zgornja Hudinja, Celje", precision:"Približno područje naselja i škole — nije točka iskopa u protutenkovskom rovu", sourceUrl:"https://hrcak.srce.hr/file/423862" },
  "mostec-protitankovski-rov": { lat:45.90015, lng:15.62863, label:"Mostec kod Brežica", precision:"Približna lokacija naselja — nije trasa protutenkovskog rova ni točka iskopa", sourceUrl:"https://www.arheologija.si/files/2023/06/Arheologija-v-letu-2022-WEB.pdf" },
  "raduse-zancani": { lat:46.48333, lng:15.06667, label:"Raduše — područje Ježevce", precision:"Približna lokacija naselja Raduše — nije točka grobišta Žančani", sourceUrl:"https://hrcak.srce.hr/file/423862" },
  "lobnica-ruska-koca-areh-3": { lat:46.49505, lng:15.50823, label:"Areh, Pohorje", precision:"Približna lokacija Ruške koče — nije točka grobišta Areh 3", sourceUrl:"https://hrcak.srce.hr/file/423862" },
  "glazuta-brezno-konfin-1": { lat:45.64852, lng:14.72860, label:"Brezno pri Konfinu 1", precision:"Približna zemljopisna oznaka jame — nije koordinata ulaza ni grobišta", sourceUrl:"https://www.fhs.hr/_download/repository/Kultura%20sje%C4%87anja%20na%20ratne%20i%20poratne%20žrtve%20sken%202.pdf" },
  "kamnik-cuzakov-travnik": { lat:46.2250, lng:14.6120, label:"Kamnik — područje tvornice Svit", precision:"Približno područje tvornice Svit — nije točka pet grobova", sourceUrl:"https://ojs.srce.hr/casopis-za-suvremenu-povijest/article/download/23843/13440/97820" },
  "podstenice-brezno-3": { lat:45.71638, lng:15.01553, label:"Podstenice, Kočevski Rog", precision:"Približna lokacija naselja — nije točka Brezna 3", sourceUrl:"https://hrcak.srce.hr/file/423862" },
  "zgornja-lipnica-lancovo-1": { lat:46.32505, lng:14.17167, label:"Zgornja Lipnica — Lancovo", precision:"Približna lokacija naselja — nije točka grobišta Lancovo 1", sourceUrl:"https://hrcak.srce.hr/file/423862" },
  "ples-vinagora-1": { lat:46.07471, lng:15.65315, label:"Ples, Bistrica ob Sotli", precision:"Približna lokacija naselja Ples — nije točka grobišta pod hribom Vinagora 1", sourceUrl:"https://hrcak.srce.hr/file/423862" },
  "zavrse-herlah": { lat:46.42087, lng:15.16172, label:"Završe, Mislinja", precision:"Približna lokacija naselja Završe — nije točka grobišta pri domaćiji Herlah, kućni broj 86", sourceUrl:"https://hrcak.srce.hr/file/423862" },
  "tezno-gozd-4-5-6": { lat:46.5300, lng:15.6800, label:"Tezenski gozd, Dogoše", precision:"Približno područje Dogoša i Tezenskog gozda — nije točka grobišta 4, 5 ili 6", sourceUrl:"https://hrcak.srce.hr/file/423862" },

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
  const maplibreRef = useRef(null);
  const searchMarkerRef = useRef(null);
  const [mapError, setMapError] = useState(false);
  const [mapQuery, setMapQuery] = useState("");
  const [placeMatches, setPlaceMatches] = useState([]);
  const mappedSites = sites
     .filter((site) => (site.certainty === "confirmed" || site.id === "loibacher-feld" || site.id === "dobrava-memorijalni-park") && getMapLocation(site))
    .map((site) => ({ ...site, mapLocation: getMapLocation(site) }));
  const searchMatches = mapQuery.trim().length < 2 ? [] : sites.filter((site) => [site.name, site.area, site.period, site.detail, getMapLocation(site)?.label].filter(Boolean).join(" ").toLocaleLowerCase("hr").includes(mapQuery.trim().toLocaleLowerCase("hr"))).slice(0, 8);

  useEffect(() => {
    const query = mapQuery.trim();
    if (query.length < 3) {
      setPlaceMatches([]);
      return undefined;
    }
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch("https://photon.komoot.io/api/?q=" + encodeURIComponent(query) + "&limit=5&lang=hr", {
          signal: controller.signal,
          headers: { Accept: "application/json" },
        });
        if (!response.ok) throw new Error("Pretraga mjesta nije dostupna.");
        const payload = await response.json();
        if (controller.signal.aborted) return;
        setPlaceMatches((payload.features || []).map((feature, index) => {
          const properties = feature.properties || {};
          const [lng, lat] = feature.geometry?.coordinates || [];
          return {
            id: "map-place-" + index + "-" + String(properties.osm_id || properties.name || query),
            name: properties.name || query,
            area: [properties.city, properties.county, properties.country].filter(Boolean).join(", ") || properties.name || query,
            lat: Number(lat),
            lng: Number(lng),
            label: [properties.name, properties.city, properties.county, properties.country].filter(Boolean).join(", "),
          };
        }).filter((place) => Number.isFinite(place.lat) && Number.isFinite(place.lng)));
      } catch (error) {
        if (!controller.signal.aborted) setPlaceMatches([]);
      }
    }, 450);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [mapQuery]);

  function focusSite(siteId) {
    const entry = markersRef.current.find((item) => item.siteId === siteId);
    const site = mappedSites.find((item) => item.id === siteId);
    const map = mapRef.current;
    if (!entry || !site || !map) return;
    if (searchMarkerRef.current) {
      searchMarkerRef.current.remove();
      searchMarkerRef.current = null;
    }
    map.flyTo({ center: [site.mapLocation.lng, site.mapLocation.lat], zoom: Math.max(map.getZoom(), 11), essential: true, duration: 700 });
    window.setTimeout(() => { if (entry.marker && !entry.marker.getPopup()?.isOpen()) entry.marker.togglePopup(); }, 750);
  }

  async function focusSearchSite(site) {
    if (site.certainty === "confirmed" && getMapLocation(site)) {
      focusSite(site.id);
      return;
    }
    const map = mapRef.current;
    const maplibregl = maplibreRef.current;
    if (!map || !maplibregl) return;
    const queries = [site.name + ", " + site.area, site.area].filter(Boolean);
    for (const query of queries) {
      try {
        const response = await fetch("https://photon.komoot.io/api/?q=" + encodeURIComponent(query) + "&limit=1&lang=hr", { headers: { Accept: "application/json" } });
        if (!response.ok) continue;
        const payload = await response.json();
        const feature = payload.features?.[0];
        const coords = feature?.geometry?.coordinates;
        if (!Array.isArray(coords) || !Number.isFinite(Number(coords[0])) || !Number.isFinite(Number(coords[1]))) continue;
        const properties = feature.properties || {};
        focusPlace({
          name: properties.name || site.name,
          area: [properties.city, properties.county, properties.country].filter(Boolean).join(", ") || site.area,
          label: (properties.name || site.name) + " — približna lokacija zapisa: " + site.area,
          lng: Number(coords[0]),
          lat: Number(coords[1]),
        });
        return;
      } catch {
        // Pokušaj sljedeći naziv; ne izmišljaj koordinate ako geokoder nije dostupan.
      }
    }
    const card = document.getElementById("hp-site-" + site.id);
    if (card) card.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function focusPlace(place) {
    const map = mapRef.current;
    const maplibregl = maplibreRef.current;
    if (!map || !maplibregl || !Number.isFinite(place.lat) || !Number.isFinite(place.lng)) return;
    if (searchMarkerRef.current) searchMarkerRef.current.remove();
    map.flyTo({ center: [place.lng, place.lat], zoom: 12, essential: true, duration: 800 });
    const popup = new maplibregl.Popup({ offset: 18, maxWidth: "300px" })
      .setText((place.label || place.name) + " — geografska lokacija, ne potvrda grobnice.");
    searchMarkerRef.current = new maplibregl.Marker({ color: "#dc2626" })
      .setLngLat([place.lng, place.lat])
      .setPopup(popup)
      .addTo(map);
    searchMarkerRef.current.togglePopup();
  }

  useEffect(() => {
    let cancelled = false;
    let mapInstance;
    let focusMarker;

    async function loadMap() {
      try {
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
        maplibreRef.current = maplibregl;
        mapInstance.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");

        mappedSites.forEach((site) => {
          const markerElement = document.createElement("button");
          markerElement.type = "button";
          markerElement.className = site.id === "loibacher-feld"
            ? "hp-grave-map-marker hp-grave-map-marker-context"
            : site.mapLocation.approximate
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
          const detail = document.createElement("p");
          detail.textContent = site.detail || "Detaljan povijesni opis nije zasebno naveden u ovom zapisu.";
          const attribution = document.createElement("p");
          attribution.textContent = site.victimAttribution || "Pripadnost žrtava navodi se samo u opsegu potvrde iz izvora.";
          const precision = document.createElement("small");
          precision.textContent = (site.publicLocation || site.mapLocation.label || site.name) + " — " + (site.mapLocation.precision || (site.mapLocation.approximate ? "Približna lokacija — nije potvrđena točna točka grobnice" : "Koordinate preuzete iz evidencijskog zapisa"));
          const actions = document.createElement("div");
          actions.className = "hp-grave-map-popup-actions";
          const recordLink = document.createElement("button");
          recordLink.type = "button";
          recordLink.textContent = "Otvori evidencijski zapis";
          recordLink.addEventListener("click", () => {
            window.dispatchEvent(new CustomEvent("hp-open-site-record", { detail: { siteId: site.id } }));
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
          popupContent.append(heading, area, status, detail, attribution, precision, actions);
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

        mapInstance.on("load", () => {
          if (!cancelled) setMapError(false);
        });
        mapInstance.on("error", (event) => {
          // Tile-level 404/temporary network errors must not hide a usable map.
          // Show the fallback message only if the map itself failed to initialize.
          if (!cancelled && !mapInstance.isStyleLoaded()) setMapError(true);
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
      maplibreRef.current = null;
      if (searchMarkerRef.current) {
        searchMarkerRef.current.remove();
        searchMarkerRef.current = null;
      }
    };
  }, [sites]);

  return (
    <section className="hp-grave-map-section" aria-labelledby="hp-grave-map-title">
      <div className="hp-grave-map-heading">
        <div><span className="hp-section-kicker">GEOGRAFSKI PREGLED</span><h2 id="hp-grave-map-title">Grobnice na <em>karti</em></h2></div>
        <p>Odaberi oznaku za pregled zapisa, broja pronađenih ostataka i izvora lokacije. Pune oznake su provjerene koordinate grobnica; isprekidane su približne lokacije naselja ili područja.</p>
      </div>
      <div className="hp-grave-map-search">
        <label htmlFor="hp-grave-map-search-input">Pronađi mjesto na karti</label>
        <input id="hp-grave-map-search-input" type="search" value={mapQuery} onChange={(event) => setMapQuery(event.target.value)} placeholder="Upiši npr. Baćin, Sotin, Ovčara, Vukovar…" autoComplete="off" />
        {mapQuery.trim().length >= 2 && <div className="hp-grave-map-search-results" role="listbox" aria-label="Rezultati pretrage karte">
          {searchMatches.map((site) => <button type="button" key={"site-" + site.id} role="option" onClick={() => {
            void focusSearchSite(site);
          }}><span>{site.name}</span><small>{site.area} · {getMapLocation(site) ? (site.certainty === "confirmed" ? "zapis na karti" : "istraživački zapis — nije potvrđen") : "nema provjerene lokacije na karti"}</small></button>)}
          {placeMatches.map((place) => <button type="button" key={place.id} role="option" onClick={() => focusPlace(place)}><span>{place.name}</span><small>{place.area} · pronađi mjesto na karti</small></button>)}
          {!searchMatches.length && !placeMatches.length && <p>Tražim mjesta na karti… Ako se ništa ne pojavi, pokušaj precizniji naziv.</p>}
        </div>}
      </div>
      <div className="hp-grave-map-shell">
        <div ref={containerRef} className="hp-grave-map-canvas" aria-label="Interaktivna karta masovnih grobnica hrvatskih žrtava" />
        {mapError && <div className="hp-grave-map-error" role="status">Karta se trenutačno ne može učitati. Evidencijski zapisi i njihove izvorne poveznice ostaju dostupni ispod.</div>}
        <div className="hp-grave-map-caption"><span /> KARTA TEMELJENA NA PODACIMA OPENSTREETMAPA <small>© OpenStreetMap contributors</small></div>
      </div>
      <p className="hp-grave-map-note"><strong>{mappedSites.length}</strong> {mappedSites.length === 1 ? "lokacija" : "lokacije"} prikazane su na karti. Puna oznaka znači da je potvrđena javna koordinata grobnice. Isprekidana oznaka pokazuje približno naselje ili šire područje, a ne točku iskopa. Više zapisa na istom području može dijeliti približnu oznaku; to nije dokaz da je riječ o istoj grobnici.</p>
    </section>
  );
}
