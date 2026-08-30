(()=>{
'use strict';
if(window.__EKODI_CHURCH_HEADER_CONTROLS__)return;
window.__EKODI_CHURCH_HEADER_CONTROLS__=true;

const MUSIC={
  'ko-KR':{off:'♫ 음악',on:'♫ 끄기',play:'배경 음악 재생',stop:'배경 음악 끄기'},
  en:{off:'♫ Music',on:'♫ Off',play:'Play background music',stop:'Turn off background music'},
  'zh-CN':{off:'♫ 音乐',on:'♫ 关闭',play:'播放背景音乐',stop:'关闭背景音乐'},
  ja:{off:'♫ 音楽',on:'♫ オフ',play:'BGMを再生',stop:'BGMをオフ'},
  my:{off:'♫ သီချင်း',on:'♫ ပိတ်',play:'နောက်ခံသီချင်း ဖွင့်ရန်',stop:'နောက်ခံသီချင်း ပိတ်ရန်'},
  kac:{off:'♫ Mahkawn',on:'♫ Pat',play:'Mahkawn hpe hpaw',stop:'Mahkawn hpe pat'},
  vi:{off:'♫ Nhạc',on:'♫ Tắt',play:'Phát nhạc nền',stop:'Tắt nhạc nền'},
  mn:{off:'♫ Хөгжим',on:'♫ Унтраах',play:'Дэвсгэр хөгжим тоглуулах',stop:'Дэвсгэр хөгжим унтраах'},
  id:{off:'♫ Musik',on:'♫ Mati',play:'Putar musik latar',stop:'Matikan musik latar'}
};
let scheduled=false;

function locale(){
  const raw=String(window.EKODIUserLanguage?.getLocale?.()||document.documentElement.dataset.ekodiLocale||document.documentElement.lang||'ko-KR');
  if(raw.startsWith('ko'))return'ko-KR';
  if(raw.startsWith('zh'))return'zh-CN';
  if(raw.startsWith('ja'))return'ja';
  if(raw.startsWith('my'))return'my';
  if(raw.startsWith('kac'))return'kac';
  if(raw.startsWith('vi'))return'vi';
  if(raw.startsWith('mn'))return'mn';
  if(raw.startsWith('id'))return'id';
  return'en';
}
function syncBrand(){
  const brand=document.querySelector('.site-header .brand');
  if(!brand)return;
  brand.setAttribute('href','#top');
  if(!brand.dataset.topBound){
    brand.dataset.topBound='true';
    brand.addEventListener('click',event=>{
      event.preventDefault();
      const behavior=matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth';
      window.scrollTo({top:0,left:0,behavior});
      try{history.replaceState(null,'',location.pathname+location.search);}catch{}
    });
  }
}
function syncMusic(){
  const nav=document.querySelector('.site-header #main-nav');
  const button=document.getElementById('ekodi-ccm-mr-toggle');
  if(!nav||!button)return;
  const control=nav.querySelector('[data-ekodi-language-control]');
  if(control){
    if(button.parentElement!==nav||button.previousElementSibling!==control)control.insertAdjacentElement('afterend',button);
  }else if(button.parentElement!==nav||button!==nav.lastElementChild){
    nav.append(button);
  }
  const copy=MUSIC[locale()]||MUSIC.en;
  const active=button.getAttribute('aria-pressed')==='true';
  const label=active?copy.on:copy.off;
  const aria=active?copy.stop:copy.play;
  if(button.textContent!==label)button.textContent=label;
  if(button.getAttribute('aria-label')!==aria)button.setAttribute('aria-label',aria);
  if(button.title!==aria)button.title=aria;
}
function run(){scheduled=false;syncBrand();syncMusic();}
function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(run);}
window.addEventListener('ekodi:locale-change',schedule);
window.addEventListener('ekodi:user-header-ready',schedule);
window.addEventListener('ekodi:church-i18n-applied',schedule);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();
new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['aria-pressed']});
})();