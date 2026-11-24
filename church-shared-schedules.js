// Official Church ↔ Mission calendar. Read only, same-origin, published metadata.
(()=>{
  'use strict';
  const root=document.querySelector('[data-church-shared-schedules]');
  if(!root)return;
  const list=root.querySelector('[data-church-schedules-list]');
  if(!list)return;
  const calendar=root.querySelector('[data-church-shared-calendar]');
  const upcoming=root.querySelector('[data-church-upcoming-list]');
  const escUrl=value=>/^\/(?:ekodichurch|ekodimission)(?:\/|\?|$)/.test(value||'')?value:'';
  const add=(tag,cls='',text='')=>{
    const item=document.createElement(tag);
    if(cls)item.className=cls;
    if(text)item.textContent=text;
    return item;
  };
  const markOriginal=node=>{
    node.setAttribute('data-ekodi-user-content','');
    node.setAttribute('lang','ko');
    node.setAttribute('translate','no');
    return node;
  };
  const fmt=date=>/^\d{4}-\d{2}-\d{2}$/.test(date||'')?date.replace(/-/g,'.'):'';
  // 화면 언어에 맞춘 날짜 표기(한국어 원문은 그대로). 번역 사전은 정확히 같은 문장만 바꾸므로 날짜가 들어간 문구는 여기서 만든다.
  const uiLocale=()=>{const lang=String(document.documentElement.lang||'ko-KR');return /^ko/i.test(lang)?'ko-KR':lang;};
  const tr=source=>{const loc=uiLocale();if(loc==='ko-KR')return source;const api=window.EKODIChurchI18n;const value=api?.translate?.(source,loc);if(value&&value!==source)return value;const en=api?.translate?.(source,'en');return en&&en!==source?en:source;};
  const intl=(opts,y,m,d)=>{const loc=uiLocale();for(const tag of [loc,'en']){try{return new Intl.DateTimeFormat(tag,{timeZone:'UTC',...opts}).format(new Date(Date.UTC(y,m-1,d||1)));}catch{}}return y+'-'+String(m).padStart(2,'0');};
  const monthLabel=(y,m)=>uiLocale()==='ko-KR'?y+'년 '+m+'월':intl({year:'numeric',month:'long'},y,m);
  const dayLabel=date=>{if(uiLocale()==='ko-KR')return fmt(date)+' 일정';const [y,m,d]=date.split('-').map(Number);return intl({year:'numeric',month:'short',day:'numeric'},y,m,d)+' · '+tr('일정');};
  const dayAria=(y,m,d,info)=>uiLocale()==='ko-KR'?y+'년 '+m+'월 '+d+'일, 교회 일정 '+info.church+'건, 선교회 일정 '+info.mission+'건':intl({year:'numeric',month:'long',day:'numeric'},y,m,d)+' — '+tr('교회 일정')+' '+info.church+', '+tr('선교회 일정')+' '+info.mission;
  const today=()=>{
    const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());
    const get=type=>parts.find(x=>x.type===type)?.value||'';
    return [get('year'),get('month'),get('day')].join('-');
  };
  const origin=item=>item.source==='ekodichurch'?'교회 일정':'선교회 일정';
  const labelTime=value=>{
    const [h,m]=String(value||'').split(':').map(Number);
    return Number.isInteger(h)&&Number.isInteger(m)?(h>=12?'오후 ':'오전 ')+(h%12||12)+':'+String(m).padStart(2,'0'):'';
  };
  let entries=[],month=today().slice(0,7),selected=today();
  const error=(message)=>{
    list.replaceChildren(add('li','church-shared-empty',message));
    if(upcoming)upcoming.replaceChildren(add('li','church-shared-empty',message));
  };
  const eventDetail=root.querySelector('[data-church-event-detail]');
  let selectedEventKey='',detailRequest=0;
  const eventKey=item=>[item.source,item.kind,item.id,item.date,item.time,item.title].join('|');
  function clearEventDetail(){
    selectedEventKey='';
    detailRequest++;
    if(eventDetail){eventDetail.hidden=true;eventDetail.replaceChildren();}
  }
  const appendFact=(dl,name,value)=>{
    dl.append(add('dt','',name),markOriginal(add('dd','',value||'확인 중')));
  };
  const safePublicPostApi=sourceUrl=>{
    const match=String(sourceUrl||'').match(/^\/(ekodichurch|ekodimission)\/board\/post\/([1-9]\d*)(?:[?#].*)?$/);
    return match?'/'+match[1]+'/board/api/posts/'+match[2]:'';
  };
  async function showEventDetail(item){
    if(!eventDetail)return;
    const token=++detailRequest;
    eventDetail.replaceChildren();
    eventDetail.hidden=false;
    eventDetail.append(add('span','church-schedule-origin church-schedule-origin-'+item.source,origin(item)));
    eventDetail.append(markOriginal(add('h3','',item.title||'주요일정')));
    const facts=add('dl');
    appendFact(facts,'날짜',fmt(item.date));
    appendFact(facts,'시간',labelTime(item.time));
    appendFact(facts,'장소',item.venue||'장소 미정');
    eventDetail.append(facts);
    const description=add('p','church-schedule-description','');
    eventDetail.append(description);
    const linked=escUrl(item.url);
    const officialPostApi=safePublicPostApi(linked);
    const defaultDescription=String(item.description||item.sourceLabel||'').trim();
    description.textContent=defaultDescription||'일정의 추가 안내는 원래 등록한 기관에서 확인할 수 있습니다.';
    markOriginal(description);
    if(linked){
      const original=add('a','church-schedule-source-link','등록 기관의 원문 보기');
      original.href=linked;
      eventDetail.append(original);
    }
    if(!officialPostApi)return;
    try{
      const response=await fetch(officialPostApi,{
        method:'GET',credentials:'same-origin',cache:'no-store',
        headers:{accept:'application/json'},signal:AbortSignal.timeout(7000)
      });
      if(!response.ok)throw new Error('public_post_unavailable');
      const post=await response.json();
      if(token!==detailRequest||selectedEventKey!==eventKey(item))return;
      const raw=typeof post?.body==='string'?post.body:(typeof post?.post?.body==='string'?post.post.body:'');
      if(!raw)return;
      let display=raw;
      try{
        const parsed=JSON.parse(raw);
        if(parsed&&typeof parsed==='object'&&parsed.date===item.date&&
           typeof parsed.description==='string')display=parsed.description;
      }catch{/* Free-text posts are a valid public detail. */}
      description.textContent=String(display).slice(0,3000).trim()||defaultDescription||'공개된 상세 안내가 없습니다.';
    }catch{
      // Calendar public metadata remains usable if detailed board post is unavailable.
      if(token!==detailRequest)return;
    }
  }
  function paintRows(target,items,limit,empty){
    if(!target)return;
    target.replaceChildren();
    const filtered=items.filter(item=>escUrl(item.url)).slice(0,limit);
    if(!filtered.length){target.append(add('li','church-shared-empty',empty));return;}
    for(const event of filtered){
      const isSelectedList=!!calendar&&target===list;
      const row=add('li',isSelectedList?'church-schedule-event':'');
      const badge=add('span','church-schedule-origin church-schedule-origin-'+event.source,origin(event));
      const sourceLabel=event.sourceLabel;
      const meta=[sourceLabel,fmt(event.date),labelTime(event.time),event.venue].filter(Boolean).join(' · ');
      if(isSelectedList){
        const button=add('button','church-schedule-event-select');
        button.type='button';
        button.dataset.eventKey=eventKey(event);
        button.setAttribute('aria-controls','church-schedule-event-detail');
        button.setAttribute('aria-expanded',String(eventKey(event)===selectedEventKey));
        const title=markOriginal(add('strong','',event.title||'일정 보기'));
        const sub=markOriginal(add('span','church-schedule-event-meta',meta));
        button.append(badge,title,sub);
        button.addEventListener('click',()=>{
          selectedEventKey=eventKey(event);
          paintRows(list,entries.filter(item=>item.date===selected),100,'선택한 날짜의 공개 일정이 없습니다.');
          void showEventDetail(event);
        });
        row.append(button);
      }else{
        const link=markOriginal(add('a','church-shared-link',event.title||'일정 보기'));
        link.href=escUrl(event.url);
        const subtitle=markOriginal(add('span','church-shared-meta',meta));
        row.append(badge,link,subtitle);
      }
      target.append(row);
    }
  }
  function calendarForMonth(){
    if(!calendar)return;
    const days=calendar.querySelector('[data-church-calendar-days]');
    const label=calendar.querySelector('[data-church-calendar-month]');
    const selectedLabel=root.querySelector('[data-church-selected-day]');
    if(!days||!label)return;
    const [year,mm]=month.split('-').map(Number);
    const countDays=new Date(Date.UTC(year,mm,0)).getUTCDate();
    const first=new Date(Date.UTC(year,mm-1,1)).getUTCDay();
    label.textContent=monthLabel(year,mm);
    if(selectedLabel)selectedLabel.textContent=dayLabel(selected);
    const counts=new Map();
    for(const item of entries){
      if(!item.date?.startsWith(month+'-'))continue;
      const byDay=counts.get(item.date)||{church:0,mission:0};
      byDay[item.source==='ekodichurch'?'church':'mission']+=1;
      counts.set(item.date,byDay);
    }
    days.replaceChildren();
    for(let i=0;i<first;i++){
      const spacer=add('span','church-calendar-empty');
      spacer.setAttribute('aria-hidden','true');days.append(spacer);
    }
    for(let day=1;day<=countDays;day++){
      const date=month+'-'+String(day).padStart(2,'0');
      const info=counts.get(date)||{church:0,mission:0};
      const button=add('button','church-calendar-day');
      button.append(add('span','church-calendar-number',String(day)));
      const dayEvents=entries.filter(item=>item.date===date);
      if(dayEvents.length){
        const preview=markOriginal(add('span','church-calendar-preview',dayEvents[0].title||'일정'));
        preview.title=String(dayEvents[0].title||'일정').slice(0,160);
        button.append(preview);
        if(dayEvents.length>1)button.append(add('span','church-calendar-more','+'+(dayEvents.length-1)));
      }
      button.type='button';
      button.dataset.date=date;
      button.setAttribute('aria-label',dayAria(year,mm,day,info));
      button.setAttribute('aria-pressed',String(date===selected));
      if(date===today())button.classList.add('is-today');
      if(info.church)button.classList.add('has-church-event');
      if(info.mission)button.classList.add('has-mission-event');
      button.addEventListener('click',()=>{
        selected=date;
        clearEventDetail();
        calendarForMonth();
        paintRows(list,entries.filter(item=>item.date===selected),100,'선택한 날짜의 공개 일정이 없습니다.');
      });
      days.append(button);
    }
  }
  function paint(items){
    entries=items;
    if(calendar){
      if(selectedEventKey&&!entries.some(item=>eventKey(item)===selectedEventKey&&item.date===selected))clearEventDetail();
      calendarForMonth();
      paintRows(list,entries.filter(item=>item.date===selected),100,'선택한 날짜의 공개 일정이 없습니다.');
      paintRows(upcoming,entries,Math.min(5,Math.max(1,Number(root.dataset.limit)||3)),'예정된 공개 일정이 없습니다.');
    }else{
      paintRows(list,entries,Math.min(7,Math.max(1,Number(root.dataset.limit)||7)),'예정된 공개 일정이 없습니다.');
    }
  }
  async function load(){
    try{
      const response=await fetch('/ekodichurch/board/api/shared-schedules',{
        credentials:'same-origin',headers:{accept:'application/json'},
        cache:'no-store',signal:AbortSignal.timeout(9000)
      });
      const data=response.ok?await response.json().catch(()=>null):null;
      if(data?.ok!==true||data.mode!=='published-read-only'||!Array.isArray(data.items))
        throw new Error('schedule_service_unavailable');
      const items=data.items.filter(x=>x&&['ekodichurch','ekodimission'].includes(x.source)&&
        /^\d{4}-\d{2}-\d{2}$/.test(x.date)&&x.date>=today()&&
        /^([01]\d|2[0-3]):[0-5]\d$/.test(x.time)&&escUrl(x.url)&&
        typeof x.title==='string'&&x.title.length<=160);
      const unique=new Map();
      for(const item of items){
        const key=[item.source,item.kind,item.id,item.date,item.time,item.title].join('|');
        if(!unique.has(key))unique.set(key,item);
      }
      paint([...unique.values()].sort((a,b)=>a.date.localeCompare(b.date)||a.time.localeCompare(b.time)||a.source.localeCompare(b.source)));
      const saturday=items.find(x=>x.source==='ekodimission'&&x.kind==='recurring-meeting');
      if(saturday){
        const target=document.querySelector('#worship .schedule>div:nth-child(2) strong');
        if(target)target.textContent='이번 주 토요일 '+labelTime(saturday.time);
      }
    }catch{
      error('현재 공유 일정을 불러오지 못했습니다. 잠시 후 다시 확인해 주세요.');
    }
  }
  if(calendar){
    const offset=delta=>{
      const [y,m]=month.split('-').map(Number);
      const d=new Date(Date.UTC(y,m-1+delta,1));
      month=d.getUTCFullYear()+'-'+String(d.getUTCMonth()+1).padStart(2,'0');
      selected=month+'-01';
      clearEventDetail();
      calendarForMonth();
      paintRows(list,entries.filter(item=>item.date===selected),100,'선택한 날짜의 공개 일정이 없습니다.');
    };
    calendar.querySelector('[data-church-calendar-prev]')?.addEventListener('click',()=>offset(-1));
    calendar.querySelector('[data-church-calendar-next]')?.addEventListener('click',()=>offset(1));
    calendar.querySelector('[data-church-calendar-today]')?.addEventListener('click',()=>{
      selected=today();month=selected.slice(0,7);
      clearEventDetail();
      calendarForMonth();
      paintRows(list,entries.filter(item=>item.date===selected),100,'선택한 날짜의 공개 일정이 없습니다.');
    });
  }
  // 언어를 바꾸면 날짜가 들어간 달력 문구도 그 언어로 다시 그린다(lang 속성 변화에만 반응해 반복 갱신 없음).
  if(calendar){let lastLang=uiLocale();new MutationObserver(()=>{const now=uiLocale();if(now===lastLang)return;lastLang=now;calendarForMonth();}).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});}
  document.addEventListener('church:public-content-updated',()=>{void load()});
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)void load()});
  window.addEventListener('focus',()=>{void load()});
  const refresh=setInterval(()=>{if(!document.hidden)void load()},300000);
  window.addEventListener('pagehide',()=>clearInterval(refresh),{once:true});
  void load();
})();
