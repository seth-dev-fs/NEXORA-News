import Image from 'next/image';
import Link from 'next/link';
import ArticleCard from '@/components/ArticleCard';
import NewsletterSignup from '@/components/NewsletterSignup'; // Import the new component
import { getSortedArticlesData } from '@/lib/markdown'; // Import the utility function

export default async function Home() {
  const allArticlesData = await getSortedArticlesData();

  // If there are no articles, handle the empty state
  if (allArticlesData.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 text-center text-foreground">
        <h1 className="text-3xl font-bold mb-4">No articles found.</h1>
        <p>Please generate some articles using the `scripts/generate-articles.js` script.</p>
      </div>
    );
  }

  const heroArticle = allArticlesData[0];
  const recentArticles = allArticlesData.slice(1, 6); // Get the next 5 articles for recent and featured sections

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="relative w-full h-[500px] md:h-[600px] rounded-lg overflow-hidden mb-12">
        <Image
          src={heroArticle.imageUrl}
          alt={heroArticle.title}
          fill
          style={{ objectFit: 'cover' }}
          sizes="100vw"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-transparent flex items-end p-8">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase text-primary [text-shadow:0_1px_2px_rgba(255,255,255,0.4)]">{heroArticle.category}</p>
            <Link href={`/noticias/${heroArticle.slug}`}>
              <h2 className="font-sans text-4xl md:text-5xl font-extrabold leading-tight mt-2 text-foreground hover:text-primary transition-colors duration-200 [text-shadow:0_2px_4px_rgba(255,255,255,0.2)]">
                {heroArticle.title}
              </h2>
            </Link>
            <p className="mt-4 text-lg text-muted hidden md:block">{heroArticle.description}</p>
            <p className="mt-2 text-sm text-muted">{heroArticle.date}</p>
          </div>
        </div>
      </section>

      {/* Seções Organizadas */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold text-foreground mb-6">Últimas Notícias</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {recentArticles.slice(0, 3).map((article, index) => (
            <ArticleCard key={article.slug} {...article} />
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-3xl font-bold text-foreground mb-6">Em Destaque</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {recentArticles.slice(3, 6).map((article, index) => (
            <ArticleCard key={article.slug} {...article} />
          ))}
        </div>
      </section>

      {/* Newsletter Signup */}
      <NewsletterSignup />

      {/* Adicionar mais seções conforme necessário */}
    </div>
  );
}
