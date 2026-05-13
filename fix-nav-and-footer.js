const fs = require('fs');
const path = require('path');

const baseDir = __dirname;
const barcodeFile = path.join(baseDir, 'barcode-generator', 'index.html');
const barcodeContent = fs.readFileSync(barcodeFile, 'utf8');

// Extract nav and footer
const navMatch = barcodeContent.match(/<nav>[\s\S]*?<\/nav>/);
const footerMatch = barcodeContent.match(/<footer>[\s\S]*?<\/footer>/);

if (!navMatch || !footerMatch) {
  console.error("Could not find nav or footer in barcode-generator.");
  process.exit(1);
}

const universalNav = navMatch[0];
const universalFooter = footerMatch[0];

// Update blog/index.html
const blogHubFile = path.join(baseDir, 'blog', 'index.html');
if (fs.existsSync(blogHubFile)) {
  let content = fs.readFileSync(blogHubFile, 'utf8');
  content = content.replace(/<nav>[\s\S]*?<\/nav>/, universalNav);
  content = content.replace(/<footer>[\s\S]*?<\/footer>/, universalFooter);
  fs.writeFileSync(blogHubFile, content, 'utf8');
  console.log("Updated blog/index.html");
}

// All 11 articles
const articles = [
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

// Deep nav and footer (adjust ../ to ../../)
const deepNav = universalNav.replace(/href="\.\.\//g, 'href="../../');
const deepFooter = universalFooter.replace(/href="\.\.\//g, 'href="../../');

const backBtnHtml = `<a href="../" class="back-btn">&larr; Back to Blog</a>\n    <span class="article-category">`;
const backBtnCss = `\n  .back-btn { display: inline-flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; font-weight: 700; color: var(--text-soft); text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 2rem; transition: color 0.2s; }\n  .back-btn:hover { color: var(--accent); }`;

articles.forEach(article => {
  const file = path.join(baseDir, 'blog', article, 'index.html');
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Replace nav and footer
    content = content.replace(/<nav>[\s\S]*?<\/nav>/, deepNav);
    content = content.replace(/<footer>[\s\S]*?<\/footer>/, deepFooter);
    
    // Inject back button CSS if not already there
    if (!content.includes('.back-btn {')) {
      content = content.replace('</style>', backBtnCss + '\n</style>');
    }
    
    // Inject back button HTML if not already there
    if (!content.includes('class="back-btn"')) {
      content = content.replace('<span class="article-category">', backBtnHtml);
    }
    
    fs.writeFileSync(file, content, 'utf8');
    console.log("Updated " + article);
  }
});
