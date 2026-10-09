import {RELEASE_VERSION,PATCH_NOTES} from './release.mjs?v=0.6.3';
const normalize=x=>x.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
const topics={shows:['Shows et public','scène'],actions:['Actions et sac Rapin','dé'],musique:['Chansons et bands','note'],personnages:['Personnages et émotions','cube'],relations:['Relations et souvenirs','liens'],temps:['Temps et vitesse','horloge'],technique:['Sauvegardes','fichier'],guide:['Prendre la scène','scène']};
const paths={search:'M21 21l-5-5m2-6a7 7 0 1 1-14 0 7 7 0 0 1 14 0',scène:'M3 17h18M5 17V7l7-4 7 4v10M9 10v3m6-3v3M7 21h10',dé:'M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2M7 7h.01M12 12h.01M17 17h.01',note:'M9 18V5l11-2v13M9 8l11-2M9 18c0 2-6 3-6 0s6-3 6 0m11-2c0 2-6 3-6 0s6-3 6 0',cube:'M12 3l9 5v8l-9 5-9-5V8l9-5m-9 5 9 5 9-5m-9 5v8',liens:'M10 8 7 5a3 3 0 0 0-4 4l4 4m7 3 3 3a3 3 0 0 0 4-4l-4-4M8 8l8 8',horloge:'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18m0 4v5l4 2',fichier:'M14 3H5v18h14V8l-5-5m0 0v5h5M8 13h8M8 17h5',flèche:'M7 17 17 7M7 7h10v10'};
const icon=name=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${paths[name]||paths.fichier}"/></svg>`;
function excerpt(text,terms){
  const normalized=normalize(text),positions=terms.map(t=>normalized.indexOf(t)).filter(n=>n>=0),match=positions.length?Math.min(...positions):0;
  let start=Math.max(0,match-55);if(start)start=text.indexOf(' ',start)+1;
  let end=Math.min(text.length,start+170);if(end<text.length){const word=text.lastIndexOf(' ',end);if(word>start)end=word;}
  return (start?'… ':'')+text.slice(start,end)+(end<text.length?'…':'');
}
function highlight(node,text,terms){
  const normalized=normalize(text),ranges=[];
  for(const term of terms){let from=0,index;while(term&&(index=normalized.indexOf(term,from))>=0){ranges.push([index,index+term.length]);from=index+term.length;}}
  ranges.sort((a,b)=>a[0]-b[0]);let cursor=0;
  for(const [start,end] of ranges){if(start<cursor)continue;node.append(document.createTextNode(text.slice(cursor,start)));const mark=document.createElement('mark');mark.textContent=text.slice(start,end);node.append(mark);cursor=end;}
  node.append(document.createTextNode(text.slice(cursor)));
}
export function setupDocSearch({modal,playback,setPlaybackSpeed,suspendShow=()=>()=>{}}){
  let index,previous=0,returnFocus,resumeShow,navigate,session=0;
  const dialog=document.getElementById('dialog');
  const badge=()=>{
    let read=[];try{const value=JSON.parse(localStorage.getItem('garage-vivant-read-notes')||'[]');if(Array.isArray(value))read=value;}catch{}
    const n=PATCH_NOTES.filter(id=>!read.includes(id)).length,button=document.getElementById('version');
    button.textContent='v'+RELEASE_VERSION+(n?` · ${n} nouveautés`:'');
    button.onclick=()=>window.open('docs/versions.html#'+(PATCH_NOTES.find(id=>!read.includes(id))||PATCH_NOTES[0]),'_blank','noopener');
  };
  badge();window.addEventListener('storage',badge);
  const open=async()=>{
    if(dialog.open)return;
    const request=++session;returnFocus=document.activeElement;previous=playback.speed;resumeShow=suspendShow();setPlaybackSpeed(playback,0);
    dialog.classList.add('docs-search-dialog');dialog.setAttribute('aria-labelledby','doc-heading');
    modal(`<div class="doc-heading"><span class="doc-emblem">${icon('note')}</span><div><span class="doc-kicker">LE CARNET DU QUARTIER</span><h2 id="doc-heading">Les règles, à portée de main.</h2></div></div><div class="doc-search-field"><span>${icon('search')}</span><input id="doc-query" type="search" placeholder="Un show, une tension, le sac Rapin…" aria-label="Rechercher dans les règles" autocomplete="off" spellcheck="false"><button id="doc-clear" type="button" aria-label="Effacer la recherche" hidden>×</button><kbd>Esc</kbd></div><div class="doc-list-heading"><span id="doc-count" role="status">Chargement du carnet…</span><span>RÈGLES DU JEU</span></div><div id="doc-results" class="doc-results" aria-label="Rubriques de la documentation"></div><footer class="doc-search-footer"><span class="doc-keyboard"><kbd>↑</kbd><kbd>↓</kbd> parcourir <kbd>↵</kbd> ouvrir</span><span>Jeu en pause · liens dans un nouvel onglet</span></footer>`);
    const input=document.getElementById('doc-query'),results=document.getElementById('doc-results'),count=document.getElementById('doc-count'),clear=document.getElementById('doc-clear');let active=-1;
    const select=n=>{const links=[...results.querySelectorAll('a.doc-result')];active=links.length?(n+links.length)%links.length:-1;links.forEach((link,i)=>link.classList.toggle('is-active',i===active));links[active]?.scrollIntoView({block:'nearest'});};
    const render=()=>{
      if(!index)return;
      const aliases={band:'groupe',groupe:'band',rapin:'sac',sac:'rapin'},q=normalize(input.value).split(/\s+/).filter(Boolean),terms=[...new Set(q.flatMap(t=>[t,aliases[t]].filter(Boolean)))];
      const found=q.length?index.entries.map(e=>{const title=normalize(e.title),body=normalize(e.text),matches=q.map(t=>[t,aliases[t]].filter(Boolean));return {...e,score:matches.reduce((n,words)=>n+(words.some(t=>title.includes(t))?8:words.some(t=>body.includes(t))?1:0),0),matched:matches.every(words=>words.some(t=>title.includes(t)||body.includes(t)))};}).filter(e=>e.matched).sort((a,b)=>b.score-a.score):['shows','actions','musique','personnages','relations','temps','technique'].map(topic=>index.entries.find(e=>e.topic===topic&&e.root)).filter(Boolean);
      const entries=found.slice(0,10);active=-1;clear.hidden=!input.value;count.textContent=q.length?(found.length?`${found.length} résultat${found.length>1?'s':''}`:'Aucun résultat'):'Parcourir les règles';
      results.replaceChildren(...entries.map(e=>{
        const a=document.createElement('a');a.className='doc-result';a.href=e.url;a.target='_blank';a.rel='noopener';const topic=topics[e.topic]||[e.system,'fichier'];a.dataset.topic=e.topic;
        const glyph=document.createElement('span');glyph.className='doc-result-icon';glyph.innerHTML=icon(topic[1]);
        const body=document.createElement('span');body.className='doc-result-body';const title=document.createElement('strong');highlight(title,q.length?e.title:topic[0],terms);
        const text=document.createElement('span');text.className='doc-excerpt';highlight(text,excerpt(e.text,terms),terms);body.append(title,text);
        if(q.length&&!e.root){const category=document.createElement('small');category.className='doc-category';category.textContent=topic[0];body.prepend(category);}
        const arrow=document.createElement('span');arrow.className='doc-result-arrow';arrow.innerHTML=icon('flèche');a.append(glyph,body,arrow);return a;
      }));
      if(!entries.length){const empty=document.createElement('div');empty.className='doc-empty';const title=document.createElement('strong');title.textContent='Cette piste ne donne rien.';const hint=document.createElement('span');hint.textContent='Essaie « show », « relation » ou « Rapin ».';empty.append(title,hint);results.append(empty);}
    };
    input.oninput=render;clear.onclick=()=>{input.value='';render();input.focus();};
    navigate=function(e){if(request!==session||!dialog.open){dialog.removeEventListener('keydown',navigate);return;}if(['ArrowDown','ArrowUp'].includes(e.key)){e.preventDefault();select(active<0?(e.key==='ArrowDown'?0:-1):active+(e.key==='ArrowDown'?1:-1));input.focus({preventScroll:true});}else if(e.key==='Enter'&&e.target===input){const link=results.querySelectorAll('a.doc-result')[Math.max(0,active)];if(link){e.preventDefault();link.click();}}};dialog.addEventListener('keydown',navigate);
    input.focus();
    try{index||=await fetch('doc-index.json?v='+RELEASE_VERSION).then(r=>{if(!r.ok)throw Error();return r.json();});}
    catch{if(request===session&&dialog.open){count.textContent='Le carnet est momentanément indisponible';const a=document.createElement('a');a.className='doc-result';a.href='docs/';a.target='_blank';a.rel='noopener';a.textContent='Ouvrir la documentation ↗';results.append(a);}return;}
    if(request===session&&dialog.open)render();
  };
  document.getElementById('doc-search').onclick=open;
  document.addEventListener('keydown',e=>{if(e.ctrlKey&&e.code==='Space'){e.preventDefault();open();}});
  dialog.addEventListener('close',()=>{if(!dialog.classList.contains('docs-search-dialog'))return;++session;dialog.removeEventListener('keydown',navigate);dialog.classList.remove('docs-search-dialog');dialog.removeAttribute('aria-labelledby');setPlaybackSpeed(playback,previous);resumeShow?.();returnFocus?.focus({preventScroll:true});});
}
