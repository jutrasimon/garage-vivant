# DDD — Déchéance, chaînes et paquets contaminés

Version 0.7.1. La déchéance agit dans le quartier et pendant les spectacles. La jauge existante reste bornée de 0 à 100 ; l’historique des épisodes sert à mesurer les excès rapprochés.

## Action et chaînes

Déchéance est la sixième action du sac. Elle représente fête et excès. Elle peut être imposée manuellement ou proposée depuis une conversation favorable. Effets/min : plaisir +0,5, énergie −0,18. Par cycle de 15 minutes : exaltation de base +3 et déchéance +3 × nombre d’épisodes dans les 12 dernières heures, au minimum ×1.

Une proposition partagée conduit les deux personnages au même lieu ; chacun garde ses cycles personnels. Aucun système distinct de fête collective n’est ajouté.

Le premier cycle d’une séance inscrit un épisode ; les cycles suivants du même épisode n’en créent pas d’autres. Une nouvelle séance rapprochée renforce donc la chaîne. Les épisodes éloignés sortent de la fenêtre lors du prochain premier cycle. Une chaîne accélère la jauge et ses deux conséquences ; aucune jauge parallèle d’addiction ou de maladie n’est ajoutée.

La commande existante Prolonger la fête garde son événement immédiat déchéance +18, énergie −8 et exaltation de base +26, puis lance désormais une séance Déchéance hors sac. Sa suite n’est plus présentée comme une détente réparatrice.

## Jetons et cartes

Quantité nuisible = `min(ceil(cartes musicales de base ×0,6) ; floor(déchéance/20))`. Pour un paquet de neuf cartes : à 100 de déchéance, cinq cartes nuisibles et cinq jetons Déchéance. La même quantité lie les deux conséquences ; le plafond se base sur le paquet musical, pas sur le total contaminé.

Lors d’un changement de quantité cible, le sac acquiert immédiatement la différence ou retire la défausse disponible. Le reste du retrait attend les piges. Un seuil maintenu n’ajoute pas des jetons chaque minute. La quantité Déchéance est affichée en lecture seule dans l’éditeur du sac, car elle dépend de la jauge ; les autres catégories restent éditables. Un jeton de déchéance encore dans le sac persiste malgré récupération ; son action doit être rencontrée avant retrait définitif.

Le paquet de spectacle conserve ses huit à dix cartes musicales et ajoute les cartes nuisibles. Les types existants sont réutilisés : Gueule de bois, Trou de mémoire, Ego en roue libre, Absence au mauvais moment. Les occurrences supplémentaires utilisent le dernier type ; chaque exemplaire possède un identifiant distinct. Tirer cinq cartes sans remise conserve donc une chance accrue de nuisance, avec plusieurs occurrences possibles d’un type.

Le moteur de nouvelles prestations porte `rulesVersion:71`, accepte jusqu’à seize exemplaires et conserve leurs identifiants dans main, événements, inspection et replay. Les anciennes prestations gardent leur snapshot et leur version ; aucune réécriture de leur paquet enregistré. La règle du retrait en défausse concerne le sac d’actions ; les cartes de scène sont recalculées depuis la jauge à la préparation du nouveau spectacle.

## Récupération et interface

Sommeil réel −0,025/min ; Détente −0,006/min ; soutien favorable −2. Une nuit musicale sacrifiée avec énergie sous 25 entre 22 h et 6 h ajoute 0,025/min. Les coûts existants de Tout donner restent actifs. Le succès seul ne déclenche pas un excès.

La fiche montre la jauge, les cartes nuisibles réellement ajoutées, les jetons dans le sac/la défausse, les retraits en attente et les épisodes rapprochés. Les cartes conservant le même type ont des exemplaires distincts visibles dans le deck ; aucune carte musicale n’est effacée par leur ajout.

Liens : [Actions et inventaire](./actions.md), [Shows](./shows.md), [Musique](./musique.md), [Raccords](./raccords-v7.md).
