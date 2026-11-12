/* =========================================================
   PREP CLUB — Pages de contenu
   Our Story · Club · Loyalty · Producers · Contact · FAQ
   Delivery · Terms · Privacy · Legal
   ========================================================= */
'use strict';

VIEWS.story = {
  title: 'Notre histoire — PREP CLUB',
  render() {
    return `${pageHero({ eyebrow: 'Notre histoire', title: 'Moins de temps en cuisine, plus de temps pour vous.', text: 'PREP CLUB est né d’un constat simple : bien manger toute la semaine demande du temps, de l’organisation et de l’anticipation. Nous nous occupons de tout cela pour vous.', img: IMG.cooking, crumbs: 'Notre histoire' })}
    <section class="section"><div class="container split">
      <div>
        <span class="eyebrow">Le concept</span>
        <h2>Des repas préparés, sans les contraintes</h2>
        <p class="muted">Contrairement aux services reposant uniquement sur des box prédéfinies ou des abonnements obligatoires, PREP CLUB vous laisse choisir : un plat à l’unité, une formule, une box composée par vos soins, ou une semaine entière organisée avec le planning de la semaine.</p>
        <p class="muted">Nos plats sont préparés à Lyon à partir d’ingrédients sélectionnés, en privilégiant les producteurs de la région chaque fois que c’est possible. Petit-déjeuner, déjeuner, dîner, en-cas et desserts : toute votre journée peut être prête à l’avance.</p>
        <a href="#/carte" class="btn btn--primary">Découvrir la carte</a>
      </div>
      <div class="season-img">${pic(IMG.heroAlt, 'Plats PREP CLUB', 1000)}</div>
    </div></section>
    <section class="section section--cream"><div class="container">
      <div class="section-head"><div><span class="eyebrow">Nos piliers</span><h2>Quatre engagements</h2></div></div>
      <div class="grid g4">
        <div class="pillar"><b>Flexibilité</b><p class="muted small">Chacun organise ses repas comme il le souhaite, sans obligation d’abonnement.</p></div>
        <div class="pillar"><b>Qualité</b><p class="muted small">Des ingrédients sélectionnés et des recettes gourmandes, variées, renouvelées au fil des saisons.</p></div>
        <div class="pillar"><b>Transparence</b><p class="muted small">Ingrédients, valeurs nutritionnelles, allergènes et provenance détaillés sur chaque fiche produit.</p></div>
        <div class="pillar"><b>Proximité</b><p class="muted small">Une priorité donnée aux producteurs locaux et régionaux, toujours avec justificatifs.</p></div>
      </div>
    </div></section>
    <section class="section"><div class="container">
      <div class="section-head"><div><span class="eyebrow">Notre fonctionnement</span><h2>De la commande à votre réfrigérateur</h2></div></div>
      <div class="grid g4 how">
        <div class="how__step"><h3>Planification</h3><p>Les quantités sont calculées à partir des commandes et de notre capacité de production.</p></div>
        <div class="how__step"><h3>Approvisionnement</h3><p>Achats auprès de nos fournisseurs, avec traçabilité des lots et des origines.</p></div>
        <div class="how__step"><h3>Préparation</h3><p>Cuisine, conditionnement et étiquetage dans notre atelier lyonnais, selon les règles d’hygiène.</p></div>
        <div class="how__step"><h3>Livraison</h3><p>Transport réfrigéré jusqu’à votre porte, ou retrait sur place.</p></div>
      </div>
    </div></section>`;
  },
};

VIEWS.club = {
  title: 'L’abonnement Club — PREP CLUB',
  render() {
    const m = S.membership;
    return `${pageHero({ eyebrow: 'L’abonnement Club', title: 'Récompensé quand vous revenez. Libre quand vous partez.', text: 'Un abonnement facultatif pour les clients réguliers : remises sur chaque commande, avantages exclusifs, et une totale liberté de commande.', img: IMG.breakfastSpread, crumbs: 'L’abonnement Club' })}
    <section class="section"><div class="container">
      ${m ? `<div class="notice notice--ok" style="margin-bottom:24px">Vous êtes membre ${MEMBERSHIPS.find((x) => x.id === m.tier).name}. <a href="#/mon-compte/abonnement" class="link">Gérer mon abonnement</a></div>` : ''}
      <div class="grid g3">${MEMBERSHIPS.map((t) => tierCard(t, true)).join('')}</div>
      <p class="small muted" style="margin-top:16px">Tarifs, réductions et avantages indicatifs : ils seront définis après étude des coûts et des marges.</p>
    </div></section>
    <section class="section section--cream"><div class="container split">
      <div><span class="eyebrow">Sans engagement</span><h2>Vous gardez la main</h2><p class="muted">L’abonnement n’impose aucune commande minimum ni box obligatoire. Vous continuez à commander quand vous le souhaitez, à la carte ou en formule, et la remise s’applique automatiquement.</p></div>
      <div class="faq">
        <details open><summary>Puis-je suspendre mon abonnement ?</summary><p>Oui, depuis Mon abonnement, de 1 semaine à 2 mois. Aucun prélèvement pendant la pause.</p></details>
        <details><summary>Comment résilier ?</summary><p>En un clic depuis votre espace client, sans frais. Vos avantages restent actifs jusqu’à la fin de la période payée.</p></details>
        <details><summary>Quand suis-je prélevé·e ?</summary><p>Chaque mois à date anniversaire. Un rappel est envoyé 7 jours avant chaque échéance.</p></details>
        <details><summary>Puis-je changer d’offre ?</summary><p>Oui, à tout moment depuis Mon abonnement. La nouvelle remise s’applique immédiatement.</p></details>
      </div>
    </div></section>`;
  },
};

VIEWS.loyalty = {
  title: 'Programme de fidélité — PREP CLUB',
  render() {
    return `${pageHero({ eyebrow: 'Programme de fidélité', title: 'Chaque commande vous rapporte', text: '1 € dépensé = 1 point (jusqu’à 2 points pour les membres du Club). Échangez vos points contre des réductions, des produits offerts et des avantages exclusifs.', crumbs: 'Programme de fidélité' })}
    <section class="section"><div class="container">
      <div class="grid g4">${REWARDS.map((r) => `<div class="pillar"><b>${r.points} pts</b><p class="muted small">${r.label}</p></div>`).join('')}</div>
      <div class="grid g3" style="margin-top:48px">
        <div class="how__step"><h3>Cumulez</h3><p>Des points sur chaque commande, multipliés pour les membres du Club (×1,5 Essentiel, ×2 Plus et Premium).</p></div>
        <div class="how__step"><h3>Échangez</h3><p>Depuis Mes récompenses, appliquez une récompense à votre prochain panier en un clic.</p></div>
        <div class="how__step"><h3>Parrainez</h3><p>10 € offerts à vos proches sur leur première commande, 100 points pour vous.</p></div>
      </div>
      <div class="center" style="margin-top:40px"><a href="#/mon-compte/recompenses" class="btn btn--primary">Voir mes points</a></div>
      <p class="small muted center" style="margin-top:20px">Points valables 12 mois après la dernière commande, non convertibles en argent, une récompense par commande. Détails dans les <a href="#/cgv" class="link">CGV</a>.</p>
    </div></section>`;
  },
};

VIEWS.producers = {
  title: 'Nos producteurs — PREP CLUB',
  render() {
    return `${pageHero({ eyebrow: 'Nos producteurs', title: 'Ceux qui font nos plats', text: 'Nous privilégions les producteurs locaux et régionaux lorsque c’est possible, et indiquons l’origine de chaque ingrédient sur nos fiches produits.', img: IMG.market, crumbs: 'Nos producteurs' })}
    <section class="section"><div class="container">
      <div class="notice notice--warn" style="margin-bottom:32px">Projet étudiant : les producteurs ci-dessous sont des exemples fictifs qui illustrent la démarche. Aucune mention « local », « français » ou « issu de producteurs partenaires » n’est utilisée sans justificatif.</div>
      <div class="stack" style="--gap:32px">
        ${PRODUCERS.map((pr) => {
          const dishes = PRODUCTS.filter((p) => p.origin.some((o) => o.producer === pr.id));
          return `<article class="producer" id="${pr.id}" style="display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.4fr);margin-bottom:24px">
            <div class="media" style="aspect-ratio:auto;min-height:260px">${pic(pr.img, pr.name, 900)}</div>
            <div class="producer__body" style="padding:28px">
              <div class="producer__loc">📍 ${esc(pr.location)} · ${esc(pr.dept)} · à ${pr.distance} de Lyon</div>
              <h3 style="font-size:1.5rem">${esc(pr.name)}</h3>
              <p class="small muted">${esc(pr.type)}</p>
              <p>${esc(pr.bio)}</p>
              <p class="small"><strong>Produits fournis :</strong> ${pr.products.map(esc).join(', ')}</p>
              <p class="small"><strong>Méthodes de production :</strong> ${esc(pr.methods)}</p>
              ${dishes.length ? `<p class="small" style="margin-bottom:8px"><strong>Dans nos plats :</strong></p><div class="chips">${dishes.map((d) => `<a href="#/produit/${d.id}" class="chip small" style="text-decoration:none">${esc(d.name)}</a>`).join('')}</div>` : ''}
            </div>
          </article>`;
        }).join('')}
      </div>
    </div></section>
    <section class="section section--cream"><div class="container split">
      <div><span class="eyebrow">Traçabilité</span><h2>Ce que nous suivons en interne</h2><p class="muted">Pour chaque ingrédient, nous conservons le fournisseur, le lot, la date de réception, l’origine et les recettes concernées. Les informations affichées sur le site sont mises à jour lorsque nos approvisionnements changent.</p></div>
      <div class="chips">${['Fournisseurs', 'Ingrédients', 'Lots', 'Dates de réception', 'Origines', 'Recettes concernées'].map((x) => `<span class="chip">${x}</span>`).join('')}</div>
    </div></section>`;
  },
};

VIEWS.contact = {
  title: 'Contact — PREP CLUB',
  render() {
    return `${pageHero({ eyebrow: 'Contact', title: 'Une question ? Écrivez-nous.', text: 'Notre équipe vous répond du lundi au vendredi, sous 24 h ouvrées.', crumbs: 'Contact' })}
    <section class="section"><div class="container split" style="align-items:start">
      <form class="panel" id="contactForm">
        <div class="form-grid">
          <div class="field"><label for="cName">Nom</label><input class="input" id="cName" required autocomplete="name"></div>
          <div class="field"><label for="cEmail">E-mail</label><input class="input" type="email" id="cEmail" required autocomplete="email"></div>
        </div>
        <div class="field"><label for="cSubj">Sujet</label><select class="input" id="cSubj"><option>Ma commande</option><option>Livraison / retrait sur place</option><option>Allergènes et composition</option><option>Abonnement</option><option>Entreprises & partenariats</option><option>Autre</option></select></div>
        <div class="field"><label for="cMsg">Message</label><textarea class="input" id="cMsg" required rows="6"></textarea></div>
        <button class="btn btn--primary">Envoyer</button>
      </form>
      <div>
        <h3>L’Atelier PREP CLUB</h3>
        <p class="muted">${DELIVERY.pickupPoints[0].address}<br>Retrait sur place du lundi au samedi</p>
        <h3 style="margin-top:28px">Nous joindre</h3>
        <p class="muted">Utilisez le formulaire ci-contre : c’est le seul moyen de contact de cette démonstration (projet étudiant, aucune adresse e-mail ni ligne téléphonique réelle).</p>
        <h3 style="margin-top:28px">Suivez-nous</h3>
        <p class="muted">Instagram & TikTok : menus de la semaine, coulisses, portraits de producteurs.</p>
      </div>
    </div></section>`;
  },
  mount() {
    $('#contactForm').onsubmit = (e) => { e.preventDefault(); e.target.reset(); toast('Message envoyé — nous vous répondons sous 24 h (simulation)'); };
  },
};

const FAQ = [
  ['Commander', [
    ['Dois-je m’abonner pour commander ?', 'Non. Vous pouvez commander un seul plat, une formule ou une box sans aucun abonnement. L’abonnement Club est entièrement facultatif.'],
    ['Quelle est la différence entre une formule et « Composer ma box » ?', 'Une formule (Petit-déjeuner, Déjeuner, Dîner, Journée complète) propose un nombre de portions défini avec des recettes modifiables. « Composer ma box » vous laisse composer librement entre 5 et 21 articles.'],
    ['Jusqu’à quand puis-je modifier ma commande ?', 'Votre planning de la semaine et votre panier sont modifiables jusqu’au paiement. Après validation, contactez-nous avant la veille 20 h.'],
  ]],
  ['Plats & allergènes', [
    ['Comment connaître la composition d’un plat ?', 'Chaque fiche produit détaille la liste complète des ingrédients, les allergènes, les risques de contamination croisée, les valeurs nutritionnelles pour 100 g et par portion, et la provenance.'],
    ['Pouvez-vous garantir un plat sans allergène ?', 'Non. Nos plats sont préparés dans un atelier qui manipule les 14 allergènes réglementaires. Les commentaires de préparation ne remplacent pas la déclaration d’une allergie : consultez toujours la fiche produit.'],
    ['Combien de temps se conservent les plats ?', 'La date limite de consommation est indiquée sur chaque emballage. Conservez les plats entre 0 et 4 °C et consultez les conseils de conservation de chaque fiche.'],
  ]],
  ['Livraison', [
    ['Où livrez-vous ?', 'À Lyon (69001 à 69009) et dans plusieurs communes de la métropole. Le code postal est vérifié au moment de la commande. Le retrait sur place est disponible pour tous.'],
    ['Combien coûte la livraison ?', `${eur(DELIVERY.homeFee)}, offerte dès ${DELIVERY.freeFrom} € d’achat (dès ${DELIVERY.premiumFreeFrom} € pour les membres Premium). Le retrait sur place est gratuit.`],
  ]],
  ['Compte & données', [
    ['Comment sont protégées mes données d’allergies ?', 'Elles sont facultatives, isolées des usages marketing, traitées uniquement avec votre consentement explicite et supprimables à tout moment depuis Mes préférences.'],
    ['Comment fonctionne le programme de fidélité ?', '1 € = 1 point (jusqu’à 2 points pour les membres du Club). Les points s’échangent contre des réductions et produits offerts depuis Mes récompenses.'],
  ]],
];
VIEWS.faq = {
  title: 'FAQ — PREP CLUB',
  render() {
    return `${pageHero({ eyebrow: 'FAQ', title: 'Questions fréquentes', crumbs: 'FAQ' })}
    <section class="section"><div class="container prose faq">
      ${FAQ.map(([g, qs]) => `<h2>${g}</h2>${qs.map(([q, a], i) => `<details ${i === 0 ? 'open' : ''}><summary>${q}</summary><p>${a}</p></details>`).join('')}`).join('')}
      <p style="margin-top:40px">Vous ne trouvez pas votre réponse ? <a href="#/contact" class="link">Contactez-nous</a>.</p>
    </div></section>`;
  },
};

VIEWS.delivery = {
  title: 'Informations de livraison — PREP CLUB',
  render() {
    return `${pageHero({ eyebrow: 'Informations de livraison', title: 'Livraison & retrait sur place', text: 'Des plats frais, transportés en conditions réfrigérées, livrés chez vous ou à retirer près de chez vous.', crumbs: 'Informations de livraison' })}
    <section class="section"><div class="container">
      <div class="grid g2">
        <div class="panel"><h3>Livraison à domicile</h3>
          <dl class="dl"><dt>Tarif</dt><dd>${eur(DELIVERY.homeFee)} — offerte dès ${DELIVERY.freeFrom} €</dd><dt>Créneaux</dt><dd>${DELIVERY.homeSlots.join(' · ')}</dd><dt>Jours</dt><dd>Du lundi au samedi</dd><dt>Délai</dt><dd>Commande jusqu’à la veille, 20 h</dd></dl>
          <h4 style="margin-top:20px">Codes postaux desservis</h4>
          <div class="chips">${DELIVERY.zones.map((z) => `<span class="chip small" style="padding:4px 10px">${z}</span>`).join('')}</div>
          <div class="field" style="margin-top:20px"><label for="zoneCheck">Vérifier mon code postal</label><input class="input" id="zoneCheck" maxlength="5" inputmode="numeric" placeholder="69003"><span class="small" id="zoneOut"></span></div>
        </div>
        <div class="panel"><h3>Retrait sur place</h3>
          <dl class="dl"><dt>Tarif</dt><dd>Gratuit</dd><dt>Créneaux</dt><dd>${DELIVERY.pickupSlots.join(' · ')}</dd></dl>
          <div class="stack" style="margin-top:20px">${DELIVERY.pickupPoints.map((p) => `<div><strong>${esc(p.name)}</strong><div class="small muted">${esc(p.address)}</div></div>`).join('')}</div>
        </div>
      </div>
      <div class="panel" style="margin-top:24px"><h3>Suivi et notifications</h3><p class="muted">Vous êtes informé·e à chaque étape : commande confirmée, en préparation, en cours de livraison ou prête à être récupérée, livrée. Les créneaux proposés sont synchronisés avec notre capacité réelle de préparation et de livraison.</p></div>
    </div></section>`;
  },
  mount() {
    $('#zoneCheck').oninput = (e) => {
      const v = e.target.value;
      const out = $('#zoneOut');
      if (v.length < 5) { out.textContent = ''; return; }
      const ok = DELIVERY.zones.includes(v);
      out.textContent = ok ? '✓ Nous livrons chez vous' : '✕ Pas encore desservi — le retrait sur place est disponible';
      out.style.color = ok ? 'var(--olive)' : 'var(--danger)';
    };
  },
};

function legalPage(title, eyebrow, body) {
  return `${pageHero({ eyebrow, title, crumbs: eyebrow })}<section class="section"><div class="container prose">
    <div class="notice">Projet étudiant INSEEC, démo sans vente réelle : aucune commande n’est livrée, aucun paiement n’est encaissé et aucune donnée personnelle réelle n’est collectée. Les textes ci-dessous décrivent les règles qui s’appliqueraient à PREP CLUB s’il était commercialisé.</div>${body}</div></section>`;
}
VIEWS.terms = {
  title: 'Conditions générales de vente — PREP CLUB',
  render: () => legalPage('Conditions générales de vente', 'CGV', `
    <h2>1. Objet</h2><p>Les présentes conditions régissent la vente en ligne de plats préparés, formules, box et abonnements présentés par PREP CLUB, projet étudiant de démonstration réalisé dans le cadre d’un cours de l’INSEEC. Dans cette démonstration, aucune vente n’est conclue.</p>
    <h2>2. Commandes</h2><p>Les commandes peuvent être passées à la carte, en formule, en box ou via le planning de la semaine. Aucune commande n’entraîne de souscription automatique à un abonnement. Une page de confirmation récapitule chaque commande.</p>
    <h2>3. Prix</h2><p>Les prix sont indiqués en euros toutes taxes comprises (TTC). Les frais de livraison (4,90 € TTC, offerts dès 60 € de commande) sont affichés avant la validation. Le retrait sur place est gratuit.</p>
    <h2>4. Paiement</h2><p>Dans cette démonstration, le paiement est simulé : aucune donnée bancaire n’est demandée et aucune somme n’est débitée.</p>
    <h2>5. Livraison et retrait</h2><p>Voir la page <a href="#/livraison" class="link">Informations de livraison</a>. Le client choisit un créneau ; les produits doivent être placés au réfrigérateur dès réception.</p>
    <h2>6. Droit de rétractation</h2><p>Le Code de la consommation exclut le droit de rétractation pour les biens susceptibles de se détériorer ou de se périmer rapidement, ce qui est le cas des plats frais. En cas de produit non conforme, le client est remboursé ou le plat remplacé.</p>
    <h2>7. Abonnement Club</h2><p>L’abonnement est facultatif et mensuel. Il se renouvelle à date anniversaire ; un rappel est envoyé 7 jours avant chaque échéance. Il peut être suspendu jusqu’à 2 mois ou résilié à tout moment depuis l’espace client, sans frais, la résiliation prenant effet à la fin de la période en cours.</p>
    <h2>8. Programme de fidélité</h2><p>Chaque euro dépensé rapporte 1 point (1,5 point pour les membres Essentiel, 2 points pour les membres Plus et Premium). Les points s’échangent contre les récompenses affichées dans « Mes récompenses », ne sont pas convertibles en argent et restent valables 12 mois après la dernière commande.</p>
    <h2>9. Allergènes</h2><p>Les informations relatives aux allergènes figurent sur chaque fiche produit et sur l’étiquetage. Les commentaires de préparation ne constituent pas une déclaration d’allergie.</p>`),
};
VIEWS.privacy = {
  title: 'Politique de confidentialité — PREP CLUB',
  render: () => legalPage('Politique de confidentialité', 'Confidentialité', `
    <h2>Dans cette démonstration</h2><p>Aucune donnée n’est envoyée à un serveur : le compte, le panier, les commandes et les préférences restent dans votre navigateur (stockage local) et peuvent être effacés à tout moment depuis « Paramètres du compte » ou en vidant les données du site. N’y saisissez pas de données personnelles réelles.</p>
    <h2>Données qui seraient collectées</h2><p>Identité, coordonnées de livraison, historique de commandes, préférences, points de fidélité et préférences de communication, limités au nécessaire. Durées de conservation : 3 ans après le dernier achat pour les données clients, 3 ans après le dernier contact pour les prospects, puis suppression.</p>
    <h2>Données de santé (allergies)</h2><p>Leur renseignement est facultatif et soumis à votre consentement explicite. Elles servent uniquement à afficher des alertes sur les produits, sont isolées des usages marketing et supprimables à tout moment.</p>
    <h2>Paiement</h2><p>Dans une version commercialisée, les données bancaires seraient traitées exclusivement par un prestataire de paiement certifié ; PREP CLUB ne conserverait aucun numéro de carte.</p>
    <h2>Communications</h2><p>La lettre d’information La Prep de la Semaine et les offres commerciales ne sont envoyées qu’avec votre consentement, retirable à tout moment.</p>
    <h2>Cookies</h2><p>Seuls les éléments nécessaires au fonctionnement du site (panier, compte) sont stockés par défaut. Les cookies de mesure d’audience nécessitent votre accord.</p>
    <h2>Vos droits</h2><p>Accès, rectification, effacement, portabilité, opposition et limitation : depuis « Paramètres du compte » (export et suppression de vos données) ou via le <a href="#/contact" class="link">formulaire de contact</a>. Vous pouvez aussi saisir la CNIL.</p>`),
};
VIEWS.legal = {
  title: 'Mentions légales — PREP CLUB',
  render: () => legalPage('Mentions légales', 'Mentions légales', `
    <h2>Éditeur</h2><p>PREP CLUB est un projet étudiant réalisé dans le cadre de l’épreuve « IA : créer et lancer un produit » de l’INSEEC Grande École. Ce n’est pas une société immatriculée : il n’a ni numéro SIRET, ni activité commerciale. Contact : <a href="#/contact" class="link">formulaire de contact</a>.</p>
    <h2>Hébergement</h2><p>Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis — <a href="https://vercel.com" class="link" target="_blank" rel="noopener">vercel.com</a>.</p>
    <h2>Activité alimentaire</h2><p>Aucune denrée n’est produite ni vendue dans le cadre de cette démonstration. Une version commercialisée devrait être déclarée auprès de la Direction départementale de la protection des populations (DDPP) du Rhône.</p>
    <h2>Contenus</h2><p>Les recettes, prix, valeurs nutritionnelles, producteurs, avis et données clients présentés sont fictifs. Les marques citées dans le dossier stratégique sont des concurrents réels, présentés à titre d’analyse : aucune ne travaille avec PREP CLUB.</p>
    <h2>Crédits photos</h2><p>Photographies d’illustration issues de la banque d’images libre de droits <a href="https://unsplash.com" class="link" target="_blank" rel="noopener">Unsplash</a>.</p>`),
};

VIEWS.notfound = {
  title: 'Page introuvable — PREP CLUB',
  render() {
    return `<section class="section"><div class="container center"><span class="eyebrow">404</span><h1>Cette page n’existe pas</h1><p class="muted">Mais votre semaine, elle, peut être prête.</p><a href="#/" class="btn btn--primary">Retour à l’accueil</a></div></section>`;
  },
};
