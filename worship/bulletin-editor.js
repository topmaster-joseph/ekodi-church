// In-page bulletin editor for worship reviewers (loaded by review-gate.js
// only while a week is still unpublished and the viewer may manage worship).
// Edits are saved to church_worship_materials (.bulletin, .songs) — the same
// fields My Page edits — so the published page shows exactly what was saved.
// Song scores are never uploaded here: they stay in the Google PPT.
(() => {
  'use strict';
  const SUPABASE_URL = 'https://renzehysxirjilvdxacv.supabase.co';
  const KEY = 'sb_publishable_0QjB0WzZbjrd-FJ5D5cR7A_xUkXyOY_';
  const API = SUPABASE_URL + '/rest/v1/church_worship_materials';
  const review = window.EkodiReview || {};
  const data = window.EkodiBulletinData;
  const pages = document.querySelector('[data-bulletin-date]');
  const date = review.date || (data && data.date);
  const key = review.key || '';
  if (!pages || !data || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !key || window.EkodiBulletinEditor) return;
  window.EkodiBulletinEditor = true;

  const EDITABLE = ['week', 'announce', 'serve', 'stats', 'committee', 'sponsors', 'questions'];
  const SLOTS = ['경배찬양', '헌신찬양', '결단찬양'];
  const MAX_IMAGES = 6;
  const headers = (extra = {}) => ({ apikey: KEY, authorization: 'Bearer ' + key, accept: 'application/json', ...extra });
  const block = name => pages.querySelector(`[data-b="${name}"]`);
  const text = el => (el ? el.textContent.replace(/\s+/g, ' ').trim() : '');
  let current = { bulletin: {}, songs: '', photo_url: null, exists: false };
  let images = [];
  let editing = false;

  const style = document.createElement('style');
  style.textContent = '.be-panel{position:fixed;right:16px;bottom:16px;z-index:60;width:min(380px,calc(100vw - 32px));max-height:calc(100vh - 120px);overflow:auto;background:#fff;color:#183c33;border:1px solid #c9d6cd;border-radius:14px;box-shadow:0 12px 40px #0003;font:14px/1.5 "Malgun Gothic","Apple SD Gothic Neo",system-ui,sans-serif}'
    + '.be-panel header{display:flex;justify-content:space-between;align-items:center;gap:8px;padding:12px 14px;background:#183c33;color:#fff;border-radius:14px 14px 0 0;position:sticky;top:0}'
    + '.be-panel header strong{font-size:15px}.be-panel header button{background:#ffffff26;color:#fff;border:0;border-radius:8px;padding:4px 10px;font:inherit;cursor:pointer}'
    + '.be-body{padding:12px 14px;display:grid;gap:12px}.be-body h4{margin:0 0 4px;font-size:13px}'
    + '.be-body label{display:grid;gap:3px;font-size:13px}.be-body input[type=text]{border:1px solid #c9d6cd;border-radius:8px;padding:7px 9px;font:inherit}'
    + '.be-body .be-row{display:flex;flex-wrap:wrap;gap:8px}.be-body button{border:1px solid #c9d6cd;border-radius:9px;padding:8px 12px;background:#fff;color:#183c33;font:inherit;font-weight:700;cursor:pointer}'
    + '.be-body button.primary{background:#183c33;color:#fff;border-color:#183c33}.be-body button[disabled]{opacity:.5;cursor:wait}'
    + '.be-note{font-size:12px;color:#5a6b63;margin:0}.be-status{font-size:13px;font-weight:700;margin:0;min-height:1.4em}'
    + '.be-thumbs{display:grid;grid-template-columns:repeat(3,1fr);gap:6px}.be-thumbs figure{margin:0;position:relative}.be-thumbs img{width:100%;height:70px;object-fit:cover;border-radius:6px}'
    + '.be-thumbs button{position:absolute;top:2px;right:2px;padding:0 6px;font-size:12px;background:#fff}'
    + '.be-open{position:fixed;right:16px;bottom:16px;z-index:59;border:0;border-radius:99px;padding:12px 18px;background:#183c33;color:#fff;font:700 14px "Malgun Gothic",system-ui,sans-serif;box-shadow:0 8px 24px #0003;cursor:pointer}'
    + '[data-be-editing] [data-b]:not([data-b=photo]):not([data-b=images]){outline:2px dashed #e0a800;outline-offset:2px;border-radius:4px;background:#fffbe8}'
    + '@media print{.be-panel,.be-open{display:none!important}}';
  document.head.appendChild(style);

  // --- read the bulletin back from the page (same shape My Page saves) ---
  function fromPage() {
    const b = {};
    const trs = el => (el ? [...el.querySelectorAll('tr')].map(tr => [...tr.children].map(text)) : []);
    const wk = trs(block('week'));
    if (wk.length === 2) b.week = wk[0].map((h, i) => [h, wk[1][i] || '']);
    b.announce = [...(block('announce')?.querySelectorAll('li') || [])].map(text).filter(Boolean);
    const sv = trs(block('serve')).slice(1);
    b.serve = sv.flatMap(r => [[r[0], r[1]], [r[2], r[3]]]).filter(r => r[0] || r[1]);
    const st = trs(block('stats')).slice(1);
    b.stats = st.flatMap(r => [r.slice(0, 4), r.slice(4, 8)]).filter(r => r.some(Boolean));
    b.committee = trs(block('committee'));
    b.sponsors = [...(block('sponsors')?.querySelectorAll('li') || [])].map(text).filter(Boolean);
    b.questions = [...(block('questions')?.querySelectorAll('li') || [])].map(text).filter(Boolean);
    return b;
  }

  async function loadRow() {
    const url = API + '?select=bulletin,photo_url,songs&service_type=eq.sunday&service_date=eq.' + date + '&limit=1';
    const response = await fetch(url, { headers: headers(), cache: 'no-store' });
    if (!response.ok) throw new Error('불러오기 실패 (' + response.status + ')');
    const row = (await response.json())[0];
    current = { bulletin: (row && row.bulletin) || {}, songs: (row && row.songs) || '', photo_url: row ? row.photo_url : null, exists: !!row };
    images = Array.isArray(current.bulletin.images) ? current.bulletin.images.slice() : [];
    if (row) data.render(row.bulletin, row.photo_url, row.songs);
  }

  async function save(patch) {
    const stamp = new Date().toISOString();
    const body = { ...patch, updated_at: stamp };
    const filter = '?service_type=eq.sunday&service_date=eq.' + date;
    const patched = await fetch(API + filter, { method: 'PATCH', headers: headers({ 'content-type': 'application/json', Prefer: 'return=representation' }), body: JSON.stringify(body), cache: 'no-store' });
    if (!patched.ok) throw new Error('저장이 거부되었습니다 (' + patched.status + ')');
    const rows = await patched.json().catch(() => []);
    if (Array.isArray(rows) && rows.length) return;
    // No row yet: create it unpublished from this week's packet.
    const packet = await fetch(new URL('materials.json', location.href), { cache: 'no-store' }).then(r => r.json()).catch(() => ({}));
    const row = { service_type: 'sunday', service_date: date, service_name: '주일모임', service_time: '일요일 오전 11시', scripture: packet.scripture || '', title: packet.title || '', preacher: packet.preacher || '', is_published: false, ...body };
    const created = await fetch(API + '?on_conflict=service_type,service_date', { method: 'POST', headers: headers({ 'content-type': 'application/json', Prefer: 'resolution=merge-duplicates,return=minimal' }), body: JSON.stringify(row), cache: 'no-store' });
    if (!created.ok) throw new Error('저장이 거부되었습니다 (' + created.status + ')');
  }

  // Phone photos are re-encoded as a right-sized JPEG before upload.
  async function shrink(file) {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    return new Promise((resolve, reject) => canvas.toBlob(b => (b ? resolve(b) : reject(new Error('이미지를 처리하지 못했습니다'))), 'image/jpeg', 0.86));
  }

  async function upload(file) {
    const blob = await shrink(file);
    const path = `sunday/${date}/image-${Date.now()}-${Math.random().toString(36).slice(2, 7)}.jpg`;
    const response = await fetch(`${SUPABASE_URL}/storage/v1/object/church-bulletin/${path}`, { method: 'POST', headers: { apikey: KEY, authorization: 'Bearer ' + key, 'content-type': 'image/jpeg', 'x-upsert': 'true' }, body: blob });
    if (!response.ok) throw new Error('이미지 업로드 실패 (' + response.status + ')');
    return `${SUPABASE_URL}/storage/v1/object/public/church-bulletin/${path}`;
  }

  // --- panel ---
  const open = document.createElement('button');
  open.type = 'button';
  open.className = 'be-open';
  open.textContent = '✎ 주보 바로 편집';
  const panel = document.createElement('section');
  panel.className = 'be-panel';
  panel.hidden = true;
  panel.setAttribute('aria-label', '주보 바로 편집');
  panel.innerHTML = '<header><strong>주보 바로 편집 · 공개 전</strong><button type="button" data-be="close">닫기</button></header>'
    + '<div class="be-body">'
    + '<div><h4>찬양 곡명</h4>' + SLOTS.map(s => `<label>${s}<input type="text" data-song="${s}" maxlength="200" placeholder="곡명 (여러 곡은 쉼표)"></label>`).join('') + '<p class="be-note">곡명만 주보 예배순서에 표시됩니다. 악보는 저작권 때문에 웹에 올리지 않고 Google PPT에만 넣습니다.</p></div>'
    + '<div><h4>주보 글</h4><div class="be-row"><button type="button" data-be="edit">본문 직접 고치기 켜기</button></div><p class="be-note">켜면 노란 점선 칸(매일묵상·교회소식·봉사·통계·위원회·협력기관·적용질문)을 주보 위에서 바로 고칠 수 있습니다. 소식 줄 끝에서 Enter를 누르면 새 줄이 생깁니다.</p></div>'
    + '<div><h4>사진·안내 이미지 (최대 ' + MAX_IMAGES + '장)</h4><div class="be-thumbs" data-be="thumbs"></div><label>설명(선택)<input type="text" data-be="caption" maxlength="120" placeholder="예: 11월 15일 공동의회"></label><div class="be-row"><label class="be-file"><input type="file" accept="image/*" multiple data-be="file" hidden><button type="button" data-be="pick">이미지 추가</button></label></div><p class="be-note">추가한 이미지는 주보 3면에 실립니다. 얼굴이 나온 단체 사진은 당사자 동의를 확인한 뒤 올려 주세요.</p></div>'
    + '<div class="be-row"><button type="button" class="primary" data-be="save">저장</button><button type="button" data-be="reload">다시 불러오기</button></div>'
    + '<p class="be-status" role="status" aria-live="polite"></p></div>';
  document.body.append(open, panel);
  const $ = name => panel.querySelector(`[data-be="${name}"]`);
  const say = msg => { panel.querySelector('.be-status').textContent = msg; };

  function fillSongs() {
    const parsed = data.parseSongs(current.songs);
    SLOTS.forEach(s => { panel.querySelector(`[data-song="${s}"]`).value = parsed[s] || (s === '경배찬양' ? parsed.기타.join(', ') : ''); });
  }
  function songsText() {
    return SLOTS.map(s => [s, panel.querySelector(`[data-song="${s}"]`).value.trim()]).filter(([, v]) => v).map(([s, v]) => `${s}: ${v}`).join('\n');
  }
  function drawThumbs() {
    $('thumbs').innerHTML = images.map((img, i) => `<figure><img src="${img.url.replace(/"/g, '&quot;')}" alt=""><button type="button" data-remove="${i}" aria-label="이미지 삭제">✕</button></figure>`).join('');
  }
  function setEditing(on) {
    editing = on;
    if (on) pages.setAttribute('data-be-editing', ''); else pages.removeAttribute('data-be-editing');
    EDITABLE.forEach(n => { const el = block(n); if (el) el.contentEditable = on ? 'true' : 'false'; });
    $('edit').textContent = on ? '본문 직접 고치기 끄기' : '본문 직접 고치기 켜기';
  }
  // Re-draw only the song titles and the image sheet; unsaved text edits stay.
  function refresh() {
    const b = current.bulletin || {};
    data.render({ images, photoMode: b.photoMode, photoCaption: b.photoCaption, photoText: b.photoText }, current.photo_url, songsText());
  }

  open.addEventListener('click', () => { panel.hidden = false; open.hidden = true; });
  $('close').addEventListener('click', () => { panel.hidden = true; open.hidden = false; });
  $('edit').addEventListener('click', () => setEditing(!editing));
  $('pick').addEventListener('click', () => $('file').click());
  panel.querySelectorAll('[data-song]').forEach(input => input.addEventListener('input', refresh));
  $('thumbs').addEventListener('click', event => {
    const i = event.target && event.target.dataset ? event.target.dataset.remove : undefined;
    if (i === undefined) return;
    images.splice(Number(i), 1);
    drawThumbs();
    refresh();
    say('이미지를 뺐습니다. [저장]을 눌러야 반영됩니다.');
  });
  $('file').addEventListener('change', async event => {
    const files = [...(event.target.files || [])].filter(f => /^image\//.test(f.type));
    event.target.value = '';
    if (!files.length) return;
    if (images.length + files.length > MAX_IMAGES) { say(`이미지는 최대 ${MAX_IMAGES}장까지 넣을 수 있습니다.`); return; }
    const caption = $('caption').value.trim();
    $('pick').disabled = true;
    try {
      for (const file of files) {
        say('이미지 올리는 중… (' + file.name + ')');
        images.push({ url: await upload(file), caption });
      }
      $('caption').value = '';
      drawThumbs();
      refresh();
      say('이미지를 올렸습니다. [저장]을 눌러 확정하세요.');
    } catch (error) { say(error.message || '이미지 업로드에 실패했습니다.'); } finally { $('pick').disabled = false; }
  });
  $('save').addEventListener('click', async () => {
    $('save').disabled = true;
    say('저장 중…');
    try {
      const bulletin = { ...current.bulletin, ...fromPage(), images };
      const songs = songsText();
      await save({ bulletin, songs });
      current.bulletin = bulletin; current.songs = songs; current.exists = true;
      setEditing(false);
      data.render(bulletin, current.photo_url, songs);
      say('저장했습니다. 공개하면 이 내용 그대로 보입니다.');
    } catch (error) { say(error.message || '저장에 실패했습니다.'); } finally { $('save').disabled = false; }
  });
  $('reload').addEventListener('click', async () => {
    setEditing(false);
    say('불러오는 중…');
    try { await loadRow(); fillSongs(); drawThumbs(); say('저장된 내용을 불러왔습니다.'); } catch (error) { say(error.message); }
  });

  loadRow().then(() => { fillSongs(); drawThumbs(); say(current.exists ? '저장된 내용을 불러왔습니다.' : '아직 저장된 내용이 없습니다. 고친 뒤 [저장]을 누르세요.'); })
    .catch(error => say(error.message || '불러오기에 실패했습니다.'));
})();
