function renderAdminLogin(container) {
  container.innerHTML = `
    <div class="login-form">
      <div style="font-size:3rem;margin-bottom:16px;">🔐</div>
      <h2>管理员登录</h2>
      <form onsubmit="handleLogin(event)">
        <input type="email" id="login-email" placeholder="请输入管理员邮箱" required autocomplete="email">
        <input type="password" id="login-password" placeholder="请输入密码" required autocomplete="current-password">
        <div id="login-error" class="error"></div>
        <button type="submit">登 录</button>
      </form>
    </div>
  `;
}

async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  const errorEl = document.getElementById('login-error');

  const result = await adminLogin(email, password);
  if (result) {
    currentUser = result.user;
    location.hash = '#/admin';
  } else {
    errorEl.textContent = '登录失败，请检查邮箱和密码';
  }
}
