async function renderAdminList(container) {
  container.innerHTML = `
    <div class="page-header">
      <span class="back" onclick="location.hash='#/'">←</span>
      行程管理
    </div>
    <div class="admin-list">
      <div class="list-header">
        <span style="font-size:0.875rem;color:#888;">管理所有行程</span>
        <button class="add-btn" onclick="location.hash='#/admin/edit/new'">+ 新增</button>
      </div>
      <div id="admin-tours-list">${renderLoading()}</div>
      <div style="text-align:center;padding:20px;">
        <button style="background:none;border:none;color:#e8553d;cursor:pointer;font-size:0.875rem;"
                onclick="handleLogout()">退出登录</button>
      </div>
    </div>
  `;

  let tours;
  try {
    tours = await Promise.race([
      adminGetAllTours(),
      new Promise(resolve => setTimeout(() => resolve([]), 10000))
    ]);
  } catch (e) { tours = []; }
  const listContainer = document.getElementById('admin-tours-list');
  if (!listContainer) return;
  if (tours.length === 0) {
    listContainer.innerHTML = `<div class="empty"><div class="icon">📋</div><p>暂无行程，点击上方"新增"添加</p></div>`;
  } else {
    listContainer.innerHTML = tours.map(t => renderTourCard(t, true)).join('');
  }
}

async function handleLogout() {
  await adminLogout();
  currentUser = null;
  location.hash = '#/';
  showToast('已退出登录');
}
