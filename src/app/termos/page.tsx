export const metadata = {
  title: 'Termos de Uso',
  description: 'Termos e Condições de Uso da NEXORA News. Leia os termos que regem a utilização do nosso website.',
};

export default function TermosPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-foreground mb-6 leading-tight">
          Termos e Condições de Uso
        </h1>

        <p className="text-muted mb-8">
          Última atualização: {new Date().toLocaleDateString('pt-PT', { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>

        <div className="prose prose-lg max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">1. Aceitação dos Termos</h2>
            <p className="text-foreground leading-relaxed">
              Ao aceder e utilizar o website NEXORA News, você aceita e concorda em ficar vinculado a estes Termos e
              Condições de Uso. Se não concordar com estes termos, não deve utilizar este website.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">2. Uso do Website</h2>
            <h3 className="text-xl font-semibold text-foreground mb-3 mt-6">2.1 Licença de Uso</h3>
            <p className="text-foreground leading-relaxed">
              Concedemos-lhe uma licença limitada, não exclusiva, não transferível e revogável para aceder e usar o
              website para fins pessoais e não comerciais.
            </p>

            <h3 className="text-xl font-semibold text-foreground mb-3 mt-6">2.2 Restrições</h3>
            <p className="text-foreground leading-relaxed mb-4">
              Você concorda em NÃO:
            </p>
            <ul className="list-disc list-inside space-y-2 text-foreground ml-4">
              <li>Modificar, copiar ou criar trabalhos derivados do nosso conteúdo sem autorização</li>
              <li>Usar o website para fins ilegais ou não autorizados</li>
              <li>Tentar obter acesso não autorizado ao website ou sistemas relacionados</li>
              <li>Interferir ou interromper o funcionamento do website</li>
              <li>Usar scrapers, bots ou outras ferramentas automatizadas sem permissão</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">3. Propriedade Intelectual</h2>
            <p className="text-foreground leading-relaxed mb-4">
              Todo o conteúdo no website NEXORA News, incluindo mas não limitado a textos, gráficos, logos, imagens e
              software, é propriedade da NEXORA News ou dos seus fornecedores de conteúdo e está protegido por leis
              de direitos de autor portuguesas e internacionais.
            </p>
            <p className="text-foreground leading-relaxed">
              A marca "NEXORA News" e todos os logos relacionados são marcas registadas ou marcas comerciais da
              NEXORA News.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">4. Conteúdo de Utilizador</h2>
            <p className="text-foreground leading-relaxed mb-4">
              Se enviar comentários, sugestões ou outro conteúdo ao website:
            </p>
            <ul className="list-disc list-inside space-y-2 text-foreground ml-4">
              <li>Você mantém a propriedade do seu conteúdo</li>
              <li>Você concede-nos uma licença mundial, não exclusiva e isenta de royalties para usar esse conteúdo</li>
              <li>Você garante que o conteúdo não viola direitos de terceiros</li>
              <li>Reservamo-nos o direito de remover qualquer conteúdo a qualquer momento</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">5. Links para Sites de Terceiros</h2>
            <p className="text-foreground leading-relaxed">
              O nosso website pode conter links para sites de terceiros. Não somos responsáveis pelo conteúdo ou
              práticas de privacidade desses sites. O acesso a sites de terceiros é por sua conta e risco.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">6. Isenção de Garantias</h2>
            <p className="text-foreground leading-relaxed">
              O website é fornecido "como está" e "conforme disponível". Não garantimos que o website será
              ininterrupto, seguro ou livre de erros. Não fazemos garantias quanto à precisão ou completude do
              conteúdo.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">7. Limitação de Responsabilidade</h2>
            <p className="text-foreground leading-relaxed">
              Na medida máxima permitida por lei, a NEXORA News não será responsável por quaisquer danos diretos,
              indiretos, incidentais, especiais ou consequenciais resultantes do uso ou incapacidade de usar o website.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">8. Indemnização</h2>
            <p className="text-foreground leading-relaxed">
              Você concorda em indemnizar e isentar a NEXORA News de quaisquer reclamações, danos ou despesas
              (incluindo honorários advocatícios) decorrentes do seu uso do website ou violação destes termos.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">9. Alterações aos Termos</h2>
            <p className="text-foreground leading-relaxed">
              Reservamo-nos o direito de modificar estes termos a qualquer momento. As alterações entrarão em vigor
              imediatamente após a publicação no website. O uso continuado do website após as alterações constitui
              aceitação dos novos termos.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">10. Lei Aplicável</h2>
            <p className="text-foreground leading-relaxed">
              Estes termos são regidos pelas leis de Portugal. Quaisquer disputas serão resolvidas nos tribunais
              portugueses.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">11. Contacto</h2>
            <p className="text-foreground leading-relaxed">
              Para questões sobre estes Termos de Uso, contacte-nos:
            </p>
            <ul className="list-none space-y-2 text-foreground ml-4 mt-4">
              <li>Email: <a href="mailto:legal@nexora-news.com" className="text-primary hover:underline">legal@nexora-news.com</a></li>
              <li>Formulário de contacto: <a href="/contacto" className="text-primary hover:underline">www.nexora-news.com/contacto</a></li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
