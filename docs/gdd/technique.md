# Architecture, sauvegardes et contribution

Application statique sur GitHub Pages. `engine.mjs` simule le quartier; `life.mjs` gère carrière et commandes; `calendar.mjs` gère événements et candidatures; `social.mjs` les sessions, griefs et sacs personnalisés; `stage.mjs` résout la physique musicale. Le rendu et l’audio ne consomment pas le hasard du quartier.

Le monde se sauvegarde dans le navigateur. Export/import JSON permet de le déplacer. La V6 conserve les anciens catalogues, statistiques et engagements. Repos et décrocher fusionnent leurs compteurs; anciens créneaux et shows se conservent. Copie avant migration dans `garage-vivant-before-v6`. Une sauvegarde invalide n’est jamais écrasée automatiquement. Les préférences de modules sont séparées du monde.

La documentation VitePress et l’index de recherche du jeu proviennent des mêmes Markdown. Le pipeline construit et publie jeu et doc ensemble, avec le préfixe `/garage-vivant/docs/`. Notes lues stockées par identifiants; ouvrir la page ne lit pas toutes les notes.

Pour contribuer : branche dédiée, commits décrivant problème et résultat, auteur correctement configuré, tests adaptés, documentation actualisée. Ouvrir une PR vers main; publication sous contrôle du propriétaire. Pas de multijoueur dans cette version; les identifiants et commandes restent sérialisables.

Liens : [guide](../index.md), [temps](./temps.md), [shows](./shows.md).
