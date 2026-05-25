async function renderHome(container) {
  container.innerHTML = `
    <div class="page-header">梅州嘉园户外</div>
    <div class="hero-banner" style="background-color: #2d5a27;">
      探索梅州<br>发现自然之美
    </div>
    <div class="section-header">
      <h2>精选行程</h2>
      <span class="more" onclick="location.hash='#/tours'">查看更多 →</span>
    </div>
    <div id="featured-tours">${renderLoading()}</div>
  `;

  // 双重保障：即使 getTours 卡死，10 秒后也强制显示结果
  let tours;
  try {
    tours = await Promise.race([
      getTours(),
      new Promise(resolve => setTimeout(() => resolve([]), 10000))
    ]);
  } catch (e) {
    tours = [];
  }

  const featuredContainer = document.getElementById('featured-tours');
  if (!featuredContainer) return;
  if (tours.length === 0) {
    featuredContainer.innerHTML = `<div class="empty"><div class="icon">🧳</div><p>暂无行程，敬请期待</p></div>`;
  } else {
    featuredContainer.innerHTML = tours.map(t => renderTourCard(t)).join('');
  }
}

function renderLoading() {
  return `<div style="text-align:center;padding:40px;color:#999;">加载中...</div>`;
}
