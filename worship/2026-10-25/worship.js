(() => {
  'use strict';
  const allowedViews = new Set(['bulletin','operator','stage','vertical']);
  const query = new URLSearchParams(location.search);
  const view = allowedViews.has(query.get('view')) ? query.get('view') : 'bulletin';
  document.body.dataset.view = view;
  document.querySelectorAll('[data-mode-link]').forEach(link => {
    if (link.dataset.modeLink === view) link.setAttribute('aria-current','page');
  });

  // Public, fixed data derived from the 2026-10-25 worship preparation packet.
  // No viewer data, platform tokens, stream keys or unpublished member content.
  const slides = [
    {
      "title": "멀리\n서 있던 날",
      "kicker": "2026.10.25 · 주일모임 · 오전 11시",
      "lines": [
        "오바댜 1:10–16",
        "말씀나눔 정찬균 목사"
      ]
    },
    {
      "title": "Community Sunday Worship",
      "kicker": "예배순서",
      "lines": [
        "예배부름 · 공동고백 · 경배찬양",
        "대표기도(담당 확인 중) · 헌신찬양",
        "말씀읽기 · 말씀나눔",
        "나눔기도 · 결단찬양 · 교회소식 · 주기도문"
      ]
    },
    {
      "title": "우리의 공동체 고백",
      "kicker": "EKODI CHURCH",
      "lines": [
        "하나님의 부르심으로 모였습니다.",
        "복음으로 서로 환대하고 나눕니다.",
        "삶에서 섬김과 회복을 살아냅니다."
      ]
    },
    {
      "title": "오늘의 공통본문",
      "kicker": "SCRIPTURE READING",
      "lines": [
        "오바댜 1:10–16",
        "EKODI 공통본문 레지스트리 2026-10"
      ]
    },
    {
      "title": "형제에게\n행한 일",
      "kicker": "오바댜 1:10",
      "lines": [
        "에돔과 야곱은 한 뿌리에서 나온 형제였습니다.",
        "가장 가까운 이에게 행한 폭력이 수치가 됩니다.",
        "관계가 가까울수록 책임도 깊어집니다."
      ]
    },
    {
      "title": "멀리\n서 있던 날",
      "kicker": "오바댜 1:11",
      "lines": [
        "이방인이 성문에 들어올 때 에돔은 멀리서 바라보았습니다.",
        "방관은 중립이 아니라 가담이 됩니다.",
        "하나님은 그 자리를 그들과 같은 자리로 보십니다."
      ]
    },
    {
      "title": "바라보다가\n즐거워하다",
      "kicker": "오바댜 1:12",
      "lines": [
        "형제의 불행을 구경하고 기뻐하며 큰소리칩니다.",
        "마음의 방관이 말의 조롱으로 자랍니다.",
        "남의 고난 앞에서 내 마음은 어디에 서 있습니까?"
      ]
    },
    {
      "title": "성문 안으로,\n재물 위로",
      "kicker": "오바댜 1:13",
      "lines": [
        "환난의 날에 들어가 빼앗고 차지합니다.",
        "위기를 기회로 삼는 탐욕을 경계합니다.",
        "약한 이의 무너짐을 내 이익으로 삼지 않습니다."
      ]
    },
    {
      "title": "갈림길을\n막아선 손",
      "kicker": "오바댜 1:14",
      "lines": [
        "도망하는 이를 막고 남은 자를 넘겨줍니다.",
        "갈림길에 선 사람의 선택이 생명을 가릅니다.",
        "우리 곁의 갈림길에 선 이웃은 누구입니까?"
      ]
    },
    {
      "title": "행한 대로\n돌아오는 날",
      "kicker": "오바댜 1:15",
      "lines": [
        "여호와의 날은 모든 민족에게 가까웠습니다.",
        "행한 대로 돌아온다는 공의의 선언",
        "심판의 말씀은 지금 돌이키라는 초대입니다."
      ]
    },
    {
      "title": "잔은 결국\n모두 앞에",
      "kicker": "오바댜 1:16",
      "lines": [
        "거룩한 산에서 마신 잔이 열방에 이릅니다.",
        "공의는 미루어질 수 있어도 사라지지 않습니다.",
        "그 끝에는 구원의 산이 서 있습니다(17절)."
      ]
    },
    {
      "title": "예수 그리스도,\n멀리 서지 않으신 분",
      "kicker": "GOSPEL",
      "lines": [
        "강도 만난 이웃 곁으로 다가오신 그리스도",
        "우리가 마셔야 할 잔을 대신 마신 십자가",
        "방관자였던 우리를 이웃으로 부르십니다."
      ]
    },
    {
      "title": "에코디의 네 가지\n공동체적 응답",
      "kicker": "EKODI MISSION",
      "lines": [
        "에클레시아 · 함께 듣고 돌이키기",
        "코이노니아 · 형제의 날에 곁에 서기",
        "디아스포라 · 갈림길의 이웃에게 길 열기",
        "희년 · 빼앗긴 자리를 회복으로 돌려주기"
      ]
    },
    {
      "title": "함께 나눌\n세 가지 질문",
      "kicker": "공동체 나눔",
      "lines": [
        "나는 누구의 어려움 앞에서 멀리 서 있었습니까?",
        "내가 지나쳐 온 갈림길의 이웃은 누구입니까?",
        "이번 주 한 사람 곁에 서는 일은 무엇입니까?"
      ]
    },
    {
      "title": "이번 주 매일묵상",
      "kicker": "2026.10.25–10.31",
      "lines": [
        "10/25 일 옵 1:10–16 · 10/26 월 옵 1:17–21",
        "10/27 화 고전 1:1–9 · 10/28 수 고전 1:10–17",
        "10/29 목 고전 1:18–25 · 10/30 금 고전 1:26–2:5",
        "10/31 토 고전 2:6–16"
      ]
    },
    {
      "title": "곁에 서는\n교회가 되겠습니다",
      "kicker": "마침기도",
      "lines": [
        "공의로우신 하나님, 멀리 서 있던 우리를 용서하소서.",
        "형제의 날에 곁에 서는 용기를 주소서.",
        "말과 언어가 달라도 한 몸으로 듣게 하소서.",
        "예수 그리스도의 이름으로 기도합니다. 아멘."
      ]
    }
  ];

  const storageKey='ekodi:church:worship:2026-10-25:slide';
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
    try{channel=new BroadcastChannel('ekodi-church-worship-20261025');channel.onmessage=event=>applyState(event.data);}catch{}
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
})();