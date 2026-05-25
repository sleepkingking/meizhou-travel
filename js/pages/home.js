function renderHome(container) {
  container.innerHTML = `
    <div id="home-page">
      <div class="page-header">梅州嘉园户外</div>
      <div id="home-banner" class="hero-banner skeleton" style="background-color:#e0e0e0;"></div>
      <div class="section-header">
        <h2>精选行程</h2>
        <span class="more" onclick="location.hash='#/tours'">查看更多 →</span>
      </div>
      <div id="featured-tours">${renderSkeleton()}</div>
    </div>
  `;
  loadHomeData();
  setupPullRefresh(container);
}

function renderSkeleton() {
  var cards = '';
  for (var i = 0; i < 3; i++) {
    cards += '<div class="tour-card"><div class="card-cover skeleton"></div><div class="card-body"><div class="skeleton-line" style="width:60%;height:16px;"></div><div class="skeleton-line" style="width:80%;height:12px;margin-top:8px;"></div><div class="skeleton-line" style="width:40%;height:20px;margin-top:8px;"></div></div></div>';
  }
  return cards;
}

function setupPullRefresh(container) {
  var startY = 0;
  var content = container.querySelector('#home-page') || container;
  content.addEventListener('touchstart', function(e) { if (window.scrollY === 0) startY = e.touches[0].pageY; }, { passive: true });
  content.addEventListener('touchmove', function(e) {}, { passive: true });
  content.addEventListener('touchend', function(e) {
    if (window.scrollY === 0 && startY > 0 && e.changedTouches[0].pageY - startY > 80) {
      showToast('刷新中...');
      loadHomeData();
    }
  });
}

async function loadHomeData() {
  var settings = getSettings();
  var tours = Promise.race([getTours(), new Promise(function(r) { setTimeout(function() { r([]); }, 10000); })]);
  var s = await settings;
  var t = await tours;

  // Banner
  var banner = document.getElementById('home-banner');
  if (banner) {
    var bg = s.banner_image ? 'background-image:url(' + s.banner_image + ');background-size:cover;' : 'background-color:#2d5a27;';
    banner.className = 'hero-banner';
    banner.setAttribute('style', bg);
    banner.innerHTML = (s.banner_text || '探索梅园<br>发现自然之美').replace(/\n/g, '<br>');
    // 管理员可点击编辑Banner
    if (currentUser && currentUser.email === 'jiayuanhuwai@admin.com') {
      banner.style.cursor = 'pointer';
      banner.title = '点击编辑Banner';
      banner.onclick = function() { location.hash = '#/admin/settings'; };
    }
  }

  // Tours
  var fc = document.getElementById('featured-tours');
  if (!fc) return;
  if (!t || t.length === 0) {
    fc.innerHTML = '<div class="empty"><div class="icon">🧳</div><p>暂无行程，敬请期待</p></div>';
  } else {
    fc.innerHTML = t.map(function(tour) { return renderTourCard(tour); }).join('');
  }
}

function renderLoading() {
  return '<div style="text-align:center;padding:40px;color:#999;">加载中...</div>';
}
