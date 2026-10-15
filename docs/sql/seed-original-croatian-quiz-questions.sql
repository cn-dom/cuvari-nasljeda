-- Original Croatian quiz expansion, prepared 2026-10-15.
-- These are newly worded PatriaSoul questions inspired by broad Croatian-trivia topics,
-- not copied verbatim from third-party quiz pages. Safe to re-run: source_key prevents re-inserting these rows.
WITH new_questions(category, question, answer_a, answer_b, answer_c, answer_d, correct_index) AS (
  VALUES
  ('gradovi','U kojem se gradu održava Sinjska alka?','Knin','Sinj','Imotski','Vrgorac',1),
  ('kulturna_bastina','U kojem je mjestu pronađena Bašćanska ploča?','Jurandvor na otoku Krku','Nin kraj Zadra','Solin kraj Splita','Lobor u Hrvatskom zagorju',0),
  ('priroda','Koji nacionalni park obuhvaća Veliko i Malo jezero na otoku?','Brijuni','Kornati','Mljet','Krka',2),
  ('gradovi','U kojem se gradu nalaze poznate Morske orgulje?','Šibenik','Zadar','Pula','Rovinj',1),
  ('kulturna_bastina','U kojem se gradu nalazi katedrala sv. Jakova, upisana na UNESCO-ov Popis svjetske baštine?','Trogir','Zadar','Šibenik','Dubrovnik',2),
  ('priroda','Koje se močvarno područje nalazi uz ušće Drave u Dunav?','Lonjsko polje','Kopački rit','Neretvanska delta','Vransko jezero',1),
  ('geografija','Koji most povezuje hrvatsko kopno s poluotokom Pelješcem?','Krčki most','Maslenički most','Pelješki most','Paški most',2),
  ('gradovi','Koje se četiri rijeke tradicionalno povezuju s gradom Karlovcem?','Kupa, Korana, Mrežnica i Dobra','Sava, Drava, Dunav i Kupa','Cetina, Krka, Zrmanja i Neretva','Una, Bosut, Orljava i Bednja',0),
  ('geografija','Kako se zove najviši vrh Hrvatske, na planini Dinari?','Sveto brdo','Kamešnica','Sinjal','Vaganski vrh',2),
  ('priroda','Koji se nacionalni park nalazi u skupini otoka uz zapadnu obalu Istre?','Brijuni','Mljet','Krka','Paklenica',0),
  ('priroda','Na kojem se otoku nalazi Park prirode Telašćica?','Hvaru','Dugom otoku','Visu','Lastovu',1),
  ('gradovi','U kojem se gradu nalazi tvrđava Nehaj?','Senju','Kninu','Karlovcu','Omišu',0),
  ('povijest','U kojem se istarskom gradu nalazi poznata rimska Arena?','Rovinj','Poreč','Pula','Labin',2),
  ('povijest','Uz koji se današnji hrvatski grad veže arheološki lokalitet Vučedol?','Vukovar','Varaždin','Sisak','Đakovo',0),
  ('geografija','Koje je najveće prirodno jezero u Hrvatskoj?','Prokljansko jezero','Vransko jezero kod Biograda','Lokvarsko jezero','Bajer',1),
  ('geografija','Koja rijeka protječe kroz Osijek?','Drava','Kupa','Cetina','Mirna',0),
  ('kulturna_bastina','Koji je grad poznat po viteškoj plesnoj igri Moreški?','Korčula','Hvar','Rab','Cres',0),
  ('kulturna_bastina','S kojim se dijelom Hrvatske posebno povezuje tradicija licitarskih srca?','Hrvatskim sjeverom i područjem Zagreba','Dubrovačkim primorjem','Dalmatinskim otocima','Istočnom Slavonijom isključivo',0),
  ('kulturna_bastina','Po kojoj je vrsti čipke posebno poznat otok Pag?','Čunčanoj čipki','Paškoj čipki','Lepoglavskoj čipki','Konavoskom vezu',1),
  ('povijest','Koja je latinska riječ tradicionalno povezana sa slobodom Dubrovnika?','Pax','Libertas','Victoria','Concordia',1),
  ('povijest','U kojem se gradu nalazi Dioklecijanova palača?','Šibeniku','Splitu','Zadru','Puli',1),
  ('povijest','U kojoj se hrvatskoj županiji nalazi dvorac Trakošćan?','Varaždinskoj županiji','Istarskoj županiji','Osječko-baranjskoj županiji','Splitsko-dalmatinskoj županiji',0),
  ('geografija','Na kojem se otoku nalazi plaža Zlatni rat?','Braču','Korčuli','Pagu','Lošinju',0),
  ('geografija','Na kojem se otoku nalazi Modra špilja kod Biševa?','Visu','Biševu','Lastovu','Mljetu',1),
  ('priroda','Koji je nacionalni park poznat po slapu Skradinski buk?','Krka','Plitvička jezera','Risnjak','Sjeverni Velebit',0),
  ('kulturna_bastina','U kojem se gradu nalazi Muzej krapinskih neandertalaca?','Krapini','Varaždinu','Bjelovaru','Čakovcu',0),
  ('gradovi','U kojem se gradu nalazi povijesna gradska četvrt Tvrđa?','Osijeku','Vinkovcima','Požegi','Slavonskom Brodu',0),
  ('priroda','Koji je nacionalni park poznat po brojnim otocima, otočićima i hridima u sjevernoj Dalmaciji?','Kornati','Plitvička jezera','Risnjak','Paklenica',0),
  ('povijest','Tko je zaštitnik grada Dubrovnika?','Sveti Marko','Sveti Vlaho','Sveti Donat','Sveti Eufemije',1),
  ('geografija','Uz koju veliku europsku rijeku leži Vukovar?','Dunav','Drava','Sava','Kupa',0),
  ('geografija','Koji je grad upravno središte Istarske županije?','Pazin','Pula','Rovinj','Umag',0),
  ('povijest','U kojem se gradu nalazi Vukovarski vodotoranj, simbol obrane grada?','Vukovaru','Iloku','Vinkovcima','Osijeku',0),
  ('glazba','U kojem se gradu održava poznati Riječki karneval?','Rijeci','Puli','Zadru','Šibeniku',0),
  ('kulturna_bastina','Koji je grad domaćin Vinkovačkih jeseni?','Vinkovci','Đakovo','Vukovar','Slavonski Brod',0),
  ('priroda','Koji se park prirode nalazi na otoku Lastovu i okolnom otočju?','Park prirode Lastovsko otočje','Park prirode Medvednica','Park prirode Papuk','Park prirode Žumberak',0)
)
INSERT INTO public.quiz_questions
  (category, question, answer_a, answer_b, answer_c, answer_d, correct_index, source_url, source_key, active)
SELECT n.category, n.question, n.answer_a, n.answer_b, n.answer_c, n.answer_d, n.correct_index,
       NULL, 'patriasoul-original-2026-' || md5(n.question), true
FROM new_questions n
WHERE NOT EXISTS (
  SELECT 1 FROM public.quiz_questions q
  WHERE q.source_key = 'patriasoul-original-2026-' || md5(n.question)
);
