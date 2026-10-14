import {RULES} from './bandlive.mjs?v=0.8.15';

export const TEMPO_ICON_PATH='M9 18V5l11-2v12M9 18c0 4-6 4-6 0s6-4 6 0M20 15c0 4-6 4-6 0s6-4 6 0';

const meters={
  energy:{name:'Énergie',max:RULES.energy,path:'m13 2-9 12h7l-1 8 10-13h-7z'},
  tempo:{name:'Tempo',max:RULES.tempoMax,path:TEMPO_ICON_PATH},
};

export function resourceDockHTML(game) {
  return `<div class="bl-resource-dock" role="group" aria-label="Énergie et tempo du tour">${Object.entries(meters).map(([key,{name,max,path}])=>{
    const value=game[key];
    return `<div class="bl-resource-meter bl-${key}-meter ${value===max?'is-full':''}" data-bl-resource="${key}" data-value="${value}"><div class="bl-meter-heading"><span class="bl-meter-name"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="${path}"/></svg>${name}</span><strong data-bl-${key}>${value}<small>/${max}</small></strong></div><div class="bl-meter-track" role="progressbar" aria-label="${name}" aria-valuemin="0" aria-valuemax="${max}" aria-valuenow="${value}" style="--bl-meter-segments:${max}">${Array.from({length:max},(_,i)=>`<i class="${i<value?'charged':''}" aria-hidden="true"></i>`).join('')}</div><output class="bl-meter-delta" aria-live="polite"></output></div>`;
  }).join('')}</div>`;
}

export function readResourceValues(root) {
  const values=[...root.querySelectorAll('[data-bl-resource]')];
  return values.length?Object.fromEntries(values.map(el=>[el.dataset.blResource,Number(el.dataset.value)])):null;
}

export function animateResourceChanges(root,previous,reduced=false) {
  if(!previous)return;
  for(const meter of root.querySelectorAll('[data-bl-resource]')) {
    const key=meter.dataset.blResource,value=Number(meter.dataset.value),delta=value-previous[key];
    if(!Number.isFinite(delta)||!delta)continue;
    const gain=delta>0,output=meter.querySelector('output');
    meter.dataset.change=gain?'gain':'spend';
    output.textContent=(gain?'+':'−')+Math.abs(delta);
    output.setAttribute('aria-label',`${meters[key].name} : ${gain?'gain':'dépense'} de ${Math.abs(delta)}, ${value} sur ${meters[key].max}`);
    if(!reduced) {
      meter.animate([{transform:'translateY(0)',filter:'brightness(1)'},{transform:`translateY(${gain?-4:2}px)`,filter:`brightness(${gain?1.5:1.15})`},{transform:'translateY(0)',filter:'brightness(1)'}],{duration:420,easing:'ease-out'});
      meter.querySelector('strong').animate([{transform:'scale(1)'},{transform:`scale(${gain?1.2:.9})`},{transform:'scale(1)'}],{duration:380,easing:'ease-out'});
      [...meter.querySelectorAll('.bl-meter-track i')].forEach((pip,index)=>{
        if(index<Math.min(value,previous[key])||index>=Math.max(value,previous[key]))return;
        pip.animate(gain?[{transform:'scaleY(.45)',opacity:.35},{transform:'scaleY(1.3)',opacity:1},{transform:'scaleY(1)',opacity:1}]:[{background:'#f4b7cf',opacity:1},{opacity:.45},{opacity:1}],{duration:440,delay:Math.abs(index-Math.min(value,previous[key]))*35,easing:'ease-out'});
      });
      output.animate([{opacity:0,transform:'translateY(8px) scale(.7)'},{opacity:1,transform:'translateY(0) scale(1.15)',offset:.22},{opacity:1,transform:'translateY(-4px) scale(1)',offset:.7},{opacity:0,transform:'translateY(-20px) scale(1)'}],{duration:950,easing:'ease-out',fill:'forwards'});
    }
    setTimeout(()=>{output.textContent='';output.removeAttribute('aria-label');delete meter.dataset.change;},1000);
  }
}
