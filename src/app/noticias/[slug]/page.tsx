export const revalidate = 60;
import Image from 'next/image';
import { getArticleBySlug, getArticlesSortedByDate, getRelatedArticles } from '@/lib/markdown';
import { notFound } from 'next/navigation';
import { getCategoryDisplayName } from '@/lib/categories';
import ShareButtons from '@/components/ShareButtons';
import RelatedArticles from '@/components/RelatedArticles';
import ReadingProgress from '@/components/ReadingProgress';
import ArticleViewTracker from '@/components/ArticleViewTracker';
import TimeAgo from '@/components/TimeAgo';

export async function generateStaticParams() {
  // Use getArticlesSortedByDate which returns published articles
  const articles = getArticlesSortedByDate(); 
  return articles.map((article) => ({
    slug: article.slug,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) {
    return {
      title: 'Artigo Não Encontrado',
      description: 'O artigo que procura não foi encontrado.',
    };
  }

  const canonicalUrl = `https://nexora-news.com/noticias/${article.slug}`;

  return {
    title: article.title,
    description: article.description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type: 'article',
      locale: 'pt_PT',
      url: canonicalUrl,
      siteName: 'NEXORA News',
      title: article.title,
      description: article.description,
      images: article.image ? [
        {
          url: article.image,
          width: 1200,
          height: 630,
          alt: article.title,
        },
      ] : [],
      publishedTime: article.date,
      authors: ['Equipa NEXORA News'],
    },
    twitter: {
      card: 'summary_large_image',
      site: '@nexoranews',
      creator: '@nexoranews',
      title: article.title,
      description: article.description,
      images: article.image ? [article.image] : [],
    },
    keywords: [
      article.category,
      ...article.tags,
      'tecnologia',
      'Portugal',
      'notícias tech',
    ],
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article || article.draft) {
    notFound();
  }

  // Get related articles
  const relatedArticles = getRelatedArticles(slug, 3);

  // JSON-LD Structured Data for SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: article.title,
    description: article.description,
    image: article.image || 'https://nexora-news.com/og-image.jpg',
    datePublished: article.date,
    dateModified: article.date,
    author: {
      '@type': 'Organization',
      name: 'NEXORA News',
      url: 'https://nexora-news.com',
    },
    publisher: {
      '@type': 'Organization',
      name: 'NEXORA News',
      logo: {
        '@type': 'ImageObject',
        url: 'https://nexora-news.com/logo.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://nexora-news.com/noticias/${article.slug}`,
    },
    articleSection: getCategoryDisplayName(article.category),
    keywords: article.tags.join(', '),
    inLanguage: 'pt-PT',
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Reading Progress Bar */}
      <ReadingProgress />

      {/* Article View Tracker */}
      <ArticleViewTracker slug={slug} />

      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Premium Hero Image Header - Fullscreen with Overlay Title */}
      {article.image && (
        <div className="relative w-full mb-12 sm:mb-16 lg:mb-20">
          {/* Image Container */}
          <div className="relative w-full h-[400px] sm:h-[500px] lg:h-[600px] overflow-hidden">
            <Image
              src={article.image}
              alt={article.title}
              fill
              style={{ objectFit: 'cover' }}
              sizes="100vw"
              priority
              className="brightness-[0.85] dark:brightness-75"
            />
            {/* Premium Multi-layer Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-background/40 via-transparent to-transparent" />
          </div>

          {/* Unsplash Attribution - Subtle Positioning */}
          {article.photographer_name && article.photographer_url && (
            <div className="absolute top-4 right-4 z-20">
              <div className="px-3 py-1.5 bg-black/40 backdrop-blur-md rounded-lg">
                <p className="text-xs text-white/90">
                  <a
                    href={article.photographer_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white underline transition-colors"
                  >
                    {article.photographer_name}
                  </a>
                  {' / '}
                  <a
                    href="https://unsplash.com?utm_source=nexora_news&utm_medium=referral"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white underline transition-colors"
                  >
                    Unsplash
                  </a>
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Article Content - Premium Reading Experience */}
      <article className="container mx-auto px-4 sm:px-6 pb-20 sm:pb-24 lg:pb-28">
        <div className={`max-w-4xl mx-auto ${!article.image ? 'pt-12 sm:pt-16 lg:pt-20' : '-mt-32 sm:-mt-40 lg:-mt-48 relative z-10'}`}>
          {/* Article Header - Premium Card Design */}
          <header className={`
            ${article.image ? 'bg-background/98 dark:bg-background/95 backdrop-blur-xl p-8 sm:p-10 lg:p-12 rounded-3xl shadow-elevation-4 mb-12 sm:mb-16' : 'mb-12 sm:mb-16'}
            animate-fade-in-up
          `}>
            {/* Category Badge */}
            {article.category && (
              <div className="mb-5 sm:mb-6 animate-fade-in">
                <span className="
                  inline-flex items-center gap-2
                  px-4 py-2
                  text-xs sm:text-sm font-bold uppercase tracking-wider
                  bg-primary/10 text-primary
                  rounded-full border-2 border-primary/20
                  hover:bg-primary/20 hover:border-primary/30
                  transition-all duration-250 ease-smooth
                ">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path d="M2 6a2 2 0 012-2h12a2 2 0 012 2v2a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                  {getCategoryDisplayName(article.category)}
                </span>
              </div>
            )}

            {/* Title - Premium Typography */}
            <h1 className="
              text-4xl sm:text-5xl lg:text-6xl xl:text-7xl
              font-extrabold text-foreground
              leading-[1.1] tracking-tighter
              mb-6 sm:mb-8
              animate-fade-in
            ">
              {article.title}
            </h1>

            {/* Description - Enhanced Readability */}
            <p className="
              text-xl sm:text-2xl lg:text-3xl
              text-muted
              leading-relaxed-plus
              mb-8 sm:mb-10
              animate-fade-in
            ">
              {article.description}
            </p>

            {/* Metadata - Premium Design */}
            <div className="
              flex flex-wrap items-center gap-4 sm:gap-6
              text-sm sm:text-base text-muted font-medium
              pt-6 sm:pt-8
              border-t-2 border-border/30
              animate-fade-in
            ">
              <div className="flex items-center gap-2.5">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <TimeAgo date={article.date} />
              </div>
              <span className="w-1.5 h-1.5 rounded-full bg-primary/40" aria-hidden="true" />
              <span className="flex items-center gap-2.5">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{article.readingTime} min de leitura</span>
              </span>
            </div>
          </header>

          {/* Article Body - Optimized Reading Experience */}
          <div
            className="
              prose prose-lg sm:prose-xl lg:prose-2xl max-w-none
              animate-fade-in

              prose-headings:text-foreground prose-headings:font-extrabold prose-headings:tracking-tight
              prose-h2:text-3xl sm:prose-h2:text-4xl prose-h2:mt-16 prose-h2:mb-6 prose-h2:scroll-mt-20
              prose-h3:text-2xl sm:prose-h3:text-3xl prose-h3:mt-12 prose-h3:mb-5 prose-h3:scroll-mt-20

              prose-p:text-foreground prose-p:leading-loose-plus prose-p:mb-7 prose-p:text-[1.125rem] sm:prose-p:text-[1.25rem]
              prose-p:max-w-[65ch]

              prose-a:text-primary prose-a:underline prose-a:decoration-2 prose-a:underline-offset-4
              hover:prose-a:text-primary-dark hover:prose-a:decoration-primary-dark
              prose-a:font-semibold prose-a:transition-all prose-a:duration-250

              prose-strong:text-foreground prose-strong:font-extrabold

              prose-ul:my-8 prose-ul:list-disc prose-ul:pl-6 prose-ul:space-y-3
              prose-ol:my-8 prose-ol:list-decimal prose-ol:pl-6 prose-ol:space-y-3
              prose-li:text-foreground prose-li:leading-loose-plus

              prose-img:rounded-2xl prose-img:shadow-elevation-3 prose-img:my-10 prose-img:w-full

              prose-blockquote:border-l-[6px] prose-blockquote:border-primary
              prose-blockquote:pl-8 prose-blockquote:py-4
              prose-blockquote:italic prose-blockquote:text-muted prose-blockquote:text-xl
              prose-blockquote:my-10 prose-blockquote:bg-card/50 prose-blockquote:rounded-r-lg

              prose-code:text-primary prose-code:bg-card prose-code:px-2 prose-code:py-1
              prose-code:rounded-md prose-code:font-mono prose-code:text-sm prose-code:font-semibold
              prose-code:border prose-code:border-border/50

              prose-pre:bg-card prose-pre:border-2 prose-pre:border-border
              prose-pre:rounded-xl prose-pre:p-6 prose-pre:my-8
              prose-pre:shadow-soft-lg prose-pre:overflow-x-auto
            "
            dangerouslySetInnerHTML={{ __html: article.contentHtml }}
          />

          {/* Article Footer - Enhanced Design */}
          <footer className="mt-16 sm:mt-20 pt-10 sm:pt-12 border-t-2 border-border/30 animate-fade-in">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 sm:gap-8">
              {/* Back to News Link */}
              <a
                href="/"
                className="
                  inline-flex items-center gap-2.5
                  px-6 py-3
                  text-sm sm:text-base font-bold text-primary
                  hover:text-primary-dark hover:gap-3.5
                  bg-primary/5 hover:bg-primary/10
                  rounded-full
                  transition-all duration-250 ease-smooth
                  group
                "
              >
                <svg className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform duration-250" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Voltar às Notícias
              </a>

              {/* Share Buttons */}
              <ShareButtons
                title={article.title}
                url={`https://nexora-news.com/noticias/${article.slug}`}
                description={article.description}
              />
            </div>
          </footer>

          {/* Related Articles */}
          <div className="mt-16 sm:mt-20">
            <RelatedArticles articles={relatedArticles} />
          </div>
        </div>
      </article>
    </div>
  );
}