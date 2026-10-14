import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, Clock, Volume2, VolumeX, BookOpen, Loader2 } from "lucide-react";
import { puter } from "@heyputer/puter.js";
import { getSoundEnabled, setSoundEnabled, playStart, playSelect, playCorrect, playWrong, playTick, playFinish, playResult } from "../lib/soundEffects";
import { submitQuizAnswer } from "../lib/attempts";

const LETTERS = ["A", "B", "C", "D"];

function getAIText(reply) {
  const content = reply?.message?.content ?? reply?.text ?? reply?.content ?? reply;
  if (typeof content === "string") return content.trim();
  if (Array.isArray(content)) return content.map((part) => part?.text || "").filter(Boolean).join("\n").trim();
  return "";
}

function shuffleAnswers(answers = []) {
  const copy = answers.map((text, originalIndex) => ({ text, originalIndex }));
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export default function QuizPlayer({ questions, title, subtitle, timeLimit = 20, attemptId, onComplete, onQuit }) {
  const [index, setIndex] = useState(0);
  const [displayedAnswers, setDisplayedAnswers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [serverCorrectIndex, setServerCorrectIndex] = useState(null);
  const [answerError, setAnswerError] = useState("");
  const [explanation, setExplanation] = useState("");
  const [explanationLoading, setExplanationLoading] = useState(false);
  const [explanationError, setExplanationError] = useState("");
  const [remaining, setRemaining] = useState(timeLimit);
  const [soundEnabled, setSoundEnabledState] = useState(getSoundEnabled);
  const startRef = useRef(Date.now());
  const scoreRef = useRef(0);
  const q = questions[index];
  const progress = questions.length ? ((index + 1) / questions.length) * 100 : 0;

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabledState(next);
    setSoundEnabled(next);
  };

  useEffect(() => {
    if (q?.answers?.length === 4) setDisplayedAnswers(shuffleAnswers(q.answers));
    else setDisplayedAnswers([]);
  }, [q?.id]);

  useEffect(() => {
    if (questions.length) playStart();
  }, [questions.length]);

  useEffect(() => {
    if (!answered && remaining > 0 && remaining <= 5) playTick();
  }, [remaining, answered]);

  useEffect(() => {
    if (!questions.length || answered) return undefined;
    if (remaining <= 0) {
      submitQuizAnswer(attemptId, q.id, -1)
        .then(async (response) => {
          const correctPosition = displayedAnswers.findIndex((answer) => answer.originalIndex === response.correctIndex);
          setSelected(-1);
          setServerCorrectIndex(correctPosition);
          setAnswered(true);
          await explainAnswer({
            question: q.question,
            category: q.category,
            correctAnswer: displayedAnswers[correctPosition]?.text || "Točan odgovor nije dostupan.",
            selectedAnswer: "",
            sourceUrl: q.sourceUrl,
            isCorrect: false,
            timedOut: true
          });
        })
        .catch((error) => setAnswerError(error.message || "Odgovor se nije mogao potvrditi."));
      return undefined;
    }
    const timer = setTimeout(() => setRemaining((v) => v - 1), 1000);
    return () => clearTimeout(timer);
  }, [remaining, answered, questions.length]);

  async function explainAnswer({ question, category, correctAnswer, selectedAnswer, sourceUrl, isCorrect, timedOut = false }) {
    setExplanation("");
    setExplanationError("");
    setExplanationLoading(true);
    try {
      const reply = await puter.ai.chat([
        {
          role: "system",
          content: "Ti si obrazovni vodič kviza Čuvari nasljeđa. Odgovaraj isključivo na hrvatskom jeziku. Objasni odgovor u 3 do 5 kratkih rečenica, jednostavno i poučno. Točan odgovor već je provjeren poslužiteljem kviza: nemoj ga mijenjati niti ponovno odlučivati koji je odgovor točan. Objasni zašto je naveden odgovor točan, dodaj povijesni ili kulturni kontekst samo ako si dovoljno siguran. Ne izmišljaj datume, osobe, citate ni izvore. Ako detalj nije siguran, reci da ga treba dodatno provjeriti. Ako je priložena poveznica izvora, prikaži je kao izvor za daljnje čitanje, ali nemoj tvrditi da si je otvorio ili provjerio. Ne traži osobne podatke, ne otkrivaj tajne ni druge odgovore iz baze. Vrati samo objašnjenje, bez uvodnih rečenica."
        },
        {
          role: "user",
          content: JSON.stringify({
            kategorija: category || "Hrvatsko opće znanje",
            pitanje: question,
            provjereni_tocan_odgovor: correctAnswer,
            odgovor_igraca: timedOut ? "Vrijeme je isteklo; igrač nije odgovorio." : (selectedAnswer || "Nije odabran odgovor"),
            igrac_je_tocno_odgovorio: Boolean(isCorrect),
            poveznica_izvora: sourceUrl || null,
            zadatak: "Objasni poučno zašto je provjereni točan odgovor ispravan i što je najvažnije zapamtiti."
          })
        }
      ]);
      const text = getAIText(reply);
      if (!text) throw new Error("Puter nije vratio objašnjenje.");
      setExplanation(text);
    } catch (error) {
      setExplanationError("AI objašnjenje trenutačno nije dostupno. Kviz i bodovanje i dalje rade. " + (error?.message || ""));
    } finally {
      setExplanationLoading(false);
    }
  }

  function handleNext() {
    if (!answered || explanationLoading) return;
    setExplanation("");
    setExplanationError("");
    setAnswerError("");
    if (index + 1 < questions.length) {
      setIndex((v) => v + 1);
      setSelected(null);
      setAnswered(false);
      setServerCorrectIndex(null);
      setRemaining(timeLimit);
    } else {
      playFinish();
      playResult();
      onComplete?.({ score: scoreRef.current, total: questions.length, timeSeconds: Math.floor((Date.now() - startRef.current) / 1000) });
    }
  }

  const handleAnswer = async (i) => {
    if (answered || !q || !attemptId) return;
    setSelected(i);
    setAnswerError("");
    playSelect();
    try {
      const answer = displayedAnswers[i];
      if (!answer) throw new Error("Odgovori se još učitavaju. Pokušaj ponovno.");
      const response = await submitQuizAnswer(attemptId, q.id, answer.originalIndex);
      const correctPosition = displayedAnswers.findIndex((item) => item.originalIndex === response.correctIndex);
      setServerCorrectIndex(correctPosition);
      if (response.isCorrect) {
        scoreRef.current += 1;
        playCorrect();
      } else {
        playWrong();
      }
      setAnswered(true);
      await explainAnswer({
        question: q.question,
        category: q.category,
        correctAnswer: displayedAnswers[correctPosition]?.text || "Točan odgovor nije dostupan.",
        selectedAnswer: answer.text,
        sourceUrl: q.sourceUrl,
        isCorrect: response.isCorrect
      });
    } catch (error) {
      setSelected(null);
      setAnswerError(error.message || "Odgovor se nije mogao potvrditi. Pokušaj ponovno.");
    }
  };

  if (!q) {
    return <div className="mx-auto max-w-2xl px-4 py-16 text-center"><h1 className="font-display text-2xl font-bold">Nema dostupnih pitanja.</h1>{onQuit && <button onClick={onQuit} className="patria-button mt-6">Natrag</button>}</div>;
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#0b1020] px-4 py-8 text-white">
      <div className="mx-auto max-w-2xl">
        <div className="mb-2 flex items-center justify-between">
          <div>{subtitle && <div className="text-xs uppercase tracking-[0.2em] text-amber-400/80">{subtitle}</div>}<h1 className="font-display text-2xl font-bold">{title}</h1></div>
          <div className="flex items-center gap-2"><button type="button" onClick={toggleSound} className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-white/70 transition hover:bg-white/10 hover:text-white" aria-label={soundEnabled ? "Isključi zvuk" : "Uključi zvuk"} title={soundEnabled ? "Isključi zvuk" : "Uključi zvuk"}>{soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}</button><div className="flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1.5 text-sm text-white/70"><Clock className="h-4 w-4" />00:{String(Math.max(0, remaining)).padStart(2, "0")}</div></div>
        </div>
        <div className="mb-8 flex items-center gap-3"><div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10"><motion.div className="h-full bg-gradient-to-r from-amber-400 to-red-600" initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.4 }} /></div><div className="whitespace-nowrap text-sm font-medium text-white/70">{index + 1} / {questions.length}</div></div>
        <AnimatePresence mode="wait">
          <motion.div key={q.id ?? index} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }}>
            <h2 className="mb-6 min-h-[3.5rem] font-display text-xl font-semibold leading-snug sm:text-2xl">{q.question}</h2>
            <div className="grid gap-3">
              {displayedAnswers.map((answer, i) => {
                const isCorrect = i === serverCorrectIndex;
                const isSelected = i === selected;
                let cls = "border-white/15 bg-white/5 hover:border-white/30 hover:bg-white/10";
                if (answered) cls = isCorrect ? "border-green-400 bg-green-400/15 text-white" : isSelected ? "border-red-500 bg-red-500/15 text-white" : "border-white/10 bg-white/5 opacity-50";
                return <button key={`${q.id}-${i}`} onClick={() => handleAnswer(i)} disabled={answered} className={`flex w-full items-center gap-3 rounded-xl border-2 px-4 py-4 text-left transition-all ${cls} ${!answered ? "active:scale-[0.99]" : ""}`}><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 text-sm font-bold">{LETTERS[i]}</span><span className="flex-1 font-medium">{answer.text}</span>{answered && isCorrect && <Check className="h-5 w-5 text-green-400" />}{answered && isSelected && !isCorrect && <X className="h-5 w-5 text-red-400" />}</button>;
              })}
            </div>
            {answerError && <div className="mt-6 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{answerError}</div>}
            {answered && <div className="mt-6 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80">{selected === -1 ? "Vrijeme je isteklo. Odgovor se smatra netočnim." : selected === serverCorrectIndex ? "Točan odgovor!" : "Netočan odgovor. Točan odgovor je označen."}</div>}
            {answered && <section className="mt-4 rounded-2xl border border-sky-300/20 bg-sky-400/[0.07] p-4 sm:p-5" aria-live="polite">
              <div className="mb-3 flex items-center gap-2 text-sky-200"><BookOpen className="h-5 w-5" /><h3 className="font-semibold">Puter objašnjava</h3></div>
              {explanationLoading && <div className="flex items-center gap-2 text-sm text-white/70"><Loader2 className="h-4 w-4 animate-spin" />Pripremam kratko objašnjenje na hrvatskom…</div>}
              {explanation && <p className="whitespace-pre-line text-sm leading-6 text-white/85">{explanation}</p>}
              {explanationError && <div className="text-sm text-amber-100"><p>{explanationError}</p><button type="button" className="mt-3 rounded-lg border border-white/20 px-3 py-2 hover:bg-white/10" onClick={() => explainAnswer({ question: q.question, category: q.category, correctAnswer: displayedAnswers[serverCorrectIndex]?.text || "Točan odgovor nije dostupan.", selectedAnswer: selected >= 0 ? displayedAnswers[selected]?.text : "", sourceUrl: q.sourceUrl, isCorrect: selected >= 0 && selected === serverCorrectIndex, timedOut: selected === -1 })}>Pokušaj ponovno</button></div>}
              {!explanationLoading && <button type="button" onClick={handleNext} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-700 px-4 py-3 font-semibold text-white transition hover:brightness-110">{index + 1 < questions.length ? "Sljedeće pitanje" : "Prikaži rezultat"} <span aria-hidden="true">→</span></button>}
            </section>}
          </motion.div>
        </AnimatePresence>
        {onQuit && <button onClick={onQuit} className="mt-8 text-sm text-white/40 transition-colors hover:text-white/70">Odustani</button>}
      </div>
    </div>
  );
}
