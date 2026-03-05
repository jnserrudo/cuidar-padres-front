import { useParams, Link, Navigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { SiteHeader } from '../../components/public/SiteHeader';
import { SiteFooter } from '../../components/public/SiteFooter';
import { announcementsApi } from '../../api';
import { renderAnnouncementBody } from '../../utils/announcementFormatting';

const formatDateOnly = (ds: string) => {
  if (!ds) return '';
  const d = new Date(ds);
  return isNaN(d.getTime()) ? ds : `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
};

export default function AnnouncementDetailPage() {
  const { id } = useParams<{ id: string }>();
  
  const { data: announcement, isLoading, isError } = useQuery({
    queryKey: ['announcement', id],
    queryFn: () => announcementsApi.get(id as string),
    enabled: !!id
  });

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <SiteHeader />
        <main className="mx-auto w-full max-w-3xl px-6 pb-20 pt-10 text-center">
          <p>Cargando anuncio...</p>
        </main>
        <SiteFooter />
      </div>
    );
  }

  if (isError || !announcement) {
    return <Navigate to="/anuncios" replace />;
  }

  const meta = [announcement.location, formatDateOnly(announcement.createdAt)]
    .filter(Boolean)
    .join(" - ");

  return (
    <div className="min-h-screen">
      <SiteHeader />

      <main className="mx-auto w-full max-w-3xl px-6 pb-20 pt-10">
        <Link
          to="/anuncios"
          className="inline-flex items-center justify-center rounded-full border border-[color:var(--color-terracotta)] px-4 py-2 text-xs font-semibold text-[color:var(--color-terracotta)] transition hover:bg-[color:var(--color-terracotta)] hover:text-white"
        >
          Volver a anuncios
        </Link>

        <article className="mt-6 rounded-3xl border border-black/5 bg-white px-6 py-10 shadow-sm sm:px-10">
          <div className="flex justify-start">
            <span className="flex h-12 w-12 items-center justify-center rounded-full border border-black/10 bg-white shadow-sm overflow-hidden">
              <img
                src="/logo.png"
                alt="Cuidar a Nuestros Padres"
                className="h-9 w-9 object-contain"
              />
            </span>
          </div>
          <p className="mt-4 text-xs text-slate-500">{meta}</p>
          <h1 className="mt-3 font-serif text-3xl text-slate-800">
            {announcement.title}
          </h1>
          {announcement.summary ? (
            <p className="mt-4 text-base text-slate-600">
              {announcement.summary}
            </p>
          ) : null}
          <div className="mt-6">{renderAnnouncementBody(announcement.body)}</div>
        </article>
      </main>

      <SiteFooter />
    </div>
  );
}
