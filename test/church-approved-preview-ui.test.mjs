import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
const css=readFileSync(new URL('../church-refresh.css',import.meta.url),'utf8');
const weeklyCss=readFileSync(new URL('../church-weekly-worship.css',import.meta.url),'utf8');
const i18n=readFileSync(new URL('../church-i18n.js',import.meta.url),'utf8');

test('approved four-card Church first view and discoverable secondary menu',()=>{
  const start=html.indexOf('class="overview-grid" aria-label="에코디교회 핵심 메뉴"');
  const more=html.indexOf('<details class="church-more-menu"');
  assert.ok(start>0&&more>start);
  const primary=html.slice(start,more);
  assert.equal((primary.match(/<a /g)||[]).length,4);
  for(const href of ['#life-hub','#weekly-worship','#community','#online']){
    assert.ok(primary.includes('href="'+href+'"'),'missing essential '+href);
  }
  assert.equal((html.slice(more,html.indexOf('</details>',more)).match(/<a /g)||[]).length,4);
  assert.match(html,/href="#location"/);
  assert.match(html,/href="\/ekodichurch\/my\/"/);
  assert.match(css,/\.hero:has\(~ #weekly-worship:target\)/);
  assert.match(css,/\.church-more-menu summary:focus-visible/);
});
test('weekly worship is public, concise, and permission-gated inline',()=>{
  const start=html.indexOf('<section class="church-weekly-focus"');
  const end=html.indexOf('<section class="intro section"',start);
  const weekly=html.slice(start,end);
  assert.ok(weekly.length>1000);
  const main=weekly.slice(weekly.indexOf('aria-label="선택한 예배의 주요 자료"'),weekly.indexOf('<details class="church-weekly-extras"'));
  for(const action of ['data-weekly-bulletin','data-weekly-slides','data-weekly-live-host']){
    assert.ok(main.includes(action),'missing essential '+action);
  }
  assert.match(weekly,/<details class="church-weekly-extras">/);
  assert.match(weekly,/data-weekly-broadcast/);
  assert.match(weekly,/data-church-worship-admin[^>]+hidden/);
  assert.match(weekly,/data-weekly-editor hidden/);
  assert.match(weeklyCss,/\.church-weekly-extras summary:focus-visible/);
  assert.match(weeklyCss,/@media\(max-width:760px\)/);
});
test('keeps 9-language core fallback and never revives standalone video',()=>{
  new Function(i18n);
  for(const phrase of ['예배 자료','교회 메뉴 더 보기','예배안내','방송·운영 더 보기']){
    assert.ok(i18n.includes(JSON.stringify(phrase)),phrase);
  }
  assert.doesNotMatch(html,/meet\.jit\.si|EKODIChurchLive/);
  assert.match(html,/href="\/live\/church\/\?mode=studio&amp;activity=sunday/);
  assert.match(html,/href="\/live\/church\/\?mode=studio&amp;activity=event/);
  assert.match(html,/EKODI CHURCH/);
  assert.match(html,/class="site-footer church-footer"/);
});
