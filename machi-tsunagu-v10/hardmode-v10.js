(function(){
'use strict';
const core=()=>window.MACHI_V9;
const $=id=>document.getElementById(id);
const D=window.GAME_DATA;
if(!core()||!$('dilemmaCard')) return;

const PRIMARY={youth:['youth'],child:['child'],senior:['senior'],industry:['industry'],tourism:['tourism'],connected:['connection','equity'],learning:['connection','youth']};
const COUNTER={child:['senior','connection'],senior:['youth','connection'],youth:['senior'],industry:['child','equity'],tourism:['equity','connection'],connection:['industry'],equity:['tourism'],stay:['connection']};

function st(){return core().getState()}
function metrics(){return core().getMetrics()}
function clamp(v){return Math.max(0,Math.min(100,Math.round(v)))}
function pol(id){return core().getPolicies().find(p=>p.id===id)}
function plannedIds(s){
  const kept=(s.active||[]).filter(id=>!s.keep||s.keep[id]!==false);
  return kept.concat(s.selected||[]);
}
function currentLimit(s){return s.year===1?2:3}
function availableBudget(s){
  const kept=(s.active||[]).filter(id=>!s.keep||s.keep[id]!==false);
  const upkeep=kept.reduce((a,id)=>a+((pol(id)||{}).upkeep||0),0);
  const selected=(s.selected||[]).reduce((a,id)=>a+((pol(id)||{}).cost||0),0);
  return Math.max(0,72+(s.currentBudgetBonus||0)-upkeep-selected);
}
function targetKey(s,avoid){
  const g=core().getGoal(), m=metrics();
  const keys=Object.keys(g.t).filter(k=>!['fatigue','acceptance'].includes(k)&&k!==avoid);
  keys.sort((a,b)=>{
    const ga=Math.max(0,(g.t[a]||0)-(s.v[a]||0));
    const gb=Math.max(0,(g.t[b]||0)-(s.v[b]||0));
    return gb-ga;
  });
  if(keys.length) return keys[0];
  const fallback=Object.keys(m).filter(k=>!['fatigue','acceptance',avoid].includes(k)).sort((a,b)=>(s.v[a]||0)-(s.v[b]||0));
  return fallback[0]||'connection';
}
function ensureData(s){
  if(!s.v10)s.v10={years:{}};
  if(!s.v10.years[s.year])s.v10.years[s.year]=makeDilemma(s);
  return s.v10.years[s.year];
}
function makeDilemma(s){
  const concerns=core().getConcerns()||[];
  const top=concerns[0]||{id:'belonging',name:'地域のつながり',metric:'connection',icon:'🤝'};
  const strategic=targetKey(s,top.metric);
  const mm=metrics();
  const topName=top.name, strategicName=(mm[strategic]||{}).n||'別の課題';
  const opposite=(COUNTER[top.metric]||['equity'])[0];
  const oppositeName=(mm[opposite]||{}).n||'別の分野';
  const options=[
    {
      id:'voice',icon:'📣',name:'いまの住民要望を優先する',
      desc:'今年もっとも声が集まっている「'+topName+'」へ資源を寄せます。',
      effects:{[top.metric]:4,acceptance:3,[opposite]:-2,fatigue:1},budget:-6,
      gain:topName+'と住民の納得感を伸ばしやすい。',
      lose:oppositeName+'は後回しになり、使える予算も減る。'
    },
    {
      id:'bridge',icon:'⚖️',name:'複数の立場をつなぐ',
      desc:'要望には応えつつ、世代・地区をまたぐ形に組み替えます。調整には手間と予算がかかります。',
      effects:{[top.metric]:2,[strategic]:2,connection:2,equity:1,acceptance:1,fatigue:2},budget:-10,
      gain:topName+'だけでなく、'+strategicName+'や地域のつながりにも波及する。',
      lose:'即効性は小さく、調整コストと担い手負担が大きい。'
    },
    {
      id:'future',icon:'🧭',name:'住民要望をあえて後回しにする',
      desc:'今年の人気より、5年後の目標で遅れている「'+strategicName+'」を優先します。',
      effects:{[strategic]:4,[top.metric]:-3,acceptance:-4},budget:4,
      gain:strategicName+'へ集中でき、将来目標に近づきやすい。',
      lose:topName+'を求める住民から「声を聞いていない」という反発が出る。'
    }
  ];
  return {year:s.year,top,strategic,title:'今年の論点：'+topName+'に、どこまで応える？',
    lead:'住民関心1位は「'+topName+'」。しかし予算も施策枠も有限です。どの方針を選んでも、得るものと失うものがあります。',
    options,selected:null,base:null};
}
function restoreBase(s,d){
  if(!d.base)return;
  Object.keys(d.base.v).forEach(k=>s.v[k]=d.base.v[k]);
  s.currentBudgetBonus=d.base.budget;
}
function applyOption(s,d,opt){
  if(!d.base)d.base={v:{...s.v},budget:s.currentBudgetBonus||0};
  else restoreBase(s,d);
  Object.entries(opt.effects||{}).forEach(([k,v])=>s.v[k]=clamp((s.v[k]||0)+v));
  s.currentBudgetBonus=(s.currentBudgetBonus||0)+(opt.budget||0);
  d.selected=opt.id;
}
function renderDilemma(){
  const s=st(); if(!s)return;
  const d=ensureData(s), chosen=d.options.find(o=>o.id===d.selected);
  const locked=(s.selected||[]).length>0 || s.resolved;
  $('dilemmaCard').innerHTML=
    '<div class="dilemmaHead"><div><h2>⚖️ '+d.title+'</h2><div class="small">毎年1つ、施策を選ぶ前に「何を優先し、何を諦めるか」を決めます。</div></div><span class="dilemmaBadge">決断が必要</span></div>'+ 
    '<div class="dilemmaLead">'+d.lead+'</div>'+ 
    '<div class="dilemmaChoices">'+d.options.map(o=>
      '<button class="dilemmaChoice '+(d.selected===o.id?'on':'')+'" data-choice="'+o.id+'" '+(locked?'disabled':'')+'>'+ 
      '<h3>'+o.icon+' '+o.name+'</h3><div class="choiceDesc">'+o.desc+'</div>'+ 
      '<div class="tradeGain"><b>得るもの</b><br>'+o.gain+'</div>'+ 
      '<div class="tradeLose"><b>失うもの</b><br>'+o.lose+'</div>'+ 
      '<div class="dilemmaCost">今年の予算 '+(o.budget>=0?'+':'')+o.budget+'pt</div></button>'
    ).join('')+'</div>'+ 
    (chosen?'<div class="dilemmaChosen"><b>選択中：</b>'+chosen.icon+' '+chosen.name+
      (locked?'<br><span class="small">施策を選び始めたため、この年の方針は変更できません。</span>':'<br><span class="small">施策を選ぶ前なら変更できます。</span>')+'</div>':'');
  $('dilemmaCard').querySelectorAll('[data-choice]').forEach(b=>b.onclick=()=>{
    const ss=st(),dd=ensureData(ss);
    if((ss.selected||[]).length||ss.resolved)return;
    const opt=dd.options.find(o=>o.id===b.dataset.choice); if(!opt)return;
    applyOption(ss,dd,opt);
    renderDilemma(); setPolicyLock(); refreshCoreDisplay(); markSaturation();
  });
}
function setPolicyLock(){
  const s=st();if(!s)return;
  const d=ensureData(s), unlocked=!!d.selected;
  $('policySection')?.classList.toggle('policyLocked',!unlocked);
  if(!unlocked)$('runDock')?.classList.remove('show');
  else{
    const total=plannedIds(s).length,ready=s.year===1?total===2:(total>=2&&total<=currentLimit(s));
    if(ready&&!s.resolved)$('runDock')?.classList.add('show');
  }
}
function refreshCoreDisplay(){
  const s=st(); if(!s)return;
  if($('budget'))$('budget').textContent=availableBudget(s);
  const plan=core().getPlan(), g=core().getGoal(), mm=metrics();
  const cards=[...document.querySelectorAll('#metricGrid .metric')];
  Object.keys(mm).forEach((k,i)=>{
    const card=cards[i];if(!card||!plan)return;
    const now=s.v[k],pred=plan.projected[k],d=pred-now,t=g.t[k];
    const b=card.querySelector('.metricTop b');if(b)b.innerHTML=now+' <small>→ '+pred+'</small>';
    const f=card.querySelector('.forecast');if(f)f.style.width=pred+'%';
    const line=card.querySelector('.forecastBar i');if(line)line.style.left=now+'%';
    const de=card.querySelector('.metricFoot .delta');if(de)de.textContent=(d>0?'+':'')+d;
    const tg=card.querySelector('.metricFoot span:last-child');if(tg)tg.textContent='目標 '+(k==='fatigue'?'≤':'≥')+t+((k==='fatigue'?now<=t:now>=t)?' ✓':'');
  });
}
function markSaturation(){
  const s=st();if(!s)return;
  const mm=metrics(), cards=[...document.querySelectorAll('#metricGrid .metric')];
  document.querySelectorAll('.saturationTag').forEach(x=>x.remove());
  Object.keys(mm).forEach((k,i)=>{
    if(['fatigue','acceptance'].includes(k))return;
    const v=s.v[k],card=cards[i];if(!card||v<70)return;
    const tag=document.createElement('span');tag.className='saturationTag';
    tag.textContent=v>=90?'飽和域：追加効果 約20%':v>=80?'高水準：追加効果 約40%':'伸びにくい：追加効果 約65%';
    card.appendChild(tag);
  });
}
function saturationFactor(v){return v>=90?.20:v>=80?.40:v>=70?.65:v>=60?.85:1}
function applyPostRun(before,ids){
  const s=st(),mm=metrics(),notes=[];
  Object.keys(mm).forEach(k=>{
    if(['fatigue','acceptance'].includes(k))return;
    const gain=(s.v[k]||0)-(before[k]||0);
    if(gain<=0)return;
    const f=saturationFactor(before[k]||0);
    if(f<1){
      const reduced=Math.max(0,Math.round(gain*f));
      if(reduced<gain){s.v[k]=clamp(before[k]+reduced);notes.push('📉 '+mm[k].n+'は高水準のため、+'+gain+'の効果が+'+reduced+'まで逓減した。')}
    }
  });
  const streak=s.focusStreak||{};
  const penalties=[];
  function penalize(key,accept,other,amount,msg){
    if((streak[key]||0)<3)return;
    s.v.acceptance=clamp(s.v.acceptance-accept);
    if(other)s.v[other]=clamp(s.v[other]-amount);
    penalties.push('⚖️ '+msg);
  }
  penalize('child',4,'senior',2,'子ども分野への集中が3年以上続き、高齢者・子どものいない世帯から反発が強まった。');
  penalize('senior',4,'youth',2,'高齢者分野への集中が3年以上続き、若い世代から「自分たちは後回し」という声が強まった。');
  penalize('industry',3,'equity',2,'産業優先が続き、地区や生活課題への配分を求める声が強まった。');
  penalize('tourism',4,'equity',2,'観光・にぎわい優先が続き、暮らしや地区間公平への不満が強まった。');
  notes.push(...penalties);
  const h=s.history?.[s.history.length-1];if(h&&h.year===s.year)h.v={...s.v};
  return notes;
}
function refreshResult(before,notes){
  const s=st(),g=core().getGoal(),mm=metrics();
  if($('changes'))$('changes').innerHTML=Object.keys(mm).map(k=>{
    const d=s.v[k]-before[k],target=(k==='fatigue'?'≤':'≥')+g.t[k];
    return '<div class="change">'+mm[k].i+' '+mm[k].n+' <b class="'+(d>=0?'up':'down')+'">'+(d>0?'+':'')+d+'</b> → '+s.v[k]+' <span class="targetNote">（目標値: '+target+'）</span></div>';
  }).join('');
  if(notes.length){
    let box=$('v10ResultNote');
    if(!box){box=document.createElement('div');box.id='v10ResultNote';box.className='v10ResultNote';$('reasons')?.parentElement?.appendChild(box)}
    box.innerHTML='<b>さらに起きたこと</b><br>'+notes.map(x=>'・'+x).join('<br>');
  }
  refreshHistory();
}
function refreshHistory(){
  const s=st(),keys=['connection','youth','child','senior','stay','industry','tourism','equity','acceptance','fatigue'];
  if(!$('history'))return;
  $('history').innerHTML=(s.history||[]).map(h=>'<tr><td>'+h.year+'</td><td>'+h.names.join(' / ')+'</td>'+keys.map(k=>'<td>'+h.v[k]+'</td>').join('')+'</tr>').join('');
}
function progress(k,target,s){
  const start=D.START[k],now=s.v[k];
  if(k==='fatigue'){
    if(now<=target)return 1;
    return Math.max(0,1-(now-target)/Math.max(1,100-target));
  }
  if(target<=start)return now>=target?1:Math.max(0,now/Math.max(1,target));
  return Math.max(0,Math.min(1,(now-start)/(target-start)));
}
function finalScore(){
  const s=st(),g=core().getGoal(),primary=new Set(PRIMARY[s.goal]||[]);
  const entries=Object.entries(g.t);
  let sum=0,w=0;const ps=[];
  entries.forEach(([k,t])=>{
    const p=progress(k,t,s),ww=primary.has(k)?4:1;sum+=p*ww;w+=ww;
    if(!['fatigue','acceptance'].includes(k))ps.push(p);
  });
  const goal=sum/w;
  const sorted=ps.slice().sort((a,b)=>a-b);
  const weakest=(sorted.slice(0,Math.min(3,sorted.length)).reduce((a,b)=>a+b,0)/Math.max(1,Math.min(3,sorted.length)));
  const acc=progress('acceptance',g.t.acceptance,s);
  const sustain=progress('fatigue',g.t.fatigue,s);
  let score=Math.round(100*(.55*goal+.20*weakest+.15*acc+.10*sustain));
  const minp=Math.min(...ps);
  if(minp<.4)score=Math.min(score,69); else if(minp<.6)score=Math.min(score,79);
  if(s.v.acceptance<50)score=Math.min(score,74);
  if(s.v.fatigue>70)score=Math.min(score,74);
  const allMet=entries.every(([k,t])=>k==='fatigue'?s.v[k]<=t:s.v[k]>=t);
  const majorMin=Math.min(...Object.keys(metrics()).filter(k=>!['fatigue','acceptance'].includes(k)).map(k=>s.v[k]));
  if(!(allMet&&s.v.acceptance>=70&&s.v.fatigue<=g.t.fatigue&&majorMin>=45))score=Math.min(score,94);
  return {score,goal,weakest,acc,sustain,allMet};
}
function patchEnding(){
  if(!$('ending')||$('ending').classList.contains('hidden'))return;
  const r=finalScore();
  $('achievement').textContent=r.score;
  $('endingLabel').textContent=r.score>=95?'🏆 難しい両立を実現した':r.score>=82?'🌟 強い成果。ただし選ばなかったものもある':r.score>=68?'🧭 成果と犠牲がはっきりした':'🧪 優先順位を組み直して再挑戦';
  $('scoreBreakdown').innerHTML='<b>v10の総合評価：</b>目標だけではなく、「弱い分野をどこまで残したか」「住民の納得」「担い手の持続性」も評価します。'+
    '<div class="scoreParts"><div class="scorePart"><span>目標への前進</span><b>'+Math.round(r.goal*100)+'</b></div>'+ 
    '<div class="scorePart"><span>弱い3項目</span><b>'+Math.round(r.weakest*100)+'</b></div>'+ 
    '<div class="scorePart"><span>住民納得</span><b>'+Math.round(r.acc*100)+'</b></div>'+ 
    '<div class="scorePart"><span>持続性</span><b>'+Math.round(r.sustain*100)+'</b></div></div>'+ 
    '<span class="small">100%には、目標値の達成だけでなく、納得感70以上・担い手疲労が目標内・極端に低い分野を残さないことが必要です。</span>';
}
function candidatesForMetric(key){
  return core().getPolicies().filter(p=>p.id!=='rest'&&(p.focus||[]).includes(key)).slice(0,2).map(p=>p.icon+' '+p.name).join('／')||'該当施策を探す';
}
function renderAdvisorV10(){
  const s=st();if(!s||!$('advisorBody'))return;
  const cs=core().getConcerns()||[],top=cs[0],g=core().getGoal(),mm=metrics();
  const primary=(PRIMARY[s.goal]||[])[0]||targetKey(s);
  const weak=Object.keys(g.t).filter(k=>!['fatigue','acceptance'].includes(k)).sort((a,b)=>progress(a,g.t[a],s)-progress(b,g.t[b],s))[0]||primary;
  $('advisorBody').innerHTML=
    '<div class="v10AdvisorIntro"><b>今回は「正解候補」を出しません。</b><br>同じデータから、どの価値を優先するかで3つのルートがあります。どれも代償があります。</div>'+ 
    '<div class="routeGrid">'+ 
      route('📣 住民の今の声を優先',top?top.name:'今年の要望',top?candidatesForMetric(top.metric):'住民要望に合う施策',
        '納得感と今年の手応えを得やすい。','5年目標や声の小さい層が後回しになる可能性。')+
      route('🧭 5年後の目標を優先',mm[primary]?.n||'中心目標',candidatesForMetric(primary),
        '掲げた「目指すまち」に最短で近づきやすい。','今年の住民要望を外すと納得感を失う。')+
      route('🛟 崩れているところを守る',mm[weak]?.n||'弱い分野',candidatesForMetric(weak),
        '大きな穴を残しにくく、最終評価の下振れを防ぐ。','目玉となる成果が出にくく、目標到達が遅い。')+
    '</div><div class="advisorNote"><b>考える問い：</b>今年「伸ばさない」と決めるのはどこですか？　その人たちに、なぜ今年は後回しなのか説明できますか？</div>';
}
function route(title,focus,cands,plus,minus){
  return '<div class="routeCard"><h3>'+title+'</h3><div class="small">焦点：<b>'+focus+'</b><br>候補：'+cands+'</div><div class="routeTrade"><div class="routePlus"><b>得る</b><br>'+plus+'</div><div class="routeMinus"><b>失う</b><br>'+minus+'</div></div></div>';
}

const oldRun=$('dockRun').onclick;
$('dockRun').onclick=function(e){
  const s=st(),d=ensureData(s);
  if(!d.selected){alert('先に「今年の論点」で方針を1つ選んでください。');return}
  const before={...s.v},ids=plannedIds(s);
  oldRun.call(this,e);
  const notes=applyPostRun(before,ids);
  refreshResult(before,notes);
  markSaturation();
};
const oldNext=$('nextYear').onclick;
$('nextYear').onclick=function(e){
  const wasYear=st()?.year;
  oldNext.call(this,e);
  if(wasYear===5){setTimeout(patchEnding,0);return}
  setTimeout(()=>{renderDilemma();setPolicyLock();refreshCoreDisplay();markSaturation()},0);
};
$('advisorBtn')?.addEventListener('click',()=>setTimeout(renderAdvisorV10,0));
window.addEventListener('machi:statechange',()=>{
  const s=st();if(!s)return;
  renderDilemma();setPolicyLock();markSaturation();
});
setTimeout(()=>{if(st()){renderDilemma();setPolicyLock();markSaturation()}},0);
})();