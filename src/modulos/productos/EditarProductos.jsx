import { useEffect, useState } from "react";
import { Modal, Button, Form, Spinner, Alert } from "react-bootstrap";

const EditarProducto = ({ show, handleClose, producto, onProductoUpdated }) => {
    const [nombreProducto, setNombreProducto] = useState("");
    const [precio, setPrecio] = useState("");
    const [stock, setStock] = useState("");
    const [fechaIngreso, setFechaIngreso] = useState("");
    const [categoria, setCategoria] = useState("");
    const [categorias, setCategorias] = useState([]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // ✅ Cargar categorías
    const cargarCategorias = async () => {
        try {
            const response = await fetch("http://localhost:8080/api/categorias");
            const data = await response.json();
            setCategorias(data);
        } catch (error) {
            console.error("Error al cargar categorías:", error);
        }
    };

    useEffect(() => {
        cargarCategorias();
    }, []);

    useEffect(() => {
        if (producto) {
            setNombreProducto(producto.nombreProducto);
            setPrecio(producto.precio);
            setStock(producto.stock);
            setFechaIngreso(producto.fechaIngreso);
            setCategoria(producto.idCategoria || "");
            setError("");
        }
    }, [producto]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const productoActualizado = {
            idProducto: producto.idProducto,
            nombreProducto,
            precio: parseFloat(precio),
            stock: parseInt(stock),
            fechaIngreso,
            idCategoria: parseInt(categoria),
        };

        try {
            const response = await fetch(
                `http://localhost:8080/api/productos/${producto.idProducto}`,
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(productoActualizado),
                }
            );

            if (response.ok) {
                onProductoUpdated();
                handleClose();
            } else {
                setError("⚠️ No se pudo actualizar el producto. Intente nuevamente.");
            }
        } catch (error) {
            console.error("Error en la petición:", error);
            setError("⚠️ Error de conexión con el servidor.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal show={show} onHide={handleClose} centered>
            <Modal.Header closeButton>
                <Modal.Title>Editar Producto</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {error && <Alert variant="danger">{error}</Alert>}
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label>Nombre</Form.Label>
                        <Form.Control
                            type="text"
                            value={nombreProducto}
                            onChange={(e) => setNombreProducto(e.target.value)}
                            required
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Precio</Form.Label>
                        <Form.Control
                            type="number"
                            value={precio}
                            onChange={(e) => setPrecio(e.target.value)}
                            step="0.01"
                            required
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Stock</Form.Label>
                        <Form.Control
                            type="number"
                            value={stock}
                            onChange={(e) => setStock(e.target.value)}
                            required
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Fecha Ingreso</Form.Label>
                        <Form.Control
                            type="date"
                            value={fechaIngreso}
                            onChange={(e) => setFechaIngreso(e.target.value)}
                            required
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Categoría</Form.Label>
                        <Form.Select
                            value={categoria}
                            onChange={(e) => setCategoria(e.target.value)}
                            required
                        >
                            <option value="">Seleccione una categoría</option>
                            {categorias.map((cat) => (
                                <option key={cat.idCategoria} value={cat.idCategoria}>
                                    {cat.nombre}
                                </option>
                            ))}
                        </Form.Select>
                    </Form.Group>

                    <div className="d-flex justify-content-end gap-2">
                        <Button variant="secondary" onClick={handleClose}>
                            Cancelar
                        </Button>
                        <Button type="submit" variant="primary" disabled={loading}>
                            {loading ? (
                                <>
                                    <Spinner
                                        as="span"
                                        animation="border"
                                        size="sm"
                                        role="status"
                                        aria-hidden="true"
                                    /> Guardando...
                                </>
                            ) : (
                                "Guardar cambios"
                            )}
                        </Button>
                    </div>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default EditarProducto;
