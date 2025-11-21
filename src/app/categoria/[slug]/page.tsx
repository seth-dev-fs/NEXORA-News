import ArticleCard from '@/components/ArticleCard';
import { getArticlesByCategory, getSortedArticlesData } from '@/lib/markdown';

export async function generateStaticParams() {
  const allPosts = getSortedArticlesData();
  const allCategories = new Set<string>();
  
  allPosts.forEach(post => {
    if (post.category) {
      allCategories.add(post.category.toLowerCase().replace(/ & /g, '-').replace(/\s+/g, '-'));
    }
  });

  return Array.from(allCategories).map(slug => ({
    slug: slug,
  }));
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const categorySlug = params.slug;
  const categoryName = categorySlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  return {
    title: `${categoryName} - NEXORA News`,
    description: `Últimas notícias e artigos sobre ${categoryName} em Portugal.`,
  };
}

export default async function CategoriaPage({ params }: { params: { slug: string } }) {
  const categorySlug = params.slug;
  const articles = getArticlesByCategory(categorySlug);
  const categoryName = categorySlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-foreground mb-8">{categoryName}</h1>

      {articles.length === 0 ? (
        <div className="text-center text-muted col-span-full py-12">
          <p>De momento não existem artigos nesta categoria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* FINAL CORRECTED VERSION: Pass the whole 'article' object as a single prop */}
          {articles.map((article) => (
            <ArticleCard key={article.slug} article={article} />
          ))}
        </div>
      )}
    </div>
  );
}