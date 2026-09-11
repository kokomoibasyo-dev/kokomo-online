const config = window.AWAI_CONFIG || {};
document.querySelectorAll('[data-config="representativeName"]').forEach((el) => {
el.textContent = config.representativeName || '仲原英孝';
});
document.querySelectorAll('[data-config="contactEmailLink"]').forEach((el) => {
const email = config.contactEmail || 'fire55hide@gmail.com';
el.textContent = email;
el.setAttribute('href', `mailto:${email}`);
});
const menuButton = document.querySelector('.menu-button');
const nav = document.querySelector('.site-nav');
menuButton?.addEventListener('click', () => {
const open = nav.classList.toggle('open');
menuButton.setAttribute('aria-expanded', String(open));
});
nav?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
nav.classList.remove('open');
menuButton?.setAttribute('aria-expanded', 'false');
}));
const observer = new IntersectionObserver((entries) => {
entries.forEach(entry => {
if (entry.isIntersecting) {
entry.target.classList.add('visible');
observer.unobserve(entry.target);
}
});
}, { threshold: 0.08 });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();
const form = document.getElementById('inquiry-form');
const status = document.getElementById('form-status');
if (status && config.formEndpoint) status.textContent = 'フォームから送信できます。送信内容は問い合わせ対応のために利用します。';
function buildPayload(form) {
const data = new FormData(form);
return {
name: String(data.get('name') || '').trim(),
organization: String(data.get('organization') || '').trim(),
roleDetail: String(data.get('roleDetail') || '').trim(),
email: String(data.get('email') || '').trim(),
region: String(data.get('region') || '').trim(),
position: String(data.get('position') || '').trim(),
topics: data.getAll('topic').map(String),
situation: String(data.get('situation') || '').trim(),
goal: String(data.get('goal') || '').trim(),
timing: String(data.get('timing') || '').trim(),
format: String(data.get('format') || '').trim(),
budget: String(data.get('budget') || '').trim(),
payer: String(data.get('payer') || '').trim(),
source: String(data.get('source') || '').trim(),
consent: data.get('consent') === 'on',
website: String(data.get('website') || '').trim(),
page: location.href,
userAgent: navigator.userAgent
};
}
function previewText(payload) {
return [
`お名前：${payload.name}`,
`団体等：${payload.organization}`,
`役職等：${payload.roleDetail}`,
`メール：${payload.email}`,
`所在地域：${payload.region}`,
`立場：${payload.position}`,
`相談内容：${payload.topics.join('、') || '未選択'}`,
`現在の状況：${payload.situation}`,
`希望する状態：${payload.goal}`,
`希望時期：${payload.timing}`,
`形式：${payload.format}`,
`予算：${payload.budget}`,
`支払主体：${payload.payer}`,
`知った経路：${payload.source}`
].join('\n');
}
form?.addEventListener('submit', async (e) => {
e.preventDefault();
if (!form.reportValidity()) return;
const payload = buildPayload(form);
if (!payload.topics.length) {
status.textContent = '「相談したいこと」を1つ以上選択してください。';
return;
}
if (payload.website) return;
const submitButton = form.querySelector('button[type="submit"]');
const originalText = submitButton.textContent;
if (!config.formEndpoint) {
const preview = previewText(payload);
try {
await navigator.clipboard?.writeText(preview);
status.textContent = '現在は送信先の設定前です。入力内容をクリップボードにコピーしました。';
} catch {
status.textContent = '現在は送信先の設定前です。入力内容は外部へ送信されていません。';
}
return;
}
submitButton.disabled = true;
submitButton.textContent = '送信しています…';
status.textContent = '送信しています…';
try {
await fetch(config.formEndpoint, {
method: 'POST',
mode: 'no-cors',
headers: { 'Content-Type': 'text/plain;charset=utf-8' },
body: JSON.stringify(payload)
});
form.reset();
status.textContent = 'お問い合わせを受け付けました。内容を確認のうえ、必要に応じてご連絡します。';
} catch (err) {
console.error(err);
status.textContent = '送信できませんでした。時間をおいて再度お試しください。';
} finally {
submitButton.disabled = false;
submitButton.textContent = originalText;
}
});

// Image repair layer: chunk files are decoded independently and joined as binary.
// This avoids malformed data URLs on iPhone/Safari when base64 chunks contain padding.
(async () => {
  const version = '20260906e';

  function cleanBase64(text) {
    return String(text || '').replace(/[^A-Za-z0-9+/=]/g, '');
  }

  function decodeBase64Chunk(text) {
    let s = cleanBase64(text);
    while (s.length % 4) s += '=';
    const binary = atob(s);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
  }

  async function loadChunkedBlobUrl(urls, mime) {
    const texts = await Promise.all(urls.map(async (url) => {
      const separator = url.includes('?') ? '&' : '?';
      const response = await fetch(`${url}${separator}v=${version}`, { cache: 'no-store' });
      if (!response.ok) throw new Error(`asset ${response.status}: ${url}`);
      return response.text();
    }));

    const chunks = texts.map(decodeBase64Chunk);
    const blob = new Blob(chunks, { type: mime });
    const objectUrl = URL.createObjectURL(blob);

    await new Promise((resolve, reject) => {
      const test = new Image();
      test.onload = resolve;
      test.onerror = () => reject(new Error(`decoded image failed: ${mime}`));
      test.src = objectUrl;
    });
    return objectUrl;
  }

  // Representative portrait.
  try {
    const profileUrl = await loadChunkedBlobUrl([
      'assets/profile-photo.1.txt',
      'assets/profile-photo.2.txt'
    ], 'image/jpeg');

    const profileVisual = document.querySelector('.profile-visual');
    if (profileVisual) {
      profileVisual.innerHTML = '';
      const img = document.createElement('img');
      img.className = 'profile-photo-img';
      img.alt = 'あわい代表 仲原英孝';
      img.decoding = 'async';
      img.src = profileUrl;
      profileVisual.appendChild(img);
    }
  } catch (error) {
    console.error('Profile image repair failed', error);
  }

  // Restore the high-resolution visual assets instead of the low-resolution SVG fallbacks.
  const HQ = 'https://raw.githubusercontent.com/kokomoibasyo-dev/myLP/awai-preview/awai-preview-site/assets-hq/';
  try {
    const [heroUrl, blossomUrl, dialogueUrl] = await Promise.all([
      loadChunkedBlobUrl([`${HQ}hero-dusk.1.txt`, `${HQ}hero-dusk.2.txt`], 'image/webp'),
      loadChunkedBlobUrl([`${HQ}philosophy-blossom.1.txt`, `${HQ}philosophy-blossom.2.txt`], 'image/webp'),
      loadChunkedBlobUrl([`${HQ}dialogue-room.1.txt`, `${HQ}dialogue-room.2.txt`, `${HQ}dialogue-room.3.txt`], 'image/webp')
    ]);

    const hero = document.querySelector('.hero-scene');
    if (hero) hero.style.backgroundImage = `linear-gradient(90deg,rgba(247,244,239,.72) 0%,rgba(247,244,239,.5) 34%,rgba(25,45,63,.08) 64%,rgba(25,45,63,.2) 100%),url("${heroUrl}")`;

    const philosophy = document.querySelector('.philosophy-art');
    if (philosophy) philosophy.style.backgroundImage = `url("${blossomUrl}")`;

    const case2 = document.querySelector('.cv-2');
    if (case2) case2.style.backgroundImage = `linear-gradient(rgba(255,255,255,.02),rgba(23,41,60,.04)),url("${blossomUrl}")`;

    const dialogue = document.querySelector('.dialogue');
    if (dialogue) dialogue.style.backgroundImage = `linear-gradient(90deg,rgba(226,232,235,.93) 0%,rgba(238,236,231,.9) 52%,rgba(208,218,224,.78) 100%),url("${dialogueUrl}")`;

    const case3 = document.querySelector('.cv-3');
    if (case3) case3.style.backgroundImage = `linear-gradient(rgba(255,255,255,.02),rgba(23,41,60,.08)),url("${dialogueUrl}")`;
  } catch (error) {
    console.error('High-resolution image repair failed', error);
  }
})();

// Make the "研修・講座" service card an entry point to the dedicated training pages.
const trainingServiceCard = document.querySelectorAll('.service-card')[1];
if (trainingServiceCard) {
  trainingServiceCard.setAttribute('role', 'link');
  trainingServiceCard.setAttribute('tabindex', '0');
  trainingServiceCard.style.cursor = 'pointer';
  const openTraining = () => { window.location.href = 'training/'; };
  trainingServiceCard.addEventListener('click', (event) => {
    if (event.target.closest('a,button,input,select,textarea')) return;
    openTraining();
  });
  trainingServiceCard.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openTraining();
    }
  });
}