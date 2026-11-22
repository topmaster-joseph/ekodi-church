import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const src = readFileSync(new URL('../church-funding-card.js', import.meta.url), 'utf8');
const headers = readFileSync(new URL('../_headers', import.meta.url), 'utf8');

function run(fetchImpl) {
  const els = {};
  const make = id => ({ id, hidden: true, textContent: '', children: [], appendChild(c) { this.children.push(c); }, setAttribute() {} });
  els['church-funding'] = make('church-funding');
  els['church-funding-cards'] = make('church-funding-cards');
  const document = { getElementById: id => els[id] || null, createElement: () => ({ setAttribute(k, v) { this[k] = v; } }) };
  vm.runInNewContext(src, { document, fetch: fetchImpl });
  return new Promise(r => setTimeout(() => r(els), 10));
}
const ok = body => async () => ({ ok: true, json: async () => body });

test('funding card area is hidden by default and loaded after partner news', () => {
  assert.match(html, /<div class="church-funding" id="church-funding" hidden/);
  assert.ok(html.indexOf('partner-news.js') < html.indexOf('church-funding-card.js'));
  assert.match(headers, /frame-src 'self' https:\/\/www\.youtube-nocookie\.com/, 'CSP unchanged: ekodi.kr embed is same-origin');
});

test('shows only open campaigns (max 2) with validated slugs', async () => {
  const els = await run(ok({ campaigns: [
    { slug: 'book-one', title: '신간', open: true }, { slug: 'closed-one', open: false },
    { slug: '"><script>', open: true }, { slug: 'two-ok', open: true }, { slug: 'three-ok', open: true }] }));
  assert.equal(els['church-funding'].hidden, false);
  assert.deepEqual(els['church-funding-cards'].children.map(f => f.src), ['https://ekodi.kr/funding/embed/book-one', 'https://ekodi.kr/funding/embed/two-ok']);
});

test('stays hidden when there is nothing open, the API fails, or the network errors', async () => {
  assert.equal((await run(ok({ campaigns: [] })))['church-funding'].hidden, true);
  assert.equal((await run(async () => ({ ok: false, json: async () => ({}) })))['church-funding'].hidden, true);
  assert.equal((await run(async () => { throw new Error('offline'); }))['church-funding'].hidden, true);
});
