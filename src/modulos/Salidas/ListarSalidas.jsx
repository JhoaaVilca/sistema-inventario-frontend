import { useEffect, useState } from "react";
import { Table, Button, Form, Card, Badge, Collapse, Alert, Modal, Spinner } from "react-bootstrap";
import AgregarSalida from "./AgregarSalida";
import EditarSalida from "./EditarSalida";
import DetalleSalida from "./DetalleSalida";
import { Plus, Search, X, Filter, Calendar, ChevronDown, ChevronUp, Edit, Trash2, ShoppingCart, Banknote, AlertCircle, CheckCircle } from "lucide-react";
import apiClient from "../../servicios/apiClient";
import cajaService from "../../servicios/cajaService";
import Paginador from "../common/Paginador";

function ListarSalidas() {
    const [salidas, setSalidas] = useState([]);
    const [fechaInicio, setFechaInicio] = useState("");
    const [fechaFin, setFechaFin] = useState("");
    const [showAddModal, setShowAddModal] = useState(false);
    // Eliminamos el modal clásico; ahora usaremos edición inline dentro del detalle
    const [salidaExpandida, setSalidaExpandida] = useState(null);
    const [showDetalleModal, setShowDetalleModal] = useState(false);
    const [salidaDetalle, setSalidaDetalle] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [filtrosActivos, setFiltrosActivos] = useState(false);
    const [filtrosAbiertos, setFiltrosAbiertos] = useState(false);
    const [errorListado, setErrorListado] = useState("");
    const [page, setPage] = useState(0);
    const [size, setSize] = useState(10); // Tamaño normal
    const [totalPages, setTotalPages] = useState(0);
    const [cargando, setCargando] = useState(false);
    const [showTicketModal, setShowTicketModal] = useState(false);
    const [ticketSalidaId, setTicketSalidaId] = useState(null);
    const [ticketPdfUrl, setTicketPdfUrl] = useState("");
    const [cargandoTicket, setCargandoTicket] = useState(false);
    const [estadoCaja, setEstadoCaja] = useState(null);
    const [cargandoCaja, setCargandoCaja] = useState(false);
    const [mensajeCaja, setMensajeCaja] = useState("");

    useEffect(() => {
        const loadPdf = async () => {
            if (!showTicketModal || !ticketSalidaId) return;
            setCargandoTicket(true);
            try {
                const resp = await apiClient.get(`/salidas/${ticketSalidaId}/ticket-pdf`, { responseType: 'blob' });
                const blob = new Blob([resp.data], { type: 'application/pdf' });
                const url = URL.createObjectURL(blob);
                setTicketPdfUrl(url);
            } catch (e) {
                console.error('No se pudo cargar el ticket PDF', e);
            } finally {
                setCargandoTicket(false);
            }
        };
        loadPdf();
        return () => {
            if (ticketPdfUrl) {
                URL.revokeObjectURL(ticketPdfUrl);
                setTicketPdfUrl("");
            }
        };
    }, [showTicketModal, ticketSalidaId]);

    const toggleSalida = async (salidaId) => {
        try {
            setEditMode(false);
            setShowDetalleModal(true);
            // Intentar obtener el detalle completo (incluye cliente)
            const { data } = await apiClient.get(`/salidas/${salidaId}`);
            setSalidaDetalle(data || null);
        } catch (e) {
            // Si falla, usa el item de la lista como fallback
            const s = salidas.find(x => x.idSalida === salidaId) || null;
            setSalidaDetalle(s);
            console.error('No se pudo cargar el detalle de la salida, usando datos del listado:', e);
        }
    };

    const obtenerSalidas = async () => {
        try {
            setCargando(true);
            setErrorListado("");
            const { data } = await apiClient.get("/salidas", { params: { page, size } });
            setSalidas(data?.content || []);
            setTotalPages(data?.totalPages || 0);
        } catch (error) {
            console.error("Error al obtener salidas:", error);
            setErrorListado("No se pudo cargar el listado de salidas.");
        } finally {
            setCargando(false);
        }
    };

    const cargarEstadoCaja = async () => {
        setCargandoCaja(true);
        try {
            const response = await cajaService.obtenerEstado();
            setEstadoCaja(response);
        } catch (error) {
            console.error('Error al cargar estado de caja:', error);
        } finally {
            setCargandoCaja(false);
        }
    };

    const filtrarSalidas = async () => {
        try {
            setCargando(true);
            let url = `/salidas`;
            if (fechaInicio && fechaFin) {
                url += `/filtrar/rango?inicio=${fechaInicio}&fin=${fechaFin}`;
            }
            const { data } = await apiClient.get(url, { params: { page, size } });
            const esArray = Array.isArray(data);
            setSalidas(esArray ? data : (data?.content || []));
            setTotalPages(esArray ? 1 : (data?.totalPages || 0));
            setFiltrosActivos(Boolean(fechaInicio && fechaFin));
        } catch (error) {
            console.error("Error al filtrar salidas:", error);
        } finally {
            setCargando(false);
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
        cargarEstadoCaja();
    }, [page, size]);

    const handleAgregarSalida = () => {
        if (!estadoCaja?.existeCaja) {
            setMensajeCaja('No hay una caja abierta. Debe abrir una caja del día antes de registrar ventas o salidas.');
            return;
        }
        setShowAddModal(true);
    };
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

    // Edición inline se maneja con editMode

    const handleCancelar = async (idSalida) => {
        if (!window.confirm("¿Seguro que quieres cancelar esta salida? Esto revertirá el stock.")) return;

        try {
            await apiClient.put(`/salidas/${idSalida}/cancelar`);
            await obtenerSalidas();
        } catch (error) {
            console.error("Error al cancelar salida:", error);
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
        <div className="mt-4">
            <div className="d-flex align-items-center gap-3 mb-4 p-3 bg-white rounded-3 shadow-sm border">
                <div className="p-2 bg-danger bg-opacity-10 rounded-3">
                    <Calendar size={24} className="text-danger" />
                </div>
                <div>
                    <h3 className="mb-0 text-dark fw-bold">Gestión de Salidas</h3>
                    <small className="text-muted">Administra las salidas de productos del inventario</small>
                </div>
                {cargando && <Spinner animation="border" size="sm" />}
            </div>

            {/* Estado de Caja */}
            {estadoCaja && (
                <Card className="mb-4 shadow-sm border-0" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                    <Card.Body className="text-white">
                        <div className="d-flex align-items-center justify-content-between">
                            <div className="d-flex align-items-center">
                                <div className="p-2 bg-white bg-opacity-20 rounded-3 me-3">
                                    <Banknote size={24} className="text-white" />
                                </div>
                                <div>
                                    <h5 className="mb-1 fw-bold">
                                        {estadoCaja.existeCaja ? 'Caja Abierta' : 'Caja Cerrada'}
                                    </h5>
                                    <small className="opacity-75">
                                        {estadoCaja.existeCaja ?
                                            `Saldo actual: ${new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(estadoCaja.caja.saldoActual)}` :
                                            'No hay caja abierta para el día de hoy'
                                        }
                                    </small>
                                </div>
                            </div>
                            <div className="d-flex align-items-center">
                                {estadoCaja.existeCaja ? (
                                    <>
                                        <Badge bg="success" className="me-2">
                                            <CheckCircle size={14} className="me-1" />
                                            Abierta
                                        </Badge>
                                        <Button
                                            variant="outline-light"
                                            size="sm"
                                            onClick={() => window.location.href = '/salidas/caja'}
                                        >
                                            <Banknote size={16} className="me-1" />
                                            Ver Caja
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        <Badge bg="secondary" className="me-2">
                                            <AlertCircle size={14} className="me-1" />
                                            Cerrada
                                        </Badge>
                                        <Button
                                            variant="outline-light"
                                            size="sm"
                                            onClick={() => window.location.href = '/salidas/caja'}
                                        >
                                            <Banknote size={16} className="me-1" />
                                            Abrir Caja
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>
                    </Card.Body>
                </Card>
            )}

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

            {mensajeCaja && (
                <Alert variant="warning" dismissible onClose={() => setMensajeCaja("")} className="mb-2">
                    <strong>Atención:</strong> {mensajeCaja}
                </Alert>
            )}

            <div className="d-flex justify-content-end align-items-center gap-2 mb-3">
                <Button variant="success" onClick={handleAgregarSalida} className="mb-3" disabled={!estadoCaja?.existeCaja} title={!estadoCaja?.existeCaja ? 'Abra la caja del día para registrar una salida' : ''}>
                    <Plus size={16} /> Nueva Salida
                </Button>
            </div>

            <div className="container-fluid p-0">
                <div className="d-flex align-items-center gap-3 mb-4 p-3 bg-white rounded-3 shadow-sm border">
                    <div className="p-2 bg-primary bg-opacity-10 rounded-3">
                        <ShoppingCart size={24} className="text-primary" />
                    </div>
                    <div>
                        <h5 className="mb-0 text-dark fw-bold">
                            Lista de Salidas
                            {salidas.length > 0 && (
                                <span className="badge bg-primary ms-2">{salidas.length}</span>
                            )}
                        </h5>
                        <small className="text-muted">Gestiona las salidas de inventario</small>
                    </div>
                </div>

                <div className="row">
                    {salidas?.map((salida) => (
                        <div key={salida.idSalida} className="col-12 mb-3">
                            <DetalleSalida
                                salida={salida}
                                isOpen={salidaExpandida === salida.idSalida}
                                onToggle={() => toggleSalida(salida.idSalida)}
                            />
                        </div>
                    ))}
                </div>

                <div className="d-flex justify-content-center mt-4">
                    <Paginador page={page} totalPages={totalPages} onChange={setPage} disabled={false} />
                </div>
            </div>

            <AgregarSalida
                show={showAddModal}
                handleClose={handleCerrarModalAgregar}
                onSalidaAgregada={handleSalidaAgregada}
            />

            {/* Modal Detalle Salida con edición inline */}
            <Modal show={showDetalleModal} onHide={() => { setShowDetalleModal(false); setSalidaDetalle(null); setEditMode(false); }} size="lg" centered>
                <Modal.Header closeButton>
                    <Modal.Title>Detalle de Salida {salidaDetalle ? `#${salidaDetalle.idSalida}` : ''}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {salidaDetalle && (
                        editMode ? (
                            <EditarSalida
                                show={false}
                                handleClose={() => setEditMode(false)}
                                salida={salidaDetalle}
                                onSalidaEditada={() => { obtenerSalidas(); setEditMode(false); }}
                                inlineMode={true}
                            />
                        ) : (
                            <DetalleSalida
                                salida={salidaDetalle}
                                isOpen={true}
                                onToggle={() => { }}
                                ocultarHeader={true}
                            />
                        )
                    )}
                </Modal.Body>
                {!editMode && (
                    <Modal.Footer>
                        <div className="d-flex justify-content-between w-100">
                            <div>
                                <Button variant="outline-secondary" onClick={() => { setShowDetalleModal(false); setSalidaDetalle(null); }}>Cerrar</Button>
                            </div>
                            <div className="d-flex gap-2">
                                {salidaDetalle && (
                                    <>
                                        <Button
                                            variant="outline-success"
                                            onClick={() => {
                                                setTicketSalidaId(salidaDetalle.idSalida);
                                                setShowTicketModal(true);
                                            }}
                                        >
                                            Imprimir Ticket
                                        </Button>
                                        {salidaDetalle.estado !== 'Cancelado' && (
                                            <Button variant="outline-primary" onClick={() => setEditMode(true)}>Editar</Button>
                                        )}
                                        <Button variant="outline-danger" onClick={() => { setShowDetalleModal(false); handleCancelar(salidaDetalle.idSalida); }}>Cancelar</Button>
                                    </>
                                )}
                            </div>
                        </div>
                    </Modal.Footer>
                )}
            </Modal>

            {/* Modal Ticket 80mm - Vista previa PDF con toolbar */}
            <Modal show={showTicketModal} onHide={() => setShowTicketModal(false)} size="lg" centered>
                <Modal.Header closeButton>
                    <Modal.Title>Ticket</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {cargandoTicket && (
                        <div className="text-center py-4"><Spinner animation="border" size="sm" /> Cargando ticket...</div>
                    )}
                    {!cargandoTicket && ticketPdfUrl && (
                        <iframe
                            title="ticket-pdf"
                            src={`${ticketPdfUrl}#zoom=page-width`}
                            style={{ width: '100%', height: '70vh', border: 'none' }}
                        />
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowTicketModal(false)}>Cerrar</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}

export default ListarSalidas;


