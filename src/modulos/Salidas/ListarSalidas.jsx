import { useEffect, useState } from "react";
import { Table, Button, Form, Card, Badge, Collapse, Alert } from "react-bootstrap";
import AgregarSalida from "./AgregarSalida";
import EditarSalida from "./EditarSalida";
import { Plus, Search, X, Filter, Calendar, ChevronDown, ChevronUp, Edit, Trash2 } from "lucide-react";
import apiClient from "../../servicios/apiClient";

function ListarSalidas() {
    const [salidas, setSalidas] = useState([]);
    const [fechaInicio, setFechaInicio] = useState("");
    const [fechaFin, setFechaFin] = useState("");
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [salidaSeleccionada, setSalidaSeleccionada] = useState(null);
    const [filtrosActivos, setFiltrosActivos] = useState(false);
    const [filtrosAbiertos, setFiltrosAbiertos] = useState(false);
    const [errorListado, setErrorListado] = useState("");

    const obtenerSalidas = async () => {
        try {
            setErrorListado("");
            const { data } = await apiClient.get("/salidas");
            setSalidas(data);
        } catch (error) {
            console.error("Error al obtener salidas:", error);
            setErrorListado("No se pudo cargar el listado de salidas.");
        }
    };

    const filtrarSalidas = async () => {
        try {
            let url = `/salidas`;
            if (fechaInicio && fechaFin) {
                url += `/filtrar/rango?inicio=${fechaInicio}&fin=${fechaFin}`;
            }
            const { data } = await apiClient.get(url);
            setSalidas(data);
            setFiltrosActivos(Boolean(fechaInicio && fechaFin));
        } catch (error) {
            console.error("Error al filtrar salidas:", error);
        }
    };

    const limpiarFiltros = () => {
        setFechaInicio("");
        setFechaFin("");
        setFiltrosActivos(false);
        obtenerSalidas();
    };

    const toggleFiltros = () => {
        setFiltrosAbiertos(!filtrosAbiertos);
    };

    useEffect(() => {
        obtenerSalidas();
    }, []);

    const handleAgregarSalida = () => setShowAddModal(true);
    const handleCerrarModalAgregar = () => setShowAddModal(false);
    const handleCerrarModalEditar = () => {
        setShowEditModal(false);
        setSalidaSeleccionada(null);
    };

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSalidaAgregada = () => {
        obtenerSalidas();
        handleCerrarModalAgregar();
        scrollToTop();
    };

    const handleEditar = (salida) => {
        setSalidaSeleccionada(salida);
        setShowEditModal(true);
    };

    const handleEliminacion = async (idSalida) => {
        if (!window.confirm("¿Seguro que quieres eliminar esta salida?")) return;

        try {
            await apiClient.delete(`/salidas/${idSalida}`);
            obtenerSalidas();
        } catch (error) {
            console.error("Error al eliminar salida:", error);
        }
    };

    const handleAsignarCliente = (idSalida) => {
        // Por ahora, redirigir a editar la salida para asignar cliente
        const salida = salidas.find(s => s.idSalida === idSalida);
        if (salida) {
            setSalidaSeleccionada(salida);
            setShowEditModal(true);
        }
    };

    return (
        <div className="container mt-4">
            <div className="d-flex align-items-center gap-3 mb-4 p-3 bg-white rounded-3 shadow-sm border">
                <div className="p-2 bg-danger bg-opacity-10 rounded-3">
                    <Calendar size={24} className="text-danger" />
                </div>
                <div>
                    <h3 className="mb-0 text-dark fw-bold">Gestión de Salidas</h3>
                    <small className="text-muted">Administra las salidas de productos del inventario</small>
                </div>
            </div>

            {errorListado && (
                <Alert variant="danger" className="mb-3">{errorListado}</Alert>
            )}

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
                            <div className="col-lg-5 col-md-6">
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
                            <div className="col-lg-5 col-md-6">
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
                                    onClick={filtrarSalidas}
                                    size="sm"
                                    className="d-flex align-items-center justify-content-center w-100"
                                    disabled={!fechaInicio || !fechaFin}
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
                <Button variant="success" onClick={handleAgregarSalida} className="mb-3">
                    <Plus size={16} /> Nueva Salida
                </Button>
            </div>

            <div className="card shadow-sm border-0">
                <div className="card-header bg-white border-0 py-3">
                    <h5 className="mb-0 text-dark fw-semibold">
                        Lista de Salidas
                        {salidas.length > 0 && (
                            <span className="badge bg-primary ms-2">{salidas.length}</span>
                        )}
                    </h5>
                </div>
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <Table hover className="mb-0">
                            <thead className="table-light text-center">
                                <tr>
                                    <th className="fw-semibold py-3">ID</th>
                                    <th className="fw-semibold py-3">Fecha</th>
                                    <th className="fw-semibold py-3">Cliente</th>
                                    <th className="fw-semibold py-3">Tipo Venta</th>
                                    <th className="fw-semibold py-3">Total</th>
                                    <th className="fw-semibold py-3">Detalles</th>
                                    <th className="fw-semibold py-3" style={{ width: '120px' }}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {salidas?.map((salida) => (
                                    <tr key={salida.idSalida}>
                                        <td>{salida.idSalida}</td>
                                        <td>{salida.fechaSalida}</td>
                                        <td>
                                            {salida.nombreCliente ? (
                                                <div>
                                                    <strong>{salida.dniCliente}</strong>
                                                    <br />
                                                    <small>{salida.nombreCliente}</small>
                                                </div>
                                            ) : (
                                                <div>
                                                    <span className="text-muted">Sin cliente</span>
                                                    <br />
                                                    <Button
                                                        variant="outline-primary"
                                                        size="sm"
                                                        className="mt-1"
                                                        onClick={() => handleAsignarCliente(salida.idSalida)}
                                                    >
                                                        Asignar Cliente
                                                    </Button>
                                                </div>
                                            )}
                                        </td>
                                        <td>
                                            <Badge bg={salida.tipoVenta === 'CONTADO' ? 'success' : 'warning'}>
                                                {salida.tipoVenta || 'CONTADO'}
                                            </Badge>
                                        </td>
                                        <td>S/{salida.totalSalida?.toFixed(2)}</td>
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
                                                    {salida.detalles?.map((detalle, idx) => (
                                                        <tr key={idx}>
                                                            <td>{detalle.nombreProducto}</td>
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
                                                    onClick={() => handleEditar(salida)}
                                                    title="Ver/Editar salida"
                                                    className="btn-sm shadow-sm"
                                                    style={{ minWidth: '32px' }}
                                                >
                                                    <Edit size={12} />
                                                    <span className="d-none d-xl-inline ms-1">Ver/Editar</span>
                                                </Button>
                                                <Button
                                                    variant="outline-danger"
                                                    size="sm"
                                                    onClick={() => handleEliminacion(salida.idSalida)}
                                                    title="Eliminar salida"
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

            <AgregarSalida
                show={showAddModal}
                handleClose={handleCerrarModalAgregar}
                onSalidaAgregada={handleSalidaAgregada}
            />

            {salidaSeleccionada && (
                <EditarSalida
                    show={showEditModal}
                    handleClose={handleCerrarModalEditar}
                    salida={salidaSeleccionada}
                    onSalidaEditada={obtenerSalidas}
                />
            )}
        </div>
    );
}

export default ListarSalidas;


