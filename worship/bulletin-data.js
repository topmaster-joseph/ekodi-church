// Editable bulletin content: the weekly worship page ships with the prepared
// bulletin, and anything the pastor edits in My Page (church_worship_materials
// .bulletin / .photo_url) replaces the matching block here.
(() => {
  'use strict';
  const SUPABASE_URL = 'https://renzehysxirjilvdxacv.supabase.co';
  const KEY = 'sb_publishable_0QjB0WzZbjrd-FJ5D5cR7A_xUkXyOY_';
  const script = document.currentScript;
  const date = script && script.dataset.date;
  const pages = document.querySelector('[data-bulletin-date]');
  if (!date || !pages) return;
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const block = name => pages.querySelector(`[data-b="${name}"]`);
  const rows = list => (Array.isArray(list) ? list : []).filter(r => Array.isArray(r) && r.some(c => String(c).trim()));

  function token() {
    try {
      const s = JSON.parse(localStorage.getItem('sb-renzehysxirjilvdxacv-auth-token') || 'null');
      const v = s && (s.currentSession || s.session || s);
      if (v && v.access_token && Number(v.expires_at || 0) > Date.now() / 1000 + 15) return v.access_token;
    } catch { /* storage blocked */ }
    return '';
  }

  function table(head, body, extra = '') {
    return `<table class="bp-grid ${extra}">${head.length ? '<tr>' + head.map(h => `<th>${esc(h)}</th>`).join('') + '</tr>' : ''}${body.map(r => '<tr>' + r.map(c => `<td>${esc(c)}</td>`).join('') + '</tr>').join('')}</table>`;
  }

  const ALLOWED_IMAGE = /^https:\/\/(renzehysxirjilvdxacv\.supabase\.co\/storage\/v1\/object\/public\/church-bulletin\/|drive\.google\.com\/thumbnail\?id=[\w-]+&sz=w\d+$)/;

  // Song titles typed in My Page or the in-page editor, one line per slot:
  // "경배찬양: 곡1, 곡2" / "헌신찬양: 곡" / "결단찬양: 곡". Titles only — scores
  // stay in the Google PPT (copyright).
  function parseSongs(text) {
    const out = { 경배찬양: '', 헌신찬양: '', 결단찬양: '', 기타: [] };
    String(text || '').split('\n').map(l => l.trim()).filter(Boolean).forEach(line => {
      const m = line.match(/^(경배|헌신|결단)(?:찬양)?\s*[:：·\-]\s*(.+)$/);
      if (m) out[m[1] + '찬양'] = m[2].trim(); else out.기타.push(line);
    });
    return out;
  }

  function renderSongs(text) {
    const songs = parseSongs(text);
    const order = document.querySelector('.bp-order table');
    if (!order) return;
    order.querySelectorAll('.bp-song').forEach(el => el.remove());
    order.querySelectorAll('tr').forEach(tr => {
      const label = (tr.children[0] && tr.children[0].textContent || '').trim();
      if (!(label in songs) || label === '기타' || !songs[label]) return;
      const cell = tr.children[1];
      if (!cell) return;
      const tag = document.createElement('span');
      tag.className = 'bp-song';
      tag.textContent = ' · ' + songs[label];
      cell.appendChild(tag);
    });
    if (songs.기타.length) {
      const first = [...order.querySelectorAll('tr')].find(tr => (tr.children[0] && tr.children[0].textContent.trim()) === '경배찬양');
      if (first && first.children[1]) {
        const tag = document.createElement('span');
        tag.className = 'bp-song';
        tag.textContent = ' · ' + songs.기타.join(', ');
        first.children[1].appendChild(tag);
      }
    }
  }

  // Extra pictures and notices added before publishing appear on their own
  // sheet so the two original A4 pages keep their layout.
  function renderImages(list) {
    const items = (Array.isArray(list) ? list : []).filter(i => i && ALLOWED_IMAGE.test(String(i.url || '')));
    let frame = pages.querySelector('[data-b-sheet="images"]');
    if (!items.length) { if (frame) frame.remove(); return; }
    if (!frame) {
      frame = document.createElement('div');
      frame.className = 'bp-frame';
      frame.dataset.bSheet = 'images';
      const head = pages.querySelector('.bp-head');
      const foot = pages.querySelector('.bp-foot');
      frame.innerHTML = '<article class="bp-sheet" aria-label="주보 사진과 소식">' + (head ? head.outerHTML : '') + '<div class="bp-images" data-b="images"></div>' + (foot ? foot.outerHTML : '') + '</article>';
      pages.appendChild(frame);
    }
    const box = frame.querySelector('[data-b="images"]');
    box.innerHTML = items.map(i => `<figure><img src="${esc(i.url)}" alt="${esc(i.caption || '')}" loading="lazy">${i.caption ? `<figcaption>${esc(i.caption)}</figcaption>` : ''}</figure>`).join('');
    box.dataset.count = String(Math.min(items.length, 6));
    try { window.dispatchEvent(new Event('resize')); } catch { /* old browser */ }
  }

  function injectStyle() {
    if (document.getElementById('bp-extra-style')) return;
    const style = document.createElement('style');
    style.id = 'bp-extra-style';
    style.textContent = '.bp-song{font-weight:400;color:#7a4b00}'
      + '.bp-images{flex:1;min-height:0;display:grid;gap:12px;grid-template-columns:repeat(2,1fr);align-content:start;padding:4px 0}'
      + '.bp-images[data-count="1"]{grid-template-columns:1fr}'
      + '.bp-images figure{margin:0;display:flex;flex-direction:column;align-items:center;min-height:0}'
      + '.bp-images img{max-width:100%;max-height:300px;object-fit:contain;border-radius:10px}'
      + '.bp-images[data-count="1"] img{max-height:600px}'
      + '.bp-images figcaption{font-size:12px;color:#333;margin-top:4px;text-align:center}';
    document.head.appendChild(style);
  }

  function render(b, photoUrl, songs) {
    injectStyle();
    renderSongs(songs);
    renderImages(b && b.images);
    if (b) {
      const week = rows(b.week);
      if (week.length && block('week')) block('week').innerHTML = `<table class="bp-week"><tr>${week.map(r => `<th>${esc(r[0])}</th>`).join('')}</tr><tr>${week.map(r => `<td>${esc(r[1] || '')}</td>`).join('')}</tr></table>`;
      if (Array.isArray(b.announce) && block('announce')) block('announce').innerHTML = '<ul class="bp-ann">' + b.announce.filter(Boolean).map(a => `<li>${esc(a)}</li>`).join('') + '</ul>';
      const serve = rows(b.serve);
      if (serve.length && block('serve')) {
        const pairs = [];
        for (let i = 0; i < serve.length; i += 2) pairs.push([...(serve[i] || ['', '']).slice(0, 2), ...((serve[i + 1] || ['', '']).slice(0, 2))]);
        block('serve').innerHTML = table(['구분', '이름', '구분', '이름'], pairs, 'bp-serve');
      }
      const stats = rows(b.stats);
      if (stats.length && block('stats')) {
        const pairs = [];
        for (let i = 0; i < stats.length; i += 2) pairs.push([...(stats[i] || []).concat(['', '', '', '']).slice(0, 4), ...((stats[i + 1] || []).concat(['', '', '', '']).slice(0, 4))]);
        block('stats').innerHTML = table(['구분', '장소', '시간', '인원', '구분', '장소', '시간', '인원'], pairs);
      }
      const committee = rows(b.committee);
      if (committee.length > 1 && block('committee')) {
        // Keep this Sunday's column highlighted like the prepared bulletin.
        const now = date.slice(5).replace('-', '/');
        const col = committee[0].findIndex(h => String(h).trim() === now);
        const cell = (tag, v, i) => `<${tag}${i === col ? ' class="bp-now"' : ''}>${esc(v)}</${tag}>`;
        block('committee').innerHTML = '<table class="bp-grid"><tr>' + committee[0].map((h, i) => cell('th', h, i)).join('') + '</tr>' + committee.slice(1).map(r => '<tr>' + r.map((c, i) => cell('td', c, i)).join('') + '</tr>').join('') + '</table>';
      }
      if (Array.isArray(b.sponsors) && block('sponsors')) block('sponsors').innerHTML = '<ul class="bp-sponsors">' + b.sponsors.filter(Boolean).map(a => `<li>${esc(a)}</li>`).join('') + '</ul>';
      if (Array.isArray(b.questions) && block('questions')) block('questions').innerHTML = '<ol class="bp-q">' + b.questions.filter(Boolean).map(a => `<li>${esc(a)}</li>`).join('') + '</ol>';
    }
    const photo = block('photo');
    if (photo) {
      // Photo slot: an uploaded photo, a public Google Drive photo, a blank
      // space, or a short text — chosen in My Page.
      const mode = (b && b.photoMode) || (photoUrl ? 'photo' : '');
      const img = photo.querySelector('img');
      const cap = photo.querySelector('figcaption');
      const allowed = ALLOWED_IMAGE;
      photo.classList.remove('bp-photo-blank', 'bp-photo-text');
      let note = photo.querySelector('.bp-photo-note');
      if (mode === 'photo' && photoUrl && allowed.test(photoUrl)) {
        img.hidden = false; img.src = photoUrl; img.alt = (b && b.photoCaption) || '';
        cap.textContent = (b && b.photoCaption) || '';
        if (note) note.remove();
        photo.hidden = false;
      } else if (mode === 'blank' || mode === 'text') {
        img.hidden = true; img.removeAttribute('src'); cap.textContent = '';
        photo.classList.add(mode === 'blank' ? 'bp-photo-blank' : 'bp-photo-text');
        if (mode === 'text') {
          if (!note) { note = document.createElement('p'); note.className = 'bp-photo-note'; photo.prepend(note); }
          note.textContent = (b && b.photoText) || '';
        } else if (note) note.remove();
        photo.hidden = false;
      }
    }
  }

  async function load(override) {
    const key = override || token();
    const url = `${SUPABASE_URL}/rest/v1/church_worship_materials?select=bulletin,photo_url,songs&service_type=eq.sunday&service_date=eq.${date}&limit=1`;
    const response = await fetch(url, { headers: { apikey: KEY, authorization: 'Bearer ' + (key || KEY) }, cache: 'no-store' });
    if (!response.ok) return;
    const list = await response.json();
    const row = Array.isArray(list) ? list[0] : null;
    if (row) render(row.bulletin, row.photo_url, row.songs);
    return row;
  }
  // The in-page editor (bulletin-editor.js, reviewers only) re-renders through this.
  window.EkodiBulletinData = { date, render, load, parseSongs, allowedImage: ALLOWED_IMAGE };
  load().catch(() => { /* keep the prepared bulletin */ });
})();
