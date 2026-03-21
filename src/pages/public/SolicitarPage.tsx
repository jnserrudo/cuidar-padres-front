import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { SiteHeader } from '../../components/public/SiteHeader';
import { SiteFooter } from '../../components/public/SiteFooter';
import { applicationsApi, locationsApi } from '../../api';
import { ApplicationInput, validateApplicationInput, necesidadesOptions } from '../../utils/validation';
import { apiErrorMessage } from '../../utils/uiMessages';
import { useToast } from '../../components/ui/Toaster';

type FieldErrors = Partial<Record<keyof ApplicationInput, string>>;

const getCrypto = () => typeof window !== 'undefined' ? window.crypto : null;
const createClientSubmissionId = () => {
  const crypto = getCrypto();
  if (crypto?.randomUUID) return crypto.randomUUID();
  if (crypto?.getRandomValues) {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const toHex = (v: number) => v.toString(16).padStart(2, '0');
    return [
      Array.from(bytes.slice(0, 4), toHex).join(''),
      Array.from(bytes.slice(4, 6), toHex).join(''),
      Array.from(bytes.slice(6, 8), toHex).join(''),
      Array.from(bytes.slice(8, 10), toHex).join(''),
      Array.from(bytes.slice(10, 16), toHex).join(''),
    ].join('-');
  }
  return `fallback-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const initialForm: ApplicationInput = {
  nombre: '', apellido: '', dni: '', email: '', telefono: '',
  provincia: '', zona_persona_cuidada: '', ofrece_servicios: '',
  tipo_servicio: '', necesidades: [], motivacion: '',
  acepta_normas: false, sugerencias: '',
};

const fieldClass = (hasError: boolean) =>
  `mt-2 w-full rounded-2xl border bg-white/80 px-4 py-3 text-sm shadow-sm outline-none transition focus:border-black/30 focus:ring-2 focus:ring-black/5 ${
    hasError ? 'border-rose-400 ring-2 ring-rose-100' : 'border-black/10'
  }`;

function ApplicationForm() {
  const navigate = useNavigate();
  const { toast, dismiss } = useToast();
  const [form, setForm] = useState<ApplicationInput>(initialForm);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [honeypot, setHoneypot] = useState('');
  const [clientSubmissionId] = useState(createClientSubmissionId);
  const loadingToastId = useRef<string | null>(null);

  // Cargar ubicaciones desde la API
  const { data: locations = [] } = useQuery({
    queryKey: ['locations'],
    queryFn: locationsApi.list
  });

  // Crear arrays dinámicos basados en la API
  const provincias = locations
    .filter(loc => loc.type === 'PROVINCIA')
    .map(loc => loc.name)
    .sort();

  const zonasPersonaCuidada = locations
    .filter(loc => loc.type === 'ZONA')
    .map(loc => loc.name)
    .sort();

  const mutation = useMutation({
    mutationFn: applicationsApi.create,
    onSuccess: () => {
      if (loadingToastId.current) dismiss(loadingToastId.current);
      toast.success('¡Solicitud enviada! Te contactaremos pronto.');
      setTimeout(() => navigate('/gracias'), 800);
    },
    onError: (err: any) => {
      if (loadingToastId.current) dismiss(loadingToastId.current);
      const msg = err?.response?.data?.detail || err?.response?.data?.error || err?.message || apiErrorMessage;
      toast.error(msg);
    }
  });

  const updateField = (name: keyof ApplicationInput, value: any) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
  };

  const sanitize = (values: ApplicationInput): ApplicationInput => ({
    ...values,
    nombre: values.nombre.trim(),
    apellido: values.apellido.trim(),
    dni: values.dni.trim(),
    email: values.email.trim(),
    telefono: values.telefono.trim(),
    provincia: values.provincia.trim(),
    zona_persona_cuidada: values.zona_persona_cuidada.trim(),
    ofrece_servicios: values.ofrece_servicios.trim(),
    tipo_servicio: values.tipo_servicio.trim(),
    motivacion: values.motivacion.trim(),
    sugerencias: values.sugerencias.trim(),
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (honeypot) return; // Spam

    const cleaned = sanitize(form);
    const validation = validateApplicationInput(cleaned);

    if (!validation.valid) {
      setErrors(validation.errors);
      toast.error('Revisá los campos marcados en rojo antes de continuar.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    loadingToastId.current = toast.loading('Enviando solicitud...');

    // Build payload with ONLY the camelCase field names that Prisma expects
    const payload = {
      nombre: cleaned.nombre,
      apellido: cleaned.apellido,
      dni: cleaned.dni,
      email: cleaned.email,
      telefono: cleaned.telefono,
      provincia: cleaned.provincia,
      zonaPersonaCuidada: cleaned.zona_persona_cuidada,
      ofreceServicios: cleaned.ofrece_servicios === 'si',
      tipoServicio: cleaned.ofrece_servicios === 'si' ? cleaned.tipo_servicio : '',
      necesidades: cleaned.necesidades,
      motivacion: cleaned.motivacion,
      aceptaNormas: cleaned.acepta_normas,
      sugerencias: cleaned.sugerencias,
      clientSubmissionId,
    };

    mutation.mutate(payload as any);
  };

  return (
    <form className="space-y-10" onSubmit={handleSubmit}>


      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label className="text-sm font-semibold" htmlFor="nombre">Nombre</label>
          <input id="nombre" type="text" value={form.nombre} onChange={(e) => updateField('nombre', e.target.value)} className={fieldClass(!!errors.nombre)} />
          {errors.nombre && <p className="mt-1 text-xs text-rose-600">{errors.nombre}</p>}
        </div>
        <div>
          <label className="text-sm font-semibold" htmlFor="apellido">Apellido</label>
          <input id="apellido" type="text" value={form.apellido} onChange={(e) => updateField('apellido', e.target.value)} className={fieldClass(!!errors.apellido)} />
          {errors.apellido && <p className="mt-1 text-xs text-rose-600">{errors.apellido}</p>}
        </div>
        <div>
          <label className="text-sm font-semibold" htmlFor="dni">DNI</label>
          <input id="dni" type="text" inputMode="numeric" value={form.dni} onChange={(e) => updateField('dni', e.target.value)} className={fieldClass(!!errors.dni)} />
          {errors.dni && <p className="mt-1 text-xs text-rose-600">{errors.dni}</p>}
        </div>
        <div>
          <label className="text-sm font-semibold" htmlFor="email">Email</label>
          <input id="email" type="email" value={form.email} onChange={(e) => updateField('email', e.target.value)} className={fieldClass(!!errors.email)} />
          {errors.email && <p className="mt-1 text-xs text-rose-600">{errors.email}</p>}
        </div>
        <div>
          <label className="text-sm font-semibold" htmlFor="telefono">Teléfono</label>
          <input id="telefono" type="tel" placeholder="+54 9 11 1234 5678" value={form.telefono} onChange={(e) => updateField('telefono', e.target.value)} className={fieldClass(!!errors.telefono)} />
          {errors.telefono && <p className="mt-1 text-xs text-rose-600">{errors.telefono}</p>}
        </div>
        <div>
          <label className="text-sm font-semibold" htmlFor="provincia">Zona en la que vivís</label>
          <select id="provincia" value={form.provincia} onChange={(e) => updateField('provincia', e.target.value)} className={fieldClass(!!errors.provincia)}>
            <option value="">Selecciona una opción</option>
            {provincias.map((prov) => <option key={prov} value={prov}>{prov}</option>)}
          </select>
          {errors.provincia && <p className="mt-1 text-xs text-rose-600">{errors.provincia}</p>}
        </div>
        <div>
          <label className="text-sm font-semibold" htmlFor="zona_persona_cuidada">Zona de la persona cuidada</label>
          <select id="zona_persona_cuidada" value={form.zona_persona_cuidada} onChange={(e) => updateField('zona_persona_cuidada', e.target.value)} className={fieldClass(!!errors.zona_persona_cuidada)}>
            <option value="">Selecciona una opción</option>
            {zonasPersonaCuidada.map((zona) => <option key={zona} value={zona}>{zona}</option>)}
          </select>
          {errors.zona_persona_cuidada && <p className="mt-1 text-xs text-rose-600">{errors.zona_persona_cuidada}</p>}
        </div>
        <div>
          <label className="text-sm font-semibold" htmlFor="ofrece_servicios">¿Ofrecés servicios?</label>
          <select id="ofrece_servicios" value={form.ofrece_servicios} onChange={(e) => { updateField('ofrece_servicios', e.target.value); if (e.target.value !== 'si') updateField('tipo_servicio', ''); }} className={fieldClass(!!errors.ofrece_servicios)}>
            <option value="">Seleccioná una opción</option>
            <option value="si">Sí</option>
            <option value="no">No</option>
          </select>
          {errors.ofrece_servicios && <p className="mt-1 text-xs text-rose-600">{errors.ofrece_servicios}</p>}
        </div>
        <div>
          <label className="text-sm font-semibold" htmlFor="tipo_servicio">¿Qué tipo de servicio?</label>
          <input id="tipo_servicio" type="text" value={form.tipo_servicio} onChange={(e) => updateField('tipo_servicio', e.target.value)} disabled={form.ofrece_servicios !== 'si'} className={fieldClass(!!errors.tipo_servicio)} />
          {errors.tipo_servicio && <p className="mt-1 text-xs text-rose-600">{errors.tipo_servicio}</p>}
        </div>
      </div>

      <div>
        <p className="text-sm font-semibold">Necesidades principales</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {necesidadesOptions.map((option) => {
            const checked = form.necesidades.includes(option.value as any);
            return (
              <label key={option.value} className={`flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm transition ${checked ? 'border-[color:var(--color-terracotta)] bg-white' : 'border-black/10 bg-white/70'}`}>
                <input type="checkbox" className="mt-1 h-4 w-4" checked={checked} onChange={(e) => {
                  const next = e.target.checked ? [...form.necesidades, option.value] : form.necesidades.filter((i) => i !== option.value);
                  updateField('necesidades', next as any);
                }} />
                <span>{option.label}</span>
              </label>
            );
          })}
        </div>
        {errors.necesidades && <p className="mt-2 text-xs text-rose-600">{errors.necesidades}</p>}
      </div>

      <div>
        <label className="text-sm font-semibold" htmlFor="motivacion">¿Qué te motiva a unirte a esta comunidad?</label>
        <textarea id="motivacion" rows={4} value={form.motivacion} onChange={(e) => updateField('motivacion', e.target.value)} className={fieldClass(!!errors.motivacion)} />
        {errors.motivacion && <p className="mt-1 text-xs text-rose-600">{errors.motivacion}</p>}
      </div>

      <div>
        <label className="text-sm font-semibold" htmlFor="sugerencias">Sugerencias (opcional)</label>
        <textarea id="sugerencias" rows={3} value={form.sugerencias} onChange={(e) => updateField('sugerencias', e.target.value)} className={fieldClass(!!errors.sugerencias)} />
      </div>

      <div className="space-y-3">
        <label className="flex items-start gap-3 text-sm">
          <input type="checkbox" checked={form.acepta_normas} onChange={(e) => updateField('acepta_normas', e.target.checked)} className="mt-1 h-4 w-4" />
          <span className="flex-1">
            <span className="font-semibold text-black">Acepto las normas de la comunidad</span>
          </span>
        </label>
        {errors.acepta_normas && <p className="text-xs text-rose-600">{errors.acepta_normas}</p>}
      </div>

      <div className="hidden">
        <input type="text" tabIndex={-1} value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
      </div>

      <button
        type="submit"
        disabled={mutation.isPending || !form.acepta_normas}
        className="inline-flex items-center justify-center gap-2 rounded-full bg-[color:var(--color-terracotta)] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:brightness-95 disabled:opacity-50 disabled:cursor-not-allowed"
        title={!form.acepta_normas ? 'Debés aceptar las normas para continuar' : ''}
      >
        {mutation.isPending ? (
          <>
            <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            Enviando...
          </>
        ) : 'Enviar solicitud'}
      </button>
    </form>
  );
}

export default function SolicitarPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader actionLabel="Volver al inicio" actionHref="/" />
      <main className="mx-auto w-full max-w-4xl px-6 pb-16">
        <div className="rounded-3xl border border-black/10 bg-white/80 p-8 shadow-sm fade-up mt-8">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--color-sage)]">Solicitud de ingreso</p>
            <h1 className="font-serif text-3xl">Sumate a la comunidad</h1>
            <p className="text-sm text-black/70">Completa este formulario y vamos a revisar tu solicitud.</p>
          </div>
          <div className="mt-6 rounded-2xl border border-black/10 bg-[color:var(--color-stone)] p-5 text-sm text-black/70">
            <p className="font-semibold text-black">Antes de enviar</p>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>Es un espacio de apoyo entre familiares cuidadores.</li>
              <li>No reemplaza el consejo médico o profesional.</li>
              <li>Revisamos cada solicitud para cuidar el clima del grupo.</li>
            </ul>
          </div>
          <div className="mt-8">
            <ApplicationForm />
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
