import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

async function source(path){return readFile(new URL('../'+path,import.meta.url),'utf8')}

test('church member page offers logout when authenticated, clears central local session and returns home',async()=>{
  const [page,script]=await Promise.all([source('my/index.html'),source('my/app.js')]);
  assert.match(page,/id="logoutAction"[^>]+hidden/);
  assert.match(script,/logout\.hidden=false/);
  assert.match(script,/logout\.hidden=true/);
  assert.ok(script.includes("const raw=localStorage.getItem('sb-renzehysxirjilvdxacv-auth-token')"));
  assert.ok(!script.includes('/^sb-.*-auth-token$/'), 'unrelated Supabase sessions cannot sign users back into Church');
  assert.match(script,/auth\.signOut\(\{scope:'local'\}\)/);
  assert.match(script,/localStorage\.removeItem\('sb-renzehysxirjilvdxacv-auth-token'\)/);
  assert.match(script,/location\.replace\('\/ekodichurch\/'\)/);
});

test('worship operations page sends signed-out visitors and explicit logout to the public church home',async()=>{
  const [page,script]=await Promise.all([source('mypage/index.html'),source('mypage/app.js')]);
  assert.match(page,/id="worshipLogout"/);
  assert.match(script,/if\(!activeSession\)\{location\.replace\('\/ekodichurch\/'\);return false\}/);
  assert.match(script,/auth\.signOut\(\{scope:'local'\}\)/);
  assert.match(script,/sessionStorage\.removeItem\('ekodi-auth-token'\)/);
  assert.match(script,/location\.replace\('\/ekodichurch\/'\)/);
});
