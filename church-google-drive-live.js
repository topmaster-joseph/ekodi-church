(() => {
'use strict';
const box=document.querySelector('[data-drive-panel]');
if(!box)return;
const path='/ekodichurch/worship/google-drive-public-sources.json';
const docs={bulletin:{id:box.querySelector('[data-drive-bulletin]'),link:box.querySelector('[data-drive-bulletin-edit]'),format:'document'},presentation:{id:box.querySelector('[data-drive-presentation]'),link:box.querySelector('[data-drive-presentation-edit]'),format:'presentation'}};
let manifest=[],active='',registered=null,refreshTimer=null;
const ident=v=>/^[A-Za-z0-9_-]{24,100}$/.test(String(v||''))?v:'';
const dateOK=v=>/^20\d{2}-\d{2}-\d{2}$/.test(String(v||''))&&new Date(v+'T00:00:00Z').toISOString().slice(0,10)===v;
function link(format,id){return 'https://docs.google.com/'+format+'/d/'+id+'/edit';}
function preview(format,id){
  const base='https://docs.google.com/'+format+'/d/'+id+'/preview';
  return base+'?ekodi_refreshed='+String(Date.now());
}
function updateFrames(){
  if(!registered||document.hidden)return;
  for(const [type,{id:frame,link:edit,format}] of Object.entries(docs)){
    const source=registered[type],sid=ident(source?.id);
    if(!sid){frame.removeAttribute('src');continue}
    frame.src=preview(format,sid);
    edit.href=link(format,sid);
  }
  box.querySelector('[data-drive-refreshed]').textContent='원본 새로고침 · '+new Intl.DateTimeFormat('ko-KR',{timeZone:'Asia/Seoul',hour:'2-digit',minute:'2-digit'}).format(new Date());
}
function show(date){
  if(!dateOK(date))return;
  active=date;
  registered=manifest.find(row=>row.date===date)||null;
  box.hidden=!registered;
  if(!registered){for(const v of Object.values(docs))v.id.removeAttribute('src');return}
  box.querySelector('[data-drive-date]').textContent=date+' · Google Drive 원본';
  updateFrames();
}
async function init(){
 try{
  const response=await fetch(path,{cache:'no-store'});
  if(!response.ok)throw Error('source_manifest_unavailable');
  const body=await response.json();
  if(body.schema!=='ekodi.church.worship.canonical-google-drive.v1'||!Array.isArray(body.services))throw Error('unverified_registry');
  manifest=body.services.filter(row=>dateOK(row.date)&&ident(row.bulletin?.id)&&ident(row.presentation?.id));
  show(document.querySelector('[data-weekly-date]')?.value||'2026-10-18');
 }catch{box.hidden=true;}
}
window.addEventListener('ekodi:weekly-service-selected',event=>show(event.detail?.date));
box.querySelector('[data-drive-reload]').addEventListener('click',updateFrames);
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&registered)updateFrames();});
refreshTimer=setInterval(()=>{if(registered&&!document.hidden)updateFrames()},60_000);
window.addEventListener('pagehide',()=>{if(refreshTimer)clearInterval(refreshTimer);});
init();
})();