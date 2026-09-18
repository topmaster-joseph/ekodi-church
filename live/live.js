(()=>{'use strict';
const API='https://ekodi.kr/api/realtime';
const TENANT='ekodichurch';
const SUPABASE_URL='https://renzehysxirjilvdxacv.supabase.co';
const PUBLISHABLE_KEY='sb_publishable_0QjB0WzZbjrd-FJ5D5cR7A_xUkXyOY_';
const AUTH_ATTEMPT_KEY='ekodi-live-auth-attempt';
const AUTH_ATTEMPT_WINDOW=120000;
const PENDING_START_KEY='ekodi-live-pending-start';
const PROGRAM_WIDTH=1280;
const PROGRAM_HEIGHT=720;
const PIP_SIZE=.25;
const RECORD_PART_TARGET=6*1024*1024;
const SUPPORTED_LANGUAGES=[
  {code:'en',label:'English'},
  {code:'zh',label:'中文'},
  {code:'ja',label:'日本語'},
  {code:'vi',label:'Tiếng Việt'},
  {code:'mn',label:'Монгол'}
];
const LAYOUTS=new Set(['presenter','pip','side','equal','screen']);
const setupParams=new URLSearchParams(location.search);
const $=id=>document.getElementById(id);
const state={room:null,pc:null,session:null,local:null,screen:null,program:null,remote:new MediaStream(),hosting:false,isLive:false,authClient:null,canvas:null,ctx:null,canvasStream:null,animationFrame:null,layout:'presenter',presenterPosition:{x:.732,y:.718},presenterDrag:null,overlayDrag:null,overlays:new Map(),extraCameras:new Map(),participantPulls:new Map(),participantPublish:null,chatMessages:[],chatTimer:null,participantTimer:null,recording:null,startedAt:0,timerId:null,studioPrepared:false,destinationCatalogLoaded:false};

function token(){try{const central=sessionStorage.getItem('ekodi-auth-token');if(central)return central;const church=JSON.parse(sessionStorage.getItem('ekodi-church-pastor-session')||'null');return church?.accessToken||''}catch{return''}}
function headers(json=false,session=false){const h=new Headers();if(token())h.set('authorization',`Bearer ${token()}`);if(json)h.set('content-type','application/json');if(session&&state.session?.accessKey)h.set('x-ekodi-session-key',state.session.accessKey);return h}
async function api(path,options={}){const h=headers(Boolean(options.body),Boolean(options.session));const r=await fetch(`${API}${path}`,{...options,headers:h,cache:'no-store'});const data=await r.json().catch(()=>({}));if(!r.ok){const e=new Error(data.error||`HTTP ${r.status}`);e.status=r.status;e.data=data;throw e}return data}
async function sessionApi(path,accessKey,options={}){
  const h=headers(Boolean(options.body),false);if(accessKey)h.set('x-ekodi-session-key',accessKey);
  const r=await fetch(`${API}${path}`,{...options,headers:h,cache:'no-store'});
  const data=await r.json().catch(()=>({}));if(!r.ok){const e=new Error(data.error||`HTTP ${r.status}`);e.status=r.status;e.data=data;throw e}return data;
}
function show(id){for(const key of ['entryView','studioView','viewerView'])$(key)?.classList.add('hidden');$(id)?.classList.remove('hidden')}
function note(message,target='statusLog'){$(target).textContent=message}
function safeReturnTo(studio=false){const back=new URL(location.href);const hash=new URLSearchParams(back.hash.replace(/^#/,''));if(['ekodi_token','ekodi_type','access_token','refresh_token'].some(key=>hash.has(key)))back.hash='';for(const key of ['ekodi_token','ekodi_type'])back.searchParams.delete(key);if(studio)back.searchParams.set('mode','studio');return back.toString()}
function login(studio=false){
  const now=Date.now();
  const previous=Number(sessionStorage.getItem(AUTH_ATTEMPT_KEY)||0);
  if(previous&&now-previous<AUTH_ATTEMPT_WINDOW){
    state.hosting=false;show('studioView');setPhase('error');if($('goLiveButton'))$('goLiveButton').disabled=false;sessionStorage.removeItem(PENDING_START_KEY);note('로그인 인증이 방송 권한으로 연결되지 않았습니다. 자동 재로그인은 중단했습니다. 로그인 상태를 확인한 뒤 방송 시작을 다시 눌러 주세요.');
    return null;
  }
  sessionStorage.setItem(AUTH_ATTEMPT_KEY,String(now));
  location.href=`https://ekodi.kr/auth/?site=church&return_to=${encodeURIComponent(safeReturnTo(studio))}`;
  return null;
}
function liveTitle(){const service=setupParams.get('service')||'';const date=setupParams.get('date')||'';const title=setupParams.get('title')||'';const scripture=setupParams.get('scripture')||'';const parts=[service,date,title,scripture].filter(Boolean);return parts.length?parts.join(' · ').slice(0,180):'에코디교회 실시간 예배'}
function storedSupabaseSession(){try{return JSON.parse(localStorage.getItem('sb-renzehysxirjilvdxacv-auth-token')||'null')}catch{return null}}
async function bootstrapCentralAuth(){
  const hash=new URLSearchParams(location.hash.replace(/^#/,''));
  const handoff=hash.get('ekodi_token');
  if(handoff){
    history.replaceState(null,'',location.pathname+location.search);
    try{
      const response=await fetch(`${SUPABASE_URL}/auth/v1/verify`,{method:'POST',headers:{apikey:PUBLISHABLE_KEY,'content-type':'application/json'},body:JSON.stringify({token_hash:handoff,type:hash.get('ekodi_type')||'email'})});
      const data=await response.json().catch(()=>({}));
      const access=data?.access_token||data?.session?.access_token||'';
      if(!response.ok||!access)throw new Error(data?.msg||data?.error_description||'login_handoff_failed');
      sessionStorage.setItem('ekodi-auth-token',access);
      const stored=storedSupabaseSession()||{};
      const refresh=data?.refresh_token||data?.session?.refresh_token||stored?.refresh_token||'';
      if(refresh)localStorage.setItem('sb-renzehysxirjilvdxacv-auth-token',JSON.stringify({...stored,...data,...(data?.session||{}),access_token:access,refresh_token:refresh}));
      sessionStorage.removeItem(AUTH_ATTEMPT_KEY);
      return true;
    }catch(error){
      console.warn('[EKODI Live auth handoff]',error?.message||error);
    }
  }
  try{
    const stored=storedSupabaseSession();
    if(stored?.access_token){sessionStorage.setItem('ekodi-auth-token',stored.access_token);sessionStorage.removeItem(AUTH_ATTEMPT_KEY);return true}
    if(stored?.refresh_token&&await refreshAuthToken())return true;
    if(token()){sessionStorage.removeItem(AUTH_ATTEMPT_KEY);return true}
  }catch(error){console.warn('[EKODI Live auth bootstrap]',error?.message||error)}
  return false
}
async function refreshAuthToken(){
  try{const stored=storedSupabaseSession();if(!stored?.refresh_token)return false;const response=await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`,{method:'POST',headers:{apikey:PUBLISHABLE_KEY,'content-type':'application/json'},body:JSON.stringify({refresh_token:stored.refresh_token})});const data=await response.json().catch(()=>({}));if(!response.ok||!data?.access_token)return false;sessionStorage.setItem('ekodi-auth-token',data.access_token);localStorage.setItem('sb-renzehysxirjilvdxacv-auth-token',JSON.stringify({...stored,...data}));sessionStorage.removeItem(AUTH_ATTEMPT_KEY);return true}catch{return false}
}
async function waitIce(pc){if(pc.iceGatheringState==='complete')return;await new Promise(resolve=>{const timer=setTimeout(resolve,2500);pc.addEventListener('icegatheringstatechange',()=>{if(pc.iceGatheringState==='complete'){clearTimeout(timer);resolve()}},{once:false})})}
function providerDescription(data){return data?.provider?.sessionDescription||data?.provider?.data?.sessionDescription||data?.sessionDescription||null}
function selectedLanguages(){return SUPPORTED_LANGUAGES.map(language=>language.code)}
function broadcastSelection(){const destinationIds=[...document.querySelectorAll('#externalDestinations input[data-destination]:checked')].map(input=>input.value).filter(Boolean);return {broadcastMode:destinationIds.length?'ekodi+external':'ekodi',destinationIds,multistream:destinationIds.length>0}}
function destinationReason(value){return ({channel_connection_required:'채널 연결 필요',live_provider_not_supported:'실시간 송출 미지원',live_permission_required:'실시간 권한 준비 필요',distribution_engine_pending:'외부 송출 엔진 준비 중'})[value]||'사용 준비 필요'}
function renderExternalDestinations(channels=[]){
  const root=$('externalDestinations');if(!root)return;
  root.replaceChildren();
  if(!channels.length){const empty=document.createElement('small');empty.textContent=token()?'연결된 외부 방송 채널이 없습니다. 관리자에서 채널을 연결한 뒤 다시 확인하세요.':'외부 방송 채널은 로그인 후 선택할 수 있습니다.';root.append(empty);return}
  for(const channel of channels){
    const label=document.createElement('label');label.className='destination-row';
    const input=document.createElement('input');input.type='checkbox';input.value=channel.id;input.dataset.destination='true';input.disabled=!channel.selectable||state.isLive;
    const copy=document.createElement('span');const strong=document.createElement('strong');strong.textContent=channel.label||channel.provider;const small=document.createElement('small');small.textContent=channel.selectable?'동시방송 선택 가능':destinationReason(channel.reason);copy.append(strong,small);label.append(input,copy);root.append(label);
  }
}
async function loadExternalDestinations(){
  if(!token()){state.destinationCatalogLoaded=false;renderExternalDestinations([]);return false}
  try{const data=await api(`/destinations/catalog?tenant=${TENANT}`);state.destinationCatalogLoaded=true;renderExternalDestinations(data.channels||[]);return true}
  catch(error){state.destinationCatalogLoaded=false;const root=$('externalDestinations');if(root)root.innerHTML='<small>외부 채널을 불러오지 못했습니다. 내부 방송과 자동 저장은 정상적으로 사용할 수 있습니다.</small>';note(`외부 채널 확인 실패: ${error.message}`);return false}
}
function lockDestinationSelection(){document.querySelectorAll('#externalDestinations input[data-destination]').forEach(input=>input.disabled=true);if($('refreshDestinationsButton'))$('refreshDestinationsButton').disabled=true}
function renderLanguageOptions(){
  const targets=[$('languageChips'),$('viewerLanguageChips')].filter(Boolean);
  for(const chips of targets){
    chips.replaceChildren(...SUPPORTED_LANGUAGES.map(language=>{const span=document.createElement('span');span.textContent=language.label;span.dataset.language=language.code;return span}));
  }
  if($('interpretationStatus'))$('interpretationStatus').textContent='자동동시통역 가능';
}
function setPhase(phase){
  const order=['idle','ready','live','ended'];
  const labels={idle:'대기',preparing:'준비 중',ready:'준비 완료',live:'LIVE',ended:'종료',error:'확인 필요'};
  const normalized=order.includes(phase)?phase:(phase==='preparing'?'idle':phase);
  const currentIndex=order.indexOf(normalized);
  document.querySelectorAll('#phaseFlow [data-phase]').forEach(item=>{
    const index=order.indexOf(item.dataset.phase);item.classList.toggle('active',item.dataset.phase===normalized);item.classList.toggle('complete',currentIndex>index);
  });
  if($('programBadge')){$('programBadge').textContent=labels[phase]||labels.idle;$('programBadge').dataset.phase=phase}
  if($('liveState')){$('liveState').textContent=phase==='live'?'현재 LIVE':labels[phase]||labels.idle;$('liveState').dataset.phase=phase}
}
function formatElapsed(ms){const seconds=Math.max(0,Math.floor(ms/1000));const h=String(Math.floor(seconds/3600)).padStart(2,'0');const m=String(Math.floor(seconds%3600/60)).padStart(2,'0');const s=String(seconds%60).padStart(2,'0');return `${h}:${m}:${s}`}
function startLiveClock(){state.startedAt=Date.now();clearInterval(state.timerId);const update=()=>{if($('liveTimer'))$('liveTimer').textContent=formatElapsed(Date.now()-state.startedAt)};update();state.timerId=setInterval(update,1000)}
function stopLiveClock(reset=false){clearInterval(state.timerId);state.timerId=null;if(reset&&$('liveTimer'))$('liveTimer').textContent='00:00:00'}
function setRecordingState(active,label='녹화 준비'){if(!$('recordingStatus'))return;$('recordingStatus').textContent=label;$('recordingStatus').dataset.recording=active?'true':'false';if($('recordingButton'))$('recordingButton').textContent=active?'● 녹화 중':'녹화 자동'}

function recordingMime(){
  for(const type of ['video/webm;codecs=vp9,opus','video/webm;codecs=vp8,opus','video/webm'])if(globalThis.MediaRecorder?.isTypeSupported?.(type))return type;
  return 'video/webm';
}
async function uploadRecordingBlob(rec,blob){
  const response=await fetch(`${API}/rooms/${encodeURIComponent(state.room.id)}/recordings/${encodeURIComponent(rec.id)}/parts/${rec.part++}`,{
    method:'PUT',
    headers:{authorization:`Bearer ${token()}`,'content-type':rec.mime},
    body:blob,
    cache:'no-store'
  });
  const data=await response.json().catch(()=>({}));
  if(!response.ok)throw new Error(data.error||`recording_part_${response.status}`);
  return data;
}
function flushRecordingPart(rec,force=false){
  if(!rec||!rec.pending.length||(!force&&rec.pendingBytes<RECORD_PART_TARGET))return;
  const blob=new Blob(rec.pending,{type:rec.mime});
  rec.pending=[];rec.pendingBytes=0;
  rec.queue=rec.queue.then(()=>uploadRecordingBlob(rec,blob)).catch(error=>{
    rec.failed=true;
    setRecordingState(false,'녹화 저장 지연');
    note(`녹화 저장 지연: ${error.message}. 실시간 방송은 계속됩니다.`);
  });
}
async function startManagedRecording(){
  const source=state.program||state.local;
  if(!state.room||!source)return false;
  if(!globalThis.MediaRecorder){
    setRecordingState(false,'녹화 미지원');
    note('현재 브라우저는 녹화를 지원하지 않습니다. 실시간 방송은 계속됩니다.');
    return false;
  }
  try{
    const mime=recordingMime();
    const created=await api(`/rooms/${state.room.id}/recordings`,{method:'POST',body:JSON.stringify({mimeType:mime,title:liveTitle(),retentionDays:180})});
    const rec={id:created.recording.id,mime,part:1,pending:[],pendingBytes:0,queue:Promise.resolve(),failed:false,media:null};
    const media=new MediaRecorder(source,{mimeType:mime});
    rec.media=media;state.recording=rec;
    media.ondataavailable=event=>{
      if(!event.data?.size)return;
      rec.pending.push(event.data);
      rec.pendingBytes+=event.data.size;
      flushRecordingPart(rec,false);
    };
    media.onerror=event=>{
      rec.failed=true;
      setRecordingState(false,'녹화 오류');
      note(`녹화 오류: ${event.error?.message||'recording_error'}. 실시간 방송은 계속됩니다.`);
    };
    media.start(5000);
    setRecordingState(true,'● 녹화 중');
    note('방송 중입니다. 녹화본은 안전 저장 후 EKODI 공유드라이브로 보관됩니다.');
    return true;
  }catch(error){
    state.recording=null;
    setRecordingState(false,'녹화 준비 실패');
    note(`방송은 시작됐지만 녹화 준비에 실패했습니다: ${error.message}`);
    return false;
  }
}
async function stopManagedRecording(){
  const rec=state.recording;
  if(!rec)return {ok:false,skipped:true};
  try{
    if(rec.media?.state!=='inactive'){
      await new Promise(resolve=>{
        rec.media.addEventListener('stop',resolve,{once:true});
        rec.media.stop();
      });
    }
    flushRecordingPart(rec,true);
    await rec.queue;
    if(rec.failed){
      await api(`/rooms/${state.room.id}/recordings/${rec.id}/abort`,{method:'POST',body:'{}'}).catch(()=>{});
      setRecordingState(false,'녹화 저장 실패');
      return {ok:false,failed:true};
    }
    const done=await api(`/rooms/${state.room.id}/recordings/${rec.id}/finalize`,{method:'POST',body:'{}'});
    setRecordingState(false,done.archive?.ok?'공유드라이브 보관 완료':'녹화 저장 완료 · 보관 대기');
    return {ok:true,...done};
  }catch(error){
    setRecordingState(false,'녹화 확정 실패');
    note(`방송은 종료됐지만 녹화 확정에 실패했습니다: ${error.message}`);
    return {ok:false,error};
  }finally{
    state.recording=null;
  }
}

async function createRoom(){
  const body={tenant:TENANT,mode:'worship',title:liveTitle(),interactiveParticipants:6,languages:selectedLanguages(),durationMinutes:180,recording:true,...broadcastSelection(),publicViewers:true,ai:true,metadata:{service:setupParams.get('service')||'',date:setupParams.get('date')||'',scripture:setupParams.get('scripture')||'',messageTitle:setupParams.get('title')||'',preacher:setupParams.get('preacher')||'',notice:setupParams.get('notice')||'',interpretationMode:'auto',sourceLanguage:'auto',supportedLanguages:selectedLanguages()}};
  const options={method:'POST',body:JSON.stringify(body)};
  try{const created=await api('/rooms',options);sessionStorage.removeItem(AUTH_ATTEMPT_KEY);return created}catch(error){
    if(error.status===401&&await refreshAuthToken()){
      try{const created=await api('/rooms',options);sessionStorage.removeItem(AUTH_ATTEMPT_KEY);return created}catch(retryError){error=retryError}
    }
    if(error.status===401)return login(true);
    if(error.status===402&&error.data?.subscriptionUrl){location.href=error.data.subscriptionUrl;return null}
    throw error;
  }
}
async function createSession(roomId,role){const data=await api(`/rooms/${encodeURIComponent(roomId)}/sessions`,{method:'POST',body:JSON.stringify({role})});state.session=data.session;state.pc=new RTCPeerConnection({iceServers:data.iceServers||[]});state.pc.onconnectionstatechange=()=>{$('connectionState').textContent=state.pc.connectionState;};return data}
function trackPayload(pc,stream,source='program'){return pc.getTransceivers().filter(t=>t.sender?.track&&stream.getTracks().includes(t.sender.track)).map((t,index)=>({mid:t.mid,trackName:`${source}-${t.sender.track.kind}-${Date.now()}-${index}`,kind:t.sender.track.kind,sourceType:t.sender.track.kind==='audio'?'microphone':source}))}
async function publishStream(stream,source='program'){
  for(const track of stream.getTracks())state.pc.addTrack(track,stream);
  const offer=await state.pc.createOffer();await state.pc.setLocalDescription(offer);await waitIce(state.pc);
  const tracks=trackPayload(state.pc,stream,source);if(tracks.some(t=>!t.mid))throw new Error('미디어 트랙 협상 준비가 완료되지 않았습니다.');
  const data=await api(`/rooms/${state.room.id}/sessions/${state.session.id}/publish`,{method:'POST',session:true,body:JSON.stringify({sessionDescription:state.pc.localDescription,tracks})});
  const answer=providerDescription(data);if(!answer?.sdp)throw new Error('미디어 서버의 연결 응답이 없습니다.');await state.pc.setRemoteDescription(answer);
  return data;
}

function setSourceVideo(id,stream){const video=$(id);if(!video)return;video.srcObject=stream;video.play?.().catch(()=>{})}
async function acquireCamera(){
  if(state.local)return state.local;
  const stream=await navigator.mediaDevices.getUserMedia({video:{width:{ideal:1280},height:{ideal:720}},audio:{echoCancellation:true,noiseSuppression:true,autoGainControl:true}});
  state.local=stream;setSourceVideo('cameraSource',stream);
  $('cameraButton')?.setAttribute('aria-pressed','true');$('micButton')?.setAttribute('aria-pressed','true');
  if($('cameraButton'))$('cameraButton').textContent='카메라';if($('micButton'))$('micButton').textContent='마이크';
  if($('programPlaceholder'))$('programPlaceholder').classList.add('hidden');
  ensureProgramStream();
  return stream;
}
function drawContained(ctx,video,x,y,w,h,fill='#090b0a'){
  ctx.fillStyle=fill;ctx.fillRect(x,y,w,h);
  if(!video||!video.videoWidth||!video.videoHeight)return;
  const scale=Math.min(w/video.videoWidth,h/video.videoHeight);const dw=video.videoWidth*scale;const dh=video.videoHeight*scale;ctx.drawImage(video,x+(w-dw)/2,y+(h-dh)/2,dw,dh);
}
function drawCovered(ctx,video,x,y,w,h){
  if(!video||!video.videoWidth||!video.videoHeight){ctx.fillStyle='#142019';ctx.fillRect(x,y,w,h);return}
  const scale=Math.max(w/video.videoWidth,h/video.videoHeight);const sw=w/scale;const sh=h/scale;const sx=(video.videoWidth-sw)/2;const sy=(video.videoHeight-sh)/2;ctx.drawImage(video,sx,sy,sw,sh,x,y,w,h);
}
function drawChatOverlay(ctx,overlay,w,h){
  const x=Math.round(overlay.x*w),y=Math.round(overlay.y*h),ow=Math.round(overlay.w*w),oh=Math.round(overlay.h*h);
  ctx.save();ctx.fillStyle='rgba(16,21,18,.82)';ctx.fillRect(x,y,ow,oh);ctx.strokeStyle='rgba(255,255,255,.35)';ctx.lineWidth=2;ctx.strokeRect(x,y,ow,oh);
  ctx.fillStyle='#fff';ctx.font='700 22px Pretendard, sans-serif';ctx.fillText('실시간 채팅',x+18,y+30);
  const rows=state.chatMessages.slice(-6);ctx.font='500 18px Pretendard, sans-serif';let lineY=y+60;
  for(const row of rows){
    const name=String(row.displayName||'참여자').slice(0,16),message=String(row.message||'').slice(0,70);
    ctx.fillStyle='#b9d1c1';ctx.font='700 16px Pretendard, sans-serif';ctx.fillText(name,x+18,lineY);
    ctx.fillStyle='#fff';ctx.font='500 17px Pretendard, sans-serif';const maxWidth=Math.max(80,ow-36);let text=message;
    while(ctx.measureText(text).width>maxWidth&&text.length>4)text=text.slice(0,-2);
    if(text!==message)text+='…';ctx.fillText(text,x+18,lineY+22);lineY+=51;if(lineY>y+oh-20)break;
  }
  ctx.restore();
}
function drawOverlaySources(ctx,w,h){
  for(const overlay of state.overlays.values()){
    if(!overlay.visible)continue;
    if(overlay.type==='chat'){drawChatOverlay(ctx,overlay,w,h);continue}
    const video=overlay.video;if(!video||!video.videoWidth)continue;
    const x=Math.round(overlay.x*w),y=Math.round(overlay.y*h),ow=Math.round(overlay.w*w),oh=Math.round(overlay.h*h);
    ctx.fillStyle='#f6f1e8';ctx.fillRect(x-3,y-3,ow+6,oh+6);drawCovered(ctx,video,x,y,ow,oh);
  }
}
function drawProgram(){
  if(!state.ctx||!state.canvas)return;
  const ctx=state.ctx;const w=state.canvas.width;const h=state.canvas.height;const camera=$('cameraSource');const screen=$('screenSource');
  ctx.fillStyle='#090b0a';ctx.fillRect(0,0,w,h);
  const hasScreen=Boolean(state.screen&&screen?.videoWidth);
  const layout=hasScreen?state.layout:'presenter';
  if(layout==='screen')drawContained(ctx,screen,0,0,w,h);
  else if(layout==='side'){
    const split=Math.round(w*.70);drawContained(ctx,screen,0,0,split,h);drawCovered(ctx,camera,split,0,w-split,h);
  }else if(layout==='equal'){
    const split=Math.round(w*.5);drawContained(ctx,screen,0,0,split,h);drawCovered(ctx,camera,split,0,w-split,h);
  }else if(layout==='pip'){
    drawContained(ctx,screen,0,0,w,h);const pw=Math.round(w*PIP_SIZE);const ph=Math.round(h*PIP_SIZE);const px=Math.round(w*state.presenterPosition.x);const py=Math.round(h*state.presenterPosition.y);ctx.fillStyle='#f6f1e8';ctx.fillRect(px-4,py-4,pw+8,ph+8);drawCovered(ctx,camera,px,py,pw,ph);
  }else drawCovered(ctx,camera,0,0,w,h);
  drawOverlaySources(ctx,w,h);
  state.animationFrame=requestAnimationFrame(drawProgram);
}
function ensureProgramStream(){
  if(state.program)return state.program;
  const canvas=document.createElement('canvas');canvas.width=PROGRAM_WIDTH;canvas.height=PROGRAM_HEIGHT;state.canvas=canvas;state.ctx=canvas.getContext('2d',{alpha:false});
  if(typeof canvas.captureStream!=='function'){
    state.program=state.local;$('mainVideo').srcObject=state.local;$('mainVideo').play?.().catch(()=>{});note('이 브라우저에서는 합성 화면 대신 카메라 원본으로 방송합니다. 최신 Chromium 브라우저 사용을 권장합니다.');return state.program;
  }
  state.canvasStream=canvas.captureStream(30);state.program=new MediaStream([...state.canvasStream.getVideoTracks(),...state.local.getAudioTracks()]);$('mainVideo').srcObject=state.program;$('mainVideo').play?.().catch(()=>{});cancelAnimationFrame(state.animationFrame);drawProgram();return state.program;
}
function overlayDefaults(type,index=0){
  const isVideo=type!=='chat';const w=isVideo ? .26 : .34,h=isVideo ? .146 : .38;
  return {x:Math.max(.02,Math.min(.72,.04+(index%3)*.29)),y:Math.max(.04,Math.min(.72,.08+Math.floor(index/3)*.22)),w,h};
}
function createHiddenVideo(stream,id){
  const video=document.createElement('video');video.id=`overlayVideo-${id.replace(/[^a-z0-9_-]/gi,'-')}`;video.className='source-video';video.autoplay=true;video.playsInline=true;video.muted=true;video.srcObject=stream;$('programScreen')?.append(video);video.play?.().catch(()=>{});return video;
}
function ensureOverlay(id,{type='video',label='소스',stream=null,video=null}={}){
  let overlay=state.overlays.get(id);
  if(!overlay){overlay={id,type,label,visible:false,...overlayDefaults(type,state.overlays.size),stream:null,video:null};state.overlays.set(id,overlay)}
  overlay.type=type;overlay.label=label||overlay.label;
  if(stream&&overlay.stream!==stream){overlay.stream=stream;overlay.video?.remove?.();overlay.video=createHiddenVideo(stream,id)}
  else if(video)overlay.video=video;
  syncOverlayHandles();return overlay;
}
function overlayHandle(id){
  const layer=$('programOverlayLayer');if(!layer)return null;
  let handle=layer.querySelector(`[data-program-overlay="${CSS.escape(id)}"]`);
  if(handle)return handle;
  const overlay=state.overlays.get(id);if(!overlay)return null;
  handle=document.createElement('div');handle.className='program-drag-handle';handle.dataset.programOverlay=id;handle.tabIndex=0;
  const title=document.createElement('span');title.textContent=overlay.label;
  const close=document.createElement('button');close.type='button';close.className='overlay-remove';close.textContent='×';close.setAttribute('aria-label',`${overlay.label} 삭제`);close.addEventListener('click',event=>{event.stopPropagation();removeOverlay(id)});
  handle.append(title,close);layer.append(handle);
  handle.addEventListener('pointerdown',beginOverlayDrag);handle.addEventListener('pointermove',moveOverlayDrag);handle.addEventListener('pointerup',endOverlayDrag);handle.addEventListener('pointercancel',endOverlayDrag);
  return handle;
}
function syncOverlayHandles(){
  const box=programContentBox();if(!box)return;
  for(const overlay of state.overlays.values()){
    let handle=overlayHandle(overlay.id);if(!handle)continue;
    handle.classList.toggle('hidden',!overlay.visible);if(!overlay.visible)continue;
    handle.style.left=`${box.left+overlay.x*box.width}px`;handle.style.top=`${box.top+overlay.y*box.height}px`;handle.style.width=`${overlay.w*box.width}px`;handle.style.height=`${overlay.h*box.height}px`;handle.querySelector('span').textContent=overlay.label;
  }
}
function addOverlay(id){
  const overlay=state.overlays.get(id);if(!overlay)return false;overlay.visible=true;syncOverlayHandles();renderSourceCards();return true;
}
function removeOverlay(id){
  const overlay=state.overlays.get(id);if(!overlay)return;overlay.visible=false;syncOverlayHandles();renderSourceCards();note(`${overlay.label}을 방송화면에서 제거했습니다.`);
}
function beginOverlayDrag(event){
  if(event.target.closest('.overlay-remove'))return;
  const id=event.currentTarget.dataset.programOverlay,overlay=state.overlays.get(id),box=programContentBox();if(!overlay||!box)return;
  const rect=event.currentTarget.getBoundingClientRect();state.overlayDrag={id,pointerId:event.pointerId,offsetX:event.clientX-rect.left,offsetY:event.clientY-rect.top};
  event.currentTarget.setPointerCapture?.(event.pointerId);event.currentTarget.classList.add('dragging');event.preventDefault();
}
function moveOverlayDrag(event){
  const drag=state.overlayDrag;if(!drag||drag.pointerId!==event.pointerId)return;const overlay=state.overlays.get(drag.id),box=programContentBox();if(!overlay||!box)return;
  const left=box.screenRect.left+box.left,top=box.screenRect.top+box.top;
  overlay.x=Math.max(0,Math.min(1-overlay.w,(event.clientX-left-drag.offsetX)/box.width));overlay.y=Math.max(0,Math.min(1-overlay.h,(event.clientY-top-drag.offsetY)/box.height));syncOverlayHandles();
}
function endOverlayDrag(event){if(!state.overlayDrag||state.overlayDrag.pointerId!==event.pointerId)return;event.currentTarget.classList.remove('dragging');state.overlayDrag=null}
function sourceCard(id,label,{subtitle='화면에 추가',onDelete=null}={}){
  const card=document.createElement('div');card.className='source-card-row';card.draggable=true;card.dataset.overlayId=id;
  const copy=document.createElement('div');const strong=document.createElement('strong');strong.textContent=label;const small=document.createElement('small');small.textContent=subtitle;copy.append(strong,small);
  const add=document.createElement('button');add.type='button';add.textContent=state.overlays.get(id)?.visible?'화면에서 빼기':'추가';add.addEventListener('click',()=>state.overlays.get(id)?.visible?removeOverlay(id):addOverlay(id));
  card.append(copy,add);
  if(onDelete){const del=document.createElement('button');del.type='button';del.className='source-delete';del.textContent='연결 해제';del.addEventListener('click',onDelete);card.append(del)}
  card.addEventListener('dragstart',event=>event.dataTransfer?.setData('text/ekodi-overlay',id));return card;
}
function renderSourceCards(){
  const chat=$('chatOverlaySource');if(chat){const active=state.overlays.get('chat')?.visible;chat.querySelector('span').textContent=active?'화면에서 빼기':'화면에 추가';chat.classList.toggle('active',Boolean(active))}
  const cameras=$('extraCameraSources');if(cameras){cameras.replaceChildren();for(const [id,item] of state.extraCameras)cameras.append(sourceCard(id,item.label,{onDelete:()=>disconnectExtraCamera(id)}))}
  const participants=$('participantSources');if(participants){participants.replaceChildren();for(const [id,item] of state.participantPulls)participants.append(sourceCard(id,item.label,{subtitle:item.ready?'화면에 추가':'연결 중'}))}
}
async function refreshCameraDevices(){
  if(!navigator.mediaDevices?.enumerateDevices)return;
  const devices=(await navigator.mediaDevices.enumerateDevices()).filter(device=>device.kind==='videoinput');
  const primary=state.local?.getVideoTracks?.()[0]?.getSettings?.().deviceId||'';
  for(const select of [$('extraCameraSelect'),$('participantCameraSelect')].filter(Boolean)){
    const selected=select.value;select.replaceChildren(new Option(select.id==='extraCameraSelect'?'추가 카메라 선택':'카메라 선택',''));
    for(const [index,device] of devices.entries()){if(select.id==='extraCameraSelect'&&device.deviceId===primary)continue;const option=new Option(device.label||`카메라 ${index+1}`,device.deviceId);select.append(option)}
    if([...select.options].some(option=>option.value===selected))select.value=selected;
  }
}
async function connectExtraCamera(){
  const deviceId=$('extraCameraSelect')?.value;if(!deviceId)return note('추가할 카메라를 선택해 주세요.');
  const existing=[...state.extraCameras.values()].find(item=>item.deviceId===deviceId);if(existing){addOverlay(existing.id);return}
  try{
    const stream=await navigator.mediaDevices.getUserMedia({video:{deviceId:{exact:deviceId},width:{ideal:1280},height:{ideal:720}},audio:false});
    const label=$('extraCameraSelect').selectedOptions?.[0]?.textContent||'추가 카메라',id=`camera:${crypto.randomUUID()}`;
    const overlay=ensureOverlay(id,{type:'video',label,stream});state.extraCameras.set(id,{id,deviceId,label,stream,overlay});renderSourceCards();note(`${label} 연결 완료. 끌어서 방송화면에 추가할 수 있습니다.`);
  }catch(error){note(`추가 카메라 연결 실패: ${error.message}`)}
}
function disconnectExtraCamera(id){
  const item=state.extraCameras.get(id);if(!item)return;item.stream.getTracks().forEach(track=>track.stop());item.overlay?.video?.remove?.();state.extraCameras.delete(id);state.overlays.delete(id);syncOverlayHandles();renderSourceCards();note(`${item.label} 연결을 해제했습니다.`);
}
function setupProgramDrop(){
  const screen=$('programScreen');if(!screen)return;
  screen.addEventListener('dragover',event=>{if(event.dataTransfer?.types?.includes('text/ekodi-overlay')){event.preventDefault();screen.classList.add('drop-ready')}});
  screen.addEventListener('dragleave',()=>screen.classList.remove('drop-ready'));
  screen.addEventListener('drop',event=>{event.preventDefault();screen.classList.remove('drop-ready');const id=event.dataTransfer?.getData('text/ekodi-overlay');if(id)addOverlay(id)});
}
function sourceThumb(stream,label){const wrap=document.createElement('div');wrap.className='source-thumb';const video=document.createElement('video');video.autoplay=true;video.playsInline=true;video.muted=true;video.srcObject=stream;const text=document.createElement('span');text.textContent=label;wrap.append(video,text);return wrap}
function updateSourceRail(){const rail=$('thumbnailRail');if(!rail)return;rail.replaceChildren();if(!state.screen){rail.classList.add('hidden');return}if(state.local)rail.append(sourceThumb(state.local,'발표자'));rail.append(sourceThumb(state.screen,'공유화면'));rail.classList.remove('hidden')}
function programContentBox(){
  const screen=$('programScreen');if(!screen)return null;
  const rect=screen.getBoundingClientRect();if(!rect.width||!rect.height)return null;
  const target=PROGRAM_WIDTH/PROGRAM_HEIGHT;let width=rect.width,height=rect.height,left=0,top=0;
  if(width/height>target){width=height*target;left=(rect.width-width)/2}else if(width/height<target){height=width/target;top=(rect.height-height)/2}
  return {screenRect:rect,left,top,width,height};
}
function syncPresenterDragHandle(){
  const handle=$('presenterDragHandle');if(!handle)return;
  const visible=Boolean(state.screen&&state.layout==='pip');handle.classList.toggle('hidden',!visible);if(!visible)return;
  const box=programContentBox();if(!box)return;
  handle.style.left=`${box.left+state.presenterPosition.x*box.width}px`;
  handle.style.top=`${box.top+state.presenterPosition.y*box.height}px`;
  handle.style.width=`${PIP_SIZE*box.width}px`;
  handle.style.height=`${PIP_SIZE*box.height}px`;
}
function beginPresenterDrag(event){
  if(!state.screen||state.layout!=='pip')return;
  const handle=$('presenterDragHandle');const box=programContentBox();if(!handle||!box)return;
  const rect=handle.getBoundingClientRect();state.presenterDrag={pointerId:event.pointerId,offsetX:event.clientX-rect.left,offsetY:event.clientY-rect.top};
  handle.setPointerCapture?.(event.pointerId);handle.classList.add('dragging');event.preventDefault();
}
function movePresenterDrag(event){
  const drag=state.presenterDrag;if(!drag||drag.pointerId!==event.pointerId)return;
  const box=programContentBox();if(!box)return;
  const left=box.screenRect.left+box.left;const top=box.screenRect.top+box.top;const max=1-PIP_SIZE;
  const x=(event.clientX-left-drag.offsetX)/box.width;const y=(event.clientY-top-drag.offsetY)/box.height;
  state.presenterPosition.x=Math.max(0,Math.min(max,x));state.presenterPosition.y=Math.max(0,Math.min(max,y));syncPresenterDragHandle();
}
function endPresenterDrag(event){
  if(!state.presenterDrag||state.presenterDrag.pointerId!==event.pointerId)return;
  $('presenterDragHandle')?.classList.remove('dragging');state.presenterDrag=null;note('발표자 위치를 방송 화면에 반영했습니다.');
}
function setLayout(layout){
  if(!LAYOUTS.has(layout))return;if(layout!=='presenter'&&!state.screen)return;state.layout=layout;
  document.querySelectorAll('[data-layout]').forEach(button=>{const active=button.dataset.layout===layout;button.classList.toggle('active',active);button.setAttribute('aria-pressed',String(active))});
  syncPresenterDragHandle();
  const label={pip:'화면 + 발표자',side:'70 : 30',equal:'1 : 1',screen:'공유화면만',presenter:'발표자'}[layout]||'화면 + 발표자';note(`화면 구도를 '${label}'로 전환했습니다.`);
}
function stopScreenShare(message='화면공유를 종료했습니다.'){
  const stream=state.screen;if(!stream)return;state.screen=null;for(const track of stream.getTracks())if(track.readyState!=='ended')track.stop();setSourceVideo('screenSource',null);state.layout='presenter';$('layoutPanel')?.classList.add('hidden');$('screenButton')?.setAttribute('aria-pressed','false');if($('screenButton'))$('screenButton').textContent='PPT·화면공유';updateSourceRail();syncPresenterDragHandle();note(message);
}
async function shareScreen(){
  if(!state.local){note('먼저 카메라·마이크를 준비해 주세요.');return}
  if(state.screen){stopScreenShare();return}
  if(!state.canvasStream){note('현재 브라우저는 발표자와 공유화면 합성을 지원하지 않습니다. 최신 Chromium 브라우저에서 다시 시도해 주세요.');return}
  try{
    const stream=await navigator.mediaDevices.getDisplayMedia({video:{frameRate:{ideal:15,max:30}},audio:false});state.screen=stream;setSourceVideo('screenSource',stream);state.layout='pip';$('layoutPanel')?.classList.remove('hidden');$('screenButton')?.setAttribute('aria-pressed','true');if($('screenButton'))$('screenButton').textContent='화면공유 종료';setLayout('pip');updateSourceRail();stream.getVideoTracks()[0]?.addEventListener('ended',()=>stopScreenShare('브라우저에서 화면공유가 종료되었습니다.'),{once:true});note('PPT·화면공유를 방송 화면에 합성했습니다. 방송 중에도 화면 구도를 바꿀 수 있습니다.');
  }catch(error){if(error.name!=='NotAllowedError')note(`화면공유 실패: ${error.message}`)}
}
async function toggleFullscreen(){
  const stage=$('programStage');if(!stage)return;
  try{if(document.fullscreenElement||document.webkitFullscreenElement){if(document.exitFullscreen)await document.exitFullscreen();else document.webkitExitFullscreen?.()}else if(stage.requestFullscreen)await stage.requestFullscreen();else stage.webkitRequestFullscreen?.()}catch(error){note(`전체화면 전환 실패: ${error.message}`)}
}
function syncFullscreenLabel(){const active=Boolean(document.fullscreenElement||document.webkitFullscreenElement);if($('fullscreenButton'))$('fullscreenButton').textContent=active?'전체화면 종료':'전체화면'}

async function prepareStudio(){
  show('studioView');setPhase('preparing');note('카메라와 마이크를 준비하고 있습니다. 로그인은 방송 시작 시에만 확인합니다.');
  try{
    await acquireCamera();state.studioPrepared=true;setPhase('ready');$('goLiveButton').disabled=false;setRecordingState(false,'녹화 준비');
    await loadExternalDestinations();
    note(token()?'준비 완료. 내부 방송·자동 저장은 기본이며, 필요하면 외부 채널을 선택한 뒤 방송을 시작하세요.':'준비 완료. 내부 방송·자동 저장은 기본입니다. 외부 채널 선택은 로그인 후 사용할 수 있습니다.');
    return true;
  }catch(error){state.studioPrepared=false;setPhase('error');$('goLiveButton').disabled=true;note(`카메라·마이크 준비 실패: ${error.message}`);return false}
}
async function startHost(){
  if(state.room&&state.session&&state.pc)return true;
  if(state.hosting)return false;state.hosting=true;show('studioView');setPhase('preparing');note('방송 서버에 연결하고 있습니다.');
  try{
    const created=await createRoom();if(!created){state.hosting=false;return false}state.room=created.room;$('roomTitle').textContent=state.room.title;$('shareLink').value=`https://ekodi.kr/ekodichurch/live/?room=${encodeURIComponent(state.room.id)}`;$('roomLinks').classList.remove('hidden');
    const local=state.local||await acquireCamera();const program=ensureProgramStream()||local;await api(`/rooms/${state.room.id}/status`,{method:'POST',body:JSON.stringify({status:'starting'})});await createSession(state.room.id,'owner');await publishStream(program,'program');setPhase('ready');note('미디어 연결이 완료되었습니다. 방송을 시작합니다.');setRecordingState(false,'녹화 준비');return true;
  }catch(error){state.hosting=false;setPhase('error');$('goLiveButton').disabled=false;sessionStorage.removeItem(PENDING_START_KEY);note(`방송 준비 실패: ${error.message}`);return false}
}
async function goLive(){if(!state.room)return false;try{await api(`/rooms/${state.room.id}/status`,{method:'POST',body:JSON.stringify({status:'live'})});state.isLive=true;setPhase('live');startLiveClock();$('goLiveButton').disabled=true;$('endLiveButton').disabled=false;sessionStorage.removeItem(PENDING_START_KEY);lockDestinationSelection();setRecordingState(false,'녹화 준비 중');await startManagedRecording();return true}catch(error){$('goLiveButton').disabled=false;sessionStorage.removeItem(PENDING_START_KEY);note(`방송 시작 실패: ${error.message}`);return false}}
async function startBroadcast(){
  if(state.isLive)return;
  sessionStorage.setItem(PENDING_START_KEY,'1');$('goLiveButton').disabled=true;
  if(!state.studioPrepared){const prepared=await prepareStudio();if(!prepared){sessionStorage.removeItem(PENDING_START_KEY);return}}
  if(!token()){
    if(await refreshAuthToken())return startBroadcast();
    $('goLiveButton').disabled=false;login(true);return;
  }
  const ready=await startHost();if(!ready){if(document.visibilityState!=='hidden')$('goLiveButton').disabled=false;return}
  await goLive();
}
async function endLive(){
  if(!state.room)return;
  try{
    await api(`/rooms/${state.room.id}/status`,{method:'POST',body:JSON.stringify({status:'ending'})});
    const recordingResult=await stopManagedRecording();
    if(state.session)await api(`/rooms/${state.room.id}/sessions/${state.session.id}/leave`,{method:'POST',session:true,body:'{}'}).catch(()=>{});
    state.pc?.close();state.isLive=false;stopLiveClock();
    if(state.screen)stopScreenShare('');
    state.local?.getTracks().forEach(t=>t.stop());state.canvasStream?.getTracks().forEach(t=>t.stop());cancelAnimationFrame(state.animationFrame);
    await api(`/rooms/${state.room.id}/status`,{method:'POST',body:JSON.stringify({status:'ended'})});
    setPhase('ended');$('endLiveButton').disabled=true;$('goLiveButton').disabled=true;sessionStorage.removeItem(PENDING_START_KEY);
    if(recordingResult?.ok)note(recordingResult.archive?.ok?'방송 종료 · 녹화본 공유드라이브 보관 완료':'방송 종료 · 녹화본 저장 완료, 공유드라이브 보관 대기');
    else if(!recordingResult?.error)note('방송이 종료되었습니다.');
  }catch(error){note(`방송 종료 처리 실패: ${error.message}`)}
}

function renderChatMessages(){
  for(const id of ['studioChatMessages','viewerChatMessages']){
    const root=$(id);if(!root)continue;root.replaceChildren();
    for(const row of state.chatMessages.slice(-80)){
      const item=document.createElement('div');item.className='chat-message';
      const meta=document.createElement('span');meta.textContent=row.displayName||'참여자';
      const text=document.createElement('p');text.textContent=row.message||'';item.append(meta,text);root.append(item);
    }
    root.scrollTop=root.scrollHeight;
  }
}
async function refreshChat(){
  if(!state.room)return;
  try{
    const data=await api(`/rooms/${encodeURIComponent(state.room.id)}/chat`);
    state.chatMessages=data.messages||[];renderChatMessages();
    if($('studioChatState'))$('studioChatState').textContent='연결';if($('viewerChatState'))$('viewerChatState').textContent='연결';
  }catch(error){
    if($('studioChatState'))$('studioChatState').textContent='확인 필요';if($('viewerChatState'))$('viewerChatState').textContent='확인 필요';
  }
}
function startChatPolling(){clearInterval(state.chatTimer);void refreshChat();state.chatTimer=setInterval(refreshChat,2000)}
async function sendChat(inputId,roleLabel){
  const input=$(inputId);const message=input?.value?.trim();if(!message||!state.room)return;
  input.disabled=true;
  try{await api(`/rooms/${encodeURIComponent(state.room.id)}/chat`,{method:'POST',body:JSON.stringify({message,displayName:roleLabel})});input.value='';await refreshChat()}
  catch(error){note(`채팅 전송 실패: ${error.message}`,inputId.startsWith('viewer')?'viewerStatus':'statusLog')}
  finally{input.disabled=false;input.focus()}
}
async function decideParticipation(id,status){
  if(!state.room)return;
  try{await api(`/rooms/${encodeURIComponent(state.room.id)}/participation-requests/${encodeURIComponent(id)}`,{method:'PATCH',body:JSON.stringify({status})});await refreshParticipantSources()}
  catch(error){note(`참여 요청 처리 실패: ${error.message}`)}
}
function renderParticipationRequests(rows=[]){
  const root=$('participantRequests');if(!root)return;root.replaceChildren();
  const pending=rows.filter(row=>row.status==='pending');
  if(!pending.length){const empty=document.createElement('small');empty.textContent='대기 중인 카메라 참여 요청이 없습니다.';root.append(empty);return}
  for(const row of pending){
    const item=document.createElement('div');item.className='participant-request';
    const name=document.createElement('strong');name.textContent=row.displayName||'참여자';
    const actions=document.createElement('div');
    const approve=document.createElement('button');approve.type='button';approve.textContent='승인';approve.addEventListener('click',()=>decideParticipation(row.id,'approved'));
    const reject=document.createElement('button');reject.type='button';reject.textContent='거절';reject.addEventListener('click',()=>decideParticipation(row.id,'rejected'));
    actions.append(approve,reject);item.append(name,actions);root.append(item);
  }
}
async function ensureParticipantPull(source){
  const id=`participant:${source.actorKey}`;if(state.participantPulls.has(id))return state.participantPulls.get(id);
  const created=await api(`/rooms/${encodeURIComponent(state.room.id)}/sessions`,{method:'POST',body:JSON.stringify({role:'viewer'})});
  const session=created.session,pc=new RTCPeerConnection({iceServers:created.iceServers||[]}),stream=new MediaStream();
  const label=source.displayName||'참여자 카메라';
  const overlay=ensureOverlay(id,{type:'video',label,stream});const item={id,label,source,session,pc,stream,overlay,ready:false};state.participantPulls.set(id,item);renderSourceCards();
  pc.ontrack=event=>{for(const track of event.streams?.[0]?.getTracks?.()||[event.track])if(!stream.getTracks().some(x=>x.id===track.id))stream.addTrack(track);item.ready=true;overlay.video?.play?.().catch(()=>{});renderSourceCards()};
  const pulled=await sessionApi(`/rooms/${encodeURIComponent(state.room.id)}/sessions/${encodeURIComponent(session.id)}/pull`,session.accessKey,{method:'POST',body:JSON.stringify({tracks:(source.tracks||[]).map(track=>({trackName:track.trackName}))})});
  if(!pulled.empty){const offer=providerDescription(pulled);if(offer?.sdp){await pc.setRemoteDescription(offer);const answer=await pc.createAnswer();await pc.setLocalDescription(answer);await waitIce(pc);await sessionApi(`/rooms/${encodeURIComponent(state.room.id)}/sessions/${encodeURIComponent(session.id)}/renegotiate`,session.accessKey,{method:'PUT',body:JSON.stringify({sessionDescription:pc.localDescription})})}}
  return item;
}
async function refreshParticipantSources(){
  if(!state.room||!token())return;
  try{
    const [requests,sources]=await Promise.all([
      api(`/rooms/${encodeURIComponent(state.room.id)}/participation-requests`),
      api(`/rooms/${encodeURIComponent(state.room.id)}/participant-sources`)
    ]);
    renderParticipationRequests(requests.requests||[]);
    for(const source of (sources.sources||[]).slice(0,6))if(!state.participantPulls.has(`participant:${source.actorKey}`))await ensureParticipantPull(source).catch(error=>note(`참여자 카메라 연결 실패: ${error.message}`));
    renderSourceCards();
  }catch(error){if(error.status!==404)note(`참여자 상태 확인 실패: ${error.message}`)}
}
function startParticipantMonitoring(){clearInterval(state.participantTimer);void refreshParticipantSources();state.participantTimer=setInterval(refreshParticipantSources,2500)}
async function requestCameraParticipation(){
  if(!state.room)return;
  if(!token())return login(false);
  try{
    await api(`/rooms/${encodeURIComponent(state.room.id)}/participation-requests`,{method:'POST',body:JSON.stringify({displayName:'참여자'})});
    if($('participantCameraState'))$('participantCameraState').textContent='승인 대기';note('카메라 참여 요청을 보냈습니다.','viewerStatus');startParticipantApprovalPolling();
  }catch(error){note(`카메라 참여 요청 실패: ${error.message}`,'viewerStatus')}
}
function startParticipantApprovalPolling(){
  if(state.participantTimer)clearInterval(state.participantTimer);
  const poll=async()=>{if(!state.room||!token())return;try{const data=await api(`/rooms/${encodeURIComponent(state.room.id)}/participation-request/me`);const status=data.request?.status;if($('participantCameraState'))$('participantCameraState').textContent=status==='approved'?'승인됨':status==='rejected'?'거절됨':status==='pending'?'승인 대기':'대기';if(status==='approved'&&!state.participantPublish)await startParticipantCameraPublish()}catch{}};
  void poll();state.participantTimer=setInterval(poll,2000);
}
async function startParticipantCameraPublish(){
  if(state.participantPublish||!state.room)return;
  try{
    const deviceId=$('participantCameraSelect')?.value;
    const constraints={video:deviceId?{deviceId:{exact:deviceId},width:{ideal:1280},height:{ideal:720}}:{width:{ideal:1280},height:{ideal:720}},audio:false};
    const stream=await navigator.mediaDevices.getUserMedia(constraints),preview=$('participantCameraPreview');if(preview){preview.srcObject=stream;preview.classList.remove('hidden');preview.play?.().catch(()=>{})}
    const created=await api(`/rooms/${encodeURIComponent(state.room.id)}/sessions`,{method:'POST',body:JSON.stringify({role:'presenter'})}),session=created.session,pc=new RTCPeerConnection({iceServers:created.iceServers||[]});
    for(const track of stream.getTracks())pc.addTrack(track,stream);
    const offer=await pc.createOffer();await pc.setLocalDescription(offer);await waitIce(pc);const tracks=trackPayload(pc,stream,'camera');
    const published=await sessionApi(`/rooms/${encodeURIComponent(state.room.id)}/sessions/${encodeURIComponent(session.id)}/publish`,session.accessKey,{method:'POST',body:JSON.stringify({sessionDescription:pc.localDescription,tracks})});
    const answer=providerDescription(published);if(!answer?.sdp)throw new Error('media_server_answer_missing');await pc.setRemoteDescription(answer);
    state.participantPublish={pc,session,stream};if($('participantCameraState'))$('participantCameraState').textContent='카메라 송출 중';note('카메라가 방송자에게 연결되었습니다.','viewerStatus');
  }catch(error){if($('participantCameraState'))$('participantCameraState').textContent='연결 실패';note(`카메라 연결 실패: ${error.message}`,'viewerStatus')}
}
function cleanupCollaboration(){
  clearInterval(state.chatTimer);clearInterval(state.participantTimer);state.chatTimer=null;state.participantTimer=null;
  for(const item of state.participantPulls.values()){item.pc?.close();item.stream?.getTracks?.().forEach(track=>track.stop());item.overlay?.video?.remove?.()}
  state.participantPulls.clear();
  if(state.participantPublish){state.participantPublish.pc?.close();state.participantPublish.stream?.getTracks?.().forEach(track=>track.stop());state.participantPublish=null}
}
async function joinViewer(roomId=''){
  show('viewerView');note('현재 방송을 찾고 있습니다.','viewerStatus');
  try{let id=roomId;if(!id){const live=await api(`/live?tenant=${TENANT}`);if(!live.live||!live.room){$('viewerEmpty').querySelector('strong').textContent='현재 생방송이 없습니다';$('viewerEmpty').querySelector('span').textContent='예정된 예배 시간에 다시 참여해 주세요.';note('현재 진행 중인 공개 방송이 없습니다.','viewerStatus');return}id=live.room.id}
    const detail=await api(`/rooms/${encodeURIComponent(id)}`);state.room=detail.room;$('viewerTitle').textContent=state.room.title||'에코디교회 실시간';await createSession(id,'viewer');state.pc.ontrack=event=>{for(const track of event.streams?.[0]?.getTracks?.()||[event.track])if(!state.remote.getTracks().some(x=>x.id===track.id))state.remote.addTrack(track);$('viewerVideo').srcObject=state.remote;$('viewerEmpty').classList.add('hidden')};
    const pulled=await api(`/rooms/${id}/sessions/${state.session.id}/pull`,{method:'POST',session:true,body:JSON.stringify({tracks:(detail.tracks||[]).map(track=>({trackName:track.track_name||track.trackName}))})});
    if(pulled.empty){note('방송방은 열려 있지만 아직 영상 트랙이 없습니다.','viewerStatus');return}
    const offer=providerDescription(pulled);if(!offer?.sdp)throw new Error('미디어 서버의 수신 제안이 없습니다.');await state.pc.setRemoteDescription(offer);const answer=await state.pc.createAnswer();await state.pc.setLocalDescription(answer);await waitIce(state.pc);await api(`/rooms/${id}/sessions/${state.session.id}/renegotiate`,{method:'PUT',session:true,body:JSON.stringify({sessionDescription:state.pc.localDescription})});note('실시간 방송에 연결되었습니다.','viewerStatus');
  }catch(error){note(`참여 연결 실패: ${error.message}`,'viewerStatus')}
}
async function refreshLive(){try{const live=await api(`/live?tenant=${TENANT}`);$('liveState').textContent=live.live?'현재 LIVE':'현재 대기';$('liveState').dataset.phase=live.live?'live':'idle';if(live.live)$('joinButton').textContent='현재 방송 참여하기'}catch{$('liveState').textContent='상태 확인 필요'}}
function guardLiveExit(event){if(!state.isLive)return;const message='현재 방송 중입니다. 교회 홈으로 이동하면 이 브라우저의 송출이 종료될 수 있습니다. 이동하시겠습니까?';if(event?.type==='beforeunload'){event.preventDefault();event.returnValue='';return}if(!confirm(message))event.preventDefault()}

renderLanguageOptions();
$('refreshDestinationsButton')?.addEventListener('click',()=>{if(!token())return login(true);loadExternalDestinations()});
document.querySelectorAll('[data-layout]').forEach(button=>button.addEventListener('click',()=>setLayout(button.dataset.layout)));
document.querySelectorAll('[data-leave-studio],.brand').forEach(link=>link.addEventListener('click',guardLiveExit));
window.addEventListener('beforeunload',guardLiveExit);
document.addEventListener('fullscreenchange',()=>{syncFullscreenLabel();syncPresenterDragHandle()});document.addEventListener('webkitfullscreenchange',()=>{syncFullscreenLabel();syncPresenterDragHandle()});window.addEventListener('resize',syncPresenterDragHandle);
$('presenterDragHandle')?.addEventListener('pointerdown',beginPresenterDrag);$('presenterDragHandle')?.addEventListener('pointermove',movePresenterDrag);$('presenterDragHandle')?.addEventListener('pointerup',endPresenterDrag);$('presenterDragHandle')?.addEventListener('pointercancel',endPresenterDrag);
$('hostButton').addEventListener('click',prepareStudio);$('joinButton').addEventListener('click',()=>joinViewer());$('goLiveButton').addEventListener('click',startBroadcast);$('endLiveButton').addEventListener('click',endLive);$('screenButton').addEventListener('click',shareScreen);$('fullscreenButton').addEventListener('click',toggleFullscreen);
$('cameraButton').addEventListener('click',async()=>{try{if(!state.local){await acquireCamera();state.studioPrepared=true;setPhase('ready');$('goLiveButton').disabled=false;return note('카메라가 켜졌습니다.')}const track=state.local.getVideoTracks()[0];if(!track)return note('사용 가능한 카메라가 없습니다.');track.enabled=!track.enabled;$('cameraButton').setAttribute('aria-pressed',String(track.enabled));$('cameraButton').textContent=track.enabled?'카메라':'카메라 꺼짐';note(track.enabled?'카메라가 켜졌습니다.':'카메라를 껐습니다.')}catch(error){note(`카메라 사용 불가: ${error.message}`)}});
$('micButton').addEventListener('click',()=>{const track=state.local?.getAudioTracks?.()[0];if(!track)return note('먼저 카메라·마이크를 준비해 주세요.');track.enabled=!track.enabled;$('micButton').setAttribute('aria-pressed',String(track.enabled));$('micButton').textContent=track.enabled?'마이크':'마이크 꺼짐';note(track.enabled?'마이크가 켜졌습니다.':'마이크를 껐습니다.')});
$('copyLinkButton').addEventListener('click',async()=>{await navigator.clipboard?.writeText?.($('shareLink').value);note('참여 링크를 복사했습니다.')});$('requestSpeakButton').addEventListener('click',()=>{if(!token())return login(false);note('발언 참여 승인은 다음 단계에서 제공됩니다.','viewerStatus')});
void bootstrapCentralAuth().then(async authenticated=>{
  if(setupParams.get('mode')==='studio'){
    const prepared=await prepareStudio();
    if(prepared&&authenticated&&sessionStorage.getItem(PENDING_START_KEY)==='1')await startBroadcast();
  }else if(setupParams.get('room'))joinViewer(setupParams.get('room'));else refreshLive();
});
})();