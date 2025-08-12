import { Modal, Button, Form } from "react-bootstrap";
import { useEffect, useState } from "react";
import axios from "axios";
import TablaProductosEntrada from "./TablaProductosEntrada";

function EditarEntrada({ show, handleClose, entrada, onEntradaEditada }) {
    const [proveedores, setProveedores] = useState([]);
    const [idProveedor, setIdProveedor] = useState("");
    const [productosEntrada, setProductosEntrada] = useState([]);
    const [fechaEntrada, setFechaEntrada] = useState("");

    useEffect(() => {
        const obtenerProveedores = async () => {
            try {
                const response = await axios.get("http://localhost:8080/api/proveedores");
                setProveedores(response.data);
            } catch (error) {
                console.error("Error al obtener proveedores:", error);
            }
        };

        if (show && entrada) {
            obtenerProveedores();
            setIdProveedor(entrada.proveedor?.idProveedor || "");
            setFechaEntrada(entrada.fechaEntrada || "");
            setProductosEntrada(entrada.detalles || []);
        }
    }, [show, entrada]);

    const handleGuardarCambios = async () => {
        if (!idProveedor || productosEntrada.length === 0 || !fechaEntrada) return;

        const totalEntrada = productosEntrada.reduce(
            (acc, detalle) => acc + (detalle.subtotal || 0),
            0
        );

        try {
            await axios.put(`http://localhost:8080/api/entradas/${entrada.idEntrada}`, {
                proveedor: { idProveedor: parseInt(idProveedor) },
                fechaEntrada,
                totalEntrada,
                detalles: productosEntrada
            });
            onEntradaEditada();
            handleClose();
        } catch (error) {
            console.error("Error al editar entrada:", error);
        }
    };

    return (
        <Modal show={show} onHide={handleClose} size="lg">
            <Modal.Header closeButton>
                <Modal.Title>Editar Entrada</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form.Group className="mb-3">
                    <Form.Label>Proveedor</Form.Label>
                    <Form.Select
                        value={idProveedor}
                        onChange={(e) => setIdProveedor(e.target.value)}
                    >
                        <option value="">Seleccione un proveedor</option>
                        {proveedores.map((p) => (
                            <option key={p.idProveedor} value={p.idProveedor}>
                                {p.nombre}
                            </option>
                        ))}
                    </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Fecha de Entrada</Form.Label>
                    <Form.Control
                        type="date"
                        value={fechaEntrada}
                        onChange={(e) => setFechaEntrada(e.target.value)}
                    />
                </Form.Group>

                <TablaProductosEntrada
                    productosEntrada={productosEntrada}
                    setProductosEntrada={setProductosEntrada}
                />
                <div className="mt-3">
                    <strong>Total de la Entrada: S/
                        {productosEntrada
                            .reduce((acc, detalle) => acc + (detalle.subtotal || 0), 0)
                            .toFixed(2)}
                    </strong>
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Cancelar
                </Button>
                <Button variant="primary" onClick={handleGuardarCambios}>
                    Guardar Cambios
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default EditarEntrada;
