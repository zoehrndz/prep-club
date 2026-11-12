/* =========================================================================
   PREP CLUB — Studio simple
   Une journée à la fois : image à télécharger, texte à copier, où publier,
   puis « C'est publié ». Utilise le calendrier de js/mkt-engine.js.
   ========================================================================= */
'use strict';

const $ = (s, r = document) => r.querySelector(s);
const SVG = {
  dl: '<svg viewBox="0 0 24 24"><path d="M12 4v11m0 0-4-4m4 4 4-4M5 20h14"/></svg>',
  copy: '<svg viewBox="0 0 24 24"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h8"/></svg>',
  left: '<svg viewBox="0 0 24 24"><path d="m15 6-6 6 6 6"/></svg>',
  right: '<svg viewBox="0 0 24 24"><path d="m9 6 6 6-6 6"/></svg>',
};

const CAL_LAST = D.add(CAL_START, CAL_WEEKS * 7 - 1);
const clamp = (iso) => (iso < CAL_START ? CAL_START : iso > CAL_LAST ? CAL_LAST : iso);
const TODAY_ISO = D.today();
let day = clamp(TODAY_ISO);

store.data.done = store.data.done || {};
const isDone = (id) => !!store.data.done[id];

/* ---------- Ce qu'on affiche pour chaque type de publication ---------- */
function kindOf(it) {
  if (it.platform === 'newsletter') return { what: 'Newsletter', where: 'ton outil d’e-mail' };
  if (it.platform === 'pinterest') return { what: 'Épingle', where: 'Pinterest' };
  if (it.platform === 'tiktok') return { what: 'Vidéo', where: 'TikTok' };
  if (it.format === 'story') return { what: 'Stories', where: 'Instagram' };
  if (it.format === 'reel') return { what: 'Reel (vidéo)', where: 'Instagram' };
  return { what: 'Publication', where: 'Instagram' };
}
const HOW = {
  post: ['Ouvre Instagram et touche « + ».', 'Choisis « Publication », puis l’image que tu viens de télécharger.', 'Colle le texte dans la légende.', 'Touche « Partager ».'],
  story: ['Ouvre Instagram et touche « + », puis « Story ».', 'Choisis la première image.', 'Touche « Aa » pour écrire la phrase, et l’icône sticker pour ajouter le sondage, le lien ou la question.', 'Partage, puis recommence avec l’image suivante.'],
  reel: ['Ouvre Instagram et touche « + », puis « Reel ».', 'Importe tes petites vidéos dans l’ordre.', 'Colle le texte dans la légende.', 'Touche « Partager ».'],
  tiktok: ['Ouvre TikTok et touche « + ».', 'Importe tes petites vidéos dans l’ordre.', 'Colle le texte dans la description.', 'Touche « Publier ».'],
  pin: ['Ouvre Pinterest, touche « + » puis « Épingle ».', 'Choisis l’image téléchargée.', 'Colle le texte, et mets le lien du site PREP CLUB.', 'Touche « Publier ».'],
  mail: ['Ouvre ton outil d’e-mail (Brevo, Mailchimp…) et crée une nouvelle campagne.', 'Colle l’objet, puis le texte.', 'Choisis « Tous les inscrits ».', 'Programme l’envoi dimanche à 9 h.'],
};
function howFor(it) {
  if (it.platform === 'newsletter') return HOW.mail;
  if (it.platform === 'pinterest') return HOW.pin;
  if (it.platform === 'tiktok') return HOW.tiktok;
  if (it.format === 'story') return HOW.story;
  if (it.format === 'reel') return HOW.reel;
  return HOW.post;
}
const hour = (t) => t.replace(':', ' h ').replace(' h 00', ' h');

/* ---------- Textes prêts à coller ---------- */
const TIPS = [
  'Placez vos dîners les plus légers en début de semaine et gardez les plats mijotés pour jeudi et vendredi.',
  'Commandez le dimanche : vous choisissez au calme et tout arrive jeudi.',
  'Gardez deux en-cas d’avance au bureau, c’est la fin des fringales de 16 h.',
  'Un petit-déjeuner prêt la veille, c’est dix minutes de sommeil en plus.',
  'Notez vos soirs chargés dans le planning : ce sont ceux qui méritent un plat tout prêt.',
  'Ajoutez vos plats préférés en favoris pour composer la semaine suivante en un clic.',
  'Variez les protéines d’un jour à l’autre : poulet, poisson, légumineuses.',
  'Rangez les plats par jour dans le frigo : le matin, vous n’avez plus qu’à attraper le bon.',
];
const SEASON_WORDS = { winter: 'les choux, poireaux et agrumes', spring: 'les asperges, petits pois et fraises', summer: 'les tomates, courgettes et le basilic', autumn: 'les courges, champignons et poires' };

function textToCopy(it) {
  if (it.platform === 'newsletter') {
    if (!it.menuIds) return it.caption.replace(/^Objet :.*\n(Préheader :.*\n)?\n?/, '').replace(/\nCTA : (.*)$/, '\n👉 $1 : https://prep-club.vercel.app\n\nÀ très vite,\nL’équipe PREP CLUB');
    if (it.date === '2026-11-15') {
      return `Bonjour,

Demain, lundi 16 novembre, PREP CLUB ouvre ses portes à Lyon.

Des petits-déjeuners, déjeuners, dîners, en-cas et desserts préparés dans notre atelier de Gerland, avec six producteurs de la région.

Vous pourrez commander à la carte, choisir une formule, composer votre box ou planifier toute votre semaine. Sans abonnement obligatoire.

Votre cadeau de bienvenue : −10 % sur votre première commande avec le code BIENVENUE10.

À demain,
L’équipe PREP CLUB`;
    }
    const menu = it.menuIds.map((id) => PRODUCTS.find((p) => p.id === id));
    const prodr = PRODUCERS.find((p) => p.id === it.producerId);
    return `Bonjour,

Le menu de la semaine est en ligne ! En ce moment, on cuisine ${SEASON_WORDS[it.season]}.

Au menu cette semaine :
${menu.map((p) => `• ${p.name}`).join('\n')}

Le plat de la semaine : ${menu[0].name}. ${menu[0].short}

Le producteur à l’honneur : ${prodr.name}, ${prodr.type.toLowerCase()} à ${prodr.location}, à ${prodr.distance} de Lyon.

L’astuce de la semaine : ${TIPS[(it.nlNum || 0) % TIPS.length]}

Commandez avant mercredi minuit pour être livré jeudi.
👉 Planifier ma semaine : https://prep-club.vercel.app

Bonne semaine,
L’équipe PREP CLUB`;
  }
  if (it.platform === 'pinterest') return `${it.headline}\n\n${it.caption}`;
  const tags = (it.tags || []).join(' ');
  return [it.caption, it.cta, tags].filter(Boolean).join('\n\n');
}
function subjectOf(it) { return it.subject || it.title; }

/* ---------- Créas (js/mkt-motion.js) ---------- */
let CREAS = [];
const creaKey = (spec) => { CREAS.push(spec); return CREAS.length - 1; };
const player = (spec, big = false) => `<div class="player" data-crea="${creaKey(spec)}" ${big ? 'data-big="1"' : ''} style="aspect-ratio:${MO.fmtOf(MO.byId(spec.tpl), spec.fmt).ratio}"></div>`;
const pimg = (id) => (PRODUCTS.find((x) => x.id === id) || {}).img;
function weekMenu(it) { return [0, 1, 2, 3].map((k) => PRODUCTS.find((x) => x.id === BANK.product[(it.week + k * 3) % BANK.product.length])); }

/* Le bon modèle pour chaque publication du calendrier */
function creaFor(it) {
  if (it.reel) return reelCrea(it);
  if (it.platform === 'pinterest') {
    const t = templateState(it.tpl);
    return { tpl: 'pin', fmt: 'pin', data: { title: it.headline, sub: 'Idées & recettes · PREP CLUB Lyon' }, photos: [t.img || IMG.spread] };
  }
  if (it.product) { const p = PRODUCTS.find((x) => x.id === it.product); return { tpl: 'prix', fmt: 'post', data: { badge: 'PLAT DE LA SEMAINE', name: p.name, price: euro(p.price) }, photos: [p.img] }; }
  if (it.slot === 'ig-sun') { const m = weekMenu(it); return { tpl: 'grille', fmt: 'post', data: { title: 'Le menu de la semaine', names: m.map((p) => p.name).join('\n') }, photos: m.map((p) => p.img) }; }
  if (it.tpl === 'bestseller') { const ids = ['chicken-rice-veg', 'salmon-quinoa', 'lasagna', 'overnight-oats']; return { tpl: 'grille', fmt: 'post', data: { title: 'Vos plats préférés', names: ids.map((i) => PRODUCTS.find((x) => x.id === i).name).join('\n'), foot: 'Les plus commandés depuis l’ouverture' }, photos: ids.map(pimg) }; }
  if (it.tpl === 'brand' || it.tpl === 'type-dark' || it.tpl === 'type-olive' || it.tpl === 'membership') return { tpl: 'citation', fmt: 'post', data: { text: it.headline, sub: it.sub || '', theme: it.tpl === 'type-olive' || it.tpl === 'membership' ? 'olive' : 'charbon' } };
  if (it.tpl === 'review') return { tpl: 'textpost', fmt: 'post', data: { text: it.caption.split('\n\n').slice(0, 2).join('\n\n'), meta: 'Merci à vous · Lyon' } };
  if (/Prix par repas/.test(it.title)) return { tpl: 'comparatif', fmt: 'post', data: {} };
  if (/astuces/.test(it.title)) return { tpl: 'couverture', fmt: 'post', data: { hook: it.headline } };
  if (it.slot === 'ig-mon' && it.tpl === 'planner') {
    if (it.week % 2 === 0) {
      const m = [0, 1, 2, 3, 4].map((k) => PRODUCTS.find((x) => x.id === BANK.product[(it.week + k * 2) % BANK.product.length]));
      const j = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven'];
      return { tpl: 'notes', fmt: 'post', data: { title: 'Ma semaine 🥗', lines: `${m.map((p, i) => `${i < 2 ? '✓ ' : ''}${j[i]} · ${p.name}`).join('\n')}\n\nTemps passé en cuisine : 0 min` } };
    }
    return { tpl: 'textpost', fmt: 'post', data: { text: it.headline, meta: '12:30 · Lyon' } };
  }
  const t = templateState(it.tpl || 'brand');
  return { tpl: 'prix', fmt: 'post', data: { badge: String(it.kicker || t.kicker || '').toUpperCase(), name: it.headline || t.headline, price: '' }, photos: [it.img || t.img || IMG.spread] };
}
function reelCrea(it) {
  if (/Teaser 3\/3/.test(it.title)) return { tpl: 'compte', fmt: 'story', data: {} };
  const m = {
    r1: { tpl: 'semaine', data: {} },
    r2: { tpl: 'unboxing', data: { title: 'On prépare ta commande de la semaine 📦', label: 'Commande n°0142' } },
    r3: { tpl: 'raisons', data: { hook: 'Ta box de la semaine en 3 étapes', r1: 'Choisis ta box', r2: 'Ajoute tes plats préférés', r3: 'Reçois tout jeudi', cta: 'Compose la tienne · lien en bio' } },
    r4: { tpl: 'produit', data: { badge: 'BOX PETIT-DÉJ', name: '5 petits-déjeuners prêts d’avance', price: '5 matins', details: 'Porridge · chia · granola · muffins · cake', cta: 'Je la veux →' }, photos: [IMG.breakfastSpread] },
    r5: { tpl: 'pov', data: { text1: 'POV : il est 7 h à l’atelier PREP CLUB', text2: 'Tout est préparé ici, à Gerland 👩‍🍳' }, photos: [IMG.cooking] },
    r6: { tpl: 'producteur', data: {} },
    r7: { tpl: 'pov', data: { text1: 'POV : dimanche 10 h, tu planifies ta semaine', text2: '5 minutes. Et c’est réglé jusqu’à vendredi.' }, photos: [IMG.tablet] },
    r8: { tpl: 'avantapres', data: { labelA: 'LE DÉJ DE BUREAU', textA: 'Un sandwich triste, encore une fois.', labelB: 'VERSION PREP CLUB', textB: 'Un vrai plat, prêt en 2 minutes.' }, photos: [IMG.shelves, pimg('chicken-rice-veg')] },
  }[it.reel] || { tpl: 'pov', data: {} };
  return Object.assign({ fmt: 'story' }, m);
}

/* ---------- Rendu ---------- */
function stepHTML(n, title, inner) {
  return `<div class="step"><span class="step__n">${n}</span><div class="step__body"><span class="step__title">${title}</span>${inner}</div></div>`;
}
function copyBtn(key, label = 'Copier le texte') { return `<button class="big big--olive" data-copy="${key}">${SVG.copy} ${label}</button>`; }

function postHTML(it) {
  const k = kindOf(it);
  const how = `<details class="how"><summary>Comment faire ?</summary><ol>${howFor(it).map((s) => `<li>${s}</li>`).join('')}</ol></details>`;
  const publish = (n) => stepHTML(n, it.platform === 'newsletter' ? `Programme l’envoi pour ${D.days[D.parse(it.date).getDay()]} ${hour(it.time)}` : `Publie sur ${k.where} vers ${hour(it.time)}`, how);
  const note = it.note ? `<p class="warn">À faire avant : ${esc(it.note)}</p>` : '';
  let steps = '';
  const idA = esc(it.id);

  if (it.platform === 'newsletter') {
    steps = stepHTML(1, 'Copie l’objet de l’e-mail', `<div class="copybox copybox--one">${esc(subjectOf(it))}</div>${copyBtn(`${idA}::subject`, 'Copier l’objet')}`)
      + stepHTML(2, 'Copie le texte de l’e-mail', `<div class="copybox">${esc(textToCopy(it))}</div>${copyBtn(`${idA}::text`)}`)
      + publish(3);
  } else if (it.format === 'story') {
    const s = MK.stories.find((x) => x.id === it.story);
    steps = stepHTML(1, `Publie ces ${s.frames.length} stories, dans l’ordre`, `<div class="frames-s">${s.frames.map((f, i) => `<div class="frame-s">${player({ tpl: 'storyframe', fmt: 'story', data: { text: f.text }, photos: [f.img] })}<span><b>${i + 1}.</b> Phrase déjà sur l’image : « ${esc(f.text)} »</span><span class="add">Ajoute dans l’appli : ${esc(f.sticker)}</span><button data-dlframe="${esc(s.id)}::${i}">${SVG.dl} Image</button></div>`).join('')}</div>`)
      + stepHTML(2, `Publie sur Instagram vers ${hour(it.time)}`, `<details class="how"><summary>Comment faire ?</summary><ol>${HOW.story.map((x) => `<li>${x}</li>`).join('')}</ol></details>`);
  } else if (it.reel) {
    const r = MK.reels.find((x) => x.id === it.reel);
    const cr = creaFor(it);
    const ck = creaKey(cr); CREAS.pop();
    steps = stepHTML(1, 'Télécharge la vidéo, elle est prête', `<div class="step__img">${player(cr)}</div><span class="how">Appuie sur ▶ pour la voir. Ajoute un son tendance directement dans l’appli au moment de publier.</span><div class="row-s"><button class="big big--olive" data-vdl="${ck}">${SVG.dl} Télécharger la vidéo</button><button class="mini" data-edit-crea="${ck}">Personnaliser</button></div>
        <details class="how"><summary>Tu préfères filmer toi-même ? Voici les plans (${r.duration})</summary><ol>${r.shots.map((x) => `<li>${esc(x.replace(/\s*\(\d[^)]*\)$/, ''))}</li>`).join('')}</ol><p>Texte à écrire sur la vidéo : ${r.onscreen.map((x) => `« ${esc(x)} »`).join(', ')}</p></details>`)
      + stepHTML(2, 'Copie le texte', `<div class="copybox">${esc(textToCopy(it))}</div>${copyBtn(`${idA}::text`)}`)
      + publish(3);
  } else {
    const cr = creaFor(it);
    const ck = creaKey(cr); CREAS.pop();
    steps = stepHTML(1, 'Télécharge l’image', `<div class="step__img">${player(cr)}</div><div class="row-s"><button class="big" data-idl2="${ck}">${SVG.dl} Télécharger l’image</button><button class="mini" data-edit-crea="${ck}">Personnaliser</button></div>`)
      + stepHTML(2, 'Copie le texte', `<div class="copybox">${esc(textToCopy(it))}</div>${copyBtn(`${idA}::text`)}`)
      + publish(3);
  }
  const done = isDone(it.id);
  return `<article class="post ${done ? 'is-done' : ''}">
    <header class="post__head"><span class="net net--${it.platform}">${k.where === 'ton outil d’e-mail' ? 'E-mail' : k.where}</span><span class="post__what">${k.what}</span><span class="post__time">vers ${hour(it.time)}</span></header>
    ${note ? `<div style="padding:14px 18px 0">${note}</div>` : ''}
    <div class="steps">${steps}</div>
    <button class="done-btn" data-done="${idA}" aria-pressed="${done}">${done ? '✓ C’est publié' : 'J’ai publié ✓'}</button>
  </article>`;
}

function itemsOf(iso) { return CAL.filter((c) => c.date === iso && c.status !== 'archived'); }

/* ---------- Onglets ---------- */
const TABS = [
  ['aujourdhui', 'Aujourd’hui'],
  ['calendrier', 'Calendrier'],
  ['campagnes', 'Campagnes'],
  ['budget', 'Budget & plan'],
  ['creas', 'Vidéos & visuels'],
  ['textes', 'Textes prêts'],
  ['ia', 'Géré par l’IA'],
  ['comptes', 'Mes comptes'],
  ['strategie', 'La stratégie'],
  ['suivi', 'Mon suivi'],
];
const tabNow = () => { const h = location.hash.slice(1); return TABS.some((t) => t[0] === h) ? h : 'aujourdhui'; };
let calMonth = day.slice(0, 7);
let textTab = 'posts';
let lang = 'fr';

/* Registre des textes copiables de la vue affichée */
let COPY = [];
const reg = (t) => { COPY.push(t); return COPY.length - 1; };
const cbtn = (text, label = 'Copier', cls = '') => `<button class="mini ${cls}" data-c="${reg(text)}">${SVG.copy} ${label}</button>`;
const intro = (title, text) => `<section class="s-hello"><h1>${title}</h1>${text ? `<p>${text}</p>` : ''}</section>`;
const isPost = (it) => it.platform === 'instagram' && ['square', 'portrait', 'carousel'].includes(it.format);
const nf = (v) => v.toLocaleString('fr-FR');
const delayFr = (d) => d === 'Immédiat' ? 'tout de suite' : d.replace(/^J\+(\d+) après livraison$/, (m, n) => `${n} jours après la livraison`).replace(/^J\+(\d+)/, (m, n) => `${n} jour${n > 1 ? 's' : ''} après`).replace(/^H\+(\d+)/, (m, n) => `${n} heures après`).replace(/^Jour de livraison \+ 1$/, 'le lendemain de la livraison');
const cap1 = (s) => s[0].toUpperCase() + s.slice(1);
const campaignsSorted = () => MK.campaigns.map(campaignState).sort((a, b) => a.start.localeCompare(b.start));
const campWhen = (c) => (TODAY_ISO > c.end ? ['Terminée', 'muted'] : TODAY_ISO >= c.start ? ['En cours', 'olive'] : ['À venir', 'line']);

/* =========================================================================
   Aujourd'hui
   ========================================================================= */
function todayTasks() {
  const list = [];
  campaignsSorted().forEach((c) => planOf(c).steps.filter((st) => st.date === day).forEach((st) => list.push(Object.assign({ camp: c }, st))));
  if (!list.length) return '';
  return `<section class="box tasks"><h3>À faire aussi aujourd’hui</h3>${list.map((st) => `<label class="chk ${stepDone(st.key) ? 'ok' : ''}"><input type="checkbox" id="td-${st.key.replace(':', '-')}" data-step="${st.key}" ${stepDone(st.key) ? 'checked' : ''}><span>${esc(st.task)} <small class="muted">· ${esc(st.camp.fr || st.camp.name)} · ${esc(st.who)}</small></span></label>`).join('')}</section>`;
}
function viewToday() {
  const items = itemsOf(day);
  const left = items.filter((c) => !isDone(c.id)).length;
  const mon = D.monday(day);
  const days = [0, 1, 2, 3, 4, 5, 6].map((i) => D.add(mon, i));
  const isToday = day === TODAY_ISO;
  const wd = D.days[D.parse(day).getDay()];
  const label = isToday ? 'Aujourd’hui' : cap1(wd);
  const camp = campaignAt(day);

  return `<div class="col">
    ${intro(`${label}, ${D.parse(day).getDate()} ${D.months[D.parse(day).getMonth()]}`, items.length === 0 ? 'Rien à publier ce jour-là.' : left === 0 ? '<strong>Tout est publié pour ce jour. Bravo !</strong>' : `<strong>${left} chose${left > 1 ? 's' : ''} à publier</strong>. Pour chacune, suis les étapes dans l’ordre.`)}
    ${camp ? `<a class="s-camp" href="#campagnes">En ce moment : <strong>${esc(camp.fr || camp.name)}</strong> · ${esc(camp.goal)}</a>` : ''}
    <nav class="s-week" aria-label="Choisir un jour">
      <button class="s-arrow" data-week="-1" aria-label="Semaine précédente" ${mon <= CAL_START ? 'disabled' : ''}>${SVG.left}</button>
      ${days.map((d) => { const its = itemsOf(d); const ok = its.filter((c) => isDone(c.id)).length; return `<button class="s-day ${d === TODAY_ISO ? 'is-today' : ''} ${its.length && ok === its.length ? 'all-done' : ''}" data-day="${d}" ${d === day ? 'aria-current="date"' : ''} aria-label="${D.days[D.parse(d).getDay()]} ${D.parse(d).getDate()} : ${ok} sur ${its.length} publiés"><span class="s-day__d">${D.daysShort[D.parse(d).getDay()].replace('.', '')}</span><span class="s-day__n">${D.parse(d).getDate()}</span><span class="s-day__dots">${its.map((c) => `<i class="${isDone(c.id) ? 'ok' : ''}"></i>`).join('')}</span></button>`; }).join('')}
      <button class="s-arrow" data-week="1" aria-label="Semaine suivante" ${D.add(mon, 7) > CAL_LAST ? 'disabled' : ''}>${SVG.right}</button>
    </nav>
    ${!isToday && TODAY_ISO >= CAL_START && TODAY_ISO <= CAL_LAST ? '<button class="big s-today" data-day="today">Revenir à aujourd’hui</button>' : ''}
    ${todayTasks()}
    ${items.length ? items.map(postHTML).join('') : '<div class="s-empty"><strong>Journée libre</strong><span class="muted">Rien de prévu ce jour-là. Choisis un autre jour dans la semaine.</span></div>'}
  </div>`;
}

/* =========================================================================
   Calendrier (mois)
   ========================================================================= */
function viewCalendar() {
  const [y, m] = calMonth.split('-').map(Number);
  const first = `${calMonth}-01`;
  const last = D.iso(new Date(y, m, 0));
  const start = D.monday(first);
  const cells = [];
  for (let d = start; d <= last || cells.length % 7; d = D.add(d, 1)) cells.push(d);
  const inMonth = CAL.filter((c) => c.date.startsWith(calMonth) && c.status !== 'archived');
  const camps = campaignsSorted().filter((c) => c.start.slice(0, 7) <= calMonth && c.end.slice(0, 7) >= calMonth);
  const prevOk = first > CAL_START.slice(0, 7) + '-01';
  const nextOk = last < CAL_LAST;
  const n = (f) => inMonth.filter(f).length;

  return `${intro('Le calendrier', 'Tout ce qui est prévu, mois par mois. Touche un jour pour voir ce qu’il faut publier.')}
    <div class="cal-head">
      <button class="s-arrow" data-month="-1" aria-label="Mois précédent" ${prevOk ? '' : 'disabled'}>${SVG.left}</button>
      <h2>${cap1(D.months[m - 1])} ${y}</h2>
      <button class="s-arrow" data-month="1" aria-label="Mois suivant" ${nextOk ? '' : 'disabled'}>${SVG.right}</button>
    </div>
    <div class="legend-s"><span class="lg lg--instagram">Instagram</span><span class="lg lg--tiktok">TikTok</span><span class="lg lg--pinterest">Pinterest</span><span class="lg lg--newsletter">Newsletter</span></div>
    <div class="mcal">
      ${['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((x) => `<div class="mcal__h">${x}</div>`).join('')}
      ${cells.map((d) => {
        const out = !d.startsWith(calMonth);
        const its = out ? [] : itemsOf(d);
        const camp = out ? null : campaignAt(d);
        const ok = its.filter((c) => isDone(c.id)).length;
        return `<button class="mcal__d ${out ? 'out' : ''} ${d === TODAY_ISO ? 'today' : ''} ${its.length && ok === its.length ? 'done' : ''}" ${out || !its.length ? 'disabled' : `data-day="${d}" data-go="aujourdhui"`}>
          <span class="mcal__n">${D.parse(d).getDate()}</span>
          <span class="mcal__dots">${its.map((c) => `<i class="lg--${c.platform}"></i>`).join('')}</span>
          ${camp && !out && d === (camp.start > first ? camp.start : first) ? `<span class="mcal__camp">${esc(camp.fr || camp.name)}</span>` : ''}
        </button>`;
      }).join('')}
    </div>
    <div class="grid2">
      <section class="box"><h3>Ce mois-ci</h3>
        <ul class="facts"><li><b>${n(isPost)}</b> publications Instagram</li><li><b>${n((c) => c.format === 'reel')}</b> Reels</li><li><b>${n((c) => c.platform === 'tiktok')}</b> vidéos TikTok</li><li><b>${new Set(inMonth.filter((c) => c.format === 'story').map((c) => c.date)).size}</b> jours de Stories</li><li><b>${n((c) => c.platform === 'pinterest')}</b> épingles Pinterest</li><li><b>${n((c) => c.platform === 'newsletter')}</b> newsletters</li></ul>
      </section>
      <section class="box"><h3>Campagne${camps.length > 1 ? 's' : ''} du mois</h3>
        ${camps.length ? camps.map((c) => `<p><strong>${esc(c.fr || c.name)}</strong><br><span class="muted">${D.fmt(c.start)} → ${D.fmt(c.end)} · ${esc(c.goal)}</span></p>`).join('') : '<p class="muted">Pas de campagne spéciale : on suit le rythme habituel.</p>'}
        <a class="mini" href="#campagnes">Voir toutes les campagnes</a>
      </section>
    </div>`;
}

/* =========================================================================
   Budget, plans de campagne
   ========================================================================= */
const scen = () => store.data.scenario || 'reco';
const PAID = new Set(['meta', 'tiktok', 'google', 'influence']);
const groupOf = (type) => (['meta', 'tiktok', 'google'].includes(type) ? 'pub' : type === 'ia' ? 'outil' : type);
const amt = (l) => Math.round(l.amount * (PAID.has(l.type) ? MK.budget.scenarios[scen()].factor : 1));
const hyp = () => Object.assign({}, MK.budget.hyp, store.data.hyp || {});
const eur = (v) => `${nf(Math.round(v))} €`;
const TYPE_LABEL = { meta: 'Pub Instagram/Facebook', tiktok: 'Pub TikTok', google: 'Pub Google', influence: 'Influence', production: 'Photos & vidéos', local: 'Action locale', offre: 'Coût de l’offre', outil: 'Outil', ia: 'IA' };

function forecast(spend, h = hyp()) {
  const imp = spend.meta / h.metaCpm * 1000 + spend.tiktok / h.tiktokCpm * 1000;
  const clicks = (spend.meta / h.metaCpm * 1000) * h.metaCtr / 100 + (spend.tiktok / h.tiktokCpm * 1000) * h.tiktokCtr / 100 + spend.google / h.googleCpc;
  const orders = clicks * h.conv / 100;
  const total = spend.meta + spend.tiktok + spend.google;
  return { total, imp, clicks, orders, ca: orders * h.panier, cpa: orders ? total / orders : 0 };
}
const spendOf = (lines) => ({ meta: lines.filter((l) => l.type === 'meta').reduce((s, l) => s + l.amount, 0), tiktok: lines.filter((l) => l.type === 'tiktok').reduce((s, l) => s + l.amount, 0), google: lines.filter((l) => l.type === 'google').reduce((s, l) => s + l.amount, 0) });

function planOf(c) {
  const P = MK.campaignPlans[c.id] || { lines: [], extra: [] };
  const lines = P.lines.map((l) => Object.assign({}, l, { amount: amt(l) }));
  const len = D.diff(c.start, c.end);
  const raw = P.steps || MK.stepsCommon.concat(P.extra || []);
  const steps = raw.map(([off, task, who], i) => {
    const o = off === 'end' ? len : off === 'end+3' ? len + 3 : off;
    return { date: D.add(c.start, o), task, who, key: `${c.id}:${i}` };
  }).sort((a, b) => a.date.localeCompare(b.date));
  return { lines, steps, total: lines.reduce((s, l) => s + l.amount, 0), res: forecast(spendOf(lines)) };
}
const stepDone = (k) => !!(store.data.steps || {})[k];

function monthPlan() {
  const out = [];
  for (let i = 0; i < 12; i++) {
    const d = new Date(2026, 10 + i, 1);
    const ym = D.iso(d).slice(0, 7);
    const g = { pub: 0, influence: 0, production: 0, local: 0, offre: 0, outil: 0 };
    const spend = { meta: 0, tiktok: 0, google: 0 };
    const camps = campaignsSorted().filter((c) => c.start.slice(0, 7) === ym);
    camps.forEach((c) => planOf(c).lines.forEach((l) => { g[groupOf(l.type)] += l.amount; if (spend[l.type] !== undefined) spend[l.type] += l.amount; }));
    MK.budget.monthly.filter((l) => !l.from || ym >= l.from).forEach((l0) => { const a = amt(l0); g[groupOf(l0.type)] += a; if (spend[l0.type] !== undefined) spend[l0.type] += a; });
    out.push({ ym, label: `${cap1(D.monthsShort[d.getMonth()])} ${String(d.getFullYear()).slice(2)}`, camps, g, spend, total: Object.values(g).reduce((a, b) => a + b, 0) });
  }
  return out;
}

/* ---------- Campagnes (détaillées) ---------- */
function viewCampaigns() {
  return `${intro('Les campagnes de l’année', 'Chaque campagne a ses dates, son budget, ses résultats attendus et un plan jour par jour. Ouvre les détails seulement quand tu en as besoin.')}
    <div class="seg-s" role="group" aria-label="Scénario de budget">${Object.entries(MK.budget.scenarios).map(([k, v]) => `<button data-scen="${k}" aria-pressed="${scen() === k}">${v.label}</button>`).join('')}</div>
    <div class="stack-s">${campaignsSorted().map((c) => {
      const [st, tone] = campWhen(c);
      const P = planOf(c);
      const its = CAL.filter((x) => x.campaign === c.id && x.status !== 'archived' && x.platform !== 'pinterest');
      const next = P.steps.find((s) => !stepDone(s.key) && s.date >= TODAY_ISO);
      const doneN = P.steps.filter((s) => stepDone(s.key)).length;
      return `<article class="box camp ${tone === 'olive' ? 'camp--now' : ''}">
        <div class="camp__top"><div><h3>${esc(c.fr || c.name)}</h3><span class="muted small">${D.fmt(c.start, { long: true })} → ${D.fmt(c.end, { long: true, year: true })} · ${D.diff(c.start, c.end) + 1} jours</span></div><span class="tagx tagx--${tone}">${st}</span></div>
        <p>${esc(c.goal)}</p>
        <div class="nums">
          <div><b>${eur(P.total)}</b><span>budget total</span></div>
          <div><b>≈ ${nf(Math.round(P.res.orders))}</b><span>commandes grâce à la pub</span></div>
          <div><b>${P.res.cpa ? `≈ ${eur(P.res.cpa)}` : '—'}</b><span>coût par commande</span></div>
          <div><b>${doneN}/${P.steps.length}</b><span>étapes faites</span></div>
        </div>
        ${next ? `<p class="next">Prochaine étape · <strong>${D.fmt(next.date, { weekday: true })}</strong> : ${esc(next.task)}</p>` : ''}
        <details class="how"><summary>Le plan, jour par jour (${P.steps.length} étapes)</summary>
          <div class="timeline">${P.steps.map((s) => { const late = !stepDone(s.key) && s.date < TODAY_ISO; return `<label class="tl ${stepDone(s.key) ? 'ok' : ''} ${late ? 'late' : ''}"><input type="checkbox" id="st-${s.key.replace(':', '-')}" data-step="${s.key}" ${stepDone(s.key) ? 'checked' : ''}><span class="tl__d num">${cap1(D.fmt(s.date, { weekday: true }))}</span><span class="tl__t">${esc(s.task)}${late ? ' <em>en retard</em>' : ''}</span><span class="tl__w">${esc(s.who)}</span></label>`; }).join('')}</div>
        </details>
        <details class="how"><summary>Le budget ligne par ligne (${eur(P.total)})</summary>
          <div class="table-s"><table><thead><tr><th>Dépense</th><th>Détail</th><th class="num">Montant</th></tr></thead><tbody>
            ${P.lines.map((l) => `<tr><td><strong>${esc(l.label)}</strong><div class="tiny muted">${TYPE_LABEL[l.type]}</div></td><td class="small">${esc(l.detail)}</td><td class="num">${eur(l.amount)}</td></tr>`).join('')}
            <tr><td colspan="2"><strong>Total</strong></td><td class="num"><strong>${eur(P.total)}</strong></td></tr>
          </tbody></table></div>
          ${P.res.total ? `<p class="small muted">Avec ${eur(P.res.total)} de pub : environ ${nf(Math.round(P.res.imp / 1000))} 000 affichages, ${nf(Math.round(P.res.clicks))} visites sur le site, ${nf(Math.round(P.res.orders))} commandes et ${eur(P.res.ca)} de ventes. Calcul détaillé dans l’onglet « Budget & plan ».</p>` : ''}
        </details>
        <details class="how"><summary>Les détails : cible, offre, objectifs, publications</summary>
          <dl class="kv" style="margin-top:10px">
            <dt>Pour qui</dt><dd>${esc(c.target)}</dd>
            ${c.offer && c.offer !== '—' ? `<dt>L’offre</dt><dd>${esc(c.offer)}</dd>` : ''}
            <dt>Ce qu’on publie</dt><dd><ul class="facts facts--plain">${c.contents.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></dd>
            <dt>Objectifs</dt><dd>${c.kpis.map(([k, v]) => `${esc(k)} : <strong>${esc(v)}</strong>`).join('<br>')}</dd>
          </dl>
          <ul class="plist">${its.map((x) => `<li><button data-day="${x.date}" data-go="aujourdhui"><span class="lg lg--${x.platform}"></span><span class="num">${D.fmt(x.date, { weekday: true })}</span> ${esc(x.title)}</button></li>`).join('')}</ul>
        </details>
      </article>`;
    }).join('')}</div>`;
}

/* ---------- Budget & plan ---------- */
function simHTML(budget) {
  const h = hyp();
  const sp = { meta: budget * 0.55, tiktok: budget * 0.2, google: budget * 0.25 };
  const r = forecast(sp, h);
  const ltv = h.panier * h.ordersPerClient * h.marge / 100;
  return `<div class="nums nums--big">
      <div><b>${nf(Math.round(r.imp / 1000))} 000</b><span>affichages de tes pubs</span></div>
      <div><b>${nf(Math.round(r.clicks))}</b><span>visites sur le site</span></div>
      <div><b>≈ ${nf(Math.round(r.orders))}</b><span>commandes</span></div>
      <div><b>${eur(r.ca)}</b><span>de ventes</span></div>
    </div>
    <p>Avec <strong>${eur(budget)} de pub par mois</strong>, chaque nouvelle commande te coûte environ <strong>${eur(r.cpa)}</strong>. Un client qui revient ${h.ordersPerClient} fois te rapporte environ <strong>${eur(ltv)}</strong> de marge : ${r.cpa < ltv ? '<span class="good">la pub est rentable sur la durée ✓</span>' : '<span class="bad">la pub coûte plus qu’elle ne rapporte, baisse le budget ou améliore le site</span>'}.</p>
    <p class="muted small">Répartition utilisée : 55 % Instagram/Facebook, 20 % TikTok, 25 % Google.</p>`;
}
function viewBudget() {
  const mp = monthPlan();
  const total = mp.reduce((s, m) => s + m.total, 0);
  const launch = mp[0].total;
  const after = (total - launch) / 11;
  const groups = Object.keys(MK.budget.types).map((k) => [k, mp.reduce((s, m) => s + m.g[k], 0)]);
  const yearSpend = { meta: 0, tiktok: 0, google: 0 };
  mp.forEach((m) => Object.keys(yearSpend).forEach((k) => { yearSpend[k] += m.spend[k]; }));
  const yr = forecast(yearSpend);
  const max = Math.max(...mp.map((m) => m.total));
  const spent = store.data.spent || {};
  const simB = store.data.simBudget || 600;
  const h = hyp();
  return `${intro('Budget & plan', 'Combien ça coûte, où va l’argent, et ce que ça peut rapporter. Choisis d’abord ton niveau de budget.')}
    <div class="seg-s" role="group" aria-label="Scénario de budget">${Object.entries(MK.budget.scenarios).map(([k, v]) => `<button data-scen="${k}" aria-pressed="${scen() === k}">${v.label}</button>`).join('')}</div>
    <p class="muted">${MK.budget.scenarios[scen()].text}</p>

    <div class="nums nums--big">
      <div><b>${eur(total)}</b><span>sur 12 mois</span></div>
      <div><b>${eur(launch)}</b><span>pour le lancement (novembre)</span></div>
      <div><b>≈ ${eur(after)}</b><span>par mois ensuite</span></div>
      <div><b>≈ ${nf(Math.round(yr.orders))}</b><span>commandes apportées par la pub</span></div>
    </div>

    <section class="box"><h3>Où va l’argent</h3>
      <div class="mixbar mixbar--big">${groups.map(([k, v]) => `<span style="flex:${v};background:${MK.budget.types[k].color}" title="${MK.budget.types[k].label} : ${eur(v)}"></span>`).join('')}</div>
      <div class="money">${groups.sort((a, b) => b[1] - a[1]).map(([k, v]) => `<div class="money__i"><i style="background:${MK.budget.types[k].color}"></i><div><strong>${MK.budget.types[k].label} · ${eur(v)}</strong> <span class="muted">(${Math.round((v / total) * 100)} %)</span><p class="small muted">${MK.budget.types[k].what}</p></div></div>`).join('')}</div>
    </section>

    <section class="box"><h3>Mois par mois</h3>
      <div class="bars">${mp.map((m) => `<div class="bars__c" title="${m.label} : ${eur(m.total)}"><span class="bars__v num">${nf(Math.round(m.total))}</span><span class="bars__b" style="height:${(m.total / max) * 100}%"></span><span class="bars__l">${m.label}</span></div>`).join('')}</div>
      <div class="table-s"><table><thead><tr><th>Mois</th><th>Campagne</th><th class="num">Pub</th><th class="num">Influence</th><th class="num">Photos/vidéos</th><th class="num">Local + offres</th><th class="num">Outils</th><th class="num">Total prévu</th><th>Dépensé</th></tr></thead><tbody>
        ${mp.map((m) => `<tr><td><strong>${m.label}</strong></td><td class="small">${m.camps.map((c) => esc(c.fr || c.name)).join(', ') || '<span class="muted">—</span>'}</td><td class="num">${eur(m.g.pub)}</td><td class="num">${eur(m.g.influence)}</td><td class="num">${eur(m.g.production)}</td><td class="num">${eur(m.g.local + m.g.offre)}</td><td class="num">${eur(m.g.outil)}</td><td class="num"><strong>${eur(m.total)}</strong></td><td><input class="in in--s num" id="sp-${m.ym}" data-spent="${m.ym}" inputmode="numeric" value="${esc(spent[m.ym] || '')}" placeholder="—" aria-label="Dépensé en ${m.label}"></td></tr>`).join('')}
        <tr><td colspan="7"><strong>Total sur 12 mois</strong></td><td class="num"><strong>${eur(total)}</strong></td><td class="num small">${Object.values(spent).some((v) => v) ? eur(Object.values(spent).reduce((s, v) => s + (Number(String(v).replace(/[^\d.,]/g, '').replace(',', '.')) || 0), 0)) : ''}</td></tr>
      </tbody></table></div>
      <p class="muted small">Note chaque mois ce que tu as vraiment dépensé dans la dernière colonne pour comparer avec le prévu.</p>
    </section>

    <section class="box"><h3>Le simulateur de pub</h3><p class="muted">Bouge le curseur : combien de commandes pour combien d’euros ?</p>
      <label class="sim"><span>Budget pub par mois</span><input type="range" min="0" max="2000" step="50" value="${simB}" id="sim-b" data-sim><b id="sim-v" class="num">${eur(simB)}</b></label>
      <div id="sim-out">${simHTML(simB)}</div>
      <details class="how"><summary>Changer les hypothèses (pour les curieux)</summary>
        <div class="hyps">${[['metaCpm', 'Coût pour 1 000 affichages Instagram/Facebook (€)'], ['metaCtr', 'Part des gens qui cliquent, Instagram/Facebook (%)'], ['tiktokCpm', 'Coût pour 1 000 affichages TikTok (€)'], ['tiktokCtr', 'Part des gens qui cliquent, TikTok (%)'], ['googleCpc', 'Coût d’un clic Google (€)'], ['conv', 'Part des visiteurs qui commandent (%)'], ['panier', 'Panier moyen (€)'], ['marge', 'Marge brute (%)'], ['ordersPerClient', 'Commandes par client sur 6 mois']].map(([k, l]) => `<label class="field-s"><span class="lab">${l}</span><input class="in" type="number" step="0.1" min="0" id="hy-${k}" data-hyp="${k}" value="${h[k]}"></label>`).join('')}</div>
        <p class="muted small">Ordres de grandeur pour une petite marque food à Lyon. Ajuste-les avec tes vrais chiffres après 2 à 4 semaines de pub (ils sont dans le gestionnaire de publicités).</p>
      </details>
    </section>

    <section class="box"><h3>Les outils</h3>
      <div class="table-s"><table><thead><tr><th>Outil</th><th>À quoi ça sert</th><th>Prix</th></tr></thead><tbody>${MK.budget.tools.map(([a, b, c]) => `<tr><td><strong>${a}</strong></td><td>${b}</td><td class="small">${c}</td></tr>`).join('')}</tbody></table></div>
    </section>
    <p class="warn">Tous les prix sont des estimations. Demande des devis (photographe, impression) et fixe toujours un plafond de dépense par jour dans les outils de publicité.</p>`;
}

/* ---------- Géré par l'IA ---------- */
const BRAND_CTX = 'Tu es le responsable marketing de PREP CLUB, une marque de repas préparés (meal prep) à Lyon : on commande à la carte, en box ou avec un planning de la semaine, sans abonnement obligatoire. Atelier à Gerland (Lyon 7e), points de retrait à la Part-Dieu et à la Croix-Rousse, 6 producteurs partenaires à moins de 45 km. Ton : simple, chaleureux, précis, vouvoiement. Signature : « Your week, prepared. » Interdit : allégations santé, promesses non vérifiées, urgence artificielle, chiffres inventés (signale « information manquante » si une info manque).';
let iaArticle = 0;
let iaCamp = 'launch';
function iaPrompts() {
  const a = MK.articles[iaArticle];
  const c = campaignState(MK.campaigns.find((x) => x.id === iaCamp));
  const ads = MK.ads.filter((x) => x.campaign === c.id);
  const ym = clamp(TODAY_ISO).slice(0, 7);
  const its = CAL.filter((x) => x.date.startsWith(ym));
  const kpi = store.data.kpi || {};
  const now = campaignAt(clamp(TODAY_ISO));
  return [
    { id: 'seo', title: 'Écrire un article de blog (SEO)', pick: `<select class="in" id="ia-art" data-iaart aria-label="Choisir l’article">${MK.articles.map((x, i) => `<option value="${i}" ${i === iaArticle ? 'selected' : ''}>${esc(x.title)}</option>`).join('')}</select>`,
      text: `${BRAND_CTX}\n\nRédige un article de blog optimisé pour le mot-clé « ${a.kw} ».\nTitre : ${a.title}\nLongueur : environ ${a.words} mots.\nPlan à suivre :\n${a.outline.map((o, i) => `${i + 1}. ${o}`).join('\n')}\n\nConsignes :\n- une introduction de 3 phrases qui répond tout de suite à la question ;\n- un intertitre par partie du plan ;\n- des phrases courtes, faciles à lire sur téléphone ;\n- deux liens internes vers les pages ${a.links.join(' et ')} du site ;\n- une conclusion avec un appel à découvrir PREP CLUB ;\n- à la fin, propose une description Google de 150 caractères maximum et 3 idées de titres alternatifs.` },
    { id: 'pub', title: 'Créer des variantes de pub', pick: `<select class="in" id="ia-camp" data-iacamp aria-label="Choisir la campagne">${campaignsSorted().map((x) => `<option value="${x.id}" ${x.id === iaCamp ? 'selected' : ''}>${esc(x.fr || x.name)}</option>`).join('')}</select>`,
      text: `${BRAND_CTX}\n\nCampagne : « ${c.fr || c.name} », du ${D.fmt(c.start, { long: true })} au ${D.fmt(c.end, { long: true, year: true })}.\nObjectif : ${c.goal}\nCible : ${c.target}\nOffre exacte (à ne pas modifier) : ${c.offer}\n${ads.length ? `Textes actuels :\n${ads.map((x) => `- ${x.channel} : « ${x.text} »`).join('\n')}\n` : ''}\nPropose :\n1. 5 textes principaux de 125 caractères maximum ;\n2. 5 titres de 40 caractères maximum ;\n3. 3 accroches pour les 2 premières secondes d’une vidéo.\nClasse-les de la plus directe à la plus émotionnelle, et indique laquelle tu testerais en premier et pourquoi.` },
    { id: 'reels', title: 'Trouver les idées de Reels de la semaine', text: `${BRAND_CTX}\n\nPropose 5 idées de Reels et de TikTok pour la semaine du ${D.fmt(D.monday(clamp(TODAY_ISO)), { long: true, year: true })}.\n${now ? `Campagne en cours : « ${now.fr || now.name} » (${now.goal})\n` : ''}Saison : ${SEASONS[seasonOf(clamp(TODAY_ISO))].name.toLowerCase()} (${SEASONS[seasonOf(clamp(TODAY_ISO))].ingredients.join(', ').toLowerCase()}).\n\nPour chaque idée : l’accroche des 2 premières secondes, 4 plans faciles à filmer au téléphone, le texte à afficher à l’écran, une légende de 2 phrases et 5 hashtags dont #MealPrepLyon. Inspire-toi des formats qui marchent en ce moment (POV, avant/après, « ma semaine en… », coulisses).` },
    { id: 'comment', title: 'Répondre à un commentaire', text: `${BRAND_CTX}\n\nVoici un commentaire reçu sur Instagram ou TikTok : « [COLLE LE COMMENTAIRE ICI, SANS LE NOM DE LA PERSONNE] »\n\nPropose 3 réponses courtes (2 phrases maximum), chaleureuses, au vouvoiement. Si c’est une réclamation, propose poliment de continuer en message privé. N’invente aucune information sur nos produits.` },
    { id: 'google', title: 'Répondre à un avis Google', text: `${BRAND_CTX}\n\nVoici un avis Google laissé sur PREP CLUB (note : [X]/5) : « [COLLE L’AVIS ICI, SANS LE NOM DU CLIENT] »\n\nRédige une réponse publique de 3 à 4 phrases : remercie, réponds précisément à ce qui est dit, et glisse naturellement « repas préparés à Lyon ». Si l’avis est négatif, reconnais le problème et propose une solution concrète sans te justifier longuement.` },
    { id: 'gbp', title: 'Rédiger la fiche Google (SEO local)', text: `${BRAND_CTX}\n\nRédige la description de la fiche Google Business Profile de PREP CLUB (750 caractères maximum). Intègre naturellement : « repas préparés Lyon », « meal prep Lyon », « livraison repas Lyon ». Adresse de l’atelier : 24 rue de Gerland, 69007 Lyon. Propose aussi 5 questions/réponses pour la rubrique « Questions et réponses » de la fiche, et 4 idées de posts Google pour le mois.` },
    { id: 'analyse', title: 'Analyser mes chiffres du mois', text: `${BRAND_CTX}\n\nVoici mes chiffres du mois de ${D.months[Number(ym.slice(5)) - 1]} ${ym.slice(0, 4)} :\n${MK.objectives.filter((o) => ['o1', 'o2', 'o3', 'o4', 'o5', 'o6', 'o7', 'o8'].includes(o.id)).map((o) => `- ${o.kpi} : ${kpi[o.id] || '[non renseigné]'} (objectif à 3 mois : ${o.m3})`).join('\n')}\n- Publications faites : ${its.filter((x) => isDone(x.id)).length} sur ${its.length} prévues\n- Budget dépensé : ${(store.data.spent || {})[ym] || '[non renseigné]'} € (prévu : ${eur((monthPlan().find((m) => m.ym === ym) || { total: 0 }).total)})\n\nExplique-moi en 5 lignes simples ce qui va bien et ce qui va moins bien, puis propose 3 actions concrètes pour le mois prochain, classées par impact. Je ne suis pas expert : évite le jargon.` },
    { id: 'trad', title: 'Traduire en anglais', text: `${BRAND_CTX}\n\nTraduis ce texte en anglais naturel pour Instagram, comme l’écrirait une marque food britannique moderne. Garde les emojis et les hashtags (ajoute #MealPrepLyon). Ne traduis pas « PREP CLUB ».\n\nTexte : [COLLE LE TEXTE ICI]` },
  ];
}
function viewIA() {
  const t = MK.ai;
  return `${intro('Géré par l’IA', 'L’IA prépare le travail répétitif (SEO, pubs, idées, réponses, analyses). Toi, tu relis et tu valides. Copie un prompt, colle-le dans ChatGPT ou Claude, c’est tout.')}
    <div class="nums nums--big">
      <div><b>≈ 8 h</b><span>gagnées par semaine (estimation)</span></div>
      <div><b>≈ 20 €</b><span>par mois (un assistant IA)</span></div>
      <div><b>${t.tasks.length}</b><span>tâches prises en charge</span></div>
    </div>

    <section class="box"><h3>Ta semaine avec l’IA</h3>
      <div class="table-s"><table><thead><tr><th>Jour</th><th>Ce que fait l’IA</th><th>Ton temps</th></tr></thead><tbody>${t.week.map(([d, w, m]) => `<tr><td><strong>${d}</strong></td><td>${w}</td><td class="small">${m}</td></tr>`).join('')}</tbody></table></div>
    </section>

    <section class="stack-s"><h2>Les prompts prêts à copier</h2>
      <p class="muted">Ils contiennent déjà tout le contexte de PREP CLUB. Remplace seulement ce qui est entre crochets [ ].</p>
      ${iaPrompts().map((pr) => `<article class="box"><div class="camp__top"><h3>${pr.title}</h3>${cbtn(pr.text, 'Copier le prompt', 'mini--olive')}</div>${pr.pick ? `<div class="field-s">${pr.pick}</div>` : ''}<details class="how"><summary>Voir le prompt</summary><div class="copybox">${esc(pr.text)}</div></details></article>`).join('')}
    </section>

    <section class="stack-s"><h2>Ce que l’IA gère</h2>
      <div class="grid2">${t.tasks.map((x) => `<div class="box"><span class="tagx tagx--olive">${x.area}</span><strong>${x.what}</strong><span class="small"><b>Quand :</b> ${x.when} · <b>Outil :</b> ${x.tool}</span><span class="small"><b>Ton rôle :</b> ${x.human}</span><span class="small muted">Temps gagné : ${x.gain}</span></div>`).join('')}</div>
    </section>

    <section class="box panel-rules"><h3>Les règles à respecter</h3><ul class="facts facts--plain">${t.rules.map((r) => `<li>${r}</li>`).join('')}</ul></section>`;
}

/* =========================================================================
   Textes prêts
   ========================================================================= */
function viewTexts() {
  const tabs = [['posts', 'Publications'], ['emails', 'E-mails automatiques'], ['influence', 'Influenceurs'], ['pubs', 'Publicités'], ['blog', 'Articles de blog']];
  let body = '';
  if (textTab === 'posts') {
    body = `<p class="muted">Des textes de secours pour publier quand tu veux, en plus du calendrier. ${lang === 'fr' ? '' : 'English version.'}</p>
      <div class="seg-s"><button data-lang="fr" aria-pressed="${lang === 'fr'}">Français</button><button data-lang="en" aria-pressed="${lang === 'en'}">English</button></div>
      ${MK.captions.map((c) => { const t = c[lang]; const full = `${t.head}\n\n${t.body}\n\n${t.cta}\n\n${c.tags.join(' ')}`; return `<article class="box">
        <span class="tagx tagx--line">${esc(c.goal)}</span>
        <div class="copybox">${esc(full)}</div>
        <div class="row-s">${cbtn(full, 'Copier le texte', 'mini--olive')}<span class="muted small">Idéal : ${esc(c.date)}</span></div>
      </article>`; }).join('')}`;
  } else if (textTab === 'emails') {
    body = `<p class="muted">Ces e-mails partent tout seuls une fois réglés dans ton outil d’e-mail (Brevo, Mailchimp…). Copie chaque objet et chaque texte une seule fois.</p>
      ${MK.flows.map((f) => `<article class="box"><h3>${esc(f.fr)}</h3><p class="muted small">Quand : ${esc(f.trigger.toLowerCase())}.</p>
        ${f.emails.map((e, i) => `<div class="mail-s">
          <span class="small"><strong>E-mail ${i + 1}</strong> · ${esc(delayFr(e.delay))}</span>
          <div class="copybox copybox--one">${esc(e.subject)}</div>
          <div class="copybox">${esc(`${e.body}\n\n👉 ${e.cta} : https://prep-club.vercel.app\n\nL’équipe PREP CLUB`)}</div>
          ${e.note ? `<p class="warn">À faire avant : ${esc(e.note)}</p>` : ''}
          <div class="row-s">${cbtn(e.subject, 'Copier l’objet')}${cbtn(`${e.body}\n\n👉 ${e.cta} : https://prep-club.vercel.app\n\nL’équipe PREP CLUB`, 'Copier le texte', 'mini--olive')}</div>
        </div>`).join('')}
      </article>`).join('')}`;
  } else if (textTab === 'influence') {
    const kit = MK.influencerKit.map(([k, v]) => `${k} : ${v}`).join('\n\n');
    body = `<p class="muted">Pour contacter des créateurs de contenu lyonnais. Remplace ce qui est entre accolades { } avant d’envoyer.</p>
      ${MK.influencerMessages.map((m) => `<article class="box"><h3>${esc(m.name)}</h3><div class="copybox">${esc(m.text)}</div><div class="row-s">${cbtn(m.text, 'Copier le message', 'mini--olive')}</div></article>`).join('')}
      <article class="box"><h3>Le kit à leur envoyer</h3><div class="copybox">${esc(kit)}</div><div class="row-s">${cbtn(kit, 'Copier le kit', 'mini--olive')}</div>
      <p class="warn">Obligatoire : le créateur doit écrire « Collaboration commerciale » ou « Publicité » sur son contenu (loi du 9 juin 2023).</p></article>
      <article class="box"><h3>Qui contacter ?</h3><ul class="facts facts--plain"><li>Créateurs food et lifestyle basés à Lyon</li><li>Comptes de 5 000 à 50 000 abonnés (micro-influenceurs)</li><li>Profils « vie de bureau » et « organisation »</li><li>Créateurs qui parlent de producteurs locaux</li></ul></article>`;
  } else if (textTab === 'pubs') {
    body = `<p class="muted">Les textes des publicités Instagram, Facebook, TikTok et Google. Les budgets sont des propositions : rien n’est dépensé sans ton accord.</p>
      ${MK.ads.map((a) => `<article class="box"><div class="camp__top"><h3>${esc(a.name)}</h3><span class="tagx tagx--line">${a.budget} € proposés</span></div>
        <dl class="kv"><dt>Où</dt><dd>${esc(a.channel)}</dd><dt>Pour qui</dt><dd>${esc(a.audience)}</dd><dt>Zone</dt><dd>${esc(a.zone)}</dd><dt>Quand</dt><dd>${esc(a.dates)}</dd><dt>Bouton</dt><dd>${esc(a.cta)}</dd></dl>
        <div class="copybox">${esc(a.text)}</div><div class="row-s">${cbtn(a.text, 'Copier le texte', 'mini--olive')}</div></article>`).join('')}`;
  } else {
    body = `<p class="muted">Des articles pour être trouvé sur Google quand on cherche « meal prep Lyon » ou « repas préparés Lyon ». Chaque fiche donne le titre, la description qui s’affiche sur Google et le plan à suivre.</p>
      ${MK.articles.map((a) => { const t = `Titre : ${a.title}\nDescription Google : ${a.meta}\nAdresse de la page : /blog/${a.slug}\n\nPlan :\n${a.outline.map((o, i) => `${i + 1}. ${o}`).join('\n')}`; return `<article class="box"><div class="camp__top"><h3>${esc(a.title)}</h3><span class="muted small num">${D.fmt(a.date, { year: true })}</span></div>
        <div class="google"><span class="google__t">${esc(a.title)}</span><span class="google__d">${esc(a.meta)}</span></div>
        <span class="small"><strong>Le plan :</strong> ${a.outline.map(esc).join(' · ')}</span>
        <div class="row-s">${cbtn(t, 'Copier la fiche', 'mini--olive')}<span class="muted small">Environ ${nf(a.words)} mots · mot-clé : ${esc(a.kw)}</span></div></article>`; }).join('')}`;
  }
  return `${intro('Les textes prêts', 'Tout ce qu’il faut copier-coller, rangé par usage.')}
    <div class="chips-s">${tabs.map(([k, l]) => `<button data-ttab="${k}" aria-pressed="${textTab === k}">${l}</button>`).join('')}</div>
    <div class="stack-s">${body}</div>`;
}

/* =========================================================================
   Images
   ========================================================================= */
/* Photos proposées dans les créas */
const PHOTO_CHOICES = [
  ...PRODUCTS.map((x) => [x.img, x.name]),
  [IMG.spread, 'Table garnie'], [IMG.tabletop, 'Plats sur la table'], [IMG.breakfastSpread, 'Petits-déjeuners'], [IMG.salads, 'Salades'], [IMG.saladBowl, 'Bol de salade'],
  [IMG.cooking, 'En cuisine'], [IMG.tablet, 'Planning sur tablette'], [IMG.market, 'Marché'], [IMG.shelves, 'Rayons de supermarché'], [IMG.field, 'Champ'], [IMG.seedlings, 'Maraîcher'],
  [IMG.picking, 'Cueillette'], [IMG.mushrooms, 'Champignons'], [IMG.pumpkin, 'Courges'], [IMG.asparagus, 'Asperges'], [IMG.tomatoes, 'Tomates'], [IMG.cabbage, 'Choux'],
];
const UPLOADS = [];
let creaFilter = 'video';
let creaSel = null;

function viewCreas() {
  if (creaSel) return creaEditor();
  const list = MO.T.filter((t) => t.tags.includes(creaFilter) && t.id !== 'storyframe');
  return `${intro('Vidéos & visuels', 'Des formats qui ressemblent à ce qui marche aujourd’hui sur Instagram et TikTok : texte façon TikTok, jump cuts, stickers, posts « notes ». Appuie sur ▶ pour voir l’animation.')}
    <section class="box"><strong>Le film principal PREP CLUB · 50 s</strong><span class="muted small">La vidéo pub qui présente le site et le service en motion design : accroche, carte, box, planning, producteurs, livraison. Formats 16:9 et 9:16, musique incluse.</span><a class="big big--olive" href="video-pub.html" style="text-decoration:none">Voir et télécharger le film</a></section>
    <div class="chips-s">${[['video', 'Vidéos animées'], ['image', 'Visuels'], ['pub', 'Pour la pub']].map(([k, l]) => `<button data-cfilter="${k}" aria-pressed="${creaFilter === k}">${l}</button>`).join('')}</div>
    <section class="box box--tip"><strong>Pour un rendu 100 % réaliste</strong><span>Remplace les photos d’exemple par <b>tes vraies photos ou vidéos</b> prises au téléphone : bouton « Personnaliser », puis « Importer ». Lumière du jour, plats vus du dessus, mains dans le cadre : c’est ce qui fonctionne le mieux.</span></section>
    <div class="creas">${list.map((t) => { const spec = { tpl: t.id, fmt: creaFilter === 'pub' ? 'post' : (t.fmt || 'story') }; return `<article class="crea">
      ${player(spec)}
      <div class="crea__b"><strong>${t.name}</strong>${t.kind === 'video' ? `<span class="tagx tagx--olive">Vidéo · ${String(t.dur).replace('.', ',')} s</span>` : '<span class="tagx tagx--line">Image</span>'}</div>
      <span class="muted small">${t.use}</span>
      <button class="mini mini--olive" data-pick="${t.id}" data-fmt="${spec.fmt}">Personnaliser et télécharger</button>
    </article>`; }).join('')}</div>`;
}

function creaEditor() {
  const t = MO.byId(creaSel.tpl);
  const photos = creaSel.photos && creaSel.photos.length ? creaSel.photos : t.photos.slice();
  creaSel.photos = photos;
  const d = Object.assign(MO.defaults(t), creaSel.data || {});
  creaSel.data = d;
  const fmts = t.fmt === 'pin' ? [['pin', 'Pinterest 2:3']] : [['story', 'Reel / Story / TikTok'], ['post', 'Post 4:5'], ['square', 'Carré 1:1']];
  const opts = (cur) => {
    const ui = UPLOADS.findIndex((u) => u.src === cur);
    const curV = ui >= 0 ? `up:${ui}` : cur;
    const list = [...UPLOADS.map((u, i) => [`up:${i}`, `📱 ${u.name}`]), ...PHOTO_CHOICES];
    if (!list.some(([v]) => v === curV)) list.unshift([curV, 'Photo actuelle']);
    return list.map(([v, l]) => `<option value="${esc(v)}" ${curV === v ? 'selected' : ''}>${esc(l)}</option>`).join('');
  };
  return `<button class="mini" data-back-crea>${SVG.left} Toutes les vidéos & visuels</button>
    ${intro(t.name, t.use)}
    <div class="editor-s">
      <div class="editor-s__prev">${player({ tpl: t.id, fmt: creaSel.fmt, data: d, photos }, true)}
        <div class="row-s">${t.kind === 'video' ? `<button class="big big--olive" data-ed-video>${SVG.dl} Télécharger la vidéo</button><button class="mini" data-ed-image>Image de couverture</button>` : `<button class="big big--olive" data-ed-image>${SVG.dl} Télécharger l’image</button>`}</div>
        ${t.kind === 'video' ? '<p class="muted small">L’enregistrement dure le temps de la vidéo : garde la page ouverte. Ajoute ensuite un son tendance dans Instagram ou TikTok.</p>' : ''}
      </div>
      <div class="editor-s__form">
        <div class="field-s"><span class="lab">Format</span><div class="seg-s">${fmts.map(([k, l]) => `<button data-cfmt="${k}" aria-pressed="${creaSel.fmt === k}">${l}</button>`).join('')}</div></div>
        ${t.fields.map(([k, label]) => `<div class="field-s"><label class="lab" for="cf-${k}">${label}</label>${String(d[k]).includes('\n') || k === 'lines' || k === 'names' || k === 'plats' ? `<textarea class="in" rows="${Math.max(3, String(d[k]).split('\n').length)}" id="cf-${k}" data-cf="${k}">${esc(d[k])}</textarea>` : `<input class="in" id="cf-${k}" data-cf="${k}" value="${esc(d[k])}">`}</div>`).join('')}
        ${photos.length ? `<div class="field-s"><span class="lab">Photos ${t.kind === 'video' ? 'ou vidéos ' : ''}(${photos.length})</span>
          ${photos.map((ph, i) => `<div class="photo-row"><span class="num muted">${i + 1}</span><select class="in" id="cp-${i}" data-cphoto="${i}" aria-label="Photo ${i + 1}">${opts(ph)}</select><label class="mini upl">Importer<input type="file" accept="image/*${t.kind === 'video' ? ',video/*' : ''}" data-cupload="${i}" hidden></label></div>`).join('')}
          <span class="muted small">Tes imports restent sur cet ordinateur, rien n’est envoyé en ligne.</span></div>` : ''}
      </div>
    </div>`;
}
let editorEl = null;
/* =========================================================================
   La stratégie
   ========================================================================= */
/* Proposition : le film de lancement */
function filmProposal() {
  const F = MK.film;
  if (!F) return '';
  return `<section class="stack-s film-s" id="film"><div class="film-s__head"><span class="tagx tagx--olive">${F.status}</span><h2>${F.name}</h2><p class="muted">${F.pitch}</p></div>
      <div class="film-s__videos">${F.files.map((f) => `<figure class="film-s__v film-s__v--${f.fmt === '16:9' ? 'wide' : 'tall'}"><video src="${f.src}" poster="${f.poster}" controls preload="metadata" playsinline style="aspect-ratio:${f.w} / ${f.h}"></video>
        <figcaption><strong>${f.label} · ${f.fmt}</strong><span class="muted small">${f.use}</span><a class="mini" href="${f.src}" download>Télécharger</a></figcaption></figure>`).join('')}</div>
      <div class="grid2">${F.why.map(([a, b]) => `<div class="box"><strong>${a}</strong><span class="muted small">${b}</span></div>`).join('')}</div>
      <div class="box"><h3>Où et quand le diffuser</h3><div class="table-s"><table><thead><tr><th>Quand</th><th>Où</th><th>Format</th><th>Comment</th></tr></thead><tbody>
        ${F.plan.map((r) => `<tr><td><strong>${r.when}</strong></td><td>${r.where}</td><td><span class="tagx tagx--line">${r.fmt}</span></td><td>${r.how}</td></tr>`).join('')}
      </tbody></table></div><p class="muted small">Budget publicitaire proposé : <strong>${F.budget.amount} €</strong>. ${F.budget.detail}</p></div>
      <div class="grid2">
        <div class="box"><h3>Comment savoir si ça marche</h3><dl class="kv">${F.kpis.map(([a, b]) => `<dt>${a}</dt><dd>${b}</dd>`).join('')}</dl></div>
        <div class="box"><h3>Avant de publier</h3><ul class="facts facts--plain">${F.before.map((x) => `<li>${x}</li>`).join('')}</ul>
          <h3>Pour aller plus loin</h3><ul class="facts facts--plain">${F.next.map(([a, b]) => `<li><strong>${a}</strong> : ${b}</li>`).join('')}</ul></div>
      </div>
      <a class="big big--olive" href="video-pub.html" style="text-decoration:none;align-self:flex-start">Modifier les textes et réexporter le film</a>
    </section>`;
}
function viewStrategy() {
  const P = MK.personas;
  return `${intro('La stratégie, en clair', 'Ce qu’il faut avoir en tête avant de publier quoi que ce soit.')}
    <section class="box box--olive"><span class="eyebrow-s">Notre signature</span><p class="sig">Your week, <i>prepared.</i></p><p>Votre semaine, préparée. PREP CLUB aide les Lyonnais à organiser leurs repas de la semaine : à la carte, en box ou avec le planning, <strong>sans abonnement obligatoire</strong>.</p></section>

    ${filmProposal()}

    <section class="stack-s"><h2>Ce qu’on veut obtenir</h2>
      <div class="grid3">${[['Se faire connaître', 'à Lyon, sur Instagram et TikTok', MK.objectives[0].m3 + ' abonnés en 3 mois'], ['Faire commander', 'avec le planning de la semaine', MK.objectives[2].m3 + ' des visiteurs commandent'], ['Faire revenir', 'avec la newsletter du dimanche', MK.objectives[6].m3 + ' recommandent dans le mois']].map(([a, b, c]) => `<div class="box"><strong class="big-t">${a}</strong><span class="muted">${b}</span><span class="tagx tagx--olive">${c}</span></div>`).join('')}</div>
    </section>

    <section class="stack-s"><h2>Nos 4 messages</h2><p class="muted">Chaque publication doit faire passer au moins un de ces messages.</p>
      <div class="grid2">${MK.pillars.map((p) => `<div class="box"><strong class="big-t">${p.fr}</strong><span>${p.goal}</span><span class="quote-s">« ${p.messages[0]} »</span>${p.check ? `<span class="warn">${p.check}</span>` : ''}</div>`).join('')}</div>
    </section>

    <section class="stack-s"><h2>À qui on parle</h2>
      <div class="grid2">${P.map((p) => `<div class="box"><strong class="big-t">${p.fr}</strong><span class="muted small">${p.age} · ${p.profile}</span>
        <dl class="kv"><dt>Ce qu’il veut</dt><dd>${p.needs.slice(0, 3).join(', ')}</dd><dt>Ce qu’on lui dit</dt><dd>« ${p.messages[0]} »</dd><dt>Ce qu’on lui propose</dt><dd>${p.products.slice(0, 3).join(', ')}</dd></dl></div>`).join('')}</div>
    </section>

    <section class="stack-s"><h2>Où et quand on publie</h2>
      <div class="table-s"><table><thead><tr><th>Jour</th><th>Instagram</th><th>Ailleurs</th></tr></thead><tbody>
        ${[['Lundi', 'Une publication pour organiser sa semaine', 'Vidéo TikTok'], ['Mardi', 'Stories avec un sondage', 'Épingle Pinterest'], ['Mercredi', 'Le plat de la semaine + un Reel', 'Vidéo TikTok'], ['Jeudi', 'Stories', 'Épingle Pinterest'], ['Vendredi', 'Un Reel en coulisses ou chez un producteur', 'Vidéo TikTok'], ['Samedi', 'Stories communauté', 'Épingle Pinterest'], ['Dimanche', 'Le menu de la semaine + Stories', 'Newsletter « The Weekly Prep »']].map((r) => `<tr><td><strong>${r[0]}</strong></td><td>${r[1]}</td><td>${r[2]}</td></tr>`).join('')}
      </tbody></table></div>
      <p class="muted small">Après un mois, regarde dans les statistiques d’Instagram à quelle heure ta communauté est connectée, et ajuste.</p>
    </section>

    <section class="stack-s"><h2>De quoi on parle</h2>
      <div class="mixbar">${MK.editorial.map((e) => `<span style="flex:${e.share};background:${e.color}" title="${e.fr}"></span>`).join('')}</div>
      <ul class="facts">${MK.editorial.map((e) => `<li><i class="sw" style="background:${e.color}"></i><b>${e.share} %</b> ${e.fr.toLowerCase()} <span class="muted">(${e.ex.toLowerCase()})</span></li>`).join('')}</ul>
    </section>

    <section class="grid2">
      <div class="box"><h3>À faire</h3><ul class="facts facts--plain">${MK.tone.dos.map((x) => `<li>${x}</li>`).join('')}</ul></div>
      <div class="box"><h3>À ne jamais faire</h3><ul class="facts facts--plain">${MK.tone.donts.map((x) => `<li>${x}</li>`).join('')}</ul></div>
    </section>

    <section class="box"><h3>Les couleurs de la marque</h3><div class="pal">${[['Crème', '#F4EEE2'], ['Olive', '#5C6B3C'], ['Sable', '#E4D6BA'], ['Taupe', '#8A7B6A'], ['Charbon', '#2A2925']].map(([n2, h]) => `<button class="pal__c" data-c="${reg(h)}" title="Copier ${h}"><span style="background:${h}"></span>${n2}<small>${h}</small></button>`).join('')}</div></section>`;
}

/* =========================================================================
   Mon suivi
   ========================================================================= */
const LAUNCH_TASKS = [
  ['t2', 'Mettre le lien du site dans la bio Instagram et TikTok'],
  ['t7', 'Créer les stories « à la une » : Menu, Planning, Producteurs, Avis'],
  ['t5', 'Prendre en photo les 10 plats les plus vendus'],
  ['t6', 'Programmer la newsletter du lundi 16 novembre'],
  ['t3', 'Valider (ou non) le budget publicité du lancement'],
  ['t4', 'Contacter 3 créateurs de contenu lyonnais'],
  ['t8', 'Demander une attestation à chaque producteur partenaire'],
  ['t9', 'Créer la fiche Google de PREP CLUB (Google Business Profile)'],
];
function viewSuivi() {
  const ym = clamp(TODAY_ISO).slice(0, 7);
  const its = CAL.filter((c) => c.date.startsWith(ym) && c.status !== 'archived');
  const upto = its.filter((c) => c.date <= TODAY_ISO);
  const done = its.filter((c) => isDone(c.id));
  const late = upto.filter((c) => !isDone(c.id));
  const rows = [['instagram', 'Instagram'], ['tiktok', 'TikTok'], ['pinterest', 'Pinterest'], ['newsletter', 'Newsletter']];
  store.data.kpi = store.data.kpi || {};
  const tasksOk = LAUNCH_TASKS.filter(([id]) => store.data.tasks[id]).length;
  return `${intro('Mon suivi', 'Où tu en es, et les chiffres à noter chaque mois.')}
    <section class="box"><h3>${cap1(D.months[Number(ym.slice(5)) - 1])} : ${done.length} publications faites sur ${its.length}</h3>
      ${rows.map(([k, l]) => { const a = its.filter((c) => c.platform === k); const b = a.filter((c) => isDone(c.id)); return `<div class="prog"><span>${l}</span><span class="prog__bar"><span class="lg--${k}" style="width:${a.length ? (b.length / a.length) * 100 : 0}%"></span></span><span class="num small">${b.length}/${a.length}</span></div>`; }).join('')}
      ${late.length ? `<p class="warn">${late.length} publication${late.length > 1 ? 's' : ''} pas encore cochée${late.length > 1 ? 's' : ''} sur les jours passés. <button class="linkb" data-day="${late[0].date}" data-go="aujourdhui">Voir la première</button></p>` : '<p class="muted small">Aucun retard. 👌</p>'}
    </section>
    <section class="box"><h3>Avant le lancement · ${tasksOk}/${LAUNCH_TASKS.length}</h3>
      ${LAUNCH_TASKS.map(([id, t]) => `<label class="chk ${store.data.tasks[id] ? 'ok' : ''}"><input type="checkbox" id="tk-${id}" data-task="${id}" ${store.data.tasks[id] ? 'checked' : ''}><span>${t}</span></label>`).join('')}
    </section>
    <section class="box"><h3>Mes chiffres du mois</h3><p class="muted small">À relever à la fin de chaque mois dans Instagram, TikTok, ton outil d’e-mail et ton back-office. L’objectif est celui visé au bout de 3 mois.</p>
      <div class="table-s"><table><thead><tr><th>Chiffre</th><th>Où le trouver</th><th class="num">Objectif</th><th>Mon chiffre</th></tr></thead><tbody>
        ${MK.objectives.filter((o) => ['o1', 'o2', 'o3', 'o4', 'o5', 'o6', 'o7', 'o8'].includes(o.id)).map((o) => `<tr><td>${o.kpi}</td><td class="muted small">${o.source}</td><td class="num">${o.m3}</td><td><input class="in in--s" id="kpi-${o.id}" data-kpi="${o.id}" value="${esc(store.data.kpi[o.id] || '')}" placeholder="—" aria-label="Mon chiffre : ${o.kpi}"></td></tr>`).join('')}
      </tbody></table></div>
    </section>`;
}

/* =========================================================================
   Mes comptes
   ========================================================================= */
let accNet = 'instagram';
const accTheme = () => (store.data.accTheme || 'olive');
const cplayer = (spec, cls) => `<div class="player ${cls}" data-crea="${creaKey(spec)}"></div>`;
const accDone = (k) => !!(store.data.acc || {})[k];
const counter = (txt, max) => { const n = [...String(txt)].length; return `<span class="count ${n > max ? 'over' : ''}">${n} / ${max} caractères</span>`; };

function profilePreview(net, N) {
  const A = MK.accounts;
  const avatar = cplayer({ tpl: 'avatar', fmt: 'square', data: { theme: accTheme() } }, 'circ');
  if (net !== 'instagram') {
    return `<div class="pv pv--small"><div class="pv__top">${`<div class="pv__av">${avatar}</div>`}<div><strong>${esc(N.name)}</strong><span class="muted small">${net === 'google' || net === 'facebook' ? esc(N.category) : A.handle}</span></div></div><p class="pre small">${esc(N.bio)}</p></div>`;
  }
  const posts = CAL.filter((c) => c.date >= clamp(TODAY_ISO) && isPost(c)).slice(0, 9);
  return `<div class="pv">
    <div class="pv__bar"><strong>${A.handle.slice(1)}</strong></div>
    <div class="pv__top"><div class="pv__av pv__av--big">${avatar}</div>
      <div class="pv__stats"><div><b>0</b>publications</div><div><b>0</b>followers</div><div><b>0</b>suivi(e)s</div></div></div>
    <div class="pv__bio"><strong>${esc(N.name)}</strong><span class="muted">${esc(N.category)}</span><span class="pre">${esc(N.bio)}</span><span class="pv__link">🔗 lien du site</span></div>
    <div class="pv__btns"><span>Suivre</span><span>Message</span><span>E-mail</span></div>
    <div class="pv__hl">${A.highlights.map((h) => `<div class="hl">${cplayer({ tpl: 'highlight', fmt: 'story', data: { icon: h.icon, theme: accTheme() } }, 'circ')}<span>${esc(h.name)}</span></div>`).join('')}</div>
    <div class="pv__grid">${posts.map((c, i) => `<div class="pv__cell">${cplayer(creaFor(c), 'cell')}${i < 3 ? '<span class="pin" title="Épinglée">📌</span>' : ''}</div>`).join('')}</div>
  </div>`;
}

function viewAccounts() {
  const A = MK.accounts;
  const nets = [['instagram', 'Instagram'], ['tiktok', 'TikTok'], ['pinterest', 'Pinterest'], ['facebook', 'Facebook'], ['google', 'Google'], ['type', 'Typo & couleurs']];
  const chips = `<div class="chips-s">${nets.map(([k, l]) => `<button data-accnet="${k}" aria-pressed="${accNet === k}">${l}</button>`).join('')}</div>`;
  const head = intro('Mes comptes', 'Tout ce qu’il faut pour créer et régler tes comptes : nom, photo, bio, liens, stories à la une, réglages. Choisis un réseau, puis suis les étapes.');
  if (accNet === 'type') return head + chips + viewType();
  const N = A.networks[accNet];
  const settingsDone = N.settings.filter((_, i) => accDone(`${accNet}:${i}`)).length;
  let n = 0;
  const step = (title, inner) => { n++; return `<section class="box acc-step"><div class="acc-step__h"><span class="step__n">${n}</span><h3>${title}</h3></div>${inner}</section>`; };
  const themes = ['olive', 'charbon', 'crème', 'sable'];
  let html = `${head}${chips}
    <div class="acc-top">
      <div class="acc-top__pv"><span class="label-s">Voilà à quoi ressemblera ton profil ${N.label}</span>${profilePreview(accNet, N)}</div>
      <div class="acc-top__sum box"><strong class="big-t">${N.label}</strong>
        <div class="nums"><div><b>${settingsDone}/${N.settings.length}</b><span>réglages faits</span></div><div><b>${[...N.bio].length}</b><span>caractères de bio (max ${N.bioMax})</span></div></div>
        <span class="small"><b>Catégorie à choisir :</b> ${esc(N.category)}</span>
        <span class="small muted">${accNet === 'instagram' ? 'Les 9 cases de la grille sont tes vraies prochaines publications du calendrier.' : 'Même photo de profil et même identifiant que sur Instagram.'}</span>
      </div>
    </div>`;
  html += step('Le nom et l’identifiant', `
    <div class="kvbox"><span class="lab">Nom affiché</span><div class="copybox copybox--one">${esc(N.name)}</div><div class="row-s">${cbtn(N.name, 'Copier le nom', 'mini--olive')}${counter(N.name, N.nameMax)}</div><p class="small muted">${esc(N.nameWhy)}</p></div>
    ${accNet !== 'google' && accNet !== 'facebook' ? `<div class="kvbox"><span class="lab">Identifiant</span><div class="copybox copybox--one">${A.handle}</div><div class="row-s">${cbtn(A.handle.slice(1), 'Copier l’identifiant', 'mini--olive')}<span class="small muted">Déjà pris ? Essaie : ${A.alternatives.join(', ')}</span></div><p class="small muted">${esc(A.handleWhy)}</p></div>` : ''}`);
  html += step('La photo de profil', `
    <div class="avatar-row"><div class="avatar-big">${cplayer({ tpl: 'avatar', fmt: 'square', data: { theme: accTheme() } }, 'circ')}</div>
      <div class="stack-s"><span class="lab">Couleur</span><div class="seg-s">${themes.map((t) => `<button data-acctheme="${t}" aria-pressed="${accTheme() === t}">${cap1(t)}</button>`).join('')}</div>
      <button class="big big--olive" data-avdl>${SVG.dl} Télécharger la photo (1080 × 1080)</button>
      <span class="small muted">Le logo reste lisible même dans le petit rond. Mets la même photo sur tous les réseaux.</span></div></div>`);
  html += step(accNet === 'google' ? 'La description' : 'La bio', `<div class="copybox">${esc(N.bio)}</div><div class="row-s">${cbtn(N.bio, 'Copier la bio', 'mini--olive')}${counter(N.bio, N.bioMax)}</div>`);
  if (accNet === 'instagram' || accNet === 'tiktok') {
    html += step('Le lien en bio', `<p class="small muted">Une seule adresse est cliquable : utilise une page de liens gratuite (Linktree, Beacons…) avec ces boutons, dans cet ordre.</p>
      <div class="links">${A.links.map(([e, l, u]) => `<div class="links__i"><span>${e}</span><strong>${esc(l)}</strong><code class="tiny muted">${esc(u)}</code>${cbtn(`${e} ${l}`, 'Copier')}</div>`).join('')}</div>`);
  }
  if (accNet === 'instagram') {
    html += step('Les stories à la une', `<p class="small muted">Les ronds sous la bio. Télécharge les couvertures, puis crée chaque « à la une » dans cet ordre. Couverture : ajouter à la une → Modifier la couverture.</p>
      <div class="hl-list">${A.highlights.map((h, i) => `<div class="hl-item"><div class="hl">${cplayer({ tpl: 'highlight', fmt: 'story', data: { icon: h.icon, theme: accTheme() } }, 'circ')}</div><div class="stack-s" style="gap:4px"><strong>${i + 1}. ${esc(h.name)}</strong><span class="small muted">${esc(h.inside)}</span></div><button class="mini" data-hldl="${i}">${SVG.dl} Couverture</button></div>`).join('')}</div>
      <button class="big" data-hlall>${SVG.dl} Télécharger les 7 couvertures</button>`);
    html += step('Les 3 publications épinglées', `<p class="small muted">Elles restent en haut du profil : ce sont les premières choses que voit un nouveau visiteur. (Publication → ⋯ → Épingler.)</p><ol class="pinned">${A.pinned.map(([t, d]) => `<li><strong>${t}</strong><span class="small muted">${d}</span></li>`).join('')}</ol>`);
    html += step('Les réponses rapides aux messages', `<p class="small muted">À mettre dans « Questions fréquentes » : elles s’affichent quand quelqu’un ouvre une conversation.</p>${A.faq.map(([q, r]) => `<div class="kvbox"><strong>${esc(q)}</strong><div class="copybox">${esc(r)}</div>${cbtn(r, 'Copier la réponse')}</div>`).join('')}`);
    html += step('Une belle grille', `<ul class="facts facts--plain">${A.grid.map((g) => `<li>${g}</li>`).join('')}</ul>`);
  }
  html += step('Les réglages à faire', `${N.settings.map((t, i) => `<label class="chk ${accDone(`${accNet}:${i}`) ? 'ok' : ''}"><input type="checkbox" id="acc-${accNet}-${i}" data-acc="${accNet}:${i}" ${accDone(`${accNet}:${i}`) ? 'checked' : ''}><span>${esc(t)}</span></label>`).join('')}`);
  return html;
}

function viewType() {
  const T2 = MK.accounts.type;
  const pal = [['Crème', '#F4EEE2', 'Fonds'], ['Olive', '#5C6B3C', 'Couleur principale'], ['Sable', '#E4D6BA', 'Accents'], ['Taupe', '#8A7B6A', 'Textes secondaires'], ['Charbon', '#2A2925', 'Titres, fonds sombres']];
  return `<div class="grid2">${T2.fonts.map((f) => `<section class="box"><span class="label-s">${f.role}</span><span class="specimen-s" style="font-family:${f.serif ? 'Fraunces, Georgia, serif' : 'Inter, Arial, sans-serif'};font-weight:${f.serif ? 500 : 800}">${f.sample}</span><strong>${f.name}</strong><span class="small muted">${f.where}</span><span class="small">${f.sizes}</span>${cbtn(f.name, 'Copier le nom')}</section>`).join('')}</div>
    <section class="box"><h3>Dans les applis</h3><div class="table-s"><table><tbody>${T2.apps.map(([a, b]) => `<tr><td><strong>${a}</strong></td><td>${b}</td></tr>`).join('')}</tbody></table></div></section>
    <section class="box"><h3>Les couleurs</h3><p class="small muted">Touche une couleur pour copier son code, à coller dans Canva ou CapCut.</p><div class="pal">${pal.map(([n2, h, u]) => `<button class="pal__c" data-c="${reg(h)}" title="Copier ${h}"><span style="background:${h}"></span>${n2}<small>${h} · ${u}</small></button>`).join('')}</div></section>
    <section class="box"><h3>Le logo</h3><div class="avatar-row">${['olive', 'charbon', 'crème', 'sable'].map((t) => `<div class="logo-v">${cplayer({ tpl: 'avatar', fmt: 'square', data: { theme: t } }, 'sq')}<span class="small">${cap1(t)}</span></div>`).join('')}</div><p class="small muted">« CLUB » toujours en italique. Ne pas déformer, ne pas changer les couleurs.</p></section>`;
}

/* ---------- Rendu ---------- */
const VIEWS = { aujourdhui: viewToday, calendrier: viewCalendar, campagnes: viewCampaigns, budget: viewBudget, ia: viewIA, textes: viewTexts, creas: viewCreas, comptes: viewAccounts, strategie: viewStrategy, suivi: viewSuivi };
function render(keep) {
  const t = tabNow();
  COPY = [];
  CREAS = [];
  $('#tabs').innerHTML = TABS.map(([k, l]) => `<a href="#${k}" ${k === t ? 'aria-current="page"' : ''}>${l}</a>`).join('');
  const y = window.scrollY;
  $('#app').innerHTML = VIEWS[t]();
  document.querySelectorAll('#app [data-crea]').forEach((el) => MO.mount(el, CREAS[Number(el.dataset.crea)]));
  editorEl = document.querySelector('#app .player[data-big]');
  if (keep) window.scrollTo(0, y);
}

/* ---------- Actions ---------- */
function flash(btn, txt) {
  const old = btn.innerHTML;
  btn.classList.add('copied');
  btn.textContent = txt;
  setTimeout(() => { btn.classList.remove('copied'); btn.innerHTML = old; }, 1600);
}
document.addEventListener('click', async (e) => {
  const b = e.target.closest('button');
  if (!b) return;
  if (b.dataset.day) {
    day = b.dataset.day === 'today' ? clamp(TODAY_ISO) : b.dataset.day;
    if (b.dataset.go && tabNow() !== b.dataset.go) location.hash = b.dataset.go; else render(true);
    if (b.dataset.go) window.scrollTo(0, 0);
    return;
  }
  if (b.dataset.week) { day = clamp(D.add(D.monday(day), Number(b.dataset.week) * 7)); render(true); return; }
  if (b.dataset.month) { const [y, m] = calMonth.split('-').map(Number); const d = new Date(y, m - 1 + Number(b.dataset.month), 1); calMonth = D.iso(d).slice(0, 7); render(true); return; }
  if (b.dataset.ttab) { textTab = b.dataset.ttab; render(true); return; }
  if (b.dataset.lang) { lang = b.dataset.lang; render(true); return; }
  if (b.dataset.c !== undefined) { const ok = await copyText(COPY[Number(b.dataset.c)]); flash(b, ok ? '✓ Copié !' : 'Sélectionne et copie'); return; }
  if (b.dataset.copy) {
    const [id, what] = b.dataset.copy.split('::');
    const it = content(id);
    const ok = await copyText(what === 'subject' ? subjectOf(it) : textToCopy(it));
    flash(b, ok ? '✓ Copié ! Tu peux le coller' : 'Sélectionne le texte et copie-le');
    return;
  }
  if (b.dataset.vdl !== undefined || b.dataset.edVideo !== undefined) {
    const spec = b.dataset.vdl !== undefined ? CREAS[Number(b.dataset.vdl)] : creaSel;
    const old = b.innerHTML;
    b.disabled = true;
    const r = await MO.exportVideo(spec, `prepclub-${spec.tpl}-${spec.fmt || 'story'}`, (k) => { b.textContent = `Enregistrement… ${Math.round(k * 100)} %`; });
    b.disabled = false; b.innerHTML = old;
    if (!r.ok) flash(b, 'Ton navigateur ne sait pas enregistrer de vidéo : essaie Chrome');
    else flash(b, r.ext === 'mp4' ? '✓ Vidéo MP4 téléchargée' : '✓ Vidéo téléchargée (.webm)');
    return;
  }
  if (b.dataset.idl2 !== undefined || b.dataset.edImage !== undefined) {
    const spec = b.dataset.idl2 !== undefined ? CREAS[Number(b.dataset.idl2)] : creaSel;
    flash(b, 'Préparation…');
    const ok = await MO.exportImage(spec, `prepclub-${spec.tpl}-${spec.fmt || 'post'}`);
    if (!ok) flash(b, 'Fais une capture d’écran de l’image');
    return;
  }
  if (b.dataset.dlframe) {
    const [sid, i] = b.dataset.dlframe.split('::');
    const f = MK.stories.find((x) => x.id === sid).frames[i];
    await MO.exportImage({ tpl: 'storyframe', fmt: 'story', data: { text: f.text }, photos: [f.img] }, `prepclub-story-${Number(i) + 1}`);
    return;
  }
  if (b.dataset.editCrea !== undefined) {
    const spec = CREAS[Number(b.dataset.editCrea)];
    creaSel = { tpl: spec.tpl, fmt: spec.fmt || MO.byId(spec.tpl).fmt || 'story', data: Object.assign({}, spec.data), photos: (spec.photos || []).slice() };
    location.hash = 'creas';
    window.scrollTo(0, 0);
    return;
  }
  if (b.dataset.pick) { const t = MO.byId(b.dataset.pick); creaSel = { tpl: t.id, fmt: b.dataset.fmt, data: {}, photos: [] }; render(); window.scrollTo(0, 0); return; }
  if (b.dataset.backCrea !== undefined) { creaSel = null; render(); return; }
  if (b.dataset.accnet) { accNet = b.dataset.accnet; render(true); return; }
  if (b.dataset.acctheme) { store.data.accTheme = b.dataset.acctheme; store.save(); render(true); return; }
  if (b.dataset.avdl !== undefined) { flash(b, 'Préparation…'); await MO.exportImage({ tpl: 'avatar', fmt: 'square', data: { theme: accTheme() } }, `prepclub-photo-profil-${accTheme()}`); return; }
  if (b.dataset.hldl !== undefined) { const h = MK.accounts.highlights[Number(b.dataset.hldl)]; await MO.exportImage({ tpl: 'highlight', fmt: 'story', data: { icon: h.icon, theme: accTheme() } }, `prepclub-a-la-une-${Number(b.dataset.hldl) + 1}-${h.name.toLowerCase()}`); return; }
  if (b.dataset.hlall !== undefined) {
    const old = b.innerHTML;
    for (let i = 0; i < MK.accounts.highlights.length; i++) {
      const h = MK.accounts.highlights[i];
      b.textContent = `Téléchargement ${i + 1}/${MK.accounts.highlights.length}…`;
      await MO.exportImage({ tpl: 'highlight', fmt: 'story', data: { icon: h.icon, theme: accTheme() } }, `prepclub-a-la-une-${i + 1}-${h.name.toLowerCase()}`);
      await new Promise((r) => setTimeout(r, 400));
    }
    b.innerHTML = old; flash(b, '✓ 7 couvertures téléchargées');
    return;
  }
  if (b.dataset.scen) { store.data.scenario = b.dataset.scen; store.save(); render(true); return; }
  if (b.dataset.cfilter) { creaFilter = b.dataset.cfilter; render(true); return; }
  if (b.dataset.cfmt) { creaSel.fmt = b.dataset.cfmt; render(true); return; }
  if (b.dataset.done) {
    const id = b.dataset.done;
    if (isDone(id)) delete store.data.done[id]; else store.data.done[id] = true;
    store.save();
    render(true);
  }
});
document.addEventListener('input', (e) => {
  const el = e.target;
  if (el.dataset.cf && creaSel) { creaSel.data[el.dataset.cf] = el.value; if (editorEl) MO.update(editorEl, { [el.dataset.cf]: el.value }); }
  if (el.dataset.sim !== undefined) { const v = Number(el.value); store.data.simBudget = v; store.save(); $('#sim-v').textContent = eur(v); $('#sim-out').innerHTML = simHTML(v); }
  if (el.dataset.kpi) { store.data.kpi[el.dataset.kpi] = el.value; store.save(); }
});
document.addEventListener('change', (e) => {
  const el = e.target;
  if (el.dataset.task) { store.data.tasks[el.dataset.task] = el.checked; store.save(); render(true); }
  if (el.dataset.acc) { store.data.acc = store.data.acc || {}; store.data.acc[el.dataset.acc] = el.checked; store.save(); render(true); }
  if (el.dataset.step) { store.data.steps = store.data.steps || {}; store.data.steps[el.dataset.step] = el.checked; store.save(); render(true); }
  if (el.dataset.spent) { store.data.spent = store.data.spent || {}; store.data.spent[el.dataset.spent] = el.value; store.save(); render(true); }
  if (el.dataset.hyp) { store.data.hyp = store.data.hyp || {}; store.data.hyp[el.dataset.hyp] = Math.max(0, Number(el.value) || 0); store.save(); render(true); }
  if (el.dataset.iaart !== undefined) { iaArticle = Number(el.value); render(true); }
  if (el.dataset.iacamp !== undefined) { iaCamp = el.value; render(true); }
  if (el.dataset.cphoto !== undefined && creaSel) {
    const v = el.value;
    creaSel.photos[Number(el.dataset.cphoto)] = v.startsWith('up:') ? UPLOADS[Number(v.slice(3))].src : v;
    if (editorEl) MO.update(editorEl, null, creaSel.photos);
  }
  if (el.dataset.cupload !== undefined && creaSel && el.files && el.files[0]) {
    const file = el.files[0];
    const url = URL.createObjectURL(file);
    const i = Number(el.dataset.cupload);
    const done = (src) => { UPLOADS.push({ name: file.name, src }); creaSel.photos[i] = src; render(true); };
    if (file.type.startsWith('video/')) {
      const v = document.createElement('video');
      v.src = url; v.muted = true; v.loop = true; v.playsInline = true; v.preload = 'auto';
      v.addEventListener('loadeddata', () => done({ el: v }), { once: true });
    } else done(url);
  }
});
window.addEventListener('hashchange', () => { if (tabNow() !== 'creas') creaSel = null; render(); });

rebuild();
render();
