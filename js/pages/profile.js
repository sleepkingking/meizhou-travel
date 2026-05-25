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
    <div id="auth-form">
      ${activeTab === 'login' ? renderLoginForm() : renderRegisterForm()}
    </div>
  `;
}

function renderLoginForm() {
  return `
    <div style="padding:24px;text-align:center;">
      <input type="text" id="login-email" placeholder="请输入账号或邮箱" style="width:100%;padding:12px;border:1px solid #ddd;border-radius:8px;font-size:0.875rem;margin-bottom:12px;box-sizing:border-box;">
      <input type="password" id="login-password" placeholder="请输入密码" style="width:100%;padding:12px;border:1px solid #ddd;border-radius:8px;font-size:0.875rem;margin-bottom:12px;box-sizing:border-box;">
      <div id="auth-error" style="color:#e8553d;font-size:0.8125rem;min-height:20px;margin-bottom:8px;"></div>
      <button id="login-btn" onclick="handleProfileLogin()" style="width:100%;padding:12px;background:#1a73e8;color:#fff;border:none;border-radius:24px;font-size:1rem;font-weight:600;cursor:pointer;">登 录</button>
      <div id="login-debug" style="font-size:0.6875rem;color:#999;margin-top:12px;"></div>
    </div>
  `;
}

function renderRegisterForm() {
  return `
    <div style="padding:24px;text-align:center;">
      <input type="email" id="reg-email" placeholder="请输入邮箱" style="width:100%;padding:12px;border:1px solid #ddd;border-radius:8px;font-size:0.875rem;margin-bottom:12px;box-sizing:border-box;">
      <input type="password" id="reg-password" placeholder="请设置密码（至少6位）" style="width:100%;padding:12px;border:1px solid #ddd;border-radius:8px;font-size:0.875rem;margin-bottom:12px;box-sizing:border-box;">
      <div id="auth-error" style="color:#e8553d;font-size:0.8125rem;min-height:20px;margin-bottom:8px;"></div>
      <button id="reg-btn" onclick="handleProfileRegister()" style="width:100%;padding:12px;background:#1a73e8;color:#fff;border:none;border-radius:24px;font-size:1rem;font-weight:600;cursor:pointer;">注 册</button>
    </div>
  `;
}

function switchAuthTab(tab) {
  document.getElementById('auth-form').innerHTML = tab === 'login' ? renderLoginForm() : renderRegisterForm();
  document.querySelectorAll('.tab').forEach((t, i) => {
    t.classList.toggle('active', (i === 0 && tab === 'login') || (i === 1 && tab === 'register'));
  });
}

async function handleProfileLogin() {
  var btn = document.getElementById('login-btn');
  var debug = document.getElementById('login-debug');
  var errorEl = document.getElementById('auth-error');

  btn.disabled = true;
  btn.textContent = '登录中...';
  errorEl.textContent = '';
  debug.textContent = '';

  var email = document.getElementById('login-email').value.trim();
  var password = document.getElementById('login-password').value;

  if (!email || !password) {
    errorEl.textContent = '请输入账号和密码';
    btn.disabled = false;
    btn.textContent = '登 录';
    return;
  }

  if (email.indexOf('@') === -1) {
    email = email + '@admin.com';
    debug.textContent = '使用账号: ' + email;
  }

  try {
    debug.textContent = '正在连接服务器...';

    var resp = await fetch('https://okrseebqgaqbspfjfmew.supabase.co/auth/v1/token?grant_type=password', {
      method: 'POST',
      headers: {
        'apikey': 'sb_publishable_WYUOGccf5IiJqM512U_NAw_MrsdTkrA',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email: email, password: password })
    });

    debug.textContent = '服务器响应: ' + resp.status;

    if (resp.ok) {
      var data = await resp.json();
      currentUser = data.user;
      showToast('登录成功');
      renderProfile(document.getElementById('content'));
    } else {
      var err = await resp.json().catch(function() { return {}; });
      errorEl.textContent = err.error_description || err.msg || '登录失败 (HTTP ' + resp.status + ')';
    }
  } catch (e) {
    debug.textContent = '错误: ' + e.message;
    errorEl.textContent = '网络连接失败，请检查网络';
  }

  btn.disabled = false;
  btn.textContent = '登 录';
}

async function handleProfileRegister() {
  var btn = document.getElementById('reg-btn');
  var errorEl = document.getElementById('auth-error');

  btn.disabled = true;
  btn.textContent = '注册中...';
  errorEl.textContent = '';

  var email = document.getElementById('reg-email').value.trim();
  var password = document.getElementById('reg-password').value;

  if (!email || !password) {
    errorEl.textContent = '请输入邮箱和密码';
    btn.disabled = false;
    btn.textContent = '注 册';
    return;
  }

  if (password.length < 6) {
    errorEl.textContent = '密码至少6位';
    btn.disabled = false;
    btn.textContent = '注 册';
    return;
  }

  try {
    var resp = await fetch('https://okrseebqgaqbspfjfmew.supabase.co/auth/v1/signup', {
      method: 'POST',
      headers: {
        'apikey': 'sb_publishable_WYUOGccf5IiJqM512U_NAw_MrsdTkrA',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email: email, password: password })
    });

    if (resp.ok) {
      var data = await resp.json();
      currentUser = data.user;
      showToast('注册成功');
      renderProfile(document.getElementById('content'));
    } else {
      var err = await resp.json().catch(function() { return {}; });
      errorEl.textContent = err.msg || '注册失败';
    }
  } catch (e) {
    errorEl.textContent = '网络连接失败，请检查网络';
  }

  btn.disabled = false;
  btn.textContent = '注 册';
}

function renderUserInfo(container) {
  var isAdmin = currentUser && currentUser.email === 'jiayuanhuwai@admin.com';
  var displayName = isAdmin ? '嘉园户外' : (currentUser.email ? currentUser.email.split('@')[0] : '用户');

  container.innerHTML = `
    <div class="page-header">个人中心</div>
    <div class="profile-header">
      <div class="profile-avatar">${displayName.charAt(0).toUpperCase()}</div>
      <div class="profile-name">${escapeHtml(displayName)}</div>
      <div class="profile-role">${isAdmin ? '管理员' : '旅行爱好者'}</div>
    </div>
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
