(function(){
'use strict';
const core=()=>window.MACHI_V9;
const $=id=>document.getElementById(id);
if(!core()||!$('start')||!$('nextYear'))return;
const D=window.GAME_DATA;
let chosenYears=5;
const PRIMARY={youth:['youth'],child:['child'],senior:['senior'],industry:['industry'],tourism:['tourism'],connected:['connection','equity'],learning:['connection','youth']};
const state=()=>core().getState();
const maxYears=()=>state()?.maxYears||chosenYears;

function setDuration(y){
  chosenYears=Number(y)||5;
  document.querySelectorAll('.durationChoice').forEach(b=>b.classList.toggle('active',Number(b.dataset.years)===chosenYears));
  if($('goalQuestion'))$('goalQuestion').textContent='⑤ '+chosenYears+'年後、どんなまちにしたい？';
  if($('start'))$('start').textContent='この読み方で'+chosenYears+'年間を始める';
}
document.querySelectorAll('.durationChoice').forEach(b=>b.onclick=()=>setDuration(b.dataset.years));
setDuration(5);

function milestoneText(s,max){
  const y=s.year;
  if(y===1)return '🌱 1年目：最初の年は、新しく始められる施策は2つまで。';
  if(y===max)return '🏆 最終年：'+max+'年間の選択を、どんな町の姿につなげる？';
  const middle=Math.ceil(max/2);
  if(y===middle)return '🏁 '+y+'年目：折り返し。続けるもの・やめるもの・住民の変化を見直そう。';
  return 'あと'+(max-y)+'年。成果を伸ばすだけでなく、維持・撤退・反発にも向き合おう。';
}
function syncUI(){
  const s=state(),max=maxYears();
  if($('maxYears'))$('maxYears').textContent=max;
  if($('durationPill'))$('durationPill').textContent='⏳ '+max+'年計画';
  if($('historyTitle'))$('historyTitle').textContent='📒 '+max+'年間の記録';
  if($('endingYears'))$('endingYears').textContent='🎉 '+max+'年間終了';
  if($('goalQuestion')&&!s)$('goalQuestion').textContent='⑤ '+max+'年後、どんなまちにしたい？';
  if(s){
    if($('year'))$('year').textContent=s.year;
    if($('milestone'))$('milestone').textContent=milestoneText(s,max);
    const pulse=document.querySelector('.pulseYear');if(pulse)pulse.textContent=s.year+'年目';
    if($('nextYear'))$('nextYear').textContent=(s.resolved&&s.year>=max)?max+'年間の結果を見る':'次の年へ';
  }
  const ft=$('finalTown');if(ft){const k=ft.querySelector('.townKicker');if(k)k.textContent=max+'年後の町の姿';}
}

const oldStart=$('start').onclick;
$('start').onclick=function(e){
  oldStart?.call(this,e);
  const s=state();if(s){s.maxYears=chosenYears;s.durationLabel=chosenYears+'年';}
  syncUI();
};

function progress(k,target,s){
  const start=D.START[k],now=s.v[k];
  if(k==='fatigue'){
    if(now<=target)return 1;
    return Math.max(0,1-(now-target)/Math.max(1,100-target));
  }
  if(target<=start)return now>=target?1:Math.max(0,now/Math.max(1,target));
  return Math.max(0,Math.min(1,(now-start)/Math.max(1,target-start)));
}
function finalScore(s){
  const g=core().getGoal(),primary=new Set(PRIMARY[s.goal]||[]),metrics=core().getMetrics();
  let sum=0,w=0,ps=[];
  Object.entries(g.t).forEach(([k,t])=>{
    const p=progress(k,t,s),ww=primary.has(k)?4:1;
    sum+=p*ww;w+=ww;
    if(!['fatigue','acceptance'].includes(k))ps.push(p);
  });
  const goal=sum/Math.max(1,w),sorted=ps.slice().sort((a,b)=>a-b);
  const weakCount=Math.min(3,sorted.length),weakest=sorted.slice(0,weakCount).reduce((a,b)=>a+b,0)/Math.max(1,weakCount);
  const acc=progress('acceptance',g.t.acceptance,s),sustain=progress('fatigue',g.t.fatigue,s);
  let score=Math.round(100*(.55*goal+.20*weakest+.15*acc+.10*sustain));
  const minp=Math.min(...ps);
  if(minp<.4)score=Math.min(score,69);else if(minp<.6)score=Math.min(score,79);
  if(s.v.acceptance<50)score=Math.min(score,74);
  if(s.v.fatigue>70)score=Math.min(score,74);
  const allMet=Object.entries(g.t).every(([k,t])=>k==='fatigue'?s.v[k]<=t:s.v[k]>=t);
  const majorMin=Math.min(...Object.keys(metrics).filter(k=>!['fatigue','acceptance'].includes(k)).map(k=>s.v[k]));
  if(!(allMet&&s.v.acceptance>=70&&s.v.fatigue<=g.t.fatigue&&majorMin>=45))score=Math.min(score,94);
  return{score,goal,weakest,acc,sustain};
}
function patchFinal(){
  const s=state();if(!s||!$('ending')||$('ending').classList.contains('hidden'))return;
  const max=maxYears(),r=finalScore(s);
  $('achievement').textContent=r.score;
  $('endingLabel').textContent=r.score>=95?'🏆 長期の両立を実現した':r.score>=82?'🌟 強い成果。ただし選ばなかったものもある':r.score>=68?'🧭 成果と犠牲がはっきりした':'🧪 優先順位を組み直して再挑戦';
  $('scoreBreakdown').innerHTML='<b>'+max+'年間の総合評価：</b>目標だけでなく、弱い分野・住民の納得・担い手の持続性を評価しています。'+
    '<div class="scoreParts"><div class="scorePart"><span>目標への前進</span><b>'+Math.round(r.goal*100)+'</b></div><div class="scorePart"><span>弱い3項目</span><b>'+Math.round(r.weakest*100)+'</b></div><div class="scorePart"><span>住民納得</span><b>'+Math.round(r.acc*100)+'</b></div><div class="scorePart"><span>持続性</span><b>'+Math.round(r.sustain*100)+'</b></div></div><span class="small">長く続けるほど、同じ分野への連続投資の逓減、住民関心の変化、担い手疲労が積み重なります。</span>';
  if($('endingQuestion'))$('endingQuestion').innerHTML='<b>最後の問い：</b>'+max+'年間で、何を始め、何を続け、何をやめましたか。短期の成果と長期の持続性の間で、どんなものを諦めましたか。';
  syncUI();
}

const oldNext=$('nextYear').onclick;
$('nextYear').onclick=function(e){
  const s=state();if(!s)return oldNext?.call(this,e);
  const max=s.maxYears||chosenYears;
  if(s.year<5){
    oldNext?.call(this,e);
    setTimeout(()=>{syncUI();if(state()?.year>=max)patchFinal();},0);
    return;
  }
  if(s.year>=max){
    oldNext?.call(this,e);
    setTimeout(()=>{syncUI();patchFinal();},0);
    return;
  }
  // The original engine ends at year 5. Temporarily pass through its normal
  // year-transition path, then restore the logical 6–10 year number.
  const target=s.year+1;
  s.year=4;
  oldNext?.call(this,e);
  s.year=target;
  s.maxYears=max;
  setTimeout(()=>{
    syncUI();
    window.dispatchEvent(new CustomEvent('machi:statechange'));
    syncUI();
  },0);
};

window.addEventListener('machi:statechange',()=>setTimeout(syncUI,0));
const observer=new MutationObserver(()=>{syncUI();if(!$('ending')?.classList.contains('hidden'))patchFinal();});
observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});
setTimeout(syncUI,100);
})();