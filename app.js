/* MERL project page. All research numbers are transcribed from the supplied paper. */
(() => {
  'use strict';
  const $ = selector => document.querySelector(selector);
  const $$ = selector => [...document.querySelectorAll(selector)];
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const announcement = $('#announcement');
  const announce = message => { announcement.textContent = message; };

  // Native controls remain usable without JavaScript; small enhancements follow.
  const menu = $('.menu-toggle');
  menu.addEventListener('click', () => {
    const open = menu.getAttribute('aria-expanded') !== 'true';
    menu.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    $('#nav-links').classList.toggle('open', open);
  });
  $$('#nav-links a').forEach(link => link.addEventListener('click', () => {
    menu.setAttribute('aria-expanded', 'false');
    menu.setAttribute('aria-label', 'Open navigation');
    $('#nav-links').classList.remove('open');
  }));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') {
      menu.click(); menu.focus();
    }
  });
  let scrollQueued = false;
  function updateProgress() {
    const available = document.documentElement.scrollHeight - innerHeight;
    $('.reading-progress').style.width = `${available > 0 ? scrollY / available * 100 : 0}%`;
    scrollQueued = false;
  }
  addEventListener('scroll', () => {
    if (!scrollQueued) { scrollQueued = true; requestAnimationFrame(updateProgress); }
  }, {passive: true});
  updateProgress();
  if (!reducedMotion.matches && matchMedia('(pointer: fine)').matches) {
    const heroSection=$('.hero');
    heroSection.addEventListener('pointermove',event=>{
      const bounds=heroSection.getBoundingClientRect();
      heroSection.style.setProperty('--pointer-x',((event.clientX-bounds.left)/bounds.width-.5).toFixed(3));
      heroSection.style.setProperty('--pointer-y',((event.clientY-bounds.top)/bounds.height-.5).toFixed(3));
    },{passive:true});
    heroSection.addEventListener('pointerleave',()=>{heroSection.style.setProperty('--pointer-x','0');heroSection.style.setProperty('--pointer-y','0');});
  }

  function keyboardTabs(buttons, activate) {
    buttons.forEach((button, index) => button.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowRight') next = (index + 1) % buttons.length;
      if (event.key === 'ArrowLeft') next = (index - 1 + buttons.length) % buttons.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = buttons.length - 1;
      if (next !== undefined) { event.preventDefault(); activate(buttons[next]); buttons[next].focus(); }
    }));
  }

  const methodSteps = [
    {tag:'01 / GROUNDED EXPERIENCE',title:'Start with what the environment tells you.',
      copy:'The VLA policy executes action chunks and records observations, commands and sparse terminal success. These grounded trajectories support both policy learning and simulator adaptation.',
      detail:'Each policy call decodes categorical tokens into up to 8 steps of 7D continuous actions.',
      symbol:'π',name:'VLA POLICY',input:'RGB + language',output:'Grounded trajectories',label:'Observe · act · record'},
    {tag:'02 / SIMULATOR EVOLUTION & CALIBRATION',title:'Update the simulator. Measure its mismatch.',
      copy:'Grounded trajectories update the world model and progress proxy. Replaying the same stored actions from the same anchors creates matched predictions and residual targets, which refresh the residual predictor.',
      detail:'Calibration reuses recorded continuations and adds zero environment interaction.',
      symbol:'W',name:'EVOLVING SIMULATOR',input:'Stored action continuations',output:'Visual + proxy residuals',label:'Update · replay · calibrate'},
    {tag:'03 / STAGE-LEVEL TRUST',title:'Decide how much and how far to imagine.',
      copy:'A smoothed stage-level error controls the imagined loss coefficient ρ and rollout horizon h. Lower estimated error permits a stronger imagined branch and a longer simulated continuation.',
      detail:'The horizon spans 8–32 environment steps: 1–4 action-chunk equivalents, with a valid partial final chunk when needed.',
      symbol:'ρ, h',name:'GLOBAL SCHEDULER',input:'Smoothed calibration error',output:'Loss mixture + horizon',label:'How much? · How far?'},
    {tag:'04 / CHUNK-LEVEL TRUST',title:'Select useful chunks. Calibrate their influence.',
      copy:'Chunks within one stage can differ in reliability. A frozen residual predictor scores unpaired recursive imagination from available latents, actions, depth and stage context. Estimated errors determine sampling probabilities p and loss weights w.',
      detail:'Recursive scoring never queries future ground truth. Sampling probability and optimization weight serve different roles.',
      symbol:'p, w',name:'LOCAL TRUST',input:'Predicted local residuals',output:'Replay probability + weight',label:'Which chunks? · How much influence?'},
    {tag:'05 / MIXED POLICY OPTIMIZATION',title:'Learn from grounded and trusted imagined experience.',
      copy:'Grounded and imagined chunks are sampled independently. Both branches use a clipped token-probability objective, while the imagined branch uses trust-weighted losses. The mixed update improves the policy before the next stage.',
      detail:'The simulator, proxy and residual predictor remain frozen during imagination and the ensuing policy update.',
      symbol:'ℒ',name:'MIXED UPDATE',input:'Independent grounded + imagined batches',output:'Updated VLA policy',label:'(1 − ρ) ℒgrounded + ρ ℒimagined'}
  ];
  const methodButtons = $$('.pipeline-step');
  function activateMethod(button) {
    const data = methodSteps[Number(button.dataset.step)];
    methodButtons.forEach(item => {
      const active = item === button;
      item.classList.toggle('active', active);
      item.setAttribute('aria-selected', String(active));
      item.tabIndex = active ? 0 : -1;
    });
    $('#method-panel').setAttribute('aria-labelledby', button.id);
    for (const [selector,key] of [['#method-tag','tag'],['#method-title','title'],['#method-copy','copy'],['#method-detail','detail'],['#art-symbol','symbol'],['#art-name','name'],['#art-input','input'],['#art-output','output'],['#art-label','label']]) {
      $(selector).textContent = data[key];
    }
  }
  methodButtons.forEach(button => button.addEventListener('click', () => activateMethod(button)));
  keyboardTabs(methodButtons, activateMethod);

  const labButtons = $$('[data-lab]');
  function activateLab(button) {
    labButtons.forEach(item => {
      const active = item === button;
      item.classList.toggle('active', active);
      item.setAttribute('aria-selected', String(active));
      item.tabIndex = active ? 0 : -1;
      $(`#${item.dataset.lab}-panel`).hidden = !active;
    });
  }
  labButtons.forEach(button => button.addEventListener('click', () => activateLab(button)));
  keyboardTabs(labButtons, activateLab);

  for (let i = 0; i < 32; i++) $('#horizon-track').append(document.createElement('i'));
  function updateStage() {
    const normalizedError = Number($('#stage-error').value);
    // Appendix A schedules and current public configuration: kappa=1.
    const confidence = 1 / (1 + normalizedError);
    const rho = 0.05 + 0.90 * confidence;
    const horizon = Math.floor(8 + 24 * confidence);
    $('#stage-error-value').value = normalizedError.toFixed(2);
    $('#rho-value').value = rho.toFixed(3);
    $('#horizon-value').value = String(horizon);
    $('#horizon-chunks').textContent = (horizon / 8).toFixed(3).replace(/\.?0+$/, '');
    const grounded = (1 - rho) * 100, imagined = rho * 100;
    $('#grounded-share').style.width = `${grounded}%`;
    $('#imagined-share').style.width = `${imagined}%`;
    $('#grounded-share b').textContent = `${grounded.toFixed(1)}%`;
    $('#imagined-share b').textContent = `${imagined.toFixed(1)}%`;
    $$('#horizon-track i').forEach((element,index) => element.classList.toggle('active', index < horizon));
    $('#stage-error').setAttribute('aria-valuetext', `Normalized error ${normalizedError.toFixed(2)}; imagined loss coefficient ${rho.toFixed(3)}; horizon ${horizon} environment steps`);
  }
  $('#stage-error').addEventListener('input', updateStage);
  updateStage();

  function updateChunks() {
    const enabled = $('#trust-enabled').checked;
    const errors = [0.10,0.40,0.80,1.60];
    const priorities = errors.map(error => 1 / (error + 0.001));
    const total = priorities.reduce((a,b) => a+b,0);
    $('#chunk-rows').innerHTML = errors.map((error,index) => {
      const probability = enabled ? priorities[index] / total : 0.25;
      const weight = enabled ? Math.max(0.05, Math.exp(-error)) : 1;
      return `<div class="chunk-row"><span class="chunk-id">C${index+1}<small>ε = ${error.toFixed(2)}</small></span><div class="chunk-prob"><div class="track"><div class="fill" style="width:${probability*100}%"></div></div><span class="value">${(probability*100).toFixed(1)}%</span></div><span class="chunk-weight">${weight.toFixed(3)}</span></div>`;
    }).join('');
  }
  $('#trust-enabled').addEventListener('change', updateChunks);
  updateChunks();

  $$('[data-frame]').forEach(button => button.addEventListener('click', () => {
    const frame = Number(button.dataset.frame);
    $$('[data-frame]').forEach(item => {
      const active = item === button;
      item.classList.toggle('active', active); item.setAttribute('aria-pressed', String(active));
    });
    ['grounded','frozen','updated'].forEach(family => {
      const image = $(`#prediction-${family}`);
      image.src = `assets/images/${family}-${frame}.webp`;
      image.alt = `${family === 'grounded' ? 'Ground-truth' : family === 'frozen' ? 'Frozen-simulator' : 'Evolving-simulator'} frame ${frame+1} in the supplied qualitative comparison`;
    });
    $('#frame-label').textContent = `Sampled frame ${String(frame+1).padStart(2,'0')} / 08`;
  }));

  const comparisons = {
    external: [
      {name:'SimpleVLA-RL',sr:77.1,srSD:1.1,auc:67.8,aucSD:1.0,s2t:104.1,s2tSD:7.0},
      {name:'WMPO†',sr:75.4,srSD:1.2,auc:63.2,aucSD:1.3,s2t:149.6,s2tSD:10.2},
      {name:'WoVR†',sr:77.8,srSD:0.9,auc:68.4,aucSD:0.9,s2t:101.3,s2tSD:6.2},
      {name:'MERL',sr:79.7,srSD:0.7,auc:70.6,aucSD:0.8,s2t:92.1,s2tSD:4.8}
    ],
    ablation: [
      {name:'Online-Updated MBRL',sr:76.2,auc:65.4,s2t:139.6},
      {name:'+ Stage-level trust',sr:77.9,auc:68.4,s2t:113.2},
      {name:'+ Chunk-level trust',sr:77.5,auc:67.6,s2t:121.5},
      {name:'MERL · both levels',sr:79.7,auc:70.6,s2t:92.1}
    ]
  };
  let comparison = 'external', metric = 'sr';
  const metrics = {
    sr: {title:'Average success rate',max:100,mid:'50',end:'100%',unit:'percent'},
    auc: {title:'Normalized learning-curve area',max:100,mid:'50',end:'100',unit:'AUC points'},
    s2t: {title:'Stages to high success thresholds',max:180,mid:'90',end:'180 stages',unit:'refinement stages'}
  };
  const number = (row,key) => row[key].toFixed(1) + (row[`${key}SD`] !== undefined ? ` ± ${row[`${key}SD`].toFixed(1)}` : '');
  function renderResults() {
    const rows = comparisons[comparison], spec = metrics[metric];
    $('#chart-title').textContent = spec.title;
    $('#chart-statistic').textContent = comparison === 'external' ? 'Mean ± standard deviation · 3 training seeds' : 'Component controls · reported point estimates';
    $('#chart-mid').textContent = spec.mid;
    $('#chart-max').textContent = spec.end;
    $('#result-chart').innerHTML = rows.map((row,index) => {
      const value = row[metric], sd = row[`${metric}SD`];
      return `<div class="chart-row${index === rows.length-1 ? ' ours' : ''}"><span class="chart-name">${row.name}</span><div class="chart-bar-track"><div class="chart-bar" style="width:${value/spec.max*100}%"></div>${sd !== undefined ? `<div class="chart-error" style="left:${value/spec.max*100}%;width:${2*sd/spec.max*100}%"></div>` : ''}</div><span class="chart-number">${number(row,metric)}</span></div>`;
    }).join('');
    $('#result-chart').setAttribute('aria-label', `${spec.title}, ${rows.map(row => `${row.name}: ${number(row,metric)} ${spec.unit}`).join('; ')}`);
    $('#result-table tbody').innerHTML = rows.map(row => `<tr><th scope="row">${row.name}</th><td>${number(row,'sr')}</td><td>${number(row,'auc')}</td><td>${number(row,'s2t')}</td></tr>`).join('');
    $('#result-note').textContent = comparison === 'external'
      ? '† WMPO and WoVR are adapted to the same training and evaluation protocol; each WoVR seed uses an independent simulator. Error whiskers show ±1 standard deviation. Paper, Table 2.'
      : 'Both partial variants retain simulator evolution and add one trust level at a time. MERL enables both. These are reported point estimates without added uncertainty bars. Paper, Appendix D, Table 5.';
  }
  $$('[data-comparison]').forEach(button => button.addEventListener('click', () => {
    comparison = button.dataset.comparison;
    $$('[data-comparison]').forEach(item => {const active=item===button;item.classList.toggle('active',active);item.setAttribute('aria-pressed',String(active));});
    renderResults();
  }));
  $$('[data-metric]').forEach(button => button.addEventListener('click', () => {
    metric = button.dataset.metric;
    $$('[data-metric]').forEach(item => {const active=item===button;item.classList.toggle('active',active);item.setAttribute('aria-pressed',String(active));});
    renderResults();
  }));
  renderResults();

  const hero = $('#hero-video'), heroToggle = $('#hero-toggle');
  let heroVisible = false, heroUserPaused = false;
  function updateHeroButton() {
    heroToggle.setAttribute('aria-label', hero.paused ? 'Play hero demo' : 'Pause hero demo');
    heroToggle.querySelector('use').setAttribute('href',hero.paused ? '#i-play' : '#i-pause');
  }
  function loadHero() { if (!hero.getAttribute('src')) { hero.src = hero.dataset.src; hero.load(); } }
  heroToggle.addEventListener('click', async () => {
    if (hero.paused) { heroUserPaused=false;loadHero();try {await hero.play();} catch {announce('Video could not start. Please try again.');} }
    else {heroUserPaused=true;hero.pause();}
  });
  hero.addEventListener('play', updateHeroButton);hero.addEventListener('pause', updateHeroButton);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      heroVisible=entries[0].isIntersecting;
      if (heroVisible && !reducedMotion.matches && !navigator.connection?.saveData && !heroUserPaused && !document.hidden) {
        loadHero();hero.play().catch(updateHeroButton);
      } else if (!heroVisible) hero.pause();
    },{threshold:.2}).observe(hero);
  }

  const baseline = $('#baseline-video'), ours = $('#merl-video'), comparisonButton = $('#play-comparison');
  const videoPair = [baseline,ours];
  function enforceRates() {baseline.playbackRate=2/3;ours.playbackRate=1;}
  function updateComparisonButton() {
    const playing=videoPair.some(video => !video.paused && !video.ended);
    comparisonButton.querySelector('span').textContent = playing ? 'Pause both' : 'Play both · 2× equivalent';
    comparisonButton.querySelector('use').setAttribute('href',playing ? '#i-pause' : '#i-play');
  }
  for (const video of videoPair) {
    ['play','pause','ended'].forEach(event => video.addEventListener(event,updateComparisonButton));
    video.addEventListener('loadedmetadata', enforceRates);
    video.addEventListener('play', enforceRates);
    video.addEventListener('ratechange', () => {
      const target=video===baseline?2/3:1;
      if(Math.abs(video.playbackRate-target)>.0001)video.playbackRate=target;
    });
  }
  function metadataReady(video) {
    if(video.readyState>=1)return Promise.resolve();
    return new Promise((resolve,reject) => {
      const clear=()=>{video.removeEventListener('loadedmetadata',loaded);video.removeEventListener('error',failed);};
      const loaded=()=>{clear();resolve();};
      const failed=()=>{clear();reject(new Error('Video could not load'));};
      video.addEventListener('loadedmetadata',loaded,{once:true});video.addEventListener('error',failed,{once:true});video.load();
    });
  }
  comparisonButton.addEventListener('click',async () => {
    if(videoPair.some(video=>!video.paused&&!video.ended)){videoPair.forEach(video=>video.pause());return;}
    comparisonButton.disabled=true;
    try {
      await Promise.all(videoPair.map(metadataReady));
      videoPair.forEach(video=>{video.currentTime=0;});enforceRates();
      await Promise.all(videoPair.map(video=>video.play()));
    } catch {videoPair.forEach(video=>video.pause());announce('The video comparison could not start. Try the individual video controls.');}
    finally {comparisonButton.disabled=false;updateComparisonButton();}
  });
  $$('[data-task]').forEach(button => button.addEventListener('click', () => {
    const task=button.dataset.task;
    videoPair.forEach(video=>video.pause());
    baseline.poster=`assets/images/${task}-baseline.webp`;ours.poster=`assets/images/${task}-merl.webp`;
    baseline.src=`assets/videos/${task}-baseline.mp4`;ours.src=`assets/videos/${task}-merl.mp4`;
    baseline.load();ours.load();enforceRates();
    const taskName=task==='block'?'Block-to-Box':'Lid-to-Pot';
    baseline.setAttribute('aria-label',`Baseline ${taskName} physical robot example, normalized to two times effective speed`);
    ours.setAttribute('aria-label',`MERL-Full ${taskName} physical robot example at two times speed`);
    $('#robot-instruction').textContent=task==='block'?'“Put the block into the box.”':'“Put the lid onto the pot.”';
    $('#robot-success').textContent=task==='block'?'17 / 20 successful evaluation trials':'15 / 20 successful evaluation trials';
    $$('[data-task]').forEach(item=>{const active=item===button;item.classList.toggle('active',active);item.setAttribute('aria-pressed',String(active));});
    updateComparisonButton();
  }));
  enforceRates();
  document.addEventListener('visibilitychange',()=>{
    if(document.hidden){hero.pause();videoPair.forEach(video=>video.pause());}
    else if(heroVisible&&!heroUserPaused&&!reducedMotion.matches&&!navigator.connection?.saveData){hero.play().catch(()=>{});}
  });
  reducedMotion.addEventListener('change',()=>{if(reducedMotion.matches)hero.pause();});

  $('#copy-citation').addEventListener('click',async () => {
    const text=$('#bibtex').textContent;
    try {
      await navigator.clipboard.writeText(text);
      $('#copy-citation span').textContent='Copied';
      $('#copy-citation use').setAttribute('href','#i-check');announce('BibTeX citation copied to clipboard.');
      setTimeout(()=>{$('#copy-citation span').textContent='Copy citation';$('#copy-citation use').setAttribute('href','#i-copy');},2400);
    } catch {
      const range=document.createRange();range.selectNodeContents($('#bibtex'));const selection=getSelection();selection.removeAllRanges();selection.addRange(range);$('#bibtex').focus();announce('Citation selected. Use your keyboard copy command.');
    }
  });
  const figureDialog=$('#figure-dialog');
  $$('.figure-open').forEach(button=>button.addEventListener('click',()=>{
    $('#dialog-image').src=button.dataset.image;$('#dialog-image').alt=button.dataset.title;$('#figure-dialog-title').textContent=button.dataset.title;figureDialog.showModal();
  }));
  $('.dialog-close').addEventListener('click',()=>figureDialog.close());
  figureDialog.addEventListener('click',event=>{if(event.target===figureDialog){const r=figureDialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)figureDialog.close();}});

  if('IntersectionObserver' in window){
    const revealObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');revealObserver.unobserve(entry.target);}}),{threshold:.07});
    $$('.reveal').forEach(element=>revealObserver.observe(element));
    const navObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){$$('#nav-links a').forEach(link=>link.classList.toggle('active',link.getAttribute('href')===`#${entry.target.id}`));}}),{rootMargin:'-20% 0px -65% 0px'});
    ['method','trust','results','robots'].forEach(id=>navObserver.observe($(`#${id}`)));
    document.documentElement.classList.add('js');
  }
})();
