'use client';

import { useEffect, useState } from 'react';

export default function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const calculateProgress = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight - windowHeight;
      const scrolled = window.scrollY;
      const progressPercentage = (scrolled / documentHeight) * 100;
      setProgress(Math.min(Math.max(progressPercentage, 0), 100));
    };

    // Calculate initial progress
    calculateProgress();

    // Add scroll listener
    window.addEventListener('scroll', calculateProgress, { passive: true });

    // Cleanup
    return () => {
      window.removeEventListener('scroll', calculateProgress);
    };
  }, []);

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 h-1 bg-transparent pointer-events-none"
      role="progressbar"
      aria-valuenow={Math.round(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Progresso de leitura do artigo"
    >
      <div
        className="h-full bg-gradient-to-r from-primary via-primary-light to-primary transition-all duration-150 ease-out shadow-glow-primary"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
