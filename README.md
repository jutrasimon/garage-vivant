[▶ Jouer à Garage vivant](https://jutrasimon.github.io/garage-vivant/)

# Garage vivant · v0.6.2

Une simulation autonome de musiciens dans une banlieue. Les personnages sont des cubes avec personnalité, émotions, compétences et relations. Ils composent, montent des bands et tentent leur chance devant un public physique. Le joueur peut observer, régler leurs priorités ou intervenir.

[Documentation du jeu](https://jutrasimon.github.io/garage-vivant/docs/) · [Notes de version](https://jutrasimon.github.io/garage-vivant/docs/versions.html#v061) · [Contribuer](CONTRIBUTING.md)

## Prendre la scène

1. Dans **Groupes**, choisir un band actif puis **Préparer / réserver**. La préparation met le quartier en pause.
2. Choisir une des quatre dates futures, un créneau, une intention et les musiciens. Choisir une setlist de compositions ou de jams libres : quatre minutes musicales par morceau, dans la durée du créneau.
3. Une petite scène accepte le premier band admissible. Une grosse scène reçoit des candidatures, puis choisit son affiche deux jours avant le show. Un band ne peut avoir qu’un engagement futur, candidature comprise. Les partenaires peuvent refuser.
4. Une réservation peut être modifiée et reconfirmée avant le départ, ou annulée. **Avancer jusqu’au show** simule les déplacements. Les bands peuvent aussi réserver de façon autonome.
5. À l’heure du show, la vue s’ouvre au début et le quartier se fige. Regarder les cartes, inspecter un fan ou musicien, mettre en pause, accélérer ou **Sauter**. Le bilan explique les effets sur le band; poursuivre avec le groupe suivant ou terminer la soirée.

Les dates se renouvellent continuellement. Un gros événement revient toutes les quatre occasions; les soirées accueillent deux ou trois bands. Plusieurs chansons partagent le même public et donnent un seul bilan par prestation. Le rejet d’une candidature coûte du moral temporaire, sans perte de réputation. Une prestation décevante peut affecter réputation et moral selon les attentes du public.

**Essayer maintenant** est une répétition générale sans récompense. Un replay reproduit le tirage et n’ajoute aucune conséquence; les douze dernières prestations gardent la trace de leur dernière chanson. **Interrompre** un vrai show ne donne pas de récompense et coûte de l’énergie.

## Quartier observable et réglable

Six actions : récupérer, socialiser, pratiquer, jammer, composer et former un groupe. Récupérer choisit sommeil, pause solo ou détente ensemble. Les priorités 1/2/3/0 restent disponibles; une énergie critique impose la récupération. Une jam demande deux musiciens réellement présents. Les compositions progressent sur plusieurs séances, avec qualité, style et origine émotionnelle conservés.

Affinité, confiance et tension décrivent un point de vue : Alex → Camille peut différer de Camille → Alex. Un grief permet au conflit de persister après la colère; les amis refroidissent plus vite, l’écoute empathique aide à réparer. Les croisements de trajets peuvent créer des échanges et des moments ensemble. La chimie musicale se découvre par des expériences communes, plutôt que par un chiffre connu d’avance.

La fiche détaillée utilise l’espace central. Le bouton **Organiser** expose les commandes de disposition. Ses modules peuvent être réordonnés, élargis ou masqués; les modules masqués restent accessibles en bas. Les souvenirs actifs et terminés sont datés. Le **sac Rapin** distingue les parts de base éditables des chances actuelles, modulées par besoins, émotions et priorités. Les verrous protègent les autres parts pendant une redistribution.

Navigation fixe, slider de vitesse 0–10 aimanté aux valeurs rondes, filtres du journal et positions de lecture conservées. **Ctrl+Espace** ou Recherche ouvre les règles par système. Le numéro de version ouvre les nouveautés dans un autre onglet, à la dernière note non lue.

## Temps et sauvegardes

À ×1, une seconde réelle vaut huit minutes de quartier; une journée dure trois minutes hors pauses. La lecture d’une chanson dure une minute à ×1 sur une horloge distincte. Le quartier attend la fin de la soirée; masquer le navigateur suspend les deux horloges sans rattrapage. L’âge est une donnée, sans vieillissement automatique.

Sauvegarde locale, export/import JSON et migration V1–V5.1. Personnages, chansons, projets, relations, compétences et engagements sont conservés. Les compteurs repos/décrocher sont additionnés. Les nouvelles archives gardent jusqu’à 600 souvenirs par personnage; un souvenir hérité sans date l’indique. Une copie est conservée avant migration dans `garage-vivant-before-v6`; une sauvegarde invalide n’est pas écrasée automatiquement.

Les sauvegardes dépendent du navigateur et de l’origine web : exporter puis importer pour changer d’hébergement. Les préférences de disposition restent propres au navigateur.

## Développement et validation

Le jeu reste une application statique sans dépendance à l’exécution. Les sources sont dans `dist/` : `engine.mjs` simule le quartier, `life.mjs` la carrière et les commandes, `calendar.mjs` les inscriptions et dates, `social.mjs` les griefs et sacs, `stage.mjs` la physique musicale. Rendu et audio ne changent pas le hasard de simulation.

Avec Node 22 :

```sh
npm ci
npm test
npm run docs:build
npx playwright install --with-deps chromium
npm run test:browser
```

Pour jouer localement après le build documentaire : `python3 -m http.server 8000 --directory dist`, puis ouvrir `http://localhost:8000/`. Le jeu fonctionne sans ce build; les liens documentaires utilisent le préfixe Pages `/garage-vivant/docs/`.

Les sept suites couvrent migrations réelles V5.1, sauvegardes actives, compositions, relations, engagements, sélection reproductible, shows, skip/replay sans doubles gains et 100 jours de calendrier. Chromium vérifie les parcours ordinateur et tactile : fiches modulaires, sac, groupes, setlists, réservation réelle, pause du quartier, skip, historique, recherche, notes et scroll. Ce viewport tactile ne remplace pas un test sur iPhone réel.

La CI construit jeu et documentation ensemble et publie `dist/` depuis `main` après validation. Les PR vérifient sans publier. Les captures sont disponibles dans l’artefact `interface-v6`. Voir [le plan V6](docs/PLAN_V6.md), les [GDD par système](docs/gdd/) et [l’historique](docs/CHANGELOG.md). Le test de compréhension et l’équilibrage des probabilités restent à faire avec des joueurs.

## Mise en scène V0.6.2

La scène conserve ses proportions et occupe une seule arène. Le show attend « Lancer le show ». Chaque musicien pige cinq cartes distinctes sans remise; son deck est visible et consultable. Les cartes sortent de leur pile, chevauchent la scène et rejoignent les cartes récemment jouées. Cliquer une carte, un musicien ou un fan suspend la lecture; fermer par X, Échap ou clic extérieur rétablit son état précédent. Les cartes à venir ne sont pas révélées par la consultation du deck.

Chaque chanson se regarde en 30 secondes à ×1. `show-playback.mjs` transforme le temps de présentation en pas musicaux sans modifier les règles ou les résultats. Les anciennes prestations de 2160 pas et les nouvelles de 3600 pas gardent leurs tirages et conséquences. Les accélérations, le skip et le replay restent déterministes. `show-view.mjs` et `show.css` rendent les zones, charges, impacts, gains locaux, réactions et mini-cubes.

`tests/show.test.mjs` vérifie la durée, les événements/résultats à plusieurs vitesses, la reprise et le repérage uniforme du canvas. Les tests navigateur couvrent le départ explicite, les decks, les inspections imbriquées, les proportions et le petit écran.
