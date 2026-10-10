import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const script=readFileSync(new URL('../script.js',import.meta.url),'utf8');
test('published worship uses same-origin public API under strict CSP',()=>{
 assert.ok(script.includes('/api/public/church/worship?'));
 assert.ok(script.includes('new URLSearchParams({ from: today })'));
 assert.ok(!script.includes('PUBLISHABLE_KEY'));
 assert.ok(!script.includes('SUPABASE_URL'));
});
test('published worship failure leaves static schedule intact',()=>{
 assert.ok(script.includes('if (!rows.length) return'));
 assert.ok(script.includes('static schedule retained'));
});
