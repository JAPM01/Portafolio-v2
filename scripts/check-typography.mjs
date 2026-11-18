#!/usr/bin/env node
/**
 * Single source of typography: --type-h1..h5/body/meta-size in globals.css.
 * Text colors: white and two-step neutral only.
 * No alternate scales, inline pixel sizes, local typography overrides.
 * Read only: never modifies application files.
 */
import {readFileSync,readdirSync} from "node:fs";
import {resolve,join,relative} from "node:path";

const ROOT=resolve(import.meta.dirname,"..");
const TYPE_FILE="src/app/globals.css";
const LEVELS=["h1","h2","h3","h4","h5","body","meta"];
const SIZE_TOKENS=new Set(LEVELS.map(x=>"--type-"+x+"-size"));
const TYPE_COLORS=new Set(["--type-ink","--type-meta-ink"]);
const CSS_EXT=/\.(?:css|scss)$/i;
const CODE_EXT=/\.(?:tsx?|jsx?|svg|mjs|js|glsl|wgsl)$/i;
const OMIT=new Set(["scripts/check-typography.mjs","scripts/check-typography.test.mjs","scripts/test-typography-propagation.mjs"]);
const FONT_SIZE=/\bfont-size\s*:\s*([^;{}]+)/gi;
const FONT_SHORTHAND=/(?:^|[;{}\n])\s*font\s*:\s*([^;{}]+)/gi;
const COLOR_PROP=/(?:^|[;{}\n])\s*color\s*:\s*([^;{}]+)/gi;
const TYPE_DEF=/--type-([\w-]+)\s*:\s*([^;{}]+);/gi;
const USE_SIZE=/^\s*var\(\s*(--type-(?:h[1-5]|body|meta)-size)\s*\)\s*$/i;
const USE_COLOR=/^\s*var\(\s*(--type-ink|--type-meta-ink)\s*\)\s*$/i;
const INHERITED=new Set(["inherit","currentcolor","transparent","unset","initial"]);
function files(dir,result=[]){
 for(const entry of readdirSync(dir,{withFileTypes:true})){
  const path=join(dir,entry.name);
  if(entry.isDirectory())files(path,result);
  else if(entry.isFile()&&(CSS_EXT.test(entry.name)||CODE_EXT.test(entry.name))){
   const name=relative(ROOT,path).replaceAll("\\","/");
   if(!OMIT.has(name))result.push({name,code:readFileSync(path,"utf8")});
  }
 }
 return result;
}
function stripComments(s){
 return s.replace(/\/\*[\s\S]*?\*\//g,m=>m.replace(/[^\n]/g," "))
   .replace(/^[ \t]*\/\/[^\n]*/gm,m=>" ".repeat(m.length));
}
function where(s,i){return s.slice(0,i).split("\n").length;}
function checkFile(name,code,errors){
 const s=stripComments(code);
 for(const m of s.matchAll(TYPE_DEF)){
  const token="--type-"+m[1];
  if(!name.endsWith("globals.css")||(token.endsWith("-size")&&!SIZE_TOKENS.has(token))){
   errors.push(name+":"+where(s,m.index)+": token tipográfico definido fuera de la escala: "+token);
  }
 }
 if(CSS_EXT.test(name)){
  for(const m of s.matchAll(FONT_SIZE)){
   if(!USE_SIZE.test(m[1].trim())){
    errors.push(name+":"+where(s,m.index)+": font-size fuera de h1-h5/body/meta: "+m[1].trim());
   }
  }
  for(const m of s.matchAll(FONT_SHORTHAND)){
   errors.push(name+":"+where(s,m.index)+": shorthand font: prohibido; usar font-size con token");
  }
  for(const m of s.matchAll(COLOR_PROP)){
   const value=m[1].trim();
   if(!USE_COLOR.test(value)&&!INHERITED.has(value.toLowerCase())){
    errors.push(name+":"+where(s,m.index)+": color de texto fuera de blanco/meta: "+value);
   }
  }
 }else{
  // JSX, SVG, inline React styles and literals in JS.
  for(const m of s.matchAll(/\bfontSize\s*=\s*(?:"([^"]+)"|'([^']+)'|\{\s*([^}]+)\s*\})/g)){
   const val=(m[1]??m[2]??m[3]).trim();
   if(!USE_SIZE.test(val)){
    errors.push(name+":"+where(s,m.index)+": fontSize literal fuera de escala: "+val);
   }
  }
  for(const m of s.matchAll(/\bfontSize\s*:\s*(?:"([^"]+)"|'([^']+)'|([^,}\n]+))/g)){
   const val=(m[1]??m[2]??m[3]).trim();
   if(!USE_SIZE.test(val)){
    errors.push(name+":"+where(s,m.index)+": fontSize inline no autorizado: "+val);
   }
  }
  // Text-specific SVG attributes, not decorative fill/stroke.
  for(const m of s.matchAll(/<text\b[^>]*?\bfill\s*=\s*["']([^"']+)["']/gi)){
   const val=m[1].trim();
   if(val!=="currentColor"&&!USE_COLOR.test(val)){
    errors.push(name+":"+where(s,m.index)+": SVG text fill independiente: "+val);
   }
  }
 }
}
function validateRoot(code,errors){
 const s=stripComments(code);
 const defs=[...s.matchAll(TYPE_DEF)];
 const counts=new Map();
 for(const m of defs){
  const token="--type-"+m[1],val=m[2].trim();
  counts.set(token,(counts.get(token)??0)+1);
  if(token.endsWith("-size")&&!SIZE_TOKENS.has(token)){
   errors.push(TYPE_FILE+":"+where(s,m.index)+": tamaño extra declarado: "+token);
  }
  if(TYPE_COLORS.has(token)){
   const required=token==="--type-ink"?"var(--brand-white)":"var(--brand-gray-5)";
   if(val!==required)errors.push(TYPE_FILE+":"+where(s,m.index)+": fuente de color tipográfico alterada: "+token);
  }
  if(SIZE_TOKENS.has(token)&&/var\(\s*--type-(?:h[1-5]|body|meta)-size/.test(val)){
   errors.push(TYPE_FILE+":"+where(s,m.index)+": tamaño dependiente de otra categoría: "+token);
  }
 }
 for(const token of SIZE_TOKENS){
  const expected=token==="--type-body-size"?3:2;
  if(counts.get(token)!==expected){
   errors.push(TYPE_FILE+": tamaño "+token+" necesita exactamente "+expected+" definiciones responsivas");
  }
 }
 for(const token of TYPE_COLORS){
  if(counts.get(token)!==1){
   errors.push(TYPE_FILE+": "+token+" debe existir exactamente una vez");
  }
 }
 // No size token may be declared in component scopes or dark theme.
 const allowedRoot=s.match(/:root\s*\{[\s\S]*?^\}/gm)??[];
 const outside=s.replace(/:root\s*\{[\s\S]*?^\}/gm,"");
 if(/--type-(?:h[1-5]|body|meta)-size\s*:/.test(outside)){
  errors.push(TYPE_FILE+": tamaño redefinido fuera de :root");
 }
 if(allowedRoot.length<2)errors.push(TYPE_FILE+": faltan las definiciones responsivas en :root");
}
const fixtureAt=process.argv.indexOf("--fixture");
const fileNameAt=process.argv.indexOf("--fixture-name");
const fixture=fixtureAt>=0?process.argv[fixtureAt+1]:undefined;
const filename=fileNameAt>=0?process.argv[fileNameAt+1]:"src/__typography_fixture.css";
const errors=[];
if(fixture){
 const data=readFileSync(fixture,"utf8");
 checkFile(filename,data,errors);
 if(filename===TYPE_FILE)validateRoot(data,errors);
}else{
 const all=["src","public","scripts"].flatMap(dir=>files(join(ROOT,dir)));
 for(const file of all)checkFile(file.name,file.code,errors);
 const root=all.find(x=>x.name===TYPE_FILE);
 if(!root)errors.push(TYPE_FILE+" missing");
 else validateRoot(root.code,errors);
}
if(errors.length){
 console.error("TYPOGRAPHY GUARD: ROJO ("+errors.length+" infracciones)");
 for(const msg of errors)console.error(" - "+msg);
 process.exitCode=1;
}else console.log("TYPOGRAPHY GUARD: VERDE. Siete tamaños responsivos, dos colores tipográficos y una fuente de verdad.");
