(function(){
'use strict';
const D=window.GAME_DATA,$=id=>document.getElementById(id),{M,START,APPROACHES,GOALS,POLICIES:P,EVENTS,SURPRISE}=D;
const MAX_POLICIES=3;
const PRIMARY={youth:['youth'],child:['child'],senior:['senior'],industry:['industry'],tourism:['tourism'],connected:['connection','equity'],learning:['connection','youth']};
let S=null;
const clamp=v=>Math.max(0,Math.min(100,Math.round(v)));
const pick=a=>a[Math.floor(Math.random()*a.length)];
const policy=id=>P.find(x=>x.id===id);

function currentLimit(){return S&&S.year===1?2:MAX_POLICIES}
function approachBonus(p){
  let m=1,w=[];
  if(S.approach==='repair'&&(p.tags.includes('repair')||p.tags.includes('jobs')||p.tags.includes('distributed')||p.tags.includes('flexible'))){m*=1.12;w.push('課題解決方針 +12%')}
  if(S.approach==='strength'&&(p.tags.includes('strength')||p.tags.includes('business')||p.tags.includes('welfare')||p.tags.includes('child'))){m*=1.12;w.push('強み活用方針 +12%')}
  return{m,w};
}
function localFit(p){
  let m=1,w=[];
  if(p.tags.includes('child')){m*=1.15;w.push('子ども人口の厚み +15%')}
  if(p.tags.includes('daytime')){m*=.78;w.push('町外通勤通学の多さ −22%')}
  if(p.tags.includes('flexible')){m*=1.15;w.push('夜・オンライン型 +15%')}
  if(p.tags.includes('jobs')){m*=1.15;w.push('町内仕事づくり +15%')}
  if(p.tags.includes('business')){m*=1.12;w.push('1,441事業所 +12%')}
  if(p.tags.includes('welfare')){m*=1.10;w.push('医療・福祉基盤 +10%')}
  if(p.tags.includes('mobility')){m*=1.10;w.push('転入超過 +10%')}
  if(p.tags.includes('distributed')){m*=1.12;w.push('地区規模差への対応 +12%')}
  const a=approachBonus(p);m*=a.m;w=w.concat(a.w);
  if(S.v.fatigue>=80){m*=.62;w.push('担い手疲労で効果−38%')}
  else if(S.v.fatigue>=65){m*=.78;w.push('担い手疲労で効果−22%')}
  return{m,w};
}
function adjustedEffects(p,fit){return Object.entries(p.e).map(([k,v])=>[k,k==='fatigue'?v:Math.round(v*fit.m)])}
function renderApproaches(){
  const h=$('approachGrid');
  Object.entries(APPROACHES).forEach(([k,a],i)=>{
    const d=document.createElement('div');d.className='choice'+(i===2?' active':'');d.dataset.k=k;
    d.innerHTML='<b>'+a.icon+' '+a.name+'</b><span class="small">'+a.desc+'</span><div class="rule">'+a.bonus+'</div>';
    d.onclick=()=>{h.querySelectorAll('.choice').forEach(x=>x.classList.remove('active'));d.classList.add('active')};h.appendChild(d);
  });
}
function renderGoals(){
  const h=$('goalGrid');
  Object.entries(GOALS).forEach(([k,g],i)=>{
    const d=document.createElement('div');d.className='choice'+(i===0?' active':'');d.dataset.k=k;
    const main=Object.entries(g.t).filter(([x])=>x!=='fatigue').sort((a,b)=>b[1]-a[1]).slice(0,3).map(([x,v])=>M[x].n+' '+v).join(' / ');
    d.innerHTML='<b>'+g.icon+' '+g.name+'</b><span class="small">'+main+'</span>';
    d.onclick=()=>{h.querySelectorAll('.choice').forEach(x=>x.classList.remove('active'));d.classList.add('active')};h.appendChild(d);
  });
}
function continuedIds(){return S.active.filter(id=>S.keep[id]!==false)}
function upkeep(){return continuedIds().reduce((a,id)=>a+(policy(id).upkeep||0),0)}
function available(){return Math.max(0,72+S.currentBudgetBonus-upkeep())}
function selectedCost(){return S.selected.reduce((a,id)=>a+policy(id).cost,0)}
function totalPlanned(){return continuedIds().length+S.selected.length}
function slotsLeft(){return Math.max(0,currentLimit()-totalPlanned())}
function trimSelections(){while(S.selected.length&&(selectedCost()>available()||totalPlanned()>currentLimit()))S.selected.pop()}
function milestone(){
  return S.year===1?'🌱 1年目：最初の年は、新しく始められる施策は2つまで。':
    S.year===3?'🏁 3年目：折り返し。続ける事業とやめる事業を見直そう。':
    S.year===5?'🏆 最終年：何を残し、何を手放すか。':'あと'+(6-S.year)+'年。2年目からは継続も含めて最大3つです。';
}
function plan(){
  let delta={},focus=new Set(),nextNeglect={...S.neglect};
  Object.entries((S.event&&S.event.e)||{}).forEach(([k,v])=>delta[k]=(delta[k]||0)+v);
  continuedIds().forEach(id=>{
    const p=policy(id);p.focus.forEach(x=>focus.add(x));
    Object.entries(p.e).forEach(([k,v])=>{
      if(k==='fatigue')delta[k]=(delta[k]||0)+Math.max(0,Math.round(v*.25));
      else if(v>0)delta[k]=(delta[k]||0)+Math.max(1,Math.round(v*.25));
    });
  });
  S.selected.forEach(id=>{
    const p=policy(id),fit=localFit(p);p.focus.forEach(x=>focus.add(x));
    adjustedEffects(p,fit).forEach(([k,v])=>delta[k]=(delta[k]||0)+v);
  });
  const base={youth:1,child:2,senior:1,stay:2,industry:1,tourism:1,equity:2};
  Object.entries(base).forEach(([k,b])=>{
    if(focus.has(k)){nextNeglect[k]=0;return}
    nextNeglect[k]=(nextNeglect[k]||0)+1;
    const loss=b+Math.max(0,nextNeglect[k]-1);delta[k]=(delta[k]||0)-loss;
  });
  const projected={...S.v};Object.entries(delta).forEach(([k,v])=>projected[k]=clamp(projected[k]+v));
  return{delta,projected,nextNeglect};
}
function renderMetrics(){
  const h=$('metricGrid'),g=GOALS[S.goal],pl=plan();h.innerHTML='';
  Object.entries(M).forEach(([k,m])=>{
    const now=S.v[k],pred=pl.projected[k],d=pred-now,t=g.t[k],good=k==='fatigue'?d<=0:d>=0,ok=k==='fatigue'?now<=t:now>=t,card=document.createElement('div');
    card.className='metric'+(k==='fatigue'?' fatigue':'');
    card.innerHTML='<div class="metricTop"><span class="name">'+m.i+' '+m.n+'</span><b>'+now+' <small>→ '+pred+'</small></b></div><div class="forecastBar '+(good?'good':'bad')+'"><span class="forecast" style="width:'+pred+'%"></span><i style="left:'+now+'%"></i></div><div class="metricFoot"><span class="delta '+(d===0?'flat':good?'goodText':'badText')+'">'+(d>0?'+':'')+d+'</span><span>目標 '+(k==='fatigue'?'≤':'≥')+t+(ok?' ✓':'')+'</span></div>';
    h.appendChild(card);
  });
}
function renderContinuations(){
  const box=$('continuationList');
  if(!S.active.length){$('continuationCard').classList.add('hidden');box.innerHTML='';return}
  $('continuationCard').classList.remove('hidden');
  box.innerHTML=S.active.map(id=>{
    const p=policy(id),keep=S.keep[id]!==false;
    return '<div class="continueRow"><div><b>'+p.icon+' '+p.name+'</b><div class="small">維持費 '+p.upkeep+'pt／年・継続効果は初年度の約25%</div></div><div class="seg"><button data-id="'+id+'" data-keep="1" class="'+(keep?'on':'')+'">続ける</button><button data-id="'+id+'" data-keep="0" class="'+(!keep?'stopOn':'')+'">やめる</button></div></div>';
  }).join('');
  box.querySelectorAll('button').forEach(b=>b.onclick=()=>{S.keep[b.dataset.id]=b.dataset.keep==='1';trimSelections();renderAll()});
}
function renderPolicies(){
  const h=$('policyGrid'),limit=currentLimit();h.innerHTML='';
  P.forEach(p=>{
    if(p.id==='rest')return;
    const active=S.active.includes(p.id),sel=S.selected.includes(p.id),fit=localFit(p),full=totalPlanned()>=limit&&!sel&&!active,d=document.createElement('div');
    d.className='policy'+(sel?' selected':'')+(active?' activePolicy':'')+(full?' slotFull':'');
    const tags=adjustedEffects(p,fit).map(([k,v])=>'<span class="tag '+(v>=0?'plus':'minus')+'">'+M[k].n+' '+(v>0?'+':'')+v+'</span>').join('');
    const status=active?'<span class="activeBadge">継続判断は上で</span>':full?'<span class="activeBadge">今年の'+limit+'枠が埋まっています</span>':'';
    d.innerHTML='<span class="cost">'+p.cost+'pt</span>'+status+'<h3>'+p.icon+' '+p.name+'</h3><div class="small">'+p.desc+'</div><div class="effects">'+tags+'</div><div class="localFit"><b>南風原補正 ×'+fit.m.toFixed(2)+'</b><br>'+(fit.w.length?fit.w.join(' ／ '):'固有補正なし')+'</div>';
    if(!active&&!full)d.onclick=()=>toggle(p.id);
    h.appendChild(d);
  });
}
function toggle(id){
  const p=policy(id),i=S.selected.indexOf(id);
  if(i>=0)S.selected.splice(i,1);
  else{
    if(totalPlanned()>=currentLimit())return;
    if(selectedCost()+p.cost>available())return alert('今年の予算が足りません。継続事業をやめると予算が戻る場合があります。');
    S.selected.push(id);
  }
  renderAll();
}
function renderEvent(){
  S.event=S.event||pick(EVENTS);$('yearEvent').textContent=S.event.text;
  const a=S.event.voices.slice();
  if(S.v.stay<42)a.push('町に住んでいても、平日はほとんど町外にいるよ。');
  if(S.v.equity<42)a.push('地区によって参加しやすさが違う気がする。');
  if(S.v.fatigue>62)a.push('活動は増えたけど、準備する人がもう限界かも。');
  $('voices').innerHTML=a.slice(0,4).map((x,i)=>'<div class="voice"><b>'+(i%2?'👩 住民':'🧑 住民')+'</b>'+x+'</div>').join('');
}
function renderSelected(){
  const a=S.selected.map(policy),spent=selectedCost(),remain=Math.max(0,available()-spent),continued=continuedIds().length,total=totalPlanned(),limit=currentLimit(),left=slotsLeft();
  $('budget').textContent=remain;
  $('upkeepBox').innerHTML='<b>今年の施策枠 '+total+'/'+limit+'（継続 '+continued+'／新規 '+a.length+'）</b><br><span class="small">'+(S.year===1?'初年度は新規施策を最大2つまで。':'2年目以降は継続を含めて最大3つ。')+' 継続費 '+upkeep()+'pt。</span>';
  $('selectedSummary').innerHTML=a.length?'<b>新しく選択：</b>'+a.map(p=>p.icon+p.name).join(' ＋ ')+'<br><span class="small">新規費 '+spent+'pt／残り '+remain+'pt／あと'+left+'枠</span>':'<b>新規施策はまだありません。</b><br><span class="small">継続を含めて今年は'+total+'/'+limit+'枠を使用中です。</span>';
  const dock=$('runDock');
  const ready=S.year===1?total===2:(total>=2&&total<=limit);
  if(ready&&!S.resolved){
    dock.classList.add('show');
    $('dockTitle').textContent='今年の施策 '+total+'/'+limit;
    $('dockSummary').textContent=(continued?'継続'+continued+' ＋ ':'')+(a.length?'新規'+a.length:'新規0')+(left?'　あと'+left+'つ追加できます':'　枠をすべて使用');
    $('dockRun').textContent='この'+total+'施策で1年進める →';
  }else dock.classList.remove('show');
}
function renderAll(){$('year').textContent=S.year;$('milestone').textContent=milestone();renderContinuations();renderSelected();renderEvent();renderMetrics();renderPolicies()}
function runYear(){
  const total=totalPlanned(),limit=currentLimit();
  if(S.resolved||total<2||total>limit)return;
  if(S.year===1&&total!==2)return;
  S.resolved=true;$('runDock').classList.remove('show');
  const chosen=S.selected.map(policy),pl=plan(),delta={...pl.delta},reasons=[],continuedNow=continuedIds();
  if(Object.keys((S.event&&S.event.e)||{}).length)reasons.push('今年の地域状況：'+Object.entries(S.event.e).map(([k,v])=>M[k].n+(v>0?'+':'')+v).join('、'));
  continuedNow.forEach(id=>reasons.push('継続：'+policy(id).name+'（維持費'+policy(id).upkeep+'pt）'));
  S.active.filter(id=>S.keep[id]===false).forEach(id=>reasons.push('終了：'+policy(id).name+'（維持費と継続効果を停止）'));
  chosen.forEach(p=>{const fit=localFit(p);reasons.push(p.name+'：'+(fit.w.length?fit.w.join(' ／ '):'標準効果')+' → ×'+fit.m.toFixed(2))});
  const surprise=pick(SURPRISE);Object.entries(surprise.e||{}).forEach(([k,v])=>delta[k]=(delta[k]||0)+v);if(surprise.budget)S.nextBudgetBonus+=surprise.budget;
  const before={...S.v};Object.entries(delta).forEach(([k,v])=>S.v[k]=clamp(S.v[k]+v));S.neglect=pl.nextNeglect;
  const nextActive=continuedNow.slice();chosen.forEach(p=>{if(p.upkeep&&!nextActive.includes(p.id))nextActive.push(p.id)});S.active=nextActive.slice(0,MAX_POLICIES);S.keep={};S.active.forEach(id=>S.keep[id]=true);
  const allNames=continuedNow.map(id=>'継続:'+policy(id).name).concat(chosen.map(p=>'新規:'+p.name));S.history.push({year:S.year,names:allNames,v:{...S.v}});
  const g=GOALS[S.goal];
  $('resultTitle').textContent=S.year+'年目の結果';$('surprise').textContent='予想外の出来事：'+surprise.text;
  $('changes').innerHTML=Object.keys(M).map(k=>{const d=S.v[k]-before[k],target=(k==='fatigue'?'≤':'≥')+g.t[k];return '<div class="change">'+M[k].i+' '+M[k].n+' <b class="'+(d>=0?'up':'down')+'">'+(d>0?'+':'')+d+'</b> → '+S.v[k]+' <span class="targetNote">（目標値: '+target+'）</span></div>'}).join('');
  $('reasons').innerHTML=reasons.map(x=>'・'+x).join('<br>');
  const a=[];if(S.v.child>=70)a.push('子育ての選択肢が増えてきたと感じる。');if(S.v.stay>=55)a.push('地元で働く・関わる選択肢が前より見える。');if(S.v.equity<40)a.push('中心の地区は便利になったけど、うちの地区は置いていかれてる感じ。');if(S.v.fatigue>70)a.push('新しいことより、続け方を考えてほしい。');if(!a.length)a.push('少しずつ変わっているけど、まだ実感できるほどではないかな。');
  $('afterVoices').innerHTML=a.map(x=>'<div class="voice">👤 '+x+'</div>').join('');$('result').classList.remove('hidden');renderHistory();$('result').scrollIntoView({behavior:'smooth',block:'start'});
}
function renderHistory(){$('history').innerHTML=S.history.map(h=>'<tr><td>'+h.year+'</td><td>'+h.names.join(' / ')+'</td>'+['connection','youth','child','senior','stay','industry','tourism','equity','fatigue'].map(k=>'<td>'+h.v[k]+'</td>').join('')+'</tr>').join('')}
function next(){if(S.year>=5)return finish();S.year++;S.selected=[];S.event=null;S.currentBudgetBonus=S.nextBudgetBonus;S.nextBudgetBonus=0;S.resolved=false;S.keep={};S.active.forEach(id=>S.keep[id]=true);$('result').classList.add('hidden');renderAll();window.scrollTo({top:0,behavior:'smooth'})}

function metricProgress(k,target){
  const start=START[k],now=S.v[k];
  if(k==='fatigue'){
    if(start<=target){if(now<=target)return 1;return Math.max(0,1-(now-target)/Math.max(1,100-target));}
    return Math.max(0,Math.min(1,(start-now)/Math.max(1,start-target)));
  }
  if(target>start)return Math.max(0,Math.min(1,(now-start)/(target-start)));
  if(now>=target)return 1;
  return Math.max(0,Math.min(1,now/Math.max(1,target)));
}
function achievementScore(){
  const g=GOALS[S.goal],primary=new Set(PRIMARY[S.goal]||[]);let sum=0,weights=0;
  Object.entries(g.t).forEach(([k,t])=>{const w=primary.has(k)?4:1;sum+=metricProgress(k,t)*w;weights+=w;});
  let score=Math.round(sum/weights*100);
  if(S.approach==='hybrid')score=Math.min(100,score+3);
  return score;
}
function finish(){
  const g=GOALS[S.goal],ach=achievementScore(),primary=PRIMARY[S.goal]||[];
  $('play').classList.add('hidden');$('ending').classList.remove('hidden');$('runDock').classList.remove('show');$('endingTitle').textContent=g.icon+' '+g.name+' × '+APPROACHES[S.approach].name;$('achievement').textContent=ach;
  $('endingLabel').textContent=ach>=90?'🏆 目標にかなり近づいた':ach>=78?'🌟 方向性が形になった':ach>=65?'🧭 成果と課題がはっきりした':'🧪 優先順位を組み直して再挑戦';
  $('scoreBreakdown').innerHTML='<b>この％の意味：</b>開始時点から各目標値へどれだけ進んだかを評価しています。<br><span class="small">「'+g.name+'」の中心指標（'+primary.map(k=>M[k].n).join('・')+'）は4倍の重みで計算。開始時より悪化した中心指標は高得点で相殺できません。</span>';
  const dif=Object.keys(M).filter(k=>k!=='fatigue').map(k=>({k,d:S.v[k]-START[k]})).sort((a,b)=>b.d-a.d);
  $('strengthReport').innerHTML=dif.slice(0,4).map(x=>'<li>'+M[x.k].n+'：'+START[x.k]+' → '+S.v[x.k]+'（'+(x.d>=0?'+':'')+x.d+'）</li>').join('');
  const c=[];Object.entries(g.t).forEach(([k,t])=>{const miss=k==='fatigue'?S.v[k]>t:S.v[k]<t;if(miss)c.push(M[k].n+'：現在'+S.v[k]+'／目標'+(k==='fatigue'?'≤':'≥')+t)});if(!c.length)c.push('目標値はすべて達成。次は「誰が負担したか」を考えてみよう。');
  $('challengeReport').innerHTML=c.slice(0,5).map(x=>'<li>'+x+'</li>').join('');$('endingQuestion').innerHTML='<b>最後の問い：</b>初年度は2つ、2年目以降は最大3つ。その限られた枠の中で、何を続け、何をやめ、何を新しく始めたか。その優先順位は5年後の町にどう表れましたか。';window.scrollTo({top:0,behavior:'smooth'});
}
function start(){
  const a=$('approachGrid').querySelector('.choice.active').dataset.k,g=$('goalGrid').querySelector('.choice.active').dataset.k;
  S={year:1,approach:a,goal:g,v:{...START},selected:[],active:[],keep:{},neglect:{},history:[],event:null,currentBudgetBonus:0,nextBudgetBonus:0,resolved:false};
  $('approachPill').textContent=APPROACHES[a].icon+' '+APPROACHES[a].name;$('goalPill').textContent=GOALS[g].icon+' '+GOALS[g].name;$('setup').classList.add('hidden');$('play').classList.remove('hidden');$('ending').classList.add('hidden');$('result').classList.add('hidden');renderAll();window.scrollTo({top:0,behavior:'smooth'});
}
function reset(){$('runDock').classList.remove('show');$('play').classList.add('hidden');$('ending').classList.add('hidden');$('setup').classList.remove('hidden');window.scrollTo({top:0,behavior:'smooth'})}
renderApproaches();renderGoals();$('start').onclick=start;$('dockRun').onclick=runYear;$('nextYear').onclick=next;$('resetTop').onclick=reset;$('restart').onclick=reset;
})();
