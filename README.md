[▶ Jouer à Garage vivant](https://jutrasimon.github.io/garage-vivant/)

# Garage vivant · v0.8.14

Une simulation autonome de musiciens dans une banlieue. Les personnages sont des cubes avec personnalité, émotions, compétences et relations. Ils composent, montent des bands et tentent leur chance devant un public physique. Le joueur peut observer, régler leurs sacs ou intervenir.

[Documentation du jeu](https://jutrasimon.github.io/garage-vivant/docs/) · [Notes de version](https://jutrasimon.github.io/garage-vivant/docs/versions.html#v0814) · [Contribuer](CONTRIBUTING.md)

**V7.10 — personnages et groupes :** nom, surnom et apparence cohérente dans les portraits; suppression confirmée; options de carte; Shows consultable sans pause. Configurations initiales variables, propositions de formation +12,5 % et pratiques plus insistantes pour les groupes fragiles. [Design et bilan](docs/BILAN_V7_10.md). Format du monde toujours 0.7.3.

**V7.6 — BandLive :** spectacles interactifs optionnels et répétitions. Activez **Réglages → Activer BandLive** pour afficher l’onglet. [Notes de version](docs/versions.md#v076).

**V7.5 — formation et recrutement :** créer un band est un peu plus probable ; compléter son band ne subit plus la pénalité de créer un autre groupe. Le candidat attend 24 h, le recruteur n’est plus bloqué par une adhésion. Liens réciproques, acceptation variable et freins au multigroupe conservés. [Comparaison et limites](docs/BALANCE_V7_5.md). Format de sauvegarde toujours 0.7.3.

**V7.4 — accès aux archives :** Groupes → Actifs / Archives, compteurs visibles, fiche conservée à la dissolution et liens vers les propriétaires dissous. Anciennes données conservées ; format de sauvegarde toujours 0.7.3, aucune règle moteur changée.

**V7.3 — correctif après simulations :** [bilan avant/après et limites](docs/AUDIT_V7_3.md). Quatre transitions corrigées, aucune mécanique ajoutée. `npm run audit:simulation` rejoue seize parties de quinze jours.

**V7.2 — groupes autonomes :** [plan et réalisation](docs/PLAN_V7_2.md), [audit précédent](docs/AUDIT_V7_1_RELATIONS.md) et [réception sur 20 graines](docs/BALANCE_V7_2.md). Jeu et documentation sont publiés ensemble après les contrôles de main. Les règles, coefficients et raccords débranchés sont documentés dans les quinze DDD.

## Prendre la scène

1. Dans **Groupes**, choisir un band actif puis **Préparer / réserver**. La préparation met le quartier en pause.
2. Choisir une des quatre dates futures, un créneau, une intention et les musiciens. Choisir une setlist de compositions ou de jams libres : quatre minutes musicales par morceau, dans la durée du créneau.
3. Une petite scène accepte le premier band admissible. Une grosse scène reçoit des candidatures, puis choisit son affiche deux jours avant le show. Un band ne peut avoir qu’un engagement futur, candidature comprise. Les partenaires peuvent refuser.
4. Une réservation peut être modifiée et reconfirmée avant le départ, ou annulée. **Avancer jusqu’au show** simule les déplacements. Les bands peuvent aussi réserver de façon autonome.
5. À l’heure du show, la vue s’ouvre au début et le quartier se fige. Regarder les cartes, inspecter un fan ou musicien, mettre en pause, accélérer ou **Sauter**. Le bilan explique les effets sur le band; poursuivre avec le groupe suivant ou terminer la soirée.

Les dates se renouvellent continuellement. Un gros événement revient toutes les quatre occasions; les soirées accueillent deux ou trois bands. Plusieurs chansons partagent le même public et donnent un seul bilan par prestation. Le rejet d’une candidature coûte du moral temporaire, sans perte de réputation. Une prestation décevante peut affecter réputation et moral selon les attentes du public.

**Essayer maintenant** est une répétition générale sans récompense. Un replay reproduit le tirage et n’ajoute aucune conséquence; les douze dernières prestations gardent la trace de leur dernière chanson. **Interrompre** un vrai show ne donne pas de récompense et coûte de l’énergie.

## BandLive · moteur de tous les nouveaux shows

Les shows s’ouvrent automatiquement dans BandLive : compositions, jams et grandes formations. L’interface centre la scène, présente le choix des tounes en overlay et garde un gros bouton de fin de tour en bas à droite. La programmation et les outils avancés sont sous le premier écran. Cartes, portraits et fiches partagent leurs composants. Le ciblage explique les réactions, pouvoirs et chaînes prévus.

Les mains sont abaissées et les musiciens légèrement remontés pour montrer leurs instruments. La scène réserve cet espace tout en gardant les cartes lisibles et le public visible; le test de composition couvre les huit instruments et les mains de cinq cartes jusqu’au 1280 × 720.

Les arcs roses indiquent la conquête et les arcs jaunes de tempo suivent le curseur ou le doigt. Le ciblage collectif utilise une lueur et des ondes autour du public, avec des halos pour les cibles individuelles. L’énergie conserve son vert menthe. La prévision des effets suit le curseur en laissant visible la cible; son contenu et l’arc sont réutilisés pendant les petits déplacements. `npm run test:targeting`, inclus dans le smoke obligatoire, vérifie couleurs, suivi souris/tactile, effets réduits, cartes mixtes, cibles invalides et annulation sans dépense.

Si le pouvoir du spectateur va se déclencher, la prévision le met au premier plan dans un encadré rose lumineux : nom en gros, effet, voisins touchés et chaînes de conquêtes. Son animation d’apparition respecte les effets réduits et ne recommence pas pendant les petits mouvements. `npm run test:conquest-preview`, inclus dans le smoke, vérifie les trois pouvoirs et les annonces au curseur, au doigt et après sélection de carte.

Les fans conquis ont un halo rose permanent et une pastille « ♥ ✓ CONQUIS » à la place de leur barre. Leur intention et leur badge de pouvoir disparaissent de la salle. Le même test vérifie ces états après de vraies conquêtes et chaînes, leur stabilité au survol et leur conservation au rechargement.

Énergie et tempo sont regroupés en bas à gauche, avec de gros chiffres et des segments lumineux. Gains, dépenses et recharge du tour affichent leur variation réelle et font réagir la jauge; le mode d’effets réduits garde l’information sans mouvement. `npm run test:resources`, inclus dans le smoke obligatoire, vérifie les valeurs jouées, le rechargement et cinq tailles d’écran.

Trois pouvoirs de conquête : Onde de choc 2–5, Projecteur 1–3 et Chœur du public 1–2. Rythme et voisinage déclenchent immédiatement leurs gains; les réactions consommées disparaissent jusqu’au prochain tour. Animations et rétroaction couvrent chaque effet, le tempo, les soutiens et la finale.

La pratique solo et collective donne 1 XP individuelle par 15 minutes réellement jouées; la pratique collective augmente aussi la coordination. Les shows et les grands moments du groupe donnent de l’XP. Les premiers niveaux arrivent plus rapidement et **les récompenses de niveau remplacent l’échange systématique de fin de show**. Les récompenses en attente sont conservées dans les fiches et accessibles avec « Améliorer le deck » depuis les membres du groupe.

La grande notification de niveau attend la fin de la soirée et le retour dans le quartier : aucun popup pendant le show, son bilan, les groupes suivants ou une répétition. Les récompenses restent en attente et l’ouverture manuelle d’une amélioration est bloquée pendant une prestation active.

Nouvelles parties : musiciens et ordre variés, deux chansons avec un seul band, trois à quatre réparties entre plusieurs bands. Les parties existantes sont conservées. [Règles et progression](docs/BANDLIVE.md).

Pour les essais entre amis : `npm run bandlive:test-file` crée un HTML autonome dans `BandLive-test/`, avec ses sauvegardes séparées. `npm run test:refonte` vérifie la nouvelle interface.

## Quartier V7.2

Le panneau des fiches à droite garde sa position de défilement quand on change de musicien, y compris au retour sur une fiche déjà consultée. Une fiche plus courte s’arrête à son propre bas. `npm run test:profile`, inclus dans le smoke obligatoire, vérifie ce comportement et la stabilité des champs pendant les mises à jour.

Six actions d’éveil : Détente, Socialiser, Pratiquer, Jam, Composer et Déchéance. Le jeton est défaussé dès la pige ; aucun remboursement après refus ou interruption. Les acquisitions arrivent dans le sac ; les retraits se font depuis la défausse, en attendant la pige des exemplaires encore dans le sac. Fourchettes personnelles et cycles remplacent les durées fixes. Le sommeil reste quotidien et hors sac.

Une admission sociale initiale ouvre la séance. Les échanges donnent ensuite directement un résultat favorable, neutre ou défavorable ; le destinataire décide de rester ou partir. La proposition rare d’une activité utilise les actions existantes. Les groupes passent par proposition et acceptation, avec freins au multigroupe. La confiance est retirée ; la romance conserve ses règles.

Pratiquer développe les compétences individuelles des musiciens sans expression par défaut. La pratique collective demande un morceau et un groupe commun. L’apprentissage progresse par petits gains et percées. Jam commence solo, accueille d’autres musiciens et continue après leurs départs ; aucun gain direct de répertoire, coordination ou réputation.

Composer développe plusieurs projets séparés, sur plusieurs séances, avec coauteurs de groupe, contributions, élan lié aux deux axes et abandon des projets délaissés. Le catalogue réunit projets et chansons : filtres, qualité relative, auteurs, rattachement, durée fixe, archives et tri. Les nouvelles banques de noms distinguent groupes et chansons et empêchent les doublons persistants.

Déchéance cumule des épisodes rapprochés et lie la quantité de jetons nuisibles aux cartes ajoutées au paquet de show. La récupération ne retire pas secrètement les jetons encore dans le sac.

Quatre besoins et deux axes V7 restent actifs. Quatorze raccords sont explicitement débranchés, dont inspiration, agenda général, souvenirs/chimie vers les plateaux, albums/fans, transferts et drame relationnel d’absence. [Registre complet](docs/gdd/raccords-v7.md). Aucun remplacement caché. Les [quinze DDD](docs/gdd/documentation.md) décrivent règles, formules, migrations et limites ; le jeu et VitePress cherchent les mêmes contenus.

## Groupes V7.2

Entités autonomes : adoption des compositions des membres, appels de pratique et réservations. Auteurs permanents, propriétaire unique ; maîtrise conservée après départ ou dissolution. Attachement individuel calculé, compétences moyennes/minimales/maximales, couleur issue du répertoire et réputation catalogue/spectacles.

Une invitation de pratique attend dans la file personnelle hors sac, puis est examinée avant la prochaine pige. Trajet et attente ne produisent pas de travail. Un spectacle confirmé interrompt l’action selon le trajet nécessaire ; absence seulement en déchéance extrême. Coordination zéro ou moins de deux membres : dissolution définitive, historique conservé. La carte place les libellés après les effets et évite leur recouvrement.

## Temps et sauvegardes

À ×1, une seconde réelle vaut huit minutes de quartier. Le sommeil collectif avance jusqu’au premier réveil en conservant tous les effets minute par minute. Une chanson se présente en 30 secondes à ×1 sur une horloge distincte. Le quartier attend la fin de la soirée; masquer le navigateur suspend les horloges sans rattrapage. L’âge reste une identité.

Sauvegarde locale, export/import et migration V1–V7. Chansons, projets, compétences, groupes, engagements et shows historiques sont conservés. Les anciens compteurs gardent une archive; l’humeur historique n’est pas maintenue comme calcul caché. Une copie avant migration se trouve dans `garage-vivant-before-v7-3`; une sauvegarde invalide n’est pas écrasée automatiquement. Un rechargement V7.3 ne reroule pas les seuils ou sacs et poursuit le même futur.

## Plan de test de la V7 complète

[Plan de test V7 à V7.5](docs/PLAN_TEST_V7.md) : parcours rapide de 20–30 minutes, cas prioritaires par système, migrations, expérience multi-graines, interface/son et publication. Il distingue les résultats automatisés et les essais humains encore à consigner.

## Développement et validation

Les sources exécutables sont dans `dist/`. `v7.mjs` et `v71.mjs` centralisent les règles; `engine.mjs` orchestre la simulation; `life.mjs`, `calendar.mjs` et `stage.mjs` gardent carrière, calendrier et spectacle. Rendu et audio n’utilisent pas le hasard du monde. Voir le [DDD Technique](docs/gdd/technique.md).

Avec Node 22 :

```sh
npm ci
npm test
npm run docs:build
npx playwright install --with-deps chromium
npm run test:browser
```

Pour jouer localement : `npm start`, puis `http://localhost:8000/`. `npm run docs:build` puis `npm run bandlive:test-file` créent `BandLive-test/LANCER-BandLive.html`, un essai autonome à ouvrir dans Chrome avec ses sauvegardes séparées.

`npm run audit:groups` rejoue les 20 graines sur 30 jours, dont trois prolongées à 90 jours, et produit `docs/BALANCE_V7_10.json`, tailles et stabilité comprises. Le build crée la documentation et son index de recherche. Les fichiers de tests moteur/interface/doc couvrent les règles V7.5 et BandLive, imports réels V1–V7, déterminisme, compositions, engagements, setlists, skip/replay, récompenses uniques, 100 jours de calendrier et cohérence documentaire. Chromium couvre ordinateur et tactile, rendu, recherche VitePress et parcours de jeu. Le viewport tactile ne remplace pas un test sur appareil réel.

La CI vérifie les PR sans publier; `main` publie jeu et doc après validation. Captures complètes dans les artefacts `audit-browser-*` ; capture de diagnostic `smoke-failure` en cas d’échec du contrôle rapide. Voir [PLAN_V7_1](docs/PLAN_V7_1.md), [PLAN_V7](docs/PLAN_V7.md), [DDD](docs/gdd/documentation.md), [historique](docs/CHANGELOG.md) et [contribution](CONTRIBUTING.md). L’équilibrage des profils et probabilités reste provisoire et demande un essai avec joueurs.

## Mise en scène V0.6.4

La scène conserve ses proportions et occupe une seule arène. Le show attend « Lancer le show ». Chaque musicien pige cinq cartes distinctes sans remise; son deck est visible et consultable. La carte apparaît brièvement dans un emplacement réservé de taille fixe, disparaît, puis le musicien vise et tire vers la foule. Le contact déclenche un flash, une onde, « BANG ! », les gains locaux et les réactions. Aucune défausse ne reste derrière la carte; les cartes passées sont consultables dans « Cartes jouées ». Le bouton « Son : ON/OFF » reste visible à côté de la pause. Cliquer une carte, un musicien ou un fan suspend la lecture; fermer par X, Échap ou clic extérieur rétablit son état précédent. Les cartes à venir ne sont pas révélées par la consultation du deck.

Chaque chanson se regarde en 30 secondes à ×1. `show-playback.mjs` transforme le temps de présentation en pas musicaux sans modifier les règles ou les résultats. Les anciennes prestations de 2160 pas et les nouvelles de 3600 pas gardent leurs tirages et conséquences. Les accélérations, le skip et le replay restent déterministes. `show-view.mjs` et `show.css` rendent les zones, charges, impacts, gains locaux, réactions et mini-cubes.

`tests/show.test.mjs` vérifie la durée, les événements/résultats à plusieurs vitesses, la reprise, le repérage uniforme du canvas et l’ordre carte → disparition → visée → tir → impact. Les tests navigateur couvrent le départ explicite, les decks, les inspections imbriquées, la chronologie réelle en lecture, le son visible, les proportions et six tailles d’écran. Les cartes ne recouvrent ni le public ni les decks.

## Publier pendant le développement

`main` est la version jouable. Les PR utilisent une validation rapide du moteur, des sauvegardes, du démarrage navigateur et du cache. Pages publie les fichiers déjà construits et testés, puis vérifie version et commit sur le site (`build.json`). Les audits longs et les six formats visuels roulent séparément chaque nuit ou à la demande ; lancer aussi les tests ciblés de la fonctionnalité modifiée avant fusion.

Version et notes : `npm run release:prepare -- VERSION --title "Titre" --notes-file /tmp/notes.md`. Voir [le processus complet et le retour arrière](CONTRIBUTING.md#développement-rapide--main-est-la-version-jouable).

## Atelier d’équilibrage

Réglages expose les paramètres de groupes, relations, besoins, effets d’actions et présence aux shows. Les modifications préparées sont validées puis appliquées au monde ; la sauvegarde les conserve. Export/import de profils, recherche, filtre des valeurs personnalisées et remise à zéro. [Guide, portée et limites](docs/gdd/equilibrage.md). Tests ciblés : `node --test tests/design.test.mjs` et `node tests/design-browser.test.mjs`.

## Prochain quartier et lisibilité

Un nouveau quartier commence avec trois personnages. Les relations initiales sont partielles et directionnelles pour toutes les paires; les groupes de départ conservent des liens plus forts. Avec assez de voisins, les groupes moyens comptent trois ou quatre membres, les grands jusqu’à six et le mode variable évite de répartir huit voisins en quatre duos. Les parties existantes ne sont pas réinitialisées.

Les pratiques collectives apparaissent sur la carte. Le sac affiche les invitations à traiter avant la prochaine pige, avec leur groupe, leur chanson et leur échéance. Une invitation reste soumise à l’acceptation; la prochaine pige aléatoire n’est pas prédite. Les instruments figurent dans la liste des personnages.

Une nouvelle chanson reçoit 3, 4 ou 5 tours à sa composition. Une meilleure qualité augmente la probabilité de cinq tours; la pratique n’ajoute ni niveau de morceau ni progression au groupe. La fiche d’une chanson propose **Recomposer** : un projet distinct, sur plusieurs séances, remplace la qualité et la durée seulement à son achèvement. La progression du groupe vient des shows.

Dans BandLive, la scène Minuit présente une foule organique et les cartes réelles en éventail devant chaque musicien. Le mode Disposition déplace musiciens et mains séparément ; chaque spectateur reste dans sa place logique pour conserver les rangées et voisins. Les mains ne poussent rien. Le survol pendant un drag, ou la sélection puis le focus d’une cible, affiche les dégâts et la résistance restante. Pioche et défausse sont consultables sans révéler l’ordre du prochain tirage. Explosion, transe et émotion restent purement visuelles.
