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
  assert.match(html,/42장/);
  assert.match(html,/요약 16장/);
});

test('Never infer stale owners, old sermons, songs or live broadcast readiness',()=>{
  for(const key of ['dateAndIssueNumberAfterVerification','commonScriptureAndDailyReadings','sermonTitleAndManuscript','servicePeopleAndSongTitlesAfterConfirmation','youtubeMetadataAndActualReservationStatus'])
    assert.ok(policy.refreshEveryWeek.includes(key));
  assert.equal(policy.service.currentScripture,'신명기 33:12–19');
  assert.ok(policy.service.pending.includes('유튜브 실제 예약과 송출 실증'));
});
