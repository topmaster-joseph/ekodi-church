(()=>{
'use strict';
if(window.__EKODI_CHURCH_LIVE_ENTRY_I18N__)return;
window.__EKODI_CHURCH_LIVE_ENTRY_I18N__=true;

const COPY={
  'ko-KR':{aria:'에코디교회 실시간 방송',title:'예배와 모임을 홈페이지에서 바로 방송하고 참여하세요.',detail:'카메라·마이크·PPT/화면공유·참여자·녹화·다국어 통역을 하나의 Live Room에서 연결합니다.',host:'방송하기',join:'참여하기'},
  en:{aria:'EKODI Church live broadcast',title:'Broadcast and join worship and gatherings directly from the church website.',detail:'Connect camera, microphone, PPT or screen sharing, participants, recording, and multilingual interpretation in one Live Room.',host:'Start broadcast',join:'Join live'},
  'zh-CN':{aria:'EKODI教会实时直播',title:'直接从教会网站直播并参加礼拜和聚会。',detail:'在一个 Live Room 中连接摄像头、麦克风、PPT/屏幕共享、参与者、录制和多语言口译。',host:'开始直播',join:'参与直播'},
  ja:{aria:'EKODI教会ライブ配信',title:'教会ホームページから礼拝や集会をそのまま配信・参加できます。',detail:'カメラ、マイク、PPT/画面共有、参加者、録画、多言語通訳を一つの Live Room でつなぎます。',host:'配信する',join:'参加する'},
  my:{aria:'EKODI အသင်းတော် တိုက်ရိုက်ထုတ်လွှင့်မှု',title:'အသင်းတော်ဝဘ်ဆိုက်မှ ဝတ်ပြုခြင်းနှင့် စုဝေးခြင်းများကို တိုက်ရိုက်ထုတ်လွှင့်ပြီး ပါဝင်နိုင်ပါသည်။',detail:'ကင်မရာ၊ မိုက်ခရိုဖုန်း၊ PPT/မျက်နှာပြင်မျှဝေမှု၊ ပါဝင်သူများ၊ မှတ်တမ်းတင်ခြင်းနှင့် ဘာသာစကားစုံ စကားပြန်ကို Live Room တစ်ခုတည်းတွင် ချိတ်ဆက်ပါ။',host:'ထုတ်လွှင့်ရန်',join:'ပါဝင်ရန်'},
  kac:{aria:'EKODI Nawku Htingnu live broadcast',title:'Nawku htingnu website kaw nna worship hte meeting ni hpe live broadcast galaw nna shang lawm lu ai.',detail:'Camera, microphone, PPT/screen sharing, participants, recording hte multilingual interpretation hpe Live Room langai hta mahkrai matut ya ai.',host:'Broadcast galaw',join:'Shang lawm'},
  vi:{aria:'Phát trực tiếp Hội thánh EKODI',title:'Phát và tham gia buổi thờ phượng, nhóm họp ngay trên trang web của hội thánh.',detail:'Kết nối camera, micro, PPT/chia sẻ màn hình, người tham gia, ghi hình và phiên dịch đa ngôn ngữ trong một Live Room.',host:'Phát trực tiếp',join:'Tham gia'},
  mn:{aria:'EKODI Сүмийн шууд дамжуулалт',title:'Сүмийн вэбсайтаас мөргөл, цуглааныг шууд дамжуулж, оролцоорой.',detail:'Камер, микрофон, PPT/дэлгэц хуваалцах, оролцогчид, бичлэг, олон хэлний орчуулгыг нэг Live Room-д холбоно.',host:'Шууд дамжуулах',join:'Оролцох'},
  id:{aria:'Siaran langsung Gereja EKODI',title:'Siarkan dan ikuti ibadah serta pertemuan langsung dari situs gereja.',detail:'Hubungkan kamera, mikrofon, PPT/berbagi layar, peserta, rekaman, dan penerjemahan multibahasa dalam satu Live Room.',host:'Mulai siaran',join:'Ikuti siaran'}
};

function normalize(value){
  const raw=String(value||'').trim();
  if(raw==='ko'||raw==='ko-KR')return'ko-KR';
  return COPY[raw]?raw:'ko-KR';
}
function current(){
  const query=new URLSearchParams(location.search).get('lang');
  if(query&&COPY[normalize(query)])return normalize(query);
  const extended=window.EKODIChurchExtendedI18n?.getLocale?.();
  if(extended&&COPY[extended])return extended;
  return normalize(document.documentElement.dataset.ekodiLocale||document.documentElement.lang||'ko-KR');
}
function apply(locale=current()){
  const root=document.querySelector('[data-ekodi-church-live-entry]');
  if(!root)return;
  const copy=COPY[normalize(locale)];
  root.setAttribute('aria-label',copy.aria);
  const title=root.querySelector('strong');
  const detail=root.querySelector('small');
  const host=root.querySelector('.church-live-host');
  const join=root.querySelector('.church-live-join');
  if(title)title.textContent=copy.title;
  if(detail)detail.textContent=copy.detail;
  if(host)host.textContent=copy.host;
  if(join)join.textContent=copy.join;
}
let scheduled=false;
function schedule(locale){
  if(scheduled)return;
  scheduled=true;
  requestAnimationFrame(()=>{scheduled=false;apply(locale||current());});
}
window.EKODIChurchLiveEntryI18n=Object.freeze({apply,refresh:()=>schedule()});
for(const eventName of ['ekodi:locale-change','ekodi:church-i18n-applied','ekodi:church-extended-i18n-applied']){
  window.addEventListener(eventName,event=>schedule(event.detail?.locale));
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>schedule(),{once:true});else schedule();
new MutationObserver(()=>schedule()).observe(document.documentElement,{childList:true,subtree:true,characterData:true});
})();
