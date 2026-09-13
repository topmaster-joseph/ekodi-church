import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFile } from 'node:fs/promises';

const root=new URL('../',import.meta.url);
const read=name=>readFile(new URL(name,root),'utf8');

async function liveSource(){return read('live/live.js')}

function extractFunction(source,name,nextName){
  const start=source.indexOf(`function ${name}`);
  const end=source.indexOf(`function ${nextName}`,start);
  assert.notEqual(start,-1,`${name} must exist`);
  assert.notEqual(end,-1,`${nextName} must follow ${name}`);
  return source.slice(start,end).trim();
}

test('live auth return target strips one-time auth fragments without losing studio intent',async()=>{
  const source=await liveSource();
  const fnSource=extractFunction(source,'safeReturnTo','login');
  const sandbox={
    URL,
    URLSearchParams,
    location:{href:'https://ekodi.kr/ekodichurch/live/?mode=studio#ekodi_token=once&ekodi_type=email'}
  };
  const safeReturnTo=vm.runInNewContext(`(${fnSource})`,sandbox);
  assert.equal(safeReturnTo(),'https://ekodi.kr/ekodichurch/live/?mode=studio');

  sandbox.location.href='https://ekodi.kr/ekodichurch/live/?mode=studio#agenda';
  assert.equal(safeReturnTo(),'https://ekodi.kr/ekodichurch/live/?mode=studio#agenda');
});

test('live auth consumes handoff URL before OTP verification can fail',async()=>{
  const source=await liveSource();
  const start=source.indexOf('async function bootstrapCentralAuth');
  const end=source.indexOf('async function waitIce',start);
  assert.notEqual(start,-1);
  assert.notEqual(end,-1);
  const bootstrap=source.slice(start,end);
  const cleanIndex=bootstrap.indexOf("history.replaceState(null,'',location.pathname+location.search)");
  const verifyIndex=bootstrap.indexOf('sb.auth.verifyOtp');
  assert.ok(cleanIndex>=0,'handoff URL must be cleared');
  assert.ok(verifyIndex>=0,'OTP verification must still run');
  assert.ok(cleanIndex<verifyIndex,'handoff URL must be cleared before OTP verification');
});

test('central login redirect always uses the sanitized return target',async()=>{
  const source=await liveSource();
  assert.match(source,/return_to=\$\{encodeURIComponent\(safeReturnTo\(\)\)\}/);
  assert.doesNotMatch(source,/const back=location\.href;location\.href=`https:\/\/ekodi\.kr\/auth/);
});
