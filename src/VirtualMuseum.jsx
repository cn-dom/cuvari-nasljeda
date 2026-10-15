import { useEffect, useRef, useState } from "react";
import { puter } from "@heyputer/puter.js";
import * as THREE from "three";
import { supabase } from "./lib/supabase.js";
import "./virtual-museum.css";

const exhibits = [
  {
    id: "vucedol", title: "Vučedolska keramička golubica", period: "Eneolitik · približno 3. tisućljeće pr. Kr.", type: "Arheologija",
    description: "Keramička posuda u obliku ptice, poznata kao vučedolska golubica. U stručnim tumačenjima predmet se naziva i jarebicom; zato naziv i interpretaciju treba navoditi uz izvor, a ne kao jedinu moguću interpretaciju.",
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Vucedol_Culture_ceramic_dove_maximized.jpg",
    source: "https://commons.wikimedia.org/wiki/File:Vucedol_Culture_ceramic_dove_maximized.jpg",
    sourceLabel: "Wikimedia Commons · zapis datoteke", credit: "LZMK (podaci navedeni na stranici datoteke)", license: "CC BY-SA 4.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/"
  },
  {
    id: "bascanska", title: "Bašćanska ploča", period: "oko 1100. godine", type: "Glagoljica",
    description: "Kameni natpis iz crkve sv. Lucije u Jurandvoru na otoku Krku, važan spomenik hrvatske glagoljske i jezične povijesti. Ova fotografija služi za upoznavanje s predmetom; nije 3D snimka izvornika.",
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Bascanska_ploca.jpg",
    source: "https://commons.wikimedia.org/wiki/File:Bascanska_ploca.jpg",
    sourceLabel: "Wikimedia Commons · zapis datoteke", credit: "Neoneo13", license: "Javno vlasništvo prema oznaci autora na Wikimedia Commonsu", licenseUrl: "https://commons.wikimedia.org/wiki/File:Bascanska_ploca.jpg"
  },
  {
    id: "pleter", title: "Hrvatski pleter", period: "Srednji vijek · ornamentika", type: "Kamena plastika",
    description: "Pleter je isprepleteni ukrasni motiv koji se pojavljuje u različitim umjetničkim i kamenoklesarskim tradicijama. Ovdje je prikazana grafička shema motiva, a ne konkretan arheološki nalaz.",
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Pleter_dvobojni.svg",
    source: "https://commons.wikimedia.org/wiki/File:Pleter_dvobojni.svg",
    sourceLabel: "Wikimedia Commons · zapis datoteke", credit: "Autor naveden na stranici datoteke", license: "CC BY-SA (točnu inačicu provjeriti na izvornoj stranici)", licenseUrl: "https://commons.wikimedia.org/wiki/File:Pleter_dvobojni.svg"
  },
  {
    id: "novac", title: "Slavonski banovac", period: "Srednji vijek · 13. stoljeće", type: "Numizmatika",
    description: "Primjerak slavonskog banovca zabilježen u kategoriji numizmatike Gradskog muzeja Sombor. Fotografija je ilustrativan prikaz predmeta iz susjedne regionalne povijesti; konačni opis treba dopuniti kataloškim podacima muzeja.",
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Gradski_muzej_Sombor_-_numizmatika,_Slavonski_Banovac_13._vek.jpg",
    source: "https://commons.wikimedia.org/wiki/Category:Exhibits_of_the_Town_Museum_of_Sombor",
    sourceLabel: "Wikimedia Commons · zbirka muzejskih predmeta", credit: "Autor i licenca provjeravaju se na stranici konkretne datoteke", license: "Provjeriti prije daljnjeg korištenja", licenseUrl: "https://commons.wikimedia.org/wiki/Category:Exhibits_of_the_Town_Museum_of_Sombor"
  },
  {
    id: "nosnja", title: "Međimurska tradicijska nošnja", period: "Etnografska baština · Međimurje", type: "Etnografija",
    description: "Fotografija nošnji iz Međimurja povezana je s Etnografskim muzejom u Zagrebu. Odjevne predmete treba opisivati u regionalnom kontekstu, bez pretpostavke da jedna fotografija predstavlja sve inačice nošnje.",
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Nosnje_Medjimurje_EMZ_300109.jpg",
    source: "https://commons.wikimedia.org/wiki/File:Nosnje_Medjimurje_EMZ_300109.jpg",
    sourceLabel: "Wikimedia Commons · zapis datoteke", credit: "Roberta F.", license: "CC BY-SA 3.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0/"
  }
];

function createLabelTexture(title) {
  const canvas = document.createElement("canvas");
  canvas.width = 512; canvas.height = 128;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#f2e7ce"; ctx.fillRect(0, 0, 512, 128);
  ctx.fillStyle = "#342719"; ctx.font = "bold 27px Georgia";
  ctx.textAlign = "center"; ctx.fillText(title.slice(0, 32), 256, 70);
  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

function MuseumScene({ onSelect }) {
  const mountRef = useRef(null);
  const selectRef = useRef(onSelect);
  useEffect(() => { selectRef.current = onSelect; }, [onSelect]);
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#171714");
    scene.fog = new THREE.Fog("#171714", 12, 34);
    const camera = new THREE.PerspectiveCamera(72, mount.clientWidth / mount.clientHeight, 0.1, 100);
    camera.position.set(0, 1.65, 8);
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "low-power" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.7));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);

    scene.add(new THREE.HemisphereLight(0xf7e7c6, 0x25231d, 2.1));
    const ambient = new THREE.AmbientLight(0xffffff, 0.45); scene.add(ambient);
    const ceiling = new THREE.Mesh(new THREE.BoxGeometry(18, .3, 32), new THREE.MeshStandardMaterial({ color: "#373329", roughness: .95 }));
    ceiling.position.set(0, 5.1, -5); scene.add(ceiling);
    const floor = new THREE.Mesh(new THREE.BoxGeometry(18, .25, 32), new THREE.MeshStandardMaterial({ color: "#5b4936", roughness: .72 }));
    floor.position.set(0, -.16, -5); scene.add(floor);
    const wallMat = new THREE.MeshStandardMaterial({ color: "#6c6250", roughness: .92 });
    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(.35, 5.2, 32), wallMat); leftWall.position.set(-8.8, 2.45, -5); scene.add(leftWall);
    const rightWall = leftWall.clone(); rightWall.position.x = 8.8; scene.add(rightWall);
    const backWall = new THREE.Mesh(new THREE.BoxGeometry(17.6, 5.2, .35), wallMat); backWall.position.set(0, 2.45, -21); scene.add(backWall);
    const gold = new THREE.MeshStandardMaterial({ color: "#b99a58", metalness: .55, roughness: .34 });
    const glass = new THREE.MeshPhysicalMaterial({ color: "#d8e1df", transparent: true, opacity: .15, roughness: .08, metalness: .05, transmission: .15, depthWrite: false });
    const objectMaterials = [
      new THREE.MeshStandardMaterial({ color: "#a85c35", roughness: .75 }),
      new THREE.MeshStandardMaterial({ color: "#c7b994", roughness: .8 }),
      new THREE.MeshStandardMaterial({ color: "#b3a16e", roughness: .6 }),
      new THREE.MeshStandardMaterial({ color: "#94764c", metalness: .6, roughness: .28 }),
      new THREE.MeshStandardMaterial({ color: "#8e4b38", roughness: .8 })
    ];
    const clickable = [];
    exhibits.forEach((item, i) => {
      const z = 1 - i * 4.35;
      const x = i % 2 === 0 ? -3.25 : 3.25;
      const base = new THREE.Mesh(new THREE.BoxGeometry(2.45, .18, 1.65), gold);
      base.position.set(x, .42, z); scene.add(base);
      const caseGlass = new THREE.Mesh(new THREE.BoxGeometry(2.32, 1.38, 1.52), glass);
      caseGlass.position.set(x, 1.2, z); scene.add(caseGlass);
      const top = new THREE.Mesh(new THREE.BoxGeometry(2.45, .09, 1.65), gold);
      top.position.set(x, 1.94, z); scene.add(top);
      const object = i === 0
        ? new THREE.Mesh(new THREE.SphereGeometry(.47, 28, 18), objectMaterials[i])
        : i === 1
          ? new THREE.Mesh(new THREE.BoxGeometry(.75, .9, .2), objectMaterials[i])
          : i === 2
            ? new THREE.Mesh(new THREE.TorusKnotGeometry(.34, .12, 90, 12), objectMaterials[i])
            : i === 3
              ? new THREE.Mesh(new THREE.CylinderGeometry(.43, .43, .12, 36), objectMaterials[i])
              : new THREE.Mesh(new THREE.ConeGeometry(.4, .9, 5), objectMaterials[i]);
      object.position.set(x, 1.02, z); object.castShadow = true; object.userData.exhibitId = item.id; scene.add(object); clickable.push(object);
      const label = new THREE.Mesh(new THREE.PlaneGeometry(2.1, .5), new THREE.MeshBasicMaterial({ map: createLabelTexture(item.title), side: THREE.DoubleSide }));
      label.position.set(x, .64, z + .82); label.rotation.x = -.08; scene.add(label);
      const light = new THREE.SpotLight(0xffdf9a, 38, 8, Math.PI / 5, .45, 1.2);
      light.position.set(x, 4.2, z + .2); light.target.position.set(x, 1, z); scene.add(light, light.target);
    });
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const onClick = (event) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hit = raycaster.intersectObjects(clickable, false)[0];
      if (hit?.object?.userData?.exhibitId) selectRef.current(hit.object.userData.exhibitId);
    };
    renderer.domElement.addEventListener("click", onClick);
    const keys = new Set();
    const onKeyDown = (e) => { if (["w","a","s","d","ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(e.key)) { keys.add(e.key.toLowerCase()); if (e.key.startsWith("Arrow")) keys.add(e.key.toLowerCase()); e.preventDefault(); } };
    const onKeyUp = (e) => keys.delete(e.key.toLowerCase());
    window.addEventListener("keydown", onKeyDown); window.addEventListener("keyup", onKeyUp);
    let yaw = 0, pitch = 0, dragging = false, lastX = 0, lastY = 0;
    const onPointerDown = (e) => { if (e.button === 2) { dragging = true; lastX = e.clientX; lastY = e.clientY; } };
    const onPointerMove = (e) => { if (!dragging) return; yaw -= (e.clientX-lastX)*.003; pitch = THREE.MathUtils.clamp(pitch-(e.clientY-lastY)*.002, -.65, .65); lastX=e.clientX; lastY=e.clientY; };
    const onPointerUp = () => { dragging = false; };
    const onContext = (e) => e.preventDefault();
    renderer.domElement.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove); window.addEventListener("pointerup", onPointerUp);
    renderer.domElement.addEventListener("contextmenu", onContext);
    let frame = 0;
    const animate = () => {
      frame = requestAnimationFrame(animate);
      const forward = (keys.has("w") || keys.has("arrowup") ? 1 : 0) - (keys.has("s") || keys.has("arrowdown") ? 1 : 0);
      const side = (keys.has("d") ? 1 : 0) - (keys.has("a") ? 1 : 0);
      const speed = .075;
      camera.position.x += (Math.sin(yaw)*forward + Math.cos(yaw)*side)*speed;
      camera.position.z += (-Math.cos(yaw)*forward + Math.sin(yaw)*side)*speed;
      camera.position.x = THREE.MathUtils.clamp(camera.position.x, -7.9, 7.9);
      camera.position.z = THREE.MathUtils.clamp(camera.position.z, -20, 7.7);
      camera.rotation.order = "YXZ"; camera.rotation.y = yaw; camera.rotation.x = pitch;
      renderer.render(scene, camera);
    };
    animate();
    const resize = () => { if (!mount.clientWidth || !mount.clientHeight) return; camera.aspect = mount.clientWidth/mount.clientHeight; camera.updateProjectionMatrix(); renderer.setSize(mount.clientWidth,mount.clientHeight); };
    const observer = new ResizeObserver(resize); observer.observe(mount);
    return () => {
      cancelAnimationFrame(frame); observer.disconnect(); renderer.domElement.removeEventListener("click", onClick);
      window.removeEventListener("keydown", onKeyDown); window.removeEventListener("keyup", onKeyUp);
      renderer.domElement.removeEventListener("pointerdown", onPointerDown); window.removeEventListener("pointermove", onPointerMove); window.removeEventListener("pointerup", onPointerUp); renderer.domElement.removeEventListener("contextmenu", onContext);
      scene.traverse(obj => { obj.geometry?.dispose(); if (Array.isArray(obj.material)) obj.material.forEach(m=>m.dispose()); else obj.material?.dispose(); });
      renderer.dispose(); renderer.domElement.remove(); 
    };
  }, []);
  return <div className="museum-scene" ref={mountRef} aria-label="Prohodna 3D muzejska dvorana" />;
}

export default function VirtualMuseum() {
  const [activeTab, setActiveTab] = useState("explore");
  const [selectedId, setSelectedId] = useState("vucedol");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Obiteljska baština");
  const [story, setStory] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [aiDraft, setAiDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [saveBusy, setSaveBusy] = useState(false);
  const [draftsBusy, setDraftsBusy] = useState(false);
  const [savedDrafts, setSavedDrafts] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [existingImagePath, setExistingImagePath] = useState(null);
  const [notice, setNotice] = useState("");
  const selected = exhibits.find(item => item.id === selectedId) || exhibits[0];

  async function prepareDraft(event) {
    event.preventDefault();
    if (!title.trim() || !story.trim()) { setNotice("Unesi naziv i ono što znaš o predmetu."); return; }
    if (!window.confirm("Podaci koje uneseš i odabrana fotografija mogu biti poslani Puter AI usluzi radi izrade nacrta. Ne šalji tuđe privatne fotografije ili osjetljive podatke bez dopuštenja. Nastaviti?")) return;
    setBusy(true); setNotice("");
    try {
      const prompt = "Pomozi pripremiti nacrt muzejskog zapisa na hrvatskom. Ne izmišljaj činjenice i jasno odvoji korisnikovo svjedočanstvo od provjerene povijesti. Ne predstavljaj zaključke kao činjenice. Vrati naslov, kratki opis, što još treba provjeriti, moguće ključne riječi i vrste pouzdanih izvora koje treba potražiti. Kategorija: "+category+". Naziv: "+title.trim()+". Podaci vlasnika: "+story.trim()+". Ako nema izvora, jasno napiši da povijesni navodi nisu potvrđeni.";
      const reply = imageFile ? await puter.ai.chat(prompt, { attachments: [imageFile] }) : await puter.ai.chat(prompt);
      setAiDraft(typeof reply === "string" ? reply : (reply?.message?.content || reply?.text || JSON.stringify(reply)));
      setNotice("AI je pripremio nacrt. Provjeri ga prije spremanja ili javne objave.");
    } catch (error) {
      setNotice("Puter AI nije dostupan trenutačno. "+(error?.message || "Pokušaj ponovno."));
    } finally { setBusy(false); }
  }

  async function getCurrentUser() {
    if (!supabase) throw new Error("Supabase nije konfiguriran.");
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    if (!data?.session?.user) throw new Error("Za privatne nacrte prvo se prijavi u Čuvare nasljeđa.");
    return data.session.user;
  }

  async function loadSavedDrafts() {
    setDraftsBusy(true);
    try {
      const user = await getCurrentUser();
      const { data, error } = await supabase.from("museum_user_drafts")
        .select("id,title,category,story,ai_draft,image_path,status,created_at,updated_at")
        .eq("owner_id", user.id).order("updated_at", { ascending: false });
      if (error) throw error;
      setSavedDrafts(data || []);
    } catch (error) {
      setNotice("Privatne nacrte nije moguće učitati. " + (error?.message || ""));
    } finally { setDraftsBusy(false); }
  }

  async function openSavedDraft(draft) {
    setEditingId(draft.id);
    setTitle(draft.title || "");
    setCategory(draft.category || "Obiteljska baština");
    setStory(draft.story || "");
    setAiDraft(draft.ai_draft || "");
    setExistingImagePath(draft.image_path || null);
    setImageFile(null);
    setImagePreview("");
    setNotice("Uređuješ privatni nacrt. Promjene neće biti javno objavljene.");
    setActiveTab("create");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetDraftEditor() {
    setEditingId(null); setExistingImagePath(null);
    setTitle(""); setCategory("Obiteljska baština"); setStory("");
    setAiDraft(""); setImageFile(null); setImagePreview("");
    setNotice("Otvoren je novi nacrt.");
  }

  async function savePrivateDraft() {
    setSaveBusy(true); setNotice("");
    let uploadedPath = null;
    try {
      const user = await getCurrentUser();
      let imagePath = existingImagePath;
      if (imageFile) {
        const safeName = imageFile.name.replace(/[^a-zA-Z0-9._-]/g, "-").slice(-100) || "predmet.jpg";
        uploadedPath = user.id + "/" + crypto.randomUUID() + "-" + safeName;
        const { error: uploadError } = await supabase.storage.from("virtual-museum-user-items")
          .upload(uploadedPath, imageFile, { contentType: imageFile.type, upsert: false });
        if (uploadError) throw uploadError;
        imagePath = uploadedPath;
      }
      const payload = {
        title: title.trim(), category, story: story.trim(),
        ai_draft: aiDraft || null, image_path: imagePath, status: "draft",
        updated_at: new Date().toISOString()
      };
      const result = editingId
        ? await supabase.from("museum_user_drafts").update(payload).eq("id", editingId).eq("owner_id", user.id).select("id").single()
        : await supabase.from("museum_user_drafts").insert({ ...payload, owner_id: user.id }).select("id").single();
      if (result.error) throw result.error;
      if (imageFile && existingImagePath) {
        await supabase.storage.from("virtual-museum-user-items").remove([existingImagePath]);
      }
      setEditingId(result.data?.id || editingId);
      setExistingImagePath(imagePath);
      setImageFile(null); setImagePreview("");
      setNotice("Privatni nacrt spremljen. Vidljiv je samo tebi; javna objava nije izvršena.");
      await loadSavedDrafts();
    } catch (error) {
      if (uploadedPath) await supabase.storage.from("virtual-museum-user-items").remove([uploadedPath]);
      setNotice("Nacrt nije spremljen. " + (error?.message || "Provjeri Supabase konfiguraciju."));
    } finally { setSaveBusy(false); }
  }

  async function deleteSavedDraft(draft) {
    if (!window.confirm("Trajno izbrisati ovaj privatni nacrt?")) return;
    try {
      const user = await getCurrentUser();
      const { error } = await supabase.from("museum_user_drafts").delete().eq("id", draft.id).eq("owner_id", user.id);
      if (error) throw error;
      if (draft.image_path) await supabase.storage.from("virtual-museum-user-items").remove([draft.image_path]);
      setSavedDrafts(items => items.filter(item => item.id !== draft.id));
      if (editingId === draft.id) resetDraftEditor();
      setNotice("Privatni nacrt izbrisan.");
    } catch (error) {
      setNotice("Nacrt nije izbrisan. " + (error?.message || ""));
    }
  }

  return <main className="virtual-museum-page">
    <header className="museum-header">
      <a className="museum-back" href="/">← Čuvari nasljeđa</a>
      <div className="museum-brand"><span className="museum-brand-mark">✦</span><div><p>PATRIASOUL · ČUVARI NASLJEĐA</p><h1>Virtualni muzej PatriaSoul</h1></div></div>
      <p className="museum-intro">Prošetaj dvoranom hrvatske baštine. Svaki predmet zaslužuje provjerenu priču.</p>
    </header>
    <nav className="museum-tabs" aria-label="Dijelovi virtualnog muzeja">
      <button className={activeTab==="explore"?"active":""} onClick={()=>setActiveTab("explore")}>🏛 Istraži muzej</button>
      <button className={activeTab==="create"?"active":""} onClick={()=>{setActiveTab("create");loadSavedDrafts();}}>✧ Izradi svoj primjerak</button>
    </nav>
    {activeTab === "explore" ? <section className="museum-explore">
      <div className="museum-scene-heading"><div><span>STALNA IZLOŽBA · RADNA VERZIJA</span><h2>Galerija hrvatske baštine</h2></div><p>W / A / S / D za kretanje · desni klik + pomak miša za pogled · klikni predmet za detalje</p></div>
      <MuseumScene onSelect={setSelectedId} />
      <div className="museum-exhibit-detail"><span>{selected.type} · {selected.period}</span><h3>{selected.title}</h3>{selected.image && <figure className="museum-source-figure"><img src={selected.image} alt={selected.title} loading="lazy" onError={e=>{e.currentTarget.hidden=true;}} /><figcaption>{selected.credit} · {selected.license}</figcaption></figure>}<p>{selected.description}</p><div className="museum-source-links"><a href={selected.source} target="_blank" rel="noreferrer">{selected.sourceLabel} ↗</a><a href={selected.licenseUrl} target="_blank" rel="noreferrer">Licenca i uvjeti korištenja ↗</a></div><p className="museum-disclaimer">Važno: prikazana fotografija i simbolični 3D model nisu isto. Provjeri metapodatke i licencu izvornog zapisa prije preuzimanja, prerade ili ponovne objave.</p></div>
    </section> : <section className="museum-create">
      <div className="museum-create-intro"><span>TVA ZBIRKA · AI POMOĆNIK</span><h2>Izradi svoj muzejski primjerak</h2><p>Dodaj fotografiju ili uspomenu i opiši što znaš. Puter AI pripremit će nacrt, a ti ostaješ autor priče i odlučuješ što dalje.</p></div>
      <form className="museum-create-form" onSubmit={prepareDraft}>
        <label>Naziv predmeta<input value={title} onChange={e=>setTitle(e.target.value)} maxLength={140} placeholder="Npr. Djedov stari alat" required /></label>
        <label>Kategorija<select value={category} onChange={e=>setCategory(e.target.value)}><option>Obiteljska baština</option><option>Arheologija i povijest</option><option>Tradicijski predmeti</option><option>Fotografije i dokumenti</option><option>Lokalne priče i običaji</option></select></label>
        <label>Fotografija (neobavezno)<input type="file" accept="image/png,image/jpeg,image/webp" onChange={e=>{const f=e.target.files?.[0];if(f&&f.size>10*1024*1024){setNotice("Fotografija mora biti manja od 10 MB.");e.target.value="";return;}setImageFile(f||null);setImagePreview(f?URL.createObjectURL(f):"");}} /><small>Najviše 10 MB. Učitana slika ostaje u ovom prozoru dok je ne pošalješ AI-ju.</small></label>
        {imagePreview && <img className="museum-upload-preview" src={imagePreview} alt="Pregled učitane fotografije" />}
        <label>Što znaš o predmetu?<textarea value={story} onChange={e=>setStory(e.target.value)} rows={5} maxLength={5000} placeholder="Odakle potječe, kome je pripadao, što ti je o njemu poznato..." required /></label>
        <button type="submit" disabled={busy}>{busy?"AI priprema nacrt…":"✧ Pripremi nacrt uz Puter AI"}</button>
        <p className="museum-privacy-note">Nacrt se sprema privatno u tvoj račun i ne objavljuje se javno. AI može pogriješiti; činjenice i prava na fotografiju treba provjeriti.</p>
      </form>
      {notice && <p className="museum-notice" role="status">{notice}</p>}
      {(aiDraft || editingId) && <section className="museum-ai-draft"><div><span>{aiDraft ? "AI NACRT · POTREBNA PROVJERA" : "PRIVATNI NACRT · UREĐIVANJE"}</span><div className="museum-draft-actions">{aiDraft && <button type="button" onClick={()=>{navigator.clipboard?.writeText(aiDraft);setNotice("Nacrt je kopiran ako preglednik dopušta pristup međuspremniku.");}}>Kopiraj nacrt</button>}<button type="button" disabled={saveBusy} onClick={savePrivateDraft}>{saveBusy?"Spremam…":editingId?"Spremi promjene":"Spremi privatni nacrt"}</button>{editingId && <button type="button" onClick={resetDraftEditor}>Novi nacrt</button>}</div></div>{aiDraft && <pre>{aiDraft}</pre>}</section>}
      <section className="museum-saved-drafts">
        <div className="museum-saved-heading"><div><span>MOJA ZBIRKA</span><h3>Privatni nacrti</h3><p>Samo ti možeš vidjeti, uređivati ili izbrisati ove zapise.</p></div><button type="button" onClick={loadSavedDrafts} disabled={draftsBusy}>{draftsBusy?"Učitavam…":"Osvježi"}</button></div>
        {draftsBusy ? <p>Učitavam tvoje nacrte…</p> : savedDrafts.length === 0 ? <p className="museum-empty-drafts">Još nema spremljenih nacrta. Izradi prvi iznad.</p> : <div className="museum-draft-list">{savedDrafts.map(draft => <article className="museum-saved-draft" key={draft.id}><div><strong>{draft.title}</strong><span>{draft.category} · {new Date(draft.updated_at || draft.created_at).toLocaleDateString("hr-HR")}</span><small>{draft.image_path ? "Fotografija priložena" : "Bez fotografije"} · Privatno</small></div><div className="museum-saved-actions"><button type="button" onClick={()=>openSavedDraft(draft)}>Otvori / uredi</button><button type="button" onClick={()=>deleteSavedDraft(draft)}>Izbriši</button></div></article>)}</div>}
      </section>
    </section>}
    <footer className="museum-footer">Virtualni muzej PatriaSoul · Povijesne činjenice moraju imati provjerljive izvore · AI ilustracije nikad se ne označavaju kao izvorne povijesne fotografije.</footer>
  </main>;
}
