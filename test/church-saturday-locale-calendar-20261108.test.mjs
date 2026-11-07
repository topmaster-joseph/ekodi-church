import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {runInNewContext} from 'node:vm';

const read=path=>readFile(new URL('../'+path,import.meta.url),'utf8');
const KST=()=>{
  const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());
  const value=type=>parts.find(part=>part.type===type)?.value||'';
  return [value('year'),value('month'),value('day')].join('-');
};
const weekSaturday=()=>{
  const [y,m,d]=KST().split('-').map(Number);
  const date=new Date(Date.UTC(y,m-1,d));
  date.setUTCDate(date.getUTCDate()+(6-date.getUTCDay()+7)%7);
  return date.toISOString().slice(0,10);
};
const nextWeek=date=>{
  const d=new Date(date+'T00:00:00Z');
  d.setUTCDate(d.getUTCDate()+7);
  return d.toISOString().slice(0,10);
};
const make=tag=>({
  tag,textContent:'',className:'',dataset:{},children:[],attrs:{},
  classList:{add(){}},append(...items){this.children.push(...items)},
  replaceChildren(...items){this.children=[...items]},
  setAttribute(k,v){this.attrs[k]=String(v)}
});

async function render(locale,withThisWeek){
  const script=await read('church-shared-schedules.js');
  const saturday=weekSaturday();
  const meeting=(date,time,id)=>({
    source:'ekodimission',kind:'recurring-meeting',id,date,time,
    title:'토요 성경토론과 함께하는 식사',url:'/ekodimission?meeting='+id,
    venue:'에코디교회'
  });
  // Future entry intentionally precedes the current week's event.
  const items=[meeting(nextWeek(saturday),'19:00','next')];
  if(withThisWeek)items.push(meeting(saturday,'11:00','current'));
  const list=make('ol'),target=make('strong');
  target.textContent='매주 토요일 오전 11시';
  const root={dataset:{limit:'3'},querySelector:query=>query==='[data-church-schedules-list]'?list:null};
  const document={
    documentElement:{lang:locale},hidden:false,createElement:make,addEventListener(){},
    querySelector:query=>{
      if(query==='[data-church-shared-schedules]')return root;
      if(query==='#worship .schedule>div:nth-child(2) strong')return target;
      return null;
    }
  };
  const window={addEventListener(){},EKODIChurchI18n:{getLocale:()=>locale}};
  const location={search:'?lang='+encodeURIComponent(locale)};
  const fetch=async()=>({ok:true,json:async()=>({ok:true,mode:'published-read-only',items})});
  runInNewContext(script,{window,document,location,fetch,URLSearchParams,Intl,Date,
    AbortSignal:{timeout:()=>({})},setInterval:()=>1,clearInterval:()=>{}});
  for(let i=0;i<10;i++)await Promise.resolve();
  return {value:target.textContent,rows:list.children.length};
}

test('merged multilingual homepage keeps regular Saturday 11:00, Sunday 11:00 and a translation for the new fallback',async()=>{
  const [home,life]=await Promise.all([read('index.html'),read('church-life-hub-i18n.js')]);
  assert.match(home,/<span>토요모임<\/span><strong>매주 토요일 오전 11시<\/strong>/);
  assert.doesNotMatch(home,/<span>토요모임<\/span><strong>매주 토요일 오후 5시<\/strong>/);
  assert.match(home,/<span>주일모임<\/span><strong>매주 일요일 오전 11시<\/strong>/);
  assert.ok(life.includes("'매주 토요일 오전 11시': 'Every Saturday · 11:00 AM'"));
});

test('official current KST Saturday event overrides unrelated next-week event in every supported locale',async()=>{
  for(const locale of ['ko-KR','en','zh-CN','ja','my','kac','vi','mn','id']){
    const res=await render(locale,true);
    assert.equal(res.rows,2,'both public events still visible '+locale);
    if(locale==='ko-KR')assert.equal(res.value,'이번 주 토요일 오전 11:00');
    if(locale==='en')assert.equal(res.value,'This Saturday 11:00 AM');
    if(locale!=='ko-KR')assert.doesNotMatch(res.value,/[가-힣]/,'localized label '+locale);
    const expectedTime=locale==='ko-KR'?'오전 11:00':
      new Intl.DateTimeFormat(locale==='kac'?'en-US':locale,{timeZone:'UTC',hour:'numeric',minute:'2-digit'})
        .format(new Date(Date.UTC(2000,0,1,11,0)));
    assert.ok(res.value.endsWith(expectedTime),'current 11:00 must override the next-week 19:00 in '+locale+': '+res.value);
  }
});

test('no current-week published meeting never claims next week is this Saturday',async()=>{
  const result=await render('ko-KR',false);
  assert.equal(result.rows,1);
  assert.equal(result.value,'매주 토요일 오전 11시');
});

test('responsive calendar controls stay >=44px; public schedule is read only',async()=>{
  const [css,js]=await Promise.all([read('church-shared-calendar.css'),read('church-shared-schedules.js')]);
  assert.match(css,/min-height:44px;min-width:44px/);
  assert.match(css,/\.church-calendar-day\{min-height:44px/);
  assert.match(js,/x\.date===saturdayDate/);
  assert.match(js,/mode!=='published-read-only'/);
  assert.doesNotMatch(js,/innerHTML|\bPOST\b|\bPATCH\b|\bDELETE\b/);
});
