import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { locationsApi, Location } from '../../api';

const EMPTY: Partial<Location> = { type: 'ZONA', name: '', description: '', whatsappUrl: '' };

export default function LocationsPage() {
  const qc = useQueryClient();
  const [form, setForm] = useState<Partial<Location>>(EMPTY);
  const [editing, setEditing] = useState<string | null>(null);
  const { data = [], isLoading } = useQuery({ queryKey: ['locations'], queryFn: locationsApi.list });

  const create = useMutation({
    mutationFn: locationsApi.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['locations'] }); setForm(EMPTY); },
  });
  const update = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Location> }) => locationsApi.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['locations'] }); setEditing(null); setForm(EMPTY); },
  });
  const remove = useMutation({
    mutationFn: locationsApi.delete,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['locations'] }),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) update.mutate({ id: editing, data: form });
    else create.mutate(form);
  };

  const startEdit = (loc: Location) => { setEditing(loc.id); setForm(loc); };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-foreground">Zonas / Provincias</h2>

      {/* Form */}
      <div className="bg-panel rounded-2xl border border-sun/20 p-5 shadow-sm">
        <h3 className="font-semibold text-foreground mb-4">{editing ? 'Editar ubicación' : 'Nueva ubicación'}</h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-muted mb-1 block">Tipo</label>
            <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-sun/40 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/30">
              <option value="ZONA">Zona</option>
              <option value="PROVINCIA">Provincia</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-muted mb-1 block">Nombre *</label>
            <input required value={form.name ?? ''} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-sun/40 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
              placeholder="Ej: Palermo, Zona Norte…" />
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs text-muted mb-1 block">Descripción (barrios que abarca, etc.)</label>
            <input value={form.description ?? ''} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-sun/40 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
              placeholder="Ej: Abarca Palermo, Villa Crespo y Chacarita" />
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs text-muted mb-1 block">Link de WhatsApp</label>
            <input value={form.whatsappUrl ?? ''} onChange={e => setForm(f => ({ ...f, whatsappUrl: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-sun/40 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
              placeholder="https://chat.whatsapp.com/…" />
          </div>
          <div className="sm:col-span-2 flex gap-2">
            <button type="submit" className="px-5 py-2 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent/90 transition">
              {editing ? 'Guardar cambios' : 'Agregar ubicación'}
            </button>
            {editing && <button type="button" onClick={() => { setEditing(null); setForm(EMPTY); }}
              className="px-5 py-2 rounded-lg border border-sun/40 text-sm text-muted hover:bg-stone transition">Cancelar</button>}
          </div>
        </form>
      </div>

      {/* Table */}
      <div className="bg-panel rounded-2xl border border-sun/20 shadow-sm overflow-hidden">
        {isLoading ? <p className="text-center py-8 text-muted">Cargando…</p> :
          <table className="w-full text-sm">
            <thead><tr className="border-b border-sun/20 text-left text-xs text-muted">
              <th className="px-4 py-3 font-medium">Tipo</th>
              <th className="px-4 py-3 font-medium">Nombre</th>
              <th className="px-4 py-3 font-medium hidden md:table-cell">Descripción</th>
              <th className="px-4 py-3 font-medium hidden lg:table-cell">WhatsApp</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr></thead>
            <tbody>
              {data.map((loc, i) => (
                <tr key={loc.id} className={`border-b border-sun/10 ${i % 2 === 0 ? '' : 'bg-stone/30'}`}>
                  <td className="px-4 py-3"><span className="text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent">{loc.type}</span></td>
                  <td className="px-4 py-3 font-medium text-foreground">{loc.name}</td>
                  <td className="px-4 py-3 text-muted text-xs hidden md:table-cell max-w-xs truncate">{loc.description || '—'}</td>
                  <td className="px-4 py-3 text-xs hidden lg:table-cell">
                    {loc.whatsappUrl ? <a href={loc.whatsappUrl} target="_blank" rel="noreferrer" className="text-accent hover:underline">Ver link</a> : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => startEdit(loc)} className="text-xs text-accent hover:underline">Editar</button>
                      <button onClick={() => remove.mutate(loc.id)} className="text-xs text-red-500 hover:underline">Eliminar</button>
                    </div>
                  </td>
                </tr>
              ))}
              {!data.length && <tr><td colSpan={5} className="text-center py-10 text-muted">Sin ubicaciones. Cargá la primera arriba.</td></tr>}
            </tbody>
          </table>
        }
      </div>
    </div>
  );
}
