import { Modal, Button, Form, Alert, Row, Col } from "react-bootstrap";
import { useEffect, useState } from "react";
import apiClient from "../../servicios/apiClient";
import TablaProductosSalida from "./TablaProductosSalida";
import { loteService } from "../../servicios/loteService";
import BusquedaCliente from "../clientes/BusquedaCliente";

function AgregarSalida({ show, handleClose, onSalidaAgregada }) {
    const [productosSalida, setProductosSalida] = useState([]);
    const [fechaSalida, setFechaSalida] = useState("");
    const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
    const [tipoVenta, setTipoVenta] = useState("CONTADO");
    const [fechaPagoCredito, setFechaPagoCredito] = useState("");
    const [totalSalida, setTotalSalida] = useState(0);
    const [errorMsg, setErrorMsg] = useState("");

    useEffect(() => {
        if (show) {
            setProductosSalida([]);
            setFechaSalida(new Date().toISOString().split('T')[0]); // Fecha de hoy
            setClienteSeleccionado(null);
            setTipoVenta("CONTADO");
            setFechaPagoCredito("");
            setTotalSalida(0);
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
        const subtotal = productosSalida.reduce((sum, p) => sum + (p.cantidad * p.precioUnitario), 0);
        if (tipoVenta === 'CREDITO') {
            if (!fechaPagoCredito) return "Ingrese la fecha de pago para el crédito.";
            const totalNormalizado = parseFloat(String(totalSalida || '').replace(',', '.'));
            const totalEfectivo = (!isNaN(totalNormalizado) && totalNormalizado > 0) ? totalNormalizado : subtotal;
            if (!(totalEfectivo > 0)) return "El monto total debe ser mayor a 0.";
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
            // Validación previa contra stock disponible por lotes
            for (const d of productosSalida) {
                const lotes = await loteService.obtenerLotesPorProducto(d.producto.idProducto);
                const disponible = (lotes || [])
                    .filter(l => (l.estado || '').toLowerCase() === 'activo' && (l.cantidadDisponible ?? 0) > 0)
                    .reduce((sum, l) => sum + (l.cantidadDisponible ?? 0), 0);
                if (disponible < d.cantidad) {
                    setErrorMsg(`Stock insuficiente por lotes para '${d.producto.nombreProducto}' (disp: ${disponible}, solicitado: ${d.cantidad}).`);
                    return;
                }
            }
            console.log("Datos a enviar:", {
                fechaSalida,
                cliente: clienteSeleccionado,
                tipoVenta,
                productosSalida
            });

            const subtotal = productosSalida.reduce((sum, p) => sum + (p.cantidad * p.precioUnitario), 0);
            const totalCredito = parseFloat(String(totalSalida || '').replace(',', '.'));
            const totalEfectivo = tipoVenta === 'CREDITO'
                ? ((!isNaN(totalCredito) && totalCredito > 0) ? totalCredito : subtotal)
                : subtotal;
            const dataToSend = {
                fechaSalida: fechaSalida,
                cliente: { idCliente: clienteSeleccionado.idCliente },
                tipoVenta: tipoVenta,
                totalSalida: Number(totalEfectivo.toFixed(2)),
                fechaPagoCredito: tipoVenta === 'CREDITO' ? fechaPagoCredito : null,
                detalles: productosSalida.map(d => ({
                    producto: { idProducto: d.producto.idProducto },
                    cantidad: parseInt(d.cantidad),
                    precioUnitario: parseFloat(d.precioUnitario)
                }))
            };

            console.log("Payload final:", dataToSend);
            await apiClient.post("/salidas", dataToSend);
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

                {tipoVenta === 'CREDITO' && (
                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Fecha de pago (crédito)</Form.Label>
                                <Form.Control
                                    type="date"
                                    value={fechaPagoCredito}
                                    onChange={(e) => setFechaPagoCredito(e.target.value)}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Monto total (editable)</Form.Label>
                                <Form.Control
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={totalSalida || (productosSalida.reduce((sum, p) => sum + (p.cantidad * p.precioUnitario), 0).toFixed(2))}
                                    onChange={(e) => setTotalSalida(e.target.value.replace(',', '.'))}
                                />
                                <Form.Text className="text-muted">Prefijado según el detalle, puedes ajustarlo.</Form.Text>
                            </Form.Group>
                        </Col>
                    </Row>
                )}

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
                
                {/* Resumen de totales (sin IGV) */}
                {productosSalida.length > 0 && (
                    <div className="mt-3 p-3 bg-light rounded">
                        <Row>
                            <Col md={6}>
                                <strong>Total:</strong> S/ {productosSalida.reduce((sum, p) => sum + (p.cantidad * p.precioUnitario), 0).toFixed(2)}
                            </Col>
                        </Row>
                    </div>
                )}
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


