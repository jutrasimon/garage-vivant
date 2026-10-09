// Presentation seconds are independent from the deterministic musical clock.
export const SONG_SECONDS = 30;
const cache = new WeakMap();
function timeline(show) {
  if (cache.has(show)) return cache.get(show);
  const cues = show.cues || [], total = show.totalTicks || 2160;
  const points = [{tick:0, seconds:0}, ...cues.map((cue,i) => ({tick:cue.tick, seconds:1+i*26/Math.max(1,cues.length)})), {tick:total, seconds:SONG_SECONDS}];
  cache.set(show, points); return points;
}
function interpolate(show, value, from, to) {
  const points = timeline(show);
  value = Math.max(0, Math.min(points.at(-1)[from], value));
  for (let i=1;i<points.length;i++) if (value<=points[i][from]) {
    const a=points[i-1], b=points[i], fraction=(value-a[from])/Math.max(.000001,b[from]-a[from]);
    return a[to]+fraction*(b[to]-a[to]);
  }
  return points.at(-1)[to];
}
export const songSeconds = (show,tick=show.tick) => interpolate(show,tick,'tick','seconds');
export const musicalTick = (show,seconds) => interpolate(show,seconds,'seconds','tick');
export const eventAge = (show,event) => songSeconds(show)-songSeconds(show,event.tick);
export const songKey = show => `${show.id}:${show.songIndex||0}`;
export function createShowClock(show) {return {key:songKey(show),seconds:songSeconds(show)};}
export function advanceShowClock(clock,show,dt,speed=1) {
  if(clock.key!==songKey(show))Object.assign(clock,createShowClock(show));
  clock.seconds=Math.min(SONG_SECONDS,clock.seconds+Math.max(0,dt)*speed);
  return Math.max(0,Math.floor(musicalTick(show,clock.seconds)+1e-7)-show.tick);
}
export function stageGeometry(canvas) {
  const width=canvas.clientWidth||900,height=canvas.clientHeight||650,integrated=canvas.dataset?.showLayout==='integrated',compact=width<700;
  const cardWidth=compact?Math.min(204,Math.max(156,width*.46)):Math.min(280,Math.max(230,width*.21));
  const cardHeight=compact?Math.min(214,Math.max(170,height*.42)):Math.min(366,Math.max(120,height-24));
  const availableWidth=integrated&&!compact?Math.max(120,width-cardWidth-36):width;
  const availableHeight=integrated&&compact?Math.max(100,height-cardHeight*.5):height;
  const scale=Math.min(availableWidth/900,availableHeight/650);
  return {width,height,scale,ox:(availableWidth-900*scale)/2,oy:integrated?(compact?0:Math.min(12,(availableHeight-650*scale)/2)):(height-650*scale)/2,cardWidth,cardHeight,cardX:width-cardWidth-12,cardY:height-cardHeight-12};
}
export function stagePoint(canvas,clientX,clientY) {
  const r=canvas.getBoundingClientRect(),g=stageGeometry(canvas);
  return {x:(clientX-r.left-g.ox)/g.scale,y:(clientY-r.top-g.oy)/g.scale};
}
export function actorPosition(show,index) {
  const cols=Math.min(show.actors.length,8),row=Math.floor(index/cols),rows=Math.ceil(show.actors.length/cols);
  return {x:115+(index%cols)*(670/Math.max(1,cols-1)),y:rows>1?105+row*53:125,size:rows>2?21:30,deckY:rows>1?128+row*53:162};
}
export function cardContext(show,event) {
  const impact=show.events.find(e=>e.type==='impact'&&e.actorId===event.actorId&&e.cardId===event.cardId&&e.phrase===event.phrase);
  const curse=show.events.find(e=>e.type==='curse'&&e.actorId===event.actorId&&e.cardId===event.cardId&&e.tick===event.tick);
  const pending=show.impacts.find(e=>e.actorId===event.actorId&&e.cardId===event.cardId&&e.phrase===event.phrase);
  return {impact,curse,target:impact||pending||event.target};
}
