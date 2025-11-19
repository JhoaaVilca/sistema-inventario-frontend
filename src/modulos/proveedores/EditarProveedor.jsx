import { useEffect, useState } from "react";
import { Modal, Button, Form, Toast, ToastContainer } from "react-bootstrap";
import apiClient from "../../servicios/apiClient";

function EditarProveedor({ show, handleClose, proveedor, onProveedorUpdated }) {
    const [formulario, setFormulario] = useState({
        idProveedor: "",
        nombre: "",
        tipoDocumento: "",
        numeroDocumento: "",
        direccion: "",
        telefono: "",
        email: "",
        estado: "",
    });
    const [showToast, setShowToast] = useState(false);

    useEffect(() => {
        if (proveedor) {
            setFormulario(proveedor);

            if (proveedor.tipoDocumento === "RUC") {
                buscarEstado(proveedor.tipoDocumento, proveedor.numeroDocumento);
            }
        }
    }, [proveedor]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        let actualizado;
        if (name === "numeroDocumento") {
            const maxLen = (formulario.tipoDocumento === "RUC") ? 11 : 8;
            const soloDigitos = (value || "").replace(/\D/g, "").slice(0, maxLen);
            actualizado = { ...formulario, numeroDocumento: soloDigitos };
        } else {
            actualizado = { ...formulario, [name]: value };
        }
        setFormulario(actualizado);

        if (
            (name === "numeroDocumento" || name === "tipoDocumento") &&
            actualizado.tipoDocumento === "RUC" &&
            actualizado.numeroDocumento.trim().length === 11
        ) {
            buscarEstado(actualizado.tipoDocumento, actualizado.numeroDocumento);
        }
    };

    const buscarEstado = async (tipo, numero) => {
        try {
            const response = await apiClient.get(`/proveedores/consultar`, {
                params: { tipo, numero }
            });

            if (response.data?.data?.estado) {
                setFormulario((prev) => ({ ...prev, estado: response.data.data.estado }));
            } else {
                setFormulario((prev) => ({ ...prev, estado: "" }));
            }
        } catch (error) {
            console.error("Error consultando estado del RUC:", error);
            setFormulario((prev) => ({ ...prev, estado: "" }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const { data } = await apiClient.put(`/proveedores/${formulario.idProveedor}`, formulario);
            
            // Mostrar mensaje de éxito
            setShowToast(true);
            
            onProveedorUpdated(data);
            handleClose();
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
                    {/* Nombre */}
                    <Form.Group className="mb-2">
                        <Form.Label>Nombre / Razón Social</Form.Label>
                        <Form.Control
                            type="text"
                            name="nombre"
                            value={formulario.nombre}
                            onChange={handleChange}
                            placeholder="Ingrese nombre o razón social"
                            required
                        />
                    </Form.Group>

                    {/* Tipo de Documento */}
                    <Form.Group className="mb-2">
                        <Form.Label>Tipo de Documento</Form.Label>
                        <Form.Select
                            name="tipoDocumento"
                            value={formulario.tipoDocumento}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Seleccione un tipo de documento</option>
                            <option value="DNI">DNI</option>
                            <option value="RUC">RUC</option>
                        </Form.Select>
                    </Form.Group>

                    {/* Número de Documento */}
                    <Form.Group className="mb-2">
                        <Form.Label>Número de Documento</Form.Label>
                        <Form.Control
                            type="text"
                            name="numeroDocumento"
                            value={formulario.numeroDocumento}
                            onChange={handleChange}
                            placeholder="Ingrese número de documento"
                            required
                            inputMode="numeric"
                            pattern={formulario.tipoDocumento === "RUC" ? "\\d{11}" : formulario.tipoDocumento === "DNI" ? "\\d{8}" : "\\d+"}
                            maxLength={formulario.tipoDocumento === "RUC" ? 11 : 8}
                            title={
                                formulario.tipoDocumento === "RUC"
                                    ? "RUC debe tener 11 dígitos"
                                    : formulario.tipoDocumento === "DNI"
                                    ? "DNI debe tener 8 dígitos"
                                    : "Solo números"
                            }
                        />
                    </Form.Group>

                    {/* Estado */}
                    {formulario.tipoDocumento === "RUC" && formulario.estado && (
                        <Form.Group className="mb-2">
                            <Form.Label>Estado del Documento</Form.Label>
                            <Form.Control type="text" value={formulario.estado} readOnly />
                        </Form.Group>
                    )}

                    {/* Dirección */}
                    <Form.Group className="mb-2">
                        <Form.Label>Dirección</Form.Label>
                        <Form.Control
                            type="text"
                            name="direccion"
                            value={formulario.direccion}
                            onChange={handleChange}
                            placeholder="Ingrese dirección"
                            required
                        />
                    </Form.Group>

                    {/* Teléfono */}
                    <Form.Group className="mb-2">
                        <Form.Label>Teléfono</Form.Label>
                        <Form.Control
                            type="text"
                            name="telefono"
                            value={formulario.telefono}
                            onChange={handleChange}
                            placeholder="Ingrese teléfono"
                            required
                        />
                    </Form.Group>

                    {/* Email */}
                    <Form.Group className="mb-2">
                        <Form.Label>Email</Form.Label>
                        <Form.Control
                            type="email"
                            name="email"
                            value={formulario.email}
                            onChange={handleChange}
                            placeholder="Ingrese correo electrónico"
                        />
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
            
            {/* Toast de notificaciones */}
            <ToastContainer position="top-center" className="p-3" style={{ zIndex: 9999 }}>
                <Toast
                    show={showToast}
                    onClose={() => setShowToast(false)}
                    delay={3000}
                    autohide
                    bg="success"
                >
                    <Toast.Header closeButton className="bg-success text-white border-0">
                        <strong className="me-auto">✅ Éxito</strong>
                    </Toast.Header>
                    <Toast.Body className="text-white">
                        Proveedor actualizado exitosamente
                    </Toast.Body>
                </Toast>
            </ToastContainer>
        </Modal>
    );
}

export default EditarProveedor;
