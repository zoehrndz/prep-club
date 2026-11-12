/* =========================================================
   PREP CLUB Admin — Données d'activité de démonstration
   Clients, commandes, abonnements et avis FICTIFS, générés de façon
   déterministe (mêmes valeurs à chaque chargement le même jour).
   Les commandes réelles passées sur le site (localStorage) s'y ajoutent.
   Une version commercialisée lirait ces données depuis un serveur.
   ========================================================= */
'use strict';

function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const DEMO_DAYS = 400;
const FIRST = ['Camille', 'Léa', 'Manon', 'Chloé', 'Inès', 'Sarah', 'Julie', 'Emma', 'Clara', 'Lucie', 'Thomas', 'Hugo', 'Lucas', 'Louis', 'Nathan', 'Théo', 'Maxime', 'Antoine', 'Paul', 'Arthur', 'Yasmine', 'Nora', 'Karim', 'Mehdi', 'Sofia', 'Jade', 'Romain', 'Julien', 'Marion', 'Pauline', 'Alexandre', 'Élise', 'Mathilde', 'Baptiste', 'Adrien', 'Océane', 'Victor', 'Margaux', 'Samuel', 'Anaïs'];
const LAST = ['Martin', 'Bernard', 'Dubois', 'Thomas', 'Robert', 'Richard', 'Petit', 'Durand', 'Leroy', 'Moreau', 'Simon', 'Laurent', 'Lefebvre', 'Michel', 'Garcia', 'David', 'Bertrand', 'Roux', 'Vincent', 'Fournier', 'Morel', 'Girard', 'André', 'Mercier', 'Dupont', 'Lambert', 'Bonnet', 'François', 'Martinez', 'Legrand', 'Chevalier', 'Benali', 'Rousseau', 'Blanc', 'Guerin', 'Muller', 'Faure', 'Perrin', 'Morin', 'Fontaine'];
const STREETS = ['rue Paul Bert', 'cours Lafayette', 'rue de la République', 'avenue Jean Jaurès', 'rue Garibaldi', 'quai Saint-Antoine', 'rue Duguesclin', 'boulevard des Belges', 'rue Victor Hugo', 'rue Marietton', 'cours Gambetta', 'rue Servient'];
const REVIEW_TEXTS = [
  [5, 'Parfait pour mes déjeuners au bureau, portions généreuses.'], [5, 'Le meilleur plat de la carte, je recommande.'], [4, 'Très bon, un peu trop salé à mon goût.'],
  [5, 'Livraison à l’heure et plats encore très frais.'], [4, 'Bonne recette, j’aurais aimé un peu plus de sauce.'], [3, 'Correct mais la portion m’a semblé petite.'],
  [5, 'On sent la qualité des produits locaux.'], [2, 'Reçu avec l’opercule abîmé, le service client a été réactif.'], [4, 'Pratique et bon, je reprendrai.'], [5, 'Toute la famille a adoré.'],
];
const NEEDS = ['Allergie déclarée : vérifier la préparation', 'Adresse incomplète : contacter le client', 'Créneau complet : reprogrammer la livraison', 'Demande de modification après validation'];

let DEMO = null;

function buildDemo() {
  const r = rng(26);
  const now = new Date();
  const today = new Date(now); today.setHours(0, 0, 0, 0);
  const pick = (arr) => arr[Math.floor(r() * arr.length)];
  const dayIso = (n) => iso(addDays(today, n));
  const tierIds = MEMBERSHIPS.map((m) => m.id);

  /* ---- Clients ---- */
  const customers = [];
  for (let i = 0; i < 190; i++) {
    const first = pick(FIRST);
    const last = pick(LAST);
    // Inscriptions plus nombreuses récemment (croissance)
    const joined = -Math.floor(DEMO_DAYS * Math.pow(r(), 0.8));
    const c = {
      id: `C${String(1001 + i)}`, first, last, name: `${first} ${last}`,
      email: `${first}.${last}${i}`.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9.]/g, '') + '@exemple.fr',
      phone: `06 ${String(10 + Math.floor(r() * 89))} ${String(10 + Math.floor(r() * 89))} ${String(10 + Math.floor(r() * 89))} ${String(10 + Math.floor(r() * 89))}`,
      address: `${1 + Math.floor(r() * 120)} ${pick(STREETS)}, ${pick(DELIVERY.zones)} Lyon`,
      joined: dayIso(joined), joinedN: joined,
      freq: 0.04 + Math.pow(r(), 2) * 0.32, // probabilité de commander un jour donné
      allergies: r() < 0.18 ? [pick(['Gluten', 'Lait', 'Fruits à coque', 'Œufs', 'Arachides'])] : [],
      membership: null, source: 'demo',
    };
    if (r() < 0.26) {
      const startN = Math.min(0, joined + Math.floor(r() * 60));
      const st = r();
      c.membership = { tier: tierIds[Math.floor(Math.pow(r(), 1.3) * tierIds.length)], since: dayIso(startN), sinceN: startN, status: st < 0.82 ? 'active' : st < 0.9 ? 'paused' : 'cancelled', endN: st >= 0.9 ? Math.min(0, startN + 30 + Math.floor(r() * 120)) : null };
    }
    customers.push(c);
  }

  /* ---- Commandes ---- */
  const orders = [];
  const prods = PRODUCTS;
  const weekday = [1.25, 0.95, 0.9, 0.85, 0.8, 0.9, 1.35]; // dim → sam (getDay)
  for (let n = -DEMO_DAYS; n <= 0; n++) {
    const d = addDays(today, n);
    const growth = 0.55 + 0.45 * ((n + DEMO_DAYS) / DEMO_DAYS);
    const eligible = customers.filter((c) => c.joinedN <= n);
    eligible.forEach((c) => {
      if (r() > c.freq * growth * weekday[d.getDay()] * 0.62) return;
      let hour = 7 + Math.floor(r() * 15);
      if (n === 0 && hour > now.getHours()) { if (now.getHours() < 7) return; hour = 7 + Math.floor(r() * (now.getHours() - 6)); }
      const date = new Date(d); date.setHours(hour, Math.floor(r() * 60));
      const k = r();
      let kind; let lines; let sub;
      if (k < 0.5) {
        kind = 'carte';
        lines = [];
        const count = 2 + Math.floor(r() * 5);
        for (let j = 0; j < count; j++) {
          const p = prods[Math.floor(Math.pow(r(), 1.5) * prods.length)];
          const line = lines.find((l) => l.pid === p.id);
          if (line) { line.qty++; line.amount = round2(line.amount + p.price); } else lines.push({ pid: p.id, name: p.name, cat: p.cat, qty: 1, unit: p.price, amount: p.price });
        }
        sub = round2(lines.reduce((a, l) => a + l.amount, 0));
      } else if (k < 0.78) {
        kind = 'formule';
        const f = FORMULAS[Math.floor(Math.pow(r(), 1.4) * FORMULAS.length)];
        const items = f.defaults.map((id) => P(id)).filter(Boolean);
        const gross = items.reduce((a, p) => a + p.price, 0);
        sub = round2(gross * (1 - f.discount));
        lines = mergeLines(items, sub / gross, f.name);
      } else if (k < 0.92) {
        kind = 'box';
        const count = 5 + Math.floor(r() * 9);
        const items = Array.from({ length: count }, () => prods[Math.floor(r() * prods.length)]);
        const gross = items.reduce((a, p) => a + p.price, 0);
        const tier = [...BOX_RULES.tiers].reverse().find((t) => count >= t.min);
        sub = round2(gross * (1 - (tier ? tier.pct : 0)));
        lines = mergeLines(items, sub / gross, 'Box composée');
      } else {
        kind = 'decouverte';
        const b = pick(DISCOVERY);
        const items = b.items.map((id) => P(id)).filter(Boolean);
        sub = b.price;
        lines = mergeLines(items, sub / items.reduce((a, p) => a + p.price, 0), b.name);
      }
      const m = c.membership;
      const memberActive = m && m.sinceN <= n && (m.status !== 'cancelled' || n <= m.endN);
      const tier = memberActive ? MEMBERSHIPS.find((t) => t.id === m.tier) : null;
      const discount = tier ? round2(sub * tier.discount) : 0;
      const net = round2(sub - discount);
      const mode = r() < 0.64 ? 'home' : 'pickup';
      const freeDelivery = net >= DELIVERY.freeFrom || (tier && tier.freeDelivery && net >= DELIVERY.premiumFreeFrom);
      const delivery = mode === 'home' && !freeDelivery ? DELIVERY.homeFee : 0;
      const slotN = n + (hour >= 18 ? 2 : 1);
      let status = slotN < 0 ? 3 : slotN === 0 ? (r() < 0.55 ? 2 : 1) : r() < 0.7 ? 0 : 1;
      let payment = 'paid';
      if (n >= -2 && slotN >= 0 && r() < 0.05) { payment = 'failed'; status = 0; }
      if (slotN < 0 && r() < 0.015) status = -1;
      const needs = slotN >= 0 && status >= 0 && status < 3 && r() < 0.03 ? pick(NEEDS) : (c.allergies.length && slotN >= 0 && status < 2 && r() < 0.12 ? `Allergie déclarée (${c.allergies[0]}) : vérifier la préparation` : null);
      orders.push({
        id: '', date: date.toISOString(), day: iso(date), customerId: c.id, customer: c.name, email: c.email, phone: c.phone,
        kind, lines, sub, discount, delivery, total: round2(net + delivery), tier: tier ? tier.id : null,
        mode, slot: { day: dayIso(slotN), time: pick(mode === 'home' ? DELIVERY.homeSlots : DELIVERY.pickupSlots) },
        where: mode === 'home' ? c.address : pick(DELIVERY.pickupPoints).name,
        status, payment, needs, source: 'demo',
      });
    });
  }

  orders.sort((a, b) => a.date.localeCompare(b.date));
  orders.forEach((o, i) => { o.id = `PC-${21001 + i}`; });

  /* ---- Avis ---- */
  const reviews = [];
  const recent = orders.filter((o) => o.status === 3 && o.date >= addDays(today, -21).toISOString());
  for (let i = 0; i < 26 && recent.length; i++) {
    const o = recent[Math.floor(r() * recent.length)];
    const [rating, text] = pick(REVIEW_TEXTS);
    const l = pick(o.lines);
    const dt = new Date(o.slot.day + 'T20:00:00'); dt.setHours(19 + Math.floor(r() * 4), Math.floor(r() * 60));
    if (dt > now) continue;
    reviews.push({ id: `R${i}`, pid: l.pid, product: l.name, customer: o.customer, customerId: o.customerId, rating, text, date: dt.toISOString() });
  }

  DEMO = { customers, orders, reviews };
  mergeSiteData();
  return DEMO;
}

function mergeLines(items, ratio, label) {
  const out = [];
  items.forEach((p) => {
    const l = out.find((x) => x.pid === p.id);
    const amt = round2(p.price * ratio);
    if (l) { l.qty++; l.amount = round2(l.amount + amt); } else out.push({ pid: p.id, name: p.name, cat: p.cat, qty: 1, unit: p.price, amount: amt, box: label });
  });
  return out;
}

/* ---- Données réelles du site (ce navigateur) ---- */
function readSite() {
  try { return JSON.parse(localStorage.getItem(SITE_KEY)) || null; } catch (e) { return null; }
}
function mergeSiteData() {
  const site = readSite();
  if (!site || !site.orders || !site.orders.length && !site.user) return;
  const u = site.user;
  const cust = {
    id: 'C-SITE', first: u ? u.first : 'Client', last: u ? u.last || '' : 'invité', name: u ? `${u.first} ${u.last || ''}`.trim() : 'Client invité (site)',
    email: u ? u.email : (site.orders[0] && site.orders[0].email) || '', phone: u && u.phone ? u.phone : '',
    address: (site.addresses && site.addresses[0]) ? `${site.addresses[0].street}, ${site.addresses[0].postcode} ${site.addresses[0].city}` : '',
    joined: site.orders.length ? site.orders[site.orders.length - 1].date.slice(0, 10) : todayIso(), allergies: (site.prefs && site.prefs.allergyConsent && site.prefs.allergies) || [],
    membership: site.membership ? { tier: site.membership.tier, since: (site.membership.since || todayIso()).slice(0, 10), status: site.membership.status || 'active' } : null,
    source: 'site',
  };
  cust.joinedN = Math.round((fromIso(cust.joined) - fromIso(todayIso())) / 864e5);
  DEMO.customers.push(cust);
  site.orders.forEach((o) => {
    const lines = [];
    o.lines.forEach((l) => {
      if (l.type === 'box' && l.items) {
        const items = l.items.flatMap((it) => Array(it.qty).fill(P(it.pid))).filter(Boolean);
        const gross = items.reduce((a, p) => a + p.price, 0) || 1;
        mergeLines(items, (l.unit * l.qty) / gross, l.name).forEach((x) => lines.push(x));
      } else {
        const p = P(l.pid);
        lines.push({ pid: l.pid, name: l.name, cat: p ? p.cat : 'lunch', qty: l.qty, unit: l.unit, amount: round2(l.unit * l.qty) });
      }
    });
    const t = o.totals || {};
    DEMO.orders.push({
      id: o.id, date: o.date, day: o.date.slice(0, 10), customerId: cust.id, customer: cust.name, email: o.email || cust.email, phone: cust.phone,
      kind: o.lines.some((l) => l.type === 'box') ? 'box' : 'carte', lines, sub: t.sub || 0, discount: round2((t.member || 0) + (t.promo || 0) + (t.reward || 0)),
      delivery: t.delivery || 0, total: t.total || 0, tier: site.membership && site.membership.status === 'active' ? site.membership.tier : null,
      mode: o.mode, slot: o.slot, where: o.where, status: o.status, payment: 'paid', needs: null, source: 'site',
    });
  });
  DEMO.orders.sort((a, b) => a.date.localeCompare(b.date));
  Object.entries(site.reviews || {}).forEach(([pid, list]) => list.forEach((rv, i) => {
    const p = P(pid);
    DEMO.reviews.push({ id: `S${pid}${i}`, pid, product: p ? p.name : pid, customer: rv.name || cust.name, customerId: cust.id, rating: rv.rating, text: rv.text || '', date: rv.date.length === 10 ? `${rv.date}T12:00:00` : rv.date });
  }));
}

/* Statut effectif (avec les changements faits dans le back-office). */
function orderStatus(o) {
  const ov = ADM.orderStatus[o.id];
  if (ov && ov.day === o.day) return ov;
  return { status: o.status, payment: o.payment, needs: o.needs };
}
function setOrderStatus(o, patch) {
  const cur = orderStatus(o);
  ADM.orderStatus[o.id] = { ...cur, ...patch, day: o.day };
  if (o.source === 'site') {
    const site = readSite();
    const so = site && site.orders.find((x) => x.id === o.id);
    if (so && patch.status !== undefined && patch.status >= 0) {
      so.status = patch.status;
      try { localStorage.setItem(SITE_KEY, JSON.stringify(site)); } catch (e) { /* stockage indisponible */ }
    }
  }
}
