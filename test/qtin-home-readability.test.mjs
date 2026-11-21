import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const source = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8');
const home = source('index.html');
const script = source('script.js');
const layout = source('church-homepage-layout.css');

test('church public landing exposes the canonical QTIN application twice, without member shortcut', () => {
  const nav = home.match(/<nav id="main-nav"[\s\S]*?<\/nav>/)?.[0] ?? '';
  const cards = home.match(/<div class="overview-grid"[\s\S]*?<\/div>/)?.[0] ?? '';
  assert.match(nav, /href="\/qtin\/church">큐티인 신청<\/a>/);
  assert.match(cards, /href="\/qtin\/church"/);
  assert.doesNotMatch(nav + cards, /마이페이지|\/ekodichurch\/my\//);
  assert.match(script, /href: '\/qtin\/church', label: '큐티인 신청'/);
  assert.equal((cards.match(/<a /g) ?? []).length, 6);
});

test('member route remains available and layout keeps six readable entries', () => {
  assert.match(source('my/index.html'), /에코디교회 마이페이지/);
  assert.match(layout, /grid-template-columns:repeat\(3,minmax\(0,1fr\)\)/);
  assert.match(layout, /grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
  assert.match(layout, /min-height:94px/);
});
