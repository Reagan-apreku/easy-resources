document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const resultsArea = document.getElementById('resultsArea');
    const imagePreview = document.getElementById('imagePreview');
    const resetBtn = document.getElementById('resetBtn');
    
    // Palette Elements
    const dominantColor = document.getElementById('dominantColor');
    const dominantSwatch = document.getElementById('dominantSwatch');
    const dominantHex = document.getElementById('dominantHex');
    const dominantRgb = document.getElementById('dominantRgb');
    const paletteGrid = document.getElementById('paletteGrid');
    const downloadPalette = document.getElementById('downloadPalette');
    const toast = document.getElementById('toast');

    // Initialize Color Thief
    const colorThief = new ColorThief();

    // Helper: Convert RGB array to HEX string
    const rgbToHex = (r, g, b) => '#' + [r, g, b].map(x => {
        const hex = x.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }).join('');

    // --- File Upload Logic ---
    
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

    // Reset
    resetBtn.addEventListener('click', () => {
        fileInput.value = '';
        imagePreview.src = '';
        dropZone.style.display = 'block';
        resultsArea.style.display = 'none';
        paletteGrid.innerHTML = '';
    });

    // Handle File
    function handleFile(file) {
        if (!file.type.startsWith('image/')) {
            alert('Please upload an image file (PNG, JPG, WebP).');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            imagePreview.src = e.target.result;
            dropZone.style.display = 'none';
            resultsArea.style.display = 'grid';
        };
        reader.readAsDataURL(file);
    }

    // --- Color Extraction Logic ---

    // Extract colors once image is fully loaded
    imagePreview.addEventListener('load', () => {
        try {
            // Extract dominant color
            const dColor = colorThief.getColor(imagePreview);
            const dHex = rgbToHex(dColor[0], dColor[1], dColor[2]);
            const dRgbString = `rgb(${dColor[0]}, ${dColor[1]}, ${dColor[2]})`;

            dominantSwatch.style.backgroundColor = dHex;
            dominantHex.textContent = dHex;
            dominantRgb.textContent = dRgbString;

            // Setup click to copy for dominant color
            dominantColor.onclick = () => copyToClipboard(dHex);

            // Extract palette (8 colors)
            const palette = colorThief.getPalette(imagePreview, 8);
            paletteGrid.innerHTML = ''; // Clear previous

            palette.forEach((colorArray, index) => {
                const hex = rgbToHex(colorArray[0], colorArray[1], colorArray[2]);
                
                const item = document.createElement('div');
                item.className = 'palette-item';
                item.title = "Click to copy HEX";
                item.onclick = () => copyToClipboard(hex);
                
                item.innerHTML = `
                    <div class="palette-swatch" style="background-color: ${hex};"></div>
                    <div class="palette-info">
                        <span class="palette-hex">${hex}</span>
                    </div>
                `;
                paletteGrid.appendChild(item);
            });

            // Store current palette for download
            window.currentExtractedPalette = {
                dominant: dHex,
                palette: palette.map(c => rgbToHex(c[0], c[1], c[2]))
            };

        } catch (err) {
            console.error("Color extraction failed:", err);
            // ColorThief fails if the image is tainted by CORS, but since we use FileReader (data URL), it should always work.
        }
    });

    // --- Utilities ---

    function copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            showToast(`Copied ${text}`);
        });
    }

    let toastTimeout;
    function showToast(msg) {
        toast.textContent = msg;
        toast.classList.add('show');
        clearTimeout(toastTimeout);
        toastTimeout = setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    // Download CSS Palette
    downloadPalette.addEventListener('click', () => {
        if (!window.currentExtractedPalette) return;

        let cssContent = `/* Extracted Color Palette */\n:root {\n`;
        cssContent += `  --color-dominant: ${window.currentExtractedPalette.dominant};\n`;
        
        window.currentExtractedPalette.palette.forEach((hex, i) => {
            cssContent += `  --color-palette-${i + 1}: ${hex};\n`;
        });
        cssContent += `}\n`;

        const blob = new Blob([cssContent], { type: 'text/css' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'extracted-palette.css';
        a.click();
        URL.revokeObjectURL(url);
    });

});
