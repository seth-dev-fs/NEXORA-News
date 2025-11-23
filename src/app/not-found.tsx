import Link from 'next/link';
import { getArticlesSortedByDate } from '@/lib/markdown';

export default function NotFound() {
  const suggestedArticles = getArticlesSortedByDate(3);

  return (
    <div className="min-h-[60vh] flex items-center justify-center bg-background">
      <div className="container mx-auto px-4 sm:px-6 text-center">
        <div className="max-w-2xl mx-auto">
          {/* 404 Visual */}
          <div className="mb-8">
            <h1 className="text-8xl sm:text-9xl font-extrabold text-primary/20 mb-4">
              404
            </h1>
            <div className="w-24 h-1 bg-primary mx-auto rounded-full" />
          </div>

          {/* Error Message */}
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground mb-4">
            Página Não Encontrada
          </h2>
          <p className="text-lg sm:text-xl text-muted mb-8 leading-relaxed">
            Lamentamos, mas a página que procura não existe ou foi removida.
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Voltar à Página Inicial
            </Link>
            <Link
              href="/noticias"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-card text-foreground font-semibold rounded-lg hover:bg-primary/10 border border-border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              Ver Todas as Notícias
            </Link>
          </div>

          {/* Suggested Articles */}
          {suggestedArticles.length > 0 && (
            <div className="mt-16 pt-8 border-t border-border">
              <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-6">
                Artigos que Poderão Interessar
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
                {suggestedArticles.map((article) => (
                  <Link
                    key={article.slug}
                    href={`/noticias/${article.slug}`}
                    className="block p-4 bg-card rounded-lg hover:bg-primary/5 border border-border hover:border-primary transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <h4 className="font-bold text-foreground mb-2 line-clamp-2">
                      {article.title}
                    </h4>
                    <p className="text-sm text-muted line-clamp-1">
                      {article.description}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
