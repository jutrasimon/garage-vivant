[▶ Jouer à Garage vivant](https://jutrasimon.github.io/garage-vivant/)

# Garage vivant · v0.7.0

Une simulation autonome de musiciens dans une banlieue. Les personnages sont des cubes avec personnalité, émotions, compétences et relations. Ils composent, montent des bands et tentent leur chance devant un public physique. Le joueur peut observer, régler leurs sacs ou intervenir.

[Documentation du jeu](https://jutrasimon.github.io/garage-vivant/docs/) · [Notes de version](https://jutrasimon.github.io/garage-vivant/docs/versions.html#v070) · [Contribuer](CONTRIBUTING.md)

## Prendre la scène

1. Dans **Groupes**, choisir un band actif puis **Préparer / réserver**. La préparation met le quartier en pause.
2. Choisir une des quatre dates futures, un créneau, une intention et les musiciens. Choisir une setlist de compositions ou de jams libres : quatre minutes musicales par morceau, dans la durée du créneau.
3. Une petite scène accepte le premier band admissible. Une grosse scène reçoit des candidatures, puis choisit son affiche deux jours avant le show. Un band ne peut avoir qu’un engagement futur, candidature comprise. Les partenaires peuvent refuser.
4. Une réservation peut être modifiée et reconfirmée avant le départ, ou annulée. **Avancer jusqu’au show** simule les déplacements. Les bands peuvent aussi réserver de façon autonome.
5. À l’heure du show, la vue s’ouvre au début et le quartier se fige. Regarder les cartes, inspecter un fan ou musicien, mettre en pause, accélérer ou **Sauter**. Le bilan explique les effets sur le band; poursuivre avec le groupe suivant ou terminer la soirée.

Les dates se renouvellent continuellement. Un gros événement revient toutes les quatre occasions; les soirées accueillent deux ou trois bands. Plusieurs chansons partagent le même public et donnent un seul bilan par prestation. Le rejet d’une candidature coûte du moral temporaire, sans perte de réputation. Une prestation décevante peut affecter réputation et moral selon les attentes du public.

**Essayer maintenant** est une répétition générale sans récompense. Un replay reproduit le tirage et n’ajoute aucune conséquence; les douze dernières prestations gardent la trace de leur dernière chanson. **Interrompre** un vrai show ne donne pas de récompense et coûte de l’énergie.

## Quartier V7

Cinq activités d’éveil : Décrocher, Socialiser, Pratiquer, Jammer et Composer. Chaque personnage possède un sac fini sans remise; la fiche montre composition, restants, consommés et réservation. Modifier les quantités prépare le prochain cycle. Une recherche sociale ou jam sans partenaire rend le jeton et attend, sans activité fictive. Le sommeil quotidien est hors sac; sa durée et son horaire sont personnels.

Énergie, lien social, plaisir et expression exercent des pressions personnelles sur exaltation et détresse. Les traits conditionnels s’activent au seuil et se retirent en dessous; les sources permanentes restent actives. Les besoins, traits et personnalité ne changent pas la pige. Confort, humeur globale, ancien mode à scores et attirance séparée sont retirés.

Les séances accueillent les intentions compatibles et possèdent une horloge commune. Discuter, soutenir et faire une avance séparent acceptation et résultat. Les traces donnent chances, entrées, tirages et conséquences. Affinité, tension et lien amoureux sont dirigés; les couples sont un statut distinct. Le développement du groupe est bien sa Coordination, utilisée pour pondérer les partenaires.

Les anciens moteurs de projets, compétences, déchéance, groupes et shows sont conservés. Quatre raccords restent explicitement débranchés : poids des souvenirs sur l’humeur, anciennes six nuances des nouvelles chansons, choix par personnalité/priorités et bonus de choix Relax. Réglages et le [DDD des raccords](docs/gdd/raccords-v7.md) donnent leur état réel.

Fiches modulaires, catalogue de traits filtrable, focus et lecture conservés. Ctrl+Espace ou Rechercher ouvre les règles; VitePress cherche les mêmes DDD. Les [douze domaines](docs/gdd/documentation.md) couvrent formules, sauvegardes, frontières de systèmes et limites.

## Temps et sauvegardes

À ×1, une seconde réelle vaut huit minutes de quartier. Le sommeil collectif avance jusqu’au premier réveil en conservant tous les effets minute par minute. Une chanson se présente en 30 secondes à ×1 sur une horloge distincte. Le quartier attend la fin de la soirée; masquer le navigateur suspend les horloges sans rattrapage. L’âge reste une identité.

Sauvegarde locale, export/import et migration V1–V6. Chansons, projets, compétences, groupes, engagements et shows historiques sont conservés. Les anciens compteurs gardent une archive; l’humeur historique n’est pas maintenue comme calcul caché. Une copie avant migration se trouve dans `garage-vivant-before-v7`; une sauvegarde invalide n’est pas écrasée automatiquement. Un rechargement V7 ne reroule pas les seuils ou sacs et poursuit le même futur.

## Développement et validation

Les sources exécutables sont dans `dist/`. `v7.mjs` centralise les nouvelles règles; `engine.mjs` orchestre la simulation; `life.mjs`, `calendar.mjs` et `stage.mjs` gardent carrière, calendrier et spectacle. Rendu et audio n’utilisent pas le hasard du monde. Voir le [DDD Technique](docs/gdd/technique.md).

Avec Node 22 :

```sh
npm ci
npm test
npm run docs:build
npx playwright install --with-deps chromium
npm run test:browser
```

Pour jouer localement : `python3 -m http.server 8000 --directory dist`, puis `http://localhost:8000/`. Le build crée la documentation et son index de recherche. Les dix suites couvrent les règles V7, imports réels V1–V6, déterminisme, compositions, engagements, setlists, skip/replay, récompenses uniques, 100 jours de calendrier et cohérence documentaire. Chromium couvre ordinateur et tactile, rendu, recherche VitePress et parcours de jeu. Le viewport tactile ne remplace pas un test sur appareil réel.

La CI vérifie les PR sans publier; `main` publie jeu et doc après validation. Captures dans `interface-v7`. Voir [PLAN_V7](docs/PLAN_V7.md), [DDD](docs/gdd/documentation.md), [historique](docs/CHANGELOG.md) et [contribution](CONTRIBUTING.md). L’équilibrage des profils et probabilités reste provisoire et demande un essai avec joueurs.

## Mise en scène V0.6.4

La scène conserve ses proportions et occupe une seule arène. Le show attend « Lancer le show ». Chaque musicien pige cinq cartes distinctes sans remise; son deck est visible et consultable. La carte apparaît brièvement dans un emplacement réservé de taille fixe, disparaît, puis le musicien vise et tire vers la foule. Le contact déclenche un flash, une onde, « BANG ! », les gains locaux et les réactions. Aucune défausse ne reste derrière la carte; les cartes passées sont consultables dans « Cartes jouées ». Le bouton « Son : ON/OFF » reste visible à côté de la pause. Cliquer une carte, un musicien ou un fan suspend la lecture; fermer par X, Échap ou clic extérieur rétablit son état précédent. Les cartes à venir ne sont pas révélées par la consultation du deck.

Chaque chanson se regarde en 30 secondes à ×1. `show-playback.mjs` transforme le temps de présentation en pas musicaux sans modifier les règles ou les résultats. Les anciennes prestations de 2160 pas et les nouvelles de 3600 pas gardent leurs tirages et conséquences. Les accélérations, le skip et le replay restent déterministes. `show-view.mjs` et `show.css` rendent les zones, charges, impacts, gains locaux, réactions et mini-cubes.

`tests/show.test.mjs` vérifie la durée, les événements/résultats à plusieurs vitesses, la reprise, le repérage uniforme du canvas et l’ordre carte → disparition → visée → tir → impact. Les tests navigateur couvrent le départ explicite, les decks, les inspections imbriquées, la chronologie réelle en lecture, le son visible, les proportions et six tailles d’écran. Les cartes ne recouvrent ni le public ni les decks.
