import { useEffect, useState, useRef } from "react";
import { Table, Button, InputGroup, FormControl, Alert, Toast, ToastContainer } from "react-bootstrap";
import { Edit, Trash2, Search, X, Package, Plus, AlertTriangle, Clock, DollarSign, Filter } from "lucide-react";
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
    const [filtroAlerta, setFiltroAlerta] = useState(""); // Filtro por tipo de alerta
    const [mostrarFiltros, setMostrarFiltros] = useState(false); // Mostrar/ocultar filtros

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

    const limpiarFiltros = () => {
        setFiltro("");
        setFiltroAlerta("");
        setMostrarInput(false);
        inputRef.current?.blur();
    };

    const productosFiltrados = productos.filter((p) => {
        // Filtro por nombre
        const cumpleFiltroNombre = p.nombreProducto.toLowerCase().includes(filtro.toLowerCase());
        
        // Filtro por tipo de alerta
        let cumpleFiltroAlerta = true;
        if (filtroAlerta) {
            switch (filtroAlerta) {
                case "stock-bajo":
                    cumpleFiltroAlerta = p.stockBajo === true;
                    break;
                case "proximo-vencer":
                    cumpleFiltroAlerta = p.proximoVencer === true;
                    break;
                case "vencido":
                    cumpleFiltroAlerta = p.vencido === true;
                    break;
                case "sin-alertas":
                    cumpleFiltroAlerta = !p.stockBajo && !p.proximoVencer && !p.vencido;
                    break;
                default:
                    cumpleFiltroAlerta = true;
            }
        }
        
        return cumpleFiltroNombre && cumpleFiltroAlerta;
    });

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

            {/* Botón Agregar y Filtros */}
            <div className="d-flex justify-content-between align-items-center gap-2 mb-3">
                <div className="d-flex align-items-center gap-2">
                    <Button 
                        variant="outline-primary" 
                        onClick={() => setMostrarFiltros(!mostrarFiltros)}
                        size="sm"
                    >
                        <Filter size={16} className="me-1" />
                        Filtros
                    </Button>
                    {(filtro || filtroAlerta) && (
                        <Button 
                            variant="outline-secondary" 
                            onClick={limpiarFiltros}
                            size="sm"
                        >
                            <X size={16} className="me-1" />
                            Limpiar
                        </Button>
                    )}
                </div>
                <Button variant="success" onClick={() => setShowAgregar(true)}>
                    <Plus size={16} /> Agregar Producto
                </Button>
            </div>

            {/* Panel de Filtros */}
            {mostrarFiltros && (
                <div className="card mb-3">
                    <div className="card-header bg-light">
                        <h6 className="mb-0">Filtros de Búsqueda</h6>
                    </div>
                    <div className="card-body">
                        <div className="row g-3">
                            <div className="col-md-6">
                                <label className="form-label">Filtrar por tipo de alerta:</label>
                                <select 
                                    className="form-select"
                                    value={filtroAlerta}
                                    onChange={(e) => setFiltroAlerta(e.target.value)}
                                >
                                    <option value="">Todas las alertas</option>
                                    <option value="stock-bajo">🔴 Stock Bajo</option>
                                    <option value="proximo-vencer">🟡 Próximo a Vencer</option>
                                    <option value="vencido">🔴 Vencido</option>
                                    <option value="sin-alertas">🟢 Sin Alertas</option>
                                </select>
                            </div>
                            <div className="col-md-6">
                                <label className="form-label">Contador de alertas:</label>
                                <div className="d-flex gap-2 flex-wrap">
                                    <span className="badge bg-danger">
                                        Stock Bajo: {productos.filter(p => p.stockBajo).length}
                                    </span>
                                    <span className="badge bg-warning">
                                        Próximo a Vencer: {productos.filter(p => p.proximoVencer).length}
                                    </span>
                                    <span className="badge bg-danger">
                                        Vencidos: {productos.filter(p => p.vencido).length}
                                    </span>
                                    <span className="badge bg-success">
                                        Sin Alertas: {productos.filter(p => !p.stockBajo && !p.proximoVencer && !p.vencido).length}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

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
                                <th className="fw-semibold py-3">Precio Venta</th>
                                <th className="fw-semibold py-3">Precio Compra</th>
                                <th className="fw-semibold py-3">Stock</th>
                                <th className="fw-semibold py-3">Stock Mín.</th>
                                <th className="fw-semibold py-3">Unidad</th>
                                <th className="fw-semibold py-3">Categoría</th>
                                <th className="fw-semibold py-3">Proveedor</th>
                                <th className="fw-semibold py-3">Vence</th>
                                <th className="fw-semibold py-3">Alertas</th>
                                <th className="fw-semibold py-3" style={{ width: "160px" }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="text-center align-middle">
                            {loading ? (
                                <tr>
                                    <td colSpan="12" className="text-center py-4">
                                        <div className="spinner-border text-primary" role="status">
                                            <span className="visually-hidden">Cargando...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : productosFiltrados.length === 0 ? (
                                <tr>
                                    <td colSpan="12" className="text-center py-4 text-muted">
                                        {filtro ? "No se encontraron productos" : "No hay productos registrados"}
                                    </td>
                                </tr>
                            ) : (
                                productosFiltrados.map((producto) => {
                                    // Determinar el color de la fila basado en alertas
                                    const getRowClass = () => {
                                        if (producto.vencido) return "table-danger";
                                        if (producto.proximoVencer) return "table-warning";
                                        if (producto.stockBajo) return "table-info";
                                        return "";
                                    };

                                    return (
                                        <tr key={producto.idProducto} className={getRowClass()}>
                                            <td>{producto.idProducto}</td>
                                            <td className="fw-medium text-start">
                                                <div>
                                                    <div>{producto.nombreProducto}</div>
                                                    {producto.descripcionCorta && (
                                                        <small className="text-muted">{producto.descripcionCorta}</small>
                                                    )}
                                                </div>
                                            </td>
                                            <td>
                                                <div className="fw-bold text-success">
                                                    S/. {producto.precio?.toFixed(2) || '0.00'}
                                                </div>
                                                {producto.margenGanancia && (
                                                    <small className="text-success">
                                                        Gana: S/. {((producto.precio - (producto.precio / (1 + producto.margenGanancia / 100))) || 0).toFixed(2)}
                                                    </small>
                                                )}
                                            </td>
                                            <td>
                                                <div className="text-primary">
                                                    S/. {producto.precioCompra?.toFixed(2) || '0.00'}
                                                </div>
                                            </td>
                                            <td>
                                                <div className={`fw-bold ${producto.stockBajo ? 'text-danger' : ''}`}>
                                                    {producto.stock || 0}
                                                </div>
                                            </td>
                                            <td>
                                                <div className="text-muted">
                                                    {producto.stockMinimo || 0}
                                                </div>
                                            </td>
                                            <td>
                                                <span className="badge bg-secondary">
                                                    {producto.unidadMedida || 'N/A'}
                                                </span>
                                            </td>
                                            <td>
                                                <span className="badge bg-primary">
                                                    {producto.nombreCategoria || "Sin categoría"}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="text-muted small">
                                                    {producto.nombreProveedorPrincipal || "Sin proveedor"}
                                                </div>
                                            </td>
                                            <td>
                                                {producto.esPerecible ? (
                                                    <div>
                                                        <div className={`fw-bold ${producto.vencido ? 'text-danger' : producto.proximoVencer ? 'text-warning' : 'text-success'}`}>
                                                            {producto.fechaVencimiento || 'N/A'}
                                                        </div>
                                                        {producto.vencido && (
                                                            <small className="text-danger">¡Vencido!</small>
                                                        )}
                                                        {producto.proximoVencer && !producto.vencido && (
                                                            <small className="text-warning">Próximo a vencer</small>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-muted">No vence</span>
                                                )}
                                            </td>
                                            <td>
                                                <div className="d-flex flex-column gap-1">
                                                    {producto.stockBajo && (
                                                        <span className="badge bg-danger d-flex align-items-center">
                                                            <AlertTriangle size={12} className="me-1" />
                                                            Stock Bajo
                                                        </span>
                                                    )}
                                                    {producto.proximoVencer && !producto.vencido && (
                                                        <span className="badge bg-warning d-flex align-items-center">
                                                            <Clock size={12} className="me-1" />
                                                            Próximo a Vencer
                                                        </span>
                                                    )}
                                                    {producto.vencido && (
                                                        <span className="badge bg-danger d-flex align-items-center">
                                                            <AlertTriangle size={12} className="me-1" />
                                                            Vencido
                                                        </span>
                                                    )}
                                                    {!producto.stockBajo && !producto.proximoVencer && !producto.vencido && (
                                                        <span className="text-muted small">Sin alertas</span>
                                                    )}
                                                </div>
                                            </td>
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
                                    );
                                })
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
