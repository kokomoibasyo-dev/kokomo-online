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

// 2026-09: consolidate the previously agreed business scope and pricing on the preferred homepage design.
(() => {
  const serviceCards = document.querySelectorAll('.service-card');

  // Navigation: make training discoverable without forcing users to scroll back to Services.
  const siteNav = document.querySelector('.site-nav');
  const contactLink = siteNav?.querySelector('.nav-cta');
  if (siteNav && contactLink && !siteNav.querySelector('a[href="training/"]')) {
    const trainingLink = document.createElement('a');
    trainingLink.href = 'training/';
    trainingLink.textContent = '講演・研修';
    siteNav.insertBefore(trainingLink, contactLink);
  }

  // 01 Consultation / accompaniment: keep the role centered on listening, organizing, options and ideas.
  const consultCard = serviceCards[0];
  if (consultCard) {
    const body = consultCard.querySelector('.service-content > p');
    if (body) body.textContent = '状況や考えを一緒に言葉にし、何が起きているのか、どんな選択肢があるのか、次に何を試せそうかを整理します。';
    const list = consultCard.querySelector('ul');
    if (list) list.innerHTML = '<li>支援・活動についての壁打ち、考えの整理</li><li>学校・関係機関との関わり方や伝え方の整理</li><li>地域資源・選択肢・アイデアの整理</li>';
    const prices = consultCard.querySelectorAll('.price-row');
    if (prices[0]) prices[0].innerHTML = '<span>60分</span><strong>10,000円</strong>';
    if (prices[1]) prices[1].innerHTML = '<span>90分</span><strong>15,000円</strong>';
    if (!consultCard.querySelector('.ongoing-price')) {
      const row = document.createElement('div');
      row.className = 'price-row ongoing-price';
      row.innerHTML = '<span>継続伴走（月1回〜）</span><strong>月額30,000円〜</strong>';
      consultCard.querySelector('.service-content')?.appendChild(row);
    }
  }

  // 02 Training: use the agreed price ladder and show a clear detail-page link.
  const trainingCard = serviceCards[1];
  if (trainingCard) {
    const body = trainingCard.querySelector('.service-content > p');
    if (body) body.textContent = '一方的に「正解」を渡すのではなく、一次資料や実践をもとに考える材料を共有し、参加者が自分たちの場合を考えられる研修・講座を設計します。';
    const list = trainingCard.querySelector('ul');
    if (list) list.innerHTML = '<li>こどもとのかかわり方・相談される準備</li><li>こどもまんなかの地域づくり</li><li>援助希求・支援アクセス・こども若者向け講座</li>';
    const prices = trainingCard.querySelectorAll('.price-row');
    if (prices[0]) prices[0].innerHTML = '<span>60分</span><strong>30,000円〜</strong>';
    if (prices[1]) prices[1].innerHTML = '<span>オーダー研修</span><strong>60,000円〜</strong>';
    if (!trainingCard.querySelector('.training-detail-link')) {
      const link = document.createElement('a');
      link.className = 'button primary training-detail-link';
      link.href = 'training/';
      link.innerHTML = '講演・研修の内容を見る <span>→</span>';
      link.style.marginTop = '18px';
      trainingCard.querySelector('.service-content')?.appendChild(link);
    }
  }

  // 03 Planning: make clear that the work is design and facilitation, not taking over the client's operations.
  const planningCard = serviceCards[2];
  if (planningCard) {
    const body = planningCard.querySelector('.service-content > p');
    if (body) body.textContent = '「誰のために」「何のために」を確認し、アイデア、役割、進め方、連携先などを実行可能な形に整理します。実施主体に代わって運営を引き受けるのではなく、自分たちで動ける型を一緒につくります。';
    const list = planningCard.querySelector('ul');
    if (list) list.innerHTML = '<li>新規活動・事業の企画整理</li><li>支援フロー・記録方法・役割の設計</li><li>既存資源との接続・実施ロードマップの整理</li>';
    const price = planningCard.querySelector('.price-row');
    if (price) price.innerHTML = '<span>企画・仕組みづくり</span><strong>50,000円〜</strong>';
  }

  // Replace the previous mediation-heavy wording with the narrower, agreed scope.
  const dialogue = document.querySelector('.dialogue');
  if (dialogue) {
    const title = dialogue.querySelector('h2');
    if (title) title.innerHTML = '学校・関係機関との<br>関わり方を整理する';
    const lead = dialogue.querySelector('.dialogue-lead');
    if (lead) lead.textContent = '「誰に、何を、どう伝えるか」を一緒に考える。';
    const paragraphs = dialogue.querySelectorAll('.dialogue-layout > div:first-child > p:not(.eyebrow):not(.dialogue-lead)');
    if (paragraphs[0]) paragraphs[0].textContent = '学校や行政、福祉機関などとの関係で迷いがあるとき、状況・論点・伝えたいことを整理し、話し合いに向けた準備をお手伝いします。';
    if (paragraphs[1]) paragraphs[1].textContent = '代理人として交渉したり、相手方に代わって意思決定したりするサービスではありません。必要に応じて、どの専門職や機関につなぐとよいかも一緒に整理します。';
    const steps = dialogue.querySelector('.dialogue-steps ol');
    if (steps) steps.innerHTML = '<li><span>01</span>状況と困りごとを聞く</li><li><span>02</span>目的・論点を整理する</li><li><span>03</span>誰に何を伝えるか考える</li><li><span>04</span>話し合い方・選択肢を整理する</li><li><span>05</span>次の一歩を決める</li>';
    const quote = dialogue.querySelector('.dialogue-quote');
    if (quote) quote.innerHTML = '代わりに決めるのではなく、<br>自分たちで進められるように。';
    const cta = dialogue.querySelector('.button.primary');
    if (cta) cta.innerHTML = '整理したいことを伝える <span>→</span>';
  }

  // Keep the inquiry form aligned with the actual scope.
  const schoolTopic = document.querySelector('input[name="topic"][value="学校連携"]')?.closest('label');
  if (schoolTopic) schoolTopic.lastChild.textContent = '学校や関係機関との関わり方・伝え方を整理したい';

  // Footer wording should match the current business positioning.
  const footerDescription = document.querySelector('.site-footer > div > p:not(.footer-brand)');
  if (footerDescription) footerDescription.textContent = '教育・子ども・地域の相談・研修・企画伴走';
})();