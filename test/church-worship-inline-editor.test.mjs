import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const data=read('worship/bulletin-data.js'),editor=read('worship/bulletin-editor.js'),gate=read('worship/review-gate.js');

test('song titles from the DB appear in the bulletin order (titles only)',()=>{
  assert.match(data,/select=bulletin,photo_url,songs/);
  const src=data.match(/function parseSongs\(text\) \{[\s\S]*?\n  \}\n/)[0];
  const parseSongs=new Function(src+'return parseSongs;')();
  const s=parseSongs('경배찬양: 주의 이름 높이며, 내 영혼이 은총 입어\n헌신: 나의 왕 앞에서\n결단찬양 : 부르신 곳에서\n그 밖의 곡');
  assert.equal(s['경배찬양'],'주의 이름 높이며, 내 영혼이 은총 입어');
  assert.equal(s['헌신찬양'],'나의 왕 앞에서');
  assert.equal(s['결단찬양'],'부르신 곳에서');
  assert.deepEqual(s['기타'],['그 밖의 곡']);
  assert.match(data,/renderSongs\(songs\)/);
  assert.match(data,/window\.EkodiBulletinData = \{ date, render, load, parseSongs/);
});

test('extra images render on their own sheet and only from approved hosts',()=>{
  assert.match(data,/data-b-sheet|dataset\.bSheet = 'images'/);
  assert.match(data,/const ALLOWED_IMAGE = \/\^https:\\\/\\\/\(renzehysxirjilvdxacv/);
  assert.match(data,/filter\(i => i && ALLOWED_IMAGE\.test/);
  assert.match(data,/const allowed = ALLOWED_IMAGE;/,'photo slot uses the same allow-list');
  assert.match(data,/class="bp-now"/,'saved committee keeps this Sunday highlighted');
});

test('the in-page editor loads only for reviewers on an unpublished bulletin view',()=>{
  assert.match(gate,/bar\.append\(label, button, back\);\n    document\.body\.prepend\(bar\);\n    openEditor\(key\);/);
  assert.match(gate,/if \(view !== 'bulletin' \|\| !document\.querySelector\('\[data-bulletin-date\]'\)\) return;/);
  assert.match(gate,/\/ekodichurch\/worship\/bulletin-editor\.js\?v=/);
  // Published pages never call reviewBar/openEditor.
  assert.match(gate,/if \(isPublic\) \{ reveal\(\); return; \}/);
});

test('the editor saves drafts without publishing, keeps the photo slot and never uploads scores',()=>{
  new Function(editor);
  assert.doesNotMatch(editor,/is_published:\s*true/);
  assert.match(editor,/is_published: false/);
  assert.match(editor,/\{ \.\.\.current\.bulletin, \.\.\.fromPage\(\), images \}/,'photoMode/photoCaption are preserved');
  assert.match(editor,/storage\/v1\/object\/church-bulletin\/\$\{path\}/);
  assert.match(editor,/const MAX_IMAGES = 6;/);
  assert.match(editor,/악보는 저작권 때문에 웹에 올리지 않고 Google PPT에만/);
  assert.match(editor,/service_date=eq\.' \+ date/);
  assert.doesNotMatch(editor,/streamKey|stream_key|rtmp/i);
});
