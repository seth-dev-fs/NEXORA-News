import Image from 'next/image';
import { getArticleData, getSortedArticlesData } from '@/lib/markdown'; // Import the utility functions

// Function to generate static params for Next.js
export async function generateStaticParams() {
  const allArticles = await getSortedArticlesData();
  return allArticles.map((article) => ({
    slug: article.slug,
  }));
}

export default async function ArticlePage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const article = await getArticleData(slug);

  if (!article) {
    // In a real app, you might want to redirect to a 404 page
    return (
      <div className="container mx-auto px-4 py-8 text-center text-foreground">
        <h1 className="text-3xl font-bold mb-4">Artigo Não Encontrado</h1>
        <p>Pedimos desculpa, mas o artigo que procura não existe.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <article className="max-w-3xl mx-auto bg-card p-6 md:p-8 rounded-lg shadow-lg">
        <Image
          src={article.imageUrl}
          alt={article.title}
          width={900}
          height={500}
          className="rounded-lg mb-6 w-full object-cover"
          priority
        />
        <p className="text-primary text-sm font-semibold uppercase mb-2">{article.category}</p>
        <h1 className="text-4xl font-extrabold text-foreground leading-tight mb-4">{article.title}</h1>
        <p className="text-muted text-sm mb-6">{article.date}</p>

        <div
          className="prose prose-lg max-w-none text-foreground leading-relaxed"
          dangerouslySetInnerHTML={{ __html: article.contentHtml }}
        />
      </article>
    </div>
  );
}
