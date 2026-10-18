import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const read = path => readFileSync(new URL('../'+path, import.meta.url),'utf8');
const policy=JSON.parse(read('worship/weekly-source-policy.json'));
const html=read('worship/2026-10-18/index.html');

test('The default template is the actually published prior Sunday, exactly one week earlier',()=>{
  assert.equal(policy.schema,'ekodi.church.worship.previous-week-source.v1');
  assert.equal(policy.previousSundayOffsetDays,7);
  const ms=Date.parse(policy.service.date+'T00:00:00Z')-Date.parse(policy.service.previousSunday+'T00:00:00Z');
  assert.equal(ms,7*24*60*60*1000);
  assert.ok(policy.sourcePreference.includes('verified-published-previous-week-bulletin'));
  assert.ok(policy.sourcePreference.includes('verified-presented-previous-week-presentation'));
});

test('The public source links resolve to the new previous-week-based files',()=>{
  assert.ok(html.includes(policy.service.finalBulletin));
  assert.ok(html.includes(policy.service.finalPresentation));
  assert.ok(!html.includes('docs.google.com/document/d/1JBhESagh3lFaP_YCwkabb_pI7gRk70RMdKdrrsAg6-I/edit'));
  assert.ok(!html.includes('docs.google.com/presentation/d/1ni6n5nnIu5jgxVizvrwFg0Ej9tzZ4hG6RSJ5_MRI3mI/edit'));
  assert.match(html,/38장/);
  assert.match(html,/요약 16장/);
});

test('Never infer stale owners, old sermons, songs or live broadcast readiness',()=>{
  for(const key of ['dateAndIssueNumberAfterVerification','commonScriptureAndDailyReadings','sermonTitleAndManuscript','servicePeopleAndSongTitlesAfterConfirmation','youtubeMetadataAndActualReservationStatus'])
    assert.ok(policy.refreshEveryWeek.includes(key));
  assert.equal(policy.service.currentScripture,'신명기 33:12–19');
  assert.ok(policy.service.pending.includes('유튜브 실제 예약과 송출 실증'));
});

test('Each new prepared Sunday retains provenance to the immediately previous service',()=>{
  const index=JSON.parse(read('worship/weekly.json'));
  const services=[...index.services].sort((a,b)=>a.date.localeCompare(b.date));
  assert.ok(services.length>=2);
  for(let i=1;i<services.length;i++){
    const item=services[i];
    if(item.status==='archived')continue;
    const expected=new Date(Date.parse(item.date+'T00:00:00Z')-7*24*60*60*1000).toISOString().slice(0,10);
    assert.equal(item.previousSunday,expected,item.date+' requires a verified previous Sunday');
    assert.equal(item.templateRule,'verified-previous-week-bulletin-and-full-presentation');
    assert.ok(services.some(source=>source.date===expected),'previous Sunday must exist in weekly index');
  }
});
