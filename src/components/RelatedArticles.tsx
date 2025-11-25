import ArticleCard from './ArticleCard';
import { ArticleMeta } from '@/lib/markdown';

interface RelatedArticlesProps {
  articles: ArticleMeta[];
  className?: string;
}

export default function RelatedArticles({ articles, className = '' }: RelatedArticlesProps) {
  if (!articles || articles.length === 0) {
    return null;
  }

  return (
    <aside
      className={`mt-16 sm:mt-20 pt-12 sm:pt-16 border-t border-border ${className}`}
      aria-labelledby="related-articles-heading"
    >
      <div className="max-w-4xl mx-auto">
        <h2
          id="related-articles-heading"
          className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-foreground mb-8 sm:mb-10"
        >
          Artigos Relacionados
        </h2>
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
          role="list"
        >
          {articles.map((article) => (
            <div key={article.slug} role="listitem">
              <ArticleCard article={article} />
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
