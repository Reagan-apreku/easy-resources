/* ===== Quik QR — UI Controls ===== */

const UI = (() => {
  let currentType = 'url';
  let selectedFormat = 'png';

  // ─── Tab Switching ───
  function initTabs() {
    const tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const type = tab.dataset.type;
        if (type === currentType) return;
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        currentType = type;
        renderForm(type);
        QRGenerator.clearPreview();
        Services.track('type_selected', { type });
      });
    });
  }

  function renderForm(type) {
    const panel = document.getElementById('form-fields');
    if (!panel) return;
    panel.innerHTML = QRGenerator.buildFormHTML(type);
    // Attach input listeners for live preview
    panel.querySelectorAll('.form-input').forEach(input => {
      const evt = input.tagName === 'SELECT' ? 'change' : 'input';
      input.addEventListener(evt, () => QRGenerator.debouncedGenerate(currentType));
    });
    // Initialize social links builder if social tab
    if (type === 'social' && typeof socialLinksManager !== 'undefined') {
      socialLinksManager.init();
    }
    // Focus first input
    const first = panel.querySelector('.form-input');
    if (first) setTimeout(() => first.focus(), 100);
  }

  // ─── Customization Panel ───
  function initCustomization() {
    const panel = document.getElementById('customization-panel');
    if (!panel) return;

    // Dot color
    const dotColor = document.getElementById('dot-color');
    if (dotColor) dotColor.addEventListener('input', (e) => {
      QRGenerator.updateDotColor(e.target.value);
      QRGenerator.generate(currentType);
    });

    // Dot styles
    document.querySelectorAll('.dot-style-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.dot-style-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        QRGenerator.updateDotType(btn.dataset.style);
        QRGenerator.generate(currentType);
      });
    });

    // Corner styles
    document.querySelectorAll('.corner-style-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.corner-style-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        QRGenerator.updateCornerType(btn.dataset.style);
        QRGenerator.generate(currentType);
      });
    });

    // Error correction
    const ecSelect = document.getElementById('error-correction');
    if (ecSelect) ecSelect.addEventListener('change', (e) => {
      QRGenerator.updateErrorCorrection(e.target.value);
      QRGenerator.generate(currentType);
    });

    // Size
    const sizeSelect = document.getElementById('qr-size');
    if (sizeSelect) sizeSelect.addEventListener('change', (e) => {
      const s = parseInt(e.target.value, 10);
      QRGenerator.updateSize(s);
      QRGenerator.generate(currentType);
    });

    // Color presets
    document.querySelectorAll('.color-preset').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.color-preset').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const fg = btn.dataset.fg;
        QRGenerator.applyPreset(fg);
        if (dotColor) dotColor.value = fg;
        QRGenerator.generate(currentType);
      });
    });

    // Logo upload
    const logoInput = document.getElementById('logo-input');
    const logoUpload = document.querySelector('.logo-upload');
    const logoPreview = document.getElementById('logo-preview-img');
    const logoRemove = document.getElementById('logo-remove');
    if (logoInput) {
      logoInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) { showToast('Logo must be under 2MB', 'error'); return; }
        const reader = new FileReader();
        reader.onload = (ev) => {
          QRGenerator.setLogo(ev.target.result);
          if (logoPreview) { logoPreview.src = ev.target.result; logoPreview.style.display = 'block'; }
          if (logoUpload) logoUpload.classList.add('has-logo');
          const ecSel = document.getElementById('error-correction');
          if (ecSel) ecSel.value = 'H';
          QRGenerator.generate(currentType);
        };
        reader.readAsDataURL(file);
      });
    }
    if (logoRemove) {
      logoRemove.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        QRGenerator.setLogo(null);
        if (logoPreview) { logoPreview.src = ''; logoPreview.style.display = 'none'; }
        if (logoUpload) logoUpload.classList.remove('has-logo');
        if (logoInput) logoInput.value = '';
        QRGenerator.generate(currentType);
      });
    }
  }

  // ─── Format Selector ───
  function initFormatSelector() {
    document.querySelectorAll('.format-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.format-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedFormat = btn.dataset.format;
      });
    });
  }

  // ─── Download Flow ───
  function initDownload() {
    const dlBtn = document.getElementById('download-btn');
    if (!dlBtn) return;
    dlBtn.addEventListener('click', async () => {
      await performDownload();
    });
  }

  async function performDownload() {
    const btn = document.getElementById('download-btn');
    if (btn) { btn.classList.add('loading'); btn.disabled = true; }
    const count = await QRGenerator.download(selectedFormat);
    if (btn) { btn.classList.remove('loading'); btn.disabled = false; }
    if (count !== false) {
      QRGenerator.saveToHistory(currentType, QRGenerator.collectFormData(currentType));
      showToast('QR code downloaded successfully! ✨');
      updateStatCounters(count);
    } else {
      showToast('Please generate a QR code first', 'error');
    }
  }



  // ─── FAQ Accordion ───
  function initAccordion() {
    document.querySelectorAll('.accordion-trigger').forEach(trigger => {
      trigger.addEventListener('click', () => {
        const item = trigger.closest('.accordion-item');
        const wasOpen = item.classList.contains('open');
        // Close all
        document.querySelectorAll('.accordion-item').forEach(i => i.classList.remove('open'));
        if (!wasOpen) item.classList.add('open');
      });
    });
  }

  // ─── Mobile Menu ───
  function initMobileMenu() {
    const toggle = document.querySelector('.menu-toggle');
    const nav = document.querySelector('.nav-links');
    if (!toggle || !nav) return;
    toggle.addEventListener('click', () => nav.classList.toggle('open'));
    nav.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => nav.classList.remove('open'));
    });
  }

  // ─── Smooth Scroll ───
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(link => {
      link.addEventListener('click', (e) => {
        const target = document.querySelector(link.getAttribute('href'));
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  // ─── Scroll Animations ───
  function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    document.querySelectorAll('.animate-in').forEach(el => observer.observe(el));
  }

  // ─── Animated Counter ───
  function initCounters() {
    const counters = document.querySelectorAll('[data-count]');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach(c => observer.observe(c));
  }

  function animateCounter(el) {
    const target = parseInt(el.dataset.count, 10);
    const suffix = el.dataset.suffix || '';
    const duration = 2000;
    const start = performance.now();
    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      const current = Math.floor(eased * target);
      el.textContent = current.toLocaleString() + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  function updateStatCounters(count) {
    const el = document.querySelector('[data-count]');
    if (el) { el.dataset.count = count; el.textContent = count.toLocaleString() + '+'; }
  }

  // ─── Toast ───
  function showToast(message, type = 'success') {
    let toast = document.getElementById('toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'toast';
      toast.className = 'toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.style.background = type === 'error' ? 'var(--error)' : 'var(--success)';
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  }

  // ─── Keyboard Shortcuts ───
  function initKeyboard() {
    document.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        QRGenerator.generate(currentType);
      }
    });
  }

  // ─── Init All UI ───
  async function init() {
    renderForm('url');
    initTabs();
    initCustomization();
    initFormatSelector();
    initDownload();

    initAccordion();
    initMobileMenu();
    initSmoothScroll();
    initScrollAnimations();
    initCounters();
    initKeyboard();

    // Set initial stat count
    const count = await Services.getGenerationCount();
    updateStatCounters(count);
  }

  return { init, showToast, currentType: () => currentType };
})();
