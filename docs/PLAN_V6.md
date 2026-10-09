# Garage vivant — plan V6 : une scène lisible, un quartier qui a une histoire

**Plan de design — 9 octobre 2026. Implémentation V0.6.0 ajoutée au dépôt.**

Les règles effectivement livrées sont décrites dans les [GDD par système](index.md) et les [notes de version](CHANGELOG.md). Les lots techniques sont implémentés et vérifiés par tests moteur et parcours Chromium. La validation de compréhension par un testeur et l’équilibrage restent des étapes de playtest; les hypothèses chiffrées de ce plan ne constituent pas des promesses de réglages définitifs.

Le détail des groupes utilise des sections repliables; les modules de fiche se déplacent par boutons et changement de largeur. Les traces de replay gardent la dernière chanson de douze prestations, tandis que tous leurs bilans restent disponibles. Les archives de souvenirs sont bornées à 600 entrées par personnage.

Base auditée : V0.5.1, commit principal `d7af69c8`. Ce plan remplace les choix de calendrier saisonnier du plan V5; celui-ci reste conservé comme historique. Les chiffres proposés ci-dessous sont des hypothèses de réglage à tester, pas des règles déjà validées.

## 1. Direction : préparer, comprendre, s’attacher, recommencer

La boucle cible : **vivre dans le quartier → créer des liens et des chansons → préparer un band → jouer devant un public → comprendre les conséquences → retrouver les personnages transformés par cette expérience.**

Trois promesses guident les arbitrages :

1. **Le spectacle explique la musique.** On voit qui joue, ce que sa carte provoque et comment le public réagit. La physique sert cette lecture.
2. **Les personnages gardent leur histoire.** Un conflit, une amitié, un show et une chanson laissent une trace identifiable. Les cubes restent simples : accessoire, gestuelle et émotion suffisent.
3. **Le joueur peut toujours agir ou sortir.** Choisir, annuler, inspecter, accélérer, sauter et retrouver une information doivent être évidents. L’autonomie reste le fonctionnement normal.

La V6 se livre par étapes jouables. Un premier show convaincant doit être validé avant de multiplier les groupes et les chansons sur la même affiche.

## 2. Diagnostic du code actuel

| Constat vérifié | Conséquence | Correction structurante |
|---|---|---|
| `app.mjs` avance le show même hors de la vue Shows; le quartier attend sa fin. | On peut arriver tard devant un spectacle presque terminé et percevoir un quartier bloqué. | État « prêt à regarder », politique explicite de lecture et raison de pause visible. |
| `stage.mjs` concentre cinq cartes par musicien dans 36 secondes à ×1; la vitesse de show persiste. | La densité augmente fortement avec le band; une vitesse antérieure peut aggraver la lecture. | Séparer résolution et mise en scène; réinitialiser la lecture d’un nouveau show à ×1. |
| Quatre occasions appartiennent à une saison à relancer; leurs identifiants sont réutilisés. | Arrêt ressenti après les dernières dates; historique ambigu si on prolonge naïvement. | Calendrier roulant et identifiants permanents. |
| Une réservation désigne une seule chanson; aucun vrai créneau de première partie. | Impossible de composer une soirée multi-groupes cohérente. | Événement → créneaux → prestations → morceaux. |
| La tension perd 0,4 point par heure pour toutes les relations; des échanges la diminuent aussi. | Les conflits peuvent disparaître sans réparation. | Refroidissement modulé et grief persistant, puis équilibrage de la fréquence des interactions. |
| Le sac Rapin expose les scores au carré normalisés, recalculés à chaque décision. | Les pourcentages visibles ne sont pas des paramètres éditables. | Distinguer composition du sac et probabilités effectives de la prochaine pige. |
| Les souvenirs expirés sont retirés; journal limité à 500 événements, activités récentes limitées. | Un lien « historique complet » ne peut pas restituer un passé déjà supprimé. | Archive dédiée pour les nouveaux souvenirs; limites et migration honnêtes. |
| Le DOM dispose déjà de mécanismes de conservation du focus et du scroll. | Une refonte qui reconstruit les panneaux annulerait les correctifs V5.1. | Réutiliser les identités stables et tester toute mise à jour pendant l’interaction. |

Le code confirme ces mécanismes. Il ne prouve pas que chacun explique à lui seul chaque glitch rapporté : les reproductions visuelles restent une étape du premier lot.

## 3. Shows : une résolution automatique que l’on peut suivre

### 3.1 Contrat des horloges et des boutons

États explicites : **occasion ouverte → réservation directe ou candidature → confirmation → rassemblement → prestation en direct → bilan**, avec branches refus, retrait, annulation et absence. L’ouverture d’un panneau ne doit jamais, à elle seule, démarrer ou terminer une prestation.

À l’heure du show, après validation des présences, **le quartier se met en pause et la vue du spectacle s’ouvre automatiquement au début**. Une courte annonce présente le band avant la première carte. Le joueur regarde en direct ou utilise Sauter; aucune résolution automatique hors écran dans cette version. Le header indique **Quartier en pause — show en direct**. Si un formulaire est ouvert, conserver son brouillon et sa position pour le retour; si l’onglet navigateur est masqué, attendre son retour avant de commencer la présentation.

| Contrôle | Comportement proposé |
|---|---|
| Entrée automatique | Ouvre le show au début, à ×1, band et morceau annoncés; met le quartier en pause. |
| Pause / reprendre | Suspend uniquement la présentation; aucune conséquence supplémentaire. |
| ×0,5 / ×1 / ×2 / ×4 | Change la vitesse de visionnement; tirages, physique et résultat restent identiques. |
| Sauter la prestation | Résout les morceaux restants du band et ouvre son bilan; applique ses conséquences une fois. |
| Sauter la soirée | Résout les créneaux restants, puis affiche les bilans par band. |
| Consulter le quartier | Inspection seulement, show et quartier en pause; retour visible au direct. Pour reprendre la simulation, terminer ou sauter la soirée. |
| Interrompre la prestation | Abandon volontaire distinct de « sauter »; confirmation et coût annoncé avant application. |
| Revoir | Rejoue les données enregistrées, sans modifier le monde. |

Pour cette version, l’horloge, les déplacements et les décisions du quartier restent gelés pendant toute la soirée. Pas de simulation cachée ni de rattrapage après le show. Les créneaux et morceaux s’enchaînent sur une horloge musicale propre à l’événement; leurs durées servent à construire l’affiche et à vérifier les disponibilités. À la fin, appliquer les conséquences une fois, puis reprendre le quartier au même instant simulé et à sa vitesse précédente (ou rester en pause s’il l’était déjà). Les créneaux terminés ne se redéclenchent pas lorsque l’horloge du quartier traverse ensuite leur heure nominale. Cette convention provisoire doit être documentée et testée explicitement.

Masquer l’onglet navigateur suspend toujours la lecture, sans rattrapage au retour. Le slider du quartier reste aimanté à 0,5 et aux entiers; pendant un show, son état explique qu’il contrôle le quartier. Les commandes de lecture du show sont indépendantes.

### 3.2 Une phrase musicale lisible

Chaque action importante suit quatre temps : **anticipation du cube → carte qui claque → impact sur la cible → réaction et variation de jauge**.

- Carte : nom, musicien, instrument, effet principal, cible ou zone. Exemple illustratif : « Riff de guitare — impact 18 — +25 % sur les fans de métal ». Les nombres affichés doivent provenir du calcul réel.
- La carte reste lisible environ 1 à 1,5 seconde à ×1; anticipation et impact peuvent se chevaucher avec la phrase suivante. Ajuster après observation, pas ajouter un délai fixe à chaque événement secondaire.
- Une zone de combo montre la préparation : basse pose le groove, batterie le renforce, guitare le déclenche. L’effet explique « portée augmentée », pas seulement « combo 8 ».
- Deux messages importants maximum simultanément; les effets secondaires se regroupent, avec détail accessible. Le journal de la prestation conserve toutes les cartes.
- Petits mouvements continus cohérents avec le rythme; réactions fortes réservées aux moments qui comptent. Effets réduits, pause d’inspection, son volontaire, aucune information portée uniquement par couleur ou audio.

**Budget de lecture :** viser d’abord 45–75 secondes pour une chanson d’un quartet à ×1. Un band de dix membres ne doit pas produire cinquante gros panneaux superposés : regrouper les accompagnements par phrase et mettre les solos/combos en avant, tout en gardant chaque carte inspectable. Mesurer le résultat avec 2, 4, 10 et 24 membres avant de figer le rythme.

### 3.3 Architecture de lecture

Conserver le moteur déterministe; produire des événements ordonnés avec identifiant, instant, auteur, carte, cibles, valeurs avant/après et causes. La présentation consomme ces événements avec son propre curseur et des points de reprise. Elle ne relance aucun tirage.

Ne pas simplement ralentir le moteur physique avec des pauses de rendu : les positions et les impacts doivent rester ceux de la résolution. Prévoir des instantanés ou une reconstruction déterministe pour reprendre, inspecter et revoir. Séparer les graines quartier, prestation et décoration pour que consulter une fiche n’influence jamais le futur.

### 3.4 Scène, public et bilan

En haut : **nom du band · rôle dans la soirée · style · chanson 2/3 · titre · progression**. Au centre, les musiciens et la foule. En bas, une ligne de lecture et les contrôles toujours visibles, sans exiger de scroll.

Cliquer un fan ouvre un panneau contextuel ancré, déplacé automatiquement pour rester à l’écran : goûts, instrument favori, émotion, jauge actuelle, dernière carte reçue et explication. Même principe pour un musicien : état, énergie, carte courante, main, contribution. Inspection en pause automatique avec reprise explicite; sélection clavier et liste alternative au canvas.

Un fan euphorique se transforme en quelques mini-cubes de sa couleur, avec son signe distinctif. Il ne redevient pas instantanément le cube initial. **Une personne reste une personne** : les fragments ne multiplient ni fans, ni récompenses, ni réactions en chaîne. Sa fiche reste accessible par l’amas ou la liste. Limiter le nombre de fragments actifs; en effets réduits, conserver un groupe statique de mini-cubes.

Présenter trois lectures principales :

- **Public conquis : 8 sur 12 personnes**, avec jauges et réactions.
- **Qualité de la prestation : 72/100**, accompagnée de deux causes concrètes, favorables ou défavorables.
- **Ce que le band en retire :** réputation avant/après, fatigue, maîtrise, moment relationnel marquant.

Les détails distinguent qualité de composition, maîtrise et interprétation. Supprimer ou renommer « critique » si aucune mécanique distincte ne la calcule. Aucune valeur à dénominateur ambigu. Le bilan garde le nom et les membres présents, même après dissolution du groupe.

## 4. Calendrier continu et préparation claire

### 4.1 Quatre dates devant soi, sans saison

Toujours quatre événements **à venir**, plus l’événement en cours dans un emplacement distinct. Quand une date commence, elle sort de la file et une nouvelle entre. Les événements manqués et annulés vont dans l’historique. Un gros show apparaît pour les ordinaux 4, 8, 12…; annuler une date ne déplace pas ce rythme.

Conserver au départ l’espacement actuel de deux jours simulés pour comparer; le rendre configurable dans les constantes de design. Tester au-delà du jour 100, après import ancien et après avance temporelle. Un événement sans groupe se termine comme « non programmé », sans arrêter le calendrier.

Mini-calendrier de quatre cartes dans Quartier et vue Shows : date, lieu, ampleur, places libres, bands inscrits, statut du band sélectionné. Le gros événement se distingue par capacité, attentes, ambiance et potentiel de reconnaissance; il ne donne pas gratuitement une meilleure note.

### 4.2 Modèle musical

| Objet | Responsabilité |
|---|---|
| Événement | Lieu, date, public, affiche de 2 ou 3 créneaux, ordinal permanent. |
| Créneau | Première partie ou tête d’affiche, début, durée, band et état de réservation. |
| Prestation | Formation réellement présente, intention, setlist, résultat attribué à ce band. |
| Morceau joué | Référence à une composition ou improvisation, durée, tirage et résultats propres. |

Point de départ à tester : première partie de 10 minutes musicales, tête d’affiche de 20 minutes; durée de morceau par défaut de 4 minutes et changement de plateau explicite. Ce temps musical n’est pas la durée de visionnement. Deux premières parties constituent le troisième créneau; le modèle permet ensuite deux têtes d’affiche de même durée.

La setlist respecte le budget de durée. Montrer « 8/10 min — 2 morceaux », permettre l’ordre, le retrait et l’ajout. Une improvisation remplit un créneau sans composition et ne crée pas de chanson dans le catalogue. La durée se déclare dans les données musicales; on ne tronque pas arbitrairement un morceau pour faire entrer la liste.

Le public conserve son identité et son échauffement entre morceaux. La conquête est créditée une fois par fan et par prestation; la même personne peut apprécier plusieurs bands. Les fragments restent visuels. L’échauffement transmis entre bands est plafonné et les attentes augmentent pour la tête d’affiche : passer en dernier ne garantit pas le succès. Les scores et récompenses doivent être normalisés par durée et public, pour éviter l’exploitation par morceaux très courts.

### 4.3 Préparer sans impasse

Parcours en quatre étapes, résumé permanent : **date/créneau → band/membres → setlist/intention → confirmations**. Chaque blocage indique sa cause et une action pour avancer. Les boutons ne restent jamais silencieux.

- Avant confirmation, revenir et changer les choix librement.
- Après confirmation, modifier seulement en revalidant disponibilités et consentements; conserver la réservation précédente si la modification échoue. Annulation toujours explicite.
- Les bands évaluent et réservent leurs occasions de façon autonome selon les règles ci-dessous, y compris les bands du personnage joueur. Le joueur peut intervenir, retirer une candidature ou annuler une réservation; les décisions autonomes sont annoncées avec leurs raisons. Les confirmations des membres restent nécessaires.
- Un musicien commun à deux bands peut jouer deux créneaux compatibles. Vérifier les intervalles, trajets et récupération, pas seulement l’égalité de date. Expliquer les conflits de choix.
- Si moins de deux musiciens arrivent, afficher l’absence et libérer le créneau. Un autre band n’est pas pénalisé par ce blocage. À court terme, le créneau reste vide; remplacement de dernière minute hors périmètre.
- Un événement accepte 2–3 bands mais n’en invente pas si le quartier en possède moins. Il peut se dérouler partiellement rempli.

### 4.4 Réserver une petite scène ou tenter une grosse

**Un seul engagement futur par band**, commun à tous les membres : soit une réservation confirmée, soit une candidature en attente. Une candidature occupe donc la place jusqu’au résultat ou au retrait. Un band ne peut pas postuler à plusieurs créneaux d’une même soirée ni réserver ailleurs en attendant. Une défaite, une annulation ou la fin de la prestation libère cette place. Les appartenances multiples restent permises, sous réserve des disponibilités individuelles.

**Petits shows : premier arrivé, premier servi, par créneau.** Dès l’ouverture annoncée, une demande admissible avec au moins deux membres confirmés prend la place, sans concours de réputation. Les contrôles portent sur les disponibilités et les règles de formation, pas sur une qualité minimale protectrice : un band peut viser trop haut et se planter. Traiter des demandes simultanées dans un ordre tiré par la graine, plutôt que favoriser systématiquement le premier groupe du tableau. La confirmation est atomique : deux bands ne gagnent jamais la même place.

**Gros shows : candidatures puis sélection.** Ouvrir les inscriptions dès l’annonce de la date; les fermer et sélectionner à **T−2 jours simulés** comme réglage initial. Les élus disposent ainsi de deux jours pour préparer leur prestation. Afficher ouverture, date limite et annonce des résultats. Une date nouvellement générée doit toujours laisser une vraie fenêtre de candidature; à la migration, les réservations déjà confirmées sont conservées.

L’organisateur est un profil abstrait de l’événement, sans nouveau NPC nécessaire. Ses goûts et attentes sont visibles : style, public, exigence et préférence pour la découverte ou les bands établis. La sélection considère adéquation musicale, préparation/maîtrise, réputation, fiabilité connue et complémentarité avec les groupes déjà retenus. Éviter qu’une réputation élevée écrase tous les autres critères.

Utiliser une sélection aléatoire pondérée parmi les candidatures admissibles, sans remise; recalculer la complémentarité après chaque choix. Une préférence forte donne un avantage, pas une victoire garantie. Enregistrer la graine, les candidatures examinées et les raisons du résultat; recharger ne permet pas de relancer le concours. Attribuer chaque créneau une seule fois. Avec trop peu de candidatures, remplir ce qui est possible sans inventer de bands. Afficher « retenu », « non retenu » ou « retiré » : un retrait volontaire n’est pas un refus de l’organisateur.

### 4.5 Pourquoi un band choisit de s’inscrire — ou d’attendre

Évaluer les occasions à intervalles espacés et lors d’un changement pertinent, jamais à chaque image. Le band compare gain attendu, adéquation au public, préparation à la date du show, énergie, disponibilités, risque d’échec et coût d’occuper son unique engagement. Un seuil minimal d’intérêt et un délai avant réévaluation empêchent les candidatures automatiques partout et les cycles retrait/réinscription.

L’ambition pousse vers un défi; la discipline valorise la préparation; la prudence après un échec favorise une petite scène. Agréger les personnalités des membres avec une proposition de l’organisateur du band, puis leurs confirmations; pas une décision qui change arbitrairement à chaque clic. Une réussite récente peut encourager sans garantir une nouvelle inscription. Une déception peut rendre prudent sans interdire tout retour sur scène.

Présenter au joueur **accessible · ambitieux · très risqué**, avec deux ou trois raisons. Distinguer la difficulté d’être sélectionné de celle de réussir devant ce public. Pas de pourcentage exact cachant l’incertitude sur les autres candidatures.

### 4.6 Moral, refus et risque de scène

Introduire un moral collectif explicable dans la fiche du band : niveau de référence et modificateurs temporaires datés, reliés à un événement. Il représente la confiance du groupe dans son projet, distincte du développement, de la réputation et des émotions individuelles. Son effet sur initiative et interprétation reste borné.

| Issue | Conséquence de design |
|---|---|
| Candidature non retenue | Déception temporaire du band, moins d’assurance pour retenter une grosse scène; aucune perte de réputation puisqu’il n’a pas joué. |
| Retrait avant sélection | Libère l’engagement, sans malus de refus; délai de réévaluation pour éviter le spam. |
| Prestation décevante | Moral et réputation affectés selon l’écart aux attentes de cette scène. Résultat expliqué au bilan. |
| Prestation réussie | Confiance et reconnaissance proportionnées à l’occasion; petite scène utile pour progresser. |

Hypothèses initiales à équilibrer : refus = −8 de moral pendant deux jours; mauvaise prestation = −5 à −15 de moral pendant un à trois jours selon l’écart aux attentes. Les modificateurs décroissent progressivement; plafonner leur cumul et leur influence sur la prochaine prestation. La réputation peut baisser réellement après un échec public, mais une scène amateur tolère davantage qu’un gros événement. Les bornes de réputation doivent permettre une progression et une récupération cohérentes.

Prévenir la spirale d’échec : les petites scènes restent ouvertes aux débutants, la préparation/reprise collective aide à récupérer et le malus temporaire expire même sans victoire. Un seul événement de refus par candidature, un seul bilan par prestation. Les membres peuvent recevoir une émotion liée sans appliquer deux fois le même malus de performance via émotion et moral.

## 5. Groupes et personnages : de l’espace pour l’information utile

### 5.1 Groupes en liste, détail à la demande

Une ligne par band : nom, style, membres miniatures, développement, réputation, prochain engagement. Recherche et filtres actif/archivé; sélection stable même quand les chiffres changent. Le détail prend le reste de l’espace.

Onglets de détail : **Aperçu · Membres · Répertoire · Shows · Histoire**. Dans Shows : date, rôle, morceaux, résultat, effets et accès au bilan/replay disponible. Les données historiques figent le nom du band et les participants de l’époque.

Trois termes non interchangeables : **Catalogue des membres** = compositions disponibles; **Répertoire du band** = morceaux adoptés et travaillés; **Setlist** = ordre choisi pour une prestation. Ajouter au répertoire est un bouton clair; sélectionner une chanson dans une liste ne constitue pas une réservation cachée. Une œuvre jouée demeure dans l’histoire si son auteur quitte le band.

Le développement reste une coordination entretenue; la réputation est acquise. Conserver l’archivage réversible V5 pour cette livraison et le rendre visible avec sa cause. Un état « dormant » plus fin est une piste séparée, pas une nouvelle refonte implicite des groupes.

### 5.2 Fiche détaillée personnalisable

La fiche rapide reste pratique pour surveiller le quartier. La vue détaillée occupe l’espace central disponible, avec identité/action/émotion fixes, puis modules : besoins, compétences, projets/compositions, relations, souvenirs, sac Rapin, cartes, bands et historique.

Deux colonnes sur écran large, une sur mobile; compétences immédiatement avant compositions par défaut. Chaque module offre déplacer haut/bas, changer de colonne, largeur et masquer. Le glisser-déposer est un raccourci, jamais le seul contrôle. Les modules masqués se retrouvent en bas, repliés dans « Modules masqués ». Bouton rétablir la disposition.

Disposition commune aux fiches au départ, sauvegardée par navigateur; sélection, défilement et panneaux ouverts par personnage. Les préférences d’interface ne font pas partie du moteur de simulation. Un changement de version réintègre les nouveaux modules sans effacer l’organisation existante.

**Contrat anti-scroll :** une mise à jour de jauge ne remonte aucun panneau, ne déplace pas la sélection et n’interrompt pas un slider. Aucun tri automatique sous le pointeur. Un changement volontaire de personnage restaure sa position. Un seul scroll principal par zone; scroll interne seulement pour une liste bornée. Préserver une ancre de contenu, pas uniquement un nombre de pixels.

### 5.3 Souvenirs datés

Afficher date de création, effet, durée restante et cause liée. Deux sections : actifs et récemment terminés. « Voir le journal de ce personnage » applique le filtre et permet de revenir à la même position.

Créer un registre persistant de souvenirs avec identifiant, source, participants, début et fin. Garder les souvenirs terminés détaillés sur une fenêtre définie; archiver les plus anciens sous forme compacte consultable/exportable. Distinguer ce registre du journal technique borné. À la migration, conserver ce qui existe, indiquer « date d’origine inconnue » si nécessaire; ne pas fabriquer les souvenirs déjà perdus.

## 6. Sac Rapin et action de récupération

### 6.1 Fusionner avant d’exposer les réglages

Une action **Récupérer**, avec trois contextes automatiques : sommeil réparateur, pause solo, détente ensemble. L’énergie critique choisit le sommeil; les autres besoins et la présence de partenaires orientent la pause. L’interface nomme le contexte (« Récupère avec Camille »).

Additionner les compteurs historiques repos/décrocher; conserver leur ancien libellé dans les événements passés. Convertir les actions en cours en conservant leur contexte, leur durée restante et leur destination. Pour la priorité commune, prendre la plus haute priorité autorisée des deux; si les deux étaient interdites, garder l’exception de sécurité explicite. Additionner leurs parts Rapin puis normaliser.

Pas de réintroduction de faim, travail ou argent. La récupération peut se faire avec quelqu’un sans devenir une septième action.

### 6.2 Un sac réellement éditable, sans mentir sur les probabilités

Deux modes par personnage : **Profil automatique** conserve le comportement actuel; **Sac personnalisé** permet une répartition de base totalisant 100 %. Modifier une part redistribue le reste proportionnellement entre les lignes non verrouillées. Verrous, remise à zéro et cas total nul doivent avoir un comportement explicite.

Afficher côte à côte **dans mon sac** et **chance maintenant**. En mode personnalisé, la part de base remplace la préférence initiale du profil; les besoins, émotions, disponibilité et priorités modulent ensuite le tirage. Ne pas multiplier aveuglément par le score historique complet : cela compterait la personnalité deux fois.

Règle proposée : poids effectif = part de base × modificateur de contexte borné × priorité; normalisation parmi les actions admissibles. Repos vital prioritaire, même si sa part vaut zéro. Une action interdite a zéro chance hors cette exception. Un besoin impérieux affiche « récupération imposée », sans simuler une fausse pige.

Les priorités restent communes aux modes autonome classique et Rapin. Une explication montre pourquoi « composer 30 % dans le sac » devient « 18 % maintenant ». Les réglages affectent la prochaine décision, pas une activité déjà engagée. L’affichage arrondit proprement à 100 % sans modifier les poids réels.

## 7. Relations : conflits durables, rapprochements visibles

### 7.1 Émotion du moment et problème relationnel

La colère peut retomber rapidement; la tension décrit un problème encore présent avec quelqu’un. Affinité et confiance restent orientées. Ne pas ajouter une deuxième jauge publique de tension : ajouter, si nécessaire, un grief structuré lié à un événement, avec intensité et état de réparation.

Proposition testable de refroidissement : retirer par heure `0,02 + 0,18 × amitié`, où amitié vaut l’affinité positive normalisée entre 0 et 1. Cela donne 0,48 point par jour entre inconnus et jusqu’à 4,8 entre proches. Un grief non résolu peut maintenir un plancher faible; sa force s’atténue lentement à longue échéance, pour éviter un conflit éternel.

Une écoute empathique ou une réparation réussie réduit aussi le grief; une conversation banale ne l’efface pas. Un échange neutre n’accorde pas automatiquement tous les gains d’un bon échange. Les effets importants se limitent par session pour éviter qu’une longue proximité lave tout en quelques minutes.

L’affinité élevée facilite l’apaisement sans garantir le pardon; une nouvelle trahison peut peser davantage. Réduire la tension par distance ne restaure pas la confiance. Journal et fiche expliquent la cause persistante et le dernier rapprochement.

Valider trois scénarios identiques sauf relation initiale : amis après accrochage, inconnus après accrochage, rivalité après répétition de conflits. Comparer sans contact, avec conversations banales et avec réparation. Puis simuler des quartiers mixtes : on cherche une diversité durable, pas une population entière en chicane.

### 7.2 Rencontres de trajet

Détecter les croisements dans les déplacements simulés, y compris deux segments qui se croisent entre deux pas. Le rendu et la caméra ne décident jamais d’une rencontre.

Une occasion par épisode de proximité, délai par paire (hypothèse initiale : deux heures), budget d’interruptions par personnage. La probabilité augmente avec l’intensité positive ou négative du lien, mais l’issue dépend de l’émotion, de la personnalité et du contexte. Un ami peut saluer sans interrompre son trajet; un rival peut éviter l’autre.

Pas d’arrêt social si épuisement, engagement imminent ou indisponibilité. Échange bref, séparation réelle requise avant une nouvelle occasion. Effets BD : sourire, bulle, fumée, signes « #!$? », mouvement de recul; une entrée de journal par interaction, pas par minute.

### 7.3 Être ensemble temporairement

Commencer par des duos : proposition, acceptation, destination commune, activité partagée, séparation. Une session possède participants, intention, durée limite et motif de fin. Les déplacements peuvent attendre brièvement le partenaire, sans téléportation.

Les besoins critiques, un engagement, un refus ou une dispute permettent de partir. Les partenaires proposent une activité compatible; ils ne perdent pas leurs priorités individuelles. Une pause ensemble nourrit le lien; les romances utilisent l’attirance et le consentement déjà présents, sans tomber automatiquement amoureux.

Contour commun discret, lien léger et libellé partagé dans le quartier. Compter une activité collective une seule fois tout en incrémentant les compteurs individuels appropriés. Garder la structure extensible à plusieurs participants, sans développer les sorties de dix personnes dès ce lot.

## 8. Documentation vivante et patch notes

### 8.1 GDD organisés par boucle

Le README garde le lien Jouer en premier, le démarrage rapide et les liens développeurs. La documentation décrit séparément **implémenté**, **proposé** et **historique**.

| Ensemble de pages | Contenu |
|---|---|
| `guide/` | Premiers pas, interface, commandes, glossaire, lecture d’un show. |
| `gdd/quartier/` | Personnages, besoins, émotions, actions et Rapin. |
| `gdd/relations/` | Liens orientés, tension, souvenirs, rencontres, sessions ensemble. |
| `gdd/musique/` | Compétences, composition, répertoire, groupes, progression et déchéance. |
| `gdd/shows/` | Calendrier, engagements, setlists, cartes, public, résolution et récompenses. |
| `gdd/temps.md` | Unités, horloges, pauses, accélération, âge, paramètres. |
| `technique/` | Architecture, sauvegardes, migrations, déterminisme, tests, contribution. |
| `versions/` | Patch notes datées et stables; plans conservés comme propositions historiques. |

Chaque système expose : intention joueur, entrées, règles, sorties, exemple concret, paramètres avec unités, systèmes liés, invariants et critères de test. Une règle partagée a une seule page de référence. Générer les tableaux de constantes depuis les données de design quand c’est simple; ne pas construire un éditeur générique.

### 8.2 VitePress et recherche intégrée

Construire la doc dans le même pipeline GitHub Pages que le jeu, sous `/garage-vivant/docs/`. Verrouiller une version stable de VitePress compatible avec Node de la CI; ne pas adopter automatiquement une version alpha. La recherche locale officielle de VitePress convient au site documentaire.

Pour **Ctrl+Espace dans le jeu**, générer un petit index public à partir des mêmes Markdown : titre, alias français, extrait, version, URL et ancre. Le jeu charge cet index à la demande. Ne pas dépendre des fichiers internes hachés de l’index VitePress. Une petite recherche autonome peut partager le même moteur sans embarquer toute l’application documentaire.

Résultats liés à la section exacte, ouverture de la doc dans un onglet; bouton Recherche utilisable sur tactile et si le raccourci est réservé par le système. Échap ferme, focus restauré. Pause de lecture explicite et respect d’une pause déjà active. Prévoir index indisponible, accents, synonymes « band/groupe », « sac/Rapin », liens profonds et décalage de version après cache.

Sources techniques officielles vérifiées : [recherche locale](https://vitepress.dev/reference/default-theme-search), [déploiement et base URL](https://vitepress.dev/guide/deploy). Le partage d’un index dédié au jeu est une proposition d’architecture, pas une API native promise par VitePress.

### 8.3 Temps expliqué sans inventer du vieillissement

Documenter l’existant : à ×1, huit minutes simulées par seconde réelle, donc une journée en trois minutes hors pauses; à ×0,5 six minutes, à ×10 dix-huit secondes. Un show actuel dure trente-six secondes à ×1 sur sa propre horloge. L’âge est une donnée de personnage, pas encore un vieillissement simulé.

Documenter ensuite le contrat V6 : durée du calendrier, durée musicale réservée et durée de visionnement distinctes. Définir les paramètres et leurs unités; les changements de vitesse ne modifient ni âge ni durée d’activité simulée. Une règle de vieillissement constitue une décision future, pas une conséquence cachée du nombre de jours joués.

### 8.4 Notes de version dans leur propre onglet

Le numéro de version ouvre la page des changements; badge discret du nombre de notes non lues. Ancre initiale sur la **plus récente note non lue**, conformément à la demande; accès visible aux autres nouveautés et conservation de la position de lecture.

Identifiants de notes stables, état lu local au navigateur. Marquer une note lue lorsqu’elle a été effectivement affichée suffisamment, ou par action « marquer comme lue »; ouvrir la page ne marque pas tout. Synchroniser le badge entre onglets. Si aucune nouveauté : afficher la dernière note. Si le stockage est indisponible : page utilisable, sans boucle de notifications.

## 9. Ordre de réalisation et portes de validation

Chaque lot produit une PR décrite, ses migrations, ses tests et la doc du comportement réellement livré. Fusion et publication restent sous contrôle de Simon. Ne pas annoncer une V6 complète après le seul premier lot.

| Lot | Travail | Dépendances | Condition pour continuer |
|---|---|---|---|
| 0 — Référence fiable | Reproduire fin instantanée, blocages et scroll; fixtures V5.1; contrat horloges; premiers GDD temps/show. | Audit actuel. | Reproductions enregistrées; sauvegardes représentatives conservées. |
| 1 — Un show compréhensible | Pause du quartier, ouverture automatique en direct, skip, inspection, cartes/effets, mini-cubes, bilan attribué. Une chanson. | Lot 0. | Un testeur comprend trois cartes et termine/sort du show sans assistance. |
| 2 — Calendrier et préparation | Identifiants permanents, quatre dates roulantes, créneaux, réservation autonome des petites scènes, candidatures/sélection des grosses, engagement unique, moral et modifications/annulations. | Contrat horloges lot 1. | 100 jours sans fin de calendrier; sélection à T−2; refus/absence résolus; aucun engagement multiple par band. |
| 3 — Soirées musicales | Setlists, morceaux multiples, passage entre bands, public et bilans cumulés, historique groupe. | Lots 1–2. | Soirée de trois bands avec musicien partagé compatible; sauter/revoir/recharger donne les mêmes effets. |
| 4 — Interface stable | Liste de groupes, fiches modulaires, souvenirs datés, refonte des zones de scroll. | Identifiants et historique stabilisés. | Manipulation cinq minutes à ×10 sans perte de scroll/focus; mobile et clavier utilisables. |
| 5 — Choix autonomes | Fusion récupération, migrations, sac personnalisé et probabilités expliquées. | Modèle actions et contrôles stables. | Distribution cohérente en contexte figé; sécurité vitale; anciennes priorités conservées explicitement. |
| 6 — Vie relationnelle | Tensions/griefs, rencontres de trajet, duos ensemble, effets visuels. | Récupération unifiée; tests longs existants. | Conflits persistants mais réparables; pas de boucle de collisions; engagements prioritaires. |
| 7 — Accès et finition | VitePress publié, recherche intégrée, patch notes lues/non lues, réglages et test global. | GDD écrits au fil des lots. | Liens et recherche corrects sur Pages; bilan complet d’une partie neuve et migrée. |

Le squelette documentaire commence au lot 0; les documents accompagnent chaque lot. L’intégration finale n’est pas une rédaction tardive de toutes les règles. Les correctifs de scroll reproductibles passent dès le premier lot qui touche leur panneau; ils n’attendent pas toute la refonte du lot 4.

## 10. Migrations et architecture : protéger ce qui fonctionne

- Séparer format de sauvegarde, version du jeu et version des préférences UI. Migration sur copie validée; conserver export et sauvegarde avant conversion.
- Convertir les anciennes saisons en événements à identifiants uniques, en utilisant contexte temporel et réservations. Préserver les références historiques; ne pas attribuer arbitrairement un ancien bilan à la nouvelle occurrence de `o1`.
- Convertir chaque réservation mono-chanson en créneau avec setlist d’un morceau. Préserver les participants confirmés; afficher toute incompatibilité nouvelle au lieu d’annuler silencieusement.
- Une prestation V5.1 en cours conserve son ancien résolveur jusqu’au bilan ou reçoit une conversion prouvée équivalente. Un replay ancien utilise sa version de règles; si reconstruction impossible, conserver son bilan et expliquer l’indisponibilité du replay.
- Ajouter les candidatures (état, événement, créneau souhaité, formation, date, résultat), décisions de sélection et modificateurs de moral avec identifiants permanents. Migration : moral neutre, aucune déception inventée. Si une ancienne sauvegarde possède plusieurs engagements futurs par band, les conserver comme exceptions héritées et bloquer toute nouvelle inscription jusqu’à leur résolution; ne pas supprimer de réservation silencieusement.
- Une conséquence s’applique par identifiant permanent de prestation, une seule fois. Rechargement, double clic, skip, avance du calendrier et retour d’onglet ne peuvent pas la doubler.
- Les nouvelles préférences Rapin sont facultatives : migration en profil automatique. Pas de baisse rétroactive des compétences, disparition de chansons ou modification arbitraire des relations.
- Extraire les responsabilités progressivement : calendrier, préparation, résolution, présentation et historique. Pas de réécriture globale du moteur ni de framework UI imposé pour cette mise à jour.
- Garder commandes sérialisables, identifiants, hasard contrôlé et rendu séparé : cela facilite une évolution future. Le multijoueur, serveur et synchronisation réseau restent hors de cette livraison.

## 11. Vérification : moteur, parcours et compréhension

### Tests automatisés ciblés

1. Même entrée/graines : mêmes résultats en lecture normale, ×4, skip, pause/reprise et import au milieu; replay sans récompense.
2. Quatre dates futures uniques après chaque transition et saut temporel; gros événement tous les quatre; aucune dépendance à « Nouvelle saison ».
3. Engagement futur unique par band, candidature comprise; disponibilités de musiciens partagés; réservations simultanées atomiques; sélection pondérée reproductible à T−2, sans doublon ni nouvelle pige au chargement; retrait/refus libèrent la place. Une incompatibilité entre membres n’est pas traitée comme un refus de l’organisateur.
4. Setlist valide en durée; une personne éclatée ne devient pas plusieurs fans; pas de multiplication des gains entre chansons.
5. Fiches, modules, curseurs et sélections stables pendant mises à jour; fenêtres contextuelles contenues à l’écran; contrastes des boutons testés.
6. Migration V5.1 : ancien show terminé/en cours, réservation, catalogue volumineux, band archivé, compteurs des deux actions, mémoire sans date.
7. Rapin : total de base 100 %, normalisation des actions admissibles, impossibilité expliquée, sécurité vitale, réglages effectifs seulement à la prochaine décision.
8. Relations : refroidissement comparé, réparation, asymétrie; une rencontre par épisode de proximité; aucun rendez-vous manqué par boucle de bavardage.
9. Documentation : build, liens/ancres, recherche française, nouvelle version et stockage des notes, conservation du lien Jouer.
10. Déclenchement du direct depuis tout panneau : ouverture au début, quartier totalement gelé, reprise sans rattrapage; formulaires conservés, onglet navigateur masqué suspendu; créneaux terminés jamais rejoués à leur heure nominale.
11. Refus sans perte de réputation; moral temporaire expirant, cumul plafonné, échec public proportionné aux attentes; aucune multiplication de pénalité après import, replay ou double clic. Bands autonomes capables de renoncer à une occasion et de revenir après déception.

### Séance de jeu indispensable

Faire tester sans expliquer la solution : choisir un band, réserver une première partie, changer un morceau, annuler puis réserver, regarder une carte, inspecter un fan, sauter le reste, retrouver le bilan et comprendre le prochain objectif. Demander « qui a joué? pourquoi le public a réagi? qu’est-ce que ce band a gagné? ».

Tester ensuite une soirée longue, dix musiciens, lecture accélérée, retour entre panneaux, changement d’onglet navigateur, scroll dans une fiche et consultation de la doc. Les tests techniques qui passent ne remplacent pas cette vérification de compréhension.

### Équilibrage et limites

Comparer plusieurs graines sur 30 puis 100 jours : répartition des tensions, relations positives/négatives, durée des conflits, shows programmés/joués/manqués, taux de candidature et d’abstention, diversité des bands sélectionnés, durée des creux de moral, raisons des absences, récupération et progression. Examiner les cas extrêmes; ne pas imposer un taux artificiel de conflits pour remplir une jauge.

Mesurer fluidité et durée de présentation avec 24 personnages et la plus grosse foule retenue. Plafonner particules et messages, jamais supprimer un résultat de simulation pour gagner des images/seconde. Budgéter stockage des historiques et replays : bilans compacts durables, traces lourdes récentes bornées et exportables, indisponibilité ancienne expliquée.

## 12. Critère final de réussite

Une partie neuve ou importée permet de vivre plusieurs cycles sans arrêt, préparer et annuler clairement une prestation, voir plusieurs bands jouer plusieurs morceaux, comprendre leurs cartes et leurs conséquences, puis retrouver ces événements dans leurs fiches. Les relations gardent une histoire perceptible; les choix Rapin sont réglables et compréhensibles; l’interface reste stable pendant la simulation. La documentation explique exactement la version jouable.

**Premier jalon décisif : un quartet, une chanson, un public, trois effets compris et un bouton Sauter fiable.** C’est sur cette expérience validée que le reste de la V6 doit grandir.
