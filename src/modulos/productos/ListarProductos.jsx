import { useEffect, useState, useRef } from "react";
import { Table, Button, InputGroup, FormControl, Alert, Toast, ToastContainer, Modal } from "react-bootstrap";
import { Edit, Trash2, Search, X, Package, Plus, AlertTriangle, Clock, DollarSign, Filter, Eye } from "lucide-react";
import AgregarProducto from "./AgregarProductos";
import EditarProducto from "./EditarProductos";
import axios from "axios";
import { loteService } from "../../servicios/loteService";

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
    
    // Estados para el modal de lotes
    const [showLotesModal, setShowLotesModal] = useState(false);
    const [lotesProducto, setLotesProducto] = useState([]);
    const [productoSeleccionado, setProductoSeleccionado] = useState(null);
    const [filtroAlerta, setFiltroAlerta] = useState(""); // Filtro por tipo de alerta
    const [mostrarFiltros, setMostrarFiltros] = useState(false); // Mostrar/ocultar filtros
    const [alertas, setAlertas] = useState({}); // Almacenar alertas por producto

    const inputRef = useRef(null);

    useEffect(() => {
        cargarProductos();
        cargarAlertas();
    }, []);

    const cargarAlertas = async () => {
        try {
            const [lotesVencidos, lotesProximos] = await Promise.all([
                loteService.obtenerLotesVencidos(),
                loteService.obtenerLotesProximosAVencer()
            ]);

            const alertasPorProducto = {};
            
            // Procesar lotes vencidos
            lotesVencidos.forEach(lote => {
                const idProducto = lote.detalleEntrada.producto.idProducto;
                if (!alertasPorProducto[idProducto]) {
                    alertasPorProducto[idProducto] = { 
                        vencidos: 0, 
                        proximos: 0, 
                        fechaMasProxima: null,
                        tipoAlerta: null
                    };
                }
                alertasPorProducto[idProducto].vencidos++;
                alertasPorProducto[idProducto].tipoAlerta = 'vencido';
                
                // Guardar la fecha más próxima (la más reciente de los vencidos)
                if (!alertasPorProducto[idProducto].fechaMasProxima || 
                    new Date(lote.fechaVencimiento) > new Date(alertasPorProducto[idProducto].fechaMasProxima)) {
                    alertasPorProducto[idProducto].fechaMasProxima = lote.fechaVencimiento;
                }
            });

            // Procesar lotes próximos a vencer
            lotesProximos.forEach(lote => {
                const idProducto = lote.detalleEntrada.producto.idProducto;
                if (!alertasPorProducto[idProducto]) {
                    alertasPorProducto[idProducto] = { 
                        vencidos: 0, 
                        proximos: 0, 
                        fechaMasProxima: null,
                        tipoAlerta: null
                    };
                }
                alertasPorProducto[idProducto].proximos++;
                if (alertasPorProducto[idProducto].tipoAlerta !== 'vencido') {
                    alertasPorProducto[idProducto].tipoAlerta = 'proximo';
                }
                
                // Guardar la fecha más próxima (la más cercana a vencer)
                if (!alertasPorProducto[idProducto].fechaMasProxima || 
                    new Date(lote.fechaVencimiento) < new Date(alertasPorProducto[idProducto].fechaMasProxima)) {
                    alertasPorProducto[idProducto].fechaMasProxima = lote.fechaVencimiento;
                }
            });

            setAlertas(alertasPorProducto);
        } catch (error) {
            console.error('Error al cargar alertas:', error);
        }
    };

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

    const obtenerTipoAlerta = (producto) => {
        const alerta = alertas[producto.idProducto];
        if (!alerta || !alerta.tipoAlerta) return null;
        
        return { 
            tipo: alerta.tipoAlerta, 
            cantidad: alerta.vencidos + alerta.proximos, 
            color: alerta.tipoAlerta === 'vencido' ? 'danger' : 'warning',
            fechaMasProxima: alerta.fechaMasProxima
        };
    };

    const verLotes = async (producto) => {
        try {
            const lotes = await loteService.obtenerLotesPorProducto(producto.idProducto);
            
            if (lotes.length === 0) {
                mostrarNotificacion(`No hay lotes registrados para ${producto.nombreProducto}`, 'info');
                return;
            }
            
            // Guardar los lotes y producto seleccionado
            setLotesProducto(lotes);
            setProductoSeleccionado(producto);
            setShowLotesModal(true);
            
        } catch (error) {
            console.error('Error al cargar lotes:', error);
            mostrarNotificacion('Error al cargar los lotes del producto', 'danger');
        }
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
            const alerta = alertas[p.idProducto];
            switch (filtroAlerta) {
                case "stock-bajo":
                    cumpleFiltroAlerta = p.stockBajo === true;
                    break;
                case "proximo-vencer":
                    cumpleFiltroAlerta = alerta && alerta.tipoAlerta === 'proximo';
                    break;
                case "vencido":
                    cumpleFiltroAlerta = alerta && alerta.tipoAlerta === 'vencido';
                    break;
                case "sin-alertas":
                    cumpleFiltroAlerta = !alerta || !alerta.tipoAlerta;
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
                                <label className="form-label">Resumen de alertas:</label>
                                <div className="d-flex gap-2 flex-wrap">
                                    <span className="badge bg-danger">
                                        Vencidos: {Object.values(alertas).filter(a => a.tipoAlerta === 'vencido').length}
                                    </span>
                                    <span className="badge bg-warning">
                                        Próximos a Vencer: {Object.values(alertas).filter(a => a.tipoAlerta === 'proximo').length}
                                    </span>
                                    <span className="badge bg-success">
                                        Sin Alertas: {productos.length - Object.keys(alertas).length}
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
                                <th className="fw-semibold py-3">Alertas</th>
                                <th className="fw-semibold py-3" style={{ width: "160px" }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="text-center align-middle">
                            {loading ? (
                                <tr>
                                    <td colSpan="10" className="text-center py-4">
                                        <div className="spinner-border text-primary" role="status">
                                            <span className="visually-hidden">Cargando...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : productosFiltrados.length === 0 ? (
                                <tr>
                                    <td colSpan="10" className="text-center py-4 text-muted">
                                        {filtro ? "No se encontraron productos" : "No hay productos registrados"}
                                    </td>
                                </tr>
                            ) : (
                                productosFiltrados.map((producto) => {
                                    // Determinar el color de la fila basado en alertas
                                    const getRowClass = () => {
                                        const alerta = obtenerTipoAlerta(producto);
                                        if (alerta && alerta.tipo === 'vencido') return "table-danger";
                                        if (alerta && alerta.tipo === 'proximo') return "table-warning";
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
                                                <div className="d-flex flex-column gap-1">
                                                    {(() => {
                                                        const alerta = obtenerTipoAlerta(producto);
                                                        if (alerta) {
                                                            return (
                                                                <div>
                                                                    <span className={`badge bg-${alerta.color} d-flex align-items-center mb-1`}>
                                                                        <AlertTriangle size={12} className="me-1" />
                                                                        {alerta.tipo === 'vencido' ? 'Vencido' : 'Próximo a Vencer'}
                                                                    </span>
                                                                    <small className="text-muted">
                                                                        {new Date(alerta.fechaMasProxima).toLocaleDateString('es-ES')}
                                                                    </small>
                                                                </div>
                                                            );
                                                        }
                                                        return (
                                                            <span className="text-muted small">Sin alertas</span>
                                                        );
                                                    })()}
                                                </div>
                                            </td>
                                            <td>
                                                <div className="d-flex justify-content-center gap-1 flex-wrap">
                                                    <Button
                                                        variant="outline-info"
                                                        size="sm"
                                                        onClick={() => verLotes(producto)}
                                                        className="btn-sm shadow-sm"
                                                        style={{ minWidth: '32px' }}
                                                        title="Ver lotes del producto"
                                                    >
                                                        <Eye size={12} />
                                                        <span className="d-none d-xl-inline ms-1">Lotes</span>
                                                    </Button>
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

            {/* Modal de Lotes */}
            <Modal show={showLotesModal} onHide={() => setShowLotesModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>
                        📦 Lotes de {productoSeleccionado?.nombreProducto}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {lotesProducto.length > 0 ? (
                        <div>
                            {/* Resumen */}
                            <div className="row mb-3">
                                <div className="col-md-4">
                                    <div className="card bg-light">
                                        <div className="card-body text-center">
                                            <h5 className="card-title text-primary">{lotesProducto.length}</h5>
                                            <p className="card-text small">Total Lotes</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <div className="card bg-light">
                                        <div className="card-body text-center">
                                            <h5 className="card-title text-danger">
                                                {lotesProducto.filter(lote => lote.estaVencido).length}
                                            </h5>
                                            <p className="card-text small">Vencidos</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <div className="card bg-light">
                                        <div className="card-body text-center">
                                            <h5 className="card-title text-warning">
                                                {lotesProducto.filter(lote => lote.estaProximoAVencer).length}
                                            </h5>
                                            <p className="card-text small">Próximos a Vencer</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Tabla de Lotes */}
                            <div className="table-responsive">
                                <table className="table table-hover">
                                    <thead className="table-dark">
                                        <tr>
                                            <th>Número de Lote</th>
                                            <th>Fecha Entrada</th>
                                            <th>Fecha Vencimiento</th>
                                            <th>Cantidad</th>
                                            <th>Estado</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {lotesProducto.map((lote, index) => {
                                            const fechaEntrada = lote.detalleEntrada?.entrada?.fechaEntrada;
                                            const cantidad = lote.detalleEntrada?.cantidad;
                                            
                                            return (
                                                <tr key={lote.idLote || index}>
                                                    <td>
                                                        <span className="badge bg-secondary">
                                                            {lote.numeroLote}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        {fechaEntrada ? 
                                                            new Date(fechaEntrada).toLocaleDateString('es-ES') : 
                                                            'N/A'
                                                        }
                                                    </td>
                                                    <td>
                                                        {lote.fechaVencimiento ? 
                                                            new Date(lote.fechaVencimiento).toLocaleDateString('es-ES') : 
                                                            'Sin fecha'
                                                        }
                                                    </td>
                                                    <td>
                                                        <span className="badge bg-info">
                                                            {cantidad || 'N/A'}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        {lote.estaVencido ? (
                                                            <span className="badge bg-danger">
                                                                🔴 Vencido
                                                            </span>
                                                        ) : lote.estaProximoAVencer ? (
                                                            <span className="badge bg-warning">
                                                                🟡 Próximo a Vencer
                                                            </span>
                                                        ) : (
                                                            <span className="badge bg-success">
                                                                🟢 Activo
                                                            </span>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-4">
                            <p className="text-muted">No hay lotes registrados para este producto.</p>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowLotesModal(false)}>
                        Cerrar
                    </Button>
                </Modal.Footer>
            </Modal>

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
                            {toastVariant === "success" ? "Éxito" : 
                             toastVariant === "info" ? "Información" : 
                             toastVariant === "warning" ? "Advertencia" : "Error"}
                        </strong>
                    </Toast.Header>
                    <Toast.Body className={toastVariant === "success" ? "text-white" : 
                                           toastVariant === "info" ? "text-dark" : ""}>
                        {toastMessage}
                    </Toast.Body>
                </Toast>
            </ToastContainer>
        </div>
    );
};

export default ListarProductos;
