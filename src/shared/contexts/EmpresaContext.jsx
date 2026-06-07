import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import empresaService from '../../servicios/empresaService';

const EmpresaContext = createContext(null);

const DEFAULT_BRANDING = {
  nombreEmpresa: 'Sistema de Inventario',
  razonSocial: 'Sistema de Inventario',
  colorPrimario: '#1e3a5f',
  colorSecundario: '#2563eb',
  logoUrl: null,
};

function aplicarCssVariables(empresa) {
  const root = document.documentElement;
  const primario = empresa?.colorPrimario || DEFAULT_BRANDING.colorPrimario;
  const secundario = empresa?.colorSecundario || DEFAULT_BRANDING.colorSecundario;
  root.style.setProperty('--empresa-color-primario', primario);
  root.style.setProperty('--empresa-color-secundario', secundario);
  root.style.setProperty('--palette-blue-900', primario);
  root.style.setProperty('--palette-blue-800', primario);
  root.style.setProperty('--palette-blue-700', secundario);
  root.style.setProperty('--palette-blue-600', secundario);
  root.style.setProperty('--palette-blue-400', secundario);
}

export function EmpresaProvider({ children }) {
  const [empresa, setEmpresa] = useState(DEFAULT_BRANDING);
  const [cargando, setCargando] = useState(true);

  const cargarEmpresa = async () => {
    try {
      const data = await empresaService.obtenerConfiguracion();
      const branding = { ...DEFAULT_BRANDING, ...data };
      if (data?.logoUrl) {
        const base = import.meta.env.VITE_API_BASE_URL?.replace(/\/api\/?$/, '') || 'http://localhost:8080';
        branding.logoUrl = data.logoUrl.startsWith('http') ? data.logoUrl : `${base}${data.logoUrl}`;
      }
      setEmpresa(branding);
      aplicarCssVariables(branding);
      document.title = `${branding.nombreEmpresa || DEFAULT_BRANDING.nombreEmpresa} - Inventario`;
    } catch (error) {
      console.warn('No se pudo cargar branding de empresa, usando valores por defecto', error);
      aplicarCssVariables(DEFAULT_BRANDING);
      document.title = 'Sistema de Inventario';
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarEmpresa();
  }, []);

  const value = useMemo(() => ({
    empresa,
    cargando,
    recargarEmpresa: cargarEmpresa,
    nombreComercial: empresa?.nombreEmpresa || DEFAULT_BRANDING.nombreEmpresa,
    subtituloApp: `${empresa?.nombreEmpresa || DEFAULT_BRANDING.nombreEmpresa} • Inventario`,
  }), [empresa, cargando]);

  return (
    <EmpresaContext.Provider value={value}>
      {children}
    </EmpresaContext.Provider>
  );
}

export function useEmpresa() {
  const ctx = useContext(EmpresaContext);
  if (!ctx) {
    throw new Error('useEmpresa debe usarse dentro de EmpresaProvider');
  }
  return ctx;
}

export default EmpresaContext;
