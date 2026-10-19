import {readdirSync,readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
for (const dir of ['dist','scripts']) for (const name of readdirSync(dir)) {
  if (/\.(mjs|css|html)$/.test(name)) {
    const path=`${dir}/${name}`,source=new TextDecoder('utf-8',{fatal:true}).decode(readFileSync(path));
    if(source.includes('\uFFFD'))throw Error('Caractère de remplacement dans '+path);
  }
  if (name.endsWith('.mjs')) execFileSync(process.execPath,['--check',`${dir}/${name}`],{stdio:'inherit'});
}
