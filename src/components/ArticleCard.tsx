import Image from 'next/image';
import Link from 'next/link';
import { ArticleMeta } from '@/lib/markdown';

// The ArticleCard now accepts a single 'article' prop of type ArticleMeta
export default function ArticleCard({ article }: { article: ArticleMeta }) {
  if (!article) return null;

  return (
    <Link href={`/noticias/${article.slug}`} className="block bg-card rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden group">
      <div className="relative w-full h-48">
        {article.featured_image ? (
          <Image
            src={article.featured_image}
            alt={article.title}
            fill
            style={{ objectFit: 'cover' }}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gray-300"></div> // Placeholder
        )}
      </div>
      <div className="p-4">
        {/* CORRECTED: Use 'category' (string) instead of 'categories' (array) */}
        {article.category && (
            <p className="text-primary text-sm font-semibold uppercase mb-2">{article.category}</p>
        )}
        <h3 className="text-xl font-bold text-foreground leading-tight group-hover:text-primary transition-colors duration-200">{article.title}</h3>
        <p className="text-muted text-sm mt-2 truncate">{article.description}</p>
        <p className="text-xs text-muted mt-3">{new Date(article.date).toLocaleDateString('pt-PT', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
      </div>
    </Link>
  );
}