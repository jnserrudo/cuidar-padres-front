import { Link } from 'react-router-dom';

type SiteHeaderProps = {
  actionLabel?: string;
  actionHref?: string;
};

export function SiteHeader({
  actionLabel = 'Solicitar ingreso',
  actionHref = '/solicitar',
}: SiteHeaderProps) {
  const navItems = [
    { label: 'Inicio', href: '/', hash: '' },
    { label: 'Cómo funciona', href: '/', hash: '#como-funciona' },
    { label: 'Servicios', href: '/', hash: '#ofrecemos' },
    { label: 'Normas', href: '/', hash: '#reglas' },
    { label: 'Anuncios', href: '/anuncios', hash: '' },
    { label: 'Webinars', href: '/webinars', hash: '' },
    { label: 'Panel', href: '/admin/login', hash: '' },
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-black/5 bg-white shadow-sm">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-8 px-6 py-5">
        <Link to="/" className="flex items-center gap-3">
          <span className="flex h-14 w-14 items-center justify-center rounded-full border border-black/10 bg-white shadow-sm overflow-hidden">
            <img
              src="/logo.png"
              alt="Cuidar a Nuestros Padres"
              className="h-11 w-11 object-contain"
            />
          </span>
          <span className="text-lg font-semibold text-[color:var(--color-foreground)]">
            Cuidar a Nuestros Padres
          </span>
        </Link>

        <nav className="hidden items-center gap-7 text-base font-medium text-black/70 lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.label}
              to={{ pathname: item.href, hash: item.hash }}
              className="transition hover:text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[color:var(--color-terracotta)]"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <Link
          to={actionHref}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-[color:var(--color-terracotta)] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:brightness-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--color-terracotta)] block md:inline-flex"
        >
          {actionLabel}
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="h-4 w-4 hidden sm:block"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M5 12h14" />
            <path d="M13 6l6 6-6 6" />
          </svg>
        </Link>
      </div>
    </header>
  );
}
