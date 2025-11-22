export const metadata = {
  title: 'Política de Cookies',
  description: 'Política de Cookies da NEXORA News. Saiba como utilizamos cookies e tecnologias semelhantes no nosso website.',
};

export default function CookiesPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-foreground mb-6 leading-tight">
          Política de Cookies
        </h1>

        <p className="text-muted mb-8">
          Última atualização: {new Date().toLocaleDateString('pt-PT', { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>

        <div className="prose prose-lg max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">1. O Que São Cookies?</h2>
            <p className="text-foreground leading-relaxed">
              Cookies são pequenos ficheiros de texto que são armazenados no seu dispositivo (computador, tablet ou
              telemóvel) quando visita um website. Os cookies ajudam o website a funcionar de forma mais eficiente e
              fornecem informações aos proprietários do website.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">2. Como Usamos Cookies</h2>
            <p className="text-foreground leading-relaxed mb-4">
              A NEXORA News utiliza cookies para:
            </p>
            <ul className="list-disc list-inside space-y-2 text-foreground ml-4">
              <li>Garantir que o website funciona corretamente</li>
              <li>Lembrar as suas preferências</li>
              <li>Compreender como você usa o nosso website</li>
              <li>Melhorar a sua experiência de navegação</li>
              <li>Analisar o tráfego do website</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">3. Tipos de Cookies que Utilizamos</h2>

            <div className="bg-card p-6 rounded-lg mb-6">
              <h3 className="text-xl font-semibold text-foreground mb-3">3.1 Cookies Estritamente Necessários</h3>
              <p className="text-foreground leading-relaxed">
                Estes cookies são essenciais para o funcionamento do website e não podem ser desativados. São geralmente
                definidos em resposta a ações suas, como definir preferências de privacidade ou preencher formulários.
              </p>
            </div>

            <div className="bg-card p-6 rounded-lg mb-6">
              <h3 className="text-xl font-semibold text-foreground mb-3">3.2 Cookies de Desempenho</h3>
              <p className="text-foreground leading-relaxed">
                Estes cookies permitem-nos contar visitas e fontes de tráfego para medir e melhorar o desempenho do
                nosso website. Ajudam-nos a saber quais páginas são mais e menos populares e a ver como os visitantes
                se movem pelo website.
              </p>
            </div>

            <div className="bg-card p-6 rounded-lg mb-6">
              <h3 className="text-xl font-semibold text-foreground mb-3">3.3 Cookies de Funcionalidade</h3>
              <p className="text-foreground leading-relaxed">
                Estes cookies permitem que o website forneça funcionalidades melhoradas e personalização. Podem ser
                definidos por nós ou por fornecedores terceiros cujos serviços adicionámos às nossas páginas.
              </p>
            </div>

            <div className="bg-card p-6 rounded-lg mb-6">
              <h3 className="text-xl font-semibold text-foreground mb-3">3.4 Cookies de Publicidade/Segmentação</h3>
              <p className="text-foreground leading-relaxed">
                Estes cookies podem ser definidos através do nosso website por parceiros publicitários. Podem ser
                usados por essas empresas para criar um perfil dos seus interesses e mostrar anúncios relevantes
                noutros websites.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">4. Cookies de Terceiros</h2>
            <p className="text-foreground leading-relaxed mb-4">
              Utilizamos serviços de terceiros que podem definir cookies no seu dispositivo, incluindo:
            </p>
            <ul className="list-disc list-inside space-y-2 text-foreground ml-4">
              <li><strong>Google Analytics:</strong> Para analisar o uso do website</li>
              <li><strong>Redes Sociais:</strong> Para permitir partilha de conteúdo</li>
              <li><strong>Fornecedores de CDN:</strong> Para melhorar a velocidade de carregamento</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">5. Duração dos Cookies</h2>
            <p className="text-foreground leading-relaxed mb-4">
              Os cookies podem ser:
            </p>
            <ul className="list-disc list-inside space-y-2 text-foreground ml-4">
              <li>
                <strong>Cookies de Sessão:</strong> Temporários, apagados quando fecha o navegador
              </li>
              <li>
                <strong>Cookies Persistentes:</strong> Permanecem no seu dispositivo por um período definido ou até
                que os apague manualmente
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">6. Como Gerir Cookies</h2>
            <p className="text-foreground leading-relaxed mb-4">
              Pode controlar e gerir cookies de várias maneiras:
            </p>

            <h3 className="text-xl font-semibold text-foreground mb-3 mt-6">Definições do Navegador</h3>
            <p className="text-foreground leading-relaxed mb-4">
              A maioria dos navegadores permite controlar cookies através das definições. Pode:
            </p>
            <ul className="list-disc list-inside space-y-2 text-foreground ml-4 mb-6">
              <li>Ver que cookies tem e apagá-los individualmente</li>
              <li>Bloquear cookies de terceiros</li>
              <li>Bloquear cookies de sites específicos</li>
              <li>Bloquear todos os cookies</li>
              <li>Apagar todos os cookies quando fechar o navegador</li>
            </ul>

            <p className="text-foreground leading-relaxed">
              Para mais informações sobre como gerir cookies no seu navegador, consulte:
            </p>
            <ul className="list-disc list-inside space-y-2 text-foreground ml-4 mt-4">
              <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google Chrome</a></li>
              <li><a href="https://support.mozilla.org/pt-PT/kb/ative-e-desative-os-cookies" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Mozilla Firefox</a></li>
              <li><a href="https://support.apple.com/pt-pt/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Safari</a></li>
              <li><a href="https://support.microsoft.com/pt-pt/microsoft-edge/eliminar-cookies-no-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Microsoft Edge</a></li>
            </ul>
          </section>

          <section className="bg-primary/10 p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-foreground mb-3">⚠️ Importante</h3>
            <p className="text-foreground leading-relaxed">
              Se bloquear ou apagar cookies, algumas funcionalidades do website podem não funcionar corretamente.
              Algumas funcionalidades e serviços podem não estar disponíveis se os cookies estiverem desativados.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">7. Alterações a Esta Política</h2>
            <p className="text-foreground leading-relaxed">
              Podemos atualizar esta Política de Cookies periodicamente para refletir alterações nas nossas práticas
              ou por outros motivos operacionais, legais ou regulamentares.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">8. Mais Informações</h2>
            <p className="text-foreground leading-relaxed">
              Para mais informações sobre como usamos cookies e como protegemos a sua privacidade, consulte a nossa{' '}
              <a href="/privacidade" className="text-primary hover:underline">Política de Privacidade</a>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">9. Contacto</h2>
            <p className="text-foreground leading-relaxed">
              Para questões sobre esta Política de Cookies, contacte-nos:
            </p>
            <ul className="list-none space-y-2 text-foreground ml-4 mt-4">
              <li>Email: <a href="mailto:privacidade@nexora-news.com" className="text-primary hover:underline">privacidade@nexora-news.com</a></li>
              <li>Formulário de contacto: <a href="/contacto" className="text-primary hover:underline">www.nexora-news.com/contacto</a></li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
