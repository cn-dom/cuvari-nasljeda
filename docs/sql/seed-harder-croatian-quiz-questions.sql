-- Dodatna skupina zahtjevnijih pitanja za Hrvatski kviz.
-- Izvorni tekstovi PatriaSoul; sigurno za ponovnu primjenu preko source_key i teksta pitanja.
WITH new_questions(category, question, answer_a, answer_b, answer_c, answer_d, correct_index) AS (
  VALUES
  ('povijest','Koje je godine prvi put tiskana Marulićeva Judita, iako je autor dovršio djelo ranije?','1491.','1501.','1521.','1569.',2),
  ('povijest','Koji je hrvatski književnik napisao Planine, koje se obično smatraju prvim hrvatskim romanom?','Petar Zoranić','Petar Hektorović','Hanibal Lucić','Dinko Zlatar',0),
  ('povijest','Koji je događaj neposredno prethodio ulasku Hrvatske u sastav Države Slovenaca, Hrvata i Srba 1918.?','Raskid državnopravnih veza s Austro-Ugarskom','Proglašenje Kraljevine SHS','Potpisivanje Rapalskog ugovora','Donošenje Vidovdanskog ustava',0),
  ('povijest','Koje se godine dogodila bitka na Krbavskom polju?','1389.','1493.','1526.','1593.',1),
  ('povijest','Koji je hrvatski ban povezan s revolucionarnom 1848. godinom?','Ivan Mažuranić','Josip Jelačić','Ivan Kukuljević Sakcinski','Karlo Habsburški',1),
  ('povijest','Koje je godine Hrvatski sabor proglasio hrvatski jezik službenim u javnoj uporabi u Hrvatskoj?','1835.','1847.','1861.','1881.',1),
  ('povijest','Koja je dvojica hrvatskih velikaša pogubljena u Bečkom Novom Mjestu 1671. nakon Zrinsko-frankopanske urote?','Nikola Šubić Zrinski i Krsto Frankopan','Petar Zrinski i Fran Krsto Frankopan','Juraj Zrinski i Ivan Frankopan','Nikola Frankopan i Petar Zrinski',1),
  ('povijest','Tko je autor djela De regno Dalmatiae et Croatiae, objavljenog 1666. godine?','Ivan Lučić','Pavao Ritter Vitezović','Franjo Rački','Toma Arhiđakon',0),
  ('glagoljica','Koje je pismo upotrijebljeno u hrvatskoj redakciji najstarijih glagoljskih liturgijskih knjiga?','Ćirilica','Glagoljica','Bosančica','Latinica',1),
  ('jezik','Koje se godine pojavila prva hrvatska novina Novine horvatske, s književnim prilogom Danica?','1790.','1813.','1835.','1848.',2),
  ('kulturna_bastina','Koji je hrvatski spomenik poznat po glagoljskom natpisu iz oko 1100. godine i spomenu kralja Zvonimira?','Valunska ploča','Bašćanska ploča','Plominski natpis','Supetarski ulomak',1),
  ('kulturna_bastina','Koja je hrvatska nematerijalna kulturna praksa upisana na UNESCO-ov popis 2010. godine?','Sinjska alka','Lacemaking in Croatia','Klapsko pjevanje','Bećarac',0),
  ('kulturna_bastina','Koji je hrvatski grad posebno povezan s tradicijom izrade čipke koja je dio UNESCO-ova upisa hrvatske čipke?','Lepoglava','Đakovo','Ilok','Vinkovci',0),
  ('kulturna_bastina','Koji je hrvatski lokalitet UNESCO upisao kao kulturni krajolik poljoprivredne namjene na otoku Hvaru?','Starogradsko polje','Vransko polje','Neretvanska dolina','Lumbardsko polje',0),
  ('kulturna_bastina','Koji je renesansni izumitelj iz Šibenika napisao djelo Machinae novae?','Faust Vrančić','Ruđer Bošković','Marin Getaldić','Ivan Vučetić',0),
  ('geografija','Koji je vrh najviša točka Biokova?','Vošac','Sveti Jure','Sinjal','Kamešnica',1),
  ('geografija','Koja rijeka izvire u području Dinare kod Vrlike i protječe kroz Cetinsku krajinu?','Krka','Cetina','Zrmanja','Neretva',1),
  ('geografija','Koji je nacionalni park smješten na masivu Risnjaka u Gorskom kotaru?','Sjeverni Velebit','Risnjak','Paklenica','Plitvička jezera',1),
  ('znanost','Koji je hrvatski znanstvenik iz Dubrovnika napisao djelo Theoria philosophiae naturalis i bavio se atomističkom teorijom materije?','Ruđer Bošković','Andrija Mohorovičić','Vladimir Prelog','Ivan Supek',0),
  ('znanost','Koji je hrvatski znanstvenik povezan s otkrićem diskontinuiteta između Zemljine kore i plašta?','Andrija Mohorovičić','Marin Getaldić','Fran Bošnjaković','Lavoslav Ružička',0),
  ('glazba','Koji je hrvatski skladatelj skladao operu Ero s onoga svijeta?','Ivan Zajc','Jakov Gotovac','Vatroslav Lisinski','Boris Papandopulo',1),
  ('kulturna_bastina','Koji je hrvatski grad poznat po katedrali sv. Jakova građenoj bez drvene konstrukcije krova i upisanoj na UNESCO-ov popis?','Trogir','Šibenik','Zadar','Poreč',1),
  ('povijest','Koje je godine održana prva sjednica Hrvatskoga sabora u suvremenom višestranačkom sazivu nakon izbora 1990.?','30. svibnja 1990.','25. lipnja 1991.','8. listopada 1991.','15. siječnja 1992.',0),
  ('povijest','Koji je hrvatski kralj tradicionalno povezan s Bašćanskom pločom?','Petar Krešimir IV.','Dmitar Zvonimir','Tomislav','Ladislav',1),
  ('kulturna_bastina','Koji je grad domaćin tradicionalne viteške igre Moreške?','Korčula','Hvar','Rab','Cres',0)
)
INSERT INTO public.quiz_questions
  (category, question, answer_a, answer_b, answer_c, answer_d, correct_index, source_url, source_key, active)
SELECT n.category, n.question, n.answer_a, n.answer_b, n.answer_c, n.answer_d, n.correct_index,
       NULL, 'patriasoul-harder-2026-' || md5(n.question), true
FROM new_questions n
WHERE NOT EXISTS (
  SELECT 1 FROM public.quiz_questions q
  WHERE q.source_key = 'patriasoul-harder-2026-' || md5(n.question)
     OR lower(trim(q.question)) = lower(trim(n.question))
);
