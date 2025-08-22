// src/modulos/Entradas/TablaProductosEntrada.jsx

import { useEffect, useState } from "react";
import { Button, Form, Table } from "react-bootstrap";
import axios from "axios";

function TablaProductosEntrada({ productosEntrada, setProductosEntrada }) {
    const [productos, setProductos] = useState([]);
    const [productoSeleccionado, setProductoSeleccionado] = useState("");
    const [cantidad, setCantidad] = useState("");
    const [precioUnitario, setPrecioUnitario] = useState("");
    const [errorInline, setErrorInline] = useState("");

    useEffect(() => {
        const obtenerProductos = async () => {
            try {
                const response = await axios.get("http://localhost:8080/api/productos");
                setProductos(response.data);
            } catch (error) {
                console.error("Error al obtener productos:", error);
            }
        };
        obtenerProductos();
    }, []);

    const agregarProducto = () => {
        setErrorInline("");
        if (!productoSeleccionado || cantidad === "" || precioUnitario === "") {
            setErrorInline("Complete producto, cantidad y precio.");
            return;
        }

        const producto = productos.find((p) => p.idProducto === parseInt(productoSeleccionado));
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
            producto: { idProducto: producto.idProducto },
            cantidad: cantidadNum,
            precioUnitario: precioNum,
            subtotal: subtotal
        };

        setProductosEntrada([...(productosEntrada || []), nuevoDetalle]);
        setProductoSeleccionado("");
        setCantidad("");
        setPrecioUnitario("");
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
            <div className="d-flex gap-2 flex-wrap align-items-end">
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
                <Form.Control
                    type="number"
                    placeholder="Cantidad"
                    value={cantidad}
                    onChange={(e) => setCantidad(e.target.value)}
                    min="1"
                />
                <Form.Control
                    type="number"
                    placeholder="Precio unitario"
                    value={precioUnitario}
                    onChange={(e) => setPrecioUnitario(e.target.value)}
                    min="0"
                    step="0.01"
                />
                <Button variant="primary" onClick={agregarProducto}>Agregar</Button>
            </div>

            <Table bordered size="sm" className="mt-3">
                <thead>
                    <tr>
                        <th>Producto</th>
                        <th>Cantidad</th>
                        <th>Precio Unitario</th>
                        <th>Subtotal</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {productosEntrada.map((detalle, index) => (
                        <tr key={index}>
                            <td>{detalle.producto.idProducto}</td>
                            <td>{detalle.cantidad}</td>
                            <td>S/{detalle.precioUnitario}</td>
                            <td>S/{detalle.subtotal}</td>
                            <td>
                                <Button variant="outline-danger" size="sm" onClick={() => eliminarDetalle(index)}>Eliminar</Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </div>
    );
}

export default TablaProductosEntrada;
