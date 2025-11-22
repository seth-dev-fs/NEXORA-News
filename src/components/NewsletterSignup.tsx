'use client';

import React, { useState } from 'react';

export default function NewsletterSignup() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setIsSuccess(false);

    // Client-side email validation
    if (!validateEmail(email)) {
      setMessage('Por favor, insira um endereço de email válido.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message || 'Obrigado por subscrever a nossa newsletter!');
        setIsSuccess(true);
        setEmail('');
      } else {
        setMessage(data.message || 'Ocorreu um erro ao subscrever. Por favor, tente novamente.');
        setIsSuccess(false);
      }
    } catch (error) {
      console.error('Newsletter signup fetch error:', error);
      setMessage('Ocorreu um erro ao subscrever. Por favor, tente novamente.');
      setIsSuccess(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-card to-primary/10 rounded-2xl shadow-lg my-12 sm:my-16">
      <div className="relative z-10 px-6 py-10 sm:px-8 sm:py-12 lg:px-12 lg:py-16 text-center">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-primary/10 rounded-full">
            <svg
              className="w-8 h-8 sm:w-10 sm:h-10 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
        </div>

        {/* Heading */}
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-foreground mb-4">
          Mantenha-se Atualizado!
        </h2>

        {/* Description */}
        <p className="text-base sm:text-lg text-muted max-w-2xl mx-auto mb-8">
          Subscreva a nossa newsletter para receber as últimas notícias, reviews exclusivas e análises tecnológicas
          diretamente na sua caixa de entrada.
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="max-w-lg mx-auto">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="flex-grow relative">
              <label htmlFor="newsletter-email" className="sr-only">
                Endereço de email
              </label>
              <input
                id="newsletter-email"
                type="email"
                placeholder="exemplo@email.com"
                className="w-full px-4 py-3 sm:px-5 sm:py-4 text-sm sm:text-base rounded-xl bg-background border-2 border-border text-foreground placeholder-muted/60 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
                required
                aria-describedby={message ? 'newsletter-message' : undefined}
              />
            </div>

            <button
              type="submit"
              className="px-6 py-3 sm:px-8 sm:py-4 text-sm sm:text-base font-bold text-white bg-primary rounded-xl hover:bg-primary-dark focus:outline-none focus:ring-4 focus:ring-primary/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2 min-w-[140px]"
              disabled={isSubmitting}
              aria-label={isSubmitting ? 'A subscrever newsletter' : 'Subscrever newsletter'}
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span>A enviar...</span>
                </>
              ) : (
                <>
                  <span>Subscrever</span>
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </>
              )}
            </button>
          </div>

          {/* Message Feedback */}
          {message && (
            <div
              id="newsletter-message"
              className={`mt-4 p-4 rounded-lg flex items-start gap-3 text-left ${
                isSuccess
                  ? 'bg-green-50 border border-green-200 text-green-800'
                  : 'bg-red-50 border border-red-200 text-red-800'
              }`}
              role="alert"
              aria-live="polite"
            >
              {isSuccess ? (
                <svg
                  className="w-5 h-5 flex-shrink-0 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5 flex-shrink-0 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
              <p className="text-sm sm:text-base font-medium">{message}</p>
            </div>
          )}
        </form>

        {/* Privacy Note */}
        <p className="mt-6 text-xs sm:text-sm text-muted/80">
          Respeitamos a sua privacidade. Pode cancelar a subscrição a qualquer momento.
        </p>
      </div>

      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 -z-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl opacity-30" aria-hidden="true" />
      <div className="absolute bottom-0 left-0 -z-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl opacity-30" aria-hidden="true" />
    </section>
  );
}
