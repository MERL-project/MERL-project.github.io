await page.emulateMedia({reducedMotion:'reduce'});
await page.setViewportSize({width:1440,height:1000});
await page.goto('http://127.0.0.1:4173/MERL-project/',{waitUntil:'networkidle'});
const shots=[];
for(const id of ['method','imagination','results']){
  await page.locator('#'+id).evaluate(element=>element.scrollIntoView({block:'start',behavior:'instant'}));
  shots.push({view:id,shot:await page.screenshot({fullPage:false})});
}
return shots;
