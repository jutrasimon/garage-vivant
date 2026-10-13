# Notes de version

## V0.8.11 — Les pouvoirs de conquête prennent le devant de la scène {#v0811}

13 octobre 2026.

Lorsqu’une carte va déclencher le pouvoir du spectateur visé, sa prévision affiche maintenant un **grand encadré rose lumineux**, placé avant les règles ordinaires.

- Mention « VA SE DÉCLENCHER ! », icône et nom du pouvoir en gros, description et noms des voisins réellement touchés.
- Annonce visible des chaînes de conquêtes prévues par le moteur.
- Une brève animation souligne l’apparition de l’effet; elle ne recommence pas aux petits mouvements du curseur et respecte les effets réduits.
- Même annonce dans la prévision au curseur, au doigt et après sélection d’une carte. Sur mobile, le popup utilise au besoin l’espace du haut pour laisser le spectateur visible.
- Sans déclenchement prévu, la règle reste discrète. Viser et annuler conserve intégralement le show et ses ressources.

## V0.8.10 — Les instruments retrouvent leur place sur scène {#v0810}

13 octobre 2026.

- Plus de place pour les musiciens sur scène : les cartes sont abaissées et les personnages légèrement remontés, pour laisser leurs instruments visibles.
- La hauteur de la scène et la compensation des mains sont ajustées ensemble : cartes au même ratio, textes lisibles et public entier à l’écran.
- Vérification des huit instruments, des mains de cinq cartes, des anciennes grilles à trois rangées et du format 1280 × 720.
- Les parties et les réglages manuels de disposition sont conservés.

## V0.8.9 — Tempo doré au curseur et ciblage vibrant {#v089}

13 octobre 2026.

L’**arc de tempo suit maintenant le curseur**, à l’endroit où tu vises, plutôt que de rejoindre la jauge. Il est **jaune doré**; le vert reste associé aux actions et à l’énergie, le rose à la conquête.

- La pointe suit les petits mouvements sur une même cible, à la souris comme au doigt. Les cartes mixtes gardent un arc rose vers le spectateur et un arc jaune vers le point visé.
- Le grand rectangle de ciblage collectif est remplacé par une **lueur et des ondes lumineuses autour du public**. Les cibles individuelles ont un halo, avec leurs personnages et leurs barres toujours lisibles.
- Le tooltip de tempo, les indications de gain ou de dépense et l’éclairage de la salle utilisent la même teinte dorée. L’énergie conserve son vert menthe.
- Le suivi réutilise l’arc et la prévision déjà calculés. Déplacer le curseur ne relance pas la simulation du show.
- Les pulsations restent limitées à la visée et s’arrêtent en mode effets réduits. Annuler la visée ne dépense aucune ressource.

Les règles, les coûts et les sauvegardes sont inchangés. Recharge le jeu local avec **Ctrl+F5** pour afficher **v0.8.9**.

## V0.8.8 — Aucun popup de niveau pendant le show {#v088}

13 octobre 2026.

La grande notification **Niveau supérieur !** ne s’ouvre plus pendant la vue du show, **y compris au bilan et entre deux groupes**. Elle attend la fin de la soirée et le retour dans le quartier.

- Une prestation marquée « terminée » ne suffit plus à débloquer le popup si la soirée est encore ouverte.
- Le blocage reste actif après rechargement et si tu consultes le quartier avant la fin de la soirée. Il couvre aussi les répétitions et leur écran de résultat.
- L’XP et les améliorations gagnées sont conservées. Masquer le popup pendant le show ne consomme ni ne reporte définitivement les récompenses; elles sont annoncées ensuite.
- L’ouverture manuelle d’une amélioration reste bloquée pendant une prestation active.

Le problème venait d’un contrôle limité au statut de la prestation, sans vérifier la soirée ni la vue encore affichée. Les gains d’XP, les niveaux, les decks et les sauvegardes restent inchangés. Recharge le jeu local avec **Ctrl+F5** pour afficher **v0.8.8**.

## V0.8.7 — Arc vert de tempo et prévision près du curseur {#v087}

13 octobre 2026.

La visée montre maintenant un **arc vert vers la jauge de tempo** pour les cartes qui en donnent. L’arc rose reste destiné à la conquête des spectateurs. Une carte qui combine puissance et tempo affiche les deux.

- Les cartes de tempo et de soutien comme Pulsation ou Roulement ont un arc même lorsqu’elles ne touchent directement aucun spectateur.
- L’arc de tempo peut rejoindre la jauge en bas à gauche, en dehors de la scène. Les cibles invalides ont la couleur d’avertissement prévue.
- La prévision des effets revient **près du curseur**, décalée pour laisser visible le personnage visé et rester dans l’écran. Elle suit les mouvements sans attendre un changement de cible.
- Le contenu de la prévision reste en cache tant que carte, cible et état du show sont identiques; déplacer la boîte ne relance pas la simulation.
- La scène n’a plus de marge réservée pour l’ancien panneau fixe de visée. Les détails d’une carte au simple survol et l’inspection au clavier restent accessibles sur le côté.

Le panneau fixe de prévision avait été introduit en v0.8.3; l’absence d’arc sur les cartes de tempo venait d’une visée fondée seulement sur les spectateurs directement touchés. Les règles et les sauvegardes restent inchangées. Recharge le serveur local avec **Ctrl+F5** pour afficher **v0.8.7**.

## V0.8.6 — Énergie et tempo à gauche, avec du juice {#v086}

13 octobre 2026.

L’**énergie et le tempo sont maintenant regroupés en bas à gauche** du show, avec de gros chiffres, des segments lumineux et leurs propres couleurs : vert menthe pour l’énergie, doré pour le tempo. Le gros bouton **Fin du tour** reste en bas à droite.

- Chaque gain et dépense fait réagir la jauge, ses chiffres et les segments concernés. Un **+ / −** visible indique la variation réelle, y compris près du maximum de tempo.
- Le tempo plein brille davantage; les segments s’éteignent quand il est consommé. L’énergie se recharge visiblement au début du tour suivant.
- Le haut est allégé : énergie et tempo ne sont plus répétés dans l’en-tête.
- L’espace nécessaire est réservé sous le public. Les deux blocs restent séparés sur mobile; sur les écrans les plus étroits, les ressources passent au-dessus du bouton.
- Les animations sont brèves et se déclenchent seulement quand les valeurs changent. Les effets réduits conservent les chiffres et les indications de gain ou dépense sans mouvement.

Les règles, les coûts et les sauvegardes sont conservés. Recharge le jeu local avec **Ctrl+F5** pour afficher **v0.8.6**.

## V0.8.5 — La fiche garde sa position entre les musiciens {#v085}

13 octobre 2026.

Le panneau de droite **conserve sa position de défilement quand tu changes de musicien**. Tu peux comparer leurs fiches sans revenir en haut ni retrouver une ancienne position propre à chaque personnage.

- La position courante est gardée à la première ouverture d’un autre musicien comme lorsque tu reviens sur une fiche déjà consultée.
- Si la nouvelle fiche est plus courte, le défilement s’arrête naturellement en bas de cette fiche.
- Les mises à jour du quartier continuent de stabiliser les champs en cours de modification. Le comportement est aussi vérifié à la réouverture de la fiche sur mobile.

Aucun changement aux personnages, à l’XP ou aux sauvegardes. Recharge le jeu local avec **Ctrl+F5** pour afficher **v0.8.5**.

## V0.8.4 — Des niveaux visibles et une vraie célébration {#v084}

13 octobre 2026.

Le niveau des musiciens est désormais visible directement dans la liste du quartier, avec une petite barre d’XP. Une **grande notification de montée de niveau** affiche leur portrait, leur nom et leur nouveau niveau.

- La notification reste affichée jusqu’à ce que tu choisisses l’amélioration ou que tu la reportes. Elle ne disparaît pas comme un message temporaire.
- Le bouton **Choisir l’amélioration** ouvre directement le menu du musicien. Le quartier attend pendant ton choix.
- Les musiciens ayant une amélioration disponible sont mis en évidence dans la liste, avec un bouton d’accès direct. Fermer la notification conserve leurs choix.
- Plusieurs niveaux du même musicien sont regroupés. Quand plusieurs musiciens progressent, leurs notifications passent à la suite.
- Les notifications reportées restent fermées après un rechargement. Elles ne couvrent pas un show en cours; les niveaux gagnés au spectacle sont annoncés au bilan.
- Le niveau, l’XP et l’accès aux améliorations de la fiche se mettent maintenant à jour pendant la pratique, sans devoir rouvrir le personnage.

Présentation vérifiée sur ordinateur et mobile, avec une vraie montée de niveau en pratique et une montée de niveau en show. Les gains d’XP, les seuils et les récompenses restent inchangés. Recharge le jeu local avec **Ctrl+F5** pour afficher **v0.8.4**.

## V0.8.3 — La prévision sur le côté, la salle dégagée {#v083}

13 octobre 2026.

La boîte de prévision des cartes reste désormais **sur le côté droit de la salle**. Elle ne se place plus autour de la souris ou devant les spectateurs.

- La position reste fixe lorsque tu passes d’un spectateur à un autre, que la cible soit valide ou invalide.
- Un seul panneau apparaît pendant le glisser-déposer : l’aperçu de carte en double est masqué.
- Sur ordinateur, la salle utilise ses marges ou prévoit un espace latéral avant de commencer à viser. Le panneau ne recouvre pas les musiciens, les cartes ou le public dans les formats testés de 1024 à 1920 px.
- La boîte prend la hauteur réelle de son contenu. Les indications restent disponibles pour les effets qui ciblent tout le public.

Les règles, les sauvegardes et les calculs de prévision sont conservés. Recharge le jeu local avec **Ctrl+F5** pour afficher **v0.8.3**.

## V0.8.2 — Des cartes lisibles et mieux proportionnées {#v082}

13 octobre 2026.

Les cartes du show sont plus grandes et leur texte retrouve une place lisible : coût dans le coin, icône en haut, titre centré, règles agrandies et cible au bas de la carte. Le même format 5:7 est utilisé en main, en aperçu, dans les decks et dans les choix d’amélioration.

- La taille de base des cartes en main augmente de 32 %. Les mains par défaut s’adaptent aussi lorsque la salle est réduite pour faire entrer le public.
- Les descriptions longues sont conservées intégralement. Les couleurs du texte secondaire sont plus contrastées et l’ancienne petite bande d’illustration disparaît.
- Le placement des musiciens, des mains et des rangées réserve la place des cartes et des barres de conquête. Les anciens spectacles à trois rangées gardent leurs voisins et leurs règles.
- Les vérifications de composition contrôlent désormais la taille réelle du texte, les titres et descriptions des cartes de départ et améliorées, ainsi que les barres du public, notamment en 1280 × 720.

Les sauvegardes et les règles de jeu sont conservées. Sur le serveur local, recharge le jeu avec **Ctrl+F5** pour afficher la version **0.8.2**.

## V0.8.1 — BandLive plus fluide {#v081}

13 octobre 2026.

- BandLive plus fluide : les positions des personnages sont mesurées au changement de mise en page, puis animées directement dans la scène sans recalculer le document à chaque image.
- La preview de carte est réutilisée tant que la carte, la cible et l’état du show restent identiques. Elle est recalculée immédiatement au changement de cible; les règles et les résultats sont conservés.
- La danse décorative utilise au plus 30 images par seconde. Les commandes et les effets gardent leur propre cadence. La résolution du rendu suit la taille réellement affichée; la scène cesse de dessiner quand elle est masquée, hors écran ou en mode mouvements réduits.
- Les panneaux du quartier et l’ancienne scène ne sont plus recalculés pendant BandLive.
- Nouveau numéro et nouvelles adresses de fichiers pour charger ensemble les corrections de fluidité et la composition récente : scène centrée, bouton de fin de tour en bas à droite et programmation sous le premier écran.
- Sauvegardes, niveaux, decks, récompenses et spectacles en cours conservés. Recharger la page pour prendre cette version en compte.

## V0.8.0 — BandLive, conquêtes et progression individuelle {#v080}

12 octobre 2026.

- BandLive devient le moteur de tous les nouveaux shows et essais : jams, longues réservations et formations jusqu’à 24 musiciens sont acceptées. Les anciens shows gardent leurs snapshots.
- Scène centrée et adaptée à la hauteur, choix des tounes en overlay avec aperçu du public, cartes communes au ratio 5:7, fiches et portraits réutilisés, gros bouton de fin de tour avec énergie en bas à droite.
- Composition rapprochée de la maquette : largeur de scène maîtrisée, bandeau resserré et programmation sous le premier écran. Les nouveaux shows affichent jusqu’à six colonnes sur deux rangées; les shows commencés conservent leur grille.
- Les personnages dansent sans déplacer leur zone de survol. La preview d’effet reste ancrée tant que la cible reste la même; elle se replace lors d’un changement de cible, d’un scroll ou de la taille de fenêtre.
- Trois pouvoirs de conquête paramétrés : Onde de choc, Projecteur et Chœur du public. Réactions immédiates, consommées jusqu’au tour suivant; preview des conditions et des chaînes. Rétroaction sur les conquêtes, réactions, pouvoirs, tempo, soutiens et finale.
- Musiciens et ordre variés par graine, nouvelle graine proposée par défaut, deux chansons pour un band initial ou trois à quatre réparties entre plusieurs bands.
- Pratique solo et collective : 1 XP par 15 minutes jouées. Pratique collective : +1 coordination par cycle de 15 minutes à deux ou plus. L’XP des shows est attribuée aux participants; formation, chanson terminée, premier show et public entièrement conquis donnent aussi de l’XP.
- Niveaux plus rapides au départ (80, 180, 360, 650, 1 100 XP cumulés). Chaque niveau donne un échange de carte persistant, accessible avec « Améliorer le deck » dans la fiche, le groupe ou au bilan. Un niveau gagné en pratique se choisit immédiatement depuis le perso; le bilan propose seulement les niveaux gagnés dans ce show. Le choix affiche les cartes avant/après; le quartier attend pendant ce choix. Ce système remplace l’échange automatique de fin de show; les anciennes récompenses restent disponibles.
- Le lancement local utilise `npm start`, avec les bons types JavaScript sous Windows. Les notes de version restent accessibles pendant BandLive.
- Un HTML autonome permet les essais entre amis avec des sauvegardes séparées. Le rythme de progression et l’équilibrage des nouveaux pouvoirs restent à éprouver pendant ces essais. Aucun bonus de compétence supplémentaire n’est accordé automatiquement par le niveau.

## V0.7.21 — Réglages après un spectacle terminé {#v0721}

12 octobre 2026.

Les réglages peuvent à nouveau être appliqués après le retour au quartier : une prestation terminée conservée pour consultation ne bloque plus les changements. Les spectacles et soirées encore en cours restent protégés. Les sauvegardes existantes sont conservées.

## V0.7.20 — BandLive : tempo, réactions persistantes et simulation {#v0720}

12 octobre 2026.

- Les 16 cartes acquises évoluent autour du tempo ; les decks initiaux restent identiques. Improvisation du sax coûte 2 énergie.
- Six réactions du public persistent jusqu’à leur effet, puis sont remplacées par un autre statut aléatoire : S’ennuie, Attentif, Distrait, Attend du rythme, Veut de la variété et Se laisse entraîner. Les bonus de conquête sont conservés.
- Fin du tour, Son et Voir les cartes passent en haut près du groupe et restent visibles. Deux emplacements indiquent la durée et la progression de chaque chanson.
- Simuler le show joue automatiquement les cartes et les passages restants, puis affiche le bilan et l’échange habituel, sans garantir la victoire.
- Pour plus de six chansons actives, les six propositions les plus longues sont retenues, départagées par compatibilité avec le public.
- La scène Minuit, la visée, les cartes en éventail et les réglages de disposition de la version 0.7.19 sont conservés.
- Le fichier autonome démarre dans le quartier normal. BandLive reste facultatif et activable dans Réglages. Les anciens spectacles en cours conservent leurs anciennes réactions jusqu’à leur fin.

## V0.7.19 — BandLive · scène Minuit et visée {#v0719}

12 octobre 2026.

- BandLive adopte la scène Minuit : sol, speakers, spots au plafond, instruments et personnages animés, avec les couleurs et accessoires du jeu.
- Les vraies cartes de chaque musicien apparaissent en éventail. Le drag garde un aperçu à droite, montre son résultat exact près du curseur et trace un arc depuis le musicien. Les projectiles passent au-dessus des cartes.
- Disposition permet de déplacer musiciens et mains séparément et de régler taille et éventail. Les spectateurs restent dans leurs places logiques pour préserver les rangées et voisins ; les mains ne poussent rien.
- Règles de cartes, conquêtes, decks, chansons, soirées, bilan et récompenses conservés. Le tactile, le clavier, le son et les effets réduits restent disponibles.
- Activation : Réglages → Activer BandLive. Le module reste facultatif. Les positions sont des préférences locales ; elles ne changent ni les cartes ni les règles.

## V0.7.18 — BandLive : premières parties et soirée complète {#v0718}

12 octobre 2026.

Les premières parties et la tête d’affiche s’enchaînent maintenant dans BandLive. La programmation affiche les groupes, leur rôle et leur progression dans la soirée. Après une prestation, le groupe compatible suivant ouvre directement son propre choix de chansons, avec ses musiciens et ses decks.

L’accueil transmis reste celui du jeu : chaque spectateur conserve 20 % de l’accueil obtenu avec le groupe précédent, dans la limite de 30 %. Les barres commencent partiellement remplies et l’accueil initial est indiqué dans la programmation. Les replays des nouvelles prestations retrouvent ce même accueil de départ.

Chaque groupe conserve ses deux passages et son bilan individuel. Un échange de carte facultatif est proposé après chaque prestation BandLive terminée. Les interruptions ne donnent pas d’échange. Les jams, les setlists de plus de deux morceaux et les formations de plus de six musiciens restent en spectacle classique, avec une explication. Désactiver BandLive laisse la prestation en cours se terminer, puis revient au mode classique.

Cette livraison comprend aussi les essais 0.7.16 et 0.7.17 : decks mémorisés par musicien et instrument, deux nouvelles spéciales par instrument, échange après spectacle, barres de conquête qui se remplissent, public agrandi et choix des chansons dans tout le répertoire actif. Les cinq effets de conquête de zone restent disponibles.

Activation : **Réglages → Activer BandLive**, réserver un créneau de première partie ou de tête d’affiche dans **Shows**, puis **Jouer avec BandLive** à l’arrivée sur scène. Le module reste facultatif et désactivé par défaut. Les sauvegardes et les spectacles classiques sont conservés.

## V0.7.17 — BandLive : public agrandi et choix des chansons (test local) {#v0717}

12 octobre 2026.

Build local de test, sans publication GitHub.

- Zone du public agrandie sur ordinateur et téléphone pour voir davantage de spectateurs simultanément. Les positions et les quatre colonnes restent stables ; le défilement reste disponible.
- Au début d’un spectacle BandLive, choix parmi toutes les chansons actives du groupe. Au deuxième passage, choix parmi les chansons restantes ; un répertoire d’une seule chanson permet sa reprise.
- Une réservation n’impose plus la chanson du spectacle interactif. L’historique conserve les compositions réellement jouées et les replays leur répertoire d’origine.
- Les spectacles en cours des builds précédents bénéficient du choix du répertoire à la reprise, sans réinitialiser leur progression ni leurs decks. Les spectacles terminés restent inchangés.
- Le fichier de test prépare un groupe disposant de plusieurs chansons pour vérifier immédiatement le sélecteur. Les decks par instrument, l’échange après spectacle et les cinq effets de conquête sont conservés.

## V0.7.16 — BandLive : decks par instrument (test local) {#v0716}

12 octobre 2026.

Build local de test, sans publication GitHub : progression des decks BandLive.

- Chaque musicien commence avec les cinq cartes habituelles : trois Note et deux spéciales de son instrument.
- Après un spectacle BandLive terminé, gagné ou perdu, choisis un participant et remplace une de ses cinq cartes par une des trois spéciales de son instrument. Un seul échange facultatif par spectacle.
- Seize nouvelles cartes : deux par instrument, avec alternance entre musiciens, cibles de zone, pioche, défausse, préparation et tempo. Les cartes actuelles restent disponibles.
- Chaque instrument conserve son propre deck pour chaque musicien. Revenir à un ancien instrument restitue les cartes acquises. Les decks se consultent dans la fiche du musicien, sous DECKS BANDLIVE.
- Les barres du public se remplissent vers la conquête. Les prévisualisations affichent le gain et la conquête finale.
- Sauvegarde, export/import et replays conservent leurs decks. Les répétitions, replays et spectacles interrompus n’accordent pas d’échange. Les spectacles classiques gardent leurs règles.

Pour tester : activer BandLive dans Réglages puis lancer un nouveau spectacle ; le fichier de test autonome en prépare déjà un. Cette version sert à valider les règles et l’interface ; les nouvelles cartes n’ont pas encore fait l’objet d’une campagne d’équilibrage.

## V0.7.15 — BandLive : bonus de conquête dans le public {#v0715}

12 octobre 2026.

BandLive : cinq bonus de conquête, un par spectateur, visibles sous leur barre. Activer le module dans **Réglages → Activer BandLive**, puis lancer un nouveau show ou une nouvelle répétition.

- **Onde de choc** : 3 puissance aux voisins immédiats, sans diagonales.
- **Vague d’enthousiasme** : 2 puissance aux autres spectateurs de la rangée.
- **Percée dans la foule** : 4 puissance derrière, avec continuation si la cible est conquise.
- **Sous les projecteurs** : +2 puissance par carte sur les voisins pendant le tour, non cumulable.
- **Chœur du public** : les autres spectateurs de la rangée adoptent le style de la chanson jusqu’à sa fin.

Le public garde ses rangées et colonnes sur tous les écrans. Les zones sont surlignées au survol ou au focus ; les bonus actifs sont affichés. La prévisualisation calcule aussi les réactions en chaîne. Les effets se déclenchent une seule fois, après la carte ou la finale ; conquérir tout le public gagne immédiatement.

Les anciens shows et leurs replays conservent leurs règles. Les nouveaux effets, leur progression et les bonus temporaires sont conservés au rechargement et dans l’export du quartier. Le spectacle classique garde ses règles.

## V0.7.14 — Des mini-personnages bien droits {#v0714}

12 octobre 2026.

- Les personnages gardent leur grosse tête et adoptent une silhouette droite : torse rectangulaire, bras verticaux le long du corps et jambes parallèles séparées. Le même dessin est utilisé dans les portraits, sur la carte et dans les deux modes de spectacle. Aucun changement de mécanique ni de sauvegarde.

## V0.7.13 — Qualité des chansons, formules et mini-personnages {#v0713}

12 octobre 2026.

- BandLive utilise toute la largeur, une scène éclairée et une foule entièrement visible sur grand écran. Les cartes restent dans la main de leur musicien, sous son personnage. Le preview affiche les dégâts et la résistance restante au-dessus de la carte déplacée.
- Les chansons affichent quatre catégories de qualité : **Bancale** (moins de 25), **Modeste** (25 à moins de 50), **Accrocheuse** (50 à moins de 80) et **Hit** (80 à 100). Le score reste visible dans le catalogue, les fiches et les répertoires. Ces catégories sont descriptives : aucun bonus BandLive pour le moment.
- Chaque paramètre de l’**Atelier d’équilibrage** propose une section dépliable avec sa formule, ses conditions, ses limites et, quand pertinent, un exemple chiffré. Les formules suivent les valeurs préparées ; le jeu change seulement après application.
- Les personnages ont de minuscules corps, bras et jambes, dans leurs portraits, sur la carte et sur les scènes classique et BandLive. Les accessoires et réactions visuelles sont conservés.
- Compatibilité : les anciennes chansons sont classées à partir de leur qualité enregistrée. Aucun changement de format de sauvegarde, de durée des chansons ou de mécanique de combat.

## V0.7.12 — BandLive lisible et pratique des musiciens {#v0712}

12 octobre 2026.

- Nouveau quartier à trois personnages, relations initiales partielles entre voisins et tailles de groupes plus variées.
- Les pratiques de band apparaissent dans les activités collectives. Elles entraînent les musiciens, sans donner de niveau au morceau ni de progression au groupe; les shows font progresser le groupe.
- Les nouvelles compositions reçoivent une durée fixe de 3, 4 ou 5 tours. Les affinités des coauteurs modulent leur qualité. La commande Recomposer ouvre un projet distinct; le morceau actuel reste jouable jusqu’à sa finalisation.
- BandLive présente une scène plus compacte, une main commune identifiée, un aperçu exact des dégâts et de la résistance restante, ainsi que le contenu de la pioche et de la défausse sans révéler l’ordre du tirage.
- Explosion, transe et émotion du public sont uniquement visuelles : aucun effet sur les voisins, les bonus ou les dégâts.
- Les conditions d’accès à BandLive sont explicites : 2 à 6 musiciens et 1 ou 2 compositions sans jam, avant le départ de la première chanson. Le rang du band dans la soirée ne bloque pas ce mode.
- Le sac montre les invitations en attente avant la prochaine pige. Les instruments apparaissent à gauche et les références de groupe regroupent nom, style et accès à la fiche.
- Les anciennes sauvegardes et les concerts déjà commencés conservent leurs données et leurs durées. Le quartier reste suspendu pendant un show; les shows parallèles ne sont pas activés.

## V0.7.11 — Atelier d’équilibrage par partie {#v0711}

12 octobre 2026.

- Un atelier d’équilibrage organisé par système dans Réglages : recherche, valeurs personnalisées, unités, références et limites.
- Préparation des modifications puis application atomique ; annulation et remise à zéro explicites.
- Paramètres liés à la partie, conservés avec sa sauvegarde. Export/import de profils d’équilibrage.
- Les groupes, relations, besoins et effets d’actions utilisent les valeurs du monde. Les invitations affichent les délais réellement configurés.
- Les règles par défaut restent identiques. Aucune nouvelle mécanique de jeu. Les multiplicateurs généraux restent séparés et ne font pas partie des profils.

[Guide de l’atelier et limites](./gdd/equilibrage.md). BandLive reste optionnel dans Réglages ; son moteur de cartes n’est pas paramétré par cet atelier.

## V0.7.10 — Personnages personnalisés et groupes présents dès le départ {#v0710}

12 octobre 2026. [Design, validation et limites](./BILAN_V7_10.md).

- Nom, surnom et apparence accessibles depuis la fiche; portraits partagés avec les accessoires de la carte et des shows.
- Crédit « Composition : » explicite et cliquable, coauteurs visibles, propriétaire séparé.
- Suppression confirmée avec crédits et archives conservés; indisponible pendant un spectacle.
- Options persistantes de carte : actions individuelles et collectives séparées, icônes, noms, émotions, liens, trajets et nuit.
- Consulter Shows ne met plus le quartier en pause. Jouer un spectacle le suspend toujours.
- Nouveau quartier : configuration variable de 1 à 4 groupes, ou un grand, deux moyens, deux petits, aucun.
- Formation : probabilité de proposition 31,5 % au lieu de 28 %, soit +12,5 % relatif. Ce n’est pas une garantie de +12,5 % de groupes observés.
- Groupes de coordination sous 40 : appel de pratique à 75 % au lieu de 50 % lors du contrôle de six heures, répertoire actif requis. Première évaluation de départ après trois jours au lieu de deux.
- Albums non implémentés; les raccords laissés débranchés restent identifiés.




## V0.7.9 — Publication plus rapide et versions cohérentes {#v079}

11 octobre 2026.

- Publication accélérée : contrôles du moteur, des sauvegardes, du démarrage et du cache avant chaque mise en ligne.
- Les simulations longues et vérifications visuelles complètes passent dans un audit nocturne ou manuel, indépendant de la publication.
- Le site publie exactement les fichiers testés ; une vérification confirme ensuite la version et le commit servis.
- Une commande prépare les versions et les notes de façon cohérente. Les contributions continuent par de petites PR vers main.

BandLive reste accessible dans **Réglages → Activer BandLive**. Aucun changement de gameplay ni de format de sauvegarde.

## V0.7.8 — Vérification des notes de la version courante {#v078}

11 octobre 2026. Le test navigateur des notes suit désormais la dernière entrée de `PATCH_NOTES`, au lieu d’attendre la lecture de V0.7.5. Le bouton ouvre les nouveautés courantes et leur lecture est bien enregistrée. Cette correction complète les contrôles de publication de BandLive.

Interface **0.7.8**, sauvegardes **0.7.3** inchangées. BandLive : **Réglages → Activer BandLive**.

## V0.7.7 — Publication BandLive débloquée {#v077}

11 octobre 2026. Le contrôle tactile compare maintenant le défilement après la carte à sa position au relâchement du doigt. Il tient ainsi compte du défilement automatique voulu pendant le glissement, tout en vérifiant que le rendu conserve la position. Les contrôles navigateur restent obligatoires avant publication.

BandLive et ses notes V0.7.6 ci-dessous sont inclus. Activation : **Réglages → Activer BandLive**. Interface **0.7.7**, sauvegardes **0.7.3** inchangées.

## V0.7.6 — BandLive : à toi de jouer les spectacles {#v076}

11 octobre 2026. Notes ajoutées rétroactivement pour la [PR #11](https://github.com/jutrasimon/garage-vivant/pull/11), initialement fusionnée sans nouveau numéro de version.

- **Activation : Réglages → Activer BandLive.** L’onglet BandLive apparaît ensuite ; le module est désactivé par défaut.
- Jouez les spectacles réservés du calendrier avec les musiciens confirmés et les compositions prévues : deux à six musiciens, une ou deux chansons, deux passages de trois tours. Les spectacles non admissibles restent classiques.
- Répétez avec les groupes et chansons du quartier, sans récompense, devant trois à douze spectateurs.
- Les vrais spectacles appliquent une seule fois les conséquences habituelles et conservent leur bilan dans l’historique. Rechargement, export/import et replay sont pris en charge.
- Correction du démarrage avec les anciens modules en cache ; public complet conservé pour le groupe suivant, peu importe le bouton de sortie utilisé.
- Numéro visible et notes de version désormais obligatoires dans chaque PR fusionnée vers main, y compris les corrections et la documentation.

Interface **0.7.6** ; format de sauvegarde **0.7.3** inchangé. Après publication réussie, rechargez le jeu : le bouton de version doit afficher **v0.7.6**. Cliquez dessus pour lire ces notes.

## V0.7.5 — Des bands plus faciles à former et compléter {#v075}

11 octobre 2026. Ajustement des règles existantes après comparaison sur les mêmes graines. [Mesures et limites](./BALANCE_V7_5.md).

- Proposition de nouvelle formation : base 28 % au lieu de 22 %, freins au multigroupe conservés.
- Recrutement : le band à compléter ne pénalise plus son propre recruteur ; base 12 %, choix d’un groupe existant légèrement favorisé.
- Seul le candidat attend 24 h ; une adhésion ne relance plus 48 h d’attente chez le recruteur. Nouvelle formation : délai de 48 h conservé.
- Affinités/amour réciproques, liens avec la moitié du groupe, tension, refus et temporisation de paire inchangés. Aucun recrutement forcé ni plafond d’effectif ajouté.
- Tests ciblés, vingt graines à 30 jours dont trois à 90, seize parties complètes à 15 jours, DDD et plan actualisés.

Version 0.7.5, format du monde toujours 0.7.3 ; aucune migration ni mécanique supplémentaire.

## V0.7.4 — Archives des groupes accessibles {#v074}

11 octobre 2026. Correctif d’interface : les groupes dissous étaient conservés dans la sauvegarde, mais cachés par défaut derrière un filtre peu visible.

- Deux boutons Actifs / Archives avec compteurs, et listes séparées.
- La fiche d’un groupe reste accessible lorsqu’il se dissout ; liens de propriétaire/invitation vers sa bonne catégorie, même après une recherche incompatible.
- Répertoire, maîtrise, anciens membres, fondateurs, shows, histoire et motif/date de dissolution consultables. Aucune réactivation ni commande d’activité de groupe dissous.
- Contrôles sur ordinateur et téléphone : groupe après vraie prestation, navigation et export/rechargement. [DDD Groupes](./gdd/groupes.md) et cas G25–G27 du [plan complet](./PLAN_TEST_V7.md).

Interface 0.7.4, format du monde inchangé 0.7.3 ; aucune mécanique ni migration ajoutée.

## V0.7.3 — Correctif après seize parties simulées {#v073}

11 octobre 2026. [Bilan, protocole et résultats avant/après](./AUDIT_V7_3.md) et [plan de test V7 complet actualisé](./PLAN_TEST_V7.md).

- Une répétition sur invitation garde le morceau annoncé.
- Les participants conservent leur propre cycle de départ ; le meneur ne réinitialise plus ceux des autres.
- Une demande expirée ferme aussi la répétition déjà commencée, sans gain collectif après échéance.
- La fin d’une composition ferme les séances des coauteurs encore associés, y compris en trajet, avant le choix normal suivant.
- Import V7.2 : seul le numéro de format change ; hasard et données conservés. Copies préalables distinctes.
- Seize parties de quinze jours, validation quotidienne et continuation de sauvegarde ; vingt graines de stabilité, dont trois à quatre-vingt-dix jours. Rapports avant/après séparés, intégrés à la CI.

Aucune nouvelle mécanique ni retouche globale des coefficients. Plaisir très haut, pression sociale des petits quartiers, rythme d’apprentissage et raccords débranchés restent des points explicites du bilan et des essais humains.

## V0.7.2 — Groupes autonomes et répertoire adopté {#v072}

Version du 11 octobre 2026 ; publication de main après validation de la CI. [Plan et réalisation](./PLAN_V7_2.md), [audit V7.1](./AUDIT_V7_1_RELATIONS.md), [rapport reproductible](./BALANCE_V7_2.md).

- Confiance réellement retirée, relations et formation calibrées ensemble ; propositions/acceptations et freins au multigroupe.
- Attachement personnel dérivé, compétences moyennes/minimales/maximales, couleur musicale et réputation catalogue/spectacles.
- Adoption exclusive : un propriétaire, auteurs permanents, maîtrise préservée après départ ; anciens répertoires partagés migrés avec trace d’arbitrage.
- Pratiques autonomes et manuelles : file hors sac, déplacements, attente sans gains, participation, expiration et départs.
- Spectacles prioritaires, trajet individuel calculé, absence uniquement en déchéance extrême ; dissolution définitive.
- Fiches, catalogue et libellés lisibles ; quinze DDD dans l’architecture et les recherches VitePress/jeu.
- [Plan de test complet V7 à V7.2](./PLAN_TEST_V7.md) : cas par système, réception automatisée, essais humains et publication.
- Sans album, diffusion, transfert de morceau, agenda inventé, retour de groupe dissous ou pénalité de secours ; limites dans les [raccords](./gdd/raccords-v7.md).

## V0.7.1 — Actions et identité musicale {#v071}

Réalisation du 10 octobre 2026. Le [plan V7.1](./PLAN_V7_1.md) conserve les décisions de conception et détaille les arbitrages de la version livrée ; les quatorze DDD décrivent son fonctionnement actuel.

- Six actions : Détente, Socialiser, Pratiquer, Jam, Composer et Déchéance ; fourchettes personnelles et contenu par cycles.
- Jeton défaussé dès la pige, aucun remboursement après recherche ; acquisition dans le sac, retraits depuis la défausse et remplissage sans résurrection.
- Admission sociale initiale unique, résultats directs, intensité, départs et rare proposition d’activité.
- Instruments principal/secondaires, apprentissage par plateaux, maîtrise individuelle ; pratique collective de morceau entre membres du même groupe. Jam joue solo et reste ouvert sans avancer directement la carrière.
- Projets multiples séparés, coauteurs, composition longue et irrégulière, élan émotionnel à deux axes, abandon des œuvres délaissées et classement faible relatif.
- Catalogue unifié filtrable et triable, fiches auteurs/rattachement/maîtrise, archives accessibles et banques de noms distinctes à unicité persistante.
- Chaînes de déchéance ; quantité liée de jetons et cartes nuisibles ajoutées au paquet musical. Versions de spectacle historiques conservées.
- Migration V1–V7 et reprise déterministe V7.1 ; quatorze DDD, recherche VitePress et jeu actualisées. Dix raccords débranchés nommés dans l’interface et la documentation.

Voir les [arbitrages de réalisation](./PLAN_V7_1.md), [DDD](./gdd/documentation.md) et [limites](./gdd/raccords-v7.md).

## V0.7.0 — Personnages et relations {#v070}

- Cinq actions d’éveil dans un sac fini sans remise : jetons réservés puis consommés au démarrage, report sans réalisation quand aucun partenaire n’est disponible, édition au prochain cycle et huit sacs de test.
- Sommeil quotidien hors sac, besoin et horaire individuels, récupération selon durée obtenue et avance jusqu’au premier réveil quand tous dorment.
- Quatre besoins; confort supprimé. Pressions personnelles continues sur exaltation et détresse, sans humeur globale ni repondération du sac.
- Catalogue de traits permanents et conditionnels, douze prototypes et Alpha/Bêta. Seuils, effets, sources et incompatibilités inspectables et cherchables.
- Séances rejoignables sans interrompre les musiciens; cadence sociale commune. Discussion, soutien et avance séparent acceptation du résultat, avec chances et conséquences visibles.
- Affinité lente, tension rapide, poids de partenaires liés à la coordination, lien amoureux orienté sans attirance parallèle et statut de couple distinct.
- Projets, chansons, groupes, déchéance, calendrier et shows conservés et raccordés. Quatre limites débranchées annoncées : poids d’humeur des souvenirs, anciennes six nuances des nouvelles chansons, ancien choix par personnalité/priorités, bonus de choix Relax.
- Migration V1–V6, archive des anciens compteurs et copie avant migration. DDD exhaustifs par domaine, architecture documentaire et recherche VitePress/jeu depuis les mêmes Markdown.

Voir les [DDD V7](./gdd/documentation.md) et le [registre des raccords](./gdd/raccords-v7.md).

## V0.6.4 — Carte, musicien, BANG ! {#v064}

- La carte apparaît brièvement dans une place réservée, toujours au même format. Elle disparaît avant la visée et le tir du musicien vers la foule. La défausse ne recouvre plus la scène; les cartes jouées restent consultables dans l’historique.
- Visée qui se verrouille, projectile rapide, recul du musicien, flash, onde et « BANG ! » au contact. Les gains et réactions restent liés au véritable impact.
- Bouton « Son : ON/OFF » visible directement à côté de la pause. Tir et impact ont une attaque sonore distincte; une réaction du public ne coupe plus le son de l’impact.
- Durée de 30 secondes, tirages, résultats, sauvegardes, inspections et commandes intégrées conservés. Les effets réduits suppriment secousses, recul et éclats.


## V0.6.3 — Tout le show dans le jeu {#v063}

- Le show occupe toute la largeur et la hauteur disponibles. Nom du groupe, chanson, progression, jauges et commandes sont intégrés à l’arène; aucun défilement extérieur nécessaire.
- Cartes de même taille, dans un emplacement fixe, y compris les erreurs et les combos. La taille ne change plus à la résolution de l’effet.
- La trajectoire relie la carte à la zone visée dans la foule, marquée avant l’impact. Musiciens, fans, decks et jauges sont agrandis.
- Lecture, pause, inspection, résultats et sauvegardes conservés sur ordinateur et téléphone.

## V0.6.2 — Les cartes prennent la scène {#v062}

- Scène aux proportions correctes, sans panneau latéral qui écrase le canvas.
- Decks individuels visibles et consultables; cartes pigées depuis leur pile, jouées au premier plan puis conservées dans une défausse consultable.
- Chansons de 30 secondes à ×1, avec départ explicite et cinq phrases. Les règles et tirages restent identiques à toutes les vitesses et au skip.
- Zones de groove, charges de crescendo/soutien, bonus de combo, gains locaux et réactions du public visibles. Sons distincts selon l’instrument et l’effet.
- Inspection des fans, musiciens, decks et cartes : pause temporaire et reprise dans l’état précédent, y compris après plusieurs inspections.
- Sauvegardes et historiques conservés; bilans attribués au band.

## V0.6.1 — Une interface qui respire {#v061}

- Recherche documentaire avec champ large, rubriques, extraits lisibles et navigation au clavier.
- Fenêtres fermables avec le X en haut, Échap ou un clic à l’extérieur. Le bouton du bas disparaît.
- Marges des modules personnages réparées; commandes de disposition dans « Organiser ». Le sac Rapin conserve ses commandes pendant les mises à jour.
- Le monde, les personnages et la disposition personnalisée restent conservés.

## V0.6.0 — Le quartier prend la scène {#v060}

- Shows en direct avec quartier en pause, cartes détaillées, inspection et Sauter.
- Quatre dates continues, plusieurs créneaux, candidatures et sélection des grosses scènes.
- Réservations autonomes, engagement unique et moral temporaire des bands.
- Setlists multiples, bilans et historique par groupe.
- Groupes compacts, fiches modulaires, sac Rapin personnalisable et récupération unifiée.
- Griefs relationnels, rencontres de trajet et détente ensemble.
- Documentation par système, recherche dans le jeu et notes dans leur propre onglet.

## V0.5.1 — Préparer et observer {#v051}

Préparation accessible aux bands NPC, improvisation sans chanson, annulation et arrivées corrigées. Vitesse aimantée et sac Rapin observable. Scroll et focus stabilisés.

## V0.5.0 — Du garage à la scène {#v050}

Shows automatiques à cartes, foule physique, déchéance, projets de compositions et répertoire des bands.

<script setup>
import {onMounted,onUnmounted} from 'vue'
import {PATCH_NOTES} from '../dist/release.mjs'
let observer
onMounted(()=>{const ids=PATCH_NOTES;let saved=[];try{const value=JSON.parse(localStorage.getItem('garage-vivant-read-notes')||'[]');if(Array.isArray(value))saved=value;}catch{}const read=new Set(saved);const target=ids.find(id=>!read.has(id));if(target&&!location.hash)document.getElementById(target)?.scrollIntoView();observer=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting){const id=entry.target.id;setTimeout(()=>{if(document.visibilityState==='visible'&&entry.target.getBoundingClientRect().top<innerHeight&&entry.target.getBoundingClientRect().bottom>0){read.add(id);try{localStorage.setItem('garage-vivant-read-notes',JSON.stringify([...read]));}catch{}}},1500);}}, {threshold:1});for(const id of ids){const node=document.getElementById(id);if(node)observer.observe(node);}})
onUnmounted(()=>observer?.disconnect())
</script>
