import {readFile,stat,readdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {Script} from 'node:vm';
import {createHash} from 'node:crypto';
const root=fileURLToPath(new URL('../',import.meta.url));
const html=await readFile(path.join(root,'index.html'),'utf8');
const css=await readFile(path.join(root,'styles.css'),'utf8');
const js=await readFile(path.join(root,'app.js'),'utf8');
const errors=[];
new Script(js,{filename:'app.js'});
const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(match=>match[1]);
for(const id of new Set(ids))if(ids.filter(item=>item===id).length>1)errors.push(`Duplicate id: ${id}`);
const references=[...html.matchAll(/(?:href|src|poster|data-src|data-image)="([^"]+)"/g)].map(match=>match[1]);
references.push(...[...css.matchAll(/url\(['"]?([^)'"\s]+)['"]?\)/g)].map(match=>match[1]));
let checked=0;
for(const reference of new Set(references)){
  if(/^(?:https?:|mailto:|data:)/.test(reference))continue;
  if(reference.startsWith('#')){if(reference.length>1&&!ids.includes(reference.slice(1)))errors.push(`Missing anchor: ${reference}`);continue;}
  if(reference.startsWith('/'))errors.push(`Asset uses a root path: ${reference}`);
  try{const info=await stat(path.join(root,reference.split('#')[0]));if(!info.isFile())errors.push(`Not a file: ${reference}`);checked++;}catch{errors.push(`Missing file: ${reference}`);}
}
for(const image of html.matchAll(/<img\b[^>]*>/g))if(!/\balt="[^"]*"/.test(image[0]))errors.push('Image missing alt text');
if(!html.includes('prefers-reduced-motion')&&!css.includes('prefers-reduced-motion'))errors.push('Reduced motion is not supported');
if(!html.includes('<html lang="en">'))errors.push('Language missing');
if(/TODO|PLACEHOLDER|your-username|lorem ipsum/i.test(html+css+js))errors.push('Unresolved placeholder');
const demos=JSON.parse(await readFile(path.join(root,'assets/videos/robot-demos.json'),'utf8'));
const videoTags=[...html.matchAll(/<video\b[^>]*\bdata-robot-video\b[^>]*>[\s\S]*?<\/video>/g)].map(match=>match[0]);
const attr=(tag,name)=>tag.match(new RegExp(`\\b${name}="([^"]+)"`))?.[1];
if(demos.clips.length!==8||videoTags.length!==8)errors.push('The robot gallery must expose all eight original clips');
if(new Set(demos.clips.map(clip=>clip.source_sha256)).size!==8)errors.push('Robot clips must be distinct original recordings');
const pairs=new Map();
for(const clip of demos.clips){
  const tag=videoTags.find(tag=>attr(tag,'id')===clip.id);
  if(!tag){errors.push(`Missing robot clip: ${clip.id}`);continue;}
  if(attr(tag,'src')!==clip.video||attr(tag,'poster')!==clip.poster||attr(tag,'data-pair')!==clip.pair)errors.push(`Robot clip mapping changed: ${clip.id}`);
  if(Number(attr(tag,'data-source-speed'))!==clip.source_speed||![2,3].includes(clip.source_speed))errors.push(`Incorrect source playback speed: ${clip.id}`);
  if(!/\bcontrols\b/.test(tag)||!/\bpreload="none"/.test(tag))errors.push(`Robot clip needs accessible, on-demand playback: ${clip.id}`);
  const hash=createHash('sha256').update(await readFile(path.join(root,clip.video))).digest('hex');
  if(hash!==clip.sha256)errors.push(`Robot clip differs from its provenance manifest: ${clip.id}`);
  const methods=pairs.get(clip.pair)||[];methods.push(clip.method);pairs.set(clip.pair,methods);
}
if(pairs.size!==4||[...pairs.values()].some(methods=>methods.length!==2||!methods.includes('baseline')||!methods.includes('merl')))errors.push('Each of the four robot comparisons needs one baseline and one MERL clip');
const checks=[['79.7%',html.includes('79.7')],['80.0%',html.includes('80.0')],['physical sample size',html.includes('32 / 40')],['S2T caveat',html.includes('not wall-clock speedups')],['source speed normalization',demos.effective_playback_speed===2&&html.includes('2× equivalent physical-time playback')],['illustrative inputs',html.includes('not a measured training trace')]];
for(const [name,ok] of checks)if(!ok)errors.push(`Research guardrail missing: ${name}`);
if(errors.length)throw new Error(errors.join('\n'));
console.log(`Verified ${checked} local resource references, ${ids.length} unique IDs, eight original robot clips in four pairs, JavaScript syntax, relative paths and research guardrails.`);
