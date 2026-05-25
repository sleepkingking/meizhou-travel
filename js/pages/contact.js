function renderContact(container) {
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
      <div class="qrcode" style="display:flex;align-items:center;justify-content:center;color:#999;font-size:0.75rem;">微信二维码<br>敬请上传</div>
      <p style="color:#888;font-size:0.8125rem;">微信号：${wechat}</p>
    </div>
    <div class="contact-card">
      <div class="icon">📍</div>
      <p style="font-weight:600;">梅州嘉园户外</p>
      <p style="color:#888;font-size:0.875rem;">梅州市梅江区</p>
    </div>
  `;
}
