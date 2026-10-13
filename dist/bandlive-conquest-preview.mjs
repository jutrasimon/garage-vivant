export const conquestPreviewHTML='<section class="bl-conquest-preview" hidden aria-label="Effet de conquête prévu"><div class="bl-conquest-preview-kicker">VA SE DÉCLENCHER !</div><div class="bl-conquest-preview-head"><span class="bl-conquest-preview-icon" aria-hidden="true"></span><strong class="bl-conquest-preview-name"></strong></div><p class="bl-conquest-preview-description"></p><p class="bl-conquest-preview-targets"></p><b class="bl-conquest-preview-chain" hidden></b></section>';

export function updateConquestPreview(element,value){
  element.hidden=!value;
  const key=value?[value.sourceId,value.name,...value.targets,value.chainCount].join('|'):'';
  if(value){
    element.querySelector('.bl-conquest-preview-icon').textContent=value.icon;
    element.querySelector('.bl-conquest-preview-name').textContent=value.name;
    element.querySelector('.bl-conquest-preview-description').textContent=value.description;
    element.querySelector('.bl-conquest-preview-targets').textContent=value.targets.length?'→ '+value.targets.join(', '):'Aucun voisin restant à affecter.';
    const chain=element.querySelector('.bl-conquest-preview-chain');chain.hidden=value.chainCount<2;chain.textContent='✦ Réaction en chaîne · '+value.chainCount+' effets de conquête';
  }
  if(key!==element._conquestKey){
    element.getAnimations().forEach(animation=>animation.cancel());
    if(value&&!matchMedia('(prefers-reduced-motion: reduce)').matches&&!document.body.classList.contains('reduce-effects'))element.animate([{opacity:.55,transform:'translateY(4px) scale(.96)'},{opacity:1,transform:'translateY(-1px) scale(1.02)',offset:.6},{opacity:1,transform:'none'}],{duration:360,easing:'cubic-bezier(.2,.7,.2,1)'});
  }
  element._conquestKey=key;
}
