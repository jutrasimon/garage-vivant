import assert from 'node:assert/strict';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {chromium} from 'playwright';
import {restore} from '../dist/engine.mjs';
import {RELEASE_VERSION} from '../dist/release.mjs';
const browser=await chromium.launch(),page=await browser.newPage({reducedMotion:'reduce',viewport:{width:1440,height:1000}}),errors=[],network=[];
const worldKey='bandlive-private-normal-v1',original='garage-vivant-v1',sentinel='sauvegarde-originale-conservée';
page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(/^https?:/.test(r.url()))network.push(r.url());});
await page.addInitScript(({original,sentinel})=>{localStorage.setItem(original,sentinel);},{original,sentinel});
try{
 await page.goto(pathToFileURL(resolve(process.argv[2]||'BandLive-test/LANCER-BandLive.html')).href);
 assert((await page.title()).includes(RELEASE_VERSION));assert(await page.locator('#map-view').isVisible());assert(await page.locator('#bandlive-nav').isVisible());
 const world=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),worldKey);restore(world);assert(!world.performance);assert(!world.showEventId);
 await page.locator('[data-view="settings"]').click();await page.locator('#bandlive-enabled').check();assert(await page.locator('#bandlive-nav').isVisible());await page.reload();assert(await page.locator('#bandlive-nav').isVisible());assert(await page.locator('#map-view').isVisible());
 assert.equal(await page.evaluate(key=>localStorage.getItem(key),original),sentinel);assert.deepEqual(network,[]);assert.deepEqual(errors,[]);
 console.log('Build autonome : démarrage au quartier, aucun spectacle forcé, BandLive actif, activation conservée, sauvegarde originale intacte, aucune requête externe.');
}finally{await browser.close();}
