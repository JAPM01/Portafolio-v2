import {test} from "node:test";
import assert from "node:assert/strict";
import {readFileSync,mkdtempSync,rmSync,writeFileSync} from "node:fs";
import {spawnSync} from "node:child_process";
import {tmpdir} from "node:os";
import {join} from "node:path";

const css=readFileSync(new URL("../src/app/globals.css",import.meta.url),"utf8");
const levels=["h1","h2","h3","h4","h5","body","meta"];
test("Escala única: siete tamaños responsivos sin alias secundarios",()=>{
 for(const level of levels){
  const names=[...css.matchAll(new RegExp("--type-"+level+"-size\\s*:", "g"))];
  assert.equal(names.length,2,"El token "+level+" debe declararse para móvil y desktop");
 }
 assert.doesNotMatch(css,/--type-(?:caption|h6)-size\s*:/);
 assert.doesNotMatch(css,/--text-heading-[\w-]+\s*:/);
 assert.doesNotMatch(css,/--text-body-[\w-]+\s*:/);
 assert.match(css,/--type-ink:\s*var\(--brand-white\)/);
 assert.match(css,/--type-meta-ink:\s*var\(--brand-gray-6\)/);
});

test("Chromium: siete categorías, ocho escenarios responsivos y propagación individual",()=>{
 const chrome=process.env.CHROME_BIN||"google-chrome";
 const version=spawnSync(chrome,["--version"],{encoding:"utf8"});
 assert.equal(version.status,0,"Se requiere Chromium en CI: "+version.error);
 const dir=mkdtempSync(join(tmpdir(),"typography-chrome-"));
 try{
  const stripped=css.replace(/@import[^\n]*\n/g,"");
  const html=[
    '<!doctype html><html><head><meta charset="utf-8"></head><body>',
    '<pre id="result"></pre><script>',
    '(async()=>{',
    'const css=__CSS__,levels=__LEVELS__,results=[];',
    'const markup=levels.map(level=>"<span class=\\"type-"+level+"\\" data-level=\\""+level+"\\">Test</span>").join("");',
    'for(const width of [390,768,1440,1920]){',
    'const iframe=document.createElement("iframe");',
    'iframe.style.width=width+"px";iframe.style.height=({390:844,768:1024,1440:900,1920:1080}[width])+"px";iframe.style.border="0";document.body.append(iframe);',
    'await new Promise(ok=>{iframe.onload=ok;iframe.srcdoc="<html><head><style>"+css+"</style></head><body>"+markup+"</body></html>";});',
    'const doc=iframe.contentDocument,win=iframe.contentWindow,root=doc.documentElement;',
    'const measure=()=>{',
    'const output={};',
    'for(const level of levels){',
    'const el=doc.querySelector("[data-level=\\""+level+"\\"]");',
    'const computed=win.getComputedStyle(el);output[level]={size:computed.fontSize,color:computed.color};',
    '}',
    'output.surface=win.getComputedStyle(doc.body).backgroundColor;',
    'return output;',
    '};',
    'for(const theme of ["light","dark"]){',
    'root.dataset.theme=theme;',
    'const before=measure(),changed={};',
    'for(const level of levels){root.style.setProperty("--type-"+level+"-size","71px");changed[level]=measure();root.style.removeProperty("--type-"+level+"-size");}',
    'root.style.setProperty("--brand-white","#E7DDD1");',
    'const modifiedWhite=measure();root.style.removeProperty("--brand-white");',
    'results.push({width,theme,before,changed,modifiedWhite});',
    '}',
    'iframe.remove();',
    '}',
    'document.getElementById("result").textContent=JSON.stringify(results);',
    '})().catch(e=>document.getElementById("result").textContent=JSON.stringify({error:String(e),stack:e.stack}));',
    '</script></body></html>',
  ].join("\n").replace("__CSS__",JSON.stringify(stripped)).replace("__LEVELS__",JSON.stringify(levels));
  const filepath=join(dir,"probe.html");
  writeFileSync(filepath,html);
  const result=spawnSync(chrome,["--headless=new","--no-sandbox","--ignore-certificate-errors","--disable-gpu","--disable-dev-shm-usage","--virtual-time-budget=6000","--dump-dom","file://"+filepath],{encoding:"utf8",timeout:30000,maxBuffer:8000000});
  assert.equal(result.status,0,result.stderr?.slice(-1800));
  const match=result.stdout.match(/<pre id="result">([^<]+)<\/pre>/);
  assert.ok(match,"Chromium no devolvió mediciones: "+result.stdout.slice(-700));
  const data=JSON.parse(match[1].replaceAll("&amp;","&"));
  assert.ok(Array.isArray(data),JSON.stringify(data));
  assert.equal(data.length,8);
  for(const entry of data){
    const {width,theme,before,changed,modifiedWhite}=entry;
    const expected={
      390: {h1:76,h2:60,body:16,meta:14},
      768: {h1:100,h2:84,body:24,meta:16},
      1440:{h1:160,h2:136,body:32,meta:20},
      1920:{h1:184,h2:156,body:36,meta:24}
    };
    for(const [level,size] of Object.entries(expected[width])){
      assert.equal(parseFloat(before[level].size),size,
        width+"/"+theme+"/"+level+": escala editorial distinta de "+size+"px");
    }
    for(const level of levels){
      assert.match(before[level].size,/^\d+(?:\.\d+)?px$/,width+"/"+theme+"/"+level+" sin tamaño válido");
      assert.ok(parseFloat(before[level].size)>0);
      assert.equal(changed[level][level].size,"71px",width+"/"+theme+"/"+level+" no se propaga");
      for(const other of levels.filter(x=>x!==level)){
        assert.equal(changed[level][other].size,before[other].size,"Cambio de "+level+" afectó "+other);
      }
      assert.equal(before[level].color,level==="meta"?before.meta.color:before.body.color);
    }
    assert.notEqual(before.meta.color,before.body.color,width+"/"+theme+" meta sin distinción");
    assert.notEqual(modifiedWhite.body.color,before.body.color,width+"/"+theme+" blanco sin propagación");
    assert.notEqual(modifiedWhite.meta.color,before.meta.color,width+"/"+theme+" gris sin propagación");
  }
  console.log("TIPOGRAFÍA: siete tamaños, 390/768/1440/1920, light/dark; propagación validada");
 }finally{rmSync(dir,{recursive:true,force:true});}
});
