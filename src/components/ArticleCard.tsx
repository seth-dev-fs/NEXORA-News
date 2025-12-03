import Image from 'next/image';
import Link from 'next/link';
import { ArticleMeta, getArticleFreshness } from '@/lib/markdown';
import { getCategoryDisplayName } from '@/lib/categories';
import TimeAgo from './TimeAgo';

export default function ArticleCard({ article }: { article: ArticleMeta }) {
  if (!article) return null;

  const categoryDisplayName = getCategoryDisplayName(article.category);
  const freshness = getArticleFreshness(article.date);

  // Determine which badge to show (priority: new > recent)
  const showNewBadge = freshness === 'new';
  const showRecentBadge = freshness === 'recent' && !showNewBadge;

  return (
    <article className="group/card h-full">
      <Link
        href={`/noticias/${article.slug}`}
        className="
          flex flex-col h-full
          bg-card rounded-2xl overflow-hidden
          shadow-elevation-1 hover:shadow-elevation-3
          transform hover:-translate-y-1
          transition-all duration-300 ease-smooth
          focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background
        "
      >
        {/* Image Container with Premium Effects */}
        <div className="relative w-full aspect-[16/9] overflow-hidden bg-gradient-to-br from-primary/5 via-card to-primary/10">
          {article.image ? (
            <>
              {/* Use regular img tag for local SVGs, Next Image for everything else */}
              {article.image.startsWith('/') && article.image.endsWith('.svg') ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={article.image}
                  alt={article.title}
                  className="
                    absolute inset-0 w-full h-full object-cover
                    transition-all duration-500 ease-smooth
                    group-hover/card:scale-105
                    brightness-95 group-hover/card:brightness-100
                  "
                />
              ) : (
                <Image
                  src={article.image}
                  alt={article.title}
                  fill
                  style={{ objectFit: 'cover' }}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  loading="lazy"
                  className="
                    transition-all duration-500 ease-smooth
                    group-hover/card:scale-105
                    brightness-95 group-hover/card:brightness-100
                  "
                />
              )}
              {/* Gradient Overlay for better text contrast on badge */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/10 opacity-60 group-hover/card:opacity-40 transition-opacity duration-300" />
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/10 via-primary/5 to-transparent">
              <svg
                className="w-16 h-16 text-primary/20 animate-float"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}

          {/* Category Badge with Premium Styling */}
          {article.category && (
            <div className="absolute top-4 left-4 z-10">
              <span className="
                inline-flex items-center gap-1.5
                px-3 py-1.5
                text-xs font-bold uppercase tracking-wide
                bg-primary text-white
                rounded-full shadow-elevation-2
                backdrop-blur-sm
                transform group-hover/card:scale-105
                transition-transform duration-250 ease-bounce-soft
              ">
                {categoryDisplayName}
              </span>
            </div>
          )}

          {/* NEW/RECENT Badge (Top Right, above reading time) */}
          {(showNewBadge || showRecentBadge) && (
            <div className="absolute top-4 right-4 z-10">
              <span className={`
                inline-flex items-center gap-1.5
                px-3 py-1.5
                text-xs font-extrabold uppercase tracking-wide
                rounded-full shadow-elevation-2
                backdrop-blur-sm
                transform group-hover/card:scale-105
                transition-all duration-250 ease-bounce-soft
                ${showNewBadge
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white animate-pulse-soft'
                  : 'bg-gradient-to-r from-orange-500 to-amber-600 text-white'
                }
              `}>
                {showNewBadge ? (
                  <>
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    Novo
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                      <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                    </svg>
                    Hot
                  </>
                )}
              </span>
            </div>
          )}

          {/* Reading Time Badge (Top Right, below NEW/HOT badge if present) */}
          <div className={`absolute right-4 z-10 ${showNewBadge || showRecentBadge ? 'top-16' : 'top-4'}`}>
            <div className="
              flex items-center gap-1.5
              px-2.5 py-1
              bg-background/90 backdrop-blur-md
              rounded-full shadow-soft
              text-xs font-semibold text-foreground
              opacity-0 group-hover/card:opacity-100
              transform translate-y-2 group-hover/card:translate-y-0
              transition-all duration-300 ease-smooth
            ">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{article.readingTime} min</span>
            </div>
          </div>
        </div>

        {/* Content Section with Enhanced Spacing */}
        <div className="flex flex-col flex-1 p-6 sm:p-7">
          {/* Title with Premium Typography */}
          <h3 className="
            text-xl sm:text-2xl font-extrabold text-foreground
            leading-tight tracking-tight
            mb-3
            line-clamp-2
            min-h-[3.5rem]
            group-hover/card:text-primary
            transition-colors duration-250 ease-smooth
          ">
            {article.title}
          </h3>

          {/* Description with Better Readability */}
          <p className="
            text-sm sm:text-base text-muted
            leading-relaxed-plus
            mb-5
            line-clamp-2
            min-h-[3rem]
            flex-1
          ">
            {article.description}
          </p>

          {/* Metadata Footer with Enhanced Design */}
          <div className="flex items-center justify-between pt-5 border-t border-border/50">
            {/* Date Display with TimeAgo */}
            <div className="flex items-center gap-2 text-xs sm:text-sm text-muted font-medium">
              <svg className="w-4 h-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <TimeAgo date={article.date} />
            </div>

            {/* Read More CTA with Micro-interaction */}
            <span className="
              flex items-center gap-1.5
              text-sm font-bold text-primary
              group-hover/card:text-primary-dark group-hover/card:gap-2.5
              transition-all duration-250 ease-smooth
            ">
              Ler mais
              <svg
                className="
                  w-4 h-4
                  transform group-hover/card:translate-x-1
                  transition-transform duration-250 ease-smooth
                "
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
              </svg>
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
