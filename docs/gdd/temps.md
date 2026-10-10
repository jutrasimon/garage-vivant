# DDD — Temps et horloges

| Horloge | Règle |
|---|---|
| Quartier | 8 minutes simulées par seconde réelle à ×1. |
| Journée | 1440 minutes : 3 minutes réelles à ×1 hors pauses; 6 à ×0,5; 18 secondes à ×10. |
| Vitesse | 0–10 par pas de 0,1; aimantation au glissement sur 0,5 et entiers; zéro suspend. |
| +1 h | Avance jusqu’à 60 minutes puis pause; s’arrête si un show commence. |
| Spectacle | 30 secondes de présentation par chanson à ×1. Le moteur conserve ses 3600 pas musicaux; la cadence de lecture relie les deux horloges. |
| Durée musicale | 4 minutes par morceau, créneaux de 10/20 minutes; sert au programme et aux disponibilités. |
| Direct | Quartier gelé; reprise au même instant, sans vieillissement ni rattrapage. |
| Onglet masqué | Quartier et lecture suspendus. |
| Sommeil collectif | En lecture active, avance minute par minute jusqu’au premier réveil; garde 1440 min et arrêt au début d’un show. |
| Échanges | Une horloge par séance, cadence de 15 minutes; arrivée d’un membre sans réinitialisation. |
| Séances V7.1 | Fourchettes personnelles ; pratique, composition, Jam et excès évaluent leur poursuite par cycles de 15 minutes. |
| Projets et excès | Abandon après 14 jours sans travail ; chaînes de déchéance dans une fenêtre de 12 heures. |
| Âge | Identité éditable; pas de vieillissement simulé. |

Les jours mesurent la vie du quartier, pas des années compressées. Les paramètres d’usure, apprentissage et retour émotionnel modifient des taux simulés; la vitesse de lecture ne change pas leurs règles.

Le raccourci de sommeil ne prolonge pas le bouton +1 h et ne tourne pas en pause. Les besoins, jauges, liens et calendrier évoluent réellement pendant cette avance. Voir le [DDD Sommeil](./sommeil.md).

Liens : [shows](./shows.md), [actions](./actions.md), [architecture](./technique.md).
