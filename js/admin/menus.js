/* =========================================================
   PREP CLUB Admin — Menu de la semaine & collections de saison
   ========================================================= */
'use strict';

function menuState(m) {
  const day = iso(new Date());
  const live = liveWeeklyMenu(ADM);
  if (live && live.id === m.id) return ['En ligne', 'st--done'];
  if (m.to < day) return ['Terminé', 'st--off'];
  if (m.status === 'scheduled') return [`Programmé · ${m.publishAt ? fmtDT(m.publishAt) : 'date à définir'}`, 'st--wait'];
  if (m.status === 'published') return [m.from > day ? `Publié · visible le ${fmtDate(m.from, { day: 'numeric', month: 'short' })}` : 'Publié', 'st--ship'];
  return ['Brouillon', 'st--off'];
}
const range = (a, b) => `${fmtDate(a, { day: 'numeric', month: 'short' })} → ${fmtDate(b, { day: 'numeric', month: 'short', year: 'numeric' })}`;

/* ================= MENUS HEBDOMADAIRES ================= */
AVIEWS.menus = {
  title: (id) => (id ? 'Modifier le menu' : 'Menu de la semaine'),
  render(id) {
    if (id) return menuEditor(ADM.weeklyMenus.find((m) => m.id === id));
    const list = [...ADM.weeklyMenus].sort((a, b) => b.from.localeCompare(a.from));
    return `<div class="toolbar"><p class="muted" style="margin:0">Le menu en ligne apparaît comme premier filtre de la carte (« ${esc((liveWeeklyMenu(ADM) || {}).name || 'Menu de la semaine')} »).</p><button class="btn btn--primary btn--sm toolbar__end" id="newMenu">+ Créer un menu</button></div>
      <div class="cards">${list.map((m) => {
        const [label, cls] = menuState(m);
        return `<article class="panel menu-card">
          <div class="menu-card__imgs">${m.items.slice(0, 4).map((id) => thumb((AP(id) || {}).img)).join('')}</div>
          <div><span class="st ${cls}">${label}</span><h3><a href="#/menus/${m.id}">${esc(m.name)}</a></h3><p class="small muted">${range(m.from, m.to)} · ${m.items.length} plat${m.items.length > 1 ? 's' : ''}</p></div>
          <div class="row"><a href="#/menus/${m.id}" class="btn btn--dark btn--xs">Modifier</a><button class="btn btn--ghost btn--xs" data-preview="${m.id}">Prévisualiser</button><button class="btn btn--ghost btn--xs" data-dup="${m.id}">Dupliquer</button><button class="btn btn--ghost btn--xs" data-delmenu="${m.id}">Supprimer</button></div>
        </article>`;
      }).join('') || emptyState('Aucun menu', 'Créez votre premier menu hebdomadaire.')}</div>`;
  },
  mount(id) {
    if (id) return mountMenuEditor(ADM.weeklyMenus.find((m) => m.id === id));
    const nextFree = () => {
      let d = mondayOf(new Date());
      while (ADM.weeklyMenus.some((m) => m.from === iso(d))) d = addDays(d, 7);
      return d;
    };
    $('#newMenu').onclick = () => {
      const d = nextFree();
      const m = { id: `wm-${uid()}`, name: `Menu du ${fmtDate(d, { day: 'numeric', month: 'long' })}`, from: iso(d), to: iso(addDays(d, 6)), items: [], status: 'draft', publishAt: '' };
      ADM.weeklyMenus.push(m);
      saveAdmin(`Menu créé : ${m.name}`);
      location.hash = `#/menus/${m.id}`;
    };
    $$('[data-preview]').forEach((b) => b.onclick = () => menuPreview(ADM.weeklyMenus.find((m) => m.id === b.dataset.preview)));
    $$('[data-dup]').forEach((b) => b.onclick = () => {
      const src = ADM.weeklyMenus.find((m) => m.id === b.dataset.dup);
      const d = nextFree();
      const m = { ...clone(src), id: `wm-${uid()}`, name: `${src.name} (copie)`, from: iso(d), to: iso(addDays(d, 6)), status: 'draft', publishAt: '' };
      ADM.weeklyMenus.push(m);
      saveAdmin(`Menu dupliqué : ${m.name}`);
      location.hash = `#/menus/${m.id}`;
    });
    $$('[data-delmenu]').forEach((b) => b.onclick = () => {
      const m = ADM.weeklyMenus.find((x) => x.id === b.dataset.delmenu);
      confirmModal('Supprimer ce menu ?', `« ${esc(m.name)} » sera supprimé. Les produits restent au catalogue.`, 'Supprimer', () => {
        ADM.weeklyMenus = ADM.weeklyMenus.filter((x) => x !== m); saveAdmin(`Menu supprimé : ${m.name}`); rerender();
      });
    });
  },
};

function menuPreview(m) {
  const items = m.items.map(AP).filter(Boolean);
  openModal(`<span class="eyebrow">Aperçu · ${range(m.from, m.to)}</span><h3>${esc(m.name)}</h3>
    <p class="muted small">Tel qu’il apparaîtra sur la carte du site. Les produits désactivés ou épuisés y sont signalés.</p>
    <div class="preview-grid">${items.map((p) => { const s = productState(p); return `<div class="preview-card">${thumb(p.img, 'preview-card__img')}<div class="small muted">${esc(catLabel(p.cat))}</div><strong>${esc(p.name)}</strong><div class="row" style="justify-content:space-between"><span>${eur(p.price)}</span>${s.code !== 'active' ? `<span class="st st--alert">${s.label}</span>` : ''}</div></div>`; }).join('') || '<p class="muted">Aucun plat dans ce menu.</p>'}</div>`);
}

function menuEditor(m) {
  if (!m) return emptyState('Menu introuvable', '', '<a class="btn btn--dark btn--sm" href="#/menus">Retour aux menus</a>');
  return `<form id="menuForm" class="form-layout">
    <div class="form-main">
      <section class="panel"><h3>Plats du menu <span class="muted small" id="menuCount"></span></h3><div id="menuItems"></div></section>
      <section class="panel"><h3>Ajouter des plats</h3>
        <div class="row" style="margin-bottom:12px"><input type="search" class="input" id="menuSearch" placeholder="Rechercher…" style="flex:1"><select class="input" id="menuCat" aria-label="Catégorie"><option value="all">Toutes</option>${ADM.categories.map((c) => `<option value="${c.id}">${esc(c.label)}</option>`).join('')}</select></div>
        <div id="menuPool" class="pool"></div>
      </section>
    </div>
    <aside class="form-side">
      <section class="panel"><h3>Publication</h3>
        <div class="field"><label for="mName">Nom du menu</label><input class="input" id="mName" name="name" value="${esc(m.name)}" required></div>
        <div class="cols2"><div class="field"><label for="mFrom">Disponible du</label><input class="input" type="date" id="mFrom" name="from" value="${m.from}"></div><div class="field"><label for="mTo">au</label><input class="input" type="date" id="mTo" name="to" value="${m.to}"></div></div>
        <div class="field"><label>Statut</label>
          <label class="check"><input type="radio" name="status" value="draft" ${m.status === 'draft' ? 'checked' : ''}> Brouillon (non visible)</label>
          <label class="check"><input type="radio" name="status" value="scheduled" ${m.status === 'scheduled' ? 'checked' : ''}> Programmer la publication</label>
          <input class="input" type="datetime-local" name="publishAt" value="${m.publishAt}" style="margin:4px 0 6px 26px;width:calc(100% - 26px)" aria-label="Date de publication">
          <label class="check"><input type="radio" name="status" value="published" ${m.status === 'published' ? 'checked' : ''}> Publier maintenant</label>
        </div>
        <p class="hint">Un menu publié n’apparaît sur le site que pendant ses dates de disponibilité.</p>
      </section>
      <section class="panel panel--sticky">
        <button class="btn btn--primary btn--block">Enregistrer</button>
        <button type="button" class="btn btn--ghost btn--block btn--sm" id="mPreview" style="margin-top:8px">Prévisualiser</button>
        <a href="#/menus" class="btn btn--ghost btn--block btn--sm" style="margin-top:8px">Retour aux menus</a>
      </section>
    </aside></form>`;
}

function mountMenuEditor(m) {
  if (!m) return;
  const items = [...m.items];
  const drawItems = () => {
    $('#menuCount').textContent = `· ${items.length} plat${items.length > 1 ? 's' : ''}`;
    const groups = ADM.categories.map((c) => [c, items.map(AP).filter((p) => p && p.cat === c.id)]).filter(([, l]) => l.length);
    $('#menuItems').innerHTML = groups.length ? groups.map(([c, list]) => `<h4>${esc(c.label)}</h4><ul class="menu-items">${list.map((p) => `<li>${thumb(p.img)}<div><strong>${esc(p.name)}</strong><div class="small muted">${eur(p.price)} · ${productStateBadge(p)}</div></div><a class="btn btn--ghost btn--xs" href="#/produits/${p.id}">Modifier la recette</a><button type="button" class="close close--sm" data-out="${p.id}" aria-label="Retirer">×</button></li>`).join('')}</ul>`).join('') : '<p class="muted">Ajoutez des plats depuis la liste ci-dessous.</p>';
    drawPool();
  };
  const drawPool = () => {
    const q = $('#menuSearch').value.toLowerCase();
    const cat = $('#menuCat').value;
    const pool = ADM.products.filter((p) => p.status !== 'archived' && !items.includes(p.id) && (cat === 'all' || p.cat === cat) && (!q || p.name.toLowerCase().includes(q)));
    $('#menuPool').innerHTML = pool.map((p) => `<button type="button" class="pool__item" data-in="${p.id}">${thumb(p.img)}<span><strong>${esc(p.name)}</strong><span class="small muted">${esc(catLabel(p.cat))} · ${eur(p.price)}</span></span><span class="pool__add" aria-hidden="true">+</span></button>`).join('') || '<p class="muted small">Tous les plats correspondants sont déjà au menu.</p>';
  };
  $('#menuItems').addEventListener('click', (e) => { const b = e.target.closest('[data-out]'); if (b) { items.splice(items.indexOf(b.dataset.out), 1); drawItems(); } });
  $('#menuPool').addEventListener('click', (e) => { const b = e.target.closest('[data-in]'); if (b) { items.push(b.dataset.in); drawItems(); } });
  $('#menuSearch').addEventListener('input', drawPool);
  $('#menuCat').addEventListener('change', drawPool);
  const form = $('#menuForm');
  $('#mPreview').onclick = () => menuPreview({ ...m, name: form.elements.name.value, from: form.from.value, to: form.to.value, items });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const status = form.status.value;
    if (!form.from.value || !form.to.value || form.to.value < form.from.value) { toast('Vérifiez les dates de disponibilité'); return; }
    if (status === 'scheduled' && !form.publishAt.value) { toast('Choisissez la date de publication'); form.publishAt.focus(); return; }
    if (status !== 'draft' && !items.length) { toast('Ajoutez au moins un plat avant de publier'); return; }
    Object.assign(m, { name: form.elements.name.value.trim() || m.name, from: form.from.value, to: form.to.value, status, publishAt: form.publishAt.value, items });
    saveAdmin(`Menu enregistré : ${m.name}`);
    location.hash = '#/menus';
  });
  drawItems();
}

/* ================= COLLECTIONS DE SAISON ================= */
const SEASON_ORDER = ['spring', 'summer', 'autumn', 'winter'];
AVIEWS.collections = {
  title: (k) => (k ? `Collection ${(ADM.collections[k] || {}).name || ''}` : 'Collections de saison'),
  render(k) {
    if (k) return collectionEditor(k);
    const featured = ADM.featuredSeason || CURRENT_SEASON;
    return `<p class="muted intro">La collection mise en avant apparaît sur l’accueil et dans « Collection de saison ». Par défaut, c’est celle de la saison en cours.</p>
      <div class="cards cards--4">${SEASON_ORDER.map((key) => {
        const c = ADM.collections[key];
        return `<article class="panel season-card">
          <a href="#/collections/${key}">${thumb(c.img, 'season-card__img')}</a>
          <div>${key === featured ? '<span class="st st--done">Mise en avant</span>' : ''}<h3><a href="#/collections/${key}">Collection ${esc(c.name)}</a></h3><p class="small muted">${esc(c.months)} · ${c.products.length} recette${c.products.length > 1 ? 's' : ''}</p></div>
          <a href="#/collections/${key}" class="btn btn--dark btn--xs">Modifier</a>
        </article>`;
      }).join('')}</div>`;
  },
  mount(k) { if (k) mountCollection(k); },
};

function collectionEditor(k) {
  const c = ADM.collections[k];
  if (!c) return emptyState('Collection introuvable', '');
  const featured = (ADM.featuredSeason || CURRENT_SEASON) === k;
  return `<form id="colForm" class="form-layout">
    <div class="form-main">
      <section class="panel"><h3>Présentation</h3>
        <div class="cols2"><div class="field"><label>Nom de la saison</label><input class="input" name="name" value="${esc(c.name)}" required></div><div class="field"><label>Période affichée</label><input class="input" name="months" value="${esc(c.months)}" placeholder="Ex. : Septembre – Novembre"></div></div>
        <div class="field"><label>Description</label><textarea class="input" name="text" rows="3">${esc(c.text)}</textarea></div>
        <div class="field"><label>Ingrédients de saison</label><input class="input" name="ingredients" value="${esc(c.ingredients.join(', '))}"><span class="hint">Séparés par des virgules.</span></div>
        <div class="cols2"><div class="field"><label>Début de la collection</label><input class="input" type="date" name="from" value="${c.from || ''}"></div><div class="field"><label>Fin de la collection</label><input class="input" type="date" name="to" value="${c.to || ''}"></div></div>
      </section>
      <section class="panel"><h3>Photo</h3>
        <div class="row"><div id="colImg">${thumb(c.img, 'season-card__img')}</div>
          <div style="flex:1;min-width:220px"><label class="btn btn--ghost btn--sm file-btn">Importer une photo<input type="file" accept="image/*" id="colFile" hidden></label>
          <input class="input" id="colUrl" placeholder="ou adresse d’une image (https://…)" style="margin-top:8px"></div></div>
      </section>
      <section class="panel"><h3>Recettes de la collection</h3>
        <div class="checks checks--grid">${ADM.products.filter((p) => p.status !== 'archived').map((p) => `<label class="check"><input type="checkbox" name="products" value="${p.id}" ${c.products.includes(p.id) ? 'checked' : ''}> ${esc(p.name)} <span class="muted small">· ${esc(catLabel(p.cat))}</span></label>`).join('')}</div>
        <p class="hint">Une recette appartient à une seule collection : la cocher ici la retire des autres.</p>
      </section>
      <section class="panel"><h3>Producteurs mis en avant</h3>
        <div class="checks checks--grid">${ADM.producers.map((pr) => `<label class="check"><input type="checkbox" name="producers" value="${pr.id}" ${c.producers.includes(pr.id) ? 'checked' : ''}> ${esc(pr.name)}</label>`).join('')}</div>
      </section>
    </div>
    <aside class="form-side"><section class="panel panel--sticky">
      <label class="check" style="margin-bottom:14px"><input type="checkbox" name="featured" ${featured ? 'checked' : ''}> Mettre en avant sur le site</label>
      <button class="btn btn--primary btn--block">Enregistrer</button>
      <a href="index.html#/collection-de-saison/${SUB_SLUGS[k]}" target="_blank" rel="noopener" class="btn btn--ghost btn--block btn--sm" style="margin-top:8px">Voir sur le site ↗</a>
      <a href="#/collections" class="btn btn--ghost btn--block btn--sm" style="margin-top:8px">Retour</a>
    </section></aside></form>`;
}

function mountCollection(k) {
  const c = ADM.collections[k];
  if (!c) return;
  let img = c.img;
  const form = $('#colForm');
  const show = () => { $('#colImg').innerHTML = thumb(img, 'season-card__img'); };
  $('#colFile').addEventListener('change', async (e) => { if (e.target.files[0]) { try { img = await readImage(e.target.files[0]); show(); } catch (err) { toast('Image illisible'); } } });
  $('#colUrl').addEventListener('change', (e) => { if (/^https?:\/\//.test(e.target.value.trim())) { img = e.target.value.trim(); show(); } });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    if (fd.get('from') && fd.get('to') && fd.get('to') < fd.get('from')) { toast('La fin précède le début de la collection'); return; }
    const products = fd.getAll('products');
    Object.assign(c, {
      name: fd.get('name').trim() || c.name, months: fd.get('months').trim(), text: fd.get('text').trim(), img,
      ingredients: fd.get('ingredients').split(',').map((s) => s.trim()).filter(Boolean), from: fd.get('from'), to: fd.get('to'),
      producers: fd.getAll('producers'), products,
    });
    ADM.products.forEach((p) => {
      if (products.includes(p.id)) p.season = k;
      else if (p.season === k) delete p.season;
    });
    Object.entries(ADM.collections).forEach(([key, other]) => { if (key !== k) other.products = other.products.filter((id) => !products.includes(id)); });
    if (fd.get('featured') === 'on') ADM.featuredSeason = k;
    else if ((ADM.featuredSeason || CURRENT_SEASON) === k) ADM.featuredSeason = '';
    saveAdmin(`Collection ${c.name} enregistrée`);
    location.hash = '#/collections';
  });
}
