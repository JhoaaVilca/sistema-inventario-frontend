import { Modal, Button, Form, Alert, Row, Col, Toast, ToastContainer } from "react-bootstrap";
import { useEffect, useState } from "react";
import apiClient from "../../servicios/apiClient";
import TablaProductosSalida from "./TablaProductosSalida";
import BusquedaCliente from "../clientes/BusquedaCliente";

function EditarSalida({ show, handleClose, salida, onSalidaEditada, inlineMode = false }) {
    const [productosSalida, setProductosSalida] = useState([]);
    const [fechaSalida, setFechaSalida] = useState("");
    const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
    const [tipoVenta, setTipoVenta] = useState("CONTADO");
    const [fechaPagoCredito, setFechaPagoCredito] = useState("");
    const [totalSalida, setTotalSalida] = useState(0);
    const [errorMsg, setErrorMsg] = useState("");
    const [editedTotal, setEditedTotal] = useState(false);
    const [showToast, setShowToast] = useState(false);

    useEffect(() => {
        if ((show || inlineMode) && salida) {
            setProductosSalida(
                (salida.detalles || []).map(d => ({
                    producto: {
                        idProducto: d.producto?.idProducto ?? d.idProducto ?? d.idProducto,
                        nombreProducto: d.nombreProducto ?? d.producto?.nombreProducto ?? ""
                    },
                    cantidad: d.cantidad,
                    precioUnitario: d.precioUnitario
                }))
            );
            setFechaSalida(salida.fechaSalida || "");

            // Configurar cliente si existe
            if (salida.cliente) {
                setClienteSeleccionado({
                    idCliente: salida.cliente.idCliente,
                    dni: salida.cliente.dni,
                    nombres: salida.cliente.nombres,
                    apellidos: salida.cliente.apellidos,
                    direccion: salida.cliente.direccion,
                    telefono: salida.cliente.telefono,
                    email: salida.cliente.email
                });
            } else if (salida.idCliente) {
                // Fallback desde DTO plano
                const nombresComp = (salida.nombreCliente || "").trim();
                let nombres = nombresComp;
                let apellidos = "";
                if (nombresComp.includes(" ")) {
                    const parts = nombresComp.split(" ");
                    nombres = parts[0];
                    apellidos = parts.slice(1).join(" ");
                }
                setClienteSeleccionado({
                    idCliente: salida.idCliente,
                    dni: salida.dniCliente || "",
                    nombres,
                    apellidos
                });
            }

            setTipoVenta(salida.tipoVenta || "CONTADO");
            setFechaPagoCredito(salida.fechaPagoCredito || "");
            setTotalSalida(salida.totalSalida || 0);
            setEditedTotal(false);
            setErrorMsg("");
        }
    }, [show, inlineMode, salida]);

    // Recalcular total automáticamente cuando cambian los detalles si es crédito,
    // salvo que el usuario lo haya editado manualmente.
    useEffect(() => {
        if (tipoVenta === 'CREDITO' && !editedTotal) {
            const subtotal = productosSalida.reduce((sum, p) => sum + (p.cantidad * p.precioUnitario), 0);
            setTotalSalida(Number(subtotal.toFixed(2)));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [productosSalida, tipoVenta]);

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
            const totalNorm = parseFloat(String(totalSalida || '').replace(',', '.'));
            const totalEfectivo = (!isNaN(totalNorm) && totalNorm > 0) ? totalNorm : subtotal;
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
            const subtotal = productosSalida.reduce((sum, p) => sum + (p.cantidad * p.precioUnitario), 0);
            const totalNorm = parseFloat(String(totalSalida || '').replace(',', '.'));
            const totalEfectivo = tipoVenta === 'CREDITO'
                ? ((!isNaN(totalNorm) && totalNorm > 0) ? totalNorm : subtotal)
                : subtotal;

            await apiClient.put(`/salidas/${salida.idSalida}`, {
                fechaSalida,
                cliente: { idCliente: clienteSeleccionado.idCliente },
                tipoVenta,
                totalSalida: Number(totalEfectivo.toFixed(2)),
                fechaPagoCredito: tipoVenta === 'CREDITO' ? fechaPagoCredito : null,
                detalles: productosSalida.map(d => ({
                    producto: { idProducto: d.producto.idProducto },
                    cantidad: d.cantidad,
                    precioUnitario: d.precioUnitario
                }))
            });
            
            // Mostrar mensaje de éxito
            setShowToast(true);
            
            onSalidaEditada();
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

    const Formulario = (
        <>
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
                                onChange={(e) => { setEditedTotal(true); setTotalSalida(e.target.value.replace(',', '.')); }}
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
        </>
    );

    if (inlineMode) {
        return (
            <div>
                {Formulario}
                <div className="d-flex justify-content-end gap-2 mt-4">
                    <Button variant="secondary" onClick={handleClose}>Cancelar</Button>
                    <Button variant="primary" onClick={handleGuardar}>Guardar Cambios</Button>
                </div>
            </div>
        );
    }

    return (
        <Modal show={show} onHide={handleClose} size="lg">
            <Modal.Header closeButton>
                <Modal.Title>Ver / Editar Salida</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {Formulario}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>Cancelar</Button>
                <Button variant="primary" onClick={handleGuardar}>Guardar Cambios</Button>
            </Modal.Footer>
            
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
                        Salida actualizada exitosamente
                    </Toast.Body>
                </Toast>
            </ToastContainer>
        </Modal>
    );
}

export default EditarSalida;


