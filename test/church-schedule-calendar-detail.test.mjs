import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const read=name=>readFileSync(new URL('../'+name,import.meta.url),'utf8');
const html=read('schedule/index.html');
const css=read('church-shared-calendar.css');
const js=read('church-shared-schedules.js');

test('Church main schedule presents calendar then selected-day list then event details',()=>{
  const cal=html.indexOf('data-church-shared-calendar');
  const day=html.indexOf('data-church-selected-day');
  const list=html.indexOf('data-church-schedules-list');
  const detail=html.indexOf('data-church-event-detail');
  assert.ok(cal>0&&cal<day&&day<list&&list<detail,'calendar-day-list-detail must be in visual DOM order');
  assert.match(html,/data-church-event-detail[^>]*id="church-schedule-event-detail"[^>]*hidden/);
  assert.match(html,/data-church-public-manage hidden/);
  assert.match(css,/\.church-schedule-page \.church-schedule-shell\s*\{[^}]*grid-template-columns:minmax\(0,1fr\)!important/s);
  assert.match(css,/\.church-schedule-event-detail\[hidden\]\{display:none!important\}/);
  assert.match(css,/@media\(max-width:480px\)/);
});

test('KST today is the default, selecting a day updates only that day list and resets details',()=>{
  assert.match(js,/let entries=\[\],month=today\(\)\.slice\(0,7\),selected=today\(\)/);
  assert.match(js,/button\.dataset\.date=date/);
  assert.match(js,/button\.setAttribute\('aria-pressed',String\(date===selected\)\)/);
  assert.match(js,/button\.addEventListener\('click',\(\)=>\{\s*selected=date;\s*clearEventDetail\(\)/s);
  assert.match(js,/selected=today\(\);month=selected\.slice\(0,7\);\s*clearEventDetail\(\)/s);
  assert.match(js,/button\.setAttribute\('aria-controls','church-schedule-event-detail'\)/);
  assert.match(js,/button\.setAttribute\('aria-expanded',String\(eventKey\(event\)===selectedEventKey\)\)/);
  assert.match(js,/void showEventDetail\(event\)/);
  assert.match(js,/date===selected/);
});

test('event details render only published data and same-origin authorized public GET; no writes or arbitrary HTML',()=>{
  assert.match(js,/safePublicPostApi/);
  assert.match(js,/^.*match\(\/\^\\\/\(ekodichurch\|ekodimission\)\\\/board\\\/post\\\//m);
  assert.match(js,/method:'GET',credentials:'same-origin',cache:'no-store'/);
  assert.match(js,/description\.textContent=/);
  assert.match(js,/eventDetail\.append\(facts\)/);
  assert.match(js,/original\.href=linked/);
  assert.match(js,/token!==detailRequest/);
  assert.match(js,/item\.source==='ekodichurch'\?'교회 일정':'선교회 일정'/);
  assert.doesNotMatch(js,/innerHTML\s*=|eval\(|new Function\(/);
  assert.doesNotMatch(js,/method:'(?:POST|PATCH|DELETE)'/);
});

test('only Church authorized editors receive CRUD; published calendar remains read-only',()=>{
  const manager=read('church-public-updates.js');
  assert.match(manager,/if\(kind==='schedule'\)/);
  assert.match(manager,/data-church-schedule/);
  assert.match(manager,/managerToken/);
  assert.match(manager,/owner','admin','moderator'/);
  assert.match(html,/href="\/ekodichurch\/board\?category=schedule"/);
  assert.match(js,/published-read-only/);
});
