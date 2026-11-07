import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');

test('Church homepage has no header verse markup or script that can reinsert it',()=>{
  const home=read('index.html');
  const header=home.match(/<header class="site-header"[^>]*>[\s\S]*?<\/header>/)?.[0];
  assert.ok(header,'homepage semantic header must remain');
  assert.doesNotMatch(header,/daily-verse|daily-verse-text|daily-verse-ref/,'do not render header scripture');
  assert.doesNotMatch(home,/<script[^>]+church-daily-verse\.js[^>]*>/,'do not dynamically reinject removed verse');
  assert.match(header,/<a class="brand"/);
  assert.match(header,/<button class="menu-button"/);
});

test('six core navigations, devotional page and published Church/Mission schedules survive',()=>{
  const home=read('index.html');
  const nav=home.match(/<nav id="main-nav"[\s\S]*?<\/nav>/)?.[0]||'';
  const labels=['매일묵상','예배·방송','공지사항','주요일정','함께하기','마이페이지'];
  assert.equal((nav.match(/<a\b/g)||[]).length,6);
  let pos=-1;
  for(const label of labels){
    const next=nav.indexOf('>'+label+'</a>');
    assert.ok(next>pos,'missing/out-of-order '+label);
    pos=next;
  }
  assert.match(home,/<a href="\/ekodichurch\/devotion\/">매일묵상<\/a>/);
  assert.match(home,/data-church-shared-schedules/);
  assert.match(home,/church-section-nav\.js/);
  assert.match(home,/church-compact-navigation\.css/);
  assert.match(read('devotion/index.html'),/에코디 오늘의 매일묵상/);
});

test('Church and Mission public schedule feature remains wired and assets remain scoped',()=>{
  const js=read('church-shared-schedules.js');
  assert.match(js,/\/ekodichurch\/board\/api\/shared-schedules/);
  assert.match(js,/published-read-only/);
  assert.match(js,/ekodimission/);
  assert.match(read('church-compact-navigation.css'),/\.site-header/);
});
