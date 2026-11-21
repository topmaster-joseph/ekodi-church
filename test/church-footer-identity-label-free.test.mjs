import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const pages=["index.html","devotion/index.html","notices/index.html","schedule/index.html","together/index.html"];
const forbidden=/(?:운영주체\s*에코디교회|대표\s*정찬균|Operator\s*·\s*EKODI Church|Representative\s*·\s*Jung Chan-gyun)/u;

test('each public Church footer omits duplicate operator and leader rows but keeps factual contact',()=>{
 for(const path of pages){
  const html=readFileSync(new URL('../'+path,import.meta.url),'utf8');
  const footer=/<footer\b[^>]*>[\s\S]*?<\/footer>/i.exec(html)?.[0]||'';
  assert.ok(footer,path+' must have a public footer');
  assert.doesNotMatch(footer,forbidden,path);
  assert.match(footer,/EKODI CHURCH/);
  assert.match(footer,/고유번호 307-82-82097/);
  assert.match(footer,/ekodichurch@gmail\.com/);
  assert.match(footer,/privacy|개인정보처리방침/i);
 }
});

test('Church translations never reintroduce forbidden footer identity rows',()=>{
 const src=readFileSync(new URL('../church-life-hub-i18n.js',import.meta.url),'utf8');
 assert.doesNotMatch(src,/'운영주체 에코디교회':|'대표 정찬균':/);
 assert.doesNotMatch(src,/Operator · EKODI Church|Representative · Jung Chan-gyun/);
 assert.match(src,/고유번호 307-82-82097/);
});
