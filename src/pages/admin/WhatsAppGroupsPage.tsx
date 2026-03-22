import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { whatsappGroupsApi, WhatsAppGroup } from '../../api';
import { useToast } from '../../components/ui/Toaster';

export default function WhatsAppGroupsPage() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [showBulkUpdate, setShowBulkUpdate] = useState(false);
  
  const [form, setForm] = useState<Partial<WhatsAppGroup>>({
    name: '',
    url: '',
    capacity: 1000,
    currentSize: 0,
    notes: ''
  });

  const { data: groups = [], isLoading } = useQuery({
    queryKey: ['whatsapp-groups'],
    queryFn: whatsappGroupsApi.list
  });

  const createMutation = useMutation({
    mutationFn: whatsappGroupsApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['whatsapp-groups'] });
      resetForm();
      toast.success('Grupo creado correctamente');
    },
    onError: () => toast.error('Error al crear grupo')
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<WhatsAppGroup> }) =>
      whatsappGroupsApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['whatsapp-groups'] });
      resetForm();
      toast.success('Grupo actualizado correctamente');
    },
    onError: () => toast.error('Error al actualizar grupo')
  });

  const deleteMutation = useMutation({
    mutationFn: whatsappGroupsApi.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['whatsapp-groups'] });
      toast.success('Grupo desactivado correctamente');
    },
    onError: () => toast.error('Error al desactivar grupo')
  });

  const bulkUpdateMutation = useMutation({
    mutationFn: ({ groupId, newUrl }: { groupId: string; newUrl: string }) =>
      whatsappGroupsApi.bulkUpdateUrl(groupId, newUrl),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['whatsapp-groups'] });
      toast.success(`URL actualizada. ${data.affectedLocations} ubicaciones afectadas`);
      setShowBulkUpdate(false);
      setSelectedGroup(null);
      setForm({ name: '', url: '', capacity: 1000, currentSize: 0, notes: '' });
    },
    onError: () => toast.error('Error al actualizar URL')
  });

  const resetForm = () => {
    setForm({ name: '', url: '', capacity: 1000, currentSize: 0, notes: '' });
    setShowForm(false);
    setEditingId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: form });
    } else {
      createMutation.mutate(form);
    }
  };

  const startEdit = (group: WhatsAppGroup) => {
    setForm(group);
    setEditingId(group.id);
    setShowForm(true);
  };

  const handleBulkUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedGroup && form.url) {
      bulkUpdateMutation.mutate({ groupId: selectedGroup, newUrl: form.url });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Grupos de WhatsApp</h2>
          <p className="text-sm text-muted mt-1">
            Gestiona los grupos de WhatsApp y asígnalos a ubicaciones
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowBulkUpdate(!showBulkUpdate)}
            className="px-4 py-2 rounded-xl bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 transition"
          >
            Actualizar URL Masivamente
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 rounded-xl bg-accent text-white text-sm font-medium hover:bg-accent/90 transition"
          >
            {showForm ? 'Cancelar' : '+ Nuevo Grupo'}
          </button>
        </div>
      </div>

      {/* Bulk Update Form */}
      {showBulkUpdate && (
        <div className="bg-purple-50 border border-purple-200 rounded-2xl p-5">
          <h3 className="font-semibold text-foreground mb-4">
            🔄 Actualización Masiva de URL
          </h3>
          <p className="text-sm text-muted mb-4">
            Selecciona un grupo y actualiza su URL. Todas las ubicaciones asignadas a este grupo se actualizarán automáticamente.
          </p>
          <form onSubmit={handleBulkUpdate} className="space-y-4">
            <div>
              <label className="text-xs text-muted mb-1 block">Grupo a actualizar *</label>
              <select
                required
                value={selectedGroup || ''}
                onChange={e => setSelectedGroup(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-sun/40 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Selecciona un grupo</option>
                {groups.map(g => (
                  <option key={g.id} value={g.id}>
                    {g.name} ({g.currentSize}/{g.capacity})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted mb-1 block">Nueva URL *</label>
              <input
                required
                type="url"
                value={form.url || ''}
                onChange={e => setForm(f => ({ ...f, url: e.target.value }))}
                placeholder="https://chat.whatsapp.com/..."
                className="w-full px-3 py-2 rounded-lg border border-sun/40 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={bulkUpdateMutation.isPending}
                className="px-5 py-2 rounded-lg bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 transition disabled:opacity-50"
              >
                {bulkUpdateMutation.isPending ? 'Actualizando...' : 'Actualizar URL'}
              </button>
              <button
                type="button"
                onClick={() => setShowBulkUpdate(false)}
                className="px-5 py-2 rounded-lg border border-sun/40 text-sm text-muted hover:bg-stone transition"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Create/Edit Form */}
      {showForm && (
        <div className="bg-panel rounded-2xl border border-sun/20 p-5 shadow-sm">
          <h3 className="font-semibold text-foreground mb-4">
            {editingId ? 'Editar Grupo' : 'Nuevo Grupo de WhatsApp'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-muted mb-1 block">Nombre del grupo *</label>
                <input
                  required
                  value={form.name || ''}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="GBA Zona Norte - Grupo 1"
                  className="w-full px-3 py-2 rounded-lg border border-sun/40 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
                />
              </div>
              <div>
                <label className="text-xs text-muted mb-1 block">URL de WhatsApp *</label>
                <input
                  required
                  type="url"
                  value={form.url || ''}
                  onChange={e => setForm(f => ({ ...f, url: e.target.value }))}
                  placeholder="https://chat.whatsapp.com/..."
                  className="w-full px-3 py-2 rounded-lg border border-sun/40 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
                />
              </div>
              <div>
                <label className="text-xs text-muted mb-1 block">
                  Capacidad máxima (límite de WhatsApp: 1000)
                </label>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={form.capacity || 1000}
                  onChange={e => setForm(f => ({ ...f, capacity: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 rounded-lg border border-sun/40 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
                />
              </div>
              <div>
                <label className="text-xs text-muted mb-1 block">
                  Miembros actuales (aproximado - actualizar manualmente)
                </label>
                <input
                  type="number"
                  min="0"
                  value={form.currentSize || 0}
                  onChange={e => setForm(f => ({ ...f, currentSize: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 rounded-lg border border-sun/40 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
                  placeholder="Ej: 250"
                />
                <p className="text-[10px] text-muted mt-1">
                  ⚠️ Este valor es manual. Las personas pueden sumarse o salir del grupo en cualquier momento.
                </p>
              </div>
            </div>
            <div>
              <label className="text-xs text-muted mb-1 block">Notas (opcional)</label>
              <textarea
                rows={3}
                value={form.notes || ''}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                placeholder="Notas adicionales sobre este grupo..."
                className="w-full px-3 py-2 rounded-lg border border-sun/40 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 resize-none"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="px-5 py-2 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent/90 transition disabled:opacity-50"
              >
                {editingId ? 'Guardar Cambios' : 'Crear Grupo'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-5 py-2 rounded-lg border border-sun/40 text-sm text-muted hover:bg-stone transition"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Groups List */}
      <div className="bg-panel rounded-2xl border border-sun/20 shadow-sm overflow-hidden">
        {isLoading ? (
          <p className="text-center py-8 text-muted">Cargando grupos...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-sun/20 text-left text-xs text-muted">
                  <th className="px-4 py-3 font-medium">Nombre</th>
                  <th className="px-4 py-3 font-medium">URL</th>
                  <th className="px-4 py-3 font-medium">Capacidad</th>
                  <th className="px-4 py-3 font-medium">Estado</th>
                  <th className="px-4 py-3 font-medium">Creado</th>
                  <th className="px-4 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {!groups.length && (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-muted">
                      No hay grupos creados. Crea el primero arriba.
                    </td>
                  </tr>
                )}
                {groups.map((group, i) => {
                  const percentage = (group.currentSize / group.capacity) * 100;
                  const isFull = percentage >= 100;
                  const isAlmostFull = percentage >= 80;
                  
                  return (
                    <tr
                      key={group.id}
                      className={`border-b border-sun/10 hover:bg-rose/40 transition-colors ${
                        i % 2 === 0 ? '' : 'bg-stone/30'
                      }`}
                    >
                      <td className="px-4 py-3">
                        <span className="font-medium text-foreground">{group.name}</span>
                        {group.notes && (
                          <p className="text-xs text-muted mt-1 line-clamp-1">{group.notes}</p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <a
                          href={group.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-accent text-xs hover:underline truncate block max-w-[200px]"
                        >
                          {group.url}
                        </a>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs">
                            {group.currentSize} / {group.capacity}
                          </span>
                          <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all ${
                                isFull
                                  ? 'bg-red-500'
                                  : isAlmostFull
                                  ? 'bg-yellow-500'
                                  : 'bg-green-500'
                              }`}
                              style={{ width: `${Math.min(percentage, 100)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                            group.isActive
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {group.isActive ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted text-xs">
                        {new Date(group.createdAt).toLocaleDateString('es-AR')}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => startEdit(group)}
                            className="text-xs text-accent hover:underline"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('¿Desactivar este grupo?')) {
                                deleteMutation.mutate(group.id);
                              }
                            }}
                            className="text-xs text-red-500 hover:underline"
                          >
                            Desactivar
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
        <h4 className="font-semibold text-blue-900 mb-2">💡 Cómo funciona</h4>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>Crea grupos de WhatsApp con su URL correspondiente</li>
          <li>Asigna ubicaciones a cada grupo desde la página de Ubicaciones</li>
          <li>Usa "Actualizar URL Masivamente" para cambiar la URL de un grupo y actualizar todas sus ubicaciones automáticamente</li>
          <li>Controla la capacidad de cada grupo para saber cuándo crear uno nuevo</li>
        </ul>
      </div>
    </div>
  );
}
