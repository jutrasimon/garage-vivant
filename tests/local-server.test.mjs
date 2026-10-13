import test from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';

test('the actual local server serves browser modules as JavaScript on Windows and other hosts',async t=>{
 const child=spawn(process.execPath,['scripts/serve.mjs'],{env:{...process.env,PORT:'0'},stdio:['ignore','pipe','pipe']});
 t.after(()=>child.kill());
 const url=await new Promise((resolve,reject)=>{
  const timer=setTimeout(()=>reject(Error('Serveur local indisponible.')),5000);let output='';
  child.on('error',error=>{clearTimeout(timer);reject(error);});
  child.stdout.on('data',chunk=>{output+=chunk;const match=output.match(/http:\/\/127\.0\.0\.1:\d+\//);if(match){clearTimeout(timer);resolve(match[0]);}});
 });
 const entry=await fetch(url);assert.equal(entry.status,200);assert.match(entry.headers.get('content-type'),/^text\/html/);
 for(const asset of ['app.mjs?v=0.8.0','engine.mjs','bandlive-view.mjs','garage-vivant/app.mjs']){const response=await fetch(url+asset);assert.equal(response.status,200);assert.match(response.headers.get('content-type'),/^text\/javascript/);assert.equal(response.headers.get('cache-control'),'no-store');}
 const head=await fetch(url+'app.mjs',{method:'HEAD'});assert.equal(await head.text(),'');
 assert.equal((await fetch(url+'__absent__.mjs')).status,404);assert.equal((await fetch(url,{method:'POST'})).status,405);
 assert([403,404].includes((await fetch(url+'%2e%2e%5cpackage.json')).status));
});
