'use client';

import React, { useState } from 'react';
import ArticleCard from '@/components/ArticleCard'; // Use ArticleCard instead of SimpleCard
import { ArticleData } from '@/lib/markdown'; // Import ArticleData type

export default function TutoriaisEDicasClientPage({ allArticlesData }: { allArticlesData: ArticleData[] }) {
  const tutoriais = allArticlesData.filter(article => article.category === 'Tutoriais');
  const dicas = allArticlesData.filter(article => article.category === 'Dicas');

  const [activeTab, setActiveTab] = useState<'tutoriais' | 'dicas'>('tutoriais');

  const tabs: { id: 'tutoriais' | 'dicas'; name: string }[] = [
    { id: 'tutoriais', name: 'Tutoriais' },
    { id: 'dicas', name: 'Dicas' },
  ];

  const articlesToShow = activeTab === 'tutoriais' ? tutoriais : dicas;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-extrabold text-foreground mb-8">Tutoriais & Dicas</h1>

      {/* Tabs */}
      <div className="mb-8 flex flex-wrap gap-2 border-b border-border">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-3 text-sm font-semibold transition-colors duration-200 -mb-px border-b-2 ${
              activeTab === tab.id
                ? 'text-primary border-primary'
                : 'text-muted border-transparent hover:text-foreground'
            }`}
          >
            {tab.name}
          </button>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articlesToShow.length === 0 ? (
          <p className="text-muted col-span-full text-center">
            No {activeTab === 'tutoriais' ? 'tutorials' : 'tips'} found. Please generate some articles with the category "{activeTab === 'tutoriais' ? 'Tutoriais' : 'Dicas'}" using the `scripts/generate-articles.js` script.
          </p>
        ) : (
          articlesToShow.map((item) => (
            <ArticleCard key={item.slug} {...item} />
          ))
        )}
      </div>
    </div>
  );
}
