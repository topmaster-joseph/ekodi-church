import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('church live viewer shows real-time interpretation subtitles instead of a permanent "준비 중"',()=>{
  const html=read('live/index.html'),js=read('live/live-captions.js'),css=read('live/live.css');
  assert.match(html,/<script src="\.\/live-captions\.js" defer><\/script>/);
  assert.match(js,/\/api\/realtime\/captions/);assert.match(js,/TENANT = 'ekodichurch'/);
  assert.match(js,/실시간 통역 자막/);assert.match(js,/live-caption-overlay/);
  assert.doesNotMatch(js,/innerHTML/,'caption text is never parsed as HTML');
  assert.match(css,/\.live-caption-overlay\{/);
});
