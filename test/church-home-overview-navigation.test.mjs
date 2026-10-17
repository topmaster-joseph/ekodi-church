import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const css = readFileSync(new URL('../church-refresh.css', import.meta.url), 'utf8');
const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

test('church hero uses four concise essential cards and expandable secondary entries', () => {
  const start=html.indexOf('class="overview-grid" aria-label="에코디교회 핵심 메뉴"');
  const secondary=html.indexOf('<details class="church-more-menu"');
  assert.ok(start>=0&&secondary>start, 'essential grid and accessible expanded menu must exist');
  const first=html.slice(start,secondary);
  assert.equal((first.match(/<a\s/g)||[]).length,4,'only four essential shortcuts appear initially');
  for(const target of ['#life-hub','#weekly-worship','#community','#online']){
    assert.ok(first.includes('href="'+target+'"'),target+' is an essential destination');
  }
  const details=html.slice(secondary,html.indexOf('</details>',secondary));
  assert.equal((details.match(/<a\s/g)||[]).length,4,'secondary choices are retained but collapsed');
  assert.match(css,/\.hero \.overview-grid a\{[\s\S]*?place-items:center/);
  assert.match(css,/\.hero \.overview-grid a strong\{[^}]*font-size:18px;[^}]*text-align:center;/);
  assert.match(css,/\.church-more-menu summary:focus-visible/);
  assert.match(css,/@media\(max-width:800px\)\{/);
  assert.match(css,/@media\(max-width:480px\)\{/);
});

test('partner news is hidden until selected, including direct deep links', () => {
  assert.match(css, /#community,#partner-news,#online,#location\{display:none!important\}/);
  assert.match(css, /#partner-news:target/);
  assert.match(css, /\.hero:has\(~ #partner-news:target\)/);
  assert.match(css, /\.hero:has\(~ #partner-news :target\)/);
});
