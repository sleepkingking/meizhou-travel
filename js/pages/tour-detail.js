async function renderTourDetail(container, id) {
  if (!id) { location.hash = '#/tours'; return; }
  container.innerHTML = renderLoading();
  var tour;
  try {
    tour = await Promise.race([getTour(id), new Promise(function(r) { setTimeout(function() { r(null); }, 10000); })]);
  } catch(e) { tour = null; }
  if (!tour) { container.innerHTML = '<div class="empty"><p>行程不存在或已下架</p></div>'; return; }

  var gallery = [];
  try { gallery = JSON.parse(tour.gallery || '[]'); } catch(e) { gallery = []; }
  var images = [];
  if (tour.cover_image) images.push(tour.cover_image);
  images = images.concat(gallery);

  var coverStyle = tour.cover_image
    ? 'background-image:url(' + tour.cover_image + ');'
    : 'background:linear-gradient(135deg,#2d5a27,#4a8f3f);';

  container.innerHTML = `
    <div class="page-header"><span class="back" onclick="history.back()">←</span>行程详情</div>
    <div class="detail-cover" style="${coverStyle}">
      ${images.length > 1 ? '<div class="gallery-indicator">1/' + images.length + '</div>' : ''}
    </div>
    ${images.length > 1 ? '<div style="display:flex;gap:4px;padding:8px 16px;overflow-x:auto;" id="gallery-thumbs">' + images.map(function(img, i) {
      return '<img src="' + img + '" style="width:50px;height:40px;border-radius:4px;object-fit:cover;cursor:pointer;border:2px solid ' + (i === 0 ? '#1a73e8' : '#eee') + ';" onclick="switchGalleryImage(' + i + ')">';
    }).join('') + '</div>' : ''}
    <div class="detail-info">
      <div class="title">${escapeHtml(tour.name)}</div>
      <div class="meta-row">
        <span>⏱ ${tour.duration || '待定'}</span>
        <span>📍 ${tour.destination || '待定'}</span>
        <span>📅 ${tour.departure_dates || '待定'}</span>
        ${tour.category ? '<span class="cat-tag small">' + tour.category + '</span>' : ''}
      </div>
      <div class="price">¥${tour.price_adult || 0}<sub>/人起</sub>${tour.price_child ? '<sub style="margin-left:8px;">儿童 ¥' + tour.price_child + '/人</sub>' : ''}</div>
      ${tour.meeting_point ? '<div class="detail-meeting">' + escapeHtml(tour.meeting_point) + (tour.meeting_time ? ' / ' + escapeHtml(tour.meeting_time) : '') + '</div>' : ''}
    </div>
    <div class="tabs">
      <button class="tab active" onclick="switchTab('itinerary')">行程介绍</button>
      <button class="tab" onclick="switchTab('cost')">费用说明</button>
      <button class="tab" onclick="switchTab('notes')">报名须知</button>
    </div>
    <div id="tab-content" class="tab-content">${tour.itinerary || '<p style="color:#999;">暂无详细介绍</p>'}</div>
    <div class="action-bar">
      <button class="btn-outline" onclick="window.location.href='tel:${tour.contact_phone || ''}'">📞 咨询</button>
      <button class="btn-primary" onclick="window.location.href='tel:${tour.contact_phone || ''}'">立即报名</button>
    </div>
  `;

  container._tourData = tour;
  container._galleryImages = images;
}

function switchGalleryImage(index) {
  var container = document.getElementById('content');
  var images = container._galleryImages || [];
  if (!images[index]) return;
  document.querySelector('.detail-cover').style.backgroundImage = 'url(' + images[index] + ')';
  document.querySelector('.gallery-indicator').textContent = (index + 1) + '/' + images.length;
  var thumbs = document.querySelectorAll('#gallery-thumbs img');
  thumbs.forEach(function(t, i) { t.style.borderColor = i === index ? '#1a73e8' : '#eee'; });
}

function switchTab(tab) {
  var tour = document.getElementById('content')._tourData;
  if (!tour) return;
  document.querySelectorAll('.tab').forEach(function(t, i) {
    t.classList.toggle('active', (i === 0 && tab === 'itinerary') || (i === 1 && tab === 'cost') || (i === 2 && tab === 'notes'));
  });
  var map = {
    itinerary: tour.itinerary || '<p style="color:#999;">暂无详细介绍</p>',
    cost: tour.cost_detail || '<p style="color:#999;">暂无费用说明</p>',
    notes: tour.registration_notes || '<p style="color:#999;">暂无报名须知</p>'
  };
  document.getElementById('tab-content').innerHTML = map[tab] || '';
}
