import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';

const read=name=>readFile(new URL('../'+name,import.meta.url),'utf8');

test('fixed Church header stays aligned after later auth/language/font height changes',async()=>{
  const source=await read('church-shell.js');
  const listeners=new Map();
  const observers=[];
  const added=[];
  const header={
    offsetHeight:82,
    style:{setProperty(){}},
    classList:{add(){},toggle(){}},
    querySelector(){return null},
    after(node){added.push(node)}
  };
  const document={
    querySelector(selector){return selector==='header.site-header'?header:null},
    createElement(tag){return {tag,style:{},setAttribute(){},className:'',textContent:''}},
    head:{appendChild(node){added.push(node)}}
  };
  const window={
    scrollY:0,
    addEventListener(name,fn){listeners.set(name,fn)},
    ResizeObserver:class{constructor(fn){this.callback=fn;observers.push(this)}observe(node){assert.equal(node,header)}}
  };
  const getComputedStyle=()=>({position:'sticky',color:'rgb(20,50,43)'});
  vm.runInNewContext(source,{document,window,location:{pathname:'/ekodichurch/'},getComputedStyle},
    {timeout:1200});
  const spacer=added.find(x=>x.className==='church-shell-spacer');
  assert.ok(spacer,'spacer is added while transitioning from sticky to fixed');
  assert.equal(spacer.style.height,'82px');
  assert.equal(observers.length,1);
  header.offsetHeight=112;
  observers[0].callback();
  assert.equal(spacer.style.height,'112px','ResizeObserver follows actual header growth');
  header.offsetHeight=126;
  listeners.get('ekodi:user-header-ready')();
  assert.equal(spacer.style.height,'126px','shared member/language controls realign content');
  header.offsetHeight=130;
  listeners.get('load')();
  assert.equal(spacer.style.height,'130px','late font loading realigns content');
  assert.ok(listeners.has('resize'));
});

test('mobile 320px fallback and current calendar 44px controls coexist without weakening guard',async()=>{
  const [css,calendar,home]=await Promise.all([
    read('church-compact-navigation.css'),
    read('church-shared-calendar.css'),
    read('index.html')
  ]);
  assert.match(css,/@media\(max-width:360px\)\s*\{\s*\.site-header ~ main > \.hero\s*\{\s*padding-top:48px!important;/);
  assert.doesNotMatch(css,/\.site-header \+ main > \.hero\{/,'adjacent selector must not silently miss injected shell spacer');
  assert.match(calendar,/min-height:44px;min-width:44px/);
  assert.match(calendar,/@media\(max-width:390px\)[^\n]*min-width:44px/);
  assert.ok(home.includes('<span>토요모임</span><strong>매주 토요일 오전 11시</strong>'));
  assert.doesNotMatch(home,/토요모임<\/span><strong>매주 토요일 오후 5시/);
});

test('all five public routes use the same fresh dynamic header script, not a cached legacy version',async()=>{
  for(const path of ['index.html','devotion/index.html','notices/index.html','schedule/index.html','together/index.html']){
    const html=await read(path);
    assert.match(html,/church-shell\.js\?v=20261108/,'cache-bust '+path);
    assert.doesNotMatch(html,/church-shell\.js\?v=20261101/);
  }
});

test('original member-authored calendar data and admin-only roles survive integrated layout patches',async()=>{
  const [schedule,renderer,updates]=await Promise.all([
    read('schedule/index.html'),
    read('church-shared-schedules.js'),
    read('church-public-updates.js')
  ]);
  assert.match(schedule,/data-church-public-manage hidden/);
  assert.match(renderer,/data-ekodi-user-content/);
  assert.match(renderer,/translate','no'/);
  assert.match(renderer,/x\.date===saturdayDate/);
  assert.match(renderer,/published-read-only/);
  assert.doesNotMatch(renderer,/innerHTML|\bPOST\b|\bPATCH\b|\bDELETE\b/);
  assert.match(updates,/managerToken&&detail&&kind==='schedule'&&item\.source==='board'/);
});
