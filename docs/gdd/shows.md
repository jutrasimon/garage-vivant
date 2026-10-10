# DDD — Shows, calendrier et public

## Quatre occasions continues

Le calendrier montre toujours quatre dates futures. Chaque événement a un identifiant permanent. Tous les quatre événements, une grosse fête accueille trois bands; les autres soirées ont deux créneaux. Espacement de deux jours; une première annonce laisse trois jours pour décider. Les dates terminées restent dans l’historique.

Les premières parties disposent de 10 minutes musicales, les têtes d’affiche de 20. Chaque morceau ou improvisation vaut 4 minutes. Ce temps musical sert à organiser la soirée; l’horloge du quartier reste gelée pendant son visionnement. [Temps](./temps.md).

## Réservations autonomes

Un band a au plus une réservation future **ou** candidature en attente. Une petite scène fonctionne au premier arrivé avec deux confirmations. Une grosse scène ferme les inscriptions et choisit à T−2 jours. Adéquation au public, coordination, maîtrise du répertoire, réputation, goût de découverte et complémentarité de l’affiche donnent les poids d’un tirage reproductible.

Les bands évaluent les dates toutes les trois heures au plus, selon ambition, discipline, préparation, énergie, risque et moral. Ils peuvent attendre. Le joueur peut réserver, retirer ou annuler lui-même. Les membres gardent le droit de refuser. Un refus d’organisateur libère l’engagement et donne −8 de moral temporaire sur deux jours, sans perte de réputation.

## Direct et cartes

Le quartier se met en pause quand le spectacle commence. La vue s’ouvre au début à ×1 et attend « Lancer le show ». Chaque musicien possède 8–10 cartes; cinq sont pigées sans remise. Rythme, impact, émotion et soutien produisent des effets réels. La carte explique son effet pendant une brève apparition; elle disparaît avant que le musicien vise et tire dans la foule. Les fans touchés et les gains sont visibles au contact et consultables dans l’historique.

Une chanson dure 30 secondes à ×1; ×0,5/1/2/4 changent uniquement la lecture. Pause, inspection et onglet navigateur masqué suspendent le show. Sauter résout le même tirage; Revoir n’ajoute aucune récompense. Le quartier reprend au même instant simulé, sans rattrapage.

## Public et bilan

Les fans ont styles préférés, instrument sensible et émotion. Un groove augmente la portée des impacts; deux préparations permettent un crescendo. Une réaction majeure ne survient qu’une fois par fan dans une prestation. L’euphorie produit des mini-cubes persistants qui restent une seule personne. Le public est conservé entre les chansons du band.

Accueil mesure la réception du public. Qualité de composition et interprétation restent distinctes. Une prestation sous les attentes peut diminuer la réputation et le moral du band; les petites scènes sont plus tolérantes. Les gains sont appliqués une fois par prestation, pas par chanson. L’historique expose les morceaux, membres et variations. Les douze dernières prestations gardent la trace de leur dernière chanson pour replay.

Liens : [musique](./musique.md), [relations](./relations.md), [sauvegardes](./technique.md).

## Voir les enchaînements

Les piles sous les musiciens représentent leurs decks. La carte active apparaît brièvement au même emplacement. Elle disparaît avant la visée; la trajectoire part du musicien vers sa cible dans la foule. Les cartes précédentes restent consultables dans « Cartes jouées », sans pile par-dessus la scène. Le deck contient 8 à 10 cartes et la main de cinq cartes est déterminée au début par un mélange reproductible sans remise; seules les cartes déjà jouées sont révélées dans l’inspection.

Cinq phrases rythment chaque chanson. Pour un quartet, vingt cartes disposent d’environ 26 secondes, plus le départ et les dernières réactions. Le temps de présentation est indépendant du temps musical du moteur : les zones, déplacements et résultats conservent leurs règles. Les animations n’utilisent aucun tirage aléatoire du monde.

- **Groove** : un cercle correspond au rayon réel de la zone. Sa durée de lecture restante est affichée. Un impact dont la cible se trouve dedans gagne 22 % de puissance et 55 unités de rayon.
- **Crescendo** : compteur collectif de trois charges maximum. À deux charges ou plus, le prochain impact consomme le compteur : puissance +40 %, rayon +30. Avec un groove, puissance ×1,22 ×1,40, soit environ +71 %.
- **Soutien** : trois protections maximum. La prochaine erreur en consomme une. La carte affiche la conséquence réellement atténuée, notamment énergie −4 au lieu de −8 pour la gueule de bois.
- **Émotion** : puissance multipliée par 1 + intensité ×0,007. Une émotion compatible chez le fan ajoute ×1,20.
- **Public** : gains affichés près des jauges. Une euphorie donne jusqu’à +13 aux voisins dans 175 unités; une émotion donne jusqu’à +5 et +0,18 de réceptivité; une transe crée une zone rythmique de bonus ×1,40. Les jauges plafonnent à 100.

Les zones sont représentées par des cercles de rayon exact, même si des lumières donnent une profondeur à la scène. Les cubes restent carrés. Cliquer une carte donne les cibles et gains enregistrés, pas une estimation. Cliquer un fan, un musicien ou son deck met la lecture en pause; X, Échap ou clic extérieur rétablit l’état précédent, y compris une pause manuelle. Les effets réduits conservent les cibles, jauges, ressources et résultats.

### Présentation intégrée (V0.6.4)

Le show remplit l’espace sous la navigation. Le nom du groupe et la chanson se trouvent dans l’arène, avec la progression en haut et les ressources et commandes au bas. Le transport du quartier se retire pendant cette vue. La carte garde une taille et un emplacement fixes; elle disparaît avant la trajectoire du musicien vers la cible annoncée dans la foule. Le canvas utilise une transformation uniforme, avec une place réservée à la carte, et le clic utilise la même transformation. Aucun résultat de simulation ne dépend de cette mise en page.

Le bouton **Son : ON/OFF** est visible à côté de la pause, sans ouvrir Options. Le tir a une attaque courte; le contact ajoute un son grave et un claquement. Recul, projectile, flash, onde et « BANG ! » accompagnent le contact sans modifier les règles. « Effets réduits » garde les indications et gains, en retirant secousses, recul et éclats.


## Raccord V7 des émotions et du sommeil

Les effets du bilan sur les personnages utilisent exaltation base +22 à partir d’un score de 45, détresse base +14 sinon, avec réaction personnelle. L’énergie perd 15 plus les erreurs cumulées des morceaux; confiance ajoute +2 ou −1 entre partenaires, complicité +2, et au moins deux erreurs ajoutent tension +3. Les coûts Tout donner et le moral collectif restent conservés.

Les cartes émotionnelles gardent leur puissance liée à l’intensité de la chanson. Pour les nouvelles prestations `rulesVersion: 7`, la compatibilité ×1,20 reconnaît explicitement exaltation avec les sensibilités musicales joie, enthousiasme ou affection du public, et détresse avec tristesse, colère ou peur. C’est une correspondance de deux axes larges, pas une reconstitution des six émotions du personnage. Une chanson historique garde sa compatibilité exacte. Une prestation sauvegardée de règles antérieures conserve son calcul exact et son résultat; le replay historique reste identique.

Le public et ses sensibilités ne sont pas le moteur émotionnel des voisins. Aucun nouveau type de carte, fan ou récompense n’est ajouté. Le moteur de trajectoires et la présentation V0.6.4 sont conservés.

Un engagement nocturne prend priorité sur le coucher. Les réservations de jetons non commencées sont rendues au départ; un sommeil interrompu peut reprendre après l’engagement. Les seuils de musiciens présents et fonctionnels restent actifs, sans récupération cachée. Les confirmations de candidature et répétition conservent leur probabilité de carrière, distincte du tirage social du quartier.
