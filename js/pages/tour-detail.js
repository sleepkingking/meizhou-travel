async function renderTourDetail(container, id) {
  if (!id) { location.hash = '#/tours'; return; }

  container.innerHTML = renderLoading();

  let tour;
  try {
    tour = await Promise.race([
      getTour(id),
      new Promise(resolve => setTimeout(() => resolve(null), 10000))
    ]);
  } catch (e) { tour = null; }

  if (!tour) { container.innerHTML = '<div class="empty"><p>行程不存在或已下架</p></div>'; return; }

  const coverStyle = tour.cover_image
    ? `background-image: url('${tour.cover_image}');`
    : 'background: linear-gradient(135deg, #2d5a27, #4a8f3f);';

  container.innerHTML = `
    <div class="page-header">
      <span class="back" onclick="history.back()">←</span>
      行程详情
    </div>
    <div class="detail-cover" style="${coverStyle}"></div>
    <div class="detail-info">
      <div class="title">${escapeHtml(tour.name)}</div>
      <div class="meta-row">
        <span>⏱ ${tour.duration || '待定'}</span>
        <span>📍 ${tour.destination || '待定'}</span>
        <span>📅 ${tour.departure_dates || '待定'}</span>
      </div>
      <div class="price">
        ¥${tour.price_adult || 0}<sub>/人起</sub>
        ${tour.price_child ? `<sub style="margin-left:8px;">儿童 ¥${tour.price_child}/人</sub>` : ''}
      </div>
      ${tour.meeting_point ? `
        <div class="detail-meeting">
          📍 集合地点：${escapeHtml(tour.meeting_point)} ${tour.meeting_time ? `· 🕗 ${escapeHtml(tour.meeting_time)}` : ''}
        </div>
      ` : ''}
    </div>

    <div class="tabs">
      <button class="tab active" onclick="switchTab('itinerary')">行程介绍</button>
      <button class="tab" onclick="switchTab('cost')">费用说明</button>
      <button class="tab" onclick="switchTab('notes')">报名须知</button>
    </div>
    <div id="tab-content" class="tab-content">
      ${tour.itinerary || '<p style="color:#999;">暂无详细介绍</p>'}
    </div>

    <div class="action-bar">
      <button class="btn-outline" onclick="window.location.href='tel:${tour.contact_phone || ''}'">📞 咨询</button>
      <button class="btn-primary" onclick="window.location.href='tel:${tour.contact_phone || ''}'">立即报名</button>
    </div>
  `;

  container._tourData = tour;
}

function switchTab(tab) {
  const tour = document.getElementById('content')._tourData;
  if (!tour) return;

  document.querySelectorAll('.tab').forEach((t, i) => {
    t.classList.toggle('active', (i === 0 && tab === 'itinerary') || (i === 1 && tab === 'cost') || (i === 2 && tab === 'notes'));
  });

  const contentMap = {
    itinerary: tour.itinerary || '<p style="color:#999;">暂无详细介绍</p>',
    cost: tour.cost_detail || '<p style="color:#999;">暂无费用说明</p>',
    notes: tour.registration_notes || '<p style="color:#999;">暂无报名须知</p>',
  };

  document.getElementById('tab-content').innerHTML = contentMap[tab] || '';
}
