const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const postsDir = path.join(__dirname, '../content/posts');
const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.md'));

const issues = {
  missingTitle: [],
  emptyTitle: [],
  missingImage: [],
  invalidImage: [],
  missingDate: [],
  missingCategory: [],
  missingDescription: [],
  missingSourceUrl: [],
  missingDraft: [],
  malformedFrontmatter: []
};

files.forEach(file => {
  const filePath = path.join(postsDir, file);
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const { data, content: body } = matter(content);

    // Check title
    if (!data.title) {
      issues.missingTitle.push(file);
    } else if (data.title.trim() === '') {
      issues.emptyTitle.push(file);
    }

    // Check image
    if (!data.image) {
      issues.missingImage.push(file);
    } else if (typeof data.image !== 'string' || !data.image.startsWith('http')) {
      issues.invalidImage.push(file);
    }

    // Check other required fields
    if (!data.date) issues.missingDate.push(file);
    if (!data.category) issues.missingCategory.push(file);
    if (!data.description) issues.missingDescription.push(file);
    if (!data.source_url) issues.missingSourceUrl.push(file);
    if (data.draft === undefined) issues.missingDraft.push(file);

  } catch (error) {
    issues.malformedFrontmatter.push({ file, error: error.message });
  }
});

console.log(JSON.stringify(issues, null, 2));
