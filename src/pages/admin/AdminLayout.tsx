import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useState } from 'react';

const navItems = [
  { to: '/admin/applications', label: 'Solicitudes', icon: '📋' },
  { to: '/admin/locations', label: 'Zonas / Provincias', icon: '📍', adminOnly: true },
  { to: '/admin/press', label: 'Prensa', icon: '📰', adminOnly: true },
  { to: '/admin/webinars', label: 'Webinars', icon: '🎥', adminOnly: true },
  { to: '/admin/announcements', label: 'Anuncios', icon: '📣', adminOnly: true },
  { to: '/admin/email-templates', label: 'Plantillas Email', icon: '✉️', adminOnly: true },
  { to: '/admin/users', label: 'Usuarios', icon: '👥', adminOnly: true },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const links = navItems.filter(n => !n.adminOnly || user?.role === 'ADMIN');

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 flex flex-col bg-panel border-r border-sun/20 shadow-sm transform transition-transform duration-200
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:z-auto`}>
        
        {/* Brand */}
        <div className="px-6 py-5 border-b border-sun/20">
          <h1 className="font-bold text-lg text-foreground leading-tight">Cuidar a<br />Nuestros Padres</h1>
          <p className="text-xs text-muted mt-0.5">Panel de administración</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {links.map(n => (
            <NavLink
              key={n.to}
              to={n.to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors
                ${isActive ? 'bg-accent/10 text-accent' : 'text-foreground hover:bg-stone hover:text-accent'}`
              }
            >
              <span className="text-base leading-none">{n.icon}</span>
              {n.label}
            </NavLink>
          ))}
        </nav>

        {/* User footer */}
        <div className="px-4 py-4 border-t border-sun/20">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent text-sm font-bold flex-shrink-0">
              {user?.nombre[0]}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{user?.nombre} {user?.apellido}</p>
              <p className="text-xs text-muted truncate">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full text-sm text-muted hover:text-red-500 text-left px-2 py-1.5 rounded-lg hover:bg-red-50 transition"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile topbar */}
        <header className="lg:hidden flex items-center gap-3 px-4 py-3 border-b border-sun/20 bg-panel sticky top-0 z-20">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg hover:bg-stone transition">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
          <span className="font-semibold text-foreground text-sm">Panel Admin</span>
        </header>
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
