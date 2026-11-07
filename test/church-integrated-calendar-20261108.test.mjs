import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const read = file => readFile(new URL('../'+file,import.meta.url),'utf8');

test('unified Church calendar preserves all six primary destinations and original site-managed board',async()=>{
  const page=await read('schedule/index.html');
  const nav=page.match(/<nav id="main-nav"[\s\S]*?<\/nav>/)?.[0]||'';
  for(const label of ['매일묵상','예배·방송','공지사항','주요일정','함께하기','마이페이지'])
    assert.ok(nav.includes('>'+label+'</a>'),label);
  assert.equal((nav.match(/<a\b/g)||[]).length,6);
  assert.match(page,/church-compact-navigation\.css/);
  assert.match(page,/church-shell\.js/);
  assert.match(page,/church-public-updates\.js/);
  assert.match(page,/data-church-public-manage hidden/);
  assert.match(page,/data-church-schedule data-limit="100"/);
  assert.match(page,/<details class="church-schedule-archive">/);
  assert.match(page,/data-church-shared-calendar/);
  assert.match(page,/data-church-calendar-days/);
  assert.match(page,/data-church-upcoming-list/);
  assert.match(page,/church-shared-schedules\.js/);
  assert.match(page,/data-ekodi-service-footer/);
});

test('home retains compact panels, the retired verse, Saturday 17:00 and new read-only source badges',async()=>{
  const [page,js,css]=await Promise.all([read('index.html'),read('church-shared-schedules.js'),read('church-shared-calendar.css')]);
  assert.match(page,/church-shared-calendar\.css/);
  assert.match(page,/data-church-shared-schedules data-limit="3"/);
  assert.doesNotMatch(page,/church-daily-verse\.js|class="daily-verse"/);
  assert.match(page,/토요모임<\/span><strong>매주 토요일 오후 5시/);
  assert.match(js,/published-read-only/);
  assert.match(js,/const origin=item=>item\.source==='ekodichurch'\?'교회 일정':'선교회 일정'/);
  assert.match(js,/calendarForMonth\(\)/);
  assert.doesNotMatch(js,/\bPOST\b|\bPATCH\b|\bDELETE\b|innerHTML/);
  assert.doesNotMatch(css,/\.church-schedule-page \.site-header/);
  assert.match(css,/grid-template-columns:repeat\(7,minmax\(0,1fr\)\)/);
});
