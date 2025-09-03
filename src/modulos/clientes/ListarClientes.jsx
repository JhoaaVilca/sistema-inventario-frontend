import { useEffect, useState, useRef } from "react";
import { Table, Button, InputGroup, FormControl, Alert, Toast, ToastContainer, Badge } from "react-bootstrap";
import { Edit, Trash2, Search, X, User, Plus } from "lucide-react";
import AgregarCliente from "./AgregarCliente";
import EditarCliente from "./EditarCliente";
import axios from "axios";

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

    const inputRef = useRef(null);

    useEffect(() => {
        cargarClientes();
    }, []);

    const cargarClientes = async () => {
        setLoading(true);
        try {
            console.log("Cargando clientes...");
            const response = await axios.get("http://localhost:8080/api/clientes");
            console.log("Clientes recibidos:", response.data);
            setClientes(response.data);
            setError("");
        } catch (err) {
            console.error("Error al cargar clientes:", err);
            setError("Error al cargar los clientes. Intente nuevamente.");
        } finally {
            setLoading(false);
        }
    };

    const handleEliminar = async (id) => {
        if (window.confirm("¿Seguro que deseas eliminar este cliente?")) {
            try {
                await axios.delete(`http://localhost:8080/api/clientes/${id}`);
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
        <div className="container mt-4">
            <div className="d-flex align-items-center gap-3 mb-4">
                <User size={32} className="text-primary" />
                <h3 className="mb-0">Gestión de Clientes</h3>
            </div>

            {/* Botón + buscador */}
            <div className="d-flex justify-content-between align-items-center mb-3">
                <Button variant="success" onClick={() => setShowAgregar(true)}>
                    <Plus size={18} className="me-2" />
                    Agregar Cliente
                </Button>

                {!mostrarInput ? (
                    <Button
                        variant="outline-primary"
                        onClick={() => setMostrarInput(true)}
                    >
                        <Search size={18} />
                    </Button>
                ) : (
                    <InputGroup style={{ maxWidth: "250px" }}>
                        <FormControl
                            ref={inputRef}
                            autoFocus
                            placeholder="Buscar clientes..."
                            value={filtro}
                            onChange={(e) => setFiltro(e.target.value)}
                        />
                        {filtro ? (
                            <Button variant="outline-secondary" onClick={limpiarBuscador}>
                                <X size={18} />
                            </Button>
                        ) : (
                            <Button variant="outline-secondary" onClick={limpiarBuscador}>
                                <X size={18} />
                            </Button>
                        )}
                    </InputGroup>
                )}
            </div>

            {/* Mensaje de error */}
            {error && (
                <Alert variant="danger" className="mb-3">
                    {error}
                </Alert>
            )}

            {/* Tabla de clientes */}
            <div className="table-responsive">
                <Table striped bordered hover>
                    <thead className="table-dark">
                        <tr>
                            <th>DNI</th>
                            <th>Nombres</th>
                            <th>Apellidos</th>
                            <th>Dirección</th>
                            <th>Teléfono</th>
                            <th>Email</th>
                            <th>Fecha Registro</th>
                            <th>Estado</th>
                            <th>Acciones</th>
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
                                        <div className="d-flex gap-1">
                                            <Button
                                                variant="outline-primary"
                                                size="sm"
                                                onClick={() => {
                                                    setClienteEditar(cliente);
                                                    setShowEditar(true);
                                                }}
                                            >
                                                <Edit size={16} />
                                            </Button>
                                            <Button
                                                variant="outline-danger"
                                                size="sm"
                                                onClick={() => handleEliminar(cliente.idCliente)}
                                            >
                                                <Trash2 size={16} />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </Table>
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
