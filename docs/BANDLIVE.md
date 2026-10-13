# BandLive · moteur de spectacle — 0.8.12

Tous les nouveaux shows s’ouvrent automatiquement dans BandLive, y compris les jams et les grandes formations jusqu’à 24 musiciens. Une setlist réservée plus longue ne bloque plus le show : BandLive conserve ses deux passages, choisis dans le répertoire actif. Sans composition active, une jam libre de trois tours est proposée. Les anciens spectacles déjà joués ou commencés conservent leurs règles.

## Niveaux visibles et notification

La liste des voisins affiche le niveau et une barre d’XP pour chaque musicien. Une amélioration disponible ajoute une mise en évidence dorée et un bouton d’accès direct. À une montée de niveau, une grande notification montre le portrait, le nom et le nouveau niveau. Elle reste jusqu’au choix d’amélioration ou à « Plus tard ». Reporter une notification ne dépense pas la récompense; le bouton reste dans la liste et sur la fiche, et le report est conservé au rechargement. Plusieurs niveaux du même musicien sont regroupés, puis les autres musiciens sont présentés à la suite. La notification reste masquée tant que la soirée est ouverte ou que la vue du show est affichée, même au bilan, entre deux groupes, après rechargement ou pendant une répétition. Elle apparaît après la fin de la soirée, au retour dans le quartier. Le blocage conserve les récompenses sans les acquitter. Le bouton ouvre le menu du personnage et suspend le quartier pendant son choix; l’ouverture manuelle est refusée pendant une prestation active. Niveau, XP et récompenses de la fiche sont actualisés pendant la pratique. Validation : `npm run test:levels`, inclus dans le smoke obligatoire.

## Fluidité du rendu

La version 0.8.1 mesure les positions au changement de mise en page, puis anime directement la scène. La danse décorative est limitée à 30 images par seconde; les commandes et les effets ont leur propre cadence. La résolution suit la taille affichée et le dessin s’arrête en mode mouvements réduits, lorsque la vue est masquée ou lorsque la scène est entièrement hors écran. Une preview est recalculée au changement de carte, de cible ou d’état du show, puis réutilisée sur la même cible. Les règles, cartes et sauvegardes sont conservées. Le test navigateur `npm run test:performance` surveille les lectures de géométrie, les duplications de preview, la suspension du rendu et le résultat exact de la carte; il est inclus dans le smoke obligatoire.

## Interface et lecture du public

Les cartes partagent un format 5:7 : coût dans le coin, icône en haut, titre centré, nom du musicien, description complète et cible en pied de carte. La version 0.8.2 agrandit les cartes en main de 32 % et augmente leur typographie. Les mains par défaut compensent en partie la réduction de la salle sur les écrans plus petits; les tailles choisies manuellement restent conservées. Les descriptions longues gardent tout leur texte, y compris dans les decks, aperçus et améliorations. Le test de composition vérifie la lisibilité à la taille affichée et l’absence de texte coupé pour toutes les cartes.

La version 0.8.10 abaisse les mains et remonte légèrement les musiciens pour dégager leurs instruments. L’espace de scène augmente et les mains par défaut compensent davantage la réduction de la salle. Les cartes restent au même ratio et ne recouvrent pas la première rangée du public. Le test de composition vérifie les huit instruments, une main complète de cinq cartes, le 1280 × 720 et les anciennes grilles à trois rangées. Les décalages et tailles de mains choisis manuellement restent conservés.

La composition reprend les proportions de la maquette : scène centrée de 1 120 unités maximum, fond de salle continu et bandeau compact avec chansons au centre, tour et conquêtes à droite. Les nouveaux shows utilisent deux rangées : quatre colonnes jusqu’à huit spectateurs, cinq pour neuf ou dix, six pour onze ou douze. Les anciennes sauvegardes sans nombre de colonnes gardent leur grille à quatre colonnes. Les effets spatiaux utilisent toujours les voisins de la grille affichée. Sur ordinateur, la scène est ajustée à la hauteur disponible pour montrer le public entier. Sur petit écran, la scène conserve un défilement horizontal. Le gros bouton **Fin du tour** reste en bas à droite. La programmation de la soirée, les outils avancés et le déroulement commencent sous le premier écran de jeu. Une carte gratuite reste jouable à zéro énergie.

L’énergie et le tempo sont regroupés en bas à gauche : gros chiffres, trois segments vert menthe pour l’énergie, dix segments dorés pour le tempo. Chaque gain ou dépense anime brièvement la jauge et les segments concernés et affiche la variation réelle. Le tempo plein brille davantage et la recharge d’énergie du tour suivant est visible. Les effets réduits gardent les indications sans mouvement; il n’y a aucune animation continue des ressources. L’espace du bas est réservé pour conserver le public dégagé. Sur les écrans de moins de 360 pixels, le bloc de ressources passe au-dessus du bouton. `npm run test:resources`, inclus dans le smoke obligatoire, vérifie cinq tailles d’écran, gains plafonnés, dépenses, recharge, rechargement et effets réduits.

Le choix des tounes se fait dans un overlay avec les styles favoris, leurs effectifs, les réactions du public et le nombre de fans correspondant à chaque chanson. Les cartes utilisent partout le même composant au ratio 5:7 : main, preview, pioche, fiche et récompenses.

La fiche d’un fan montre son portrait, sa barre de conquête, son style, sa réaction et son pouvoir. Pendant le ciblage, le preview explique aussi sa condition, son effet de conquête et les déclenchements prévus. Il utilise une copie du vrai moteur, sans dépenser de ressources. En glisser-déposer, une seule prévision suit le curseur, décalée pour laisser visible le spectateur visé et rester dans l’écran, y compris lorsque la cible est invalide. Le déplacement utilise des dimensions en cache; la simulation n’est recalculée que si carte, cible, état du show ou choix en cours changent. La marge réservée à l’ancien panneau fixe de visée est retirée. Les arcs roses rejoignent les spectateurs touchés; les arcs jaunes de tempo suivent le curseur ou le doigt, même sur une même cible. Les cartes mixtes montrent les deux avec des courbes distinctes. Une lueur et des ondes remplacent le rectangle de ciblage collectif; les cibles individuelles ont un halo. Le tempo utilise le doré dans le tooltip, les indications de gain ou dépense et l’éclairage de la salle. Le vert reste associé aux actions et à l’énergie. La géométrie des personnages reste stable pendant la visée, l’arc déjà créé est réutilisé, et les pulsations s’arrêtent en mode effets réduits. `npm run test:targeting` et `npm run test:performance`, inclus dans le smoke obligatoire, vérifient ces interactions et leur coût de rendu.

## Trois pouvoirs à la conquête

Une fois conquis, le spectateur perd sa bulle d’intention et son badge de pouvoir sur la grille. Sa barre devient une pastille rose « ♥ ✓ CONQUIS »; un halo rose permanent et de petites étincelles le distinguent du public restant. Ce repère est statique, y compris avec les effets réduits. La zone de survol et la position du personnage restent stables. La barre accessible conserve sa valeur complète et annonce « Conquis ». Le parcours `npm run test:conquest-preview` vérifie ces changements après des cartes réellement jouées et des chaînes, à la souris et au tactile, puis après rechargement sans répéter les pouvoirs.

Quand la simulation prévoit le déclenchement du pouvoir du spectateur visé, un encadré rose lumineux le présente avant les règles ordinaires : « VA SE DÉCLENCHER ! », icône, grand nom, description et noms des voisins réellement affectés. Une chaîne prévue affiche le nombre d’effets de conquête. L’annonce est commune au glisser-déposer, au tactile et à la carte sélectionnée; elle n’apparaît pas sur une cible survivante ou déjà conquise. Son apparition est animée une fois par changement d’effet, sans boucle ni nouvelle simulation aux petits mouvements; les effets réduits gardent une annonce statique. Sur téléphone, elle peut utiliser l’espace du haut pour ne pas recouvrir la cible. `npm run test:conquest-preview`, inclus dans le smoke, vérifie ces cas et l’annulation sans dépense.

Après sélection d’une carte, l’annonce d’un pouvoir imminent passe avant sa grande fiche, pour rester à l’écran même avec une faible hauteur disponible ou des polices différentes. Le format de la carte reste inchangé. Ce cas est vérifié jusqu’au 1024 × 600.

Chaque nouveau spectateur reçoit un pouvoir et sa valeur, déterminés par la graine :

| Pouvoir | Effet |
|---|---|
| Onde de choc 2–5 | Transmet cette puissance à chaque voisin immédiat. |
| Projecteur 1–3 | Les voisins immédiats reçoivent ce bonus par carte jusqu’à la fin du tour. La plus forte valeur reste, sans addition. |
| Chœur du public 1–2 | Ce nombre de voisins non conquis adopte le style de la chanson jusqu’à sa fin. Priorité aux styles différents; sélection stable dans l’ordre de la grille. |

Les voisins sont gauche, droite, devant et derrière, sans diagonales. Vague d’enthousiasme et Percée restent uniquement dans les anciens snapshots.

## Réactions immédiates

Six réactions sont conservées. **Ennui 3** perd trois conquête en fin de tour. **Attentif +3** et **Distrait −3** modifient la prochaine carte de puissance. **Attend du rythme** reçoit immédiatement trois conquête dès que trois tempo réels sont gagnés ce tour. **Veut de la variété** ajoute trois puissance à la carte du deuxième musicien différent. **Se laisse entraîner** reçoit immédiatement trois conquête lorsqu’un voisin est conquis.

Une réaction consommée disparaît, ne se redéclenche plus pendant ce tour et se renouvelle au suivant. Une réaction non déclenchée reste. Le rythme compte le gain réel, limité par le plafond de dix; le tempo peut ensuite être consommé. Les chaînes de conquête marquent chaque réaction avant propagation pour éviter les doubles activations.

Tous les gains, pertes, conquêtes, réactions, pouvoirs, finales et soutiens ont une rétroaction. La propagation est présentée successivement. Le tempo affiche gain et consommation, pulse dans le compteur et éclaire la salle; les mouvements sont atténués en mode effets réduits.

## XP, niveaux et récompenses

Un seul compteur individuel est conservé. Pratique solo et collective : **1 XP par 15 minutes réellement jouées**; trajet et attente ne donnent rien. Les minutes partielles sont conservées entre les séances et les rechargements (4 XP pour une heure de pratique). Une pratique collective ajoute également **1 coordination par cycle de 15 minutes**, une fois pour le groupe, avec au moins deux membres présents.

Les grands moments donnent : formation d’un nouveau band **10 XP par fondateur**, chanson ou recomposition terminée **20 XP par auteur**, show terminé **10 + accueil/5 arrondi par participant**, avec **20 XP au premier show du band** et **15 XP supplémentaires si tout le public est conquis**. Les groupes et chansons de départ n’accordent pas rétroactivement ces bonus.

Les seuils cumulés des niveaux 2 à 6 sont **80, 180, 360, 650 et 1 100 XP**. Ensuite, chaque palier demande 40 % de plus que le précédent. Cible de rythme : première montée autour de quatre jours et un show, niveau 3 autour du show suivant, puis espacement croissant. Sur douze graines de trois musiciens autonomes, les médianes sont 81 XP à quatre jours, 183 à huit jours et 348 à seize jours; les activités et dates de show font varier ce rythme. Les sauvegardes des premiers essais conservent leur niveau, leurs récompenses et leur progression proportionnelle dans le niveau. Niveau, barre et améliorations disponibles sont visibles dans les fiches.

**Une montée de niveau donne un échange de carte à ce musicien**, lié à son instrument au moment du niveau : remplacer une des cinq cartes par une spéciale. Ce système remplace l’échange automatique après chaque show. Le bouton « Améliorer le deck » des fiches et membres du groupe ouvre le choix, puis montre la carte remplacée et celle obtenue. Le quartier attend pendant ce choix. Les niveaux déjà gagnés sont conservés. Les récompenses gagnées en pratique restent disponibles dans la fiche; celles gagnées en show apparaissent au bilan de ce show. Une récompense de pratique ne doit pas attendre un spectacle. Les choix sont conservés à l’export et au rechargement. Répétitions BandLive, replays et interruptions ne donnent pas d’XP de show. Les anciens shows qui possédaient déjà un échange gardent leur récompense historique.

## Début de partie et essai entre amis

Une nouvelle partie propose une graine différente par défaut; la même graine reproduit exactement les musiciens et leur ordre. Un band commence avec deux chansons. Plusieurs bands partagent trois à quatre chansons, avec au moins une par groupe. L’option sans band commence sans répertoire de groupe.

`npm run bandlive:test-file` produit un HTML autonome à partager, avec sa sauvegarde de test séparée du site principal. Les vérifications ciblées sont `npm run test:refonte` et `node --test tests/bandlive-refonte.test.mjs`.

## Historique des règles jusqu’à 0.7.21

Les sections suivantes décrivent les versions précédentes; les règles courantes sont celles exposées ci-dessus.


BandLive relie les musiciens du quartier au spectacle jouable d’ENCORE. Activer **BandLive** dans **Réglages** fait apparaître son onglet et **Essayer BandLive** dans la préparation des Shows. L’option est désactivée par défaut et peut être retirée à tout moment.

BandLive peut maintenant jouer un **vrai spectacle réservé**, avec les conséquences du calendrier, ou une **répétition sans récompense**. Les groupes actifs du quartier alimentent les deux parcours. Depuis **Groupes**, **Jouer avec BandLive** ouvre directement la préparation actuelle du groupe choisi, même après un import de quartier. Son nom, ses membres actuels et les compositions actives de son répertoire proviennent du monde. La formation libre et les chansons inventées pour le prototype ne sont plus proposées.

BandLive accepte **deux à six musiciens** du groupe. Ils sont tous sélectionnés par défaut jusqu’à six ; une case non cochée est désactivée lorsque six membres sont déjà choisis. Pour les groupes existants plus grands, choisir une formation de scène sans retirer de membres du quartier. La limite est aussi vérifiée par le moteur, pas seulement par l’interface.

Les identités, couleurs, instruments, styles et informations des musiciens proviennent du quartier. Leurs decks sont conservés par musicien et par instrument : au départ, trois Note et deux exemplaires de la spéciale initiale. Le décor de scène, les illustrations d’instruments, les accessoires des cubes et le son réutilisent ceux de Garage vivant.

## Jouer une répétition

- Choisir de **3 à 12 spectateurs** avant de prendre la scène. Trois restent sélectionnés par défaut. Un public plus grand augmente le défi sans changer les cartes, l’énergie ou la durée des chansons.
- Chaque musicien apporte trois **Note** (1 énergie, 6 puissance sur une cible) et deux exemplaires de sa carte spéciale.
- La pioche est commune. Cinq cartes sont pigées au début de chaque tour, puis réparties dans la main de chaque musicien, sous son personnage. Chaque exemplaire est distinct.
- Le band dispose de trois points d’énergie par tour. Les cartes gratuites restent jouables à zéro énergie.
- Glisser une carte ciblée sur un spectateur. Déposer une carte collective ou de préparation dans la zone du public. Le glisser-déposer fonctionne à la souris et au toucher ; sélectionner une carte puis sa cible offre aussi un accès au clavier.
- Le public défile verticalement dans sa propre zone ; les musiciens et leurs cartes restent visibles. Pendant un glisser-déposer, approcher la carte du bord du public fait défiler ses rangées. Le défilement est conservé après avoir joué une carte.
- Les noms, intentions et barres sont visibles. Les styles ont des symboles et une infobulle contenant seulement leur nom. Les informations détaillées des musiciens et du public s’ouvrent au survol ou au focus, sans fenêtre au clic.
- La fin du tour défausse toutes les cartes restantes, efface le bonus de prochaine puissance et remet l’énergie à trois. La défausse est remélangée quand la pioche est vide.
- À la victoire ou au dernier tour, **Retour au quartier · continuer** revient au menu Quartier et reprend la simulation à sa dernière vitesse non nulle, sans créer de nouveau monde. Le résultat du show reste enregistré ; **Rejouer la répétition** conserve le nombre de spectateurs.

| Instrument | Carte | Énergie | Effet |
|---|---|---:|---|
| Guitare | Solo | 2 | 8 puissance + tout le tempo sur une cible. Consomme le tempo. |
| Batterie | Pulsation | 1 | +4 tempo. |
| Basse | Soutien | 0 | +1 tempo et +3 à la prochaine carte de puissance du tour. |
| Chant | Refrain | 2 | 5 puissance sur chaque spectateur. |
| Clavier | Accord | 1 | +2 tempo et 2 puissance sur chaque spectateur. |
| Saxophone | Improvisation | 2 | Tout le tempo en puissance sur chaque spectateur. Consomme le tempo. |
| Trompette | Fanfare | 0 | +2 tempo. |
| Percussions | Roulement | 1 | +1 tempo et +5 à la prochaine carte de puissance du tour. |

Le tempo est commun, limité à dix comme dans ENCORE et conservé entre les tours. Le Solo et l’Improvisation en consomment la totalité. Les bonus de Soutien et de Roulement se cumulent ; une préparation ne les consomme pas. La prochaine carte de puissance les applique à chacune de ses cibles. Improvisation reste une carte de puissance même à zéro tempo.

## Répétition : chansons et public

Le public compte entre trois et douze spectateurs, disposés sur plusieurs rangées. Les trois premières barres ont pour objectifs 24, 20 et 25 conquête ; les suivants reprennent ces valeurs et les styles du répertoire. Conquérir **tout** le public gagne immédiatement. Les cartes collectives et les finales touchent tous les spectateurs encore à conquérir, quel que soit leur nombre. Deux passages utilisent chacun la durée fixe de la composition (3, 4 ou 5 tours). Les morceaux historiques sans durée et les concerts des anciens formats gardent trois tours par passage. **Toutes** les compositions actives possédées par le groupe sont proposées, avec leurs titres, styles, auteurs et durées. Choisir la première chanson au départ, puis une autre pour le deuxième passage. Si une seule chanson est disponible, la reprendre au deuxième passage conserve les deux passages, sans fabriquer de morceau.

Sans groupe actif, la préparation donne accès à **Groupes** pour en créer un. Sans chanson active, elle invite à adopter une composition depuis ce même écran ; prendre la scène reste désactivé. Une chanson mise de côté ou possédée par un autre groupe n’est pas proposée. Les nouvelles répétitions relisent les membres, instruments et chansons actuels. Une répétition commencée conserve ses copies pour permettre la reprise du même tour.

Les règles restantes reprennent ENCORE : une chanson du style favori ajoute deux puissance ; **Attend un Solo** ajoute trois puissance à la carte Solo ciblée ; **S’ennuie** redonne trois résistance en fin de tour aux spectateurs non conquis. La finale de chaque chanson inflige trois puissance à tout le public avant l’ennui. Le départ de la deuxième chanson retire deux tempo. L’Improvisation du saxophone utilise le tempo, mais ne déclenche pas le bonus réservé à la carte Solo.

## Vrais spectacles du calendrier

1. Activer **BandLive** dans **Réglages**.
2. Dans **Shows**, réserver une date avec **deux à six musiciens** et **une ou deux compositions** du groupe. Les déplacements, confirmations et candidatures restent ceux du calendrier.
3. **Avancer jusqu’au show**, puis choisir **Jouer avec BandLive** avant de lancer la première chanson. Le spectacle classique reste disponible.
4. Choisir la première chanson parmi tout le répertoire actif du groupe, puis une autre au deuxième passage. Si le groupe n’a qu’une composition active, elle est reprise ; chaque composition conserve sa durée de trois à cinq tours. La victoire peut arrêter la prestation avant le deuxième passage.
5. Consulter le bilan puis **Retour au quartier · continuer**. Si un autre groupe attend, **Continuer la soirée** ouvre sa prestation ; le quartier reprend après la dernière.

Les jams, les setlists de plus de deux morceaux et les formations de plus de six musiciens restent jouables dans le spectacle classique. La préparation indique pourquoi BandLive n’est pas disponible pour cet engagement. Aucun membre du quartier n’est retiré pour satisfaire la limite du module.

Le lieu fixe le public interactif :

| Scène | Spectateurs | Barres à froid, répétées dans la foule |
|---|---:|---|
| Garage | 8 | 16, 13, 16 |
| Parc ou Canal | 10 | 19, 16, 20 |
| Grande scène | 12 | 24, 20, 25 |

Les styles favoris proviennent de la scène, même s’ils ne figurent pas dans le répertoire choisi. Les cartes, l’énergie et les durées des compositions ne dépendent pas du lieu. Ce public compact ne change ni les capacités des lieux ni la foule du groupe suivant, qui conserve le public classique de la soirée, y compris en passant par **Shows → Groupe suivant / terminer la soirée**, **Retour aux dates**, ou en interrompant la prestation. BandLive reprend aussi l’accueil transmis par le groupe précédent : une foule déjà réceptive commence avec des barres partiellement remplies.

**Victoire BandLive** signifie conquérir tout le public. Le **bilan du calendrier** tient aussi compte des spectateurs partiellement touchés : accueil entre 0 et 100, comparé aux attentes de la scène. Une prestation sans victoire totale peut donc recevoir un accueil favorable. Le bilan affiche ces deux informations et leurs effets.

La fin applique les règles de spectacle existantes : coordination, réputation de spectacle, moral temporaire, renommée, émotions et liens des musiciens. Le coût d’énergie est de 15 par musicien ; **Tout donner** ajoute 1,5 par carte BandLive réellement jouée par ce musicien et conserve son effet de déchéance. Le bilan affiche les énergies avant et après. Un échange de carte facultatif s’ajoute après un spectacle BandLive terminé (voir les decks par instrument ci-dessous).

Le résultat entre dans l’historique du groupe **une seule fois**. Recharger, rouvrir le bilan ou rejouer l’historique ne redonne aucun gain. **Rejouer BandLive · répétition** utilise la formation, les chansons, la foule et la graine enregistrées, sans effet sur le monde actuel. **Interrompre le show** réutilise l’annulation du calendrier : pas de résultat ni de récompense, coût d’interruption existant et libération des musiciens.

## Isolation et sauvegarde

Le moteur de cartes et sa graine restent indépendants du hasard du quartier. Les répétitions conservent leurs copies des musiciens, sans modifier leurs decks, besoins, engagements ou réputation. Leur progression et l’activation du module restent séparées dans `garage-vivant-bandlive-v1`.

Un vrai show est enregistré **dans sa prestation du quartier**, avec sa main, sa pioche, son tempo et sa setlist. Exporter/importer le monde ou recharger reprend cette prestation exacte, sans la remplacer par une répétition. Le quartier et le moteur automatique attendent la fin du show interactif. Les champs classiques de la prestation restent valides et les sauvegardes ordinaires conservent leur format.

Désactiver BandLive retire son usage des prochains spectacles. Une prestation interactive déjà engagée reste accessible pour être terminée ou interrompue ; sa progression n’est pas supprimée. Après son retour au quartier, l’onglet se masque si l’option est désactivée.

Les répétitions aux formats 1 et 2 restent lisibles, y compris les anciennes formations de plus de six musiciens. Les parties avec un public de scène et une setlist ordonnée utilisent le format 3. **Changer le band** et **Reprendre la répétition en cours** conservent le parcours de répétition. Les spectacles classiques et le calendrier continuent à fonctionner avec le module désactivé par défaut.

## Validation

`npm test` inclut les règles BandLive : les huit cartes, tempo, bonus, cartes gratuites, cibles invalides, victoire, durées variables et anciens concerts à six tours, recyclage, reprise JSON, limite de six membres, reprise du format 1, répertoire complet, chanson unique, sélection actualisée, public de trois à douze, effets collectifs sur les rangées supplémentaires et isolation du monde. `npm run test:browser` inclut son parcours ordinateur et tactile : activation, accès depuis un groupe, compositions et auteurs, groupe de huit réduit à six sur scène, refus d’un septième membre, reprise d’une chanson, préparation sans perte de progression, états sans groupe/chanson, drag/drop, infobulles, sauvegarde des grands publics, retour au quartier après victoire ou fin de show, reprise de la simulation, désactivation et retour au spectacle classique. Les captures sont produites dans `test-results/`.

Les tests de calendrier couvrent les confirmations et déplacements réels, la setlist ordonnée, les styles propres au lieu, le bilan unique, le rechargement, l’export/import, le replay isolé, l’interruption, la désactivation en cours de show et le groupe classique suivant. Les parcours navigateur vérifient aussi le bilan sur téléphone, la reprise du temps, les sorties alternatives par Shows et le défilement indépendant du public. Les modules et feuilles de style partagent une version de cache propre à BandLive ; le contrôle `cache-upgrade-browser` prépare les anciennes URL en cache avant de vérifier le démarrage avec le module désactivé, son activation et le rechargement.

`npm run audit:bandlive` simule 4 200 prestations avec les cartes approuvées. [Résultats et limites de l’équilibrage](BANDLIVE_BALANCE.md) · [données complètes](BANDLIVE_BALANCE.json).

## Interface et frontière des systèmes (0.7.12)

Le preview appelle le même calcul que la carte jouée : puissance de base, tempo consommable, bonus de prochaine puissance, style favori et attente de Solo. Il affiche la conquête obtenue, plafonnée à l’objectif et ne consomme rien. Les cartes collectives prévisualisent toutes leurs cibles. Les piles consultables sont regroupées par musicien, sans ordre de tirage.

Les nouveaux shows attribuent un bonus de conquête réel à chaque spectateur (voir ci-dessous). Les anciennes réactions « Explosion », « En transe » et « Ému aux larmes » restent des animations : leur apparence ne définit pas le bonus. Compétences, affinités, besoins et qualité du quartier ne modifient pas les dégâts BandLive. Les raccords existants au calendrier et au bilan sont conservés.

L’éligibilité d’un vrai show est expliquée dans la préparation et près du bouton : deux à six musiciens, une ou deux compositions sans jam, engagement valide, première chanson non commencée. Le rang du band dans la soirée n’est pas une condition. Une setlist incompatible reste jouable dans le mode classique.

Le format BandLive 4 accepte deux passages de trois à cinq tours. Les formats 1–3 restent interprétés avec leurs anciennes durées. La reprise valide le passage, le tour et les résultats sans reroll. Les répétitions et replays restent isolés du quartier.

## Présentation de la scène · Minuit 0.7.19

La scène Three.js utilise la DA Minuit : sol, speakers, instruments, spots au plafond et lumières arrière. Les huit instruments utilisent des modèles simples, et les personnages conservent leur couleur, accessoires et petits corps. Musiciens et foule dansent à des rythmes individuels. Le renderer est chargé lorsque la scène est ouverte et réutilisé entre les cartes. Sans WebGL, les portraits et commandes restent disponibles.

Les cinq cartes réellement présentes dans la main sont regroupées par musicien, en éventail. Le simple survol ouvre le détail de la carte sur le côté. Pendant le drag, un seul popup affiche près du curseur le résultat exact calculé par le moteur, sans cacher le spectateur ciblé, avec des accents dorés pour le tempo. Les effets directs, les chaînes et les statuts sont également détaillés. Les arcs partent des musiciens : rose vers les spectateurs pour la conquête, jaune vers le curseur ou le doigt pour le tempo. Au téléphone, l’aperçu est compact et la scène peut se déplacer horizontalement.

**Disposition** permet de placer un musicien et sa main séparément, régler la taille complète de la main et son éventail, annuler et restaurer le placement initial. Ces réglages sont des préférences locales de présentation ; ils ne créent aucune carte et ne changent pas le show. Les mains n’ont aucun collider. Les spectateurs conservent une protection de 86 × 112 et restent dans leurs places logiques, visibles en mode Disposition. De petits décalages et une danse individuelle gardent la foule organique ; rangées, colonnes et voisins restent ceux du moteur, sans modifier les bonus de conquête.

Le public défile indépendamment des mains. La sélection puis le choix de cible au clavier restent possibles, comme les deux cibles et la défausse demandées par certaines cartes. Le bouton Son et les effets réduits sont conservés. Choix des chansons, pioche/défausse, programmation, bilan, échange de carte et retour au quartier suivent le parcours existant.

## Bonus de conquête (0.7.15)

Chaque spectateur d’un **nouveau show** possède exactement un effet, indiqué sous sa barre avant sa conquête. Le tirage dépend de la graine du show et répartit les cinq effets aussi équitablement que la taille du public le permet. Il ne change ni les cartes pigées ni le hasard du quartier.

| Effet | À la conquête, une seule fois |
|---|---|
| Onde de choc | 3 puissance aux voisins immédiats encore à conquérir : gauche, droite, devant et derrière, sans diagonales. |
| Vague d’enthousiasme | 2 puissance aux autres spectateurs encore à conquérir de la même rangée. |
| Percée dans la foule | 4 puissance au spectateur derrière, dans la même colonne. Traverse les spectateurs déjà conquis et continue si la nouvelle cible est conquise. S’arrête sur le premier survivant ou au fond de la foule. |
| Sous les projecteurs | Les voisins immédiats subissent +2 puissance par carte de puissance jusqu’à la fin du tour. Plusieurs projecteurs ne se cumulent pas. |
| Chœur du public | Les autres spectateurs de la rangée adoptent le style de la chanson actuelle jusqu’à sa fin. Utilise le bonus de style habituel de +2, sans le doubler. |

Le public forme des rangées de **quatre places maximum**, identiques sur ordinateur et téléphone. Le devant est du côté des musiciens ; derrière signifie vers le bas de l’écran. Les places des spectateurs conquis restent occupées. Les cibles sont surlignées au survol ou au focus d’un spectateur non conquis ; son infobulle détaille l’effet et les bonus temporaires actifs.

Une carte termine tous ses effets avant les conquêtes : on calcule d’abord toutes ses cibles avec les bonus présents avant la carte, puis on consomme les ressources. Les conquêtes simultanées déclenchent ensuite leur effet dans l’ordre des places (de gauche à droite, du devant au fond). Les nouvelles conquêtes sont ajoutées à la suite de cette file. Chaque spectateur déclenche une seule fois. Les dégâts d’effet sont fixes : ni tempo, ni style, ni projecteurs ne les amplifient. Les finales peuvent aussi déclencher des effets, avant l’ennui. Les projecteurs expirent à la fin du tour ; le chœur expire à la fin du passage, même si la même chanson est reprise.

Le preview utilise une copie du même moteur et montre tous les dégâts directs et secondaires, la conquête finale et les nouveaux bonus temporaires. Une victoire par réaction en chaîne termine le show et applique le bilan normal une seule fois.

Le format de sauvegarde du quartier est inchangé. Le champ optionnel `conquestVersion: 1` distingue les nouveaux shows ; chaque spectateur y conserve son effet et ses statuts. Les shows et replays historiques sans ce champ gardent leurs règles d’origine, sans ajouter rétroactivement de bonus. Recharger ou exporter/importer conserve exactement les effets. Les nouveaux shows et répétitions utilisent les bonus.

Validation ciblée : `node --test tests/bandlive-conquest.test.mjs` et `node tests/bandlive-conquest-browser.test.mjs` (zones, chaînes, durée, preview, reprise, ancien format, bilan du calendrier et trois tailles d’écran).


## Decks par instrument — intégrés en 0.7.18 après le test 0.7.16

Chaque musicien possède cinq cartes pour chacun de ses instruments. Un instrument jamais joué commence avec trois Note et deux spéciales initiales. Changer d’instrument sélectionne son autre deck ; revenir restitue exactement les cartes acquises. La fiche du musicien affiche ses decks BandLive. Un spectacle capture uniquement les cinq cartes de l’instrument joué ; un replay conserve ce snapshot historique.

Après un vrai spectacle BandLive terminé, gagné ou perdu, un échange facultatif est proposé : choisir un participant, une des cinq cartes de son deck, puis une des trois spéciales de l’instrument joué. Les doublons sont autorisés ; remplacer une carte par elle-même est inutile et bloqué. Un seul échange pour tout le groupe et tout le spectacle, conservé après rechargement. Continuer sans échange passe définitivement ce choix. Aucune récompense pour un spectacle interrompu, une répétition ou un replay. Le spectacle classique n’est pas concerné.

Les deux spéciales par instrument privilégient les synergies de tempo. Batterie, basse, trompette et percussions en produisent ; guitare, chant et sax en bénéficient ou le consomment ; clavier fait les deux. Les decks initiaux restent identiques. Improvisation du sax coûte désormais 2 énergie. Les seuils se vérifient avant la carte et le tempo collectif est consommé une seule fois. Passage de relais réserve +4 puissance à la prochaine carte de puissance d’un autre musicien, pendant ce tour. Les conquêtes de Frappe syncopée excluent les réactions en chaîne. Écho mélodique demande deux cibles distinctes avant de payer. Les rangées utilisent les mêmes colonnes que la conquête.

Les barres et les prévisualisations vont de zéro à l’objectif : la puissance ajoute de la conquête, l’ennui en retire trois sans passer sous zéro, et les conquis restent remplis. Le format interne de résistance est conservé pour reprendre les sauvegardes existantes sans migration de leurs calculs.

La collection optionnelle `person.bandLiveDecks` et le snapshot `actor.bandLiveDeck` sont validés à l’import. Les anciennes personnes sans collection utilisent le deck initial. Les anciens spectacles déjà ouverts sans récompense enregistrée gardent leur comportement. Le build téléchargeable utilise une sauvegarde de test séparée et démarre sur un nouveau vrai show avec les decks initiaux.

Validation ciblée : `node --test tests/bandlive-decks.test.mjs` et `node tests/bandlive-decks-browser.test.mjs`.


## Public agrandi et choix du répertoire — intégrés en 0.7.18 après le test 0.7.17

La zone du public est agrandie sur ordinateur et mobile : jusqu’à 580 px sur un grand écran, avec des hauteurs adaptées aux écrans courts. Les quatre colonnes et les positions des spectateurs restent identiques ; le défilement reste disponible si nécessaire.

Les vrais spectacles proposent désormais toutes les compositions actives appartenant au groupe. La réservation ne verrouille plus la sélection BandLive. Les deux passages restent en place ; le deuxième propose les chansons non encore jouées, sauf lorsqu’une seule existe. Les résultats enregistrent les chansons réellement choisies. Les replays gardent leur répertoire historique et ne donnent aucun nouvel échange.

À la reprise d’un ancien spectacle encore en cours, le répertoire est déverrouillé sans modifier les cartes, les decks, la pioche, le tempo, la conquête, les tours déjà joués ni la chanson en cours. Les anciens spectacles terminés restent inchangés. Le fichier autonome prépare maintenant un groupe qui dispose déjà de plusieurs chansons.

## Premières parties et tête d’affiche — 0.7.18

La programmation de la soirée indique les groupes réellement réservés, dans l’ordre des créneaux, leurs rôles et leur état. Elle est consultable avant le départ et pendant BandLive. Le rôle du groupe apparaît aussi dans l’en-tête du show.

Après une prestation BandLive, **Continuer la soirée**, **Groupe suivant / terminer la soirée** et **Retour aux dates** ouvrent directement le groupe suivant dans BandLive s’il est compatible et si le module est toujours activé. Une interruption utilise le même enchaînement, sans récompense pour le groupe interrompu. Les créneaux annulés ou les formations absentes suivent les règles existantes du calendrier. Une jam, une setlist de plus de deux compositions ou une formation trop grande reste en classique, avec une explication. Le joueur peut alors choisir BandLive à l’arrivée d’un autre groupe compatible.

Le public est transmis par le circuit normal du jeu : **20 % de l’accueil précédent par spectateur, plafonné à 30 %**. Le public complet du lieu est conservé entre groupes puis projeté vers les 8, 10 ou 12 spectateurs interactifs. Les barres arrondies commencent donc partiellement remplies ; cet accueil initial est affiché dans la programmation. Les bonus de conquête sont redistribués pour chaque prestation. Les nouvelles sauvegardes mémorisent aussi les barres de départ pour un replay fidèle ; les anciens formats restent acceptés.

Chaque groupe garde ses propres musiciens, decks et chansons, deux passages, un résultat individuel et un seul échange de carte facultatif après sa prestation terminée. Continuer par une autre sortie décline aussi l’échange restant. La soirée ne donne pas de résultat ou d’échange supplémentaire global. La simulation classique ne démarre jamais BandLive automatiquement et le module reste désactivé par défaut.

Validation : moteur et sauvegardes des deux groupes, accueil transmis, replay, échanges séparés, interruptions, module désactivé et jam incompatible ; navigateur ordinateur et mobile, trois sorties du bilan, rechargement entre groupes et retour au quartier.


## Réactions persistantes — 0.7.20 (testées en privé)

Un nouveau spectacle attribue un statut aléatoire à chaque spectateur. Il persiste entre tours et chansons jusqu’au déclenchement effectif ; un autre statut différent est alors tiré au hasard, sans réagir à l’action qui vient de remplacer le précédent. Les spectateurs conquis cessent de réagir. Les bonus de conquête restent séparés, fixes et uniques.

| Statut | Déclenchement |
|---|---|
| S’ennuie | En fin de tour, perd 3 conquête. Aucun changement de statut si protégé ou déjà à zéro. |
| Attentif | La prochaine carte de puissance qui le touche reçoit +3. |
| Distrait | La prochaine carte de puissance qui le touche reçoit −3, sans résultat négatif. |
| Attend du rythme | Après 3 tempo réellement gagnés dans le même tour pendant ce statut, gagne 3 conquête en fin de tour. Dépenser ensuite le tempo ne l’annule pas ; le surplus au plafond ne compte pas. |
| Veut de la variété | La carte de puissance d’un deuxième musicien distinct dans le même tour reçoit +3. |
| Se laisse entraîner | Si un voisin orthogonal est conquis pendant ce statut, gagne 3 conquête en fin de tour, une fois. |

Les compteurs de conditions repartent à zéro au début du tour, pas le statut. Le hasard des réactions est indépendant de la pioche et sauvegardé. La prévisualisation applique le même moteur. Les spectacles déjà commencés dans un ancien build gardent leurs anciennes réactions jusqu’à leur fin ; les nouveaux spectacles utilisent les six statuts.

Validation : `tests/bandlive-reactions.test.mjs`, cartes, conquête, sauvegardes et interface mobile/ordinateur. Intégration avec la scène Minuit, proposée en PR après validation privée.


## Commandes et simulation — 0.7.20

Son, Voir les cartes et Simuler le show sont regroupés en haut à droite des informations du groupe et du morceau. Fin du tour reste en bas à droite; énergie et tempo sont en bas à gauche. Sur téléphone, les commandes du haut occupent la ligne juste sous les informations du show. Les deux emplacements « Chanson 1/2 » et « Chanson 2/2 » affichent les tours de leur propre chanson ; une durée inconnue reste « À choisir », sans inventer un total.

Pour un vrai show dont le répertoire dépasse six chansons actives, les six propositions sont sélectionnées par durée décroissante, puis par nombre de spectateurs du lieu aimant leur style. Les égalités restantes gardent l’ordre du répertoire. Le joueur choisit toujours les deux passages parmi ces propositions. Les groupes de six chansons ou moins gardent tout leur choix.

Simuler le show joue automatiquement le reste du spectacle, y compris les choix de chansons et les cibles de cartes, avec les mêmes règles et bonus. La stratégie est déterministe et ne garantit pas la victoire. Chaque passage est enregistré, le bilan et les conséquences sont appliqués une seule fois, puis l’échange de carte habituel reste disponible. Aucune récompense en répétition. Le fichier privé démarre dans un nouveau quartier normal ; activer BandLive dans Réglages, puis utiliser les groupes et les réservations du jeu.
