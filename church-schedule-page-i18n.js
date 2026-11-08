// Standalone public Church/Mission calendar: translate UI chrome, never authored posts.
(()=>{
  'use strict';
  if(!document.body?.matches?.('[data-church-public-page="schedule"]'))return;
  const localeAliases={'ko':'ko-KR','en-US':'en','zh':'zh-CN','ja-JP':'ja'};
  const supported=new Set(['ko-KR','en','zh-CN','ja','my','kac','vi','mn','id']);
  const requested=new URLSearchParams(location.search).get('lang')||window.EKODIUserLanguage?.getLocale?.()||document.documentElement.dataset.ekodiLocale||document.documentElement.lang||'ko-KR';
  const locale=localeAliases[requested]||requested;
  if(!supported.has(locale)||locale==='ko-KR')return;
  // Kachin/Jinghpaw uses a clearly identified English fallback where a reviewed
  // translation is not available. Never mislabel an English fallback as Jinghpaw.
  const english={
    brand:'EKODI Church',brandHome:'EKODI Church home',menu:'Main menu',open:'Open menu',
    devotion:'Daily devotion',worship:'Worship & Broadcast',notices:'Notices',
    schedule:'Key dates',together:'Get involved',my:'My page',home:'Church home',
    title:'Church & Mission events',
    intro:'Browse the public Church and Mission calendar by date. Only the originating organization can edit an event.',
    calendar:'Monthly public calendar',monthLoading:'Loading calendar',
    prev:'Previous month',next:'Next month',today:'Today',days:'Select date',
    weekdays:['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],
    legend:'Event source',church:'Church events',mission:'Mission events',
    selected:'Events on the selected date',loading:'Loading events',
    privacy:'Only public events are shared. Private schedules, attendees and personal information remain private.',
    manage:'Church schedule board',missionLink:'View Mission calendar',
    legal:'Legal information',privacyLink:'Privacy policy',terms:'Terms',contact:'Contact',
    footerInfo:'Church information',operator:'Organization: EKODI Church',
    representative:'Representative: Jung Chan-gyun',
    address:'Business address: 1F, 17-4 Baengnyeondong 1-gil, Cheonggye-myeon, Muan-gun',
    reg:'Registration number: 307-82-82097',
    top:'Back to top'
  };
  const translations={
    'zh-CN':{
      brand:'EKODI教会',brandHome:'EKODI教会首页',menu:'主菜单',open:'打开菜单',
      devotion:'每日灵修',worship:'礼拜与直播',notices:'公告',schedule:'主要日程',together:'一同参与',my:'我的页面',home:'教会首页',
      title:'教会与宣教会日程',intro:'按日期查看教会与宣教会的公开日程。只有发布机构可以修改活动。',
      calendar:'每月公开日程',monthLoading:'正在加载日历',prev:'上个月',next:'下个月',today:'今天',days:'选择日期',
      weekdays:['日','一','二','三','四','五','六'],legend:'日程来源',church:'教会日程',mission:'宣教会日程',
      selected:'所选日期的日程',loading:'正在加载日程',privacy:'仅共享公开日程。不共享私人日程、参与者或个人信息。',
      manage:'教会日程公告栏',missionLink:'查看宣教会日程',legal:'法律声明',privacyLink:'隐私政策',terms:'使用条款',contact:'联系',
      footerInfo:'教会信息',operator:'运营机构：EKODI教会',representative:'代表：Jung Chan-gyun',address:'地址：全罗南道务安郡清溪面白莲洞1街17-4，一层',reg:'登记号码：307-82-82097',top:'返回顶部'
    },
    ja:{
      brand:'EKODI教会',brandHome:'EKODI教会ホーム',menu:'メインメニュー',open:'メニューを開く',
      devotion:'毎日の黙想',worship:'礼拝・配信',notices:'お知らせ',schedule:'主な予定',together:'共に歩む',my:'マイページ',home:'教会ホーム',
      title:'教会と宣教会の予定',intro:'教会と宣教会の公開予定を日付別に確認できます。編集は登録元の団体のみ可能です。',
      calendar:'月別の公開予定',monthLoading:'カレンダーを読み込み中',prev:'前の月',next:'次の月',today:'今日',days:'日付を選択',
      weekdays:['日','月','火','水','木','金','土'],legend:'予定の登録元',church:'教会の予定',mission:'宣教会の予定',
      selected:'選択した日の予定',loading:'予定を読み込み中',privacy:'公開予定のみを共有します。非公開予定、参加者、個人情報は共有しません。',
      manage:'教会の予定掲示板',missionLink:'宣教会の予定を見る',legal:'法的情報',privacyLink:'プライバシーポリシー',terms:'利用規約',contact:'お問い合わせ',
      footerInfo:'教会情報',operator:'運営：EKODI教会',representative:'代表：Jung Chan-gyun',address:'所在地：韓国全羅南道務安郡清溪面白蓮洞1ギル17-4、1階',reg:'登録番号：307-82-82097',top:'ページ上部へ'
    },
    vi:{
      brand:'Hội thánh EKODI',brandHome:'Trang chủ Hội thánh EKODI',menu:'Trình đơn chính',open:'Mở trình đơn',
      devotion:'Tĩnh nguyện hằng ngày',worship:'Thờ phượng & phát sóng',notices:'Thông báo',schedule:'Lịch chính',together:'Cùng tham gia',my:'Trang cá nhân',home:'Trang chủ',
      title:'Lịch Hội thánh và Hội Truyền giáo',intro:'Xem lịch công khai của Hội thánh và Hội Truyền giáo theo ngày. Chỉ đơn vị đăng mới được sửa sự kiện.',
      calendar:'Lịch công khai hằng tháng',monthLoading:'Đang tải lịch',prev:'Tháng trước',next:'Tháng sau',today:'Hôm nay',days:'Chọn ngày',
      weekdays:['CN','T2','T3','T4','T5','T6','T7'],legend:'Nguồn sự kiện',church:'Lịch Hội thánh',mission:'Lịch Truyền giáo',
      selected:'Sự kiện trong ngày',loading:'Đang tải sự kiện',privacy:'Chỉ chia sẻ sự kiện công khai. Không chia sẻ lịch riêng, người tham dự hoặc dữ liệu cá nhân.',
      manage:'Bảng lịch Hội thánh',missionLink:'Xem lịch Truyền giáo',legal:'Thông tin pháp lý',privacyLink:'Quyền riêng tư',terms:'Điều khoản',contact:'Liên hệ',
      footerInfo:'Thông tin Hội thánh',operator:'Đơn vị: Hội thánh EKODI',representative:'Đại diện: Jung Chan-gyun',address:'Địa chỉ: Tầng 1, 17-4 Baengnyeondong 1-gil, Cheonggye-myeon, Muan-gun',reg:'Số đăng ký: 307-82-82097',top:'Lên đầu trang'
    },
    mn:{
      brand:'EKODI сүм',brandHome:'EKODI сүмийн нүүр',menu:'Үндсэн цэс',open:'Цэс нээх',
      devotion:'Өдрийн бясалгал',worship:'Мөргөл ба нэвтрүүлэг',notices:'Зарлал',schedule:'Гол хуваарь',together:'Хамт оролцох',my:'Миний хуудас',home:'Сүмийн нүүр',
      title:'Сүм ба номлолын хуваарь',intro:'Сүм болон номлолын нээлттэй үйл явдлыг өдрөөр харна уу. Зөвхөн бүртгэсэн байгууллага засварлана.',
      calendar:'Сарын нээлттэй хуваарь',monthLoading:'Хуваарийг ачаалж байна',prev:'Өмнөх сар',next:'Дараах сар',today:'Өнөөдөр',days:'Өдөр сонгох',
      weekdays:['Ня','Да','Мя','Лх','Пү','Ба','Бя'],legend:'Эх сурвалж',church:'Сүмийн хуваарь',mission:'Номлолын хуваарь',
      selected:'Сонгосон өдрийн үйл явдал',loading:'Ачаалж байна',privacy:'Зөвхөн нээлттэй үйл явдал нийтлэгдэнэ. Хувийн хуваарь, оролцогч, хувийн мэдээлэл нууц хэвээр.',
      manage:'Сүмийн хуваарийн самбар',missionLink:'Номлолын хуваарь үзэх',legal:'Эрх зүйн мэдээлэл',privacyLink:'Нууцлалын бодлого',terms:'Үйлчилгээний нөхцөл',contact:'Холбоо барих',
      footerInfo:'Сүмийн мэдээлэл',operator:'Байгууллага: EKODI сүм',representative:'Төлөөлөгч: Jung Chan-gyun',address:'Хаяг: Өмнөд Солонгос, Муан-гүн, Чонгё-мён, 17-4',reg:'Бүртгэлийн дугаар: 307-82-82097',top:'Дээш'
    },
    id:{
      brand:'Gereja EKODI',brandHome:'Beranda Gereja EKODI',menu:'Menu utama',open:'Buka menu',
      devotion:'Renungan harian',worship:'Ibadah & siaran',notices:'Pengumuman',schedule:'Jadwal utama',together:'Ikut serta',my:'Halaman saya',home:'Beranda gereja',
      title:'Jadwal Gereja dan Misi',intro:'Lihat kegiatan publik Gereja dan Misi berdasarkan tanggal. Hanya organisasi asal yang dapat mengubah acara.',
      calendar:'Kalender publik bulanan',monthLoading:'Memuat kalender',prev:'Bulan sebelumnya',next:'Bulan berikutnya',today:'Hari ini',days:'Pilih tanggal',
      weekdays:['Min','Sen','Sel','Rab','Kam','Jum','Sab'],legend:'Sumber acara',church:'Jadwal Gereja',mission:'Jadwal Misi',
      selected:'Acara pada tanggal terpilih',loading:'Memuat acara',privacy:'Hanya acara publik yang dibagikan. Jadwal privat, peserta dan data pribadi tidak dibagikan.',
      manage:'Papan jadwal Gereja',missionLink:'Lihat jadwal Misi',legal:'Informasi hukum',privacyLink:'Kebijakan privasi',terms:'Ketentuan',contact:'Kontak',
      footerInfo:'Informasi Gereja',operator:'Pengelola: Gereja EKODI',representative:'Perwakilan: Jung Chan-gyun',address:'Alamat: Lt. 1, 17-4 Baengnyeondong 1-gil, Cheonggye-myeon, Muan-gun',reg:'Nomor registrasi: 307-82-82097',top:'Kembali ke atas'
    },
    my:{
      brand:'EKODI အသင်းတော်',brandHome:'EKODI အသင်းတော် ပင်မစာမျက်နှာ',menu:'ပင်မမီနူး',open:'မီနူးဖွင့်ရန်',
      devotion:'နေ့စဉ်တရားရှုမှတ်ခြင်း',worship:'ဝတ်ပြုခြင်းနှင့် ထုတ်လွှင့်ခြင်း',notices:'ကြေညာချက်များ',schedule:'အဓိကအစီအစဉ်',together:'ပါဝင်ရန်',my:'ကျွန်ုပ်၏စာမျက်နှာ',home:'အသင်းတော် ပင်မစာမျက်နှာ',
      title:'အသင်းတော်နှင့် သာသနာပြု အစီအစဉ်',intro:'အသင်းတော်နှင့် သာသနာပြုအဖွဲ့၏ အများပြည်သူဆိုင်ရာ အစီအစဉ်များကို နေ့အလိုက် ကြည့်နိုင်သည်။ မူရင်းအဖွဲ့သာ ပြင်ဆင်နိုင်သည်။',
      calendar:'လစဉ် အများပြည်သူဆိုင်ရာ ပြက္ခဒိန်',monthLoading:'ပြက္ခဒိန် ဖွင့်နေသည်',prev:'ပြီးခဲ့သောလ',next:'နောက်လ',today:'ယနေ့',days:'နေ့စွဲရွေးပါ',
      weekdays:['တနင်္ဂနွေ','တနင်္လာ','အင်္ဂါ','ဗုဒ္ဓဟူး','ကြာသပတေး','သောကြာ','စနေ'],legend:'အစီအစဉ်၏ မူရင်း',church:'အသင်းတော် အစီအစဉ်',mission:'သာသနာပြု အစီအစဉ်',
      selected:'ရွေးချယ်သောနေ့၏ အစီအစဉ်များ',loading:'အစီအစဉ်များ ဖွင့်နေသည်',privacy:'အများပြည်သူဆိုင်ရာ အစီအစဉ်များကိုသာ မျှဝေသည်။ ကိုယ်ရေးအချက်အလက်များကို မမျှဝေပါ။',
      manage:'အသင်းတော် အစီအစဉ်စာရင်း',missionLink:'သာသနာပြု ပြက္ခဒိန်',legal:'ဥပဒေဆိုင်ရာ အသိပေးချက်',privacyLink:'ကိုယ်ရေးလုံခြုံရေးမူဝါဒ',terms:'အသုံးပြုမှု စည်းကမ်းချက်များ',contact:'ဆက်သွယ်ရန်',
      footerInfo:'အသင်းတော် အချက်အလက်',operator:'အဖွဲ့အစည်း: EKODI အသင်းတော်',representative:'ကိုယ်စားလှယ်: Jung Chan-gyun',address:'လိပ်စာ: 17-4 Baengnyeondong 1-gil, Cheonggye-myeon, Muan-gun',reg:'မှတ်ပုံတင်အမှတ်: 307-82-82097',top:'အပေါ်သို့'
    }
  };
  const w={...english,...(translations[locale]||{})};
  document.documentElement.lang=locale==='kac'?'en':locale;
  if(locale==='kac')document.documentElement.dataset.translationFallback='en';
  const one=(selector,key,attribute='')=>{
    const el=document.querySelector(selector);
    if(!el)return;
    if(attribute)el.setAttribute(attribute,w[key]);
    else el.textContent=w[key];
  };
  const group=(selector,keys)=>{
    document.querySelectorAll(selector).forEach((el,i)=>{if(keys[i])el.textContent=keys[i]});
  };
  const applyTranslations=()=>{
  one('.site-header .brand','brandHome','aria-label');
  one('.site-header .brand strong','brand');
  one('.site-header nav','menu','aria-label');
  one('.site-header .menu-button','open','aria-label');
  const nav=['devotion','worship','notices','schedule','together','my'];
  group('.site-header nav a',nav.map(k=>w[k]));
  one('.church-schedule-intro > a','home');
  one('.church-schedule-intro > h1','title');
  one('.church-schedule-intro > p','intro');
  one('[data-church-shared-schedules]','title','aria-label');
  one('[data-church-shared-calendar]','calendar','aria-label');
  one('[data-church-calendar-month]','monthLoading');
  one('[data-church-calendar-prev]','prev','aria-label');
  one('[data-church-calendar-next]','next','aria-label');
  one('[data-church-calendar-today]','today');
  one('[data-church-calendar-days]','days','aria-label');
  group('.church-calendar-weekdays span',w.weekdays);
  one('.church-calendar-legend','legend','aria-label');
  group('.church-calendar-legend span',[w.church,w.mission]);
  one('[data-church-selected-day]','selected');
  one('[data-church-schedules-list] .church-shared-empty','loading');
  one('[data-church-schedule]','manage','aria-label');
  const note=document.querySelector('.church-schedule-footer-info');
  if(note){
    const node=[...note.childNodes].find(x=>x.nodeType===3&&x.textContent.trim());
    if(node)node.textContent=w.privacy+' ';
  }
  group('.church-schedule-links a',[w.manage,w.missionLink]);
  one('.church-footer-info','footerInfo','aria-label');
  group('.church-footer-info span',[w.address,w.operator,w.representative,w.reg]);
  one('.church-footer-legal','legal','aria-label');
  group('.church-footer-legal a',[w.privacyLink,w.terms,w.contact]);
  one('.church-footer-bottom a','top');
  document.title=w.title+' | '+w.brand;
  };
  applyTranslations();
  // The shared Church shell fetches and replaces the homepage header/footer
  // after defer scripts have run. Reapply localized chrome after that replacement.
  window.addEventListener('ekodi:church-shell-synced',applyTranslations);
})();
