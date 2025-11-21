import { getSortedArticlesData } from '@/lib/markdown';
import TutoriaisEDicasClientPage from './_tutoriais-e-dicas-client'; // Import the client component

export async function generateMetadata() {
  return {
    title: 'Tutoriais & Dicas - NEXORA News',
    description: 'Tutoriais e dicas de tecnologia para utilizadores portugueses.',
  };
}

export default async function TutoriaisEDicasServerPage() {
  const allArticlesData = await getSortedArticlesData();

  return <TutoriaisEDicasClientPage allArticlesData={allArticlesData} />;
}
