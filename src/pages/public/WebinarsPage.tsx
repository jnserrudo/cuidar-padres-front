import { useQuery } from '@tanstack/react-query';
import { SiteHeader } from '../../components/public/SiteHeader';
import { SiteFooter } from '../../components/public/SiteFooter';
import { webinarsApi } from '../../api';

// Utilities
const extractYouTubeId = (input: string) => {
  if (!input) return null;
  try {
    const url = new URL(input);
    const host = url.hostname.replace('www.', '');
    if (host === 'youtu.be') return url.pathname.replace('/', '').split('/')[0] || null;
    if (host.endsWith('youtube.com')) {
      if (url.searchParams.get('v')) return url.searchParams.get('v');
      const parts = url.pathname.split('/').filter(Boolean);
      if ((parts[0] === 'embed' || parts[0] === 'shorts') && parts[1]) return parts[1];
    }
    return null;
  } catch {
    return null;
  }
};

const formatDate = (ds: string) => {
  if (!ds) return '';
  const d = new Date(ds);
  return isNaN(d.getTime()) ? ds : `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
};

export default function WebinarsPage() {
  const { data: webinars = [], isLoading } = useQuery({ queryKey: ['webinars'], queryFn: webinarsApi.list });

  const visibleWebinars = webinars
    .map((webinar) => ({
      ...webinar,
      videoId: webinar.youtubeId || extractYouTubeId(webinar.youtubeUrl) || "",
    }))
    .filter((webinar) => Boolean(webinar.videoId));

  const parseGuests = (value: string) =>
    value.split(",").map((guest) => guest.trim()).filter(Boolean);

  return (
    <div className="min-h-screen">
      <SiteHeader />

      <main className="mx-auto w-full max-w-5xl px-6 pb-20 pt-10">
        <section className="text-center">
          <h1 className="font-serif text-4xl text-slate-800">
            Webinars y encuentros
          </h1>
          <p className="mt-4 text-base text-slate-600">
            Míralos directamente desde esta página cuando quieras.
          </p>
        </section>

        <section className="mt-12 space-y-8">
          {isLoading ? (
             <div className="rounded-3xl border border-black/5 bg-white p-8 text-center text-sm text-slate-600 shadow-sm">
               Cargando webinars...
             </div>
          ) : visibleWebinars.length === 0 ? (
            <div className="rounded-3xl border border-black/5 bg-white p-8 text-center text-sm text-slate-600 shadow-sm">
              Todavía no hay webinars publicados.
            </div>
          ) : (
            visibleWebinars.map((webinar) => (
              <article
                key={webinar.id}
                id={webinar.id}
                className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-800">
                      {webinar.title}
                    </h2>
                    <p className="text-xs text-slate-500">
                      {formatDate(webinar.createdAt)}
                    </p>
                    {webinar.description ? (
                      <p className="mt-3 text-sm text-slate-600">
                        {webinar.description}
                      </p>
                    ) : null}
                    {webinar.specialGuests ? (
                      <div className="mt-4">
                        <p className="text-xs font-semibold text-slate-500">
                          Invitados especiales
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {parseGuests(webinar.specialGuests).map((guest, index) => (
                            <span
                              key={`${guest}-${index}`}
                              className="rounded-full border border-black/5 bg-[color:var(--color-rose)] px-3 py-1 text-xs text-slate-600"
                            >
                              {guest}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>
                  <a
                    href={webinar.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold text-[color:var(--color-terracotta)] underline"
                  >
                    Ver en YouTube
                  </a>
                </div>
                <div className="mt-4 overflow-hidden rounded-2xl border border-black/5">
                  <div className="aspect-video w-full">
                    <iframe
                      title={webinar.title}
                      className="h-full w-full"
                      src={`https://www.youtube.com/embed/${webinar.videoId}?rel=0`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                </div>
              </article>
            ))
          )}
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
