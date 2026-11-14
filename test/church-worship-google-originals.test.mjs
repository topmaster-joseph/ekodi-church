import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const html=read('mypage/index.html'),js=read('mypage/app.js'),css=read('mypage/styles.css');
const pure=js.slice(js.indexOf('const ORIGINAL_TYPES='),js.indexOf('async function loadOriginals(){'));
if(!pure.startsWith('const ORIGINAL_TYPES='))throw new Error('originals pure helpers missing');
const {originalName,originalGoogleUrl}=runInNewContext(pure+';({originalName,originalGoogleUrl})',{URL});

test('worship preparation room renders three Google-native edit cards only after authorization',()=>{
  assert.match(html,/id="originalWorkbench" hidden/);
  for(const kind of ['sermon','bulletin','slides'])assert.match(html,new RegExp('data-original-kind="'+kind+'"'));
  assert.equal((html.match(/data-original-edit hidden target="_blank" rel="noopener noreferrer"/g)||[]).length,3);
  assert.match(html,/id="originalDate"/);
  assert.match(html,/id="originalStatus"/);
  assert.match(js,/status!=='active'\|\|role!=='tenant_admin'/);
  assert.match(js,/await initOriginalWorkbench\(\)/);
  assert.match(js,/if\(!box\|\|!accessReady\|\|!sb.ready\)return/);
  assert.match(js,/church_worship_sources\?select=service_date,bulletin_url,sermon_url,slides_url/);
  assert.match(js,/if\(!accessReady\|\|!sb.ready\|\|pick.value!==date\)return/);
  assert.doesNotMatch(html,/1OMawt9zy1tM7S9JLlK|17MulbaPg33AKFFi|1EMoG2Q0zJW/,'Google IDs are fetched from private RLS data');
  assert.match(css,/@media\(max-width:850px\)/);
});

test('file name convention is date plus exact type and no draft suffix',()=>{
  assert.equal(originalName('2026-11-15','sermon'),'261115에코디설교');
  assert.equal(originalName('2026-11-15','bulletin'),'261115에코디주보');
  assert.equal(originalName('2026-11-15','slides'),'261115에코디PPT');
  assert.equal(originalName('2026-11-08','bulletin'),'261108에코디주보');
  assert.equal(originalName('invalid-date','sermon'),'');
  assert.equal(originalName('2026-11-15','unknown'),'');
  const rules=read('worship/WEEKLY_RULES.md');
  for(const value of ['YYMMDD에코디설교','YYMMDD에코디주보','YYMMDD에코디PPT'])assert.ok(rules.includes(value),value);
  assert.match(rules,/파일명에는 공백/);
  assert.match(rules,/materials\.json\.stage/);
});

test('Google source validation accepts only correct editable Docs or Slides URLs',()=>{
  const doc='https://docs.google.com/document/d/1OMawt9zy1tM7S9JLlK_J_dHRxjLtgE-4rqWgmWxFpXk/edit';
  const deck='https://docs.google.com/presentation/d/1EMoG2Q0zJW-9QUWqUsWnbjDldts67Ynt1Os7Yk6jZ1U/edit';
  assert.equal(originalGoogleUrl(doc,'sermon'),doc);
  assert.equal(originalGoogleUrl(deck,'slides'),deck);
  assert.equal(originalGoogleUrl(doc+'?usp=drivesdk','bulletin'),doc);
  assert.equal(originalGoogleUrl(doc,'slides'),'');
  assert.equal(originalGoogleUrl(deck,'sermon'),'');
  assert.equal(originalGoogleUrl('https://docs.google.com.evil.invalid/document/d/1OMawt9zy1tM7S9JLlK_J_dHRxjLtgE-4rqWgmWxFpXk/edit','sermon'),'');
  assert.equal(originalGoogleUrl('https://drive.google.com/drive/folders/123','sermon'),'');
  assert.equal(originalGoogleUrl('javascript:alert(1)','sermon'),'');
});

test('verified Google originals preserve existing file IDs and publishing stage',()=>{
  for(const [date,expected] of [
    ['2026-11-15',{bulletin:'261115에코디주보',slides:'261115에코디PPT',sermon:'261115에코디설교'}],
    ['2026-11-01',{bulletin:'261101에코디주보',slides:'261101에코디PPT',sermon:'261101에코디설교'}]
  ]){
    const packet=JSON.parse(read('worship/'+date+'/materials.json'));
    for(const [kind,title] of Object.entries(expected)){
      assert.equal(packet.sources[kind].title,title);
      assert.match(packet.sources[kind].url,/^https:\/\/docs\.google\.com\/(?:document|presentation)\/d\/[A-Za-z0-9_-]+\/edit$/);
      assert.ok(packet.sources[kind].fileId.length>=20);
    }
    assert.equal(packet.stage,date==='2026-11-15'?'draft':'final');
  }
  const old=JSON.parse(read('worship/2026-11-08/materials.json'));
  assert.equal(old.sources.bulletin.title,'261108에코디주보');
  assert.equal(old.sources.slides.title,'261108에코디PPT');
  assert.ok(old.sources.sermon.fileId,'unavailable 11/08 source preserved for manual verification, not overwritten');
  assert.match(js,/원본 수정은 Google Drive에 바로 저장되지만|원본 연결 저장 실패/);
  assert.match(html,/자동 게시되지 않습니다/);
});
