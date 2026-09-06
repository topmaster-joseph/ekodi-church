const API_BASE = 'https://api.ekodi.kr/api/church/participation';
const params = new URLSearchParams(location.search);
const token = String(params.get('g') || '').trim();
const requestedChannel = String(params.get('channel') || '').trim().toLowerCase();

const $ = (id) => document.getElementById(id);
const form = $('checkin-form');
const loadingState = $('loading-state');
const errorState = $('error-state');
const successState = $('success-state');
const statusPill = $('gathering-status');
const gatheringPanel = $('gathering-panel');
const gatheringTitle = $('gathering-title');
const gatheringTime = $('gathering-time');
const gatheringLocation = $('gathering-location');
const submitButton = form.querySelector('button[type="submit"]');

function visitorKey() {
  const storageKey = 'ekodi.church.participation.visitor.v1';
  let value = localStorage.getItem(storageKey);
  if (!value || value.length < 16) {
    value = crypto.randomUUID();
    localStorage.setItem(storageKey, value);
  }
  return value;
}

function formatTime(value, timezone = 'Asia/Seoul') {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('ko-KR', {
    timeZone: timezone,
    month: 'long',
    day: 'numeric',
    weekday: 'short',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

function showError(message) {
  loadingState.hidden = true;
  successState.hidden = true;
  form.hidden = true;
  errorState.textContent = message;
  errorState.hidden = false;
  statusPill.textContent = '체크인할 수 없습니다';
}

function showGathering(gathering) {
  loadingState.hidden = true;
  errorState.hidden = true;
  gatheringTitle.textContent = gathering.title || '에코디교회 모임';
  gatheringTime.textContent = formatTime(gathering.startsAt, gathering.timezone);
  gatheringLocation.textContent = gathering.location || '함께하는 자리';
  gatheringPanel.hidden = false;
  form.hidden = false;
  statusPill.textContent = '체크인 열림';
}

function applyRequestedChannel() {
  if (!['onsite', 'online', 'hybrid'].includes(requestedChannel)) return;
  const input = form.querySelector(`input[name="channel"][value="${requestedChannel}"]`);
  if (input) input.checked = true;
}

async function readJson(response) {
  return response.json().catch(() => ({}));
}

async function loadGathering() {
  if (!token || token.length < 24) {
    showError('체크인 주소가 올바르지 않습니다. 새 QR 또는 체크인 주소를 다시 열어 주세요.');
    return;
  }
  try {
    const response = await fetch(`${API_BASE}/gatherings/${encodeURIComponent(token)}`, {
      headers: { accept: 'application/json' },
      cache: 'no-store',
    });
    const data = await readJson(response);
    if (!response.ok) throw new Error(data.error || '모임 정보를 불러올 수 없습니다.');
    showGathering(data.gathering);
    applyRequestedChannel();
  } catch (error) {
    showError(error.message || '모임 정보를 확인하는 중 문제가 발생했습니다.');
  }
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const data = new FormData(form);
  const displayName = String(data.get('displayName') || '').trim();
  if (displayName.length < 2) {
    $('display-name').focus();
    return;
  }

  submitButton.disabled = true;
  submitButton.textContent = '기록하고 있습니다';
  errorState.hidden = true;
  try {
    const response = await fetch(`${API_BASE}/check-ins`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify({
        token,
        displayName,
        participantKind: String(data.get('participantKind') || 'guest'),
        channel: String(data.get('channel') || 'onsite'),
        visitorKey: visitorKey(),
      }),
    });
    const result = await readJson(response);
    if (!response.ok) throw new Error(result.error || '참여를 기록하지 못했습니다.');
    successState.textContent = result.duplicate
      ? '이미 함께함이 기록되어 있습니다. 다시 눌러도 한 번만 기록됩니다.'
      : '함께하신 참여가 기록되었습니다. 오늘의 만남이 서로를 살리는 교제가 되기를 바랍니다.';
    successState.hidden = false;
    form.hidden = true;
    statusPill.textContent = '함께함 기록 완료';
  } catch (error) {
    errorState.textContent = error.message || '참여를 기록하는 중 문제가 발생했습니다.';
    errorState.hidden = false;
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = '함께합니다';
  }
});

loadGathering();
