import { useEffect, useState } from "react";
import { Table, Button, Form, Card, Badge, Collapse, Alert, Spinner } from "react-bootstrap";
import AgregarEntrada from "./AgregarEntrada";
import EditarEntrada from "./EditarEntrada";
import { Plus, Search, X, Filter, Calendar, Building, ChevronDown, ChevronUp, Edit, Trash2 } from "lucide-react";

function ListarEntradas() {
    const [entradas, setEntradas] = useState([]);
    const [proveedores, setProveedores] = useState([]);
    const [idProveedor, setIdProveedor] = useState("");
    const [fechaInicio, setFechaInicio] = useState("");
    const [fechaFin, setFechaFin] = useState("");
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [entradaSeleccionada, setEntradaSeleccionada] = useState(null);
    const [filtrosActivos, setFiltrosActivos] = useState(false);
    const [filtrosAbiertos, setFiltrosAbiertos] = useState(false);
    const [cargando, setCargando] = useState(false);
    const [errorListado, setErrorListado] = useState("");

    const obtenerEntradas = async () => {
        try {
            setErrorListado("");
            setCargando(true);
            const response = await fetch("http://localhost:8080/api/entradas");
            if (!response.ok) throw new Error("Error de servidor");
            const data = await response.json();
            setEntradas(data);
        } catch (error) {
            console.error("Error al obtener entradas:", error);
            setErrorListado("No se pudo cargar el listado de entradas.");
        } finally {
            setCargando(false);
        }
    };

    const obtenerProveedores = async () => {
        try {
            const response = await fetch("http://localhost:8080/api/proveedores");
            if (!response.ok) throw new Error();
            const data = await response.json();
            setProveedores(data);
        } catch (error) {
            console.error("Error al obtener proveedores:", error);
        }
    };

    const filtrarEntradas = async () => {
        try {
            setErrorListado("");
            setCargando(true);
            let url = `http://localhost:8080/api/entradas`;
            if (idProveedor && fechaInicio && fechaFin) {
                url += `/filtrar?idProveedor=${idProveedor}&fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`;
            }
            const response = await fetch(url);
            if (!response.ok) throw new Error();
            const data = await response.json();
            setEntradas(data);
            setFiltrosActivos(Boolean(idProveedor && fechaInicio && fechaFin));
        } catch (error) {
            console.error("Error al filtrar entradas:", error);
            setErrorListado("No se pudo aplicar el filtro.");
        } finally {
            setCargando(false);
        }
    };

    const limpiarFiltros = () => {
        setIdProveedor("");
        setFechaInicio("");
        setFechaFin("");
        setFiltrosActivos(false);
        obtenerEntradas();
    };

    const toggleFiltros = () => {
        setFiltrosAbiertos(!filtrosAbiertos);
    };

    useEffect(() => {
        obtenerEntradas();
        obtenerProveedores();
    }, []);

    const handleAgregarEntrada = () => setShowAddModal(true);
    const handleCerrarModalAgregar = () => setShowAddModal(false);
    const handleCerrarModalEditar = () => {
        setShowEditModal(false);
        setEntradaSeleccionada(null);
    };

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleEntradaAgregada = () => {
        obtenerEntradas();
        handleCerrarModalAgregar();
        scrollToTop();
    };

    const handleEditar = (entrada) => {
        setEntradaSeleccionada(entrada);
        setShowEditModal(true);
    };

    const handleEliminacion = async (idEntrada) => {
        if (!window.confirm("¿Seguro que quieres eliminar esta entrada?")) return;

        try {
            await fetch(`http://localhost:8080/api/entradas/${idEntrada}`, { method: "DELETE" });
            obtenerEntradas();
        } catch (error) {
            console.error("Error al eliminar entrada:", error);
        }
    };

    return (
        <div className="container mt-4">
            <div className="d-flex align-items-center gap-3 mb-4 p-3 bg-white rounded-3 shadow-sm border">
                <div className="p-2 bg-warning bg-opacity-10 rounded-3">
                    <Calendar size={24} className="text-warning" />
                </div>
                <div>
                    <h3 className="mb-0 text-dark fw-bold">Gestión de Entradas</h3>
                    <small className="text-muted">Administra las entradas de productos al inventario</small>
                </div>
                {cargando && <Spinner animation="border" size="sm" />}
            </div>

            {errorListado && (
                <Alert variant="danger" className="mb-3">{errorListado}</Alert>
            )}

            {/* FILTROS DESPLEGABLES */}
            <Card className="mb-4 shadow-sm">
                <Card.Header
                    className="bg-light cursor-pointer"
                    onClick={toggleFiltros}
                    style={{ cursor: 'pointer' }}
                >
                    <div className="d-flex align-items-center justify-content-between">
                        <div className="d-flex align-items-center">
                            <Filter size={20} className="me-2 text-primary" />
                            <h6 className="mb-0">Filtros de Búsqueda</h6>
                            {filtrosActivos && (
                                <Badge bg="primary" className="ms-2">
                                    Filtros Activos
                                </Badge>
                            )}
                        </div>
                        <div className="d-flex align-items-center">
                            {filtrosActivos && (
                                <Button
                                    variant="outline-secondary"
                                    size="sm"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        limpiarFiltros();
                                    }}
                                    className="me-2"
                                >
                                    <X size={14} className="me-1" />
                                    Limpiar
                                </Button>
                            )}
                            {filtrosAbiertos ? (
                                <ChevronUp size={20} className="text-muted" />
                            ) : (
                                <ChevronDown size={20} className="text-muted" />
                            )}
                        </div>
                    </div>
                </Card.Header>
                <Collapse in={filtrosAbiertos}>
                    <Card.Body>
                        <div className="row g-3">
                            <div className="col-lg-4 col-md-6">
                                <Form.Group>
                                    <Form.Label className="d-flex align-items-center">
                                        <Building size={16} className="me-2" />
                                        Proveedor
                                    </Form.Label>
                                    <Form.Select
                                        value={idProveedor}
                                        onChange={e => setIdProveedor(e.target.value)}
                                        size="sm"
                                    >
                                        <option value="">Seleccione un proveedor</option>
                                        {proveedores.map(prov => (
                                            <option key={prov.idProveedor} value={prov.idProveedor}>
                                                {prov.nombre}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </div>
                            <div className="col-lg-3 col-md-6">
                                <Form.Group>
                                    <Form.Label className="d-flex align-items-center">
                                        <Calendar size={16} className="me-2" />
                                        Fecha Inicio
                                    </Form.Label>
                                    <Form.Control
                                        type="date"
                                        value={fechaInicio}
                                        onChange={e => setFechaInicio(e.target.value)}
                                        size="sm"
                                    />
                                </Form.Group>
                            </div>
                            <div className="col-lg-3 col-md-6">
                                <Form.Group>
                                    <Form.Label className="d-flex align-items-center">
                                        <Calendar size={16} className="me-2" />
                                        Fecha Fin
                                    </Form.Label>
                                    <Form.Control
                                        type="date"
                                        value={fechaFin}
                                        onChange={e => setFechaFin(e.target.value)}
                                        size="sm"
                                    />
                                </Form.Group>
                            </div>
                            <div className="col-lg-2 col-md-12 d-flex align-items-end">
                                <Button
                                    variant="primary"
                                    onClick={filtrarEntradas}
                                    size="sm"
                                    className="d-flex align-items-center justify-content-center w-100"
                                    disabled={!idProveedor || !fechaInicio || !fechaFin || cargando}
                                >
                                    <Search size={14} className="me-1" />
                                    Buscar
                                </Button>
                            </div>
                        </div>
                    </Card.Body>
                </Collapse>
            </Card>

            <div className="d-flex justify-content-end align-items-center gap-2 mb-3">
                <Button variant="success" onClick={handleAgregarEntrada} className="mb-3" disabled={cargando}>
                    <Plus size={16} /> Agregar Entrada
                </Button>
            </div>

            {(!entradas || entradas.length === 0) && !cargando ? (
                <Card className="shadow-sm">
                    <Card.Body className="text-center text-muted">No hay entradas para mostrar.</Card.Body>
                </Card>
            ) : (
            <div className="card shadow-sm border-0">
                <div className="card-header bg-white border-0 py-3">
                    <h5 className="mb-0 text-dark fw-semibold">
                        Lista de Entradas
                        {entradas.length > 0 && (
                            <span className="badge bg-primary ms-2">{entradas.length}</span>
                        )}
                    </h5>
                </div>
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <Table hover className="mb-0">
                            <thead className="table-light text-center">
                                <tr>
                                    <th className="fw-semibold py-3">ID</th>
                                    <th className="fw-semibold py-3">Proveedor</th>
                                    <th className="fw-semibold py-3">Fecha</th>
                                    <th className="fw-semibold py-3">Total</th>
                                    <th className="fw-semibold py-3">Detalles</th>
                                    <th className="fw-semibold py-3" style={{ width: '120px' }}>Acciones</th>
                                </tr>
                            </thead>
                <tbody>
                    {entradas?.map((entrada) => (
                        <tr key={entrada.idEntrada}>
                            <td>{entrada.idEntrada}</td>
                            <td>{entrada.proveedor?.nombre}</td>
                            <td>{entrada.fechaEntrada}</td>
                            <td>S/{entrada.totalEntrada?.toFixed(2)}</td>
                            <td>
                                <Table size="sm" bordered>
                                    <thead>
                                        <tr>
                                            <th>Producto</th>
                                            <th>Cantidad</th>
                                            <th>Precio Unitario</th>
                                            <th>Subtotal</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {entrada.detalles?.map((detalle, idx) => (
                                            <tr key={idx}>
                                                <td>{detalle.producto?.nombreProducto}</td>
                                                <td>{detalle.cantidad}</td>
                                                <td>S/{detalle.precioUnitario}</td>
                                                <td>S/{detalle.subtotal}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </td>
                            <td>
                                <div className="d-flex justify-content-center gap-1 flex-wrap">
                                    <Button
                                        variant="outline-warning"
                                        size="sm"
                                        onClick={() => handleEditar(entrada)}
                                        title="Editar entrada"
                                        disabled={cargando}
                                        className="btn-sm shadow-sm"
                                        style={{ minWidth: '32px' }}
                                    >
                                        <Edit size={12} />
                                        <span className="d-none d-xl-inline ms-1">Editar</span>
                                    </Button>

                                    <Button
                                        variant="outline-danger"
                                        size="sm"
                                        onClick={() => handleEliminacion(entrada.idEntrada)}
                                        title="Eliminar entrada"
                                        disabled={cargando}
                                        className="btn-sm shadow-sm"
                                        style={{ minWidth: '32px' }}
                                    >
                                        <Trash2 size={12} />
                                        <span className="d-none d-xl-inline ms-1">Eliminar</span>
                                    </Button>
                                </div>
                            </td>

                        </tr>
                    ))}
                </tbody>
                        </Table>
                    </div>
                </div>
            </div>
            )}

            {/* Modal Agregar */}
            <AgregarEntrada
                show={showAddModal}
                handleClose={handleCerrarModalAgregar}
                onEntradaAgregada={handleEntradaAgregada}
            />

            {/* Modal Editar */}
            {entradaSeleccionada && (
                <EditarEntrada
                    show={showEditModal}
                    handleClose={handleCerrarModalEditar}
                    entrada={entradaSeleccionada}
                    onEntradaEditada={obtenerEntradas}
                />
            )}
        </div>
    );
}

export default ListarEntradas;
