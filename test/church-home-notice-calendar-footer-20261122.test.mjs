import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const read=name=>readFileSync(new URL('../'+name,import.meta.url),'utf8');
const footer=html=>(html.match(/<footer\b[\s\S]*?<\/footer>/)||[])[0]||'';

test('notice index sorts by true Sunday issue date and hides bodies',()=>{
 const js=read('church-public-updates.js');
 const fn=js.match(/  function noticePublishedDay\(post\)\{[\s\S]*?\n  \}/)?.[0];
 assert.ok(fn,'publication-date helper missing');
 const date=Function(fn+'\nreturn noticePublishedDay;')();
 assert.equal(date({title:'11월 15일 교회소식',createdAt:'2026-11-21T15:00:00Z'}),'2026-11-15');
 assert.equal(date({title:'9월 6일 교회소식',createdAt:'2026-11-21T15:00:00Z'}),'2026-09-06');
 assert.equal(date({title:'2월 30일 교회소식',createdAt:'2026-11-21T15:00:00Z'}),'2026-11-21');
 const row=js.slice(js.indexOf('  function noticeRow(post)'),js.indexOf('  function renderNotices()'));
 assert.match(row,/dateText\(noticePublishedDay\(post\)\)/);
 assert.doesNotMatch(row,/post\.body|church-public-excerpt/);
 assert.match(js,/noticePublishedDay\(b\)\.localeCompare\(noticePublishedDay\(a\)\)/);
});

test('calendar defaults to Seoul today, selects date and shows event detail',()=>{
 const home=read('index.html'),js=read('church-shared-schedules.js'),css=read('church-public-updates.css');
 for(const key of ['data-church-shared-calendar','data-church-calendar-prev','data-church-calendar-next','data-church-calendar-today','data-church-calendar-days','data-church-selected-day','data-church-schedules-list','data-church-event-detail','church-shared-calendar.css'])assert.ok(home.includes(key),key);
 assert.equal((home.match(/data-church-shared-schedules/g)||[]).length,1);
 assert.doesNotMatch(home,/data-church-upcoming-list|class="church-home-upcoming"/);
 assert.match(js,/timeZone:'Asia\/Seoul'/);
 assert.match(js,/selected=today\(\);month=selected\.slice\(0,7\)/);
 assert.match(js,/selectedEventKey=eventKey\(event\)/);
 assert.match(js,/const dayEvents=entries\.filter\(item=>item\.date===date\)/);
 assert.match(js,/published-read-only/);
 assert.doesNotMatch(js,/innerHTML|document\.write|method:\s*['"]POST/);
 assert.match(css,/\.church-public-panels \.church-shared-calendar/);
 assert.match(css,/@media\(max-width:390px\)/);
});

test('five Church public footers remove business label but keep exact name and legal facts',()=>{
 for(const path of ['index.html','devotion/index.html','notices/index.html','schedule/index.html','together/index.html']){
  const html=footer(read(path));
  assert.ok(html,path);
  assert.doesNotMatch(html,/사업자 소재지|운영주체\s*에코디교회|대표\s*정찬균/,path);
  for(const text of ['에코디교회 정찬균','전남 무안군 청계면 백련동1길 17-4, 1층','고유번호 307-82-82097','ekodichurch@gmail.com'])assert.ok(html.includes(text),path+' '+text);
 }
 assert.match(read('church-footer.css'),/church-footer-identity/);
 assert.match(read('church-life-hub-i18n.js'),/'에코디교회 정찬균'/);
 assert.doesNotMatch(read('church-life-hub-i18n.js'),/'사업자 소재지 전남 무안군/);
});
