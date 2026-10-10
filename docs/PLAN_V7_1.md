# Plan V7.1 — Actions, compositions et identité musicale

**Statut : réalisation 0.7.1 terminée.** Compilation et réalisation du 10 octobre 2026. Le texte de conception reste conservé ci-dessous ; les [DDD](./gdd/documentation.md) décrivent les règles codées. La section 20 indique les arbitrages et limites. L’intégration à `main` publie le jeu et la documentation ensemble après validation automatique.

Les mentions **Validé** reprennent les décisions de Simon. Les mentions **Proposition** sont des propositions historiques ; elles n’indiquent pas à elles seules un effet actif. Les valeurs effectivement retenues sont celles des DDD et du bilan de réalisation.

## 1. Objectif et périmètre

Passer de cinq activités largement minutées à **six actions distinctes**, capables d’accueillir les rencontres et les parcours musicaux des personnages : Détente, Socialiser, Pratiquer, Jam, Composer et Déchéance. Dormir reste hors sac.

La V7.1 couvre aussi le cycle du sac et de sa défausse, les demandes de participation, la progression musicale par plateaux, les projets multiples, le classement des chansons, leurs liens avec les groupes, les noms et la contamination des paquets de spectacle par la déchéance.

L’interface doit expliquer ce qui se passe : action et contenu actuels, raison d’un départ, emplacement des jetons, progression d’un projet, qualité d’un morceau, maîtrise par son interprète ou son groupe, auteurs et rattachement. Elle doit permettre de consulter un grand catalogue sans afficher des centaines d’entrées indifférenciées.

Le chantier conserve les besoins et les deux axes émotionnels de la V7. L’inspiration comme besoin ou système autonome, un nouvel agenda personnel général et de nouveaux traits ne font pas partie des décisions validées. Les raccords encore inactifs restent identifiés dans la documentation et l’inspecteur.

## 2. Carte des six actions

| Action | Fonction | Forme collective | Durée et contenu | Effets retenus |
|---|---|---|---|---|
| Détente | Se reposer et faire autre chose que de la musique | Une entrée acceptée en socialisation termine la détente | Durée tirée dans une fourchette personnelle ; effets progressifs | Énergie en hausse, détresse en baisse, petit gain de plaisir |
| Socialiser | Échanger et développer les liens | Admission initiale acceptée, puis échanges successifs | Départs selon besoins, évolution de la conversation et autres contraintes ; pas de limite fixe de 50 minutes | Effets sociaux, émotionnels et relationnels des échanges |
| Pratiquer | Développer sa technique et travailler des morceaux | Répéter un morceau avec des membres du même groupe musical | Cycles de contenu ; décision de poursuivre ou de terminer à leur fin | Compétence et maîtrise, plaisir, coût d’énergie ; aucune expression par défaut |
| Jam | S’exprimer librement par la musique | Invitation ouverte, indépendamment des groupes | Commence en solo ; durée variable ; départ des autres compatible avec une poursuite solo | Expression, plaisir, compétence et, avec partenaires, lien social ; coût d’énergie |
| Composer | Développer et terminer une œuvre | Collaboration limitée aux membres d’un même groupe | Plusieurs projets possibles ; séances variables ; avancement irrégulier sur plusieurs séances | Expression, plaisir, écriture et instrument ; coût d’énergie |
| Déchéance | Faire la fête et abuser, puis subir les excès rapprochés | Possibilité collective proposée, modalités ouvertes | Séance variable proposée ; historique d’épisodes rapprochés | Double pression sur sac d’actions et paquet de spectacle ; effets de séance à préciser |

**Validé :** les lieux doivent pouvoir évoluer au-delà des bâtiments du mini-quartier actuel. Les règles reposent sur les possibilités d’activité et la présence des personnes, plutôt que sur une liste fermée d’identifiants de bâtiments. L’extension géographique du monde n’est pas incluse dans cette mise à jour.

## 3. Sac, défausse, acquisitions et retraits

### Règles validées

1. Chaque personnage possède son sac. La pige autonome a lieu lorsqu’une nouvelle action doit être choisie, sans cadence fixe et sans préparation d’une file d’actions futures.
2. La fin normale d’une action rend immédiatement la main au choix suivant. Un déplacement ou un changement de contenu dans une séance ne provoque pas de nouvelle pige.
3. Un jeton pigé est utilisé pour ce cycle et passe dans la **défausse**, même si l’action échoue à trouver un partenaire ou est interrompue.
4. Tout jeton acquis entre **directement dans le sac courant**. Aucun ajout ne se fait directement dans la défausse.
5. Un retrait définitif ne peut viser qu’un jeton dans la **défausse**. Aucun jeton encore dans le sac ne peut être effacé.
6. Lorsque le sac est vide et qu’une nouvelle pige est nécessaire, les jetons conservés de la défausse reviennent dans le sac.
7. Il n’existe aucun remboursement automatique de jeton après recherche infructueuse, interruption ou annulation.
8. Le délai social automatique de 15 minutes avant la prochaine pige est supprimé. La décision suivante appartient au fonctionnement général des actions.
9. Le sommeil, les interventions manuelles et la commande de laboratoire restent capables d’interrompre une action. Le sommeil et les actions imposées restent hors sac.

Une interruption termine la séance en cours. Ses effets déjà produits restent acquis. Un projet de chanson persiste indépendamment de la séance qui l’a fait avancer.

### Conséquences à implémenter

La réservation V7, consommée seulement au début effectif de certaines actions, doit être remplacée par une comptabilité cohérente **sac / défausse / retraits définitifs**. Le jeton de l’action en cours est déjà défaussé et ne doit pas être compté une seconde fois dans l’inventaire.

Le remplissage utilise l’inventaire conservé, et ne recrée pas des jetons retirés à partir d’une ancienne composition fixe. Les acquisitions se font une fois par événement ou différence de quantité cible, jamais une fois par minute simplement parce qu’un seuil reste dépassé.

**Proposition :** si une baisse de déchéance ou une édition demande de retirer plus de jetons qu’il n’y en a dans la défausse, conserver un nombre de retraits en attente. Chaque jeton admissible rejoint d’abord la défausse lors de sa pige, puis peut être retiré. L’action déclenchée par cette pige a tout de même lieu.

L’éditeur actuel « prochain cycle » doit être revu : hausse = acquisition immédiate ; baisse = retrait possible dans la défausse, puis attente pour le reste. Une composition initiale peut rester un profil de création, sans écraser l’inventaire à chaque cycle.

**À préciser :** traitement d’un inventaire entièrement épuisé par les retraits. Préconisation : empêcher l’édition de supprimer tout choix autonome et conserver au moins une activité ordinaire dans les profils. Le moteur doit avoir un état d’attente explicite si une sauvegarde valide atteint malgré tout un inventaire vide ; aucune création cachée de jetons.

L’interface montre les nombres dans le sac et la défausse, les retraits en attente, les acquisitions récentes et les probabilités réelles de prochaine pige. Les besoins ne repondèrent pas spontanément le tirage ; la déchéance agit par de vrais jetons.

## 4. Séances, cycles et demandes de participation

### Structure commune

Une action représente l’intention du personnage. Une séance représente son activité effective, personnelle ou collective. Un cycle représente un échange social ou une portion de travail musical. Plusieurs cycles peuvent appartenir à une seule action et utiliser un seul jeton.

**Validé :** demander à rejoindre une activité ou proposer une activité commune doit utiliser un mécanisme partagé. L’admissibilité dépend de l’action : groupe musical commun pour pratiquer ensemble ou composer ensemble ; jam accessible indépendamment des groupes.

La demande de participation est distincte du résultat des échanges une fois admis. Pour la socialisation, il y a une acceptation initiale, puis aucune nouvelle acceptation obligatoire avant chaque échange. Une arrivée ne remet pas l’horloge collective à zéro.

### Transitions encore ouvertes et propositions

| Cas | Décision acquise | Proposition à confirmer |
|---|---|---|
| Une détente accepte une socialisation | La détente se termine ; entrée après acceptation | Passage social hors sac, sans consommer artificiellement un jeton Socialiser ni en restituer un de Détente |
| Une personne ayant pigé Pratiquer rejoint une répétition admissible | Participation demandée, groupe commun et morceau travaillé | Le jeton déjà pigé couvre sa participation |
| Une personne rejoint une jam | Admission à organiser avec la demande commune ; aucun groupe requis | Le jeton Jam déjà pigé couvre la séance ; une invitation acceptée hors pige suit la règle de transition hors sac |
| Une proposition d’activité sociale est acceptée | Cette interaction rare peut porter sur les autres actions | Les acceptants terminent leur action et commencent une séance commune hors sac ; les autres restent libres de continuer leur discussion |
| Une demande est refusée | Aucun remboursement automatique | Le demandeur conserve sa propre action si elle reste réalisable ; une recherche terminée rend la main à la pige |

L’autorité d’admission dans un collectif reste à définir. **Proposition :** un hôte ou responsable de séance reçoit la demande ; le départ de l’hôte transfère ce rôle. Éviter une acceptation de tous les membres à chaque arrivée.

La présence à proximité ne doit pas suffire à inscrire automatiquement quelqu’un. La pratique n’est pas interrompue par une conversation ordinaire. La disponibilité pour recevoir une proposition doit être explicite pour chaque action, y compris pendant les trajets et les engagements.

Les départs sont personnels. **Proposition :** après un échange, le destinataire évalue immédiatement son maintien ; tous les participants peuvent aussi partir pour un besoin ou une interruption prioritaire. Les seuils minimaux, la borne supérieure des fourchettes et l’arrêt anticipé restent à régler selon l’action.

## 5. Détente

**Validé :** activité non musicale, avec récupération progressive d’énergie, diminution de détresse et petit gain de plaisir. Les personnages peuvent y consacrer des parts différentes de leur temps par leurs sacs.

La durée est tirée à chaque séance dans une fourchette propre au personnage. Seules les minutes effectivement passées à se détendre produisent les effets ; le trajet n’est pas du repos.

Une admission acceptée en socialisation termine la détente. Une admission refusée laisse la détente en cours. Aucun reliquat de durée ne sera repris après la conversation. Celle-ci peut améliorer ou gâcher le moment par ses propres résultats.

Le ressourcement et l’inspiration restent une intention future : aucun gain vers une jauge fictive. La diminution existante de déchéance pendant la détente doit être vérifiée et documentée avec la récupération générale.

## 6. Socialiser

### Entrée et échanges

Conserver les règles de choix du partenaire fondées sur les liens, la tension, les groupes communs et les traits déjà raccordés. Entrer dans une socialisation nécessite une acceptation initiale, notamment lorsque la personne quitte une détente.

Une fois admis : choisir un initiateur et un destinataire, tenter l’interaction, déterminer un résultat favorable, neutre ou défavorable, appliquer ses effets, puis évaluer le départ ou le maintien. Choisir de nouveau l’initiateur au prochain échange.

Dans un groupe, distinguer les personnes présentes et la paire concernée. Les effets directs restent attribués aux participants concernés ; un effet sur tout le groupe doit avoir une règle explicite. La cadence V7 de 15 minutes est une base existante à réévaluer, pas une nouvelle décision validée.

### Durée et fin

Supprimer les 50 minutes fixes et les quotas personnels fixés arbitrairement. Le maintien dépend du besoin social, des autres besoins, de la fatigue, de l’évolution des échanges et des contraintes déjà existantes. Un agenda personnel futur ne doit pas être simulé par de faux rendez-vous.

La conversation peut gagner ou perdre de l’élan et devenir agréable ou désagréable. **Proposition :** distinguer sa tonalité et l’envie personnelle de continuer : une discussion agréable peut épuiser quelqu’un. Le calcul exact, le rôle du temps écoulé et les critères de départ restent à préciser.

Un échec de recherche utilise quand même le jeton. La limite actuelle de 30 minutes reste à arbitrer ; son remboursement et son attente supplémentaire de 15 minutes sont rejetés. L’accélération de la perte de lien social et la hausse de détresse en cas de recherche infructueuse ont été évoquées, sans coefficients validés.

### Proposer une activité

Ajouter cette interaction aux discussions, soutiens et avances existants. Elle est rare, favorisée par l’affinité et éventuellement par le temps déjà passé ensemble. Elle peut proposer une autre action réalisable.

Distinguer le résultat social de la proposition et l’engagement effectif dans l’activité. Une issue neutre ou défavorable ne doit pas forcer une participation. Son articulation avec l’acceptation initiale et les jetons doit être arrêtée avant implémentation. Vérifier l’admissibilité musicale avant de proposer une répétition ou une composition collective.

Les mécanismes amoureux existants restent disponibles dans les échanges. Adapter leur point d’appel à la nouvelle séquence, sans créer d’action romantique ni d’autre système de relation.

## 7. Pratiquer

### Contenu variable et instruments

Une pratique peut alterner exercices techniques, instruments et morceaux au fil de ses cycles. Le personnage peut travailler plusieurs morceaux durant une même séance. À chaque fin de cycle, il choisit de continuer ou de terminer en tenant compte de sa fourchette personnelle.

Favoriser l’instrument principal, avec une part de hasard pour les instruments secondaires du personnage. La définition de ses instruments secondaires et les poids de choix restent à formaliser ; ne pas tirer indistinctement parmi tous les instruments du jeu. Cette règle permet déjà de différencier les spécialistes et les personnages plus polyvalents sans ajouter un nouveau système de profils.

La pratique solo peut couvrir les morceaux auxquels le personnage est associé, qu’ils soient personnels ou issus de ses groupes.

### Pratique collective

**Décision qui remplace la proposition antérieure :** pratiquer ensemble signifie travailler un morceau ensemble et exige l’appartenance à un même groupe musical. Les invitations sont limitées aux membres admissibles de ce groupe.

La séance identifie le groupe et le morceau effectivement travaillés. Lorsque plusieurs groupes sont communs, choisir un contexte explicite ; les gains ne doivent pas créditer tous les groupes par défaut. Les participants travaillent le même morceau durant un cycle collectif. Les changements de morceau doivent être coordonnés.

Une conversation ordinaire n’interrompt pas la pratique. Une demande de rejoindre la pratique reste possible. Les règles si le groupe se réduit à une seule personne restent à préciser ; **proposition :** continuer en pratique solo du morceau, sans gain collectif.

### Effets et progression

Conserver la dépense d’énergie et le plaisir. **Supprimer le gain d’expression par défaut.** Un trait pourra ultérieurement faire exception ; aucun trait « technicien » ou « bourreau de travail » n’est validé dans le périmètre.

La maîtrise instrumentale progresse par **plateaux** : très petites améliorations et percées ponctuelles. Éviter une progression uniquement linéaire ou une loterie sans lien avec le travail accompli.

**Proposition de réalisation :** accumuler du travail d’apprentissage par compétence ; une partie donne de petits gains, l’autre prépare une percée. Les taux ralentissent à haut niveau. Les influences évoquées — exaltation, plaisir, chimie, état émotionnel, événements passés — restent des raccords à sélectionner. Seules les influences réellement implémentées sont affichées comme actives.

Distinguer la compétence d’instrument, la maîtrise personnelle d’un morceau et la maîtrise du morceau par un groupe. La V7 possède déjà la maîtrise collective dans le répertoire ; la maîtrise personnelle doit être spécifiée si elle devient un gain de pratique solo. Ne pas afficher une valeur collective comme si elle appartenait à chaque musicien.

## 8. Jam

Le libellé visible devient **Jam**, y compris dans les fiches, sacs, commandes, historiques, infobulles et documentation qui décrivent la nouvelle version.

Une jam commence immédiatement en solo. Elle constitue une invitation ouverte à venir jouer, avec demande de participation. Aucun groupe musical commun n’est requis. Le départ des partenaires n’interrompt pas la musique : le dernier participant peut continuer seul.

Retirer le minimum de deux musiciens, l’attente de 90 minutes pour manque de partenaire et la restitution associée. La durée devient variable. La structure exacte des cycles de jam et de leurs décisions de départ reste à fixer ; **proposition :** suivre la structure commune des séances avec réévaluation personnelle à chaque cycle.

Conserver les bénéfices validés : expression, plaisir, progression instrumentale et coût d’énergie ; les bénéfices sociaux et relationnels exigent des partenaires. Conserver les occasions de synchronisation, d’apprentissage, d’idée, de débat et d’accrochage en adaptant leurs effets au nouveau rôle de la jam.

**Validé :** jammer ne fait pas avancer directement la maîtrise du répertoire ou la préparation d’un spectacle, ne termine pas une chanson et n’accorde pas directement de réputation. Les idées peuvent nourrir une composition ultérieure. Le temps consacré aux jams ralentit les autres activités de carrière ; aucune pénalité artificielle de carrière n’est requise.

**Raccord critique :** `updateJams()` appelle aujourd’hui `groupRehearsal()`, qui peut augmenter coordination et maîtrise du répertoire. Transférer ce travail vers Pratiquer et les commandes de répétition. Les gains de compétences ou de relations peuvent toujours avoir des conséquences indirectes sur la carrière, à documenter comme telles.

## 9. Composer : plusieurs projets et travail de longue durée

### Projets et collaboration

Un personnage peut avoir autant de compositions en cours qu’il le souhaite et alterner entre elles. La séance choisit un projet ; le projet conserve son travail, ses auteurs, son contexte, ses sources et ses dates entre séances et interruptions.

La composition peut être solo. En collectif, les collaborateurs doivent appartenir au même groupe musical. Distinguer les véritables coauteurs des simples membres du groupe. Un projet collectif conserve son identité lorsque l’un des coauteurs le retravaille seul.

**Proposition :** partager un objet projet unique entre les collaborateurs ; cumuler seulement le travail réellement fourni par les présents et éviter une création de chanson par coauteur lorsque le projet se termine.

La règle de choix entre reprendre, changer de projet et commencer un nouveau morceau reste à préciser. **Proposition :** privilégier des reprises assez souvent pour obtenir des œuvres terminées malgré l’absence de limite de projets ; rendre visibles les projets délaissés sans multiplier automatiquement les nouvelles ébauches.

### Temps, qualité et émotions

**Validé :** terminer un morceau doit généralement demander plusieurs séances. La fourchette décrit la séance, pas le temps total de composition. La vitesse dépend du compositeur, de ses caractéristiques, du travail visé et de ses états. L’avancement peut être irrégulier.

La qualité et le temps demandé doivent avoir un lien explicable. **Proposition :** définir au projet une ambition ou un travail requis fondé sur son potentiel, puis calculer la qualité finale à partir du travail et des contributions. Éviter une formule circulaire où la qualité finale détermine rétroactivement la durée déjà passée ; le temps seul ne doit pas garantir un chef-d’œuvre.

Une composition achevée en une seule séance reste exceptionnelle. La forte détresse combinée à une forte exaltation peut produire un élan galvanisateur ; le raccord est à calibrer. Les deux axes doivent être lus ensemble, et pas seulement l’émotion dominante. Cet élan peut accélérer le travail sans garantir une meilleure qualité ou effacer les coûts de fatigue.

Conserver les effets de base validés sur expression, plaisir, énergie, écriture et instrument. Coordonner l’apprentissage des compétences avec les plateaux et distinguer cet apprentissage de l’avancement de l’œuvre. Le choix des modulateurs doit rester limité aux systèmes réellement branchés.

### Abandon et fin

Un projet délaissé trop longtemps peut être abandonné. Le délai et le caractère automatique ou probabiliste restent à calibrer. **Proposition :** utiliser sa dernière date de travail effectif, et non la dernière ouverture de sa fiche ; pour un projet collectif, compter le travail de tout coauteur.

Un projet abandonné est inachevé. Une chanson faible est terminée et jouable. Ces deux états ne doivent pas être confondus ou supprimés. La reprise d’un projet abandonné reste une option à décider.

Lorsqu’un projet atteint le travail requis, sa chanson est créée une seule fois, avec les coauteurs et le rattachement convenus. Le point exact de finalisation — fin de cycle ou de séance — reste à préciser et doit être visible.

## 10. Qualité relative, classement et utilisation des chansons

**Validé :** comparer une chanson aux autres œuvres de son auteur, plutôt qu’à un seuil absolu unique. Un morceau nettement inférieur passe automatiquement parmi les morceaux faibles ou archivés. Il reste conservé et utilisable si les choix sont limités.

**Proposition de classement :** calculer une référence de qualité personnelle à partir d’un sous-ensemble des chansons terminées de l’auteur. Exclure la chanson évaluée de sa propre référence. Utiliser un échantillon stable, par exemple une médiane des meilleures œuvres, avec un minimum d’historique avant de classer automatiquement. La fenêtre, l’écart toléré et le traitement des coauteurs restent à arbitrer.

Prévoir explicitement le début de carrière, l’absence d’autre chanson, les coauteurs de niveaux différents et l’amélioration ultérieure du catalogue. Un reclassement ne modifie jamais la qualité historique de l’œuvre.

Séparer le classement automatique « faible » du choix manuel « archivé ». **Proposition :** une restauration manuelle doit garder une priorité identifiable pour éviter que le moteur masque immédiatement le morceau à nouveau.

Les choix autonomes de répertoire et de setlist privilégient les morceaux appropriés et de meilleure qualité. Le recours aux morceaux faibles doit être possible et expliqué ; cacher ces morceaux dans l’interface ne les rend pas inadmissibles. Un changement de classement ne doit pas effacer une setlist confirmée ou un historique de spectacle.

## 11. Catalogue : interface claire pour projets et chansons

### Organisation proposée

Une entrée « Compositions et chansons » centralise le catalogue, avec des vues distinctes pour **Projets en cours**, **Chansons**, **Morceaux faibles / archives** et **Projets abandonnés**. Depuis la fiche d’un personnage ou d’un groupe, ouvrir cette même interface avec le contexte déjà filtré.

Par défaut, montrer les chansons utiles et les projets actifs. Les entrées faibles, archivées et abandonnées sont accessibles par leur vue et leur compteur. Le catalogue conserve toutes les données sans transformer l’écran principal en liste interminable.

### Informations et interactions requises

| Élément | Présentation attendue |
|---|---|
| Titre et type | Titre lisible ; Projet ou Chanson explicitement identifié |
| Auteur et coauteurs | Identités cliquables, attribution conservée même après départ du quartier |
| Rattachement | Personnel ou groupe identifié ; ne pas déduire la propriété du seul groupe actuel de l’auteur |
| Répertoires | Groupes qui utilisent réellement le morceau, distincts de son rattachement d’origine |
| Qualité | Note de l’œuvre terminée ; potentiel explicitement provisoire pour un projet |
| Maîtrise | Valeur et contexte : personne/instrument ou groupe ; jamais un score global ambigu |
| Projet | Avancement, séances, temps travaillé, dernière activité et état |
| Détails musicaux | Genre, tonalité, intensité, sources et contributions réellement enregistrées |
| Classement | Actif, faible, archivé ou abandonné ; motif du classement et référence de comparaison |
| Actions existantes | Archiver/restaurer, consulter le répertoire, préparer un morceau selon les possibilités du jeu |

Rechercher par titre, auteur ou groupe. Trier par qualité ascendante/descendante, maîtrise dans le contexte sélectionné, avancement, date et dernière activité. Filtrer par plage de qualité, auteur, groupe, rattachement, état et genre. Les filtres sont combinables, visibles et réinitialisables.

Pour les œuvres encore inachevées, ne pas inventer de note finale ; distinguer le filtre sur la qualité des chansons et le potentiel des projets. Si aucun groupe ou interprète n’est sélectionné, détailler les différentes maîtrises plutôt que les agréger silencieusement.

La fiche de détail doit s’ouvrir sans perdre la position, le tri ou les filtres du catalogue. Des mises à jour de simulation ne doivent pas déplacer une ligne sélectionnée sous le curseur. Prévoir une liste paginée ou un rendu limité adapté aux centaines de compositions, avec une navigation confortable sur téléphone.

### Attribution à formaliser

Un auteur crée ; un groupe peut être le contexte de création ; plusieurs répertoires peuvent utiliser la même chanson. **Proposition :** conserver ces liens séparément et définir les droits d’usage selon les appartenances et règles du jeu. Le départ d’un groupe ne réécrit pas l’auteur et ne supprime pas rétroactivement l’œuvre. Les droits après départ et le rattachement des projets collectifs restent à décider avant migration des nouvelles données.

## 12. Noms de groupes et titres de chansons

**Validé :** obtenir des noms thématiques, variés et faciles à distinguer. Deux groupes ne doivent pas porter des noms quasi identiques. Aucun nouveau groupe ou morceau ne doit réutiliser le nom d’une autre entité musicale dans la même partie.

Créer deux banques éditoriales distinctes et plusieurs structures grammaticales : identités de collectifs pour les groupes ; images, phrases et situations pour les chansons. Exemples de direction, à éditer : **Groupe · Les Chiens de cuivre** et **Chanson · « Quand le fleuve se tait »**. Multiplier les combinaisons cohérentes plutôt que les suffixes numériques.

Le générateur actuel de groupes utilise six bases suivies d’un numéro. Celui des chansons recycle peu de structures, reprend parfois le nom du groupe et ajoute un suffixe numérique en cas de doublon. Ces deux comportements doivent être remplacés.

### Garanties de génération proposées

- Registre persistant des noms utilisés, couvrant groupes actifs/archivés, projets actifs/abandonnés et chansons terminées/archivées.
- Comparaison normalisée : casse, accents, apostrophes, espaces et ponctuation. Comparaison commune aux groupes et aux titres.
- Filtre supplémentaire de proximité pour les groupes : éviter une simple variation d’article, de nombre, de suffixe ou d’un mot sur la même base.
- Identité stable d’un projet à sa chanson terminée : son propre titre réservé est conservé, sans être traité comme une collision.
- Tirages déterministes avec le hasard du monde ; aucun tirage lié au rendu ou à une recherche UI.
- Après plusieurs collisions, parcours déterministe de combinaisons inédites plutôt qu’une boucle aléatoire sans fin.
- Dimensionner et vérifier le nombre réel de combinaisons distinctes ; prévoir des structures de réserve. Si le domaine fini est épuisé, signaler l’échec de génération plutôt que livrer un doublon ou bloquer la simulation.

Les archives continuent de réserver leurs noms. Les noms saisis manuellement passent par les mêmes contrôles ; le retour utilisateur explique une collision sans remplacer son texte en silence.

L’interface distingue les types partout : libellé Groupe, titre de chanson entre guillemets, repères cohérents dans catalogue, fiches, journal, invitations, calendrier, setlists, scène et bilans. La différenciation ne dépend pas seulement d’une couleur.

**Migration à arbitrer :** préserver les noms historiques importés et empêcher toute nouvelle collision, ou proposer un renommage explicite des doublons existants. Recommandation : préserver l’historique, identifier les collisions héritées et permettre leur correction sans changer les identifiants ou les références.

## 13. Création de groupes et relations

Conserver le déclenchement autonome après un échange social ou musical favorable. Aujourd’hui, il dépend de l’affinité et de la confiance mutuelles, d’une tension suffisamment basse et de la complicité ou d’une forte affinité ; il évite de dupliquer un groupe actif commun et possède un délai de formation.

L’initiateur peut rejoindre un groupe du destinataire lorsque les liens requis avec ses membres sont présents, ou un nouveau groupe peut se former. La création et les invitations manuelles restent possibles. Aucun jeton Former un groupe n’est ajouté.

La refonte des échanges doit préserver ce point d’appel : la création de groupes doit rester observable dans une simulation autonome. Jam ouverte et socialisation permettent notamment à des personnages sans groupe commun de nouer les liens nécessaires aux futures répétitions et compositions collectives.

Les relations amoureuses poursuivent leur fonctionnement existant, avec les adaptations nécessaires à l’acceptation initiale de séance et à la nouvelle résolution des échanges.

## 14. Déchéance : action, chaînes et double effet

### Règles validées

La sixième action représente d’abord la fête et les excès. Des épisodes rapprochés forment une **chaîne de déchéance** et peuvent conduire à un état plus profond. La jauge a deux conséquences : des jetons Déchéance dans le sac et des cartes nuisibles dans le paquet de spectacle.

La quantité doit être plafonnée et reliée à la taille du paquet et au nombre de cartes nuisibles. L’exemple « neuf cartes musicales et cinq cartes de déchéance » illustre une forte présence ; il ne fixe pas une formule universelle.

Les jetons acquis vont immédiatement dans le sac. Si la récupération demande leur retrait alors qu’ils y sont encore, il faut les piger et les défausser avant de pouvoir les retirer. Les règles de retrait des cartes de spectacle restent à préciser séparément : ne pas transposer automatiquement le cycle du sac au paquet de scène.

### Proposition de modèle

Utiliser une quantité cible commune ou une correspondance explicite entre niveau de déchéance, nombre de cartes nuisibles et nombre de jetons. Calculer le plafond à partir des **cartes musicales de base**, pas du total déjà contaminé, pour éviter que les ajouts augmentent eux-mêmes le plafond sans fin.

Préciser le rapport exact cartes/jetons et vérifier son effet sur des sacs de tailles différentes. Un ajout de cinq jetons ne représente pas la même probabilité dans un sac de dix ou de cent jetons. L’interface affiche la quantité et la probabilité obtenues plutôt qu’un niveau abstrait seul.

Conserver les dates des épisodes, calculer leur proximité et faire diminuer l’effet de chaîne après une période sans nouvel excès. La fenêtre temporelle, le nombre d’épisodes par palier et les effets sont à équilibrer. Employer la jauge de déchéance existante comme référence ; ajouter seulement l’historique nécessaire aux chaînes, sans multiplier les jauges concurrentes.

Pour la séance elle-même, les effets proposés sont plaisir et exaltation immédiats, énergie dépensée et hausse de déchéance. L’excès manuel actuel donne déchéance +18, énergie −8 et exaltation de base +26 avant d’imposer une détente ; ces nombres décrivent la V7 et ne sont pas des coefficients validés pour une nouvelle séance. La nouvelle action et la commande manuelle doivent partager une règle explicite pour éviter un double effet.

La possibilité de faire des excès à plusieurs et leurs invitations restent proposées. Les formes d’état plus profond, leur durée et leurs conséquences doivent être spécifiées avant implémentation.

### Paquet de spectacle

**Interprétation proposée de l’ajout :** conserver les neuf cartes musicales et ajouter cinq cartes nuisibles donnerait quatorze cartes, parmi lesquelles sont tirées les cartes jouées. Confirmer cette lecture lors de l’équilibrage ; la V7 remplace actuellement des cartes musicales.

Le moteur de scène valide aujourd’hui un paquet de huit à dix cartes distinctes et dispose de quatre types de cartes maudites. Permettre plusieurs occurrences nuisibles exige de distinguer **type de carte** et **exemplaire**, et de revoir validation, tirage, main, historique, inspection et sauvegarde. Un plafond illustratif de cinq cartes ne peut pas être obtenu en gardant simplement l’ancienne contrainte de quatre types uniques.

Conserver les effets de cartes nuisibles déjà disponibles lorsque cohérents. Expliquer le double impact : moins de temps pour les activités souhaitées dans le quartier, plus de risques de cartes nuisibles en spectacle. Les chemins existants de récupération — sommeil, détente, soutien — restent à raccorder et à vérifier.

## 15. Architecture technique et migrations

Les sources exécutables actuelles se trouvent dans `dist/`. Éviter une réécriture générale : isoler les règles de séance, de sac, de progression, de catalogue et de noms lorsque cela clarifie leurs responsabilités.

| Domaine | Points actuels à adapter | Données et invariants cibles |
|---|---|---|
| Sac | `v7.mjs`, `engine.mjs`, `v7-view.mjs` | Six actions, sac/défausse, acquisitions, retraits, provenance et probabilités exactes |
| Séances | `decide`, `step`, `socialSessionsMinute`, `assignJam`, `updateJams` | Participants, admission, cycles, temps individuel et départs indépendants |
| Pratique | Boucle musicale de `step`, `learningGain`, `groupRehearsal` | Instrument actif, morceau, groupe, travail d’apprentissage et percées |
| Composition | `ensureProject`, `advanceProject`, `sampleDraft`, `releaseSong` | Brouillons multiples indépendants, coauteurs, contributions, dates, état et lien unique vers la chanson |
| Catalogue | `archiveSong`, `eligibleSongs`, rendu des projets et chansons | Classement relatif, archives manuelles, rattachement et maîtrise contextualisée |
| Noms | `createGroup`, `projectTitle` | Deux banques, registre partagé d’unicité et réservations persistantes |
| Déchéance | `changeDecadence`, commande `excess`, `activeDeck` | Chaînes, quantité cible, ajouts/retraits de jetons, exemplaires de cartes |
| Présentation | `app.mjs`, vues V7, vues de groupes et de scène | Libellés cohérents, catalogue filtrable, détails et état réel des règles |

Un instrument joué pendant une séance peut différer de l’instrument principal sans réécrire l’identité du personnage. La sélection des cartes de spectacle ne doit pas changer implicitement parce qu’il vient de pratiquer un instrument secondaire.

Chaque projet doit porter ses propres échantillons émotionnels et données de travail. Le brouillon unique actuel du personnage ne peut pas servir à plusieurs projets alternés sans mélanger leurs sources et leur qualité.

Prévoir une migration V7 vers V7.1 ainsi que le chemin des sauvegardes plus anciennes. Conserver sauvegarde préalable, identifiants, chansons, projets, auteurs, liens, groupes, répertoires, calendriers, historique et configurations utilisateur.

Migrer restants vers sac et consommés vers défausse. Une ancienne réservation devient défaussée une fois, tandis que l’action en cours reste identifiable ; aucun deuxième jeton n’est prélevé pour sa reprise. Les modifications de composition future déjà enregistrées nécessitent une règle de reprise documentée, sans duplication de stocks.

Les anciennes jams peuvent contenir une vraie répétition : proposer de migrer les séances explicitement associées à un groupe et un morceau vers Pratiquer, et les autres vers Jam. Préserver les engagements et les actions protégées. Définir le traitement des durées déjà commencées sans les retirer au hasard à chaque chargement.

Les spectacles enregistrés ou en cours gardent leur version de règles et leur paquet initial. Un changement de calcul de déchéance ne réécrit pas un replay historique. Affichage et audio ne consomment jamais le hasard de simulation.

## 16. Documentation, navigation et recherche

Le plan est accessible dans la navigation VitePress sous **Plan V7.1 — en cours**. Il distingue la cible des DDD décrivant la V7 livrée. Les décisions implémentées doivent ensuite être reportées exhaustivement dans les DDD propriétaires au fil des lots.

| DDD à actualiser ou créer lors de la réalisation | Contenu attendu |
|---|---|
| [Actions](./gdd/actions.md) | Six actions, fourchettes, cycles, interruptions, sac/défausse, ajouts et retraits |
| [Interactions](./gdd/interactions.md) | Admission commune, résultat sans double validation, départs, invitations, propositions d’activités |
| [Musique](./gdd/musique.md) | Instruments, plateaux, pratique collective, Jam, création de groupes, raccords vers compositions |
| Nouveau DDD Compositions et catalogue | Projets multiples, contributions, qualité, durée, abandon, rattachement, maîtrise et classements |
| Nouveau DDD Déchéance | Action, chaînes, plafonds, récupération, jetons et cartes de scène |
| [Shows](./gdd/shows.md) | Répétitions transférées vers Pratiquer, setlists, morceaux faibles, paquet contaminé et exemplaires |
| [Personnages](./gdd/personnages.md), [Traits](./gdd/traits.md) | Effets réellement actifs, instruments secondaires, progression et exceptions validées |
| [Relations](./gdd/relations.md) | Formation de groupes et amour conservés ; conséquences des échanges revus |
| [Temps](./gdd/temps.md), [Sommeil](./gdd/sommeil.md) | Cycles, durées personnelles, interruptions, temps de recherche, abandons et chaînes |
| [Technique](./gdd/technique.md) | Modèle, noms uniques, règles de migration, performances de catalogue et déterminisme |
| [Raccords V7](./gdd/raccords-v7.md) | État des raccords hérités, modifications V7.1 et limites explicitement maintenues |
| [Architecture documentaire](./gdd/documentation.md) | Nouveaux domaines, liens, index partagé et navigation |

Ajouter aux deux recherches, VitePress et recherche du jeu, les termes et synonymes utiles : détente/décrocher, Jam/jammer, cycle, défausse, retrait, admission, répétition, instrument secondaire, plateau, percée, coauteur, maîtrise, qualité, archive, abandon et chaîne de déchéance.

VitePress indexe le plan comme conception. L’index de règles du jeu garde les comportements livrés : il intégrera les nouveaux DDD lorsqu’ils seront réalisés, sans présenter les propositions du plan comme déjà actives. Vérifier les ancres et les liens entre sujets, les notes de version, le guide et le README.

Passer le numéro de version, le footer et les notes à 0.7.1 lors de la livraison du comportement, pas lors de la seule rédaction du plan.

## 17. Ordre de réalisation

| Lot | Travail | Condition de sortie |
|---|---|---|
| 1 — Contrats et paramètres | Fixer les arbitrages structurants ci-dessous ; définir les données et leur migration | Aucun passage collectif ou retrait de jeton sans règle définie |
| 2 — Sac et séances | Défausse, acquisitions immédiates, retraits différés, admission, cycles et interruptions | Inventaire traçable et transitions sans double consommation |
| 3 — Détente et socialisation | Durées personnelles, entrée sociale, échanges et départs, proposition d’activité | Scénarios solo/groupe/refus/interruption cohérents |
| 4 — Pratique et Jam | Contenus variables, instruments, groupe commun, répétitions, plateaux, Jam solo ouverte | La pratique prépare les morceaux ; la jam garde sa fonction expressive |
| 5 — Composition et classement | Projets multiples, coauteurs, travail long, abandons, qualité relative | Aucune duplication de chanson, aucune perte de projet ou de contribution |
| 6 — Déchéance et scène | Chaînes, quantités cibles, jetons, paquet additionnel et exemplaires | Double effet visible, plafonné et compatible avec sauvegardes/replays |
| 7 — Catalogue et noms | Filtres, tri, fiche complète, contextes de maîtrise, générateurs et unicité | Catalogue lisible avec plusieurs centaines de morceaux et noms discernables |
| 8 — Intégration et livraison | Migrations réelles, essais longs, équilibrage, DDD complets et recherches | Version 0.7.1 cohérente, limites annoncées, validations et publication contrôlées |

Chaque lot inclut sa documentation et les vérifications de ses règles. La passe finale vérifie l’ensemble plutôt que de repousser toute la documentation à la fin.

## 18. Arbitrages à fixer avant leurs lots

| Sujet | Acquis | Reste à fixer / proposition de départ |
|---|---|---|
| Fourchettes | Durées personnelles variables ; contenu cyclique en pratique | Valeurs initiales, bornes souples ou dures, durée des cycles et départs prioritaires |
| Entrée collective | Demande initiale, contraintes selon l’action | Responsable de l’acceptation et règle de transition hors sac |
| Conversation | Résultat direct après admission ; départs dynamiques | Élan/tonalité, envie de continuer, fatigue sociale, limite de recherche et ses effets |
| Proposition d’activité | Rare, liens et durée de conversation pertinents | Participants concernés, issue favorable/neutre/défavorable et lancement réel |
| Pratique | Principal favorisé, secondaires possibles ; groupe pour répéter | Liste des secondaires, poids, choix du morceau et mesure de maîtrise personnelle |
| Plateaux | Petits gains et percées | Travail requis, vitesse et premiers modulateurs effectivement raccordés |
| Composition | Plusieurs projets, généralement longue, collaboration de groupe | Sélection du projet, travail/qualité, élan des deux émotions, abandon et coauteurs |
| Catalogue | Qualité relative, faibles conservés et jouables | Référence statistique, seuil, reclassement, restauration et droits après départ |
| Déchéance | Chaînes, double effet, ajout au sac et retrait en défausse | Fenêtre, paliers, conséquences, rapport cartes/jetons et plafond fondé sur le paquet de base |
| Paquet | Davantage de cartes nuisibles souhaitées | Confirmer l’ajout au paquet musical ; gérer les occurrences multiples et leur récupération |
| Noms historiques | Unicité des nouvelles créations et distinction des types | Préserver puis corriger explicitement les collisions héritées |

Ces arbitrages portent sur la réalisation et l’équilibrage. Ils ne rouvrent pas les décisions validées, notamment l’absence de remboursement, la jam solo, la pratique collective limitée au groupe et la conservation des morceaux faibles.

## 19. Validation et critères d’acceptation

### Simulation et inventaire

- Un échec de recherche ou une interruption ne remet aucun jeton dans le sac.
- Un jeton acquis peut être pigé dès le prochain choix ; un retrait n’efface jamais un jeton encore dans le sac.
- Une baisse de déchéance laisse les retraits nécessaires en attente, sans création répétée de jetons ni dépassement du plafond par simple passage du temps.
- Les changements de cycle dans une même action ne consomment pas de nouveau jeton ; une transition admise ne déclenche pas deux piges.
- Une sauvegarde rechargée retrouve les mêmes inventaires, participants, projets, cycles et décisions, à hasard équivalent.

### Activités et relations

- Détente interrompue par admission sociale : effets antérieurs conservés, aucune reprise du reliquat.
- Admission sociale refusée : pas d’inscription ; admission acceptée : échanges suivants sans nouvelle validation d’entrée.
- Une arrivée ne redémarre pas la séance ; les départs sont personnels et le sommeil reste prioritaire selon ses règles.
- Une pratique collective hors groupe commun est refusée ; un morceau est attribué au seul groupe travaillé.
- Principal et secondaires sont choisis selon les poids, avec gains sur l’instrument réellement joué ; expression inchangée par défaut en pratique.
- Jam solo active immédiatement ; arrivée puis départ d’un partenaire sans attente imposée ; aucun gain direct de maîtrise de répertoire.
- De nouveaux groupes peuvent encore se former dans une partie autonome ; amour et soutien continuent de fonctionner.

### Création, interface et scène

- Alternance entre projets sans mélange des brouillons, des émotions ou des sources ; projet collectif finalisé une seule fois.
- Plusieurs séances généralement requises pour composer, avec différences entre profils et exceptions émotionnelles mesurées plutôt que systématiques.
- Projet abandonné distinct d’une chanson faible ; chanson faible retrouvable et utilisable ; classement expliqué par l’historique de l’auteur.
- Qualité, maîtrise, auteurs, rattachement et répertoires visibles sans ambiguïté ; tri/filtres corrects même avec valeurs absentes ou œuvres collectives.
- Plusieurs centaines d’œuvres consultables sans perte de focus, de scroll ou de sélection sur ordinateur et téléphone.
- Noms nouveaux uniques dans les deux banques, y compris après sauvegarde, archivage et abandon ; pas de boucle de génération ; groupes proches rejetés selon la règle définie.
- Paquets contaminés avec occurrences multiples : tirage, effets, inspection, skip/replay et import valides ; spectacles historiques préservés.
- Tous les nouveaux comportements livrés présents dans les DDD et retrouvables dans les deux recherches ; limites inactives identifiées.

Prévoir des simulations longues sur plusieurs profils de sacs pour mesurer temps par action, percées, chansons terminées, abandons, groupes créés, cycles de déchéance et récupération. Les distributions attendues deviennent des cibles d’équilibrage après les premiers essais ; elles ne doivent pas être inventées comme des résultats déjà observés.

La livraison est complète lorsque ces parcours fonctionnent ensemble, avec migration, documentation et interface cohérentes. Un raccord reporté doit être explicitement signalé et ne doit pas produire de bonus fictif, de compteur trompeur ou de blocage du jeu.

## 20. Réalisation 0.7.1 et arbitrages

Le mandat « code ce plan, design les trous » autorise les détails de réalisation des décisions précédentes. Six actions, sac/défausse, admissions, cycles, instruments, plateaux, projets, classement, catalogue, noms et déchéance sont implantés. Formation de groupes et romance conservent leurs règles existantes.

| Point à préciser | Choix codé | DDD propriétaire |
|---|---|---|
| Durées | Fourchettes individuelles, durée indicative et cycles de 15 minutes | [Actions](./gdd/actions.md) |
| Conversation | Intensité +4/−8/−1 selon résultat ; besoins et destinataire déterminent les départs | [Interactions](./gdd/interactions.md) |
| Proposer une activité | Rare, après 30 min et affinité >20 ; autres actions existantes seulement | [Interactions](./gdd/interactions.md) |
| Instruments et plateaux | Principal 85 %, secondaires 15 % ; 10 % immédiat, 90 % accumulé, percées de 2 | [Musique](./gdd/musique.md) |
| Pratique collective | Même groupe, morceau explicite, admission ; demande sans morceau refusée | [Musique](./gdd/musique.md) |
| Projets | Reprise 80 % / nouveau 20 % ; cibles longues, contributions, élan à deux axes, abandon à 14 jours | [Compositions](./gdd/compositions.md) |
| Faibles | Référence des meilleures autres œuvres de l’auteur ; écart de 12 points | [Compositions](./gdd/compositions.md) |
| Noms | Banques distinctes, registre global, identité centrale de groupe non répétée, épuisement explicite | [Compositions](./gdd/compositions.md) |
| Excès | Épisodes sur 12 heures, +3 × chaîne par cycle | [Déchéance](./gdd/decheance.md) |
| Paquets | Quantité liée `floor(jauge/20)`, plafond `ceil(base×0,6)` ; cartes ajoutées, jetons retirés en défausse | [Déchéance](./gdd/decheance.md) |

Aucun nouveau trait, besoin, rendez-vous général, fan, récompense, maladie ou jauge d’addiction. Inspiration, souvenirs/chimie vers les plateaux et pression spécifique de recherche sociale restent débranchés. Le registre [Raccords](./gdd/raccords-v7.md) énumère aussi les limites héritées de V7 et l’ancien seuil absolu d’archivage.

La version est vérifiée par simulations, imports réels, reprise exacte, tests de moteur et de navigateur, build VitePress et contrôle des recherches. Les coefficients restent de l’équilibrage à éprouver en jeu, pas une nouvelle validation rétroactive des propositions. La publication depuis `main` passe les mêmes vérifications que la PR et déploie le jeu et la documentation ensemble.
