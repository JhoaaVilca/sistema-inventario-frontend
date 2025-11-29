import { useState, useEffect } from 'react';
import { Card, Form, Button, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { Building2, Save } from 'lucide-react';
import empresaService from '../../servicios/empresaService';

const ConfiguracionEmpresa = () => {
    const [empresa, setEmpresa] = useState({
        nombreEmpresa: '',
        ruc: '',
        direccion: '',
        telefono: '',
        email: '',
        descripcion: ''
    });
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const cargarConfiguracion = async () => {
        setLoading(true);
        setError('');
        try {
            const data = await empresaService.obtenerConfiguracion();
            const saneada = {
                nombreEmpresa: data?.nombreEmpresa ?? '',
                ruc: data?.ruc ?? '',
                direccion: data?.direccion ?? '',
                telefono: data?.telefono ?? '',
                email: data?.email ?? '',
                descripcion: data?.descripcion ?? ''
            };
            setEmpresa(saneada);
        } catch (err) {
            console.error('Error:', err);
            if (err.response?.status === 401 || err.response?.status === 403) {
                setError('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
                // Redirigir al login después de 2 segundos
                setTimeout(() => {
                    window.location.href = '/login';
                }, 2000);
            } else {
                setError('Error al cargar la configuración de la empresa. Inténtalo de nuevo.');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        cargarConfiguracion();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEmpresa(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        setSuccess('');

        try {
            await empresaService.actualizarConfiguracion(empresa);
            setSuccess('Configuración de la empresa actualizada correctamente');
        } catch (err) {
            console.error('Error:', err);
            if (err.response?.status === 401 || err.response?.status === 403) {
                setError('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
                // Redirigir al login después de 2 segundos
                setTimeout(() => {
                    window.location.href = '/login';
                }, 2000);
            } else if (err.response?.status === 400) {
                setError('Datos inválidos. Por favor, revisa la información ingresada.');
            } else {
                setError('Error al actualizar la configuración. Inténtalo de nuevo.');
            }
        } finally {
            setSaving(false);
        }
    };

    

    return (
        <div className="mt-4">
            {/* Header */}
            <div className="d-flex align-items-center gap-3 mb-4 p-3 bg-white rounded-3 shadow-sm border">
                <div className="p-2 bg-primary bg-opacity-10 rounded-3">
                    <Building2 size={24} className="text-primary" />
                </div>
                <div>
                    <h3 className="mb-0 text-dark fw-bold">Configuración de Empresa</h3>
                    <small className="text-muted">Gestiona los datos de tu empresa para las boletas y reportes</small>
                </div>
                {loading && <Spinner animation="border" size="sm" />}
            </div>

            {/* Mensajes */}
            {error && (
                <Alert variant="danger" className="mb-3">
                    {error}
                </Alert>
            )}
            {success && (
                <Alert variant="success" className="mb-3">
                    {success}
                </Alert>
            )}

            {/* Formulario */}
            <Card className="shadow-sm">
                <Card.Header className="bg-light">
                    <h5 className="mb-0">Datos de la Empresa</h5>
                </Card.Header>
                <Card.Body>
                    {loading ? (
                        <div className="text-center py-4">
                            <Spinner animation="border" />
                            <p className="mt-2 text-muted">Cargando configuración...</p>
                        </div>
                    ) : (
                        <Form onSubmit={handleSubmit}>
                            <Row className="g-3">
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label>Nombre de la Empresa *</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="nombreEmpresa"
                                            value={empresa.nombreEmpresa}
                                            onChange={handleInputChange}
                                            placeholder="Ej: COMERCIAL YOLI"
                                            required
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label>RUC</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="ruc"
                                            value={empresa.ruc}
                                            onChange={handleInputChange}
                                            placeholder="Ej: 12345678901"
                                            maxLength={20}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={12}>
                                    <Form.Group>
                                        <Form.Label>Dirección</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="direccion"
                                            value={empresa.direccion}
                                            onChange={handleInputChange}
                                            placeholder="Ej: Av. Principal 123, Lima"
                                            maxLength={500}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label>Teléfono</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="telefono"
                                            value={empresa.telefono}
                                            onChange={handleInputChange}
                                            placeholder="Ej: (01) 234-5678"
                                            maxLength={20}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label>Email</Form.Label>
                                        <Form.Control
                                            type="email"
                                            name="email"
                                            value={empresa.email}
                                            onChange={handleInputChange}
                                            placeholder="Ej: contacto@empresa.com"
                                            maxLength={100}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={12}>
                                    <Form.Group>
                                        <Form.Label>Descripción</Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            rows={3}
                                            name="descripcion"
                                            value={empresa.descripcion}
                                            onChange={handleInputChange}
                                            placeholder="Descripción adicional de la empresa..."
                                            maxLength={500}
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>

                            <div className="d-flex gap-2 mt-4">
                                <Button
                                    type="submit"
                                    variant="primary"
                                    disabled={saving}
                                    className="d-flex align-items-center"
                                >
                                    <Save size={16} className="me-2" />
                                    {saving ? 'Guardando...' : 'Guardar Configuración'}
                                </Button>
                            </div>
                        </Form>
                    )}
                </Card.Body>
            </Card>

            {/* Información adicional */}
            <Card className="mt-4 shadow-sm">
                <Card.Header className="bg-info bg-opacity-10">
                    <h6 className="mb-0 text-info">
                        <Building2 size={16} className="me-2" />
                        Información Importante
                    </h6>
                </Card.Header>
                <Card.Body>
                    <ul className="mb-0">
                        <li>Los datos configurados aquí aparecerán en todas las boletas de venta y reportes.</li>
                        <li>El nombre de la empresa es obligatorio.</li>
                        <li>Los cambios se aplicarán inmediatamente a las nuevas boletas generadas.</li>
                        <li>Puedes actualizar esta información en cualquier momento.</li>
                    </ul>
                </Card.Body>
            </Card>
        </div>
    );
};

export default ConfiguracionEmpresa;
