import { useState, useEffect, useCallback } from "react";
import { Modal, Button, Form, Alert, Spinner } from "react-bootstrap";
import { User, Search, CheckCircle, AlertCircle } from "lucide-react";
import apiClient from "../../servicios/apiClient";

const AgregarCliente = ({ show, onHide = () => {}, onClienteAgregado = () => {}, clienteInicial = null }) => {
    const [formData, setFormData] = useState({
        dni: "",
        nombres: "",
        apellidos: "",
        direccion: "",
        telefono: "",
        email: ""
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [validatingDni, setValidatingDni] = useState(false);
    const [dniValidation, setDniValidation] = useState(null); // null, 'valid', 'invalid', 'found'
    const [clienteEncontrado, setClienteEncontrado] = useState(null);

    const validarDni = useCallback(async () => {
        if (!formData.dni || formData.dni.length !== 8) {
            setDniValidation('invalid');
            setClienteEncontrado(null);
            return;
        }

        setValidatingDni(true);
        setError("");

        try {
            const { data } = await apiClient.get(`/clientes/buscar-dni/${formData.dni}`);

            if (data.existeEnBD) {
                setDniValidation('found');
                setClienteEncontrado(data);
                setFormData(prev => ({
                    ...prev,
                    nombres: data.nombres,
                    apellidos: data.apellidos,
                    direccion: data.direccion || ""
                }));
            } else if (data.nombres) {
                setDniValidation('valid');
                setClienteEncontrado(data);
                setFormData(prev => ({
                    ...prev,
                    nombres: data.nombres,
                    apellidos: data.apellidos,
                    direccion: data.direccion || ""
                }));
            } else {
                setDniValidation('invalid');
                setClienteEncontrado(null);
            }
        } catch (err) {
            console.error("Error al validar DNI:", err);
            setDniValidation('invalid');
            setClienteEncontrado(null);
            setError("Error al validar el DNI. Intente nuevamente.");
        } finally {
            setValidatingDni(false);
        }
    }, [formData.dni]);

    // Inicializar con clienteInicial si se proporciona
    useEffect(() => {
        if (clienteInicial && show) {
            setFormData(prev => ({
                ...prev,
                dni: clienteInicial.dni || ""
            }));
            // Si ya tenemos el DNI, validarlo automáticamente
            if (clienteInicial.dni && clienteInicial.dni.length === 8) {
                setTimeout(() => validarDni(), 100);
            }
        }
    }, [clienteInicial, show, validarDni]);

    // Limpiar cuando se cierre el modal
    useEffect(() => {
        if (!show) {
            setFormData({
                dni: "",
                nombres: "",
                apellidos: "",
                direccion: "",
                telefono: "",
                email: ""
            });
            setError("");
            setDniValidation(null);
            setClienteEncontrado(null);
        }
    }, [show]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        let nuevoValor = value;
        if (name === 'dni') {
            nuevoValor = (value || '').replace(/\D/g, '').slice(0, 8);
        }
        setFormData(prev => ({
            ...prev,
            [name]: nuevoValor
        }));
    };

    

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (dniValidation === 'found') {
            setError("Este DNI ya está registrado en la base de datos.");
            return;
        }

        if (dniValidation !== 'valid' && dniValidation !== 'found') {
            setError("Debe validar el DNI antes de continuar.");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const { data } = await apiClient.post("/clientes", formData);
            // Pasar el cliente creado al callback
            onClienteAgregado(data);
        } catch (err) {
            console.error("Error al crear cliente:", err);
            if (err.response?.data?.error) {
                setError(err.response.data.error);
            } else {
                setError("Error al crear el cliente. Intente nuevamente.");
            }
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            dni: "",
            nombres: "",
            apellidos: "",
            direccion: "",
            telefono: "",
            email: ""
        });
        setError("");
        setDniValidation(null);
        setClienteEncontrado(null);
    };

    const handleClose = () => {
        resetForm();
        onHide();
    };

    // Este useEffect ya no es necesario porque ya tenemos el de limpiar cuando se cierre el modal

    return (
        <Modal show={show} onHide={handleClose} size="lg" centered>
            <Modal.Header closeButton>
                <Modal.Title>
                    <User size={20} className="me-2" />
                    Agregar Nuevo Cliente
                </Modal.Title>
            </Modal.Header>

            <Form onSubmit={handleSubmit}>
                <Modal.Body>
                    {error && (
                        <Alert variant="danger" className="mb-3">
                            {error}
                        </Alert>
                    )}

                    <div className="row">
                        {/* DNI con validación */}
                        <div className="col-md-6 mb-3">
                            <Form.Label>DNI *</Form.Label>
                            <div className="d-flex gap-2">
                                <Form.Control
                                    type="text"
                                    name="dni"
                                    value={formData.dni}
                                    onChange={handleInputChange}
                                    placeholder="12345678"
                                    maxLength="8"
                                    inputMode="numeric"
                                    pattern="\\d{8}"
                                    title="El DNI debe tener 8 dígitos numéricos"
                                    isInvalid={dniValidation === 'invalid'}
                                    isValid={dniValidation === 'valid' || dniValidation === 'found'}
                                />
                                <Button
                                    variant="outline-primary"
                                    onClick={validarDni}
                                    disabled={!formData.dni || formData.dni.length !== 8 || validatingDni}
                                    style={{ minWidth: '80px' }}
                                >
                                    {validatingDni ? (
                                        <Spinner animation="border" size="sm" />
                                    ) : (
                                        <Search size={16} />
                                    )}
                                </Button>
                            </div>

                            {/* Mensajes de validación */}
                            {dniValidation === 'invalid' && (
                                <Form.Control.Feedback type="invalid">
                                    DNI inválido. Debe tener 8 dígitos.
                                </Form.Control.Feedback>
                            )}

                            {dniValidation === 'valid' && (
                                <div className="text-success small mt-1 d-flex align-items-center">
                                    <CheckCircle size={14} className="me-1" />
                                    DNI válido - Cliente encontrado en RENIEC
                                </div>
                            )}

                            {dniValidation === 'found' && (
                                <div className="text-warning small mt-1 d-flex align-items-center">
                                    <AlertCircle size={14} className="me-1" />
                                    Cliente ya registrado en la base de datos
                                </div>
                            )}
                        </div>

                        {/* Nombres */}
                        <div className="col-md-6 mb-3">
                            <Form.Label>Nombres *</Form.Label>
                            <Form.Control
                                type="text"
                                name="nombres"
                                value={formData.nombres}
                                onChange={handleInputChange}
                                placeholder="Juan Carlos"
                                required
                            />
                        </div>

                        {/* Apellidos */}
                        <div className="col-md-6 mb-3">
                            <Form.Label>Apellidos</Form.Label>
                            <Form.Control
                                type="text"
                                name="apellidos"
                                value={formData.apellidos}
                                onChange={handleInputChange}
                                placeholder="Pérez García"
                            />
                        </div>

                        {/* Dirección */}
                        <div className="col-md-6 mb-3">
                            <Form.Label>Dirección</Form.Label>
                            <Form.Control
                                type="text"
                                name="direccion"
                                value={formData.direccion}
                                onChange={handleInputChange}
                                placeholder="Av. Principal 123"
                            />
                        </div>

                        {/* Teléfono */}
                        <div className="col-md-6 mb-3">
                            <Form.Label>Teléfono</Form.Label>
                            <Form.Control
                                type="tel"
                                name="telefono"
                                value={formData.telefono}
                                onChange={handleInputChange}
                                placeholder="999888777"
                            />
                        </div>

                        {/* Email */}
                        <div className="col-md-6 mb-3">
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                placeholder="cliente@email.com"
                            />
                        </div>
                    </div>

                    {/* Información del cliente encontrado */}
                    {clienteEncontrado && (
                        <Alert variant="info" className="mt-3">
                            <h6 className="alert-heading">Información del Cliente</h6>
                            <p className="mb-1">
                                <strong>DNI:</strong> {clienteEncontrado.dni}
                            </p>
                            <p className="mb-1">
                                <strong>Nombre:</strong> {clienteEncontrado.nombres} {clienteEncontrado.apellidos}
                            </p>
                            {clienteEncontrado.direccion && (
                                <p className="mb-0">
                                    <strong>Dirección:</strong> {clienteEncontrado.direccion}
                                </p>
                            )}
                        </Alert>
                    )}
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Cancelar
                    </Button>
                    <Button
                        variant="success"
                        type="submit"
                        disabled={loading || dniValidation === 'found'}
                    >
                        {loading ? (
                            <>
                                <Spinner animation="border" size="sm" className="me-2" />
                                Guardando...
                            </>
                        ) : (
                            "Guardar Cliente"
                        )}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default AgregarCliente;
