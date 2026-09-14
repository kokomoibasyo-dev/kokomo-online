(function(){
'use strict';
var $=function(id){return document.getElementById(id)};
var state=null;
var WEATHER=[
{name:'猛暑',icon:'🥵',min:33,max:37,m:1.52,note:'とても暑い！冷たい飲み物を買う人が増えそう。'},
{name:'晴れ',icon:'☀️',min:28,max:34,m:1.25,note:'レモネード日和。人通りも期待できそう。'},
{name:'くもり',icon:'☁️',min:24,max:29,m:.96,note:'売れ行きは平均的。価格と宣伝がカギ。'},
{name:'小雨',icon:'🌦️',min:21,max:26,m:.73,note:'人通りは少なめ。仕入れすぎに注意。'},
{name:'雨',icon:'🌧️',min:19,max:24,m:.53,note:'客足はかなり少なそう。どう工夫する？'}];
var EVENTS=[
{text:'⚽ 近くでスポーツ大会！子どもと保護者が増えそう。',m:1.32,segment:'family'},
{text:'🎆 近所でお祭り！夕方から人通りが増えそう。',m:1.28,segment:'family'},
{text:'🚌 観光バスが到着。旅行客が歩いています。',m:1.18,segment:'tourist'},
{text:'📱 地域SNSで「新しいレモネード屋さん」が話題。',m:1.20,segment:'student'},
{text:'🏪 近くにライバル店が出店。お客さんが分かれそう。',m:.80,segment:'worker'},
{text:'🏫 学校が早く終わる日。放課後の子どもが増えそう。',m:1.16,segment:'student'},
{text:'😌 今日は大きなイベントはなさそう。',m:1,segment:null},
{text:'😌 今日はいつも通りの一日になりそう。',m:1,segment:null}
];
var SURPRISES=[
{text:'🌧️ 突然の雨！途中から客足が落ちた。',m:.72,type:'rain'},
{text:'📸 人気の投稿者が写真をアップ！後半の客足アップ。',m:1.24,type:'buzz'},
{text:'👨‍👩‍👧 団体のお客さんが来店！',m:1.18,type:'group'},
{text:'🚧 近くで工事が始まり、人通りが少し減った。',m:.86,type:'road'},
{text:'✨ 何事もなく予定どおり営業できた。',m:1,type:'none'}
];
var CUSTOMERS=[
{kind:'小学生',emoji:'🧒',base:.86,sens:1.20,lines:['つめたくておいしそう！','おこづかいで買えるかな？','部活のあとに飲みたい！']},
{kind:'中高生',emoji:'🧑‍🎓',base:.82,sens:1.00,lines:['SNSで見た！','暑いし1杯ほしいな','友だちにも教えようかな']},
{kind:'保護者',emoji:'👩',base:.74,sens:.78,lines:['子どもと一緒に飲もうかな','材料がちゃんとしてそう','この値段ならどうしようかな']},
{kind:'会社員',emoji:'👨‍💼',base:.68,sens:.64,lines:['仕事の合間にさっぱりしたい','すぐ買えるなら助かる','今日は暑いなあ']},
{kind:'観光客',emoji:'🧳',base:.78,sens:.58,lines:['旅の記念に飲んでみよう','かわいいお店！','写真も撮りたいな']}
];
var EQUIP=[
{id:'sign',icon:'🪧',name:'大きな看板',price:800,desc:'来店客 +8%',effect:'visitors'},
{id:'juicer',icon:'⚙️',name:'ジューサー',price:1200,desc:'レモン1個の原価 -5円',effect:'lemon'},
{id:'fridge',icon:'🧊',name:'冷蔵庫',price:1500,desc:'余った氷を翌日に持ち越せる',effect:'ice'},
{id:'umbrella',icon:'⛱️',name:'雨よけテント',price:1100,desc:'雨の日の客足減少を軽くする',effect:'rain'}
];
var MISSIONS={
beginner:[
{id:'profit',text:'7日後に利益を +2,000円以上にしよう',target:2000},
{id:'cups',text:'7日間で合計100杯以上売ろう',target:100},
{id:'highday',text:'1日で25杯以上売る日をつくろう',target:25}
],
challenge:[
{id:'profit',text:'7日後に利益を +3,500円以上にしよう',target:3500},
{id:'cups',text:'7日間で合計130杯以上売ろう',target:130},
{id:'lowwaste',text:'7日間の「仕入れ余り」を合計25杯分以下にしよう',target:25},
{id:'noads',text:'宣伝費0円の日を3日つくり、それでも黒字を目指そう',target:3}
],
gachi:[
{id:'profit',text:'固定費込みで利益 +4,000円以上を目指そう',target:4000},
{id:'margin',text:'7日間の売上利益率を30%以上にしよう',target:30},
{id:'highprice',text:'200円以上で合計40杯以上売ろう',target:40},
{id:'invest',text:'設備を2つ以上買って黒字で終えよう',target:2}
]};
function rnd(a,b){return Math.floor(Math.random()*(b-a+1))+a}
function pick(arr){return arr[Math.floor(Math.random()*arr.length)]}
function clamp(v,a,b){return Math.max(a,Math.min(b,v))}
function fmt(v){return Math.round(v).toLocaleString('ja-JP')}
function n(id,min,max){var v=parseInt($(id).value,10);if(isNaN(v))v=0;return clamp(v,min,max)}
function modeName(m){return m==='beginner'?'🍋 はじめて店長':m==='challenge'?'📊 チャレンジ店長':'🧠 ガチ経営'}
function styleStand(st){return st==='tropical'?'🥥':st==='simple'?'🍋':'🍹'}
function applyStyle(st){var r=document.documentElement;if(st==='tropical'){r.style.setProperty('--accent','#5ac6a6');r.style.setProperty('--accent2','#d9fff1')}else if(st==='simple'){r.style.setProperty('--accent','#c7b679');r.style.setProperty('--accent2','#f5efda')}else{r.style.setProperty('--accent','#f6c928');r.style.setProperty('--accent2','#fff0a6')}}
function pickWeather(){var r=Math.random(),i=r<.17?0:r<.52?1:r<.76?2:r<.91?3:4,w=WEATHER[i];return{name:w.name,icon:w.icon,temp:rnd(w.min,w.max),m:w.m,note:w.note}}
function pickEvent(){return pick(EVENTS)}
function makeDay(){var w=pickWeather(),e=pickEvent();var lemon=35;if(state&&state.mode==='gachi'){lemon=rnd(29,44)}return{w:w,e:e,competitor:rnd(120,210),fixed:state&&state.mode==='gachi'?180:0,lemonCost:lemon}}
function getInput(){return{price:n('price',50,500),l:n('buyL',0,150),su:n('buyS',0,150),ice:n('buyI',0,150),ads:state.mode==='beginner'?0:n('ads',0,600)}}
function has(id){return state.equipment.indexOf(id)>=0}
function currentLemonCost(){return Math.max(20,state.today.lemonCost-(has('juicer')?5:0))}
function expense(x){return x.l*currentLemonCost()+x.su*15+x.ice*10+x.ads+state.today.fixed}
function updatePreview(){if(!state||state.open)return;var x=getInput(),c=expense(x);$('cost').textContent=fmt(c);$('open').disabled=c>state.cash;$('open').textContent=c>state.cash?'所持金が足りません':'🚪 お店を開く！';if(state.mode==='gachi'){var unit=x.price-(currentLemonCost()+15+10);var mg=x.price?Math.round(unit/x.price*100):0;$('marginPreview').textContent='1杯売れたときの粗利益の目安：'+(unit>=0?'+':'')+'¥'+fmt(unit)+'（粗利率 '+mg+'%） ※宣伝費・固定費は別'}}
function missionProgress(){var m=state.mission,progress=0,done=false,label='';var cups=state.logs.reduce(function(a,b){return a+b.sold},0);var waste=state.logs.reduce(function(a,b){return a+b.waste},0);var noads=state.logs.filter(function(x){return x.ads===0&&x.profit>0}).length;var high=state.logs.reduce(function(a,b){return Math.max(a,b.sold)},0);var highprice=state.logs.filter(function(x){return x.price>=200}).reduce(function(a,b){return a+b.sold},0);var margin=state.sales?Math.round(state.profit/state.sales*100):0;
if(m.id==='profit'){progress=Math.max(0,state.profit);done=state.profit>=m.target;label='現在 '+(state.profit>=0?'+':'-')+'¥'+fmt(Math.abs(state.profit))+' / +¥'+fmt(m.target)}
if(m.id==='cups'){progress=cups;done=cups>=m.target;label=cups+'杯 / '+m.target+'杯'}
if(m.id==='highday'){progress=high;done=high>=m.target;label='最高 '+high+'杯 / '+m.target+'杯'}
if(m.id==='lowwaste'){progress=Math.max(0,m.target-waste);done=state.logs.length>=7&&waste<=m.target;label='仕入れ余り合計 '+waste+'杯分（目標 '+m.target+'以下）'}
if(m.id==='noads'){progress=noads;done=noads>=m.target;label=noads+'日 / '+m.target+'日'}
if(m.id==='margin'){progress=Math.max(0,margin);done=state.logs.length>=7&&margin>=m.target;label='現在 '+margin+'% / '+m.target+'%'}
if(m.id==='highprice'){progress=highprice;done=highprice>=m.target;label=highprice+'杯 / '+m.target+'杯'}
if(m.id==='invest'){progress=state.equipment.length;done=state.equipment.length>=m.target&&state.profit>0;label=state.equipment.length+'個 / '+m.target+'個（最後は黒字が条件）'}
var pct;if(m.id==='lowwaste'){pct=state.day>=7?(done?100:Math.max(0,100-waste/m.target*100)):Math.min(95,(state.day-1)/7*100)}else{pct=clamp(progress/m.target*100,0,100)}return{done:done,pct:pct,label:label}}
function renderMission(){var p=missionProgress();$('missionText').textContent=state.mission.text;$('missionProgress').textContent=p.label;$('missionBar').style.width=p.pct+'%';$('missionState').textContent=p.done?'✅ 達成！':'挑戦中'}
function renderEquipment(){var host=$('equipGrid');host.innerHTML='';EQUIP.forEach(function(e){var own=has(e.id),d=document.createElement('div');d.className='equip'+(own?' owned':'');d.innerHTML='<b>'+e.icon+' '+e.name+'</b><div class="small">'+e.desc+'</div><div class="price">¥'+fmt(e.price)+'</div><button class="btn smallbtn '+(own?'secondary':'')+'" data-id="'+e.id+'" '+(own||state.open?'disabled':'')+'>'+(own?'購入済み':'購入する')+'</button>';host.appendChild(d)});host.querySelectorAll('button[data-id]').forEach(function(b){b.addEventListener('click',function(){buyEquipment(this.getAttribute('data-id'))})})}
function buyEquipment(id){if(state.open)return;var e=EQUIP.find(function(x){return x.id===id});if(!e||has(id))return;if(state.cash<e.price){alert('所持金が足りません。');return}state.cash-=e.price;state.investSpend+=e.price;state.equipment.push(id);state.profit=state.cash-state.start;render();renderEquipment()}
function render(){
$('day').textContent=state.day;$('cash').textContent=fmt(state.cash);$('totalSales').textContent=fmt(state.sales);$('totalProfit').textContent=(state.profit>=0?'¥':'-¥')+fmt(Math.abs(state.profit));$('totalProfit').className='v '+(state.profit>=0?'good':'bad');$('rep').textContent=Math.round(state.rep);$('wIcon').textContent=state.today.w.icon;$('skyIcon').textContent=state.today.w.icon;$('temp').textContent=state.today.w.temp;$('wName').textContent=state.today.w.name;$('wNote').textContent=state.today.w.note;$('news').textContent=state.today.e.text;$('iL').textContent=state.inv.l;$('iS').textContent=state.inv.su;$('iI').textContent=state.inv.ice;$('inventoryNote').textContent=has('fridge')?'冷蔵庫があるので、余った氷も翌日に持ち越せます。':'1杯につき各材料を1つ使います。氷は閉店後に溶けます。';$('competitor').textContent=state.today.competitor;$('fixed').textContent=state.today.fixed;$('lemonCost').textContent=currentLemonCost();$('lemonCost2').textContent=currentLemonCost();
var hint=state.today.w.m*state.today.e.m; $('demandHint').textContent=hint>1.35?'かなり多い':hint>1.08?'多め':hint>.82?'ふつう':hint>.62?'少なめ':'かなり少ない';
$('badges').innerHTML=state.equipment.map(function(id){var e=EQUIP.find(function(x){return x.id===id});return '<span class="upgradeBadge" title="'+e.name+'">'+e.icon+'</span>'}).join('');
if(state.logs.length){$('log').innerHTML=state.logs.map(function(x){return '<tr><td>'+x.d+'日</td><td>'+x.icon+x.weather+'</td><td>¥'+fmt(x.price)+'</td><td>'+x.sold+'杯</td><td>¥'+fmt(x.sales)+'</td><td class="'+(x.profit>=0?'good':'bad')+'">'+(x.profit>=0?'+':'-')+'¥'+fmt(Math.abs(x.profit))+'</td><td class="beginnerHide">'+x.waste+'</td></tr>'}).join('')}
renderMission();updatePreview();if(state.mode!=='beginner')renderEquipment()}
function createCustomers(visitors,sold,price,eventSegment){var host=$('street');host.innerHTML='';var count=Math.min(5,Math.max(3,Math.round(visitors/10)));for(var i=0;i<count;i++){(function(i){var c=pick(CUSTOMERS);if(eventSegment&&Math.random()<.45){if(eventSegment==='family')c=pick([CUSTOMERS[0],CUSTOMERS[2]]);if(eventSegment==='student')c=CUSTOMERS[1];if(eventSegment==='tourist')c=CUSTOMERS[4]}var bought=i<Math.round(count*(sold/Math.max(1,visitors)));var line=bought?pick(c.lines):(price>190?'ちょっと高いかも…':sold===0?'今日はやめておこう':'また今度にしよう');setTimeout(function(){var d=document.createElement('div');d.className='customer';d.innerHTML='<div class="bubble">'+c.kind+'<br>'+line+(bought?'<br><b>「買った！」</b>':'')+'</div>'+c.emoji;host.appendChild(d)},i*180)})(i)}}
function pricePurchaseProb(price,c,competitor){var sweet=150;var delta=price-sweet;var p=c.base;if(delta>0)p-=delta/250*c.sens;else p+=Math.min(.10,(-delta)/600);if(state.mode==='gachi'&&price>competitor)p-=(price-competitor)/350*c.sens;return clamp(p,.08,.97)}
function openShop(){if(state.open)return;var x=getInput(),c=expense(x);if(c>state.cash){updatePreview();return}state.open=true;state.cash-=c;state.inv.l+=x.l;state.inv.su+=x.su;state.inv.ice+=x.ice;state.adSpend+=x.ads;state.fixedSpend+=state.today.fixed;
var sur=(state.mode==='beginner'&&Math.random()<.65)?SURPRISES[4]:pick(SURPRISES);var weatherM=state.today.w.m;if(has('umbrella')&&(state.today.w.name==='雨'||state.today.w.name==='小雨'))weatherM=Math.max(weatherM,.82);var base=30*weatherM*state.today.e.m*sur.m;if(has('sign'))base*=1.08;base*=1+Math.sqrt(x.ads/100)*.12;base*=.88+Math.random()*.26;base*=.88+state.rep/420;var visitors=Math.max(3,Math.round(base));
var preStock=Math.min(state.inv.l-x.l,state.inv.su-x.su,state.inv.ice-x.ice);var weighted=0;for(var j=0;j<visitors;j++){var cust=pick(CUSTOMERS);weighted+=pricePurchaseProb(x.price,cust,state.today.competitor)}var demand=Math.round(weighted);var stock=Math.min(state.inv.l,state.inv.su,state.inv.ice);var sold=Math.min(demand,stock);var sales=sold*x.price;var dayProfit=sales-c;var newlyUsed=Math.max(0,sold-Math.max(0,preStock));var waste=Math.max(0,Math.min(x.l,x.su,x.ice)-newlyUsed);var missed=Math.max(0,demand-stock);
state.inv.l-=sold;state.inv.su-=sold;state.inv.ice-=sold;state.cash+=sales;state.sales+=sales;state.profit=state.cash-state.start;state.totalCups+=sold;state.totalWaste+=waste;state.missed+=missed;state.rep=clamp(state.rep+(sold>0?Math.min(5,sold/12): -3)+(x.price<=170?1:0)-(missed>6?2:0),20,95);if(x.price>=200)state.highPriceCups+=sold;
state.logs.push({d:state.day,weather:state.today.w.name,icon:state.today.w.icon,price:x.price,sold:sold,sales:sales,profit:dayProfit,waste:waste,visitors:visitors,ads:x.ads,missed:missed,cost:c,demand:demand,surprise:sur.text});
$('visitors').textContent=visitors;$('sold').textContent=sold;$('sales').textContent=fmt(sales);$('profit').textContent=(dayProfit>=0?'+¥':'-¥')+fmt(Math.abs(dayProfit));$('profit').className='v '+(dayProfit>=0?'good':'bad');$('waste').textContent=waste;$('resultTitle').textContent=state.day+'日目の結果';
if(sur.type!=='none'){$('surprise').classList.remove('hidden');$('surprise').textContent='開店後イベント：'+sur.text}else{$('surprise').classList.add('hidden')}
var msg='';if(missed>0)msg='材料が足りず、約'+missed+'杯分の販売チャンスを逃しました。';else if(dayProfit>900)msg='大成功！価格・仕入れ・客足がうまくかみ合いました。';else if(dayProfit>0)msg='今日は黒字。次は利益をさらに伸ばせるか考えてみよう。';else msg='今日は赤字。価格、仕入れ量、宣伝費のどれを変えるとよさそう？';$('comment').innerHTML='<b>店長メモ</b><br>'+msg;
var learn='';if(sales>0&&dayProfit<0)learn='売上はありましたが、支出の方が大きく赤字です。「売れた＝もうかった」ではありません。';else if(waste>=10)learn='今日の仕入れ余りが多め。たくさん仕入れると品切れは防げますが、現金が在庫に変わる点にも注目しよう。';else if(x.price>=200&&sold>0)learn='高めの価格でも売れました。販売数が少なくても、1杯あたりの利益でカバーできる場合があります。';else if(x.ads>0&&visitors>35)learn='宣伝が来店数を押し上げた可能性があります。ただし宣伝費も支出なので、利益まで確認しよう。';else learn='今日の結果と天気・イベントを比べて、「なぜそうなったか」を予想してみよう。';$('learning').innerHTML='<b>💡 経営のヒント</b><br>'+learn;
createCustomers(visitors,sold,x.price,state.today.e.segment);$('next').textContent=state.day===7?'最終レポートを見る':'次の日へ';$('result').classList.add('show');render();setTimeout(function(){$('result').scrollIntoView({behavior:'smooth',block:'start'})},700)}
function nextDay(){if(!state.open)return;if(!has('fridge'))state.inv.ice=0;if(state.day>=7){finish();return}state.day++;state.open=false;state.today=makeDay();$('result').classList.remove('show');$('surprise').classList.add('hidden');$('street').innerHTML='<span class="small">開店するとお客さんがやってきます。</span>';$('buyI').value=20;render();window.scrollTo({top:0,behavior:'smooth'})}
function businessType(){var avg=state.logs.length?state.logs.reduce(function(a,b){return a+b.price},0)/state.logs.length:0;var avgAds=state.logs.length?state.adSpend/state.logs.length:0;if(state.equipment.length>=3)return'🔧 未来へ投資する「設備投資家タイプ」';if(avg>=190)return'💎 単価で勝負する「高付加価値タイプ」';if(avgAds>=180)return'📣 人を集めて伸ばす「マーケタータイプ」';if(state.totalWaste<=20&&state.missed<=15)return'⚖️ 読みが堅実な「バランス経営タイプ」';if(state.missed>30)return'🔥 売れ行きを攻める「強気チャレンジャータイプ」';return'🌱 状況を見ながら育てる「適応型店長タイプ」'}
function finish(){state.profit=state.cash-state.start;$('play').classList.add('hidden');$('ending').classList.remove('hidden');$('endingStore').textContent=state.name+' の最終所持金';$('finalCash').textContent=fmt(state.cash);var r=state.cash>=9000?'🏆 レモネード王！':state.cash>=6500?'🌟 すご腕店長':state.cash>=4500?'👍 黒字経営達成':state.cash>=3000?'🧪 元手キープ':'📉 再チャレンジ';$('rank').textContent=r;$('typeBox').textContent=businessType();var avgPrice=Math.round(state.logs.reduce(function(a,b){return a+b.price},0)/state.logs.length);var best=state.logs.slice().sort(function(a,b){return b.profit-a.profit})[0];var margin=state.sales?Math.round(state.profit/state.sales*100):0;$('dataReport').innerHTML='<li>販売 '+state.totalCups+'杯</li><li>累計売上 ¥'+fmt(state.sales)+'</li><li>最終利益 '+(state.profit>=0?'+':'-')+'¥'+fmt(Math.abs(state.profit))+'</li><li>平均価格 ¥'+fmt(avgPrice)+'</li><li>売上利益率 '+margin+'%</li><li>設備 '+state.equipment.length+'個</li>';
var notes=[];if(state.missed>=20)notes.push('品切れによる機会損失が約'+state.missed+'杯分ありました。需要が強い日は仕入れを増やす余地があります。');else notes.push('品切れによる機会損失は比較的少なく、在庫管理は安定していました。');if(state.totalWaste>=35)notes.push('仕入れ余りが合計'+state.totalWaste+'杯分。天気の悪い日の仕入れを減らすと改善できそうです。');else notes.push('仕入れ余りは合計'+state.totalWaste+'杯分に抑えました。');if(best)notes.push('最も利益が大きかったのは'+best.d+'日目（'+best.icon+best.weather+'、¥'+fmt(best.price)+'、'+best.sold+'杯）でした。');if(state.adSpend>1000)notes.push('宣伝費は合計¥'+fmt(state.adSpend)+'。次回は宣伝費を減らして同じ売上を作れるか試すのも面白いです。');else notes.push('宣伝費は合計¥'+fmt(state.adSpend)+'。宣伝を増やした場合との違いも比較できます。');$('analysisReport').innerHTML=notes.map(function(x){return'<li>'+x+'</li>'}).join('');var mp=missionProgress();$('missionFinal').innerHTML=(mp.done?'✅ <b>ミッション達成！</b> ':'⬜ <b>今回は未達成。</b> ')+state.mission.text+'<br><span class="small">'+mp.label+'</span>';window.scrollTo({top:0,behavior:'smooth'})}
function startGame(){var mode=document.querySelector('input[name="mode"]:checked').value,style=document.querySelector('input[name="style"]:checked').value,name=$('storeName').value.trim()||'レモン日和';applyStyle(style);state={mode:mode,style:style,name:name,day:1,start:3000,cash:3000,sales:0,profit:0,inv:{l:0,su:0,ice:0},rep:50,logs:[],open:false,equipment:[],adSpend:0,fixedSpend:0,investSpend:0,totalCups:0,totalWaste:0,missed:0,highPriceCups:0,mission:pick(MISSIONS[mode]),today:null};state.today=makeDay();document.body.classList.remove('mode-beginner','mode-challenge','mode-gachi');document.body.classList.add('mode-'+mode);$('modePill').textContent=modeName(mode);$('storePill').textContent=name;$('shopNameView').textContent=name;$('stand').textContent=styleStand(style);$('setup').classList.add('hidden');$('play').classList.remove('hidden');$('ending').classList.add('hidden');$('result').classList.remove('show');$('price').value=150;$('buyL').value=18;$('buyS').value=18;$('buyI').value=20;$('ads').value=100;$('inventoryNote').textContent=has('fridge')?'冷蔵庫があるので氷も翌日に持ち越せます。':'1杯につき各材料を1つ使います。氷は閉店後に溶けます。';render();window.scrollTo({top:0,behavior:'smooth'})}
function resetToSetup(){state=null;$('play').classList.add('hidden');$('ending').classList.add('hidden');$('setup').classList.remove('hidden');applyStyle(document.querySelector('input[name="style"]:checked').value);window.scrollTo({top:0,behavior:'smooth'})}
['price','buyL','buyS','buyI','ads'].forEach(function(id){$(id).addEventListener('input',updatePreview)});document.querySelectorAll('input[name="style"]').forEach(function(x){x.addEventListener('change',function(){applyStyle(this.value)})});$('start').addEventListener('click',startGame);$('open').addEventListener('click',openShop);$('next').addEventListener('click',nextDay);$('restart').addEventListener('click',resetToSetup);$('resetTop').addEventListener('click',resetToSetup);applyStyle('cute');
})();