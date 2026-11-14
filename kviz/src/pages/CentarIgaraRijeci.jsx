import { useEffect, useMemo, useRef, useState } from "react";
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
  { word:"OSIJEK", clue:"Najveći grad Slavonije, smješten uz Dravu.", group:"Gradovi" },
  { word:"PULA", clue:"Istarski grad poznat po rimskom amfiteatru.", group:"Gradovi" },
  { word:"RIJEKA", clue:"Kvarnerski grad s važnom lukom i karnevalskom tradicijom.", group:"Gradovi" },
  { word:"ZADAR", clue:"Dalmatinski grad poznat po Morskim orguljama i Pozdravu Suncu.", group:"Gradovi" },
  { word:"KARLOVAC", clue:"Grad na četiri rijeke, poznat po zvjezdastoj jezgri.", group:"Gradovi" },
  { word:"VARAŽDIN", clue:"Sjeverni hrvatski grad poznat po baroknoj jezgri i Špancirfestu.", group:"Gradovi" },
  { word:"POREČ", clue:"Istarski grad čija je Eufrazijeva bazilika na UNESCO-ovu popisu.", group:"Gradovi" },
  { word:"TROGIR", clue:"Povijesni grad čija je stara jezgra na UNESCO-ovu popisu.", group:"Gradovi" },
  { word:"KORČULA", clue:"Otočni grad poznat po kamenim ulicama i moreškoj.", group:"Gradovi" },
  { word:"PELJEŠAC", clue:"Poluotok poznat po vinogradima i pomorskoj tradiciji.", group:"Zemljopis" },
  { word:"PAG", clue:"Otok poznat po čipki, soli i paškoj janjetini.", group:"Zemljopis" },
  { word:"HVAR", clue:"Dalmatinski otok poznat po lavandi i Starogradskom polju.", group:"Zemljopis" },
  { word:"KRK", clue:"Kvarnerski otok povezan s kopnom mostom.", group:"Zemljopis" },
  { word:"CRES", clue:"Kvarnerski otok na kojem živi bjeloglavi sup.", group:"Zemljopis" },
  { word:"KOPAČKI RIT", clue:"Park prirode i močvarno područje uz Dunav i Dravu.", group:"Priroda" },
  { word:"PLITVICE", clue:"Nacionalni park poznat po jezerima i slapovima.", group:"Priroda" },
  { word:"KRKA", clue:"Rijeka i nacionalni park poznati po sedrenim slapovima.", group:"Priroda" },
  { word:"SAVA", clue:"Rijeka koja protječe kroz Zagreb i ulijeva se u Dunav.", group:"Priroda" },
  { word:"DRAVA", clue:"Rijeka koja protječe kroz Varaždin i Osijek.", group:"Priroda" },
  { word:"NERETVA", clue:"Rijeka koja se ulijeva u Jadran kod delte u južnoj Dalmaciji.", group:"Priroda" },
  { word:"VELEBIT", clue:"Najduža hrvatska planina i park prirode.", group:"Priroda" },
  { word:"BIOKOVO", clue:"Planina iznad Makarske rivijere.", group:"Priroda" },
  { word:"KORNATI", clue:"Nacionalni park otočja u sjevernoj Dalmaciji.", group:"Priroda" },
  { word:"BJELOGLAVI SUP", clue:"Velika zaštićena ptica koja gnijezdi na kvarnerskim otocima.", group:"Priroda" },
  { word:"VUKOVARSKI VODOTORANJ", clue:"Prepoznatljiv simbol obrane Vukovara.", group:"Povijest" },
  { word:"DOMOVINSKI RAT", clue:"Rat za obranu hrvatske neovisnosti i teritorijalne cjelovitosti 1991.–1995.", group:"Povijest" },
  { word:"KRALJ TOMISLAV", clue:"Vladar kojeg hrvatska tradicija pamti kao prvoga hrvatskog kralja.", group:"Povijest" },
  { word:"PETAR ZRINSKI", clue:"Hrvatski velikaš pogubljen u Bečkom Novom Mjestu 1671.", group:"Povijest" },
  { word:"FRAN KRSTO FRANKOPAN", clue:"Hrvatski plemić i književnik pogubljen 1671. zajedno s Petrom Zrinskim.", group:"Povijest" },
  { word:"ANTUN GUSTAV MATOS", clue:"Hrvatski književnik i esejist rođen u Tovarniku.", group:"Kultura" },
  { word:"IVANA BRLIC MAZURANIC", clue:"Hrvatska književnica, autorica Priča iz davnine.", group:"Kultura" },
  { word:"MARKO MARULIC", clue:"Splitski humanist kojeg se naziva ocem hrvatske književnosti.", group:"Kultura" },
  { word:"AUGUST SENOA", clue:"Hrvatski književnik i autor romana Zlatarovo zlato.", group:"Kultura" },
  { word:"NIKOLA TESLA", clue:"Izumitelj i znanstvenik rođen u Smiljanu.", group:"Znanje" },
  { word:"RUĐER BOŠKOVIĆ", clue:"Dubrovčanin, znanstvenik i filozof iz 18. stoljeća.", group:"Znanje" },
  { word:"FAUST VRANČIĆ", clue:"Hrvatski izumitelj povezan s nacrtom padobrana.", group:"Znanje" },
  { word:"ANDRIJA MOHOROVIČIĆ", clue:"Hrvatski geofizičar po kojem je nazvan diskontinuitet u Zemljinoj kori.", group:"Znanje" },
  { word:"VINKOVCI", clue:"Grad u kojem se nalazi jedan od najstarijih kontinuirano naseljenih prostora Europe.", group:"Gradovi" },
  { word:"ILOK", clue:"Istočnoslavonski grad poznat po vinogradima i staroj jezgri.", group:"Gradovi" },
  { word:"SINJSKA ALKA", clue:"Viteško natjecanje koje se održava u Sinju.", group:"Običaji" },
  { word:"MOREŠKA", clue:"Tradicionalni mačevni ples s Korčule.", group:"Običaji" },
  { word:"KUMPANIJA", clue:"Tradicionalna otočna viteška igra s mačevima na Korčuli.", group:"Običaji" },
  { word:"FAŠNIK", clue:"Pokladni običaj i vrijeme maskiranja prije korizme.", group:"Običaji" },
  { word:"KARNEVAL", clue:"Razdoblje pokladnih povorki, maski i veselja.", group:"Običaji" },
  { word:"LICITARSKO SRCE", clue:"Ukrašeni tradicijski dar u obliku srca.", group:"Običaji" },
  { word:"ČIPKA", clue:"Ručno izrađen tekstilni ukras, poznat u Lepoglavi, Pagu i Hvaru.", group:"Baština" },
  { word:"EUPHRASIANA", clue:"Uobičajeni naziv za kompleks Eufrazijeve bazilike u Poreču.", group:"Baština" },
  { word:"KATEDRALA SV JAKOVA", clue:"Šibenski renesansni spomenik na UNESCO-ovu popisu.", group:"Baština" },
  { word:"ARENA", clue:"Rimski amfiteatar u Puli.", group:"Baština" },
  { word:"DUBROVAČKE ZIDINE", clue:"Obrambeni sustav koji okružuje povijesnu jezgru Dubrovnika.", group:"Baština" },
  { word:"VINODOLSKI ZAKON", clue:"Pravni spomenik iz 1288. godine.", group:"Povijest" },
  { word:"HRVATSKI SABOR", clue:"Predstavničko tijelo građana i nositelj zakonodavne vlasti u Hrvatskoj.", group:"Zajednica" },
  { word:"GLAGOLJAŠI", clue:"Ljudi koji su njegovali glagoljsko pismo i bogoslužje.", group:"Baština" },
  { word:"KAMENI CVIJET", clue:"Spomenik žrtvama logora Jasenovac, djelo Bogdana Bogdanovića.", group:"Povijest" },
  { word:"VUKOVARSKA BITKA", clue:"Bitka i opsada grada 1991. godine.", group:"Povijest" },
  { word:"ŠKABRNJA", clue:"Ravno kotarsko mjesto stradalo u studenome 1991.", group:"Povijest" },
  { word:"OVČARA", clue:"Mjesto stradanja ranjenika i civila odvedenih iz vukovarske bolnice 1991.", group:"Povijest" },
  { word:"SVETIŠTE", clue:"Mjesto posebno posvećeno molitvi i hodočašću.", group:"Vjera" },
  { word:"HODOČAŠĆE", clue:"Putovanje vjernika na sveto mjesto.", group:"Vjera" },
  { word:"EVANĐELJE", clue:"Radosna vijest o Isusu Kristu; naziv za četiri novozavjetna spisa.", group:"Vjera" },
  { word:"BETLEHEM", clue:"Mjesto Isusova rođenja prema evanđeoskoj predaji.", group:"Vjera" },
  { word:"NAZARET", clue:"Mjesto u Galileji povezano s Isusovim odrastanjem.", group:"Vjera" },
  { word:"MILOSRĐE", clue:"Suosjećajna i djelatna ljubav prema bližnjemu.", group:"Vjera" },
  { word:"NADA", clue:"Pouzdanje u dobro i budućnost.", group:"Zajednica" },
  { word:"ZAVIČAJ", clue:"Kraj iz kojeg netko potječe ili s kojim je povezan.", group:"Zajednica" },
  { word:"ZAJEDNIŠTVO", clue:"Osjećaj povezanosti i suradnje među ljudima.", group:"Zajednica" },
  { word:"VOLONTERSTVO", clue:"Dobrovoljno djelovanje za dobrobit drugih i zajednice.", group:"Zajednica" },
{ word:"KUPA", clue:"Rijeka koja protječe kroz Karlovac i ulijeva se u Savu kod Siska.", group:"Priroda" },
  { word:"MURA", clue:"Rijeka koja čini dio hrvatske granice na sjeveru.", group:"Priroda" },
  { word:"CETINA", clue:"Rijeka koja izvire u Dalmatinskoj zagori i protječe kroz Omiš.", group:"Priroda" },
  { word:"ZRMANJA", clue:"Rijeka poznata po kanjonu i slapovima u sjevernoj Dalmaciji.", group:"Priroda" },
  { word:"PAPUK", clue:"Planina u Slavoniji i park prirode.", group:"Priroda" },
  { word:"RISNJAK", clue:"Nacionalni park u Gorskom kotaru.", group:"Priroda" },
  { word:"PAKLENICA", clue:"Nacionalni park na južnom Velebitu.", group:"Priroda" },
  { word:"MLJET", clue:"Južnodalmatinski otok s nacionalnim parkom.", group:"Zemljopis" },
  { word:"VIS", clue:"Dalmatinski otok poznat po Modroj špilji na obližnjem Biševu.", group:"Zemljopis" },
  { word:"BRAČ", clue:"Otok na kojem se nalazi poznata plaža Zlatni rat.", group:"Zemljopis" },
  { word:"RAB", clue:"Kvarnerski otok poznat po staroj gradskoj jezgri i rapskoj torti.", group:"Zemljopis" },
  { word:"LASTOVO", clue:"Južnodalmatinski otok i park prirode.", group:"Zemljopis" },
  { word:"LOŠINJ", clue:"Kvarnerski otok poznat po tradiciji pomorstva i dupinima.", group:"Zemljopis" },
  { word:"LIKA", clue:"Planinska hrvatska regija između Velebita i Plješivice.", group:"Zemljopis" },
  { word:"SLAVONIJA", clue:"Istočna hrvatska povijesna regija poznata po ravnicama i tradiciji.", group:"Zemljopis" },
  { word:"BARANJA", clue:"Regija između Drave i Dunava, poznata po vinima i tradiciji.", group:"Zemljopis" },
  { word:"MEĐIMURJE", clue:"Najsjevernija hrvatska županija i povijesna regija između Mure i Drave.", group:"Zemljopis" },
  { word:"ZAGORJE", clue:"Hrvatska regija s brežuljcima, dvorcima i tradicijskim običajima.", group:"Zemljopis" },
  { word:"ISTRA", clue:"Poluotok na sjevernom Jadranu s bogatom kulturnom baštinom.", group:"Zemljopis" },
  { word:"SALONA", clue:"Antički grad i arheološko nalazište pokraj Solina.", group:"Povijest" },
  { word:"NARONA", clue:"Antičko rimsko naselje čiji se ostaci nalaze u Vidu kod Metkovića.", group:"Povijest" },
  { word:"TRAKOŠĆAN", clue:"Poznati dvorac i povijesno imanje u Hrvatskom zagorju.", group:"Baština" },
  { word:"NEHAJ", clue:"Tvrđava iznad Senja, povezana s uskocima.", group:"Baština" },
  { word:"KLIS", clue:"Tvrđava iznad Splita s važnom ulogom u hrvatskoj povijesti.", group:"Baština" },
  { word:"KAMENITA VRATA", clue:"Zagrebački prolaz i svetište s likom Majke Božje od Kamenitih vrata.", group:"Baština" },
  { word:"TRSAT", clue:"Riječko svetište i hodočasničko mjesto na Trsatskom brijegu.", group:"Vjera" },
  { word:"MARIJA BISTRICA", clue:"Najpoznatije hrvatsko marijansko svetište u Hrvatskom zagorju.", group:"Vjera" },
  { word:"STEPINAC", clue:"Zagrebački nadbiskup i kardinal Alojzije, proglašen blaženim.", group:"Vjera" },
  { word:"BEĆARAC", clue:"Tradicionalni napjev iz Slavonije, Baranje i Srijema.", group:"Običaji" },
  { word:"NIJEMO KOLO", clue:"Tradicionalni ples Dalmatinske zagore bez instrumentalne pratnje.", group:"Običaji" },
  { word:"OJKANJE", clue:"Tradicionalni način pjevanja iz dinarskog područja.", group:"Običaji" },
  { word:"KLAPSKO PJEVANJE", clue:"Višeglasno tradicijsko pjevanje povezano s Dalmacijom.", group:"Glazba" },
  { word:"GANGA", clue:"Tradicijski oblik pjevanja raširen u dijelovima Dalmatinske zagore i Hercegovine.", group:"Glazba" },
  { word:"LIČKO PRELO", clue:"Tradicionalno okupljanje uz rad, pjesmu i druženje u Lici.", group:"Običaji" },
  { word:"KONAVLE", clue:"Južnodalmatinski kraj poznat po nošnji, vezu i tradiciji.", group:"Zemljopis" },
  { word:"MOTOVUN", clue:"Istarski gradić na brežuljku, poznat po srednjovjekovnoj jezgri.", group:"Gradovi" },
  { word:"HUM", clue:"Istarsko naselje poznato kao jedan od najmanjih gradova na svijetu.", group:"Gradovi" },
  { word:"KRAŠIĆ", clue:"Mjesto u kojem je rođen blaženi Alojzije Stepinac.", group:"Gradovi" },
  { word:"PETAR KREŠIMIR", clue:"Hrvatski kralj iz 11. stoljeća, povezan s jačanjem kraljevstva.", group:"Povijest" },
  { word:"ZVONIMIR", clue:"Hrvatski kralj iz 11. stoljeća okrunjen u Solinu.", group:"Povijest" },
  { word:"BRANIMIR", clue:"Hrvatski knez iz 9. stoljeća čije je vrijeme povezano s pismom pape Ivana VIII.", group:"Povijest" },
  { word:"LJUDEVIT GAJ", clue:"Hrvatski preporoditelj i jedna od središnjih osoba ilirskog pokreta.", group:"Kultura" },
  { word:"IVAN MAŽURANIĆ", clue:"Hrvatski ban i književnik, autor Smrti Smail-age Čengića.", group:"Kultura" },
  { word:"JURAJ DOBRILA", clue:"Istarski biskup i preporoditelj koji se zalagao za obrazovanje na hrvatskom jeziku.", group:"Povijest" },
  { word:"VUKOVARSKA GOLUBICA", clue:"Prepoznatljiv naziv za spomen-obilježje na mjestu masovne grobnice na Ovčari.", group:"Povijest" },
  { word:"DAN DRŽAVNOSTI", clue:"Hrvatski državni blagdan koji se obilježava 30. svibnja.", group:"Povijest" },
  { word:"DAN SJEĆANJA", clue:"Državni blagdan posvećen sjećanju na žrtve Domovinskog rata i Vukovar i Škabrnju.", group:"Povijest" },
  { word:"VUKOVARSKA BOLNICA", clue:"Bolnica čiji su ranjenici i civili odvedeni na Ovčaru u studenome 1991.", group:"Povijest" },
  { word:"SOLIN", clue:"Grad pokraj Splita s ostacima antičke Salone i važnim ranosrednjovjekovnim lokalitetima.", group:"Gradovi" },
  { word:"SISAK", clue:"Grad na ušću Kupe u Savu, poznat i po utvrdi iz 16. stoljeća.", group:"Gradovi" },
  { word:"SENJ", clue:"Primorski grad poznat po tvrđavi Nehaj i uskocima.", group:"Gradovi" },
  { word:"POŽEGA", clue:"Slavonski grad smješten u Požeškoj kotlini.", group:"Gradovi" },
  { word:"BJELOVAR", clue:"Grad u središnjoj Hrvatskoj i središte Bjelovarsko-bilogorske županije.", group:"Gradovi" },
  { word:"KOPRIVNICA", clue:"Podravski grad poznat po prehrambenoj industriji i renesansnoj utvrdi.", group:"Gradovi" },
  { word:"GOSPIĆ", clue:"Grad u Lici, nedaleko od Smiljana i Memorijalnog centra Nikole Tesle.", group:"Gradovi" },
  { word:"METKOVIĆ", clue:"Grad na Neretvi, blizu arheološkog lokaliteta Narona.", group:"Gradovi" },
  { word:"OPATIJA", clue:"Kvarnerski grad poznat po povijesti turizma i obalnoj šetnici.", group:"Gradovi" },
  { word:"CAVTAT", clue:"Primorsko mjesto južno od Dubrovnika, poznato po mauzoleju obitelji Račić.", group:"Gradovi" }
  { word:"KAMENICA", clue:"Naselje u Hrvatskoj; naziv nose brojna mjesta.", group:"Gradovi" },
  { word:"IMOTSKI", clue:"Grad u Dalmatinskoj zagori poznat po Modrom i Crvenom jezeru.", group:"Gradovi" },
  { word:"MAKARSKA", clue:"Primorski grad podno Biokova.", group:"Gradovi" },
  { word:"OMIŠ", clue:"Grad na ušću Cetine u Jadransko more.", group:"Gradovi" },
  { word:"BIOGRAD", clue:"Obalni grad između Zadra i Šibenika.", group:"Gradovi" },
  { word:"VODICE", clue:"Turistički grad na šibenskoj rivijeri.", group:"Gradovi" },
  { word:"NOVIGRAD", clue:"Ime više hrvatskih mjesta; poznat je istarski i dalmatinski Novigrad.", group:"Gradovi" },
  { word:"UMAG", clue:"Istarski grad na sjeverozapadnoj obali.", group:"Gradovi" },
  { word:"LABIN", clue:"Istarski grad na brežuljku iznad Rapca.", group:"Gradovi" },
  { word:"BUZET", clue:"Istarski grad poznat kao središte tartufarstva.", group:"Gradovi" },
  { word:"PAZIN", clue:"Istarski grad s Kaštelom iznad Pazinske jame.", group:"Gradovi" },
  { word:"ROVINJ", clue:"Istarski obalni grad s prepoznatljivom starom jezgrom.", group:"Gradovi" },
  { word:"VRSAR", clue:"Istarsko mjesto uz Limsku uvalu.", group:"Gradovi" },
  { word:"MALI LOŠINJ", clue:"Najveće naselje otoka Lošinja.", group:"Gradovi" },
  { word:"KRAPINA", clue:"Grad u Hrvatskom zagorju povezan s nalazištem neandertalaca.", group:"Gradovi" },
  { word:"KLANJEC", clue:"Zagorski grad u kojem se nalazi galerija Antuna Augustinčića.", group:"Gradovi" },
  { word:"ZLATAR", clue:"Grad u Hrvatskom zagorju.", group:"Gradovi" },
  { word:"DONJI MIHOLJAC", clue:"Slavonski grad uz rijeku Dravu.", group:"Gradovi" },
  { word:"NAŠICE", clue:"Slavonski grad poznat po dvorcu Pejačević.", group:"Gradovi" },
  { word:"SLATINA", clue:"Grad u Virovitičko-podravskoj županiji.", group:"Gradovi" },
  { word:"ĐURĐEVAC", clue:"Podravski grad poznat po Picokijadi.", group:"Gradovi" },
  { word:"KRIŽEVCI", clue:"Grad u sjeverozapadnoj Hrvatskoj.", group:"Gradovi" },
  { word:"IVANIĆ-GRAD", clue:"Grad u Zagrebačkoj županiji.", group:"Gradovi" },
  { word:"JASTREBARSKO", clue:"Grad jugozapadno od Zagreba, poznat po vinogradima.", group:"Gradovi" },
  { word:"SAMOBOR", clue:"Grad poznat po kremšnitama i fašniku.", group:"Gradovi" },
  { word:"ZAPREŠIĆ", clue:"Grad zapadno od Zagreba povezan s Novim dvorima.", group:"Gradovi" },
  { word:"DUGO SELO", clue:"Grad istočno od Zagreba.", group:"Gradovi" },
  { word:"PETRINJA", clue:"Grad na Banovini uz rijeku Petrinjčicu.", group:"Gradovi" },
  { word:"GLINA", clue:"Grad na Banovini uz istoimenu rijeku.", group:"Gradovi" },
  { word:"HRVATSKA KOSTAJNICA", clue:"Grad na Uni uz granicu s Bosnom i Hercegovinom.", group:"Gradovi" },
  { word:"NOVSKA", clue:"Grad u zapadnoj Slavoniji.", group:"Gradovi" },
  { word:"PAKRAC", clue:"Grad u zapadnoj Slavoniji s važnom povijesnom ulogom.", group:"Gradovi" },
  { word:"DARUVAR", clue:"Grad poznat po termalnim izvorima i dvorcu Janković.", group:"Gradovi" },
  { word:"GAREŠNICA", clue:"Grad u Bjelovarsko-bilogorskoj županiji.", group:"Gradovi" },
  { word:"ČAZMA", clue:"Grad poznat po crkvi svete Marije Magdalene.", group:"Gradovi" },
  { word:"ORAHOVICA", clue:"Slavonski grad podno Papuka.", group:"Gradovi" },
  { word:"VIR", clue:"Otok u zadarskom arhipelagu.", group:"Zemljopis" },
  { word:"DUGI OTOK", clue:"Otok u zadarskom arhipelagu s Parkom prirode Telašćica.", group:"Zemljopis" },
  { word:"UGLJAN", clue:"Otok nasuprot Zadru.", group:"Zemljopis" },
  { word:"PAŠMAN", clue:"Otok povezan mostom s Ugljanom.", group:"Zemljopis" },
  { word:"SILBA", clue:"Otok zadarskog arhipelaga bez automobila.", group:"Zemljopis" },
  { word:"OŠLJAK", clue:"Mali naseljeni otok kod Preka.", group:"Zemljopis" },
  { word:"ŠOLTA", clue:"Otok blizu Splita.", group:"Zemljopis" },
  { word:"DRVENIK VELI", clue:"Otok ispred trogirskog područja.", group:"Zemljopis" },
  { word:"DRVENIK MALI", clue:"Mali otok zapadno od Drvenika Velog.", group:"Zemljopis" },
  { word:"ŠIPAN", clue:"Najveći Elafitski otok.", group:"Zemljopis" },
  { word:"LOPUD", clue:"Elafitski otok poznat po pješčanoj plaži Šunj.", group:"Zemljopis" },
  { word:"KOLOČEP", clue:"Naseljeni Elafitski otok blizu Dubrovnika.", group:"Zemljopis" },
  { word:"KAPRIJE", clue:"Otok u šibenskom arhipelagu.", group:"Zemljopis" },
  { word:"ŽIRJE", clue:"Najudaljeniji naseljeni otok šibenskog arhipelaga.", group:"Zemljopis" },
  { word:"PRVIĆ", clue:"Otok između Vodica i Šibenika.", group:"Zemljopis" },
  { word:"ZLARIN", clue:"Otok poznat po tradiciji obrade koralja.", group:"Zemljopis" },
  { word:"KAKAN", clue:"Nenaseljeni otok u šibenskom arhipelagu.", group:"Zemljopis" },
  { word:"KORNAT", clue:"Najveći otok Nacionalnog parka Kornati.", group:"Zemljopis" },
  { word:"PAŠMANSKI KANAL", clue:"Morski prolaz između Pašmana i kopna.", group:"Zemljopis" },
  { word:"LIMSKI KANAL", clue:"Potopljena riječna dolina na zapadnoj obali Istre.", group:"Zemljopis" },
  { word:"NOVIGRADSKO MORE", clue:"Morski zaljev u sjevernoj Dalmaciji.", group:"Zemljopis" },
  { word:"PROKLJANSKO JEZERO", clue:"Jezero povezano s ušćem rijeke Krke.", group:"Zemljopis" },
  { word:"VRANSKO JEZERO", clue:"Najveće prirodno jezero u Hrvatskoj.", group:"Zemljopis" },
  { word:"BAĆINSKA JEZERA", clue:"Skupina jezera u blizini Ploča.", group:"Zemljopis" },
  { word:"MODRO JEZERO", clue:"Krško jezero u Imotskom.", group:"Zemljopis" },
  { word:"CRVENO JEZERO", clue:"Duboka krška jama ispunjena vodom kod Imotskog.", group:"Zemljopis" },
  { word:"PAZINSKA JAMA", clue:"Krški ponor u središnjoj Istri.", group:"Zemljopis" },
  { word:"ĐURĐEVAČKI PIJESCI", clue:"Pješčano područje u Podravini.", group:"Priroda" },
  { word:"LONJSKO POLJE", clue:"Park prirode poznat po poplavnim pašnjacima i selima.", group:"Priroda" },
  { word:"TELAŠĆICA", clue:"Park prirode na Dugom otoku.", group:"Priroda" },
  { word:"UČKA", clue:"Planina iznad Kvarnera i Istre.", group:"Priroda" },
  { word:"MOSOR", clue:"Planina u zaleđu Splita.", group:"Priroda" },
  { word:"KOZJAK", clue:"Planina iznad Kaštela i Splita.", group:"Priroda" },
  { word:"MEDVEDNICA", clue:"Planina iznad Zagreba.", group:"Priroda" },
  { word:"ŽUMBERAK", clue:"Gorsko područje na granici Hrvatske i Slovenije.", group:"Priroda" },
  { word:"PSUNJ", clue:"Planina u zapadnoj Slavoniji.", group:"Priroda" },
  { word:"BILOGORA", clue:"Nisko gorje u sjevernoj Hrvatskoj.", group:"Priroda" },
  { word:"MOSLAVAČKA GORA", clue:"Gorje između Moslavine i Bilogore.", group:"Priroda" },
  { word:"PETROVA GORA", clue:"Šumovito gorje na Kordunu.", group:"Priroda" },
  { word:"KALNIK", clue:"Gorje sjeveroistočno od Križevaca.", group:"Priroda" },
  { word:"IVANŠČICA", clue:"Najviša planina Hrvatskog zagorja.", group:"Priroda" },
  { word:"RAVNA GORA", clue:"Planina u Hrvatskom zagorju.", group:"Priroda" },
  { word:"SJEVERNI VELEBIT", clue:"Nacionalni park u sjevernom dijelu Velebita.", group:"Priroda" },
  { word:"BRIJUNI", clue:"Nacionalni park otočja uz zapadnu obalu Istre.", group:"Priroda" },
  { word:"PLITVIČKA JEZERA", clue:"Nacionalni park poznat po jezerima i slapovima.", group:"Priroda" },
  { word:"KRAPINSKE TOPLICE", clue:"Poznato termalno lječilište u Hrvatskom zagorju.", group:"Priroda" },
  { word:"TOPUSKO", clue:"Mjesto poznato po termalnim izvorima.", group:"Priroda" },
  { word:"DOBRA", clue:"Rijeka koja protječe kroz Ogulin i Karlovac.", group:"Priroda" },
  { word:"KORANA", clue:"Rijeka koja istječe iz Plitvičkih jezera.", group:"Priroda" },
  { word:"MREŽNICA", clue:"Rijeka poznata po slapovima i sedrenim barijerama.", group:"Priroda" },
  { word:"UNA", clue:"Rijeka uz hrvatsko-bosanskohercegovačku granicu.", group:"Priroda" },
  { word:"BOSUT", clue:"Rijeka koja protječe kroz Vinkovce.", group:"Priroda" },
  { word:"ORLJAVA", clue:"Rijeka u Požeškoj kotlini.", group:"Priroda" },
  { word:"ILOVA", clue:"Rijeka u zapadnoj Slavoniji i Moslavini.", group:"Priroda" },
  { word:"LONJA", clue:"Rijeka u središnjoj Hrvatskoj.", group:"Priroda" },
  { word:"BEDNJA", clue:"Rijeka u Hrvatskom zagorju.", group:"Priroda" },
  { word:"KARAŠICA", clue:"Rijeka u Slavoniji i Baranji.", group:"Priroda" },
  { word:"MIRNA", clue:"Najduža rijeka u Istri.", group:"Priroda" },
  { word:"RAŠA", clue:"Rijeka na istočnoj obali Istre.", group:"Priroda" },
  { word:"RIČINA", clue:"Kratka rijeka u Zadru.", group:"Priroda" },
  { word:"JARUGA", clue:"Naziv povezan s hidroenergetskim postrojenjima na Krki.", group:"Priroda" },
  { word:"DUNAV", clue:"Velika europska rijeka koja protječe uz Vukovar i Ilok.", group:"Priroda" },
  { word:"SUTLA", clue:"Rijeka koja dijelom čini granicu Hrvatske i Slovenije.", group:"Priroda" },
  { word:"JESENICE", clue:"Ime više hrvatskih mjesta; nije povijesni događaj.", group:"Povijest" },
  { word:"DUBROVAČKA REPUBLIKA", clue:"Povijesna pomorska republika sa sjedištem u Dubrovniku.", group:"Povijest" },
  { word:"PAVLINSKI RED", clue:"Katolički red koji je imao važnu ulogu u hrvatskoj povijesti.", group:"Povijest" },
  { word:"HABSBURŠKA MONARHIJA", clue:"Vladarska zajednica kojoj su pripadale hrvatske zemlje.", group:"Povijest" },
  { word:"ILIRSKI POKRET", clue:"Kulturno-politički pokret hrvatskog narodnog preporoda.", group:"Povijest" },
  { word:"HRVATSKI NARODNI PREPOROD", clue:"Pokret za kulturno i jezično buđenje u 19. stoljeću.", group:"Povijest" },
  { word:"ZAVRŠETAK RATA", clue:"Pojam koji označava završetak oružanog sukoba.", group:"Povijest" },
  { word:"ZRINSKO-FRANKOPANSKA UROTA", clue:"Povijesna urota hrvatskog i ugarskog plemstva u 17. stoljeću.", group:"Povijest" },
  { word:"SELJAČKA BUNA", clue:"Pobuna seljaka 1573. godine pod vodstvom Matije Gupca.", group:"Povijest" },
  { word:"MATIJA GUBEC", clue:"Vođa Seljačke bune 1573. godine.", group:"Povijest" },
  { word:"GVOZDANSKO", clue:"Utvrda i mjesto poznato po obrani u 16. stoljeću.", group:"Povijest" },
  { word:"KRALJ PETAR SVAČIĆ", clue:"Hrvatski kralj povezan s bitkom na Gvozdu.", group:"Povijest" },
  { word:"PODBORJE", clue:"Povijesni naziv povezan s područjem Papuka.", group:"Povijest" },
  { word:"KRALJ DMITAR ZVONIMIR", clue:"Hrvatski kralj iz 11. stoljeća.", group:"Povijest" },
  { word:"KNEZ DOMAGOJ", clue:"Hrvatski knez iz 9. stoljeća poznat iz franačkih i mletačkih izvora.", group:"Povijest" },
  { word:"KNEZ TRPIMIR", clue:"Hrvatski knez iz 9. stoljeća povezan s Trpimirovom darovnicom.", group:"Povijest" },
  { word:"TRPIMIROVA DAROVNICA", clue:"Isprava iz 852. godine važna za hrvatsku povijest.", group:"Povijest" },
  { word:"PISMO PAPE IVANA VIII.", clue:"Pisma povezana s knezom Branimirom i priznanjem njegove vlasti.", group:"Povijest" },
  { word:"KRUNIDBA TOMISLAVA", clue:"Tradicionalno datirana u 925. godinu, uz povijesne rasprave o detaljima.", group:"Povijest" },
  { word:"HRVATSKO-UGARSKA NAGODBA", clue:"Politički sporazum iz 1868. godine.", group:"Povijest" },
  { word:"SABOR U CETINU", clue:"Sabor 1527. na kojem je izabran Ferdinand Habsburški za hrvatskog kralja.", group:"Povijest" },
  { word:"KRALJEVSKI GRAD NIN", clue:"Važno ranosrednjovjekovno središte hrvatskih vladara.", group:"Povijest" },
  { word:"SOLINSKI SABOR", clue:"Crkveni sabori održani u Solinu u 10. stoljeću.", group:"Povijest" },
  { word:"BAŠKA", clue:"Mjesto na Krku povezano s Bašćanskom pločom.", group:"Povijest" },
  { word:"KOSINJ", clue:"Ličko mjesto povezano s poviješću tiskarstva i glagoljice.", group:"Povijest" },
  { word:"SENJSKA GLAGOLJSKA TISKARA", clue:"Tiskara koja je djelovala u Senju krajem 15. i početkom 16. stoljeća.", group:"Povijest" },
  { word:"MISAL PO ZAKONU RIMSKOGA DVORA", clue:"Prva hrvatska tiskana knjiga iz 1483. godine.", group:"Povijest" },
  { word:"HRVOJEV MISAL", clue:"Ilustrirani glagoljski misal iz početka 15. stoljeća.", group:"Povijest" },
  { word:"VINODOLSKI ZAKONIK", clue:"Pravni spomenik iz 1288. godine; već postoji sličan naziv.", group:"Povijest" },
  { word:"ZAGREBAČKA ZLATNA BULA", clue:"Povelja Bele IV. iz 1242. godine kojom Zagreb dobiva povlastice slobodnog kraljevskog grada.", group:"Povijest" },
  { word:"KRAPINSKI PRAČOVJEK", clue:"Naziv za neandertalske fosilne ostatke pronađene na Hušnjakovu brdu.", group:"Povijest" },
  { word:"HUŠNJAKOVO", clue:"Nalazište neandertalaca u Krapini.", group:"Povijest" },
  { word:"VUKOVARSKA OBRANA", clue:"Obrana grada tijekom opsade 1991. godine.", group:"Povijest" },
  { word:"BITKA ZA VUKOVAR", clue:"Opsada i borbe za Vukovar 1991. godine.", group:"Povijest" },
  { word:"BITKA ZA VUKOVARSKI VODOTORANJ", clue:"Simbolična obrana vodotornja tijekom Domovinskog rata.", group:"Povijest" },
  { word:"MASLENICA", clue:"Vojno-redarstvena operacija iz siječnja 1993. godine.", group:"Povijest" },
  { word:"MEDAČKI DŽEP", clue:"Vojno-redarstvena operacija iz rujna 1993. godine.", group:"Povijest" },
  { word:"BLJESAK", clue:"Vojno-redarstvena operacija iz svibnja 1995. godine.", group:"Povijest" },
  { word:"OSLOBODILAČKE OPERACIJE", clue:"Naziv za vojne operacije kojima je vraćan okupirani teritorij.", group:"Povijest" },
  { word:"ZBOR NARODNE GARDE", clue:"Prva profesionalna oružana formacija Republike Hrvatske 1991. godine.", group:"Povijest" },
  { word:"HRVATSKA POLICIJA", clue:"Policijske snage koje su sudjelovale u obrani Hrvatske.", group:"Povijest" },
  { word:"BRANITELJI", clue:"Sudionici obrane Republike Hrvatske u Domovinskom ratu.", group:"Povijest" },
  { word:"SPOMEN-PODRUČJE", clue:"Prostor uređen u znak sjećanja na povijesni događaj ili žrtve.", group:"Povijest" },
  { word:"MEMORIJALNI CENTAR", clue:"Ustanova koja čuva dokumentaciju i sjećanje na događaje.", group:"Povijest" },
  { word:"DAN NEOVISNOSTI", clue:"Hrvatski državni blagdan koji se obilježava 8. listopada.", group:"Povijest" },
  { word:"DAN POBJEDE", clue:"Naziv povezan s obilježavanjem završetka operacije Oluja.", group:"Povijest" },
  { word:"DAN HRVATSKIH BRANITELJA", clue:"Obilježava se 5. kolovoza.", group:"Povijest" },
  { word:"DAN SJEĆANJA NA ŽRTVU VUKOVARA", clue:"Obilježava se 18. studenoga.", group:"Povijest" },
  { word:"DAN SJEĆANJA NA ŠKABRNJU", clue:"Komemoracija žrtava stradanja u Škabrnji.", group:"Povijest" },
  { word:"DAN EUROPE", clue:"Obilježava se 9. svibnja.", group:"Povijest" },
  { word:"KULTURA SJEĆANJA", clue:"Način na koji zajednica čuva i prenosi sjećanje na prošlost.", group:"Povijest" },
  { word:"KONCENTRACIJSKI LOGOR", clue:"Mjesto sustavnog zatočenja ljudi; pojam zahtijeva povijesni kontekst.", group:"Povijest" },
  { word:"JASENOVAC", clue:"Mjesto logora i spomen-područja iz Drugoga svjetskog rata.", group:"Povijest" },
  { word:"STARA GRADIŠKA", clue:"Mjesto povijesnog zatvora i logora.", group:"Povijest" },
  { word:"BLEIBURG", clue:"Mjesto povezano s poratnim događajima u svibnju 1945. godine.", group:"Povijest" },
  { word:"KRIŽNI PUT", clue:"Naziv za poratne marševe i stradanja zarobljenika 1945. godine.", group:"Povijest" },
  { word:"TEZNO", clue:"Stratište i masovna grobnica iz poratnog razdoblja u Sloveniji.", group:"Povijest" },
  { word:"Hrvatski memorijalni dokumentacijski centar", clue:"Ustanova koja prikuplja i obrađuje dokumentaciju Domovinskog rata.", group:"Povijest" },
  { word:"MIRNA REINTEGRACIJA", clue:"Proces mirnog povratka hrvatskog Podunavlja u ustavno-pravni poredak Hrvatske.", group:"Povijest" },
  { word:"ERDUTSKI SPORAZUM", clue:"Sporazum iz 1995. godine koji je omogućio mirnu reintegraciju.", group:"Povijest" },
  { word:"KULTURNA BAŠTINA", clue:"Naslijeđena materijalna i nematerijalna dobra zajednice.", group:"Baština" },
  { word:"NEMATERIJALNA BAŠTINA", clue:"Znanja, običaji, izvedbe i vještine koje zajednice prenose.", group:"Baština" },
  { word:"MATERIJALNA BAŠTINA", clue:"Građevine, predmeti i lokaliteti povijesne ili kulturne vrijednosti.", group:"Baština" },
  { word:"ETNOGRAFSKI MUZEJ", clue:"Muzej koji čuva predmete i znanja o tradicijskoj kulturi.", group:"Baština" },
  { word:"MUZEJ HRVATSKIH ARHEOLOŠKIH SPOMENIKA", clue:"Muzej u Splitu posvećen ranosrednjovjekovnoj baštini.", group:"Baština" },
  { word:"ARHEOLOŠKI MUZEJ", clue:"Ustanova koja čuva i proučava arheološke nalaze.", group:"Baština" },
  { word:"MIMARA", clue:"Zagrebački muzej poznat po umjetničkim zbirkama.", group:"Baština" },
  { word:"MUZEJ SUVREMENE UMJETNOSTI", clue:"Muzej u Zagrebu posvećen suvremenoj umjetnosti.", group:"Baština" },
  { word:"MUZEJ GRADA ZAGREBA", clue:"Muzej koji prikazuje povijest Zagreba.", group:"Baština" },
  { word:"ETNOGRAFSKI MUZEJ ZAGREB", clue:"Muzej tradicijske kulture u Zagrebu.", group:"Baština" },
  { word:"MUZEJ SLAVONIJE", clue:"Muzej u Osijeku s povijesnim i kulturnim zbirkama.", group:"Baština" },
  { word:"MUZEJ SINJSKE ALKE", clue:"Muzej posvećen povijesti i tradiciji Sinjske alke.", group:"Baština" },
  { word:"MUZEJ NINSKIH STARINA", clue:"Muzejska zbirka povezana s arheološkom baštinom Nina.", group:"Baština" },
  { word:"DIOKLECIJANOVA PALAČA", clue:"Palača rimskog cara u Splitu, dio UNESCO-ove baštine.", group:"Baština" },
  { word:"PERISTIL", clue:"Središnji trg Dioklecijanove palače u Splitu.", group:"Baština" },
  { word:"ZLATNA VRATA", clue:"Monumentalni ulaz u Dioklecijanovu palaču.", group:"Baština" },
  { word:"SREBRNA VRATA", clue:"Jedan od povijesnih ulaza u Dioklecijanovu palaču.", group:"Baština" },
  { word:"JUPITEROV HRAM", clue:"Antički hram u Dioklecijanovoj palači.", group:"Baština" },
  { word:"EUPRAZIJEVA BAZILIKA", clue:"Ranosrednjovjekovni kompleks u Poreču pod zaštitom UNESCO-a.", group:"Baština" },
  { word:"SVETI DONAT", clue:"Predromanička crkva u Zadru.", group:"Baština" },
  { word:"KATEDRALA SVETE STOŠIJE", clue:"Zadarska katedrala posvećena svetoj Anastaziji.", group:"Baština" },
  { word:"KATEDRALA SVETOG DUJMA", clue:"Splitska katedrala smještena u nekadašnjem Dioklecijanovu mauzoleju.", group:"Baština" },
  { word:"KATEDRALA SVETOG LOVRE", clue:"Katedrala u Trogiru poznata po Radovanovu portalu.", group:"Baština" },
  { word:"RADOVANOV PORTAL", clue:"Romanički portal trogirske katedrale iz 13. stoljeća.", group:"Baština" },
  { word:"ŠIBENSKA KATEDRALA", clue:"Katedrala sv. Jakova; UNESCO-ova svjetska baština.", group:"Baština" },
  { word:"STARI GRAD DUBROVNIK", clue:"Povijesna jezgra Dubrovnika pod zaštitom UNESCO-a.", group:"Baština" },
  { word:"STARI GRAD TROGIR", clue:"Povijesna jezgra Trogira pod zaštitom UNESCO-a.", group:"Baština" },
  { word:"STAROGRADSKO POLJE", clue:"Kulturni krajolik na Hvaru pod zaštitom UNESCO-a.", group:"Baština" },
  { word:"STEĆCI", clue:"Srednjovjekovni nadgrobni spomenici rasprostranjeni u više zemalja.", group:"Baština" },
  { word:"SREDNJOVJEKOVNI GRAD", clue:"Utvrđeno naselje ili sjedište vlastelinstva iz srednjeg vijeka.", group:"Baština" },
  { word:"DVORAC PEJAČEVIĆ", clue:"Povijesni dvorac u Našicama.", group:"Baština" },
  { word:"DVORAC TRAKOŠĆAN", clue:"Dvorac u Hrvatskom zagorju s jezerom i perivojem.", group:"Baština" },
  { word:"DVORAC VELIKI TABOR", clue:"Utvrđeni dvorac u Hrvatskom zagorju.", group:"Baština" },
  { word:"DVORAC ORŠIĆ", clue:"Dvorac u Gornjoj Stubici u kojem se nalazi Muzej seljačkih buna.", group:"Baština" },
  { word:"DVORAC LUŽNICA", clue:"Barokni dvorac u blizini Zaprešića.", group:"Baština" },
  { word:"DVORAC OZALJ", clue:"Dvorac iznad Kupe povezan sa Zrinskima i Frankopanima.", group:"Baština" },
  { word:"STARI GRAD OZALJ", clue:"Povijesna utvrda iznad rijeke Kupe.", group:"Baština" },
  { word:"UTVRDA KLIS", clue:"Povijesna tvrđava iznad Splita.", group:"Baština" },
  { word:"TVRĐAVA SVETOG NIKOLE", clue:"Pomorska utvrda na ulazu u kanal sv. Ante kod Šibenika.", group:"Baština" },
  { word:"TVRĐAVA BARONE", clue:"Šibenska tvrđava iznad grada.", group:"Baština" },
  { word:"TVRĐAVA SVETOG MIHOVILA", clue:"Povijesna tvrđava u Šibeniku.", group:"Baština" },
  { word:"TVRĐAVA LOVRIJENAC", clue:"Tvrđava na stijeni izvan dubrovačkih zidina.", group:"Baština" },
  { word:"TVRĐAVA MINČETA", clue:"Dubrovačka tvrđava i dio gradskih zidina.", group:"Baština" },
  { word:"TVRĐAVA BOKAR", clue:"Dubrovačka utvrda koja štiti zapadni prilaz gradu.", group:"Baština" },
  { word:"TVRĐAVA NEHAJ", clue:"Senjska tvrđava iz 16. stoljeća.", group:"Baština" },
  { word:"TVRĐAVA SISAK", clue:"Renesansna utvrda na ušću Kupe u Savu.", group:"Baština" },
  { word:"TVRĐAVA BROD", clue:"Barokna tvrđava u Slavonskom Brodu.", group:"Baština" },
  { word:"TVRĐAVA OSIJEK", clue:"Povijesna osječka Tvrđa.", group:"Baština" },
  { word:"TVRĐAVA KNIN", clue:"Velika utvrda iznad grada Knina.", group:"Baština" },
  { word:"TVRĐAVA MEDVEDGRAD", clue:"Srednjovjekovna utvrda na Medvednici.", group:"Baština" },
  { word:"TVRĐAVA GVOZDANSKO", clue:"Povijesna utvrda na Banovini.", group:"Baština" },
  { word:"KAMENI MOST", clue:"Povijesni most građen od kamena.", group:"Baština" },
  { word:"STARI MOST", clue:"Naziv povijesnog mosta u više hrvatskih mjesta.", group:"Baština" },
  { word:"MOST DR. FRANJE TUĐMANA", clue:"Most koji povezuje dijelove Dubrovnika.", group:"Baština" },
  { word:"MOST MLADOSTI", clue:"Most preko Save u Zagrebu.", group:"Baština" },
  { word:"MOST SLOBODE", clue:"Prometni most preko Save u Zagrebu.", group:"Baština" },
  { word:"MURSKO SREDIŠĆE", clue:"Grad u Međimurju na rijeci Muri.", group:"Gradovi" },
  { word:"PRELOG", clue:"Grad u Međimurju blizu akumulacije HE Dubrava.", group:"Gradovi" },
  { word:"LEGRAD", clue:"Naselje na ušću Mure u Dravu.", group:"Zemljopis" },
  { word:"DONJA DUBRAVA", clue:"Međimursko naselje uz Dravu.", group:"Zemljopis" },
  { word:"KOTORIBA", clue:"Naselje na istoku Međimurja uz Muru.", group:"Zemljopis" },
  { word:"VARAŽDINSKE TOPLICE", clue:"Grad poznat po termalnim izvorima i arheološkim nalazima.", group:"Gradovi" },
  { word:"LUDBREG", clue:"Podravski grad povezan s predajom o središtu svijeta.", group:"Gradovi" },
  { word:"NOVI MAROF", clue:"Grad u Varaždinskoj županiji.", group:"Gradovi" },
  { word:"LEPOGLAVA", clue:"Grad poznat po čipki i nekadašnjem pavlinskom samostanu.", group:"Gradovi" },
  { word:"IVANEC", clue:"Grad podno Ivanščice.", group:"Gradovi" },
  { word:"KUMROVEC", clue:"Zagorsko mjesto s Muzejom na otvorenom Staro selo.", group:"Gradovi" },
  { word:"GORNJA STUBICA", clue:"Mjesto Seljačke bune i spomenika Matiji Gupcu.", group:"Gradovi" },
  { word:"DONJA STUBICA", clue:"Grad u Hrvatskom zagorju.", group:"Gradovi" },
  { word:"DESINIĆ", clue:"Mjesto u Hrvatskom zagorju povezano s Velikim Taborom.", group:"Gradovi" },
  { word:"PREGRADA", clue:"Grad u Hrvatskom zagorju.", group:"Gradovi" },
  { word:"KUTINA", clue:"Grad u Moslavini.", group:"Gradovi" },
  { word:"POPOVAČA", clue:"Grad u Moslavini.", group:"Gradovi" },
  { word:"SIRAČ", clue:"Naselje u zapadnoj Slavoniji.", group:"Zemljopis" },
  { word:"LIPIK", clue:"Grad poznat po lječilištu i ergeli lipicanaca.", group:"Gradovi" },
  { word:"KUTJEVO", clue:"Slavonski grad poznat po vinogradarstvu.", group:"Gradovi" },
  { word:"PLETERNICA", clue:"Grad u Požeško-slavonskoj županiji.", group:"Gradovi" },
  { word:"VETOVO", clue:"Naselje u Požeškoj kotlini.", group:"Zemljopis" },
  { word:"SLAVONSKI BROD", clue:"Grad na Savi s baroknom tvrđavom.", group:"Gradovi" },
  { word:"ŽUPANJA", clue:"Grad u istočnoj Slavoniji poznat po tradiciji šokaca.", group:"Gradovi" },
  { word:"OTOK", clue:"Grad u Vukovarsko-srijemskoj županiji.", group:"Gradovi" },
  { word:"GUNJA", clue:"Naselje uz Savu u županjskoj Posavini.", group:"Zemljopis" },
  { word:"DRENOVCI", clue:"Naselje u Cvelferiji.", group:"Zemljopis" },
  { word:"BABINA GREDA", clue:"Selo u županjskoj Posavini.", group:"Zemljopis" },
  { word:"TOVARNIK", clue:"Istočnoslavonsko mjesto rodno mjesto Antuna Gustava Matoša.", group:"Zemljopis" },
  { word:"LOVAS", clue:"Naselje u istočnoj Slavoniji stradalo u Domovinskom ratu.", group:"Zemljopis" },
  { word:"BOROVO", clue:"Naselje uz Dunav nedaleko od Vukovara.", group:"Zemljopis" },
  { word:"NUŠTAR", clue:"Naselje pokraj Vinkovaca poznato po dvorcu.", group:"Zemljopis" },
  { word:"BOGDANOVCI", clue:"Mjesto u blizini Vukovara, važno u obrani 1991.", group:"Zemljopis" },
  { word:"MARINCI", clue:"Naselje u Vukovarsko-srijemskoj županiji.", group:"Zemljopis" },
  { word:"PETROVCI", clue:"Naselje u istočnoj Slavoniji.", group:"Zemljopis" },
  { word:"TORDINCI", clue:"Naselje u Vukovarsko-srijemskoj županiji.", group:"Zemljopis" },
  { word:"OGULIN", clue:"Grad podno Kleka, povezan s Ivanom Brlić-Mažuranić.", group:"Gradovi" },
  { word:"SLUNJ", clue:"Grad poznat po Rastokama.", group:"Gradovi" },
  { word:"RASTOKE", clue:"Vodeničarsko naselje i slapovi u Slunju.", group:"Baština" },
  { word:"DREŽNIK GRAD", clue:"Povijesna utvrda u blizini Plitvičkih jezera.", group:"Baština" },
  { word:"OZALJ", clue:"Grad na Kupi s povijesnim dvorcem.", group:"Gradovi" },
  { word:"DELNICE", clue:"Najveći grad Gorskog kotara.", group:"Gradovi" },
  { word:"ČABAR", clue:"Grad u Gorskom kotaru uz granicu sa Slovenijom.", group:"Gradovi" },
  { word:"FUŽINE", clue:"Gorskokotarsko mjesto uz jezero Bajer.", group:"Gradovi" },
  { word:"VRBOVSKO", clue:"Grad u Gorskom kotaru.", group:"Gradovi" },
  { word:"BAKAR", clue:"Povijesni primorski grad u Bakarskom zaljevu.", group:"Gradovi" },
  { word:"KRALJEVICA", clue:"Primorski grad s dvorcem Frankopan.", group:"Gradovi" },
  { word:"CRIKVENICA", clue:"Kvarnerski grad i turističko središte.", group:"Gradovi" },
  { word:"NOVI VINODOLSKI", clue:"Primorski grad povezan s Vinodolskim zakonikom.", group:"Gradovi" },
  { word:"STARIGRAD", clue:"Ime više hrvatskih naselja; Starigrad-Paklenica je pod Velebitom.", group:"Gradovi" },
  { word:"OBROVAC", clue:"Grad na rijeci Zrmanji.", group:"Gradovi" },
  { word:"BENKOVAC", clue:"Grad u Ravnim kotarima.", group:"Gradovi" },
  { word:"DRNIŠ", clue:"Grad u Dalmatinskoj zagori poznat po pršutu.", group:"Gradovi" },
  { word:"SKRADIN", clue:"Grad na Krki blizu nacionalnog parka.", group:"Gradovi" },
  { word:"TRILJ", clue:"Grad na Cetini u Dalmatinskoj zagori.", group:"Gradovi" },
  { word:"VRGORAC", clue:"Grad u Dalmatinskoj zagori.", group:"Gradovi" },
  { word:"PLOČE", clue:"Lučki grad na ušću Neretve.", group:"Gradovi" },
  { word:"OPUZEN", clue:"Grad u dolini Neretve poznat po mandarinama.", group:"Gradovi" },
  { word:"STON", clue:"Pelješki grad poznat po zidinama i solani.", group:"Gradovi" },
  { word:"OREBIĆ", clue:"Pelješki grad s pomorskom tradicijom.", group:"Gradovi" },
  { word:"TRPANJ", clue:"Naselje na Pelješcu.", group:"Gradovi" },
  { word:"JANJINA", clue:"Naselje u središnjem dijelu Pelješca.", group:"Zemljopis" },
  { word:"BLATO", clue:"Naselje na otoku Korčuli.", group:"Gradovi" },
  { word:"VELA LUKA", clue:"Naselje na zapadnom dijelu Korčule.", group:"Gradovi" },
  { word:"TRSTENO", clue:"Naselje poznato po povijesnom arboretumu.", group:"Zemljopis" },
  { word:"ARBoretum TRSTENO", clue:"Povijesni arboretum u blizini Dubrovnika.", group:"Baština" },
  { word:"ELAFITI", clue:"Skupina otoka zapadno od Dubrovnika.", group:"Zemljopis" },
  { word:"NERETVANSKA DOLINA", clue:"Plodna dolina rijeke Neretve.", group:"Zemljopis" },
  { word:"RAVNI KOTARI", clue:"Geografska regija u zaleđu Zadra.", group:"Zemljopis" },
  { word:"BUKOVICA", clue:"Krška regija u sjevernoj Dalmaciji.", group:"Zemljopis" },
  { word:"DALMATINSKA ZAGORA", clue:"Unutrašnji dio Dalmacije.", group:"Zemljopis" },
  { word:"CETINSKA KRAJINA", clue:"Područje uz rijeku Cetinu.", group:"Zemljopis" },
  { word:"IMOTSKA KRAJINA", clue:"Područje oko Imotskog.", group:"Zemljopis" },
  { word:"POLJICA", clue:"Povijesna kneževina u srednjoj Dalmaciji.", group:"Zemljopis" },
  { word:"KORDUN", clue:"Povijesno-geografska regija središnje Hrvatske.", group:"Zemljopis" },
  { word:"BANOVINA", clue:"Povijesna regija u središnjoj Hrvatskoj.", group:"Zemljopis" },
  { word:"MOSLAVINA", clue:"Regija između Save, Lonje i Ilove.", group:"Zemljopis" },
  { word:"PODRAVINA", clue:"Regija uz rijeku Dravu.", group:"Zemljopis" },
  { word:"POSAVINA", clue:"Regija uz rijeku Savu.", group:"Zemljopis" },
  { word:"SRIJEM", clue:"Povijesna regija između Dunava i Save.", group:"Zemljopis" },
  { word:"GORSKI KOTAR", clue:"Gorsko područje između Like, Kvarnera i Slovenije.", group:"Zemljopis" },
  { word:"HRVATSKO PRIMORJE", clue:"Obalno područje od Rijeke prema Senju.", group:"Zemljopis" },
  { word:"KVARNER", clue:"Zaljev i šire primorsko područje s otocima.", group:"Zemljopis" },
  { word:"DALMACIJA", clue:"Povijesna regija uz istočnu obalu Jadrana.", group:"Zemljopis" },
  { word:"SLAVONSKA POSAVINA", clue:"Područje uz Savu u Slavoniji.", group:"Zemljopis" },
  { word:"ZAGREBAČKA REGIJA", clue:"Područje oko glavnog grada Hrvatske.", group:"Zemljopis" },
  { word:"PRIGORJE", clue:"Povijesni naziv za područja uz gorske padine.", group:"Zemljopis" },
  { word:"TUROPOLJE", clue:"Povijesna regija južno od Zagreba.", group:"Zemljopis" },
  { word:"PODUNAVLJE", clue:"Područje uz tok Dunava.", group:"Zemljopis" },
  { word:"ISTARSKO ZALEĐE", clue:"Unutrašnji dio istarskog poluotoka.", group:"Zemljopis" },
  { word:"SJEVERNA DALMACIJA", clue:"Dio Dalmacije od zadarskog do šibenskog područja.", group:"Zemljopis" },
  { word:"SREDNJA DALMACIJA", clue:"Dio Dalmacije oko Splita i okolnih otoka.", group:"Zemljopis" },
  { word:"JUŽNA DALMACIJA", clue:"Dio Dalmacije oko Dubrovnika i donje Neretve.", group:"Zemljopis" },
  { word:"GLAGOLJ", clue:"Pojedinačno slovo glagoljskog pisma.", group:"Baština" },
  { word:"MISAL", clue:"Liturgijska knjiga koja sadrži tekstove mise.", group:"Baština" },
  { word:"BREVIJAR", clue:"Liturgijska knjiga časoslova.", group:"Baština" },
  { word:"HRVATSKI TROPLET", clue:"Pleterni ukrasni motiv u hrvatskoj ranosrednjovjekovnoj baštini.", group:"Baština" },
  { word:"VINOGRADARSTVO", clue:"Tradicionalna djelatnost uzgoja vinove loze.", group:"Baština" },
  { word:"MASLINARSTVO", clue:"Tradicionalni uzgoj maslina i proizvodnja maslinova ulja.", group:"Baština" },
  { word:"BRODOGRADNJA", clue:"Djelatnost gradnje brodova s dugom tradicijom na Jadranu.", group:"Baština" },
  { word:"POMORSTVO", clue:"Plovidba, brodarstvo i pomorska djelatnost.", group:"Baština" },
  { word:"KAMENOKLESARSTVO", clue:"Obrtnička vještina obrade kamena.", group:"Baština" },
  { word:"ČIPKARSTVO", clue:"Tradicionalna izrada čipke, poznata u Pagu i Lepoglavi.", group:"Baština" },
  { word:"DRVENARSTVO", clue:"Tradicionalna obrada drva i izrada predmeta.", group:"Baština" },
  { word:"TKANJE", clue:"Ručno izrađivanje tkanina na tkalačkom stanu.", group:"Baština" },
  { word:"VEZ", clue:"Ukrašavanje tekstila iglom i koncem.", group:"Baština" },
  { word:"NOŠNJA", clue:"Tradicionalna odjeća određenog kraja.", group:"Baština" },
  { word:"POSKOK", clue:"Otrovna zmija koja živi i u hrvatskim krškim područjima.", group:"Priroda" },
  { word:"RIS", clue:"Velika euroazijska mačka koja živi i u hrvatskim šumama.", group:"Priroda" },
  { word:"VUK", clue:"Velika zvijer koja obitava u hrvatskim planinskim područjima.", group:"Priroda" },
  { word:"MEDVJED", clue:"Velika zvijer koja živi u šumama Gorskog kotara i Like.", group:"Priroda" },
  { word:"VIDRA", clue:"Poluvodena životinja koja obitava uz čiste rijeke.", group:"Priroda" },
  { word:"ČOVJEČJA RIBICA", clue:"Endemska podzemna životinja koja živi u krškim vodama.", group:"Priroda" },
  { word:"DUPIN", clue:"Morski sisavac koji obitava u Jadranu.", group:"Priroda" },
  { word:"TUNA", clue:"Velika morska riba važna za Jadransko ribarstvo.", group:"Priroda" },
  { word:"JADRANSKA HOBOTNICA", clue:"Morski mekušac koji živi u Jadranu.", group:"Priroda" },
  { word:"POSIDONIJA", clue:"Morska cvjetnica važna za ekosustav Jadrana.", group:"Priroda" },
  { word:"BIJELA RODA", clue:"Ptica selica koja gnijezdi u hrvatskim selima.", group:"Priroda" },
  { word:"CRNA RODA", clue:"Rijetka šumska ptica koja obitava u močvarnim područjima.", group:"Priroda" },
  { word:"LASTAVICA", clue:"Ptica selica koja se vraća u Hrvatsku u proljeće.", group:"Priroda" },
  { word:"LEPTIR", clue:"Kukac s krilima prekrivenima ljuskicama.", group:"Priroda" },
  { word:"LAVANDA", clue:"Mirisna mediteranska biljka poznata na Hvaru.", group:"Priroda" },
  { word:"SMILJE", clue:"Mediteranska biljka zlatnožutih cvjetova.", group:"Priroda" },
  { word:"KADULJA", clue:"Ljekovita i aromatična biljka rasprostranjena na kršu.", group:"Priroda" },
  { word:"RUŽMARIN", clue:"Aromatična mediteranska biljka.", group:"Priroda" },
  { word:"HRVATSKI OVČAR", clue:"Autohtona hrvatska pasmina psa.", group:"Priroda" },
  { word:"POSAVSKI KONJ", clue:"Autohtona pasmina konja iz Posavine.", group:"Priroda" },
  { word:"LIPICANAC", clue:"Konj uzgojen u ergeli Lipik i drugim europskim ergelama.", group:"Priroda" },
  { word:"ISTARSKO GOVEDO", clue:"Autohtona pasmina goveda poznata kao boškarin.", group:"Priroda" },
  { word:"DALMATINSKI PAS", clue:"Pasmina pasa prepoznatljiva po crnim pjegama.", group:"Priroda" },
  { word:"KONAVOSKA NOŠNJA", clue:"Tradicionalna nošnja Konavala s prepoznatljivim vezom.", group:"Običaji" },
  { word:"LINĐO", clue:"Tradicionalni ples dubrovačkog kraja.", group:"Običaji" },
  { word:"LASTOVSKI POKLAD", clue:"Pokladni običaj na otoku Lastovu.", group:"Običaji" },
  { word:"KARNEVAL U RIJECI", clue:"Velika međunarodna pokladna manifestacija.", group:"Običaji" },
  { word:"ZVONČARI", clue:"Pokladne skupine iz Kastavštine.", group:"Običaji" },
  { word:"HALUBAJski ZVONČARI", clue:"Skupina zvončara iz okolice Kastva.", group:"Običaji" },
  { word:"KUKERI", clue:"Tradicijske pokladne maske; pojam je poznat i iz susjednih krajeva.", group:"Običaji" },
  { word:"FAŠNIČKA POVORKA", clue:"Povorka maskiranih sudionika tijekom poklada.", group:"Običaji" },
  { word:"ĐAKOVAČKI VEZOVI", clue:"Smotra folklora i tradicijske kulture u Đakovu.", group:"Običaji" },
  { word:"VINKOVAČKE JESENI", clue:"Smotra tradicijske kulture i folklora u Vinkovcima.", group:"Običaji" },
  { word:"ŠPANCIRFEST", clue:"Festival uličnih šetača i kulture u Varaždinu.", group:"Običaji" },
  { word:"MOTOVUN FILM FESTIVAL", clue:"Filmski festival u Motovunu.", group:"Kultura" },
  { word:"DUBROVAČKE LJETNE IGRE", clue:"Festival kazališta, glazbe i plesa u Dubrovniku.", group:"Kultura" },
  { word:"SPLITSKO LJETO", clue:"Ljetni festival kazališta i glazbe u Splitu.", group:"Kultura" },
  { word:"VARAŽDINSKE BAROKNE VEČERI", clue:"Festival barokne glazbe u Varaždinu.", group:"Kultura" },
  { word:"OSORSKE GLAZBENE VEČERI", clue:"Festival klasične glazbe na otoku Cresu.", group:"Kultura" },
  { word:"PULSKI FILMSKI FESTIVAL", clue:"Filmski festival u pulskoj Areni.", group:"Kultura" },
  { word:"ZAGREBAČKI VELESAJAM", clue:"Izložbeni i sajamski prostor u Zagrebu.", group:"Kultura" },
  { word:"HRVATSKO NARODNO KAZALIŠTE", clue:"Središnja nacionalna kazališna institucija u Zagrebu.", group:"Kultura" },
  { word:"MATICA HRVATSKA", clue:"Kulturna ustanova osnovana 1842. godine.", group:"Kultura" },
  { word:"HRVATSKA AKADEMIJA ZNANOSTI I UMJETNOSTI", clue:"Najviša nacionalna ustanova znanosti i umjetnosti.", group:"Kultura" },
  { word:"NACIONALNA I SVEUČILIŠNA KNJIŽNICA", clue:"Središnja hrvatska knjižnica u Zagrebu.", group:"Kultura" },
  { word:"HRVATSKI JEZIK", clue:"Južnoslavenski jezik kojim govori većina stanovnika Hrvatske.", group:"Kultura" },
  { word:"DIALEKT", clue:"Zavičajni oblik jezika s posebnim obilježjima.", group:"Kultura" },
  { word:"ČAKAVSKO NARJEČJE", clue:"Jedno od triju glavnih hrvatskih narječja.", group:"Kultura" },
  { word:"KAJKAVSKO NARJEČJE", clue:"Narječje rašireno u sjeverozapadnoj Hrvatskoj.", group:"Kultura" },
  { word:"ŠTOKAVSKO NARJEČJE", clue:"Narječje na kojem se temelji standardni hrvatski jezik.", group:"Kultura" },
  { word:"BAŠTINSKI GOVOR", clue:"Zavičajni govor koji prenosi lokalni identitet.", group:"Kultura" },
  { word:"USMENA PREDAJA", clue:"Prenošenje priča, pjesama i znanja govorom.", group:"Kultura" },
  { word:"EP", clue:"Opsežna pripovjedna pjesma o junacima i događajima.", group:"Kultura" },
  { word:"BALADA", clue:"Lirsko-epska pjesma s često tragičnim sadržajem.", group:"Kultura" },
  { word:"GUSLE", clue:"Tradicijsko glazbalo s jednom ili dvije žice.", group:"Glazba" },
  { word:"DIPLE", clue:"Tradicionalno puhačko glazbalo iz dinarskog područja.", group:"Glazba" },
  { word:"MIH", clue:"Tradicionalno puhačko glazbalo s mješinom.", group:"Glazba" },
  { word:"TAMBURA", clue:"Trzalačko žičano glazbalo važno u slavonskoj tradiciji.", group:"Glazba" },
  { word:"LIJERICA", clue:"Tradicijsko gudačko glazbalo južne Dalmacije.", group:"Glazba" },
  { word:"CITRA", clue:"Tradicijsko žičano glazbalo.", group:"Glazba" },
  { word:"KLAPA", clue:"Skupina pjevača koja njeguje višeglasno pjevanje.", group:"Glazba" },
  { word:"OJKAČA", clue:"Oblik tradicijskog pjevanja dinarskog područja.", group:"Glazba" },
  { word:"ROZGA", clue:"Tradicijski plesni i glazbeni izraz.", group:"Glazba" },
  { word:"TANAC", clue:"Tradicijski ples s otoka Krka.", group:"Glazba" },
  { word:"POSKOČICA", clue:"Tradicijski plesni oblik.", group:"Glazba" },
  { word:"SOPILE", clue:"Tradicijsko puhačko glazbalo s Kvarnera.", group:"Glazba" },
  { word:"ROŽENICE", clue:"Tradicijsko istarsko puhačko glazbalo.", group:"Glazba" },
  { word:"ISTARSKA LJESTVICA", clue:"Poseban glazbeni sustav istarske tradicijske glazbe.", group:"Glazba" },
  { word:"SVETI JURAJ", clue:"Svetac i zaštitnik koji se u tradiciji povezuje s proljećem.", group:"Vjera" },
  { word:"SVETI NIKOLA", clue:"Svetac zaštitnik pomoraca i djece.", group:"Vjera" },
  { word:"SVETI DUJE", clue:"Zaštitnik grada Splita.", group:"Vjera" },
  { word:"SVETI VLAHO", clue:"Zaštitnik Dubrovnika.", group:"Vjera" },
  { word:"SVETI JOSIP", clue:"U kršćanstvu se štuje kao Isusov poočim.", group:"Vjera" },
  { word:"SVETI ANTUN", clue:"Svetac poznat kao Antun Padovanski.", group:"Vjera" },
  { word:"SVETI LEOPOLD MANDIĆ", clue:"Kapucin i svetac rođen u Herceg Novom, povezan s hrvatskom duhovnom baštinom.", group:"Vjera" },
  { word:"BLAŽENI ALOJZIJE STEPINAC", clue:"Zagrebački nadbiskup proglašen blaženim 1998. godine.", group:"Vjera" },
  { word:"IVAN MERZ", clue:"Hrvatski katolički laik proglašen blaženim.", group:"Vjera" },
  { word:"MARIJA", clue:"Isusova majka u kršćanskoj vjeri.", group:"Vjera" },
  { word:"KRŠTENJE", clue:"Kršćanski sakrament ulaska u Crkvu.", group:"Vjera" },
  { word:"EUHARISTIJA", clue:"Središnji kršćanski sakrament koji se slavi na misi.", group:"Vjera" },
  { word:"ŽUPA", clue:"Osnovna zajednica vjernika u mjesnoj Crkvi.", group:"Vjera" },
  { word:"ŽUPNIK", clue:"Svećenik kojem je povjerena pastoralna skrb župe.", group:"Vjera" },
  { word:"HODOČASNIK", clue:"Osoba koja putuje na sveto mjesto.", group:"Vjera" },
  { word:"KRIZMA", clue:"Naziv za sakrament potvrde u katoličkoj tradiciji.", group:"Vjera" },
  { word:"ADVENT", clue:"Vrijeme priprave za Božić.", group:"Vjera" },
  { word:"BOŽIĆ", clue:"Kršćanski blagdan Isusova rođenja.", group:"Vjera" },
  { word:"DUHOVI", clue:"Kršćanski blagdan silaska Duha Svetoga.", group:"Vjera" },
  { word:"TIJELOVO", clue:"Katolički blagdan Presvetoga Tijela i Krvi Kristove.", group:"Vjera" },
  { word:"SVETA LUCIJA", clue:"Krčka svetica čije se ime povezuje s Bašćanskom pločom.", group:"Vjera" },
  { word:"SVETI JERONIM", clue:"Crkveni naučitelj rođen u Stridonu, čija se lokacija raspravlja.", group:"Vjera" },
  { word:"SVETI ĆIRIL", clue:"Misionar povezan s početkom slavenske pismenosti.", group:"Vjera" },
  { word:"SVETI METOD", clue:"Misionar i suzaštitnik Europe.", group:"Vjera" },
  { word:"BISKUP", clue:"Crkveni službenik koji vodi biskupiju.", group:"Vjera" },
  { word:"KATEDRALA", clue:"Glavna crkva biskupije.", group:"Vjera" },
  { word:"SAMOSTAN", clue:"Zajednica redovnika ili redovnica i prostor u kojem žive.", group:"Vjera" },
  { word:"FRANJEVCI", clue:"Katolički red nadahnut životom svetoga Franje Asiškoga.", group:"Vjera" },
  { word:"BENEDIKTINCI", clue:"Redovnici koji slijede Pravilo svetoga Benedikta.", group:"Vjera" },
  { word:"DOMINIKANCI", clue:"Red propovjednika u Katoličkoj crkvi.", group:"Vjera" },
  { word:"PAVLINI", clue:"Redovnici koji su ostavili trag u hrvatskoj kulturnoj povijesti.", group:"Vjera" },
  { word:"ISUSOVCI", clue:"Red Družbe Isusove.", group:"Vjera" },
  { word:"STARI ZAVJET", clue:"Prvi dio kršćanske Biblije.", group:"Vjera" },
  { word:"NOVI ZAVJET", clue:"Drugi dio kršćanske Biblije.", group:"Vjera" },
  { word:"PSALAM", clue:"Biblijska pjesma ili molitva.", group:"Vjera" },
  { word:"EVANĐELIST", clue:"Pisac jednog od četiriju evanđelja.", group:"Vjera" },
  { word:"APOSTOL", clue:"Jedan od Isusovih poslanika.", group:"Vjera" },
  { word:"JERUZALEM", clue:"Sveti grad važan za židovstvo, kršćanstvo i islam.", group:"Vjera" },
  { word:"JORDAN", clue:"Rijeka u Svetoj zemlji povezana s Isusovim krštenjem.", group:"Vjera" },
  { word:"TRSATSKO SVETIŠTE", clue:"Marijansko svetište u Rijeci.", group:"Vjera" },
  { word:"ALJMAŠ", clue:"Marijansko svetište u istočnoj Slavoniji.", group:"Vjera" },
  { word:"VOĆIN", clue:"Marijansko svetište u Slavoniji.", group:"Vjera" },
  { word:"LORETO", clue:"Marijansko svetište u Italiji povezano s Trsatom predajom.", group:"Vjera" },
  { word:"VEPRIC", clue:"Marijansko svetište kraj Makarske.", group:"Vjera" },
  { word:"KARDINAL", clue:"Visoki crkveni dostojanstvenik.", group:"Vjera" },
  { word:"PAPA", clue:"Biskup Rima i poglavar Katoličke crkve.", group:"Vjera" },
  { word:"TEOLOGIJA", clue:"Sustavno proučavanje vjere i religijskih pitanja.", group:"Znanje" },
  { word:"FILOZOFIJA", clue:"Proučavanje temeljnih pitanja postojanja, znanja i vrijednosti.", group:"Znanje" },
  { word:"POVIJEST", clue:"Znanost koja proučava prošlost ljudi i društava.", group:"Znanje" },
  { word:"ARHEOLOGIJA", clue:"Znanost koja proučava prošlost na temelju materijalnih ostataka.", group:"Znanje" },
  { word:"LINGVISTIKA", clue:"Znanost o jeziku.", group:"Znanje" },
  { word:"GEOGRAFIJA", clue:"Znanost o prostoru, prirodnim obilježjima i ljudskim djelatnostima.", group:"Znanje" },
  { word:"BIOLOGIJA", clue:"Znanost o živim bićima.", group:"Znanje" },
  { word:"GEOLOGIJA", clue:"Znanost o građi i razvoju Zemlje.", group:"Znanje" },
  { word:"ASTRONOMIJA", clue:"Znanost koja proučava svemir i nebeska tijela.", group:"Znanje" },
  { word:"MATEMATIKA", clue:"Znanost o brojevima, strukturama i odnosima.", group:"Znanje" },
  { word:"MEDICINA", clue:"Znanost i praksa očuvanja zdravlja i liječenja.", group:"Znanje" },
  { word:"PRAVO", clue:"Sustav pravila kojima se uređuju društveni odnosi.", group:"Znanje" },
  { word:"POMORSKA POVIJEST", clue:"Proučavanje razvoja plovidbe i pomorstva.", group:"Znanje" },
  { word:"KARTOGRAFIJA", clue:"Znanost i vještina izrade zemljovida.", group:"Znanje" },
  { word:"ANDRIJA KAČIĆ MIOŠIĆ", clue:"Franjevac i književnik, autor Razgovora ugodnog naroda slovinskoga.", group:"Kultura" },
  { word:"PETAR HEKTOROVIĆ", clue:"Hvarski renesansni pjesnik, autor Ribanja i ribarskog prigovaranja.", group:"Kultura" },
  { word:"HANIBAL LUCIĆ", clue:"Hvarski renesansni pjesnik i dramatičar.", group:"Kultura" },
  { word:"MARIN DRŽIĆ", clue:"Dubrovački renesansni komediograf.", group:"Kultura" },
  { word:"IVAN GUNDULIĆ", clue:"Dubrovački barokni pjesnik, autor Osmana.", group:"Kultura" },
  { word:"JUNije PALMOTIĆ", clue:"Dubrovački barokni književnik.", group:"Kultura" },
  { word:"VLADIMIR NAZOR", clue:"Hrvatski književnik i pjesnik.", group:"Kultura" },
  { word:"TIN UJEVIĆ", clue:"Hrvatski pjesnik modernizma.", group:"Kultura" },
  { word:"DOBRIŠA CESARIĆ", clue:"Hrvatski pjesnik, autor Voćke poslije kiše.", group:"Kultura" },
  { word:"MIROSLAV KRLEŽA", clue:"Hrvatski književnik i dramatičar.", group:"Kultura" },
  { word:"SLAVKO KOLAR", clue:"Hrvatski pripovjedač i dramatičar.", group:"Kultura" },
  { word:"MARIN FRANIČEVIĆ", clue:"Hrvatski pjesnik i književni povjesničar.", group:"Kultura" },
  { word:"DINKO ŠIMUNOVIĆ", clue:"Hrvatski pripovjedač, autor Duga.", group:"Kultura" },
  { word:"VLADAN DESNICA", clue:"Hrvatski književnik, autor Proljeća Ivana Galeba.", group:"Kultura" },
  { word:"RANKO MARINKOVIĆ", clue:"Hrvatski književnik, autor Kiklopa.", group:"Kultura" },
  { word:"ANTUN BRANKO ŠIMIĆ", clue:"Hrvatski pjesnik ekspresionizma.", group:"Kultura" },
  { word:"JOSIP KOZARAC", clue:"Hrvatski književnik, autor Tene.", group:"Kultura" },
  { word:"ANTUN KOVAČIĆ", clue:"Hrvatski književnik, autor U registraturi.", group:"Kultura" },
  { word:"AUGUST CESAREC", clue:"Hrvatski književnik i publicist.", group:"Kultura" },
  { word:"VLADIMIR VIDRIĆ", clue:"Hrvatski pjesnik moderne.", group:"Kultura" },
  { word:"DRAGUTIN DOMJANIĆ", clue:"Hrvatski pjesnik koji je pisao i kajkavskim jezikom.", group:"Kultura" },
  { word:"NIKOLA ŠOP", clue:"Hrvatski pjesnik i prevoditelj.", group:"Kultura" },
  { word:"JOSIP PUPAČIĆ", clue:"Hrvatski pjesnik iz Dalmacije.", group:"Kultura" },
  { word:"ANTUN ŠOLJAN", clue:"Hrvatski književnik i esejist.", group:"Kultura" },
  { word:"SLAVKO MIHALIĆ", clue:"Hrvatski pjesnik.", group:"Kultura" },
  { word:"KREŠIMIR KOVAČIĆ", clue:"Hrvatski književnik.", group:"Kultura" },
  { word:"IVAN MEŠTROVIĆ", clue:"Hrvatski kipar svjetskoga ugleda.", group:"Kultura" },
  { word:"ANTUN AUGUSTINČIĆ", clue:"Hrvatski kipar, autor spomenika Mira u New Yorku.", group:"Kultura" },
  { word:"VLADIMIR BEBEK", clue:"Hrvatski umjetnik; ime je višeznačno pa izostavljeno iz kviza.", group:"Kultura" },
  { word:"JOZO KLJAKOVIĆ", clue:"Hrvatski slikar i freskoslikar.", group:"Kultura" },
  { word:"VLaho BUKOVAC", clue:"Hrvatski slikar, jedan od najvažnijih predstavnika moderne.", group:"Kultura" },
  { word:"Oton IVEKOVIĆ", clue:"Hrvatski slikar povijesnih kompozicija.", group:"Kultura" },
  { word:"CELestin MEDOVIĆ", clue:"Hrvatski slikar iz Dalmacije.", group:"Kultura" },
  { word:"IVAN RENDIĆ", clue:"Hrvatski kipar.", group:"Kultura" },
  { word:"BRANKO FUČIĆ", clue:"Hrvatski povjesničar umjetnosti i istraživač glagoljice.", group:"Kultura" },
  { word:"FRANJO RAČKI", clue:"Hrvatski povjesničar i političar 19. stoljeća.", group:"Povijest" },
  { word:"IVAN KUKULJEVIĆ SAKCINSKI", clue:"Hrvatski političar i povjesničar, govorio hrvatski u Saboru 1843.", group:"Povijest" },
  { word:"ANTUN MIHANOVIĆ", clue:"Autor pjesme Horvatska domovina, čiji je tekst osnova hrvatske himne.", group:"Kultura" },
  { word:"LJUDЕVIT POSAVSKI", clue:"Knez u ranosrednjovjekovnoj Panonskoj Hrvatskoj.", group:"Povijest" },
  { word:"BORNA", clue:"Hrvatski knez iz ranog 9. stoljeća.", group:"Povijest" },
  { word:"MUNCIMIR", clue:"Hrvatski knez s kraja 9. i početka 10. stoljeća.", group:"Povijest" },
  { word:"KREŠIMIR IV.", clue:"Hrvatski kralj iz 11. stoljeća.", group:"Povijest" },
  { word:"PETAR SVAČIĆ", clue:"Hrvatski kralj povezan s krajem narodne dinastije.", group:"Povijest" },
  { word:"DMITAR ZVONIMIR", clue:"Hrvatski kralj iz 11. stoljeća.", group:"Povijest" },
  { word:"STJEPAN II.", clue:"Posljednji kralj iz narodne dinastije prema uobičajenoj kronologiji.", group:"Povijest" },
  { word:"KATARINA KOSAČA", clue:"Bosanska kraljica povezana s hrvatskom povijesnom baštinom.", group:"Povijest" },
  { word:"JELENA SLAVNA", clue:"Hrvatska kraljica iz 10. stoljeća, poznata po natpisu u Solinu.", group:"Povijest" },
  { word:"MARGARETA AUSTRIJSKA", clue:"Plemićka osoba povezana s hrvatskom poviješću.", group:"Povijest" },
  { word:"NIKOLA ŠUBIĆ ZRINSKI", clue:"Hrvatski ban i vojskovođa poginuo u obrani Sigeta 1566.", group:"Povijest" },
  { word:"SIGET", clue:"Utvrda koju je 1566. branio Nikola Šubić Zrinski.", group:"Povijest" },
  { word:"JURAJ IV. ZRINSKI", clue:"Pripadnik velikaške obitelji Zrinski.", group:"Povijest" },
  { word:"KRALJ MATIJA KORVIN", clue:"Ugarsko-hrvatski kralj iz 15. stoljeća.", group:"Povijest" },
  { word:"FERDINAND HABSBURŠKI", clue:"Izabran za hrvatskog kralja na saboru u Cetinu 1527.", group:"Povijest" },
  { word:"JOSIP JELAČIĆ", clue:"Hrvatski ban iz 19. stoljeća.", group:"Povijest" },
  { word:"STJEPAN RADIĆ", clue:"Hrvatski političar i vođa Hrvatske seljačke stranke.", group:"Povijest" },
  { word:"ANTUN RADIĆ", clue:"Hrvatski etnolog i političar, brat Stjepana Radića.", group:"Povijest" },
  { word:"FRANJO TUĐMAN", clue:"Prvi predsjednik samostalne Republike Hrvatske.", group:"Povijest" },
  { word:"VLADKO MAČEK", clue:"Hrvatski političar i predsjednik HSS-a.", group:"Povijest" },
  { word:"SAVKA DABČEVIĆ-KUČAR", clue:"Hrvatska političarka, jedna od istaknutih osoba Hrvatskog proljeća.", group:"Povijest" },
  { word:"MIKO TRIPALO", clue:"Hrvatski političar povezan s Hrvatskim proljećem.", group:"Povijest" },
  { word:"HRVATSKO PROLJEĆE", clue:"Reformski pokret u Hrvatskoj početkom 1970-ih.", group:"Povijest" },
  { word:"LJUBO BABIĆ", clue:"Hrvatski slikar i scenograf.", group:"Kultura" },
  { word:"VJEKOSLAV KARAS", clue:"Hrvatski slikar 19. stoljeća.", group:"Kultura" },
  { word:"IVAN GENERALIĆ", clue:"Hrvatski naivni slikar iz Hlebina.", group:"Kultura" },
  { word:"IVAN LACKOVIĆ CROATA", clue:"Hrvatski slikar naivne umjetnosti.", group:"Kultura" },
  { word:"IVAN RABUZIN", clue:"Hrvatski slikar naivne umjetnosti.", group:"Kultura" },
  { word:"MIROSLAV ŠUTEJ", clue:"Hrvatski grafičar i dizajner hrvatske zastave i grba u suvremenom obliku.", group:"Kultura" },
  { word:"EDO MURTIĆ", clue:"Hrvatski slikar i grafičar.", group:"Kultura" },
  { word:"DUŠAN DŽAMONJA", clue:"Hrvatski kipar.", group:"Kultura" },
  { word:"VANJA RADUŠ", clue:"Hrvatski kipar.", group:"Kultura" },
  { word:"FRANO KRŠINIĆ", clue:"Hrvatski kipar.", group:"Kultura" },
  { word:"MARIO PURATIĆ", clue:"Hrvatski izumitelj poznat po napravi za izvlačenje ribarskih mreža.", group:"Znanje" },
  { word:"IVAN VUČETIĆ", clue:"Hrvatski izumitelj daktiloskopije rođen na Hvaru.", group:"Znanje" },
  { word:"SLAVOLJUB PENKALA", clue:"Izumitelj mehaničke olovke i nalivpera.", group:"Znanje" },
  { word:"DAVID SCHWARTZ", clue:"Hrvatski izumitelj i pionir zračnog brodarstva.", group:"Znanje" },
  { word:"ANTON LUIGI MARSIGLI", clue:"Prirodoslovac koji je istraživao Jadran i Dunav.", group:"Znanje" },
  { word:"JOSIP RUĐER BOŠKOVIĆ", clue:"Dubrovčanin, znanstvenik i filozof.", group:"Znanje" },
  { word:"IVAN VITEZ OD SREDNE", clue:"Hrvatski humanist i diplomat 15. stoljeća.", group:"Znanje" },
  { word:"MARIN GETALDIĆ", clue:"Dubrovački matematičar i fizičar.", group:"Znanje" },
  { word:"MARCEL KIEPACH", clue:"Hrvatski izumitelj iz Križevaca.", group:"Znanje" },
  { word:"ANDRIJA ŠTAMPAR", clue:"Hrvatski liječnik i pionir javnog zdravstva.", group:"Znanje" },
  { word:"IVAN SUPEK", clue:"Hrvatski fizičar, filozof i književnik.", group:"Znanje" },
  { word:"BRUNO BUŠIĆ", clue:"Hrvatski publicist i politički emigrant.", group:"Povijest" },
];
const normalize = (value) => String(value ?? "").toLocaleUpperCase("hr").replace(/Đ/g,"D").normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^A-Z]/g,"");
const shuffle = (items) => {
  const result = [...items];
  for (let i=result.length-1;i>0;i--) { const j=Math.floor(Math.random()*(i+1)); [result[i],result[j]]=[result[j],result[i]]; }
  return result;
};
const pickFreshItems = (pool,key,count=1) => {
  if(!pool.length)return [];
  let history=[];
  try{history=JSON.parse(localStorage.getItem(`patriasoul_wordgames_history_${key}`)||"[]");}catch{}
  const fresh=pool.filter(item=>!history.includes(item.word||item.title));
  const recentWindow=Math.max(1,Math.floor(pool.length*0.45));
  const recent=new Set(history.slice(-recentWindow));
  const fallback=pool.filter(item=>!recent.has(item.word||item.title));
  const source=fresh.length>=count?fresh:fallback.length>=count?fallback:pool;
  const picked=shuffle(source).slice(0,count);
  try{localStorage.setItem(`patriasoul_wordgames_history_${key}`,JSON.stringify([...history,...picked.map(item=>item.word||item.title)].slice(-pool.length)));}catch{}
  return picked;
};

const WORDS = BANK.map(item=>({...item,clean:normalize(item.word)}));
const SCRAMBLE = WORDS.filter(item=>item.clean.length>=4 && item.clean.length<=10);
const GROUPS = [
  {title:"Gradovi",words:["ZAGREB","SINJ","KNIN","VUKOVAR"]},
  {title:"Istarski i primorski gradovi",words:["PULA","POREČ","RIJEKA","ZADAR"]},
  {title:"Otočje",words:["PAG","HVAR","KRK","CRES"]},
  {title:"Rijeke",words:["SAVA","DRAVA","NERETVA","KRKA"]},
  {title:"Planine i priroda",words:["DINARA","VELEBIT","BIOKOVO","KORNATI"]},
  {title:"Vjera",words:["MOLITVA","KRUNICA","USKRS","BIBLIJA"]},
  {title:"Hrvatska baština",words:["GLAGOLJICA","PLETER","ČIPKA","BAŠĆANSKA PLOČA"]},
  {title:"Tradicija",words:["ALKA","MOREŠKA","KUMPANIJA","LICITAR"]},
  {title:"Književnici",words:["MARULIĆ","ŠENOA","MATOS","BRLIĆ MAŽURANIĆ"]},
  {title:"Znanstvenici",words:["TESLA","BOŠKOVIĆ","VRANČIĆ","MOHOROVIČIĆ"]},
  {title:"Domovinski rat",words:["OLUJA","OVČARA","ŠKABRNJA","VUKOVARSKA BITKA"]},
  {title:"Zajednica",words:["OBITELJ","ZAJEDNIŠTVO","VOLONTERSTVO","ZAVIČAJ"]},
  {title:"Rijeke",words:["KUPA","MURA","CETINA","ZRMANJA"]},
  {title:"Nacionalni parkovi",words:["PLITVICE","KORNATI","MLJET","RISNJAK"]},
  {title:"Hrvatske regije",words:["LIKA","SLAVONIJA","BARANJA","MEĐIMURJE"]},
  {title:"Tradicijsko pjevanje i ples",words:["BEĆARAC","OJKANJE","GANGA","NIJEMO KOLO"]},
  {title:"Povijesne osobe",words:["ZVONIMIR","BRANIMIR","PETAR KREŠIMIR","LJUDEVIT GAJ"]},
  {title:"Tvrđave i dvorci",words:["NEHAJ","KLIS","TRAKOŠĆAN","KAMENITA VRATA"]},
];
const DAILY = WORDS.filter(item=>item.clean.length>=4&&item.clean.length<=10&&!item.word.includes(" ")).map(item=>item.word);
const GAMES = [
  {id:"classic",title:"Riječi domovine",desc:"Složi slova, otkrij značenje i osvajaj bodove.",tag:"IZVORNA IGRA",type:"Brze igre",icon:BookOpen},
  {id:"search",title:"Pronađi riječ",desc:"Pronađi skrivenu riječ u mreži slova.",tag:"OPAŽANJE",type:"Brze igre",icon:Search},
  {id:"scramble",title:"Složi riječ",desc:"Od izmiješanih slova sastavi hrvatski pojam.",tag:"BRZINA",type:"Brze igre",icon:Shuffle},
  {id:"guess",title:"Pogodi riječ",desc:"Otkrij pojam uz pomoć opisa i ograničen broj pokušaja.",tag:"LOGIKA",type:"Znanje i logika",icon:Brain},
  {id:"groups",title:"Poveži pojmove",desc:"Razvrstaj riječi u četiri smislene skupine.",tag:"POVEZIVANJE",type:"Znanje i logika",icon:Grid3X3},
  {id:"daily",title:"Dnevna riječ",desc:"Jedna tajna riječ dnevno. Imaš šest pokušaja.",tag:"SVAKI DAN",type:"Dnevni izazov",icon:CalendarDays},
];
function Frame({title,subtitle,onBack,children}) {
  return <section className="mx-auto max-w-3xl px-4 py-8 sm:px-6"><button onClick={onBack} className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-white/70 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-200"><ArrowLeft className="h-4 w-4"/> Sve igre</button><div className="rounded-3xl border border-white/10 bg-[#0b1c30]/95 p-5 shadow-2xl sm:p-8"><p className="text-xs font-black uppercase tracking-[.2em] text-amber-300">Riječi domovine · igra riječima</p><h1 className="mt-2 text-3xl font-black text-white sm:text-4xl">{title}</h1><p className="mt-2 text-sm text-white/65">{subtitle}</p><div className="mt-7">{children}</div></div></section>;
}
function Success({children}) { return <div role="status" aria-live="polite" className="mt-5 flex items-center gap-2 rounded-xl border border-emerald-300/30 bg-emerald-300/10 p-4 font-semibold text-emerald-200"><Check className="h-5 w-5"/>{children}</div>; }

function LetterKeyboard({value,onChange,target,maxLength,disabled=false,matchMode="position"}) {
  const letters=[...String(value||"").toLocaleUpperCase("hr")];
  const targetLetters=[...normalize(target||"")];
  const alphabet=["A","B","C","Č","Ć","D","Đ","E","F","G","H","I","J","K","L","M","N","O","P","R","S","Š","T","U","V","Z","Ž"];
  const statusAt=(index)=>{
    if(!letters[index]) return "empty";
    if(matchMode==="first"&&index>0) return "neutral";
    return normalize(letters[index])===targetLetters[index] ? "correct" : "wrong";
  };
  const add=(letter)=>{if(!disabled&&letters.length<maxLength)onChange(value+letter);};
  const remove=(index)=>{if(!disabled)onChange(letters.filter((_,i)=>i!==index).join(""));};
  const tone={correct:"border-emerald-400 bg-emerald-500 text-white shadow-[0_0_14px_rgba(16,185,129,.25)]",wrong:"border-rose-400 bg-rose-600 text-white shadow-[0_0_14px_rgba(244,63,94,.2)]",neutral:"border-white/20 bg-white/10 text-white",empty:"border-white/15 bg-black/20 text-white/35"};
  return <div className="mt-4" aria-label="Odabir slova">
    <div className="mb-4 flex min-h-12 flex-wrap justify-center gap-2" aria-live="polite">
      {Array.from({length:maxLength},(_,index)=><button key={index} type="button" onClick={()=>remove(index)} disabled={disabled||!letters[index]} aria-label={letters[index] ? "Ukloni slovo "+letters[index]+" na mjestu "+(index+1) : "Prazno mjesto "+(index+1)} className={"grid h-12 min-w-10 place-items-center rounded-lg border-2 px-2 text-lg font-black transition "+tone[statusAt(index)]+" disabled:cursor-default sm:h-14 sm:min-w-12 sm:text-xl"}>{letters[index]||"·"}</button>)}
    </div>
    <div className="mx-auto grid max-w-xl grid-cols-7 gap-1.5 sm:grid-cols-9 sm:gap-2">
      {alphabet.map(letter=><button key={letter} type="button" onClick={()=>add(letter)} disabled={disabled||letters.length>=maxLength} className="min-h-11 rounded-lg border border-white/15 bg-gradient-to-b from-[#214665] to-[#102a43] text-sm font-black text-white shadow-md transition hover:border-amber-200 hover:bg-[#315b7b] active:scale-95 disabled:opacity-35 sm:min-h-12 sm:text-base">{letter}</button>)}
      <button type="button" onClick={()=>remove(letters.length-1)} disabled={disabled||!letters.length} aria-label="Obriši zadnje slovo" className="col-span-2 min-h-11 rounded-lg border border-amber-200/25 bg-amber-200/10 text-xs font-black text-amber-100 disabled:opacity-35 sm:col-span-3">⌫ OBRIŠI</button>
    </div>
    <p className="mt-2 text-center text-[11px] text-white/45">Dodirni slova redom. Zeleno je točno, crveno nije na pravom mjestu.</p>
  </div>;
}

function WordSearch({onBack}) {
  const [words] = useState(()=>pickFreshItems(WORDS.filter(item=>item.clean.length>=4&&item.clean.length<=11&&!item.word.includes(" ")), "search", 7).map(item=>item.word));
  const size = 11;
  const gridRef = useRef(null);
  const [board] = useState(() => {
    const cells = Array(size*size).fill("");
    const placements = [];
    const alphabet = "ABCČĆDEFGHIJKLMNOPRSŠTUVZŽ";
    words.forEach(word => {
      let placed = false;
      for(let attempt=0;attempt<500&&!placed;attempt++){
        const vertical = Math.random()<0.5;
        const reverse = Math.random()<0.5;
        const row = Math.floor(Math.random()*(vertical?size-word.length+1:size));
        const col = Math.floor(Math.random()*(vertical?size:size-word.length+1));
        const letters = reverse?[...word].reverse():[...word];
        const path = letters.map((_,i)=>(row+(vertical?i:0))*size+col+(vertical?0:i));
        if(path.every((index,i)=>!cells[index]||cells[index]===letters[i])){
          path.forEach((index,i)=>cells[index]=letters[i]);
          placements.push({word,path});
          placed=true;
        }
      }
    });
    return {cells:cells.map(letter=>letter||alphabet[Math.floor(Math.random()*alphabet.length)]),placements};
  });
  const [found,setFound] = useState([]);
  const [drag,setDrag] = useState([]);
  const [anchor,setAnchor] = useState(null);
  const [message,setMessage] = useState("Povuci prstom ili mišem od prvog do zadnjeg slova riječi.");
  const [lastFound,setLastFound] = useState([]);
  const complete = found.length===words.length;

  const makePath = (from,to) => {
    if(from===null||to===null)return [];
    const r1=Math.floor(from/size),c1=from%size,r2=Math.floor(to/size),c2=to%size;
    if(r1!==r2&&c1!==c2)return [];
    const dr=Math.sign(r2-r1),dc=Math.sign(c2-c1);
    const distance=Math.max(Math.abs(r2-r1),Math.abs(c2-c1));
    return Array.from({length:distance+1},(_,i)=>(r1+dr*i)*size+c1+dc*i);
  };
  const cellAtPoint = (event) => {
    const element=document.elementFromPoint(event.clientX,event.clientY);
    const cell=element?.closest?.("[data-cell-index]");
    return cell&&gridRef.current?.contains(cell)?Number(cell.dataset.cellIndex):null;
  };
  const begin = (event,index) => {
    if(complete)return;
    event.preventDefault();
    event.currentTarget.setPointerCapture?.(event.pointerId);
    setAnchor(index);setDrag([index]);setLastFound([]);
    setMessage("Povuci do posljednjeg slova, vodoravno ili okomito.");
  };
  const move = (event) => {
    if(anchor===null)return;
    const index=cellAtPoint(event);
    if(index===null)return;
    const path=makePath(anchor,index);
    if(path.length)setDrag(path);
  };
  const finish = () => {
    if(anchor===null)return;
    const chosen=drag;
    const value=chosen.map(index=>board.cells[index]).join("");
    const match=board.placements.find(item=>!found.includes(item.word)&&
      (value===item.word||value===[...item.word].reverse().join("")));
    if(match){
      setFound(current=>[...current,match.word]);
      setLastFound(chosen);
      setMessage(`Odlično! Pronađena riječ: ${match.word}.`);
    }else if(chosen.length>1){
      setLastFound([]);
      setMessage("To nije tražena riječ. Pokušaj ponovno.");
    }else{
      setMessage("Povuci preko svih slova riječi, od početka do kraja.");
    }
    setAnchor(null);setDrag([]);
  };
  const reset = () => {setFound([]);setDrag([]);setAnchor(null);setLastFound([]);setMessage("Pronađi sve riječi u mreži.");};

  return <Frame title="Pronađi riječi" subtitle="Pronađi više hrvatskih riječi. Mogu biti vodoravno ili okomito, naprijed ili unatrag. Povuci mišem ili prstom preko slova." onBack={onBack}>
    <div className="mb-4 rounded-2xl border border-amber-200/20 bg-white/[.04] p-3">
      <div className="mb-2 flex items-center justify-between gap-2"><span className="text-xs font-bold tracking-widest text-amber-200">PRONAĐI RIJEČI</span><span className="text-xs font-bold text-white/65">{found.length}/{words.length} pronađeno</span></div>
      <div className="flex flex-wrap gap-2">{words.map(word=><span key={word} className={`rounded-full border px-3 py-1.5 text-xs font-black tracking-wide transition ${found.includes(word)?"border-emerald-300/50 bg-emerald-500/20 text-emerald-200 line-through":"border-white/15 bg-white/5 text-white/75"}`}>{word}{found.includes(word)?" ✓":""}</span>)}</div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-black/30"><div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-300 transition-all duration-300" style={{width:`${found.length/words.length*100}%`}}/></div>
    </div>
    <div ref={gridRef} onPointerMove={move} onPointerUp={finish} onPointerCancel={()=>{setAnchor(null);setDrag([]);}} onContextMenu={event=>event.preventDefault()} className="mx-auto grid max-w-lg grid-cols-11 gap-1 rounded-2xl border border-white/10 bg-[#081a2b] p-2 shadow-inner sm:gap-1.5 sm:p-3" style={{touchAction:"none",userSelect:"none"}} role="group" aria-label="Mreža slova za pronalaženje riječi">
      {board.cells.map((letter,index)=>{
        const isDragging=drag.includes(index);
        const isLast=board.placements.some(item=>found.includes(item.word)&&item.path.includes(index));
        return <button key={index} type="button" data-cell-index={index} onPointerDown={event=>begin(event,index)} aria-label={`Red ${Math.floor(index/size)+1}, stupac ${index%size+1}, slovo ${letter}`} className={`aspect-square min-w-0 rounded-md border text-[11px] font-black transition sm:rounded-lg sm:text-base ${isDragging?"border-amber-200 bg-amber-300 text-slate-950 scale-105":isLast?"border-emerald-300 bg-emerald-500 text-white shadow-[0_0_12px_rgba(16,185,129,.3)]":"border-white/10 bg-white/[.055] text-white hover:border-amber-200/50 hover:bg-white/10"}`}>{letter}</button>;
      })}
    </div>
    <p className="mt-4 min-h-10 text-center text-sm font-semibold text-amber-100" role="status" aria-live="polite">{complete?"Sjajno! Pronašao/la si sve riječi!":message}</p>
    <div className="mt-3 flex justify-center">{complete?<Success>Sve riječi su pronađene!</Success>:<button type="button" onClick={reset} className="rounded-xl border border-white/15 px-4 py-2.5 text-sm font-bold text-white/75 transition hover:bg-white/10">Ponovi igru</button>}</div>
    <p className="mt-3 text-center text-[11px] text-white/40">Na računalu: drži lijevu tipku miša i povuci. Na mobitelu: pritisni slovo i povuci prstom. Pusti na zadnjem slovu.</p>
  </Frame>;
}

export default function CentarIgaraRijeci({onBack,playerName}) {
  const [active,setActive]=useState(null);
  const [gameFilter,setGameFilter]=useState("Sve igre");
  const [gameQuery,setGameQuery]=useState("");
  const [score,setScore]=useState(0);
  const [best,setBest]=useState(()=>{try{return Number(localStorage.getItem("patriasoul_wordgames_best")||0);}catch{return 0;}});
  const [item,setItem]=useState(()=>pickFreshItems(SCRAMBLE,"scramble",1)[0]);
  const [typed,setTyped]=useState("");
  const [scramblePicked,setScramblePicked]=useState([]);
  const [feedback,setFeedback]=useState("");
  const [attempts,setAttempts]=useState(0);
  const [solved,setSolved]=useState(false);
  const [scrambleWins,setScrambleWins]=useState(0);
  const [guessTarget,setGuessTarget]=useState(()=>pickFreshItems(WORDS,"guess",1)[0]);
  const [activeGroups,setActiveGroups]=useState(()=>pickFreshItems(GROUPS,"groups",4));
  const [groupWords,setGroupWords]=useState(()=>shuffle(activeGroups.flatMap(group=>group.words)));
  const [selected,setSelected]=useState([]);
  const [found,setFound]=useState([]);
  const todayKey=new Date().toLocaleDateString("sv-SE");
  const dailyKey=`patriasoul_wordgames_daily_${todayKey}`;
  const [dailyGuesses,setDailyGuesses]=useState(()=>{try{return JSON.parse(localStorage.getItem(dailyKey)||"[]");}catch{return [];}});
  const dailyWord=DAILY[(Math.floor(new Date().setHours(0,0,0,0)/86400000))%DAILY.length];
  const dailyWon=dailyGuesses.some(guess=>normalize(guess)===normalize(dailyWord));
  const dailyDone=dailyWon||dailyGuesses.length>=6;
  const scrambled=useMemo(()=>shuffle(item.clean.split("")),[item]);
  const scrambleAnswer=scramblePicked.map(index=>scrambled[index]||"").join("");
  const filters=["Sve igre","Brze igre","Znanje i logika","Dnevni izazov"];
  const visibleGames=GAMES.filter(game=>(gameFilter==="Sve igre"||game.type===gameFilter)&&`${game.title} ${game.desc}`.toLocaleLowerCase("hr").includes(gameQuery.trim().toLocaleLowerCase("hr")));

  useEffect(()=>{if(score>best){setBest(score);try{localStorage.setItem("patriasoul_wordgames_best",String(score));}catch{}}},[score,best]);
  useEffect(()=>{try{localStorage.setItem(dailyKey,JSON.stringify(dailyGuesses));}catch{}},[dailyKey,dailyGuesses]);

  const open=(id)=>{
    setActive(id);setTyped("");setScramblePicked([]);setFeedback("");setAttempts(0);setSolved(false);setSelected([]);setFound([]);setDailyGuesses(id==="daily"?(()=>{try{return JSON.parse(localStorage.getItem(dailyKey)||"[]");}catch{return [];}})():dailyGuesses);
    setItem(pickFreshItems(SCRAMBLE,"scramble",1)[0]);setGuessTarget(pickFreshItems(WORDS,"guess",1)[0]);const nextGroups=pickFreshItems(GROUPS,"groups",4);setActiveGroups(nextGroups);setGroupWords(shuffle(nextGroups.flatMap(group=>group.words)));
  };
  const submitScramble=()=>{
    if(normalize(scrambleAnswer)===item.clean){setSolved(true);setScore(value=>value+20);setScrambleWins(value=>value+1);setFeedback("Točno! Osvojio/la si 20 bodova.");}
    else{setAttempts(value=>value+1);setFeedback("Nije točno. Provjeri slova i pokušaj ponovno.");}
  };
  const nextScramble=()=>{
    const pool=SCRAMBLE.filter(word=>word.clean.length>=Math.min(4+Math.floor(scrambleWins/3),8));
    setItem(pickFreshItems(pool.length?pool:SCRAMBLE,"scramble",1)[0]);setTyped("");setScramblePicked([]);setFeedback("");setSolved(false);setAttempts(0);
  };
  const submitGuess=()=>{
    if(normalize(typed)===guessTarget.clean){if(!solved){setSolved(true);setScore(value=>value+15);setFeedback("Bravo! Pogodio/la si riječ i osvojio/la 15 bodova.");}}
    else{const next=attempts+1;setAttempts(next);setFeedback(next>=5?`Isteklo je pet pokušaja. Riječ je bila: ${guessTarget.word}.`:"Nije točno. Pokušaj ponovno.");}
  };
  const chooseGroupWord=(word)=>{
    if(selected.includes(word)||found.some(group=>group.words.includes(word)))return;
    const next=[...selected,word];setSelected(next);
    if(next.length===4){const group=activeGroups.find(candidate=>candidate.words.every(value=>next.includes(value)));
      if(group){setFound(value=>[...value,group]);setScore(value=>value+40);setSelected([]);setFeedback(`Pronađena skupina: ${group.title}.`);}
      else{setFeedback("Ove četiri riječi ne pripadaju istoj skupini. Pokušaj ponovno.");setSelected([]);}
    }
  };
  const submitDaily=()=>{
    if(normalize(typed).length!==normalize(dailyWord).length){setFeedback(`Riječ mora imati ${[...dailyWord].length} slova.`);return;}
    const guess=typed.trim().toLocaleUpperCase("hr");
    if(dailyGuesses.some(value=>normalize(value)===normalize(guess))){setFeedback("Taj si pokušaj već upisao/la.");return;}
    const next=[...dailyGuesses,guess];setDailyGuesses(next);setTyped("");
    if(normalize(guess)===normalize(dailyWord)){setFeedback("Pogodak! Osvojio/la si 50 bodova.");setScore(value=>value+50);}
    else setFeedback(next.length>=6?`Današnja riječ bila je: ${dailyWord}.`:"Nije točno. Pokušaj ponovno.");
  };

  if(active==="classic") return <RijeciDomovine onBack={()=>setActive(null)} playerName={playerName}/>;
  if(active==="search") return <WordSearch onBack={()=>setActive(null)}/>;
  if(!active) return <main className="mx-auto max-w-6xl px-4 py-5 sm:px-6 sm:py-9">
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><button onClick={onBack} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 text-sm font-bold text-white/80 transition hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-200"><ArrowLeft className="h-4 w-4"/> Natrag na kviz</button><span className="text-[11px] font-bold tracking-[.16em] text-amber-200">PATRIA SOUL · ČUVARI NASLJEĐA</span></div>
    <header className="relative overflow-hidden rounded-3xl border border-amber-300/20 bg-gradient-to-br from-[#102d4a] via-[#0b1d32] to-[#071426] p-5 shadow-2xl sm:p-8"><div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-amber-300/10 blur-3xl"/><div className="relative"><div className="inline-flex items-center gap-2 rounded-full border border-amber-300/30 bg-black/20 px-3 py-1.5 text-xs font-bold tracking-widest text-amber-200"><Sparkles className="h-4 w-4"/> CENTAR IGARA RIJEČIMA</div><h1 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-5xl">Riječi <span className="text-amber-200">domovine</span></h1><p className="mt-3 max-w-2xl text-sm leading-6 text-white/70 sm:text-base">Odaberi igru i odmah kreni. Svaka kartica otvara baš onu igru koju odabereš.</p><div className="mt-4 flex flex-wrap gap-2 text-[11px] font-bold text-white/65"><span className="rounded-full border border-white/10 px-3 py-2">6 IGARA</span><span className="rounded-full border border-white/10 px-3 py-2">MOBITEL I RAČUNALO</span><span className="rounded-full border border-white/10 px-3 py-2">BODOVI I REKORDI</span></div></div></header>
    <section id="popis-igara" className="mt-5 scroll-mt-4" aria-label="Odabir igre">
      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="text-xl font-black text-white">Odaberi igru</h2><p className="mt-1 text-xs text-white/55">Dodirni karticu ili tipku „Otvori igru”.</p></div><label className="relative block w-full sm:max-w-xs"><span className="sr-only">Pretraži igre</span><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/45"/><input value={gameQuery} onChange={event=>setGameQuery(event.target.value)} placeholder="Pronađi igru..." className="min-h-12 w-full rounded-xl border border-white/15 bg-[#09182a] pl-10 pr-10 text-sm text-white outline-none placeholder:text-white/40 focus:border-amber-200 focus:ring-2 focus:ring-amber-200/20"/>{gameQuery&&<button type="button" onClick={()=>setGameQuery("")} aria-label="Očisti pretragu" className="absolute right-2 top-1/2 min-h-9 min-w-9 -translate-y-1/2 rounded-lg text-white/60 hover:bg-white/10">×</button>}</label></div>
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-2" role="group" aria-label="Filtriraj igre">{filters.map(filter=><button key={filter} type="button" onClick={()=>setGameFilter(filter)} aria-pressed={gameFilter===filter} className={`min-h-10 shrink-0 rounded-full border px-4 text-xs font-bold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-200 ${gameFilter===filter?"border-amber-200 bg-amber-200 text-slate-950":"border-white/15 bg-white/5 text-white/75 hover:bg-white/10"}`}>{filter}</button>)}</div>
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3" aria-live="polite">{visibleGames.map((game,index)=>{const Icon=game.icon;return <button key={game.id} type="button" onClick={()=>open(game.id)} aria-label={`Otvori igru: ${game.title}`} className="group flex min-h-32 w-full items-center gap-4 rounded-2xl border border-white/10 bg-gradient-to-br from-white/[.08] to-white/[.025] p-4 text-left shadow-lg transition hover:border-amber-200/50 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-200 active:scale-[.99]">{game.id==="classic"?<span className="h-28 w-[76px] shrink-0 overflow-hidden rounded-xl border border-amber-200/35 bg-black/30 shadow-lg"><img src="/kviz/images/Rije%C4%8Di%20domovine_%20Hrvatska%20ba%C5%A1tina.png" alt="Riječi domovine – Hrvatska baština" loading="lazy" className="h-full w-full object-cover object-top transition duration-500 group-hover:scale-105"/></span>:<span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-amber-200/25 bg-black/20 text-amber-200"><Icon className="h-5 w-5"/></span>}<span className="min-w-0 flex-1"><span className="block text-[10px] font-black tracking-[.15em] text-amber-200">{game.tag}</span><strong className="mt-1 block text-lg leading-tight text-white">{game.title}</strong><span className="mt-1 block text-xs leading-5 text-white/60">{game.desc}</span><span className="mt-3 inline-flex min-h-9 items-center gap-2 rounded-lg bg-amber-200 px-3 text-xs font-black text-slate-950">OTVORI IGRU <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1"/></span></span></button>;})}</div>
      {visibleGames.length===0&&<div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center"><p className="font-bold text-white">Nema pronađene igre.</p><p className="mt-1 text-sm text-white/55">Promijeni pojam ili odaberi drugu skupinu.</p><button onClick={()=>{setGameQuery("");setGameFilter("Sve igre");}} className="mt-4 min-h-11 rounded-xl bg-amber-200 px-4 text-sm font-black text-slate-950">Prikaži sve igre</button></div>}
    </section>
    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[.035] p-4"><div><p className="text-[11px] font-bold uppercase tracking-widest text-white/45">Bodovi u ovom posjetu</p><p className="mt-1 text-2xl font-black text-amber-200">{score}</p></div><div className="flex items-center gap-2 text-sm text-white/65"><Trophy className="h-5 w-5 text-amber-200"/> Osobni rekord: {best}</div></div>
  </main>;
  return <Frame title={GAMES.find(game=>game.id===active)?.title||"Igra"} subtitle="Riječi domovine · uči kroz igru" onBack={()=>setActive(null)}>
    {active==="scramble"&&<><div className="rounded-xl border border-white/10 bg-white/5 p-4 text-center"><p className="text-xs font-bold tracking-widest text-amber-200">POMOĆ · {item.group} · RAZINA {Math.min(1+Math.floor(scrambleWins/3),3)}</p><p className="mt-2 text-white/70">{item.clue}</p><p className="mt-5 text-[11px] font-bold tracking-widest text-white/45">SLOŽI RIJEČ DODIRIVANJEM SLOVA</p><div className="mt-3 flex min-h-12 flex-wrap justify-center gap-2" aria-label="Složena riječ">{Array.from({length:item.clean.length},(_,position)=>{const tileIndex=scramblePicked[position];const letter=tileIndex===undefined?"":scrambled[tileIndex];const correct=letter&&normalize(letter)===normalize(item.clean)[position];return <button key={position} type="button" onClick={()=>setScramblePicked(previous=>previous.filter((_,index)=>index!==position))} disabled={tileIndex===undefined||solved} aria-label={letter?"Ukloni slovo "+letter:"Prazno mjesto"} className={"grid h-12 min-w-10 place-items-center rounded-lg border-2 px-2 text-lg font-black transition "+(!letter?"border-white/15 bg-black/20 text-white/30":correct?"border-emerald-400 bg-emerald-500 text-white shadow-[0_0_14px_rgba(16,185,129,.25)]":"border-rose-400 bg-rose-600 text-white shadow-[0_0_14px_rgba(244,63,94,.2)]")+" disabled:cursor-default"}>{letter||"·"}</button>})}</div><div className="mt-4 flex flex-wrap justify-center gap-2">{scrambled.map((letter,index)=>{const selectedAt=scramblePicked.indexOf(index);const used=selectedAt!==-1;const correct=used&&normalize(letter)===normalize(item.clean)[selectedAt];return <button key={index} type="button" onClick={()=>setScramblePicked(previous=>[...previous,index])} disabled={solved||used||scramblePicked.length>=item.clean.length} aria-label={"Odaberi slovo "+letter} className={"grid h-12 w-12 place-items-center rounded-xl border-2 text-xl font-black shadow-lg transition active:scale-95 disabled:cursor-default "+(used?(correct?"border-emerald-400 bg-emerald-500 text-white shadow-[0_0_14px_rgba(16,185,129,.25)]":"border-rose-400 bg-rose-600 text-white shadow-[0_0_14px_rgba(244,63,94,.2)]"):"border-amber-200/30 bg-gradient-to-b from-[#315b7b] to-[#102a43] text-white hover:border-amber-200")}>{letter}</button>})}</div><button type="button" onClick={()=>setScramblePicked([])} disabled={!scramblePicked.length||solved} className="mt-3 text-xs font-bold text-white/55 underline underline-offset-4 disabled:opacity-30">Očisti odabir</button></div><button onClick={submitScramble} disabled={scramblePicked.length!==item.clean.length||solved} className="mt-3 w-full rounded-xl bg-amber-200 px-4 py-3 font-black text-slate-950 disabled:opacity-40">Provjeri odgovor</button>{feedback&&<p role="status" className="mt-3 text-sm text-amber-100">{feedback}</p>}{solved&&<button onClick={nextScramble} className="mt-3 w-full rounded-xl border border-white/15 px-4 py-3 font-bold text-white">Sljedeća riječ →</button>}</>}
    {active==="guess"&&<><p className="rounded-xl bg-white/5 p-4 text-white/75">{guessTarget.clue}</p><LetterKeyboard value={typed} onChange={setTyped} target={guessTarget.clean} maxLength={guessTarget.clean.length} disabled={solved||attempts>=5}/><button onClick={submitGuess} disabled={!typed.trim()||solved||attempts>=5} className="mt-3 w-full rounded-xl bg-amber-200 px-4 py-3 font-black text-slate-950 disabled:opacity-40">Pogodi</button><p className="mt-3 text-sm text-white/60">Pokušaji: {attempts}/5</p>{feedback&&<p role="status" className="mt-2 text-sm text-amber-100">{feedback}</p>}{(solved||attempts>=5)&&<button onClick={()=>{setGuessTarget(pickFreshItems(WORDS,"guess",1)[0]);setTyped("");setFeedback("");setAttempts(0);setSolved(false);}} className="mt-3 w-full rounded-xl border border-white/15 px-4 py-3 font-bold text-white">Nova riječ</button>}</>}
    {active==="groups"&&<><p className="mb-4 text-sm text-white/65">Odaberi četiri riječi koje pripadaju istoj skupini. Pronađeno: {found.length}/4.</p><div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{groupWords.map(word=><button key={word} type="button" aria-pressed={selected.includes(word)} onClick={()=>chooseGroupWord(word)} disabled={found.some(group=>group.words.includes(word))} className={`rounded-xl border px-2 py-4 text-sm font-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-200 ${selected.includes(word)?"border-amber-200 bg-amber-200 text-slate-950":"border-white/10 bg-white/5 text-white"}`}>{word}</button>)}</div>{found.map(group=><div key={group.title} className="mt-3 rounded-xl border border-emerald-300/25 bg-emerald-300/10 p-3 text-emerald-100"><strong>{group.title}</strong><p className="text-sm">{group.words.join(" · ")}</p></div>)}{feedback&&<p role="status" className="mt-3 text-sm text-amber-100">{feedback}</p>}{found.length===4&&<Success>Sve skupine su pronađene!</Success>}</>}
    {active==="daily"&&<><p className="text-sm text-white/65">Tajna riječ ima {[...dailyWord].length} slova. Pokušaj je pogoditi u šest pokušaja. Današnji pokušaji čuvaju se na ovom uređaju.</p><LetterKeyboard value={typed} onChange={setTyped} target={normalize(dailyWord)} maxLength={normalize(dailyWord).length} disabled={dailyDone}/><button onClick={submitDaily} disabled={dailyDone||!typed.trim()} className="mt-3 w-full rounded-xl bg-amber-200 px-4 py-3 font-black text-slate-950 disabled:opacity-40">Provjeri riječ</button><div className="mt-4 space-y-2">{dailyGuesses.map((guess,index)=><div key={index} className="flex flex-wrap justify-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2">{[...normalize(guess)].map((letter,position)=><span key={position} className={"grid h-8 min-w-8 place-items-center rounded-md border text-sm font-black text-white "+(letter===[...normalize(dailyWord)][position]?"border-emerald-400 bg-emerald-500":"border-rose-400 bg-rose-600")}>{letter}</span>)}</div>)}</div>{feedback&&<p role="status" className="mt-3 text-sm text-amber-100">{feedback}</p>}{dailyDone&&<Success>{dailyWon?"Bravo! Pronašao/la si današnju riječ.":`Današnja riječ bila je: ${dailyWord}`}</Success>}</>}
  </Frame>;
}
