// === 简易 Hash 路由 ===

let currentUser = null;
let appReady = false;

const routes = {
  '': renderHome,
  'tours': renderTours,
  'tour': renderTourDetail,
  'contact': renderContact,
  'profile': renderProfile,
  'admin': renderAdminList,
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
  var hash = location.hash.replace('#/', '') || '';
  var parts = hash.split('/');
  var path = parts[0];
  var param = parts.length > 1 ? parts.slice(1).join('/') : null;

  console.log('route:', path, 'currentUser:', !!currentUser, 'isAdmin:', isAdminUser());

  var renderFn = routes[path];
  if (!renderFn || typeof renderFn !== 'function') {
    document.getElementById('content').innerHTML = '<div class="empty"><div class="icon">⚠️</div><p>页面加载失败: ' + path + '</p></div>';
    return;
  }

  var content = document.getElementById('content');

  if (renderFn === renderHome || renderFn === renderTours || renderFn === renderContact || renderFn === renderProfile) {
    renderFn(content);
    renderNav(content);
  } else if (renderFn === renderTourDetail) {
    renderFn(content, param);
  } else if (renderFn === renderAdminList || renderFn === renderAdminEdit) {
    console.log('admin check - currentUser:', currentUser, 'isAdmin:', isAdminUser());
    if (!currentUser) {
      showToast('请先登录');
      location.hash = '#/profile';
      return;
    }
    if (!isAdminUser()) {
      showToast('仅管理员可访问 (email: ' + (currentUser ? currentUser.email : 'none') + ')');
      location.hash = '#/profile';
      return;
    }
    renderFn(content, param);
  } else {
    renderFn(content);
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
