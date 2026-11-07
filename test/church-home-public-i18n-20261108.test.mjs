import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const read=p=>readFile(new URL('../'+p,import.meta.url),'utf8');

const HOME_STRINGS=['오늘의 말씀과 묵상기도','예배안내·주보·온라인 방송','교회에서 전하는 알림','교회·선교회 공개 일정','공동체·협력소식·오시는 길','나의 교회 활동','교회 일정 게시판','에코디 오늘의 매일묵상 →','에코디 오늘의 매일묵상 보기','공지사항을 불러오는 중입니다.','공개 일정을 확인하고 있습니다.','등록된 공지사항이 없습니다.','예정된 공개 일정이 없습니다.','교회 일정 보기','선교회 일정 보기','교회 공지 보기','교회','선교회'];

test('every homepage notice/schedule string is translated for all eight non-Korean locales', async()=>{
  const [base,ext]=await Promise.all([read('church-i18n.js'),read('church-i18n-extended.js')]);
  for(const s of HOME_STRINGS){
    assert.ok(base.includes(`'${s}':{en:`),`en/zh-CN/ja missing: ${s}`);
    assert.ok(ext.includes(`add('${s}',`),`my/kac/vi/mn/id missing: ${s}`);
  }
});

test('A안: non-Korean pages show translated labels, never Korean user titles, on homepage previews', async()=>{
  const [sched,updates]=await Promise.all([read('church-shared-schedules.js'),read('church-public-updates.js')]);
  assert.match(sched,/ko\?\(event\.title\|\|'일정 보기'\):\(event\.source==='ekodichurch'\?'교회 일정 보기':'선교회 일정 보기'\)/);
  assert.match(sched,/\[fmt\(event\.date\),time24\(event\.time\)\]/,'non-Korean meta is date + 24h time only');
  assert.match(sched,/if\(saturday&&korean\(\)\)/,'Korean Saturday override only on Korean pages');
  assert.match(updates,/korean\(\)\|\|!compact\?post\.title:'교회 공지 보기'/);
  for(const js of [sched,updates]) assert.match(js,/if\(next===paintedLang\)return;/,'repaint only on real language change');
});

test('schedule origin badge is a simple dot + one word, and sub-page eyebrows name the page', async()=>{
  const [sched,css,schedule,notices]=await Promise.all([read('church-shared-schedules.js'),read('church-shared-calendar.css'),read('schedule/index.html'),read('notices/index.html')]);
  assert.match(sched,/originShort=item=>item\.source==='ekodichurch'\?'교회':'선교회'/);
  assert.match(css,/\.church-schedule-origin::before\{content:"";width:\.45rem/);
  assert.ok(schedule.includes('<a href="/ekodichurch/">에코디교회</a> · 주요일정'));
  assert.ok(notices.includes('<a href="/ekodichurch/">에코디교회</a> · 공지사항'));
  assert.ok(!schedule.includes('에코디교회 첫화면')&&!notices.includes('에코디교회 첫화면'));
});
