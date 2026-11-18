import {test} from "node:test";
import assert from "node:assert/strict";
import {spawnSync} from "node:child_process";
import {mkdtempSync,rmSync,writeFileSync,readFileSync} from "node:fs";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {fileURLToPath} from "node:url";

const guard=fileURLToPath(new URL("./check-typography.mjs",import.meta.url));
const original=readFileSync(new URL("../src/app/globals.css",import.meta.url),"utf8");
function check(content,name){
 const dir=mkdtempSync(join(tmpdir(),"typography-red-"));
 try{
  const file=join(dir,"fixture.txt");
  writeFileSync(file,content);
  return spawnSync(process.execPath,[guard,"--fixture",file,"--fixture-name",name],{encoding:"utf8"});
 }finally{rmSync(dir,{recursive:true,force:true});}
}
test("VERDE: el repositorio completo usa exclusivamente la escala tipográfica",()=>{
 const result=spawnSync(process.execPath,[guard],{encoding:"utf8"});
 assert.equal(result.status,0,result.stderr);
 assert.match(result.stdout,/TYPOGRAPHY GUARD: VERDE/);
});
const bad=[
 ["valor px suelto",".label { font-size: 17px; }"],
 ["valor rem suelto",".label { font-size: 1.1rem; }"],
 ["valor clamp independiente",".label { font-size: clamp(12px, 2vw, 18px); }"],
 ["tamaño arbitrario con calc",".label { font-size: calc(var(--type-h2-size) * 0.8); }"],
 ["tamaño de otra escala",".label { font-size: var(--legacy-heading-size); }"],
 ["font shorthand",".label { font: 600 14px/1.5 Manrope; }"],
 ["negro en texto",".label { color: black; }"],
 ["color azul de marca en texto",".label { color: var(--brand-blue); }"],
 ["mezcla arbitraria en texto",".label { color: color-mix(in srgb, var(--type-ink), transparent); }"],
 ["tres colores de texto",".label { color: rgb(255 0 0); }"],
 ["nuevo token de tamaño",".label { --type-caption-size: 15px; }"],
 ["redefinición local",".label { --type-h2-size: 100px; }"],
 ["color definido localmente",".label { --type-ink: var(--brand-black); }"],
];
for(const [title,css]of bad){
 test("ROJO demostrado: "+title,()=>{
  const result=check(css,"src/components/__forbidden.module.css");
  assert.equal(result.status,1,title+"\n"+result.stderr);
  assert.match(result.stderr,/TYPOGRAPHY GUARD: ROJO/);
  console.log("ROJO "+title+" -> salida 1");
 });
}
for(const [title,content,filename]of [
 ["SVG fontSize fijo",'<svg><text fontSize="20" fill="currentColor">JPM</text></svg>',"src/components/InvalidMark.tsx"],
 ["React fontSize inline",'const x = <span style={{ fontSize: "22px" }}>texto</span>;', "src/components/Invalid.tsx"],
 ["SVG texto color fijo",'<svg><text fill="#ff0000" fontSize="var(--type-body-size)">JPM</text></svg>',"src/components/InvalidMark.tsx"]
]){
 test("ROJO demostrado: "+title,()=>{
  const result=check(content,filename);
  assert.equal(result.status,1,title+"\n"+result.stderr);
  assert.match(result.stderr,/TYPOGRAPHY GUARD: ROJO/);
 });
}
test("ROJO demostrado: tamaño redefinido en dark theme",()=>{
 const result=check(original+'\n[data-theme="dark"] { --type-h2-size: 999px; }',"src/app/globals.css");
 assert.equal(result.status,1,result.stderr);
 assert.match(result.stderr,/TYPOGRAPHY GUARD: ROJO/);
});
test("ROJO demostrado: escala adicional dentro de globals.css",()=>{
 const badRoot=original.replace(/(--type-h5-size:\s*[^;]+;)/,"$1\n  --type-h6-size: 18px;");
 const result=check(badRoot,"src/app/globals.css");
 assert.equal(result.status,1,result.stderr);
 assert.match(result.stderr,/TYPOGRAPHY GUARD: ROJO/);
});
test("ROJO demostrado: token responsivo ausente",()=>{
 const badRoot=original.replace(/^\s*--type-h3-size:\s*[^;]+;/m,"");
 const result=check(badRoot,"src/app/globals.css");
 assert.equal(result.status,1,result.stderr);
 assert.match(result.stderr,/TYPOGRAPHY GUARD: ROJO/);
});
test("VERDE recuperado: valores aprobados sin overrides",()=>{
 const result=check(original,"src/app/globals.css");
 assert.equal(result.status,0,result.stderr);
});
