const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status,
  headers: {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
  },
});

export function onRequestGet({ env }) {
  const clientKey = String(env.TOSS_CLIENT_KEY || '').trim();
  const secretKey = String(env.TOSS_SECRET_KEY || '').trim();
  const enabled = Boolean(clientKey && secretKey);

  return json({
    provider: 'toss',
    enabled,
    clientKey: enabled ? clientKey : '',
    currency: 'KRW',
    minAmount: 1000,
    maxAmount: 10000000,
  });
}
