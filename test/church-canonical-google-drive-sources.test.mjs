import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const file=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const data=JSON.parse(file('worship/google-drive-public-sources.json'));
const home=file('index.html');
const frontend=file('church-google-drive-live.js');
test('Sunday public sources are exactly the user-nominated Google originals, not duplicated HTML',()=>{
 assert.equal(data.schema,'ekodi.church.worship.canonical-google-drive.v1');
 assert.equal(data.services[0].date,'2026-10-18');
 assert.equal(data.services[0].bulletin.id,'1MRDupBDrocLBZJzggqAY_mk9decuQS8eWS0Gsr37WDI');
 assert.equal(data.services[0].presentation.id,'10-oyTzG-XZqJf3JF6iFVU40UjnCW71UzXbDUmOTKzxA');
 assert.equal(data.services[0].presentation.slidesVerified,36);
 assert.equal(data.services[0].previousSunday,'2026-10-11');
 assert.equal(Object.hasOwn(data.services[0],'sermon'),false);
});
test('Homepage keeps exact layout in native Google preview frames and source edit links',()=>{
 assert.match(home,/data-drive-bulletin/);
 assert.match(home,/data-drive-presentation/);
 assert.match(home,/data-drive-bulletin-edit/);
 assert.match(home,/data-drive-presentation-edit/);
 assert.match(home,/church-google-drive-live\.js/);
 assert.match(frontend,/\.src=preview\(format,sid\)/);
 assert.match(frontend,/60_000/);
 assert.match(frontend,/ekodi:weekly-service-selected/);
 assert.doesNotMatch(frontend,/15WKmDyYo7lfB3UwBze_dgPb2c0K0Lw8BePWiL-sByKY/);
 const headers=file('_headers');
 assert.match(headers,/frame-src [^\n]*https:\/\/docs\.google\.com/);
});
test('Do not falsely claim that editing homepage fields writes to Google Docs',()=>{
 assert.match(home,/수정 버튼은 실제 Google Docs\/Slides 원본 편집기로 이동/);
 assert.doesNotMatch(frontend,/batchUpdate|googleapis\.com\/docs\/v1\/documents/);
});
