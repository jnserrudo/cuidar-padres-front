import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { locationsApi, whatsappGroupsApi, Location } from '../../api';
import { useToast } from '../../components/ui/Toaster';

const EMPTY: Partial<Location> = { type: 'ZONA', name: '', description: '', whatsappUrl: '' };

export default function LocationsPage() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [form, setForm] = useState<Partial<Location>>(EMPTY);
  const [editing, setEditing] = useState<string | null>(null);
  const [assigningGroups, setAssigningGroups] = useState<string | null>(null);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  
  const { data = [], isLoading } = useQuery({ queryKey: ['locations'], queryFn: locationsApi.list });
  
  const { data: whatsappGroups = [] } = useQuery({ 
    queryKey: ['whatsapp-groups'], 
    queryFn: whatsappGroupsApi.list 
  });

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

  const assignGroups = useMutation({
    mutationFn: ({ locationId, groupIds }: { locationId: string; groupIds: string[] }) =>
      Promise.all(
        groupIds.map(groupId => 
          whatsappGroupsApi.assignLocations(groupId, [locationId])
        )
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['whatsapp-groups'] });
      setAssigningGroups(null);
      setSelectedGroups([]);
      toast.success('Grupos asignados correctamente');
    },
    onError: () => toast.error('Error al asignar grupos')
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) update.mutate({ id: editing, data: form });
    else create.mutate(form);
  };

  const startEdit = (loc: Location) => { setEditing(loc.id); setForm(loc); };

  const handleAssignGroups = (locationId: string) => {
    if (selectedGroups.length > 0) {
      assignGroups.mutate({ locationId, groupIds: selectedGroups });
    }
  };

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
              <th className="px-4 py-3 font-medium">Grupos WhatsApp</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr></thead>
            <tbody>
              {data.map((loc, i) => (
                <tr key={loc.id} className={`border-b border-sun/10 ${i % 2 === 0 ? '' : 'bg-stone/30'}`}>
                  <td className="px-4 py-3"><span className="text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent">{loc.type}</span></td>
                  <td className="px-4 py-3 font-medium text-foreground">{loc.name}</td>
                  <td className="px-4 py-3 text-muted text-xs hidden md:table-cell max-w-xs truncate">{loc.description || '—'}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setAssigningGroups(loc.id)}
                      className="text-xs text-purple-600 hover:underline"
                    >
                      Gestionar grupos
                    </button>
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

      {/* Assign Groups Modal */}
      {assigningGroups && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setAssigningGroups(null)}>
          <div className="bg-background rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-lg mb-4">Asignar Grupos de WhatsApp</h3>
            <p className="text-sm text-muted mb-4">
              Selecciona los grupos que quieras asignar a esta ubicación
            </p>
            <div className="space-y-2 max-h-60 overflow-y-auto mb-4">
              {whatsappGroups.map(group => (
                <label key={group.id} className="flex items-center gap-3 p-3 rounded-lg border border-sun/20 hover:bg-stone/30 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedGroups.includes(group.id)}
                    onChange={e => {
                      if (e.target.checked) {
                        setSelectedGroups([...selectedGroups, group.id]);
                      } else {
                        setSelectedGroups(selectedGroups.filter(id => id !== group.id));
                      }
                    }}
                    className="rounded"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{group.name}</p>
                    <p className="text-xs text-muted">
                      {group.currentSize}/{group.capacity} miembros
                    </p>
                  </div>
                </label>
              ))}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleAssignGroups(assigningGroups)}
                disabled={selectedGroups.length === 0}
                className="flex-1 px-4 py-2 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent/90 transition disabled:opacity-50"
              >
                Asignar {selectedGroups.length} grupo(s)
              </button>
              <button
                onClick={() => {
                  setAssigningGroups(null);
                  setSelectedGroups([]);
                }}
                className="px-4 py-2 rounded-lg border border-sun/40 text-sm text-muted hover:bg-stone transition"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
