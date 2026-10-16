# Foule physique et atelier de cartes

Depuis la version 0.9.0, les nouveaux shows et répétitions utilisent une foule libre. Les positions déterminent les effets. Les shows déjà commencés gardent leur moteur et leur disposition; leur bouton **Laboratoire** permet d’essayer la nouvelle foule sur une copie.

## Jouer avec la foule

La visée affiche la zone réellement calculée par le moteur. Un rayon 1 vaut initialement 180 unités dans la salle, indépendamment de l’écran. Les cercles sont projetés avec la scène, sans changer les distances de combat. Les cartes peuvent cibler un spectateur, deux spectateurs, tout le public, une zone autour d’un spectateur ou un endroit libre au sol.

Le petit cercle à l’arrivée de l’arc indique la cible. Le grand cercle **À la conquête · rayon 1** montre la portée du pouvoir du spectateur, même si la carte ne le conquiert pas encore. Il devient plus marqué et indique **effet déclenché** lorsque l’aperçu prévoit réellement sa conquête. Cette portée potentielle ne signifie pas que la carte à cible unique touche tous les voisins.

Une zone peut avoir un cœur et une couronne : le cœur applique la pleine puissance et la pleine force, la couronne les multiplie par sa proportion. Chaque spectateur est compté une seule fois par effet. La puissance tient compte du style, de la réaction et des bonus présents. Les déplacements affectent aussi les corps des spectateurs déjà conquis.

Les anciennes rangées des cartes deviennent des zones de rayon 1,5. Onde de choc et Projecteur utilisent un rayon 1. Chœur du public choisit au plus un ou deux spectateurs admissibles, par distance puis identifiant stable, dans un rayon 1. Se laisse entraîner et les conditions de voisinage utilisent aussi les positions réelles.

Les effets d’une carte sont exécutés dans l’ordre affiché. Les conditions de tempo et d’alternance lisent le début de la carte; les conditions de conquête lisent ses conquêtes directes déjà produites. La réaction Se laisse entraîner se déclenche immédiatement à proximité d’une conquête. Les pouvoirs de conquête en chaîne sont résolus après les effets de la carte, aux positions alors obtenues. Une pioche conserve une main d’au plus cinq cartes. Énergie et tempo restent plafonnés à 3 et 10.

Les collisions déplacent les personnages. Une carte peut ajouter explicitement de la conquête aux collisions : chaque corps touché reçoit au plus une fois cette puissance par effet physique. Ces conquêtes ne comptent pas comme les conquêtes directes d’un effet de puissance pour ses récompenses conditionnelles.

## Disposition et laboratoire

La barre inférieure contient **Disposition**, **Laboratoire** et **Cartes**. Les ressources reviennent en haut à droite. Les grandes formations se parcourent par pages de six musiciens; leurs decks, acteurs et cartes restent tous dans le même show. La foule ne rétrécit pas pour afficher vingt-quatre musiciens à la fois. Sur téléphone, la salle peut défiler horizontalement.

Disposition permet de déplacer la foule et de régler les tailles. Déplacer un spectateur change réellement les voisins de combat; les corps se séparent au contact. **Annuler** restaure aussi les positions. Les réglages de taille et de mains de l’ancien profil sont repris; les positions de combat du show restent la référence de la nouvelle foule.

Trois paramètres règlent les impacts : force de lancement, adhérence au sol et rebond. L’unité de rayon se règle aussi. Les corps restent dans la zone du public, à l’écart de la scène. Les variations de taille des personnages sont visuelles : les corps de collision du moteur gardent leur rayon de 23 unités.

**Laboratoire** utilise une copie du show, avec ses cartes et sa foule. On peut y tester un impact faible, moyen ou fort : repousser, attirer, tourbillonner, bondir ou revenir élastiquement. Activer **Tester un impact**, puis viser le sol. Une carte envoyée depuis l’atelier se joue dans cette copie. **Recommencer le test** retrouve son état initial; **Quitter le labo** retrouve le véritable show sans dépense de carte, d’énergie ou d’XP.

L’export de scénario contient l’état initial, l’état courant et la disposition. Il peut être réimporté dans le laboratoire. L’export de disposition physique utilise la version 2 et inclut les positions de combat, la salle, les tailles et la physique. Les anciens exports à grille restent en version 1.

## Atelier de cartes

L’atelier contient les quatre entrées de chacun des huit instruments, ainsi que trois cartes neutres de démonstration. Les cartes neutres sont accessibles à tous les musiciens. Chaque carte acquise est ensuite jouée par son propriétaire.

- **Dupliquer la carte** crée un identifiant indépendant et zéro exemplaire de départ.
- **Retirer la carte** l’archive et met sa quantité de départ à zéro. Elle disparaît des futures propositions et reste valide dans les decks acquis et les anciens shows. Cocher **Voir les cartes retirées** permet de la restaurer.
- Le nom, le coût, la rareté, le niveau minimal et les exemplaires de départ sont modifiables. Les quantités de départ actives doivent totaliser cinq pour chaque instrument. Une quantité de départ neutre s’ajoute à chaque instrument.
- Les effets s’ajoutent, se retirent et se réordonnent. Chaque type montre uniquement ses paramètres. Le rayon et son cœur n’apparaissent que pour les cibles de zone. Les paramètres de tempo n’apparaissent que pour les formules qui l’utilisent.
- **Tester dans la foule** utilise le brouillon sur une copie. **Appliquer le catalogue** le conserve dans le monde pour les prochains shows. Le show en cours garde son propre catalogue figé.
- L’export/import JSON partage un catalogue validé. Les erreurs de quantités, rayons, coûts ou effets sont affichées avant application.

Les effets proposés sont puissance (fixe ou alimentée par le tempo), gain de tempo, gain d’énergie, pioche, soutien de prochaine puissance, changement de style, protection contre l’ennui et les cinq mouvements physiques. Les conditions sont toujours, seuil de tempo initial, alternance de musicien, présence d’un conquis proche et conquête directe par la carte.

Les nouvelles acquisitions proposent trois cartes admissibles de l’instrument ou neutres. Le niveau minimal filtre leur apparition; la rareté pondère le choix : commune 6, peu commune 3, rare 1, épique 0,3. La proposition est déterministe pour le musicien et la récompense, parmi les cartes ouvertes à son niveau actuel. La rareté ne change pas la probabilité de piger une carte déjà dans le deck. Les Note historiques restent les cartes de base, hors de ces propositions d’amélioration.

Pour les programmes très longs, la face affiche un résumé lisible; l’aperçu au survol présente toutes les règles, et l’atelier conserve chaque effet. L’éditeur autorise de 1 à 12 effets et au plus 256 cartes, archives comprises. La simulation automatique borne les boucles de pioche/remboursement créées par des cartes gratuites. Les règles n’accordent pas de garantie de victoire à cette simulation.

## Reprise et vérifications

Positions, réglages physiques, catalogue et définitions des cartes du show sont sauvegardés. La simulation physique utilise un pas fixe et un nombre borné d’étapes; le rendu anime son résultat. Les frames d’animation sont transitoires et ne grossissent pas les sauvegardes. Les effets réduits conservent le résultat final et les indications sans animation physique. Les mouvements décoratifs ne changent pas les positions du moteur.

`npm run test:physical` vérifie les rayons, les collisions, les 144 paires d’effets proposées, les acquisitions neutres, les boucles gratuites, les sauvegardes et l’égalité entre aperçu et résultat. Le parcours navigateur couvre ordinateur et tactile, duplication/retrait/restauration, paramètres filtrés, laboratoire, scénario exporté/importé, shows figés et formations jusqu’à vingt-quatre musiciens. Les anciens parcours de disposition et de ressources continuent de vérifier explicitement les sauvegardes à grille.
