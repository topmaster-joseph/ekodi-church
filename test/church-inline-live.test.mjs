import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';

const read=name=>readFile(new URL('../'+name,import.meta.url),'utf8');

test('Church Online right card contains accessible inline viewer, fullscreen and renamed studio action',async()=>{
  const [html,css,script]=await Promise.all([
    read('index.html'),read('church-inline-live.css'),read('church-inline-live.js')
  ]);
  const online=html.slice(html.indexOf('<section class="online section"'),html.indexOf('<section class="community-visit"'));
  assert.match(online,/id="churchInlineLiveStage"/);
  assert.match(online,/id="churchInlineLiveFrame"[^>]*allowfullscreen/);
  assert.match(online,/id="churchWatchLive"[^>]*aria-controls="churchInlineLiveFrame"/);
  assert.match(online,/id="churchWatchFullscreen"[^>]*disabled/);
  assert.match(online,/실시간 방송 준비/);
  assert.doesNotMatch(online,/활동 방송 준비/);
  assert.match(online,/href="\/ekodichurch\/live\/\?mode=studio&amp;activity=event"/);
  assert.match(html,/src="church-inline-live.js" defer/);
  assert.match(css,/\.church-inline-live-stage:fullscreen/);
  assert.match(script,/frame\.removeAttribute\('src'\)/);
  assert.doesNotMatch(script,/localStorage|sessionStorage|createRoom|startBroadcast/);
  new Function(script);
});

test('click mounts the same-origin public viewer, toggles fullscreen, and closes playback',async()=>{
  const script=await read('church-inline-live.js');
  const makeElement=()=>({
    hidden:false,disabled:false,textContent:'',dataset:{},attrs:{},events:{},
    addEventListener(name,callback){this.events[name]=callback},
    setAttribute(name,value){this.attrs[name]=value},
    removeAttribute(name){delete this[name]}
  });
  const ids=['churchInlineLive','churchInlineLiveStage','churchInlineLivePlaceholder',
    'churchInlineLiveFrame','churchWatchLive','churchWatchFullscreen','churchInlineLiveStatus'];
  const elements=Object.fromEntries(ids.map(id=>[id,makeElement()]));
  const document={
    fullscreenElement:null, events:{},
    getElementById:id=>elements[id],addEventListener(name,cb){this.events[name]=cb},
    async exitFullscreen(){this.fullscreenElement=null;this.events.fullscreenchange()}
  };
  // Match the actual HTML disabled attribute before the runtime boots.
  elements.churchWatchFullscreen.disabled=true;
  elements.churchInlineLiveStage.requestFullscreen=async()=>{
    document.fullscreenElement=elements.churchInlineLiveStage;
    document.events.fullscreenchange();
  };
  const window={addEventListener(){}};
  vm.runInNewContext(script,{document,window,location:{origin:'https://ekodi.kr'},URL});
  const player=elements.churchInlineLiveFrame,watch=elements.churchWatchLive,fullscreen=elements.churchWatchFullscreen;
  assert.equal(player.src,undefined,'must not connect to a room before explicit click');
  assert.equal(fullscreen.disabled,true);
  watch.events.click();
  assert.equal(player.src,'/ekodichurch/live/?mode=viewer&embed=church-online');
  assert.equal(player.hidden,false);
  assert.equal(watch.attrs['aria-expanded'],'true');
  assert.equal(fullscreen.disabled,false);
  await fullscreen.events.click();
  assert.equal(document.fullscreenElement,elements.churchInlineLiveStage);
  assert.equal(fullscreen.textContent,'전체화면 종료');
  watch.events.click();
  assert.equal(player.src,undefined);
  assert.equal(player.hidden,true);
  assert.equal(watch.textContent,'실시간 방송 시청');
});

test('public iframe is deliberately scoped; other church pages remain unframeable',async()=>{
  const headers=await read('_headers');
  const general=headers.split('\n/live/*')[0];
  assert.match(general,/frame-ancestors 'none'/);
  assert.match(general,/frame-src 'self' https:\/\/www\.youtube-nocookie\.com/);
  for(const route of ['/live/*','/ekodichurch/live/*']){
    const section=headers.split('\n'+route+'\n')[1]?.split('\n\n')[0]||'';
    assert.match(section,/frame-ancestors 'self'/,route);
    assert.doesNotMatch(section,/unsafe-eval|frame-ancestors \*/);
  }
});

test('embedded Live viewer skips the entry screen and rechecks idle broadcast without changing studio auth',async()=>{
  const [html,live,style,homepage]=await Promise.all([
    read('live/index.html'),read('live/live.js'),read('live/church-unified-shell.css'),read('index.html')
  ]);
  assert.match(live,/embeddedViewer=setupParams\.get\('embed'\)==='church-online'/);
  assert.match(live,/embeddedViewer\|\|setupParams\.get\('mode'\)==='viewer'/);
  assert.match(live,/if\(!document\.hidden&&!state\.room&&!state\.pc\)void joinViewer\(\)/);
  assert.match(live,/setupParams\.get\('mode'\)==='studio'/);
  assert.match(style,/html\[data-church-live-embed="viewer"\]/);
  assert.match(html,/church-daily-verse\.js/);
  assert.match(homepage,/church-daily-verse\.js/);
  assert.match(html,/class="site-footer church-footer"/);
  for(const fact of ['사업자 소재지','운영주체 에코디교회','대표 정찬균','고유번호 307-82-82097']){
    assert.ok(html.includes(fact)&&homepage.includes(fact),fact);
  }
  new Function(live);
});
