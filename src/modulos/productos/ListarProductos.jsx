import { useEffect, useState } from "react";
import "./productos.css";

function ListarProductos() {
    const [productos, setProductos] = useState([]);

    useEffect(() => {
        fetch("http://localhost:8080/api/productos") // Reemplaza si cambiaste el endpoint
            .then((response) => response.json())
            .then((data) => setProductos(data))
            .catch((error) => console.error("Error al obtener productos:", error));
    }, []);

    return (
        <div className="contenedor-productos">
            <h2>Lista de Productos</h2>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Precio</th>
                        <th>Stock</th>
                        <th>Categoría</th>
                        <th>Fecha Ingreso</th>
                    </tr>
                </thead>
                <tbody>
                    {productos.map((producto) => (
                        <tr key={producto.idProducto}>
                            <td>{producto.idProducto}</td>
                            <td>{producto.nombreProducto}</td>
                            <td>S/. {producto.precio}</td>
                            <td>{producto.stock}</td>
                            <td>{producto.categoria}</td>
                            <td>{new Date(producto.fechaIngreso).toLocaleDateString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default ListarProductos;
