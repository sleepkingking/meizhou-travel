// === 简易 Hash 路由 ===

let currentUser = null;
let appReady = false;

const routes = {
  '': renderHome,
  'tours': renderTours,
  'tour': renderTourDetail,
  'contact': renderContact,
  'admin': renderAdminList,
  'admin/login': renderAdminLogin,
  'admin/edit': renderAdminEdit,
};

function initApp() {
  // 先渲染页面，不等待 Supabase 连接
  route();
  appReady = true;
  // 后台静默检查登录状态（失败也不影响页面）
  getAdminSession().then(session => {
    currentUser = session?.user || null;
  }).catch(() => {
    currentUser = null;
  });
}

function route() {
  const hash = location.hash.replace('#/', '');
  const [path, param] = hash.split('/').length > 1
    ? [hash.split('/')[0], hash.split('/').slice(1).join('/')]
    : [hash, null];

  const renderFn = routes[path];
  if (!renderFn || typeof renderFn !== 'function') {
    document.getElementById('content').innerHTML = '<div class="empty"><div class="icon">⚠️</div><p>页面加载失败，请刷新重试</p></div>';
    return;
  }

  const content = document.getElementById('content');
  if (renderFn === renderHome || renderFn === renderTours || renderFn === renderContact) {
    renderFn(content);
    renderNav(content);
  } else if (renderFn === renderTourDetail) {
    renderFn(content, param);
  } else if (renderFn === renderAdminList) {
    if (!currentUser) { location.hash = '#/admin/login'; return; }
    renderFn(content);
  } else if (renderFn === renderAdminLogin) {
    if (currentUser) { location.hash = '#/admin'; return; }
    renderFn(content);
  } else if (renderFn === renderAdminEdit) {
    if (!currentUser) { location.hash = '#/admin/login'; return; }
    renderFn(content, param);
  }
}

function showToast(message) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  document.getElementById('app').appendChild(toast);
  setTimeout(() => toast.remove(), 2100);
}

window.addEventListener('hashchange', route);
window.addEventListener('DOMContentLoaded', initApp);
