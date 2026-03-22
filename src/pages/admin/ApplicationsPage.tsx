import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { applicationsApi, Application } from '../../api';
import { useToast } from '../../components/ui/Toaster';

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  NEW:          { label: 'Nueva',         color: 'bg-blue-100 text-blue-700' },
  IN_PROGRESS:  { label: 'En proceso',    color: 'bg-indigo-100 text-indigo-700' },
  NEEDS_REVIEW: { label: 'Revisar datos', color: 'bg-yellow-100 text-yellow-700' },
  APPROVED:     { label: 'Aprobada',      color: 'bg-green-100 text-green-700' },
  CONTACTADO:   { label: 'Contactada',    color: 'bg-orange-100 text-orange-700' },
  INVITE_SENT:  { label: 'Invitada',      color: 'bg-purple-100 text-purple-700' },
  MEMBER:       { label: 'Miembro',       color: 'bg-emerald-100 text-emerald-700' },
  REJECTED:     { label: 'Rechazada',     color: 'bg-red-100 text-red-700' },
  LEGACY:       { label: 'Histórica',     color: 'bg-gray-100 text-gray-600' },
};

const ALL_STATUSES = Object.keys(STATUS_LABELS);

export default function ApplicationsPage() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkStatus, setBulkStatus] = useState('APPROVED');
  const [detail, setDetail] = useState<Application | null>(null);

  const params: Record<string, string | number> = { page, limit: 20 };
  if (status) params.status = status;
  if (search) params.search = search;

  const { data, isLoading } = useQuery({
    queryKey: ['applications', params],
    queryFn: () => applicationsApi.list(params),
  });

  const bulkMutation = useMutation({
    mutationFn: () => applicationsApi.bulkUpdate([...selected], bulkStatus),
    onSuccess: () => { 
      qc.invalidateQueries({ queryKey: ['applications'] }); 
      setSelected(new Set()); 
      const statusLabel = STATUS_LABELS[bulkStatus]?.label || bulkStatus;
      toast.success(`✅ ${selected.size} solicitudes actualizadas a "${statusLabel}"`);
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.error || 'Error al actualizar solicitudes';
      toast.error(`❌ ${msg}`);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Application> }) =>
      applicationsApi.update(id, data),
    onSuccess: () => { 
      qc.invalidateQueries({ queryKey: ['applications'] }); 
      setDetail(null); 
      toast.success('✅ Solicitud actualizada correctamente');
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.error || 'Error al actualizar solicitud';
      toast.error(`❌ ${msg}`);
    }
  });

  const toggleSelect = (id: string) => {
    const s = new Set(selected);
    s.has(id) ? s.delete(id) : s.add(id);
    setSelected(s);
  };

  const toggleAll = () => {
    if (selected.size === (data?.data.length ?? 0)) setSelected(new Set());
    else setSelected(new Set(data?.data.map(a => a.id)));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div>
          <h2 className="text-xl font-bold text-foreground">Solicitudes</h2>
          <p className="text-sm text-muted">{data?.total ?? '…'} registros totales</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1">
          <input
            type="text"
            placeholder="Buscar por nombre, apellido o email…"
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            className="flex-1 px-3 py-2 rounded-lg border border-sun/40 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
          />
          <button type="submit" className="px-4 py-2 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent/90 transition">
            Buscar
          </button>
          {search && (
            <button type="button" onClick={() => { setSearch(''); setSearchInput(''); setPage(1); }}
              className="px-3 py-2 rounded-lg border border-sun/40 text-sm text-muted hover:bg-stone transition">
              ✕
            </button>
          )}
        </form>
        <select
          value={status}
          onChange={e => { setStatus(e.target.value); setPage(1); }}
          className="px-3 py-2 rounded-lg border border-sun/40 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
        >
          <option value="">Todos los estados</option>
          {ALL_STATUSES.map(s => (
            <option key={s} value={s}>{STATUS_LABELS[s]?.label ?? s}</option>
          ))}
        </select>
      </div>

      {/* Bulk actions */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 bg-accent/5 border border-accent/20 rounded-xl px-4 py-3 text-sm flex-wrap">
          <span className="font-medium text-accent">{selected.size} seleccionadas</span>
          <select
            value={bulkStatus}
            onChange={e => setBulkStatus(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-sun/40 bg-background text-sm"
          >
            {ALL_STATUSES.filter(s => s !== 'LEGACY').map(s => (
              <option key={s} value={s}>{STATUS_LABELS[s]?.label ?? s}</option>
            ))}
          </select>
          <button
            onClick={() => bulkMutation.mutate()}
            disabled={bulkMutation.isPending}
            className="px-4 py-1.5 rounded-lg bg-accent text-white font-medium hover:bg-accent/90 transition disabled:opacity-50"
          >
            {bulkMutation.isPending ? 'Aplicando…' : 'Aplicar a seleccionadas'}
          </button>
          <button onClick={() => setSelected(new Set())} className="text-muted hover:text-foreground transition ml-auto">
            Cancelar
          </button>
        </div>
      )}

      {/* Table */}
      <div className="bg-panel rounded-2xl border border-sun/20 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-sun/20 text-left text-xs text-muted">
                <th className="px-4 py-3">
                  <input type="checkbox" checked={selected.size === (data?.data.length ?? 0) && (data?.data.length ?? 0) > 0}
                    onChange={toggleAll} className="rounded" />
                </th>
                <th className="px-4 py-3 font-medium">Nombre</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium hidden md:table-cell">Zona</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 font-medium hidden lg:table-cell">Fecha</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={7} className="text-center py-12">
                    <div className="flex flex-col items-center justify-center">
                      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-accent mb-3"></div>
                      <p className="text-sm text-muted">Cargando solicitudes...</p>
                    </div>
                  </td>
                </tr>
              )}
              {!isLoading && !data?.data.length && (
                <tr><td colSpan={7} className="text-center py-12 text-muted">Sin resultados</td></tr>
              )}
              {data?.data.map((app, i) => {
                const st = STATUS_LABELS[app.status] ?? { label: app.status, color: 'bg-gray-100 text-gray-600' };
                return (
                  <tr key={app.id} className={`border-b border-sun/10 hover:bg-rose/40 transition-colors ${i % 2 === 0 ? '' : 'bg-stone/30'}`}>
                    <td className="px-4 py-3">
                      <input type="checkbox" checked={selected.has(app.id)} onChange={() => toggleSelect(app.id)} className="rounded" />
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-medium text-foreground">{app.nombre} {app.apellido}</span>
                      {app.dni && <span className="block text-xs text-muted">{app.dni}</span>}
                    </td>
                    <td className="px-4 py-3 text-muted">{app.email}</td>
                    <td className="px-4 py-3 text-muted hidden md:table-cell max-w-[160px] truncate">
                      {app.zonaPersonaCuidada || app.provincia || '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${st.color}`}>
                        {st.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted hidden lg:table-cell whitespace-nowrap">
                      {new Date(app.createdAt).toLocaleDateString('es-AR')}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setDetail(app)}
                        className="text-xs text-accent hover:underline"
                      >
                        Ver
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data && data.totalPages > 1 && (
          <div className="px-4 py-3 border-t border-sun/20 flex items-center justify-between text-sm text-muted">
            <span>Página {data.page} de {data.totalPages} — {data.total} resultados</span>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="px-3 py-1.5 rounded-lg border border-sun/30 hover:bg-stone transition disabled:opacity-40">
                ← Anterior
              </button>
              <button onClick={() => setPage(p => Math.min(data.totalPages, p + 1))} disabled={page === data.totalPages}
                className="px-3 py-1.5 rounded-lg border border-sun/30 hover:bg-stone transition disabled:opacity-40">
                Siguiente →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail drawer */}
      {detail && (
        <div className="fixed inset-0 z-50 flex" onClick={() => setDetail(null)}>
          <div className="flex-1 bg-black/20" />
          <div className="w-full max-w-lg bg-background shadow-2xl overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-sun/20 flex items-center justify-between sticky top-0 bg-background z-10">
              <h3 className="font-bold text-foreground text-lg">{detail.nombre} {detail.apellido}</h3>
              <button onClick={() => setDetail(null)} className="text-muted hover:text-foreground text-xl leading-none">✕</button>
            </div>
            <div className="px-6 py-5 space-y-4 text-sm">
              <Row label="Email" value={detail.email} />
              <Row label="Teléfono" value={detail.telefono} />
              <Row label="DNI" value={detail.dni} />
              <Row label="Provincia" value={detail.provincia} />
              <Row label="Zona persona cuidada" value={detail.zonaPersonaCuidada} />
              <Row label="Estado" value={<span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_LABELS[detail.status]?.color ?? 'bg-gray-100'}`}>{STATUS_LABELS[detail.status]?.label ?? detail.status}</span>} />
              <Row label="Necesidades" value={detail.necesidades?.join(', ')} />
              <Row label="Motivación" value={detail.motivacion} />
              <Row label="Sugerencias" value={detail.sugerencias} />
              <Row label="Notas admin" value={detail.adminNotes} />
              <Row label="Fecha de solicitud" value={new Date(detail.createdAt).toLocaleString('es-AR')} />
              {detail.approvedAt && <Row label="Aprobada" value={new Date(detail.approvedAt).toLocaleString('es-AR')} />}
              {detail.rejectedAt && <Row label="Rechazada" value={new Date(detail.rejectedAt).toLocaleString('es-AR')} />}
              {detail.inviteSentAt && <Row label="Invitación enviada" value={new Date(detail.inviteSentAt).toLocaleString('es-AR')} />}

              {/* Quick status change */}
              <div className="pt-4 border-t border-sun/20">
                <p className="font-medium text-foreground mb-2">Cambiar estado</p>
                <div className="flex gap-2 flex-wrap">
                  {ALL_STATUSES.filter(s => s !== 'LEGACY' && s !== detail.status).map(s => (
                    <button
                      key={s}
                      onClick={() => updateMutation.mutate({ id: detail.id, data: { status: s } })}
                      className={`px-3 py-1.5 text-xs rounded-lg font-medium transition ${STATUS_LABELS[s]?.color ?? 'bg-gray-100 text-gray-700'} hover:opacity-80`}
                    >
                      → {STATUS_LABELS[s]?.label ?? s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const Row = ({ label, value }: { label: string; value?: React.ReactNode }) =>
  value ? (
    <div>
      <span className="text-muted block text-xs mb-0.5">{label}</span>
      <span className="text-foreground">{value}</span>
    </div>
  ) : null;
