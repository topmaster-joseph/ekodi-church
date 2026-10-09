import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const css = readFileSync(new URL('../church-refresh.css', import.meta.url), 'utf8');
const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

test('church hero seven shortcuts use centered readable labels on desktop and mobile', () => {
  const menu = html.match(/<div class="overview-grid"[\s\S]*?<\/div>/)?.[0];
  assert.ok(menu, 'overview menu must exist');
  assert.equal((menu.match(/<a href=/g) || []).length, 7, 'there must be seven shortcuts');
  assert.match(css, /\.hero \.overview-grid a\{[\s\S]*?place-items:center/);
  assert.match(css, /\.hero \.overview-grid a strong\{[^}]*font-size:18px;[^}]*text-align:center;/);
  assert.match(css, /@media\(max-width:800px\)\{[\s\S]*?\.hero \.overview-grid a strong\{font-size:17px\}/);
  assert.match(css, /@media\(max-width:480px\)\{[\s\S]*?\.hero \.overview-grid a strong\{font-size:16px\}/);
});

test('partner news is hidden until selected, including direct deep links', () => {
  assert.match(css, /#community,#partner-news,#online,#location\{display:none!important\}/);
  assert.match(css, /#partner-news:target/);
  assert.match(css, /\.hero:has\(~ #partner-news:target\)/);
  assert.match(css, /\.hero:has\(~ #partner-news :target\)/);
});
