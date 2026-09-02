# ekodi-church-homepage
에코디교회 공식 홈페이지 · Cloudflare Pages 배포 구성

## 온라인 헌금
- 계좌이체는 PG 상태와 무관하게 항상 제공됩니다.
- 카드·간편결제는 Toss Payments V2 주문서형 결제를 사용합니다.
- Pages 운영 환경에는 `TOSS_CLIENT_KEY`, `TOSS_SECRET_KEY`가 모두 있어야 활성화됩니다.
- 승인 완료 후 `finance-api.ekodi.kr/webhooks/toss`로 재검증 기반 회계 동기화를 시도합니다.
- `FINANCE_WEBHOOK_URL`을 지정하면 별도 재무 코어로 교체할 수 있습니다.

## 검증
`npm test`로 헌금 UI, 결제 API 계약, CSP 허용 범위와 하드코딩 키 부재를 확인합니다.
