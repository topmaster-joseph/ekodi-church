import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const core=await readFile(new URL('../church-i18n.js',import.meta.url),'utf8');
const extended=await readFile(new URL('../church-i18n-extended.js',import.meta.url),'utf8');
const shell=await readFile(new URL('../church-shell-i18n.js',import.meta.url),'utf8');

test('core church i18n honors supported ?lang= values and delegates extended locales',()=>{
  assert.match(core,/new URLSearchParams\(location\.search\)\.get\('lang'\)/);
  assert.match(core,/DELEGATED_URL_LOCALES/);
  assert.match(core,/if\(delegatedUrlLocale\(\)\)return;applyDocument/);
  assert.match(core,/requested&&SUPPORTED\.has\(requested\)/);
  assert.match(core,/세상에서 구별된 에클레시아, 하나님과 하나된 코이노니아, 세상 속에 증인된 디아스포라/);
});

test('extended church i18n owns extended ?lang= values during initial render',()=>{
  assert.match(extended,/new URLSearchParams\(location\.search\)\.get\('lang'\)/);
  assert.match(extended,/if\(NEW\.has\(requested\)\)return requested/);
  assert.match(extended,/if\(NEW\.has\(shared\)\)desired=shared;apply\(desired\)/);
  assert.match(extended,/add\('전체 소셜채널 ↗'/);
});

test('language selector is created synchronously before async shell scheduling',()=>{
  assert.match(shell,/ensureLanguageControl\(\);\nwindow\.addEventListener\('ekodi:locale-change'/);
});
