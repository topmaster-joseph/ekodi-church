import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const core=read('church-i18n.js');
const extended=read('church-i18n-extended.js');
const account=read('church-account-header.js');

test('all nine Church locales translate the account sign-in, sign-out and signing-out controls',()=>{
  for(const label of ['로그인','로그아웃','로그아웃 중']){
    assert.ok(core.includes("'"+label+"':{en:"),'missing English/Chinese/Japanese base label: '+label);
    assert.ok(extended.includes("add('"+label+"',"),'missing extended locale translations: '+label);
  }
  for(const locale of ['en','zh-CN','ja'])assert.match(core,new RegExp("'"+locale+"':|'?"+locale+"':"),locale+' mapping missing');
  assert.match(extended,/const NEW=new Set\(\['my','kac','vi','mn','id'\]\)/);
  assert.match(core,/new MutationObserver\(/);
  assert.match(extended,/new MutationObserver\(schedule\)/);
});

test('verified member display names stay private user content and member route remains intact',()=>{
  assert.match(account,/name\.dataset\.ekodiUserContent = ''/);
  assert.match(account,/name\.href = '\/ekodichurch\/my\/'/);
  assert.match(account,/login\.textContent = '로그인'/);
  assert.match(account,/logout\.textContent = '로그아웃'/);
  assert.match(account,/logout\.textContent = '로그아웃 중'/);
  assert.doesNotMatch(account,/sendBeacon\(/);
});
