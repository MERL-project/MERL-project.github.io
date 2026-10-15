return await page.evaluate(()=>({
  url:location.href,
  citationStatus:document.getElementById('announcement')?.textContent,
  citationButton:document.getElementById('copy-citation')?.textContent,
  viewport:innerWidth,documentWidth:document.documentElement.scrollWidth,
  trustCheckbox:document.getElementById('trust-enabled')?.checked,
  videos:[...document.querySelectorAll('video')].map(video=>({id:video.id,paused:video.paused,readyState:video.readyState,playbackRate:video.playbackRate})),
  navigation:[...document.querySelectorAll('#nav-links a')].map(e=>e.textContent)
}));
