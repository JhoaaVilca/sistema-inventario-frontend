import { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";

// Las props que recibe ahora son 'show' para visibilidad, 'handleClose' para cerrar el modal
// y 'onProductoAdded' para notificar al componente padre que un producto fue agregado.
function AgregarProducto({ show, handleClose, onProductoAdded }) {
    const [nombreProducto, setNombreProducto] = useState("");
    const [precio, setPrecio] = useState("");
    const [stock, setStock] = useState("");
    const [categoria, setCategoria] = useState("");
    const [fechaIngreso, setFechaIngreso] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();

        const nuevoProducto = {
            nombreProducto,
            precio: parseFloat(precio), // Asegúrate de que el precio sea un número
            stock: parseInt(stock, 10), // Asegúrate de que el stock sea un entero
            categoria,
            fechaIngreso,
        };

        fetch("http://localhost:8080/api/productos", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(nuevoProducto),
        })
            .then((response) => response.json())
            .then((data) => {
                onProductoAdded(data); // Llama a la función del padre para actualizar la lista
                // Limpiar los campos del formulario después de agregar
                setNombreProducto("");
                setPrecio("");
                setStock("");
                setCategoria("");
                setFechaIngreso("");
                handleClose(); // Cerrar el modal
            })
            .catch((error) => console.error("Error al agregar producto:", error));
    };

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Agregar Producto</Modal.Title>
            </Modal.Header>
            <Modal.Body>
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
                        <Form.Label>Categoría</Form.Label>
                        <Form.Control
                            type="text"
                            value={categoria}
                            onChange={(e) => setCategoria(e.target.value)}
                            placeholder="Ingresa la categoría del producto"
                            required
                        />
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

                    <Button variant="primary" type="submit" className="mt-3">
                        Guardar Producto
                    </Button>
                </Form>
            </Modal.Body>
        </Modal>
    );
}
export default AgregarProducto;