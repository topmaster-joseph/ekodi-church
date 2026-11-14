import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const script = readFileSync(new URL('../church-account-header.js', import.meta.url), 'utf8');
const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const css = readFileSync(new URL('../church-account-header.css', import.meta.url), 'utf8');
const KEY = 'sb-renzehysxirjilvdxacv-auth-token';

class Element {
  constructor(tag) {
    this.tagName = tag;
    this.children = [];
    this.dataset = {};
    this.listeners = {};
    this.hidden = false;
    this.textContent = '';
  }
  append(...items) { this.children.push(...items); }
  setAttribute(key, value) { (this.attributes ||= {})[key] = value; }
  removeAttribute(key) { if (this.attributes) delete this.attributes[key]; }
  addEventListener(type, callback) { this.listeners[type] = callback; }
}

function setup({ session = null, user = null, profile = null } = {}) {
  const header = new Element('header');
  const map = new Map();
  if (session) map.set(KEY, JSON.stringify(session));
  const localStorage = {
    getItem: key => map.get(key) || null,
    setItem: (key, value) => map.set(key, value),
    removeItem: key => map.delete(key),
  };
  const events = {};
  const requests = [];
  let reloads = 0;
  const location = { origin: 'https://ekodi.kr', pathname: '/ekodichurch/', search: '', reload: () => { reloads++; } };
  const document = {
    querySelector: value => value === 'header.site-header' ? header : null,
    createElement: tag => new Element(tag),
  };
  const window = {
    location,
    addEventListener: (name, fn) => { events[name] = fn; },
    dispatchEvent: event => { events[event.type]?.(event); },
  };
  const fetch = async (url, options) => {
    requests.push({ url: String(url), options });
    if (String(url).endsWith('/auth/v1/user')) return { ok: Boolean(user), json: async () => user };
    if (String(url).endsWith('/profile-api/me')) return { ok: Boolean(profile), json: async () => profile };
    if (String(url).includes('/auth/v1/logout')) return { ok: true };
    throw new Error('unexpected network call: ' + url);
  };
  runInNewContext(script, { document, window, location, localStorage, fetch, Event, URL,
    AbortController, setTimeout, clearTimeout, Date });
  const account = header.children.at(-1);
  const [login, signed] = account.children;
  const [name, logout] = signed.children;
  return { login, signed, name, logout, account, map, events, requests,
    get reloads() { return reloads; } };
}
const tick = () => new Promise(resolve => setTimeout(resolve, 15));

test('homepage loads the church account module and mobile-safe styles', () => {
  assert.match(html, /church-account-header\\.js/);
  assert.match(html, /church-account-header\\.css/);
  assert.match(css, /max-width:1023px/);
  assert.match(css, /\\[hidden\\]/);
});

test('guest keeps a church-local login return without exposing a fabricated identity', async () => {
  const ui = setup();
  await tick();
  assert.equal(ui.login.hidden, false);
  assert.equal(ui.signed.hidden, true);
  assert.match(ui.login.href, /site=church/);
  assert.match(ui.login.href, /return_to=https%3A%2F%2Fekodi\\.kr%2Fekodichurch%2F/);
});

test('verified user shows server-owned display name and a separate logout control', async () => {
  const session = { access_token: 'token-1', expires_at: Math.floor(Date.now() / 1000) + 1800, user: { id: 'person-1', email: 'secret@example.com', user_metadata: { name: 'provider' } } };
  const ui = setup({ session, user: session.user, profile: { profile: { display_name: '교회 공동체 회원' } } });
  await tick();
  assert.equal(ui.login.hidden, true);
  assert.equal(ui.signed.hidden, false);
  assert.equal(ui.name.textContent, '교회 공동체 회원');
  assert.equal(ui.logout.textContent, '로그아웃');
  assert.doesNotMatch(ui.name.textContent, /secret|@|person-1/);
  ui.logout.listeners.click();
  await tick();
  assert.equal(ui.map.has(KEY), false);
  assert.equal(ui.requests.filter(x => x.url.includes('/auth/v1/logout')).length, 1);
  assert.equal(ui.reloads, 1);
});

test('token and verified user mismatch never becomes signed-in state', async () => {
  const session = { access_token: 'token-other', expires_at: Math.floor(Date.now() / 1000) + 1800, user: { id: 'person-a' } };
  const ui = setup({ session, user: { id: 'person-b', user_metadata: { name: 'wrong' } } });
  await tick();
  assert.equal(ui.signed.hidden, true);
});

test('account names are truncated, not raw identity strings', async () => {
  const session = { access_token: 'token-long', expires_at: Math.floor(Date.now() / 1000) + 1800, user: { id: 'person-long', email: 'secret@example.com' } };
  const ui = setup({ session, user: session.user, profile: { profile: { display_name: '초장기한글계정표시이름아주아주길게' } } });
  await tick();
  assert.ok(Array.from(ui.name.textContent).length <= 13);
  assert.doesNotMatch(ui.name.textContent, /@|secret/);
});
