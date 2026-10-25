import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const read=path=>readFile(new URL('../'+path,import.meta.url),'utf8');

test('church member dashboard preserves local navigation, original auth, and capability gate',async()=>{
  const [html,css,app,gate]=await Promise.all([
    read('my/index.html'),read('my/dashboard.css'),read('my/app.js'),read('my/presence-admin-link.js')
  ]);
  assert.match(html,/class="topbar"/);
  assert.match(html,/class="hero"/);
  assert.match(html,/class="quick-grid"/);
  assert.match(html,/class="mobile-dock"/);
  assert.match(html,/href="\.\/dashboard\.css"/);
  assert.match(html,/id="memberState"/);
  assert.match(html,/id="loginAction"/);
  assert.match(html,/https:\/\/ekodi\.kr\/auth\/\?site=church/);
  assert.match(html,/id="presenceAdminLink"[^>]*hidden/);
  assert.match(gate,/response\.ok/);
  assert.match(gate,/link\.hidden=true/);
  assert.match(app,/storedSession\(\)/);
  assert.doesNotMatch(html,/service_role|SUPABASE_SERVICE_ROLE_KEY|church_members|church_staff/);
  assert.doesNotMatch(html,/href="\/my\/"/);
  for(const path of ['/#worship','/#life-hub','/#community','/live/','/my/giving/','/my/attendance/']) {
    assert.ok(html.includes('/ekodichurch'+path),path+' missing');
  }
  assert.match(css,/@media\(max-width:600px\)/);
  assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
  assert.match(css,/focus-visible/);
  assert.match(css,/grid-template-columns:repeat\(4,minmax\(0,1fr\)\)/);
});

test('member dashboard has seven cards, photo fallbacks, and no fabricated statistics',async()=>{
  const [html,css,i18n]=await Promise.all([
    read('my/index.html'),read('my/dashboard.css'),read('my/language.js')
  ]);
  assert.equal((html.match(/class="card card--/g)||[]).length,7);
  assert.equal((html.match(/class="card card--presence"/g)||[]).length,1);
  assert.equal((html.match(/class="mobile-dock"/g)||[]).length,1);
  assert.match(css,/background-image:linear-gradient/);
  assert.match(css,/images\.unsplash\.com/);
  assert.doesNotMatch(html,/출석률 100%|이번 달 헌금|방송 중/);
  for(const label of ['마이페이지','나의 출결','현장 출결 관리']){
    assert.ok(i18n.includes("'"+label+"':"),label+' lacks locale mapping');
  }
});
