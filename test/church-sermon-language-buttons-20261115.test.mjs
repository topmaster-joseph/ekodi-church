import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const page=read('worship/2026-11-15/index.html');
const js=read('worship/2026-11-15/worship.js');
const css=read('worship/2026-11-15/worship.css');
const packet=JSON.parse(read('worship/2026-11-15/materials.json'));
const languages=['ko','en','zh','ja','vi'];

test('online sermon PPT starts in Korean with an explicit language switch, not five simultaneous headings',()=>{
  assert.equal(packet.date,'2026-11-15');
  assert.equal(packet.stage,'draft','internal final-review status must not be changed');
  assert.equal(packet.slides.length,30,'existing broadcast slides preserved');
  assert.equal(packet.slides[9].title,'모든 사람에게\n모든 것이 되어');
  assert.equal(packet.slides[9].sermonTitle,true);
  assert.deepEqual(packet.slides[9].lines,['2026.11.15 · 고린도전서 9:19–27']);
  assert.doesNotMatch(JSON.stringify(packet.slides[9]),/\(초안\)|All Things to All People|向什么样的人|すべての人に|Trở nên mọi sự/);
  assert.doesNotMatch(js,/\(초안\)/);
  assert.match(page,/id="sermon-title-languages"[^>]*hidden/);
  for(const lang of languages)assert.match(page,new RegExp('data-sermon-lang="'+lang+'"'));
  assert.equal((page.match(/data-sermon-lang="/g)||[]).length,5);
  assert.match(css,/\.sermon-title-languages\[hidden\]\{display:none!important\}/);
  assert.match(css,/body\[data-view=vertical\] \.sermon-title-languages/);
  new Function(js);
});

function runtime(){
  const ids=new Map();
  function node(id){
    if(!ids.has(id))ids.set(id,{
      id,dataset:{},style:{setProperty(){}},textContent:'',hidden:false,
      attrs:{},children:[],value:'',clientWidth:1200,
      setAttribute(name,value){this.attrs[name]=value;},
      addEventListener(name,callback){this['event_'+name]=callback;},
      querySelector(){return null;},
      querySelectorAll(){return [];},
      replaceChildren(){this.children.length=0;},
      append(v){this.children.push(v);},
      remove(){},
    });
    return ids.get(id);
  }
  const buttons=languages.map(lang=>({
    ...node('btn-'+lang),dataset:{sermonLang:lang},
    addEventListener(name,fn){this['handler_'+name]=fn;},
    getAttribute(name){return this.attrs[name];},
    click(){this.handler_click?.();}
  }));
  const nav=node('sermon-title-languages');
  nav.querySelectorAll=selector=>selector==='[data-sermon-lang]'?buttons:[];
  const slide=node('slide');slide.querySelector=()=>null;
  const listeners={};
  const document={
    body:{dataset:{}},title:'',documentElement:{},
    querySelector(selector){return ids.get(selector.slice(1))||node(selector.slice(1));},
    querySelectorAll(selector){return [];},
    getElementById(id){return node(id);},
    createElement(){return node('created-'+Math.random());},
    addEventListener(name,callback){listeners[name]=callback;}
  };
  const backing=new Map();
  const localStorage={getItem:k=>backing.get(k)||null,setItem:(k,v)=>backing.set(k,v)};
  const posts=[];
  let channel;
  class BroadcastChannel{
    constructor(){channel=this;}
    postMessage(v){posts.push(v);}
  }
  const window={innerHeight:900,addEventListener(name,callback){listeners[name]=callback;}};
  vm.runInNewContext(js,{document,window,location:{search:'?view=stage'},localStorage,BroadcastChannel,Image:class{},URL,URLSearchParams,console});
  return {ids,nav,buttons,posts,get channel(){return channel;},document};
}

test('choosing a language changes only the sermon heading and synchronizes with presenter',()=>{
  const env=runtime(), next=env.ids.get('next');
  for(let i=0;i<9;i++)next.event_click();
  assert.equal(env.nav.hidden,false,'language buttons visible on sermon slide');
  const title=env.ids.get('slide-title');
  assert.equal(title.textContent,'모든 사람에게\n모든 것이 되어');
  for(const [lang,expected] of [
    ['en','All Things to All People.'],
    ['zh','向什么样的人，就作什么样的人。'],
    ['ja','すべての人に、すべてのものとなって。'],
    ['vi','Trở nên mọi sự cho mọi người.'],
    ['ko','모든 사람에게\n모든 것이 되어']
  ]){
    env.buttons.find(button=>button.dataset.sermonLang===lang).click();
    assert.equal(title.textContent,expected,lang);
    assert.equal(env.posts.at(-1).sermonLanguage,lang,'language broadcast via presenter channel');
    assert.equal(env.buttons.find(button=>button.dataset.sermonLang===lang).getAttribute('aria-pressed'),'true');
  }
  env.channel.onmessage({data:{slide:9,blackout:false,sermonLanguage:'ja'}});
  assert.equal(title.textContent,'すべての人に、すべてのものとなって。','another presenter can choose language');
  next.event_click();
  assert.equal(env.nav.hidden,true,'controls stay hidden on non-sermon slides');
});
