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

    .audience-snapshot{background:#223c55;color:#fff;padding:34px 0}
    .audience-grid{display:grid;grid-template-columns:.78fr 1.22fr;gap:56px;align-items:start}
    .audience-label{font-size:.6rem;letter-spacing:.22em;color:#b9c5d0;margin:0 0 8px}
    .audience-heading{font-family:"Shippori Mincho","Yu Mincho",serif;font-size:1.2rem;line-height:1.6;letter-spacing:.04em;margin:0 0 12px}
    .audience-copy{font-size:.76rem;line-height:1.8;color:#d7dfe6;margin:0}
    .audience-tags{display:flex;flex-wrap:wrap;gap:8px;margin-top:15px}
    .audience-tags span{display:inline-flex;align-items:center;min-height:31px;padding:0 12px;border:1px solid rgba(255,255,255,.24);border-radius:999px;font-size:.7rem;color:#f4f7f9;background:rgba(255,255,255,.04)}
    .request-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px 26px;margin-top:3px}
    .request-grid p{position:relative;margin:0;padding:8px 0 8px 18px;border-bottom:1px solid rgba(255,255,255,.12);font-size:.75rem;line-height:1.55;color:#f4f7f9}
    .request-grid p:before{content:"→";position:absolute;left:0;top:8px;color:#b9c5d0;font-size:.68rem}

    .hero-copy{max-width:720px}
    .hero-tagline{max-width:690px}
    .hero-lead{max-width:720px!important}
    .hero-descriptor{font-size:1.08rem!important}

    .profile-visual{
      background-image:url("assets/profile-photo.svg")!important;
      background-size:cover!important;
      background-position:center 16%!important;
      background-repeat:no-repeat!important;
      border-radius:30px!important;
      box-shadow:0 18px 50px rgba(44,58,72,.10);
    }
    .profile-visual:before,.profile-silhouette,.profile-silhouette:before{display:none!important;content:none!important}

    .ph-center,.ph-right{
      padding:11px 15px!important;
      border-radius:12px!important;
      background:rgba(248,247,243,.86)!important;
      color:#20364c!important;
      text-shadow:none!important;
      box-shadow:0 8px 26px rgba(32,54,76,.10)!important;
      backdrop-filter:blur(5px);
      -webkit-backdrop-filter:blur(5px);
    }
    .ph-right{text-align:left!important}

    @media(max-width:1100px){.site-nav{gap:15px}.font-size-control{margin-left:0}}
    @media(max-width:980px){
      .font-size-control{margin:10px 0 6px;width:max-content}.font-size-label{font-size:.7rem}.font-size-control button{font-size:.7rem;padding:8px 10px}
      .audience-grid{grid-template-columns:1fr;gap:24px}
    }
    @media(max-width:620px){
      .audience-snapshot{padding:28px 0}
      .request-grid{grid-template-columns:1fr}
      .audience-heading{font-size:1.08rem}
      .hero-descriptor{font-size:.84rem!important;line-height:1.65}
      .hero-tagline{font-size:1.08rem!important;line-height:1.65}
      .hero-lead{font-size:.84rem;line-height:1.9}
      .hero-scene{background-position:72% center!important}
      .hero-scene:after{background:linear-gradient(90deg,rgba(248,246,242,.98) 0%,rgba(248,246,242,.94) 40%,rgba(248,246,242,.70) 57%,rgba(30,47,65,.12) 100%)!important}
      .hero-copy{max-width:76%!important}
      .profile-visual{height:390px!important;max-width:100%!important;border-radius:24px!important;background-position:center 10%!important}
      .ph-center{left:6%!important;top:48%!important;max-width:46%!important;font-size:.82rem!important;line-height:1.75!important}
      .ph-right{right:6%!important;top:29%!important;max-width:42%!important;font-size:.78rem!important;line-height:1.75!important}
      .philosophy-art small{color:#44596d!important;background:rgba(248,247,243,.72);padding:3px 6px;border-radius:6px}
    }
  `;
  document.head.appendChild(style);

  document.title = 'あわい｜教育・子ども・地域の相談・研修・企画伴走';
  const description = '学校・福祉・行政・地域団体など、子どもや地域に関わる人・組織を対象に、課題整理、職員研修、企画設計、関係機関との連携、仕組みづくりを支援します。';
  document.querySelector('meta[name="description"]')?.setAttribute('content', description);
  document.querySelector('meta[property="og:title"]')?.setAttribute('content', 'あわい｜教育・子ども・地域の相談・研修・企画伴走');
  document.querySelector('meta[property="og:description"]')?.setAttribute('content', description);

  const heroDescriptor = document.querySelector('.hero-descriptor');
  if (heroDescriptor) heroDescriptor.textContent = '教育・子ども・地域の相談・研修・企画伴走';
  const heroTagline = document.querySelector('.hero-tagline');
  if (heroTagline) heroTagline.textContent = '子どもを中心に、支える人・組織の「どうしたらいい？」を一緒に整理する。';
  const heroLead = document.querySelector('.hero-lead');
  if (heroLead) heroLead.innerHTML = '学校・福祉・行政・地域団体などを対象に、<br class="desktop">課題整理、職員研修、企画設計、関係機関との連携、仕組みづくりまで伴走します。';

  const hero = document.querySelector('.hero');
  const questions = document.querySelector('.questions');
  if (hero && questions && !document.querySelector('.audience-snapshot')) {
    const snapshot = document.createElement('section');
    snapshot.className = 'audience-snapshot';
    snapshot.setAttribute('aria-label','主な相談先と依頼内容');
    snapshot.innerHTML = `
      <div class="page-width audience-grid">
        <div>
          <p class="audience-label">WHO WE WORK WITH</p>
          <p class="audience-heading">主に、子ども・教育・地域を支える<br>人・組織からのご依頼に対応します。</p>
          <p class="audience-copy">個人の保護者相談もお受けしますが、事業の中心は「支える側への支援」です。</p>
          <div class="audience-tags" aria-label="主なご相談先">
            <span>学校・教育関係者</span><span>福祉・相談支援事業所</span><span>行政</span><span>NPO・地域団体</span><span>支援者・専門職</span>
          </div>
        </div>
        <div>
          <p class="audience-label">WHAT YOU CAN ASK</p>
          <p class="audience-heading">こんな仕事を依頼できます。</p>
          <div class="request-grid">
            <p>職員向けの研修・講座をしてほしい</p>
            <p>新しい活動・事業を一緒に設計したい</p>
            <p>学校や関係機関との連携を整理したい</p>
            <p>活動の目的・対象・成果を整理したい</p>
            <p>支援の流れや記録方法を仕組みにしたい</p>
            <p>まだ依頼内容が曖昧なので壁打ちしたい</p>
          </div>
        </div>
      </div>`;
    hero.insertAdjacentElement('afterend', snapshot);
  }

  const qHeading = document.querySelector('.questions .section-heading h2');
  if (qHeading) qHeading.innerHTML = 'こんな<br>ご相談に<br>対応します。';
  const qIntro = document.querySelector('.questions .section-heading > p:last-child');
  if (qIntro) qIntro.textContent = '依頼内容がまだ言葉になっていなくても、状況を聞きながら、何を整理・設計するとよいか一緒に考えます。';
  const bubbles = document.querySelectorAll('.question-bubbles p');
  const bubbleTexts = [
    '職員向けに、子どもの見方や関わり方を学びたい。',
    '新しい活動を始めたいが、目的や進め方が固まっていない。',
    '学校・家庭・関係機関の間で、話をどう進めるか整理したい。',
    '活動の目的・対象・成果を、説明できる形にしたい。'
  ];
  bubbles.forEach((el,i) => { if (bubbleTexts[i]) el.textContent = bubbleTexts[i]; });
  const qSide = document.querySelector('.questions-side');
  if (qSide) qSide.innerHTML = '相談から、<br>研修・企画・連携設計へ。';

  const serviceHeading = document.querySelector('.services .service-heading h2');
  if (serviceHeading) serviceHeading.innerHTML = '依頼できる<br>3つの仕事';
  const serviceIntro = document.querySelector('.services .service-heading > p:last-child');
  if (serviceIntro) serviceIntro.textContent = '相談・伴走、研修・講座、企画・仕組みづくりを基本に、課題に応じて組み合わせます。';

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
  ]).then(([heroImage, philosophy, dialogue]) => {
    const heroEl = document.querySelector('.hero-scene');
    if (heroEl) heroEl.style.backgroundImage = `linear-gradient(90deg,rgba(247,244,239,.72) 0%,rgba(247,244,239,.5) 34%,rgba(25,45,63,.08) 64%,rgba(25,45,63,.2) 100%),url("${heroImage}")`;
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