import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Table, Button, Alert, Toast, ToastContainer, Spinner } from 'react-bootstrap';
import { ArrowLeft, Package, Edit, Trash2 } from 'lucide-react';
import apiClient from '../../servicios/apiClient';
import EditarProducto from './EditarProductos';

const ProductosPorCategoria = () => {
    const { categoriaId } = useParams();
    const navigate = useNavigate();
    
    const [productos, setProductos] = useState([]);
    const [categoria, setCategoria] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showEditar, setShowEditar] = useState(false);
    const [productoEditar, setProductoEditar] = useState(null);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastVariant, setToastVariant] = useState('success');

    useEffect(() => {
        cargarDatos();
    }, [categoriaId]);

    const cargarDatos = async () => {
        setLoading(true);
        try {
            // Cargar todos los productos y categorías
            const [productosResponse, categoriasResponse] = await Promise.all([
                apiClient.get("/productos"),
                apiClient.get("/categorias")
            ]);

            // Filtrar productos por categoría
            const productosFiltrados = productosResponse.data.filter(
                producto => producto.idCategoria === parseInt(categoriaId)
            );

            // Obtener información de la categoría
            const categoriaEncontrada = categoriasResponse.data.find(
                cat => cat.idCategoria === parseInt(categoriaId)
            );

            setProductos(productosFiltrados);
            setCategoria(categoriaEncontrada);
            setError('');
        } catch (err) {
            console.error("Error al cargar datos:", err);
            setError("Error al cargar los productos. Intente nuevamente.");
        } finally {
            setLoading(false);
        }
    };

    const handleEliminar = async (id) => {
        if (window.confirm("¿Seguro que deseas eliminar este producto?")) {
            try {
                await apiClient.delete(`/productos/${id}`);
                mostrarNotificacion("Producto eliminado exitosamente", "success");
                cargarDatos();
            } catch (err) {
                console.error("Error al eliminar producto:", err);
                mostrarNotificacion("Error al eliminar el producto", "danger");
            }
        }
    };

    const mostrarNotificacion = (mensaje, variante) => {
        setToastMessage(mensaje);
        setToastVariant(variante);
        setShowToast(true);
    };

    if (loading) {
        return (
            <div className="container mt-4">
                <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
                    <div className="text-center">
                        <Spinner animation="border" variant="primary" />
                        <p className="mt-3 text-muted">Cargando productos...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mt-4">
                <Alert variant="danger" dismissible onClose={() => setError('')}>
                    {error}
                </Alert>
            </div>
        );
    }

    if (!categoria) {
        return (
            <div className="container mt-4">
                <Alert variant="warning">
                    Categoría no encontrada.
                </Alert>
            </div>
        );
    }

    return (
        <div className="container mt-4">
            {/* Header */}
            <div className="d-flex align-items-center gap-3 mb-4">
                <Button 
                    variant="outline-secondary" 
                    onClick={() => navigate(-1)}
                    className="d-flex align-items-center"
                >
                    <ArrowLeft size={20} className="me-2" />
                    Volver
                </Button>
                <Package size={32} className="text-primary" />
                <div>
                    <h3 className="mb-0">Productos de: {categoria.nombre}</h3>
                    <small className="text-muted">
                        {productos.length} producto{productos.length !== 1 ? 's' : ''} encontrado{productos.length !== 1 ? 's' : ''}
                    </small>
                </div>
            </div>

            {/* Tabla de productos */}
            <div className="card shadow-sm">
                <div className="card-body p-0">
                    {productos.length === 0 ? (
                        <div className="text-center py-5">
                            <Package size={48} className="text-muted mb-3" />
                            <h5 className="text-muted">No hay productos en esta categoría</h5>
                            <p className="text-muted">Los productos aparecerán aquí cuando se agreguen a esta categoría.</p>
                        </div>
                    ) : (
                        <Table striped bordered hover responsive className="mb-0">
                            <thead className="table-dark text-center">
                                <tr>
                                    <th>ID</th>
                                    <th>Nombre</th>
                                    <th>Precio</th>
                                    <th>Stock</th>
                                    <th>Fecha Ingreso</th>
                                    <th style={{ width: "180px" }}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="text-center align-middle">
                                {productos.map((producto) => (
                                    <tr key={producto.idProducto}>
                                        <td>{producto.idProducto}</td>
                                        <td className="fw-medium">{producto.nombreProducto}</td>
                                        <td>S/. {producto.precio}</td>
                                        <td>
                                            <span className={`badge ${producto.stock > 10 ? 'bg-success' : producto.stock > 0 ? 'bg-warning' : 'bg-danger'}`}>
                                                {producto.stock}
                                            </span>
                                        </td>
                                        <td>{producto.fechaIngreso}</td>
                                        <td>
                                            <div className="d-flex justify-content-center gap-2">
                                                <Button
                                                    variant="outline-warning"
                                                    size="sm"
                                                    onClick={() => {
                                                        setProductoEditar(producto);
                                                        setShowEditar(true);
                                                    }}
                                                    title="Editar producto"
                                                >
                                                    <Edit size={16} />
                                                    <span className="d-none d-md-inline ms-1">Editar</span>
                                                </Button>
                                                <Button
                                                    variant="outline-danger"
                                                    size="sm"
                                                    onClick={() => handleEliminar(producto.idProducto)}
                                                    title="Eliminar producto"
                                                >
                                                    <Trash2 size={16} />
                                                    <span className="d-none d-md-inline ms-1">Eliminar</span>
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    )}
                </div>
            </div>

            {/* Modal de edición */}
            <EditarProducto
                show={showEditar}
                handleClose={() => setShowEditar(false)}
                producto={productoEditar}
                onProductoUpdated={() => {
                    cargarDatos();
                    mostrarNotificacion("Producto actualizado exitosamente", "success");
                }}
            />

            {/* Toast de notificaciones */}
            <ToastContainer position="top-end" className="p-3">
                <Toast
                    show={showToast}
                    onClose={() => setShowToast(false)}
                    delay={3000}
                    autohide
                    bg={toastVariant}
                >
                    <Toast.Header closeButton>
                        <strong className="me-auto">
                            {toastVariant === "success" ? "Éxito" : "Error"}
                        </strong>
                    </Toast.Header>
                    <Toast.Body className={toastVariant === "success" ? "text-white" : ""}>
                        {toastMessage}
                    </Toast.Body>
                </Toast>
            </ToastContainer>
        </div>
    );
};

export default ProductosPorCategoria;
