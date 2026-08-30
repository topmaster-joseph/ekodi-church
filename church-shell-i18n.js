(()=>{
'use strict';
if(window.__EKODI_CHURCH_SHELL_I18N_BOOTED)return;
window.__EKODI_CHURCH_SHELL_I18N_BOOTED=true;

const MAP=Object.freeze({
  '♫ MR 재생':{en:'♫ Play MR','zh-CN':'♫ 播放 MR',ja:'♫ MR 再生'},
  'MR 재생':{en:'Play MR','zh-CN':'播放 MR',ja:'MR 再生'},
  '♫ MR 일시정지':{en:'♫ Pause MR','zh-CN':'♫ 暂停 MR',ja:'♫ MR 一時停止'},
  'MR 일시정지':{en:'Pause MR','zh-CN':'暂停 MR',ja:'MR 一時停止'},
  '♫ MR 정지':{en:'♫ Stop MR','zh-CN':'♫ 停止 MR',ja:'♫ MR 停止'},
  'MR 정지':{en:'Stop MR','zh-CN':'停止 MR',ja:'MR 停止'},
  'MR 끄기':{en:'Turn off MR','zh-CN':'关闭 MR',ja:'MR をオフ'},
  'MR 켜기':{en:'Turn on MR','zh-CN':'开启 MR',ja:'MR をオン'}
});
const states=new WeakMap();
let scheduled=false;

function locale(){
  const raw=String(window.EKODIChurchI18n?.getLocale?.()||document.documentElement.dataset.ekodiLocale||document.documentElement.lang||'ko-KR');
  if(raw.startsWith('en'))return'en';
  if(raw.startsWith('zh'))return'zh-CN';
  if(raw.startsWith('ja'))return'ja';
  return'ko-KR';
}
function translated(source){
  const lang=locale();
  if(lang==='ko-KR')return source;
  return MAP[source]?.[lang]||source;
}
function stateFor(node,value){
  let state=states.get(node);
  if(!state){state={source:value,last:value};states.set(node,state);}
  else if(value!==state.last){state.source=value;state.last=value;}
  return state;
}
function translateText(node){
  if(!node?.parentElement)return;
  const current=String(node.nodeValue||'');
  const state=stateFor(node,current);
  const trimmed=state.source.trim();
  if(!MAP[trimmed])return;
  const lead=state.source.match(/^\s*/)?.[0]||'';
  const tail=state.source.match(/\s*$/)?.[0]||'';
  const next=`${lead}${translated(trimmed)}${tail}`;
  if(node.nodeValue!==next)node.nodeValue=next;
  state.last=next;
}
function run(){
  scheduled=false;
  const root=document.body||document.documentElement;
  const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
  let node;
  while((node=walker.nextNode()))translateText(node);
  root.querySelectorAll?.('[aria-label],[title]').forEach(node=>{
    const aria=node.getAttribute('aria-label');
    const title=node.getAttribute('title');
    if(aria&&MAP[aria.trim()])node.setAttribute('aria-label',translated(aria.trim()));
    if(title&&MAP[title.trim()])node.setAttribute('title',translated(title.trim()));
  });
}
function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(run);}
function loadExtensions(){
  if(!document.querySelector('link[data-ekodi-church-header-tune]')){
    const link=document.createElement('link');
    link.rel='stylesheet';
    link.href='/church-header-tune.css';
    link.dataset.ekodiChurchHeaderTune='v1';
    document.head.append(link);
  }
  for(const src of ['/church-i18n-extended.js','/church-i18n-payment-patch.js','/church-header-controls.js']){
    if(document.querySelector(`script[src="${src}"]`))continue;
    const script=document.createElement('script');
    script.src=src;
    script.defer=true;
    script.dataset.ekodiChurchExtension='v1';
    document.head.append(script);
  }
}

window.addEventListener('ekodi:locale-change',schedule);
window.addEventListener('ekodi:church-i18n-applied',schedule);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();
new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true,characterData:true});
loadExtensions();
})();