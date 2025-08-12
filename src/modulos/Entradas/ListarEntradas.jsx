import { useEffect, useState } from "react";
import { Table, Button, Form, Card, Badge, Collapse } from "react-bootstrap";
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

    const obtenerEntradas = async () => {
        try {
            const response = await fetch("http://localhost:8080/api/entradas");
            const data = await response.json();
            setEntradas(data);
        } catch (error) {
            console.error("Error al obtener entradas:", error);
        }
    };

    const obtenerProveedores = async () => {
        try {
            const response = await fetch("http://localhost:8080/api/proveedores");
            const data = await response.json();
            setProveedores(data);
        } catch (error) {
            console.error("Error al obtener proveedores:", error);
        }
    };

    const filtrarEntradas = async () => {
        try {
            let url = `http://localhost:8080/api/entradas`;
            if (idProveedor && fechaInicio && fechaFin) {
                url += `/filtrar?idProveedor=${idProveedor}&fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`;
            }
            const response = await fetch(url);
            const data = await response.json();
            setEntradas(data);
            setFiltrosActivos(true);
        } catch (error) {
            console.error("Error al filtrar entradas:", error);
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

    const handleEntradaAgregada = () => {
        obtenerEntradas();
        handleCerrarModalAgregar();
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
            <h2 className="mb-4">Lista de Entradas</h2>

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
                            <div className="col-md-4">
                                <Form.Group>
                                    <Form.Label className="d-flex align-items-center">
                                        <Building size={16} className="me-2" />
                                        Proveedor
                                    </Form.Label>
                                    <Form.Select
                                        value={idProveedor}
                                        onChange={e => setIdProveedor(e.target.value)}
                                        className="form-select-lg"
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
                            <div className="col-md-3">
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
                            <div className="col-md-3">
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
                                    onClick={filtrarEntradas}
                                    className="d-flex align-items-center justify-content-center w-100"
                                    disabled={!idProveedor || !fechaInicio || !fechaFin}
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
                <Button variant="success" onClick={handleAgregarEntrada} className="mb-3">
                    <Plus size={16} /> Agregar Entrada
                </Button>
            </div>

            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Proveedor</th>
                        <th>Fecha</th>
                        <th>Total</th>
                        <th>Detalles</th>
                        <th>Acciones</th>
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
                                <div className="d-flex justify-content-center gap-2">
                                    <button
                                        className="btn btn-sm btn-outline-success d-flex align-items-center gap-1"
                                        onClick={() => handleEditar(entrada)}
                                        title="Editar entrada"
                                    >
                                        <Edit size={16} />
                                        <span className="d-none d-md-inline">Editar</span>
                                    </button>

                                    <button
                                        className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1"
                                        onClick={() => handleEliminacion(entrada.idEntrada)}
                                        title="Eliminar entrada"
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
