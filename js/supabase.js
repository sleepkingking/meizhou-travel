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
