import { useEffect, useState } from "react";
import { Button, Form, Table, Row, Col } from "react-bootstrap";
import apiClient from "../../servicios/apiClient";

function TablaProductosSalida({ productosSalida, setProductosSalida }) {
    const [productos, setProductos] = useState([]);
    const [productoSeleccionado, setProductoSeleccionado] = useState("");
    const [cantidad, setCantidad] = useState("");
    const [precioUnitario, setPrecioUnitario] = useState("");

    useEffect(() => {
        const obtenerProductos = async () => {
            try {
                const { data } = await apiClient.get("/productos");
                setProductos(data);
            } catch (error) {
                console.error("Error al obtener productos:", error);
            }
        };
        obtenerProductos();
    }, []);

    const agregarProducto = () => {
        if (!productoSeleccionado) return;
        const cantidadNum = parseInt(cantidad, 10);
        const precioNum = parseFloat(precioUnitario);
        if (!(cantidadNum > 0) || !(precioNum >= 0)) return;

        const producto = productos.find((p) => p.idProducto === parseInt(productoSeleccionado, 10));
        const nuevoDetalle = {
            producto: { idProducto: producto.idProducto, nombreProducto: producto.nombreProducto },
            cantidad: cantidadNum,
            precioUnitario: precioNum
        };

        setProductosSalida([...(productosSalida || []), nuevoDetalle]);
        setProductoSeleccionado("");
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
                    <Form.Select
                        value={productoSeleccionado}
                        onChange={(e) => setProductoSeleccionado(e.target.value)}
                    >
                        <option value="">Seleccione un producto</option>
                        {productos.map((p) => (
                            <option key={p.idProducto} value={p.idProducto}>
                                {p.nombreProducto}
                            </option>
                        ))}
                    </Form.Select>
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
        </div>
    );
}

export default TablaProductosSalida;


