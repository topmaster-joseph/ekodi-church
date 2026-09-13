(()=>{
  'use strict';
  const nav=document.querySelector('.nav-online');
  const entry=document.querySelector('[data-ekodi-church-live-entry]');
  const join=entry?.querySelector('.church-live-join');
  if(!nav||!entry)return;
  const endpoint='https://ekodi.kr/api/realtime/live?tenant=ekodichurch';
  const baseJoin='https://ekodi.kr/ekodichurch/live/';
  let lastKnown=false;
  let inFlight=null;

  function apply(live,roomId=''){
    const active=Boolean(live&&roomId);
    const state=active?'true':'false';
    nav.dataset.live=state;
    entry.dataset.live=state;
    nav.dataset.liveStatus='fresh';
    entry.dataset.liveStatus='fresh';
    if(join)join.href=active?`${baseJoin}?room=${encodeURIComponent(roomId)}`:baseJoin;
    lastKnown=true;
  }

  function markUnavailable(){
    if(lastKnown){
      nav.dataset.liveStatus='stale';
      entry.dataset.liveStatus='stale';
      return;
    }
    nav.dataset.live='unknown';
    entry.dataset.live='unknown';
    nav.dataset.liveStatus='unknown';
    entry.dataset.liveStatus='unknown';
    if(join)join.href=baseJoin;
  }

  async function refresh(){
    if(document.hidden)return;
    if(inFlight)return inFlight;
    const controller=new AbortController();
    const timeout=setTimeout(()=>controller.abort(),8000);
    inFlight=(async()=>{
      try{
        const response=await fetch(endpoint,{cache:'no-store',headers:{accept:'application/json'},signal:controller.signal});
        if(!response.ok)throw new Error(`HTTP ${response.status}`);
        const data=await response.json();
        apply(Boolean(data.live),data.room?.id||'');
      }catch{
        markUnavailable();
      }finally{
        clearTimeout(timeout);
        inFlight=null;
      }
    })();
    return inFlight;
  }

  refresh();
  const timer=setInterval(refresh,60000);
  window.addEventListener('pagehide',()=>clearInterval(timer),{once:true});
  window.addEventListener('online',refresh);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh()});
})();