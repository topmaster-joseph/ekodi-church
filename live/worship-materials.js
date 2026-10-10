(() => {
  'use strict';
  const $=id=>document.getElementById(id);
  const MODES=new Set(['video','video-ppt','video-bulletin','all','ppt','bulletin','ppt-bulletin']);
  const query=new URLSearchParams(location.search);
  const requestedDate=query.get('date')||'2026-10-11';
  const date=/^20\d{2}-\d{2}-\d{2}$/.test(requestedDate)?requestedDate:'2026-10-11';
  const materialPath='/ekodichurch/worship/'+date+'/materials.json';
  let packet=null;
  let slideIndex=0;
  let mode='video';
  try{const preference=sessionStorage.getItem('ekodi:church:viewer-material-mode');if(MODES.has(preference))mode=preference;}catch{}
  const status=(message)=>{if($('viewerMaterialStatus'))$('viewerMaterialStatus').textContent=message;};
  const make=(tag,text='',className='')=>{const element=document.createElement(tag);element.textContent=String(text);if(className)element.className=className;return element;};
  function showMode(next){
    if(!MODES.has(next))return;
    mode=next;
    const video=['video','video-ppt','video-bulletin','all'].includes(mode);
    const slides=['ppt','video-ppt','ppt-bulletin','all'].includes(mode);
    const bulletin=['bulletin','video-bulletin','ppt-bulletin','all'].includes(mode);
    $('viewerContentLayout').dataset.materialLayout=mode;
    $('viewerVideoStage').classList.toggle('hidden',!video);
    $('viewerWorshipSlides').classList.toggle('hidden',!slides);
    $('viewerWorshipBulletin').classList.toggle('hidden',!bulletin);
    document.querySelectorAll('[data-viewer-material-mode]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.viewerMaterialMode===mode)));
    try{sessionStorage.setItem('ekodi:church:viewer-material-mode',mode)}catch{}
    if(!packet&&(slides||bulletin))status('예배자료 연결 확인 중 · 영상은 계속 시청할 수 있습니다.');
  }
  function renderSlide(){
    if(!packet?.slides?.length)return;
    const slide=packet.slides[slideIndex];
    $('viewerSlideKicker').textContent=slide.kicker||'';
    $('viewerSlideTitle').textContent=slide.title||'';
    $('viewerSlideLines').replaceChildren(...(Array.isArray(slide.lines)?slide.lines:[]).map(line=>make('p',line)));
    $('viewerSlideCount').textContent=(slideIndex+1)+' / '+packet.slides.length;
  }
  function moveSlide(by){
    if(!packet?.slides?.length)return;
    slideIndex=Math.max(0,Math.min(packet.slides.length-1,slideIndex+by));
    renderSlide();
  }
  function renderBulletin(){
    if(!packet)return;
    const root=$('viewerBulletinBody');
    const fragment=document.createDocumentFragment();
    fragment.append(make('h3',packet.title||'주일예배'));
    fragment.append(make('p',(packet.date||'')+' · '+(packet.scripture||''),'worship-material-scripture'));
    if(packet.preacher)fragment.append(make('p','말씀나눔 · '+packet.preacher));
    const list=make('ol','','viewer-bulletin-order');
    for(const row of Array.isArray(packet.order)?packet.order:[]){
      if(!Array.isArray(row)||row.length<2)continue;
      const li=make('li');
      li.append(make('span',row[0]||''),make('small',row[1]||''));
      list.append(li);
    }
    fragment.append(list);
    fragment.append(make('h3','주간 매일묵상'));
    const devotions=make('ul','','viewer-bulletin-devotions');
    for(const pair of Array.isArray(packet.devotion)?packet.devotion:[]){
      if(!Array.isArray(pair)||pair.length<2)continue;
      devotions.append(make('li',pair.join(' · ')));
    }
    fragment.append(devotions);
    root.replaceChildren(fragment);
    $('viewerBulletinLink').href='/ekodichurch/worship/'+date+'/';
  }
  document.querySelectorAll('[data-viewer-material-mode]').forEach(button=>{
    button.addEventListener('click',()=>showMode(button.dataset.viewerMaterialMode));
  });
  $('viewerSlidePrev')?.addEventListener('click',()=>moveSlide(-1));
  $('viewerSlideNext')?.addEventListener('click',()=>moveSlide(1));
  showMode(mode);

  async function loadPacket(){
    try{
      const response=await fetch(materialPath,{cache:'no-store',credentials:'omit'});
      if(!response.ok)throw new Error('HTTP '+response.status);
      const result=await response.json();
      if(result?.schema!=='ekodi.worship.materials.v1'||result?.site!=='ekodichurch'||result.date!==date||!Array.isArray(result.slides)||result.slides.length<1||result.slides.length>120)
        throw new Error('material_schema_invalid');
      packet=result;
      renderSlide();renderBulletin();
      status((packet.date||date)+' 주일예배 · PPT '+packet.slides.length+'장과 주보 준비됨');
    }catch(error){
      status('해당 날짜 예배자료를 불러올 수 없습니다. 영상 시청은 계속 가능합니다.');
      $('viewerSlideTitle').textContent='자료를 확인해 주세요';
      $('viewerSlideLines').replaceChildren(make('p','방송 중인 날짜의 PPT가 아직 공개되지 않았습니다.'));
      $('viewerBulletinBody').replaceChildren(make('p','예배 주보가 아직 공개되지 않았습니다.'));
      console.warn('[EKODI Live worship materials]',error?.message||error);
    }
  }
  void loadPacket();
})();
