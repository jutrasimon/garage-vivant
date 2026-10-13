# DDD — Pratique, Jam et apprentissage

Version 0.7.10. Pratiquer développe la technique et prépare les morceaux. Jam favorise l’expression libre et les rencontres. Composer développe une œuvre persistante : [Compositions et catalogue](./compositions.md).

## Instruments, apprentissage et plateaux

La pratique choisit le principal dans 85 % des choix lorsqu’il existe des secondaires ; sinon toujours le principal. Les secondaires sont les autres instruments avec compétence initiale ≥25, hors écriture ; leur liste est persistante. Les 15 % restants choisissent uniformément un secondaire. Le principal n’est pas réécrit par l’instrument d’une séance.

Chaque gain d’apprentissage passe par `gain × max(0,16 ; 1 − compétence/115) × (1 + exaltation/200 + (plaisir−50)/200)`. Dix pour cent donnent un petit gain immédiat ; 90 % alimentent un travail accumulé par compétence. Chaque tranche de 2 points accumulés produit une percée de 2 points et retire cette tranche du travail. Les compétences restent bornées à 100. Les compteurs persistent à la sauvegarde.

Bases instrumentales : Pratiquer et Composer 0,009 × Apprentissage/min ; Oreille musicale ×1,4. Jam 0,013 × Apprentissage/min. Composer ajoute 0,018 × Apprentissage/min d’écriture. Les moments d’apprentissage musical ont leurs gains propres, également soumis aux plateaux. Les souvenirs et la chimie en répétition ne modulent pas directement ces plateaux : [Raccords](./raccords-v7.md).

## Pratiquer et répéter

Une séance alterne instruments, technique et morceaux par cycles de 15 minutes. Avec des morceaux admissibles, leur choix est favorisé à 65 % ; sinon travail technique. Le choix est réévalué à la fin d’un cycle si le personnage continue. La pratique n’ajoute aucune expression par défaut.

Un personnage peut travailler ses œuvres et les morceaux de ses groupes. Depuis 0.7.12, travailler un morceau entraîne les compétences individuelles, sans créer de maîtrise personnelle du morceau.

La pratique collective exige un groupe actif commun et un morceau. Une personne ayant pigé Pratiquer peut demander à rejoindre une pratique de morceau ; après acceptation, elle se déplace vers son partenaire. La séance attribue explicitement groupe et morceau ; des appartenances multiples ne créditent pas tous les groupes. Une pratique collective spontanée peut changer de morceau ensemble à la fin des cycles. Un appel Répéter garde le morceau annoncé jusqu’à sa fin ; les instruments peuvent encore varier. Chaque participant conserve son propre compteur de cycle et son choix de départ : le meneur ne remet pas le temps des autres à zéro.

Avec au moins deux membres effectivement présents, la répétition est affichée comme une activité collective. Depuis 0.8.0, elle donne +1 coordination par cycle de 15 minutes réellement travaillé à deux ou plus, sans maîtrise de morceau. Le compteur de répétition et les moments du groupe avancent à chaque cycle travaillé. Une personne seule peut continuer son travail personnel. Pratique solo et collective donnent 1 XP individuelle par 15 minutes réellement jouées, sans gain pendant trajet ou attente. Les niveaux (80, 180, 360, 650, 1 100 XP cumulés…) donnent un échange de carte conservé dans la fiche.

Les commandes Répéter placent des invitations hors sac, consultées à la fin de l’action courante. Le premier arrivé attend sans gains ; la pratique commence avec deux membres. Voir [Groupes](./groupes.md). Elles n’utilisent plus Jam pour préparer un morceau. Une demande sans morceau doit être refusée ou passée explicitement à Jam ; elle ne doit pas produire une répétition de technique présentée comme morceau travaillé.

## Jam ouverte et solo

Le libellé est Jam. Le premier musicien joue seul dès son arrivée ; aucun minimum de deux, aucune attente de 90 minutes. Une personne ayant pigé Jam peut rejoindre une séance après demande et acceptation. Les séances ayant moins de 180 minutes jouées et moins de 360 minutes d’âge sont candidates ; ces bornes limitent la recherche, pas une obligation de participer.

Chaque arrivant a son temps personnel et sa fourchette. La séance garde une seule horloge musicale, un échange de paire toutes les 15 minutes jouées quand des partenaires sont présents. Un participant peut partir à la fin d’un cycle ; le dernier continue solo. Les paires ayant réellement joué gagnent une connaissance de chimie à la fin d’une participation terminée.

Expression, plaisir et instrument augmentent ; le gain social continu demande au moins deux présents. Aucun crédit direct de répertoire, Coordination, chanson terminée ou réputation. Les idées peuvent nourrir une composition ultérieure ; les gains de talent ou de relations peuvent avoir des conséquences indirectes sur la carrière. Le temps de jam est du temps qui n’avance pas les projets de carrière.

## Six moments techniques de jam

Après une interaction musicale acceptée favorable ou neutre, un tirage musical conserve synchronisation, apprentissage, idée, débat, accrochage et consolidation. Les poids dépendent de chimie, complicité, écart de maîtrise, empathie, créativité, exaltation, différences de style, risque d’échange défavorable et discipline. Les répétitions du même résultat dans une séance ont un facteur `0,6 puissance nombre déjà vécu`.

| Moment | Base affinité, tension, complicité |
|---|---|
| Synchronisation | +4, −2, +5 |
| Apprentissage | +3,5, −1, +3 |
| Idée | +3,5, −1, +3 |
| Débat | +2, +1, +2 |
| Accrochage | −3, +6, −1 |
| Consolidation | +2,5, −0,5, +3,5 |

La base d’affinité est ralentie par ×0,1 ×(0,7 + empathie/150). Les changements relationnels utilisent Évolution des liens et le facteur de répétition. Un grief réduit les diminutions de tension de ces moments à un dixième. Accrochage ajoute un grief et détresse base +7 ×facteur; les autres donnent exaltation base +4, ou +9 pour Idée. Débat donne aussi expression +4 ×facteur; apprentissage et consolidation gardent leurs gains de compétences. Le journal distingue ce résultat technique du tirage d’échange qui l’a précédé.

La chimie potentielle est symétrique, calculée depuis similitude de créativité/discipline, styles, instruments et empathie. Elle ne choisit pas les partenaires. Sa connaissance augmente seulement après des jams communes terminées distinctes; l’option Laboratoire montre la valeur exacte sans modifier le moteur.

## Groupes, coordination et répertoire

Le [DDD Groupes](./groupes.md) possède formation/recrutement, attachement, couleur musicale, réputation, adoption exclusive, invitations et dissolution. `development` reste le champ de Coordination. La pratique ne crédite qu’un groupe et un morceau actifs annoncés, pas tous les groupes des participants. Une improvisation ou une proximité sans séance ne constitue pas une répétition.

Les pratiques physiques peuvent produire un échange musical admis toutes les 15 minutes travaillées, entre le premier participant présent et un autre présent choisi. Les mêmes relations et moments techniques sont réutilisés. Jam reste ouvert hors groupe ; il ne crédite pas la Coordination. Une chanson adoptée reste au groupe après départ d’un auteur ; celui-ci conserve son crédit d’auteur et ses compétences.

## Déchéance et carrière

Les règles d’excès, chaînes, récupération et paquets contaminés sont dans [Déchéance](./decheance.md). Les chansons, répertoires et qualités sont dans [Compositions](./compositions.md). La préparation et l’accueil du public restent dans [Shows](./shows.md).
