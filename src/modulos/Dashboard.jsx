import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Row, Col, Badge, Button, Modal, Table } from 'react-bootstrap';
import {
    Package,
    ShoppingCart,
    TrendingUp,
    AlertTriangle,
    Users,
    Banknote,
    BarChart3,
    Activity
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts';
import dashboardService from '../servicios/dashboardService';
import cajaService from '../servicios/cajaService';

function Dashboard() {
    const [stats, setStats] = useState({
        totalProductos: 0,
        totalProveedores: 0,
        totalEntradas: 0,
        ventasTotales: 0,
        productosSinStock: 0,
        creditosPendientes: 0,
        categoriasTotales: 0,
        ventasCantidadMes: 0,
    });
    const [actividad, setActividad] = useState([]);
    const [mensual, setMensual] = useState([]);
    const [alertas, setAlertas] = useState([]);
    const [deudores, setDeudores] = useState([]);
    const [cajaAbierta, setCajaAbierta] = useState(null);
    const [modal, setModal] = useState(null); // 'ventas' | 'productos' | 'creditos' | 'entradas' | 'sin-stock' | 'por-vencer'
    const [modalData, setModalData] = useState([]);
    const [chartHeight, setChartHeight] = useState(280);
    const navigate = useNavigate();

    const cargarTodo = useCallback(async () => {
        const [resumen, act, mens, alerts, caja, deuda] = await Promise.all([
            dashboardService.obtenerResumen(),
            dashboardService.actividadReciente(10),
            dashboardService.resumenMensual(),
            dashboardService.alertas(),
            cajaService.obtenerEstado(),
            dashboardService.deudores(5),
        ]);

        setStats({
            totalProductos: resumen.productosTotales || 0,
            totalProveedores: resumen.proveedoresTotales || 0,
            totalEntradas: resumen.entradasTotales || 0,
            ventasTotales: resumen.ventasTotales || 0,
            productosSinStock: resumen.productosSinStock || 0,
            creditosPendientes: resumen.creditosPendientes || 0,
            categoriasTotales: resumen.categoriasTotales || 0,
            ventasCantidadMes: resumen.ventasCantidadMes || 0,
        });
        setActividad(act || []);
        setMensual(mens || []);
        setAlertas(alerts || []);
        setCajaAbierta(caja?.existeCaja ? caja.caja : null);
        setDeudores(deuda || []);
    }, []);

    useEffect(() => {
        cargarTodo().catch((e) => console.error(e));
    }, [cargarTodo]);

    // Altura del gráfico responsive según ancho de ventana
    useEffect(() => {
        const handleResize = () => {
            const w = window.innerWidth;
            if (w < 576) setChartHeight(200);
            else if (w < 992) setChartHeight(240);
            else setChartHeight(280);
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const StatCard = ({ title, value, icon, bgColor, info, onClick }) => (
        <Card className="h-100 shadow-sm border-0" onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
            <Card.Body className="p-4">
                <div className="d-flex justify-content-between align-items-start">
                    <div>
                        <h6 className="text-muted mb-2 fw-medium small">
                            {title}
                        </h6>
                        <h3 className="mb-0 fw-bold text-dark">
                            {value.toLocaleString()}
                        </h3>
                    </div>
                    <div className={`d-flex align-items-center justify-content-center rounded-circle ${bgColor}`} style={{ width: '48px', height: '48px' }}>
                        {icon}
                    </div>
                </div>
                {info && (
                    <div className="mt-3">
                        <Badge bg="light" text="dark" className="d-flex align-items-center">
                            <AlertTriangle size={14} className="me-1" />
                            {info}
                        </Badge>
                    </div>
                )}
            </Card.Body>
        </Card>
    );

    const fechaActual = new Date().toLocaleDateString('es-PE');

    // Donut data: Ventas vs Compras del mes actual
    const currentMonth = mensual && mensual.length ? mensual[mensual.length - 1] : { ventas: 0, compras: 0 };
    const donutData = [
        { name: 'Ventas', value: currentMonth.ventas || 0 },
        { name: 'Compras', value: currentMonth.compras || 0 }
    ];
    const donutColors = ['#3b82f6', '#f59e0b'];

    return (
        <div className="container-fluid">
            {/* Header del Dashboard */}
            <div className="mb-4">
                <h2 className="mb-2 fw-bold text-dark fs-4 fs-md-3">
                    ¡Bienvenido al Sistema de Inventario COMERCIAL YOLI!
                </h2>
                <p className="text-muted mb-0 small small-md">
                    Panel de control y estadísticas generales — Actualizado al: {fechaActual}
                </p>
                {/* <div className="mt-2">
                    <Button size="sm" variant="outline-primary" onClick={cargarTodo}>
                        🔄 Actualizar datos
                    </Button>
                </div> */}
            </div>

            {/* Tarjetas de estadísticas */}
            <Row className="g-3 g-md-4 mb-3 mb-md-4">
                <Col xs={12} md={6} lg={3}>
                    <StatCard
                        title="🛍️ Total Ventas del Mes"
                        value={stats.ventasTotales}
                        icon={<TrendingUp size={24} className="text-white" />}
                        bgColor="bg-success"
                        onClick={() => navigate('/salidas')}
                    />
                </Col>
                <Col xs={12} md={6} lg={3}>
                    <StatCard
                        title="📦 Total Productos"
                        value={stats.totalProductos}
                        icon={<Package size={24} className="text-white" />}
                        bgColor="bg-primary"
                        onClick={() => navigate('/productos')}
                    />
                </Col>
                <Col xs={12} md={6} lg={3}>
                    <StatCard
                        title="📚 Categorías"
                        value={stats.categoriasTotales}
                        icon={<Activity size={24} className="text-white" />}
                        bgColor="bg-info"
                        onClick={() => navigate('/categorias')}
                    />
                </Col>
                <Col xs={12} md={6} lg={3}>
                    <StatCard
                        title="⚠️ Sin Stock"
                        value={stats.productosSinStock}
                        icon={<AlertTriangle size={24} className="text-white" />}
                        bgColor="bg-danger"
                        info="Requieren atención"
                        onClick={() => navigate('/productos')}
                    />
                </Col>
            </Row>

            {/* Sección de gráficos y análisis */}
            <Row className="g-4">
                <Col xs={12} lg={8}>
                    <Card className="shadow-sm border-0">
                        <Card.Header className="bg-transparent border-0 pb-0">
                            <div className="d-flex justify-content-between align-items-center">
                                <h5 className="mb-0 fw-bold text-dark">Dinámica de ventas</h5>
                                <small className="text-muted">{new Date().getFullYear()}</small>
                            </div>
                        </Card.Header>
                        <Card.Body className="p-4">
                            <div style={{ height: chartHeight }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={mensual} margin={{ top: 16, right: 12, left: 8, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="barBlue" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.95} />
                                                <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.75} />
                                            </linearGradient>
                                            <linearGradient id="barOrange" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.95} />
                                                <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.75} />
                                            </linearGradient>
                                        </defs>
                                        <XAxis dataKey="mes" tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={{ stroke: '#e5e7eb' }} tickLine={false} />
                                        <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} tickLine={false} width={40} />
                                        <Tooltip cursor={{ fill: 'rgba(59,130,246,0.08)' }} contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb' }} />
                                        <Legend verticalAlign="top" height={24} wrapperStyle={{ fontSize: 12 }} />
                                        <Bar dataKey="ventas" fill="url(#barBlue)" radius={[6, 6, 0, 0]} barSize={20} name="Ventas" />
                                        <Bar dataKey="compras" fill="url(#barOrange)" radius={[6, 6, 0, 0]} barSize={20} name="Compras" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="mt-4">
                                <Table hover responsive className="mb-0 table-sm">
                                    <thead>
                                        <tr>
                                            <th>Fecha</th>
                                            <th>Tipo</th>
                                            <th>Detalle</th>
                                            <th>Monto</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {actividad.map((a, idx) => (
                                            <tr key={idx}>
                                                <td>{a.fecha}</td>
                                                <td>{a.tipo}</td>
                                                <td style={{ maxWidth: 300 }} className="text-truncate">{a.detalle}</td>
                                                <td>{a.monto?.toFixed ? a.monto.toFixed(2) : a.monto}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col xs={12} lg={4}>
                    <Card className="shadow-sm border-0">
                        <Card.Header className="bg-transparent border-0 pb-0">
                            <h5 className="mb-0 fw-bold text-dark">
                                Resumen Rápido
                            </h5>
                        </Card.Header>
                        <Card.Body className="p-4">
                            <div className="d-flex flex-column gap-3">
                                <div className="p-3 rounded bg-light d-flex align-items-center justify-content-between">
                                    <div>
                                        <h6 className="mb-1 small fw-medium text-dark">Ventas vs Compras (mes)</h6>
                                        <small className="text-muted">Distribución</small>
                                    </div>
                                    <div style={{ width: 120, height: 120 }}>
                                        <ResponsiveContainer width={120} height={120}>
                                            <PieChart>
                                                <Pie data={donutData} innerRadius={40} outerRadius={55} dataKey="value">
                                                    {donutData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={donutColors[index % donutColors.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                                <div className="d-flex align-items-center justify-content-between p-3 rounded bg-light">
                                    <div className="d-flex align-items-center">
                                        <ShoppingCart size={20} className="me-3 text-success" />
                                        <div>
                                            <h6 className="mb-0 small fw-medium text-dark">
                                                Salidas del Mes
                                            </h6>
                                            <small className="text-muted">Cantidad</small>
                                        </div>
                                    </div>
                                    <Badge bg="success">{stats.ventasCantidadMes}</Badge>
                                </div>

                                <div className="d-flex align-items-center justify-content-between p-3 rounded bg-light">
                                    <div className="d-flex align-items-center">
                                        <Users size={20} className="me-3 text-primary" />
                                        <div>
                                            <h6 className="mb-0 small fw-medium text-dark">
                                                Proveedores Activos
                                            </h6>
                                            <small className="text-muted">Con productos</small>
                                        </div>
                                    </div>
                                    <Badge bg="primary">{stats.totalProveedores}</Badge>
                                </div>

                                <div className="d-flex align-items-center justify-content-between p-3 rounded bg-light">
                                    <div className="d-flex align-items-center">
                                        <Banknote size={20} className="me-3 text-warning" />
                                        <div>
                                            <h6 className="mb-0 small fw-medium text-dark">
                                                Entradas del Mes
                                            </h6>
                                            <small className="text-muted">Últimos 30 días</small>
                                        </div>
                                    </div>
                                    <Badge bg="warning" text="dark">{stats.totalEntradas}</Badge>
                                </div>

                                <div className="p-3 rounded bg-light">
                                    <div className="d-flex align-items-center mb-2">
                                        <Banknote size={18} className="me-2 text-danger" />
                                        <h6 className="mb-0 small fw-medium text-dark">Top deudores</h6>
                                    </div>
                                    <Table responsive hover size="sm" className="mb-0">
                                        <thead>
                                            <tr>
                                                <th>Cliente</th>
                                                <th className="text-end">Saldo</th>
                                                <th className="text-end">Estado</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {deudores.map((d, i) => (
                                                <tr key={i}>
                                                    <td className="text-truncate" style={{ maxWidth: 200 }}>{d.nombreCompleto || 'Cliente'}</td>
                                                    <td className="text-end">S/ {Number(d.saldoPendiente || 0).toFixed(2)}</td>
                                                    <td className="text-end"><Badge bg="warning" text="dark">Pendiente</Badge></td>
                                                </tr>
                                            ))}
                                            {deudores.length === 0 && (
                                                <tr><td colSpan={3} className="text-muted small">Sin deudas pendientes</td></tr>
                                            )}
                                        </tbody>
                                    </Table>
                                </div>

                                <div className="d-flex align-items-center justify-content-between p-3 rounded bg-light">
                                    <div className="d-flex align-items-center">
                                        <BarChart3 size={20} className="me-3 text-success" />
                                        <div>
                                            <h6 className="mb-0 small fw-medium text-dark">Caja del día</h6>
                                            <small className="text-muted">{cajaAbierta ? 'ABIERTA' : 'CERRADA'}</small>
                                        </div>
                                    </div>
                                    {cajaAbierta ? (
                                        <Button size="sm" variant="outline-danger" onClick={() => window.location.href = '/salidas/caja'}>Cerrar caja</Button>
                                    ) : (
                                        <Button size="sm" variant="outline-success" onClick={() => window.location.href = '/salidas/caja'}>Abrir caja</Button>
                                    )}
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Alertas */}
            <Row className="g-4 mt-1">
                <Col lg={12}>
                    {alertas.map((a, i) => (
                        <div key={i} className="alert alert-warning d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-2">
                            <div className="w-100">
                                {a.mensaje}
                            </div>
                            {a.tipo === 'SIN_STOCK' && <Button size="sm" onClick={() => navigate('/productos')}>Ver productos</Button>}
                            {a.tipo === 'CREDITOS_VENCIDOS' && <Button size="sm" onClick={() => setModal('creditos')}>Ver créditos</Button>}
                            {a.tipo === 'POR_VENCER' && <Button size="sm" onClick={async () => {
                                const data = await dashboardService.proximosVencer();
                                setModalData(data);
                                setModal('por-vencer');
                            }}>Ver vencimientos</Button>}
                        </div>
                    ))}
                </Col>
            </Row>

            {/* Modal genérico */}
            <Modal show={!!modal} onHide={() => setModal(null)} size="lg" centered>
                <Modal.Header closeButton>
                    <Modal.Title>Detalle: {modal}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {modal === 'por-vencer' ? (
                        <Table responsive hover>
                            <thead>
                                <tr>
                                    <th>Producto</th>
                                    <th>Fecha venc.</th>
                                    <th>Días</th>
                                </tr>
                            </thead>
                            <tbody>
                                {modalData.map((p, idx) => (
                                    <tr key={idx}>
                                        <td>{p.nombreProducto}</td>
                                        <td>{p.fechaVencimiento}</td>
                                        <td>{p.diasRestantes}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    ) : (
                        <p>Contenido conectado al backend según el tipo seleccionado.</p>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setModal(null)}>Cerrar</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}

export default Dashboard; 