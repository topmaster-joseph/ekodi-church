(() => {
  const endpoint='https://api.ekodi.kr/api/partner-news/public?tenant=ekodi-church&service=church&limit=6';
  const host=document.getElementById('partner-news-feed');
  const status=document.getElementById('partner-news-status');
  if(!host)return;

  const esc=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const text=value=>String(value??'').trim();
  function sourceLink(item){
    if(!item.sourceUrl)return '';
    const label=esc(item.sourceLabel||'원문 보기');
    return `<a class="partner-news-source" href="${esc(item.sourceUrl)}" target="_blank" rel="noreferrer noopener">${label} ↗</a>`;
  }
  function card(item){
    const date=esc(item.publishedOn||String(item.publishedAt||'').slice(0,10));
    const summary=esc(item.summary||item.body||'');
    const image=item.imageUrl?`<div class="partner-news-image"><img src="${esc(item.imageUrl)}" alt="" loading="lazy" referrerpolicy="no-referrer"></div>`:'';
    return `<article class="partner-news-card reveal">
      ${image}
      <div class="partner-news-card-body">
        <div class="partner-news-meta"><span>${esc(item.partnerName)}</span>${date?`<time datetime="${date}">${date}</time>`:''}</div>
        <h3>${esc(item.title)}</h3>
        ${summary?`<p>${summary}</p>`:''}
        ${sourceLink(item)}
      </div>
    </article>`;
  }
  function render(items){
    const published=(Array.isArray(items)?items:[]).filter(item=>item&&item.status==='PUBLISHED');
    if(!published.length){
      host.innerHTML='<p class="partner-news-empty">공개된 협력 소식이 준비되면 이곳에 안내합니다.</p>';
      status.textContent='공개 소식 준비 중';
      return;
    }
    host.innerHTML=published.map(card).join('');
    status.textContent=`공개된 협력 소식 ${published.length}건`;
  }
  async function load(){
    status.textContent='협력 소식을 불러오는 중입니다.';
    try{
      const response=await fetch(endpoint,{headers:{accept:'application/json'},cache:'no-store',credentials:'omit'});
      if(!response.ok)throw new Error(`HTTP ${response.status}`);
      const data=await response.json();
      if(data?.contract?.publicState!=='PUBLISHED')throw new Error('publication contract mismatch');
      render(data.items);
    }catch(error){
      console.warn('EKODI Church partner news unavailable',error);
      host.innerHTML='<p class="partner-news-empty">협력 소식을 지금 불러오지 못했습니다. 잠시 후 다시 확인해 주세요.</p>';
      status.textContent='협력 소식 연결 확인 필요';
    }
  }
  load();
})();
