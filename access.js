(function () {
  const key = 'sichuan-trip-access-v1';
  const password = document.getElementById('access-pass');

  if (localStorage.getItem(key) === 'yes') {
    document.documentElement.classList.add('unlocked');
  }

  document.getElementById('access-form').addEventListener('submit', function (event) {
    event.preventDefault();
    if (password.value === 'qqqyyy') {
      localStorage.setItem(key, 'yes');
      document.documentElement.classList.add('unlocked');
    } else {
      document.getElementById('access-error').textContent = '密码错误，请重试';
      password.value = '';
    }
  });
})();
