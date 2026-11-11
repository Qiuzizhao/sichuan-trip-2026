(function () {
  const key = 'sichuan-trip-access-v1';
  const password = document.getElementById('access-pass');

  function showTrip() {
    document.documentElement.classList.add('unlocked');

    if (navigator.connection?.saveData) return;

    function prefetchPages() {
      for (const link of document.querySelectorAll('.trip-nav a:not([aria-current])')) {
        fetch(link.href, { mode: 'same-origin', priority: 'low' })
          .then(response => response.arrayBuffer())
          .catch(() => {});
      }
    }

    if (document.readyState === 'complete') {
      prefetchPages();
    } else {
      window.addEventListener('load', prefetchPages, { once: true });
    }
  }

  if (localStorage.getItem(key) === 'yes') {
    showTrip();
  }

  document.getElementById('access-form').addEventListener('submit', function (event) {
    event.preventDefault();
    if (password.value === 'qqqyyy') {
      localStorage.setItem(key, 'yes');
      showTrip();
    } else {
      document.getElementById('access-error').textContent = '密码错误，请重试';
      password.value = '';
    }
  });
})();
