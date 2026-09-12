window.AWAI_CONFIG = {
  formEndpoint: "https://script.google.com/macros/s/AKfycbxOkXOGDj-Kk_lRskFUuzvu8WR34yc5n2YUaEEeURkuIuMfdwv2v3c2-PWrinqdj_pX/exec",
  representativeName: "仲原英孝",
  contactEmail: "fire55hide@gmail.com"
};

(() => {
  const fontLink = document.createElement('link');
  fontLink.rel = 'stylesheet';
  fontLink.href = 'https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;600&family=Shippori+Mincho:wght@400;500;600&display=swap';
  document.head.appendChild(fontLink);

  const baseStyle = document.createElement('style');
  baseStyle.textContent = `
    html{font-size:16px}
    html[data-font-size="small"]{font-size:14px}
    html[data-font-size="standard"]{font-size:16px}
    html[data-font-size="large"]{font-size:18px}
    body{font-family:"Noto Sans JP",-apple-system,BlinkMacSystemFont,"Hiragino Sans","Yu Gothic",sans-serif}
    h1,h2,h3,.brand-name,.hero-logo,.hero-descriptor,.hero-tagline,.hero-note p,.about-copy blockquote,.profile-name,.contact-lead,.footer-brand{font-family:"Shippori Mincho","Yu Mincho","Hiragino Mincho ProN",serif}
    .font-size-control{display:flex;align-items:center;gap:3px;margin-left:2px;padding:3px;border:1px solid rgba(23,41,60,.14);border-radius:999px;background:rgba(255,255,255,.72);white-space:nowrap}
    .font-size-label{font-size:.62rem;color:#697482;padding:0 5px 0 7px}
    .font-size-control button{appearance:none;border:0;background:transparent;color:#697482;font:inherit;font-size:.62rem;line-height:1;padding:7px 8px;border-radius:999px;cursor:pointer}
    .font-size-control button[aria-pressed="true"]{background:#223c55;color:#fff}
    @media(max-width:980px){.font-size-control{margin:10px 0 6px;width:max-content}}
  `;
  document.head.appendChild(baseStyle);

  const nav = document.querySelector('.site-nav');
  const navCta = nav?.querySelector('.nav-cta');
  if (nav && navCta && !nav.querySelector('.font-size-control')) {
    const control = document.createElement('div');
    control.className = 'font-size-control';
    control.setAttribute('role','group');
    control.setAttribute('aria-label','文字サイズ');
    control.innerHTML = '<span class="font-size-label">文字</span><button type="button" data-font-size="small" aria-pressed="false">小</button><button type="button" data-font-size="standard" aria-pressed="true">標準</button><button type="button" data-font-size="large" aria-pressed="false">大</button>';
    nav.insertBefore(control, navCta);
  }

  const key = 'awai-font-size';
  const allowed = new Set(['small','standard','large']);
  const applyFontSize = (size) => {
    const safe = allowed.has(size) ? size : 'standard';
    document.documentElement.dataset.fontSize = safe;
    document.querySelectorAll('[data-font-size]').forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.fontSize === safe)));
    try { localStorage.setItem(key, safe); } catch (_) {}
  };
  let initial = 'standard';
  try { const saved = localStorage.getItem(key); if (allowed.has(saved)) initial = saved; } catch (_) {}
  applyFontSize(initial);
  document.querySelectorAll('[data-font-size]').forEach((button) => button.addEventListener('click', () => applyFontSize(button.dataset.fontSize)));

  if (!location.pathname.includes('/awai-preview/integrated/')) return;

  const integratedStyle = document.createElement('style');
  integratedStyle.textContent = `
    .profile-visual{position:relative!important;overflow:hidden!important;background:#ece8e1!important;border-radius:30px!important;box-shadow:0 18px 50px rgba(44,58,72,.10)!important}
    .profile-visual:before,.profile-silhouette,.profile-silhouette:before{display:none!important;content:none!important}
    .profile-photo-img{display:block!important;width:100%!important;height:100%!important;object-fit:cover!important;object-position:center 16%!important;border:0!important}
    .hero-scene{filter:saturate(.88) contrast(.96)!important}
    .philosophy-art,.case-visual{filter:saturate(.86) contrast(.97)!important}
    .case-visual{background-blend-mode:soft-light,normal}
    @media(max-width:620px){.profile-visual{height:390px!important;border-radius:24px!important}.profile-photo-img{object-position:center 14%!important}}
  `;
  document.head.appendChild(integratedStyle);

  function applyIntegratedVisuals(){
    const hero = document.querySelector('.hero-scene');
    if (hero) {
      hero.style.backgroundImage = 'linear-gradient(90deg,rgba(248,246,241,.90) 0%,rgba(248,246,241,.70) 33%,rgba(248,246,241,.16) 61%,rgba(28,48,66,.10) 100%),url("assets/hero-watercolor.svg?v=20260912b")';
      hero.style.backgroundSize = 'cover';
      hero.style.backgroundPosition = 'center center';
    }

    const philosophy = document.querySelector('.philosophy-art');
    if (philosophy) {
      philosophy.style.backgroundImage = 'linear-gradient(90deg,rgba(249,246,241,.08),rgba(28,48,66,.02)),url("assets/philosophy-watercolor.svg?v=20260912b")';
      philosophy.style.backgroundSize = 'cover';
      philosophy.style.backgroundPosition = 'center center';
    }

    const case1 = document.querySelector('.cv-1');
    const case2 = document.querySelector('.cv-2');
    const case3 = document.querySelector('.cv-3');
    if (case1) case1.style.backgroundImage = 'linear-gradient(rgba(255,255,255,.10),rgba(23,41,60,.05)),url("assets/philosophy-watercolor.svg?v=20260912b")';
    if (case2) case2.style.backgroundImage = 'linear-gradient(rgba(255,255,255,.08),rgba(23,41,60,.05)),url("assets/hero-watercolor.svg?v=20260912b")';
    if (case3) case3.style.backgroundImage = 'linear-gradient(rgba(255,255,255,.08),rgba(23,41,60,.06)),url("assets/philosophy-watercolor.svg?v=20260912b")';

    const profileVisual = document.querySelector('.profile-visual');
    if (profileVisual) {
      profileVisual.removeAttribute('aria-hidden');
      let img = profileVisual.querySelector('img.profile-photo-img');
      if (!img || !img.getAttribute('src') || !img.getAttribute('src').includes('profile-photo.svg')) {
        profileVisual.innerHTML = '';
        img = document.createElement('img');
        img.className = 'profile-photo-img';
        img.alt = 'あわい代表 仲原英孝';
        img.decoding = 'async';
        img.loading = 'eager';
        img.src = 'assets/profile-photo.svg?v=20260912b';
        profileVisual.appendChild(img);
      }
    }
  }

  // script.js also touches the same visuals asynchronously, so re-apply the integrated design after it finishes.
  applyIntegratedVisuals();
  window.addEventListener('load', () => {
    applyIntegratedVisuals();
    [350, 900, 1800, 3200].forEach((ms) => setTimeout(applyIntegratedVisuals, ms));
  });
})();
