import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const status=await readFile(new URL('../church-online-status.js',import.meta.url),'utf8');
const styles=await readFile(new URL('../church-live-entry.css',import.meta.url),'utf8');

test('language control hides the visible Language chrome and remains accessible',()=>{
  assert.match(status,/querySelector\('\.ekodi-user-language__icon'\)\?\.remove\(\)/);
  assert.match(status,/querySelector\('\.ekodi-user-language__label'\)\?\.remove\(\)/);
  assert.match(status,/setAttribute\('aria-label','언어 선택'\)/);
  assert.match(styles,/\.ekodi-user-language__icon,\.site-header \.ekodi-user-language__label\{display:none!important\}/);
  assert.match(styles,/\.ekodi-user-language__select\{[^}]*border-radius:999px!important/s);
});

test('My EKODI routes through central auth and returns to the requested page',()=>{
  assert.match(status,/new URL\('\/auth\/',location\.origin\)/);
  assert.match(status,/login\.searchParams\.set\('site','church'\)/);
  assert.match(status,/login\.searchParams\.set\('return_to',destination\)/);
  assert.match(status,/link\.href=login\.toString\(\)/);
});

test('multilingual live opens inside the church site with full-page fallback',()=>{
  assert.match(status,/dialog\.id='churchLiveDialog'/);
  assert.match(status,/<iframe id="churchLiveDialogFrame"/);
  assert.match(status,/allow="camera; microphone; autoplay; fullscreen; display-capture; clipboard-write"/);
  assert.match(status,/openIntegratedLive\(join\.href,'다국어 실시간 방송 참여'\)/);
  assert.match(status,/openIntegratedLive\(host\.href,'다국어 실시간 방송 스튜디오'\)/);
  assert.match(status,/if\(typeof dialog\.showModal!=='function'\)\{\s*location\.assign\(href\)/s);
  assert.match(styles,/\.church-live-dialog\{/);
  assert.match(styles,/\.church-live-dialog iframe\{/);
});
