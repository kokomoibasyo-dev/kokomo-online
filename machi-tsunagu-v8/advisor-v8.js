(function(){
'use strict';
const $=id=>document.getElementById(id);
const btn=$('advisorBtn'),overlay=$('advisorOverlay'),close=$('advisorClose'),body=$('advisorBody');
if(!btn||!overlay||!close||!body)return;

const GOAL_PRIMARY={
  '若者が元気なまち':['若者の地域接点'],
  '子育てしやすいまち':['子ども・子育て'],
  '高齢者が活発なまち':['高齢者の地域接点'],
  '産業が豊かなまち':['地域産業'],
  '観光の聖地':['観光・交流'],
  'つながりの強いまち':['地域のつながり','地区バランス'],
  '学び続けるまち':['地域のつながり','若者の地域接点']
};
const EVENT_MAP=[
  {keys:['転入','引っ越'],focus:['地域のつながり','地区バランス'],meaning:'新しく住み始めた人が地域への入口を見つけにくい状態です。情報だけでなく、参加できる接点があるかを考える年です。'},
  {keys:['町外通勤','通学','平日日中'],focus:['若者の地域接点','町内で働く・過ごす','地域のつながり'],meaning:'住民が町外で過ごす時間が長く、地域活動の「時間の設計」が合っていない可能性があります。'},
  {keys:['医療・福祉'],focus:['子ども・子育て','高齢者の地域接点','地域のつながり'],meaning:'専門職という南風原町の強みを、地域の普段の暮らしへつなげる機会が出ています。'},
  {keys:['人手不足','地域の店','働き手'],focus:['地域産業','町内で働く・過ごす','若者の地域接点'],meaning:'仕事と若い世代の接点が弱いことが、地域産業と町内滞在の両方に影響しています。'},
  {keys:['小規模地区','中心','遠い','人口の大きい地区'],focus:['地区バランス','地域のつながり'],meaning:'「利用者数を増やす効率」と「どの地区からも参加できる公平さ」がぶつかっている年です。'},
  {keys:['台風','中止','悪天候'],focus:['観光・交流','地域のつながり'],meaning:'単発イベントに頼るほど天候リスクを受けます。日常的に続く仕組みとの組み合わせを考える場面です。'}
];

function cleanName(s){return (s||'').replace(/^[^\p{L}\p{N}]+/u,'').trim()}
function numberFrom(s){const m=(s||'').match(/-?\d+/);return m?Number(m[0]):0}
function goalName(){const t=($('goalPill')&&$('goalPill').textContent)||'';return Object.keys(GOAL_PRIMARY).find(x=>t.includes(x))||''}
function readMetrics(){
  return Array.from(document.querySelectorAll('#metricGrid .metric')).map(card=>{
    const name=cleanName(card.querySelector('.name')?.textContent||'');
    const nums=(card.querySelector('.metricTop b')?.textContent||'').match(/\d+/g)||[];
    const now=Number(nums[0]||0),pred=Number(nums[1]||nums[0]||0);
    const foot=card.querySelector('.metricFoot')?.textContent||'';
    const tm=foot.match(/目標\s*([≤≥])\s*(\d+)/);const op=tm?tm[1]:'≥',target=tm?Number(tm[2]):0;
    const gap=op==='≤'?Math.max(0,now-target):Math.max(0,target-now);
    return{name,now,pred,target,op,gap,delta:pred-now};
  });
}
function eventInfo(){
  const text=$('yearEvent')?.textContent||'';const voices=Array.from(document.querySelectorAll('#voices .voice')).map(x=>x.textContent.replace(/^\S+\s*住民\s*/,'').trim());
  const hit=EVENT_MAP.find(x=>x.keys.some(k=>text.includes(k)||voices.some(v=>v.includes(k))));
  return{text,voices,focus:hit?hit.focus:[],meaning:hit?hit.meaning:'住民の声は、いま数字に出ていない課題や期待を示す手がかりです。5年後の目標と同じ方向とは限らないので、短期の要望と長期目標を分けて考えてみましょう。'};
}
function readPolicies(metrics,event,primary){
  const metricByName=Object.fromEntries(metrics.map(m=>[m.name,m]));
  const cards=Array.from(document.querySelectorAll('#policyGrid .policy'));
  return cards.map(card=>{
    const name=(card.querySelector('h3')?.textContent||'').trim(),cost=numberFrom(card.querySelector('.cost')?.textContent||'0');
    const effects=Array.from(card.querySelectorAll('.effects .tag')).map(t=>{const s=t.textContent.trim(),m=s.match(/(.+?)\s+([+-]\d+)$/);return m?{name:m[1].trim(),value:Number(m[2])}:null}).filter(Boolean);
    const fit=Number(((card.querySelector('.localFit b')?.textContent||'').match(/×([\d.]+)/)||[])[1]||1);
    const selected=card.classList.contains('selected'),active=card.classList.contains('activePolicy'),blocked=card.classList.contains('slotFull');
    let score=0,reasons=[],cautions=[];
    effects.forEach(e=>{
      const met=metricByName[e.name];
      if(e.value>0){
        let w=1;
        if(met)w+=Math.min(2.5,met.gap/12);
        if(primary.includes(e.name))w+=2.5;
        if(event.focus.includes(e.name))w+=1.8;
        score+=e.value*w*fit;
      }else if(e.value<0){
        let w=1;if(met&&met.gap>0)w+=2;if(primary.includes(e.name))w+=2;score+=e.value*w;
        cautions.push(e.name+' '+e.value);
      }
      if(e.name.includes('つかれ')&&e.value>0){const fatigue=metrics.find(x=>x.name.includes('つかれ'));score-=e.value*((fatigue&&fatigue.now>50)?2.2:1);cautions.push('担い手のつかれ +'+e.value);}
    });
    score-=cost*.12;
    const helpful=effects.filter(e=>e.value>0&&(primary.includes(e.name)||event.focus.includes(e.name)||(metricByName[e.name]&&metricByName[e.name].gap>0))).sort((a,b)=>b.value-a.value).slice(0,2);
    if(helpful.length)reasons.push(helpful.map(e=>e.name+' +'+e.value).join('、'));
    if(fit>1.01)reasons.push('南風原補正 ×'+fit.toFixed(2));
    if(selected)reasons.push('いま選択中');
    return{name,cost,effects,fit,selected,active,blocked,score,reasons,cautions};
  }).filter(x=>!x.active&&!x.blocked).sort((a,b)=>b.score-a.score);
}
function buildAdvice(){
  const metrics=readMetrics(),gName=goalName(),primary=GOAL_PRIMARY[gName]||[],event=eventInfo();
  const concerns=metrics.filter(m=>m.gap>0).sort((a,b)=>{
    const ap=primary.includes(a.name)?16:0,bp=primary.includes(b.name)?16:0,ae=event.focus.includes(a.name)?10:0,be=event.focus.includes(b.name)?10:0;return (b.gap+bp+be)-(a.gap+ap+ae);
  }).slice(0,3);
  const policies=readPolicies(metrics,event,primary);
  const selected=Array.from(document.querySelectorAll('#policyGrid .policy.selected h3')).map(x=>x.textContent.trim());
  const plannedDown=metrics.filter(m=>m.delta<0).sort((a,b)=>a.delta-b.delta).slice(0,3);
  const totalMatch=($('upkeepBox')?.textContent||'').match(/施策枠\s*(\d+)\/(\d+)/);const used=totalMatch?Number(totalMatch[1]):0,limit=totalMatch?Number(totalMatch[2]):0;

  const concernHtml=concerns.length?concerns.map(m=>'<span class="advisorChip'+(primary.includes(m.name)?' warn':'')+'">'+m.name+'：'+m.now+' / 目標'+m.op+m.target+'</span>').join(''):'<span class="advisorChip">主な目標値はおおむね達成中</span>';
  const eventFocusHtml=event.focus.length?event.focus.map(x=>'<span class="advisorChip">'+x+'</span>').join(''):'<span class="advisorChip">声の背景を数値と照らして考える</span>';
  let candidateHtml='';
  if(used>=limit&&limit){candidateHtml='<div class="advisorCandidate"><b>まず継続施策の見直しが必要</b><div class="advisorWhy">今年の施策枠が埋まっています。新しい施策を入れるなら、何かを「やめる」判断が必要です。</div></div>'}
  else if(policies.length){candidateHtml=policies.slice(0,3).map((p,i)=>'<div class="advisorCandidate"><b>'+(i+1)+'. '+p.name+(p.selected?'（選択中）':'')+'</b><div class="advisorWhy">'+(p.reasons.length?p.reasons.join(' ／ '):'今年の不足指標に広く作用する候補')+'。費用 '+p.cost+'pt</div>'+(p.cautions.length?'<div class="advisorCaution">注意：'+[...new Set(p.cautions)].join('、')+'</div>':'')+'</div>').join('')}
  else candidateHtml='<div class="advisorCandidate"><b>今の条件で追加できる候補がありません</b><div class="advisorWhy">予算か施策枠を見直してみてください。</div></div>';

  let selectionText='まだ施策を選んでいません。まず「住民の今年の声に応える」「5年後の中心目標を伸ばす」「下がりそうな分野を守る」のどれを優先するか決めると選びやすくなります。';
  if(selected.length){selectionText='現在の新規施策：<b>'+selected.join(' ＋ ')+'</b>。';if(plannedDown.length)selectionText+=' このまま進むと '+plannedDown.map(m=>m.name+' '+m.delta).join('、')+' の予測です。下がっても受け入れるのか、組み合わせを変えるのかが判断点です。';else selectionText+=' 短期予測では大きく下がる指標は見えていません。ただし「予想外の出来事」は別です。'}

  body.innerHTML=
    '<section class="advisorBlock warn"><h3>🧭 今年の読みどころ</h3><div class="advisorChips">'+concernHtml+'</div><div class="advisorWhy" style="margin-top:8px">目指すまち：<b>'+gName+'</b>'+(primary.length?'。中心指標は「'+primary.join('・')+'」です。':'。')+'</div></section>'+ 
    '<section class="advisorBlock"><h3>🗣️ 住民の声は何を意味する？</h3><div class="advisorChips">'+eventFocusHtml+'</div><div style="margin-top:8px">'+event.meaning+'</div><div class="advisorWhy">今年の状況：'+event.text+'</div></section>'+ 
    '<section class="advisorBlock"><h3>💡 施策候補を考えるなら</h3><div class="advisorWhy" style="margin-bottom:8px">「最適解」ではなく、今年の不足・住民の関心・5年後の目標を同時に見た候補です。</div>'+candidateHtml+'</section>'+ 
    '<section class="advisorBlock"><h3>⚖️ 今の組み合わせの葛藤</h3><div>'+selectionText+'</div></section>';
}
function openAdvisor(){buildAdvice();overlay.classList.remove('hidden');overlay.setAttribute('aria-hidden','false');document.body.style.overflow='hidden'}
function closeAdvisor(){overlay.classList.add('hidden');overlay.setAttribute('aria-hidden','true');document.body.style.overflow=''}
btn.addEventListener('click',openAdvisor);close.addEventListener('click',closeAdvisor);overlay.addEventListener('click',e=>{if(e.target===overlay)closeAdvisor()});document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!overlay.classList.contains('hidden'))closeAdvisor()});
})();
