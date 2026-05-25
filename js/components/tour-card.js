function renderTourCard(tour, showActions = false) {
  const coverStyle = tour.cover_image
    ? `background-image: url('${tour.cover_image}');`
    : `background: linear-gradient(135deg, #2d5a27, #4a8f3f);`;

  return `
    <div class="tour-card${!tour.is_published ? ' offline' : ''}"
         onclick="location.hash='#/tour/${tour.id}'">
      <div class="card-cover" style="${coverStyle}">
        ${tour.cover_image ? '' : '🏔️'}
      </div>
      <div class="card-body">
        <div class="card-title">${escapeHtml(tour.name)}</div>
        <div class="card-meta">
          ⏱ ${tour.duration || '待定'} · 📍 ${tour.destination || '待定'} · ${tour.departure_dates || '待定'}
        </div>
        <div class="card-footer">
          <div class="card-price">¥${tour.price_adult || 0}<small>/人起</small></div>
          ${showActions ? renderAdminCardActions(tour) : '<div class="card-btn">查看详情</div>'}
        </div>
      </div>
    </div>
  `;
}

function renderAdminCardActions(tour) {
  return `
    <div class="admin-actions" onclick="event.stopPropagation()">
      <button class="btn-edit" onclick="location.hash='#/admin/edit/${tour.id}'">编辑</button>
      <button class="${tour.is_published ? 'btn-toggle-on' : 'btn-toggle-off'}"
              onclick="handleToggle('${tour.id}', ${tour.is_published})">
        ${tour.is_published ? '已上架' : '已下架'}
      </button>
      <button class="btn-delete" onclick="handleDelete('${tour.id}')">删除</button>
    </div>
  `;
}

async function handleToggle(id, currentStatus) {
  if (!confirm(`确定要${currentStatus ? '下架' : '上架'}这个行程吗？`)) return;
  const ok = await adminTogglePublish(id, currentStatus);
  if (ok) { showToast(currentStatus ? '已下架' : '已上架'); route(); }
}

async function handleDelete(id) {
  if (!confirm('确定要删除这个行程吗？此操作不可恢复。')) return;
  const ok = await adminDeleteTour(id);
  if (ok) { showToast('已删除'); route(); }
}

function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
