import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Table, Button, Form, Row, Col, Alert } from 'react-bootstrap';
import creditoService from '../../servicios/creditoService';

function DetalleCredito() {
  const { id } = useParams();
  const [credito, setCredito] = useState(null);
  const [monto, setMonto] = useState('');
  const [fechaPago, setFechaPago] = useState('');
  const [medioPago, setMedioPago] = useState('EFECTIVO');
  const [observacion, setObservacion] = useState('');
  const [msg, setMsg] = useState(null);

  const cargar = async () => {
    const resp = await creditoService.obtener(id);
    setCredito(resp);
  };

  useEffect(() => { cargar(); }, [id]);

  const registrarPago = async (e) => {
    e.preventDefault();
    try {
      await creditoService.registrarPago(id, {
        fechaPago,
        monto: parseFloat(monto),
        medioPago,
        observacion,
      });
      setMsg({ type: 'success', text: 'Pago registrado' });
      setMonto(''); setObservacion('');
      await cargar();
    } catch (err) {
      const text = err?.response?.data || 'Error al registrar pago';
      setMsg({ type: 'danger', text });
    }
  };

  if (!credito) return <div className="container mt-3">Cargando...</div>;

  return (
    <div className="container mt-3">
      <h4>Crédito #{credito.idCredito}</h4>
      {msg && <Alert variant={msg.type}>{msg.text}</Alert>}
      <Row className="mb-3">
        <Col md={6}>
          <div><strong>Cliente:</strong> {credito.nombreCliente}</div>
          <div><strong>Monto Total:</strong> {credito.montoTotal?.toFixed(2)}</div>
          <div><strong>Saldo Pendiente:</strong> {credito.saldoPendiente?.toFixed(2)}</div>
        </Col>
        <Col md={6}>
          <div><strong>Inicio:</strong> {credito.fechaInicio}</div>
          <div><strong>Vencimiento:</strong> {credito.fechaVencimiento || '-'}</div>
          <div><strong>Estado:</strong> {credito.estado}</div>
        </Col>
      </Row>

      <h6>Pagos</h6>
      <Table bordered size="sm">
        <thead>
          <tr>
            <th>#</th>
            <th>Fecha</th>
            <th>Monto</th>
            <th>Medio</th>
            <th>Obs</th>
          </tr>
        </thead>
        <tbody>
          {credito.pagos && credito.pagos.length > 0 ? (
            credito.pagos.map((p, idx) => (
              <tr key={p.idPago || idx}>
                <td>{idx + 1}</td>
                <td>{p.fechaPago}</td>
                <td>{p.monto?.toFixed(2)}</td>
                <td>{p.medioPago}</td>
                <td>{p.observacion}</td>
              </tr>
            ))
          ) : (
            <tr><td colSpan={5}>Sin pagos</td></tr>
          )}
        </tbody>
      </Table>

      {credito.saldoPendiente > 0 && (
        <Form onSubmit={registrarPago} className="mt-3">
          <Row>
            <Col md={3}>
              <Form.Group className="mb-2">
                <Form.Label>Fecha de pago</Form.Label>
                <Form.Control type="date" value={fechaPago} onChange={(e) => setFechaPago(e.target.value)} required />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group className="mb-2">
                <Form.Label>Monto</Form.Label>
                <Form.Control type="number" step="0.01" value={monto} onChange={(e) => setMonto(e.target.value)} required />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group className="mb-2">
                <Form.Label>Medio</Form.Label>
                <Form.Select value={medioPago} onChange={(e) => setMedioPago(e.target.value)}>
                  <option>EFECTIVO</option>
                  <option>TRANSFERENCIA</option>
                  <option>TARJETA</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group className="mb-2">
                <Form.Label>Obs</Form.Label>
                <Form.Control value={observacion} onChange={(e) => setObservacion(e.target.value)} />
              </Form.Group>
            </Col>
          </Row>
          <Button type="submit">Registrar pago</Button>
        </Form>
      )}
    </div>
  );
}

export default DetalleCredito;


