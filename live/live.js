(()=>{'use strict';
const API='https://ekodi.kr/api/realtime';
const TENANT='ekodichurch';
const SUPABASE_URL='https://renzehysxirjilvdxacv.supabase.co';
const PUBLISHABLE_KEY='sb_publishable_0QjB0WzZbjrd-FJ5D5cR7A_xUkXyOY_';
const setupParams=new URLSearchParams(location.search);
const $=id=>document.getElementById(id);
const state={room:null,pc:null,session:null,local:null,screen:null,remote:new MediaStream(),hosting:false};
function token(){try{const central=sessionStorage.getItem('ekodi-auth-token');if(central)return central;const church=JSON.parse(sessionStorage.getItem('ekodi-church-pastor-session')||'null');return church?.accessToken||''}catch{return''}}
function headers(json=false,session=false){const h=new Headers();if(token())h.set('authorization',`Bearer ${token()}`);if(json)h.set('content-type','application/json');if(session&&state.session?.accessKey)h.set('x-ekodi-session-key',state.session.accessKey);return h}
async function api(path,options={}){const h=headers(Boolean(options.body),Boolean(options.session));const r=await fetch(`${API}${path}`,{...options,headers:h,cache:'no-store'});const data=await r.json().catch(()=>({}));if(!r.ok){const e=new Error(data.error||`HTTP ${r.status}`);e.status=r.status;e.data=data;throw e}return data}
function show(id){for(const key of ['entryView','studioView','viewerView'])$(key)?.classList.add('hidden');$(id)?.classList.remove('hidden')}
function note(message,target='statusLog'){$(target).textContent=message}
function safeReturnTo(){const back=new URL(location.href);const hash=new URLSearchParams(back.hash.replace(/^#/,''));if(['ekodi_token','ekodi_type','access_token','refresh_token'].some(key=>hash.has(key)))back.hash='';for(const key of ['ekodi_token','ekodi_type'])back.searchParams.delete(key);return back.toString()}
function login(){location.href=`https://ekodi.kr/auth/?site=church&return_to=${encodeURIComponent(safeReturnTo())}`}
function liveTitle(){const service=setupParams.get('service')||'';const date=setupParams.get('date')||'';const title=setupParams.get('title')||'';const scripture=setupParams.get('scripture')||'';const parts=[service,date,title,scripture].filter(Boolean);return parts.length?parts.join(' · ').slice(0,180):'에코디교회 실시간 예배'}
async function bootstrapCentralAuth(){
  try{
    const hash=new URLSearchParams(location.hash.replace(/^#/,''));
    const {createClient}=await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
    const sb=createClient(SUPABASE_URL,PUBLISHABLE_KEY,{auth:{detectSessionInUrl:true,persistSession:true}});
    const handoff=hash.get('ekodi_token');
    if(handoff){history.replaceState(null,'',location.pathname+location.search);const {error}=await sb.auth.verifyOtp({token_hash:handoff,type:hash.get('ekodi_type')||'email'});if(error)throw error}
    const {data}=await sb.auth.getSession();
    if(data?.session?.access_token)sessionStorage.setItem('ekodi-auth-token',data.session.access_token);
  }catch(error){console.warn('[EKODI Live auth bootstrap]',error?.message||error)}
}
async function waitIce(pc){if(pc.iceGatheringState==='complete')return;await new Promise(resolve=>{const timer=setTimeout(resolve,2500);pc.addEventListener('icegatheringstatechange',()=>{if(pc.iceGatheringState==='complete'){clearTimeout(timer);resolve()}},{once:false})})}
function providerDescription(data){return data?.provider?.sessionDescription||data?.provider?.data?.sessionDescription||data?.sessionDescription||null}
function selectedLanguages(){return [...$('languageSelect').selectedOptions].map(x=>x.value)}
function broadcastSelection(){const mode=document.querySelector('input[name="broadcastMode"]:checked')?.value||'ekodi';const destinations=mode==='multistream'?[...document.querySelectorAll('#externalDestinations input:checked')].map(x=>x.value):[];return {mode,destinations,multistream:mode==='multistream'}}
async function createRoom(){
  const body={tenant:TENANT,mode:'worship',title:liveTitle(),interactiveParticipants:6,languages:selectedLanguages(),durationMinutes:180,recording:true,...broadcastSelection(),publicViewers:true,ai:true,metadata:{service:setupParams.get('service')||'',date:setupParams.get('date')||'',scripture:setupParams.get('scripture')||'',messageTitle:setupParams.get('title')||'',preacher:setupParams.get('preacher')||'',notice:setupParams.get('notice')||''}};
  try{return await api('/rooms',{method:'POST',body:JSON.stringify(body)})}catch(error){
    if(error.status===401)return login();
    if(error.status===402&&error.data?.subscriptionUrl){location.href=error.data.subscriptionUrl;return null}
    throw error;
  }
}
async function createSession(roomId,role){const data=await api(`/rooms/${encodeURIComponent(roomId)}/sessions`,{method:'POST',body:JSON.stringify({role})});state.session=data.session;state.pc=new RTCPeerConnection({iceServers:data.iceServers||[]});state.pc.onconnectionstatechange=()=>{$('connectionState').textContent=state.pc.connectionState;};return data}
function attachLocal(stream,label='진행자'){state.local=stream;$('mainVideo').srcObject=stream;$('programPlaceholder').classList.add('hidden');const rail=$('thumbnailRail');rail.innerHTML='';const thumb=document.createElement('video');thumb.autoplay=true;thumb.playsInline=true;thumb.muted=true;thumb.srcObject=stream;thumb.title=label;rail.append(thumb)}
async function acquireCamera(){if(state.local)return state.local;const stream=await navigator.mediaDevices.getUserMedia({video:{width:{ideal:1280},height:{ideal:720}},audio:{echoCancellation:true,noiseSuppression:true}});attachLocal(stream);return stream}
function trackPayload(pc,stream,source='camera'){return pc.getTransceivers().filter(t=>t.sender?.track&&stream.getTracks().includes(t.sender.track)).map((t,index)=>({mid:t.mid,trackName:`${source}-${t.sender.track.kind}-${Date.now()}-${index}`,kind:t.sender.track.kind,sourceType:t.sender.track.kind==='audio'?'microphone':source}))}
async function publishStream(stream,source='camera'){
  for(const track of stream.getTracks())state.pc.addTrack(track,stream);
  const offer=await state.pc.createOffer();await state.pc.setLocalDescription(offer);await waitIce(state.pc);
  const tracks=trackPayload(state.pc,stream,source);if(tracks.some(t=>!t.mid))throw new Error('미디어 트랙 협상 준비가 완료되지 않았습니다.');
  const data=await api(`/rooms/${state.room.id}/sessions/${state.session.id}/publish`,{method:'POST',session:true,body:JSON.stringify({sessionDescription:state.pc.localDescription,tracks})});
  const answer=providerDescription(data);if(!answer?.sdp)throw new Error('미디어 서버의 연결 응답이 없습니다.');await state.pc.setRemoteDescription(answer);
  return data;
}
async function startHost(){
  if(state.hosting)return;state.hosting=true;show('studioView');note('방송 준비 중입니다. 카메라와 마이크 권한을 확인합니다.');
  try{const created=await createRoom();if(!created)return;state.room=created.room;$('roomTitle').textContent=state.room.title;$('shareLink').value=`https://ekodi.kr/ekodichurch/live/?room=${encodeURIComponent(state.room.id)}`;$('roomLinks').classList.remove('hidden');
    const stream=await acquireCamera();await api(`/rooms/${state.room.id}/status`,{method:'POST',body:JSON.stringify({status:'starting'})});await createSession(state.room.id,'owner');await publishStream(stream,'camera');note('미디어 연결이 완료되었습니다. 방송 시작을 누르면 공개됩니다.');$('goLiveButton').disabled=false;
  }catch(error){state.hosting=false;note(`방송 준비 실패: ${error.message}`);}
}
async function goLive(){if(!state.room)return;try{await api(`/rooms/${state.room.id}/status`,{method:'POST',body:JSON.stringify({status:'live'})});$('programBadge').textContent='LIVE';$('liveState').textContent='방송 중';$('goLiveButton').disabled=true;$('endLiveButton').disabled=false;note('방송 중입니다. 참여 링크를 공유할 수 있습니다.')}catch(error){note(`방송 시작 실패: ${error.message}`)}}
async function endLive(){if(!state.room)return;try{await api(`/rooms/${state.room.id}/status`,{method:'POST',body:JSON.stringify({status:'ending'})});if(state.session)await api(`/rooms/${state.room.id}/sessions/${state.session.id}/leave`,{method:'POST',session:true,body:'{}'}).catch(()=>{});state.pc?.close();state.local?.getTracks().forEach(t=>t.stop());state.screen?.getTracks().forEach(t=>t.stop());await api(`/rooms/${state.room.id}/status`,{method:'POST',body:JSON.stringify({status:'ended'})});$('programBadge').textContent='종료';$('endLiveButton').disabled=true;note('방송이 종료되었습니다.')}catch(error){note(`방송 종료 처리 실패: ${error.message}`)}}
async function shareScreen(){if(!state.room||!state.pc){note('먼저 방송을 준비해 주세요.');return}try{const stream=await navigator.mediaDevices.getDisplayMedia({video:{frameRate:{ideal:15,max:30}},audio:true});state.screen=stream;await publishStream(stream,'screen');$('mainVideo').srcObject=stream;stream.getVideoTracks()[0]?.addEventListener('ended',()=>{if(state.local)$('mainVideo').srcObject=state.local});note('PPT·화면공유를 방송에 추가했습니다.')}catch(error){if(error.name!=='NotAllowedError')note(`화면공유 실패: ${error.message}`)}}
async function joinViewer(roomId=''){
  show('viewerView');note('현재 방송을 찾고 있습니다.','viewerStatus');
  try{let id=roomId;if(!id){const live=await api(`/live?tenant=${TENANT}`);if(!live.live||!live.room){$('viewerEmpty').querySelector('strong').textContent='현재 생방송이 없습니다';$('viewerEmpty').querySelector('span').textContent='예정된 예배 시간에 다시 참여해 주세요.';note('현재 진행 중인 공개 방송이 없습니다.','viewerStatus');return}id=live.room.id}
    const detail=await api(`/rooms/${encodeURIComponent(id)}`);state.room=detail.room;$('viewerTitle').textContent=state.room.title||'에코디교회 실시간';await createSession(id,'viewer');state.pc.ontrack=event=>{for(const track of event.streams?.[0]?.getTracks?.()||[event.track])if(!state.remote.getTracks().some(x=>x.id===track.id))state.remote.addTrack(track);$('viewerVideo').srcObject=state.remote;$('viewerEmpty').classList.add('hidden')};
    const pulled=await api(`/rooms/${id}/sessions/${state.session.id}/pull`,{method:'POST',session:true,body:JSON.stringify({tracks:(detail.tracks||[]).map(track=>({trackName:track.track_name||track.trackName}))})});
    if(pulled.empty){note('방송방은 열려 있지만 아직 영상 트랙이 없습니다.','viewerStatus');return}
    const offer=providerDescription(pulled);if(!offer?.sdp)throw new Error('미디어 서버의 수신 제안이 없습니다.');await state.pc.setRemoteDescription(offer);const answer=await state.pc.createAnswer();await state.pc.setLocalDescription(answer);await waitIce(state.pc);await api(`/rooms/${id}/sessions/${state.session.id}/renegotiate`,{method:'PUT',session:true,body:JSON.stringify({sessionDescription:state.pc.localDescription})});note('실시간 방송에 연결되었습니다.','viewerStatus');
  }catch(error){note(`참여 연결 실패: ${error.message}`,'viewerStatus')}
}
async function refreshLive(){try{const live=await api(`/live?tenant=${TENANT}`);$('liveState').textContent=live.live?'현재 LIVE':'현재 대기';if(live.live)$('joinButton').textContent='현재 방송 참여하기'}catch{$('liveState').textContent='상태 확인 필요'}}
document.querySelectorAll('input[name="broadcastMode"]').forEach(input=>input.addEventListener('change',()=>{$('externalDestinations').classList.toggle('hidden',input.value!=='multistream'||!input.checked)}));
$('hostButton').addEventListener('click',startHost);$('joinButton').addEventListener('click',()=>joinViewer());$('goLiveButton').addEventListener('click',goLive);$('endLiveButton').addEventListener('click',endLive);$('screenButton').addEventListener('click',shareScreen);$('cameraButton').addEventListener('click',async()=>{try{await acquireCamera();note('카메라가 준비되었습니다.')}catch(error){note(`카메라 사용 불가: ${error.message}`)}});$('micButton').addEventListener('click',()=>{const track=state.local?.getAudioTracks?.()[0];if(!track)return note('먼저 카메라·마이크를 준비해 주세요.');track.enabled=!track.enabled;$('micButton').textContent=track.enabled?'마이크':'마이크 꺼짐'});$('copyLinkButton').addEventListener('click',async()=>{await navigator.clipboard?.writeText?.($('shareLink').value);note('참여 링크를 복사했습니다.')});$('requestSpeakButton').addEventListener('click',()=>{if(!token())return login();note('발언 참여 승인은 다음 단계에서 제공됩니다.','viewerStatus')});
void bootstrapCentralAuth().finally(()=>{if(setupParams.get('mode')==='studio')startHost();else if(setupParams.get('room'))joinViewer(setupParams.get('room'));else refreshLive()});
})();