function renderConcerns(){ ensureYearContext(); $('concernGrid').innerHTML = S.concerns.map((c,i)=>'<div class="concernCard"><div class="small">'+(i===0?'関心1位':i===1?'関心2位':'関心3位')+'</div><strong>'+c.icon+' '+c.name+'</strong><div class="concernPct">'+c.pct+'%</div><div class="small">'+c.voice+'</div></div>').join(''); }
function renderDilemma(){
  const h=$('dilemmaCard'); h.innerHTML='<div class="smallLabel">今年の論点</div><h2>⚖️ 今年、どこに軸を置く？</h2><div class="small">施策を選ぶ前に、その年の優先の仕方を決めます。正解はありません。どの選択にもメリットとトレードオフがあります。</div><div id="dilemmaGrid" class="dilemmaGrid" style="margin-top:10px"></div>';
  const grid=$('dilemmaGrid');
  DILEMMAS.forEach(d=>{
    const div=document.createElement('div'); div.className='dilemmaOption'+(S.dilemma===d.id?' active':'');
    div.innerHTML='<b>'+d.title+'</b><span class="small">'+d.desc+'</span><em>'+d.hint+'</em><div class="trade">'+d.trade+'</div>';
    div.onclick=()=>{grid.querySelectorAll('.dilemmaOption').forEach(x=>x.classList.remove('active'));div.classList.add('active');S.dilemma=d.id; renderAll();};
    grid.appendChild(div);
  });
}
function computePlanPreview(ids){
  const before={...S.v}; let delta={};
  Object.entries(S.event?.e||{}).forEach(([k,v])=> delta[k]=(delta[k]||0)+v);
  if(S.dilemma==='balance'){ delta.equity=(delta.equity||0)+2; delta.connection=(delta.connection||0)+1; delta.fatigue=(delta.fatigue||0)+1; }
  if(S.dilemma==='futureFirst'){ delta.acceptance=(delta.acceptance||0)-2; }
  if(S.dilemma==='residentFirst'){ delta.acceptance=(delta.acceptance||0)+1; }
  const focus = new Set();
  continuedIds().forEach(id=>{
    const p=policyById(id); p.focus.forEach(k=>focus.add(k));
    Object.entries(p.e).forEach(([k,v])=>{ const amt = (k==='fatigue'||k==='acceptance')? Math.round(v*.25) : Math.round(v*.25*localFit(p).m); delta[k]=(delta[k]||0)+amt; });
  });
  (S.selected||[]).forEach(id=>{
    const p=policyById(id),fit=localFit(p); p.focus.forEach(k=>focus.add(k));
    Object.entries(p.e).forEach(([k,v])=>{ const amt=(k==='fatigue'||k==='acceptance')?v:Math.round(v*fit.m*.9); delta[k]=(delta[k]||0)+amt; });
  });
  if(S.concerns?.[0]){ const met=ids.some(id=>concernMatch(policyById(id),S.concerns[0])); delta.acceptance=(delta.acceptance||0)+(met?4:-5); if(S.concerns[0].metric) delta[S.concerns[0].metric]=(delta[S.concerns[0].metric]||0)+(met?1:-2); }
  if(S.concerns?.[1]){ const met=ids.some(id=>concernMatch(policyById(id),S.concerns[1])); delta.acceptance=(delta.acceptance||0)+(met?2:0); }
  COMBOS.forEach(c=>{ if(c.ids.every(id=>ids.includes(id))) Object.entries(c.e).forEach(([k,v])=>delta[k]=(delta[k]||0)+v); });
  const base={youth:1,child:2,senior:1,stay:2,industry:1,tourism:1,equity:2,connection:1};
  Object.keys(base).forEach(k=>{ if(focus.has(k)) return; const streak=(S.neglect[k]||0)+1; const loss=base[k]+Math.max(0,streak-1); delta[k]=(delta[k]||0)-loss; });
  const counts={child:0,youth:0,senior:0,industry:0,tourism:0}; ids.forEach(id=> (policyById(id)?.focus||[]).forEach(k=>{ if(counts[k]!=null) counts[k]++; }));
  if(counts.child>=2 && (S.focusStreak.child||0)>=1){ delta.acceptance=(delta.acceptance||0)-4; delta.senior=(delta.senior||0)-1; }
  if(counts.senior>=2 && (S.focusStreak.senior||0)>=1){ delta.acceptance=(delta.acceptance||0)-4; delta.youth=(delta.youth||0)-1; }
  if(counts.tourism>=2){ delta.acceptance=(delta.acceptance||0)-2; delta.fatigue=(delta.fatigue||0)+2; }
  const out={}; Object.keys(METRICS).forEach(k=> out[k]=clamp(before[k]+(delta[k]||0))); return out;
}
function renderMetrics(){
  const g=goal(), ids=allPlannedIds(), preview=computePlanPreview(ids), h=$('metricGrid'); h.innerHTML='';
  Object.entries(METRICS).forEach(([k,m])=>{
    const now=S.v[k], to=preview[k], target=g.t[k]; const ok=(k==='fatigue'?now<=target:now>=target);
    const div=document.createElement('div'); div.className='metric'+(k==='fatigue'?' fatigue':'');
    div.innerHTML='<div class="head"><span>'+m.i+' '+m.n+'</span><span>'+now+' → '+to+'</span></div><div class="value">'+to+'</div><div class="barWrap"><div class="bar"><span style="width:'+to+'%"></span></div><div class="currentLine" style="left:calc('+now+'% - 1px)"></div></div><div class="goalStatus '+(ok?'good':'')+'">目標 '+(k==='fatigue'?'≤':'≥')+target+(ok?' ✓':'')+'</div>';
    h.appendChild(div);
  });
}
function renderTownSnapshot(){
  const yearDone=S.history.length; const d=computeTownData(S.v,yearDone), p=townPhrase(S.v);
  S.lastTown=d;
  $('townSnapshot').innerHTML='<div class="townHead"><div><div class="townKicker">'+(yearDone===0?'出発点データ':'ゲーム内推計・'+yearDone+'年経過')+'</div><h2>'+p.icon+' 「'+p.text+'」</h2><p>'+p.note+'</p></div><span class="fictionBadge">'+(yearDone===0?'初期値':'仮想データ')+'</span></div><div class="townDataGrid" style="margin-top:10px">'+
    stat('人口',d.population.toLocaleString()+'人',yearDone===0?'2025年1月1日':'ゲーム内推計')+
    stat('0〜14歳',d.childShare+'%',yearDone===0?'2025年1月1日':'ゲーム内推計')+
    stat('社会増減',sign(d.socialGain)+'人/年',yearDone===0?'ゲーム初期モデル':'ゲーム内推計')+
    stat('町外通勤・通学',d.outCommute+'%',yearDone===0?'ゲーム初期モデル':'ゲーム内推計')+
    stat('町内事業所',d.businesses.toLocaleString(),yearDone===0?'ゲーム初期モデル':'ゲーム内推計')+
    stat('町内従業者',d.employees.toLocaleString()+'人',yearDone===0?'ゲーム初期モデル':'ゲーム内推計')+
  '</div><div class="townDisclaimer">人口と0〜14歳割合は2025年1月1日の住民基本台帳ベース。その他の初期指標と、2年目以降の数値は教育用ゲームの仮想モデルです。</div>';
}
function computeTownData(v,yearDone){
  const b=city().baseStats, s=city().start;
  const pop=Math.round(b.population + yearDone*22 + (v.child-s.child)*10 + (v.stay-s.stay)*8 + (v.acceptance-s.acceptance)*3 - Math.max(0,v.fatigue-60)*2);
  const childShare=Math.max(14,Math.min(24, +(b.childShare + (v.child-s.child)*0.03 + (v.acceptance-s.acceptance)*0.01 - yearDone*0.02).toFixed(1)));
  const social=Math.round(Math.max(-300,Math.min(900, b.socialGain + (v.acceptance-s.acceptance)*5 + (v.child-s.child)*2 + (v.industry-s.industry)*2 - Math.max(0,v.fatigue-55)*2)));
  const out=Math.max(38,Math.min(80, +(b.outCommute - (v.stay-s.stay)*0.30 - (v.industry-s.industry)*0.10 + (v.fatigue>70?1.1:0)).toFixed(1)));
  const biz=Math.round(Math.max(Math.round(b.businesses*0.85), b.businesses + (v.industry-s.industry)*4.5 + (v.tourism-s.tourism)*1.4 - Math.max(0,v.fatigue-65)*1.3));
  const emp=Math.round(Math.max(Math.round(b.employees*0.88), b.employees + (v.industry-s.industry)*42 + (v.stay-s.stay)*28 + (v.tourism-s.tourism)*10));
  return {population:pop,childShare,socialGain:social,outCommute:out,businesses:biz,employees:emp};
}
function townPhrase(v){
  if(v.fatigue>=75) return {icon:'🪫',text:'動いている。でも担い手が疲れているまち',note:'成果の裏で、続ける人の余力が減っています。'};
  if(v.acceptance<45) return {icon:'🗯️',text:'成果はあるけれど、納得が揺れるまち',note:'数字よりも「誰のための施策か」が問われています。'};
  if(v.equity<40) return {icon:'🗺️',text:'中心だけが先に進みつつあるまち',note:'地区による参加しやすさの差が大きくなっています。'};
  if(v.child>=78 && v.acceptance>=60) return {icon:'👶',text:'子育て世代にやさしいまち',note:'子育て環境への手応えが、町全体の納得にもつながっています。'};
  if(v.youth>=75 && v.industry>=66) return {icon:'🌱',text:'若者が地域で挑戦し始めたまち',note:'若者の参加と地域の仕事が結びつき始めています。'};
  if(v.senior>=75 && v.connection>=68) return {icon:'🧓',text:'世代を越えて支え合うまち',note:'高齢者の役割と地域のつながりが同時に育っています。'};
  if(v.industry>=78 && v.stay>=60) return {icon:'🏭',text:'地域で働く力が育ったまち',note:'町内で働く・過ごす選択肢が増えています。'};
  if(v.tourism>=75 && v.equity>=55) return {icon:'🏝️',text:'にぎわいと暮らしを両立し始めたまち',note:'外から人を呼ぶ力と地域の公平さを両立しつつあります。'};
  if(v.connection>=70) return {icon:'🤝',text:'つながりが生まれ始めたまち',note:'人と人が接点を持てる土台が育ってきました。'};
  const gains=['child','youth','senior','industry','tourism','connection','stay','equity'].map(k=>[k,v[k]-city().start[k]]).sort((a,b)=>b[1]-a[1]);
  const k=gains[0][0], names={child:'子育ての選択肢が増え始めたまち',youth:'若者の声が見え始めたまち',senior:'高齢者の役割が生まれ始めたまち',industry:'地域の仕事が動き始めたまち',tourism:'外との交流が生まれ始めたまち',connection:'つながりが生まれ始めたまち',stay:'町で過ごす理由が増え始めたまち',equity:'地区を越えて届き始めたまち'};
  return {icon:'🌿',text:names[k],note:'まだ完成形ではありません。これまでの選択が町の方向をつくり始めています。'};
}

function renderContinuations(){
  const card=$('continuationCard'), box=$('continuationList');
  if(!S.active.length){ card.classList.add('hidden'); return; }
  card.classList.remove('hidden');
  box.innerHTML = S.active.map(id=>{
    const p=policyById(id), keep=S.keep[id]!==false;
    return '<div class="policy" style="cursor:default;margin-top:8px"><h3>'+p.icon+' '+p.name+'</h3><div class="small">維持費 '+p.upkeep+'pt / 年 ・ 継続効果は初年度の約25%</div><div style="display:flex;gap:8px;margin-top:10px"><button class="btn ghost" data-id="'+id+'" data-keep="1" style="padding:10px 12px">続ける</button><button class="btn secondary" data-id="'+id+'" data-keep="0" style="padding:10px 12px">やめる</button></div></div>';
  }).join('');
  [...box.querySelectorAll('button')].forEach(b=>b.onclick=()=>{ S.keep[b.dataset.id]=b.dataset.keep==='1'; trimSelections(); renderAll(); });
}
function trimSelections(){ while(S.selected.length && (selectedCost()>availableBudget() || totalPlanned()>yearLimit())) S.selected.pop(); }
function renderEventVoices(){
  $('yearEvent').textContent = S.event.text;
  let arr=S.event.voices.slice();
  if(S.v.stay<42) arr.push('町に住んでいても、平日はほとんど町外にいるよ。');
  if(S.v.equity<42) arr.push('地区によって参加しやすさが違う気がする。');
  if(S.v.fatigue>62) arr.push('活動は増えたけど、準備する人がもう限界かも。');
  $('voices').innerHTML = arr.slice(0,4).map((x,i)=>'<div class="voice"><b>'+(i%2?'👩 住民':'🧑 住民')+'</b><br>'+x+'</div>').join('');
}
function renderSelectedSummary(){
  const arr=S.selected.map(policyById), spent=selectedCost(), remain=Math.max(0, availableBudget()-spent), cont=continuedIds().length, total=totalPlanned(), limit=yearLimit(), left=slotsLeft();
  $('budget').textContent = remain;
  $('upkeepBox').innerHTML = '<b>今年の施策枠 '+total+'/'+limit+'（継続 '+cont+'／新規 '+arr.length+'）</b><br><span class="small">'+(S.year===1?'初年度は新規施策を最大2つまで。':'2年目以降は継続を含めて最大3つ。')+' 継続費 '+upkeep()+'pt。</span>';
  $('selectedSummary').innerHTML = arr.length ? '<b>新しく選択：</b>'+arr.map(p=>p.icon+p.name).join(' ＋ ')+'<br><span class="small">新規費 '+spent+'pt／残り '+remain+'pt／あと'+left+'枠</span>' : '<b>新規施策はまだありません。</b><br><span class="small">継続を含めて今年は'+total+'/'+limit+'枠を使用中です。</span>';
  const topConcern=S.concerns?.[0]?.name||'—';
  let msg='今年の住民関心1位は「'+topConcern+'」。';
  if(!S.dilemma) msg += ' まず今年の論点を決めてから施策を選びましょう。';
  else if(total===0) msg += ' 今年の論点は「'+DILEMMAS.find(d=>d.id===S.dilemma).title+'」。この年にあえて何を後回しにするかも考えどころです。';
  else msg += ' いまの選択は「'+DILEMMAS.find(d=>d.id===S.dilemma).title+'」寄り。選んだ施策で、何を優先し何を後回しにするかを見直してみましょう。';
  $('planPreview').innerHTML = msg;
}
function renderPolicies(){
  const h=$('policyGrid'), limit=yearLimit(); h.innerHTML='';
  $('policyLockNote').style.display = S.dilemma ? 'none':'block';
  POLICIES.forEach(p=>{
    const active=continuedIds().includes(p.id), sel=S.selected.includes(p.id), full=totalPlanned()>=limit && !sel && !active, suit=getSuitability(p);
    const tags = Object.entries(p.e).map(([k,v])=>'<span class="tag '+(v>=0?'plus':'minus')+'">'+METRICS[k].n+' '+(v>0?'+':'')+v+'</span>').join('');
    const status = active ? '<span class="rankBadge">継続中</span>' : full ? '<span class="rankBadge">今年の枠が埋まっています</span>' : '<span class="rankBadge">適正度 '+suit.rank+'・'+suit.score+'%</span>';
    const div=document.createElement('div');
    div.className='policy'+(sel?' selected':'')+(active?' activePolicy':'')+(full?' slotFull':'');
    div.innerHTML = '<span class="cost">'+p.cost+'pt</span>'+(p.upkeep?'<span class="upkeep">維持費 '+p.upkeep+'pt</span>':'')+'<h3>'+p.icon+' '+p.name+'</h3><div class="small">'+p.desc+'</div><div class="tags">'+tags+'</div><div class="fitBox"><div class="fitRank"><b>'+status+'</b><span class="small">期待薄 '+suit.probs[0]+'% / 成功 '+suit.probs[1]+'% / 大成功 '+suit.probs[2]+'%</span></div><div class="fitReasons">'+(suit.why.length?suit.why.map(x=>'<span class="tag">'+x+'</span>').join(''):'<span class="tag">固有補正なし</span>')+'</div></div>';
    if(!active && !full && S.dilemma){ div.onclick=()=>togglePolicy(p.id); }
    h.appendChild(div);
  });
}
function togglePolicy(id){
  const p=policyById(id), i=S.selected.indexOf(id);
  if(i>=0) S.selected.splice(i,1);
  else {
    if(totalPlanned()>=yearLimit()) return;
    if(selectedCost()+p.cost>availableBudget()) return alert('今年の予算が足りません。継続事業をやめると予算が戻る場合があります。');
    S.selected.push(id);
  }
  renderAll();
}
function updateRunDock(){
  const dock=$('runDock');
  const total=totalPlanned(), limit=yearLimit(), cont=continuedIds().length, nw=S.selected.length;
  const ready=S.year===1 ? total===2 : (total>=2 && total<=limit);
  if(ready && !S.resolved){
    dock.classList.add('show');
    $('dockTitle').textContent = '今年の施策 '+total+'/'+limit;
    $('dockSummary').textContent = (cont?'継続'+cont+' ＋ ':'') + (nw?'新規'+nw:'新規0') + (slotsLeft()?'　あと'+slotsLeft()+'つ追加できます':'　枠をすべて使用');
    $('dockRun').textContent = 'この'+total+'施策で1年進める →';
    $('fabStack').classList.add('raised');
  }else{
    dock.classList.remove('show');
    $('fabStack').classList.remove('raised');
  }
}
function renderHistory(){
  const keys=['connection','youth','child','senior','stay','industry','tourism','equity','acceptance','fatigue'];
  $('history').innerHTML = S.history.length ? S.history.map(h=>'<tr><td>'+h.year+'</td><td>'+h.names.join(' / ')+'</td>'+keys.map(k=>'<td>'+h.v[k]+'</td>').join('')+'</tr>').join('') : '<tr><td colspan="12">まだ記録はありません</td></tr>';
}
