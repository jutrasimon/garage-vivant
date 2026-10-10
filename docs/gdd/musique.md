# DDD — Musique, groupes et progression

Version 0.7.0. La V7 raccorde le moteur musical existant aux deux axes et aux traits; elle n’ajoute pas un nouveau moteur de composition.

## Apprentissage et besoins

Pratiquer et Composer augmentent la compétence instrumentale de base `0,009 × Apprentissage` par minute, multipliée par 1,4 pour Oreille musicale. Composer ajoute `0,018 × Apprentissage` de compétence d’écriture; Jammer ajoute `0,013 × Apprentissage` instrumentale. Chaque gain de compétence passe par `gain × max(0,16; 1 − compétence/115)` : la progression ralentit à haut niveau. Les besoins créatifs sont dans le [DDD Actions](./actions.md).

## Projets persistants

Composer garde une idée, son titre, genre, sources et travail entre séances et interruptions. La cible vaut `300 + (100−discipline) ×0,75`. Le travail par minute vaut `Rythme de composition × (0,85 + discipline/300) × max(0,1; 1 + traits writing)`. Idée sous 25 %, ébauche ensuite, prête à 100 %. À la fin d’une séance ayant atteint la cible, créer une seule chanson et clore le projet.

Les 75 premières minutes créatives échantillonnées fixent axe, intensité moyenne et sources. Ensuite, la phase de développement ne lave pas l’origine. Exaltation et détresse produisent respectivement les tonalités exaltée et tourmentée; sous 10 d’intensité, posée. Les titres combinent les anciens vocabulaires positifs ou négatifs, le lieu, groupe et souvenirs, sans nouvelle jauge. Une idée issue d’une jam peut nourrir le prochain projet une fois par auteur pendant 24 heures.

Les chansons historiques conservent intégralement leurs six anciennes nuances. **La diversité de six émotions n’est pas reproduite par deux nombres.** Ce raccord de nuances est signalé comme débranché; le genre, les origines, qualité et résultats musicaux restent actifs.

## Qualité et écho public

Qualité = maîtrise + expression + ensemble + modificateurs qualité des traits + variation − surcharge, bornée 0–100 puis arrondie :

| Terme | Calcul |
|---|---|
| Maîtrise | écriture ×0,45 + instrument ×0,25 |
| Expression | intensité/100 × (6 + créativité ×0,12) |
| Ensemble | moyenne des échantillons de qualité de jam, bornée 0–12 |
| Traits | somme des effets quality : Perfectionniste +8, Exigeant +4, Inspiré +6 |
| Variation | tirage entre 3 et 13 |
| Surcharge | max(0; intensité−72) × (100−stabilité)/190 |

L’écho simulé vaut qualité ×0,65 + intensité ×0,2 + tirage 0–18, borné et arrondi. À partir de 80, la chanson est marquée comme succès; ce n’est pas une réception déjà jouée devant le public physique. La sortie donne une hausse d’exaltation de base 21 pour un succès, 11 sinon. Une chanson sous le seuil d’archive reste conservée et restaurable. Catalogue, répertoire et setlist restent distincts.

## Six moments techniques de jam

Après une interaction musicale acceptée favorable ou neutre, un tirage musical conserve synchronisation, apprentissage, idée, débat, accrochage et consolidation. Les poids dépendent de chimie, complicité, écart de maîtrise, empathie, créativité, exaltation, différences de style, confiance, risque d’échange défavorable et discipline. Les répétitions du même résultat dans une séance ont un facteur `0,6 puissance nombre déjà vécu`.

| Moment | Base affinité, confiance, tension, complicité |
|---|---|
| Synchronisation | +4, +3, −2, +5 |
| Apprentissage | +3,5, +2, −1, +3 |
| Idée | +3,5, +2, −1, +3 |
| Débat | +2, +1, +1, +2 |
| Accrochage | −3, −3, +6, −1 |
| Consolidation | +2,5, +1,5, −0,5, +3,5 |

La base d’affinité est ralentie par ×0,1 ×(0,7 + empathie/150). Les changements relationnels utilisent Évolution des liens et le facteur de répétition. Un grief réduit les diminutions de tension de ces moments à un dixième. Accrochage ajoute un grief et détresse base +7 ×facteur; les autres donnent exaltation base +4, ou +9 pour Idée. Débat donne aussi expression +4 ×facteur; apprentissage et consolidation gardent leurs gains de compétences. Le journal distingue ce résultat technique du tirage d’échange qui l’a précédé.

La chimie potentielle est symétrique, calculée depuis similitude de créativité/discipline, styles, instruments et empathie. Elle ne choisit pas les partenaires. Sa connaissance augmente seulement après des jams communes terminées distinctes; l’option Laboratoire montre la valeur exacte sans modifier le moteur.

## Formation et appartenance aux groupes

Après un échange favorable social ou musical, deux partenaires peuvent former un groupe avec affinité mutuelle ≥22, confiance mutuelle ≥18, tension dans les deux sens <40, et complicité mutuelle ≥10 ou affinité mutuelle ≥40. Le délai de formation est de 12 heures. Un groupe actif commun évite la duplication.

L’initiateur peut plutôt rejoindre un groupe du destinataire si au moins la moitié de ses membres remplissent les mêmes conditions avec lui. Cela conserve les appartenances multiples sans jeton Former un groupe. Créer ou inviter manuellement reste possible et journalisé. Aucun plafond nouveau de membres ou d’appartenances.

## Coordination, répertoire et archives

`development` est la **Coordination** affichée, initialisée à 18. Une répétition crédite le band annoncé et les membres réellement présents; une paire appartenant à plusieurs groupes ne crédite pas tous les bands. Le répertoire garde la maîtrise et le nombre de répétitions par morceau; la setlist ordonne les morceaux du show ou les improvisations.

Après 48 heures sans activité commune, la coordination baisse de 0,24 par heure. À zéro, le groupe s’archive sans effacement; il peut être relancé. Réputation et moral de scène restent distincts. Le bonus provisoire de partenaires utilise bien la coordination : `1 + development/8`, maximum si plusieurs groupes communs. L’attachement individuel reste reporté.

## Déchéance et sortie

La déchéance est conservée entre 0 et 100. Un excès volontaire donne +18 et énergie −8; il donne aussi exaltation base +26. Une nuit musicale sacrifiée avec énergie sous 25 entre 22 h et 6 h donne +0,025/min. Le sommeil réel retire 0,025/min; Décrocher retire 0,006/min; un soutien favorable retire 2. Les spectacles Tout donner gardent leur coût de déchéance. Les seuils de cartes maudites restent 25, 50, 70 et 85; récupérer retire les cartes dont le seuil n’est plus atteint. Le succès seul ne cause pas la déchéance.

Liens : [shows](./shows.md), [interactions](./interactions.md), [relations](./relations.md), [raccords](./raccords-v7.md).
