export const metadata = {
  title: 'Política de Privacidade',
  description: 'Política de Privacidade da NEXORA News. Saiba como protegemos e tratamos os seus dados pessoais.',
};

export default function PrivacidadePage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-foreground mb-6 leading-tight">
          Política de Privacidade
        </h1>

        <p className="text-muted mb-8">
          Última atualização: {new Date().toLocaleDateString('pt-PT', { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>

        <div className="prose prose-lg max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">1. Introdução</h2>
            <p className="text-foreground leading-relaxed">
              A NEXORA News ("nós", "nosso" ou "nos") está comprometida em proteger a sua privacidade. Esta Política
              de Privacidade explica como recolhemos, usamos, divulgamos e protegemos as suas informações quando
              visita o nosso website.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">2. Informações que Recolhemos</h2>
            <h3 className="text-xl font-semibold text-foreground mb-3 mt-6">2.1 Informações Fornecidas por Si</h3>
            <p className="text-foreground leading-relaxed mb-4">
              Quando se inscreve na nossa newsletter ou nos contacta, podemos recolher:
            </p>
            <ul className="list-disc list-inside space-y-2 text-foreground ml-4">
              <li>Nome</li>
              <li>Endereço de email</li>
              <li>Mensagens que nos envia</li>
            </ul>

            <h3 className="text-xl font-semibold text-foreground mb-3 mt-6">2.2 Informações Recolhidas Automaticamente</h3>
            <p className="text-foreground leading-relaxed mb-4">
              Quando visita o nosso site, podemos recolher automaticamente:
            </p>
            <ul className="list-disc list-inside space-y-2 text-foreground ml-4">
              <li>Endereço IP</li>
              <li>Tipo de navegador e dispositivo</li>
              <li>Páginas visitadas e tempo de visita</li>
              <li>Referrer URLs</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">3. Como Usamos as Suas Informações</h2>
            <p className="text-foreground leading-relaxed mb-4">
              Utilizamos as informações recolhidas para:
            </p>
            <ul className="list-disc list-inside space-y-2 text-foreground ml-4">
              <li>Enviar newsletters e atualizações (com o seu consentimento)</li>
              <li>Responder às suas questões e pedidos</li>
              <li>Melhorar o nosso website e serviços</li>
              <li>Analisar tendências e uso do website</li>
              <li>Cumprir obrigações legais</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">4. Cookies e Tecnologias Semelhantes</h2>
            <p className="text-foreground leading-relaxed">
              Utilizamos cookies e tecnologias semelhantes para melhorar a sua experiência no nosso website.
              Consulte a nossa <a href="/cookies" className="text-primary hover:underline">Política de Cookies</a> para
              mais informações.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">5. Partilha de Informações</h2>
            <p className="text-foreground leading-relaxed mb-4">
              Não vendemos, alugamos ou partilhamos as suas informações pessoais com terceiros, exceto:
            </p>
            <ul className="list-disc list-inside space-y-2 text-foreground ml-4">
              <li>Com fornecedores de serviços que nos ajudam a operar o website</li>
              <li>Quando exigido por lei</li>
              <li>Para proteger os nossos direitos e segurança</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">6. Os Seus Direitos (RGPD)</h2>
            <p className="text-foreground leading-relaxed mb-4">
              De acordo com o Regulamento Geral sobre a Proteção de Dados (RGPD), tem os seguintes direitos:
            </p>
            <ul className="list-disc list-inside space-y-2 text-foreground ml-4">
              <li>Direito de acesso aos seus dados pessoais</li>
              <li>Direito de retificação de dados incorretos</li>
              <li>Direito ao apagamento ("direito a ser esquecido")</li>
              <li>Direito de limitar o tratamento</li>
              <li>Direito de portabilidade de dados</li>
              <li>Direito de oposição ao tratamento</li>
            </ul>
            <p className="text-foreground leading-relaxed mt-4">
              Para exercer qualquer destes direitos, contacte-nos em{' '}
              <a href="mailto:privacidade@nexora-news.com" className="text-primary hover:underline">
                privacidade@nexora-news.com
              </a>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">7. Segurança</h2>
            <p className="text-foreground leading-relaxed">
              Implementamos medidas de segurança adequadas para proteger as suas informações pessoais contra acesso
              não autorizado, alteração, divulgação ou destruição.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">8. Retenção de Dados</h2>
            <p className="text-foreground leading-relaxed">
              Retemos as suas informações pessoais apenas pelo tempo necessário para cumprir os propósitos descritos
              nesta política, a menos que um período de retenção mais longo seja exigido ou permitido por lei.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">9. Alterações a Esta Política</h2>
            <p className="text-foreground leading-relaxed">
              Podemos atualizar esta Política de Privacidade periodicamente. Notificaremos sobre quaisquer alterações
              significativas publicando a nova política nesta página e atualizando a data de "Última atualização".
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">10. Contacto</h2>
            <p className="text-foreground leading-relaxed">
              Se tiver questões sobre esta Política de Privacidade, contacte-nos:
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
