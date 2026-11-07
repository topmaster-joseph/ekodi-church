import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = file => readFile(new URL('../' + file, import.meta.url), 'utf8');

test('Church public Saturday fallback uses the approved 17:00 gathering time', async () => {
  const html = await read('index.html');
  assert.match(html, /<span>토요모임<\/span><strong>매주 토요일 오후 5시<\/strong>/);
  assert.doesNotMatch(html, /<span>토요모임<\/span><strong>매주 토요일 오전 11시<\/strong>/);
  assert.match(html, /<span>주일모임<\/span><strong>매주 일요일 오전 11시<\/strong>/);
});

test('Published Mission schedule continues to override public fallback without cross-site writes', async () => {
  const js = await read('church-shared-schedules.js');
  assert.match(js, /source==='ekodimission'&&x\.kind==='recurring-meeting'/);
  assert.match(js, /target\.textContent='이번 주 토요일 '\+labelTime\(saturday\.time\)/);
  assert.doesNotMatch(js, /(?:fetch\([^)]*,\s*\{[^}]*method:\s*['"](?:POST|PATCH|DELETE))|innerHTML/);
});
