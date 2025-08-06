// src/modulos/Entradas/TablaProductosEntrada.jsx

import { useEffect, useState } from "react";
import { Button, Form } from "react-bootstrap";
import axios from "axios";

function TablaProductosEntrada({ productosEntrada, setProductosEntrada }) {
    const [productos, setProductos] = useState([]);
    const [productoSeleccionado, setProductoSeleccionado] = useState("");
    const [cantidad, setCantidad] = useState("");
    const [precioUnitario, setPrecioUnitario] = useState("");

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
        if (!productoSeleccionado || !cantidad || !precioUnitario) return;

        const producto = productos.find((p) => p.idProducto === parseInt(productoSeleccionado));
        const cantidadNum = parseInt(cantidad);
        const precioNum = parseFloat(precioUnitario);
        const subtotal = cantidadNum * precioNum;
        const nuevoDetalle = {
            producto: { idProducto: producto.idProducto },
            cantidad: cantidadNum,
            precioUnitario: precioNum,
            subtotal: subtotal
        };

        setProductosEntrada([...productosEntrada, nuevoDetalle]);
        setProductoSeleccionado("");
        setCantidad("");
        setPrecioUnitario("");
    };

    return (
        <div className="mt-3">
            <h5>Productos de la Entrada</h5>
            <div className="d-flex gap-2">
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
                />
                <Form.Control
                    type="number"
                    placeholder="Precio unitario"
                    value={precioUnitario}
                    onChange={(e) => setPrecioUnitario(e.target.value)}
                />
                <Button variant="primary" onClick={agregarProducto}>Agregar</Button>
            </div>

            <ul className="mt-3">
                {productosEntrada.map((detalle, index) => (
                    <li key={index}>
                        Producto: {detalle.producto.idProducto} - Cantidad: {detalle.cantidad} - Precio unitario: S/{detalle.precioUnitario} - Subtotal: S/{detalle.subtotal}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default TablaProductosEntrada;
