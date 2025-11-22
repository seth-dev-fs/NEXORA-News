export const revalidate = 60;
import ArticleCard from '@/components/ArticleCard';
import { getArticlesByCategory, getArticlesSortedByDate, getAllArticles } from '@/lib/markdown';
import { getCategoryDisplayName } from '@/lib/categories';

export async function generateStaticParams() {
  const allPosts = getAllArticles(); // Use getAllArticles to get all posts including drafts for category generation
  const allCategories = new Set<string>();

  allPosts.forEach(post => {
    if (post.category) {
      allCategories.add(post.category); // Category is already normalized in getAllArticles
    }
  });

  return Array.from(allCategories).map(slug => ({
    slug: slug,
  }));
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const categorySlug = params.slug;
  const categoryName = getCategoryDisplayName(categorySlug);
  return {
    title: `${categoryName} - NEXORA News`,
    description: `Últimas notícias e artigos sobre ${categoryName} em Portugal.`,
  };
}

export default async function CategoriaPage({ params }: { params: { slug: string } }) {
  const categorySlug = params.slug;
  const articles = getArticlesByCategory(categorySlug);
  const categoryName = getCategoryDisplayName(categorySlug);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-foreground mb-8">{categoryName}</h1>

            {articles.length === 0 ? (
              <div className="text-center text-muted col-span-full py-12">
                <p className="text-lg mb-4">De momento não existem artigos nesta categoria.</p>
                <h2 className="text-2xl font-bold text-foreground mb-4">Talvez você se interesse por:</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-4xl mx-auto">
                  {getArticlesSortedByDate(5).map((article) => (
                    <ArticleCard key={article.slug} article={article} />
                  ))}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {articles.map((article) => (
                  <ArticleCard key={article.slug} article={article} />
                ))}
              </div>
            )}    </div>
  );
}