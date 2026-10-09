const normalize=x=>x.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
const notes=['v060','v051','v050'];
export function setupDocSearch({modal,playback,setPlaybackSpeed,suspendShow=()=>()=>{}}){
  let index,previous=0,returnFocus,resumeShow;
  const badge=()=>{
    let read=[];try{const value=JSON.parse(localStorage.getItem('garage-vivant-read-notes')||'[]');if(Array.isArray(value))read=value;}catch{}
    const n=notes.filter(id=>!read.includes(id)).length,button=document.getElementById('version');
    button.textContent='v0.6.0'+(n?` · ${n} nouveautés`:'');
    button.onclick=()=>window.open('docs/versions.html#'+(notes.find(id=>!read.includes(id))||notes[0]),'_blank','noopener');
  };
  badge();window.addEventListener('storage',badge);
  const open=async()=>{
    if(document.getElementById('dialog').open)return;
    returnFocus=document.activeElement;previous=playback.speed;resumeShow=suspendShow();setPlaybackSpeed(playback,0);
    modal('<h2>Rechercher dans les règles</h2><input id="doc-query" type="search" placeholder="show, tension, sac, temps…" aria-label="Chercher un terme"><div id="doc-results" class="doc-results">Chargement…</div>');
    const input=document.getElementById('doc-query'),results=document.getElementById('doc-results');input.focus();
    try{index||=await fetch('doc-index.json?v=0.6.0').then(r=>{if(!r.ok)throw Error();return r.json();});}
    catch{if(results.isConnected)results.innerHTML='<p>Recherche indisponible. <a href="docs/" target="_blank" rel="noopener">Ouvrir la documentation</a></p>';return;}
    if(!results.isConnected)return;
    const render=()=>{
      const aliases={band:'groupe',groupe:'band',rapin:'sac',sac:'rapin'},q=normalize(input.value).split(/\s+/).filter(Boolean);
      const entries=index.entries.map(e=>{const title=normalize(e.title),body=normalize(e.text);const matches=q.map(t=>[t,aliases[t]].filter(Boolean));return {...e,score:matches.reduce((n,terms)=>n+(terms.some(t=>title.includes(t))?8:terms.some(t=>body.includes(t))?1:0),0),matched:matches.every(terms=>terms.some(t=>title.includes(t)||body.includes(t)))};}).filter(e=>e.matched).sort((a,b)=>b.score-a.score).slice(0,10);
      results.replaceChildren(...entries.map(e=>{const a=document.createElement('a');a.href=e.url;a.target='_blank';a.rel='noopener';const title=document.createElement('strong');title.textContent=e.title;const text=document.createElement('small');text.textContent=e.text.slice(0,180);a.append(title,text);return a;}));
      if(!entries.length)results.textContent='Aucun résultat. Essaie band/groupe ou sac/Rapin.';
    };
    input.oninput=render;render();
  };
  document.getElementById('doc-search').onclick=open;
  document.addEventListener('keydown',e=>{if(e.ctrlKey&&e.code==='Space'){e.preventDefault();open();}});
  document.getElementById('dialog').addEventListener('close',()=>{if(!document.getElementById('doc-query'))return;setPlaybackSpeed(playback,previous);resumeShow?.();returnFocus?.focus({preventScroll:true});});
}
