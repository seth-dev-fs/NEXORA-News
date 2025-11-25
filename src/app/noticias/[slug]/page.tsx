export const revalidate = 60;
import Image from 'next/image';
import { getArticleBySlug, getArticlesSortedByDate, getRelatedArticles } from '@/lib/markdown';
import { notFound } from 'next/navigation';
import { getCategoryDisplayName } from '@/lib/categories';
import ShareButtons from '@/components/ShareButtons';
import RelatedArticles from '@/components/RelatedArticles';

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
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Featured Image Header */}
      {article.image && (
        <div className="relative w-full mb-8 sm:mb-12">
          <div className="relative w-full h-[300px] sm:h-[400px] lg:h-[500px] overflow-hidden">
            <Image
              src={article.image}
              alt={article.title}
              fill
              style={{ objectFit: 'cover' }}
              sizes="100vw"
              priority
              className="brightness-95"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
          </div>

          {/* Unsplash Attribution */}
          {article.photographer_name && article.photographer_url && (
            <div className="container mx-auto px-4 sm:px-6 mt-2">
              <p className="text-xs sm:text-sm text-muted text-right">
                Photo by{' '}
                <a
                  href={article.photographer_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary-dark underline transition-colors"
                >
                  {article.photographer_name}
                </a>
                {' '}on{' '}
                <a
                  href="https://unsplash.com?utm_source=nexora_news&utm_medium=referral"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary-dark underline transition-colors"
                >
                  Unsplash
                </a>
              </p>
            </div>
          )}
        </div>
      )}

      {/* Article Content */}
      <article className="container mx-auto px-4 sm:px-6 pb-16 sm:pb-20">
        <div className={`max-w-4xl mx-auto ${!article.image ? 'pt-8 sm:pt-12' : '-mt-24 sm:-mt-32 relative z-10'}`}>
          {/* Article Header */}
          <header className={`${article.image ? 'bg-background/95 backdrop-blur-sm p-6 sm:p-8 lg:p-10 rounded-2xl shadow-2xl mb-8 sm:mb-12' : 'mb-8 sm:mb-12'}`}>
            {/* Category Badge */}
            {article.category && (
              <div className="mb-4 sm:mb-6">
                <span className="inline-block px-4 py-1.5 text-xs sm:text-sm font-bold uppercase tracking-wider bg-primary/10 text-primary rounded-full border border-primary/20">
                  {getCategoryDisplayName(article.category)}
                </span>
              </div>
            )}

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-extrabold text-foreground leading-tight mb-4 sm:mb-6">
              {article.title}
            </h1>

            {/* Description */}
            <p className="text-lg sm:text-xl lg:text-2xl text-muted leading-relaxed mb-6 sm:mb-8">
              {article.description}
            </p>

            {/* Metadata */}
            <div className="flex flex-wrap items-center gap-4 text-sm sm:text-base text-muted pt-6 border-t border-border">
              <time dateTime={article.date} className="flex items-center gap-2">
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>{new Date(article.date).toLocaleDateString('pt-PT', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              </time>
              <span className="w-1 h-1 rounded-full bg-muted" aria-hidden="true" />
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{article.readingTime} min de leitura</span>
              </span>
            </div>
          </header>

          {/* Article Body */}
          <div
            className="prose prose-lg sm:prose-xl max-w-none
              prose-headings:text-foreground prose-headings:font-extrabold prose-headings:tracking-tight
              prose-h2:text-2xl sm:prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6
              prose-h3:text-xl sm:prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-4
              prose-p:text-foreground prose-p:leading-relaxed prose-p:mb-6
              prose-a:text-primary prose-a:no-underline hover:prose-a:text-primary-dark prose-a:font-medium prose-a:transition-colors
              prose-strong:text-foreground prose-strong:font-bold
              prose-ul:my-6 prose-ul:list-disc prose-ul:pl-6
              prose-ol:my-6 prose-ol:list-decimal prose-ol:pl-6
              prose-li:text-foreground prose-li:mb-2
              prose-img:rounded-xl prose-img:shadow-lg prose-img:my-8
              prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-6 prose-blockquote:italic prose-blockquote:text-muted prose-blockquote:my-8
              prose-code:text-primary prose-code:bg-card prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:font-mono prose-code:text-sm
              prose-pre:bg-card prose-pre:border prose-pre:border-border prose-pre:rounded-lg prose-pre:p-4 prose-pre:my-6"
            dangerouslySetInnerHTML={{ __html: article.contentHtml }}
          />

          {/* Article Footer - Share & Back */}
          <footer className="mt-12 sm:mt-16 pt-8 sm:pt-12 border-t border-border">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              {/* Back to News Link */}
              <a
                href="/"
                className="inline-flex items-center gap-2 text-sm sm:text-base font-semibold text-primary hover:text-primary-dark transition-colors duration-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
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
          <RelatedArticles articles={relatedArticles} />
        </div>
      </article>
    </div>
  );
}