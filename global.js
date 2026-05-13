// Easy Resources - Growth & Utility Scripts

document.addEventListener('DOMContentLoaded', () => {
  // 1. Embed Mode Detection
  // If ?embed=true is in the URL, hide UI elements to act as a clean iframe
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('embed') === 'true') {
    document.body.classList.add('embed-mode');
  }

  // 2. Share Buttons Logic
  const shareButtons = document.querySelectorAll('.share-btn');
  shareButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const platform = btn.getAttribute('data-platform');
      const url = encodeURIComponent(window.location.href.split('?')[0]);
      const title = encodeURIComponent(document.title);
      
      let shareUrl = '';
      if (platform === 'twitter') {
        shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=Check%20out%20this%20awesome%20free%20tool%20on%20Easy%20Resources!`;
      } else if (platform === 'linkedin') {
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
      } else if (platform === 'facebook') {
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
      } else if (platform === 'copy') {
        navigator.clipboard.writeText(window.location.href.split('?')[0]).then(() => {
          const icon = btn.querySelector('i');
          const originalIcon = icon.getAttribute('data-lucide');
          icon.setAttribute('data-lucide', 'check');
          if (window.lucide) window.lucide.createIcons();
          setTimeout(() => {
            icon.setAttribute('data-lucide', originalIcon);
            if (window.lucide) window.lucide.createIcons();
          }, 2000);
        });
        return; // Don't open window for copy
      }

      if (shareUrl) {
        window.open(shareUrl, '_blank', 'width=600,height=400');
      }
    });
  });

  // 3. Embed Modal Logic
  const embedBtn = document.getElementById('openEmbedModal');
  const embedModal = document.getElementById('embedModal');
  if (embedBtn && embedModal) {
    const closeBtn = embedModal.querySelector('.modal-close');
    const copyEmbedBtn = document.getElementById('copyEmbedCode');
    const textarea = document.getElementById('embedCodeTextarea');

    embedBtn.addEventListener('click', () => {
      // Generate the iframe code based on current URL
      const currentUrl = window.location.href.split('?')[0];
      const iframeCode = `<iframe src="${currentUrl}?embed=true" width="100%" height="600" style="border:1px solid #e5e7eb; border-radius:12px; box-shadow:0 10px 15px -3px rgba(0,0,0,0.1);" allowtransparency="true"></iframe>\n<p style="text-align:center; font-family:sans-serif; font-size:12px; margin-top:8px;"><a href="https://easyresources.online" target="_blank" style="color:#666; text-decoration:none;">Powered by Easy Resources</a></p>`;
      textarea.value = iframeCode;
      embedModal.classList.add('active');
    });

    closeBtn.addEventListener('click', () => {
      embedModal.classList.remove('active');
    });

    embedModal.addEventListener('click', (e) => {
      if (e.target === embedModal) embedModal.classList.remove('active');
    });

    copyEmbedBtn.addEventListener('click', () => {
      textarea.select();
      navigator.clipboard.writeText(textarea.value).then(() => {
        const originalText = copyEmbedBtn.innerText;
        copyEmbedBtn.innerText = 'Copied!';
        setTimeout(() => {
          copyEmbedBtn.innerText = originalText;
        }, 2000);
      });
    });
  }
});
