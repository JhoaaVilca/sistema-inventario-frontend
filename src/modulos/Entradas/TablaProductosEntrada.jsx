// src/modulos/Entradas/TablaProductosEntrada.jsx

import { useState } from "react";
import { Button, Form, Table, Row, Col } from "react-bootstrap";
import BuscadorProductos from "./BuscadorProductos";
import SelectProductos from "./SelectProductos";
import { X } from "lucide-react";

function TablaProductosEntrada({ productosEntrada, setProductosEntrada, onProductoAgregado }) {
    const [productoSeleccionado, setProductoSeleccionado] = useState(null);
    const [cantidad, setCantidad] = useState("");
    const [precioUnitario, setPrecioUnitario] = useState("");
    const [fechaVencimiento, setFechaVencimiento] = useState("");
    const [errorInline, setErrorInline] = useState("");
    const [limpiarBuscador, setLimpiarBuscador] = useState(false);
    const [productoRecienAgregado, setProductoRecienAgregado] = useState(null);

    const agregarProducto = () => {
        setErrorInline("");
        if (!productoSeleccionado || cantidad === "" || precioUnitario === "") {
            setErrorInline("Complete producto, cantidad y precio.");
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
        const subtotal = cantidadNum * precioNum;
        const nuevoDetalle = {
            producto: {
                idProducto: productoSeleccionado.idProducto,
                nombreProducto: productoSeleccionado.nombreProducto
            },
            cantidad: cantidadNum,
            precioUnitario: precioNum,
            subtotal: subtotal,
            fechaVencimiento: fechaVencimiento || null
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
                    <Form.Control
                        type="number"
                        placeholder="Cantidad"
                        value={cantidad}
                        onChange={(e) => setCantidad(e.target.value)}
                        min="1"
                    />
                </Col>
                <Col md={2} sm={6}>
                    <Form.Control
                        type="number"
                        placeholder="Precio unitario"
                        value={precioUnitario}
                        onChange={(e) => setPrecioUnitario(e.target.value)}
                        min="0"
                        step="0.01"
                    />
                </Col>
                <Col md={3} sm={6}>
                    <Form.Label className="form-label small text-muted">Fecha de Vencimiento</Form.Label>
                    <Form.Control
                        type="date"
                        placeholder="Fecha de vencimiento"
                        value={fechaVencimiento}
                        onChange={(e) => setFechaVencimiento(e.target.value)}
                        title="Fecha de vencimiento del lote (opcional)"
                    />
                </Col>
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
                                        new Date(detalle.fechaVencimiento).toLocaleDateString('es-ES') :
                                        <span className="text-muted">Sin fecha</span>
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
