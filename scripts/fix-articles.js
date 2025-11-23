const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const postsDir = path.join(__dirname, '../content/posts');

// Placeholder image for tech articles
const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1080&q=80';

// Articles that need complete frontmatter reconstruction
const criticalArticles = [
  'administracao-trump-podera-recuar-na-luta-contra-regulacoes-estaduais-de-ia.md',
  'casio-lanca-relogio-dourado-mtpb145gc-9av-nos-eua-unindo-retro-e-minimalismo.md',
  'desconto-exclusivo-casio-gravitymaster-gr-b300-para-pilotos-com-tematica-de-cockpit-noturno-a-180-dolares.md',
  'leilao-de-banda-c-da-fcc-operadoras-dos-eua-preparam-se-para-a-proxima-ronda-crucial-de-espectro-5g.md',
  'the-age-of-disclosure-nexora-news-explora-como-ver-online-o-documentario-que-questiona-80-anos-de-visitas-extraterrestres.md',
  'waymo-obtem-aprovacao-regulatoria-para-expansao-abrangente-na-california.md'
];

function fixArticle(filename) {
  const filePath = path.join(postsDir, filename);
  const content = fs.readFileSync(filePath, 'utf8');
  const { data, content: body } = matter(content);

  let modified = false;

  // Fix missing image
  if (!data.image) {
    data.image = PLACEHOLDER_IMAGE;
    modified = true;
  }

  // Fix missing draft field
  if (data.draft === undefined) {
    data.draft = false; // Set to false since these are older articles
    modified = true;
  }

  // For critical articles with missing data, extract from filename
  if (criticalArticles.includes(filename)) {
    if (!data.title) {
      // Title already exists in the HTML comment, we need to handle this differently
      // These articles actually HAVE titles, just checking wrong
      console.log(`Critical article ${filename} - title exists: ${data.title}`);
    }

    if (!data.date) {
      data.date = '2025-11-22T10:00:00.000Z';
      modified = true;
    }

    if (!data.category) {
      // Infer category from content
      if (filename.includes('ia') || filename.includes('ai')) {
        data.category = 'inteligencia-artificial';
      } else if (filename.includes('casio')) {
        data.category = 'wearables';
      } else if (filename.includes('disclosure') || filename.includes('extraterrestres')) {
        data.category = 'ciencia';
      } else if (filename.includes('waymo')) {
        data.category = 'automoveis';
      } else {
        data.category = 'tecnologia';
      }
      modified = true;
    }

    if (!data.description) {
      // Extract first paragraph or create from title
      const firstParagraph = body.split('\n\n').find(p => p.trim() && !p.startsWith('#'));
      if (firstParagraph) {
        data.description = firstParagraph.substring(0, 155).trim() + '...';
      } else if (data.title) {
        data.description = data.title;
      }
      modified = true;
    }

    if (!data.source_url) {
      data.source_url = 'https://nexora-news.vercel.app';
      modified = true;
    }
  }

  if (modified) {
    const newContent = matter.stringify(body, data);
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`Fixed: ${filename}`);
    return true;
  }

  return false;
}

// Process all markdown files
const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.md'));
let fixedCount = 0;

files.forEach(file => {
  if (fixArticle(file)) {
    fixedCount++;
  }
});

console.log(`\nTotal articles fixed: ${fixedCount} out of ${files.length}`);
