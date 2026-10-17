import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const css = readFileSync(new URL('../church-refresh.css', import.meta.url), 'utf8');

test('church homepage starts simple while preserving every primary destination', () => {
  const destinations = [
    ['#about', '우리의 정체성'],
    ['#life-hub', '오늘의 삶'],
    ['#community', '공동체 활동'],
    ['#weekly-worship', '예배 자료'],
    ['#worship', '예배안내'],
    ['#online', '라이브 방송'],
    ['#partner-news', '협력 소식'],
    ['#location', '함께하기'],
  ];

  for (const [href, label] of destinations) {
    assert.ok(html.includes(`href="${href}"`), `missing destination ${href}`);
    assert.ok(html.includes(`<strong>${label}</strong>`), `missing intuitive label ${label}`);
  }

  assert.ok(css.includes('/* Progressive disclosure · simple first view'));
  assert.ok(css.includes('.hero .hero-focus,.hero .hero-copy,.hero .scroll-cue{display:none!important}'));
  assert.ok(css.includes('.hero .overview-grid a span,.hero .overview-grid a small{display:none!important}'));
  assert.ok(css.includes('#about,#worship,#message,#life-hub,#community,#partner-news,#online,#location{display:none!important}'));
  assert.ok(css.includes('#online:has(:target)'));
  assert.ok(css.includes('.church-live-entry{display:none!important}'));
  assert.ok(html.includes('<details class="church-more-menu" data-church-more-menu>'));
  assert.ok(css.includes('.hero .overview-grid:not(.church-overview-secondary)'));
  assert.ok(css.includes('.hero:has(~ #weekly-worship:target)'));
});
