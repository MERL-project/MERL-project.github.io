const urls = ['https://dreamzero0.github.io/', 'https://vgg-t.github.io/', 'https://diffusion-policy.cs.columbia.edu/'];
const output = [];
for (const [i,url] of urls.entries()) {
  const target = i === 0 ? page : await context.newPage();
  await target.goto(url,{waitUntil:'domcontentloaded'});
  await target.locator('h1').first().waitFor();
  output.push(await target.evaluate(() => ({url:location.href,title:document.title,
    heading:document.querySelector('h1')?.innerText,
    fonts:[...new Set([...document.querySelectorAll('h1,h2,p')].slice(0,30).map(e=>getComputedStyle(e).fontFamily))],
    videos:document.querySelectorAll('video').length,buttons:[...document.querySelectorAll('button')].slice(0,12).map(e=>e.innerText)})));
}
return output;
