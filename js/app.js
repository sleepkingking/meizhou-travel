var currentUser = null;

var routes = {
  '': renderHome,
  'tours': renderTours,
  'tour': renderTourDetail,
  'contact': renderContact,
  'profile': renderProfile,
  'admin': renderAdminList,
  'admin/edit': renderAdminEdit
};

function initApp() {
  route();
  getAdminSession().then(function(session) {
    if (session) currentUser = session.user;
  }).catch(function() {});
}

function route() {
  var hash = location.hash.replace('#/', '') || '';
  var parts = hash.split('/');
  var path = parts[0];
  var param = parts.length > 1 ? parts.slice(1).join('/') : null;

  var renderFn = routes[path];
  var content = document.getElementById('content');

  if (!renderFn) {
    content.innerHTML = '<div class="empty"><div class="icon">🏠</div><p>页面不存在</p></div>';
    return;
  }

  // 管理页面：检查管理员权限
  if (path === 'admin' || path === 'admin/edit') {
    if (!currentUser) {
      showToast('请先登录');
      location.hash = '#/profile';
      return;
    }
    if (currentUser.email !== 'jiayuanhuwai@admin.com') {
      showToast('仅管理员可访问');
      location.hash = '#/profile';
      return;
    }
  }

  // 渲染页面
  if (path === '' || path === 'tours' || path === 'contact' || path === 'profile') {
    renderFn(content);
    renderNav(content);
  } else if (path === 'tour') {
    renderFn(content, param);
  } else if (path === 'admin' || path === 'admin/edit') {
    renderFn(content, param);
  }
}

function showToast(msg) {
  var el = document.createElement('div');
  el.className = 'toast';
  el.textContent = msg;
  document.getElementById('app').appendChild(el);
  setTimeout(function() { el.remove(); }, 2100);
}

window.addEventListener('hashchange', route);
window.addEventListener('DOMContentLoaded', initApp);
