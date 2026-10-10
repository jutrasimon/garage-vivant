# DDD — Six actions, sac et défausse

Version 0.7.1. Six intentions d’éveil : Détente, Socialiser, Pratiquer, Jam, Composer et Déchéance. Dormir est hors sac. Former un groupe reste une conséquence d’échanges favorables admissibles.

## Pige et inventaire

Chaque personnage pige quand une action se termine. Aucune cadence périodique, aucun tirage pendant le trajet ou pour changer de contenu dans une séance. La fin normale choisit immédiatement la suite ; après annulation d’une recherche ou réveil, la boucle minute reprend le choix suivant. Sommeil, commandes manuelles et laboratoire peuvent interrompre une action ; leurs actions imposées restent hors sac.

Le jeton pigé va immédiatement en défausse, y compris si l’activité échoue ou est interrompue. Aucun remboursement. Une acquisition entre directement dans le sac courant. Un retrait n’est possible qu’en défausse. Si la quantité à retirer dépasse la défausse disponible, le reste est enregistré dans `pendingRemoval`. Le prochain jeton concerné est d’abord pigé, défaussé puis retiré : son action se réalise quand même.

Au prochain choix nécessaire, un sac vide reprend les jetons conservés de la défausse. Aucun stock ancien ne recrée les retraits. Invariant : `cycleComposition = remaining + consumed` ; `reserved` est toujours nul. Les noms historiques des champs sont conservés : `remaining` est le sac, `consumed` la défausse, `composition` la quantité souhaitée. L’activité courante ne détient aucun deuxième exemplaire du jeton.

Une édition accepte une quantité entière de 0 à 100. Une hausse acquiert immédiatement la différence ; une baisse retire la défausse puis attend les piges restantes. Une demande d’inventaire entièrement vide est refusée. Si un import valide arrive néanmoins sans inventaire, le personnage attend explicitement ; aucun jeton de secours n’est créé. Une probabilité est la quantité restant dans le sac divisée par son total. Les besoins ne repondèrent pas la pige. La déchéance agit par de vrais jetons.

## Fourchettes et cycles

À la création, chaque action reçoit une fourchette personnelle persistante : base × facteur individuel tiré dans [0,8 ; 1,2], puis minimum ×0,65 et maximum ×1,4, arrondis. Bases d’équilibrage : Détente 45, Socialiser 90, Pratiquer 65, Jam 85, Composer 75 et Déchéance 50 minutes. Ces bases ne sont pas des durées fixes.

Chaque séance tire une durée indicative entre ses bornes. Détente se termine à cette durée. Les autres activités musicales et les excès évaluent leur poursuite par cycles de 15 minutes. Avant la borne minimale, elles continuent sauf énergie sous 12 ; à la borne maximale elles terminent au prochain cycle. Entre les bornes, la probabilité de départ est `0,1 + pression + satisfaction + dépassement`, plafonnée à 0,85. Pression = `max(0 ; (35 − min(énergie, plaisir, social))/100)` ; satisfaction +0,35 si social >85 en discussion ou expression >90 en Jam/composition ; dépassement +0,25 après la durée indicative.

Après chaque échange social, le destinataire évalue son départ. La fatigue ou sa borne personnelle supérieure peuvent aussi terminer sa participation pendant la boucle minute. Socialiser n’est pas limité à 50 minutes. Le sommeil et les engagements conservent leurs priorités. Une interruption termine la séance ; ses effets et son travail déjà produits sont acquis.

## Effets sur place

Effets bruts par minute, avant usure des besoins :

| Action | Énergie | Social | Plaisir | Expression |
|---|---|---|---|---|
| Détente | +0,16 | — | +0,12 | — |
| Socialiser | — | +6 par échange résolu | +0,35 | — |
| Pratiquer | −0,055 | — | +0,26 | — |
| Jam | −0,05 | +0,6 seulement avec partenaire | +0,5 | +0,7 |
| Composer | −0,03 | — | +0,2 | +0,65 |
| Déchéance | −0,18 | — | +0,5 | — |

Détente diminue aussi la détresse de 0,07/min et la déchéance de 0,006/min. Perfectionniste réduit l’expression de composition par ×0,8 ; il ne crée pas de gain d’expression en pratique. Toutes les jauges restent bornées. Inspiration et ressourcement n’ont aucune jauge active.

Les trajets avancent à 12 unités/min et ne comptent pas comme travail. Le monde actuel conserve ses garages, maisons, lieux sociaux et parc ; les demandes de participation et contraintes musicales ne dépendent pas de leurs noms. Agrandir le quartier reste un chantier distinct.

## Recherche et transitions

Une recherche sociale sans admission se termine après 30 minutes sur place. Aucun jeton rendu, aucun délai supplémentaire de 15 minutes. La recherche infructueuse n’applique pas un nouveau multiplicateur de perte sociale ou de détresse : ce raccord évoqué reste à concevoir. Jam commence seul et n’a plus d’attente de 90 minutes pour partenaire.

L’entrée sociale acceptée termine la détente. Les propositions d’activité favorables lancent l’activité commune hors sac et terminent les actions précédentes, sans deuxième pige ni restitution. Les participants ayant déjà pigé une activité musicale conservent ce jeton pour rejoindre une séance admissible. Voir [Interactions](./interactions.md).

## Huit échantillons de départ

Les huit premiers identifiants reçoivent les sacs ci-dessous; les identifiants suivants reprennent la série modulo huit. Ce sont des profils de test, pas un équilibrage définitif.

| Profil | Détente | Socialiser | Pratiquer | Jammer | Composer | Total |
|---|---|---|---|---|---|---|
| A équilibré court | 2 | 2 | 2 | 2 | 2 | 10 |
| B social | 2 | 7 | 2 | 3 | 1 | 15 |
| C pratique | 3 | 2 | 10 | 3 | 2 | 20 |
| D composition | 4 | 3 | 5 | 5 | 13 | 30 |
| E collectif | 5 | 9 | 5 | 17 | 4 | 40 |
| F pauses | 24 | 12 | 10 | 8 | 6 | 60 |
| G créatif solitaire | 10 | 4 | 24 | 8 | 34 | 80 |
| H équilibré long | 20 | 20 | 20 | 20 | 20 | 100 |

Ces profils V7 sont conservés ; la sixième quantité Déchéance commence à zéro et augmente selon ses règles. Les cycles mesurent des occurrences, pas des parts égales de temps.

Liens : [Interactions](./interactions.md), [Musique](./musique.md), [Compositions et catalogue](./compositions.md), [Déchéance](./decheance.md), [Sommeil](./sommeil.md), [Technique](./technique.md).
