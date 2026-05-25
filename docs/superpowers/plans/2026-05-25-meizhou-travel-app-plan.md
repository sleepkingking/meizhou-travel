# 梅州嘉园户外旅行展示小程序 — 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建一个移动端旅游团展示网页应用，客户端浏览行程信息，管理员可在手机端登录管理商品（CRUD + 上下架）。

**Architecture:** 纯静态前端 SPA（Hash路由） + Supabase 后端（数据库、认证、存储）。前端通过 Supabase JS SDK 直接读写数据，Row Level Security 在数据库层控制权限。部署到 Vercel 免费托管。

**Tech Stack:** HTML5 + CSS3 + Vanilla JS (ES6+) + Supabase JS SDK v2 (CDN) + Vercel

---

### Task 1: Supabase 项目创建与数据库初始化

**Files:**
- Create: `database/init.sql`

- [ ] **Step 1: 创建 Supabase 项目**

在浏览器中打开 https://supabase.com，注册账号后创建新项目。记下项目 URL 和 anon key。

- [ ] **Step 2: 创建数据库初始化 SQL 文件**

```sql
-- 创建 tours 表
CREATE TABLE tours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  destination TEXT DEFAULT '',
  duration TEXT DEFAULT '',
  price_adult NUMERIC DEFAULT 0,
  price_child NUMERIC DEFAULT 0,
  departure_dates TEXT DEFAULT '',
  meeting_point TEXT DEFAULT '',
  meeting_time TEXT DEFAULT '',
  cover_image TEXT DEFAULT '',
  itinerary TEXT DEFAULT '',
  cost_detail TEXT DEFAULT '',
  registration_notes TEXT DEFAULT '',
  max_participants INTEGER DEFAULT 50,
  contact_phone TEXT DEFAULT '',
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 启用 Row Level Security
ALTER TABLE tours ENABLE ROW LEVEL SECURITY;

-- 公开用户：只能读取已上架的行程
CREATE POLICY "public_read_published" ON tours
  FOR SELECT USING (is_published = true);

-- 认证用户（管理员）：可读取所有行程
CREATE POLICY "admin_read_all" ON tours
  FOR SELECT USING (auth.role() = 'authenticated');

-- 认证用户：可新增行程
CREATE POLICY "admin_insert" ON tours
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 认证用户：可编辑行程
CREATE POLICY "admin_update" ON tours
  FOR UPDATE USING (auth.role() = 'authenticated');

-- 认证用户：可删除行程
CREATE POLICY "admin_delete" ON tours
  FOR DELETE USING (auth.role() = 'authenticated');
```

- [ ] **Step 3: 在 Supabase SQL Editor 中执行**

打开 Supabase 项目 → SQL Editor → 粘贴以上 SQL → 点击 Run。

- [ ] **Step 4: 创建存储桶**

Supabase → Storage → New Bucket → 名称 `tour-images`，勾选 "Public bucket"。

- [ ] **Step 5: 启用 Email 认证**

Supabase → Authentication → Providers → 确保 Email 已启用（默认开启）。

- [ ] **Step 6: 创建管理员账号**

Supabase → Authentication → Users → Add User → 输入管理员邮箱和密码。记下邮箱和密码。

- [ ] **Step 7: 提交**

```bash
git add database/init.sql
git commit -m "feat: add database initialization SQL with RLS policies"
```

---

### Task 2: 项目脚手架与入口文件

**Files:**
- Create: `index.html`
- Create: `css/style.css`
- Create: `vercel.json`

- [ ] **Step 1: 创建入口 HTML 文件**

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>梅州嘉园户外</title>
  <link rel="stylesheet" href="css/style.css">
  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
</head>
<body>
  <div id="app">
    <main id="content"></main>
  </div>

  <!-- 基础库 -->
  <script src="js/supabase.js"></script>
  <!-- 组件 -->
  <script src="js/components/tour-card.js"></script>
  <script src="js/components/image-upload.js"></script>
  <script src="js/components/nav.js"></script>
  <!-- 页面 -->
  <script src="js/pages/home.js"></script>
  <script src="js/pages/tours.js"></script>
  <script src="js/pages/tour-detail.js"></script>
  <script src="js/pages/contact.js"></script>
  <script src="js/pages/admin-login.js"></script>
  <script src="js/pages/admin-list.js"></script>
  <script src="js/pages/admin-edit.js"></script>
  <!-- 主应用 -->
  <script src="js/app.js"></script>
</body>
</html>
```

- [ ] **Step 2: 创建全局 CSS**

```css
/* === Reset & Base === */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { font-size: 16px; -webkit-tap-highlight-color: transparent; }
body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
  background: #f5f5f5; color: #333; line-height: 1.6;
  display: flex; justify-content: center;
}
#app { width: 100%; max-width: 480px; min-height: 100vh; background: #fff; position: relative; }
#content { padding-bottom: 70px; }

/* === Typography === */
h2 { font-size: 1.25rem; font-weight: 700; }
h3 { font-size: 1rem; font-weight: 600; }

/* === Header === */
.page-header {
  background: #fff; padding: 12px 16px; text-align: center; font-size: 1.125rem;
  font-weight: 700; border-bottom: 1px solid #eee; position: sticky; top: 0; z-index: 100;
}
.page-header .back { position: absolute; left: 16px; top: 50%; transform: translateY(-50%); font-size: 1.25rem; cursor: pointer; }

/* === Hero Banner === */
.hero-banner {
  margin: 12px 16px; border-radius: 12px; height: 160px; overflow: hidden;
  display: flex; align-items: center; justify-content: center;
  background: linear-gradient(135deg, #2d5a27, #4a8f3f);
  color: #fff; font-size: 1.375rem; font-weight: 700; text-align: center; padding: 20px;
  background-size: cover; background-position: center;
}

/* === Section === */
.section-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 12px 16px 8px;
}
.section-header h2 { font-size: 1rem; }
.section-header .more { font-size: 0.8125rem; color: #1a73e8; cursor: pointer; }

/* === Tour Card === */
.tour-card {
  margin: 8px 16px; background: #fff; border-radius: 12px; overflow: hidden;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08); cursor: pointer;
}
.tour-card .card-cover {
  height: 140px; background: #e0e0e0; display: flex; align-items: center;
  justify-content: center; color: #999; font-size: 0.875rem;
  background-size: cover; background-position: center;
}
.tour-card .card-body { padding: 12px; }
.tour-card .card-title { font-size: 1rem; font-weight: 700; margin-bottom: 4px; }
.tour-card .card-meta { font-size: 0.8125rem; color: #888; margin-bottom: 8px; }
.tour-card .card-footer { display: flex; justify-content: space-between; align-items: center; }
.tour-card .card-price { color: #e8553d; font-size: 1.25rem; font-weight: 700; }
.tour-card .card-price small { font-size: 0.75rem; color: #999; font-weight: 400; }
.tour-card .card-btn {
  background: #1a73e8; color: #fff; padding: 6px 16px; border-radius: 20px;
  font-size: 0.8125rem; border: none; cursor: pointer;
}
.tour-card.offline { opacity: 0.4; }

/* === Bottom Nav === */
.bottom-nav {
  position: fixed; bottom: 0; width: 100%; max-width: 480px; background: #fff;
  border-top: 1px solid #eee; display: flex; justify-content: space-around;
  padding: 8px 0 env(safe-area-inset-bottom, 8px); z-index: 200;
}
.bottom-nav .nav-item {
  text-align: center; color: #999; cursor: pointer; padding: 4px 12px; border: none; background: none;
}
.bottom-nav .nav-item.active { color: #1a73e8; }
.bottom-nav .nav-item .icon { font-size: 1.25rem; }
.bottom-nav .nav-item .label { font-size: 0.6875rem; margin-top: 2px; }

/* === Detail Page === */
.detail-cover { height: 200px; background: #e0e0e0; background-size: cover; background-position: center; }
.detail-info { padding: 16px; }
.detail-info .title { font-size: 1.25rem; font-weight: 700; margin-bottom: 8px; }
.detail-info .meta-row { display: flex; gap: 16px; margin-bottom: 12px; font-size: 0.8125rem; color: #666; }
.detail-info .price { color: #e8553d; font-size: 1.75rem; font-weight: 700; margin-bottom: 12px; }
.detail-info .price sub { font-size: 0.75rem; color: #999; font-weight: 400; }
.detail-meeting { background: #fff7e6; padding: 10px 12px; border-radius: 8px; font-size: 0.8125rem; color: #8b6914; }

/* === Tabs === */
.tabs { display: flex; border-bottom: 2px solid #eee; margin: 0 16px; }
.tabs .tab {
  padding: 10px 16px; font-size: 0.875rem; color: #999; cursor: pointer;
  border-bottom: 2px solid transparent; margin-bottom: -2px; border: none; background: none;
}
.tabs .tab.active { color: #1a73e8; border-bottom-color: #1a73e8; font-weight: 700; }

/* === Tab Content === */
.tab-content { padding: 16px; font-size: 0.875rem; line-height: 1.8; }
.tab-content img { max-width: 100%; border-radius: 8px; margin: 8px 0; }

/* === Bottom Action Bar === */
.action-bar {
  position: sticky; bottom: 0; background: #fff; padding: 12px 16px;
  border-top: 1px solid #eee; display: flex; gap: 12px; align-items: center;
  padding-bottom: env(safe-area-inset-bottom, 12px);
}
.action-bar .btn-outline { flex: 1; text-align: center; padding: 12px; background: #f5f5f5; border-radius: 24px; font-size: 0.875rem; cursor: pointer; border: none; }
.action-bar .btn-primary { flex: 2; text-align: center; padding: 12px; background: #e8553d; color: #fff; border-radius: 24px; font-size: 0.875rem; font-weight: 600; cursor: pointer; border: none; }

/* === Contact Page === */
.contact-card { margin: 16px; padding: 20px; background: #f9f9f9; border-radius: 12px; text-align: center; }
.contact-card .icon { font-size: 2.5rem; margin-bottom: 12px; }
.contact-card .phone { font-size: 1.5rem; font-weight: 700; color: #1a73e8; margin-bottom: 8px; }
.contact-card .qrcode { width: 160px; height: 160px; background: #e0e0e0; margin: 12px auto; border-radius: 8px; }

/* === Admin Login === */
.login-form { padding: 40px 24px; text-align: center; }
.login-form h2 { margin-bottom: 24px; }
.login-form input {
  width: 100%; padding: 12px; border-radius: 8px; border: 1px solid #ddd;
  font-size: 0.875rem; margin-bottom: 12px;
}
.login-form button {
  width: 100%; padding: 12px; background: #1a73e8; color: #fff; border: none;
  border-radius: 24px; font-size: 1rem; font-weight: 600; cursor: pointer;
}
.login-form .error { color: #e8553d; font-size: 0.8125rem; margin-top: 8px; }

/* === Admin List === */
.admin-list { padding: 12px 16px; }
.admin-list .list-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.admin-list .add-btn { background: #1a73e8; color: #fff; padding: 8px 20px; border-radius: 20px; font-size: 0.875rem; border: none; cursor: pointer; }
.admin-list .admin-actions { display: flex; gap: 4px; }
.admin-list .admin-actions button { padding: 4px 10px; border-radius: 4px; font-size: 0.6875rem; border: none; cursor: pointer; }
.admin-list .btn-edit { background: #f0f0f0; color: #333; }
.admin-list .btn-toggle-on { background: #e8f5e9; color: #2e7d32; }
.admin-list .btn-toggle-off { background: #ffebee; color: #c62828; }
.admin-list .btn-delete { background: #ffebee; color: #c62828; }

/* === Admin Edit Form === */
.edit-form { padding: 16px; }
.edit-form .form-group { margin-bottom: 12px; }
.edit-form label { display: block; font-size: 0.8125rem; color: #666; margin-bottom: 4px; }
.edit-form input, .edit-form textarea, .edit-form select {
  width: 100%; padding: 10px; border-radius: 6px; border: 1px solid #ddd; font-size: 0.875rem;
}
.edit-form textarea { min-height: 80px; resize: vertical; }
.edit-form .form-row { display: flex; gap: 8px; }
.edit-form .form-row > * { flex: 1; }
.edit-form .image-upload {
  border: 2px dashed #1a73e8; border-radius: 8px; padding: 20px;
  text-align: center; color: #1a73e8; font-size: 0.875rem; cursor: pointer; background: #f0f8ff;
}
.edit-form .image-upload img { max-width: 100%; max-height: 200px; border-radius: 8px; }
.edit-form .save-btn {
  width: 100%; padding: 12px; background: #e8553d; color: #fff; border: none;
  border-radius: 24px; font-size: 1rem; font-weight: 600; cursor: pointer; margin-top: 8px;
}
.edit-form .toggle-row { display: flex; align-items: center; justify-content: space-between; }
.edit-form .toggle-row .switch {
  width: 48px; height: 28px; background: #ccc; border-radius: 14px; cursor: pointer; position: relative;
}
.edit-form .toggle-row .switch.on { background: #4caf50; }
.edit-form .toggle-row .switch::after {
  content: ''; position: absolute; width: 24px; height: 24px; border-radius: 50%;
  background: #fff; top: 2px; left: 2px; transition: left 0.2s;
}
.edit-form .toggle-row .switch.on::after { left: 22px; }

/* === Rich Text Toolbar === */
.rich-toolbar {
  display: flex; gap: 4px; padding: 4px; background: #f5f5f5; border: 1px solid #ddd;
  border-radius: 6px 6px 0 0;
}
.rich-toolbar button {
  width: 32px; height: 28px; display: flex; align-items: center; justify-content: center;
  background: #fff; border: 1px solid #ddd; border-radius: 4px; cursor: pointer; font-size: 0.8125rem;
}
.rich-editor {
  min-height: 120px; padding: 10px; border: 1px solid #ddd; border-top: none;
  border-radius: 0 0 6px 6px; font-size: 0.875rem; line-height: 1.6; outline: none;
}

/* === Toast === */
.toast {
  position: fixed; top: 20px; left: 50%; transform: translateX(-50%); z-index: 999;
  background: #333; color: #fff; padding: 10px 24px; border-radius: 20px; font-size: 0.875rem;
  animation: fadeInOut 2s ease;
}
@keyframes fadeInOut {
  0%, 100% { opacity: 0; }
  10%, 90% { opacity: 1; }
}

/* === Empty State === */
.empty { text-align: center; padding: 60px 20px; color: #999; }
.empty .icon { font-size: 3rem; margin-bottom: 12px; }
```

- [ ] **Step 3: 创建 Vercel 部署配置**

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

- [ ] **Step 4: 提交**

```bash
git add index.html css/style.css vercel.json
git commit -m "feat: add project scaffold with index.html, global CSS, and Vercel config"
```

---

### Task 3: Supabase 客户端配置

**Files:**
- Create: `js/supabase.js`

- [ ] **Step 1: 创建 Supabase 客户端文件**

```javascript
// Supabase 客户端初始化
// 替换为你的 Supabase 项目 URL 和 anon key
const SUPABASE_URL = 'https://your-project-id.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key-here';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// === 公开接口 ===

async function getTours() {
  const { data, error } = await supabase
    .from('tours')
    .select('*')
    .eq('is_published', true)
    .order('created_at', { ascending: false });
  if (error) { console.error('getTours error:', error); return []; }
  return data;
}

async function getTour(id) {
  const { data, error } = await supabase
    .from('tours')
    .select('*')
    .eq('id', id)
    .single();
  if (error) { console.error('getTour error:', error); return null; }
  return data;
}

// === 管理接口（需登录）===

async function adminGetAllTours() {
  const { data, error } = await supabase
    .from('tours')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) { console.error('adminGetAllTours error:', error); return []; }
  return data;
}

async function adminCreateTour(tour) {
  const { data, error } = await supabase
    .from('tours')
    .insert([tour])
    .select()
    .single();
  if (error) { console.error('adminCreateTour error:', error); return null; }
  return data;
}

async function adminUpdateTour(id, tour) {
  const { data, error } = await supabase
    .from('tours')
    .update({ ...tour, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) { console.error('adminUpdateTour error:', error); return null; }
  return data;
}

async function adminDeleteTour(id) {
  const { error } = await supabase
    .from('tours')
    .delete()
    .eq('id', id);
  if (error) { console.error('adminDeleteTour error:', error); return false; }
  return true;
}

async function adminTogglePublish(id, currentStatus) {
  const { error } = await supabase
    .from('tours')
    .update({ is_published: !currentStatus, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) { console.error('adminTogglePublish error:', error); return false; }
  return true;
}

// === 认证 ===

async function adminLogin(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) { console.error('adminLogin error:', error); return null; }
  return data;
}

async function adminLogout() {
  await supabase.auth.signOut();
}

async function getAdminSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

// === 图片上传 ===

async function uploadImage(file) {
  const fileName = `${Date.now()}_${file.name}`;
  const { data, error } = await supabase.storage
    .from('tour-images')
    .upload(`covers/${fileName}`, file);
  if (error) { console.error('uploadImage error:', error); return null; }
  const { data: urlData } = supabase.storage
    .from('tour-images')
    .getPublicUrl(`covers/${fileName}`);
  return urlData.publicUrl;
}
```

- [ ] **Step 2: 暂不提交（等后续配置实际 Supabase 凭据后再提交）**

---

### Task 4: SPA 路由与主应用

**Files:**
- Create: `js/app.js`

- [ ] **Step 1: 创建路由和应用入口**

```javascript
// === 简易 Hash 路由 ===

let currentUser = null;

const routes = {
  '': renderHome,
  'tours': renderTours,
  'tour': renderTourDetail,
  'contact': renderContact,
  'admin': renderAdminList,
  'admin/login': renderAdminLogin,
  'admin/edit': renderAdminEdit,
};

async function initApp() {
  // 检查管理员登录状态
  const session = await getAdminSession();
  currentUser = session?.user || null;
  route();
}

function route() {
  const hash = location.hash.replace('#/', '');
  const [path, param] = hash.split('/').length > 1
    ? [hash.split('/')[0], hash.split('/').slice(1).join('/')]
    : [hash, null];

  const renderFn = routes[path];
  if (!renderFn) { location.hash = '#/'; return; }

  const content = document.getElementById('content');
  if (renderFn === renderHome || renderFn === renderTours || renderFn === renderContact) {
    renderFn(content);
    renderNav(content);
  } else if (renderFn === renderTourDetail) {
    renderFn(content, param);
  } else if (renderFn === renderAdminList) {
    if (!currentUser) { location.hash = '#/admin/login'; return; }
    renderFn(content);
  } else if (renderFn === renderAdminLogin) {
    if (currentUser) { location.hash = '#/admin'; return; }
    renderFn(content);
  } else if (renderFn === renderAdminEdit) {
    if (!currentUser) { location.hash = '#/admin/login'; return; }
    renderFn(content, param);
  }
}

window.addEventListener('hashchange', route);
window.addEventListener('DOMContentLoaded', initApp);
```

- [ ] **Step 2: 提交**

```bash
git add js/app.js
git commit -m "feat: add SPA hash router and app entry point"
```

---

### Task 5: 底部导航组件

**Files:**
- Create: `js/components/nav.js`

- [ ] **Step 1: 创建导航组件**

```javascript
function renderNav(container) {
  const currentHash = location.hash.replace('#/', '') || '';
  const nav = document.getElementById('bottom-nav') || document.createElement('nav');
  nav.id = 'bottom-nav';
  nav.className = 'bottom-nav';

  const items = [
    { hash: '', icon: '🏠', label: '首页' },
    { hash: 'tours', icon: '🧭', label: '行程' },
    { hash: 'contact', icon: '📞', label: '联系我们' },
  ];

  nav.innerHTML = items.map(item => `
    <button class="nav-item${currentHash === item.hash || (currentHash === '' && item.hash === '') ? ' active' : ''}"
            onclick="location.hash='#/${item.hash}'">
      <div class="icon">${item.icon}</div>
      <div class="label">${item.label}</div>
    </button>
  `).join('');

  if (!document.getElementById('bottom-nav')) {
    document.getElementById('app').appendChild(nav);
  }
}
```

- [ ] **Step 2: 提交**

```bash
git add js/components/nav.js
git commit -m "feat: add bottom navigation component"
```

---

### Task 6: 行程卡片组件

**Files:**
- Create: `js/components/tour-card.js`

- [ ] **Step 1: 创建卡片组件**

```javascript
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
  if (!confirm('确定要${currentStatus ? '下架' : '上架'}这个行程吗？')) return;
  const ok = await adminTogglePublish(id, currentStatus);
  if (ok) { showToast(currentStatus ? '已下架' : '已上架'); route(); }
}

async function handleDelete(id) {
  if (!confirm('确定要删除这个行程吗？此操作不可恢复。')) return;
  const ok = await adminDeleteTour(id);
  if (ok) { showToast('已删除'); route(); }
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
```

- [ ] **Step 2: 提交**

```bash
git add js/components/tour-card.js
git commit -m "feat: add tour card component with admin actions"
```

---

### Task 7: 首页

**Files:**
- Create: `js/pages/home.js`

- [ ] **Step 1: 创建首页**

```javascript
async function renderHome(container) {
  container.innerHTML = `
    <div class="page-header">梅州嘉园户外</div>
    <div class="hero-banner" style="background-image: url(''); background-color: #2d5a27;">
      探索梅州<br>发现自然之美
    </div>
    <div class="section-header">
      <h2>精选行程</h2>
      <span class="more" onclick="location.hash='#/tours'">查看更多 →</span>
    </div>
    <div id="featured-tours">${renderLoading()}</div>
  `;

  const tours = await getTours();
  const featuredContainer = document.getElementById('featured-tours');
  if (tours.length === 0) {
    featuredContainer.innerHTML = `<div class="empty"><div class="icon">🧳</div><p>暂无行程，敬请期待</p></div>`;
  } else {
    featuredContainer.innerHTML = tours.map(t => renderTourCard(t)).join('');
  }
}

function renderLoading() {
  return `<div style="text-align:center;padding:40px;color:#999;">加载中...</div>`;
}
```

- [ ] **Step 2: 提交**

```bash
git add js/pages/home.js
git commit -m "feat: add home page with hero banner and featured tours"
```

---

### Task 8: 行程列表页

**Files:**
- Create: `js/pages/tours.js`

- [ ] **Step 1: 创建行程列表页**

```javascript
async function renderTours(container) {
  container.innerHTML = `
    <div class="page-header">全部行程</div>
    <div id="tours-list">${renderLoading()}</div>
  `;

  const tours = await getTours();
  const listContainer = document.getElementById('tours-list');
  if (tours.length === 0) {
    listContainer.innerHTML = `<div class="empty"><div class="icon">🧳</div><p>暂无行程</p></div>`;
  } else {
    listContainer.innerHTML = tours.map(t => renderTourCard(t)).join('');
  }
}
```

- [ ] **Step 2: 提交**

```bash
git add js/pages/tours.js
git commit -m "feat: add tours list page"
```

---

### Task 9: 行程详情页

**Files:**
- Create: `js/pages/tour-detail.js`

- [ ] **Step 1: 创建行程详情页**

```javascript
async function renderTourDetail(container, id) {
  if (!id) { location.hash = '#/tours'; return; }

  container.innerHTML = renderLoading();

  const tour = await getTour(id);
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

  // 存储当前行程数据用于 Tab 切换
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
```

- [ ] **Step 2: 提交**

```bash
git add js/pages/tour-detail.js
git commit -m "feat: add tour detail page with tabs and action bar"
```

---

### Task 10: 联系我们页面

**Files:**
- Create: `js/pages/contact.js`

- [ ] **Step 1: 创建联系我们页面**

```javascript
function renderContact(container) {
  // 替换为你的实际联系方式
  const phone = '138XXXX8888';
  const wechat = 'meizhoujiayuan';

  container.innerHTML = `
    <div class="page-header">联系我们</div>
    <div class="contact-card">
      <div class="icon">📞</div>
      <div class="phone" onclick="window.location.href='tel:${phone}'">${phone}</div>
      <p style="color:#888;font-size:0.875rem;">点击拨打电话咨询</p>
    </div>
    <div class="contact-card">
      <div class="icon">💬</div>
      <p style="font-weight:600;margin-bottom:4px;">微信咨询</p>
      <div class="qrcode" id="qrcode-placeholder" style="display:flex;align-items:center;justify-content:center;color:#999;font-size:0.75rem;">微信二维码<br>敬请上传</div>
      <p style="color:#888;font-size:0.8125rem;">微信号：${wechat}</p>
    </div>
    <div class="contact-card">
      <div class="icon">📍</div>
      <p style="font-weight:600;">梅州嘉园户外</p>
      <p style="color:#888;font-size:0.875rem;">梅州市梅江区（地址待补充）</p>
    </div>
  `;
}
```

- [ ] **Step 2: 提交**

```bash
git add js/pages/contact.js
git commit -m "feat: add contact page with phone, WeChat, and address"
```

---

### Task 11: 管理员登录页

**Files:**
- Create: `js/pages/admin-login.js`

- [ ] **Step 1: 创建管理员登录页**

```javascript
function renderAdminLogin(container) {
  container.innerHTML = `
    <div class="login-form">
      <div style="font-size:3rem;margin-bottom:16px;">🔐</div>
      <h2>管理员登录</h2>
      <form onsubmit="handleLogin(event)">
        <input type="email" id="login-email" placeholder="请输入管理员邮箱" required autocomplete="email">
        <input type="password" id="login-password" placeholder="请输入密码" required autocomplete="current-password">
        <div id="login-error" class="error"></div>
        <button type="submit">登 录</button>
      </form>
    </div>
  `;
}

async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  const errorEl = document.getElementById('login-error');

  const result = await adminLogin(email, password);
  if (result) {
    currentUser = result.user;
    location.hash = '#/admin';
  } else {
    errorEl.textContent = '登录失败，请检查邮箱和密码';
  }
}
```

- [ ] **Step 2: 提交**

```bash
git add js/pages/admin-login.js
git commit -m "feat: add admin login page"
```

---

### Task 12: 管理员商品列表页

**Files:**
- Create: `js/pages/admin-list.js`

- [ ] **Step 1: 创建管理员商品列表页**

```javascript
async function renderAdminList(container) {
  container.innerHTML = `
    <div class="page-header">
      <span class="back" onclick="location.hash='#/'">←</span>
      行程管理
    </div>
    <div class="admin-list">
      <div class="list-header">
        <span style="font-size:0.875rem;color:#888;">共管理所有行程</span>
        <button class="add-btn" onclick="location.hash='#/admin/edit/new'">+ 新增</button>
      </div>
      <div id="admin-tours-list">${renderLoading()}</div>
      <div style="text-align:center;padding:20px;">
        <button style="background:none;border:none;color:#e8553d;cursor:pointer;font-size:0.875rem;"
                onclick="handleLogout()">退出登录</button>
      </div>
    </div>
  `;

  const tours = await adminGetAllTours();
  const listContainer = document.getElementById('admin-tours-list');
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
```

- [ ] **Step 2: 提交**

```bash
git add js/pages/admin-list.js
git commit -m "feat: add admin tour list page with publish toggle and delete"
```

---

### Task 13: 图片上传组件

**Files:**
- Create: `js/components/image-upload.js`

- [ ] **Step 1: 创建图片上传组件**

```javascript
function createImageUploader(currentUrl, onUploaded) {
  return `
    <div class="image-upload" id="image-upload-area" onclick="document.getElementById('file-input').click()">
      <input type="file" id="file-input" accept="image/*" style="display:none"
             onchange="handleImageSelect(event, '${onUploaded}')">
      ${currentUrl
        ? `<img src="${currentUrl}" alt="封面图"><p style="font-size:0.75rem;margin-top:8px;">点击更换图片</p>`
        : `📷 点击上传封面图<p style="font-size:0.75rem;margin-top:4px;">支持 JPG/PNG/WebP，最大 5MB</p>`
      }
    </div>
  `;
}

async function handleImageSelect(event, callbackName) {
  const file = event.target.files[0];
  if (!file) return;
  if (file.size > 5 * 1024 * 1024) { showToast('图片大小不能超过5MB'); return; }

  const area = document.getElementById('image-upload-area');
  area.innerHTML = '<p>上传中...</p>';

  const url = await uploadImage(file);
  if (url) {
    area.innerHTML = `<img src="${url}" alt="封面图"><p style="font-size:0.75rem;margin-top:8px;">上传成功，点击更换</p>`;
    if (callbackName === 'setCoverUrl') {
      window._coverUrl = url;
    }
  } else {
    area.innerHTML = '📷 上传失败，请重试';
  }
}
```

- [ ] **Step 2: 提交**

```bash
git add js/components/image-upload.js
git commit -m "feat: add image upload component with preview"
```

---

### Task 14: 管理员新增/编辑商品页

**Files:**
- Create: `js/pages/admin-edit.js`

- [ ] **Step 1: 创建编辑页面**

```javascript
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
```

- [ ] **Step 2: 添加 showToast 工具函数到 app.js**

在 `js/app.js` 末尾追加：

```javascript
function showToast(message) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  document.getElementById('app').appendChild(toast);
  setTimeout(() => toast.remove(), 2100);
}
```

- [ ] **Step 3: 提交**

```bash
git add js/pages/admin-edit.js js/app.js
git commit -m "feat: add admin tour edit page with rich text editor and image upload"
```

---

### Task 15: 最终集成与测试

**Files:**
- Modify: `index.html`
- Modify: `js/supabase.js`

- [ ] **Step 1: 替换 Supabase 凭据**

在 `js/supabase.js` 中将 `SUPABASE_URL` 和 `SUPABASE_ANON_KEY` 替换为实际值（从 Supabase 项目设置 → API 中获取）。

- [ ] **Step 2: 更新联系我们页面信息**

在 `js/pages/contact.js` 中将联系电话、微信、地址替换为你的实际信息。

- [ ] **Step 3: 本地测试**

```bash
# 用任意 HTTP 服务器在本地测试（Supabase 需要 HTTP 协议）
npx serve .
# 打开 http://localhost:3000，测试所有页面功能
```

- [ ] **Step 4: 部署到 Vercel**

```bash
# 安装 Vercel CLI（一次性）
npm i -g vercel
# 部署
vercel
# 按提示操作，选择默认配置即可
```

- [ ] **Step 5: 提交**

```bash
git add -A
git commit -m "feat: configure Supabase credentials and complete integration"
```

---

### Task 16: 提供管理员入口

- [ ] **Step 1: 在首页底部添加隐藏管理入口**

在 `js/pages/home.js` 的 `renderHome` 函数返回的 HTML 中，在底部导航上方添加：

```javascript
// 在 renderHome 的 innerHTML 末尾（</div> 之前）添加：
`<div style="text-align:center;padding:20px 0 80px;">
  <span style="color:#ccc;font-size:0.75rem;cursor:pointer;"
        onclick="location.hash='#/admin/login'">管理入口</span>
</div>`
```

- [ ] **Step 2: 提交**

```bash
git add js/pages/home.js
git commit -m "feat: add subtle admin entry on home page"
```

---

## 部署后检查清单

- [ ] 公开访问：能看到首页，行程列表正常加载
- [ ] 管理员登录：能成功登录
- [ ] 新增行程：填写表单、上传图片、保存成功
- [ ] 编辑行程：修改信息、保存生效
- [ ] 上架/下架：切换后公开页面实时反映
- [ ] 删除行程：确认删除后不可见
- [ ] 手机端：所有页面在手机上正常显示和操作
