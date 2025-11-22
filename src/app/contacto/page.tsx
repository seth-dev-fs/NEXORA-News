export const metadata = {
  title: 'Contacto',
  description: 'Entre em contacto com a equipa NEXORA News. Envie-nos as suas questões, sugestões ou feedback.',
};

export default function ContactoPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-foreground mb-6 leading-tight">
          Contacte-nos
        </h1>

        <p className="text-xl text-muted mb-12 leading-relaxed">
          Tem alguma questão, sugestão ou feedback? Adoraríamos ouvir de si.
        </p>

        <div className="bg-card p-8 rounded-lg shadow-lg mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-6">Envie-nos uma Mensagem</h2>

          <form className="space-y-6" action="/api/contact" method="POST">
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-foreground mb-2">
                Nome *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                placeholder="O seu nome"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-foreground mb-2">
                Email *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                placeholder="seuemail@exemplo.com"
              />
            </div>

            <div>
              <label htmlFor="subject" className="block text-sm font-semibold text-foreground mb-2">
                Assunto *
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                required
                className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                placeholder="Assunto da mensagem"
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-semibold text-foreground mb-2">
                Mensagem *
              </label>
              <textarea
                id="message"
                name="message"
                required
                rows={6}
                className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground resize-none"
                placeholder="Escreva a sua mensagem aqui..."
              />
            </div>

            <button
              type="submit"
              className="w-full bg-primary text-white font-bold py-4 px-6 rounded-lg hover:bg-primary-dark transition-colors duration-300 focus:outline-none focus:ring-4 focus:ring-primary/30"
            >
              Enviar Mensagem
            </button>
          </form>

          <p className="text-sm text-muted mt-6">
            * Campos obrigatórios
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-card p-6 rounded-lg">
            <h3 className="text-lg font-bold text-foreground mb-3">
              Email
            </h3>
            <p className="text-muted">
              <a href="mailto:contato@nexora-news.com" className="text-primary hover:underline">
                contato@nexora-news.com
              </a>
            </p>
          </div>

          <div className="bg-card p-6 rounded-lg">
            <h3 className="text-lg font-bold text-foreground mb-3">
              Redes Sociais
            </h3>
            <div className="flex space-x-4">
              <a href="https://twitter.com/nexoranews" className="text-muted hover:text-primary transition-colors">
                Twitter
              </a>
              <a href="https://facebook.com/nexoranews" className="text-muted hover:text-primary transition-colors">
                Facebook
              </a>
              <a href="https://linkedin.com/company/nexoranews" className="text-muted hover:text-primary transition-colors">
                LinkedIn
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
