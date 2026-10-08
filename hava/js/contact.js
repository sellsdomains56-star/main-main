/* Contact page: two ways to reach HAVA, "Get a quote" and "Book a meeting".
   contact.html#meeting opens the meeting form; #quote, #still, #sparkling, #cans, #gift and #dist open the
   quote form (the last five also pick what the visitor is interested in). */
(() => {
  // Where requests go once the site is live (e.g. a Formspree URL). Empty = thank-you message only.
  const ORDER_ENDPOINT = '';
  // A booking page (e.g. Calendly). When set, "Book a meeting" opens it instead of showing the meeting form.
  const CALENDAR_URL = '';

  const { t } = window.HAVA;
  const forms = { quote: document.getElementById('quote-form'), meeting: document.getElementById('meeting-form') };
  const tabs = [...document.querySelectorAll('.tabs [data-tab]')];
  const confirmBox = document.getElementById('form-confirm');
  const interest = document.getElementById('q-interest');
  const date = document.getElementById('m-date');
  const tzNote = document.getElementById('tz-note');
  const timeZone = (() => { try { return Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch (e) { return ''; } })();

  function show(kind) {
    if (kind === 'meeting' && CALENDAR_URL) { window.open(CALENDAR_URL, '_blank', 'noopener'); return; }
    tabs.forEach(b => b.setAttribute('aria-selected', String(b.dataset.tab === kind)));
    Object.entries(forms).forEach(([k, f]) => { f.hidden = k !== kind; });
    confirmBox.hidden = true;
  }
  document.querySelectorAll('[data-tab]').forEach(el => el.addEventListener('click', e => {
    e.preventDefault();
    e.stopPropagation();
    show(el.dataset.tab);
    if (el.closest('.ways')) document.querySelector('.panel').scrollIntoView({ behavior: window.HAVA.reduceMotion ? 'auto' : 'smooth', block: 'center' });
  }));

  // Footer links to contact.html#quote or #meeting while already on this page.
  window.addEventListener('hashchange', () => {
    const h = window.location.hash.slice(1);
    if (h === 'meeting' || h === 'quote') show(h);
  });

  // From the address: #meeting, #quote or a product.
  const hash = window.location.hash.slice(1);
  if (hash === 'meeting') show('meeting');
  else if ([...interest.options].some(o => o.value === hash)) interest.value = hash;

  // Meetings: from today on; the first weekday from tomorrow is suggested.
  const iso = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const today = new Date();
  date.min = iso(today);
  const next = new Date(today);
  do { next.setDate(next.getDate() + 1); } while (next.getDay() === 0 || next.getDay() === 6);
  date.value = iso(next);
  document.getElementById('m-time').value = '10:00';

  const say = (form, key) => { form.querySelector('.form-error').textContent = key ? t(key) : ''; };
  async function submit(e) {
    e.preventDefault();
    const form = e.currentTarget;
    const kind = form.dataset.kind;
    say(form, '');
    const name = form.querySelector('[name="name"]');
    const email = form.querySelector('[name="email"]');
    if (!name.value.trim()) { say(form, 'form.errName'); name.focus(); return; }
    if (!email.value.trim() || !email.checkValidity()) { say(form, 'form.errEmail'); email.focus(); return; }
    if (kind === 'meeting' && !date.value) { say(form, 'form.errDate'); date.focus(); return; }
    const data = Object.fromEntries(new FormData(form));
    data.kind = kind;
    data.language = window.HAVA.lang;
    if (kind === 'meeting') data.timeZone = timeZone;
    if (ORDER_ENDPOINT) {
      try {
        const res = await fetch(ORDER_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error(String(res.status));
      } catch (err) {
        say(form, 'form.failed');
        return;
      }
    }
    const first = data.name.trim().split(/\s+/)[0];
    document.getElementById('confirm-title').textContent = t('form.thanks', { name: first });
    if (kind === 'meeting') {
      const tag = document.documentElement.lang || 'en';
      const day = new Date(`${data.date}T12:00:00`).toLocaleDateString(tag, { weekday: 'long', day: 'numeric', month: 'long' });
      document.getElementById('confirm-text').textContent = t('form.meetThanksText', { email: data.email.trim(), date: day, time: data.time });
    } else {
      document.getElementById('confirm-text').textContent = t('form.thanksText', { email: data.email.trim() });
    }
    form.hidden = true;
    confirmBox.hidden = false;
    confirmBox.dataset.kind = kind;
    confirmBox.focus();
  }
  Object.values(forms).forEach(f => f.addEventListener('submit', submit));
  document.getElementById('form-again').addEventListener('click', () => {
    const kind = confirmBox.dataset.kind || 'quote';
    forms[kind].reset();
    if (kind === 'meeting') { date.value = iso(next); document.getElementById('m-time').value = '10:00'; }
    show(kind);
    forms[kind].querySelector('[name="name"]').focus();
  });
  window.HAVA.onLang(() => {
    Object.values(forms).forEach(f => say(f, ''));
    tzNote.textContent = timeZone ? t('form.tz', { tz: timeZone.replace(/_/g, ' ') }) : '';
  });
})();
