export const revalidate = 60;
import Image from 'next/image';
import Link from 'next/link';
import ArticleCard from '@/components/ArticleCard';
import NewsletterSignup from '@/components/NewsletterSignup';
import { getArticlesSortedByDate } from '@/lib/markdown';
import { getCategoryDisplayName } from '@/lib/categories';

export default async function Home() {
  const allArticles = getArticlesSortedByDate(10); // Limit to 10 for homepage

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
      {/* Hero Section */}
      <section className="relative w-full h-[400px] sm:h-[500px] lg:h-[600px] overflow-hidden mb-12 sm:mb-16">
        {/* Background Image or Gradient */}
        {heroArticle.image ? (
          <Image
            src={heroArticle.image}
            alt={heroArticle.title}
            fill
            style={{ objectFit: 'cover' }}
            sizes="100vw"
            priority
            className="brightness-90"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary-dark to-foreground" />
        )}

        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

        {/* Content */}
        <div className="container mx-auto px-4 sm:px-6 h-full relative z-10">
          <div className="flex items-end h-full pb-8 sm:pb-12 lg:pb-16">
            <div className="max-w-3xl">
              {heroArticle.category && (
                <span className="inline-block mb-3 sm:mb-4 px-3 py-1 text-xs sm:text-sm font-bold uppercase tracking-wide bg-primary text-white rounded-full">
                  {getCategoryDisplayName(heroArticle.category)}
                </span>
              )}
              <Link href={`/noticias/${heroArticle.slug}`} className="group">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-extrabold text-white mb-3 sm:mb-4 leading-tight group-hover:text-primary-light transition-colors duration-300 [text-shadow:0_2px_8px_rgba(0,0,0,0.8)]">
                  {heroArticle.title}
                </h1>
              </Link>
              <p className="text-base sm:text-lg lg:text-xl text-gray-100 leading-relaxed line-clamp-2 sm:line-clamp-3 [text-shadow:0_1px_4px_rgba(0,0,0,0.8)]">
                {heroArticle.description}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Articles Section */}
      {recentArticles.length > 0 && (
        <section className="container mx-auto px-4 sm:px-6 mb-16 sm:mb-20">
          <div className="flex items-center justify-between mb-8 sm:mb-10">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-foreground">
              Últimas Notícias
            </h2>
            <Link
              href="/noticias"
              className="text-sm sm:text-base font-semibold text-primary hover:text-primary-dark transition-colors duration-200"
            >
              Ver todas &rarr;
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {recentArticles.map((article) => (
              <ArticleCard key={article.slug} article={article} />
            ))}
          </div>
        </section>
      )}

      {/* Newsletter Signup */}
      <div className="container mx-auto px-4 sm:px-6">
        <NewsletterSignup />
      </div>
    </div>
  );
}