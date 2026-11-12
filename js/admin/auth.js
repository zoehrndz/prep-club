/* =========================================================
   PREP CLUB CRM — Accès de démonstration
   Projet étudiant : le CRM s'ouvre sans vrai compte, sans
   identifiant ni mot de passe (aucun mot de passe dans le code).
   Il ne contient que des données fictives, stockées dans le navigateur.
   ========================================================= */
'use strict';

const CRM_OUT_KEY = 'prepclub:crm-signed-out';
const DEMO_ID = 'Compte démo';

function requireAdmin(onReady) {
  const gate = document.getElementById('authGate');
  const done = () => {
    try { sessionStorage.removeItem(CRM_OUT_KEY); } catch (e) { /* stockage indisponible */ }
    document.body.classList.remove('locked');
    gate.hidden = true;
    gate.innerHTML = '';
    document.querySelectorAll('[data-admin-id]').forEach((el) => { el.textContent = DEMO_ID; });
    const acc = document.getElementById('accBtn');
    if (acc) acc.hidden = true;
    onReady(DEMO_ID);
  };
  let out = false;
  try { out = sessionStorage.getItem(CRM_OUT_KEY) === '1'; } catch (e) { out = false; }
  if (!out) { done(); return; }

  // Après « Se déconnecter » : écran d'accès, sans identifiant à saisir
  document.body.classList.add('locked');
  gate.hidden = false;
  gate.innerHTML = `<div class="auth__card">
    <div class="auth__brand"><span class="auth__logo">PREP<em>CLUB</em></span><span class="auth__tag">CRM</span></div>
    <h1>Accès de démonstration</h1>
    <p class="auth__lead">Aucun identifiant ni mot de passe n’est nécessaire : ce CRM est un projet étudiant INSEEC et ne contient que des données fictives.</p>
    <button type="button" class="btn btn--primary btn--block" id="demoEnter">Entrer dans le CRM</button>
    <p class="auth__foot"><a href="index.html">← Retour au site</a></p>
  </div>`;
  document.getElementById('demoEnter').addEventListener('click', done);
}

function adminLogout() {
  try { sessionStorage.setItem(CRM_OUT_KEY, '1'); } catch (e) { /* stockage indisponible */ }
  location.hash = '';
  location.reload();
}

/* Le bouton « Identifiant & mot de passe » est masqué en démo ; cette fenêtre reste par sécurité. */
function accountModal() {
  openModal(`<span class="eyebrow">Accès</span><h3>Accès de démonstration</h3>
    <p class="muted">Ce CRM ne demande aucun identifiant : c’est une démonstration avec des données fictives. Dans une version commercialisée, l’accès passerait par une authentification sécurisée côté serveur.</p>
    <div class="row" style="justify-content:flex-end"><button class="btn btn--primary btn--sm" data-close-modal>Compris</button></div>`);
}
