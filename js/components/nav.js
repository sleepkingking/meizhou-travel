function renderNav(container) {
  const currentHash = location.hash.replace('#/', '') || '';
  const nav = document.getElementById('bottom-nav') || document.createElement('nav');
  nav.id = 'bottom-nav';
  nav.className = 'bottom-nav';

  const items = [
    { hash: '', icon: '🏠', label: '首页' },
    { hash: 'tours', icon: '🧭', label: '行程' },
    { hash: 'contact', icon: '📞', label: '联系我们' },
    { hash: 'profile', icon: '👤', label: '个人中心' },
  ];

  nav.innerHTML = items.map(item => {
    const isActive = currentHash === item.hash || (currentHash === '' && item.hash === '');
    return `<button class="nav-item${isActive ? ' active' : ''}" onclick="location.hash='#/${item.hash}'">
      <div class="icon">${item.icon}</div>
      <div class="label">${item.label}</div>
    </button>`;
  }).join('');

  if (!document.getElementById('bottom-nav')) {
    document.getElementById('app').appendChild(nav);
  }
}
