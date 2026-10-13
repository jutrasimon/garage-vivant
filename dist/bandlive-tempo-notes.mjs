import {TEMPO_ICON_PATH} from './bandlive-resources.mjs?v=0.8.13';

// One bounded decorative layer per render; pointer movement only toggles its class.
export function tempoNotesHTML() {
  return `<div class="bl-tempo-notes" aria-hidden="true">${Array.from({length:12},(_,i)=>{
    const x=8+(i%6)*16+(i>=6?5:0),y=23+Math.floor(i/6)*48+(i%3-1)*10;
    return `<svg viewBox="0 0 24 24" style="left:${x}%;top:${y}%;--bl-note-size:${21+i%3*3}px;--bl-note-drift:${i%2?-12:14}px;--bl-note-duration:${2.8+i%4*.3}s;--bl-note-delay:${-i*.47}s"><path d="${TEMPO_ICON_PATH}"/></svg>`;
  }).join('')}</div>`;
}
