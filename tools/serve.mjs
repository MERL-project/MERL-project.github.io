import http from 'node:http';
import {createReadStream} from 'node:fs';
import {stat} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=fileURLToPath(new URL(process.argv.includes('--dist')?'../dist/':'../',import.meta.url));
const port=Number(process.env.MERL_PREVIEW_PORT||4173);
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml','.webp':'image/webp','.png':'image/png','.woff2':'font/woff2','.pdf':'application/pdf','.mp4':'video/mp4','.xml':'application/xml','.txt':'text/plain; charset=utf-8'};
const server=http.createServer(async(req,res)=>{
  try{
    let relative=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    if(relative.startsWith('/MERL-project/'))relative=relative.slice('/MERL-project'.length);
    if(relative==='/'||relative==='')relative='/index.html';
    const file=path.resolve(root,'.'+relative);
    if(!file.startsWith(path.resolve(root)+path.sep)||relative.split('/').some(part=>part.startsWith('.'))){res.writeHead(403).end();return;}
    const info=await stat(file);
    if(!info.isFile()||!types[path.extname(file)]){res.writeHead(404).end();return;}
    const headers={'Content-Type':types[path.extname(file)],'Cache-Control':'no-cache','Accept-Ranges':'bytes','X-Content-Type-Options':'nosniff'};
    const range=req.headers.range?.match(/^bytes=(\d+)-(\d*)$/);
    if(range){
      const start=Number(range[1]),end=Math.min(range[2]?Number(range[2]):info.size-1,info.size-1);
      if(start>=info.size||end<start){res.writeHead(416,{'Content-Range':`bytes */${info.size}`}).end();return;}
      res.writeHead(206,{...headers,'Content-Range':`bytes ${start}-${end}/${info.size}`,'Content-Length':end-start+1});
      if(req.method==='HEAD'){res.end();return;}createReadStream(file,{start,end}).pipe(res);
    }else{
      res.writeHead(200,{...headers,'Content-Length':info.size});
      if(req.method==='HEAD'){res.end();return;}createReadStream(file).pipe(res);
    }
  }catch{res.writeHead(404,{'Content-Type':'text/plain'}).end('Not found');}
});
server.listen(port,'127.0.0.1',()=>console.log(`MERL preview: http://127.0.0.1:${port}/MERL-project/`));
