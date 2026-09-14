(()=>{
  'use strict';

  const nav=document.querySelector('.nav-online');
  const entry=document.querySelector('[data-ekodi-church-live-entry]');
  const join=entry?.querySelector('.church-live-join');
  const host=entry?.querySelector('.church-live-host');
  const endpoint='https://ekodi.kr/api/realtime/live?tenant=ekodichurch';
  const baseJoin='https://ekodi.kr/ekodichurch/live/';
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

  function wireMyEkodi(){
    const link=document.querySelector('.shell-my');
    if(!link)return;
    const rawDestination=link.dataset.ekodiDestination||link.getAttribute('href')||'/my/';
    const destination=new URL(rawDestination,location.origin).toString();
    link.dataset.ekodiDestination=destination;
    const login=new URL('/auth/',location.origin);
    login.searchParams.set('site','church');
    login.searchParams.set('return_to',destination);
    link.href=login.toString();
    link.setAttribute('aria-label','My EKODI 로그인 후 이동');
  }

  function ensureLiveDialog(){
    let dialog=document.getElementById('churchLiveDialog');
    if(dialog)return dialog;
    dialog=document.createElement('dialog');
    dialog.id='churchLiveDialog';
    dialog.className='church-live-dialog';
    dialog.setAttribute('aria-label','에코디교회 다국어 실시간 방송');
    dialog.innerHTML=`
      <div class="church-live-dialog-shell">
        <header class="church-live-dialog-head">
          <div><small>EKODI CHURCH · MULTILINGUAL LIVE</small><strong id="churchLiveDialogTitle">다국어 실시간 방송</strong></div>
          <div class="church-live-dialog-actions">
            <a id="churchLiveDialogFull" href="${baseJoin}" target="_self">전체 화면</a>
            <button type="button" data-church-live-close aria-label="닫기">닫기</button>
          </div>
        </header>
        <iframe id="churchLiveDialogFrame" title="에코디교회 다국어 실시간 방송" src="about:blank" allow="camera; microphone; autoplay; fullscreen; display-capture; clipboard-write" referrerpolicy="same-origin"></iframe>
      </div>`;
    document.body.append(dialog);
    const frame=dialog.querySelector('#churchLiveDialogFrame');
    dialog.querySelector('[data-church-live-close]')?.addEventListener('click',()=>dialog.close());
    dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close()});
    dialog.addEventListener('close',()=>{if(frame)frame.src='about:blank'});
    return dialog;
  }

  function openIntegratedLive(href,title){
    const dialog=ensureLiveDialog();
    if(typeof dialog.showModal!=='function'){
      location.assign(href);
      return;
    }
    const frame=dialog.querySelector('#churchLiveDialogFrame');
    const full=dialog.querySelector('#churchLiveDialogFull');
    const heading=dialog.querySelector('#churchLiveDialogTitle');
    if(frame)frame.src=href;
    if(full)full.href=href;
    if(heading)heading.textContent=title;
    dialog.showModal();
  }

  function wireIntegratedLive(){
    if(!entry)return;
    const eyebrow=entry.querySelector('.church-live-entry-copy>span');
    const title=entry.querySelector('.church-live-entry-copy>strong');
    const description=entry.querySelector('.church-live-entry-copy>small');
    if(eyebrow)eyebrow.textContent='LIVE · MULTILINGUAL · EKODI CHURCH';
    if(title)title.textContent='말씀은 하나로, 언어는 각자의 언어로.';
    if(description)description.textContent='실시간 예배를 원음 또는 선택한 언어로 듣고 참여합니다.';
    if(join){
      join.textContent='다국어 방송 참여';
      if(!join.dataset.ekodiIntegratedLive){
        join.dataset.ekodiIntegratedLive='true';
        join.addEventListener('click',event=>{
          if(event.defaultPrevented||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
          event.preventDefault();
          openIntegratedLive(join.href,'다국어 실시간 방송 참여');
        });
      }
    }
    if(host&&!host.dataset.ekodiIntegratedLive){
      host.dataset.ekodiIntegratedLive='true';
      host.addEventListener('click',event=>{
        if(event.defaultPrevented||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
        event.preventDefault();
        openIntegratedLive(host.href,'다국어 실시간 방송 스튜디오');
      });
    }
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
    if(!nav||!entry||document.hidden)return;
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

  wireMyEkodi();
  wireIntegratedLive();
  normalizeLanguageControl();

  const header=document.querySelector('.site-header');
  if(header){
    const observer=new MutationObserver(()=>{
      normalizeLanguageControl();
      wireMyEkodi();
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