import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const read=(file)=>readFileSync(new URL('../'+file,import.meta.url),'utf8');
test('Church home includes one canonical devotion tile plus notice and schedule panels',()=>{
  const home=read('index.html'),runtime=read('script.js');
  for(const [url,label] of [['/ekodichurch/devotion/','매일묵상'],['/ekodichurch/notices/','공지사항'],['/ekodichurch/schedule/','주요일정']]){
    assert.match(home,new RegExp('href="'+url.replaceAll('/','\\/')+'"'));
    assert.match(home,new RegExp('<strong>'+label+'</strong>'));
  }
  assert.doesNotMatch(home,/<strong>오늘의 삶<\/strong>|id="life-hub"/);
  assert.match(home,/data-church-notices data-limit="3"/);
  assert.match(home,/data-church-shared-schedules data-limit="3"/);
  assert.match(home,/src="church-shared-schedules\.js" defer/);
  assert.equal((home.match(/data-church-shared-schedules/g)||[]).length,1,'shared schedule rendered once');
  assert.doesNotMatch(home,/data-church-schedule data-limit="3"/);
  assert.match(runtime,/\/ekodichurch\/notices\//);
  assert.match(runtime,/\/ekodichurch\/schedule\//);
});
test('notice and schedule pages share Church shell and avoid unsanitized HTML',()=>{
  const js=read('church-public-updates.js');
  for(const page of ['notices','schedule']){
    const html=read(page+'/index.html');
    assert.match(html,/church-public-updates.js/);
    assert.match(html,/church-shell.js/);
    assert.match(html,/data-church-public-manage hidden/);
    assert.match(html,/data-ekodi-service-footer/);
    const nav=html.match(/<nav id="main-nav"[\s\S]*?<\/nav>/)?.[0]||'';
    assert.equal((nav.match(/href="\/ekodichurch\/notices\/"/g)||[]).length,1,'notice menu link appears once');
    assert.equal((nav.match(/href="\/ekodichurch\/schedule\/"/g)||[]).length,1,'schedule menu link appears once');
    assert.ok(nav.indexOf('href="/ekodichurch/devotion/"')<nav.indexOf('href="/ekodichurch/schedule/"'));
    assert.ok(nav.indexOf('href="/ekodichurch/notices/"')<nav.indexOf('href="/ekodichurch/schedule/"'));
  }
  assert.match(js,/post\.categoryId==='notice'/);
  assert.match(js,/post\?\.categoryId!=='schedule'/);
  assert.match(js,/getFederatedSchedules/);
  assert.match(js,/allowedUrl/);
  assert.match(js,/published-read-only/);
  assert.match(js,/managerToken/);
  assert.match(js,/owner','admin','moderator'/);
  assert.match(js,/localDay\(\)/);
  assert.doesNotMatch(js,/innerHTML\s*=|eval\(|new Function\(/);
});
test('small and wide screens keep two-column concise menus and adaptive cards',()=>{
  const css=read('church-public-updates.css');
  assert.match(css,/grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
  assert.match(css,/@media \(max-width:760px\)/);
  assert.match(css,/grid-template-columns:1fr/);
  assert.match(css,/min-height:44px/);
});

test('notice index hides body previews and places date at the far right; detail retains full body',()=>{
  const js=read('church-public-updates.js'),css=read('church-public-updates.css');
  const row=js.slice(js.indexOf('  function noticeRow(post)'),js.indexOf('  function renderNotices()'));
  const render=js.slice(js.indexOf('  function renderNotices()'),js.indexOf('  function parseSchedulePost('));
  assert.match(row,/const line=el\('div','church-public-notice-line'\)/);
  assert.match(row,/line\.append\(anchor\)/);
  assert.match(row,/line\.append\(time\)/);
  assert.ok(row.indexOf('line.append(anchor)')<row.indexOf('line.append(time)'));
  assert.doesNotMatch(row,/post\.body|church-public-excerpt/,'notice list may not render any body text');
  assert.match(render,/const body=el\('p','church-public-body',post\.body\)/);
  assert.match(render,/notices\/\?post=/);
  assert.match(css,/\.church-public-notice \.church-public-notice-line\s*\{/);
  assert.match(css,/justify-content:space-between/);
  assert.match(css,/\.church-public-notice \.church-public-notice-line>time\s*\{/);
  assert.match(css,/text-align:right/);
  assert.match(css,/white-space:nowrap/);
});
