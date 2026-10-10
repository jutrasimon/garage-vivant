# DDD — Raccords et limites V7.1

Version 0.7.1. Ce registre décrit les consommateurs réellement actifs et ceux qui restent débranchés. Le mandat autorise ces limites lorsqu’elles sont identifiées et ne cassent pas la partie ; aucune mécanique de remplacement ne les masque.

## Carte des raccords actifs

| Système | Consommateur actuel | Frontière |
|---|---|---|
| Sac sans remise | Six actions, acquisition immédiate, défausse et retraits différés | Aucun remboursement après refus, recherche ou interruption |
| Durées | Fourchettes persistantes et cycles personnels | Sommeil et engagements gardent leur priorité |
| Socialisation | Admission initiale puis résultat direct, intensité et départ | Aucun second consentement à la forme d’un échange |
| Proposition d’activité | Autres actions existantes ; liens et ancienneté | Pas de nouvelle activité inventée |
| Pratique | Instruments, plateaux, maîtrise solo et répétition de groupe | Aucun gain d’expression par défaut |
| Jam | Expression solo ou collective et moments musicaux | Aucun crédit direct de répertoire ou coordination |
| Composition | Plusieurs projets, coauteurs, contributions, finalisation et abandon | Projet inachevé distinct d’une chanson faible |
| Catalogue | Qualité relative, archives manuelles, maîtrise et filtres | Faibles restent utilisables ; pas d’effacement des œuvres |
| Noms | Banques distinctes et registre commun persistant | Anciens noms préservés, pas de suffixe numérique de secours |
| Déchéance | Chaînes, jauge existante, quantité liée de cartes/jetons | Cartes ajoutées ; retrait en défausse pour les jetons |
| Groupes et romance | Conséquences sociales favorables et commandes existantes | Aucun jeton de formation ni nouvelle mécanique amoureuse |
| Scène et carrière | Calendrier, répertoire, coordination, réputation, replay | Versions historiques et récompenses uniques conservées |
| Besoins, émotions et traits | Quatre besoins et deux axes V7 | Aucun retour de l’humeur, du confort ou des scores de pige |

## Dix raccords débranchés visibles dans le jeu

| Identifiant | Limite exacte | Ce qui reste branché |
|---|---|---|
| `inspiration-resourcing` | Aucune jauge d’inspiration ou de ressourcement | Détente : énergie, plaisir et réduction de détresse |
| `personal-agenda` | Aucun agenda général ni obligation quotidienne fictive | Engagements de spectacle, sommeil, besoins et départs |
| `memory-learning` | Pas de bonus direct des souvenirs aux percées d’apprentissage | Souvenirs, archives et sources de composition |
| `chemistry-learning` | Pas de multiplicateur de plateau lié à la chimie en répétition | Chimie des échanges de jam, confiance et maîtrise collective |
| `social-search-pressure` | Pas de multiplicateur propre à la recherche sociale ni déprime automatique supplémentaire | Usure normale du lien social et pressions V7 pendant la recherche |
| `absolute-archive` | L’ancien paramètre `archiveThreshold` est conservé sans consommateur | Classement relatif aux autres chansons des auteurs ; archives manuelles |
| `memory-mood` | Le poids historique `effect` des souvenirs n’agit plus sur l’humeur supprimée | Dates, descriptions et provenance musicale |
| `six-tones` | Deux axes ne reconstituent pas les six nuances des nouvelles chansons | Exaltation/détresse nouvelles et chansons historiques intactes |
| `personality-choice` | Personnalité et priorités ne pondèrent plus les jetons | Consommateurs sociaux, musicaux et de carrière existants |
| `lazy-choice` | Bonus de choix du trait Relax sans consommateur | Trait historique marqué débranché dans son catalogue |

Le panneau Réglages reprend ces identifiants depuis le moteur. Le test documentaire exige leur présence ici. Les paramètres numériques choisis pour 7.1 sont des valeurs d’équilibrage documentées, pas des décisions de conception rétroactivement attribuées au joueur.

## Limites conservées et refus explicites

Une pratique collective sans morceau du répertoire est refusée. Jam reste une action distincte à choisir. Aucun nom libre après parcours de la banque : création refusée et journalisée ; pas de doublon, de titre inventé hors banque ou de boucle infinie. Les noms historiques similaires ne sont pas renommés.

Un groupe sans coordination s’archive selon les règles existantes. Un projet abandonné reste consultable mais ne reprend pas automatiquement. Les répétitions ne donnent pas de nouvelles exceptions de traits à l’expression. L’extension du quartier et les personnalités spécialiste/généraliste restent reportées.

Les acquisitions peuvent modifier le sac pendant son cycle ; les retraits attendent les jetons défaussés. Une récupération de déchéance peut donc laisser des jetons encore à rencontrer. L’inspecteur expose ce délai ; il ne retire pas secrètement les jetons du sac.

L’équilibrage doit encore être éprouvé par des parties jouées. Les tests attestent déterminisme, sauvegardes, contraintes, recherches et affichage, pas un équilibre définitif. Le viewport tactile ne remplace pas un appareil réel.

Liens : [Actions](./actions.md), [Musique](./musique.md), [Compositions](./compositions.md), [Déchéance](./decheance.md), [Technique](./technique.md).
