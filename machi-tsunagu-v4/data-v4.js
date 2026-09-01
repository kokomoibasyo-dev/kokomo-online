window.GAME_DATA=(function(){
const M={connection:{n:'地域のつながり',i:'🤝'},youth:{n:'若者の地域接点',i:'🧑‍🎓'},child:{n:'子ども・子育て',i:'👶'},senior:{n:'高齢者の地域接点',i:'👴'},stay:{n:'町内で働く・過ごす',i:'🚗'},industry:{n:'地域産業',i:'🏭'},tourism:{n:'観光・交流',i:'🏝️'},equity:{n:'地区バランス',i:'🗺️'},fatigue:{n:'担い手のつかれ',i:'🔋'}};
const START={connection:50,youth:44,child:63,senior:51,stay:38,industry:57,tourism:38,equity:44,fatigue:32};
const APPROACHES={repair:{icon:'🧰',name:'課題を埋める',desc:'町外流出や地区差など、弱いところから直す。',bonus:'課題対応型の施策 +12%'},strength:{icon:'🚀',name:'強みを伸ばす',desc:'子ども人口、事業所、医療福祉など既存の資源を核にする。',bonus:'南風原の強みを使う施策 +12%'},hybrid:{icon:'⚖️',name:'両方を見る',desc:'強みも課題も見ながら、その年ごとに判断する。',bonus:'固定ボーナスなし。最終評価に+3pt'}};
const GOALS={
youth:{icon:'🌱',name:'若者が元気なまち',t:{connection:63,youth:75,child:60,senior:48,stay:58,industry:65,tourism:42,equity:48,fatigue:55}},
child:{icon:'👶',name:'子育てしやすいまち',t:{connection:68,youth:58,child:80,senior:52,stay:48,industry:58,tourism:35,equity:58,fatigue:52}},
senior:{icon:'👴',name:'高齢者が活発なまち',t:{connection:70,youth:48,child:55,senior:78,stay:48,industry:55,tourism:34,equity:60,fatigue:52}},
industry:{icon:'🏭',name:'産業が豊かなまち',t:{connection:60,youth:63,child:52,senior:48,stay:65,industry:80,tourism:58,equity:48,fatigue:58}},
tourism:{icon:'🏝️',name:'観光の聖地',t:{connection:58,youth:58,child:50,senior:46,stay:54,industry:68,tourism:80,equity:46,fatigue:62}},
connected:{icon:'🤝',name:'つながりの強いまち',t:{connection:80,youth:60,child:65,senior:66,stay:50,industry:58,tourism:42,equity:70,fatigue:50}},
learning:{icon:'📚',name:'学び続けるまち',t:{connection:70,youth:68,child:66,senior:62,stay:48,industry:58,tourism:40,equity:60,fatigue:52}}
};
const POLICIES=[
{id:'childPlace',icon:'🏠',name:'地区ごとの子ども・保護者の居場所',cost:26,upkeep:8,tags:['child','welfare','distributed','strength'],focus:['child','equity'],e:{child:10,connection:4,equity:4,fatigue:3},desc:'人口の大きい地区だけでなく複数地区に小さな居場所をつくる。'},
{id:'parentNet',icon:'🧑‍⚕️',name:'子育て×医療福祉ネットワーク',cost:23,upkeep:6,tags:['child','welfare','strength'],focus:['child'],e:{child:9,connection:3,fatigue:2},desc:'医療・福祉・子育て支援をつなぎ、相談と居場所の入口を増やす。'},
{id:'youthDay',icon:'☀️',name:'平日日中の若者会議',cost:18,tags:['youth','daytime'],focus:['youth'],e:{youth:9,connection:3,fatigue:2},desc:'役場や公民館で定期的に若者会議を開く。'},
{id:'youthNight',icon:'🌙',name:'夜・オンラインの若者会議',cost:21,upkeep:5,tags:['youth','flexible','repair'],focus:['youth','stay'],e:{youth:9,connection:4,stay:2,fatigue:2},desc:'町外通勤・通学後でも参加できる時間・方法にする。'},
{id:'career',icon:'🧑‍🔧',name:'若者×町内企業の仕事体験',cost:28,upkeep:5,tags:['youth','jobs','business','repair'],focus:['youth','stay','industry'],e:{youth:7,stay:8,industry:7,connection:2,fatigue:2},desc:'町内事業所で仕事を知り、地域で働く選択肢を増やす。'},
{id:'bizChallenge',icon:'🏪',name:'地域事業者の挑戦支援',cost:29,tags:['business','strength'],focus:['industry','stay'],e:{industry:11,stay:5,youth:2,fatigue:3},desc:'新商品・設備・販路開拓など小規模な挑戦を支援する。'},
{id:'bizWelfare',icon:'🤝',name:'商店・福祉・教育の連携事業',cost:22,upkeep:5,tags:['business','welfare','strength'],focus:['industry','connection'],e:{industry:8,connection:6,senior:2,child:2,fatigue:2},desc:'厚い医療福祉基盤と地域事業者を地域課題の解決につなぐ。'},
{id:'seniorRole',icon:'🧓',name:'高齢者の役割プロジェクト',cost:21,upkeep:5,tags:['senior','welfare'],focus:['senior'],e:{senior:10,connection:5,child:2,fatigue:2},desc:'地域史、料理、見守り、昔遊びなど得意を役割にする。'},
{id:'multiGen',icon:'🍲',name:'小規模地区の多世代交流',cost:18,upkeep:5,tags:['distributed','repair'],focus:['connection','equity','senior','child'],e:{connection:8,equity:7,senior:4,child:4,youth:2,fatigue:3},desc:'小さな地区を含めて、少人数の交流を分散して実施する。'},
{id:'centralHub',icon:'🏢',name:'津嘉山に大型交流拠点',cost:31,upkeep:9,tags:['central'],focus:['connection','child','youth'],e:{connection:8,child:7,youth:6,equity:-6,fatigue:4},desc:'人口の多い津嘉山に大型拠点を置き、利用者数を早く伸ばす。'},
{id:'microDistrict',icon:'🚌',name:'小規模地区を回る出張プログラム',cost:22,upkeep:6,tags:['distributed','repair'],focus:['equity','connection'],e:{equity:11,connection:5,senior:3,child:3,fatigue:3},desc:'固定拠点では届きにくい地区へ、人と活動を届ける。'},
{id:'cultureTour',icon:'🧵',name:'地域文化・ものづくり体験ツアー',cost:23,tags:['business','tourism','strength'],focus:['tourism','industry'],e:{tourism:10,industry:5,connection:2,fatigue:4},desc:'文化・ものづくり・地域の店をつなぎ、来訪と消費を生む。'},
{id:'market',icon:'🛍️',name:'町内事業者マーケット',cost:25,tags:['business','tourism','strength'],focus:['industry','tourism','stay'],e:{industry:8,tourism:6,stay:3,connection:2,fatigue:4},desc:'町内の店・農産物・ものづくりを住民と来訪者につなぐ。'},
{id:'welcome',icon:'📱',name:'転入者向け「地域の入口」',cost:17,upkeep:4,tags:['mobility','flexible','repair'],focus:['connection','equity'],e:{connection:7,equity:3,youth:2,senior:1,fatigue:1},desc:'転入者にも地域情報・公民館・活動への入口が届くようにする。'},
{id:'coordinator',icon:'🧭',name:'地域コーディネーター',cost:30,upkeep:10,tags:['distributed'],focus:['connection','equity'],e:{connection:7,equity:5,fatigue:-8,youth:2,child:2,senior:2},desc:'団体や地区をつなぎ、役割分担と相談を支える。'},
{id:'rest',icon:'🌿',name:'新規事業を増やさず休む',cost:0,tags:['rest'],focus:[],e:{fatigue:-12},desc:'今年は新しい事業を増やさず、担い手の回復を優先する。'}
];
const EVENTS=[
{text:'🏠 転入が続き、新しい住民から「地域のことが分からない」という声が増えた。',e:{connection:-2,equity:-1},voices:['引っ越してきたけど、公民館って誰でも行っていいの？','イベントを知る頃には終わっていることがある。']},
{text:'🚗 町外通勤・通学が多く、平日日中の地域企画に人が集まりにくい。',e:{youth:-2,connection:-1},voices:['帰ってくる頃には地域の集まりが終わってる。','参加したいけど時間が合わないな。']},
{text:'🏥 医療・福祉の現場から、地域との連携をもっと増やしたいという声が出た。',e:{},voices:['支援が必要になる前から地域とつながれるといい。','専門職だけで抱えず、地域と一緒にできることもありそう。']},
{text:'🏪 地域の店で人手不足が目立ち、若い働き手との接点が課題になった。',e:{industry:-2,stay:-1},voices:['働いてくれる人が見つからない。','地元にどんな仕事があるか、若い人は知らないかも。']},
{text:'🗺️ 人口の大きい地区に活動が集中し、小規模地区から「遠い」という声が出た。',e:{equity:-3},voices:['また中心の方でやるんだね。ここからは行きにくいさ。','小さな地区にも来てくれたら参加できる。']},
{text:'🌀 台風の影響でイベントが中止になり、観光・地域活動が一時停滞した。',e:{tourism:-3,connection:-1,fatigue:1},voices:['今年は中止が多かったね。','大きなイベント以外にも続く仕組みがあるといい。']}
];
const SURPRISE=[{text:'💴 県の補助事業に採択。来年の予算が+8pt。',e:{},budget:8},{text:'😵 中心的な担い手が休養。担い手のつかれ+6。',e:{fatigue:6}},{text:'📣 SNSで町の取り組みが話題に。観光・交流+3。',e:{tourism:3}},{text:'🌧️ 悪天候が続き、屋外活動の効果が少し弱まった。',e:{connection:-1,tourism:-2}},{text:'✨ 大きな突発事象はなく、計画通り進められた。',e:{}}];
return{M,START,APPROACHES,GOALS,POLICIES,EVENTS,SURPRISE};
})();