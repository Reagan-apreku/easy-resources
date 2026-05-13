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
  'donate'
];

dirs.forEach(dir => {
  const filePath = path.join(__dirname, dir, 'index.html');
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');

    // Add to nav
    const prefix = dir === '.' ? '' : '../';
    const guidesLink = `<a href="${prefix}guides/" class="nav-link">Guides</a>`;
    
    if (!content.includes('href="' + prefix + 'guides/" class="nav-link"')) {
      // Find about link
      const aboutMatch = content.match(new RegExp(`<a href="${prefix}about/" class="nav-link">About</a>`));
      if (aboutMatch) {
        content = content.replace(aboutMatch[0], guidesLink + '\n      ' + aboutMatch[0]);
      } else {
        const fallbackMatch = content.match(/<a href="\.\.\/about\/" class="nav-link">About<\/a>/);
        if (fallbackMatch) {
           content = content.replace(fallbackMatch[0], guidesLink + '\n      ' + fallbackMatch[0]);
        }
      }
    }

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated nav in ${dir}/index.html`);
  }
});
