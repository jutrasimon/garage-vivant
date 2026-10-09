# Garage vivant — Plan V5

Statut : implémenté en V0.5.0. Les seuils et choix du premier prototype sont documentés dans le README; les interactions passent par les vérifications Chromium de la CI avant publication. Base : V0.4.0, source Sites `e57388010c37dda631668b9533af29537e404a29`.

## Préalable : GitHub et stabilité des interactions

Conserver la V4 jouable et ses tests dans `jutrasimon/garage-vivant` avant de lancer le développement. Importer les sauvegardes existantes sans réinitialiser les personnages, chansons, relations ou groupes. Chaque étape doit rester jouable, documentée et vérifiable séparément.

### P0 — Audit transversal des glitches de scroll

Cette priorité couvre toute l’interface, pas seulement le retour en haut de la fiche. Le développement des nouveaux écrans doit utiliser la même solution stable.

**Surfaces à reproduire et corriger**

- Fiche latérale : retours en haut, sauts lors d’un changement d’action, ouverture/fermeture de détails, arrivée d’une chanson ou d’un projet, curseurs déplacés sous le pointeur.
- Liste des personnages : sélection d’un voisin en bas de liste, ajout/retrait, changement de nom ou d’activité, conservation de la position de lecture.
- Journal et catalogues : insertion d’entrées, filtrage, ouverture des causes, mises à jour pendant la lecture, défilements imbriqués.
- Relations et priorités : défilement horizontal, sélection d’une paire, modification d’un contrôle sans déplacement automatique ni perte de focus.
- Navigation : position propre à chaque vue ; retour au quartier sans déplacement ni rattrapage de la simulation.
- Mobile et petites fenêtres : gestes tactiles, défilement du panneau plutôt que du fond, clavier virtuel, en-tête fixe, changement d’orientation, fermeture des fenêtres et restauration du focus.

**Approche de correction**

1. Reproduire et noter le déclencheur exact de chaque glitch avant de le corriger.
2. Garder une structure stable pour les zones interactives. Actualiser les valeurs sans reconstruire toute la fiche à chaque rafraîchissement.
3. Préserver le focus, la sélection, les détails ouverts et les positions par vue/personnage. Une reconstruction ponctuelle ne doit pas raccourcir temporairement le contenu et borner le scroll à zéro.
4. Conserver un élément visible comme ancre lorsqu’une liste change au-dessus de la lecture. Afficher un indicateur de nouveaux événements au lieu de ramener automatiquement en haut.
5. Réserver des dimensions stables aux informations qui changent. Aucun bouton ou curseur ne doit se déplacer pendant son utilisation.
6. Définir un conteneur de défilement principal par panneau ; éviter les doubles barres inutiles et les débordements du fond derrière une fenêtre.
7. Restaurer les positions après navigation uniquement quand le contexte le demande. Aucune utilisation systématique de `scrollIntoView` lors des rafraîchissements.

**Critères de validation bloquants**

- Lecture et modification possibles sans pause à ×0,5, ×1 et ×10.
- Tester haut/milieu/bas des panneaux, détails ouverts/fermés, changements d’activité, insertion d’événements et changement de personnage.
- Aucun retour intempestif en haut, saut de contenu ou focus perdu ; les valeurs continuent de se mettre à jour.
- La navigation conserve les positions attendues ; les filtres gardent un comportement prévisible.
- Valider les interactions réelles en navigateur sur ordinateur et petit écran tactile. Les tests de fonctions de rendu seuls ne prouvent pas que le scroll fonctionne.
- Conserver les tests du temps, des onglets cachés, des sauvegardes et de l’autonomie.

## 1. Direction de jeu et rôle du joueur

Fantasy : vivre dans le quartier, construire son band, préparer un show et voir les choix prendre vie sur scène.

Recommandation à prototyper : incarner un musicien organisateur. Contrôler ses actions, engagements, compositions et cartes ; proposer aux autres musiciens, qui restent autonomes et peuvent refuser ou être indisponibles. Les appartenances multiples restent autorisées. Le personnage joueur et les NPC utilisent les mêmes règles.

Décisions centrales : choisir une occasion et une formation ; préparer une chanson prometteuse ou une chanson déjà maîtrisée ; arbitrer talent/fiabilité ; répartir les engagements ; choisir répétition, repos ou excès avant le show.

Première partie complète : une saison locale, trois occasions de jouer et une finale. Durée indicative à tester : 20–30 minutes, avec pause. La carrière mondiale et le contrôle de plusieurs avatars restent des pistes ultérieures.

## 2. Boucle systémique

Quartier → préparation → show → conséquences → quartier.

Les relations rendent les collaborations possibles. Les répétitions préparent les synergies et le répertoire. Le show éprouve ces choix. Ses résultats produisent reconnaissance, fatigue, attentes, souvenirs et nouvelles occasions. Chaque système doit créer une décision ou une conséquence compréhensible.

## 3. Shows automatiques et cartes

- Chaque musicien possède 8 à 10 cartes actives ; il en pige 5 sans remise au début du show.
- Résolution initiale en cinq phrases musicales : chaque membre joue une carte par phrase.
- Formation, chanson, cartes équipées et intention sont préparées avant le show. Aucune intervention obligatoire pendant la résolution.
- Cible indicative : 30–45 secondes de spectacle, avec pause, ralenti, accélération et bilan.
- Mise en scène : carte qui claque → anticipation du musicien → geste/onde → impact → réaction du public. Sons et animations rendent la causalité lisible.
- Les actions secondaires peuvent se chevaucher, tandis que les gros déclenchements ont leur moment de vedette. Maintenir la lisibilité avec un grand band.

Vocabulaire partagé : rythme, intensité, émotion, portée et préparation. Exemples : la basse installe un groove ; le riff de guitare pousse une zone, élargie par le groove ; la batterie prépare un crescendo ; le chant bénéficie du caractère émotionnel d’une chanson ; le clavier installe une zone rythmique. Des cartes personnelles distinguent deux musiciens du même instrument et peuvent rattraper une erreur alliée.

L’ordre automatique et les fenêtres de combo doivent être explicables. Le hasard sélectionne les cartes ; la préparation du deck définit les possibilités. Comparer duo, quatuor et gros ensemble : diversité et coordination doivent compter, et empiler un effet déjà saturé ne doit pas rendre le recrutement de tous les voisins systématiquement optimal.

## 4. Foule physique et émotions

Premier public de 8 à 12 cubes. Chaque spectateur possède une jauge de conquête, une préférence de style, une sensibilité instrumentale, une émotion dominante et une réaction majeure. Style et instrument sont deux dimensions distinctes ; les goûts favorisent une approche sans rendre toutes les autres inutiles.

Trois réactions initiales :

- Euphorie : bond et éclatement en petits cubes ; impulsion d’enthousiasme vers les voisins.
- Émotion : tremblement/larmes puis vague qui augmente la réceptivité voisine.
- Transe : pulsation et zone qui amplifie les effets rythmiques suivants.

Les positions, déplacements et zones d’impact ont des conséquences de jeu. Les débris servent principalement le spectacle. Une réaction majeure par spectateur et par show borne les chaînes. Les cubes éclatés représentent des fans conquis et réapparaissent au bilan.

Physique de jeu reproductible, à pas fixe ; séparer calcul, effets décoratifs et vitesse de lecture pour qu’une accélération ne modifie pas le résultat.

## 5. Identité et présentation des cubes

Conserver la silhouette simple. Un ou deux signes stables : mèche, lunettes, casquette, moustache, sourcils ou petit accessoire. L’identité se lit aussi dans le mouvement : nerveux, posé, flamboyant ou timide. L’émotion change posture et expression sans effacer l’identité.

Anticipation, squash-and-stretch, recul, rebonds, traînées et courts ralentis accompagnent les gestes. Action et émotion restent simultanément lisibles. Prévoir un réglage d’effets réduits.

## 6. Déchéance

Une stat centrale avec causes explicites, signes avant-coureurs et récupération. Les excès, nuits sacrifiées et engagements malgré l’épuisement peuvent l’augmenter. Les traits influencent les comportements ; le succès crée des tentations sans dégradation automatique.

Des seuils introduisent des cartes maudites qui occupent les emplacements du deck : gueule de bois (énergie −8), trou de mémoire (préparation perdue), ego en roue libre (soutien détourné en solo), absence au mauvais moment (contribution manquée).

Ces cartes ne se retirent pas librement : repos, soutien et réduction des engagements agissent sur leurs causes. Afficher prochain seuil, cartes affectées et évolution récente. Éviter les récompenses qui feraient de la déchéance maximale la stratégie universelle ; conserver les personnages et leurs histoires plutôt qu’une exclusion automatique.

## 7. Développement et histoire des bands

Deux valeurs distinctes : développement = coordination actuelle, entretenue par les activités communes ; réputation = reconnaissance obtenue par les shows.

Stades indicatifs : embryonnaire → en place → rodé → affirmé. Déclin après une période de grâce, annoncé et explicable. À zéro, archivage du groupe ; biographies, membres, chansons et moments marquants conservés.

Les conflits entre bands viennent d’engagements concrets incompatibles, pas simplement d’appartenances multiples. La présence réelle des membres et le groupe concerné doivent être identifiés avant d’attribuer la progression d’une répétition.

Répertoire choisi parmi les compositions des membres, avec auteurs identifiés et maîtrise collective par chanson. Qualité d’écriture et qualité d’interprétation restent distinctes. Montrer chansons retenues, maîtrise et performances dans la fiche du groupe.

## 8. Composition, progression et socialisation

Acquis V4 à conserver : projets en plusieurs séances, interruption/reprise, origine émotionnelle persistante, titres variés, six résultats musicaux, bilans de sessions et découverte progressive de chimie.

- Mesurer nouvelles chansons/jour séparément du catalogue historique. Un total ancien élevé ne prouve pas une production actuelle excessive.
- Revoir génération ET apprentissage : majorité d’amateurs, quelques profils expérimentés, rares talents exceptionnels ; gains ralentis à haut niveau et progression par cartes/spécialisations.
- Ne pas réduire arbitrairement les compétences des anciennes sauvegardes pour les faire rentrer dans un nouvel équilibrage.
- Enrichir les titres avec lieux, souvenirs et histoire du groupe.
- Archivage automatique des chansons faibles via seuil réglable, visible et réversible ; jamais de suppression silencieuse. L’archive ne remplace pas l’équilibrage de la production.
- Socialiser nécessite un partenaire disponible sur place. Attendre seul peut restaurer la détente mais pas le besoin social. Une attente décevante crée une frustration proportionnelle aux besoins et attentes.
- Vérifier les valeurs actuelles des effets relationnels avant de reprendre les chiffres du transcript ; distinguer petits échanges, événements marquants et effets cumulés d’une session.

## 9. Interface

- Header fixe contenant directement navigation, temps, vitesse et version cliquable ; supprimer la deuxième barre de navigation.
- Fiche rapide stable : identité, action, émotion, énergie, déchéance et engagements.
- Vue détaillée en colonnes adaptées à l’écran ; compétences immédiatement au-dessus des compositions, cartes et relations accessibles. Éviter de tout miniaturiser pour forcer une seule vue mobile.
- Matrice : surbrillance de la ligne, de la colonne et des deux noms sélectionnés, avec sens de lecture explicite.
- Fiche de band : développement, réputation, disponibilités, répertoire et prochain engagement.
- Journal : cases cumulables par type, masquage du repos, conservation des filtres et indicateur de nouvelles entrées.
- Nouvelle partie plus visible, avec préservation/export du monde courant avant remplacement explicite.
- Patch notes accessibles par le numéro de version : changements courants, historique et compatibilité des sauvegardes.
- Tous ces écrans respectent les critères P0 de scroll, focus et stabilité.

## 10. Livraison progressive

| Étape | Contenu | Validation |
| --- | --- | --- |
| Préalable GitHub | Code V4, fixtures, tests, documentation et présent plan | Dépôt vérifié avant les modifications de gameplay |
| V4.1 — Utilisable | Audit/corrections de scroll, header, fiche, filtres, patch notes | Consultation et modification à vitesse active, validées en navigateur |
| V5-A — Le show | Decks, cinq cartes, foule physique, réactions et sons | Comprendre les combos et vouloir revoir le spectacle |
| V5-B — Les choix comptent | Musicien joueur, préparation, chanson et conséquences | Une préparation différente modifie réellement le résultat |
| V5-C — Vie des bands | Développement, répertoire, engagements concurrents, archives | Plusieurs trajectoires viables, sans band universel optimal |
| V5-D — Saison complète | Déchéance, progression, trois occasions et finale | Partie finie, décisions difficiles et histoire compréhensible |

Le modèle de carte réserve dès V5-A les statuts et cartes maudites nécessaires à la déchéance, sans attendre une refonte ultérieure. Les étapes servent à tester les hypothèses, pas à figer d’avance l’équilibrage final.

## 11. Architecture et garde-fous

Commandes joueur/NPC soumises aux mêmes règles ; état de simulation indépendant des vues ; identifiants stables, hasard contrôlé, résolution reproductible et animations séparées. Préparer ces bases pour un futur multi sans promettre qu’un mode multi sera un simple branchement.

Ne pas construire de nouveaux outils génériques ou éditeurs de systèmes pendant que le design évolue. Conserver le laboratoire actuel et les diagnostics nécessaires au jeu.

Non-régression : pause et vitesses, onglets internes/navigateur, migrations, déterminisme, comptes d’actions, jams à deux présents, départs, appartenances multiples, catalogue complet et absence de doubles effets. Tests de gameplay ciblés par étape et validation réelle des interactions UI.

Test de conception final : après un show, le joueur peut expliquer ce qui s’est passé et décider ce qu’il veut changer pour le prochain.

## Livraison V0.5.0

Le plan est livré en une version jouable : stabilisation des panneaux, header fixe, personnage joueur et propositions, répertoire et répétitions, shows à cartes et foule physique, développement/réputation des bands, déchéance, saison complète, archives réversibles et patch notes. La CI bloque Pages si le moteur ou les interactions Chromium échouent.

Le premier équilibrage utilise quatre occasions relatives aux jours 2/4/6/8, 36 secondes de show, des seuils de déchéance 25/50/70/85, 48 heures de grâce avant le déclin des bands, et un seuil de qualité d’archive de 25. Les paramètres restent des hypothèses de prototype. Le multi, la carrière mondiale et les outils génériques restent hors de cette livraison.

La validation tactile est réalisée dans un viewport Chromium mobile, pas sur du matériel iOS/Android réel. Les sauvegardes V4 conservent leurs compétences, projets, catalogue et connaissance des relations. Le replay réutilise le même seed et le même tirage, sans réappliquer les conséquences.
