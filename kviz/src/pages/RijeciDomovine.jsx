import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, BookOpen, CheckCircle2, Crown, Lightbulb, RotateCcw, Swords, Trophy } from "lucide-react";

const WORDS = [
  { word: "HRVATSKA", category: "Domovina", level: 1, clue: "Država u kojoj živimo, između Jadrana i srednje Europe.", explanation: "Hrvatska je europska država čiji je glavni grad Zagreb." },
  { word: "VUKOVAR", category: "Domovina", level: 1, clue: "Grad na Dunavu, simbol stradanja i otpora 1991. godine.", explanation: "Vukovar je grad na istoku Hrvatske, na obali Dunava, posebno važan u sjećanju na Domovinski rat." },
  { word: "KNIN", category: "Domovina", level: 1, clue: "Kraljevski grad u Dalmatinskoj zagori, povezan s hrvatskom državnosti.", explanation: "Knin je povijesni grad podno Dinare i važno mjesto hrvatske povijesti." },
  { word: "ZAGREB", category: "Domovina", level: 1, clue: "Glavni i najveći grad Republike Hrvatske.", explanation: "Zagreb je političko, kulturno, gospodarsko i obrazovno središte Hrvatske." },
  { word: "MOLITVA", category: "Vjera", level: 1, clue: "Obraćanje Bogu riječima, mislima ili u tišini.", explanation: "U kršćanstvu molitva može biti zahvala, prošnja, slavljenje ili razmatranje." },
  { word: "ISUS", category: "Vjera", level: 1, clue: "Središnja osoba kršćanske vjere.", explanation: "Kršćani vjeruju da je Isus Krist Sin Božji i Spasitelj." },
  { word: "BIBLIJA", category: "Vjera", level: 1, clue: "Sveto pismo kršćana, sastavljeno od Staroga i Novoga zavjeta.", explanation: "Biblija je zbirka svetih knjiga koje čine temelj kršćanske vjere." },
  { word: "USKRS", category: "Vjera", level: 1, clue: "Najveći kršćanski blagdan, kojim se slavi Kristovo uskrsnuće.", explanation: "Uskrs je središnji blagdan kršćanske vjere." },
  { word: "KRUNICA", category: "Vjera", level: 2, clue: "Molitva koja razmatra otajstva Isusova i Marijina života.", explanation: "Krunica je tradicionalna katolička pobožnost koja uključuje niz molitava i razmatranje otajstava." },
  { word: "MILOSRĐE", category: "Vjera", level: 2, clue: "Suosjećanje i djelatna ljubav prema čovjeku u nevolji.", explanation: "Kršćansko milosrđe poziva na konkretnu pomoć, praštanje i brigu za bližnjega." },
  { word: "GLAGOLJICA", category: "Baština", level: 2, clue: "Staro slavensko pismo koje je ostavilo dubok trag u hrvatskoj kulturi.", explanation: "Hrvatska glagoljaška tradicija posebno je važna za hrvatsku pismenost, književnost i liturgiju." },
  { word: "PLETER", category: "Baština", level: 2, clue: "Prepoznatljiv ukrasni motiv isprepletenih traka na hrvatskim spomenicima.", explanation: "Trokutasti i trakasti pleterni ukrasi česti su na ranosrednjovjekovnim kamenim spomenicima." },
  { word: "LICITAR", category: "Baština", level: 2, clue: "Šareno ukrašeni tradicijski predmet od tijesta, često u obliku srca.", explanation: "Licitarsko umijeće povezano je s tradicijom sjeverne Hrvatske i upisano je na UNESCO-ov popis nematerijalne baštine." },
  { word: "KLAPA", category: "Baština", level: 2, clue: "Tradicionalna skupina pjevača koja njeguje višeglasno pjevanje.", explanation: "Klapsko pjevanje posebno je povezano s Dalmacijom i upisano je na UNESCO-ov popis nematerijalne kulturne baštine." },
  { word: "OLUJA", category: "Povijest", level: 2, clue: "Vojno-redarstvena operacija provedena u kolovozu 1995. godine.", explanation: "Operacija Oluja bila je ključna operacija u završnoj fazi Domovinskog rata. O njezinim posljedicama važno je govoriti uz provjerene povijesne izvore i poštovanje prema svim žrtvama." },
  { word: "SINJSKA ALKA", category: "Baština", level: 3, clue: "Viteško natjecanje u Sinju koje se održava u spomen na događaj iz 1715. godine.", explanation: "Sinjska alka tradicijska je viteška igra i nematerijalna kulturna baština Hrvatske." },
  { word: "BAŠĆANSKA PLOČA", category: "Baština", level: 3, clue: "Jedan od najvažnijih hrvatskih glagoljskih kamenih spomenika.", explanation: "Bašćanska ploča pronađena je u crkvi svete Lucije u Jurandvoru na otoku Krku i važan je izvor za hrvatski jezik i povijest." },
  { word: "DOMOVINSKI RAT", category: "Povijest", level: 3, clue: "Rat za obranu neovisnosti i teritorijalne cjelovitosti Hrvatske 1991.–1995.", explanation: "Domovinski rat temeljno je razdoblje suvremene hrvatske povijesti; sjećanje na poginule, nestale i preživjele zahtijeva dostojanstvo i povijesnu točnost." },
  { word: "DUBROVNIK", category: "Domovina", level: 3, clue: "Povijesni grad na jugu Hrvatske, nekoć središte Dubrovačke Republike.", explanation: "Dubrovačka Republika razvila je snažnu pomorsku, trgovačku i diplomatsku tradiciju." },
  { word: "TAMBURICA", category: "Baština", level: 3, clue: "Žičano glazbalo snažno povezano s tradicijskom glazbom Slavonije.", explanation: "Tamburaška glazba važan je dio glazbene tradicije Slavonije i drugih hrvatskih krajeva." },
  { word: "DOMOVINA", category: "Domovina", level: 3, clue: "Zemlja kojoj pripadamo i s kojom nas povezuju povijest, ljudi i odgovornost.", explanation: "Domoljublje se može pokazivati znanjem, brigom za zajednicu, poštovanjem zakona i čuvanjem kulturne baštine." },
];

function normalize(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleUpperCase("hr")
    .replace(/[^A-Z]/g, "");
}

function shuffle(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function scramble(word) {
  const letters = word.replace(/\s/g, "").split("");
  let result = shuffle(letters).join("");
  if (result === letters.join("") && letters.length > 1) {
    result = [...letters.slice(1), letters[0]].join("");
  }
  return result.split("").join(" · ");
}

function createRound() {
  const easy = shuffle(WORDS.filter((item) => item.level === 1)).slice(0, 3);
  const medium = shuffle(WORDS.filter((item) => item.level === 2)).slice(0, 4);
  const hard = shuffle(WORDS.filter((item) => item.level === 3)).slice(0, 3);
  return [...easy, ...medium, ...hard].map((item) => ({ ...item, letters: scramble(item.word) }));
}

const pointsFor = (level) => level === 1 ? 10 : level === 2 ? 20 : 30;

export default function RijeciDomovine({ onBack, playerName = "" }) {
  const [mode, setMode] = useState("solo");
  const [playerOne, setPlayerOne] = useState(playerName || "Igrač 1");
  const [playerTwo, setPlayerTwo] = useState("Igrač 2");
  const [round, setRound] = useState([]);
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [scores, setScores] = useState([0, 0]);
  const [activePlayer, setActivePlayer] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [checked, setChecked] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [finished, setFinished] = useState(false);
  const [started, setStarted] = useState(false);
  const [bestScore, setBestScore] = useState(() => {
    try { return Number(window.localStorage.getItem("patriasoul_rijeci_best") || 0); }
    catch { return 0; }
  });

  const current = round[index];
  const total = round.length;
  const progress = total ? ((index + (checked ? 1 : 0)) / total) * 100 : 0;
  const playerNames = useMemo(() => [playerOne.trim() || "Igrač 1", playerTwo.trim() || "Igrač 2"], [playerOne, playerTwo]);

  const start = () => {
    setRound(createRound());
    setIndex(0);
    setAnswer("");
    setScores([0, 0]);
    setActivePlayer(0);
    setFeedback("");
    setChecked(false);
    setRevealed(false);
    setFinished(false);
    setStarted(true);
  };

  const checkAnswer = () => {
    if (!current || checked || !answer.trim()) return;
    const correct = normalize(answer) === normalize(current.word);
    if (correct) {
      const earned = Math.max(5, pointsFor(current.level) - (revealed ? 5 : 0));
      setScores((previous) => previous.map((score, i) => i === activePlayer ? score + earned : score));
      setFeedback(`Točno! Osvojeno ${earned} bodova.`);
    } else {
      setFeedback("Još nije točno. Pokušaj ponovno ili iskoristi pomoć.");
    }
    setChecked(correct);
  };

  const next = () => {
    if (index + 1 >= total) {
      setFinished(true);
      setStarted(false);
      if (mode === "solo") {
        const finalScore = scores[0];
        if (finalScore > bestScore) {
          setBestScore(finalScore);
          try { window.localStorage.setItem("patriasoul_rijeci_best", String(finalScore)); } catch {}
        }
      }
      return;
    }
    setIndex((value) => value + 1);
    setAnswer("");
    setFeedback("");
    setChecked(false);
    setRevealed(false);
    if (mode === "duel") setActivePlayer((value) => (value === 0 ? 1 : 0));
  };

  const revealLetter = () => {
    if (!current || revealed || checked) return;
    setRevealed(true);
    const firstLetter = current.word.replace(/\s/g, "")[0];
    setFeedback(`Pomoć: riječ počinje slovom ${firstLetter}. Točan odgovor vrijedi 5 bodova manje.`);
  };

  const reset = () => {
    setStarted(false);
    setFinished(false);
    setRound([]);
    setIndex(0);
    setAnswer("");
    setScores([0, 0]);
    setFeedback("");
    setChecked(false);
    setRevealed(false);
  };

  const winner = scores[0] === scores[1] ? "Neriješeno" : scores[0] > scores[1] ? playerNames[0] : playerNames[1];

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <button onClick={onBack} className="patria-button"><ArrowLeft className="mr-2 h-4 w-4" /> Natrag na kviz</button>
        <span className="text-xs font-bold uppercase tracking-[.2em] text-[#f1d078]">PatriaSoul · Čuvari nasljeđa</span>
      </div>

      <section className="overflow-hidden rounded-3xl border border-amber-300/20 bg-[#091a2c] shadow-2xl">
        <div className="border-b border-white/10 bg-gradient-to-r from-[#102d49] via-[#173b5d] to-[#102d49] px-5 py-8 text-center sm:px-10 sm:py-12">
          <p className="text-xs font-bold uppercase tracking-[.24em] text-amber-200">Znanje · vjera · domovina</p>
          <h1 className="mt-3 font-display text-4xl font-bold text-white sm:text-6xl">Riječi domovine</h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-white/70 sm:text-base">Složi riječi koje čuvaju našu povijest, vjeru, kulturu i identitet. Svaka riječ donosi novo znanje.</p>
        </div>

        {!started && !finished && (
          <div className="grid gap-6 p-5 sm:p-8 lg:grid-cols-[1.1fr_.9fr]">
            <div>
              <div className="mb-4 flex items-center gap-2 text-amber-200"><BookOpen className="h-5 w-5" /><span className="text-sm font-bold uppercase tracking-wider">Odaberi način igranja</span></div>
              <div className="grid gap-3 sm:grid-cols-2">
                <button onClick={() => setMode("solo")} className={`rounded-2xl border p-5 text-left transition ${mode === "solo" ? "border-amber-300 bg-amber-300/10" : "border-white/10 bg-white/[.03] hover:border-white/30"}`}>
                  <BookOpen className="h-6 w-6 text-amber-200" /><h2 className="mt-3 text-xl font-bold text-white">Samostalno</h2><p className="mt-2 text-sm leading-6 text-white/60">Igraj svojim tempom, skupljaj bodove i poboljšavaj osobni rezultat.</p>
                </button>
                <button onClick={() => setMode("duel")} className={`rounded-2xl border p-5 text-left transition ${mode === "duel" ? "border-amber-300 bg-amber-300/10" : "border-white/10 bg-white/[.03] hover:border-white/30"}`}>
                  <Swords className="h-6 w-6 text-amber-200" /><h2 className="mt-3 text-xl font-bold text-white">Duel igrača</h2><p className="mt-2 text-sm leading-6 text-white/60">Dva igrača izmjenjuju se na istom uređaju. Pobjeđuje veći broj bodova.</p>
                </button>
              </div>
              {mode === "duel" && <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <label className="text-sm font-semibold text-white/80">Ime prvog igrača<input value={playerOne} onChange={(event) => setPlayerOne(event.target.value)} maxLength={24} className="mt-2 w-full rounded-lg border border-white/15 bg-[#10263c] px-3 py-3 text-white outline-none focus:border-amber-300" /></label>
                <label className="text-sm font-semibold text-white/80">Ime drugog igrača<input value={playerTwo} onChange={(event) => setPlayerTwo(event.target.value)} maxLength={24} className="mt-2 w-full rounded-lg border border-white/15 bg-[#10263c] px-3 py-3 text-white outline-none focus:border-amber-300" /></label>
              </div>}
              <div className="mt-6 rounded-2xl border border-white/10 bg-white/[.03] p-4">
                <p className="text-sm font-bold text-amber-100">Postupna težina</p>
                <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="rounded-lg bg-emerald-500/10 p-3 text-emerald-200">1–3 · Lako</div>
                  <div className="rounded-lg bg-amber-500/10 p-3 text-amber-100">4–7 · Srednje</div>
                  <div className="rounded-lg bg-rose-500/10 p-3 text-rose-200">8–10 · Teško</div>
                </div>
                <p className="mt-3 text-xs leading-6 text-white/50">Runda sadrži 10 riječi iz područja domovine, povijesti, vjere i hrvatske baštine.</p>
              </div>
              <button onClick={start} className="patria-button-accent mt-6 w-full justify-center"><ArrowRight className="mr-2 h-4 w-4" /> Započni igru</button>
            </div>
            <aside className="rounded-2xl border border-amber-200/15 bg-gradient-to-br from-[#132f4b] to-[#0b1b2d] p-6">
              <Trophy className="h-8 w-8 text-amber-200" />
              <h2 className="mt-4 text-2xl font-bold text-white">Bodovanje</h2>
              <ul className="mt-4 space-y-3 text-sm text-white/70">
                <li className="flex justify-between gap-3"><span>Laka riječ</span><strong className="text-white">10 bodova</strong></li>
                <li className="flex justify-between gap-3"><span>Srednja riječ</span><strong className="text-white">20 bodova</strong></li>
                <li className="flex justify-between gap-3"><span>Teška riječ</span><strong className="text-white">30 bodova</strong></li>
                <li className="flex justify-between gap-3"><span>Korištenje pomoći</span><strong className="text-white">−5 bodova</strong></li>
              </ul>
              <div className="mt-6 rounded-xl border border-white/10 bg-black/15 p-4"><p className="text-xs uppercase tracking-wider text-white/45">Osobni najbolji rezultat na ovom uređaju</p><p className="mt-1 text-3xl font-bold text-amber-100">{bestScore}</p></div>
            </aside>
          </div>
        )}

        {started && current && (
          <div className="p-5 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div><p className="text-xs font-bold uppercase tracking-[.18em] text-amber-200">{current.category}</p><p className="mt-1 text-sm text-white/50">Riječ {index + 1} od {total} · {current.level === 1 ? "Lako" : current.level === 2 ? "Srednje" : "Teško"}</p></div>
              <div className="flex gap-3 text-sm">{mode === "duel" ? <><span className="rounded-lg bg-white/5 px-3 py-2 text-white">{playerNames[0]}: <strong>{scores[0]}</strong></span><span className="rounded-lg bg-white/5 px-3 py-2 text-white">{playerNames[1]}: <strong>{scores[1]}</strong></span></> : <span className="rounded-lg bg-white/5 px-3 py-2 text-white">Bodovi: <strong>{scores[0]}</strong></span>}</div>
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-200 transition-all" style={{ width: `${progress}%` }} /></div>
            {mode === "duel" && <p className="mt-5 text-center text-sm font-bold text-amber-100">Na potezu: {playerNames[activePlayer]}</p>}
            <div className="mx-auto mt-8 max-w-3xl text-center">
              <div className="inline-flex rounded-full border border-white/10 bg-white/[.04] px-4 py-2 text-xs font-bold uppercase tracking-wider text-white/60">Skrivena riječ</div>
              <div className="mt-5 break-words text-2xl font-black tracking-widest text-amber-100 sm:text-4xl">{current.letters}</div>
              <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-white/75">{current.clue}</p>
              <label className="mt-7 block text-left text-xs font-bold uppercase tracking-wider text-white/50">Tvoj odgovor</label>
              <input value={answer} onChange={(event) => { setAnswer(event.target.value); if (feedback && !checked) setFeedback(""); }} onKeyDown={(event) => { if (event.key === "Enter") checked ? next() : checkAnswer(); }} disabled={checked} autoComplete="off" className="mt-2 w-full rounded-xl border border-white/15 bg-[#10263c] px-4 py-4 text-center text-xl font-bold uppercase tracking-widest text-white outline-none placeholder:text-white/25 focus:border-amber-300 disabled:opacity-70" placeholder="UPIŠI RIJEČ" />
              {feedback && <p className={`mt-3 text-sm font-semibold ${checked ? "text-emerald-300" : "text-amber-100"}`}>{feedback}</p>}
              <div className="mt-5 flex flex-wrap justify-center gap-3">
                {!checked && <><button onClick={checkAnswer} disabled={!answer.trim()} className="patria-button-accent min-w-40">Provjeri riječ</button><button onClick={revealLetter} disabled={revealed} className="patria-button"><Lightbulb className="mr-2 h-4 w-4" /> Pomoć</button></>}
                {checked && <button onClick={next} className="patria-button-accent min-w-40">Sljedeća riječ <ArrowRight className="ml-2 h-4 w-4" /></button>}
              </div>
              {checked && <div className="mt-7 rounded-2xl border border-emerald-300/15 bg-emerald-300/[.06] p-5 text-left"><div className="flex items-center gap-2 text-emerald-200"><CheckCircle2 className="h-5 w-5" /><strong>{current.word}</strong></div><p className="mt-2 text-sm leading-7 text-white/70">{current.explanation}</p></div>}
            </div>
          </div>
        )}

        {finished && (
          <div className="p-6 text-center sm:p-10">
            <Crown className="mx-auto h-12 w-12 text-amber-200" />
            <p className="mt-4 text-xs font-bold uppercase tracking-[.2em] text-amber-200">Izazov završen</p>
            <h2 className="mt-2 text-3xl font-bold text-white sm:text-4xl">{mode === "duel" ? winner === "Neriješeno" ? "Neriješen rezultat" : `Pobjednik: ${winner}` : "Odlično odigrano!"}</h2>
            <div className="mx-auto mt-6 grid max-w-xl grid-cols-2 gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/[.04] p-5"><p className="text-sm text-white/55">{playerNames[0]}</p><p className="mt-2 text-3xl font-bold text-amber-100">{scores[0]}</p></div>
              {mode === "duel" && <div className="rounded-2xl border border-white/10 bg-white/[.04] p-5"><p className="text-sm text-white/55">{playerNames[1]}</p><p className="mt-2 text-3xl font-bold text-amber-100">{scores[1]}</p></div>}
            </div>
            {mode === "solo" && <p className="mt-4 text-sm text-white/60">Osobni najbolji rezultat na ovom uređaju: {bestScore}</p>}
            <div className="mt-7 flex flex-wrap justify-center gap-3"><button onClick={start} className="patria-button-accent"><RotateCcw className="mr-2 h-4 w-4" /> Igraj ponovno</button><button onClick={reset} className="patria-button">Promijeni način igranja</button><button onClick={onBack} className="patria-button">Natrag na kviz</button></div>
          </div>
        )}
      </section>
      <p className="mx-auto mt-5 max-w-4xl text-center text-xs leading-6 text-white/40">Rezultat ove početne verzije sprema se lokalno na uređaju. Online izazovi, zajednička rang-lista i trajno spremanje rezultata na korisnički profil povezat će se nakon provjere sigurnog modela podataka.</p>
    </main>
  );
}
