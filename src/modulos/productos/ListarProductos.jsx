import { useEffect, useState, useRef } from "react";
import { Table, Button, InputGroup, FormControl, Alert, Toast, ToastContainer } from "react-bootstrap";
import { Edit, Trash2, Search, X, Package, Plus } from "lucide-react";
import AgregarProducto from "./AgregarProductos";
import EditarProducto from "./EditarProductos";
import axios from "axios";

const ListarProductos = () => {
    const [productos, setProductos] = useState([]);
    const [productoEditar, setProductoEditar] = useState(null);
    const [showAgregar, setShowAgregar] = useState(false);
    const [showEditar, setShowEditar] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [filtro, setFiltro] = useState("");
    const [mostrarInput, setMostrarInput] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const [toastVariant, setToastVariant] = useState("success");

    const inputRef = useRef(null);

    useEffect(() => {
        cargarProductos();
    }, []);

    const cargarProductos = async () => {
        setLoading(true);
        try {
            const response = await axios.get("http://localhost:8080/api/productos");
            setProductos(response.data);
            setError("");
        } catch (err) {
            console.error("Error al cargar productos:", err);
            setError("Error al cargar los productos. Intente nuevamente.");
        } finally {
            setLoading(false);
        }
    };

    const handleEliminar = async (id) => {
        if (window.confirm("¿Seguro que deseas eliminar este producto?")) {
            try {
                await axios.delete(`http://localhost:8080/api/productos/${id}`);
                mostrarNotificacion("Producto eliminado exitosamente", "success");
                cargarProductos();
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

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const limpiarBuscador = () => {
        setFiltro("");
        setMostrarInput(false);
        inputRef.current?.blur();
    };

    const productosFiltrados = productos.filter((p) =>
        p.nombreProducto.toLowerCase().includes(filtro.toLowerCase())
    );

    return (
        <div className="container mt-4">
            <div className="d-flex align-items-center gap-3 mb-4 p-3 bg-white rounded-3 shadow-sm border">
                <div className="p-2 bg-primary bg-opacity-10 rounded-3">
                    <Package size={24} className="text-primary" />
                </div>
                <div>
                    <h3 className="mb-0 text-dark fw-bold">Gestión de Productos</h3>
                    <small className="text-muted">Administra tu inventario de productos</small>
                </div>
            </div>

            {/* Botón Agregar */}
            <div className="d-flex justify-content-end align-items-center gap-2 mb-3">
                <Button variant="success" onClick={() => setShowAgregar(true)} className="mb-3">
                    <Plus size={16} /> Agregar Producto
                </Button>
            </div>

            {/* Error */}
            {error && (
                <Alert variant="danger" dismissible onClose={() => setError("")}>
                    {error}
                </Alert>
            )}

            {/* Tabla */}
            <div className="card shadow-sm border-0">
                <div className="card-header bg-white border-0 py-3">
                    <div className="d-flex justify-content-between align-items-center">
                        <h5 className="mb-0 text-dark fw-semibold">
                            Lista de Productos
                            {productosFiltrados.length > 0 && (
                                <span className="badge bg-primary ms-2">{productosFiltrados.length}</span>
                            )}
                        </h5>
                        <div className="d-flex align-items-center gap-2">
                            {!mostrarInput ? (
                                <Button
                                    variant="outline-primary"
                                    size="sm"
                                    onClick={() => setMostrarInput(true)}
                                >
                                    <Search size={16} />
                                </Button>
                            ) : (
                                <InputGroup size="sm" style={{ width: "250px" }}>
                                    <FormControl
                                        ref={inputRef}
                                        autoFocus
                                        placeholder="Buscar productos..."
                                        value={filtro}
                                        onChange={(e) => setFiltro(e.target.value)}
                                    />
                                    {filtro ? (
                                        <Button variant="outline-secondary" onClick={limpiarBuscador}>
                                            <X size={16} />
                                        </Button>
                                    ) : (
                                        <Button
                                            variant="outline-danger"
                                            onClick={() => {
                                                setMostrarInput(false);
                                                setFiltro("");
                                            }}
                                        >
                                            <X size={16} />
                                        </Button>
                                    )}
                                </InputGroup>
                            )}
                        </div>
                    </div>
                </div>
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <Table hover className="mb-0">
                        <thead className="table-light text-center">
                            <tr>
                                <th className="fw-semibold py-3">ID</th>
                                <th className="fw-semibold py-3">Nombre</th>
                                <th className="fw-semibold py-3">Precio</th>
                                <th className="fw-semibold py-3">Categoría</th>
                                <th className="fw-semibold py-3">Stock</th>
                                <th className="fw-semibold py-3">Fecha Ingreso</th>
                                <th className="fw-semibold py-3" style={{ width: "160px" }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="text-center align-middle">
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="text-center py-4">
                                        <div className="spinner-border text-primary" role="status">
                                            <span className="visually-hidden">Cargando...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : productosFiltrados.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="text-center py-4 text-muted">
                                        {filtro ? "No se encontraron productos" : "No hay productos registrados"}
                                    </td>
                                </tr>
                            ) : (
                                productosFiltrados.map((producto) => (
                                    <tr key={producto.idProducto}>
                                        <td>{producto.idProducto}</td>
                                        <td className="fw-medium">{producto.nombreProducto}</td>
                                        <td>S/. {producto.precio}</td>
                                        <td>{producto.nombreCategoria || "Sin categoría"}</td>
                                        <td>{producto.stock}</td>
                                        <td>{producto.fechaIngreso}</td>
                                        <td>
                                            <div className="d-flex justify-content-center gap-1 flex-wrap">
                                                <Button
                                                    variant="outline-warning"
                                                    size="sm"
                                                    onClick={() => {
                                                        setProductoEditar(producto);
                                                        setShowEditar(true);
                                                    }}
                                                    className="btn-sm shadow-sm"
                                                    style={{ minWidth: '32px' }}
                                                    title="Editar producto"
                                                >
                                                    <Edit size={12} />
                                                    <span className="d-none d-xl-inline ms-1">Editar</span>
                                                </Button>
                                                <Button
                                                    variant="outline-danger"
                                                    size="sm"
                                                    onClick={() => handleEliminar(producto.idProducto)}
                                                    className="btn-sm shadow-sm"
                                                    style={{ minWidth: '32px' }}
                                                    title="Eliminar producto"
                                                >
                                                    <Trash2 size={12} />
                                                    <span className="d-none d-xl-inline ms-1">Eliminar</span>
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                        </Table>
                    </div>
                </div>
            </div>

            {/* Modales */}
            <AgregarProducto
                show={showAgregar}
                handleClose={() => setShowAgregar(false)}
                onProductoAdded={() => {
                    cargarProductos();
                    mostrarNotificacion("Producto agregado exitosamente", "success");
                    scrollToTop();
                }}
            />
            <EditarProducto
                show={showEditar}
                handleClose={() => setShowEditar(false)}
                producto={productoEditar}
                onProductoUpdated={() => {
                    cargarProductos();
                    mostrarNotificacion("Producto actualizado exitosamente", "success");
                    scrollToTop();
                }}
            />

            {/* Toasts */}
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

export default ListarProductos;
