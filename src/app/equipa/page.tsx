export const metadata = {
  title: 'Equipa',
  description: 'Conheça a equipa por detrás da NEXORA News - jornalistas, editores e especialistas em tecnologia dedicados a trazer-lhe as melhores notícias tech.',
};

export default function EquipaPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-foreground mb-6 leading-tight text-center">
          A Nossa Equipa
        </h1>

        <p className="text-xl text-muted mb-16 leading-relaxed text-center max-w-3xl mx-auto">
          Conheça as pessoas que trabalham todos os dias para trazer-lhe as melhores notícias e análises
          sobre tecnologia.
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {/* Team Member 1 */}
          <div className="bg-card p-8 rounded-lg text-center hover:shadow-xl transition-shadow duration-300">
            <div className="w-24 h-24 bg-gradient-to-br from-primary to-primary-dark rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-white text-3xl font-bold">EN</span>
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">Editor-Chefe</h3>
            <p className="text-primary font-semibold mb-3">Redação</p>
            <p className="text-muted text-sm leading-relaxed">
              Responsável pela direção editorial e qualidade do conteúdo publicado na NEXORA News.
            </p>
          </div>

          {/* Team Member 2 */}
          <div className="bg-card p-8 rounded-lg text-center hover:shadow-xl transition-shadow duration-300">
            <div className="w-24 h-24 bg-gradient-to-br from-primary to-primary-dark rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-white text-3xl font-bold">AT</span>
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">Analista Tecnológico</h3>
            <p className="text-primary font-semibold mb-3">Análise & Reviews</p>
            <p className="text-muted text-sm leading-relaxed">
              Especialista em análise de produtos e tendências tecnológicas emergentes.
            </p>
          </div>

          {/* Team Member 3 */}
          <div className="bg-card p-8 rounded-lg text-center hover:shadow-xl transition-shadow duration-300">
            <div className="w-24 h-24 bg-gradient-to-br from-primary to-primary-dark rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-white text-3xl font-bold">JT</span>
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">Jornalista Tech</h3>
            <p className="text-primary font-semibold mb-3">Notícias</p>
            <p className="text-muted text-sm leading-relaxed">
              Cobertura diária de notícias e eventos do mundo tecnológico.
            </p>
          </div>

          {/* Team Member 4 */}
          <div className="bg-card p-8 rounded-lg text-center hover:shadow-xl transition-shadow duration-300">
            <div className="w-24 h-24 bg-gradient-to-br from-primary to-primary-dark rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-white text-3xl font-bold">ES</span>
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">Especialista em IA</h3>
            <p className="text-primary font-semibold mb-3">Inteligência Artificial</p>
            <p className="text-muted text-sm leading-relaxed">
              Foco em inteligência artificial, machine learning e futuro da tecnologia.
            </p>
          </div>

          {/* Team Member 5 */}
          <div className="bg-card p-8 rounded-lg text-center hover:shadow-xl transition-shadow duration-300">
            <div className="w-24 h-24 bg-gradient-to-br from-primary to-primary-dark rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-white text-3xl font-bold">DW</span>
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">Designer Web</h3>
            <p className="text-primary font-semibold mb-3">Design & UX</p>
            <p className="text-muted text-sm leading-relaxed">
              Responsável pela experiência visual e usabilidade do portal.
            </p>
          </div>

          {/* Team Member 6 */}
          <div className="bg-card p-8 rounded-lg text-center hover:shadow-xl transition-shadow duration-300">
            <div className="w-24 h-24 bg-gradient-to-br from-primary to-primary-dark rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-white text-3xl font-bold">CM</span>
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">Community Manager</h3>
            <p className="text-primary font-semibold mb-3">Redes Sociais</p>
            <p className="text-muted text-sm leading-relaxed">
              Gestão de comunidade e interação nas redes sociais.
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-primary/10 to-primary-dark/10 p-8 sm:p-12 rounded-lg text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
            Junte-se à Nossa Equipa
          </h2>
          <p className="text-muted mb-6 max-w-2xl mx-auto">
            Está apaixonado por tecnologia e tem talento para escrever? Estamos sempre à procura de
            novos talentos para se juntarem à nossa equipa.
          </p>
          <a
            href="/contacto"
            className="inline-block bg-primary text-white font-bold py-3 px-8 rounded-lg hover:bg-primary-dark transition-colors duration-300"
          >
            Entre em Contacto
          </a>
        </div>
      </div>
    </div>
  );
}
