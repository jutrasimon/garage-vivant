// Visual interpolation never advances hearts, contacts or simulation state.
export function interpolateMotion(frames,time){
 const index=Math.min(frames.length-1,Math.floor(time)),a=frames[index],b=frames[Math.min(index+1,frames.length-1)],fraction=time-index;
 return new Map(a.map((p,i)=>{const next=b[i];return [p.id,{...p,...Object.fromEntries(['x','y','angle','lift'].map(k=>[k,(p[k]||0)+((next[k]||0)-(p[k]||0))*fraction]))}];}));
}
export function createArenaMonitor(element){
 const stats={draws:0,previews:0,drawMs:0,previewMs:0,mode:'worker'};let handle,start=0,frames=0,draws=0;
 function sample(now){if(document.hidden)return;if(!start)start=now;frames++;if(now-start>=500){const span=now-start;const fps=Math.round((frames-1)*1000/span),rendered=Math.round((stats.draws-draws)*1000/span);element.textContent=`${fps} FPS · rendu ${rendered}/s`;element.title=`Cadence de l’écran (pas un FPS physique). Dessin : ${stats.drawMs.toFixed(1)} ms. Prévision : ${stats.previewMs.toFixed(1)} ms (${stats.mode}). Au repos, aucun dessin continu.`;element.dataset.fps=fps;element.dataset.draws=stats.draws;element.dataset.previews=stats.previews;element.dataset.mode=stats.mode;start=now;frames=1;draws=stats.draws;}handle=requestAnimationFrame(sample);}
 document.addEventListener('visibilitychange',()=>{cancelAnimationFrame(handle);start=0;frames=0;draws=stats.draws;if(!document.hidden)handle=requestAnimationFrame(sample);});handle=requestAnimationFrame(sample);return stats;
}
