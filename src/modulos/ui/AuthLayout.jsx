// AuthLayout: Layout reutilizable para pantallas de autenticación
// - Renderiza un panel izquierdo (branding) con parallax opcional y una cuña diagonal
// - Renderiza un contenedor derecho para el formulario u otros children
// - Usa sólo Bootstrap + estilos inline

import { useEffect, useState } from 'react';

function AuthLayout({
  leftTitle = 'Bienvenido',
  leftSubtitle = 'Comercial Yoli • Inventario',
  leftBg = 'var(--palette-blue-900)',
  rightBg = 'var(--palette-blue-600)',
  wedge = true,
  children,
}) {
  const [mounted, setMounted] = useState(false);
  const [parallax, setParallax] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="min-vh-100 d-flex" style={{ background: 'var(--palette-blue-100)' }}>
      {/* Panel izquierdo */}
      <div
        className={`d-none d-lg-flex flex-column justify-content-center align-items-center fade ${mounted ? 'show' : ''}`}
        style={{ flex: '1 1 55%', background: leftBg, position: 'relative', transition: 'opacity .6s ease', overflow: 'hidden' }}
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const relX = (e.clientX - rect.left) / rect.width - 0.5;
          const relY = (e.clientY - rect.top) / rect.height - 0.5;
          setParallax({ x: relX, y: relY });
        }}
        onMouseLeave={() => setParallax({ x: 0, y: 0 })}
      >
        <div className="text-center px-4" style={{ fontFamily: 'Poppins, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif', transform: `translate3d(${parallax.x * 12}px, ${parallax.y * 12}px, 0)`, transition: 'transform .1s ease-out' }}>
          <h1 className="fw-bold text-white mb-2" style={{ letterSpacing: '.08rem', fontSize: '3rem', opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(8px)', transition: 'opacity .6s ease .15s, transform .6s ease .15s' }}>{leftTitle}</h1>
          <p className="mb-0 text-white-50" style={{ fontSize: '1.1rem', opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(10px)', transition: 'opacity .6s ease .28s, transform .6s ease .28s' }}>{leftSubtitle}</p>
        </div>
        {wedge && (
          <div
            className={`position-absolute top-0 end-0 h-100 d-none d-lg-block fade ${mounted ? 'show' : ''}`}
            style={{ width: 130, background: 'linear-gradient(180deg, var(--palette-blue-600), var(--palette-blue-400))', clipPath: 'polygon(40% 0, 100% 0, 60% 100%, 0 100%)', opacity: 0.9, transition: 'opacity .8s ease .15s, transform .08s ease-out', transform: `translate3d(${parallax.x * 6}px, ${parallax.y * 6}px, 0)` }}
          />
        )}
      </div>

      {/* Panel derecho */}
      <div className={`d-flex flex-column justify-content-center align-items-center w-100 fade ${mounted ? 'show' : ''}`} style={{ flex: '1 1 45%', background: rightBg, transition: 'opacity .6s ease' }}>
        <div className="w-100" style={{ maxWidth: 520 }}>
          {children}
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;
