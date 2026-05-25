// === 简易 Hash 路由 ===

let currentUser = null;

const routes = {
  '': renderHome,
  'tours': renderTours,
  'tour': renderTourDetail,
  'contact': renderContact,
  'admin': renderAdminList,
  'admin/login': renderAdminLogin,
  'admin/edit': renderAdminEdit,
};

async function initApp() {
  const session = await getAdminSession();
  currentUser = session?.user || null;
  route();
}

function route() {
  const hash = location.hash.replace('#/', '');
  const [path, param] = hash.split('/').length > 1
    ? [hash.split('/')[0], hash.split('/').slice(1).join('/')]
    : [hash, null];

  const renderFn = routes[path];
  if (!renderFn) { location.hash = '#/'; return; }

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
