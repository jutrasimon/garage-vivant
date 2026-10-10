# DDD — Cinq actions et sac Rapin sans remise

Version 0.7.0. Le sac est le seul choix autonome d’activité d’éveil. Dormir est hors sac; Former un groupe devient une conséquence de rencontres favorables.

## Activités, durées et besoins

Effets bruts par minute réellement sur place, avant usure des besoins :

| Action | Durée | Énergie | Social | Plaisir | Expression |
|---|---|---|---|---|---|
| Décrocher `relax` | 45 min | +0,16 | — | +0,8 | — |
| Socialiser `social` | 50 min | — | via échanges acceptés | +0,35 | — |
| Pratiquer `practice` | 65 min | −0,055 | — | +0,26 | +0,6 |
| Jammer `jam` | 85 min de séance commune | −0,05 | +0,6 | +0,5 | +0,7 |
| Composer `write` | 75 min | −0,03 | — | +0,2 | +0,65 |

Décrocher réduit aussi la détresse de 0,07/min et la déchéance de 0,006/min. Perfectionniste multiplie l’expression par 0,8 pendant pratique/composition. Les besoins restent bornés. Ces activités gardent leurs effets existants adaptés; leur refonte complète est reportée.

Le trajet se déplace à 12 unités par minute et ne compte pas comme temps d’activité. Les garages accueillent la musique; les maisons le sommeil; le parc Décrocher. Socialiser vise un voisin qui socialise ou décroche; à défaut, un lieu social : café, parc ou disquaire.

## Cycle fini et réservation

Le sac contient cinq quantités entières. Chacune peut aller de 0 à 100; au moins un jeton doit rester dans la composition future. Un jeton individuel restant a autant de chance de sortir que tout autre. Pour une action : `chance = quantité restante / total restant`.

La pige retire un jeton des restants et le réserve. Il devient consommé à la première minute réelle d’activité. Pour Socialiser, il devient consommé au premier contact, accepté ou refusé. Pour Jammer, il devient consommé à la première minute réellement jouée à deux. Une intervention ou un coucher rend un jeton réservé non commencé; un jeton déjà consommé ne revient pas.

Invariant par action : `composition du cycle = restants + consommés + réservation éventuelle`. Quand aucun jeton ne reste et qu’aucun n’est réservé, la prochaine pige ouvre le cycle suivant et remplit depuis la composition future. Le numéro de cycle est visible. Un cycle garantit des occurrences, pas une durée équivalente pour chaque action.

Besoins, émotions, traits et personnalité ne repondèrent pas la pige. L’ancien mode Meilleur score est retiré; les anciens champs de priorités sont conservés uniquement pour compatibilité de données, sans consommateur de décision.

## Modifier le sac

L’édition change exclusivement la composition du prochain remplissage. Les restants, consommés et réservés du cycle courant demeurent identiques. Les verrous, redistribution à 100 % et profil automatique V6 sont retirés. Une valeur invalide ou une composition entièrement vide est refusée et signalée.

La fiche et Actions donnent composition courante, restants, consommés, réservation, cycle et composition future. Une probabilité à zéro peut simplement signifier que tous les jetons de cette action sont épuisés dans ce cycle. Si aucun ne reste, l’inspecteur montre explicitement les chances après le prochain remplissage; la trace de décision garde les quantités réellement utilisées au tirage.

## Huit échantillons de départ

Les huit premiers identifiants reçoivent les sacs ci-dessous; les identifiants suivants reprennent la série modulo huit. Ce sont des profils de test, pas un équilibrage définitif.

| Profil | Décrocher | Socialiser | Pratiquer | Jammer | Composer | Total |
|---|---|---|---|---|---|---|
| A équilibré court | 2 | 2 | 2 | 2 | 2 | 10 |
| B social | 2 | 7 | 2 | 3 | 1 | 15 |
| C pratique | 3 | 2 | 10 | 3 | 2 | 20 |
| D composition | 4 | 3 | 5 | 5 | 13 | 30 |
| E collectif | 5 | 9 | 5 | 17 | 4 | 40 |
| F pauses | 24 | 12 | 10 | 8 | 6 | 60 |
| G créatif solitaire | 10 | 4 | 24 | 8 | 34 | 80 |
| H équilibré long | 20 | 20 | 20 | 20 | 20 | 100 |

## Recherche impossible et attente

Socialiser cherche au maximum 30 minutes sur place sans contact. Jammer attend au maximum 90 minutes seul sur place. Dans ces cas : rendre le jeton non commencé, clore l’activité comme annulée, attendre 15 minutes, puis reprendre une pige. Aucun refus fictif, aucune action accomplie, aucune transformation automatique en pratique solo. La recherche peut être retentée si la même action ressort; un sac uniquement social ou jam peut donc attendre plusieurs fois, tout en laissant avancer les autres systèmes et le sommeil.

## Interventions

Lancer hors sac est une commande manuelle, journalisée. Le musicien incarné suit l’intervention; un autre peut refuser la proposition selon le calcul de coopération conservé. Elle rend une réservation non commencée et ne consomme pas un nouveau jeton. L’autonomie reprend à sa fin. Le sommeil en cours et le trajet vers un engagement bloquent l’intervention ordinaire. Une répétition demandée utilise l’admissibilité et l’acceptation existantes des partenaires; ce parcours manuel est distinct de la jam issue d’un jeton et ne recrute pas automatiquement les musiciens occupés.

L’inspecteur montre les probabilités réellement utilisées pour une pige. Pendant une intervention, un sommeil, un engagement ou une activité héritée, il affiche la cause hors sac plutôt que des probabilités qui n’ont pas déterminé cette activité. La progression du sommeil utilise sa durée personnelle habituelle.

Les compteurs distinguent démarrages, terminaisons et interruptions. Une recherche annulée n’est pas une terminaison. Les compteurs hérités de récupération sont conservés comme Décrocher; leurs catégories exactes avant migration restent dans `legacyActionCounts`.

Liens : [sommeil](./sommeil.md), [séances et échanges](./interactions.md), [musique et groupes](./musique.md), [migration](./technique.md).
