/* =========================================================
   PREP CLUB Admin — Livraison, promotions, box & données
   ========================================================= */
'use strict';

AVIEWS.reglages = {
  title: 'Réglages',
  render() {
    const D = ADM.delivery;
    const B = ADM.boxRules;
    return `<div class="grid2">
      <form class="panel" id="delivForm"><h3>Livraison & retrait</h3>
        <div class="cols3">
          <div class="field"><label>Frais de livraison (€)</label><input class="input" type="number" step="0.1" min="0" name="homeFee" value="${D.homeFee}"></div>
          <div class="field"><label>Offerte dès (€)</label><input class="input" type="number" step="1" min="0" name="freeFrom" value="${D.freeFrom}"></div>
          <div class="field"><label>Offerte dès — Premium (€)</label><input class="input" type="number" step="1" min="0" name="premiumFreeFrom" value="${D.premiumFreeFrom}"></div>
        </div>
        <div class="field"><label>Codes postaux livrés</label><textarea class="input" name="zones" rows="3">${esc(D.zones.join(', '))}</textarea><span class="hint">${D.zones.length} codes postaux, séparés par des virgules.</span></div>
        <div class="cols2">
          <div class="field"><label>Créneaux de livraison</label><textarea class="input" name="homeSlots" rows="3">${esc(D.homeSlots.join('\n'))}</textarea><span class="hint">Un par ligne.</span></div>
          <div class="field"><label>Créneaux de retrait</label><textarea class="input" name="pickupSlots" rows="3">${esc(D.pickupSlots.join('\n'))}</textarea></div>
        </div>
        <label class="label">Points de retrait</label>
        <div id="points">${D.pickupPoints.map((p, i) => `<div class="origin-row origin-row--3" data-pt="${i}"><input class="input" data-k="name" value="${esc(p.name)}" aria-label="Nom"><input class="input" data-k="address" value="${esc(p.address)}" aria-label="Adresse"><button type="button" class="close close--sm" data-rmpt="${i}" aria-label="Retirer">×</button></div>`).join('')}</div>
        <button type="button" class="btn btn--ghost btn--xs" id="addPt">+ Ajouter un point de retrait</button>
        <div style="margin-top:16px"><button class="btn btn--primary btn--sm">Enregistrer la livraison</button></div>
      </form>

      <div>
        <section class="panel"><h3>Codes promo</h3>
          <table class="data"><thead><tr><th>Code</th><th>Libellé</th><th class="num">Remise</th><th></th></tr></thead><tbody>
          ${Object.entries(ADM.promos).map(([code, p]) => `<tr><td><strong>${esc(code)}</strong></td><td>${esc(p.label)}</td><td class="num">${pct(p.pct)}</td><td class="num"><button class="close close--sm" data-rmpromo="${esc(code)}" aria-label="Supprimer ${esc(code)}">×</button></td></tr>`).join('') || '<tr><td colspan="4" class="muted">Aucun code actif.</td></tr>'}
          </tbody></table>
          <form class="inline-add inline-add--promo" id="promoForm"><input class="input" name="code" placeholder="CODE" required style="text-transform:uppercase" aria-label="Code"><input class="input" name="label" placeholder="Libellé" required aria-label="Libellé"><input class="input input--price" type="number" name="pct" min="1" max="90" value="10" aria-label="Remise en %"><span>%</span><button class="btn btn--dark btn--sm">Ajouter</button></form>
        </section>

        <form class="panel" id="boxForm"><h3>Composer ma box</h3>
          <div class="cols2"><div class="field"><label>Minimum de portions</label><input class="input" type="number" min="1" name="minItems" value="${B.minItems}"></div><div class="field"><label>Maximum de portions</label><input class="input" type="number" min="1" name="maxItems" value="${B.maxItems}"></div></div>
          <label class="label">Remises par palier</label>
          ${B.tiers.map((t, i) => `<div class="row tier-row">dès <input class="input input--price" type="number" min="1" name="tmin${i}" value="${t.min}" aria-label="Palier"> portions : <input class="input input--price" type="number" min="0" max="50" name="tpct${i}" value="${Math.round(t.pct * 100)}" aria-label="Remise"> %</div>`).join('')}
          <button class="btn btn--primary btn--sm" style="margin-top:12px">Enregistrer</button>
        </form>

        <section class="panel"><h3>Données du back-office</h3>
          <p class="small muted">Prototype : les modifications sont enregistrées dans ce navigateur. Exportez-les pour les sauvegarder ou les transmettre à votre développeur.</p>
          <div class="row"><button class="btn btn--ghost btn--sm" id="exportBtn">Exporter (JSON)</button><label class="btn btn--ghost btn--sm file-btn">Importer<input type="file" accept="application/json" id="importFile" hidden></label><button class="btn btn--danger btn--sm" id="resetBtn">Réinitialiser</button></div>
          ${ADM.log.length ? `<h4 style="margin-top:18px">Historique des modifications</h4><ul class="plain small">${ADM.log.slice(0, 10).map((l) => `<li><span class="muted">${fmtDT(l.date)}</span> · ${esc(l.msg)}</li>`).join('')}</ul>` : ''}
        </section>
      </div>
    </div>`;
  },
  mount() {
    const D = ADM.delivery;
    const pts = clone(D.pickupPoints);
    const lines = (s) => s.split('\n').map((x) => x.trim()).filter(Boolean);
    $('#points').addEventListener('input', (e) => { const r = e.target.closest('[data-pt]'); if (r) pts[Number(r.dataset.pt)][e.target.dataset.k] = e.target.value; });
    $('#points').addEventListener('click', (e) => { const b = e.target.closest('[data-rmpt]'); if (b) { pts.splice(Number(b.dataset.rmpt), 1); b.parentElement.remove(); } });
    $('#addPt').onclick = () => { D.pickupPoints = pts; pts.push({ id: uid(), name: 'Nouveau point de retrait', address: '' }); saveAdmin(); rerender(); };
    $('#delivForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const f = e.target;
      const zones = f.zones.value.split(/[\s,;]+/).filter((z) => /^\d{5}$/.test(z));
      if (!zones.length) { toast('Indiquez au moins un code postal à 5 chiffres'); return; }
      if (!pts.filter((p) => p.name.trim()).length) { toast('Gardez au moins un point de retrait'); return; }
      Object.assign(D, {
        homeFee: round2(Math.max(0, Number(f.homeFee.value))), freeFrom: Math.max(0, Number(f.freeFrom.value)), premiumFreeFrom: Math.max(0, Number(f.premiumFreeFrom.value)),
        zones: [...new Set(zones)], homeSlots: lines(f.homeSlots.value), pickupSlots: lines(f.pickupSlots.value), pickupPoints: pts.filter((p) => p.name.trim()),
      });
      saveAdmin('Paramètres de livraison enregistrés'); rerender();
    });
    $$('[data-rmpromo]').forEach((b) => b.onclick = () => { delete ADM.promos[b.dataset.rmpromo]; saveAdmin(`Code ${b.dataset.rmpromo} supprimé`); rerender(); });
    $('#promoForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const f = e.target;
      const code = f.code.value.trim().toUpperCase().replace(/\s+/g, '');
      if (!/^[A-Z0-9]{3,20}$/.test(code)) { toast('Code : 3 à 20 lettres ou chiffres'); return; }
      ADM.promos[code] = { label: f.label.value.trim(), pct: Math.min(0.9, Math.max(0.01, Number(f.pct.value) / 100)) };
      saveAdmin(`Code ${code} créé`); rerender();
    });
    $('#boxForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const f = e.target;
      const min = Math.max(1, Number(f.minItems.value)); const max = Math.max(min, Number(f.maxItems.value));
      ADM.boxRules.minItems = min; ADM.boxRules.maxItems = max;
      ADM.boxRules.tiers = ADM.boxRules.tiers.map((t, i) => ({ min: Math.max(1, Number(f[`tmin${i}`].value)), pct: Math.min(0.5, Math.max(0, Number(f[`tpct${i}`].value) / 100)) })).sort((a, b) => a.min - b.min);
      saveAdmin('Règles de la box enregistrées'); rerender();
    });
    $('#exportBtn').onclick = () => downloadFile(`prepclub-backoffice-${iso(new Date())}.json`, JSON.stringify(ADM, null, 2), 'application/json');
    $('#importFile').onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      try {
        const data = JSON.parse(await file.text());
        if (!Array.isArray(data.products) || !Array.isArray(data.categories) || !data.options) throw new Error('format');
        ADM = { ...seedAdmin(), ...data };
        saveAdmin('Données importées'); rerender();
      } catch (err) { toast('Fichier invalide : exportez-le depuis ce back-office'); }
    };
    $('#resetBtn').onclick = () => confirmModal('Réinitialiser le back-office ?', 'Toutes les modifications (produits, menus, prix, réglages, statuts de commandes) seront effacées et le site reviendra au catalogue d’origine. Exportez vos données avant si besoin.', 'Tout réinitialiser', () => {
      try { localStorage.removeItem(ADMIN_KEY); } catch (err) { /* stockage indisponible */ }
      ADM = seedAdmin(); toast('Back-office réinitialisé'); rerender();
    });
  },
};
