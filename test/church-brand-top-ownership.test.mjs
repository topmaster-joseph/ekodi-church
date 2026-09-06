import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const source=await readFile(new URL('../church-header-controls.js',import.meta.url),'utf8');

test('church restores local top-link after shared header reconciliation',()=>{
  assert.match(source,/brand\.setAttribute\('href','#top'\)/);
  assert.match(source,/attributeFilter:\['aria-pressed','href'\]/);
  assert.match(source,/window\.scrollTo\(\{top:0,left:0,behavior\}\)/);
});
