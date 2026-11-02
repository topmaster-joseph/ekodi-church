import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const read=path=>readFile(new URL('../'+path,import.meta.url),'utf8');

test('public Church sections remain canonical direct links with compact native tabs',async()=>{
  const html=await read('index.html');
  const css=await read('church-homepage-layout.css');
  const names=['about','life-hub','community','worship','weekly-worship','partner-news','online','location'];
  for(const section of names){
    assert.ok(html.includes('href="#'+section+'"'),'missing public destination '+section);
    assert.ok(html.includes('id="'+section+'"'),'missing section '+section);
  }
  assert.match(css,/body:not\(:has\(main :target\)\) main > \.hero/);
  assert.match(css,/main:has\(:target\) > section:not\(\.hero\):not\(:target\):not\(:has\(:target\)\)/);
  assert.match(css,/body:has\(main :target\) main > \.hero\{/);
  assert.match(css,/position:fixed!important/);
  assert.match(css,/grid-template-columns:repeat\(4,minmax\(0,1fr\)\)/);
  assert.match(css,/overflow-wrap:normal!important/);
});

test('member cards retain all personal destinations and readable compact layout',async()=>{
  const html=await read('my/index.html');
  const css=await read('my/styles.css');
  assert.match(css,/\.quick-grid\{display:grid;grid-template-columns:repeat\(3,minmax\(0,1fr\)\)/);
  assert.match(css,/@media\(max-width:520px\)/);
  assert.match(css,/\.quick-grid\{grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
  for(const url of ['/ekodichurch/my/giving/','/ekodichurch/my/attendance/','/ekodichurch/live/']){
    assert.ok(html.includes('href="'+url+'"'),'missing member link '+url);
  }
  assert.match(html,/id="presenceAdminLink"[^>]*hidden/);
  assert.match(html,/id="loginAction"/);
});
