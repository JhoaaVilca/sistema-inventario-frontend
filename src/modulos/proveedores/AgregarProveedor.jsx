import React, { useState } from "react";
import { Modal, Button, Form, InputGroup, Toast, ToastContainer } from "react-bootstrap";
import apiClient from "../../servicios/apiClient";

const AgregarProveedor = ({ show, handleClose, onProveedorAdded }) => {
    const [proveedor, setProveedor] = useState({
        nombre: "",
        tipoDocumento: "",
        numeroDocumento: "",
        direccion: "",
        telefono: "",
        email: "",
        estado: "",
    });

    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const [toastVariant, setToastVariant] = useState("success");

    const mostrarNotificacion = (mensaje, variante) => {
        setToastMessage(mensaje);
        setToastVariant(variante);
        setShowToast(true);
    };

    const handleChange = (e) => {
        setProveedor({ ...proveedor, [e.target.name]: e.target.value });
    };

    const buscarDocumento = async () => {
        if (!proveedor.numeroDocumento.trim()) {
            mostrarNotificacion("Por favor, ingrese un número de documento.", "danger");
            return;
        }

        try {
            const response = await apiClient.get(
                `/proveedores/consultar`, { params: { tipo: proveedor.tipoDocumento, numero: proveedor.numeroDocumento } }
            );

            if (response.data && response.data.data) {
                const data = response.data.data;
                setProveedor((prev) => ({
                    ...prev,
                    nombre: data.nombre || "",
                    direccion: data.direccion || "",
                    estado: data.estado || "",
                }));
                mostrarNotificacion("Datos obtenidos exitosamente", "success");
            } else {
                mostrarNotificacion("No se encontraron datos para el documento.", "warning");
                setProveedor((prev) => ({ ...prev, nombre: "", direccion: "", estado: "" }));
            }
        } catch (error) {
            mostrarNotificacion("Error al consultar el documento.", "danger");
            setProveedor((prev) => ({ ...prev, nombre: "", direccion: "", estado: "" }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { estado, ...proveedorSinEstado } = proveedor;

        try {
            const response = await apiClient.post("/proveedores", proveedorSinEstado);

            if (response && response.data) {
                onProveedorAdded(response.data);
                mostrarNotificacion("Proveedor agregado exitosamente", "success");
                handleClose();
                setProveedor({
                    nombre: "",
                    tipoDocumento: "",
                    numeroDocumento: "",
                    direccion: "",
                    telefono: "",
                    email: "",
                    estado: "",
                });
            }
        } catch (error) {
            mostrarNotificacion("Error al guardar proveedor. Verifique la conexión.", "danger");
        }
    };

    return (
        <>
            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Agregar Proveedor</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmit}>
                        {/* Tipo Documento */}
                        <Form.Group className="mb-3">
                            <Form.Label>Tipo Documento</Form.Label>
                            <Form.Select
                                name="tipoDocumento"
                                value={proveedor.tipoDocumento}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Seleccione un tipo de documento</option>
                                <option value="RUC">RUC</option>
                                <option value="DNI">DNI</option>
                            </Form.Select>
                        </Form.Group>

                        {/* Número Documento */}
                        <Form.Group className="mb-3">
                            <Form.Label>Número Documento</Form.Label>
                            <InputGroup>
                                <Form.Control
                                    type="text"
                                    name="numeroDocumento"
                                    value={proveedor.numeroDocumento}
                                    onChange={handleChange}
                                    placeholder="Ingrese el número de documento"
                                    required
                                />
                                <Button variant="secondary" onClick={buscarDocumento}>
                                    Buscar
                                </Button>
                            </InputGroup>
                        </Form.Group>

                        {/* Nombre */}
                        <Form.Group className="mb-3">
                            <Form.Label>Nombre / Razón Social</Form.Label>
                            <Form.Control
                                type="text"
                                name="nombre"
                                value={proveedor.nombre}
                                onChange={handleChange}
                                placeholder="Ingrese nombre o razón social"
                                required
                            />
                        </Form.Group>

                        {/* Dirección */}
                        <Form.Group className="mb-3">
                            <Form.Label>Dirección</Form.Label>
                            <Form.Control
                                type="text"
                                name="direccion"
                                value={proveedor.direccion}
                                onChange={handleChange}
                                placeholder="Ingrese dirección"
                            />
                        </Form.Group>

                        {/* Teléfono */}
                        <Form.Group className="mb-3">
                            <Form.Label>Teléfono</Form.Label>
                            <Form.Control
                                type="text"
                                name="telefono"
                                value={proveedor.telefono}
                                onChange={handleChange}
                                placeholder="Ingrese teléfono"
                            />
                        </Form.Group>

                        {/* Email */}
                        <Form.Group className="mb-3">
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                                type="email"
                                name="email"
                                value={proveedor.email}
                                onChange={handleChange}
                                placeholder="Ingrese correo electrónico"
                            />
                        </Form.Group>

                        {/* Estado Documento */}
                        {proveedor.estado && (
                            <Form.Group className="mb-3">
                                <Form.Label>Estado del Documento:</Form.Label>
                                <Form.Control type="text" readOnly value={proveedor.estado} />
                            </Form.Group>
                        )}

                        <Button variant="primary" type="submit" className="mt-3 w-100">
                            Guardar Proveedor
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>

            {/* Toast de notificaciones */}
            <ToastContainer position="top-end" className="p-3">
                <Toast
                    show={showToast}
                    onClose={() => setShowToast(false)}
                    delay={3000}
                    autohide
                    bg={toastVariant}
                >
                    <Toast.Header closeButton>
                        <strong className="me-auto">
                            {toastVariant === "success" ? "Éxito" : "Aviso"}
                        </strong>
                    </Toast.Header>
                    <Toast.Body className={toastVariant === "success" ? "text-white" : ""}>
                        {toastMessage}
                    </Toast.Body>
                </Toast>
            </ToastContainer>
        </>
    );
};

export default AgregarProveedor;
