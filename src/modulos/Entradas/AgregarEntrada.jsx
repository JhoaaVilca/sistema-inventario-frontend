// src/modulos/Entradas/AgregarEntrada.jsx

import { Modal, Button, Form, Alert, Row, Col } from "react-bootstrap";
import { useEffect, useState } from "react";
import axios from "axios";
import TablaProductosEntrada from "./TablaProductosEntrada";

function AgregarEntrada({ show, handleClose, onEntradaAgregada }) {
    const [proveedores, setProveedores] = useState([]);
    const [idProveedor, setIdProveedor] = useState("");
    const [productosEntrada, setProductosEntrada] = useState([]);
    const [fechaEntrada, setFechaEntrada] = useState("");
    const [errorMsg, setErrorMsg] = useState("");
    const [guardando, setGuardando] = useState(false);

    useEffect(() => {
        const obtenerProveedores = async () => {
            try {
                const response = await axios.get(
                    "http://localhost:8080/api/proveedores/activos"
                );
                setProveedores(response.data);
            } catch (error) {
                console.error("Error al obtener proveedores:", error);
            }
        };
        if (show) {
            obtenerProveedores();
            setIdProveedor("");
            setProductosEntrada([]);
            setFechaEntrada("");
            setErrorMsg("");
        }
    }, [show]);

    const handleGuardar = async () => {
        if (!idProveedor || productosEntrada.length === 0 || !fechaEntrada) {
            setErrorMsg("Complete proveedor, fecha y al menos un producto.");
            return;
        }

        // Calcular el total sumando los subtotales
        const totalEntrada = productosEntrada.reduce((acc, detalle) => acc + (detalle.subtotal || 0), 0);

        try {
            setGuardando(true);
            await axios.post("http://localhost:8080/api/entradas", {
                proveedor: { idProveedor: parseInt(idProveedor) },
                fechaEntrada,
                totalEntrada,
                detalles: productosEntrada
            });
            onEntradaAgregada();
            handleClose();
        } catch (error) {
            console.error("Error al guardar entrada:", error);
            setErrorMsg("No se pudo guardar la entrada.");
        } finally {
            setGuardando(false);
        }
    };

    return (
        <Modal show={show} onHide={handleClose} size="xl" centered>
            <Modal.Header closeButton>
                <Modal.Title>Agregar Entrada</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {errorMsg && (
                    <Alert variant="danger" className="mb-3">{errorMsg}</Alert>
                )}
                <Row>
                    <Col md={6}>
                        <Form.Group className="mb-3">
                            <Form.Label>Proveedor</Form.Label>
                            <Form.Select
                                value={idProveedor}
                                onChange={(e) => setIdProveedor(e.target.value)}
                                disabled={guardando}
                            >
                                <option value="">Seleccione un proveedor</option>
                                {proveedores.map((p) => (
                                    <option key={p.idProveedor} value={p.idProveedor}>
                                        {p.nombre}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                    </Col>
                    <Col md={6}>
                        <Form.Group className="mb-3">
                            <Form.Label>Fecha de Entrada</Form.Label>
                            <Form.Control
                                type="date"
                                value={fechaEntrada}
                                onChange={(e) => setFechaEntrada(e.target.value)}
                                disabled={guardando}
                            />
                        </Form.Group>
                    </Col>
                </Row>

                <TablaProductosEntrada
                    productosEntrada={productosEntrada}
                    setProductosEntrada={setProductosEntrada}
                />
                <div className="mt-3">
                    <strong>Total de la Entrada: S/{productosEntrada.reduce((acc, detalle) => acc + (detalle.subtotal || 0), 0).toFixed(2)}</strong>
                </div>
            </Modal.Body>
            <Modal.Footer>
                <div className="d-flex flex-column flex-sm-row justify-content-end gap-2 w-100">
                    <Button variant="secondary" onClick={handleClose} disabled={guardando} className="w-100 w-sm-auto">
                        Cancelar
                    </Button>
                    <Button variant="primary" onClick={handleGuardar} disabled={guardando} className="w-100 w-sm-auto">
                        Guardar Entrada
                    </Button>
                </div>
            </Modal.Footer>
        </Modal>
    );
}

export default AgregarEntrada;
