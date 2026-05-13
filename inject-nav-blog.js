const fs = require('fs');
const path = require('path');

const dirs = [
  '.',
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
  'color-palette-extractor',
  'about',
  'contact',
  'support',
  'donate',
  'blog',
  'blog/how-to-create-custom-qr-codes-for-business',
  'blog/understanding-image-compression-png-vs-jpeg',
  'blog/ultimate-guide-to-svg-optimization'
];

dirs.forEach(dir => {
  const filePath = path.join(__dirname, dir, 'index.html');
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');

    // Replace all instances of guides/ with blog/ and Guides with Blog in nav
    content = content.replace(/href="(\.\.\/)*guides\/" class="nav-link/g, (match) => {
      return match.replace('guides/', 'blog/');
    });
    
    // Replace the exact text "Guides" inside the nav link
    content = content.replace(/class="nav-link( active)?">Guides<\/a>/g, (match) => {
      return match.replace('Guides', 'Blog');
    });

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated nav to Blog in ${dir}/index.html`);
  }
});
