function createImageUploader(currentUrl) {
  var displayHtml = currentUrl
    ? '<img src="' + currentUrl + '" alt="封面图" style="max-width:100%;max-height:200px;border-radius:8px;"><p style="font-size:0.75rem;margin-top:8px;">点击更换图片</p>'
    : '📷 点击上传封面图<p style="font-size:0.75rem;margin-top:4px;">支持 JPG/PNG/WebP，最大 5MB</p>';

  return '<div class="image-upload" onclick="document.getElementById(\'file-input\').click()">' +
    '<input type="file" id="file-input" accept="image/*" style="display:none" onchange="handleImageSelect(event)">' +
    '<div id="upload-display">' + displayHtml + '</div>' +
    '</div>';
}

async function handleImageSelect(event) {
  var file = event.target.files[0];
  if (!file) return;
  if (file.size > 5 * 1024 * 1024) { showToast('图片大小不能超过5MB'); return; }

  var display = document.getElementById('upload-display');
  display.innerHTML = '<p>上传中...</p>';

  var url = await uploadImage(file);
  if (url) {
    window._coverUrl = url;
    display.innerHTML = '<img src="' + url + '" alt="封面图" style="max-width:100%;max-height:200px;border-radius:8px;"><p style="font-size:0.75rem;margin-top:8px;color:#4caf50;">上传成功，点击更换</p>';
  } else {
    display.innerHTML = '<p style="color:#e8553d;">📷 上传失败，请重试</p>';
  }
}
