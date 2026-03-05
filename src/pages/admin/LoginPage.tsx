import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(identifier, password);
      navigate('/admin');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        {/* Logo / Brand */}
        <div className="text-center mb-8 fade-up">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent/10 mb-4">
            <svg className="w-8 h-8 text-accent" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Cuidar a Nuestros Padres</h1>
          <p className="text-sm text-muted mt-1">Panel de administración</p>
        </div>

        {/* Card */}
        <div className="bg-panel rounded-2xl p-8 shadow-sm border border-sun/20 fade-up fade-up-delay-1">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5" htmlFor="identifier">
                Usuario o email
              </label>
              <input
                id="identifier"
                type="text"
                required
                value={identifier}
                onChange={e => setIdentifier(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-sun/40 bg-background text-foreground placeholder-muted/50 focus:outline-none focus:ring-2 focus:ring-accent/40 transition"
                placeholder="admin o admin@cuidarpadres.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5" htmlFor="password">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-sun/40 bg-background text-foreground placeholder-muted/50 focus:outline-none focus:ring-2 focus:ring-accent/40 transition"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-2.5 border border-red-200">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-accent text-white font-semibold hover:bg-accent/90 active:scale-[0.98] transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>

          <div className="mt-5 text-center">
            <a href="/admin/forgot-password" className="text-sm text-muted hover:text-accent transition">
              Olvidé mi contraseña
            </a>
          </div>
        </div>

        <p className="text-center text-xs text-muted mt-6">
          © {new Date().getFullYear()} Cuidar a Nuestros Padres
        </p>
      </div>
    </div>
  );
}
