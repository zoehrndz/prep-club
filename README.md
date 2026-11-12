# PREP CLUB — Votre semaine, préparée.

Prototype du site e-commerce PREP CLUB (meal prep, Lyon), réalisé à partir du cahier des charges.

## Conformité à l'épreuve « IA : créer et lancer un produit » (INSEEC)
Une seule adresse : **https://prep-club.vercel.app**, avec quatre espaces reliés par le bandeau orange présent en haut de chaque page (« Projet étudiant INSEEC, démo sans vente réelle ») :
1. **Vente** (`index.html`) : promesse en une phrase, offre détaillée avec inclus / non inclus (`#/offre-et-prix`), prix en euros TTC, parcours d'achat simulé jusqu'à la page de confirmation, FAQ et contact.
2. **CRM** (`admin.html#/crm`) : ouverture sans compte ni mot de passe ; 24 contacts fictifs (recherche et filtres par étape et par source) ; fiche contact avec coordonnées fictives, source, historique des échanges et prochaine action ; pipeline Nouveau → Contacté → Proposition envoyée → Gagné / Perdu (glisser-déposer ou flèches) ; tableau de bord avec chiffre d'affaires, nombre de clients et taux de conversion. Bonus : une commande passée sur le site depuis le même navigateur apparaît dans le CRM.
3. **Stratégie** (`strategie.html`) : problème, deux personas, marché sourcé (INSEE, FranceAgriMer / Circana, Réussir), cinq concurrents réels avec leurs prix, construction du prix, modèle économique avec objectif à 12 mois. Toute donnée non sourcée est signalée comme estimation, avec son calcul.
4. **Communication** (`communication.html`) : plateforme de marque, canaux, 9 posts prêts à publier (Instagram, TikTok, LinkedIn) avec texte, visuel, format, date et objectif, calendrier sur 4 semaines, 5 partenariats, plan pour les 10 premiers clients, indicateurs. Le Marketing Studio (`marketing-studio.html`) reste l'outil complet.
Pages statiques lisibles sans JavaScript : `strategie.html`, `communication.html` et un résumé de l'offre dans `index.html`. Aucun texte de remplissage, aucune clé d'API ni mot de passe dans le code.

## Ouvrir le site
Double-cliquez sur `index.html` (aucune installation nécessaire), ou servez le dossier :

    python3 -m http.server 8000   # puis http://localhost:8000

## Contenu (site entièrement en français)
- **Accueil** : les 10 sections du cahier des charges (bandeau, « Commandez à votre façon », planning, collection de saison, box découverte, meilleures ventes, producteurs, « Comment ça marche », abonnement Club, lettre d'information La Prep de la Semaine).
- **La carte** (`#/carte`) : filtres Petit-déjeuner, Déjeuner, Dîner, En-cas, Desserts, Végétarien, De saison, Meilleures ventes, Nouveautés ; recherche, tri, exclusion d'allergène, filtre selon préférences.
- **Fiche produit** (`#/produit/…`) : personnalisation avec recalcul du prix, allergènes, nutrition /100 g et /portion, provenance, conservation, préparation.
- **Formules**, **Composer ma box** (4 étapes, prix en temps réel, règles configurables), **Box découverte**, **Collection de saison**.
- **Planning de la semaine** (`#/planning`) : 7 jours × 4 repas, suggestion automatique, récapitulatif, sauvegarde, transformation en panier.
- **Panier** + **commande** : livraison à domicile (vérification de zone) ou retrait sur place, créneaux, commande sans compte, paiement simulé, confirmation et suivi.
- **Mon compte** (`#/mon-compte`) : tableau de bord, commandes, plannings, abonnement, favoris, préférences et allergies, adresses, récompenses, paramètres RGPD.
- Pied de page : Contact, FAQ, Livraison, Nos producteurs, Fidélité, CGV, Confidentialité, Mentions légales.
- **Pour vous** (`#/pour-vous`) : recommandations personnalisées (préférences, favoris, commandes, saison, avis), avec la raison affichée sur chaque plat ; bouton « Générer ma semaine idéale » qui remplit le planning. Un rail « Pour vous » apparaît aussi sur l'accueil.
- **Entreprises** (`#/entreprises`) : Office Box avec simulateur de budget, événements, partenariats coworking, Family Box (« être prévenu·e ») et formulaire de devis.
- **Conseils & recettes** (`#/conseils-recettes`) : magazine de 7 articles filtrables (organisation, conservation, saison, équilibre, producteurs, recettes), avec les plats associés à chaque article.
- **Parrainage** (`#/parrainage`) : code personnel, partage (copie, e-mail, WhatsApp), paliers de récompenses et suivi des filleuls (simulable).
- **Accessibilité** (`#/accessibilite`) : déclaration d'accessibilité (non audité), focus gardé dans le panier et les fenêtres, `aria-current` sur le menu.
- **Référencement** : description adaptée à chaque page, balises Open Graph et données structurées (schema.org FoodEstablishment).

Astuce : dans « Mon compte », le bouton « Explorer avec un compte de démonstration » charge un historique fictif.
Codes promo de test : `BIENVENUE10`, `PREPSEMAINE`.

## Direction artistique & motion design
- Typo Fraunces (titres, italiques « wonky ») + Manrope ; palette crème / olive / sable / charbon relevée de safran et tomate.
- Hero animé : mot qui change, assiettes flottantes en parallaxe, badge rotatif, compteurs, bandeaux défilants.
- Apparitions au scroll, titres révélés mot par mot, manifeste qui s'allume en défilant, transitions en rideau entre les pages.
- Cartes inclinées en 3D, boutons magnétiques, curseur personnalisé, zoom loupe sur les photos produit, produit qui « vole » vers le panier.
- Respecte le réglage système « réduire les animations » : tout reste lisible sans animation.

## Back-office (`admin.html`)
Accessible depuis le lien « Administration » du pied de page.
**Accès protégé** : à la première ouverture, l'administrateur crée son identifiant et son mot de passe (8 caractères minimum, lettres et chiffres). Ensuite, un écran de connexion protège le back-office (option « Rester connecté·e 7 jours », déconnexion et changement de mot de passe dans la barre latérale). Le mot de passe est salé et haché, jamais stocké en clair ; sans serveur, cet accès protège ce navigateur uniquement et devra être remplacé par une authentification côté serveur à la mise en ligne. Utilisable sur ordinateur, tablette et smartphone.
- **Tableau de bord** : CA du jour / semaine / mois, commandes en attente, en préparation, à livrer, paiements échoués et interventions, clients actifs, nouveaux clients, panier moyen, abonnés, taux de réachat, produit le plus vendu. Graphiques (CA, commandes, catégories, produits, carte vs formules, abonnements, nouveaux vs récurrents) filtrables : aujourd'hui, semaine, mois, trimestre, année, période personnalisée. Fil « À traiter » et activité récente.
- **Produits** : ajout, modification, prix et stock modifiables dans la liste, activation en un clic, archivage, suppression. Fiche complète : photos (import ou URL), ingrédients, allergènes, nutrition, provenance, fournisseurs, conservation, préparation, personnalisation, disponibilité (épuisé, stock, commandes max., lancement, fin, indisponibilité temporaire). Une recette modifiée est signalée « À revoir » jusqu'à validation.
- **Catégories** (repas et sélections), **Suppléments** (prix ajoutés automatiquement sur le site).
- **Menu de la semaine** : création, plats, dates, brouillon / programmation / publication, aperçu. Le menu en ligne devient le premier filtre de la carte.
- **Collections de saison** : nom, description, photo, période, ingrédients, recettes, producteurs, mise en avant.
- **Commandes** (statuts, actions groupées, annulation, paiement, interventions), **Clients** (segments, fiche, export CSV), **Abonnements** (abonnés, formules Club modifiables).
- **Livraison & promotions** : frais, zones, créneaux, points de retrait, codes promo, règles de box, export / import / réinitialisation.
- **Formules & box** : cartes cliquables ; recettes par défaut, nombre de portions, photo et remise des formules avec prix recalculé en direct ; recettes et prix des box découverte (alerte si le prix n'est pas avantageux) ; règles de « Composer ma box ».
- **Avis clients** : note moyenne et répartition, filtres (à traiter, sans réponse, masqués, reçus sur le site), réponse avec modèles, masquage. Les réponses s'affichent sous l'avis sur le site, les avis masqués en disparaissent.
- **Textes du site** : bandeau d'annonce (messages réordonnables), accroche de l'accueil, FAQ, avec aperçu en direct.
- **Producteurs** : fiches (photo, commune, produits, méthodes), case « Partenariat vérifié » avec justificatif obligatoire, plats qui utilisent le producteur.
- **Aide intégrée** : menu rangé par usage (Au quotidien, Ma carte, Mes clients, Mon site), raccourcis « Que voulez-vous faire ? » sur l'accueil, bouton « ? » (ou touche ?) expliquant chaque page en 3 étapes, visite guidée au premier lancement (relançable depuis l'aide), pastille « Modifications non enregistrées ».

Tant qu'aucune modification n'est enregistrée, le site utilise `js/data.js` tel quel. Dès la première modification, le catalogue administré (localStorage `prepclub:admin:v1`) est appliqué au site par `js/catalog-apply.js`.
Commandes, clients, abonnements et avis du back-office sont **fictifs** (`js/admin/demo.js`), complétés par les commandes passées sur le site depuis le même navigateur. Avant une mise en ligne, le back-office doit être relié à un serveur avec une vraie authentification.

## Marketing Studio (`marketing-studio.html`)
La communication PREP CLUB prête à l'emploi, pensée pour un débutant (lien en pied de page du site). 11 onglets :
- **Aujourd'hui** : publications du jour en 3 étapes (image ou vidéo prête, texte à copier, publier) + tâches de campagne du jour.
- **Calendrier** : les 12 mois (à partir du 9 novembre 2026), un clic sur un jour ouvre ses publications.
- **Campagnes** : 10 campagnes avec dates, budget ligne par ligne, résultats attendus et plan jour par jour (cases à cocher).
- **Budget & plan** : budget sur 12 mois (3 scénarios), répartition par poste, mois par mois avec suivi du dépensé, simulateur de pub, outils.
- **Vidéos & visuels** : 14 vidéos en motion design et 11 visuels « natifs », modifiables, import de ses photos/vidéos, export MP4/PNG.
- **Textes prêts** : publications, e-mails automatiques, influenceurs, publicités, articles de blog.
- **Géré par l'IA** : tâches confiées à l'IA (SEO, pubs, idées, réponses, analyse), semaine type, prompts prêts à copier, règles.
- **Mes comptes** : pour Instagram, TikTok, Pinterest, Facebook et Google : nom, identifiant, photo de profil à télécharger, bio (avec limite de caractères), lien en bio, stories à la une + couvertures, posts épinglés, réponses rapides, réglages à cocher, typo et couleurs. Aperçu du profil Instagram avec les vraies prochaines publications.
- **La stratégie** · **Mon suivi**.

Budgets et performances = ordres de grandeur à confirmer (devis, premières campagnes).
Une version détaillée « expert » reste disponible : `marketing-studio-complet.html`.
Contenus & budgets : `js/mkt-data.js` · calendrier : `js/mkt-engine.js` · motion design : `js/mkt-motion.js` · page : `js/mkt-simple.js`.

## À savoir
- Toutes les données (compte, panier, commandes) sont stockées dans le navigateur (localStorage) ; rien n'est envoyé à un serveur. Le paiement est simulé.
- Prix, valeurs nutritionnelles, producteurs et photos (Unsplash) sont des **données de démonstration** à remplacer.
- Catalogue, formules, abonnements, zones et règles de box : `js/data.js`.

## Structure
    index.html
    css/style.css       mise en page de base
    css/da.css          direction artistique v2 (typo, couleurs, animations)
    js/data.js          catalogue & configuration
    js/core.js          état, prix, panier, composants
    js/views-shop.js    accueil, menu, produit, formules, box, planner
    js/views-account.js espace client, checkout, confirmation
    js/views-content.js pages de contenu
    js/views-extra.js   Pour vous, Entreprises, Conseils & recettes, Parrainage, Accessibilité, SEO
    css/extra.css       styles de ces pages
    js/motion.js        motion design : apparitions, curseur, parallaxe, transitions…
    js/app.js           routeur & initialisation
    js/catalog-store.js catalogue administrable (partagé site / back-office)
    js/catalog-apply.js applique le catalogue administré au site
    admin.html          back-office
    css/admin-guide.css styles de l'aide intégrée et des écrans Avis, Formules, Textes, Producteurs
    css/admin.css       styles du back-office
    js/admin/           back-office : demo, ui (graphiques), dashboard, products, menus, orders, settings
