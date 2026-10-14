(() => {
  const byId = (id) => document.getElementById(id);
  const picker = byId("date-picker");
  const status = byId("today-status");
  const grid = byId("events-grid");
  const featured = byId("featured-event");
  const featuredContent = byId("featured-event-content");
  const empty = byId("events-empty");
  const warGrid = byId("war-events-grid");
  const warEmpty = byId("war-events-empty");
  const dateLabel = byId("today-date");
  const today = new Date();
  let requestNumber = 0;
  const pad = (value) => String(value).padStart(2, "0");
  const dateKey = (date) => `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}`;
  const formatDate = (date) => new Intl.DateTimeFormat("hr-HR", {weekday:"long", day:"numeric", month:"long", year:"numeric"}).format(date);
  const safeDate = (value) => {
    const parts = value.split("-").map(Number);
    const date = new Date(parts[0], parts[1]-1, parts[2], 12);
    return date.getFullYear() === parts[0] && date.getMonth() === parts[1]-1 && date.getDate() === parts[2] ? date : new Date(NaN);
  };
  const monthNames = ["siječnja","veljače","ožujka","travnja","svibnja","lipnja","srpnja","kolovoza","rujna","listopada","studenoga","prosinca"];
  const datePageTitle = (date) => `${date.getDate()}. ${monthNames[date.getMonth()]}`;
  const titleFor = (item) => item.title || item.text || "Povijesni zapis";
  const descriptionFor = (item) => item.description || item.text || "Dodatni opis nije naveden na hrvatskoj Wikipediji.";
  const sourceFor = (item) => item.source || item.daySource || "";
  const categoryLabel = (category) => ({
    events: "DOGAĐAJ",
    births: "ROĐEN",
    deaths: "PREMINUO",
    holidays: "BLAGDAN I SPOMENDAN"
  })[category] || "POVIJEST";

  const makeCard = (item, index, large = false) => {
    const article = document.createElement(large ? "div" : "article");
    article.className = large ? "" : "ps-event-card";
    const year = document.createElement("span");
    year.className = "ps-event-year";
    year.textContent = item.year ? item.category === "births" ? `ROĐEN ${item.year}.` : item.category === "deaths" ? `PREMINUO ${item.year}.` : `${categoryLabel(item.category)} · ${item.year}.` : categoryLabel(item.category);
    const title = document.createElement("h3");
    title.className = "ps-event-title";
    title.textContent = titleFor(item);
    const description = document.createElement("p");
    description.className = "ps-event-description";
    description.textContent = descriptionFor(item);
    article.append(year, title, description);
    const href = sourceFor(item);
    if (href) {
      const link = document.createElement("a");
      link.className = "ps-event-source";
      link.href = href;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = "Pročitaj izvor ↗";
      article.append(link);
    }
    return article;
  };

  function eventsFromWikipediaHtml(html, daySource) {
    const parsed = new DOMParser().parseFromString(html, "text/html");
    const sectionDefinitions = [
      {key:"events", labels:["događaji", "događaj"]},
      {key:"births", labels:["rođeni", "rođen"]},
      {key:"deaths", labels:["preminuli", "umrli", "preminuo", "umro"]},
      {key:"holidays", labels:["blagdani i spomendani", "blagdani", "spomendani"]}
    ];
    const headings = [...parsed.querySelectorAll("h2, h3, .mw-heading2, .mw-heading3")];
    const collected = [];
    const seen = new Set();

    for (const heading of headings) {
      const label = (heading.querySelector(".mw-headline")?.textContent || heading.textContent || "")
        .trim().replace(/\[uredi\s*\]/i, "").toLocaleLowerCase("hr-HR");
      const section = sectionDefinitions.find((definition) =>
        definition.labels.some((candidate) => label === candidate || label.startsWith(candidate + " "))
      );
      if (!section) continue;

      const level = /^H3$/.test(heading.tagName) || heading.classList.contains("mw-heading3") ? 3 : 2;
      const nodes = [];
      let sibling = heading.classList.contains("mw-heading2") || heading.classList.contains("mw-heading3")
        ? heading.nextElementSibling
        : heading.parentElement?.nextElementSibling || heading.nextElementSibling;
      while (sibling) {
        if (/^H[1-6]$/.test(sibling.tagName) && Number(sibling.tagName.slice(1)) <= level) break;
        if (sibling.matches?.(".mw-heading1, .mw-heading2") && level <= 2) break;
        if (sibling.matches?.(".mw-heading3") && level <= 3) break;
        nodes.push(sibling);
        sibling = sibling.nextElementSibling;
      }

      const candidates = nodes.flatMap((node) => {
        if (node.matches?.("li, tr")) return [node];
        return [...node.querySelectorAll("li, tr")];
      });
      for (const node of candidates) {
        const rawText = (node.innerText || node.textContent || "").replace(/\s+/g, " ").trim();
        if (!rawText || rawText.length < 2 || seen.has(section.key + "|" + rawText)) continue;
        if (/^(uredi|edit)$/i.test(rawText)) continue;
        seen.add(section.key + "|" + rawText);

        const yearMatch = rawText.match(/^\s*(\d{1,4})\s*\.?\s*(?:godine\s*)?[—–-]\s*(.+)$/u)
          || rawText.match(/^\s*(\d{1,4})\s*\.\s*(.+)$/u);
        let year = yearMatch ? Number(yearMatch[1]) : null;
        if (year && (year < 1 || year > 3000)) year = null;

        const anchors = [...node.querySelectorAll('a[href^="/wiki/"]')].filter((anchor) => {
          const label = (anchor.textContent || "").trim();
          return label && !/^\[?\d+\]?$/.test(label) && !/^(uredi|edit)$/i.test(label);
        });
        const firstAnchor = anchors[0];
        const afterYear = yearMatch ? yearMatch[2].trim() : rawText;
        const title = firstAnchor?.textContent?.trim() || afterYear;
        const href = firstAnchor?.getAttribute("href");
        const source = href ? new URL(href, "https://hr.wikipedia.org").href : daySource;

        let description = afterYear;
        if (firstAnchor && description.startsWith(firstAnchor.textContent.trim())) {
          description = description.slice(firstAnchor.textContent.trim().length).replace(/^\s*[-–—,:;.]?\s*/, "").trim();
        }
        description = description.replace(/\s*\[[0-9]+\]\s*/g, "").replace(/\s+/g, " ").trim();
        if (description === title || !description) description = "Na hrvatskoj Wikipediji nije naveden dodatni opis.";

        collected.push({category:section.key, year, title, description, text:description, source, daySource});
      }
    }
    return collected.sort((a, b) => {
      const order = {events:0, births:1, deaths:2, holidays:3};
      return order[a.category] - order[b.category] || (b.year || 0) - (a.year || 0);
    });
  }

  async function loadEvents(date) {
    const currentRequest = ++requestNumber;
    const day = date.getDate();
    dateLabel.textContent = formatDate(date);
    status.dataset.state = "loading";
    status.textContent = "Dohvaćaju se povijesni događaji s hrvatske Wikipedije…";
    grid.replaceChildren();
    featuredContent.replaceChildren();
    featured.hidden = true;
    empty.hidden = true;

    try {
      // Čitamo hrvatsku stranicu datuma i izdvajamo Događaje, Rođene, Preminule/Umrle te Blagdane i spomendane.
      const pageTitle = datePageTitle(date);
      let html = "";
      let apiError = null;
      try {
        const api = new URL("https://hr.wikipedia.org/w/api.php");
        api.search = new URLSearchParams({
          action: "parse",
          page: pageTitle,
          prop: "text",
          format: "json",
          origin: "*"
        }).toString();
        const response = await fetch(api.href, {
          headers: {"Accept":"application/json"},
          cache: "no-store"
        });
        if (!response.ok) throw new Error("MediaWiki API nije dostupan.");
        const data = await response.json();
        if (data?.error || !data?.parse?.text) throw new Error("MediaWiki API nije vratio stranicu.");
        html = typeof data.parse.text === "string" ? data.parse.text : data.parse.text["*"];
      } catch (error) {
        apiError = error;
      }
      if (currentRequest !== requestNumber) return;

      // Rezervni izvor: HTML prikaz iste hrvatske Wikipedije, ako API ne odgovara.
      if (!html) {
        const titlePath = encodeURIComponent(pageTitle.replaceAll(" ", "_"));
        const fallback = await fetch("https://hr.wikipedia.org/api/rest_v1/page/html/" + titlePath, {
          headers: {"Accept":"text/html"},
          cache: "no-store"
        });
        if (!fallback.ok) throw apiError || new Error("Hrvatska Wikipedija trenutačno nije dostupna.");
        html = await fallback.text();
      }
      if (currentRequest !== requestNumber) return;

      const daySource = "https://hr.wikipedia.org/wiki/" + encodeURIComponent(pageTitle.replaceAll(" ", "_"));
      const events = eventsFromWikipediaHtml(html || "", daySource).slice(0, 60);
      if (!events.length) {
        status.dataset.state = "empty";
        status.textContent = `Na hrvatskoj Wikipediji nisu pronađeni zapisi za ${pad(day)}. ${monthNames[date.getMonth()]}. Engleski sadržaj ne prikazujemo.`;
        empty.hidden = false;
        return;
      }
      // Izdvoji samo zapise koji su za datum iz hrvatske Wikipedije i
      // koji sadrže jasne pojmove povezane s Domovinskim ratom. Ovo nije zamjena
      // za stručnu kronologiju; uz izostanak podudaranja nudimo pouzdane izvore.
      const warTerms = /\b(domovinsk\w*\s+rat|hrvatsk\w*\s+vojska|\bHV\b|\bZNG\b|\bJNA\b|srpsk\w*\s+snag|okupacij\w*|Vukovar|Škabrnja|Borovo Selo|Dubrovnik|Vinkovci|Osijek|Gospić|Pakrac|Maslenic\w*|Medačk\w*|Bljesak|Oluja|Zadar|Šibenik|Knin|Vukovarsk\w*)\b/i;
      const warEvents = events.filter((item) =>
        item.category === "events" &&
        Number(item.year) >= 1990 && Number(item.year) <= 1998 &&
        warTerms.test([item.title, item.description, item.text].filter(Boolean).join(" "))
      );
      if (warGrid && warEmpty) {
        warGrid.replaceChildren();
        warEvents.forEach((item, index) => warGrid.append(makeCard(item, index, false)));
        warEmpty.hidden = warEvents.length > 0;
      }

      const counts = events.reduce((result, item) => {
        result[item.category] = (result[item.category] || 0) + 1;
        return result;
      }, {});
      const summary = [
        counts.events ? `${counts.events} događaja` : "",
        counts.births ? `${counts.births} rođenih` : "",
        counts.deaths ? `${counts.deaths} preminulih` : "",
        counts.holidays ? `${counts.holidays} blagdana i spomendana` : ""
      ].filter(Boolean).join(", ");
      status.dataset.state = "success";
      status.textContent = `Za ${pad(day)}. ${monthNames[date.getMonth()]} pronađeno: ${summary}.`;
      featuredContent.append(makeCard(events[0], 0, true));
      featured.hidden = false;
      events.slice(1).forEach((item, index) => grid.append(makeCard(item, index + 1, false)));
    } catch (error) {
      if (currentRequest !== requestNumber) return;
      status.dataset.state = "error";
      status.textContent = "Povijesne događaje s hrvatske Wikipedije trenutačno nije moguće dohvatiti. Provjeri internetsku vezu ili pokušaj ponovno malo kasnije.";
      empty.hidden = true;
    }
  }

  picker.max = dateKey(today);
  picker.value = dateKey(today);
  const selectedDate = () => safeDate(picker.value || dateKey(today));
  picker.addEventListener("change", () => { if (picker.value) loadEvents(selectedDate()); });
  byId("date-prev").addEventListener("click", () => {
    const date = selectedDate();
    date.setDate(date.getDate() - 1);
    picker.value = dateKey(date);
    loadEvents(date);
  });
  byId("date-next").addEventListener("click", () => {
    const date = selectedDate();
    date.setDate(date.getDate() + 1);
    if (date > today) return;
    picker.value = dateKey(date);
    loadEvents(date);
  });
  byId("date-today").addEventListener("click", () => {
    picker.value = dateKey(today);
    loadEvents(new Date(today));
  });
  byId("share-button").addEventListener("click", async () => {
    const url = new URL(window.location.href);
    url.searchParams.set("datum", picker.value);
    try {
      if (navigator.share) {
        await navigator.share({title:"Na današnji dan · PatriaSoul", text:"Povijesni događaji za " + formatDate(selectedDate()), url:url.href});
      } else {
        await navigator.clipboard.writeText(url.href);
        byId("share-status").textContent = "Poveznica je kopirana.";
      }
    } catch (error) {
      if (error?.name !== "AbortError") byId("share-status").textContent = "Dijeljenje nije uspjelo. Pokušaj kopirati poveznicu.";
    }
  });
  byId("copy-button").addEventListener("click", async () => {
    const url = new URL(window.location.href);
    url.searchParams.set("datum", picker.value);
    try {
      await navigator.clipboard.writeText(url.href);
      byId("share-status").textContent = "Poveznica je kopirana.";
    } catch {
      byId("share-status").textContent = "Preglednik nije dopustio kopiranje. Kopiraj adresu iz adresne trake.";
    }
  });
  const queryDate = new URLSearchParams(window.location.search).get("datum");
  if (queryDate && /^\d{4}-\d{2}-\d{2}$/.test(queryDate) && !Number.isNaN(safeDate(queryDate).getTime())) {
    picker.value = queryDate;
    loadEvents(safeDate(queryDate));
  } else {
    loadEvents(new Date(today));
  }
})();