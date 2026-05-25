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
    <div style="padding:16px;">
      <div class="form-group">
        <label>联系电话</label>
        <input type="text" id="set-phone" value="${escapeHtml(phone)}" placeholder="如：138XXXX8888">
      </div>
      <div class="form-group">
        <label>微信号</label>
        <input type="text" id="set-wechat" value="${escapeHtml(wechatId)}" placeholder="如：meizhoujiayuan">
      </div>
      <div class="form-group">
        <label>微信二维码</label>
        <div class="image-upload" onclick="document.getElementById('qrcode-file').click()">
          <input type="file" id="qrcode-file" accept="image/*" style="display:none" onchange="handleQrcodeUpload(event)">
          <div id="qrcode-display">
            ${qrcode
              ? '<img src="' + qrcode + '" style="max-width:160px;max-height:160px;border-radius:8px;"><p style="font-size:0.75rem;margin-top:8px;">点击更换二维码</p>'
              : '📷 点击上传微信二维码<p style="font-size:0.75rem;margin-top:4px;">支持 JPG/PNG/WebP</p>'
            }
          </div>
        </div>
      </div>
      <div class="form-group">
        <label>地址</label>
        <textarea id="set-address" placeholder="如：梅州市梅江区XXX路">${escapeHtml(address)}</textarea>
      </div>
      <button class="save-btn" onclick="handleSaveSettings()">保存联系方式</button>
    </div>
  `;
}

async function handleQrcodeUpload(event) {
  var file = event.target.files[0];
  if (!file) return;
  if (file.size > 3 * 1024 * 1024) { showToast('图片大小不能超过3MB'); return; }

  var display = document.getElementById('qrcode-display');
  display.innerHTML = '<p>上传中...</p>';

  var url = await uploadImage(file);
  if (url) {
    window._settingsQrcode = url;
    display.innerHTML = '<img src="' + url + '" style="max-width:160px;max-height:160px;border-radius:8px;"><p style="font-size:0.75rem;margin-top:8px;color:#4caf50;">上传成功</p>';
  } else {
    display.innerHTML = '<p style="color:#e8553d;">上传失败，请重试</p>';
  }
}

async function handleSaveSettings() {
  var phone = document.getElementById('set-phone').value.trim();
  var wechatId = document.getElementById('set-wechat').value.trim();
  var address = document.getElementById('set-address').value.trim();

  var result = await adminUpdateSettings({
    phone: phone,
    wechat_id: wechatId,
    wechat_qrcode: window._settingsQrcode || '',
    address: address
  });

  if (result) {
    showToast('联系方式已更新');
  } else {
    showToast('保存失败，请重试');
  }
}
