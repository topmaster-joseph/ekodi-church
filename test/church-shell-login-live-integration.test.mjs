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

test('Church member header remains site-local and its member page independently owns Google auth',()=>{
  assert.match(status,/function syncChurchMemberLink\(\)/);
  assert.match(status,/const local='\/ekodichurch\/my\/'/);
  assert.doesNotMatch(status,/link\.href=login\.toString\(\)/);
  assert.doesNotMatch(status,/wireMyEkodi/);
  const begin=status.indexOf('function syncChurchMemberLink(){');
  const next=status.indexOf('\n  function apply(',begin);
  assert.ok(begin>0&&next>begin);
  const attrs={href:'/auth/?site=church&return_to=%2Fekodichurch%2Fmy%2F'};
  const link={
    getAttribute:key=>attrs[key],
    setAttribute:(key,value)=>{attrs[key]=value;},
    removeAttribute:key=>{delete attrs[key];}
  };
  const mockDocument={querySelector:selector=>selector==='.site-header .shell-my'?link:null};
  const sync=new Function('document',status.slice(begin,next)+'\nreturn syncChurchMemberLink;')(mockDocument);
  sync();
  assert.equal(attrs.href,'/ekodichurch/my/');
  assert.equal(attrs['aria-label'],undefined);
  sync();
  assert.equal(attrs.href,'/ekodichurch/my/');
});

test('church delegates media to EKODI Live without modal or camera iframe',()=>{
  assert.match(status,/const baseJoin='\/live\/church\/'/);
  assert.match(status,/tenant=ekodichurch/);
  assert.doesNotMatch(status,/churchLiveDialog|openIntegratedLive|wireIntegratedLive|<iframe/);
  assert.doesNotMatch(styles,/\.church-live-dialog/);
});
