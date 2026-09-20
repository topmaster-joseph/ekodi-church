const state=document.getElementById('memberState');
const login=document.getElementById('loginAction');

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
    const email=String(session.user?.email||'로그인 사용자');
    state.dataset.authenticated='true';
    state.textContent=`${email} 계정으로 연결되어 있습니다.`;
    login.hidden=true;
  }else{
    state.dataset.authenticated='false';
    state.textContent='교회 마이페이지를 개인 계정과 연결하려면 로그인해 주세요.';
    login.hidden=false;
  }
}
render();
window.addEventListener('storage',render);
