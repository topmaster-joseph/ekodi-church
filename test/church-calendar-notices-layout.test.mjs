import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const source=path=>readFile(new URL('../'+path,import.meta.url),'utf8');

test('church homepage has one selectable calendar and no duplicate upcoming list',async()=>{
  const html=await source('index.html');
  assert.match(html,/data-church-shared-calendar/);
  assert.match(html,/data-church-schedules-list/);
  assert.match(html,/data-church-event-detail/);
  assert.doesNotMatch(html,/data-church-upcoming-list|class="church-home-upcoming"/);
  assert.doesNotMatch(html,/href="\/ekodichurch\/board\?category=schedule"/);
  assert.match(html,/href="\/ekodichurch\/schedule\/"/);
});

test('public event title is rendered under its date with published-only payload',async()=>{
  const js=await source('church-shared-schedules.js');
  const css=await source('church-shared-calendar.css');
  assert.match(js,/const dayEvents=entries\.filter\(item=>item\.date===date\)/);
  assert.match(js,/class|church-calendar-preview/);
  assert.match(js,/dayEvents\[0\]\.title/);
  assert.match(js,/data-church-event-detail/);
  assert.match(js,/data\.mode!=='published-read-only'/);
  assert.match(css,/\.church-calendar-preview/);
  assert.match(css,/text-overflow:ellipsis/);
});

test('notice and schedule pages share church shell, footer and visit instrumentation',async()=>{
  const shell=await source('church-shell.js');
  assert.match(shell,/mountNativeVisitSummary\(\)/);
  assert.match(shell,/native-visit-beacon\.js/);
  assert.match(shell,/user-ui-footer\.js/);
  assert.match(shell,/querySelector\('script\[src\*="/shell\/user-ui-footer\.js"\]'\)/);
  for(const route of ['notices/index.html','schedule/index.html']){
    const html=await source(route);
    assert.match(html,/class="site-header/);
    assert.match(html,/data-ekodi-service-footer/);
    assert.match(html,/church-shell\.js/);
    assert.match(html,/church-account-header\.js/);
    assert.doesNotMatch(html,/사업자 소재지|운영주체/);
  }
  const schedule=await source('schedule/index.html');
  assert.doesNotMatch(schedule,/href="\/ekodichurch\/board\?category=schedule"/);
});
