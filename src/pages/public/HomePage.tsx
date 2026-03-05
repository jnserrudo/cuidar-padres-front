import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { SiteHeader } from '../../components/public/SiteHeader';
import { SiteFooter } from '../../components/public/SiteFooter';
import { announcementsApi, webinarsApi } from '../../api';

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

const pad2 = (val: number) => val.toString().padStart(2, '0');
const formatDate = (ds: string) => {
  if (!ds) return '';
  const d = new Date(ds);
  return isNaN(d.getTime()) ? ds : `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)} ${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
};
const formatDateOnly = (ds: string) => {
  if (!ds) return '';
  const d = new Date(ds);
  return isNaN(d.getTime()) ? ds : `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}`;
};

export default function HomePage() {
  const { data: webinars = [] } = useQuery({ queryKey: ['webinars'], queryFn: webinarsApi.list });
  const { data: announcements = [] } = useQuery({ queryKey: ['announcements'], queryFn: announcementsApi.list });

  const latestWebinarRaw = webinars[0];
  const latestWebinar = latestWebinarRaw ? { ...latestWebinarRaw, videoId: latestWebinarRaw.youtubeId || extractYouTubeId(latestWebinarRaw.youtubeUrl) || '' } : null;
  const latestWebinarLink = latestWebinar?.videoId ? `/webinars#${latestWebinar.id}` : '/webinars';
  const latestWebinarThumbnail = latestWebinar?.videoId ? `https://img.youtube.com/vi/${latestWebinar.videoId}/hqdefault.jpg` : '';
  
  const latestAnnouncements = announcements.slice(0, 2);
  const getExcerpt = (sum?: string, body?: string) => {
    const src = (sum || body || '').trim();
    if (!src) return '';
    return src.length <= 140 ? src : `${src.slice(0, 140).trim()}...`;
  };

  const iconProps = { className: "h-5 w-5", fill: "none", stroke: "currentColor", strokeWidth: "1.8", strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  const offers = [
    { title: "Contención emocional", description: "Un espacio para compartir lo que te pasa y sentirte acompañado.", icon: <svg aria-hidden="true" viewBox="0 0 24 24" {...iconProps}><path d="M20.8 5.9a5 5 0 0 0-7.1 0L12 7.6l-1.7-1.7a5 5 0 1 0-7.1 7.1L12 21.8l8.8-8.8a5 5 0 0 0 0-7.1z" /></svg> },
    { title: "Información práctica", description: "Trámites, CUD, obras sociales y recursos para el día a día.", icon: <svg aria-hidden="true" viewBox="0 0 24 24" {...iconProps}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /><path d="M8 13h8M8 17h8" /></svg> },
    { title: "Contactos confiables", description: "Cuidadoras, residencias y servicios recomendados.", icon: <svg aria-hidden="true" viewBox="0 0 24 24" {...iconProps}><path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="3" /><path d="M23 21v-2a4 4 0 0 0-3-3.9" /><path d="M16 3.1a3 3 0 0 1 0 5.8" /></svg> },
    { title: "Médicos y especialidades", description: "Orientación para encontrar profesionales y centros.", icon: <svg aria-hidden="true" viewBox="0 0 24 24" {...iconProps}><path d="M6 3v3a4 4 0 0 0 8 0V3" /><path d="M14 3v3a6 6 0 0 1-12 0V3" /><path d="M10 14v3a4 4 0 0 0 8 0v-1" /><circle cx="18" cy="16" r="2" /></svg> },
    { title: "Charlas y webinars con profesionales", description: "Encuentros con especialistas para orientar decisiones y despejar dudas.", icon: <svg aria-hidden="true" viewBox="0 0 24 24" {...iconProps}><rect x="7" y="2" width="10" height="10" rx="3" /><path d="M5 10v1a7 7 0 0 0 14 0v-1" /><path d="M12 18v4" /><path d="M8 22h8" /></svg> },
    { title: "Mercado artículos de cuidado", description: "Guía de costos, formas de pago y artículos de cuidado habituales.", icon: <svg aria-hidden="true" viewBox="0 0 24 24" {...iconProps}><path d="M6 6h15l-1.5 9H7.5z" /><path d="M6 6l-2-3" /><circle cx="9" cy="20" r="1" /><circle cx="18" cy="20" r="1" /></svg> },
    { title: "Consultas generales", description: "Preguntas abiertas sobre el cuidado de personas mayores.", icon: <svg aria-hidden="true" viewBox="0 0 24 24" {...iconProps}><circle cx="12" cy="12" r="9" /><path d="M9.1 9a3 3 0 1 1 3.9 3c-.8.4-1 1-1 2" /><path d="M12 17h.01" /></svg> },
  ];
  const rules = [ "No somos profesionales de salud ni brindamos emergencias.", "No se permiten ventas, promociones ni derivaciones pagas.", "Respeto, empatía y escucha entre todos los integrantes.", "Nada de spam, cadenas o contenido fuera del objetivo.", "Cuidamos la privacidad: no compartimos datos personales." ];
  const steps = [
    { number: 1, text: "Completa el formulario con tus datos y necesidades." },
    { number: 2, text: "Revisamos cada solicitud para cuidar el clima del grupo." },
    { number: 3, text: "Te contactamos por email o WhatsApp con los próximos pasos." }
  ];

  return (
    <div className="min-h-screen bg-[color:var(--color-cream)]">
      <SiteHeader />
      
      <main className="mx-auto w-full max-w-5xl px-6 pb-20" id="inicio">
        {/* ── Hero ── */}
        <section className="py-14 text-center">
          <div className="mx-auto max-w-3xl space-y-6">
            <h1 className="font-serif text-4xl leading-tight text-slate-800 sm:text-5xl">
              Acompañamos a quienes cuidan,<br />
              escuchan y sostienen.
            </h1>
            <p className="text-lg text-slate-600">
              Somos una comunidad para familiares que cuidan a personas mayores. Compartimos
              experiencias, información y contactos para que nadie atraviese el proceso en soledad.
            </p>
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link
                to="/solicitar"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[color:var(--color-terracotta)] px-7 py-3 text-sm font-semibold text-white shadow-sm transition hover:brightness-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[color:var(--color-terracotta)]"
              >
                Solicitar ingreso{' '}
                <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14" /><path d="M13 6l6 6-6 6" /></svg>
              </Link>
              <a href="#reglas" className="text-sm font-semibold text-[color:var(--color-terracotta)] transition hover:underline">Ver normas</a>
            </div>
          </div>
        </section>

        {/* ── Lo que ofrecemos ── */}
        <section className="py-8" id="ofrecemos">
          <div className="text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[color:var(--color-rose)] text-[color:var(--color-terracotta)]">
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 11l-2-2a2 2 0 0 0-3 0L2 11" /><path d="M15 11l2-2a2 2 0 0 1 3 0l2 2" />
                <path d="M7 13l3 3a2 2 0 0 0 3 0l1-1" /><path d="M17 13l-3 3a2 2 0 0 1-3 0l-1-1" />
              </svg>
            </span>
            <h2 className="mt-4 text-2xl font-semibold text-slate-800">Lo que ofrecemos</h2>
            <p className="mt-2 text-sm text-slate-500">Apoyo concreto, humano y cercano.</p>
          </div>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {offers.map((offer, index) => (
              <div key={offer.title} className={`rounded-2xl border border-black/5 bg-white p-6 shadow-sm ${index === offers.length - 1 ? 'sm:col-span-2 sm:justify-self-center sm:max-w-md sm:w-full lg:col-span-1 lg:col-start-2' : ''}`}>
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[color:var(--color-stone)] text-[color:var(--color-terracotta)]">{offer.icon}</span>
                <p className="mt-4 text-base font-semibold text-[color:var(--color-terracotta)]">{offer.title}</p>
                <p className="mt-2 text-sm text-slate-600">{offer.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Reglas del grupo ── */}
        <section className="mt-20 border-t border-slate-100 pt-20" id="reglas">
          <div className="rounded-3xl bg-[color:var(--color-rose)] p-8 sm:p-12">
            <div className="text-center">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white text-[color:var(--color-terracotta)]">
                <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3l7 4v5c0 5-3.5 8.5-7 9-3.5-.5-7-4-7-9V7z" /><path d="M9 12l2 2 4-4" />
                </svg>
              </span>
              <h2 className="mt-4 text-2xl font-semibold text-slate-800">Reglas del grupo</h2>
              <p className="mt-2 text-sm text-[color:var(--color-terracotta)]">Cuidamos el respeto y la privacidad.</p>
            </div>
            <div className="mt-8 grid gap-5 sm:grid-cols-2">
              {rules.map((rule, i) => (
                <div key={rule} className={`flex items-center gap-3 rounded-2xl border border-black/5 bg-white p-5 text-sm text-slate-600 shadow-sm ${rules.length % 2 === 1 && i === rules.length - 1 ? 'sm:col-span-2 sm:max-w-xl sm:justify-self-center' : ''}`}>
                  <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-[color:var(--color-terracotta)]/30 text-[color:var(--color-terracotta)]">
                    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7" /></svg>
                  </span>
                  <span className="text-[color:var(--color-terracotta)]">{rule}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Como funciona ── */}
        <section className="mt-20 border-t border-slate-100 pt-20" id="como-funciona">
          <div className="text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[color:var(--color-rose)] text-[color:var(--color-terracotta)]">
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
              </svg>
            </span>
            <h2 className="mt-4 text-2xl font-semibold text-slate-800">Como funciona</h2>
          </div>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {steps.map((step) => (
              <div key={step.number} className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm flex flex-col items-center text-center">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[color:var(--color-terracotta)] text-white font-bold text-lg">{step.number}</span>
                <p className="mt-4 text-sm text-[color:var(--color-terracotta)] leading-relaxed">{step.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Listo para sumarte ── */}
        <section className="py-10">
          <div className="rounded-3xl border border-black/5 bg-white px-6 py-10 text-center shadow-sm sm:px-8">
            <h2 className="text-2xl font-semibold text-slate-800">Listo para sumarte a la comunidad?</h2>
            <p className="mt-3 text-sm text-slate-600">Completa la solicitud y nos ponemos en contacto muy pronto.</p>
            <Link to="/solicitar" className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-[color:var(--color-terracotta)] px-7 py-3 text-sm font-semibold text-white shadow-sm transition hover:brightness-95">
              Solicitar ingreso
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14" /><path d="M13 6l6 6-6 6" /></svg>
            </Link>
          </div>

          {/* ── Últimos anuncios ── */}
          {latestAnnouncements.length > 0 && (
            <div className="mt-10 rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--color-terracotta)]">Últimos anuncios</p>
                  <h3 className="mt-2 text-xl font-semibold text-slate-800">Novedades para la comunidad</h3>
                </div>
                <Link to="/anuncios" className="text-sm font-semibold text-[color:var(--color-terracotta)] underline">Ver todos los anuncios</Link>
              </div>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {latestAnnouncements.map(ann => (
                  <div key={ann.id} className="rounded-2xl border border-black/5 bg-[color:var(--color-rose)] p-5 shadow-sm">
                    <p className="text-xs text-slate-500">{formatDateOnly(ann.createdAt)}</p>
                    <p className="mt-2 text-base font-semibold text-slate-800">{ann.title}</p>
                    <p className="mt-2 text-sm text-slate-600">{getExcerpt(ann.summary, ann.body)}</p>
                    <Link to={`/anuncios/${ann.id}`} className="mt-4 inline-flex items-center justify-center rounded-full border border-[color:var(--color-terracotta)] px-4 py-2 text-xs font-semibold text-[color:var(--color-terracotta)] transition hover:bg-[color:var(--color-terracotta)] hover:text-white">Leer más</Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Último webinar ── */}
          {latestWebinar?.videoId && (
            <div className="mt-10 rounded-3xl border border-black/5 bg-[color:var(--color-rose)] p-6 shadow-sm">
              <div className="flex flex-col gap-6 md:flex-row md:items-center">
                <div className="w-full max-w-md overflow-hidden rounded-2xl border border-white/70 bg-white shadow-sm">
                  <div className="aspect-video w-full">
                    <img src={latestWebinarThumbnail} alt={latestWebinar.title} className="h-full w-full object-cover" />
                  </div>
                </div>
                <div className="flex flex-1 flex-col gap-3 text-left">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--color-terracotta)]">Último webinar</p>
                  <h3 className="text-xl font-semibold text-slate-800">{latestWebinar.title}</h3>
                  <p className="text-sm text-slate-600">{latestWebinar.description || 'Acompañamos a familias cuidadoras con charlas prácticas y contención.'}</p>
                  <p className="text-xs text-slate-500">Publicado {formatDate(latestWebinar.createdAt)}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-4">
                    <a href={latestWebinarLink} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center rounded-full bg-[color:var(--color-terracotta)] px-5 py-2 text-sm font-semibold text-white shadow-sm hover:brightness-95">Ver ahora</a>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
