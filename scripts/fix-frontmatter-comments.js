const fs = require('fs');
const path = require('path');

const postsDir = path.join(__dirname, '../content/posts');

function fixArticleFrontmatter(filename) {
  const filePath = path.join(postsDir, filename);
  let content = fs.readFileSync(filePath, 'utf8');

  // Check if file starts with HTML comment before frontmatter
  if (content.trim().startsWith('<!--')) {
    console.log(`Fixing HTML comment issue in: ${filename}`);

    // Find the end of the HTML comment
    const commentEnd = content.indexOf('-->');
    if (commentEnd !== -1) {
      // Extract the comment
      const comment = content.substring(0, commentEnd + 3);
      // Remove the comment from the beginning
      content = content.substring(commentEnd + 3).trim();

      // Now the frontmatter should be at the start
      // Add the comment after the frontmatter instead
      const frontmatterEnd = content.indexOf('---', 3); // Find second ---
      if (frontmatterEnd !== -1) {
        const nextLineBreak = content.indexOf('\n', frontmatterEnd + 3);
        if (nextLineBreak !== -1) {
          // Insert comment after frontmatter
          const before = content.substring(0, nextLineBreak + 1);
          const after = content.substring(nextLineBreak + 1);
          content = before + '\n' + comment + '\n\n' + after;

          fs.writeFileSync(filePath, content, 'utf8');
          return true;
        }
      }
    }
  }

  return false;
}

// Process all markdown files
const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.md'));
let fixedCount = 0;

files.forEach(file => {
  if (fixArticleFrontmatter(file)) {
    fixedCount++;
  }
});

console.log(`\nTotal articles with frontmatter fixed: ${fixedCount} out of ${files.length}`);
