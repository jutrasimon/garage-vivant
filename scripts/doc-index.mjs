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
    // Same normalization and punctuation handling as VitePress 1.6's heading anchors.
    const slug=heading.match(/\{#([^}]+)\}/)?.[1]||title.normalize('NFKD').replace(/[\u0300-\u036F]/g,'').replace(/[\u0000-\u001f]/g,'').replace(/[\s~`!@#$%^&*()\-_+=[\]{}|\\;:"'“”‘’<>,.?/]+/g,'-').replace(/-{2,}/g,'-').replace(/^-+|-+$/g,'').replace(/^(\d)/,'_$1').toLowerCase();
    entries.push({title,system,topic:file.includes('/gdd/')?file.split('/').at(-1).replace('.md',''):'guide',root:title===system,text:plainText(lines.join('\n')).slice(0,6000),url:'docs/'+file.slice(5).replace(/\.md$/,'.html')+(title===system?'':'#'+slug)});
  }
  if(entries[0]&&!entries[0].text)entries[0].text=entries.find(e=>!e.root&&e.text)?.text||'';
  return entries;
}
