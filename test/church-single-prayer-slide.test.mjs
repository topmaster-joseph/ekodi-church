import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
const root=file=>readFileSync(new URL('../'+file,import.meta.url),'utf8');
const js=root('worship/2026-10-18/prayer/prayer.js');
const html=root('worship/2026-10-18/prayer/index.html');
const css=root('worship/2026-10-18/prayer/prayer.css');
const deck=JSON.parse(root('worship/2026-10-18/materials.json'));

test('One slide replaces all five prayer slides without changing approved sermon or summary',()=>{
 assert.equal(deck.officialPresentationSlideCount,38);
 assert.equal(deck.prayerSlide.slideNumber,38);
 assert.deepEqual(deck.prayerSlide.languages,['ko','en','zh','ja','vi']);
 assert.equal(deck.slides.length,16);
 assert.match(root('worship/2026-10-18/index.html'),/view=slide&amp;lang=ko/);
 assert.match(root('index.html'),/전체 예배 PPT 38장/);
 assert.match(css,/body\[data-view="slide"\]/);
 assert.match(html,/주기도문 재생/);
});
test('Interactive projector changes prayer text in place, speaks selected native voice and cancels on language switch',()=>{
 class El{
  constructor(tag='div'){this.tagName=tag.toUpperCase();this.textContent='';this.children=[];this.listeners={};this.attrs={};this.disabled=false;this.dataset={};this.className='';this.value='';this.checked=false;}
  addEventListener(n,fn){this.listeners[n]=fn;}
  setAttribute(n,v){this.attrs[n]=v;}
  append(...items){this.children.push(...items);}
  replaceChildren(...items){this.children=[...items];}
  querySelectorAll(query){if(query==='li')return this.children;if(query==='.play-line')return this.children.flatMap(x=>x.children.filter(c=>c.className==='play-line'));return [];}
  click(){this.listeners.click?.();}
 }
 const ids=['voice-status','playback-status','prayer-lines','language-tabs','play-all','pause','stop','rate','rate-label','repeat','prayer-heading'];
 const elements=Object.fromEntries(ids.map(id=>[id,new El()]));
 elements.rate.value='0.85';elements.repeat.checked=true;
 const calls=[];
 const synth={getVoices:()=>['ko-KR','en-US','zh-CN','ja-JP','vi-VN'].map(lang=>({lang,name:'Test '+lang})),
    cancel(){calls.push('cancel');},pause(){calls.push('pause');},resume(){calls.push('resume');},
    speak(u){calls.push(u);},addEventListener(){}};
 const handlers={};
 const document={
  body:{dataset:{}},documentElement:{lang:'ko'},
  getElementById:id=>elements[id],createElement:tag=>new El(tag),
  addEventListener:(type,fn)=>{handlers[type]=fn},
  querySelector:()=>({requestFullscreen(){}})
 };
 const context={
  document,location:{search:'?view=slide&lang=ko',href:'https://ekodi.kr/ekodichurch/worship/2026-10-18/prayer/?view=slide&lang=ko'},
  history:{replaceState(){}},URL,
  window:{speechSynthesis:synth,SpeechSynthesisUtterance:class{constructor(text){this.text=text}},addEventListener(){},},
 };
 runInNewContext(js,context,{timeout:2000});
 assert.equal(document.body.dataset.view,'slide');
 assert.equal(elements['language-tabs'].children.length,5);
 assert.equal(elements['prayer-lines'].children.length,7);
 assert.equal(calls.filter(x=>typeof x==='object').length,0,'never autoplay');
 assert.equal(elements.repeat.checked,false,'single continuous prayer, not two repeats');
 elements['language-tabs'].children[1].click();
 assert.match(elements['prayer-lines'].children[0].children[0].textContent,/Our Father/);
 elements['play-all'].click();
 const spoken=calls.filter(x=>typeof x==='object');
 assert.equal(spoken.length,1);
 assert.equal(spoken[0].lang,'en-US');
 assert.match(spoken[0].text,/Our Father/);
 elements.pause.click();
 assert.equal(calls.at(-1),'pause');
 elements.pause.click();
 assert.equal(calls.at(-1),'resume');
 elements['language-tabs'].children[2].click();
 assert.equal(calls.at(-1),'cancel');
 assert.match(elements['prayer-lines'].children[0].children[0].textContent,/我们在天上的父/);
 elements['play-all'].click();
 assert.equal(calls.filter(x=>typeof x==='object').at(-1).lang,'zh-CN');
});
test('Absent voice must disable its play action rather than using another language',()=>{
 assert.match(js,/if \(!currentVoice \|\| !synth\)/);
 assert.match(js,/playAll.disabled = !currentVoice/);
 assert.match(js,/currentVoice = voices.find/);
 assert.doesNotMatch(js,/\.speak\(.*\)\s*;?\s*\/\/\s*auto/i);
});
