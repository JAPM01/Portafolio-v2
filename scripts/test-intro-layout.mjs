import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";

const globals=readFileSync(new URL("../src/app/globals.css",import.meta.url),"utf8");
const intro=readFileSync(new URL("../src/components/intro.module.css",import.meta.url),"utf8");
const venn=readFileSync(new URL("../src/components/venn-flow.module.css",import.meta.url),"utf8");

test("Filosofía: tres elementos en la misma fila desktop, Venn entre ambos",()=>{
  const chrome=process.env.CHROME_BIN||"google-chrome";
  assert.equal(spawnSync(chrome,["--version"],{encoding:"utf8"}).status,0,
    "Se requiere Chromium para comprobar geometría de la retícula");
  const dir=mkdtempSync(join(tmpdir(),"intro-grid-"));
  try {
    const sheets=[globals.replace(/@import[^\n]*\n/g,""),intro,venn].join("\n");
    const markup=[
      '<section class="section"><div class="container site-grid layout">',
      '<div class="headingBlock"><h2>01. Mi filosofía</h2></div>',
      '<div class="copyColumn"><p class="copy">',
      'Me muevo entre el diseño, la tecnología y la usabilidad para abordar',
      'cada reto desde la raíz, tomando decisiones claras que se miden por resultados reales.',
      '</p></div>',
      '<div class="diagram"><div class="root"><svg class="svg" viewBox="0 0 640 530">',
      '<circle cx="240" cy="188" r="142"/><circle cx="400" cy="188" r="142"/>',
      '<circle cx="320" cy="315" r="142"/></svg></div></div>',
      '<div class="editorial"><div class="thoughts">',
      '<p class="thought">Entender a las personas.</p>',
      '<p class="thought">Observar antes de actuar.</p>',
      '<p class="thought">Definir los resultados.</p>',
      '</div></div></div></section>'
    ].join(" ");
    const html=[
      '<!doctype html><html><head><meta charset="utf-8"></head><body>',
      '<pre id="result"></pre><script>',
      '(async()=>{const css=__CSS__,markup=__MARKUP__,results=[];',
      'for(const width of [390,768,1024,1440,1920]){',
      'const frame=document.createElement("iframe");',
      'frame.style.width=width+"px";frame.style.height="1150px";',
      'frame.style.border="0";document.body.append(frame);',
      'await new Promise(resolve=>{frame.onload=resolve;',
      'frame.srcdoc="<html><head><style>"+css+"</style></head><body>"+markup+"</body></html>";});',
      'const doc=frame.contentDocument;',
      'const box=selector=>{const r=doc.querySelector(selector).getBoundingClientRect();',
      'return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,middle:(r.top+r.bottom)/2}};',
      'results.push({width,columns:getComputedStyle(doc.querySelector(".layout")).gridTemplateColumns.split(" ").length,',
      'copy:box(".copyColumn"),venn:box(".diagram"),right:box(".editorial")});',
      'frame.remove();}',
      'document.getElementById("result").textContent=JSON.stringify(results);',
      '})().catch(e=>document.getElementById("result").textContent=JSON.stringify({error:String(e),stack:e.stack}));',
      '</script></body></html>'
    ].join("\n").replace("__CSS__",JSON.stringify(sheets)).replace("__MARKUP__",JSON.stringify(markup));
    const file=join(dir,"intro-layout.html");
    writeFileSync(file,html);
    const result=spawnSync(chrome,[
      "--headless=new","--no-sandbox","--disable-gpu",
      "--disable-dev-shm-usage","--virtual-time-budget=8000",
      "--dump-dom","file://"+file
    ],{encoding:"utf8",timeout:40000,maxBuffer:8*1024*1024});
    assert.equal(result.status,0,result.stderr?.slice(-1500));
    const match=result.stdout.match(/<pre id="result">([^<]+)<\/pre>/);
    assert.ok(match,"Chrome no devolvió medidas: "+result.stdout.slice(-600));
    const rows=JSON.parse(match[1].replaceAll("&amp;","&"));
    assert.ok(Array.isArray(rows),JSON.stringify(rows));
    for(const row of rows) {
      const {width,columns,copy,venn,right}=row;
      if(width>=1024) {
        assert.equal(columns,12,width+": la retícula debe tener 12 columnas");
        assert.ok(copy.right<venn.left,width+": Venn no está a la derecha del manifiesto");
        assert.ok(venn.right<right.left,width+": Venn no está antes del texto derecho");
        assert.ok(Math.abs(copy.middle-venn.middle)<3,
          width+": el Venn se desplazó verticalmente respecto del manifiesto");
        assert.ok(Math.abs(right.middle-venn.middle)<3,
          width+": el Venn se desplazó verticalmente respecto del texto derecho");
      } else {
        assert.equal(columns,4,width+": la retícula móvil debe tener 4 columnas");
        assert.ok(copy.bottom<venn.top,width+": Venn debe seguir al manifiesto");
        assert.ok(venn.bottom<right.top,width+": el texto derecho debe seguir al Venn");
      }
      console.log("INTRO_LAYOUT_PASSED",width,"columnas",columns);
    }
  } finally {
    rmSync(dir,{recursive:true,force:true});
  }
});
