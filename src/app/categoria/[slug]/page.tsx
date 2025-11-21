import ArticleCard from "@/components/ArticleCard";
import { getPostsByCategory, getAllPosts } from "@/lib/markdown";

const VALID_CATEGORIES = [
  "smartphones",
  "wearables",
  "audio",
  "computadores",
  "internet-apps",
  "mobilidade",
  "ciencia",
  "entretenimento-gaming",
  "ai-futuro",
];

export async function generateStaticParams() {
  return VALID_CATEGORIES.map((category) => ({
    slug: category,
  }));
}

export default async function CategoryPage({
  params,
}: {
  params: { slug: string };
}) {
  const slug = params.slug;

  // Validate category
  if (!VALID_CATEGORIES.includes(slug)) {
    return (
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold mb-6">Categoria inválida</h1>
        <p>A categoria "{slug}" não existe.</p>
      </div>
    );
  }

  // Load articles
  const categoryArticles = await getPostsByCategory(slug);

  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold mb-10 capitalize">
        {slug.replace("-", " ")}
      </h1>

      {categoryArticles.length === 0 ? (
        <div className="text-center text-muted py-16">
          <p>De momento não existem artigos nesta categoria.</p>
          <p>Por favor, volte mais tarde.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categoryArticles.map((article) => (
            <ArticleCard key={article.slug} {...article} />
          ))}
        </div>
      )}
    </div>
  );
}
