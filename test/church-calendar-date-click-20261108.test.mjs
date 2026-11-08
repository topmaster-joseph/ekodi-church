import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';

const script=await readFile(new URL('../church-shared-schedules.js',import.meta.url),'utf8');
const kstToday=()=>{
  const p=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());
  const val=t=>p.find(x=>x.type===t)?.value||'';
  return [val('year'),val('month'),val('day')].join('-');
};
const plusDays=(iso,n)=>{
  const d=new Date(iso+'T00:00:00Z');
  d.setUTCDate(d.getUTCDate()+n);
  return d.toISOString().slice(0,10);
};
function node(tag){
  return {tag,tagName:tag.toUpperCase(),dataset:{},className:'',textContent:'',attrs:{},listeners:{},children:[],
    classList:{add(){}},append(...elements){this.children.push(...elements)},
    replaceChildren(...elements){this.children=[...elements]},
    setAttribute(name,value){this.attrs[name]=String(value)},
    addEventListener(name,handler){this.listeners[name]=handler},
  };
}
async function boot(lang){
  const today=kstToday(),tomorrow=plusDays(today,1);
  const list=node('ol'),days=node('div'),month=node('strong'),selected=node('h3');
  const previous=node('button'),next=node('button'),todayButton=node('button');
  const lookups={
    '[data-church-calendar-days]':days,'[data-church-calendar-month]':month,
    '[data-church-calendar-prev]':previous,'[data-church-calendar-next]':next,
    '[data-church-calendar-today]':todayButton
  };
  const calendar={querySelector:key=>lookups[key]||null};
  const root={dataset:{limit:'100'},querySelector:key=>({
    '[data-church-schedules-list]':list,'[data-church-shared-calendar]':calendar,
    '[data-church-selected-day]':selected
  }[key]||null)};
  const document={documentElement:{lang},hidden:false,createElement:node,addEventListener(){},
    querySelector:key=>key==='[data-church-shared-schedules]'?root:null};
  const window={addEventListener(){},EKODIChurchI18n:{getLocale:()=>lang}};
  const location={search:'?lang='+encodeURIComponent(lang)};
  const fixtures=[
    {id:1,source:'ekodichurch',kind:'recurring-worship',date:today,time:'11:00',
     title:'공개 교회 행사',venue:'에코디교회',url:'/ekodichurch/board/post/1'},
    {id:2,source:'ekodimission',kind:'recurring-meeting',date:tomorrow,time:'11:00',
     title:'공개 선교회 행사',venue:'에코디교회',url:'/ekodimission?meeting='+tomorrow+'#saturday'}
  ];
  const fetch=async()=>({ok:true,json:async()=>({ok:true,mode:'published-read-only',items:fixtures})});
  vm.runInNewContext(script,{document,window,location,fetch,Intl,Date,URLSearchParams,
    AbortSignal:{timeout:()=>({})},setInterval:()=>1,clearInterval:()=>{}},{timeout:1600});
  await new Promise(resolve=>setImmediate(resolve));
  await new Promise(resolve=>setImmediate(resolve));
  return {today,tomorrow,list,days,month,selected,previous,next,todayButton};
}
const badge=row=>row.children.find(x=>x.className?.includes('church-schedule-origin'));
const link=row=>row.children.find(x=>x.tag==='a');

test('calendar date click switches strictly from Church source to Mission source in Korean and English',async()=>{
  for(const lang of ['ko-KR','en']){
    const app=await boot(lang);
    assert.equal(app.list.children.length,1,'selected today has exactly one Church event');
    assert.match(badge(app.list.children[0]).attrs['aria-label'],lang==='en'?/Church/:/교회/);
    assert.equal(link(app.list.children[0]).href,'/ekodichurch/board/post/1');
    if(app.today.slice(0,7)!==app.tomorrow.slice(0,7))
      app.next.listeners.click();
    const button=app.days.children.find(x=>x.dataset.date===app.tomorrow);
    assert.ok(button,'tomorrow remains selectable in '+lang);
    button.listeners.click();
    assert.equal(button.attrs['aria-pressed'],'true');
    assert.equal(app.list.children.length,1);
    assert.match(badge(app.list.children[0]).attrs['aria-label'],lang==='en'?/Mission/:/선교회/);
    assert.equal(link(app.list.children[0]).href,'/ekodimission?meeting='+app.tomorrow+'#saturday');
    assert.equal(link(app.list.children[0]).attrs.translate,'no');
    assert.ok(app.selected.textContent);
    app.todayButton.listeners.click();
    assert.equal(link(app.list.children[0]).href,'/ekodichurch/board/post/1');
  }
});
