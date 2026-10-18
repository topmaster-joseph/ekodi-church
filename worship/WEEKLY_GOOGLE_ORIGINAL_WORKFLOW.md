# EKODI 교회 · 전주 원본 기준 주간 예배자료

## 기준
- 매주 예배 날짜 D의 형식은 D−7일(직전 주일) 실제 발행·사용한 원본 3종: 주보 Google Doc, 전체 Google Slides PPT, 말씀 Google Doc을 복사하여 계승합니다.
- 2026-10-18 기준: 주보 1MRDupBDrocLBZJzggqAY_mk9decuQS8eWS0Gsr37WDI, PPT 10-oyTzG-XZqJf3JF6iFVU40UjnCW71UzXbDUmOTKzxA (현재 확인 36장), 말씀 15WKmDyYo7lfB3UwBze_dgPb2c0K0Lw8BePWiL-sByKY.
- 말씀 문서 식별자는 공개 JSON/HTML에 게시하지 않고 관리자 API에서 검증된 예배 권한에만 제공합니다.

## 매주 복제/검토/승인
1. 직전 주일 실제 발행본 3종을 확인합니다. 다른 간략본이나 시험 자료는 사용하지 않습니다.
2. 3종을 Google Drive에서 각각 복사하여 표·사진·서식·발표화면·목회 원고 단락을 보존합니다.
3. 새로운 날짜·호수·공통본문·설교 제목·교회력·주간 성경읽기·교회소식·나눔 질문을 검증된 자료로 수정합니다. 담당자·출석·찬양·YouTube 예약을 임의 확정하지 않습니다.
4. 주보 및 PPT는 worship/google-drive-public-sources.json에 등록하고, 말씀 원고는 church-admin-sermon-source-api.js의 보호 목록에 등록합니다.
5. 운영 전에 PR CI, 원본 읽기·편집 권한, PC·모바일 표시, 개인정보·외부 음향을 검증하고 소유자 Human Gate 승인을 받습니다.

## 편집과 갱신
- 홈페이지/관리자 화면의 ‘원본 편집’ 버튼은 바로 해당 Google Docs/Slides 원본 탭을 엽니다. Google Workspace가 쓰기 권한을 직접 검사합니다.
- 표시 화면은 문서를 복제하여 렌더링하지 않고, Google 원본을 60초마다 다시 불러옵니다. 이는 별개의 양방향 편집기가 아닌 Google Drive 원본 하나의 읽기 뷰입니다.
- 사용자페이지에 말씀 본문 또는 말씀 파일 주소를 노출하지 않습니다.
- Google 원본 말씀 문서의 ‘링크가 있는 모든 사용자 읽기’ 권한은 소유자가 ‘제한됨’으로 변경해야 실제 직접 접근 차단이 완성됩니다.
- 홈페이지 안에서 텍스트를 직접 고치고 Google Docs API에 저장하는 독립 편집기는 Google OAuth의 Docs 쓰기 범위, 동의, 충돌해결, 서버 저장 비밀키가 설정될 때만 제공할 수 있습니다.

## 완료 기준
- 매주 날짜 차이 7일과 발행본 소스 확인; 주보 지면·전체 PPT·원고 단락 보존.
- 출처가 없는 미래 주일은 과거 예배를 최신 자료처럼 표시하지 않음.
- 운영 관리자 로그인, Google 편집계정, Google Drive 변경 뒤 웹 다시 불러오기, Google 원고 비공개 공유 설정 확인.
- GitHub PR 병합/배포/운영 검증 증거 없이는 완료로 표시하지 않음.
