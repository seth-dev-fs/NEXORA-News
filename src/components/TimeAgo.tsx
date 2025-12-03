'use client';

import { useEffect, useState } from 'react';

interface TimeAgoProps {
  date: string; // ISO date string
  className?: string;
}

/**
 * Calculates and formats the time elapsed since a given date
 * Returns a human-friendly Portuguese string like "há 2 horas" or "há 3 dias"
 */
function getTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) {
    return 'há menos de 1 minuto';
  }

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `há ${minutes} minuto${minutes !== 1 ? 's' : ''}`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `há ${hours} hora${hours !== 1 ? 's' : ''}`;
  }

  const days = Math.floor(hours / 24);
  if (days < 7) {
    return `há ${days} dia${days !== 1 ? 's' : ''}`;
  }

  const weeks = Math.floor(days / 7);
  if (weeks < 4) {
    return `há ${weeks} semana${weeks !== 1 ? 's' : ''}`;
  }

  const months = Math.floor(days / 30);
  if (months < 12) {
    return `há ${months} ${months !== 1 ? 'meses' : 'mês'}`;
  }

  const years = Math.floor(days / 365);
  return `há ${years} ano${years !== 1 ? 's' : ''}`;
}

/**
 * Client-side component that displays time elapsed since article publication
 * Updates every minute to keep the time fresh
 */
export default function TimeAgo({ date, className = '' }: TimeAgoProps) {
  const [timeAgo, setTimeAgo] = useState<string>('');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    // Calculate initial time ago
    const updateTimeAgo = () => {
      setTimeAgo(getTimeAgo(date));
    };

    updateTimeAgo();

    // Update every minute (60000ms)
    const interval = setInterval(updateTimeAgo, 60000);

    // Cleanup
    return () => {
      clearInterval(interval);
    };
  }, [date]);

  // Avoid hydration mismatch by rendering placeholder during SSR
  if (!isMounted) {
    return (
      <time dateTime={date} className={className}>
        {new Date(date).toLocaleDateString('pt-PT', {
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        })}
      </time>
    );
  }

  return (
    <time dateTime={date} className={className} title={new Date(date).toLocaleString('pt-PT')}>
      {timeAgo}
    </time>
  );
}
