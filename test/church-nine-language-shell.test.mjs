import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const source=await readFile(new URL('../church-i18n-extended.js',import.meta.url),'utf8');

test('church projects its canonical nine-language set into the shared selector',()=>{
  for(const pair of [
    "['ko-KR','한국어']","['en','English']","['zh-CN','中文']","['ja','日本語']",
    "['my','မြန်မာ']","['kac','Jinghpaw']","['vi','Tiếng Việt']","['mn','Монгол']","['id','Bahasa']"
  ]) assert.ok(source.includes(pair),`missing language option ${pair}`);
  assert.match(source,/select\.replaceChildren\(fragment\)/);
  assert.match(source,/window\.EKODIUserLanguage\?\.getLocale/);
  assert.match(source,/new MutationObserver\(schedule\)/);
});
