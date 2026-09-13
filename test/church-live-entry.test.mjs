import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const root=new URL('../',import.meta.url);
const read=name=>readFile(new URL(name,root),'utf8');

test('church homepage exposes canonical broadcast and participation actions',async()=>{
  const html=await read('index.html');
  assert.match(html,/data-ekodi-church-live-entry/);
  assert.match(html,/https:\/\/ekodi\.kr\/ekodichurch\/live\/\?mode=studio/);
  assert.match(html,/https:\/\/ekodi\.kr\/ekodichurch\/live\//);
  assert.match(html,/방송하기/);
  assert.match(html,/참여하기/);
});

test('church live studio keeps provider secrets server-side',async()=>{
  const [html,js]=await Promise.all([read('live/index.html'),read('live/live.js')]);
  assert.match(html,/LIVE STUDIO/);
  assert.match(html,/PPT·화면공유/);
  assert.match(html,/href="\/ekodichurch\/live\/live\.css"/);
  assert.match(html,/src="\/ekodichurch\/live\/live\.js"/);
  assert.match(js,/ekodi\.kr\/api\/realtime/);
  assert.match(js,/RTCPeerConnection/);
  assert.match(js,/getDisplayMedia/);
  assert.doesNotMatch(js,/REALTIME_SFU_APP_SECRET|Cloudflare-Calls-Secret/);
});

test('church live host action preserves studio intent across auth bootstrap',async()=>{
  const [html,intent]=await Promise.all([read('live/index.html'),read('live/host-intent.js')]);
  assert.match(html,/src="\/ekodichurch\/live\/host-intent\.js" defer/);
  assert.ok(html.indexOf('/ekodichurch/live/host-intent.js')<html.indexOf('/ekodichurch/live/live.js'));
  assert.match(intent,/stopImmediatePropagation/);
  assert.match(intent,/searchParams\.set\('mode','studio'\)/);
  assert.match(intent,/location\.replace\(next\.href\)/);
});
