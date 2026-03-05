import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { SiteHeader } from '../../components/public/SiteHeader';
import { SiteFooter } from '../../components/public/SiteFooter';
import { announcementsApi } from '../../api';

const formatDateOnly = (ds: string) => {
  if (!ds) return '';
  const d = new Date(ds);
  return isNaN(d.getTime()) ? ds : `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
};

const getExcerpt = (summary?: string, body?: string) => {
  const source = (summary || body || '').trim();
  if (!source) return '';
  return source.length <= 220 ? source : `${source.slice(0, 220).trim()}...`;
};

export default function AnnouncementsPage() {
  const { data: announcements = [], isLoading } = useQuery({ queryKey: ['announcements'], queryFn: announcementsApi.list });

  return (
    <div className="min-h-screen">
      <SiteHeader />

      <main className="mx-auto w-full max-w-5xl px-6 pb-20 pt-10">
        <section className="rounded-3xl border border-black/5 bg-[color:var(--color-rose)] px-6 py-10 text-center shadow-sm sm:px-10">
          <h1 className="font-serif text-4xl text-slate-800">Anuncios</h1>
          <p className="mt-4 text-base text-slate-600">
            Últimas novedades y encuentros de la comunidad.
          </p>
        </section>

        <section className="mt-10 space-y-6">
          {isLoading ? (
            <div className="rounded-3xl border border-black/5 bg-white p-8 text-center text-sm text-slate-600 shadow-sm">
              Cargando anuncios...
            </div>
          ) : announcements.length === 0 ? (
            <div className="rounded-3xl border border-black/5 bg-white p-8 text-center text-sm text-slate-600 shadow-sm">
              Todavía no hay anuncios publicados.
            </div>
          ) : (
            announcements.map((announcement) => (
              <article
                key={announcement.id}
                className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white shadow-sm overflow-hidden">
                    <img
                      src="/logo.png"
                      alt="Cuidar a Nuestros Padres"
                      className="h-7 w-7 object-contain"
                    />
                  </span>
                  <p className="text-xs text-slate-500">
                    {formatDateOnly(announcement.createdAt)}
                  </p>
                </div>
                <h2 className="mt-2 text-lg font-semibold text-slate-800">
                  {announcement.title}
                </h2>
                {announcement.location ? (
                  <p className="mt-1 text-xs text-slate-500">
                    {announcement.location}
                  </p>
                ) : null}
                <p className="mt-4 text-sm text-slate-600">
                  {getExcerpt(announcement.summary, announcement.body)}
                </p>
                <Link
                  to={`/anuncios/${announcement.id}`}
                  className="mt-4 inline-flex items-center justify-center rounded-full border border-[color:var(--color-terracotta)] px-4 py-2 text-xs font-semibold text-[color:var(--color-terracotta)] transition hover:bg-[color:var(--color-terracotta)] hover:text-white"
                >
                  Leer más
                </Link>
              </article>
            ))
          )}
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
