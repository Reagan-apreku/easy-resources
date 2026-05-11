/* ===== Quik QR — QR Code Generator Engine ===== */

const QRGenerator = (() => {
  let qrInstance = null;
  let currentData = '';
  let debounceTimer = null;

  const defaults = {
    width: 1024, height: 1024,
    type: 'svg',
    data: '',
    dotsOptions: { type: 'rounded', color: '#1B3A4B' },
    cornersSquareOptions: { type: 'extra-rounded', color: '#1B3A4B' },
    cornersDotOptions: { type: 'dot', color: '#1B3A4B' },
    backgroundOptions: { color: 'transparent' },
    imageOptions: { crossOrigin: 'anonymous', margin: 12, imageSize: 0.4 },
    qrOptions: { errorCorrectionLevel: 'M' },
  };

  let options = JSON.parse(JSON.stringify(defaults));

  // ─── QR Type Encoders ───
  const encoders = {
    url: (d) => d.url || '',
    text: (d) => d.text || '',
    email: (d) => {
      let s = `mailto:${d.email || ''}`;
      const params = [];
      if (d.subject) params.push(`subject=${encodeURIComponent(d.subject)}`);
      if (d.body) params.push(`body=${encodeURIComponent(d.body)}`);
      return params.length ? `${s}?${params.join('&')}` : s;
    },
    phone: (d) => `tel:${d.phone || ''}`,
    sms: (d) => {
      let s = `sms:${d.phone || ''}`;
      if (d.message) s += `?body=${encodeURIComponent(d.message)}`;
      return s;
    },
    whatsapp: (d) => {
      const num = (d.phone || '').replace(/\D/g, '');
      let s = `https://wa.me/${num}`;
      if (d.message) s += `?text=${encodeURIComponent(d.message)}`;
      return s;
    },
    wifi: (d) => {
      const enc = d.encryption || 'WPA';
      const hidden = d.hidden ? 'true' : 'false';
      return `WIFI:T:${enc};S:${d.ssid || ''};P:${d.password || ''};H:${hidden};;`;
    },
    vcard: (d) => {
      const lines = ['BEGIN:VCARD', 'VERSION:3.0'];
      if (d.name) lines.push(`FN:${d.name}`);
      if (d.name) { const parts = d.name.split(' '); lines.push(`N:${parts.slice(1).join(' ')};${parts[0]}`); }
      if (d.phone) lines.push(`TEL:${d.phone}`);
      if (d.email) lines.push(`EMAIL:${d.email}`);
      if (d.company) lines.push(`ORG:${d.company}`);
      if (d.title) lines.push(`TITLE:${d.title}`);
      if (d.website) lines.push(`URL:${d.website}`);
      if (d.address) lines.push(`ADR:;;${d.address}`);
      lines.push('END:VCARD');
      return lines.join('\n');
    },
    event: (d) => {
      const fmt = (dt) => dt ? dt.replace(/[-:]/g, '').replace('T', 'T') + '00' : '';
      const lines = ['BEGIN:VEVENT'];
      if (d.title) lines.push(`SUMMARY:${d.title}`);
      if (d.start) lines.push(`DTSTART:${fmt(d.start)}`);
      if (d.end) lines.push(`DTEND:${fmt(d.end)}`);
      if (d.location) lines.push(`LOCATION:${d.location}`);
      if (d.description) lines.push(`DESCRIPTION:${d.description}`);
      lines.push('END:VEVENT');
      return `BEGIN:VCALENDAR\nVERSION:2.0\n${lines.join('\n')}\nEND:VCALENDAR`;
    },
    location: (d) => {
      if (d.lat && d.lng) return `geo:${d.lat},${d.lng}`;
      if (d.address) return `https://maps.google.com/?q=${encodeURIComponent(d.address)}`;
      return '';
    },
    crypto: (d) => {
      const type = d.cryptoType || 'bitcoin';
      return `${type}:${d.address || ''}${d.amount ? '?amount=' + d.amount : ''}`;
    },
    social: (d) => {
      const platformUrls = {
        instagram: 'https://instagram.com/',
        twitter: 'https://x.com/',
        linkedin: 'https://linkedin.com/in/',
        tiktok: 'https://tiktok.com/@',
        facebook: 'https://facebook.com/',
        youtube: 'https://youtube.com/@',
        github: 'https://github.com/',
        snapchat: 'https://snapchat.com/add/',
        pinterest: 'https://pinterest.com/',
        telegram: 'https://t.me/',
        whatsapp: 'https://wa.me/',
        threads: 'https://threads.net/@',
        discord: 'https://discord.gg/',
        twitch: 'https://twitch.tv/',
        spotify: 'https://open.spotify.com/user/',
        reddit: 'https://reddit.com/u/',
        behance: 'https://behance.net/',
        dribbble: 'https://dribbble.com/',
      };
      // Collect all social links from the dynamic entries
      const links = socialLinksManager.getLinks();
      if (!links.length) return '';
      
      // If only one link, encode it directly as a URL
      if (links.length === 1) {
        const link = links[0];
        if (link.type === 'website') return link.value;
        return (platformUrls[link.platform] || '') + link.value;
      }
      
      // For multiple links, build a compact vCard with URLs
      const name = d.displayName || 'My Links';
      const bio = d.bio || '';
      
      // Build vCard format with social profiles as URLs
      const lines = ['BEGIN:VCARD', 'VERSION:3.0'];
      lines.push(`FN:${name}`);
      if (name.includes(' ')) {
        const parts = name.split(' ');
        lines.push(`N:${parts.slice(1).join(' ')};${parts[0]}`);
      } else {
        lines.push(`N:${name}`);
      }
      if (bio) lines.push(`NOTE:${bio}`);
      
      // Add links — websites as URLs, social profiles as X-SOCIALPROFILE or URL
      let urlCount = 0;
      links.forEach(link => {
        if (link.type === 'website') {
          const label = link.label || 'Website';
          if (urlCount === 0) {
            lines.push(`URL:${link.value}`);
          } else {
            lines.push(`URL;type=${label}:${link.value}`);
          }
          urlCount++;
        } else {
          const url = (platformUrls[link.platform] || '') + link.value;
          const label = link.platform.charAt(0).toUpperCase() + link.platform.slice(1);
          lines.push(`X-SOCIALPROFILE;type=${label}:${url}`);
        }
      });
      
      lines.push('END:VCARD');
      return lines.join('\n');
    },
  };

  // ─── Form Definitions ───
  const formDefs = {
    url: [{ id: 'url', label: 'Website URL', type: 'url', placeholder: 'https://example.com', required: true }],
    text: [{ id: 'text', label: 'Text Content', type: 'textarea', placeholder: 'Enter your text here...', required: true }],
    email: [
      { id: 'email', label: 'Email Address', type: 'email', placeholder: 'hello@example.com', required: true },
      { id: 'subject', label: 'Subject', type: 'text', placeholder: 'Optional subject line' },
      { id: 'body', label: 'Body', type: 'textarea', placeholder: 'Optional email body' },
    ],
    phone: [{ id: 'phone', label: 'Phone Number', type: 'tel', placeholder: '+1 555 123 4567', required: true }],
    sms: [
      { id: 'phone', label: 'Phone Number', type: 'tel', placeholder: '+1 555 123 4567', required: true },
      { id: 'message', label: 'Message', type: 'textarea', placeholder: 'Pre-filled message (optional)' },
    ],
    whatsapp: [
      { id: 'phone', label: 'Phone Number (with country code)', type: 'tel', placeholder: '+1 555 123 4567', required: true },
      { id: 'message', label: 'Message', type: 'textarea', placeholder: 'Hi! I saw your QR code...' },
    ],
    wifi: [
      { id: 'ssid', label: 'Network Name (SSID)', type: 'text', placeholder: 'MyWiFiNetwork', required: true },
      { id: 'password', label: 'Password', type: 'text', placeholder: 'Network password' },
      { id: 'encryption', label: 'Encryption', type: 'select', options: ['WPA', 'WEP', 'nopass'], required: true },
    ],
    vcard: [
      { id: 'name', label: 'Full Name', type: 'text', placeholder: 'John Doe', required: true },
      { id: 'phone', label: 'Phone', type: 'tel', placeholder: '+1 555 123 4567' },
      { id: 'email', label: 'Email', type: 'email', placeholder: 'john@company.com' },
      { id: 'company', label: 'Company', type: 'text', placeholder: 'Acme Inc.' },
      { id: 'title', label: 'Job Title', type: 'text', placeholder: 'Product Designer' },
      { id: 'website', label: 'Website', type: 'url', placeholder: 'https://johndoe.com' },
      { id: 'address', label: 'Address', type: 'text', placeholder: '123 Main St, City, Country' },
    ],
    event: [
      { id: 'title', label: 'Event Name', type: 'text', placeholder: 'Team Meeting', required: true },
      { id: 'start', label: 'Start Date & Time', type: 'datetime-local', required: true },
      { id: 'end', label: 'End Date & Time', type: 'datetime-local' },
      { id: 'location', label: 'Location', type: 'text', placeholder: 'Conference Room A' },
      { id: 'description', label: 'Description', type: 'textarea', placeholder: 'Event details...' },
    ],
    location: [
      { id: 'lat', label: 'Latitude', type: 'number', placeholder: '40.7128', row: 'geo' },
      { id: 'lng', label: 'Longitude', type: 'number', placeholder: '-74.0060', row: 'geo' },
      { id: 'address', label: 'Or Address', type: 'text', placeholder: 'New York, NY 10001' },
    ],
    crypto: [
      { id: 'cryptoType', label: 'Cryptocurrency', type: 'select', options: ['bitcoin', 'ethereum', 'litecoin'], required: true },
      { id: 'address', label: 'Wallet Address', type: 'text', placeholder: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa', required: true },
      { id: 'amount', label: 'Amount (optional)', type: 'number', placeholder: '0.001' },
    ],
    social: [
      { id: 'displayName', label: 'Display Name', type: 'text', placeholder: 'Your Name or Brand', required: true },
      { id: 'bio', label: 'Short Bio (optional)', type: 'text', placeholder: 'Designer, Developer, Creator...' },
      { id: 'socialLinks', label: '', type: 'custom-social-links' },
    ],
  };

  // ─── Build Form HTML ───
  function buildFormHTML(type) {
    const fields = formDefs[type] || [];
    let html = '';
    let inRow = false;
    fields.forEach((f, i) => {
      const next = fields[i + 1];
      // Handle custom social links builder
      if (f.type === 'custom-social-links') {
        html += `<div id="social-links-builder" class="social-links-builder"></div>`;
        return;
      }
      if (f.row && !inRow) { html += '<div class="form-row">'; inRow = true; }
      html += `<div class="form-group">`;
      html += `<label class="form-label" for="qr-${f.id}">${f.label}${f.required ? ' <span style="color:var(--error)">*</span>' : ''}</label>`;
      if (f.type === 'textarea') {
        html += `<textarea id="qr-${f.id}" class="form-input" placeholder="${f.placeholder || ''}" ${f.required ? 'required' : ''} data-field="${f.id}"></textarea>`;
      } else if (f.type === 'select') {
        html += `<select id="qr-${f.id}" class="form-input" data-field="${f.id}" ${f.required ? 'required' : ''}>`;
        (f.options || []).forEach(o => { html += `<option value="${o}">${o.charAt(0).toUpperCase() + o.slice(1)}</option>`; });
        html += `</select>`;
      } else {
        html += `<input id="qr-${f.id}" type="${f.type}" class="form-input" placeholder="${f.placeholder || ''}" ${f.required ? 'required' : ''} data-field="${f.id}">`;
      }
      html += `</div>`;
      if (inRow && (!next || next.row !== f.row)) { html += '</div>'; inRow = false; }
    });
    return html;
  }

  // ─── Collect Form Data ───
  function collectFormData(type) {
    const fields = formDefs[type] || [];
    const data = {};
    fields.forEach(f => {
      const el = document.getElementById(`qr-${f.id}`);
      if (el) data[f.id] = el.value.trim();
    });
    return data;
  }

  // ─── Generate / Update QR ───
  function generate(type, customOpts = {}) {
    const data = collectFormData(type);
    const encoder = encoders[type];
    if (!encoder) return;
    const encoded = encoder(data);
    if (!encoded) { clearPreview(); return; }
    currentData = encoded;

    const merged = {
      ...options,
      ...customOpts,
      data: encoded,
    };

    const container = document.getElementById('qr-preview');
    if (!container) return;

    if (qrInstance) {
      qrInstance.update(merged);
    } else {
      container.innerHTML = '';
      qrInstance = new QRCodeStyling(merged);
      qrInstance.append(container);
    }

    // Make SVG responsive after render
    const fixSvg = () => {
      const svg = container.querySelector('svg');
      if (svg && svg.getAttribute('width')) {
        const w = svg.getAttribute('width');
        const h = svg.getAttribute('height');
        svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
        svg.removeAttribute('width');
        svg.removeAttribute('height');
      }
    };
    requestAnimationFrame(fixSvg);
    setTimeout(fixSvg, 100);
    setTimeout(fixSvg, 300);

    Services.track('qr_generated', { type, data_length: encoded.length });
  }

  function clearPreview() {
    const container = document.getElementById('qr-preview');
    if (container) {
      container.innerHTML = `<div class="preview-placeholder"><span class="icon">⬚</span><span>Enter data to generate QR code</span></div>`;
    }
    qrInstance = null;
  }

  // ─── Debounced Generation ───
  function debouncedGenerate(type) {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => generate(type), 300);
  }

  // ─── Update Options ───
  function updateDotColor(color) { options.dotsOptions.color = color; options.cornersSquareOptions.color = color; options.cornersDotOptions.color = color; }
  function updateBgColor(color) { options.backgroundOptions.color = color || 'transparent'; }
  function updateDotType(type) { options.dotsOptions.type = type; }
  function updateCornerType(type) { options.cornersSquareOptions.type = type; }
  function updateErrorCorrection(level) { options.qrOptions.errorCorrectionLevel = level; }
  function updateSize(w, h) { options.width = w; options.height = h || w; }

  function setLogo(dataUrl) {
    if (dataUrl) {
      options.image = dataUrl;
      options.qrOptions.errorCorrectionLevel = 'H';
    } else {
      delete options.image;
    }
  }

  function applyPreset(fg) {
    updateDotColor(fg);
  }

  // ─── Download ───
  async function download(format = 'png') {
    if (!qrInstance) return false;
    const ext = format === 'svg' ? 'svg' : format;
    try {
      await qrInstance.download({ name: 'quikqr-code', extension: ext });
      const count = await Services.incrementGenerationCount();
      Services.track('qr_downloaded', { format });
      return count;
    } catch (e) {
      console.error('Download failed:', e);
      return false;
    }
  }

  // ─── History ───
  function saveToHistory(type, data) {
    const history = JSON.parse(localStorage.getItem('quikqr_history') || '[]');
    history.unshift({ type, data, timestamp: Date.now(), encoded: currentData });
    if (history.length > 10) history.length = 10;
    localStorage.setItem('quikqr_history', JSON.stringify(history));
  }

  function getHistory() {
    return JSON.parse(localStorage.getItem('quikqr_history') || '[]');
  }

  return {
    generate, debouncedGenerate, clearPreview, download,
    buildFormHTML, collectFormData, formDefs, encoders,
    updateDotColor, updateBgColor, updateDotType, updateCornerType,
    updateErrorCorrection, updateSize, setLogo, applyPreset,
    saveToHistory, getHistory, get options() { return options; },
  };
})();
