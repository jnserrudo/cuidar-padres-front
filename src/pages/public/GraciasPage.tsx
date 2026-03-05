import { Link } from 'react-router-dom';
import { SiteHeader } from '../../components/public/SiteHeader';
import { SiteFooter } from '../../components/public/SiteFooter';

export default function GraciasPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader actionLabel="Volver al inicio" actionHref="/" />

      <main className="mx-auto w-full max-w-2xl px-6 py-20 text-center">
        <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-[color:var(--color-sage)]/20 text-[color:var(--color-sage)]">
          <svg
            className="h-10 w-10"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        <h1 className="font-serif text-4xl leading-tight">
          ¡Gracias por tu interes!
        </h1>
        
        <p className="mx-auto mt-6 max-w-md text-lg text-black/70">
          Recibimos tu solicitud correctamente. La vamos a revisar pronto y te
          estaremos contactando por WhatsApp o email con los próximos pasos para sumarte.
        </p>

        <div className="mt-10">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full bg-[color:var(--color-terracotta)] px-8 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:brightness-95 hover:shadow-md"
          >
            Volver al inicio
          </Link>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
