import { Modal } from "react-bootstrap";
import { useMemo } from "react";

function LotesModal({ show, onHide, producto, lotes }) {
  const formatearFechaLocalDate = (str) => {
    if (!str) return "N/A";
    const [y, m, d] = str.split('-');
    if (!y || !m || !d) return str;
    return `${d}/${m}/${y}`;
  };

  const resumen = useMemo(() => {
    const total = lotes?.length || 0;
    const vencidos = (lotes || []).filter((l) => l.estaVencido).length;
    const proximos = (lotes || []).filter((l) => l.estaProximoAVencer).length;
    return { total, vencidos, proximos };
  }, [lotes]);

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          📦 Lotes de {producto?.nombreProducto}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {(lotes && lotes.length > 0) ? (
          <div>
            <div className="row mb-3">
              <div className="col-md-4">
                <div className="card bg-light">
                  <div className="card-body text-center">
                    <h5 className="card-title text-primary">{resumen.total}</h5>
                    <p className="card-text small">Total Lotes</p>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card bg-light">
                  <div className="card-body text-center">
                    <h5 className="card-title text-danger">{resumen.vencidos}</h5>
                    <p className="card-text small">Vencidos</p>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card bg-light">
                  <div className="card-body text-center">
                    <h5 className="card-title text-warning">{resumen.proximos}</h5>
                    <p className="card-text small">Próximos a Vencer</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="table-responsive">
              <table className="table table-hover">
                <thead className="table-dark">
                  <tr>
                    <th>Número de Lote</th>
                    <th>Fecha Entrada</th>
                    <th>Fecha Vencimiento</th>
                    <th>Cantidad</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {lotes.map((lote, index) => {
                    const fechaEntrada = lote.fechaEntrada;
                    const cantidad = lote.detalleEntrada?.cantidad;

                    return (
                      <tr key={lote.idLote || index}>
                        <td>
                          <span className="badge bg-secondary">
                            {lote.numeroLote}
                          </span>
                        </td>
                        <td>
                          {fechaEntrada ? formatearFechaLocalDate(fechaEntrada) : 'N/A'}
                        </td>
                        <td>
                          {lote.fechaVencimiento ? formatearFechaLocalDate(lote.fechaVencimiento) : 'Sin fecha'}
                        </td>
                        <td>
                          <span className="badge bg-info">{cantidad || 'N/A'}</span>
                        </td>
                        <td>
                          {lote.estaVencido ? (
                            <span className="badge bg-danger">🔴 Vencido</span>
                          ) : lote.estaProximoAVencer ? (
                            <span className="badge bg-warning">🟡 Próximo a Vencer</span>
                          ) : (
                            <span className="badge bg-success">🟢 Activo</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="text-center text-muted">No hay lotes para mostrar.</div>
        )}
      </Modal.Body>
    </Modal>
  );
}

export default LotesModal;
