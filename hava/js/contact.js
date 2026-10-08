/* Contact page form. Links like contact.html#cans pick the matching interest. */
(() => {
  // Where messages go once the site is live (e.g. a Formspree URL). Empty = thank-you message only.
  const ORDER_ENDPOINT = '';

  const { t } = window.HAVA;
  const form = document.getElementById('contact-form');
  const errorBox = document.getElementById('form-error');
  const confirmBox = document.getElementById('form-confirm');
  const interest = document.getElementById('f-interest');

  const fromHash = window.location.hash.slice(1);
  if ([...interest.options].some(o => o.value === fromHash)) interest.value = fromHash;

  form.addEventListener('submit', async e => {
    e.preventDefault();
    errorBox.textContent = '';
    const name = document.getElementById('f-name');
    const email = document.getElementById('f-email');
    if (!name.value.trim()) { errorBox.textContent = t('form.errName'); name.focus(); return; }
    if (!email.value.trim() || !email.checkValidity()) { errorBox.textContent = t('form.errEmail'); email.focus(); return; }
    const data = Object.fromEntries(new FormData(form));
    data.language = window.HAVA.lang;
    if (ORDER_ENDPOINT) {
      try {
        const res = await fetch(ORDER_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error(String(res.status));
      } catch (err) {
        errorBox.textContent = t('form.failed');
        return;
      }
    }
    document.getElementById('confirm-title').textContent = t('form.thanks', { name: data.name.trim().split(/\s+/)[0] });
    document.getElementById('confirm-text').textContent = t('form.thanksText', { email: data.email.trim() });
    form.hidden = true;
    confirmBox.hidden = false;
    confirmBox.focus();
  });
  document.getElementById('form-again').addEventListener('click', () => {
    form.reset();
    confirmBox.hidden = true;
    form.hidden = false;
    document.getElementById('f-name').focus();
  });
  window.HAVA.onLang(() => { errorBox.textContent = ''; });
})();
