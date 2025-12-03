export const revalidate = 60;
import Image from 'next/image';
import Link from 'next/link';
import ArticleCard from '@/components/ArticleCard';
import NewsletterSignup from '@/components/NewsletterSignup';
import { getArticlesSortedByDate, getRecentArticles } from '@/lib/markdown';
import { getCategoryDisplayName } from '@/lib/categories';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'NEXORA News - As Últimas Notícias de Tecnologia em Português',
  description: 'Fique por dentro das últimas notícias de tecnologia, inovação e tendências digitais. Conteúdo automatizado de qualidade em português para entusiastas de tech.',
  keywords: ['tecnologia', 'notícias tech', 'inovação', 'Portugal', 'smartphones', 'IA', 'software'],
  openGraph: {
    type: 'website',
    locale: 'pt_PT',
    url: 'https://nexora-news.com',
    siteName: 'NEXORA News',
    title: 'NEXORA News - As Últimas Notícias de Tecnologia',
    description: 'Fique por dentro das últimas notícias de tecnologia, inovação e tendências digitais.',
    images: [
      {
        url: 'https://nexora-news.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'NEXORA News',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@nexoranews',
    creator: '@nexoranews',
    title: 'NEXORA News - As Últimas Notícias de Tecnologia',
    description: 'Fique por dentro das últimas notícias de tecnologia, inovação e tendências digitais.',
    images: ['https://nexora-news.com/og-image.jpg'],
  },
};

export default async function Home() {
  const allArticles = getArticlesSortedByDate(10); // Limit to 10 for homepage
  const trendingArticles = getRecentArticles(48, 5); // Last 48 hours, top 5

  if (allArticles.length === 0) {
    const suggestedArticles = getArticlesSortedByDate(5); // Get 5 suggestions

    return (
      <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 text-center">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-foreground mb-6 leading-tight">
            Bem-vindo à NEXORA News
          </h1>
          <p className="text-lg sm:text-xl text-muted mb-12">
            Ainda não há artigos publicados.
          </p>
          {suggestedArticles.length > 0 && (
            <>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-8">
                Talvez você se interesse por:
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {suggestedArticles.map((article) => (
                  <ArticleCard key={article.slug} article={article} />
                ))}
              </div>
            </>
          )}
          {!suggestedArticles.length && (
            <p className="text-base text-muted">
              Volte em breve para novas notícias!
            </p>
          )}
        </div>
      </div>
    );
  }

  const heroArticle = allArticles[0];
  const recentArticles = allArticles.slice(1, 7);

  return (
    <div className="w-full">
      {/* Hero Section - Enhanced with Premium Visual Effects */}
      <section className="relative w-full h-[450px] sm:h-[550px] lg:h-[650px] overflow-hidden mb-16 sm:mb-20 lg:mb-24">
        {/* Background Image or Gradient */}
        {heroArticle.image ? (
          <Image
            src={heroArticle.image}
            alt={heroArticle.title}
            fill
            style={{ objectFit: 'cover' }}
            sizes="100vw"
            priority
            className="brightness-[0.85] dark:brightness-75 scale-105"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary-dark to-foreground" />
        )}

        {/* Premium Multi-layer Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-transparent" />

        {/* Content */}
        <div className="container mx-auto px-4 sm:px-6 h-full relative z-10">
          <div className="flex items-end h-full pb-10 sm:pb-14 lg:pb-20">
            <div className="max-w-4xl animate-fade-in-up">
              {/* Category Badge with Enhanced Styling */}
              {heroArticle.category && (
                <div className="mb-4 sm:mb-5 animate-fade-in">
                  <span className="
                    inline-flex items-center gap-2
                    px-4 py-2
                    text-xs sm:text-sm font-bold uppercase tracking-wider
                    bg-primary text-white
                    rounded-full shadow-glow-primary
                    backdrop-blur-sm
                    transform hover:scale-105
                    transition-all duration-300 ease-bounce-soft
                  ">
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                      <path d="M2 6a2 2 0 012-2h12a2 2 0 012 2v2a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                    {getCategoryDisplayName(heroArticle.category)}
                  </span>
                </div>
              )}

              {/* Title with Premium Effects */}
              <Link href={`/noticias/${heroArticle.slug}`} className="group/hero block mb-5 sm:mb-6">
                <h1 className="
                  text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl
                  font-extrabold text-white
                  leading-[1.1] tracking-tighter
                  mb-0
                  [text-shadow:0_4px_12px_rgba(0,0,0,0.9)]
                  group-hover/hero:text-primary-light
                  transition-colors duration-300 ease-smooth
                ">
                  {heroArticle.title}
                </h1>
              </Link>

              {/* Description with Enhanced Readability */}
              <p className="
                text-base sm:text-lg md:text-xl lg:text-2xl
                text-gray-100 dark:text-gray-200
                leading-relaxed-plus
                line-clamp-2 sm:line-clamp-3
                mb-6 sm:mb-8
                [text-shadow:0_2px_8px_rgba(0,0,0,0.9)]
                max-w-3xl
              ">
                {heroArticle.description}
              </p>

              {/* CTA Button with Premium Styling */}
              <Link
                href={`/noticias/${heroArticle.slug}`}
                className="
                  inline-flex items-center gap-2.5
                  px-6 sm:px-8 py-3 sm:py-4
                  bg-primary hover:bg-primary-light
                  text-white font-bold text-sm sm:text-base
                  rounded-full
                  shadow-elevation-3 hover:shadow-elevation-4
                  transform hover:scale-105
                  transition-all duration-250 ease-bounce-soft
                  focus:outline-none focus:ring-2 focus:ring-primary-light focus:ring-offset-2 focus:ring-offset-black
                "
              >
                Ler artigo completo
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>
        </div>

        {/* Decorative Gradient Accent (Bottom) */}
        <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-primary via-primary-light to-primary" />
      </section>

      {/* Trending Section - Hot Articles from Last 48h */}
      {trendingArticles.length > 0 && (
        <section className="container mx-auto px-4 sm:px-6 mb-16 sm:mb-20 lg:mb-24">
          {/* Section Header with Fire Icon */}
          <div className="flex items-center gap-3 mb-8 sm:mb-10">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center shadow-elevation-2 animate-pulse-soft">
                <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-foreground tracking-tight">
                  Trending Agora
                </h2>
                <p className="text-sm sm:text-base text-muted">
                  Artigos mais quentes das últimas 48 horas
                </p>
              </div>
            </div>
          </div>

          {/* Horizontal Scrollable Grid on Mobile, Regular Grid on Desktop */}
          <div className="
            overflow-x-auto
            -mx-4 px-4 sm:mx-0 sm:px-0
            scrollbar-hide
            lg:overflow-x-visible
          ">
            <div className="
              flex gap-6 sm:gap-8
              lg:grid lg:grid-cols-3
              min-w-max lg:min-w-0
            ">
              {trendingArticles.map((article, index) => (
                <div
                  key={article.slug}
                  className="
                    w-[85vw] sm:w-[400px] lg:w-auto
                    flex-shrink-0 lg:flex-shrink
                    animate-fade-in-up
                  "
                  style={{ animationDelay: `${index * 80}ms`, animationFillMode: 'both' }}
                >
                  <ArticleCard article={article} />
                </div>
              ))}
            </div>
          </div>

          {/* Scroll Hint for Mobile */}
          <div className="lg:hidden mt-6 text-center">
            <p className="text-xs text-muted flex items-center justify-center gap-2">
              <svg className="w-4 h-4 animate-bounce-horizontal" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
              Deslize para ver mais
            </p>
          </div>
        </section>
      )}

      {/* Recent Articles Section with Enhanced Spacing */}
      {recentArticles.length > 0 && (
        <section className="container mx-auto px-4 sm:px-6 mb-20 sm:mb-24 lg:mb-28">
          {/* Section Header with Premium Typography */}
          <div className="flex items-end justify-between mb-10 sm:mb-12 lg:mb-14 pb-6 border-b-2 border-border/30">
            <div>
              <h2 className="
                text-3xl sm:text-4xl lg:text-5xl
                font-extrabold text-foreground
                tracking-tight
                mb-2
              ">
                Últimas Notícias
              </h2>
              <p className="text-base sm:text-lg text-muted">
                Fique a par das novidades mais recentes
              </p>
            </div>
            <Link
              href="/noticias"
              className="
                hidden sm:inline-flex items-center gap-2
                text-sm lg:text-base font-bold text-primary
                hover:text-primary-dark hover:gap-3
                transition-all duration-250 ease-smooth
                group
              "
            >
              Ver todas
              <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-250" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>

          {/* Articles Grid with Staggered Animation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10 lg:gap-12">
            {recentArticles.map((article, index) => (
              <div
                key={article.slug}
                className="animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'both' }}
              >
                <ArticleCard article={article} />
              </div>
            ))}
          </div>

          {/* Mobile "Ver todas" Link */}
          <div className="sm:hidden mt-10 text-center">
            <Link
              href="/noticias"
              className="
                inline-flex items-center gap-2
                text-sm font-bold text-primary
                hover:text-primary-dark hover:gap-3
                transition-all duration-250 ease-smooth
              "
            >
              Ver todas as notícias
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </section>
      )}

      {/* Newsletter Signup */}
      <div className="container mx-auto px-4 sm:px-6 mb-16 sm:mb-20">
        <NewsletterSignup />
      </div>
    </div>
  );
}