// Keyed DOM reconciliation keeps controls, details and scrolling elements alive.
const identity = node => node.nodeType===1 ? node.id || node.dataset.key || node.dataset.entry || node.dataset.stable || (node.dataset.person&&`person-${node.dataset.person}`) || (node.dataset.edit&&`edit-${node.dataset.edit}`) || (node.dataset.priority&&`priority-${node.dataset.priority}`) || (node.dataset.rel&&`rel-${node.dataset.rel}`) || (node.dataset.card&&`card-${node.dataset.card}`) : null;
function patch(old, next, document) {
  if(old.nodeType!==next.nodeType || old.nodeName!==next.nodeName) {old.replaceWith(next);return next;}
  if(old.nodeType!==1) {if(old.nodeValue!==next.nodeValue)old.nodeValue=next.nodeValue;return old;}
  const active = old===document.activeElement || old.contains(document.activeElement);
  const details = old.tagName==='DETAILS' ? old.open : null;
  const protectedControl = old===document.activeElement && ['INPUT','SELECT','TEXTAREA'].includes(old.tagName);
  const desiredValue=next.value,desiredChecked=next.checked;
  for(const attribute of [...old.attributes]) if(!next.hasAttribute(attribute.name) && !(attribute.name==='open' && details!==null)) old.removeAttribute(attribute.name);
  for(const attribute of [...next.attributes]) {
    if(attribute.name==='open' && details!==null) continue;
    if(protectedControl && ['value','checked'].includes(attribute.name)) continue;
    if(old.getAttribute(attribute.name)!==attribute.value) old.setAttribute(attribute.name,attribute.value);
  }
  // Native selects must not have their options reordered while open or focused.
  if(!next.hasAttribute('data-retain') && !(active && old.tagName==='SELECT')) children(old,next,document);
  if(details!==null) old.open=details;
  if(!protectedControl) {
    if(['INPUT','TEXTAREA','SELECT'].includes(old.tagName) && old.value!==desiredValue) old.value=desiredValue;
    if(old.tagName==='INPUT' && old.checked!==desiredChecked) old.checked=desiredChecked;
  }
  return old;
}
function children(parent, next, document) {
  const existing=[...parent.childNodes], keyed=new Map(existing.map(n=>[identity(n),n]).filter(([key])=>key));
  const kept=new Set();let cursor=parent.firstChild;
  for(const desired of [...next.childNodes]) {
    const key=identity(desired);
    let node=key?keyed.get(key):cursor;
    if(node && (kept.has(node)||identity(node)!==key||node.nodeType!==desired.nodeType||node.nodeName!==desired.nodeName)) node=null;
    if(node) node=patch(node,desired,document);else node=desired;
    if(node!==cursor) parent.insertBefore(node,cursor);
    kept.add(node);cursor=node.nextSibling;
  }
  for(const node of existing) if(!kept.has(node) && node.parentNode===parent) node.remove();
}
export function reconcile(element, html) {
  if(!element) return;
  if(element.__renderedHTML===html) return;
  const document=element.ownerDocument, template=document.createElement('template');template.innerHTML=html;
  const scrolling=[];
  for(let p=element;p;p=p.parentElement) if(p.scrollHeight>p.clientHeight || p.scrollWidth>p.clientWidth) scrolling.push({node:p,top:p.scrollTop,left:p.scrollLeft});
  for(const p of element.querySelectorAll('[data-scroll]')) scrolling.push({node:p,top:p.scrollTop,left:p.scrollLeft});
  const scroller=element.closest('[data-scroll]');
  const scope=scroller||element;
  const anchorSelector='[id],[data-entry],[data-stable],[data-key],[data-edit],[data-rel],[data-priority]';
  const boundary=scroller?.getBoundingClientRect().top||0;
  const active=document.activeElement;
  // A module above the editor can change height without containing its focus.
  // Anchor within the whole scrolling panel, not just the fragment being patched.
  const visibleFocus=scope.contains(active)&&active.getBoundingClientRect().top>=boundary&&active.getBoundingClientRect().bottom<=(scroller?.getBoundingClientRect().bottom||globalThis.innerHeight);
  const anchor=scroller?.scrollTop>0?(visibleFocus?active:[...scope.querySelectorAll(anchorSelector)].find(p=>{const r=p.getBoundingClientRect();return identity(p)&&r.bottom>boundary&&r.height<scroller.clientHeight&&r.top>=boundary-20;})):null;
  const anchorKey=anchor&&identity(anchor),offset=anchor?.getBoundingClientRect().top;
  children(element,template.content,document);
  for(const state of scrolling) if(state.node.isConnected){state.node.scrollTop=state.top;state.node.scrollLeft=state.left;}
  if(anchor && scroller) {
    const next=anchor===active&&active.isConnected?active:anchorKey&&[...scope.querySelectorAll(anchorSelector)].find(p=>identity(p)===anchorKey);
    if(next) scroller.scrollTop+=next.getBoundingClientRect().top-offset;
  }
  element.__renderedHTML=html;
}
export function withReadingAnchor(panel,update) {
  if(!panel)return update();
  const focus=panel.ownerDocument.activeElement,bounds=panel.getBoundingClientRect();
  const visible=node=>{const r=node.getBoundingClientRect();return r.bottom>bounds.top&&r.top<bounds.bottom;};
  const anchor=panel.contains(focus)&&visible(focus)?focus:
    [...panel.querySelectorAll('[data-key],[data-stable],[data-edit],[id]')].find(node=>visible(node)&&node.getBoundingClientRect().height<panel.clientHeight);
  const offset=anchor?.getBoundingClientRect().top;
  update();
  if(anchor?.isConnected&&panel.contains(anchor))panel.scrollTop+=anchor.getBoundingClientRect().top-offset;
}
export function createViewPositions() {
  const positions=new Map();
  return {save(key,element){positions.set(key,{top:element.scrollTop,left:element.scrollLeft});},restore(key,element){const p=positions.get(key)||{top:0,left:0};element.scrollTop=p.top;element.scrollLeft=p.left;},clear(){positions.clear();}};
}
