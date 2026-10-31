const SUPABASE_URL='https://renzehysxirjilvdxacv.supabase.co';
const PUBLISHABLE_KEY='sb_publishable_0QjB0WzZbjrd-FJ5D5cR7A_xUkXyOY_';
const $=(id)=>document.getElementById(id);
let service='sunday';
let activeSession=null;
let accessReady=false;
const names={sunday:'주일모임',saturday:'토요모임'};
const defaultTimes={sunday:'일요일 오전 11시',saturday:'토요일 오전 11시'};

function esc(v){return String(v||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]))}
function todayFor(type){
  const d=new Date();const target=type==='sunday'?0:6;let diff=(target-d.getDay()+7)%7;
  if(diff===0&&d.getHours()>=12)diff=7;d.setDate(d.getDate()+diff);
  return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')
}
function payload(){return{service,serviceName:names[service],time:defaultTimes[service],date:$('serviceDate').value,scripture:$('scripture').value.trim(),title:$('title').value.trim(),preacher:$('preacher').value.trim(),songs:$('songs').value.trim(),prayer:$('prayer').value.trim(),notice:$('notice').value.trim(),meal:$('meal').value.trim(),updatedAt:new Date().toISOString()}}
function render(){const p=payload();$('serviceLabel').textContent=p.serviceName;$('summary').innerHTML=`<dl><dt>일시</dt><dd>${esc(p.date)} · ${esc(p.time)}</dd><dt>본문</dt><dd>${esc(p.scripture||'미입력')}</dd><dt>제목</dt><dd>${esc(p.title||'미입력')}</dd><dt>설교</dt><dd>${esc(p.preacher||'미입력')}</dd><dt>찬양</dt><dd>${esc(p.songs||'미입력')}</dd><dt>대표기도</dt><dd>${esc(p.prayer||'미입력')}</dd><dt>공지</dt><dd>${esc(p.notice||'없음')}</dd><dt>식사준비</dt><dd>${esc(p.meal||'미정')}</dd></dl>`}
function setStatus(id,text='준비됨'){$(id).textContent=text;$(id).classList.add('ready')}
function saveLocal(){localStorage.setItem(`ekodi:church:worship:${service}`,JSON.stringify(payload()));render()}
function fill(p){$('serviceDate').value=p.date||p.service_date||todayFor(service);$('scripture').value=p.scripture||'';$('title').value=p.title||'';$('preacher').value=p.preacher||'정찬균 목사';$('songs').value=p.songs||'';$('prayer').value=p.prayer||'';$('notice').value=p.notice||'';$('meal').value=p.meal||'';render()}
function loadLocal(){const raw=localStorage.getItem(`ekodi:church:worship:${service}`);if(raw){try{fill(JSON.parse(raw));return}catch{}}fill({date:todayFor(service),preacher:'정찬균 목사'})}
function record(p,published=false){return{service_type:p.service,service_date:p.date,service_name:p.serviceName,service_time:p.time,scripture:p.scripture,title:p.title,preacher:p.preacher,songs:p.songs,prayer:p.prayer,notice:p.notice,meal:p.meal,is_published:published,created_by:activeSession?.user?.id||null,updated_at:new Date().toISOString()}}
function loginUrl(){const target='https://ekodi.kr/ekodichurch/mypage/';return `https://ekodi.kr/auth/?site=church&return_to=${encodeURIComponent(target)}`}
// The site's Content-Security-Policy allows only same-origin scripts, so the
// console talks to Supabase Auth/REST with fetch instead of a CDN client.
const SESSION_KEY='sb-renzehysxirjilvdxacv-auth-token';
const sb={ready:false};
function readSession(){
  // Only the church project's session is valid here; another EKODI project's
  // token would be rejected by this database, so fall back to the handoff.
  try{
    const parsed=JSON.parse(localStorage.getItem(SESSION_KEY)||'null');
    const s=parsed?.currentSession||parsed?.session||parsed;
    if(s?.access_token)return s;
  }catch{}
  return null;
}
function storeSession(s){
  const expires_at=s.expires_at||Math.floor(Date.now()/1000)+Number(s.expires_in||3600);
  const session={...s,expires_at};
  try{localStorage.setItem(SESSION_KEY,JSON.stringify(session))}catch{}
  return session;
}
async function authCall(path,body){
  const r=await fetch(SUPABASE_URL+'/auth/v1/'+path,{method:'POST',headers:{apikey:PUBLISHABLE_KEY,'content-type':'application/json'},body:JSON.stringify(body),cache:'no-store'});
  const data=await r.json().catch(()=>({}));
  if(!r.ok||!data.access_token)throw new Error(data.msg||data.error_description||('auth_'+r.status));
  return storeSession(data);
}
async function currentSession(){
  const hash=new URLSearchParams(location.hash.replace(/^#/,''));
  const handoff=hash.get('ekodi_token');
  if(handoff){
    const s=await authCall('verify',{type:hash.get('ekodi_type')||'email',token_hash:handoff});
    history.replaceState(null,'',location.pathname+location.search);
    return s;
  }
  let s=readSession();
  if(s&&Number(s.expires_at||0)<Math.floor(Date.now()/1000)+30){
    s=s.refresh_token?await authCall('token?grant_type=refresh_token',{refresh_token:s.refresh_token}).catch(()=>null):null;
  }
  return s;
}
async function rest(path,{method='GET',body,prefer}={}){
  const headers={apikey:PUBLISHABLE_KEY,authorization:'Bearer '+activeSession.access_token,accept:'application/json'};
  if(body!==undefined)headers['content-type']='application/json';
  if(prefer)headers.Prefer=prefer;
  const r=await fetch(SUPABASE_URL+'/rest/v1/'+path,{method,headers,body:body===undefined?undefined:JSON.stringify(body),cache:'no-store'});
  const text=await r.text();const data=text?JSON.parse(text):null;
  if(!r.ok)throw new Error(data?.message||('요청 실패 '+r.status));
  return data;
}
const TABLE='church_worship_materials';
async function ensureAuth(){
  try{
    activeSession=await currentSession();
    if(!activeSession){location.replace(loginUrl());return false}
    sessionStorage.setItem('ekodi-auth-token',activeSession.access_token);
    let access;
    try{access=await rest('rpc/current_site_access',{method:'POST',body:{p_site_key:'church'}})}
    catch(error){
      if(!sessionStorage.getItem('ekodi-church-mypage-relogin')){sessionStorage.setItem('ekodi-church-mypage-relogin','1');try{localStorage.removeItem(SESSION_KEY)}catch{}location.replace(loginUrl());return false}
      throw error;
    }
    sessionStorage.removeItem('ekodi-church-mypage-relogin');
    const status=String(access?.status||'');const role=String(access?.role||'');
    if(status!=='active'||role!=='tenant_admin'){
      document.body.innerHTML='<main style="max-width:720px;margin:80px auto;padding:24px;font-family:sans-serif"><h1>예배 운영 권한이 필요합니다.</h1><p>에코디교회 운영관리자 권한이 확인된 계정만 이 화면을 사용할 수 있습니다.</p><p><a href="https://ekodi.kr/my/">My EKODI로 돌아가기</a></p></main>';
      return false;
    }
    sb.ready=true;accessReady=true;
    const status2=document.querySelector('.status-card small');if(status2)status2.textContent=(activeSession.user?.email||'운영자')+' 계정으로 연결되었습니다.';
    await loadRemote();
    await loadReviews();
    return true;
  }catch(error){
    console.error('[EKODI Church worship auth]',error);
    const status=document.querySelector('.status-card small');if(status)status.innerHTML='중앙 로그인 확인에 실패했습니다. <a href="'+loginUrl()+'">다시 로그인</a>';
    return false;
  }
}
async function loadRemote(){
  if(!accessReady||!sb.ready)return;
  const date=$('serviceDate').value||todayFor(service);
  let data=null;
  try{const rows=await rest(TABLE+'?select=*&service_type=eq.'+service+'&service_date=eq.'+date+'&limit=1');data=rows?.[0]||null}catch(error){console.warn('[worship load]',error.message);return}
  if(data){fill(data);localStorage.setItem(`ekodi:church:worship:${service}`,JSON.stringify({...data,service,serviceName:data.service_name,time:data.service_time,date:data.service_date}))}
}
async function loadReviews(){
  const card=$('reviewCard'),list=$('reviewList');
  if(!card||!accessReady||!sb.ready)return;
  card.hidden=false;
  try{
    const weekly=await fetch('../worship/weekly.json',{cache:'no-store'}).then(r=>{if(!r.ok)throw new Error('목록 '+r.status);return r.json()});
    const items=(weekly.services||[]).filter(v=>/^\d{4}-\d{2}-\d{2}$/.test(v.date)).sort((a,b)=>b.date.localeCompare(a.date)).slice(0,4);
    const data=items.length?await rest(TABLE+'?select=service_date,title,is_published&service_type=eq.sunday&service_date=in.('+items.map(v=>v.date).join(',')+')'):[];
    const rows=Object.fromEntries((data||[]).map(r=>[r.service_date,r]));
    list.innerHTML=items.map(v=>{const r=rows[v.date]||{};const pub=r.is_published===true;return `<div class="review-row" data-date="${esc(v.date)}"><div><strong>${esc(v.date)} 주일모임</strong> <span class="review-badge ${pub?'public':''}">${pub?'공개됨':'검토 중 · 비공개'}</span><small>${esc(r.title||'제목 확인 중')}</small></div><div class="review-actions"><a href="${esc(v.page)}">검토 화면</a><a href="${esc(v.page)}?view=stage">PPT 16:9</a><a href="${esc(v.page)}sermon/">말씀나눔</a>${pub?'<button type="button" data-review="hide">비공개로 되돌리기</button>':'<button type="button" class="primary" data-review="publish">최종 검토 완료 · 공개</button>'}</div></div>`}).join('')||'<p>등록된 예배자료가 없습니다.</p>';
  }catch(error){list.innerHTML=`<p>목록을 불러오지 못했습니다: ${esc(error.message)}</p>`}
}
document.addEventListener('click',async event=>{
  const button=event.target.closest('[data-review]');if(!button)return;
  const date=button.closest('[data-date]')?.dataset.date;if(!date||!sb.ready)return;
  const publish=button.dataset.review==='publish';
  if(!confirm(publish?`${date} 예배자료를 최종 검토했고 일반에 공개합니다.`:`${date} 예배자료를 다시 비공개로 돌립니다.`))return;
  button.disabled=true;
  let data=null,error=null;
  try{data=await rest(TABLE+'?service_type=eq.sunday&service_date=eq.'+date,{method:'PATCH',body:{is_published:publish,updated_at:new Date().toISOString()},prefer:'return=representation'})}catch(e){error=e}
  if(error||!data?.length){alert(`처리 실패: ${error?.message||'예배 기록이 없습니다. 위 입력란에서 먼저 저장해 주세요.'}`);button.disabled=false;return}
  await loadReviews();
});
async function persist(published=false){
  saveLocal();
  if(!accessReady||!sb.ready)throw new Error('login_required');
  const p=payload();
  if(!p.date)throw new Error('날짜를 입력해 주세요.');
  await rest(TABLE+'?on_conflict=service_type,service_date',{method:'POST',body:record(p,published),prefer:'resolution=merge-duplicates,return=minimal'});
  return p;
}
async function saveDraft(){try{await persist(false);setStatus('webStatus','초안 저장됨')}catch(error){alert(`저장 실패: ${error.message}`)}}
function bulletinHtml(p){return`<!doctype html><html lang="ko"><meta charset="utf-8"><title>${esc(p.serviceName)} 주보</title><style>body{font-family:serif;max-width:760px;margin:40px auto;padding:24px;color:#222}h1{text-align:center;margin-bottom:6px}.meta{text-align:center;color:#555;margin-bottom:30px}.row{padding:12px 0;border-bottom:1px solid #ddd}.row b{display:inline-block;width:110px}.notice{white-space:pre-wrap}@media print{button{display:none}}</style><h1>에코디교회 ${esc(p.serviceName)} 주보</h1><div class="meta">${esc(p.date)} · ${esc(p.time)}</div><div class="row"><b>본문</b>${esc(p.scripture)}</div><div class="row"><b>말씀</b>${esc(p.title)}</div><div class="row"><b>설교</b>${esc(p.preacher)}</div><div class="row"><b>찬양</b><span style="white-space:pre-wrap">${esc(p.songs)}</span></div><div class="row"><b>대표기도</b>${esc(p.prayer)}</div><div class="row"><b>식사준비</b>${esc(p.meal)}</div><div class="row"><b>공지</b><span class="notice">${esc(p.notice)}</span></div><p style="margin-top:36px;text-align:center">말씀대로 살아내고 살려내는 공동체 · EKODI CHURCH</p><button onclick="print()">인쇄 / PDF 저장</button></html>`}
function openBulletin(){saveLocal();const w=window.open('','_blank');w.document.write(bulletinHtml(payload()));w.document.close();setStatus('bulletinStatus')}
function pptHtml(p){const slides=[['에코디교회 '+p.serviceName,`${p.date} · ${p.time}`],[p.scripture||'오늘의 말씀',p.title||'말씀으로 삶을 읽습니다'],['찬양',p.songs||'찬양 순서'],['말씀',`${p.title||''}\n${p.scripture||''}\n${p.preacher||''}`],['공동체 소식',p.notice||'함께 나눌 소식'],['보냄','들은 말씀을 오늘의 삶으로 살아냅니다.']];return`<html><head><meta charset="utf-8"><style>@page{size:13.333in 7.5in;margin:0}body{margin:0;font-family:Arial,sans-serif}.slide{page-break-after:always;width:13.333in;height:7.5in;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;padding:1in;box-sizing:border-box}.slide h1{font-size:34pt}.slide p{font-size:22pt;white-space:pre-wrap;line-height:1.5}</style></head><body>${slides.map(s=>`<section class="slide"><h1>${esc(s[0])}</h1><p>${esc(s[1])}</p></section>`).join('')}</body></html>`}
function downloadPpt(){saveLocal();const p=payload();const blob=new Blob([pptHtml(p)],{type:'application/vnd.ms-powerpoint'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`${p.date||'service'}-${p.serviceName}-EKODI.ppt`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);setStatus('pptStatus')}
async function publishWebsite(){try{await persist(true);setStatus('webStatus','홈페이지 게시됨');return true}catch(error){alert(`게시 실패: ${error.message}`);return false}}
function openLive(){saveLocal();const p=payload();const q=new URLSearchParams({mode:'studio',service:p.serviceName,date:p.date,title:p.title,scripture:p.scripture,preacher:p.preacher,notice:p.notice});setStatus('liveStatus','스튜디오 연결');window.open(`../live/?${q.toString()}`,'_blank')}

document.querySelectorAll('.service-tab').forEach(btn=>btn.addEventListener('click',async()=>{document.querySelectorAll('.service-tab').forEach(b=>b.classList.remove('active'));btn.classList.add('active');service=btn.dataset.service;loadLocal();await loadRemote()}));
['serviceDate','scripture','title','preacher','songs','prayer','notice','meal'].forEach(id=>$(id).addEventListener('input',render));
$('serviceDate').addEventListener('change',()=>void loadRemote());
$('saveDraft').addEventListener('click',()=>void saveDraft());
$('openBulletin').addEventListener('click',openBulletin);
$('downloadPpt').addEventListener('click',downloadPpt);
$('prepareWeb').addEventListener('click',()=>void publishWebsite());
$('openLive').addEventListener('click',openLive);
$('prepareAll').addEventListener('click',async()=>{saveLocal();setStatus('bulletinStatus','생성 가능');setStatus('pptStatus','생성 가능');const published=await publishWebsite();if(published)setStatus('liveStatus','설정값 준비됨')});
loadLocal();
void ensureAuth();
