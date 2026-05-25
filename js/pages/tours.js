async function renderTours(container) {
  container.innerHTML = `
    <div class="page-header">全部行程</div>
    <div id="tours-list">${renderLoading()}</div>
  `;

  let tours;
  try {
    tours = await Promise.race([
      getTours(),
      new Promise(resolve => setTimeout(() => resolve([]), 10000))
    ]);
  } catch (e) { tours = []; }
  const listContainer = document.getElementById('tours-list');
  if (!listContainer) return;
  if (tours.length === 0) {
    listContainer.innerHTML = `<div class="empty"><div class="icon">🧳</div><p>暂无行程</p></div>`;
  } else {
    listContainer.innerHTML = tours.map(t => renderTourCard(t)).join('');
  }
}
