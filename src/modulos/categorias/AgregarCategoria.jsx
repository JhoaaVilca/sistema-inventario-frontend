import { useState, useEffect } from "react";
import { Modal, Button, Form, Alert } from "react-bootstrap";
import apiClient from "../../servicios/apiClient";

function AgregarCategoria({ show, handleClose, onCategoriaAdded }) {
    const [nombre, setNombre] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [activo, setActivo] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [validated, setValidated] = useState(false);

    useEffect(() => {
        if (show) {
            setNombre("");
            setDescripcion("");
            setActivo(true);
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
                nombre: nombre.trim(),
                descripcion: descripcion.trim(),
                activo: activo
            };

            await apiClient.post("/categorias", nuevaCategoria);
            
            // Limpiar formulario y cerrar modal
            setNombre("");
            setDescripcion("");
            setActivo(true);
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
            setDescripcion("");
            setActivo(true);
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
                            maxLength={100}
                            isInvalid={validated && (!nombre.trim() || nombre.trim().length < 2 || nombre.trim().length > 100)}
                            disabled={loading}
                        />
                        <Form.Control.Feedback type="invalid">
                            {!nombre.trim() 
                                ? "El nombre es obligatorio" 
                                : nombre.trim().length < 2 
                                    ? "El nombre debe tener al menos 2 caracteres" 
                                    : "El nombre no puede exceder 100 caracteres"
                            }
                        </Form.Control.Feedback>
                        <Form.Text className="text-muted">
                            El nombre debe tener entre 2 y 100 caracteres.
                        </Form.Text>
                    </Form.Group>

                    <Form.Group controlId="formDescripcion" className="mb-3">
                        <Form.Label>Descripción</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            value={descripcion}
                            onChange={(e) => setDescripcion(e.target.value)}
                            placeholder="Descripción opcional de la categoría..."
                            maxLength={255}
                            disabled={loading}
                        />
                        <Form.Text className="text-muted">
                            Descripción opcional (máximo 255 caracteres).
                        </Form.Text>
                    </Form.Group>

                    <Form.Group controlId="formActivo" className="mb-3">
                        <Form.Label>Estado</Form.Label>
                        <Form.Select
                            value={activo}
                            onChange={(e) => setActivo(e.target.value === "true")}
                            disabled={loading}
                        >
                            <option value={true}>🟢 Activo</option>
                            <option value={false}>⚪ Inactivo</option>
                        </Form.Select>
                        <Form.Text className="text-muted">
                            Solo las categorías activas aparecerán en el selector de productos.
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
