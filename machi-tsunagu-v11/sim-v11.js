(function(){
'use strict';
const core=()=>window.MACHI_V9;
const $=id=>document.getElementById(id);
if(!core()||!$('dockRun')) return;
const D=window.GAME_DATA;
const BASE={population:41402,childShare:20.3,socialGain:412,outCommute:67.6,businesses:1441,employees:14829,welfareEmployees:4338};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const rint=(a,b)=>Math.floor(Math.random()*(b-a+1))+a;
const state=()=>core().getState();
const policies=()=>core().getPolicies();
const policy=id=>policies().find(p=>p.id===id);
const plannedIds=s=>(s.active||[]).filter(id=>!s.keep||s.keep[id]!==false).concat(s.selected||[]);
function suitability(p){
  const fit=core().getFit(p)||{m:1,w:[]};
  let score=Math.round(58+(fit.m-1)*48);
  const s=state();
  if((s.v.fatigue||0)>75)score-=8;
  score=clamp(score,20,96);
  const rank=score>=85?'S':score>=70?'A':score>=55?'B':score>=40?'C':'D';
  const probs=rank==='S'?[5,50,45]:rank==='A'?[15,60,25]:rank==='B'?[30,60,10]:rank==='C'?[50,45,5]:[70,28,2];
  return{score,rank,probs,why:fit.w||[]};
}
function roll(suit){
  const x=Math.random()*100,[weak,success]=suit.probs;
  if(x<weak)return{kind:'weak',label:'期待ほど広がらなかった',icon:'😣',mult:(rint(35,55)/100)};
  if(x<weak+success)return{kind:'success',label:'成功',icon:'🙂',mult:(rint(78,100)/100)};
  return{kind:'great',label:'大成功',icon:'🎉',mult:(rint(108,132)/100)};
}
function annotatePolicies(){
  const cards=[...document.querySelectorAll('#policyGrid .policy')];
  cards.forEach(card=>{
    card.querySelector('.suitabilityBox')?.remove();
    const h=card.querySelector('h3'); if(!h)return;
    const name=h.textContent.replace(/^\S+\s*/,'').trim();
    const p=policies().find(x=>name.includes(x.name)||x.name.includes(name)); if(!p)return;
    const q=suitability(p),box=document.createElement('div');box.className='suitabilityBox rank'+q.rank;
    box.innerHTML='<div><b>効果適正度 '+q.rank+'・'+q.score+'%</b><span>期待薄 '+q.probs[0]+'%／成功 '+q.probs[1]+'%／大成功 '+q.probs[2]+'%</span></div><small>実行結果には運があります。マイナスの副作用は成功しても残ります。</small>';
    const fit=card.querySelector('.localFit'); fit?fit.after(box):card.appendChild(box);
  });
}
function applyLuck(before,outcomes){
  const s=state(),mm=core().getMetrics(),notes=[];
  Object.keys(mm).forEach(k=>{
    if(['fatigue','acceptance'].includes(k))return;
    const gain=(s.v[k]||0)-(before[k]||0); if(gain<=0)return;
    const relevant=outcomes.filter(o=>(o.p.focus||[]).includes(k)); if(!relevant.length)return;
    const mult=relevant.reduce((a,o)=>a+o.result.mult,0)/relevant.length;
    let adj=Math.max(1,Math.round(gain*mult));
    if(adj!==gain){s.v[k]=clamp((before[k]||0)+adj,0,100);notes.push(mm[k].n+'：予定 +'+gain+' → 実行結果 +'+adj);}
  });
  const h=s.history?.[s.history.length-1];if(h&&h.year===s.year)h.v={...s.v};
  return notes;
}
function renderExecution(outcomes,notes){
  let box=$('executionResult');
  if(!box){box=document.createElement('div');box.id='executionResult';box.className='executionResult';$('surprise')?.after(box)}
  box.innerHTML='<h3>🎲 施策の実行結果</h3><div class="executionGrid">'+outcomes.map(o=>'<div class="executionItem '+o.result.kind+'"><div><b>'+o.result.icon+' '+o.p.name+'</b><span class="rankBadge">適正度 '+o.suit.rank+' '+o.suit.score+'%</span></div><strong>'+o.result.label+'</strong><small>良い判断でも必ず大成功するとは限りません。</small></div>').join('')+'</div>'+(notes.length?'<div class="luckNotes">'+notes.map(x=>'・'+x).join('<br>')+'</div>':'');
}
function refreshChanges(before){
  const s=state(),g=core().getGoal(),mm=core().getMetrics();
  if($('changes'))$('changes').innerHTML=Object.keys(mm).map(k=>{const d=s.v[k]-before[k],t=(k==='fatigue'?'≤':'≥')+g.t[k];return '<div class="change">'+mm[k].i+' '+mm[k].n+' <b class="'+(d>=0?'up':'down')+'">'+(d>0?'+':'')+d+'</b> → '+s.v[k]+' <span class="targetNote">（目標値: '+t+'）</span></div>'}).join('');
}
function townData(){
  const s=state(),v=s.v,y=(s.history||[]).length,S=D.START;
  const pop=Math.round(BASE.population+y*35+(v.child-S.child)*13+(v.stay-S.stay)*10+(v.acceptance-56)*4);
  const childShare=clamp(BASE.childShare+(v.child-S.child)*.025+(v.acceptance-56)*.006-y*.03,17,24);
  const social=Math.round(clamp(BASE.socialGain+(v.acceptance-56)*4+(v.child-S.child)*2.5+(v.industry-S.industry)*2-(Math.max(0,v.fatigue-50))*2,-250,900));
  const out=clamp(BASE.outCommute-(v.stay-S.stay)*.32-(v.industry-S.industry)*.09+(v.fatigue>70?1.2:0),45,80);
  const biz=Math.round(Math.max(1200,BASE.businesses+(v.industry-S.industry)*4.2+(v.tourism-S.tourism)*1.6-(Math.max(0,v.fatigue-65))*1.2));
  const emp=Math.round(Math.max(12500,BASE.employees+(v.industry-S.industry)*46+(v.stay-S.stay)*30+(v.tourism-S.tourism)*12));
  return{population:pop,childShare:+childShare.toFixed(1),socialGain:social,outCommute:+out.toFixed(1),businesses:biz,employees:emp,welfareEmployees:BASE.welfareEmployees};
}
function phrase(){
  const v=state().v;
  if(v.fatigue>=75)return{icon:'🪫',text:'動いている。でも担い手が疲れているまち',note:'成果の裏で、続ける人の余力が減っています。'};
  if(v.acceptance<45)return{icon:'🗯️',text:'成果はあるけれど、納得が揺れるまち',note:'数字よりも「誰のための施策か」が問われています。'};
  if(v.equity<40)return{icon:'🗺️',text:'中心だけが先に進みつつあるまち',note:'地区による参加しやすさの差が大きくなっています。'};
  if(v.child>=78&&v.acceptance>=60)return{icon:'👶',text:'子育て世代にやさしいまち',note:'子育て環境への手応えが、町全体の納得にもつながっています。'};
  if(v.youth>=75&&v.industry>=68)return{icon:'🌱',text:'若者が地域で挑戦し始めたまち',note:'若者の参加と地域の仕事が結びつき始めています。'};
  if(v.senior>=75&&v.connection>=68)return{icon:'🧓',text:'世代を越えて支え合うまち',note:'高齢者の役割と地域のつながりが同時に育っています。'};
  if(v.industry>=78&&v.stay>=60)return{icon:'🏭',text:'地域で働く力が育ったまち',note:'町内で働く・過ごす選択肢が増えています。'};
  if(v.tourism>=75&&v.equity>=55)return{icon:'🏝️',text:'にぎわいと暮らしを両立し始めたまち',note:'外から人を呼ぶ力と地域の公平さを両立しつつあります。'};
  if(v.connection>=70)return{icon:'🤝',text:'つながりが生まれ始めたまち',note:'人と人が接点を持てる土台が育ってきました。'};
  const gains=['child','youth','senior','industry','tourism','connection','stay','equity'].map(k=>[k,v[k]-D.START[k]]).sort((a,b)=>b[1]-a[1]);
  const k=gains[0][0],names={child:'子育ての選択肢が増え始めたまち',youth:'若者の声が見え始めたまち',senior:'高齢者の役割が生まれ始めたまち',industry:'地域の仕事が動き始めたまち',tourism:'外との交流が生まれ始めたまち',connection:'つながりが生まれ始めたまち',stay:'町で過ごす理由が増え始めたまち',equity:'地区を越えて届き始めたまち'};
  return{icon:'🌿',text:names[k],note:'まだ完成形ではありません。これまでの選択が町の方向をつくり始めています。'};
}
function ensureTownCard(){
  let card=$('townSnapshot');if(card)return card;
  card=document.createElement('section');card.id='townSnapshot';card.className='card townSnapshot';
  const anchor=$('residentPulse')||$('dilemmaCard');anchor?.after(card);return card;
}
function renderTown(){
  const s=state();if(!s)return;const d=townData(),p=phrase(),card=ensureTownCard(),year=(s.history||[]).length;
  card.innerHTML='<div class="townHead"><div><div class="townKicker">'+(year===0?'実データを出発点にした現在':'ゲーム内推計・'+year+'年経過')+'</div><h2>'+p.icon+' 「'+p.text+'」</h2><p>'+p.note+'</p></div><span class="fictionBadge">'+(year===0?'初期値':'仮想データ')+'</span></div><div class="townDataGrid">'+stat('人口',d.population.toLocaleString()+'人',year===0?'公式初期値':'ゲーム内推計')+stat('0〜14歳',d.childShare+'%',year===0?'公式初期値':'ゲーム内推計')+stat('社会増減',sign(d.socialGain)+'人/年',year===0?'2024年実績':'ゲーム内推計')+stat('町外通勤・通学',d.outCommute+'%',year===0?'公式初期値':'ゲーム内推計')+stat('町内事業所',d.businesses.toLocaleString(),year===0?'公式初期値':'ゲーム内推計')+stat('町内従業者',d.employees.toLocaleString()+'人',year===0?'公式初期値':'ゲーム内推計')+'</div><div class="townDisclaimer">初期値は公開統計。2年目以降の数値は、ゲーム上の施策結果を地域データ風に換算した架空の推計で、実際の政策効果予測ではありません。</div>';
}
function sign(n){return(n>0?'+':'')+n}
function stat(name,val,sub){return '<div class="townStat"><span>'+name+'</span><b>'+val+'</b><small>'+sub+'</small></div>'}
function renderFinalTown(){
  if(!$('ending')||$('ending').classList.contains('hidden'))return;
  const d=townData(),p=phrase();let box=$('finalTown');
  if(!box){box=document.createElement('div');box.id='finalTown';box.className='finalTown';$('scoreBreakdown')?.after(box)}
  box.innerHTML='<div class="townKicker">5年後の町の姿</div><h3>'+p.icon+' 「'+p.text+'」</h3><p>'+p.note+'</p><div class="finalTownMini">人口 '+d.population.toLocaleString()+'人 ／ 社会増減 '+sign(d.socialGain)+'人/年 ／ 町外通勤・通学 '+d.outCommute+'% ／ 事業所 '+d.businesses.toLocaleString()+'</div><small>すべてゲーム内の仮想推計です。</small>';
}
const oldRun=$('dockRun').onclick;
$('dockRun').onclick=function(e){
  const s=state();if(!s)return oldRun?.call(this,e);
  const before={...s.v},ids=plannedIds(s),outs=ids.map(id=>{const p=policy(id),suit=suitability(p);return{p,suit,result:roll(suit)}});
  oldRun?.call(this,e);
  if(!s.resolved)return;
  const notes=applyLuck(before,outs);refreshChanges(before);renderExecution(outs,notes);renderTown();
  window.dispatchEvent(new CustomEvent('machi:statechange'));
};
const oldNext=$('nextYear').onclick;
$('nextYear').onclick=function(e){oldNext?.call(this,e);setTimeout(()=>{renderTown();renderFinalTown();annotatePolicies()},0)};
$('advisorBtn')?.addEventListener('click',()=>setTimeout(()=>{
  const b=$('advisorBody');if(!b)return;
  const n=document.createElement('div');n.className='advisorBlock';n.innerHTML='<h3>🎲 効果適正度について</h3><p>施策は、地域特性・住民関心・連続投資・担い手疲労から成功しやすさが変わります。<b>適正度が高くても大成功は保証されません。</b>逆に、成功しても後回しにした分野の低下や反発は残ります。</p>';b.prepend(n);
},0));
window.addEventListener('machi:statechange',()=>setTimeout(()=>{renderTown();annotatePolicies()},0));
setTimeout(()=>{renderTown();annotatePolicies()},100);
})();