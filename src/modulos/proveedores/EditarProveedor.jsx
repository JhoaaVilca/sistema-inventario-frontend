import { useEffect, useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";

function EditarProveedor({ show, handleClose, proveedor, onProveedorEditado }) {
    const [formulario, setFormulario] = useState({
        idProveedor: "",
        nombre: "",
        tipoDocumento: "",
        numeroDocumento: "",
        direccion: "",
        telefono: "",
        email: ""
    });

    useEffect(() => {
        if (proveedor) {
            setFormulario(proveedor);
        }
    }, [proveedor]);

    const handleChange = (e) => {
        setFormulario({ ...formulario, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const respuesta = await fetch(
                `http://localhost:8080/api/proveedores/${formulario.idProveedor}`,
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(formulario),
                }
            );

            if (respuesta.ok) {
                const actualizado = await respuesta.json();
                onProveedorEditado(actualizado);
            } else {
                console.error("Error al actualizar proveedor");
            }
        } catch (error) {
            console.error("Error de red:", error);
        }
    };

    return (
        <Modal show={show} onHide={handleClose} backdrop="static" centered>
            <Modal.Header closeButton>
                <Modal.Title>Editar Proveedor</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-2">
                        <Form.Label>Nombre</Form.Label>
                        <Form.Control type="text" name="nombre" value={formulario.nombre} onChange={handleChange} required />
                    </Form.Group>

                    <Form.Group className="mb-2">
                        <Form.Label>Tipo de Documento</Form.Label>
                        <Form.Select name="tipoDocumento" value={formulario.tipoDocumento} onChange={handleChange} required>
                            <option value="">Seleccionar</option>
                            <option value="DNI">DNI</option>
                            <option value="RUC">RUC</option>
                        </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-2">
                        <Form.Label>Número de Documento</Form.Label>
                        <Form.Control type="text" name="numeroDocumento" value={formulario.numeroDocumento} onChange={handleChange} required />
                    </Form.Group>

                    <Form.Group className="mb-2">
                        <Form.Label>Dirección</Form.Label>
                        <Form.Control type="text" name="direccion" value={formulario.direccion} onChange={handleChange} required />
                    </Form.Group>

                    <Form.Group className="mb-2">
                        <Form.Label>Teléfono</Form.Label>
                        <Form.Control type="text" name="telefono" value={formulario.telefono} onChange={handleChange} required />
                    </Form.Group>

                    <Form.Group className="mb-2">
                        <Form.Label>Email</Form.Label>
                        <Form.Control type="email" name="email" value={formulario.email} onChange={handleChange} />
                    </Form.Group>

                    <div className="text-end mt-3">
                        <Button variant="secondary" onClick={handleClose} className="me-2">
                            Cancelar
                        </Button>
                        <Button type="submit" variant="primary">
                            Guardar Cambios
                        </Button>
                    </div>
                </Form>
            </Modal.Body>
        </Modal>
    );
}

export default EditarProveedor;
