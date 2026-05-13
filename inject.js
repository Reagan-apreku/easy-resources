const fs = require('fs');
const path = require('path');

const dirs = [
  'qr-code',
  'barcode-generator',
  'password-generator',
  'json-formatter',
  'lorem-ipsum',
  'image-compressor',
  'image-converter',
  'images-to-pdf',
  'svg-optimizer',
  'favicon-generator',
  'color-palette-extractor'
];

const footerActions = `
  <div class="tool-footer-actions">
    <div class="share-actions">
      <span style="font-size:0.875rem; font-weight:600; color:var(--text-soft); margin-right:0.5rem;">Share:</span>
      <a href="#" class="share-btn" data-platform="twitter" aria-label="Share on Twitter"><i data-lucide="twitter"></i></a>
      <a href="#" class="share-btn" data-platform="linkedin" aria-label="Share on LinkedIn"><i data-lucide="linkedin"></i></a>
      <a href="#" class="share-btn" data-platform="facebook" aria-label="Share on Facebook"><i data-lucide="facebook"></i></a>
      <a href="#" class="share-btn" data-platform="copy" aria-label="Copy Link"><i data-lucide="link"></i></a>
    </div>
    <button class="embed-btn" id="openEmbedModal">
      <i data-lucide="code"></i> Embed this Tool
    </button>
  </div>
`;

const modalAndScript = `
<!-- Embed Modal -->
<div class="modal-overlay" id="embedModal">
  <div class="modal-content">
    <button class="modal-close"><i data-lucide="x"></i></button>
    <h3>Embed this Tool</h3>
    <p style="font-size:0.875rem; color:var(--text-soft); margin-bottom:1rem;">Copy the code below to embed this free tool on your website.</p>
    <textarea id="embedCodeTextarea" readonly></textarea>
    <button class="btn btn-primary" id="copyEmbedCode" style="width: 100%; justify-content: center;"><i data-lucide="copy"></i> Copy Code</button>
  </div>
</div>

<script src="../global.js"></script>
`;

dirs.forEach(dir => {
  const filePath = path.join(__dirname, dir, 'index.html');
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');

    // Inject tool-footer-actions before </main> if not already there
    if (!content.includes('tool-footer-actions') && content.includes('</main>')) {
      content = content.replace('</main>', footerActions + '\n</main>');
    } else if (!content.includes('tool-footer-actions') && content.includes('<!-- Related Tools -->')) {
      // Fallback if no </main> (like qr-code)
      content = content.replace('<!-- Related Tools -->', footerActions + '\n\n<!-- Related Tools -->');
    }

    // Inject modal and global.js before </body>
    if (!content.includes('id="embedModal"') && content.includes('</body>')) {
      content = content.replace('</body>', modalAndScript + '\n</body>');
    }

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${dir}/index.html`);
  }
});
