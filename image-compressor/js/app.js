// State
let files = [];

// DOM Elements
const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const fileList = document.getElementById('file-list');
const compressBtn = document.getElementById('compress-btn');
const clearAllBtn = document.getElementById('clear-all');
const qualityRange = document.getElementById('quality');
const qualityLabel = document.getElementById('quality-label');
const maxWidthInput = document.getElementById('max-width');
const outputFormatSelect = document.getElementById('output-format');

// Initialization
function init() {
  dropZone.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', handleFileSelect);
  
  dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('drag-over'); });
  dropZone.addEventListener('dragleave', () => { dropZone.classList.remove('drag-over'); });
  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
    if (e.dataTransfer.files.length) addFiles(Array.from(e.dataTransfer.files));
  });

  qualityRange.addEventListener('input', () => {
    qualityLabel.textContent = qualityRange.value;
    resetDoneStatus();
  });

  maxWidthInput.addEventListener('input', resetDoneStatus);
  outputFormatSelect.addEventListener('change', resetDoneStatus);

  clearAllBtn.addEventListener('click', () => {
    files = [];
    renderFileList();
    updateActionBtn();
  });

  compressBtn.addEventListener('click', compressAll);
}

function resetDoneStatus() {
  let changed = false;
  files.forEach(f => {
    if (f.status === 'done') {
      f.status = 'pending';
      f.compressedSize = null;
      f.compressedBlob = null;
      changed = true;
    }
  });
  if (changed) {
    renderFileList();
    updateActionBtn();
  }
}

function handleFileSelect(e) {
  addFiles(Array.from(e.target.files));
}

function addFiles(newFiles) {
  const imageFiles = newFiles.filter(file => file.type.startsWith('image/'));
  
  imageFiles.forEach(file => {
    const fileObj = {
      file: file,
      id: Date.now() + Math.random(),
      originalSize: file.size,
      compressedSize: null,
      compressedBlob: null,
      status: 'pending', // pending, compressing, done
      preview: URL.createObjectURL(file)
    };
    files.push(fileObj);
  });
  renderFileList();
  updateActionBtn();
}

function renderFileList() {
  fileList.innerHTML = '';
  files.forEach((fileObj) => {
    const item = document.createElement('div');
    item.className = 'file-item';
    
    const savings = fileObj.compressedSize 
      ? Math.round((1 - fileObj.compressedSize / fileObj.originalSize) * 100)
      : 0;

    item.innerHTML = `
      <img src="${fileObj.preview}" class="file-thumb">
      <div class="file-info">
        <div class="file-name">${fileObj.file.name}</div>
        <div class="file-stats">
          <span>Original: ${formatSize(fileObj.originalSize)}</span>
          ${fileObj.compressedSize ? `<span>Compressed: ${formatSize(fileObj.compressedSize)}</span>` : ''}
          ${savings > 0 ? `<span class="savings">-${savings}% Saved</span>` : ''}
          ${fileObj.status === 'compressing' ? `<span style="color: var(--accent)">${fileObj.progress || 'Optimizing...'}</span>` : ''}
          ${fileObj.status === 'error' ? '<span style="color: #ef4444">Processing Failed</span>' : ''}
        </div>
      </div>
      <div style="display: flex; gap: 0.5rem; align-items: center;">
        ${fileObj.status === 'done' ? `<button class="btn-download-small" onclick="downloadFile(${fileObj.id})">⬇️</button>` : ''}
        <button class="btn-remove" data-id="${fileObj.id}">✕</button>
      </div>
    `;
    
    item.querySelector('.btn-remove').addEventListener('click', () => {
      files = files.filter(f => f.id !== fileObj.id);
      renderFileList();
      updateActionBtn();
    });
    
    fileList.appendChild(item);
  });
}

function updateActionBtn() {
  const hasFiles = files.length > 0;
  compressBtn.disabled = !hasFiles;
  clearAllBtn.style.display = hasFiles ? 'block' : 'none';
  
  const allDone = hasFiles && files.every(f => f.status === 'done');
  compressBtn.textContent = allDone ? 'Download All Optimized' : 'Compress All Images';
}

async function compressAll() {
  const allDone = files.length > 0 && files.every(f => f.status === 'done');
  if (allDone) {
    files.forEach(f => downloadFile(f.id));
    return;
  }

  compressBtn.textContent = 'Optimizing...';
  compressBtn.disabled = true;

  const options = {
    maxSizeMB: 50, // Increased threshold for large files
    maxWidthOrHeight: parseInt(maxWidthInput.value) || 1920,
    useWebWorker: true,
    initialQuality: parseInt(qualityRange.value) / 100,
    alwaysKeepResolution: !maxWidthInput.value, // Keep res if not specified
    fileType: outputFormatSelect.value === 'original' ? undefined : `image/${outputFormatSelect.value}`
  };

  for (let fileObj of files) {
    if (fileObj.status === 'done') continue;
    
    fileObj.status = 'compressing';
    fileObj.progress = 'Decoding...';
    renderFileList();

    try {
      // For very large files, we might need a slightly more relaxed hard-target
      const currentOptions = { ...options };
      if (fileObj.originalSize > 20 * 1024 * 1024) {
        currentOptions.maxSizeMB = Math.max(options.maxSizeMB, Math.round(fileObj.originalSize / (1024 * 1024) * 0.9));
      }

      const compressedFile = await imageCompression(fileObj.file, currentOptions);
      fileObj.compressedBlob = compressedFile;
      fileObj.compressedSize = compressedFile.size;
      fileObj.status = 'done';
    } catch (error) {
      console.warn('Library failed, trying hardware bypass:', fileObj.file.name);
      fileObj.progress = 'Hardware Scaling...';
      renderFileList();
      
      try {
        const fallbackBlob = await nativeCompress(fileObj, options);
        fileObj.compressedBlob = fallbackBlob;
        fileObj.compressedSize = fallbackBlob.size;
        fileObj.status = 'done';
      } catch (fallbackError) {
        console.error('All compression methods failed:', fallbackError);
        fileObj.status = 'error';
        alert(`Failed to process ${fileObj.file.name}. This usually happens when an image exceeds the browser's absolute memory limits (common for large-format billboards).`);
      }
    }
    renderFileList();
  }

  updateActionBtn();
  compressBtn.disabled = false;
}

// Advanced sub-sampled native fallback
async function nativeCompress(fileObj, options) {
  const file = fileObj.file;
  return new Promise(async (resolve, reject) => {
    try {
      // Try hardware-accelerated decoding first
      if (window.createImageBitmap) {
        const DECODE_LIMIT = 4096;
        const bitmap = await createImageBitmap(file, {
          resizeWidth: options.maxWidthOrHeight ? Math.min(options.maxWidthOrHeight, DECODE_LIMIT) : DECODE_LIMIT,
          resizeQuality: 'high'
        });

        const canvas = document.createElement('canvas');
        canvas.width = bitmap.width;
        canvas.height = bitmap.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(bitmap, 0, 0);
        bitmap.close();

        const type = options.fileType || file.type;
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Canvas toBlob failed'));
        }, type, options.initialQuality);
      } else {
        throw new Error('createImageBitmap not supported');
      }
    } catch (e) {
      // Final desperation fallback: Classic Image object with forced constraints
      console.warn('Hardware bypass failed, trying emergency fallback');
      fileObj.progress = 'Emergency Scaling...';
      renderFileList();

      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_EMERGENCY_SIZE = 3000; // Even safer limit
        let w = img.width;
        let h = img.height;
        const scale = Math.min(MAX_EMERGENCY_SIZE / w, MAX_EMERGENCY_SIZE / h, 1);
        
        canvas.width = w * scale;
        canvas.height = h * scale;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Emergency fallback failed'));
        }, options.fileType || file.type, options.initialQuality);
      };
      img.onerror = () => reject(new Error('Final fallback failed'));
      img.src = URL.createObjectURL(file);
    }
  });
}

function downloadFile(id) {
  const fileObj = files.find(f => f.id === id);
  if (!fileObj || !fileObj.compressedBlob) return;
  
  const url = URL.createObjectURL(fileObj.compressedBlob);
  const a = document.createElement('a');
  a.href = url;
  
  // Handle extension change if format was converted
  let name = fileObj.file.name;
  if (outputFormatSelect.value !== 'original') {
    name = name.split('.').slice(0, -1).join('.') + '.' + outputFormatSelect.value;
  }
  
  a.download = 'easy-resources-optimized-' + name;
  a.click();
  URL.revokeObjectURL(url);
}

function formatSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

window.downloadFile = downloadFile; // Make accessible to inline onclick
init();
