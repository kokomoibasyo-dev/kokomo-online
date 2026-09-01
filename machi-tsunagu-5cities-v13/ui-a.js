function renderConcerns(){
  ensureYearContext();
  const prev=S.prevConcernMap||{};
  const hasPrev=Object.keys(prev).length>0;
  const t=S.trend;
  $('trendBox').innerHTML = '<div class="speech"><b>'+t.icon+' 今年の空気：'+t.name+'</b><br>'+t.text+'<div class="small" style="margin-top:6px">今年の強さ：'+t.strength+'。この傾向に合う施策は、納得感や手応えが出やすくなります。</div></div>';
  $('concernGrid').innerHTML = S.concerns.map((c,i)=>{
    let deltaHtml='<span class="trendDelta neutral">今年の注目</span>';
    if(hasPrev){
      if(prev[c.id]==null) deltaHtml='<span class="trendDelta up">NEW</span>';
      else {
        const d=c.pct-prev[c.id];
        deltaHtml='<span class="trendDelta '+(d>0?'up':d<0?'down':'neutral')+'">'+(d>0?'↑'+d:d<0?'↓'+Math.abs(d):'→0')+'pt</span>';
      }
    }
    return '<div class="concernCard"><div class="concernTop"><div class="small">'+(i===0?'関心1位':i===1?'関心2位':'関心3位')+'</div>'+deltaHtml+'</div><strong>'+c.icon+' '+c.name+'</strong><div class="concernPct">'+c.pct+'%</div><div class="small">'+c.voice+'</div></div>';
  }).join('');
}
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
