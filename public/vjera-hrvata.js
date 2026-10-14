(()=>{
"use strict";
const daily=[
{verse:"Bog je ljubav.",ref:"1 Iv 4, 8",reflection:"Ljubav se vidi u strpljenju, pažnji i djelima kojima drugome olakšamo dan.",question:"Kako danas mogu nekome pokazati ljubav konkretnim djelom?"},
{verse:"Gospodin je pastir moj: ni u čem ja ne oskudijevam.",ref:"Ps 23, 1",reflection:"Kad ne znamo kojim putem krenuti, zastanimo, pomolimo se i učinimo sljedeći dobar korak.",question:"Što danas mogu povjeriti Bogu umjesto da sve nosim sam?"},
{verse:"Blago mirotvorcima: oni će se sinovima Božjim zvati.",ref:"Mt 5, 9",reflection:"Mir počinje u načinu na koji slušamo, govorimo i rješavamo nesporazume.",question:"U kojem razgovoru mogu biti graditelj mira?"},
{verse:"Ne boj se, jer ja sam s tobom.",ref:"Iz 41, 10",reflection:"Hrabrost ne znači da nemamo straha, nego da u teškoći ne odustanemo od dobra.",question:"Koji mali korak hrabrosti mogu učiniti danas?"},
{verse:"Sve mogu u Onome koji me jača.",ref:"Fil 4, 13",reflection:"Snagu tražimo za vjernost, strpljivost i ljubav, čak i kad okolnosti nisu lake.",question:"Za što danas trebam snagu i kome mogu zatražiti pomoć?"},
{verse:"Budite jedni drugima dobrostivi, milosrdni.",ref:"Ef 4, 32",reflection:"Dobrota se često sastoji od malih djela koja nitko ne vidi, ali nekome mnogo znače.",question:"Kome danas mogu oprostiti ili pružiti ruku?"},
{verse:"Uvijek se radujte! Bez prestanka molite!",ref:"1 Sol 5, 16–17",reflection:"Kratka molitva usred svakodnevnih obveza može nas vratiti zahvalnosti i miru.",question:"Za koji dar današnjeg dana mogu zahvaliti?"}
];
const getZagrebDate=()=>{
 const parts=new Intl.DateTimeFormat("en-CA",{timeZone:"Europe/Zagreb",year:"numeric",month:"2-digit",day:"2-digit"}).formatToParts(new Date());
 const get=t=>parts.find(p=>p.type===t)?.value;
 return {year:get("year"),month:get("month"),day:get("day"),iso:get("year")+"-"+get("month")+"-"+get("day")};
};
const today=getZagrebDate();
const dayNumber=Math.floor(Date.UTC(Number(today.year),Number(today.month)-1,Number(today.day))/86400000);
const item=daily[((dayNumber%daily.length)+daily.length)%daily.length];
const date=document.querySelector("#faith-date");
if(date)date.textContent=new Intl.DateTimeFormat("hr-HR",{timeZone:"Europe/Zagreb",weekday:"long",day:"numeric",month:"long",year:"numeric"}).format(new Date());
for(const [id,value] of [["faith-verse","„"+item.verse+"”"],["faith-reference",item.ref],["faith-reflection",item.reflection],["faith-question",item.question]]){const el=document.getElementById(id);if(el)el.textContent=value;}
document.querySelectorAll(".prayer-item").forEach(button=>button.addEventListener("click",()=>{const expanded=button.getAttribute("aria-expanded")==="true";button.setAttribute("aria-expanded",String(!expanded));const mark=button.querySelector(":scope > b");if(mark)mark.textContent=expanded?"＋":"−";}));
const weekday=["nedjelja","ponedjeljak","utorak","srijeda","četvrtak","petak","subota"][new Date(today.iso+"T12:00:00+02:00").getDay()];
const slug=weekday+"-"+Number(today.day)+"-"+Number(today.month)+"-"+today.year;
const setText=(id,text)=>{const el=document.getElementById(id);if(el)el.textContent=text;};
const clean=s=>String(s||"").replace(/\[([^\]]+)\]\([^)]+\)/g,"$1").replace(/[*_>#`]/g,"").replace(/&nbsp;/g," ").replace(/&amp;/g,"&").replace(/&quot;/g,'"').replace(/&#39;|&apos;/g,"'").replace(/\s+/g," ").trim();
const findSection=(source,heading)=>{
 const escaped=heading.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");
 const re=new RegExp("(?:^|\\n)#{1,5}\\s*"+escaped+"\\s*:?\\s*\\n([\\s\\S]*?)(?=\\n#{1,5}\\s|$)","i");
 const match=source.match(re);return match?match[1].trim():"";
};
const loadLiturgy=async()=>{
 const gospelRef=document.getElementById("gospel-reference");
 const gospelText=document.getElementById("gospel-text");
 try{
   const url="https://r.jina.ai/http://hilp.hr/liturgija-dana/"+slug+"/";
   const response=await fetch(url,{headers:{"Accept":"text/plain"},cache:"no-cache"});
   if(!response.ok)throw new Error("Liturgijski izvor trenutno nije dostupan.");
   const raw=await response.text();
   if(!raw||raw.length<500)throw new Error("Nije vraćen potpun liturgijski zapis.");
   const dateMatch=raw.match(/(?:Ponedjeljak|Utorak|Srijeda|Četvrtak|Petak|Subota|Nedjelja),?\s+\d{1,2}\.\s*\d{1,2}\.\s*\d{4}\.?/i);
   if(dateMatch&&!dateMatch[0].includes(Number(today.day)+".")&&!dateMatch[0].includes(today.day+"."))throw new Error("Izvor je vratio podatke za drugi datum.");
   let section=findSection(raw,"Evanđelje");
   if(!section){
     const at=raw.search(/#{1,5}\s*Evanđelje\s*:/i);
     if(at>=0)section=raw.slice(at).replace(/^#{1,5}\s*Evanđelje\s*:?/i,"").split(/\n#{1,5}\s/)[0];
   }
   if(!section)throw new Error("U liturgijskom zapisu nije pronađeno evanđelje.");
   const lines=section.split(/\n+/).map(clean).filter(Boolean).filter(line=>!/^[-—]{2,}$/.test(line));
   const ref=lines.find(line=>/\b(?:Mt|Mk|Lk|Iv)\s*\d/.test(line))||"";
   const textStart=lines.findIndex(line=>/Čitanje svetog Evanđelja|Čitanje svetoga Evanđelja/i.test(line));
   const bodyLines=lines.slice(textStart>=0?textStart+1:(ref?lines.indexOf(ref)+1:1)).filter(line=>line!=="Riječ Gospodnja.");
   const body=bodyLines.join("\n\n").trim();
   if(!ref||body.length<80)throw new Error("Tekst evanđelja nije potpun.");
   if(gospelRef)gospelRef.textContent=ref;
   if(gospelText){gospelText.textContent=body;gospelText.style.whiteSpace="pre-line";}
   const title=lines.filter(line=>line!==ref&&!/Čitanje svetog Evanđelja|Čitanje svetoga Evanđelja|Riječ Gospodnja/i.test(line)).find(line=>line.length>12&&line.length<180);
   if(title)setText("gospel-heading",title);
   setText("gospel-response","Liturgijski izvor: Hrvatski institut za liturgijski pastoral (HILP).");
   const dayStart=raw.search(/(?:Ponedjeljak|Utorak|Srijeda|Četvrtak|Petak|Subota|Nedjelja),?\s+\d{1,2}\.\s*\d{1,2}\.\s*\d{4}\.?/i);
   const readingStart=raw.search(/#{1,5}\s*Misna čitanja/i);
   const dayBlock=dayStart>=0?raw.slice(dayStart,readingStart>dayStart?readingStart:dayStart+1400):"";
   const dayLines=dayBlock.split(/\n+/).map(clean).filter(Boolean);
   const celebration=dayLines.filter(line=>!/(?:Ponedjeljak|Utorak|Srijeda|Četvrtak|Petak|Subota|Nedjelja),?\s+\d{1,2}\.\s*\d{1,2}\.\s*\d{4}/i.test(line)&&!/^(?:XX|X|I|V|\d+|ili:)/i.test(line)&&!/^\d+\. tjedan/i.test(line)&&line.length>2&&line.length<180).slice(0,3);
   const saintLine=dayLines.find(line=>/sv\.|svet|blažen|bl\./i.test(line)&&!/svetog Evanđelja|svetoga Pavla|svetog Luke|svetog Mateja/i.test(line));
   if(saintLine){
      const saintName=clean(saintLine).replace(/^ili:\s*/i,"");
      const saintDetails=saintName.match(/\),?\s*(.+)$/);
      setText("saint-heading",saintName);
      setText("saint-description",saintDetails&&saintDetails[1]
        ? "Danas se u liturgijskom kalendaru spominje: "+saintDetails[1].replace(/[.;,]+$/,"")+"."
        : "Spomendan je preuzet iz današnjeg liturgijskog kalendara Hrvatskog instituta za liturgijski pastoral.");
   } else {
      setText("saint-heading",celebration.find(line=>/Svagdan|nedjelja|slavlje|blagdan|spomendan/i.test(line))||"Svagdan");
      setText("saint-description","Za današnji datum nije naveden poseban svetac ili spomendan u sažetku kalendara.");
   }
 }catch(error){
   if(gospelRef)gospelRef.textContent="Današnja čitanja trenutačno se ne mogu dohvatiti.";
   if(gospelText)gospelText.textContent="PatriaSoul ne prikazuje neprovjeren tekst niti izmišlja liturgijska čitanja. Osvježi stranicu kasnije kako bi se pokušalo ponovno.";
   setText("gospel-response","Automatsko učitavanje liturgijskog izvora nije uspjelo.");
   setText("saint-heading","Podatak trenutačno nije dostupan");
   setText("saint-description","Svetac ili spomendan prikazat će se čim provjereni liturgijski kalendar ponovno bude dostupan.");
   console.warn("PatriaSoul liturgy load:",error);
 }
};
const heritageStories=[
{title:"Bašćanska ploča i početci hrvatske pismenosti",summary:"Bašćanska ploča jedan je od najpoznatijih spomenika hrvatske glagoljaške i pravne baštine.",detail:"Natpis je pronađen u crkvi sv. Lucije u Jurandvoru kraj Baške na otoku Krku. U njemu se spominje kralj Zvonimir, a tekst je važan izvor za proučavanje ranoga hrvatskog jezika, glagoljice i društvene povijesti. Datiranje i tumačenje pojedinih dijelova predmet su stručnog proučavanja.",source:"Za daljnje proučavanje: Hrvatska enciklopedija — natuknica „Bašćanska ploča”."},
{title:"Glagoljaška liturgijska tradicija",summary:"Hrvatski glagoljaši stoljećima su čuvali posebnu slavensku liturgijsku i pisanu tradiciju.",detail:"U dijelovima hrvatske obale i otoka razvila se uporaba staroslavenskoga jezika u liturgiji uz glagoljsko pismo. Ta je praksa ostavila trag u misalima, brevijarima, natpisima i lokalnoj kulturnoj povijesti. Pojedina razdoblja i lokalne prakse razlikuju se pa ih treba opisivati prema konkretnim izvorima.",source:"Za daljnje proučavanje: Hrvatska enciklopedija — natuknice o glagoljici i hrvatskom glagoljaštvu."},
{title:"Zadarska crkva sv. Donata",summary:"Crkva sv. Donata u Zadru jedan je od prepoznatljivih spomenika ranosrednjovjekovne sakralne arhitekture u Hrvatskoj.",detail:"Kružna građevina nastala je u ranom srednjem vijeku i povezuje se s predromaničkom arhitekturom Dalmacije. Njezin oblik i ponovna uporaba antičkih kamenih elemenata svjedoče o slojevitoj povijesti Zadra. Točan opis gradnje i povijesnih okolnosti treba temeljiti na konzervatorskoj i povijesnoumjetničkoj literaturi.",source:"Za daljnje proučavanje: službene kulturno-povijesne publikacije Grada Zadra i konzervatorske službe."},
{title:"Marijanska svetišta i hodočašća",summary:"Hodočašća su oblikovala duhovni život mnogih hrvatskih zajednica i obitelji.",detail:"Svetišta poput Marije Bistrice, Trsata i Sinja povezana su s lokalnim pobožnostima, zavjetima i okupljanjima vjernika. Njihova povijest nije jednaka: svako svetište ima vlastite dokumente, predaje i običaje, a predaju valja jasno razlikovati od potvrđene povijesne činjenice.",source:"Za daljnje proučavanje: službene povijesti pojedinih svetišta i stručna lokalna izdanja."},
{title:"Crkve i samostani kao čuvari baštine",summary:"Sakralni prostori često čuvaju umjetnine, rukopise, arhivsku građu i sjećanje zajednice.",detail:"Crkve i samostani u Hrvatskoj mogu sadržavati slojeve gradnje iz različitih stoljeća, oltare, freske, orgulje, knjige i arhive. Za pouzdano datiranje i pripisivanje umjetnina važni su inventari, konzervatorski elaborati i muzejski ili crkveni katalozi.",source:"Za daljnje proučavanje: Registar kulturnih dobara Republike Hrvatske i katalozi nadležnih muzeja."},
{title:"Vjera u glazbi i pučkim običajima",summary:"Liturgijska i pučka glazba dio su nematerijalne kulturne baštine mnogih hrvatskih krajeva.",detail:"Napjevi, procesije, bratovštine i blagdanski običaji razlikuju se od mjesta do mjesta. Njihovo bilježenje traži razgovor s nositeljima tradicije, terensku dokumentaciju i usporedbu sa stručnim etnomuzikološkim radovima kako se lokalna predaja ne bi prikazala kao jedinstvena praksa cijele Hrvatske.",source:"Za daljnje proučavanje: stručne publikacije etnologije i folkloristike te dokumentacija lokalnih kulturnih ustanova."},
{title:"Obiteljska molitva i prijenos običaja",summary:"Duhovna baština prenosi se i kroz svakodnevne obiteljske navike, blagdane i sjećanja.",detail:"Obiteljske molitve, blagoslovi, pjesme i običaji dio su življene vjere, ali se mogu razlikovati i unutar istoga kraja. Vrijedno ih je bilježiti uz suglasnost članova obitelji te navesti tko svjedoči o običaju i iz kojeg mjesta ili razdoblja potječe.",source:"Za daljnje proučavanje: obiteljska svjedočanstva uz usporedbu s lokalnim etnografskim zbirkama i stručnom literaturom."}
];
let heritageIndex=((dayNumber%heritageStories.length)+heritageStories.length)%heritageStories.length;
const renderHeritage=()=>{
 const story=heritageStories[heritageIndex];
 setText("heritage-heading",story.title);
 setText("heritage-summary",story.summary);
 setText("heritage-detail",story.detail);
 setText("heritage-source",story.source);
};
renderHeritage();
document.getElementById("heritage-next")?.addEventListener("click",()=>{
 heritageIndex=(heritageIndex+1)%heritageStories.length;
 renderHeritage();
});
loadLiturgy();
})();