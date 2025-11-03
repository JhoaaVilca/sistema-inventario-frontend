import { Modal, Button, Spinner } from "react-bootstrap";
import { useMemo, useEffect, useState, useCallback } from "react";
import { loteService } from "../../servicios/loteService";

function LotesModal({ show, onHide, producto, lotes, onChanged }) {
  const [lotesLocal, setLotesLocal] = useState(lotes || []);
  const [bajandoId, setBajandoId] = useState(null);

  useEffect(() => {
    // Al abrir/cambiar producto o estado de carga, sincronizar
    if (lotes === null) {
      setLotesLocal([]); // estado "cargando"
    } else {
      setLotesLocal(lotes || []);
    }
  }, [lotes, producto, show]);

  const formatearFechaLocalDate = (str) => {
    if (!str) return "N/A";
    const [y, m, d] = str.split('-');
    if (!y || !m || !d) return str;
    return `${d}/${m}/${y}`;
  };

  // Helpers para calcular estados a partir de la fecha (compatibles con flags del backend si existen)
  const parseLocalDate = (str) => {
    if (!str) return null;
    const [y, m, d] = str.split('-').map(Number);
    return new Date(y, (m || 1) - 1, d || 1);
  };

  const hoy = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }, []);

  const umbralDiasProximo = 15; // ventana para considerar "próximo a vencer"

  const esVencido = useCallback((lote) => {
    if (lote?.estaVencido === true) return true; // respetar flag si viene del backend
    const fv = parseLocalDate(lote?.fechaVencimiento);
    // Considerar vencido si la fecha de vencimiento es ANTES o IGUAL a hoy
    return fv ? fv <= hoy : false;
  }, [hoy]);

  const esProximo = useCallback((lote) => {
    if (lote?.estaProximoAVencer === true) return true; // respetar flag si viene del backend
    const fv = parseLocalDate(lote?.fechaVencimiento);
    if (!fv) return false;
    if (fv <= hoy) return false; // hoy o pasado ya se considera vencido
    const limite = new Date(hoy);
    limite.setDate(limite.getDate() + umbralDiasProximo);
    return fv <= limite;
  }, [hoy, umbralDiasProximo]);

  const resumen = useMemo(() => {
    const total = lotesLocal?.length || 0;
    const vencidos = (lotesLocal || []).filter((l) => esVencido(l)).length;
    const proximos = (lotesLocal || []).filter((l) => esProximo(l)).length;
    return { total, vencidos, proximos };
  }, [lotesLocal, esVencido, esProximo]);

  const refrescarLotes = async () => {
    if (!producto?.idProducto) return;
    try {
      const data = await loteService.obtenerLotesPorProducto(producto.idProducto);
      setLotesLocal(data || []);
    } catch (e) {
      console.error("Error al refrescar lotes:", e);
    }
  };
  const handleDarDeBaja = async (lote) => {
    const confirmar = window.confirm(`¿Dar de baja el lote ${lote.numeroLote}? Esta acción registrará merma y lo excluirá del stock.`);
    if (!confirmar) return;
    const observacion = window.prompt("Observación (opcional):", "Vencimiento");
    try {
      setBajandoId(lote.idLote);
      await loteService.darDeBaja(lote.idLote, { motivo: "Vencimiento", observacion: observacion || "" });
      await refrescarLotes();
      // Notificar al componente padre para refrescar panel de alertas
      if (typeof onChanged === 'function') {
        onChanged();
      }
      window.alert("Lote dado de baja correctamente.");
    } catch (e) {
      console.error("Error al dar de baja el lote:", e);
      window.alert("Ocurrió un error al dar de baja el lote.");
    } finally {
      setBajandoId(null);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          📦 Lotes de {producto?.nombreProducto}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {lotes === null ? (
          <div className="d-flex justify-content-center align-items-center py-5">
            <Spinner animation="border" role="status" className="me-2" /> Cargando lotes...
          </div>
        ) : (lotesLocal && lotesLocal.length > 0) ? (
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
                  {lotesLocal.map((lote, index) => {
                    const fechaEntrada = lote.fechaEntrada;
                    const cantidad = lote.detalleEntrada?.cantidad;
                    const vencido = esVencido(lote);
                    const proximo = !vencido && esProximo(lote);

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
                          <div className="d-flex align-items-center gap-2">
                            {vencido ? (
                              <span className="badge bg-danger">🔴 Vencido</span>
                            ) : proximo ? (
                              <span className="badge bg-warning">🟡 Próximo a Vencer</span>
                            ) : (
                              <span className="badge bg-success">🟢 Activo</span>
                            )}
                            {vencido && (
                              <Button variant="outline-danger" size="sm" onClick={() => handleDarDeBaja(lote)} disabled={bajandoId === lote.idLote}>
                                Dar de baja
                              </Button>
                            )}
                          </div>
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
