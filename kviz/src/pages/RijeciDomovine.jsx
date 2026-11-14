import { useMemo, useState } from "react";

const WORDS = [
  { word: "HRVATSKA", category: "Domovina", level: 1, clue: "Država između Jadrana i srednje Europe.", explanation: "Hrvatska je europska država čiji je glavni grad Zagreb." },
  { word: "VUKOVAR", category: "Domovina", level: 1, clue: "Grad na Dunavu, simbol stradanja i otpora 1991. godine.", explanation: "Vukovar je grad na istoku Hrvatske, posebno važan u sjećanju na Domovinski rat." },
  { word: "KNIN", category: "Domovina", level: 1, clue: "Povijesni kraljevski grad podno Dinare.", explanation: "Knin je povijesni grad u Dalmatinskoj zagori." },
  { word: "ZAGREB", category: "Domovina", level: 1, clue: "Glavni i najveći grad Republike Hrvatske.", explanation: "Zagreb je političko, kulturno, gospodarsko i obrazovno središte Hrvatske." },
  { word: "MOLITVA", category: "Vjera", level: 1, clue: "Obraćanje Bogu riječima, mislima ili u tišini.", explanation: "U kršćanstvu molitva može biti zahvala, prošnja, slavljenje ili razmatranje." },
  { word: "ISUS", category: "Vjera", level: 1, clue: "Središnja osoba kršćanske vjere.", explanation: "Kršćani vjeruju da je Isus Krist Sin Božji i Spasitelj." },
  { word: "BIBLIJA", category: "Vjera", level: 1, clue: "Sveto pismo kršćana, sastavljeno od Staroga i Novoga zavjeta.", explanation: "Biblija je zbirka svetih knjiga koje čine temelj kršćanske vjere." },
  { word: "USKRS", category: "Vjera", level: 1, clue: "Najveći kršćanski blagdan kojim se slavi Kristovo uskrsnuće.", explanation: "Uskrs je središnji blagdan kršćanske vjere." },
  { word: "KRUNICA", category: "Vjera", level: 2, clue: "Katolička pobožnost koja razmatra otajstva Isusova i Marijina života.", explanation: "Krunica uključuje niz molitava i razmatranje otajstava." },
  { word: "MILOSRĐE", category: "Vjera", level: 2, clue: "Suosjećanje i djelatna ljubav prema čovjeku u nevolji.", explanation: "Kršćansko milosrđe poziva na konkretnu pomoć, praštanje i brigu za bližnjega." },
  { word: "GLAGOLJICA", category: "Baština", level: 2, clue: "Staro slavensko pismo s važnom hrvatskom tradicijom.", explanation: "Hrvatska glagoljaška tradicija važna je za hrvatsku pismenost, književnost i liturgiju." },
  { word: "PLETER", category: "Baština", level: 2, clue: "Ukrasni motiv isprepletenih traka na starim kamenim spomenicima.", explanation: "Pleterni ukrasi česti su na ranosrednjovjekovnim kamenim spomenicima." },
  { word: "LICITAR", category: "Baština", level: 2, clue: "Šareno ukrašeni tradicijski predmet od tijesta, često u obliku srca.", explanation: "Licitarsko umijeće povezano je sa sjevernom Hrvatskom i UNESCO-ovom nematerijalnom baštinom." },
  { word: "KLAPA", category: "Baština", level: 2, clue: "Skupina pjevača koja njeguje tradicionalno višeglasno pjevanje.", explanation: "Klapsko pjevanje posebno je povezano s Dalmacijom i UNESCO-ovom nematerijalnom baštinom." },
  { word: "OLUJA", category: "Povijest", level: 2, clue: "Vojno-redarstvena operacija provedena u kolovozu 1995. godine.", explanation: "Operacija Oluja bila je ključna operacija u završnoj fazi Domovinskog rata. O njezinim posljedicama važno je govoriti uz provjerene izvore i poštovanje prema svim žrtvama." },
  { word: "SINJSKA ALKA", category: "Baština", level: 3, clue: "Viteško natjecanje u Sinju koje čuva sjećanje na događaj iz 1715. godine.", explanation: "Sinjska alka tradicijska je viteška igra i nematerijalna kulturna baština Hrvatske." },
  { word: "BAŠĆANSKA PLOČA", category: "Baština", level: 3, clue: "Jedan od najvažnijih hrvatskih glagoljskih kamenih spomenika.", explanation: "Pronađena je u crkvi svete Lucije u Jurandvoru na Krku i važan je izvor za hrvatski jezik i povijest." },
  { word: "DOMOVINSKI RAT", category: "Povijest", level: 3, clue: "Rat za obranu neovisnosti i teritorijalne cjelovitosti Hrvatske 1991.–1995.", explanation: "Domovinski rat temeljno je razdoblje suvremene hrvatske povijesti. Sjećanje na poginule, nestale i preživjele zahtijeva dostojanstvo i povijesnu točnost." },
  { word: "DUBROVNIK", category: "Domovina", level: 3, clue: "Povijesni grad na jugu Hrvatske, nekoć središte Dubrovačke Republike.", explanation: "Dubrovačka Republika razvila je snažnu pomorsku, trgovačku i diplomatsku tradiciju." },
  { word: "TAMBURICA", category: "Baština", level: 3, clue: "Žičano glazbalo snažno povezano s tradicijskom glazbom Slavonije.", explanation: "Tamburaška glazba važan je dio glazbene tradicije Slavonije i drugih hrvatskih krajeva." },
  { word: "DOMOVINA", category: "Domovina", level: 3, clue: "Zemlja kojoj pripadamo i s kojom nas povezuju povijest, ljudi i odgovornost.", explanation: "Domoljublje se pokazuje znanjem, brigom za zajednicu i čuvanjem kulturne baštine." },,
  { word: "OSIJEK", category: "Domovina", level: 1, clue: "Najveći grad Slavonije, smješten uz Dravu.", explanation: "Osijek je važno regionalno, kulturno i gospodarsko središte istočne Hrvatske." },
  { word: "PULA", category: "Domovina", level: 1, clue: "Istarski grad poznat po rimskom amfiteatru.", explanation: "Pulska Arena jedan je od najbolje očuvanih rimskih amfiteatara." },
  { word: "RIJEKA", category: "Domovina", level: 1, clue: "Veliki kvarnerski grad s važnom morskom lukom.", explanation: "Rijeka je važno prometno, lučko i kulturno središte." },
  { word: "ZADAR", category: "Domovina", level: 1, clue: "Dalmatinski grad poznat po Morskim orguljama.", explanation: "Zadar ima bogatu antičku i srednjovjekovnu baštinu." },
  { word: "PAG", category: "Domovina", level: 1, clue: "Otok poznat po čipki i proizvodnji soli.", explanation: "Paška čipka zaštićena je kao nematerijalna kulturna baština." },
  { word: "HVAR", category: "Domovina", level: 1, clue: "Dalmatinski otok poznat po lavandi.", explanation: "Hvar je poznat po Starogradskom polju, povijesnim naseljima i mediteranskom krajoliku." },
  { word: "VELEBIT", category: "Domovina", level: 1, clue: "Najduža hrvatska planina.", explanation: "Velebit je zaštićen kao park prirode, a njegovi dijelovi obuhvaćaju nacionalne parkove." },
  { word: "SAVA", category: "Domovina", level: 1, clue: "Rijeka koja protječe kroz Zagreb.", explanation: "Sava je jedna od najvećih rijeka koje protječu Hrvatskom." },
  { word: "DRAVA", category: "Domovina", level: 1, clue: "Rijeka uz koju leže Varaždin i Osijek.", explanation: "Drava je važan dio riječnog i prirodnog sustava sjeverne i istočne Hrvatske." },
  { word: "MASLINA", category: "Baština", level: 1, clue: "Mediteransko stablo čiji se plod koristi za ulje.", explanation: "Maslinarstvo je važan dio tradicije i gospodarstva hrvatskog priobalja i otoka." },
  { word: "ČIPKA", category: "Baština", level: 2, clue: "Ručno izrađen tekstilni ukras poznat u Pagu, Lepoglavi i na Hvaru.", explanation: "Hrvatska tradicija čipkarstva upisana je na UNESCO-ov popis nematerijalne baštine." },
  { word: "MOREŠKA", category: "Baština", level: 2, clue: "Tradicionalni mačevni ples s Korčule.", explanation: "Moreška je poznata korčulanska plesna igra s mačevima." },
  { word: "KUMPANIJA", category: "Baština", level: 2, clue: "Otočna viteška igra s mačevima koja se izvodi na Korčuli.", explanation: "Kumpanija je dio lokalne tradicije pojedinih korčulanskih mjesta." },
  { word: "KARNEVAL", category: "Običaji", level: 2, clue: "Razdoblje pokladnih povorki, maski i veselja.", explanation: "Pokladni običaji u Hrvatskoj razlikuju se od kraja do kraja; riječki karneval jedan je od najpoznatijih." },
  { word: "KOPAČKI RIT", category: "Priroda", level: 2, clue: "Močvarno područje uz ušće Drave u Dunav.", explanation: "Kopački rit jedan je od najvažnijih močvarnih i ornitoloških rezervata u ovom dijelu Europe." },
  { word: "PLITVICE", category: "Priroda", level: 2, clue: "Nacionalni park poznat po jezerima i slapovima.", explanation: "Nacionalni park Plitvička jezera upisan je na UNESCO-ov popis svjetske baštine." },
  { word: "KORNATI", category: "Priroda", level: 2, clue: "Nacionalni park otočja u sjevernoj Dalmaciji.", explanation: "Kornati su poznati po razvedenoj obali, otočićima i podmorju." },
  { word: "NERETVA", category: "Priroda", level: 2, clue: "Rijeka koja oblikuje poznatu deltu u južnoj Dalmaciji.", explanation: "Dolina Neretve poznata je po močvarama, poljoprivredi i bogatom životinjskom svijetu." },
  { word: "DUBROVAČKA REPUBLIKA", category: "Povijest", level: 3, clue: "Povijesna pomorska republika sa središtem u Dubrovniku.", explanation: "Dubrovačka Republika razvila je snažnu trgovačku, pomorsku i diplomatsku tradiciju." },
  { word: "VINODOLSKI ZAKON", category: "Povijest", level: 3, clue: "Pravni spomenik sastavljen 1288. godine.", explanation: "Vinodolski zakon jedan je od najstarijih hrvatskih pravnih spomenika pisanih narodnim jezikom." },
  { word: "KRALJ TOMISLAV", category: "Povijest", level: 3, clue: "Vladar kojeg hrvatska tradicija pamti kao prvoga kralja.", explanation: "Tomislav se u hrvatskoj historiografiji povezuje s učvršćivanjem ranosrednjovjekovne hrvatske države." },
  { word: "PETAR ZRINSKI", category: "Povijest", level: 3, clue: "Hrvatski velikaš pogubljen 1671. godine.", explanation: "Petar Zrinski pogubljen je u Bečkom Novom Mjestu zajedno s Franom Krstom Frankopanom." },
  { word: "FRAN KRSTO FRANKOPAN", category: "Povijest", level: 3, clue: "Hrvatski plemić i književnik pogubljen 1671. godine.", explanation: "Frankopan je bio pjesnik i velikaš, a njegovo se ime pamti uz Petra Zrinskog." },
  { word: "NIKOLA TESLA", category: "Znanje", level: 3, clue: "Izumitelj i znanstvenik rođen u Smiljanu.", explanation: "Nikola Tesla dao je velik doprinos razvoju izmjenične električne energije i elektrotehnike." },
  { word: "RUĐER BOŠKOVIĆ", category: "Znanje", level: 3, clue: "Dubrovčanin, znanstvenik i filozof iz 18. stoljeća.", explanation: "Ruđer Bošković bavio se matematikom, astronomijom, fizikom i filozofijom." },
  { word: "FAUST VRANČIĆ", category: "Znanje", level: 3, clue: "Hrvatski izumitelj povezan s nacrtom padobrana.", explanation: "Faust Vrančić objavio je djelo Machinae Novae s prikazima tehničkih izuma." },
  { word: "MARKO MARULIĆ", category: "Kultura", level: 3, clue: "Splitski humanist kojeg se naziva ocem hrvatske književnosti.", explanation: "Marulićev Judita iz 1501. godine jedno je od ključnih djela hrvatske književnosti." },
  { word: "IVANA BRLIĆ MAŽURANIĆ", category: "Kultura", level: 3, clue: "Hrvatska književnica, autorica Priča iz davnine.", explanation: "Njezina djela ubrajaju se među najvažnija ostvarenja hrvatske dječje književnosti." },
  { word: "AUGUST ŠENOA", category: "Kultura", level: 3, clue: "Hrvatski književnik i autor romana Zlatarovo zlato.", explanation: "Šenoa je snažno obilježio hrvatski književni život 19. stoljeća." },
  { word: "ANTUN GUSTAV MATOŠ", category: "Kultura", level: 3, clue: "Hrvatski književnik, pjesnik i esejist rođen u Tovarniku.", explanation: "Matoš je jedan od najvažnijih predstavnika hrvatske moderne." },
  { word: "EUPRAZIJEVA BAZILIKA", category: "Baština", level: 3, clue: "Porečki ranokršćanski kompleks na UNESCO-ovu popisu.", explanation: "Kompleks je izniman primjer ranobizantske sakralne arhitekture i umjetnosti." },
  { word: "ŠIBENSKA KATEDRALA", category: "Baština", level: 3, clue: "Renesansna katedrala sv. Jakova, građena od kamena.", explanation: "Katedrala sv. Jakova u Šibeniku upisana je na UNESCO-ov popis svjetske baštine." },
  { word: "BAŠĆANSKA PLOČA", category: "Baština", level: 3, clue: "Glagoljski kameni spomenik iz crkve svete Lucije na Krku.", explanation: "Bašćanska ploča važan je spomenik hrvatske pismenosti i jezika." },
  { word: "HRVATSKI SABOR", category: "Zajednica", level: 2, clue: "Predstavničko tijelo građana i nositelj zakonodavne vlasti.", explanation: "Hrvatski sabor donosi zakone i obavlja druge poslove određene Ustavom." },
  { word: "ZAJEDNIŠTVO", category: "Zajednica", level: 2, clue: "Povezanost ljudi koji surađuju i pomažu jedni drugima.", explanation: "Zajedništvo se gradi povjerenjem, odgovornošću i brigom za druge." },
  { word: "ZAVIČAJ", category: "Zajednica", level: 1, clue: "Kraj iz kojeg netko potječe ili s kojim je posebno povezan.", explanation: "Zavičaj obuhvaća prostor, ljude, običaje i sjećanja koja oblikuju osjećaj pripadnosti." },
  { word: "HODOČAŠĆE", category: "Vjera", level: 2, clue: "Putovanje vjernika na sveto mjesto.", explanation: "Hodočašće je izraz vjere, molitve i duhovnog traženja." },
  { word: "EVANĐELJE", category: "Vjera", level: 2, clue: "Radosna vijest o Isusu Kristu i naziv za četiri novozavjetna spisa.", explanation: "Četiri kanonska evanđelja nalaze se na početku Novoga zavjeta." },
  { word: "BETLEHEM", category: "Vjera", level: 1, clue: "Mjesto Isusova rođenja prema evanđeoskoj predaji.", explanation: "Betlehem je grad u kojem se prema evanđeljima rodio Isus." },
  { word: "MILO SRĐE", category: "Vjera", level: 2, clue: "Suosjećanje i djelatna ljubav prema čovjeku u nevolji.", explanation: "Milosrđe u kršćanskoj tradiciji znači konkretnu brigu za bližnjega." }

];

const normalize = (value) => String(value ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleUpperCase("hr").replace(/[^A-Z]/g, "");
const pointsFor = (level) => level === 1 ? 10 : level === 2 ? 20 : 30;

function shuffle(items, seed = null) {
  const copy = [...items];
  let state = seed ?? Math.floor(Math.random() * 2147483647);
  const random = () => {
    state = (state * 48271) % 2147483647;
    return (state - 1) / 2147483646;
  };
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function scramble(word) {
  const letters = word.replace(/\s/g, "").split("");
  let mixed = shuffle(letters);
  if (mixed.join("") === letters.join("") && mixed.length > 1) mixed = [...mixed.slice(1), mixed[0]];
  return mixed.map((letter, index) => ({ id: index, letter }));
}

function dailySeed() {
  const date = new Date();
  const stamp = `${date.getFullYear()}${date.getMonth() + 1}${date.getDate()}`;
  return Number(stamp) || 1;
}

function createRound(mode) {
  const seed = mode === "daily" ? dailySeed() : null;
  let easy, medium, hard;
  if (mode === "daily") {
    easy = shuffle(WORDS.filter((item) => item.level === 1), seed).slice(0, 2);
    medium = shuffle(WORDS.filter((item) => item.level === 2), seed + 17).slice(0, 2);
    hard = shuffle(WORDS.filter((item) => item.level === 3), seed + 31).slice(0, 1);
  } else {
    let history = [];
    try { history = JSON.parse(window.localStorage.getItem("patriasoul_rijeci_word_history") || "[]"); } catch {}
    const takeFresh = (pool, count) => {
      const fresh = pool.filter((item) => !history.includes(item.word));
      const recent = new Set(history.slice(-Math.max(1, Math.floor(pool.length * 0.45))));
      const fallback = pool.filter((item) => !recent.has(item.word));
      const chosen = shuffle(fresh.length >= count ? fresh : fallback.length >= count ? fallback : pool).slice(0, count);
      history.push(...chosen.map((item) => item.word));
      return chosen;
    };
    easy = takeFresh(WORDS.filter((item) => item.level === 1), 3);
    medium = takeFresh(WORDS.filter((item) => item.level === 2), 4);
    hard = takeFresh(WORDS.filter((item) => item.level === 3), 3);
    try { window.localStorage.setItem("patriasoul_rijeci_word_history", JSON.stringify(history.slice(-WORDS.length))); } catch {}
  }
  return [...easy, ...medium, ...hard].map((item, index) => ({ ...item, letters: scramble(item.word), roundId: `${item.word}-${index}` }));
}

export default function RijeciDomovine({ onBack, playerName = "" }) {
  const [mode, setMode] = useState("solo");
  const [playerOne, setPlayerOne] = useState(playerName || "Igrač 1");
  const [playerTwo, setPlayerTwo] = useState("Igrač 2");
  const [round, setRound] = useState([]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState([]);
  const [scores, setScores] = useState([0, 0]);
  const [activePlayer, setActivePlayer] = useState(0);
  const [streak, setStreak] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [checked, setChecked] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [finished, setFinished] = useState(false);
  const [started, setStarted] = useState(false);
  const [bestScore, setBestScore] = useState(() => {
    try { return Number(window.localStorage.getItem("patriasoul_rijeci_best") || 0); } catch { return 0; }
  });

  const current = round[index];
  const total = round.length;
  const answerFromTiles = selected.map((tile) => current?.letters.find((letter) => letter.id === tile)?.letter || "").join("");
  const answer = answerFromTiles;
  const progress = total ? ((index + (checked ? 1 : 0)) / total) * 100 : 0;
  const playerNames = useMemo(() => [playerOne.trim() || "Igrač 1", playerTwo.trim() || "Igrač 2"], [playerOne, playerTwo]);
  const bestLabel = mode === "daily" ? "Najbolji dnevni rezultat" : "Osobni rekord";

  const start = () => {
    setRound(createRound(mode));
    setIndex(0);
    setSelected([]);
    setScores([0, 0]);
    setActivePlayer(0);
    setStreak(0);
    setFeedback("");
    setChecked(false);
    setRevealed(false);
    setFinished(false);
    setStarted(true);
  };

  const clearAnswer = () => { setSelected([]); setFeedback(""); };
  const chooseLetter = (id) => {
    if (checked || selected.includes(id)) return;
    setSelected((previous) => [...previous, id]);
    setFeedback("");
  };
  const removeLetter = (id) => {
    if (checked) return;
    setSelected((previous) => previous.filter((value) => value !== id));
    setFeedback("");
  };

  const checkAnswer = () => {
    if (!current || checked || !answer.trim()) return;
    const correct = normalize(answer) === normalize(current.word);
    if (correct) {
      const earned = Math.max(5, pointsFor(current.level) - (revealed ? 5 : 0) + (streak >= 2 ? 5 : 0));
      setScores((previous) => previous.map((score, player) => player === activePlayer ? score + earned : score));
      setStreak((value) => value + 1);
      setFeedback(`Točno! Osvojeno ${earned} bodova.`);
      setChecked(true);
    } else {
      setStreak(0);
      setFeedback("Nije još točno. Pokušaj ponovno ili iskoristi pomoć.");
    }
  };

  const next = () => {
    if (index + 1 >= total) {
      setFinished(true);
      setStarted(false);
      if (mode !== "duel") {
        const finalScore = scores[0];
        if (finalScore > bestScore) {
          setBestScore(finalScore);
          try { window.localStorage.setItem("patriasoul_rijeci_best", String(finalScore)); } catch {}
        }
      }
      return;
    }
    setIndex((value) => value + 1);
    setSelected([]);
    setTypedAnswer("");
    setFeedback("");
    setChecked(false);
    setRevealed(false);
    if (mode === "duel") setActivePlayer((value) => value === 0 ? 1 : 0);
  };

  const revealLetter = () => {
    if (!current || revealed || checked) return;
    setRevealed(true);
    setFeedback(`Pomoć: riječ počinje slovom ${current.word.replace(/\s/g, "")[0]}. Točan odgovor vrijedi 5 bodova manje.`);
  };

  const winner = scores[0] === scores[1] ? "Neriješeno" : scores[0] > scores[1] ? playerNames[0] : playerNames[1];
  const modeDescription = mode === "daily" ? "Isti dnevni izazov za sve igrače. Pokušaj ostvariti svoj najbolji rezultat." : mode === "duel" ? "Dva igrača izmjenjuju se u rješavanju iste serije pojmova." : "Igraj svojim tempom, otkrivaj pojmove i podiži osobni rekord.";

  return (
    <main className="rd-page mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <button onClick={onBack} className="rd-back">Natrag na kviz</button>
        <span className="rd-brand">PATRIA SOUL <span>/</span> ČUVARI NASLJEĐA</span>
      </div>

      <section className="rd-shell">
        <header className="rd-hero">
          <div className="rd-hero-glow" />
          <img src={`${import.meta.env.BASE_URL}images/Riječi domovine_ Hrvatska baština.png`} alt="Riječi domovine – Hrvatska baština" className="rd-hero-art" fetchPriority="high" decoding="async" />
          <div className="relative z-10">
            <div className="rd-kicker"><span /> IGRA ZNANJA I VJEŠTINE</div>
            <h1>Riječi <em>domovine</em></h1>
            <p>Složi slova. Otkrij značenje. Sačuvaj znanje.</p>
            <div className="rd-hero-meta"><span>HRVATSKI JEZIK</span><i /> <span>POVIJEST</span><i /> <span>VJERA</span><i /> <span>BAŠTINA</span></div>
          </div>
          <div className="rd-hero-mark" aria-hidden="true">RD</div>
        </header>

        {!started && !finished && (
          <div className="rd-content">
            <div className="rd-intro-row">
              <div><div className="rd-overline">TVOJ SLJEDEĆI IZAZOV</div><h2>Odaberi kako želiš igrati.</h2><p>Svaka runda donosi nove pojmove i sve zahtjevnije izazove.</p></div>
              <div className="rd-record"><span>{bestLabel}</span><strong>{bestScore}</strong><small>BODOVA</small></div>
            </div>

            <div className="rd-mode-grid">
              <button onClick={() => setMode("solo")} className={`rd-mode-card ${mode === "solo" ? "is-active" : ""}`}>
                <span className="rd-mode-number">01</span><span className="rd-mode-tag">BEZ VREMENSKOG PRITISKA</span><strong>Samostalno</strong><span className="rd-mode-copy">Igraj svojim tempom i izgradi osobni rekord kroz deset pojmova.</span><span className="rd-mode-link">Odabran način <b>→</b></span>
              </button>
              <button onClick={() => setMode("daily")} className={`rd-mode-card ${mode === "daily" ? "is-active" : ""}`}>
                <span className="rd-mode-number">02</span><span className="rd-mode-tag">NOVI IZAZOV SVAKI DAN</span><strong>Dnevni izazov</strong><span className="rd-mode-copy">Isti skup riječi za sve. Vrati se svaki dan i popravi rezultat.</span><span className="rd-mode-link">Odabran način <b>→</b></span>
              </button>
              <button onClick={() => setMode("duel")} className={`rd-mode-card ${mode === "duel" ? "is-active" : ""}`}>
                <span className="rd-mode-number">03</span><span className="rd-mode-tag">DVA IGRAČA · JEDAN POBJEDNIK</span><strong>Duel igrača</strong><span className="rd-mode-copy">Izazovi prijatelja na istom uređaju i osvojite naslov boljeg znalca.</span><span className="rd-mode-link">Odabran način <b>→</b></span>
              </button>
            </div>

            {mode === "duel" && <div className="rd-player-fields">
              <label>PRVI IGRAČ<input value={playerOne} onChange={(event) => setPlayerOne(event.target.value)} maxLength={24} /></label>
              <label>DRUGI IGRAČ<input value={playerTwo} onChange={(event) => setPlayerTwo(event.target.value)} maxLength={24} /></label>
            </div>}

            <div className="rd-bottom-row">
              <div className="rd-how">
                <div className="rd-overline">KAKO SE IGRA</div>
                <div className="rd-levels"><span className="rd-level easy"><b>01</b> Lako</span><span className="rd-level medium"><b>02</b> Srednje</span><span className="rd-level hard"><b>03</b> Teško</span></div>
                <p>{modeDescription}</p>
              </div>
              <div className="rd-scoring">
                <div><span>LAKO</span><strong>10</strong></div><div><span>SREDNJE</span><strong>20</strong></div><div><span>TEŠKO</span><strong>30</strong></div>
                <small>+5 bodova za niz točnih odgovora · pomoć umanjuje rezultat</small>
              </div>
            </div>
            <button onClick={start} className="rd-start">ZAPOČNI IZAZOV <span>→</span></button>
            <div className="rd-footnote">ZNANJE JE NASLJEĐE KOJE SE PRENOSI.</div>
          </div>
        )}

        {started && current && (
          <div className="rd-game">
            <div className="rd-game-top">
              <div><div className="rd-overline">TRENUTAČNI IZAZOV</div><h2>{current.category}<span> / {current.level === 1 ? "LAKO" : current.level === 2 ? "SREDNJE" : "TEŠKO"}</span></h2></div>
              <div className="rd-scoreline">{mode === "duel" ? <><span>{playerNames[0]} <b>{scores[0]}</b></span><span>{playerNames[1]} <b>{scores[1]}</b></span></> : <span>BODOVI <b>{scores[0]}</b></span>}</div>
            </div>
            <div className="rd-progress-meta"><span>POJAM {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}</span><span>{Math.round(progress)}% ZAVRŠENO</span></div>
            <div className="rd-progress"><span style={{ width: `${progress}%` }} /></div>
            {mode === "duel" && <div className="rd-turn">SADA IGRA: <strong>{playerNames[activePlayer]}</strong></div>}
            <div className="rd-puzzle">
              <div className="rd-puzzle-label">SLOŽI SKRIVENU RIJEČ</div>
              <p>{current.clue}</p>
              <div className="rd-answer-slots" aria-label="Složena slova">
                {Array.from({ length: current.letters.length }, (_, position) => {
                  const tileId = selected[position];
                  const tile = current.letters.find((letter) => letter.id === tileId);
                  return <button key={position} onClick={() => tile && removeLetter(tile.id)} disabled={!tile || checked} className={`rd-answer-tile ${tile ? (normalize(tile.letter)===normalize(current.word)[position] ? "correct" : "wrong") : ""}`}>{tile?.letter || ""}</button>;
                })}
              </div>
              <div className="rd-letter-bank">
                {current.letters.map((tile) => <button key={tile.id} onClick={() => chooseLetter(tile.id)} disabled={selected.includes(tile.id) || checked} className={`rd-letter-tile ${selected.includes(tile.id) ? "used" : ""}`}>{tile.letter}</button>)}
              </div>
              {feedback && <div className={`rd-feedback ${checked ? "success" : "hint"}`}>{feedback}</div>}
              <div className="rd-actions">
                {!checked ? <><button onClick={checkAnswer} disabled={!answer.trim()} className="rd-check">PROVJERI ODGOVOR</button><button onClick={clearAnswer} className="rd-secondary">OČISTI</button><button onClick={revealLetter} disabled={revealed} className="rd-secondary">POMOĆ</button></> : <button onClick={next} className="rd-check">SLJEDEĆI POJAM <span>→</span></button>}
              </div>
              {checked && <div className="rd-explanation"><div>TO JE TO. ZAPAMTI.</div><strong>{current.word}</strong><p>{current.explanation}</p></div>}
            </div>
            <div className="rd-game-bottom"><span>NIZ TOČNIH ODGOVORA <b>{streak}</b></span><button onClick={() => { setStarted(false); setFinished(false); setRound([]); }} className="rd-quit">NAPUSTI IZAZOV</button></div>
          </div>
        )}

        {finished && (
          <div className="rd-finish">
            <div className="rd-overline">IZAZOV JE ZAVRŠEN</div>
            <h2>{mode === "duel" ? winner === "Neriješeno" ? "Izjednačen rezultat." : `Pobjednik je ${winner}.` : "Odlično odigrano."}</h2>
            <p>Svaka naučena riječ čuva dio našeg zajedničkog nasljeđa.</p>
            <div className="rd-final-scores"><div><span>{playerNames[0]}</span><strong>{scores[0]}</strong><small>BODOVA</small></div>{mode === "duel" && <div><span>{playerNames[1]}</span><strong>{scores[1]}</strong><small>BODOVA</small></div>}</div>
            <div className="rd-actions"><button onClick={start} className="rd-check">IGRAJ PONOVNO</button><button onClick={() => { setStarted(false); setFinished(false); setRound([]); }} className="rd-secondary">PROMIJENI NAČIN</button><button onClick={onBack} className="rd-secondary">NATRAG NA KVIZ</button></div>
          </div>
        )}
      </section>
      <p className="rd-disclaimer">Osobni rezultat ove početne verzije sprema se na ovom uređaju. Online dvoboji, zajednička rang-lista i povezivanje bodova s korisničkim profilom zahtijevaju zasebnu sigurnu integraciju.</p>

      <style>{`
        .rd-page{color:#f7f5ef}.rd-shell{overflow:hidden;border:1px solid rgba(221,184,103,.2);border-radius:26px;background:#07182a;box-shadow:0 28px 80px rgba(0,0,0,.32)}
        .rd-back{border:1px solid rgba(255,255,255,.16);border-radius:10px;padding:10px 16px;background:rgba(255,255,255,.045);color:#e8eaf0;font-size:13px;font-weight:700;transition:.2s}.rd-back:hover{border-color:#d9b66d;background:rgba(255,255,255,.08)}
        .rd-brand{color:#c9b88f;font-size:10px;font-weight:800;letter-spacing:.2em}.rd-brand span{color:#a9874c;padding:0 7px}
        .rd-hero{position:relative;overflow:hidden;min-height:250px;padding:40px 34px;background:radial-gradient(ellipse at 78% 20%,rgba(204,165,91,.17),transparent 32%),linear-gradient(115deg,#0e2b47,#102d49 55%,#0a2037);border-bottom:1px solid rgba(255,255,255,.08)}
        .rd-hero-art{position:absolute;z-index:1;top:0;right:0;width:43%;height:100%;padding:12px 18px 12px 0;object-fit:contain;object-position:center right;opacity:1;filter:drop-shadow(0 12px 28px rgba(0,0,0,.28));mask-image:linear-gradient(90deg,transparent 0%,rgba(0,0,0,.7) 15%,#000 38%)}
        .rd-hero>div.relative{max-width:61%;}
        @media(max-width:760px){.rd-hero{min-height:245px;padding:30px 22px}.rd-hero-art{width:48%;padding:10px 8px 10px 0;opacity:.86;mask-image:linear-gradient(90deg,transparent 0%,rgba(0,0,0,.85) 20%,#000 48%)}.rd-hero>div.relative{max-width:62%}}
        .rd-hero:after{content:"";position:absolute;inset:auto 0 0;height:4px;background:linear-gradient(90deg,#8c2637 0 33%,#e9e4d8 33% 66%,#1b4165 66%)}
        .rd-hero-glow{position:absolute;width:340px;height:340px;right:8%;top:-240px;border:1px solid rgba(221,184,103,.2);border-radius:50%;box-shadow:0 0 0 32px rgba(221,184,103,.025),0 0 0 66px rgba(221,184,103,.02)}
        .rd-kicker{display:flex;align-items:center;gap:10px;color:#e3c786;font-size:10px;font-weight:800;letter-spacing:.22em}.rd-kicker span{width:25px;height:1px;background:#d9b66d}
        .rd-hero h1{margin-top:17px;color:#fff;font-size:clamp(38px,7vw,66px);font-weight:800;line-height:1;letter-spacing:-.055em}.rd-hero h1 em{color:#e4c783;font-style:normal}.rd-hero>div>p{margin-top:14px;color:rgba(255,255,255,.7);font-size:15px;letter-spacing:.025em}
        .rd-hero-meta{display:flex;align-items:center;gap:12px;margin-top:27px;color:rgba(255,255,255,.46);font-size:9px;font-weight:800;letter-spacing:.17em}.rd-hero-meta i{width:3px;height:3px;border-radius:50%;background:#d6b66e}
        .rd-hero-mark{position:absolute;right:7%;bottom:4px;color:rgba(255,255,255,.035);font-size:180px;font-weight:900;letter-spacing:-.1em;line-height:1}
        .rd-content{padding:32px}.rd-intro-row{display:flex;align-items:center;justify-content:space-between;gap:20px}.rd-overline{color:#d9b66d;font-size:10px;font-weight:800;letter-spacing:.2em}.rd-intro-row h2,.rd-game-top h2{margin-top:8px;color:#fff;font-size:25px;font-weight:750;letter-spacing:-.035em}.rd-intro-row p{margin-top:7px;color:rgba(255,255,255,.52);font-size:13px}
        .rd-record{display:grid;min-width:142px;justify-items:end;border-left:1px solid rgba(255,255,255,.1);padding-left:24px}.rd-record span,.rd-record small{color:rgba(255,255,255,.42);font-size:9px;font-weight:800;letter-spacing:.12em}.rd-record strong{margin:2px 0;color:#f0d28c;font-size:32px;line-height:1}
        .rd-mode-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:13px;margin-top:28px}.rd-mode-card{position:relative;display:flex;min-height:212px;flex-direction:column;align-items:flex-start;overflow:hidden;border:1px solid rgba(255,255,255,.1);border-radius:16px;padding:20px;background:linear-gradient(145deg,rgba(255,255,255,.055),rgba(255,255,255,.018));text-align:left;transition:transform .22s,border-color .22s,background .22s}.rd-mode-card:hover{transform:translateY(-3px);border-color:rgba(217,182,109,.45)}.rd-mode-card.is-active{border-color:#d8b66d;background:linear-gradient(145deg,rgba(217,182,109,.13),rgba(255,255,255,.025));box-shadow:inset 0 0 0 1px rgba(217,182,109,.12),0 14px 35px rgba(0,0,0,.16)}
        .rd-mode-number{position:absolute;right:15px;top:8px;color:rgba(255,255,255,.12);font-size:38px;font-weight:900;letter-spacing:-.08em}.rd-mode-tag{position:relative;color:#d7b66e;font-size:8px;font-weight:800;letter-spacing:.13em}.rd-mode-card strong{margin-top:17px;color:#fff;font-size:21px;letter-spacing:-.03em}.rd-mode-copy{margin-top:9px;color:rgba(255,255,255,.52);font-size:12px;line-height:1.65}.rd-mode-link{display:flex;justify-content:space-between;gap:12px;width:100%;margin-top:auto;padding-top:18px;color:#e6c982;font-size:10px;font-weight:800;letter-spacing:.1em;text-transform:uppercase}.rd-mode-link b{font-size:17px;line-height:10px}
        .rd-player-fields{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:16px}.rd-player-fields label{display:grid;gap:8px;color:#d9b66d;font-size:9px;font-weight:800;letter-spacing:.14em}.rd-player-fields input{width:100%;border:1px solid rgba(255,255,255,.15);border-radius:9px;padding:12px;background:#0d243a;color:#fff;outline:none}.rd-player-fields input:focus{border-color:#d9b66d}
        .rd-bottom-row{display:grid;grid-template-columns:1fr 1fr;gap:22px;margin-top:25px;padding:20px;border:1px solid rgba(255,255,255,.08);border-radius:15px;background:rgba(0,0,0,.12)}.rd-levels{display:flex;flex-wrap:wrap;gap:9px;margin-top:13px}.rd-level{display:inline-flex;align-items:center;gap:7px;color:rgba(255,255,255,.65);font-size:11px}.rd-level b{display:grid;width:22px;height:22px;place-items:center;border-radius:6px;font-size:9px}.rd-level.easy b{background:rgba(86,170,130,.16);color:#9bd5b4}.rd-level.medium b{background:rgba(217,182,109,.15);color:#e8ca8b}.rd-level.hard b{background:rgba(194,103,103,.15);color:#e6a3a3}.rd-how p{margin-top:12px;color:rgba(255,255,255,.46);font-size:11px;line-height:1.65}
        .rd-scoring{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.rd-scoring>div{display:grid;gap:5px;padding:10px;border-left:1px solid rgba(255,255,255,.1)}.rd-scoring span{color:rgba(255,255,255,.4);font-size:8px;font-weight:800;letter-spacing:.13em}.rd-scoring strong{color:#f0d28c;font-size:23px}.rd-scoring small{grid-column:1/-1;align-self:end;color:rgba(255,255,255,.35);font-size:9px;line-height:1.5}
        .rd-start,.rd-check{display:flex;align-items:center;justify-content:center;gap:20px;width:100%;min-height:52px;margin-top:22px;border:1px solid #e5c47b;border-radius:10px;padding:14px 20px;background:linear-gradient(110deg,#e9cf91,#c69b50);color:#132235;font-size:11px;font-weight:900;letter-spacing:.16em;box-shadow:0 10px 26px rgba(190,145,64,.16);transition:filter .2s,transform .2s}.rd-start:hover,.rd-check:hover{filter:brightness(1.08);transform:translateY(-2px)}.rd-start span,.rd-check span{font-size:18px}.rd-footnote{margin-top:20px;color:rgba(255,255,255,.25);font-size:8px;font-weight:800;letter-spacing:.2em;text-align:center}
        .rd-game{padding:30px}.rd-game-top{display:flex;align-items:center;justify-content:space-between;gap:16px}.rd-game-top h2 span{color:#d8b66d;font-size:10px;letter-spacing:.12em}.rd-scoreline{display:flex;flex-wrap:wrap;gap:8px}.rd-scoreline span{border:1px solid rgba(255,255,255,.1);border-radius:8px;padding:9px 12px;color:rgba(255,255,255,.6);font-size:10px}.rd-scoreline b{margin-left:8px;color:#f0d28c;font-size:14px}
        .rd-progress-meta{display:flex;justify-content:space-between;margin-top:25px;color:rgba(255,255,255,.42);font-size:9px;font-weight:800;letter-spacing:.13em}.rd-progress{height:5px;margin-top:9px;overflow:hidden;border-radius:9px;background:rgba(255,255,255,.09)}.rd-progress span{display:block;height:100%;border-radius:9px;background:linear-gradient(90deg,#a77d3b,#efd58e);transition:width .3s}.rd-turn{margin-top:18px;color:rgba(255,255,255,.5);font-size:10px;letter-spacing:.1em;text-align:center}.rd-turn strong{color:#f0d28c}
        .rd-puzzle{max-width:720px;margin:30px auto 0;text-align:center}.rd-puzzle-label{color:#d9b66d;font-size:9px;font-weight:900;letter-spacing:.2em}.rd-puzzle>p{max-width:590px;margin:13px auto 25px;color:rgba(255,255,255,.72);font-size:16px;line-height:1.7}
        .rd-answer-slots{display:flex;flex-wrap:wrap;justify-content:center;gap:6px;min-height:54px}.rd-answer-tile,.rd-letter-tile{display:grid;width:42px;height:48px;place-items:center;border:1px solid rgba(225,194,129,.32);border-radius:8px;background:rgba(225,194,129,.08);color:#f2d89e;font-size:19px;font-weight:800;transition:transform .16s,background .16s,border-color .16s}.rd-answer-tile.correct{border-color:#34d399;background:#059669;color:#fff;box-shadow:0 0 14px rgba(16,185,129,.2)}.rd-answer-tile.wrong{border-color:#fb7185;background:#e11d48;color:#fff;box-shadow:0 0 14px rgba(244,63,94,.18)}.rd-answer-tile:not(:disabled):hover,.rd-letter-tile:not(:disabled):hover{transform:translateY(-3px);border-color:#f1d18a}.rd-letter-bank{display:flex;flex-wrap:wrap;justify-content:center;gap:7px;margin-top:16px}.rd-letter-tile{width:44px;height:50px;border-color:rgba(255,255,255,.13);background:linear-gradient(145deg,#173a58,#102a43);color:#fff;box-shadow:0 5px 12px rgba(0,0,0,.18)}.rd-letter-tile.used{opacity:.2;transform:scale(.94)}
        .rd-feedback{margin-top:16px;font-size:12px;font-weight:700}.rd-feedback.success{color:#9bd5b4}.rd-feedback.hint{color:#e8ca8b}.rd-actions{display:flex;flex-wrap:wrap;justify-content:center;gap:9px;margin-top:18px}.rd-actions .rd-check{width:auto;min-width:190px;margin:0}.rd-secondary{min-height:46px;border:1px solid rgba(255,255,255,.15);border-radius:9px;padding:11px 16px;background:rgba(255,255,255,.045);color:rgba(255,255,255,.75);font-size:9px;font-weight:800;letter-spacing:.1em;transition:.2s}.rd-secondary:hover{border-color:#d9b66d;color:#fff}.rd-secondary:disabled{opacity:.35}
        .rd-explanation{margin-top:24px;border:1px solid rgba(125,188,151,.18);border-radius:12px;padding:17px;background:rgba(87,151,115,.07);text-align:left}.rd-explanation div{color:#9bd5b4;font-size:8px;font-weight:900;letter-spacing:.17em}.rd-explanation strong{display:block;margin-top:8px;color:#fff;font-size:20px}.rd-explanation p{margin-top:6px;color:rgba(255,255,255,.6);font-size:12px;line-height:1.65}
        .rd-game-bottom{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-top:26px;padding-top:16px;border-top:1px solid rgba(255,255,255,.08);color:rgba(255,255,255,.36);font-size:9px;font-weight:800;letter-spacing:.1em}.rd-game-bottom b{margin-left:8px;color:#e8ca8b;font-size:13px}.rd-quit{color:rgba(255,255,255,.4);font-size:9px;font-weight:800;letter-spacing:.1em}.rd-quit:hover{color:#fff}
        .rd-finish{padding:65px 28px;text-align:center}.rd-finish h2{margin-top:12px;color:#fff;font-size:clamp(28px,5vw,42px);font-weight:800;letter-spacing:-.04em}.rd-finish>p{margin-top:10px;color:rgba(255,255,255,.55);font-size:13px}.rd-final-scores{display:flex;justify-content:center;gap:12px;margin-top:28px}.rd-final-scores>div{display:grid;min-width:155px;gap:5px;border:1px solid rgba(255,255,255,.12);border-radius:13px;padding:18px;background:rgba(255,255,255,.035)}.rd-final-scores span,.rd-final-scores small{color:rgba(255,255,255,.45);font-size:9px;font-weight:800;letter-spacing:.12em}.rd-final-scores strong{color:#f0d28c;font-size:36px}
        .rd-disclaimer{max-width:850px;margin:16px auto 0;color:rgba(255,255,255,.35);font-size:10px;line-height:1.7;text-align:center}
        @media(max-width:760px){.rd-hero{min-height:225px;padding:32px 22px}.rd-content{padding:22px}.rd-mode-grid{grid-template-columns:1fr}.rd-mode-card{min-height:175px}.rd-bottom-row{grid-template-columns:1fr}.rd-game{padding:22px}.rd-game-top{align-items:flex-start;flex-direction:column}.rd-record{min-width:110px;padding-left:14px}.rd-hero-meta{flex-wrap:wrap;gap:8px}.rd-hero-mark{right:3%;font-size:125px}.rd-intro-row h2{font-size:22px}}
        @media(max-width:420px){.rd-intro-row{align-items:flex-start;flex-direction:column}.rd-record{grid-template-columns:auto auto;align-items:center;justify-items:start;column-gap:8px;border-left:0;padding:0}.rd-record strong{grid-row:2}.rd-record small{grid-column:2;grid-row:2}.rd-player-fields{grid-template-columns:1fr}.rd-answer-tile,.rd-letter-tile{width:35px;height:42px;font-size:16px}.rd-scoring{gap:3px}.rd-scoreline{width:100%}.rd-scoreline span{flex:1}.rd-game-bottom{align-items:flex-start;flex-direction:column}}
        @media(prefers-reduced-motion:reduce){.rd-page *{transition:none!important;animation:none!important}}
      `}</style>
    </main>
  );
}
