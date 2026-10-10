# DDD — Admission, échanges et activités communes

Version 0.7.1. Demander à rejoindre une activité est une admission. Une fois admis, les échanges produisent directement un résultat. Les partenaires restent libres de quitter.

## Admission initiale

Socialiser approche une personne qui socialise ou se détend, selon les règles de partenaires. La demande utilise l’affinité et la tension du destinataire, ses émotions et ses traits : `0,55 + affinité ×0,003 − tension ×0,004 + exaltation ×0,001 − détresse ×0,002 + traits accept`, borné de 0,05 à 0,95. Le journal donne demandeur, destinataire, chance, tirage et acceptation. Un destinataire endormi ou engagé est indisponible.

Une personne socialisant tente chaque partenaire disponible une fois dans sa recherche. Un refus ne remet aucun jeton. Une admission acceptée à partir d’une détente termine celle-ci et passe en Socialiser hors sac ; aucun temps de détente résiduel n’est repris.

Une séance possède lieu, membres, création, prochain échange et intensité. Une admission auprès d’un membre inscrit rejoint sa séance. Sinon, la première paire acceptée ouvre une séance. Une arrivée ne réinitialise pas l’horloge. Les personnes présentes à proximité n’entrent pas automatiquement. La séance se termine si moins de deux participants sociaux restent effectivement inscrits.

Jam peut être rejoint après demande au musicien déjà inscrit ; les commandes collectives explicites ont déjà leur propre confirmation et ne la redemandent pas. Pratiquer et Composer n’acceptent de collaboration qu’avec un groupe musical actif commun. En pratique, le morceau est commun au cycle. La pratique n’est pas interrompue par une conversation ordinaire.

## Cadence et départs

Premier échange à la constitution, puis un seul échange de paire toutes les 15 minutes par séance sociale. Choisir un initiateur parmi les admis, puis un destinataire selon les liens. Les effets directs concernent cette paire. L’intensité commune va de −100 à 100 : +4 favorable, −8 défavorable, −1 neutre. Elle contribue à la décision de quitter lorsque les échanges deviennent difficiles ; elle ne remplace pas les besoins personnels.

Après l’échange, le destinataire décide de rester ou partir selon [Actions](./actions.md). Énergie sous 12 ou durée supérieure à sa borne peuvent aussi provoquer son départ. Un échange défavorable ou une intensité sous −40 permet une sortie immédiate si sa détresse dépasse 80. Le rôle d’initiateur est retiré à chaque échange ; aucun personnage n’a un rôle permanent.

## Initiative et sélection des partenaires

Poids d’initiative : `max(0,05; 1 + somme des modificateurs initiative)`. Alpha, Bêta et les traits sociaux modifient ce poids; aucun ne garantit l’initiative. L’initiateur est tiré parmi les participants admissibles, puis le destinataire parmi les partenaires disponibles.

Poids d’un partenaire : `max(0,1; 1 + max(0, affinité)/20 − tension/30 + groupe + inséparables)`, selon le point de vue de l’initiateur. Un groupe commun actif ajoute `1 + développement/8`; si plusieurs sont communs, prendre le maximum. Inséparables ajoute 6 à partir de 75 d’affinité dans cette direction. Ce qualificatif porte sur la relation ciblée, pas sur tous les voisins.

Pour choisir une jam ouverte, utiliser la moyenne des poids vers ses membres. La chimie ne pondère pas la sélection; elle reste musicale et peut renforcer les gains d’affinité d’un échange musical favorable. `development` est bien la Coordination affichée; aucune seconde jauge n’a été créée. L’attachement individuel aux groupes reste reporté.

## Interactions et propositions

Discuter garde un poids 10. Soutenir est disponible avec détresse du destinataire ≥15 et utilise empathie/20 et les traits de soutien. Faire une avance exige deux adultes, un lien amoureux de l’initiateur ≥5 et un délai de 12 heures dans cette direction ; sa pondération utilise les traits de flirt et le paramètre Avances amoureuses. Le soutien favorable apaise la détresse et retire 2 de déchéance ; les effets amoureux existants sont conservés.

**Proposer une activité** devient une quatrième interaction : poids 0,4 après 30 minutes de séance et affinité de l’initiateur >20. Elle propose Détente, Jam ou Déchéance ; Pratiquer et Composer deviennent admissibles avec un groupe commun. Elle utilise le même résultat favorable/neutre/défavorable qu’un échange. Seul un favorable lance une activité commune hors sac. Les autres membres continuent leur conversation.

Une pratique proposée porte sur un morceau du groupe lorsque disponible. Une composition proposée partage un projet entre coauteurs du groupe. Aucune proposition de sommeil et aucun nouvel agenda fictif. Le journal garde `proposedActivity`, le résultat et les transitions.

## Résultat après admission

Pour un échange entre admis, `rolls.acceptance` est nul : aucune deuxième validation. Tirer favorable, neutre ou défavorable depuis les chances V7 : favorable = `0,45 + affinité ×0,0025 − tension ×0,002 + somme exaltations ×0,0007 − somme détresses ×0,001 + traits`, borné 0,08–0,80 ; défavorable = `(0,15 + tension ×0,003 − affinité ×0,001 + somme détresses ×0,001 + traits) × Risque d’accrochage`, borné 0,03–0,70. Le soutien ajoute empathie/500 et ses traits au favorable. Si les deux dépassent 0,95 au total, les ramener proportionnellement à 0,95 ; neutre prend le reste.

Les appels explicites d’interaction hors séance, comme les commandes de soutien/avance, gardent leur test de disponibilité et leur acceptation propre ; ils ne constituent pas une réadmission automatique à chaque échange collectif. Un refus hors séance ne tire pas de résultat et produit la réaction de détresse existante de l’initiateur.

## Conséquences communes

Dans les deux directions, un échange résolu après admission ajoute +6 social, incrémente les rencontres et actualise leur date. Favorable : affinité +0,4 × Évolution des liens, confiance +1, tension −3 × Évolution des liens, grief −2, exaltation base +3. Défavorable : affinité −0,5 × Évolution des liens, confiance −1, tension +8 × Évolution des liens, grief +6, détresse base +5. Neutre : pas de changement d’affinité/confiance/tension.

En musique, un favorable ajoute à la base d’affinité `max(0; chimie−50)/100`, avant Évolution des liens. Chaque échange musical accepté ajoute +2 complicité, ou −1 s’il est défavorable. Un moment musical technique peut ensuite avoir ses effets propres, y compris un accrochage; son événement est distinct et identifiable.

Les liens sont orientés, les émotions passent par leurs réactions personnelles et les effets spécifiques du soutien et de l’avance sont asymétriques. Aucun seuil émotionnel ne déclenche une dispute directement.

## Traces et raccords

Journal et inspecteur exposent admission, membres, prochaine cadence, intensité, probabilité, tirage et effets. La lecture ne consomme pas de hasard. Les interactions musicales favorables ou neutres peuvent encore déclencher un des six moments techniques, séparément identifiable.

Un échange favorable admissible peut toujours créer un groupe ou permettre une adhésion. Lien amoureux et couples gardent leurs règles. Voir [Relations](./relations.md), [Musique](./musique.md), [Actions](./actions.md).
