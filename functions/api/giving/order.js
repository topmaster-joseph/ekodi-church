const TYPE_LABELS = {
  tithe_sunday: '십일조·주일헌금',
  mission: '선교헌금',
  thanksgiving: '감사헌금',
  other: '기타헌금',
};

const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status,
  headers: {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
  },
});

function base64Url(bytes) {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

async function sign(secret, payload) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload));
  return base64Url(new Uint8Array(signature));
}

function randomId() {
  const bytes = crypto.getRandomValues(new Uint8Array(10));
  return [...bytes].map((value) => value.toString(16).padStart(2, '0')).join('');
}

export async function onRequestPost({ request, env }) {
  const clientKey = String(env.TOSS_CLIENT_KEY || '').trim();
  const secretKey = String(env.TOSS_SECRET_KEY || '').trim();
  if (!clientKey || !secretKey) {
    return json({ code: 'PAYMENT_NOT_CONFIGURED', message: '카드·간편결제 운영키가 아직 연결되지 않았습니다.' }, 503);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ code: 'INVALID_JSON', message: '요청 형식이 올바르지 않습니다.' }, 400);
  }

  const givingType = String(body?.givingType || '');
  const amount = Number(body?.amount);
  const givingLabel = TYPE_LABELS[givingType];
  if (!givingLabel) return json({ code: 'INVALID_GIVING_TYPE', message: '헌금 종류를 다시 선택해 주세요.' }, 400);
  if (!Number.isInteger(amount) || amount < 1000 || amount > 10000000) {
    return json({ code: 'INVALID_AMOUNT', message: '헌금 금액은 1,000원 이상 10,000,000원 이하로 입력해 주세요.' }, 400);
  }

  const orderId = `CHURCH_${Date.now()}_${randomId()}`;
  const expiresAt = Date.now() + 15 * 60 * 1000;
  const payloadBytes = new TextEncoder().encode(JSON.stringify({
    orderId,
    amount,
    givingType,
    expiresAt,
  }));
  const payload = base64Url(payloadBytes);
  const signature = await sign(secretKey, payload);

  return json({
    orderId,
    orderName: `에코디교회 ${givingLabel}`,
    amount,
    givingType,
    givingLabel,
    token: `${payload}.${signature}`,
  });
}
