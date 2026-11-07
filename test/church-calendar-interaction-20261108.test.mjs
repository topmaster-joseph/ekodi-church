import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {runInNewContext} from 'node:vm';
const read=file=>readFile(new URL('../'+file,import.meta.url),'utf8');

function el(tag='div'){
  const node={tag,children:[],dataset:{},attrs:{},listeners:{},classList:{items:new Set(),add(value){this.items.add(value)}},
    setAttribute(key,value){this.attrs[key]=value},
    append(...items){this.children.push(...items)},
    replaceChildren(...items){this.children=items},
    addEventListener(type,fn){this.listeners[type]=fn}
  };
  return node;
}
const today=()=>{
  const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());
  const part=type=>parts.find(x=>x.type===type)?.value||'';
  return [part('year'),part('month'),part('day')].join('-');
};
const saturday=()=>{
  const [year,month,day]=today().split('-').map(Number);
  const date=new Date(Date.UTC(year,month-1,day));
  date.setUTCDate(date.getUTCDate()+(6-date.getUTCDay()+7)%7);
  return date.toISOString().slice(0,10);
};

test('interactive calendar renders only published Church and Mission events for clicked KST day',async()=>{
  const source=await read('church-shared-schedules.js');
  const date=today(),sat=saturday();
  const items=[
    {source:'ekodichurch',sourceLabel:'에코디교회',date,time:'11:00',title:'공개 주일모임',url:'/ekodichurch/board/post/1',kind:'worship',venue:'예배실'},
    {source:'ekodimission',sourceLabel:'에코디선교회',date,time:'17:00',title:'공개 교제',url:'/ekodimission?meeting=1',kind:'public-event',venue:'모임실'},
    {source:'ekodimission',sourceLabel:'에코디선교회',date:sat,time:'17:00',title:'공개 토요모임',url:'/ekodimission?meeting=2',kind:'recurring-meeting',venue:'예배실'},
    {source:'ekodimission',sourceLabel:'비공개 전화번호 010-1234-5678',date,time:'17:00',title:'차단해야 할 외부 링크',url:'https://example.invalid',kind:'public-event',venue:'비공개'}
  ];
  const list=el('ol'),upcoming=el('ol'),days=el('div'),label=el('strong'),selectedLabel=el('h2'),target=el('strong');
  const calendar=el('section'); const root=el('section'); root.dataset.limit='100';
  const prev=el('button'),next=el('button'),backToday=el('button');
  const calendarParts={
    '[data-church-calendar-days]':days,'[data-church-calendar-month]':label,
    '[data-church-calendar-prev]':prev,'[data-church-calendar-next]':next,
    '[data-church-calendar-today]':backToday
  };
  calendar.querySelector=key=>calendarParts[key]??null;
  const roots={
    '[data-church-schedules-list]':list,'[data-church-shared-calendar]':calendar,
    '[data-church-upcoming-list]':upcoming,'[data-church-selected-day]':selectedLabel
  };
  root.querySelector=key=>roots[key]??null;
  const document={
    hidden:false,querySelector:key=>key==='[data-church-shared-schedules]'?root:
      key==='#worship .schedule>div:nth-child(2) strong'?target:null,
    createElement:el,addEventListener(){}
  };
  const window={addEventListener(){}};
  runInNewContext(source,{
    document,window,Intl,Date,
    fetch:async()=>({ok:true,json:async()=>({ok:true,mode:'published-read-only',items})}),
    AbortSignal:{timeout:()=>({})},
    setInterval:()=>1,clearInterval:()=>{}
  });
  for(let i=0;i<10;i++)await Promise.resolve();
  assert.match(label.textContent,/년 .*월/);
  assert.ok(days.children.length>=28);
  const button=days.children.find(x=>x.dataset.date===date);
  assert.ok(button,'today button exists');
  assert.match(button.attrs['aria-label'],/교회 일정 1건/);
  assert.match(button.attrs['aria-label'],/선교회 일정/);
  button.listeners.click();
  const titles=list.children.map(row=>row.children.find(x=>x.tag==='a')?.textContent).filter(Boolean);
  assert.ok(titles.includes('공개 주일모임'));
  assert.ok(titles.includes('공개 교제'));
  assert.ok(!titles.includes('차단해야 할 외부 링크'));
  const badges=list.children.flatMap(row=>row.children.filter(x=>x.className?.includes('church-schedule-origin')).map(x=>x.textContent));
  assert.ok(badges.includes('교회 일정'));
  assert.ok(badges.includes('선교회 일정'));
  assert.ok(upcoming.children.length>=2);
  assert.equal(target.textContent,'이번 주 토요일 오후 5:00');
  assert.ok(next.listeners.click&&prev.listeners.click&&backToday.listeners.click,'calendar controls bound');
  next.listeners.click();
  backToday.listeners.click();
  assert.equal(selectedLabel.textContent,date.replaceAll('-','.')+' 일정');
});

test('small-screen controls remain at least 44px and shared event URLs stay first-party',async()=>{
  const css=await read('church-shared-calendar.css');
  assert.match(css,/min-height:44px;min-width:44px/);
  assert.match(css,/\.church-calendar-day\{min-height:44px/);
  const js=await read('church-shared-schedules.js');
  assert.match(js,/x\.date===saturdayDate/);
  assert.doesNotMatch(js,/innerHTML|\bPOST\b|\bPATCH\b|\bDELETE\b/);
});
