import { useState } from "react";
import { puter } from "@heyputer/puter.js";
import { Copy, ImagePlus, LoaderCircle, Sparkles } from "lucide-react";
import "./virtual-museum-puter.css";

function responseText(reply) {
  const content = reply?.message?.content ?? reply?.text ?? reply?.content ?? reply;
  if (typeof content === "string") return content;
  if (Array.isArray(content)) return content.map((part) => part?.text || "").filter(Boolean).join("\n");
  return String(content ?? "AI nije vratio čitljiv odgovor.");
}

export default function MuseumPuterAssistant() {
  const [result, setResult] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [memoryImages, setMemoryImages] = useState([]);
  const [memoryTitle, setMemoryTitle] = useState("");
  const [memoryPlace, setMemoryPlace] = useState("");
  const [memoryYear, setMemoryYear] = useState("");
  const [memoryStory, setMemoryStory] = useState("");
  const [memoryBusy, setMemoryBusy] = useState(false);

  function chooseMemoryImages(event) {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    const remaining = Math.max(0, 10 - memoryImages.length);
    const selected = files.slice(0, remaining);
    if (!selected.length) { setError("Možeš učitati najviše 10 fotografija odjednom."); event.target.value = ""; return; }
    if (selected.some((file) => !file.type.startsWith("image/"))) { setError("Odaberi samo slikovne datoteke."); event.target.value = ""; return; }
    if (selected.some((file) => file.size > 10 * 1024 * 1024)) { setError("Svaka fotografija može imati najviše 10 MB."); event.target.value = ""; return; }
    Promise.all(selected.map((file) => new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve({ name: file.name, dataUrl: String(reader.result || "") });
      reader.onerror = () => reject(new Error("Jedna od fotografija nije se mogla učitati."));
      reader.readAsDataURL(file);
    }))).then((loaded) => {
      setMemoryImages((previous) => [...previous, ...loaded].slice(0, 10));
      setError("");
      setStatus("Fotografije su spremne za pregled. Još nisu poslane na AI analizu niti spremljene u muzejsku zbirku.");
    }).catch((err) => setError(err.message || "Fotografije se nisu mogle učitati."));
    event.target.value = "";
  }

  async function analyzeMemoryImage() {
    if (!memoryImages.length || memoryBusy) return;
    setMemoryBusy(true); setError(""); setStatus(""); setResult("");
    const context = [memoryTitle && "Naslov: " + memoryTitle, memoryPlace && "Mjesto: " + memoryPlace, memoryYear && "Godina/razdoblje: " + memoryYear, memoryStory && "Priča korisnika: " + memoryStory].filter(Boolean).join("\n");
    try {
      const imageNotes = await Promise.all(memoryImages.map(async (image, index) => {
        try {
          const notes = await puter.ai.img2txt(image.dataUrl);
          return "FOTOGRAFIJA " + (index + 1) + " — " + image.name + ": " + String(notes || "Nije dobiven tekstualni opis.");
        } catch {
          return "FOTOGRAFIJA " + (index + 1) + " — " + image.name + ": analiza slike nije uspjela; nemoj nagađati njezin sadržaj.";
        }
      }));
      const reply = await puter.ai.chat([
        { role: "system", content: "Ti si Digitalni kustos PatriaSoul, asistent Virtualnog muzeja PatriaSoul. Odgovaraj na hrvatskom. Opis slike ili OCR može biti pogrešan. Ne identificiraj osobe, ne potvrđuj autentičnost, točnu godinu, mjesto, autorstvo ili podrijetlo bez dokaza. Odvoji vidljive detalje od korisnikovih tvrdnji i hipoteza. Ne izmišljaj činjenice ni izvore. Pripremi samo nacrt za ljudsku provjeru; ništa ne spremaj i ne objavljuj." },
        { role: "user", content: `Pripremi muzejske kartice za sve učitane fotografije i na kraju predloži kako bi se mogle povezati u malu virtualnu izložbu. Za svaku fotografiju zasebno navedi naziv datoteke, predloženi naslov, neutralan opis, moguću zbirku, korisnikov kontekst označen kao nepotvrđeno svjedočanstvo, nedostajuće metapodatke, pitanja za korisnika, što se ne može zaključiti samo iz slike te napomenu o pravima i privatnosti. Zatim predloži naslov izložbe, kratak uvod, tematski redoslijed eksponata i kratke natpise. Ako fotografije nisu povezane, reci to i nemoj izmišljati poveznicu. Ne pretvaraj pretpostavke u činjenice.\n\nAnaliza fotografija (može biti netočna):\n${imageNotes.join("\n")}\n\nPodaci korisnika:\n${context || "Nije dodan kontekst."}` }
      ]);
      setResult(responseText(reply));
      setStatus("Digitalni kustos pripremio je nacrte kartica i prijedlog izložbe na temelju učitanih fotografija. Ništa nije spremljeno u muzejsku zbirku niti javno objavljeno. Provjeri opise, činjenice, prava i privatnost.");
    } catch (err) {
      setError("Analiza fotografije trenutačno nije uspjela. Pokušaj ponovno za nekoliko trenutaka. " + (err?.message || ""));
    } finally { setMemoryBusy(false); }
  }

  async function copyResult() {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result);
      setStatus("Nacrt je kopiran. Još nije dodan u muzejsku zbirku.");
      setError("");
    } catch {
      setError("Kopiranje nije uspjelo. Označi tekst nacrta i kopiraj ga ručno.");
    }
  }

  return <section className="museum-puter" aria-labelledby="museum-puter-title">
    <div className="museum-puter-heading">
      <span className="museum-puter-mark"><Sparkles size={20} /></span>
      <div><span className="eyebrow">TVOJ VIRTUALNI MUZEJ</span><h2 id="museum-puter-title">Digitalni kustos PatriaSoul</h2><p>Odaberi fotografije svojih predmeta, dokumenata, obiteljskih uspomena ili mjesta. Kustos će za svaki prilog predložiti muzejsku karticu i, ako postoji stvarna poveznica, nacrt zajedničke izložbe.</p></div>
    </div>
    <section className="museum-memory-upload" aria-labelledby="museum-memory-title">
      <div className="museum-memory-title-row"><ImagePlus size={20} /><div><h3 id="museum-memory-title">Dodaj svoju uspomenu</h3><p>Učitaj fotografiju i zatraži pomoć AI kustosa pri pripremi muzejske kartice.</p></div></div>
      <label className="museum-puter-label" htmlFor="museum-memory-file">Fotografije (do 10 slika, najviše 10 MB po slici)</label>
      <input id="museum-memory-file" className="museum-memory-file" type="file" accept="image/*" multiple onChange={chooseMemoryImages} />
      {memoryImages.length > 0 && <div className="museum-memory-gallery">{memoryImages.map((image, index) => <div className="museum-memory-preview" key={image.name + index}><img src={image.dataUrl} alt={"Pregled fotografije " + (index + 1)} /><div><strong>{image.name}</strong><small>Privremeni pregled · nije spremljeno</small><button type="button" className="museum-memory-remove" onClick={() => setMemoryImages((previous) => previous.filter((_, i) => i !== index))}>Ukloni fotografiju</button></div></div>)}</div>}
      <div className="museum-memory-fields">
        <label>Naslov (neobavezno)<input className="museum-puter-input" value={memoryTitle} onChange={(event) => setMemoryTitle(event.target.value)} maxLength={160} placeholder="Npr. Obiteljska fotografija" /></label>
        <label>Mjesto (ako je poznato)<input className="museum-puter-input" value={memoryPlace} onChange={(event) => setMemoryPlace(event.target.value)} maxLength={160} placeholder="Grad, selo ili kraj" /></label>
        <label>Godina ili razdoblje<input className="museum-puter-input" value={memoryYear} onChange={(event) => setMemoryYear(event.target.value)} maxLength={100} placeholder="Npr. oko 1960. — nepotvrđeno" /></label>
      </div>
      <label className="museum-puter-label" htmlFor="museum-memory-story">Priča koju želiš sačuvati</label>
      <textarea id="museum-memory-story" className="museum-puter-textarea" value={memoryStory} onChange={(event) => setMemoryStory(event.target.value)} maxLength={3000} rows={3} placeholder="Što znaš o fotografiji ili predmetu? Nemoj unositi osjetljive osobne podatke." />
      <button type="button" className="museum-puter-action" onClick={analyzeMemoryImage} disabled={!memoryImages.length || memoryBusy}><ImagePlus size={17} />{memoryBusy ? "AI priprema kartice i izložbu…" : "Pripremi kartice i prijedlog izložbe"}</button>
      <p className="museum-puter-privacy">Fotografija se šalje vanjskoj AI usluzi radi analize tek kada odabereš gumb za pomoć. Ne dodaje se automatski u muzejsku zbirku niti se šalje uredništvu. Prije javne objave provjeri imaš li pravo dijeliti fotografiju i poštuje li se privatnost prikazanih osoba.</p>
    </section>
    <p className="museum-puter-privacy">Kada zatražiš pomoć, tekst i fotografija koje odabereš obrađuju se putem vanjske AI usluge. Nemoj slati lozinke, osobne dokumente ni druge povjerljive podatke. Prijedlozi se ne dodaju automatski u muzejsku zbirku i ne objavljuju se bez tvoje provjere.</p>
    {error && <div className="museum-puter-message error" role="alert">{error}</div>}
    {status && <div className="museum-puter-message" role="status">{status}</div>}
    {busy && <div className="museum-puter-busy"><LoaderCircle size={18} className="museum-puter-spin" /> Digitalni kustos PatriaSoul priprema nacrt…</div>}
    {result && <section className="museum-puter-result" aria-label="AI nacrt"><div className="museum-puter-result-head"><strong>Prijedlog za pregled · još nije muzejski zapis</strong><button type="button" onClick={copyResult}><Copy size={15} /> Kopiraj nacrt</button></div><pre>{result}</pre></section>}
  </section>;
}
