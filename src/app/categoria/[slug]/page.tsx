import ArticleCard from '@/components/ArticleCard';
import { getArticlesByCategory, getSortedArticlesData } from '@/lib/markdown';

// Generate static pages for all known categories to improve performance
export async function generateStaticParams() {
  // Get all posts and extract unique categories
  const allPosts = getSortedArticlesData();
  const allCategories = new Set<string>();
  allPosts.forEach(post => {
    post.categories.forEach(cat => allCategories.add(cat.toLowerCase()));
  });

  return Array.from(allCategories).map(category => ({
    slug: category,
  }));
}

// Generate metadata for the page
export async function generateMetadata({ params }: { params: { slug: string } }) {
  const categorySlug = params.slug;
  const categoryName = categorySlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  return {
    title: `${categoryName} - NEXORA News`,
    description: `Últimas notícias e artigos sobre ${categoryName} em Portugal.`,
  };
}

// The page component
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
          {articles.map((article) => (
            // Ensure ArticleCard can handle the ArticleMeta props
            <ArticleCard 
              key={article.slug} 
              slug={article.slug}
              imageUrl={article.featured_image}
              title={article.title}
              description={article.meta_description}
              category={article.categories[0] || ''}
              date={article.date}
            />
          ))}
        </div>
      )}
    </div>
  );
}