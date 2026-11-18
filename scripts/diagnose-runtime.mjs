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
    '--disable-gpu','--disable-dev-shm-usage','--no-first-run',
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
  console.log('BROWSER_ERRORS',JSON.stringify(errors).slice(0,24000));
}catch(e){console.log('BROWSER_DIAG_BLOCKER',String(e));process.exitCode=1;}
finally{
  try{ws?.close();}catch{}
  try{chrome?.kill();}catch{}
  try{rmSync(profile,{recursive:true,force:true});}catch{}
}
