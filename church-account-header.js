/* Church-local account controls. These are presentation only, never authorization. */
(() => {
  'use strict';
  const header = document.querySelector('header.site-header');
  if (!header || location.origin !== 'https://ekodi.kr' || document.querySelector('[data-church-account]')) return;
  const KEY = 'sb-renzehysxirjilvdxacv-auth-token';
  const AUTH = 'https://renzehysxirjilvdxacv.supabase.co';
  const PUBLIC_KEY = 'sb_publishable_0QjB0WzZbjrd-FJ5D5cR7A_xUkXyOY_';
  const PROFILE = AUTH + '/functions/v1/profile-api/me';
  const account = document.createElement('div');
  account.className = 'church-account';
  account.dataset.churchAccount = '';
  account.setAttribute('role', 'group');
  account.setAttribute('aria-label', '에코디 계정');
  const login = document.createElement('a');
  login.className = 'church-account-login';
  login.textContent = '로그인';
  const signed = document.createElement('span');
  signed.className = 'church-account-signed';
  signed.hidden = true;
  const name = document.createElement('a');
  name.className = 'church-account-name';
  name.href = '/ekodichurch/my/';
  name.setAttribute('aria-label', '내 교회 마이페이지');
  const logout = document.createElement('button');
  logout.className = 'church-account-logout';
  logout.type = 'button';
  logout.textContent = '로그아웃';
  signed.append(name, logout);
  account.append(login, signed);
  header.append(account);

  let generation = 0;
  let signingOut = false;
  function read() {
    try {
      const raw = JSON.parse(localStorage.getItem(KEY) || 'null');
      const session = raw?.currentSession || raw?.session || raw;
      return { raw, session, token: String(session?.access_token || '') };
    } catch {
      return { raw: null, session: null, token: '' };
    }
  }
  function loginUrl() {
    const url = new URL('/auth/', 'https://ekodi.kr');
    url.searchParams.set('site', 'church');
    url.searchParams.set('return_to', location.origin + location.pathname + location.search);
    return url.href;
  }
  function guest() {
    login.href = loginUrl();
    login.hidden = false;
    signed.hidden = true;
    name.textContent = '';
    name.removeAttribute('title');
  }
  function shortName(value) {
    const normalized = String(value || '').replace(/\s+/g, ' ').trim();
    const chars = Array.from(normalized || 'EKODI 회원');
    return chars.length > 12 ? chars.slice(0, 12).join('') + '…' : chars.join('');
  }
  function safeName(profile, user) {
    const metadata = user?.user_metadata || {};
    // Never expose the email address, database UUID, access token or provider alias.
    return String(profile?.profile?.display_name || metadata.display_name ||
      metadata.full_name || metadata.name || 'EKODI 회원').replace(/\s+/g, ' ').trim();
  }
  function member(value) {
    name.textContent = shortName(value);
    name.title = '마이페이지 · ' + shortName(value);
    login.hidden = true;
    signed.hidden = false;
  }
  async function request(url, options = {}) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 6500);
    try {
      return await fetch(url, { ...options, cache: 'no-store', signal: controller.signal });
    } finally {
      clearTimeout(timer);
    }
  }
  async function currentToken() {
    const previous = read();
    if (!previous.token) return '';
    const expires = Number(previous.session?.expires_at || 0);
    if (!expires || expires > Date.now() / 1000 + 45) return previous.token;
    if (!previous.session?.refresh_token) return '';
    try {
      const response = await request(AUTH + '/auth/v1/token?grant_type=refresh_token', {
        method: 'POST',
        headers: { apikey: PUBLIC_KEY, 'content-type': 'application/json' },
        body: JSON.stringify({ refresh_token: previous.session.refresh_token })
      });
      if (!response.ok) return '';
      const refreshed = await response.json();
      if (!refreshed?.access_token) return '';
      const latest = read();
      // Never restore an account that another tab has just signed out or switched.
      if (latest.token !== previous.token) return latest.token;
      const next = { ...previous.session, ...refreshed,
        expires_at: Number(refreshed.expires_at) ||
          Math.floor(Date.now() / 1000) + Number(refreshed.expires_in || 3600) };
      const value = previous.raw?.currentSession
        ? { ...previous.raw, currentSession: next }
        : previous.raw?.session
          ? { ...previous.raw, session: next }
          : { ...previous.raw, ...next };
      localStorage.setItem(KEY, JSON.stringify(value));
      return next.access_token;
    } catch {
      return '';
    }
  }
  async function verify() {
    if (signingOut) return;
    const version = ++generation;
    let token = '';
    try { token = await currentToken(); } catch {}
    if (!token) {
      if (version === generation) guest();
      return;
    }
    try {
      const response = await request(AUTH + '/auth/v1/user', {
        headers: { apikey: PUBLIC_KEY, authorization: 'Bearer ' + token, accept: 'application/json' }
      });
      if (!response.ok) throw new Error('unverified');
      const user = await response.json();
      if (version !== generation || !user?.id || user.id !== read().session?.user?.id ||
          read().token !== token) return;
      member(safeName(null, user));
      // The server-owned Person display name overrides optional provider metadata.
      try {
        const profileResponse = await request(PROFILE, {
          headers: { apikey: PUBLIC_KEY, authorization: 'Bearer ' + token, accept: 'application/json' }
        });
        if (!profileResponse.ok) return;
        const profile = await profileResponse.json();
        if (version === generation && read().token === token) member(safeName(profile, user));
      } catch { /* Verified provider display name remains visible. */ }
    } catch {
      if (version === generation) guest();
    }
  }
  async function signOut() {
    if (signingOut) return;
    signingOut = true;
    ++generation;
    logout.disabled = true;
    logout.textContent = '로그아웃 중';
    const previous = read();
    // Revoke this Supabase browser session; do not touch unrelated admin credentials.
    try {
      if (previous.token) {
        await request(AUTH + '/auth/v1/logout?scope=local', {
          method: 'POST', headers: { apikey: PUBLIC_KEY, authorization: 'Bearer ' + previous.token }
        });
      }
    } catch { /* Local sign-out must still work without network access. */ }
    try {
      if (read().token === previous.token) localStorage.removeItem(KEY);
    } catch {}
    window.dispatchEvent(new Event('ekodi:auth-state'));
    window.dispatchEvent(new Event('ekodi:auth-logout'));
    guest();
    window.location.reload(); // Preserve current church page and prevent auto-login redirects.
  }
  logout.addEventListener('click', () => { void signOut(); });
  window.addEventListener('storage', (event) => { if (event.key === KEY) void verify(); });
  window.addEventListener('pageshow', () => { void verify(); });
  window.addEventListener('focus', () => { void verify(); });
  window.addEventListener('ekodi:auth-state', () => { if (!signingOut) void verify(); });
  guest();
  void verify();
})();
