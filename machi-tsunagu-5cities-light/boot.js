'use strict';
const $ = id => document.getElementById(id);
const clamp=(v,a=0,b=100)=>Math.max(a,Math.min(b,Math.round(v)));
const r=(a,b)=>Math.floor(Math.random()*(b-a+1))+a;
const pick=a=>a[Math.floor(Math.random()*a.length)];
const sign=n=>(n>0?'+':'')+n;

const METRICS={
  connection:{n:'地域のつながり',i:'🤝'}, youth:{n:'若者の地域接点',i:'🧑‍🎓'}, child:{n:'子ども・子育て',i:'👶'},
  senior:{n:'高齢者の地域接点',i:'👴'}, stay:{n:'町内で働く・過ごす',i:'🚗'}, industry:{n:'地域産業',i:'🏭'},
  tourism:{n:'観光・交流',i:'🏝️'}, equity:{n:'地区バランス',i:'🗺️'}, acceptance:{n:'住民の納得感',i:'🗣️'}, fatigue:{n:'担い手のつかれ',i:'🔋'}
};
const PRIMARY={youth:['youth','stay'],child:['child','connection'],senior:['senior','connection'],tourism:['tourism','equity'],industry:['industry','stay'],connected:['connection','equity','acceptance']};
const GOALS={
  youth:{icon:'🌱',name:'若者が元気なまち',t:{connection:65,youth:78,child:60,senior:54,stay:62,industry:66,tourism:40,equity:52,acceptance:62,fatigue:52}},
  child:{icon:'👶',name:'子育てしやすいまち',t:{connection:66,youth:58,child:80,senior:52,stay:48,industry:58,tourism:35,equity:58,acceptance:62,fatigue:52}},
  senior:{icon:'🧓',name:'高齢者が活発なまち',t:{connection:66,youth:50,child:58,senior:78,stay:48,industry:56,tourism:36,equity:58,acceptance:62,fatigue:52}},
  tourism:{icon:'🌺',name:'観光の聖地',t:{connection:60,youth:54,child:56,senior:52,stay:54,industry:64,tourism:82,equity:54,acceptance:60,fatigue:54}},
  industry:{icon:'🏭',name:'産業が豊かなまち',t:{connection:62,youth:62,child:58,senior:52,stay:64,industry:80,tourism:40,equity:52,acceptance:60,fatigue:54}},
  connected:{icon:'🤝',name:'つながりが豊かなまち',t:{connection:78,youth:58,child:66,senior:66,stay:48,industry:56,tourism:38,equity:68,acceptance:70,fatigue:50}}
};
const APPROACHES={
  repair:{icon:'🛠️',name:'課題を埋める',desc:'遅れている分野を優先して立て直す。',bonus:'課題解決系・分散型・柔軟型の施策が少し有利。'},
  strength:{icon:'🚀',name:'強みを伸ばす',desc:'もともとの強みを尖らせて町らしさをつくる。',bonus:'産業・観光・子ども・企業連携などの施策が少し有利。'},
  hybrid:{icon:'⚖️',name:'両方を見る',desc:'強みと課題の両方を見ながらバランスを取る。',bonus:'評価で少し有利だが、どこかが中途半端になりやすい。'}
};
const DURATIONS=[5,7,10];
const MUNICIPALITIES={
  haebaru:{name:'南風原町',short:'南風原',header:'人が集まる。でも町外へ出ていくまち',subtitle:'子ども・福祉・企業基盤はある。課題は「町外通勤通学」「地区差」「つながりのつくり方」。',gender:'male',region:'南部東',
    facts:[['人口','41,330人','2025年1月1日'],['0〜14歳','19.4%','2025年1月1日'],['子ども人口','8,011人','2025年1月1日'],['地域資源','医療・福祉／事業所','地域特性'],['強み','子育て・生活基盤','ゲーム上の読み'],['課題','町外移動・地区差','ゲーム上の読み']],
    baseStats:{population:41330,childShare:19.4,socialGain:412,outCommute:67.6,businesses:1441,employees:14829},
    start:{connection:50,youth:44,child:63,senior:50,stay:38,industry:57,tourism:37,equity:44,acceptance:56,fatigue:43},
    traits:{child:1.15,flexible:1.15,daytime:0.78,jobs:1.15,business:1.12,welfare:1.10,distributed:1.12,tourism:1.02,youth:1.02},
    strengths:['子ども人口が多く、子育て施策の対象が見えやすい。','医療・福祉や地域企業と組める土台がある。','転入が多く、新しいつながりづくりのニーズが高い。'],
    challenges:['町外通勤・通学が多く、平日日中の施策は刺さりにくい。','地区規模の差があり、中心部偏重が起きやすい。','人は多いのに、関係の薄さや孤立が起きやすい。'],
    voice:'うちの町は、人が集まり、子育てや暮らしの土台もあります。ただし、町外へ出る人が多く、同じ町に住んでいても生活のリズムがばらばらです。便利さと、つながりの薄さ。その両方を見ながら打ち手を考えてほしいです。'
  },
  yonabaru:{name:'与那原町',short:'与那原',header:'コンパクトさを活かしやすいまち',subtitle:'海と商業、移動のしやすさが強み。にぎわいと暮らしの両立がテーマ。',gender:'female',region:'南部東',
    facts:[['人口','19,920人','2025年1月1日'],['0〜14歳','17.7%','2025年1月1日'],['子ども人口','3,517人','2025年1月1日'],['地域資源','海辺・商業','地域特性'],['強み','コンパクトさ','ゲーム上の読み'],['課題','にぎわいと暮らし','ゲーム上の読み']],
    baseStats:{population:19920,childShare:17.7,socialGain:120,outCommute:58,businesses:830,employees:6850},
    start:{connection:58,youth:48,child:58,senior:53,stay:52,industry:54,tourism:48,equity:61,acceptance:58,fatigue:40},
    traits:{child:1.08,flexible:1.08,daytime:0.9,jobs:1.08,business:1.12,welfare:1.02,distributed:1.05,tourism:1.14,youth:1.05},
    strengths:['町域がコンパクトで、施策が届きやすい。','海辺・まちなか・商業の組み合わせで交流をつくりやすい。','地区格差が比較的小さく、回遊や歩行の設計と相性がよい。'],
    challenges:['にぎわいを優先しすぎると、暮らしとの摩擦が起きやすい。','産業基盤は大規模ではなく、継続性のある仕組みづくりが必要。','若者や子育て世帯への新しい魅力づくりが必要。'],
    voice:'うちの町は、規模が小さいぶん動きやすい。海や商店街もあります。ただ、イベントで人が来ることと、住み続けやすいことは別です。にぎわいをつくるなら、暮らしとの折り合いも忘れずに見てください。'
  },
  yaese:{name:'八重瀬町',short:'八重瀬',header:'成長と地域性の両立を考えるまち',subtitle:'住宅地化が進みつつ、農や地域性も残る。広がる町をどうつなぐか。',gender:'male',region:'南部南東',
    facts:[['人口','33,255人','2025年1月1日'],['0〜14歳','19.6%','2025年1月1日'],['子ども人口','6,505人','2025年1月1日'],['地域資源','農・住宅地','地域特性'],['強み','子育て・地域資源','ゲーム上の読み'],['課題','地区分散・町外移動','ゲーム上の読み']],
    baseStats:{population:33255,childShare:19.6,socialGain:260,outCommute:64,businesses:980,employees:7800},
    start:{connection:49,youth:43,child:60,senior:48,stay:44,industry:51,tourism:42,equity:46,acceptance:55,fatigue:44},
    traits:{child:1.12,flexible:1.1,daytime:0.8,jobs:1.1,business:1.06,welfare:1.04,distributed:1.15,tourism:1.06,youth:1.0},
    strengths:['子育て世帯と暮らしの拠点づくりと相性がよい。','農や地域資源を活かした体験型の施策をつくりやすい。','小規模地区への出張型・分散型施策と相性がよい。'],
    challenges:['住宅地化が進む一方で、地区ごとのつながりが弱まりやすい。','町外へ出る人が多く、時間設計を誤ると参加者が集まりにくい。','広がる町の中で、公平に届く仕組みが必要。'],
    voice:'うちの町は、子育て世帯も増え、暮らしやすさを求めて人が入ってきます。でも、広がるだけでは町にはなりません。顔の見える関係と、地区をまたぐつながり。その両方を育てる打ち手を期待します。'
  },
  nanjo:{name:'南城市',short:'南城',header:'資源は豊か。でも距離があるまち',subtitle:'観光・文化・自然の強みが大きい一方で、広い市域と移動のしにくさが課題。',gender:'female',region:'南部東',
    facts:[['人口','46,929人','2025年1月1日'],['0〜14歳','17.4%','2025年1月1日'],['子ども人口','8,184人','2025年1月1日'],['地域資源','観光・自然・文化','地域特性'],['強み','交流資源の厚み','ゲーム上の読み'],['課題','広域・移動・地区差','ゲーム上の読み']],
    baseStats:{population:46929,childShare:17.4,socialGain:60,outCommute:59,businesses:1320,employees:9900},
    start:{connection:48,youth:42,child:55,senior:51,stay:47,industry:49,tourism:60,equity:40,acceptance:54,fatigue:45},
    traits:{child:1.03,flexible:1.08,daytime:0.88,jobs:1.04,business:1.06,welfare:1.02,distributed:1.18,tourism:1.20,youth:0.98},
    strengths:['観光・歴史・自然といった対外的な資源が強い。','文化資源とマーケット、交流施策の相性がよい。','分散型施策や出張型施策が活きやすい。'],
    challenges:['広い市域ゆえに、中心と周辺の差が出やすい。','観光偏重になると、住民の納得感や担い手疲労に影響しやすい。','若者や子育てを日常的に支える拠点づくりは簡単ではない。'],
    voice:'うちの市は、外から見れば魅力がたくさんあります。でも、広い地域のどこに住んでいても恩恵を感じられるかは別問題です。観光や交流を伸ばすなら、暮らしの足元も同時に見てください。'
  },
  nishihara:{name:'西原町',short:'西原',header:'若者はいる。地域との接点が鍵のまち',subtitle:'大学や若い世代の資源がある。課題は「いる若者」と地域をどう結ぶか。',gender:'male',region:'中南部境',
    facts:[['人口','35,659人','2025年1月1日'],['0〜14歳','15.2%','2025年1月1日'],['子ども人口','5,420人','2025年1月1日'],['地域資源','大学・学び・若者','地域特性'],['強み','若者・学びの資源','ゲーム上の読み'],['課題','若者と地域の接点','ゲーム上の読み']],
    baseStats:{population:35659,childShare:15.2,socialGain:180,outCommute:61,businesses:1050,employees:8600},
    start:{connection:52,youth:54,child:58,senior:47,stay:46,industry:56,tourism:34,equity:52,acceptance:55,fatigue:42},
    traits:{child:1.06,flexible:1.12,daytime:0.86,jobs:1.1,business:1.1,welfare:1.02,distributed:1.06,tourism:0.95,youth:1.18},
    strengths:['大学・学び・若者との接点をつくりやすい。','若者施策や仕事体験、チャレンジ支援と相性がよい。','産業や企業連携にも広げやすい。'],
    challenges:['若者がいることと、地域とつながっていることは別。','高齢者や地区ごとのつながりが置き去りになりやすい。','学び資源を町全体の利益へつなぐ設計が必要。'],
    voice:'うちの町には若い人の資源があります。でも、そこに若者がいるだけでは地域は元気になりません。若者が地域の役割や仕事と結びつくのか、単に通り過ぎるのか。その分かれ目を見てください。'
  }
};
const CONCERNS=[
  {id:'parks',icon:'🌳',name:'公園・遊び場',metric:'child',matchIds:['parkCommons','childPlace','multiGen'],matchTags:['publicspace'],voice:'近くで、子どもも大人も気軽に過ごせる場所がほしい。'},
  {id:'childcare',icon:'👶',name:'子育て支援',metric:'child',matchIds:['childPlace','parentNet','parkCommons'],matchTags:['child'],voice:'制度だけでなく、ふだん頼れる場所や人がほしい。'},
  {id:'youth',icon:'🧑‍🎓',name:'若者の居場所・参加',metric:'youth',matchIds:['youthDay','youthNight','career'],matchTags:['youth'],voice:'若い人が参加できる時間や役割がもっとあっていい。'},
  {id:'senior',icon:'👴',name:'高齢者の交流・移動',metric:'senior',matchIds:['seniorRole','multiGen','microDistrict','parkCommons'],matchTags:['senior'],voice:'近くで出かける理由や、人と話せる機会がほしい。'},
  {id:'jobs',icon:'🏭',name:'仕事・地域産業',metric:'industry',matchIds:['career','bizChallenge','bizWelfare','market'],matchTags:['business','jobs'],voice:'町の中の仕事や店が元気になる取り組みがほしい。'},
  {id:'tourism',icon:'🏝️',name:'観光・にぎわい',metric:'tourism',matchIds:['cultureTour','market'],matchTags:['tourism'],voice:'その町らしさを、外から来る人にも知ってほしい。'},
  {id:'district',icon:'🗺️',name:'地区ごとの公平さ',metric:'equity',matchIds:['multiGen','microDistrict','coordinator','welcome'],matchTags:['distributed'],voice:'中心だけでなく、住んでいる地区でも参加しやすくしてほしい。'},
  {id:'belonging',icon:'🤝',name:'孤立しにくいつながり',metric:'connection',matchIds:['welcome','coordinator','multiGen','bizWelfare','parkCommons'],matchTags:['mobility','welfare'],voice:'一人でも入りやすく、知り合いがいなくても参加できる場がほしい。'}
];
const POLICIES=[
  {id:'youthDay',icon:'☀️',name:'平日日中の若者会議',cost:14,upkeep:3,tags:['youth','daytime'],focus:['youth','connection'],e:{youth:5,connection:2,acceptance:1,fatigue:1},desc:'放課後や昼の時間帯で若者の意見交換の場をつくる。'},
  {id:'youthNight',icon:'🌙',name:'夜・オンラインの若者会議',cost:16,upkeep:4,tags:['youth','flexible'],focus:['youth','connection'],e:{youth:6,connection:3,acceptance:1,fatigue:1},desc:'夜やオンラインで参加しやすい若者会議を開く。'},
  {id:'career',icon:'🧑‍🔧',name:'若者×町内企業の仕事体験',cost:22,upkeep:6,tags:['youth','jobs','business'],focus:['youth','stay','industry'],e:{youth:6,stay:5,industry:4,acceptance:1,fatigue:2},desc:'若者と地元企業をつなぎ、地域で働くイメージを育てる。'},
  {id:'childPlace',icon:'🏠',name:'子どもの居場所づくり',cost:20,upkeep:5,tags:['child','strength'],focus:['child','connection'],e:{child:7,connection:4,acceptance:2,fatigue:2},desc:'放課後や休日に過ごせる居場所を増やす。'},
  {id:'parentNet',icon:'🧑‍⚕️',name:'保護者・専門職ネットワーク',cost:18,upkeep:4,tags:['child','welfare'],focus:['child','connection'],e:{child:5,connection:3,acceptance:2,fatigue:1},desc:'保護者と支援職がゆるくつながる仕組みをつくる。'},
  {id:'seniorRole',icon:'🧓',name:'高齢者の役割プロジェクト',cost:18,upkeep:5,tags:['senior','welfare'],focus:['senior','connection'],e:{senior:7,connection:3,acceptance:2,fatigue:1},desc:'経験を活かせる役割や出番を地域の中に増やす。'},
  {id:'multiGen',icon:'🍲',name:'小規模地区の多世代交流',cost:20,upkeep:5,tags:['distributed','repair'],focus:['connection','equity','senior','child'],e:{connection:6,equity:5,senior:3,child:2,acceptance:3,fatigue:3},desc:'地区ごとに顔の見える多世代交流をつくる。'},
  {id:'microDistrict',icon:'🚌',name:'出張型の地域ひろば',cost:17,upkeep:4,tags:['distributed','mobility'],focus:['equity','connection','senior'],e:{equity:6,connection:4,senior:3,acceptance:2,fatigue:2},desc:'小規模地区を回る出張型の交流や相談の場をつくる。'},
  {id:'coordinator',icon:'🧭',name:'地域コーディネーター配置',cost:24,upkeep:8,tags:['distributed','welfare','repair'],focus:['equity','connection','acceptance'],e:{equity:5,connection:5,acceptance:4,fatigue:-2},desc:'人・活動・地区の間をつなぐ調整役を置く。'},
  {id:'market',icon:'🛍️',name:'地域マーケット＆朝市',cost:19,upkeep:4,tags:['business','tourism','strength'],focus:['tourism','industry','connection'],e:{tourism:5,industry:4,connection:2,acceptance:1,fatigue:2},desc:'地元の店や人が出会う小さな市場を育てる。'},
  {id:'cultureTour',icon:'🪘',name:'文化・歴史ツアー',cost:21,upkeep:5,tags:['tourism','strength'],focus:['tourism','connection'],e:{tourism:7,connection:2,industry:2,acceptance:1,fatigue:2},desc:'地域らしさを学びながら外と交流する機会を増やす。'},
  {id:'bizWelfare',icon:'🏥',name:'福祉×商店の見守り連携',cost:18,upkeep:5,tags:['business','welfare','mobility'],focus:['connection','senior','industry'],e:{connection:5,senior:4,industry:2,acceptance:3,fatigue:1},desc:'福祉と商店、日常の接点を活かした見守り連携をつくる。'},
  {id:'parkCommons',icon:'🌳',name:'公園・公共空間を「居場所」にする',cost:24,upkeep:5,tags:['child','distributed','publicspace'],focus:['child','connection','senior'],e:{child:7,connection:6,senior:2,equity:2,acceptance:3,fatigue:2},desc:'公園や広場に日陰・ベンチ・交流の仕掛けを入れる。'},
  {id:'welcome',icon:'📱',name:'転入者ウェルカム＆情報導線',cost:15,upkeep:3,tags:['mobility','repair'],focus:['connection','acceptance','equity'],e:{connection:5,acceptance:3,equity:2,fatigue:1},desc:'新しい住民が地域情報へたどり着ける導線をつくる。'},
  {id:'bizChallenge',icon:'💼',name:'小さな起業・挑戦支援',cost:20,upkeep:5,tags:['business','jobs','strength'],focus:['industry','stay','youth'],e:{industry:6,stay:4,youth:2,acceptance:1,fatigue:2},desc:'地域で新しい仕事や小さな挑戦を始めやすくする。'},
  {id:'centralHub',icon:'🏢',name:'中心拠点への集中投資',cost:26,upkeep:7,tags:['strength'],focus:['connection','tourism','industry'],e:{connection:4,tourism:5,industry:3,equity:-4,acceptance:-2,fatigue:2},desc:'人が集まりやすい中心地に拠点を集中整備する。'}
];
const COMBOS=[
  {ids:['youthNight','career'],name:'若者の声→仕事へ',e:{youth:3,stay:3,industry:2,acceptance:2},type:'synergy'},
  {ids:['childPlace','parentNet'],name:'居場所×専門職連携',e:{child:3,connection:2,acceptance:2},type:'synergy'},
  {ids:['parkCommons','multiGen'],name:'公園×多世代交流',e:{connection:3,senior:2,child:2,acceptance:2},type:'synergy'},
  {ids:['coordinator','microDistrict'],name:'調整役×出張型',e:{equity:3,connection:2,fatigue:-2},type:'synergy'},
  {ids:['market','cultureTour'],name:'マーケット×文化資源',e:{tourism:4,industry:3,fatigue:2},type:'synergy'},
  {ids:['centralHub','cultureTour'],name:'中心地区への集中',e:{equity:-4,acceptance:-3,fatigue:2},type:'conflict'},
  {ids:['centralHub','market'],name:'中心地区への集中',e:{equity:-3,acceptance:-2},type:'conflict'}
];
const EVENTS=[
  {text:'平日日中に参加者が集まりにくい年。時間の合わなさが話題になっている。',voices:['仕事や学校で、昼は地域のことを考えにくい。','気になっていても、参加するタイミングがない。'],e:{stay:-2,connection:-1}},
  {text:'転入者が増え、地域のことが分からないという声が目立つ。',voices:['引っ越してきたけど、どこに行けばいいか分からない。','知り合いがいないから、最初の一歩が難しい。'],e:{connection:-2,acceptance:-1}},
  {text:'担い手不足が話題。イベントはあっても、回す人が足りない。',voices:['やる人がいつも同じ顔ぶれだ。','新しい企画より、続ける工夫が必要かも。'],e:{fatigue:2,connection:-1}},
  {text:'子育て世代から、遊び場や日常的な居場所を求める声が増えている。',voices:['制度よりも、日常で行ける場所がほしい。','子どもを連れていける場所が少ない。'],e:{child:-2}},
  {text:'高齢者の移動や、出かけるきっかけの少なさが話題になっている。',voices:['近くなら行けるけど、遠いと難しい。','役割がなくなると、外に出なくなる。'],e:{senior:-2,equity:-1}},
  {text:'地域の店や仕事を応援してほしいという声が増えている。',voices:['若い人が働ける場所がもっとあるといい。','町の店をもっと使いたいけど、きっかけがない。'],e:{industry:-2,stay:-1}},
  {text:'その町らしさを外にも発信してほしいという期待が高まっている。',voices:['せっかく良いものがあるのに、知られていない。','交流はほしいが、暮らしが置いていかれるのは困る。'],e:{tourism:-2}},
  {text:'中心部と周辺部の差が話題。近くで参加できるかが問われている。',voices:['中心に行けばあるけど、うちの近くにはない。','参加したい気持ちはあるけど、距離がある。'],e:{equity:-3,connection:-1}}
];
const SURPRISES=[
  {text:'学校・企業・地域が思ったよりうまくつながった。',e:{connection:1,acceptance:1}},
  {text:'台風や天候不順で、外の活動がやや難しかった。',e:{tourism:-1,child:-1}},
  {text:'SNSで話題になり、思ったより参加が広がった。',e:{tourism:1,connection:1}},
  {text:'担当者の異動や事情変更で、引き継ぎがやや難航した。',e:{fatigue:1,acceptance:-1}},
  {text:'小さな口コミが広がり、参加者の定着が進んだ。',e:{connection:1,child:1,senior:1}},
  {text:'予算の工夫がうまくいき、来年使える余力が少し生まれた。',e:{},budget:4}
];
const DILEMMAS=[
  {id:'residentFirst',title:'今年の住民の声を優先する',desc:'いま強く出ている要望に応える。納得感は上がりやすいが、5年後目標を後回しにしやすい。',trade:'得やすいもの：納得感・今年の関心への対応 / 失いやすいもの：長期目標の前進',hint:'人気の高さと、必要性の高さは同じではありません。'},
  {id:'balance',title:'複数の立場をつなぐ',desc:'偏りを避け、広く届く施策を選びやすい。大きくは伸びにくいが、反発を抑えやすい。',trade:'得やすいもの：地区バランス・つながり / 失いやすいもの：一点突破の伸び',hint:'広く薄くの安心と、決めきれなさは紙一重です。'},
  {id:'futureFirst',title:'5年後の目標を優先する',desc:'目標に近い分野を強く押し上げやすい。ただし、今年の要望とズレると不満が出やすい。',trade:'得やすいもの：主目標の前進 / 失いやすいもの：今年の納得感',hint:'長期の正しさは、短期の支持を失うことがあります。'}
];

let S={city:'haebaru'};