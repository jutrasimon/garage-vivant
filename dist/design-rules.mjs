import {GROUP_RULES,NEED_DRAIN,ACTIVITY_EFFECTS,V7_RULES} from './design-defaults.mjs?v=0.8.15';
export const DESIGN_FORMAT='garage-vivant-design-1';
export const DESIGN_CATEGORIES={formation:'Groupes · formation',practice:'Groupes · répétitions',departure:'Groupes · départs',attachment:'Groupes · attachement',relations:'Relations',needs:'Besoins',effects:'Actions · effets',shows:'Spectacles · présence'};
const rows=[];
function add(id,category,label,description,value,min,max,step,unit='points') {rows.push(Object.freeze({id,category,label,description,default:value,min,max,step,unit}));}
const groups=[
 ['affinity','formation','Affinité minimale','Seuil réciproque requis, sauf si le seuil amoureux est atteint.',-100,100,1],
 ['love','formation','Amour minimal','Autre voie d’admissibilité ; requis dans les deux directions.',0,100,1],
 ['tension','formation','Tension maximale','La tension doit rester strictement sous ce seuil dans les deux directions.',0,100,1],
 ['membershipDelay','formation','Délai avant une formation','Depuis la dernière formation ou adhésion des deux candidats. Ne modifie pas les dates passées.',0,43200,1,'min'],
 ['recruitmentDelay','formation','Délai avant recrutement','Depuis la dernière formation ou adhésion du candidat.',0,43200,1,'min'],
 ['pairDelay','formation','Délai entre propositions','Attente avant de reproposer à la même paire.',1,43200,1,'min'],
 ['proposal','formation','Chance de proposer un groupe','Chance de base, réduite par les appartenances et l’attachement existants. Ce n’est pas la fréquence finale des groupes.',0,1,.005,'probabilité'],
 ['recruitmentProposal','formation','Chance de proposer un recrutement','Chance de base, avant les freins liés aux groupes existants.',0,1,.005,'probabilité'],
 ['recruitmentWeight','formation','Poids du recrutement','Poids relatif du recrutement face à la création, lors du choix d’une option admissible.',0,10,.1,'×'],
 ['decisionMinutes','practice','Intervalle des décisions','Rythme commun des décisions d’adoption et de pratique. Les échéances déjà fixées sont conservées.',1,10080,1,'min'],
 ['rehearsalChance','practice','Chance d’appeler une répétition','À chaque décision, avec un morceau actif disponible.',0,1,.01,'probabilité'],
 ['fragileRehearsalChance','practice','Chance pour un groupe fragile','Remplace la chance normale sous le seuil de coordination.',0,1,.01,'probabilité'],
 ['fragileCoordination','practice','Seuil de fragilité','Sous cette coordination, utiliser la chance de répétition des groupes fragiles.',0,100,1],
 ['invitationMinutes','practice','Durée d’une invitation','Expiration des nouveaux appels. Les invitations en cours gardent leur échéance.',1,10080,1,'min'],
 ['waitMinutes','practice','Attente sur place','À partir de la première arrivée, attendre les autres musiciens.',1,1440,1,'min'],
 ['departureMinutes','departure','Intervalle d’évaluation','Rythme des nouvelles évaluations de départ. Les échéances en cours sont conservées.',1,10080,1,'min'],
 ['departureGrace','departure','Délai initial de départ','Appliqué aux prochaines adhésions et formations, pas aux membres déjà présents.',0,43200,1,'min'],
 ['lowAttachment','departure','Attachement faible','Sous ce seuil, le risque de départ pour insatisfaction intervient.',0,100,1],
 ['departureChance','departure','Risque d’insatisfaction','Par évaluation admissible ; le risque combiné reste plafonné à 30 %.',0,.3,.005,'probabilité'],
 ['alternativeGap','departure','Écart pour préférer un autre groupe','Avantage d’attachement requis pour un autre groupe déjà rejoint.',0,100,1],
 ['alternativeChance','departure','Risque de choisir l’autre groupe','S’ajoute au risque d’insatisfaction, total plafonné à 30 %.',0,.3,.005,'probabilité'],
 ['nearShow','shows','Protection avant spectacle','Évite une décision de départ près d’un spectacle confirmé.',0,10080,1,'min'],
 ['arrivalMargin','shows','Marge d’arrivée','Ajoutée au trajet calculé pour déterminer le départ vers le spectacle.',0,1440,1,'min'],
 ['absenceThreshold','shows','Déchéance permettant une absence','Sous ce seuil, aucune absence pour déchéance.',0,100,1],
 ['absenceSlope','shows','Risque d’absence par point','Par point au-dessus du seuil de déchéance ; risque final plafonné à 20 %.',0,.2,.001,'probabilité / point'],
 ['positiveAffinity','relations','Gain d’affinité favorable','Base avant chimie et multiplicateur d’évolution des liens.',0,20,.1],
 ['negativeAffinity','relations','Perte d’affinité défavorable','Amplitude avant le multiplicateur d’évolution des liens.',0,20,.1],
 ['tensionErosion','relations','Érosion par la tension','À partir de 30 de tension : perte par minute × (tension − 20).',0,.05,.0001,'points / min'],
];
for(const [key,cat,label,desc,min,max,step,unit] of groups)add('groups.'+key,cat,label,desc,GROUP_RULES[key],min,max,step,unit);
for(const [key,label] of Object.entries({affinity:'Affinité',style:'Style musical',chemistry:'Chimie musicale',reputation:'Réputation',tension:'Tension'}))add('groups.attachment.'+key,'attachment','Poids · '+label,'Coefficient de la composante dans l’attachement individuel. La coordination reste la base ; résultat borné de 0 à 100.',GROUP_RULES.attachment[key],0,2,.01,'×');
for(const [key,label,desc] of [
 ['romanticStart','Naissance du lien amoureux','Chance de base après un échange admissible, modulée par les réglages existants.'],
 ['advanceThreshold','Seuil d’avance','Niveau amoureux requis pour les avances admissibles.'],
 ['coupleThreshold','Seuil de mise en couple','Niveau amoureux requis dans les deux directions.'],
 ['breakupThreshold','Seuil de rupture','Sous ce niveau dans au moins une direction, une rupture devient possible.'],
 ['coupleChance','Chance de mise en couple','Lors d’une évaluation admissible, après les conditions de lien.'],
 ['breakupChance','Chance de rupture','Lors d’une évaluation admissible sous le seuil de rupture.'],
]) {const prob=key.includes('Chance')||key==='romanticStart';add('relations.'+key,'relations',label,desc,V7_RULES[key],0,prob?1:100,prob?.005:1,prob?'probabilité':'points');}
const names={energy:'Énergie',social:'Connexion sociale',fun:'Plaisir',expression:'Expression'};
for(const [key,value] of Object.entries(NEED_DRAIN))add('needs.'+key,'needs','Usure · '+names[key],'Perte de base par minute, avant le multiplicateur global et les modulations du sommeil et du personnage.',value,0,2,.005,'points / min');
const actions={relax:'Détente',social:'Socialisation',decadence:'Déchéance',practice:'Pratique',write:'Composition',jam:'Jam'};
for(const [action,effects] of Object.entries(ACTIVITY_EFFECTS))for(const [key,value] of Object.entries(effects))add(`effects.${action}.${key}`,'effects',actions[action]+' · '+names[key],'Effet de base par minute dans le parcours existant. Les traits et modulations continuent de s’appliquer. Une valeur négative réduit le besoin.',value,-2,2,.005,'points / min');
export const DESIGN_FIELDS=Object.freeze(rows);
const byId=new Map(rows.map(x=>[x.id,x]));
export function rule(s,id){const field=byId.get(id);if(!field)throw Error('Paramètre inconnu : '+id);return s?.design?.values?.[id]??field.default;}
export function validateDesign(profile){
 if(profile===undefined)return;
 if(!profile||profile.format!==DESIGN_FORMAT||!profile.values||typeof profile.values!=='object'||Array.isArray(profile.values)||Object.keys(profile).some(k=>!['format','values'].includes(k)))throw Error('Profil d’équilibrage incompatible.');
 for(const [id,value] of Object.entries(profile.values)) {const f=byId.get(id);if(!f||typeof value!=='number'||!Number.isFinite(value)||value<f.min||value>f.max||(f.step===1&&!Number.isInteger(value)))throw Error('Valeur invalide : '+(f?.label||id));}
 const s={design:profile};if(rule(s,'relations.breakupThreshold')>rule(s,'relations.coupleThreshold'))throw Error('Le seuil de rupture doit être inférieur ou égal au seuil de mise en couple.');
}
export function designProfile(values={}) {const p={format:DESIGN_FORMAT,values:{...values}};validateDesign(p);p.values=Object.fromEntries(Object.entries(p.values).filter(([id,v])=>v!==byId.get(id).default));return p;}
export function applyDesign(s,profile){validateDesign(profile);if(!profile)throw Error('Profil manquant.');const next=designProfile(profile.values);s.design=next;return next;}
