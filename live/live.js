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
const state={room:null,pc:null,session:null,local:null,screen:null,program:null,remote:new MediaStream(),hosting:false,isLive:false,authClient:null,canvas:null,ctx:null,canvasStream:null,animationFrame:null,layout:'presenter',startedAt:0,timerId:null,studioPrepared:false};

function token(){try{const central=sessionStorage.getItem('ekodi-auth-token');if(central)return central;const church=JSON.parse(sessionStorage.getItem('ekodi-church-pastor-session')||'null');return church?.accessToken||''}catch{return''}}
function headers(json=false,session=false){const h=new Headers();if(token())h.set('authorization',`Bearer ${token()}`);if(json)h.set('content-type','application/json');if(session&&state.session?.accessKey)h.set('x-ekodi-session-key',state.session.accessKey);return h}
async function api(path,options={}){const h=headers(Boolean(options.body),Boolean(options.session));const r=await fetch(`${API}${path}`,{...options,headers:h,cache:'no-store'});const data=await r.json().catch(()=>({}));if(!r.ok){const e=new Error(data.error||`HTTP ${r.status}`);e.status=r.status;e.data=data;throw e}return data}
function show(id){for(const key of ['entryView','studioView','viewerView'])$(key)?.classList.add('hidden');$(id)?.classList.remove('hidden')}
function note(message,target='statusLog'){$(target).textContent=message}
function safeReturnTo(){const back=new URL(location.href);const hash=new URLSearchParams(back.hash.replace(/^#/,''));if(['ekodi_token','ekodi_type','access_token','refresh_token'].some(key=>hash.has(key)))back.hash='';for(const key of ['ekodi_token','ekodi_type'])back.searchParams.delete(key);return back.toString()}
function login(){
  const now=Date.now();
  const previous=Number(sessionStorage.getItem(AUTH_ATTEMPT_KEY)||0);
  if(previous&&now-previous<AUTH_ATTEMPT_WINDOW){
    state.hosting=false;show('studioView');setPhase('error');if($('goLiveButton'))$('goLiveButton').disabled=false;sessionStorage.removeItem(PENDING_START_KEY);note('로그인 인증이 방송 권한으로 연결되지 않았습니다. 자동 재로그인은 중단했습니다. 로그인 상태를 확인한 뒤 방송 시작을 다시 눌러 주세요.');
    return null;
  }
  sessionStorage.setItem(AUTH_ATTEMPT_KEY,String(now));
  location.href=`https://ekodi.kr/auth/?site=church&return_to=${encodeURIComponent(safeReturnTo())}`;
  return null;
}
function liveTitle(){const service=setupParams.get('service')||'';const date=setupParams.get('date')||'';const title=setupParams.get('title')||'';const scripture=setupParams.get('scripture')||'';const parts=[service,date,title,scripture].filter(Boolean);return parts.length?parts.join(' · ').slice(0,180):'에코디교회 실시간 예배'}
function storedSupabaseSession(){try{return JSON.parse(localStorage.getItem('sb-renzehysxirjilvdxacv-auth-token')||'null')}catch{return null}}
async function bootstrapCentralAuth(){
  try{
    const hash=new URLSearchParams(location.hash.replace(/^#/,''));const handoff=hash.get('ekodi_token');
    if(handoff){history.replaceState(null,'',location.pathname+location.search);const response=await fetch(`${SUPABASE_URL}/auth/v1/verify`,{method:'POST',headers:{apikey:PUBLISHABLE_KEY,'content-type':'application/json'},body:JSON.stringify({token_hash:handoff,type:hash.get('ekodi_type')||'email'})});const data=await response.json().catch(()=>({}));const access=data?.access_token||data?.session?.access_token||'';if(!response.ok||!access)throw new Error(data?.msg||data?.error_description||'login_handoff_failed');sessionStorage.setItem('ekodi-auth-token',access);sessionStorage.removeItem(AUTH_ATTEMPT_KEY);return true}
    const stored=storedSupabaseSession();if(stored?.access_token){sessionStorage.setItem('ekodi-auth-token',stored.access_token);sessionStorage.removeItem(AUTH_ATTEMPT_KEY);return true}
  }catch(error){console.warn('[EKODI Live auth bootstrap]',error?.message||error)}return false
}
async function refreshAuthToken(){
  try{const stored=storedSupabaseSession();if(!stored?.refresh_token)return false;const response=await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`,{method:'POST',headers:{apikey:PUBLISHABLE_KEY,'content-type':'application/json'},body:JSON.stringify({refresh_token:stored.refresh_token})});const data=await response.json().catch(()=>({}));if(!response.ok||!data?.access_token)return false;sessionStorage.setItem('ekodi-auth-token',data.access_token);localStorage.setItem('sb-renzehysxirjilvdxacv-auth-token',JSON.stringify({...stored,...data}));sessionStorage.removeItem(AUTH_ATTEMPT_KEY);return true}catch{return false}
}
async function waitIce(pc){if(pc.iceGatheringState==='complete')return;await new Promise(resolve=>{const timer=setTimeout(resolve,2500);pc.addEventListener('icegatheringstatechange',()=>{if(pc.iceGatheringState==='complete'){clearTimeout(timer);resolve()}},{once:false})})}
function providerDescription(data){return data?.provider?.sessionDescription||data?.provider?.data?.sessionDescription||data?.sessionDescription||null}
function selectedLanguages(){return SUPPORTED_LANGUAGES.map(language=>language.code)}
function broadcastSelection(){const mode=document.querySelector('input[name="broadcastMode"]:checked')?.value||'ekodi';const destinations=mode==='multistream'?[...document.querySelectorAll('#externalDestinations input:checked')].map(x=>x.value):[];return {broadcastMode:mode,destinations:[...destinations],multistream:mode==='multistream'}}
function renderLanguageOptions(){
  const chips=$('languageChips');
  if(chips){chips.replaceChildren(...SUPPORTED_LANGUAGES.map(language=>{const span=document.createElement('span');span.textContent=language.label;span.dataset.language=language.code;return span}))}
  const select=$('viewerLanguage');
  if(select){for(const language of SUPPORTED_LANGUAGES){if(select.querySelector(`option[value="${language.code}"]`))continue;const option=document.createElement('option');option.value=language.code;option.textContent=language.label;select.append(option)}}
  if($('interpretationStatus'))$('interpretationStatus').textContent=`통역 자동 · ${SUPPORTED_LANGUAGES.length}개 언어`;
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

async function createRoom(){
  const body={tenant:TENANT,mode:'worship',title:liveTitle(),interactiveParticipants:6,languages:selectedLanguages(),durationMinutes:180,recording:true,...broadcastSelection(),publicViewers:true,ai:true,metadata:{service:setupParams.get('service')||'',date:setupParams.get('date')||'',scripture:setupParams.get('scripture')||'',messageTitle:setupParams.get('title')||'',preacher:setupParams.get('preacher')||'',notice:setupParams.get('notice')||'',interpretationMode:'auto',sourceLanguage:'auto',supportedLanguages:selectedLanguages()}};
  const options={method:'POST',body:JSON.stringify(body)};
  try{const created=await api('/rooms',options);sessionStorage.removeItem(AUTH_ATTEMPT_KEY);return created}catch(error){
    if(error.status===401&&await refreshAuthToken()){
      try{const created=await api('/rooms',options);sessionStorage.removeItem(AUTH_ATTEMPT_KEY);return created}catch(retryError){error=retryError}
    }
    if(error.status===401)return login();
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
    drawContained(ctx,screen,0,0,w,h);const pw=Math.round(w*.25);const ph=Math.round(pw*9/16);const pad=Math.round(w*.018);const px=w-pw-pad;const py=h-ph-pad;ctx.fillStyle='#f6f1e8';ctx.fillRect(px-4,py-4,pw+8,ph+8);drawCovered(ctx,camera,px,py,pw,ph);
  }else drawCovered(ctx,camera,0,0,w,h);
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
function sourceThumb(stream,label){const wrap=document.createElement('div');wrap.className='source-thumb';const video=document.createElement('video');video.autoplay=true;video.playsInline=true;video.muted=true;video.srcObject=stream;const text=document.createElement('span');text.textContent=label;wrap.append(video,text);return wrap}
function updateSourceRail(){const rail=$('thumbnailRail');if(!rail)return;rail.replaceChildren();if(!state.screen){rail.classList.add('hidden');return}if(state.local)rail.append(sourceThumb(state.local,'발표자'));rail.append(sourceThumb(state.screen,'공유화면'));rail.classList.remove('hidden')}
function setLayout(layout){
  if(!LAYOUTS.has(layout))return;if(layout!=='presenter'&&!state.screen)return;state.layout=layout;
  document.querySelectorAll('[data-layout]').forEach(button=>{const active=button.dataset.layout===layout;button.classList.toggle('active',active);button.setAttribute('aria-pressed',String(active))});
  const label={pip:'화면 + 발표자',side:'70 : 30',equal:'1 : 1',screen:'공유화면만',presenter:'발표자'}[layout]||'화면 + 발표자';note(`화면 구도를 '${label}'로 전환했습니다.`);
}
function stopScreenShare(message='화면공유를 종료했습니다.'){
  const stream=state.screen;if(!stream)return;state.screen=null;for(const track of stream.getTracks())if(track.readyState!=='ended')track.stop();setSourceVideo('screenSource',null);state.layout='presenter';$('layoutPanel')?.classList.add('hidden');$('screenButton')?.setAttribute('aria-pressed','false');if($('screenButton'))$('screenButton').textContent='PPT·화면공유';updateSourceRail();note(message);
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
    note(token()?'카메라·마이크 준비 완료. 방송 시작을 누르세요.':'카메라·마이크 준비 완료. 방송 시작을 누르면 로그인 후 방송이 시작됩니다.');
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
async function goLive(){if(!state.room)return false;try{await api(`/rooms/${state.room.id}/status`,{method:'POST',body:JSON.stringify({status:'live'})});state.isLive=true;setPhase('live');startLiveClock();setRecordingState(true,'● 녹화 중');$('goLiveButton').disabled=true;$('endLiveButton').disabled=false;sessionStorage.removeItem(PENDING_START_KEY);note('방송 중입니다. 화면 구도는 방송을 끊지 않고 변경할 수 있습니다.');return true}catch(error){$('goLiveButton').disabled=false;sessionStorage.removeItem(PENDING_START_KEY);note(`방송 시작 실패: ${error.message}`);return false}}
async function startBroadcast(){
  if(state.isLive)return;
  sessionStorage.setItem(PENDING_START_KEY,'1');$('goLiveButton').disabled=true;
  if(!state.studioPrepared){const prepared=await prepareStudio();if(!prepared){sessionStorage.removeItem(PENDING_START_KEY);return}}
  if(!token()){
    if(await refreshAuthToken())return startBroadcast();
    $('goLiveButton').disabled=false;login();return;
  }
  const ready=await startHost();if(!ready){if(document.visibilityState!=='hidden')$('goLiveButton').disabled=false;return}
  await goLive();
}
async function endLive(){
  if(!state.room)return;
  try{
    await api(`/rooms/${state.room.id}/status`,{method:'POST',body:JSON.stringify({status:'ending'})});if(state.session)await api(`/rooms/${state.room.id}/sessions/${state.session.id}/leave`,{method:'POST',session:true,body:'{}'}).catch(()=>{});state.pc?.close();state.isLive=false;stopLiveClock();setRecordingState(false,'녹화 종료');if(state.screen)stopScreenShare('');state.local?.getTracks().forEach(t=>t.stop());state.canvasStream?.getTracks().forEach(t=>t.stop());cancelAnimationFrame(state.animationFrame);await api(`/rooms/${state.room.id}/status`,{method:'POST',body:JSON.stringify({status:'ended'})});setPhase('ended');$('endLiveButton').disabled=true;$('goLiveButton').disabled=true;sessionStorage.removeItem(PENDING_START_KEY);note('방송이 종료되었습니다.');
  }catch(error){note(`방송 종료 처리 실패: ${error.message}`)}
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
document.querySelectorAll('input[name="broadcastMode"]').forEach(input=>input.addEventListener('change',()=>{$('externalDestinations').classList.toggle('hidden',input.value!=='multistream'||!input.checked)}));
document.querySelectorAll('[data-layout]').forEach(button=>button.addEventListener('click',()=>setLayout(button.dataset.layout)));
document.querySelectorAll('[data-leave-studio],.brand').forEach(link=>link.addEventListener('click',guardLiveExit));
window.addEventListener('beforeunload',guardLiveExit);
document.addEventListener('fullscreenchange',syncFullscreenLabel);document.addEventListener('webkitfullscreenchange',syncFullscreenLabel);
$('hostButton').addEventListener('click',prepareStudio);$('joinButton').addEventListener('click',()=>joinViewer());$('goLiveButton').addEventListener('click',startBroadcast);$('endLiveButton').addEventListener('click',endLive);$('screenButton').addEventListener('click',shareScreen);$('fullscreenButton').addEventListener('click',toggleFullscreen);
$('cameraButton').addEventListener('click',async()=>{try{if(!state.local){await acquireCamera();state.studioPrepared=true;setPhase('ready');$('goLiveButton').disabled=false;return note('카메라가 켜졌습니다.')}const track=state.local.getVideoTracks()[0];if(!track)return note('사용 가능한 카메라가 없습니다.');track.enabled=!track.enabled;$('cameraButton').setAttribute('aria-pressed',String(track.enabled));$('cameraButton').textContent=track.enabled?'카메라':'카메라 꺼짐';note(track.enabled?'카메라가 켜졌습니다.':'카메라를 껐습니다.')}catch(error){note(`카메라 사용 불가: ${error.message}`)}});
$('micButton').addEventListener('click',()=>{const track=state.local?.getAudioTracks?.()[0];if(!track)return note('먼저 카메라·마이크를 준비해 주세요.');track.enabled=!track.enabled;$('micButton').setAttribute('aria-pressed',String(track.enabled));$('micButton').textContent=track.enabled?'마이크':'마이크 꺼짐';note(track.enabled?'마이크가 켜졌습니다.':'마이크를 껐습니다.')});
$('copyLinkButton').addEventListener('click',async()=>{await navigator.clipboard?.writeText?.($('shareLink').value);note('참여 링크를 복사했습니다.')});$('requestSpeakButton').addEventListener('click',()=>{if(!token())return login();note('발언 참여 승인은 다음 단계에서 제공됩니다.','viewerStatus')});
void bootstrapCentralAuth().then(async authenticated=>{
  if(setupParams.get('mode')==='studio'){
    const prepared=await prepareStudio();
    if(prepared&&authenticated&&sessionStorage.getItem(PENDING_START_KEY)==='1')await startBroadcast();
  }else if(setupParams.get('room'))joinViewer(setupParams.get('room'));else refreshLive();
});
})();