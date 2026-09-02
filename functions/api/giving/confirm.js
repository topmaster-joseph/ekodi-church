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

function fromBase64Url(value) {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(value.length / 4) * 4, '=');
  const binary = atob(base64);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

async function verify(secret, payload, signature) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify'],
  );
  return crypto.subtle.verify('HMAC', key, fromBase64Url(signature), new TextEncoder().encode(payload));
}

export async function onRequestPost({ request, env }) {
  const secretKey = String(env.TOSS_SECRET_KEY || '').trim();
  const clientKey = String(env.TOSS_CLIENT_KEY || '').trim();
  if (!secretKey || !clientKey) {
    return json({ code: 'PAYMENT_NOT_CONFIGURED', message: '카드·간편결제 운영키가 아직 연결되지 않았습니다.' }, 503);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ code: 'INVALID_JSON', message: '요청 형식이 올바르지 않습니다.' }, 400);
  }

  const paymentKey = String(body?.paymentKey || '').trim();
  const orderId = String(body?.orderId || '').trim();
  const amount = Number(body?.amount);
  const token = String(body?.token || '').trim();
  const [payload, signature, extra] = token.split('.');
  if (!paymentKey || !orderId || !Number.isInteger(amount) || !payload || !signature || extra) {
    return json({ code: 'INVALID_CONFIRMATION', message: '결제 승인 정보가 올바르지 않습니다.' }, 400);
  }

  if (!(await verify(secretKey, payload, signature))) {
    return json({ code: 'INVALID_SIGNATURE', message: '결제 요청 검증에 실패했습니다.' }, 400);
  }

  let signedOrder;
  try {
    signedOrder = JSON.parse(new TextDecoder().decode(fromBase64Url(payload)));
  } catch {
    return json({ code: 'INVALID_TOKEN', message: '결제 요청 정보가 손상되었습니다.' }, 400);
  }

  if (signedOrder.orderId !== orderId || signedOrder.amount !== amount || !TYPE_LABELS[signedOrder.givingType]) {
    return json({ code: 'PAYMENT_MISMATCH', message: '결제 금액 또는 주문번호가 요청 정보와 일치하지 않습니다.' }, 400);
  }
  if (!Number.isFinite(signedOrder.expiresAt) || Date.now() > signedOrder.expiresAt) {
    return json({ code: 'PAYMENT_EXPIRED', message: '결제 승인 시간이 만료되었습니다. 다시 시도해 주세요.' }, 400);
  }

  const authorization = `Basic ${btoa(`${secretKey}:`)}`;
  let upstream;
  try {
    upstream = await fetch('https://api.tosspayments.com/v1/payments/confirm', {
      method: 'POST',
      headers: {
        authorization,
        'content-type': 'application/json',
        'idempotency-key': `church-giving-${orderId}`,
      },
      body: JSON.stringify({ paymentKey, orderId, amount }),
    });
  } catch {
    return json({ code: 'PAYMENT_NETWORK_ERROR', message: '결제사 승인 서버에 연결하지 못했습니다.' }, 502);
  }

  let payment;
  try {
    payment = await upstream.json();
  } catch {
    return json({ code: 'PAYMENT_INVALID_RESPONSE', message: '결제사 응답을 확인하지 못했습니다.' }, 502);
  }

  if (!upstream.ok) {
    return json({
      code: String(payment?.code || 'PAYMENT_CONFIRM_FAILED'),
      message: String(payment?.message || '결제 승인에 실패했습니다.'),
    }, upstream.status >= 400 && upstream.status < 600 ? upstream.status : 502);
  }

  try {
    const financeUrl = String(env.FINANCE_WEBHOOK_URL || 'https://finance-api.ekodi.kr/webhooks/toss').trim();
    if (financeUrl) {
      const financeResponse = await fetch(financeUrl, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          eventType: 'PAYMENT_STATUS_CHANGED',
          data: { paymentKey: String(payment?.paymentKey || paymentKey), orderId, status: String(payment?.status || 'DONE') },
        }),
      });
      if (!financeResponse.ok) console.warn('[EKODI Church Giving] finance sync delayed', financeResponse.status);
    }
  } catch (error) {
    console.warn('[EKODI Church Giving] finance sync unavailable', error?.message || error);
  }

  return json({
    ok: true,
    orderId,
    amount,
    givingType: signedOrder.givingType,
    givingLabel: TYPE_LABELS[signedOrder.givingType],
    method: String(payment?.method || ''),
    approvedAt: String(payment?.approvedAt || ''),
    receiptUrl: String(payment?.receipt?.url || ''),
  });
}
