import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('church-owned mission appears naturally inside About, preserves four principles and devotion',()=>{
const html=read('index.html'),css=read('styles.css');
const start=html.indexOf('<section class="intro section" id="about">');
const end=html.indexOf('</section>',start);
const intro=html.slice(start,end);
assert.ok(start>=0&&end>start);
assert.match(intro,/data-ekodi-mission="church"/);
assert.match(intro,/우리는 말씀 안에서 서로의 삶을 돌보고, 흩어진 자리마다 하나님 나라의 사랑을 살아내는 공동체를 세운다\./);
for(const v of ['에클레시아','코이노니아','디아스포라','희년'])assert.ok(intro.includes(v));
assert.ok(intro.includes('/ekodichurch/devotion/'));
assert.ok(css.includes('.church-mission-declaration'));
assert.equal((html.match(/data-ekodi-mission="church"/g)||[]).length,1);
});
