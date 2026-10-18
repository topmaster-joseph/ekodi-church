(()=>{
'use strict';
const $=id=>document.getElementById(id);
const PUBLIC='/api/public/church-calendar',ADMIN='/api/admin/church-calendar';
const SOURCE='https://new.pck.or.kr/bbs/board.php?bo_table=SM02_03_12&wr_id=457';
let editing=false,token='',all=[];
function accessToken(){
  try{const v=JSON.parse(sessionStorage.getItem('ekodi-church-pastor-session')||'null');
    if(v?.accessToken&&Number(v.expiresAt)>Math.floor(Date.now()/1000)+20)return v.accessToken;}catch{}
  return window.EKODI_MY_AUTH?.getAccessToken?.()||sessionStorage.getItem('ekodi-auth-token')||'';
}
const say=s=>{$('status').textContent=s};
const el=(tag,text,cls)=>{const x=document.createElement(tag);if(text!==undefined)x.textContent=String(text);if(cls)x.className=cls;return x;};
function setForm(item={}){
 const f=$('calendar-form');f.reset();
 for(const name of ['id','date','endDate','name','category','approval','bulletin','sermonFocus','sourceUrl','sourceNote']){
   const field=f.elements.namedItem(name);
   if(field)field.value=(name==='approval'&&item[name]==='provisional'?'draft':item[name])||({date:$('day').value,endDate:$('day').value,category:'denominational',approval:'draft',sourceUrl:SOURCE}[name]||'');
 }
 $('archive').disabled=!item.id;
 $('event-id').value=item.id||'';
 $('editor').scrollIntoView({behavior:'smooth',block:'start'});
}
function display(list){
 const root=$('events');root.replaceChildren();
 if(!list.length){root.append(el('p','조회한 기간에 등록된 교회력 항목이 없습니다.'));return;}
 for(const item of list){
   const card=el('article',undefined,'entry');
   const head=el('div',undefined,'entry-heading');
   head.append(el('h2',item.name));
   const status=el('span',item.approval==='approved'?'공개 승인':item.approval==='provisional'?'원문 대조 전 참고':'초안','state');
   head.append(status);card.append(head);
   card.append(el('p',item.date+(item.endDate!==item.date?' – '+item.endDate:'')+' · '+({liturgical:'교회 절기',denominational:'교단 기념',local:'교회 자체'}[item.category]||item.category),'meta'));
   if(item.bulletin){card.append(el('h3','교회소식 문안'));card.append(el('p',item.bulletin));}
   if(item.sermonFocus){card.append(el('h3','설교 적용 참고'));card.append(el('p',item.sermonFocus));}
   if(item.sourceUrl?.startsWith('https://')){const a=el('a','원문 출처 확인 ↗');a.href=item.sourceUrl;a.target='_blank';a.rel='noopener noreferrer';card.append(a);}
   const action=el('div',undefined,'entry-actions');
   if(item.bulletin){const b=el('button','교회소식 복사','secondary');b.type='button';b.addEventListener('click',()=>navigator.clipboard?.writeText(item.bulletin).then(()=>say('교회소식 문구를 복사했습니다.')).catch(()=>say('복사가 거부되었습니다.')));action.append(b);}
   if(item.sermonFocus){const b=el('button','설교 메모 복사','secondary');b.type='button';b.addEventListener('click',()=>navigator.clipboard?.writeText(item.sermonFocus).then(()=>say('설교 메모를 복사했습니다.')).catch(()=>say('복사가 거부되었습니다.')));action.append(b);}
   if(editing){const b=el('button','수정');b.type='button';b.addEventListener('click',()=>setForm(item));action.append(b);}
   card.append(action);root.append(card);
 }
}
async function reload(){
 const date=$('day').value,year=String($('year').value||'2026');
 if(!/^20\d{2}$/.test(year)){say('연도를 확인해 주세요.');return;}
 const query=new URLSearchParams(date?{date}:{year});
 const url=(editing?ADMIN:PUBLIC)+'?'+query;
 try{
   const response=await fetch(url,{headers:editing?{authorization:'Bearer '+token}:{},cache:'no-store'});
   if(!response.ok)throw new Error('교회력 조회 오류 '+response.status);
   const data=await response.json();all=data.events||[];display(all);
   say(all.length+'건 · '+(editing?'관리자 확인됨':'공개 참고자료')+' · 교단 원본과 연도별 대조해 주세요.');
 }catch(e){all=[];display([]);say('교회력 API 연결 또는 권한 확인이 필요합니다. '+e.message);}
}
async function adminMode(){
 token=accessToken();
 if(!token){
   const target=new URL('https://ekodi.kr/auth/');
   target.searchParams.set('site','ekodichurch');
   target.searchParams.set('return_to',location.href);
   location.assign(target.toString());return;
 }
 try{
   const response=await fetch(ADMIN+'?year='+encodeURIComponent($('year').value),{headers:{authorization:'Bearer '+token},cache:'no-store'});
   if(!response.ok)throw Error('운영권한 없음: '+response.status);
   editing=true;$('editor').hidden=false;
   say('교회 예배 운영 권한을 확인했습니다. 수정·등록 후 직접 저장할 수 있습니다.');
   await reload();
   setForm();
 }catch(e){editing=false;$('editor').hidden=true;say('교회력 관리를 시작할 수 없습니다. '+e.message);}
}
$('manage').addEventListener('click',adminMode);
$('lookup').addEventListener('click',reload);
$('year').addEventListener('change',()=>{$('day').value='';reload();});
$('day').addEventListener('change',reload);
$('reset').addEventListener('click',()=>setForm());
$('calendar-form').addEventListener('submit',async e=>{
 e.preventDefault();
 if(!editing)return;
 const id=$('event-id').value,form=new FormData(e.currentTarget),payload=Object.fromEntries(form.entries());
 if(payload.approval==='approved'&&!confirm('공식 출처와 내용을 대조하고 공개를 승인하시겠습니까?'))return;
 const method=id?'PUT':'POST';
 try{
   const response=await fetch(ADMIN,{method,headers:{authorization:'Bearer '+token,'content-type':'application/json'},body:JSON.stringify(payload),cache:'no-store'});
   const answer=await response.json();if(!response.ok)throw Error(answer.code||'저장 거부');
   say('교회력 저장 확인: '+answer.id);await reload();
 }catch(error){say('저장되지 않았습니다. '+error.message);}
});
$('archive').addEventListener('click',async()=>{
 const id=$('event-id').value;if(!editing||!id||!confirm('이 항목을 비공개 보관하시겠습니까?'))return;
 try{
  const response=await fetch(ADMIN,{method:'DELETE',headers:{authorization:'Bearer '+token,'content-type':'application/json'},body:JSON.stringify({id}),cache:'no-store'});
  const answer=await response.json();if(!response.ok)throw Error(answer.code||'보관 거부');
  say('보관했습니다.');setForm();await reload();
 }catch(error){say('보관되지 않았습니다. '+error.message);}
});
reload();
})();
