import { useMemo, useState } from "react";

const WORDS = [
  { word: "HRVATSKA", category: "Domovina", level: 1, clue: "Država između Jadrana i srednje Europe.", explanation: "Hrvatska je europska država čiji je glavni grad Zagreb." },
  { word: "VUKOVAR", category: "Domovina", level: 1, clue: "Grad na Dunavu, simbol stradanja i otpora 1991. godine.", explanation: "Vukovar je grad na istoku Hrvatske, posebno važan u sjećanju na Domovinski rat." },
  { word: "KNIN", category: "Domovina", level: 1, clue: "Povijesni kraljevski grad podno Dinare.", explanation: "Knin je povijesni grad u Dalmatinskoj zagori." },
  { word: "ZAGREB", category: "Domovina", level: 1, clue: "Glavni i najveći grad Republike Hrvatske.", explanation: "Zagreb je političko, kulturno, gospodarsko i obrazovno središte Hrvatske." },
  { word: "MOLITVA", category: "Vjera", level: 1, clue: "Obraćanje Bogu riječima, mislima ili u tišini.", explanation: "U kršćanstvu molitva može biti zahvala, prošnja, slavljenje ili razmatranje." },
  { word: "ISUS", category: "Vjera", level: 1, clue: "Središnja osoba kršćanske vjere.", explanation: "Kršćani vjeruju da je Isus Krist Sin Božji i Spasitelj." },
  { word: "BIBLIJA", category: "Vjera", level: 1, clue: "Sveto pismo kršćana, sastavljeno od Staroga i Novoga zavjeta.", explanation: "Biblija je zbirka svetih knjiga koje čine temelj kršćanske vjere." },
  { word: "USKRS", category: "Vjera", level: 1, clue: "Najveći kršćanski blagdan kojim se slavi Kristovo uskrsnuće.", explanation: "Uskrs je središnji blagdan kršćanske vjere." },
  { word: "KRUNICA", category: "Vjera", level: 2, clue: "Katolička pobožnost koja razmatra otajstva Isusova i Marijina života.", explanation: "Krunica uključuje niz molitava i razmatranje otajstava." },
  { word: "MILOSRĐE", category: "Vjera", level: 2, clue: "Suosjećanje i djelatna ljubav prema čovjeku u nevolji.", explanation: "Kršćansko milosrđe poziva na konkretnu pomoć, praštanje i brigu za bližnjega." },
  { word: "GLAGOLJICA", category: "Baština", level: 2, clue: "Staro slavensko pismo s važnom hrvatskom tradicijom.", explanation: "Hrvatska glagoljaška tradicija važna je za hrvatsku pismenost, književnost i liturgiju." },
  { word: "PLETER", category: "Baština", level: 2, clue: "Ukrasni motiv isprepletenih traka na starim kamenim spomenicima.", explanation: "Pleterni ukrasi česti su na ranosrednjovjekovnim kamenim spomenicima." },
  { word: "LICITAR", category: "Baština", level: 2, clue: "Šareno ukrašeni tradicijski predmet od tijesta, često u obliku srca.", explanation: "Licitarsko umijeće povezano je sa sjevernom Hrvatskom i UNESCO-ovom nematerijalnom baštinom." },
  { word: "KLAPA", category: "Baština", level: 2, clue: "Skupina pjevača koja njeguje tradicionalno višeglasno pjevanje.", explanation: "Klapsko pjevanje posebno je povezano s Dalmacijom i UNESCO-ovom nematerijalnom baštinom." },
  { word: "OLUJA", category: "Povijest", level: 2, clue: "Vojno-redarstvena operacija provedena u kolovozu 1995. godine.", explanation: "Operacija Oluja bila je ključna operacija u završnoj fazi Domovinskog rata. O njezinim posljedicama važno je govoriti uz provjerene izvore i poštovanje prema svim žrtvama." },
  { word: "SINJSKA ALKA", category: "Baština", level: 3, clue: "Viteško natjecanje u Sinju koje čuva sjećanje na događaj iz 1715. godine.", explanation: "Sinjska alka tradicijska je viteška igra i nematerijalna kulturna baština Hrvatske." },
  { word: "BAŠĆANSKA PLOČA", category: "Baština", level: 3, clue: "Jedan od najvažnijih hrvatskih glagoljskih kamenih spomenika.", explanation: "Pronađena je u crkvi svete Lucije u Jurandvoru na Krku i važan je izvor za hrvatski jezik i povijest." },
  { word: "DOMOVINSKI RAT", category: "Povijest", level: 3, clue: "Rat za obranu neovisnosti i teritorijalne cjelovitosti Hrvatske 1991.–1995.", explanation: "Domovinski rat temeljno je razdoblje suvremene hrvatske povijesti. Sjećanje na poginule, nestale i preživjele zahtijeva dostojanstvo i povijesnu točnost." },
  { word: "DUBROVNIK", category: "Domovina", level: 3, clue: "Povijesni grad na jugu Hrvatske, nekoć središte Dubrovačke Republike.", explanation: "Dubrovačka Republika razvila je snažnu pomorsku, trgovačku i diplomatsku tradiciju." },
  { word: "TAMBURICA", category: "Baština", level: 3, clue: "Žičano glazbalo snažno povezano s tradicijskom glazbom Slavonije.", explanation: "Tamburaška glazba važan je dio glazbene tradicije Slavonije i drugih hrvatskih krajeva." },
  { word: "DOMOVINA", category: "Domovina", level: 3, clue: "Zemlja kojoj pripadamo i s kojom nas povezuju povijest, ljudi i odgovornost.", explanation: "Domoljublje se pokazuje znanjem, brigom za zajednicu i čuvanjem kulturne baštine." },,
  { word: "OSIJEK", category: "Domovina", level: 1, clue: "Najveći grad Slavonije, smješten uz Dravu.", explanation: "Osijek je važno regionalno, kulturno i gospodarsko središte istočne Hrvatske." },
  { word: "PULA", category: "Domovina", level: 1, clue: "Istarski grad poznat po rimskom amfiteatru.", explanation: "Pulska Arena jedan je od najbolje očuvanih rimskih amfiteatara." },
  { word: "RIJEKA", category: "Domovina", level: 1, clue: "Veliki kvarnerski grad s važnom morskom lukom.", explanation: "Rijeka je važno prometno, lučko i kulturno središte." },
  { word: "ZADAR", category: "Domovina", level: 1, clue: "Dalmatinski grad poznat po Morskim orguljama.", explanation: "Zadar ima bogatu antičku i srednjovjekovnu baštinu." },
  { word: "PAG", category: "Domovina", level: 1, clue: "Otok poznat po čipki i proizvodnji soli.", explanation: "Paška čipka zaštićena je kao nematerijalna kulturna baština." },
  { word: "HVAR", category: "Domovina", level: 1, clue: "Dalmatinski otok poznat po lavandi.", explanation: "Hvar je poznat po Starogradskom polju, povijesnim naseljima i mediteranskom krajoliku." },
  { word: "VELEBIT", category: "Domovina", level: 1, clue: "Najduža hrvatska planina.", explanation: "Velebit je zaštićen kao park prirode, a njegovi dijelovi obuhvaćaju nacionalne parkove." },
  { word: "SAVA", category: "Domovina", level: 1, clue: "Rijeka koja protječe kroz Zagreb.", explanation: "Sava je jedna od najvećih rijeka koje protječu Hrvatskom." },
  { word: "DRAVA", category: "Domovina", level: 1, clue: "Rijeka uz koju leže Varaždin i Osijek.", explanation: "Drava je važan dio riječnog i prirodnog sustava sjeverne i istočne Hrvatske." },
  { word: "MASLINA", category: "Baština", level: 1, clue: "Mediteransko stablo čiji se plod koristi za ulje.", explanation: "Maslinarstvo je važan dio tradicije i gospodarstva hrvatskog priobalja i otoka." },
  { word: "ČIPKA", category: "Baština", level: 2, clue: "Ručno izrađen tekstilni ukras poznat u Pagu, Lepoglavi i na Hvaru.", explanation: "Hrvatska tradicija čipkarstva upisana je na UNESCO-ov popis nematerijalne baštine." },
  { word: "MOREŠKA", category: "Baština", level: 2, clue: "Tradicionalni mačevni ples s Korčule.", explanation: "Moreška je poznata korčulanska plesna igra s mačevima." },
  { word: "KUMPANIJA", category: "Baština", level: 2, clue: "Otočna viteška igra s mačevima koja se izvodi na Korčuli.", explanation: "Kumpanija je dio lokalne tradicije pojedinih korčulanskih mjesta." },
  { word: "KARNEVAL", category: "Običaji", level: 2, clue: "Razdoblje pokladnih povorki, maski i veselja.", explanation: "Pokladni običaji u Hrvatskoj razlikuju se od kraja do kraja; riječki karneval jedan je od najpoznatijih." },
  { word: "KOPAČKI RIT", category: "Priroda", level: 2, clue: "Močvarno područje uz ušće Drave u Dunav.", explanation: "Kopački rit jedan je od najvažnijih močvarnih i ornitoloških rezervata u ovom dijelu Europe." },
  { word: "PLITVICE", category: "Priroda", level: 2, clue: "Nacionalni park poznat po jezerima i slapovima.", explanation: "Nacionalni park Plitvička jezera upisan je na UNESCO-ov popis svjetske baštine." },
  { word: "KORNATI", category: "Priroda", level: 2, clue: "Nacionalni park otočja u sjevernoj Dalmaciji.", explanation: "Kornati su poznati po razvedenoj obali, otočićima i podmorju." },
  { word: "NERETVA", category: "Priroda", level: 2, clue: "Rijeka koja oblikuje poznatu deltu u južnoj Dalmaciji.", explanation: "Dolina Neretve poznata je po močvarama, poljoprivredi i bogatom životinjskom svijetu." },
  { word: "DUBROVAČKA REPUBLIKA", category: "Povijest", level: 3, clue: "Povijesna pomorska republika sa središtem u Dubrovniku.", explanation: "Dubrovačka Republika razvila je snažnu trgovačku, pomorsku i diplomatsku tradiciju." },
  { word: "VINODOLSKI ZAKON", category: "Povijest", level: 3, clue: "Pravni spomenik sastavljen 1288. godine.", explanation: "Vinodolski zakon jedan je od najstarijih hrvatskih pravnih spomenika pisanih narodnim jezikom." },
  { word: "KRALJ TOMISLAV", category: "Povijest", level: 3, clue: "Vladar kojeg hrvatska tradicija pamti kao prvoga kralja.", explanation: "Tomislav se u hrvatskoj historiografiji povezuje s učvršćivanjem ranosrednjovjekovne hrvatske države." },
  { word: "PETAR ZRINSKI", category: "Povijest", level: 3, clue: "Hrvatski velikaš pogubljen 1671. godine.", explanation: "Petar Zrinski pogubljen je u Bečkom Novom Mjestu zajedno s Franom Krstom Frankopanom." },
  { word: "FRAN KRSTO FRANKOPAN", category: "Povijest", level: 3, clue: "Hrvatski plemić i književnik pogubljen 1671. godine.", explanation: "Frankopan je bio pjesnik i velikaš, a njegovo se ime pamti uz Petra Zrinskog." },
  { word: "NIKOLA TESLA", category: "Znanje", level: 3, clue: "Izumitelj i znanstvenik rođen u Smiljanu.", explanation: "Nikola Tesla dao je velik doprinos razvoju izmjenične električne energije i elektrotehnike." },
  { word: "RUĐER BOŠKOVIĆ", category: "Znanje", level: 3, clue: "Dubrovčanin, znanstvenik i filozof iz 18. stoljeća.", explanation: "Ruđer Bošković bavio se matematikom, astronomijom, fizikom i filozofijom." },
  { word: "FAUST VRANČIĆ", category: "Znanje", level: 3, clue: "Hrvatski izumitelj povezan s nacrtom padobrana.", explanation: "Faust Vrančić objavio je djelo Machinae Novae s prikazima tehničkih izuma." },
  { word: "MARKO MARULIĆ", category: "Kultura", level: 3, clue: "Splitski humanist kojeg se naziva ocem hrvatske književnosti.", explanation: "Marulićev Judita iz 1501. godine jedno je od ključnih djela hrvatske književnosti." },
  { word: "IVANA BRLIĆ MAŽURANIĆ", category: "Kultura", level: 3, clue: "Hrvatska književnica, autorica Priča iz davnine.", explanation: "Njezina djela ubrajaju se među najvažnija ostvarenja hrvatske dječje književnosti." },
  { word: "AUGUST ŠENOA", category: "Kultura", level: 3, clue: "Hrvatski književnik i autor romana Zlatarovo zlato.", explanation: "Šenoa je snažno obilježio hrvatski književni život 19. stoljeća." },
  { word: "ANTUN GUSTAV MATOŠ", category: "Kultura", level: 3, clue: "Hrvatski književnik, pjesnik i esejist rođen u Tovarniku.", explanation: "Matoš je jedan od najvažnijih predstavnika hrvatske moderne." },
  { word: "EUPRAZIJEVA BAZILIKA", category: "Baština", level: 3, clue: "Porečki ranokršćanski kompleks na UNESCO-ovu popisu.", explanation: "Kompleks je izniman primjer ranobizantske sakralne arhitekture i umjetnosti." },
  { word: "ŠIBENSKA KATEDRALA", category: "Baština", level: 3, clue: "Renesansna katedrala sv. Jakova, građena od kamena.", explanation: "Katedrala sv. Jakova u Šibeniku upisana je na UNESCO-ov popis svjetske baštine." },
  { word: "HRVATSKI SABOR", category: "Zajednica", level: 2, clue: "Predstavničko tijelo građana i nositelj zakonodavne vlasti.", explanation: "Hrvatski sabor donosi zakone i obavlja druge poslove određene Ustavom." },
  { word: "ZAJEDNIŠTVO", category: "Zajednica", level: 2, clue: "Povezanost ljudi koji surađuju i pomažu jedni drugima.", explanation: "Zajedništvo se gradi povjerenjem, odgovornošću i brigom za druge." },
  { word: "ZAVIČAJ", category: "Zajednica", level: 1, clue: "Kraj iz kojeg netko potječe ili s kojim je posebno povezan.", explanation: "Zavičaj obuhvaća prostor, ljude, običaje i sjećanja koja oblikuju osjećaj pripadnosti." },
  { word: "HODOČAŠĆE", category: "Vjera", level: 2, clue: "Putovanje vjernika na sveto mjesto.", explanation: "Hodočašće je izraz vjere, molitve i duhovnog traženja." },
  { word: "EVANĐELJE", category: "Vjera", level: 2, clue: "Radosna vijest o Isusu Kristu i naziv za četiri novozavjetna spisa.", explanation: "Četiri kanonska evanđelja nalaze se na početku Novoga zavjeta." },
  { word: "BETLEHEM", category: "Vjera", level: 1, clue: "Mjesto Isusova rođenja prema evanđeoskoj predaji.", explanation: "Betlehem je grad u kojem se prema evanđeljima rodio Isus." },
  { word: "ZAHVALA", category: "Vjera", level: 1, clue: "Izražavanje priznanja za primljeno dobro.", explanation: "Zahvalnost je važan dio molitve i svakodnevnog odnosa prema bližnjima." },
  { word: "KUPA", category: "Priroda", level: 1, clue: "Rijeka koja protječe kroz Karlovac i ulijeva se u Savu kod Siska.", explanation: "Kupa je važna rijeka središnje Hrvatske i prirodna poveznica Gorskog kotara i Posavine." },
  { word: "MURA", category: "Priroda", level: 1, clue: "Rijeka koja čini dio hrvatske granice na sjeveru.", explanation: "Mura protječe uz Međimurje i važan je dio riječnog krajolika sjeverne Hrvatske." },
  { word: "CETINA", category: "Priroda", level: 1, clue: "Rijeka koja izvire u Dalmatinskoj zagori i protječe kroz Omiš.", explanation: "Cetina je poznata po izvoru, kanjonu i hidrološkim vrijednostima." },
  { word: "ZRMANJA", category: "Priroda", level: 2, clue: "Rijeka poznata po kanjonu i slapovima u sjevernoj Dalmaciji.", explanation: "Kanjon Zrmanje ističe se krškim reljefom i očuvanim prirodnim krajolikom." },
  { word: "PAPUK", category: "Priroda", level: 2, clue: "Planina u Slavoniji i park prirode.", explanation: "Papuk je zaštićen kao park prirode i geopark." },
  { word: "RISNJAK", category: "Priroda", level: 2, clue: "Nacionalni park u Gorskom kotaru.", explanation: "Nacionalni park Risnjak obuhvaća planinski prostor bogat šumama i krškim obilježjima." },
  { word: "PAKLENICA", category: "Priroda", level: 2, clue: "Nacionalni park na južnom Velebitu.", explanation: "Nacionalni park Paklenica poznat je po kanjonima Velike i Male Paklenice." },
  { word: "MLJET", category: "Domovina", level: 2, clue: "Južnodalmatinski otok s nacionalnim parkom.", explanation: "Nacionalni park Mljet obuhvaća zapadni dio otoka i poznata slana jezera." },
  { word: "VIS", category: "Domovina", level: 2, clue: "Dalmatinski otok poznat po Modroj špilji na obližnjem Biševu.", explanation: "Vis ima dugu pomorsku povijest i prirodne posebnosti, a Biševo je poznato po Modroj špilji." },
  { word: "BRAČ", category: "Domovina", level: 2, clue: "Otok na kojem se nalazi poznata plaža Zlatni rat.", explanation: "Brač je jedan od najvećih hrvatskih otoka i poznat je po kamenu i klesarskoj tradiciji." },
  { word: "RAB", category: "Domovina", level: 2, clue: "Kvarnerski otok poznat po staroj gradskoj jezgri i rapskoj torti.", explanation: "Grad Rab prepoznatljiv je po četiri zvonika i srednjovjekovnoj jezgri." },
  { word: "LASTOVO", category: "Domovina", level: 2, clue: "Južnodalmatinski otok i park prirode.", explanation: "Park prirode Lastovsko otočje obuhvaća otoke, otočiće i okolno more." },
  { word: "LOŠINJ", category: "Domovina", level: 2, clue: "Kvarnerski otok poznat po tradiciji pomorstva i dupinima.", explanation: "Lošinjski akvatorij poznat je po istraživanju i zaštiti dobrih dupina." },
  { word: "LIKA", category: "Domovina", level: 1, clue: "Planinska hrvatska regija između Velebita i Plješivice.", explanation: "Lika je povijesna regija poznata po planinskom krajoliku, rijekama i tradiciji." },
  { word: "SLAVONIJA", category: "Domovina", level: 1, clue: "Istočna hrvatska povijesna regija poznata po ravnicama i tradiciji.", explanation: "Slavonija je poznata po plodnim ravnicama, poljoprivredi, tamburaškoj glazbi i običajima." },
  { word: "BARANJA", category: "Domovina", level: 2, clue: "Regija između Drave i Dunava, poznata po vinima i tradiciji.", explanation: "Baranja je kulturno i prirodno raznolika regija na istoku Hrvatske." },
  { word: "MEĐIMURJE", category: "Domovina", level: 2, clue: "Najsjevernija hrvatska regija između Mure i Drave.", explanation: "Međimurje njeguje prepoznatljive običaje, glazbu i kajkavsku književnu tradiciju." },
  { word: "ZAGORJE", category: "Domovina", level: 1, clue: "Hrvatska regija s brežuljcima, dvorcima i tradicijskim običajima.", explanation: "Hrvatsko zagorje poznato je po dvorcima, vinogradima i tradicijskom načinu života." },
  { word: "ISTRA", category: "Domovina", level: 1, clue: "Poluotok na sjevernom Jadranu s bogatom kulturnom baštinom.", explanation: "Istra je poznata po spoju hrvatskih, talijanskih i drugih kulturnih utjecaja." },
  { word: "SALONA", category: "Povijest", level: 3, clue: "Antički grad i arheološko nalazište pokraj Solina.", explanation: "Salona je bila važno središte rimske provincije Dalmacije." },
  { word: "NARONA", category: "Povijest", level: 3, clue: "Antičko rimsko naselje čiji se ostaci nalaze u Vidu kod Metkovića.", explanation: "Narona je bila značajno rimsko naselje, a njezini se nalazi čuvaju u Arheološkom muzeju Narona." },
  { word: "TRAKOŠĆAN", category: "Baština", level: 3, clue: "Poznati dvorac i povijesno imanje u Hrvatskom zagorju.", explanation: "Dvorac Trakošćan jedan je od najpoznatijih hrvatskih dvoraca." },
  { word: "NEHAJ", category: "Baština", level: 2, clue: "Tvrđava iznad Senja, povezana s uskocima.", explanation: "Tvrđava Nehaj izgrađena je u 16. stoljeću i simbol je senjske usk očke povijesti." },
  { word: "KLIS", category: "Baština", level: 3, clue: "Tvrđava iznad Splita s važnom ulogom u hrvatskoj povijesti.", explanation: "Tvrđava Klis stoljećima je imala stratešku ulogu u obrani prostora između obale i zaleđa." },
  { word: "KAMENITA VRATA", category: "Baština", level: 2, clue: "Zagrebački prolaz i svetište s likom Majke Božje od Kamenitih vrata.", explanation: "Kamenita vrata dio su povijesne jezgre Gornjega grada i važno zagrebačko marijansko svetište." },
  { word: "TRSAT", category: "Vjera", level: 2, clue: "Riječko svetište i hodočasničko mjesto na Trsatskom brijegu.", explanation: "Svetište Majke Božje Trsatske jedno je od najpoznatijih marijanskih svetišta u Hrvatskoj." },
  { word: "MARIJA BISTRICA", category: "Vjera", level: 3, clue: "Najpoznatije hrvatsko marijansko svetište u Hrvatskom zagorju.", explanation: "Nacionalno svetište Majke Božje Bistričke važno je hodočasničko odredište." },
  { word: "STEPINAC", category: "Vjera", level: 3, clue: "Zagrebački nadbiskup i kardinal Alojzije, proglašen blaženim.", explanation: "Alojzije Stepinac bio je zagrebački nadbiskup; njegova povijesna uloga predmet je istraživanja i rasprava." },
  { word: "BEĆARAC", category: "Običaji", level: 2, clue: "Tradicionalni napjev iz Slavonije, Baranje i Srijema.", explanation: "Bećarac je oblik vokalno-instrumentalne glazbe, upisan na UNESCO-ov popis nematerijalne baštine." },
  { word: "NIJEMO KOLO", category: "Običaji", level: 3, clue: "Tradicionalni ples Dalmatinske zagore bez instrumentalne pratnje.", explanation: "Nijemo kolo dinarskog područja upisano je na UNESCO-ov popis nematerijalne kulturne baštine." },
  { word: "OJKANJE", category: "Običaji", level: 3, clue: "Tradicionalni način pjevanja iz dinarskog područja.", explanation: "Ojkanje je tradicijski oblik pjevanja koji se njeguje u dijelovima dinarskog područja." },
  { word: "KLAPSKO PJEVANJE", category: "Baština", level: 2, clue: "Višeglasno tradicijsko pjevanje povezano s Dalmacijom.", explanation: "Klapsko pjevanje je tradicija višeglasnog pjevanja, osobito prisutna u Dalmaciji." },
  { word: "GANGA", category: "Baština", level: 3, clue: "Tradicijski oblik pjevanja raširen u dijelovima Dalmatinske zagore.", explanation: "Ganga je specifičan oblik višeglasnog tradicijskog pjevanja." },
  { word: "LIČKO PRELO", category: "Običaji", level: 2, clue: "Tradicionalno okupljanje uz rad, pjesmu i druženje u Lici.", explanation: "Prela su bila važna društvena okupljanja na kojima se radilo, pjevalo i prenosilo znanje." },
  { word: "KONAVLE", category: "Domovina", level: 2, clue: "Južnodalmatinski kraj poznat po nošnji, vezu i tradiciji.", explanation: "Konavle čuvaju prepoznatljivu narodnu nošnju, vez i običaje." },
  { word: "MOTOVUN", category: "Domovina", level: 2, clue: "Istarski gradić na brežuljku, poznat po srednjovjekovnoj jezgri.", explanation: "Motovun je istarsko naselje s očuvanom srednjovjekovnom urbanom jezgrom." },
  { word: "HUM", category: "Domovina", level: 2, clue: "Istarsko naselje poznato kao jedan od najmanjih gradova na svijetu.", explanation: "Hum je malo povijesno naselje u središnjoj Istri." },
  { word: "KRAŠIĆ", category: "Domovina", level: 2, clue: "Mjesto u kojem je rođen blaženi Alojzije Stepinac.", explanation: "Krašić je naselje u središnjoj Hrvatskoj povezano s biografijom Alojzija Stepinca." },
  { word: "PETAR KREŠIMIR", category: "Povijest", level: 3, clue: "Hrvatski kralj iz 11. stoljeća, povezan s jačanjem kraljevstva.", explanation: "Petar Krešimir IV. jedan je od najpoznatijih vladara hrvatske srednjovjekovne povijesti." },
  { word: "ZVONIMIR", category: "Povijest", level: 3, clue: "Hrvatski kralj iz 11. stoljeća okrunjen u Solinu.", explanation: "Dmitar Zvonimir bio je hrvatski kralj u drugoj polovici 11. stoljeća." },
  { word: "BRANIMIR", category: "Povijest", level: 3, clue: "Hrvatski knez iz 9. stoljeća čije je vrijeme povezano s pismom pape Ivana VIII.", explanation: "Knez Branimir vladao je u 9. stoljeću; papino pismo iz 879. važan je izvor za to razdoblje." },
  { word: "LJUDEVIT GAJ", category: "Kultura", level: 3, clue: "Hrvatski preporoditelj i jedna od središnjih osoba ilirskog pokreta.", explanation: "Ljudevit Gaj imao je važnu ulogu u hrvatskom narodnom preporodu i standardizaciji pravopisa." },
  { word: "IVAN MAŽURANIĆ", category: "Kultura", level: 3, clue: "Hrvatski ban i književnik, autor Smrti Smail-age Čengića.", explanation: "Ivan Mažuranić bio je književnik i ban, a njegovo djelo pripada kanonu hrvatske književnosti." },
  { word: "JURAJ DOBRILA", category: "Povijest", level: 3, clue: "Istarski biskup i preporoditelj koji se zalagao za obrazovanje na hrvatskom jeziku.", explanation: "Juraj Dobrila bio je biskup i istaknuti zagovornik prava i obrazovanja hrvatskog stanovništva u Istri." },
  { word: "VUKOVARSKA GOLUBICA", category: "Povijest", level: 3, clue: "Prepoznatljiv naziv za spomen-obilježje na mjestu masovne grobnice na Ovčari.", explanation: "Spomen-obilježje na Ovčari oblikovano je kao golubica slomljenih krila." },
  { word: "DAN DRŽAVNOSTI", category: "Povijest", level: 2, clue: "Hrvatski državni blagdan koji se obilježava 30. svibnja.", explanation: "Dan državnosti obilježava se 30. svibnja, u spomen na konstituiranje prvoga demokratski izabranog višestranačkog Sabora 1990." },
  { word: "DAN SJEĆANJA", category: "Povijest", level: 2, clue: "Blagdan posvećen sjećanju na žrtve Domovinskog rata i Vukovar i Škabrnju.", explanation: "Dan sjećanja na žrtve Domovinskog rata i Dan sjećanja na žrtvu Vukovara i Škabrnje obilježavaju se 18. studenoga." },
  { word: "VUKOVARSKA BOLNICA", category: "Povijest", level: 3, clue: "Bolnica čiji su ranjenici i civili odvedeni na Ovčaru u studenome 1991.", explanation: "Nakon pada Vukovara 1991. iz vukovarske bolnice odvedeni su ranjenici, civili i branitelji." },
  { word: "SOLIN", category: "Domovina", level: 1, clue: "Grad pokraj Splita s ostacima antičke Salone.", explanation: "Solin je važan zbog antičke Salone i ranosrednjovjekovnih hrvatskih lokaliteta." },
  { word: "SISAK", category: "Domovina", level: 1, clue: "Grad na ušću Kupe u Savu, poznat i po utvrdi iz 16. stoljeća.", explanation: "Sisak ima dugu povijest, a njegova utvrda bila je važna u obrani od Osmanlija." },
  { word: "SENJ", category: "Domovina", level: 1, clue: "Primorski grad poznat po tvrđavi Nehaj i uskocima.", explanation: "Senj je povijesni grad s važnom pomorskom i uskočkom baštinom." },
  { word: "POŽEGA", category: "Domovina", level: 1, clue: "Slavonski grad smješten u Požeškoj kotlini.", explanation: "Požega je povijesno i kulturno središte Požeške kotline." },
  { word: "BJELOVAR", category: "Domovina", level: 1, clue: "Grad u središnjoj Hrvatskoj i središte Bjelovarsko-bilogorske županije.", explanation: "Bjelovar je planski osnovan u 18. stoljeću kao vojno i upravno središte." },
  { word: "KOPRIVNICA", category: "Domovina", level: 2, clue: "Podravski grad poznat po renesansnoj utvrdi.", explanation: "Koprivnica je povijesno i gospodarsko središte Podravine." },
  { word: "GOSPIĆ", category: "Domovina", level: 1, clue: "Grad u Lici, nedaleko od Smiljana i Memorijalnog centra Nikole Tesle.", explanation: "Gospić je regionalno središte Like, a Smiljan je rodno mjesto Nikole Tesle." },
  { word: "METKOVIĆ", category: "Domovina", level: 2, clue: "Grad na Neretvi, blizu arheološkog lokaliteta Narona.", explanation: "Metković je grad u dolini Neretve i polazište za upoznavanje delte i Narone." },
  { word: "OPATIJA", category: "Domovina", level: 2, clue: "Kvarnerski grad poznat po povijesti turizma i obalnoj šetnici.", explanation: "Opatija se razvila kao jedno od najstarijih turističkih središta na hrvatskoj obali." },
  { word: "CAVTAT", category: "Domovina", level: 2, clue: "Primorsko mjesto južno od Dubrovnika, poznato po mauzoleju obitelji Račić.", explanation: "Cavtat je poznat po kulturnoj baštini i djelima kipara Ivana Meštrovića." }
  { word: "KAMENICA", category: "Gradovi", level: 1, clue: "Naselje u Hrvatskoj; naziv nose brojna mjesta.", explanation: "Naselje u Hrvatskoj; naziv nose brojna mjesta." },
  { word: "IMOTSKI", category: "Gradovi", level: 1, clue: "Grad u Dalmatinskoj zagori poznat po Modrom i Crvenom jezeru.", explanation: "Grad u Dalmatinskoj zagori poznat po Modrom i Crvenom jezeru." },
  { word: "MAKARSKA", category: "Gradovi", level: 1, clue: "Primorski grad podno Biokova.", explanation: "Primorski grad podno Biokova." },
  { word: "OMIŠ", category: "Gradovi", level: 1, clue: "Grad na ušću Cetine u Jadransko more.", explanation: "Grad na ušću Cetine u Jadransko more." },
  { word: "BIOGRAD", category: "Gradovi", level: 1, clue: "Obalni grad između Zadra i Šibenika.", explanation: "Obalni grad između Zadra i Šibenika." },
  { word: "VODICE", category: "Gradovi", level: 1, clue: "Turistički grad na šibenskoj rivijeri.", explanation: "Turistički grad na šibenskoj rivijeri." },
  { word: "NOVIGRAD", category: "Gradovi", level: 1, clue: "Ime više hrvatskih mjesta; poznat je istarski i dalmatinski Novigrad.", explanation: "Ime više hrvatskih mjesta; poznat je istarski i dalmatinski Novigrad." },
  { word: "UMAG", category: "Gradovi", level: 1, clue: "Istarski grad na sjeverozapadnoj obali.", explanation: "Istarski grad na sjeverozapadnoj obali." },
  { word: "LABIN", category: "Gradovi", level: 1, clue: "Istarski grad na brežuljku iznad Rapca.", explanation: "Istarski grad na brežuljku iznad Rapca." },
  { word: "BUZET", category: "Gradovi", level: 1, clue: "Istarski grad poznat kao središte tartufarstva.", explanation: "Istarski grad poznat kao središte tartufarstva." },
  { word: "PAZIN", category: "Gradovi", level: 1, clue: "Istarski grad s Kaštelom iznad Pazinske jame.", explanation: "Istarski grad s Kaštelom iznad Pazinske jame." },
  { word: "ROVINJ", category: "Gradovi", level: 1, clue: "Istarski obalni grad s prepoznatljivom starom jezgrom.", explanation: "Istarski obalni grad s prepoznatljivom starom jezgrom." },
  { word: "VRSAR", category: "Gradovi", level: 1, clue: "Istarsko mjesto uz Limsku uvalu.", explanation: "Istarsko mjesto uz Limsku uvalu." },
  { word: "MALI LOŠINJ", category: "Gradovi", level: 1, clue: "Najveće naselje otoka Lošinja.", explanation: "Najveće naselje otoka Lošinja." },
  { word: "KRAPINA", category: "Gradovi", level: 1, clue: "Grad u Hrvatskom zagorju povezan s nalazištem neandertalaca.", explanation: "Grad u Hrvatskom zagorju povezan s nalazištem neandertalaca." },
  { word: "KLANJEC", category: "Gradovi", level: 1, clue: "Zagorski grad u kojem se nalazi galerija Antuna Augustinčića.", explanation: "Zagorski grad u kojem se nalazi galerija Antuna Augustinčića." },
  { word: "ZLATAR", category: "Gradovi", level: 1, clue: "Grad u Hrvatskom zagorju.", explanation: "Grad u Hrvatskom zagorju." },
  { word: "DONJI MIHOLJAC", category: "Gradovi", level: 1, clue: "Slavonski grad uz rijeku Dravu.", explanation: "Slavonski grad uz rijeku Dravu." },
  { word: "NAŠICE", category: "Gradovi", level: 1, clue: "Slavonski grad poznat po dvorcu Pejačević.", explanation: "Slavonski grad poznat po dvorcu Pejačević." },
  { word: "SLATINA", category: "Gradovi", level: 1, clue: "Grad u Virovitičko-podravskoj županiji.", explanation: "Grad u Virovitičko-podravskoj županiji." },
  { word: "ĐURĐEVAC", category: "Gradovi", level: 1, clue: "Podravski grad poznat po Picokijadi.", explanation: "Podravski grad poznat po Picokijadi." },
  { word: "KRIŽEVCI", category: "Gradovi", level: 1, clue: "Grad u sjeverozapadnoj Hrvatskoj.", explanation: "Grad u sjeverozapadnoj Hrvatskoj." },
  { word: "IVANIĆ-GRAD", category: "Gradovi", level: 1, clue: "Grad u Zagrebačkoj županiji.", explanation: "Grad u Zagrebačkoj županiji." },
  { word: "JASTREBARSKO", category: "Gradovi", level: 1, clue: "Grad jugozapadno od Zagreba, poznat po vinogradima.", explanation: "Grad jugozapadno od Zagreba, poznat po vinogradima." },
  { word: "SAMOBOR", category: "Gradovi", level: 1, clue: "Grad poznat po kremšnitama i fašniku.", explanation: "Grad poznat po kremšnitama i fašniku." },
  { word: "ZAPREŠIĆ", category: "Gradovi", level: 1, clue: "Grad zapadno od Zagreba povezan s Novim dvorima.", explanation: "Grad zapadno od Zagreba povezan s Novim dvorima." },
  { word: "DUGO SELO", category: "Gradovi", level: 1, clue: "Grad istočno od Zagreba.", explanation: "Grad istočno od Zagreba." },
  { word: "PETRINJA", category: "Gradovi", level: 1, clue: "Grad na Banovini uz rijeku Petrinjčicu.", explanation: "Grad na Banovini uz rijeku Petrinjčicu." },
  { word: "GLINA", category: "Gradovi", level: 1, clue: "Grad na Banovini uz istoimenu rijeku.", explanation: "Grad na Banovini uz istoimenu rijeku." },
  { word: "HRVATSKA KOSTAJNICA", category: "Gradovi", level: 1, clue: "Grad na Uni uz granicu s Bosnom i Hercegovinom.", explanation: "Grad na Uni uz granicu s Bosnom i Hercegovinom." },
  { word: "NOVSKA", category: "Gradovi", level: 1, clue: "Grad u zapadnoj Slavoniji.", explanation: "Grad u zapadnoj Slavoniji." },
  { word: "PAKRAC", category: "Gradovi", level: 1, clue: "Grad u zapadnoj Slavoniji s važnom povijesnom ulogom.", explanation: "Grad u zapadnoj Slavoniji s važnom povijesnom ulogom." },
  { word: "DARUVAR", category: "Gradovi", level: 1, clue: "Grad poznat po termalnim izvorima i dvorcu Janković.", explanation: "Grad poznat po termalnim izvorima i dvorcu Janković." },
  { word: "GAREŠNICA", category: "Gradovi", level: 1, clue: "Grad u Bjelovarsko-bilogorskoj županiji.", explanation: "Grad u Bjelovarsko-bilogorskoj županiji." },
  { word: "ČAZMA", category: "Gradovi", level: 1, clue: "Grad poznat po crkvi svete Marije Magdalene.", explanation: "Grad poznat po crkvi svete Marije Magdalene." },
  { word: "ORAHOVICA", category: "Gradovi", level: 1, clue: "Slavonski grad podno Papuka.", explanation: "Slavonski grad podno Papuka." },
  { word: "VIR", category: "Zemljopis", level: 1, clue: "Otok u zadarskom arhipelagu.", explanation: "Otok u zadarskom arhipelagu." },
  { word: "DUGI OTOK", category: "Zemljopis", level: 1, clue: "Otok u zadarskom arhipelagu s Parkom prirode Telašćica.", explanation: "Otok u zadarskom arhipelagu s Parkom prirode Telašćica." },
  { word: "UGLJAN", category: "Zemljopis", level: 1, clue: "Otok nasuprot Zadru.", explanation: "Otok nasuprot Zadru." },
  { word: "PAŠMAN", category: "Zemljopis", level: 1, clue: "Otok povezan mostom s Ugljanom.", explanation: "Otok povezan mostom s Ugljanom." },
  { word: "SILBA", category: "Zemljopis", level: 1, clue: "Otok zadarskog arhipelaga bez automobila.", explanation: "Otok zadarskog arhipelaga bez automobila." },
  { word: "OŠLJAK", category: "Zemljopis", level: 1, clue: "Mali naseljeni otok kod Preka.", explanation: "Mali naseljeni otok kod Preka." },
  { word: "ŠOLTA", category: "Zemljopis", level: 1, clue: "Otok blizu Splita.", explanation: "Otok blizu Splita." },
  { word: "DRVENIK VELI", category: "Zemljopis", level: 1, clue: "Otok ispred trogirskog područja.", explanation: "Otok ispred trogirskog područja." },
  { word: "DRVENIK MALI", category: "Zemljopis", level: 1, clue: "Mali otok zapadno od Drvenika Velog.", explanation: "Mali otok zapadno od Drvenika Velog." },
  { word: "ŠIPAN", category: "Zemljopis", level: 1, clue: "Najveći Elafitski otok.", explanation: "Najveći Elafitski otok." },
  { word: "LOPUD", category: "Zemljopis", level: 1, clue: "Elafitski otok poznat po pješčanoj plaži Šunj.", explanation: "Elafitski otok poznat po pješčanoj plaži Šunj." },
  { word: "KOLOČEP", category: "Zemljopis", level: 1, clue: "Naseljeni Elafitski otok blizu Dubrovnika.", explanation: "Naseljeni Elafitski otok blizu Dubrovnika." },
  { word: "KAPRIJE", category: "Zemljopis", level: 1, clue: "Otok u šibenskom arhipelagu.", explanation: "Otok u šibenskom arhipelagu." },
  { word: "ŽIRJE", category: "Zemljopis", level: 1, clue: "Najudaljeniji naseljeni otok šibenskog arhipelaga.", explanation: "Najudaljeniji naseljeni otok šibenskog arhipelaga." },
  { word: "PRVIĆ", category: "Zemljopis", level: 1, clue: "Otok između Vodica i Šibenika.", explanation: "Otok između Vodica i Šibenika." },
  { word: "ZLARIN", category: "Zemljopis", level: 1, clue: "Otok poznat po tradiciji obrade koralja.", explanation: "Otok poznat po tradiciji obrade koralja." },
  { word: "KAKAN", category: "Zemljopis", level: 1, clue: "Nenaseljeni otok u šibenskom arhipelagu.", explanation: "Nenaseljeni otok u šibenskom arhipelagu." },
  { word: "KORNAT", category: "Zemljopis", level: 1, clue: "Najveći otok Nacionalnog parka Kornati.", explanation: "Najveći otok Nacionalnog parka Kornati." },
  { word: "PAŠMANSKI KANAL", category: "Zemljopis", level: 1, clue: "Morski prolaz između Pašmana i kopna.", explanation: "Morski prolaz između Pašmana i kopna." },
  { word: "LIMSKI KANAL", category: "Zemljopis", level: 1, clue: "Potopljena riječna dolina na zapadnoj obali Istre.", explanation: "Potopljena riječna dolina na zapadnoj obali Istre." },
  { word: "NOVIGRADSKO MORE", category: "Zemljopis", level: 1, clue: "Morski zaljev u sjevernoj Dalmaciji.", explanation: "Morski zaljev u sjevernoj Dalmaciji." },
  { word: "PROKLJANSKO JEZERO", category: "Zemljopis", level: 1, clue: "Jezero povezano s ušćem rijeke Krke.", explanation: "Jezero povezano s ušćem rijeke Krke." },
  { word: "VRANSKO JEZERO", category: "Zemljopis", level: 1, clue: "Najveće prirodno jezero u Hrvatskoj.", explanation: "Najveće prirodno jezero u Hrvatskoj." },
  { word: "BAĆINSKA JEZERA", category: "Zemljopis", level: 1, clue: "Skupina jezera u blizini Ploča.", explanation: "Skupina jezera u blizini Ploča." },
  { word: "MODRO JEZERO", category: "Zemljopis", level: 1, clue: "Krško jezero u Imotskom.", explanation: "Krško jezero u Imotskom." },
  { word: "CRVENO JEZERO", category: "Zemljopis", level: 1, clue: "Duboka krška jama ispunjena vodom kod Imotskog.", explanation: "Duboka krška jama ispunjena vodom kod Imotskog." },
  { word: "PAZINSKA JAMA", category: "Zemljopis", level: 1, clue: "Krški ponor u središnjoj Istri.", explanation: "Krški ponor u središnjoj Istri." },
  { word: "ĐURĐEVAČKI PIJESCI", category: "Priroda", level: 1, clue: "Pješčano područje u Podravini.", explanation: "Pješčano područje u Podravini." },
  { word: "LONJSKO POLJE", category: "Priroda", level: 1, clue: "Park prirode poznat po poplavnim pašnjacima i selima.", explanation: "Park prirode poznat po poplavnim pašnjacima i selima." },
  { word: "TELAŠĆICA", category: "Priroda", level: 1, clue: "Park prirode na Dugom otoku.", explanation: "Park prirode na Dugom otoku." },
  { word: "UČKA", category: "Priroda", level: 1, clue: "Planina iznad Kvarnera i Istre.", explanation: "Planina iznad Kvarnera i Istre." },
  { word: "MOSOR", category: "Priroda", level: 1, clue: "Planina u zaleđu Splita.", explanation: "Planina u zaleđu Splita." },
  { word: "KOZJAK", category: "Priroda", level: 1, clue: "Planina iznad Kaštela i Splita.", explanation: "Planina iznad Kaštela i Splita." },
  { word: "MEDVEDNICA", category: "Priroda", level: 1, clue: "Planina iznad Zagreba.", explanation: "Planina iznad Zagreba." },
  { word: "ŽUMBERAK", category: "Priroda", level: 1, clue: "Gorsko područje na granici Hrvatske i Slovenije.", explanation: "Gorsko područje na granici Hrvatske i Slovenije." },
  { word: "PSUNJ", category: "Priroda", level: 1, clue: "Planina u zapadnoj Slavoniji.", explanation: "Planina u zapadnoj Slavoniji." },
  { word: "BILOGORA", category: "Priroda", level: 1, clue: "Nisko gorje u sjevernoj Hrvatskoj.", explanation: "Nisko gorje u sjevernoj Hrvatskoj." },
  { word: "MOSLAVAČKA GORA", category: "Priroda", level: 1, clue: "Gorje između Moslavine i Bilogore.", explanation: "Gorje između Moslavine i Bilogore." },
  { word: "PETROVA GORA", category: "Priroda", level: 1, clue: "Šumovito gorje na Kordunu.", explanation: "Šumovito gorje na Kordunu." },
  { word: "KALNIK", category: "Priroda", level: 1, clue: "Gorje sjeveroistočno od Križevaca.", explanation: "Gorje sjeveroistočno od Križevaca." },
  { word: "IVANŠČICA", category: "Priroda", level: 1, clue: "Najviša planina Hrvatskog zagorja.", explanation: "Najviša planina Hrvatskog zagorja." },
  { word: "RAVNA GORA", category: "Priroda", level: 1, clue: "Planina u Hrvatskom zagorju.", explanation: "Planina u Hrvatskom zagorju." },
  { word: "SJEVERNI VELEBIT", category: "Priroda", level: 1, clue: "Nacionalni park u sjevernom dijelu Velebita.", explanation: "Nacionalni park u sjevernom dijelu Velebita." },
  { word: "BRIJUNI", category: "Priroda", level: 1, clue: "Nacionalni park otočja uz zapadnu obalu Istre.", explanation: "Nacionalni park otočja uz zapadnu obalu Istre." },
  { word: "PLITVIČKA JEZERA", category: "Priroda", level: 1, clue: "Nacionalni park poznat po jezerima i slapovima.", explanation: "Nacionalni park poznat po jezerima i slapovima." },
  { word: "KRAPINSKE TOPLICE", category: "Priroda", level: 1, clue: "Poznato termalno lječilište u Hrvatskom zagorju.", explanation: "Poznato termalno lječilište u Hrvatskom zagorju." },
  { word: "TOPUSKO", category: "Priroda", level: 1, clue: "Mjesto poznato po termalnim izvorima.", explanation: "Mjesto poznato po termalnim izvorima." },
  { word: "DOBRA", category: "Priroda", level: 1, clue: "Rijeka koja protječe kroz Ogulin i Karlovac.", explanation: "Rijeka koja protječe kroz Ogulin i Karlovac." },
  { word: "KORANA", category: "Priroda", level: 1, clue: "Rijeka koja istječe iz Plitvičkih jezera.", explanation: "Rijeka koja istječe iz Plitvičkih jezera." },
  { word: "MREŽNICA", category: "Priroda", level: 1, clue: "Rijeka poznata po slapovima i sedrenim barijerama.", explanation: "Rijeka poznata po slapovima i sedrenim barijerama." },
  { word: "UNA", category: "Priroda", level: 1, clue: "Rijeka uz hrvatsko-bosanskohercegovačku granicu.", explanation: "Rijeka uz hrvatsko-bosanskohercegovačku granicu." },
  { word: "BOSUT", category: "Priroda", level: 1, clue: "Rijeka koja protječe kroz Vinkovce.", explanation: "Rijeka koja protječe kroz Vinkovce." },
  { word: "ORLJAVA", category: "Priroda", level: 1, clue: "Rijeka u Požeškoj kotlini.", explanation: "Rijeka u Požeškoj kotlini." },
  { word: "ILOVA", category: "Priroda", level: 1, clue: "Rijeka u zapadnoj Slavoniji i Moslavini.", explanation: "Rijeka u zapadnoj Slavoniji i Moslavini." },
  { word: "LONJA", category: "Priroda", level: 1, clue: "Rijeka u središnjoj Hrvatskoj.", explanation: "Rijeka u središnjoj Hrvatskoj." },
  { word: "BEDNJA", category: "Priroda", level: 1, clue: "Rijeka u Hrvatskom zagorju.", explanation: "Rijeka u Hrvatskom zagorju." },
  { word: "KARAŠICA", category: "Priroda", level: 1, clue: "Rijeka u Slavoniji i Baranji.", explanation: "Rijeka u Slavoniji i Baranji." },
  { word: "MIRNA", category: "Priroda", level: 1, clue: "Najduža rijeka u Istri.", explanation: "Najduža rijeka u Istri." },
  { word: "RAŠA", category: "Priroda", level: 1, clue: "Rijeka na istočnoj obali Istre.", explanation: "Rijeka na istočnoj obali Istre." },
  { word: "RIČINA", category: "Priroda", level: 1, clue: "Kratka rijeka u Zadru.", explanation: "Kratka rijeka u Zadru." },
  { word: "JARUGA", category: "Priroda", level: 1, clue: "Naziv povezan s hidroenergetskim postrojenjima na Krki.", explanation: "Naziv povezan s hidroenergetskim postrojenjima na Krki." },
  { word: "DUNAV", category: "Priroda", level: 1, clue: "Velika europska rijeka koja protječe uz Vukovar i Ilok.", explanation: "Velika europska rijeka koja protječe uz Vukovar i Ilok." },
  { word: "SUTLA", category: "Priroda", level: 1, clue: "Rijeka koja dijelom čini granicu Hrvatske i Slovenije.", explanation: "Rijeka koja dijelom čini granicu Hrvatske i Slovenije." },
  { word: "JESENICE", category: "Povijest", level: 3, clue: "Ime više hrvatskih mjesta; nije povijesni događaj.", explanation: "Ime više hrvatskih mjesta; nije povijesni događaj." },
  { word: "DUBROVAČKA REPUBLIKA", category: "Povijest", level: 2, clue: "Povijesna pomorska republika sa sjedištem u Dubrovniku.", explanation: "Povijesna pomorska republika sa sjedištem u Dubrovniku." },
  { word: "PAVLINSKI RED", category: "Povijest", level: 2, clue: "Katolički red koji je imao važnu ulogu u hrvatskoj povijesti.", explanation: "Katolički red koji je imao važnu ulogu u hrvatskoj povijesti." },
  { word: "HABSBURŠKA MONARHIJA", category: "Povijest", level: 3, clue: "Vladarska zajednica kojoj su pripadale hrvatske zemlje.", explanation: "Vladarska zajednica kojoj su pripadale hrvatske zemlje." },
  { word: "ILIRSKI POKRET", category: "Povijest", level: 2, clue: "Kulturno-politički pokret hrvatskog narodnog preporoda.", explanation: "Kulturno-politički pokret hrvatskog narodnog preporoda." },
  { word: "HRVATSKI NARODNI PREPOROD", category: "Povijest", level: 2, clue: "Pokret za kulturno i jezično buđenje u 19. stoljeću.", explanation: "Pokret za kulturno i jezično buđenje u 19. stoljeću." },
  { word: "ZAVRŠETAK RATA", category: "Povijest", level: 3, clue: "Pojam koji označava završetak oružanog sukoba.", explanation: "Pojam koji označava završetak oružanog sukoba." },
  { word: "ZRINSKO-FRANKOPANSKA UROTA", category: "Povijest", level: 2, clue: "Povijesna urota hrvatskog i ugarskog plemstva u 17. stoljeću.", explanation: "Povijesna urota hrvatskog i ugarskog plemstva u 17. stoljeću." },
  { word: "SELJAČKA BUNA", category: "Povijest", level: 2, clue: "Pobuna seljaka 1573. godine pod vodstvom Matije Gupca.", explanation: "Pobuna seljaka 1573. godine pod vodstvom Matije Gupca." },
  { word: "MATIJA GUBEC", category: "Povijest", level: 3, clue: "Vođa Seljačke bune 1573. godine.", explanation: "Vođa Seljačke bune 1573. godine." },
  { word: "GVOZDANSKO", category: "Povijest", level: 2, clue: "Utvrda i mjesto poznato po obrani u 16. stoljeću.", explanation: "Utvrda i mjesto poznato po obrani u 16. stoljeću." },
  { word: "KRALJ PETAR SVAČIĆ", category: "Povijest", level: 2, clue: "Hrvatski kralj povezan s bitkom na Gvozdu.", explanation: "Hrvatski kralj povezan s bitkom na Gvozdu." },
  { word: "PODBORJE", category: "Povijest", level: 3, clue: "Povijesni naziv povezan s područjem Papuka.", explanation: "Povijesni naziv povezan s područjem Papuka." },
  { word: "KRALJ DMITAR ZVONIMIR", category: "Povijest", level: 2, clue: "Hrvatski kralj iz 11. stoljeća.", explanation: "Hrvatski kralj iz 11. stoljeća." },
  { word: "KNEZ DOMAGOJ", category: "Povijest", level: 2, clue: "Hrvatski knez iz 9. stoljeća poznat iz franačkih i mletačkih izvora.", explanation: "Hrvatski knez iz 9. stoljeća poznat iz franačkih i mletačkih izvora." },
  { word: "KNEZ TRPIMIR", category: "Povijest", level: 3, clue: "Hrvatski knez iz 9. stoljeća povezan s Trpimirovom darovnicom.", explanation: "Hrvatski knez iz 9. stoljeća povezan s Trpimirovom darovnicom." },
  { word: "TRPIMIROVA DAROVNICA", category: "Povijest", level: 2, clue: "Isprava iz 852. godine važna za hrvatsku povijest.", explanation: "Isprava iz 852. godine važna za hrvatsku povijest." },
  { word: "PISMO PAPE IVANA VIII.", category: "Povijest", level: 2, clue: "Pisma povezana s knezom Branimirom i priznanjem njegove vlasti.", explanation: "Pisma povezana s knezom Branimirom i priznanjem njegove vlasti." },
  { word: "KRUNIDBA TOMISLAVA", category: "Povijest", level: 3, clue: "Tradicionalno datirana u 925. godinu, uz povijesne rasprave o detaljima.", explanation: "Tradicionalno datirana u 925. godinu, uz povijesne rasprave o detaljima." },
  { word: "HRVATSKO-UGARSKA NAGODBA", category: "Povijest", level: 2, clue: "Politički sporazum iz 1868. godine.", explanation: "Politički sporazum iz 1868. godine." },
  { word: "SABOR U CETINU", category: "Povijest", level: 2, clue: "Sabor 1527. na kojem je izabran Ferdinand Habsburški za hrvatskog kralja.", explanation: "Sabor 1527. na kojem je izabran Ferdinand Habsburški za hrvatskog kralja." },
  { word: "KRALJEVSKI GRAD NIN", category: "Povijest", level: 3, clue: "Važno ranosrednjovjekovno središte hrvatskih vladara.", explanation: "Važno ranosrednjovjekovno središte hrvatskih vladara." },
  { word: "SOLINSKI SABOR", category: "Povijest", level: 2, clue: "Crkveni sabori održani u Solinu u 10. stoljeću.", explanation: "Crkveni sabori održani u Solinu u 10. stoljeću." },
  { word: "BAŠKA", category: "Povijest", level: 2, clue: "Mjesto na Krku povezano s Bašćanskom pločom.", explanation: "Mjesto na Krku povezano s Bašćanskom pločom." },
  { word: "KOSINJ", category: "Povijest", level: 3, clue: "Ličko mjesto povezano s poviješću tiskarstva i glagoljice.", explanation: "Ličko mjesto povezano s poviješću tiskarstva i glagoljice." },
  { word: "SENJSKA GLAGOLJSKA TISKARA", category: "Povijest", level: 2, clue: "Tiskara koja je djelovala u Senju krajem 15. i početkom 16. stoljeća.", explanation: "Tiskara koja je djelovala u Senju krajem 15. i početkom 16. stoljeća." },
  { word: "MISAL PO ZAKONU RIMSKOGA DVORA", category: "Povijest", level: 2, clue: "Prva hrvatska tiskana knjiga iz 1483. godine.", explanation: "Prva hrvatska tiskana knjiga iz 1483. godine." },
  { word: "HRVOJEV MISAL", category: "Povijest", level: 3, clue: "Ilustrirani glagoljski misal iz početka 15. stoljeća.", explanation: "Ilustrirani glagoljski misal iz početka 15. stoljeća." },
  { word: "VINODOLSKI ZAKONIK", category: "Povijest", level: 2, clue: "Pravni spomenik iz 1288. godine; već postoji sličan naziv.", explanation: "Pravni spomenik iz 1288. godine; već postoji sličan naziv." },
  { word: "ZAGREBAČKA ZLATNA BULA", category: "Povijest", level: 2, clue: "Povelja Bele IV. iz 1242. godine kojom Zagreb dobiva povlastice slobodnog kraljevskog grada.", explanation: "Povelja Bele IV. iz 1242. godine kojom Zagreb dobiva povlastice slobodnog kraljevskog grada." },
  { word: "KRAPINSKI PRAČOVJEK", category: "Povijest", level: 3, clue: "Naziv za neandertalske fosilne ostatke pronađene na Hušnjakovu brdu.", explanation: "Naziv za neandertalske fosilne ostatke pronađene na Hušnjakovu brdu." },
  { word: "HUŠNJAKOVO", category: "Povijest", level: 2, clue: "Nalazište neandertalaca u Krapini.", explanation: "Nalazište neandertalaca u Krapini." },
  { word: "VUKOVARSKA OBRANA", category: "Povijest", level: 2, clue: "Obrana grada tijekom opsade 1991. godine.", explanation: "Obrana grada tijekom opsade 1991. godine." },
  { word: "BITKA ZA VUKOVAR", category: "Povijest", level: 3, clue: "Opsada i borbe za Vukovar 1991. godine.", explanation: "Opsada i borbe za Vukovar 1991. godine." },
  { word: "BITKA ZA VUKOVARSKI VODOTORANJ", category: "Povijest", level: 2, clue: "Simbolična obrana vodotornja tijekom Domovinskog rata.", explanation: "Simbolična obrana vodotornja tijekom Domovinskog rata." },
  { word: "MASLENICA", category: "Povijest", level: 2, clue: "Vojno-redarstvena operacija iz siječnja 1993. godine.", explanation: "Vojno-redarstvena operacija iz siječnja 1993. godine." },
  { word: "MEDAČKI DŽEP", category: "Povijest", level: 3, clue: "Vojno-redarstvena operacija iz rujna 1993. godine.", explanation: "Vojno-redarstvena operacija iz rujna 1993. godine." },
  { word: "BLJESAK", category: "Povijest", level: 2, clue: "Vojno-redarstvena operacija iz svibnja 1995. godine.", explanation: "Vojno-redarstvena operacija iz svibnja 1995. godine." },
  { word: "OSLOBODILAČKE OPERACIJE", category: "Povijest", level: 2, clue: "Naziv za vojne operacije kojima je vraćan okupirani teritorij.", explanation: "Naziv za vojne operacije kojima je vraćan okupirani teritorij." },
  { word: "ZBOR NARODNE GARDE", category: "Povijest", level: 3, clue: "Prva profesionalna oružana formacija Republike Hrvatske 1991. godine.", explanation: "Prva profesionalna oružana formacija Republike Hrvatske 1991. godine." },
  { word: "HRVATSKA POLICIJA", category: "Povijest", level: 2, clue: "Policijske snage koje su sudjelovale u obrani Hrvatske.", explanation: "Policijske snage koje su sudjelovale u obrani Hrvatske." },
  { word: "BRANITELJI", category: "Povijest", level: 2, clue: "Sudionici obrane Republike Hrvatske u Domovinskom ratu.", explanation: "Sudionici obrane Republike Hrvatske u Domovinskom ratu." },
  { word: "SPOMEN-PODRUČJE", category: "Povijest", level: 3, clue: "Prostor uređen u znak sjećanja na povijesni događaj ili žrtve.", explanation: "Prostor uređen u znak sjećanja na povijesni događaj ili žrtve." },
  { word: "MEMORIJALNI CENTAR", category: "Povijest", level: 2, clue: "Ustanova koja čuva dokumentaciju i sjećanje na događaje.", explanation: "Ustanova koja čuva dokumentaciju i sjećanje na događaje." },
  { word: "DAN NEOVISNOSTI", category: "Povijest", level: 2, clue: "Hrvatski državni blagdan koji se obilježava 8. listopada.", explanation: "Hrvatski državni blagdan koji se obilježava 8. listopada." },
  { word: "DAN POBJEDE", category: "Povijest", level: 3, clue: "Naziv povezan s obilježavanjem završetka operacije Oluja.", explanation: "Naziv povezan s obilježavanjem završetka operacije Oluja." },
  { word: "DAN HRVATSKIH BRANITELJA", category: "Povijest", level: 2, clue: "Obilježava se 5. kolovoza.", explanation: "Obilježava se 5. kolovoza." },
  { word: "DAN SJEĆANJA NA ŽRTVU VUKOVARA", category: "Povijest", level: 2, clue: "Obilježava se 18. studenoga.", explanation: "Obilježava se 18. studenoga." },
  { word: "DAN SJEĆANJA NA ŠKABRNJU", category: "Povijest", level: 3, clue: "Komemoracija žrtava stradanja u Škabrnji.", explanation: "Komemoracija žrtava stradanja u Škabrnji." },
  { word: "DAN EUROPE", category: "Povijest", level: 2, clue: "Obilježava se 9. svibnja.", explanation: "Obilježava se 9. svibnja." },
  { word: "KULTURA SJEĆANJA", category: "Povijest", level: 2, clue: "Način na koji zajednica čuva i prenosi sjećanje na prošlost.", explanation: "Način na koji zajednica čuva i prenosi sjećanje na prošlost." },
  { word: "KONCENTRACIJSKI LOGOR", category: "Povijest", level: 3, clue: "Mjesto sustavnog zatočenja ljudi; pojam zahtijeva povijesni kontekst.", explanation: "Mjesto sustavnog zatočenja ljudi; pojam zahtijeva povijesni kontekst." },
  { word: "JASENOVAC", category: "Povijest", level: 2, clue: "Mjesto logora i spomen-područja iz Drugoga svjetskog rata.", explanation: "Mjesto logora i spomen-područja iz Drugoga svjetskog rata." },
  { word: "STARA GRADIŠKA", category: "Povijest", level: 2, clue: "Mjesto povijesnog zatvora i logora.", explanation: "Mjesto povijesnog zatvora i logora." },
  { word: "BLEIBURG", category: "Povijest", level: 3, clue: "Mjesto povezano s poratnim događajima u svibnju 1945. godine.", explanation: "Mjesto povezano s poratnim događajima u svibnju 1945. godine." },
  { word: "KRIŽNI PUT", category: "Povijest", level: 2, clue: "Naziv za poratne marševe i stradanja zarobljenika 1945. godine.", explanation: "Naziv za poratne marševe i stradanja zarobljenika 1945. godine." },
  { word: "TEZNO", category: "Povijest", level: 2, clue: "Stratište i masovna grobnica iz poratnog razdoblja u Sloveniji.", explanation: "Stratište i masovna grobnica iz poratnog razdoblja u Sloveniji." },
  { word: "Hrvatski memorijalni dokumentacijski centar", category: "Povijest", level: 3, clue: "Ustanova koja prikuplja i obrađuje dokumentaciju Domovinskog rata.", explanation: "Ustanova koja prikuplja i obrađuje dokumentaciju Domovinskog rata." },
  { word: "MIRNA REINTEGRACIJA", category: "Povijest", level: 2, clue: "Proces mirnog povratka hrvatskog Podunavlja u ustavno-pravni poredak Hrvatske.", explanation: "Proces mirnog povratka hrvatskog Podunavlja u ustavno-pravni poredak Hrvatske." },
  { word: "ERDUTSKI SPORAZUM", category: "Povijest", level: 2, clue: "Sporazum iz 1995. godine koji je omogućio mirnu reintegraciju.", explanation: "Sporazum iz 1995. godine koji je omogućio mirnu reintegraciju." },
  { word: "KULTURNA BAŠTINA", category: "Baština", level: 2, clue: "Naslijeđena materijalna i nematerijalna dobra zajednice.", explanation: "Naslijeđena materijalna i nematerijalna dobra zajednice." },
  { word: "NEMATERIJALNA BAŠTINA", category: "Baština", level: 1, clue: "Znanja, običaji, izvedbe i vještine koje zajednice prenose.", explanation: "Znanja, običaji, izvedbe i vještine koje zajednice prenose." },
  { word: "MATERIJALNA BAŠTINA", category: "Baština", level: 1, clue: "Građevine, predmeti i lokaliteti povijesne ili kulturne vrijednosti.", explanation: "Građevine, predmeti i lokaliteti povijesne ili kulturne vrijednosti." },
  { word: "ETNOGRAFSKI MUZEJ", category: "Baština", level: 2, clue: "Muzej koji čuva predmete i znanja o tradicijskoj kulturi.", explanation: "Muzej koji čuva predmete i znanja o tradicijskoj kulturi." },
  { word: "MUZEJ HRVATSKIH ARHEOLOŠKIH SPOMENIKA", category: "Baština", level: 1, clue: "Muzej u Splitu posvećen ranosrednjovjekovnoj baštini.", explanation: "Muzej u Splitu posvećen ranosrednjovjekovnoj baštini." },
  { word: "ARHEOLOŠKI MUZEJ", category: "Baština", level: 1, clue: "Ustanova koja čuva i proučava arheološke nalaze.", explanation: "Ustanova koja čuva i proučava arheološke nalaze." },
  { word: "MIMARA", category: "Baština", level: 2, clue: "Zagrebački muzej poznat po umjetničkim zbirkama.", explanation: "Zagrebački muzej poznat po umjetničkim zbirkama." },
  { word: "MUZEJ SUVREMENE UMJETNOSTI", category: "Baština", level: 1, clue: "Muzej u Zagrebu posvećen suvremenoj umjetnosti.", explanation: "Muzej u Zagrebu posvećen suvremenoj umjetnosti." },
  { word: "MUZEJ GRADA ZAGREBA", category: "Baština", level: 1, clue: "Muzej koji prikazuje povijest Zagreba.", explanation: "Muzej koji prikazuje povijest Zagreba." },
  { word: "ETNOGRAFSKI MUZEJ ZAGREB", category: "Baština", level: 2, clue: "Muzej tradicijske kulture u Zagrebu.", explanation: "Muzej tradicijske kulture u Zagrebu." },
  { word: "MUZEJ SLAVONIJE", category: "Baština", level: 1, clue: "Muzej u Osijeku s povijesnim i kulturnim zbirkama.", explanation: "Muzej u Osijeku s povijesnim i kulturnim zbirkama." },
  { word: "MUZEJ SINJSKE ALKE", category: "Baština", level: 1, clue: "Muzej posvećen povijesti i tradiciji Sinjske alke.", explanation: "Muzej posvećen povijesti i tradiciji Sinjske alke." },
  { word: "MUZEJ NINSKIH STARINA", category: "Baština", level: 2, clue: "Muzejska zbirka povezana s arheološkom baštinom Nina.", explanation: "Muzejska zbirka povezana s arheološkom baštinom Nina." },
  { word: "DIOKLECIJANOVA PALAČA", category: "Baština", level: 1, clue: "Palača rimskog cara u Splitu, dio UNESCO-ove baštine.", explanation: "Palača rimskog cara u Splitu, dio UNESCO-ove baštine." },
  { word: "PERISTIL", category: "Baština", level: 1, clue: "Središnji trg Dioklecijanove palače u Splitu.", explanation: "Središnji trg Dioklecijanove palače u Splitu." },
  { word: "ZLATNA VRATA", category: "Baština", level: 2, clue: "Monumentalni ulaz u Dioklecijanovu palaču.", explanation: "Monumentalni ulaz u Dioklecijanovu palaču." },
  { word: "SREBRNA VRATA", category: "Baština", level: 1, clue: "Jedan od povijesnih ulaza u Dioklecijanovu palaču.", explanation: "Jedan od povijesnih ulaza u Dioklecijanovu palaču." },
  { word: "JUPITEROV HRAM", category: "Baština", level: 1, clue: "Antički hram u Dioklecijanovoj palači.", explanation: "Antički hram u Dioklecijanovoj palači." },
  { word: "EUPRAZIJEVA BAZILIKA", category: "Baština", level: 2, clue: "Ranosrednjovjekovni kompleks u Poreču pod zaštitom UNESCO-a.", explanation: "Ranosrednjovjekovni kompleks u Poreču pod zaštitom UNESCO-a." },
  { word: "SVETI DONAT", category: "Baština", level: 1, clue: "Predromanička crkva u Zadru.", explanation: "Predromanička crkva u Zadru." },
  { word: "KATEDRALA SVETE STOŠIJE", category: "Baština", level: 1, clue: "Zadarska katedrala posvećena svetoj Anastaziji.", explanation: "Zadarska katedrala posvećena svetoj Anastaziji." },
  { word: "KATEDRALA SVETOG DUJMA", category: "Baština", level: 2, clue: "Splitska katedrala smještena u nekadašnjem Dioklecijanovu mauzoleju.", explanation: "Splitska katedrala smještena u nekadašnjem Dioklecijanovu mauzoleju." },
  { word: "KATEDRALA SVETOG LOVRE", category: "Baština", level: 1, clue: "Katedrala u Trogiru poznata po Radovanovu portalu.", explanation: "Katedrala u Trogiru poznata po Radovanovu portalu." },
  { word: "RADOVANOV PORTAL", category: "Baština", level: 1, clue: "Romanički portal trogirske katedrale iz 13. stoljeća.", explanation: "Romanički portal trogirske katedrale iz 13. stoljeća." },
  { word: "ŠIBENSKA KATEDRALA", category: "Baština", level: 2, clue: "Katedrala sv. Jakova; UNESCO-ova svjetska baština.", explanation: "Katedrala sv. Jakova; UNESCO-ova svjetska baština." },
  { word: "STARI GRAD DUBROVNIK", category: "Baština", level: 1, clue: "Povijesna jezgra Dubrovnika pod zaštitom UNESCO-a.", explanation: "Povijesna jezgra Dubrovnika pod zaštitom UNESCO-a." },
  { word: "STARI GRAD TROGIR", category: "Baština", level: 1, clue: "Povijesna jezgra Trogira pod zaštitom UNESCO-a.", explanation: "Povijesna jezgra Trogira pod zaštitom UNESCO-a." },
  { word: "STAROGRADSKO POLJE", category: "Baština", level: 2, clue: "Kulturni krajolik na Hvaru pod zaštitom UNESCO-a.", explanation: "Kulturni krajolik na Hvaru pod zaštitom UNESCO-a." },
  { word: "STEĆCI", category: "Baština", level: 1, clue: "Srednjovjekovni nadgrobni spomenici rasprostranjeni u više zemalja.", explanation: "Srednjovjekovni nadgrobni spomenici rasprostranjeni u više zemalja." },
  { word: "SREDNJOVJEKOVNI GRAD", category: "Baština", level: 1, clue: "Utvrđeno naselje ili sjedište vlastelinstva iz srednjeg vijeka.", explanation: "Utvrđeno naselje ili sjedište vlastelinstva iz srednjeg vijeka." },
  { word: "DVORAC PEJAČEVIĆ", category: "Baština", level: 2, clue: "Povijesni dvorac u Našicama.", explanation: "Povijesni dvorac u Našicama." },
  { word: "DVORAC TRAKOŠĆAN", category: "Baština", level: 1, clue: "Dvorac u Hrvatskom zagorju s jezerom i perivojem.", explanation: "Dvorac u Hrvatskom zagorju s jezerom i perivojem." },
  { word: "DVORAC VELIKI TABOR", category: "Baština", level: 1, clue: "Utvrđeni dvorac u Hrvatskom zagorju.", explanation: "Utvrđeni dvorac u Hrvatskom zagorju." },
  { word: "DVORAC ORŠIĆ", category: "Baština", level: 2, clue: "Dvorac u Gornjoj Stubici u kojem se nalazi Muzej seljačkih buna.", explanation: "Dvorac u Gornjoj Stubici u kojem se nalazi Muzej seljačkih buna." },
  { word: "DVORAC LUŽNICA", category: "Baština", level: 1, clue: "Barokni dvorac u blizini Zaprešića.", explanation: "Barokni dvorac u blizini Zaprešića." },
  { word: "DVORAC OZALJ", category: "Baština", level: 1, clue: "Dvorac iznad Kupe povezan sa Zrinskima i Frankopanima.", explanation: "Dvorac iznad Kupe povezan sa Zrinskima i Frankopanima." },
  { word: "STARI GRAD OZALJ", category: "Baština", level: 2, clue: "Povijesna utvrda iznad rijeke Kupe.", explanation: "Povijesna utvrda iznad rijeke Kupe." },
  { word: "UTVRDA KLIS", category: "Baština", level: 1, clue: "Povijesna tvrđava iznad Splita.", explanation: "Povijesna tvrđava iznad Splita." },
  { word: "TVRĐAVA SVETOG NIKOLE", category: "Baština", level: 1, clue: "Pomorska utvrda na ulazu u kanal sv. Ante kod Šibenika.", explanation: "Pomorska utvrda na ulazu u kanal sv. Ante kod Šibenika." },
  { word: "TVRĐAVA BARONE", category: "Baština", level: 2, clue: "Šibenska tvrđava iznad grada.", explanation: "Šibenska tvrđava iznad grada." },
  { word: "TVRĐAVA SVETOG MIHOVILA", category: "Baština", level: 1, clue: "Povijesna tvrđava u Šibeniku.", explanation: "Povijesna tvrđava u Šibeniku." },
  { word: "TVRĐAVA LOVRIJENAC", category: "Baština", level: 1, clue: "Tvrđava na stijeni izvan dubrovačkih zidina.", explanation: "Tvrđava na stijeni izvan dubrovačkih zidina." },
  { word: "TVRĐAVA MINČETA", category: "Baština", level: 2, clue: "Dubrovačka tvrđava i dio gradskih zidina.", explanation: "Dubrovačka tvrđava i dio gradskih zidina." },
  { word: "TVRĐAVA BOKAR", category: "Baština", level: 1, clue: "Dubrovačka utvrda koja štiti zapadni prilaz gradu.", explanation: "Dubrovačka utvrda koja štiti zapadni prilaz gradu." },
  { word: "TVRĐAVA NEHAJ", category: "Baština", level: 1, clue: "Senjska tvrđava iz 16. stoljeća.", explanation: "Senjska tvrđava iz 16. stoljeća." },
  { word: "TVRĐAVA SISAK", category: "Baština", level: 2, clue: "Renesansna utvrda na ušću Kupe u Savu.", explanation: "Renesansna utvrda na ušću Kupe u Savu." },
  { word: "TVRĐAVA BROD", category: "Baština", level: 1, clue: "Barokna tvrđava u Slavonskom Brodu.", explanation: "Barokna tvrđava u Slavonskom Brodu." },
  { word: "TVRĐAVA OSIJEK", category: "Baština", level: 1, clue: "Povijesna osječka Tvrđa.", explanation: "Povijesna osječka Tvrđa." },
  { word: "TVRĐAVA KNIN", category: "Baština", level: 2, clue: "Velika utvrda iznad grada Knina.", explanation: "Velika utvrda iznad grada Knina." },
  { word: "TVRĐAVA MEDVEDGRAD", category: "Baština", level: 1, clue: "Srednjovjekovna utvrda na Medvednici.", explanation: "Srednjovjekovna utvrda na Medvednici." },
  { word: "TVRĐAVA GVOZDANSKO", category: "Baština", level: 1, clue: "Povijesna utvrda na Banovini.", explanation: "Povijesna utvrda na Banovini." },
  { word: "KAMENI MOST", category: "Baština", level: 2, clue: "Povijesni most građen od kamena.", explanation: "Povijesni most građen od kamena." },
  { word: "STARI MOST", category: "Baština", level: 1, clue: "Naziv povijesnog mosta u više hrvatskih mjesta.", explanation: "Naziv povijesnog mosta u više hrvatskih mjesta." },
  { word: "MOST DR. FRANJE TUĐMANA", category: "Baština", level: 1, clue: "Most koji povezuje dijelove Dubrovnika.", explanation: "Most koji povezuje dijelove Dubrovnika." },
  { word: "MOST MLADOSTI", category: "Baština", level: 2, clue: "Most preko Save u Zagrebu.", explanation: "Most preko Save u Zagrebu." },
  { word: "MOST SLOBODE", category: "Baština", level: 1, clue: "Prometni most preko Save u Zagrebu.", explanation: "Prometni most preko Save u Zagrebu." },
  { word: "MURSKO SREDIŠĆE", category: "Gradovi", level: 1, clue: "Grad u Međimurju na rijeci Muri.", explanation: "Grad u Međimurju na rijeci Muri." },
  { word: "PRELOG", category: "Gradovi", level: 1, clue: "Grad u Međimurju blizu akumulacije HE Dubrava.", explanation: "Grad u Međimurju blizu akumulacije HE Dubrava." },
  { word: "LEGRAD", category: "Zemljopis", level: 1, clue: "Naselje na ušću Mure u Dravu.", explanation: "Naselje na ušću Mure u Dravu." },
  { word: "DONJA DUBRAVA", category: "Zemljopis", level: 1, clue: "Međimursko naselje uz Dravu.", explanation: "Međimursko naselje uz Dravu." },
  { word: "KOTORIBA", category: "Zemljopis", level: 1, clue: "Naselje na istoku Međimurja uz Muru.", explanation: "Naselje na istoku Međimurja uz Muru." },
  { word: "VARAŽDINSKE TOPLICE", category: "Gradovi", level: 1, clue: "Grad poznat po termalnim izvorima i arheološkim nalazima.", explanation: "Grad poznat po termalnim izvorima i arheološkim nalazima." },
  { word: "LUDBREG", category: "Gradovi", level: 1, clue: "Podravski grad povezan s predajom o središtu svijeta.", explanation: "Podravski grad povezan s predajom o središtu svijeta." },
  { word: "NOVI MAROF", category: "Gradovi", level: 1, clue: "Grad u Varaždinskoj županiji.", explanation: "Grad u Varaždinskoj županiji." },
  { word: "LEPOGLAVA", category: "Gradovi", level: 1, clue: "Grad poznat po čipki i nekadašnjem pavlinskom samostanu.", explanation: "Grad poznat po čipki i nekadašnjem pavlinskom samostanu." },
  { word: "IVANEC", category: "Gradovi", level: 1, clue: "Grad podno Ivanščice.", explanation: "Grad podno Ivanščice." },
  { word: "KUMROVEC", category: "Gradovi", level: 1, clue: "Zagorsko mjesto s Muzejom na otvorenom Staro selo.", explanation: "Zagorsko mjesto s Muzejom na otvorenom Staro selo." },
  { word: "GORNJA STUBICA", category: "Gradovi", level: 1, clue: "Mjesto Seljačke bune i spomenika Matiji Gupcu.", explanation: "Mjesto Seljačke bune i spomenika Matiji Gupcu." },
  { word: "DONJA STUBICA", category: "Gradovi", level: 1, clue: "Grad u Hrvatskom zagorju.", explanation: "Grad u Hrvatskom zagorju." },
  { word: "DESINIĆ", category: "Gradovi", level: 1, clue: "Mjesto u Hrvatskom zagorju povezano s Velikim Taborom.", explanation: "Mjesto u Hrvatskom zagorju povezano s Velikim Taborom." },
  { word: "PREGRADA", category: "Gradovi", level: 1, clue: "Grad u Hrvatskom zagorju.", explanation: "Grad u Hrvatskom zagorju." },
  { word: "KUTINA", category: "Gradovi", level: 1, clue: "Grad u Moslavini.", explanation: "Grad u Moslavini." },
  { word: "POPOVAČA", category: "Gradovi", level: 1, clue: "Grad u Moslavini.", explanation: "Grad u Moslavini." },
  { word: "SIRAČ", category: "Zemljopis", level: 1, clue: "Naselje u zapadnoj Slavoniji.", explanation: "Naselje u zapadnoj Slavoniji." },
  { word: "LIPIK", category: "Gradovi", level: 1, clue: "Grad poznat po lječilištu i ergeli lipicanaca.", explanation: "Grad poznat po lječilištu i ergeli lipicanaca." },
  { word: "KUTJEVO", category: "Gradovi", level: 1, clue: "Slavonski grad poznat po vinogradarstvu.", explanation: "Slavonski grad poznat po vinogradarstvu." },
  { word: "PLETERNICA", category: "Gradovi", level: 1, clue: "Grad u Požeško-slavonskoj županiji.", explanation: "Grad u Požeško-slavonskoj županiji." },
  { word: "VETOVO", category: "Zemljopis", level: 1, clue: "Naselje u Požeškoj kotlini.", explanation: "Naselje u Požeškoj kotlini." },
  { word: "SLAVONSKI BROD", category: "Gradovi", level: 1, clue: "Grad na Savi s baroknom tvrđavom.", explanation: "Grad na Savi s baroknom tvrđavom." },
  { word: "ŽUPANJA", category: "Gradovi", level: 1, clue: "Grad u istočnoj Slavoniji poznat po tradiciji šokaca.", explanation: "Grad u istočnoj Slavoniji poznat po tradiciji šokaca." },
  { word: "OTOK", category: "Gradovi", level: 1, clue: "Grad u Vukovarsko-srijemskoj županiji.", explanation: "Grad u Vukovarsko-srijemskoj županiji." },
  { word: "GUNJA", category: "Zemljopis", level: 1, clue: "Naselje uz Savu u županjskoj Posavini.", explanation: "Naselje uz Savu u županjskoj Posavini." },
  { word: "DRENOVCI", category: "Zemljopis", level: 1, clue: "Naselje u Cvelferiji.", explanation: "Naselje u Cvelferiji." },
  { word: "BABINA GREDA", category: "Zemljopis", level: 1, clue: "Selo u županjskoj Posavini.", explanation: "Selo u županjskoj Posavini." },
  { word: "TOVARNIK", category: "Zemljopis", level: 1, clue: "Istočnoslavonsko mjesto rodno mjesto Antuna Gustava Matoša.", explanation: "Istočnoslavonsko mjesto rodno mjesto Antuna Gustava Matoša." },
  { word: "LOVAS", category: "Zemljopis", level: 1, clue: "Naselje u istočnoj Slavoniji stradalo u Domovinskom ratu.", explanation: "Naselje u istočnoj Slavoniji stradalo u Domovinskom ratu." },
];

const normalize = (value) => String(value ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleUpperCase("hr").replace(/[^A-Z]/g, "");
const pointsFor = (level) => level === 1 ? 10 : level === 2 ? 20 : 30;

function shuffle(items, seed = null) {
  const copy = [...items];
  let state = seed ?? Math.floor(Math.random() * 2147483647);
  const random = () => {
    state = (state * 48271) % 2147483647;
    return (state - 1) / 2147483646;
  };
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function scramble(word) {
  const letters = word.replace(/\s/g, "").split("");
  let mixed = shuffle(letters);
  if (mixed.join("") === letters.join("") && mixed.length > 1) mixed = [...mixed.slice(1), mixed[0]];
  return mixed.map((letter, index) => ({ id: index, letter }));
}

function dailySeed() {
  const date = new Date();
  const stamp = `${date.getFullYear()}${date.getMonth() + 1}${date.getDate()}`;
  return Number(stamp) || 1;
}

function createRound(mode) {
  const seed = mode === "daily" ? dailySeed() : null;
  let easy, medium, hard;
  if (mode === "daily") {
    easy = shuffle(WORDS.filter((item) => item.level === 1), seed).slice(0, 2);
    medium = shuffle(WORDS.filter((item) => item.level === 2), seed + 17).slice(0, 2);
    hard = shuffle(WORDS.filter((item) => item.level === 3), seed + 31).slice(0, 1);
  } else {
    let history = [];
    try { history = JSON.parse(window.localStorage.getItem("patriasoul_rijeci_word_history") || "[]"); } catch {}
    const takeFresh = (pool, count) => {
      const fresh = pool.filter((item) => !history.includes(item.word));
      const recent = new Set(history.slice(-Math.max(1, Math.floor(pool.length * 0.45))));
      const fallback = pool.filter((item) => !recent.has(item.word));
      const chosen = shuffle(fresh.length >= count ? fresh : fallback.length >= count ? fallback : pool).slice(0, count);
      history.push(...chosen.map((item) => item.word));
      return chosen;
    };
    easy = takeFresh(WORDS.filter((item) => item.level === 1), 3);
    medium = takeFresh(WORDS.filter((item) => item.level === 2), 4);
    hard = takeFresh(WORDS.filter((item) => item.level === 3), 3);
    try { window.localStorage.setItem("patriasoul_rijeci_word_history", JSON.stringify(history.slice(-WORDS.length))); } catch {}
  }
  return [...easy, ...medium, ...hard].map((item, index) => ({ ...item, letters: scramble(item.word), roundId: `${item.word}-${index}` }));
}

export default function RijeciDomovine({ onBack, playerName = "" }) {
  const [mode, setMode] = useState("solo");
  const [playerOne, setPlayerOne] = useState(playerName || "Igrač 1");
  const [playerTwo, setPlayerTwo] = useState("Igrač 2");
  const [round, setRound] = useState([]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState([]);
  const [scores, setScores] = useState([0, 0]);
  const [activePlayer, setActivePlayer] = useState(0);
  const [streak, setStreak] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [checked, setChecked] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [finished, setFinished] = useState(false);
  const [started, setStarted] = useState(false);
  const [bestScore, setBestScore] = useState(() => {
    try { return Number(window.localStorage.getItem("patriasoul_rijeci_best") || 0); } catch { return 0; }
  });

  const current = round[index];
  const total = round.length;
  const answerFromTiles = selected.map((tile) => current?.letters.find((letter) => letter.id === tile)?.letter || "").join("");
  const answer = answerFromTiles;
  const progress = total ? ((index + (checked ? 1 : 0)) / total) * 100 : 0;
  const playerNames = useMemo(() => [playerOne.trim() || "Igrač 1", playerTwo.trim() || "Igrač 2"], [playerOne, playerTwo]);
  const bestLabel = mode === "daily" ? "Najbolji dnevni rezultat" : "Osobni rekord";

  const start = () => {
    setRound(createRound(mode));
    setIndex(0);
    setSelected([]);
    setScores([0, 0]);
    setActivePlayer(0);
    setStreak(0);
    setFeedback("");
    setChecked(false);
    setRevealed(false);
    setFinished(false);
    setStarted(true);
  };

  const clearAnswer = () => { setSelected([]); setFeedback(""); };
  const chooseLetter = (id) => {
    if (checked || selected.includes(id)) return;
    setSelected((previous) => [...previous, id]);
    setFeedback("");
  };
  const removeLetter = (id) => {
    if (checked) return;
    setSelected((previous) => previous.filter((value) => value !== id));
    setFeedback("");
  };

  const checkAnswer = () => {
    if (!current || checked || !answer.trim()) return;
    const correct = normalize(answer) === normalize(current.word);
    if (correct) {
      const earned = Math.max(5, pointsFor(current.level) - (revealed ? 5 : 0) + (streak >= 2 ? 5 : 0));
      setScores((previous) => previous.map((score, player) => player === activePlayer ? score + earned : score));
      setStreak((value) => value + 1);
      setFeedback(`Točno! Osvojeno ${earned} bodova.`);
      setChecked(true);
    } else {
      setStreak(0);
      setFeedback("Nije još točno. Pokušaj ponovno ili iskoristi pomoć.");
    }
  };

  const next = () => {
    if (index + 1 >= total) {
      setFinished(true);
      setStarted(false);
      if (mode !== "duel") {
        const finalScore = scores[0];
        if (finalScore > bestScore) {
          setBestScore(finalScore);
          try { window.localStorage.setItem("patriasoul_rijeci_best", String(finalScore)); } catch {}
        }
      }
      return;
    }
    setIndex((value) => value + 1);
    setSelected([]);
    setTypedAnswer("");
    setFeedback("");
    setChecked(false);
    setRevealed(false);
    if (mode === "duel") setActivePlayer((value) => value === 0 ? 1 : 0);
  };

  const revealLetter = () => {
    if (!current || revealed || checked) return;
    setRevealed(true);
    setFeedback(`Pomoć: riječ počinje slovom ${current.word.replace(/\s/g, "")[0]}. Točan odgovor vrijedi 5 bodova manje.`);
  };

  const winner = scores[0] === scores[1] ? "Neriješeno" : scores[0] > scores[1] ? playerNames[0] : playerNames[1];
  const modeDescription = mode === "daily" ? "Isti dnevni izazov za sve igrače. Pokušaj ostvariti svoj najbolji rezultat." : mode === "duel" ? "Dva igrača izmjenjuju se u rješavanju iste serije pojmova." : "Igraj svojim tempom, otkrivaj pojmove i podiži osobni rekord.";

  return (
    <main className="rd-page mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <button onClick={onBack} className="rd-back">Natrag na kviz</button>
        <span className="rd-brand">PATRIA SOUL <span>/</span> ČUVARI NASLJEĐA</span>
      </div>

      <section className="rd-shell">
        <header className="rd-hero">
          <div className="rd-hero-glow" />
          <img src={`${import.meta.env.BASE_URL}images/Riječi domovine_ Hrvatska baština.png`} alt="Riječi domovine – Hrvatska baština" className="rd-hero-art" fetchPriority="high" decoding="async" />
          <div className="relative z-10">
            <div className="rd-kicker"><span /> IGRA ZNANJA I VJEŠTINE</div>
            <h1>Riječi <em>domovine</em></h1>
            <p>Složi slova. Otkrij značenje. Sačuvaj znanje.</p>
            <div className="rd-hero-meta"><span>HRVATSKI JEZIK</span><i /> <span>POVIJEST</span><i /> <span>VJERA</span><i /> <span>BAŠTINA</span></div>
          </div>
          <div className="rd-hero-mark" aria-hidden="true">RD</div>
        </header>

        {!started && !finished && (
          <div className="rd-content">
            <div className="rd-intro-row">
              <div><div className="rd-overline">TVOJ SLJEDEĆI IZAZOV</div><h2>Odaberi kako želiš igrati.</h2><p>Svaka runda donosi nove pojmove i sve zahtjevnije izazove.</p></div>
              <div className="rd-record"><span>{bestLabel}</span><strong>{bestScore}</strong><small>BODOVA</small></div>
            </div>

            <div className="rd-mode-grid">
              <button onClick={() => setMode("solo")} className={`rd-mode-card ${mode === "solo" ? "is-active" : ""}`}>
                <span className="rd-mode-number">01</span><span className="rd-mode-tag">BEZ VREMENSKOG PRITISKA</span><strong>Samostalno</strong><span className="rd-mode-copy">Igraj svojim tempom i izgradi osobni rekord kroz deset pojmova.</span><span className="rd-mode-link">Odabran način <b>→</b></span>
              </button>
              <button onClick={() => setMode("daily")} className={`rd-mode-card ${mode === "daily" ? "is-active" : ""}`}>
                <span className="rd-mode-number">02</span><span className="rd-mode-tag">NOVI IZAZOV SVAKI DAN</span><strong>Dnevni izazov</strong><span className="rd-mode-copy">Isti skup riječi za sve. Vrati se svaki dan i popravi rezultat.</span><span className="rd-mode-link">Odabran način <b>→</b></span>
              </button>
              <button onClick={() => setMode("duel")} className={`rd-mode-card ${mode === "duel" ? "is-active" : ""}`}>
                <span className="rd-mode-number">03</span><span className="rd-mode-tag">DVA IGRAČA · JEDAN POBJEDNIK</span><strong>Duel igrača</strong><span className="rd-mode-copy">Izazovi prijatelja na istom uređaju i osvojite naslov boljeg znalca.</span><span className="rd-mode-link">Odabran način <b>→</b></span>
              </button>
            </div>

            {mode === "duel" && <div className="rd-player-fields">
              <label>PRVI IGRAČ<input value={playerOne} onChange={(event) => setPlayerOne(event.target.value)} maxLength={24} /></label>
              <label>DRUGI IGRAČ<input value={playerTwo} onChange={(event) => setPlayerTwo(event.target.value)} maxLength={24} /></label>
            </div>}

            <div className="rd-bottom-row">
              <div className="rd-how">
                <div className="rd-overline">KAKO SE IGRA</div>
                <div className="rd-levels"><span className="rd-level easy"><b>01</b> Lako</span><span className="rd-level medium"><b>02</b> Srednje</span><span className="rd-level hard"><b>03</b> Teško</span></div>
                <p>{modeDescription}</p>
              </div>
              <div className="rd-scoring">
                <div><span>LAKO</span><strong>10</strong></div><div><span>SREDNJE</span><strong>20</strong></div><div><span>TEŠKO</span><strong>30</strong></div>
                <small>+5 bodova za niz točnih odgovora · pomoć umanjuje rezultat</small>
              </div>
            </div>
            <button onClick={start} className="rd-start">ZAPOČNI IZAZOV <span>→</span></button>
            <div className="rd-footnote">ZNANJE JE NASLJEĐE KOJE SE PRENOSI.</div>
          </div>
        )}

        {started && current && (
          <div className="rd-game">
            <div className="rd-game-top">
              <div><div className="rd-overline">TRENUTAČNI IZAZOV</div><h2>{current.category}<span> / {current.level === 1 ? "LAKO" : current.level === 2 ? "SREDNJE" : "TEŠKO"}</span></h2></div>
              <div className="rd-scoreline">{mode === "duel" ? <><span>{playerNames[0]} <b>{scores[0]}</b></span><span>{playerNames[1]} <b>{scores[1]}</b></span></> : <span>BODOVI <b>{scores[0]}</b></span>}</div>
            </div>
            <div className="rd-progress-meta"><span>POJAM {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}</span><span>{Math.round(progress)}% ZAVRŠENO</span></div>
            <div className="rd-progress"><span style={{ width: `${progress}%` }} /></div>
            {mode === "duel" && <div className="rd-turn">SADA IGRA: <strong>{playerNames[activePlayer]}</strong></div>}
            <div className="rd-puzzle">
              <div className="rd-puzzle-label">SLOŽI SKRIVENU RIJEČ</div>
              <p>{current.clue}</p>
              <div className="rd-answer-slots" aria-label="Složena slova">
                {Array.from({ length: current.letters.length }, (_, position) => {
                  const tileId = selected[position];
                  const tile = current.letters.find((letter) => letter.id === tileId);
                  return <button key={position} onClick={() => tile && removeLetter(tile.id)} disabled={!tile || checked} className={`rd-answer-tile ${tile ? (normalize(tile.letter)===normalize(current.word)[position] ? "correct" : "wrong") : ""}`}>{tile?.letter || ""}</button>;
                })}
              </div>
              <div className="rd-letter-bank">
                {current.letters.map((tile) => <button key={tile.id} onClick={() => chooseLetter(tile.id)} disabled={selected.includes(tile.id) || checked} className={`rd-letter-tile ${selected.includes(tile.id) ? "used" : ""}`}>{tile.letter}</button>)}
              </div>
              {feedback && <div className={`rd-feedback ${checked ? "success" : "hint"}`}>{feedback}</div>}
              <div className="rd-actions">
                {!checked ? <><button onClick={checkAnswer} disabled={!answer.trim()} className="rd-check">PROVJERI ODGOVOR</button><button onClick={clearAnswer} className="rd-secondary">OČISTI</button><button onClick={revealLetter} disabled={revealed} className="rd-secondary">POMOĆ</button></> : <button onClick={next} className="rd-check">SLJEDEĆI POJAM <span>→</span></button>}
              </div>
              {checked && <div className="rd-explanation"><div>TO JE TO. ZAPAMTI.</div><strong>{current.word}</strong><p>{current.explanation}</p></div>}
            </div>
            <div className="rd-game-bottom"><span>NIZ TOČNIH ODGOVORA <b>{streak}</b></span><button onClick={() => { setStarted(false); setFinished(false); setRound([]); }} className="rd-quit">NAPUSTI IZAZOV</button></div>
          </div>
        )}

        {finished && (
          <div className="rd-finish">
            <div className="rd-overline">IZAZOV JE ZAVRŠEN</div>
            <h2>{mode === "duel" ? winner === "Neriješeno" ? "Izjednačen rezultat." : `Pobjednik je ${winner}.` : "Odlično odigrano."}</h2>
            <p>Svaka naučena riječ čuva dio našeg zajedničkog nasljeđa.</p>
            <div className="rd-final-scores"><div><span>{playerNames[0]}</span><strong>{scores[0]}</strong><small>BODOVA</small></div>{mode === "duel" && <div><span>{playerNames[1]}</span><strong>{scores[1]}</strong><small>BODOVA</small></div>}</div>
            <div className="rd-actions"><button onClick={start} className="rd-check">IGRAJ PONOVNO</button><button onClick={() => { setStarted(false); setFinished(false); setRound([]); }} className="rd-secondary">PROMIJENI NAČIN</button><button onClick={onBack} className="rd-secondary">NATRAG NA KVIZ</button></div>
          </div>
        )}
      </section>
      <p className="rd-disclaimer">Osobni rezultat ove početne verzije sprema se na ovom uređaju. Online dvoboji, zajednička rang-lista i povezivanje bodova s korisničkim profilom zahtijevaju zasebnu sigurnu integraciju.</p>

      <style>{`
        .rd-page{color:#f7f5ef}.rd-shell{overflow:hidden;border:1px solid rgba(221,184,103,.2);border-radius:26px;background:#07182a;box-shadow:0 28px 80px rgba(0,0,0,.32)}
        .rd-back{border:1px solid rgba(255,255,255,.16);border-radius:10px;padding:10px 16px;background:rgba(255,255,255,.045);color:#e8eaf0;font-size:13px;font-weight:700;transition:.2s}.rd-back:hover{border-color:#d9b66d;background:rgba(255,255,255,.08)}
        .rd-brand{color:#c9b88f;font-size:10px;font-weight:800;letter-spacing:.2em}.rd-brand span{color:#a9874c;padding:0 7px}
        .rd-hero{position:relative;overflow:hidden;min-height:250px;padding:40px 34px;background:radial-gradient(ellipse at 78% 20%,rgba(204,165,91,.17),transparent 32%),linear-gradient(115deg,#0e2b47,#102d49 55%,#0a2037);border-bottom:1px solid rgba(255,255,255,.08)}
        .rd-hero-art{position:absolute;z-index:1;top:0;right:0;width:43%;height:100%;padding:12px 18px 12px 0;object-fit:contain;object-position:center right;opacity:1;filter:drop-shadow(0 12px 28px rgba(0,0,0,.28));mask-image:linear-gradient(90deg,transparent 0%,rgba(0,0,0,.7) 15%,#000 38%)}
        .rd-hero>div.relative{max-width:61%;}
        @media(max-width:760px){.rd-hero{min-height:245px;padding:30px 22px}.rd-hero-art{width:48%;padding:10px 8px 10px 0;opacity:.86;mask-image:linear-gradient(90deg,transparent 0%,rgba(0,0,0,.85) 20%,#000 48%)}.rd-hero>div.relative{max-width:62%}}
        .rd-hero:after{content:"";position:absolute;inset:auto 0 0;height:4px;background:linear-gradient(90deg,#8c2637 0 33%,#e9e4d8 33% 66%,#1b4165 66%)}
        .rd-hero-glow{position:absolute;width:340px;height:340px;right:8%;top:-240px;border:1px solid rgba(221,184,103,.2);border-radius:50%;box-shadow:0 0 0 32px rgba(221,184,103,.025),0 0 0 66px rgba(221,184,103,.02)}
        .rd-kicker{display:flex;align-items:center;gap:10px;color:#e3c786;font-size:10px;font-weight:800;letter-spacing:.22em}.rd-kicker span{width:25px;height:1px;background:#d9b66d}
        .rd-hero h1{margin-top:17px;color:#fff;font-size:clamp(38px,7vw,66px);font-weight:800;line-height:1;letter-spacing:-.055em}.rd-hero h1 em{color:#e4c783;font-style:normal}.rd-hero>div>p{margin-top:14px;color:rgba(255,255,255,.7);font-size:15px;letter-spacing:.025em}
        .rd-hero-meta{display:flex;align-items:center;gap:12px;margin-top:27px;color:rgba(255,255,255,.46);font-size:9px;font-weight:800;letter-spacing:.17em}.rd-hero-meta i{width:3px;height:3px;border-radius:50%;background:#d6b66e}
        .rd-hero-mark{position:absolute;right:7%;bottom:4px;color:rgba(255,255,255,.035);font-size:180px;font-weight:900;letter-spacing:-.1em;line-height:1}
        .rd-content{padding:32px}.rd-intro-row{display:flex;align-items:center;justify-content:space-between;gap:20px}.rd-overline{color:#d9b66d;font-size:10px;font-weight:800;letter-spacing:.2em}.rd-intro-row h2,.rd-game-top h2{margin-top:8px;color:#fff;font-size:25px;font-weight:750;letter-spacing:-.035em}.rd-intro-row p{margin-top:7px;color:rgba(255,255,255,.52);font-size:13px}
        .rd-record{display:grid;min-width:142px;justify-items:end;border-left:1px solid rgba(255,255,255,.1);padding-left:24px}.rd-record span,.rd-record small{color:rgba(255,255,255,.42);font-size:9px;font-weight:800;letter-spacing:.12em}.rd-record strong{margin:2px 0;color:#f0d28c;font-size:32px;line-height:1}
        .rd-mode-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:13px;margin-top:28px}.rd-mode-card{position:relative;display:flex;min-height:212px;flex-direction:column;align-items:flex-start;overflow:hidden;border:1px solid rgba(255,255,255,.1);border-radius:16px;padding:20px;background:linear-gradient(145deg,rgba(255,255,255,.055),rgba(255,255,255,.018));text-align:left;transition:transform .22s,border-color .22s,background .22s}.rd-mode-card:hover{transform:translateY(-3px);border-color:rgba(217,182,109,.45)}.rd-mode-card.is-active{border-color:#d8b66d;background:linear-gradient(145deg,rgba(217,182,109,.13),rgba(255,255,255,.025));box-shadow:inset 0 0 0 1px rgba(217,182,109,.12),0 14px 35px rgba(0,0,0,.16)}
        .rd-mode-number{position:absolute;right:15px;top:8px;color:rgba(255,255,255,.12);font-size:38px;font-weight:900;letter-spacing:-.08em}.rd-mode-tag{position:relative;color:#d7b66e;font-size:8px;font-weight:800;letter-spacing:.13em}.rd-mode-card strong{margin-top:17px;color:#fff;font-size:21px;letter-spacing:-.03em}.rd-mode-copy{margin-top:9px;color:rgba(255,255,255,.52);font-size:12px;line-height:1.65}.rd-mode-link{display:flex;justify-content:space-between;gap:12px;width:100%;margin-top:auto;padding-top:18px;color:#e6c982;font-size:10px;font-weight:800;letter-spacing:.1em;text-transform:uppercase}.rd-mode-link b{font-size:17px;line-height:10px}
        .rd-player-fields{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:16px}.rd-player-fields label{display:grid;gap:8px;color:#d9b66d;font-size:9px;font-weight:800;letter-spacing:.14em}.rd-player-fields input{width:100%;border:1px solid rgba(255,255,255,.15);border-radius:9px;padding:12px;background:#0d243a;color:#fff;outline:none}.rd-player-fields input:focus{border-color:#d9b66d}
        .rd-bottom-row{display:grid;grid-template-columns:1fr 1fr;gap:22px;margin-top:25px;padding:20px;border:1px solid rgba(255,255,255,.08);border-radius:15px;background:rgba(0,0,0,.12)}.rd-levels{display:flex;flex-wrap:wrap;gap:9px;margin-top:13px}.rd-level{display:inline-flex;align-items:center;gap:7px;color:rgba(255,255,255,.65);font-size:11px}.rd-level b{display:grid;width:22px;height:22px;place-items:center;border-radius:6px;font-size:9px}.rd-level.easy b{background:rgba(86,170,130,.16);color:#9bd5b4}.rd-level.medium b{background:rgba(217,182,109,.15);color:#e8ca8b}.rd-level.hard b{background:rgba(194,103,103,.15);color:#e6a3a3}.rd-how p{margin-top:12px;color:rgba(255,255,255,.46);font-size:11px;line-height:1.65}
        .rd-scoring{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.rd-scoring>div{display:grid;gap:5px;padding:10px;border-left:1px solid rgba(255,255,255,.1)}.rd-scoring span{color:rgba(255,255,255,.4);font-size:8px;font-weight:800;letter-spacing:.13em}.rd-scoring strong{color:#f0d28c;font-size:23px}.rd-scoring small{grid-column:1/-1;align-self:end;color:rgba(255,255,255,.35);font-size:9px;line-height:1.5}
        .rd-start,.rd-check{display:flex;align-items:center;justify-content:center;gap:20px;width:100%;min-height:52px;margin-top:22px;border:1px solid #e5c47b;border-radius:10px;padding:14px 20px;background:linear-gradient(110deg,#e9cf91,#c69b50);color:#132235;font-size:11px;font-weight:900;letter-spacing:.16em;box-shadow:0 10px 26px rgba(190,145,64,.16);transition:filter .2s,transform .2s}.rd-start:hover,.rd-check:hover{filter:brightness(1.08);transform:translateY(-2px)}.rd-start span,.rd-check span{font-size:18px}.rd-footnote{margin-top:20px;color:rgba(255,255,255,.25);font-size:8px;font-weight:800;letter-spacing:.2em;text-align:center}
        .rd-game{padding:30px}.rd-game-top{display:flex;align-items:center;justify-content:space-between;gap:16px}.rd-game-top h2 span{color:#d8b66d;font-size:10px;letter-spacing:.12em}.rd-scoreline{display:flex;flex-wrap:wrap;gap:8px}.rd-scoreline span{border:1px solid rgba(255,255,255,.1);border-radius:8px;padding:9px 12px;color:rgba(255,255,255,.6);font-size:10px}.rd-scoreline b{margin-left:8px;color:#f0d28c;font-size:14px}
        .rd-progress-meta{display:flex;justify-content:space-between;margin-top:25px;color:rgba(255,255,255,.42);font-size:9px;font-weight:800;letter-spacing:.13em}.rd-progress{height:5px;margin-top:9px;overflow:hidden;border-radius:9px;background:rgba(255,255,255,.09)}.rd-progress span{display:block;height:100%;border-radius:9px;background:linear-gradient(90deg,#a77d3b,#efd58e);transition:width .3s}.rd-turn{margin-top:18px;color:rgba(255,255,255,.5);font-size:10px;letter-spacing:.1em;text-align:center}.rd-turn strong{color:#f0d28c}
        .rd-puzzle{max-width:720px;margin:30px auto 0;text-align:center}.rd-puzzle-label{color:#d9b66d;font-size:9px;font-weight:900;letter-spacing:.2em}.rd-puzzle>p{max-width:590px;margin:13px auto 25px;color:rgba(255,255,255,.72);font-size:16px;line-height:1.7}
        .rd-answer-slots{display:flex;flex-wrap:wrap;justify-content:center;gap:6px;min-height:54px}.rd-answer-tile,.rd-letter-tile{display:grid;width:42px;height:48px;place-items:center;border:1px solid rgba(225,194,129,.32);border-radius:8px;background:rgba(225,194,129,.08);color:#f2d89e;font-size:19px;font-weight:800;transition:transform .16s,background .16s,border-color .16s}.rd-answer-tile.correct{border-color:#34d399;background:#059669;color:#fff;box-shadow:0 0 14px rgba(16,185,129,.2)}.rd-answer-tile.wrong{border-color:#fb7185;background:#e11d48;color:#fff;box-shadow:0 0 14px rgba(244,63,94,.18)}.rd-answer-tile:not(:disabled):hover,.rd-letter-tile:not(:disabled):hover{transform:translateY(-3px);border-color:#f1d18a}.rd-letter-bank{display:flex;flex-wrap:wrap;justify-content:center;gap:7px;margin-top:16px}.rd-letter-tile{width:44px;height:50px;border-color:rgba(255,255,255,.13);background:linear-gradient(145deg,#173a58,#102a43);color:#fff;box-shadow:0 5px 12px rgba(0,0,0,.18)}.rd-letter-tile.used{opacity:.2;transform:scale(.94)}
        .rd-feedback{margin-top:16px;font-size:12px;font-weight:700}.rd-feedback.success{color:#9bd5b4}.rd-feedback.hint{color:#e8ca8b}.rd-actions{display:flex;flex-wrap:wrap;justify-content:center;gap:9px;margin-top:18px}.rd-actions .rd-check{width:auto;min-width:190px;margin:0}.rd-secondary{min-height:46px;border:1px solid rgba(255,255,255,.15);border-radius:9px;padding:11px 16px;background:rgba(255,255,255,.045);color:rgba(255,255,255,.75);font-size:9px;font-weight:800;letter-spacing:.1em;transition:.2s}.rd-secondary:hover{border-color:#d9b66d;color:#fff}.rd-secondary:disabled{opacity:.35}
        .rd-explanation{margin-top:24px;border:1px solid rgba(125,188,151,.18);border-radius:12px;padding:17px;background:rgba(87,151,115,.07);text-align:left}.rd-explanation div{color:#9bd5b4;font-size:8px;font-weight:900;letter-spacing:.17em}.rd-explanation strong{display:block;margin-top:8px;color:#fff;font-size:20px}.rd-explanation p{margin-top:6px;color:rgba(255,255,255,.6);font-size:12px;line-height:1.65}
        .rd-game-bottom{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-top:26px;padding-top:16px;border-top:1px solid rgba(255,255,255,.08);color:rgba(255,255,255,.36);font-size:9px;font-weight:800;letter-spacing:.1em}.rd-game-bottom b{margin-left:8px;color:#e8ca8b;font-size:13px}.rd-quit{color:rgba(255,255,255,.4);font-size:9px;font-weight:800;letter-spacing:.1em}.rd-quit:hover{color:#fff}
        .rd-finish{padding:65px 28px;text-align:center}.rd-finish h2{margin-top:12px;color:#fff;font-size:clamp(28px,5vw,42px);font-weight:800;letter-spacing:-.04em}.rd-finish>p{margin-top:10px;color:rgba(255,255,255,.55);font-size:13px}.rd-final-scores{display:flex;justify-content:center;gap:12px;margin-top:28px}.rd-final-scores>div{display:grid;min-width:155px;gap:5px;border:1px solid rgba(255,255,255,.12);border-radius:13px;padding:18px;background:rgba(255,255,255,.035)}.rd-final-scores span,.rd-final-scores small{color:rgba(255,255,255,.45);font-size:9px;font-weight:800;letter-spacing:.12em}.rd-final-scores strong{color:#f0d28c;font-size:36px}
        .rd-disclaimer{max-width:850px;margin:16px auto 0;color:rgba(255,255,255,.35);font-size:10px;line-height:1.7;text-align:center}
        @media(max-width:760px){.rd-hero{min-height:225px;padding:32px 22px}.rd-content{padding:22px}.rd-mode-grid{grid-template-columns:1fr}.rd-mode-card{min-height:175px}.rd-bottom-row{grid-template-columns:1fr}.rd-game{padding:22px}.rd-game-top{align-items:flex-start;flex-direction:column}.rd-record{min-width:110px;padding-left:14px}.rd-hero-meta{flex-wrap:wrap;gap:8px}.rd-hero-mark{right:3%;font-size:125px}.rd-intro-row h2{font-size:22px}}
        @media(max-width:420px){.rd-intro-row{align-items:flex-start;flex-direction:column}.rd-record{grid-template-columns:auto auto;align-items:center;justify-items:start;column-gap:8px;border-left:0;padding:0}.rd-record strong{grid-row:2}.rd-record small{grid-column:2;grid-row:2}.rd-player-fields{grid-template-columns:1fr}.rd-answer-tile,.rd-letter-tile{width:35px;height:42px;font-size:16px}.rd-scoring{gap:3px}.rd-scoreline{width:100%}.rd-scoreline span{flex:1}.rd-game-bottom{align-items:flex-start;flex-direction:column}}
        @media(prefers-reduced-motion:reduce){.rd-page *{transition:none!important;animation:none!important}}
      `}</style>
    </main>
  );
}
