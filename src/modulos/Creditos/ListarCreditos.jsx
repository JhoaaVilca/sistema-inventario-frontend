import { useEffect, useState, useCallback } from 'react';
import { Button, Form, Row, Col, Card, Badge, Collapse, Alert, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Filter, Calendar, User, Wallet } from 'lucide-react';
import creditoService from '../../servicios/creditoService';

function ListarCreditos() {
  const [page, setPage] = useState(0);
  const [size] = useState(20);
  const [data, setData] = useState({ content: [], totalPages: 0 });
  const [loading, setLoading] = useState(false);

  // Filtros UI
  const [filtrosAbiertos, setFiltrosAbiertos] = useState(false);
  const [clienteQ, setClienteQ] = useState('');
  const [estado, setEstado] = useState('');
  const [soloVencidos, setSoloVencidos] = useState(false);
  const [fechaIni, setFechaIni] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  const filtrosActivos = Boolean(clienteQ || estado || soloVencidos || (fechaIni && fechaFin));

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      const resp = await creditoService.listar({ page, size });
      setData(resp);
    } finally {
      setLoading(false);
    }
  }, [page, size]);

  useEffect(() => { cargar(); }, [cargar]);

  const aplicarFiltros = (arr) => {
    let list = arr || [];
    if (clienteQ) list = list.filter(c => (c.nombreCliente || '').toLowerCase().includes(clienteQ.toLowerCase()));
    if (estado) {
      const sel = estado.toUpperCase();
      list = list.filter(c => {
        const est = (c.estado || '').toUpperCase();
        const saldo = Number(c.saldoPendiente || 0);
        if (sel === 'VIGENTE') {
          // Vigente: aún debe (saldo > 0) y no está cancelado ni pagado
          return saldo > 0 && est !== 'CANCELADO' && est !== 'PAGADO';
        }
        if (sel === 'CERRADO') {
          // Cerrado: Pagado o Cancelado, o saldo 0 (por si el backend no actualiza estado)
          return est === 'PAGADO' || est === 'CANCELADO' || saldo === 0;
        }
        // VENCIDO: por estado exacto
        return est === 'VENCIDO';
      });
    }
    if (soloVencidos) list = list.filter(c => (c.estado || '').toUpperCase() === 'VENCIDO');
    if (fechaIni && fechaFin) {
      const ini = new Date(fechaIni);
      const fin = new Date(fechaFin);
      list = list.filter(c => {
        const f = new Date(c.fechaInicio);
        return !isNaN(f) && f >= ini && f <= fin;
      });
    }
    return list;
  };

  const lista = filtrosActivos ? aplicarFiltros(data.content) : data.content;

  const badgeEstado = (est) => {
    const map = {
      'VIGENTE': 'primary',
      'VENCIDO': 'danger',
      'PAGADO': 'success',
      'CANCELADO': 'secondary',
    };
    const variant = map[(est || '').toUpperCase()] || 'secondary';
    return <Badge bg={variant}>{est || '—'}</Badge>;
  };

  const formatearMoneda = (v) => new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(v || 0);

  return (
    <div className="mt-4">
      {/* Header */}
      <div className="d-flex align-items-center gap-3 mb-4 p-3 bg-white rounded-3 shadow-sm border">
        <div className="p-2 bg-primary bg-opacity-10 rounded-3">
          <Wallet size={24} className="text-primary" />
        </div>
        <div>
          <h3 className="mb-0 text-dark fw-bold">Gestión de Créditos</h3>
          <small className="text-muted">Administra los créditos de clientes</small>
        </div>
        {loading && <Spinner animation="border" size="sm" />}
        {!!lista?.length && (
          <span className="badge bg-primary ms-auto">{lista.length}</span>
        )}
      </div>

      {/* Filtros */}
      <Card className="mb-4 shadow-sm">
        <Card.Header className="bg-light" onClick={() => setFiltrosAbiertos(!filtrosAbiertos)} style={{ cursor: 'pointer' }}>
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center">
              <Filter size={20} className="me-2 text-primary" />
              <h6 className="mb-0">Filtros</h6>
              {filtrosActivos && <Badge bg="primary" className="ms-2">Activos</Badge>}
            </div>
            <div className="text-muted small">{filtrosAbiertos ? 'Ocultar' : 'Mostrar'}</div>
          </div>
        </Card.Header>
        <Collapse in={filtrosAbiertos}>
          <Card.Body>
            <Row className="g-3">
              <Col lg={4} md={6}>
                <Form.Group>
                  <Form.Label className="d-flex align-items-center"><User size={16} className="me-2"/>Cliente</Form.Label>
                  <Form.Control value={clienteQ} onChange={(e) => setClienteQ(e.target.value)} placeholder="Nombre del cliente" size="sm" />
                </Form.Group>
              </Col>
              <Col lg={3} md={6}>
                <Form.Group>
                  <Form.Label>Estado</Form.Label>
                  <Form.Select value={estado} onChange={(e) => setEstado(e.target.value)} size="sm">
                    <option value="">Todos</option>
                    <option value="VIGENTE">Vigente</option>
                    <option value="VENCIDO">Vencido</option>
                    <option value="CERRADO">Cerrado (Pagado/Cancelado)</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col lg={2} md={6}>
                <Form.Group>
                  <Form.Label className="d-flex align-items-center"><Calendar size={16} className="me-2"/>Inicio</Form.Label>
                  <Form.Control type="date" value={fechaIni} onChange={(e) => setFechaIni(e.target.value)} size="sm" />
                </Form.Group>
              </Col>
              <Col lg={2} md={6}>
                <Form.Group>
                  <Form.Label className="d-flex align-items-center"><Calendar size={16} className="me-2"/>Fin</Form.Label>
                  <Form.Control type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} size="sm" />
                </Form.Group>
              </Col>
              <Col lg={1} md={12} className="d-flex align-items-end">
                <Form.Check type="switch" id="soloVencidos" label="Vencidos" checked={soloVencidos} onChange={(e) => setSoloVencidos(e.target.checked)} />
              </Col>
            </Row>
            {filtrosActivos && (
              <div className="mt-3">
                <Button variant="outline-secondary" size="sm" onClick={() => { setClienteQ(''); setEstado(''); setSoloVencidos(false); setFechaIni(''); setFechaFin(''); }}>Limpiar filtros</Button>
              </div>
            )}
          </Card.Body>
        </Collapse>
      </Card>

      {/* Listado como tarjetas */}
      {(!lista || lista.length === 0) && !loading ? (
        <Alert variant="light" className="text-center">Sin créditos para mostrar.</Alert>
      ) : (
        <div className="row">
          {lista.map((c) => (
            <div key={c.idCredito} className="col-12 mb-3">
              <Card className="border-0 shadow-sm">
                <Card.Header className="bg-white border-bottom" style={{ cursor: 'default' }}>
                  <div className="d-flex flex-wrap align-items-center gap-3">
                    {/* Izquierda: cliente + id + fecha */}
                    <div className="d-flex align-items-center">
                      <User size={20} className="me-2 text-primary" />
                      <div>
                        <div className="d-flex align-items-center gap-2">
                          <h6 className="mb-0">{c.nombreCliente || 'Cliente'}</h6>
                          <small className="text-muted">Crédito #{c.idCredito}</small>
                        </div>
                        <small className="text-muted">{c.fechaInicio}</small>
                      </div>
                    </div>
                    {/* Derecha: total/saldo/estado alineado */}
                    <div className="ms-auto d-flex align-items-center gap-3">
                      <div className="text-end">
                        <small className="text-muted d-block">Total</small>
                        <span className="fw-bold text-success">{formatearMoneda(c.montoTotal)}</span>
                      </div>
                      <div className="text-end">
                        <small className="text-muted d-block">Saldo</small>
                        <span className={`fw-bold ${c.saldoPendiente === 0 ? 'text-success' : 'text-danger'}`}>{formatearMoneda(c.saldoPendiente)}</span>
                      </div>
                      {badgeEstado(c.estado)}
                    </div>
                  </div>
                </Card.Header>
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="text-muted">
                      Vence: <strong>{c.fechaVencimiento || '—'}</strong>
                    </div>
                    <div className="d-flex gap-2">
                      <Link to={`/creditos/${c.idCredito}`} className="btn btn-sm btn-outline-primary">Ver</Link>
                      {Number(c.saldoPendiente || 0) > 0 && (
                        <Link to={`/creditos/${c.idCredito}`} className="btn btn-sm btn-primary">Pagar</Link>
                      )}
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </div>
          ))}
        </div>
      )}

      {/* Paginación: oculta cuando hay filtros activos (filtro client-side) */}
      {!filtrosActivos && (
        <Row className="mt-3">
          <Col>
            <Button disabled={page === 0 || loading} onClick={() => setPage((p) => Math.max(0, p - 1))}>Anterior</Button>
            <span className="mx-2">Página {page + 1} de {data.totalPages || 1}</span>
            <Button disabled={(data.totalPages && page >= data.totalPages - 1) || loading} onClick={() => setPage((p) => p + 1)}>Siguiente</Button>
          </Col>
        </Row>
      )}
    </div>
  );
}

export default ListarCreditos;


