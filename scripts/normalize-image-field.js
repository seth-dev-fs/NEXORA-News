const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const postsDir = path.join(__dirname, '../content/posts');

function normalizeImageField(filename) {
  const filePath = path.join(postsDir, filename);
  const content = fs.readFileSync(filePath, 'utf8');
  const { data, content: body } = matter(content);

  let modified = false;

  // If article has featured_image, use it for image and remove featured_image
  if (data.featured_image) {
    // Prefer featured_image over placeholder image
    if (data.image === 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1080&q=80') {
      data.image = data.featured_image;
      delete data.featured_image;
      modified = true;
    } else if (!data.image) {
      data.image = data.featured_image;
      delete data.featured_image;
      modified = true;
    } else {
      // Both exist - keep image, remove featured_image
      delete data.featured_image;
      modified = true;
    }
  }

  if (modified) {
    const newContent = matter.stringify(body, data);
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`Normalized image field: ${filename}`);
    return true;
  }

  return false;
}

// Process all markdown files
const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.md'));
let fixedCount = 0;

files.forEach(file => {
  if (normalizeImageField(file)) {
    fixedCount++;
  }
});

console.log(`\nTotal articles with image field normalized: ${fixedCount} out of ${files.length}`);
