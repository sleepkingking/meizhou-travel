// Supabase 客户端初始化
const SUPABASE_URL = 'https://okrseebqgaqbspfjfmew.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_WYUOGccf5IiJqM512U_NAw_MrsdTkrA';

// 安全检查：如果 SDK 未加载，用mock对象兜底，防止全页白屏
if (!window.supabase) {
  console.error('Supabase SDK 加载失败，使用离线模式');
  window.supabase = {
    createClient: function() {
      return {
        from: function() { return this; },
        select: function() { return this; },
        eq: function() { return this; },
        order: function() { return this; },
        single: function() { return Promise.resolve({ data: null, error: new Error('SDK not loaded') }); },
        insert: function() { return this; },
        update: function() { return this; },
        delete: function() { return this; },
        auth: {
          signInWithPassword: function() { return Promise.resolve({ data: null, error: new Error('SDK not loaded') }); },
          signOut: function() { return Promise.resolve(); },
          getSession: function() { return Promise.resolve({ data: { session: null } }); },
          setSession: function() { return Promise.resolve(); }
        },
        storage: {
          from: function() { return { upload: function() { return Promise.resolve({ data: null, error: new Error('SDK not loaded') }); }, getPublicUrl: function() { return { publicUrl: '' }; } }; }
        }
      };
    }
  };
}

// 自定义 fetch 带超时（8秒），防止网络不通时页面卡死
const fetchWithTimeout = (url, options = {}) => {
  return Promise.race([
    fetch(url, options),
    new Promise((_, reject) => setTimeout(() => reject(new Error('FETCH_TIMEOUT')), 8000))
  ]);
};

var supabase;
try {
  supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { fetch: fetchWithTimeout }
  });
} catch(e) {
  console.error('Supabase init error:', e.message);
  // 兜底：创建一个 mock client
  supabase = {
    from: function() { return { select: function() { return { eq: function() { return { order: function() { return { single: function() { return Promise.resolve({ data: null, error: new Error('init failed') }); } }; } }; } }; } }; },
    auth: {
      signInWithPassword: function() { return Promise.resolve({ data: null, error: new Error('init failed') }); },
      signOut: function() { return Promise.resolve(); },
      getSession: function() { return Promise.resolve({ data: { session: null } }); },
      setSession: function() { return Promise.resolve(); }
    },
    storage: { from: function() { return { upload: function() { return Promise.resolve({ data: null, error: new Error('init failed') }); }, getPublicUrl: function() { return { publicUrl: '' }; } }; } }
  };
}

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
    const resp = await fetchWithTimeout(
      SUPABASE_URL + '/auth/v1/token?grant_type=password',
      {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      }
    );
    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}));
      console.error('adminLogin error:', err);
      return null;
    }
    const data = await resp.json();
    // 同时设置 Supabase SDK 的 session，让后续 SDK 调用能通过认证
    if (data.access_token && data.refresh_token) {
      await supabase.auth.setSession({
        access_token: data.access_token,
        refresh_token: data.refresh_token
      }).catch(() => {});
    }
    return { user: data.user, session: data };
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

async function userRegister(email, password) {
  try {
    const resp = await fetchWithTimeout(
      SUPABASE_URL + '/auth/v1/signup',
      {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      }
    );
    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}));
      console.error('userRegister error:', err);
      return null;
    }
    const data = await resp.json();
    if (data.access_token && data.refresh_token) {
      await supabase.auth.setSession({
        access_token: data.access_token,
        refresh_token: data.refresh_token
      }).catch(() => {});
    }
    return { user: data.user, session: data };
  } catch (e) { console.error('userRegister failed:', e.message); return null; }
}

function isAdminUser() {
  return currentUser && currentUser.email === 'jiayuanhuwai@admin.com';
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
