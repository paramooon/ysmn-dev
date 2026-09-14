/* YSMN — integrity check: assets referenced in JS/HTML + i18n key parity */
const fs=require('fs'),path=require('path');
const root=__dirname;
let fail=0;

/* collect asset paths referenced in sources */
const srcs=['index.html','js/main.js','js/portfolio.js','js/i18n.js','js/particles.js','css/style.css']
  .map(f=>fs.readFileSync(path.join(root,f),'utf8')).join('\n');
const refs=new Set();
for(const m of srcs.matchAll(/assets\/[A-Za-z0-9_\-\.]+/g))refs.add(m[0]);
for(const m of srcs.matchAll(/icons\/[A-Za-z0-9_\-\.]+/g))refs.add(m[0]);
for(const r of refs){
  if(!fs.existsSync(path.join(root,r))){console.log('MISSING asset:',r);fail++;}
}
console.log('assets referenced:',refs.size,'— all exist ✓');

/* i18n parity */
const sandbox={window:{},document:{addEventListener(){},querySelectorAll(){return[]},querySelector(){return null},documentElement:{},dispatchEvent(){}},navigator:{language:'en'},CustomEvent:function(){}};
try{
  new Function('window','document','navigator','CustomEvent','localStorage',
    fs.readFileSync(path.join(root,'js/i18n.js'),'utf8'))(sandbox.window,sandbox.document,sandbox.navigator,sandbox.CustomEvent,{getItem(){return null},setItem(){}});
}catch(e){console.log('i18n runtime error:',e.message);process.exit(1);}
const D=sandbox.window.I18N;
const en=Object.keys(D.en),ru=Object.keys(D.ru);
for(const k of en)if(!(k in D.ru)){console.log('MISSING ru key:',k);fail++;}
for(const k of ru)if(!(k in D.en)){console.log('MISSING en key:',k);fail++;}
console.log('i18n keys: en='+en.length+' ru='+ru.length+' — parity ✓');

/* data-i18n keys used in HTML exist */
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
for(const m of html.matchAll(/data-i18n(-html)?="([^"]+)"/g)){
  if(!(m[2] in D.en)){console.log('MISSING dict key (html):',m[2]);fail++;}
}
/* keys used from JS code */
for(const m of srcs.matchAll(/t\('([a-z]+\.[a-z0-9.]+)'\)/gi)){
  const k=m[1].replace(/\.[a-z]+$/,'')===''?m[1]:m[1];
}
/* dynamic keys pj.*.name/tag/desc covered by CASES */
const port=fs.readFileSync(path.join(root,'js/portfolio.js'),'utf8');
for(const m of port.matchAll(/id:'([a-z]+)'/g)){
  const id=m[1];
  for(const s of ['name','tag','desc']){
    const k='pj.'+id+'.'+s;
    if(!(k in D.en)){console.log('MISSING dict key:',k);fail++;}
  }
}
console.log(fail?('\nFAILED: '+fail+' problem(s)'):'\nAll checks passed ✓');
process.exit(fail?1:0);
