/* =========================================================================
   PREP CLUB — Marketing Studio : moteur
   État (localStorage), génération du calendrier éditorial sur 12 mois,
   rendu des visuels (HTML pour l'aperçu, canvas pour l'export PNG).
   ========================================================================= */
'use strict';

const ST_KEY = 'prepclub:marketing:v1';
const CAL_START = '2026-11-09'; // lundi, début de la campagne de lancement
const CAL_WEEKS = 52;

/* ---------- Dates ---------- */
const D = {
  parse: (iso) => { const [y, m, d] = iso.split('-').map(Number); return new Date(y, m - 1, d); },
  iso: (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
  add: (iso, n) => { const d = D.parse(iso); d.setDate(d.getDate() + n); return D.iso(d); },
  monday: (iso) => { const d = D.parse(iso); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return D.iso(d); },
  diff: (a, b) => Math.round((D.parse(b) - D.parse(a)) / 86400000),
  today: () => D.iso(new Date()),
  months: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],
  monthsShort: ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'],
  days: ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'],
  daysShort: ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'],
  fmt: (iso, opt = {}) => {
    const d = D.parse(iso);
    const day = opt.weekday ? `${D.days[d.getDay()]} ` : '';
    return `${day}${d.getDate()} ${opt.long ? D.months[d.getMonth()] : D.monthsShort[d.getMonth()]}${opt.year ? ` ${d.getFullYear()}` : ''}`;
  },
};

/* ---------- État ---------- */
const store = {
  data: null,
  load() {
    try { this.data = JSON.parse(localStorage.getItem(ST_KEY)); } catch (e) { this.data = null; }
    this.data = Object.assign({ overrides: {}, custom: [], tasks: {}, templates: {}, autos: {}, flows: {}, campaigns: {}, ads: {}, infl: {}, inflAdded: [], seo: {}, lang: 'fr' }, this.data || {});
  },
  save() { try { localStorage.setItem(ST_KEY, JSON.stringify(this.data)); } catch (e) { /* stockage indisponible : l'état reste en mémoire */ } },
  reset() { try { localStorage.removeItem(ST_KEY); } catch (e) { /* ignore */ } this.data = null; this.load(); },
};
store.load();

/* ---------- Banques de sujets ---------- */
const prod = (id) => PRODUCTS.find((p) => p.id === id);
const euro = (v) => `${v.toFixed(2).replace('.', ',')} €`;
const seasonOf = (iso) => { const m = D.parse(iso).getMonth(); return m >= 2 && m <= 4 ? 'spring' : m >= 5 && m <= 7 ? 'summer' : m >= 8 && m <= 10 ? 'autumn' : 'winter'; };

const BANK = {
  planning: [
    { title: 'Votre semaine en 4 moments de repas', head: 'Votre semaine, déjà organisée.', body: 'Petit-déjeuner, déjeuner, dîner, en-cas : quatre moments, sept jours, un seul panier.\n\nLe planning vous propose même une semaine toute faite, à ajuster en un clic.', tpl: 'planner' },
    { title: 'Exemple de semaine : le rythme bureau', head: 'Une semaine type, version bureau.', body: 'Lunch Box du lundi au vendredi, deux dîners prêts pour les soirs chargés, et le week-end pour cuisiner si l’envie vous prend.\n\nEnregistrez ce post pour votre prochain dimanche.', tpl: 'planner' },
    { title: '3 astuces pour planifier en 5 minutes', head: 'Planifier sa semaine en 5 minutes.', body: '1. Regardez votre agenda avant la carte.\n2. Gardez vos favoris en un clic.\n3. Laissez la suggestion automatique compléter les trous.\n\nQuelle astuce allez-vous tester ?', tpl: 'planner' },
    { title: 'Lundi : on commence la semaine du bon pied', head: 'Less planning. More enjoying.', body: 'Le frigo est rempli, les déjeuners sont prêts, il ne reste plus qu’à profiter de la semaine.\n\nEt vous, votre lundi ressemble à quoi ?', tpl: 'brand' },
    { title: 'Exemple de semaine végétarienne', head: 'Une semaine 100 % végétarienne.', body: 'Pudding de chia, bol méditerranéen, curry de légumes, pâtes au pesto… Une semaine sans viande, entièrement composée à partir de la carte.', tpl: 'planner' },
    { title: 'Le planning, mode d’emploi', head: 'Le planning en 4 étapes.', body: 'Choisissez vos jours, placez vos repas, vérifiez le récapitulatif, transformez-le en panier.\n\nVotre planning est sauvegardé pour la semaine suivante.', tpl: 'planner' },
    { title: 'Prix par repas : le vrai calcul', head: 'Combien coûte vraiment un repas ?', body: 'Ingrédients, temps de courses, temps de cuisine, vaisselle… Comparez avec une Lunch Box PREP CLUB : le calcul est vite fait.\n\nPrix à jour sur la carte.', tpl: 'lunch' },
    { title: 'Organiser les repas d’un couple', head: 'Deux agendas, une seule commande.', body: 'Le planning permet de prévoir des repas différents pour chacun, dans le même panier.\n\nIdentifiez la personne qui organise toujours les repas chez vous.', tpl: 'planner' },
  ],
  product: ['chicken-rice-veg', 'salmon-quinoa', 'overnight-oats', 'seasonal-bowl', 'lasagna', 'mediterranean-bowl', 'salmon-coconut-curry', 'chia-pudding', 'pesto-pasta', 'chicken-mushrooms', 'energy-balls', 'veggie-curry', 'chocolate-mousse', 'egg-avocado-box', 'buddha-bowl', 'beef-meatballs'],
  pins: [
    { title: 'Meal prep inspiration', head: 'Idées meal prep pour la semaine', tpl: 'weekly-menu' },
    { title: 'Weekly meal planning', head: 'Modèle de planning de repas', tpl: 'planner' },
    { title: 'Healthy breakfast ideas', head: '5 petits-déjeuners prêts d’avance', tpl: 'breakfast' },
    { title: 'Lunch box inspiration', head: 'Lunch box pour le bureau', tpl: 'lunch' },
    { title: 'Recettes de saison', head: 'Recettes de saison', tpl: 'seasonal' },
    { title: 'Desserts maison', head: 'Desserts maison pour la semaine', tpl: 'snacks' },
  ],
  fridayLife: ['r5', 'r8', 'r2', 'r7'],
  wedReels: ['r3', 'r4', 'r1', 'r8'],
  monTik: ['r7', 'r1'],
};

const SEASON_TXT = {
  winter: 'les choux, poireaux, carottes et agrumes',
  spring: 'les asperges, petits pois et premières fraises',
  summer: 'les tomates, courgettes, aubergines et le basilic',
  autumn: 'les courges, champignons, poires et noisettes',
};

/* Contenus spécifiques au lancement (date|slot) */
const LAUNCH = {
  '2026-11-09|ig-mon': { title: 'Teaser 1/3 — Quelque chose se prépare à Lyon', tpl: 'brand', kicker: 'Bientôt', headline: 'Quelque chose se prépare à Lyon.', sub: 'Lundi 16 novembre', caption: 'Quelque chose se prépare à Gerland.\n\nUne nouvelle façon d’organiser vos repas de la semaine arrive à Lyon.\n\nActivez les notifications pour ne rien manquer.', cta: 'Abonnez-vous pour être prévenu.', goal: 'Notoriété' },
  '2026-11-11|ig-wed': { title: 'Teaser 2/3 — Votre semaine va changer', tpl: 'type-dark', kicker: 'J−5', headline: 'Votre semaine va changer.', sub: 'PREP CLUB · Lyon', caption: 'Moins de courses. Moins de vaisselle. Plus de temps.\n\nOn vous dit tout lundi.\n\nInscrivez-vous à la newsletter pour recevoir l’ouverture en avant-première.', cta: 'Inscrivez-vous via le lien en bio.', goal: 'Notoriété' },
  '2026-11-13|reel-fri': { title: 'Teaser 3/3 — Rendez-vous lundi 16 novembre', reel: 'r5', kicker: 'J−3', headline: 'Lundi 16 novembre.', caption: 'Premières images de l’atelier. Ouverture lundi 16 novembre.', goal: 'Notoriété' },
  '2026-11-15|ig-sun': { title: 'Demain, on ouvre', tpl: 'type-olive', kicker: 'J−1', headline: 'Demain, on ouvre.', sub: 'Code BIENVENUE10 pour votre première commande', caption: 'Demain, la carte PREP CLUB sera en ligne.\n\nPetits-déjeuners, déjeuners, dîners, en-cas et desserts, à commander librement.\n\nCode BIENVENUE10 : −10 % sur votre première commande.', cta: 'Rendez-vous demain sur le site.', goal: 'Conversion' },
  '2026-11-16|ig-mon': { title: 'Annonce officielle : PREP CLUB est ouvert', cap: 'c1', tpl: 'brand', goal: 'Notoriété' },
  '2026-11-18|ig-wed': { title: 'Présentation des offres : carte, formules, box', tpl: 'weekly-menu', kicker: 'À votre façon', headline: 'À la carte, en formule ou en box.', sub: 'Sans abonnement obligatoire', caption: 'Trois façons de commander chez PREP CLUB :\n\n→ À la carte : uniquement ce dont vous avez besoin.\n→ En formule : Box Petit-déjeuner, Déjeuner, Dîner ou Journée complète.\n→ En box à composer : vos plats, vos règles.\n\nEt l’abonnement Club ? Facultatif.', cta: 'Choisissez votre façon de commander.', goal: 'Conversion', link: '#/formules' },
  '2026-11-20|reel-fri': { title: 'Présentation de la marque : un matin à l’atelier', reel: 'r5', goal: 'Confiance' },
  '2026-11-23|ig-mon': { title: 'Présentation du Weekly Planner', cap: 'c2', tpl: 'planner', goal: 'Weekly Planner' },
  '2026-11-25|ig-wed': { title: 'Présentation des produits : nos bestsellers', tpl: 'bestseller', kicker: 'Bestsellers', headline: 'Les plats que vous commandez le plus.', sub: 'Depuis notre ouverture', caption: 'Une semaine après l’ouverture, voici vos cinq plats préférés :\n\n1. Poulet, riz & légumes rôtis\n2. Bol saumon & quinoa\n3. Lasagnes maison\n4. Porridge froid aux fruits rouges\n5. Pâtes au pesto', note: 'Remplace ce classement par tes vraies meilleures ventes.', cta: 'Découvrez la carte complète.', goal: 'Conversion', link: '#/carte' },
  '2026-11-15|nl': { title: 'The Weekly Prep #1 — Demain, PREP CLUB ouvre', subject: 'Demain, PREP CLUB ouvre · votre code de bienvenue' },
};

const CAMPAIGN_CAPTION = { menu: 'c9', winter: 'c3', plan: 'c2', club: 'c8', spring: 'c3', thanks: 'c10', summer: 'c3', routine: 'c11', autumn: 'c3' };
const campaignAt = (iso) => MK.campaigns.find((c) => { const cs = campaignState(c); return iso >= cs.start && iso <= cs.end; });
function campaignState(c) { return Object.assign({}, c, store.data.campaigns[c.id] || {}); }

/* ---------- Génération du calendrier ---------- */
function utm(link, platform, campaign) {
  return `${link}${link.includes('?') ? '&' : '?'}utm_source=${platform}&utm_medium=social&utm_campaign=${campaign || 'always-on'}`;
}

function buildCalendar() {
  const items = [];
  const campaignIdx = {};
  let nlNum = 0;
  const push = (it) => items.push(it);

  for (let w = 0; w < CAL_WEEKS; w++) {
    const mon = D.add(CAL_START, w * 7);
    const day = (n) => D.add(mon, n);
    const firstFriOfMonth = D.parse(day(4)).getDate() <= 7;

    const base = (slot, date, extra) => {
      const camp = campaignAt(date);
      return Object.assign({ id: `${date}|${slot}`, slot, date, campaign: camp ? camp.id : null, week: w }, extra);
    };

    /* --- Lundi : post planning + TikTok routine --- */
    {
      const t = BANK.planning[w % BANK.planning.length];
      push(base('ig-mon', day(0), { platform: 'instagram', format: 'carousel', time: '12:30', pillar: 'planning', goal: 'Engagement', title: t.title, tpl: t.tpl, headline: t.head, caption: `${t.head}\n\n${t.body}`, cta: 'Planifiez votre semaine — lien en bio.', link: '#/planning', tags: ['#WeeklyPlanner', '#MealPlanning', '#MealPrepLyon', '#PrepClub'] }));
      const r = MK.reels.find((x) => x.id === BANK.monTik[w % 2]);
      push(base('tt-mon', day(0), { platform: 'tiktok', format: 'video', time: '18:30', pillar: 'planning', goal: 'Notoriété', title: `Meal prep routine — ${r.fr}`, reel: r.id }));
    }
    /* --- Mardi : stories interactives + épingle --- */
    push(base('st-tue', day(1), { platform: 'instagram', format: 'story', time: '12:30', pillar: 'community', goal: 'Engagement', title: 'Stories interactives — sondage', story: 's-polls' }));
    push(base('pin-tue', day(1), pinFor(w * 3)));
    /* --- Mercredi : product spotlight + reel + TikTok recette --- */
    {
      const p = prod(BANK.product[w % BANK.product.length]);
      push(base('ig-wed', day(2), { platform: 'instagram', format: 'portrait', time: '12:30', pillar: 'product', goal: 'Conversion', title: `Product spotlight — ${p.name}`, product: p.id, tpl: 'new-product',
        kicker: 'Plat de la semaine', headline: p.name, sub: `${p.weight} g · ${euro(p.price)}`, img: p.img,
        caption: `${p.name}.\n\n${p.short}\n\n${p.weight} g · ${euro(p.price)}. Ingrédients, allergènes et valeurs nutritionnelles sur la fiche produit.\n\nÀ commander avant mercredi minuit pour une livraison jeudi.`, cta: 'Ajoutez-le à votre semaine.', link: `#/produit/${p.id}`,
        tags: ['#PlatDeLaSemaine', `#${CATEGORIES[p.cat].replace(/[^A-Za-zÀ-ÿ]/g, '')}`, '#MealPrepLyon', '#PrepClub'] }));
      const r = MK.reels.find((x) => x.id === BANK.wedReels[w % BANK.wedReels.length]);
      push(base('reel-wed', day(2), { platform: 'instagram', format: 'reel', time: '18:00', pillar: r.pillar, goal: 'Engagement', title: `Reel — ${r.fr}`, reel: r.id }));
      push(base('tt-wed', day(2), { platform: 'tiktok', format: 'video', time: '19:00', pillar: r.pillar, goal: 'Notoriété', title: `Recipe video — ${r.fr}`, reel: r.id }));
    }
    /* --- Jeudi : stories + épingle --- */
    push(base('st-thu', day(3), { platform: 'instagram', format: 'story', time: '12:30', pillar: w % 2 ? 'planning' : 'product', goal: 'Conversion', title: w % 2 ? 'Stories — Plan your week' : 'Stories — Product spotlight', story: w % 2 ? 's-planner' : 's-product' }));
    push(base('pin-thu', day(3), pinFor(w * 3 + 1)));
    /* --- Vendredi : reel coulisses / producteur + TikTok --- */
    {
      const rid = firstFriOfMonth ? 'r6' : BANK.fridayLife[w % BANK.fridayLife.length];
      const r = MK.reels.find((x) => x.id === rid);
      const pillar = firstFriOfMonth ? 'seasonal' : r.pillar;
      push(base('reel-fri', day(4), { platform: 'instagram', format: 'reel', time: '18:00', pillar, goal: firstFriOfMonth ? 'Différenciation' : 'Confiance', title: `${firstFriOfMonth ? 'Producer spotlight' : 'Behind the scenes'} — ${r.fr}`, reel: r.id }));
      push(base('tt-fri', day(4), { platform: 'tiktok', format: 'video', time: '18:30', pillar, goal: 'Notoriété', title: `${firstFriOfMonth ? 'Producteurs' : 'Coulisses'} — ${r.fr}`, reel: r.id }));
      if (firstFriOfMonth) push(base('st-fri', day(4), { platform: 'instagram', format: 'story', time: '12:30', pillar: 'seasonal', goal: 'Différenciation', title: 'Stories — Producer spotlight', story: 's-producer' }));
    }
    /* --- Samedi : stories communauté + épingle --- */
    push(base('st-sat', day(5), { platform: 'instagram', format: 'story', time: '11:00', pillar: 'community', goal: 'Fidélisation', title: 'Stories — Communauté', story: 's-community' }));
    push(base('pin-sat', day(5), pinFor(w * 3 + 2)));
    /* --- Dimanche : newsletter + weekly menu + stories menu --- */
    {
      nlNum++;
      const s = seasonOf(day(6));
      const menuIds = [0, 1, 2, 3, 4].map((k) => BANK.product[(w + k * 3) % BANK.product.length]);
      const feat = menuIds.map((id) => prod(id).name);
      push(base('nl', day(6), { platform: 'newsletter', format: 'email', time: '09:00', pillar: 'planning', goal: 'Fidélisation', title: `The Weekly Prep #${nlNum}`,
        subject: `The Weekly Prep #${nlNum} · ${feat[0]} et le menu de la semaine`, nlNum, menuIds, producerId: PRODUCERS[w % PRODUCERS.length].id, season: s, tpl: 'weekly-menu', headline: `The Weekly Prep #${nlNum}`, sub: `Semaine du ${D.fmt(day(7), { long: true })}`,
        caption: `Objet : The Weekly Prep #${nlNum}\n\nIntroduction : le menu de la semaine est en ligne, avec ${SEASON_TXT[s]} à l’honneur.\n\nWeekly Menu : ${feat.join(', ')}.\nFeatured Recipe : ${feat[0]}.\nSeasonal Highlight : ${SEASON_TXT[s]}.\nProducer Spotlight : ${PRODUCERS[w % PRODUCERS.length].name}.\nWeekly Planning Tip : voir la banque d’astuces.\n\nCTA : Plan Your Week.`,
        cta: 'Planifier ma semaine', link: '#/planning', tags: [] }));
      push(base('ig-sun', day(6), { platform: 'instagram', format: 'carousel', time: '10:00', pillar: 'product', goal: 'Conversion', title: `Weekly Menu — semaine du ${D.fmt(day(7))}`, tpl: 'weekly-menu', kicker: 'Menu de la semaine', headline: 'Le nouveau menu est en ligne', sub: `Semaine du ${D.fmt(day(7), { long: true })}`,
        caption: `Le menu de la semaine est là.\n\nAu programme : ${feat.slice(0, 4).join(', ')}.\n\nToute la sélection est sur le site. Commandes ouvertes jusqu’à mercredi minuit pour une livraison jeudi.`, cta: 'Composez votre semaine — lien en bio.', link: '#/carte', tags: ['#WeeklyMenu', '#MenuDeLaSemaine', '#MealPrepLyon', '#PrepClub'] }));
      push(base('st-sun', day(6), { platform: 'instagram', format: 'story', time: '10:30', pillar: 'product', goal: 'Conversion', title: 'Stories — Weekly Menu', story: 's-menu' }));
    }
  }

  /* --- Newsletter de lancement (lundi 16 novembre) --- */
  items.push({ id: '2026-11-16|nl-launch', slot: 'nl-launch', date: '2026-11-16', time: '08:00', week: 1, campaign: 'launch', platform: 'newsletter', format: 'email', pillar: 'lifestyle', goal: 'Conversion',
    title: 'Newsletter de lancement — PREP CLUB est ouvert', subject: 'PREP CLUB est ouvert · −10 % sur votre première commande', tpl: 'brand', headline: 'PREP CLUB est ouvert.', sub: 'Code BIENVENUE10',
    caption: 'Objet : PREP CLUB est ouvert · −10 % sur votre première commande\nPréheader : La carte est en ligne. Votre semaine peut commencer.\n\nBonjour,\n\nC’est le grand jour : la carte PREP CLUB est en ligne. Petits-déjeuners, déjeuners, dîners, en-cas et desserts, préparés dans notre atelier de Gerland avec six producteurs partenaires.\n\nCommandez à la carte, choisissez une formule, composez votre box ou planifiez toute votre semaine. Sans abonnement obligatoire.\n\nPour fêter l’ouverture : −10 % sur votre première commande avec le code BIENVENUE10.\n\nCTA : Découvrir la carte',
    cta: 'Découvrir la carte', link: '#/carte', tags: [] });

  /* --- Campagnes : les posts du lundi et du mercredi reprennent les contenus de la campagne --- */
  items.forEach((it) => {
    const key = `${it.date}|${it.slot}`;
    if (LAUNCH[key]) { applyLaunch(it, LAUNCH[key]); return; }
    if (!it.campaign || it.campaign === 'launch') return;
    if (it.slot !== 'ig-mon' && it.slot !== 'ig-wed' && it.slot !== 'nl') return;
    const c = MK.campaigns.find((x) => x.id === it.campaign);
    if (it.slot === 'nl') { it.subject = `${it.subject.split(' · ')[0]} · ${c.name}`; it.title = `${it.title} — ${c.name}`; return; }
    campaignIdx[c.id] = (campaignIdx[c.id] || 0);
    const content = c.contents[campaignIdx[c.id]];
    if (!content) return;
    campaignIdx[c.id]++;
    const cap = MK.captions.find((x) => x.id === CAMPAIGN_CAPTION[c.id]);
    const tplByCamp = { menu: 'discovery', winter: 'seasonal', plan: 'planner', club: 'membership', spring: 'seasonal', thanks: 'review', summer: 'seasonal', routine: 'lunch', autumn: 'seasonal' };
    Object.assign(it, { title: `${c.name} — ${content}`, pillar: c.id === 'club' || c.id === 'plan' || c.id === 'routine' ? 'planning' : c.id === 'thanks' ? 'community' : c.id === 'menu' ? 'product' : 'seasonal',
      goal: cap.goal, tpl: tplByCamp[c.id], kicker: c.name, headline: cap.fr.head.replace(/\.$/, ''), sub: content, product: null, img: null,
      caption: `${cap.fr.head}\n\n${cap.fr.body}`, cta: cap.fr.cta, link: c.landing, tags: cap.tags });
  });

  /* --- Contenus partagés : stories, reels --- */
  items.forEach((it) => {
    if (it.story) {
      const s = MK.stories.find((x) => x.id === it.story);
      Object.assign(it, { caption: s.frames.map((f, i) => `Story ${i + 1} : ${f.text}\n   → ${f.sticker}`).join('\n'), cta: 'Sticker lien', link: s.link, tags: [], tpl: it.tpl || 'brand', headline: s.frames[0].text, img: s.frames[0].img });
    }
    if (it.reel && !it.caption) {
      const r = MK.reels.find((x) => x.id === it.reel);
      Object.assign(it, { caption: r.caption, cta: 'Pour commander, c’est par le lien en bio.', link: '#/', tags: r.tags, tpl: 'bts', kicker: it.platform === 'tiktok' ? 'TikTok' : 'Reel', headline: r.fr, sub: r.duration, img: r.img });
    }
    if (!it.alt) it.alt = altFor(it);
    if (!it.instructions) it.instructions = instructionsFor(it);
    if (it.link && it.platform !== 'newsletter' && !it.link.includes('utm_')) it.utm = utm(it.link, it.platform, it.campaign);
  });

  return items;

  function pinFor(k) {
    const p = BANK.pins[k % BANK.pins.length];
    return { platform: 'pinterest', format: 'pin', time: '20:00', pillar: 'lifestyle', goal: 'Trafic', title: `Épingle — ${p.title}`, tpl: p.tpl, headline: p.head, kicker: 'PREP CLUB', sub: 'Lyon',
      caption: `${p.head} — inspirations PREP CLUB, repas préparés à Lyon. Retrouvez la carte complète et le planning de la semaine sur le site.`, cta: 'Voir sur le site', link: '#/carte', tags: ['meal prep', 'lunch box', 'organisation repas'] };
  }
  function applyLaunch(it, L) {
    const cap = L.cap ? MK.captions.find((x) => x.id === L.cap) : null;
    if (it.slot === 'nl') { Object.assign(it, { title: L.title, subject: L.subject }); return; }
    if (L.reel) {
      const r = MK.reels.find((x) => x.id === L.reel);
      Object.assign(it, { title: L.title, reel: r.id, goal: L.goal, caption: L.caption || r.caption, tags: ['#PrepClub', '#MealPrepLyon', '#Lyon', ...r.tags.slice(0, 2)], cta: 'Pour commander, c’est par le lien en bio.', link: '#/', tpl: 'bts', kicker: L.kicker || 'Reel', headline: L.headline || r.fr, sub: r.duration, img: r.img });
      return;
    }
    Object.assign(it, { note: L.note || null, title: L.title, goal: L.goal, pillar: L.goal === 'Conversion' ? 'product' : it.slot === 'ig-mon' && cap && cap.id === 'c2' ? 'planning' : 'lifestyle', tpl: L.tpl, product: null, img: null,
      kicker: L.kicker || (cap ? 'PREP CLUB' : ''), headline: L.headline || (cap ? cap.fr.head : ''), sub: L.sub || (cap ? 'Lyon · sans abonnement obligatoire' : ''),
      caption: L.caption || (cap ? `${cap.fr.head}\n\n${cap.fr.body}` : ''), cta: L.cta || (cap ? cap.fr.cta : ''), link: L.link || (cap ? cap.link : '#/'),
      tags: cap ? cap.tags : ['#PrepClub', '#MealPrepLyon', '#Lyon', '#YourWeekPrepared'] });
  }
}

function altFor(it) {
  if (it.product) { const p = prod(it.product); return `Vue de dessus du plat « ${p.name} » dans sa barquette PREP CLUB, sur fond crème, avec le texte « ${it.kicker} ».`; }
  if (it.platform === 'newsletter') return 'Bannière The Weekly Prep : sélection de plats de la semaine sur une table.';
  if (it.reel) return `Couverture de la vidéo « ${it.headline} » aux couleurs PREP CLUB.`;
  return `Visuel PREP CLUB aux tons crème et olive avec le titre « ${it.headline || it.title} ».`;
}
function instructionsFor(it) {
  const f = MK.formats[it.format];
  const common = `Format ${f.label} ${f.size}.`;
  if (it.platform === 'newsletter') return `${common} Programmer la veille au soir dans l’outil d’e-mailing, segment « Tous les inscrits », tester l’envoi sur mobile.`;
  if (it.format === 'story') return `${common} Publier chaque story dans l’ordre, ajouter les stickers indiqués, ajouter la séquence à la story à la une correspondante.`;
  if (it.format === 'reel' || it.format === 'video') return `${common} Filmer à partir de la liste des plans, couverture à choisir dans la bibliothèque, son issu de la bibliothèque commerciale de la plateforme.`;
  if (it.platform === 'pinterest') return `${common} Recadrer la création Instagram en 2:3, ajouter le titre et le lien de destination.`;
  return `${common} Lien dans la bio mis à jour le jour même, réponse aux commentaires dans les 2 heures suivant la publication.`;
}

/* ---------- Statut par défaut ---------- */
function defaultStatus(it) {
  const today = D.today();
  const delta = D.diff(today, it.date);
  if (delta < 0) return 'published';
  if (delta <= 7) return 'scheduled';
  if (delta <= 21) return it.campaign === 'launch' && /bestsellers/.test(it.title) ? 'update' : (it.slot === 'ig-wed' || it.slot === 'reel-fri') && delta > 10 ? 'approval' : 'ready';
  if (delta <= 42) return 'ready';
  return 'draft';
}

/* ---------- Accès aux contenus ---------- */
let CAL = [];
function rebuild() {
  CAL = buildCalendar().concat(store.data.custom.map((c) => Object.assign({}, c)));
  CAL.forEach((it) => {
    it.statusDefault = defaultStatus(it);
    Object.assign(it, store.data.overrides[it.id] || {});
    if (!it.status) it.status = it.statusDefault;
  });
  CAL.sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
}
const content = (id) => CAL.find((c) => c.id === id);
function updateContent(id, patch) {
  store.data.overrides[id] = Object.assign({}, store.data.overrides[id] || {}, patch);
  const custom = store.data.custom.find((c) => c.id === id);
  if (custom) Object.assign(custom, patch);
  store.save();
  rebuild();
}
function duplicateContent(id) {
  const src = content(id);
  const copy = JSON.parse(JSON.stringify(src));
  copy.id = `copy-${Date.now().toString(36)}`;
  copy.slot = 'custom';
  copy.title = `${src.title} (copie)`;
  copy.status = 'draft';
  delete copy.statusDefault;
  store.data.custom.push(copy);
  store.save();
  rebuild();
  return copy.id;
}

/* ---------- Visuels ---------- */
const THEMES = {
  cream: { bg: '#F4EEE2', fg: '#2A2925', accent: '#5C6B3C', label: 'Crème' },
  sand: { bg: '#E4D6BA', fg: '#2A2925', accent: '#45512C', label: 'Sable' },
  olive: { bg: '#5C6B3C', fg: '#FBF8F1', accent: '#E4D6BA', label: 'Olive' },
  dark: { bg: '#2A2925', fg: '#FBF8F1', accent: '#E4D6BA', label: 'Charbon' },
};
const imgUrlMk = (id, w = 900) => (!id ? '' : /^(https?:|data:)/.test(id) ? id : `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=70`);
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));

function templateState(id) {
  if (id === 'type-dark') return Object.assign({}, templateState('membership'), { id, layout: 'type', theme: 'dark' });
  if (id === 'type-olive') return Object.assign({}, templateState('promo'), { id, layout: 'type', theme: 'olive' });
  const t = MK.templates.find((x) => x.id === id) || MK.templates[0];
  return Object.assign({}, t, store.data.templates[t.id] || {});
}
/* Spécification d'un visuel : template + textes du contenu */
function specFor(it) {
  const t = templateState(it.tpl || 'brand');
  return {
    layout: t.layout, theme: t.theme,
    kicker: it.kicker != null && it.kicker !== '' ? it.kicker : t.kicker,
    headline: it.headline || t.headline,
    sub: it.sub != null && it.sub !== '' ? it.sub : t.sub,
    img: t.layout === 'type' ? null : (it.img || t.img),
    format: it.format || 'square',
  };
}
function visualHTML(spec, cls = '') {
  const th = THEMES[spec.theme] || THEMES.cream;
  const f = MK.formats[spec.format] || MK.formats.square;
  const img = spec.img ? `<img src="${imgUrlMk(spec.img, 700)}" alt="" loading="lazy" crossorigin="anonymous">` : '';
  const logo = '<span class="vz__logo">PREP<i>CLUB</i></span>';
  return `<div class="vz vz--${spec.layout} ${cls}" style="aspect-ratio:${f.ratio};--vbg:${th.bg};--vfg:${th.fg};--vac:${th.accent}">
    ${spec.layout !== 'type' ? `<div class="vz__media">${img}</div>` : ''}
    <div class="vz__panel">${logo}
      <div class="vz__text"><span class="vz__kicker">${esc(spec.kicker)}</span><strong class="vz__head">${esc(spec.headline)}</strong>${spec.sub ? `<span class="vz__sub">${esc(spec.sub)}</span>` : ''}</div>
    </div>
  </div>`;
}

/* Export PNG du visuel aux dimensions de la plateforme */
async function exportVisual(spec, filename) {
  const f = MK.formats[spec.format] || MK.formats.square;
  const W = f.w, H = f.h;
  const th = THEMES[spec.theme] || THEMES.cream;
  const cv = document.createElement('canvas');
  cv.width = W; cv.height = H;
  const ctx = cv.getContext('2d');
  try { await Promise.all([document.fonts.load('500 80px Fraunces'), document.fonts.load('600 30px Inter'), document.fonts.load('italic 500 40px Fraunces')]); } catch (e) { /* polices de secours */ }
  const loadImg = (src) => new Promise((res) => { const im = new Image(); im.crossOrigin = 'anonymous'; im.onload = () => res(im); im.onerror = () => res(null); im.src = src; });
  const cover = (im, x, y, w, h) => { const r = Math.max(w / im.width, h / im.height); const iw = im.width * r, ih = im.height * r; ctx.drawImage(im, x + (w - iw) / 2, y + (h - ih) / 2, iw, ih); };
  const wrap = (text, maxW) => { const words = String(text).split(' '); const lines = []; let line = ''; words.forEach((wd) => { const t = line ? `${line} ${wd}` : wd; if (ctx.measureText(t).width > maxW && line) { lines.push(line); line = wd; } else line = t; }); if (line) lines.push(line); return lines; };

  ctx.fillStyle = th.bg; ctx.fillRect(0, 0, W, H);
  const pad = W * 0.08;
  let panelTop = 0, fg = th.fg, ac = th.accent;
  if (spec.layout === 'photo' || spec.layout === 'split') {
    const im = spec.img ? await loadImg(imgUrlMk(spec.img, 1600)) : null;
    const mh = spec.layout === 'split' ? H * 0.6 : H;
    if (im) cover(im, 0, 0, W, mh); else { ctx.fillStyle = '#8A7B6A'; ctx.fillRect(0, 0, W, mh); }
    if (spec.layout === 'photo') {
      const g = ctx.createLinearGradient(0, H * 0.35, 0, H);
      g.addColorStop(0, 'rgba(30,32,22,0)'); g.addColorStop(1, 'rgba(30,32,22,.82)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      fg = '#FBF8F1'; ac = '#E4D6BA';
    } else { ctx.fillStyle = th.bg; ctx.fillRect(0, mh, W, H - mh); panelTop = mh; }
  }
  // logo
  const logoY = spec.layout === 'split' ? panelTop + pad * 0.9 : pad * 1.1;
  ctx.textBaseline = 'alphabetic';
  ctx.font = `600 ${W * 0.034}px Fraunces, Georgia, serif`;
  const logoFg = spec.layout === 'photo' ? '#FBF8F1' : fg;
  ctx.fillStyle = logoFg; ctx.fillText('PREP', pad, logoY);
  const lw = ctx.measureText('PREP ').width;
  ctx.font = `italic 500 ${W * 0.034}px Fraunces, Georgia, serif`;
  ctx.fillStyle = spec.layout === 'photo' ? '#E4D6BA' : ac; ctx.fillText('CLUB', pad + lw, logoY);
  // textes (ancrés en bas)
  const headSize = W * (spec.layout === 'type' ? 0.095 : 0.072);
  ctx.font = `500 ${headSize}px Fraunces, Georgia, serif`;
  const lines = wrap(spec.headline, W - pad * 2);
  const subSize = W * 0.03;
  let y = H - pad;
  if (spec.sub) { ctx.font = `500 ${subSize}px Inter, Arial, sans-serif`; ctx.fillStyle = fg; ctx.globalAlpha = 0.85; wrap(spec.sub, W - pad * 2).reverse().forEach((l) => { ctx.fillText(l, pad, y); y -= subSize * 1.35; }); ctx.globalAlpha = 1; y -= subSize * 0.8; }
  ctx.font = `500 ${headSize}px Fraunces, Georgia, serif`; ctx.fillStyle = fg;
  lines.slice().reverse().forEach((l) => { ctx.fillText(l, pad, y); y -= headSize * 1.08; });
  ctx.font = `600 ${W * 0.024}px Inter, Arial, sans-serif`; ctx.fillStyle = ac;
  if ('letterSpacing' in ctx) ctx.letterSpacing = `${W * 0.004}px`;
  ctx.fillText(String(spec.kicker || '').toUpperCase(), pad, y - headSize * 0.05);

  return new Promise((res) => {
    try {
      cv.toBlob((blob) => {
        if (!blob) { res(false); return; }
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob); a.download = `${filename}.png`;
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(() => URL.revokeObjectURL(a.href), 2000);
        res(true);
      }, 'image/png');
    } catch (e) { res(false); }
  });
}

/* ---------- Divers ---------- */
function copyText(text) {
  if (navigator.clipboard && window.isSecureContext !== false) {
    return navigator.clipboard.writeText(text).then(() => true).catch(() => fallback());
  }
  return Promise.resolve(fallback());
  function fallback() {
    const ta = document.createElement('textarea');
    ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
    ta.remove();
    return ok;
  }
}
function fullText(it) {
  return [it.caption, '', it.cta, '', (it.tags || []).join(' ')].join('\n').trim();
}
