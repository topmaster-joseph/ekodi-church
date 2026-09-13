(()=>{'use strict';
const hostButton=document.getElementById('hostButton');
if(!hostButton)return;
hostButton.addEventListener('click',event=>{
  event.preventDefault();
  event.stopImmediatePropagation();
  const next=new URL(location.href);
  if(next.searchParams.get('mode')==='studio')return;
  next.searchParams.set('mode','studio');
  location.replace(next.href);
},{capture:true});
})();
