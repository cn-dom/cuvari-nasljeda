import { useEffect, useRef, useState } from "react";
import { puter } from "@heyputer/puter.js";
import * as THREE from "three";
import { supabase } from "./lib/supabase.js";
import "./virtual-museum.css";
import { BadgeRow, getBadge } from "./HeritageBadges.jsx";
import SiteChrome from "./SiteChrome.jsx";

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
    description: "Bašćanska ploča je vapnenački natpis nastao oko 1100. godine, pronađen u crkvi sv. Lucije u Jurandvoru na Krku. Izvorno je bila dio kamene pregrade između prezbiterija i crkvene lađe. Natpis je pisan prijelaznim oblikom glagoljice i bilježi darovanje zemlje kralja Zvonimira. Izvorna ploča čuva se u palači Hrvatske akademije znanosti i umjetnosti u Zagrebu; u crkvi sv. Lucije nalazi se replika. Ovdje je fotografija objavljena u Hrvatskoj enciklopediji, a ne 3D snimka izvornika.",
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Ba%C5%A1ka_tablet.jpg",
    source: "https://commons.wikimedia.org/wiki/File:Ba%C5%A1ka_tablet.jpg",
    sourceLabel: "Wikimedia Commons · fotografija iz Hrvatske enciklopedije", credit: "Hrvatska enciklopedija", license: "CC BY-SA 4.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
    relatedSources: [
      { label: "Hrvatska enciklopedija · Bašćanska ploča", url: "https://enciklopedija.hr/clanak/bascanska-ploca", kind: "Stručna enciklopedijska natuknica" },
      { label: "Hrvatska enciklopedija · Glagoljica", url: "https://enciklopedija.hr/clanak/glagoljica", kind: "Pregled pisma i njegova razvoja" },
      { label: "Glagoljica.hr · digitalna zbirka glagoljskih natpisa", url: "https://glagoljica.hr/", kind: "Digitalna zbirka nacionalne knjižnice" }
    ]
  },
  {
    id: "pleter", title: "Hrvatski pleter", period: "Predromanika · rani srednji vijek", type: "Kamena plastika",
    description: "Pleterna ornamentika reljefni je ukras u kojem se jedna ili više traka isprepliću u geometrijske čvorove, pletenice i mreže. U hrvatskoj predromanici, osobito od 8. do 11. stoljeća, ukrašavala je dijelove crkvene arhitekture i liturgijskog namještaja. Uzorak se najbolje razumije usporedbom grafičke sheme s fotografijama sačuvanih kamenih spomenika. Ovdje prikazani plutej iz crkve sv. Nediljice u Zadru datira se u sredinu 11. stoljeća i prikazuje biblijske prizore; nije riječ o samoj shemi pletera, nego o stvarnom povijesnom kamenom reljefu iz istog umjetničkog konteksta.",
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Plutej_iz_Sv._Nediljice.jpg",
    source: "https://commons.wikimedia.org/wiki/File:Plutej_iz_Sv._Nediljice.jpg",
    sourceLabel: "Wikimedia Commons · plutej iz sv. Nediljice", credit: "croatia.eu · Le pays et ses habitants", license: "CC BY-SA 4.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
    secondaryImage: "https://commons.wikimedia.org/wiki/Special:FilePath/Pleter_dvobojni.svg",
    secondarySource: "https://commons.wikimedia.org/wiki/File:Pleter_dvobojni.svg",
    secondaryCredit: "MaGa", secondaryLicense: "CC BY-SA 4.0", secondaryLabel: "Grafička shema ornamenta",
    relatedSources: [
      { label: "Hrvatska enciklopedija · Pleterna ornamentika", url: "https://www.enciklopedija.hr/clanak/pleterna-ornamentika", kind: "Stručna enciklopedijska natuknica" },
      { label: "Hrvatska enciklopedija · Plutej", url: "https://www.enciklopedija.hr/clanak/plutej", kind: "Objašnjenje vrste kamenog spomenika" },
      { label: "Muzej hrvatskih arheoloških spomenika · zbirke i istraživanja", url: "https://www.mhas-split.hr/", kind: "Muzejska ustanova" }
    ]
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
  },
  {
    id: "paska-cipka", title: "Paška čipka", period: "Tradicijska čipkarska vještina · otok Pag", type: "Nematerijalna baština",
    description: "Paška čipka jedna je od prepoznatljivih hrvatskih tradicija izrade čipke iglom. Predmet u vitrini predstavlja uzorak čipke kao tekstilni izložak; nije digitalni sken pojedinačnog povijesnog primjerka.",
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Pa%C5%A1ka_%C4%8Dipka_-_izlo%C5%A1ci.2.jpg",
    source: "https://commons.wikimedia.org/wiki/File:Pa%C5%A1ka_%C4%8Dipka_-_izlo%C5%A1ci.2.jpg",
    sourceLabel: "Wikimedia Commons · izlošci paške čipke", credit: "Silverije", license: "CC BY-SA 4.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
    relatedSources: [{ label: "UNESCO · lacemaking in Croatia", url: "https://ich.unesco.org/", kind: "Međunarodni registar nematerijalne baštine" }]
  },
  {
    id: "zagorske-igracke", title: "Tradicijska drvena igračka", period: "Tradicijska izrada · Hrvatsko zagorje", type: "Obrt i svakodnevni život",
    description: "Ručно izrađene i oslikane drvene igračke dio su tradicije Hrvatskog zagorja. Ovaj 3D prikaz stilizirana je replika drvene zviždaljke/igračke, dok povezana fotografija dokumentira tradiciju izrade u Kumrovcu.",
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Croatia-00671_-_Toy_Maker%27s_House_%289370325327%29.jpg",
    source: "https://commons.wikimedia.org/wiki/File:Croatia-00671_-_Toy_Maker%27s_House_%289370325327%29.jpg",
    sourceLabel: "Wikimedia Commons · tradicijska izrada igračaka", credit: "Podaci i licenca navedeni na stranici datoteke", license: "Provjeriti na izvornoj stranici prije daljnjeg korištenja", licenseUrl: "https://commons.wikimedia.org/wiki/File:Croatia-00671_-_Toy_Maker%27s_House_%289370325327%29.jpg"
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
    renderer.domElement.tabIndex = 0;
    renderer.domElement.setAttribute("role", "application");
    renderer.domElement.setAttribute("aria-label", "3D dvorana. Klikni ovdje pa koristi W A S D ili strelice za kretanje. Drži desnu tipku miša i pomiči miš za pogled.");
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
      // Modelirani 3D izlošci — nema više smeđe zamjenske plohe ni ravnog foto-panela.
      const clay = new THREE.MeshStandardMaterial({ color: "#78452f", roughness: .82 });
      const limestone = new THREE.MeshStandardMaterial({ color: "#b6a88c", roughness: .96 });
      const reliefDark = new THREE.MeshStandardMaterial({ color: "#514331", roughness: .9 });
      const coinGold = new THREE.MeshStandardMaterial({ color: "#b69a58", metalness: .7, roughness: .3 });
      const garment = new THREE.MeshStandardMaterial({ color: "#7d2928", roughness: .95 });
      const add = (geometry, material, px, py, pz, sx=1, sy=1, sz=1, rz=0) => {
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(px, py, pz); mesh.scale.set(sx, sy, sz); mesh.rotation.z = rz;
        mesh.castShadow = true; mesh.receiveShadow = true; mesh.userData.exhibitId = item.id;
        scene.add(mesh); clickable.push(mesh); return mesh;
      };
      if (i === 0) {
        // Vučedolska keramička ptica: tijelo, vrat, glava, kljun, rep i ukrasni prstenovi.
        add(new THREE.SphereGeometry(.34, 28, 20), clay, x-.12, 1.02, z, 1.25, .78, .78);
        add(new THREE.CylinderGeometry(.09, .13, .55, 16), clay, x+.2, 1.42, z, 1, 1, 1, -.24);
        add(new THREE.SphereGeometry(.16, 20, 16), clay, x+.34, 1.7, z);
        add(new THREE.ConeGeometry(.065, .19, 8), reliefDark, x+.49, 1.7, z, 1, 1, 1, -Math.PI/2);
        add(new THREE.ConeGeometry(.16, .3, 7), clay, x-.51, 1.04, z, 1, 1, .7, Math.PI/2);
        for (let n=0;n<3;n++) add(new THREE.TorusGeometry(.28+n*.035,.014,6,36),reliefDark,x-.12,.91+n*.1,z,1.15,.75,.8);
        add(new THREE.CylinderGeometry(.025,.035,.18,8),reliefDark,x-.2,.68,z);
        add(new THREE.CylinderGeometry(.025,.035,.18,8),reliefDark,x+.02,.68,z);
      } else if (i === 1) {
        // Kamena ploča nepravilnog obrisa s reljefno naznačenim redovima natpisa.
        const shape = new THREE.Shape();
        shape.moveTo(-.48,-.65); shape.lineTo(.4,-.7); shape.lineTo(.54,-.4); shape.lineTo(.48,.55); shape.lineTo(.25,.7); shape.lineTo(-.45,.65); shape.lineTo(-.56,.25); shape.closePath();
        const slab = new THREE.Mesh(new THREE.ExtrudeGeometry(shape,{depth:.16,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:.025,bevelThickness:.025}),limestone);
        slab.position.set(x,1.15,z); slab.castShadow=true; slab.userData.exhibitId=item.id; scene.add(slab); clickable.push(slab);
        for(let n=0;n<8;n++) for(let k=0;k<3;k++) add(new THREE.BoxGeometry(.2,.018,.025),reliefDark,x-.22+k*.2,1.65-n*.145,z+.1,1,1,1,(n%2?.1:-.1));
      } else if (i === 2) {
        // Kameni ulomak s izdignutim pleternim vrpcama.
        add(new THREE.BoxGeometry(1.02,1.12,.16),limestone,x,1.15,z);
        const paths=[[[-.38,.82],[-.15,1.45],[.15,.82],[.38,1.45]],[[-.38,1.45],[-.15,.82],[.15,1.45],[.38,.82]]];
        paths.forEach(points=>{const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(x+p[0],p[1],z+.12)));const mesh=new THREE.Mesh(new THREE.TubeGeometry(curve,36,.045,8,false),reliefDark);mesh.userData.exhibitId=item.id;scene.add(mesh);clickable.push(mesh);});
      } else if (i === 3) {
        // Novac s izdignutim rubom i križem.
        add(new THREE.CylinderGeometry(.4,.4,.1,48),coinGold,x,1.08,z,1,1,1,Math.PI/2);
        add(new THREE.TorusGeometry(.32,.022,8,40),reliefDark,x,1.08,z+.06);
        add(new THREE.BoxGeometry(.07,.4,.035),reliefDark,x,1.08,z+.07);
        add(new THREE.BoxGeometry(.3,.07,.035),reliefDark,x,1.08,z+.07);
      } else if (i === 5) {
        // Paška čipka: three-dimensional lace-like textile pattern held in a small display frame.
        const frameMat = new THREE.MeshStandardMaterial({ color: "#b99a58", metalness: .45, roughness: .4 });
        add(new THREE.BoxGeometry(.92, .92, .055), frameMat, x, 1.22, z);
        add(new THREE.BoxGeometry(.82, .82, .045), new THREE.MeshStandardMaterial({ color: "#e8ddc4", roughness: 1 }), x, 1.22, z+.04);
        const laceMat = new THREE.MeshStandardMaterial({ color: "#f7f0df", roughness: .95 });
        for (let n=0;n<8;n++) {
          const a=n*Math.PI/4;
          const loop=new THREE.Mesh(new THREE.TorusGeometry(.19,.022,6,24),laceMat);
          loop.position.set(x+Math.cos(a)*.17,1.22+Math.sin(a)*.17,z+.085);
          loop.scale.set(.62,1.0,1); loop.userData.exhibitId=item.id; scene.add(loop); clickable.push(loop);
        }
        add(new THREE.TorusGeometry(.11,.025,6,24),laceMat,x,1.22,z+.09);
      } else if (i === 6) {
        // Traditional painted wooden toy: turned body, tapered ends and colored rings.
        const toyWood = new THREE.MeshStandardMaterial({ color: "#d4a35d", roughness: .72 });
        add(new THREE.CylinderGeometry(.14,.2,.52,12),toyWood,x,1.12,z,1,1,1,Math.PI/2);
        add(new THREE.ConeGeometry(.17,.32,12),toyWood,x,1.52,z,1,1,1,Math.PI);
        add(new THREE.ConeGeometry(.14,.28,12),toyWood,x,.78,z);
        for(let n=0;n<3;n++) add(new THREE.TorusGeometry(.15,.025,6,24),new THREE.MeshStandardMaterial({color:["#b73b32","#e4c44e","#3d7956"][n],roughness:.65}),x,1.03+n*.09,z+.16,1,.8,1);
      } else {
        // Tradicijska nošnja kao mali trodimenzionalni kostimirani model.
        add(new THREE.SphereGeometry(.12,18,14),limestone,x,1.9,z);
        add(new THREE.CylinderGeometry(.12,.15,.35,16),limestone,x,1.65,z);
        add(new THREE.CylinderGeometry(.15,.4,.78,24,1,true),garment,x,1.12,z);
        add(new THREE.CylinderGeometry(.4,.42,.08,24),garment,x,.72,z);
        add(new THREE.CylinderGeometry(.045,.055,.42,10),limestone,x-.2,1.38,z,1,1,1,-.2);
        add(new THREE.CylinderGeometry(.045,.055,.42,10),limestone,x+.2,1.38,z,1,1,1,.2);
      }
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
    const movementKeys = new Set(["w","a","s","d","arrowup","arrowdown","arrowleft","arrowright"]);
    const onKeyDown = (e) => {
      const key = e.key.toLowerCase();
      if (!movementKeys.has(key)) return;
      const target = e.target;
      if (target && (target.isContentEditable || ["INPUT","TEXTAREA","SELECT","BUTTON"].includes(target.tagName))) return;
      keys.add(key);
      e.preventDefault();
    };
    const onKeyUp = (e) => keys.delete(e.key.toLowerCase());
    const clearKeys = () => keys.clear();
    window.addEventListener("keydown", onKeyDown, { passive: false });
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", clearKeys);
    let yaw = 0, pitch = 0, dragging = false, lastX = 0, lastY = 0;
    const onPointerDown = (e) => {
      if (e.button === 2) { dragging = true; lastX = e.clientX; lastY = e.clientY; }
      else if (e.button === 0) renderer.domElement.focus({ preventScroll: true });
    };
    const onPointerMove = (e) => {
      if (!dragging) return;
      const dx = document.pointerLockElement === renderer.domElement ? e.movementX : e.clientX-lastX;
      const dy = document.pointerLockElement === renderer.domElement ? e.movementY : e.clientY-lastY;
      yaw -= dx*.003;
      pitch = THREE.MathUtils.clamp(pitch-dy*.002, -.65, .65);
      lastX=e.clientX; lastY=e.clientY;
    };
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
      window.removeEventListener("keydown", onKeyDown); window.removeEventListener("keyup", onKeyUp); window.removeEventListener("blur", clearKeys);
      renderer.domElement.removeEventListener("pointerdown", onPointerDown); window.removeEventListener("pointermove", onPointerMove); window.removeEventListener("pointerup", onPointerUp); renderer.domElement.removeEventListener("contextmenu", onContext);
      keys.clear();
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
  const [existingImagePreview, setExistingImagePreview] = useState("");
  const [notice, setNotice] = useState("");
  const [museumBadgeKeys, setMuseumBadgeKeys] = useState([]);
  const selected = exhibits.find(item => item.id === selectedId) || exhibits[0];

  useEffect(() => {
    if (!supabase) return undefined;
    let cancelled = false;
    async function loadBadges() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || cancelled) return;
      const { data, error } = await supabase.rpc("get_public_member_badges", { p_user_ids: [user.id] });
      if (!cancelled && !error) setMuseumBadgeKeys((data || []).map((row) => row.badge_key));
    }
    loadBadges();
    return () => { cancelled = true; };
  }, []);

  async function trackExhibitVisit(exhibitId) {
    setSelectedId(exhibitId);
    if (!supabase) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data, error } = await supabase.rpc("record_museum_exhibit_visit", { p_exhibit_id: exhibitId });
    if (error) {
      setNotice("Predmet je otvoren, ali se napredak znački nije spremio. Provjeri je li migracija shared_heritage_badges primijenjena.");
      return;
    }
    const { data: badgeRows, error: badgeError } = await supabase.rpc("get_public_member_badges", { p_user_ids: [user.id] });
    if (!badgeError) setMuseumBadgeKeys((badgeRows || []).map((row) => row.badge_key));
    const newBadges = (data?.new_badges || []).map(getBadge).filter(Boolean);
    if (newBadges.length) setNotice("Osvojena nova značka: " + newBadges.map((badge) => badge.name).join(", ") + "!");
  }

  async function prepareDraft(event) {
    event.preventDefault();
    if (!title.trim() || !story.trim()) { setNotice("Unesi naziv i ono što znaš o predmetu."); return; }
    if (!window.confirm("Podaci koje uneseš i odabrana fotografija mogu biti poslani PatriaSoul Digitalnom Kursoru (AI usluga koju omogućuje Puter) radi izrade nacrta. Ne šalji tuđe privatne fotografije ili osjetljive podatke bez dopuštenja. Nastaviti?")) return;
    setBusy(true); setNotice("");
    try {
      const prompt = "Pomozi pripremiti nacrt muzejskog zapisa na hrvatskom. Ne izmišljaj činjenice i jasno odvoji korisnikovo svjedočanstvo od provjerene povijesti. Ne predstavljaj zaključke kao činjenice. Vrati naslov, kratki opis, što još treba provjeriti, moguće ključne riječi i vrste pouzdanih izvora koje treba potražiti. Kategorija: "+category+". Naziv: "+title.trim()+". Podaci vlasnika: "+story.trim()+". Ako nema izvora, jasno napiši da povijesni navodi nisu potvrđeni.";
      const reply = imageFile ? await puter.ai.chat(prompt, imageFile) : await puter.ai.chat(prompt);
      setAiDraft(typeof reply === "string" ? reply : (reply?.message?.content || reply?.text || JSON.stringify(reply)));
      setNotice("AI je pripremio nacrt. Provjeri ga prije spremanja ili javne objave.");
    } catch (error) {
      setNotice("PatriaSoul Digitalni Kursor trenutačno nije dostupan. "+(error?.message || "Pokušaj ponovno."));
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
    setExistingImagePreview("");
    if (draft.image_path && supabase) {
      const { data } = await supabase.storage.from("virtual-museum-user-items").createSignedUrl(draft.image_path, 300);
      setExistingImagePreview(data?.signedUrl || "");
    }
    setImageFile(null);
    setImagePreview("");
    setNotice("Uređuješ privatni nacrt. Promjene neće biti javno objavljene.");
    setActiveTab("create");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetDraftEditor() {
    setEditingId(null); setExistingImagePath(null); setExistingImagePreview("");
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
      setExistingImagePreview("");
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
    <SiteChrome section="Kultura i znanje" links={[{"label":"Muzej","href":"/virtualni-muzej.html"},{"label":"Zbirke","href":"#collections"},{"label":"Izložbe","href":"#exhibitions"},{"label":"PatriaSoul","href":"/"}]}/>
    <nav className="museum-tabs" aria-label="Dijelovi virtualnog muzeja">
      <button className={activeTab==="explore"?"active":""} onClick={()=>setActiveTab("explore")}>🏛 Istraži muzej</button>
      <button className={activeTab==="create"?"active":""} onClick={()=>{setActiveTab("create");loadSavedDrafts();}}>✧ Digitalni Kursor</button>
    </nav>
    {activeTab === "explore" ? <section className="museum-explore">
      <div className="museum-scene-heading"><div><span>STALNA IZLOŽBA · RADNA VERZIJA</span><h2>Galerija hrvatske baštine</h2></div><p>W / A / S / D za kretanje · desni klik + pomak miša za pogled · klikni predmet za detalje</p></div>
      <MuseumScene onSelect={trackExhibitVisit} />
      <section className="museum-earned-badges">
        <h3>Tvoje značke PatriaSoul</h3>
        <p>Istraživanjem stvarnih predmeta u 3D dvorani otključavaš muzejske značke. Napredak se sprema uz tvoj račun.</p>
        <BadgeRow badgeKeys={museumBadgeKeys} />
      </section>
      <div className="museum-exhibit-detail"><span>{selected.type} · {selected.period}</span><h3>{selected.title}</h3>{selected.image && <figure className="museum-source-figure"><img src={selected.image} alt={selected.title} loading="lazy" onError={e=>{e.currentTarget.hidden=true;}} /><figcaption>{selected.credit} · {selected.license}</figcaption></figure>}{selected.secondaryImage && <figure className="museum-source-figure"><img src={selected.secondaryImage} alt={selected.secondaryLabel || "Dodatni prikaz"} loading="lazy" onError={e=>{e.currentTarget.hidden=true;}} /><figcaption>{selected.secondaryLabel} · {selected.secondaryCredit} · {selected.secondaryLicense}</figcaption></figure>}<p>{selected.description}</p><div className="museum-source-links"><a href={selected.source} target="_blank" rel="noreferrer">{selected.sourceLabel} ↗</a><a href={selected.licenseUrl} target="_blank" rel="noreferrer">Licenca i uvjeti korištenja ↗</a>{selected.secondarySource && <a href={selected.secondarySource} target="_blank" rel="noreferrer">Izvor grafičke sheme ↗</a>}</div>{selected.relatedSources && <section className="museum-related-sources"><h4>Za daljnje čitanje</h4><ul>{selected.relatedSources.map(item => <li key={item.url}><a href={item.url} target="_blank" rel="noreferrer">{item.label} ↗</a><span>{item.kind}</span></li>)}</ul></section>}<p className="museum-disclaimer">Fotografija kamenog reljefa, grafička shema i simbolični 3D model nisu isti prikaz. Podatke o predmetu i licencu provjeri na izvornim stranicama prije prerade ili ponovne objave.</p></div>
    </section> : <section className="museum-create">
      <div className="museum-create-intro"><span>TVOJA ZBIRKA · PATRIASOUL DIGITALNI KURSOR</span><h2>PatriaSoul Digitalni Kursor</h2><p>Dodaj fotografiju ili uspomenu i opiši što znaš. Digitalni Kursor pomoći će ti pripremiti muzejski nacrt, a ti ostaješ autor priče i odlučuješ što dalje.</p></div>
      <form className="museum-create-form" onSubmit={prepareDraft}>
        <label>Naziv predmeta<input value={title} onChange={e=>setTitle(e.target.value)} maxLength={140} placeholder="Npr. Djedov stari alat" required /></label>
        <label>Kategorija<select value={category} onChange={e=>setCategory(e.target.value)}><option>Obiteljska baština</option><option>Arheologija i povijest</option><option>Tradicijski predmeti</option><option>Fotografije i dokumenti</option><option>Lokalne priče i običaji</option></select></label>
        <label>Fotografija (neobavezno)<input type="file" accept="image/png,image/jpeg,image/webp" onChange={e=>{const f=e.target.files?.[0];if(f&&f.size>10*1024*1024){setNotice("Fotografija mora biti manja od 10 MB.");e.target.value="";return;}setImageFile(f||null);setImagePreview(f?URL.createObjectURL(f):"");}} /><small>Najviše 10 MB. Učitana slika ostaje u ovom prozoru dok je ne pošalješ AI-ju.</small></label>
        {imagePreview && <img className="museum-upload-preview" src={imagePreview} alt="Pregled nove fotografije" />}
        {!imagePreview && existingImagePreview && <div className="museum-existing-image"><img className="museum-upload-preview" src={existingImagePreview} alt="Fotografija spremljena uz privatni nacrt" /><small>Trenutačno spremljena fotografija. Odaberi novu samo ako je želiš zamijeniti.</small></div>}
        <label>Što znaš o predmetu?<textarea value={story} onChange={e=>setStory(e.target.value)} rows={5} maxLength={5000} placeholder="Odakle potječe, kome je pripadao, što ti je o njemu poznato..." required /></label>
        <button type="submit" disabled={busy}>{busy?"AI priprema nacrt…":"✧ Pokreni Digitalni Kursor"}</button>
        <p className="museum-privacy-note">Nacrt se sprema privatno u tvoj račun i ne objavljuje se javno. AI može pogriješiti; činjenice i prava na fotografiju treba provjeriti.</p>
      </form>
      {notice && <p className="museum-notice" role="status">{notice}</p>}
      {(aiDraft || editingId) && <section className="museum-ai-draft"><div><span>{aiDraft ? "AI NACRT · POTREBNA PROVJERA" : "PRIVATNI NACRT · UREĐIVANJE"}</span><div className="museum-draft-actions">{aiDraft && <button type="button" onClick={()=>{navigator.clipboard?.writeText(aiDraft);setNotice("Nacrt je kopiran ako preglednik dopušta pristup međuspremniku.");}}>Kopiraj nacrt</button>}<button type="button" disabled={saveBusy} onClick={savePrivateDraft}>{saveBusy?"Spremam…":editingId?"Spremi promjene":"Spremi privatni nacrt"}</button>{editingId && <button type="button" onClick={resetDraftEditor}>Novi nacrt</button>}</div></div>{aiDraft && <pre>{aiDraft}</pre>}</section>}
      <section className="museum-saved-drafts">
        <div className="museum-saved-heading"><div><span>MOJA ZBIRKA</span><h3>Privatni nacrti</h3><p>Samo ti možeš vidjeti, uređivati ili izbrisati ove zapise.</p></div><button type="button" onClick={loadSavedDrafts} disabled={draftsBusy}>{draftsBusy?"Učitavam…":"Osvježi"}</button></div>
        {draftsBusy ? <p>Učitavam tvoje nacrte…</p> : savedDrafts.length === 0 ? <p className="museum-empty-drafts">Još nema spremljenih nacrta. Izradi prvi iznad.</p> : <div className="museum-draft-list">{savedDrafts.map(draft => <article className="museum-saved-draft" key={draft.id}><div><strong>{draft.title}</strong><span>{draft.category} · {new Date(draft.updated_at || draft.created_at).toLocaleDateString("hr-HR")}</span><small>{draft.image_path ? "Fotografija priložena" : "Bez fotografije"} · Privatno</small></div><div className="museum-saved-actions"><button type="button" onClick={()=>openSavedDraft(draft)}>Otvori / uredi</button><button type="button" onClick={()=>deleteSavedDraft(draft)}>Izbriši</button></div></article>)}</div>}
      </section>
    </section>}
    
  </main>;
}
