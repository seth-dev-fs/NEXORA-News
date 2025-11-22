import Image from 'next/image';
import Link from 'next/link';
import { ArticleMeta } from '@/lib/markdown';

export default function ArticleCard({ article }: { article: ArticleMeta }) {
  if (!article) return null;

  return (
    <Link href={`/noticias/${article.slug}`} className="block bg-card rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden group">
      <div className="relative w-full h-48 bg-gray-200">
        {article.image && (
          <Image
            src={article.image}
            alt={article.title}
            fill
            style={{ objectFit: 'cover' }}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="transition-transform duration-300 group-hover:scale-105"
          />
        )}
      </div>
      <div className="p-4">
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
