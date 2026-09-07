const menuButton = document.querySelector('.menu-toggle');
const siteNav = document.querySelector('.site-nav');
if (menuButton && siteNav) {
  menuButton.addEventListener('click', () => {
    const open = siteNav.classList.toggle('open');
    menuButton.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  siteNav.querySelectorAll('a').forEach(a => a.addEventListener('click', ()=>{
    siteNav.classList.remove('open');
    menuButton.setAttribute('aria-expanded', 'false');
  }));
}

const sizeButtons = document.querySelectorAll('.type-size button');
const root = document.documentElement;
const saved = localStorage.getItem('awaiTextSize') || 'medium';
root.setAttribute('data-size', saved);
sizeButtons.forEach(btn => {
  if (btn.dataset.size === saved) btn.classList.add('active');
  btn.addEventListener('click', () => {
    const size = btn.dataset.size;
    root.setAttribute('data-size', size);
    localStorage.setItem('awaiTextSize', size);
    sizeButtons.forEach(b => b.classList.toggle('active', b === btn));
  });
});


// Inquiry form submission
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
  contactForm.onsubmit = null;
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const button = contactForm.querySelector('button[type="submit"]');
    const note = contactForm.querySelector('.form-note');
    const fields = contactForm.querySelectorAll('input, select, textarea');
    const payload = {
      name: fields[0]?.value || '',
      organization: fields[1]?.value || '',
      email: fields[2]?.value || '',
      position: fields[3]?.value || '',
      situation: fields[4]?.value || '',
      goal: fields[5]?.value || '',
      source: 'あわいWebサイト'
    };
    const original = button.textContent;
    button.disabled = true;
    button.textContent = '送信しています…';
    if (note) note.textContent = '送信しています…';
    try {
      await fetch('https://script.google.com/macros/s/AKfycbxOkXOGDj-Kk_lRskFUuzvu8WR34yc5n2YUaEEeURkuIuMfdwv2v3c2-PWrinqdj_pX/exec', {
        method: 'POST', mode: 'no-cors', headers: {'Content-Type':'text/plain;charset=utf-8'}, body: JSON.stringify(payload)
      });
      contactForm.reset();
      if (note) note.textContent = 'お問い合わせを受け付けました。内容を確認のうえご連絡します。';
    } catch (err) {
      if (note) note.textContent = '送信できませんでした。fire55hide@gmail.com へ直接ご連絡ください。';
    } finally {
      button.disabled = false;
      button.textContent = original;
    }
  });
}
