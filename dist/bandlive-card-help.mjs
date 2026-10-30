const fields={
 wavePower:'Dans l’arène isolée, cœurs reçus quand le front de la vague atteint chaque spectateur actif. 0 pousse seulement. Les bonus de puissance musicaux ne modifient pas ce montant. Hors de l’arène, ce champ est sans effet.',
 category:'Filtre la liste par instrument. Neutre regroupe les cartes accessibles à tous les musiciens.',
 name:'Nom affiché sur la carte, dans le deck et dans les propositions d’amélioration. De 1 à 70 caractères.',
 instrument:'Instrument qui peut obtenir cette carte. Neutre la propose à tous les musiciens. Duplique une carte historique pour changer son instrument.',
 cost:'Énergie dépensée une seule fois pour jouer la carte, quel que soit son nombre d’effets. Le maximum d’énergie du show est 3.',
 rarity:'Fréquence relative dans les propositions d’amélioration : commune 6, peu commune 3, rare 1, épique 0,3. Ne change pas la pioche des cartes déjà acquises.',
 minLevel:'Niveau du musicien requis pour que la carte puisse être proposée en amélioration. Ne bloque pas une carte déjà acquise ou incluse dans son deck de départ.',
 starter:'Nombre de copies dans un nouveau deck. 0 exclut la carte du départ. Le total doit être de 5 par instrument; les copies neutres comptent pour chaque instrument.',
 target:'Choisit où jouer la carte : un ou deux spectateurs, tout le public, un cercle centré sur un spectateur, ou un cercle placé librement au sol. Les gains d’énergie, de tempo et de pioche restent globaux.',
 radius:'Distance du centre au bord de la zone, pas son diamètre. Rayon 1 = une unité de rayon de la salle (180 au départ, réglable dans Disposition). Rayon 2 couvre deux fois cette distance. Le cercle est visible pendant la visée.',
 coreRadius:'Zone centrale à pleine puissance et pleine force. 0 donne une zone uniforme. Utilise la même unité que le rayon extérieur et ne peut jamais le dépasser. Exemple : extérieur 1, cœur 0,5.',
 outerScale:'Pourcentage de puissance et de force appliqué entre le cœur et le rayon extérieur. 50 % = la moitié; 100 % = autant que le cœur; 0 % = aucune puissance ni force dans la couronne. Sans cœur, toute la zone reste uniforme.',
 formula:'Fixe : puissance de base seulement. Ajouter tout le tempo : ajoute le tempo disponible multiplié par la puissance par tempo, puis le consomme. Consommer du tempo : même calcul, avec une limite de consommation.',
 limit:'Quantité maximale de tempo consommée par cet effet. S’il reste moins de tempo, seul le tempo disponible est consommé.',
 multiplier:'Puissance ajoutée pour chaque point de tempo consommé, en plus de la puissance de base.',
 strikes:'Répartit la puissance totale entre ce nombre de frappes. Exemple : 6 puissance en 3 frappes donne 2 + 2 + 2, pas 18. Une cible conquise ne reçoit plus de frappes.',
 impactStrength:'Multiplie le repoussement de cet effet de puissance : 0 = aucun recul, 0,5 = moitié, 1 = normal, 2 = double, 3 = triple. Ne change pas les cœurs de la frappe; des collisions plus fortes peuvent donner des cœurs en plus. La puissance et les réglages de Disposition restent la base : une force générale des frappes à 0 désactive ce recul. Un effet Repousser ajouté séparément garde sa propre force.',
 other:'Tous : le prochain effet de puissance du groupe peut utiliser le bonus. Un autre musicien : le bonus attend une carte de puissance jouée par un musicien différent de celui-ci.',
 duration:'Ce tour : le style disparaît à la fin du tour. Cette chanson : il reste jusqu’à sa fin. Le style adopté est celui de la chanson en cours.',
 strength:'Multiplicateur de la force du mouvement. 1 = force normale, 0,5 = moitié, 2 = double. La force de base, l’adhérence, le rebond et les contacts se règlent dans Disposition.',
 collisionPower:'Cœurs ajoutés au gain de base de la foule pour les contacts assez forts causés par cet effet. Exemple : base 2 + bonus 3 = jusqu’à 5 cœurs pour le spectateur percuté. Une paire ne récompense qu’une fois par impulsion.',
 conditionValue:'Tempo minimal au début de la carte. Les gains ou dépenses produits par ses effets ne changent pas ce test.',
 'threshold-tempo':'Tempo minimal au début de la carte pour ajouter le bonus à la puissance. Le tempo n’est pas dépensé par ce seuil.',
 'threshold-bonus':'Puissance ajoutée à la base si le seuil est atteint. Ce bonus ne remplace pas la puissance de base.',
 threshold:'Ajoute un bonus de puissance si le tempo au début de la carte atteint le seuil choisi. Les champs Seuil et Bonus apparaissent quand cette option est cochée.',
 retired:'Affiche aussi les cartes archivées de cet instrument pour les consulter ou les restaurer. Elles restent jouables dans les decks déjà acquis.',
};
const effects={
 power:'Augmente la conquête des spectateurs ciblés, en tenant compte du style, des réactions et des bonus. La force de repoussement règle le recul propre à cet effet, en plus des réglages de la foule.',
 tempo:'Ajoute du tempo au groupe. La carte peut demander jusqu’à 100, mais la jauge reste plafonnée à 10 : le surplus est perdu. Seul le tempo réellement gagné compte pour les spectateurs qui attendent du rythme.',
 energy:'Rend de l’énergie au groupe, sans dépasser 3. Le coût de la carte est payé avant ses effets.',
 draw:'Pioche des cartes du deck vers la main, sans dépasser cinq cartes en main. Les places manquantes limitent la pioche.',
 boost:'Prépare un bonus pour le prochain effet de puissance admissible du groupe. Il ne donne pas de conquête immédiatement.',
 style:'Les spectateurs ciblés adoptent le style de la chanson pendant la durée choisie.',
 protect:'Protège les spectateurs ciblés de la perte de conquête due à l’ennui à la fin de ce tour.',
 push:'Éloigne les corps du centre de l’effet. Les collisions transmettent le mouvement, y compris aux spectateurs déjà conquis.',
 split:'Pousse toute la foule horizontalement, loin de la ligne verticale visée : à gauche vers la gauche, à droite vers la droite. Sur la ligne, le corps part à droite. Dans l’arène isolée, les conquis sont traversés sans impact. Hors arène, ils restent physiques. Ignore le rayon de la carte. Choisis « Endroit au sol » pour placer librement la ligne; sinon elle passe par la cible ou le milieu du terrain.',
 pull:'Attire les corps vers le centre de l’effet. Les collisions peuvent déplacer et conquérir d’autres spectateurs.',
 vortex:'Lance les corps autour du centre de l’effet avec une rotation. Les contacts utilisent les mêmes règles que les autres mouvements.',
 jump:'Fait bondir les corps et les déplace depuis le centre de l’effet. Les collisions peuvent transmettre le mouvement.',
 return:'Projette les corps, puis les attire élastiquement vers leur position de départ. Les obstacles et les contacts peuvent modifier leur arrivée.',
};
const conditions={
 always:'L’effet se joue à chaque utilisation de la carte.',
 tempo:'Compare le seuil au tempo du début de la carte, avant tous ses effets.',
 alternate:'Nécessite une carte précédente jouée ce tour par un autre musicien. La première carte du tour ne remplit pas cette condition.',
 neighbor:'Nécessite un spectateur conquis dans le rayon autour de la cible au début de la carte. Une carte Tout le public vérifie la présence d’un conquis dans la foule.',
 conquest:'Nécessite une conquête directe déjà produite par un effet précédent de cette carte. Les conquêtes par collision ou par chaîne ne comptent pas; place cet effet après la puissance.',
};
export function cardFieldHelp(key,effect){
 if(key==='type')return 'Les effets se jouent de haut en bas, puis les pouvoirs de conquête en chaîne se résolvent. '+effects[effect.type];
 if(key==='when')return 'Condition de déclenchement de cet effet. '+conditions[effect.when];
 if(key==='amount')return {power:'Puissance de base, avant le tempo, le style, les réactions et les bonus.',tempo:'Gain demandé par cet effet. Exemple : +12 tempo avec une jauge à 8 donne réellement +2, pour atteindre 10. Le surplus est perdu et ne déclenche aucune réaction supplémentaire.',energy:'Énergie rendue par cet effet. Le total du groupe ne peut pas dépasser 3.',draw:'Nombre de cartes à piocher, dans la limite des cinq places de la main.',boost:'Puissance ajoutée au prochain effet de puissance admissible.'}[effect.type];
 return fields[key];
}
