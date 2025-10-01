import { useEffect, useState } from "react";
import { Button, Form, Table, Row, Col } from "react-bootstrap";
import apiClient from "../../servicios/apiClient";
import SelectProductos from "../Entradas/SelectProductos";

function TablaProductosSalida({ productosSalida, setProductosSalida }) {
    const [productos, setProductos] = useState([]);
    const [productoSeleccionado, setProductoSeleccionado] = useState(null);
    const [cantidad, setCantidad] = useState("");
    const [precioUnitario, setPrecioUnitario] = useState("");

    useEffect(() => {
        const obtenerProductos = async () => {
            try {
                const { data } = await apiClient.get("/productos", { params: { page: 0, size: 1000 } });
                setProductos(data?.content || []);
            } catch (error) {
                console.error("Error al obtener productos:", error);
            }
        };
        obtenerProductos();
    }, []);

    const agregarProducto = () => {
        if (!productoSeleccionado) return;
        const cantidadNum = parseInt(cantidad, 10);
        const precioNum = parseFloat(
            precioUnitario === "" || precioUnitario === null ? (productoSeleccionado?.precio ?? 0) : precioUnitario
        );
        if (!(cantidadNum > 0) || !(precioNum >= 0)) return;

        const nuevoDetalle = {
            producto: { idProducto: productoSeleccionado.idProducto, nombreProducto: productoSeleccionado.nombreProducto },
            cantidad: cantidadNum,
            precioUnitario: precioNum
        };

        setProductosSalida([...(productosSalida || []), nuevoDetalle]);
        setProductoSeleccionado(null);
        setCantidad("");
        setPrecioUnitario("");
    };

    const eliminarDetalle = (index) => {
        const copia = [...productosSalida];
        copia.splice(index, 1);
        setProductosSalida(copia);
    };

    return (
        <div className="mt-3">
            <h5>Detalles de la Salida</h5>
            <Row className="g-2 mb-3">
                <Col md={4} sm={6}>
                    <SelectProductos
                        onProductoSeleccionado={(p) => {
                            setProductoSeleccionado(p);
                            // Pre-cargar precio unitario si está vacío
                            if (p && (precioUnitario === "" || precioUnitario === null)) {
                                setPrecioUnitario(p.precio ?? "");
                            }
                        }}
                        placeholder="Escribe para buscar productos..."
                    />
                    {productoSeleccionado && (
                        <div className="small text-muted mt-1">
                            Stock: {productoSeleccionado.stock ?? 0} {productoSeleccionado.unidadMedida || ""} · Precio sugerido: S/{(productoSeleccionado.precio ?? 0).toFixed(2)}
                        </div>
                    )}
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
                <Col md={3} sm={6}>
                    <Form.Control
                        type="number"
                        placeholder="Precio unitario"
                        value={precioUnitario}
                        onChange={(e) => setPrecioUnitario(e.target.value)}
                        min="0"
                        step="0.01"
                    />
                </Col>
                <Col md={3} sm={3}>
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
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(productosSalida || []).map((detalle, idx) => (
                            <tr key={idx}>
                                <td>{detalle.producto?.nombreProducto || detalle.producto?.idProducto}</td>
                                <td>{detalle.cantidad}</td>
                                <td>S/{Number(detalle.precioUnitario).toFixed(2)}</td>
                                <td>
                                    <Button variant="outline-danger" size="sm" onClick={() => eliminarDetalle(idx)}>Eliminar</Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </div>
            {(productosSalida || []).length > 0 && (
                <div className="text-end mt-2">
                    <strong>Total: S/{(productosSalida || []).reduce((acc, d) => acc + (Number(d.precioUnitario) * Number(d.cantidad)), 0).toFixed(2)}</strong>
                </div>
            )}
        </div>
    );
}

export default TablaProductosSalida;


