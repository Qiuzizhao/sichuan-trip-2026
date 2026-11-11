(function () {
  const key = 'sichuan-trip-access-v1';
  const root = document.documentElement;

  try {
    if (localStorage.getItem(key) === 'yes') root.classList.add('unlocked');
  } catch {
    // Unlocking still works for this page when storage is unavailable.
  }

  function readPage(doc) {
    const heading = doc.querySelector('.trip-header h1');
    const main = doc.querySelector('body > main');
    if (!heading || !main) throw new Error('Invalid trip page');
    return { title: doc.title, heading: heading.textContent, main };
  }

  function enableTripNavigation() {
    const nav = document.querySelector('.trip-nav');
    const links = [...nav.querySelectorAll('a')];
    const heading = document.querySelector('.trip-header h1');
    const entryPath = location.pathname;
    const entryPage = nav.querySelector('[aria-current="page"]').pathname;
    const pages = new Map([[entryPage, readPage(document)]]);
    const pending = new Map();
    let currentPage = entryPage;
    let navigationId = 0;

    function loadPage(url, priority) {
      const path = url.pathname;
      if (pending.has(path)) return pending.get(path);

      const request = fetch(url, { mode: 'same-origin', priority })
        .then(response => {
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          return response.text();
        })
        .then(html => {
          const page = readPage(new DOMParser().parseFromString(html, 'text/html'));
          pages.set(path, page);
          return page;
        })
        .finally(() => pending.delete(path));
      pending.set(path, request);
      return request;
    }

    function navigate(url, push) {
      const id = ++navigationId;
      const path = url.pathname === entryPath ? entryPage : url.pathname;

      if (path === currentPage) {
        if (push && url.href !== location.href) {
          history.pushState(null, '', url);
          window.scrollTo(0, 0);
        }
        return;
      }

      function render(page) {
        if (id !== navigationId) return;

        if (push) history.pushState(null, '', url);
        pages.get(currentPage).main.replaceWith(page.main);
        currentPage = path;
        heading.textContent = page.heading;
        document.title = page.title;
        for (const link of links) {
          if (link.pathname === path) link.setAttribute('aria-current', 'page');
          else link.removeAttribute('aria-current');
        }
        if (push) window.scrollTo(0, 0);
      }

      if (pages.has(path)) {
        render(pages.get(path));
        return;
      }

      loadPage(url, 'auto').then(render).catch(() => {
        if (id === navigationId) location.assign(url);
      });
    }

    nav.addEventListener('click', event => {
      const link = event.target.closest('a');
      if (!link || event.defaultPrevented || event.button !== 0 ||
          event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      event.preventDefault();
      navigate(new URL(link.href), true);
    });

    window.addEventListener('popstate', () => navigate(new URL(location.href), false));

    if (!navigator.connection?.saveData) {
      function prefetchPages() {
        for (const link of links) {
          const url = new URL(link.href);
          if (!pages.has(url.pathname)) loadPage(url, 'low').catch(() => {});
        }
      }

      if (document.readyState === 'complete') prefetchPages();
      else window.addEventListener('load', prefetchPages, { once: true });
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    if (root.classList.contains('unlocked')) {
      enableTripNavigation();
      return;
    }

    const password = document.getElementById('access-pass');
    document.getElementById('access-form').addEventListener('submit', event => {
      event.preventDefault();
      if (password.value === 'qqqyyy') {
        try {
          localStorage.setItem(key, 'yes');
        } catch {
          // The current page can be unlocked without persistent storage.
        }
        root.classList.add('unlocked');
        enableTripNavigation();
      } else {
        document.getElementById('access-error').textContent = '密码错误，请重试';
        password.value = '';
      }
    });
  });
})();
