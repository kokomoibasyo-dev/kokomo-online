const config = window.AWAI_CONFIG || {};

// Basic config bindings.
document.querySelectorAll('[data-config="representativeName"]').forEach((el) => {
  el.textContent = config.representativeName || '仲原英孝';
});
document.querySelectorAll('[data-config="contactEmailLink"]').forEach((el) => {
  const email = config.contactEmail || 'fire55hide@gmail.com';
  el.textContent = email;
  el.setAttribute('href', `mailto:${email}`);
});

// Mobile navigation.
const menuButton = document.querySelector('.menu-button');
const nav = document.querySelector('.site-nav');
menuButton?.addEventListener('click', () => {
  const open = nav?.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(Boolean(open)));
});
nav?.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => {
  nav.classList.remove('open');
  menuButton?.setAttribute('aria-expanded', 'false');
}));

// Reveal animation.
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });
  document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
} else {
  document.querySelectorAll('.reveal').forEach((el) => el.classList.add('visible'));
}

const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// Inquiry form.
const form = document.getElementById('inquiry-form');
const status = document.getElementById('form-status');
if (status && config.formEndpoint) {
  status.textContent = 'フォームから送信できます。送信内容は問い合わせ対応のために利用します。';
}

function buildPayload(targetForm) {
  const data = new FormData(targetForm);
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
    if (status) status.textContent = '「相談したいこと」を1つ以上選択してください。';
    return;
  }
  if (payload.website) return;

  const submitButton = form.querySelector('button[type="submit"]');
  const originalText = submitButton?.textContent || '問い合わせを送信する';

  if (!config.formEndpoint) {
    const preview = previewText(payload);
    try {
      await navigator.clipboard?.writeText(preview);
      if (status) status.textContent = '現在は送信先の設定前です。入力内容をクリップボードにコピーしました。';
    } catch (_) {
      if (status) status.textContent = '現在は送信先の設定前です。入力内容は外部へ送信されていません。';
    }
    return;
  }

  if (submitButton) {
    submitButton.disabled = true;
    submitButton.textContent = '送信しています…';
  }
  if (status) status.textContent = '送信しています…';

  try {
    await fetch(config.formEndpoint, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload)
    });
    form.reset();
    if (status) status.textContent = 'お問い合わせを受け付けました。内容を確認のうえ、必要に応じてご連絡します。';
  } catch (err) {
    console.error(err);
    if (status) status.textContent = '送信できませんでした。時間をおいて再度お試しください。';
  } finally {
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = originalText;
    }
  }
});

// Decode base64 chunks as binary before joining them. This avoids Safari/iPhone issues
// caused by concatenating independently padded base64 strings.
function cleanBase64(text) {
  return String(text || '').replace(/[^A-Za-z0-9+/=]/g, '');
}
function decodeBase64Chunk(text) {
  let s = cleanBase64(text);
  while (s.length % 4) s += '=';
  const binary = atob(s);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}
async function loadChunkedBlobUrl(urls, mime) {
  const texts = await Promise.all(urls.map(async (url) => {
    const separator = url.includes('?') ? '&' : '?';
    const response = await fetch(`${url}${separator}v=20260912b`, { cache: 'no-store' });
    if (!response.ok) throw new Error(`asset ${response.status}: ${url}`);
    return response.text();
  }));
  const chunks = texts.map(decodeBase64Chunk);
  const objectUrl = URL.createObjectURL(new Blob(chunks, { type: mime }));
  await new Promise((resolve, reject) => {
    const test = new Image();
    test.onload = resolve;
    test.onerror = reject;
    test.src = objectUrl;
  });
  return objectUrl;
}

// Representative portrait. Always use the real photo; use the vector fallback only if it fails.
(async () => {
  const profileVisual = document.querySelector('.profile-visual');
  if (!profileVisual) return;
  try {
    const src = await loadChunkedBlobUrl([
      'assets/profile-photo.1.txt',
      'assets/profile-photo.2.txt'
    ], 'image/jpeg');
    profileVisual.innerHTML = '';
    const img = document.createElement('img');
    img.className = 'profile-photo-img';
    img.alt = 'あわい代表 仲原英孝';
    img.decoding = 'async';
    img.loading = 'eager';
    img.src = src;
    profileVisual.appendChild(img);
  } catch (error) {
    console.error('Profile image failed', error);
    profileVisual.innerHTML = '<img class="profile-photo-img" src="assets/profile-photo.svg" alt="あわい代表 仲原英孝">';
  }
})();

// Higher-quality visual assets.
(async () => {
  const HQ = 'https://raw.githubusercontent.com/kokomoibasyo-dev/myLP/awai-preview/awai-preview-site/assets-hq/';
  try {
    const [heroUrl, blossomUrl, dialogueUrl] = await Promise.all([
      loadChunkedBlobUrl([`${HQ}hero-dusk.1.txt`, `${HQ}hero-dusk.2.txt`], 'image/webp'),
      loadChunkedBlobUrl([`${HQ}philosophy-blossom.1.txt`, `${HQ}philosophy-blossom.2.txt`], 'image/webp'),
      loadChunkedBlobUrl([`${HQ}dialogue-room.1.txt`, `${HQ}dialogue-room.2.txt`, `${HQ}dialogue-room.3.txt`], 'image/webp')
    ]);

    const hero = document.querySelector('.hero-scene');
    if (hero) {
      hero.style.backgroundImage = `linear-gradient(90deg,rgba(247,244,239,.60) 0%,rgba(247,244,239,.36) 34%,rgba(25,45,63,.04) 64%,rgba(25,45,63,.12) 100%),url("${heroUrl}")`;
      hero.style.backgroundSize = 'cover';
      hero.style.backgroundPosition = 'center center';
    }

    const philosophy = document.querySelector('.philosophy-art');
    if (philosophy) {
      philosophy.style.backgroundImage = `url("${blossomUrl}")`;
      philosophy.style.backgroundSize = 'cover';
      philosophy.style.backgroundPosition = 'center';
    }

    const case1 = document.querySelector('.cv-1');
    if (case1) {
      case1.style.backgroundImage = `linear-gradient(rgba(255,255,255,.08),rgba(23,41,60,.03)),url("${heroUrl}")`;
      case1.style.backgroundSize = 'cover';
      case1.style.backgroundPosition = 'center';
    }
    const case2 = document.querySelector('.cv-2');
    if (case2) {
      case2.style.backgroundImage = `linear-gradient(rgba(255,255,255,.05),rgba(23,41,60,.03)),url("${blossomUrl}")`;
      case2.style.backgroundSize = 'cover';
      case2.style.backgroundPosition = 'center';
    }
    const case3 = document.querySelector('.cv-3');
    if (case3) {
      case3.style.backgroundImage = `linear-gradient(rgba(255,255,255,.04),rgba(23,41,60,.05)),url("${dialogueUrl}")`;
      case3.style.backgroundSize = 'cover';
      case3.style.backgroundPosition = 'center';
    }
  } catch (error) {
    console.error('High-resolution images failed', error);
  }
})();

// Main-page training card: clickable entry point, but do not add a second CTA.
const serviceCards = document.querySelectorAll('.service-card');
const trainingServiceCard = serviceCards[1];
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

// Integrated preview polish.
if (location.pathname.includes('/awai-preview/integrated/')) {
  // A previous enhancement layer could add another training CTA. Keep only the one already authored in the page.
  const trainingLinks = [...document.querySelectorAll('.service-card:nth-of-type(2) a[href="training/"]')];
  trainingLinks.slice(1).forEach((link) => link.remove());

  const style = document.createElement('style');
  style.textContent = `
    /* Better typography rhythm on the integrated page */
    #services .services-layout{grid-template-columns:minmax(235px,.62fr) minmax(0,2.55fr)!important;gap:42px!important;align-items:start!important}
    #services .service-heading h2{font-size:clamp(2.15rem,3.35vw,3.35rem)!important;line-height:1.28!important;letter-spacing:.01em!important;word-break:keep-all!important;overflow-wrap:normal!important}
    #services .service-heading p{max-width:22rem!important;line-height:1.9!important}
    #services .service-card h3{font-size:1.45rem!important;line-height:1.45!important}
    #services .service-card p,#services .service-card li{font-size:.9rem!important;line-height:1.85!important}
    #services .service-note{font-size:.78rem!important;padding:12px 14px!important}

    .method-panel .section-heading h2,.pricing-panel .section-heading h2,.difference-panel .section-heading h2,.info-panel .section-heading h2{font-size:clamp(2.15rem,3.2vw,3.25rem)!important;line-height:1.35!important;word-break:keep-all!important}
    .method-card p,.price-card p,.difference-card p,.info-card p{font-size:.88rem!important;line-height:1.85!important}

    .boundary-layout{grid-template-columns:minmax(280px,.68fr) minmax(0,2.2fr)!important;gap:52px!important;align-items:start!important}
    .boundary-layout .section-heading h2{font-size:clamp(2.25rem,3.35vw,3.45rem)!important;line-height:1.35!important;word-break:keep-all!important;overflow-wrap:normal!important}
    .boundary-layout .section-heading p{max-width:18rem!important;line-height:1.8!important}
    .boundary-column h3{font-size:1.25rem!important;margin:0 0 14px!important}
    .boundary-column li{line-height:1.8!important;margin:7px 0!important}

    .about-layout{grid-template-columns:minmax(330px,.92fr) minmax(0,1.3fr)!important;gap:58px!important;align-items:center!important}
    .about-copy h2{font-size:clamp(2.35rem,3.8vw,3.75rem)!important;line-height:1.28!important;letter-spacing:.015em!important;word-break:keep-all!important;overflow-wrap:normal!important}
    .about-copy p{font-size:.96rem!important;line-height:2!important}
    .about-copy blockquote{font-size:1.18rem!important;line-height:1.75!important}

    .profile-layout{grid-template-columns:minmax(320px,.78fr) minmax(0,1.55fr)!important;gap:64px!important;align-items:center!important}
    .profile-copy h2{font-size:clamp(2.25rem,3.55vw,3.6rem)!important;line-height:1.32!important;letter-spacing:.01em!important;word-break:keep-all!important;overflow-wrap:normal!important}
    .profile-copy>p:not(.eyebrow):not(.profile-name):not(.profile-role){font-size:.98rem!important;line-height:2!important}
    .profile-role{font-size:1rem!important;line-height:1.75!important}
    .profile-visual{min-height:520px!important;height:520px!important;background:#ece9e3!important;overflow:hidden!important;border-radius:28px!important}
    .profile-photo-img{width:100%!important;height:100%!important;object-fit:cover!important;object-position:center 18%!important;display:block!important}

    .hero-copy{max-width:760px!important}
    .hero-tagline{font-size:clamp(1.45rem,2.2vw,2.15rem)!important;line-height:1.5!important}
    .hero-lead{font-size:.96rem!important;line-height:1.95!important;max-width:700px!important}
    .integrated-kicker{font-size:.72rem!important;line-height:1.6!important}

    .case-card h3{font-size:1.22rem!important;line-height:1.55!important}
    .case-card>p:not(.case-num){font-size:.9rem!important;line-height:1.9!important}
    .case-visual{background-color:#e9e7e2!important;filter:none!important;image-rendering:auto!important}
    .hero-scene,.philosophy-art{filter:none!important;image-rendering:auto!important}

    @media(max-width:980px){
      #services .services-layout,.boundary-layout,.about-layout,.profile-layout{grid-template-columns:1fr!important;gap:30px!important}
      #services .service-heading p,.boundary-layout .section-heading p{max-width:none!important}
      .profile-visual{height:460px!important;min-height:460px!important;max-width:620px!important}
    }
    @media(max-width:620px){
      #services .service-heading h2,.boundary-layout .section-heading h2,.about-copy h2,.profile-copy h2,.method-panel .section-heading h2,.pricing-panel .section-heading h2,.difference-panel .section-heading h2,.info-panel .section-heading h2{font-size:2.05rem!important;line-height:1.4!important}
      .profile-visual{height:390px!important;min-height:390px!important}
      .hero-lead{font-size:.9rem!important}
    }
  `;
  document.head.appendChild(style);
}
