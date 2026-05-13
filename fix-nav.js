const fs = require('fs');
const path = require('path');

const correctFile = path.join(__dirname, 'blog/how-to-create-custom-qr-codes-for-business/index.html');
const content = fs.readFileSync(correctFile, 'utf8');

// Extract the nav block
const navMatch = content.match(/<nav>[\s\S]*?<\/nav>/);
if (!navMatch) {
  console.error("Could not find nav in correct file.");
  process.exit(1);
}
const correctNav = navMatch[0];

const newPosts = [
  'the-ultimate-guide-to-barcode-formats',
  'password-security-best-practices',
  'json-formatting-and-syntax-guide',
  'the-history-of-lorem-ipsum',
  'guide-to-modern-image-formats',
  'why-pdf-is-the-standard-for-documents',
  'how-to-create-the-perfect-favicon',
  'color-theory-for-web-designers'
];

newPosts.forEach(post => {
  const file = path.join(__dirname, 'blog', post, 'index.html');
  if (fs.existsSync(file)) {
    let postContent = fs.readFileSync(file, 'utf8');
    postContent = postContent.replace(/<nav>[\s\S]*?<\/nav>/, correctNav);
    fs.writeFileSync(file, postContent, 'utf8');
    console.log("Fixed nav in " + post);
  }
});
