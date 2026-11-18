/** Diagnose console exceptions on the actual GitHub Pages website. */
import {spawn} from 'node:child_process';
import {mkdtempSync,readFileSync,existsSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';

const site=process.env.PAGES_URL;
const profile=mkdtempSync(join(tmpdir(),'pages-debug-'));
let chrome,ws;
try{
  if(typeof WebSocket!=='function') throw new Error('Node 20 WebSocket support unavailable');
  chrome=spawn('google-chrome',[
    '--headless=new','--no-sandbox','--ignore-certificate-errors',
    '--disable-gpu','--enable-unsafe-swiftshader','--disable-dev-shm-usage','--no-first-run',
    '--remote-allow-origins=*','--remote-debugging-port=0',
    '--user-data-dir='+profile,'about:blank'
  ],{stdio:'ignore'});
  const file=join(profile,'DevToolsActivePort');
  let port;
  for(let i=0;i<80;i++){
    if(existsSync(file)){port=readFileSync(file,'utf8').split('\n')[0];break;}
    await new Promise(resolve=>setTimeout(resolve,125));
  }
  if(!port)throw new Error('Browser debug port never opened');
  const targets=await (await fetch('http://127.0.0.1:'+port+'/json/list')).json();
  const page=targets.find(t=>t.type==='page');
  if(!page)throw new Error('Browser page target absent');
  ws=new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((ok,fail)=>{
    ws.addEventListener('open',ok,{once:true});
    ws.addEventListener('error',fail,{once:true});
  });
  const errors=[];
  ws.addEventListener('message',event=>{
    let x;try{x=JSON.parse(event.data);}catch{return;}
    const p=x.params||{};
    if(x.id&&x.result?.result?.value) console.log('BROWSER_STATE',JSON.stringify(x.result.result.value));
    if(x.method==='Runtime.exceptionThrown'){
      errors.push({type:'exception',text:p.exceptionDetails?.text,
      message:p.exceptionDetails?.exception?.description,url:p.exceptionDetails?.url,
      callFrames:p.exceptionDetails?.stackTrace?.callFrames?.slice(0,5)});
    }
    if(x.method==='Runtime.consoleAPICalled'&&['error','assert'].includes(p.type)){
      errors.push({type:'console',args:p.args?.map(a=>a.value??a.description).slice(0,4),
      stack:p.stackTrace?.callFrames?.slice(0,3)});
    }
    if(x.method==='Log.entryAdded'&&p.entry?.level==='error') errors.push({type:'log',entry:p.entry});
    if(x.method==='Network.loadingFailed')errors.push({type:'network',url:p.requestId,reason:p.errorText});
  });
  let id=0;
  const cmd=(method,params={})=>ws.send(JSON.stringify({id:++id,method,params}));
  cmd('Runtime.enable');cmd('Page.enable');cmd('Network.enable');cmd('Log.enable');
  await new Promise(ok=>setTimeout(ok,300));
  cmd('Page.navigate',{url:site+'?cdp-probe='+Date.now()});
  await new Promise(ok=>setTimeout(ok,9000));
  cmd('Runtime.evaluate',{expression:'({title:document.title,root:document.documentElement.id,hasMain:!!document.querySelector("#main"),loaded:document.documentElement.hasAttribute("data-loaded"),bodyText:document.body?.innerText?.slice(0,200)})',returnByValue:true});
  await new Promise(ok=>setTimeout(ok,500));

  // Inspeccionar canvas WebGL ACTUAL (no solo HTML y errores React).
  const meshProbe = `(() => {
    const canvas = document.querySelector('canvas[class*="flowCanvas"]');
    const root = document.querySelector('#hero');
    const css = canvas ? getComputedStyle(canvas) : null;
    const rect = canvas?.getBoundingClientRect();
    const gl = canvas?.getContext('webgl');
    const program = gl?.getParameter(gl.CURRENT_PROGRAM);
    const colors = ['blue','orange','cyan','black','white'].map(key => {
      const val = getComputedStyle(document.documentElement).getPropertyValue('--brand-'+key).trim();
      return [key,val];
    });
    let uniforms = null;
    if (gl && program) {
      uniforms = {};
      for (const name of ['u_bg','u_deep','u_body','u_hot','u_accent']) {
        const location = gl.getUniformLocation(program,name);
        const value = location ? gl.getUniform(program,location) : null;
        uniforms[name] = value ? Array.from(value) : null;
      }
    }
    return {
      canvasFound: !!canvas,
      element: canvas?.outerHTML.slice(0,400),
      css: css && {display:css.display,opacity:css.opacity,visibility:css.visibility,width:css.width,height:css.height},
      rect: rect && {x:rect.x,y:rect.y,width:rect.width,height:rect.height},
      bitmap:canvas && {width:canvas.width,height:canvas.height},
      parentOpacity:canvas?.parentElement && getComputedStyle(canvas.parentElement).opacity,
      heroOpacity:root && getComputedStyle(root).opacity,
      webglSupported:!!gl,
      programBound:!!program,
      linkStatus:program ? gl.getProgramParameter(program,gl.LINK_STATUS):null,
      activeUniforms:program ? gl.getProgramParameter(program,gl.ACTIVE_UNIFORMS):null,
      uniforms,
      glError:gl?.getError(),
      colors
    };
  })()`;
  cmd('Runtime.evaluate',{expression:meshProbe,returnByValue:true});
  const shaderText = readFileSync(new URL('../src/components/FlowGradientBackground.tsx',import.meta.url),'utf8');
  const vert=shaderText.match(/const VERT = \`([\\s\\S]*?)\`/)?.[1];
  const frag=shaderText.match(/const FRAG = \`([\\s\\S]*?)\`/)?.[1];
  if (!vert || !frag) throw new Error('WebGL shader source could not be extracted');
  const compilationProbe = `(() => {
    const canvas = document.createElement('canvas'), gl = canvas.getContext('webgl');
    if (!gl) return {webglSupported:false};
    const program = gl.createProgram(), shaders=[];
    for (const [type,code] of [[gl.VERTEX_SHADER,${JSON.stringify(vert)}],[gl.FRAGMENT_SHADER,${JSON.stringify(frag)}]]) {
      const shader=gl.createShader(type);
      gl.shaderSource(shader,code); gl.compileShader(shader);
      shaders.push({type:type===gl.VERTEX_SHADER?'vertex':'fragment',
        ok:gl.getShaderParameter(shader,gl.COMPILE_STATUS),
        log:gl.getShaderInfoLog(shader)});
      gl.attachShader(program,shader);
    }
    gl.linkProgram(program);
    return {webglSupported:true,shaders,linked:gl.getProgramParameter(program,gl.LINK_STATUS),linkLog:gl.getProgramInfoLog(program)};
  })()`;
  cmd('Runtime.evaluate',{expression:compilationProbe,returnByValue:true});
  await new Promise(ok=>setTimeout(ok,500));
  console.log('BROWSER_ERRORS',JSON.stringify(errors).slice(0,24000));
}catch(e){console.log('BROWSER_DIAG_BLOCKER',String(e));process.exitCode=1;}
finally{
  try{ws?.close();}catch{}
  try{chrome?.kill();}catch{}
  try{rmSync(profile,{recursive:true,force:true});}catch{}
}
