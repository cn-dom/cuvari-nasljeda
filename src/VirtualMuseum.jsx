import { useEffect, useRef, useState } from "react";
import { puter } from "@heyputer/puter.js";
import * as THREE from "three";
import { supabase } from "./lib/supabase.js";
import "./virtual-museum.css";

const exhibits = [
  { id: "vucedol", title: "Vučedolska kultura", period: "3. tisućljeće pr. Kr.", type: "Arheologija", description: "Početna tema za istraživanje eneolitičke kulture uz Dunav. Konkretan predmet i dataciju potrebno je potvrditi muzejskim ili znanstvenim izvorom.", source: "https://www.vucedol.hr/" },
  { id: "bascanska", title: "Bašćanska ploča", period: "oko 1100. godine", type: "Glagoljica", description: "Jedan od najpoznatijih spomenika hrvatske pismenosti. Prikaz u ovoj dvorani je simboličan; nije 3D rekonstrukcija izvornika.", source: "https://www.enciklopedija.hr/" },
  { id: "pleter", title: "Hrvatski pleter", period: "rani srednji vijek", type: "Kamena plastika", description: "Pleterna ornamentika pojavljuje se na brojnim ranosrednjovjekovnim kamenim spomenicima. Za svaki budući zapis dodaje se konkretan izvor.", source: "https://www.enciklopedija.hr/" },
  { id: "novac", title: "Povijesni novac", period: "različita razdoblja", type: "Numizmatika", description: "Tematska vitrina za novac i monetarnu povijest. Ne prikazuje se kao autentičan povijesni primjerak dok se ne odabere dokumentirani predmet.", source: "https://www.hnb.hr/" },
  { id: "nosnja", title: "Tradicijska nošnja", period: "regionalna baština", type: "Etnografija", description: "Prostor za predstavljanje regionalnih tekstilnih tradicija uz jasno navođenje kraja, razdoblja, autora fotografije i prava korištenja.", source: "https://www.emz.hr/" }
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

  async function savePrivateDraft() {
    if (!supabase) { setNotice("Supabase nije konfiguriran u ovoj aplikaciji."); return; }
    setSaveBusy(true); setNotice("");
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      const user = sessionData?.session?.user;
      if (!user) { setNotice("Za spremanje privatnog nacrta prijavi se u Čuvare nasljeđa, a zatim se vrati u muzej."); return; }
      let imagePath = null;
      if (imageFile) {
        const safeName = imageFile.name.replace(/[^a-zA-Z0-9._-]/g, "-").slice(-100) || "predmet.jpg";
        imagePath = user.id + "/" + crypto.randomUUID() + "-" + safeName;
        const { error: uploadError } = await supabase.storage.from("virtual-museum-user-items").upload(imagePath, imageFile, { contentType: imageFile.type, upsert: false });
        if (uploadError) throw uploadError;
      }
      const { error: insertError } = await supabase.from("museum_user_drafts").insert({
        owner_id: user.id, title: title.trim(), category, story: story.trim(),
        ai_draft: aiDraft || null, image_path: imagePath, status: "draft"
      });
      if (insertError) {
        if (imagePath) await supabase.storage.from("virtual-museum-user-items").remove([imagePath]);
        throw insertError;
      }
      setNotice("Privatni nacrt spremljen. Vidljiv je samo tebi; javna objava nije izvršena.");
    } catch (error) {
      setNotice("Nacrt nije spremljen. Provjeri je li migracija Virtualnog muzeja primijenjena u Supabaseu. " + (error?.message || ""));
    } finally { setSaveBusy(false); }
  }

  return <main className="virtual-museum-page">
    <header className="museum-header">
      <a className="museum-back" href="/">← Čuvari nasljeđa</a>
      <div className="museum-brand"><span className="museum-brand-mark">✦</span><div><p>PATRIASOUL · ČUVARI NASLJEĐA</p><h1>Virtualni muzej PatriaSoul</h1></div></div>
      <p className="museum-intro">Prošetaj dvoranom hrvatske baštine. Svaki predmet zaslužuje provjerenu priču.</p>
    </header>
    <nav className="museum-tabs" aria-label="Dijelovi virtualnog muzeja">
      <button className={activeTab==="explore"?"active":""} onClick={()=>setActiveTab("explore")}>🏛 Istraži muzej</button>
      <button className={activeTab==="create"?"active":""} onClick={()=>setActiveTab("create")}>✧ Izradi svoj primjerak</button>
    </nav>
    {activeTab === "explore" ? <section className="museum-explore">
      <div className="museum-scene-heading"><div><span>STALNA IZLOŽBA · RADNA VERZIJA</span><h2>Galerija hrvatske baštine</h2></div><p>W / A / S / D za kretanje · desni klik + pomak miša za pogled · klikni predmet za detalje</p></div>
      <MuseumScene onSelect={setSelectedId} />
      <div className="museum-exhibit-detail"><span>{selected.type} · {selected.period}</span><h3>{selected.title}</h3><p>{selected.description}</p><a href={selected.source} target="_blank" rel="noreferrer">Potraži izvor ↗</a><p className="museum-disclaimer">Prototip: vitrine i modeli su simbolični. Zapisi su početne teme, ne konačno provjerene muzejske katalogizacije.</p></div>
    </section> : <section className="museum-create">
      <div className="museum-create-intro"><span>TVA ZBIRKA · AI POMOĆNIK</span><h2>Izradi svoj muzejski primjerak</h2><p>Dodaj fotografiju ili uspomenu i opiši što znaš. Puter AI pripremit će nacrt, a ti ostaješ autor priče i odlučuješ što dalje.</p></div>
      <form className="museum-create-form" onSubmit={prepareDraft}>
        <label>Naziv predmeta<input value={title} onChange={e=>setTitle(e.target.value)} maxLength={140} placeholder="Npr. Djedov stari alat" required /></label>
        <label>Kategorija<select value={category} onChange={e=>setCategory(e.target.value)}><option>Obiteljska baština</option><option>Arheologija i povijest</option><option>Tradicijski predmeti</option><option>Fotografije i dokumenti</option><option>Lokalne priče i običaji</option></select></label>
        <label>Fotografija (neobavezno)<input type="file" accept="image/png,image/jpeg,image/webp" onChange={e=>{const f=e.target.files?.[0];if(f&&f.size>10*1024*1024){setNotice("Fotografija mora biti manja od 10 MB.");e.target.value="";return;}setImageFile(f||null);setImagePreview(f?URL.createObjectURL(f):"");}} /><small>Najviše 10 MB. Učitana slika ostaje u ovom prozoru dok je ne pošalješ AI-ju.</small></label>
        {imagePreview && <img className="museum-upload-preview" src={imagePreview} alt="Pregled učitane fotografije" />}
        <label>Što znaš o predmetu?<textarea value={story} onChange={e=>setStory(e.target.value)} rows={5} maxLength={5000} placeholder="Odakle potječe, kome je pripadao, što ti je o njemu poznato..." required /></label>
        <button type="submit" disabled={busy}>{busy?"AI priprema nacrt…":"✧ Pripremi nacrt uz Puter AI"}</button>
        <p className="museum-privacy-note">Ovo je prva faza: nacrt se ne objavljuje javno i još se ne sprema u Supabase. AI može pogriješiti; činjenice i prava na fotografiju treba provjeriti.</p>
      </form>
      {notice && <p className="museum-notice" role="status">{notice}</p>}
      {aiDraft && <section className="museum-ai-draft"><div><span>AI NACRT · POTREBNA PROVJERA</span><div className="museum-draft-actions"><button type="button" onClick={()=>{navigator.clipboard?.writeText(aiDraft);setNotice("Nacrt je kopiran ako preglednik dopušta pristup međuspremniku.");}}>Kopiraj nacrt</button><button type="button" disabled={saveBusy} onClick={savePrivateDraft}>{saveBusy?"Spremam…":"Spremi privatni nacrt"}</button></div></div><pre>{aiDraft}</pre></section>}
    </section>}
    <footer className="museum-footer">Virtualni muzej PatriaSoul · Povijesne činjenice moraju imati provjerljive izvore · AI ilustracije nikad se ne označavaju kao izvorne povijesne fotografije.</footer>
  </main>;
}
