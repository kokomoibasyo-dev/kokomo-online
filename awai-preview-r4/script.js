const config=window.AWAI_CONFIG||{};
document.querySelectorAll('[data-config="representativeName"]').forEach(el=>{el.textContent=config.representativeName||'仲原英孝'});
document.querySelectorAll('[data-config="contactEmailLink"]').forEach(el=>{const email=config.contactEmail||'fire55hide@gmail.com';el.textContent=email;el.setAttribute('href',`mailto:${email}`)});
const menuButton=document.querySelector('.menu-button');const nav=document.querySelector('.site-nav');menuButton?.addEventListener('click',()=>{const open=nav.classList.toggle('open');menuButton.setAttribute('aria-expanded',String(open))});nav?.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('open');menuButton?.setAttribute('aria-expanded','false')}));
const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target)}})},{threshold:.08});document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));const yearEl=document.getElementById('year');if(yearEl)yearEl.textContent=new Date().getFullYear();
const form=document.getElementById('inquiry-form');const status=document.getElementById('form-status');if(status&&config.formEndpoint)status.textContent='フォームから送信できます。送信内容は問い合わせ対応のために利用します。';
function buildPayload(form){const data=new FormData(form);return{name:String(data.get('name')||'').trim(),organization:String(data.get('organization')||'').trim(),roleDetail:String(data.get('roleDetail')||'').trim(),email:String(data.get('email')||'').trim(),region:String(data.get('region')||'').trim(),position:String(data.get('position')||'').trim(),topics:data.getAll('topic').map(String),situation:String(data.get('situation')||'').trim(),goal:String(data.get('goal')||'').trim(),timing:String(data.get('timing')||'').trim(),format:String(data.get('format')||'').trim(),budget:String(data.get('budget')||'').trim(),payer:String(data.get('payer')||'').trim(),source:String(data.get('source')||'').trim(),consent:data.get('consent')==='on',website:String(data.get('website')||'').trim(),page:location.href,userAgent:navigator.userAgent}}
function previewText(payload){return[`お名前：${payload.name}`,`団体等：${payload.organization}`,`役職等：${payload.roleDetail}`,`メール：${payload.email}`,`所在地域：${payload.region}`,`立場：${payload.position}`,`相談内容：${payload.topics.join('、')||'未選択'}`,`現在の状況：${payload.situation}`,`希望する状態：${payload.goal}`,`希望時期：${payload.timing}`,`形式：${payload.format}`,`予算：${payload.budget}`,`支払主体：${payload.payer}`,`知った経路：${payload.source}`].join('\n')}
form?.addEventListener('submit',async e=>{e.preventDefault();if(!form.reportValidity())return;const payload=buildPayload(form);if(!payload.topics.length){status.textContent='「相談したいこと」を1つ以上選択してください。';return}if(payload.website)return;const submitButton=form.querySelector('button[type="submit"]');const originalText=submitButton.textContent;if(!config.formEndpoint){const preview=previewText(payload);try{await navigator.clipboard?.writeText(preview);status.textContent='現在は送信先の設定前です。入力内容をクリップボードにコピーしました。'}catch{status.textContent='現在は送信先の設定前です。入力内容は外部へ送信されていません。'}return}submitButton.disabled=true;submitButton.textContent='送信しています…';status.textContent='送信しています…';try{await fetch(config.formEndpoint,{method:'POST',mode:'no-cors',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(payload)});form.reset();status.textContent='お問い合わせを受け付けました。内容を確認のうえ、必要に応じてご連絡します。'}catch(err){console.error(err);status.textContent='送信できませんでした。時間をおいて再度お試しください。'}finally{submitButton.disabled=false;submitButton.textContent=originalText}});

// Stable high-resolution image loader.
// Important: concatenate the base64 text FIRST, then decode once.
// Previous versions decoded each split chunk separately, which corrupted the image bytes in Safari.
(async()=>{
  const v='20260907-r4';
  async function loadSplitBase64(urls,mime){
    const texts=await Promise.all(urls.map(async url=>{
      const r=await fetch(`${url}${url.includes('?')?'&':'?'}v=${v}`,{cache:'no-store'});
      if(!r.ok)throw new Error(`asset ${r.status}: ${url}`);
      return r.text();
    }));
    const b64=texts.join('').replace(/[^A-Za-z0-9+/=]/g,'');
    const binary=atob(b64);
    const bytes=new Uint8Array(binary.length);
    for(let i=0;i<binary.length;i++)bytes[i]=binary.charCodeAt(i);
    const objectUrl=URL.createObjectURL(new Blob([bytes],{type:mime}));
    await new Promise((resolve,reject)=>{const img=new Image();img.onload=resolve;img.onerror=()=>reject(new Error(`decode failed: ${mime}`));img.src=objectUrl});
    return objectUrl;
  }

  const MYLP='https://raw.githubusercontent.com/kokomoibasyo-dev/myLP/awai-preview/awai-preview-site/assets-hq/';
  const PROFILE='https://raw.githubusercontent.com/kokomoibasyo-dev/kokomo-online/gh-pages/awai-preview-r2/assets/';
  try{
    const [hero,blossom,dialogue,profile]=await Promise.all([
      loadSplitBase64([MYLP+'hero-dusk.1.txt',MYLP+'hero-dusk.2.txt'],'image/webp'),
      loadSplitBase64([MYLP+'philosophy-blossom.1.txt',MYLP+'philosophy-blossom.2.txt'],'image/webp'),
      loadSplitBase64([MYLP+'dialogue-room.1.txt',MYLP+'dialogue-room.2.txt',MYLP+'dialogue-room.3.txt'],'image/webp'),
      loadSplitBase64([PROFILE+'profile-photo.1.txt',PROFILE+'profile-photo.2.txt'],'image/jpeg')
    ]);

    const heroEl=document.querySelector('.hero-scene');
    if(heroEl)heroEl.style.backgroundImage=`linear-gradient(90deg,rgba(247,244,239,.72) 0%,rgba(247,244,239,.50) 34%,rgba(25,45,63,.08) 64%,rgba(25,45,63,.18) 100%),url("${hero}")`;
    const philosophy=document.querySelector('.philosophy-art');
    if(philosophy)philosophy.style.backgroundImage=`url("${blossom}")`;
    const dialogueEl=document.querySelector('.dialogue');
    if(dialogueEl)dialogueEl.style.backgroundImage=`linear-gradient(90deg,rgba(226,232,235,.90) 0%,rgba(238,236,231,.86) 52%,rgba(208,218,224,.72) 100%),url("${dialogue}")`;
    const cv2=document.querySelector('.cv-2');if(cv2)cv2.style.backgroundImage=`url("${blossom}")`;
    const cv3=document.querySelector('.cv-3');if(cv3)cv3.style.backgroundImage=`linear-gradient(rgba(255,255,255,.02),rgba(23,41,60,.10)),url("${dialogue}")`;

    const pv=document.querySelector('.profile-visual');
    if(pv){pv.innerHTML='';const img=document.createElement('img');img.className='profile-photo-img';img.alt='あわい代表 仲原英孝';img.decoding='async';img.src=profile;pv.appendChild(img)}
  }catch(err){console.error('High-resolution image load failed',err)}
})();