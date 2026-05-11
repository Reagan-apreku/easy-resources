document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const previewSection = document.getElementById('preview-section');
    const resetBtn = document.getElementById('reset-btn');
    const downloadZipBtn = document.getElementById('download-zip');
    const downloadIcoBtn = document.getElementById('download-ico');
    const copySnippetBtn = document.getElementById('copy-snippet');
    const snippetCode = document.getElementById('snippet-code');

    let sourceImage = null;

    // Standard Sizes
    const sizes = [16, 32, 180, 192];

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
        const files = e.dataTransfer.files;
        if (files.length > 0) handleFile(files[0]);
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) handleFile(e.target.files[0]);
    });

    function handleFile(file) {
        if (!file.type.startsWith('image/')) {
            alert('Please upload an image file.');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                sourceImage = img;
                generatePreviews();
                dropZone.style.display = 'none';
                previewSection.style.display = 'block';
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    function generatePreviews() {
        sizes.forEach(size => {
            const canvas = document.createElement('canvas');
            canvas.width = size;
            canvas.height = size;
            const ctx = canvas.getContext('2d');
            
            // Fill with transparency or white if needed? No, favicons usually want transparency.
            ctx.clearRect(0, 0, size, size);
            
            // Maintain aspect ratio or force square? Icons are square.
            // We draw the image centered.
            const ratio = Math.min(size / sourceImage.width, size / sourceImage.height);
            const w = sourceImage.width * ratio;
            const h = sourceImage.height * ratio;
            const x = (size - w) / 2;
            const y = (size - h) / 2;
            
            ctx.drawImage(sourceImage, x, y, w, h);
            
            const previewImg = document.getElementById(`preview-${size}`);
            previewImg.src = canvas.toDataURL('image/png');
        });
    }

    resetBtn.addEventListener('click', () => {
        sourceImage = null;
        dropZone.style.display = 'block';
        previewSection.style.display = 'none';
        fileInput.value = '';
    });

    downloadZipBtn.addEventListener('click', async () => {
        if (!sourceImage) return;

        const zip = new JSZip();
        
        for (const size of sizes) {
            const canvas = document.createElement('canvas');
            canvas.width = size;
            canvas.height = size;
            const ctx = canvas.getContext('2d');
            
            const ratio = Math.min(size / sourceImage.width, size / sourceImage.height);
            const w = sourceImage.width * ratio;
            const h = sourceImage.height * ratio;
            const x = (size - w) / 2;
            const y = (size - h) / 2;
            
            ctx.drawImage(sourceImage, x, y, w, h);
            
            const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
            
            let filename = `favicon-${size}x${size}.png`;
            if (size === 180) filename = 'apple-touch-icon.png';
            if (size === 192) filename = 'android-chrome-192x192.png';
            
            zip.file(filename, blob);
        }

        const content = await zip.generateAsync({type: 'blob'});
        const link = document.createElement('a');
        link.href = URL.createObjectURL(content);
        link.download = 'favicons.zip';
        link.click();
    });

    downloadIcoBtn.addEventListener('click', () => {
        if (!sourceImage) return;

        // Simple ICO fallback: just download the 32x32 as .ico
        // (Real ICOs are containers, but browsers often accept PNG renamed to .ico or single-layer ICO)
        const canvas = document.createElement('canvas');
        canvas.width = 32;
        canvas.height = 32;
        const ctx = canvas.getContext('2d');
        
        const ratio = Math.min(32 / sourceImage.width, 32 / sourceImage.height);
        const w = sourceImage.width * ratio;
        const h = sourceImage.height * ratio;
        const x = (32 - w) / 2;
        const y = (32 - h) / 2;
        
        ctx.drawImage(sourceImage, x, y, w, h);
        
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/x-icon');
        link.download = 'favicon.ico';
        link.click();
    });

    copySnippetBtn.addEventListener('click', () => {
        const text = snippetCode.innerText;
        navigator.clipboard.writeText(text).then(() => {
            const originalText = copySnippetBtn.innerHTML;
            copySnippetBtn.innerHTML = '<i data-lucide="check" style="width: 14px; height: 14px;"></i> Copied!';
            lucide.createIcons();
            setTimeout(() => {
                copySnippetBtn.innerHTML = originalText;
                lucide.createIcons();
            }, 2000);
        });
    });

    lucide.createIcons();
});
