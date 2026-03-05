export function SiteFooter() {
  return (
    <footer className="mx-auto w-full max-w-5xl px-6 pb-12 text-xs text-black/60 bg-white pt-8">
      <div className="flex flex-col gap-5 border-t border-black/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <p>Cuidar a Nuestros Padres. Comunidad de apoyo para familiares cuidadores.</p>
          <p>Argentina - Contacto solo por email o WhatsApp</p>
        </div>

        <div className="flex flex-row items-center gap-3 text-black/50 mt-4 sm:mt-0 justify-center sm:justify-end">
          <span className="text-[10px] uppercase tracking-wider text-black/40 font-medium whitespace-nowrap">Desarrollado y diseñado por</span>
          <a href="#" className="group transition-opacity hover:opacity-80 flex items-center h-14 w-auto">
            <img 
              src="/logo-nuevo.png" 
              alt="JNSIX Desarrollo de Software" 
              className="h-full w-auto object-contain mix-blend-multiply opacity-60 group-hover:opacity-100 transition-opacity grayscale"
              title="JNSIX"
              style={{ filter: 'invert(1) contrast(1.2)' /* Esto invertirá tu logo negro actual para dejar texto negro sobre blanco mágico */ }}
            />
          </a>
        </div>
      </div>
    </footer>
  );
}
