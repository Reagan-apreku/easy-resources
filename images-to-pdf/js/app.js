const { jsPDF } = window.jspdf;

// State
let files = [];

// DOM Elements
const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const fileList = document.getElementById('file-list');
const convertBtn = document.getElementById('convert-btn');
const pageSizeSelect = document.getElementById('page-size');
const orientationSelect = document.getElementById('orientation');
const marginInput = document.getElementById('margin');

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

  convertBtn.addEventListener('click', generatePDF);
}

function handleFileSelect(e) {
  addFiles(Array.from(e.target.files));
}

function addFiles(newFiles) {
  const imageFiles = newFiles.filter(file => file.type.startsWith('image/'));
  
  imageFiles.forEach(file => {
    const reader = new FileReader();
    reader.onload = (e) => {
      files.push({ file: file, src: e.target.result, id: Date.now() + Math.random() });
      renderFileList();
      updateConvertBtn();
    };
    reader.readAsDataURL(file);
  });
}

function renderFileList() {
  fileList.innerHTML = '';
  files.forEach((fileObj) => {
    const item = document.createElement('div');
    item.className = 'file-item';
    item.innerHTML = `
      <img src="${fileObj.src}" class="file-thumb">
      <div class="file-name">${fileObj.file.name}</div>
      <button class="btn-remove" data-id="${fileObj.id}">✕</button>
    `;
    item.querySelector('.btn-remove').addEventListener('click', () => {
      files = files.filter(f => f.id !== fileObj.id);
      renderFileList();
      updateConvertBtn();
    });
    fileList.appendChild(item);
  });
}

function updateConvertBtn() {
  convertBtn.disabled = files.length === 0;
}

async function generatePDF() {
  convertBtn.textContent = 'Generating...';
  convertBtn.disabled = true;

  try {
    const pageSize = pageSizeSelect.value;
    const orientation = orientationSelect.value;
    const margin = parseInt(marginInput.value) || 0;
    
    const doc = new jsPDF({
      orientation: orientation,
      unit: 'mm',
      format: pageSize === 'fit' ? 'a4' : pageSize
    });

    for (let i = 0; i < files.length; i++) {
      if (i > 0) doc.addPage();
      const img = await loadImage(files[i].src);
      
      let pw = doc.internal.pageSize.getWidth();
      let ph = doc.internal.pageSize.getHeight();

      // If "fit", we change the page size for this page
      if (pageSize === 'fit') {
        const baselineWidth = 210; 
        pw = baselineWidth;
        ph = (img.height / img.width) * baselineWidth;
        doc.setPage(i + 1);
        doc.addPage([pw, ph], pw > ph ? 'l' : 'p');
        if (i === 0) doc.deletePage(1);
      }

      const usableW = pw - (margin * 2);
      const usableH = ph - (margin * 2);
      const imgRatio = img.width / img.height;
      const areaRatio = usableW / usableH;
      
      let fw, fh;
      if (imgRatio > areaRatio) { fw = usableW; fh = usableW / imgRatio; }
      else { fh = usableH; fw = usableH * imgRatio; }

      doc.addImage(img, 'JPEG', margin + (usableW - fw)/2, margin + (usableH - fh)/2, fw, fh, undefined, 'FAST');
    }

    doc.save('easyresources-images.pdf');
  } catch (err) {
    console.error(err);
    alert('Failed to generate PDF.');
  } finally {
    convertBtn.textContent = 'Generate PDF';
    convertBtn.disabled = false;
  }
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

init();
