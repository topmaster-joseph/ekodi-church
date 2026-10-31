import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const get=p=>readFileSync(new URL('../worship/2026-11-01/'+p,import.meta.url),'utf8');
const html=get('index.html'),js=get('worship.js'),packet=JSON.parse(get('materials.json'));

test('November 1 uses the approved EKODI common reading and the final sermon title',()=>{
  assert.equal(packet.date,'2026-11-01');assert.equal(packet.scripture,'고린도전서 3:1–9');
  assert.equal(packet.title,'자라게 하시는 하나님 앞에서');assert.equal(packet.stage,'final');assert.equal(packet.broadcastSafe,true);
  assert.equal(packet.devotion.length,7);assert.deepEqual(packet.devotion[0],['11/01','고린도전서 3:1–9']);assert.deepEqual(packet.devotion[6],['11/07','고린도전서 6:12–20']);
  assert.match(html,/고린도전서 3:1–9/);assert.doesNotMatch(html,/오바댜|깨어진 형제애|2026-10-25/);
  assert.doesNotMatch(get('prayer/index.html'),/2026-10-25/);
});

test('Thirty 16:9 text slides, score pages withheld, isolated presenter channel',()=>{
  assert.equal(packet.slides.length,30);assert.equal((js.match(/"title":/g)||[]).length,30);
  assert.ok(packet.slides.every(s=>!s.image&&s.title&&Array.isArray(s.lines)));
  assert.deepEqual(packet.slideSource.omittedPages,[6,7,8,9,10,13]);
  assert.match(js,/ekodi-church-worship-20261101/);assert.match(js,/ekodi:church:worship:2026-11-01:slide/);assert.doesNotMatch(js,/20261025|2026-10-25/);
  assert.equal(packet.youtube.status,'metadata-prepared-not-scheduled');assert.match(packet.youtube.title,/2026\.11\.01/);
  assert.doesNotMatch(JSON.stringify(packet),/streamKey|stream_key|rtmp|검토본|최종 확인 필요/i);
  new Function(js);
});

test('Online bulletin keeps the three-sheet Google Docs shape without private items',()=>{
  assert.equal((html.match(/class="bp-sheet"/g)||[]).length,3);
  for(const part of ['This Week’s Scripture for Meditation and Sharing · 11/01–11/07','Community Announce','Community Confession','Those who serve','[Community Sunday Worship Service]','[Worship committee]','[Sponsor or Cooperation(ABC)]','[Application question]','발행 26.11.01(44)'])assert.ok(html.includes(part),part);
  assert.doesNotMatch(html,/임진명/,'personal recovery prayer stays off the public web');
  assert.doesNotMatch(html,/핑크뮬리/,'group photo stays off the public web');
  assert.match(html,/\/live\/church\/\?mode=studio&amp;activity=sunday&amp;date=2026-11-01/);
  const sermon=get('sermon/index.html');
  assert.match(sermon,/<h1>261101 \| 에코디교회 주일모임 말씀나눔<\/h1>/);
  assert.match(sermon,/첫째 \| 시기와 다툼은 자라지 못한 신앙의 표시입니다/);assert.match(sermon,/마침기도/);
  assert.doesNotMatch(sermon,/예배 전 확인|최종 확인 필요|\(초안\)/,'internal checklist is not published');
});

test('Homepage, live viewer and weekly index point to November 1',()=>{
  const home=readFileSync(new URL('../index.html',import.meta.url),'utf8');
  assert.match(home,/data-weekly-bulletin href="\/ekodichurch\/worship\/2026-11-01\/"/);assert.match(home,/date=2026-11-01/);
  const live=readFileSync(new URL('../live/index.html',import.meta.url),'utf8');assert.match(live,/id="viewerBulletinLink" href="\/ekodichurch\/worship\/2026-11-01\/"/);
  const weekly=JSON.parse(readFileSync(new URL('../worship/weekly.json',import.meta.url),'utf8'));
  assert.equal(weekly.services.at(-1).date,'2026-11-01');assert.equal(weekly.services.at(-1).status,'prepared');
});

test('Merged worship pages stay behind the final-review gate until published',()=>{
  const gate=readFileSync(new URL('../worship/review-gate.js',import.meta.url),'utf8');
  for(const [p,rel] of [['index.html','../review-gate.js'],['sermon/index.html','../../review-gate.js'],['prayer/index.html','../../review-gate.js']])
    assert.ok(get(p).includes(`<script src="${rel}" data-date="2026-11-01"></script>`),p);
  assert.match(gate,/is_published=eq\.true/);assert.match(gate,/최종 검토 완료 · 공개하기/);
  assert.match(gate,/catch \{ reveal\(\); return; \}/,'an outage never hides Sunday materials');
  assert.doesNotMatch(gate,/service_role|stream_?key/i);
  const my=readFileSync(new URL('../mypage/app.js',import.meta.url),'utf8');
  assert.match(my,/async function loadReviews\(\)/);assert.match(my,/update\(\{is_published:publish/);
  const home=readFileSync(new URL('../church-weekly-worship.js',import.meta.url),'utf8');
  assert.match(home,/예배자료 최종 검토 중/);
  new Function(gate);
});

test('Worship console signs in without third-party scripts (same-origin CSP)',()=>{
  const my=readFileSync(new URL('../mypage/app.js',import.meta.url),'utf8');
  assert.doesNotMatch(my,/cdn\.jsdelivr|import\(/,'CSP script-src self blocks CDN imports');
  assert.match(my,/auth\/v1\//);assert.match(my,/rpc\/current_site_access/);assert.match(my,/loadReviews\(\)/);
  new Function(my.replace(/^void ensureAuth\(\);$/m,''));
});
