import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const html=read('worship/2026-10-18/index.html');
const script=read('worship/2026-10-18/worship.js');
const css=read('worship/2026-10-18/worship.css');
const page=read('calendar/index.html'),calendarJs=read('calendar/calendar.js');
const packet=JSON.parse(read('worship/2026-10-18/materials.json'));

test('The web bulletin displays the actual predecessor-format document, not a simulated summary',()=>{
 assert.match(html,/1MRDupBDrocLBZJzggqAY_mk9decuQS8eWS0Gsr37WDI\/preview/);
 assert.match(html,/original-document/);
 assert.match(html,/방송용 간략 주보 펼치기/);
 assert.equal(packet.sourceTemplate.date,'2026-10-11');
 assert.match(css,/original-document iframe/);
});
test('The web full-PPT view preserves all 42 real Slides and keeps live 16-slide mode separate',()=>{
 assert.match(html,/10-oyTzG-XZqJf3JF6iFVU40UjnCW71UzXbDUmOTKzxA\/preview/);
 assert.match(html,/view=fullppt/);
 assert.match(script,/fullppt/);
 assert.equal(packet.officialPresentationSlideCount,42);
 assert.equal(packet.slides.length,16);
 assert.match(css,/data-view=fullppt/);
 assert.match(read('index.html'),/전체 예배 PPT 42장/);
});
test('Church calendar page has public source links, role-checked edit, and visible Scripture separation',()=>{
 assert.match(page,/공통 교회력/);
 assert.match(page,/PCK|대한예수교장로회 통합/);
 assert.match(page,/2026 목회달력/);
 assert.match(calendarJs,/api\/public\/church-calendar/);
 assert.match(calendarJs,/api\/admin\/church-calendar/);
 assert.match(calendarJs,/authorization:'Bearer '/);
 assert.match(page,/본문은 EKODI 공통 성경본문을 유지/);
});
test('Weekday memorials cannot silently become approved Sunday common Scripture',()=>{
 assert.equal(packet.scripture,'신명기 33:12–19');
 assert.equal(packet.liturgicalCalendar.approval,'pastor-review-required');
 assert.match(read('church-weekly-worship.js'),/공통 교회력/);
 assert.match(read('church-weekly-worship.js'),/notice\.value/);
});
