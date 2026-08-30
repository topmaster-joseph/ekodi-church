(()=>{
'use strict';
if(window.__EKODI_CHURCH_HEADER_CONTROLS__)return;
window.__EKODI_CHURCH_HEADER_CONTROLS__=true;

const EXTENDED=new Set(['my','kac','vi','mn','id']);
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
const SCHEDULE={
  'ko-KR':[
    ['주일모임','매주 일요일 오전 11시','예배실'],
    ['토요모임','매주 토요일 오전 11시','예배실'],
    ['심야기도','매일 저녁 11시 30분','예배실']
  ],
  en:[
    ['Sunday Gathering','Every Sunday · 11:00 AM','Worship room'],
    ['Saturday Gathering','Every Saturday · 11:00 AM','Worship room'],
    ['Late-night Prayer','Daily · 11:30 PM','Worship room']
  ],
  'zh-CN':[
    ['主日聚会','每周日 上午11:00','礼拜室'],
    ['周六聚会','每周六 上午11:00','礼拜室'],
    ['深夜祷告','每晚 11:30','礼拜室']
  ],
  ja:[
    ['主日集会','毎週日曜 午前11:00','礼拝室'],
    ['土曜集会','毎週土曜 午前11:00','礼拝室'],
    ['深夜祈祷','毎日 午後11:30','礼拝室']
  ],
  my:[
    ['တနင်္ဂနွေ စုဝေးပွဲ','တနင်္ဂနွေတိုင်း မနက် 11:00','ဝတ်ပြုခန်း'],
    ['စနေနေ့ စုဝေးပွဲ','စနေတိုင်း မနက် 11:00','ဝတ်ပြုခန်း'],
    ['ညဉ့်နက် ဆုတောင်းခြင်း','နေ့တိုင်း ည 11:30','ဝတ်ပြုခန်း']
  ],
  kac:[
    ['Sunday Zuphpawng','Sunday shagu 11:00 AM','Nawku gawk'],
    ['Saturday Zuphpawng','Saturday shagu 11:00 AM','Nawku gawk'],
    ['Shana akyu hpyi','Shani shagu 11:30 PM','Nawku gawk']
  ],
  vi:[
    ['Nhóm Chúa nhật','Mỗi Chúa nhật · 11:00','Phòng thờ phượng'],
    ['Nhóm thứ Bảy','Mỗi thứ Bảy · 11:00','Phòng thờ phượng'],
    ['Cầu nguyện đêm','Mỗi tối · 23:30','Phòng thờ phượng']
  ],
  mn:[
    ['Нямын цуглаан','Ням бүр · 11:00','Мөргөлийн өрөө'],
    ['Бямбын цуглаан','Бямба бүр · 11:00','Мөргөлийн өрөө'],
    ['Шөнийн залбирал','Өдөр бүр · 23:30','Мөргөлийн өрөө']
  ],
  id:[
    ['Pertemuan Minggu','Setiap Minggu · 11.00','Ruang ibadah'],
    ['Pertemuan Sabtu','Setiap Sabtu · 11.00','Ruang ibadah'],
    ['Doa malam','Setiap hari · 23.30','Ruang ibadah']
  ]
};
let scheduled=false;
let lastLocale='';

function normalizeLocale(value){
  const raw=String(value||'').trim().toLowerCase();
  if(raw==='ko'||raw.startsWith('ko-'))return'ko-KR';
  if(raw==='zh'||raw.startsWith('zh-'))return'zh-CN';
  if(raw==='ja'||raw.startsWith('ja-'))return'ja';
  if(raw==='my'||raw.startsWith('my-'))return'my';
  if(raw==='kac'||raw.startsWith('kac-')||raw==='jinghpaw'||raw==='kachin')return'kac';
  if(raw==='vi'||raw.startsWith('vi-'))return'vi';
  if(raw==='mn'||raw.startsWith('mn-'))return'mn';
  if(raw==='id'||raw.startsWith('id-'))return'id';
  return'en';
}
function locale(){
  return normalizeLocale(window.EKODIUserLanguage?.getLocale?.()||document.documentElement.dataset.ekodiLocale||document.documentElement.lang||'ko-KR');
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
function syncSchedule(){
  const rows=[...document.querySelectorAll('#worship .schedule>div')].slice(0,3);
  const data=SCHEDULE[locale()]||SCHEDULE.en;
  rows.forEach((row,index)=>{
    const values=data[index];
    if(!values)return;
    const label=row.querySelector('span');
    const time=row.querySelector('strong');
    const place=row.querySelector('small');
    if(label&&label.textContent!==values[0])label.textContent=values[0];
    if(time&&time.textContent!==values[1])time.textContent=values[1];
    if(place&&place.textContent!==values[2])place.textContent=values[2];
  });
}
function navigateForExtendedLocale(next){
  const previous=lastLocale||locale();
  lastLocale=next;
  if(next===previous||(!EXTENDED.has(next)&&!EXTENDED.has(previous)))return false;
  try{
    const url=new URL(location.href);
    url.searchParams.set('lang',next);
    location.replace(url.toString());
  }catch{location.reload();}
  return true;
}
function run(){scheduled=false;syncBrand();syncMusic();syncSchedule();}
function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(()=>requestAnimationFrame(run));}
lastLocale=locale();
window.addEventListener('ekodi:locale-change',event=>{
  const next=normalizeLocale(event.detail?.locale||locale());
  if(!navigateForExtendedLocale(next))schedule();
});
window.addEventListener('ekodi:user-header-ready',schedule);
window.addEventListener('ekodi:church-i18n-applied',schedule);
window.addEventListener('ekodi:church-extended-i18n-applied',schedule);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();
new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['aria-pressed']});
})();