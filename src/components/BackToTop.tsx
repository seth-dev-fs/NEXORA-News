'use client';

// File: src/components/BackToTop.tsx
// Description: Back to top button with smooth scroll - appears after 500px scroll

import { useState, useEffect } from 'react';

export default function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show button after scrolling 500px
      setIsVisible(window.scrollY > 500);
    };

    // Add scroll listener
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Check initial scroll position
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  // Don't render if not visible
  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      className="
        fixed bottom-6 right-6 z-40
        w-12 h-12 sm:w-14 sm:h-14
        bg-primary hover:bg-primary-dark
        text-white
        rounded-full shadow-elevation-3 hover:shadow-elevation-4
        transform hover:scale-110 active:scale-95
        transition-all duration-250 ease-smooth
        animate-fade-in
        focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background
        group
      "
      aria-label="Voltar ao topo"
      title="Voltar ao topo"
    >
      <svg
        className="w-5 h-5 sm:w-6 sm:h-6 mx-auto transform group-hover:-translate-y-0.5 transition-transform duration-250"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2.5"
          d="M5 10l7-7m0 0l7 7m-7-7v18"
        />
      </svg>
    </button>
  );
}
