import { useState, useEffect } from 'react';
import { Card, Row, Col, Badge } from 'react-bootstrap';
import { 
    Package, 
    ShoppingCart, 
    TrendingUp, 
    AlertTriangle,
    Users,
    DollarSign,
    BarChart3,
    Activity
} from 'lucide-react';

function Dashboard() {
    const [stats, setStats] = useState({
        totalProductos: 0,
        totalProveedores: 0,
        totalEntradas: 0,
        productosSinStock: 0
    });

    useEffect(() => {
        // Simular carga de estadísticas
        const cargarEstadisticas = async () => {
            try {
                // Aquí puedes hacer las llamadas a tu API real
                // Por ahora usamos datos simulados
                setStats({
                    totalProductos: 5483,
                    totalProveedores: 2859,
                    totalEntradas: 1247,
                    productosSinStock: 38
                });
            } catch (error) {
                console.error('Error al cargar estadísticas:', error);
            }
        };

        cargarEstadisticas();
    }, []);

    const StatCard = ({ title, value, icon: Icon, bgColor, info }) => (
        <Card className="h-100 shadow-sm border-0">
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
                        <Icon size={24} className="text-white" />
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

    return (
        <div className="container-fluid">
            {/* Header del Dashboard */}
            <div className="mb-4">
                <h2 className="mb-2 fw-bold text-dark">
                    ¡Bienvenido al Sistema de Inventario!
                </h2>
                <p className="text-muted mb-0">
                    Panel de control y estadísticas generales
                </p>
            </div>

            {/* Tarjetas de estadísticas */}
            <Row className="g-4 mb-4">
                <Col lg={3} md={6} sm={12}>
                    <StatCard
                        title="Total Productos"
                        value={stats.totalProductos}
                        icon={Package}
                        bgColor="bg-success"
                    />
                </Col>
                <Col lg={3} md={6} sm={12}>
                    <StatCard
                        title="Total Proveedores"
                        value={stats.totalProveedores}
                        icon={Users}
                        bgColor="bg-primary"
                    />
                </Col>
                <Col lg={3} md={6} sm={12}>
                    <StatCard
                        title="Total Entradas"
                        value={stats.totalEntradas}
                        icon={ShoppingCart}
                        bgColor="bg-warning"
                    />
                </Col>
                <Col lg={3} md={6} sm={12}>
                    <StatCard
                        title="Sin Stock"
                        value={stats.productosSinStock}
                        icon={AlertTriangle}
                        bgColor="bg-danger"
                        info="Requieren atención"
                    />
                </Col>
            </Row>

            {/* Sección de gráficos y análisis */}
            <Row className="g-4">
                <Col lg={8} md={12}>
                    <Card className="shadow-sm border-0">
                        <Card.Header className="bg-transparent border-0 pb-0">
                            <h5 className="mb-0 fw-bold text-dark">
                                Actividad Reciente
                            </h5>
                        </Card.Header>
                        <Card.Body className="p-4">
                            <div className="d-flex align-items-center justify-content-center" style={{ height: '300px' }}>
                                <div className="text-center text-muted">
                                    <BarChart3 size={64} className="mb-3 text-muted" />
                                    <h6>Gráfico de Actividad</h6>
                                    <p className="mb-0">Aquí se mostrarán las estadísticas de actividad</p>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg={4} md={12}>
                    <Card className="shadow-sm border-0">
                        <Card.Header className="bg-transparent border-0 pb-0">
                            <h5 className="mb-0 fw-bold text-dark">
                                Resumen Rápido
                            </h5>
                        </Card.Header>
                        <Card.Body className="p-4">
                            <div className="d-flex flex-column gap-3">
                                <div className="d-flex align-items-center justify-content-between p-3 rounded bg-light">
                                    <div className="d-flex align-items-center">
                                        <TrendingUp size={20} className="me-3 text-success" />
                                        <div>
                                            <h6 className="mb-0 small fw-medium text-dark">
                                                Productos Activos
                                            </h6>
                                            <small className="text-muted">En buen estado</small>
                                        </div>
                                    </div>
                                    <Badge bg="success">{stats.totalProductos - stats.productosSinStock}</Badge>
                                </div>
                                
                                <div className="d-flex align-items-center justify-content-between p-3 rounded bg-light">
                                    <div className="d-flex align-items-center">
                                        <Activity size={20} className="me-3 text-primary" />
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
                                        <DollarSign size={20} className="me-3 text-warning" />
                                        <div>
                                            <h6 className="mb-0 small fw-medium text-dark">
                                                Entradas del Mes
                                            </h6>
                                            <small className="text-muted">Últimos 30 días</small>
                                        </div>
                                    </div>
                                    <Badge bg="warning" text="dark">{stats.totalEntradas}</Badge>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    );
}

export default Dashboard; 