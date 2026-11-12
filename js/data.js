/* =========================================================================
   PREP CLUB — Données du catalogue (prototype)
   Toutes les données ci-dessous sont des DONNÉES DE DÉMONSTRATION.
   Projet étudiant INSEEC : valeurs nutritionnelles, producteurs et prix sont
   fictifs mais cohérents (prix justifiés dans strategie.html).
   ========================================================================= */

const IMG = {
  hero: '1490645935967-10de6ba17061',
  heroAlt: '1543352634-a1c51d9f1fa7',
  spread: '1606787366850-de6330128bfc',
  tabletop: '1505935428862-770b6f24f629',
  market: '1488459716781-31db52582fe9',
  shelves: '1542838132-92c53300491e',
  field: '1500382017468-9049fed747ef',
  wheat: '1500937386664-56d1dfef3854',
  cooking: '1528712306091-ed0763094c98',
  tablet: '1495521821757-a1efb6729352',
  salads: '1464306076886-da185f6a9d05',
  saladBowl: '1505253716362-afaea1d3d1af',
  breakfastSpread: '1494390248081-4e521a5940db',
  // Saisons
  asparagus: '1595855759920-86582396756a',
  tomatoes: '1592924357228-91a4daadcfea',
  pumpkin: '1506917728037-b6af01a7d403',
  cabbage: '1594282486552-05b4d80fbb9f',
  mushrooms: '1504545102780-26774c1bb073',
  strawberries: '1518635017498-87f514b751ba',
  // Producteurs
  hen: '1548550023-2bdb3c5beed7',
  seedlings: '1523348837708-15d4a09cfac2',
  picking: '1500651230702-0e2d8a49d4ad',
  cheese: '1486297678162-eb2a19b0a32d',
  flour: '1610725664285-7c57e6eeac3f',
};

const CATEGORIES = {
  breakfast: 'Petit-déjeuner',
  lunch: 'Déjeuner',
  dinner: 'Dîner',
  snack: 'En-cas',
  dessert: 'Desserts',
};

const ALLERGENS = ['Gluten', 'Crustacés', 'Œufs', 'Poissons', 'Arachides', 'Soja', 'Lait', 'Fruits à coque', 'Céleri', 'Moutarde', 'Sésame', 'Sulfites', 'Lupin', 'Mollusques'];

/* ---------- Producteurs partenaires (EXEMPLES DE TRAVAIL — fictifs) ---------- */
const PRODUCERS = [
  {
    id: 'p1', name: 'Ferme des Monts d’Or', type: 'Éleveur de volailles',
    location: 'Poleymieux-au-Mont-d’Or', dept: 'Rhône (69)', distance: '15 km',
    img: IMG.hen,
    products: ['Poulet fermier', 'Œufs plein air'],
    bio: 'Exploitation familiale élevant des volailles en plein air sur les coteaux des Monts d’Or.',
    methods: 'Élevage plein air — méthode à vérifier et documenter avant publication.',
  },
  {
    id: 'p2', name: 'Les Jardins de la Saône', type: 'Maraîcher',
    location: 'Neuville-sur-Saône', dept: 'Rhône (69)', distance: '18 km',
    img: IMG.seedlings,
    products: ['Courgettes', 'Carottes', 'Courges', 'Herbes fraîches', 'Légumes racines'],
    bio: 'Maraîchage diversifié en bord de Saône, récoltes livrées deux fois par semaine.',
    methods: 'Culture de plein champ et sous abri — certifications à vérifier.',
  },
  {
    id: 'p3', name: 'Vergers du Pilat', type: 'Arboriculteur',
    location: 'Pélussin', dept: 'Loire (42)', distance: '45 km',
    img: IMG.picking,
    products: ['Pommes', 'Poires', 'Fraises', 'Fruits rouges'],
    bio: 'Vergers et petits fruits au pied du massif du Pilat.',
    methods: 'Agriculture raisonnée — justificatifs à collecter.',
  },
  {
    id: 'p4', name: 'Fromagerie des Dombes', type: 'Fromager & crèmerie',
    location: 'Villars-les-Dombes', dept: 'Ain (01)', distance: '35 km',
    img: IMG.cheese,
    products: ['Yaourt', 'Crème', 'Fromage frais'],
    bio: 'Crèmerie artisanale transformant le lait de fermes voisines.',
    methods: 'Lait collecté localement — origine à documenter par lot.',
  },
  {
    id: 'p5', name: 'Moulin du Beaujolais', type: 'Meunier',
    location: 'Belleville-en-Beaujolais', dept: 'Rhône (69)', distance: '45 km',
    img: IMG.flour,
    products: ['Farine de blé', 'Flocons d’avoine'],
    bio: 'Moulin travaillant des céréales de la région Auvergne-Rhône-Alpes.',
    methods: 'Meule de pierre — informations à vérifier.',
  },
  {
    id: 'p6', name: 'Champignonnière des Monts du Lyonnais', type: 'Producteur de champignons',
    location: 'Saint-Martin-en-Haut', dept: 'Rhône (69)', distance: '30 km',
    img: IMG.mushrooms,
    products: ['Champignons de Paris', 'Pleurotes'],
    bio: 'Culture de champignons en cave, récoltés le matin même.',
    methods: 'Culture en cave — informations à vérifier.',
  },
];

/* ---------- Helpers de construction ---------- */
const o = (ing, producer, region, country) => ({ ing, producer: producer || null, region: region || null, country: country || 'France' });
const n = (kcal, fat, sat, carbs, sugars, protein, fiber, salt) => ({ kcal, fat, sat, carbs, sugars, protein, fiber, salt });

/* ---------- Catalogue ---------- */
const PRODUCTS = [
  /* ---- BREAKFAST ---- */
  {
    id: 'overnight-oats', cat: 'breakfast', name: 'Porridge froid aux fruits rouges', price: 4.9, weight: 280,
    img: '1517673400267-0251440c45dc', tags: ['vegetarian', 'bestseller'],
    short: 'Flocons d’avoine, lait d’amande, fruits rouges et graines.',
    desc: 'Des flocons d’avoine trempés toute la nuit dans un lait d’amande vanillé, surmontés de fruits rouges et d’un crumble de graines. Prêt à déguster dès le réveil.',
    ingredients: 'Lait d’amande (eau, amande 2 %), flocons d’avoine 28 % (gluten), fruits rouges 18 %, yaourt grec (lait), graines de chia, sirop d’érable, graines de courge, vanille.',
    allergens: ['Gluten', 'Lait', 'Fruits à coque'], traces: 'Peut contenir des traces de sésame et d’arachides.',
    nutri: n(145, 4.2, 1.1, 21, 8.5, 6.1, 3.2, 0.08),
    origin: [o('Flocons d’avoine', 'p5'), o('Fruits rouges', 'p3'), o('Yaourt grec', 'p4'), o('Amandes', null, null, 'Espagne'), o('Sirop d’érable', null, null, 'Canada')],
    removable: ['Graines de courge', 'Sirop d’érable'],
  },
  {
    id: 'greek-yogurt-bowl', cat: 'breakfast', name: 'Bol de yaourt grec & granola', price: 4.5, weight: 250,
    img: '1494390248081-4e521a5940db', tags: ['vegetarian'],
    short: 'Yaourt grec, granola maison, miel et fruits frais.',
    desc: 'Un yaourt grec onctueux, notre granola maison croustillant, un filet de miel et des fruits frais de saison.',
    ingredients: 'Yaourt grec 60 % (lait), granola maison (flocons d’avoine – gluten, noisettes, miel, huile de colza), fruits de saison, miel.',
    allergens: ['Lait', 'Gluten', 'Fruits à coque'], traces: 'Peut contenir des traces de sésame.',
    nutri: n(132, 5.0, 2.6, 14.8, 9.2, 7.4, 1.8, 0.10),
    origin: [o('Yaourt grec', 'p4'), o('Flocons d’avoine', 'p5'), o('Fruits de saison', 'p3'), o('Miel', null, 'Ardèche')],
    removable: ['Miel', 'Granola'],
  },
  {
    id: 'chia-pudding', cat: 'breakfast', name: 'Pudding de chia coco & fraise', price: 4.5, weight: 220,
    img: '1488477181946-6428a0291777', tags: ['vegetarian', 'new'],
    short: 'Pudding de chia au lait de coco, coulis de fraise.',
    desc: 'Graines de chia gonflées dans un lait de coco léger, coulis de fraises et morceaux de fruits frais.',
    ingredients: 'Lait de coco 55 %, graines de chia 12 %, fraises 20 %, sirop d’agave, vanille.',
    allergens: [], traces: 'Préparé dans un atelier utilisant gluten, lait, œufs, fruits à coque.',
    nutri: n(158, 8.1, 4.9, 15.2, 7.8, 4.3, 5.6, 0.05),
    origin: [o('Fraises', 'p3'), o('Lait de coco', null, null, 'Sri Lanka'), o('Graines de chia', null, null, 'Pérou')],
    removable: ['Sirop d’agave'],
  },
  {
    id: 'breakfast-muffins', cat: 'breakfast', name: 'Muffins à la myrtille (x2)', price: 3.9, weight: 180,
    img: '1607958996333-41aef7caefaa', tags: ['vegetarian'],
    short: 'Deux muffins moelleux à la myrtille et à l’avoine.',
    desc: 'Muffins faits maison à la farine locale, aux flocons d’avoine et aux myrtilles. Idéal à emporter.',
    ingredients: 'Farine de blé (gluten), myrtilles 18 %, œufs, sucre de canne, lait, beurre (lait), flocons d’avoine (gluten), poudre à lever, sel.',
    allergens: ['Gluten', 'Œufs', 'Lait'], traces: 'Peut contenir des traces de fruits à coque.',
    nutri: n(345, 15.2, 3.1, 45.0, 22.0, 6.0, 2.1, 0.55),
    origin: [o('Farine de blé', 'p5'), o('Œufs', 'p1'), o('Myrtilles', null, null, 'Pologne'), o('Beurre', 'p4')],
    removable: [],
  },
  {
    id: 'banana-bread', cat: 'breakfast', name: 'Cake à la banane toasté & myrtilles', price: 3.9, weight: 200,
    img: '1484723091739-30a097e8f929', tags: ['vegetarian'],
    short: 'Tranches de cake à la banane, banane fraîche et myrtilles.',
    desc: 'Notre cake à la banane maison, à toaster quelques secondes, servi avec banane et myrtilles fraîches.',
    ingredients: 'Cake à la banane (banane, farine de blé – gluten, œufs, sucre complet, beurre – lait, noix), banane, myrtilles.',
    allergens: ['Gluten', 'Œufs', 'Lait', 'Fruits à coque'], traces: '',
    nutri: n(268, 9.5, 3.8, 38.5, 16.4, 6.5, 2.8, 0.42),
    origin: [o('Farine de blé', 'p5'), o('Œufs', 'p1'), o('Banane', null, null, 'République dominicaine')],
    removable: ['Noix'],
  },
  {
    id: 'granola-bowl', cat: 'breakfast', name: 'Bol granola & fruits frais', price: 4.7, weight: 260,
    img: '1490474418585-ba9bad8fd0ea', tags: ['vegetarian', 'bestseller'],
    short: 'Granola croustillant, skyr et assortiment de fruits.',
    desc: 'Un bol généreux : skyr nature, granola maison aux noisettes et un assortiment de fruits frais coupés.',
    ingredients: 'Skyr (lait), granola maison (flocons d’avoine – gluten, noisettes, miel), fruits frais 30 %.',
    allergens: ['Lait', 'Gluten', 'Fruits à coque'], traces: '',
    nutri: n(168, 6.3, 1.9, 21.4, 10.1, 6.2, 3.4, 0.07),
    origin: [o('Skyr', 'p4'), o('Flocons d’avoine', 'p5'), o('Fruits', 'p3')],
    removable: ['Noisettes'],
  },
  {
    id: 'egg-avocado-box', cat: 'breakfast', name: 'Box petit-déj œuf & avocat', price: 6.5, weight: 300,
    img: '1541519227354-08fa5d50c44d', tags: ['vegetarian', 'new'],
    short: 'Pain complet, avocat, œufs mollets et graines.',
    desc: 'La box salée du matin : tartines de pain complet, avocat écrasé citronné, deux œufs mollets et mélange de graines.',
    ingredients: 'Pain complet (farine de blé – gluten, levain, sel), avocat 30 %, œufs 25 %, citron, graines de sésame, piment d’Espelette, sel.',
    allergens: ['Gluten', 'Œufs', 'Sésame'], traces: '',
    nutri: n(182, 10.8, 2.4, 13.6, 1.5, 8.1, 4.6, 0.62),
    origin: [o('Œufs', 'p1'), o('Pain complet', 'p5'), o('Avocat', null, null, 'Espagne')],
    removable: ['Sésame', 'Piment d’Espelette'],
  },

  /* ---- LUNCH ---- */
  {
    id: 'chicken-rice-veg', cat: 'lunch', name: 'Poulet, riz & légumes rôtis', price: 10.9, weight: 400,
    img: '1532550907401-a500c9a57435', tags: ['bestseller'],
    short: 'Poulet grillé au citron, riz complet et légumes rôtis.',
    desc: 'Le grand classique des repas préparés : filet de poulet fermier mariné au citron et aux herbes, riz complet et légumes de saison rôtis au four.',
    ingredients: 'Filet de poulet 30 %, riz complet cuit 30 %, carottes, courgettes, poivrons, huile d’olive, citron, herbes fraîches, ail, sel, poivre.',
    allergens: [], traces: 'Préparé dans un atelier utilisant gluten, lait, œufs, fruits à coque, céleri, moutarde.',
    nutri: n(128, 3.4, 0.7, 14.2, 2.1, 9.6, 1.9, 0.48),
    origin: [o('Poulet', 'p1'), o('Courgettes', 'p2'), o('Carottes', 'p2'), o('Riz complet', null, 'Camargue'), o('Huile d’olive', null, null, 'Espagne')],
    removable: ['Poivrons', 'Ail'],
  },
  {
    id: 'salmon-quinoa', cat: 'lunch', name: 'Bol saumon & quinoa', price: 12.5, weight: 380,
    img: '1611599537845-1c7aca0091c0', tags: ['bestseller'],
    short: 'Saumon grillé, quinoa, avocat et tomates cerises.',
    desc: 'Pavé de saumon grillé, quinoa tricolore, avocat, tomates cerises et sauce yaourt-aneth servie à part.',
    ingredients: 'Saumon 28 % (poisson), quinoa cuit 30 %, avocat, tomates cerises, roquette, sauce yaourt-aneth (yaourt – lait, aneth, citron), huile d’olive, sel.',
    allergens: ['Poissons', 'Lait'], traces: '',
    nutri: n(156, 7.2, 1.3, 12.1, 1.8, 10.2, 2.4, 0.42),
    origin: [o('Saumon', null, null, 'Norvège'), o('Quinoa', null, 'Anjou'), o('Yaourt', 'p4'), o('Roquette', 'p2')],
    removable: ['Avocat', 'Roquette'],
  },
  {
    id: 'mediterranean-bowl', cat: 'lunch', name: 'Bol méditerranéen', price: 10.5, weight: 380,
    img: '1547592180-85f173990554', tags: ['vegetarian'],
    short: 'Boulgour, pois chiches rôtis, légumes grillés, houmous.',
    desc: 'Inspiré des saveurs méditerranéennes : boulgour aux herbes, pois chiches rôtis au cumin, légumes grillés, houmous et feta.',
    ingredients: 'Boulgour cuit (blé – gluten) 28 %, pois chiches, aubergines, poivrons, tomates, houmous (pois chiches, tahini – sésame, citron), feta (lait), persil, menthe, huile d’olive.',
    allergens: ['Gluten', 'Sésame', 'Lait'], traces: '',
    nutri: n(142, 6.8, 1.6, 15.0, 2.9, 5.1, 3.9, 0.55),
    origin: [o('Légumes grillés', 'p2'), o('Pois chiches', null, 'Occitanie'), o('Feta', null, null, 'Grèce'), o('Boulgour', null, null, 'Turquie')],
    removable: ['Feta', 'Menthe'],
  },
  {
    id: 'pesto-pasta', cat: 'lunch', name: 'Pâtes au pesto', price: 9.9, weight: 350,
    img: '1473093295043-cdd812d0e601', tags: ['vegetarian', 'bestseller'],
    short: 'Farfalle au pesto de basilic, tomates cerises et parmesan.',
    desc: 'Des farfalle al dente enrobées d’un pesto de basilic maison, tomates cerises, roquette et copeaux de parmesan.',
    ingredients: 'Farfalle cuites (blé dur – gluten) 55 %, pesto (basilic, huile d’olive, parmesan – lait, pignons, ail), tomates cerises, roquette, parmesan.',
    allergens: ['Gluten', 'Lait', 'Fruits à coque'], traces: '',
    nutri: n(178, 7.9, 1.8, 20.4, 2.2, 6.0, 2.0, 0.50),
    origin: [o('Pâtes', null, null, 'Italie'), o('Basilic', 'p2'), o('Tomates cerises', 'p2'), o('Parmesan', null, null, 'Italie')],
    removable: ['Roquette', 'Ail'],
  },
  {
    id: 'buddha-bowl', cat: 'lunch', name: 'Bol végétarien coloré', price: 9.9, weight: 380,
    img: '1512621776951-a57141f2eefd', tags: ['vegetarian'],
    short: 'Pois chiches, patate douce, avocat, chou rouge.',
    desc: 'Un bol coloré et complet : patate douce rôtie, pois chiches, avocat, chou rouge, radis et sauce tahini.',
    ingredients: 'Patate douce, pois chiches, avocat, chou rouge, radis, jeunes pousses, tomates, sauce tahini (sésame, citron), graines.',
    allergens: ['Sésame'], traces: '',
    nutri: n(126, 5.2, 0.8, 14.5, 4.0, 4.8, 4.5, 0.38),
    origin: [o('Chou rouge', 'p2'), o('Radis', 'p2'), o('Patate douce', null, null, 'Espagne'), o('Pois chiches', null, 'Occitanie')],
    removable: ['Radis', 'Avocat'],
  },
  {
    id: 'seasonal-bowl', cat: 'lunch', name: 'Bol de courge d’automne', price: 10.2, weight: 380,
    img: '1505576633757-0ac1084af824', tags: ['vegetarian', 'seasonal', 'new'], season: 'autumn',
    short: 'Courge rôtie, lentilles, chou kale et noisettes.',
    desc: 'Le bol de saison : courge butternut rôtie au four, lentilles vertes, chou kale massé, noisettes torréfiées et vinaigrette à l’érable.',
    ingredients: 'Courge butternut 35 %, lentilles vertes cuites, chou kale, carottes, noisettes (fruits à coque), vinaigrette (huile de colza, vinaigre de cidre, moutarde, sirop d’érable).',
    allergens: ['Fruits à coque', 'Moutarde'], traces: '',
    nutri: n(118, 4.6, 0.9, 14.8, 4.2, 4.1, 3.8, 0.40),
    origin: [o('Courge butternut', 'p2'), o('Chou kale', 'p2'), o('Carottes', 'p2'), o('Lentilles vertes', null, 'Auvergne'), o('Noisettes', null, 'Drôme')],
    removable: ['Noisettes'],
  },
  {
    id: 'creamy-chicken-bowl', cat: 'lunch', name: 'Bol poulet crémeux', price: 11.5, weight: 400,
    img: '1546069901-ba9599a7e63c', tags: ['bestseller'],
    short: 'Poulet, sauce crémeuse aux herbes, riz et légumes croquants.',
    desc: 'Poulet fermier émincé, sauce crémeuse aux herbes, riz, courgettes, carottes et crudités croquantes.',
    ingredients: 'Poulet 28 %, riz cuit 28 %, courgettes, carottes, sauce crémeuse (crème – lait, herbes, citron), maïs, chou rouge, œuf, sel, poivre.',
    allergens: ['Lait', 'Œufs'], traces: '',
    nutri: n(141, 5.4, 2.1, 12.8, 2.0, 10.1, 1.8, 0.52),
    origin: [o('Poulet', 'p1'), o('Courgettes', 'p2'), o('Carottes', 'p2'), o('Riz', null, null, 'Italie'), o('Herbes', 'p2'), o('Crème', 'p4')],
    removable: ['Œuf', 'Maïs'],
  },

  /* ---- DINNER ---- */
  {
    id: 'roast-chicken', cat: 'dinner', name: 'Poulet rôti & légumes grillés', price: 12.9, weight: 420,
    img: '1555939594-58d7cb561ad1', tags: ['bestseller'],
    short: 'Poulet fermier rôti, légumes grillés et pommes de terre.',
    desc: 'Cuisse de poulet fermier rôtie aux herbes de Provence, pommes de terre grenaille et légumes grillés.',
    ingredients: 'Poulet 35 %, pommes de terre, aubergines, poivrons, oignons, huile d’olive, herbes de Provence, ail, sel, poivre.',
    allergens: [], traces: '',
    nutri: n(115, 4.1, 1.0, 8.6, 3.1, 11.2, 2.3, 0.46),
    origin: [o('Poulet', 'p1'), o('Pommes de terre', 'p2'), o('Aubergines', null, null, 'Espagne')],
    removable: ['Oignons', 'Ail'],
  },
  {
    id: 'salmon-squash', cat: 'dinner', name: 'Saumon & écrasé de courge', price: 13.9, weight: 400,
    img: '1467003909585-2f8a72700288', tags: ['seasonal'], season: 'autumn',
    short: 'Pavé de saumon, écrasé de courge et légumes verts.',
    desc: 'Pavé de saumon rôti, écrasé de courge muscade au beurre noisette et poêlée de légumes verts.',
    ingredients: 'Saumon 30 % (poisson), courge muscade, haricots verts, beurre (lait), citron, aneth, sel, poivre.',
    allergens: ['Poissons', 'Lait'], traces: '',
    nutri: n(132, 6.9, 1.4, 8.2, 3.0, 9.3, 1.9, 0.38),
    origin: [o('Saumon', null, null, 'Norvège'), o('Courge muscade', 'p2'), o('Beurre', 'p4')],
    removable: [],
  },
  {
    id: 'lasagna', cat: 'dinner', name: 'Lasagnes maison', price: 11.9, weight: 400,
    img: '1619895092538-128341789043', tags: ['bestseller'],
    short: 'Lasagnes bolognaises gratinées, recette maison.',
    desc: 'Nos lasagnes préparées comme à la maison : sauce bolognaise mijotée, béchamel et gratin de parmesan.',
    ingredients: 'Pâtes à lasagne (blé – gluten, œufs), viande de bœuf 20 %, tomates, béchamel (lait, beurre, farine – gluten), parmesan (lait), oignons, carottes, céleri, vin rouge (sulfites), herbes.',
    allergens: ['Gluten', 'Œufs', 'Lait', 'Céleri', 'Sulfites'], traces: '',
    nutri: n(152, 6.8, 3.2, 13.4, 3.6, 8.9, 1.5, 0.68),
    origin: [o('Bœuf', null, 'Charolais'), o('Carottes', 'p2'), o('Lait', 'p4'), o('Tomates', null, null, 'Italie')],
    removable: [],
  },
  {
    id: 'veggie-curry', cat: 'dinner', name: 'Curry de légumes', price: 10.5, weight: 400,
    img: '1455619452474-d2be8b1e70cd', tags: ['vegetarian'],
    short: 'Curry doux au lait de coco, légumes et riz basmati.',
    desc: 'Un curry rouge doux et parfumé au lait de coco, patate douce, pois chiches, épinards, servi avec riz basmati.',
    ingredients: 'Riz basmati cuit 30 %, lait de coco, patate douce, pois chiches, tomates, épinards, oignons, pâte de curry, gingembre, coriandre.',
    allergens: [], traces: 'Peut contenir des traces de céleri et de moutarde.',
    nutri: n(108, 4.9, 2.8, 12.6, 3.4, 3.2, 3.1, 0.52),
    origin: [o('Épinards', 'p2'), o('Oignons', 'p2'), o('Riz basmati', null, null, 'Inde'), o('Lait de coco', null, null, 'Sri Lanka')],
    removable: ['Coriandre', 'Oignons'],
  },
  {
    id: 'chicken-mushrooms', cat: 'dinner', name: 'Poulet & champignons', price: 12.5, weight: 400,
    img: '1504545102780-26774c1bb073', tags: ['seasonal'], season: 'autumn',
    short: 'Poulet fermier, sauce aux champignons, tagliatelles.',
    desc: 'Émincé de poulet fermier, sauce crémeuse aux champignons des Monts du Lyonnais, tagliatelles fraîches.',
    ingredients: 'Tagliatelles (blé – gluten, œufs), poulet 25 %, champignons 20 %, crème (lait), échalotes, persil, sel, poivre.',
    allergens: ['Gluten', 'Œufs', 'Lait'], traces: '',
    nutri: n(122, 4.8, 2.0, 9.4, 1.5, 10.6, 1.4, 0.55),
    origin: [o('Poulet', 'p1'), o('Champignons', 'p6'), o('Crème', 'p4'), o('Tagliatelles', null, null, 'Italie')],
    removable: ['Persil'],
  },
  {
    id: 'salmon-coconut-curry', cat: 'dinner', name: 'Curry de saumon coco', price: 13.5, weight: 400,
    img: '1574484284002-952d92456975', tags: ['new'],
    short: 'Saumon mijoté dans un curry coco-citron vert.',
    desc: 'Saumon mijoté dans une sauce coco, citron vert et curcuma, avec riz jasmin et coriandre fraîche.',
    ingredients: 'Riz jasmin cuit, saumon 25 % (poisson), lait de coco, tomates, citron vert, curcuma, gingembre, coriandre, sel.',
    allergens: ['Poissons'], traces: '',
    nutri: n(148, 8.2, 4.1, 9.8, 2.2, 8.8, 1.2, 0.58),
    origin: [o('Saumon', null, null, 'Norvège'), o('Riz jasmin', null, null, 'Thaïlande'), o('Coriandre', 'p2')],
    removable: ['Coriandre'],
  },
  {
    id: 'beef-meatballs', cat: 'dinner', name: 'Boulettes de bœuf & roquette', price: 11.5, weight: 400,
    img: '1529042410759-befb1204b468', tags: [],
    short: 'Boulettes de bœuf aux herbes, sauce tomate et semoule.',
    desc: 'Boulettes de bœuf charolais aux herbes, sauce tomate maison, semoule fine et roquette.',
    ingredients: 'Bœuf 30 %, semoule (blé – gluten), sauce tomate, roquette, œuf, chapelure (gluten), oignons, persil, épices, sel.',
    allergens: ['Gluten', 'Œufs'], traces: '',
    nutri: n(158, 8.1, 3.0, 10.2, 3.8, 10.8, 1.9, 0.72),
    origin: [o('Bœuf', null, 'Charolais'), o('Roquette', 'p2'), o('Œufs', 'p1')],
    removable: ['Roquette', 'Oignons'],
  },

  /* ---- SNACKS ---- */
  {
    id: 'energy-balls', cat: 'snack', name: 'Bouchées énergie cacao-dattes (x4)', price: 3.5, weight: 100,
    img: '1599599810769-bcde5a160d32', tags: ['vegetarian', 'bestseller'],
    short: 'Dattes, noix de cajou, cacao cru.',
    desc: 'Quatre bouchées énergétiques aux dattes, noix de cajou et cacao. Parfait pour une pause entre deux réunions.',
    ingredients: 'Dattes 45 %, noix de cajou 30 %, cacao 10 %, flocons d’avoine (gluten), huile de coco, fleur de sel.',
    allergens: ['Fruits à coque', 'Gluten'], traces: 'Peut contenir des traces d’arachides.',
    nutri: n(410, 18.5, 4.2, 48.0, 36.0, 9.4, 7.0, 0.02),
    origin: [o('Dattes', null, null, 'Tunisie'), o('Noix de cajou', null, null, 'Vietnam'), o('Cacao', null, null, 'Pérou')],
    removable: [],
  },
  {
    id: 'homemade-granola', cat: 'snack', name: 'Granola maison (150 g)', price: 4.2, weight: 150,
    img: '1517673400267-0251440c45dc', tags: ['vegetarian'],
    short: 'Granola maison aux noisettes et au miel.',
    desc: 'Notre granola maison, cuit au four en petites quantités : avoine, noisettes, graines et miel.',
    ingredients: 'Flocons d’avoine (gluten) 55 %, noisettes 15 %, miel, huile de colza, graines de courge, graines de tournesol, cannelle.',
    allergens: ['Gluten', 'Fruits à coque'], traces: 'Peut contenir des traces de sésame.',
    nutri: n(452, 18.0, 3.5, 58.0, 18.0, 10.5, 7.4, 0.10),
    origin: [o('Flocons d’avoine', 'p5'), o('Noisettes', null, 'Drôme'), o('Miel', null, 'Ardèche')],
    removable: [],
  },
  {
    id: 'fresh-fruits', cat: 'snack', name: 'Fruits frais de saison', price: 3.2, weight: 200,
    img: '1490818387583-1baba5e638af', tags: ['vegetarian', 'seasonal'], season: 'autumn',
    short: 'Pommes, poires et raisins coupés.',
    desc: 'Une sélection de fruits frais de saison, lavés et coupés.',
    ingredients: 'Pommes, poires, raisins, jus de citron.',
    allergens: [], traces: '',
    nutri: n(52, 0.2, 0, 11.0, 10.0, 0.7, 2.0, 0),
    origin: [o('Pommes', 'p3'), o('Poires', 'p3'), o('Raisins', null, 'Drôme')],
    removable: [],
  },
  {
    id: 'nut-mix', cat: 'snack', name: 'Mix noix & fruits secs', price: 2.9, weight: 60,
    img: '1606787366850-de6330128bfc', tags: ['vegetarian'],
    short: 'Amandes, noix, cranberries et abricots secs.',
    desc: 'Un mélange de noix et fruits secs, non salé, à glisser dans son sac.',
    ingredients: 'Amandes, noix, noisettes, cranberries séchées, abricots secs (sulfites).',
    allergens: ['Fruits à coque', 'Sulfites'], traces: 'Peut contenir des traces d’arachides.',
    nutri: n(545, 42.0, 4.8, 22.0, 18.0, 16.0, 7.2, 0.02),
    origin: [o('Noix', null, 'Isère'), o('Amandes', null, null, 'Espagne'), o('Abricots secs', null, null, 'Turquie')],
    removable: [],
  },

  /* ---- DESSERTS ---- */
  {
    id: 'raspberry-cake', cat: 'dessert', name: 'Gâteau étagé à la framboise', price: 4.5, weight: 120,
    img: '1565958011703-44f9829ba187', tags: ['vegetarian', 'new'],
    short: 'Génoise légère, crème vanille et framboises.',
    desc: 'Un dessert individuel en couches : génoise moelleuse, crème légère à la vanille et framboises fraîches.',
    ingredients: 'Crème (lait), framboises 20 %, farine de blé (gluten), œufs, sucre, beurre (lait), vanille.',
    allergens: ['Lait', 'Gluten', 'Œufs'], traces: 'Peut contenir des traces de fruits à coque.',
    nutri: n(298, 14.5, 8.3, 36.2, 24.5, 4.6, 1.2, 0.18),
    origin: [o('Framboises', 'p3'), o('Crème', 'p4'), o('Œufs', 'p1'), o('Farine', 'p5')],
    removable: [],
  },
  {
    id: 'chocolate-mousse', cat: 'dessert', name: 'Mousse au chocolat & crumble', price: 4.2, weight: 120,
    img: '1563805042-7684c019e1cb', tags: ['vegetarian', 'bestseller'],
    short: 'Mousse chocolat noir, crumble cacao.',
    desc: 'Une mousse au chocolat noir aérienne, éclats de biscuit cacao et chantilly légère.',
    ingredients: 'Chocolat noir 35 % (cacao, sucre, lécithine de soja), crème (lait), œufs, biscuit cacao (farine de blé – gluten, beurre – lait, sucre).',
    allergens: ['Lait', 'Œufs', 'Soja', 'Gluten'], traces: 'Peut contenir des traces de fruits à coque.',
    nutri: n(262, 16.0, 9.4, 23.8, 20.0, 5.1, 2.8, 0.06),
    origin: [o('Crème', 'p4'), o('Œufs', 'p1'), o('Chocolat', null, null, 'Équateur')],
    removable: [],
  },
  {
    id: 'cookies', cat: 'dessert', name: 'Cookies maison (x2)', price: 3.2, weight: 100,
    img: '1558961363-fa8fdf82db35', tags: ['vegetarian'],
    short: 'Cookies aux pépites de chocolat, cœur fondant.',
    desc: 'Deux cookies généreux aux pépites de chocolat noir, croustillants à l’extérieur et fondants à cœur.',
    ingredients: 'Farine de blé (gluten), chocolat noir 25 % (soja), beurre (lait), sucre de canne, œufs, fleur de sel, poudre à lever.',
    allergens: ['Gluten', 'Lait', 'Œufs', 'Soja'], traces: 'Peut contenir des traces de fruits à coque.',
    nutri: n(468, 22.5, 12.0, 60.0, 32.0, 5.6, 2.4, 0.62),
    origin: [o('Farine', 'p5'), o('Beurre', 'p4'), o('Œufs', 'p1')],
    removable: [],
  },
];

/* Conservation & préparation par catégorie */
const STORAGE_DEFAULTS = {
  breakfast: { temp: 'Entre 0 °C et 4 °C', after: 'À consommer dans les 24 h après ouverture.', freeze: 'Congélation non recommandée.' },
  lunch: { temp: 'Entre 0 °C et 4 °C', after: 'À consommer dans les 24 h après ouverture.', freeze: 'Congélation possible jusqu’à 1 mois, dans son emballage fermé.' },
  dinner: { temp: 'Entre 0 °C et 4 °C', after: 'À consommer dans les 24 h après ouverture.', freeze: 'Congélation possible jusqu’à 1 mois, dans son emballage fermé.' },
  snack: { temp: 'À conserver au frais et au sec', after: 'À consommer dans les 3 jours après ouverture.', freeze: 'Congélation non recommandée.' },
  dessert: { temp: 'Entre 0 °C et 4 °C', after: 'À consommer dans les 24 h après ouverture.', freeze: 'Congélation non recommandée.' },
};
const PREP_DEFAULTS = {
  breakfast: { method: 'À déguster froid, directement à la sortie du réfrigérateur.', time: '—', power: '—', pack: 'Retirer l’opercule avant dégustation.', tip: 'Mélanger avant de déguster pour bien répartir les toppings.' },
  lunch: { method: 'Micro-ondes ou poêle.', time: 'Micro-ondes : 2 min 30, mélanger, puis 1 min. Poêle : 5–6 min à feu moyen.', power: '800 W', pack: 'Entrouvrir l’opercule avant réchauffage. Retirer les sauces et crudités à part.', tip: 'Laisser reposer 1 minute avant de déguster.' },
  dinner: { method: 'Micro-ondes ou four.', time: 'Micro-ondes : 3 min, mélanger, puis 1 min. Four : 15 min à 180 °C dans un plat adapté.', power: '800 W', pack: 'Entrouvrir l’opercule. Ne pas passer la barquette au four traditionnel.', tip: 'Un filet d’huile d’olive ou d’herbes fraîches au moment de servir.' },
  snack: { method: 'Prêt à consommer.', time: '—', power: '—', pack: 'Refermer le sachet après ouverture.', tip: 'Idéal en milieu de matinée ou d’après-midi.' },
  dessert: { method: 'À déguster frais.', time: '—', power: '—', pack: 'Retirer l’opercule avant dégustation.', tip: 'Sortir du réfrigérateur 5 minutes avant pour plus de gourmandise.' },
};

/* ---------- Options de personnalisation (configurables) ---------- */
const OPTIONS = {
  main: {
    portion: [{ id: 'classic', label: 'Classique', price: 0 }, { id: 'generous', label: 'Généreuse (+30 %)', price: 2.9 }],
    sides: [{ id: 'none', label: 'Aucun', price: 0 }, { id: 'rice', label: 'Riz complet', price: 2.0 }, { id: 'quinoa', label: 'Quinoa', price: 2.0 }, { id: 'veg', label: 'Légumes rôtis', price: 2.5 }],
    extraProtein: 2.5,
  },
  breakfast: {
    toppings: [{ id: 'none', label: 'Aucun', price: 0 }, { id: 'fruits', label: 'Fruits frais', price: 1.0 }, { id: 'granola', label: 'Granola maison', price: 0.9 }, { id: 'pb', label: 'Beurre de cacahuète (arachides)', price: 0.8 }],
  },
};

/* ---------- Meal Formulas ---------- */
const FORMULAS = [
  { id: 'box-petit-dejeuner', name: 'Box Petit-déjeuner', img: IMG.breakfastSpread, slots: [['breakfast', 5]], discount: 0.10, portions: 5,
    desc: '5 petits-déjeuners au choix pour bien démarrer la semaine.',
    defaults: ['overnight-oats', 'greek-yogurt-bowl', 'chia-pudding', 'granola-bowl', 'egg-avocado-box'] },
  { id: 'box-dejeuner', name: 'Box Déjeuner', img: '1546069901-ba9599a7e63c', slots: [['lunch', 5]], discount: 0.10, portions: 5,
    desc: '5 déjeuners pour la semaine de travail, au bureau ou à la maison.',
    defaults: ['chicken-rice-veg', 'salmon-quinoa', 'mediterranean-bowl', 'pesto-pasta', 'creamy-chicken-bowl'] },
  { id: 'box-diner', name: 'Box Dîner', img: '1619895092538-128341789043', slots: [['dinner', 5]], discount: 0.10, portions: 5,
    desc: '5 dîners réconfortants, prêts en 3 minutes.',
    defaults: ['roast-chicken', 'salmon-squash', 'lasagna', 'veggie-curry', 'chicken-mushrooms'] },
  { id: 'box-journee-complete', name: 'Box Journée complète', img: IMG.spread, slots: [['breakfast', 5], ['lunch', 5], ['dinner', 5]], discount: 0.14, portions: 15,
    desc: 'Petit-déjeuner, déjeuner et dîner pendant 5 jours : 15 repas.',
    defaults: ['overnight-oats', 'greek-yogurt-bowl', 'chia-pudding', 'granola-bowl', 'egg-avocado-box', 'chicken-rice-veg', 'salmon-quinoa', 'mediterranean-bowl', 'pesto-pasta', 'creamy-chicken-bowl', 'roast-chicken', 'salmon-squash', 'lasagna', 'veggie-curry', 'chicken-mushrooms'] },
];

/* ---------- Discovery Boxes ---------- */
const DISCOVERY = [
  { id: 'decouverte-petit-dejeuner', name: 'Box découverte Petit-déjeuner', img: IMG.breakfastSpread, price: 24.9,
    desc: 'Six petits-déjeuners pour trouver votre favori.',
    items: ['overnight-oats', 'greek-yogurt-bowl', 'chia-pudding', 'breakfast-muffins', 'banana-bread', 'granola-bowl'] },
  { id: 'decouverte-mediterranee', name: 'Box découverte Méditerranée', img: '1547592180-85f173990554', price: 54.9,
    desc: 'Les saveurs du sud : herbes, huile d’olive, légumes grillés.',
    items: ['mediterranean-bowl', 'pesto-pasta', 'salmon-quinoa', 'roast-chicken', 'beef-meatballs', 'chocolate-mousse'] },
  { id: 'decouverte-vegetarienne', name: 'Box découverte Végétarienne', img: '1512621776951-a57141f2eefd', price: 49.9,
    desc: 'Six recettes végétariennes gourmandes et complètes.',
    items: ['mediterranean-bowl', 'pesto-pasta', 'buddha-bowl', 'seasonal-bowl', 'veggie-curry', 'energy-balls'] },
  { id: 'decouverte-saison', name: 'Box découverte de saison — Automne', img: IMG.pumpkin, price: 46.9,
    desc: 'Le meilleur de l’automne : courges, champignons, poires.',
    items: ['seasonal-bowl', 'salmon-squash', 'chicken-mushrooms', 'fresh-fruits', 'homemade-granola'] },
];

/* ---------- Saisons ---------- */
const SEASONS = {
  spring: { name: 'Printemps', months: 'Mars – Mai', img: IMG.asparagus, ingredients: ['Asperges', 'Petits pois', 'Fraises', 'Légumes verts', 'Radis'], text: 'Le retour des légumes verts croquants et des premières fraises.' },
  summer: { name: 'Été', months: 'Juin – Août', img: IMG.tomatoes, ingredients: ['Tomates', 'Courgettes', 'Aubergines', 'Fruits frais', 'Basilic'], text: 'Des recettes fraîches et colorées, gorgées de soleil.' },
  autumn: { name: 'Automne', months: 'Septembre – Novembre', img: IMG.pumpkin, ingredients: ['Courges', 'Champignons', 'Poires', 'Légumes racines', 'Noisettes'], text: 'Des plats réconfortants autour des courges rôties et des champignons des Monts du Lyonnais.', producers: ['p2', 'p6', 'p3'] },
  winter: { name: 'Hiver', months: 'Décembre – Février', img: IMG.cabbage, ingredients: ['Choux', 'Carottes', 'Poireaux', 'Courges', 'Agrumes'], text: 'Des recettes mijotées et généreuses pour l’hiver.' },
};
let CURRENT_SEASON = (() => {
  const m = new Date().getMonth();
  return m >= 2 && m <= 4 ? 'spring' : m >= 5 && m <= 7 ? 'summer' : m >= 8 && m <= 10 ? 'autumn' : 'winter';
})();

/* ---------- The Club Membership (tarifs justifiés dans strategie.html) ---------- */
const MEMBERSHIPS = [
  { id: 'essential', name: 'Essentiel', price: 4.99, discount: 0.05, freeDelivery: false,
    perks: ['−5 % sur toutes les commandes', 'Points fidélité ×1,5', 'Lettre d’information réservée aux membres'] },
  { id: 'plus', name: 'Plus', price: 9.99, discount: 0.10, freeDelivery: false, featured: true,
    perks: ['−10 % sur toutes les commandes', 'Points fidélité ×2', 'Accès anticipé aux nouveautés et collections', '1 dessert offert par mois'] },
  { id: 'premium', name: 'Premium', price: 14.99, discount: 0.15, freeDelivery: true,
    perks: ['−15 % sur toutes les commandes', 'Livraison offerte (dès 30 € d’achat)', 'Points fidélité ×2', 'Accès anticipé + recettes en avant-première', 'Service client prioritaire'] },
];

/* ---------- Build Your Own Box — règles configurables par l'administrateur ---------- */
const BOX_RULES = {
  minItems: 5,
  maxItems: 21,
  tiers: [{ min: 5, pct: 0.05 }, { min: 10, pct: 0.08 }, { min: 15, pct: 0.12 }],
  types: [
    { id: 'free', name: 'Composition libre', desc: 'Tous les produits de la carte.', cats: ['breakfast', 'lunch', 'dinner', 'snack', 'dessert'], img: IMG.spread },
    { id: 'breakfast', name: 'Box Petit-déjeuner', desc: 'Petits-déjeuners et en-cas.', cats: ['breakfast', 'snack'], img: IMG.breakfastSpread },
    { id: 'meals', name: 'Box Déjeuner & Dîner', desc: 'Déjeuners et dîners uniquement.', cats: ['lunch', 'dinner'], img: '1546069901-ba9599a7e63c' },
    { id: 'sweet', name: 'Box En-cas & Desserts', desc: 'Pour les pauses gourmandes.', cats: ['snack', 'dessert'], img: '1563805042-7684c019e1cb' },
  ],
};

/* ---------- Livraison ---------- */
const DELIVERY = {
  homeFee: 4.9,
  freeFrom: 60,
  premiumFreeFrom: 30,
  zones: ['69001', '69002', '69003', '69004', '69005', '69006', '69007', '69008', '69009', '69100', '69300', '69130', '69160', '69500', '69600', '69110', '69120', '69200', '69410'],
  homeSlots: ['11:30 – 13:30', '18:00 – 20:00', '20:00 – 22:00'],
  pickupSlots: ['11:00 – 13:00', '17:00 – 19:30'],
  pickupPoints: [
    { id: 'gerland', name: 'L’Atelier PREP CLUB — Gerland', address: '24 rue de Gerland, 69007 Lyon' },
    { id: 'partdieu', name: 'Point de retrait — Coworking Part-Dieu', address: '12 boulevard Vivier-Merle, 69003 Lyon' },
    { id: 'croixrousse', name: 'Point de retrait — Croix-Rousse', address: '5 place de la Croix-Rousse, 69004 Lyon' },
  ],
};

/* ---------- Fidélité ---------- */
const REWARDS = [
  { id: 'r1', points: 100, label: '5 € de réduction', type: 'amount', value: 5 },
  { id: 'r2', points: 150, label: 'Un dessert offert', type: 'amount', value: 4.5 },
  { id: 'r3', points: 250, label: '12 € de réduction', type: 'amount', value: 12 },
  { id: 'r4', points: 400, label: 'Une Box découverte Petit-déjeuner offerte', type: 'amount', value: 24.9 },
];

const PROMO_CODES = {
  BIENVENUE10: { label: 'Bienvenue −10 %', pct: 0.10 },
  PREPSEMAINE: { label: 'La Prep de la Semaine −5 %', pct: 0.05 },
};
