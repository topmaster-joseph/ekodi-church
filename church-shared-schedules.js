// Official Church ↔ Mission calendar. Read only, same-origin, published metadata.
(()=>{
  'use strict';
  const root=document.querySelector('[data-church-shared-schedules]');
  if(!root)return;
  const list=root.querySelector('[data-church-schedules-list]');
  if(!list)return;
  const calendar=root.querySelector('[data-church-shared-calendar]');
  const upcoming=root.querySelector('[data-church-upcoming-list]');
  const escUrl=value=>/^\/(?:ekodichurch|ekodimission)(?:\/|\?|$)/.test(value||'')?value:'';
  const add=(tag,cls='',text='')=>{
    const item=document.createElement(tag);
    if(cls)item.className=cls;
    if(text)item.textContent=text;
    return item;
  };
  const markOriginal=node=>{
    node.setAttribute('data-ekodi-user-content','');
    node.setAttribute('lang','ko');
    node.setAttribute('translate','no');
    return node;
  };
  const fmt=date=>/^\d{4}-\d{2}-\d{2}$/.test(date||'')?date.replace(/-/g,'.'):'';
  const today=()=>{
    const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());
    const get=type=>parts.find(x=>x.type===type)?.value||'';
    return [get('year'),get('month'),get('day')].join('-');
  };

  // Event titles, venue and descriptions belong to the original author. For
  // unprovided translations, show a localized detail-link label instead of
  // inventing a translation or leaking untranslated Korean into other locales.
  const LANG=Object.freeze({
    'ko-KR':{church:'교회 일정',mission:'선교회 일정',churchName:'에코디교회',missionName:'에코디선교회',churchEvent:'교회 모임 상세',missionEvent:'선교회 모임 상세',venue:'장소는 일정 상세에서 확인',view:'일정 보기',empty:'예정된 공개 일정이 없습니다.',selectedEmpty:'선택한 날짜의 공개 일정이 없습니다.',failed:'현재 공유 일정을 불러오지 못했습니다. 잠시 후 다시 확인해 주세요.',events:'일정',day:'일',count:'건',saturday:'이번 주 토요일 ',square:'목포 평화광장',saturdayTitle:'토요 성경토론과 함께하는 식사'},
    en:{church:'Church event',mission:'Mission event',churchName:'EKODI Church',missionName:'EKODI Mission',churchEvent:'Church gathering details',missionEvent:'Mission gathering details',venue:'See location in event details',view:'View event',empty:'No upcoming public events.',selectedEmpty:'No public events on this date.',failed:'The shared schedule is temporarily unavailable.',events:'events',day:'day',count:'events',saturday:'This Saturday ',square:'Mokpo Peace Square',saturdayTitle:'Saturday Bible discussion and shared meal'},
    'zh-CN':{church:'教会日程',mission:'宣教会日程',churchName:'EKODI教会',missionName:'EKODI宣教会',churchEvent:'查看教会聚会',missionEvent:'查看宣教会聚会',venue:'地点请查看活动详情',view:'查看日程',empty:'暂无即将举行的公开活动。',selectedEmpty:'该日期暂无公开活动。',failed:'暂时无法加载共享日程。',events:'日程',day:'日',count:'项',saturday:'本周六 ',square:'木浦和平广场',saturdayTitle:'周六圣经讨论与聚餐'},
    ja:{church:'教会の予定',mission:'宣教会の予定',churchName:'EKODI教会',missionName:'EKODI宣教会',churchEvent:'教会の集会を見る',missionEvent:'宣教会の集会を見る',venue:'場所は予定の詳細をご確認ください',view:'予定を見る',empty:'今後の公開予定はありません。',selectedEmpty:'この日の公開予定はありません。',failed:'共有予定を取得できません。',events:'予定',day:'日',count:'件',saturday:'今週土曜日 ',square:'木浦平和広場',saturdayTitle:'土曜の聖書対話と食事'},
    my:{church:'အသင်းတော် အစီအစဉ်',mission:'သာသနာပြု အစီအစဉ်',churchName:'EKODI အသင်းတော်',missionName:'EKODI သာသနာပြုအဖွဲ့',churchEvent:'အသင်းတော်စုဝေးပွဲ အသေးစိတ်',missionEvent:'သာသနာပြုစုဝေးပွဲ အသေးစိတ်',venue:'တည်နေရာကို အစီအစဉ်အသေးစိတ်တွင် ကြည့်ပါ',view:'အစီအစဉ်ကြည့်ရန်',empty:'လာမည့် အများပြည်သူအတွက် အစီအစဉ် မရှိပါ။',selectedEmpty:'ဤနေ့တွင် အများပြည်သူအတွက် အစီအစဉ် မရှိပါ။',failed:'မျှဝေထားသော အစီအစဉ်ကို ယာယီ မရနိုင်ပါ။',events:'အစီအစဉ်',day:'နေ့',count:'ခု',saturday:'ယခုစနေနေ့ ',square:'Mokpo Peace Square',saturdayTitle:'စနေနေ့ ကျမ်းစာဆွေးနွေးခြင်းနှင့် အတူစားသောက်ခြင်း'},
    kac:{church:'Church events',mission:'Mission events',churchName:'EKODI Church',missionName:'EKODI Mission',churchEvent:'View church gathering',missionEvent:'View mission gathering',venue:'See venue in event details',view:'View event',empty:'No upcoming public events.',selectedEmpty:'No public events on this date.',failed:'Shared events are temporarily unavailable.',events:'events',day:'day',count:'events',saturday:'This Saturday ',square:'Mokpo Peace Square',saturdayTitle:'Saturday Bible discussion and shared meal'},
    vi:{church:'Lịch Hội thánh',mission:'Lịch Hội Truyền giáo',churchName:'Hội thánh EKODI',missionName:'Hội Truyền giáo EKODI',churchEvent:'Chi tiết sinh hoạt Hội thánh',missionEvent:'Chi tiết sinh hoạt truyền giáo',venue:'Xem địa điểm trong chi tiết sự kiện',view:'Xem sự kiện',empty:'Không có sự kiện công khai sắp tới.',selectedEmpty:'Không có sự kiện công khai trong ngày này.',failed:'Tạm thời không tải được lịch chung.',events:'sự kiện',day:'ngày',count:'sự kiện',saturday:'Thứ Bảy tuần này ',square:'Quảng trường Hòa bình Mokpo',saturdayTitle:'Trao đổi Kinh Thánh và dùng bữa chung thứ Bảy'},
    mn:{church:'Сүмийн хуваарь',mission:'Номлолын хуваарь',churchName:'EKODI сүм',missionName:'EKODI номлол',churchEvent:'Сүмийн уулзалтын дэлгэрэнгүй',missionEvent:'Номлолын уулзалтын дэлгэрэнгүй',venue:'Байршлыг үйл явдлын мэдээллээс харна уу',view:'Үйл явдал үзэх',empty:'Удахгүй болох нээлттэй үйл явдал алга.',selectedEmpty:'Энэ өдөр нээлттэй үйл явдал алга.',failed:'Хамтарсан хуваарь түр хугацаанд боломжгүй.',events:'үйл явдал',day:'өдөр',count:'удаа',saturday:'Энэ Бямба гарагт ',square:'Мокпо Энхтайвны талбай',saturdayTitle:'Бямба гарагийн Библийн хэлэлцүүлэг, хамтын хоол'},
    id:{church:'Jadwal Gereja',mission:'Jadwal Misi',churchName:'Gereja EKODI',missionName:'Misi EKODI',churchEvent:'Detail pertemuan gereja',missionEvent:'Detail pertemuan misi',venue:'Lihat lokasi di detail acara',view:'Lihat acara',empty:'Belum ada acara publik mendatang.',selectedEmpty:'Tidak ada acara publik pada tanggal ini.',failed:'Jadwal bersama sedang tidak tersedia.',events:'acara',day:'hari',count:'acara',saturday:'Sabtu ini ',square:'Alun-alun Perdamaian Mokpo',saturdayTitle:'Diskusi Alkitab dan makan bersama pada Sabtu'}
  });
  const locale=()=>{
    const q=new URLSearchParams(location.search).get('lang');
    const raw=q||window.EKODIChurchExtendedI18n?.getLocale?.()||window.EKODIChurchI18n?.getLocale?.()||document.documentElement.lang||'ko-KR';
    const value=raw==='ko'?'ko-KR':raw==='en-US'?'en':raw==='zh'?'zh-CN':raw==='ja-JP'?'ja':raw;
    return Object.hasOwn(LANG,value)?value:'ko-KR';
  };
  const words=()=>LANG[locale()];
  const origin=item=>item.source==='ekodichurch'?words().church:words().mission;
  const dateLabel=(date)=>{
    if(locale()==='ko-KR')return fmt(date);
    const [y,m,d]=date.split('-').map(Number);
    return new Intl.DateTimeFormat(locale()==='kac'?'en-US':locale(),{timeZone:'UTC',year:'numeric',month:'short',day:'numeric'}).format(new Date(Date.UTC(y,m-1,d)));
  };
  const labelTime=value=>{
    const [h,m]=String(value||'').split(':').map(Number);
    if(!Number.isInteger(h)||!Number.isInteger(m))return '';
    if(locale()==='ko-KR')return (h>=12?'오후 ':'오전 ')+(h%12||12)+':'+String(m).padStart(2,'0');
    return new Intl.DateTimeFormat(locale()==='kac'?'en-US':locale(),{timeZone:'UTC',hour:'numeric',minute:'2-digit'}).format(new Date(Date.UTC(2000,0,1,h,m)));
  };
  const detailTitle=event=>{
    const name=String(event.title||'');
    if(!/[가-힣]/.test(name))return name||words().view;
    if(locale()==='ko-KR')return name;
    if(name==='토요 성경토론과 함께하는 식사')return words().saturdayTitle;
    return event.source==='ekodichurch'?words().churchEvent:words().missionEvent;
  };
  const detailVenue=value=>{
    const name=String(value||'');
    if(locale()==='ko-KR'||!/[가-힣]/.test(name))return name;
    if(name==='목포 평화광장')return words().square;
    if(name==='에코디교회')return words().churchName;
    if(name==='에코디선교회')return words().missionName;
    return words().venue;
  };
  let entries=[],month=today().slice(0,7),selected=today();
  const error=(message)=>{
    list.replaceChildren(add('li','church-shared-empty',message));
    if(upcoming)upcoming.replaceChildren(add('li','church-shared-empty',message));
  };
  function paintRows(target,items,limit,empty){
    if(!target)return;
    target.replaceChildren();
    const filtered=items.filter(item=>escUrl(item.url)).slice(0,limit);
    if(!filtered.length){target.append(add('li','church-shared-empty',empty));return;}
    for(const event of filtered){
      const row=add('li'),link=add('a','church-shared-link',detailTitle(event));
      link.href=escUrl(event.url);
      const badge=add('span','church-schedule-origin church-schedule-origin-'+event.source,origin(event));
      const sourceLabel=event.source==='ekodichurch'?words().churchName:words().missionName;
      const meta=add('span','church-shared-meta',[
        sourceLabel,dateLabel(event.date),labelTime(event.time),detailVenue(event.venue)
      ].filter(Boolean).join(' · '));
      // Member-authored title/venue stay in their original language (원문 표시).
      for(const original of [link,meta])markOriginal(original);
      row.append(badge,link,meta);target.append(row);
    }
  }
  function calendarForMonth(){
    if(!calendar)return;
    const days=calendar.querySelector('[data-church-calendar-days]');
    const label=calendar.querySelector('[data-church-calendar-month]');
    const selectedLabel=root.querySelector('[data-church-selected-day]');
    if(!days||!label)return;
    const [year,mm]=month.split('-').map(Number);
    const countDays=new Date(Date.UTC(year,mm,0)).getUTCDate();
    const first=new Date(Date.UTC(year,mm-1,1)).getUTCDay();
    label.textContent=locale()==='ko-KR'?year+'년 '+mm+'월':new Intl.DateTimeFormat(locale()==='kac'?'en-US':locale(),{year:'numeric',month:'long',timeZone:'UTC'}).format(new Date(Date.UTC(year,mm-1,1)));
    if(selectedLabel)selectedLabel.textContent=dateLabel(selected)+' '+words().events;
    const counts=new Map();
    for(const item of entries){
      if(!item.date?.startsWith(month+'-'))continue;
      const byDay=counts.get(item.date)||{church:0,mission:0};
      byDay[item.source==='ekodichurch'?'church':'mission']+=1;
      counts.set(item.date,byDay);
    }
    days.replaceChildren();
    for(let i=0;i<first;i++){
      const spacer=add('span','church-calendar-empty');
      spacer.setAttribute('aria-hidden','true');days.append(spacer);
    }
    for(let day=1;day<=countDays;day++){
      const date=month+'-'+String(day).padStart(2,'0');
      const info=counts.get(date)||{church:0,mission:0};
      const button=add('button','church-calendar-day',String(day));
      button.type='button';
      button.dataset.date=date;
      button.setAttribute('aria-label',dateLabel(date)+', '+words().church+' '+info.church+', '+words().mission+' '+info.mission);
      button.setAttribute('aria-pressed',String(date===selected));
      if(date===today())button.classList.add('is-today');
      if(info.church)button.classList.add('has-church-event');
      if(info.mission)button.classList.add('has-mission-event');
      button.addEventListener('click',()=>{
        selected=date;
        calendarForMonth();
        paintRows(list,entries.filter(item=>item.date===selected),100,words().selectedEmpty);
      });
      days.append(button);
    }
  }
  function paint(items){
    entries=items;
    if(calendar){
      calendarForMonth();
      paintRows(list,entries.filter(item=>item.date===selected),100,words().selectedEmpty);
      paintRows(upcoming,entries,12,words().empty);
    }else{
      paintRows(list,entries,Math.min(7,Math.max(1,Number(root.dataset.limit)||7)),words().empty);
    }
  }
  async function load(){
    try{
      const response=await fetch('/ekodichurch/board/api/shared-schedules',{
        credentials:'same-origin',headers:{accept:'application/json'},
        cache:'no-store',signal:AbortSignal.timeout(9000)
      });
      const data=response.ok?await response.json().catch(()=>null):null;
      if(data?.ok!==true||data.mode!=='published-read-only'||!Array.isArray(data.items))
        throw new Error('schedule_service_unavailable');
      const items=data.items.filter(x=>x&&['ekodichurch','ekodimission'].includes(x.source)&&
        /^\d{4}-\d{2}-\d{2}$/.test(x.date)&&x.date>=today()&&
        /^([01]\d|2[0-3]):[0-5]\d$/.test(x.time)&&escUrl(x.url)&&
        typeof x.title==='string'&&x.title.length<=160);
      const unique=new Map();
      for(const item of items){
        const key=[item.source,item.kind,item.id,item.date,item.time,item.title].join('|');
        if(!unique.has(key))unique.set(key,item);
      }
      paint([...unique.values()].sort((a,b)=>a.date.localeCompare(b.date)||a.time.localeCompare(b.time)||a.source.localeCompare(b.source)));
      const saturdayDate=(()=>{
        const [year,mm,day]=today().split('-').map(Number);
        const date=new Date(Date.UTC(year,mm-1,day));
        date.setUTCDate(date.getUTCDate()+(6-date.getUTCDay()+7)%7);
        return date.toISOString().slice(0,10);
      })();
      const saturday=items.find(x=>x.source==='ekodimission'&&x.kind==='recurring-meeting'&&x.date===saturdayDate);
      if(saturday){
        const target=document.querySelector('#worship .schedule>div:nth-child(2) strong');
        if(target)target.textContent=words().saturday+labelTime(saturday.time);
      }
    }catch{
      error(words().failed);
    }
  }
  if(calendar){
    const offset=delta=>{
      const [y,m]=month.split('-').map(Number);
      const d=new Date(Date.UTC(y,m-1+delta,1));
      month=d.getUTCFullYear()+'-'+String(d.getUTCMonth()+1).padStart(2,'0');
      selected=month+'-01';
      calendarForMonth();
      paintRows(list,entries.filter(item=>item.date===selected),100,words().selectedEmpty);
    };
    calendar.querySelector('[data-church-calendar-prev]')?.addEventListener('click',()=>offset(-1));
    calendar.querySelector('[data-church-calendar-next]')?.addEventListener('click',()=>offset(1));
    calendar.querySelector('[data-church-calendar-today]')?.addEventListener('click',()=>{
      selected=today();month=selected.slice(0,7);
      calendarForMonth();
      paintRows(list,entries.filter(item=>item.date===selected),100,words().selectedEmpty);
    });
  }
  window.addEventListener('ekodi:locale-change',()=>{paint(entries)});
    document.addEventListener('visibilitychange',()=>{if(!document.hidden)void load()});
  window.addEventListener('focus',()=>{void load()});
  const refresh=setInterval(()=>{if(!document.hidden)void load()},300000);
  window.addEventListener('pagehide',()=>clearInterval(refresh),{once:true});
  void load();
})();
