# DDD — Sommeil quotidien hors sac

Version 0.7.1. Le sommeil est obligatoire selon l’horaire personnel. Il n’ajoute ni ne consomme de jeton.

## Horaire et besoin

À l’initialisation, le besoin de sommeil est tiré entre 6 et 10 heures entières. La durée habituelle commence égale à ce besoin. Le coucher de départ est 23 h, ou 2 h pour Oiseau de nuit. Besoin, durée, prochain coucher et minutes obtenues sont sauvegardés. L’édition du trait Oiseau de nuit met à jour le prochain horaire; elle ne réécrit pas la durée personnelle.

Au coucher, interrompre l’action d’éveil et se déplacer à sa maison. Le temps de trajet n’est pas compté comme sommeil. Tout jeton déjà pigé reste défaussé, même si son trajet ou son activité est interrompu. La fiche présente horaire, besoin, durée et temps d’activité restant; `wakeAt` est une estimation incluant le trajet, pas une horloge qui impose le réveil.

## Récupération et réveil

Chaque minute réellement dormie ajoute `100 / besoin en minutes` d’énergie, jusqu’à 100. Au réveil, l’énergie ne peut dépasser `100 × minutes obtenues / besoin`, borné à 100. Une durée de six heures pour un besoin de huit heures donne donc au maximum 75. Les autres besoins continuent à s’user et leurs pressions émotionnelles restent actives.

L’action se termine après la durée habituelle réellement dormie. Elle incrémente son compteur hors sac; la prochaine action d’éveil est pigée au tick suivant. Le prochain coucher utilise la première occurrence future de l’heure habituelle. Un coucher différé après minuit ne saute pas la nuit suivante. Aucun ancien seuil d’énergie critique ne court-circuite le sac. Détente restaure un peu d’énergie et de détente pendant l’éveil; ce n’est pas une nuit.

## Engagements nocturnes

Un engagement confirmé et son trajet ont priorité. Le coucher attendu est différé pendant l’engagement. Si le départ pour le show interrompt un sommeil, le prochain coucher est rendu exigible après l’engagement pour permettre une nouvelle nuit. Les jetons déjà pigés ne retournent pas au sac au départ.

Le show fige l’horloge du quartier. Son énergie dépensée et ses conséquences sont appliquées à la fin; un musicien trop épuisé peut manquer un créneau selon les règles de disponibilité existantes. Ce risque est affiché; aucune récupération secrète n’est ajoutée pour le faire jouer.

## Accélération lorsque tous dorment

En lecture active, quand tout le monde a l’action Dormir, l’interface avance rapidement jusqu’au premier réveil. Elle appelle la même simulation minute par minute, avec une garde de 1440 minutes. Besoins, pressions, émotions, traits, relations, déchéance et calendrier continuent à évoluer. Le début d’un show arrête cette avance.

Pause, onglet masqué et bouton +1 h conservent leur sens : +1 h avance au plus 60 minutes et ne lance pas le raccourci au-delà. Il n’existe pas de rattrapage pendant que la page est masquée.

Liens : [temps](./temps.md), [actions](./actions.md), [personnages](./personnages.md), [shows](./shows.md).
