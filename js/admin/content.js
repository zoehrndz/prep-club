/* =========================================================
   PREP CLUB Admin — Avis clients, Formules & box,
   Contenus du site, Producteurs
   ========================================================= */
'use strict';

const fld = (label, html, hint = '') => `<div class="field"><label>${label}</label>${html}${hint ? `<span class="hint">${hint}</span>` : ''}</div>`;
const introText = (text) => `<p class="intro">${text}</p>`;
const firstName = (name) => String(name || '').split(/\s+/)[0];

/* Photo : aperçu + import depuis l'ordinateur ou adresse web */
function photoPicker(id, img) {
  return `<div class="photo-pick" id="${id}">
    <div class="photo-pick__img">${img ? `<img src="${imgUrl(img, 600)}" alt="">` : '<span>Aucune photo</span>'}</div>
    <div class="photo-pick__actions">
      <label class="btn btn--ghost btn--sm file-btn">Importer une photo<input type="file" accept="image/*" hidden data-photo-file></label>
      <input class="input" data-photo-url placeholder="ou coller l’adresse d’une image (https://…)" aria-label="Adresse d’une image">
      <span class="hint">Les photos importées sont réduites automatiquement.</span>
    </div>
  </div>`;
}
function bindPhotoPicker(id, onChange) {
  const root = $(`#${id}`);
  const show = (src) => { $('.photo-pick__img', root).innerHTML = `<img src="${imgUrl(src, 600)}" alt="">`; onChange(src); };
  $('[data-photo-file]', root).addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try { show(await readImage(file)); } catch (err) { toast('Image illisible'); }
  });
  $('[data-photo-url]', root).addEventListener('change', (e) => {
    const v = e.target.value.trim();
    if (/^https?:\/\//.test(v)) show(v);
    else if (v) toast('Collez une adresse commençant par https://');
  });
}

/* Pastille « modifications non enregistrées » + alerte si on quitte la page */
let DIRTY = false;
function dirtyGuard(form) {
  const pill = document.createElement('span');
  pill.className = 'dirty-pill';
  pill.textContent = 'Modifications non enregistrées';
  pill.hidden = true;
  ($('.save-bar', form) || form).prepend(pill);
  const mark = () => { pill.hidden = false; DIRTY = true; };
  form.addEventListener('input', mark);
  form.addEventListener('change', mark);
  return { mark, clear: () => { pill.hidden = true; DIRTY = false; } };
}
window.addEventListener('beforeunload', (e) => { if (DIRTY) { e.preventDefault(); e.returnValue = ''; } });
window.addEventListener('hashchange', () => { DIRTY = false; });

/* ================= AVIS CLIENTS ================= */
function reviewTarget(pid) {
  if (pid.startsWith('produit:')) {
    const p = AP(pid.slice(8));
    return { name: p ? p.name : pid.slice(8), admin: p ? `#/produits/${p.id}` : '', site: `index.html#/produit/${pid.slice(8)}` };
  }
  const box = ADM.formulas.find((x) => x.id === pid) || ADM.discovery.find((x) => x.id === pid);
  if (box) return { name: box.name, admin: `#/formules/${box.id}`, site: `index.html#/box/${box.id}` };
  const p = AP(pid);
  return { name: p ? p.name : pid, admin: p ? `#/produits/${p.id}` : '', site: p ? `index.html#/produit/${p.id}` : '' };
}
const REPLY_TEMPLATES = [
  ['Remercier', (r) => `Merci beaucoup ${firstName(r.customer)} pour votre retour ! Toute l’équipe est ravie que « ${reviewTarget(r.pid).name} » vous ait plu. À très vite chez PREP CLUB.`],
  ['S’excuser', (r) => `Bonjour ${firstName(r.customer)}, merci pour votre retour et désolés que votre expérience n’ait pas été à la hauteur. Nous transmettons vos remarques à la cuisine. Écrivez-nous via la page Contact : nous voulons arranger les choses.`],
  ['Suggestion', (r) => `Merci ${firstName(r.customer)} pour cette suggestion ! Nous la notons pour nos prochaines recettes.`],
];
const RV_TABS = [['all', 'Tous'], ['todo', 'À traiter'], ['noreply', 'Sans réponse'], ['hidden', 'Masqués'], ['site', 'Reçus sur le site']];
const rvState = (r) => ADM.reviews[r.id] || {};
const rvMatch = {
  all: () => true,
  todo: reviewNeedsAction,
  noreply: (r) => !rvState(r).reply && !rvState(r).hidden,
  hidden: (r) => !!rvState(r).hidden,
  site: (r) => r.id.startsWith('S'),
};

AVIEWS.avis = {
  title: 'Avis clients',
  render(filter = 'all') {
    if (!rvMatch[filter]) filter = 'all';
    const all = DEMO.reviews;
    const visible = all.filter((r) => !rvState(r).hidden);
    const avg = visible.length ? visible.reduce((a, r) => a + r.rating, 0) / visible.length : 0;
    const dist = [5, 4, 3, 2, 1].map((n) => visible.filter((r) => r.rating === n).length);
    const replied = all.filter((r) => rvState(r).reply).length;
    const todo = all.filter(reviewNeedsAction).length;
    const site = all.filter(rvMatch.site).length;
    return `${introText('<strong>Avis fictifs</strong> (projet étudiant, données de démonstration), complétés par ceux déposés sur le site depuis ce navigateur. Lisez les avis laissés par vos clients, répondez en un clic et masquez ceux qui ne respectent pas les règles. Vos réponses s’affichent sous l’avis, sur la page du plat.')}
    <div class="grid2 grid2--avis">
      <section class="panel"><div class="rating-hero">
        <div><div class="rating-hero__big">${visible.length ? avg.toFixed(1).replace('.', ',') : '–'}</div>${stars(Math.round(avg))}<div class="small muted" style="margin-top:4px">${visible.length} avis affichés</div></div>
        <div class="rdist">${dist.map((c, i) => `<div><span>${5 - i} ★</span><div class="hbar__track"><div class="hbar__fill" style="--w:${visible.length ? (c / visible.length) * 100 : 0}%"></div></div><span>${c}</span></div>`).join('')}</div>
      </div></section>
      <div class="kpis kpis--3">
        ${kpi({ label: 'À traiter', value: todo, raw: todo, ic: 'alert', tone: todo ? 'tomato' : '', sub: '3★ ou moins, sans réponse', href: '#/avis/todo' })}
        ${kpi({ label: 'Taux de réponse', value: pct(all.length ? replied / all.length : 0), ic: 'chat', sub: `${replied} réponse${replied > 1 ? 's' : ''} publiée${replied > 1 ? 's' : ''}` })}
        ${kpi({ label: 'Reçus sur le site', value: site, raw: site, ic: 'star', sub: 'déposés par vos clients', href: '#/avis/site' })}
      </div>
    </div>
    <div class="toolbar">
      <div class="tabs" style="margin:0">${RV_TABS.map(([k, l]) => `<a href="#/avis${k === 'all' ? '' : `/${k}`}" class="pill ${k === filter ? 'active' : ''}">${l}<span class="pill__n">${all.filter(rvMatch[k]).length}</span></a>`).join('')}</div>
      <div class="toolbar__end">
        <input class="input" id="rvSearch" placeholder="Rechercher un client, un plat, un mot…" aria-label="Rechercher dans les avis">
        <select class="input" id="rvSort" aria-label="Trier"><option value="recent">Plus récents</option><option value="low">Notes les plus basses</option><option value="high">Notes les plus hautes</option></select>
      </div>
    </div>
    <div id="rvList" class="rv-list"></div>`;
  },
  mount(filter = 'all') {
    if (!rvMatch[filter]) filter = 'all';
    const draw = () => {
      const q = fold($('#rvSearch').value.trim());
      const sort = $('#rvSort').value;
      const list = DEMO.reviews
        .filter(rvMatch[filter])
        .filter((r) => !q || fold(`${r.customer} ${r.text} ${reviewTarget(r.pid).name}`).includes(q))
        .sort((a, b) => (sort === 'low' ? a.rating - b.rating : sort === 'high' ? b.rating - a.rating : 0) || b.date.localeCompare(a.date));
      $('#rvList').innerHTML = list.length ? list.map((r) => {
        const st = rvState(r);
        const t = reviewTarget(r.pid);
        return `<article class="panel review ${st.hidden ? 'is-hidden' : ''}" id="rv-${r.id}">
          <span class="avatar ${r.rating <= 3 ? 'avatar--tomato' : 'avatar--olive'}">${initials(r.customer)}</span>
          <div class="review__body">
            <div class="review__meta">${stars(r.rating)} <strong style="color:var(--ink)">${esc(r.customer)}</strong> · ${t.admin ? `<a href="${t.admin}" class="link">${esc(t.name)}</a>` : esc(t.name)} · ${ago(r.date)}
              ${r.id.startsWith('S') ? '<span class="st st--ship">Site</span>' : ''}${st.hidden ? '<span class="st st--off">Masqué</span>' : ''}${reviewNeedsAction(r) ? '<span class="st st--alert">À traiter</span>' : ''}</div>
            <p class="review__text">${esc(r.text) || '<span class="muted">(note sans commentaire)</span>'}</p>
            ${st.reply ? `<div class="review__reply"><strong>Votre réponse</strong>${st.replyAt ? ` <span class="muted">· ${ago(st.replyAt)}</span>` : ''}<br>${esc(st.reply)}</div>` : ''}
            <div class="row" style="gap:8px">
              <button type="button" class="btn btn--dark btn--xs" data-rv-open="${r.id}">${st.reply ? 'Modifier la réponse' : 'Répondre'}</button>
              <button type="button" class="btn btn--ghost btn--xs" data-rv-hide="${r.id}">${st.hidden ? 'Réafficher sur le site' : 'Masquer du site'}</button>
              ${t.site ? `<a class="btn btn--ghost btn--xs" href="${t.site}" target="_blank" rel="noopener">Voir sur le site ↗</a>` : ''}
            </div>
            <form class="reply-form" data-rv-form="${r.id}" hidden>
              <div class="reply-form__tpl"><span class="small muted">Partir d’un modèle :</span>${REPLY_TEMPLATES.map(([l], i) => `<button type="button" class="chip--btn" data-tpl="${i}">${l}</button>`).join('')}</div>
              <textarea class="input" rows="3" maxlength="600" aria-label="Votre réponse" placeholder="Écrivez votre réponse : elle sera publiée sous l’avis…">${esc(st.reply || '')}</textarea>
              <div class="row" style="gap:8px">
                <button class="btn btn--primary btn--xs">Publier la réponse</button>
                <button type="button" class="btn btn--ghost btn--xs" data-rv-cancel>Annuler</button>
                ${st.reply ? '<button type="button" class="linkbtn" data-rv-del>Supprimer la réponse</button>' : ''}
              </div>
            </form>
          </div>
        </article>`;
      }).join('') : `<div class="panel">${emptyState(filter === 'todo' ? 'Aucun avis à traiter' : 'Aucun avis ici', filter === 'todo' ? 'Tous les avis négatifs ont reçu une réponse. Beau travail !' : 'Modifiez la recherche ou le filtre.')}</div>`;
    };
    const find = (id) => DEMO.reviews.find((r) => r.id === id);
    const setState = (r, patch, msg) => { ADM.reviews[r.id] = { ...rvState(r), ...patch }; saveAdmin(msg); renderNav('avis'); renderBell(); draw(); };
    $('#rvSearch').addEventListener('input', draw);
    $('#rvSort').addEventListener('change', draw);
    $('#rvList').addEventListener('click', (e) => {
      const open = e.target.closest('[data-rv-open]');
      if (open) { const f = $(`[data-rv-form="${open.dataset.rvOpen}"]`); f.hidden = false; $('textarea', f).focus(); return; }
      const hide = e.target.closest('[data-rv-hide]');
      if (hide) { const r = find(hide.dataset.rvHide); const h = !rvState(r).hidden; setState(r, { hidden: h }, h ? `Avis de ${r.customer} masqué du site` : `Avis de ${r.customer} réaffiché`); return; }
      const form = e.target.closest('[data-rv-form]');
      if (!form) return;
      const r = find(form.dataset.rvForm);
      const tpl = e.target.closest('[data-tpl]');
      if (tpl) { $('textarea', form).value = REPLY_TEMPLATES[Number(tpl.dataset.tpl)][1](r); $('textarea', form).focus(); }
      if (e.target.closest('[data-rv-cancel]')) form.hidden = true;
      if (e.target.closest('[data-rv-del]')) setState(r, { reply: '', replyAt: '' }, 'Réponse supprimée');
    });
    $('#rvList').addEventListener('submit', (e) => {
      e.preventDefault();
      const form = e.target;
      const r = find(form.dataset.rvForm);
      const txt = $('textarea', form).value.trim();
      if (txt.length < 5) { toast('Votre réponse est un peu courte'); return; }
      setState(r, { reply: txt, replyAt: new Date().toISOString() }, `Réponse publiée à ${r.customer}`);
    });
    draw();
  },
};

/* ================= FORMULES & BOX ================= */
const boxFull = (items) => round2(items.reduce((a, id) => a + (AP(id) ? AP(id).price : 0), 0));
const formulaItems = (f) => f.defaults.slice(0, f.slots.reduce((a, [, n]) => a + n, 0));
function boxThumbs(items) {
  const uniq = [...new Set(items)];
  return `<div class="box-thumbs">${uniq.slice(0, 5).map((id) => (AP(id) ? thumb(AP(id).img, 'thumb thumb--sm') : '')).join('')}${uniq.length > 5 ? `<span class="box-thumbs__more">+${uniq.length - 5}</span>` : ''}</div>`;
}
const jumpLinks = (links) => `<div class="jump">${links.map(([id, label, n]) => `<a href="#" data-jump="${id}">${label}${n !== undefined ? ` <b>${n}</b>` : ''}</a>`).join('')}</div>`;
const bindJumps = () => $$('[data-jump]').forEach((a) => a.addEventListener('click', (e) => { e.preventDefault(); $(`#${a.dataset.jump}`).scrollIntoView({ behavior: 'smooth', block: 'start' }); }));

AVIEWS.formules = {
  title: (id) => {
    if (!id) return 'Formules & box';
    const f = ADM.formulas.find((x) => x.id === id) || ADM.discovery.find((x) => x.id === id);
    return f ? f.name : 'Formule introuvable';
  },
  render(id) {
    if (id) {
      const f = ADM.formulas.find((x) => x.id === id);
      if (f) return formulaEditor(f);
      const d = ADM.discovery.find((x) => x.id === id);
      if (d) return discoveryEditor(d);
      return emptyState('Formule introuvable', '', '<a class="btn btn--dark btn--sm" href="#/formules">Retour aux formules</a>');
    }
    const B = ADM.boxRules;
    return `${introText('Les formules et box vendues sur le site. Cliquez sur une carte pour changer son nom, sa photo, ses recettes ou son prix : la page de la box sur le site se met à jour automatiquement.')}
    ${jumpLinks([['fxFormules', 'Formules', ADM.formulas.length], ['fxDisc', 'Box découverte', ADM.discovery.length], ['fxRules', 'Règles de « Composer ma box »']])}

    <h2 class="sec-title" id="fxFormules">Formules <span class="muted">· prix = valeur des recettes − remise</span></h2>
    <div class="cards">${ADM.formulas.map((f) => {
      const items = formulaItems(f);
      const full = boxFull(items);
      const price = round2(full * (1 - f.discount));
      return `<a href="#/formules/${f.id}" class="panel fx-card">
        <img class="fx-card__img" src="${imgUrl(f.img, 600)}" alt="" loading="lazy" onerror="this.style.visibility='hidden'">
        <div class="fx-card__body">
          <div class="row between"><h3>${esc(f.name)}</h3><span class="st st--done">−${Math.round(f.discount * 100)} %</span></div>
          <p class="small muted">${esc(f.desc)}</p>
          ${boxThumbs(items)}
          <div class="fx-card__foot"><span><strong class="fx-price">${eur(price)}</strong> <s class="muted small">${eur(full)}</s></span><span class="small muted">${items.length} portions</span><span class="btn btn--ghost btn--xs">Modifier</span></div>
        </div>
      </a>`;
    }).join('')}</div>

    <h2 class="sec-title" id="fxDisc">Box découverte <span class="muted">· prix fixe choisi par vous</span></h2>
    <div class="cards">${ADM.discovery.map((d) => {
      const full = boxFull(d.items);
      const ok = d.price < full;
      return `<a href="#/formules/${d.id}" class="panel fx-card">
        <img class="fx-card__img" src="${imgUrl(d.img, 600)}" alt="" loading="lazy" onerror="this.style.visibility='hidden'">
        <div class="fx-card__body">
          <div class="row between"><h3>${esc(d.name)}</h3>${ok ? `<span class="st st--done">−${Math.round((1 - d.price / full) * 100)} %</span>` : '<span class="st st--alert">Prix à revoir</span>'}</div>
          <p class="small muted">${esc(d.desc)}</p>
          ${boxThumbs(d.items)}
          <div class="fx-card__foot"><span><strong class="fx-price">${eur(d.price)}</strong> <s class="muted small">${eur(full)}</s></span><span class="small muted">${d.items.length} portions</span><span class="btn btn--ghost btn--xs">Modifier</span></div>
        </div>
      </a>`;
    }).join('')}</div>

    <h2 class="sec-title" id="fxRules">Règles de « Composer ma box »</h2>
    <form class="panel" id="boxForm" style="max-width:720px">
      <p class="small muted" style="margin-top:0">Le client compose sa box librement entre un minimum et un maximum de portions. Plus il en prend, plus la remise est grande.</p>
      <div class="cols2">${fld('Minimum de portions', `<input class="input" type="number" min="1" name="minItems" value="${B.minItems}">`)}${fld('Maximum de portions', `<input class="input" type="number" min="1" name="maxItems" value="${B.maxItems}">`)}</div>
      <label class="label">Remises par palier</label>
      ${B.tiers.map((t, i) => `<div class="row tier-row">À partir de <input class="input input--price" type="number" min="1" name="tmin${i}" value="${t.min}" aria-label="Palier ${i + 1} : nombre de portions"> portions : <input class="input input--price" type="number" min="0" max="50" name="tpct${i}" value="${Math.round(t.pct * 100)}" aria-label="Palier ${i + 1} : remise en %"> % de remise</div>`).join('')}
      <div class="save-bar"><button class="btn btn--primary btn--sm">Enregistrer les règles</button><a class="btn btn--ghost btn--sm" href="index.html#/composer-ma-box" target="_blank" rel="noopener">Voir sur le site ↗</a></div>
    </form>`;
  },
  mount(id) {
    if (id) {
      const f = ADM.formulas.find((x) => x.id === id);
      if (f) mountFormulaEditor(f);
      else { const d = ADM.discovery.find((x) => x.id === id); if (d) mountDiscoveryEditor(d); }
      return;
    }
    bindJumps();
    const form = $('#boxForm');
    const g = dirtyGuard(form);
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const min = Math.max(1, Number(form.minItems.value));
      const max = Math.max(min, Number(form.maxItems.value));
      ADM.boxRules.minItems = min;
      ADM.boxRules.maxItems = max;
      ADM.boxRules.tiers = ADM.boxRules.tiers.map((t, i) => ({ min: Math.max(1, Number(form[`tmin${i}`].value)), pct: Math.min(0.5, Math.max(0, Number(form[`tpct${i}`].value) / 100)) })).sort((a, b) => a.min - b.min);
      if (saveAdmin('Règles de « Composer ma box » enregistrées')) g.clear();
    });
  },
};

function formulaEditor(f) {
  return `<form id="fxForm" class="form-layout" novalidate>
    <div class="form-main">
      <section class="panel"><h3>Informations</h3>
        ${fld('Nom de la formule', `<input class="input" name="name" required value="${esc(f.name)}">`)}
        ${fld('Description', `<textarea class="input" name="desc" rows="2">${esc(f.desc)}</textarea>`, 'Affichée sur la carte de la formule et sur sa page.')}
      </section>
      <section class="panel"><h3>Photo</h3>${photoPicker('fxPhoto', f.img)}</section>
      <section class="panel"><h3>Recettes proposées par défaut</h3>
        <p class="small muted" style="margin-top:0">Le client pourra remplacer chaque recette sur le site. Utilisez − et + pour changer le nombre de portions par catégorie.</p>
        <div id="fxSlots"></div>
      </section>
    </div>
    <aside class="form-side">
      <section class="panel"><h3>Prix</h3>
        ${fld('Remise sur la valeur des recettes', `<div class="range-row"><input type="range" name="discount" min="0" max="30" step="1" value="${Math.round(f.discount * 100)}" aria-label="Remise en %"><output id="fxDiscOut"></output></div>`)}
        <div class="calc-box" id="fxCalc"></div>
      </section>
      <section class="panel panel--sticky save-bar">
        <button class="btn btn--primary btn--block">Enregistrer</button>
        <a href="#/formules" class="btn btn--ghost btn--block btn--sm">Retour aux formules</a>
        <a href="index.html#/box/${f.id}" target="_blank" rel="noopener" class="btn btn--ghost btn--block btn--sm">Voir sur le site ↗</a>
      </section>
    </aside>
  </form>`;
}
function mountFormulaEditor(f) {
  const draft = clone(f);
  const form = $('#fxForm');
  const g = dirtyGuard(form);
  const drawCalc = () => {
    const items = formulaItems(draft);
    const full = boxFull(items);
    const price = round2(full * (1 - draft.discount));
    $('#fxDiscOut').textContent = `${Math.round(draft.discount * 100)} %`;
    $('#fxCalc').innerHTML = `<div><span>Valeur des recettes</span><strong>${eur(full)}</strong></div><div><span>Remise</span><strong>−${eur(full - price)}</strong></div><div class="calc-box__total"><span>Prix de la formule</span><strong>${eur(price)}</strong></div><div><span>Soit par portion</span><strong>${eur(items.length ? price / items.length : 0)}</strong></div>`;
  };
  const drawSlots = () => {
    let idx = 0;
    $('#fxSlots').innerHTML = draft.slots.map(([cat, n], si) => {
      const rows = [];
      for (let i = 0; i < n; i++, idx++) {
        const cur = draft.defaults[idx];
        rows.push(`<div class="fx-slot">${thumb(AP(cur) ? AP(cur).img : '', 'thumb thumb--sm')}<select class="input" data-def="${idx}" aria-label="${esc(catLabel(cat))}, portion ${i + 1}">${ADM.products.filter((p) => p.cat === cat && p.status !== 'archived').map((p) => `<option value="${p.id}" ${p.id === cur ? 'selected' : ''}>${esc(p.name)} — ${eur(p.price)}</option>`).join('')}</select></div>`);
      }
      return `<div class="fx-group"><div class="fx-group__head"><strong>${esc(catLabel(cat))}</strong><span class="qty-step">
        <button type="button" data-slot-dec="${si}" aria-label="Retirer une portion de ${esc(catLabel(cat))}">−</button><b aria-live="polite">${n}</b><button type="button" data-slot-inc="${si}" aria-label="Ajouter une portion de ${esc(catLabel(cat))}">+</button></span></div>${rows.join('')}</div>`;
    }).join('');
    drawCalc();
  };
  // Nombre de portions par catégorie : on recompose la liste des recettes par défaut
  const resize = (si, delta) => {
    const offsets = [];
    let o = 0;
    draft.slots.forEach(([, n]) => { offsets.push(o); o += n; });
    const [cat, n] = draft.slots[si];
    const nn = Math.max(1, Math.min(10, n + delta));
    if (nn === n) return;
    const pool = ADM.products.filter((p) => p.cat === cat && p.status !== 'archived');
    if (delta > 0) draft.defaults.splice(offsets[si] + n, 0, (pool[n % Math.max(1, pool.length)] || pool[0] || {}).id);
    else draft.defaults.splice(offsets[si] + n - 1, 1);
    draft.slots[si] = [cat, nn];
    g.mark();
    drawSlots();
  };
  $('#fxSlots').addEventListener('click', (e) => {
    const inc = e.target.closest('[data-slot-inc]');
    const dec = e.target.closest('[data-slot-dec]');
    if (inc) resize(Number(inc.dataset.slotInc), 1);
    if (dec) resize(Number(dec.dataset.slotDec), -1);
  });
  $('#fxSlots').addEventListener('change', (e) => { const s = e.target.closest('[data-def]'); if (s) { draft.defaults[Number(s.dataset.def)] = s.value; drawSlots(); } });
  form.discount.addEventListener('input', () => { draft.discount = Number(form.discount.value) / 100; drawCalc(); });
  bindPhotoPicker('fxPhoto', (src) => { draft.img = src; g.mark(); });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = form.name.value.trim();
    if (!name) { toast('Donnez un nom à la formule'); form.name.focus(); return; }
    const items = formulaItems(draft);
    Object.assign(f, draft, { name, desc: form.desc.value.trim(), portions: items.length, defaults: items });
    if (saveAdmin(`Formule enregistrée : ${name}`)) { g.clear(); location.hash = '#/formules'; }
  });
  drawSlots();
}

function discoveryEditor(d) {
  return `<form id="dxForm" class="form-layout" novalidate>
    <div class="form-main">
      <section class="panel"><h3>Informations</h3>
        ${fld('Nom de la box', `<input class="input" name="name" required value="${esc(d.name)}">`)}
        ${fld('Description', `<textarea class="input" name="desc" rows="2">${esc(d.desc)}</textarea>`)}
      </section>
      <section class="panel"><h3>Photo</h3>${photoPicker('dxPhoto', d.img)}</section>
      <section class="panel"><h3>Recettes de la box <span class="muted small" id="dxCount"></span></h3>
        <div id="dxItems" class="dx-items"></div>
        <label class="label" for="dxSearch" style="margin-top:16px">Ajouter une recette</label>
        <input class="input" id="dxSearch" placeholder="Rechercher un plat…" style="margin-bottom:10px">
        <div class="pool" id="dxPool"></div>
      </section>
    </div>
    <aside class="form-side">
      <section class="panel"><h3>Prix</h3>
        ${fld('Prix de vente (€)', `<input class="input" type="number" name="price" min="0" step="0.1" value="${d.price}">`)}
        <div class="calc-box" id="dxCalc"></div>
      </section>
      <section class="panel panel--sticky save-bar">
        <button class="btn btn--primary btn--block">Enregistrer</button>
        <a href="#/formules" class="btn btn--ghost btn--block btn--sm">Retour aux formules</a>
        <a href="index.html#/box/${d.id}" target="_blank" rel="noopener" class="btn btn--ghost btn--block btn--sm">Voir sur le site ↗</a>
      </section>
    </aside>
  </form>`;
}
function mountDiscoveryEditor(d) {
  const draft = clone(d);
  const form = $('#dxForm');
  const g = dirtyGuard(form);
  const draw = () => {
    $('#dxCount').textContent = `· ${draft.items.length} portion${draft.items.length > 1 ? 's' : ''}`;
    $('#dxItems').innerHTML = draft.items.length ? draft.items.map((id, i) => {
      const p = AP(id);
      return `<div class="dx-item">${thumb(p ? p.img : '', 'thumb thumb--sm')}<span><strong>${esc(p ? p.name : id)}</strong><small class="muted">${p ? `${esc(catLabel(p.cat))} · ${eur(p.price)}` : 'produit supprimé'}</small></span><button type="button" class="close close--sm" data-rm="${i}" aria-label="Retirer ${esc(p ? p.name : id)}">×</button></div>`;
    }).join('') : '<p class="muted small">Aucune recette : ajoutez-en depuis la liste ci-dessous.</p>';
    const q = fold($('#dxSearch').value.trim());
    $('#dxPool').innerHTML = ADM.products.filter((p) => p.status !== 'archived' && (!q || fold(p.name).includes(q))).map((p) => `<button type="button" class="pool__item" data-add="${p.id}">${thumb(p.img, 'thumb thumb--sm')}<span><strong class="small">${esc(p.name)}</strong><small class="muted">${eur(p.price)}</small></span><span class="pool__add" aria-hidden="true">+</span></button>`).join('');
    const full = boxFull(draft.items);
    const price = Number(form.price.value) || 0;
    const ok = price > 0 && price < full;
    $('#dxCalc').innerHTML = `<div><span>Valeur à l’unité</span><strong>${eur(full)}</strong></div><div class="calc-box__total"><span>Économie client</span><strong>${full && price ? `${eur(Math.max(0, full - price))} · ${Math.max(0, Math.round((1 - price / full) * 100))} %` : '—'}</strong></div>${ok ? '' : `<p class="warn-text small">${price <= 0 ? 'Indiquez un prix.' : 'Le prix dépasse la valeur des recettes : la box n’est pas avantageuse pour le client.'}</p>`}<button type="button" class="linkbtn" id="dxSuggest">Proposer un prix à −10 %</button>`;
    $('#dxSuggest').onclick = () => { form.price.value = (Math.floor(full * 0.9) + 0.9).toFixed(2); g.mark(); draw(); };
  };
  $('#dxItems').addEventListener('click', (e) => { const b = e.target.closest('[data-rm]'); if (b) { draft.items.splice(Number(b.dataset.rm), 1); g.mark(); draw(); } });
  $('#dxPool').addEventListener('click', (e) => {
    const b = e.target.closest('[data-add]');
    if (!b) return;
    if (draft.items.length >= 12) { toast('12 recettes maximum par box'); return; }
    draft.items.push(b.dataset.add);
    g.mark();
    draw();
  });
  $('#dxSearch').addEventListener('input', draw);
  form.price.addEventListener('input', draw);
  bindPhotoPicker('dxPhoto', (src) => { draft.img = src; g.mark(); });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = form.name.value.trim();
    const price = round2(Number(form.price.value));
    if (!name) { toast('Donnez un nom à la box'); return; }
    if (draft.items.length < 2) { toast('Ajoutez au moins 2 recettes'); return; }
    if (!(price > 0)) { toast('Indiquez un prix'); return; }
    Object.assign(d, draft, { name, desc: form.desc.value.trim(), price });
    if (saveAdmin(`Box enregistrée : ${name}`)) { g.clear(); location.hash = '#/formules'; }
  });
  draw();
}

/* ================= CONTENUS DU SITE ================= */
AVIEWS.contenus = {
  title: 'Textes du site',
  render() {
    return `${introText('Les textes visibles par tous les visiteurs. L’aperçu se met à jour pendant que vous tapez, et le site change dès que vous enregistrez.')}
    ${jumpLinks([['ctBanner', 'Bandeau d’annonce'], ['ctHero', 'Accroche de l’accueil'], ['ctFaq', 'Questions fréquentes']])}

    <form class="panel ct-block" id="ctBanner">
      <div class="panel__head"><div><h3>Bandeau d’annonce</h3><p class="small muted">Les messages qui défilent tout en haut du site. Courts et utiles : livraison, nouveauté, promotion.</p></div><a class="btn btn--ghost btn--xs" href="index.html" target="_blank" rel="noopener">Voir sur le site ↗</a></div>
      <div class="banner-preview" aria-hidden="true"><div class="banner-preview__track" id="ctBanPrev"></div></div>
      <div id="ctBanRows" class="ct-rows"></div>
      <button type="button" class="btn btn--ghost btn--xs" id="ctBanAdd">+ Ajouter un message</button>
      <div class="save-bar"><button class="btn btn--primary btn--sm">Enregistrer le bandeau</button></div>
    </form>

    <form class="panel ct-block" id="ctHero">
      <div class="panel__head"><div><h3>Accroche de l’accueil</h3><p class="small muted">Le texte sous le grand titre « Votre semaine, préparée. » de la page d’accueil.</p></div></div>
      <div class="hero-preview"><h2>Votre semaine, <em>préparée.</em></h2><p id="ctHeroPrev"></p></div>
      ${fld('Texte', `<textarea class="input" name="heroText" rows="3" maxlength="240">${esc(ADM.content.heroText)}</textarea>`, '<span id="ctHeroCount"></span> · 240 caractères maximum')}
      <div class="save-bar"><button class="btn btn--primary btn--sm">Enregistrer l’accroche</button><button type="button" class="linkbtn" id="ctHeroReset">Rétablir le texte d’origine</button></div>
    </form>

    <form class="panel ct-block" id="ctFaq">
      <div class="panel__head"><div><h3>Questions fréquentes</h3><p class="small muted">La page FAQ du site, organisée en rubriques.</p></div><a class="btn btn--ghost btn--xs" href="index.html#/faq" target="_blank" rel="noopener">Voir la FAQ ↗</a></div>
      <div id="ctFaqGroups"></div>
      <button type="button" class="btn btn--ghost btn--xs" id="ctFaqAddGroup">+ Ajouter une rubrique</button>
      <div class="save-bar"><button class="btn btn--primary btn--sm">Enregistrer la FAQ</button></div>
    </form>`;
  },
  mount() {
    bindJumps();

    /* Bandeau */
    const ban = [...ADM.content.banner];
    const banForm = $('#ctBanner');
    const gb = dirtyGuard(banForm);
    const drawBanPrev = () => { $('#ctBanPrev').innerHTML = ban.filter((m) => m.trim()).map((m) => `<span>${esc(m)}</span><i>✺</i>`).join('').repeat(3); };
    const drawBan = () => {
      $('#ctBanRows').innerHTML = ban.map((m, i) => `<div class="ct-row"><span class="ct-row__n">${i + 1}</span><input class="input" data-ban="${i}" value="${esc(m)}" maxlength="70" aria-label="Message ${i + 1}">
        <button type="button" class="iconbtn iconbtn--sm" data-ban-up="${i}" ${i === 0 ? 'disabled' : ''} aria-label="Monter le message ${i + 1}">↑</button><button type="button" class="iconbtn iconbtn--sm" data-ban-down="${i}" ${i === ban.length - 1 ? 'disabled' : ''} aria-label="Descendre le message ${i + 1}">↓</button><button type="button" class="close close--sm" data-ban-rm="${i}" aria-label="Supprimer le message ${i + 1}">×</button></div>`).join('');
      drawBanPrev();
    };
    $('#ctBanRows').addEventListener('input', (e) => { const i = e.target.dataset.ban; if (i !== undefined) { ban[Number(i)] = e.target.value; drawBanPrev(); } });
    $('#ctBanRows').addEventListener('click', (e) => {
      const up = e.target.closest('[data-ban-up]');
      const down = e.target.closest('[data-ban-down]');
      const rm = e.target.closest('[data-ban-rm]');
      if (up) { const i = Number(up.dataset.banUp); [ban[i - 1], ban[i]] = [ban[i], ban[i - 1]]; }
      else if (down) { const i = Number(down.dataset.banDown); [ban[i + 1], ban[i]] = [ban[i], ban[i + 1]]; }
      else if (rm) ban.splice(Number(rm.dataset.banRm), 1);
      else return;
      gb.mark();
      drawBan();
    });
    $('#ctBanAdd').onclick = () => { if (ban.length >= 8) { toast('8 messages maximum'); return; } ban.push(''); gb.mark(); drawBan(); $(`[data-ban="${ban.length - 1}"]`).focus(); };
    banForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const clean = ban.map((m) => m.trim()).filter(Boolean);
      if (!clean.length) { toast('Gardez au moins un message'); return; }
      ADM.content.banner = clean;
      if (saveAdmin('Bandeau d’annonce enregistré')) gb.clear();
      ban.splice(0, ban.length, ...clean);
      drawBan();
    });
    drawBan();

    /* Accroche */
    const heroForm = $('#ctHero');
    const gh = dirtyGuard(heroForm);
    const drawHero = () => { const v = heroForm.heroText.value; $('#ctHeroPrev').textContent = v || '…'; $('#ctHeroCount').textContent = `${v.length} caractère${v.length > 1 ? 's' : ''}`; };
    heroForm.heroText.addEventListener('input', drawHero);
    $('#ctHeroReset').onclick = () => { heroForm.heroText.value = HERO_TEXT_DEFAULT; gh.mark(); drawHero(); };
    heroForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const v = heroForm.heroText.value.trim();
      if (v.length < 20) { toast('L’accroche est trop courte (20 caractères minimum)'); return; }
      ADM.content.heroText = v;
      if (saveAdmin('Accroche de l’accueil enregistrée')) gh.clear();
    });
    drawHero();

    /* FAQ */
    const faq = clone(ADM.content.faq || []);
    const faqForm = $('#ctFaq');
    const gf = dirtyGuard(faqForm);
    const drawFaq = () => {
      $('#ctFaqGroups').innerHTML = faq.length ? faq.map(([title, qs], gi) => `<div class="faq-group">
        <div class="ct-row"><input class="input ct-group-title" data-g="${gi}" value="${esc(title)}" placeholder="Nom de la rubrique" aria-label="Nom de la rubrique ${gi + 1}"><button type="button" class="btn btn--ghost btn--xs" data-g-rm="${gi}">Supprimer la rubrique</button></div>
        ${qs.map(([q, a], qi) => `<div class="faq-q"><div><input class="input" data-q="${gi}-${qi}" value="${esc(q)}" placeholder="Question" aria-label="Question"><textarea class="input" data-a="${gi}-${qi}" rows="2" placeholder="Réponse" aria-label="Réponse">${esc(a)}</textarea></div><button type="button" class="close close--sm" data-q-rm="${gi}-${qi}" aria-label="Supprimer la question">×</button></div>`).join('')}
        <button type="button" class="btn btn--ghost btn--xs" data-q-add="${gi}">+ Ajouter une question</button>
      </div>`).join('') : '<p class="muted small">Aucune rubrique.</p>';
    };
    $('#ctFaqGroups').addEventListener('input', (e) => {
      const t = e.target;
      if (t.dataset.g !== undefined) faq[Number(t.dataset.g)][0] = t.value;
      if (t.dataset.q) { const [gq, q] = t.dataset.q.split('-').map(Number); faq[gq][1][q][0] = t.value; }
      if (t.dataset.a) { const [gq, q] = t.dataset.a.split('-').map(Number); faq[gq][1][q][1] = t.value; }
    });
    $('#ctFaqGroups').addEventListener('click', (e) => {
      const add = e.target.closest('[data-q-add]');
      const rmq = e.target.closest('[data-q-rm]');
      const rmg = e.target.closest('[data-g-rm]');
      if (add) faq[Number(add.dataset.qAdd)][1].push(['', '']);
      else if (rmq) { const [gq, q] = rmq.dataset.qRm.split('-').map(Number); faq[gq][1].splice(q, 1); }
      else if (rmg) {
        const gi = Number(rmg.dataset.gRm);
        confirmModal('Supprimer cette rubrique ?', `« ${esc(faq[gi][0])} » et ses ${faq[gi][1].length} questions seront retirées de la FAQ après enregistrement.`, 'Supprimer', () => { faq.splice(gi, 1); gf.mark(); drawFaq(); });
        return;
      } else return;
      gf.mark();
      drawFaq();
    });
    $('#ctFaqAddGroup').onclick = () => { faq.push(['Nouvelle rubrique', [['', '']]]); gf.mark(); drawFaq(); };
    faqForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const clean = faq.map(([t, qs]) => [t.trim(), qs.map(([q, a]) => [q.trim(), a.trim()]).filter(([q, a]) => q && a)]).filter(([t, qs]) => t && qs.length);
      if (!clean.length) { toast('Gardez au moins une rubrique avec une question et sa réponse'); return; }
      ADM.content.faq = clean;
      if (saveAdmin('FAQ enregistrée')) gf.clear();
      faq.splice(0, faq.length, ...clone(clean));
      drawFaq();
    });
    drawFaq();
  },
};

/* ================= PRODUCTEURS ================= */
const producerUses = (id) => ADM.products.filter((p) => p.status !== 'archived' && ((p.suppliers || []).includes(id) || (p.origin || []).some((o) => o.producer === id)));

AVIEWS.producteurs = {
  title: (id) => (id === 'nouveau' ? 'Ajouter un producteur' : id ? ((ADM.producers.find((p) => p.id === id) || {}).name || 'Producteur') : 'Producteurs'),
  render(id) {
    if (id) return producerForm(id === 'nouveau' ? null : ADM.producers.find((p) => p.id === id));
    const unverified = ADM.producers.filter((p) => !p.verified).length;
    return `${pageHead('Les fermes et artisans qui fournissent vos ingrédients. Leur fiche apparaît sur la page « Nos producteurs » du site et dans la provenance de chaque plat.', '<a href="#/producteurs/nouveau" class="btn btn--primary btn--sm">+ Ajouter un producteur</a>')}
    ${unverified ? `<div class="notice notice--warn"><strong>${unverified} partenariat${unverified > 1 ? 's' : ''} à vérifier.</strong> N’affichez « local » ou « partenaire » qu’avec un justificatif (contrat, facture, visite). Cochez « Partenariat vérifié » dans la fiche une fois le justificatif reçu.</div>` : ''}
    <div class="cards">${ADM.producers.map((pr) => {
      const uses = producerUses(pr.id);
      return `<a href="#/producteurs/${pr.id}" class="panel fx-card">
        <img class="fx-card__img" src="${imgUrl(pr.img, 600)}" alt="" loading="lazy" onerror="this.style.visibility='hidden'">
        <div class="fx-card__body">
          <div class="row between"><h3>${esc(pr.name)}</h3>${pr.verified ? '<span class="st st--done">✓ Vérifié</span>' : '<span class="st st--wait">À vérifier</span>'}</div>
          <p class="small muted">${esc(pr.type)} · ${esc(pr.location)}${pr.dept ? ` (${esc(pr.dept)})` : ''}</p>
          <div class="chips-sm">${(pr.products || []).slice(0, 4).map((x) => `<span>${esc(x)}</span>`).join('')}</div>
          <div class="fx-card__foot"><span class="small muted">Utilisé dans ${uses.length} plat${uses.length > 1 ? 's' : ''}</span><span class="btn btn--ghost btn--xs">Modifier</span></div>
        </div>
      </a>`;
    }).join('')}</div>`;
  },
  mount(id) { if (id) mountProducerForm(id === 'nouveau' ? null : ADM.producers.find((p) => p.id === id)); },
};

function producerForm(pr) {
  if (pr === undefined) return emptyState('Producteur introuvable', '', '<a class="btn btn--dark btn--sm" href="#/producteurs">Retour aux producteurs</a>');
  const isNew = !pr;
  pr = pr || { name: '', type: '', location: '', dept: '', distance: '', img: '', products: [], bio: '', methods: '', verified: false, proof: '' };
  const uses = isNew ? [] : producerUses(pr.id);
  return `<form id="prForm" class="form-layout" novalidate>
    <div class="form-main">
      <section class="panel"><h3>Identité</h3>
        ${fld('Nom de l’exploitation', `<input class="input" name="name" required value="${esc(pr.name)}" placeholder="Ex. : Ferme des Monts d’Or">`)}
        <div class="cols2">
          ${fld('Activité', `<input class="input" name="type" value="${esc(pr.type)}" placeholder="Ex. : Maraîcher">`)}
          ${fld('Distance de Lyon', `<input class="input" name="distance" value="${esc(pr.distance)}" placeholder="Ex. : 18 km">`)}
        </div>
        <div class="cols2">
          ${fld('Commune', `<input class="input" name="location" value="${esc(pr.location)}" placeholder="Ex. : Neuville-sur-Saône">`)}
          ${fld('Département', `<input class="input" name="dept" value="${esc(pr.dept)}" placeholder="Ex. : Rhône (69)">`)}
        </div>
      </section>
      <section class="panel"><h3>Photo</h3>${photoPicker('prPhoto', pr.img)}</section>
      <section class="panel"><h3>Présentation</h3>
        ${fld('Produits fournis', `<input class="input" name="products" value="${esc((pr.products || []).join(', '))}" placeholder="Ex. : Courgettes, Carottes, Herbes fraîches">`, 'Séparés par des virgules.')}
        ${fld('Présentation', `<textarea class="input" name="bio" rows="3" placeholder="Quelques phrases sur l’exploitation et son histoire.">${esc(pr.bio)}</textarea>`)}
        ${fld('Méthodes de production', `<textarea class="input" name="methods" rows="2" placeholder="Uniquement des informations vérifiées (label, certification, pratiques).">${esc(pr.methods)}</textarea>`)}
      </section>
    </div>
    <aside class="form-side">
      <section class="panel"><h3>Vérification</h3>
        <label class="check" style="margin-bottom:10px"><input type="checkbox" name="verified" ${pr.verified ? 'checked' : ''}> Partenariat vérifié</label>
        ${fld('Justificatif', `<input class="input" name="proof" value="${esc(pr.proof || '')}" placeholder="Ex. : contrat signé le 12/10">`, 'Obligatoire pour cocher « vérifié ».')}
      </section>
      ${!isNew ? `<section class="panel"><h3>Utilisé dans</h3>${uses.length ? `<ul class="plain small">${uses.map((p) => `<li><a href="#/produits/${p.id}" class="link">${esc(p.name)}</a></li>`).join('')}</ul>` : '<p class="small muted">Aucun plat pour l’instant. Associez ce producteur depuis la fiche d’un produit (rubrique Traçabilité).</p>'}</section>` : ''}
      <section class="panel panel--sticky save-bar">
        <button class="btn btn--primary btn--block">${isNew ? 'Ajouter le producteur' : 'Enregistrer'}</button>
        <a href="#/producteurs" class="btn btn--ghost btn--block btn--sm">Annuler</a>
        ${!isNew ? `<a href="index.html#/nos-producteurs" target="_blank" rel="noopener" class="btn btn--ghost btn--block btn--sm">Voir sur le site ↗</a><div class="danger-zone"><button type="button" class="btn btn--danger btn--sm" id="prDelete">Supprimer</button></div>` : ''}
      </section>
    </aside>
  </form>`;
}
function mountProducerForm(pr) {
  const form = $('#prForm');
  if (!form) return;
  const g = dirtyGuard(form);
  let img = pr ? pr.img : '';
  bindPhotoPicker('prPhoto', (src) => { img = src; g.mark(); });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = form.name.value.trim();
    if (!name) { toast('Indiquez le nom de l’exploitation'); form.name.focus(); return; }
    if (form.verified.checked && !form.proof.value.trim()) { toast('Ajoutez le justificatif avant de marquer le partenariat comme vérifié'); form.proof.focus(); return; }
    const data = {
      name, type: form.type.value.trim(), location: form.location.value.trim(), dept: form.dept.value.trim(), distance: form.distance.value.trim(), img,
      products: form.products.value.split(',').map((x) => x.trim()).filter(Boolean), bio: form.bio.value.trim(), methods: form.methods.value.trim(),
      verified: form.verified.checked, proof: form.proof.value.trim(),
    };
    if (pr) Object.assign(pr, data);
    else ADM.producers.push({ id: `${slugify(name)}-${uid().slice(0, 4)}`, ...data });
    if (saveAdmin(pr ? `Producteur mis à jour : ${name}` : `Producteur ajouté : ${name}`)) { g.clear(); location.hash = '#/producteurs'; }
  });
  const del = $('#prDelete');
  if (del) del.onclick = () => {
    const uses = producerUses(pr.id);
    if (uses.length) {
      openModal(`<h3>Ce producteur est encore utilisé</h3><p class="muted">Il fournit ${uses.length} plat${uses.length > 1 ? 's' : ''} : ${uses.map((p) => esc(p.name)).join(', ')}. Retirez-le d’abord de ces fiches produits (rubrique Traçabilité).</p><div class="row" style="justify-content:flex-end"><button class="btn btn--dark btn--sm" data-close-modal>Compris</button></div>`);
      return;
    }
    confirmModal('Supprimer ce producteur ?', `« ${esc(pr.name)} » disparaîtra de la page « Nos producteurs » du site.`, 'Supprimer', () => {
      ADM.producers = ADM.producers.filter((x) => x.id !== pr.id);
      saveAdmin(`Producteur supprimé : ${pr.name}`);
      location.hash = '#/producteurs';
    });
  };
}

/* ================= Rattachements ================= */
/* Livraison et promotions s'ouvrent dans Réglages ; catégories et suppléments depuis Produits. */
AVIEWS.promotions = { ...AVIEWS.reglages, nav: 'reglages' };
AVIEWS.livraison = { ...AVIEWS.reglages, nav: 'reglages' };
AVIEWS.categories.nav = 'produits';
AVIEWS.supplements.nav = 'produits';
