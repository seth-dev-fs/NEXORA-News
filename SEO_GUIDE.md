# SEO Guide - NEXORA News

Guia completo de SEO para o projeto NEXORA News.

## Metadata Atual (Implementado ✅)

### Layout Principal (`src/app/layout.tsx`)

**Configuração Global:**
- ✅ `metadataBase`: `https://nexora-news.com`
- ✅ Title template: `%s | NEXORA News`
- ✅ Description otimizada com keywords
- ✅ Open Graph completo (type, locale, images)
- ✅ Twitter Cards implementado
- ✅ Robots meta tags configurados
- ✅ Verificação Google/Yandex (placeholder)

## Checklist SEO por Tipo de Página

### Homepage (/)
- [x] Title único e descritivo
- [x] Meta description (150-160 chars)
- [x] Open Graph image
- [x] H1 único e relevante
- [x] Structured data (WebSite schema recomendado)
- [x] Internal linking para categorias
- [x] Imagens com alt text

### Páginas de Artigos (/noticias/[slug])
- [x] Title dinâmico baseado no artigo
- [x] Meta description do article.description
- [x] Open Graph image do artigo
- [x] H1 com título do artigo
- [ ] JSON-LD Article schema (RECOMENDADO)
- [x] Breadcrumbs visuais
- [x] Canonical URLs
- [x] Datas em formato ISO + display pt-PT
- [x] Author information

### Páginas de Categoria (/categoria/[slug])
- [x] Title dinâmico com categoria
- [x] Meta description por categoria
- [x] H1 com nome da categoria
- [ ] JSON-LD CollectionPage schema (OPCIONAL)
- [x] Paginação (se implementada)
- [x] Canonical URLs

### Páginas Institucionais
- [x] /sobre - Metadata completo
- [x] /contacto - Metadata completo
- [x] /equipa - Metadata completo
- [x] /privacidade - Metadata completo
- [x] /termos - Metadata completo
- [x] /cookies - Metadata completo

## JSON-LD Structured Data (Recomendado)

### Article Schema (para páginas de artigos)

```typescript
// Adicionar em src/app/noticias/[slug]/page.tsx
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: article.title,
  description: article.description,
  image: article.image || 'https://nexora-news.com/og-image.jpg',
  datePublished: article.date,
  dateModified: article.date,
  author: {
    '@type': 'Organization',
    name: 'NEXORA News',
    url: 'https://nexora-news.com',
  },
  publisher: {
    '@type': 'Organization',
    name: 'NEXORA News',
    logo: {
      '@type': 'ImageObject',
      url: 'https://nexora-news.com/logo.png',
    },
  },
  mainEntityOfPage: {
    '@type': 'WebPage',
    '@id': `https://nexora-news.com/noticias/${article.slug}`,
  },
};

// No JSX:
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
/>
```

### WebSite Schema (para homepage)

```typescript
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'NEXORA News',
  url: 'https://nexora-news.com',
  description: 'Portal de tecnologia em Portugal',
  potentialAction: {
    '@type': 'SearchAction',
    target: 'https://nexora-news.com/search?q={search_term_string}',
    'query-input': 'required name=search_term_string',
  },
};
```

### BreadcrumbList Schema

```typescript
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: 'https://nexora-news.com',
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: getCategoryDisplayName(article.category),
      item: `https://nexora-news.com/categoria/${article.category}`,
    },
    {
      '@type': 'ListItem',
      position: 3,
      name: article.title,
      item: `https://nexora-news.com/noticias/${article.slug}`,
    },
  ],
};
```

## Best Practices para Novos Artigos

### Frontmatter Otimizado

```yaml
---
title: "Título Otimizado para SEO (50-60 caracteres)" # IMPORTANTE: Use keywords
date: "2025-11-22T14:00:00.000Z" # ISO 8601 format
category: "smartphones" # Slug normalizado
description: "Descrição clara e concisa que resume o artigo (150-160 caracteres máximo)" # Meta description
image: "https://valid-image-url.com/image.jpg" # Open Graph image
source_url: "https://fonte-original.com/artigo" # Crédito
draft: false # Publicar
---
```

### Keywords Estratégicas

**Primárias (Portugal):**
- tecnologia Portugal
- notícias tech
- smartphones Portugal
- wearables
- gaming
- inteligência artificial
- inovação tecnológica

**Secundárias:**
- reviews tech
- análises tecnologia
- gadgets
- AI Portugal
- futuro tecnologia

### Title Tag Guidelines

- **Comprimento ideal:** 50-60 caracteres
- **Estrutura:** `[Keyword Principal] - Benefício | NEXORA News`
- **Exemplos:**
  - ✅ "Smartphone X Pro: Análise Completa | NEXORA News"
  - ✅ "IA no Dia a Dia: Como Usar | NEXORA News"
  - ❌ "Este é o Novo Smartphone Incrível que Vai Mudar Tudo" (muito longo, clickbait)

### Meta Description Guidelines

- **Comprimento ideal:** 150-160 caracteres
- **Incluir:** Call-to-action, keyword principal, benefício
- **Exemplos:**
  - ✅ "Análise completa do Smartphone X Pro. Conheça especificações, preço e se vale a pena. Leia review completo na NEXORA News."
  - ❌ "Artigo sobre smartphone" (muito curto, não informativo)

## Otimização de Imagens

### Guidelines
- **Alt text:** Descritivo, keyword-rich, não spam
  - ✅ "Smartphone X Pro traseira em azul sobre fundo branco"
  - ❌ "img123"
  - ❌ "smartphone tech tecnologia melhor comprar online" (keyword stuffing)

- **File names:** Descritivos com hífens
  - ✅ `smartphone-x-pro-review-2025.jpg`
  - ❌ `IMG_1234.jpg`

- **Formatos:** WebP preferencial, AVIF para futuro, JPEG fallback
- **Tamanhos:** Responsive com srcset
- **Lazy loading:** Sim, exceto above-the-fold (priority)

## Internal Linking Strategy

### Estrutura de Links
1. Homepage → Categorias → Artigos
2. Artigos → Categorias relacionadas
3. Artigos → Artigos relacionados (mesmo tema)
4. Footer → Páginas institucionais

### Anchor Text
- Use texto descritivo e relevante
- ✅ "análise completa do Smartphone X"
- ❌ "clique aqui"
- ❌ "leia mais"

## URL Structure (Atual - Otimizada ✅)

```
https://nexora-news.com/
https://nexora-news.com/categoria/smartphones
https://nexora-news.com/noticias/[slug-do-artigo]
https://nexora-news.com/sobre
https://nexora-news.com/contacto
```

**Best Practices:**
- URLs curtos e descritivos
- Lowercase
- Hífens, não underscores
- Sem caracteres especiais
- Incluir keyword principal quando possível

## Performance SEO

### Core Web Vitals (Targets)
- **LCP (Largest Contentful Paint):** < 2.5s
- **FID (First Input Delay):** < 100ms
- **CLS (Cumulative Layout Shift):** < 0.1

### Otimizações Implementadas
- Next.js Image optimization
- ISR (Incremental Static Regeneration) 60s
- Static generation de 78 páginas
- Compression habilitado
- Security headers configurados

## Mobile SEO

✅ **Implementado:**
- Responsive design (mobile-first)
- Touch targets min 44x44px
- Viewport meta tag configurado
- Texto legível sem zoom
- Navegação mobile-friendly

## Technical SEO Checklist

### Configuração Vercel
- [ ] Domínio personalizado configurado
- [ ] SSL/HTTPS ativo
- [ ] Redirect www → non-www (ou vice-versa)
- [ ] 404 página customizada
- [ ] 500 página de erro customizada

### Ficheiros Essenciais

#### robots.txt
```
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/

Sitemap: https://nexora-news.com/sitemap.xml
```

#### sitemap.xml (RECOMENDADO)
Gerar dinamicamente com Next.js:

```typescript
// src/app/sitemap.ts
import { getArticlesSortedByDate, getAllArticles } from '@/lib/markdown';

export default function sitemap() {
  const articles = getArticlesSortedByDate();
  const categories = new Set(getAllArticles().map(a => a.category));

  return [
    {
      url: 'https://nexora-news.com',
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 1,
    },
    ...Array.from(categories).map(category => ({
      url: `https://nexora-news.com/categoria/${category}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    })),
    ...articles.map(article => ({
      url: `https://nexora-news.com/noticias/${article.slug}`,
      lastModified: new Date(article.date),
      changeFrequency: 'weekly',
      priority: 0.6,
    })),
  ];
}
```

## Analytics & Tracking

### Google Search Console
1. Adicionar propriedade
2. Verificar ownership (meta tag já configurado em layout.tsx)
3. Submeter sitemap.xml
4. Monitorar:
   - Cobertura de indexação
   - Core Web Vitals
   - Queries de pesquisa
   - Backlinks

### Google Analytics 4
```typescript
// src/app/layout.tsx - adicionar:
<Script
  src={`https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX`}
  strategy="afterInteractive"
/>
<Script id="google-analytics" strategy="afterInteractive">
  {`
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-XXXXXXXXXX');
  `}
</Script>
```

## Content Guidelines

### Qualidade de Conteúdo
- Mínimo 300 palavras por artigo
- Headings structure: H1 → H2 → H3
- Parágrafos curtos (2-4 linhas)
- Bullet points para legibilidade
- Imagens relevantes (min 1 por artigo)

### E-A-T (Expertise, Authoritativeness, Trustworthiness)
- Citar fontes originais (source_url no frontmatter)
- Byline com autor
- Data de publicação visível
- Informação de contacto acessível
- Política de privacidade e termos

### Atualização de Conteúdo
- Artigos evergreen: Atualizar anualmente
- Notícias: Adicionar update note se necessário
- Incluir dateModified em JSON-LD

## Próximas Ações Recomendadas

### Curto Prazo (1-2 semanas)
1. [ ] Implementar JSON-LD Article schema em páginas de artigos
2. [ ] Criar sitemap.xml dinâmico
3. [ ] Criar robots.txt
4. [ ] Configurar Google Search Console
5. [ ] Configurar Google Analytics 4
6. [ ] Adicionar logo.png e og-image.jpg ao /public

### Médio Prazo (1 mês)
1. [ ] Implementar artigos relacionados
2. [ ] Criar página de busca (/search)
3. [ ] Adicionar breadcrumbs visuais
4. [ ] Implementar RSS feed
5. [ ] Otimizar Core Web Vitals

### Longo Prazo (3+ meses)
1. [ ] Link building strategy
2. [ ] Guest posting
3. [ ] Social media integration
4. [ ] Newsletter growth
5. [ ] Content refresh cycle

## Monitorização e Manutenção

### KPIs Principais
- Organic traffic
- Impressões (Search Console)
- CTR médio
- Posições médias
- Core Web Vitals scores
- Bounce rate
- Pages per session

### Frequência de Revisão
- **Semanal:** Search Console queries e performance
- **Mensal:** Google Analytics dashboards
- **Trimestral:** Audit SEO completo
- **Anual:** Content refresh de artigos evergreen

---

**Última atualização:** 22 de novembro de 2025
**Versão:** 1.0
**Responsável:** SEO Specialist - FULL TEAM Session
