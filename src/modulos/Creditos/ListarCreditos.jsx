import { useEffect, useState, useCallback } from 'react';
import { Button, Form, Row, Col, Card, Badge, Collapse, Alert, Spinner, ProgressBar } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Filter, Calendar, User, Wallet, DollarSign, AlertCircle, CheckCircle, Clock, TrendingUp, Eye, CreditCard, ArrowLeft, ArrowRight, X } from 'lucide-react';
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
          return saldo > 0 && est !== 'CANCELADO' && est !== 'PAGADO';
        }
        if (sel === 'CERRADO') {
          return est === 'PAGADO' || est === 'CANCELADO' || saldo === 0;
        }
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

  let lista = filtrosActivos ? aplicarFiltros(data.content) : data.content;

  // Ordenar por fecha de inicio (más recientes primero)
  lista = [...lista].sort((a, b) => {
    const fechaA = new Date(a.fechaInicio || 0);
    const fechaB = new Date(b.fechaInicio || 0);
    return fechaB - fechaA; // Descendente (más reciente primero)
  });

  // Agrupar créditos por cliente
  const creditosPorCliente = lista.reduce((acc, credito) => {
    const clave = credito.idCliente || credito.nombreCliente || 'sin-cliente';
    if (!acc[clave]) {
      acc[clave] = {
        idCliente: credito.idCliente,
        nombreCliente: credito.nombreCliente || 'Cliente',
        creditos: []
      };
    }
    acc[clave].creditos.push(credito);
    return acc;
  }, {});

  // Convertir a array y ordenar por el crédito más reciente de cada cliente
  const clientesAgrupados = Object.values(creditosPorCliente).sort((a, b) => {
    const fechaA = new Date(a.creditos[0]?.fechaInicio || 0);
    const fechaB = new Date(b.creditos[0]?.fechaInicio || 0);
    return fechaB - fechaA; // Descendente
  });

  // Calcular estadísticas (usar lista original sin agrupar)
  const estadisticas = lista.reduce((acc, c) => {
    const saldo = Number(c.saldoPendiente || 0);
    const total = Number(c.montoTotal || 0);
    const est = (c.estado || '').toUpperCase();
    
    acc.totalCreditos += 1;
    acc.totalMonto += total;
    acc.totalSaldo += saldo;
    
    if (saldo > 0 && est !== 'CANCELADO' && est !== 'PAGADO') {
      acc.vigentes += 1;
      acc.montoVigente += saldo;
    }
    if (est === 'VENCIDO') {
      acc.vencidos += 1;
      acc.montoVencido += saldo;
    }
    if (est === 'PAGADO' || saldo === 0) {
      acc.pagados += 1;
    }
    
    return acc;
  }, {
    totalCreditos: 0,
    totalMonto: 0,
    totalSaldo: 0,
    vigentes: 0,
    montoVigente: 0,
    vencidos: 0,
    montoVencido: 0,
    pagados: 0
  });

  const badgeEstado = (est) => {
    const map = {
      'VIGENTE': { bg: 'primary', icon: <Clock size={14} className="me-1" /> },
      'VENCIDO': { bg: 'danger', icon: <AlertCircle size={14} className="me-1" /> },
      'PAGADO': { bg: 'success', icon: <CheckCircle size={14} className="me-1" /> },
      'CANCELADO': { bg: 'secondary', icon: <X size={14} className="me-1" /> },
    };
    const config = map[(est || '').toUpperCase()] || { bg: 'secondary', icon: null };
    return (
      <Badge bg={config.bg} className="d-flex align-items-center px-2 py-1">
        {config.icon}
        {est || '—'}
      </Badge>
    );
  };

  const formatearMoneda = (v) => new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(v || 0);
  
  const calcularPorcentajePagado = (total, saldo) => {
    if (!total || total === 0) return 0;
    return ((total - saldo) / total) * 100;
  };

  const esVencido = (fechaVencimiento) => {
    if (!fechaVencimiento) return false;
    return new Date(fechaVencimiento) < new Date();
  };

  return (
    <div className="mt-4">
      {/* Header mejorado */}
      <div className="d-flex align-items-center gap-3 mb-4 p-4 bg-white rounded-4 shadow-sm border">
        <div className="p-3 bg-primary bg-opacity-10 rounded-4">
          <Wallet size={28} className="text-primary" />
        </div>
        <div className="flex-grow-1">
          <h3 className="mb-1 text-dark fw-bold">Gestión de Créditos</h3>
          <small className="text-muted">Administra y controla los créditos de tus clientes</small>
        </div>
        {loading && <Spinner animation="border" size="sm" className="text-primary" />}
        {!!clientesAgrupados?.length && (
          <div className="d-flex flex-column align-items-end">
            <span className="badge bg-primary rounded-pill px-3 py-2 fs-6">{clientesAgrupados.length}</span>
            <small className="text-muted mt-1">{clientesAgrupados.length === 1 ? 'Cliente' : 'Clientes'}</small>
          </div>
        )}
      </div>

      {/* Estadísticas resumidas */}
      {lista.length > 0 && (
        <Row className="mb-4 g-3">
          <Col md={3} sm={6}>
            <Card className="border-0 shadow-sm h-100" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
              <Card.Body className="text-white">
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <small className="opacity-75">Total Créditos</small>
                    <h4 className="mb-0 fw-bold">{estadisticas.totalCreditos}</h4>
                  </div>
                  <TrendingUp size={32} className="opacity-50" />
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} sm={6}>
            <Card className="border-0 shadow-sm h-100" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
              <Card.Body className="text-white">
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <small className="opacity-75">Saldo Pendiente</small>
                    <h4 className="mb-0 fw-bold">{formatearMoneda(estadisticas.totalSaldo)}</h4>
                  </div>
                  <DollarSign size={32} className="opacity-50" />
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} sm={6}>
            <Card className="border-0 shadow-sm h-100" style={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' }}>
              <Card.Body className="text-white">
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <small className="opacity-75">Vigentes</small>
                    <h4 className="mb-0 fw-bold">{estadisticas.vigentes}</h4>
                  </div>
                  <Clock size={32} className="opacity-50" />
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} sm={6}>
            <Card className="border-0 shadow-0 h-100" style={{ background: estadisticas.vencidos > 0 ? 'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)' : 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
              <Card.Body className="text-white">
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <small className="opacity-75">Vencidos</small>
                    <h4 className="mb-0 fw-bold">{estadisticas.vencidos}</h4>
                  </div>
                  <AlertCircle size={32} className="opacity-50" />
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Filtros mejorados */}
      <Card className="mb-4 shadow-sm border-0">
        <Card.Header 
          className="bg-light border-0" 
          onClick={() => setFiltrosAbiertos(!filtrosAbiertos)} 
          style={{ cursor: 'pointer' }}
        >
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center">
              <div className="p-2 bg-primary bg-opacity-10 rounded-3 me-2">
                <Filter size={18} className="text-primary" />
              </div>
              <h6 className="mb-0 fw-semibold">Filtros de Búsqueda</h6>
              {filtrosActivos && <Badge bg="primary" className="ms-2 rounded-pill">Activos</Badge>}
            </div>
            <div className="text-muted small fw-medium">{filtrosAbiertos ? 'Ocultar' : 'Mostrar'}</div>
          </div>
        </Card.Header>
        <Collapse in={filtrosAbiertos}>
          <Card.Body className="bg-white">
            <Row className="g-3">
              <Col lg={4} md={6}>
                <Form.Group>
                  <Form.Label className="d-flex align-items-center fw-semibold">
                    <User size={16} className="me-2 text-primary" />
                    Cliente
                  </Form.Label>
                  <Form.Control 
                    value={clienteQ} 
                    onChange={(e) => setClienteQ(e.target.value)} 
                    placeholder="Buscar por nombre del cliente" 
                    size="sm"
                    className="border-2"
                  />
                </Form.Group>
              </Col>
              <Col lg={3} md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold">Estado</Form.Label>
                  <Form.Select 
                    value={estado} 
                    onChange={(e) => setEstado(e.target.value)} 
                    size="sm"
                    className="border-2"
                  >
                    <option value="">Todos los estados</option>
                    <option value="VIGENTE">Vigente</option>
                    <option value="VENCIDO">Vencido</option>
                    <option value="CERRADO">Cerrado (Pagado/Cancelado)</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col lg={2} md={6}>
                <Form.Group>
                  <Form.Label className="d-flex align-items-center fw-semibold">
                    <Calendar size={16} className="me-2 text-primary" />
                    Fecha Inicio
                  </Form.Label>
                  <Form.Control 
                    type="date" 
                    value={fechaIni} 
                    onChange={(e) => setFechaIni(e.target.value)} 
                    size="sm"
                    className="border-2"
                  />
                </Form.Group>
              </Col>
              <Col lg={2} md={6}>
                <Form.Group>
                  <Form.Label className="d-flex align-items-center fw-semibold">
                    <Calendar size={16} className="me-2 text-primary" />
                    Fecha Fin
                  </Form.Label>
                  <Form.Control 
                    type="date" 
                    value={fechaFin} 
                    onChange={(e) => setFechaFin(e.target.value)} 
                    size="sm"
                    className="border-2"
                  />
                </Form.Group>
              </Col>
              <Col lg={1} md={12} className="d-flex align-items-end">
                <Form.Check 
                  type="switch" 
                  id="soloVencidos" 
                  label="Solo Vencidos" 
                  checked={soloVencidos} 
                  onChange={(e) => setSoloVencidos(e.target.checked)}
                  className="fw-semibold"
                />
              </Col>
            </Row>
            {filtrosActivos && (
              <div className="mt-3 pt-3 border-top">
                <Button 
                  variant="outline-secondary" 
                  size="sm" 
                  onClick={() => { 
                    setClienteQ(''); 
                    setEstado(''); 
                    setSoloVencidos(false); 
                    setFechaIni(''); 
                    setFechaFin(''); 
                  }}
                  className="d-flex align-items-center"
                >
                  <X size={16} className="me-1" />
                  Limpiar filtros
                </Button>
              </div>
            )}
          </Card.Body>
        </Collapse>
      </Card>

      {/* Listado mejorado - Agrupado por cliente */}
      {(!clientesAgrupados || clientesAgrupados.length === 0) && !loading ? (
        <Card className="border-0 shadow-sm">
          <Card.Body className="text-center py-5">
            <Wallet size={48} className="text-muted mb-3 opacity-50" />
            <h5 className="text-muted">No hay créditos para mostrar</h5>
            <p className="text-muted small">Los créditos aparecerán aquí cuando se registren</p>
          </Card.Body>
        </Card>
      ) : (
        <div className="row g-3">
          {clientesAgrupados.map((clienteGrupo) => {
            // Calcular totales del cliente
            const totalMonto = clienteGrupo.creditos.reduce((sum, c) => sum + (Number(c.montoTotal) || 0), 0);
            const totalSaldo = clienteGrupo.creditos.reduce((sum, c) => sum + (Number(c.saldoPendiente) || 0), 0);
            const tieneVencidos = clienteGrupo.creditos.some(c => esVencido(c.fechaVencimiento) && Number(c.saldoPendiente || 0) > 0);
            const tienePendientes = clienteGrupo.creditos.some(c => Number(c.saldoPendiente || 0) > 0);
            
            return (
              <div key={clienteGrupo.idCliente || clienteGrupo.nombreCliente} className="col-12">
                <Card className="border-0 shadow-sm h-100" style={{ transition: 'all 0.3s ease' }}>
                  <Card.Header className={`bg-white border-bottom ${tieneVencidos ? 'border-danger border-3' : ''}`}>
                    <div className="d-flex flex-wrap align-items-center gap-3">
                      {/* Información del cliente */}
                      <div className="d-flex align-items-center flex-grow-1">
                        <div className="p-2 bg-primary bg-opacity-10 rounded-3 me-3">
                          <User size={22} className="text-primary" />
                        </div>
                        <div>
                          <div className="d-flex align-items-center gap-2 flex-wrap">
                            <h6 className="mb-0 fw-bold">{clienteGrupo.nombreCliente}</h6>
                            <Badge bg="info" className="px-2 py-1">
                              {clienteGrupo.creditos.length} {clienteGrupo.creditos.length === 1 ? 'crédito' : 'créditos'}
                            </Badge>
                            {tieneVencidos && (
                              <Badge bg="danger" className="px-2 py-1 d-flex align-items-center">
                                <AlertCircle size={14} className="me-1" />
                                Con vencidos
                              </Badge>
                            )}
                          </div>
                          <small className="text-muted">
                            Cliente ID: {clienteGrupo.idCliente || 'N/A'}
                          </small>
                        </div>
                      </div>
                      
                      {/* Totales del cliente */}
                      <div className="d-flex align-items-center gap-4">
                        <div className="text-end">
                          <small className="text-muted d-block mb-1">Total Cliente</small>
                          <span className="fw-bold text-success fs-5">{formatearMoneda(totalMonto)}</span>
                        </div>
                        <div className="text-end">
                          <small className="text-muted d-block mb-1">Saldo Pendiente</small>
                          <span className={`fw-bold fs-5 ${totalSaldo === 0 ? 'text-success' : 'text-danger'}`}>
                            {formatearMoneda(totalSaldo)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card.Header>
                  
                  <Card.Body>
                    {/* Lista de créditos del cliente */}
                    <div className="mb-3">
                      <h6 className="mb-3 fw-semibold text-muted">Créditos del Cliente:</h6>
                      <div className="row g-2">
                        {clienteGrupo.creditos.map((c) => {
                          const porcentajePagado = calcularPorcentajePagado(c.montoTotal, c.saldoPendiente);
                          const vencido = esVencido(c.fechaVencimiento);
                          const saldoPendiente = Number(c.saldoPendiente || 0);
                          
                          return (
                            <div key={c.idCredito} className="col-12">
                              <Card className="border bg-light">
                                <Card.Body className="p-3">
                                  <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
                                    {/* Info del crédito */}
                                    <div className="flex-grow-1">
                                      <div className="d-flex align-items-center gap-2 flex-wrap mb-2">
                                        <Badge bg="light" text="dark" className="px-2 py-1">
                                          Crédito #{c.idCredito}
                                        </Badge>
                                        {badgeEstado(c.estado)}
                                        {vencido && saldoPendiente > 0 && (
                                          <Badge bg="danger" className="px-2 py-1 d-flex align-items-center">
                                            <AlertCircle size={12} className="me-1" />
                                            Vencido
                                          </Badge>
                                        )}
                                      </div>
                                      <div className="d-flex align-items-center gap-3 flex-wrap">
                                        <small className="text-muted d-flex align-items-center">
                                          <Calendar size={14} className="me-1" />
                                          Inicio: {c.fechaInicio || '—'}
                                        </small>
                                        {c.fechaVencimiento && (
                                          <small className={vencido && saldoPendiente > 0 ? 'text-danger fw-bold d-flex align-items-center' : 'text-muted d-flex align-items-center'}>
                                            <Clock size={14} className="me-1" />
                                            Vence: {c.fechaVencimiento}
                                          </small>
                                        )}
                                      </div>
                                      {/* Barra de progreso */}
                                      {c.montoTotal > 0 && (
                                        <div className="mt-2">
                                          <div className="d-flex justify-content-between align-items-center mb-1">
                                            <small className="text-muted">Progreso</small>
                                            <small className="fw-semibold text-primary">{porcentajePagado.toFixed(0)}%</small>
                                          </div>
                                          <ProgressBar 
                                            now={porcentajePagado} 
                                            variant={porcentajePagado === 100 ? 'success' : porcentajePagado >= 50 ? 'info' : 'warning'}
                                            className="rounded-pill"
                                            style={{ height: '6px' }}
                                          />
                                        </div>
                                      )}
                                    </div>
                                    
                                    {/* Montos y acciones */}
                                    <div className="d-flex align-items-center gap-3">
                                      <div className="text-end">
                                        <small className="text-muted d-block">Total</small>
                                        <span className="fw-bold text-success">{formatearMoneda(c.montoTotal)}</span>
                                      </div>
                                      <div className="text-end">
                                        <small className="text-muted d-block">Saldo</small>
                                        <span className={`fw-bold ${saldoPendiente === 0 ? 'text-success' : 'text-danger'}`}>
                                          {formatearMoneda(saldoPendiente)}
                                        </span>
                                      </div>
                                      <div className="d-flex gap-2">
                                        <Link 
                                          to={`/creditos/${c.idCredito}`} 
                                          className="btn btn-sm btn-outline-primary d-flex align-items-center"
                                        >
                                          <Eye size={14} className="me-1" />
                                          Ver
                                        </Link>
                                        {saldoPendiente > 0 && (
                                          <Link 
                                            to={`/creditos/${c.idCredito}`} 
                                            className="btn btn-sm btn-primary d-flex align-items-center"
                                          >
                                            <CreditCard size={14} className="me-1" />
                                            Pagar
                                          </Link>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </Card.Body>
                              </Card>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    
                    {/* Acciones rápidas del cliente */}
                    {tienePendientes && (
                      <div className="d-flex gap-2 pt-2 border-top">
                        <small className="text-muted d-flex align-items-center me-auto">
                          <AlertCircle size={14} className="me-1" />
                          Este cliente tiene {clienteGrupo.creditos.filter(c => Number(c.saldoPendiente || 0) > 0).length} crédito(s) pendiente(s)
                        </small>
                      </div>
                    )}
                  </Card.Body>
                </Card>
              </div>
            );
          })}
        </div>
      )}

      {/* Paginación mejorada */}
      {!filtrosActivos && data.totalPages > 1 && (
        <Card className="mt-4 border-0 shadow-sm">
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <span className="text-muted">Página {page + 1} de {data.totalPages || 1}</span>
              </div>
              <div className="d-flex gap-2">
                <Button 
                  variant="outline-primary" 
                  disabled={page === 0 || loading} 
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  className="d-flex align-items-center"
                >
                  <ArrowLeft size={16} className="me-1" />
                  Anterior
                </Button>
                <Button 
                  variant="primary" 
                  disabled={(data.totalPages && page >= data.totalPages - 1) || loading} 
                  onClick={() => setPage((p) => p + 1)}
                  className="d-flex align-items-center"
                >
                  Siguiente
                  <ArrowRight size={16} className="ms-1" />
                </Button>
              </div>
            </div>
          </Card.Body>
        </Card>
      )}
    </div>
  );
}

export default ListarCreditos;
