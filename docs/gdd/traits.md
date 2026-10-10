# DDD — Catalogue des traits V7

Version 0.7.1. Le même catalogue est utilisé par le moteur et Réglages. Les douze traits conditionnels sont un contenu de test; leurs nombres ne prétendent pas à un équilibrage définitif.

## Sources et seuils

Un trait permanent reste dans traits. Une association conditionnelle contient axe, seuil et identifiant de trait. Il devient actif à partir du seuil inclus et se retire strictement en dessous. La liste effective est l’union des sources : retirer une source conditionnelle ne retire pas une source permanente. Un même effet n’est compté qu’une fois par trait. Les effets numériques de traits différents s’additionnent avant les bornes et multiplicateurs du mécanisme.

Chaque personnage reçoit une ou deux associations distinctes, avec seuil entier de 25 à 85. L’axe est tiré entre détresse et exaltation; 80 % des associations utilisent une valence correspondante, 20 % la valence inverse. Ces associations persistent dans la sauvegarde. Elles n’ajoutent pas une troisième jauge et ne déclenchent aucune dispute au franchissement.

L’initialisation garde deux traits du catalogue historique; 20 % des personnages nouveaux reçoivent Alpha, 20 % Bêta, les autres aucun des deux. Alpha et Bêta sont incompatibles; la commande d’édition en retire l’autre. Le catalogue commun permet aussi des sources permanentes éditées pour les traits de test, sans nouvel éditeur de seuils.

## Catalogue complet

| Trait / identifiant | Catégorie | Effets réels |
|---|---|---|
| Oiseau de nuit / `night` | Historique | Coucher à 2 h plutôt qu’à 23 h. La durée de sommeil reste personnelle. |
| Timide / `shy` | Historique | Initiative sociale −0,35; acceptation −0,05. |
| Impulsif / `hot` | Historique | Résultat favorable −0,08; risque défavorable +0,12. |
| Perfectionniste / `perfectionist` | Historique | Satisfaction d’expression ×0,8; qualité d’écriture +8. |
| Chaleureux / `friendly` | Historique | Acceptation +0,08; résultat favorable +0,08. |
| Solitaire / `loner` | Historique | Érosion du besoin social divisée par deux; initiative sociale −0,3. |
| Oreille musicale / `virtuoso` | Historique | Apprentissage instrumental pendant la pratique/composition ×1,4. |
| Relax / `lazy` | Historique — débranché | Trait conservé; son ancien bonus de choix est débranché du sac V7. |
| Sensible / `sensitive` | Historique | Hausses émotionnelles ×1,3; intensité descriptive des souvenirs ×1,5. |
| Alpha / `alpha` | Rôle social | Poids de prise d’initiative +1; incompatible avec Bêta. |
| Bêta / `beta` | Rôle social | Poids de prise d’initiative −0,65; incompatible avec Alpha. |
| Hargneux / `irritable` | Prototype négatif | Acceptation −0,15; risque défavorable +0,18. |
| Renfermé / `withdrawn` | Prototype négatif | Initiative −0,6; acceptation −0,15. |
| À fleur de peau / `fragile` | Prototype négatif | Hausses émotionnelles +40 %; risque défavorable +0,08. |
| Distrait / `distracted` | Prototype négatif | Progression de composition ×0,75; résultat favorable −0,06. |
| Exigeant / `demanding` | Prototype négatif | Acceptation −0,1; qualité d’écriture +4. |
| Obstiné / `stubborn` | Prototype négatif | Risque défavorable +0,1; progression de composition +10 %. |
| Expansif / `expansive` | Prototype positif | Initiative +0,6; résultat favorable +0,08. |
| Audacieux / `daring` | Prototype positif | Poids des avances +1; naissance du lien ×1,25; risque défavorable +0,05. |
| Inspiré / `inspired` | Prototype positif | Progression de composition +25 %; qualité d’écriture +6. |
| Attentionné / `generous` | Prototype positif | Poids du soutien +2; résultat favorable du soutien +0,15. |
| Réceptif / `receptive` | Prototype positif | Acceptation +0,12; résultat favorable +0,06. |
| Apaisant / `calming` | Prototype positif | Poids du soutien +1; efficacité d’un soutien réussi +30 %. |

## Lecture des modificateurs

Les apports accept, positive et negative sont des points de probabilité : +0,08 vaut +8 points avant bornage/normalisation. Initiative, support et flirt sont des poids de sélection : ils ne garantissent ni action ni acceptation. Les apports writing sont additionnés à 1 pour la progression du projet; quality ajoute des points à sa qualité. Reaction augmente les hausses événementielles de chaque jauge; une baisse reste directe. Aucun modificateur ne touche la quantité ou la probabilité des jetons.

Oiseau de nuit règle le coucher à l’initialisation ou à son édition permanente. Perfectionniste et Oreille musicale conservent leur traitement dédié dans les actions. Sensible conserve aussi son intensité descriptive des souvenirs. Le trait Relax est visible et conservé sans effet de choix V7; son ancien bonus ne s’applique plus.

## Inspecter un personnage

La fiche présente chaque association : axe, seuil exact, état actif/inactif, condition de retrait et effet. Le catalogue de Réglages se filtre par nom ou effet, notamment Solitaire, Alpha et Inspiré. Une relation Inséparables est ciblée par partenaire et n’appartient pas à la liste globale de traits personnels.

Liens : [personnages](./personnages.md), [interactions](./interactions.md), [relations](./relations.md), [raccords](./raccords-v7.md).
