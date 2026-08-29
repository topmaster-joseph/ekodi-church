(()=>{
'use strict';
if(window.__EKODI_CHURCH_I18N_BOOTED)return;
window.__EKODI_CHURCH_I18N_BOOTED=true;

const SUPPORTED=new Set(['ko-KR','en','zh-CN','ja']);
const PAGE_META={
  'ko-KR':{
    title:'에코디교회 | 에클레시아 · 코이노니아 · 디아스포라 · 희년',
    description:'세상에서 구별된 에클레시아, 하나님과 하나된 코이노니아, 세상 속에 증인된 디아스포라, 자유와 회복을 살아내는 희년의 공동체, 에코디교회입니다.'
  },
  en:{
    title:'EKODI Church | Ekklesia · Koinonia · Diaspora · Jubilee',
    description:'EKODI Church is a community called out as Ekklesia, united with God in Koinonia, sent as Diaspora witnesses, and living Jubilee through freedom and restoration.'
  },
  'zh-CN':{
    title:'EKODI教会 | Ekklesia · Koinonia · Diaspora · 禧年',
    description:'EKODI教会是一群蒙召分别为圣、在上帝里相交、被差遣进入世界作见证，并在自由与恢复中活出禧年的群体。'
  },
  ja:{
    title:'EKODI教会 | エクレシア · コイノニア · ディアスポラ · ヨベル',
    description:'EKODI教会は、世から召し出されたエクレシア、神と一つにされるコイノニア、世へ遣わされるディアスポラ、そして自由と回復を生きるヨベルの共同体です。'
  }
};

const TEXT={
'에코디교회 홈':{en:'EKODI Church home','zh-CN':'EKODI教会首页',ja:'EKODI教会ホーム'},
'메뉴 열기':{en:'Open menu','zh-CN':'打开菜单',ja:'メニューを開く'},
'주요 메뉴':{en:'Main menu','zh-CN':'主菜单',ja:'メインメニュー'},
'예배안내':{en:'Worship','zh-CN':'礼拜指南',ja:'礼拝案内'},
'온라인':{en:'Online','zh-CN':'线上',ja:'オンライン'},
'오시는 길':{en:'Visit','zh-CN':'来访路线',ja:'アクセス'},
'부르심에서 교제로,':{en:'From calling to fellowship,','zh-CN':'从呼召走向团契，',ja:'召しから交わりへ、'},
'교제에서 세상으로':{en:'from fellowship into the world','zh-CN':'从团契走向世界',ja:'交わりから世界へ'},
'세상에서 구별된 에클레시아,':{en:'Ekklesia, called out from the world,','zh-CN':'从世界中被分别出来的 Ekklesia，',ja:'世から召し出されたエクレシア、'},
'하나님과 하나된 코이노니아, 세상 속에 증인된 디아스포라.':{en:'Koinonia, united with God, and Diaspora, witnesses in the world.','zh-CN':'与上帝合一的 Koinonia，在世界中作见证的 Diaspora。',ja:'神と一つにされるコイノニア、世の中で証人となるディアスポラ。'},
'그리고 자유와 회복을 삶으로 살아내는 희년.':{en:'And Jubilee, living freedom and restoration in everyday life.','zh-CN':'并在生活中活出自由与恢复的禧年。',ja:'そして、自由と回復を日々の生活で生きるヨベル。'},
'홈페이지 전체 메뉴':{en:'Site sections','zh-CN':'网站全部菜单',ja:'サイト全体メニュー'},
'교회 소개':{en:'About','zh-CN':'教会介绍',ja:'教会紹介'},
'EK·KO·DI·희년 정체성':{en:'EK·KO·DI·Jubilee identity','zh-CN':'EK·KO·DI·禧年身份',ja:'EK·KO·DI·ヨベルのアイデンティティ'},
'예배 안내':{en:'Worship','zh-CN':'礼拜指南',ja:'礼拝案内'},
'시간과 장소':{en:'Time & place','zh-CN':'时间与地点',ja:'時間と場所'},
'말씀':{en:'Message','zh-CN':'信息',ja:'みことば'},
'복음 메시지':{en:'Gospel message','zh-CN':'福音信息',ja:'福音メッセージ'},
'공동체':{en:'Community','zh-CN':'群体',ja:'共同体'},
'교회·선교·찬양':{en:'Church · Mission · Praise','zh-CN':'教会·宣教·赞美',ja:'教会・宣教・賛美'},
'예배·묵상·실시간 화상':{en:'Worship · Meditation · Live','zh-CN':'礼拜·默想·实时视频',ja:'礼拝・黙想・ライブ'},
'주소와 연락처':{en:'Address & contact','zh-CN':'地址与联系方式',ja:'住所と連絡先'},
'믿음으로 고백하고':{en:'Confessing by faith','zh-CN':'以信心告白',ja:'信仰で告白し'},
'삶으로':{en:'responding through','zh-CN':'用生命',ja:'生き方で'},
'응답하는':{en:'our lives','zh-CN':'回应',ja:'応答する'},
'교회':{en:'church','zh-CN':'教会',ja:'教会'},
'에코디교회는 삼위일체 하나님께서 우리를 세상으로부터 불러 모으시고, 하나님과 성도의 깊은 교제를 누리게 하시며, 다시 세상으로 보내 복음의 증인이 되게 하심을 믿습니다.':{en:'EKODI Church believes that the Triune God calls us out of the world, draws us into deep fellowship with God and one another, and sends us back into the world as witnesses of the gospel.','zh-CN':'EKODI教会相信，三一上帝把我们从世界中召聚，使我们享受与上帝及圣徒深切的团契，并再次差遣我们进入世界，成为福音的见证人。',ja:'EKODI教会は、三位一体の神が私たちを世から召し集め、神と聖徒との深い交わりにあずからせ、再び世へ遣わして福音の証人としてくださると信じます。'},
'그리고 희년의 복음 안에서 자유와 회복이 관계와 삶, 공동체의 자리까지 흘러가도록 살아냅니다.':{en:'Within the gospel of Jubilee, we seek to let freedom and restoration flow into relationships, daily life, and community.','zh-CN':'并且我们在禧年的福音中生活，使自由与恢复流向关系、日常生活和群体。',ja:'そしてヨベルの福音の中で、自由と回復が人間関係、日々の生活、共同体へと流れていくように生きます。'},
'우리의 정체성에서 삶으로 →':{en:'From our identity into life →','zh-CN':'从我们的身份走向生活 →',ja:'私たちのアイデンティティから生活へ →'},
'에클레시아':{en:'Ekklesia','zh-CN':'Ekklesia',ja:'エクレシア'},
'하나님께서 세상으로부터 불러 모으신 예배 공동체입니다.':{en:'A worshiping community called together by God out of the world.','zh-CN':'上帝从世界中召聚的敬拜群体。',ja:'神が世から召し集められた礼拝共同体です。'},
'코이노니아':{en:'Koinonia','zh-CN':'Koinonia',ja:'コイノニア'},
'하나님과 성도가 사랑 안에서 깊이 교제하는 공동체입니다.':{en:'A community of deep fellowship with God and one another in love.','zh-CN':'在爱中与上帝和圣徒深切相交的群体。',ja:'神と聖徒が愛の中で深く交わる共同体です。'},
'디아스포라':{en:'Diaspora','zh-CN':'Diaspora',ja:'ディアスポラ'},
'다시 세상으로 나아가 복음의 증인으로 살아가는 공동체입니다.':{en:'A community sent back into the world to live as witnesses of the gospel.','zh-CN':'再次进入世界、作为福音见证人而生活的群体。',ja:'再び世へ出て、福音の証人として生きる共同体です。'},
'희년':{en:'Jubilee','zh-CN':'禧年',ja:'ヨベル'},
'하나님이 주신 자유와 회복을 삶과 관계, 공동체 안에 흘려보내며 모든 것이 제자리를 찾도록 살아냅니다.':{en:'We live so that God-given freedom and restoration flow through life, relationships, and community, helping all things return to their rightful place.','zh-CN':'我们让上帝所赐的自由与恢复流入生活、关系和群体，使一切回到应有的位置。',ja:'神が与えてくださる自由と回復を生活、人間関係、共同体へ流し、すべてが本来の場所を取り戻すように生きます。'},
'레위기 25 · 누가복음 4':{en:'Leviticus 25 · Luke 4','zh-CN':'利未记 25 · 路加福音 4',ja:'レビ記 25 · ルカの福音書 4'},
'함께 드리는 예배':{en:'Worship together','zh-CN':'一起敬拜',ja:'ともにささげる礼拝'},
'일주일의 시작,':{en:'At the start of the week,','zh-CN':'一周的开始，',ja:'一週間の始まりを、'},
'은혜 안에서':{en:'we begin again','zh-CN':'在恩典中',ja:'恵みの中で'},
'다시 시작합니다.':{en:'in grace.','zh-CN':'重新开始。',ja:'もう一度始めます。'},
'주일예배':{en:'Sunday Worship','zh-CN':'主日礼拜',ja:'主日礼拝'},
'매주 주일 오전 11:00':{en:'Every Sunday · 11:00 AM','zh-CN':'每周日 上午11:00',ja:'毎週日曜 午前11:00'},
'본당':{en:'Main sanctuary','zh-CN':'主堂',ja:'礼拝堂'},
'수요예배':{en:'Wednesday Worship','zh-CN':'周三礼拜',ja:'水曜礼拝'},
'매주 수요일 오후 7:00':{en:'Every Wednesday · 7:00 PM','zh-CN':'每周三 晚上7:00',ja:'毎週水曜 午後7:00'},
'예배실':{en:'Worship room','zh-CN':'礼拜室',ja:'礼拝室'},
'새벽기도':{en:'Morning Prayer','zh-CN':'清晨祷告',ja:'早朝祈祷'},
'매일 오전 6:00':{en:'Daily · 6:00 AM','zh-CN':'每天 上午6:00',ja:'毎日 午前6:00'},
'예배 문의':{en:'Worship inquiry','zh-CN':'礼拜咨询',ja:'礼拝のお問い合わせ'},
'에코디교회':{en:'EKODI Church','zh-CN':'EKODI教会',ja:'EKODI教会'},
'복음으로 걷는 한 주':{en:'A week walking in the gospel','zh-CN':'在福音中行走的一周',ja:'福音とともに歩む一週間'},
'교회 소식 보기 →':{en:'Church news →','zh-CN':'查看教会消息 →',ja:'教会のお知らせ →'},
'EKODI 메시지':{en:'EKODI Message','zh-CN':'EKODI 信息',ja:'EKODI メッセージ'},
'에클레시아 · 코이노니아 · 디아스포라 · 희년':{en:'Ekklesia · Koinonia · Diaspora · Jubilee','zh-CN':'Ekklesia · Koinonia · Diaspora · 禧年',ja:'エクレシア · コイノニア · ディアスポラ · ヨベル'},
'우리를 부르시고, 하나 되게 하시며, 보내시고 회복하시는 하나님':{en:'The God who calls us, makes us one, sends us, and restores us','zh-CN':'呼召我们、使我们合一、差遣并恢复我们的上帝',ja:'私たちを召し、一つにし、遣わし、回復してくださる神'},
'예배로 부름받고, 사랑 안에서 하나 되며, 일상의 자리에서 복음의 증인으로 살아가고, 받은 은혜를 자유와 회복으로 흘려보냅니다.':{en:'Called to worship, united in love, we live as witnesses of the gospel in everyday life and let the grace we have received flow outward as freedom and restoration.','zh-CN':'我们蒙召敬拜，在爱中合一，在日常生活中作福音的见证，并把所领受的恩典化为自由与恢复流向他人。',ja:'礼拝へ召され、愛の中で一つとなり、日常の場で福音の証人として生き、受けた恵みを自由と回復として流していきます。'},
'주일 오전 11시':{en:'Sunday · 11:00 AM','zh-CN':'周日 上午11点',ja:'日曜 午前11時'},
'담임목사 정찬균':{en:'Lead Pastor Chan-gyun Jeong','zh-CN':'主任牧师 郑赞均',ja:'主任牧師 チョン・チャングン'},
'온라인 예배와 말씀 보기':{en:'Watch worship & messages online','zh-CN':'观看线上礼拜与信息',ja:'オンライン礼拝とメッセージを見る'},
'EKODI에서 이어지는':{en:'The gospel continues through EKODI','zh-CN':'在EKODI延续的',ja:'EKODIでつながる'},
'복음의 이야기':{en:'stories of the gospel','zh-CN':'福音故事',ja:'福音の物語'},
'예배에서 관계로, 관계에서 세상으로 이어집니다.':{en:'From worship to relationships, and from relationships into the world.','zh-CN':'从敬拜走向关系，再从关系走向世界。',ja:'礼拝から関係へ、関係から世界へとつながります。'},
'복음은 우리 안에 머물지 않고 삶의 자리에서 회복의 열매가 됩니다.':{en:'The gospel does not remain within us; it bears fruit as restoration in everyday life.','zh-CN':'福音不只停留在我们里面，而是在生活中结出恢复的果子。',ja:'福音は私たちの内にとどまらず、生活の場で回復の実を結びます。'},
'예배와 말씀 안에서 함께 세워지는 믿음의 공동체입니다.':{en:'A community of faith built together through worship and the Word.','zh-CN':'在敬拜和话语中一同被建立的信仰群体。',ja:'礼拝とみことばの中でともに建て上げられる信仰共同体です。'},
'에코디커뮤니티':{en:'EKODI Community','zh-CN':'EKODI社区',ja:'EKODIコミュニティ'},
'세상 속으로 복음을 전하며 선교의 부르심에 응답합니다.':{en:'Responding to the call of mission by carrying the gospel into the world.','zh-CN':'把福音带入世界，回应宣教的呼召。',ja:'世の中へ福音を届け、宣教の召しに応答します。'},
'에코디커뮤니티 보기 →':{en:'Visit EKODI Community →','zh-CN':'查看EKODI社区 →',ja:'EKODIコミュニティを見る →'},
'함께찬양하는사람들':{en:'People Who Praise Together','zh-CN':'一起赞美的人们',ja:'ともに賛美する人々'},
'찬양으로 하나님을 높이고 복음의 기쁨을 함께 나눕니다.':{en:'We lift up God in praise and share the joy of the gospel together.','zh-CN':'我们以赞美高举上帝，一同分享福音的喜乐。',ja:'賛美で神を高く掲げ、福音の喜びをともに分かち合います。'},
'함께하기 →':{en:'Join us →','zh-CN':'加入我们 →',ja:'参加する →'},
'흩어져 있어도,':{en:'Even when we are apart,','zh-CN':'即使彼此分散，',ja:'離れていても、'},
'말씀과 교제로 연결됩니다.':{en:'we stay connected through the Word and fellowship.','zh-CN':'仍借着话语与团契彼此连接。',ja:'みことばと交わりでつながります。'},
'예배를 보고, 말씀을 묵상하고, 얼굴을 마주하며 교제하는 세 개의 입구를 한 화면에 담았습니다.':{en:'One screen brings together three ways to connect: worship, meditation on the Word, and face-to-face fellowship.','zh-CN':'一个页面汇集三种连接方式：观看礼拜、默想话语、面对面团契。',ja:'礼拝を見る、みことばを黙想する、顔を合わせて交わる。その三つの入口を一つの画面にまとめました。'},
'유튜브 예배':{en:'YouTube Worship','zh-CN':'YouTube礼拜',ja:'YouTube礼拝'},
'지난 예배와 말씀을 한 자리에서 이어서 시청할 수 있습니다.':{en:'Watch previous worship services and messages in one place.','zh-CN':'可在一个页面连续观看以往礼拜和信息。',ja:'過去の礼拝とメッセージを一か所で続けて視聴できます。'},
'에코디교회 최신 유튜브 영상':{en:'Latest EKODI Church YouTube videos','zh-CN':'EKODI教会最新YouTube视频',ja:'EKODI教会 最新YouTube動画'},
'에코디커뮤니티 최신 유튜브 영상':{en:'Latest EKODI Community YouTube videos','zh-CN':'EKODI社区最新YouTube视频',ja:'EKODIコミュニティ 最新YouTube動画'},
'유튜브에서 예배 보기 ↗':{en:'Watch worship on YouTube ↗','zh-CN':'在YouTube观看礼拜 ↗',ja:'YouTubeで礼拝を見る ↗'},
'에코디교회 채널 ↗':{en:'EKODI Church channel ↗','zh-CN':'EKODI教会频道 ↗',ja:'EKODI教会チャンネル ↗'},
'에코디커뮤니티 채널 ↗':{en:'EKODI Community channel ↗','zh-CN':'EKODI社区频道 ↗',ja:'EKODIコミュニティチャンネル ↗'},
'전체 소셜채널 ↗':{en:'All social channels ↗','zh-CN':'全部社交频道 ↗',ja:'すべてのソーシャルチャンネル ↗'},
'묵상':{en:'Meditation','zh-CN':'默想',ja:'黙想'},
'말씀을 읽고, 한 가지 질문을 품고, 오늘의 자리에서 한 걸음 살아냅니다.':{en:'Read the Word, carry one question, and live one faithful step where you are today.','zh-CN':'读上帝的话，带着一个问题，在今天所在之处迈出一步。',ja:'みことばを読み、一つの問いを抱き、今日の場所で一歩を生きます。'},
'읽고':{en:'Read','zh-CN':'阅读',ja:'読む'},
'묻고':{en:'Ask','zh-CN':'提问',ja:'問う'},
'살아내기':{en:'Live it','zh-CN':'活出来',ja:'生きる'},
'“오늘 이 말씀은 내 삶의 무엇을 자유롭게 하고, 무엇을 회복하게 하는가?”':{en:'“What does this Word free in my life today, and what does it restore?”','zh-CN':'“今天这段话语要释放我生命中的什么，又要恢复什么？”',ja:'「今日のみことばは、私の何を自由にし、何を回復するのだろうか。」'},
'오늘의 말씀으로':{en:'Go to today’s message','zh-CN':'前往今日信息',ja:'今日のみことばへ'},
'실시간 화상':{en:'Live video fellowship','zh-CN':'实时视频团契',ja:'ライブビデオ'},
'멀리 있어도 얼굴을 마주하고 기도와 나눔에 참여할 수 있는 온라인 교제실입니다.':{en:'An online fellowship room where you can pray and share face-to-face even from far away.','zh-CN':'即使相隔很远，也可以面对面祷告和分享的线上团契空间。',ja:'遠くにいても顔を合わせ、祈りと分かち合いに参加できるオンラインの交わりの場です。'},
'실시간 화상 참여':{en:'Join live video','zh-CN':'加入实时视频',ja:'ライブビデオに参加'},
'브라우저에서 바로 참여할 수 있습니다.':{en:'Join directly in your browser.','zh-CN':'可直接在浏览器中参加。',ja:'ブラウザからそのまま参加できます。'},
'온라인 헌금':{en:'Online Giving','zh-CN':'线上奉献',ja:'オンライン献金'},
'카드·간편결제 또는 공식 계좌이체 중 편한 방법을 선택할 수 있습니다.':{en:'Choose card/easy payment or an official bank transfer.','zh-CN':'可选择银行卡/快捷支付或官方账户转账。',ja:'カード・簡単決済、または公式口座への振込から選べます。'},
'결제 연결 확인 중':{en:'Checking payment connection','zh-CN':'正在检查支付连接',ja:'決済接続を確認中'},
'계좌이체':{en:'Bank transfer','zh-CN':'银行转账',ja:'口座振込'},
'안전한 결제 연결 상태를 확인하고 있습니다.':{en:'Checking the secure payment connection.','zh-CN':'正在确认安全支付连接状态。',ja:'安全な決済接続を確認しています。'},
'십일조·주일헌금':{en:'Tithe · Sunday offering','zh-CN':'十一奉献·主日奉献',ja:'十一献金・主日献金'},
'농협 355-0088-5391-83':{en:'NH Bank 355-0088-5391-83','zh-CN':'NH银行 355-0088-5391-83',ja:'NH農協銀行 355-0088-5391-83'},
'계좌 복사':{en:'Copy account','zh-CN':'复制账户',ja:'口座をコピー'},
'복사 완료':{en:'Copied','zh-CN':'已复制',ja:'コピー済み'},
'선교헌금':{en:'Mission offering','zh-CN':'宣教奉献',ja:'宣教献金'},
'국민 782301-01-666597':{en:'KB Kookmin Bank 782301-01-666597','zh-CN':'KB国民银行 782301-01-666597',ja:'KB国民銀行 782301-01-666597'},
'영수증 발행 문의 010-3501-8542':{en:'Receipt inquiry 010-3501-8542','zh-CN':'收据咨询 010-3501-8542',ja:'領収書のお問い合わせ 010-3501-8542'},
'함께 예배하고,':{en:'Worship together,','zh-CN':'一起敬拜，',ja:'ともに礼拝し、'},
'함께 살아냅니다.':{en:'live it together.','zh-CN':'一起活出来。',ja:'ともに生きます。'},
'교회는 건물보다 사람에 가깝습니다. 처음 오시는 분도, 다시 시작하는 분도 한 식탁과 한 걸음에서 자연스럽게 연결될 수 있도록 열어 둡니다.':{en:'Church is closer to people than to a building. Whether you are visiting for the first time or beginning again, there is room to connect naturally around one table and one next step.','zh-CN':'教会更接近“人”而不是“建筑”。无论第一次来，还是重新开始，都可以在一张桌子和一步同行中自然连接。',ja:'教会は建物よりも人に近いものです。初めての方も、もう一度始める方も、一つの食卓と一歩の歩みから自然につながれるよう開かれています。'},
'예배':{en:'Worship','zh-CN':'礼拜',ja:'礼拝'},
'장소':{en:'Location','zh-CN':'地点',ja:'場所'},
'전남 무안군 청계면 백련동1길 17-4, 1층':{en:'1F, 17-4 Baengnyeondong 1-gil, Cheonggye-myeon, Muan-gun, Jeollanam-do, Korea','zh-CN':'韩国全罗南道务安郡清溪面白莲洞1街17-4，1楼',ja:'韓国 全羅南道 務安郡 清渓面 白蓮洞1ギル17-4、1階'},
'문의':{en:'Contact','zh-CN':'联系',ja:'お問い合わせ'},
'오시는 길 보기 ↗':{en:'Open directions ↗','zh-CN':'查看路线 ↗',ja:'アクセスを見る ↗'},
'온라인으로 먼저 만나기':{en:'Meet us online first','zh-CN':'先在线上认识我们',ja:'まずオンラインで会う'},
'온라인 헌금 창 닫기':{en:'Close online giving','zh-CN':'关闭线上奉献窗口',ja:'オンライン献金を閉じる'},
'닫기 ×':{en:'Close ×','zh-CN':'关闭 ×',ja:'閉じる ×'},
'헌금 종류와 금액을 선택한 뒤 카드·간편결제로 진행합니다.':{en:'Choose the offering type and amount, then continue with card or easy payment.','zh-CN':'选择奉献类型和金额后，使用银行卡或快捷支付。',ja:'献金の種類と金額を選び、カード・簡単決済へ進みます。'},
'헌금 종류':{en:'Offering type','zh-CN':'奉献类型',ja:'献金の種類'},
'감사헌금':{en:'Thanksgiving offering','zh-CN':'感恩奉献',ja:'感謝献金'},
'기타헌금':{en:'Other offering','zh-CN':'其他奉献',ja:'その他の献金'},
'헌금 금액':{en:'Offering amount','zh-CN':'奉献金额',ja:'献金額'},
'1만원':{en:'₩10,000','zh-CN':'₩10,000',ja:'₩10,000'},
'3만원':{en:'₩30,000','zh-CN':'₩30,000',ja:'₩30,000'},
'5만원':{en:'₩50,000','zh-CN':'₩50,000',ja:'₩50,000'},
'10만원':{en:'₩100,000','zh-CN':'₩100,000',ja:'₩100,000'},
'직접 입력':{en:'Enter amount','zh-CN':'直接输入',ja:'金額を入力'},
'원':{en:'KRW','zh-CN':'韩元',ja:'ウォン'},
'선택한 금액 결제하기':{en:'Pay selected amount','zh-CN':'支付所选金额',ja:'選択した金額を支払う'},
'카드 정보는 에코디교회가 직접 저장하지 않으며 결제사 보안창에서 처리됩니다.':{en:'EKODI Church does not store card information. It is handled in the payment provider’s secure window.','zh-CN':'EKODI教会不会直接保存银行卡信息，信息将在支付公司的安全窗口中处理。',ja:'カード情報はEKODI教会では保存せず、決済会社の安全な画面で処理されます。'},
'에코디교회 운영 정보':{en:'EKODI Church operator information','zh-CN':'EKODI教会运营信息',ja:'EKODI教会 運営情報'},
'사업자 소재지 전남 무안군 청계면 백련동1길 17-4, 1층':{en:'Operator address · 1F, 17-4 Baengnyeondong 1-gil, Cheonggye-myeon, Muan-gun, Jeollanam-do, Korea','zh-CN':'运营地址 · 韩国全罗南道务安郡清溪面白莲洞1街17-4，1楼',ja:'運営所在地 · 韓国 全羅南道 務安郡 清渓面 白蓮洞1ギル17-4、1階'},
'운영주체 에코디교회':{en:'Operator · EKODI Church','zh-CN':'运营主体 · EKODI教会',ja:'運営主体 · EKODI教会'},
'대표 정찬균':{en:'Representative · Chan-gyun Jeong','zh-CN':'代表 · 郑赞均',ja:'代表 · チョン・チャングン'},
'고유번호 213-13-01959':{en:'Registration No. 213-13-01959','zh-CN':'登记编号 213-13-01959',ja:'固有番号 213-13-01959'},
'맨 위로 ↑':{en:'Back to top ↑','zh-CN':'返回顶部 ↑',ja:'トップへ ↑'},
'개인정보처리방침':{en:'Privacy Policy','zh-CN':'隐私政策',ja:'プライバシーポリシー'},
'이용약관':{en:'Terms of Use','zh-CN':'使用条款',ja:'利用規約'},
'법적 고지':{en:'Legal information','zh-CN':'法律信息',ja:'法的情報'},
'카드·간편결제':{en:'Card · easy payment','zh-CN':'银行卡·快捷支付',ja:'カード・簡単決済'},
'카드·간편결제와 계좌이체를 사용할 수 있습니다.':{en:'Card/easy payment and bank transfer are available.','zh-CN':'可使用银行卡/快捷支付和银行转账。',ja:'カード・簡単決済と口座振込を利用できます。'},
'카드·간편결제 PG 연결 필요':{en:'Payment gateway setup required','zh-CN':'需要连接支付网关',ja:'決済ゲートウェイ接続が必要'},
'계좌이체는 바로 이용할 수 있으며 카드·간편결제는 PG 운영키 연결 후 자동 활성화됩니다.':{en:'Bank transfer is available now. Card/easy payment will activate automatically after the production payment key is connected.','zh-CN':'银行转账可立即使用。连接正式支付密钥后，银行卡/快捷支付会自动启用。',ja:'口座振込はすぐ利用できます。カード・簡単決済は本番用決済キー接続後に自動で有効になります。'},
'카드·간편결제 연결 확인 필요':{en:'Payment connection needs checking','zh-CN':'需要检查支付连接',ja:'決済接続の確認が必要'},
'현재 계좌이체를 이용해 주세요.':{en:'Please use bank transfer for now.','zh-CN':'目前请使用银行转账。',ja:'現在は口座振込をご利用ください。'},
'결제창 준비 중':{en:'Preparing payment','zh-CN':'正在准备支付',ja:'決済画面を準備中'},
'결제창을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.':{en:'Could not load the payment window. Please try again shortly.','zh-CN':'无法加载支付窗口，请稍后重试。',ja:'決済画面を読み込めませんでした。しばらくしてから再度お試しください。'},
'결제 요청 중…':{en:'Requesting payment…','zh-CN':'正在请求支付…',ja:'決済をリクエスト中…'},
'결제 요청을 시작하지 못했습니다. 결제 연결 상태를 확인하거나 계좌이체를 이용해 주세요.':{en:'Could not start the payment request. Check the payment connection or use bank transfer.','zh-CN':'无法开始支付请求，请检查支付连接或使用银行转账。',ja:'決済リクエストを開始できませんでした。接続状態を確認するか、口座振込をご利用ください。'},
'결제가 취소되었거나 인증에 실패했습니다.':{en:'Payment was canceled or authentication failed.','zh-CN':'支付已取消或认证失败。',ja:'決済がキャンセルされたか、認証に失敗しました。'},
'결제 승인 정보가 올바르지 않습니다. 교회로 문의해 주세요.':{en:'The payment approval information is invalid. Please contact the church.','zh-CN':'支付批准信息无效，请联系教会。',ja:'決済承認情報が正しくありません。教会へお問い合わせください。'},
'결제 승인을 확인하고 있습니다.':{en:'Confirming payment approval.','zh-CN':'正在确认支付批准。',ja:'決済承認を確認しています。'},
'결제 인증 후 승인 확인에 문제가 생겼습니다. 중복 결제하지 마시고 교회로 문의해 주세요.':{en:'There was a problem confirming approval after authentication. Do not pay again; please contact the church.','zh-CN':'认证后确认批准时出现问题。请勿重复支付，并联系教会。',ja:'認証後の承認確認で問題が発生しました。重複決済はせず、教会へお問い合わせください。'},
'헌금 결제가 완료되었습니다.':{en:'Your offering payment is complete.','zh-CN':'奉献支付已完成。',ja:'献金の決済が完了しました。'},
'결제를 완료하지 못했습니다.':{en:'Payment could not be completed.','zh-CN':'支付未能完成。',ja:'決済を完了できませんでした。'},
'결제 영수증 보기 ↗':{en:'View payment receipt ↗','zh-CN':'查看支付收据 ↗',ja:'決済領収書を見る ↗'}
};

const SCRIPTURES=[
['시편 23:1','여호와는 나의 목자시니 내게 부족함이 없으리로다','Psalm 23:1','The Lord is my shepherd; I shall not want.','诗篇 23:1','耶和华是我的牧者，我必不致缺乏。','詩篇 23:1','主は私の羊飼い。私は乏しいことがありません。'],
['시편 46:10','너희는 가만히 있어 내가 하나님 됨을 알지어다','Psalm 46:10','Be still, and know that I am God.','诗篇 46:10','你们要休息，要知道我是上帝。','詩篇 46:10','静まって、わたしこそ神であることを知れ。'],
['시편 119:105','주의 말씀은 내 발에 등이요 내 길에 빛이니이다','Psalm 119:105','Your word is a lamp to my feet and a light to my path.','诗篇 119:105','你的话是我脚前的灯，是我路上的光。','詩篇 119:105','あなたのみことばは私の足のともしび、私の道の光です。'],
['잠언 3:5','너는 마음을 다하여 여호와를 신뢰하고','Proverbs 3:5','Trust in the Lord with all your heart.','箴言 3:5','你要专心仰赖耶和华。','箴言 3:5','心を尽くして主に信頼せよ。'],
['이사야 41:10','두려워하지 말라 내가 너와 함께 함이라','Isaiah 41:10','Do not fear, for I am with you.','以赛亚书 41:10','不要害怕，因为我与你同在。','イザヤ書 41:10','恐れるな。わたしがあなたとともにいる。'],
['미가 6:8','정의를 행하며 인자를 사랑하며 겸손하게 하나님과 함께 행하라','Micah 6:8','Do justice, love mercy, and walk humbly with your God.','弥迦书 6:8','行公义，好怜悯，谦卑地与你的上帝同行。','ミカ書 6:8','公義を行い、慈しみを愛し、へりくだって神とともに歩め。'],
['마태복음 5:14','너희는 세상의 빛이라','Matthew 5:14','You are the light of the world.','马太福音 5:14','你们是世上的光。','マタイの福音書 5:14','あなたがたは世の光です。'],
['마태복음 6:33','먼저 그의 나라와 그의 의를 구하라','Matthew 6:33','Seek first his kingdom and his righteousness.','马太福音 6:33','你们要先求他的国和他的义。','マタイの福音書 6:33','まず神の国とその義を求めなさい。'],
['마태복음 7:7','구하라 그리하면 너희에게 주실 것이요','Matthew 7:7','Ask, and it will be given to you.','马太福音 7:7','你们祈求，就给你们。','マタイの福音書 7:7','求めなさい。そうすれば与えられます。'],
['마태복음 11:28','수고하고 무거운 짐 진 자들아 다 내게로 오라','Matthew 11:28','Come to me, all who labor and are heavy laden.','马太福音 11:28','凡劳苦担重担的人，可以到我这里来。','マタイの福音書 11:28','すべて疲れた人、重荷を負っている人は、わたしのもとに来なさい。'],
['마태복음 22:39','네 이웃을 네 자신 같이 사랑하라','Matthew 22:39','Love your neighbor as yourself.','马太福音 22:39','要爱人如己。','マタイの福音書 22:39','あなたの隣人を自分自身のように愛しなさい。'],
['마태복음 28:20','내가 세상 끝날까지 너희와 항상 함께 있으리라','Matthew 28:20','I am with you always, even to the end of the age.','马太福音 28:20','我就常与你们同在，直到世界的末了。','マタイの福音書 28:20','わたしは世の終わりまで、いつもあなたがたとともにいます。'],
['누가복음 6:31','남에게 대접을 받고자 하는 대로 너희도 남을 대접하라','Luke 6:31','As you wish others would do to you, do so to them.','路加福音 6:31','你们愿意人怎样待你们，你们也要怎样待人。','ルカの福音書 6:31','人にしてもらいたいと望むとおり、人にもそのようにしなさい。'],
['요한복음 3:16','하나님이 세상을 이처럼 사랑하사','John 3:16','For God so loved the world.','约翰福音 3:16','上帝爱世人，甚至将他的独生子赐给他们。','ヨハネの福音書 3:16','神は、実に、そのひとり子をお与えになったほどに世を愛されました。'],
['요한복음 8:32','진리를 알지니 진리가 너희를 자유롭게 하리라','John 8:32','You will know the truth, and the truth will set you free.','约翰福音 8:32','你们必晓得真理，真理必叫你们得以自由。','ヨハネの福音書 8:32','あなたがたは真理を知り、真理はあなたがたを自由にします。'],
['요한복음 10:10','내가 온 것은 생명을 얻게 하고 더 풍성히 얻게 하려는 것이라','John 10:10','I came that they may have life, and have it abundantly.','约翰福音 10:10','我来了，是要叫人得生命，并且得的更丰盛。','ヨハネの福音書 10:10','わたしが来たのは、いのちを得、豊かに得るためです。'],
['요한복음 14:6','내가 곧 길이요 진리요 생명이니','John 14:6','I am the way, the truth, and the life.','约翰福音 14:6','我就是道路、真理、生命。','ヨハネの福音書 14:6','わたしが道であり、真理であり、いのちなのです。'],
['요한복음 15:5','나는 포도나무요 너희는 가지라','John 15:5','I am the vine; you are the branches.','约翰福音 15:5','我是葡萄树，你们是枝子。','ヨハネの福音書 15:5','わたしはぶどうの木、あなたがたは枝です。'],
['요한복음 15:12','내가 너희를 사랑한 것 같이 너희도 서로 사랑하라','John 15:12','Love one another as I have loved you.','约翰福音 15:12','我怎样爱你们，你们也要怎样相爱。','ヨハネの福音書 15:12','わたしがあなたがたを愛したように、互いに愛し合いなさい。'],
['로마서 8:28','모든 것이 합력하여 선을 이루느니라','Romans 8:28','All things work together for good.','罗马书 8:28','万事都互相效力，叫爱上帝的人得益处。','ローマ人への手紙 8:28','すべてのことがともに働いて益となります。'],
['로마서 12:12','소망 중에 즐거워하며 환난 중에 참으며 기도에 항상 힘쓰며','Romans 12:12','Rejoice in hope, be patient in tribulation, be constant in prayer.','罗马书 12:12','在指望中要喜乐，在患难中要忍耐，祷告要恒切。','ローマ人への手紙 12:12','望みをもって喜び、苦難に耐え、祈りに励みなさい。'],
['로마서 15:13','소망의 하나님이 기쁨과 평강을 믿음 안에서 충만하게 하시기를','Romans 15:13','May the God of hope fill you with all joy and peace in believing.','罗马书 15:13','愿赐盼望的上帝因信将诸般的喜乐平安充满你们。','ローマ人への手紙 15:13','望みの神が、信仰によるすべての喜びと平安で満たしてくださいますように。'],
['고린도전서 13:13','믿음 소망 사랑, 그 중의 제일은 사랑이라','1 Corinthians 13:13','Faith, hope, and love remain; the greatest of these is love.','哥林多前书 13:13','如今常存的有信、望、爱，其中最大的是爱。','コリント人への手紙第一 13:13','信仰と希望と愛、この三つはいつまでも残ります。その中で一番すぐれているのは愛です。'],
['고린도후서 5:17','누구든지 그리스도 안에 있으면 새로운 피조물이라','2 Corinthians 5:17','If anyone is in Christ, there is a new creation.','哥林多后书 5:17','若有人在基督里，他就是新造的人。','コリント人への手紙第二 5:17','だれでもキリストのうちにあるなら、その人は新しく造られた者です。'],
['갈라디아서 5:13','사랑으로 서로 종 노릇 하라','Galatians 5:13','Through love, serve one another.','加拉太书 5:13','总要用爱心互相服事。','ガラテヤ人への手紙 5:13','愛をもって互いに仕え合いなさい。'],
['에베소서 4:32','서로 친절하게 하며 불쌍히 여기며 서로 용서하라','Ephesians 4:32','Be kind to one another, tenderhearted, forgiving one another.','以弗所书 4:32','要以恩慈相待，存怜悯的心，彼此饶恕。','エペソ人への手紙 4:32','互いに親切にし、優しい心で、互いに赦し合いなさい。'],
['빌립보서 4:4','주 안에서 항상 기뻐하라','Philippians 4:4','Rejoice in the Lord always.','腓立比书 4:4','你们要靠主常常喜乐。','ピリピ人への手紙 4:4','いつも主にあって喜びなさい。'],
['빌립보서 4:13','내게 능력 주시는 자 안에서 내가 모든 것을 할 수 있느니라','Philippians 4:13','I can do all things through him who strengthens me.','腓立比书 4:13','我靠着那加给我力量的，凡事都能做。','ピリピ人への手紙 4:13','私を強くしてくださる方によって、私はどんなことでもできます。'],
['데살로니가전서 5:16-18','항상 기뻐하라 쉬지 말고 기도하라 범사에 감사하라','1 Thessalonians 5:16-18','Rejoice always, pray without ceasing, give thanks in all circumstances.','帖撒罗尼迦前书 5:16-18','要常常喜乐，不住地祷告，凡事谢恩。','テサロニケ人への手紙第一 5:16-18','いつも喜び、絶えず祈り、すべてのことに感謝しなさい。'],
['히브리서 11:1','믿음은 바라는 것들의 실상이요 보이지 않는 것들의 증거니','Hebrews 11:1','Faith is the assurance of things hoped for, the conviction of things not seen.','希伯来书 11:1','信就是所望之事的实底，是未见之事的确据。','ヘブル人への手紙 11:1','信仰は望んでいることを保証し、目に見えないものを確信させるものです。'],
['베드로전서 4:8','무엇보다도 뜨겁게 서로 사랑할지니','1 Peter 4:8','Above all, keep loving one another earnestly.','彼得前书 4:8','最要紧的是彼此切实相爱。','ペテロの手紙第一 4:8','何よりもまず、互いに熱く愛し合いなさい。']
];
for(const [krRef,krText,enRef,enText,zhRef,zhText,jaRef,jaText] of SCRIPTURES){
  TEXT[krRef]={en:enRef,'zh-CN':zhRef,ja:jaRef};
  TEXT[krText]={en:enText,'zh-CN':zhText,ja:jaText};
  TEXT[`“${krText}”`]={en:`“${enText}”`,'zh-CN':`“${zhText}”`,ja:`「${jaText}」`};
}

let locale='ko-KR';
let observer=null;
let scheduled=false;
const textState=new WeakMap();
const attrState=new WeakMap();

function normalize(value){
  const raw=String(value||'').trim();
  if(SUPPORTED.has(raw))return raw;
  const lower=raw.toLowerCase();
  if(lower.startsWith('ko'))return'ko-KR';
  if(lower.startsWith('en'))return'en';
  if(lower.startsWith('zh'))return'zh-CN';
  if(lower.startsWith('ja'))return'ja';
  return'ko-KR';
}
function interpolate(value,vars={}){return String(value).replace(/\{([a-zA-Z0-9_]+)\}/g,(_,key)=>String(vars[key]??`{${key}}`));}
function t(source,vars={}){
  const key=String(source??'');
  if(locale==='ko-KR')return interpolate(key,vars);
  return interpolate(TEXT[key]?.[locale]||key,vars);
}
function formatAmount(value){
  const loc=locale==='en'?'en-US':locale;
  return new Intl.NumberFormat(loc,{style:'currency',currency:'KRW',maximumFractionDigits:0}).format(Number(value)||0);
}
function textRecord(node){
  const current=node.nodeValue||'';
  let state=textState.get(node);
  if(!state){state={source:current,last:current};textState.set(node,state);}
  else if(current!==state.last){state.source=current;state.last=current;}
  return state;
}
function translateTextNode(node){
  const parent=node.parentElement;
  if(!parent||parent.closest('script,style,template,noscript,#payment-method,#agreement,[data-ekodi-language-control]'))return;
  const state=textRecord(node);
  const source=state.source;
  const trimmed=source.trim();
  if(!trimmed)return;
  const translated=t(trimmed);
  if(translated===trimmed&&locale!=='ko-KR')return;
  const lead=source.match(/^\s*/)?.[0]||'';
  const tail=source.match(/\s*$/)?.[0]||'';
  const next=`${lead}${translated}${tail}`;
  if(node.nodeValue!==next)node.nodeValue=next;
  state.last=next;
}
function attrRecord(element,name){
  let map=attrState.get(element);
  if(!map){map=new Map();attrState.set(element,map);}
  const current=element.getAttribute(name);
  let state=map.get(name);
  if(!state){state={source:current,last:current};map.set(name,state);}
  else if(current!==state.last){state.source=current;state.last=current;}
  return state;
}
function translateAttr(element,name){
  if(!element.hasAttribute(name))return;
  const state=attrRecord(element,name);
  if(!state.source)return;
  const next=t(state.source);
  if(element.getAttribute(name)!==next)element.setAttribute(name,next);
  state.last=next;
}
function applyHead(){
  const meta=PAGE_META[locale]||PAGE_META['ko-KR'];
  document.title=meta.title;
  const description=document.querySelector('meta[name="description"]');
  if(description)description.setAttribute('content',meta.description);
}
function syncDailyVerse(){
  const box=document.querySelector('.daily-verse');
  const verse=box?.querySelector('.daily-verse-text')?.textContent?.trim();
  const ref=box?.querySelector('.daily-verse-ref')?.textContent?.trim();
  if(!box||!verse||!ref)return;
  const cleanVerse=verse.replace(/^[“「]/,'').replace(/[”」]$/,'');
  box.title=`${cleanVerse} · ${ref}`;
  box.setAttribute('aria-label',`${cleanVerse}, ${ref}`);
}
function applyDocument(nextLocale=locale){
  locale=normalize(nextLocale);
  document.documentElement.lang=locale;
  document.documentElement.dataset.ekodiLocale=locale;
  applyHead();
  const walker=document.createTreeWalker(document.body||document.documentElement,NodeFilter.SHOW_TEXT);
  let node;
  while((node=walker.nextNode()))translateTextNode(node);
  document.querySelectorAll('[aria-label],[title],[placeholder]').forEach(element=>{
    translateAttr(element,'aria-label');
    translateAttr(element,'title');
    translateAttr(element,'placeholder');
  });
  syncDailyVerse();
  window.dispatchEvent(new CustomEvent('ekodi:church-i18n-applied',{detail:{locale}}));
}
function schedule(){
  if(scheduled)return;
  scheduled=true;
  requestAnimationFrame(()=>{scheduled=false;applyDocument(locale);});
}
function currentSharedLocale(){return normalize(window.EKODIUserLanguage?.getLocale?.()||document.documentElement.dataset.ekodiLocale||document.documentElement.lang||navigator.language);}
function boot(){applyDocument(currentSharedLocale());}

window.EKODIChurchI18n=Object.freeze({
  getLocale:()=>locale,
  setLocale:value=>applyDocument(value),
  refresh:schedule,
  t:(source,vars)=>t(source,vars),
  formatAmount
});
window.addEventListener('ekodi:locale-change',event=>applyDocument(event.detail?.locale||currentSharedLocale()));
window.addEventListener('ekodi:user-header-ready',schedule);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
observer=new MutationObserver(mutations=>{
  if(mutations.some(mutation=>mutation.type==='childList'||mutation.type==='characterData'))schedule();
});
observer.observe(document.documentElement,{childList:true,subtree:true,characterData:true});
})();
