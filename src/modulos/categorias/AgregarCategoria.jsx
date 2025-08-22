import { useState, useEffect } from "react";
import { Modal, Button, Form, Alert } from "react-bootstrap";
import axios from "axios";

function AgregarCategoria({ show, handleClose, onCategoriaAdded }) {
    const [nombre, setNombre] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [validated, setValidated] = useState(false);

    useEffect(() => {
        if (show) {
            setNombre("");
            setError("");
            setValidated(false);
        }
    }, [show]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const form = e.currentTarget;
        
        if (form.checkValidity() === false) {
            e.stopPropagation();
            setValidated(true);
            return;
        }

        setLoading(true);
        setError("");

        try {
            const nuevaCategoria = {
                nombre: nombre.trim()
            };

            await axios.post("http://localhost:8080/api/categorias", nuevaCategoria);
            
            // Limpiar formulario y cerrar modal
            setNombre("");
            setValidated(false);
            handleClose();
            
            // Notificar al componente padre
            onCategoriaAdded();
        } catch (error) {
            console.error("Error al agregar categoría:", error);
            if (error.response?.status === 409) {
                setError("Ya existe una categoría con ese nombre.");
            } else if (error.response?.data?.message) {
                setError(error.response.data.message);
            } else {
                setError("Error al agregar la categoría. Intente nuevamente.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleCloseModal = () => {
        if (!loading) {
            setNombre("");
            setError("");
            setValidated(false);
            handleClose();
        }
    };

    return (
        <Modal show={show} onHide={handleCloseModal} backdrop={loading ? "static" : true}>
            <Modal.Header closeButton={!loading}>
                <Modal.Title>Agregar Nueva Categoría</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form noValidate validated={validated} onSubmit={handleSubmit}>
                    {error && (
                        <Alert variant="danger" dismissible onClose={() => setError("")}>
                            {error}
                        </Alert>
                    )}

                    <Form.Group controlId="formNombre" className="mb-3">
                        <Form.Label>
                            Nombre de la Categoría <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Control
                            type="text"
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                            placeholder="Ej: Bebidas, Alimentos, Limpieza..."
                            required
                            minLength={2}
                            maxLength={50}
                            isInvalid={validated && (!nombre.trim() || nombre.trim().length < 2 || nombre.trim().length > 50)}
                            disabled={loading}
                        />
                        <Form.Control.Feedback type="invalid">
                            {!nombre.trim() 
                                ? "El nombre es obligatorio" 
                                : nombre.trim().length < 2 
                                    ? "El nombre debe tener al menos 2 caracteres" 
                                    : "El nombre no puede exceder 50 caracteres"
                            }
                        </Form.Control.Feedback>
                        <Form.Text className="text-muted">
                            El nombre debe tener entre 2 y 50 caracteres.
                        </Form.Text>
                    </Form.Group>

                    <div className="d-flex justify-content-end gap-2 mt-4">
                        <Button 
                            variant="secondary" 
                            onClick={handleCloseModal}
                            disabled={loading}
                        >
                            Cancelar
                        </Button>
                        <Button 
                            variant="success" 
                            type="submit"
                            disabled={loading || !nombre.trim()}
                        >
                            {loading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                    Guardando...
                                </>
                            ) : (
                                "Guardar Categoría"
                            )}
                        </Button>
                    </div>
                </Form>
            </Modal.Body>
        </Modal>
    );
}

export default AgregarCategoria;
