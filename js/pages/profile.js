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
  const btn = e.target.querySelector('button[type="submit"]');
  btn.disabled = true;
  btn.textContent = '登录中...';

  let email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  const errorEl = document.getElementById('auth-error');
  errorEl.textContent = '';

  // 支持用户名登录：不含@自动补全
  if (!email.includes('@')) {
    email = email + '@admin.com';
  }

  try {
    const result = await Promise.race([
      adminLogin(email, password),
      new Promise(resolve => setTimeout(() => resolve(null), 10000))
    ]);

    if (result) {
      currentUser = result.user;
      showToast('登录成功');
      renderProfile(document.getElementById('content'));
    } else {
      errorEl.textContent = '登录失败，请检查账号和密码，或检查网络连接';
    }
  } catch (err) {
    errorEl.textContent = '登录出错：' + err.message;
  } finally {
    btn.disabled = false;
    btn.textContent = '登 录';
  }
}

async function handleProfileRegister(e) {
  e.preventDefault();
  const btn = e.target.querySelector('button[type="submit"]');
  btn.disabled = true;
  btn.textContent = '注册中...';

  const email = document.getElementById('reg-email').value;
  const password = document.getElementById('reg-password').value;
  const errorEl = document.getElementById('auth-error');
  errorEl.textContent = '';

  if (password.length < 6) {
    errorEl.textContent = '密码至少6位';
    btn.disabled = false;
    btn.textContent = '注 册';
    return;
  }

  try {
    const result = await Promise.race([
      userRegister(email, password),
      new Promise(resolve => setTimeout(() => resolve(null), 10000))
    ]);

    if (result) {
      currentUser = result.user;
      showToast('注册成功');
      renderProfile(document.getElementById('content'));
    } else {
      errorEl.textContent = '注册失败，请检查邮箱或稍后重试';
    }
  } catch (err) {
    errorEl.textContent = '注册出错：' + err.message;
  } finally {
    btn.disabled = false;
    btn.textContent = '注 册';
  }
}

function renderUserInfo(container) {
  const isAdmin = currentUser && currentUser.email === 'jiayuanhuwai@admin.com';
  const displayName = isAdmin ? '嘉园户外' : (currentUser.email ? currentUser.email.split('@')[0] : '用户');

  container.innerHTML = `
    <div class="page-header">个人中心</div>

    <!-- 头像区 -->
    <div class="profile-header">
      <div class="profile-avatar">${displayName.charAt(0).toUpperCase()}</div>
      <div class="profile-name">${escapeHtml(displayName)}</div>
      <div class="profile-role">${isAdmin ? '管理员' : '旅行爱好者'}</div>
    </div>

    <!-- 菜单列表 -->
    <div class="profile-menu">
      ${isAdmin ? `
        <div class="profile-menu-item" onclick="location.hash='#/admin'">
          <div class="menu-icon">⚙️</div>
          <div class="menu-text">
            <div class="menu-title">管理中心</div>
            <div class="menu-desc">管理行程、上下架商品</div>
          </div>
          <div class="menu-arrow">›</div>
        </div>
      ` : ''}
      <div class="profile-menu-item" onclick="location.hash='#/tours'">
        <div class="menu-icon">🧭</div>
        <div class="menu-text">
          <div class="menu-title">浏览行程</div>
          <div class="menu-desc">发现更多精彩旅行</div>
        </div>
        <div class="menu-arrow">›</div>
      </div>
      <div class="profile-menu-item" onclick="location.hash='#/contact'">
        <div class="menu-icon">📞</div>
        <div class="menu-text">
          <div class="menu-title">联系我们</div>
          <div class="menu-desc">咨询路线与报名</div>
        </div>
        <div class="menu-arrow">›</div>
      </div>
    </div>

    <!-- 退出 -->
    <div class="profile-logout" onclick="handleProfileLogout()">退出登录</div>
  `;
}

async function handleProfileLogout() {
  await adminLogout();
  currentUser = null;
  showToast('已退出');
  renderProfile(document.getElementById('content'));
  renderNav();
}
