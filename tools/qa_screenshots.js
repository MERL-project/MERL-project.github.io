await page.emulateMedia({reducedMotion:'reduce'});
await page.setViewportSize({width:1440,height:1000});
await page.goto('http://127.0.0.1:4173/MERL-project/',{waitUntil:'networkidle'});
await page.evaluate(()=>document.fonts.ready);
const shots=[];
for(const id of ['main','trust','robots']){
  if(id==='main')await page.evaluate(()=>scrollTo(0,0));
  else await page.locator('#'+id).evaluate(element=>element.scrollIntoView({block:'start',behavior:'instant'}));
  shots.push({view:id,shot:await page.screenshot({fullPage:false})});
}
await page.setViewportSize({width:390,height:844});
await page.evaluate(()=>scrollTo(0,0));
shots.push({view:'mobile-hero',shot:await page.screenshot({fullPage:false})});
await page.locator('.trust-lab').evaluate(element=>element.scrollIntoView({block:'start',behavior:'instant'}));
shots.push({view:'mobile-trust',shot:await page.screenshot({fullPage:false})});
await page.locator('.robot-showcase').evaluate(element=>element.scrollIntoView({block:'start',behavior:'instant'}));
shots.push({view:'mobile-robots',shot:await page.screenshot({fullPage:false})});
return shots;
