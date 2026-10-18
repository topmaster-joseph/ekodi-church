#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export function kstDate(now=new Date()) {
  const parts=Object.fromEntries(new Intl.DateTimeFormat('en-US',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now).filter(p=>p.type!=='literal').map(p=>[p.type,p.value]));
  return [parts.year,parts.month,parts.day].join('-');
}
export function nextSunday(today) {
  if(!/^\d{4}-\d{2}-\d{2}$/.test(today))throw new Error('Invalid preparation date');
  const date=new Date(today+'T00:00:00Z');
  if(Number.isNaN(date.getTime())||date.toISOString().slice(0,10)!==today)throw new Error('Invalid calendar day');
  return new Date(date.getTime()+((7-date.getUTCDay())||7)*86400000).toISOString().slice(0,10);
}
export function prepare({root=ROOT,today=kstDate(),dryRun=false}={}) {
  const sunday=nextSunday(today);
  const index=JSON.parse(fs.readFileSync(path.join(root,'worship/weekly.json'),'utf8'));
  if(index.services.some(s=>s.date===sunday))return {status:'already-prepared',sunday};
  const previous=index.services.filter(s=>s.date<sunday).sort((a,b)=>b.date.localeCompare(a.date))[0];
  if(!previous)throw new Error('No previous worship baseline');
  const priorFile='worship/'+previous.date+'/materials.json';
  const prior=JSON.parse(fs.readFileSync(path.join(root,priorFile),'utf8'));
  if(prior.date!==previous.date||prior.schema!=='ekodi.worship.materials.v1')throw new Error('Baseline mismatch');
  const dir='preparation/'+sunday;
  const manifest={
    schema:'ekodi.church.sunday.preparation.v1',
    date:sunday,preparedFrom:today,timezone:'Asia/Seoul',
    serviceTime:prior.time||'11:00',referenceMaterials:priorFile,
    state:'EKODI_AI_TASK_DRAFT_NOT_PUBLISHED',
    scripture:'UNCONFIRMED_USE_EKODI_APPROVED_REGISTRY',
    pckChurchYear:'VERIFY_OFFICIAL_PCK_CALENDAR',
    publishAllowed:false,
    expectedWorshipPage:'/ekodichurch/worship/'+sunday+'/',
    preserve:['members','offerings','authentication','prior-week-bulletin','prior-week-ppt','church-live']
  };
  const plan=[
    '# EKODI AI 주일모임 준비 — '+sunday,
    '',
    '- 매주 수요일 '+today+' (KST) 자동 생성하는 다음 주일 준비 요청',
    '- 예배: '+sunday+' '+manifest.serviceTime+' KST',
    '- 직전 자료: '+priorFile+' (원형·내용·형식 계승)',
    '- 현재 상태: 작성 요청 초안, 검토 전, 공개 금지',
    '',
    '## EKODI 오케스트레이터 실행 요청',
    '1. EKODI 공통 성경본문 레지스트리와 이전 주 실제 자료를 먼저 확인해 다가오는 주일 본문·말씀 제목을 확정한다. 모르면 미확정 표시한다.',
    '2. 설교원고 배경설명은 네 층으로 구분한다: 본문 역사·문맥 / 해당 성경 권 전체 핵심·구조 / 성경 전체의 창조·언약·구속·새 창조와 그리스도 복음 / 예장통합 공식 교회력·절기·정과와 목회 적용.',
    '3. 실제 설교원고를 서론·본론·결론·복음 적용·에클레시아·코이노니아·디아스포라·희년·나눔 질문·공동체 응답·마침기도 순서로 작성한다.',
    '4. 직전 주 실사용 주보와 PPT의 형식과 전체 흐름을 계승하여 예배순서·주보·주간 묵상·교회소식·발표용 PPT를 갱신한다.',
    '5. PPT의 다국어 주기도문은 한 슬라이드에서 언어 선택·음성 재생을 할 수 있는 기존 방향을 유지한다. 별도 언어 슬라이드를 무분별하게 늘리지 않는다.',
    '6. 유튜브 제목·설명·섬네일·공개 범위·예약 초안을 준비하고, EKODI 방송진행자 QR 카메라·영상·채팅 리사이즈·다중송출을 점검한다. 실제 YouTube 인증/예약은 권한 보유 관리자만 한다.',
    '7. 담당자·찬양곡·성서정과·계정·방송URL을 추측하지 않는다. Google 로그인·주보·PPT·회원·헌금 원본을 보존한다.',
    '8. 배포는 EKODI 정식 작업 → CI → 정확한 SHA Human Gate → 보호 병합 → Church Pages 스테이징·운영 → EKODI 자체 Chromium PC·모바일 실증 및 운영증거 확인 순서로 진행한다.',
    '',
    '## 결과 확인 체크리스트',
    '- [ ] 레지스트리 본문·설교 제목 확정',
    '- [ ] 예장통합 공식 교회력 및 절기 대조',
    '- [ ] 성경 네 단계 배경설명과 완전한 설교원고',
    '- [ ] 주보, 예배순서, 교회소식, 7일 묵상',
    '- [ ] 전주 양식 PPT 및 한 장 다국어 주기도문',
    '- [ ] 방송 예약·관리자 권한·EKODI Live 검증',
    '- [ ] 보호된 운영 배포 및 PC·모바일 실서비스 근거',
    '',
    '> 이 자동 초안은 실제 설교·PPT·유튜브 예약 완료를 주장하지 않습니다.'
  ].join('\n')+'\n';
  if(!dryRun){
    const out=path.join(root,dir);
    fs.mkdirSync(out,{recursive:true});
    for(const [file,body] of [['plan.json',JSON.stringify(manifest,null,2)+'\n'],['WEDNESDAY-PREPARATION.md',plan]]){
      fs.writeFileSync(path.join(out,file),body,{flag:'wx'});
    }
  }
  return {status:dryRun?'validated':'draft-created',sunday,dir};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const date=process.argv.find(s=>s.startsWith('--today='))?.slice(8)||kstDate();
  const outcome=prepare({today:date,dryRun:process.argv.includes('--dry-run')});
  console.log(JSON.stringify(outcome));
  if(process.env.GITHUB_OUTPUT)fs.appendFileSync(process.env.GITHUB_OUTPUT,'sunday='+outcome.sunday+'\nstatus='+outcome.status+'\n');
}
