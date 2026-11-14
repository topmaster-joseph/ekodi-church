import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = path => readFile(new URL('../' + path, import.meta.url),'utf8');
const publicPages = ['index.html','devotion/index.html','notices/index.html','schedule/index.html','together/index.html'];
const memberPages = ['my/index.html','my/giving/index.html','my/attendance/index.html','presence/index.html'];
const routes = [
 '/ekodichurch/devotion/',
 '/ekodichurch/#worship',
 '/ekodichurch/notices/',
 '/ekodichurch/schedule/',
 '/ekodichurch/#together',
 '/ekodichurch/my/'
];
function mainNavigation(html){
 const match = html.match(/<nav (?:id="main-nav"|class="church-shell-nav")[^>]*>([\s\S]*?)<\/nav>/);
 assert.ok(match,'canonical site menu must exist');
 const anchors = [...match[1].matchAll(/<a[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g)];
 return anchors.map(a=>({href:a[1],label:a[2].replace(/<[^>]+>/g,'').trim()}));
}
test('six canonical Church destinations appear in identical order on all menus',async()=>{
 for (const page of [...publicPages,...memberPages,'live/index.html']){
  const html=await read(page);
  const anchors=mainNavigation(html);
  assert.deepEqual(anchors.map(x=>x.href),routes, page);
  assert.deepEqual(anchors.map(x=>x.label),['매일묵상','예배·방송','공지사항','주요일정','함께하기','마이페이지'],page);
  assert.match(html,/church-site-shell\.css/,page);
  assert.match(html,/class="site-footer church-footer/,page);
  assert.match(html,/data-ekodi-service-footer/,page);
 }
});
test('member and site headers use original first-party login and shared footer, not global My EKODI',async()=>{
 for(const page of memberPages){
  const html=await read(page);
  assert.match(html,/class="site-header church-member-shared-header"/,page);
  assert.match(html,/data-ekodi-header-actions/,page);
  assert.match(html,/church-member-navigation\.js/,page);
  assert.match(html,/church-shell\.js/,page);
  assert.match(html,/class="church-footer-inner"/,page);
  assert.doesNotMatch(html,/href="https:\/\/ekodi\.kr\/my\//,page);
 }
 for(const page of publicPages){
  const html=await read(page);
  assert.match(html,/church-account-header\.js/,page);
 }
});
test('shared header, main content and footer honor 1120px measure and responsive breakpoints',async()=>{
 const css=await read('church-site-shell.css');
 assert.match(css,/--church-content-width:1120px/);
 assert.match(css,/header\.site-header/);
 assert.match(css,/footer\.site-footer\.church-footer/);
 assert.match(css,/body>main\.wrap/);
 assert.match(css,/@media\(max-width:1023px\)/);
 assert.match(css,/@media\(max-width:560px\)/);
});
test('my page exposes six instant tabs and nested safe attendance categories',async()=>{
 const [html,script]=await Promise.all([read('my/index.html'),read('my/tabbed-home.js')]);
 const tabs=[...html.matchAll(/data-member-tab="([^"]+)"/g)].map(x=>x[1]);
 assert.deepEqual(tabs,['worship','devotion','community','live','giving','attendance']);
 for(const id of tabs)assert.match(html,new RegExp('id="panel-'+id+'"'));
 for(const id of ['service','onsite','summary'])assert.match(html,new RegExp('data-attendance-tab="'+id+'"'));
 assert.match(html,/id="presenceAdminLink"[^>]*hidden style="display:none"/);
 assert.match(html,/개인 출결 API에서 현장활동의 별도 집계는 지원하지 않습니다/);
 assert.match(script,/scrollTabsToTop/);
 assert.match(script,/aria-selected/);
 const guard=await read('my/presence-admin-link.js');
 assert.match(guard,/response\.ok/);
 assert.match(guard,/link\.hidden=true/);
});
