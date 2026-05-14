// Theme toggle
(function () {
  const html = document.documentElement;
  const toggle = document.querySelector('[data-theme-toggle]');
  let theme = html.getAttribute('data-bs-theme') || 'dark';

  function applyTheme(t) {
    html.setAttribute('data-bs-theme', t);
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

// Mobile sidebar
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

  btn.addEventListener('click', () =>
    sidebar.classList.contains('is-open') ? closeSidebar() : openSidebar()
  );
  backdrop.addEventListener('click', closeSidebar);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && sidebar.classList.contains('is-open')) closeSidebar();
  });
})();

(function () {
  const form = document.getElementById('bis-object-form');
  const input = document.getElementById('bis-object-url');
  const message = document.getElementById('bis-object-message');
  const tableBody = document.getElementById('bis-object-list');

  function getStorageKey() {
    return 'acero_cinco_bis_objects';
  }

  function loadStoredObjects() {
    try {
      const raw = localStorage.getItem(getStorageKey());
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  }

  function saveStoredObjects() {
    try {
      localStorage.setItem(getStorageKey(), JSON.stringify(objects));
    } catch (error) {
      /* ignore storage errors */
    }
  }

  const objects = loadStoredObjects();

  function showMessage(text, isError = false) {
    if (!message) return;
    message.textContent = text;
    message.style.color = isError ? 'var(--color-primary-active)' : '';
  }

  function normalizeUrl(value) {
    if (!value) return null;
    const trimmed = value.trim();
    if (!/^https?:\/\//i.test(trimmed)) {
      return `https://${trimmed}`;
    }
    return trimmed;
  }

  async function fetchObjectPage(url) {
    const proxy = 'https://api.allorigins.win/raw?url=' + encodeURIComponent(url);
    const response = await fetch(proxy);
    if (!response.ok) {
      throw new Error('No se pudo obtener el objeto desde poe2db.tw');
    }
    return response.text();
  }

  function parseObjectData(html, originalUrl) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const flexDiv = doc.querySelector('.d-flex.flex-wrap');
    if (!flexDiv) {
      throw new Error('No se encontró el contenedor del objeto en la página.');
    }

    return {
      id: `object-${Date.now()}`,
      html: flexDiv.outerHTML,
      url: originalUrl,
    };
  }

  function renderObjects() {
    if (!tableBody) return;
    tableBody.innerHTML = objects.map((obj) => `
      <tr>
        <td>${obj.html}</td>
        <td><button type="button" data-id="${obj.id}" class="bis-remove-button">Eliminar</button></td>
      </tr>
    `).join('');

    tableBody.querySelectorAll('.bis-remove-button').forEach((button) => {
      button.addEventListener('click', (event) => {
        const id = event.currentTarget.dataset.id;
        const index = objects.findIndex((item) => item.id === id);
        if (index !== -1) {
          objects.splice(index, 1);
          renderObjects();
          saveStoredObjects();
          showMessage('Objeto eliminado.', false);
        }
      });
    });
  }

  renderObjects();

  if (form) {
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (!input) return;

      const rawValue = normalizeUrl(input.value);
      if (!rawValue) {
        showMessage('Ingresa una URL válida de poe2db.tw.', true);
        return;
      }

      try {
        showMessage('Buscando objeto...', false);
        const html = await fetchObjectPage(rawValue);
        const objectData = parseObjectData(html, rawValue);
        objects.push(objectData);
        renderObjects();
        saveStoredObjects();
        input.value = '';
        showMessage('Objeto agregado correctamente.', false);
      } catch (error) {
        showMessage(error.message || 'Error al cargar el objeto.', true);
      }
    });
  }
})();
