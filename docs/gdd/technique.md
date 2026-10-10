# DDD — Architecture, sauvegardes et validation

Version d’interface et format du monde : 0.7.1. L’application reste statique, sans dépendance de simulation à l’exécution ni compte serveur.

## Modules et responsabilités

| Source dans dist/ | Responsabilité |
|---|---|
| `v7.mjs` | Sacs, défausse, catalogue de traits, seuils, pressions et probabilités V7 |
| `v71.mjs` | Fourchettes, plateaux, choix instrumentaux, registre de noms, classement relatif, migration et validation V7.1 |
| `catalogue.mjs` | Filtres et tris de projets/chansons, détails des auteurs, rattachements et maîtrises |
| `engine.mjs` | Hasard du monde, activités, sommeil, séances, événements, projets, liens, orchestration minute et import |
| `social.mjs` | Migration V6 et compatibilité des commandes de sac; grief et réparation |
| `life.mjs` | Commandes de carrière, répertoire, déchéance, répétitions, départs et conséquences de shows |
| `calendar.mjs` | Quatre dates continues, créneaux, candidatures et moral collectif |
| `stage.mjs` | Tirage indépendant et physique musicale; snapshots de prestation versionnés |
| `v7-view.mjs` | Inspecteurs du sac, seuils, séance, traits, raccords et traces d’interaction |
| `app.mjs`, vues et CSS | Navigation, rendu, réglages, événements utilisateur et lecture |
| `runtime.mjs`, `show-playback.mjs` | Horloges de présentation, pause et positions, sans tirage de quartier |
| `release.mjs`, `doc-search.mjs` | Version visible, notes lues et recherche documentaire |

Le monde utilise un générateur pseudoaléatoire sérialisé. Rendu, lecture et audio n’en consomment pas. Les spectacles possèdent leur propre graine et trace; leur vitesse de lecture ne change pas leur résultat.

## Schéma V7.1

Chaque personnage conserve les besoins, émotions, traits, pressions et sommeil V7. Il ajoute `actionRanges`, `secondaryInstruments`, `learningWork`, `songMastery`, `drafts`, `excessEpisodes` et `decadenceTokens`. Les fourchettes et accumulations persistent ; aucun reroulage au rechargement.

`bag` contient six catégories dans `composition` (quantité cible), `cycleComposition` (inventaire du cycle), `remaining` (sac), `consumed` (défausse) et `pendingRemoval` (retraits restant à rencontrer). `reserved` reste nul pour la compatibilité de format. Invariant par catégorie : `cycleComposition = remaining + consumed`. Un jeton pigé est immédiatement défaussé. Retraits et acquisitions mettent à jour cet inventaire ; le remplissage transfère la défausse conservée au sac.

L’action sérialise durée indicative, temps personnel, cycle restant, cycles achevés, instrument, groupe, morceau, admission et tentatives. Une jam garde son horloge, ses paires présentes et ses paires créditées une seule fois pour la connaissance de chimie. Une séance sociale garde membres, prochaine interaction et intensité signée. Les probabilités et conséquences des échanges restent traçables ; un échange déjà admis a `rolls.acceptance: null`.

Les projets sérialisent auteurs, noms des auteurs, groupe de création, contributions, minutes, travail, cible et état, y compris abandonné. Les chansons ajoutent attribution, rattachement et classement relatif. `musicNames` réserve les identités, y compris historiques et archivées. Projet et chanson issue du projet gardent la même réservation. Les anciennes chansons ne sont pas réécrites par migration.

Une nouvelle prestation est `rulesVersion:71`. Ses exemplaires de cartes nuisibles ont des identifiants distincts, même quand le type se répète. Les anciennes prestations gardent leurs versions et snapshots.

## Migration V7 vers V7.1

Le format 0.7.0 est accepté. Il conserve personnages, compétences, seuils, émotions, chansons, projets, travail, cibles, groupes, calendriers et spectacles. Une ancienne réservation est placée en défausse ; aucun jeton n’est remboursé. Les stocks actuels restent conservés, puis les écarts d’édition anciens sont rapprochés de la cible par acquisitions ou retraits différés. La sixième catégorie commence à zéro ; la jauge de déchéance existante ajoute immédiatement sa quantité liée de jetons. Les anciens délais d’attente sociale sont retirés.

Une action conserve son avancement et son temps restant. L’ancien Jam qui répétait explicitement un morceau de groupe devient Pratiquer avec ce morceau. Les nouvelles fourchettes sont attribuées une fois avec le hasard sérialisé. Les brouillons existants deviennent les premiers brouillons séparés ; les contributions historiques absentes ne sont pas inventées.

Un monde 0.7.1 importé est validé directement. Aucun mécanisme de migration n’y masque un champ actuel manquant ou corrompu. Après export/import, le futur est exactement identique : tirages, projets, plateaux, séances et spectacles.

## Migration V1 à V6

Les formats acceptés sont 0.1.0, 0.2.0, 0.3.0, 0.4.0, 0.5.0, 0.5.1 et 0.6.0, puis 0.7.0 et 0.7.1. Les étapes historiques ajoutent d’abord les champs nécessaires; le raccord V7 s’applique une fois.

| Donnée ancienne | Traitement |
|---|---|
| Personnages, identités, âge, compétences, personnalité, déchéance, decks | Conservés; pas de réduction de niveau |
| Chansons terminées et leurs nuances | Conservées intégralement |
| Groupes, répertoire, coordination, moral, réputation et engagements | Conservés; anciens calendriers/slots passent par la migration continue existante |
| Show en cours, trace et résultats anciens | Conservés; leur version de règles garde la continuation et le replay |
| Émotions | Exaltation = joie + enthousiasme; détresse = tristesse + colère + peur, bornées à 100. Affection n’est pas convertie en amour |
| Sources émotionnelles | Trois dernières sources des familles correspondantes; provenance des projets conservée |
| Confort et attirance | Supprimés; `love` conservé, couple initialisé à faux sans inventer un ancien statut |
| Humeur et historique ancien | Ancien graphique retiré, nouvelles courbes commencent à la migration; sauvegarde d’origine disponible |
| Sac personnalisé V6 | Parts anciennes arrondies en jetons entiers; récupérer devient Détente; formation retirée. Si composition éveillée vide, utiliser l’échantillon de départ |
| Sac automatique | Échantillon selon identifiant; cycle initial complet |
| Action actuelle | Continuer hors sac; récupérer devient Détente. Formation en cours est annulée et journalisée; les autres actions gardent leur avancement |
| Compteurs de récupération et pauses | Additionnés dans Détente; nouveaux compteurs Dormir à zéro. Catégories originales gardées dans `legacyActionCounts` avec version |
| Projets inachevés | Garder travail, cible, séances, titre et sources; raccord de tonalité vers l’axe V7 courant. Recommencer les échantillons créatifs à deux axes, sans effacer le travail |
| Seuils, sommeil et associations | Attribués une fois avec le hasard sérialisé; persistants ensuite |
| Sessions de proximité V6 | Retirées; pas de déclencheur social concurrent |

La conversion préserve les productions; elle ne prétend pas reproduire les six nuances émotionnelles dans les nouvelles chansons. Le passage V7 consomme du hasard pour attribuer les champs nouveaux; un ancien monde ne doit pas continuer selon les anciennes règles. Un monde V7 reçoit ensuite le raccord V7.1 ; un monde V7.1 rechargé continue exactement le même futur.

## Stockage et sauvegarde invalide

La clé du monde reste `garage-vivant-v1`, pour reprendre les parties existantes. Avant migration dans l’interface, conserver une copie dans `garage-vivant-before-v7-1`. L’export JSON transporte le monde et ses archives; les préférences de modules et notes lues restent locales et séparées.

L’import travaille sur une copie et valide avant adoption. Un monde actuel avec valeurs non numériques, cycle incohérent, retrait différé invalide, séance personnelle invalide, champs retirés, incompatibilité Alpha/Bêta, seuils invalides ou trace invalide est refusé. Une sauvegarde locale illisible n’est pas écrasée automatiquement : l’interface demande un import valide ou un nouveau quartier explicite. Les sauvegardes dépendent du navigateur et de l’origine; exporter/importer pour changer d’hébergement.

## Vérifications de livraison

`npm test` couvre simulation déterministe, invariants sur plusieurs populations, V1–V7 réelles, travail créatif conservé, rencontres, multiset de sac, admission unique puis résultats directs, traces, seuils, sources permanentes, sommeil équivalent à l’avance minute, romance unilatérale, couples et corruption de sauvegarde. Les tests de carrière gardent engagements incompatibles, départs, setlists, skip/replay, récompenses uniques et 100 jours de calendrier.

`npm run docs:build` construit VitePress et l’index du jeu. `npm run test:browser` vérifie Chromium ordinateur/tactile, focus et scroll, éditeurs, recherche du jeu et de VitePress, seuils, catalogue et parcours de show. Les captures sont dans l’artefact CI `interface-v7` (nom historique de l’artefact). Un viewport tactile ne remplace pas un essai sur appareil réel.

La CI vérifie une PR sans déployer. `main` publie jeu et documentation ensemble après les mêmes gates. Contributions sur branche dédiée avec PR; le propriétaire décide l’intégration. Pas de multijoueur dans cette version.

Liens : [architecture documentaire](./documentation.md), [raccords](./raccords-v7.md), [temps](./temps.md), [guide](../index.md).
