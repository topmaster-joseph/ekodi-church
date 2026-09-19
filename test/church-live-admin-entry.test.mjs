import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const root=new URL('../',import.meta.url);
const read=name=>readFile(new URL(name,root),'utf8');

test('dedicated Church /live/admin uses the shared tenant recording manager',async()=>{
  const html=await read('live/admin/index.html');
  assert.match(html,/data-tenant="ekodichurch"/);
  assert.match(html,/data-auth-site="church"/);
  assert.match(html,/방송 · 녹화 관리/);
  assert.match(html,/id="recordingList"/);
  assert.match(html,/id="broadcastList"/);
  assert.match(html,/href="\/tenant-live-admin\.css"/);
  assert.match(html,/src="\/tenant-live-admin\.js"/);
  assert.match(html,/href="\/ekodichurch\/admin"/);
  assert.match(html,/href="\/ekodichurch\/live\/\?mode=studio"/);
  assert.doesNotMatch(html,/언어선택|language selector/i);
});
