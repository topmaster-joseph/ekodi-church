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
  const fmt=date=>/^\d{4}-\d{2}-\d{2}$/.test(date||'')?date.replace(/-/g,'.'):'';
  const today=()=>{
    const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());
    const get=type=>parts.find(x=>x.type===type)?.value||'';
    return [get('year'),get('month'),get('day')].join('-');
  };
  const origin=item=>item.source==='ekodichurch'?'교회 일정':'선교회 일정';
  // 간단 표시(2026-11-08): 구분은 색 점 + '교회'/'선교회' 한 단어. (사전 번역 대상)
  const originShort=item=>item.source==='ekodichurch'?'교회':'선교회';
  // A안(2026-11-08): 한국어가 아닌 화면에서는 한국어 원문 제목·장소 대신 번역되는 안내 문구와 날짜·시각만 표시.
  const korean=()=>/^ko\b/i.test(document.documentElement.lang||'ko');
  const time24=value=>/^([01]\d|2[0-3]):[0-5]\d$/.test(value||'')?value:'';
  const labelTime=value=>{
    const [h,m]=String(value||'').split(':').map(Number);
    return Number.isInteger(h)&&Number.isInteger(m)?(h>=12?'오후 ':'오전 ')+(h%12||12)+':'+String(m).padStart(2,'0'):'';
  };
  let entries=[],month=today().slice(0,7),selected=today();
  const error=(message)=>{
    list.replaceChildren(add('li','church-shared-empty',message));
    if(upcoming)upcoming.replaceChildren(add('li','church-shared-empty',message));
  };
  function paintRows(target,items,limit,empty){
    if(!target)return;
    target.replaceChildren();
    const filtered=items.filter(item=>escUrl(item.url)).slice(0,limit);
    if(!filtered.length){target.append(add('li','church-shared-empty',empty));return;}
    for(const event of filtered){
      const ko=korean();
      const row=add('li'),link=add('a','church-shared-link',ko?(event.title||'일정 보기'):(event.source==='ekodichurch'?'교회 일정 보기':'선교회 일정 보기'));
      link.href=escUrl(event.url);
      if(!ko&&event.title)link.title=event.title;
      const badge=add('span','church-schedule-origin church-schedule-origin-'+event.source,originShort(event));
      const meta=add('span','church-shared-meta',(ko?[event.sourceLabel,fmt(event.date),labelTime(event.time),event.venue]:[fmt(event.date),time24(event.time)])
        .filter(Boolean).join(' · '));
      row.append(badge,link,meta);target.append(row);
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
    label.textContent=year+'년 '+mm+'월';
    if(selectedLabel)selectedLabel.textContent=fmt(selected)+' 일정';
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
      const button=add('button','church-calendar-day',String(day));
      button.type='button';
      button.dataset.date=date;
      button.setAttribute('aria-label',year+'년 '+mm+'월 '+day+'일, 교회 일정 '+info.church+'건, 선교회 일정 '+info.mission+'건');
      button.setAttribute('aria-pressed',String(date===selected));
      if(date===today())button.classList.add('is-today');
      if(info.church)button.classList.add('has-church-event');
      if(info.mission)button.classList.add('has-mission-event');
      button.addEventListener('click',()=>{
        selected=date;
        calendarForMonth();
        paintRows(list,entries.filter(item=>item.date===selected),100,'선택한 날짜의 공개 일정이 없습니다.');
      });
      days.append(button);
    }
  }
  function paint(items){
    entries=items;
    if(calendar){
      calendarForMonth();
      paintRows(list,entries.filter(item=>item.date===selected),100,'선택한 날짜의 공개 일정이 없습니다.');
      paintRows(upcoming,entries,12,'예정된 공개 일정이 없습니다.');
    }else{
      paintRows(list,entries,Math.min(7,Math.max(1,Number(root.dataset.limit)||7)),'예정된 공개 일정이 없습니다.');
    }
  }
  // 언어가 실제로 바뀔 때만 다시 그림(번역 엔진은 같은 lang 값을 반복 설정함 → 무한 갱신 방지).
  let paintedLang=document.documentElement.lang;
  new MutationObserver(()=>{const next=document.documentElement.lang;if(next===paintedLang)return;paintedLang=next;if(entries.length)paint(entries);}).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
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
      if(saturday&&korean()){
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
      calendarForMonth();
      paintRows(list,entries.filter(item=>item.date===selected),100,'선택한 날짜의 공개 일정이 없습니다.');
    };
    calendar.querySelector('[data-church-calendar-prev]')?.addEventListener('click',()=>offset(-1));
    calendar.querySelector('[data-church-calendar-next]')?.addEventListener('click',()=>offset(1));
    calendar.querySelector('[data-church-calendar-today]')?.addEventListener('click',()=>{
      selected=today();month=selected.slice(0,7);
      calendarForMonth();
      paintRows(list,entries.filter(item=>item.date===selected),100,'선택한 날짜의 공개 일정이 없습니다.');
    });
  }
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)void load()});
  window.addEventListener('focus',()=>{void load()});
  const refresh=setInterval(()=>{if(!document.hidden)void load()},300000);
  window.addEventListener('pagehide',()=>clearInterval(refresh),{once:true});
  void load();
})();
