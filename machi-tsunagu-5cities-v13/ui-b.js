function renderContinuations(){
  const card=$('continuationCard'), box=$('continuationList');
  if(!S.active.length){ card.classList.add('hidden'); return; }
  card.classList.remove('hidden');
  box.innerHTML = S.active.map(id=>{
    const p=policyById(id), keep=S.keep[id]!==false;
    return '<div class="policy" style="cursor:default;margin-top:8px"><h3>'+p.icon+' '+p.name+'</h3><div class="small">維持費 '+p.upkeep+'pt / 年 ・ 継続効果は初年度の約25%</div><div class="contChoiceRow"><button class="contChoice keep'+(keep?' activeChoice':'')+'" data-id="'+id+'" data-keep="1">続ける</button><button class="contChoice stop'+(!keep?' activeChoice':'')+'" data-id="'+id+'" data-keep="0">やめる</button></div></div>';
  }).join('');
  [...box.querySelectorAll('.contChoice')].forEach(b=>b.onclick=()=>{ S.keep[b.dataset.id]=b.dataset.keep==='1'; trimSelections(); renderAll(); });
}

function renderCompactMetrics(){
  const g=goal(), ids=allPlannedIds(), preview=computePlanPreview(ids), h=$('compactMetricsInner');
  if(!h) return;
  h.innerHTML='';
  Object.entries(METRICS).forEach(([k,m])=>{
    const now=S.v[k], to=preview[k], target=g.t[k], delta=to-now;
    const div=document.createElement('div');
    div.className='compactMetric'+(k==='fatigue'?' fatigue':'');
    div.title=m.n+'｜いま '+now+' → 予測 '+to+'｜目標 '+(k==='fatigue'?'≤':'≥')+target;
    div.innerHTML='<div class="compactMetricTop"><span class="compactIcon">'+m.i+'</span><span class="compactDelta '+(delta>=0?'up':'down')+'">'+(delta>0?'+':'')+delta+'</span></div><div class="compactBarWrap"><div class="compactBar"><span style="width:'+to+'%"></span></div><div class="compactCurrent" style="left:calc('+now+'% - 1px)"></div><div class="compactTarget" style="left:calc('+target+'% - 1px)"></div></div>';
    h.appendChild(div);
  });
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
