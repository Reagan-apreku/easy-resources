document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const barcodeValue = document.getElementById('barcodeValue');
    const barcodeFormat = document.getElementById('barcodeFormat');
    const barcodeWidth = document.getElementById('barcodeWidth');
    const widthValue = document.getElementById('widthValue');
    const barcodeHeight = document.getElementById('barcodeHeight');
    const heightValue = document.getElementById('heightValue');
    const displayValue = document.getElementById('displayValue');
    const downloadBtn = document.getElementById('downloadBtn');
    
    const currentFormatBadge = document.getElementById('currentFormatBadge');
    const barcodeSvg = document.getElementById('barcode');
    const errorMsg = document.getElementById('errorMsg');
    const barcodeWrapper = document.getElementById('barcodeWrapper');

    // Debounce timer for smooth typing
    let generateTimeout;

    // Initialize Barcode
    function generateBarcode() {
        const value = barcodeValue.value.trim() || '123456789012';
        const format = barcodeFormat.value;
        const width = parseInt(barcodeWidth.value);
        const height = parseInt(barcodeHeight.value);
        const showText = displayValue.checked;

        // Update UI Badge
        currentFormatBadge.textContent = format;

        try {
            // Generate Barcode using JsBarcode
            JsBarcode("#barcode", value, {
                format: format,
                width: width,
                height: height,
                displayValue: showText,
                font: "Plus Jakarta Sans",
                fontSize: 16,
                textMargin: 6,
                margin: 20,
                background: "#ffffff",
                lineColor: "#1a1a1a"
            });
            
            // Hide error if successful
            errorMsg.style.display = 'none';
            barcodeWrapper.style.opacity = '1';
            downloadBtn.disabled = false;
            
        } catch (error) {
            // Display error gracefully if data is invalid for the format
            console.warn("Barcode Generation Error:", error);
            errorMsg.style.display = 'flex';
            barcodeWrapper.style.opacity = '0.3';
            downloadBtn.disabled = true;
        }
    }

    // Event Listeners for inputs
    const inputs = [barcodeValue, barcodeFormat, barcodeWidth, barcodeHeight, displayValue];
    
    inputs.forEach(input => {
        input.addEventListener('input', () => {
            // Update labels
            if (input.id === 'barcodeWidth') widthValue.textContent = input.value;
            if (input.id === 'barcodeHeight') heightValue.textContent = input.value + 'px';
            
            // Debounce the generation so it doesn't freeze on rapid typing
            clearTimeout(generateTimeout);
            generateTimeout = setTimeout(generateBarcode, 150);
        });
    });

    // Download functionality (SVG to PNG)
    downloadBtn.addEventListener('click', () => {
        if (downloadBtn.disabled) return;
        
        // We have an SVG, we need to convert it to a canvas to download as PNG
        const svgData = new XMLSerializer().serializeToString(barcodeSvg);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        // Convert SVG string to base64
        const svgBase64 = btoa(unescape(encodeURIComponent(svgData)));
        const svgSource = `data:image/svg+xml;base64,${svgBase64}`;

        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.fillStyle = '#ffffff'; // Ensure white background
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);

            // Trigger Download
            const a = document.createElement('a');
            a.download = `easy-resources-barcode-${barcodeFormat.value.toLowerCase()}.png`;
            a.href = canvas.toDataURL('image/png');
            a.click();
        };

        img.src = svgSource;
    });

    // Initial Generation
    generateBarcode();
});
