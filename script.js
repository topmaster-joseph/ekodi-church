const menuButton = document.querySelector('.menu-button');
const nav = document.querySelector('#main-nav');

// EKODI선교회는 에코디커뮤니티로 통합되었습니다. 기존 정적 문구가 남아 있어도
// 사용자에게는 새 명칭과 canonical Community 링크만 노출합니다.
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

// Every EKODI site should have a small path back to the shared Social Hub.
if (nav && !nav.querySelector('[data-ekodi-social]')) {
  const socialLink = document.createElement('a');
  socialLink.href = 'https://social.ekodi.kr/?org=church';
  socialLink.textContent = 'Social';
  socialLink.dataset.ekodiSocial = 'true';
  socialLink.setAttribute('aria-label', '에코디교회 소셜 허브');
  nav.append(socialLink);
}

menuButton.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', open);
});

nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
  nav.classList.remove('open');
  menuButton.setAttribute('aria-expanded', 'false');
}));

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
    title: 'EKODI교회 최신 유튜브 영상',
  },
  mission: {
    playlist: 'UUm1PFvzN0PRnyiF8Xx_mYTw',
    title: '에코디커뮤니티 최신 유튜브 영상',
  },
};

const youtubePlayer = document.querySelector('#youtube-player');
document.querySelectorAll('.channel-tab').forEach((tab) => tab.addEventListener('click', () => {
  const selected = youtubeChannels[tab.dataset.channel];
  if (!selected || !youtubePlayer) return;

  document.querySelectorAll('.channel-tab').forEach((button) => {
    const active = button === tab;
    button.classList.toggle('active', active);
    button.setAttribute('aria-selected', String(active));
  });

  youtubePlayer.src = `https://www.youtube-nocookie.com/embed/videoseries?list=${selected.playlist}`;
  youtubePlayer.title = selected.title;
}));

document.querySelectorAll('.copy-account').forEach((button) => button.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(button.dataset.account);
    button.textContent = '복사 완료';
    button.classList.add('copied');
    window.setTimeout(() => {
      button.textContent = '계좌 복사';
      button.classList.remove('copied');
    }, 1800);
  } catch {
    button.textContent = button.dataset.account;
  }
}));
