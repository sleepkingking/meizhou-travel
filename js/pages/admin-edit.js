async function renderAdminEdit(container, id) {
  const isNew = !id || id === 'new';
  const tour = isNew ? null : await getTour(id);

  if (!isNew && !tour) { container.innerHTML = '<div class="empty"><p>行程不存在</p></div>'; return; }

  window._coverUrl = tour?.cover_image || '';

  container.innerHTML = `
    <div class="page-header">
      <span class="back" onclick="history.back()">←</span>
      ${isNew ? '新增行程' : '编辑行程'}
    </div>
    <form class="edit-form" onsubmit="handleSaveTour(event, '${isNew ? '' : id}')">
      <div class="form-group">
        <label>行程名称 *</label>
        <input type="text" id="tour-name" value="${escapeHtml(tour?.name || '')}" required>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>目的地</label>
          <input type="text" id="tour-destination" value="${escapeHtml(tour?.destination || '')}">
        </div>
        <div class="form-group">
          <label>天数</label>
          <input type="text" id="tour-duration" placeholder="如：2天1晚" value="${escapeHtml(tour?.duration || '')}">
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>成人价格 ¥</label>
          <input type="number" id="tour-price-adult" value="${tour?.price_adult || ''}">
        </div>
        <div class="form-group">
          <label>儿童价格 ¥</label>
          <input type="number" id="tour-price-child" value="${tour?.price_child || ''}">
        </div>
        <div class="form-group">
          <label>人数上限</label>
          <input type="number" id="tour-max" value="${tour?.max_participants || 50}">
        </div>
      </div>
      <div class="form-group">
        <label>出发日期</label>
        <input type="text" id="tour-dates" placeholder="如：每周六出发" value="${escapeHtml(tour?.departure_dates || '')}">
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>集合地点</label>
          <input type="text" id="tour-meeting-point" value="${escapeHtml(tour?.meeting_point || '')}">
        </div>
        <div class="form-group">
          <label>集合时间</label>
          <input type="text" id="tour-meeting-time" placeholder="如：早上8:00" value="${escapeHtml(tour?.meeting_time || '')}">
        </div>
      </div>
      <div class="form-group">
        <label>联系电话</label>
        <input type="text" id="tour-phone" value="${escapeHtml(tour?.contact_phone || '')}">
      </div>
      <div class="form-group">
        <label>封面图片</label>
        ${createImageUploader(window._coverUrl, 'setCoverUrl')}
      </div>
      <div class="form-group">
        <label>行程介绍</label>
        ${createRichEditor('itinerary', tour?.itinerary || '')}
      </div>
      <div class="form-group">
        <label>费用说明</label>
        ${createRichEditor('cost_detail', tour?.cost_detail || '')}
      </div>
      <div class="form-group">
        <label>报名须知</label>
        ${createRichEditor('registration_notes', tour?.registration_notes || '')}
      </div>
      ${!isNew ? `
        <div class="form-group">
          <div class="toggle-row">
            <span>上架状态</span>
            <div class="switch${tour.is_published ? ' on' : ''}" id="publish-switch"
                 onclick="this.classList.toggle('on')"></div>
          </div>
        </div>
      ` : ''}
      <button type="submit" class="save-btn">保存</button>
    </form>
  `;
}

function createRichEditor(name, content) {
  return `
    <div class="rich-toolbar">
      <button type="button" onclick="document.execCommand('bold')" title="加粗"><b>B</b></button>
      <button type="button" onclick="document.execCommand('italic')" title="斜体"><i>I</i></button>
      <button type="button" onclick="document.execCommand('underline')" title="下划线"><u>U</u></button>
      <button type="button" onclick="document.execCommand('insertUnorderedList')" title="列表">•≡</button>
      <button type="button" onclick="document.execCommand('insertOrderedList')" title="编号">1.</button>
    </div>
    <div class="rich-editor" id="editor-${name}" contenteditable="true">${content}</div>
  `;
}

async function handleSaveTour(e, id) {
  e.preventDefault();
  const isNew = !id;

  const tourData = {
    name: document.getElementById('tour-name').value,
    destination: document.getElementById('tour-destination').value,
    duration: document.getElementById('tour-duration').value,
    price_adult: parseFloat(document.getElementById('tour-price-adult').value) || 0,
    price_child: parseFloat(document.getElementById('tour-price-child').value) || 0,
    max_participants: parseInt(document.getElementById('tour-max').value) || 50,
    departure_dates: document.getElementById('tour-dates').value,
    meeting_point: document.getElementById('tour-meeting-point').value,
    meeting_time: document.getElementById('tour-meeting-time').value,
    contact_phone: document.getElementById('tour-phone').value,
    cover_image: window._coverUrl,
    itinerary: document.getElementById('editor-itinerary').innerHTML,
    cost_detail: document.getElementById('editor-cost_detail').innerHTML,
    registration_notes: document.getElementById('editor-registration_notes').innerHTML,
    is_published: isNew ? true : document.getElementById('publish-switch').classList.contains('on'),
  };

  let result;
  if (isNew) {
    result = await adminCreateTour(tourData);
  } else {
    result = await adminUpdateTour(id, tourData);
  }

  if (result) {
    showToast(isNew ? '行程已添加' : '行程已更新');
    setTimeout(() => { location.hash = '#/admin'; }, 500);
  } else {
    showToast('保存失败，请重试');
  }
}
