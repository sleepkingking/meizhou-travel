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
