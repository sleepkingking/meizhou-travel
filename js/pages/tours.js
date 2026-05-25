function renderTours(container) {
  container.innerHTML = `
    <div class="page-header">全部行程</div>
    <div style="padding:8px 16px;">
      <input type="text" id="tour-search" placeholder="🔍 搜索目的地或行程名称..." oninput="loadToursList()"
        style="width:100%;padding:10px 14px;border:1px solid #e0e0e0;border-radius:20px;font-size:0.875rem;box-sizing:border-box;">
    </div>
    <div class="category-tabs" id="category-tabs">
      <span class="cat-tag active" onclick="filterCategory('', this)">全部</span>
      <span class="cat-tag" onclick="filterCategory('徒步', this)">🥾 徒步</span>
      <span class="cat-tag" onclick="filterCategory('亲子', this)">👨‍👩‍👧 亲子</span>
      <span class="cat-tag" onclick="filterCategory('文化', this)">🏛 文化</span>
      <span class="cat-tag" onclick="filterCategory('休闲', this)">🌿 休闲</span>
    </div>
    <div id="tours-list">${renderSkeleton()}</div>
  `;
  window._tourCategory = '';
  loadToursList();
}

function filterCategory(cat, el) {
  window._tourCategory = cat;
  document.querySelectorAll('.cat-tag').forEach(function(t) { t.classList.remove('active'); });
  if (el) el.classList.add('active');
  document.getElementById('tour-search').value = '';
  loadToursList();
}

async function loadToursList() {
  var search = document.getElementById('tour-search') ? document.getElementById('tour-search').value.trim() : '';
  var cat = window._tourCategory || '';
  var container = document.getElementById('tours-list');
  if (!container) return;
  container.innerHTML = renderSkeleton();

  var tours = [];
  try {
    tours = await Promise.race([getTours(search, cat), new Promise(function(r) { setTimeout(function() { r([]); }, 10000); })]);
  } catch(e) {}
  if (!tours || tours.length === 0) {
    container.innerHTML = '<div class="empty"><div class="icon">🧳</div><p>暂无匹配行程</p></div>';
  } else {
    container.innerHTML = tours.map(function(t) { return renderTourCard(t); }).join('');
  }
}
