import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const read=path=>readFile(new URL('../'+path,import.meta.url),'utf8');

const HOME_KEYS=['오늘의 말씀과 묵상기도','예배안내·주보·온라인 방송','교회에서 전하는 알림',
  '교회·선교회 공개 일정','공동체·협력소식·오시는 길','나의 교회 활동','교회 일정 게시판',
  '에코디 오늘의 매일묵상 →','에코디 오늘의 매일묵상 보기',
  '공지사항을 불러오는 중입니다.','공개 일정을 확인하고 있습니다.',
  '등록된 공지사항이 없습니다.','예정된 공개 일정이 없습니다.',
  '교회 일정 보기','선교회 일정 보기','교회 공지 보기','교회','선교회'];

test('all eight non-Korean locales cover reviewed home notices and schedules wording',async()=>{
  const [base,extended]=await Promise.all([read('church-i18n.js'),read('church-i18n-extended.js')]);
  for(const key of HOME_KEYS){
    assert.ok(base.includes("'"+key+"':{en:")||base.includes('"'+key+'":{en:'),'base en/zh/ja '+key);
    assert.ok(extended.includes("add('"+key+"',"),'extended my/kac/vi/mn/id '+key);
  }
});

test('home notices hide untranslated user-authored titles for non-Korean; detail view keeps original',async()=>{
  const [updates,schedules]=await Promise.all([read('church-public-updates.js'),read('church-shared-schedules.js')]);
  assert.ok(updates.includes("korean()||!compact?post.title:'교회 공지 보기'"));
  assert.ok(updates.includes("if(next===paintedLang)return"));
  assert.ok(updates.includes("if(!compact)textWrap.append"));
  assert.ok(updates.includes("if(managerToken&&detail&&kind==='schedule'&&item.source==='board')"));
  assert.ok(schedules.includes('const detailTitle=event=>'));
  assert.ok(schedules.includes("return event.source==='ekodichurch'?words().churchEvent:words().missionEvent"));
  assert.ok(schedules.includes('const detailVenue=value=>'));
  assert.ok(schedules.includes("window.addEventListener('ekodi:locale-change'"));
  assert.ok(schedules.includes('originShort(event)'));
  assert.ok(schedules.includes("badge.setAttribute('aria-label',origin(event))"));
  assert.doesNotMatch(schedules,/innerHTML|\bPOST\b|\bPATCH\b|\bDELETE\b/);
});

test('compact dot + source label, calendar touch areas, shared header and original manager controls remain',async()=>{
  const [css,home,schedule,notices]=await Promise.all([
    read('church-shared-calendar.css'),read('index.html'),read('schedule/index.html'),read('notices/index.html')
  ]);
  assert.ok(css.includes('.church-schedule-origin::before{content:"";width:.45rem'));
  assert.ok(css.includes('min-height:44px;min-width:44px'));
  assert.ok(css.includes('.church-calendar-day{min-height:44px'));
  assert.ok(home.includes('<span>교회·선교회 공개 일정</span>'));
  assert.ok(home.includes('매주 토요일 오전 11시'));
  assert.doesNotMatch(home,/토요모임<\/span><strong>매주 토요일 오후 5시/);
  assert.ok(schedule.includes('<a href="/ekodichurch/">에코디교회</a> · 주요일정'));
  assert.ok(notices.includes('<a href="/ekodichurch/">에코디교회</a> · 공지사항'));
  assert.ok(schedule.includes('data-church-public-manage hidden'));
  assert.ok(schedule.includes('data-church-schedule data-limit="100"'));
  assert.ok(schedule.includes('church-shared-schedules.js'));
});
