const menuButton = document.querySelector('.menu-button');
const nav = document.querySelector('#main-nav');
const siteHeader = document.querySelector('.site-header');
const churchT = (source) => window.EKODIChurchI18n?.t?.(source) || source;

// Korean-first church identity in the public header. The locale layer translates it after boot.
const headerBrandName = document.querySelector('.site-header .brand strong');
if (headerBrandName) headerBrandName.textContent = '에코디교회';
const headerBrandLink = document.querySelector('.site-header .brand');
if (headerBrandLink) headerBrandLink.setAttribute('aria-label', '에코디교회 홈');

// Show one short Scripture line per calendar day, based on Korea time.
const dailyScriptures = [
  { ref: '시편 23:1', text: '여호와는 나의 목자시니 내게 부족함이 없으리로다' },
  { ref: '시편 46:10', text: '너희는 가만히 있어 내가 하나님 됨을 알지어다' },
  { ref: '시편 119:105', text: '주의 말씀은 내 발에 등이요 내 길에 빛이니이다' },
  { ref: '잠언 3:5', text: '너는 마음을 다하여 여호와를 신뢰하고' },
  { ref: '이사야 41:10', text: '두려워하지 말라 내가 너와 함께 함이라' },
  { ref: '미가 6:8', text: '정의를 행하며 인자를 사랑하며 겸손하게 하나님과 함께 행하라' },
  { ref: '마태복음 5:14', text: '너희는 세상의 빛이라' },
  { ref: '마태복음 6:33', text: '먼저 그의 나라와 그의 의를 구하라' },
  { ref: '마태복음 7:7', text: '구하라 그리하면 너희에게 주실 것이요' },
  { ref: '마태복음 11:28', text: '수고하고 무거운 짐 진 자들아 다 내게로 오라' },
  { ref: '마태복음 22:39', text: '네 이웃을 네 자신 같이 사랑하라' },
  { ref: '마태복음 28:20', text: '내가 세상 끝날까지 너희와 항상 함께 있으리라' },
  { ref: '누가복음 6:31', text: '남에게 대접을 받고자 하는 대로 너희도 남을 대접하라' },
  { ref: '요한복음 3:16', text: '하나님이 세상을 이처럼 사랑하사' },
  { ref: '요한복음 8:32', text: '진리를 알지니 진리가 너희를 자유롭게 하리라' },
  { ref: '요한복음 10:10', text: '내가 온 것은 생명을 얻게 하고 더 풍성히 얻게 하려는 것이라' },
  { ref: '요한복음 14:6', text: '내가 곧 길이요 진리요 생명이니' },
  { ref: '요한복음 15:5', text: '나는 포도나무요 너희는 가지라' },
  { ref: '요한복음 15:12', text: '내가 너희를 사랑한 것 같이 너희도 서로 사랑하라' },
  { ref: '로마서 8:28', text: '모든 것이 합력하여 선을 이루느니라' },
  { ref: '로마서 12:12', text: '소망 중에 즐거워하며 환난 중에 참으며 기도에 항상 힘쓰며' },
  { ref: '로마서 15:13', text: '소망의 하나님이 기쁨과 평강을 믿음 안에서 충만하게 하시기를' },
  { ref: '고린도전서 13:13', text: '믿음 소망 사랑, 그 중의 제일은 사랑이라' },
  { ref: '고린도후서 5:17', text: '누구든지 그리스도 안에 있으면 새로운 피조물이라' },
  { ref: '갈라디아서 5:13', text: '사랑으로 서로 종 노릇 하라' },
  { ref: '에베소서 4:32', text: '서로 친절하게 하며 불쌍히 여기며 서로 용서하라' },
  { ref: '빌립보서 4:4', text: '주 안에서 항상 기뻐하라' },
  { ref: '빌립보서 4:13', text: '내게 능력 주시는 자 안에서 내가 모든 것을 할 수 있느니라' },
  { ref: '데살로니가전서 5:16-18', text: '항상 기뻐하라 쉬지 말고 기도하라 범사에 감사하라' },
  { ref: '히브리서 11:1', text: '믿음은 바라는 것들의 실상이요 보이지 않는 것들의 증거니' },
  { ref: '베드로전서 4:8', text: '무엇보다도 뜨겁게 서로 사랑할지니' },
];

function seoulDayOfYear() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  const year = Number(values.year);
  const month = Number(values.month);
  const day = Number(values.day);
  return Math.floor((Date.UTC(year, month - 1, day) - Date.UTC(year, 0, 1)) / 86400000);
}

if (siteHeader) {
  let dailyVerse = siteHeader.querySelector('.daily-verse');
  if (!dailyVerse) {
    dailyVerse = document.createElement('div');
    dailyVerse.className = 'daily-verse';
    dailyVerse.setAttribute('aria-live', 'polite');
    dailyVerse.innerHTML = '<span class="daily-verse-text"></span><span class="daily-verse-ref"></span>';
    siteHeader.insertBefore(dailyVerse, menuButton || nav || null);
  }

  const scripture = dailyScriptures[seoulDayOfYear() % dailyScriptures.length];
  const verseText = dailyVerse.querySelector('.daily-verse-text');
  const verseRef = dailyVerse.querySelector('.daily-verse-ref');
  if (verseText) verseText.textContent = `“${scripture.text}”`;
  if (verseRef) verseRef.textContent = scripture.ref;
  dailyVerse.title = `${scripture.text} · ${scripture.ref}`;
  dailyVerse.setAttribute('aria-label', `${scripture.text}, ${scripture.ref}`);
}

// Public church header: keep only the most useful next actions and My EKODI.
if (nav) {
  const items = [
    { href: '#worship', label: '예배안내' },
    { href: '#online', label: '온라인' },
    { href: '#location', label: '오시는 길' },
    { href: 'https://my.ekodi.kr/', label: 'My EKODI', className: 'shell-my' },
  ];
  const links = items.map((item) => {
    const link = document.createElement('a');
    link.href = item.href;
    link.textContent = item.label;
    if (item.className) link.className = item.className;
    if (item.href.startsWith('http')) link.setAttribute('aria-label', item.label);
    return link;
  });
  nav.replaceChildren(...links);
}

// EKODI선교회는 에코디커뮤니티로 통합되었습니다.
document.querySelectorAll('h1,h2,h3,p,span,small,a,button').forEach((element) => {
  for (const node of element.childNodes) {
    if (node.nodeType === Node.TEXT_NODE && node.textContent.includes('EKODI선교회')) {
      node.textContent = node.textContent.replaceAll('EKODI선교회', '에코디커뮤니티');
    }
    if (node.nodeType === Node.TEXT_NODE && node.textContent.includes('에코디선교회')) {
      node.textContent = node.textContent.replaceAll('에코디선교회', '에코디커뮤니티');
    }
  }
});

const footerBrandName = document.querySelector('footer .footer-brand strong');
if (footerBrandName) footerBrandName.textContent = '에코디교회';
const footerCopyright = document.querySelector('footer .footer-meta span');
if (footerCopyright) footerCopyright.textContent = '© 2026 에코디교회';

const communityCard = [...document.querySelectorAll('.community-cards article')].find((card) => card.querySelector('h3')?.textContent.includes('에코디커뮤니티'));
if (communityCard) {
  const link = communityCard.querySelector('a');
  if (link) {
    link.href = 'https://community.ekodi.kr';
    link.textContent = '에코디커뮤니티 보기 →';
  }
}
document.querySelectorAll('a[href="https://www.youtube.com/@ekodicommunity"]').forEach((link) => {
  link.textContent = '에코디커뮤니티 채널 ↗';
});

// Keep canonical YouTube links from the page intact. The registry may add other
// social channels, but it must not replace the worship route with stale data.
async function syncChurchSocialLinks() {
  const host = document.querySelector('.channel-links');
  if (!host) return;
  const preserved = [...host.querySelectorAll('a')].map((link) => link.cloneNode(true));
  const urls = new Set(preserved.map((link) => link.href));
  try {
    const response = await fetch('https://api.ekodi.kr/api/social/registry', {
      headers: { accept: 'application/json' },
      cache: 'no-store',
    });
    if (!response.ok) throw new Error(`registry_${response.status}`);
    const registry = await response.json();
    const church = (registry.organizations || []).find((org) => org.id === 'church' && org.isActive !== false);
    const channels = (church?.channels || []).filter((channel) => channel.isActive !== false && channel.provider !== 'youtube');
    const nodes = [...preserved];
    channels.forEach((channel) => {
      if (!channel.url || urls.has(channel.url)) return;
      const link = document.createElement('a');
      link.href = channel.url;
      link.target = '_blank';
      link.rel = 'noreferrer noopener';
      link.textContent = `${channel.label || channel.provider || 'Channel'} ↗`;
      link.dataset.provider = channel.provider || 'other';
      nodes.push(link);
      urls.add(channel.url);
    });
    const hubUrl = 'https://social.ekodi.kr/?org=church';
    if (!urls.has(hubUrl)) {
      const hub = document.createElement('a');
      hub.href = hubUrl;
      hub.target = '_blank';
      hub.rel = 'noreferrer noopener';
      hub.textContent = '전체 소셜채널 ↗';
      nodes.push(hub);
    }
    host.replaceChildren(...nodes);
    host.dataset.registryRevision = String(registry.revision || registry.version || 'live');
    window.EKODIChurchI18n?.refresh?.();
  } catch (error) {
    console.warn('[EKODI Church Social] existing channel links retained', error?.message || error);
  }
}
syncChurchSocialLinks();

if (menuButton && nav) {
  menuButton.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    menuButton.setAttribute('aria-expanded', open);
  });

  nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
    nav.classList.remove('open');
    menuButton.setAttribute('aria-expanded', 'false');
  }));
}

const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
  if (entry.isIntersecting) {
    entry.target.classList.add('visible');
    observer.unobserve(entry.target);
  }
}), { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));

const youtubeChannels = {
  church: {
    playlist: 'UUnp_LXmJBcJRX7CgJT9FF7w',
    title: '에코디교회 최신 유튜브 영상',
  },
  mission: {
    playlist: 'UUm1PFvzN0PRnyiF8Xx_mYTw',
    title: '에코디커뮤니티 최신 유튜브 영상',
  },
};

const youtubePlayer = document.querySelector('#youtube-player');
function youtubePlaylistUrl(playlist) {
  return `https://www.youtube-nocookie.com/embed/videoseries?list=${encodeURIComponent(playlist)}&rel=0&playsinline=1&origin=${encodeURIComponent('https://ekodi.kr')}`;
}

document.querySelectorAll('.channel-tab').forEach((tab) => tab.addEventListener('click', () => {
  const selected = youtubeChannels[tab.dataset.channel];
  if (!selected || !youtubePlayer) return;

  document.querySelectorAll('.channel-tab').forEach((button) => {
    const active = button === tab;
    button.classList.toggle('active', active);
    button.setAttribute('aria-selected', String(active));
  });

  youtubePlayer.src = youtubePlaylistUrl(selected.playlist);
  youtubePlayer.referrerPolicy = 'strict-origin-when-cross-origin';
  youtubePlayer.title = churchT(selected.title);
}));

document.querySelectorAll('.copy-account').forEach((button) => button.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(button.dataset.account);
    button.textContent = churchT('복사 완료');
    button.classList.add('copied');
    window.setTimeout(() => {
      button.textContent = churchT('계좌 복사');
      button.classList.remove('copied');
    }, 1800);
  } catch {
    button.textContent = button.dataset.account;
  }
}));
