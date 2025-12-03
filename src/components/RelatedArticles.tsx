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
      className={`mt-16 sm:mt-20 pt-12 sm:pt-16 border-t-2 border-border/30 ${className}`}
      aria-labelledby="related-articles-heading"
    >
      <div className="max-w-4xl mx-auto">
        {/* Enhanced Section Header */}
        <div className="flex items-center gap-3 mb-10 sm:mb-12">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-primary to-primary-dark rounded-2xl flex items-center justify-center shadow-elevation-2">
              <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div>
              <h2
                id="related-articles-heading"
                className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-foreground tracking-tight"
              >
                Leia Também
              </h2>
              <p className="text-sm sm:text-base text-muted">
                Artigos relacionados que podem interessar
              </p>
            </div>
          </div>
        </div>

        {/* Articles Grid with Staggered Animation */}
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10"
          role="list"
        >
          {articles.map((article, index) => (
            <div
              key={article.slug}
              role="listitem"
              className="animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'both' }}
            >
              <ArticleCard article={article} />
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
