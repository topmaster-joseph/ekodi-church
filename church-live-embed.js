(()=>{'use strict';
const API='https://ekodi.kr/api/realtime';
const root=document.querySelector('[data-ekodi-live-embed]');
if(!root)return;
const video=root.querySelector('[data-live-video]');
const state=root.querySelector('[data-live-state]');
const empty=root.querySelector('[data-live-empty]');
const join=root.querySelector('[data-live-join]');
const admin=root.querySelector('[data-live-admin]');
const setState=(text,on=false)=>{if(state){state.textContent=text;state.dataset.live=on?'on':'off';}};
async function latest(){
 try{const r=await fetch(`${API}/rooms?tenant=ekodichurch&status=live`,{headers:{accept:'application/json'}});if(!r.ok)throw new Error('status');const d=await r.json();return (d.rooms||d.data||[])[0]||null;}catch{return null;}
}
async function connect(room){
 if(!room){setState('현재 방송 대기 중');if(empty)empty.hidden=false;return;}
 setState('LIVE',true);if(empty)empty.hidden=true;
 try{const r=await fetch(`${API}/rooms/${encodeURIComponent(room.id)}/sessions`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({role:'viewer'})});if(!r.ok)throw new Error('session');const d=await r.json();const pc=new RTCPeerConnection({iceServers:d.iceServers||[]});const remote=new MediaStream();pc.ontrack=e=>{e.streams[0]?.getTracks().forEach(t=>remote.addTrack(t));if(video){video.srcObject=remote;video.play().catch(()=>{});}};const offer=await pc.createOffer({offerToReceiveAudio:true,offerToReceiveVideo:true});await pc.setLocalDescription(offer);const s=await fetch(`${API}/rooms/${encodeURIComponent(room.id)}/sessions/${encodeURIComponent(d.session.id)}/subscribe`,{method:'POST',headers:{'content-type':'application/json','x-ekodi-session-key':d.session.accessKey||''},body:JSON.stringify({sessionDescription:pc.localDescription})});if(!s.ok)throw new Error('subscribe');const answer=await s.json();if(answer.sessionDescription)await pc.setRemoteDescription(answer.sessionDescription);root._ekodiPc=pc;
 }catch{setState('방송 연결 준비 중');if(empty)empty.hidden=false;}
}
join?.addEventListener('click',()=>{location.href='#online';});
admin?.addEventListener('click',()=>{location.href='/ekodichurch/live/admin';});
latest().then(connect);
})();