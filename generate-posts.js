const fs = require('fs');
const path = require('path');

const template = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{{TITLE}} — Easy Resources</title>
<meta name="description" content="{{DESC}}">
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<script src="https://unpkg.com/lucide@latest"></script>
<link rel="stylesheet" href="../../global.css">
<style>
  .article-header { padding: 6rem 0 3rem; text-align: center; background: #fafafa; border-bottom: 1px solid #e5e7eb; margin-bottom: 4rem; }
  .article-category { font-size: 0.875rem; font-weight: 700; color: var(--accent); text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 1rem; display: block; }
  .article-title { font-size: clamp(2.5rem, 5vw, 4rem); font-weight: 800; line-height: 1.1; letter-spacing: -0.04em; max-width: 800px; margin: 0 auto 1.5rem; }
  .article-meta { color: var(--text-soft); font-size: 0.95rem; font-weight: 500; }
  .article-content { max-width: 720px; margin: 0 auto 6rem; font-size: 1.125rem; line-height: 1.8; color: #374151; }
  .article-content h2 { font-size: 2rem; font-weight: 700; color: #111827; margin: 3rem 0 1.5rem; letter-spacing: -0.02em; }
  .article-content p { margin-bottom: 1.5rem; }
  .article-content ul { margin-bottom: 1.5rem; padding-left: 1.5rem; }
  .article-content li { margin-bottom: 0.5rem; }
  .article-content .tool-cta { background: var(--accent-soft); border: 1px solid var(--accent); padding: 2rem; border-radius: 16px; margin: 3rem 0; text-align: center; }
  .article-content .tool-cta h3 { color: var(--accent); margin-bottom: 0.5rem; font-size: 1.25rem; }
</style>
</head>
<body>

<nav>
  <div class="container nav-content">
    <a href="../../" class="logo">Easy<span>Resources</span></a>
    <div class="nav-links">
      <a href="../" class="nav-link active">Blog</a>
    </div>
  </div>
</nav>

<header class="article-header">
  <div class="container">
    <span class="article-category">{{CATEGORY}}</span>
    <h1 class="article-title">{{TITLE}}</h1>
    <div class="article-meta">Published May 13, 2026 • {{MINS}} min read</div>
  </div>
</header>

<div class="container">
  <div style="width:100%; height:500px; background-image:url('../../assets/blog/{{IMAGE}}'); background-size:cover; background-position:center; border-radius:24px; margin-top:-6rem; margin-bottom:4rem; box-shadow:0 25px 50px -12px rgba(0,0,0,0.25); position:relative; z-index:10;"></div>
</div>

<main class="container">
  <article class="article-content">
    {{CONTENT}}
    <div class="tool-cta">
      <h3>{{CTA_TITLE}}</h3>
      <p>{{CTA_DESC}}</p>
      <br>
      <a href="{{TOOL_LINK}}" class="btn btn-primary">{{CTA_BTN}}</a>
    </div>
    {{CONTENT_POST}}
  </article>
</main>

<footer>
  <div class="container">
    <div class="footer-content" style="text-align: center;">
      <a href="../../" class="logo" style="justify-content: center;">Easy<span>Resources</span></a>
      <p style="margin: 1rem auto 0; max-width: 400px; color: #94a3b8;">Providing the world with free, professional-grade digital utilities.</p>
    </div>
  </div>
</footer>

<script>lucide.createIcons();</script>
<script src="../../global.js"></script>
</body>
</html>`;

const posts = [
  {
    folder: 'the-ultimate-guide-to-barcode-formats',
    title: 'The Ultimate Guide to Barcode Formats',
    desc: 'Understand the difference between 1D and 2D barcodes, and learn which format is best for your retail or logistics business.',
    category: 'Logistics',
    mins: 5,
    image: 'barcode_hero.png',
    tool_link: '../../barcode-generator/',
    cta_title: 'Need a Barcode Instantly?',
    cta_desc: 'Generate Code 128, EAN, UPC, and more with our free Barcode Generator.',
    cta_btn: 'Generate Barcode',
    content: `<p>Barcodes are the backbone of modern commerce. From the grocery store checkout to global supply chains, these simple black-and-white lines carry essential data that keeps the world moving.</p>
    <h2>1D vs 2D Barcodes</h2>
    <p>The most basic distinction in barcodes is between one-dimensional (1D) and two-dimensional (2D) codes.</p>
    <ul>
      <li><strong>1D Barcodes:</strong> Traditional linear barcodes like UPC and EAN. They hold less data (usually just an ID number) but are universally recognized by laser scanners.</li>
      <li><strong>2D Barcodes:</strong> Formats like QR Codes and Data Matrix. They can hold thousands of characters, including URLs and contact info, and are scanned by cameras.</li>
    </ul>`,
    content_post: `<h2>Choosing the Right Format</h2>
    <p>If you're selling a product in a retail store, you'll almost always need a UPC (in North America) or an EAN (in Europe). If you're managing internal inventory or logistics, Code 128 is highly recommended because it supports letters and numbers.</p>`
  },
  {
    folder: 'password-security-best-practices',
    title: 'Password Security in 2026: Why Length Matters',
    desc: 'A comprehensive guide on password security, explaining why length is now more important than complexity when defending against brute-force attacks.',
    category: 'Security',
    mins: 4,
    image: 'password_hero.png',
    tool_link: '../../password-generator/',
    cta_title: 'Generate a Secure Password Now',
    cta_desc: 'Use our client-side password generator to create cryptographically secure passwords instantly.',
    cta_btn: 'Open Password Generator',
    content: `<p>For years, we were told to create passwords with a mix of uppercase letters, numbers, and symbols. But in 2026, the paradigm has shifted. Length is now the ultimate defense.</p>
    <h2>The Math of Brute-Forcing</h2>
    <p>Modern graphics cards can guess billions of passwords per second. A complex 8-character password like <code>P@$w0rd!</code> can be cracked almost instantly. However, a 16-character password made of entirely lowercase letters would take trillions of years to guess.</p>`,
    content_post: `<h2>Passphrases over Passwords</h2>
    <p>Instead of trying to remember complex symbols, security experts now recommend "passphrases." A phrase like <code>correct horse battery staple</code> is 25 characters long, easy to remember, and mathematically impossible to brute-force with current technology.</p>`
  },
  {
    folder: 'json-formatting-and-syntax-guide',
    title: 'JSON Formatting Best Practices for Developers',
    desc: 'Learn the strict syntax rules of JSON, common pitfalls, and how to properly format your data structures for APIs.',
    category: 'Development',
    mins: 6,
    image: 'json_hero.png',
    tool_link: '../../json-formatter/',
    cta_title: 'Format Your JSON Automatically',
    cta_desc: 'Paste your messy JSON into our formatter to instantly validate and beautify it.',
    cta_btn: 'Open JSON Formatter',
    content: `<p>JavaScript Object Notation (JSON) has become the de facto standard for data interchange on the web. It's lightweight, language-independent, and easy for both humans and machines to read.</p>
    <h2>Strict Syntax Rules</h2>
    <p>Unlike JavaScript objects, JSON syntax is extremely strict. A single missing comma or unquoted key will break the entire parser.</p>
    <ul>
      <li>All keys must be wrapped in double quotes <code>""</code>. Single quotes are not allowed.</li>
      <li>No trailing commas are allowed at the end of objects or arrays.</li>
      <li>Comments (<code>//</code> or <code>/* */</code>) are strictly forbidden in standard JSON.</li>
    </ul>`,
    content_post: `<h2>Why Minification Matters</h2>
    <p>While formatted JSON is great for reading, transmitting formatted JSON over a network wastes bandwidth. Always minify your JSON before sending it as an API payload to reduce file size and improve response times.</p>`
  },
  {
    folder: 'the-history-of-lorem-ipsum',
    title: 'Lorem Ipsum: The History of Placeholder Text',
    desc: 'Discover the fascinating origins of the world\'s most famous placeholder text, dating back to a scrambled Latin text from the 1st century BC.',
    category: 'Design',
    mins: 3,
    image: 'lorem_hero.png',
    tool_link: '../../lorem-ipsum/',
    cta_title: 'Need Placeholder Text?',
    cta_desc: 'Generate paragraphs of Lorem Ipsum instantly for your next design mockup.',
    cta_btn: 'Generate Lorem Ipsum',
    content: `<p>If you're a designer or developer, you've seen it a thousand times: <em>"Lorem ipsum dolor sit amet, consectetur adipiscing elit..."</em> But where did this seemingly nonsensical text come from?</p>
    <h2>The Origins in Ancient Rome</h2>
    <p>Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. It comes from sections of "de Finibus Bonorum et Malorum" (The Extremes of Good and Evil) by Cicero.</p>`,
    content_post: `<h2>Why Use It?</h2>
    <p>The purpose of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, making it look like readable English. Using "Content here, content here" draws the viewer's eye to the text, whereas Lorem Ipsum allows them to focus purely on the visual design and layout.</p>`
  },
  {
    folder: 'guide-to-modern-image-formats',
    title: 'When to Use WebP vs PNG vs JPEG',
    desc: 'A comprehensive developer\'s guide to modern image file formats, compression algorithms, and when to use which format.',
    category: 'Web Performance',
    mins: 6,
    image: 'image_converter_hero.png',
    tool_link: '../../image-converter/',
    cta_title: 'Convert Your Images Easily',
    cta_desc: 'Use our client-side image converter to switch between JPEG, PNG, and WebP instantly.',
    cta_btn: 'Go to Image Converter',
    content: `<p>Choosing the right image format is crucial for web performance. Making the wrong choice can lead to massive file sizes that slow down your site and ruin your SEO.</p>
    <h2>The Big Three</h2>
    <ul>
      <li><strong>JPEG:</strong> Best for photographs. Uses lossy compression to achieve small file sizes but does not support transparency.</li>
      <li><strong>PNG:</strong> Best for graphics with flat colors, text, or logos. It supports alpha-channel transparency and uses lossless compression (higher quality, but much larger file sizes).</li>
      <li><strong>WebP:</strong> The modern standard developed by Google. It supports both lossy and lossless compression, AND transparency, often at file sizes 30% smaller than JPEG or PNG.</li>
    </ul>`,
    content_post: `<h2>The Verdict</h2>
    <p>Whenever possible, serve your images as WebP. All modern browsers now support it, and the bandwidth savings are simply too good to ignore. If you have legacy constraints, fall back to JPEG for photos and PNG for transparent graphics.</p>`
  },
  {
    folder: 'why-pdf-is-the-standard-for-documents',
    title: 'Why PDF is the Undisputed Standard for Documents',
    desc: 'Explore the technical reasons why the Portable Document Format remains the industry standard for sharing and printing.',
    category: 'Productivity',
    mins: 4,
    image: 'pdf_hero.png',
    tool_link: '../../images-to-pdf/',
    cta_title: 'Convert Images to PDF',
    cta_desc: 'Easily merge your JPEGs and PNGs into a single, standardized PDF document.',
    cta_btn: 'Open PDF Generator',
    content: `<p>The Portable Document Format (PDF) was created by Adobe in 1992. Over three decades later, it remains the absolute standard for document sharing. Why?</p>
    <h2>True Portability</h2>
    <p>The magic of a PDF is that it looks exactly the same on any device. Whether you open it on a Windows PC, a Mac, an iPhone, or print it on paper, the fonts, formatting, and layout are perfectly preserved. This is because a PDF embeds the exact rendering instructions directly into the file.</p>`,
    content_post: `<h2>Security and Integrity</h2>
    <p>PDFs are designed to be read-only by default. While Word documents can be easily modified by accident, PDFs preserve the integrity of the document, making them the only acceptable format for legal contracts, resumes, and official reports.</p>`
  },
  {
    folder: 'how-to-create-the-perfect-favicon',
    title: 'How to Create the Perfect Favicon for Your Website',
    desc: 'Learn the best practices for designing favicons that stand out in crowded browser tabs and mobile home screens.',
    category: 'Design',
    mins: 5,
    image: 'favicon_hero.png',
    tool_link: '../../favicon-generator/',
    cta_title: 'Generate Favicons Instantly',
    cta_desc: 'Upload your logo and let us generate all the necessary sizes and code snippets for your site.',
    cta_btn: 'Go to Favicon Generator',
    content: `<p>A favicon (short for "favorite icon") is the small 16x16 pixel icon that appears next to your website's title in a browser tab. While tiny, it's a critical piece of branding.</p>
    <h2>Keep It Simple</h2>
    <p>At 16x16 pixels, complex logos will turn into a blurry, unrecognizable mess. The best favicons are highly simplified versions of your logo. Use a single letter, a distinct shape, and high-contrast colors.</p>
    <ul>
      <li>Avoid using text (other than a single initial).</li>
      <li>Use the entire canvas; don't leave too much empty padding.</li>
      <li>Ensure it looks good on both light and dark mode browser themes.</li>
    </ul>`,
    content_post: `<h2>Modern Requirements</h2>
    <p>Today, you don't just need a 16x16 \`.ico\` file. You need high-resolution PNGs (192x192, 512x512) for Android home screens, and specific "apple-touch-icons" for iOS devices. A good generator will create all these assets for you automatically.</p>`
  },
  {
    folder: 'color-theory-for-web-designers',
    title: 'Color Theory for Web Designers',
    desc: 'A practical guide on how to build harmonious color palettes and extract dominant colors from imagery.',
    category: 'Design',
    mins: 6,
    image: 'color_palette_hero.png',
    tool_link: '../../color-palette-extractor/',
    cta_title: 'Extract Colors from Any Image',
    cta_desc: 'Upload a beautiful photo and instantly extract its dominant color palette.',
    cta_btn: 'Use Color Extractor',
    content: `<p>Color is arguably the most powerful tool in a web designer's arsenal. It dictates the mood of a website, guides user attention, and establishes brand identity.</p>
    <h2>The 60-30-10 Rule</h2>
    <p>A foolproof way to apply color to your UI is the 60-30-10 rule, borrowed from interior design:</p>
    <ul>
      <li><strong>60% Primary Color:</strong> Usually a neutral color for backgrounds.</li>
      <li><strong>30% Secondary Color:</strong> Used for cards, secondary buttons, or large text elements.</li>
      <li><strong>10% Accent Color:</strong> A vibrant, high-contrast color used exclusively for Call-to-Action (CTA) buttons and critical links.</li>
    </ul>`,
    content_post: `<h2>Finding Inspiration in Nature</h2>
    <p>Sometimes the best color palettes aren't generated by algorithms, but found in nature. Finding a beautiful photograph and extracting its dominant colors is a fantastic way to build a harmonious, organic palette for your next project.</p>`
  }
];

posts.forEach(post => {
  const dirPath = path.join(__dirname, 'blog', post.folder);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
  
  let html = template
    .replace(/{{TITLE}}/g, post.title)
    .replace(/{{DESC}}/g, post.desc)
    .replace(/{{CATEGORY}}/g, post.category)
    .replace(/{{MINS}}/g, post.mins)
    .replace(/{{IMAGE}}/g, post.image)
    .replace(/{{CONTENT}}/g, post.content)
    .replace(/{{CONTENT_POST}}/g, post.content_post)
    .replace(/{{TOOL_LINK}}/g, post.tool_link)
    .replace(/{{CTA_TITLE}}/g, post.cta_title)
    .replace(/{{CTA_DESC}}/g, post.cta_desc)
    .replace(/{{CTA_BTN}}/g, post.cta_btn);
    
  fs.writeFileSync(path.join(dirPath, 'index.html'), html, 'utf8');
  console.log('Created ' + post.folder);
});
