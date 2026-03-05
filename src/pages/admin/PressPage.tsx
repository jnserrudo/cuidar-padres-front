import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pressApi, PressArticle } from '../../api';

const EMPTY: Partial<PressArticle> = { title: '', url: '', description: '', imageUrl: '' };

export default function PressPage() {
  const qc = useQueryClient();
  const [form, setForm] = useState<Partial<PressArticle>>(EMPTY);
  const [editing, setEditing] = useState<string | null>(null);
  const { data = [], isLoading } = useQuery({ queryKey: ['press'], queryFn: pressApi.list });

  const create = useMutation({ mutationFn: pressApi.create, onSuccess: () => { qc.invalidateQueries({ queryKey: ['press'] }); setForm(EMPTY); } });
  const upd = useMutation({ mutationFn: ({ id, data }: { id: string; data: Partial<PressArticle> }) => pressApi.update(id, data), onSuccess: () => { qc.invalidateQueries({ queryKey: ['press'] }); setEditing(null); setForm(EMPTY); } });
  const del = useMutation({ mutationFn: pressApi.delete, onSuccess: () => qc.invalidateQueries({ queryKey: ['press'] }) });

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); editing ? upd.mutate({ id: editing, data: form }) : create.mutate(form); };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-foreground">Prensa</h2>
      <div className="bg-panel rounded-2xl border border-sun/20 p-5 shadow-sm">
        <h3 className="font-semibold text-foreground mb-4">{editing ? 'Editar artículo' : 'Nuevo artículo'}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Título *" required value={form.title ?? ''} onChange={v => setForm(f => ({ ...f, title: v }))} />
            <Field label="URL del artículo *" required value={form.url ?? ''} onChange={v => setForm(f => ({ ...f, url: v }))} />
          </div>
          <Field label="Descripción *" required value={form.description ?? ''} onChange={v => setForm(f => ({ ...f, description: v }))} />
          <Field label="URL de imagen" value={form.imageUrl ?? ''} onChange={v => setForm(f => ({ ...f, imageUrl: v }))} placeholder="https://…" />
          <div className="flex gap-2">
            <button type="submit" className="px-5 py-2 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent/90 transition">{editing ? 'Guardar' : 'Agregar'}</button>
            {editing && <button type="button" onClick={() => { setEditing(null); setForm(EMPTY); }} className="px-5 py-2 rounded-lg border border-sun/40 text-sm text-muted hover:bg-stone transition">Cancelar</button>}
          </div>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading && <p className="text-muted col-span-3 text-center py-8">Cargando…</p>}
        {data.map(a => (
          <div key={a.id} className="bg-panel rounded-2xl border border-sun/20 shadow-sm overflow-hidden hover:shadow-md transition">
            {a.imageUrl && <img src={a.imageUrl} alt={a.title} className="w-full h-40 object-cover" />}
            <div className="p-4">
              <h4 className="font-semibold text-foreground mb-1 line-clamp-2">{a.title}</h4>
              <p className="text-xs text-muted line-clamp-2 mb-3">{a.description}</p>
              <div className="flex gap-2">
                <a href={a.url} target="_blank" rel="noreferrer" className="text-xs text-accent hover:underline">Ver artículo ↗</a>
                <button onClick={() => { setEditing(a.id); setForm(a); }} className="text-xs text-muted hover:underline ml-auto">Editar</button>
                <button onClick={() => del.mutate(a.id)} className="text-xs text-red-500 hover:underline">Eliminar</button>
              </div>
            </div>
          </div>
        ))}
        {!isLoading && !data.length && <p className="text-muted col-span-3 text-center py-10">Sin artículos de prensa.</p>}
      </div>
    </div>
  );
}

const Field = ({ label, value, onChange, required, placeholder }: { label: string; value: string; onChange: (v: string) => void; required?: boolean; placeholder?: string }) => (
  <div>
    <label className="text-xs text-muted mb-1 block">{label}</label>
    <input required={required} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      className="w-full px-3 py-2 rounded-lg border border-sun/40 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/30" />
  </div>
);
