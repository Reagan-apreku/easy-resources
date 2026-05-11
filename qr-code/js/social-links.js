/* ===== Social Links Manager — Multi-Link Builder ===== */

const socialLinksManager = (() => {
  let links = [];
  let nextId = 1;

  const platforms = [
    { id: 'instagram', label: 'Instagram', icon: '📸', placeholder: 'username (without @)' },
    { id: 'twitter', label: 'Twitter / X', icon: '🐦', placeholder: 'username (without @)' },
    { id: 'linkedin', label: 'LinkedIn', icon: '💼', placeholder: 'profile-slug' },
    { id: 'tiktok', label: 'TikTok', icon: '🎵', placeholder: 'username (without @)' },
    { id: 'facebook', label: 'Facebook', icon: '👥', placeholder: 'page or username' },
    { id: 'youtube', label: 'YouTube', icon: '🎬', placeholder: 'channel-handle' },
    { id: 'github', label: 'GitHub', icon: '💻', placeholder: 'username' },
    { id: 'snapchat', label: 'Snapchat', icon: '👻', placeholder: 'username' },
    { id: 'pinterest', label: 'Pinterest', icon: '📌', placeholder: 'username' },
    { id: 'telegram', label: 'Telegram', icon: '✈️', placeholder: 'username' },
    { id: 'whatsapp', label: 'WhatsApp', icon: '💬', placeholder: 'phone number' },
    { id: 'threads', label: 'Threads', icon: '🧵', placeholder: 'username' },
    { id: 'discord', label: 'Discord', icon: '🎮', placeholder: 'invite-code' },
    { id: 'twitch', label: 'Twitch', icon: '🟣', placeholder: 'username' },
    { id: 'spotify', label: 'Spotify', icon: '🎧', placeholder: 'user-id' },
    { id: 'reddit', label: 'Reddit', icon: '🔗', placeholder: 'username' },
    { id: 'behance', label: 'Behance', icon: '🎨', placeholder: 'username' },
    { id: 'dribbble', label: 'Dribbble', icon: '🏀', placeholder: 'username' },
  ];

  function getLinks() {
    return links.filter(l => l.value.trim() !== '');
  }

  function addLink(type = 'social', platform = 'instagram') {
    const id = nextId++;
    const entry = { id, type, platform, value: '', label: '' };
    links.push(entry);
    renderLinks();
    // Focus the new input after render
    setTimeout(() => {
      const input = document.querySelector(`[data-link-id="${id}"] .social-link-value`);
      if (input) input.focus();
    }, 50);
  }

  function removeLink(id) {
    const el = document.querySelector(`[data-link-id="${id}"]`);
    if (el) {
      el.classList.add('removing');
      setTimeout(() => {
        links = links.filter(l => l.id !== id);
        renderLinks();
        triggerGenerate();
      }, 300);
    } else {
      links = links.filter(l => l.id !== id);
      renderLinks();
      triggerGenerate();
    }
  }

  function updateLink(id, field, value) {
    const link = links.find(l => l.id === id);
    if (link) {
      link[field] = value;
      // Update placeholder when platform changes
      if (field === 'platform') {
        const input = document.querySelector(`[data-link-id="${id}"] .social-link-value`);
        const platformInfo = platforms.find(p => p.id === value);
        if (input && platformInfo) input.placeholder = platformInfo.placeholder;
      }
      triggerGenerate();
    }
  }

  function triggerGenerate() {
    if (typeof QRGenerator !== 'undefined' && typeof UI !== 'undefined') {
      QRGenerator.debouncedGenerate('social');
    }
  }

  function renderLinks() {
    const container = document.getElementById('social-links-builder');
    if (!container) return;

    let html = '';

    // Header with count
    html += `<div class="social-links-header">
      <span class="social-links-title">
        <i data-lucide="link-2" style="width:16px;height:16px"></i>
        Your Links <span class="social-links-count">${links.length}</span>
      </span>
      <span class="social-links-hint">Add social profiles & websites</span>
    </div>`;

    // Link entries
    html += '<div class="social-links-list">';
    links.forEach((link, index) => {
      html += renderLinkEntry(link, index);
    });
    html += '</div>';

    // Add buttons
    html += `<div class="social-links-actions">
      <button type="button" class="social-add-btn social-add-social" onclick="socialLinksManager.addLink('social')">
        <i data-lucide="at-sign" style="width:16px;height:16px"></i>
        Add Social Profile
      </button>
      <button type="button" class="social-add-btn social-add-website" onclick="socialLinksManager.addLink('website')">
        <i data-lucide="globe" style="width:16px;height:16px"></i>
        Add Website Link
      </button>
    </div>`;

    // QR data capacity warning
    if (links.length > 5) {
      html += `<div class="social-links-warning">
        <i data-lucide="alert-triangle" style="width:14px;height:14px"></i>
        Too many links may make the QR code dense and harder to scan. Consider keeping it under 6 links.
      </div>`;
    }

    container.innerHTML = html;

    // Re-initialize Lucide icons for new elements
    if (typeof lucide !== 'undefined') lucide.createIcons();

    // Attach event listeners
    container.querySelectorAll('.social-link-entry').forEach(entry => {
      const id = parseInt(entry.dataset.linkId, 10);
      
      // Platform select
      const platformSelect = entry.querySelector('.social-link-platform');
      if (platformSelect) {
        platformSelect.addEventListener('change', (e) => updateLink(id, 'platform', e.target.value));
      }

      // Value input
      const valueInput = entry.querySelector('.social-link-value');
      if (valueInput) {
        valueInput.addEventListener('input', (e) => updateLink(id, 'value', e.target.value));
      }

      // Label input (for websites)
      const labelInput = entry.querySelector('.social-link-label');
      if (labelInput) {
        labelInput.addEventListener('input', (e) => updateLink(id, 'label', e.target.value));
      }

      // Remove button
      const removeBtn = entry.querySelector('.social-link-remove');
      if (removeBtn) {
        removeBtn.addEventListener('click', () => removeLink(id));
      }
    });
  }

  function renderLinkEntry(link, index) {
    const isWebsite = link.type === 'website';
    const platformInfo = platforms.find(p => p.id === link.platform);
    const placeholder = isWebsite ? 'https://yourwebsite.com' : (platformInfo?.placeholder || 'username');

    let html = `<div class="social-link-entry" data-link-id="${link.id}" style="animation-delay:${index * 0.05}s">`;
    
    // Entry number badge
    html += `<div class="social-link-number">${index + 1}</div>`;

    html += '<div class="social-link-fields">';

    if (isWebsite) {
      // Website entry
      html += `<div class="social-link-type-badge website-badge">
        <i data-lucide="globe" style="width:14px;height:14px"></i> Website
      </div>`;
      html += `<input type="url" class="form-input social-link-value" 
        placeholder="${placeholder}" value="${escapeAttr(link.value)}" 
        data-field="value">`;
      html += `<input type="text" class="form-input social-link-label" 
        placeholder="Label (e.g. My Portfolio)" value="${escapeAttr(link.label)}" 
        data-field="label">`;
    } else {
      // Social platform entry
      html += `<select class="form-input social-link-platform" data-field="platform">`;
      platforms.forEach(p => {
        html += `<option value="${p.id}" ${p.id === link.platform ? 'selected' : ''}>${p.icon} ${p.label}</option>`;
      });
      html += `</select>`;
      html += `<input type="text" class="form-input social-link-value" 
        placeholder="${placeholder}" value="${escapeAttr(link.value)}" 
        data-field="value">`;
    }

    html += '</div>'; // .social-link-fields

    // Remove button
    html += `<button type="button" class="social-link-remove" title="Remove this link">
      <i data-lucide="trash-2" style="width:16px;height:16px"></i>
    </button>`;

    html += '</div>'; // .social-link-entry
    return html;
  }

  function escapeAttr(str) {
    return (str || '').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function init() {
    // Start with one social entry by default
    links = [];
    nextId = 1;
    addLink('social', 'instagram');
  }

  function reset() {
    links = [];
    nextId = 1;
    renderLinks();
  }

  return { init, reset, addLink, removeLink, updateLink, getLinks, renderLinks };
})();
