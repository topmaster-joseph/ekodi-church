(() => {
  const openButton = document.querySelector('#open-giving-payment');
  const statusNode = document.querySelector('#giving-payment-status');
  const dialog = document.querySelector('#giving-dialog');
  const typeSelect = document.querySelector('#giving-type');
  const amountInput = document.querySelector('#giving-amount');
  const payButton = document.querySelector('#giving-pay-button');
  const resultNode = document.querySelector('#giving-result');
  const formNode = document.querySelector('#giving-form');
  const presets = [...document.querySelectorAll('[data-giving-amount]')];

  if (!openButton || !statusNode || !dialog || !typeSelect || !amountInput || !payButton) return;

  let config = null;
  let widgets = null;
  let widgetPromise = null;

  const tr = (source, vars = {}) => window.EKODIChurchI18n?.t?.(source, vars) || source;
  const clampAmount = (value) => {
    const number = Number.parseInt(String(value).replace(/[^0-9]/g, ''), 10);
    if (!Number.isFinite(number)) return 0;
    return Math.min(10000000, Math.max(1000, number));
  };
  const amountText = (value) => window.EKODIChurchI18n?.formatAmount?.(value) || `${Number(value).toLocaleString('ko-KR')}원`;

  function setStatus(message, state = '') {
    statusNode.textContent = tr(message);
    statusNode.dataset.state = state;
  }

  function setDialogResult(message, ok, receiptUrl = '') {
    if (formNode) formNode.hidden = true;
    resultNode.hidden = false;
    resultNode.classList.toggle('is-success', Boolean(ok));
    resultNode.classList.toggle('is-error', !ok);
    resultNode.replaceChildren();

    const title = document.createElement('strong');
    title.textContent = tr(ok ? '헌금 결제가 완료되었습니다.' : '결제를 완료하지 못했습니다.');
    const copy = document.createElement('p');
    copy.textContent = tr(message);
    resultNode.append(title, copy);

    if (ok && receiptUrl) {
      const receipt = document.createElement('a');
      receipt.href = receiptUrl;
      receipt.target = '_blank';
      receipt.rel = 'noreferrer noopener';
      receipt.textContent = tr('결제 영수증 보기 ↗');
      resultNode.append(receipt);
    }
  }

  async function loadTossSdk() {
    if (window.TossPayments) return;
    await new Promise((resolve, reject) => {
      const existing = document.querySelector('script[data-toss-payments-sdk]');
      if (existing) {
        existing.addEventListener('load', resolve, { once: true });
        existing.addEventListener('error', reject, { once: true });
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://js.tosspayments.com/v2/standard';
      script.async = true;
      script.dataset.tossPaymentsSdk = 'true';
      script.addEventListener('load', resolve, { once: true });
      script.addEventListener('error', reject, { once: true });
      document.head.append(script);
    });
  }

  async function initializeWidgets() {
    if (widgets) return widgets;
    if (widgetPromise) return widgetPromise;
    widgetPromise = (async () => {
      await loadTossSdk();
      if (!window.TossPayments || !config?.clientKey) throw new Error('payment_sdk_unavailable');
      const tossPayments = window.TossPayments(config.clientKey);
      const nextWidgets = tossPayments.widgets({ customerKey: 'ANONYMOUS' });
      const amount = clampAmount(amountInput.value || 10000);
      amountInput.value = String(amount);
      await nextWidgets.setAmount({ currency: 'KRW', value: amount });
      await nextWidgets.renderPaymentMethods({ selector: '#payment-method' });
      await nextWidgets.renderAgreement({ selector: '#agreement' });
      widgets = nextWidgets;
      return widgets;
    })().catch((error) => {
      widgetPromise = null;
      throw error;
    });
    return widgetPromise;
  }

  async function syncWidgetAmount() {
    if (!widgets) return;
    const amount = clampAmount(amountInput.value);
    if (!amount) return;
    amountInput.value = String(amount);
    await widgets.setAmount({ currency: 'KRW', value: amount });
    payButton.textContent = `${amountText(amount)} ${tr('선택한 금액 결제하기')}`;
  }

  async function fetchConfig() {
    try {
      const response = await fetch('/api/giving/config', { headers: { accept: 'application/json' }, cache: 'no-store' });
      if (!response.ok) throw new Error(`config_${response.status}`);
      config = await response.json();
      if (config.enabled && config.provider === 'toss' && config.clientKey) {
        openButton.disabled = false;
        openButton.textContent = tr('카드·간편결제');
        setStatus('카드·간편결제와 계좌이체를 사용할 수 있습니다.', 'ready');
      } else {
        openButton.disabled = true;
        openButton.textContent = tr('카드·간편결제 PG 연결 필요');
        setStatus('계좌이체는 바로 이용할 수 있으며 카드·간편결제는 PG 운영키 연결 후 자동 활성화됩니다.', 'pending');
      }
    } catch (error) {
      console.warn('[EKODI Church Giving] payment config unavailable', error?.message || error);
      openButton.disabled = true;
      openButton.textContent = tr('카드·간편결제 연결 확인 필요');
      setStatus('현재 계좌이체를 이용해 주세요.', 'error');
    }
  }

  openButton.addEventListener('click', async () => {
    if (!config?.enabled) return;
    if (formNode) formNode.hidden = false;
    resultNode.hidden = true;
    if (typeof dialog.showModal === 'function' && !dialog.open) dialog.showModal();
    try {
      openButton.disabled = true;
      openButton.textContent = tr('결제창 준비 중');
      await initializeWidgets();
      await syncWidgetAmount();
    } catch (error) {
      console.error('[EKODI Church Giving] widget initialization failed', error);
      setDialogResult('결제창을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.', false);
    } finally {
      openButton.disabled = false;
      openButton.textContent = tr('카드·간편결제');
    }
  });

  presets.forEach((button) => button.addEventListener('click', async () => {
    const amount = clampAmount(button.dataset.givingAmount);
    amountInput.value = String(amount);
    presets.forEach((item) => item.classList.toggle('active', item === button));
    await syncWidgetAmount();
  }));

  amountInput.addEventListener('change', async () => {
    presets.forEach((item) => item.classList.remove('active'));
    await syncWidgetAmount();
  });

  payButton.addEventListener('click', async () => {
    const amount = clampAmount(amountInput.value);
    if (!config?.enabled || !widgets || amount < 1000) return;

    payButton.disabled = true;
    payButton.textContent = tr('결제 요청 중…');
    try {
      const response = await fetch('/api/giving/order', {
        method: 'POST',
        headers: { 'content-type': 'application/json', accept: 'application/json' },
        body: JSON.stringify({ givingType: typeSelect.value, amount }),
      });
      const order = await response.json();
      if (!response.ok || !order.orderId || !order.token) throw new Error(order.message || order.code || 'order_failed');

      await widgets.setAmount({ currency: 'KRW', value: order.amount });
      const successUrl = new URL('/', window.location.origin);
      successUrl.searchParams.set('giving', 'success');
      successUrl.searchParams.set('token', order.token);
      const failUrl = new URL('/', window.location.origin);
      failUrl.searchParams.set('giving', 'fail');

      await widgets.requestPayment({
        orderId: order.orderId,
        orderName: order.orderName,
        successUrl: successUrl.toString(),
        failUrl: failUrl.toString(),
      });
    } catch (error) {
      console.error('[EKODI Church Giving] payment request failed', error);
      setDialogResult('결제 요청을 시작하지 못했습니다. 결제 연결 상태를 확인하거나 계좌이체를 이용해 주세요.', false);
      payButton.disabled = false;
      payButton.textContent = `${amountText(amount)} ${tr('선택한 금액 결제하기')}`;
    }
  });

  async function handlePaymentReturn() {
    const params = new URLSearchParams(window.location.search);
    const flow = params.get('giving');
    if (!flow) return;

    if (typeof dialog.showModal === 'function' && !dialog.open) dialog.showModal();

    if (flow === 'fail') {
      const message = params.get('message') || '결제가 취소되었거나 인증에 실패했습니다.';
      setDialogResult(message, false);
      window.history.replaceState({}, document.title, `${window.location.pathname}#giving`);
      return;
    }

    if (flow !== 'success') return;
    const paymentKey = params.get('paymentKey');
    const orderId = params.get('orderId');
    const amount = Number(params.get('amount'));
    const token = params.get('token');
    if (!paymentKey || !orderId || !Number.isInteger(amount) || !token) {
      setDialogResult('결제 승인 정보가 올바르지 않습니다. 교회로 문의해 주세요.', false);
      return;
    }

    setDialogResult('결제 승인을 확인하고 있습니다.', true);
    try {
      const response = await fetch('/api/giving/confirm', {
        method: 'POST',
        headers: { 'content-type': 'application/json', accept: 'application/json' },
        body: JSON.stringify({ paymentKey, orderId, amount, token }),
      });
      const result = await response.json();
      if (!response.ok || !result.ok) throw new Error(result.message || result.code || 'confirm_failed');
      const label = result.givingLabel || '헌금';
      const approved = `${label} ${amountText(result.amount)} ${tr('헌금 결제가 완료되었습니다.')}`;
      setDialogResult(approved, true, result.receiptUrl || '');
      window.history.replaceState({}, document.title, `${window.location.pathname}#giving`);
    } catch (error) {
      console.error('[EKODI Church Giving] payment confirmation failed', error);
      setDialogResult('결제 인증 후 승인 확인에 문제가 생겼습니다. 중복 결제하지 마시고 교회로 문의해 주세요.', false);
    }
  }

  window.addEventListener('ekodi:church-i18n-applied', () => {
    if (config?.enabled) {
      openButton.textContent = tr('카드·간편결제');
      setStatus('카드·간편결제와 계좌이체를 사용할 수 있습니다.', 'ready');
    } else if (config) {
      openButton.textContent = tr('카드·간편결제 PG 연결 필요');
      setStatus('계좌이체는 바로 이용할 수 있으며 카드·간편결제는 PG 운영키 연결 후 자동 활성화됩니다.', 'pending');
    }
    if (widgets) void syncWidgetAmount();
  });

  fetchConfig();
  handlePaymentReturn();
})();
