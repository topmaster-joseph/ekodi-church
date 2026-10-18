import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {kstDate,nextSunday,prepare} from '../scripts/prepare-next-sunday.mjs';

test('Wednesday in Korea prepares upcoming Sunday across months and years',()=>{
  assert.equal(kstDate(new Date('2026-10-20T15:01:00Z')),'2026-10-21');
  assert.equal(nextSunday('2026-10-21'),'2026-10-25');
  assert.equal(nextSunday('2026-10-28'),'2026-11-01');
  assert.equal(nextSunday('2026-12-30'),'2027-01-03');
});
test('generates only guarded preparation requests and retains approved materials',()=>{
  const root=fs.mkdtempSync(path.join(os.tmpdir(),'ekodi-worship-'));
  try{
    fs.mkdirSync(path.join(root,'worship/2026-10-18'),{recursive:true});
    const week={services:[{date:'2026-10-18',status:'prepared',page:'/ekodichurch/worship/2026-10-18/'}]};
    const materials={schema:'ekodi.worship.materials.v1',date:'2026-10-18',time:'11:00',title:'품 안에서, 세상으로'};
    fs.writeFileSync(path.join(root,'worship/weekly.json'),JSON.stringify(week));
    fs.writeFileSync(path.join(root,'worship/2026-10-18/materials.json'),JSON.stringify(materials));
    const r=prepare({root,today:'2026-10-21'});
    assert.equal(r.status,'draft-created');
    const plan=JSON.parse(fs.readFileSync(path.join(root,'preparation/2026-10-25/plan.json'),'utf8'));
    assert.equal(plan.date,'2026-10-25');
    assert.equal(plan.publishAllowed,false);
    assert.match(plan.scripture,/UNCONFIRMED/);
    const md=fs.readFileSync(path.join(root,'preparation/2026-10-25/WEDNESDAY-PREPARATION.md'),'utf8');
    for(const section of ['본문 역사','성경 권 전체','성경 전체','교회력','주보','PPT','유튜브'])assert.ok(md.includes(section),section);
    assert.deepEqual(JSON.parse(fs.readFileSync(path.join(root,'worship/weekly.json'),'utf8')),week);
    assert.deepEqual(JSON.parse(fs.readFileSync(path.join(root,'worship/2026-10-18/materials.json'),'utf8')),materials);
    assert.throws(()=>prepare({root,today:'2026-10-21'}),/EEXIST/);
    assert.equal(prepare({root,today:'2026-10-21',dryRun:true}).status,'validated');
    week.services.push({date:'2026-10-25'});
    fs.writeFileSync(path.join(root,'worship/weekly.json'),JSON.stringify(week));
    assert.equal(prepare({root,today:'2026-10-21'}).status,'already-prepared');
  }finally{fs.rmSync(root,{recursive:true,force:true});}
});
