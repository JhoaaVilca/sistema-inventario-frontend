import { useState, useEffect } from "react";
import { Modal, Button, Form, Alert } from "react-bootstrap";
import apiClient from "../../servicios/apiClient";

function FormularioCategoria({ 
    show, 
    handleClose, 
    onCategoriaAdded, 
    onCategoriaUpdated,
    inlineMode = false, 
    categoriaEditar = null,
    modoEdicion = false 
}) {
    const [nombre, setNombre] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [activo, setActivo] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [validated, setValidated] = useState(false);

    useEffect(() => {
        if (modoEdicion && categoriaEditar) {
            // Modo edición: cargar datos de la categoría
            setNombre(categoriaEditar.nombre || "");
            setDescripcion(categoriaEditar.descripcion || "");
            setActivo(categoriaEditar.activo !== undefined ? categoriaEditar.activo : true);
            setError("");
            setValidated(false);
        } else if (show || inlineMode) {
            // Modo agregar: limpiar formulario
            setNombre("");
            setDescripcion("");
            setActivo(true);
            setError("");
            setValidated(false);
        }
    }, [show, inlineMode, modoEdicion, categoriaEditar]);

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
            const datosCategoria = {
                nombre: nombre.trim(),
                descripcion: descripcion.trim(),
                activo: activo
            };

            if (modoEdicion && categoriaEditar) {
                // Modo edición
                await apiClient.put(`/categorias/${categoriaEditar.idCategoria}`, datosCategoria);
                
                // Notificar al componente padre
                if (onCategoriaUpdated) {
                    onCategoriaUpdated();
                }
            } else {
                // Modo agregar
                await apiClient.post("/categorias", datosCategoria);
                
                // Limpiar formulario
                setNombre("");
                setDescripcion("");
                setActivo(true);
                setValidated(false);
                
                if (!inlineMode) {
                    handleClose();
                }

                // Notificar al componente padre
                if (onCategoriaAdded) {
                    onCategoriaAdded();
                }
            }
        } catch (error) {
            console.error("Error al procesar categoría:", error);
            if (error.response?.status === 409) {
                setError("Ya existe una categoría con ese nombre.");
            } else if (error.response?.data?.message) {
                setError(error.response.data.message);
            } else {
                setError(`Error al ${modoEdicion ? 'actualizar' : 'agregar'} la categoría. Intente nuevamente.`);
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

    const formContent = (
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
                {!inlineMode && (
                    <Button
                        variant="secondary"
                        onClick={handleCloseModal}
                        disabled={loading}
                    >
                        Cancelar
                    </Button>
                )}
                <Button
                    variant={modoEdicion ? "warning" : "success"}
                    type="submit"
                    disabled={loading || !nombre.trim()}
                >
                    {loading ? (
                        <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            {modoEdicion ? "Actualizando..." : "Guardando..."}
                        </>
                    ) : (
                        modoEdicion ? "Actualizar Categoría" : "Guardar Categoría"
                    )}
                </Button>
            </div>
        </Form>
    );

    if (inlineMode) {
        return formContent;
    }

    return (
        <Modal show={show} onHide={handleCloseModal} backdrop={loading ? "static" : true}>
            <Modal.Header closeButton={!loading}>
                <Modal.Title>
                    {modoEdicion ? "Editar Categoría" : "Agregar Nueva Categoría"}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {formContent}
            </Modal.Body>
        </Modal>
    );
}

export default FormularioCategoria;
