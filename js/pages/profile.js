function renderProfile(container) {
  if (currentUser) {
    renderUserInfo(container);
  } else {
    renderAuthForm(container);
  }
}

function renderAuthForm(container, defaultTab) {
  var tab = defaultTab || 'login';
  container.innerHTML = `
    <div class="page-header">个人中心</div>
    <div class="tabs" style="margin-top:16px;">
      <button class="tab ${tab === 'login' ? 'active' : ''}" onclick="switchAuthTab('login')">登录</button>
      <button class="tab ${tab === 'register' ? 'active' : ''}" onclick="switchAuthTab('register')">注册</button>
      <button class="tab ${tab === 'reset' ? 'active' : ''}" onclick="switchAuthTab('reset')">忘记密码</button>
    </div>
    <div id="auth-form">${tab === 'login' ? renderLoginForm() : tab === 'register' ? renderRegisterForm() : renderResetForm()}</div>
  `;
}

function renderLoginForm() {
  return `
    <div style="padding:24px;text-align:center;">
      <input type="text" id="login-email" placeholder="请输入手机号" style="width:100%;padding:12px;border:1px solid #ddd;border-radius:8px;font-size:0.875rem;margin-bottom:12px;box-sizing:border-box;">
      <input type="password" id="login-password" placeholder="请输入密码" style="width:100%;padding:12px;border:1px solid #ddd;border-radius:8px;font-size:0.875rem;margin-bottom:12px;box-sizing:border-box;">
      <div id="auth-error" class="error"></div>
      <button id="login-btn" class="auth-btn" onclick="handleProfileLogin()" style="width:100%;padding:12px;background:#1a73e8;color:#fff;border:none;border-radius:24px;font-size:1rem;font-weight:600;cursor:pointer;">登 录</button>
      <div id="login-debug" style="font-size:0.6875rem;color:#999;margin-top:12px;"></div>
    </div>
  `;
}

function renderRegisterForm() {
  return `
    <div style="padding:24px;text-align:center;">
      <input type="tel" id="reg-phone" placeholder="请输入手机号" style="width:100%;padding:12px;border:1px solid #ddd;border-radius:8px;font-size:0.875rem;margin-bottom:12px;box-sizing:border-box;">
      <input type="password" id="reg-password" placeholder="请设置密码（至少6位）" style="width:100%;padding:12px;border:1px solid #ddd;border-radius:8px;font-size:0.875rem;margin-bottom:12px;box-sizing:border-box;">
      <div id="auth-error" class="error"></div>
      <button id="reg-btn" class="auth-btn" onclick="handleProfileRegister()" style="width:100%;padding:12px;background:#1a73e8;color:#fff;border:none;border-radius:24px;font-size:1rem;font-weight:600;cursor:pointer;">注 册</button>
      <div style="font-size:0.6875rem;color:#999;margin-top:8px;">注册即表示同意服务条款</div>
    </div>
  `;
}

function renderResetForm() {
  return `
    <div style="padding:24px;text-align:center;">
      <p style="font-size:0.875rem;color:#666;margin-bottom:16px;">输入注册手机号，我们将发送重置链接到对应邮箱</p>
      <input type="tel" id="reset-phone" placeholder="请输入手机号" style="width:100%;padding:12px;border:1px solid #ddd;border-radius:8px;font-size:0.875rem;margin-bottom:12px;box-sizing:border-box;">
      <div id="auth-error" class="error"></div>
      <button id="reset-btn" class="auth-btn" onclick="handleResetPassword()" style="width:100%;padding:12px;background:#1a73e8;color:#fff;border:none;border-radius:24px;font-size:1rem;font-weight:600;cursor:pointer;">发送重置邮件</button>
    </div>
  `;
}

function switchAuthTab(tab) {
  document.getElementById('auth-form').innerHTML = tab === 'login' ? renderLoginForm() : tab === 'register' ? renderRegisterForm() : renderResetForm();
  document.querySelectorAll('.tab').forEach(function(t, i) {
    t.classList.toggle('active', (i === 0 && tab === 'login') || (i === 1 && tab === 'register') || (i === 2 && tab === 'reset'));
  });
}

async function handleProfileLogin() {
  var btn = document.getElementById('login-btn');
  var debug = document.getElementById('login-debug');
  var errorEl = document.getElementById('auth-error');

  btn.disabled = true; btn.textContent = '登录中...';
  errorEl.textContent = ''; debug.textContent = '';

  var phone = document.getElementById('login-email').value.trim();
  var password = document.getElementById('login-password').value;
  var email = phone;

  if (!phone || !password) {
    errorEl.textContent = '请输入手机号和密码';
    btn.disabled = false; btn.textContent = '登 录'; return;
  }

  // 手机号转邮箱：管理员用特殊邮箱，普通用户用 phone@user.com
  if (phone === 'jiayuanhuwai') {
    email = 'jiayuanhuwai@admin.com';
  } else {
    // 中国大陆手机号直接作为登录标识
    email = phone + '@user.com';
  }
  debug.textContent = '正在连接...';

  try {
    var resp = await fetch('https://okrseebqgaqbspfjfmew.supabase.co/auth/v1/token?grant_type=password', {
      method: 'POST',
      headers: { 'apikey': 'sb_publishable_WYUOGccf5IiJqM512U_NAw_MrsdTkrA', 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email, password: password })
    });

    debug.textContent = '响应: ' + resp.status;

    if (resp.ok) {
      var data = await resp.json();
      currentUser = data.user;
      // 同步session到Supabase SDK，后续管理操作才能通过认证
      if (data.access_token) {
        window._authToken = data.access_token;
        try {
          await supabase.auth.setSession({ access_token: data.access_token, refresh_token: data.refresh_token });
        } catch(e) {}
      }
      showToast('登录成功');
      renderProfile(document.getElementById('content'));
    } else {
      var err = await resp.json().catch(function(){ return {}; });
      errorEl.textContent = err.error_description || err.msg || '手机号或密码错误';
    }
  } catch (e) {
    debug.textContent = '网络错误: ' + e.message;
    errorEl.textContent = '网络连接失败';
  }
  btn.disabled = false; btn.textContent = '登 录';
}

async function handleProfileRegister() {
  var btn = document.getElementById('reg-btn');
  var errorEl = document.getElementById('auth-error');

  btn.disabled = true; btn.textContent = '注册中...';
  errorEl.textContent = '';

  var phone = document.getElementById('reg-phone').value.trim();
  var password = document.getElementById('reg-password').value;

  if (!phone || !password) {
    errorEl.textContent = '请输入手机号和密码';
    btn.disabled = false; btn.textContent = '注 册'; return;
  }
  if (password.length < 6) {
    errorEl.textContent = '密码至少6位';
    btn.disabled = false; btn.textContent = '注 册'; return;
  }

  var email = phone + '@user.com';

  try {
    var resp = await fetch('https://okrseebqgaqbspfjfmew.supabase.co/auth/v1/signup', {
      method: 'POST',
      headers: { 'apikey': 'sb_publishable_WYUOGccf5IiJqM512U_NAw_MrsdTkrA', 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email, password: password, data: { phone: phone } })
    });

    if (resp.ok) {
      var data = await resp.json();
      // 自动登录
      if (data.access_token) {
        window._authToken = data.access_token;
        currentUser = data.user;
        try {
          await supabase.auth.setSession({ access_token: data.access_token, refresh_token: data.refresh_token });
        } catch(e) {}
      } else {
        currentUser = data.user;
      }
      showToast('注册成功');
      renderProfile(document.getElementById('content'));
    } else {
      var err = await resp.json().catch(function(){ return {}; });
      if (err.msg && err.msg.indexOf('already') > -1) {
        errorEl.textContent = '该手机号已注册，请直接登录';
      } else {
        errorEl.textContent = err.msg || '注册失败，请重试';
      }
    }
  } catch (e) {
    errorEl.textContent = '网络连接失败';
  }
  btn.disabled = false; btn.textContent = '注 册';
}

async function handleResetPassword() {
  var btn = document.getElementById('reset-btn');
  var errorEl = document.getElementById('auth-error');
  var phone = document.getElementById('reset-phone').value.trim();

  if (!phone) { errorEl.textContent = '请输入手机号'; return; }

  btn.disabled = true; btn.textContent = '发送中...';
  errorEl.textContent = '';

  var email = phone + '@user.com';

  try {
    var resp = await fetch('https://okrseebqgaqbspfjfmew.supabase.co/auth/v1/recover', {
      method: 'POST',
      headers: { 'apikey': 'sb_publishable_WYUOGccf5IiJqM512U_NAw_MrsdTkrA', 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email })
    });

    if (resp.ok) {
      errorEl.textContent = '';
      showToast('重置邮件已发送，请查收邮箱');
    } else {
      var err = await resp.json().catch(function(){ return {}; });
      errorEl.textContent = err.msg || '发送失败，请检查手机号是否正确';
    }
  } catch (e) {
    errorEl.textContent = '网络连接失败';
  }
  btn.disabled = false; btn.textContent = '发送重置邮件';
}

function renderUserInfo(container) {
  var isAdmin = currentUser && currentUser.email === 'jiayuanhuwai@admin.com';
  var phone = (currentUser.user_metadata && currentUser.user_metadata.phone) || '';
  var displayName = isAdmin ? '嘉园户外 (管理员)' : (phone || currentUser.email || '用户');

  container.innerHTML = `
    <div class="page-header">个人中心</div>
    <div class="profile-header">
      <div class="profile-avatar">${isAdmin ? '管' : '户'}</div>
      <div class="profile-name">${escapeHtml(displayName)}</div>
      <div class="profile-role">${isAdmin ? '管理员' : '旅行爱好者'}</div>
    </div>
    <div class="profile-menu">
      ${isAdmin ? `
        <div class="profile-menu-item" onclick="window.location.href='#/admin'; setTimeout(function(){ route(); }, 100);">
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
  window._authToken = null;
  showToast('已退出');
  renderProfile(document.getElementById('content'));
  renderNav();
}
