import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const get=p=>readFileSync(new URL('../worship/2026-10-25/'+p,import.meta.url),'utf8');
const html=get('index.html'),js=get('worship.js'),packet=JSON.parse(get('materials.json'));
test('October 25 Sunday uses the EKODI common reading and is independent of earlier weeks',()=>{
  assert.equal(packet.date,'2026-10-25');assert.equal(packet.scripture,'오바댜 1:10–16');assert.equal(packet.title,'멀리 서 있던 날');
  assert.equal(packet.devotion.length,7);assert.deepEqual(packet.devotion[0],['10/25','오바댜 1:10–16']);assert.deepEqual(packet.devotion[6],['10/31','고린도전서 2:6–16']);
  assert.match(html,/오바댜 1:10–16/);assert.doesNotMatch(html,/2026-10-18|신명기/);
  assert.doesNotMatch(get('prayer/index.html'),/2026-10-18/);
});
test('Sixteen slides, isolated presenter channel, YouTube metadata not claimed as scheduled',()=>{
  assert.equal(packet.slides.length,16);assert.equal((js.match(/"title":/g)||[]).length,16);
  assert.match(js,/ekodi-church-worship-20261025/);assert.match(js,/ekodi:church:worship:2026-10-25:slide/);assert.doesNotMatch(js,/20261018|2026-10-18/);
  assert.equal(packet.youtube.status,'metadata-prepared-not-scheduled');assert.match(packet.youtube.title,/2026\.10\.25/);
  assert.doesNotMatch(JSON.stringify(packet),/streamKey|stream_key|rtmp/i);
});
test('Operator view carries the multilingual caption run-sheet and links to EKODI Live',()=>{
  assert.equal(packet.interpretation.captions,true);assert.deepEqual(packet.interpretation.targetLangs,['en','zh','ja','vi','mn']);
  assert.match(html,/동시통역 자막 \(오늘부터\)/);assert.match(html,/통역 자막 시작/);assert.match(html,/\/live\/church\/\?mode=studio&amp;activity=sunday&amp;date=2026-10-25/);
});
test('Homepage, live viewer and weekly index point to October 25',()=>{
  const home=readFileSync(new URL('../index.html',import.meta.url),'utf8');
  assert.match(home,/data-weekly-bulletin href="\/ekodichurch\/worship\/2026-10-25\/"/);assert.match(home,/date=2026-10-25/);
  const live=readFileSync(new URL('../live/index.html',import.meta.url),'utf8');assert.match(live,/id="viewerBulletinLink" href="\/ekodichurch\/worship\/2026-10-25\/"/);
  const weekly=JSON.parse(readFileSync(new URL('../worship/weekly.json',import.meta.url),'utf8'));
  assert.equal(weekly.services.at(-1).date,'2026-10-25');assert.equal(weekly.services.at(-1).status,'prepared');
});
