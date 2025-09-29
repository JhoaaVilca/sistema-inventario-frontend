import React from 'react';

function Paginador({ page, totalPages, onChange, disabled }) {
    if (totalPages <= 1) {
        return null;
    }

    const current = page + 1; // mostrar 1-based

    const canPrev = page > 0 && !disabled;
    const canNext = page < totalPages - 1 && !disabled;

    const goTo = (p) => {
        if (p >= 0 && p < totalPages && !disabled) onChange(p);
    };

    // Construir un rango compacto de páginas (máx 5 visibles)
    const pages = [];
    const start = Math.max(1, current - 2);
    const end = Math.min(totalPages, start + 4);
    for (let i = start; i <= end; i++) pages.push(i);

    return (
        <div className="d-flex justify-content-center align-items-center mt-3 p-3 bg-light rounded">
            <div className="me-3">
                <small className="text-muted">
                    Página {current} de {totalPages} | Total: {totalPages} páginas
                </small>
            </div>
            <nav aria-label="Paginación">
                <ul className="pagination mb-0">
                    <li className={`page-item ${!canPrev ? 'disabled' : ''}`}>
                        <button className="page-link" onClick={() => goTo(0)} disabled={!canPrev}>
                            Primera
                        </button>
                    </li>
                    <li className={`page-item ${!canPrev ? 'disabled' : ''}`}>
                        <button className="page-link" onClick={() => goTo(page - 1)} disabled={!canPrev}>
                            Anterior
                        </button>
                    </li>
                    {pages.map((p) => (
                        <li key={p} className={`page-item ${p === current ? 'active' : ''}`}>
                            <button className="page-link" onClick={() => goTo(p - 1)} disabled={disabled}>
                                {p}
                            </button>
                        </li>
                    ))}
                    <li className={`page-item ${!canNext ? 'disabled' : ''}`}>
                        <button className="page-link" onClick={() => goTo(page + 1)} disabled={!canNext}>
                            Siguiente
                        </button>
                    </li>
                    <li className={`page-item ${!canNext ? 'disabled' : ''}`}>
                        <button className="page-link" onClick={() => goTo(totalPages - 1)} disabled={!canNext}>
                            Última
                        </button>
                    </li>
                </ul>
            </nav>
        </div>
    );
}

export default Paginador;


