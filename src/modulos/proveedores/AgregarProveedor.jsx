import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import axios from "axios";

const AgregarProveedor = ({ show, handleClose, onProveedorAdded }) => {
    const [proveedor, setProveedor] = useState({
        nombre: "",
        tipoDocumento: "RUC",
        numeroDocumento: "",
        direccion: "",
        telefono: "",
        email: "",
        estado: "", // nuevo campo solo para mostrar
    });

    const handleChange = (e) => {
        setProveedor({ ...proveedor, [e.target.name]: e.target.value });
    };

    const buscarDocumento = async () => {
        try {
            const response = await axios.get(
                `http://localhost:8080/api/proveedores/consultar?tipo=${proveedor.tipoDocumento}&numero=${proveedor.numeroDocumento}`
            );
            console.log("Respuesta de la API:", response.data);

            // Aquí está el cambio importante 👇
            const data = response.data.data;

            setProveedor((prev) => ({
                ...prev,
                nombre: data.nombre || "",
                direccion: data.direccion || "",
                estado: data.estado || "",
            }));
        } catch (error) {
            console.error("Error al consultar documento:", error);
            alert("No se pudo consultar el documento. Verifica el número.");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { estado, ...proveedorSinEstado } = proveedor;

        try {
            await axios.post("http://localhost:8080/api/proveedores", proveedorSinEstado);
            onProveedorAdded();
            handleClose();
        } catch (error) {
            console.error("Error al guardar proveedor:", error);
        }
    };

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Agregar Proveedor</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit={handleSubmit}>
                    <Form.Group>
                        <Form.Label>Tipo Documento</Form.Label>
                        <Form.Select
                            name="tipoDocumento"
                            value={proveedor.tipoDocumento}
                            onChange={handleChange}
                        >
                            <option value="RUC">RUC</option>
                            <option value="DNI">DNI</option>
                        </Form.Select>
                    </Form.Group>

                    <Form.Group>
                        <Form.Label>Número Documento</Form.Label>
                        <div style={{ display: "flex", gap: "10px" }}>
                            <Form.Control
                                type="text"
                                name="numeroDocumento"
                                value={proveedor.numeroDocumento}
                                onChange={handleChange}
                            />
                            <Button variant="secondary" onClick={buscarDocumento}>
                                Buscar
                            </Button>
                        </div>
                    </Form.Group>

                    <Form.Group>
                        <Form.Label>Nombre</Form.Label>
                        <Form.Control
                            type="text"
                            name="nombre"
                            value={proveedor.nombre}
                            onChange={handleChange}
                        />
                    </Form.Group>

                    <Form.Group>
                        <Form.Label>Dirección</Form.Label>
                        <Form.Control
                            type="text"
                            name="direccion"
                            value={proveedor.direccion}
                            onChange={handleChange}
                        />
                    </Form.Group>

                    <Form.Group>
                        <Form.Label>Teléfono</Form.Label>
                        <Form.Control
                            type="text"
                            name="telefono"
                            value={proveedor.telefono}
                            onChange={handleChange}
                        />
                    </Form.Group>

                    <Form.Group>
                        <Form.Label>Email</Form.Label>
                        <Form.Control
                            type="email"
                            name="email"
                            value={proveedor.email}
                            onChange={handleChange}
                        />
                    </Form.Group>

                    {proveedor.estado && (
                        <Form.Group>
                            <Form.Label>Estado del RUC:</Form.Label>
                            <Form.Control type="text" readOnly value={proveedor.estado} />
                        </Form.Group>
                    )}

                    <Button variant="primary" type="submit" className="mt-3">
                        Guardar
                    </Button>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default AgregarProveedor;
