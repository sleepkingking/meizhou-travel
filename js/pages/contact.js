function renderContact(container) {
  container.innerHTML = `
    <div class="page-header">联系我们</div>
    <div id="contact-content">${renderLoading()}</div>
  `;
  loadContactInfo();
}

async function loadContactInfo() {
  var s = await getSettings();
  var content = document.getElementById('contact-content');
  if (!content) return;

  var phone = s.phone || '待填写';
  var wechat = s.wechat_id || '待填写';
  var qrcode = s.wechat_qrcode || '';
  var address = s.address || '待填写';

  content.innerHTML = `
    <div class="contact-card">
      <div class="icon">📞</div>
      <div class="phone" onclick="window.location.href='tel:${phone}'">${escapeHtml(phone)}</div>
      <p style="color:#888;font-size:0.875rem;">点击拨打电话咨询</p>
    </div>
    <div class="contact-card">
      <div class="icon">💬</div>
      <p style="font-weight:600;margin-bottom:4px;">微信咨询</p>
      ${qrcode
        ? '<img src="' + qrcode + '" alt="微信二维码" style="width:160px;height:160px;border-radius:8px;object-fit:cover;">'
        : '<div class="qrcode" style="display:flex;align-items:center;justify-content:center;color:#999;font-size:0.75rem;">微信二维码<br>敬请上传</div>'
      }
      <p style="color:#888;font-size:0.8125rem;margin-top:8px;">微信号：${escapeHtml(wechat)}</p>
    </div>
    <div class="contact-card">
      <div class="icon">📍</div>
      <p style="font-weight:600;">梅州嘉园户外</p>
      <p style="color:#888;font-size:0.875rem;">${escapeHtml(address)}</p>
    </div>
  `;
}
