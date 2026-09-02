import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const read = (name) => readFile(new URL(`../${name}`, import.meta.url), 'utf8');

test('online giving keeps bank transfer available and the Toss checkout shell wired', async () => {
  const html = await read('index.html');
  const runtime = await read('giving.js');
  assert.match(html, /id="giving"/);
  assert.match(html, /355-0088-5391-83/);
  assert.match(html, /782301-01-666597/);
  assert.match(html, /id="giving-dialog"/);
  assert.match(runtime, /js\.tosspayments\.com\/v2\/standard/);
  assert.match(runtime, /\/api\/giving\/order/);
  assert.match(runtime, /\/api\/giving\/confirm/);
});

test('giving security policy permits only required external payment and media origins', async () => {
  const headers = await read('_headers');
  assert.match(headers, /https:\/\/js\.tosspayments\.com/);
  assert.match(headers, /https:\/\/\*\.tosspayments\.com/);
  assert.match(headers, /https:\/\/www\.youtube-nocookie\.com/);
  assert.match(headers, /frame-ancestors 'none'/);
  assert.match(headers, /object-src 'none'/);
  assert.doesNotMatch(headers, /unsafe-eval/);
});

test('giving backend fails closed without keys and syncs approved payments to finance core', async () => {
  const config = await read('functions/api/giving/config.js');
  const order = await read('functions/api/giving/order.js');
  const confirm = await read('functions/api/giving/confirm.js');
  assert.match(config, /env\.TOSS_CLIENT_KEY/);
  assert.match(config, /env\.TOSS_SECRET_KEY/);
  assert.match(order, /PAYMENT_NOT_CONFIGURED/);
  assert.match(confirm, /idempotency-key/);
  assert.match(confirm, /finance-api\.ekodi\.kr\/webhooks\/toss/);
  const combined = `${config}\n${order}\n${confirm}`;
  assert.doesNotMatch(combined, /(?:live|test)_(?:sk|gsk|ck|gck)_[A-Za-z0-9_-]+/);
});
