export const revalidate = 60;
import Image from 'next/image';
import { getArticleBySlug, getArticlesSortedByDate } from '@/lib/markdown';
import { notFound } from 'next/navigation';
import { getCategoryDisplayName } from '@/lib/categories';

export async function generateStaticParams() {
  // Use getArticlesSortedByDate which returns published articles
  const articles = getArticlesSortedByDate(); 
  return articles.map((article) => ({
    slug: article.slug,
  }));
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const article = getArticleBySlug(params.slug);

  if (!article) {
    return { title: 'Artigo Não Encontrado' };
  }

  return {
    title: article.title,
    description: article.description,
  };
}

export default async function ArticlePage({ params }: { params: { slug: string } }) {
  const article = getArticleBySlug(params.slug);

  if (!article || article.draft) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Featured Image Header */}
      {article.image && (
        <div className="relative w-full h-[300px] sm:h-[400px] lg:h-[500px] overflow-hidden mb-8 sm:mb-12">
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
                <span>5 min de leitura</span>
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
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted font-medium">Partilhar:</span>
                <div className="flex gap-2">
                  <button
                    aria-label="Partilhar no Twitter"
                    className="p-2 rounded-full bg-card hover:bg-primary/10 text-muted hover:text-primary transition-colors duration-200"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                    </svg>
                  </button>
                  <button
                    aria-label="Partilhar no Facebook"
                    className="p-2 rounded-full bg-card hover:bg-primary/10 text-muted hover:text-primary transition-colors duration-200"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                    </svg>
                  </button>
                  <button
                    aria-label="Copiar link"
                    className="p-2 rounded-full bg-card hover:bg-primary/10 text-muted hover:text-primary transition-colors duration-200"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </article>
    </div>
  );
}