import { useState, useEffect } from 'react';
import { Card, Button, Table, Badge, Alert, Modal, Form, Row, Col, Spinner } from 'react-bootstrap';
import { 
    DollarSign, 
    Plus, 
    Minus, 
    Eye, 
    Download, 
    Clock, 
    AlertCircle,
    CheckCircle,
    XCircle,
    TrendingUp,
    TrendingDown
} from 'lucide-react';
import apiClient from '../../servicios/apiClient';
import cajaService from '../../servicios/cajaService';

const CajaDelDia = () => {
    const [caja, setCaja] = useState(null);
    const [movimientos, setMovimientos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showAbrirModal, setShowAbrirModal] = useState(false);
    const [showCerrarModal, setShowCerrarModal] = useState(false);
    const [showEgresoModal, setShowEgresoModal] = useState(false);
    const [formData, setFormData] = useState({
        montoApertura: '',
        observaciones: '',
        monto: '',
        descripcion: '',
        observacionesEgreso: ''
    });

    // Cargar estado de caja al montar el componente
    useEffect(() => {
        cargarEstadoCaja();
    }, []);

    const cargarEstadoCaja = async () => {
        setLoading(true);
        setError('');
        try {
            // Usamos el servicio de caja que ya maneja la lógica de verificación
            const estadoCaja = await cajaService.obtenerEstado();
            
            if (estadoCaja.existeCaja && estadoCaja.caja) {
                // Si hay una caja abierta, la establecemos y cargamos sus movimientos
                setCaja(estadoCaja.caja);
                // Verificamos si la caja tiene un ID válido antes de cargar movimientos
                const idCaja = estadoCaja.caja.idCaja || estadoCaja.caja.id;
                if (idCaja) {
                    // Aseguramos que el ID se guarde en el estado
                    const cajaActualizada = { ...estadoCaja.caja, id: idCaja, idCaja: idCaja };
                    setCaja(cajaActualizada);
                    await cargarMovimientos(idCaja);
                } else {
                    console.warn('La caja no tiene un ID válido:', estadoCaja.caja);
                    setCaja(null);
                    setMovimientos([]);
                }
            } else {
                // No hay caja abierta
                setCaja(null);
                setMovimientos([]);
                
                // Mostramos el mensaje del servicio o uno por defecto
                const mensaje = estadoCaja.message || 'No hay caja abierta actualmente';
                console.log('Estado de caja:', mensaje);
                
                // Solo mostramos el error si es un mensaje de error real
                if (mensaje !== 'No hay caja abierta actualmente') {
                    setError(mensaje);
                }
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || 'Error al cargar estado de caja';
            setError(errorMessage);
            setCaja(null);
            setMovimientos([]);
            console.error('Error al cargar estado de caja:', err);
        } finally {
            setLoading(false);
        }
    };

    const cargarMovimientos = async (idCaja) => {
        if (!idCaja) {
            console.warn('No se proporcionó un ID de caja para cargar movimientos');
            setMovimientos([]);
            return;
        }
        
        try {
            console.log(`Solicitando movimientos para caja con ID: ${idCaja}`);
            const response = await apiClient.get(`/caja/${idCaja}/movimientos`);
            console.log('Respuesta de movimientos:', response.data);
            
            // Asegurarse de que siempre sea un array, incluso si la respuesta no es la esperada
            const movimientosData = Array.isArray(response.data) 
                ? response.data 
                : (Array.isArray(response.data?.movimientos) ? response.data.movimientos : []);
                
            console.log('Movimientos cargados:', movimientosData);
            setMovimientos(movimientosData);
        } catch (err) {
            console.error('Error al cargar movimientos:', err);
            // En caso de error, establecer un array vacío
            setMovimientos([]);
        }
    };

    const abrirCaja = async () => {
        // Validar que el monto sea un número válido
        const monto = parseFloat(formData.montoApertura);
        if (isNaN(monto) || monto <= 0) {
            setError('El monto de apertura debe ser un número mayor a 0');
            return;
        }

        // Obtener el nombre de usuario del localStorage
        const usuario = localStorage.getItem('username');
        if (!usuario) {
            setError('No se pudo obtener el nombre de usuario. Por favor, inicie sesión nuevamente.');
            return;
        }

        setLoading(true);
        setError('');
        
        try {
            console.log('Enviando solicitud para abrir caja con:', {
                montoApertura: monto,
                usuario: usuario,
                observaciones: formData.observaciones || ''
            });

            const response = await apiClient.post('/caja/abrir', {
                montoApertura: monto,
                usuario: usuario,
                observaciones: formData.observaciones || ''
            });

            console.log('Respuesta del servidor:', response.data);

            if (response.data.success) {
                setCaja(response.data.caja);
                setMovimientos([]);
                setShowAbrirModal(false);
                setFormData({ montoApertura: '', observaciones: '' });
                // Recargar el estado de la caja para asegurar consistencia
                await cargarEstadoCaja();
            } else {
                setError(response.data.message || 'Error al abrir la caja');
            }
        } catch (err) {
            console.error('Error al abrir caja:', err);
            const errorMessage = err.response?.data?.message || 
                               (err.response?.status === 403 ? 'No tiene permisos para abrir la caja. Se requiere rol de ADMIN.' : 
                               'Error al abrir la caja. Verifique los datos e intente nuevamente.');
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const cerrarCaja = async () => {
        setLoading(true);
        try {
            const response = await apiClient.post(`/caja/${caja.id}/cerrar`, {
                usuario: localStorage.getItem('username') || 'admin',
                observaciones: formData.observaciones
            });

            if (response.data.success) {
                setCaja(response.data.caja);
                setShowCerrarModal(false);
                setFormData({ observaciones: '' });
                setError('');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Error al cerrar caja');
        } finally {
            setLoading(false);
        }
    };

    const registrarEgreso = async () => {
        if (!formData.monto || formData.monto <= 0) {
            setError('El monto debe ser mayor a 0');
            return;
        }

        if (!formData.descripcion.trim()) {
            setError('La descripción es obligatoria');
            return;
        }

        setLoading(true);
        try {
            const response = await apiClient.post(`/caja/${caja.id}/egreso`, {
                monto: parseFloat(formData.monto),
                descripcion: formData.descripcion,
                usuario: localStorage.getItem('username') || 'admin',
                observaciones: formData.observacionesEgreso
            });

            if (response.data.success) {
                cargarMovimientos(caja.id);
                setShowEgresoModal(false);
                setFormData({ monto: '', descripcion: '', observacionesEgreso: '' });
                setError('');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Error al registrar egreso');
        } finally {
            setLoading(false);
        }
    };

    const generarReporte = async () => {
        try {
            const response = await apiClient.get(`/caja/${caja.id}/reporte`, {
                responseType: 'blob'
            });
            
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `reporte_caja_${caja.id}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            setError('Error al generar reporte: ' + err.message);
        }
    };

    const formatearFecha = (fecha) => {
        return new Date(fecha).toLocaleString('es-ES');
    };

    const formatearMonto = (monto) => {
        return new Intl.NumberFormat('es-PE', {
            style: 'currency',
            currency: 'PEN'
        }).format(monto);
    };

    if (loading && !caja) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
                <Spinner animation="border" />
            </div>
        );
    }

    return (
        <div className="container-fluid">
            {/* Header */}
            <div className="mb-4">
                <h2 className="mb-2 fw-bold text-dark">
                    💰 Caja del Día
                </h2>
                <p className="text-muted mb-0">
                    Control de efectivo diario
                </p>
            </div>

            {/* Alertas de error */}
            {error && (
                <Alert variant="danger" dismissible onClose={() => setError('')}>
                    {error}
                </Alert>
            )}

            {/* Estado de Caja */}
            {loading ? (
                <div className="text-center py-5">
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-2">Cargando información de caja...</p>
                </div>
            ) : caja ? (
                <Row className="mb-4">
                    <Col lg={8}>
                        <Card className="shadow-sm border-0">
                            <Card.Header className="bg-transparent border-0 pb-0">
                                <div className="d-flex justify-content-between align-items-center">
                                    <h5 className="mb-0 fw-bold text-dark">
                                        Estado de Caja
                                    </h5>
                                    <Badge bg={caja.estado === 'ABIERTA' ? 'success' : 'secondary'}>
                                        {caja.estado === 'ABIERTA' ? 'Abierta' : 'Cerrada'}
                                    </Badge>
                                </div>
                            </Card.Header>
                            <Card.Body>
                                <Row>
                                    <Col md={3}>
                                        <div className="text-center p-3 rounded bg-light">
                                            <DollarSign size={24} className="text-primary mb-2" />
                                            <h6 className="mb-1 small text-muted">Apertura</h6>
                                            <h5 className="mb-0 fw-bold">{formatearMonto(caja.montoApertura)}</h5>
                                        </div>
                                    </Col>
                                    <Col md={3}>
                                        <div className="text-center p-3 rounded bg-light">
                                            <TrendingUp size={24} className="text-success mb-2" />
                                            <h6 className="mb-1 small text-muted">Ingresos</h6>
                                            <h5 className="mb-0 fw-bold text-success">{formatearMonto(caja.totalIngresos)}</h5>
                                        </div>
                                    </Col>
                                    <Col md={3}>
                                        <div className="text-center p-3 rounded bg-light">
                                            <TrendingDown size={24} className="text-danger mb-2" />
                                            <h6 className="mb-1 small text-muted">Egresos</h6>
                                            <h5 className="mb-0 fw-bold text-danger">{formatearMonto(caja.totalEgresos)}</h5>
                                        </div>
                                    </Col>
                                    <Col md={3}>
                                        <div className="text-center p-3 rounded bg-light">
                                            <DollarSign size={24} className="text-primary mb-2" />
                                            <h6 className="mb-1 small text-muted">Saldo Actual</h6>
                                            <h5 className="mb-0 fw-bold text-primary">{formatearMonto(caja.saldoActual)}</h5>
                                        </div>
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col lg={4}>
                        <Card className="shadow-sm border-0">
                            <Card.Body>
                                <h6 className="fw-bold mb-3">Acciones</h6>
                                <div className="d-grid gap-2">
                                    {caja.estado === 'ABIERTA' ? (
                                        <>
                                            <Button 
                                                variant="outline-danger" 
                                                onClick={() => setShowCerrarModal(true)}
                                                disabled={loading}
                                            >
                                                <XCircle size={16} className="me-2" />
                                                Cerrar Caja
                                            </Button>
                                            <Button 
                                                variant="outline-warning" 
                                                onClick={() => setShowEgresoModal(true)}
                                                disabled={loading}
                                            >
                                                <Minus size={16} className="me-2" />
                                                Registrar Egreso
                                            </Button>
                                        </>
                                    ) : (
                                        <Button 
                                            variant="success" 
                                            onClick={() => setShowAbrirModal(true)}
                                            disabled={loading}
                                        >
                                            <Plus size={16} className="me-2" />
                                            Abrir Nueva Caja
                                        </Button>
                                    )}
                                    <Button 
                                        variant="outline-primary" 
                                        onClick={generarReporte}
                                        disabled={loading}
                                    >
                                        <Download size={16} className="me-2" />
                                        Generar Reporte
                                    </Button>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            ) : (
                <Card className="shadow-sm border-0">
                    <Card.Body className="text-center py-5">
                        <div className="mb-4">
                            <Clock size={48} className="text-muted mb-3" />
                            <h4 className="mb-3">No hay caja abierta</h4>
                            <p className="text-muted mb-4">
                                Actualmente no hay una caja abierta. Para comenzar a registrar movimientos,
                                por favor abre una nueva caja.
                            </p>
                            <Button 
                                variant="primary" 
                                onClick={() => setShowAbrirModal(true)}
                                disabled={loading}
                                className="px-4"
                            >
                                <Plus size={16} className="me-2" />
                                Abrir Nueva Caja
                            </Button>
                        </div>
                    </Card.Body>
                </Card>
            )}

            {/* Movimientos */}
            {caja && Array.isArray(movimientos) && movimientos.length > 0 && (
                <Card className="shadow-sm border-0">
                    <Card.Header className="bg-transparent border-0 pb-0">
                        <h5 className="mb-0 fw-bold text-dark">
                            Movimientos del Día
                        </h5>
                    </Card.Header>
                    <Card.Body>
                        <Table responsive hover>
                            <thead>
                                <tr>
                                    <th>Hora</th>
                                    <th>Tipo</th>
                                    <th>Descripción</th>
                                    <th>Monto</th>
                                    <th>Usuario</th>
                                </tr>
                            </thead>
                            <tbody>
                                {movimientos.map((mov) => (
                                    <tr key={mov.idMovimiento}>
                                        <td>
                                            <small className="text-muted">
                                                {formatearFecha(mov.fechaMovimiento)}
                                            </small>
                                        </td>
                                        <td>
                                            <Badge bg={mov.tipoMovimiento === 'INGRESO' ? 'success' : 'danger'}>
                                                {mov.tipoMovimiento === 'INGRESO' ? 'Ingreso' : 'Egreso'}
                                            </Badge>
                                        </td>
                                        <td>{mov.descripcion}</td>
                                        <td className={mov.tipoMovimiento === 'INGRESO' ? 'text-success' : 'text-danger'}>
                                            <strong>
                                                {mov.tipoMovimiento === 'INGRESO' ? '+' : '-'}
                                                {formatearMonto(mov.monto)}
                                            </strong>
                                        </td>
                                        <td>
                                            <small className="text-muted">{mov.usuarioRegistro}</small>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </Card.Body>
                </Card>
            )}

            {/* Modal Abrir Caja */}
            <Modal show={showAbrirModal} onHide={() => setShowAbrirModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Abrir Caja del Día</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Monto de Apertura *</Form.Label>
                            <Form.Control
                                type="number"
                                step="0.01"
                                min="0"
                                value={formData.montoApertura}
                                onChange={(e) => setFormData({...formData, montoApertura: e.target.value})}
                                placeholder="0.00"
                            />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Observaciones</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={formData.observaciones}
                                onChange={(e) => setFormData({...formData, observaciones: e.target.value})}
                                placeholder="Observaciones opcionales..."
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowAbrirModal(false)}>
                        Cancelar
                    </Button>
                    <Button variant="success" onClick={abrirCaja} disabled={loading}>
                        {loading ? <Spinner size="sm" /> : 'Abrir Caja'}
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Modal Cerrar Caja */}
            <Modal show={showCerrarModal} onHide={() => setShowCerrarModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Cerrar Caja del Día</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Alert variant="warning">
                        <AlertCircle size={16} className="me-2" />
                        ¿Estás seguro de cerrar la caja? Esta acción no se puede deshacer.
                    </Alert>
                    <Form>
                        <Form.Group>
                            <Form.Label>Observaciones de Cierre</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={formData.observaciones}
                                onChange={(e) => setFormData({...formData, observaciones: e.target.value})}
                                placeholder="Observaciones opcionales..."
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowCerrarModal(false)}>
                        Cancelar
                    </Button>
                    <Button variant="danger" onClick={cerrarCaja} disabled={loading}>
                        {loading ? <Spinner size="sm" /> : 'Cerrar Caja'}
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Modal Registrar Egreso */}
            <Modal show={showEgresoModal} onHide={() => setShowEgresoModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Registrar Egreso</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Monto *</Form.Label>
                            <Form.Control
                                type="number"
                                step="0.01"
                                min="0.01"
                                value={formData.monto}
                                onChange={(e) => setFormData({...formData, monto: e.target.value})}
                                placeholder="0.00"
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Descripción *</Form.Label>
                            <Form.Control
                                type="text"
                                value={formData.descripcion}
                                onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                                placeholder="Ej: Compra de bolsas, mantenimiento..."
                            />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Observaciones</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={2}
                                value={formData.observacionesEgreso}
                                onChange={(e) => setFormData({...formData, observacionesEgreso: e.target.value})}
                                placeholder="Observaciones opcionales..."
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowEgresoModal(false)}>
                        Cancelar
                    </Button>
                    <Button variant="warning" onClick={registrarEgreso} disabled={loading}>
                        {loading ? <Spinner size="sm" /> : 'Registrar Egreso'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default CajaDelDia;
