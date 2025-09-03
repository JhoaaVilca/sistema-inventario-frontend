import { useEffect, useState } from "react";
import { Table, Button, Form, Card, Badge, Collapse, Alert } from "react-bootstrap";
import AgregarSalida from "./AgregarSalida";
import EditarSalida from "./EditarSalida";
import { Plus, Search, X, Filter, Calendar, ChevronDown, ChevronUp, Edit, Trash2 } from "lucide-react";

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
            const response = await fetch("http://localhost:8080/api/salidas");
            const data = await response.json();
            setSalidas(data);
        } catch (error) {
            console.error("Error al obtener salidas:", error);
            setErrorListado("No se pudo cargar el listado de salidas.");
        }
    };

    const filtrarSalidas = async () => {
        try {
            let url = `http://localhost:8080/api/salidas`;
            if (fechaInicio && fechaFin) {
                url += `/filtrar/rango?inicio=${fechaInicio}&fin=${fechaFin}`;
            }
            const response = await fetch(url);
            const data = await response.json();
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

    const handleSalidaAgregada = () => {
        obtenerSalidas();
        handleCerrarModalAgregar();
    };

    const handleEditar = (salida) => {
        setSalidaSeleccionada(salida);
        setShowEditModal(true);
    };

    const handleEliminacion = async (idSalida) => {
        if (!window.confirm("¿Seguro que quieres eliminar esta salida?")) return;

        try {
            await fetch(`http://localhost:8080/api/salidas/${idSalida}`, { method: "DELETE" });
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
            <h2 className="mb-4">Lista de Salidas</h2>

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
                            <div className="col-md-5">
                                <Form.Group>
                                    <Form.Label className="d-flex align-items-center">
                                        <Calendar size={16} className="me-2" />
                                        Fecha Inicio
                                    </Form.Label>
                                    <Form.Control
                                        type="date"
                                        value={fechaInicio}
                                        onChange={e => setFechaInicio(e.target.value)}
                                        className="form-control-lg"
                                    />
                                </Form.Group>
                            </div>
                            <div className="col-md-5">
                                <Form.Group>
                                    <Form.Label className="d-flex align-items-center">
                                        <Calendar size={16} className="me-2" />
                                        Fecha Fin
                                    </Form.Label>
                                    <Form.Control
                                        type="date"
                                        value={fechaFin}
                                        onChange={e => setFechaFin(e.target.value)}
                                        className="form-control-lg"
                                    />
                                </Form.Group>
                            </div>
                            <div className="col-md-2 d-flex align-items-end">
                                <Button
                                    variant="primary"
                                    onClick={filtrarSalidas}
                                    className="d-flex align-items-center justify-content-center w-100"
                                    disabled={!fechaInicio || !fechaFin}
                                >
                                    <Search size={16} className="me-2" />
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

            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Fecha</th>
                        <th>Cliente</th>
                        <th>Tipo Venta</th>
                        <th>Total</th>
                        <th>Detalles</th>
                        <th>Acciones</th>
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
                                <div className="d-flex justify-content-center gap-2">
                                    <button
                                        className="btn btn-sm btn-outline-success d-flex align-items-center gap-1"
                                        onClick={() => handleEditar(salida)}
                                        title="Ver/Editar salida"
                                    >
                                        <Edit size={16} />
                                        <span className="d-none d-md-inline">Ver/Editar</span>
                                    </button>
                                    <button
                                        className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1"
                                        onClick={() => handleEliminacion(salida.idSalida)}
                                        title="Eliminar salida"
                                    >
                                        <Trash2 size={16} />
                                        <span className="d-none d-md-inline">Eliminar</span>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>

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


