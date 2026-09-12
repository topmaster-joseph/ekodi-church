const SUPABASE_URL='https://renzehysxirjilvdxacv.supabase.co';
const PUBLISHABLE_KEY='sb_publishable_0QjB0WzZbjrd-FJ5D5cR7A_xUkXyOY_';
const $=(id)=>document.getElementById(id);
let service='sunday';
let sb=null;
let activeSession=null;
let accessReady=false;
const names={sunday:'주일모임',saturday:'토요모임'};
const defaultTimes={sunday:'일요일 오전 11시',saturday:'토요일 오전 11시'};

function esc(v){return String(v||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]))}
function todayFor(type){
  const d=new Date();const target=type==='sunday'?0:6;let diff=(target-d.getDay()+7)%7;
  if(diff===0&&d.getHours()>=12)diff=7;d.setDate(d.getDate()+diff);return d.toISOString().slice(0,10)
}
function payload(){return{service,serviceName:names[service],time:defaultTimes[service],date:$('serviceDate').value,scripture:$('scripture').value.trim(),title:$('title').value.trim(),preacher:$('preacher').value.trim(),songs:$('songs').value.trim(),prayer:$('prayer').value.trim(),notice:$('notice').value.trim(),meal:$('meal').value.trim(),updatedAt:new Date().toISOString()}}
function render(){const p=payload();$('serviceLabel').textContent=p.serviceName;$('summary').innerHTML=`<dl><dt>일시</dt><dd>${esc(p.date)} · ${esc(p.time)}</dd><dt>본문</dt><dd>${esc(p.scripture||'미입력')}</dd><dt>제목</dt><dd>${esc(p.title||'미입력')}</dd><dt>설교</dt><dd>${esc(p.preacher||'미입력')}</dd><dt>찬양</dt><dd>${esc(p.songs||'미입력')}</dd><dt>대표기도</dt><dd>${esc(p.prayer||'미입력')}</dd><dt>공지</dt><dd>${esc(p.notice||'없음')}</dd><dt>식사준비</dt><dd>${esc(p.meal||'미정')}</dd></dl>`}
function setStatus(id,text='준비됨'){$(id).textContent=text;$(id).classList.add('ready')}
function saveLocal(){localStorage.setItem(`ekodi:church:worship:${service}`,JSON.stringify(payload()));render()}
function fill(p){$('serviceDate').value=p.date||p.service_date||todayFor(service);$('scripture').value=p.scripture||'';$('title').value=p.title||'';$('preacher').value=p.preacher||'정찬균 목사';$('songs').value=p.songs||'';$('prayer').value=p.prayer||'';$('notice').value=p.notice||'';$('meal').value=p.meal||'';render()}
function loadLocal(){const raw=localStorage.getItem(`ekodi:church:worship:${service}`);if(raw){try{fill(JSON.parse(raw));return}catch{}}fill({date:todayFor(service),preacher:'정찬균 목사'})}
function record(p,published=false){return{service_type:p.service,service_date:p.date,service_name:p.serviceName,service_time:p.time,scripture:p.scripture,title:p.title,preacher:p.preacher,songs:p.songs,prayer:p.prayer,notice:p.notice,meal:p.meal,is_published:published,created_by:activeSession?.user?.id||null,updated_at:new Date().toISOString()}}
function loginUrl(){const target='https://ekodi.kr/ekodichurch/mypage/';return `https://ekodi.kr/auth/?site=church&return_to=${encodeURIComponent(target)}`}
async function ensureAuth(){
  try{
    const {createClient}=await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
    sb=createClient(SUPABASE_URL,PUBLISHABLE_KEY,{auth:{detectSessionInUrl:true,persistSession:true}});
    const hash=new URLSearchParams(location.hash.replace(/^#/,''));
    const handoff=hash.get('ekodi_token');
    if(handoff){
      const {error}=await sb.auth.verifyOtp({token_hash:handoff,type:hash.get('ekodi_type')||'email'});
      if(error)throw error;
      history.replaceState(null,'',location.pathname+location.search);
    }
    const {data,error}=await sb.auth.getSession();
    if(error)throw error;
    activeSession=data?.session||null;
    if(!activeSession){location.replace(loginUrl());return false}
    sessionStorage.setItem('ekodi-auth-token',activeSession.access_token);
    const {data:access,error:accessError}=await sb.rpc('current_site_access',{p_site_key:'church'});
    if(accessError)throw accessError;
    const status=String(access?.status||'');const role=String(access?.role||'');
    if(status!=='active'||role!=='tenant_admin'){
      document.body.innerHTML='<main style="max-width:720px;margin:80px auto;padding:24px;font-family:sans-serif"><h1>예배 운영 권한이 필요합니다.</h1><p>에코디교회 운영관리자 권한이 확인된 계정만 이 화면을 사용할 수 있습니다.</p><p><a href="https://ekodi.kr/my/">My EKODI로 돌아가기</a></p></main>';
      return false;
    }
    accessReady=true;
    await loadRemote();
    return true;
  }catch(error){
    console.error('[EKODI Church worship auth]',error);
    const status=document.querySelector('.status-card small');if(status)status.textContent='중앙 로그인 확인에 실패했습니다. 다시 로그인해 주세요.';
    return false;
  }
}
async function loadRemote(){
  if(!accessReady||!sb)return;
  const date=$('serviceDate').value||todayFor(service);
  const {data,error}=await sb.from('church_worship_materials').select('*').eq('service_type',service).eq('service_date',date).maybeSingle();
  if(error){console.warn('[worship load]',error.message);return}
  if(data){fill(data);localStorage.setItem(`ekodi:church:worship:${service}`,JSON.stringify({...data,service,serviceName:data.service_name,time:data.service_time,date:data.service_date}))}
}
async function persist(published=false){
  saveLocal();
  if(!accessReady||!sb)throw new Error('login_required');
  const p=payload();
  if(!p.date)throw new Error('날짜를 입력해 주세요.');
  const {error}=await sb.from('church_worship_materials').upsert(record(p,published),{onConflict:'service_type,service_date'});
  if(error)throw error;
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
