const errors=[];
page.on('pageerror',error=>errors.push(error.message));
const failures=[];
page.on('response',response=>{if(response.status()>=400&&response.url().includes('127.0.0.1'))failures.push({url:response.url(),status:response.status()});});
await page.setViewportSize({width:1440,height:1000});
await page.goto('http://127.0.0.1:4173/MERL-project/',{waitUntil:'networkidle'});
await page.evaluate(()=>document.fonts.ready);
const checks=[];
function check(name,value){if(!value)throw new Error(name);checks.push(name);}
await expect(page.locator('h1')).toHaveText('Trust-Calibrated VLA Policy Post-Training with Evolving Imagination');
check('paper identity',true);

await page.locator('[data-step="3"]').click();
await expect(page.locator('#method-title')).toHaveText('Select useful chunks. Calibrate their influence.');
await page.locator('[data-step="3"]').press('ArrowRight');
await expect(page.locator('#step-4')).toHaveAttribute('aria-selected','true');
await page.locator('#step-4').press('Home');
await expect(page.locator('#step-0')).toHaveAttribute('aria-selected','true');
check('method tabs and keyboard navigation',true);

for(const [error,rho,horizon] of [[0,'0.950','32'],[1,'0.500','20'],[4,'0.230','12']]){
  await page.locator('#stage-error').evaluate((element,value)=>{element.value=String(value);element.dispatchEvent(new Event('input',{bubbles:true}));},error);
  await expect(page.locator('#rho-value')).toHaveText(rho);
  await expect(page.locator('#horizon-value')).toHaveText(horizon);
  check(`stage schedule error=${error}`,true);
}
await page.locator('#chunk-tab').click();
await page.locator('#trust-enabled').uncheck();
check('uniform replay without trust',await page.locator('.chunk-prob .value').allTextContents().then(values=>values.every(value=>value==='25.0%')));
await page.locator('#trust-enabled').check();
const probabilities=await page.locator('.chunk-prob .value').allTextContents().then(values=>values.map(parseFloat));
check('normalized monotone chunk replay',Math.abs(probabilities.reduce((a,b)=>a+b)-100)<.15&&probabilities.every((value,index)=>index===0||value<probabilities[index-1]));
await page.locator('#stage-tab').click();
await page.locator('#stage-error').evaluate(element=>{element.value='1';element.dispatchEvent(new Event('input',{bubbles:true}));});

await page.locator('[data-frame="0"]').click();
await expect(page.locator('#prediction-grounded')).toHaveAttribute('src','assets/images/grounded-0.webp');
await page.locator('[data-frame="7"]').click();
check('original prediction-frame switching',true);
await page.locator('[data-comparison="ablation"]').click();
await page.locator('[data-metric="s2t"]').click();
check('ablation point estimates without invented error bars',await page.locator('.chart-error').count()===0);
await expect(page.locator('.chart-row.ours .chart-number')).toHaveText('92.1');
await page.locator('[data-comparison="external"]').click();
await page.locator('[data-metric="sr"]').click();
await expect(page.locator('.chart-row.ours .chart-number')).toHaveText('79.7 ± 0.7');
check('external comparisons with standard-deviation bars',await page.locator('.chart-error').count()===4);

await page.locator('[data-task="lid"]').click();
await expect(page.locator('#robot-success')).toHaveText('15 / 20 successful evaluation trials');
await page.locator('#play-comparison').click();
await page.waitForFunction(()=>['baseline-video','merl-video'].every(id=>document.getElementById(id).currentTime>0));
const rates=await page.evaluate(()=>({baseline:document.getElementById('baseline-video').playbackRate,merl:document.getElementById('merl-video').playbackRate}));
check('matched 2x effective playback',Math.abs(rates.baseline-2/3)<.0001&&rates.merl===1);
await page.locator('#play-comparison').click();
check('paired pause control',await page.locator('#baseline-video').evaluate(video=>video.paused)&&await page.locator('#merl-video').evaluate(video=>video.paused));
await page.locator('[data-task="block"]').click();

await page.locator('.learning-curves .figure-open').first().click();
check('figure modal opens',await page.locator('#figure-dialog').evaluate(dialog=>dialog.open));
await page.keyboard.press('Escape');
check('figure modal keyboard dismissal',!await page.locator('#figure-dialog').evaluate(dialog=>dialog.open));
await page.locator('#copy-citation').click();
await expect(page.locator('#announcement')).toHaveText(/copied|selected/);
check('citation copy or selectable fallback',true);

const layouts=[];
for(const width of [1440,1024,768,390,360]){
  await page.setViewportSize({width,height:width<701?844:1000});
  const layout=await page.evaluate(()=>({width:innerWidth,documentWidth:document.documentElement.scrollWidth,
    overflowing:[...document.querySelectorAll('main *')].filter(element=>{const box=element.getBoundingClientRect();return box.width>0&&(box.right>innerWidth+2||box.left<-2)&&getComputedStyle(element).position!=='absolute'&&!(element.closest('pre,.pipeline-tabs,.table-scroll,.figure-dialog'));}).slice(0,10).map(element=>({tag:element.tagName,class:element.className,width:element.getBoundingClientRect().width}))}));
  layouts.push(layout);check(`responsive layout ${width}px`,layout.documentWidth<=width+1);
}
await page.setViewportSize({width:390,height:844});
await page.locator('.menu-toggle').click();
await expect(page.locator('#nav-links')).toHaveClass('open');
await page.locator('#nav-links a[href="#trust"]').click();
await expect(page.locator('.menu-toggle')).toHaveAttribute('aria-expanded','false');
check('mobile navigation',true);

await page.emulateMedia({reducedMotion:'reduce'});
await page.reload({waitUntil:'networkidle'});
check('reduced-motion autoplay disabled',await page.locator('#hero-video').evaluate(video=>video.paused&&!video.getAttribute('src')));
await page.emulateMedia({reducedMotion:'no-preference'});
check('no JavaScript errors',errors.length===0);
check('no failed local resource requests',failures.length===0);
return {checks,layouts,errors,failures,rates};
