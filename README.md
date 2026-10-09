[▶ Jouer sur GitHub Pages](https://jutrasimon.github.io/garage-vivant/)

> Publication préparée. Activation initiale : Settings → Pages → Source : GitHub Actions.

# Garage vivant · v0.4.0

Laboratoire autonome de musiciens de banlieue. Application statique en français, sans dépendance ni API. Entrée : `dist/index.html`.

## Boucle

Observer → comprendre les décisions → ajuster personnages et priorités → suivre rencontres, projets, chansons et groupes. Les groupes sont autonomes, non exclusifs et sans plafond de membres ou d’appartenances. Population du laboratoire : 24 maximum. Répertoire de groupe, répétition chanson par chanson, carrière et audio restent hors de cette version.

## Actions et compositions

Sept actions : se reposer, socialiser, pratiquer, jammer ensemble, composer, décrocher, former un groupe. Alimentation, travail, satiété et argent restent retirés. Les priorités 1/2/3/0 sont conservées ; une énergie critique impose toujours le repos.

Composer crée ou poursuit un projet avec une identité, un titre, un style et des causes persistantes. Chaque minute réellement passée à composer avance le travail ; déplacements et autres activités n’avancent pas le projet. Une interruption conserve sa progression. Chaque séance achevée augmente le compteur de séances ; une chanson est publiée seulement lorsque le projet est prêt et la séance terminée. À ×1, environ quatre à six séances sont nécessaires selon la discipline. Le réglage « Progression des compositions » accélère ou suspend cette progression.

La fiche et le carnet distinguent projets en cours et chansons terminées. La qualité affichée pendant le projet est un potentiel provisoire, sans variation finale. Les 75 premières minutes de travail créatif déterminent la tonalité et les expériences fondatrices ; les séances suivantes développent la chanson sans effacer cette origine. Une idée issue d’une jam peut nourrir le prochain projet, avec sa provenance et un bonus d’ensemble. Une même idée n’est pas réutilisée pour plusieurs projets du même auteur. Les anciens catalogues restent complets. Un scénario qui lance un autre projet conserve l’ancien dans le carnet.

La réputation combine talent (25), catalogue (30), reconnaissance (25) et collaborations (20). Le catalogue dépend de la qualité et sature progressivement avec le nombre de chansons ; la reconnaissance utilise les huit meilleurs échos. Un brouillon ou sa révision ne donne aucune récompense de publication.

## Sessions et journal

Les jams gardent un rendez-vous commun : invitation, déplacement, attente, session effective puis bilan. Il faut deux musiciens présents pour avancer les 85 minutes communes. Une attente solitaire de 90 minutes conduit à la pratique solo. Le départ d’un partenaire suspend la musique s’il ne reste qu’une personne. La carte garde les surbrillances, connexions et noms des activités communes. L’action est à droite du cube, l’émotion facultative à gauche ; un trajet affiche une flèche.

Les jams peuvent produire synchronisation, apprentissage, idée, débat artistique, accrochage ou consolidation. Les probabilités dépendent notamment de la compatibilité, du vécu, des compétences, de la discipline, de l’empathie, des styles, de la confiance et du risque de conflit. Chaque résultat a ses propres effets et expose son explication. Répéter un résultat dans la même jam multiplie ses effets par 0,6 à chaque répétition. L’empathie peut apaiser un accrochage ; un débat artistique ne crée pas automatiquement de l’hostilité.

Le journal présente une entrée par activité, avec état, lieu, durée effectivement passée, participants et déroulement dépliable. Le bilan de jam conserve les participants qui sont partis. Les événements bruts restent accessibles via une option de laboratoire. Filtrage par personnage et type conservé. Lecture et détails ouverts sont préservés pendant les mises à jour. Les bilans et événements sont des vues des effets déjà appliqués : les consulter ne modifie pas la simulation.

Historique borné : 240 bilans récents (les activités en cours sont conservées), 24 événements par bilan, 500 événements bruts. Le catalogue de chansons et les projets ne sont pas tronqués.

## Relations et découverte

Affinité, confiance, tension, complicité musicale, attirance et amour restent orientés. Alex → Charlie décrit ce qu’Alex ressent. La chimie potentielle dépend des profils et est symétrique ; elle est distincte de la complicité vécue.

La chimie est inconnue avant une première jam commune terminée. Ensuite, un grade apparaît : difficile, contrastée, prometteuse ou très prometteuse. La confiance dans ce constat passe d’impression incertaine (1–2 sessions) à tendance observée (3–5), puis confirmée (6+). La familiarité ne fait pas monter artificiellement le potentiel. Les événements répétés d’une seule session ne comptent pas comme plusieurs découvertes. Les valeurs exactes restent disponibles dans le laboratoire ; la vue ordinaire ne les divulgue pas par les couleurs ou les infobulles.

Les émotions, souvenirs, empathie, avances réciproques et retour au calme de la V3 restent actifs. Les tensions diminuent de 0,4 par heure. La formation autonome conserve ses conditions : affinité ≥22 dans les deux sens, confiance ≥18, tension <40 et complicité ≥10 — ou affinité mutuelle ≥40. Rendez-vous physique et délai de douze heures conservés.

## Temps et sauvegardes

Slider 0–10 par pas de 0,1 ; zéro met en pause. Jouer reprend la dernière vitesse non nulle. À ×1, une seconde réelle vaut huit minutes simulées. +1 h avance soixante minutes puis met en pause. Le moteur avance dans tous les panneaux internes ; interpolation maintenue hors carte, sans rattrapage au retour. Un onglet navigateur masqué suspend le temps.

Sauvegarde locale automatique et export/import JSON reproductible. Migrations V0.1, V0.2 et V0.3 : chansons, personnages, relations et groupes conservés. Les activités et rendez-vous V3 en cours sont conservés ; leur instrumentation commence au moment de la migration. Aucune expérience passée de découverte n’est inventée. Une copie locale avant migration est conservée sous `garage-vivant-before-v4` lorsque le stockage le permet. Une sauvegarde illisible n’est pas écrasée automatiquement ; import ou création explicite d’un quartier requis pour reprendre la sauvegarde.

## Vérifications

- `node tests/engine.test.mjs` : 39 jours simulés, huit graines et population de 24, valeurs bornées et déterminisme.
- `node tests/systems.test.mjs` : anciennes migrations, projets, jams à deux, groupes autonomes et multiples, groupe de quinze, catalogue de plus de 100, réputation, émotions et sérialisation.
- `node tests/v4.test.mjs` : migration V3 avec jam et composition en cours ; interruption/reprise ; origine émotionnelle ; six résultats ; inspiration ; bilans sans doubles effets ; découverte par sessions distinctes ; départs ; contrôle de progression ; import invalide.
- `node tests/runtime.test.mjs` : vitesses 0/0,5/1/10, reprise, carte cachée et absence de rattrapage.
- `node tests/interface.test.mjs` : fonctions de rendu, chimie cachée et valeurs de laboratoire, textes échappés, projets et détails des sessions ; vérification structurelle des deux bulles.

Aucun navigateur de validation autorisé n’est disponible dans cet environnement. Le rendu visuel et les interactions réelles de défilement n’ont pas été vérifiés ici.

## Développement et prochaine étape

Dépôt : https://github.com/jutrasimon/garage-vivant

Le [plan V5](docs/PLAN_V5.md) décrit la prochaine évolution. L’audit transversal des glitches de scroll est la priorité P0, avant les nouveaux systèmes de gameplay. Ce plan n’est pas encore implémenté.

Pour lancer localement : `python3 -m http.server 8000 --directory dist`, puis ouvrir `http://localhost:8000`. Les tests nécessitent Node.js et aucune installation de dépendances ; leurs commandes figurent ci-dessus. `dist/` contient directement le code source exécutable, sans étape de compilation.

La V4 importée correspond au commit Sites `e57388010c37dda631668b9533af29537e404a29`. L’import GitHub est un instantané du code, des tests et des fixtures ; il ne recrée pas l’historique Git antérieur. Le workflow GitHub Actions vérifie les modifications et publie `dist/` depuis `main` lorsque GitHub Pages est activé. Les pull requests lancent les tests sans publier le site principal.

## Collaboration

Voir [CONTRIBUTING.md](CONTRIBUTING.md) pour les branches, l’identité des auteurs, les messages de commit, les tests et l’intégration via pull request.
