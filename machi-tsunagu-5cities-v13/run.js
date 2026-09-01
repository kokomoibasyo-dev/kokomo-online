function evaluateYear(){
  const before={...S.v}, ids=allPlannedIds(), reasons=[], outcomes=[];
  let delta={};
  Object.entries(S.event?.e||{}).forEach(([k,v])=> delta[k]=(delta[k]||0)+v);
  if(Object.keys(S.event?.e||{}).length) reasons.push('今年の地域状況：'+Object.entries(S.event.e).map(([k,v])=>METRICS[k].n+(v>0?'+':'')+v).join('、'));
  if(S.dilemma==='balance'){ delta.equity=(delta.equity||0)+2; delta.connection=(delta.connection||0)+1; delta.fatigue=(delta.fatigue||0)+1; reasons.push('⚖️ 複数の立場をつなぐを選択 → 地区バランス+2、つながり+1、疲れ+1'); }
  if(S.dilemma==='futureFirst'){ delta.acceptance=(delta.acceptance||0)-2; reasons.push('🎯 5年後目標を優先 → 納得感-2'); }
  if(S.dilemma==='residentFirst'){ delta.acceptance=(delta.acceptance||0)+1; reasons.push('🗣️ 今年の住民の声を優先 → 納得感+1'); }
  continuedIds().forEach(id=>{
    const p=policyById(id), fit=localFit(p); p.focus.forEach(k=>{});
    Object.entries(p.e).forEach(([k,v])=>{ const amt=(k==='fatigue'||k==='acceptance')? Math.round(v*0.25) : Math.round(v*fit.m*0.25); delta[k]=(delta[k]||0)+amt; });
    reasons.push('継続：'+p.name+'（維持費'+p.upkeep+'pt・継続効果は初年度の約25%）');
  });
  S.active.filter(id=>S.keep[id]===false).forEach(id=> reasons.push('終了：'+policyById(id).name+'（維持費と継続効果を停止）'));
  S.selected.forEach(id=>{
    const p=policyById(id), suit=getSuitability(p), result=rollResult(suit);
    Object.entries(p.e).forEach(([k,v])=>{ const base=(k==='fatigue'||k==='acceptance')? v : Math.round(v*suit.fitM*result.mult); delta[k]=(delta[k]||0)+base; });
    outcomes.push({p,suit,result});
    reasons.push(p.name+'：'+(suit.why.length?suit.why.join(' ／ '):'標準効果')+' → '+result.label);
  });
  COMBOS.forEach(c=>{
    if(c.ids.every(id=>ids.includes(id))){
      Object.entries(c.e).forEach(([k,v])=> delta[k]=(delta[k]||0)+v);
      reasons.push((c.type==='synergy'?'✨ 相乗効果：':'⚠️ 葛藤：')+c.name+' → '+Object.entries(c.e).map(([k,v])=>METRICS[k].n+(v>0?'+':'')+v).join('、'));
    }
  });
  S.concerns.forEach((c,i)=>{
    const met=ids.some(id=>concernMatch(policyById(id),c));
    if(i===0){
      if(met){ delta.acceptance=(delta.acceptance||0)+4; if(c.metric) delta[c.metric]=(delta[c.metric]||0)+1; reasons.push('🗣️ 最重要の住民関心「'+c.name+'」に応えた → 納得感+4'); }
      else { delta.acceptance=(delta.acceptance||0)-5; if(c.metric) delta[c.metric]=(delta[c.metric]||0)-2; reasons.push('🗣️ 最重要の住民関心「'+c.name+'」を後回し → 納得感-5、'+METRICS[c.metric].n+'-2'); }
    } else if(i===1 && met){ delta.acceptance=(delta.acceptance||0)+2; reasons.push('住民関心「'+c.name+'」にも対応 → 納得感+2'); }
  });
  const focus=focusList(ids); const baseLoss={youth:1,child:2,senior:1,stay:2,industry:1,tourism:1,equity:2,connection:1};
  Object.keys(baseLoss).forEach(k=>{
    if(focus.has(k)){ S.neglect[k]=0; return; }
    S.neglect[k]=(S.neglect[k]||0)+1; const loss=baseLoss[k]+Math.max(0,S.neglect[k]-1); delta[k]=(delta[k]||0)-loss; reasons.push(METRICS[k].n+'を'+S.neglect[k]+'年後回し → '+loss+'低下');
  });
  const counts={child:0,youth:0,senior:0,industry:0,tourism:0}; ids.forEach(id=> (policyById(id).focus||[]).forEach(k=>{ if(counts[k]!=null) counts[k]++; }));
  if(counts.child>=2 && (S.focusStreak.child||0)>=1){ delta.acceptance=(delta.acceptance||0)-4; delta.senior=(delta.senior||0)-1; reasons.push('⚖️ 子ども分野への集中が続き、他層から不満 → 納得感-4、高齢者-1'); }
  if(counts.senior>=2 && (S.focusStreak.senior||0)>=1){ delta.acceptance=(delta.acceptance||0)-4; delta.youth=(delta.youth||0)-1; reasons.push('⚖️ 高齢者分野への集中が続き、若い世代の納得感が低下 → 納得感-4、若者-1'); }
  if(counts.tourism>=2){ delta.acceptance=(delta.acceptance||0)-2; delta.fatigue=(delta.fatigue||0)+2; reasons.push('⚖️ にぎわい施策の集中で、暮らしとの摩擦が発生 → 納得感-2、疲れ+2'); }
  if(counts.industry>=2 && (S.focusStreak.industry||0)>=1){ delta.acceptance=(delta.acceptance||0)-3; delta.child=(delta.child||0)-1; reasons.push('⚖️ 産業偏重が続き、子育て世代の不満が増加 → 納得感-3、子ども-1'); }
  const surprise=pick(SURPRISES); Object.entries(surprise.e||{}).forEach(([k,v])=> delta[k]=(delta[k]||0)+v); if(surprise.budget) S.nextBudgetBonus += surprise.budget;
  Object.entries(delta).forEach(([k,v])=> S.v[k]=clamp(S.v[k]+v));
  const present=focusList(ids); ['child','youth','senior','industry','tourism','connection','equity','stay'].forEach(k=> S.focusStreak[k]=present.has(k)?(S.focusStreak[k]||0)+1:0);
  const nextActive=continuedIds().slice(); S.selected.forEach(id=>{ const p=policyById(id); if(p.upkeep && !nextActive.includes(id)) nextActive.push(id); }); S.active=nextActive.slice(0,3); S.keep={}; S.active.forEach(id=>S.keep[id]=true);
  const names=continuedIds().map(id=>'継続:'+policyById(id).name).concat(S.selected.map(id=>'新規:'+policyById(id).name));
  S.history.push({year:S.year,names,v:{...S.v}});
  return {before,outcomes,reasons,surprise};
}
function renderExecution(result){
  const box=$('executionResult');
  box.innerHTML = '<h3>🎲 施策の実行結果</h3><div class="executionGrid">'+result.outcomes.map(o=>'<div class="executionItem '+o.result.kind+'"><div><b>'+o.result.icon+' '+o.p.name+'</b><span class="rankBadge">適正度 '+o.suit.rank+' '+o.suit.score+'%</span></div><strong>'+o.result.label+'</strong><small>良い判断でも必ず大成功するとは限りません。</small></div>').join('')+'</div>';
}
function renderResultSection(result){
  const g=goal(); $('resultTitle').textContent=S.year+'年目の結果'; $('surprise').textContent='予想外の出来事：'+result.surprise.text;
  renderExecution(result);
  $('changes').innerHTML = Object.keys(METRICS).map(k=>{ const d=S.v[k]-result.before[k], target=(k==='fatigue'?'≤':'≥')+g.t[k]; return '<div class="change">'+METRICS[k].i+' '+METRICS[k].n+' <b class="'+(d>=0?'up':'down')+'">'+(d>0?'+':'')+d+'</b> → '+S.v[k]+' <span class="targetNote">（目標値: '+target+'）</span></div>'; }).join('');
  $('reasons').innerHTML = result.reasons.map(x=>'・'+x).join('<br>');
  let av=[]; if(S.v.acceptance<45) av.push('最近の施策、誰のためなのか分からないという声が増えている。');
  if(S.v.child>=70) av.push('子育ての選択肢が増えてきたと感じる。'); if(S.v.youth>=68) av.push('若い人が地域に関わる入口が前より見えてきた。');
  if(S.v.equity<40) av.push('中心の地区は便利になったけど、うちの地区は置いていかれてる感じ。'); if(S.v.fatigue>70) av.push('新しいことより、続け方を考えてほしい。');
  if(!av.length) av.push('少しずつ変わっているけど、次はどこに力を入れるか気になる。');
  $('afterVoices').innerHTML = av.slice(0,4).map(x=>'<div class="voice">👤 '+x+'</div>').join('');
  $('result').classList.remove('hidden'); $('result').scrollIntoView({behavior:'smooth',block:'start'});
}
function runYear(){
  const total=totalPlanned(); if(S.resolved || total<2 || total>yearLimit()) return; if(S.year===1 && total!==2) return;
  S.resolved=true; $('runDock').classList.remove('show');
  const result=evaluateYear(); renderTownSnapshot(); renderContinuations(); renderSelectedSummary(); renderMetrics(); renderCompactMetrics(); renderEventVoices(); renderResultSection(result); renderHistory(); updateRunDock();
}
function nextYear(){
  if(S.year>=currentDuration()) return finishGame();
  S.prevConcernMap = Object.fromEntries((S.concerns||[]).map(c=>[c.id,c.pct]));
  S.concernHistory = (S.concernHistory||[]).concat([{year:S.year, trend:S.trend, concerns:S.concerns}]);
  S.year++; S.selected=[]; S.event=null; S.trend=null; S.concerns=null; S.dilemma=null; S.currentBudgetBonus=S.nextBudgetBonus; S.nextBudgetBonus=0; S.resolved=false; S.keep={}; S.active.forEach(id=>S.keep[id]=true);
  $('result').classList.add('hidden'); renderAll(); window.scrollTo({top:0,behavior:'smooth'});
}
function metricProgress(k,target){
  const start=city().start[k], now=S.v[k];
  if(k==='fatigue'){
    if(now<=target) return 1;
    const worst=Math.max(target+1,start+18); return Math.max(0, Math.min(1, 1-(now-target)/(worst-target)));
  }
  if(now>=target) return 1;
  return Math.max(0,Math.min(1,(now-start)/Math.max(1,target-start)));
}
function computeAchievement(){
  const g=goal(); let sum=0, weights=0;
  Object.entries(g.t).forEach(([k,t])=>{ const w=primaryKeys().includes(k)?3:1; sum += metricProgress(k,t)*w; weights += w; });
  let goalPart=(sum/weights)*70;
  const lowKeys=Object.keys(METRICS).filter(k=>k!=='fatigue').sort((a,b)=>S.v[a]-S.v[b]).slice(0,3);
  const lowAvg=lowKeys.reduce((a,k)=>a+S.v[k],0)/3; const balancePart=(lowAvg/100)*15;
  const acceptancePart=Math.min(1,S.v.acceptance/70)*10;
  const fatiguePart=Math.max(0,Math.min(1,(60-S.v.fatigue)/15))*5;
  let score=Math.round(goalPart+balancePart+acceptancePart+fatiguePart + (S.approach==='hybrid'?2:0));
  if(S.v.acceptance<45) score=Math.min(score,72);
  if(primaryKeys().some(k=>S.v[k] < g.t[k]-10)) score=Math.min(score,89);
  if(Object.keys(METRICS).filter(k=>k!=='fatigue').some(k=>S.v[k] < 30)) score=Math.min(score,84);
  if(S.v.fatigue>65) score=Math.min(score,90);
  score=clamp(score,0,100);
  return {score, goalPart:Math.round(goalPart), balancePart:Math.round(balancePart), acceptancePart:Math.round(acceptancePart), fatiguePart:Math.round(fatiguePart)};
}
function finishGame(){
  const {score,goalPart,balancePart,acceptancePart,fatiguePart}=computeAchievement(), g=goal();
  $('play').classList.add('hidden'); $('ending').classList.remove('hidden'); $('fabStack').classList.add('hidden'); $('runDock').classList.remove('show');
  $('endingYearsLabel').textContent=currentDuration(); $('endingTitle').textContent=city().name+'｜'+g.icon+' '+g.name+' × '+APPROACHES[S.approach].name; $('achievement').textContent=score;
  $('endingLabel').textContent = score>=95?'🏆 目標・納得・持続性をかなり両立した':score>=85?'🌟 かなり形になった':score>=72?'🧭 成果と葛藤が見える':score>=60?'🧪 方向は見えたが、トレードオフが重かった':'🔁 もう一度優先順位を組み直したい';
  $('scoreBreakdown').innerHTML='<b>この％の意味：</b>目標への前進度を中心に、弱い分野を放置しなかったか、住民の納得感、担い手疲労を加味して評価しています。<br><span class="small">内訳：目標前進 '+goalPart+'pt / 弱い分野 '+balancePart+'pt / 納得感 '+acceptancePart+'pt / 持続性 '+fatiguePart+'pt</span>';
  const p=townPhrase(S.v), d=S.lastTown||computeTownData(S.v,S.history.length);
  $('finalTown').innerHTML='<div class="townKicker">'+currentDuration()+'年後の町の姿</div><h3>'+p.icon+' 「'+p.text+'」</h3><p>'+p.note+'</p><div class="finalTownMini">人口 '+d.population.toLocaleString()+'人 ／ 社会増減 '+sign(d.socialGain)+'人/年 ／ 町外通勤・通学 '+d.outCommute+'% ／ 町内事業所 '+d.businesses.toLocaleString()+'</div><small>すべてゲーム内の仮想推計です。</small>';
  const start=city().start; const dif=Object.keys(METRICS).filter(k=>k!=='fatigue').map(k=>({k,d:S.v[k]-start[k]})).sort((a,b)=>b.d-a.d);
  $('strengthReport').innerHTML=dif.slice(0,4).map(x=>'<li>'+METRICS[x.k].n+'：'+start[x.k]+' → '+S.v[x.k]+'（'+(x.d>=0?'+':'')+x.d+'）</li>').join('');
  let misses=[]; Object.entries(g.t).forEach(([k,t])=>{ const miss=k==='fatigue'?S.v[k]>t:S.v[k]<t; if(miss) misses.push(METRICS[k].n+'：現在'+S.v[k]+'／目標'+(k==='fatigue'?'≤':'≥')+t); });
  if(S.v.acceptance<55) misses.push('住民の納得感：数字は伸びても、「誰のためだったか」が十分ではありません。');
  if(S.v.fatigue>58) misses.push('担い手のつかれ：成果の一方で、続ける人の余力が減っています。');
  if(!misses.length) misses.push('主要な目標は達成。次は「誰が負担したか」「何が偶然だったか」を考えてみよう。');
  $('challengeReport').innerHTML=misses.slice(0,6).map(x=>'<li>'+x+'</li>').join('');
  $('endingQuestion').innerHTML='<b>最後の問い：</b>'+city().name+'で、あなたは何を続け、何をやめ、何に新しく投資しましたか。住民の声に応えた年、あえて応えなかった年、その選択は誰の納得と、どんな未来につながりましたか。';
  window.scrollTo({top:0,behavior:'smooth'});
}

function getAdvisorHtml(){
  ensureYearContext(); const c=city(); const g=goal();
  const lagging=Object.entries(g.t).filter(([k])=>k!=='fatigue').map(([k,t])=>({k,need:t-S.v[k]})).sort((a,b)=>b.need-a.need).slice(0,3);
  const topConcern=S.concerns?.[0]; const trend=S.trend; const saturated=Object.entries(S.focusStreak).filter(([,v])=>v>=2).sort((a,b)=>b[1]-a[1])[0];
  const routes=[
    {title:'住民の声を取りにいく', body:'今年の関心1位「'+topConcern.name+'」に対応する施策を選ぶ。納得感は取りやすいが、5年後目標の主戦場を外す可能性がある。'},
    {title:'5年後の目標を取りにいく', body:'「'+g.name+'」の中心指標（'+primaryKeys().map(k=>METRICS[k].n).join('・')+'）に効く施策を選ぶ。今年の声とのズレには注意。'},
    {title:'崩れやすい分野を守る', body:'いちばん遅れている「'+METRICS[lagging[0].k].n+'」や、地区バランス・納得感・疲労を見て、町全体の破綻を防ぐ。'}
  ];
  let html='';
  html += '<div class="advisorBlock"><h3>🔎 今年の読みどころ</h3><p>この年の最優先課題候補は <b>'+lagging.map(x=>METRICS[x.k].n).join('、')+'</b>。住民関心1位は <b>'+topConcern.icon+' '+topConcern.name+'</b>。今年の空気は <b>'+trend.icon+' '+trend.name+'</b> です。</p></div>';
  html += '<div class="advisorBlock"><h3>🗣️ 住民の声は何を意味する？</h3><p>「'+topConcern.name+'」への関心が高いのは、単に人気だからではなく、いまの'+c.name+'で <b>'+METRICS[topConcern.metric].n+'</b> が足りていないからかもしれません。ただし、今年の声に応えることと、5年後の目標へ最短で近づくことは同じではありません。</p></div>';
  if(saturated){ html += '<div class="advisorBlock"><h3>⚠️ 続けすぎのサイン</h3><p><b>'+METRICS[saturated[0]].n+'</b> へ'+(saturated[1]+1)+'年連続で寄せています。今後も同じ分野へ投資する場合、効果は逓減し、他の住民層から反発が出やすくなります。</p></div>'; }
  html += '<div class="advisorBlock"><h3>🧭 今年あり得る3つの進め方</h3><div class="routeList">'+routes.map(r=>'<div class="route"><b>'+r.title+'</b><small>'+r.body+'</small></div>').join('')+'</div></div>';
  const candidates = POLICIES.map(p=>({p,s:getSuitability(p)})).sort((a,b)=>b.s.score-a.s.score).slice(0,4);
  html += '<div class="advisorBlock"><h3>🧩 今年の候補になりそうな施策</h3><p>'+candidates.map(x=>x.p.icon+' '+x.p.name+'（'+x.s.rank+' '+x.s.score+'%）').join(' ／ ')+'</p><div class="small">ただし、適正度が高い施策が、あなたの価値観や目標にとって常に最善とは限りません。</div></div>';
  return html;
}

function renderAll(){
  ensureYearContext();
  $('cityPill').textContent='🏘️ '+city().name; $('approachPill').textContent=APPROACHES[S.approach].icon+' '+APPROACHES[S.approach].name; $('goalPill').textContent=goal().icon+' '+goal().name; $('durationPill').textContent='⏳ '+currentDuration()+'年';
  $('year').textContent=S.year; $('durationLabelTop').textContent=currentDuration(); $('milestone').textContent=milestoneText();
  renderTownSnapshot(); renderContinuations(); renderConcerns(); renderDilemma(); renderEventVoices(); renderSelectedSummary(); renderMetrics(); renderCompactMetrics(); renderPolicies(); renderHistory(); updateRunDock();
}
function startGame(){ createState(); $('setup').classList.add('hidden'); $('ending').classList.add('hidden'); $('play').classList.remove('hidden'); $('fabStack').classList.remove('hidden'); openMayor(false); renderAll(); window.scrollTo({top:0,behavior:'smooth'}); }
function resetGame(){ $('play').classList.add('hidden'); $('ending').classList.add('hidden'); $('setup').classList.remove('hidden'); $('fabStack').classList.add('hidden'); $('runDock').classList.remove('show'); renderSetup(); window.scrollTo({top:0,behavior:'smooth'}); }

$('startBtn').onclick=startGame; $('resetTop').onclick=resetGame; $('restart').onclick=resetGame; $('dockRun').onclick=runYear; $('nextYear').onclick=nextYear; $('previewMayorBtn').onclick=()=>openMayor(true);
$('mayorFab').onclick=()=>openMayor(true); $('mayorClose').onclick=closeMayor; $('mayorOverlay').onclick=e=>{ if(e.target===$('mayorOverlay')) closeMayor(); };
$('advisorFab').onclick=()=>{ $('advisorBody').innerHTML=getAdvisorHtml(); $('advisorOverlay').classList.remove('hidden'); $('advisorOverlay').setAttribute('aria-hidden','false'); };
$('advisorClose').onclick=()=>{ $('advisorOverlay').classList.add('hidden'); $('advisorOverlay').setAttribute('aria-hidden','true'); };
$('advisorOverlay').onclick=e=>{ if(e.target===$('advisorOverlay')) $('advisorClose').click(); };

document.addEventListener('keydown',e=>{ if(e.key==='Escape'){ closeMayor(); $('advisorClose').click(); } });
renderSetup();
