(()=>{
  'use strict';
  const nav=document.querySelector('.nav-online');
  const entry=document.querySelector('[data-ekodi-church-live-entry]');
  const join=entry?.querySelector('.church-live-join');
  if(!nav||!entry)return;
  const endpoint='https://ekodi.kr/api/realtime/live?tenant=ekodichurch';
  const baseJoin='https://ekodi.kr/ekodichurch/live/';
  function apply(live,roomId=''){
    const active=Boolean(live&&roomId);
    const state=active?'true':'false';
    nav.dataset.live=state;
    entry.dataset.live=state;
    if(join)join.href=active?`${baseJoin}?room=${encodeURIComponent(roomId)}`:baseJoin;
  }
  async function refresh(){
    try{
      const response=await fetch(endpoint,{cache:'no-store',headers:{accept:'application/json'}});
      if(!response.ok)throw new Error(`HTTP ${response.status}`);
      const data=await response.json();
      apply(Boolean(data.live),data.room?.id||'');
    }catch{
      nav.dataset.live='unknown';
      entry.dataset.live='unknown';
      if(join)join.href=baseJoin;
    }
  }
  refresh();
  const timer=setInterval(refresh,60000);
  window.addEventListener('pagehide',()=>clearInterval(timer),{once:true});
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh()});
})();