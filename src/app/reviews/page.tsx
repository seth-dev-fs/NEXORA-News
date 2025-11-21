import ArticleCard from '@/components/ArticleCard';
import { getSortedArticlesData } from '@/lib/markdown'; // Import the utility function

export default async function ReviewsPage() {
  const allArticlesData = await getSortedArticlesData();
  const reviewArticles = allArticlesData.filter(article => article.category === 'Reviews');

  if (reviewArticles.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 text-center text-foreground">
        <h1 className="text-3xl font-bold mb-4">No review articles found.</h1>
        <p>Please generate some articles with the category "Reviews" using the `scripts/generate-articles.js` script.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-foreground mb-8">Reviews</h1>

      {/* Article List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {reviewArticles.map((article) => (
          <ArticleCard key={article.slug} {...article} />
        ))}
      </div>
    </div>
  );
}
