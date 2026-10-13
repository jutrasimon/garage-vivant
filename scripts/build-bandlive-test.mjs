import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import {rollup} from 'rollup';
import {createWorld} from '../dist/engine.mjs';
import {RELEASE_VERSION} from '../dist/release.mjs';

const source=resolve('dist'),target=resolve(process.argv[2]||'BandLive-test/LANCER-BandLive.html');
const demo=createWorld(2040,8,{setup:'varied'});
const bundle=await rollup({input:resolve(source,'app.mjs'),plugins:[{name:'local-module-queries',resolveId(id,importer){if(id.startsWith('.'))return resolve(importer?dirname(importer):source,id.split('?')[0]);}}],onwarn(warning){if(warning.code!=='CIRCULAR_DEPENDENCY')console.warn(warning.message);}});
const {output}=await bundle.generate({format:'iife',inlineDynamicImports:true});await bundle.close();
let html=await readFile(resolve(source,'index.html'),'utf8');
const sheets=[...html.matchAll(/<link\b[^>]*rel="stylesheet"[^>]*>/g)];
for(const match of sheets){const href=match[0].match(/href="([^"]+)"/)[1];const css=await readFile(resolve(source,href.split('?')[0]),'utf8');html=html.replace(match[0],()=>'<style>'+css.replace(/<\/style/gi,'<\\/style')+'</style>');}
html=html.replace(/<link\b[^>]*href="https:\/\/fonts[^>]*>/g,'').replace(/<title>.*?<\/title>/,`<title>BandLive · test ${RELEASE_VERSION}</title>`);
const docIndex=JSON.parse(await readFile(resolve(source,'doc-index.json'),'utf8'));
const prefix='bandlive-private-normal-';
const bootstrap=`try{const key=${JSON.stringify(prefix+'v1')};if(!localStorage.getItem(key))localStorage.setItem(key,JSON.stringify(${JSON.stringify(demo)}));const moduleKey=${JSON.stringify(prefix+'bandlive-v1')};if(!localStorage.getItem(moduleKey))localStorage.setItem(moduleKey,JSON.stringify({enabled:true,game:null}));}catch{}\nconst offlineDocs=${JSON.stringify(docIndex)};const onlineFetch=window.fetch.bind(window);window.fetch=(input,...args)=>String(input).split('?')[0].endsWith('doc-index.json')?Promise.resolve(new Response(JSON.stringify(offlineDocs),{headers:{'Content-Type':'application/json'}})):onlineFetch(input,...args);\n`;
const code=output[0].code.replaceAll('garage-vivant-',prefix);
const footer='';
html=html.replace(/<script\b[^>]*type="module"[^>]*>\s*<\/script>/,()=>'<script>'+(bootstrap+code+footer).replace(/<\/script/gi,'<\\/script')+'</script>');
await mkdir(dirname(target),{recursive:true});await writeFile(target,html);
console.log(JSON.stringify({file:target,bytes:Buffer.byteLength(html),start:'normal neighbourhood',bandLive:'default show engine'}));
