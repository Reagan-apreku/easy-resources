document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const processArea = document.getElementById('processArea');
    const imagePreview = document.getElementById('imagePreview');
    const fileName = document.getElementById('fileName');
    const fileSize = document.getElementById('fileSize');
    const resetBtn = document.getElementById('resetBtn');
    const formatBtns = document.querySelectorAll('.format-btn');
    const qualityRow = document.getElementById('qualityRow');
    const qualityRange = document.getElementById('qualityRange');
    const qualityVal = document.getElementById('qualityVal');
    const convertBtn = document.getElementById('convertBtn');

    let currentFile = null;
    let targetFormat = 'image/png';

    // Drag and Drop
    dropZone.addEventListener('click', () => fileInput.click());
    
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('drag-over');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('drag-over');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            handleFile(file);
        }
    });

    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) handleFile(file);
    });

    function handleFile(file) {
        currentFile = file;
        fileName.textContent = file.name;
        fileSize.textContent = (file.size / 1024).toFixed(1) + ' KB';

        const reader = new FileReader();
        reader.onload = (e) => {
            imagePreview.src = e.target.result;
            dropZone.style.display = 'none';
            processArea.style.display = 'flex';
        };
        reader.readAsDataURL(file);
    }

    resetBtn.addEventListener('click', () => {
        currentFile = null;
        fileInput.value = '';
        dropZone.style.display = 'block';
        processArea.style.display = 'none';
    });

    // Format Selection
    formatBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            formatBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            targetFormat = btn.dataset.format;
            
            // Show quality slider only for JPG and WebP
            if (targetFormat === 'image/jpeg' || targetFormat === 'image/webp') {
                qualityRow.style.display = 'block';
            } else {
                qualityRow.style.display = 'none';
            }
        });
    });

    qualityRange.addEventListener('input', (e) => {
        qualityVal.textContent = e.target.value + '%';
    });

    // Conversion Logic
    convertBtn.addEventListener('click', () => {
        if (!currentFile) return;

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            
            // Handle transparency for non-PNG formats (fill white)
            if (targetFormat === 'image/jpeg') {
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }
            
            ctx.drawImage(img, 0, 0);

            const quality = parseInt(qualityRange.value) / 100;
            const dataUrl = canvas.toDataURL(targetFormat, quality);
            
            const link = document.createElement('a');
            const ext = targetFormat.split('/')[1];
            link.download = `easy-resources-${fileName.textContent.split('.')[0]}.${ext === 'jpeg' ? 'jpg' : ext}`;
            link.href = dataUrl;
            link.click();
        };

        img.src = imagePreview.src;
    });
});
