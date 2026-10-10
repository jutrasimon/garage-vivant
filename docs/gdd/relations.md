# DDD — Relations, lien amoureux et souvenirs

Version 0.7.0. Les relations A → B sont un point de vue. La case inverse porte le point de vue de B et peut différer.

## Dimensions conservées

| Champ | Rôle |
|---|---|
| Affinité `affinity`, −100 à 100 | Lien durable; évolue lentement, pondère rencontres et apaisement |
| Tension `tension`, 0 à 100 | Friction rapide; freine rencontres et favorise les issues défavorables |
| Confiance `trust`, 0 à 100 | Expériences de coopération; utilisée par musique, invitations et engagements |
| Complicité `collaboration`, 0 à 100 | Coopération musicale vécue |
| Lien amoureux `love`, 0 à 100 | Lien romantique orienté; distinct de l’amitié et de la musique |
| Couple `couple`, booléen | Statut partagé entre les deux directions |
| Chimie potentielle | Fonction symétrique des profils; connaissance découverte par jams terminées |

L’attirance séparée est retirée. Il n’existe pas de conversion d’affection en amour. Inséparables est une propriété affichée d’une direction à partir de 75 d’affinité; elle ajoute +6 au poids de choix de ce partenaire.

## Tension, grief et affinité

À chaque minute, la force du grief baisse de 0,015. La tension baisse de `0,02 + 0,18 × max(0; affinité)/100`, sans passer sous le plancher `min(15; grief ×0,45)`. Le grief peut donc maintenir une friction après un conflit. Un échange favorable retire 2 de grief; les moments musicaux gardent leur réparation existante. Un désaccord ne produit pas d’excuses automatiques.

Si la tension est encore au moins 30 après refroidissement, retirer `0,0005 × (tension−20)` d’affinité par minute. Un pic bref et une tension persistante n’ont pas le même coût cumulé. Les jauges ne sont pas inverses ni transférées point pour point. Après une journée sans interaction, affinité et lien amoureux sont multipliés par 0,999 chaque heure; la confiance ne remonte pas avec la distance.

Les [échanges](./interactions.md) et moments musicaux appliquent leurs effets identifiés; les traits peuvent disparaître tandis que leurs conséquences relationnelles persistent.

## Naissance du lien amoureux

Après une discussion favorable entre adultes, chaque direction dont le lien est exactement zéro a indépendamment une chance de naissance : `3,5 % × Avances amoureuses × max(0; 1 + traits romanticStart)`. Audacieux ajoute 0,25 au multiplicateur. Une naissance met ce lien à 5; elle ne met pas les personnages en couple.

La plupart des discussions restent amicales. Un lien non nul ne gagne pas automatiquement des points par simple répétition. À partir de 5, une avance devient admissible; acceptation, résultat et effets asymétriques sont dans le DDD Interactions. Le délai entre tentatives d’avance est de 12 heures par direction, refus inclus. Audacieux peut augmenter le poids des avances de l’initiateur ou vers ce destinataire, sans contourner le seuil ou l’acceptation.

## Couples et ruptures

Une fois par heure et par paire : si aucun n’est en couple avec l’autre et les deux liens sont au moins 40, 8 % de chance de former un couple. Si le statut existe et l’un des liens est sous 25, 15 % de chance de rupture. Le statut est synchronisé dans les deux directions. Les seuils différents évitent une alternance à la moindre fluctuation. Il n’y a pas de règle d’exclusivité nouvelle dans ce jalon.

## Souvenirs descriptifs et provenance

Chaque échange accepté peut créer un souvenir daté et une source pour le projet musical. Le monde conserve jusqu’à six souvenirs récents par personne pendant six heures, puis une archive de 600 entrées. Un souvenir hérité dont la date manquait l’indique; aucun passé n’est inventé.

Le champ historique `effect` est une intensité descriptive (Sensible et stabilité le modulent). **Son ancien effet sur l’humeur est débranché.** La fiche l’annonce; il n’ajoute pas une pression cachée sur exaltation ou détresse. Les événements fournissent directement leurs conséquences émotionnelles et leur provenance. L’archive et le journal restent consultables et exportés.

## Disponibilité et commandes de carrière

Les invitations de groupe, confirmations de répétition et candidatures aux shows gardent leurs probabilités de carrière fondées sur affinité, confiance, tension, déchéance et coordination. Ces commandes ne passent pas par le tirage des trois interactions de quartier; cette frontière est explicitée dans les [raccords](./raccords-v7.md). Le sommeil et les engagements rendent certains partenaires indisponibles.

Liens : [interactions](./interactions.md), [musique](./musique.md), [traits](./traits.md), [sauvegardes](./technique.md).
