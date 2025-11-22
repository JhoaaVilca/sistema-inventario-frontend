import { useEffect, useState, useCallback } from "react";
import { Table, Button, Form, Card, Badge, Collapse, Alert, Spinner, Modal } from "react-bootstrap";
import AgregarEntrada from "./AgregarEntrada";
import EditarEntrada from "./EditarEntrada";
import DetalleEntrada from "./DetalleEntrada";
import { Plus, Search, X, Filter, Calendar, Building, ChevronDown, ChevronUp,  FileText } from "lucide-react";
import apiClient from "../../servicios/apiClient";
import Paginador from "../common/Paginador";

function ListarEntradas() {
    const [entradas, setEntradas] = useState([]);
    const [proveedores, setProveedores] = useState([]);
    const [idProveedor, setIdProveedor] = useState("");
    const [fechaInicio, setFechaInicio] = useState("");
    const [fechaFin, setFechaFin] = useState("");
    const [numeroFactura, setNumeroFactura] = useState("");
    const [showAddModal, setShowAddModal] = useState(false);
    const [filtrosActivos, setFiltrosActivos] = useState(false);
    const [filtrosAbiertos, setFiltrosAbiertos] = useState(false);
    const [cargando, setCargando] = useState(false);
    const [errorListado, setErrorListado] = useState("");
    const [subiendoFactura, setSubiendoFactura] = useState(false);
    const [entradaFactura, setEntradaFactura] = useState(null);
    const [showDetalleModal, setShowDetalleModal] = useState(false);
    const [entradaDetalle, setEntradaDetalle] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [page, setPage] = useState(0);
    const [size] = useState(10); // Tamaño normal
    const [totalPages, setTotalPages] = useState(0);

    const toggleEntrada = (entradaId) => {
        const entrada = entradas.find(e => e.idEntrada === entradaId);
        if (entrada) {
            setEntradaDetalle(entrada);
            setShowDetalleModal(true);
            setEditMode(false);
        }
    };

    const obtenerEntradas = useCallback(async () => {
        try {
            setErrorListado("");
            setCargando(true);
            const { data } = await apiClient.get("/entradas", { params: { page, size } });
            const lista = data?.content || [];
            setEntradas(lista);
            setTotalPages(data?.totalPages || 0);
            return lista;
        } catch (error) {
            console.error("Error al obtener entradas:", error);
            setErrorListado("No se pudo cargar el listado de entradas.");
            return [];
        } finally {
            setCargando(false);
        }
    }, [page, size]);

    const obtenerProveedores = async () => {
        try {
            const { data } = await apiClient.get("/proveedores/activos", { params: { page: 0, size: 1000 } });
            setProveedores(data?.content || []);
        } catch (error) {
            console.error("Error al obtener proveedores:", error);
        }
    };

    const filtrarEntradas = async () => {
        try {
            setErrorListado("");
            setCargando(true);
            let url = `/entradas`;
            const params = new URLSearchParams();

            if (idProveedor) params.append('idProveedor', idProveedor);
            if (numeroFactura) params.append('numeroFactura', numeroFactura);
            if (fechaInicio) params.append('fechaInicio', fechaInicio);
            if (fechaFin) params.append('fechaFin', fechaFin);

            if (params.toString()) {
                url += `/filtrar?${params.toString()}`;
            }

            const { data } = await apiClient.get(url, { params: { page, size } });
            // Soporta tanto respuesta paginada como arreglo simple
            const esArray = Array.isArray(data);
            setEntradas(esArray ? data : (data?.content || []));
            setTotalPages(esArray ? 1 : (data?.totalPages || 0));
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
    }, [obtenerEntradas]);

    const handleAgregarEntrada = () => setShowAddModal(true);
    const handleCerrarModalAgregar = () => setShowAddModal(false);
    // Sin modal de edición clásico

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleEntradaAgregada = () => {
        obtenerEntradas();
        handleCerrarModalAgregar();
        scrollToTop();
    };

    // Edición inline: se maneja con editMode en el modal de detalle

    const handleEliminacion = async (idEntrada) => {
        if (!window.confirm("¿Seguro que quieres eliminar esta entrada?")) return;

        try {
            await apiClient.delete(`/entradas/${idEntrada}`);
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
            const metodo = entradaFactura?.facturaUrl ? 'put' : 'post';
            await apiClient[metodo](
                `/entradas/${entradaFactura.idEntrada}/factura`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );

            alert('Factura subida exitosamente');
            const nuevas = await obtenerEntradas();
            // Si el modal de detalle está abierto y corresponde a la entrada actual, refrescar su estado
            if (showDetalleModal && entradaDetalle && entradaDetalle.idEntrada === entradaFactura.idEntrada) {
                const actualizada = (nuevas || []).find(e => e.idEntrada === entradaFactura.idEntrada);
                if (actualizada) setEntradaDetalle(actualizada);
            }
            setSubiendoFactura(false);
            setEntradaFactura(null);
        } catch (error) {
            console.error('Error al subir factura:', error);
            alert('Error al subir la factura');
        }
    };

    const handleVerFactura = async (entrada) => {
        if (!entrada.facturaUrl) {
            alert('Esta entrada no tiene factura asociada');
            return;
        }
        try {
            const absoluteUrl = resolverFacturaUrl(entrada);
            // Usamos XHR para enviar credenciales/headers y evitar 401
            const response = await apiClient.get(absoluteUrl, { responseType: 'blob' });
            const disposition = response.headers['content-disposition'] || '';
            let filename = 'factura';
            const match = /filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/i.exec(disposition);
            if (match) {
                filename = decodeURIComponent(match[1] || match[2] || filename);
            }
            const blob = new Blob([response.data], { type: response.headers['content-type'] || 'application/octet-stream' });
            const url = URL.createObjectURL(blob);
            // Intentar abrir inline en nueva pestaña
            const win = window.open(url, '_blank');
            if (!win) {
                // Si el navegador bloquea popups, forzar descarga con nombre correcto
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                a.remove();
            }
            // Liberar URL más tarde
            setTimeout(() => URL.revokeObjectURL(url), 60_000);
        } catch (error) {
            console.error('Error al abrir factura:', error);
            alert('No se pudo abrir la factura. Verifique su sesión e intente nuevamente.');
        }
    };

    // Resuelve la URL absoluta para factura (para preview e "abrir")
    const resolverFacturaUrl = (entrada) => {
        const apiBase = apiClient.defaults.baseURL || '';
        const backendRoot = apiBase.replace(/\/api\/?$/, '');
        // Si la URL almacenada es de Azure (pública), usar SIEMPRE el proxy del backend
        if (entrada?.facturaUrl && /\.blob\.core\.windows\.net/i.test(entrada.facturaUrl)) {
            return `${backendRoot}/api/entradas/${entrada.idEntrada}/factura`;
        }
        // Si ya es absoluta y no es Azure, devolver tal cual
        if (/^https?:\/\//i.test(entrada.facturaUrl)) return entrada.facturaUrl;
        return `${backendRoot}${entrada.facturaUrl}`;
    };

    return (
        <div className="mt-4">
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
                <div className="container-fluid p-0">
                    <div className="d-flex align-items-center gap-3 mb-4 p-3 bg-white rounded-3 shadow-sm border">
                        <div className="p-2 bg-primary bg-opacity-10 rounded-3">
                            <Building size={24} className="text-primary" />
                        </div>
                        <div>
                            <h5 className="mb-0 text-dark fw-bold">
                                Lista de Entradas
                                {entradas.length > 0 && (
                                    <span className="badge bg-primary ms-2">{entradas.length}</span>
                                )}
                            </h5>
                            <small className="text-muted">Gestiona las entradas de inventario</small>
                        </div>
                    </div>

                    <div className="row">
                        {entradas?.map((entrada) => (
                            <div key={entrada.idEntrada} className="col-12 mb-3">
                                <DetalleEntrada
                                    entrada={entrada}
                                    isOpen={false}
                                    onToggle={() => toggleEntrada(entrada.idEntrada)}
                                    onVerFactura={handleVerFactura}
                                    onSubirFactura={handleSubirFactura}
                                    resolverFacturaUrl={resolverFacturaUrl}
                                />
                            </div>
                        ))}
                    </div>

                    <div className="d-flex justify-content-center mt-4">
                        <Paginador page={page} totalPages={totalPages} onChange={setPage} disabled={cargando} />
                    </div>
                </div>
            )}

            {/* Modal Agregar */}
            <AgregarEntrada
                show={showAddModal}
                handleClose={handleCerrarModalAgregar}
                onEntradaAgregada={handleEntradaAgregada}
            />

            {/* Modal de edición clásico eliminado en favor de edición inline */}

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
                        {entradaFactura?.facturaUrl && (
                            <Form.Text className="text-warning d-block mb-2">
                                Subir un nuevo archivo reemplazará la factura actual.
                            </Form.Text>
                        )}
                        <Form.Control
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={handleFileChange}
                        />
                        <Form.Text className="text-muted">
                            Formatos permitidos: PDF, JPG, PNG. Tamaño máximo: 100MB
                        </Form.Text>
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setSubiendoFactura(false)}>
                        Cancelar
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Modal Detalle Entrada */}
            <Modal show={showDetalleModal} onHide={() => { setShowDetalleModal(false); setEntradaDetalle(null); setEditMode(false); }} size="lg" centered>
                <Modal.Header closeButton>
                    <Modal.Title>
                        Detalle de Entrada {entradaDetalle ? `#${entradaDetalle.idEntrada}` : ''}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {entradaDetalle && (
                        editMode ? (
                            <EditarEntrada
                                show={false}
                                handleClose={() => setEditMode(false)}
                                entrada={entradaDetalle}
                                onEntradaEditada={() => { obtenerEntradas(); setEditMode(false); }}
                                inlineMode={true}
                            />
                        ) : (
                            <DetalleEntrada
                                entrada={entradaDetalle}
                                isOpen={true}
                                onToggle={() => { }}
                                onVerFactura={handleVerFactura}
                                onSubirFactura={handleSubirFactura}
                                resolverFacturaUrl={resolverFacturaUrl}
                                ocultarHeader={true}
                            />
                        )
                    )}
                </Modal.Body>
                {!editMode && (
                    <Modal.Footer>
                        <div className="d-flex justify-content-between w-100">
                            <div>
                                <Button variant="outline-secondary" onClick={() => { setShowDetalleModal(false); setEntradaDetalle(null); }}>Cerrar</Button>
                            </div>
                            <div className="d-flex gap-2">
                                {entradaDetalle && (
                                    <>
                                        <Button variant="outline-primary" onClick={() => setEditMode(true)}>Editar</Button>
                                        <Button variant="outline-danger" onClick={() => { setShowDetalleModal(false); handleEliminacion(entradaDetalle.idEntrada); }}>Eliminar</Button>
                                    </>
                                )}
                            </div>
                        </div>
                    </Modal.Footer>
                )}
            </Modal>

        </div>
    );
}

export default ListarEntradas;
