export const metadata = {
  title: 'Sobre Nós',
  description: 'Conheça a NEXORA News - o seu portal de tecnologia em Portugal com notícias, análises e reviews sobre smartphones, wearables, gaming, IA e inovação.',
};

export default function SobrePage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-foreground mb-6 leading-tight">
          Sobre a NEXORA News
        </h1>

        <div className="prose prose-lg max-w-none">
          <p className="text-xl text-muted mb-8 leading-relaxed">
            A NEXORA News é o seu portal de tecnologia em Portugal, dedicado a trazer-lhe as últimas notícias,
            análises aprofundadas e reviews sobre o mundo da tecnologia.
          </p>

          <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Nossa Missão</h2>
          <p className="text-foreground leading-relaxed mb-6">
            Mantê-lo informado sobre as últimas tendências tecnológicas com conteúdo de qualidade, análises
            imparciais e cobertura abrangente de smartphones, wearables, gaming, inteligência artificial e inovação.
          </p>

          <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">O Que Fazemos</h2>
          <ul className="list-disc list-inside space-y-3 text-foreground mb-6">
            <li>Notícias diárias sobre tecnologia e inovação</li>
            <li>Análises aprofundadas de produtos e tendências</li>
            <li>Reviews imparciais de smartphones, wearables e gadgets</li>
            <li>Cobertura de eventos tecnológicos importantes</li>
            <li>Artigos sobre inteligência artificial e o futuro da tecnologia</li>
          </ul>

          <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Nossos Valores</h2>
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-card p-6 rounded-lg">
              <h3 className="text-lg font-bold text-foreground mb-2">Qualidade</h3>
              <p className="text-muted">
                Comprometemo-nos a fornecer conteúdo preciso, bem pesquisado e de alta qualidade.
              </p>
            </div>
            <div className="bg-card p-6 rounded-lg">
              <h3 className="text-lg font-bold text-foreground mb-2">Imparcialidade</h3>
              <p className="text-muted">
                Mantemos independência editorial e fornecemos análises honestas e imparciais.
              </p>
            </div>
            <div className="bg-card p-6 rounded-lg">
              <h3 className="text-lg font-bold text-foreground mb-2">Atualidade</h3>
              <p className="text-muted">
                Mantemo-lo atualizado com as últimas novidades do mundo tecnológico.
              </p>
            </div>
            <div className="bg-card p-6 rounded-lg">
              <h3 className="text-lg font-bold text-foreground mb-2">Acessibilidade</h3>
              <p className="text-muted">
                Tornamos a tecnologia compreensível para todos, desde entusiastas a utilizadores casuais.
              </p>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Contacte-nos</h2>
          <p className="text-foreground leading-relaxed">
            Tem alguma questão, sugestão ou feedback? Adoraríamos ouvir de si.
            Visite a nossa <a href="/contacto" className="text-primary hover:underline">página de contacto</a> para
            entrar em comunicação connosco.
          </p>
        </div>
      </div>
    </div>
  );
}
