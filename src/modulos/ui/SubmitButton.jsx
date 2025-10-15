// SubmitButton: Botón reutilizable con soporte para loading y spinner de Bootstrap
// - Conserva el estilo actual (pill, sombra y pequeño hover)
// - Usa sólo clases Bootstrap + props

function SubmitButton({ children = 'Ingresar', loading = false, className = '', onMouseEnter, onMouseLeave }) {
  return (
    <button
      type="submit"
      className={`btn btn-light text-primary rounded-pill py-2 px-4 d-flex align-items-center justify-content-center ${className}`}
      disabled={loading}
      style={{ transition: 'transform .1s ease, box-shadow .2s ease' }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.02)';
        e.currentTarget.style.boxShadow = '0 .75rem 1.5rem rgba(0,0,0,.2)';
        onMouseEnter && onMouseEnter(e);
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.boxShadow = '0 .5rem 1rem rgba(0,0,0,.15)';
        onMouseLeave && onMouseLeave(e);
      }}
    >
      {loading && <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>}
      {children}
    </button>
  );
}

export default SubmitButton;
