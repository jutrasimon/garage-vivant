# Foule physique et atelier de cartes

Depuis la version 0.9.0, les nouveaux shows et répétitions utilisent une foule libre. Les positions déterminent les effets. Les shows déjà commencés gardent leur moteur et leur disposition; leur bouton **Laboratoire** permet d’essayer la nouvelle foule sur une copie.

## Jouer avec la foule

Pour une carte visant **un endroit au sol**, un seul arc rejoint le centre du cercle sous le curseur ou le doigt. Il reste à cet endroit en passant au-dessus d’un spectateur. Le tir rejoint ce centre, puis une onde se propage dans le rayon et son cœur; les spectateurs reçoivent les effets de la zone. Une carte mixte avec du tempo conserve ce seul arc. L’aperçu indique toujours les personnages affectés, les collisions et les conquêtes en chaîne.

La visée affiche la zone réellement calculée par le moteur. Un rayon 1 vaut initialement 180 unités dans la salle, indépendamment de l’écran. Les cercles sont projetés avec la scène, sans changer les distances de combat. Les cartes peuvent cibler un spectateur, deux spectateurs, tout le public, une zone autour d’un spectateur ou un endroit libre au sol.

Le petit cercle à l’arrivée de l’arc indique la cible. Le grand cercle montre la portée du pouvoir du spectateur. Avant de choisir une carte, cette portée est théorique. Pendant la visée, un cercle discret en pointillés et la mention **Pouvoir inactif · encore X ♥** indiquent qu’il manque encore des cœurs après la carte. Si le calcul complet, réactions et collisions comprises, prévoit la conquête, le cercle devient **rose plein et lumineux**, marqué **CONQUÊTE ! · effet déclenché**, et la fiche annonce le pouvoir et ses cibles. Un aperçu 15/16 reste inactif : il manque 1 cœur. Cette portée potentielle ne signifie pas que la carte à cible unique touche tous les voisins.

La fiche d’effet évite les cercles entiers, y compris une zone au sol et sa portée de conquête supplémentaire. Le placement reste stable pendant les petits mouvements de visée. Au besoin, une fiche compacte conserve le résultat, le pouvoir imminent et ses cibles en masquant les règles secondaires. Si un rayon remplit presque tout un petit écran et qu’aucun placement extérieur n’est possible, elle minimise son recouvrement en donnant priorité à la visibilité du personnage ciblé. Le survol simple et la carte sélectionnée suivent aussi ce placement.

Les rayons lisent les positions au moment précis où chaque effet agit. Si une conquête en déclenche une autre, son cercle apparaît aussi, identifié **En chaîne**. Un personnage peut donc recevoir un effet secondaire en dehors du premier cercle : son badge précise **Choc**, **En chaîne** ou **Réaction**. Si un déplacement doit d’abord le placer dans une zone, une flèche et un repère translucide indiquent sa position prévue. L’arc rose de frappe directe reste réservé aux cibles musicales de la carte. Sélection et glisser utilisent le même aperçu sombre, avec le même gain et les mêmes pouvoirs annoncés.

Pour **reposer une carte**, ramène-la dans une main ou relâche-la hors d’une cible valide. Après une sélection par clic ou tap, utilise **Reposer la carte**, reclique la même carte ou clique sur un espace vide de la scène. **Échap** et le clic droit annulent aussi la visée, même entre deux cibles. Aucun cœur, tempo, énergie ou carte n’est dépensé. Les popups et les marques de visée disparaissent; un nouveau geste permet de sélectionner et jouer normalement. Sur téléphone, un tap sélectionne la carte et un mouvement de huit pixels commence le glisser. Un clic ou tap dans le public reste une commande de jeu pour une carte collective ou visant le sol.

Une zone peut avoir un cœur et une couronne : le cœur applique la pleine puissance et la pleine force, la couronne les multiplie par sa proportion. Chaque spectateur est compté une seule fois par effet. La puissance tient compte du style, de la réaction et des bonus présents. Les déplacements affectent aussi les corps des spectateurs déjà conquis.

Les anciennes rangées des cartes deviennent des zones de rayon 1,5. Onde de choc et Projecteur utilisent un rayon 1. Chœur du public choisit au plus un ou deux spectateurs admissibles, par distance puis identifiant stable, dans un rayon 1. Se laisse entraîner et les conditions de voisinage utilisent aussi les positions réelles.

Les effets d’une carte sont exécutés dans l’ordre affiché. Les conditions de tempo et d’alternance lisent le début de la carte; les conditions de conquête lisent ses conquêtes directes déjà produites. La réaction Se laisse entraîner se déclenche immédiatement à proximité d’une conquête. Les pouvoirs de conquête en chaîne sont résolus après les effets de la carte, aux positions alors obtenues. Une pioche conserve une main d’au plus cinq cartes. Énergie et tempo restent plafonnés à 3 et 10.

Chaque effet de puissance repousse ses cibles, même avec une carte ordinaire. La force dépend de la puissance de la frappe; une carte de zone repousse depuis son centre, une frappe individuelle depuis le musicien. Les spectateurs percutés reçoivent de la vitesse et peuvent en percuter d’autres. Les spectateurs déjà conquis restent des corps physiques.

Dans **Cartes → Effet Puissance → Force de repoussement**, règle le recul propre à la carte : **0** le supprime, **0,5** le réduit de moitié, **1** garde le recul normal, **2** le double et **3** le triple. Chaque effet de puissance d’une carte composée possède son réglage. Ce multiplicateur ne change pas les cœurs de la frappe; il peut modifier les chocs et donc leurs gains de conquête. La force de base et la force générale des frappes dans Disposition restent actives; régler cette dernière à 0 désactive tous les reculs automatiques. Un effet **Repousser** ajouté séparément garde son champ **Force**, même si le recul de la puissance est à 0.

Les catalogues et les shows antérieurs sans ce champ utilisent 1 sans être réécrits. Le laboratoire permet de tester immédiatement le brouillon; appliquer le catalogue réserve ses nouveaux réglages aux prochains shows.

Un choc dont la vitesse relative atteint le seuil donne par défaut **+2 cœurs au spectateur percuté**. Le lanceur ne reçoit pas automatiquement de cœur en frappant quelqu’un; lors d’un choc frontal, les deux peuvent en recevoir. Une paire ne récompense qu’une fois par impulsion, même si les corps restent au contact. Une autre paire touchée en chaîne peut donner un autre gain. Le gain est plafonné à la conquête restante et peut déclencher la conquête et ses réactions. Les conditions de voisinage immédiates lisent la position au moment du choc. Les conquêtes par collision ne comptent pas comme des conquêtes directes pour les récompenses conditionnelles de la carte.

Le paramètre de collision d’une carte ajoute son bonus au gain de base de la foule. L’aperçu inclut les cœurs des chocs et leur total; les indications **IMPACT** et **+X ♥** apparaissent pendant les contacts. Le laboratoire utilise exactement la même règle sur sa copie.

## Disposition et laboratoire

La barre inférieure contient **Disposition**, **Laboratoire** et **Cartes**. Les ressources reviennent en haut à droite. Les grandes formations se parcourent par pages de six musiciens; leurs decks, acteurs et cartes restent tous dans le même show. La foule ne rétrécit pas pour afficher vingt-quatre musiciens à la fois. Sur téléphone, la salle peut défiler horizontalement.

Disposition permet de déplacer la foule et de régler les tailles. Déplacer un spectateur change réellement les voisins de combat; les corps se séparent au contact. **Annuler** restaure aussi les positions. Les réglages de taille et de mains de l’ancien profil sont repris; les positions de combat du show restent la référence de la nouvelle foule.

Les paramètres exposés dans **Disposition → Foule physique** sont : force de lancement, adhérence au sol, rebond, force des frappes, rayon de contact, seuil du choc en unités par seconde et cœurs au contact. Les valeurs initiales sont respectivement 420, 3, 0,28, 0,75, 32, 60 et 2. Mettre la force des frappes à zéro supprime le recul automatique; mettre les cœurs au contact à zéro supprime le gain de base (une carte peut encore apporter son bonus explicite). L’unité de rayon des zones se règle séparément.

Les corps restent dans la zone du public, à l’écart de la scène. Les tailles visuelles ne changent pas automatiquement le rayon de contact : ce réglage distinct permet de l’adapter. Les premières sauvegardes physiques reçoivent les nouveaux paramètres; leurs anciennes valeurs par défaut trop faibles sont actualisées. Les réglages personnalisés et les cartes, positions et cœurs sont conservés.

**Laboratoire** utilise une copie du show, avec ses cartes et sa foule. On peut y tester un impact faible, moyen ou fort : repousser, attirer, tourbillonner, bondir ou revenir élastiquement. Activer **Tester un impact**, puis viser le sol. Une carte envoyée depuis l’atelier se joue dans cette copie. **Recommencer le test** retrouve son état initial; **Quitter le labo** retrouve le véritable show sans dépense de carte, d’énergie ou d’XP.

**Tester ici** injecte immédiatement le brouillon dans la scène du laboratoire. Tu peux changer de carte ou d’instrument sans recommencer le show : positions, conquête, réactions, tempo, tour et réglages physiques restent dans leur état courant. L’énergie revient à 3, la carte testée passe devant les autres dans sa main et la main reste limitée à cinq cartes. L’ancienne carte temporaire retrouve sa définition d’origine; le scénario garde une seule carte de test et reste exportable/réimportable.

**Rejouer la carte** la remet en main en un clic, sans réinitialiser la foule. **Recommencer le test** revient à l’état du dernier essai avant sa frappe. **Quitter le labo** retrouve le show réel intact. Si le show de test est terminé, un nouvel essai remet la foule sur pied pour pouvoir continuer.

L’export de scénario contient l’état initial, l’état courant et la disposition. Il peut être réimporté dans le laboratoire. L’export de disposition physique utilise la version 2 et inclut les positions de combat, la salle, les tailles et la physique. Les anciens exports à grille restent en version 1.

## Atelier de cartes

L’atelier contient les quatre entrées de chacun des huit instruments, ainsi que trois cartes neutres de démonstration. Les cartes neutres sont accessibles à tous les musiciens. Chaque carte acquise est ensuite jouée par son propriétaire.

- **Dupliquer la carte** crée un identifiant indépendant et zéro exemplaire de départ.
- **Retirer la carte** l’archive et met sa quantité de départ à zéro. Elle disparaît des futures propositions et reste valide dans les decks acquis et les anciens shows. Cocher **Voir les cartes retirées** permet de la restaurer.
- Le nom, le coût, la rareté, le niveau minimal et les exemplaires de départ sont modifiables. Les quantités de départ actives doivent totaliser cinq pour chaque instrument. Une quantité de départ neutre s’ajoute à chaque instrument.
- Les effets s’ajoutent, se retirent et se réordonnent. Chaque type montre uniquement ses paramètres. Le rayon et son cœur n’apparaissent que pour les cibles de zone. Les paramètres de tempo n’apparaissent que pour les formules qui l’utilisent.
- Changer un effet ou une condition conserve la position du formulaire et le focus au clavier. Choisir une autre carte revient au début de sa fiche.
- Chaque champ possède une aide : survole le champ ou son **?**, utilise le clavier pour atteindre le **?**, ou touche-le sur téléphone. L’aide explique le réglage, ses valeurs permises et ses interactions. **Échap** ferme d’abord l’aide, puis l’atelier.
- **Rayon extérieur** mesure la distance du centre au bord : 1 vaut une unité de rayon de la salle (180 au départ, réglable dans Disposition). Le **rayon du cœur** utilise cette même unité et ne peut pas dépasser l’extérieur; 0 rend la zone uniforme. La **puissance de la couronne (%)** s’applique à la puissance et à la force hors du cœur : saisir 50 signifie 50 %, pas 5 000 %. Le format JSON conserve sa proportion habituelle (0,5 pour 50 %).
- Une valeur vide, hors limites ou un cœur trop grand affiche une erreur près du champ. L’aperçu attend sa correction et les boutons de test et d’application sont suspendus. La saisie conserve le curseur et les modifications en brouillon.
- Les limites numériques sont visibles sous chaque champ. **Gagner du tempo** accepte de 1 à 100 et **Frappes** de 1 à 100 : +12 tempo et 6 frappes sont valides. La jauge du show reste plafonnée à 10, sans réserve de surplus; à 8, un effet +12 ne gagne réellement que 2, y compris pour les réactions de rythme. Les frappes partagent la puissance totale plutôt que de la multiplier.
- **Tester ici** utilise immédiatement le brouillon sur la scène du labo, sans attendre un autre show ni appliquer le catalogue.
- **Appliquer au show** modifie la carte sélectionnée dans le vrai show physique en cours. Toutes ses copies utilisent les nouveaux effets, le coût, la cible et la force aux prochaines frappes; les frappes déjà jouées restent dans l’historique. Une copie rejoint la main au besoin, sans dépasser cinq cartes. Une carte nouvelle remplace un emplacement du musicien de son instrument, ou de n’importe quel musicien si elle est Neutre. La foule, le tour, le tempo, l’énergie et la physique sont conservés. Depuis le labo, cette commande revient au show réel. La modification est sauvegardée avec ce show et résiste au rechargement.
- **Appliquer le catalogue** conserve l’ensemble du brouillon pour les prochains shows et les decks de départ. Cette commande reste distincte de l’application au show courant. Les anciens shows à grille peuvent toujours utiliser le labo; l’application directe vise les shows physiques en cours.
- L’export/import JSON partage un catalogue validé. Les erreurs de quantités, rayons, coûts ou effets sont affichées avant application.

Les effets proposés sont puissance (fixe ou alimentée par le tempo), gain de tempo, gain d’énergie, pioche, soutien de prochaine puissance, changement de style, protection contre l’ennui et les cinq mouvements physiques. Les conditions sont toujours, seuil de tempo initial, alternance de musicien, présence d’un conquis proche et conquête directe par la carte.

Les nouvelles acquisitions proposent trois cartes admissibles de l’instrument ou neutres. Le niveau minimal filtre leur apparition; la rareté pondère le choix : commune 6, peu commune 3, rare 1, épique 0,3. La proposition est déterministe pour le musicien et la récompense, parmi les cartes ouvertes à son niveau actuel. La rareté ne change pas la probabilité de piger une carte déjà dans le deck. Les Note historiques restent les cartes de base, hors de ces propositions d’amélioration.

Pour les programmes très longs, la face affiche un résumé lisible; l’aperçu au survol présente toutes les règles, et l’atelier conserve chaque effet. L’éditeur autorise de 1 à 12 effets et au plus 256 cartes, archives comprises. La simulation automatique borne les boucles de pioche/remboursement créées par des cartes gratuites. Les règles n’accordent pas de garantie de victoire à cette simulation.

## Reprise et vérifications

Positions, réglages physiques, catalogue et définitions des cartes du show sont sauvegardés. La simulation physique utilise un pas fixe et un nombre borné d’étapes; le rendu anime son résultat. Les frames d’animation sont transitoires et ne grossissent pas les sauvegardes. Les effets réduits conservent le résultat final et les indications sans animation physique. Les mouvements décoratifs ne changent pas les positions du moteur.

`npm run test:physical` vérifie les rayons, les collisions, les 144 paires d’effets proposées, les acquisitions neutres, les boucles gratuites, les sauvegardes et l’égalité entre aperçu et résultat. Le parcours navigateur couvre ordinateur et tactile, duplication/retrait/restauration, paramètres filtrés, laboratoire, scénario exporté/importé, shows figés et formations jusqu’à vingt-quatre musiciens. Les anciens parcours de disposition et de ressources continuent de vérifier explicitement les sauvegardes à grille.
