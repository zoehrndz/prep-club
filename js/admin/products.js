/* =========================================================
   PREP CLUB Admin — Produits, catégories, suppléments
   ========================================================= */
'use strict';

let prodFilter = { q: '', cat: 'all', state: 'all' };
const NUTRI_FIELDS = [['kcal', 'Énergie (kcal)'], ['fat', 'Matières grasses (g)'], ['sat', 'dont saturés (g)'], ['carbs', 'Glucides (g)'], ['sugars', 'dont sucres (g)'], ['protein', 'Protéines (g)'], ['fiber', 'Fibres (g)'], ['salt', 'Sel (g)']];

/* ================= LISTE ================= */
let prodView = 'grid';
AVIEWS.produits = {
  title: (id) => (id === 'nouveau' ? 'Ajouter un produit' : id ? ((AP(id) || {}).name || 'Modifier le produit') : 'Produits'),
  render(id) {
    if (id) return productForm(id === 'nouveau' ? null : AP(id));
    const live = ADM.products.filter((p) => p.status !== 'archived');
    const online = live.filter((p) => { const s = productState(p); return s.visible && !s.soldOut; }).length;
    const low = live.filter((p) => p.status === 'active' && (productState(p).soldOut || p.stock <= LOW_STOCK)).length;
    const review = live.filter((p) => p.review).length;
    const avgPrice = live.length ? live.reduce((a, p) => a + p.price, 0) / live.length : 0;
    return `<section class="kpis kpis--4">
        ${kpi({ label: 'Produits en ligne', value: `${online} / ${live.length}`, ic: 'box', sub: 'visibles et disponibles sur le site' })}
        ${kpi({ label: 'Stock bas ou épuisé', value: num(low), raw: low, ic: 'alert', tone: low ? 'tomato' : '', sub: `seuil d’alerte : ${LOW_STOCK} portions` })}
        ${kpi({ label: 'Fiches à valider', value: num(review), raw: review, ic: 'page', tone: 'saffron', sub: 'recettes modifiées' })}
        ${kpi({ label: 'Prix moyen', value: eur(avgPrice), raw: avgPrice, fmt: 'eur', ic: 'tag', tone: 'blue', sub: `${ADM.categories.length} catégories` })}
      </section>
      <div class="toolbar">
        <label class="search">${icon('search')}<input type="search" class="input" id="pSearch" placeholder="Rechercher un produit, un ingrédient…" value="${esc(prodFilter.q)}" aria-label="Rechercher"></label>
        <select class="input" id="pCat" aria-label="Catégorie"><option value="all">Toutes les catégories</option>${ADM.categories.map((c) => `<option value="${c.id}" ${prodFilter.cat === c.id ? 'selected' : ''}>${esc(c.label)}</option>`).join('')}</select>
        <select class="input" id="pState" aria-label="Statut">${[['all', 'Tous (hors archives)'], ['online', 'En ligne'], ['low', 'Stock bas ou épuisé'], ['off', 'Désactivés ou programmés'], ['review', 'Fiches à valider'], ['archived', 'Archivés']].map(([k, l]) => `<option value="${k}" ${prodFilter.state === k ? 'selected' : ''}>${l}</option>`).join('')}</select>
        <div class="toolbar__end"><a class="btn btn--ghost btn--sm" href="#/categories">${icon('grid')}Catégories</a><a class="btn btn--ghost btn--sm" href="#/supplements">${icon('plus')}Suppléments</a>${segmented('pview', [['grid', 'Grille', 'grid'], ['list', 'Liste', 'list']], prodView)}<button class="btn btn--ghost btn--sm" id="pCsv">${icon('download')}Exporter</button></div>
      </div>
      <p class="small muted" id="pInfo"></p>
      <div id="pBody"></div>`;
  },
  mount(id) {
    if (id) return mountProductForm(id === 'nouveau' ? null : AP(id));
    const filtered = () => {
      const q = fold(prodFilter.q);
      return ADM.products.filter((p) => {
        const st = productState(p);
        if (prodFilter.state === 'archived' ? p.status !== 'archived' : p.status === 'archived') return false;
        if (prodFilter.cat !== 'all' && p.cat !== prodFilter.cat) return false;
        if (prodFilter.state === 'online' && !(st.visible && !st.soldOut)) return false;
        if (prodFilter.state === 'low' && !(st.soldOut || p.stock <= LOW_STOCK)) return false;
        if (prodFilter.state === 'off' && st.visible) return false;
        if (prodFilter.state === 'review' && !p.review) return false;
        return !q || fold(`${p.name} ${p.ingredients} ${p.short}`).includes(q);
      });
    };
    const stockBar = (p) => `<div class="stockbar ${p.stock === 0 || p.soldOut ? 'out' : p.stock <= LOW_STOCK ? 'low' : ''}"><i style="width:${Math.min(100, (p.stock / 60) * 100)}%"></i></div>`;
    const draw = () => {
      const list = filtered();
      $('#pInfo').textContent = `${list.length} produit${list.length > 1 ? 's' : ''}`;
      if (!list.length) { $('#pBody').innerHTML = `<div class="panel">${emptyState('Aucun produit', 'Modifiez les filtres ou ajoutez un produit.', '<a href="#/produits/nouveau" class="btn btn--primary btn--sm">+ Ajouter un produit</a>')}</div>`; return; }
      if (prodView === 'grid') {
        $('#pBody').innerHTML = `<div class="pgrid">${list.map((p) => `<article class="pcard">
          <a class="pcard__media" href="#/produits/${p.id}" tabindex="-1" aria-hidden="true">${p.img ? `<img src="${imgUrl(p.img, 500)}" alt="" loading="lazy" onerror="this.style.visibility='hidden'">` : ''}</a>
          <div class="pcard__badges">${productStateBadge(p)}${p.review ? '<span class="st st--prep">À valider</span>' : ''}</div>
          <div class="pcard__body"><span class="pcard__cat">${esc(catLabel(p.cat))}</span><a class="pcard__name" href="#/produits/${p.id}">${esc(p.name)}</a>
            <span class="small muted">${p.weight} g · ${p.allergens.length ? esc(p.allergens.join(', ')) : 'sans allergène majeur'}</span>
            ${stockBar(p)}<span class="small muted">${p.stock} en stock</span>
            <div class="pcard__foot"><span class="pcard__price">${eur(p.price)}</span><label class="switch" title="${p.status === 'active' ? 'Désactiver' : 'Activer'} sur le site"><input type="checkbox" data-toggle="${p.id}" ${p.status === 'active' ? 'checked' : ''} ${p.status === 'archived' ? 'disabled' : ''}><span></span><span class="sr">En ligne</span></label></div>
          </div></article>`).join('')}</div>`;
      } else {
        $('#pBody').innerHTML = `<div class="table-wrap"><table class="data adm-table"><thead><tr><th>Produit</th><th>Catégorie</th><th class="num">Prix</th><th>Stock</th><th>Statut</th><th class="actions-col"><span class="sr">Actions</span></th></tr></thead><tbody>${list.map((p) => `<tr>
          <td><a class="prod-cell" href="#/produits/${p.id}">${thumb(p.img)}<span><strong>${esc(p.name)}</strong><span class="small muted">${p.weight} g · ${p.allergens.length ? esc(p.allergens.join(', ')) : 'sans allergène majeur'}</span></span></a></td>
          <td data-l="Catégorie">${esc(catLabel(p.cat))}</td>
          <td class="num" data-l="Prix"><input class="input input--inline" type="number" step="0.1" min="0" value="${p.price}" data-price="${p.id}" aria-label="Prix de ${esc(p.name)}"></td>
          <td data-l="Stock"><span style="display:flex;gap:8px;align-items:center"><input class="input input--inline" type="number" step="1" min="0" value="${p.stock}" data-stock="${p.id}" aria-label="Stock de ${esc(p.name)}"><span style="width:60px">${stockBar(p)}</span></span></td>
          <td data-l="Statut"><span>${productStateBadge(p)}${p.review ? ' <span class="st st--prep">À valider</span>' : ''}</span></td>
          <td class="actions-col"><label class="switch" title="${p.status === 'active' ? 'Désactiver' : 'Activer'} sur le site"><input type="checkbox" data-toggle="${p.id}" ${p.status === 'active' ? 'checked' : ''} ${p.status === 'archived' ? 'disabled' : ''}><span></span><span class="sr">En ligne</span></label><a href="#/produits/${p.id}" class="btn btn--ghost btn--xs">Modifier</a></td>
        </tr>`).join('')}</tbody></table></div>`;
      }
    };
    $('#pSearch').addEventListener('input', (e) => { prodFilter.q = e.target.value; draw(); });
    $('#pCat').addEventListener('change', (e) => { prodFilter.cat = e.target.value; draw(); });
    $('#pState').addEventListener('change', (e) => { prodFilter.state = e.target.value; draw(); });
    $$('[data-pview]').forEach((b) => b.addEventListener('click', () => { prodView = b.dataset.pview; rerender(); }));
    $('#pCsv').onclick = () => downloadCsv(`produits-${iso(new Date())}.csv`, [['Identifiant', 'Nom', 'Catégorie', 'Prix', 'Poids (g)', 'Stock', 'Statut', 'Allergènes'], ...filtered().map((p) => [p.id, p.name, catLabel(p.cat), csvNum(p.price), p.weight, p.stock, productState(p).label, p.allergens.join(' / ')])]);
    $('#pBody').addEventListener('change', (e) => {
      const t = e.target;
      const p = AP(t.dataset.price || t.dataset.stock || t.dataset.toggle);
      if (!p) return;
      if (t.dataset.price) { const v = round2(Math.max(0, Number(t.value))); p.price = v; p.updatedAt = new Date().toISOString(); saveAdmin(`Prix modifié : ${p.name} → ${eur(v)}`); }
      if (t.dataset.stock) { p.stock = Math.max(0, Math.round(Number(t.value))); saveAdmin(`Stock mis à jour : ${p.name} (${p.stock})`); }
      if (t.dataset.toggle) { p.status = t.checked ? 'active' : 'inactive'; saveAdmin(`${p.name} ${t.checked ? 'activé' : 'désactivé'} sur le site`); }
      draw(); renderBell();
    });
    draw();
  },
};

/* ================= FICHE PRODUIT ================= */
const blankProduct = () => ({
  id: '', cat: ADM.categories[0].id, name: '', price: 0, weight: 350, portions: 1, img: '', photos: [], tags: [], short: '', desc: '', ingredients: '', allergens: [], traces: '',
  nutri: { kcal: 0, fat: 0, sat: 0, carbs: 0, sugars: 0, protein: 0, fiber: 0, salt: 0 }, origin: [], suppliers: [], removable: [], season: '',
  storage: clone(STORAGE_DEFAULTS.lunch), prep: clone(PREP_DEFAULTS.lunch), supplements: true,
  status: 'inactive', soldOut: false, stock: 0, maxOrders: null, launchAt: '', endAt: '', pauseFrom: '', pauseTo: '', review: null, updatedAt: null,
});

function productForm(p) {
  if (p === undefined) return emptyState('Produit introuvable', 'Ce produit a peut-être été supprimé.', '<a class="btn btn--dark btn--sm" href="#/produits">Retour aux produits</a>');
  const isNew = !p;
  p = p || blankProduct();
  const f = (label, html, hint = '') => `<div class="field"><label>${label}</label>${html}${hint ? `<span class="hint">${hint}</span>` : ''}</div>`;
  const val = (v) => esc(v ?? '');
  const sold = DEMO.orders.filter((o) => isSale(o) && o.day >= iso(addDays(new Date(), -6))).reduce((a, o) => a + o.lines.filter((l) => l.pid === p.id).reduce((x, l) => x + l.qty, 0), 0);
  return `<form id="prodForm" class="form-layout" novalidate>
    <div class="form-main">
      ${p.review ? `<div class="notice notice--warn"><strong>Recette modifiée le ${fmtDate(p.review.since)}.</strong> Vérifiez les allergènes, les valeurs nutritionnelles et la provenance, puis validez la fiche. <button type="button" class="btn btn--dark btn--xs" id="validateReview">Valider la fiche</button></div>` : ''}
      <section class="panel"><h3>Informations générales</h3>
        ${f('Nom du produit', `<input class="input" name="name" required value="${val(p.name)}" placeholder="Ex. : Bol poulet teriyaki">`)}
        <div class="cols3">
          ${f('Catégorie', `<select class="input" name="cat">${ADM.categories.map((c) => `<option value="${c.id}" ${p.cat === c.id ? 'selected' : ''}>${esc(c.label)}</option>`).join('')}</select>`)}
          ${f('Prix (€ TTC)', `<input class="input" type="number" name="price" step="0.1" min="0" value="${p.price}" required>`)}
          ${f('Poids (g)', `<input class="input" type="number" name="weight" step="5" min="0" value="${p.weight}">`)}
        </div>
        <div class="cols3">
          ${f('Nombre de portions', `<input class="input" type="number" name="portions" min="1" step="1" value="${p.portions || 1}">`)}
          ${f('Sélections', `<div class="checks">${ADM.selections.map((s) => `<label class="check"><input type="checkbox" name="tags" value="${s.id}" ${p.tags.includes(s.id) ? 'checked' : ''}> ${esc(s.label)}</label>`).join('')}</div>`)}
          ${f('Collection de saison', `<select class="input" name="season"><option value="">Aucune</option>${Object.entries(ADM.collections).map(([k, c]) => `<option value="${k}" ${p.season === k ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}</select>`)}
        </div>
        ${f('Accroche (carte produit)', `<input class="input" name="short" maxlength="110" value="${val(p.short)}">`, '110 caractères maximum')}
        ${f('Description', `<textarea class="input" name="desc" rows="3">${val(p.desc)}</textarea>`)}
      </section>

      <section class="panel"><h3>Photographies</h3>
        <div class="photos" id="photos"></div>
        <div class="row">
          <label class="btn btn--ghost btn--sm file-btn">Importer une photo<input type="file" accept="image/*" id="photoFile" hidden></label>
          <input class="input" id="photoUrl" placeholder="ou coller l’adresse d’une image (https://…)" style="flex:1;min-width:220px">
          <button type="button" class="btn btn--dark btn--sm" id="photoAdd">Ajouter</button>
        </div>
        <p class="hint">La première photo est la photo principale. Les photos importées sont réduites automatiquement.</p>
      </section>

      <section class="panel"><h3>Composition & allergènes</h3>
        ${f('Ingrédients', `<textarea class="input" name="ingredients" rows="3" data-recipe>${val(p.ingredients)}</textarea>`, 'Liste complète, par ordre décroissant de poids. Mettre en évidence les allergènes.')}
        ${f('Allergènes (14 allergènes réglementaires)', `<div class="checks checks--grid">${ALLERGENS.map((a) => `<label class="check"><input type="checkbox" name="allergens" value="${a}" ${p.allergens.includes(a) ? 'checked' : ''}> ${a}</label>`).join('')}</div>`)}
        ${f('Traces / contamination croisée', `<input class="input" name="traces" value="${val(p.traces)}">`)}
      </section>

      <section class="panel"><h3>Valeurs nutritionnelles <span class="muted small">pour 100 g</span></h3>
        <div class="cols4">${NUTRI_FIELDS.map(([k, l]) => f(l, `<input class="input" type="number" step="0.1" min="0" name="n_${k}" value="${p.nutri[k]}">`)).join('')}</div>
        <p class="hint" id="nutriPortion"></p>
      </section>

      <section class="panel"><h3>Traçabilité</h3>
        ${f('Fournisseurs associés', `<div class="checks checks--grid">${ADM.producers.map((pr) => `<label class="check"><input type="checkbox" name="suppliers" value="${pr.id}" ${p.suppliers.includes(pr.id) ? 'checked' : ''}> ${esc(pr.name)} <span class="muted small">· ${esc(pr.type)}</span></label>`).join('')}</div>`)}
        <label class="label">Origine des ingrédients</label>
        <div id="origins"></div>
        <button type="button" class="btn btn--ghost btn--xs" id="addOrigin">+ Ajouter un ingrédient</button>
      </section>

      <section class="panel"><h3>Conservation & préparation</h3>
        <div class="cols3">
          ${f('Température', `<input class="input" name="st_temp" value="${val(p.storage.temp)}">`)}
          ${f('Après ouverture', `<input class="input" name="st_after" value="${val(p.storage.after)}">`)}
          ${f('Congélation', `<input class="input" name="st_freeze" value="${val(p.storage.freeze)}">`)}
        </div>
        <div class="cols3">
          ${f('Mode de réchauffage', `<input class="input" name="pr_method" value="${val(p.prep.method)}">`)}
          ${f('Temps', `<input class="input" name="pr_time" value="${val(p.prep.time)}">`)}
          ${f('Puissance', `<input class="input" name="pr_power" value="${val(p.prep.power)}">`)}
        </div>
        ${f('Emballage', `<input class="input" name="pr_pack" value="${val(p.prep.pack)}">`)}
        ${f('Conseil de dégustation', `<input class="input" name="pr_tip" value="${val(p.prep.tip)}">`)}
      </section>

      <section class="panel"><h3>Options de personnalisation</h3>
        <label class="check"><input type="checkbox" name="supplements" ${p.supplements !== false ? 'checked' : ''}> Proposer les suppléments sur ce produit <span class="muted small">(${['lunch', 'dinner'].includes(p.cat) ? 'portion, accompagnement, protéines' : p.cat === 'breakfast' ? 'toppings' : 'disponibles pour les déjeuners, dîners et petits-déjeuners'} · <a href="#/supplements" class="link">gérer les suppléments</a>)</span></label>
        ${f('Ingrédients que le client peut retirer', `<input class="input" name="removable" value="${val(p.removable.join(', '))}" placeholder="Ex. : Coriandre, Graines de sésame">`, 'Séparés par des virgules.')}
      </section>
    </div>

    <aside class="form-side">
      <section class="panel"><h3>Disponibilité</h3>
        ${f('Statut', `<select class="input" name="status"><option value="active" ${p.status === 'active' ? 'selected' : ''}>Activé (visible sur le site)</option><option value="inactive" ${p.status === 'inactive' ? 'selected' : ''}>Désactivé (masqué)</option><option value="archived" ${p.status === 'archived' ? 'selected' : ''}>Archivé</option></select>`)}
        <label class="check" style="margin-bottom:14px"><input type="checkbox" name="soldOut" ${p.soldOut ? 'checked' : ''}> Indiquer comme épuisé</label>
        <div class="cols2">
          ${f('Quantité en stock', `<input class="input" type="number" name="stock" min="0" step="1" value="${p.stock}">`)}
          ${f('Commandes max. / semaine', `<input class="input" type="number" name="maxOrders" min="0" step="1" value="${p.maxOrders ?? ''}" placeholder="Illimité">`)}
        </div>
        ${!isNew ? `<p class="hint" style="margin-top:-6px">${sold} portion${sold > 1 ? 's' : ''} vendue${sold > 1 ? 's' : ''} ces 7 derniers jours${p.maxOrders ? ` sur ${p.maxOrders} autorisées` : ''}.</p>` : ''}
        <div class="cols2">
          ${f('Date de lancement', `<input class="input" type="date" name="launchAt" value="${p.launchAt}">`)}
          ${f('Fin de commercialisation', `<input class="input" type="date" name="endAt" value="${p.endAt}">`)}
        </div>
        <label class="label">Indisponibilité temporaire</label>
        <div class="cols2">
          <input class="input" type="date" name="pauseFrom" value="${p.pauseFrom}" aria-label="Du">
          <input class="input" type="date" name="pauseTo" value="${p.pauseTo}" aria-label="Au">
        </div>
        <p class="hint">Le produit reste visible, marqué « indisponible » sur cette période.</p>
        <div id="stateNow" style="margin-top:12px"></div>
      </section>
      <section class="panel panel--sticky">
        <button class="btn btn--primary btn--block">${isNew ? 'Créer le produit' : 'Enregistrer les modifications'}</button>
        <a href="#/produits" class="btn btn--ghost btn--block btn--sm" style="margin-top:8px">Annuler</a>
        ${!isNew ? `<a href="index.html#/produit/${p.id}" target="_blank" rel="noopener" class="btn btn--ghost btn--block btn--sm" style="margin-top:8px">Voir sur le site ↗</a>
        <div class="danger-zone">
          ${p.status !== 'archived' ? '<button type="button" class="btn btn--ghost btn--sm" id="archiveBtn">Archiver</button>' : ''}
          <button type="button" class="btn btn--danger btn--sm" id="deleteBtn">Supprimer</button>
        </div>
        ${p.updatedAt ? `<p class="hint">Modifié ${ago(p.updatedAt)}</p>` : ''}` : ''}
      </section>
    </aside>
  </form>`;
}

function mountProductForm(p) {
  const form = $('#prodForm');
  if (!form) return;
  const isNew = !p;
  const draft = clone(p || blankProduct());
  draft.photos = [draft.img, ...(draft.photos || [])].filter(Boolean);
  const before = p ? JSON.stringify({ i: p.ingredients, n: p.nutri, a: p.allergens, o: p.origin }) : null;

  const drawPhotos = () => {
    $('#photos').innerHTML = draft.photos.length ? draft.photos.map((src, i) => `<figure class="photo ${i === 0 ? 'photo--main' : ''}">${thumb(src, 'photo__img')}
      <figcaption>${i === 0 ? '<span class="st st--done">Principale</span>' : `<button type="button" class="linkbtn" data-main="${i}">Mettre en principale</button>`}<button type="button" class="linkbtn danger" data-del="${i}" aria-label="Supprimer la photo">Retirer</button></figcaption></figure>`).join('') : '<p class="muted small">Aucune photo pour l’instant.</p>';
  };
  $('#photos').addEventListener('click', (e) => {
    const m = e.target.closest('[data-main]'); const d = e.target.closest('[data-del]');
    if (m) { const [x] = draft.photos.splice(Number(m.dataset.main), 1); draft.photos.unshift(x); }
    if (d) draft.photos.splice(Number(d.dataset.del), 1);
    drawPhotos();
  });
  $('#photoFile').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try { draft.photos.push(await readImage(file)); drawPhotos(); } catch (err) { toast('Image illisible'); }
    e.target.value = '';
  });
  $('#photoAdd').addEventListener('click', () => {
    const v = $('#photoUrl').value.trim();
    if (!v) return;
    if (!/^https?:\/\//.test(v) && !/^\d{10,}-[0-9a-f]+$/.test(v)) { toast('Adresse d’image invalide'); return; }
    draft.photos.push(v); $('#photoUrl').value = ''; drawPhotos();
  });

  const drawOrigins = () => {
    $('#origins').innerHTML = draft.origin.map((o, i) => `<div class="origin-row" data-o="${i}">
      <input class="input" data-k="ing" value="${esc(o.ing)}" placeholder="Ingrédient" aria-label="Ingrédient">
      <select class="input" data-k="producer" aria-label="Producteur"><option value="">Sans producteur partenaire</option>${ADM.producers.map((pr) => `<option value="${pr.id}" ${o.producer === pr.id ? 'selected' : ''}>${esc(pr.name)}</option>`).join('')}</select>
      <input class="input" data-k="region" value="${esc(o.region || '')}" placeholder="Région" aria-label="Région">
      <input class="input" data-k="country" value="${esc(o.country || '')}" placeholder="Pays" aria-label="Pays">
      <button type="button" class="close close--sm" data-rm="${i}" aria-label="Retirer">×</button></div>`).join('') || '<p class="muted small">Aucun ingrédient tracé.</p>';
  };
  $('#origins').addEventListener('input', (e) => {
    const row = e.target.closest('[data-o]');
    if (row && e.target.dataset.k) draft.origin[Number(row.dataset.o)][e.target.dataset.k] = e.target.value || (e.target.dataset.k === 'producer' ? null : '');
  });
  $('#origins').addEventListener('click', (e) => { const b = e.target.closest('[data-rm]'); if (b) { draft.origin.splice(Number(b.dataset.rm), 1); drawOrigins(); } });
  $('#addOrigin').addEventListener('click', () => { draft.origin.push({ ing: '', producer: null, region: '', country: 'France' }); drawOrigins(); });

  const nutriHint = () => {
    const w = Number(form.weight.value) || 0;
    $('#nutriPortion').textContent = `Par portion (${w} g) : ${Math.round((Number(form.n_kcal.value) * w) / 100)} kcal · ${Math.round((Number(form.n_protein.value) * w) / 10) / 10} g de protéines.`;
  };
  const stateNow = () => {
    const tmp = { ...draft, status: form.status.value, soldOut: form.soldOut.checked, stock: Number(form.stock.value), launchAt: form.launchAt.value, endAt: form.endAt.value, pauseFrom: form.pauseFrom.value, pauseTo: form.pauseTo.value };
    const s = productState(tmp);
    $('#stateNow').innerHTML = `<span class="small muted">Sur le site aujourd’hui :</span> ${productStateBadge(tmp)}${!s.visible ? ' <span class="small muted">(non affiché)</span>' : ''}`;
  };
  form.addEventListener('input', () => { nutriHint(); stateNow(); });
  drawPhotos(); drawOrigins(); nutriHint(); stateNow();

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const name = fd.get('name').trim();
    if (!name) { toast('Le nom du produit est obligatoire'); form.elements.name.focus(); return; }
    const price = Number(fd.get('price'));
    if (!(price > 0)) { toast('Indiquez un prix supérieur à 0 €'); form.price.focus(); return; }
    if (fd.get('launchAt') && fd.get('endAt') && fd.get('endAt') < fd.get('launchAt')) { toast('La fin de commercialisation précède le lancement'); return; }
    const out = {
      ...draft,
      name, price: round2(price), cat: fd.get('cat'), weight: Number(fd.get('weight')) || 0, portions: Math.max(1, Number(fd.get('portions')) || 1),
      tags: fd.getAll('tags'), season: fd.get('season') || undefined, short: fd.get('short').trim(), desc: fd.get('desc').trim(),
      ingredients: fd.get('ingredients').trim(), allergens: fd.getAll('allergens'), traces: fd.get('traces').trim(),
      nutri: Object.fromEntries(NUTRI_FIELDS.map(([k]) => [k, Number(fd.get(`n_${k}`)) || 0])),
      suppliers: fd.getAll('suppliers'), origin: draft.origin.filter((o) => o.ing.trim()),
      storage: { temp: fd.get('st_temp'), after: fd.get('st_after'), freeze: fd.get('st_freeze') },
      prep: { method: fd.get('pr_method'), time: fd.get('pr_time'), power: fd.get('pr_power'), pack: fd.get('pr_pack'), tip: fd.get('pr_tip') },
      supplements: fd.get('supplements') === 'on', removable: fd.get('removable').split(',').map((s) => s.trim()).filter(Boolean),
      status: fd.get('status'), soldOut: fd.get('soldOut') === 'on', stock: Math.max(0, Math.round(Number(fd.get('stock')) || 0)),
      maxOrders: fd.get('maxOrders') ? Math.max(0, Math.round(Number(fd.get('maxOrders')))) : null,
      launchAt: fd.get('launchAt'), endAt: fd.get('endAt'), pauseFrom: fd.get('pauseFrom'), pauseTo: fd.get('pauseTo'),
      img: draft.photos[0] || '', photos: draft.photos.slice(1), updatedAt: new Date().toISOString(),
    };
    if (!out.season) delete out.season;
    Object.keys(ADM.collections).forEach((k) => { const c = ADM.collections[k]; c.products = c.products.filter((id) => id !== out.id); });
    if (isNew) {
      let id = slugify(name) || `produit-${uid()}`;
      while (AP(id)) id = `${slugify(name)}-${uid().slice(0, 3)}`;
      out.id = id;
      ADM.products.push(out);
    } else {
      const recipeChanged = before !== JSON.stringify({ i: out.ingredients, n: out.nutri, a: out.allergens, o: out.origin });
      if (recipeChanged && !p.review) out.review = { since: iso(new Date()) };
      Object.assign(p, out);
    }
    if (out.season && ADM.collections[out.season]) ADM.collections[out.season].products.push(out.id);
    if (!saveAdmin(isNew ? `Produit créé : ${name}` : `Produit mis à jour : ${name}`)) return;
    location.hash = '#/produits';
  });

  const vr = $('#validateReview');
  if (vr) vr.onclick = () => { p.review = null; saveAdmin(`Fiche validée : ${p.name}`); rerender(); };
  const ab = $('#archiveBtn');
  if (ab) ab.onclick = () => confirmModal('Archiver ce produit ?', `« ${esc(p.name)} » disparaîtra du site et de la liste des produits. Vous pourrez le restaurer depuis le filtre « Archivés ».`, 'Archiver', () => { p.status = 'archived'; saveAdmin(`Produit archivé : ${p.name}`); location.hash = '#/produits'; });
  const db = $('#deleteBtn');
  if (db) db.onclick = () => confirmModal('Supprimer définitivement ?', `« ${esc(p.name)} » sera supprimé du catalogue, des menus et des collections. Cette action est irréversible. Préférez l’archivage pour garder l’historique.`, 'Supprimer', () => {
    ADM.products = ADM.products.filter((x) => x !== p);
    ADM.weeklyMenus.forEach((m) => { m.items = m.items.filter((id) => id !== p.id); });
    Object.values(ADM.collections).forEach((c) => { c.products = c.products.filter((id) => id !== p.id); });
    saveAdmin(`Produit supprimé : ${p.name}`);
    location.hash = '#/produits';
  });
}

/* ================= CATÉGORIES ================= */
AVIEWS.categories = {
  title: 'Catégories',
  render() {
    const block = (title, text, list, kind) => `<section class="panel"><div class="panel__head"><div><h3>${title}</h3><p class="small muted">${text}</p></div></div>
      <ul class="cat-list">${list.map((c) => {
        const n = ADM.products.filter((p) => p.status !== 'archived' && (kind === 'meal' ? p.cat === c.id : p.tags.includes(c.id))).length;
        return `<li><input class="input" value="${esc(c.label)}" data-rename="${kind}:${c.id}" aria-label="Nom de la catégorie"><span class="muted small">${n} produit${n > 1 ? 's' : ''}</span><button class="btn btn--ghost btn--xs" data-delcat="${kind}:${c.id}">Supprimer</button></li>`;
      }).join('')}</ul>
      <form class="inline-add" data-addcat="${kind}"><input class="input" name="label" placeholder="Nouvelle catégorie" required><button class="btn btn--dark btn--sm">Ajouter</button></form></section>`;
    return `<div class="grid2">${block('Catégories de repas', 'Chaque produit appartient à une catégorie. Elles forment les filtres principaux de la carte.', ADM.categories, 'meal')}
      ${block('Sélections', 'Mises en avant transversales (meilleures ventes, nouveautés…). Un produit peut figurer dans plusieurs sélections.', ADM.selections, 'selection')}</div>`;
  },
  mount() {
    const listOf = (kind) => (kind === 'meal' ? ADM.categories : ADM.selections);
    $$('[data-rename]').forEach((i) => i.addEventListener('change', () => {
      const [kind, id] = i.dataset.rename.split(':');
      const c = listOf(kind).find((x) => x.id === id);
      const v = i.value.trim();
      if (!v) { i.value = c.label; return; }
      c.label = v; saveAdmin(`Catégorie renommée : ${v}`);
    }));
    $$('[data-delcat]').forEach((b) => b.addEventListener('click', () => {
      const [kind, id] = b.dataset.delcat.split(':');
      const list = listOf(kind);
      const c = list.find((x) => x.id === id);
      if (kind === 'meal') {
        const used = ADM.products.filter((p) => p.cat === id && p.status !== 'archived');
        if (used.length) { toast(`Impossible : ${used.length} produit(s) utilisent « ${c.label} ». Changez-les de catégorie d’abord.`); return; }
        if (list.length === 1) { toast('Gardez au moins une catégorie'); return; }
      }
      confirmModal('Supprimer cette catégorie ?', `« ${esc(c.label)} » ne sera plus proposée sur le site.${kind === 'selection' ? ' Les produits concernés en seront retirés.' : ''}`, 'Supprimer', () => {
        list.splice(list.indexOf(c), 1);
        if (kind === 'selection') ADM.products.forEach((p) => { p.tags = p.tags.filter((t) => t !== id); });
        saveAdmin(`Catégorie supprimée : ${c.label}`); rerender();
      });
    }));
    $$('[data-addcat]').forEach((f) => f.addEventListener('submit', (e) => {
      e.preventDefault();
      const kind = f.dataset.addcat;
      const label = f.label.value.trim();
      const id = slugify(label);
      if (!id) return;
      if (ADM.categories.some((c) => c.id === id) || ADM.selections.some((c) => c.id === id) || id === 'weekly' || id === 'all') { toast('Cette catégorie existe déjà'); return; }
      listOf(kind).push({ id, label, kind });
      saveAdmin(`Catégorie créée : ${label}`); rerender();
    }));
  },
};

/* ================= SUPPLÉMENTS ================= */
AVIEWS.supplements = {
  title: 'Suppléments',
  render() {
    const O = ADM.options;
    const rows = (group, list) => list.filter((x) => x.id !== 'none').map((x) => `<li><input class="input" value="${esc(x.label)}" data-sup="${group}:${x.id}:label" aria-label="Nom"><span class="price-input"><input class="input" type="number" step="0.1" min="0" value="${x.price}" data-sup="${group}:${x.id}:price" aria-label="Prix"> €</span><button class="close close--sm" data-supdel="${group}:${x.id}" aria-label="Supprimer">×</button></li>`).join('');
    const sugg = (group, items) => items.filter(([l]) => !(group === 'sides' ? O.main.sides : O.breakfast.toppings).some((x) => x.label === l)).map(([l, pr]) => `<button class="chip chip--btn" data-sugg="${group}:${esc(l)}:${pr}">+ ${esc(l)}</button>`).join('');
    const generous = O.main.portion.find((x) => x.id === 'generous');
    return `<p class="muted intro">Les suppléments s’ajoutent automatiquement au prix sur le site. Un supplément à 0 € est proposé gratuitement.</p>
    <div class="grid2">
      <section class="panel"><h3>Déjeuners & dîners</h3>
        <div class="sup-row"><label for="supGen">Portion plus grande · libellé</label><input class="input" id="supGen" value="${esc(generous ? generous.label : '')}"><span class="price-input"><input class="input" type="number" step="0.1" min="0" id="supGenPrice" value="${generous ? generous.price : 0}" aria-label="Prix portion"> €</span></div>
        <div class="sup-row"><label for="supProt">Protéines supplémentaires</label><span></span><span class="price-input"><input class="input" type="number" step="0.1" min="0" id="supProt" value="${O.main.extraProtein}" aria-label="Prix protéines"> €</span></div>
        <h4>Accompagnements & extras</h4>
        <ul class="sup-list">${rows('sides', O.main.sides)}</ul>
        <form class="inline-add" data-supadd="sides"><input class="input" name="label" placeholder="Nouveau supplément" required><input class="input input--price" name="price" type="number" step="0.1" min="0" value="0" aria-label="Prix"><button class="btn btn--dark btn--sm">Ajouter</button></form>
        <div class="chips" style="margin-top:10px">${sugg('sides', [['Légumes supplémentaires', 1.5], ['Sauce supplémentaire', 0.8], ['Accompagnement du jour', 2.5]])}</div>
      </section>
      <section class="panel"><h3>Petits-déjeuners</h3>
        <h4>Toppings</h4>
        <ul class="sup-list">${rows('toppings', O.breakfast.toppings)}</ul>
        <form class="inline-add" data-supadd="toppings"><input class="input" name="label" placeholder="Nouveau topping" required><input class="input input--price" name="price" type="number" step="0.1" min="0" value="0" aria-label="Prix"><button class="btn btn--dark btn--sm">Ajouter</button></form>
        <div class="chips" style="margin-top:10px">${sugg('toppings', [['Miel', 0.5], ['Graines de chia', 0.6]])}</div>
        <div class="notice">Exemple sur le site : Poulet, riz & légumes rôtis (${eur((AP('chicken-rice-veg') || { price: 10.9 }).price)}) + protéines (${eur(O.main.extraProtein)}) = <strong>${eur(((AP('chicken-rice-veg') || { price: 10.9 }).price) + O.main.extraProtein)}</strong></div>
      </section>
    </div>`;
  },
  mount() {
    const O = ADM.options;
    const listOf = (g) => (g === 'sides' ? O.main.sides : O.breakfast.toppings);
    const add = (g, label, price) => {
      const list = listOf(g);
      let id = slugify(label) || uid();
      if (list.some((x) => x.id === id)) id = `${id}-${uid().slice(0, 3)}`;
      list.push({ id, label, price: round2(Math.max(0, price)) });
      saveAdmin(`Supplément ajouté : ${label}`); rerender();
    };
    $$('[data-sup]').forEach((i) => i.addEventListener('change', () => {
      const [g, id, k] = i.dataset.sup.split(':');
      const x = listOf(g).find((y) => y.id === id);
      if (k === 'label') { if (!i.value.trim()) { i.value = x.label; return; } x.label = i.value.trim(); } else x.price = round2(Math.max(0, Number(i.value)));
      saveAdmin(`Supplément modifié : ${x.label}`);
    }));
    $$('[data-supdel]').forEach((b) => b.addEventListener('click', () => {
      const [g, id] = b.dataset.supdel.split(':');
      const list = listOf(g);
      const x = list.find((y) => y.id === id);
      list.splice(list.indexOf(x), 1);
      saveAdmin(`Supplément supprimé : ${x.label}`); rerender();
    }));
    $$('[data-supadd]').forEach((f) => f.addEventListener('submit', (e) => { e.preventDefault(); add(f.dataset.supadd, f.label.value.trim(), Number(f.price.value)); }));
    $$('[data-sugg]').forEach((b) => b.addEventListener('click', () => { const [g, l, pr] = b.dataset.sugg.split(':'); add(g, l, Number(pr)); }));
    $('#supGen').addEventListener('change', (e) => { const g = O.main.portion.find((x) => x.id === 'generous'); if (g && e.target.value.trim()) { g.label = e.target.value.trim(); saveAdmin('Portion plus grande modifiée'); } });
    $('#supGenPrice').addEventListener('change', (e) => { const g = O.main.portion.find((x) => x.id === 'generous'); if (g) { g.price = round2(Math.max(0, Number(e.target.value))); saveAdmin(`Portion plus grande : ${eur(g.price)}`); } });
    $('#supProt').addEventListener('change', (e) => { O.main.extraProtein = round2(Math.max(0, Number(e.target.value))); saveAdmin(`Protéines supplémentaires : ${eur(O.main.extraProtein)}`); rerender(); });
  },
};
