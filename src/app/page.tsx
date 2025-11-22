import Image from 'next/image';
import Link from 'next/link';
import ArticleCard from '@/components/ArticleCard';
import NewsletterSignup from '@/components/NewsletterSignup';
import { getSortedArticlesData } from '@/lib/markdown';

export default async function Home() {
  const allArticles = await getSortedArticlesData();

  if (allArticles.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 text-center text-foreground">
        <h1 className="text-3xl font-bold mb-4">Bem-vindo à NEXORA News</h1>
        <p className="text-muted">Ainda não há artigos publicados. Volte em breve!</p>
      </div>
    );
  }

  const heroArticle = allArticles[0];
  const recentArticles = allArticles.slice(1, 7);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="relative w-full h-[500px] md:h-[600px] rounded-lg overflow-hidden mb-12 shadow-lg">
        {heroArticle.image && (
            <Image
                src={heroArticle.image}
                alt={heroArticle.title}
                fill
                style={{ objectFit: 'cover' }}
                sizes="100vw"
                priority
            />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent flex items-end p-8">
          <div className="max-w-2xl">
            {heroArticle.category && (
                <p className="text-sm font-bold uppercase text-primary-light">{heroArticle.category}</p>
            )}
            <Link href={`/noticias/${heroArticle.slug}`}>
              <h2 className="font-sans text-4xl md:text-5xl font-extrabold leading-tight mt-2 text-white hover:text-primary-light transition-colors duration-200 [text-shadow:0_2px_4px_rgba(0,0,0,0.5)]">
                {heroArticle.title}
              </h2>
            </Link>
            <p className="mt-4 text-lg text-gray-200 hidden md:block">{heroArticle.description}</p>
          </div>
        </div>
      </section>

      {/* Recent Articles Section */}
      {recentArticles.length > 0 && (
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-6">Últimas Notícias</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {recentArticles.map((article) => (
              <ArticleCard key={article.slug} article={article} />
            ))}
          </div>
        </section>
      )}

      {/* Newsletter Signup */}
      <NewsletterSignup />
    </div>
  );
}