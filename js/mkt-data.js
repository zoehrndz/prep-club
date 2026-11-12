/* =========================================================================
   PREP CLUB — Marketing Studio : contenus de la stratégie
   Réutilise le catalogue de js/data.js (PRODUCTS, PRODUCERS, IMG, SEASONS…).
   Objectifs chiffrés, budgets et profils d'influenceurs sont des PROPOSITIONS
   ou des EXEMPLES proposés par l'équipe (projet étudiant).
   ========================================================================= */
'use strict';

const MK = {};

MK.brand = {
  name: 'PREP CLUB',
  signature: 'Your week, prepared.',
  signatureFr: 'Votre semaine, préparée.',
  promise: 'Make your week easier. Enjoy your meals. Stay flexible.',
  zone: 'Lyon et sa métropole',
  handle: '@prepclub.lyon',
  principles: [
    { name: 'Ready to use', text: 'Les contenus sont préparés, rédigés, illustrés et organisés à l’avance.' },
    { name: 'Easy to manage', text: 'Toutes les actions marketing se retrouvent au même endroit.' },
    { name: 'Automated when possible', text: 'Publications, newsletters, campagnes et rapports sont programmés dès que les plateformes connectées le permettent.' },
  ],
};

/* ---------- 1.2 Objectifs (cibles proposées, à ajuster) ---------- */
MK.objectives = [
  { id: 'o1', name: 'Faire connaître PREP CLUB à Lyon', kpi: 'Abonnés Instagram + TikTok', m3: '1 500', m6: '4 000', m12: '10 000', source: 'Meta Business Suite, TikTok Studio' },
  { id: 'o2', name: 'Générer du trafic vers le site', kpi: 'Sessions / mois issues des réseaux', m3: '2 000', m6: '5 000', m12: '12 000', source: 'Google Analytics 4 (UTM)' },
  { id: 'o3', name: 'Convertir les visiteurs en clients', kpi: 'Taux de conversion du site', m3: '1,5 %', m6: '2 %', m12: '2,5 %', source: 'GA4 + back-office' },
  { id: 'o4', name: 'Développer la carte et les formules', kpi: 'Panier moyen', m3: '32 €', m6: '35 €', m12: '38 €', source: 'Back-office commandes' },
  { id: 'o5', name: 'Encourager le Weekly Planner', kpi: 'Part des commandes passées via le planning', m3: '15 %', m6: '25 %', m12: '30 %', source: 'Back-office commandes' },
  { id: 'o6', name: 'Développer les abonnements facultatifs', kpi: 'Membres Club actifs', m3: '25', m6: '60', m12: '150', source: 'Back-office abonnements' },
  { id: 'o7', name: 'Fidéliser les clients', kpi: 'Taux de réachat à 30 jours', m3: '25 %', m6: '35 %', m12: '40 %', source: 'CRM' },
  { id: 'o8', name: 'Développer la communauté', kpi: 'Taux d’engagement moyen Instagram', m3: '4 %', m6: '4,5 %', m12: '5 %', source: 'Meta Business Suite' },
  { id: 'o9', name: 'Valoriser recettes et producteurs', kpi: 'Contenus producteurs publiés / mois', m3: '1', m6: '2', m12: '2', source: 'Content Calendar' },
  { id: 'o10', name: 'Automatiser les tâches répétitives', kpi: 'Part des envois programmés ou automatisés', m3: '50 %', m6: '70 %', m12: '80 %', source: 'Marketing Automation' },
  { id: 'o11', name: 'Mesurer chaque action', kpi: 'Bilan marketing mensuel produit', m3: '3', m6: '6', m12: '12', source: 'Analytics & Reports' },
];

/* ---------- 2. Positionnement ---------- */
MK.positioning = {
  statement: 'PREP CLUB est une marque de meal prep premium, moderne et flexible, qui facilite l’organisation des repas du quotidien à Lyon.',
  notThis: ['Un simple service de livraison de repas', 'Une marque « healthy » de plus', 'Un abonnement contraignant'],
  butThis: 'Une solution complète d’organisation alimentaire : choisir, planifier, recevoir, savoir ce que l’on mange.',
  value: [
    ['Gagner du temps', 'Les repas de la semaine sont prêts, il n’y a plus qu’à réchauffer.'],
    ['Organiser ses repas à l’avance', 'Le Weekly Planner répartit petits-déjeuners, déjeuners, dîners et en-cas sur 7 jours.'],
    ['Choisir librement', 'À la carte, en formule ou en box à composer.'],
    ['Composer ses propres box', 'Build Your Own Box en 4 étapes, prix en temps réel.'],
    ['Découvrir de nouvelles recettes', 'Collections de saison et box découverte.'],
    ['Connaître la nutrition', 'Valeurs pour 100 g et par portion, allergènes visibles.'],
    ['Connaître la provenance', 'Chaque ingrédient clé est relié à son producteur.'],
    ['Commander sans abonnement', 'Le Club reste une option, jamais une obligation.'],
  ],
};

/* ---------- 2.3 Les quatre piliers de communication ---------- */
MK.pillars = [
  { id: 'flex', name: 'Flexibility', fr: 'Flexibilité', goal: 'Montrer que PREP CLUB s’adapte aux besoins de chacun.',
    messages: ['Order exactly what you need.', 'Your meals, your way.', 'No subscription required.', 'Build your own week.'],
    proof: 'Carte, formules, box à composer et planning, tous sans engagement.', check: null },
  { id: 'quality', name: 'Quality', fr: 'Qualité', goal: 'Valoriser les recettes, les ingrédients et le travail de préparation.',
    messages: ['Carefully selected ingredients.', 'Freshly prepared meals.', 'Simple ingredients, delicious recipes.'],
    proof: 'Fiches recettes, coulisses de l’atelier de Gerland.', check: 'Allégations de fraîcheur, de qualité et de méthode de préparation à vérifier avant publication.' },
  { id: 'transp', name: 'Transparency', fr: 'Transparence', goal: 'Mettre en avant nutrition, ingrédients, allergènes et origines.',
    messages: ['Know what you eat.', 'Every ingredient has a story.', 'Nutrition made transparent.'],
    proof: 'Fiches nutritionnelles et allergènes sur chaque produit.', check: 'Valeurs nutritionnelles issues des recettes standardisées uniquement.' },
  { id: 'local', name: 'Locality', fr: 'Ancrage local', goal: 'Valoriser les producteurs partenaires et les ingrédients régionaux.',
    messages: ['Meet the people behind your food.', 'Discover our local partners.', 'Seasonal ingredients, thoughtfully selected.'],
    proof: 'Six producteurs partenaires entre 15 et 45 km de Lyon.', check: 'Mentions de producteurs, d’origine et de méthodes de production à documenter (factures, attestations).' },
];

/* ---------- 3. Personas ---------- */
MK.personas = [
  { id: 'busy', name: 'The Busy Professional', fr: 'Le professionnel pressé', age: '25–35 ans', initials: 'BP',
    profile: 'Actif, emploi du temps chargé, travaille à la Part-Dieu ou à Gerland.',
    needs: ['Gagner du temps', 'Organiser ses déjeuners', 'Éviter de cuisiner chaque soir', 'Commander rapidement'],
    messages: ['Your week, sorted.', 'Less planning. More enjoying.', 'Lunch is taken care of.'],
    products: ['Lunch Box', 'Full Day Box', 'Weekly Planner', 'À la carte'],
    channels: 'Instagram Stories le midi, TikTok le soir, newsletter du dimanche',
    objection: '« C’est plus cher que de cuisiner moi-même. » → Mettre en avant le temps gagné et le prix par repas.' },
  { id: 'food', name: 'The Food & Lifestyle Lover', fr: 'L’amateur de food & lifestyle', age: '22–35 ans', initials: 'FL',
    profile: 'Sensible à l’esthétique, aux tendances food et aux découvertes culinaires.',
    needs: ['Découvrir de nouvelles recettes', 'Tester des produits de saison', 'Connaître les ingrédients', 'Une expérience de marque agréable'],
    messages: ['Discover your next favourite meal.', 'A new season, a new menu.', 'Good food, thoughtfully prepared.'],
    products: ['Seasonal Collection', 'Discovery Boxes', 'Bestsellers', 'Snacks & Desserts'],
    channels: 'Reels, carrousels, Pinterest, collaborations avec des créateurs food',
    objection: '« Les plats préparés manquent de goût. » → Montrer les recettes, les textures, les coulisses.' },
  { id: 'planner', name: 'The Organized Planner', fr: 'L’organisé', age: '28–40 ans', initials: 'OP',
    profile: 'Aime anticiper, organise sa semaine dès le dimanche.',
    needs: ['Prévoir les repas', 'Composer une sélection personnalisée', 'Gérer plusieurs commandes', 'Retrouver ses favoris'],
    messages: ['Plan your week in one place.', 'Your meals, already organized.', 'Build a routine that works for you.'],
    products: ['Weekly Planner', 'Build Your Own Box', 'Club Membership'],
    channels: 'The Weekly Prep (dimanche), carrousels « exemple de semaine », Pinterest',
    objection: '« Je ne veux pas m’engager. » → Rappeler que l’abonnement est facultatif et résiliable.' },
  { id: 'local', name: 'The Local & Conscious Consumer', fr: 'Le consommateur local et engagé', age: '25–40 ans', initials: 'LC',
    profile: 'Sensible à la provenance, à la saisonnalité et à la transparence alimentaire.',
    needs: ['Identifier les producteurs', 'Connaître les ingrédients', 'Découvrir les produits de saison', 'Comprendre la composition des recettes'],
    messages: ['Know where your food comes from.', 'Meet our producers.', 'Discover what’s in season.'],
    products: ['Collection de saison', 'Box découverte de saison', 'Page Nos producteurs'],
    channels: 'Portraits de producteurs, articles de blog, newsletter (rubrique Producer Spotlight)',
    objection: '« Le local, c’est du marketing. » → Nommer les fermes, les distances, montrer les visites.' },
];

/* ---------- 4. Canaux ---------- */
MK.channels = [
  { id: 'instagram', name: 'Instagram', role: 'Canal principal de communication visuelle',
    goals: ['Construire une identité reconnaissable', 'Présenter les plats', 'Générer du trafic', 'Développer une communauté', 'Promouvoir les nouveautés'],
    formats: ['Publications simples', 'Carrousels', 'Reels', 'Stories', 'Stories à la une'],
    rhythm: [['Publications', '3 / semaine'], ['Reels', '2 / semaine'], ['Stories', '4 à 6 jours / semaine'], ['Stories interactives', '1 / semaine minimum']],
    kpi: 'Portée, engagement, clics sur le lien en bio, enregistrements' },
  { id: 'tiktok', name: 'TikTok', role: 'Visibilité par la vidéo courte et naturelle',
    goals: ['Toucher une audience nouvelle', 'Humaniser la marque', 'Montrer les coulisses'],
    formats: ['Meal prep routines', 'Préparation des plats', 'Packaging des commandes', 'Weekly meal planning', 'Producteurs'],
    rhythm: [['Vidéos', '3 / semaine au lancement'], ['Ajustement', 'selon les résultats à M+2']],
    kpi: 'Vues, durée de visionnage, partages, abonnés' },
  { id: 'pinterest', name: 'Pinterest', role: 'Trafic à long terme et inspiration',
    goals: ['Capter les recherches d’inspiration', 'Générer du trafic durable'],
    formats: ['Meal prep inspiration', 'Weekly meal planning', 'Healthy breakfast ideas', 'Lunch box inspiration', 'Recettes de saison'],
    rhythm: [['Épingles', '3 à 5 / semaine'], ['Source', 'créations Instagram recadrées en 2:3']],
    kpi: 'Impressions, clics sortants, enregistrements' },
  { id: 'email', name: 'E-mail — The Weekly Prep', role: 'Fidélisation et commandes répétées',
    goals: ['Annoncer le menu', 'Déclencher la commande du dimanche', 'Fidéliser'],
    formats: ['Newsletter hebdomadaire', 'Campagnes nouveautés', 'Flux automatisés'],
    rhythm: [['Newsletter', 'chaque dimanche, 9 h'], ['Campagnes', 'selon le calendrier'], ['Automatisations', 'en continu']],
    kpi: 'Taux d’ouverture, taux de clic, commandes attribuées' },
  { id: 'seo', name: 'Référencement naturel', role: 'Visibilité locale et organique',
    goals: ['Être trouvé sur « meal prep Lyon »', 'Répondre aux vraies questions', 'Alimenter le blog'],
    formats: ['Pages optimisées', 'Articles de blog', 'Fiche Google Business Profile'],
    rhythm: [['Articles', '2 / mois'], ['Mise à jour', 'à chaque collection']],
    kpi: 'Positions, clics organiques, avis Google' },
];

/* ---------- 5. Piliers éditoriaux ---------- */
MK.editorial = [
  { id: 'product', name: 'Product Focus', fr: 'Produits & recettes', share: 30, goal: 'Conversion', color: '#5C6B3C', ex: 'Plat de la semaine, bestsellers, fiches nutrition' },
  { id: 'planning', name: 'Meal Planning', fr: 'Organisation de la semaine', share: 20, goal: 'Engagement', color: '#8A9A5B', ex: 'Exemples de semaines, astuces, démonstration du planning' },
  { id: 'bts', name: 'Behind the Scenes', fr: 'Coulisses', share: 15, goal: 'Confiance', color: '#8A7B6A', ex: 'Atelier, préparation, emballage des commandes' },
  { id: 'seasonal', name: 'Seasonal & Local', fr: 'Saisons & producteurs', share: 15, goal: 'Différenciation', color: '#B79B6C', ex: 'Collection de saison, portraits de producteurs' },
  { id: 'lifestyle', name: 'Lifestyle & Inspiration', fr: 'Lifestyle & inspiration', share: 10, goal: 'Notoriété', color: '#C9B48E', ex: 'Routines, conseils, moodboards' },
  { id: 'community', name: 'Community & Social Proof', fr: 'Communauté & avis', share: 10, goal: 'Fidélisation', color: '#2A2925', ex: 'Avis autorisés, repartages, questions de la communauté' },
];

/* ---------- Statuts, plateformes, formats ---------- */
MK.statuses = {
  ready: { label: 'Prêt à publier', en: 'Ready to Publish', tone: 'olive' },
  approval: { label: 'En attente de validation', en: 'Awaiting Approval', tone: 'warn' },
  scheduled: { label: 'Programmé', en: 'Scheduled', tone: 'blue' },
  published: { label: 'Publié', en: 'Published', tone: 'dark' },
  draft: { label: 'Brouillon', en: 'Draft', tone: 'line' },
  update: { label: 'À mettre à jour', en: 'Needs Update', tone: 'danger' },
  archived: { label: 'Archivé', en: 'Archived', tone: 'muted' },
};
MK.platforms = {
  instagram: { label: 'Instagram', short: 'IG' },
  tiktok: { label: 'TikTok', short: 'TT' },
  pinterest: { label: 'Pinterest', short: 'PI' },
  newsletter: { label: 'Newsletter', short: 'NL' },
};
MK.formats = {
  square: { label: 'Post carré', ratio: '1 / 1', size: '1080 × 1080', w: 1080, h: 1080 },
  portrait: { label: 'Post portrait', ratio: '4 / 5', size: '1080 × 1350', w: 1080, h: 1350 },
  carousel: { label: 'Carrousel', ratio: '4 / 5', size: '1080 × 1350 (× 5 à 8)', w: 1080, h: 1350 },
  story: { label: 'Story', ratio: '9 / 16', size: '1080 × 1920', w: 1080, h: 1920 },
  reel: { label: 'Reel', ratio: '9 / 16', size: '1080 × 1920 — cover 1080 × 1920', w: 1080, h: 1920 },
  video: { label: 'Vidéo verticale', ratio: '9 / 16', size: '1080 × 1920', w: 1080, h: 1920 },
  pin: { label: 'Épingle verticale', ratio: '2 / 3', size: '1000 × 1500', w: 1000, h: 1500 },
  email: { label: 'E-mail', ratio: '3 / 2', size: 'Bannière 1200 × 800', w: 1200, h: 800 },
};

/* ---------- 8. Visuels : catégories et templates ---------- */
MK.visualCategories = ['Brand Awareness', 'Product Photography', 'Breakfast', 'Lunch', 'Dinner', 'Snacks & Desserts', 'Meal Planning', 'Weekly Menu', 'Seasonal Collection', 'Discovery Boxes', 'Local Producers', 'Membership', 'Promotions', 'Customer Reviews', 'Behind the Scenes'];

/* layout : photo (pleine image), split (photo + bandeau texte), type (typographique) */
MK.templates = [
  { id: 'weekly-menu', name: 'Weekly Menu Announcement', cat: 'Weekly Menu', layout: 'split', theme: 'cream', kicker: 'Menu de la semaine', headline: 'Le nouveau menu est en ligne', sub: 'Commandez avant mercredi minuit', img: IMG.spread },
  { id: 'new-product', name: 'New Product Launch', cat: 'Product Photography', layout: 'photo', theme: 'dark', kicker: 'Nouveauté', headline: 'Votre nouveau favori', sub: 'Disponible dès lundi', img: '1505576633757-0ac1084af824' },
  { id: 'bestseller', name: 'Bestseller Presentation', cat: 'Product Photography', layout: 'split', theme: 'olive', kicker: 'Meilleure vente', headline: 'Le plat que vous recommandez le plus', sub: 'Poulet, riz & légumes rôtis', img: '1532550907401-a500c9a57435' },
  { id: 'seasonal', name: 'Seasonal Collection', cat: 'Seasonal Collection', layout: 'photo', theme: 'dark', kicker: 'Collection de saison', headline: 'Nouvelle saison, nouveau menu', sub: 'Courges, champignons, poires', img: IMG.pumpkin },
  { id: 'producer', name: 'Producer Spotlight', cat: 'Local Producers', layout: 'split', theme: 'sand', kicker: 'Nos producteurs', headline: 'Les visages derrière vos repas', sub: 'Les Jardins de la Saône — 18 km', img: IMG.seedlings },
  { id: 'discovery', name: 'Discovery Box', cat: 'Discovery Boxes', layout: 'split', theme: 'cream', kicker: 'Box découverte', headline: 'Goûtez avant de choisir', sub: 'Une sélection pour découvrir la carte', img: '1547592180-85f173990554' },
  { id: 'review', name: 'Customer Review', cat: 'Customer Reviews', layout: 'type', theme: 'cream', kicker: 'Ils en parlent', headline: '« Mes déjeuners de la semaine sont réglés en cinq minutes. »', sub: 'Avis client fictif (démo)', img: null },
  { id: 'promo', name: 'Promotional Offer', cat: 'Promotions', layout: 'type', theme: 'olive', kicker: 'Offre de bienvenue', headline: '−10 % sur votre première commande', sub: 'Code BIENVENUE10 · conditions sur le site', img: null },
  { id: 'membership', name: 'Membership Benefits', cat: 'Membership', layout: 'type', theme: 'dark', kicker: 'Le Club', headline: 'Rejoignez le Club, sans obligation', sub: 'Jusqu’à −15 % sur toutes vos commandes', img: null },
  { id: 'bts', name: 'Behind the Scenes', cat: 'Behind the Scenes', layout: 'photo', theme: 'dark', kicker: 'En coulisses', headline: 'Un mardi matin à l’atelier', sub: 'Gerland, Lyon 7e', img: IMG.cooking },
  { id: 'brand', name: 'Brand Awareness', cat: 'Brand Awareness', layout: 'photo', theme: 'dark', kicker: 'PREP CLUB · Lyon', headline: 'Your week, prepared.', sub: 'Repas préparés, à la carte et sans abonnement', img: IMG.hero },
  { id: 'planner', name: 'Meal Planning', cat: 'Meal Planning', layout: 'split', theme: 'olive', kicker: 'Weekly Planner', headline: 'Votre semaine, déjà organisée', sub: '7 jours · 4 repas · 1 seul panier', img: IMG.tablet },
  { id: 'breakfast', name: 'Breakfast', cat: 'Breakfast', layout: 'photo', theme: 'dark', kicker: 'Petit-déjeuner', headline: 'Le réveil est déjà prêt', sub: 'Porridge, chia, granola', img: IMG.breakfastSpread },
  { id: 'lunch', name: 'Lunch', cat: 'Lunch', layout: 'split', theme: 'cream', kicker: 'Déjeuner', headline: 'Le déjeuner est réglé', sub: 'Une Lunch Box pour toute la semaine', img: '1546069901-ba9599a7e63c' },
  { id: 'dinner', name: 'Dinner', cat: 'Dinner', layout: 'photo', theme: 'dark', kicker: 'Dîner', headline: 'Ce soir, vous ne cuisinez pas', sub: 'Lasagnes maison, curry, saumon', img: '1619895092538-128341789043' },
  { id: 'snacks', name: 'Snacks & Desserts', cat: 'Snacks & Desserts', layout: 'split', theme: 'sand', kicker: 'En-cas & desserts', headline: 'La pause de 16 h', sub: 'Bouchées énergie, cookies, mousse', img: '1563805042-7684c019e1cb' },
];

/* ---------- 9. Caption Library (FR / EN) ---------- */
MK.captions = [
  { id: 'c1', goal: 'Notoriété', pillar: 'flex', date: 'Lancement — 16 nov.', link: '#/',
    fr: { head: 'Votre semaine, préparée.', body: 'Voici PREP CLUB.\n\nUne nouvelle façon d’organiser vos repas, de découvrir de bonnes recettes et de vous simplifier la semaine.\n\nÀ la carte, en box à composer ou avec le planning de la semaine : vous choisissez.\n\nPas de routine imposée. Pas d’abonnement obligatoire.\n\nDes repas qui s’adaptent à votre vie.', cta: 'Découvrez PREP CLUB via le lien en bio.' },
    en: { head: 'Your week, prepared.', body: 'Meet PREP CLUB.\n\nYour new way to organize meals, discover delicious recipes and make your week a little easier.\n\nChoose à la carte, build your own box or plan your meals for the week.\n\nNo fixed routine. No subscription required.\n\nJust meals that fit your life.', cta: 'Discover PREP CLUB through the link in our bio.' },
    tags: ['#PrepClub', '#MealPrepLyon', '#Lyon', '#RepasPrepares', '#YourWeekPrepared'] },
  { id: 'c2', goal: 'Weekly Planner', pillar: 'flex', date: 'Chaque lundi', link: '#/planning',
    fr: { head: 'Une meilleure semaine commence ici.', body: 'Et si vos repas étaient déjà planifiés ?\n\nAvec le Weekly Planner PREP CLUB, vous organisez petits-déjeuners, déjeuners, dîners et en-cas au même endroit.\n\nChoisissez vos favoris, ajustez votre sélection, et votre semaine est prête.\n\nVotre agenda. Vos repas. À votre façon.', cta: 'Planifiez votre semaine — lien en bio.' },
    en: { head: 'A better week starts here.', body: 'What if your meals were already planned?\n\nWith the PREP CLUB Weekly Planner, you can organize your breakfasts, lunches, dinners and snacks in one place.\n\nChoose your favourites, customize your selection and get your week ready.\n\nYour schedule. Your meals. Your way.', cta: 'Start planning your week.' },
    tags: ['#WeeklyPlanner', '#MealPlanning', '#OrganisationRepas', '#PrepClub', '#MealPrepLyon'] },
  { id: 'c3', goal: 'Collection de saison', pillar: 'local', date: 'Début de chaque saison', link: '#/collection-de-saison',
    fr: { head: 'Nouvelle saison, nouveau menu.', body: 'Nouvelle saison. Nouveaux ingrédients. Nouveaux favoris.\n\nDécouvrez notre Collection de saison, des recettes inspirées par ce que la saison a de meilleur.\n\nParcourez le menu et trouvez votre prochain plat préféré.', cta: 'Découvrez la Collection de saison.' },
    en: { head: 'A new season, a new menu.', body: 'New season. New ingredients. New favourites.\n\nDiscover our latest Seasonal Collection, featuring recipes inspired by the ingredients of the season.\n\nExplore the menu and find your next favourite.', cta: 'Discover the Seasonal Collection.' },
    tags: ['#CollectionDeSaison', '#ProduitsDeSaison', '#Lyon', '#PrepClub', '#SeasonalFood'] },
  { id: 'c4', goal: 'Conversion', pillar: 'quality', date: 'Chaque mercredi', link: '#/carte',
    fr: { head: 'Votre nouveau favori.', body: 'Poulet fermier mariné au citron et aux herbes, riz complet, légumes de saison rôtis au four.\n\nLe plat le plus commandé de la carte, prêt en deux minutes au micro-ondes.\n\nValeurs nutritionnelles et allergènes sur la fiche produit.', cta: 'Ajoutez-le à votre semaine.' },
    en: { head: 'Your new favourite.', body: 'Free-range chicken marinated with lemon and herbs, brown rice and oven-roasted seasonal vegetables.\n\nOur most ordered dish, ready in two minutes.\n\nNutrition facts and allergens on the product page.', cta: 'Add it to your week.' },
    tags: ['#PlatDeLaSemaine', '#MealPrep', '#DejeunerLyon', '#PrepClub'] },
  { id: 'c5', goal: 'Engagement', pillar: 'flex', date: 'Dimanche', link: '#/carte',
    fr: { head: 'Le menu de la semaine est là.', body: 'Sept jours, quatre moments de repas, et une carte entière pour composer votre semaine.\n\nGlissez pour découvrir les nouveautés, les bestsellers et le plat de saison.\n\nCommandes ouvertes jusqu’à mercredi minuit pour une livraison le jeudi.', cta: 'Composez votre semaine — lien en bio.' },
    en: { head: 'This week’s menu is here.', body: 'Seven days, four mealtimes and a full menu to build your week.\n\nSwipe to discover what’s new, our bestsellers and the seasonal dish.\n\nOrders open until Wednesday midnight for Thursday delivery.', cta: 'Build your week — link in bio.' },
    tags: ['#WeeklyMenu', '#MenuDeLaSemaine', '#MealPrepLyon', '#PrepClub'] },
  { id: 'c6', goal: 'Confiance', pillar: 'quality', date: 'Vendredi', link: '#/notre-histoire',
    fr: { head: 'Un mardi matin à l’atelier.', body: '7 h, Gerland. Les légumes arrivent, l’équipe épluche, rôtit, pèse et emballe.\n\nVoici à quoi ressemble la préparation de vos repas de la semaine.\n\nUne question sur nos méthodes ? Posez-la en commentaire.', cta: 'Découvrez notre histoire.' },
    en: { head: 'A Tuesday morning at the kitchen.', body: '7 a.m., Gerland. Vegetables arrive, the team peels, roasts, weighs and packs.\n\nThis is how your meals for the week are prepared.\n\nAny question about how we work? Ask us in the comments.', cta: 'Read our story.' },
    tags: ['#BehindTheScenes', '#Coulisses', '#MealPrep', '#Lyon7', '#PrepClub'] },
  { id: 'c7', goal: 'Différenciation', pillar: 'local', date: '1 fois par mois', link: '#/nos-producteurs',
    fr: { head: 'Les visages derrière vos repas.', body: 'À 18 km de Lyon, Les Jardins de la Saône cultivent les courges et les légumes racines de notre collection d’automne.\n\nChaque mois, nous vous présentons un de nos producteurs partenaires.\n\nSavoir d’où vient ce que l’on mange, ça change tout.', cta: 'Rencontrez nos producteurs.' },
    en: { head: 'Meet the people behind your food.', body: '18 km from Lyon, Les Jardins de la Saône grow the squash and root vegetables of our autumn collection.\n\nEvery month, we introduce one of our partner producers.\n\nKnowing where your food comes from changes everything.', cta: 'Meet our producers.' },
    tags: ['#ProducteursLocaux', '#Local', '#Lyon', '#CircuitCourt', '#PrepClub'] },
  { id: 'c8', goal: 'Abonnements', pillar: 'flex', date: 'Campagne Join the Club', link: '#/abonnement-club',
    fr: { head: 'Le Club, si vous le voulez.', body: 'Vous commandez souvent ? Le Club vous fait profiter de −5 % à −15 % sur chaque commande, de points fidélité multipliés et d’un accès anticipé aux collections.\n\nL’abonnement est facultatif, sans engagement et résiliable à tout moment.\n\nVous pouvez aussi continuer à commander librement, comme avant.', cta: 'Comparez les formules du Club.' },
    en: { head: 'The Club, if you want it.', body: 'Ordering often? The Club gives you 5% to 15% off every order, boosted loyalty points and early access to collections.\n\nMembership is optional, with no commitment, cancellable anytime.\n\nYou can also keep ordering freely, just like before.', cta: 'Compare Club plans.' },
    tags: ['#PrepClubMember', '#SansEngagement', '#MealPrepLyon'] },
  { id: 'c9', goal: 'Découverte', pillar: 'quality', date: 'Campagne Meet the Menu', link: '#/box-decouverte',
    fr: { head: 'Goûtez avant de choisir.', body: 'Vous hésitez entre le curry, les lasagnes et le bol méditerranéen ?\n\nLes box découverte réunissent une sélection de la carte pour tout tester en une seule commande.\n\nPetit-déjeuner, Méditerranée, Végétarienne ou Saison : à vous de choisir.', cta: 'Découvrez les box découverte.' },
    en: { head: 'Taste before you choose.', body: 'Can’t decide between the curry, the lasagna and the Mediterranean bowl?\n\nOur Discovery Boxes bring together a selection of the menu so you can try it all in one order.', cta: 'Explore the Discovery Boxes.' },
    tags: ['#BoxDecouverte', '#DiscoveryBox', '#PrepClub', '#Lyon'] },
  { id: 'c10', goal: 'Fidélisation', pillar: 'community', date: 'Campagne Customer Appreciation', link: '#/fidelite',
    fr: { head: 'Merci d’être là.', body: 'Depuis notre lancement, vous êtes de plus en plus nombreux à préparer votre semaine avec nous.\n\nPour vous remercier, chaque commande vous fait gagner des points à échanger contre des desserts, des en-cas ou des réductions.\n\nEt vous, quel est votre plat préféré de la carte ?', cta: 'Découvrez le programme de fidélité.' },
    en: { head: 'Thank you for being here.', body: 'Since our launch, more and more of you plan your week with us.\n\nTo say thank you, every order earns points you can swap for desserts, snacks or discounts.\n\nWhat’s your favourite dish on the menu?', cta: 'Discover our loyalty programme.' },
    tags: ['#Merci', '#Communaute', '#PrepClub', '#Fidelite'] },
  { id: 'c11', goal: 'Rentrée', pillar: 'flex', date: 'Campagne Back to Routine', link: '#/formules',
    fr: { head: 'La rentrée, version organisée.', body: 'Les vacances sont finies, les agendas se remplissent.\n\nReprenez une routine simple : une Lunch Box pour la semaine, un planning prêt le dimanche, et des soirées sans cuisine.\n\nOn s’occupe des repas, vous vous occupez du reste.', cta: 'Préparez votre semaine de rentrée.' },
    en: { head: 'Back to routine, sorted.', body: 'Holidays are over and calendars are filling up.\n\nGet back to a simple routine: a Lunch Box for the week, a plan ready on Sunday and evenings without cooking.', cta: 'Prepare your back-to-routine week.' },
    tags: ['#Rentree', '#BackToRoutine', '#LunchBox', '#MealPrepLyon'] },
  { id: 'c12', goal: 'Transparence', pillar: 'transp', date: 'Jeudi (carrousel)', link: '#/carte',
    fr: { head: 'Savoir ce que l’on mange.', body: 'Sur chaque fiche produit PREP CLUB : la liste complète des ingrédients, les 14 allergènes réglementaires, les valeurs nutritionnelles pour 100 g et par portion, et l’origine des ingrédients principaux.\n\nGlissez pour voir comment lire une fiche en 20 secondes.', cta: 'Explorez la carte.' },
    en: { head: 'Know what you eat.', body: 'On every PREP CLUB product page: the full ingredient list, the 14 regulated allergens, nutrition per 100 g and per serving, and the origin of the main ingredients.', cta: 'Explore the menu.' },
    tags: ['#Transparence', '#Nutrition', '#KnowWhatYouEat', '#PrepClub'] },
];

/* ---------- 10.1 Stories ---------- */
MK.stories = [
  { id: 's-menu', name: 'Weekly Menu', when: 'Dimanche, 10 h – 11 h', link: '#/carte', frames: [
    { text: 'Le nouveau menu est là', sticker: 'Compte à rebours « Commandes jusqu’à mercredi »', img: IMG.spread },
    { text: 'Les favoris de la semaine', sticker: 'Sondage : « Lequel vous tente ? »', img: '1532550907401-a500c9a57435' },
    { text: 'Composez votre box', sticker: 'Mention @prepclub.lyon', img: '1546069901-ba9599a7e63c' },
    { text: 'Commandez maintenant', sticker: 'Sticker lien → la carte', img: IMG.tabletop },
  ] },
  { id: 's-product', name: 'Product Spotlight', when: 'Mercredi, 12 h', link: '#/produit/salmon-quinoa', frames: [
    { text: 'Votre nouveau favori', sticker: 'Emoji slider « Appétit »', img: '1611599537845-1c7aca0091c0' },
    { text: 'Saumon grillé, quinoa, avocat', sticker: 'Texte : 380 g · 12,50 €', img: '1611599537845-1c7aca0091c0' },
    { text: 'Ingrédients et nutrition', sticker: 'Capture de la fiche produit', img: IMG.saladBowl },
    { text: 'À commander maintenant', sticker: 'Sticker lien → fiche produit', img: IMG.tabletop },
  ] },
  { id: 's-polls', name: 'Polls & questions', when: 'Mardi et jeudi, 12 h 30', link: '#/carte', frames: [
    { text: 'Petit-déj ou déjeuner ?', sticker: 'Sondage 2 choix', img: IMG.breakfastSpread },
    { text: 'Quel plat choisiriez-vous ?', sticker: 'Quiz 4 choix', img: IMG.spread },
    { text: 'Votre ingrédient de saison préféré ?', sticker: 'Boîte à questions', img: IMG.pumpkin },
  ] },
  { id: 's-planner', name: 'Plan your week', when: 'Lundi, 8 h', link: '#/planning', frames: [
    { text: 'Votre semaine en 3 minutes', sticker: 'Enregistrement d’écran du planning', img: IMG.tablet },
    { text: 'Lundi → Dimanche, 4 repas', sticker: 'Texte animé', img: IMG.tablet },
    { text: 'Suggestion automatique', sticker: 'Sondage « Vous planifiez le dimanche ? »', img: IMG.spread },
    { text: 'Essayez le planning', sticker: 'Sticker lien → planning', img: IMG.tabletop },
  ] },
  { id: 's-producer', name: 'Producer Spotlight', when: '1 vendredi par mois', link: '#/nos-producteurs', frames: [
    { text: 'On vous emmène à la ferme', sticker: 'Localisation', img: IMG.field },
    { text: 'Rencontrez nos producteurs', sticker: 'Mention du producteur (avec son accord)', img: IMG.seedlings },
    { text: 'Ce qu’ils cultivent pour vous', sticker: 'Quiz « À combien de km ? »', img: IMG.market },
    { text: 'Tous nos producteurs', sticker: 'Sticker lien → producteurs', img: IMG.picking },
  ] },
  { id: 's-community', name: 'Community', when: 'Samedi', link: '#/fidelite', frames: [
    { text: 'Vos semaines PREP CLUB', sticker: 'Repartage de stories clients (avec accord)', img: IMG.salads },
    { text: 'Merci pour vos avis', sticker: 'Capture d’avis autorisé', img: IMG.tabletop },
    { text: 'Partagez la vôtre', sticker: 'Sticker « Ajouter le vôtre »', img: IMG.spread },
  ] },
];

/* ---------- 10.2 Reels / TikTok ---------- */
MK.reels = [
  { id: 'r1', name: 'A week of meals in 15 seconds', fr: 'Une semaine de repas en 15 secondes', duration: '15 s', pillar: 'planning', img: IMG.spread,
    shots: ['Le frigo vide (1 s)', 'Livraison posée sur le plan de travail (1 s)', 'Un repas par jour posé sur la table, 7 plans très courts (7 × 1 s)', 'Frigo rempli, porte qui se ferme (2 s)', 'Logo + « Your week, prepared. » (2 s)'],
    onscreen: ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche', 'Votre semaine, préparée.'],
    music: 'Rythmé, 120 BPM, coupe sur chaque temps — son de la bibliothèque commerciale de la plateforme',
    caption: 'Une semaine entière de repas, organisée en une seule commande. Lequel vous prenez lundi ?', tags: ['#MealPrep', '#WeekOfMeals', '#MealPrepLyon', '#PrepClub'] },
  { id: 'r2', name: 'Pack an order with us', fr: 'Préparez une commande avec nous', duration: '20 s', pillar: 'bts', img: IMG.cooking,
    shots: ['Mains qui assemblent le carton (2 s)', 'Chaque plat déposé, étiquette visible (8 s)', 'Glace et sac isotherme (3 s)', 'Mot manuscrit glissé dans la box (3 s)', 'Fermeture + sticker PREP CLUB (4 s)'],
    onscreen: ['Commande n°0142', 'Le déjeuner de lundi…', '…jusqu’au dessert de vendredi', 'En route vers la Croix-Rousse'],
    music: 'ASMR (sons réels de l’emballage) + nappe douce', caption: 'Voici comment on prépare votre commande, plat par plat. ASMR inclus.', tags: ['#PackAnOrder', '#ASMR', '#Coulisses', '#PrepClub'] },
  { id: 'r3', name: 'Build your own meal prep box', fr: 'Composez votre box', duration: '25 s', pillar: 'product', img: '1546069901-ba9599a7e63c',
    shots: ['Filme l’écran du téléphone : choix du type de box sur le site (5 s)', 'Ajout de 5 plats, compteur qui monte (10 s)', 'Prix qui se recalcule (3 s)', 'Box réelle déballée (5 s)', 'Fin : le logo PREP CLUB (2 s)'],
    onscreen: ['Étape 1 : la box', 'Étape 2 : vos plats', 'Étape 3 : vos options', 'Étape 4 : c’est prêt'],
    music: 'Pop légère, voix off possible', caption: 'Votre box, vos règles. Quatre étapes et c’est réglé pour la semaine.', tags: ['#BuildYourBox', '#MealPrep', '#Lyon', '#PrepClub'] },
  { id: 'r4', name: 'What’s inside our Breakfast Box?', fr: 'Que contient notre Box Petit-déjeuner ?', duration: '15 s', pillar: 'product', img: IMG.breakfastSpread,
    shots: ['Box fermée, lumière du matin (2 s)', 'Ouverture, vue du dessus (2 s)', 'Chaque produit sorti et nommé (9 s)', 'Café + porridge à la cuillère (2 s)'],
    onscreen: ['Porridge froid aux fruits rouges', 'Pudding de chia coco & fraise', 'Bol granola & fruits frais', 'Muffins à la myrtille', 'Cake à la banane'],
    music: 'Acoustique matinale', caption: 'Cinq petits-déjeuners, zéro préparation le matin. Lequel vous attire le plus ?', tags: ['#Breakfast', '#PetitDejeuner', '#BreakfastBox', '#PrepClub'] },
  { id: 'r5', name: 'A look behind the scenes', fr: 'Dans les coulisses', duration: '30 s', pillar: 'bts', img: IMG.cooking,
    shots: ['Arrivée à l’atelier, 7 h (3 s)', 'Livraison des légumes (4 s)', 'Découpe, rôtissage (8 s)', 'Pesée et portionnage (6 s)', 'Étiquetage (5 s)', 'L’équipe salue la caméra (4 s)'],
    onscreen: ['7 h, Gerland', 'Les légumes arrivent', 'Tout est préparé ici', 'Pesé au gramme près', 'Étiqueté, prêt à partir'],
    music: 'Ambiance cuisine + musique douce', caption: 'Un matin à l’atelier PREP CLUB, de la livraison des légumes à l’étiquetage.', tags: ['#BehindTheScenes', '#Coulisses', '#Lyon7', '#PrepClub'] },
  { id: 'r6', name: 'Meet our local producers', fr: 'Rencontrez nos producteurs', duration: '30 s', pillar: 'seasonal', img: IMG.field,
    shots: ['Route de campagne, panneau de la commune (3 s)', 'Producteur au travail (6 s)', 'Interview face caméra, 1 phrase (8 s)', 'Gros plan sur le produit (5 s)', 'Le produit dans un plat PREP CLUB (6 s)', 'Carte : distance depuis Lyon (2 s)'],
    onscreen: ['À 18 km de Lyon', 'Les Jardins de la Saône', '« Tout est récolté la veille »', 'Dans votre bol de courge d’automne'],
    music: 'Folk instrumental', caption: 'On vous présente celles et ceux qui cultivent vos légumes, à quelques kilomètres de Lyon.', note: 'Demande l’accord du producteur avant de le filmer et de le citer.', tags: ['#ProducteursLocaux', '#MeetTheFarmer', '#Lyon', '#PrepClub'] },
  { id: 'r7', name: 'My Sunday meal planning routine', fr: 'Ma routine du dimanche', duration: '20 s', pillar: 'planning', img: IMG.tablet,
    shots: ['Café, carnet, téléphone (3 s)', 'Filme l’écran : on ajoute des repas dans le planning (8 s)', 'Validation du panier (3 s)', 'Livraison jeudi, frigo rempli (4 s)', 'Fin : canapé, pieds sur la table (2 s)'],
    onscreen: ['Dimanche, 10 h', '5 minutes pour la semaine', 'Commande validée', 'Et voilà'],
    music: 'Lo-fi', caption: 'Cinq minutes le dimanche, une semaine sans se demander quoi manger.', tags: ['#SundayReset', '#MealPlanning', '#WeeklyPlanner', '#PrepClub'] },
  { id: 'r8', name: 'Desk lunch, upgraded', fr: 'Le déjeuner au bureau, en mieux', duration: '12 s', pillar: 'lifestyle', img: '1532550907401-a500c9a57435',
    shots: ['Sandwich triste sur un bureau (2 s)', 'Transition : bol PREP CLUB (1 s)', 'Micro-ondes, 2 minutes (3 s)', 'Première bouchée (3 s)', 'Fin : le logo PREP CLUB (3 s)'],
    onscreen: ['Le déjeuner de bureau…', '…version PREP CLUB', 'Prêt en 2 minutes'],
    music: 'Son tendance (droits commerciaux à vérifier)', caption: 'On a amélioré votre pause déjeuner. Livraison au bureau à la Part-Dieu et à Gerland.', tags: ['#LunchBreak', '#DejeunerBureau', '#LyonPartDieu', '#PrepClub'] },
];

/* ---------- 12. Campagnes préconstruites ---------- */
MK.campaigns = [
  { id: 'launch', name: 'PREP CLUB Launch', fr: 'Lancement', start: '2026-11-09', end: '2026-11-29', status: 'active', persona: ['busy', 'food'],
    goal: 'Faire connaître la marque et générer les premières commandes.', target: 'Actifs 25–35 ans, Lyon et métropole (Lyon 2e, 3e, 6e, 7e en priorité)',
    offer: 'BIENVENUE10 : −10 % sur la première commande', landing: '#/', budget: 600,
    contents: ['Teaser (3 posts grille + stories compte à rebours)', 'Présentation de la marque', 'Présentation des offres (carte, formules, box)', 'Présentation du Weekly Planner', 'Présentation des produits', 'Annonce officielle du lancement — lundi 16 novembre', 'Newsletter de lancement'],
    kpis: [['Abonnés Instagram', '800'], ['Commandes', '120'], ['Inscrits newsletter', '400'], ['Utilisations BIENVENUE10', '90']] },
  { id: 'menu', name: 'Meet the Menu', fr: 'Découvrez la carte', start: '2026-11-30', end: '2026-12-13', status: 'ready', persona: ['food', 'busy'],
    goal: 'Faire découvrir les produits.', target: 'Visiteurs du site et abonnés récents', offer: 'Box découverte mise en avant', landing: '#/carte', budget: 250,
    contents: ['Breakfast', 'Lunch', 'Dinner', 'Snacks & Desserts', 'Bestsellers', 'Fiches nutritionnelles (carrousel « lire une fiche »)'],
    kpis: [['Vues fiches produit', '6 000'], ['Ajouts au panier', '450'], ['Box découverte vendues', '60']] },
  { id: 'winter', name: 'Winter Comfort & Gifts', fr: 'Hiver & fêtes', start: '2026-12-14', end: '2027-01-03', status: 'ready', persona: ['food', 'local'],
    goal: 'Collection d’hiver, idées cadeaux et commandes des fêtes.', target: 'Clients et abonnés', offer: 'Carte cadeau et Box découverte de saison (si disponibles)', landing: '#/collection-de-saison', budget: 200,
    contents: ['Winter Comfort Food', 'Warm meal inspiration', 'Gift and discovery offers', 'Horaires des fêtes'],
    kpis: [['Commandes', '180'], ['Box découverte de saison', '50']] },
  { id: 'plan', name: 'Plan Your Week', fr: 'Planifiez votre semaine', start: '2027-01-04', end: '2027-01-17', status: 'ready', persona: ['planner', 'busy'],
    goal: 'Promouvoir le Weekly Planner (New Year Meal Planning).', target: 'Organisés 28–40 ans, résolutions de janvier', offer: 'Livraison offerte sur le premier planning validé', landing: '#/planning', budget: 300,
    contents: ['Démonstration du planner (Reel)', 'Exemple de semaine (carrousel)', 'Composition d’une box', 'Reel explicatif', 'Newsletter dédiée'],
    kpis: [['Plannings créés', '300'], ['Plannings transformés en commande', '120']] },
  { id: 'club', name: 'Join the Club', fr: 'Rejoignez le Club', start: '2027-02-08', end: '2027-02-21', status: 'draft', persona: ['planner'],
    goal: 'Développer les abonnements, en rappelant qu’ils sont facultatifs.', target: 'Clients ayant commandé 3 fois ou plus', offer: 'Premier mois du Club Plus à −50 %', landing: '#/abonnement-club', budget: 150,
    contents: ['Présentation des avantages', 'Comparaison des formules Essentiel / Plus / Premium', 'Explication des conditions et de la résiliation', 'FAQ', 'E-mail de présentation'],
    kpis: [['Nouveaux membres', '40'], ['Taux de résiliation à 30 j', '< 15 %']] },
  { id: 'spring', name: 'Discover the Season — Printemps', fr: 'Collection de printemps', start: '2027-03-15', end: '2027-03-28', status: 'draft', persona: ['local', 'food'],
    goal: 'Valoriser la collection de printemps.', target: 'Toute la communauté', offer: '—', landing: '#/collection-de-saison', budget: 250,
    contents: ['Présentation de la collection', 'Produits de saison : asperges, petits pois, fraises', 'Fresh breakfast ideas', 'Producer spotlight : Vergers du Pilat', 'Newsletter'],
    kpis: [['Ventes collection', '400 plats'], ['Engagement posts collection', '5 %']] },
  { id: 'thanks', name: 'Customer Appreciation', fr: 'Merci à nos clients', start: '2027-05-10', end: '2027-05-23', status: 'draft', persona: ['busy', 'planner'],
    goal: 'Fidéliser les clients existants.', target: 'Clients actifs et inactifs depuis 60 jours', offer: 'Points fidélité doublés pendant 2 semaines', landing: '#/fidelite', budget: 0,
    contents: ['Remerciements', 'Témoignages autorisés', 'Programme de fidélité', 'Avantages clients', 'Offre de réachat'],
    kpis: [['Taux de réachat', '+5 pts'], ['Avis collectés', '80']] },
  { id: 'summer', name: 'Summer Meal Prep', fr: 'Collection d’été', start: '2027-06-07', end: '2027-06-20', status: 'draft', persona: ['food', 'busy'],
    goal: 'Collection d’été : déjeuners frais et bols de saison.', target: 'Actifs restant à Lyon l’été', offer: 'Box découverte d’été', landing: '#/collection-de-saison', budget: 250,
    contents: ['Summer Meal Prep', 'Easy lunches', 'Fresh seasonal bowls', 'Discovery Box'],
    kpis: [['Ventes collection', '350 plats']] },
  { id: 'routine', name: 'Back to Routine', fr: 'Rentrée', start: '2027-08-30', end: '2027-09-12', status: 'draft', persona: ['busy', 'planner'],
    goal: 'Encourager l’organisation des repas après les vacances.', target: 'Clients et prospects, entreprises de la Part-Dieu', offer: 'Offre de rentrée : −15 % sur la Lunch Box', landing: '#/formules', budget: 400,
    contents: ['Organisation de la semaine', 'Weekly Planner', 'Lunch Box', 'Discovery Box', 'Offre de rentrée'],
    kpis: [['Commandes', '350'], ['Nouveaux clients', '150']] },
  { id: 'autumn', name: 'Discover the Season — Automne', fr: 'Collection d’automne', start: '2027-09-20', end: '2027-10-03', status: 'draft', persona: ['local', 'food'],
    goal: 'Collection d’automne et Office Lunch Box.', target: 'Toute la communauté', offer: '—', landing: '#/collection-de-saison', budget: 250,
    contents: ['Autumn Collection', 'Producer spotlight : Champignonnière des Monts du Lyonnais', 'Office Lunch Box', 'Newsletter'],
    kpis: [['Ventes collection', '450 plats']] },
];

/* ---------- 11.3 Saisons ---------- */
MK.seasonPlan = [
  { id: 'winter', name: 'Hiver', en: 'Winter Campaign', months: 'Décembre – Février', img: IMG.cabbage, items: ['Winter Comfort Food', 'Warm meal inspiration', 'Gift and discovery offers', 'New Year Meal Planning'], campaigns: ['winter', 'plan', 'club'] },
  { id: 'spring', name: 'Printemps', en: 'Spring Campaign', months: 'Mars – Mai', img: IMG.asparagus, items: ['Spring Collection', 'Fresh breakfast ideas', 'New seasonal recipes', 'Producer spotlight'], campaigns: ['spring', 'thanks'] },
  { id: 'summer', name: 'Été', en: 'Summer Campaign', months: 'Juin – Août', img: IMG.tomatoes, items: ['Summer Meal Prep', 'Easy lunches', 'Fresh seasonal bowls', 'Discovery Box'], campaigns: ['summer'] },
  { id: 'autumn', name: 'Automne', en: 'Autumn Campaign', months: 'Septembre – Novembre', img: IMG.pumpkin, items: ['Back to Routine', 'Weekly Planner', 'Autumn Collection', 'Office Lunch Box'], campaigns: ['routine', 'autumn', 'launch'] },
];

/* ---------- 13. E-mail marketing ---------- */
MK.newsletter = {
  name: 'The Weekly Prep',
  when: 'Chaque dimanche à 9 h',
  sections: ['Header PREP CLUB', 'Introduction courte', 'Weekly Menu', 'Featured Recipe', 'Seasonal Highlight', 'Producer Spotlight', 'Weekly Planning Tip', 'CTA — Plan Your Week', 'Footer et gestion des préférences'],
  sample: {
    subject: 'The Weekly Prep #3 · Le menu d’automne est servi',
    preheader: 'Courge rôtie, curry de saumon coco et un nouveau producteur.',
    intro: 'Bonjour,\n\nLes soirées raccourcissent, les plats deviennent plus réconfortants. Voici tout ce qu’il faut pour préparer votre semaine en cinq minutes.',
    menu: ['Bol de courge d’automne', 'Curry de saumon coco', 'Poulet & champignons', 'Porridge froid aux fruits rouges', 'Mousse au chocolat & crumble'],
    recipe: { name: 'Bol de courge d’automne', text: 'Courge rôtie au four, lentilles, noisettes torréfiées et sauce tahini-citron. Le plat végétarien de la saison.' },
    season: 'Les courges, champignons et poires sont à leur meilleur jusqu’à fin novembre.',
    producer: { name: 'Champignonnière des Monts du Lyonnais', text: 'À 30 km de Lyon, des champignons cultivés en cave et récoltés le matin même.' },
    tip: 'Placez vos dîners les plus légers en début de semaine et gardez les plats mijotés pour jeudi et vendredi : ils supportent très bien quelques jours au frais.',
  },
};

MK.flows = [
  { id: 'welcome', name: 'Welcome Flow', fr: 'Bienvenue', trigger: 'Inscription à la newsletter ou création de compte', segment: 'Nouveaux inscrits', active: true, emails: [
    { delay: 'Immédiat', subject: 'Bienvenue chez PREP CLUB', pre: 'Votre semaine, préparée. Voici comment ça marche.', body: 'Merci de nous avoir rejoints. PREP CLUB, ce sont des repas préparés à Lyon, à commander à la carte, en formule ou en box, sans abonnement obligatoire. Pour fêter votre arrivée, voici votre code BIENVENUE10.', cta: 'Découvrir la carte', link: '#/carte', cond: 'Consentement newsletter enregistré', note: 'Le code BIENVENUE10 doit être actif sur le site.' },
    { delay: 'J+2', subject: 'Comment ça marche, en 3 étapes', pre: 'Choisir, recevoir, réchauffer.', body: 'Choisissez vos plats avant mercredi minuit, recevez-les jeudi à domicile ou en point de retrait, réchauffez en deux minutes. Le Weekly Planner vous aide à tout organiser.', cta: 'Essayer le planning', link: '#/planning', cond: 'Aucune commande passée' },
    { delay: 'J+5', subject: 'Nos 5 plats les plus commandés', pre: 'Par où commencer ? Par ceux-là.', body: 'Poulet, riz & légumes rôtis, Bol saumon & quinoa, Pâtes au pesto, Lasagnes maison et Porridge froid aux fruits rouges : la sélection idéale pour une première commande.', cta: 'Voir les bestsellers', link: '#/carte', cond: 'Aucune commande passée' },
  ] },
  { id: 'first', name: 'First Purchase Flow', fr: 'Première commande', trigger: 'Première commande validée', segment: 'Nouveaux clients', active: true, emails: [
    { delay: 'Immédiat', subject: 'Commande confirmée', pre: 'Récapitulatif et créneau de livraison.', body: 'Merci pour votre commande ! Elle est bien enregistrée.\n\nVous trouverez ci-dessous le détail de vos plats, votre créneau de livraison et votre adresse (ou votre point de retrait).\n\nÀ réception, rangez vos plats au réfrigérateur entre 0 et 4 °C.', cta: 'Suivre ma commande', link: '#/mon-compte', cond: 'Transactionnel, envoyé à tous' },
    { delay: 'Jour de livraison + 1', subject: 'Merci pour votre première commande', pre: 'Quelques conseils pour en profiter.', body: 'Conservez vos plats au réfrigérateur entre 0 et 4 °C, consommez-les avant la date indiquée sur l’étiquette, réchauffez 2 minutes au micro-ondes ou 10 minutes au four.', cta: 'Préparer la semaine prochaine', link: '#/planning', cond: 'Commande livrée' },
    { delay: 'J+5 après livraison', subject: 'Votre avis compte', pre: 'Deux minutes pour nous aider à progresser.', body: 'Qu’avez-vous pensé de vos plats ? Votre avis nous aide à améliorer la carte. Il ne sera publié qu’avec votre accord.', cta: 'Donner mon avis', link: '#/mon-compte', cond: 'Commande livrée, pas d’avis déjà laissé' },
  ] },
  { id: 'sub', name: 'Subscription Flow', fr: 'Abonnement Club', trigger: 'Souscription au Club', segment: 'Membres Club', active: true, emails: [
    { delay: 'Immédiat', subject: 'Bienvenue dans le Club', pre: 'Votre abonnement est actif.', body: 'Bienvenue dans le Club PREP CLUB ! Votre abonnement est actif.\n\nVous trouverez ci-dessous votre formule, son prix mensuel et la date du prochain prélèvement.\n\nVous pouvez résilier à tout moment depuis votre compte, en un clic.', cta: 'Gérer mon abonnement', link: '#/mon-compte', cond: 'Transactionnel' },
    { delay: 'J+3', subject: 'Vos avantages membre', pre: 'Remise, points fidélité, accès anticipé.', body: 'Votre remise s’applique automatiquement, vos points sont multipliés et vous recevrez les collections en avant-première.', cta: 'Voir mes avantages', link: '#/abonnement-club', cond: 'Abonnement actif' },
    { delay: '7 jours avant échéance', subject: 'Votre prochaine échéance', pre: 'Rappel du renouvellement.', body: 'Petit rappel : votre abonnement Club sera renouvelé dans 7 jours, pour le même montant.\n\nSi vous souhaitez le modifier ou l’arrêter, c’est possible jusqu’à la veille, depuis votre compte.', cta: 'Gérer mon abonnement', link: '#/mon-compte', cond: 'Abonnement actif' },
  ] },
  { id: 'cart', name: 'Abandoned Cart Flow', fr: 'Panier abandonné', trigger: 'Panier non validé depuis 3 h', segment: 'Clients identifiés avec consentement', active: false, emails: [
    { delay: 'H+3', subject: 'Votre panier vous attend', pre: 'Vos plats sont encore disponibles.', body: 'Vous avez laissé quelques plats dans votre panier. Ils sont encore disponibles !\n\nCommandez avant mercredi minuit pour être livré jeudi.', cta: 'Reprendre mon panier', link: '#/', cond: 'Consentement à la prospection et règles RGPD respectés' },
    { delay: 'H+24', subject: 'Dernier rappel avant mercredi minuit', pre: 'Pour être livré jeudi.', body: 'Dernier petit rappel : votre panier vous attend jusqu’à mercredi minuit. Après, place au menu de la semaine suivante.', cta: 'Valider ma commande', link: '#/', cond: 'Panier toujours actif, avant la date limite' },
  ] },
  { id: 'winback', name: 'Win-back Flow', fr: 'Reconquête', trigger: '45 jours sans commande', segment: 'Clients inactifs', active: true, emails: [
    { delay: 'J+45', subject: 'Le menu a changé depuis votre dernière visite', pre: 'Nouveautés, collection de saison, nouveaux producteurs.', body: 'Cela fait un moment ! Depuis votre dernière commande, la carte a changé : nouvelles recettes, collection de saison et nouveaux producteurs.\n\nVenez jeter un œil, il y a sûrement un nouveau favori pour vous.', cta: 'Voir le nouveau menu', link: '#/carte', cond: 'Inscrit, pas de commande depuis 45 jours' },
    { delay: 'J+60', subject: 'On vous garde une place à table', pre: 'Une attention pour votre retour.', body: 'On aimerait vous revoir à table. Pour votre retour, un dessert vous est offert avec votre prochaine commande.\n\nÀ très vite chez PREP CLUB.', cta: 'Revenir chez PREP CLUB', link: '#/', cond: 'Toujours inactif', note: 'Choisis l’offre de retour avant d’activer cet e-mail.' },
  ] },
  { id: 'seasonal', name: 'Seasonal Launch Flow', fr: 'Lancement de saison', trigger: 'Activation d’une collection de saison', segment: 'Tous les inscrits', active: true, emails: [
    { delay: 'Jour du lancement', subject: 'La nouvelle collection est arrivée', pre: 'Les recettes de la saison sont en ligne.', body: 'La nouvelle collection de saison est en ligne ! Des recettes imaginées autour des meilleurs ingrédients du moment, avec nos producteurs de la région.', cta: 'Découvrir la collection', link: '#/collection-de-saison', cond: 'Collection activée' },
    { delay: 'J+5', subject: 'Les plats de la saison en détail', pre: 'Recettes, nutrition, provenance.', body: 'Envie d’en savoir plus sur la collection ? Recettes, valeurs nutritionnelles et provenance des ingrédients : tout est sur chaque fiche produit.', cta: 'Composer ma box de saison', link: '#/composer-ma-box', cond: 'Pas d’achat dans la collection' },
    { delay: '3 jours avant la fin', subject: 'Derniers jours pour la collection', pre: 'Elle quitte la carte dimanche.', body: 'Derniers jours pour profiter de la collection de saison : elle quitte la carte dimanche.', cta: 'Commander avant la fin', link: '#/collection-de-saison', cond: 'Date de fin réelle renseignée', note: 'À envoyer seulement si la collection a vraiment une date de fin.' },
  ] },
];

/* ---------- 14. Influence (profils FICTIFS d'exemple) ---------- */
MK.influencers = [
  { id: 'i1', name: 'Créatrice food — Lyon 2e', handle: '@exemple.food.lyon', network: 'Instagram', followers: 18500, engagement: 4.8, niche: 'Food & restaurants lyonnais', status: 'contacted', budget: 'Produits + 250 €', history: 'Premier contact le 4 nov.' },
  { id: 'i2', name: 'Créateur fitness — Villeurbanne', handle: '@exemple.fit.villeurbanne', network: 'TikTok', followers: 42000, engagement: 6.1, niche: 'Healthy lifestyle', status: 'negotiation', budget: '400 €', history: 'Brief envoyé le 6 nov.' },
  { id: 'i3', name: 'Lifestyle working mum — Lyon 6e', handle: '@exemple.lifestyle.lyon6', network: 'Instagram', followers: 9200, engagement: 5.6, niche: 'Organisation & famille', status: 'confirmed', budget: 'Produits (box d’une semaine)', history: 'Publication prévue le 18 nov.' },
  { id: 'i4', name: 'Consultant — Part-Dieu', handle: '@exemple.office.life', network: 'LinkedIn', followers: 6400, engagement: 3.9, niche: 'Vie de bureau', status: 'todo', budget: 'Produits', history: '—' },
  { id: 'i5', name: 'Étudiante cuisine — Croix-Rousse', handle: '@exemple.croixrousse.eats', network: 'TikTok', followers: 27000, engagement: 7.2, niche: 'Recettes & bons plans', status: 'todo', budget: 'Produits + 150 €', history: '—' },
  { id: 'i6', name: 'Créateur producteurs locaux — Monts d’Or', handle: '@exemple.terroir69', network: 'Instagram', followers: 12300, engagement: 5.1, niche: 'Terroir & circuits courts', status: 'published', budget: 'Produits', history: 'Reel publié le 2 nov. (pré-lancement)' },
];
MK.influencerStatuses = { todo: 'À contacter', contacted: 'Contacté', negotiation: 'En discussion', confirmed: 'Confirmé', published: 'Publié', done: 'Terminé' };
MK.influencerKit = [
  ['Présentation de PREP CLUB', 'Repas préparés à Lyon, à la carte, en formule ou en box, sans abonnement obligatoire. Atelier à Gerland, six producteurs partenaires.'],
  ['Concept de la marque', 'Your week, prepared. Une solution complète d’organisation alimentaire, flexible et transparente.'],
  ['Offre proposée', 'Une semaine de repas offerte (Box Journée complète) + rémunération selon audience, validée avant toute dépense.'],
  ['Brief de contenu', '1 Reel ou TikTok de 20 à 40 s montrant la réception, le planning et un repas en situation réelle + 3 stories avec lien.'],
  ['Produits à présenter', 'Weekly Planner, Box Journée complète, plat de la Collection de saison.'],
  ['Mentions obligatoires', 'Mention « Collaboration commerciale » ou « Publicité » visible dès le début du contenu (loi n° 2023-451 du 9 juin 2023), identification de @prepclub.lyon.'],
  ['Hashtags', '#PrepClub #MealPrepLyon #YourWeekPrepared'],
  ['Liens traqués', 'Lien UTM personnel + code promo nominatif (ex. PREP-PRENOM10).'],
  ['Conditions', 'Validation du contenu avant publication, droits de repartage 6 mois sur les comptes PREP CLUB, aucune allégation santé.'],
];
MK.influencerMessages = [
  { name: 'Prise de contact', text: 'Bonjour {prénom},\n\nJe suis {votre prénom}, fondateur de PREP CLUB, une marque de repas préparés lancée à Lyon ce mois-ci. J’aime beaucoup vos contenus sur {sujet}, et notre façon d’aborder les repas de la semaine pourrait parler à votre communauté.\n\nSeriez-vous ouvert(e) à tester une semaine de repas PREP CLUB ? Je vous envoie volontiers notre kit de présentation et nos conditions de collaboration.\n\nBelle journée,\n{votre prénom}\nPREP CLUB · Lyon' },
  { name: 'Relance (J+7)', text: 'Bonjour {prénom},\n\nJe me permets de revenir vers vous au sujet de PREP CLUB. Notre proposition tient toujours : une semaine de repas offerte, livrée chez vous, pour découvrir la marque sans engagement.\n\nSi le moment n’est pas idéal, aucun souci, je ne vous relancerai pas.\n\nMerci et à bientôt,\n{votre prénom}' },
  { name: 'Confirmation & brief', text: 'Bonjour {prénom},\n\nMerci pour votre retour ! Vous trouverez ci-joint le brief, les mentions obligatoires (« Collaboration commerciale »), votre lien personnalisé et votre code {code}.\n\nLa livraison est prévue le {date}. Pourriez-vous nous envoyer le contenu pour validation 48 h avant publication ?\n\nÀ très vite,\n{votre prénom}' },
];

/* ---------- 15. Publicité ---------- */
MK.ads = [
  { id: 'a1', name: 'Brand Awareness — Lancement', type: 'Brand Awareness', channel: 'Meta Ads (Instagram + Facebook)', campaign: 'launch', status: 'approval',
    audience: '22–40 ans, intérêts food, meal prep, sport, vie de bureau', zone: 'Lyon + 10 km', dates: '16 – 29 nov. 2026', budget: 200,
    text: 'Vos repas de la semaine, prêts à Lyon. À la carte, en box ou planifiés. Sans abonnement.', cta: 'En savoir plus', landing: '#/', visual: 'brand', results: null },
  { id: 'a2', name: 'Trafic — Weekly Planner', type: 'Traffic', channel: 'Meta Ads', campaign: 'plan', status: 'draft',
    audience: '28–40 ans, Lyon 3e, 6e, 7e, Villeurbanne', zone: 'Lyon + 8 km', dates: '4 – 17 janv. 2027', budget: 180,
    text: 'Planifiez votre semaine de repas en 5 minutes. Le planning PREP CLUB fait le reste.', cta: 'Planifier ma semaine', landing: '#/planning', visual: 'planner', results: null },
  { id: 'a3', name: 'Conversion — Première commande', type: 'Conversion', channel: 'Meta Ads', campaign: 'launch', status: 'approval',
    audience: 'Visiteurs du site non clients + audience similaire 1 %', zone: 'Lyon + 10 km', dates: '20 nov. – 6 déc. 2026', budget: 250,
    text: '−10 % sur votre première commande avec le code BIENVENUE10. Livraison jeudi.', cta: 'Commander', landing: '#/carte', visual: 'promo', results: null },
  { id: 'a4', name: 'Retargeting — Panier & fiches produit', type: 'Retargeting', channel: 'Meta Ads', campaign: 'menu', status: 'draft',
    audience: 'Visiteurs des 14 derniers jours ayant consenti aux cookies publicitaires', zone: 'Lyon + 15 km', dates: 'En continu à partir du 30 nov.', budget: 120,
    text: 'Vos plats vous attendent. Commandez avant mercredi minuit pour être livré jeudi.', cta: 'Reprendre ma commande', landing: '#/carte', visual: 'weekly-menu', results: null },
  { id: 'a5', name: 'TikTok — Spark Ads coulisses', type: 'Brand Awareness', channel: 'TikTok Ads', campaign: 'launch', status: 'draft',
    audience: '20–34 ans, Lyon', zone: 'Lyon + 10 km', dates: '18 – 29 nov. 2026', budget: 150,
    text: 'Reel « A week of meals in 15 seconds » boosté.', cta: 'Découvrir', landing: '#/', visual: 'bts', results: null },
  { id: 'a6', name: 'Google Search — Meal prep Lyon', type: 'Conversion', channel: 'Google Ads', campaign: 'launch', status: 'approval',
    audience: 'Requêtes : meal prep Lyon, repas préparés Lyon, livraison repas Lyon', zone: 'Métropole de Lyon', dates: 'À partir du 16 nov. 2026', budget: 300,
    text: 'PREP CLUB — Repas préparés à Lyon | À la carte, sans abonnement | Livraison jeudi', cta: 'Voir la carte', landing: '#/carte', visual: null, results: null },
  { id: 'a7', name: 'Seasonal — Collection de printemps', type: 'Seasonal', channel: 'Meta Ads', campaign: 'spring', status: 'draft',
    audience: 'Abonnés + audience similaire', zone: 'Lyon + 10 km', dates: '15 – 28 mars 2027', budget: 150,
    text: 'Asperges, petits pois, fraises : la collection de printemps est arrivée.', cta: 'Découvrir', landing: '#/collection-de-saison', visual: 'seasonal', results: null },
];

/* ---------- 16. SEO & Blog ---------- */
MK.keywords = [
  { kw: 'meal prep Lyon', intent: 'Transactionnelle', page: 'Accueil', prio: 'Haute' },
  { kw: 'repas préparés Lyon', intent: 'Transactionnelle', page: 'La carte', prio: 'Haute' },
  { kw: 'livraison repas Lyon', intent: 'Transactionnelle', page: 'Informations de livraison', prio: 'Haute' },
  { kw: 'box repas Lyon', intent: 'Transactionnelle', page: 'Formules / Composer ma box', prio: 'Haute' },
  { kw: 'healthy lunch Lyon', intent: 'Locale', page: 'Box Déjeuner', prio: 'Moyenne' },
  { kw: 'repas de la semaine', intent: 'Informationnelle', page: 'Blog + Planning', prio: 'Moyenne' },
  { kw: 'weekly meal planner', intent: 'Informationnelle', page: 'Planning de la semaine', prio: 'Moyenne' },
  { kw: 'meal prep delivery', intent: 'Transactionnelle', page: 'Accueil (version EN)', prio: 'Basse' },
];
MK.articles = [
  { id: 'b1', title: 'Meal prep à Lyon : le guide pour organiser vos repas de la semaine', slug: 'meal-prep-lyon-guide', kw: 'meal prep Lyon', status: 'ready', date: '2026-11-16', words: 1400,
    meta: 'Comment organiser ses repas de la semaine à Lyon sans y passer son dimanche : méthode, exemples de menus et solutions de repas préparés.',
    outline: ['Qu’est-ce que le meal prep ?', 'Combien de temps faut-il vraiment ?', 'Exemple de semaine équilibrée', 'Cuisiner soi-même ou commander à Lyon ?', 'Bien conserver ses repas'], links: ['#/planning', '#/carte'] },
  { id: 'b2', title: 'Repas préparés à Lyon : comment bien choisir ?', slug: 'repas-prepares-lyon-choisir', kw: 'repas préparés Lyon', status: 'ready', date: '2026-11-30', words: 1100,
    meta: 'Composition, provenance, conservation, livraison : les 6 critères pour choisir ses repas préparés à Lyon.',
    outline: ['Lire la liste des ingrédients', 'Les allergènes à repérer', 'Provenance et saisonnalité', 'Livraison ou retrait ?', 'Avec ou sans abonnement'], links: ['#/carte', '#/livraison'] },
  { id: 'b3', title: '5 idées de lunch box pour le bureau', slug: 'idees-lunch-box-bureau', kw: 'healthy lunch Lyon', status: 'approval', date: '2026-12-14', words: 900,
    meta: 'Cinq lunch box faciles à transporter et à réchauffer au bureau, testées à la Part-Dieu.',
    outline: ['Les règles d’une bonne lunch box', 'Bol méditerranéen', 'Poulet, riz & légumes rôtis', 'Pâtes au pesto', 'Bol de courge d’automne', 'Le bon contenant'], links: ['#/formules'] },
  { id: 'b4', title: 'Planifier ses repas de la semaine en 15 minutes', slug: 'planifier-repas-semaine', kw: 'repas de la semaine', status: 'ready', date: '2027-01-04', words: 1200,
    meta: 'Une méthode simple en 4 étapes pour planifier petits-déjeuners, déjeuners et dîners de toute la semaine.',
    outline: ['Faire le point sur son agenda', 'Répartir 4 moments de repas sur 7 jours', 'Varier sans se compliquer', 'Utiliser un planning en ligne', 'Modèle de semaine à télécharger'], links: ['#/planning'] },
  { id: 'b5', title: 'Les légumes de saison à Lyon, mois par mois', slug: 'legumes-de-saison-lyon', kw: 'produits de saison Lyon', status: 'draft', date: '2027-02-15', words: 1500,
    meta: 'Calendrier des fruits et légumes de saison en Auvergne-Rhône-Alpes, et où les trouver autour de Lyon.',
    outline: ['Pourquoi manger de saison', 'Hiver', 'Printemps', 'Été', 'Automne', 'Nos producteurs partenaires'], links: ['#/collection-de-saison', '#/nos-producteurs'] },
  { id: 'b6', title: 'Combien de temps se conserve un repas préparé ?', slug: 'conservation-repas-prepares', kw: 'conservation meal prep', status: 'draft', date: '2027-03-01', words: 800,
    meta: 'Réfrigérateur, congélation, réchauffage : les bonnes pratiques pour conserver vos repas préparés.',
    outline: ['La règle des 0–4 °C', 'Lire la DLC', 'Peut-on congeler ?', 'Bien réchauffer'], links: ['#/faq'] },
  { id: 'b7', title: 'Box repas à Lyon : à la carte, formule ou abonnement ?', slug: 'box-repas-lyon', kw: 'box repas Lyon', status: 'draft', date: '2027-03-15', words: 1000,
    meta: 'Comparatif des façons de commander ses repas à Lyon : à la carte, en box, en formule ou avec un abonnement facultatif.',
    outline: ['À la carte', 'Les box à composer', 'Les formules', 'L’abonnement Club', 'Quel choix selon votre rythme'], links: ['#/formules', '#/abonnement-club'] },
  { id: 'b8', title: 'Rencontre avec Les Jardins de la Saône', slug: 'producteur-jardins-de-la-saone', kw: 'maraîcher Lyon', status: 'draft', date: '2027-04-05', words: 900,
    meta: 'Portrait de notre maraîcher partenaire à Neuville-sur-Saône. Producteur fictif, présenté à titre d’exemple.',
    outline: ['Une exploitation en bord de Saône', 'Ce qui pousse en ce moment', 'Notre façon de travailler ensemble', 'Dans quels plats les retrouver'], links: ['#/nos-producteurs'] },
];
MK.localSeo = [
  'Créer et vérifier la fiche Google Business Profile (atelier de Gerland + horaires de retrait)',
  'Ajouter les 3 points de retrait dans la page Livraison avec adresses complètes',
  'Données structurées Product (prix, disponibilité) et LocalBusiness sur le site',
  'Balises title et meta description uniques sur chaque page',
  'Textes alternatifs sur toutes les photos produits',
  'Demander un avis Google après chaque première commande (flux First Purchase)',
  'Inscription dans les annuaires locaux pertinents (Lyon, commerces de la métropole)',
  'Mesurer avec Google Search Console dès la mise en ligne',
];

/* ---------- Automatisations ---------- */
MK.automations = [
  { id: 'au1', name: 'Publication programmée Instagram & Facebook', trigger: 'Contenu au statut « Programmé »', action: 'Publication à la date et l’heure prévues', tool: 'Meta Business Suite', on: true },
  { id: 'au2', name: 'Publication programmée TikTok', trigger: 'Vidéo au statut « Programmé »', action: 'Publication via TikTok Studio', tool: 'TikTok Studio', on: true },
  { id: 'au3', name: 'Épingles Pinterest automatiques', trigger: 'Post Instagram publié', action: 'Création d’une épingle 2:3 avec lien produit', tool: 'Pinterest + outil de planification', on: false },
  { id: 'au4', name: 'Newsletter The Weekly Prep', trigger: 'Chaque dimanche à 9 h', action: 'Envoi de la newsletter validée la veille', tool: 'Outil d’e-mailing (ex. Brevo)', on: true },
  { id: 'au5', name: 'Rappel de validation', trigger: 'Contenu « En attente de validation » à J−2', action: 'Notification au propriétaire', tool: 'Marketing Studio', on: true },
  { id: 'au6', name: 'Bilan marketing mensuel', trigger: '1er jour de chaque mois', action: 'Génération du rapport Analytics & Reports', tool: 'Marketing Studio', on: true },
  { id: 'au7', name: 'Demande d’avis après livraison', trigger: 'Commande livrée + 5 jours', action: 'E-mail d’avis (flux First Purchase)', tool: 'Outil d’e-mailing', on: true },
  { id: 'au8', name: 'Alerte rupture de stock', trigger: 'Produit mis en avant passé en rupture', action: 'Statut « À mettre à jour » sur les contenus liés', tool: 'Back-office + Marketing Studio', on: true },
  { id: 'au9', name: 'Liens UTM automatiques', trigger: 'Création d’un contenu', action: 'Ajout utm_source / utm_medium / utm_campaign', tool: 'Marketing Studio', on: true },
];

/* ---------- Charte : ton & règles ---------- */
MK.tone = {
  words: ['Simple', 'Chaleureux', 'Précis', 'Flexible', 'Local'],
  dos: ['Vouvoyer, avec un ton proche et direct', 'Nommer les plats, les producteurs et les distances', 'Phrases courtes, une idée par phrase', 'Rappeler que l’abonnement est facultatif', 'Signature en anglais : Your week, prepared.'],
  donts: ['Allégations santé (« minceur », « détox », « brûle-graisses »)', 'Promesses non vérifiées sur la fraîcheur ou le bio', 'Urgence artificielle (« dernière chance » sans vraie date de fin)', 'Avis ou témoignages sans accord écrit', 'Musiques sans droits d’usage commercial'],
  checks: [
    'Les allégations de fraîcheur, de qualité et de méthodes de préparation sont vérifiées.',
    'Producteurs, origines et méthodes de production sont documentés.',
    'Prix, disponibilités et dates correspondent à la carte en vigueur.',
    'Les avis et visages clients sont publiés avec autorisation.',
    'Les collaborations portent la mention « Collaboration commerciale » ou « Publicité ».',
    'Les e-mails de prospection respectent le consentement (RGPD) et proposent la désinscription.',
  ],
};

/* =========================================================================
   BUDGET, PLANS DE CAMPAGNE ET IA
   Prix et performances = ORDRES DE GRANDEUR pour une petite marque food
   en France, à confirmer par des devis et par les premières campagnes.
   ========================================================================= */

/* Types de dépense : meta, tiktok, google (publicité) · influence · production · local · offre · outil · ia */
MK.budget = {
  types: {
    pub: { label: 'Publicité en ligne', color: '#5C6B3C', what: 'Annonces Instagram/Facebook (Meta), TikTok et Google pour toucher les Lyonnais qui ne te connaissent pas encore.' },
    influence: { label: 'Influence', color: '#B79B6C', what: 'Micro-créateurs lyonnais : box offertes + rémunération (environ 100 à 300 € par créateur de 5 000 à 30 000 abonnés).' },
    production: { label: 'Photos & vidéos', color: '#8A7B6A', what: 'Shootings avec un photographe culinaire (environ 400 à 600 € la demi-journée à Lyon) et petit matériel.' },
    local: { label: 'Actions locales', color: '#C9B48E', what: 'Flyers (environ 60 € les 1 000), affiches, dégustations à l’atelier, présence en coworking.' },
    offre: { label: 'Coût des offres', color: '#A3442E', what: 'Ce que coûtent les codes promo et cadeaux : c’est de la marge en moins, à prévoir comme une dépense.' },
    outil: { label: 'Outils & IA', color: '#2A2925', what: 'Abonnements : e-mailing, retouche, planification, assistant IA.' },
  },
  /* Hypothèses de performance publicitaire */
  hyp: { metaCpm: 8, metaCtr: 1.2, tiktokCpm: 6, tiktokCtr: 0.9, googleCpc: 1.1, conv: 2.5, panier: 35, marge: 55, ordersPerClient: 4 },
  scenarios: {
    petit: { label: 'Petit budget', factor: 0.4, text: 'On garde les outils, les shootings essentiels et l’organique ; pub et influence réduites à 40 %.' },
    reco: { label: 'Recommandé', factor: 1, text: 'Le plan prévu : un vrai lancement en novembre, puis un budget régulier chaque mois.' },
    fort: { label: 'Accéléré', factor: 1.7, text: 'Pour croître vite : pub et influence ×1,7, le reste identique.' },
  },
  /* Dépenses permanentes, chaque mois */
  monthly: [
    { label: 'Brevo — e-mails & automatisations', type: 'outil', amount: 9, detail: 'Formule Starter, environ 9 €/mois' },
    { label: 'Canva Pro — retouches & formats', type: 'outil', amount: 12, detail: 'Environ 12 €/mois' },
    { label: 'Metricool — planification & statistiques', type: 'outil', amount: 18, detail: 'Environ 18 €/mois (la version gratuite suffit au début)' },
    { label: 'Assistant IA (ChatGPT Plus ou Claude Pro)', type: 'ia', amount: 20, detail: 'Environ 20 €/mois — voir l’onglet « Géré par l’IA »' },
    { label: 'Pub permanente : Google « meal prep Lyon »', type: 'google', amount: 80, detail: 'Toute l’année, à partir de décembre', from: '2026-12' },
    { label: 'Pub permanente : relance des visiteurs (Meta)', type: 'meta', amount: 70, detail: 'Visiteurs du site ayant accepté les cookies', from: '2026-12' },
    { label: 'Contenu au quotidien (accessoires, plats shootés)', type: 'production', amount: 50, detail: 'Vaisselle, fonds, éclairage, plats utilisés pour les photos' },
  ],
  tools: [
    ['Meta Business Suite', 'Programmer Instagram et Facebook, voir les statistiques', 'Gratuit'],
    ['TikTok Studio', 'Programmer les vidéos TikTok', 'Gratuit'],
    ['Google Business Profile', 'Apparaître sur Google Maps, collecter des avis', 'Gratuit'],
    ['Google Analytics 4 + Search Console', 'Mesurer le trafic et le référencement', 'Gratuit'],
    ['CapCut', 'Monter les vidéos, sous-titres automatiques', 'Gratuit (Pro environ 10 €/mois)'],
    ['Brevo', 'Newsletter et e-mails automatiques', 'Environ 9 €/mois'],
    ['Canva Pro', 'Retoucher les visuels, redimensionner', 'Environ 12 €/mois'],
    ['Metricool', 'Tout planifier au même endroit', 'Gratuit ou environ 18 €/mois'],
    ['ChatGPT Plus ou Claude Pro', 'Assistant IA pour rédiger, analyser, traduire', 'Environ 20 €/mois'],
  ],
};

/* Plans détaillés : lignes de budget et étapes datées (décalage en jours par rapport au début) */
MK.campaignPlans = {
  launch: {
    lines: [
      { label: 'Meta Ads — notoriété, Lyon + 10 km', type: 'meta', amount: 200, detail: '16 → 29 nov., environ 14 €/jour' },
      { label: 'Meta Ads — première commande (code BIENVENUE10)', type: 'meta', amount: 250, detail: '20 nov. → 6 déc., visiteurs du site + audience similaire' },
      { label: 'TikTok Ads — vidéo coulisses boostée', type: 'tiktok', amount: 150, detail: '18 → 29 nov., 20–34 ans' },
      { label: 'Google Ads — « meal prep Lyon », « repas préparés Lyon »', type: 'google', amount: 300, detail: 'À partir du 16 nov., plafond 15 €/jour' },
      { label: 'Influence — 3 micro-créateurs lyonnais', type: 'influence', amount: 540, detail: '3 × 150 € + 3 box d’une semaine (coût environ 30 € chacune)' },
      { label: 'Shooting photo & vidéo à l’atelier', type: 'production', amount: 450, detail: 'Photographe culinaire, demi-journée, 10 plats + vidéos coulisses' },
      { label: 'Flyers et affiches (2 000 ex.)', type: 'local', amount: 120, detail: 'Coworkings Part-Dieu, salles de sport, commerces Gerland' },
      { label: 'Dégustation d’ouverture à l’atelier', type: 'local', amount: 150, detail: 'Samedi 21 nov., 80 portions dégustation' },
      { label: 'Coût du code BIENVENUE10', type: 'offre', amount: 315, detail: 'Environ 90 commandes × 35 € × 10 %' },
    ],
    steps: [
      [-21, 'Valider le budget du lancement et le code BIENVENUE10', 'Toi'],
      [-18, 'Réserver le photographe et choisir les 10 plats à photographier', 'Toi'],
      [-14, 'Shooting photo et vidéo à l’atelier de Gerland', 'Photographe'],
      [-12, 'Contacter 6 micro-créateurs lyonnais (objectif : 3 confirmés)', 'Toi'],
      [-10, 'Créer les comptes publicitaires Meta, TikTok et Google, installer le bandeau cookies', 'Toi'],
      [-7, 'Programmer les 3 teasers et les stories compte à rebours', 'Toi'],
      [-5, 'Imprimer les flyers et les déposer dans 15 lieux', 'Toi'],
      [-3, 'Envoyer les box aux créateurs confirmés', 'Toi'],
      [0, 'Teaser n°1 en ligne', 'Automatique'],
      [6, 'Newsletter « Demain, PREP CLUB ouvre »', 'Automatique'],
      [7, 'OUVERTURE : post officiel, newsletter, activation des pubs Meta, TikTok et Google', 'Toi'],
      [9, 'Publications des créateurs (fenêtre du 18 au 22 nov.)', 'Créateurs'],
      [11, 'Premier point pub : couper les annonces dont le clic coûte plus de 1,20 €', 'Toi'],
      [12, 'Dégustation d’ouverture à l’atelier', 'Équipe'],
      [16, 'Publier le classement des bestsellers avec les vraies ventes', 'Toi'],
      [20, 'Fin de campagne : arrêter les pubs de notoriété', 'Toi'],
      [23, 'Bilan : abonnés, commandes, coût par commande, dans « Mon suivi »', 'Toi'],
    ],
  },
  menu: {
    lines: [
      { label: 'Meta Ads — relance des visiteurs (box découverte)', type: 'meta', amount: 150, detail: 'Personnes ayant vu une fiche produit' },
      { label: 'Meta Ads — conversion Box découverte', type: 'meta', amount: 120, detail: 'Audience similaire aux premiers clients' },
      { label: 'Influence — 1 créatrice food', type: 'influence', amount: 200, detail: 'Dégustation de 5 plats en vidéo' },
    ],
    extra: [[-10, 'Préparer les fiches « lire une étiquette » (carrousel nutrition)', 'Toi'], [4, 'Story questions : « Quel plat voulez-vous goûter ? »', 'Toi']],
  },
  winter: {
    lines: [
      { label: 'Meta Ads — idées cadeaux et Box de saison', type: 'meta', amount: 200, detail: '14 → 24 déc.' },
      { label: 'Shooting collection d’hiver', type: 'production', amount: 300, detail: '6 plats d’hiver + ambiance fêtes' },
      { label: 'Cartes de vœux glissées dans les commandes', type: 'local', amount: 40, detail: '500 cartes' },
    ],
    extra: [[-12, 'Fixer les jours de fermeture des fêtes et les annoncer', 'Toi'], [8, 'Dernier jour de commande avant Noël : story + e-mail', 'Toi']],
  },
  plan: {
    lines: [
      { label: 'Meta Ads — trafic vers le planning', type: 'meta', amount: 180, detail: '4 → 17 janv., résolutions de janvier' },
      { label: 'TikTok Ads — « ma routine du dimanche »', type: 'tiktok', amount: 120, detail: '4 → 17 janv.' },
      { label: 'Google Ads — « organisation repas semaine »', type: 'google', amount: 150, detail: '4 → 17 janv.' },
      { label: 'Influence — 2 créateurs « organisation »', type: 'influence', amount: 300, detail: '2 × 150 €' },
      { label: 'Livraison offerte sur le 1er planning', type: 'offre', amount: 590, detail: 'Environ 120 commandes × 4,90 €' },
    ],
    extra: [[-7, 'Enregistrer l’écran du planning pour le Reel démo', 'Toi']],
  },
  club: {
    lines: [
      { label: '1er mois du Club Plus à −50 %', type: 'offre', amount: 200, detail: 'Environ 40 nouveaux membres × 5 €' },
      { label: 'Meta Ads — clients réguliers', type: 'meta', amount: 100, detail: 'Clients ayant commandé 3 fois ou plus' },
    ],
    extra: [[-10, 'Relire les conditions d’abonnement et de résiliation (CGV)', 'Toi'], [3, 'E-mail personnel aux 100 meilleurs clients', 'Toi']],
  },
  spring: {
    lines: [
      { label: 'Meta Ads — collection de printemps', type: 'meta', amount: 150, detail: '15 → 28 mars' },
      { label: 'Shooting collection de printemps', type: 'production', amount: 350, detail: '6 plats + visite des Vergers du Pilat' },
      { label: 'Influence — 1 créateur « produits locaux »', type: 'influence', amount: 200, detail: 'Visite chez un producteur' },
    ],
    extra: [[-14, 'Organiser la visite filmée chez un producteur (avec son accord écrit)', 'Toi']],
  },
  thanks: {
    lines: [
      { label: 'Points de fidélité doublés', type: 'offre', amount: 250, detail: 'Coût estimé des récompenses en plus' },
      { label: 'Dessert offert aux 50 meilleurs clients', type: 'offre', amount: 100, detail: '50 × 2 € de coût' },
    ],
    extra: [[-10, 'Demander 10 avis clients avec autorisation écrite de publication', 'Toi']],
  },
  summer: {
    lines: [
      { label: 'Meta Ads — Summer Meal Prep', type: 'meta', amount: 250, detail: '7 → 20 juin' },
      { label: 'Shooting collection d’été en extérieur', type: 'production', amount: 350, detail: 'Pique-nique sur les quais' },
      { label: 'Influence — 2 créateurs lifestyle', type: 'influence', amount: 400, detail: '2 × 200 €' },
    ],
    extra: [[-7, 'Prévoir l’organisation des livraisons pendant les vacances', 'Toi']],
  },
  routine: {
    lines: [
      { label: 'Meta Ads — rentrée, Lunch Box', type: 'meta', amount: 300, detail: '30 août → 12 sept.' },
      { label: 'TikTok Ads — « le déj de bureau »', type: 'tiktok', amount: 150, detail: 'Vidéo avant/après boostée' },
      { label: 'Google Ads — « déjeuner bureau Lyon »', type: 'google', amount: 200, detail: 'Part-Dieu, Gerland, Confluence' },
      { label: 'Influence — 2 créateurs « vie de bureau »', type: 'influence', amount: 300, detail: '2 × 150 €' },
      { label: 'Flyers entreprises (1 000 ex.) + dépôts', type: 'local', amount: 150, detail: '20 entreprises et coworkings' },
      { label: 'Offre de rentrée sur la Lunch Box', type: 'offre', amount: 500, detail: 'Environ 100 commandes × 5 €' },
    ],
    extra: [[-14, 'Lister 20 entreprises de la Part-Dieu à démarcher', 'Toi'], [2, 'Dépôt des flyers en entreprise', 'Toi']],
  },
  autumn: {
    lines: [
      { label: 'Meta Ads — collection d’automne', type: 'meta', amount: 150, detail: '20 sept. → 3 oct.' },
      { label: 'Shooting collection d’automne', type: 'production', amount: 350, detail: 'Champignonnière des Monts du Lyonnais' },
      { label: 'Influence — 1 créatrice food', type: 'influence', amount: 200, detail: 'Recette avec un plat de la collection' },
    ],
    extra: [],
  },
};
/* Étapes communes à toutes les campagnes (hors lancement) */
MK.stepsCommon = [
  [-21, 'Valider le budget et l’offre de la campagne', 'Toi'],
  [-14, 'Photos et vidéos de la campagne (shooting ou téléphone)', 'Toi'],
  [-10, 'Relire les textes prêts dans le studio et les adapter aux prix réels', 'Toi'],
  [-7, 'Créer les vidéos et visuels dans « Vidéos & visuels »', 'Toi'],
  [-5, 'Paramétrer les pubs : audience, budget, dates de début et de fin', 'Toi'],
  [-3, 'Programmer les publications et la newsletter', 'Toi'],
  [0, 'Lancement de la campagne', 'Automatique'],
  [3, 'Premier point : regarder le coût par clic et couper ce qui ne marche pas', 'Toi'],
  [7, 'Mi-parcours : relance en story et par e-mail', 'Toi'],
  ['end', 'Fin : arrêter les pubs de la campagne', 'Toi'],
  ['end+3', 'Bilan chiffré dans « Mon suivi »', 'Toi'],
];

/* ---------- Géré par l'IA ---------- */
MK.ai = {
  tasks: [
    { area: 'SEO & blog', what: 'Rédiger les articles de blog à partir des plans prêts, optimiser titres et descriptions Google', when: '2 articles par mois', tool: 'ChatGPT ou Claude', human: 'Relire, vérifier les infos, ajouter une vraie photo', gain: '3 h par article' },
    { area: 'SEO local', what: 'Rédiger la fiche Google Business Profile, répondre aux avis Google', when: 'Chaque semaine', tool: 'ChatGPT ou Claude', human: 'Valider chaque réponse avant publication', gain: '1 h / semaine' },
    { area: 'Publicité', what: 'Créer 5 variantes de textes pour chaque pub, puis garder celle qui marche', when: 'À chaque campagne', tool: 'ChatGPT ou Claude + Meta Advantage+', human: 'Valider le budget, vérifier les promesses', gain: '2 h par campagne' },
    { area: 'Ciblage pub', what: 'Laisser l’algorithme trouver les bonnes personnes (ciblage automatique)', when: 'En continu', tool: 'Meta Advantage+, Google Performance Max', human: 'Fixer un plafond de budget quotidien', gain: 'Meilleur coût par commande' },
    { area: 'Réseaux sociaux', what: 'Idées de Reels selon les tendances, légendes, hashtags', when: 'Chaque lundi', tool: 'ChatGPT ou Claude', human: 'Choisir et adapter au ton PREP CLUB', gain: '2 h / semaine' },
    { area: 'Vidéo', what: 'Sous-titres automatiques, découpe des vidéos longues en Reels', when: 'À chaque vidéo', tool: 'CapCut (sous-titres auto)', human: 'Relire les sous-titres', gain: '30 min par vidéo' },
    { area: 'Commentaires & messages', what: 'Préparer les réponses aux commentaires et messages fréquents', when: 'Chaque jour', tool: 'ChatGPT ou Claude', human: 'Toujours relire, jamais d’envoi automatique', gain: '20 min / jour' },
    { area: 'E-mails', what: 'Objets d’e-mail testés A/B, meilleure heure d’envoi', when: 'Chaque newsletter', tool: 'Brevo (fonctions IA intégrées)', human: 'Valider le texte final', gain: '+ d’ouvertures' },
    { area: 'Analyse', what: 'Lire les chiffres du mois et proposer 3 actions', when: '1er de chaque mois', tool: 'ChatGPT ou Claude', human: 'Décider des actions', gain: '2 h / mois' },
    { area: 'Traduction', what: 'Version anglaise des posts et du site (expatriés, étudiants)', when: 'Si la stratégie bilingue est retenue', tool: 'ChatGPT, Claude ou DeepL', human: 'Relecture par un anglophone', gain: '1 h / semaine' },
  ],
  week: [
    ['Lundi', 'L’IA propose 5 idées de Reels et les légendes de la semaine', '15 min de validation'],
    ['Mardi', 'L’IA prépare les réponses aux commentaires et aux avis Google', '10 min'],
    ['Mercredi', 'L’IA rédige un brouillon d’article de blog (1 semaine sur 2)', '30 min de relecture'],
    ['Jeudi', 'L’IA crée des variantes de pubs, Meta garde les meilleures', '10 min'],
    ['Vendredi', 'CapCut sous-titre automatiquement les vidéos de la semaine', '15 min'],
    ['Dimanche', 'Brevo choisit le meilleur objet de la newsletter (test A/B)', 'Automatique'],
  ],
  rules: [
    'L’IA prépare, un humain valide : rien n’est publié sans relecture.',
    'Aucune donnée client (nom, e-mail, adresse) ne doit être collée dans un outil d’IA.',
    'Vérifier chaque chiffre, prix, origine ou allégation proposé par l’IA : elle peut se tromper.',
    'Pas d’allégations santé, même si l’IA en propose.',
    'Pas d’images de plats générées par IA présentées comme de vraies photos : on montre les vrais plats.',
    'Les avis clients ne s’inventent pas, même « pour l’exemple ».',
  ],
};

/* ---------- Mes comptes : profils sur chaque réseau ---------- */
MK.accounts = {
  handle: '@prepclub.lyon',
  alternatives: ['@prepclub_lyon', '@prepclublyon', '@prepclub.mealprep'],
  handleWhy: 'Le même identifiant partout : on te retrouve en un clic, et « lyon » aide les gens d’ici à te trouver.',
  networks: {
    instagram: {
      label: 'Instagram', name: 'PREP CLUB · Meal prep Lyon', nameMax: 30,
      nameWhy: 'Le champ « Nom » compte dans la recherche Instagram : on y ajoute « Meal prep Lyon » pour apparaître quand quelqu’un le tape.',
      bioMax: 150,
      bio: 'Repas préparés à Lyon 🥗\nÀ la carte, en box ou planifiés\nSans abonnement · livraison le jeudi\n👇 Le menu de la semaine',
      category: 'Service de livraison de repas',
      settings: [
        'Passer en compte professionnel (Paramètres → Type de compte et outils)',
        'Catégorie affichée : « Service de livraison de repas »',
        'Ajouter le bouton « E-mail » et l’adresse de l’atelier (24 rue de Gerland, 69007 Lyon)',
        'Mettre le lien du site (ou d’une page de liens) dans la bio',
        'Créer les 7 stories à la une avec les couvertures ci-dessous',
        'Épingler 3 publications en haut du profil',
        'Activer les « Questions fréquentes » dans les messages',
        'Enregistrer les réponses rapides (Paramètres → Outils pro → Réponses enregistrées)',
        'Relier le compte à la page Facebook (pour la pub et Meta Business Suite)',
      ],
    },
    tiktok: {
      label: 'TikTok', name: 'PREP CLUB', nameMax: 30, nameWhy: 'Court et mémorisable : sur TikTok, la marque compte plus que les mots-clés.',
      bioMax: 80,
      bio: 'Meal prep à Lyon 🥗 Ta semaine, prête.\nSans abonnement 👇',
      category: 'Alimentation et boissons',
      settings: [
        'Passer en compte Entreprise (Paramètres → Compte)',
        'Catégorie : « Alimentation et boissons »',
        'Ajouter le lien du site dans la bio',
        'Ajouter l’adresse e-mail de contact',
        'Créer 3 playlists : « Ma semaine », « En cuisine », « Nos producteurs »',
        'Épingler les 3 meilleures vidéos en haut du profil',
      ],
    },
    pinterest: {
      label: 'Pinterest', name: 'PREP CLUB · Meal prep Lyon', nameMax: 65, nameWhy: 'Pinterest est un moteur de recherche : les mots-clés dans le nom aident beaucoup.',
      bioMax: 500,
      bio: 'Idées de meal prep, lunch box et menus de la semaine, par PREP CLUB, repas préparés à Lyon. Des recettes de saison avec nos producteurs de la région, à préparer soi-même ou à commander tout prêts, sans abonnement.',
      category: 'Alimentation et boissons',
      settings: [
        'Créer un compte professionnel',
        'Revendiquer le site web (pour voir les statistiques et afficher le logo sur les épingles)',
        'Créer 5 tableaux : « Meal prep facile », « Lunch box bureau », « Petits-déjeuners prêts d’avance », « Recettes de saison », « Organiser sa semaine »',
        'Écrire une description de 2 phrases avec mots-clés pour chaque tableau',
      ],
    },
    facebook: {
      label: 'Facebook', name: 'PREP CLUB', nameMax: 75, nameWhy: 'Le nom exact de la marque : la page sert surtout à la pub et aux avis.',
      bioMax: 101,
      bio: 'Repas préparés à Lyon : à la carte, en box ou planifiés. Sans abonnement. Livraison le jeudi.',
      category: 'Service de livraison de repas',
      settings: [
        'Créer une Page (pas un profil personnel)',
        'Catégorie : « Service de livraison de repas »',
        'Ajouter adresse, horaires de retrait, site web et e-mail',
        'Bouton d’action : « Commander »',
        'Relier la page au compte Instagram',
        'Créer le compte publicitaire dans Meta Business Suite',
      ],
    },
    google: {
      label: 'Google', name: 'PREP CLUB', nameMax: 100, nameWhy: 'Google interdit d’ajouter des mots-clés dans le nom : mets uniquement le vrai nom de l’entreprise.',
      bioMax: 750,
      bio: 'PREP CLUB prépare des repas pour toute la semaine à Lyon : petits-déjeuners, déjeuners, dîners, en-cas et desserts, cuisinés dans notre atelier de Gerland avec des ingrédients de saison et six producteurs de la région. Commandez à la carte, choisissez une formule, composez votre box ou planifiez votre semaine en quelques minutes, sans abonnement obligatoire. Livraison le jeudi à domicile dans la métropole de Lyon, ou retrait à l’atelier (Lyon 7e), à la Part-Dieu et à la Croix-Rousse. Valeurs nutritionnelles, allergènes et origine des ingrédients sont indiqués pour chaque plat.',
      category: 'Service de livraison de repas (secondaire : Traiteur)',
      settings: [
        'Créer la fiche Google Business Profile et la faire valider (courrier ou vidéo)',
        'Catégorie principale : « Service de livraison de repas »',
        'Ajouter les horaires de retrait et la zone de livraison',
        'Ajouter au moins 10 vraies photos : plats, atelier, équipe',
        'Ajouter les produits (box et plats phares) avec leur prix',
        'Mettre le lien de commande vers le site',
        'Publier un post Google chaque semaine (le menu)',
        'Répondre à chaque avis sous 48 h',
      ],
    },
  },
  links: [
    ['🥗', 'Le menu de la semaine', '#/carte'],
    ['📅', 'Planifier ma semaine', '#/planning'],
    ['🎁', 'Box découverte', '#/box-decouverte'],
    ['✉️', 'La newsletter du dimanche', '#/'],
    ['🌱', 'Nos producteurs', '#/nos-producteurs'],
    ['⭐', 'Laisser un avis', 'Lien de la fiche Google'],
  ],
  highlights: [
    { name: 'Menu', icon: 'bowl', inside: 'Le menu de la semaine, republié chaque dimanche (supprime l’ancien).' },
    { name: 'Commander', icon: 'bag', inside: 'Comment commander en 3 étapes, livraison et points de retrait.' },
    { name: 'Planning', icon: 'calendar', inside: 'Démonstration du planning de la semaine, en vidéo.' },
    { name: 'Producteurs', icon: 'leaf', inside: 'Une story par producteur : nom, lieu, distance, ce qu’il cultive.' },
    { name: 'Avis', icon: 'star', inside: 'Repartages de stories et avis clients (avec leur accord).' },
    { name: 'FAQ', icon: 'question', inside: 'Conservation, allergènes, livraison, abonnement : une question par story.' },
    { name: 'Coulisses', icon: 'camera', inside: 'L’atelier, la préparation, l’emballage des commandes.' },
  ],
  pinned: [
    ['Qui sommes-nous', 'Présentation de PREP CLUB : l’atelier, l’équipe, la promesse « Your week, prepared. »'],
    ['Comment ça marche', 'Carrousel en 3 étapes : je choisis, je reçois jeudi, je réchauffe.'],
    ['L’offre de bienvenue', '−10 % sur la première commande, ou ton meilleur avis client.'],
  ],
  grid: [
    'Alterne une photo de plat, un visuel texte, une vidéo : la grille reste variée.',
    'Garde les mêmes couleurs (crème, olive, sable) sur tous les visuels texte.',
    'Photos de plats vues du dessus, en lumière du jour, sur fond clair.',
    'Pas plus de 2 visuels texte à la suite.',
    'Les couvertures de Reels utilisent toujours la même typo (Inter, gras).',
  ],
  faq: [
    ['Comment commander ?', 'Sur notre site : choisissez vos plats à la carte, une formule ou une box, avant mercredi minuit pour être livré le jeudi 🥗'],
    ['Où livrez-vous ?', 'À domicile dans la métropole de Lyon, ou en retrait à l’atelier (Gerland), à la Part-Dieu et à la Croix-Rousse.'],
    ['Faut-il un abonnement ?', 'Non ! Vous commandez quand vous voulez. Le Club est une option pour avoir des réductions.'],
    ['Combien de temps se gardent les plats ?', 'Jusqu’à la date indiquée sur l’étiquette, au réfrigérateur entre 0 et 4 °C. Ils se réchauffent en 2 minutes.'],
  ],
  type: {
    fonts: [
      { name: 'Fraunces', role: 'Titres, citations, logo', sample: 'Your week, prepared.', serif: true, where: 'Gratuite sur Google Fonts, disponible dans Canva', sizes: 'Titres de 60 à 110 px sur un visuel de 1080 px' },
      { name: 'Inter', role: 'Textes, sous-titres, textes sur les vidéos', sample: 'Ta semaine de repas, prête en 5 minutes.', serif: false, where: 'Gratuite sur Google Fonts, disponible dans Canva', sizes: 'Textes de 28 à 50 px ; textes sur vidéo en gras (800–900)' },
    ],
    apps: [
      ['Stories Instagram', 'Police « Moderne » ou « Classique », fond blanc derrière le texte (bouton « A »)'],
      ['TikTok', 'Police « Classique », fond blanc derrière le texte : c’est le style des vidéos du studio'],
      ['Reels (couverture)', 'Inter en gras, texte blanc, 3 à 6 mots maximum'],
      ['Canva', 'Ajoute Fraunces et Inter dans « Kit de marque » pour les retrouver en un clic'],
    ],
  },
};

/* ---------- Proposition : le film de lancement (video-pub.html) ---------- */
MK.film = {
  status: 'Proposition',
  name: 'Le film de lancement',
  pitch: 'Un film de 50 secondes en motion design qui présente PREP CLUB d’un seul tenant : la question de tous les soirs (« On mange quoi ce soir ? »), la marque, les trois façons de commander sur le site, les producteurs, la livraison et l’offre de bienvenue.',
  files: [
    { src: 'videos/prepclub-film-16x9.mp4', poster: 'videos/prepclub-film-16x9-couverture.jpg', fmt: '16:9', w: 1920, h: 1080, label: 'Version horizontale', use: 'Site, YouTube, LinkedIn, écrans' },
    { src: 'videos/prepclub-film-9x16.mp4', poster: 'videos/prepclub-film-9x16-couverture.jpg', fmt: '9:16', w: 1080, h: 1920, label: 'Version verticale', use: 'Reels, TikTok, Stories, publicité Meta' },
  ],
  why: [
    ['Tout le service en une vidéo', 'Carte, box, planning, producteurs, livraison : le film répond aux questions qu’on se pose avant une première commande.'],
    ['Se comprend sans le son', 'Tout passe par le texte à l’écran ; la musique (originale, sans droits à payer) est un plus.'],
    ['Le site en vrai', 'On voit le panier se remplir, la box se composer et le planning se générer : c’est la preuve de la flexibilité.'],
    ['Une seule base, deux formats', 'Même film en 16:9 et en 9:16, textes modifiables dans l’outil pour l’adapter à chaque campagne.'],
  ],
  pillars: ['Flexibilité', 'Organisation', 'Local & saison', 'Transparence'],
  plan: [
    { when: 'Lun. 16 nov. · 18 h', where: 'Instagram', fmt: '9:16', how: 'Reel de lancement, épinglé en haut du profil pendant toute la campagne.' },
    { when: 'Lun. 16 nov. · 18 h 30', where: 'TikTok', fmt: '9:16', how: 'Même vidéo, légende courte + lien en bio.' },
    { when: 'Lun. 16 nov.', where: 'Site · accueil', fmt: '16:9', how: 'Bloc « PREP CLUB en 50 secondes » sous le bandeau, lecture sans son au survol.' },
    { when: 'Lun. 16 nov.', where: 'Newsletter', fmt: '16:9', how: 'Image de couverture cliquable vers la vidéo (une vidéo ne se lit pas dans un e-mail).' },
    { when: '16 → 29 nov.', where: 'Publicité Meta', fmt: '9:16', how: 'Reels et Stories, Lyon + 15 km, 25–40 ans, objectif « trafic vers le site » avec le code BIENVENUE10.' },
    { when: 'Mer. 18 nov.', where: 'LinkedIn', fmt: '16:9', how: 'Page entreprise : présentation du service + offre Entreprises (Office Box), cible Part-Dieu.' },
    { when: 'Décembre', where: 'YouTube', fmt: '16:9', how: 'Chaîne de marque ; annonce avant les vidéos à tester seulement si la pub Meta fonctionne.' },
    { when: 'En continu', where: 'Atelier Gerland', fmt: '16:9', how: 'Écran en boucle, sans son, au point de retrait.' },
  ],
  budget: { amount: 200, of: 600, campaign: 'Lancement', detail: '200 € sur les 600 € du lancement, répartis sur 2 semaines (environ 14 € par jour). Validation du budget avant toute dépense.' },
  kpis: [
    ['Vues de 3 secondes', 'L’accroche retient-elle ? Si moins de 25 % des personnes touchées, changer la première phrase.'],
    ['Vues complètes', 'Le film tient-il jusqu’à l’offre ? Objectif de départ : 15 % des lectures.'],
    ['Clics vers le site', 'Lien en bio, lien de la pub, clics depuis la newsletter (suivis avec des liens UTM).'],
    ['Utilisations de BIENVENUE10', 'Le vrai résultat : les premières commandes générées.'],
  ],
  before: [
    'Remplacer l’adresse du site (provisoire dans le film) puis réexporter depuis l’outil.',
    'Remplacer les photos et producteurs de démonstration par les vrais, ou les faire valider.',
    'Vérifier que le code BIENVENUE10 est actif sur le site le jour du lancement.',
    'Compresser les fichiers avant de les mettre sur le site (65 à 75 Mo chacun aujourd’hui).',
  ],
  next: [
    ['Version courte 15 s', 'Accroche + site en action + offre, pour la pub en Stories.'],
    ['3 extraits de 6 à 10 s', '« Le problème », « Le site en action », « Nos producteurs » : un contenu par semaine.'],
    ['Variante Entreprises', 'Même film avec l’Office Box à la place du planning, pour LinkedIn.'],
  ],
};
