// EKODI-FUNDING-004 시범: 에코디 펀딩 진행 카드(ekodi.kr/funding/embed/:slug)를 교회 홈페이지에 붙인다.
// 공개 모금 중인 펀딩이 있을 때만 보이고, 없거나 불러오지 못하면 영역 전체를 숨긴 채로 둔다(빈 카드·오류 노출 없음).
// 결제·개인정보 입력은 카드 안에 없다 — 누르면 에코디 펀딩 상세 페이지로 이동한다.
(() => {
  const box = document.getElementById('church-funding');
  const list = document.getElementById('church-funding-cards');
  if (!box || !list) return;
  const ORIGIN = 'https://ekodi.kr';
  const SLUG = /^[a-z0-9](?:[a-z0-9-]{1,38}[a-z0-9])$/;
  const MAX = 2;
  fetch('/api/funding/public/campaigns', { headers: { accept: 'application/json' }, cache: 'no-store' })
    .then(r => (r.ok ? r.json() : null))
    .then(data => {
      const open = (data && Array.isArray(data.campaigns) ? data.campaigns : []).filter(c => c && c.open === true && SLUG.test(String(c.slug || ''))).slice(0, MAX);
      if (!open.length) return;
      list.textContent = '';
      for (const c of open) {
        const frame = document.createElement('iframe');
        frame.src = `${ORIGIN}/funding/embed/${c.slug}`;
        frame.title = `에코디 펀딩 · ${String(c.title || '').slice(0, 80)}`;
        frame.loading = 'lazy';
        frame.width = '100%';
        frame.height = '190';
        frame.className = 'church-funding-frame';
        frame.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
        list.appendChild(frame);
      }
      box.hidden = false;
    })
    .catch(() => {});
})();
