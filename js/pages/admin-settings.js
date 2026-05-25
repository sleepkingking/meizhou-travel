function renderAdminSettings(container) {
  container.innerHTML = '<div class="page-header"><span class="back" onclick="history.back()">←</span>联系方式设置</div><div id="settings-form">' + renderLoading() + '</div>';
  loadSettingsForm();
}

async function loadSettingsForm() {
  var s = await getSettings();
  var phone = s.phone || '';
  var wechatId = s.wechat_id || '';
  var qrcode = s.wechat_qrcode || '';
  var address = s.address || '';
  window._settingsQrcode = qrcode;

  document.getElementById('settings-form').innerHTML = `
    <div style="padding:0 16px 24px;">

      <!-- 提示卡片 -->
      <div style="background:#f0f8ff;border-radius:10px;padding:12px 16px;margin:12px 0 16px;font-size:0.8125rem;color:#1a73e8;">
        💡 修改后将<b>实时更新</b>到"联系我们"页面，客户刷新即可看到
      </div>

      <!-- 电话 -->
      <div class="settings-card">
        <div class="settings-card-icon">📞</div>
        <div class="settings-card-body">
          <div class="settings-card-title">联系电话</div>
          <input type="text" id="set-phone" value="${escapeHtml(phone)}" placeholder="输入电话号码" style="width:100%;padding:10px;border:1px solid #e0e0e0;border-radius:8px;font-size:0.9375rem;margin-top:8px;box-sizing:border-box;">
        </div>
      </div>

      <!-- 微信 -->
      <div class="settings-card">
        <div class="settings-card-icon">💬</div>
        <div class="settings-card-body">
          <div class="settings-card-title">微信号</div>
          <input type="text" id="set-wechat" value="${escapeHtml(wechatId)}" placeholder="输入微信号" style="width:100%;padding:10px;border:1px solid #e0e0e0;border-radius:8px;font-size:0.9375rem;margin-top:8px;box-sizing:border-box;">
        </div>
      </div>

      <!-- 二维码 -->
      <div class="settings-card">
        <div class="settings-card-icon">📱</div>
        <div class="settings-card-body">
          <div class="settings-card-title">微信二维码</div>
          <p style="font-size:0.75rem;color:#999;margin:2px 0 8px;">建议上传正方形图片</p>
          <div onclick="document.getElementById('qrcode-file').click()" style="display:inline-block;cursor:pointer;border:2px dashed #ddd;border-radius:12px;padding:16px;text-align:center;min-width:120px;transition:border-color 0.2s;">
            <input type="file" id="qrcode-file" accept="image/*" style="display:none" onchange="handleQrcodeUpload(event)">
            <div id="qrcode-display">
              ${qrcode
                ? '<img src="' + qrcode + '" style="width:120px;height:120px;border-radius:8px;object-fit:cover;"><p style="font-size:0.6875rem;color:#4caf50;margin-top:4px;">✓ 已上传，点击更换</p>'
                : '<div style="width:120px;height:120px;background:#f5f5f5;border-radius:8px;margin:0 auto;display:flex;align-items:center;justify-content:center;font-size:2rem;color:#ccc;">+</div><p style="font-size:0.75rem;color:#999;margin-top:4px;">点击上传</p>'
              }
            </div>
          </div>
        </div>
      </div>

      <!-- 地址 -->
      <div class="settings-card">
        <div class="settings-card-icon">📍</div>
        <div class="settings-card-body">
          <div class="settings-card-title">公司地址</div>
          <textarea id="set-address" placeholder="输入详细地址" style="width:100%;padding:10px;border:1px solid #e0e0e0;border-radius:8px;font-size:0.9375rem;min-height:60px;margin-top:8px;box-sizing:border-box;resize:vertical;">${escapeHtml(address)}</textarea>
        </div>
      </div>

      <!-- 保存 -->
      <button class="save-btn" onclick="handleSaveSettings()" style="margin-top:12px;">💾 保存联系方式</button>

    </div>
  `;
}

async function handleQrcodeUpload(event) {
  var file = event.target.files[0];
  if (!file) return;
  if (file.size > 3 * 1024 * 1024) { showToast('图片大小不能超过3MB'); return; }

  var display = document.getElementById('qrcode-display');
  display.innerHTML = '<div style="width:120px;height:120px;margin:0 auto;display:flex;align-items:center;justify-content:center;"><p style="color:#999;">上传中...</p></div>';

  var url = await uploadImage(file);
  if (url) {
    window._settingsQrcode = url;
    display.innerHTML = '<img src="' + url + '" style="width:120px;height:120px;border-radius:8px;object-fit:cover;"><p style="font-size:0.6875rem;color:#4caf50;margin-top:4px;">✓ 已上传，点击更换</p>';
  } else {
    display.innerHTML = '<div style="width:120px;height:120px;background:#fff0f0;border-radius:8px;margin:0 auto;display:flex;align-items:center;justify-content:center;font-size:0.75rem;color:#e8553d;">上传失败</div><p style="font-size:0.6875rem;color:#e8553d;margin-top:4px;">请重试</p>';
  }
}

async function handleSaveSettings() {
  var btn = document.querySelector('.save-btn');
  var phone = document.getElementById('set-phone').value.trim();
  var wechatId = document.getElementById('set-wechat').value.trim();
  var address = document.getElementById('set-address').value.trim();

  btn.disabled = true;
  btn.textContent = '保存中...';

  var result = await adminUpdateSettings({
    phone: phone,
    wechat_id: wechatId,
    wechat_qrcode: window._settingsQrcode || '',
    address: address
  });

  btn.disabled = false;
  btn.textContent = '💾 保存联系方式';

  if (result) {
    showToast('联系方式已更新');
  } else {
    showToast('保存失败，请重试');
  }
}
