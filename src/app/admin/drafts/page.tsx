import Link from "next/link";
import { getAllArticles } from "@/lib/markdown";

export default async function DraftsPage() {
  // This page will only be rendered in the development environment
  if (process.env.NODE_ENV !== 'development') {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold">Acesso Negado</h1>
        <p>Esta página só está disponível em ambiente de desenvolvimento.</p>
      </div>
    );
  }

  const allArticles = await getAllArticles(); // Gets all articles including drafts
  const draftArticles = allArticles.filter(article => article.draft);
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-foreground mb-8">Artigos em Rascunho</h1>
      <p className="text-muted mb-8">
        Estes artigos foram gerados mas não estão publicados. Edite o ficheiro markdown e mude `draft: true` para `draft: false` para publicar.
      </p>

      {draftArticles.length === 0 ? (
        <p>Não há rascunhos para rever.</p>
      ) : (
        <div className="space-y-4">
          {draftArticles.map(article => (
            <div key={article.slug} className="p-4 border rounded-lg bg-card">
              <h2 className="text-xl font-bold text-foreground">{article.title}</h2>
              <p className="text-sm text-muted">{article.category} | {new Date(article.date).toLocaleDateString('pt-PT')}</p>
              <p className="mt-2 text-foreground">{article.description}</p>
              <div className="mt-4">
                <Link href={`/noticias/${article.slug}`} className="text-primary hover:underline">
                  Ver Pré-visualização
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
