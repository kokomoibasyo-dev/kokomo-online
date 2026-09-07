(()=>{
const css=`
/* r12: raster-free decorative visuals + reliable profile photo */
.hero-image>img,.service-card>img,.dialogue-image>img,.philosophy-art>img{display:none!important}
.hero-image{background:linear-gradient(180deg,#f6e1d5 0%,#dce6ec 48%,#adc0ce 70%,#647b8c 100%);overflow:hidden}
.awai-scene{position:absolute;inset:0;overflow:hidden}
.awai-scene .sun{position:absolute;width:34vw;height:34vw;max-width:520px;max-height:520px;min-width:260px;min-height:260px;border-radius:50%;left:43%;top:3%;background:radial-gradient(circle,rgba(255,236,213,.95) 0%,rgba(237,184,161,.35) 45%,rgba(237,184,161,0) 70%)}
.awai-scene .mountain{position:absolute;right:-6%;bottom:18%;width:52%;height:42%;background:linear-gradient(145deg,rgba(65,86,103,.18),rgba(40,62,79,.56));clip-path:polygon(18% 100%,38% 46%,56% 69%,72% 28%,100% 65%,100% 100%)}
.awai-scene .shore{position:absolute;left:0;right:0;bottom:0;height:34%;background:linear-gradient(180deg,rgba(126,155,172,.08),rgba(54,78,96,.55));border-top:1px solid rgba(255,255,255,.42)}
.awai-scene .horizon{position:absolute;left:0;right:0;bottom:31%;height:2px;background:rgba(255,255,255,.56);box-shadow:0 13px 30px rgba(255,228,211,.5)}
.awai-scene .veil{position:absolute;border-radius:48% 52% 60% 40%/54% 44% 56% 46%;transform:rotate(18deg);mix-blend-mode:multiply}
.awai-scene .v1{width:42%;height:80%;left:-9%;top:-18%;background:rgba(210,220,226,.52)}
.awai-scene .v2{width:46%;height:73%;left:27%;top:-24%;background:rgba(238,194,172,.28);transform:rotate(-15deg)}
.awai-scene .v3{width:43%;height:83%;right:-8%;top:-5%;background:rgba(161,179,196,.42);transform:rotate(21deg)}
.awai-scene .people{position:absolute;right:14%;bottom:16%;width:230px;height:190px;filter:drop-shadow(0 10px 16px rgba(27,43,56,.18))}
.awai-scene .person{position:absolute;bottom:0;width:66px;height:128px;background:linear-gradient(180deg,#536575,#2d4355);border-radius:34px 34px 12px 12px;opacity:.92}
.awai-scene .person:before{content:'';position:absolute;width:39px;height:39px;border-radius:50%;left:13px;top:-28px;background:#3b5061}
.awai-scene .p1{left:8px;height:92px;width:46px;border-radius:25px 25px 10px 10px}.awai-scene .p1:before{width:30px;height:30px;left:8px;top:-23px}
.awai-scene .p2{left:72px}.awai-scene .p3{left:150px;height:118px}
.hero:after{background:linear-gradient(90deg,rgba(247,244,239,.93) 0%,rgba(247,244,239,.75) 36%,rgba(247,244,239,.18) 62%,rgba(25,45,63,.08) 100%)!important}
.service-card{position:relative;padding-top:18px}.service-card:before{content:'';display:block;height:7px;margin:-18px 0 0;background:linear-gradient(90deg,rgba(223,185,166,.58),rgba(174,194,209,.72),rgba(239,232,220,.4))}
.dialogue-image{min-height:390px!important;background:linear-gradient(145deg,#f7f3ed,#e5edf2);display:grid;place-items:center;padding:34px!important}
.awai-flow{width:100%;display:grid;grid-template-columns:1fr auto 1fr auto 1fr;gap:12px;align-items:center}
.awai-flow .node{min-height:120px;border:1px solid rgba(23,41,60,.12);background:rgba(255,255,255,.72);border-radius:24px;display:grid;place-items:center;text-align:center;padding:18px;font-family:'Shippori Mincho','Yu Mincho',serif;color:#263b50;box-shadow:0 12px 30px rgba(36,53,77,.06)}
.awai-flow .arrow{font-size:1.5rem;color:#8a9aaa}.awai-flow .node strong{display:block;font-size:1.05rem;margin-bottom:6px}.awai-flow .node small{font-family:system-ui,sans-serif;color:#73808d;line-height:1.5}
.philosophy-art{background:linear-gradient(135deg,#f4e8df 0%,#e9eff3 55%,#dbe2e9 100%);isolation:isolate}
.philosophy-art:before,.philosophy-art:after{content:'';position:absolute;border-radius:50%;z-index:0}
.philosophy-art:before{width:70%;height:92%;left:-8%;top:4%;background:rgba(229,194,180,.34);transform:rotate(-22deg)}
.philosophy-art:after{width:64%;height:94%;right:-8%;bottom:-12%;background:rgba(160,181,199,.43);transform:rotate(27deg)}
.awai-orbit{position:absolute;border-radius:50%;background:rgba(255,255,255,.28);border:1px solid rgba(255,255,255,.48);z-index:0}
.awai-orbit.o1{width:46%;height:78%;left:28%;top:-10%;transform:rotate(28deg)}.awai-orbit.o2{width:54%;height:74%;right:-18%;top:12%;transform:rotate(-18deg)}
.ph-center,.ph-right,.philosophy-art small{z-index:2!important;color:#20364c!important;text-shadow:0 1px 2px rgba(255,255,255,.98),0 0 14px rgba(255,255,255,.88)!important}
.profile-visual{background:#f1eee8!important;max-width:360px!important;height:auto!important;aspect-ratio:4/5!important;margin-inline:auto}
.profile-visual img{display:block!important;width:100%!important;height:100%!important;object-fit:cover!important;object-position:center 12%!important;opacity:0;transition:opacity .2s ease}
.profile-visual img.profile-ready{opacity:1}
@media(max-width:760px){.awai-scene .people{right:3%;bottom:14%;transform:scale(.72);transform-origin:right bottom}.hero:after{background:linear-gradient(90deg,rgba(247,244,239,.94),rgba(247,244,239,.58) 68%,rgba(247,244,239,.16))!important}.awai-flow{grid-template-columns:1fr;gap:10px}.awai-flow .arrow{transform:rotate(90deg);text-align:center}.dialogue-image{min-height:0!important}.profile-visual{max-width:310px!important}}
`;
const st=document.createElement('style');st.textContent=css;document.head.appendChild(st);

const hero=document.querySelector('.hero-image');
if(hero) hero.innerHTML=`<div class="awai-scene" aria-hidden="true"><span class="sun"></span><span class="mountain"></span><span class="shore"></span><span class="horizon"></span><span class="veil v1"></span><span class="veil v2"></span><span class="veil v3"></span><div class="people"><span class="person p1"></span><span class="person p2"></span><span class="person p3"></span></div></div>`;
const dialogue=document.querySelector('.dialogue-image');
if(dialogue) dialogue.innerHTML=`<div class="awai-flow" aria-label="相談から対話までの流れ"><div class="node"><div><strong>相談者</strong><small>状況・願いを<br>言葉にする</small></div></div><div class="arrow">→</div><div class="node"><div><strong>あわい</strong><small>論点・選択肢・<br>共有範囲を整理</small></div></div><div class="arrow">→</div><div class="node"><div><strong>学校・関係機関</strong><small>子どもを中心に<br>対話をつくる</small></div></div></div>`;
const philosophy=document.querySelector('.philosophy-art');
if(philosophy){const img=philosophy.querySelector('img');if(img)img.remove();philosophy.insertAdjacentHTML('afterbegin','<span class="awai-orbit o1"></span><span class="awai-orbit o2"></span>');}

const menuButton=document.querySelector('.menu-button'),nav=document.querySelector('.site-nav');
menuButton?.addEventListener('click',()=>{const open=nav.classList.toggle('open');menuButton.setAttribute('aria-expanded',String(open));});
nav?.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('open');menuButton?.setAttribute('aria-expanded','false');}));
const key='awai-font-size',allowed=new Set(['small','standard','large']);
const apply=size=>{const safe=allowed.has(size)?size:'standard';document.documentElement.dataset.fontSize=safe;document.querySelectorAll('[data-font-size]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.fontSize===safe)));try{localStorage.setItem(key,safe)}catch(_){}};
let initial='standard';try{const saved=localStorage.getItem(key);if(allowed.has(saved))initial=saved}catch(_){}apply(initial);document.querySelectorAll('[data-font-size]').forEach(b=>b.addEventListener('click',()=>apply(b.dataset.fontSize)));
const year=document.getElementById('year');if(year)year.textContent=new Date().getFullYear();

async function loadProfile(){const img=document.querySelector('.profile-visual img');if(!img)return;try{const base='https://raw.githubusercontent.com/kokomoibasyo-dev/kokomo-online/gh-pages/awai-preview/assets/';const [a,b]=await Promise.all(['profile-photo.1.txt','profile-photo.2.txt'].map(async n=>{const r=await fetch(base+n,{cache:'force-cache'});if(!r.ok)throw new Error(String(r.status));return r.text();}));img.onload=()=>img.classList.add('profile-ready');img.src='data:image/jpeg;base64,'+(a+b).replace(/\s/g,'');}catch(e){console.error('profile image failed',e);}}
loadProfile();

const form=document.getElementById('inquiry-form'),status=document.getElementById('form-status');const endpoint='https://script.google.com/macros/s/AKfycbxOkXOGDj-Kk_lRskFUuzvu8WR34yc5n2YUaEEeURkuIuMfdwv2v3c2-PWrinqdj_pX/exec';
form?.addEventListener('submit',async e=>{e.preventDefault();if(!form.reportValidity())return;const data=new FormData(form);const payload={name:String(data.get('name')||'').trim(),organization:String(data.get('organization')||'').trim(),email:String(data.get('email')||'').trim(),position:String(data.get('position')||'').trim(),situation:String(data.get('situation')||'').trim(),goal:String(data.get('goal')||'').trim(),page:location.href,userAgent:navigator.userAgent};const btn=form.querySelector('button[type="submit"]'),original=btn.textContent;btn.disabled=true;btn.textContent='送信しています…';if(status)status.textContent='送信しています…';try{await fetch(endpoint,{method:'POST',mode:'no-cors',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(payload)});form.reset();if(status)status.textContent='お問い合わせを受け付けました。内容を確認のうえ、必要に応じてご連絡します。';}catch(err){console.error(err);if(status)status.textContent='送信できませんでした。fire55hide@gmail.com へ直接ご連絡ください。';}finally{btn.disabled=false;btn.textContent=original;}});
})();
