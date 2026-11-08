import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {runInNewContext} from 'node:vm';

const read=path=>readFile(new URL('../'+path,import.meta.url),'utf8');
const languages=['en','zh-CN','ja','my','kac','vi','mn','id'];

function run(locale,script){
  const singles=new Map(),groups=new Map();
  const build=(name)=>({name,textContent:'원본 텍스트',attrs:{},setAttribute(k,v){this.attrs[k]=v}});
  const one=selector=>{if(!singles.has(selector))singles.set(selector,build(selector));return singles.get(selector)};
  const count={'.site-header nav a':6,'.church-calendar-weekdays span':7,
    '.church-calendar-legend span':2,'.church-schedule-links a':2,
    '.church-footer-info span':4,'.church-footer-legal a':3};
  const group=selector=>{if(!groups.has(selector))groups.set(selector,Array.from({length:count[selector]||0},(_,i)=>build(selector+i)));return groups.get(selector)};
  const privacy=one('.church-schedule-footer-info');
  privacy.childNodes=[{nodeType:3,textContent:'공개 일정만 공유됩니다.'}];
  const document={body:{matches:()=>true},documentElement:{lang:'ko',dataset:{}},
    querySelector:one,querySelectorAll:group,title:'',};
  const location={search:'?lang='+encodeURIComponent(locale)};
  runInNewContext(script,{document,location,URLSearchParams,Set,Object}, {timeout:1500});
  return{one,group,document,privacy};
}

test('standalone schedule initializes its localizer before dynamic calendar and preserves auth/UI paths',async()=>{
  const [html,localizer,events]=await Promise.all([
    read('schedule/index.html'),read('church-schedule-page-i18n.js'),read('church-shared-schedules.js')
  ]);
  assert.ok(html.includes('/ekodichurch/church-schedule-page-i18n.js'));
  assert.ok(html.indexOf('/ekodichurch/church-schedule-page-i18n.js')<html.indexOf('/ekodichurch/church-shared-schedules.js'));
  assert.ok(html.includes('data-church-public-manage hidden'));
  assert.ok(html.includes('data-church-schedule data-limit="100" aria-label="교회 일정 관리자 편집 목록" hidden'));
  assert.ok(localizer.includes('if(!document.body?.matches?.'));
  assert.doesNotMatch(localizer,/innerHTML|outerHTML|fetch\(|eval\(|\bPOST\b|\bPATCH\b|\bDELETE\b/);
  assert.ok(events.includes("mode!=='published-read-only'"));
  assert.ok(events.includes('data-ekodi-user-content'));
  assert.ok(events.includes("x.date===saturdayDate"));
  assert.ok(events.includes('calendarForMonth()'));
});

test('all eight non-Korean selections localize standalone schedule without changing post content',async()=>{
  const source=await read('church-schedule-page-i18n.js');
  for(const lang of languages){
    const v=run(lang,source);
    const heading=v.one('.church-schedule-intro > h1').textContent;
    const intro=v.one('.church-schedule-intro > p').textContent;
    const weekday=v.group('.church-calendar-weekdays span');
    const nav=v.group('.site-header nav a');
    const badge=v.group('.church-calendar-legend span');
    assert.ok(heading.length>3&&intro.length>15,lang);
    assert.ok(nav.every(x=>x.textContent.length>1),lang);
    assert.ok(weekday.length===7&&weekday.every(x=>x.textContent),lang);
    assert.ok(badge.length===2&&badge.every(x=>x.textContent),lang);
    assert.doesNotMatch([heading,intro,...nav.map(x=>x.textContent),...badge.map(x=>x.textContent)].join(' '),/[가-힣]/,lang);
    assert.notEqual(v.privacy.childNodes[0].textContent,'공개 일정만 공유됩니다.',lang);
    assert.ok(v.privacy.childNodes[0].textContent.trim().length>8,lang);
    assert.equal(v.one('[data-church-shared-calendar]').attrs['aria-label'].length>0,true);
    assert.equal(v.document.documentElement.lang,lang==='kac'?'en':lang);
    if(lang==='kac')assert.equal(v.document.documentElement.dataset.translationFallback,'en');
  }
});

test('Korean default is untouched, no user-authored title or original deep link is modified',async()=>{
  const source=await read('church-schedule-page-i18n.js');
  const v=run('ko-KR',source);
  assert.equal(v.one('.church-schedule-intro > h1').textContent,'원본 텍스트');
  assert.equal(v.group('.site-header nav a')[0].textContent,'원본 텍스트');
  assert.doesNotMatch(source,/querySelectorAll\([^)]*church-shared-link/);
  assert.doesNotMatch(source,/setAttribute\(['"]href['"]/);
});
