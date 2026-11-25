(function () {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Reveal on scroll */
  const items = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -6% 0px' });
    items.forEach((el) => io.observe(el));
  } else {
    items.forEach((el) => el.classList.add('visible'));
  }

  /* Highlight the nav link of the section in view */
  const links = document.querySelectorAll('.nav__links a[href^="#"]');
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) links.forEach((a) => a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  links.forEach((a) => { const s = document.querySelector(a.getAttribute('href')); if (s) spy.observe(s); });

  /* Email is stored reversed and split so scrapers don't find it in the HTML */
  document.querySelectorAll('.js-email').forEach((a) => {
    const rev = (x) => x.split('').reverse().join('');
    const addr = rev(a.dataset.u) + String.fromCharCode(64) + rev(a.dataset.d);
    a.href = 'mailto:' + addr;
    a.textContent = addr;
  });
  /* Project details: cards link to #work/<slug>, which opens a dialog.
     Using the URL hash makes details linkable and lets the back button close them. */
  const dialog = document.getElementById('detail');
  if (dialog && typeof dialog.showModal === 'function') {
    const body = dialog.querySelector('.detail__body');
    const media = dialog.querySelector('.detail__media');
    let openedFromPage = false;
    let lastFocus = null;

    const slugFromHash = () => {
      const m = location.hash.match(/^#work\/([\w-]+)$/);
      return m ? m[1] : null;
    };

    const open = (slug) => {
      const tpl = document.getElementById('detail-' + slug);
      const card = document.querySelector('.shot[href="#work/' + slug + '"]');
      if (!tpl || !card) return;
      body.replaceChildren(tpl.content.cloneNode(true));
      const title = body.querySelector('.detail__title');
      if (title) title.id = 'detail-title';
      const art = card.querySelector('.media');
      media.replaceChildren(art && !tpl.hasAttribute('data-hide-media') ? art.cloneNode(true) : '');
      dialog.classList.toggle('detail--no-media', tpl.hasAttribute('data-hide-media'));
      lastFocus = document.activeElement;
      if (!dialog.open) dialog.showModal();
      dialog.scrollTop = 0;
      dialog.querySelector('.detail__box').scrollTop = 0;
      document.documentElement.classList.add('detail-open');
    };

    const close = () => {
      if (dialog.open) dialog.close();
    };

    dialog.addEventListener('close', () => {
      document.documentElement.classList.remove('detail-open');
      if (slugFromHash()) {
        if (openedFromPage) history.back();
        else {
          history.replaceState(null, '', '#highlights');
          document.getElementById('highlights').scrollIntoView();
        }
      }
      openedFromPage = false;
      if (lastFocus) lastFocus.focus({ preventScroll: true });
    });

    document.querySelectorAll('.shot[href^="#work/"]').forEach((card) => {
      card.addEventListener('click', () => { openedFromPage = true; });
    });

    dialog.querySelector('.detail__close').addEventListener('click', close);
    // Click on the backdrop (outside the box) closes the dialog
    dialog.addEventListener('click', (e) => { if (e.target === dialog) close(); });

    window.addEventListener('hashchange', () => {
      const slug = slugFromHash();
      if (slug) open(slug);
      else if (dialog.open) { openedFromPage = false; dialog.close(); }
    });

    const initial = slugFromHash();
    if (initial) open(initial);
  }
})();
