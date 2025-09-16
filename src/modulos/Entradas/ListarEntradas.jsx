import { useEffect, useState } from "react";
import { Table, Button, Form, Card, Badge, Collapse, Alert, Spinner, Modal } from "react-bootstrap";
import AgregarEntrada from "./AgregarEntrada";
import EditarEntrada from "./EditarEntrada";
import { Plus, Search, X, Filter, Calendar, Building, ChevronDown, ChevronUp, Edit, Trash2, Upload, FileText, Eye } from "lucide-react";
import axios from "axios";

function ListarEntradas() {
    const [entradas, setEntradas] = useState([]);
    const [proveedores, setProveedores] = useState([]);
    const [idProveedor, setIdProveedor] = useState("");
    const [fechaInicio, setFechaInicio] = useState("");
    const [fechaFin, setFechaFin] = useState("");
    const [numeroFactura, setNumeroFactura] = useState("");
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [entradaSeleccionada, setEntradaSeleccionada] = useState(null);
    const [filtrosActivos, setFiltrosActivos] = useState(false);
    const [filtrosAbiertos, setFiltrosAbiertos] = useState(false);
    const [cargando, setCargando] = useState(false);
    const [errorListado, setErrorListado] = useState("");
    const [subiendoFactura, setSubiendoFactura] = useState(false);
    const [entradaFactura, setEntradaFactura] = useState(null);

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
            const params = new URLSearchParams();
            
            if (idProveedor) params.append('idProveedor', idProveedor);
            if (numeroFactura) params.append('numeroFactura', numeroFactura);
            if (fechaInicio) params.append('fechaInicio', fechaInicio);
            if (fechaFin) params.append('fechaFin', fechaFin);
            
            if (params.toString()) {
                url += `/filtrar?${params.toString()}`;
            }
            
            const response = await fetch(url);
            if (!response.ok) throw new Error();
            const data = await response.json();
            setEntradas(data);
            setFiltrosActivos(Boolean(idProveedor || numeroFactura || (fechaInicio && fechaFin)));
        } catch (error) {
            console.error("Error al filtrar entradas:", error);
            setErrorListado("No se pudo aplicar el filtro.");
        } finally {
            setCargando(false);
        }
    };

    const limpiarFiltros = () => {
        setIdProveedor("");
        setNumeroFactura("");
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

    // Funciones para manejar facturas
    const handleSubirFactura = (entrada) => {
        setEntradaFactura(entrada);
        setSubiendoFactura(true);
    };

    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // Validar tipo de archivo
        const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
        if (!validTypes.includes(file.type)) {
            alert('Solo se permiten archivos PDF o imágenes (JPG, PNG)');
            return;
        }

        // Validar tamaño (máximo 100MB)
        if (file.size > 100 * 1024 * 1024) {
            alert('El archivo no puede ser mayor a 100MB');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await axios.post(
                `http://localhost:8080/api/entradas/${entradaFactura.idEntrada}/factura`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );
            
            alert('Factura subida exitosamente');
            obtenerEntradas();
            setSubiendoFactura(false);
            setEntradaFactura(null);
        } catch (error) {
            console.error('Error al subir factura:', error);
            alert('Error al subir la factura');
        }
    };

    const handleVerFactura = (entrada) => {
        if (entrada.facturaUrl) {
            const url = `http://localhost:8080${entrada.facturaUrl}`;
            window.open(url, '_blank');
        } else {
            alert('Esta entrada no tiene factura asociada');
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
                        <div className="alert alert-info mb-3">
                            <small>
                                <strong>💡 Tip:</strong> Puedes combinar los filtros para búsquedas más específicas:
                                <br />• <strong>Proveedor + N° Factura:</strong> Entradas de ese proveedor con ese número
                                <br />• <strong>Proveedor + Fechas:</strong> Entradas de ese proveedor en ese rango
                                <br />• <strong>N° Factura + Fechas:</strong> Entradas con ese número en ese rango
                                <br />• <strong>Todos juntos:</strong> Máxima precisión en la búsqueda
                            </small>
                        </div>
                        <div className="row g-3">
                            <div className="col-lg-3 col-md-6">
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
                                        <FileText size={16} className="me-2" />
                                        N° Factura
                                    </Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={numeroFactura}
                                        onChange={e => setNumeroFactura(e.target.value)}
                                        placeholder="Ej: F001-00012345"
                                        size="sm"
                                    />
                                </Form.Group>
                            </div>
                            <div className="col-lg-2 col-md-6">
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
                            <div className="col-lg-2 col-md-6">
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
                                    disabled={(!idProveedor && !numeroFactura && !fechaInicio && !fechaFin) || cargando}
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
                                    <th className="fw-semibold py-3">N° Factura</th>
                                    <th className="fw-semibold py-3">Estado</th>
                                    <th className="fw-semibold py-3">Total</th>
                                    <th className="fw-semibold py-3">Factura</th>
                                    <th className="fw-semibold py-3">Detalles</th>
                                    <th className="fw-semibold py-3" style={{ width: '160px' }}>Acciones</th>
                                </tr>
                            </thead>
                <tbody>
                    {entradas?.map((entrada) => (
                        <tr key={entrada.idEntrada}>
                            <td>{entrada.idEntrada}</td>
                            <td>{entrada.proveedor?.nombre}</td>
                            <td>{entrada.fechaEntrada}</td>
                            <td>
                                <span className="fw-medium text-primary">
                                    {entrada.numeroFactura || 'Sin número'}
                                </span>
                            </td>
                            <td>
                                <Badge 
                                    bg={
                                        entrada.estado === 'Registrada' ? 'success' : 
                                        entrada.estado === 'Pendiente de pago' ? 'warning' : 
                                        'danger'
                                    }
                                    className="px-2 py-1"
                                >
                                    {entrada.estado || 'Registrada'}
                                </Badge>
                            </td>
                            <td>S/{entrada.totalEntrada?.toFixed(2)}</td>
                            <td>
                                <div className="d-flex justify-content-center gap-1">
                                    {entrada.facturaUrl ? (
                                        <Button
                                            variant="success"
                                            size="sm"
                                            onClick={() => handleVerFactura(entrada)}
                                            title="Ver factura"
                                            className="d-flex align-items-center"
                                        >
                                            <Eye size={14} className="me-1" />
                                            <span className="d-none d-md-inline">Ver</span>
                                        </Button>
                                    ) : (
                                        <Button
                                            variant="outline-primary"
                                            size="sm"
                                            onClick={() => handleSubirFactura(entrada)}
                                            title="Subir factura"
                                            className="d-flex align-items-center"
                                        >
                                            <Upload size={14} className="me-1" />
                                            <span className="d-none d-md-inline">Subir</span>
                                        </Button>
                                    )}
                                </div>
                            </td>
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

            {/* Modal para subir factura */}
            <Modal show={subiendoFactura} onHide={() => setSubiendoFactura(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Subir Factura</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p><strong>Entrada ID:</strong> {entradaFactura?.idEntrada}</p>
                    <p><strong>Proveedor:</strong> {entradaFactura?.proveedor?.nombre}</p>
                    <p><strong>Fecha:</strong> {entradaFactura?.fechaEntrada}</p>
                    <p><strong>N° Factura:</strong> {entradaFactura?.numeroFactura || 'Sin número'}</p>
                    <p><strong>Estado:</strong> 
                        <Badge 
                            bg={
                                entradaFactura?.estado === 'Registrada' ? 'success' : 
                                entradaFactura?.estado === 'Pendiente de pago' ? 'warning' : 
                                'danger'
                            }
                            className="ms-2"
                        >
                            {entradaFactura?.estado || 'Registrada'}
                        </Badge>
                    </p>
                    {entradaFactura?.observaciones && (
                        <p><strong>Observaciones:</strong> {entradaFactura.observaciones}</p>
                    )}
                    <hr />
                    <Form.Group>
                        <Form.Label>Seleccionar archivo (PDF o imagen)</Form.Label>
                        <Form.Control
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={handleFileChange}
                        />
                        <Form.Text className="text-muted">
                            Formatos permitidos: PDF, JPG, PNG. Tamaño máximo: 10MB
                        </Form.Text>
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setSubiendoFactura(false)}>
                        Cancelar
                    </Button>
                </Modal.Footer>
            </Modal>

        </div>
    );
}

export default ListarEntradas;
