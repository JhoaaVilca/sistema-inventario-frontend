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
        estado: "",
    });

    const handleChange = (e) => {
        setProveedor({ ...proveedor, [e.target.name]: e.target.value });
    };

    const buscarDocumento = async () => {
        if (!proveedor.numeroDocumento || proveedor.numeroDocumento.trim() === "") {
            alert("Por favor, ingrese un número de documento para buscar.");
            return;
        }

        try {
            const response = await axios.get(
                `http://localhost:8080/api/proveedores/consultar?tipo=${proveedor.tipoDocumento}&numero=${proveedor.numeroDocumento}`
            );

            if (response.data && response.data.data) {
                const data = response.data.data;
                setProveedor((prev) => ({
                    ...prev,
                    nombre: data.nombre || "",
                    direccion: data.direccion || "",
                    estado: data.estado || "",
                }));
            } else {
                alert("No se encontraron datos para el documento.");
                setProveedor((prev) => ({
                    ...prev,
                    nombre: "",
                    direccion: "",
                    estado: "",
                }));
            }
        } catch (error) {
            alert("Ocurrió un error al consultar el documento.");
            setProveedor((prev) => ({
                ...prev,
                nombre: "",
                direccion: "",
                estado: "",
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { estado, ...proveedorSinEstado } = proveedor;

        try {
            const response = await axios.post("http://localhost:8080/api/proveedores", proveedorSinEstado);

            if (response && response.data) {
                onProveedorAdded(response.data);
                handleClose();
                setProveedor({
                    nombre: "",
                    tipoDocumento: "RUC",
                    numeroDocumento: "",
                    direccion: "",
                    telefono: "",
                    email: "",
                    estado: "",
                });
            } else {
                alert("Error al guardar proveedor.");
            }
        } catch (error) {
            alert("Error al guardar proveedor. Verifique su conexión o intente nuevamente.");
        }
    };

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Agregar Proveedor</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
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

                    <Form.Group className="mb-3">
                        <Form.Label>Número Documento</Form.Label>
                        <div style={{ display: "flex", gap: "10px" }}>
                            <Form.Control
                                type="text"
                                name="numeroDocumento"
                                value={proveedor.numeroDocumento}
                                onChange={handleChange}
                                required
                            />
                            <Button variant="secondary" onClick={buscarDocumento}>
                                Buscar
                            </Button>
                        </div>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Nombre / Razón Social</Form.Label>
                        <Form.Control
                            type="text"
                            name="nombre"
                            value={proveedor.nombre}
                            onChange={handleChange}
                            required
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Dirección</Form.Label>
                        <Form.Control
                            type="text"
                            name="direccion"
                            value={proveedor.direccion}
                            onChange={handleChange}
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Teléfono</Form.Label>
                        <Form.Control
                            type="text"
                            name="telefono"
                            value={proveedor.telefono}
                            onChange={handleChange}
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Email</Form.Label>
                        <Form.Control
                            type="email"
                            name="email"
                            value={proveedor.email}
                            onChange={handleChange}
                        />
                    </Form.Group>

                    {proveedor.estado && (
                        <Form.Group className="mb-3">
                            <Form.Label>Estado del Documento:</Form.Label>
                            <Form.Control type="text" readOnly value={proveedor.estado} />
                        </Form.Group>
                    )}

                    <Button variant="primary" type="submit" className="mt-3">
                        Guardar Proveedor
                    </Button>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default AgregarProveedor;
