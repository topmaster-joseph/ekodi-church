import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const html=read('live/index.html'),css=read('live/live.css'),js=read('live/live.js');
test('program monitor is visually reduced to half desktop width without changing capture resolution',()=>{
  assert.match(css,/\.studio \.program-stage\{[^}]*width:50%!important/);
  assert.match(css,/\.studio \.program-screen\{[^}]*aspect-ratio:16\/9/);
  assert.match(css,/@media\(max-width:900px\)/);
  assert.match(js,/PROGRAM_WIDTH/);
});
test('pre-broadcast rehearsal stays local and does not invoke a broadcast API',()=>{
  assert.match(html,/id="rehearsalButton"/);
  assert.match(html,/id="rehearsalStopButton" disabled/);
  assert.match(html,/id="rehearsalPlayback"/);
  const local=js.match(/async function startRehearsal\(\)\{[\s\S]*?\n\}\nfunction stopRehearsal/)?.[0]||'';
  assert.ok(local,'private rehearsal handler exists');
  assert.match(local,/new MediaRecorder\(stream/);
  assert.match(local,/URL\.createObjectURL\(blob\)/);
  assert.doesNotMatch(local,/createRoom\(|startHost\(|goLive\(|api\(|publishStream\(|startManagedRecording\(/);
  assert.match(js,/if\(rehearsalRecorder\?\.state==='recording'\)/);
});
