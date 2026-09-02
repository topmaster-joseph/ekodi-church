const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status,
  headers: {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
  },
});

const CHURCH_CHECKOUT = Object.freeze({
  provider: 'missionfund',
  enabled: true,
  organization: '에코디교회',
  checkoutUrl: 'https://go.missionfund.org/fmd01',
  methods: ['card', 'bank-auto-debit'],
  processors: {
    card: 'NICE Payments',
    bankAutoDebit: 'KFTC CMS',
  },
});

export function onRequestGet() {
  return json(CHURCH_CHECKOUT);
}
