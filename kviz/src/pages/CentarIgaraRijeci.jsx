import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, BookOpen, Brain, CalendarDays, Check, Grid3X3, Link2, Search, Shuffle, Sparkles, Trophy } from "lucide-react";
import RijeciDomovine from "./RijeciDomovine";

const BANK = [
  { word:"HRVATSKA", clue:"Država između Jadrana i srednje Europe.", group:"Domovina" },
  { word:"VUKOVAR", clue:"Grad na Dunavu, simbol stradanja i otpora 1991.", group:"Gradovi" },
  { word:"ZAGREB", clue:"Glavni grad Republike Hrvatske.", group:"Gradovi" },
  { word:"DUBROVNIK", clue:"Povijesni grad na jugu, nekoć središte Republike.", group:"Gradovi" },
  { word:"GLAGOLJICA", clue:"Staro slavensko pismo važno za hrvatsku pismenost.", group:"Baština" },
  { word:"PLETER", clue:"Ukrasni motiv isprepletenih traka na kamenu.", group:"Baština" },
  { word:"LICITAR", clue:"Šareno ukrašeni tradicijski predmet od tijesta.", group:"Običaji" },
  { word:"TAMBURICA", clue:"Žičano glazbalo povezano sa slavonskom glazbom.", group:"Glazba" },
  { word:"KRUNICA", clue:"Katolička pobožnost koja razmatra otajstva.", group:"Vjera" },
  { word:"SINJ", clue:"Grad poznat po viteškoj igri Alka.", group:"Gradovi" },
  { word:"OLUJA", clue:"Vojno-redarstvena operacija iz kolovoza 1995.", group:"Povijest" },
  { word:"DOMOVINA", clue:"Zemlja kojoj pripadamo i koju čuvamo.", group:"Domovina" },
  { word:"MORE", clue:"Plavetnilo koje oblikuje hrvatsku obalu.", group:"Priroda" },
  { word:"MASLINA", clue:"Stablo čiji je plod važan dio mediteranske prehrane.", group:"Priroda" },
  { word:"BAŠTINA", clue:"Naslijeđe koje čuvamo i prenosimo.", group:"Baština" },
  { word:"ALKA", clue:"Viteško natjecanje u Sinju.", group:"Običaji" },
  { word:"MOLITVA", clue:"Obraćanje Bogu riječima, mislima ili u tišini.", group:"Vjera" },
  { word:"USKRS", clue:"Najveći kršćanski blagdan.", group:"Vjera" },
];
const normalize = (v) => String(v ?? "").toLocaleUpperCase("hr").replace(/Đ/g,"D").normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^A-Z]/g,"");
const shuffle = (items) => [...items].sort(() => Math.random() - 0.5);
const WORDS = BANK.map((item) => ({...item, clean:normalize(item.word)}));
const SCRAMBLE = WORDS.filter((item) => item.clean.length >= 5 && item.clean.length <= 10);
const GROUPS = [
  {title:"Gradovi",words:["ZAGREB","SINJ","KNIN","VUKOVAR"]},
  {title:"Baština",words:["GLAGOLJICA","PLETER","LICITAR","TAMBURICA"]},
  {title:"Priroda",words:["MORE","MASLINA","DINARA","JADRAN"]},
  {title:"Vjera",words:["MOLITVA","KRUNICA","USKRS","BIBLIJA"]},
];
const DAILY = ["MORE","SINJ","KNIN","OLUJA","PLETER","ZAGREB","VUKOVAR","MASLINA"];
const GAMES = [
  {id:"classic",title:"Riječi domovine",desc:"Složi slova, otkrij značenje i osvajaj bodove.",tag:"IZVORNA IGRA",icon:BookOpen},
  {id:"search",title:"Pronađi riječ",desc:"Pronađi skrivenu riječ u mreži slova.",tag:"OPAŽANJE",icon:Search},
  {id:"scramble",title:"Složi riječ",desc:"Od izmiješanih slova sastavi hrvatski pojam.",tag:"BRZINA",icon:Shuffle},
  {id:"guess",title:"Pogodi riječ",desc:"Otkrij pojam uz pomoć opisa i ograničen broj pokušaja.",tag:"LOGIKA",icon:Brain},
  {id:"groups",title:"Poveži pojmove",desc:"Razvrstaj riječi u četiri smislene skupine.",tag:"POVEZIVANJE",icon:Grid3X3},
  {id:"chain",title:"Lanac riječi",desc:"Svaka nova riječ počinje zadnjim slovom prethodne.",tag:"JEZIČNA VJEŠTINA",icon:Link2},
  {id:"ladder",title:"Ljestve riječi",desc:"Promijeni jedno slovo i pretvori riječ u novu.",tag:"IZAZOV",icon:ArrowRight},
  {id:"daily",title:"Dnevna riječ",desc:"Jedna tajna riječ dnevno. Imaš šest pokušaja.",tag:"SVAKI DAN",icon:CalendarDays},
];
function Frame({title,subtitle,onBack,children}) {
  return <section className="mx-auto max-w-3xl px-4 py-8 sm:px-6"><button onClick={onBack} className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-white/70 hover:text-white"><ArrowLeft className="h-4 w-4"/> Sve igre</button><div className="rounded-3xl border border-white/10 bg-[#0b1c30]/95 p-5 shadow-2xl sm:p-8"><p className="text-xs font-black uppercase tracking-[.2em] text-amber-300">Riječi domovine · igra riječima</p><h1 className="mt-2 text-3xl font-black text-white sm:text-4xl">{title}</h1><p className="mt-2 text-sm text-white/65">{subtitle}</p><div className="mt-7">{children}</div></div></section>;
}
function Success({children}) { return <div className="mt-5 flex items-center gap-2 rounded-xl border border-emerald-300/30 bg-emerald-300/10 p-4 font-semibold text-emerald-200"><Check className="h-5 w-5"/>{children}</div>; }

function WordSearch({onBack}) {
  const target = "HRVATSKA";
  const grid = useMemo(() => {
    const alphabet = "ABCČĆDEFGHIJKLMNOPRSŠTUVZŽ";
    const rows = Array.from({length:8},()=>Array.from({length:8},()=>alphabet[Math.floor(Math.random()*alphabet.length)]));
    [...target].forEach((letter,index)=>{rows[3][index]=letter;});
    return rows;
  },[]);
  const [picked,setPicked] = useState([]);
  const [won,setWon] = useState(false);
  const path = Array.from({length:target.length},(_,i)=>24+i);
  const choose = (cell) => {
    if(won || picked.includes(cell)) return;
    const next=[...picked,cell]; setPicked(next);
    if(next.length===path.length) setWon(next.every((value,index)=>value===path[index]));
  };
  return <Frame title="Pronađi riječ" subtitle="Odaberi slova redom i pronađi skrivenu riječ HRVATSKA." onBack={onBack}>
    <div className="mb-4 text-center text-sm font-bold tracking-[.3em] text-amber-200">H R V A T S K A</div>
    <div className="mx-auto grid max-w-md grid-cols-8 gap-1.5">{grid.flat().map((letter,index)=><button key={index} onClick={()=>choose(index)} className={`aspect-square rounded-lg border text-sm font-black sm:text-lg ${picked.includes(index)?"border-amber-300 bg-amber-300 text-slate-950":"border-white/10 bg-white/5 text-white hover:bg-white/10"}`}>{letter}</button>)}</div>
    {won?<Success>Pronašao/la si riječ HRVATSKA!</Success>:<button onClick={()=>setPicked([])} className="mt-4 text-sm text-white/60 underline">Poništi odabir</button>}
  </Frame>;
}

export default function CentarIgaraRijeci({onBack,playerName}) {
  const [active,setActive]=useState(null);
  const [score,setScore]=useState(0);
  const [item,setItem]=useState(()=>shuffle(SCRAMBLE)[0]);
  const [typed,setTyped]=useState("");
  const [feedback,setFeedback]=useState("");
  const [attempts,setAttempts]=useState(0);
  const [solved,setSolved]=useState(false);
  const [groupWords,setGroupWords]=useState(()=>shuffle(GROUPS.flatMap(g=>g.words)));
  const [selected,setSelected]=useState([]);
  const [found,setFound]=useState([]);
  const [chain,setChain]=useState(["ZAGREB"]);
  const [ladderStep,setLadderStep]=useState(0);
  const [dailyGuesses,setDailyGuesses]=useState([]);
  const [best]=useState(()=>{try{return Number(localStorage.getItem("patriasoul_wordgames_best")||0);}catch{return 0;}});
  const scrambled=useMemo(()=>shuffle(item.clean.split("")),[item]);
  const guessTarget=WORDS[5];
  const dailyWord=DAILY[(new Date().getFullYear()*372+new Date().getMonth()*31+new Date().getDate())%DAILY.length];
  const dailyWon=dailyGuesses.some(g=>normalize(g)===normalize(dailyWord));
  const dailyDone=dailyWon||dailyGuesses.length>=6;
  const ladder=[{from:"MORE",to:"MORA",clue:"Promijeni jedno slovo: veliko vodeno prostranstvo → oblik riječi."},{from:"KOSA",to:"KOLA",clue:"Promijeni jedno slovo: dio tijela → prijevozna sredstva."}];
  const currentLadder=ladder[ladderStep%ladder.length];
  const open=(id)=>{
    setActive(id);setTyped("");setFeedback("");setAttempts(0);setSolved(false);setSelected([]);setFound([]);setChain(["ZAGREB"]);setLadderStep(0);setDailyGuesses([]);setItem(shuffle(SCRAMBLE)[0]);setGroupWords(shuffle(GROUPS.flatMap(g=>g.words)));
  };
  if(active==="classic") return <RijeciDomovine onBack={()=>setActive(null)} playerName={playerName}/>;
  if(active==="search") return <WordSearch onBack={()=>setActive(null)}/>;
  if(!active) return <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3"><button onClick={onBack} className="inline-flex items-center gap-2 text-sm font-bold text-white/70 hover:text-white"><ArrowLeft className="h-4 w-4"/> Natrag na kviz</button><span className="text-xs font-bold tracking-[.18em] text-amber-200">PATRIA SOUL · ČUVARI NASLJEĐA</span></div>
    <header className="relative overflow-hidden rounded-3xl border border-amber-300/20 bg-gradient-to-br from-[#102d4a] via-[#0b1d32] to-[#071426] p-6 shadow-2xl sm:p-10"><div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-amber-300/10 blur-3xl"/><div className="relative"><div className="inline-flex items-center gap-2 rounded-full border border-amber-300/30 bg-black/20 px-3 py-1.5 text-xs font-bold tracking-widest text-amber-200"><Sparkles className="h-4 w-4"/> CENTAR IGARA RIJEČIMA</div><h1 className="mt-5 text-4xl font-black tracking-tight text-white sm:text-6xl">Riječi <span className="text-amber-200">domovine</span></h1><p className="mt-4 max-w-2xl text-base leading-7 text-white/70">Osmisli, poveži i otkrij riječi koje čuvaju naš jezik, povijest i baštinu. Igraj samostalno ili izazovi prijatelja.</p><div className="mt-6 flex flex-wrap gap-3 text-xs font-bold text-white/60"><span className="rounded-full border border-white/10 px-3 py-2">8 RAZLIČITIH IGARA</span><span className="rounded-full border border-white/10 px-3 py-2">POSTUPNA TEŽINA</span><span className="rounded-full border border-white/10 px-3 py-2">BODOVI I REKORDI</span></div></div></header>
    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{GAMES.map((game,index)=>{const Icon=game.icon;return <button key={game.id} onClick={()=>open(game.id)} className="group relative min-h-56 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/[.08] to-white/[.02] p-5 text-left shadow-xl transition hover:-translate-y-1 hover:border-amber-200/40 hover:shadow-2xl"><span className="absolute right-4 top-3 text-4xl font-black text-white/10">{String(index+1).padStart(2,"0")}</span><span className="flex h-11 w-11 items-center justify-center rounded-xl border border-amber-200/25 bg-black/20 text-amber-200"><Icon className="h-5 w-5"/></span><span className="mt-5 block text-[10px] font-black tracking-[.18em] text-amber-200">{game.tag}</span><strong className="mt-2 block text-xl text-white">{game.title}</strong><span className="mt-2 block text-sm leading-6 text-white/60">{game.desc}</span><span className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-white">Igraj <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1"/></span></button>;})}</div>
    <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[.035] p-5"><div><p className="text-xs font-bold uppercase tracking-widest text-white/45">Bodovi u ovom posjetu</p><p className="mt-1 text-2xl font-black text-amber-200">{score}</p></div><div className="flex items-center gap-2 text-sm text-white/55"><Trophy className="h-5 w-5 text-amber-200"/> Osobni rekord: {best}</div></div>
  </main>;
  return <Frame title={GAMES.find(g=>g.id===active)?.title||"Igra"} subtitle="Riječi domovine · uči kroz igru" onBack={()=>setActive(null)}>
    {active==="scramble"&&<><div className="rounded-xl border border-white/10 bg-white/5 p-4 text-center"><p className="text-xs font-bold tracking-widest text-amber-200">POMOĆ · {item.group}</p><p className="mt-2 text-white/70">{item.clue}</p><div className="mt-5 flex flex-wrap justify-center gap-2">{scrambled.map((letter,index)=><span key={index} className="flex h-11 w-10 items-center justify-center rounded-lg border border-amber-200/30 bg-amber-200/10 text-xl font-black text-white">{letter}</span>)}</div></div><input value={typed} onChange={e=>setTyped(e.target.value)} onKeyDown={e=>e.key==="Enter"&&submitScramble()} placeholder="Sastavi riječ..." className="mt-4 w-full rounded-xl border border-white/15 bg-black/20 px-4 py-3 text-white"/><button onClick={submitScramble} disabled={!typed.trim()||solved} className="mt-3 w-full rounded-xl bg-amber-200 px-4 py-3 font-black text-slate-950 disabled:opacity-40">Provjeri odgovor</button>{feedback&&<p className="mt-3 text-sm text-amber-100">{feedback}</p>}{solved&&<button onClick={()=>{setItem(shuffle(SCRAMBLE.filter(w=>w.word!==item.word))[0]||SCRAMBLE[0]);setTyped("");setFeedback("");setSolved(false);}} className="mt-3 w-full rounded-xl border border-white/15 px-4 py-3 font-bold text-white">Sljedeća riječ →</button>}</>}
    {active==="guess"&&<><p className="rounded-xl bg-white/5 p-4 text-white/75">{guessTarget.clue}</p><input value={typed} onChange={e=>setTyped(e.target.value)} onKeyDown={e=>e.key==="Enter"&&submitGuess()} placeholder="Koja je riječ?" className="mt-4 w-full rounded-xl border border-white/15 bg-black/20 px-4 py-3 text-white"/><button onClick={submitGuess} disabled={!typed.trim()||solved||attempts>=5} className="mt-3 w-full rounded-xl bg-amber-200 px-4 py-3 font-black text-slate-950 disabled:opacity-40">Pogodi</button><p className="mt-3 text-sm text-white/60">Pokušaji: {attempts}/5</p>{feedback&&<p className="mt-2 text-sm text-amber-100">{feedback}</p>}</>}
    {active==="groups"&&<><p className="mb-4 text-sm text-white/65">Odaberi četiri riječi koje pripadaju istoj skupini. Pronađeno: {found.length}/4.</p><div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{groupWords.map(word=><button key={word} onClick={()=>chooseGroupWord(word)} disabled={found.some(g=>g.words.includes(word))} className={`rounded-xl border px-2 py-4 text-sm font-black ${selected.includes(word)?"border-amber-200 bg-amber-200 text-slate-950":"border-white/10 bg-white/5 text-white"}`}>{word}</button>)}</div>{found.map(group=><div key={group.title} className="mt-3 rounded-xl border border-emerald-300/25 bg-emerald-300/10 p-3 text-emerald-100"><strong>{group.title}</strong><p className="text-sm">{group.words.join(" · ")}</p></div>)}{feedback&&<p className="mt-3 text-sm text-amber-100">{feedback}</p>}{found.length===4&&<Success>Sve skupine su pronađene!</Success>}</>}
    {active==="chain"&&<><p className="text-sm text-white/65">Zadnje slovo određuje početak sljedeće riječi. Kreni od riječi ZAGREB.</p><div className="my-4 flex flex-wrap gap-2">{chain.map((word,index)=><span key={index} className="rounded-lg border border-amber-200/25 bg-amber-200/10 px-3 py-2 font-black text-amber-100">{word}</span>)}</div><input value={typed} onChange={e=>setTyped(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addChain()} placeholder={`Riječ na slovo ${normalize(chain[chain.length-1]).slice(-1)}...`} className="w-full rounded-xl border border-white/15 bg-black/20 px-4 py-3 text-white"/><button onClick={addChain} className="mt-3 w-full rounded-xl bg-amber-200 px-4 py-3 font-black text-slate-950">Dodaj riječ</button>{feedback&&<p className="mt-3 text-sm text-amber-100">{feedback}</p>}</>}
    {active==="ladder"&&<><p className="rounded-xl bg-white/5 p-4 text-white/75">{currentLadder.clue}</p><div className="my-5 flex items-center justify-center gap-4 text-3xl font-black text-amber-100"><span>{currentLadder.from}</span><ArrowRight/><span>?</span></div><input value={typed} onChange={e=>setTyped(e.target.value)} placeholder="Nova riječ..." className="w-full rounded-xl border border-white/15 bg-black/20 px-4 py-3 text-white"/><button onClick={()=>{if(normalize(typed)===currentLadder.to){setScore(v=>v+25);setFeedback("Točno! Promijenio/la si samo jedno slovo.");setLadderStep(v=>v+1);setTyped("");}else setFeedback("Pokušaj ponovno. Promijeni samo jedno slovo.");}} className="mt-3 w-full rounded-xl bg-amber-200 px-4 py-3 font-black text-slate-950">Provjeri</button>{feedback&&<p className="mt-3 text-sm text-amber-100">{feedback}</p>}</>}
    {active==="daily"&&<><p className="text-sm text-white/65">Tajna riječ ima {dailyWord.length} slova. Pokušaj je pogoditi u šest pokušaja.</p><input value={typed} onChange={e=>setTyped(e.target.value.toLocaleUpperCase("hr"))} onKeyDown={e=>e.key==="Enter"&&!dailyDone&&submitDaily()} disabled={dailyDone} maxLength={dailyWord.length} placeholder="Upiši riječ..." className="mt-4 w-full rounded-xl border border-white/15 bg-black/20 px-4 py-3 text-white"/><button onClick={submitDaily} disabled={dailyDone||!typed.trim()} className="mt-3 w-full rounded-xl bg-amber-200 px-4 py-3 font-black text-slate-950 disabled:opacity-40">Provjeri riječ</button><div className="mt-4 space-y-2">{dailyGuesses.map((guess,index)=><div key={index} className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 font-black tracking-[.2em] text-white">{guess}</div>)}</div>{dailyDone&&<Success>{dailyWon?"Bravo! Pronašao/la si današnju riječ.":`Današnja riječ bila je: ${dailyWord}`}</Success>}</>}
  </Frame>;

  function submitScramble(){if(normalize(typed)===item.clean){setSolved(true);setScore(v=>v+20);setFeedback("Točno! Osvojio/la si 20 bodova.");}else{setAttempts(v=>v+1);setFeedback("Nije točno. Pokušaj ponovno.");}}
  function submitGuess(){if(normalize(typed)===guessTarget.clean){setSolved(true);setScore(v=>v+15);setFeedback("Bravo! Pogodio/la si riječ.");}else{setAttempts(v=>v+1);setFeedback(attempts>=4?`Gotovo! Tražena riječ bila je ${guessTarget.word}.`:"Nije točno. Pokušaj ponovno.");}}
  function chooseGroupWord(word){if(selected.includes(word)||found.some(g=>g.words.includes(word)))return;const next=[...selected,word];setSelected(next);if(next.length===4){const group=GROUPS.find(g=>g.words.every(w=>next.includes(w)));if(group){setFound(v=>[...v,group]);setScore(v=>v+40);setSelected([]);}else{setFeedback("Ove četiri riječi ne pripadaju istoj skupini.");setSelected([]);}}}
  function addChain(){const word=normalize(typed),last=normalize(chain[chain.length-1]);if(word.length<2||word[0]!==last.slice(-1)||!WORDS.some(w=>w.clean===word)){setFeedback("Riječ mora početi zadnjim slovom prethodne i biti u rječniku igre.");return;}if(chain.some(w=>normalize(w)===word)){setFeedback("Tu smo riječ već upotrijebili.");return;}setChain(v=>[...v,typed.trim().toLocaleUpperCase("hr")]);setTyped("");setFeedback("Odlično! Lanac se nastavlja.");setScore(v=>v+10);}
  function submitDaily(){if(normalize(typed).length!==normalize(dailyWord).length){setFeedback(`Riječ mora imati ${dailyWord.length} slova.`);return;}setDailyGuesses(v=>[...v,typed.trim().toLocaleUpperCase("hr")]);setTyped("");setFeedback(normalize(typed)===normalize(dailyWord)?"Pogodak!":"Pokušaj ponovno.");if(normalize(typed)===normalize(dailyWord))setScore(v=>v+50);}
}
