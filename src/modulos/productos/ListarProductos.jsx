import { useEffect, useState } from "react";
import AgregarProducto from './AgregarProductos';
import EditarProductos from "./EditarProductos";

function ListarProductos() {
    const [productos, setProductos] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [productoEditar, setProductoSeleccionado] = useState(null);

    // 🟢 Cargar productos al iniciar
    useEffect(() => {
        fetch("http://localhost:8080/api/productos")
            .then((response) => response.json())
            .then((data) => setProductos(data))
            .catch((error) => console.error("Error al obtener productos:", error));
    }, []);

    const handleOpenAddModal = () => setShowAddModal(true);
    const handleCloseAddModal = () => setShowAddModal(false);

    const handleProductoAgregado = (nuevoProducto) => {
        setProductos((prev) => [...prev, nuevoProducto]);
        handleCloseAddModal();
    };

    // ✏️ Editar
    const handleEditarClick = (producto) => {
        setProductoSeleccionado(producto);
        setShowEditModal(true);
    };

    const handleProductoEditado = (productoActualizado) => {
        setProductos((prevProductos) =>
            prevProductos.map((prod) =>
                prod.idProducto === productoActualizado.idProducto ? productoActualizado : prod
            )
        );
        setShowEditModal(false);
    };

    // ❌ Eliminar
    const handleEliminarProducto = (idProducto) => {
        const confirmacion = window.confirm("¿Estás segura de eliminar este producto?");
        if (!confirmacion) return;

        fetch(`http://localhost:8080/api/productos/${idProducto}`, {
            method: "DELETE",
        })
            .then((response) => {
                if (response.ok) {
                    // Filtramos la lista para quitar el producto eliminado
                    setProductos((prev) =>
                        prev.filter((producto) => producto.idProducto !== idProducto)
                    );
                } else {
                    console.error("Error al eliminar el producto.");
                }
            })
            .catch((error) => console.error("Error de red al eliminar:", error));
    };

    return (
        <div className="container mt-4">
            <h2 className="mb-4 text-center">Lista de Productos</h2>

            <button className="btn btn-primary mb-3" onClick={handleOpenAddModal}>
                Agregar Producto
            </button>

            <table className="table table-striped table-bordered">
                <thead className="table-dark">
                    <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Precio</th>
                        <th>Stock</th>
                        <th>Categoría</th>
                        <th>Fecha Ingreso</th>
                        <th>Acciones</th>
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
                            <td>
                                <button
                                    className="btn btn-success btn-sm me-2"
                                    onClick={() => handleEditarClick(producto)}
                                >
                                    Editar
                                </button>
                                <button
                                    className="btn btn-danger btn-sm"
                                    onClick={() => handleEliminarProducto(producto.idProducto)}
                                >
                                    Eliminar
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <AgregarProducto
                show={showAddModal}
                handleClose={handleCloseAddModal}
                onProductoAdded={handleProductoAgregado}
            />

            {productoEditar && (
                <EditarProductos
                    show={showEditModal}
                    handleClose={() => setShowEditModal(false)}
                    producto={productoEditar}
                    onProductoEditado={handleProductoEditado}
                />
            )}
        </div>
    );
}

export default ListarProductos;
