export function plainText(markdown){
  return markdown
    .replace(/^\s*\[[^\]]+\]\([^\n)]+\)\s*$/gm,'')
    .replace(/\[([^\]]+)\]\([^)]+\)/g,'$1')
    .replace(/<[^>]+>/g,'')
    .replace(/https?:\/\/[^\s)]+/g,'')
    .replace(/\{#[^}]+\}/g,'')
    .replace(/^[\s>*-]+/gm,'')
    .replace(/^\s*\|(?:\s*:?-+:?\s*\|)+\s*$/gm,'')
    .replace(/[#*_`|]/g,'')
    .replace(/\s+/g,' ').trim();
}
export function indexDocument(file,markdown){
  let system='';const entries=[];
  for(const part of markdown.split(/^##? /m)){
    if(!part.trim())continue;
    const [heading,...lines]=part.split('\n'),title=plainText(heading);system||=title;
    const slug=title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9\s-]/g,'').replace(/\s+/g,'-');
    entries.push({title,system,topic:file.includes('/gdd/')?file.split('/').at(-1).replace('.md',''):'guide',root:title===system,text:plainText(lines.join('\n')).slice(0,6000),url:'docs/'+file.slice(5).replace(/\.md$/,'.html')+(title===system?'':'#'+slug)});
  }
  if(entries[0]&&!entries[0].text)entries[0].text=entries.find(e=>!e.root&&e.text)?.text||'';
  return entries;
}
