import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read=path=>readFile(new URL(`../${path}`,import.meta.url),'utf8');

test('church-local My Page is user-facing and separated from admin operations',async()=>{
  const [html,app,publicIndex,publicScript]=await Promise.all([
    read('my/index.html'),read('my/app.js'),read('index.html'),read('script.js')
  ]);
  assert.match(html,/EKODI CHURCH · MY PAGE/);
  assert.match(html,/noindex,nofollow,noarchive/);
  assert.match(html,/https:\/\/ekodi\.kr\/auth\/\?site=church/);
  assert.match(html,/https:\/\/ekodi\.kr\/my\//);
  assert.match(html,/교인·돌봄·권한·사역 운영 데이터는 이 사용자 화면에 노출하지 않습니다/);
  assert.doesNotMatch(html,/church_worship_materials|current_site_access|tenant_admin/);
  assert.match(app,/sb-\.\*-auth-token/);
  assert.match(publicIndex,/https:\/\/ekodi\.kr\/ekodichurch\/my/);
  assert.match(publicScript,/https:\/\/ekodi\.kr\/ekodichurch\/my/);
});

test('legacy worship console remains separate from the member home',async()=>{
  const [member,worship]=await Promise.all([read('my/index.html'),read('mypage/index.html')]);
  assert.match(worship,/예배 운영 콘솔/);
  assert.doesNotMatch(member,/PPT 다운로드|모두 준비하기|church_worship_materials/);
});
