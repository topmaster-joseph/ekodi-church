// EKODI Church live viewer: real-time interpretation subtitles.
// The studio's interpretation console publishes text captions per language
// (/api/realtime/captions). This page used to show only "voice track" readiness,
// which stays "준비 중" forever because interpretation is delivered as text.
(() => {
  'use strict';
  const API = '/api/realtime/captions';
  const TENANT = 'ekodichurch';
  const LABELS = { ko: '한국어', en: 'English', zh: '中文', ja: '日本語', vi: 'Tiếng Việt', mn: 'Монгол', uz: 'Oʻzbek', ru: 'Русский', th: 'ไทย', id: 'Bahasa Indonesia', ne: 'नेपाली', tl: 'Filipino', es: 'Español', fr: 'Français' };
  const box = document.querySelector('.viewer-interpretation');
  if (!box) return;
  const title = box.querySelector('strong');
  if (title) title.textContent = '실시간 통역 자막';
  const chips = document.getElementById('viewerLanguageChips');
  if (chips) chips.hidden = true;

  const select = document.createElement('select');
  select.id = 'viewerCaptionLanguage';
  select.setAttribute('aria-label', '자막 언어');
  const lines = document.createElement('div');
  lines.className = 'live-caption-lines';
  lines.setAttribute('aria-live', 'polite');
  const hint = document.createElement('small');
  hint.className = 'live-caption-hint';
  box.append(select, lines, hint);

  const stage = document.getElementById('viewerVideoStage');
  const overlay = document.createElement('div');
  overlay.className = 'live-caption-overlay';
  overlay.hidden = true;
  if (stage) stage.append(overlay);

  const state = { session: '', lang: 'original', after: 0, text: [], timer: 0 };
  const label = code => LABELS[code] || code;

  function setOptions(session) {
    const wanted = ['original', ...(session ? session.targetLangs : [])];
    const have = [...select.options].map(o => o.value);
    if (wanted.join() === have.join()) return;
    const keep = wanted.includes(select.value) ? select.value : (wanted.includes(state.lang) ? state.lang : 'original');
    select.replaceChildren(...wanted.map(code => {
      const o = document.createElement('option');
      o.value = code;
      o.textContent = code === 'original' ? `원문 (${label(session?.sourceLang || 'ko')})` : label(code);
      return o;
    }));
    select.value = keep;
    select.disabled = !session;
  }

  function render() {
    const recent = state.text.slice(-3);
    lines.replaceChildren(...recent.map(t => { const p = document.createElement('p'); p.textContent = t; return p; }));
    overlay.replaceChildren(...state.text.slice(-2).map(t => { const p = document.createElement('p'); p.textContent = t; return p; }));
    overlay.hidden = !state.text.length || select.value === 'original' && !state.session;
  }

  async function poll() {
    try {
      const lang = select.value || 'original';
      if (lang !== state.lang) { state.lang = lang; state.after = 0; state.text = []; }
      const res = await fetch(`${API}?tenant=${TENANT}&lang=${encodeURIComponent(lang)}&after=${state.after}`, { cache: 'no-store', credentials: 'same-origin' });
      const data = res.ok ? await res.json() : null;
      const session = data && data.session;
      if (!session) {
        state.session = ''; state.text = []; state.after = 0;
        setOptions(null);
        hint.textContent = '통역 자막이 시작되면 여기에 나타납니다.';
      } else {
        if (session.id !== state.session) { state.session = session.id; state.after = 0; state.text = []; }
        setOptions(session);
        for (const seg of data.segments || []) state.text.push(seg.text);
        state.text = state.text.slice(-20);
        state.after = data.next || state.after;
        hint.textContent = `통역 중 · ${session.targetLangs.map(label).join(', ')}`;
      }
      render();
    } catch {
      hint.textContent = '자막 연결을 다시 시도하는 중입니다.';
    } finally {
      state.timer = setTimeout(poll, document.hidden ? 6000 : 1500);
    }
  }
  select.addEventListener('change', () => { clearTimeout(state.timer); void poll(); });
  setOptions(null);
  void poll();
})();
