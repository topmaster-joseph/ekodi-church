(() => {
  'use strict';
  const allowedViews = new Set(['bulletin','operator','stage','vertical']);
  const query = new URLSearchParams(location.search);
  const view = allowedViews.has(query.get('view')) ? query.get('view') : 'bulletin';
  document.body.dataset.view = view;
  document.querySelectorAll('[data-mode-link]').forEach(link => {
    if (link.dataset.modeLink === view) link.setAttribute('aria-current','page');
  });

  // Public, fixed data derived from the 2026-11-29 worship preparation packet.
  // No viewer data, platform tokens, stream keys or unpublished member content.
  const slides = [
    {
      "title": "에코디교회",
      "kicker": "WHO IS GOD? WHO AM I? WHAT DO I DO?",
      "lines": [
        "잠시 후 예배가 시작됩니다",
        "기대하는 마음으로 미리 준비해 주세요"
      ],
      "cover": true
    },
    {
      "title": "Call to Worship",
      "kicker": "예배부름",
      "lines": [
        "약속대로 오신 그리스도를 기억하며 다시 오실 주님을 기다리는 우리를 하나님이 예배에 초대하십니다"
      ]
    },
    {
      "title": "Community Confession",
      "kicker": "공동고백",
      "lines": [
        "받은 복음 위에 우리를 세우시는 하나님 앞에서 공동체가 고백합니다"
      ]
    },
    {
      "title": "공동체 고백",
      "kicker": "Community Confession",
      "lines": [
        "하나님은 우리를 세상에서 하나님의 구별된 백성으로 부르셨습니다.\n(갈 4:4-7, 롬 8:14-17, 벧전 2:9, 히 10:24-25)",
        "하나님은 우리를 복음으로 서로 환대하며 나누는 공동체로 세우셨습니다.\n(창 1:27, 31, 행 2:42-47, 롬 12:13)",
        "하나님은 우리를 세상에서 자기비움과 자기부정으로 자유롭고 거룩하게 하십니다.\n(행 1:8, 롬 8:28, 벧전 2:11-12, 렘 29:4-7, 빌 2:5-8, 눅 9:23)"
      ]
    },
    {
      "title": "Praise & Worship",
      "kicker": "경배와 찬양",
      "lines": [
        "다같이"
      ]
    },
    {
      "title": "Represent Praying",
      "kicker": "대표기도",
      "lines": [
        "맡은이"
      ]
    },
    {
      "title": "Song of Offering",
      "kicker": "헌신찬양",
      "lines": [
        "다같이"
      ]
    },
    {
      "title": "Scripture Reading",
      "kicker": "말씀읽기",
      "lines": [
        "고린도전서 15:1–11",
        "EKODI 2026-11 공통본문"
      ]
    },
    {
      "title": "받은 복음 · 가장 중요한 것",
      "kicker": "고린도전서 15장 배경",
      "lines": [
        "11–14장: 예배와 은사 → 15장: 부활의 복음",
        "‘받아 전한’ 복음 · 바울 이전 교회의 신앙 요약(3–5절)",
        "죽으심 · 묻히심 · 살아나심 · 나타나심 — 성경대로"
      ]
    },
    {
      "title": "내가 받은 복음을\n전하다",
      "kicker": "Sermon",
      "lines": [
        "2026.11.29 · 고린도전서 15:1–11"
      ],
      "cover": true,
      "sermonTitle": true
    },
    {
      "title": "나는 무엇 위에 서 있습니까?",
      "kicker": "말씀나눔",
      "lines": [
        "흔들리는 고린도 교회에게 바울은\n새로운 지식이 아니라 처음 복음을 말합니다.",
        "너희가 받았고, 그 위에 서 있으며,\n그것으로 구원받는 복음입니다.",
        "대림절, 우리는 그 복음 위에서\n오실 주님을 기다립니다."
      ]
    },
    {
      "title": "1 | 받은 복음 위에 서다",
      "kicker": "말씀나눔",
      "lines": [
        "복음은 우리가 만든 것이 아니라\n은혜로 받은 선물입니다.",
        "받은 복음 위에 설 때\n흔들리지 않습니다.",
        "그 복음을 굳게 붙들 때\n복음이 우리를 구원합니다."
      ]
    },
    {
      "title": "2 | 가장 중요한 것, 죽으심과 부활",
      "kicker": "말씀나눔",
      "lines": [
        "그리스도께서 우리 죄를 위해 죽으시고\n묻히셨다가 사흘 만에 다시 살아나셨습니다.",
        "게바와 열두 제자, 오백여 형제가\n살아나신 주님을 만났습니다.",
        "우리의 믿음은\n이 증언의 사슬 끝에 서 있습니다."
      ]
    },
    {
      "title": "3 | 은혜가 나를 전하는 사람으로",
      "kicker": "말씀나눔",
      "lines": [
        "교회를 박해하던 바울은\n자신을 가장 작은 사도라 부릅니다.",
        "지금의 나는\n하나님의 은혜로 된 것입니다.",
        "그 은혜가 헛되지 않아\n받은 복음을 다시 전하게 합니다."
      ]
    },
    {
      "title": "그리스도의 복음 | 오셨고, 다시 오실 주님",
      "kicker": "말씀나눔",
      "lines": [
        "하나님은 약속대로 아들을 보내셨고\n그 아들은 우리를 위해 죽고 다시 사셨습니다.",
        "첫 오심의 복음이\n다시 오실 날의 소망이 됩니다.",
        "그래서 우리는\n기다리며 전합니다."
      ]
    },
    {
      "title": "함께 나눌 세 가지 질문",
      "kicker": "말씀나눔",
      "lines": [
        "내가 처음 받은 복음은 무엇이었고,\n지금 나는 그 복음 위에 서 있습니까?",
        "그리스도의 죽으심과 부활은\n이번 대림절 나의 기다림에 어떤 소망이 됩니까?",
        "은혜로 ‘지금의 나’가 된 이야기를\n이번 주 누구와 나눌 수 있습니까?"
      ]
    },
    {
      "title": "공동체의 응답",
      "kicker": "인도자 · 회중",
      "lines": [
        "우리가 받은 복음 위에 / 흔들리지 않고 서겠습니다",
        "죽으시고 살아나신 주님을 / 가장 중요한 소식으로 붙들겠습니다",
        "은혜로 된 지금의 나로 / 헛되지 않게 수고하겠습니다",
        "다시 오실 주님을 기다리며 / 받은 복음을 전하겠습니다",
        "다함께 / 말씀대로 살아내고 살려내겠습니다"
      ]
    },
    {
      "title": "이번 주 실천 한 걸음",
      "kicker": "말씀나눔",
      "lines": [
        "이번 주 한 사람에게\n내가 받은 복음을 5분 동안 나눕니다.",
        "날마다 공통본문을 읽으며\n오실 주님을 기다리는 기도를 드립니다.",
        "상대의 형편과 동의를 존중합니다."
      ]
    },
    {
      "title": "Response Sharing & Praying",
      "kicker": "나눔기도",
      "lines": [
        "다같이"
      ]
    },
    {
      "title": "Song of Commitment",
      "kicker": "결단찬양",
      "lines": [
        "다같이"
      ]
    },
    {
      "title": "이번 주 매일묵상 · 11/29–12/05",
      "kicker": "EKODI 공통본문",
      "lines": [
        "일 11/29 고린도전서 15:1–11 · 월 11/30 고린도전서 15:12–22",
        "화 12/01 확인필요 · 수 12/02 확인필요",
        "목 12/03 확인필요 · 금 12/04 확인필요",
        "토 12/05 확인필요 · 12월 공통본문 등록 필요"
      ]
    },
    {
      "title": "Community Announce",
      "kicker": "교회소식",
      "lines": [
        "오늘은 대림절 첫째 주일 · 교회력의 새해가 시작됩니다",
        "오신 주님을 기억하며 다시 오실 주님을 기다립니다",
        "우리가 받은 복음을 이번 주 한 사람에게 전해 봅시다",
        "온라인 예배 다국어 자막(영어·중국어·일본어·베트남어·몽골어)"
      ]
    },
    {
      "title": "주기도문",
      "kicker": "THE LORD'S PRAYER",
      "lines": [
        "한국어 · English · 中文 · 日本語 · Tiếng Việt",
        "주기도문 5개 언어 전문 수록"
      ]
    },
    {
      "title": "주기도문 | 한국어",
      "kicker": "THE LORD'S PRAYER",
      "lines": [
        "하늘에 계신 우리 아버지,",
        "아버지의 이름을 거룩하게 하시며 아버지의 나라가 오게 하시며",
        "아버지의 뜻이 하늘에서와 같이 땅에서도 이루어지게 하소서.",
        "오늘 우리에게 일용할 양식을 주시고",
        "우리가 우리에게 잘못한 사람을 용서하여 준 것 같이",
        "우리 죄를 용서하여 주시고 우리를 시험에 빠지지 않게 하시고",
        "악에서 구하소서.",
        "나라와 권능과 영광이 영원히 아버지의 것입니다. 아멘."
      ]
    },
    {
      "title": "주기도문 | English",
      "kicker": "THE LORD'S PRAYER",
      "lines": [
        "Our Father which art in heaven,",
        "Hallowed be thy name. Thy kingdom come.",
        "Thy will be done in earth, as it is in heaven.",
        "Give us this day our daily bread.",
        "And forgive us our debts, as we forgive our debtors.",
        "And lead us not into temptation, but deliver us from evil:",
        "For thine is the kingdom, and the power, and the glory, for ever. Amen."
      ]
    },
    {
      "title": "주기도문 | 中文",
      "kicker": "THE LORD'S PRAYER",
      "lines": [
        "我们在天上的父：",
        "愿人都尊你的名为圣。愿你的国降临。",
        "愿你的旨意行在地上，如同行在天上。",
        "我们日用的饮食，今日赐给我们。",
        "免我们的债，如同我们免了人的债。",
        "不叫我们遇见试探，救我们脱离凶恶。",
        "因为国度、权柄、荣耀，全是你的，直到永远。阿们。"
      ]
    },
    {
      "title": "주기도문 | 日本語",
      "kicker": "THE LORD'S PRAYER",
      "lines": [
        "天にまします我らの父よ、",
        "願わくは御名をあがめさせたまえ。御国を来たらせたまえ。",
        "御心の天になるごとく、地にもなさせたまえ。",
        "我らの日用の糧を、今日も与えたまえ。",
        "我らに罪を犯す者を我らが赦すごとく、我らの罪をも赦したまえ。",
        "我らを試みにあわせず、悪より救い出したまえ。",
        "国と力と栄えとは、限りなく汝のものなればなり。アーメン。"
      ]
    },
    {
      "title": "주기도문 | Tiếng Việt",
      "kicker": "THE LORD'S PRAYER",
      "lines": [
        "Lạy Cha chúng con ở trên trời,",
        "danh Cha được thánh. Nước Cha được đến.",
        "Ý Cha được nên, ở đất như trời.",
        "Xin cho chúng con hôm nay đồ ăn đủ ngày.",
        "Xin tha tội lỗi cho chúng con, như chúng con cũng tha kẻ phạm tội nghịch cùng chúng con.",
        "Xin chớ để chúng con bị cám dỗ, mà cứu chúng con khỏi điều ác.",
        "Vì nước, quyền, vinh hiển đều thuộc về Cha đời đời. A-men."
      ]
    }
  ];


  // Korean is the canonical sermon title. Translation buttons only alter this
  // title on the dedicated sermon slide; no other liturgical slide is translated.
  const SERMON_TITLES=Object.freeze({
    ko:'내가 받은 복음을\n전하다',
    en:'Passing On the Gospel I Received.',
    zh:'传扬我所领受的福音。',
    ja:'私が受けた福音を伝える。',
    vi:'Truyền lại Tin Lành tôi đã nhận.'
  });
  const validTitleLanguage=value=>Object.hasOwn(SERMON_TITLES,value)?value:'ko';
  let sermonLanguage='ko';

  const storageKey='ekodi:church:worship:2026-11-29:slide';
  let slideIndex=0;
  let blackout=false;
  try {
    const saved=JSON.parse(localStorage.getItem(storageKey)||'null');
    if(saved && Number.isInteger(saved.slide) && saved.slide>=0 && saved.slide<slides.length) slideIndex=saved.slide;
    if(saved && saved.blackout===true) blackout=true;
    if(saved) sermonLanguage=validTitleLanguage(saved.sermonLanguage);
  } catch { /* Blocked/private storage starts safely from the first slide. */ }
  const slideEl=document.querySelector('#slide');
  const kickerEl=document.querySelector('#slide-kicker');
  const titleEl=document.querySelector('#slide-title');
  const bodyEl=document.querySelector('#slide-body');
  const numberEl=document.querySelector('#slide-number');
  const progressEl=document.querySelector('#progress');
  const selectEl=document.querySelector('#slide-picker');
  const sermonLangNav=document.querySelector('#sermon-title-languages');

  function render(){
    const data=slides[slideIndex];
    const displayedTitle=data.sermonTitle?SERMON_TITLES[sermonLanguage]:data.title;
    titleEl.textContent=displayedTitle;
    kickerEl.textContent=data.kicker;
    if(sermonLangNav){
      sermonLangNav.hidden=!data.sermonTitle;
      sermonLangNav.querySelectorAll('[data-sermon-lang]').forEach(button=>{
        button.setAttribute('aria-pressed',String(data.sermonTitle&&button.dataset.sermonLang===sermonLanguage));
      });
    }
    bodyEl.replaceChildren();
    for(const line of data.lines){const p=document.createElement('p');p.textContent=line;bodyEl.append(p);}
    // Original Google Slides page rendered as an image; the text above stays
    // in the DOM for screen readers, search and the operator picker.
    let picture=slideEl.querySelector('.slide-picture');
    if(data.image){
      if(!picture){picture=document.createElement('img');picture.className='slide-picture';picture.decoding='async';slideEl.prepend(picture);}
      picture.src=data.image;picture.alt=[data.title,data.kicker,...data.lines].join(' · ');
      const next=slides[slideIndex+1];if(next&&next.image){const pre=new Image();pre.src=next.image;}
    }else if(picture){picture.remove();}
    slideEl.dataset.image=data.image?'true':'false';
    slideEl.dataset.titleSlide=data.cover?'true':'false';
    slideEl.dataset.blackout=blackout?'true':'false';
    numberEl.textContent=(slideIndex+1)+' / '+slides.length;
    progressEl.textContent=(slideIndex+1)+' / '+slides.length;
    document.querySelectorAll('#blackout,#operator-blackout').forEach(button=>button.setAttribute('aria-pressed',String(blackout)));
    if(selectEl)selectEl.value=String(slideIndex);
    document.title=displayedTitle.replaceAll('\n',' ')+' | 에코디교회';
  }
  function broadcastState(){
    const state=JSON.stringify({slide:slideIndex,blackout,sermonLanguage});
    try {localStorage.setItem(storageKey,state);}catch{/* Slide still works if storage is blocked. */}
    if(channel) try{channel.postMessage({slide:slideIndex,blackout,sermonLanguage});}catch{}
  }
  function goTo(index){
    slideIndex=Math.min(slides.length-1,Math.max(0,index));
    render();broadcastState();
  }
  function toggleBlackout(){blackout=!blackout;render();broadcastState();}
  function applyState(saved){
    if(!saved||!Number.isInteger(saved.slide)||saved.slide<0||saved.slide>=slides.length)return;
    slideIndex=saved.slide;blackout=saved.blackout===true;
    sermonLanguage=validTitleLanguage(saved.sermonLanguage);
    render();
  }
  let channel=null;
  if(typeof BroadcastChannel==='function'){
    try{channel=new BroadcastChannel('ekodi-church-worship-20261129');channel.onmessage=event=>applyState(event.data);}catch{}
  }
  window.addEventListener('storage',event=>{
    if(event.key!==storageKey||!event.newValue)return;
    try{applyState(JSON.parse(event.newValue));}catch{}
  });
  if(selectEl){
    slides.forEach((data,index)=>{const option=document.createElement('option');option.value=String(index);option.textContent=(index+1)+'. '+data.title.replaceAll('\n',' ');selectEl.append(option);});
    selectEl.addEventListener('change',()=>goTo(Number(selectEl.value)));
  }
  for(const [id,callback] of Object.entries({
    'previous':()=>goTo(slideIndex-1),'next':()=>goTo(slideIndex+1),
    'operator-prev':()=>goTo(slideIndex-1),'operator-next':()=>goTo(slideIndex+1),
    'blackout':toggleBlackout,'operator-blackout':toggleBlackout,
    'fullscreen':()=>{if(document.fullscreenElement){document.exitFullscreen?.();}else{document.querySelector('#presentation').requestFullscreen?.();}},
    'print-bulletin':()=>window.print(),
    'open-stage':()=>window.open('?view=stage','ekodi-church-stage'),
    'open-vertical':()=>window.open('?view=vertical','ekodi-church-vertical'),
    'copy-stage-url':async()=>{
      const url=new URL(location.href);url.search='?view=stage';
      try{await navigator.clipboard.writeText(url.href);}catch{window.prompt('발표 화면 주소를 복사하세요',url.href);}
    }
  })){
    document.getElementById(id)?.addEventListener('click',callback);
  }

  sermonLangNav?.querySelectorAll('[data-sermon-lang]').forEach(button=>{
    button.addEventListener('click',()=>{
      if(!slides[slideIndex]?.sermonTitle)return;
      sermonLanguage=validTitleLanguage(button.dataset.sermonLang);
      render();
      broadcastState(); // Keep presenter, stage and 9:16 view synchronized.
    });
  });

  document.addEventListener('keydown',event=>{
    const tag=event.target?.tagName;
    if(event.altKey||event.metaKey||event.ctrlKey||['INPUT','SELECT','TEXTAREA','BUTTON'].includes(tag))return;
    if(view==='bulletin')return;
    let fn;
    if(['ArrowRight','PageDown',' '].includes(event.key))fn=()=>goTo(slideIndex+1);
    if(['ArrowLeft','PageUp'].includes(event.key))fn=()=>goTo(slideIndex-1);
    if(event.key==='Home')fn=()=>goTo(0);
    if(event.key==='End')fn=()=>goTo(slides.length-1);
    if(event.key.toLowerCase()==='b')fn=toggleBlackout;
    if(event.key.toLowerCase()==='f')fn=()=>{
      if(document.fullscreenElement)document.exitFullscreen?.();
      else document.querySelector('#presentation').requestFullscreen?.();
    };
    if(fn){event.preventDefault();fn();}
  });
  render();

  // Bulletin sheets keep the A4-landscape layout and scale proportionally so a
  // whole page always fits one screen (window resize and browser zoom alike).
  function fitSheets(){
    const top=(document.querySelector('#topbar')?.offsetHeight||0)+24;
    document.querySelectorAll('.bp-frame').forEach(frame=>{
      const avail=frame.parentElement.clientWidth;
      const scale=Math.min(avail/1123,Math.max(.2,(window.innerHeight-top)/794));
      frame.style.setProperty('--bp-scale',String(scale));
      frame.style.width=Math.floor(1123*scale)+'px';frame.style.height=Math.floor(794*scale)+'px';frame.style.margin='0 auto';
    });
  }
  fitSheets();window.addEventListener('resize',fitSheets);
  if(window.ResizeObserver){const ro=new ResizeObserver(fitSheets);document.querySelectorAll('.bp-pages').forEach(el=>ro.observe(el));}
})();