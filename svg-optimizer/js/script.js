document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const svgInput = document.getElementById('svgInput');
    const svgOutput = document.getElementById('svgOutput');
    const optimizeBtn = document.getElementById('optimizeBtn');
    
    // Options
    const optComments = document.getElementById('optComments');
    const optXml = document.getElementById('optXml');
    const optEmpty = document.getElementById('optEmpty');
    const optWhitespace = document.getElementById('optWhitespace');

    // Results & Actions
    const statsGrid = document.getElementById('statsGrid');
    const originalSizeEl = document.getElementById('originalSize');
    const optimizedSizeEl = document.getElementById('optimizedSize');
    const savingsBadge = document.getElementById('savingsBadge');
    
    const copyBtn = document.getElementById('copyBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const toast = document.getElementById('toast');

    // --- File Upload Handling ---
    
    // Drag & Drop
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });
    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('dragover');
    });
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        if (e.dataTransfer.files.length > 0) {
            handleFile(e.dataTransfer.files[0]);
        }
    });

    // Click to upload
    dropZone.addEventListener('click', () => {
        fileInput.click();
    });
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFile(e.target.files[0]);
        }
    });

    // Read File
    function handleFile(file) {
        if (file.type !== 'image/svg+xml' && !file.name.endsWith('.svg')) {
            alert('Please upload a valid SVG file.');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            svgInput.value = e.target.result;
            // Optionally auto-optimize on upload
            optimizeSvg();
        };
        reader.readAsText(file);
    }

    // --- Optimization Logic ---
    
    optimizeBtn.addEventListener('click', optimizeSvg);

    function optimizeSvg() {
        let rawSvg = svgInput.value.trim();
        if (!rawSvg) {
            alert("Please paste an SVG or upload a file.");
            return;
        }

        const originalBytes = new Blob([rawSvg]).size;
        let optimizedSvg = rawSvg;

        // 1. Remove XML instructions & DOCTYPE
        if (optXml.checked) {
            optimizedSvg = optimizedSvg.replace(/<\?xml.*?\?>/gi, '');
            optimizedSvg = optimizedSvg.replace(/<!DOCTYPE.*?>/gi, '');
        }

        // 2. Remove comments
        if (optComments.checked) {
            optimizedSvg = optimizedSvg.replace(/<!--[\s\S]*?-->/g, '');
        }

        // 3. Remove empty tags (e.g., <g></g>, <defs></defs>)
        // Run a few times for nested empty tags
        if (optEmpty.checked) {
            for (let i = 0; i < 3; i++) {
                optimizedSvg = optimizedSvg.replace(/<([a-z0-9-]+)[^>]*>\s*<\/\1>/gi, '');
            }
        }

        // 4. Minify whitespace
        if (optWhitespace.checked) {
            // Remove line breaks and tabs
            optimizedSvg = optimizedSvg.replace(/[\r\n\t]+/g, ' ');
            // Collapse multiple spaces
            optimizedSvg = optimizedSvg.replace(/\s{2,}/g, ' ');
            // Remove space between tags
            optimizedSvg = optimizedSvg.replace(/>\s+</g, '><');
            // Remove trailing spaces inside tags
            optimizedSvg = optimizedSvg.replace(/\s+\/>/g, '/>');
            optimizedSvg = optimizedSvg.replace(/\s+>/g, '>');
        }

        // Clean up any remaining leading/trailing whitespace
        optimizedSvg = optimizedSvg.trim();

        const optimizedBytes = new Blob([optimizedSvg]).size;

        // Update UI
        svgOutput.value = optimizedSvg;
        updateStats(originalBytes, optimizedBytes);
        
        // Enable buttons
        copyBtn.disabled = false;
        downloadBtn.disabled = false;
    }

    // --- Stats Calculation ---

    function formatBytes(bytes, decimals = 2) {
        if (!+bytes) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
    }

    function updateStats(original, optimized) {
        originalSizeEl.textContent = formatBytes(original);
        optimizedSizeEl.textContent = formatBytes(optimized);

        statsGrid.style.display = 'grid';

        if (original > 0) {
            const savings = ((original - optimized) / original) * 100;
            if (savings > 0) {
                savingsBadge.textContent = `Saved ${savings.toFixed(1)}%`;
                savingsBadge.style.display = 'block';
                savingsBadge.style.color = '#10b981';
                savingsBadge.style.borderColor = '#a7f3d0';
                savingsBadge.style.background = '#ecfdf5';
            } else {
                savingsBadge.textContent = `No size difference`;
                savingsBadge.style.display = 'block';
                savingsBadge.style.color = '#64748b';
                savingsBadge.style.borderColor = '#cbd5e1';
                savingsBadge.style.background = '#f8fafc';
            }
        }
    }

    // --- Actions ---

    let toastTimeout;
    function showToast(msg) {
        toast.textContent = msg;
        toast.classList.add('show');
        clearTimeout(toastTimeout);
        toastTimeout = setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    copyBtn.addEventListener('click', () => {
        if (!svgOutput.value) return;
        navigator.clipboard.writeText(svgOutput.value).then(() => {
            showToast('SVG Code Copied!');
        });
    });

    downloadBtn.addEventListener('click', () => {
        if (!svgOutput.value) return;
        const blob = new Blob([svgOutput.value], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'optimized.svg';
        a.click();
        URL.revokeObjectURL(url);
    });

});
