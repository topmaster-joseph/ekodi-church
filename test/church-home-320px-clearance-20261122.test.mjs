import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const css=readFileSync(new URL('../church-homepage-layout.css',import.meta.url),'utf8');
test('320px multilingual Church home preserves clearance below shared sticky header',()=>{
  assert.match(css,/@media\(max-width:540px\)\{body:not\(:has\(main :target\)\) main > \.hero\{padding:42px 14px 30px!important\}/);
  assert.match(css,/body:not\(:has\(main :target\)\) main > \.hero \.eyebrow\{scroll-margin-top:16px\}/);
  assert.match(css,/body:has\(main :target\) \.hero\{display:none!important\}/);
  assert.doesNotMatch(css,/\.site-header\s*\{\s*position:fixed/);
});