# DDD — Architecture, sauvegardes et validation

Version d’interface et format du monde : 0.7.0. L’application reste statique, sans dépendance de simulation à l’exécution ni compte serveur.

## Modules et responsabilités

| Source dans dist/ | Responsabilité |
|---|---|
| `v7.mjs` | Catalogue, constantes, sacs, seuils, traits effectifs, pressions, probabilités et poids relationnels purs |
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

## Schéma V7

Chaque personnage ajoute : `bag` (composition future, composition du cycle, restants, consommés, réservation et cycle), `needThresholds` (quatre paliers et taux), `emotionalThresholds` (axe, seuil, trait), `activeTraits`, `pressures`, `emotionDecay` calculée après une minute, `sleep` (horaire, besoin, durée, échéance et temps obtenu), `waitUntil` et historique à deux axes.

Les émotions ont exactement exaltation et détresse; les besoins ont exactement énergie, social, plaisir et expression. Le modèle relationnel garde affinité, confiance, tension, complicité, grief, compteurs et `love`, désormais Lien amoureux; il ajoute `couple`. `attraction` est absent. `socialSessions` sérialise les membres et l’horloge de chaque lieu; les jams gardent leur horloge commune. Les événements d’interaction sérialisent probabilités, inputs, bases, modificateurs, tirages et conséquences avant/après.

Une réservation est cohérente avec une activité de sac non commencée. Chaque catégorie conserve `cycleComposition = remaining + consumed + reservation`. Un rechargement V7 valide ne réinitialise ni sac, ni seuil, ni trait, ni sommeil, ni hasard.

## Migration V1 à V6

Les formats acceptés sont 0.1.0, 0.2.0, 0.3.0, 0.4.0, 0.5.0, 0.5.1 et 0.6.0, puis le format actuel. Les étapes historiques ajoutent d’abord les champs nécessaires; le raccord V7 s’applique une fois.

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
| Sac personnalisé V6 | Parts anciennes arrondies en jetons entiers; récupérer devient Décrocher; formation retirée. Si composition éveillée vide, utiliser l’échantillon de départ |
| Sac automatique | Échantillon selon identifiant; cycle initial complet |
| Action actuelle | Continuer hors sac; récupérer devient Décrocher. Formation en cours est annulée et journalisée; les autres actions gardent leur avancement |
| Compteurs de récupération et pauses | Additionnés dans Décrocher; nouveaux compteurs Dormir à zéro. Catégories originales gardées dans `legacyActionCounts` avec version |
| Projets inachevés | Garder travail, cible, séances, titre et sources; raccord de tonalité vers l’axe V7 courant. Recommencer les échantillons créatifs à deux axes, sans effacer le travail |
| Seuils, sommeil et associations | Attribués une fois avec le hasard sérialisé; persistants ensuite |
| Sessions de proximité V6 | Retirées; pas de déclencheur social concurrent |

La conversion préserve les productions; elle ne prétend pas reproduire les six nuances émotionnelles dans les nouvelles chansons. Le passage V7 consomme du hasard pour attribuer les champs nouveaux; un ancien monde ne doit pas continuer selon les anciennes règles. Un monde V7 rechargé continue exactement le même futur.

## Stockage et sauvegarde invalide

La clé du monde reste `garage-vivant-v1`, pour reprendre les parties existantes. Avant migration dans l’interface, conserver une copie dans `garage-vivant-before-v7`. L’export JSON transporte le monde et ses archives; les préférences de modules et notes lues restent locales et séparées.

L’import travaille sur une copie et valide avant adoption. Un monde actuel avec valeurs non numériques, cycle incohérent, reservation orpheline, champs retirés, incompatibilité Alpha/Bêta, seuils invalides ou trace invalide est refusé. Une sauvegarde locale illisible n’est pas écrasée automatiquement : l’interface demande un import valide ou un nouveau quartier explicite. Les sauvegardes dépendent du navigateur et de l’origine; exporter/importer pour changer d’hébergement.

## Vérifications de livraison

`npm test` couvre simulation déterministe, invariants sur plusieurs populations, V1–V6 réelles, travail créatif conservé, rencontres, multiset de sac, refus sans deuxième tirage, traces, seuils, sources permanentes, sommeil équivalent à l’avance minute, romance unilatérale, couples et corruption de sauvegarde. Les tests de carrière gardent engagements incompatibles, départs, setlists, skip/replay, récompenses uniques et 100 jours de calendrier.

`npm run docs:build` construit VitePress et l’index du jeu. `npm run test:browser` vérifie Chromium ordinateur/tactile, focus et scroll, éditeurs, recherche du jeu et de VitePress, seuils, catalogue et parcours de show. Les captures sont dans l’artefact CI `interface-v7`. Un viewport tactile ne remplace pas un essai sur appareil réel.

La CI vérifie une PR sans déployer. `main` publie jeu et documentation ensemble après les mêmes gates. Contributions sur branche dédiée avec PR; le propriétaire décide l’intégration. Pas de multijoueur dans cette version.

Liens : [architecture documentaire](./documentation.md), [raccords](./raccords-v7.md), [temps](./temps.md), [guide](../index.md).
