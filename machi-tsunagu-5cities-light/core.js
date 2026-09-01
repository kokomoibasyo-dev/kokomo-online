function city(){ return MUNICIPALITIES[S.city]; }
function goal(){ return GOALS[S.goal||'youth']; }
function yearLimit(){ return S.year===1 ? 2 : 3; }
function continuedIds(){ return (S.active||[]).filter(id => S.keep[id] !== false); }
function allPlannedIds(){ return continuedIds().concat(S.selected||[]); }
function upkeep(){ return continuedIds().reduce((a,id)=>a+(POLICIES.find(p=>p.id===id)?.upkeep||0),0); }
function availableBudget(){ return 72 + (S.currentBudgetBonus||0) - upkeep(); }
function selectedCost(){ return (S.selected||[]).reduce((a,id)=>a+(POLICIES.find(p=>p.id===id)?.cost||0),0); }
function totalPlanned(){ return continuedIds().length + (S.selected||[]).length; }
function slotsLeft(){ return Math.max(0, yearLimit() - totalPlanned()); }
function currentDuration(){ return S.duration||5; }
function primaryKeys(){ return PRIMARY[S.goal]||[]; }
function policyById(id){ return POLICIES.find(p=>p.id===id); }
function focusList(ids){ const set=new Set(); ids.forEach(id=> (policyById(id)?.focus||[]).forEach(k=>set.add(k))); return set; }
function concernMatch(p,c){ return c.matchIds.includes(p.id) || c.matchTags.some(t => (p.tags||[]).includes(t)); }
function stat(name,val,sub){ return '<div class="townStat"><span>'+name+'</span><b>'+val+'</b><small>'+sub+'</small></div>'; }

function renderSetupCities(){
  $('cityGrid').innerHTML = Object.entries(MUNICIPALITIES).map(([id,c])=>{
    const active = (S.city||'haebaru')===id ? ' active' : '';
    const img = c.gender==='female' ? 'mayor_icon_female.jpg' : 'mayor_icon_male.jpg';
    return '<div class="cityCard'+active+'" data-city="'+id+'">'+
      '<div class="cityHead"><img src="'+img+'" alt="首長" style="width:54px;height:54px;border-radius:16px;object-fit:cover;background:#f6dfbc;border:1px solid #e6d9bd"><div><div class="cityBadge">'+c.region+'</div><h3>'+c.name+'</h3></div></div>'+
      '<div class="small"><b>'+c.header+'</b><br>'+c.subtitle+'</div>'+
      '<div class="cityMeta"><span>初期若者 '+c.start.youth+'</span><span>初期子ども '+c.start.child+'</span><span>初期産業 '+c.start.industry+'</span></div>'+
      '</div>';
  }).join('');
  [...document.querySelectorAll('.cityCard')].forEach(el=>el.onclick=()=>{S.city=el.dataset.city; renderSetup(); openMayor(true);});
}
function renderSetupFacts(){
  const c=city();
  $('cityPreview').classList.remove('hidden');
  $('cityPreview').innerHTML = '<b>'+c.name+'の見立て</b><br>'+c.subtitle;
  $('previewMayorBtn').classList.remove('hidden');
  $('setupFacts').innerHTML = c.facts.map(f=>'<div class="fact"><span class="small">'+f[0]+'</span><b>'+f[1]+'</b><span class="src">'+f[2]+'</span></div>').join('');
}
function renderChoiceGrid(id,obj,currentKey){
  const h=$(id); h.innerHTML='';
  Object.entries(obj).forEach(([k,v],i)=>{
    const active=(S[currentKey] ? S[currentKey]===k : i===0)||(!S[currentKey]&&i===0); if(!S[currentKey]&&i===0) S[currentKey]=k;
    const div=document.createElement('div'); div.className='choice'+(active?' active':''); div.dataset.k=k;
    div.innerHTML='<b>'+v.icon+' '+v.name+'</b><span class="small">'+(v.desc||'')+'</span>'+(v.bonus?'<div class="speech" style="margin-top:8px;padding:8px;font-size:11px">'+v.bonus+'</div>':'');
    div.onclick=()=>{h.querySelectorAll('.choice').forEach(x=>x.classList.remove('active'));div.classList.add('active');S[currentKey]=k;};
    h.appendChild(div);
  });
}
function renderDuration(){
  const h=$('durationGrid'); h.innerHTML=''; if(!S.duration) S.duration=5;
  DURATIONS.forEach(d=>{
    const map={5:'短期決戦',7:'中期',10:'長期'};
    const div=document.createElement('div'); div.className='choice'+(S.duration===d?' active':'');
    div.innerHTML='<b>⏳ '+d+'年</b><span class="small">'+map[d]+'。'+(d===5?'重点を絞る。':d===7?'成果と継続の両方を見る。':'飽和・反発・担い手疲労まで向き合う。')+'</span>';
    div.onclick=()=>{h.querySelectorAll('.choice').forEach(x=>x.classList.remove('active'));div.classList.add('active');S.duration=d;};
    h.appendChild(div);
  });
}
function renderSetup(){ renderSetupCities(); renderSetupFacts(); renderChoiceGrid('approachGrid',APPROACHES,'approach'); renderChoiceGrid('goalGrid',GOALS,'goal'); renderDuration(); }

function openMayor(force){
  const c=city();
  $('mayorTitle').textContent = c.name+'の首長の声';
  $('mayorSpeech').innerHTML = '<b>「'+c.header+'」</b><br>'+c.voice+'<div style="margin-top:8px"><b>ひとことで言うと：</b> '+c.subtitle+'</div>';
  $('mayorStrengths').innerHTML = c.strengths.map(x=>'<li>'+x+'</li>').join('');
  $('mayorChallenges').innerHTML = c.challenges.map(x=>'<li>'+x+'</li>').join('');
  const iconSrc = c.gender==='female' ? 'mayor_icon_female.jpg' : 'mayor_icon_male.jpg';
  const popSrc = c.gender==='female' ? 'mayor_popup_female_small.jpg' : 'mayor_popup_male_small.jpg';
  $('mayorFabIcon').src = iconSrc; $('mayorPortrait').src = popSrc;
  if(force){ $('mayorOverlay').classList.remove('hidden'); $('mayorOverlay').setAttribute('aria-hidden','false'); }
}
function closeMayor(){ $('mayorOverlay').classList.add('hidden'); $('mayorOverlay').setAttribute('aria-hidden','true'); }

function createState(){
  const c=city();
  S={
    city:S.city||'haebaru', approach:S.approach||'hybrid', goal:S.goal||'youth', duration:S.duration||5,
    year:1, v:{...c.start}, selected:[], active:[], keep:{}, history:[], event:null, concerns:null, dilemma:null,
    focusStreak:{}, neglect:{}, resolved:false, currentBudgetBonus:0, nextBudgetBonus:0, lastTown:computeTownData({...c.start},0), autoShownMayor:true
  };
}

function milestoneText(){
  const left=currentDuration()-S.year;
  if(S.year===1) return '🌱 1年目：最初の年は、新しく始められる施策は2つまで。';
  if(S.year===Math.ceil(currentDuration()/2)) return '🏁 '+S.year+'年目：折り返し。これまでの偏りが、次の住民関心に影響し始めます。';
  if(left===0) return '🏆 最終年：目標・世論・持続性をどう両立する？';
  if(left<=2) return '⏳ あと'+left+'年。伸ばしたい指標だけでなく、疲れや反発にも注意。';
  return '📅 あと'+left+'年。今年の「まちの空気」は昨年と同じとは限りません。';
}

function generateConcerns(){
  const c=city();
  let arr=CONCERNS.map(con=>{
    let score=26+Math.random()*16 + (65-(S.v[con.metric]||50))*0.56 + (S.neglect[con.metric]||0)*6;
    if(con.id==='childcare' && c.traits.child>1.1) score+=6;
    if(con.id==='youth' && c.traits.youth>1.1) score+=6;
    if(con.id==='tourism' && c.traits.tourism>1.12) score+=8;
    if(con.id==='district' && c.traits.distributed>1.1) score+=8;
    if(con.id==='jobs' && c.traits.jobs>1.08) score+=6;
    const ev = (S.event?.text)||'';
    if(con.id==='jobs' && /仕事|店/.test(ev)) score+=16;
    if(con.id==='district' && /中心部|周辺部|距離/.test(ev)) score+=16;
    if(con.id==='youth' && /時間|若者/.test(ev)) score+=12;
    if(con.id==='childcare' && /子育て|遊び場/.test(ev)) score+=16;
    if(con.id==='senior' && /高齢者/.test(ev)) score+=16;
    if(con.id==='belonging' && /転入/.test(ev)) score+=12;
    return {...con,score};
  });
  if((S.focusStreak.child||0)>=2) arr.forEach(x=>{ if(['senior','belonging','jobs'].includes(x.id)) x.score += 12; });
  if((S.focusStreak.senior||0)>=2) arr.forEach(x=>{ if(['childcare','youth','jobs'].includes(x.id)) x.score += 10; });
  if((S.focusStreak.industry||0)>=2) arr.forEach(x=>{ if(['childcare','senior','district'].includes(x.id)) x.score += 9; });
  if((S.focusStreak.tourism||0)>=2) arr.forEach(x=>{ if(['district','belonging','childcare'].includes(x.id)) x.score += 10; });
  arr.sort((a,b)=>b.score-a.score);
  const top=arr.slice(0,3), sum=top.reduce((a,b)=>a+b.score,0);
  top.forEach(x=>x.pct=Math.round(x.score/sum*100));
  const diff=100-top.reduce((a,b)=>a+b.pct,0); if(top[0]) top[0].pct += diff;
  return top;
}
function ensureYearContext(){ if(!S.event) S.event=pick(EVENTS); if(!S.concerns) S.concerns=generateConcerns(); }

function approachBonus(p){
  let m=1,w=[];
  if(S.approach==='repair' && (p.tags.includes('repair')||p.tags.includes('jobs')||p.tags.includes('distributed')||p.tags.includes('flexible'))){m*=1.12;w.push('課題解決方針 +12%');}
  if(S.approach==='strength' && (p.tags.includes('strength')||p.tags.includes('business')||p.tags.includes('welfare')||p.tags.includes('child')||p.tags.includes('tourism'))){m*=1.12;w.push('強み活用方針 +12%');}
  return {m,w};
}
function dilemmaBonus(p){
  if(!S.dilemma) return {m:1,w:[]};
  let m=1,w=[];
  if(S.dilemma==='residentFirst' && S.concerns?.[0] && concernMatch(p,S.concerns[0])){m*=1.12;w.push('今年の声を優先 +12%');}
  if(S.dilemma==='balance' && (p.tags.includes('distributed')||p.id==='coordinator'||p.id==='multiGen'||p.id==='welcome')){m*=1.10;w.push('複数の立場をつなぐ +10%');}
  if(S.dilemma==='futureFirst' && p.focus.some(k=>primaryKeys().includes(k))){m*=1.14;w.push('5年後目標を優先 +14%');}
  return {m,w};
}
function concernBonus(p){
  if(!S.concerns) return {m:1,w:[]};
  let m=1,w=[];
  S.concerns.slice(0,3).forEach((c,i)=>{
    if(concernMatch(p,c)){ const b=[.20,.10,.05][i]; m*=1+b; w.push('住民関心「'+c.name+'」 +'+Math.round(b*100)+'%'); }
  });
  return {m,w};
}
function diminishBonus(p){
  let streak=0; p.focus.forEach(k=> streak=Math.max(streak,S.focusStreak[k]||0));
  const f = streak===0 ? 1 : streak===1 ? .82 : streak===2 ? .65 : streak===3 ? .50 : .40;
  return {m:f,w:streak?['同分野への連続投資 '+(streak+1)+'年目 → ×'+f.toFixed(2)]:[]};
}
function localFit(p){
  const t=city().traits; let m=1,w=[];
  if(p.tags.includes('child') && t.child){ m*=t.child; w.push('子ども施策と相性 +' + Math.round((t.child-1)*100) + '%'); }
  if(p.tags.includes('daytime') && t.daytime){ m*=t.daytime; w.push('平日日中の届きにくさ ' + Math.round((t.daytime-1)*100) + '%'); }
  if(p.tags.includes('flexible') && t.flexible){ m*=t.flexible; w.push('夜・柔軟型と相性 +' + Math.round((t.flexible-1)*100) + '%'); }
  if(p.tags.includes('jobs') && t.jobs){ m*=t.jobs; w.push('仕事づくりとの相性 +' + Math.round((t.jobs-1)*100) + '%'); }
  if(p.tags.includes('business') && t.business){ m*=t.business; w.push('地域企業との連携 +' + Math.round((t.business-1)*100) + '%'); }
  if(p.tags.includes('welfare') && t.welfare){ m*=t.welfare; w.push('福祉資源との連携 +' + Math.round((t.welfare-1)*100) + '%'); }
  if(p.tags.includes('distributed') && t.distributed){ m*=t.distributed; w.push('分散型施策と相性 +' + Math.round((t.distributed-1)*100) + '%'); }
  if(p.tags.includes('tourism') && t.tourism){ m*=t.tourism; w.push('観光・交流資源との相性 +' + Math.round((t.tourism-1)*100) + '%'); }
  if(p.tags.includes('youth') && t.youth){ m*=t.youth; w.push('若者資源との相性 +' + Math.round((t.youth-1)*100) + '%'); }
  const a=approachBonus(p); m*=a.m; w=w.concat(a.w);
  const d=dilemmaBonus(p); m*=d.m; w=w.concat(d.w);
  const c=concernBonus(p); m*=c.m; w=w.concat(c.w);
  const dm=diminishBonus(p); m*=dm.m; w=w.concat(dm.w);
  if(S.v.fatigue>=80){ m*=.62; w.push('担い手疲労で効果 -38%'); }
  else if(S.v.fatigue>=65){ m*=.78; w.push('担い手疲労で効果 -22%'); }
  return {m,w};
}
function getSuitability(p){
  const fit=localFit(p);
  let score=Math.round(58 + (fit.m-1)*48);
  score = clamp(score,20,96);
  const rank = score>=85?'S':score>=70?'A':score>=55?'B':score>=40?'C':'D';
  const probs = rank==='S'?[5,50,45]:rank==='A'?[15,60,25]:rank==='B'?[30,60,10]:rank==='C'?[50,45,5]:[70,28,2];
  return {score,rank,probs,why:fit.w,fitM:fit.m};
}
function rollResult(s){
  const x=Math.random()*100, weak=s.probs[0], success=s.probs[1];
  if(x<weak) return {kind:'weak',label:'期待ほど広がらなかった',icon:'😣',mult:r(35,55)/100};
  if(x<weak+success) return {kind:'success',label:'成功',icon:'🙂',mult:r(78,100)/100};
  return {kind:'great',label:'大成功',icon:'🎉',mult:r(108,132)/100};
}
