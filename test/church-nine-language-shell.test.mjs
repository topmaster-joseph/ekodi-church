import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const extended=await readFile(new URL('../church-i18n-extended.js',import.meta.url),'utf8');
const shell=await readFile(new URL('../church-shell-i18n.js',import.meta.url),'utf8');
const canonical=[
  "['ko-KR','한국어']","['en','English']","['zh-CN','中文']","['ja','日本語']",
  "['my','မြန်မာ']","['kac','Jinghpaw']","['vi','Tiếng Việt']","['mn','Монгол']","['id','Bahasa']"
];

test('church exposes the canonical nine-language selector contract',()=>{
  for(const pair of canonical){
    assert.ok(extended.includes(pair),`extended i18n missing language option ${pair}`);
    assert.ok(shell.includes(pair),`shell control missing language option ${pair}`);
  }
  assert.match(shell,/document\.querySelector\('\[data-ekodi-language-control\]'\)/);
  assert.match(shell,/document\.createElement\('select'\)/);
  assert.match(shell,/control\.dataset\.ekodiLanguageControl='v1'/);
  assert.match(shell,/nav\.insertBefore\(control,my\|\|null\)/);
  assert.match(shell,/select\.replaceChildren\(fragment\)/);
});

test('language selector preserves a visible, reload-safe locale change path',()=>{
  assert.match(shell,/new URLSearchParams\(location\.search\)\.get\('lang'\)/);
  assert.match(shell,/select\.addEventListener\('change'/);
  assert.match(shell,/url\.searchParams\.set\('lang',next\)/);
  assert.match(shell,/location\.assign\(url\.toString\(\)\)/);
  assert.match(extended,/window\.EKODIUserLanguage\?\.getLocale/);
  assert.match(extended,/new MutationObserver\(schedule\)/);
});
