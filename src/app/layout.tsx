import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google'; // Import only Inter
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ThemeProvider } from '@/components/ThemeProvider';
import GoogleAnalytics from '@/components/GoogleAnalytics';

// Configure font
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://nexora-news.com'),
  title: {
    default: 'NEXORA News - Portal de Tecnologia em Portugal',
    template: '%s | NEXORA News',
  },
  description: 'O seu portal de tecnologia em Portugal. Notícias, análises e reviews sobre smartphones, wearables, gaming, IA e inovação. Mantenha-se atualizado com as últimas tendências tecnológicas.',
  keywords: ['tecnologia', 'Portugal', 'smartphones', 'wearables', 'gaming', 'IA', 'inteligência artificial', 'inovação', 'notícias tech', 'reviews', 'análises'],
  authors: [{ name: 'Equipa NEXORA News' }],
  creator: 'NEXORA News',
  publisher: 'NEXORA News',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'pt_PT',
    url: 'https://nexora-news.com',
    siteName: 'NEXORA News',
    title: 'NEXORA News - Portal de Tecnologia em Portugal',
    description: 'O seu portal de tecnologia em Portugal. Notícias, análises e reviews sobre smartphones, wearables, gaming, IA e inovação.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'NEXORA News - Portal de Tecnologia',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@nexoranews',
    creator: '@nexoranews',
    title: 'NEXORA News - Portal de Tecnologia em Portugal',
    description: 'O seu portal de tecnologia em Portugal. Notícias, análises e reviews sobre smartphones, wearables, gaming, IA e inovação.',
    images: ['/twitter-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;

  return (
    <html lang="pt" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans bg-background text-foreground flex flex-col min-h-screen`}>
        {gaId && <GoogleAnalytics gaId={gaId} />}
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Header />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
