import { useState, useEffect } from "react";
import { Modal, Button, Form, Alert } from "react-bootstrap";
import axios from "axios";
import { useCategorias } from "./useCategorias";

function AgregarProductos({ show, handleClose, onProductoAdded }) {
    const [nombreProducto, setNombreProducto] = useState("");
    const [precio, setPrecio] = useState("");
    const [stock, setStock] = useState("");
    const [categoria, setCategoria] = useState("");
    const [fechaIngreso, setFechaIngreso] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const { categorias } = useCategorias();

    // Resetear formulario cada vez que se abre el modal
    useEffect(() => {
        if (show) {
            setNombreProducto("");
            setPrecio("");
            setStock("");
            setCategoria("");
            setFechaIngreso("");
            setError("");
        }
    }, [show]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!categoria) {
            setError("Por favor selecciona una categoría");
            return;
        }

        const nuevoProducto = {
            nombreProducto,
            precio: parseFloat(precio),
            stock: parseInt(stock, 10),
            fechaIngreso,
            idCategoria: parseInt(categoria, 10), // ✅ enviar idCategoria, no el nombre
        };

        setLoading(true);
        setError("");

        try {
            const response = await axios.post("http://localhost:8080/api/productos", nuevoProducto);

            // limpiar formulario
            setNombreProducto("");
            setPrecio("");
            setStock("");
            setCategoria("");
            setFechaIngreso("");
            setError("");

            handleClose();
            onProductoAdded(response.data); // notificar al padre
        } catch (error) {
            console.error("Error al agregar producto:", error);

            if (error.response?.data?.error) {
                setError(error.response.data.error);
            } else if (error.response?.data?.message) {
                setError(error.response.data.message);
            } else {
                setError("Error al agregar el producto. Intente nuevamente.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleCloseModal = () => {
        if (!loading) {
            setError("");
            handleClose();
        }
    };

    return (
        <Modal show={show} onHide={handleCloseModal} backdrop={loading ? "static" : true}>
            <Modal.Header closeButton={!loading}>
                <Modal.Title>Agregar Producto</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {error && (
                    <Alert variant="danger" dismissible onClose={() => setError("")}>
                        {error}
                    </Alert>
                )}
                <Form onSubmit={handleSubmit}>
                    <Form.Group controlId="formNombreProducto" className="mb-3">
                        <Form.Label>Nombre del Producto</Form.Label>
                        <Form.Control
                            type="text"
                            value={nombreProducto}
                            onChange={(e) => setNombreProducto(e.target.value)}
                            placeholder="Ingresa el nombre del producto"
                            required
                        />
                    </Form.Group>
                    <Form.Group controlId="formPrecio" className="mb-3">
                        <Form.Label>Precio</Form.Label>
                        <Form.Control
                            type="number"
                            value={precio}
                            onChange={(e) => setPrecio(e.target.value)}
                            placeholder="Ingresa el precio del producto"
                            required
                        />
                    </Form.Group>
                    <Form.Group controlId="formStock" className="mb-3">
                        <Form.Label>Stock</Form.Label>
                        <Form.Control
                            type="number"
                            value={stock}
                            onChange={(e) => setStock(e.target.value)}
                            placeholder="Ingresa la cantidad disponible"
                            required
                        />
                    </Form.Group>
                    <Form.Group controlId="formCategoria" className="mb-3">
                        <Form.Label>Categoría <span className="text-danger">*</span></Form.Label>
                        <Form.Select
                            value={categoria}
                            onChange={(e) => setCategoria(e.target.value)}
                            required
                        >
                            <option value="">Selecciona una categoría</option>
                            {categorias.map((cat) => (
                                <option key={cat.idCategoria} value={cat.idCategoria}>
                                    {cat.nombre}
                                </option>
                            ))}
                        </Form.Select>
                    </Form.Group>
                    <Form.Group controlId="formFechaIngreso" className="mb-3">
                        <Form.Label>Fecha de Ingreso</Form.Label>
                        <Form.Control
                            type="date"
                            value={fechaIngreso}
                            onChange={(e) => setFechaIngreso(e.target.value)}
                            required
                        />
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
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                    Guardando...
                                </>
                            ) : (
                                "Guardar Producto"
                            )}
                        </Button>
                    </div>
                </Form>
            </Modal.Body>
        </Modal>
    );
}

export default AgregarProductos;
