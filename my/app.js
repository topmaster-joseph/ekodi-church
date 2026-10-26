const memberT=(source,vars={})=>window.EKODIChurchMemberI18n?.t?.(source,vars)||String(source).replace(/\{([a-zA-Z0-9_]+)\}/g,(_,key)=>String(vars[key]??`{${key}}`));
const state=document.getElementById('memberState');
const login=document.getElementById('loginAction');
const logout=document.getElementById('logoutAction');

function clearAuthReturnFragment(){
  if(!location.hash.startsWith('#ekodi_'))return;
  history.replaceState(null,'',location.pathname+location.search);
}

function storedSession(){
  try{
    for(let i=0;i<localStorage.length;i++){
      const key=localStorage.key(i)||'';
      if(!/^sb-.*-auth-token$/.test(key))continue;
      const raw=localStorage.getItem(key);if(!raw)continue;
      const parsed=JSON.parse(raw);
      const session=parsed?.currentSession||parsed?.session||parsed;
      if(session?.access_token&&session?.user)return session;
    }
  }catch{}
  return null;
}

function render(){
  const session=storedSession();
  if(session){
    const email=String(session.user?.email||memberT('로그인 사용자'));
    state.dataset.authenticated='true';
    state.textContent=memberT('{email} 계정으로 연결되어 있습니다.',{email});
    login.hidden=true;
    logout.hidden=false;
  }else{
    state.dataset.authenticated='false';
    state.textContent=memberT('교회 마이페이지를 개인 계정과 연결하려면 로그인해 주세요.');
    login.hidden=false;
    logout.hidden=true;
  }
}
async function logoutToChurchHome(){
  logout.disabled=true;
  try{
    const {createClient}=await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
    const client=createClient('https://renzehysxirjilvdxacv.supabase.co','sb_publishable_0QjB0WzZbjrd-FJ5D5cR7A_xUkXyOY_',{auth:{persistSession:true,detectSessionInUrl:false,autoRefreshToken:false}});
    await client.auth.signOut({scope:'local'});
  }catch(error){console.warn('[EKODI church member logout]',error)}
  // Even if the network is unavailable, do not let stale shared storage auto-open My Page.
  try{localStorage.removeItem('sb-renzehysxirjilvdxacv-auth-token');sessionStorage.removeItem('ekodi-auth-token')}catch{}
  window.google?.accounts?.id?.disableAutoSelect?.();
  location.replace('/ekodichurch/');
}
logout.addEventListener('click',()=>void logoutToChurchHome());
clearAuthReturnFragment();
render();
window.addEventListener('storage',render);
window.addEventListener('ekodi:church-member-locale-change',render);
