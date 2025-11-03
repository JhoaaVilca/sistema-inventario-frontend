import { useEffect, useState, useRef, useCallback } from "react";
import { Table, Button, InputGroup, FormControl, Alert, Toast, ToastContainer, Badge } from "react-bootstrap";
import { Edit, Trash2, Search, X, User, Plus } from "lucide-react";
import AgregarCliente from "./AgregarCliente";
import EditarCliente from "./EditarCliente";
import apiClient from "../../servicios/apiClient";
import Paginador from "../common/Paginador";

const ListarClientes = () => {
    const [clientes, setClientes] = useState([]);
    const [clienteEditar, setClienteEditar] = useState(null);
    const [showAgregar, setShowAgregar] = useState(false);
    const [showEditar, setShowEditar] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [filtro, setFiltro] = useState("");
    const [mostrarInput, setMostrarInput] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const [toastVariant, setToastVariant] = useState("success");
    const [page, setPage] = useState(0);
    const [size] = useState(10); // Tamaño normal
    const [totalPages, setTotalPages] = useState(0);

    const inputRef = useRef(null);

    const cargarClientes = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await apiClient.get("/clientes", { params: { page, size } });
            setClientes(data?.content || []);
            setTotalPages(data?.totalPages || 0);
            setError("");
        } catch (err) {
            console.error("Error al cargar clientes:", err);
            setError("Error al cargar los clientes. Intente nuevamente.");
        } finally {
            setLoading(false);
        }
    }, [page, size]);

    useEffect(() => {
        cargarClientes();
    }, [cargarClientes]);

    const handleEliminar = async (id) => {
        if (window.confirm("¿Seguro que deseas eliminar este cliente?")) {
            try {
                await apiClient.delete(`/clientes/${id}`);
                mostrarNotificacion("Cliente eliminado exitosamente", "success");
                cargarClientes();
            } catch (err) {
                console.error("Error al eliminar cliente:", err);
                mostrarNotificacion("Error al eliminar el cliente", "danger");
            }
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

    const clientesFiltrados = clientes.filter((c) =>
        c.nombres.toLowerCase().includes(filtro.toLowerCase()) ||
        c.apellidos?.toLowerCase().includes(filtro.toLowerCase()) ||
        c.dni.includes(filtro)
    );

    const formatearFecha = (fecha) => {
        if (!fecha) return "-";
        return new Date(fecha).toLocaleDateString('es-ES');
    };

    return (
        <div className="container-fluid mt-4">
            <div className="d-flex align-items-center gap-3 mb-4 p-3 bg-white rounded-3 shadow-sm border">
                <div className="p-2 bg-primary bg-opacity-10 rounded-3">
                    <User size={24} className="text-primary" />
                </div>
                <div>
                    <h3 className="mb-0 text-dark fw-bold">Gestión de Clientes</h3>
                    <small className="text-muted">Administra tu base de clientes</small>
                </div>
            </div>

            {/* Botón Agregar */}
            <div className="d-flex justify-content-end align-items-center gap-2 mb-3">
                <Button variant="success" onClick={() => setShowAgregar(true)} className="mb-3">
                    <Plus size={16} /> Agregar Cliente
                </Button>
            </div>

            {/* Mensaje de error */}
            {error && (
                <Alert variant="danger" className="mb-3">
                    {error}
                </Alert>
            )}

            {/* Listado unificado */}
            <div className="list-card">
                <div className="list-card-header py-3 px-3">
                    <div className="d-flex justify-content-between align-items-center">
                        <h5 className="mb-0 text-dark fw-semibold">
                            Lista de Clientes
                            {clientesFiltrados.length > 0 && (
                                <span className="badge bg-primary ms-2">{clientesFiltrados.length}</span>
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
                                        placeholder="Buscar clientes..."
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
                <div className="list-card-body p-0">
                    <div className="table-responsive">
                        <Table hover className="mb-0">
                            <thead className="table-light text-center">
                                <tr>
                                    <th className="fw-semibold py-3">DNI</th>
                                    <th className="fw-semibold py-3">Nombres</th>
                                    <th className="fw-semibold py-3">Apellidos</th>
                                    <th className="fw-semibold py-3">Dirección</th>
                                    <th className="fw-semibold py-3">Teléfono</th>
                                    <th className="fw-semibold py-3">Email</th>
                                    <th className="fw-semibold py-3">Fecha Registro</th>
                                    <th className="fw-semibold py-3">Estado</th>
                                    <th className="fw-semibold py-3 col-actions">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="9" className="text-center py-4">
                                            <div className="spinner-border text-primary" role="status">
                                                <span className="visually-hidden">Cargando...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : clientesFiltrados.length === 0 ? (
                                    <tr>
                                        <td colSpan="9" className="text-center py-4 text-muted">
                                            {filtro ? "No se encontraron clientes con ese filtro" : "No hay clientes registrados"}
                                        </td>
                                    </tr>
                                ) : (
                                    clientesFiltrados.map((cliente) => (
                                        <tr key={cliente.idCliente}>
                                            <td>
                                                <code className="bg-light px-2 py-1 rounded">
                                                    {cliente.dni}
                                                </code>
                                            </td>
                                            <td>{cliente.nombres}</td>
                                            <td>{cliente.apellidos || "-"}</td>
                                            <td>{cliente.direccion || "-"}</td>
                                            <td>{cliente.telefono || "-"}</td>
                                            <td>{cliente.email || "-"}</td>
                                            <td>{formatearFecha(cliente.fechaRegistro)}</td>
                                            <td>
                                                <Badge bg={cliente.activo ? "success" : "danger"}>
                                                    {cliente.activo ? "Activo" : "Inactivo"}
                                                </Badge>
                                            </td>
                                            <td>
                                                <div className="d-flex gap-1 flex-wrap justify-content-center">
                                                    <Button
                                                        variant="outline-primary"
                                                        size="sm"
                                                        onClick={() => {
                                                            setClienteEditar(cliente);
                                                            setShowEditar(true);
                                                        }}
                                                        className="btn-sm shadow-sm"
                                                        style={{ minWidth: '32px' }}
                                                        title="Editar cliente"
                                                    >
                                                        <Edit size={12} />
                                                        <span className="d-none d-xl-inline ms-1">Editar</span>
                                                    </Button>
                                                    <Button
                                                        variant="outline-danger"
                                                        size="sm"
                                                        onClick={() => handleEliminar(cliente.idCliente)}
                                                        className="btn-sm shadow-sm"
                                                        style={{ minWidth: '32px' }}
                                                        title="Eliminar cliente"
                                                    >
                                                        <Trash2 size={12} />
                                                        <span className="d-none d-xl-inline ms-1">Eliminar</span>
                                                    </Button>
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

            {/* Modal Agregar Cliente */}
            {showAgregar && (
                <AgregarCliente
                    show={showAgregar}
                    onHide={() => setShowAgregar(false)}
                    onClienteAgregado={() => {
                        setShowAgregar(false);
                        cargarClientes();
                        mostrarNotificacion("Cliente agregado exitosamente", "success");
                        scrollToTop();
                    }}
                />
            )}

            {/* Modal Editar Cliente */}
            {showEditar && clienteEditar && (
                <EditarCliente
                    show={showEditar}
                    onHide={() => setShowEditar(false)}
                    cliente={clienteEditar}
                    onClienteEditado={() => {
                        setShowEditar(false);
                        setClienteEditar(null);
                        cargarClientes();
                        mostrarNotificacion("Cliente actualizado exitosamente", "success");
                        scrollToTop();
                    }}
                />
            )}

            {/* Toast de notificaciones */}
            <ToastContainer position="top-end" className="p-3">
                <Toast
                    show={showToast}
                    onClose={() => setShowToast(false)}
                    delay={3000}
                    autohide
                    bg={toastVariant}
                >
                    <Toast.Header>
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
};

export default ListarClientes;
