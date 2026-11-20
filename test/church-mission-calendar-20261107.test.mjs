import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const read=p=>readFile(new URL('../'+p,import.meta.url),'utf8');

test('Church public schedule has a readable month grid and both source legends',async()=>{
  const [page,css,home]=await Promise.all([
    read('schedule/index.html'),read('church-shared-calendar.css'),read('index.html')
  ]);
  for(const marker of ['data-church-shared-schedules','data-church-shared-calendar',
    'data-church-calendar-prev','data-church-calendar-next','data-church-calendar-today',
    'data-church-calendar-days','data-church-schedules-list']){
    assert.ok(page.includes(marker),marker);
  }
  assert.ok(!page.includes('data-church-upcoming-list'),'upcoming list removed by owner request');
  assert.ok(!page.includes('다가오는 일정'));
  assert.ok(page.includes('교회 일정')&&page.includes('선교회 일정'));
  assert.ok(page.includes('href="/ekodimission#schedule"'));
  assert.ok(page.includes('/ekodichurch/board?category=schedule'));
  assert.ok(home.includes('href="/ekodichurch/schedule/"'));
  assert.ok(css.includes('grid-template-columns:repeat(7,minmax(0,1fr))'));
  assert.ok(css.includes('@media(max-width:390px)'));
  assert.ok(page.includes('data-church-schedule data-limit="100" aria-label="교회 일정 관리자 편집 목록" hidden'));
  assert.ok(page.includes('data-church-public-manage hidden'));
  assert.ok(css.includes('[data-church-schedule][hidden]'));
  assert.ok(css.includes('[data-church-public-manage][hidden]'));
});

test('Church only reads independently owned published schedule metadata and never exposes cross-board editing',async()=>{
  const js=await read('church-shared-schedules.js');
  assert.doesNotThrow(()=>new Function(js));
  assert.ok(js.includes('/ekodichurch/board/api/shared-schedules'));
  assert.ok(js.includes("mode!=='published-read-only'"));
  assert.ok(js.includes("['ekodichurch','ekodimission'].includes(x.source)"));
  assert.ok(js.includes("const origin=item=>item.source==='ekodichurch'?words().church:words().mission"));
  assert.ok(js.includes("const LANG=Object.freeze({"));
  assert.ok(js.includes("if(name==='토요 성경토론과 함께하는 식사')return words().saturdayTitle"));
  assert.ok(js.includes("return event.source==='ekodichurch'?words().churchEvent:words().missionEvent"));
  for(const loc of ["'ko-KR'","en:","'zh-CN'","ja:","my:","kac:","vi:","mn:","id:"]){
    assert.ok(js.includes(loc+"{")||js.includes(loc+":{"),"locale "+loc);
  }
  assert.ok(js.includes("window.addEventListener('ekodi:locale-change'"));
  assert.ok(js.includes("const detailVenue=value=>"));
  const dictionary=await read('church-i18n.js');
  for(const value of ['에코디교회 주요 서비스','교회 소식과 일정','교회 일정 게시판','등록된 공지사항이 없습니다.']){
    assert.ok(dictionary.includes(JSON.stringify(value)+":"),"static i18n key "+value);
  }
  assert.ok(js.includes('document.createElement'));
  assert.ok(js.includes('textContent=text'));
  assert.ok(js.includes("document.addEventListener('visibilitychange'"));
  assert.ok(js.includes("window.addEventListener('focus'"));
  assert.ok(js.includes('calendarForMonth()'));
  assert.ok(js.includes("aria-pressed"));
  assert.doesNotMatch(js,/innerHTML|\bPOST\b|\bPATCH\b|\bDELETE\b|http:\/\//);
  const management=await read('church-public-updates.js');
  assert.ok(management.includes("if(result.authenticated!==true||!['owner','admin','moderator'].includes(result.role))return"));
  assert.ok(management.includes("document.querySelector('[data-church-schedule]')?.removeAttribute('hidden')"));
  assert.ok(management.includes("if(managerToken&&detail&&kind==='schedule'&&item.source==='board')"));
});

test('Shared calendar links are strictly first party and exclude protocol-relative URLs',async()=>{
  const js=await read('church-shared-schedules.js');
  const guard=js.match(/const escUrl=value=>[^\n]+/);
  assert.ok(guard);
  const check=new Function('return ('+guard[0].replace('const escUrl=','').replace(/;\s*$/,'')+');')();
  for(const uri of ['/ekodichurch/board/post/7','/ekodimission?meeting=2026-11-07#saturday'])assert.equal(check(uri),uri);
  for(const uri of ['https://evil.example','//evil.example','javascript:alert(1)','/admin','/ekodimission.evil'])assert.equal(check(uri),'');
});
