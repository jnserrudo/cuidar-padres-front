import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useState } from 'react';

const navItems = [
  { to: '/admin/applications', label: 'Solicitudes', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg> },
  { to: '/admin/locations', label: 'Zonas', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>, adminOnly: true },
  { to: '/admin/press', label: 'Prensa', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>, adminOnly: true },
  { to: '/admin/webinars', label: 'Webinars', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>, adminOnly: true },
  { to: '/admin/announcements', label: 'Anuncios', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>, adminOnly: true },
  { to: '/admin/email-templates', label: 'Plantillas Email', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>, adminOnly: true },
  { to: '/admin/users', label: 'Usuarios', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>, adminOnly: true },
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

        {/* Sidebar Footer */}
        <div className="px-6 py-4 border-t border-sun/20">
          <div className="flex flex-col gap-2">
            <span className="text-[9px] uppercase tracking-wider text-muted font-medium">Desarrollado por</span>
            <a href="#" className="group transition-opacity hover:opacity-80 block h-10 w-auto">
              <img 
                src="/logo-nuevo.png" 
                alt="JNSIX" 
                className="h-full w-auto object-contain mix-blend-multiply opacity-50 group-hover:opacity-100 transition-opacity grayscale"
                style={{ filter: 'invert(1) contrast(1.2)' }}
              />
            </a>
            <p className="text-[10px] text-muted mt-1">© {new Date().getFullYear()}</p>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile topbar & Desktop topbar */}
        <header className="flex items-center justify-between px-4 py-3 border-b border-sun/20 bg-panel sticky top-0 z-20 h-16">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg hover:bg-stone transition lg:hidden">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <span className="font-semibold text-foreground text-sm lg:hidden">Panel Admin</span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end hidden sm:flex">
              <span className="text-sm font-medium text-foreground leading-none">{user?.nombre} {user?.apellido}</span>
              <span className="text-xs text-muted leading-tight">{user?.role}</span>
            </div>
            <button onClick={logout} className="text-xs font-semibold text-red-500 hover:text-white px-3 py-1.5 rounded-lg border border-red-500 hover:bg-red-500 transition">
              Cerrar sesión
            </button>
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
