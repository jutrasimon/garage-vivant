import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
import {fileURLToPath} from 'node:url';

// Explicit MIME types avoid Windows associations serving .mjs as text/plain.
const root=fileURLToPath(new URL('../dist/',import.meta.url));
const port=Number(process.env.PORT||8000);
const mime={'.html':'text/html','.mjs':'text/javascript','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.ico':'image/x-icon','.woff2':'font/woff2'};
const server=createServer(async(req,res)=>{
 try{
  if(!['GET','HEAD'].includes(req.method)){res.writeHead(405,{Allow:'GET, HEAD'});res.end();return;}
  const url=new URL(req.url,'http://localhost');
  let pathname=decodeURIComponent(url.pathname);
  // VitePress' client router also needs its configured Pages base path.
  if(/^\/docs(?:\/|$)/.test(pathname)){res.writeHead(302,{Location:'/garage-vivant'+url.pathname+url.search});res.end();return;}
  pathname=pathname.replace(/^\/garage-vivant(?=\/)/,'');
  if(pathname.endsWith('/'))pathname+='index.html';
  const path=resolve(root,'.'+pathname);
  if(!path.startsWith(root.endsWith(sep)?root:root+sep)){res.writeHead(403);res.end();return;}
  const data=await readFile(path);
  res.writeHead(200,{'Content-Type':mime[extname(path)]||'application/octet-stream','Cache-Control':'no-store'});
  res.end(req.method==='HEAD'?undefined:data);
 }catch{res.writeHead(404);res.end('Fichier introuvable.');}
});
server.on('error',error=>{console.error(error.message);process.exitCode=1;});
server.listen(port,'127.0.0.1',()=>console.log(`Garage vivant : http://127.0.0.1:${server.address().port}/`));
