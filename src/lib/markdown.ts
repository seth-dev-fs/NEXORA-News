import fs from 'fs';
import path from 'path';
import matter from 'front-matter';
import { remark } from 'remark';
import html from 'remark-html';

const postsDirectory = path.join(process.cwd(), 'content', 'posts');

export interface ArticleData {
  slug: string;
  title: string;
  description: string;
  category: string;
  date: string;
  imageUrl: string;
  contentHtml: string;
}

export async function getSortedArticlesData(): Promise<ArticleData[]> {
  const fileNames = fs.readdirSync(postsDirectory);
  const allArticlesData = await Promise.all(
    fileNames.map(async (fileName) => {
      const slug = fileName.replace(/\.md$/, '');
      const fullPath = path.join(postsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');

      const { data, content } = matter(fileContents);

      const processedContent = await remark().use(html).process(content);
      const contentHtml = processedContent.toString();

      return {
        slug,
        contentHtml,
        ...(data as { title: string; description: string; category: string; date: string; imageUrl: string }),
      };
    })
  );

  return allArticlesData.sort((a, b) => {
    if (a.date < b.date) {
      return 1;
    } else {
      return -1;
    }
  });
}

export async function getArticleData(slug: string): Promise<ArticleData> {
  const fullPath = path.join(postsDirectory, `${slug}.md`);
  const fileContents = fs.readFileSync(fullPath, 'utf8');

  const { data, content } = matter(fileContents);

  const processedContent = await remark().use(html).process(content);
  const contentHtml = processedContent.toString();

  return {
    slug,
    contentHtml,
    ...(data as { title: string; description: string; category: string; date: string; imageUrl: string }),
  };
}
