import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { webinarsApi, announcementsApi, emailTemplatesApi, usersApi, Webinar, Announcement, EmailTemplate, User } from '../../api';

// ──────────────────────────────────────────────
// WEBINARS
// ──────────────────────────────────────────────
export function WebinarsPage() {
  const qc = useQueryClient();
  const [form, setForm] = useState<Partial<Webinar>>({ title: '', youtubeUrl: '', description: '' });
  const [editing, setEditing] = useState<string | null>(null);
  const { data = [] } = useQuery({ queryKey: ['webinars'], queryFn: webinarsApi.list });

  const create = useMutation({ mutationFn: webinarsApi.create, onSuccess: () => { qc.invalidateQueries({ queryKey: ['webinars'] }); setForm({ title: '', youtubeUrl: '', description: '' }); } });
  const upd = useMutation({ mutationFn: ({ id, data }: { id: string; data: Partial<Webinar> }) => webinarsApi.update(id, data), onSuccess: () => { qc.invalidateQueries({ queryKey: ['webinars'] }); setEditing(null); setForm({}); } });
  const del = useMutation({ mutationFn: webinarsApi.delete, onSuccess: () => qc.invalidateQueries({ queryKey: ['webinars'] }) });

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Webinars</h2>
      <FormCard title={editing ? 'Editar webinar' : 'Nuevo webinar'}>
        <form onSubmit={e => { e.preventDefault(); editing ? upd.mutate({ id: editing, data: form }) : create.mutate(form); }} className="space-y-4">
          <SmInput label="Título *" required value={form.title ?? ''} onChg={v => setForm(f => ({ ...f, title: v }))} />
          <SmInput label="URL YouTube *" required value={form.youtubeUrl ?? ''} onChg={v => setForm(f => ({ ...f, youtubeUrl: v }))} placeholder="https://www.youtube.com/watch?v=…" />
          <SmInput label="Invitados especiales" value={form.specialGuests ?? ''} onChg={v => setForm(f => ({ ...f, specialGuests: v }))} />
          <SmInput label="Descripción" value={form.description ?? ''} onChg={v => setForm(f => ({ ...f, description: v }))} />
          <BtnsRow editing={editing} onCancel={() => { setEditing(null); setForm({}); }} />
        </form>
      </FormCard>
      <DataTable cols={['Título', 'YouTube', 'Invitados', '']} rows={data.map(w => ({
        id: w.id, cells: [
          <span className="font-medium">{w.title}</span>,
          <a href={w.youtubeUrl} target="_blank" rel="noreferrer" className="text-accent text-xs hover:underline truncate block max-w-[180px]">{w.youtubeId || w.youtubeUrl}</a>,
          <span className="text-xs text-muted">{w.specialGuests || '—'}</span>,
          <ActionBtns onEdit={() => { setEditing(w.id); setForm(w); }} onDel={() => del.mutate(w.id)} />
        ]
      }))} />
    </div>
  );
}

// ──────────────────────────────────────────────
// ANNOUNCEMENTS
// ──────────────────────────────────────────────
export function AnnouncementsPage() {
  const qc = useQueryClient();
  const [form, setForm] = useState<Partial<Announcement>>({ title: '', summary: '', body: '', location: '' });
  const [editing, setEditing] = useState<string | null>(null);
  const { data = [] } = useQuery({ queryKey: ['announcements'], queryFn: announcementsApi.list });

  const create = useMutation({ mutationFn: announcementsApi.create, onSuccess: () => { qc.invalidateQueries({ queryKey: ['announcements'] }); setForm({ title: '', summary: '', body: '', location: '' }); } });
  const upd = useMutation({ mutationFn: ({ id, data }: { id: string; data: Partial<Announcement> }) => announcementsApi.update(id, data), onSuccess: () => { qc.invalidateQueries({ queryKey: ['announcements'] }); setEditing(null); setForm({}); } });
  const del = useMutation({ mutationFn: announcementsApi.delete, onSuccess: () => qc.invalidateQueries({ queryKey: ['announcements'] }) });

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Anuncios</h2>
      <FormCard title={editing ? 'Editar anuncio' : 'Nuevo anuncio'}>
        <form onSubmit={e => { e.preventDefault(); editing ? upd.mutate({ id: editing, data: form }) : create.mutate(form); }} className="space-y-4">
          <SmInput label="Título *" required value={form.title ?? ''} onChg={v => setForm(f => ({ ...f, title: v }))} />
          <SmInput label="Resumen" value={form.summary ?? ''} onChg={v => setForm(f => ({ ...f, summary: v }))} />
          <SmInput label="Ubicación" value={form.location ?? ''} onChg={v => setForm(f => ({ ...f, location: v }))} placeholder="Buenos Aires, Argentina" />
          <div>
            <label className="text-xs text-muted mb-1 block">Cuerpo del anuncio *</label>
            <textarea required rows={5} value={form.body ?? ''} onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-sun/40 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 resize-none" />
          </div>
          <BtnsRow editing={editing} onCancel={() => { setEditing(null); setForm({ title: '', summary: '', body: '', location: '' }); }} />
        </form>
      </FormCard>
      <DataTable cols={['Título', 'Resumen', 'Fecha', '']} rows={data.map(a => ({
        id: a.id, cells: [
          <span className="font-medium line-clamp-1">{a.title}</span>,
          <span className="text-xs text-muted line-clamp-1">{a.summary || '—'}</span>,
          <span className="text-xs text-muted">{new Date(a.createdAt).toLocaleDateString('es-AR')}</span>,
          <ActionBtns onEdit={() => { setEditing(a.id); setForm(a); }} onDel={() => del.mutate(a.id)} />
        ]
      }))} />
    </div>
  );
}

// ──────────────────────────────────────────────
// EMAIL TEMPLATES
// ──────────────────────────────────────────────
const MOTIVOS = ['APROBACION', 'RECHAZO', 'BIENVENIDA', 'INVITACION', 'RESET_PASSWORD'];

export function EmailTemplatesPage() {
  const qc = useQueryClient();
  const [form, setForm] = useState<EmailTemplate>({ motivo: MOTIVOS[0], subject: '', body: '' });
  const { data = [] } = useQuery({ queryKey: ['email-templates'], queryFn: emailTemplatesApi.list });
  const save = useMutation({ mutationFn: emailTemplatesApi.upsert, onSuccess: () => qc.invalidateQueries({ queryKey: ['email-templates'] }) });

  const loadTemplate = (motivo: string) => {
    const t = data.find(t => t.motivo === motivo);
    setForm(t ?? { motivo, subject: '', body: '' });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Plantillas de Email</h2>
      <p className="text-sm text-muted">Editá el asunto y contenido de los emails automáticos enviados por el sistema.</p>
      <div className="flex gap-2 flex-wrap">
        {MOTIVOS.map(m => (
          <button key={m} onClick={() => loadTemplate(m)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition ${form.motivo === m ? 'bg-accent text-white' : 'bg-panel border border-sun/30 text-foreground hover:bg-stone'}`}>
            {m}
          </button>
        ))}
      </div>
      <FormCard title={`Editando: ${form.motivo}`}>
        <form onSubmit={e => { e.preventDefault(); save.mutate(form); }} className="space-y-4">
          <SmInput label="Asunto *" required value={form.subject} onChg={v => setForm(f => ({ ...f, subject: v }))} />
          <div>
            <label className="text-xs text-muted mb-1 block">Cuerpo del email *</label>
            <textarea required rows={8} value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-sun/40 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 resize-none font-mono" />
            <p className="text-xs text-muted mt-1">Podés usar variables como {`{{nombre}}`}, {`{{apellido}}`}, {`{{link}}`}</p>
          </div>
          <button type="submit" className="px-5 py-2 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent/90 transition">
            {save.isPending ? 'Guardando…' : 'Guardar plantilla'}
          </button>
          {save.isSuccess && <span className="text-xs text-green-600 ml-3">✔ Guardada correctamente</span>}
        </form>
      </FormCard>
    </div>
  );
}

// ──────────────────────────────────────────────
// USERS
// ──────────────────────────────────────────────
export function UsersPage() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Partial<User> & { password: string }>({ username: '', email: '', password: '', nombre: '', apellido: '', role: 'MEMBER' });
  const { data = [] } = useQuery({ queryKey: ['users'], queryFn: usersApi.list });
  const del = useMutation({ mutationFn: usersApi.delete, onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }) });

  const ROLES = ['ADMIN', 'COMMUNITY_SUPERVISOR', 'MEMBER'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Usuarios</h2>
        <button onClick={() => setShowForm(s => !s)} className="px-4 py-2 rounded-xl bg-accent text-white text-sm font-medium hover:bg-accent/90 transition">
          {showForm ? 'Cancelar' : '+ Nuevo usuario'}
        </button>
      </div>

      {showForm && (
        <FormCard title="Nuevo usuario">
          <form onSubmit={e => { e.preventDefault(); /* handled via admin register */ }} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SmInput label="Username *" required value={form.username ?? ''} onChg={v => setForm(f => ({ ...f, username: v }))} />
            <SmInput label="Email *" required value={form.email ?? ''} onChg={v => setForm(f => ({ ...f, email: v }))} />
            <SmInput label="Nombre *" required value={form.nombre ?? ''} onChg={v => setForm(f => ({ ...f, nombre: v }))} />
            <SmInput label="Apellido *" required value={form.apellido ?? ''} onChg={v => setForm(f => ({ ...f, apellido: v }))} />
            <SmInput label="Contraseña *" required value={form.password} onChg={v => setForm(f => ({ ...f, password: v }))} />
            <div>
              <label className="text-xs text-muted mb-1 block">Rol</label>
              <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-sun/40 bg-background text-sm focus:outline-none">
                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            {form.role === 'COMMUNITY_SUPERVISOR' && (
              <SmInput label="Zona asignada" value={form.zonaAsignada ?? ''} onChg={v => setForm(f => ({ ...f, zonaAsignada: v }))} />
            )}
            <div className="sm:col-span-2">
              <button type="submit" className="px-5 py-2 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent/90 transition">Crear usuario</button>
            </div>
          </form>
        </FormCard>
      )}

      <DataTable cols={['Username', 'Nombre', 'Email', 'Rol', '']} rows={data.map(u => ({
        id: u.id, cells: [
          <span className="font-mono text-sm">{u.username}</span>,
          <span>{u.nombre} {u.apellido}</span>,
          <span className="text-muted text-xs">{u.email}</span>,
          <span className="text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent">{u.role}</span>,
          <button onClick={() => { if (confirm('¿Eliminar usuario?')) del.mutate(u.id); }} className="text-xs text-red-500 hover:underline">Eliminar</button>
        ]
      }))} />
    </div>
  );
}

// ──────────────────────────────────────────────
// SHARED MINI COMPONENTS
// ──────────────────────────────────────────────
const FormCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="bg-panel rounded-2xl border border-sun/20 p-5 shadow-sm">
    <h3 className="font-semibold text-foreground mb-4">{title}</h3>
    {children}
  </div>
);

const SmInput = ({ label, value, onChg, required, placeholder }: { label: string; value: string; onChg: (v: string) => void; required?: boolean; placeholder?: string }) => (
  <div>
    <label className="text-xs text-muted mb-1 block">{label}</label>
    <input required={required} value={value} onChange={e => onChg(e.target.value)} placeholder={placeholder}
      className="w-full px-3 py-2 rounded-lg border border-sun/40 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/30" />
  </div>
);

const BtnsRow = ({ editing, onCancel }: { editing: string | null; onCancel: () => void }) => (
  <div className="flex gap-2">
    <button type="submit" className="px-5 py-2 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent/90 transition">{editing ? 'Guardar' : 'Agregar'}</button>
    {editing && <button type="button" onClick={onCancel} className="px-5 py-2 rounded-lg border border-sun/40 text-sm text-muted hover:bg-stone transition">Cancelar</button>}
  </div>
);

const DataTable = ({ cols, rows }: { cols: string[]; rows: { id: string; cells: React.ReactNode[] }[] }) => (
  <div className="bg-panel rounded-2xl border border-sun/20 shadow-sm overflow-hidden">
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead><tr className="border-b border-sun/20 text-left text-xs text-muted">
          {cols.map(c => <th key={c} className="px-4 py-3 font-medium">{c}</th>)}
        </tr></thead>
        <tbody>
          {rows.length === 0 && <tr><td colSpan={cols.length} className="text-center py-10 text-muted">Sin registros</td></tr>}
          {rows.map((r, i) => (
            <tr key={r.id} className={`border-b border-sun/10 ${i % 2 === 0 ? '' : 'bg-stone/30'}`}>
              {r.cells.map((c, j) => <td key={j} className="px-4 py-3">{c}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const ActionBtns = ({ onEdit, onDel }: { onEdit: () => void; onDel: () => void }) => (
  <div className="flex gap-2">
    <button onClick={onEdit} className="text-xs text-accent hover:underline">Editar</button>
    <button onClick={onDel} className="text-xs text-red-500 hover:underline">Eliminar</button>
  </div>
);
