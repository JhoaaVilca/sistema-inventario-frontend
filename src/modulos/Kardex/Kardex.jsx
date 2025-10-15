import { useState, useEffect, useCallback } from 'react';
import { Table, Button, Form, Card, InputGroup, FormControl, Alert, Spinner, Modal, Badge, Col } from 'react-bootstrap';
import { FileText, Search, X, Download, Plus, Filter, Calendar, Package } from 'lucide-react';
import apiClient from '../../servicios/apiClient';
import Paginador from '../common/Paginador';
import Select from 'react-select'; // Para el buscador de productos

const Kardex = () => {
    const [movimientos, setMovimientos] = useState([]);
    const [productos, setProductos] = useState([]); // Para el select de productos
    const [productoSeleccionado, setProductoSeleccionado] = useState(null);
    const [fechaInicio, setFechaInicio] = useState("");
    const [fechaFin, setFechaFin] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [page, setPage] = useState(0);
    const [size] = useState(10);
    const [totalPages, setTotalPages] = useState(0);
    const [showAjusteModal, setShowAjusteModal] = useState(false);
    const [ajusteData, setAjusteData] = useState({
        idProducto: '',
        tipoMovimiento: 'ENTRADA',
        cantidad: '',
        precioUnitario: '',
        observaciones: '',
        usuarioRegistro: localStorage.getItem('username') || 'admin' // Asume el usuario logueado
    });
    const [ajusteErrors, setAjusteErrors] = useState({});

    const cargarMovimientos = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const params = { page, size };
            if (productoSeleccionado) params.idProducto = productoSeleccionado.value;
            if (fechaInicio) params.fechaInicio = fechaInicio;
            if (fechaFin) params.fechaFin = fechaFin;
            console.log("[Kardex] GET /kardex params=", params);
            const { data } = await apiClient.get("/kardex", { params });
            console.log("[Kardex] respuesta movimientos=", data);
            setMovimientos(data?.content || []);
            setTotalPages(data?.totalPages || 0);
        } catch (err) {
            console.error("[Kardex] Error al cargar movimientos:", err?.response || err);
            if (err?.response) {
                console.error("[Kardex] status=", err.response.status, "data=", err.response.data);
            }
            setError("Error al cargar los movimientos de Kardex. Intente nuevamente.");
        } finally {
            setLoading(false);
        }
    }, [page, size, productoSeleccionado, fechaInicio, fechaFin]);

    // Cargar productos solo una vez al montar (evita sobrecarga en cada paginación)
    useEffect(() => {
        cargarProductos();
    }, []);

    // Cargar movimientos cuando cambia la paginación
    useEffect(() => {
        cargarMovimientos();
    }, [cargarMovimientos]);

    // (Declarado arriba con useCallback)

    const cargarProductos = async () => {
        try {
            const params = { page: 0, size: 1000 };
            console.log("[Kardex] GET /productos params=", params);
            const { data } = await apiClient.get("/productos", { params });
            console.log("[Kardex] respuesta productos=", data);
            const options = data?.content?.map(p => ({
                value: p.idProducto,
                label: p.nombreProducto,
                precioCompra: p.precioCompra // Para prellenar el precio unitario en ajustes
            })) || [];
            setProductos(options);
        } catch (err) {
            console.error("[Kardex] Error al cargar productos:", err?.response || err);
        }
    };

    const handleFiltrar = () => {
        // Validaciones de fechas
        if ((fechaInicio && !fechaFin) || (!fechaInicio && fechaFin)) {
            setError("Debe seleccionar ambas fechas: inicio y fin.");
            return;
        }
        if (fechaInicio && fechaFin) {
            const inicio = new Date(fechaInicio + 'T00:00:00');
            const fin = new Date(fechaFin + 'T23:59:59');
            if (Number.isNaN(inicio.getTime()) || Number.isNaN(fin.getTime())) {
                setError("Formato de fecha inválido. Use YYYY-MM-DD.");
                return;
            }
            if (inicio > fin) {
                setError("La fecha inicio no puede ser mayor que la fecha fin.");
                return;
            }
        }
        setPage(0); // Resetear a la primera página al aplicar filtros
        cargarMovimientos();
    };

    const handleLimpiarFiltros = () => {
        setProductoSeleccionado(null);
        setFechaInicio("");
        setFechaFin("");
        setPage(0);
        cargarMovimientos();
    };

    const handleExportarPdf = async () => {
        try {
            const params = {};
            if (productoSeleccionado) params.idProducto = productoSeleccionado.value;
            if (fechaInicio) params.fechaInicio = fechaInicio;
            if (fechaFin) params.fechaFin = fechaFin;
            console.log("[Kardex] GET /kardex/exportar-pdf params=", params);
            const response = await apiClient.get("/kardex/exportar-pdf", {
                params,
                responseType: 'blob' // Importante para recibir el archivo binario
            });
            console.log("[Kardex] respuesta PDF status=", response.status);

            const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `kardex_reporte_${new Date().toISOString().slice(0, 10)}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error("[Kardex] Error al exportar PDF:", err?.response || err);
            setError("Error al generar el PDF del Kardex.");
        }
    };

    const handleAjusteChange = (e) => {
        const { name, value } = e.target;
        setAjusteData(prev => ({ ...prev, [name]: value }));
        setAjusteErrors(prev => ({ ...prev, [name]: '' })); // Limpiar error al cambiar
    };

    const handleProductoSelectChange = (selectedOption) => {
        setProductoSeleccionado(selectedOption);
        setAjusteData(prev => ({
            ...prev,
            idProducto: selectedOption ? selectedOption.value : '',
            precioUnitario: selectedOption ? selectedOption.precioCompra : '' // Prellenar precio de compra
        }));
        setAjusteErrors(prev => ({ ...prev, idProducto: '' }));
    };

    const handleGuardarAjuste = async () => {
        try {
            setLoading(true);
            setError("");
            setAjusteErrors({}); // Limpiar errores anteriores

            // Validaciones básicas
            const errors = {};
            if (!ajusteData.idProducto) errors.idProducto = "Debe seleccionar un producto.";
            if (!ajusteData.cantidad || ajusteData.cantidad <= 0) errors.cantidad = "La cantidad debe ser mayor a 0.";
            if (ajusteData.tipoMovimiento === 'ENTRADA' && (!ajusteData.precioUnitario || ajusteData.precioUnitario <= 0)) {
                errors.precioUnitario = "El precio unitario debe ser mayor a 0 para entradas.";
            }
            if (Object.keys(errors).length > 0) {
                setAjusteErrors(errors);
                setLoading(false);
                return;
            }

            console.log("[Kardex] POST /kardex/ajuste body=", ajusteData);
            await apiClient.post("/kardex/ajuste", ajusteData);
            setShowAjusteModal(false);
            setAjusteData({
                idProducto: '',
                tipoMovimiento: 'ENTRADA',
                cantidad: '',
                precioUnitario: '',
                observaciones: '',
                usuarioRegistro: localStorage.getItem('username') || 'admin'
            });
            cargarMovimientos();
        } catch (err) {
            console.error("[Kardex] Error al guardar ajuste:", err?.response || err);
            setError("Error al guardar el ajuste de Kardex.");
            if (err.response && err.response.data) {
                // Asumiendo que el backend devuelve errores de validación
                const backendErrors = err.response.data;
                const newErrors = {};
                if (backendErrors.errors) { // Spring Boot @Valid errors
                    backendErrors.errors.forEach(e => {
                        newErrors[e.field] = e.defaultMessage;
                    });
                } else if (backendErrors.error) { // Custom error message
                    setError(backendErrors.error);
                }
                setAjusteErrors(newErrors);
            }
        } finally {
            setLoading(false);
        }
    };

    const formatDateTime = (dateTimeString) => {
        if (!dateTimeString) return 'N/A';
        const date = new Date(dateTimeString);
        return date.toLocaleString('es-ES', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="mt-4">
            <div className="d-flex align-items-center gap-3 mb-4 p-3 bg-white rounded-3 shadow-sm border">
                <div className="p-2 bg-info bg-opacity-10 rounded-3">
                    <FileText size={24} className="text-info" />
                </div>
                <div>
                    <h3 className="mb-0 text-dark fw-bold">Módulo Kardex</h3>
                    <small className="text-muted">Historial de movimientos de inventario por producto</small>
                </div>
            </div>

            {error && <Alert variant="danger">{error}</Alert>}

            <Card className="mb-4 shadow-sm">
                <Card.Header className="bg-light">
                    <h6 className="mb-0 d-flex align-items-center">
                        <Filter size={18} className="me-2" /> Filtros de Búsqueda
                    </h6>
                </Card.Header>
                <Card.Body>
                    <Form className="row g-3">
                        <Form.Group as={Col} md="4">
                            <Form.Label>Producto</Form.Label>
                            <Select
                                options={productos}
                                value={productoSeleccionado}
                                onChange={handleProductoSelectChange}
                                placeholder="Seleccione un producto"
                                isClearable
                                isSearchable
                            />
                        </Form.Group>
                        <Form.Group as={Col} md="3">
                            <Form.Label>Fecha Inicio</Form.Label>
                            <Form.Control
                                type="date"
                                value={fechaInicio}
                                onChange={(e) => setFechaInicio(e.target.value)}
                            />
                        </Form.Group>
                        <Form.Group as={Col} md="3">
                            <Form.Label>Fecha Fin</Form.Label>
                            <Form.Control
                                type="date"
                                value={fechaFin}
                                onChange={(e) => setFechaFin(e.target.value)}
                            />
                        </Form.Group>
                        <Col md="2" className="d-flex align-items-end gap-2">
                            <Button variant="primary" onClick={handleFiltrar} className="w-100">
                                <Search size={16} /> Buscar
                            </Button>
                            <Button variant="outline-secondary" onClick={handleLimpiarFiltros} className="w-100">
                                <X size={16} /> Limpiar
                            </Button>
                        </Col>
                    </Form>
                </Card.Body>
            </Card>

            <div className="d-flex justify-content-end gap-2 mb-3">
                <Button variant="info" onClick={() => setShowAjusteModal(true)}>
                    <Plus size={16} /> Ajuste Manual
                </Button>
                <Button variant="danger" onClick={handleExportarPdf}>
                    <Download size={16} /> Exportar PDF
                </Button>
            </div>

            <Card className="shadow-sm">
                <Card.Header className="bg-white py-3">
                    <h5 className="mb-0 text-dark fw-semibold">
                        Movimientos de Kardex
                        {movimientos.length > 0 && (
                            <span className="badge bg-primary ms-2">{movimientos.length}</span>
                        )}
                    </h5>
                </Card.Header>
                <Card.Body className="p-0">
                    <div className="table-responsive">
                        <Table hover className="mb-0">
                            <thead className="table-light text-center">
                                <tr>
                                    <th className="fw-semibold py-3">Fecha</th>
                                    <th className="fw-semibold py-3">Producto</th>
                                    <th className="fw-semibold py-3">Tipo</th>
                                    <th className="fw-semibold py-3">Cantidad</th>
                                    <th className="fw-semibold py-3">P. Unit.</th>
                                    <th className="fw-semibold py-3">V. Total</th>
                                    <th className="fw-semibold py-3">Stock Ant.</th>
                                    <th className="fw-semibold py-3">Stock Act.</th>
                                    <th className="fw-semibold py-3">Costo Prom. Ant.</th>
                                    <th className="fw-semibold py-3">Costo Prom. Act.</th>
                                    <th className="fw-semibold py-3">Referencia</th>
                                    <th className="fw-semibold py-3">Usuario</th>
                                    <th className="fw-semibold py-3">Observaciones</th>
                                </tr>
                            </thead>
                            <tbody className="text-center align-middle">
                                {loading ? (
                                    <tr>
                                        <td colSpan="13" className="text-center py-4">
                                            <Spinner animation="border" size="sm" /> Cargando...
                                        </td>
                                    </tr>
                                ) : movimientos.length === 0 ? (
                                    <tr>
                                        <td colSpan="13" className="text-center py-4 text-muted">
                                            {productoSeleccionado || (fechaInicio && fechaFin)
                                                ? 'No se encontraron movimientos para los filtros seleccionados.'
                                                : 'No hay movimientos de Kardex para mostrar.'}
                                        </td>
                                    </tr>
                                ) : (
                                    movimientos.map((mov) => (
                                        <tr key={mov.idKardex}>
                                            <td>{formatDateTime(mov.fechaMovimiento)}</td>
                                            <td className="text-start">{mov.nombreProducto}</td>
                                            <td>
                                                <Badge bg={mov.tipoMovimiento === 'ENTRADA' ? 'success' : mov.tipoMovimiento === 'SALIDA' ? 'danger' : 'info'}>
                                                    {mov.tipoMovimiento}
                                                </Badge>
                                            </td>
                                            <td>{mov.cantidad}</td>
                                            <td>S/. {mov.precioUnitario?.toFixed(2)}</td>
                                            <td>S/. {mov.valorTotal?.toFixed(2)}</td>
                                            <td>{mov.stockAnterior}</td>
                                            <td>{mov.stockActual}</td>
                                            <td>S/. {mov.costoPromedioAnterior?.toFixed(2)}</td>
                                            <td>S/. {mov.costoPromedioActual?.toFixed(2)}</td>
                                            <td>{mov.referenciaDocumento}</td>
                                            <td>{mov.usuarioRegistro}</td>
                                            <td className="text-start">{mov.observaciones}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </Table>
                    </div>
                    <Paginador page={page} totalPages={totalPages} onChange={setPage} disabled={loading} />
                </Card.Body>
            </Card>

            {/* Modal de Ajuste Manual */}
            <Modal show={showAjusteModal} onHide={() => setShowAjusteModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Realizar Ajuste Manual de Kardex</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Producto</Form.Label>
                            <Select
                                options={productos}
                                value={productos.find(p => p.value === ajusteData.idProducto)}
                                onChange={handleProductoSelectChange}
                                placeholder="Seleccione un producto"
                                isClearable
                                isSearchable
                            />
                            {ajusteErrors.idProducto && <Form.Text className="text-danger">{ajusteErrors.idProducto}</Form.Text>}
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Tipo de Movimiento</Form.Label>
                            <Form.Select
                                name="tipoMovimiento"
                                value={ajusteData.tipoMovimiento}
                                onChange={handleAjusteChange}
                            >
                                <option value="ENTRADA">ENTRADA (Aumento de Stock)</option>
                                <option value="SALIDA">SALIDA (Disminución de Stock)</option>
                            </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Cantidad</Form.Label>
                            <Form.Control
                                type="number"
                                name="cantidad"
                                value={ajusteData.cantidad}
                                onChange={handleAjusteChange}
                                min="1"
                            />
                            {ajusteErrors.cantidad && <Form.Text className="text-danger">{ajusteErrors.cantidad}</Form.Text>}
                        </Form.Group>
                        {ajusteData.tipoMovimiento === 'ENTRADA' && (
                            <Form.Group className="mb-3">
                                <Form.Label>Precio Unitario (para entradas)</Form.Label>
                                <Form.Control
                                    type="number"
                                    name="precioUnitario"
                                    value={ajusteData.precioUnitario}
                                    onChange={handleAjusteChange}
                                    step="0.01"
                                    min="0.01"
                                />
                                {ajusteErrors.precioUnitario && <Form.Text className="text-danger">{ajusteErrors.precioUnitario}</Form.Text>}
                            </Form.Group>
                        )}
                        <Form.Group className="mb-3">
                            <Form.Label>Observaciones</Form.Label>
                            <Form.Control
                                as="textarea"
                                name="observaciones"
                                value={ajusteData.observaciones}
                                onChange={handleAjusteChange}
                                rows={3}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowAjusteModal(false)}>
                        Cancelar
                    </Button>
                    <Button variant="primary" onClick={handleGuardarAjuste} disabled={loading}>
                        {loading ? <Spinner animation="border" size="sm" /> : 'Guardar Ajuste'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default Kardex;

