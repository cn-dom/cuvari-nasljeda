import { useEffect, useState } from "react";
import { puter } from "@heyputer/puter.js";
import { Copy, FolderOpen, ImagePlus, LoaderCircle, Save, Sparkles, Trash2 } from "lucide-react";
import { isSupabaseConfigured, supabase } from "./lib/supabase.js";
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
  const [saving, setSaving] = useState(false);
  const [savedMuseums, setSavedMuseums] = useState([]);
  const [openedMuseum, setOpenedMuseum] = useState(null);
  const [loadingMuseums, setLoadingMuseums] = useState(false);

  useEffect(() => {
    let active = true;
    async function loadSavedMuseums() {
      if (!isSupabaseConfigured || !supabase) return;
      setLoadingMuseums(true);
      try {
        const { data: authData } = await supabase.auth.getUser();
        if (!authData?.user) return;
        const { data, error: loadError } = await supabase
          .from("virtual_museums")
          .select("id, title, description, introduction, ai_draft, status, created_at, updated_at")
          .order("updated_at", { ascending: false })
          .limit(30);
        if (loadError) throw loadError;
        if (active) setSavedMuseums(data || []);
      } catch (err) {
        if (active) setError("Nije moguće učitati spremljene muzeje. " + (err?.message || ""));
      } finally {
        if (active) setLoadingMuseums(false);
      }
    }
    loadSavedMuseums();
    return () => { active = false; };
  }, []);

  async function saveMuseum() {
    if (saving || (!memoryImages.length && !openedMuseum) || !result.trim()) return;
    if (!isSupabaseConfigured || !supabase) {
      setError("Spremanje nije dostupno jer Supabase nije konfiguriran.");
      return;
    }
    setSaving(true);
    setError("");
    setStatus("");
    let createdMuseumId = null;
    const uploadedPaths = [];
    try {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      const user = authData?.user;
      if (!user) throw new Error("Za spremanje vlastitog muzeja moraš biti prijavljen/a.");
      const museumTitle = memoryTitle.trim() || "Moj virtualni muzej";
      if (openedMuseum?.id) {
        const { data: updatedMuseum, error: updateError } = await supabase
          .from("virtual_museums")
          .update({
            title: museumTitle,
            description: memoryStory.trim().slice(0, 1200),
            introduction: result.trim().slice(0, 3000),
            ai_draft: result.trim(),
            status: "review",
            updated_at: new Date().toISOString()
          })
          .eq("id", openedMuseum.id)
          .select("id, title, description, introduction, ai_draft, status, created_at, updated_at")
          .single();
        if (updateError) throw updateError;
        setSavedMuseums((previous) => previous.map((item) => item.id === updatedMuseum.id ? updatedMuseum : item));
        setOpenedMuseum((previous) => previous ? { ...previous, ...updatedMuseum } : previous);
        setStatus("Izmjene tvog privatnog muzeja spremljene su. Muzej i fotografije nisu javno objavljeni.");
        return;
      }
      if (!memoryImages.length) throw new Error("Dodaj barem jednu fotografiju za stvaranje novog muzeja.");
      const { data: museum, error: museumError } = await supabase
        .from("virtual_museums")
        .insert({
          owner_id: user.id,
          title: museumTitle,
          description: memoryStory.trim().slice(0, 1200),
          introduction: result.trim().slice(0, 3000),
          ai_draft: result.trim(),
          status: "review"
        })
        .select("id, title, description, introduction, ai_draft, status, created_at, updated_at")
        .single();
      if (museumError) throw museumError;
      createdMuseumId = museum.id;

      const itemRows = [];
      for (let index = 0; index < memoryImages.length; index += 1) {
        const image = memoryImages[index];
        const blob = await (await fetch(image.dataUrl)).blob();
        const safeName = image.name.replace(/[^a-zA-Z0-9._-]+/g, "-").slice(-100) || "fotografija";
        const imagePath = user.id + "/" + museum.id + "/" + Date.now() + "-" + index + "-" + safeName;
        const { error: uploadError } = await supabase.storage
          .from("virtual-museum")
          .upload(imagePath, blob, { contentType: image.type || blob.type || "image/jpeg", upsert: false });
        if (uploadError) throw uploadError;
        uploadedPaths.push(imagePath);
        itemRows.push({
          museum_id: museum.id,
          owner_id: user.id,
          title: memoryImages.length === 1 && memoryTitle.trim()
            ? memoryTitle.trim()
            : image.name.replace(/\.[^.]+$/, "").slice(0, 180) || "Muzejski predmet",
          description: "",
          story: memoryStory.trim(),
          place: memoryPlace.trim(),
          date_label: memoryYear.trim(),
          theme: "",
          image_path: imagePath,
          sort_order: index
        });
      }
      const { error: itemsError } = await supabase.from("virtual_museum_items").insert(itemRows);
      if (itemsError) throw itemsError;
      setSavedMuseums((previous) => [museum, ...previous.filter((item) => item.id !== museum.id)].slice(0, 30));
      setOpenedMuseum(null);
      setStatus("Muzej je spremljen kao privatan nacrt. Fotografije i podaci vidljivi su samo tebi; ništa nije javno objavljeno.");
    } catch (err) {
      if (uploadedPaths.length) {
        try { await supabase.storage.from("virtual-museum").remove(uploadedPaths); } catch {}
      }
      if (createdMuseumId) {
        try { await supabase.from("virtual_museums").delete().eq("id", createdMuseumId); } catch {}
      }
      setError("Muzej nije spremljen. " + (err?.message || "Provjeri vezu i pokušaj ponovno."));
    } finally {
      setSaving(false);
    }
  }

  async function openSavedMuseum(museum) {
    if (!supabase) return;
    setError("");
    setStatus("");
    try {
      const { data: items, error: itemsError } = await supabase
        .from("virtual_museum_items")
        .select("id, title, description, story, place, date_label, theme, image_path, sort_order")
        .eq("museum_id", museum.id)
        .order("sort_order", { ascending: true });
      if (itemsError) throw itemsError;
      const itemsWithUrls = await Promise.all((items || []).map(async (item) => {
        const { data, error: urlError } = await supabase.storage.from("virtual-museum").createSignedUrl(item.image_path, 3600);
        return { ...item, signedUrl: urlError ? "" : data?.signedUrl || "" };
      }));
      setOpenedMuseum({ ...museum, items: itemsWithUrls });
      setMemoryImages([]);
      setResult(museum.ai_draft || "");
      setMemoryTitle(museum.title || "");
      setMemoryStory(museum.description || "");
      setStatus("Otvoren je tvoj privatni nacrt. Za sada je prikaz za pregled; izvorni nacrt nije javno objavljen.");
    } catch (err) {
      setError("Nije moguće otvoriti ovaj muzej. " + (err?.message || ""));
    }
  }

  async function deleteSavedMuseum(museum) {
    if (!supabase || !window.confirm("Želiš li trajno obrisati ovaj privatni muzej i njegove fotografije?")) return;
    setError("");
    setStatus("");
    try {
      const { data: items, error: itemsError } = await supabase
        .from("virtual_museum_items")
        .select("image_path")
        .eq("museum_id", museum.id);
      if (itemsError) throw itemsError;
      const paths = (items || []).map((item) => item.image_path).filter(Boolean);
      if (paths.length) {
        const { error: storageError } = await supabase.storage.from("virtual-museum").remove(paths);
        if (storageError) throw storageError;
      }
      const { error: deleteError } = await supabase.from("virtual_museums").delete().eq("id", museum.id);
      if (deleteError) throw deleteError;
      setSavedMuseums((previous) => previous.filter((item) => item.id !== museum.id));
      if (openedMuseum?.id === museum.id) setOpenedMuseum(null);
      setStatus("Muzej i njegove fotografije su obrisani.");
    } catch (err) {
      setError("Muzej nije obrisan. " + (err?.message || ""));
    }
  }

  function chooseMemoryImages(event) {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    const remaining = Math.max(0, 10 - memoryImages.length);
    const selected = files.slice(0, remaining);
    if (!selected.length) { setError("Možeš učitati najviše 10 fotografija odjednom."); event.target.value = ""; return; }
    if (selected.some((file) => !["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"].includes(file.type))) { setError("Podržane su JPG, PNG, WebP, GIF i AVIF slike."); event.target.value = ""; return; }
    if (selected.some((file) => file.size > 10 * 1024 * 1024)) { setError("Svaka fotografija može imati najviše 10 MB."); event.target.value = ""; return; }
    Promise.all(selected.map((file) => new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve({ name: file.name, type: file.type, dataUrl: String(reader.result || "") });
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
        { role: "user", content: `Pripremi muzejske kartice za sve učitane fotografije i na kraju predloži kako bi se mogle povezati u malu virtualnu izložbu. Za svaku fotografiju zasebno navedi naziv datoteke, predloženi naslov, neutralan opis, prijedlog tematske skupine unutar korisnikova vlastitog muzeja (samo prijedlog koji korisnik može promijeniti), korisnikov kontekst označen kao nepotvrđeno svjedočanstvo, nedostajuće metapodatke, pitanja za korisnika, što se ne može zaključiti samo iz slike te napomenu o pravima i privatnosti. Zatim predloži naslov izložbe koji korisnik može slobodno promijeniti, kratak uvod, tematski redoslijed eksponata i kratke natpise. Ne nameći unaprijed zadane kategorije; predloži samo teme koje proizlaze iz učitanih fotografija i korisnikove priče. Ako fotografije nisu povezane, reci to i nemoj izmišljati poveznicu. Ne pretvaraj pretpostavke u činjenice.\n\nAnaliza fotografija (može biti netočna):\n${imageNotes.join("\n")}\n\nPodaci korisnika:\n${context || "Nije dodan kontekst."}` }
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
        <label>Naziv tvog muzeja ili izložbe<input className="museum-puter-input" value={memoryTitle} onChange={(event) => setMemoryTitle(event.target.value)} maxLength={120} placeholder="Npr. Obiteljske uspomene" /></label>
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
    {result && <section className="museum-puter-result" aria-label="AI nacrt"><div className="museum-puter-result-head"><strong>Prijedlog za pregled · još nije javno objavljen</strong><div className="museum-puter-actions"><button type="button" onClick={copyResult}><Copy size={15} /> Kopiraj nacrt</button><button type="button" onClick={saveMuseum} disabled={saving || (!memoryImages.length && !openedMuseum)}><Save size={15} />{saving ? "Spremam…" : openedMuseum ? "Spremi izmjene" : "Spremi moj muzej"}</button></div></div><textarea className="museum-puter-result-editor" aria-label="Uredi nacrt virtualnog muzeja" value={result} onChange={(event) => setResult(event.target.value)} maxLength={30000} rows={14} /></section>}

    <section className="museum-saved-list" aria-labelledby="museum-saved-title">
      <div className="museum-memory-title-row"><FolderOpen size={20} /><div><h3 id="museum-saved-title">Moji spremljeni muzeji</h3><p>Privatni nacrti spremljeni na tvom računu.</p></div></div>
      {!isSupabaseConfigured && <p className="museum-puter-privacy">Spremanje će biti dostupno kada se poveže Supabase.</p>}
      {loadingMuseums && <p className="museum-puter-privacy">Učitavam tvoje muzeje…</p>}
      {!loadingMuseums && isSupabaseConfigured && savedMuseums.length === 0 && <p className="museum-puter-privacy">Još nemaš spremljenih muzeja. Pripremi nacrt i odaberi „Spremi moj muzej”.</p>}
      {savedMuseums.map((museum) => <article className="museum-saved-row" key={museum.id}>
        <div><strong>{museum.title}</strong><small>{new Date(museum.created_at).toLocaleDateString("hr-HR")} · Privatni nacrt</small></div>
        <div className="museum-saved-actions"><button type="button" className="museum-puter-action" onClick={() => openSavedMuseum(museum)}><FolderOpen size={15} /> Otvori</button><button type="button" className="museum-memory-remove" onClick={() => deleteSavedMuseum(museum)}><Trash2 size={15} /> Obriši</button></div>
      </article>)}
      {openedMuseum && <div className="museum-saved-detail">
        <div className="museum-puter-result-head"><strong>{openedMuseum.title}</strong><button type="button" onClick={() => setOpenedMuseum(null)}>Zatvori</button></div>
        <p>{openedMuseum.description || "Nije dodana osobna priča."}</p>
        <div className="museum-memory-gallery">{(openedMuseum.items || []).map((item) => <div className="museum-memory-preview" key={item.id}>{item.signedUrl ? <img src={item.signedUrl} alt={item.title} /> : <span aria-hidden="true">📷</span>}<div><strong>{item.title}</strong><small>{[item.place, item.date_label].filter(Boolean).join(" · ") || "Podaci nisu navedeni"}</small></div></div>)}</div>
        <p className="museum-puter-privacy">Možeš urediti naziv, osobnu priču i AI nacrt u poljima iznad, a zatim odabrati „Spremi izmjene”. Fotografije ostaju privatne.</p>
      </div>}
    </section>
  </section>;
}
