import { Modal, Button, Form, Alert, Row, Col } from "react-bootstrap";
import { useEffect, useState } from "react";
import axios from "axios";
import TablaProductosSalida from "./TablaProductosSalida";
import BusquedaCliente from "../clientes/BusquedaCliente";

function AgregarSalida({ show, handleClose, onSalidaAgregada }) {
    const [productosSalida, setProductosSalida] = useState([]);
    const [fechaSalida, setFechaSalida] = useState("");
    const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
    const [tipoVenta, setTipoVenta] = useState("CONTADO");
    const [errorMsg, setErrorMsg] = useState("");

    useEffect(() => {
        if (show) {
            setProductosSalida([]);
            setFechaSalida("");
            setClienteSeleccionado(null);
            setTipoVenta("CONTADO");
            setErrorMsg("");
        }
    }, [show]);

    const validar = () => {
        const hoy = new Date().toISOString().slice(0, 10);
        if (!fechaSalida) return "La fecha es requerida.";
        if (fechaSalida > hoy) return "La fecha no puede ser futura.";
        if (!clienteSeleccionado) return "Debe seleccionar un cliente.";
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

        console.log("Cliente seleccionado:", clienteSeleccionado);
        console.log("ID del cliente:", clienteSeleccionado?.idCliente);

        try {
            const dataToSend = {
                fechaSalida,
                cliente: { idCliente: clienteSeleccionado.idCliente },
                tipoVenta,
                detalles: productosSalida.map(d => ({
                    producto: { idProducto: d.producto.idProducto },
                    cantidad: d.cantidad,
                    precioUnitario: d.precioUnitario
                }))
            };
            
            console.log("Datos a enviar:", dataToSend);
            console.log("JSON stringificado:", JSON.stringify(dataToSend, null, 2));
            
            await axios.post("http://localhost:8080/api/salidas", dataToSend);
            onSalidaAgregada();
            handleClose();
        } catch (error) {
            console.error("Error completo:", error);
            console.error("Response data:", error.response?.data);
            console.error("Response status:", error.response?.status);
            
            if (error.response && error.response.status === 400) {
                const mensaje = error.response.data?.message || error.response.data?.error || "Error de validación.";
                setErrorMsg(mensaje);
            } else if (error.response && String(error.response.data)?.includes("Stock insuficiente")) {
                setErrorMsg("Stock insuficiente para uno o más productos.");
            } else if (error.response && error.response.data) {
                setErrorMsg(`Error del servidor: ${JSON.stringify(error.response.data)}`);
            } else {
                setErrorMsg("Ocurrió un error al guardar la salida. Verifique la consola para más detalles.");
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
                <Row>
                    <Col md={6}>
                        <Form.Group className="mb-3">
                            <Form.Label>Fecha</Form.Label>
                            <Form.Control
                                type="date"
                                value={fechaSalida}
                                onChange={(e) => setFechaSalida(e.target.value)}
                            />
                        </Form.Group>
                    </Col>
                    <Col md={6}>
                        <Form.Group className="mb-3">
                            <Form.Label>Tipo de Venta</Form.Label>
                            <Form.Select
                                value={tipoVenta}
                                onChange={(e) => setTipoVenta(e.target.value)}
                            >
                                <option value="CONTADO">Contado</option>
                                <option value="CREDITO">Crédito</option>
                            </Form.Select>
                        </Form.Group>
                    </Col>
                </Row>

                {/* Búsqueda de Cliente */}
                <BusquedaCliente
                    onClienteSeleccionado={setClienteSeleccionado}
                    clienteSeleccionado={clienteSeleccionado}
                    required={true}
                    showAgregarCliente={true}
                />

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


