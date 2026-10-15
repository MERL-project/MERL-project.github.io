await page.setViewportSize({width:1440,height:1000});
await page.goto('http://127.0.0.1:4173/MERL-project/',{waitUntil:'networkidle'});
await page.evaluate(()=>document.fonts.ready);
return await page.screenshot({fullPage:false});
