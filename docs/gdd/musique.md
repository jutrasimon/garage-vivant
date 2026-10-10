# DDD — Pratique, Jam et groupes

Version 0.7.1. Pratiquer développe la technique et prépare les morceaux. Jam favorise l’expression libre et les rencontres. Composer développe une œuvre persistante : [Compositions et catalogue](./compositions.md).

## Instruments, apprentissage et plateaux

La pratique choisit le principal dans 85 % des choix lorsqu’il existe des secondaires ; sinon toujours le principal. Les secondaires sont les autres instruments avec compétence initiale ≥25, hors écriture ; leur liste est persistante. Les 15 % restants choisissent uniformément un secondaire. Le principal n’est pas réécrit par l’instrument d’une séance.

Chaque gain d’apprentissage passe par `gain × max(0,16 ; 1 − compétence/115) × (1 + exaltation/200 + (plaisir−50)/200)`. Dix pour cent donnent un petit gain immédiat ; 90 % alimentent un travail accumulé par compétence. Chaque tranche de 2 points accumulés produit une percée de 2 points et retire cette tranche du travail. Les compétences restent bornées à 100. Les compteurs persistent à la sauvegarde.

Bases instrumentales : Pratiquer et Composer 0,009 × Apprentissage/min ; Oreille musicale ×1,4. Jam 0,013 × Apprentissage/min. Composer ajoute 0,018 × Apprentissage/min d’écriture. Les moments d’apprentissage musical ont leurs gains propres, également soumis aux plateaux. Les souvenirs et la chimie en répétition ne modulent pas directement ces plateaux : [Raccords](./raccords-v7.md).

## Pratiquer et répéter

Une séance alterne instruments, technique et morceaux par cycles de 15 minutes. Avec des morceaux admissibles, leur choix est favorisé à 65 % ; sinon travail technique. Le choix est réévalué à la fin d’un cycle si le personnage continue. La pratique n’ajoute aucune expression par défaut.

Un personnage peut travailler ses œuvres et les morceaux de ses groupes. Le travail solo du morceau augmente sa maîtrise personnelle de 0,08/min. Cette valeur est distincte de la compétence instrumentale et de la maîtrise collective.

La pratique collective exige un groupe actif commun et un morceau. Une personne ayant pigé Pratiquer peut demander à rejoindre une pratique de morceau ; après acceptation, elle se déplace vers son partenaire. La séance attribue explicitement groupe et morceau ; des appartenances multiples ne créditent pas tous les groupes. Le contenu collectif change ensemble à la fin des cycles.

Avec au moins deux membres effectivement présents, la répétition augmente Coordination de `0,07 × min(1 ; présents/4)`/min. La maîtrise collective du morceau augmente de `0,12 × (0,65 + coordination/200) × min(1 ; présents/membres du groupe)`/min. Une paire ne reçoit ce crédit qu’une fois par minute. Le compteur de répétition et les moments du groupe avancent à chaque cycle travaillé. Une personne seule peut continuer son travail personnel.

Les commandes Répéter lancent maintenant Pratiquer avec les confirmations de membres existantes. Elles n’utilisent plus Jam pour préparer un morceau. Une demande sans morceau doit être refusée ou passée explicitement à Jam ; elle ne doit pas produire une répétition de technique présentée comme morceau travaillé.

## Jam ouverte et solo

Le libellé est Jam. Le premier musicien joue seul dès son arrivée ; aucun minimum de deux, aucune attente de 90 minutes. Une personne ayant pigé Jam peut rejoindre une séance après demande et acceptation. Les séances ayant moins de 180 minutes jouées et moins de 360 minutes d’âge sont candidates ; ces bornes limitent la recherche, pas une obligation de participer.

Chaque arrivant a son temps personnel et sa fourchette. La séance garde une seule horloge musicale, un échange de paire toutes les 15 minutes jouées quand des partenaires sont présents. Un participant peut partir à la fin d’un cycle ; le dernier continue solo. Les paires ayant réellement joué gagnent une connaissance de chimie à la fin d’une participation terminée.

Expression, plaisir et instrument augmentent ; le gain social continu demande au moins deux présents. Aucun crédit direct de répertoire, Coordination, chanson terminée ou réputation. Les idées peuvent nourrir une composition ultérieure ; les gains de talent ou de relations peuvent avoir des conséquences indirectes sur la carrière. Le temps de jam est du temps qui n’avance pas les projets de carrière.

## Six moments techniques de jam

Après une interaction musicale acceptée favorable ou neutre, un tirage musical conserve synchronisation, apprentissage, idée, débat, accrochage et consolidation. Les poids dépendent de chimie, complicité, écart de maîtrise, empathie, créativité, exaltation, différences de style, confiance, risque d’échange défavorable et discipline. Les répétitions du même résultat dans une séance ont un facteur `0,6 puissance nombre déjà vécu`.

| Moment | Base affinité, confiance, tension, complicité |
|---|---|
| Synchronisation | +4, +3, −2, +5 |
| Apprentissage | +3,5, +2, −1, +3 |
| Idée | +3,5, +2, −1, +3 |
| Débat | +2, +1, +1, +2 |
| Accrochage | −3, −3, +6, −1 |
| Consolidation | +2,5, +1,5, −0,5, +3,5 |

La base d’affinité est ralentie par ×0,1 ×(0,7 + empathie/150). Les changements relationnels utilisent Évolution des liens et le facteur de répétition. Un grief réduit les diminutions de tension de ces moments à un dixième. Accrochage ajoute un grief et détresse base +7 ×facteur; les autres donnent exaltation base +4, ou +9 pour Idée. Débat donne aussi expression +4 ×facteur; apprentissage et consolidation gardent leurs gains de compétences. Le journal distingue ce résultat technique du tirage d’échange qui l’a précédé.

La chimie potentielle est symétrique, calculée depuis similitude de créativité/discipline, styles, instruments et empathie. Elle ne choisit pas les partenaires. Sa connaissance augmente seulement après des jams communes terminées distinctes; l’option Laboratoire montre la valeur exacte sans modifier le moteur.

## Formation et appartenance aux groupes

Après un échange favorable social ou musical, deux partenaires peuvent former un groupe avec affinité mutuelle ≥22, confiance mutuelle ≥18, tension dans les deux sens <40, et complicité mutuelle ≥10 ou affinité mutuelle ≥40. Le délai de formation est de 12 heures. Un groupe actif commun évite la duplication.

L’initiateur peut plutôt rejoindre un groupe du destinataire si au moins la moitié de ses membres remplissent les mêmes conditions avec lui. Cela conserve les appartenances multiples sans jeton Former un groupe. Créer ou inviter manuellement reste possible et journalisé. Aucun plafond nouveau de membres ou d’appartenances.

## Coordination, répertoire et archives

`development` est la **Coordination** affichée, initialisée à 18. Une répétition crédite le band annoncé et les membres réellement présents; une paire appartenant à plusieurs groupes ne crédite pas tous les bands. Le répertoire garde la maîtrise et le nombre de répétitions par morceau; la setlist ordonne les morceaux du show ou les improvisations.

Après 48 heures sans activité commune, la coordination baisse de 0,24 par heure. À zéro, le groupe s’archive sans effacement; il peut être relancé. Réputation et moral de scène restent distincts. Le bonus provisoire de partenaires utilise bien la coordination : `1 + development/8`, maximum si plusieurs groupes communs. L’attachement individuel reste reporté.

## Déchéance et carrière

Les règles d’excès, chaînes, récupération et paquets contaminés sont dans [Déchéance](./decheance.md). Les chansons, répertoires et qualités sont dans [Compositions](./compositions.md). La préparation et l’accueil du public restent dans [Shows](./shows.md).
