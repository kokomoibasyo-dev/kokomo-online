(function(){
'use strict';

const TOWN_SHARE_API_URL = 'https://script.google.com/macros/s/AKfycbwH5sxrU6KpAnZOXhXB8acLA-1cH_OPEFavw_HDVYWGpF7FjgqEx8DnyoJUulC_6H6YZw/exec';
const TOWN_RESULTS_URL = './results.html';
const $r = id => document.getElementById(id);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

const originalRunYear = window.runYear;
const originalNextYear = window.nextYear;
const originalFinishGame = window.finishGame;
const originalStartGame = window.startGame;
const originalResetGame = window.resetGame;

function ensureReflectionState(){
  if(typeof S==='undefined' || !S) return;
  if(!Array.isArray(S.reflections)) S.reflections=[];
  if(!S.finalReflection) S.finalReflection={};
}
function reflectionForYear(year){
  ensureReflectionState();
  let x=S.reflections.find(v=>v.year===year);
  if(!x){x={year};S.reflections.push(x)}
  return x;
}
function dilemmaLabel(){
  const list=(typeof DILEMMAS!=='undefined'?DILEMMAS:[]); const d=list.find(x=>x.id===S.dilemma);
  return d?d.title:(S.dilemma||'');
}
function policySnap(){
  const cont=(typeof continuedIds==='function'?continuedIds():[]).map(id=>policyById(id)?.name||id);
  const fresh=(S.selected||[]).map(id=>policyById(id)?.name||id);
  const stop=(S.active||[]).filter(id=>S.keep[id]===false).map(id=>policyById(id)?.name||id);
  return {continued:cont,newPolicies:fresh,stopped:stop};
}
function concernSnap(){return (S.concerns||[]).map(c=>({name:c.name,pct:c.pct,id:c.id}));}
function trendSnap(){return S.trend?{name:S.trend.name,text:S.trend.text,icon:S.trend.icon}:null;}
function injectStyles(){
  const st=document.createElement('style');
  st.textContent=`
  .reflectOverlay{position:fixed;inset:0;background:rgba(20,29,24,.48);z-index:120;display:flex;align-items:flex-end;justify-content:center;padding:14px}
  .reflectSheet{width:min(94vw,760px);max-height:90vh;overflow:auto;background:#fff;border-radius:24px;padding:18px;box-shadow:0 20px 55px rgba(0,0,0,.2)}
  .reflectHead{display:flex;justify-content:space-between;gap:12px;align-items:flex-start}.reflectHead h2{margin:2px 0 8px}.reflectClose{border:0;background:#eef5ef;width:38px;height:38px;border-radius:999px;font-size:22px;cursor:pointer}
  .reflectContext{padding:11px;border-radius:14px;background:#f5f8f5;border:1px solid #dbe6dc;line-height:1.65;font-size:13px;margin:10px 0}
  .reflectLabel{font-weight:900;display:block;margin:14px 0 6px}.reflectReq{color:#b64747;font-size:11px;margin-left:5px}
  .reflectText{width:100%;min-height:90px;border:1px solid #ccd9cf;border-radius:14px;padding:12px;font:inherit;line-height:1.65;resize:vertical}.reflectText.short{min-height:64px}
  .reflectTags{display:flex;flex-wrap:wrap;gap:7px}.reflectTag{border:1px solid #d6e0d8;background:#f7faf7;border-radius:999px;padding:8px 11px;font-size:12px;font-weight:800;cursor:pointer}.reflectTag.active{background:#e8f7ed;border-color:#4d9b6c;color:#17623c}
  .reflectError{color:#b33d45;font-size:12px;font-weight:800;min-height:18px;margin-top:6px}.reflectSave{width:100%;margin-top:12px}
  .postReflect{margin-top:14px;padding:14px;border:1px solid #dbe5dc;border-radius:16px;background:#f8fbf8;text-align:left}.postReflect h3{margin:0 0 5px}.postReflect textarea{width:100%;min-height:76px;border:1px solid #d1ddd3;border-radius:12px;padding:10px;font:inherit;line-height:1.6}
  .finalReflect{margin-top:14px;padding:16px;border:1px solid #d9e4da;border-radius:18px;background:#f8fbf8;text-align:left}.finalReflect h2{margin-top:0}.finalReflect .field{margin-top:12px}.finalReflect label{display:block;font-weight:900;margin-bottom:6px}.finalReflect input,.finalReflect textarea{width:100%;border:1px solid #cdd9cf;border-radius:12px;padding:11px;font:inherit}.finalReflect textarea{min-height:84px;line-height:1.6}.shareStatus{margin-top:8px;font-size:12px;font-weight:800}.sharePreview{margin-top:12px;padding:12px;background:#fff8dc;border:1px solid #ebdc9d;border-radius:14px;line-height:1.7}.shareActions{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:12px}.shareLink{text-decoration:none;text-align:center}@media(max-width:680px){.shareActions{grid-template-columns:1fr}}
  `;
  document.head.appendChild(st);
}
function injectIntentModal(){
  const d=document.createElement('div'); d.id='reflectOverlay'; d.className='reflectOverlay'; d.style.display='none';
  d.innerHTML=`<div class="reflectSheet"><div class="reflectHead"><div><div class="eyebrow">判断の記録</div><h2 id="reflectTitle">今年の判断メモ</h2></div><button class="reflectClose" id="reflectClose">×</button></div><div id="reflectContext" class="reflectContext"></div><span class="reflectLabel">何をいちばん大事にした？ <span class="small">複数選択可</span></span><div id="reflectTags" class="reflectTags"></div><label class="reflectLabel" for="reflectIntent">なぜこの施策を選んだ？<span class="reflectReq">必須</span></label><textarea id="reflectIntent" class="reflectText" maxlength="400" placeholder="例：若者の数値は伸びてきたので、今年は高齢者の要望にも応えながら、つながりを落とさないようにしたかった。"></textarea><label class="reflectLabel" for="reflectDoubt">何と迷った？ <span class="small">任意</span></label><textarea id="reflectDoubt" class="reflectText short" maxlength="300" placeholder="例：若者施策をもう1年続けるか、高齢者施策へ振るか迷った。"></textarea><div id="reflectError" class="reflectError"></div><button id="reflectSave" class="btn reflectSave">この判断を記録して1年進める →</button></div>`;
  document.body.appendChild(d);
  $r('reflectClose').onclick=()=>d.style.display='none';
  d.addEventListener('click',e=>{if(e.target===d)d.style.display='none'});
}
const TAGS=['住民の声','長期目標','弱点の補強','前年の結果','世代のバランス','予算','担い手の負担','地域の強み','その他'];
function openIntentModal(){
  ensureReflectionState();
  const y=S.year, rec=reflectionForYear(y), ps=policySnap();
  $r('reflectTitle').textContent=y+'年目｜今年の判断メモ';
  $r('reflectContext').innerHTML='<b>今年の論点：</b>'+esc(dilemmaLabel())+'<br><b>継続：</b>'+esc(ps.continued.join('、')||'なし')+'<br><b>新規：</b>'+esc(ps.newPolicies.join('、')||'なし')+'<br><b>終了：</b>'+esc(ps.stopped.join('、')||'なし');
  const tags=$r('reflectTags');tags.innerHTML='';
  TAGS.forEach(t=>{const b=document.createElement('button');b.type='button';b.className='reflectTag'+((rec.priorityTags||[]).includes(t)?' active':'');b.textContent=t;b.onclick=()=>b.classList.toggle('active');tags.appendChild(b)});
  $r('reflectIntent').value=rec.intent||'';$r('reflectDoubt').value=rec.doubt||'';$r('reflectError').textContent='';
  $r('reflectOverlay').style.display='flex';
  $r('reflectSave').onclick=()=>{
    const intent=$r('reflectIntent').value.trim(); if(!intent){$r('reflectError').textContent='「なぜこの施策を選んだ？」だけは入力してください。';return}
    rec.priorityTags=[...tags.querySelectorAll('.reflectTag.active')].map(x=>x.textContent);
    rec.intent=intent;rec.doubt=$r('reflectDoubt').value.trim();rec.dilemma={id:S.dilemma,label:dilemmaLabel()};rec.policies=policySnap();rec.concerns=concernSnap();rec.trend=trendSnap();rec.beforeMetrics={...S.v};rec.savedAt=new Date().toISOString();
    $r('reflectOverlay').style.display='none';
    originalRunYear();
    setTimeout(renderPostReflection,0);
  };
}
function renderPostReflection(){
  const result=$r('result'); if(!result) return;
  let box=$r('postReflectBox'); if(!box){box=document.createElement('div');box.id='postReflectBox';box.className='postReflect';const next=$r('nextYear');result.insertBefore(box,next)}
  const rec=reflectionForYear(S.year);
  rec.afterMetrics={...S.v};
  box.innerHTML='<h3>💡 '+S.year+'年目｜結果を見て気づいたこと</h3><div class="small">任意です。「思ったより○○が下がった」「この組み合わせは効いた」など、結果を見て考えたことを残せます。</div><textarea id="yearInsight" maxlength="400" placeholder="結果を見て気づいたこと">'+esc(rec.insight||'')+'</textarea>';
  const ta=$r('yearInsight');ta.addEventListener('input',()=>{rec.insight=ta.value.trim()});
}
function savePostInsight(){const ta=$r('yearInsight'); if(ta){reflectionForYear(S.year).insight=ta.value.trim()}}
function reflectionRunYear(){
  ensureReflectionState();
  const total=typeof totalPlanned==='function'?totalPlanned():0;
  if(S.resolved || total<2 || total>yearLimit()) return;
  if(S.year===1 && total!==2) return;
  openIntentModal();
}
function reflectionNextYear(){savePostInsight();if(S.year>=currentDuration()) return reflectionFinishGame();return originalNextYear();}
function reflectionFinishGame(){savePostInsight();originalFinishGame();setTimeout(renderFinalReflection,0);}
function renderFinalReflection(){
  ensureReflectionState();
  const end=$r('ending');if(!end)return;
  let box=$r('finalReflectBox');if(!box){box=document.createElement('div');box.id='finalReflectBox';box.className='finalReflect';const restart=$r('restart');end.insertBefore(box,restart)}
  const f=S.finalReflection||{};
  box.innerHTML=`<h2>📝 ${currentDuration()}年間を振り返る</h2><div class="small">結果の点数だけでなく、「なぜそう決めたか」を共有するための振り返りです。</div><div class="field"><label>ハンドルネーム <span class="reflectReq">共有する場合は必須</span></label><input id="shareHandle" maxlength="30" value="${esc(f.handle||'')}" placeholder="本名ではなくニックネーム"></div><div class="field"><label>全体の振り返り <span class="reflectReq">共有する場合は必須</span></label><textarea id="overallReflection" maxlength="800" placeholder="${currentDuration()}年間を通して考えたこと、難しかったこと、気づいたこと">${esc(f.overall||'')}</textarea></div><div class="field"><label>いちばん迷った判断は？ <span class="small">任意</span></label><textarea id="hardestDecision" maxlength="500">${esc(f.hardest||'')}</textarea></div><div class="field"><label>途中で考えが変わったことは？ <span class="small">任意</span></label><textarea id="changedMind" maxlength="500">${esc(f.changed||'')}</textarea></div><div class="field"><label>もう一度やるなら、何を変える？ <span class="small">任意</span></label><textarea id="retryChange" maxlength="500">${esc(f.retry||'')}</textarea></div><div class="field"><label>${currentDuration()}年間をひとことで言うと？ <span class="small">任意</span></label><input id="oneLine" maxlength="100" value="${esc(f.oneLine||'')}" placeholder="例：若者だけを伸ばしても、若者が元気なまちにはならなかった。"></div><div id="sharePreview" class="sharePreview"></div><div class="shareActions"><button id="shareTownBtn" class="btn full">🌱 このまちづくりを共有する</button><a class="btn secondary full shareLink" href="${TOWN_RESULTS_URL}">👥 みんなのまちづくりを見る</a></div><div id="shareStatus" class="shareStatus"></div>`;
  const save=()=>{S.finalReflection={handle:$r('shareHandle').value.trim(),overall:$r('overallReflection').value.trim(),hardest:$r('hardestDecision').value.trim(),changed:$r('changedMind').value.trim(),retry:$r('retryChange').value.trim(),oneLine:$r('oneLine').value.trim()};renderSharePreview()};
  ['shareHandle','overallReflection','hardestDecision','changedMind','retryChange','oneLine'].forEach(id=>$r(id).addEventListener('input',save));
  $r('shareTownBtn').onclick=submitTownShare;save();
}
function renderSharePreview(){
  const a=computeAchievement(), phrase=townPhrase(S.v), f=S.finalReflection||{};
  $r('sharePreview').innerHTML='<b>共有カードの概要</b><br>'+esc(city().name)+' × '+currentDuration()+'年 × '+esc(goal().name)+'<br>達成度 <b>'+a.score+'%</b> ／ '+esc(phrase.text)+(f.oneLine?'<br>💬「'+esc(f.oneLine)+'」':'');
}
function buildPayload(){
  const a=computeAchievement(), phrase=townPhrase(S.v);
  return {schemaVersion:1,submittedAt:new Date().toISOString(),handle:S.finalReflection.handle,cityId:S.city,cityName:city().name,duration:currentDuration(),approachId:S.approach,approachName:APPROACHES[S.approach]?.name||S.approach,goalId:S.goal,goalName:goal().name,achievement:a.score,endingLabel:$r('endingLabel')?.textContent||'',finalPhrase:phrase.text,finalPhraseNote:phrase.note,finalMetrics:{...S.v},annualReflections:S.reflections||[],finalReflection:{...S.finalReflection}};
}
function submitTownShare(){
  const f=S.finalReflection||{}, status=$r('shareStatus'), btn=$r('shareTownBtn');
  if(!f.handle||!f.overall){status.textContent='ハンドルネームと「全体の振り返り」を入力してください。';status.style.color='#b33d45';return}
  if(!TOWN_SHARE_API_URL){status.textContent='共有先に接続できません。';status.style.color='#8a6a19';return}
  if(btn){btn.disabled=true;btn.textContent='送信しています…'}
  let frame=$r('townShareFrame');if(!frame){frame=document.createElement('iframe');frame.name='townShareFrame';frame.id='townShareFrame';frame.style.display='none';document.body.appendChild(frame)}
  const form=document.createElement('form');form.method='POST';form.action=TOWN_SHARE_API_URL;form.target='townShareFrame';form.style.display='none';const input=document.createElement('input');input.name='payload';input.value=JSON.stringify(buildPayload());form.appendChild(input);document.body.appendChild(form);form.submit();form.remove();
  setTimeout(()=>{status.innerHTML='✅ 共有しました。反映まで少し時間がかかることがあります。 <a href="'+TOWN_RESULTS_URL+'">みんなのまちづくりを見る</a>';status.style.color='#1e7447';if(btn){btn.textContent='✅ 共有済み';btn.disabled=true}},700);
}
function wire(){
  injectStyles();injectIntentModal();
  if($r('dockRun')) $r('dockRun').onclick=reflectionRunYear;
  if($r('nextYear')) $r('nextYear').onclick=reflectionNextYear;
  if($r('startBtn') && originalStartGame) $r('startBtn').onclick=()=>{originalStartGame();ensureReflectionState()};
  if($r('resetTop') && originalResetGame) $r('resetTop').onclick=originalResetGame;
}
wire();
})();