import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');

test('main #150 congregational notice survives the #149 menu integration',()=>{
 const bulletin=read('worship/2026-11-08/index.html');
 const slides=JSON.parse(read('worship/2026-11-08/materials.json'));
 const client=read('worship/2026-11-08/worship.js');
 assert.match(bulletin,/11월 15일\(주일\) 주일모임 후 공동의회/);
 assert.match(bulletin,/2025년 결산/);
 assert.match(client,/11\/15\(주일\) 주일모임 후 공동의회/);
 assert.match(JSON.stringify(slides),/11\/15\(주일\) 주일모임 후 공동의회/);
 assert.match(read('index.html'),/href="\/ekodichurch\/notices\/"/);
 assert.match(read('index.html'),/href="\/ekodichurch\/schedule\/"/);
 assert.match(read('church-shared-schedules.js'),/\/ekodichurch\/board\/api\/shared-schedules/);
});
