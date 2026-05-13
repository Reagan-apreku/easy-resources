const fs = require('fs');
const path = require('path');

const baseDir = __dirname;
const blogArticles = [
  'how-to-create-custom-qr-codes-for-business',
  'ultimate-guide-to-svg-optimization',
  'understanding-image-compression-png-vs-jpeg',
  'the-ultimate-guide-to-barcode-formats',
  'password-security-best-practices',
  'json-formatting-and-syntax-guide',
  'the-history-of-lorem-ipsum',
  'guide-to-modern-image-formats',
  'why-pdf-is-the-standard-for-documents',
  'how-to-create-the-perfect-favicon',
  'color-theory-for-web-designers'
];

const shareBlock = `
    <div class="share-actions" style="justify-content: center; margin-top: 2rem;">
      <span style="font-size:0.875rem; font-weight:600; color:var(--text-soft); margin-right:0.5rem;">Share this article:</span>
      <a href="#" class="share-btn" data-platform="twitter" aria-label="Share on Twitter"><i data-lucide="twitter"></i></a>
      <a href="#" class="share-btn" data-platform="linkedin" aria-label="Share on LinkedIn"><i data-lucide="linkedin"></i></a>
      <a href="#" class="share-btn" data-platform="facebook" aria-label="Share on Facebook"><i data-lucide="facebook"></i></a>
      <a href="#" class="share-btn" data-platform="copy" aria-label="Copy Link"><i data-lucide="link"></i></a>
    </div>`;

// 1. Inject into Blog Articles
blogArticles.forEach(article => {
  const file = path.join(baseDir, 'blog', article, 'index.html');
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    if (!content.includes('Share this article:')) {
      // Replace after article-meta
      content = content.replace(/(<div class="article-meta">.*?<\/div>)/, `$1${shareBlock}`);
      fs.writeFileSync(file, content, 'utf8');
      console.log(`Added share buttons to blog: ${article}`);
    }
  }
});

// 2. Inject into color-palette-generator if missing
const paletteFile = path.join(baseDir, 'color-palette-generator', 'index.html');
if (fs.existsSync(paletteFile)) {
  let content = fs.readFileSync(paletteFile, 'utf8');
  if (!content.includes('class="share-actions"')) {
    const toolShareBlock = `
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
  </div>`;
    // Insert before </main>
    content = content.replace(/<\/main>/, `${toolShareBlock}\n</main>`);
    fs.writeFileSync(paletteFile, content, 'utf8');
    console.log(`Added share buttons to tool: color-palette-generator`);
  }
}
