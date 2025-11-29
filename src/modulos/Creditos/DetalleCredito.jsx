import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Table, Button, Form, Row, Col, Alert, Card, Badge, ProgressBar, Toast, ToastContainer } from 'react-bootstrap';
import { ArrowLeft, User, Wallet, Calendar, CreditCard, CheckCircle, AlertCircle, Clock, TrendingUp, FileText } from 'lucide-react';
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
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const hoyISO = () => new Date().toISOString().slice(0, 10);

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      let resp = await creditoService.obtener(id);
      // Ordenar pagos por fecha (más recientes primero)
      if (resp && Array.isArray(resp.pagos)) {
        resp = { ...resp, pagos: [...resp.pagos].sort((a, b) => {
          const da = new Date(a?.fechaPago || 0);
          const db = new Date(b?.fechaPago || 0);
          return db - da; // descendente
        }) };
      }
      setCredito(resp);
      // Prefill: fecha = hoy, monto = saldo pendiente (si > 0)
      setFechaPago(hoyISO());
      const saldo = Number(resp?.saldoPendiente || 0);
      setMonto(saldo > 0 ? saldo.toFixed(2) : '');
    } catch (error) {
      console.error('Error al cargar crédito:', error);
      setMsg({ type: 'danger', text: 'Error al cargar el crédito' });
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { cargar(); }, [cargar]);

  const registrarPago = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    
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
        idCaja
      );

      setShowToast(true);
      setMsg({
        type: 'success',
        text: 'Pago registrado exitosamente' + (idCaja ? ' y registrado en caja' : '')
      });

      setMonto('');
      setObservacion('');
      setFechaPago(hoyISO());
      await cargar();
    } catch (err) {
      console.error('Error al registrar pago:', err);
      const text = err?.response?.data?.message || 'Error al registrar pago';
      setMsg({ type: 'danger', text });
    } finally {
      setLoading(false);
    }
  };

  const formatearMoneda = (v) => new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(v || 0);
  
  const badgeEstado = (est) => {
    const map = { 
      VIGENTE: { bg: 'primary', icon: <Clock size={14} className="me-1" /> }, 
      VENCIDO: { bg: 'danger', icon: <AlertCircle size={14} className="me-1" /> }, 
      PAGADO: { bg: 'success', icon: <CheckCircle size={14} className="me-1" /> }, 
      CANCELADO: { bg: 'secondary', icon: null } 
    };
    const config = map[(est || '').toUpperCase()] || { bg: 'secondary', icon: null };
    return (
      <Badge bg={config.bg} className="d-flex align-items-center px-3 py-2">
        {config.icon}
        {est || '—'}
      </Badge>
    );
  };

  const calcularPorcentajePagado = (total, saldo) => {
    if (!total || total === 0) return 0;
    return ((total - saldo) / total) * 100;
  };

  const esVencido = (fechaVencimiento) => {
    if (!fechaVencimiento) return false;
    return new Date(fechaVencimiento) < new Date();
  };

  if (loading && !credito) {
    return (
      <div className="container mt-4">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-3 text-muted">Cargando información del crédito...</p>
        </div>
      </div>
    );
  }

  if (!credito) {
    return (
      <div className="container mt-4">
        <Alert variant="danger">
          <AlertCircle size={20} className="me-2" />
          No se pudo cargar la información del crédito
        </Alert>
        <Button variant="outline-primary" onClick={() => navigate(-1)} className="mt-3">
          <ArrowLeft size={16} className="me-1" />
          Volver
        </Button>
      </div>
    );
  }

  const porcentajePagado = calcularPorcentajePagado(credito.montoTotal, credito.saldoPendiente);
  const saldoPendiente = Number(credito.saldoPendiente || 0);
  const vencido = esVencido(credito.fechaVencimiento);

  return (
    <div className="container mt-4">
      {/* Header mejorado */}
      <div className="d-flex align-items-center gap-3 mb-4">
        <Button 
          variant="outline-secondary" 
          onClick={() => navigate(-1)}
          className="d-flex align-items-center"
        >
          <ArrowLeft size={18} className="me-1" />
          Volver
        </Button>
        <div className="flex-grow-1">
          <h3 className="mb-0 fw-bold">Crédito #{credito.idCredito}</h3>
          <small className="text-muted">Detalle y gestión de pagos</small>
        </div>
        {badgeEstado(credito.estado)}
      </div>

      {/* Mensajes */}
      {msg && (
        <Alert variant={msg.type} className="d-flex align-items-center">
          {msg.type === 'success' && <CheckCircle size={20} className="me-2" />}
          {msg.type === 'danger' && <AlertCircle size={20} className="me-2" />}
          {msg.type === 'warning' && <AlertCircle size={20} className="me-2" />}
          {msg.text}
        </Alert>
      )}

      {/* Resumen mejorado */}
      <Card className="mb-4 border-0 shadow-sm">
        <Card.Header className="bg-white border-0 pb-0">
          <div className="d-flex align-items-center gap-3 mb-3">
            <div className="p-3 bg-primary bg-opacity-10 rounded-4">
              <Wallet size={28} className="text-primary" />
            </div>
            <div className="flex-grow-1">
              <div className="d-flex align-items-center gap-2 flex-wrap">
                <h5 className="mb-0 fw-bold">{credito.nombreCliente}</h5>
                <Badge bg="light" text="dark" className="px-2 py-1">
                  ID: {credito.idCredito}
                </Badge>
              </div>
              <div className="d-flex align-items-center gap-3 mt-2 flex-wrap">
                <small className="text-muted d-flex align-items-center">
                  <Calendar size={14} className="me-1" />
                  Inicio: {credito.fechaInicio}
                </small>
                {credito.fechaVencimiento && (
                  <small className={vencido && saldoPendiente > 0 ? 'text-danger fw-bold d-flex align-items-center' : 'text-muted d-flex align-items-center'}>
                    <Clock size={14} className="me-1" />
                    Vence: {credito.fechaVencimiento}
                    {vencido && saldoPendiente > 0 && (
                      <Badge bg="danger" className="ms-2">Vencido</Badge>
                    )}
                  </small>
                )}
              </div>
            </div>
          </div>
        </Card.Header>
        <Card.Body>
          {/* Estadísticas de montos */}
          <Row className="g-3 mb-3">
            <Col md={4}>
              <Card className="border-0" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                <Card.Body className="text-white">
                  <div className="d-flex align-items-center justify-content-between">
                    <div>
                      <small className="opacity-75">Monto Total</small>
                      <h4 className="mb-0 fw-bold">{formatearMoneda(credito.montoTotal)}</h4>
                    </div>
                    <Wallet size={32} className="opacity-50" />
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="border-0" style={{ background: saldoPendiente > 0 ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' : 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
                <Card.Body className="text-white">
                  <div className="d-flex align-items-center justify-content-between">
                    <div>
                      <small className="opacity-75">Saldo Pendiente</small>
                      <h4 className="mb-0 fw-bold">{formatearMoneda(saldoPendiente)}</h4>
                    </div>
                    <CreditCard size={32} className="opacity-50" />
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="border-0" style={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' }}>
                <Card.Body className="text-white">
                  <div className="d-flex align-items-center justify-content-between">
                    <div>
                      <small className="opacity-75">Pagado</small>
                      <h4 className="mb-0 fw-bold">{formatearMoneda(credito.montoTotal - saldoPendiente)}</h4>
                    </div>
                    <CheckCircle size={32} className="opacity-50" />
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Barra de progreso */}
          {credito.montoTotal > 0 && (
            <div>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="text-muted fw-semibold">Progreso de pago</span>
                <span className="fw-bold text-primary fs-5">{porcentajePagado.toFixed(0)}%</span>
              </div>
              <ProgressBar 
                now={porcentajePagado} 
                variant={porcentajePagado === 100 ? 'success' : porcentajePagado >= 50 ? 'info' : 'warning'}
                className="rounded-pill"
                style={{ height: '12px' }}
              />
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Historial de pagos mejorado */}
      <Card className="border-0 shadow-sm mb-4">
        <Card.Header className="bg-white border-bottom">
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center">
              <div className="p-2 bg-primary bg-opacity-10 rounded-3 me-2">
                <FileText size={20} className="text-primary" />
              </div>
              <h6 className="mb-0 fw-bold">Historial de Pagos</h6>
              {credito.pagos && credito.pagos.length > 0 && (
                <Badge bg="primary" className="ms-2">{credito.pagos.length}</Badge>
              )}
            </div>
          </div>
        </Card.Header>
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover className="mb-0">
              <thead className="table-light">
                <tr>
                  <th className="py-3 px-4">#</th>
                  <th className="py-3 px-4">Fecha de Pago</th>
                  <th className="py-3 px-4 text-end">Monto</th>
                  <th className="py-3 px-4">Medio de Pago</th>
                  <th className="py-3 px-4">Observación</th>
                </tr>
              </thead>
              <tbody>
                {credito.pagos && credito.pagos.length > 0 ? (
                  credito.pagos.map((p, idx) => (
                    <tr key={p.idPago || idx}>
                      <td className="px-4 fw-semibold">{idx + 1}</td>
                      <td className="px-4">
                        <div className="d-flex align-items-center">
                          <Calendar size={16} className="me-2 text-muted" />
                          {p.fechaPago}
                        </div>
                      </td>
                      <td className="px-4 text-end">
                        <span className="fw-bold text-success">{formatearMoneda(p.monto)}</span>
                      </td>
                      <td className="px-4">
                        <Badge bg="info" className="px-2 py-1">{p.medioPago}</Badge>
                      </td>
                      <td className="px-4">
                        <small className="text-muted">{p.observacion || '—'}</small>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center text-muted py-5">
                      <FileText size={48} className="mb-3 opacity-25" />
                      <p className="mb-0">No hay pagos registrados</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* Formulario de pago mejorado */}
      {saldoPendiente > 0 && (
        <Card className="border-0 shadow-sm" id="form-pago">
          <Card.Header className="bg-white border-bottom">
            <div className="d-flex align-items-center">
              <div className="p-2 bg-success bg-opacity-10 rounded-3 me-2">
                <CreditCard size={20} className="text-success" />
              </div>
              <h6 className="mb-0 fw-bold">Registrar Nuevo Pago</h6>
            </div>
          </Card.Header>
          <Card.Body>
            <Form onSubmit={registrarPago}>
              <Row className="g-3">
                <Col md={3}>
                  <Form.Group>
                    <Form.Label className="fw-semibold d-flex align-items-center">
                      <Calendar size={16} className="me-2 text-primary" />
                      Fecha de Pago
                    </Form.Label>
                    <Form.Control 
                      type="date" 
                      value={fechaPago} 
                      onChange={(e) => setFechaPago(e.target.value)} 
                      required
                      className="border-2"
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label className="fw-semibold d-flex align-items-center">
                      <Wallet size={16} className="me-2 text-primary" />
                      Monto
                    </Form.Label>
                    <Form.Control 
                      type="number" 
                      step="0.01" 
                      min="0.01"
                      max={saldoPendiente}
                      value={monto} 
                      onChange={(e) => setMonto(e.target.value)} 
                      required
                      placeholder={`Máximo: ${formatearMoneda(saldoPendiente)}`}
                      className="border-2"
                    />
                    <Form.Text className="text-muted">
                      Saldo pendiente: <strong>{formatearMoneda(saldoPendiente)}</strong>
                    </Form.Text>
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label className="fw-semibold d-flex align-items-center">
                      <CreditCard size={16} className="me-2 text-primary" />
                      Medio de Pago
                    </Form.Label>
                    <Form.Select 
                      value={medioPago} 
                      onChange={(e) => setMedioPago(e.target.value)}
                      className="border-2"
                    >
                      <option value="EFECTIVO">Efectivo</option>
                      <option value="TRANSFERENCIA">Transferencia</option>
                      <option value="TARJETA">Tarjeta</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label className="fw-semibold">Observación</Form.Label>
                    <Form.Control 
                      value={observacion} 
                      onChange={(e) => setObservacion(e.target.value)}
                      placeholder="Notas adicionales (opcional)"
                      className="border-2"
                    />
                  </Form.Group>
                </Col>
              </Row>
              <div className="mt-4 d-flex gap-2">
                <Button 
                  type="submit" 
                  variant="success" 
                  disabled={loading}
                  className="d-flex align-items-center px-4"
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      <CheckCircle size={18} className="me-2" />
                      Registrar Pago
                    </>
                  )}
                </Button>
                <Button 
                  type="button" 
                  variant="outline-secondary"
                  onClick={() => {
                    setMonto(saldoPendiente.toFixed(2));
                    setFechaPago(hoyISO());
                    setObservacion('');
                  }}
                >
                  Usar Saldo Completo
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      )}

      {/* Toast de éxito */}
      <ToastContainer position="top-center" className="p-3" style={{ zIndex: 9999 }}>
        <Toast
          show={showToast}
          onClose={() => setShowToast(false)}
          delay={3000}
          autohide
          bg="success"
        >
          <Toast.Header closeButton className="bg-success text-white border-0">
            <strong className="me-auto">✅ Pago Registrado</strong>
          </Toast.Header>
          <Toast.Body className="text-white">
            El pago se ha registrado exitosamente
          </Toast.Body>
        </Toast>
      </ToastContainer>
    </div>
  );
}

export default DetalleCredito;
