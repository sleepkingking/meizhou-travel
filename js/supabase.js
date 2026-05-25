// Supabase 客户端初始化
const SUPABASE_URL = 'https://okrseebqgaqbspfjfmew.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_WYUOGccf5IiJqM512U_NAw_MrsdTkrA';

// 自定义 fetch 带超时（8秒），防止网络不通时页面卡死
const fetchWithTimeout = (url, options = {}) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);
  return fetch(url, { ...options, signal: controller.signal }).finally(() => clearTimeout(timeoutId));
};

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  global: { fetch: fetchWithTimeout }
});

// === 公开接口 ===

async function getTours() {
  try {
    const { data, error } = await supabase
      .from('tours')
      .select('*')
      .eq('is_published', true)
      .order('created_at', { ascending: false });
    if (error) { console.error('getTours error:', error); return []; }
    return data;
  } catch (e) { console.error('getTours failed:', e.message); return []; }
}

async function getTour(id) {
  try {
    const { data, error } = await supabase
      .from('tours')
      .select('*')
      .eq('id', id)
      .single();
    if (error) { console.error('getTour error:', error); return null; }
    return data;
  } catch (e) { console.error('getTour failed:', e.message); return null; }
}

// === 管理接口（需登录）===

async function adminGetAllTours() {
  try {
    const { data, error } = await supabase
      .from('tours')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) { console.error('adminGetAllTours error:', error); return []; }
    return data;
  } catch (e) { console.error('adminGetAllTours failed:', e.message); return []; }
}

async function adminCreateTour(tour) {
  try {
    const { data, error } = await supabase
      .from('tours')
      .insert([tour])
      .select()
      .single();
    if (error) { console.error('adminCreateTour error:', error); return null; }
    return data;
  } catch (e) { console.error('adminCreateTour failed:', e.message); return null; }
}

async function adminUpdateTour(id, tour) {
  try {
    const { data, error } = await supabase
      .from('tours')
      .update({ ...tour, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) { console.error('adminUpdateTour error:', error); return null; }
    return data;
  } catch (e) { console.error('adminUpdateTour failed:', e.message); return null; }
}

async function adminDeleteTour(id) {
  try {
    const { error } = await supabase
      .from('tours')
      .delete()
      .eq('id', id);
    if (error) { console.error('adminDeleteTour error:', error); return false; }
    return true;
  } catch (e) { console.error('adminDeleteTour failed:', e.message); return false; }
}

async function adminTogglePublish(id, currentStatus) {
  try {
    const { error } = await supabase
      .from('tours')
      .update({ is_published: !currentStatus, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) { console.error('adminTogglePublish error:', error); return false; }
    return true;
  } catch (e) { console.error('adminTogglePublish failed:', e.message); return false; }
}

// === 认证 ===

async function adminLogin(email, password) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { console.error('adminLogin error:', error); return null; }
    return data;
  } catch (e) { console.error('adminLogin failed:', e.message); return null; }
}

async function adminLogout() {
  try { await supabase.auth.signOut(); } catch (e) {}
}

async function getAdminSession() {
  try {
    const { data } = await supabase.auth.getSession();
    return data.session;
  } catch (e) { return null; }
}

// === 图片上传 ===

async function uploadImage(file) {
  try {
    const fileName = `${Date.now()}_${file.name}`;
    const { data, error } = await supabase.storage
      .from('tour-images')
      .upload(`covers/${fileName}`, file);
    if (error) { console.error('uploadImage error:', error); return null; }
    const { data: urlData } = supabase.storage
      .from('tour-images')
      .getPublicUrl(`covers/${fileName}`);
    return urlData.publicUrl;
  } catch (e) { console.error('uploadImage failed:', e.message); return null; }
}
