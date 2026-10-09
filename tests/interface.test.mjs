// Exercise the actual rendering functions without substituting a browser or claiming visual QA.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import * as engine from '../dist/engine.mjs';
const source=readFileSync(new URL('../dist/app.mjs',import.meta.url),'utf8'),html=readFileSync(new URL('../dist/index.html',import.meta.url),'utf8');
const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(x=>x[1]);assert.equal(new Set(ids).size,ids.length,'No duplicate DOM IDs');
for(const id of ['lab-values','raw-journal','projects','journal','songs','speed'])assert(ids.includes(id));
const nodes=new Map();const node=key=>{if(!nodes.has(key))nodes.set(key,{innerHTML:'',textContent:''});return nodes.get(key);};
const world=engine.createWorld(13,2);world.people[0].name='<Alex & Co>';world.people[1].name='Camille';const [,b]=world.people;
const context=vm.createContext({...engine,world,selected:world.people[0].id,pair:null,metric:'chemistry',filter:'all',labValues:false,rawJournal:false,$:node,esc:x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])),replacePreserving:(key,text)=>node(key).innerHTML=text});
function load(start,end){const first=source.indexOf(start),last=source.indexOf(end,first);assert(first>=0&&last>first);vm.runInContext(source.slice(first,last),context);}
load('function projectHTML(', '\nfunction replacePreserving(');
load('function renderMatrix(', '\nfunction renderSettings(');
vm.runInContext('renderMatrix(); renderPair(); renderJournal();',context);
let matrix=node('#matrix').innerHTML;assert(matrix.includes('>?</button>'));assert(!matrix.includes('Très prometteuse'));assert(!matrix.includes('rgba('),'Unknown potential cannot leak through its color');assert(matrix.includes('&lt;Alex &amp; Co&gt;'));assert(!matrix.includes('<Alex'));
context.pair=world.people.map(x=>x.id);vm.runInContext('renderPair();',context);assert(node('#relation-detail').innerHTML.includes('Inconnue'));assert(!node('#relation-detail').innerHTML.includes('Chimie potentielle : '+engine.round(engine.chemistry(...world.people))+'/100'));
context.labValues=true;vm.runInContext('renderMatrix();renderPair();',context);assert(node('#relation-detail').innerHTML.includes('Chimie potentielle : '+engine.round(engine.chemistry(...world.people))+'/100'));
engine.decide(world,b,'write');const project=engine.compositionProject(world,b);project.title='<script>test</script>';vm.runInContext('renderJournal();renderProfileSongs(world.people[1]);',context);assert(node('#projects').innerHTML.includes('&lt;script&gt;test&lt;/script&gt;'));assert(node('#profile-songs').innerHTML.includes('potentiel provisoire'));assert(!node('#projects').innerHTML.includes('<script>test'));
const activity=engine.journalEntries(world).find(x=>x.session);context.activity=activity;const rendered=vm.runInContext('eventHTML(activity)',context);assert(rendered.includes('Déroulement et effets'));assert(rendered.includes('data-key="session-'));assert(rendered.includes('min d’activité'));
// The map drawing code renders an action and an optional emotion in independent bubbles.
const bubble=source.slice(source.indexOf("if(p.action){ctx.fillStyle='#f9fbf0ed'"),source.indexOf('const tw=ctx.measureText(p.name)'));
assert(bubble.includes('ACTIONS[p.action.key].icon'));assert(bubble.includes('EMOTIONS[em.key].icon'));assert(!bubble.includes('showEmotion?'));assert(bubble.includes("p.action.route.length?'↗'"));
console.log('Interface rendering passed: hidden chemistry, laboratory switch, escaped names, persistent projects, session details, independent action/emotion bubbles. Visual layout not tested.');
