window.AWAI_CONFIG = { formEndpoint: "https://script.google.com/macros/s/AKfycbxOkXOGDj-Kk_lRskFUuzvu8WR34yc5n2YUaEEeURkuIuMfdwv2v3c2-PWrinqdj_pX/exec", representativeName: "仲原英孝", contactEmail: "fire55hide@gmail.com" };

(() => {
  const fontLink = document.createElement('link');
  fontLink.rel = 'stylesheet';
  fontLink.href = 'https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;600&family=Shippori+Mincho:wght@400;500;600&display=swap';
  document.head.appendChild(fontLink);

  const style = document.createElement('style');
  style.textContent = `
    html{font-size:16px}
    html[data-font-size="small"]{font-size:14px}
    html[data-font-size="standard"]{font-size:16px}
    html[data-font-size="large"]{font-size:18px}
    body{font-family:"Noto Sans JP",-apple-system,BlinkMacSystemFont,"Hiragino Sans","Yu Gothic",sans-serif}
    h1,h2,h3,.brand-name,.hero-logo,.hero-descriptor,.hero-tagline,.hero-note p,.question-bubbles p,.dialogue-lead,.dialogue-quote,.about-copy blockquote,.ph-center,.ph-right,.profile-name,.contact-lead,.footer-brand{font-family:"Shippori Mincho","Yu Mincho","Hiragino Mincho ProN",serif}
    .font-size-control{display:flex;align-items:center;gap:3px;margin-left:2px;padding:3px;border:1px solid rgba(23,41,60,.14);border-radius:999px;background:rgba(255,255,255,.72);white-space:nowrap}
    .font-size-label{font-size:.62rem;color:#697482;padding:0 5px 0 7px}
    .font-size-control button{appearance:none;border:0;background:transparent;color:#697482;font:inherit;font-size:.62rem;line-height:1;padding:7px 8px;border-radius:999px;cursor:pointer;transition:.2s ease}
    .font-size-control button:hover{background:rgba(34,60,85,.08);color:#17293c}
    .font-size-control button[aria-pressed="true"]{background:#223c55;color:#fff}
    @media(max-width:1100px){.site-nav{gap:15px}.font-size-control{margin-left:0}}
    @media(max-width:980px){.font-size-control{margin:10px 0 6px;width:max-content}.font-size-label{font-size:.7rem}.font-size-control button{font-size:.7rem;padding:8px 10px}}
  `;
  document.head.appendChild(style);

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
  const apply = (size) => {
    const safe = allowed.has(size) ? size : 'standard';
    document.documentElement.dataset.fontSize = safe;
    document.querySelectorAll('[data-font-size]').forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.fontSize === safe)));
    try { localStorage.setItem(key, safe); } catch (_) {}
  };
  let initial = 'standard';
  try { const saved = localStorage.getItem(key); if (allowed.has(saved)) initial = saved; } catch (_) {}
  apply(initial);
  document.querySelectorAll('[data-font-size]').forEach((button) => button.addEventListener('click', () => apply(button.dataset.fontSize)));

  const HQ = 'https://raw.githubusercontent.com/kokomoibasyo-dev/myLP/awai-preview/awai-preview-site/assets-hq/';
  async function loadDataUri(parts) {
    const texts = await Promise.all(parts.map(async (name) => {
      const r = await fetch(HQ + name, { cache: 'no-cache' });
      if (!r.ok) throw new Error(`asset ${r.status}`);
      return r.text();
    }));
    return `data:image/webp;base64,${texts.join('')}`;
  }

  Promise.all([
    loadDataUri(['hero-dusk.1.txt','hero-dusk.2.txt']),
    loadDataUri(['philosophy-blossom.1.txt','philosophy-blossom.2.txt']),
    loadDataUri(['dialogue-room.1.txt','dialogue-room.2.txt','dialogue-room.3.txt'])
  ]).then(([hero, philosophy, dialogue]) => {
    const heroEl = document.querySelector('.hero-scene');
    if (heroEl) heroEl.style.backgroundImage = `linear-gradient(90deg,rgba(247,244,239,.72) 0%,rgba(247,244,239,.5) 34%,rgba(25,45,63,.08) 64%,rgba(25,45,63,.2) 100%),url("${hero}")`;
    const dialogueEl = document.querySelector('.dialogue');
    if (dialogueEl) dialogueEl.style.backgroundImage = `linear-gradient(90deg,rgba(226,232,235,.93) 0%,rgba(238,236,231,.9) 52%,rgba(208,218,224,.78) 100%),url("${dialogue}")`;
    const ph = document.querySelector('.philosophy-art');
    if (ph) ph.style.backgroundImage = `linear-gradient(90deg,rgba(249,246,241,.18),rgba(28,48,66,.04)),url("${philosophy}")`;
    const cv2 = document.querySelector('.cv-2');
    if (cv2) cv2.style.backgroundImage = `linear-gradient(rgba(255,255,255,.04),rgba(23,41,60,.08)),url("${philosophy}")`;
    const cv3 = document.querySelector('.cv-3');
    if (cv3) cv3.style.backgroundImage = `linear-gradient(rgba(255,255,255,.02),rgba(23,41,60,.12)),url("${dialogue}")`;
  }).catch((err) => console.warn('HQ preview assets could not be loaded', err));
})();