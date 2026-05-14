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
      } else if (platform === 'whatsapp') {
        shareUrl = `https://api.whatsapp.com/send?text=${title}%20${url}`;
      } else if (platform === 'telegram') {
        shareUrl = `https://t.me/share/url?url=${url}&text=${title}`;
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

  // 4. Mobile Menu Toggle
  const menuToggle = document.getElementById('mobileMenuToggle');
  const navLinks = document.getElementById('navLinks');
  const navItems = document.querySelectorAll('.nav-item');

  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
      menuToggle.classList.toggle('active');
      navLinks.classList.toggle('active');
      document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
    });

    // Close menu when clicking links
    navLinks.querySelectorAll('a:not(.nav-link)').forEach(link => {
      link.addEventListener('click', () => {
        menuToggle.classList.remove('active');
        navLinks.classList.remove('active');
        document.body.style.overflow = '';
      });
    });

    // Mobile Dropdown Toggle
    navItems.forEach(item => {
      const link = item.querySelector('.nav-link');
      if (link) {
        link.addEventListener('click', (e) => {
          if (window.innerWidth <= 991) {
            const hasDropdown = item.querySelector('.dropdown');
            if (hasDropdown) {
              e.preventDefault();
              item.classList.toggle('active');
            }
          }
        });
      }
    });
  }

  // 5. OMNI-SEARCH (Cmd+K)
  const searchModal = document.getElementById('searchModal');
  const searchInput = document.getElementById('searchMainInput');
  const searchResults = document.getElementById('searchResults');
  const searchTriggers = document.querySelectorAll('.nav-search-btn');

  // Curated Search Index
  const searchIndex = [
    // Tools
    { title: 'QR Code Generator', desc: 'Custom high-res codes with logos', url: 'qr-code/index.html', icon: 'smartphone', type: 'Tool' },
    { title: 'Barcode Generator', desc: 'Standard retail and inventory barcodes', url: 'barcode-generator/index.html', icon: 'bar-chart-3', type: 'Tool' },
    { title: 'Image Compressor', desc: 'Smart lossy/lossless compression', url: 'image-compressor/index.html', icon: 'image', type: 'Tool' },
    { title: 'Image Converter', desc: 'PNG, JPG, WebP, SVG conversion', url: 'image-converter/index.html', icon: 'refresh-cw', type: 'Tool' },
    { title: 'Images to PDF', desc: 'Convert gallery to document instantly', url: 'images-to-pdf/index.html', icon: 'file-text', type: 'Tool' },
    { title: 'Lorem Ipsum Generator', desc: 'Custom placeholder text for designers', url: 'lorem-ipsum/index.html', icon: 'type', type: 'Tool' },
    { title: 'JSON Formatter', desc: 'Prettify and validate JSON data', url: 'json-formatter/index.html', icon: 'code', type: 'Tool' },
    { title: 'Color Palette Generator', desc: 'AI-powered color theory palettes', url: 'color-palette-generator/index.html', icon: 'palette', type: 'Tool' },
    { title: 'Color Palette Extractor', desc: 'Extract hex codes from images', url: 'color-palette-extractor/index.html', icon: 'brush', type: 'Tool' },
    { title: 'Favicon Generator', desc: 'Perfect icons for all browsers', url: 'favicon-generator/index.html', icon: 'link', type: 'Tool' },
    { title: 'SVG Optimizer', desc: 'Clean and minify vector graphics', url: 'svg-optimizer/index.html', icon: 'ruler', type: 'Tool' },
    // Articles
    { title: 'QR Codes for Business', desc: 'How to use custom QR codes effectively', url: 'blog/how-to-create-custom-qr-codes-for-business/index.html', icon: 'trending-up', type: 'Article' },
    { title: 'SVG Optimization Guide', desc: 'Minify and clean vector files', url: 'blog/ultimate-guide-to-svg-optimization/index.html', icon: 'zap', type: 'Article' },
    { title: 'Security Best Practices', desc: 'Protect data with modern standards', url: 'blog/password-security-best-practices/index.html', icon: 'lock', type: 'Article' },
    { title: 'Modern Image Formats', desc: 'WebP, AVIF, and beyond', url: 'blog/guide-to-modern-image-formats/index.html', icon: 'image', type: 'Article' },
    { title: 'Color Theory Guide', desc: 'Color psychology for web designers', url: 'blog/color-theory-for-web-designers/index.html', icon: 'palette', type: 'Article' }
  ];

  let selectedIndex = -1;

  function getBaseUrl() {
    const depth = window.location.pathname.split('/').filter(p => p).length;
    // Special case for root (it might be / or /index.html)
    const isBlog = window.location.pathname.includes('/blog/');
    const isTool = depth > 0 && !isBlog;
    
    if (isBlog) return '../../';
    if (isTool) return '../';
    return './';
  }

  function openSearch() {
    searchModal.classList.add('active');
    setTimeout(() => searchInput.focus(), 50);
  }

  function closeSearch() {
    searchModal.classList.remove('active');
    searchInput.value = '';
    renderResults([]);
  }

  function renderResults(results) {
    if (results.length === 0 && searchInput.value.length > 0) {
      searchResults.innerHTML = `<div style="padding:2rem;text-align:center;color:var(--gl-text-soft)">No results found for "${searchInput.value}"</div>`;
      return;
    }
    
    const baseUrl = getBaseUrl();
    searchResults.innerHTML = results.map((item, i) => `
      <a href="${baseUrl}${item.url}" class="search-item ${i === selectedIndex ? 'selected' : ''}" data-index="${i}">
        <div class="search-item-icon"><i data-lucide="${item.icon}"></i></div>
        <div class="search-item-info">
          <span class="search-item-title">${item.title}</span>
          <span class="search-item-desc">${item.desc}</span>
        </div>
        <span class="search-item-type">${item.type}</span>
      </a>
    `).join('');
    
    if (window.lucide) window.lucide.createIcons();
  }

  // Event Listeners
  searchTriggers.forEach(btn => btn.addEventListener('click', openSearch));
  
  searchModal.addEventListener('click', (e) => {
    if (e.target === searchModal) closeSearch();
  });

  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      openSearch();
    }
    if (e.key === 'Escape') closeSearch();
    
    if (searchModal.classList.contains('active')) {
      const items = searchResults.querySelectorAll('.search-item');
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        selectedIndex = Math.min(selectedIndex + 1, items.length - 1);
        renderResults(currentFilteredResults);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        selectedIndex = Math.max(selectedIndex - 1, 0);
        renderResults(currentFilteredResults);
      } else if (e.key === 'Enter' && selectedIndex >= 0) {
        e.preventDefault();
        items[selectedIndex].click();
      }
    }
  });

  let currentFilteredResults = [];
  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    selectedIndex = -1;
    
    if (query.length < 2) {
      currentFilteredResults = [];
      renderResults([]);
      return;
    }
    
    currentFilteredResults = searchIndex.filter(item => 
      item.title.toLowerCase().includes(query) || 
      item.desc.toLowerCase().includes(query) ||
      item.type.toLowerCase().includes(query)
    ).slice(0, 8);
    
    renderResults(currentFilteredResults);
  });
});
