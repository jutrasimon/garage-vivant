# DDD — Raccords V7 et limites identifiées

Version 0.7.0. Le mandat de réalisation autorise des raccords débranchés s’ils sont identifiés et ne cassent pas le jeu. Ce registre remplace l’exigence idéale du plan initial « aucun système débranché » par l’état concret livré. Aucun mécanisme nouveau ne comble silencieusement les trous.

## Carte des raccords

| Ancien consommateur | Destination V7 | Statut et preuve consultable |
|---|---|---|
| Scores et sac à remise | Composition finie, réserve, consommation, cycle | Actif; multiset de cycle testé et fiche du sac |
| Priorités, attraits musical/social, variation de choix | Aucun poids dans la pige | Retirés de l’interface; champs hérités sans effet |
| Confort | Aucune jauge de remplacement | Supprimé des besoins, effets et migration |
| Six émotions du personnage | Exaltation et détresse indépendantes | Actif; deux courbes, pressions et seuils |
| Humeur et son risque de conflit | Chances d’acceptation/résultat avec deux axes et traits | Humeur supprimée; trace de chaque échange |
| Besoins → comportement | Pressions temporelles et seuils personnels | Actif; table personnelle des pressions |
| Traits permanents | Catalogue et somme des sources effectives | Actif; modificateurs sociaux, musicaux et sommeil |
| Formation comme jeton | Conséquence d’échanges favorables admissibles | Actif; groupe autonome et adhésion possibles |
| Jams recrutant de force | Séances ouvertes et intentions indépendantes | Actif; test d’absence d’interruption du compositeur |
| Échanges de croisement / détente automatique | Intentions sociales sur place et horloge de séance | Ancien déclencheur retiré; pas d’horloge concurrente |
| Attirance et amour vécu | Lien amoureux dirigé et statut de couple | Attirance retirée; amour existant conservé |
| Grief, tension et confiance | Refroidissement minute, érosion d’affinité, coopération | Actif; différences amis/inconnus testées |
| Développement et Coordination | Même champ `development` | Actif; poids de groupe et répétition conservés |
| Personnalité | Consommateurs utiles listés dans Personnages | Actif ailleurs que la pige; pas de nouvelles dimensions |
| Souvenirs | Archives, texte et provenance musicale | Actif comme histoire; poids d’humeur débranché |
| Projets et chansons | Travail persistant, qualités, deux axes nouveaux | Actif; anciennes chansons intactes, sources conservées |
| Public et cartes émotionnelles | Bonus musical avec correspondance d’axe explicitée dans Shows | Actif; anciennes prestations gardent leurs règles |
| Carrière, invitations, candidatures | Commandes existantes et probabilités de coopération | Actif; parcours distinct du trio d’interactions de quartier |
| Spectacles, skip et replay | Moteur musical conservé avec trace de règles | Actif; migrations actives et résultats reproductibles |
| Coucher et engagement | Sommeil hors sac, priorité engagement, jetons rendus | Actif; avance nocturne et départ sauvegardable |

## Quatre raccords débranchés visibles dans le jeu

| Identifiant | Limite exacte | Ce qui reste utile |
|---|---|---|
| `memory-mood` | Le poids historique `effect` des souvenirs n’influence plus l’humeur, supprimée | Archives, dates, intensité descriptive, titres et sources de chansons |
| `six-tones` | Deux axes ne reproduisent pas les six nuances précédentes des nouvelles chansons | Qualité, genre, provenance et anciennes chansons intégrales |
| `personality-choice` | Personnalité et priorités ne modifient plus les chances des jetons | Leurs consommateurs musicaux, sociaux, émotionnels et de carrière restent décrits |
| `lazy-choice` | L’ancien bonus de choix du trait Relax n’a plus de consommateur | Trait historique conservé, marqué débranché dans le catalogue |

Ces quatre états reprennent le registre utilisé par le panneau Réglages; leur présence dans la documentation est vérifiée automatiquement. Aucune ne se présente comme un effet actif. Aucun ancien calcul d’humeur ou de choix n’est relancé en secours.

## Frontières conservées

Une confirmation de répétition, invitation ou engagement n’est pas une discussion de quartier : ses disponibilités et son calcul de carrière sont conservés. Un résultat musical technique n’est pas le résultat d’acceptation sociale : il possède son événement et ses effets. Le public garde des sensibilités musicales; elles ne constituent pas six jauges émotionnelles du personnage.

L’équilibrage est provisoire : huit sacs contrastés, douze traits conditionnels de test et probabilités centralisées. La compréhension et la fréquence des romances/groupes nécessitent un essai avec joueurs. Les tests attestent les invariants et la continuité, pas un équilibre définitif.

## Pistes reportées

Refonte complète des actions, de la personnalité, de la déchéance ou de la composition; attachement individuel aux groupes; éditeur de seuils/traits; conflits particuliers entre Alphas; excuses, critiques et propositions d’idées comme interactions distinctes; journée représentant des mois. Aucun de ces chantiers n’est dissimulé dans la V7.

Liens : [architecture](./technique.md), [catalogue](./traits.md), [plan de conception V7](../PLAN_V7.md), [versions](../versions.md).
