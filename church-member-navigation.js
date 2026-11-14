// Accessible mobile menu for Church member pages; public subpages retain their own controls.
(() => {
  'use strict';
  const header=document.querySelector('header.church-member-shared-header');
  if(!header)return;
  const menu=header.querySelector('.menu-button');
  const nav=header.querySelector('#main-nav');
  if(!menu||!nav)return;
  const setOpen=open=>{
    nav.classList.toggle('open',open);
    menu.setAttribute('aria-expanded',String(open));
    menu.setAttribute('aria-label',open?'메뉴 닫기':'메뉴 열기');
  };
  menu.addEventListener('click',()=>setOpen(!nav.classList.contains('open')));
  nav.addEventListener('click',event=>{if(event.target.closest('a'))setOpen(false)});
  document.addEventListener('keydown',event=>{if(event.key==='Escape')setOpen(false)});
  document.addEventListener('click',event=>{
    if(!header.contains(event.target))setOpen(false);
  });
  window.addEventListener('resize',()=>{if(window.innerWidth>=1024)setOpen(false)});
})();
