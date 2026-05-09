// ─── Theme toggle ───────────────────────────────────────────
(function () {
  const html = document.documentElement;
  const toggle = document.querySelector('[data-theme-toggle]');
  let theme = html.getAttribute('data-theme') || 'dark';

  function applyTheme(t) {
    html.setAttribute('data-theme', t);
    if (toggle) {
      toggle.setAttribute('aria-label', `Switch to ${t === 'dark' ? 'light' : 'dark'} mode`);
    }
  }

  applyTheme(theme);

  if (toggle) {
    toggle.addEventListener('click', () => {
      theme = theme === 'dark' ? 'light' : 'dark';
      applyTheme(theme);
    });
  }
})();

// ─── Mobile sidebar toggle ───────────────────────────────────
(function () {
  const btn = document.querySelector('.sidebar-toggle');
  const sidebar = document.getElementById('sidebar');
  const backdrop = document.querySelector('.sidebar-backdrop');

  function openSidebar() {
    sidebar.classList.add('is-open');
    backdrop.classList.add('is-visible');
    btn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeSidebar() {
    sidebar.classList.remove('is-open');
    backdrop.classList.remove('is-visible');
    btn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  btn.addEventListener('click', () => {
    const isOpen = sidebar.classList.contains('is-open');
    isOpen ? closeSidebar() : openSidebar();
  });

  backdrop.addEventListener('click', closeSidebar);

  // Close sidebar when Escape is pressed
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && sidebar.classList.contains('is-open')) {
      closeSidebar();
    }
  });
})();
