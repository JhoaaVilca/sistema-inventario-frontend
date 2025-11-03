import { useEffect, useState, useRef, useCallback } from "react";
import AgregarProveedor from "./AgregarProveedor";
import EditarProveedor from "./EditarProveedor";
import { Edit, Power, PowerOff, Search, X, Building2, Plus } from "lucide-react";
import {
    Table,
    Button,
    InputGroup,
    FormControl,
    Alert,
    Toast,
    ToastContainer
} from "react-bootstrap";
import apiClient from "../../servicios/apiClient";
import Paginador from "../common/Paginador";

function ListarProveedores() {
    const [proveedores, setProveedores] = useState([]);
    const [proveedorEditar, setProveedorEditar] = useState(null);
    const [showAgregar, setShowAgregar] = useState(false);
    const [showEditar, setShowEditar] = useState(false);
    const [mostrarInput, setMostrarInput] = useState(false);
    const [filtro, setFiltro] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const [toastVariant, setToastVariant] = useState("success");
    const [page, setPage] = useState(0);
    const [size] = useState(10); // Tamaño normal
    const [totalPages, setTotalPages] = useState(0);

    const inputRef = useRef(null);

    const obtenerProveedores = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await apiClient.get("/proveedores", { params: { page, size } });
            setProveedores(data?.content || []);
            setTotalPages(data?.totalPages || 0);
            setError("");
        } catch (error) {
            console.error("Error al obtener proveedores:", error);
            setError("Error al cargar los proveedores. Intente nuevamente.");
        } finally {
            setLoading(false);
        }
    }, [page, size]);

    useEffect(() => {
        obtenerProveedores();
    }, [obtenerProveedores]);

    // 🔴 Desactivar proveedor
    const desactivarProveedor = async (id) => {
        if (window.confirm("¿Seguro que deseas desactivar este proveedor?")) {
            try {
                await apiClient.put(`/proveedores/${id}/desactivar`);
                mostrarNotificacion("Proveedor desactivado exitosamente", "success");
                obtenerProveedores();
            } catch (error) {
                console.error("Error al desactivar proveedor:", error);
                mostrarNotificacion("Error al desactivar el proveedor", "danger");
            }
        }
    };

    // 🟢 Activar proveedor
    const activarProveedor = async (id) => {
        try {
            await apiClient.put(`/proveedores/${id}/activar`);
            mostrarNotificacion("Proveedor activado exitosamente", "success");
            obtenerProveedores();
        } catch (error) {
            console.error("Error al activar proveedor:", error);
            mostrarNotificacion("Error al activar el proveedor", "danger");
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

    const proveedoresFiltrados = proveedores.filter((proveedor) =>
        proveedor.nombre.toLowerCase().includes(filtro.toLowerCase())
    );

    return (
        <div className="container-fluid mt-4">
            {/* HEADER CON ICONO */}
            <div className="d-flex align-items-center gap-3 mb-4 p-3 bg-white rounded-3 shadow-sm border">
                <div className="p-2 bg-success bg-opacity-10 rounded-3">
                    <Building2 size={24} className="text-success" />
                </div>
                <div>
                    <h3 className="mb-0 text-dark fw-bold">Gestión de Proveedores</h3>
                    <small className="text-muted">Administra tus proveedores y contactos</small>
                </div>
            </div>

            {/* Botón Agregar + Buscador */}
            <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-2 mb-4">
                <Button
                    variant="success"
                    onClick={() => setShowAgregar(true)}
                    size="sm"
                    className="w-100 w-sm-auto shadow-sm"
                    style={{ minWidth: '140px' }}
                >
                    <Plus size={14} className="me-1" />
                    Agregar Proveedor
                </Button>

                <div className="w-100 w-sm-auto" style={{ maxWidth: '300px' }}>
                    {!mostrarInput ? (
                        <Button
                            variant="outline-primary"
                            onClick={() => setMostrarInput(true)}
                            size="sm"
                            className="w-100 w-sm-auto shadow-sm"
                            style={{ minWidth: '100px' }}
                        >
                            <Search size={14} className="me-1" />
                            Buscar
                        </Button>
                    ) : (
                        <InputGroup size="sm" className="shadow-sm">
                            <FormControl
                                ref={inputRef}
                                autoFocus
                                placeholder="Buscar proveedores..."
                                value={filtro}
                                onChange={(e) => setFiltro(e.target.value)}
                                className="border-end-0"
                            />
                            {filtro ? (
                                <Button
                                    variant="outline-secondary"
                                    onClick={limpiarBuscador}
                                    className="border-start-0"
                                >
                                    <X size={14} />
                                </Button>
                            ) : (
                                <Button
                                    variant="outline-danger"
                                    onClick={() => {
                                        setMostrarInput(false);
                                        setFiltro("");
                                    }}
                                    className="border-start-0"
                                >
                                    <X size={14} />
                                </Button>
                            )}
                        </InputGroup>
                    )}
                </div>
            </div>

            {/* Mensaje de error */}
            {error && (
                <Alert variant="danger" dismissible onClose={() => setError("")}>
                    {error}
                </Alert>
            )}

            {/* Listado unificado */}
            <div className="list-card">
                <div className="list-card-header py-3 px-3">
                    <div className="d-flex justify-content-between align-items-center">
                        <h5 className="mb-0 text-dark fw-semibold">
                            Lista de Proveedores
                            {proveedoresFiltrados.length > 0 && (
                                <span className="badge bg-primary ms-2">{proveedoresFiltrados.length}</span>
                            )}
                        </h5>
                        <div className="d-flex align-items-center gap-2">
                            {/* El buscador se maneja desde la sección superior */}
                        </div>
                    </div>
                </div>
                <div className="list-card-body p-0">
                    <div className="table-responsive">
                        <Table hover className="mb-0">
                            <thead className="table-light text-center">
                                <tr>
                                    <th className="fw-semibold py-3">Nombre</th>
                                    <th className="fw-semibold py-3">Documento</th>
                                    <th className="fw-semibold py-3">Teléfono</th>
                                    <th className="fw-semibold py-3">Email</th>
                                    <th className="fw-semibold py-3">Estado</th>
                                    <th className="fw-semibold py-3 col-actions">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="text-center align-middle">
                                {loading ? (
                                    <tr>
                                        <td colSpan="6" className="text-center py-4">
                                            <div className="spinner-border text-success" role="status">
                                                <span className="visually-hidden">Cargando...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : proveedoresFiltrados.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="text-center py-4 text-muted">
                                            {filtro ? "No se encontraron proveedores" : "No hay proveedores registrados"}
                                        </td>
                                    </tr>
                                ) : (
                                    proveedoresFiltrados.map((proveedor) => (
                                        <tr key={proveedor.idProveedor}>
                                            <td className="fw-medium">
                                                {proveedor.nombre}
                                            </td>
                                            <td>
                                                <span className="badge bg-light text-dark border">
                                                    {`${proveedor.tipoDocumento || ''} ${proveedor.numeroDocumento || ''}`.trim()}
                                                </span>
                                            </td>
                                            <td>{proveedor.telefono || '-'}</td>
                                            <td>{proveedor.email || '-'}</td>
                                            <td>
                                                {proveedor.activo ? (
                                                    <span className="badge bg-success">Activo</span>
                                                ) : (
                                                    <span className="badge bg-secondary">Inactivo</span>
                                                )}
                                            </td>
                                            <td>
                                                <div className="d-flex justify-content-center gap-1 flex-wrap">
                                                    <Button
                                                        variant="outline-warning"
                                                        size="sm"
                                                        onClick={() => {
                                                            setProveedorEditar(proveedor);
                                                            setShowEditar(true);
                                                        }}
                                                        title="Editar proveedor"
                                                        className="btn-sm shadow-sm"
                                                        style={{ minWidth: '32px' }}
                                                    >
                                                        <Edit size={12} />
                                                        <span className="d-none d-xl-inline ms-1">Editar</span>
                                                    </Button>
                                                    {proveedor.activo ? (
                                                        <Button
                                                            variant="outline-danger"
                                                            size="sm"
                                                            onClick={() => desactivarProveedor(proveedor.idProveedor)}
                                                            title="Desactivar proveedor"
                                                            className="btn-sm shadow-sm"
                                                            style={{ minWidth: '32px' }}
                                                        >
                                                            <PowerOff size={12} />
                                                            <span className="d-none d-xl-inline ms-1">Desactivar</span>
                                                        </Button>
                                                    ) : (
                                                        <Button
                                                            variant="outline-success"
                                                            size="sm"
                                                            onClick={() => activarProveedor(proveedor.idProveedor)}
                                                            title="Activar proveedor"
                                                            className="btn-sm shadow-sm"
                                                            style={{ minWidth: '32px' }}
                                                        >
                                                            <Power size={12} />
                                                            <span className="d-none d-xl-inline ms-1">Activar</span>
                                                        </Button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </Table>
                    </div>
                    <Paginador page={page} totalPages={totalPages} onChange={setPage} disabled={loading} />
                </div>
            </div>

            {/* Modales */}
            <AgregarProveedor
                show={showAgregar}
                handleClose={() => setShowAgregar(false)}
                onProveedorAdded={() => {
                    obtenerProveedores();
                    mostrarNotificacion("Proveedor agregado exitosamente", "success");
                    scrollToTop();
                }}
            />
            <EditarProveedor
                show={showEditar}
                handleClose={() => setShowEditar(false)}
                proveedor={proveedorEditar}
                onProveedorUpdated={() => {
                    obtenerProveedores();
                    mostrarNotificacion("Proveedor actualizado exitosamente", "success");
                    scrollToTop();
                }}
            />

            {/* Toast de notificaciones */}
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
}

export default ListarProveedores;
