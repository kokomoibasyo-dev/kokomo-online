const DEFAULT_PRODUCTS = [
  {id:'curry', name:'カレー', price:300, emoji:'🍛', active:true, sort_order:1},
  {id:'juice', name:'ジュース', price:100, emoji:'🥤', active:true, sort_order:2},
  {id:'cake', name:'ケーキ', price:200, emoji:'🍰', active:true, sort_order:3},
  {id:'fries', name:'ポテト', price:150, emoji:'🍟', active:true, sort_order:4},
  {id:'pancake', name:'パンケーキ', price:250, emoji:'🥞', active:true, sort_order:5},
  {id:'ice', name:'アイス', price:120, emoji:'🍨', active:true, sort_order:6}
];
const STATUS = {
  received:{label:'注文受付',message:'ご注文を受け付けました！'},
  cooking:{label:'調理中',message:'ただいま作っています 🍳'},
  ready:{label:'できました',message:'できあがりました！お受け取りください 🙌'},
  served:{label:'提供済み',message:'ありがとうございました！'},
  cancelled:{label:'取消済み',message:'この注文は取り消されました。'}
};
const KEY='kodomo-order-v2';
const CONFIG_KEY='kodomo-order-cloud-v1';
const CLIENT_KEY='kodomo-order-client-v1';
const ALERT_KEY='kodomo-order-alert-v1';
const APP_MODE=new URLSearchParams(location.search).get('mode')||'all';
const localChannel='BroadcastChannel' in window?new BroadcastChannel('kodomo-order-v2'):null;
const clientId=getClientId();
let state=loadLocal();
let cart={};
let currentView='order';
let cloudConfig=loadCloudConfig();
let supabaseClient=null;
let realtimeChannel=null;
let pollTimer=null;
let cloudBusy=false;
let alertsEnabled=localStorage.getItem(ALERT_KEY)==='1';
let audioCtx=null;
let alertSnapshot=null;

function initialState(){return{shopName:'ここもカフェ',nextNo:1,products:structuredClone(DEFAULT_PRODUCTS),orders:[]}}
function normalizeState(s){
  const base=initialState(); if(!s||typeof s!=='object')return base;
  return {shopName:s.shopName||base.shopName,nextNo:Number(s.nextNo)||1,products:Array.isArray(s.products)&&s.products.length?s.products:base.products,orders:Array.isArray(s.orders)?s.orders:[]};
}
function loadLocal(){try{return normalizeState(JSON.parse(localStorage.getItem(KEY)))}catch{return initialState()}}
function saveLocal({broadcast=true}={}){localStorage.setItem(KEY,JSON.stringify(state));if(broadcast)localChannel?.postMessage({type:'sync'});render()}
function loadCloudConfig(){try{return JSON.parse(localStorage.getItem(CONFIG_KEY))||{}}catch{return{}}}
function saveCloudConfig(){localStorage.setItem(CONFIG_KEY,JSON.stringify(cloudConfig))}
function getClientId(){let id=localStorage.getItem(CLIENT_KEY);if(!id){id=crypto.randomUUID?.()||('client-'+Date.now()+'-'+Math.random().toString(36).slice(2));localStorage.setItem(CLIENT_KEY,id)}return id}
function cloudEnabled(){return Boolean(cloudConfig.url&&cloudConfig.key&&cloudConfig.secret)}
function yen(n){return'¥'+Number(n||0).toLocaleString('ja-JP')}
function fmtTime(iso){return new Date(iso).toLocaleTimeString('ja-JP',{hour:'2-digit',minute:'2-digit'})}
function elapsedText(iso){const m=Math.max(0,Math.floor((Date.now()-new Date(iso).getTime())/60000));return m<1?'1分未満':m+'分'}
function todayKey(d){return new Date(d).toLocaleDateString('ja-JP',{year:'numeric',month:'2-digit',day:'2-digit'})}
function toast(msg){const el=document.getElementById('toast');el.textContent=msg;el.classList.add('show');clearTimeout(toast._t);toast._t=setTimeout(()=>el.classList.remove('show'),2000)}
function escapeHtml(v=''){return String(v).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
function makeSecret(){const bytes=new Uint8Array(18);crypto.getRandomValues(bytes);return Array.from(bytes,b=>b.toString(36).padStart(2,'0')).join('').slice(0,28).toUpperCase()}
function prevStatus(s){return({cooking:'received',ready:'cooking',served:'ready'})[s]||'received'}
function base64UrlEncode(obj){return btoa(JSON.stringify(obj)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')}
function base64UrlDecode(v){const x=v.replace(/-/g,'+').replace(/_/g,'/');return JSON.parse(atob(x+'='.repeat((4-x.length%4)%4)))}
function applyInviteFromHash(){try{const h=new URLSearchParams(location.hash.slice(1));const raw=h.get('join');if(!raw)return;const d=base64UrlDecode(raw);if(d.u&&d.k&&d.s){cloudConfig={...cloudConfig,url:d.u,key:d.k,secret:d.s};saveCloudConfig();history.replaceState(null,'',location.pathname+location.search)}}catch(e){console.warn('招待URLを読み込めませんでした',e)}}
function buildInviteURL(mode){const u=new URL(location.href);u.search='';u.hash='';u.searchParams.set('mode',mode);if(cloudEnabled())u.hash='join='+base64UrlEncode({u:cloudConfig.url,k:cloudConfig.key,s:cloudConfig.secret});return u.toString()}
async function copyInvite(mode){const url=buildInviteURL(mode);try{await navigator.clipboard.writeText(url);toast('端末用リンクをコピーしました')}catch{prompt('このURLをコピーしてください',url)}}
function applyModeUI(){const allowed={order:['order','status'],staff:['order','staff'],manager:['sales'],all:['order','status','staff','sales']}[APP_MODE]||['order','status','staff','sales'];document.querySelectorAll('.tab').forEach(t=>t.classList.toggle('hidden',!allowed.includes(t.dataset.view)));const visible=[...document.querySelectorAll('.tab:not(.hidden)')];document.querySelector('.tabs').dataset.count=String(visible.length);document.getElementById('settingsBtn').classList.toggle('hidden',APP_MODE==='order'||APP_MODE==='staff');const desired=allowed.includes(currentView)?currentView:allowed[0];switchView(desired)}

async function loadSupabase(){
  if(window.supabase?.createClient)return window.supabase;
  await new Promise((resolve,reject)=>{const old=document.querySelector('script[data-supabase]');if(old){old.addEventListener('load',resolve,{once:true});old.addEventListener('error',reject,{once:true});return}const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js';s.dataset.supabase='1';s.onload=resolve;s.onerror=()=>reject(new Error('Supabaseライブラリを読み込めませんでした'));document.head.appendChild(s)});
  return window.supabase;
}
async function ensureCloudClient(){
  if(!cloudConfig.url||!cloudConfig.key)throw new Error('SupabaseのURLとanon keyを設定してください');
  if(supabaseClient)return supabaseClient;
  const lib=await loadSupabase();
  supabaseClient=lib.createClient(cloudConfig.url,cloudConfig.key,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}});
  return supabaseClient;
}
async function cloudRpc(name,args={}){const c=await ensureCloudClient();const{data,error}=await c.rpc(name,args);if(error)throw error;return data}
async function cloudLoad({silent=false,throwOnError=false}={}){
  if(!cloudEnabled()||cloudBusy)return false;
  cloudBusy=true;setSyncBadge('syncing');
  try{const data=await cloudRpc('get_shop_state',{p_secret:cloudConfig.secret});if(!data)throw new Error('共有コードに対応する店が見つかりません');state=normalizeState({shopName:data.shop_name,nextNo:data.next_order_no,products:data.products||[],orders:data.orders||[]});saveLocal({broadcast:false});setSyncBadge('cloud');if(!silent)toast('クラウドと同期しました');return true}
  catch(e){console.error(e);setSyncBadge('error');if(!silent)toast('同期できません：'+friendlyError(e));if(throwOnError)throw e;return false}
  finally{cloudBusy=false}
}
function setSyncBadge(mode){const el=document.getElementById('syncBadge');el.classList.remove('cloud','error');if(mode==='cloud'){el.textContent='クラウド同期';el.classList.add('cloud')}else if(mode==='syncing'){el.textContent='同期中…'}else if(mode==='error'){el.textContent='同期エラー';el.classList.add('error')}else{el.textContent='この端末'}}
function friendlyError(e){return e?.message?.replace('Failed to fetch','通信に失敗しました')||'エラーが発生しました'}
async function broadcastRefresh(){if(!realtimeChannel)return;try{await realtimeChannel.send({type:'broadcast',event:'refresh',payload:{at:Date.now()}})}catch{}}
async function startRealtime(){
  stopRealtime();if(!cloudEnabled())return;
  try{const c=await ensureCloudClient();realtimeChannel=c.channel('kodomo-order:'+cloudConfig.secret,{config:{broadcast:{self:false}}}).on('broadcast',{event:'refresh'},()=>cloudLoad({silent:true})).subscribe();pollTimer=setInterval(()=>cloudLoad({silent:true}),5000);setSyncBadge('cloud')}
  catch(e){console.error(e);setSyncBadge('error')}
}
function stopRealtime(){if(pollTimer)clearInterval(pollTimer);pollTimer=null;if(realtimeChannel&&supabaseClient){supabaseClient.removeChannel(realtimeChannel).catch(()=>{})}realtimeChannel=null}
async function waitCloudIdle(){while(cloudBusy)await new Promise(r=>setTimeout(r,50))}
function captureCloudFields(){cloudConfig.url=document.getElementById('supabaseUrlInput').value.trim().replace(/\/$/,'');cloudConfig.key=document.getElementById('supabaseKeyInput').value.trim();saveCloudConfig();supabaseClient=null}

function ensureAudio(){try{audioCtx=audioCtx||new (window.AudioContext||window.webkitAudioContext)();if(audioCtx.state==='suspended')audioCtx.resume()}catch{}}
function tone(freq=660,duration=.12,delay=0){if(!alertsEnabled)return;ensureAudio();if(!audioCtx)return;const o=audioCtx.createOscillator(),g=audioCtx.createGain(),t=audioCtx.currentTime+delay;o.frequency.value=freq;o.type='sine';g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.12,t+.015);g.gain.exponentialRampToValueAtTime(.0001,t+duration);o.connect(g);g.connect(audioCtx.destination);o.start(t);o.stop(t+duration+.03)}
function playAlert(kind){if(!alertsEnabled)return;if(kind==='new'){tone(620,.11,0);tone(820,.14,.14);navigator.vibrate?.([80,60,80])}else{tone(760,.10,0);tone(980,.12,.12);tone(1180,.16,.25);navigator.vibrate?.([100,50,100,50,180])}}
function updateAlertButtons(){document.querySelectorAll('[data-alert-toggle]').forEach(b=>{b.textContent=alertsEnabled?'🔔 通知ON':'🔕 通知をON';b.classList.toggle('active-alert',alertsEnabled)})}
function toggleAlerts(){alertsEnabled=!alertsEnabled;localStorage.setItem(ALERT_KEY,alertsEnabled?'1':'0');if(alertsEnabled){ensureAudio();tone(880,.12);navigator.vibrate?.(60);toast('音と振動の通知をONにしました')}else toast('通知をOFFにしました');updateAlertButtons()}
function processAlerts(){
  const orders=state.orders.map(normalizedOrder);
  const next=new Map(orders.map(o=>[o.id,{status:o.status,client_id:o.client_id,order_no:o.order_no}]));
  if(alertSnapshot){
    if(APP_MODE==='staff'||currentView==='staff'){
      const added=orders.filter(o=>!alertSnapshot.has(o.id)&&o.status==='received');
      if(added.length){playAlert('new');toast(added.length===1?'新しい注文 '+added[0].order_no+'番です':'新しい注文が'+added.length+'件あります')}
    }
    if(APP_MODE==='order'||currentView==='status'){
      const ready=orders.filter(o=>o.client_id===clientId&&o.status==='ready'&&alertSnapshot.get(o.id)?.status!=='ready');
      if(ready.length){playAlert('ready');toast('注文番号 '+ready[0].order_no+' ができました！')}
    }
  }
  alertSnapshot=next;
  updateAlertButtons();
}

function renderProducts(){
  const products=state.products.filter(p=>p.active!==false).sort((a,b)=>(a.sort_order||0)-(b.sort_order||0));
  const grid=document.getElementById('productGrid');
  grid.innerHTML=products.map(p=>{const q=cart[p.id]||0;return`<article class="product"><div class="product-emoji">${escapeHtml(p.emoji||'🍽️')}</div><div class="product-title">${escapeHtml(p.name)}</div><div class="product-bottom"><div class="price">${yen(p.price)}</div><div class="qty"><button class="icon-btn" data-dec="${escapeHtml(p.id)}" aria-label="減らす">−</button><b>${q}</b><button class="icon-btn" data-inc="${escapeHtml(p.id)}" aria-label="増やす">＋</button></div></div></article>`}).join('')||'<div class="empty">商品がありません。設定から商品を追加できます。</div>';
  grid.querySelectorAll('[data-inc]').forEach(b=>b.onclick=()=>{cart[b.dataset.inc]=(cart[b.dataset.inc]||0)+1;renderProducts();cartSummary()});
  grid.querySelectorAll('[data-dec]').forEach(b=>b.onclick=()=>{cart[b.dataset.dec]=Math.max(0,(cart[b.dataset.dec]||0)-1);renderProducts();cartSummary()});
}
function cartSummary(){let count=0,total=0;for(const p of state.products){const q=cart[p.id]||0;count+=q;total+=q*Number(p.price||0)}document.getElementById('cartCount').textContent=count;document.getElementById('cartTotal').textContent=yen(total);const btn=document.getElementById('orderBtn');btn.disabled=count===0;btn.style.opacity=count===0?'.5':'1'}
async function placeOrder(){
  const items=state.products.map(p=>({id:p.id,name:p.name,price:Number(p.price),emoji:p.emoji,qty:cart[p.id]||0})).filter(x=>x.qty>0);if(!items.length)return;
  const total=items.reduce((s,x)=>s+x.price*x.qty,0);document.getElementById('orderBtn').disabled=true;
  try{
    if(cloudEnabled()){
      const reqItems=items.map(i=>({id:i.id,qty:i.qty}));const order=await cloudRpc('create_order',{p_secret:cloudConfig.secret,p_client_id:clientId,p_items:reqItems});cart={};await cloudLoad({silent:true});await broadcastRefresh();toast(`注文番号 ${order.order_no} を受け付けました`);
    }else{
      const order={id:crypto.randomUUID?.()||String(Date.now()),no:state.nextNo++,order_no:state.nextNo-1,client_id:clientId,createdAt:new Date().toISOString(),created_at:new Date().toISOString(),status:'received',items,total};state.orders.unshift(order);cart={};saveLocal();toast(`注文番号 ${order.order_no} を受け付けました`)
    }
    switchView('status');
  }catch(e){console.error(e);toast('注文できません：'+friendlyError(e));render()}
}
function normalizedOrder(o){return{...o,no:o.order_no??o.no,order_no:o.order_no??o.no,createdAt:o.created_at||o.createdAt,client_id:o.client_id||''}}
function orderCard(raw,staff=false){
  const o=normalizedOrder(raw),st=STATUS[o.status]||STATUS.received,wait=staff&&o.status!=='served'?' ・ 待ち '+elapsedText(o.createdAt):'';const items=(o.items||[]).map(i=>`<li><span>${escapeHtml(i.emoji||'')} ${escapeHtml(i.name)} × ${Number(i.qty)}</span><span>${yen(Number(i.price)*Number(i.qty))}</span></li>`).join('');
  const buttons=staff?`<div class="actions">${o.status==='received'?`<button class="primary" data-status="${o.id}:cooking">調理中にする</button>`:''}${o.status==='cooking'?`<button class="success" data-status="${o.id}:ready">できました</button>`:''}${o.status==='ready'?`<button class="primary" data-status="${o.id}:served">提供済みにする</button>`:''}${['cooking','ready'].includes(o.status)?`<button class="secondary" data-status="${o.id}:${prevStatus(o.status)}">ひとつ戻す</button>`:''}${['received','cooking','ready'].includes(o.status)?`<button class="danger-outline" data-status="${o.id}:cancelled">注文を取り消す</button>`:''}</div>`:`<p><b>${escapeHtml(st.message)}</b></p>`;
  return`<article class="panel"><div class="order-head"><div><div class="order-no">注文番号 ${o.order_no}</div><div class="muted small">${fmtTime(o.createdAt)}${wait}</div></div><span class="status" data-s="${escapeHtml(o.status)}">${escapeHtml(st.label)}</span></div><ul class="order-items">${items}</ul><div class="row"><b>合計 ${yen(o.total)}</b></div><div class="spacer"></div>${buttons}</article>`
}
function renderStatus(){const el=document.getElementById('statusList');const mine=state.orders.map(normalizedOrder).filter(o=>o.client_id===clientId).slice(0,12);el.innerHTML=mine.length?mine.map(o=>orderCard(o,false)).join(''):'<div class="empty">この端末からの注文はまだありません。</div>'}
function renderStaff(){
  const el=document.getElementById('staffList'),orders=state.orders.map(normalizedOrder),active=orders.filter(o=>!['served','cancelled'].includes(o.status)).sort((a,b)=>new Date(a.createdAt)-new Date(b.createdAt)),done=orders.filter(o=>['served','cancelled'].includes(o.status)).slice(0,6);document.getElementById('staffCount').textContent=active.length?String(active.length):'';
  const ready=active.filter(o=>o.status==='ready'),board=document.getElementById('readyBoard'),nums=document.getElementById('readyNumbers');
  if(ready.length){board.classList.remove('hidden');nums.innerHTML=ready.map(o=>'<span class="ready-no">'+escapeHtml(o.order_no)+'</span>').join('')}else{board.classList.add('hidden');nums.innerHTML=''}
  el.innerHTML=(active.length?active.map(o=>orderCard(o,true)).join(''):'<div class="empty">対応中の注文はありません。</div>')+(done.length?`<h2>完了・取消</h2>${done.map(o=>orderCard(o,true)).join('')}`:'');
  el.querySelectorAll('[data-status]').forEach(b=>b.onclick=()=>updateStatusFromButton(b))
}
async function updateStatusFromButton(b){const[id,status]=b.dataset.status.split(':');if(status==='cancelled'&&!confirm('この注文だけを取り消しますか？'))return;b.disabled=true;try{if(cloudEnabled()){await cloudRpc('update_order_status',{p_secret:cloudConfig.secret,p_order_id:id,p_status:status});await cloudLoad({silent:true});await broadcastRefresh()}else{const o=state.orders.find(x=>x.id===id);if(o){o.status=status;saveLocal()}}const o=state.orders.find(x=>x.id===id);toast(`${o?.order_no??o?.no??''}番を「${STATUS[status].label}」にしました`)}catch(e){console.error(e);toast('更新できません：'+friendlyError(e));render()}}
function renderSales(){
  const today=todayKey(new Date()),served=state.orders.map(normalizedOrder).filter(o=>o.status==='served'&&todayKey(o.createdAt)===today);const total=served.reduce((s,o)=>s+Number(o.total||0),0),count=served.reduce((s,o)=>s+(o.items||[]).reduce((a,i)=>a+Number(i.qty||0),0),0);document.getElementById('salesTotal').textContent=yen(total);document.getElementById('servedCount').textContent=served.length+'件';document.getElementById('itemsSold').textContent=count+'点';const by={};state.products.forEach(p=>by[p.id]={...p,qty:0,sales:0});served.forEach(o=>(o.items||[]).forEach(i=>{if(!by[i.id])by[i.id]={...i,qty:0,sales:0};by[i.id].qty+=Number(i.qty);by[i.id].sales+=Number(i.qty)*Number(i.price)}));const rows=Object.values(by).sort((a,b)=>b.qty-a.qty).map(x=>`<div class="panel row"><div><b>${escapeHtml(x.emoji||'')} ${escapeHtml(x.name)}</b><div class="muted small">${x.qty}点</div></div><b>${yen(x.sales)}</b></div>`).join('');document.getElementById('productSales').innerHTML=rows||'<div class="empty">提供済みになると売上に記録されます。</div>'
}
function renderSettings(){
  document.getElementById('shopNameInput').value=state.shopName||'';document.getElementById('supabaseUrlInput').value=cloudConfig.url||'';document.getElementById('supabaseKeyInput').value=cloudConfig.key||'';document.getElementById('shopSecretInput').value=cloudConfig.secret||'';
  const summary=document.getElementById('connectionSummary');summary.innerHTML=cloudEnabled()?`<b>☁️ クラウド同期中</b><span class="muted small">同じSupabase接続情報と共有コードを設定した端末で同期します。</span><div class="code">共有コード：${escapeHtml(cloudConfig.secret)}</div><button type="button" class="secondary small" id="copySecretBtn" style="margin-top:8px">共有コードをコピー</button>`:`<b>📱 この端末だけで使用中</b><span class="muted small">まずはままごとで試せます。複数端末利用は下の「クラウド接続を設定する」から。</span>`;
  document.getElementById('copySecretBtn')?.addEventListener('click',async()=>{await navigator.clipboard?.writeText(cloudConfig.secret);toast('共有コードをコピーしました')});
  const ed=document.getElementById('productEditor');ed.innerHTML=state.products.sort((a,b)=>(a.sort_order||0)-(b.sort_order||0)).map((p,idx)=>`<div class="product-edit" data-product="${escapeHtml(p.id)}"><label>絵文字<input class="emoji-input" data-field="emoji" maxlength="4" value="${escapeHtml(p.emoji||'')}" /></label><label>商品名<input data-field="name" maxlength="30" value="${escapeHtml(p.name)}" /></label><label>価格<input data-field="price" type="number" min="0" step="10" value="${Number(p.price||0)}" /></label><label class="active-check">販売中 <input data-field="active" type="checkbox" ${p.active!==false?'checked':''} /></label><button type="button" class="danger-outline remove-product" data-remove="${escapeHtml(p.id)}">削除</button></div>`).join('')||'<div class="empty">商品がありません。</div>';
  ed.querySelectorAll('[data-field]').forEach(inp=>inp.addEventListener('change',()=>saveProductEditorRow(inp.closest('[data-product]'))));ed.querySelectorAll('[data-remove]').forEach(btn=>btn.onclick=()=>removeProduct(btn.dataset.remove));
  document.querySelectorAll('[data-copy-mode]').forEach(btn=>btn.onclick=()=>copyInvite(btn.dataset.copyMode));
}
async function saveProductEditorRow(row){const id=row.dataset.product,p=state.products.find(x=>x.id===id);if(!p)return;const inputs=[...row.querySelectorAll('[data-field]')];const val=n=>{const i=inputs.find(x=>x.dataset.field===n);return i?.type==='checkbox'?i.checked:i?.value};p.emoji=val('emoji')||'🍽️';p.name=(val('name')||'').trim()||'商品';p.price=Math.max(0,Number(val('price'))||0);p.active=Boolean(val('active'));try{if(cloudEnabled()){await cloudRpc('upsert_product',{p_secret:cloudConfig.secret,p_product_id:isUuid(id)?id:null,p_name:p.name,p_price:p.price,p_emoji:p.emoji,p_sort_order:p.sort_order||1,p_active:p.active});await cloudLoad({silent:true});await broadcastRefresh()}else saveLocal();toast('商品を保存しました')}catch(e){toast('商品を保存できません：'+friendlyError(e));await cloudLoad({silent:true})}renderSettings()}
function isUuid(v){return/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v)}
async function addProduct(){const temp={id:'local-'+(crypto.randomUUID?.()||String(Date.now())),name:'新しい商品',price:100,emoji:'🍽️',active:true,sort_order:(Math.max(0,...state.products.map(p=>p.sort_order||0))+1)};try{if(cloudEnabled()){await cloudRpc('upsert_product',{p_secret:cloudConfig.secret,p_product_id:null,p_name:temp.name,p_price:temp.price,p_emoji:temp.emoji,p_sort_order:temp.sort_order,p_active:true});await cloudLoad({silent:true});await broadcastRefresh()}else{state.products.push(temp);saveLocal()}renderSettings();render();toast('商品を追加しました')}catch(e){toast('追加できません：'+friendlyError(e))}}
async function removeProduct(id){if(!confirm('この商品を削除しますか？'))return;try{if(cloudEnabled()){await cloudRpc('delete_product',{p_secret:cloudConfig.secret,p_product_id:id});await cloudLoad({silent:true});await broadcastRefresh()}else{state.products=state.products.filter(p=>p.id!==id);delete cart[id];saveLocal()}renderSettings();render();toast('商品を削除しました')}catch(e){toast('削除できません：'+friendlyError(e))}}
async function saveShopName(){const name=document.getElementById('shopNameInput').value.trim()||'こどものお店';try{if(cloudEnabled()){await cloudRpc('update_shop_name',{p_secret:cloudConfig.secret,p_name:name});await cloudLoad({silent:true});await broadcastRefresh()}else{state.shopName=name;saveLocal()}renderSettings();toast('お店の名前を保存しました')}catch(e){toast('保存できません：'+friendlyError(e))}}
function render(){document.getElementById('shopName').textContent=state.shopName;renderProducts();cartSummary();renderStatus();renderStaff();renderSales();if(document.getElementById('settingsDialog').open)renderSettings();if(!cloudEnabled())setSyncBadge('local');applyModeUI();processAlerts()}
function switchView(v,{scroll=true}={}){const changed=currentView!==v;currentView=v;['order','status','staff','sales'].forEach(x=>document.getElementById('view-'+x).classList.toggle('hidden',x!==v));document.querySelectorAll('.tab').forEach(t=>t.classList.toggle('active',t.dataset.view===v));if(scroll&&changed)window.scrollTo({top:0,behavior:'smooth'})}

async function saveCloudConnectionFields(){stopRealtime();await waitCloudIdle();captureCloudFields();toast('接続情報を保存しました');renderSettings();if(cloudEnabled()){await cloudLoad({silent:true});await startRealtime()}}
async function createCloudShop(){
  stopRealtime();await waitCloudIdle();captureCloudFields();if(!cloudConfig.url||!cloudConfig.key){toast('SupabaseのURLとanon keyが必要です');return}const secret=makeSecret();const name=document.getElementById('shopNameInput').value.trim()||state.shopName;
  try{const data=await cloudRpc('create_shop',{p_name:name,p_secret:secret,p_products:state.products.map((p,i)=>({name:p.name,price:Number(p.price)||0,emoji:p.emoji||'🍽️',sort_order:p.sort_order||i+1,active:p.active!==false}))});cloudConfig.secret=secret;cloudConfig.shopId=data.shop_id;saveCloudConfig();await cloudLoad({silent:true,throwOnError:true});await startRealtime();renderSettings();toast('クラウドのお店を作りました')}
  catch(e){console.error(e);toast('クラウド化できません：'+friendlyError(e))}
}
async function joinCloudShop(){
  stopRealtime();await waitCloudIdle();captureCloudFields();const secret=document.getElementById('shopSecretInput').value.trim().toUpperCase();if(!secret){toast('共有コードを入力してください');return}cloudConfig.secret=secret;saveCloudConfig();
  try{await cloudLoad({silent:true,throwOnError:true});await startRealtime();renderSettings();toast('お店に参加しました')}
  catch(e){cloudConfig.secret='';saveCloudConfig();setSyncBadge('local');renderSettings();toast('参加できません：'+friendlyError(e))}
}
async function clearCloud(){if(!confirm('この端末のクラウド接続設定を解除しますか？クラウド上の注文は削除されません。'))return;stopRealtime();cloudConfig={};saveCloudConfig();supabaseClient=null;state=loadLocal();setSyncBadge('local');renderSettings();render();toast('クラウド設定を解除しました')}
function exportSalesCsv(){const today=todayKey(new Date());const served=state.orders.map(normalizedOrder).filter(o=>o.status==='served'&&todayKey(o.createdAt)===today);const rows=[['注文番号','時刻','商品','数量','単価','小計']];served.slice().reverse().forEach(o=>(o.items||[]).forEach(i=>rows.push([o.order_no,fmtTime(o.createdAt),i.name,i.qty,i.price,Number(i.qty)*Number(i.price)])));const csv='\ufeff'+rows.map(r=>r.map(v=>'"'+String(v??'').replace(/"/g,'""')+'"').join(',')).join('\n');const blob=new Blob([csv],{type:'text/csv;charset=utf-8'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='kodomo-order-'+new Date().toISOString().slice(0,10)+'.csv';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);toast('売上CSVを書き出しました')}
async function resetData(){if(!confirm('注文・売上データをすべて消しますか？商品は残ります。'))return;const word=prompt('誤操作防止のため「リセット」と入力してください');if(word!=='リセット'){toast('リセットを中止しました');return}try{if(cloudEnabled()){await cloudRpc('reset_shop_orders',{p_secret:cloudConfig.secret});await cloudLoad({silent:true});await broadcastRefresh()}else{state.orders=[];state.nextNo=1;saveLocal()}renderSettings();render();toast('注文と売上をリセットしました')}catch(e){toast('リセットできません：'+friendlyError(e))}}

window.addEventListener('storage',e=>{if(e.key===KEY&&!cloudEnabled()){state=loadLocal();render()}});localChannel?.addEventListener('message',()=>{if(!cloudEnabled()){state=loadLocal();render()}});
applyInviteFromHash();document.querySelectorAll('.tab').forEach(t=>t.onclick=()=>switchView(t.dataset.view));document.querySelectorAll('[data-alert-toggle]').forEach(b=>b.onclick=toggleAlerts);document.getElementById('orderBtn').onclick=placeOrder;document.getElementById('exportSalesBtn').onclick=exportSalesCsv;
const dialog=document.getElementById('settingsDialog');document.getElementById('settingsBtn').onclick=()=>{renderSettings();dialog.showModal()};document.getElementById('saveShopNameBtn').onclick=saveShopName;document.getElementById('addProductBtn').onclick=addProduct;document.getElementById('saveCloudConfigBtn').onclick=saveCloudConnectionFields;document.getElementById('createCloudShopBtn').onclick=createCloudShop;document.getElementById('joinCloudShopBtn').onclick=joinCloudShop;document.getElementById('clearCloudConfigBtn').onclick=clearCloud;document.getElementById('resetBtn').onclick=resetData;document.getElementById('fullscreenBtn').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen()}catch{toast('このブラウザでは全画面表示できません')}};
if('serviceWorker'in navigator)navigator.serviceWorker.register('./sw.js').catch(()=>{});
render();setInterval(()=>{if(currentView==='staff')renderStaff()},30000);if(cloudEnabled()){cloudLoad({silent:true}).then(startRealtime)}