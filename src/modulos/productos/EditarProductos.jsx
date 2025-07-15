import { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";

function EditarProductos({ show, handleClose, producto, onProductoEditado }) {
    const [nombreProducto, setNombreProducto] = useState("");
    const [precio, setPrecio] = useState("");
    const [stock, setStock] = useState("");
    const [categoria, setCategoria] = useState("");
    const [fechaIngreso, setFechaIngreso] = useState("");

    // Cargar los datos cuando cambia el producto
    useEffect(() => {
        if (producto) {
            setNombreProducto(producto.nombreProducto);
            setPrecio(producto.precio);
            setStock(producto.stock);
            setCategoria(producto.categoria);
            setFechaIngreso(producto.fechaIngreso?.split("T")[0]); // YYYY-MM-DD
        }
    }, [producto]);

    const handleSubmit = (e) => {
        e.preventDefault();

        const productoActualizado = {
            ...producto,
            nombreProducto,
            precio: parseFloat(precio),
            stock: parseInt(stock),
            categoria,
            fechaIngreso,
        };

        fetch(`http://localhost:8080/api/productos/${producto.idProducto}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(productoActualizado),
        })
            .then((res) => res.json())
            .then((data) => {
                onProductoEditado(data); // Actualiza la lista
                handleClose();           // Cierra el modal
            })
            .catch((err) => console.error("Error al actualizar producto:", err));
    };

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Editar Producto</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label>Nombre del Producto</Form.Label>
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
                        <Form.Label>Categoría</Form.Label>
                        <Form.Control
                            type="text"
                            value={categoria}
                            onChange={(e) => setCategoria(e.target.value)}
                            required
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Fecha de Ingreso</Form.Label>
                        <Form.Control
                            type="date"
                            value={fechaIngreso}
                            onChange={(e) => setFechaIngreso(e.target.value)}
                            required
                        />
                    </Form.Group>

                    <Button variant="primary" type="submit">
                        Guardar Cambios
                    </Button>
                </Form>
            </Modal.Body>
        </Modal>
    );
}

export default EditarProductos;
