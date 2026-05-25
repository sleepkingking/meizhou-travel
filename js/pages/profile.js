function renderProfile(container) {
  if (currentUser) {
    renderUserInfo(container);
  } else {
    renderAuthForm(container);
  }
}

function renderAuthForm(container, defaultTab) {
  const activeTab = defaultTab || 'login';
  container.innerHTML = `
    <div class="page-header">个人中心</div>
    <div class="tabs" style="margin-top:16px;">
      <button class="tab ${activeTab === 'login' ? 'active' : ''}" onclick="switchAuthTab('login')">登录</button>
      <button class="tab ${activeTab === 'register' ? 'active' : ''}" onclick="switchAuthTab('register')">注册</button>
    </div>
    <div id="auth-form" class="login-form">
      ${activeTab === 'login' ? renderLoginForm() : renderRegisterForm()}
    </div>
  `;
}

function renderLoginForm() {
  return `
    <form onsubmit="handleProfileLogin(event)">
      <input type="text" id="login-email" placeholder="请输入账号或邮箱" required>
      <input type="password" id="login-password" placeholder="请输入密码" required>
      <div id="auth-error" class="error"></div>
      <button type="submit">登 录</button>
    </form>
  `;
}

function renderRegisterForm() {
  return `
    <form onsubmit="handleProfileRegister(event)">
      <input type="email" id="reg-email" placeholder="请输入邮箱" required>
      <input type="password" id="reg-password" placeholder="请设置密码（至少6位）" required minlength="6">
      <div id="auth-error" class="error"></div>
      <button type="submit">注 册</button>
    </form>
  `;
}

function switchAuthTab(tab) {
  document.getElementById('auth-form').innerHTML = tab === 'login' ? renderLoginForm() : renderRegisterForm();
  document.querySelectorAll('.tab').forEach((t, i) => {
    t.classList.toggle('active', (i === 0 && tab === 'login') || (i === 1 && tab === 'register'));
  });
}

async function handleProfileLogin(e) {
  e.preventDefault();
  let email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  const errorEl = document.getElementById('auth-error');

  // 支持用户名登录：不含@自动补全
  if (!email.includes('@')) {
    email = email + '@admin.com';
  }

  const result = await adminLogin(email, password);
  if (result) {
    currentUser = result.user;
    showToast('登录成功');
    renderProfile(document.getElementById('content'));
  } else {
    errorEl.textContent = '登录失败，请检查账号和密码';
  }
}

async function handleProfileRegister(e) {
  e.preventDefault();
  const email = document.getElementById('reg-email').value;
  const password = document.getElementById('reg-password').value;
  const errorEl = document.getElementById('auth-error');

  if (password.length < 6) {
    errorEl.textContent = '密码至少6位';
    return;
  }

  const result = await userRegister(email, password);
  if (result) {
    currentUser = result.user;
    showToast('注册成功');
    renderProfile(document.getElementById('content'));
  } else {
    errorEl.textContent = '注册失败，请检查邮箱或稍后重试';
  }
}

function renderUserInfo(container) {
  const isAdmin = currentUser && currentUser.email === 'admin@meizhoujiayuan.com';

  container.innerHTML = `
    <div class="page-header">个人中心</div>
    <div style="text-align:center;padding:24px 16px;">
      <div style="font-size:3rem;margin-bottom:12px;">👤</div>
      <div style="font-size:1rem;font-weight:600;">${escapeHtml(currentUser.email || '')}</div>
      <div style="font-size:0.8125rem;color:#888;margin-top:4px;">${isAdmin ? '管理员' : '普通用户'}</div>
    </div>

    ${isAdmin ? `
      <div style="margin:0 16px 12px;">
        <div class="contact-card" style="cursor:pointer;" onclick="location.hash='#/admin'">
          <div class="icon">⚙️</div>
          <p style="font-weight:600;">管理中心</p>
          <p style="font-size:0.75rem;color:#888;">管理行程、上下架商品</p>
        </div>
      </div>
    ` : ''}

    <div style="padding:0 16px 24px;">
      <button style="width:100%;padding:12px;background:#f5f5f5;border:none;border-radius:24px;
        font-size:0.875rem;color:#e8553d;cursor:pointer;"
        onclick="handleProfileLogout()">退出登录</button>
    </div>
  `;
}

async function handleProfileLogout() {
  await adminLogout();
  currentUser = null;
  showToast('已退出');
  renderProfile(document.getElementById('content'));
  renderNav();
}
