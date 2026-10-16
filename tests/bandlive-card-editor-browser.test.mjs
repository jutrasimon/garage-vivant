import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdir,readFile} from 'node:fs/promises';
import {chromium} from 'playwright';
import {preparedConcert} from './bandlive-concert-helpers.mjs';
import {EFFECTS,CONDITIONS,validateCatalog} from '../dist/bandlive-catalog.mjs';

const child=spawn(process.execPath,['scripts/serve.mjs'],{env:{...process.env,PORT:'0'},stdio:['ignore','pipe','pipe']});let browser,page;
try{
 const url=await new Promise((resolve,reject)=>{let out='';const timer=setTimeout(()=>reject(Error('Serveur indisponible')),5000);child.on('error',reject);child.stdout.on('data',b=>{out+=b;const match=out.match(/http:\/\/127\.0\.0\.1:\d+\//);if(match){clearTimeout(timer);resolve(match[0]);}});});
 await mkdir('test-results',{recursive:true});browser=await chromium.launch();
 for(const width of [1440,390]){
  page=await browser.newPage({viewport:{width,height:900},hasTouch:width<500,isMobile:width<500});const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(w=>localStorage.setItem('garage-vivant-v1',JSON.stringify(w)),preparedConcert().world);
  await page.goto(url);await page.locator('[data-bl-song]').first().click();await page.locator('.bl-render-ready').waitFor();await page.locator('#bl-cards').first().click();
  const editor=page.locator('.bl-card-editor'),field=key=>editor.locator(`[data-ce-field="${key}"]`),tips=editor.locator('[role="tooltip"]:visible');
  assert(!(await editor.textContent()).includes('\uFFFD'),'The workshop must never replace accented letters with broken characters');
  assert((await editor.locator('[data-ce-select] small').first().textContent()).includes('énergie · Commune · niv. 1'));
  assert(await field('name').evaluate(el=>parseFloat(getComputedStyle(el).fontSize)>=14));assert(await editor.locator('[data-ce-select] small').first().evaluate(el=>parseFloat(getComputedStyle(el).fontSize)>=12));
  await editor.locator('[data-ce-action="duplicate"]').click();await field('name').fill('Écho d’été');await field('target').selectOption('point');
  await field('radius').fill('1.2');await field('coreRadius').fill('0.5');assert.equal(await field('outerScale').inputValue(),'50');
  const radiusHelp=editor.getByRole('button',{name:'Aide : Rayon extérieur',exact:true});
  if(width>500)await field('radius').hover();else await radiusHelp.tap();await tips.waitFor();assert((await tips.textContent()).includes('180 au départ'));
  let box=await tips.boundingBox();assert(box.x>=0&&box.x+box.width<=width&&box.y>=0&&box.y+box.height<=900,'The help fits the screen without clipping');
  if(width>500){await tips.hover();await page.waitForTimeout(250);assert.equal(await tips.count(),1,'Hoverable help remains open when the pointer moves onto its text');}
  await page.keyboard.press('Escape');assert.equal(await tips.count(),0);assert(await editor.isVisible(),'Escape closes help before closing the editor');
  await field('radius').focus();await radiusHelp.focus();await tips.waitFor();await page.keyboard.press('Tab');assert.equal(await tips.count(),0,'Keyboard navigation dismisses help');
  await field('coreRadius').fill('10');assert.equal(await field('coreRadius').getAttribute('aria-invalid'),'true');assert((await editor.locator('[data-ce-validation]').textContent()).includes('ne peut pas dépasser'));
  assert(await editor.locator('[data-ce-action="test"]').isDisabled());assert(await editor.locator('[data-ce-action="save"]').isDisabled());assert((await editor.locator('.ce-preview-card').textContent()).includes('Aperçu en pause'));
  await field('coreRadius').fill('0.5');await field('outerScale').fill('5');assert((await editor.locator('.ce-preview-card').textContent()).includes('couronne 5 %'),'Percent input 5 means 5%, never 500%');
  await field('outerScale').fill('101');assert.equal(await field('outerScale').getAttribute('aria-invalid'),'true');await field('outerScale').fill('50');
  await field('radius').fill('0.3');assert.equal(await field('coreRadius').getAttribute('aria-invalid'),'true','Shrinking the outer radius revalidates its core immediately');await field('radius').fill('1.2');
  await field('cost').fill('');assert.equal(await field('cost').getAttribute('aria-invalid'),'true','An empty number must not silently become zero');await editor.locator('[data-ce-action="add-effect"]').click();assert.equal(await field('cost').inputValue(),'');await editor.locator('[data-ce-action="undo"]').click();assert.equal(await field('cost').inputValue(),'','Undo and rerender preserve an empty draft number instead of inventing zero');await field('cost').fill('1');
  await editor.locator('[data-ce-threshold]').check();await field('threshold-tempo').fill('3');await field('threshold-bonus').fill('2');
  for(const type of Object.keys(EFFECTS)){
   await field('type').selectOption(type);if(type==='power')await field('formula').selectOption('spend');
   for(const control of await editor.locator('[data-ce-field], [data-ce-threshold], [data-ce-retired]').all()){
    if(!await control.isVisible())continue;
    const description=await control.evaluate(el=>el.getAttribute('aria-describedby').split(' ').map(id=>document.getElementById(id)?.textContent||'').join(' '));
    assert(description.length>30&&!/undefined|\uFFFD/.test(description),'Every displayed field has an accurate accessible description, including effect-specific fields');
   }
  }
  await field('type').selectOption('power');for(const condition of Object.keys(CONDITIONS)){await field('when').selectOption(condition);await editor.getByRole('button',{name:'Aide : Condition',exact:true}).focus();assert(!(await tips.textContent()).includes('undefined'));await page.keyboard.press('Escape');}
  await field('when').selectOption('always');await field('formula').selectOption('spend');await field('limit').fill('4');await field('multiplier').fill('2');await field('strikes').fill('3');
  await editor.getByRole('button',{name:'Aide : Frappes',exact:true}).focus();await tips.waitFor();assert((await tips.textContent()).includes('2 + 2 + 2'));await page.keyboard.press('Escape');
  // Changing a number must preserve the next click; rerender-on-blur previously swallowed it.
  await field('outerScale').fill('50');await editor.locator('[data-ce-action="save"]').click();assert((await editor.locator('[data-ce-status]').textContent()).includes('Catalogue appliqué'));
  const stored=await page.evaluate(()=>JSON.parse(localStorage.getItem('garage-vivant-v1')).cardCatalog),copy=stored.cards.find(c=>c.name==='Écho d’été');assert(copy);assert.equal(copy.outerScale,.5);validateCatalog(stored);
  const downloadPromise=page.waitForEvent('download');await editor.locator('[data-ce-action="export"]').click();const download=await downloadPromise,filename=await download.path(),exported=JSON.parse(await readFile(filename,'utf8'));assert.equal(exported.cards.find(c=>c.id===copy.id).outerScale,.5,'JSON keeps the existing fractional format');
  await editor.locator('[data-ce-file]').setInputFiles(filename);await page.waitForFunction(()=>document.querySelector('[data-ce-status]')?.textContent.includes('Catalogue importé'));assert.equal(await field('outerScale').inputValue(),'50','Import converts a stored fraction back to a readable percentage');
  exported.cards.find(c=>c.id===copy.id).outerScale=.335;await editor.locator('[data-ce-file]').setInputFiles({name:'fraction.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(exported))});await page.waitForFunction(()=>document.querySelector('[data-ce-field="outerScale"]')?.value==='33.5');assert(await editor.locator('[data-ce-action="save"]').isEnabled(),'Previously valid fractional proportions remain editable');await field('outerScale').fill('50');
  await radiusHelp.scrollIntoViewIfNeeded();await radiusHelp.click();await tips.waitFor();box=await tips.boundingBox();assert(box.x>=0&&box.x+box.width<=width);assert(await editor.evaluate(el=>el.scrollWidth<=el.clientWidth),'The workshop does not overflow horizontally');
  if(width<500){const form=await editor.locator('main').boundingBox(),preview=await editor.locator('.ce-preview').boundingBox();assert(preview.y>=form.y+form.height-1,'The phone preview follows the full form instead of overlapping its fields');}
  await page.screenshot({path:`test-results/card-editor-help-${width}.png`});await editor.locator('[data-ce-action="close"]').click();assert.equal(await tips.count(),0);assert.deepEqual(errors,[]);await page.close();
 }
 console.log('Card workshop passed: UTF-8 typography, readable fields, help for every effect/condition, hover/keyboard/touch, bounded tooltips, live numeric errors, percentages and unchanged JSON format.');
}catch(error){if(page&&!page.isClosed())await page.screenshot({path:'test-results/card-editor-help-failure.png'});throw error;}finally{await browser?.close();child.kill();}
