import {cp,mkdir,rm,writeFile,stat} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=fileURLToPath(new URL('../',import.meta.url));
const output=path.resolve(root,'dist');
// The only recursive cleanup target is the explicitly verified workspace dist.
if(path.dirname(output)!==path.resolve(root)||path.basename(output)!=='dist')throw new Error('Unsafe build directory');
await import('./verify.mjs');
await rm(output,{recursive:true,force:true});
await mkdir(output,{recursive:true});
for(const name of ['index.html','styles.css','app.js','assets','robots.txt','sitemap.xml'])await cp(path.join(root,name),path.join(output,name),{recursive:true});
await writeFile(path.join(output,'.nojekyll'),'');
console.log('Built static website in dist/ (relative asset paths; no server or runtime dependencies).');
