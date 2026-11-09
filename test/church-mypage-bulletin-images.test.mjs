import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');

test('My Page bulletin save keeps images added in the in-page editor',()=>{
  const my=read('mypage/app.js');
  assert.match(my,/beImages=Array\.isArray\(b\.images\)\?b\.images:\[\];/);
  assert.match(my,/bulletin\.images=beImages;/);
  assert.match(read('mypage/index.html'),/경배찬양: 곡명/);
});
