import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, BookOpen, Brain, CalendarDays, Check, Grid3X3, Link2, Search, Shuffle, Sparkles, Trophy } from "lucide-react";
import RijeciDomovine from "./RijeciDomovine";

const BANK = [
  { word:"HRVATSKA", clue:"Država na istočnoj obali Jadrana i u srednjoj Europi.", group:"Domovina" },
  { word:"VUKOVAR", clue:"Grad na Dunavu, simbol stradanja i otpora 1991.", group:"Gradovi" },
  { word:"ZAGREB", clue:"Glavni grad Republike Hrvatske.", group:"Gradovi" },
  { word:"DUBROVNIK", clue:"Povijesni grad na jugu Hrvatske, nekada središte Dubrovačke Republike.", group:"Gradovi" },
  { word:"GLAGOLJICA", clue:"Pismo kojim su pisani brojni hrvatski srednjovjekovni tekstovi.", group:"Baština" },
  { word:"PLETER", clue:"Ukrasni motiv isprepletenih traka čest na ranosrednjovjekovnim kamenim spomenicima.", group:"Baština" },
  { word:"LICITAR", clue:"Tradicionalni, ukrašeni predmet od tijesta, često u obliku srca.", group:"Običaji" },
  { word:"TAMBURICA", clue:"Skupina trzalačkih žičanih glazbala važnih u hrvatskoj tradicijskoj glazbi.", group:"Glazba" },
  { word:"KRUNICA", clue:"Niz molitava i zrnaca koji služe u katoličkoj pobožnosti.", group:"Vjera" },
  { word:"SINJ", clue:"Grad u kojem se održava viteška igra Alka.", group:"Gradovi" },
  { word:"OLUJA", clue:"Vojno-redarstvena operacija iz kolovoza 1995.", group:"Povijest" },
  { word:"DOMOVINA", clue:"Zemlja kojoj pripadamo i koju čuvamo.", group:"Domovina" },
  { word:"MORE", clue:"Velika slana vodena površina uz hrvatsku obalu.", group:"Priroda" },
  { word:"MASLINA", clue:"Mediteransko stablo čiji se plod koristi za proizvodnju ulja.", group:"Priroda" },
  { word:"BAŠTINA", clue:"Naslijeđe koje čuvamo i prenosimo budućim naraštajima.", group:"Baština" },
  { word:"ALKA", clue:"Viteško natjecanje u Sinju, zaštićeno kao nematerijalna kulturna baština.", group:"Običaji" },
  { word:"MOLITVA", clue:"Obraćanje Bogu riječima, mislima ili u tišini.", group:"Vjera" },
  { word:"USKRS", clue:"Kršćanski blagdan Kristova uskrsnuća.", group:"Vjera" },
  { word:"KNIN", clue:"Povijesni kraljevski grad u Dalmatinskoj zagori.", group:"Gradovi" },
  { word:"JADRAN", clue:"More uz hrvatsku obalu.", group:"Priroda" },
  { word:"DINARA", clue:"Planina po kojoj je nazvan najviši vrh Hrvatske.", group:"Priroda" },
  { word:"BIBLIJA", clue:"Sveta knjiga kršćana.", group:"Vjera" },
  { word:"BAŠĆANSKA PLOČA", clue:"Glagoljski kameni spomenik iz crkve svete Lucije u Jurandvoru.", group:"Baština" },
  { word:"ŠIBENIK", clue:"Dalmatinski grad poznat po katedrali sv. Jakova.", group:"Gradovi" },
  { word:"ĐAKOVO", clue:"Slavonski grad poznat po katedrali i ergeli lipicanaca.", group:"Gradovi" },
  { word:"ČAKOVEC", clue:"Središte Međimurja.", group:"Gradovi" },
  { word:"ANĐEO", clue:"Nebesko biće u kršćanskoj i drugim religijskim predajama.", group:"Vjera" },
  { word:"OBITELJ", clue:"Zajednica osoba povezanih srodstvom, brakom ili posvojenjem.", group:"Zajednica" },
  { word:"NASLJEĐE", clue:"Ono što se prenosi s prethodnih naraštaja na buduće.", group:"Baština" },
  { word:"ETNOLOGIJA", clue:"Znanost koja proučava kulturu i način života ljudskih zajednica.", group:"Znanje" },
];
const normalize = (value) => String(value ?? "").toLocaleUpperCase("hr").replace(/Đ/g,"D").normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^A-Z]/g,"");
const shuffle = (items) => {
  const result = [...items];
  for (let i=result.length-1;i>0;i--) { const j=Math.floor(Math.random()*(i+1)); [result[i],result[j]]=[result[j],result[i]]; }
  return result;
};
const WORDS = BANK.map(item=>({...item,clean:normalize(item.word)}));
const SCRAMBLE = WORDS.filter(item=>item.clean.length>=4 && item.clean.length<=10);
const GROUPS = [
  {title:"Gradovi",words:["ZAGREB","SINJ","KNIN","VUKOVAR"]},
  {title:"Baština",words:["GLAGOLJICA","PLETER","LICITAR","BAŠĆANSKA PLOČA"]},
  {title:"Priroda",words:["MORE","MASLINA","DINARA","JADRAN"]},
  {title:"Vjera",words:["MOLITVA","KRUNICA","USKRS","BIBLIJA"]},
];
const DAILY = ["MORE","SINJ","KNIN","OLUJA","PLETER","ZAGREB","VUKOVAR","MASLINA","GLAGOLJICA","ŠIBENIK","ČAKOVEC","ĐAKOVO"];
const GAMES = [
  {id:"classic",title:"Riječi domovine",desc:"Složi slova, otkrij značenje i osvajaj bodove.",tag:"IZVORNA IGRA",type:"Brze igre",icon:BookOpen},
  {id:"search",title:"Pronađi riječ",desc:"Pronađi skrivenu riječ u mreži slova.",tag:"OPAŽANJE",type:"Brze igre",icon:Search},
  {id:"scramble",title:"Složi riječ",desc:"Od izmiješanih slova sastavi hrvatski pojam.",tag:"BRZINA",type:"Brze igre",icon:Shuffle},
  {id:"guess",title:"Pogodi riječ",desc:"Otkrij pojam uz pomoć opisa i ograničen broj pokušaja.",tag:"LOGIKA",type:"Znanje i logika",icon:Brain},
  {id:"groups",title:"Poveži pojmove",desc:"Razvrstaj riječi u četiri smislene skupine.",tag:"POVEZIVANJE",type:"Znanje i logika",icon:Grid3X3},
  {id:"chain",title:"Lanac riječi",desc:"Svaka nova riječ počinje zadnjim slovom prethodne.",tag:"JEZIČNA VJEŠTINA",type:"Znanje i logika",icon:Link2},
  {id:"ladder",title:"Ljestve riječi",desc:"Promijeni jedno slovo i pretvori riječ u novu.",tag:"IZAZOV",type:"Znanje i logika",icon:ArrowRight},
  {id:"daily",title:"Dnevna riječ",desc:"Jedna tajna riječ dnevno. Imaš šest pokušaja.",tag:"SVAKI DAN",type:"Dnevni izazov",icon:CalendarDays},
];
function Frame({title,subtitle,onBack,children}) {
  return <section className="mx-auto max-w-3xl px-4 py-8 sm:px-6"><button onClick={onBack} className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-white/70 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-200"><ArrowLeft className="h-4 w-4"/> Sve igre</button><div className="rounded-3xl border border-white/10 bg-[#0b1c30]/95 p-5 shadow-2xl sm:p-8"><p className="text-xs font-black uppercase tracking-[.2em] text-amber-300">Riječi domovine · igra riječima</p><h1 className="mt-2 text-3xl font-black text-white sm:text-4xl">{title}</h1><p className="mt-2 text-sm text-white/65">{subtitle}</p><div className="mt-7">{children}</div></div></section>;
}
function Success({children}) { return <div role="status" aria-live="polite" className="mt-5 flex items-center gap-2 rounded-xl border border-emerald-300/30 bg-emerald-300/10 p-4 font-semibold text-emerald-200"><Check className="h-5 w-5"/>{children}</div>; }

function WordSearch({onBack}) {
  const target = "HRVATSKA";
  const {grid,path} = useMemo(() => {
    const alphabet = "ABCČĆDEFGHIJKLMNOPRSŠTUVZŽ";
    const rows = Array.from({length:8},()=>Array.from({length:8},()=>alphabet[Math.floor(Math.random()*alphabet.length)]));
    const vertical = Math.random() < 0.5;
    const reverse = Math.random() < 0.5;
    const line = Math.floor(Math.random()*8);
    const positions = Array.from({length:target.length},(_,i)=>vertical ? (reverse ? (7-i)*8+line : i*8+line) : (reverse ? line*8+7-i : line*8+i));
    positions.forEach((position,index)=>{rows[Math.floor(position/8)][position%8]=target[index];});
    return {grid:rows,path:positions};
  },[]);
  const [picked,setPicked] = useState([]);
  const [message,setMessage] = useState("");
  const [won,setWon] = useState(false);
  const choose = (cell) => {
    if(won) return;
    const next=[...picked,cell];
    if(next.length===path.length) {
      if(next.every((value,index)=>value===path[index])) {setPicked(next);setWon(true);setMessage("Točno! Pronašao/la si skrivenu riječ.");}
      else {setPicked([]);setMessage("To nije traženi niz. Pokušaj ponovno.");}
    } else setPicked(next);
  };
  return <Frame title="Pronađi riječ" subtitle="Pronađi riječ HRVATSKA u mreži. Smjer može biti vodoravan ili okomit, naprijed ili unatrag." onBack={onBack}>
    <div className="mb-4 text-center text-sm font-bold tracking-[.3em] text-amber-200">TRAŽI: H R V A T S K A</div>
    <div className="mx-auto grid max-w-md grid-cols-8 gap-1.5" role="group" aria-label="Mreža slova">{grid.flat().map((letter,index)=><button key={index} type="button" aria-label={`Red ${Math.floor(index/8)+1}, stupac ${index%8+1}, slovo ${letter}`} aria-pressed={picked.includes(index)} onClick={()=>choose(index)} className={`aspect-square rounded-lg border text-sm font-black transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-200 sm:text-lg ${picked.includes(index)?"border-amber-300 bg-amber-300 text-slate-950":"border-white/10 bg-white/5 text-white hover:bg-white/10"}`}>{letter}</button>)}</div>
    {message&&<p className="mt-4 text-center text-sm text-amber-100" role="status">{message}</p>}
    {won?<Success>Riječ je pronađena!</Success>:<button onClick={()=>{setPicked([]);setMessage("");}} className="mt-4 text-sm text-white/60 underline">Poništi odabir</button>}
  </Frame>;
}

export default function CentarIgaraRijeci({onBack,playerName}) {
  const [active,setActive]=useState(null);\n  const [gameFilter,setGameFilter]=useState("Sve igre");\n  const [gameQuery,setGameQuery]=useState("");
  const [score,setScore]=useState(0);
  const [best,setBest]=useState(()=>{try{return Number(localStorage.getItem("patriasoul_wordgames_best")||0);}catch{return 0;}});
  const [item,setItem]=useState(()=>shuffle(SCRAMBLE)[0]);
  const [typed,setTyped]=useState("");
  const [feedback,setFeedback]=useState("");
  const [attempts,setAttempts]=useState(0);
  const [solved,setSolved]=useState(false);
  const [scrambleWins,setScrambleWins]=useState(0);
  const [guessTarget,setGuessTarget]=useState(()=>shuffle(WORDS)[0]);
  const [groupWords,setGroupWords]=useState(()=>shuffle(GROUPS.flatMap(group=>group.words)));
  const [selected,setSelected]=useState([]);
  const [found,setFound]=useState([]);
  const [chain,setChain]=useState(["ZAGREB"]);
  const [ladderStep,setLadderStep]=useState(0);
  const todayKey=new Date().toLocaleDateString("sv-SE");
  const dailyKey=`patriasoul_wordgames_daily_${todayKey}`;
  const [dailyGuesses,setDailyGuesses]=useState(()=>{try{return JSON.parse(localStorage.getItem(dailyKey)||"[]");}catch{return [];}});
  const dailyWord=DAILY[(Math.floor(new Date().setHours(0,0,0,0)/86400000))%DAILY.length];
  const dailyWon=dailyGuesses.some(guess=>normalize(guess)===normalize(dailyWord));
  const dailyDone=dailyWon||dailyGuesses.length>=6;
  const scrambled=useMemo(()=>shuffle(item.clean.split("")),[item]);
  const ladder=[{from:"MORE",to:"MORA",clue:"Promijeni jedno slovo: MORE → MORA (genitiv imenice „more”)."},{from:"KOSA",to:"KOLA",clue:"Promijeni jedno slovo: KOSA → KOLA (množina imenice „kolo”)."}];
  const currentLadder=ladder[ladderStep%ladder.length];\n  const filters=["Sve igre","Brze igre","Znanje i logika","Dnevni izazov"];\n  const visibleGames=GAMES.filter(game=>(gameFilter==="Sve igre"||game.type===gameFilter)&&`${game.title} ${game.desc}`.toLocaleLowerCase("hr").includes(gameQuery.trim().toLocaleLowerCase("hr")));

  useEffect(()=>{if(score>best){setBest(score);try{localStorage.setItem("patriasoul_wordgames_best",String(score));}catch{}}},[score,best]);
  useEffect(()=>{try{localStorage.setItem(dailyKey,JSON.stringify(dailyGuesses));}catch{}},[dailyKey,dailyGuesses]);

  const open=(id)=>{
    setActive(id);setTyped("");setFeedback("");setAttempts(0);setSolved(false);setSelected([]);setFound([]);setChain(["ZAGREB"]);setLadderStep(0);setDailyGuesses(id==="daily"?(()=>{try{return JSON.parse(localStorage.getItem(dailyKey)||"[]");}catch{return [];}})():dailyGuesses);
    setItem(shuffle(SCRAMBLE)[0]);setGuessTarget(shuffle(WORDS)[0]);setGroupWords(shuffle(GROUPS.flatMap(group=>group.words)));
  };
  const submitScramble=()=>{
    if(normalize(typed)===item.clean){setSolved(true);setScore(value=>value+20);setScrambleWins(value=>value+1);setFeedback("Točno! Osvojio/la si 20 bodova.");}
    else{setAttempts(value=>value+1);setFeedback("Nije točno. Provjeri slova i pokušaj ponovno.");}
  };
  const nextScramble=()=>{
    const pool=SCRAMBLE.filter(word=>word.clean.length>=Math.min(4+Math.floor(scrambleWins/3),8));
    const choices=pool.filter(word=>word.word!==item.word);
    setItem(shuffle(choices.length?choices:SCRAMBLE)[0]);setTyped("");setFeedback("");setSolved(false);setAttempts(0);
  };
  const submitGuess=()=>{
    if(normalize(typed)===guessTarget.clean){if(!solved){setSolved(true);setScore(value=>value+15);setFeedback("Bravo! Pogodio/la si riječ i osvojio/la 15 bodova.");}}
    else{const next=attempts+1;setAttempts(next);setFeedback(next>=5?`Isteklo je pet pokušaja. Riječ je bila: ${guessTarget.word}.`:"Nije točno. Pokušaj ponovno.");}
  };
  const chooseGroupWord=(word)=>{
    if(selected.includes(word)||found.some(group=>group.words.includes(word)))return;
    const next=[...selected,word];setSelected(next);
    if(next.length===4){const group=GROUPS.find(candidate=>candidate.words.every(value=>next.includes(value)));
      if(group){setFound(value=>[...value,group]);setScore(value=>value+40);setSelected([]);setFeedback(`Pronađena skupina: ${group.title}.`);}
      else{setFeedback("Ove četiri riječi ne pripadaju istoj skupini. Pokušaj ponovno.");setSelected([]);}
    }
  };
  const addChain=()=>{
    const word=normalize(typed),last=normalize(chain[chain.length-1]);
    if(word.length<2||word[0]!==last.slice(-1)||!WORDS.some(candidate=>candidate.clean===word)){setFeedback("Riječ mora početi zadnjim slovom prethodne i nalaziti se u rječniku igre.");return;}
    if(chain.some(value=>normalize(value)===word)){setFeedback("Tu smo riječ već upotrijebili.");return;}
    setChain(value=>[...value,typed.trim().toLocaleUpperCase("hr")]);setTyped("");setFeedback("Odlično! Lanac se nastavlja.");setScore(value=>value+10);
  };
  const submitDaily=()=>{
    if(normalize(typed).length!==normalize(dailyWord).length){setFeedback(`Riječ mora imati ${[...dailyWord].length} slova.`);return;}
    const guess=typed.trim().toLocaleUpperCase("hr");
    if(dailyGuesses.some(value=>normalize(value)===normalize(guess))){setFeedback("Taj si pokušaj već upisao/la.");return;}
    const next=[...dailyGuesses,guess];setDailyGuesses(next);setTyped("");
    if(normalize(guess)===normalize(dailyWord)){setFeedback("Pogodak! Osvojio/la si 50 bodova.");setScore(value=>value+50);}
    else setFeedback(next.length>=6?`Današnja riječ bila je: ${dailyWord}.`:"Nije točno. Pokušaj ponovno.");
  };
  const checkLadder=()=>{
    if(normalize(typed)===normalize(currentLadder.to)){setScore(value=>value+25);setFeedback("Točno! Osvojio/la si 25 bodova.");setLadderStep(value=>value+1);setTyped("");}
    else setFeedback("Pokušaj ponovno. Promijeni samo jedno slovo.");
  };

  if(active==="classic") return <RijeciDomovine onBack={()=>setActive(null)} playerName={playerName}/>;
  if(active==="search") return <WordSearch onBack={()=>setActive(null)}/>;
  if(!active) return <main className="mx-auto max-w-6xl px-4 py-5 sm:px-6 sm:py-9">
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><button onClick={onBack} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 text-sm font-bold text-white/80 transition hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-200"><ArrowLeft className="h-4 w-4"/> Natrag na kviz</button><span className="text-[11px] font-bold tracking-[.16em] text-amber-200">PATRIA SOUL · ČUVARI NASLJEĐA</span></div>
    <header className="relative overflow-hidden rounded-3xl border border-amber-300/20 bg-gradient-to-br from-[#102d4a] via-[#0b1d32] to-[#071426] p-5 shadow-2xl sm:p-8"><div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-amber-300/10 blur-3xl"/><div className="relative"><div className="inline-flex items-center gap-2 rounded-full border border-amber-300/30 bg-black/20 px-3 py-1.5 text-xs font-bold tracking-widest text-amber-200"><Sparkles className="h-4 w-4"/> CENTAR IGARA RIJEČIMA</div><h1 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-5xl">Riječi <span className="text-amber-200">domovine</span></h1><p className="mt-3 max-w-2xl text-sm leading-6 text-white/70 sm:text-base">Odaberi igru i odmah kreni. Svaka kartica otvara baš onu igru koju odabereš.</p><div className="mt-4 flex flex-wrap gap-2 text-[11px] font-bold text-white/65"><span className="rounded-full border border-white/10 px-3 py-2">8 IGARA</span><span className="rounded-full border border-white/10 px-3 py-2">MOBITEL I RAČUNALO</span><span className="rounded-full border border-white/10 px-3 py-2">BODOVI I REKORDI</span></div></div></header>
    <section id="popis-igara" className="mt-5 scroll-mt-4" aria-label="Odabir igre">
      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="text-xl font-black text-white">Odaberi igru</h2><p className="mt-1 text-xs text-white/55">Dodirni karticu ili tipku „Otvori igru”.</p></div><label className="relative block w-full sm:max-w-xs"><span className="sr-only">Pretraži igre</span><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/45"/><input value={gameQuery} onChange={event=>setGameQuery(event.target.value)} placeholder="Pronađi igru..." className="min-h-12 w-full rounded-xl border border-white/15 bg-[#09182a] pl-10 pr-10 text-sm text-white outline-none placeholder:text-white/40 focus:border-amber-200 focus:ring-2 focus:ring-amber-200/20"/>{gameQuery&&<button type="button" onClick={()=>setGameQuery("")} aria-label="Očisti pretragu" className="absolute right-2 top-1/2 min-h-9 min-w-9 -translate-y-1/2 rounded-lg text-white/60 hover:bg-white/10">×</button>}</label></div>
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-2" role="group" aria-label="Filtriraj igre">{filters.map(filter=><button key={filter} type="button" onClick={()=>setGameFilter(filter)} aria-pressed={gameFilter===filter} className={`min-h-10 shrink-0 rounded-full border px-4 text-xs font-bold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-200 ${gameFilter===filter?"border-amber-200 bg-amber-200 text-slate-950":"border-white/15 bg-white/5 text-white/75 hover:bg-white/10"}`}>{filter}</button>)}</div>
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3" aria-live="polite">{visibleGames.map((game,index)=>{const Icon=game.icon;return <button key={game.id} type="button" onClick={()=>open(game.id)} aria-label={`Otvori igru: ${game.title}`} className="group flex min-h-32 w-full items-center gap-4 rounded-2xl border border-white/10 bg-gradient-to-br from-white/[.08] to-white/[.025] p-4 text-left shadow-lg transition hover:border-amber-200/50 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-200 active:scale-[.99]"><span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-amber-200/25 bg-black/20 text-amber-200"><Icon className="h-5 w-5"/></span><span className="min-w-0 flex-1"><span className="block text-[10px] font-black tracking-[.15em] text-amber-200">{game.tag}</span><strong className="mt-1 block text-lg leading-tight text-white">{game.title}</strong><span className="mt-1 block text-xs leading-5 text-white/60">{game.desc}</span><span className="mt-3 inline-flex min-h-9 items-center gap-2 rounded-lg bg-amber-200 px-3 text-xs font-black text-slate-950">OTVORI IGRU <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1"/></span></span></button>;})}</div>
      {visibleGames.length===0&&<div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center"><p className="font-bold text-white">Nema pronađene igre.</p><p className="mt-1 text-sm text-white/55">Promijeni pojam ili odaberi drugu skupinu.</p><button onClick={()=>{setGameQuery("");setGameFilter("Sve igre");}} className="mt-4 min-h-11 rounded-xl bg-amber-200 px-4 text-sm font-black text-slate-950">Prikaži sve igre</button></div>}
    </section>
    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[.035] p-4"><div><p className="text-[11px] font-bold uppercase tracking-widest text-white/45">Bodovi u ovom posjetu</p><p className="mt-1 text-2xl font-black text-amber-200">{score}</p></div><div className="flex items-center gap-2 text-sm text-white/65"><Trophy className="h-5 w-5 text-amber-200"/> Osobni rekord: {best}</div></div>
  </main>;
  return <Frame title={GAMES.find(game=>game.id===active)?.title||"Igra"} subtitle="Riječi domovine · uči kroz igru" onBack={()=>setActive(null)}>
    {active==="scramble"&&<><div className="rounded-xl border border-white/10 bg-white/5 p-4 text-center"><p className="text-xs font-bold tracking-widest text-amber-200">POMOĆ · {item.group} · RAZINA {Math.min(1+Math.floor(scrambleWins/3),3)}</p><p className="mt-2 text-white/70">{item.clue}</p><div className="mt-5 flex flex-wrap justify-center gap-2">{scrambled.map((letter,index)=><span key={index} className="flex h-11 w-10 items-center justify-center rounded-lg border border-amber-200/30 bg-amber-200/10 text-xl font-black text-white">{letter}</span>)}</div></div><input aria-label="Sastavi riječ" value={typed} onChange={event=>setTyped(event.target.value)} onKeyDown={event=>event.key==="Enter"&&submitScramble()} placeholder="Sastavi riječ..." className="mt-4 w-full rounded-xl border border-white/15 bg-black/20 px-4 py-3 text-white"/><button onClick={submitScramble} disabled={!typed.trim()||solved} className="mt-3 w-full rounded-xl bg-amber-200 px-4 py-3 font-black text-slate-950 disabled:opacity-40">Provjeri odgovor</button>{feedback&&<p role="status" className="mt-3 text-sm text-amber-100">{feedback}</p>}{solved&&<button onClick={nextScramble} className="mt-3 w-full rounded-xl border border-white/15 px-4 py-3 font-bold text-white">Sljedeća riječ →</button>}</>}
    {active==="guess"&&<><p className="rounded-xl bg-white/5 p-4 text-white/75">{guessTarget.clue}</p><input aria-label="Pogodi riječ" value={typed} onChange={event=>setTyped(event.target.value)} onKeyDown={event=>event.key==="Enter"&&attempts<5&&!solved&&submitGuess()} placeholder="Koja je riječ?" disabled={solved||attempts>=5} className="mt-4 w-full rounded-xl border border-white/15 bg-black/20 px-4 py-3 text-white"/><button onClick={submitGuess} disabled={!typed.trim()||solved||attempts>=5} className="mt-3 w-full rounded-xl bg-amber-200 px-4 py-3 font-black text-slate-950 disabled:opacity-40">Pogodi</button><p className="mt-3 text-sm text-white/60">Pokušaji: {attempts}/5</p>{feedback&&<p role="status" className="mt-2 text-sm text-amber-100">{feedback}</p>}{(solved||attempts>=5)&&<button onClick={()=>{setGuessTarget(shuffle(WORDS)[0]);setTyped("");setFeedback("");setAttempts(0);setSolved(false);}} className="mt-3 w-full rounded-xl border border-white/15 px-4 py-3 font-bold text-white">Nova riječ</button>}</>}
    {active==="groups"&&<><p className="mb-4 text-sm text-white/65">Odaberi četiri riječi koje pripadaju istoj skupini. Pronađeno: {found.length}/4.</p><div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{groupWords.map(word=><button key={word} type="button" aria-pressed={selected.includes(word)} onClick={()=>chooseGroupWord(word)} disabled={found.some(group=>group.words.includes(word))} className={`rounded-xl border px-2 py-4 text-sm font-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-200 ${selected.includes(word)?"border-amber-200 bg-amber-200 text-slate-950":"border-white/10 bg-white/5 text-white"}`}>{word}</button>)}</div>{found.map(group=><div key={group.title} className="mt-3 rounded-xl border border-emerald-300/25 bg-emerald-300/10 p-3 text-emerald-100"><strong>{group.title}</strong><p className="text-sm">{group.words.join(" · ")}</p></div>)}{feedback&&<p role="status" className="mt-3 text-sm text-amber-100">{feedback}</p>}{found.length===4&&<Success>Sve skupine su pronađene!</Success>}</>}
    {active==="chain"&&<><p className="text-sm text-white/65">Zadnje slovo određuje početak sljedeće riječi. Kreni od riječi ZAGREB.</p><div className="my-4 flex flex-wrap gap-2">{chain.map((word,index)=><span key={index} className="rounded-lg border border-amber-200/25 bg-amber-200/10 px-3 py-2 font-black text-amber-100">{word}</span>)}</div><input aria-label="Sljedeća riječ u lancu" value={typed} onChange={event=>setTyped(event.target.value)} onKeyDown={event=>event.key==="Enter"&&addChain()} placeholder={`Riječ na slovo ${normalize(chain[chain.length-1]).slice(-1)}...`} className="w-full rounded-xl border border-white/15 bg-black/20 px-4 py-3 text-white"/><button onClick={addChain} className="mt-3 w-full rounded-xl bg-amber-200 px-4 py-3 font-black text-slate-950">Dodaj riječ</button>{feedback&&<p role="status" className="mt-3 text-sm text-amber-100">{feedback}</p>}</>}
    {active==="ladder"&&<><p className="rounded-xl bg-white/5 p-4 text-white/75">{currentLadder.clue}</p><div className="my-5 flex items-center justify-center gap-4 text-3xl font-black text-amber-100"><span>{currentLadder.from}</span><ArrowRight/><span>?</span></div><input aria-label="Nova riječ na ljestvama" value={typed} onChange={event=>setTyped(event.target.value)} placeholder="Nova riječ..." className="w-full rounded-xl border border-white/15 bg-black/20 px-4 py-3 text-white"/><button onClick={checkLadder} className="mt-3 w-full rounded-xl bg-amber-200 px-4 py-3 font-black text-slate-950">Provjeri</button>{feedback&&<p role="status" className="mt-3 text-sm text-amber-100">{feedback}</p>}</>}
    {active==="daily"&&<><p className="text-sm text-white/65">Tajna riječ ima {[...dailyWord].length} slova. Pokušaj je pogoditi u šest pokušaja. Današnji pokušaji čuvaju se na ovom uređaju.</p><input aria-label="Današnja riječ" value={typed} onChange={event=>setTyped(event.target.value.toLocaleUpperCase("hr"))} onKeyDown={event=>event.key==="Enter"&&!dailyDone&&submitDaily()} disabled={dailyDone} maxLength={[...dailyWord].length} placeholder="Upiši riječ..." className="mt-4 w-full rounded-xl border border-white/15 bg-black/20 px-4 py-3 text-white"/><button onClick={submitDaily} disabled={dailyDone||!typed.trim()} className="mt-3 w-full rounded-xl bg-amber-200 px-4 py-3 font-black text-slate-950 disabled:opacity-40">Provjeri riječ</button><div className="mt-4 space-y-2">{dailyGuesses.map((guess,index)=><div key={index} className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 font-black tracking-[.2em] text-white">{guess}</div>)}</div>{feedback&&<p role="status" className="mt-3 text-sm text-amber-100">{feedback}</p>}{dailyDone&&<Success>{dailyWon?"Bravo! Pronašao/la si današnju riječ.":`Današnja riječ bila je: ${dailyWord}`}</Success>}</>}
  </Frame>;
}
