import Image from 'next/image';
import Link from 'next/link';
import { ArticleMeta } from '@/lib/markdown';
import { getCategoryDisplayName } from '@/lib/categories';

export default function ArticleCard({ article }: { article: ArticleMeta }) {
  if (!article) return null;

  const categoryDisplayName = getCategoryDisplayName(article.category);

  return (
    <article>
      <Link
        href={`/noticias/${article.slug}`}
        className="block bg-card rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden group focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
      >
        {/* Image Container with Placeholder */}
        <div className="relative w-full h-52 sm:h-56 overflow-hidden bg-gradient-to-br from-primary/5 via-card to-primary/10">
          {article.image ? (
            <Image
              src={article.image}
              alt={article.title}
              fill
              style={{ objectFit: 'cover' }}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              loading="lazy"
              className="transition-all duration-500 group-hover:scale-110 group-hover:brightness-110"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <svg
                className="w-16 h-16 text-primary/20"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}

          {/* Category Badge Overlay */}
          {article.category && (
            <div className="absolute top-3 left-3 z-10">
              <span className="inline-block px-3 py-1 text-xs font-bold uppercase tracking-wide bg-primary text-white rounded-full shadow-lg">
                {categoryDisplayName}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6">
          {/* Title */}
          <h3 className="text-lg sm:text-xl font-extrabold text-foreground leading-snug mb-3 group-hover:text-primary transition-colors duration-200 line-clamp-2 min-h-[3.5rem]">
            {article.title}
          </h3>

          {/* Description */}
          <p className="text-sm sm:text-base text-muted leading-relaxed mb-4 line-clamp-2 min-h-[2.5rem]">
            {article.description}
          </p>

          {/* Metadata Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <div className="flex items-center gap-3 text-xs sm:text-sm text-muted">
              <time dateTime={article.date} className="flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>
                  {new Date(article.date).toLocaleDateString('pt-PT', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </span>
              </time>
              <span className="flex items-center gap-1.5" aria-label={`${article.readingTime} minutos de leitura`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{article.readingTime} min</span>
              </span>
            </div>

            {/* Read More Indicator */}
            <span className="text-xs sm:text-sm font-semibold text-primary group-hover:text-primary-dark transition-colors duration-200 flex items-center gap-1">
              Ler mais
              <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
