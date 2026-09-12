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
  assert.match(js,/api\.ekodi\.kr\/api\/realtime/);
  assert.match(js,/RTCPeerConnection/);
  assert.match(js,/getDisplayMedia/);
  assert.doesNotMatch(js,/REALTIME_SFU_APP_SECRET|Cloudflare-Calls-Secret/);
});
