import { useState, useEffect } from "react";
import { Modal, Button, Form, Alert, Spinner } from "react-bootstrap";
import { User, Edit } from "lucide-react";
import apiClient from "../../servicios/apiClient";

const EditarCliente = ({ show, onHide, cliente, onClienteEditado }) => {
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

    useEffect(() => {
        if (cliente) {
            setFormData({
                dni: cliente.dni || "",
                nombres: cliente.nombres || "",
                apellidos: cliente.apellidos || "",
                direccion: cliente.direccion || "",
                telefono: cliente.telefono || "",
                email: cliente.email || ""
            });
        }
    }, [cliente]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.dni || !formData.nombres) {
            setError("El DNI y los nombres son obligatorios.");
            return;
        }

        setLoading(true);
        setError("");

        try {
            await apiClient.put(`/clientes/${cliente.idCliente}`, formData);
            onClienteEditado();
        } catch (err) {
            console.error("Error al actualizar cliente:", err);
            if (err.response?.data?.error) {
                setError(err.response.data.error);
            } else {
                setError("Error al actualizar el cliente. Intente nuevamente.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setError("");
        onHide();
    };

    return (
        <Modal show={show} onHide={handleClose} size="lg" centered>
            <Modal.Header closeButton>
                <Modal.Title>
                    <Edit size={20} className="me-2" />
                    Editar Cliente
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
                        {/* DNI */}
                        <div className="col-md-6 mb-3">
                            <Form.Label>DNI *</Form.Label>
                            <Form.Control
                                type="text"
                                name="dni"
                                value={formData.dni}
                                onChange={handleInputChange}
                                placeholder="12345678"
                                maxLength="8"
                                required
                            />
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

                    {/* Información del cliente */}
                    <Alert variant="info" className="mt-3">
                        <h6 className="alert-heading">Información del Cliente</h6>
                        <p className="mb-1">
                            <strong>ID:</strong> {cliente?.idCliente}
                        </p>
                        <p className="mb-1">
                            <strong>Fecha de Registro:</strong> {cliente?.fechaRegistro ? 
                                new Date(cliente.fechaRegistro).toLocaleDateString('es-ES') : 'N/A'
                            }
                        </p>
                        <p className="mb-0">
                            <strong>Estado:</strong> {cliente?.activo ? 'Activo' : 'Inactivo'}
                        </p>
                    </Alert>
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Cancelar
                    </Button>
                    <Button 
                        variant="primary" 
                        type="submit" 
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <Spinner animation="border" size="sm" className="me-2" />
                                Actualizando...
                            </>
                        ) : (
                            "Actualizar Cliente"
                        )}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default EditarCliente;
