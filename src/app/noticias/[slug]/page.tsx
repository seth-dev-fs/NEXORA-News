import Image from 'next/image';
import { getArticleBySlug, getSortedArticlesData } from '@/lib/markdown';
import { notFound } from 'next/navigation';

// Generate static pages for all articles to improve performance
export async function generateStaticParams() {
  const articles = getSortedArticlesData();
  return articles.map((article) => ({
    slug: article.slug,
  }));
}

// Generate metadata for the page
export async function generateMetadata({ params }: { params: { slug: string } }) {
  const article = getArticleBySlug(params.slug);

  if (!article) {
    return {
      title: 'Artigo Não Encontrado',
    };
  }

  return {
    title: article.title,
    description: article.meta_description,
  };
}

// The page component
export default async function ArticlePage({ params }: { params: { slug: string } }) {
  const article = getArticleBySlug(params.slug);

  // If no article is found, render the 404 page
  if (!article) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <article className="max-w-3xl mx-auto bg-card p-6 md:p-8 rounded-lg shadow-lg">
        <h1 className="text-4xl lg:text-5xl font-extrabold text-foreground leading-tight mb-4">{article.title}</h1>
        <p className="text-muted text-lg mb-6">{article.meta_description}</p>
        <div className="flex items-center text-sm text-muted mb-6">
          <span>{new Date(article.date).toLocaleDateString('pt-PT', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
          {article.categories[0] && (
            <>
              <span className="mx-2">|</span>
              <span className="text-primary font-semibold uppercase">{article.categories[0]}</span>
            </>
          )}
        </div>

        {article.featured_image && (
          <Image
            src={article.featured_image}
            alt={article.title}
            width={900}
            height={500}
            className="rounded-lg mb-8 w-full object-cover"
            priority
          />
        )}
        
        {article.pontos_chave && article.pontos_chave.length > 0 && (
          <div className="bg-background/50 p-6 rounded-lg mb-8 border-l-4 border-primary">
            <h2 className="text-2xl font-bold text-foreground mb-4">Pontos-Chave</h2>
            <ul className="list-disc list-inside space-y-2 text-foreground">
              {article.pontos_chave.map((ponto, index) => (
                <li key={index}>{ponto}</li>
              ))}
            </ul>
          </div>
        )}

        <div
          className="prose prose-lg max-w-none text-foreground leading-relaxed"
          dangerouslySetInnerHTML={{ __html: article.contentHtml }}
        />

        {article.source_url && (
            <div className="mt-8 pt-4 border-t border-border text-sm text-muted">
                Fonte original: <a href={article.source_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{article.source_url}</a>
            </div>
        )}
      </article>
    </div>
  );
}