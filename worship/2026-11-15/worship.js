(() => {
  'use strict';
  const allowedViews = new Set(['bulletin','operator','stage','vertical']);
  const query = new URLSearchParams(location.search);
  const view = allowedViews.has(query.get('view')) ? query.get('view') : 'bulletin';
  document.body.dataset.view = view;
  document.querySelectorAll('[data-mode-link]').forEach(link => {
    if (link.dataset.modeLink === view) link.setAttribute('aria-current','page');
  });

  // Public, fixed data derived from the 2026-11-15 worship preparation packet.
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
        "복음 안에서 우리를 자유하게 하신 하나님이 이웃을 섬기는 자리로 우리를 불러 예배에 초대하십니다"
      ]
    },
    {
      "title": "Community Confession",
      "kicker": "공동고백",
      "lines": [
        "그리스도 안에서 받은 자유를 이웃을 위해 쓰도록 부르신 하나님 앞에 공동체가 고백합니다"
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
        "고린도전서 9:19–27",
        "EKODI 2026-11 공통본문"
      ]
    },
    {
      "title": "자유와 권리 · 복음을 위해 내려놓는 바울",
      "kicker": "고린도전서 9장 배경",
      "lines": [
        "8장: 우상 제물과 약한 형제 → 9장: 바울이 쓰지 않은 권리",
        "9:1–18: 생활비를 받을 권리를 내려놓고 값없이 전한 복음",
        "고린도 가까이 열린 이스트미아 경기 · 썩을 관과 썩지 않을 관"
      ]
    },
    {
      "title": "모든 사람에게\n모든 것이 되어",
      "kicker": "Sermon",
      "lines": [
        "All Things to All People.",
        "向什么样的人，就作什么样的人。",
        "すべての人に、すべてのものとなって。",
        "Trở nên mọi sự cho mọi người."
      ],
      "cover": true
    },
    {
      "title": "すべての人に、すべてのものとなって。",
      "kicker": "SERMON · 日本語",
      "lines": [
        "모든 사람에게 모든 것이 되어",
        "설교 제목 · 화면을 보고 함께 읽기"
      ]
    },
    {
      "title": "Trở nên mọi sự cho mọi người.",
      "kicker": "SERMON · Tiếng Việt",
      "lines": [
        "모든 사람에게 모든 것이 되어",
        "설교 제목 · 화면을 보고 함께 읽기"
      ]
    },
    {
      "title": "내 자유는 누구를 위한 것입니까?",
      "kicker": "말씀나눔",
      "lines": [
        "내 시간, 내 방식, 내 권리.\n우리는 자유를 좋아합니다.",
        "바울은 자유를 버리라 하지 않고\n자유를 쓰는 길을 보여 줍니다.",
        "한 사람이라도 더 얻기 위해\n모든 사람의 자리로 다가갑니다."
      ]
    },
    {
      "title": "1 | 자유한 사람이 스스로 종이 됩니다",
      "kicker": "말씀나눔",
      "lines": [
        "바울은 누구에게도 매이지 않은\n자유인이었습니다.",
        "그러나 더 많은 사람을 얻으려고\n스스로 모든 사람의 종이 되었습니다.",
        "복음 안의 자유는\n섬길 수 있는 자유입니다."
      ]
    },
    {
      "title": "2 | 복음을 위해 다른 이의 자리로 들어갑니다",
      "kicker": "말씀나눔",
      "lines": [
        "유대인에게는 유대인처럼,\n약한 이에게는 약한 사람처럼.",
        "다가가는 방식은 바꾸어도\n그리스도의 법 아래 머뭅니다.",
        "복음은 그대로, 다가가는 길은\n그 사람의 자리에서 시작합니다."
      ]
    },
    {
      "title": "3 | 썩지 않을 상을 향해 절제하며 달립니다",
      "kicker": "말씀나눔",
      "lines": [
        "경기하는 이들도 썩을 관을 위해\n모든 일에 절제합니다.",
        "목표 없이 달리지 않고\n허공을 치듯 싸우지 않습니다.",
        "남을 세운 뒤 나도 무너지지 않도록\n내 몸과 삶을 다스립니다."
      ]
    },
    {
      "title": "그리스도의 복음 | 종이 되어 오신 주님",
      "kicker": "말씀나눔",
      "lines": [
        "하나님의 본체이신 그리스도께서\n종의 모습으로 우리 자리에 오셨습니다.",
        "섬김을 받으러 오지 않고\n섬기러 오셨습니다.",
        "그 사랑이 우리를 자유하게 하고\n섬기게 합니다."
      ]
    },
    {
      "title": "함께 나눌 세 가지 질문",
      "kicker": "말씀나눔",
      "lines": [
        "이웃을 위해 내려놓을 수 있는\n나의 자유나 권리는 무엇입니까?",
        "나와 다른 이웃의 자리로\n무엇부터 다가갈 수 있습니까?",
        "이번 주 절제하며 바꾸고 싶은\n한 가지 습관은 무엇입니까?"
      ]
    },
    {
      "title": "공동체의 응답",
      "kicker": "인도자 · 회중",
      "lines": [
        "그리스도 안에서 받은 자유를 / 이웃을 섬기는 데 쓰겠습니다",
        "나와 다른 이웃 앞에서 / 먼저 그의 자리로 다가가겠습니다",
        "약한 지체 곁에서 / 같은 눈높이로 함께 걷겠습니다",
        "썩지 않을 상을 바라보며 / 절제하며 끝까지 달리겠습니다",
        "다함께 / 말씀대로 살아내고 살려내겠습니다"
      ]
    },
    {
      "title": "이번 주 실천 한 걸음",
      "kicker": "말씀나눔",
      "lines": [
        "언어·세대·문화가 다른 이웃 한 사람에게\n그의 말로 먼저 인사를 건넵니다.",
        "습관 하나를 일주일 절제하고\n그 시간을 기도와 이웃에게 드립니다.",
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
      "title": "이번 주 매일묵상 · 11/15–11/21",
      "kicker": "EKODI 2026-11 공통본문",
      "lines": [
        "일 11/15 고린도전서 9:19–27 · 월 11/16 고린도전서 10:1–13",
        "화 11/17 고린도전서 10:14–22 · 수 11/18 고린도전서 10:23–11:1",
        "목 11/19 고린도전서 11:2–16 · 금 11/20 고린도전서 11:17–26",
        "토 11/21 고린도전서 11:27–34"
      ]
    },
    {
      "title": "Community Announce",
      "kicker": "교회소식",
      "lines": [
        "오늘 주일모임 후 공동의회 · 세례교인 모두 참석",
        "안건: 2025 결산·2026 예산 승인 · 교회 정관 제정",
        "에코디비즈 교회 공간 일부 무상사용 승인",
        "2027 목포노회 동반성장 자립화교회 지원 신청"
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

  const storageKey='ekodi:church:worship:2026-11-15:slide';
  let slideIndex=0;
  let blackout=false;
  try {
    const saved=JSON.parse(localStorage.getItem(storageKey)||'null');
    if(saved && Number.isInteger(saved.slide) && saved.slide>=0 && saved.slide<slides.length) slideIndex=saved.slide;
    if(saved && saved.blackout===true) blackout=true;
  } catch { /* Blocked/private storage starts safely from the first slide. */ }
  const slideEl=document.querySelector('#slide');
  const kickerEl=document.querySelector('#slide-kicker');
  const titleEl=document.querySelector('#slide-title');
  const bodyEl=document.querySelector('#slide-body');
  const numberEl=document.querySelector('#slide-number');
  const progressEl=document.querySelector('#progress');
  const selectEl=document.querySelector('#slide-picker');

  function render(){
    const data=slides[slideIndex];
    titleEl.textContent=data.title;
    kickerEl.textContent=data.kicker;
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
    document.title=data.title.replaceAll('\n',' ')+' | 에코디교회';
  }
  function broadcastState(){
    const state=JSON.stringify({slide:slideIndex,blackout});
    try {localStorage.setItem(storageKey,state);}catch{/* Slide still works if storage is blocked. */}
    if(channel) try{channel.postMessage({slide:slideIndex,blackout});}catch{}
  }
  function goTo(index){
    slideIndex=Math.min(slides.length-1,Math.max(0,index));
    render();broadcastState();
  }
  function toggleBlackout(){blackout=!blackout;render();broadcastState();}
  function applyState(saved){
    if(!saved||!Number.isInteger(saved.slide)||saved.slide<0||saved.slide>=slides.length)return;
    slideIndex=saved.slide;blackout=saved.blackout===true;render();
  }
  let channel=null;
  if(typeof BroadcastChannel==='function'){
    try{channel=new BroadcastChannel('ekodi-church-worship-20261115');channel.onmessage=event=>applyState(event.data);}catch{}
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
  document.addEventListener('keydown',event=>{
    const tag=event.target?.tagName;
    if(event.altKey||event.metaKey||event.ctrlKey||['INPUT','SELECT','TEXTAREA'].includes(tag))return;
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