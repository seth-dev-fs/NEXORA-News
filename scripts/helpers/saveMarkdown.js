const fs = require('fs');
const path = require('path');

/**
 * Saves content to a Markdown file in the content/posts directory.
 * @param {string} slug - The slug for the filename (e.g., "my-first-post").
 * @param {string} content - The full string content to write to the file.
 */
function saveMarkdown(slug, content) {
  const postsDir = path.join(__dirname, '..', '..', 'content', 'posts');
  const filePath = path.join(postsDir, `${slug}.md`);

  // Ensure the directory exists
  if (!fs.existsSync(postsDir)) {
    fs.mkdirSync(postsDir, { recursive: true });
  }

  try {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Successfully saved Markdown file to: ${filePath}`);
  } catch (error) {
    console.error(`❌ Error saving file ${filePath}:`, error);
  }
}

module.exports = { saveMarkdown };
