# DDD — Séances, partenaires et interactions

Version 0.7.0. Les intentions viennent du sac; les séances donnent les occasions. Indisponibilité, refus et résultat défavorable sont trois situations différentes.

## Séances sociales et musicales

Socialiser rejoint une personne ayant l’intention Socialiser ou Décrocher. Une approche ciblée tente d’abord cette personne si elle est toujours disponible sur place. Sinon, la séance choisit un partenaire selon les liens. Au moins une intention sociale et deux personnes sur place sont nécessaires. Deux personnages qui décrochent côte à côte ne déclenchent pas d’échange seuls. Aucun échange autonome ne naît d’un simple croisement de trajets.

Une séance sociale par lieu possède un seul `nextExchange` : premier échange dès la rencontre, puis toutes les 15 minutes. L’arrivée d’un membre ne réinitialise pas cette horloge. Parmi les intentions sociales présentes, choisir un initiateur par poids; les personnes en pause peuvent recevoir l’échange tout en poursuivant leur action.

Une jam ouvre une séance au garage sans interrompre les autres intentions. Un autre jeton Jammer peut la rejoindre tant que son temps joué est sous 60 minutes et son âge sous 180 minutes. Deux personnes présentes démarrent la musique; chaque trajet reste individuel. Une seule horloge commune mesure les 85 minutes, avec un échange toutes les 15 minutes jouées. Les arrivants jouent le temps restant de la séance. Une perte de partenaire suspend la musique et lance l’attente de 90 minutes. Les inscriptions manuelles de répétition conservent leurs règles de commande.

La fiche de séance expose identifiant, membres, admission, prochaine cadence et poids. Les surlignages de carte correspondent aux séances actives. Les contreparties de recherche impossible sont dans le [DDD Actions](./actions.md).

## Initiative et sélection des partenaires

Poids d’initiative : `max(0,05; 1 + somme des modificateurs initiative)`. Alpha, Bêta et les traits sociaux modifient ce poids; aucun ne garantit l’initiative. L’initiateur est tiré parmi les participants admissibles, puis le destinataire parmi les partenaires disponibles.

Poids d’un partenaire : `max(0,1; 1 + max(0, affinité)/20 − tension/30 + groupe + inséparables)`, selon le point de vue de l’initiateur. Un groupe commun actif ajoute `1 + développement/8`; si plusieurs sont communs, prendre le maximum. Inséparables ajoute 6 à partir de 75 d’affinité dans cette direction. Ce qualificatif porte sur la relation ciblée, pas sur tous les voisins.

Pour choisir une jam ouverte, utiliser la moyenne des poids vers ses membres. La chimie ne pondère pas la sélection; elle reste musicale et peut renforcer les gains d’affinité d’un échange musical favorable. `development` est bien la Coordination affichée; aucune seconde jauge n’a été créée. L’attachement individuel aux groupes reste reporté.

## Catalogue minimal

| Interaction | Poids autonome et conditions | Effet spécifique |
|---|---|---|
| Discuter `discuss` | poids 10 | Échange ordinaire, possible naissance rare du lien amoureux |
| Soutenir `support` | destinataire avec détresse ≥15; poids `max(0; empathie/20 + traits support)` | Favorable : détresse du destinataire −12 × puissance de soutien; déchéance −2. Défavorable : détresse supplémentaire +2. Neutre : aucun apaisement spécifique. |
| Faire une avance `advance` | adultes; lien de l’initiateur ≥5; délai de 12 h par direction; poids `max(0,1; 1 + traits flirt des deux) × Avances amoureuses` | Favorable : lien initiateur +6, destinataire +4 seulement si son lien atteint déjà 5. Défavorable : initiateur −2. |

Puissance de soutien : `max(0,1; 1 + modificateurs supportPower de l’initiateur)`. Le soutien peut être refusé. Les idées et critiques distinctes, ainsi que les excuses, restent reportées. Les six moments musicaux existants habillent la musique après un échange accepté favorable ou neutre; ils ne constituent pas six nouvelles interactions sociales.

## Acceptation puis résultat

Un destinataire endormi ou engagé n’est pas disponible. L’acceptation utilise son affinité et sa tension envers l’initiateur. Les formules ci-dessous utilisent des jauges 0–100; les probabilités sont entre 0 et 1.

| Chance | Base, apports et bornes |
|---|---|
| Acceptation | `0,55 + affinité ×0,003 − tension ×0,004 + exaltation destinataire ×0,001 − détresse destinataire ×0,002 + traits accept destinataire`; bornée 0,05–0,95 |
| Favorable | `0,45 + affinité ×0,0025 − tension ×0,002 + somme exaltations ×0,0007 − somme détresses ×0,001 + traits positive des deux`; soutien ajoute empathie initiateur/500 et traits supportQuality. Bornée 0,08–0,80 |
| Défavorable | `(0,15 + tension ×0,003 − affinité ×0,001 + somme détresses ×0,001 + traits negative des deux) × Risque d’accrochage`; bornée 0,03–0,70 |

Si favorable + défavorable dépasse 0,95, multiplier les deux par `0,95 / somme`. Neutre prend le reste. Cela laisse toujours une issue positive possible sous forte tension, ainsi qu’une part neutre. Le réglage Risque d’accrochage à zéro ne supprime pas le plancher de 3 %.

Tirer l’acceptation en premier. Un refus donne une petite hausse de détresse à l’initiateur : base +1, modulée comme événement émotionnel. Aucun résultat d’échange n’est tiré après refus. Après acceptation, un autre tirage donne favorable, neutre ou défavorable.

## Conséquences communes

Dans les deux directions, un échange accepté ajoute +6 social, incrémente les rencontres et actualise leur date. Favorable : affinité +0,4 × Évolution des liens, confiance +1, tension −3 × Évolution des liens, grief −2, exaltation base +3. Défavorable : affinité −0,5 × Évolution des liens, confiance −1, tension +8 × Évolution des liens, grief +6, détresse base +5. Neutre : pas de changement d’affinité/confiance/tension.

En musique, un favorable ajoute à la base d’affinité `max(0; chimie−50)/100`, avant Évolution des liens. Chaque échange musical accepté ajoute +2 complicité, ou −1 s’il est défavorable. Un moment musical technique peut ensuite avoir ses effets propres, y compris un accrochage; son événement est distinct et identifiable.

Les liens sont orientés, les émotions passent par leurs réactions personnelles et les effets spécifiques du soutien et de l’avance sont asymétriques. Aucun seuil émotionnel ne déclenche une dispute directement.

## Explication des tirages

Le journal brut et les détails de séance affichent initiateur, destinataire, type, acceptation, résultat, jauges et traits utilisés, bases, modificateurs, chances finales, tirages numériques et état avant/après des besoins, émotions et liens. Une tentative refusée affiche explicitement « résultat non tiré ». Ouvrir ces détails n’applique aucun effet et ne consomme aucun hasard.

Liens : [traits](./traits.md), [relations](./relations.md), [musique](./musique.md), [personnages](./personnages.md).
