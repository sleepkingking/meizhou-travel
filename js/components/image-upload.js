function createImageUploader(currentUrl, onUploaded) {
  return `
    <div class="image-upload" id="image-upload-area" onclick="document.getElementById('file-input').click()">
      <input type="file" id="file-input" accept="image/*" style="display:none"
             onchange="handleImageSelect(event, '${onUploaded}')">
      ${currentUrl
        ? `<img src="${currentUrl}" alt="封面图"><p style="font-size:0.75rem;margin-top:8px;">点击更换图片</p>`
        : `📷 点击上传封面图<p style="font-size:0.75rem;margin-top:4px;">支持 JPG/PNG/WebP，最大 5MB</p>`
      }
    </div>
  `;
}

async function handleImageSelect(event, callbackName) {
  const file = event.target.files[0];
  if (!file) return;
  if (file.size > 5 * 1024 * 1024) { showToast('图片大小不能超过5MB'); return; }

  const area = document.getElementById('image-upload-area');
  area.innerHTML = '<p>上传中...</p>';

  const url = await uploadImage(file);
  if (url) {
    area.innerHTML = `<img src="${url}" alt="封面图"><p style="font-size:0.75rem;margin-top:8px;">上传成功，点击更换</p>`;
    if (callbackName === 'setCoverUrl') {
      window._coverUrl = url;
    }
  } else {
    area.innerHTML = '📷 上传失败，请重试';
  }
}
