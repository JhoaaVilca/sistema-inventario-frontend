import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Table, Button, Form, Row, Col, Alert, Card, Badge } from 'react-bootstrap';
import { ArrowLeft, User, Wallet } from 'lucide-react';
import creditoService from '../../servicios/creditoService';
import cajaService from '../../servicios/cajaService';

function DetalleCredito() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [credito, setCredito] = useState(null);
  const [monto, setMonto] = useState('');
  const [fechaPago, setFechaPago] = useState('');
  const [medioPago, setMedioPago] = useState('EFECTIVO');
  const [observacion, setObservacion] = useState('');
  const [msg, setMsg] = useState(null);

  const hoyISO = () => new Date().toISOString().slice(0, 10);

  const cargar = async () => {
    const resp = await creditoService.obtener(id);
    setCredito(resp);
    // Prefill: fecha = hoy, monto = saldo pendiente (si > 0)
    setFechaPago(hoyISO());
    const saldo = Number(resp?.saldoPendiente || 0);
    setMonto(saldo > 0 ? saldo.toFixed(2) : '');
  };

  useEffect(() => { cargar(); }, [id]);

  const registrarPago = async (e) => {
    e.preventDefault();
    try {
      // Obtener la caja abierta actual
      const estadoCaja = await cajaService.obtenerEstado();
      const idCaja = estadoCaja.caja?.idCaja || estadoCaja.caja?.id;
      
      if (!idCaja && medioPago === 'EFECTIVO') {
        setMsg({ 
          type: 'warning', 
          text: 'No hay una caja abierta. El pago se registrará pero no se reflejará en caja.' 
        });
      }

      await creditoService.registrarPago(
        id, 
        {
          fechaPago,
          monto: parseFloat(monto),
          medioPago,
          observacion,
        },
        idCaja // Pasar el ID de la caja al servicio
      );
      
      setMsg({ 
        type: 'success', 
        text: 'Pago registrado' + (idCaja ? ' y registrado en caja' : '') 
      });
      
      setMonto(''); 
      setObservacion('');
      setFechaPago(hoyISO());
      await cargar();
    } catch (err) {
      console.error('Error al registrar pago:', err);
      const text = err?.response?.data?.message || 'Error al registrar pago';
      setMsg({ type: 'danger', text });
    }
  };

  const formatearMoneda = (v) => new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(v || 0);
  const badgeEstado = (est) => {
    const map = { VIGENTE: 'primary', VENCIDO: 'danger', PAGADO: 'success', CANCELADO: 'secondary' };
    const variant = map[(est || '').toUpperCase()] || 'secondary';
    return <Badge bg={variant}>{est || '—'}</Badge>;
  };

  if (!credito) return <div className="container mt-3">Cargando...</div>;

  return (
    <div className="container mt-3">
      <div className="d-flex align-items-center mb-2">
        <Button variant="outline-secondary" size="sm" className="me-2" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} className="me-1" /> Volver
        </Button>
        <h4 className="mb-0">Crédito #{credito.idCredito}</h4>
      </div>
      {msg && <Alert variant={msg.type}>{msg.text}</Alert>}

      {/* Resumen */}
      <Card className="mb-3 border-0 shadow-sm">
        <Card.Header className="bg-white border-bottom">
          <div className="d-flex align-items-center gap-3">
            <div className="p-2 bg-primary bg-opacity-10 rounded-3">
              <Wallet size={20} className="text-primary" />
            </div>
            <div>
              <div className="d-flex align-items-center gap-2">
                <h6 className="mb-0">{credito.nombreCliente}</h6>
                <small className="text-muted">Inicio {credito.fechaInicio}</small>
              </div>
              <small className="text-muted">Vence: {credito.fechaVencimiento || '—'}</small>
            </div>
            <div className="ms-auto d-flex align-items-center gap-3">
              <div className="text-end">
                <small className="text-muted d-block">Total</small>
                <span className="fw-bold text-success">{formatearMoneda(credito.montoTotal)}</span>
              </div>
              <div className="text-end">
                <small className="text-muted d-block">Saldo</small>
                <span className={`fw-bold ${Number(credito.saldoPendiente||0) === 0 ? 'text-success' : 'text-danger'}`}>{formatearMoneda(credito.saldoPendiente)}</span>
              </div>
              {badgeEstado(credito.estado)}
            </div>
          </div>
        </Card.Header>
      </Card>

      {/* Pagos */}
      <Card className="border-0 shadow-sm mb-3">
        <Card.Header className="bg-white border-bottom">
          <div className="d-flex align-items-center">
            <h6 className="mb-0">Pagos</h6>
            <div className="ms-auto">
              {Number(credito.saldoPendiente||0) > 0 && (
                <a href="#form-pago" className="btn btn-sm btn-primary">Pagar</a>
              )}
            </div>
          </div>
        </Card.Header>
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover size="sm" className="mb-0">
              <thead className="table-light">
                <tr>
                  <th className="py-3">#</th>
                  <th className="py-3">Fecha</th>
                  <th className="py-3 text-end">Monto</th>
                  <th className="py-3">Medio</th>
                  <th className="py-3">Obs</th>
                </tr>
              </thead>
              <tbody>
                {credito.pagos && credito.pagos.length > 0 ? (
                  credito.pagos.map((p, idx) => (
                    <tr key={p.idPago || idx}>
                      <td>{idx + 1}</td>
                      <td>{p.fechaPago}</td>
                      <td className="text-end fw-medium">{formatearMoneda(p.monto)}</td>
                      <td>{p.medioPago}</td>
                      <td>{p.observacion}</td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={5} className="text-center text-muted py-3">Sin pagos</td></tr>
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {Number(credito.saldoPendiente||0) > 0 && (
        <Card className="border-0 shadow-sm" id="form-pago">
          <Card.Header className="bg-white border-bottom">
            <h6 className="mb-0">Pagar</h6>
          </Card.Header>
          <Card.Body>
            <Form onSubmit={registrarPago}>
              <Row className="g-3">
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Fecha de pago</Form.Label>
                    <Form.Control type="date" value={fechaPago} onChange={(e) => setFechaPago(e.target.value)} required />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Monto</Form.Label>
                    <Form.Control type="number" step="0.01" value={monto} onChange={(e) => setMonto(e.target.value)} required />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Medio</Form.Label>
                    <Form.Select value={medioPago} onChange={(e) => setMedioPago(e.target.value)}>
                      <option>EFECTIVO</option>
                      <option>TRANSFERENCIA</option>
                      <option>TARJETA</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Observación</Form.Label>
                    <Form.Control value={observacion} onChange={(e) => setObservacion(e.target.value)} />
                  </Form.Group>
                </Col>
              </Row>
              <div className="mt-3">
                <Button type="submit" variant="primary">Pagar</Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      )}
    </div>
  );
}

export default DetalleCredito;


