(function(){
'use strict';
var $=function(id){return document.getElementById(id)};
function mode(){
  if(document.body.classList.contains('mode-beginner'))return 'beginner';
  if(document.body.classList.contains('mode-challenge'))return 'challenge';
  if(document.body.classList.contains('mode-gachi'))return 'gachi';
  var checked=document.querySelector('input[name="mode"]:checked');
  return checked?checked.value:'beginner';
}
function intText(id){var el=$(id);return el?parseInt((el.textContent||'0').replace(/[^0-9-]/g,''),10)||0:0}
function inputInt(id){var el=$(id);return el?parseInt(el.value,10)||0:0}
function profitValue(){var el=$('profit');if(!el)return 0;var t=el.textContent||'';var v=parseInt(t.replace(/[^0-9]/g,''),10)||0;return t.indexOf('-')>=0?-v:v}
function stablePick(arr,seed){return arr[Math.abs(seed)%arr.length]}

function installModeNotes(){
  var labels={
    beginner:'小学生向け。<b>宣伝・設備投資は登場しません。</b> 価格・仕入れ・天気に集中して遊びます。',
    challenge:'宣伝・評判・設備投資が加わります。イベントや客層も見ながら経営します。',
    gachi:'さらに原価変動・固定費・競合価格・利益率まで考える本格モードです。'
  };
  var beginnerLabel=document.querySelector('label[for="beginner"] .small');
  if(beginnerLabel)beginnerLabel.innerHTML='小学生向け。宣伝・設備投資なし。価格・仕入れ・天気に集中。';
  var modeGrid=document.querySelector('.modegrid');
  if(modeGrid&&!$('modeFeatureNote')){
    var note=document.createElement('div');note.id='modeFeatureNote';note.className='mode-feature-note';modeGrid.parentNode.appendChild(note);
  }
  function updateSetup(){var el=$('modeFeatureNote');if(el)el.innerHTML=labels[mode()]}
  document.querySelectorAll('input[name="mode"]').forEach(function(r){r.addEventListener('change',updateSetup)});
  updateSetup();
}

function updatePlayModeGuide(){
  var play=$('play');if(!play||play.classList.contains('hidden'))return;
  var guide=$('playModeGuide');
  if(!guide){guide=document.createElement('div');guide.id='playModeGuide';guide.className='mode-guide';var hero=$('gameHero');if(hero)hero.insertAdjacentElement('afterend',guide)}
  var m=mode();
  if(m==='beginner')guide.innerHTML='<b>🍋 はじめて店長モード</b>：このモードでは「宣伝」と「設備投資」は使いません。天気を見て、値段と仕入れを考えればOK！';
  else if(m==='challenge')guide.innerHTML='<b>📊 チャレンジ店長モード</b>：宣伝・評判・設備投資も使えます。お金を使うほど有利とは限りません。';
  else guide.innerHTML='<b>🧠 ガチ経営モード</b>：原価・固定費・競合価格まで含めて利益を考えます。';
}

function enhanceAdvice(){
  var result=$('result');if(!result||!result.classList.contains('show'))return;
  var m=mode(),day=intText('day'),vis=intText('visitors'),sold=intText('sold'),waste=intText('waste'),price=inputInt('price'),ads=m==='beginner'?0:inputInt('ads'),profit=profitValue();
  var weather=$('wName')?$('wName').textContent:'';
  var conversion=vis?sold/vis:0;
  var original=$('comment')?$('comment').textContent:'';
  var missedMatch=original.match(/約([0-9]+)杯/);var missed=missedMatch?parseInt(missedMatch[1],10):0;
  var seed=day*17+sold*3+price+Math.round(profit/100);
  var main=[],next=[];

  if(missed>0){
    main=[
      '今日は「売れなかった」のではなく、売れるはずのお客さんに材料を渡せなかった日。需要の読みは悪くありません。',
      '品切れが発生しました。仕入れを減らして節約する作戦には、販売チャンスを失うリスクもあります。',
      'お客さんは来ていたのに材料が先になくなりました。今日の課題は価格より在庫量にありそうです。',
      '約'+missed+'杯分の注文を取りこぼしました。次に同じ条件が来たら、どの材料を何個増やすか考えてみよう。'
    ];
    next=['同じような天気なら、今日より5〜10杯分多く仕入れて比べてみよう。','値段はそのままで仕入れだけ変えると、在庫量の効果を確かめやすいよ。','全部を増やさず、一番少なくなりやすい材料だけ増やす作戦もあり。'];
  }else if(profit<0){
    if(m!=='beginner'&&ads>=200){
      main=['お客さんを集めるためにお金を使いましたが、今日は宣伝費まで回収できませんでした。','来店は増えても、宣伝費を含めると赤字になることがあります。今日はそのパターンに近そうです。','宣伝そのものが失敗とは限りません。ただ、今日の売上では宣伝費を回収し切れませんでした。'];
      next=['次は宣伝費だけ半分にして、来店数と利益がどう変わるか比べよう。','価格か宣伝費のどちらか1つだけ変えると原因を見つけやすい。','天気が悪い日は宣伝を控え、晴れの日に集中させる作戦も試せる。'];
    }else if(waste>=8){
      main=['今日は売れ残りではなく「仕入れにお金を使いすぎた」影響が大きそうです。','材料を多めに持つ安心感はありますが、使わなかった分だけ現金が在庫に変わります。','赤字の原因は販売数だけではなさそう。仕入れ量を少し絞る余地があります。'];
      next=['次は今日の販売数＋3〜5杯くらいを仕入れ目安にしてみよう。','天気が同じなら、価格を変えず仕入れだけ減らして比較してみよう。','「絶対に品切れしない量」ではなく「少し余る量」を狙うのも経営判断。'];
    }else if(price>=190&&conversion<.5){
      main=['1杯の値段は高めでしたが、買った人の割合が低くなりました。単価と人数のバランスが課題です。','高い価格で利益を取る作戦でしたが、今日は客数がついてきませんでした。','値上げは1杯の利益を増やしますが、買う人が減りすぎると全体では赤字になります。'];
      next=['10〜30円だけ下げて、販売数の増え方を比べてみよう。','値段を下げるなら、仕入れも少し増やすと機会損失を防げる。','次は価格だけを変えて、買う人の割合を観察してみよう。'];
    }else{
      main=['今日は赤字。ただし「赤字＝全部ダメ」ではなく、どの判断が重かったかを探す材料ができました。','利益はマイナスでした。価格・仕入れ・天気のうち、まず1つだけ変えて再実験すると原因が見えます。','今日は利益が残りませんでした。お客さんの数に対して、使ったお金が少し大きかったようです。'];
      next=['次の日は一度に全部変えず、1項目だけ変えてみよう。','まず仕入れを少し減らすか、価格を10〜20円変えて比べよう。','今日と似た天気の日が来たら、別の作戦を試すチャンス。'];
    }
  }else{
    if((weather.indexOf('雨')>=0||weather.indexOf('小雨')>=0)&&profit>0){
      main=['客足が弱い天気でも黒字にできました。たくさん売る以外にも、仕入れを抑えて利益を守る方法があります。','雨の日に利益を残せたのは大きいです。需要が少ない日に無理をしない経営が機能しました。','悪天候でも黒字。売上の大きさより、支出とのバランスが良かった日です。'];
      next=['晴れの日に同じ価格で仕入れを増やすと、どこまで利益が伸びるか試そう。','次の雨ではさらに仕入れを1〜3杯減らせるか実験してみよう。','雨の日と晴れの日で「ちょうどいい仕入れ量」を比べてみよう。'];
    }else if(price>=200&&conversion>=.4){
      main=['高めの価格でもしっかり買ってもらえました。今日は「たくさん売る」より「1杯の価値」で利益を作れています。','200円以上でも販売できました。価格を上げても、お客さんが十分残れば利益は伸ばせます。','高価格作戦が成立した日。売れた杯数だけでなく、1杯あたりの利益が効いています。'];
      next=['さらに10円上げる実験と、同じ価格を維持する作戦を比べてみよう。','次は価格を保ったまま仕入れ量だけ調整してみよう。','客足が弱い日に同じ高価格が通用するか試すと面白い。'];
    }else if(price<=120&&sold>=20){
      main=['安めの価格で販売数を伸ばす作戦が機能しました。今日は「薄利でも数を売る」形です。','価格を抑えたことで多くのお客さんが買いました。販売数を増やす戦略も立派な経営です。','今日は数で稼ぐタイプの成功。次は少し値上げしても客数が維持できるかがポイントです。'];
      next=['10円だけ値上げして、販売数と利益の両方を比べてみよう。','同じ価格なら、品切れしない範囲で仕入れを調整してみよう。','安さを武器にするなら、どこまで価格を上げても売れるか探してみよう。'];
    }else if(waste>=10){
      main=['黒字ですが、仕入れ余りも多めです。売上を落とさず在庫を減らせれば、さらに利益を残せそうです。','利益は出ています。ただ、材料を少し買いすぎた可能性があります。','成功した日ですが改善余地あり。余った材料の分だけ、まだ利益を伸ばせます。'];
      next=['次は今日より5杯分ほど仕入れを減らしてみよう。','価格はそのまま、仕入れ量だけ絞る比較実験がおすすめ。','天気予報に合わせて仕入れを細かく変えてみよう。'];
    }else if(profit>=900){
      main=['今日はかなり強い黒字。価格・客足・仕入れの3つがうまくかみ合いました。','大成功の日です。何を変えたから伸びたのか、前の日との違いを見ると自分の勝ちパターンが見えます。','利益が大きく伸びました。偶然だけでなく、今日の条件と自分の判断をセットで記録しておこう。'];
      next=['次は同じ作戦をもう一度再現できるか試そう。','前日との違いを1つ見つけて、自分なりの成功理由を予想しよう。','成功した作戦をそのまま続けるか、さらに攻めるかを決めよう。'];
    }else{
      main=['今日は黒字。大きく勝つより、損を出さずに積み上げる経営も強いです。','利益が残りました。今日の作戦は少なくとも、この天気と客足には合っていました。','今日はプラスで終了。次は「同じ利益をもっと少ない支出で作れるか」を考えると一段深くなります。'];
      next=['次は価格・仕入れのどちらか1つだけ変えて利益の変化を見よう。','今日の作戦を基準にして、少しだけ攻める実験をしてみよう。','同じ作戦が違う天気でも通用するか観察してみよう。'];
    }
  }
  var titlePool=['📝 今日の見立て','🔎 店長の観察','🍋 今日わかったこと','📌 今日の経営メモ'];
  var learnPool=['🧪 次に試すなら','💡 次の一手','🎯 明日の実験','🔁 次の作戦'];
  if($('comment'))$('comment').innerHTML='<span class="advice-title">'+stablePick(titlePool,seed)+'</span>'+stablePick(main,seed+3);
  if($('learning'))$('learning').innerHTML='<span class="advice-title">'+stablePick(learnPool,seed+7)+'</span>'+stablePick(next,seed+11)+'<span class="advice-next">今日：'+weather+'／'+price+'円／来店'+vis+'人中'+sold+'杯販売</span>';
}

function cleanBeginnerReport(){
  if(mode()!=='beginner')return;
  var data=$('dataReport');if(data){
    Array.from(data.querySelectorAll('li')).forEach(function(li){if(/設備|宣伝/.test(li.textContent))li.remove()});
  }
  var analysis=$('analysisReport');if(analysis){
    Array.from(analysis.querySelectorAll('li')).forEach(function(li){if(/宣伝/.test(li.textContent))li.remove()});
  }
}

function bind(){
  installModeNotes();
  var start=$('start');if(start)start.addEventListener('click',function(){setTimeout(updatePlayModeGuide,0)});
  var open=$('open');if(open)open.addEventListener('click',function(){setTimeout(function(){enhanceAdvice();},30)});
  var next=$('next');if(next)next.addEventListener('click',function(){setTimeout(function(){cleanBeginnerReport();},30)});
  var restart=$('restart');if(restart)restart.addEventListener('click',function(){setTimeout(function(){var g=$('playModeGuide');if(g)g.remove();},0)});
  var resetTop=$('resetTop');if(resetTop)resetTop.addEventListener('click',function(){setTimeout(function(){var g=$('playModeGuide');if(g)g.remove();},0)});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind);else bind();
})();
