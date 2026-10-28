import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const read=path=>fs.readFileSync(new URL(path,import.meta.url),'utf8');

test('member home includes member-only approved finance summary entry',()=>{
 const home=read('../my/index.html');
 assert.match(home,/href="\/ekodichurch\/my\/finance\/"/);
 assert.match(home,/공동체 재정공개/);
});
test('financial report page preserves privacy and tenant scope',()=>{
 const page=read('../my/finance/index.html');
 const app=read('../my/finance/app.js');
 assert.match(page,/noindex,nofollow,noarchive/);
 assert.match(page,/name="section" value="income"/);
 assert.match(page,/name="section" value="expense"/);
 assert.match(page,/name="section" value="balance"/);
 assert.match(app,/site:'ekodichurch'/);
 assert.match(app,/ministry-member-finance-api/);
 assert.match(app,/Bearer '\+accessToken/);
 assert.match(app,/cache:'no-store'/);
 assert.doesNotMatch(app,/\.innerHTML\s*=/);
 assert.doesNotMatch(app,/SUPABASE_SERVICE_ROLE_KEY|service_role/);
});
