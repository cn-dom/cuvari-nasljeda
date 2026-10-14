(() => {
  const byId = (id) => document.getElementById(id);
  const picker = byId("date-picker");
  const status = byId("today-status");
  const grid = byId("events-grid");
  const featured = byId("featured-event");
  const featuredContent = byId("featured-event-content");
  const empty = byId("events-empty");
  const dateLabel = byId("today-date");
  const today = new Date();
  let requestNumber = 0;
  const pad = (value) => String(value).padStart(2, "0");
  const dateKey = (date) => `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}`;
  const formatDate = (date) => new Intl.DateTimeFormat("hr-HR", {weekday:"long", day:"numeric", month:"long", year:"numeric"}).format(date);
  const safeDate = (value) => { const parts = value.split("-").map(Number); return new Date(parts[0], parts[1]-1, parts[2], 12); };
  const titleFor = (item) => (item.pages?.[0]?.title || item.text || "Povijesni događaj").replaceAll("_"," ");
  const descriptionFor = (item) => {
    const text = String(item.text || "").trim();
    const title = String(item.pages?.[0]?.title || "").replaceAll("_"," ");
    return text && text.toLocaleLowerCase("hr-HR") !== title.toLocaleLowerCase("hr-HR") ? text : (item.pages?.[0]?.extract || "Opis događaja nije dostupan na hrvatskoj Wikipediji.");
  };
  const sourceFor = (item) => item.pages?.[0]?.content_urls?.desktop?.page || (item.pages?.[0]?.title ? "https://hr.wikipedia.org/wiki/" + encodeURIComponent(item.pages[0].title.replaceAll(" ","_")) : "");
  const makeCard = (item, index, large = false) => {
    const article = document.createElement(large ? "div" : "article");
    article.className = large ? "" : "ps-event-card";
    const year = document.createElement("span"); year.className = "ps-event-year"; year.textContent = Number.isFinite(Number(item.year)) ? String(item.year) : "POVIJEST";
    const title = document.createElement("h3"); title.className = "ps-event-title"; title.textContent = titleFor(item);
    const description = document.createElement("p"); description.className = "ps-event-description"; description.textContent = descriptionFor(item);
    article.append(year,title,description);
    const href = sourceFor(item);
    if (href) { const link = document.createElement("a"); link.className = "ps-event-source"; link.href = href; link.target = "_blank"; link.rel = "noopener noreferrer"; link.textContent = "Pročitaj izvor ↗"; article.append(link); }
    return article;
  };
  async function loadEvents(date) {
    const currentRequest = ++requestNumber;
    const month = date.getMonth()+1, day = date.getDate();
    dateLabel.textContent = formatDate(date);
    status.dataset.state = "loading"; status.textContent = "Dohvaćaju se povijesni događaji s hrvatske Wikipedije…";
    grid.replaceChildren(); featuredContent.replaceChildren(); featured.hidden = true; empty.hidden = true;
    try {
      // Koristi središnji Wikimedia Feed API umjesto zastarjele adrese na domeni pojedine Wikipedije.
      const url = `https://api.wikimedia.org/feed/v1/wikipedia/hr/onthisday/events/${pad(month)}/${pad(day)}`;
      const response = await fetch(url, {headers:{"Accept":"application/json"}, cache:"no-store"});
      if (!response.ok) throw new Error("Hrvatski izvor trenutačno nije dostupan.");
      const data = await response.json();
      if (currentRequest !== requestNumber) return;
      const events = (data?.events || []).filter(item => item && item.text && Number.isFinite(Number(item.year))).sort((a,b)=>Number(b.year)-Number(a.year));
      if (!events.length) {
        status.dataset.state = "error";
        status.textContent = "Hrvatska Wikipedija trenutačno nema dostupnih događaja za ovaj datum. Engleski sadržaj ne prikazujemo.";
        empty.hidden = false;
        return;
      }
      status.dataset.state = "success";
      status.textContent = `Pronađeno je ${events.length} događaja za ${pad(day)}.${pad(month)}. kroz povijest. Prikazujemo najviše 25 zapisa.`;
      featuredContent.append(makeCard(events[0],0,true)); featured.hidden = false;
      events.slice(1,25).forEach((item,index)=>grid.append(makeCard(item,index+1,false)));
    } catch (error) {
      if (currentRequest !== requestNumber) return;
      status.dataset.state = "error";
      status.textContent = "Povijesne događaje s hrvatske Wikipedije trenutačno nije moguće dohvatiti. Provjeri internetsku vezu ili pokušaj ponovno malo kasnije.";
      // Ne prikazuj istodobno poruku o praznim rezultatima i poruku o pogrešci veze.
      empty.hidden = true;
    }
  }
  picker.max = dateKey(today); picker.value = dateKey(today);
  const selectedDate = () => safeDate(picker.value || dateKey(today));
  picker.addEventListener("change",()=>{ if (picker.value) loadEvents(selectedDate()); });
  byId("date-prev").addEventListener("click",()=>{const d=selectedDate();d.setDate(d.getDate()-1);picker.value=dateKey(d);loadEvents(d);});
  byId("date-next").addEventListener("click",()=>{const d=selectedDate();d.setDate(d.getDate()+1);picker.value=dateKey(d);loadEvents(d);});
  byId("date-today").addEventListener("click",()=>{picker.value=dateKey(today);loadEvents(new Date(today));});
  byId("share-button").addEventListener("click",async()=>{const url=new URL(window.location.href);url.searchParams.set("datum",picker.value);try{if(navigator.share){await navigator.share({title:"Na današnji dan · PatriaSoul",text:"Povijesni događaji za "+formatDate(selectedDate()),url:url.href});}else{await navigator.clipboard.writeText(url.href);byId("share-status").textContent="Poveznica je kopirana.";}}catch(error){if(error?.name!=="AbortError")byId("share-status").textContent="Dijeljenje nije uspjelo. Pokušaj kopirati poveznicu."; }});
  byId("copy-button").addEventListener("click",async()=>{const url=new URL(window.location.href);url.searchParams.set("datum",picker.value);try{await navigator.clipboard.writeText(url.href);byId("share-status").textContent="Poveznica je kopirana."; }catch{byId("share-status").textContent="Preglednik nije dopustio kopiranje. Kopiraj adresu iz adresne trake."; }});
  const queryDate = new URLSearchParams(window.location.search).get("datum");
  if (queryDate && /^\d{4}-\d{2}-\d{2}$/.test(queryDate) && !Number.isNaN(safeDate(queryDate).getTime())) { picker.value=queryDate; loadEvents(safeDate(queryDate)); } else loadEvents(new Date(today));
})();