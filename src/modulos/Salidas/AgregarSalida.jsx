import { Modal, Button, Form, Alert } from "react-bootstrap";
import { useEffect, useState } from "react";
import axios from "axios";
import TablaProductosSalida from "./TablaProductosSalida";

function AgregarSalida({ show, handleClose, onSalidaAgregada }) {
    const [productosSalida, setProductosSalida] = useState([]);
    const [fechaSalida, setFechaSalida] = useState("");
    const [errorMsg, setErrorMsg] = useState("");

    useEffect(() => {
        if (show) {
            setProductosSalida([]);
            setFechaSalida("");
            setErrorMsg("");
        }
    }, [show]);

    const validar = () => {
        const hoy = new Date().toISOString().slice(0, 10);
        if (!fechaSalida) return "La fecha es requerida.";
        if (fechaSalida > hoy) return "La fecha no puede ser futura.";
        if (productosSalida.length === 0) return "Agregue al menos un detalle.";
        for (const d of productosSalida) {
            if (d.cantidad <= 0) return "La cantidad debe ser mayor a 0.";
            if (d.precioUnitario < 0) return "El precio no puede ser negativo.";
        }
        return "";
    };

    const handleGuardar = async () => {
        const v = validar();
        if (v) {
            setErrorMsg(v);
            return;
        }

        try {
            await axios.post("http://localhost:8080/api/salidas", {
                fechaSalida,
                detalles: productosSalida.map(d => ({
                    idProducto: d.producto.idProducto,
                    cantidad: d.cantidad,
                    precioUnitario: d.precioUnitario
                }))
            });
            onSalidaAgregada();
            handleClose();
        } catch (error) {
            if (error.response && error.response.status === 400) {
                const mensaje = error.response.data?.message || "Error de validación.";
                setErrorMsg(mensaje);
            } else if (error.response && String(error.response.data)?.includes("Stock insuficiente")) {
                setErrorMsg("Stock insuficiente para uno o más productos.");
            } else {
                setErrorMsg("Ocurrió un error al guardar la salida.");
            }
        }
    };

    return (
        <Modal show={show} onHide={handleClose} size="lg">
            <Modal.Header closeButton>
                <Modal.Title>Nueva Salida</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {errorMsg && (
                    <Alert variant="danger" className="mb-3">{errorMsg}</Alert>
                )}
                <Form.Group className="mb-3">
                    <Form.Label>Fecha</Form.Label>
                    <Form.Control
                        type="date"
                        value={fechaSalida}
                        onChange={(e) => setFechaSalida(e.target.value)}
                    />
                </Form.Group>

                <TablaProductosSalida
                    productosSalida={productosSalida}
                    setProductosSalida={setProductosSalida}
                />
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Cancelar
                </Button>
                <Button variant="primary" onClick={handleGuardar}>
                    Guardar
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default AgregarSalida;


