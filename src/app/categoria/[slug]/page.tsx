import ArticleCard from '@/components/ArticleCard';
import { getSortedArticlesData, ArticleData } from '@/lib/markdown';

export async function generateStaticParams() {
  const categories = [
    'smartphones', 
    'wearables', 
    'audio', 
    'computadores', 
    'internet-apps', 
    'mobilidade', 
    'ciencia', 
    'entretenimento-gaming', 
    'ai-futuro'
  ];
  return categories.map((category) => ({
    slug: category,
  }));
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const categoryName = params.slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  return {
    title: `${categoryName} - NEXORA News`,
    description: `Últimas notícias e artigos sobre ${categoryName} em Portugal.`,
  };
}

export default async function CategoriaPage({ params }: { params: { slug: string } }) {
  const allArticlesData = await getSortedArticlesData();
  const categorySlug = params.slug;

  const categoryArticles = allArticlesData.filter(article => 
    article.category.toLowerCase().replace(/\s+/g, '-') === categorySlug
  );

  const categoryName = categorySlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-foreground mb-8">{categoryName}</h1>

      {categoryArticles.length === 0 ? (
        <div className="text-center text-muted">
          <p>De momento não existem artigos nesta categoria.</p>
          <p>Por favor, volte mais tarde.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categoryArticles.map((article) => (
            <ArticleCard key={article.slug} {...article} />
          ))}
        </div>
      )}
    </div>
  );
}
