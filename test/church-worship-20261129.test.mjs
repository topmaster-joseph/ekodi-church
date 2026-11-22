import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const get=p=>readFileSync(new URL('../worship/2026-11-29/'+p,import.meta.url),'utf8');
const html=get('index.html'),js=get('worship.js'),packet=JSON.parse(get('materials.json'));
const registry='고린도전서 15:1–11';

test('November 29 draft uses the approved EKODI common reading (1 Cor 15:1–11) and marks unregistered December days',()=>{
  const common=JSON.parse(readFileSync(new URL('../worship/2026-11-29/materials.json',import.meta.url),'utf8'));
  assert.equal(packet.date,'2026-11-29');assert.equal(packet.scripture,registry);
  assert.equal(packet.title,'내가 받은 복음을 전하다');assert.equal(packet.stage,'draft');assert.equal(packet.broadcastSafe,true);
  assert.equal(packet.occasion,'대림절 첫째 주일');
  assert.equal(packet.devotion.length,7);assert.deepEqual(packet.devotion[0],['11/29',registry]);assert.deepEqual(packet.devotion[1],['11/30','고린도전서 15:12–22']);assert.deepEqual(packet.devotion[6],['12/05','확인필요']);
  assert.equal(packet.lectionary.status,'needs-verification');assert.equal(common.lectionary.readings.length,4);
  assert.match(html,/고린도전서 15:1–11/);assert.doesNotMatch(html,/고린도전서 12:1–11|공동의 유익을 위한 은사|2026-11-22|추수감사/);
  assert.doesNotMatch(get('prayer/index.html'),/2026-11-22/);
});

test('Twenty-eight 16:9 text slides, score pages withheld, isolated presenter channel',()=>{
  assert.equal(packet.slides.length,28);assert.equal((js.match(/"title":/g)||[]).length,28);
  assert.ok(packet.slides.every(s=>!s.image&&s.title&&Array.isArray(s.lines)));
  assert.deepEqual(packet.slideSource.omittedPages,[3,4,5,6,7,8,11,12,16,20,32,35,36]);
  assert.equal(packet.slideSource.sourcePages,46);assert.equal(packet.slideSource.publishedPages,33);
  assert.equal(packet.slides[7].lines[0],registry);assert.equal(packet.slides[20].title,'이번 주 매일묵상 · 11/29–12/05');
  assert.equal(packet.slides[9].title,'내가 받은 복음을\n전하다');assert.deepEqual(packet.slides[9].lines,['2026.11.29 · 고린도전서 15:1–11']);
  assert.match(js,/ekodi-church-worship-20261129/);assert.match(js,/ekodi:church:worship:2026-11-29:slide/);assert.doesNotMatch(js,/20261122|2026-11-22|\(초안\)/);
  assert.match(js,/en:'Passing On the Gospel I Received\.'/);
  assert.equal(packet.slides[21].lines[0],'오늘은 대림절 첫째 주일 · 교회력의 새해가 시작됩니다');
  assert.equal(packet.youtube.status,'metadata-prepared-not-scheduled');assert.match(packet.youtube.title,/2026\.11\.29/);
  assert.doesNotMatch(JSON.stringify(packet),/streamKey|stream_key|rtmp|검토본|최종 확인 필요/i);
  assert.deepEqual(Object.fromEntries(Object.entries(packet.sources).map(([k,v])=>[k,v.title])),{bulletin:'261129에코디주보',slides:'261129에코디PPT',sermon:'261129에코디설교'});
  for(const v of Object.values(packet.sources)){assert.match(v.url,/^https:\/\/docs\.google\.com\/(?:document|presentation)\/d\/[A-Za-z0-9_-]+\/edit$/);assert.ok(v.url.includes(v.fileId));}
  assert.doesNotMatch(JSON.stringify(packet.sources),/1NQHfvBgyp1uNKK0|1nhm6YxkQrTB3NZe|1k-vcBJrKHmJ0PvQ|1hMLjMM2x_00h6Cp/,'new week links new Google file IDs, not last week\'s');
  new Function(js);
});

test('Online bulletin keeps the two-sheet shape, new issue number and no private items',()=>{
  assert.equal((html.match(/class="bp-sheet"/g)||[]).length,2);
  for(const part of ['This Week’s Scripture for Meditation and Sharing · 11/29–12/05','Community Announce','Community Confession','Those who serve','[Community Sunday Worship Service]','[Worship committee]','[Sponsor or Cooperation(ABC)]','[Application question]','발행 26.11.29(48)','<th class="bp-now">11/29</th>','<td>고전 15:1-11</td>','Scripture Reading: 고린도전서 15:1–11','Sermon - 내가 받은 복음을 전하다'])assert.ok(html.includes(part),part);
  assert.doesNotMatch(html,/임진명/,'personal recovery prayer stays off the public web');
  assert.doesNotMatch(html,/핑크뮬리|국화축제/,'group photo stays off the public web');
  assert.doesNotMatch(html,/양동제일교회|임직예배|추수감사주일/,'last week\'s notices are not carried over');
  assert.match(html,/\/live\/church\/\?mode=studio&amp;activity=sunday&amp;date=2026-11-29/);
  for(const b of ['week','announce','photo','serve','stats','committee','sponsors','questions'])assert.match(html,new RegExp(`data-b="${b}"`),b);
  assert.match(html,/bulletin-data\.js\?v=\w+" data-date="2026-11-29"/);
  const sermon=get('sermon/index.html');
  assert.match(sermon,/<h1>261129 \| 에코디교회 주일모임 말씀나눔<\/h1>/);
  assert.match(sermon,/첫째 \| 받은 복음 위에 서다/);assert.match(sermon,/마침기도/);
  assert.match(sermon,/확인필요/,'unverified lectionary is marked, not guessed');
  assert.doesNotMatch(sermon,/예배 전 확인|최종 확인 필요|\(초안\)|스트림 키/,'internal checklist is not published');
});

test('Homepage, live viewer and weekly index point to November 29 (prepared, behind the review gate)',()=>{
  const home=readFileSync(new URL('../index.html',import.meta.url),'utf8');
  assert.match(home,/data-weekly-bulletin href="\/ekodichurch\/worship\/2026-11-29\/"/);assert.match(home,/date=2026-11-29/);
  const live=readFileSync(new URL('../live/index.html',import.meta.url),'utf8');assert.match(live,/id="viewerBulletinLink" href="\/ekodichurch\/worship\/2026-11-29\/"/);
  const weekly=JSON.parse(readFileSync(new URL('../worship/weekly.json',import.meta.url),'utf8'));
  assert.equal(weekly.services.at(-1).date,'2026-11-29');assert.equal(weekly.services.at(-1).status,'prepared');
  assert.equal(weekly.services.filter(s=>s.status==='prepared').length,1);
  for(const [p,rel] of [['index.html','../review-gate.js'],['sermon/index.html','../../review-gate.js'],['prayer/index.html','../../review-gate.js']])
    assert.ok(get(p).includes(`<script src="${rel}" data-date="2026-11-29"></script>`),p);
});
