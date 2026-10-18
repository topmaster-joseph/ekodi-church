(()=>{
  'use strict';

  const nav=document.querySelector('.nav-online');
  const entry=document.querySelector('[data-ekodi-church-live-entry]');
  const join=entry?.querySelector('.church-live-join');
  const host=entry?.querySelector('.church-live-host');
  const endpoint='https://ekodi.kr/api/realtime/live?tenant=ekodichurch';
  const baseJoin='/live/church/';
  let lastKnown=false;
  let inFlight=null;

  function normalizeLanguageControl(){
    const control=document.querySelector('[data-ekodi-language-control]');
    if(!control)return;
    control.querySelector('.ekodi-user-language__icon')?.remove();
    control.querySelector('.ekodi-user-language__label')?.remove();
    control.setAttribute('aria-label','언어 선택');
    const select=control.querySelector('.ekodi-user-language__select,select');
    if(!select)return;
    select.setAttribute('aria-label','언어 선택');
    select.title='언어 선택';
    select.style.borderRadius='999px';
  }

  function syncChurchMemberLink(){
    const link=document.querySelector('.site-header .shell-my');
    if(!link)return;
    // The Church member home determines whether login is needed and handles
    // its own return_to. Never hijack the public nav into global /auth/ or /my/.
    const local='/ekodichurch/my/';
    if(link.getAttribute('href')!==local)link.setAttribute('href',local);
    link.removeAttribute('data-ekodi-destination');
    // Use the visible localized nav text as its accessible name.
    link.removeAttribute('aria-label');
  }

  function apply(live,roomId=''){
    if(!nav||!entry)return;
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
    if(!nav||!entry)return;
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
    if(!nav||!entry)return;
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

  syncChurchMemberLink();
  normalizeLanguageControl();

  const header=document.querySelector('.site-header');
  if(header){
    const observer=new MutationObserver(()=>{
      normalizeLanguageControl();
      syncChurchMemberLink();
    });
    observer.observe(header,{childList:true,subtree:true});
    window.addEventListener('pagehide',()=>observer.disconnect(),{once:true});
  }

  refresh();
  const timer=setInterval(refresh,60000);
  window.addEventListener('pagehide',()=>clearInterval(timer),{once:true});
  window.addEventListener('online',refresh);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh()});
})();