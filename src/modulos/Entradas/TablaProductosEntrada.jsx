// src/modulos/Entradas/TablaProductosEntrada.jsx

import { useState, useEffect } from "react";
import { Button, Form, Table, Row, Col } from "react-bootstrap";
import BuscadorProductos from "./BuscadorProductos";
import SelectProductos from "./SelectProductos";
import { X } from "lucide-react";

function TablaProductosEntrada({ productosEntrada, setProductosEntrada, onProductoAgregado }) {
    const [productoSeleccionado, setProductoSeleccionado] = useState(null);
    const [cantidad, setCantidad] = useState("");
    const [precioUnitario, setPrecioUnitario] = useState("");
    const [fechaVencimiento, setFechaVencimiento] = useState("");
    const [requiereVencimiento, setRequiereVencimiento] = useState(false);
    const [errorInline, setErrorInline] = useState("");
    const [limpiarBuscador, setLimpiarBuscador] = useState(false);
    const [productoRecienAgregado, setProductoRecienAgregado] = useState(null);
    const hoy = new Date().toISOString().split('T')[0];

    const formatearFechaLocalDate = (str) => {
        if (!str) return 'Sin fecha';
        const [y, m, d] = str.split('-');
        if (!y || !m || !d) return str;
        return `${d}/${m}/${y}`;
    };

    // Si el producto es perecible, obligar fecha de vencimiento
    useEffect(() => {
        if (productoSeleccionado && productoSeleccionado.esPerecible) {
            setRequiereVencimiento(true);
        } else {
            setRequiereVencimiento(false);
            setFechaVencimiento("");
        }
    }, [productoSeleccionado]);

    // Prefijar precio unitario con el precio de compra cuando se selecciona un producto
    useEffect(() => {
        if (productoSeleccionado && typeof productoSeleccionado.precioCompra !== 'undefined' && productoSeleccionado.precioCompra !== null) {
            setPrecioUnitario(String(productoSeleccionado.precioCompra));
        } else if (!productoSeleccionado) {
            setPrecioUnitario("");
        }
    }, [productoSeleccionado]);

    const agregarProducto = () => {
        setErrorInline("");
        if (!productoSeleccionado) {
            setErrorInline("Seleccione un producto.");
            return;
        }
        if (cantidad === "" || precioUnitario === "") {
            setErrorInline("Complete cantidad y precio unitario.");
            return;
        }

        const cantidadNum = parseInt(cantidad);
        const precioNum = parseFloat(precioUnitario);
        if (!(cantidadNum > 0)) {
            setErrorInline("La cantidad debe ser mayor a 0.");
            return;
        }
        if (!(precioNum >= 0)) {
            setErrorInline("El precio no puede ser negativo.");
            return;
        }
        if (requiereVencimiento && !fechaVencimiento) {
            setErrorInline("Seleccione la fecha de vencimiento.");
            return;
        }
        if (requiereVencimiento && fechaVencimiento < hoy) {
            setErrorInline("La fecha de vencimiento no puede ser anterior a hoy.");
            return;
        }
        const subtotal = cantidadNum * precioNum;
        const nuevoDetalle = {
            producto: {
                idProducto: productoSeleccionado.idProducto,
                nombreProducto: productoSeleccionado.nombreProducto
            },
            cantidad: cantidadNum,
            precioUnitario: precioNum,
            subtotal: subtotal,
            fechaVencimiento: requiereVencimiento ? fechaVencimiento : null
        };

        setProductosEntrada([...(productosEntrada || []), nuevoDetalle]);

        // Efecto de resaltado
        setProductoRecienAgregado(productoSeleccionado.nombreProducto);
        setTimeout(() => setProductoRecienAgregado(null), 2000);

        // Notificar que se agregó el producto
        if (onProductoAgregado) {
            onProductoAgregado(`${productoSeleccionado.nombreProducto} agregado correctamente (${cantidadNum} unidades)`);
        }

        // Limpiar campos después de agregar
        setProductoSeleccionado(null);
        setCantidad("");
        setPrecioUnitario("");
        setFechaVencimiento("");
        setRequiereVencimiento(false);
        setLimpiarBuscador(true);

        // Resetear el flag de limpiar después de un momento
        setTimeout(() => {
            setLimpiarBuscador(false);
        }, 100);
    };

    const eliminarDetalle = (index) => {
        const copia = [...productosEntrada];
        copia.splice(index, 1);
        setProductosEntrada(copia);
    };

    return (
        <div className="mt-3">
            <h5>Productos de la Entrada</h5>
            {errorInline && (
                <div className="text-danger mb-2">{errorInline}</div>
            )}
            <Row className="g-2 mb-3">
                <Col md={3} sm={6}>
                    <SelectProductos
                        onProductoSeleccionado={setProductoSeleccionado}
                        placeholder="Escribe para buscar productos..."
                        limpiar={limpiarBuscador}
                    />
                </Col>
                <Col md={2} sm={3}>
                    <Form.Label className="form-label small text-muted">Cantidad <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                        type="number"
                        placeholder="Cantidad"
                        value={cantidad}
                        onChange={(e) => setCantidad(e.target.value)}
                        min="1"
                        required
                    />
                </Col>
                <Col md={2} sm={6}>
                    <Form.Label className="form-label small text-muted">Precio unitario <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                        type="number"
                        placeholder="Precio unitario"
                        value={precioUnitario}
                        onChange={(e) => setPrecioUnitario(e.target.value)}
                        min="0"
                        step="0.01"
                        required
                    />
                    <Form.Text muted>
                        Sugerido: precio de compra del producto.
                    </Form.Text>
                </Col>
                <Col md={2} sm={6}>
                    <Form.Label className="form-label small text-muted">¿Vence?</Form.Label>
                    <Form.Select
                        value={requiereVencimiento ? "si" : "no"}
                        onChange={(e) => {
                            const val = e.target.value === "si";
                            setRequiereVencimiento(val);
                            if (!val) setFechaVencimiento("");
                        }}
                        disabled={!!(productoSeleccionado && productoSeleccionado.esPerecible)}
                    >
                        <option value="no">No</option>
                        <option value="si">Sí</option>
                    </Form.Select>
                </Col>
                {requiereVencimiento && (
                    <Col md={3} sm={6}>
                        <Form.Label className="form-label small text-muted">Fecha de Vencimiento <span className="text-danger">*</span></Form.Label>
                        <Form.Control
                            type="date"
                            placeholder="Fecha de vencimiento"
                            value={fechaVencimiento}
                            onChange={(e) => setFechaVencimiento(e.target.value)}
                            title="Fecha de vencimiento del lote"
                            required
                            min={hoy}
                        />
                    </Col>
                )}
                <Col md={2} sm={3}>
                    <Button variant="primary" onClick={agregarProducto} className="w-100">
                        Agregar
                    </Button>
                </Col>
            </Row>

            <div className="table-responsive">
                <Table bordered size="sm" className="mt-3">
                    <thead>
                        <tr>
                            <th>Producto</th>
                            <th>Cantidad</th>
                            <th>Precio Unitario</th>
                            <th>Fecha Vencimiento</th>
                            <th>Subtotal</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {productosEntrada.map((detalle, index) => (
                            <tr
                                key={index}
                                className={`animate__animated animate__fadeIn ${productoRecienAgregado === detalle.producto.nombreProducto ? 'table-success' : ''
                                    }`}
                                style={{
                                    transition: 'background-color 0.3s ease',
                                    backgroundColor: productoRecienAgregado === detalle.producto.nombreProducto ? '#d1edff' : 'transparent'
                                }}
                            >
                                <td>
                                    <div className="fw-medium">{detalle.producto.nombreProducto}</div>
                                </td>
                                <td>{detalle.cantidad}</td>
                                <td>S/{detalle.precioUnitario}</td>
                                <td>
                                    {detalle.fechaVencimiento ?
                                        formatearFechaLocalDate(detalle.fechaVencimiento) :
                                        <span className="text-muted">Producto sin fecha</span>
                                    }
                                </td>
                                <td>S/{detalle.subtotal}</td>
                                <td>
                                    <Button
                                        variant="outline-danger"
                                        size="sm"
                                        onClick={() => eliminarDetalle(index)}
                                        title="Eliminar producto de la entrada"
                                    >
                                        <X size={14} className="me-1" />
                                        Eliminar
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </div>
        </div>
    );
}

export default TablaProductosEntrada;
