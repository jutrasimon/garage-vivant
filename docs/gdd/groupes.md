# DDD — Groupes autonomes, attachement et adoption

Version 0.7.10. Le groupe est une entité persistante. Il prend des initiatives virtuelles ; ses membres réalisent les pratiques et spectacles avec leurs besoins et positions. Aucune personnalité, action de sac ou ressource fictive de groupe.

## Identité et données

`id`, nom unique, date de création, fondateurs permanents, membres actuels, anciens membres et motifs de départ. `state` vaut active ou dissolved ; une dissolution conserve date, raison et dernière formation (`finalMembers`). Les initiatives ont leurs prochaines dates sauvegardées. Les appartenances enregistrent date d’entrée, inconnue pour les anciennes sauvegardes, et prochain examen de départ.

Coordination (`development`) : 0–100, initialement 18 pour une nouvelle formation (35–50 pour les groupes du setup initial). Les spectacles et, depuis 0.8.0, les [répétitions](./musique.md) l’augmentent : +1 par cycle collectif de 15 minutes. Après 48 h sans travail collectif, −0,24/h. Tant qu’elle est supérieure à zéro, une activité peut la faire remonter. Zéro déclenche une dissolution définitive.

Chaque compétence existante affiche moyenne, minimum et maximum des membres actuels sur une échelle commune 0–100. Les marqueurs coïncidents sont réunis ; les détails indiquent les ex æquo. Aucun cumul de talents ne remplace les musiciens réellement présents sur scène. Ces agrégats sont calculés, pas stockés comme des compétences nouvelles.

## Formation et recrutement

Une paire est admissible si affinité dans les deux sens ≥12 **ou** amour dans les deux sens ≥25, et tension dans les deux sens <60. La chimie aide l’acceptation ; elle n’est pas obligatoire. Le seuil d’affinité est un réglage de cette première passe, révisé après l’audit ; ce n’est pas une amitié maximale. Aucun champ confiance.

Les partenaires doivent être éveillés et hors engagement. Créer un nouveau groupe demande 48 h depuis la dernière formation ou adhésion chez chacun. Pour **recruter dans un groupe existant**, seul le candidat attend 24 h depuis sa dernière formation ou adhésion : un membre peut proposer de compléter son propre groupe dès sa création. Aucune attente initiale aux nouveaux personnages. Après un échange favorable admissible, choisir parmi nouvelle paire et groupes de chaque partenaire accessibles à l’autre. Poids : `1 + attrait/25`, multiplié par 1,5 pour un groupe existant ; nouvelle paire utilise 18. Un groupe commun actif interdit de recréer ce même duo. Pour recruter, les mêmes liens doivent exister avec au moins la moitié des membres.

Probabilité de proposition autonome :

- Nouvelle formation : `0,315 / (1 + nombre de groupes de l’initiateur²) × max(0,05 ; 1 − meilleur attachement/100)`.
- Recrutement : `0,12 / (1 + nombre de ses autres groupes²) × max(0,05 ; 1 − meilleur attachement à ces autres groupes/100)`.

Le groupe que l’on cherche à compléter est exclu de la pénalité du recruteur : être attaché à son propre band ne doit pas l’empêcher d’y inviter quelqu’un. Les autres appartenances continuent de freiner une proposition. Ce tirage ne crée rien à lui seul. Une paire reçoit au plus une proposition toutes les 24 h, refus compris, que la proposition soit une formation ou un recrutement.

Probabilité d’acceptation inchangée :

`borne(0,4 + affinité destinataire→initiateur/200 + amour/400 + chimie/1000 − tension/250 + attrait du groupe/500 ; 0,1 ; 0,95) / (1 + 0,75 × groupes actuels du destinataire) × max(0,1 ; 1 − son meilleur attachement/100)`.

L’attrait utilise le calcul d’attachement au groupe proposé ; pour un duo neuf, Coordination 18 et réputation 0. Une création fixe la date de dernière formation chez les deux fondateurs ; un recrutement fixe seulement celle du nouvel adhérent, sans réinitialiser celle de son recruteur. La grâce initiale de départ est de 72 h pour chaque nouvelle appartenance. Les chances d’acceptation, tirages et décisions sont journalisés. Un refus donne détresse base +3 à l’initiateur. Les invitations manuelles utilisent les mêmes règles et acceptations ; seul le tirage pour émettre une proposition est omis. La création directe de laboratoire reste une intervention explicite et distincte.

Ces réglages V7.5 favorisent la croissance des duos et rendent la première formation un peu plus probable, tout en conservant les freins d’acceptation d’un musicien déjà engagé ailleurs. Il n’existe ni plafond arbitraire d’appartenances ou d’effectif, ni quota de groupes, ni formation ou recrutement forcé. Les tailles trois ou quatre sont une intention d’équilibre, pas une limite ajoutée. [Comparaison sur les mêmes graines](../BALANCE_V7_5.md).

## Attachement individuel

Valeur calculée par personnage et groupe, bornée 0–100 :

`Coordination + 0,3 × (F−50) + 0,1 × (S−50) + 0,1 × (H−50) + 0,2 × Réputation − 0,15 × T`.

- F : moyenne des affinités du personnage vers les autres membres, chaque valeur ramenée à 0–100.
- T : moyenne de ses tensions vers ces membres.
- H : moyenne de la chimie potentielle avec eux, issue des profils existants.
- S : pourcentage des morceaux actifs du groupe correspondant au genre du personnage ; sans morceau, styles des fondateurs disponibles, ou 50 si aucune donnée.

Coordination et réputation sont communes, les autres composantes sont personnelles. Le calcul exclut le personnage de ses propres relations. Une bonne réputation peut compenser une entente médiocre. Il n’y a pas une deuxième jauge de coordination personnelle qui dériverait du groupe.

Consommateurs : propositions/acceptations, invitations de pratique, départs et choix des partenaires. Le bonus de partenaire commun est désormais `1 + attachement/8`, maximum parmi les groupes partagés. La fiche expose le résultat et ses facteurs ; elle n’affiche pas une valeur exacte de chimie inconnue comme observation acquise.

## Couleur musicale

À la création, choisir uniformément le genre d’un des deux fondateurs avec le hasard du monde. Conserver cette couleur initiale. Dès que des chansons actives sont adoptées, le genre le plus représenté colore le groupe. En cas d’égalité, garder le genre courant s’il est à égalité ; sinon ordre alphabétique. Sans chanson active, revenir au genre initial. Les morceaux mis de côté restent possédés sans compter dans cette couleur.

Cette couleur utilise styles existants, adoption, attachement et calendrier. Aucun vote supplémentaire, album ou nouveau score de genre.

## Réputation et moral de scène

Réputation = borne à 100 de `showReputation + catalogueReputation`. La part catalogue est `0,2 × moyenne des trois meilleures qualités possédées × min(1 ; nombre de ces chansons/3)` ; maximum 20. Les morceaux possédés mis de côté comptent encore. Cette part est recalculée, jamais créditée chaque heure.

La part spectacle garde les gains/pertes existants : score au moins égal à l’exigence → +score×0,12 ; sinon −min(10 ; écart×0,18). Elle est bornée 0–100 et appliquée une seule fois. Le moral conserve ses règles V7.1 : base 60, effets temporaires de réussite/déception/refus sur 48 h, consommateurs de calendrier et scène. Réputation, nombre de spectateurs conquis et nombre de spectacles sont distincts. Aucun système de fans persistants ou diffusion n’est ajouté.

## Adoption exclusive et répertoire

Une chanson terminée garde ses auteurs, noms et sources. `groupId` reste son contexte de création ; `ownerGroupId` indique son propriétaire actuel, ou null. Une chanson a un seul propriétaire et un seul objet canonique. Le catalogue personnel montre toujours les compositions de l’auteur, même adoptées.

Adoption admissible : groupe actif, chanson sans propriétaire, au moins un auteur membre actuel. L’adoption fixe propriétaire et date, conserve les maîtrises personnelles et crée une seule entrée de répertoire avec maîtrise collective 0, compteur de cycles 0 et active=true.

Le groupe garde chanson, auteurs et maîtrise collective après départ d’un auteur ou dissolution. Aucun transfert automatique, copie, retour à l’auteur ou seconde adoption. Mettre de côté désactive l’utilisation dans les nouveaux choix de pratique et setlist ; cela conserve propriété et maîtrise. Réactiver réutilise la même entrée. Une setlist déjà confirmée conserve ses morceaux possédés même s’ils sont ensuite mis de côté.

Toutes les six heures, un groupe actif examine une adoption. S’il existe des chansons non faibles admissibles, écarter les faibles de ce choix. Poids : `1 + qualité/10 + 2 si genre compatible`. Chance d’adopter la candidate : borne 0,15–0,8 de `0,15 + qualité/200 + 0,15 si genre compatible`. L’ordre des groupes ayant une décision due est mélangé, pour éviter un avantage permanent du premier identifiant. Aucun plafond de trois chansons. Les groupes du joueur participent à cette autonomie.

Les commandes manuelles adoptent une œuvre admissible sans tirage de décision, ou désactivent/réactivent un morceau possédé. Le catalogue filtre le propriétaire, distingue le contexte du projet, donne auteurs et maîtrises, et propose des liens cliquables vers chansons et groupes. [Compositions](./compositions.md).

## Appels de pratique et file hors sac

Toutes les six heures, chance de 75 % sous 40 de coordination, sinon 50 %, de lancer une pratique si un morceau actif existe. Favoriser ceux peu maîtrisés avec poids `1 + (100−maîtrise)/20`. Choisir un garage existant. Au plus une demande ouverte ou en cours par groupe. La commande Répéter crée exactement la même demande ; elle ne termine pas l’action des membres.

Chaque membre reçoit une invitation dans sa file personnelle, extérieure au sac, datée et valable 12 h. À la fin d’une action et avant la prochaine pige, examiner les invitations en ordre d’arrivée. Sommeil obligatoire et spectacle confirmé restent prioritaires. Une invalidité, expiration, départ du groupe ou énergie <15 produit un motif ; pas de jeton consommé ni remboursé.

Avant acceptation, vérifier qu’approche + attente maximale + fourchette maximale de pratique + trajet depuis le garage permet encore le départ vers le prochain show confirmé. Les trajets de préparation utilisent les portes existantes à 12 unités/min, avec une estimation conservatrice de segments. Une invitation incompatible est déclinée.

Chance de participer : borne 0,1–0,95 de `0,55 + attachement/250 + (énergie−50)/300 − détresse/700`. Le tirage et le motif sont conservés. Un refus permet d’examiner l’invitation suivante ; une acceptation lance Pratiquer hors sac avec groupe, morceau, demande et destination explicites. Elle conserve le prochain jeton du sac.

Le premier arrivé attend au plus 120 minutes sur place, sans effets de pratique, apprentissage ni maîtrise. Deux membres présents démarrent la séance. Besoins et émotions continuent leur évolution normale pendant trajet et attente. Chaque membre suit ensuite ses cycles personnels ; le morceau annoncé reste celui effectivement travaillé. Le choix instrumental peut varier sans changer ce morceau ni le compteur de départ des autres membres. Une personne seule après le départ des autres peut poursuivre la pratique personnelle, sans gain collectif.

Un membre ayant pigé Pratiquer peut aussi demander à rejoindre une pratique de morceau compatible, avec l’admission existante. Ce participant est enregistré dans la demande lorsqu’il rejoint un appel. Aucun bonus collectif avant le démarrage à deux. Expiration (y compris après le démarrage de la répétition), morceau désactivé, dissolution ou fin de tous les participants ferme la demande et termine les participations correspondantes. Les invitations résolues restent inspectables un jour, puis sont retirées ; les demandes restent tant que référencées. Ces nettoyages n’ajoutent ni ne retirent aucun jeton.

## Départs et dissolution

Chaque appartenance reçoit un délai initial de 72 h, puis un examen toutes les 12 h. Chance 8 % si attachement <20 ; ajouter 15 % si un autre groupe **déjà rejoint** dépasse cet attachement d’au moins 25. Plafond 30 %. Pas de groupe potentiel inventé pour justifier le départ. L’examen est reporté si un spectacle confirmé de ce groupe a lieu dans les prochaines six heures. Au plus un départ autonome par personnage et par minute.

Départ : historique et motif, retrait de l’appartenance, annulation de ses invitations pendantes de ce groupe et fin de sa pratique associée. Les confirmations futures sont revalidées : retirer le membre, ou annuler explicitement si moins de deux participants restent. Le départ manuel utilise la même transition sans tirage.

Dissolution : Coordination zéro ou moins de deux membres. Transition terminale et idempotente ; conserver histoire, fondateurs, dernière formation, morceaux, maîtrise, réputation et spectacles. Les membres restants deviennent anciens membres. Fermer demandes, annuler invitations et réservations futures ; aucune initiative ni reprise. Un ancien auteur peut créer un nouveau groupe, mais les chansons déjà possédées ne changent pas de propriétaire.

## Spectacles et exceptions

Les candidatures utilisent le calendrier existant ; adoption et inscription ne nécessitent pas de réunion physique. Une réservation confirmée devient un engagement prioritaire. Chaque départ est calculé depuis la position réelle, avec marge d’arrivée de 10 minutes, et interrompt action ou sommeil. Pas de deuxième refus ordinaire au départ, ni filtre d’énergie bloquant la présence. L’énergie compte dans la performance ; aucune recharge d’attente. [Shows](./shows.md).

Seule exception nouvelle de présence : déchéance ≥90, chance `min(0,2 ; (déchéance−90)×0,02)` d’absence, examinée une seule fois par engagement et personnage. Absence conservée et journalisée ; pas de remplaçant fictif. Moins de deux présents rend le créneau manqué, sans annuler toute la soirée. Les pénalités relationnelles spécifiques du drame d’absence restent reportées, sans perte cachée.

## Sauvegardes, interface et validation

La [migration](./technique.md) archive confiance, résout les anciens répertoires partagés sans copier une œuvre, et protège les setlists historiques confirmées. Le format courant valide strictement propriétaire/répertoire, demandes, files, appartenances et état terminal ; il ne répare pas silencieusement une sauvegarde actuelle corrompue.

La fiche personnelle montre la file, son ordre, les échéances, les réponses et motifs ; les liens d’auteur et de propriétaire ouvrent leur fiche. Les fiches de groupe donnent identité, compétences, attachement, détail de réputation, répertoire possédé/actif, appels, dates des prochaines décisions et historique. Le quartier distingue le nombre de groupes actifs des archives. Dans Groupes, deux boutons toujours visibles donnent Actifs et Archives avec leur nombre total ; Archives affiche exclusivement les groupes dissous. La recherche filtre la catégorie courante. Si le groupe consulté se dissout, sa fiche reste ouverte dans Archives. Un lien depuis le propriétaire d’une chanson ou une invitation ouvre la bonne catégorie et efface seulement une recherche incompatible avec le groupe ciblé. Les archives montrent motif/date de dissolution, anciens membres, fondateurs, répertoire et maîtrise conservés, shows et histoire ; aucune commande d’adoption, de répétition, de recrutement ou de réservation active. La consultation, l’export et le rechargement ne suppriment ni ne réactivent ces groupes. Les libellés d’activité du quartier sont dessinés après les effets, dans des rectangles distincts des cubes, noms, bulles et autres libellés. Des traits de liaison gardent leur association lorsque la foule oblige à les décaler. La bande d’activités sous la carte garde chaque nom et activité en texte lisible à la taille de l’écran, y compris sur mobile. Aucun texte essentiel n’est uniquement au survol.

Les coefficients sont réunis dans `group-rules.mjs`, les politiques et transitions dans `groups.mjs`, les raccords de moteur dans `groupContext`. `npm run audit:groups` rejoue 20 graines sur 30 jours et en prolonge trois à 90 jours, vérifie les sauvegardes aux jours 3/5/10/30 et la continuation. Les résultats et limites se trouvent dans le [rapport d’équilibrage V7.5](../BALANCE_V7_5.md). Ces mesures ne garantissent pas toute partie, population ou configuration.

## Réception V7.3

L’admissibilité de l’appel est partagée entre admission, travail et entretien des demandes. À son échéance, aucune minute supplémentaire de maîtrise collective n’est attribuée ; les participants terminent cette action, sans remboursement de jeton. Une ancienne action V7.2 qui a changé de morceau reprend la cible de sa demande avant le prochain travail ; les gains historiques ne sont pas réécrits. Le [bilan des simulations V7.3](../AUDIT_V7_3.md) couvre seize parties de quinze jours et le contrôle de stabilité sur vingt graines.

## Configuration initiale et persistance · V7.10

Une nouvelle partie dans l’interface choisit **Variable** par défaut : de 1 à `min(4, max(1, floor(population/3)))` groupes, chaque taille entre 3 et 6 quand les voisins disponibles le permettent (2 au minimum). Options explicites : **un grand groupe** (jusqu’à 6 membres), **deux moyens** (3 ou 4 chacun si la population le permet), **deux petits** (2 chacun), **aucun**. Une population trop petite réduit le nombre/taille; aucun personnage n’appartient à deux groupes initiaux. La graine détermine répartition, noms, coordination 35–50 et affinités dirigées 35–55 entre membres; tension plafonnée à 10 entre ces membres seulement. Les autres relations restent celles du générateur. Ces liens représentent un passé commun initial, sans fausses répétitions ou spectacles. Depuis 0.8.0, deux chansons sont attribuées au band unique; trois à quatre sont réparties entre plusieurs bands. Les groupes utilisent ensuite toutes les règles normales et peuvent se dissoudre. Une ancienne partie n’est pas modifiée à l’import.

La proposition de **nouvelle formation** passe de 28 % à **31,5 %**, soit +12,5 % relatif avant les freins existants. Le recrutement reste à 12 %. Ce réglage ne garantit pas un pourcentage identique de groupes supplémentaires dans une trajectoire aléatoire.

Le groupe existant insiste par ses **appels de répétition** : au contrôle toutes les six heures, chance de 75 % si coordination sous 40, sinon 50 %. Il faut une chanson active adoptée; une seule demande ouverte/en cours par groupe, sans empilement ni contournement des refus, sommeil ou spectacles. Depuis 0.7.12, les répétitions entraînent les musiciens; la coordination progresse uniquement en show. Le premier contrôle de départ après une nouvelle adhésion est reporté à **72 h** au lieu de 48 h; les anciens contrôles déjà programmés ne sont pas déplacés. Ensuite les conditions et probabilités restent inchangées, ainsi que la dissolution définitive à zéro. Les albums restent hors périmètre.

## Paramètres personnalisables · V0.7.11

Les paramètres exposés de ce domaine se règlent dans [l’Atelier d’équilibrage](./equilibrage.md). Les chiffres de référence de ce DDD décrivent les valeurs par défaut ; le profil de la partie peut les remplacer. Les formules et conditions non exposées sont conservées.

## Ajustement 0.7.12 : départ et pratique

La création courante propose trois voisins. Toutes les paires reçoivent des affinités initiales partielles, reproductibles et directionnelles; la création d’un groupe renforce ses liens à 35–55. Aucune relation d’une sauvegarde existante n’est retirée ou tirée à nouveau. Le départ variable réserve assez de voisins pour des formations de trois membres ou plus quand la population le permet; les moyens varient entre trois et quatre et le grand monte jusqu’à six.

Depuis 0.8.0, une pratique collective entraîne les individus, donne 1 XP individuelle par minute jouée et +1 coordination par cycle collectif de 15 minutes. Elle ne donne pas de maîtrise de morceau. Les participants arrivés, du même groupe et sur le même morceau sont affichés ensemble sur la carte; une attente d’invitation n’est pas présentée comme une répétition active.
