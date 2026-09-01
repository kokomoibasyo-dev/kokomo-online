(function(){
'use strict';
var $=function(id){return document.getElementById(id)};
var staticOriginals=[];
var staticSeen=[];
function isBeginner(){
  if(document.body.classList.contains('mode-beginner'))return true;
  if(document.body.classList.contains('mode-challenge')||document.body.classList.contains('mode-gachi'))return false;
  var r=document.querySelector('input[name="mode"]:checked');
  return !r||r.value==='beginner';
}
function remember(el){if(!el||staticSeen.indexOf(el)>=0)return;staticSeen.push(el);staticOriginals.push([el,el.textContent])}
function simpleStatic(el,text){if(!el)return;remember(el);if(el.textContent!==text)el.textContent=text}
function restoreStatic(){staticOriginals.forEach(function(x){if(x[0].isConnected&&x[0].textContent!==x[1])x[0].textContent=x[1]})}
function row(id){var e=$(id);return e&&e.closest('.row')}
function label(id){var r=row(id);return r&&r.querySelector('label')}
function desc(id){var r=row(id);return r&&r.querySelector('.small')}
function setupLanguage(){
  var beginner=document.querySelector('input[name="mode"]:checked');
  var b=!beginner||beginner.value==='beginner';
  var h=document.querySelector('#setup h3:nth-of-type(1)');
  var allH=Array.prototype.slice.call(document.querySelectorAll('#setup h3'));
  var modeH=allH.filter(function(x){return x.textContent==='難易度'||x.textContent==='あそびかた'})[0];
  var bl=document.querySelector('label[for="beginner"] .small');
  var after=document.querySelector('.modegrid + .small');
  if(b){
    simpleStatic(modeH,'あそびかた');
    simpleStatic(bl,'小学生むけ。ねだん・買う材料・天気を見てあそぶ。');
    simpleStatic(after,'どれが正しいかは1つだけじゃないよ。何回でもちがうやりかたをためしてみよう！');
    var note=$('modeFeatureNote');if(note)note.innerHTML='小学生むけ。<b>ねだん・買う材料・天気</b>を考えればOK！';
  }else{
    restoreStatic();
  }
}
function localizeStaticPlay(){
  var stats=document.querySelectorAll('#gameHero .stat .k');
  if(stats[0])simpleStatic(stats[0],'きょう');
  if(stats[1])simpleStatic(stats[1],'もっているお金');
  if(stats[2])simpleStatic(stats[2],'これまで売れた金がく');
  if(stats[3])simpleStatic(stats[3],'もうけ');
  simpleStatic(document.querySelector('#play .missionhead b'),'🎯 今回のチャレンジ');
  simpleStatic(document.querySelector('#play .grid > section.card:first-child > h2'),'🌤️ きょうのまち');
  simpleStatic(document.querySelector('#play .grid > section.card:nth-child(2) > h2'),'🧾 きょう、どうする？');
  var sf=$('shopfront');if(sf&&sf.previousElementSibling)simpleStatic(sf.previousElementSibling,'おみせ');
  var st=$('street');if(st&&st.nextElementSibling)simpleStatic(st.nextElementSibling,'のこっている材料');
  simpleStatic(label('price'),'1ぱいのねだん');
  simpleStatic(desc('price'),'ねだんを上げると、1ぱいでもらえるお金はふえるけど、買う人はへりやすい');
  simpleStatic(label('buyL'),'レモンを買う');
  simpleStatic(label('buyS'),'さとうを買う');
  simpleStatic(desc('buyS'),'1ぱいぶん 15円');
  simpleStatic(label('buyI'),'こおりを買う');
  simpleStatic(desc('buyI'),'1ぱいぶん 10円');
  simpleStatic(document.querySelector('#play .cost > span'),'つかうお金');
  simpleStatic($('open'),'🚪 お店をひらく！');
  var metrics=document.querySelectorAll('#result .metric .k');
  if(metrics[0])simpleStatic(metrics[0],'来た人');
  if(metrics[1])simpleStatic(metrics[1],'売れた数');
  if(metrics[2])simpleStatic(metrics[2],'売れた金がく');
  if(metrics[3])simpleStatic(metrics[3],'きょうのもうけ');
  simpleStatic(document.querySelector('#play .log h2'),'📒 お店のきろく');
  var th=document.querySelectorAll('#play .log thead th');
  var thText=['日','天気','ねだん','売れた数','売れた金がく','もうけ'];
  for(var i=0;i<Math.min(6,th.length);i++)simpleStatic(th[i],thText[i]);
  var reportBs=document.querySelectorAll('#ending .reportcard > b');
  if(reportBs[0])simpleStatic(reportBs[0],'📊 7日間のきろく');
  if(reportBs[1])simpleStatic(reportBs[1],'🔎 あなたのお店はこんな感じ');
  if(reportBs[2])simpleStatic(reportBs[2],'🎯 チャレンジのけっか');
  simpleStatic($('restart'),'もう一どあそぶ');
  simpleStatic(document.querySelector('.footerNote'),'このゲームでは、天気やねだん、買った材料の数などで、売れ方がかわります。本当のお店では、ほかにもいろいろなことがかかわります。');
}
function localizeWeather(){
  var name=$('wName')?$('wName').textContent:'';
  var map={
    '猛暑':'すごくあつい日！レモネードがよく売れそう。',
    '晴れ':'あつくて、レモネードが売れそう。',
    'くもり':'きょうは、ふつうくらい売れそう。ねだんをよく考えよう。',
    '小雨':'人がすくなそう。材料を買いすぎないようにしよう。',
    '雨':'きょうは人がすくなそう。材料をどれくらい買う？'
  };
  if($('wNote')&&map[name]&&$('wNote').textContent!==map[name])$('wNote').textContent=map[name];
}
function localizeNews(){
  var e=$('news');if(!e)return;var t=e.textContent||'',n=t;
  if(/スポーツ大会/.test(t))n='⚽ ちかくでスポーツの大会！子どもやおうちの人がふえそう。';
  else if(/お祭り/.test(t))n='🎆 ちかくでおまつり！人がたくさん来そう。';
  else if(/観光バス/.test(t))n='🚌 りょこうの人がたくさん来たよ。';
  else if(/SNS/.test(t))n='📱 ネットでお店のことが話題になったよ！';
  else if(/ライバル店/.test(t))n='🏪 ちかくに、ほかのレモネード屋さんができたよ。おきゃくさんがへるかも。';
  else if(/学校が早く/.test(t))n='🏫 学校が早くおわる日。子どもがふえそう。';
  else if(/大きなイベント|いつも通り/.test(t))n='😌 きょうは、とくべつなことはなさそう。';
  if(n!==t)e.textContent=n;
}
function localizeMission(){
  var e=$('missionText');if(e){var t=e.textContent,n=t;
    if(/利益を \+2,000円以上/.test(t))n='7日目に、もうけを +2,000円いじょうにしよう';
    else if(/合計100杯以上/.test(t))n='7日間で100ぱいいじょう売ろう';
    else if(/1日で25杯以上/.test(t))n='1日に25ぱいいじょう売ってみよう';
    if(n!==t)e.textContent=n;
  }
  var s=$('missionState');if(s){if(/達成/.test(s.textContent))s.textContent='✅ できた！';else if(/挑戦中/.test(s.textContent))s.textContent='やってみよう！'}
  var p=$('missionProgress');if(p){var x=p.textContent;x=x.replace(/^現在 /,'いま ').replace(/^最高 /,'いちばん多い日 ').replace(/杯/g,'ぱい');if(/ \/ \+¥/.test(x))x=x.replace(' / +¥',' / めざす +¥');if(x!==p.textContent)p.textContent=x}
}
function localizeGuide(){
  var g=$('playModeGuide');if(g)g.innerHTML='<b>🍋 はじめて店長</b>：ねだん・買う材料・天気を考えればOK！';
}
function localizeMilestone(){
  var e=$('milestoneBanner');if(!e||e.classList.contains('hidden'))return;
  var d=parseInt(($('day')&&$('day').textContent)||'1',10)||1;
  var map={1:'🍋 7日間、スタート！ まずは天気を見て、きょうどうするか考えよう。',4:'🌟 4日目！ あと4日。ここまでのお店のきろくを見てみよう。',5:'⏳ あと3日！ 同じやりかたでいく？ かえてみる？',6:'🔥 あと2日！ さいごにどれだけお金をふやせるかな？',7:'🏆 さいごの日！ いちばんいいと思うやりかたでやってみよう！'};
  if(map[d]&&e.textContent!==map[d])e.textContent=map[d];
}
function localizePreopen(){
  var street=$('street');var result=$('result');if(!street||!result)return;
  if(!result.classList.contains('show')&&street.classList.contains('preopen')){
    var t='まだお店はあいていません。ねだんと、買う材料の数をきめて「お店をひらく！」をおそう。';
    if(street.textContent.trim()!==t)street.innerHTML='<span class="small">'+t+'</span>';
  }
}
var customerMap={
  '会社員':'おしごとの人','保護者':'おうちの人','中高生':'学生さん','観光客':'りょこうの人',
  'すぐ買えるなら助かる':'すぐ買えるとうれしい','暑いし1杯ほしいな':'あついし、1ぱいほしいな',
  '仕事の合間にさっぱりしたい':'しごとの休みにのみたい','今日は暑いなあ':'きょうはあついなあ',
  '子どもと一緒に飲もうかな':'子どもといっしょにのもうかな','材料がちゃんとしてそう':'おいしそう！',
  'この値段ならどうしようかな':'このねだん、どうしようかな','旅の記念に飲んでみよう':'りょこうの思い出にのんでみよう',
  '写真も撮りたいな':'しゃしんもとりたいな','SNSで見た！':'ネットで見た！','部活のあとに飲みたい！':'うんどうのあとにのみたい！',
  'また今度にしよう':'またこんどにしよう'
};
function localizeCustomers(){
  var root=$('street');if(!root)return;
  var w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,null);var nodes=[];while(w.nextNode())nodes.push(w.currentNode);
  nodes.forEach(function(n){var x=n.nodeValue;Object.keys(customerMap).forEach(function(k){x=x.split(k).join(customerMap[k])});if(x!==n.nodeValue)n.nodeValue=x});
}
function numText(id){var e=$(id);return e?parseInt((e.textContent||'0').replace(/[^0-9-]/g,''),10)||0:0}
function inputNum(id){var e=$(id);return e?parseInt(e.value,10)||0:0}
function currentProfit(){var e=$('profit');if(!e)return 0;var t=e.textContent||'';var v=parseInt(t.replace(/[^0-9]/g,''),10)||0;return t.indexOf('-')>=0?-v:v}
function simpleAdvice(){
  var r=$('result');if(!r||!r.classList.contains('show'))return;
  var day=numText('day'),vis=numText('visitors'),sold=numText('sold'),waste=numText('waste'),price=inputNum('price'),profit=currentProfit();
  var weather=$('wName')?$('wName').textContent:'';var rate=vis?sold/vis:0;var seed=day*19+sold*5+price;
  var a=[],b=[];
  if(profit<0&&waste>=8){a=['材料を少し買いすぎたかも。使わなかった材料にもお金がかかっているよ。','きょうは材料がたくさんのこったね。買う数を少しへらすと、お金がのこりやすいよ。'];b=['つぎは、きょう売れた数より3〜5こ多いくらいを買ってみよう。','つぎは、ねだんをそのままにして、買う材料だけ少しへらしてみよう。'];}
  else if(profit<0&&price>=190&&rate<.5){a=['ねだんが少し高かったかも。1ぱいでもらえるお金が多くても、買う人がへりすぎるともうけはへるよ。','高めのねだんでちょうせんしたけど、きょうは買う人が少なかったね。'];b=['つぎは10〜30円だけ安くして、売れる数がどうかわるか見てみよう。','ねだんだけ少し下げて、きょうとくらべてみよう。'];}
  else if(profit<0){a=['きょうは、つかったお金のほうが多かったよ。でも、どこをかえればよいか考えるチャンス！','きょうのもうけはマイナス。ねだんと買う材料の数を見なおしてみよう。'];b=['つぎは、ねだんか材料の数のどちらか1つだけかえてみよう。','天気を見て、買う材料を少しへらすかふやすか考えてみよう。'];}
  else if((weather==='雨'||weather==='小雨')&&profit>0){a=['雨でもお金をふやせたよ！人が少ない日に買いすぎなかったのがよかったかも。','人が少なそうな日でも、ちゃんともうけが出たね。'];b=['つぎに晴れたら、材料を少し多くしてみよう。','また雨の日が来たら、きょうの買い方を思い出してみよう。'];}
  else if(price>=200&&rate>=.4){a=['高めのねだんでも売れたよ！たくさん売るだけが、お金をふやすやりかたではないんだね。','1ぱいのねだんを高めにしても、しっかり買ってもらえたね。'];b=['つぎも同じねだんでやってみる？それとも10円だけかえてみる？','天気がちがう日でも同じねだんで売れるかためしてみよう。'];}
  else if(waste>=10){a=['もうけは出たけど、材料がたくさんのこったね。もう少しだけ買う数をへらせそう。','きょうはお金がふえたよ。でも、材料を少し買いすぎたかも。'];b=['つぎは材料を5こくらいへらしてみよう。','ねだんはそのままで、買う数だけへらしてくらべてみよう。'];}
  else if(profit>=900){a=['大せいこう！ねだんと買う材料の数が、きょうのおきゃくさんにぴったりだったみたい。','たくさんお金がふえた日！きょう何をしたか、おぼえておこう。'];b=['同じやりかたをもう一どためしてみよう。','きのうと何がちがったか見つけてみよう。'];}
  else{a=['きょうはお金がふえたよ！この天気には、きょうのやりかたが合っていたみたい。','プラスでおわったね。少しずつお金をふやすのも、じょうずなお店のやりかただよ。'];b=['つぎは、ねだんか材料の数を少しだけかえてみよう。','きょうのやりかたをもとに、少しだけちがうやりかたをためしてみよう。'];}
  var c=$('comment'),l=$('learning');var at=a[Math.abs(seed)%a.length],bt=b[Math.abs(seed+3)%b.length];
  if(c&&c.textContent.indexOf(at)<0)c.innerHTML='<b>📝 きょうのふりかえり</b><br>'+at;
  if(l&&l.textContent.indexOf(bt)<0)l.innerHTML='<b>💡 つぎにやってみよう</b><br>'+bt;
  var title=$('resultTitle');if(title){var d=(title.textContent.match(/\d+/)||[day])[0];var nt=d+'日目のけっか';if(title.textContent!==nt)title.textContent=nt}
  var next=$('next');if(next){var nt2=day===7?'さいごのけっかを見る':'つぎの日へ';if(next.textContent!==nt2)next.textContent=nt2}
}
function localizeSurprise(){var e=$('surprise');if(!e||e.classList.contains('hidden'))return;var t=e.textContent,n=t;
  n=n.replace('開店後イベント：','お店をひらいたあと：').replace('突然の雨！途中から客足が落ちた。','とちゅうで雨！来る人がへった。').replace('人気の投稿者が写真をアップ！後半の客足アップ。','ネットでお店のしゃしんが話題に！来る人がふえた。').replace('団体のお客さんが来店！','たくさんのおきゃくさんがいっしょに来た！').replace('近くで工事が始まり、人通りが少し減った。','ちかくで工事がはじまって、来る人が少しへった。');if(n!==t)e.textContent=n}
function localizeInventory(){var e=$('inventoryNote');if(e)e.textContent='1ぱいにつき、レモン・さとう・こおりを1こずつ使います。こおりは1日がおわると、とけます。'}
function localizeEnding(){
  var end=$('ending');if(!end||end.classList.contains('hidden'))return;
  var p=end.querySelector(':scope > p');if(p&&p.textContent!=='🎉 7日間おつかれさま！')p.textContent='🎉 7日間おつかれさま！';
  var es=$('endingStore');if(es&&/最終所持金/.test(es.textContent))es.textContent=es.textContent.replace(' の最終所持金',' の さいごのお金');
  var rank=$('rank');if(rank){var t=rank.textContent,n=t;if(/レモネード王/.test(t))n='🏆 レモネードマスター！';else if(/すご腕店長/.test(t))n='🌟 すごい店長！';else if(/黒字経営達成/.test(t))n='👍 お金がふえた！';else if(/元手キープ/.test(t))n='🧪 さいしょのお金をまもった！';else if(/再チャレンジ/.test(t))n='🌱 もう1回やってみよう！';if(n!==t)rank.textContent=n}
  var data=$('dataReport');if(data&&!/売れた数：/.test(data.textContent)){
    var t=data.textContent;var cups=(t.match(/販売\s*([0-9,]+)杯/)||[])[1];var sales=(t.match(/累計売上\s*¥([0-9,]+)/)||[])[1];var pm=t.match(/最終利益\s*([+-]?)¥([0-9,]+)/);var avg=(t.match(/平均価格\s*¥([0-9,]+)/)||[])[1];
    var lis=[];if(cups)lis.push('売れた数：'+cups+'ぱい');if(sales)lis.push('売れた金がく：¥'+sales);if(pm)lis.push('さいごのもうけ：'+(pm[1]||'')+'¥'+pm[2]);if(avg)lis.push('だいたいのねだん：¥'+avg);data.innerHTML=lis.map(function(x){return'<li>'+x+'</li>'}).join('');
    var profit=pm?parseInt(pm[2].replace(/,/g,''),10)*(pm[1]==='-'?-1:1):0;var avgv=avg?parseInt(avg.replace(/,/g,''),10):150;var notes=[];notes.push(profit>=0?'7日間で、さいしょよりお金をふやせたよ。':'こんどは、買う材料の数を少しずつかえてみよう。');if(avgv>=190)notes.push('高めのねだんでちょうせんするお店だったね。');else if(avgv<=130)notes.push('買いやすいねだんで、たくさん売るお店だったね。');else notes.push('ねだんと売れる数のバランスを考えたお店だったね。');var ar=$('analysisReport');if(ar)ar.innerHTML=notes.map(function(x){return'<li>'+x+'</li>'}).join('');var tb=$('typeBox');if(tb)tb.textContent=avgv>=190?'💎 タイプ：高めのねだんでちょうせんする店長':avgv<=130?'🥤 タイプ：たくさん売るのがとくいな店長':'⚖️ タイプ：バランスを考える店長';
  }
  var mf=$('missionFinal');if(mf){var x=mf.innerHTML;x=x.replace(/ミッション達成！/g,'できた！').replace(/今回は未達成。/g,'こんど、もう一どやってみよう。').replace(/7日後に利益を \+2,000円以上にしよう/g,'7日目に、もうけを +2,000円いじょうにしよう').replace(/7日間で合計100杯以上売ろう/g,'7日間で100ぱいいじょう売ろう').replace(/1日で25杯以上売る日をつくろう/g,'1日に25ぱいいじょう売ってみよう').replace(/現在 /g,'いま ').replace(/最高 /g,'いちばん多い日 ').replace(/杯/g,'ぱい');if(x!==mf.innerHTML)mf.innerHTML=x}
}
function apply(){
  if(!isBeginner()){restoreStatic();return}
  localizeStaticPlay();localizeWeather();localizeNews();localizeMission();localizeGuide();localizeMilestone();localizePreopen();localizeCustomers();localizeSurprise();localizeInventory();simpleAdvice();localizeEnding();
}
var timer=null;function schedule(){clearTimeout(timer);timer=setTimeout(apply,0)}
document.querySelectorAll('input[name="mode"]').forEach(function(r){r.addEventListener('change',function(){setupLanguage();schedule()})});
['start','open','next','restart','resetTop'].forEach(function(id){var e=$(id);if(e)e.addEventListener('click',function(){setTimeout(schedule,30);setTimeout(schedule,350)})});
if(window.MutationObserver)new MutationObserver(schedule).observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['class']});
window.addEventListener('pageshow',schedule);setupLanguage();schedule();
})();