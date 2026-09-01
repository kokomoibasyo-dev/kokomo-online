(function(){
'use strict';
var $=function(id){return document.getElementById(id)};
function playVisible(){var p=$('play');return !!(p&&!p.classList.contains('hidden'))}
function resultVisible(){var r=$('result');return !!(r&&r.classList.contains('show'))}
function setPreOpenStreet(force){
  var street=$('street');
  if(!street||!playVisible())return;
  if(force||!resultVisible()){
    street.className='street preopen';
    street.innerHTML='<span class="small">まだ開店前です。作戦を決めて「お店を開く！」を押すと、お客さんがやってきます。</span>';
  }else{
    street.classList.remove('preopen');
  }
}
function ensureMilestone(){
  var hero=$('gameHero');if(!hero)return null;
  var el=$('milestoneBanner');
  if(!el){el=document.createElement('div');el.id='milestoneBanner';el.className='milestone-banner hidden';hero.insertAdjacentElement('afterend',el)}
  return el;
}
function renderMilestone(){
  if(!playVisible())return;
  var el=ensureMilestone();if(!el)return;
  var d=parseInt(($('day')&&$('day').textContent)||'1',10)||1;
  var text='',extra='';
  if(d===1)text='🍋 7日間の経営スタート！ まずは今日の天気を見て作戦を立てよう。';
  else if(d===4){text='🏁 折り返し！ ここまでの経営記録を見て、後半の作戦を考えよう。';extra=' midpoint'}
  else if(d===5)text='⏳ あと3日！ 今までと同じ作戦でいく？ それとも変えてみる？';
  else if(d===6)text='🔥 あと2日！ 最終利益を意識して勝負どころを考えよう。';
  else if(d===7){text='🏆 最終日！ 7日間の集大成。悔いのない作戦でいこう！';extra=' final-day'}
  el.className=text?'milestone-banner'+extra:'milestone-banner hidden';
  el.textContent=text;
}
function syncAfterNavigation(forceStreet){setTimeout(function(){setPreOpenStreet(!!forceStreet);renderMilestone()},0)}
var start=$('start');if(start)start.addEventListener('click',function(){syncAfterNavigation(true)});
var next=$('next');if(next)next.addEventListener('click',function(){syncAfterNavigation(true)});
var open=$('open');if(open)open.addEventListener('click',function(){setTimeout(function(){var street=$('street');if(street&&resultVisible())street.classList.remove('preopen')},0)});
var resetTop=$('resetTop');if(resetTop)resetTop.addEventListener('click',function(){setTimeout(renderMilestone,0)});
var restart=$('restart');if(restart)restart.addEventListener('click',function(){setTimeout(renderMilestone,0)});
var day=$('day');if(day&&window.MutationObserver){new MutationObserver(function(){renderMilestone()}).observe(day,{childList:true,characterData:true,subtree:true})}
window.addEventListener('pageshow',function(){if(playVisible()&&!resultVisible())setPreOpenStreet(true);renderMilestone()});
document.addEventListener('visibilitychange',function(){if(!document.hidden&&playVisible()&&!resultVisible())setPreOpenStreet(true)});
})();