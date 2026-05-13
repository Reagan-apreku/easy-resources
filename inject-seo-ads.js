const fs = require('fs');
const path = require('path');

const baseDir = __dirname;
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

const SITE_URL = 'https://easyresources.online';

articles.forEach(article => {
  const file = path.join(baseDir, 'blog', article, 'index.html');
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Check if already injected
    if (content.includes('og:title')) {
      console.log(`Skipping ${article} (already has SEO)`);
      return;
    }

    // Extract basic data
    const titleMatch = content.match(/<title>(.*?)<\/title>/);
    const descMatch = content.match(/<meta name="description" content="(.*?)">/);
    const imgMatch = content.match(/background-image:\s*url\('([^']+)'\)/);
    const catMatch = content.match(/<span class="article-category">(.*?)<\/span>/);
    const dateMatch = content.match(/<div class="article-meta">Published (.*?) •/);

    const title = titleMatch ? titleMatch[1] : '';
    const desc = descMatch ? descMatch[1] : '';
    let imgUrl = imgMatch ? imgMatch[1] : '';
    // Resolve absolute image URL
    if (imgUrl.startsWith('../../')) {
      imgUrl = SITE_URL + imgUrl.substring(5);
    }
    const cat = catMatch ? catMatch[1] : 'Article';
    const dateStr = dateMatch ? dateMatch[1] : 'May 13, 2026';
    const articleUrl = `${SITE_URL}/blog/${article}/`;

    // Construct Meta & Schema
    const seoTags = `
<link rel="canonical" href="${articleUrl}">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${desc}">
<meta property="og:image" content="${imgUrl}">
<meta property="og:url" content="${articleUrl}">
<meta property="og:type" content="article">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${title}">
<meta name="twitter:description" content="${desc}">
<meta name="twitter:image" content="${imgUrl}">
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "${title}",
  "image": "${imgUrl}",
  "author": {
    "@type": "Organization",
    "name": "Easy Resources"
  },
  "publisher": {
    "@type": "Organization",
    "name": "Easy Resources",
    "logo": {
      "@type": "ImageObject",
      "url": "${SITE_URL}/assets/logo.png"
    }
  },
  "datePublished": "2026-05-13T12:00:00Z",
  "articleSection": "${cat}",
  "url": "${articleUrl}"
}
</script>`;

    // Inject SEO tags after </title>
    content = content.replace(/<\/title>/, `</title>\n${seoTags}`);

    // Inject Ad 1: Top Banner
    const ad1 = `\n    <div class="ad-container"><!-- AdSense Responsive Top --></div>\n`;
    content = content.replace(/<article class="article-content">/, `<article class="article-content">${ad1}`);

    // Inject Ad 2: Middle Banner (before first <h2>)
    const ad2 = `\n    <div class="ad-container"><!-- AdSense Responsive In-Article --></div>\n    <h2>`;
    content = content.replace(/<h2>/, ad2);

    // Inject Ad 3: Bottom Banner (before </article>)
    const ad3 = `\n    <div class="ad-container"><!-- AdSense Responsive Bottom --></div>\n  </article>`;
    content = content.replace(/<\/article>/, ad3);

    fs.writeFileSync(file, content, 'utf8');
    console.log(`Processed ${article}`);
  }
});

// Process Blog Hub
const hubFile = path.join(baseDir, 'blog', 'index.html');
if (fs.existsSync(hubFile)) {
  let hubContent = fs.readFileSync(hubFile, 'utf8');
  if (!hubContent.includes('og:title')) {
    const hubTitle = "Blog — Easy Resources";
    const hubDesc = "Learn how to optimize your digital assets, create better QR codes, and improve web performance with our free guides and tutorials.";
    const hubUrl = `${SITE_URL}/blog/`;
    const hubImg = `${SITE_URL}/assets/og-preview.png`;
    
    const hubSeo = `
<link rel="canonical" href="${hubUrl}">
<meta property="og:title" content="${hubTitle}">
<meta property="og:description" content="${hubDesc}">
<meta property="og:image" content="${hubImg}">
<meta property="og:url" content="${hubUrl}">
<meta property="og:type" content="website">
<meta name="twitter:card" content="summary_large_image">
`;
    hubContent = hubContent.replace(/<\/title>/, `</title>\n${hubSeo}`);
    
    // Inject Hub Ad
    const hubAd = `\n  <div class="ad-container" style="max-width: 900px; margin: 0 auto 4rem;"><!-- AdSense Hub Horizontal --></div>\n  <!-- Bottom Row: Development & More -->`;
    hubContent = hubContent.replace(/<!-- Bottom Row: Development & More -->/, hubAd);
    
    fs.writeFileSync(hubFile, hubContent, 'utf8');
    console.log("Processed blog/index.html");
  }
}
