(function(){
'use strict';
const $=id=>document.getElementById(id),btn=$('advisorBtn'),overlay=$('advisorOverlay'),close=$('advisorClose'),body=$('advisorBody');
if(!btn||!overlay||!close||!body)return;
function esc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function open(){render();overlay.classList.remove('hidden');overlay.setAttribute('aria-hidden','false')}
function shut(){overlay.classList.add('hidden');overlay.setAttribute('aria-hidden','true')}
function render(){const A=window.MACHI_V9;if(!A||!A.getState())return body.innerHTML='<div class="advisorBlock">ゲームを始めると、今年の状況に合わせて助言します。</div>';
 const S=A.getState(),P=A.getPolicies(),M=A.getMetrics(),g=A.getGoal(),pl=A.getPlan(),conc=A.getConcerns()||[];
 const gaps=Object.entries(g.t).filter(([k])=>k!=='fatigue').map(([k,t])=>({k,gap:t-S.v[k]})).sort((a,b)=>b.gap-a.gap);
 const worst=gaps.slice(0,3).map(x=>'<span class="advisorChip '+(x.gap>10?'warn':'')+'">'+esc(M[x.k].n)+' あと'+Math.max(0,x.gap)+'</span>').join('');
 const concernHtml=conc.map((c,i)=>'<div class="advisorCandidate"><b>'+(i+1)+'位 '+esc(c.icon+' '+c.name)+' '+c.pct+'%</b><div class="advisorWhy">'+esc(c.voice)+'</div></div>').join('');
 const cand=P.filter(p=>p.id!=='rest'&&!S.active.includes(p.id)).map(p=>{const fit=A.getFit(p);let score=0;conc.forEach((c,i)=>{if(c.matchIds.includes(p.id)||c.matchTags.some(t=>p.tags.includes(t)))score+=[30,16,8][i]||0});p.focus.forEach(k=>{const q=g.t[k];if(q!=null)score+=Math.max(0,q-S.v[k])});score+=Math.round((fit.m-1)*20);return{p,fit,score}}).sort((a,b)=>b.score-a.score).slice(0,3);
 const candHtml=cand.map(x=>'<div class="advisorCandidate"><b>'+esc(x.p.icon+' '+x.p.name)+'</b><div class="advisorWhy">今年の関心・目標・南風原補正を合わせると候補になりやすい施策です。</div><div class="advisorCaution">実効補正 ×'+x.fit.m.toFixed(2)+' ｜ '+esc(x.fit.w.slice(0,3).join('／')||'固有補正なし')+'</div></div>').join('');
 const downs=Object.entries(pl.projected).map(([k,v])=>({k,d:v-S.v[k]})).filter(x=>x.d<0).sort((a,b)=>a.d-b.d).slice(0,4);
 const trade=downs.length?downs.map(x=>'<span class="advisorChip warn">'+esc(M[x.k].n)+' '+x.d+'</span>').join(''):'<span class="advisorChip">今の選択では大きな低下予測なし</span>';
 let msg='今年の1位関心に応えると納得感が上がりやすいですが、5年後の目標と一致するとは限りません。';if(conc[0]&&g.t[conc[0].metric]!=null&&S.v[conc[0].metric]>=g.t[conc[0].metric])msg='住民の関心が高い分野は、すでに目標水準に近い状態です。人気に応えるか、遅れている分野へ先回りするかが判断点です。';
 body.innerHTML='<div class="advisorBlock"><h3>🎯 5年後の目標から見ると</h3><div class="advisorChips">'+worst+'</div></div><div class="advisorBlock"><h3>🗣️ 今年の住民の声は？</h3>'+concernHtml+'<div class="advisorWhy" style="margin-top:8px">'+esc(msg)+'</div></div><div class="advisorBlock"><h3>🧩 今年の候補</h3>'+candHtml+'</div><div class="advisorBlock warn"><h3>⚖️ 今の作戦で後回しになるもの</h3><div class="advisorChips">'+trade+'</div><div class="advisorWhy" style="margin-top:8px">同じ分野への連続投資は年々効きにくくなり、偏りが続くと住民の納得感が下がることがあります。</div></div>';
}
btn.onclick=open;close.onclick=shut;overlay.onclick=e=>{if(e.target===overlay)shut()};window.addEventListener('machi:statechange',()=>{if(!overlay.classList.contains('hidden'))render()});
})();