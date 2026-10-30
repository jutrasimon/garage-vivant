import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {chromium} from 'playwright';
const server=spawn(process.execPath,['scripts/serve.mjs'],{env:{...process.env,PORT:'0'},stdio:['ignore','pipe','pipe']});let browser;
try{
 const url=await new Promise((resolve,reject)=>{let out='';server.on('error',reject);server.stdout.on('data',b=>{out+=b;const m=out.match(/http:\/\/127\.0\.0\.1:\d+\//);if(m)resolve(m[0]);});});browser=await chromium.launch();
 for(const width of [500,1440]){
  const page=await browser.newPage({viewport:{width,height:762}}),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(url+'arena.html');
  await page.locator('#cards').click();const editor=page.locator('.bl-card-editor');await editor.locator('[data-ce-field="category"]').selectOption('bass');await editor.locator('[data-ce-action="test"]').click();assert(await editor.isVisible());assert((await editor.locator('[data-ce-status]').textContent()).includes('absent du trio'));
  await editor.locator('[data-ce-field="category"]').selectOption('voice');await editor.getByRole('button',{name:/Refrain entraînant/}).click();assert.equal(await editor.locator('[data-ce-field="target"]').inputValue(),'radius');assert(await editor.locator('[data-ce-action="test"]').isDisabled());assert((await editor.locator('[data-ce-validation]').textContent()).includes('cible'));await editor.locator('[data-ce-field="target"]').selectOption('audience');assert(await editor.locator('[data-ce-action="test"]').isEnabled());
  await editor.locator('[data-ce-field="category"]').selectOption('guitar');await editor.locator('[data-ce-action="duplicate"]').click();await editor.locator('[data-ce-field="name"]').fill('Test conservé');await editor.locator('[data-ce-field="cost"]').fill('0');
  await editor.locator('[data-ce-action="add-effect"]').click();await editor.locator('[data-ce-field="type"]').last().selectOption('tempo');await editor.locator('[data-ce-field="amount"]').last().fill('12');
  await editor.locator('[data-ce-action="save"]').click();assert((await editor.locator('[data-ce-status]').textContent()).includes('Catalogue appliqué'));
  const before=await page.evaluate(()=>JSON.parse(localStorage.getItem('garage-vivant-arena-v1')).game);
  await editor.locator('[data-ce-action="test"]').click();assert(await editor.isHidden());assert(await page.getByRole('button',{name:'Test conservé · Axel',exact:true}).isVisible());
  const after=await page.evaluate(()=>JSON.parse(localStorage.getItem('garage-vivant-arena-v1')).game);assert.equal(after.turn,before.turn);assert.deepEqual(after.fans,before.fans);
  await page.reload();assert(await page.getByRole('button',{name:'Test conservé · Axel',exact:true}).isVisible());await page.locator('#cards').click();await editor.locator('[data-ce-field="category"]').selectOption('guitar');await editor.getByRole('button',{name:/Test conservé/}).click();assert.equal(await editor.locator('[data-ce-field="cost"]').inputValue(),'0');await editor.locator('[data-ce-action="retire"]').click();await editor.locator('[data-ce-action="save"]').click();await editor.locator('[data-ce-retired]').check();await editor.getByRole('button',{name:/Test conservé/}).click();await editor.locator('[data-ce-action="restore"]').click();await editor.locator('[data-ce-action="save"]').click();
  const footer=await editor.locator('footer').boundingBox();assert(footer.y>=0&&footer.y+footer.height<=762);await page.screenshot({path:`test-results/arena-tools-${width}.png`});assert.deepEqual(errors,[]);await page.close();
 }
 console.log('Arena tools passed: direct access, absent-instrument error retains editor, duplicate/edit/save/test in same show, reload, retire/restore and reachable footer at 500/1440.');
}finally{await browser?.close();server.kill();}
