# 梅州嘉园户外旅行展示小程序 — 设计文档

## 概述

为"梅州嘉园户外"制作一个移动端网页应用，用于向客户展示旅游团信息。支持管理员在手机端登录后自主管理商品（上架/下架/编辑）。

**目标用户**: 旅游客户（浏览）+ 管理员老板（管理）
**核心目标**: 展示和宣传旅游团信息，管理员可随时在手机端管理

---

## 技术方案

**全免费云方案：静态前端 + Supabase + Vercel**

| 组件 | 技术 | 说明 |
|------|------|------|
| 前端 | HTML/CSS/JS 单页应用 | 移动端优先，SPA路由 |
| 数据库 | Supabase (PostgreSQL) | 免费 500MB，足够存储数万条行程 |
| 认证 | Supabase Auth | 内置邮箱/密码登录，免费 5万月活用户 |
| 图片存储 | Supabase Storage | 免费 1GB 存储 |
| 托管 | Vercel | 免费托管静态网站，全球CDN加速 |
| 安全 | Row Level Security (RLS) | 数据库层面权限控制，公开用户只能读取已上架行程 |

**总费用：¥0/月**（完全在免费额度内）

---

## 页面结构

### 客户端（4 个页面）

| 页面 | 路由 | 说明 |
|------|------|------|
| 首页 | `#/` | 品牌标题栏 + 轮播Banner + 精选行程卡片列表 + 底部Tab导航 |
| 行程列表 | `#/tours` | 所有已上架行程卡片列表，支持按目的地/天数筛选 |
| 行程详情 | `#/tour/:id` | 封面大图 + 基本信息 + 集合信息 + Tab(行程介绍/费用说明/报名须知) + 底部咨询/报名按钮 |
| 联系我们 | `#/contact` | 电话、微信、地址等联系方式展示 |

### 管理后台（3 个页面）

| 页面 | 路由 | 说明 |
|------|------|------|
| 管理员登录 | `#/admin/login` | 邮箱+密码登录表单 |
| 商品列表 | `#/admin` | 所有行程列表，显示上架/下架状态，支持一键切换、编辑、删除 |
| 新增/编辑 | `#/admin/edit/:id?` | 完整表单，所有字段可编辑，支持图片上传 |

---

## 数据模型

### 行程商品 (tours) — Supabase PostgreSQL

```sql
CREATE TABLE tours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  destination TEXT,
  duration TEXT,
  price_adult NUMERIC,
  price_child NUMERIC,
  departure_dates TEXT,
  meeting_point TEXT,
  meeting_time TEXT,
  cover_image TEXT,               -- Supabase Storage URL
  itinerary TEXT,                 -- 富文本 HTML
  cost_detail TEXT,               -- 费用说明 富文本 HTML
  registration_notes TEXT,        -- 报名须知 富文本 HTML
  max_participants INTEGER,
  contact_phone TEXT,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 存储桶 (Supabase Storage)

```
bucket: tour-images/
  ├── covers/        -- 封面图
  └── gallery/       -- 行程插图
```

---

## 安全策略 (Row Level Security)

```sql
-- 公开用户：只能读取已上架的行程
CREATE POLICY "公开可读已上架行程" ON tours
  FOR SELECT USING (is_published = true);

-- 管理员：可读取所有行程（含下架）
CREATE POLICY "管理员可读所有" ON tours
  FOR SELECT USING (auth.role() = 'authenticated');

-- 管理员：可新增行程
CREATE POLICY "管理员可新增" ON tours
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 管理员：可编辑行程
CREATE POLICY "管理员可编辑" ON tours
  FOR UPDATE USING (auth.role() = 'authenticated');

-- 管理员：可删除行程
CREATE POLICY "管理员可删除" ON tours
  FOR DELETE USING (auth.role() = 'authenticated');
```

---

## 项目结构

```
小程序/
├── index.html              # 入口页面（SPA）
├── css/
│   └── style.css           # 全局样式（移动端优先）
├── js/
│   ├── app.js              # SPA 路由 + 初始化
│   ├── supabase.js         # Supabase 客户端配置
│   ├── pages/
│   │   ├── home.js         # 首页
│   │   ├── tours.js        # 行程列表
│   │   ├── tour-detail.js  # 行程详情
│   │   ├── contact.js      # 联系我们
│   │   ├── admin-login.js  # 管理员登录
│   │   ├── admin-list.js   # 商品管理列表
│   │   └── admin-edit.js   # 新增/编辑表单
│   └── components/
│       ├── nav.js           # 底部导航组件
│       ├── tour-card.js     # 行程卡片组件
│       └── image-upload.js  # 图片上传组件
└── vercel.json              # Vercel 部署配置
```

---

## 管理员操作流程

1. 访问网站，点击页面底部隐藏的"管理"入口
2. 输入管理员邮箱和密码登录
3. 进入商品列表，看到所有行程（含已下架，灰色显示）
4. 点击"新增"按钮，填写表单，上传封面图
5. 行程介绍/费用说明/报名须知使用富文本编辑器
6. 保存后自动上架，客户端立即可见
7. 可随时编辑、下架、删除任何行程

---

## 待确定

1. **域名**: 是否需要独立域名？Vercel 默认提供 `xxx.vercel.app` 免费域名，也可以绑定自己的域名
2. **初始管理员账号**: 首次在 Supabase 后台手动创建，还是写一个初始化脚本
3. **报名功能**: 当前为"展示+咨询"，点击"立即报名"按钮拨打咨询电话或跳转微信
4. **联系我们页面内容**: 需要你提供电话、微信二维码、地址等信息
